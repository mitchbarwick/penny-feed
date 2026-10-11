"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { uid } from "@/lib/ledger";
import type { Person } from "@/lib/types";
import { Doodle } from "../Doodle";

const CLOSE = { 1: "Close", 2: "Friend", 3: "Acquaintance" } as const;

function PersonRow({ p }: { p: Person }) {
  const { update } = useStore();
  const [open, setOpen] = useState(false);
  const patch = (x: Partial<Person>) => update((s) => ({ ...s, people: s.people.map((q) => (q.id === p.id ? { ...q, ...x } : q)) }));
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  return (
    <li className="border-b border-line last:border-0">
      <button className="flex w-full items-center gap-3 py-4 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="flex-1">
          <span className="block font-display text-lg font-semibold">{p.name}</span>
          <span className="text-[0.8rem] text-muted">{p.relationship || "No context yet"} · {CLOSE[p.closeness]}</span>
        </span>
      </button>
      <div className="expand" data-open={open}>
        <div>
          <div className="space-y-4 pb-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block"><span className="label">Relationship / context</span>
                <input type="text" className="mt-1" value={p.relationship} onChange={(e) => patch({ relationship: e.target.value })} /></label>
              <label className="block"><span className="label">Closeness</span>
                <select className="mt-1" value={p.closeness} onChange={(e) => patch({ closeness: Number(e.target.value) as Person["closeness"] })}>
                  <option value={1}>Close</option><option value={2}>Friend</option><option value={3}>Acquaintance</option>
                </select></label>
            </div>
            <label className="block"><span className="label">Milestones I should care about (comma separated)</span>
              <input type="text" className="mt-1" placeholder="new job, launches, big news" value={p.interestedIn.join(", ")} onChange={(e) => patch({ interestedIn: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></label>
            <label className="block"><span className="label">Notes</span>
              <textarea className="mt-1 !min-h-[3.5rem]" value={p.notes} onChange={(e) => patch({ notes: e.target.value })} /></label>

            <div>
              <h4 className="label">Places I'm allowed to look</h4>
              <p className="mt-1 text-[0.82rem] text-muted">Only public or permitted pages. I won't log in as you, scrape behind a login, or work around a site's rules. For LinkedIn and Facebook, forwarding notification emails is the reliable route.</p>
              <ul className="mt-2 space-y-1.5">
                {p.profiles.map((pr, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="size-4 accent-[var(--sage)]" checked={pr.permitted} aria-label={`Permitted: ${pr.label}`}
                      onChange={() => patch({ profiles: p.profiles.map((x, j) => (j === i ? { ...x, permitted: !x.permitted } : x)) })} />
                    <a className="flex-1 truncate text-blue underline underline-offset-2" href={pr.url} target="_blank" rel="noopener noreferrer nofollow">{pr.label}</a>
                    <button className="btn btn-sm btn-quiet" onClick={() => patch({ profiles: p.profiles.filter((_, j) => j !== i) })}>Remove</button>
                  </li>
                ))}
              </ul>
              <form className="mt-2 flex flex-wrap gap-2" onSubmit={(e) => {
                e.preventDefault();
                if (!url.trim()) return;
                patch({ profiles: [...p.profiles, { label: label.trim() || new URL(url).hostname, url: url.trim(), permitted: true }] });
                setUrl(""); setLabel("");
              }}>
                <input type="text" className="!w-32" aria-label="Label" placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
                <input type="url" className="min-w-0 flex-1" aria-label="Profile URL" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
                <button className="btn btn-sm">Add</button>
              </form>
            </div>

            <div>
              <h4 className="label">Updates I've shared</h4>
              {p.updates.length === 0 ? <p className="mt-1 text-sm text-muted">None yet.{p.lastChecked ? ` Last checked ${new Date(p.lastChecked).toLocaleDateString("en-AU")}.` : ""}</p> : (
                <ul className="mt-1 space-y-1 text-sm text-ink-soft">{p.updates.map((u, i) => <li key={i}>{u.summary} <span className="text-muted">· {new Date(u.at).toLocaleDateString("en-AU")}</span></li>)}</ul>
              )}
            </div>

            <button className="btn btn-sm btn-quiet text-terra" onClick={() => update((s) => ({ ...s, people: s.people.filter((q) => q.id !== p.id) }))}>Remove {p.name}</button>
          </div>
        </div>
      </div>
    </li>
  );
}

export function People() {
  const { state, update } = useStore();
  const [name, setName] = useState("");
  const [rel, setRel] = useState("");
  return (
    <section>
      <p className="text-ink-soft">
        The people whose good news I should pass on. This is separate from your interests: you might not care about an industry, but you'd want to know a friend just made it.
      </p>
      <form className="mt-5 grid gap-2 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        update((s) => ({ ...s, people: [{ id: uid("p"), name: name.trim(), relationship: rel.trim(), closeness: 2, profiles: [], interestedIn: [], notes: "", updates: [] }, ...s.people] }));
        setName(""); setRel("");
      }}>
        <input type="text" aria-label="Name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" aria-label="Relationship" placeholder="How you know them" value={rel} onChange={(e) => setRel(e.target.value)} />
        <button className="btn btn-primary">Add</button>
      </form>
      {state.people.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-10 text-center">
          <div className="text-sage"><Doodle name="sprig" size={56} /></div>
          <p className="mt-3 max-w-xs text-ink-soft">Nobody here yet. Add a few friends and former colleagues, and I'll keep an eye out for the good stuff. Quietly.</p>
        </div>
      ) : (
        <ul className="mt-6">{state.people.map((p) => <PersonRow key={p.id} p={p} />)}</ul>
      )}
    </section>
  );
}
