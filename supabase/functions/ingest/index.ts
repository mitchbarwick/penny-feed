// POST /functions/v1/ingest
// Auth: Authorization: Bearer <INGEST_TOKEN>
// Body: an IngestPayload (see src/lib/ingest-schema.ts, docs/INGESTION.md)
//
// Idempotent: re-sending the same `runId` returns the stored result and writes nothing.
// A failed run releases its runId, so retrying after a crash is always safe, and
// items are upserted in a single statement so a partial item can't appear in the feed.
import { createClient } from "@supabase/supabase-js";
import { ingest } from "../_shared/ingest-core.ts";
import { itemToRow, rowToItem, rowToSeries, seriesToRow, type ItemRow, type SeriesRow } from "../_shared/rows.ts";
import { json, requireEditor } from "../_lib/http.ts";

const MAX_BYTES = 2_000_000;

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const denied = requireEditor(req);
  if (denied) return denied;

  const text = await req.text();
  if (text.length > MAX_BYTES) return json({ error: "payload_too_large", maxBytes: MAX_BYTES }, 413);
  let raw: { task?: string; runId?: string; items?: unknown[] };
  try {
    raw = JSON.parse(text);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const task = String(raw.task ?? "unknown").slice(0, 80);
  const runId = String(raw.runId ?? "");
  if (runId.length < 6) return json({ error: "invalid_payload", errors: ["runId: required (min 6 chars)"] }, 400);

  // Same run already processed? Hand back what we said last time.
  const prior = await sb.from("ingestion_jobs").select("status,result").eq("run_id", runId).maybeSingle();
  if (prior.data && prior.data.status !== "running") {
    return json({ ...(prior.data.result as object), idempotentReplay: true });
  }
  if (!prior.data) {
    const created = await sb.from("ingestion_jobs").insert({ task, run_id: runId, status: "running" });
    if (created.error) return json({ error: "job_log_failed", detail: created.error.message }, 500);
  }

  const finish = (patch: Record<string, unknown>) =>
    sb.from("ingestion_jobs").update({ finished_at: new Date().toISOString(), ...patch }).eq("run_id", runId);

  try {
    const [items, series, state] = await Promise.all([
      sb.from("items").select("*"),
      sb.from("series").select("*"),
      sb.from("state").select("key,value"),
    ]);
    if (items.error || series.error) throw new Error(items.error?.message ?? series.error?.message);

    const docs: Record<string, unknown> = {};
    for (const r of state.data ?? []) docs[r.key] = r.value;
    // The reader stores its exclusions in the `prefs` document.
    const excludedTopics = ((docs.prefs as { prefs?: { excludedTopics?: string[] } } | undefined)?.prefs?.excludedTopics) ?? [];

    const out = ingest(
      raw,
      {
        items: (items.data as ItemRow[]).map(rowToItem),
        series: (series.data as SeriesRow[]).map(rowToSeries),
      },
      { excludedTopics },
    );

    if (!out.ok) {
      const body = { ok: false, error: "invalid_payload", errors: out.errors };
      await finish({ status: "failed", errors: out.errors, result: body });
      return json(body, 422);
    }

    const { result, upsertItems, upsertSeries } = out.outcome;
    const stamp = new Date().toISOString();

    if (upsertSeries.length) {
      const { error } = await sb.from("series").upsert(upsertSeries.map((s) => ({ ...seriesToRow(s), updated_at: stamp })));
      if (error) throw new Error("series upsert: " + error.message);
    }
    if (upsertItems.length) {
      const { error } = await sb.from("items").upsert(upsertItems.map((i) => ({ ...itemToRow(i), updated_at: stamp })));
      if (error) throw new Error("items upsert: " + error.message);
      // History: keep every published version, so corrections never erase the original.
      await sb.from("item_versions").upsert(upsertItems.map((i) => ({ item_id: i.id, version: i.version, snapshot: i })));
    }

    const accepted = result.accepted.length + result.seriesAccepted.length;
    const rejected = result.rejected.length;
    const body = { ok: true, runId, ...result };
    await finish({
      status: rejected && !accepted ? "failed" : rejected ? "partial" : "ok",
      submitted: raw.items?.length ?? 0,
      accepted,
      rejected,
      errors: result.rejected.map((r) => `${r.id}: ${r.reasons.join("; ")}`),
      result: body,
    });
    return json(body, 200);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    // Release the runId so the same submission can be retried.
    await sb
      .from("ingestion_jobs")
      .update({ status: "failed", errors: [detail], finished_at: new Date().toISOString(), run_id: `${runId}#failed-${Date.now()}` })
      .eq("run_id", runId);
    return json({ ok: false, error: "ingest_failed", detail }, 500);
  }
});
