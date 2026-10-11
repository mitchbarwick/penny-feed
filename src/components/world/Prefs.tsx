"use client";
import { useStore } from "@/lib/store";
import { setPref } from "@/lib/ledger";
import type { Preferences } from "@/lib/types";

function Slider({ label, left, right, value, onCommit }: { label: string; left: string; right: string; value: number; onCommit: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-baseline justify-between"><span className="font-semibold">{label}</span></div>
      <input type="range" min={0} max={1} step={0.05} value={value} aria-label={label}
        onChange={(e) => onCommit(Number(e.target.value))} className="mt-2" />
      <div className="flex justify-between text-xs text-muted"><span>{left}</span><span>{right}</span></div>
    </div>
  );
}

export function Prefs() {
  const { state, update } = useStore();
  const p = state.prefs;
  // Slider drags are throttled into one history entry per gesture by merging adjacent identical-property entries.
  const set = <K extends keyof Preferences>(key: K, value: Preferences[K], label: string) =>
    update((s) => {
      const top = s.history[0];
      const next = setPref(s, key, value, "manual", "You adjusted this.", label);
      if (top && top.property === `prefs.${String(key)}` && top.origin === "manual" && Date.now() - Date.parse(top.at) < 4000 && !top.reversedBy && next.history[0] !== top) {
        // collapse: keep the original "previous", replace the newest entry
        const merged = { ...next.history[0], previous: top.previous, undo: top.undo };
        return { ...next, history: [merged, ...next.history.slice(2)] };
      }
      return next;
    });

  return (
    <section className="space-y-8">
      <p className="text-ink-soft">The broad shape of the feed. Every change here is logged in History, and you can reverse it.</p>

      <Slider label="Current developments ↔ timeless stories" left="More of what's happening now" right="More that keeps" value={p.evergreenBalance} onCommit={(v) => set("evergreenBalance", v, "Current vs evergreen")} />
      <Slider label="How much to explore" left="Stay in my lanes" right="Surprise me" value={p.discovery} onCommit={(v) => set("discovery", v, "Discovery")} />
      <Slider label="Runs of the same subject" left="Mix it up" right="Happy to go deep" value={p.focus} onCommit={(v) => set("focus", v, "Topic diversity")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="label">Typical length</span>
          <select className="mt-1" value={p.length} onChange={(e) => set("length", e.target.value as Preferences["length"], "Reading length")}>
            <option value="short">Shorter pieces</option><option value="mixed">A mix</option><option value="long">Longer pieces</option>
          </select></label>
        <label className="block"><span className="label">Depth</span>
          <select className="mt-1" value={p.technicality} onChange={(e) => set("technicality", e.target.value as Preferences["technicality"], "Technical depth")}>
            <option value="gentle">Gentle</option><option value="balanced">Balanced</option><option value="deep">Properly technical</option>
          </select></label>
        <label className="block"><span className="label">News from my circle</span>
          <select className="mt-1" value={p.circleFrequency} onChange={(e) => set("circleFrequency", e.target.value as Preferences["circleFrequency"], "Circle frequency")}>
            <option value="rare">Rarely</option><option value="occasional">Occasionally</option><option value="often">Often</option>
          </select></label>
        <label className="block"><span className="label">Series on the go at once</span>
          <select className="mt-1" value={p.activeSeries} onChange={(e) => set("activeSeries", Number(e.target.value) as Preferences["activeSeries"], "Active series")}>
            <option value={1}>One</option><option value={2}>Two</option><option value={3}>Three</option>
          </select></label>
      </div>

      <div>
        <h3 className="label">Appetite by format</h3>
        <div className="mt-3 space-y-4">
          {(Object.keys(p.formatMix) as (keyof Preferences["formatMix"])[]).map((f) => (
            <Slider key={f} label={{ update: "Updates", explainer: "Explainers", rabbit_hole: "Rabbit Holes", deep_dive: "Deep Dives", circle: "From My Circle" }[f]} left="Fewer" right="More"
              value={p.formatMix[f]} onCommit={(v) => set("formatMix", { ...p.formatMix, [f]: v }, `Format appetite · ${f}`)} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="label">Always excluded</h3>
        {p.excludedTopics.length === 0 ? <p className="mt-1 text-sm text-muted">Nothing excluded.</p> : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {p.excludedTopics.map((t) => (
              <li key={t} className="chip pr-1.5">{t}
                <button aria-label={`Stop excluding ${t}`} className="ml-1 grid size-6 place-items-center rounded-full text-muted hover:bg-surface-2" onClick={() => set("excludedTopics", p.excludedTopics.filter((x) => x !== t), `Excluded topics`)}>×</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="block">
        <span className="label">Writing style notes for the editor</span>
        <textarea className="mt-1" placeholder="e.g. Fewer rhetorical questions. More concrete numbers. Keep the odd aside." value={p.writingStyleNote} onChange={(e) => set("writingStyleNote", e.target.value, "Writing style note")} />
      </label>
    </section>
  );
}
