"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { applySteering, parseSteering, undoChange, uid, type SteerProposal } from "@/lib/ledger";

const EXAMPLES = [
  "I've had enough AI news recently. Show me more interesting design history.",
  "I want to learn more about the early space programme.",
  "Less financial news for a while.",
  "I really enjoyed that series. Find something similar.",
];

export function Steer() {
  const { state, update } = useStore();
  const [text, setText] = useState("");
  const [proposals, setProposals] = useState<SteerProposal[] | null>(null);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<{ summary: string[]; ids: string[] } | null>(null);

  const read = () => {
    const ps = parseSteering(text, state.interests);
    setDone(null);
    if (ps.length === 0) {
      // Not understood: still pass it to the editor verbatim.
      update((s) => ({ ...s, feedback: [{ id: uid("fb"), type: "reader-request" as const, reason: text, at: new Date().toISOString(), resulted: [] }, ...s.feedback] }));
      setProposals([]);
      return;
    }
    setProposals(ps);
    setChosen(new Set(ps.map((p) => p.id)));
  };

  const apply = () => {
    if (!proposals) return;
    const picked = proposals.filter((p) => chosen.has(p.id));
    const before = new Set(state.history.map((h) => h.id));
    const r = applySteering(state, picked, text);
    const newIds = r.state.history.filter((h) => !before.has(h.id)).map((h) => h.id);
    update(() => r.state);
    setDone({ summary: r.summary, ids: newIds });
    setProposals(null);
    setText("");
  };

  return (
    <section id="steer">
      <p className="text-ink-soft">Tell me, in your own words, what you'd like more or less of. I'll show you exactly what I'd change before I change it.</p>

      <label className="mt-4 block">
        <span className="sr-only">What would you like?</span>
        <textarea placeholder="e.g. Less financial news for a while. More design history." value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {EXAMPLES.map((ex) => (
          <button key={ex} className="chip hover:bg-surface-2" onClick={() => setText(ex)}>{ex.length > 46 ? ex.slice(0, 44) + "…" : ex}</button>
        ))}
      </div>
      <button className="btn btn-primary mt-4" onClick={read} disabled={!text.trim()}>Show me what you'd change</button>

      {proposals && proposals.length === 0 && (
        <div className="paper anim-rise mt-5 p-4 text-[0.95rem] text-ink-soft">
          I couldn't pin that to a specific change, so I haven't touched your ledger. I've passed your words to the editor as a request, which will read them on its next run. Try something like “less X” or “more X” if you'd like an immediate change.
        </div>
      )}

      {proposals && proposals.length > 0 && (
        <div className="paper anim-rise mt-5 p-4">
          <h3 className="label">Here's what I'd do</h3>
          <ul className="mt-2 space-y-2">
            {proposals.map((p) => (
              <li key={p.id}>
                <label className="flex items-start gap-3 text-[0.98rem]">
                  <input type="checkbox" className="mt-1.5 size-4 accent-[var(--sage)]" checked={chosen.has(p.id)}
                    onChange={() => setChosen((c) => { const n = new Set(c); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; })} />
                  <span>{p.summary}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-sage" onClick={apply} disabled={chosen.size === 0}>Do it</button>
            <button className="btn btn-quiet" onClick={() => setProposals(null)}>Never mind</button>
          </div>
        </div>
      )}

      {done && (
        <div className="paper anim-rise mt-5 p-4" role="status">
          <h3 className="label text-sage">Done. Here's what changed</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.98rem]">{done.summary.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <button className="btn btn-sm mt-3" onClick={() => { update((s) => done.ids.reduce((cur, id) => undoChange(cur, id).state, s)); setDone(null); }}>Undo all of that</button>
        </div>
      )}
    </section>
  );
}
