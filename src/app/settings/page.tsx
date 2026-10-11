"use client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { buildBrief } from "@/lib/brief";
import { seedState } from "@/lib/seed";
import { ago } from "@/lib/dates";
import type { AppState } from "@/lib/types";
import type { IngestResult } from "@/lib/ingest-schema";

interface JobRow { id: string; task: string; run_id: string; status: string; started_at: string; submitted: number; accepted: number; rejected: number; errors: unknown }

function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <section className="border-t border-line py-7">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-[0.9rem] text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ k, v, ok }: { k: string; v: string; ok?: boolean | null }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-[0.95rem]">
      <span className="text-ink-soft">{k}</span>
      <span className={`text-right ${ok === true ? "text-sage" : ok === false ? "text-terra" : ""}`}>{v}</span>
    </div>
  );
}

export default function SettingsPage() {
  const { state, update, items, series, contentSource, auth, signOut, syncStatus, toast, refreshContent, ingestLocal, hydrated } = useStore();
  const [payload, setPayload] = useState("");
  const [result, setResult] = useState<{ ok: boolean; text: string; r?: IngestResult } | null>(null);
  const [jobs, setJobs] = useState<JobRow[] | null>(null);
  const [swState, setSwState] = useState("checking…");
  const [storage, setStorage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sb = supabase();
    if (sb && auth.session) {
      sb.from("ingestion_jobs").select("*").order("started_at", { ascending: false }).limit(10).then(({ data }) => setJobs((data as JobRow[]) ?? []));
    }
  }, [auth.session]);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.getRegistration().then((r) => setSwState(r?.active ? "active (offline reading on)" : process.env.NODE_ENV === "production" ? "registering…" : "off in dev"));
    else setSwState("not supported");
    navigator.storage?.estimate?.().then((e) => setStorage(`${((e.usage ?? 0) / 1024 / 1024).toFixed(1)} MB used`)).catch(() => {});
  }, []);

  if (!hydrated) return <div className="min-h-[60vh]" aria-busy="true" />;

  const runIngest = (text: string) => {
    let raw: unknown;
    try { raw = JSON.parse(text); } catch (e) { setResult({ ok: false, text: `That isn't valid JSON: ${(e as Error).message}` }); return; }
    const r = ingestLocal(raw);
    if (!r.ok) setResult({ ok: false, text: "Rejected before anything was written:\n" + r.errors.map((x) => "• " + x).join("\n") });
    else setResult({ ok: true, text: "", r: r.result });
  };

  const download = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const published = items.filter((i) => i.status !== "archived").length;

  return (
    <main className="mx-auto max-w-[680px] px-5 pb-10 pt-8 md:px-6">
      <h1 className="font-display text-[2rem] font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-ink-soft">The technical bits, kept out of the way.</p>

      <Section title="Appearance">
        <div className="inline-flex rounded-full border border-line p-0.5" role="radiogroup" aria-label="Theme">
          {(["system", "light", "dark"] as const).map((t) => (
            <button key={t} role="radio" aria-checked={state.theme === t} onClick={() => update((s) => ({ ...s, theme: t }))}
              className={`min-h-[38px] rounded-full px-4 text-sm font-semibold capitalize ${state.theme === t ? "bg-ink text-bg" : "text-muted"}`}>{t === "system" ? "Match device" : t}</button>
          ))}
        </div>
      </Section>

      <Section title="Content" hint="What's in the reader right now.">
        <Row k="Source" v={contentSource === "sample" ? "Sample stories (development)" : "Live, from your editor"} ok={contentSource === "live" ? true : null} />
        <Row k="Stories" v={`${published} · ${series.length} series`} />
        <div className="mt-3 flex flex-wrap gap-2">
          {supabaseConfigured && <button className="btn btn-sm" onClick={() => { void refreshContent(); toast("Checking for new stories…"); }}>Refresh now</button>}
          {!state.hideSamples && (
            <button className="btn btn-sm" onClick={() => { update((s) => ({ ...s, hideSamples: true, feedSnapshot: [] })); toast("Sample stories hidden."); }}>Hide sample stories</button>
          )}
          {state.hideSamples && <button className="btn btn-sm" onClick={() => update((s) => ({ ...s, hideSamples: false, feedSnapshot: [] }))}>Show sample stories</button>}
        </div>
      </Section>

      <Section title="Connections" hint="Nothing is connected until you set it up, and each connection can be revoked. Penny Feed never sends, deletes, archives or marks anything as read.">
        <Row k="Cloud database (Supabase)" v={supabaseConfigured ? (auth.session ? `Connected · ${syncStatus}` : "Configured · signed out") : "Not configured · local mode"} ok={supabaseConfigured && auth.session ? syncStatus !== "error" : null} />
        <Row k="Gmail (read-only)" v="Not connected" ok={null} />
        <Row k="Social sources" v="Not connected" ok={null} />
        <p className="mt-2 text-[0.85rem] text-muted">Gmail and social discovery run inside the scheduled editorial tasks, with their own read-only access. See <code>docs/INTEGRATIONS.md</code>.</p>
        {auth.session && <button className="btn btn-sm mt-3" onClick={() => void signOut()}>Sign out</button>}
      </Section>

      <Section title="Ingestion" hint={supabaseConfigured ? "Stories arrive through the secure ingestion endpoint. You can also paste a payload here to test it." : "Local mode: paste a payload to see the same validation, deduplication and editorial checks the production endpoint applies."}>
        <textarea className="font-mono !text-[0.8rem]" placeholder='{"schemaVersion":1,"task":"daily-discovery","runId":"…","items":[…]}' value={payload} onChange={(e) => setPayload(e.target.value)} aria-label="Ingestion payload" />
        <div className="mt-2 flex flex-wrap gap-2">
          <button className="btn btn-sm btn-primary" disabled={!payload.trim() || supabaseConfigured} onClick={() => runIngest(payload)}>{supabaseConfigured ? "Local test disabled while connected" : "Validate and publish"}</button>
          <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>Load a .json file</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPayload(await f.text()); e.target.value = ""; }} />
        </div>
        {result && (
          <div className="paper anim-rise mt-3 p-4 text-[0.9rem]" role="status">
            {!result.ok && <pre className="whitespace-pre-wrap text-terra">{result.text}</pre>}
            {result.ok && result.r && (
              <div className="space-y-1.5">
                <p><strong>{result.r.accepted.filter((a) => a.action !== "unchanged").length}</strong> published, <strong>{result.r.accepted.filter((a) => a.action === "unchanged").length}</strong> unchanged, <strong className={result.r.rejected.length ? "text-terra" : ""}>{result.r.rejected.length}</strong> rejected.</p>
                {result.r.seriesAccepted.length > 0 && <p>Series: {result.r.seriesAccepted.map((s) => `${s.id} (${s.action})`).join(", ")}</p>}
                {result.r.rejected.map((r) => <p key={r.id} className="text-terra">✗ {r.id}: {r.reasons.join("; ")}</p>)}
                {result.r.warnings.map((w, i) => <p key={i} className="text-amber">⚠ {w}</p>)}
              </div>
            )}
          </div>
        )}
        <div className="mt-4">
          <button className="btn btn-sm" onClick={async () => {
            const brief = buildBrief(state, items, series);
            try { await navigator.clipboard.writeText(JSON.stringify(brief, null, 2)); toast("Editor brief copied."); } catch { download("editor-brief.json", brief); }
          }}>Copy the editor's brief</button>
          <p className="mt-1 text-[0.8rem] text-muted">Your ledger, preferences and recent requests, in the form scheduled tasks read.</p>
        </div>
      </Section>

      <Section title="Scheduled-task health" hint="Last runs reported by the editor. A quiet day with nothing published is healthy.">
        {supabaseConfigured && auth.session ? (
          jobs === null ? <p className="text-muted">Loading…</p> : jobs.length === 0 ? <p className="text-ink-soft">No runs recorded yet. I won't pretend otherwise: the editor hasn't published anything.</p> : (
            <ul className="divide-y divide-line">
              {jobs.map((j) => (
                <li key={j.id} className="py-2.5 text-[0.9rem]">
                  <span className={`font-semibold ${j.status === "ok" ? "" : "text-terra"}`}>{j.task}</span> · {j.status} · {ago(j.started_at)}
                  <span className="block text-muted">{j.accepted} accepted, {j.rejected} rejected of {j.submitted}</span>
                </li>
              ))}
            </ul>
          )
        ) : (state.ingestLog ?? []).length === 0 ? <p className="text-ink-soft">No runs recorded yet. The scheduled tasks aren't connected, and I won't claim otherwise.</p> : (
          <ul className="divide-y divide-line">
            {(state.ingestLog ?? []).slice(0, 8).map((j, i) => (
              <li key={i} className="py-2.5 text-[0.9rem]"><span className="font-semibold">{j.task}</span> · {ago(j.at)}<span className="block text-muted">{j.accepted} accepted, {j.rejected} rejected{j.errors.length ? ` · ${j.errors[0]}` : ""}</span></li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Your data" hint="It's yours. Export everything, restore it elsewhere, or wipe this device.">
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-sm" onClick={() => download(`penny-feed-backup-${new Date().toISOString().slice(0, 10)}.json`, { app: "penny-feed", version: 1, exportedAt: new Date().toISOString(), state })}>Export everything</button>
          <button className="btn btn-sm" onClick={() => restoreRef.current?.click()}>Restore from a backup</button>
          <input ref={restoreRef} type="file" accept="application/json,.json" hidden onChange={async (e) => {
            const f = e.target.files?.[0]; e.target.value = "";
            if (!f) return;
            try {
              const j = JSON.parse(await f.text());
              if (j.app !== "penny-feed" || !j.state) throw new Error("not a Penny Feed backup");
              update(() => ({ ...seedState(), ...(j.state as AppState) }));
              toast("Restored. Everything's back as it was.");
            } catch (err) { toast(`Couldn't restore: ${(err as Error).message}`); }
          }} />
          <button className="btn btn-sm" onClick={() => download("reading-history.json", { progress: state.progress, saved: state.saved })}>Export reading history</button>
        </div>
        <div className="mt-4">
          <button className="btn btn-sm text-terra" onClick={() => {
            if (window.confirm("Reset this device to a fresh start? Your ledger, saved stories and reading progress here will be erased. (Cloud data, if connected, is untouched until it next syncs, so export first.)")) {
              try { localStorage.clear(); } catch { /* ignore */ }
              location.reload();
            }
          }}>Erase data on this device</button>
        </div>
      </Section>

      <Section title="Privacy">
        <ul className="list-disc space-y-1.5 pl-5 text-[0.95rem] text-ink-soft">
          <li>No advertising, analytics or third-party trackers. The only network calls go to your own database.</li>
          <li>Emails, web pages and social posts are treated as untrusted text. Instructions inside them are never followed.</li>
          <li>Email bodies aren't stored: only a short source note and the link, for the stories built from them.</li>
          <li>Every connection above can be revoked, and imported data removed, from here and from the provider.</li>
        </ul>
      </Section>

      <Section title="Diagnostics">
        <Row k="Version" v="0.1.0" />
        <Row k="Offline support" v={swState} />
        <Row k="Local storage" v={storage || "—"} />
        <Row k="Ledger" v={`${state.interests.length} interests · ${state.history.length} changes · ${state.people.length} people`} />
        <Row k="Reading" v={`${Object.values(state.progress).filter((p) => p.status === "read").length} read · ${state.saved.length} saved`} />
      </Section>
    </main>
  );
}
