"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { undoChange } from "@/lib/ledger";
import type { ChangeOrigin } from "@/lib/types";
import { ago } from "@/lib/dates";

const ORIGIN: Record<ChangeOrigin, string> = {
  manual: "You", steering: "You, in words", feedback: "A reaction", reddit: "Reddit import", email: "Email", system: "Automatic",
};

const show = (v: unknown) => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") return v % 1 ? v.toFixed(2) : String(v);
  if (Array.isArray(v)) return v.join(", ") || "none";
  return String(v);
};

export function History() {
  const { state, update, toast } = useStore();
  const [filter, setFilter] = useState<"all" | ChangeOrigin>("all");
  const list = state.history.filter((h) => filter === "all" || h.origin === filter);
  return (
    <section>
      <p className="text-ink-soft">Every change to what I believe about you, newest first. Nothing here is ever erased; undoing something adds a new line.</p>
      <label className="mt-4 block max-w-[14rem]">
        <span className="sr-only">Filter by origin</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="all">Everything</option>
          {(Object.keys(ORIGIN) as ChangeOrigin[]).map((o) => <option key={o} value={o}>{ORIGIN[o]}</option>)}
        </select>
      </label>
      {list.length === 0 ? <p className="mt-6 text-ink-soft">Nothing yet. Your ledger is exactly as it started.</p> : (
        <ol className="mt-4 divide-y divide-line">
          {list.slice(0, 120).map((h) => (
            <li key={h.id} className="py-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold leading-snug ${h.reversedBy ? "text-muted line-through decoration-1" : ""}`}>{h.label}</p>
                  <p className="mt-0.5 text-[0.85rem] text-ink-soft">
                    {show(h.previous)} <span aria-label="became">→</span> {show(h.next)}
                  </p>
                  <p className="mt-0.5 text-[0.8rem] text-muted">{ORIGIN[h.origin]} · {ago(h.at)} · {h.explanation}</p>
                </div>
                {h.undo && h.undo.kind !== "none" && !h.reversedBy && !h.reverses && (
                  <button className="btn btn-sm" onClick={() => { const r = undoChange(state, h.id); update(() => r.state); toast(r.message); }}>Undo</button>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
