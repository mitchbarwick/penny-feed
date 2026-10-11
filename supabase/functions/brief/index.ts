// GET /functions/v1/brief
// Auth: Authorization: Bearer <INGEST_TOKEN>
// Returns the editor's brief: ledger, exclusions, preferences, requests and what's
// already published. Scheduled tasks read this BEFORE choosing what to write.
import { createClient } from "@supabase/supabase-js";
import { buildBrief } from "../_shared/brief.ts";
import { fromDocs } from "../_shared/docs.ts";
import { seedState } from "../_shared/seed.ts";
import { rowToItem, rowToSeries, type ItemRow, type SeriesRow } from "../_shared/rows.ts";
import { json, requireEditor } from "../_lib/http.ts";

Deno.serve(async (req) => {
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  const denied = requireEditor(req);
  if (denied) return denied;

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const [items, series, state] = await Promise.all([
    sb.from("items").select("*").neq("status", "archived").order("published_at", { ascending: false }).limit(400),
    sb.from("series").select("*"),
    sb.from("state").select("key,value"),
  ]);
  if (items.error || series.error || state.error) {
    return json({ error: "read_failed", detail: items.error?.message ?? series.error?.message ?? state.error?.message }, 500);
  }
  const docs: Record<string, unknown> = {};
  for (const r of state.data ?? []) docs[r.key] = r.value;
  const app = fromDocs(seedState(), docs);
  return json(buildBrief(app, (items.data as ItemRow[]).map(rowToItem), (series.data as SeriesRow[]).map(rowToSeries)));
});
