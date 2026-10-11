"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { SourcePrefs as SP } from "@/lib/types";

function Chips({ title, hint, field }: { title: string; hint: string; field: keyof SP }) {
  const { state, update } = useStore();
  const [v, setV] = useState("");
  const list = state.sourcePrefs[field];
  const set = (next: string[]) => update((s) => ({ ...s, sourcePrefs: { ...s.sourcePrefs, [field]: next } }));
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-[0.85rem] text-muted">{hint}</p>
      {list.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {list.map((x) => (
            <li key={x} className="chip pr-1.5">{x}
              <button aria-label={`Remove ${x}`} className="ml-1 grid size-6 place-items-center rounded-full text-muted hover:bg-surface-2" onClick={() => set(list.filter((y) => y !== x))}>×</button>
            </li>
          ))}
        </ul>
      )}
      <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); const t = v.trim(); if (t && !list.includes(t)) set([...list, t]); setV(""); }}>
        <input type="text" aria-label={`Add to ${title}`} value={v} onChange={(e) => setV(e.target.value)} />
        <button className="btn btn-sm shrink-0">Add</button>
      </form>
    </div>
  );
}

export function SourcePrefs() {
  return (
    <section className="space-y-8">
      <p className="text-ink-soft">
        Where discoveries come from, and what to leave alone. Email is a place I look for interesting things, not a feed in itself: bills, receipts, shipping and anything needing a reply are never touched. Stories I find through your inbox sit in the feed like any other.
      </p>
      <Chips title="Newsletters to prioritise" hint="Sender addresses or names whose best links I should always dig into." field="prioritisedSenders" />
      <Chips title="Senders to ignore" hint="I won't read these at all." field="excludedSenders" />
      <Chips title="Approved Gmail labels" hint="If set, I only look at mail carrying one of these labels. Strongly recommended." field="approvedLabels" />
      <Chips title="Muted email categories" hint="e.g. promotions, social, finance." field="mutedCategories" />
    </section>
  );
}
