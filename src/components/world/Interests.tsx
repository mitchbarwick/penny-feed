"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { createInterest, patchInterest, priorityLabel, undoChange } from "@/lib/ledger";
import type { Interest } from "@/lib/types";
import { ago } from "@/lib/dates";
import { IconChevron, IconLock } from "../Icons";

const LEVELS: { label: "Low" | "Medium" | "High"; w: number }[] = [
  { label: "Low", w: 0.25 }, { label: "Medium", w: 0.55 }, { label: "High", w: 0.9 },
];

function Row({ it }: { it: Interest }) {
  const { update, state, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState(it.description);
  const [related, setRelated] = useState(it.related.join(", "));
  const recent = state.history.filter((h) => h.property.startsWith(`interest:${it.id}`)).slice(0, 4);

  const manual = (patch: Parameters<typeof patchInterest>[2], note: string) => {
    let blocked: string | undefined;
    update((s) => {
      const r = patchInterest(s, it.id, patch, "manual", note);
      blocked = r.blocked;
      return r.state;
    });
    if (blocked) toast(blocked);
  };

  const level = priorityLabel(it.weight);
  const tag =
    it.status === "excluded" ? "Excluded" : it.status === "muted" ? "Muted" : null;

  return (
    <li className="border-b border-line last:border-0">
      <button className="flex w-full items-center gap-3 py-4 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className={`font-display text-[1.1rem] font-semibold leading-tight ${it.status !== "active" ? "text-muted line-through decoration-1" : ""}`}>{it.name}</span>
            {it.locked && <span className="text-muted" title="Locked"><IconLock on /></span>}
          </span>
          <span className="mt-0.5 block text-[0.8rem] text-muted">
            {tag ?? `${level} priority`} · {it.origin === "explicit" ? "You set this" : `Inferred, ${Math.round(it.confidence * 100)}% sure`}
            {it.until && ` · until ${new Date(it.until).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`}
          </span>
        </span>
        <IconChevron dir={open ? "up" : "down"} />
      </button>

      <div className="expand" data-open={open}>
        <div>
          <div className="space-y-4 pb-5">
            <label className="block">
              <span className="label">What this covers</span>
              <textarea className="mt-1 !min-h-[4.5rem]" value={desc} onChange={(e) => setDesc(e.target.value)}
                onBlur={() => desc !== it.description && manual({ description: desc }, "You edited the description.")} />
            </label>
            <label className="block">
              <span className="label">Related subjects (comma separated)</span>
              <input type="text" className="mt-1" value={related} onChange={(e) => setRelated(e.target.value)}
                onBlur={() => manual({ related: related.split(",").map((x) => x.trim()).filter(Boolean) }, "You edited related subjects.")} />
            </label>

            <div>
              <span className="label">Priority</span>
              <div className="mt-1 inline-flex rounded-full border border-line p-0.5" role="radiogroup" aria-label="Priority">
                {LEVELS.map((l) => (
                  <button key={l.label} role="radio" aria-checked={level === l.label && it.status === "active"}
                    onClick={() => manual({ weight: l.w, status: "active" }, `You set the priority to ${l.label}.`)}
                    className={`min-h-[36px] rounded-full px-4 text-sm font-semibold ${level === l.label && it.status === "active" ? "bg-ink text-bg" : "text-muted"}`}>{l.label}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="btn btn-sm" onClick={() => manual({ status: it.status === "muted" ? "active" : "muted" }, it.status === "muted" ? "You unmuted this." : "You muted this.")}>{it.status === "muted" ? "Unmute" : "Mute"}</button>
              <button className="btn btn-sm" onClick={() => manual({ status: it.status === "excluded" ? "active" : "excluded", locked: it.status !== "excluded" }, it.status === "excluded" ? "You lifted the exclusion." : "You excluded this.")}>{it.status === "excluded" ? "Lift exclusion" : "Exclude for good"}</button>
              <button className="btn btn-sm" aria-pressed={it.locked} onClick={() => manual({ locked: !it.locked }, it.locked ? "You unlocked this." : "You locked this against automatic changes.")}>
                <IconLock on={it.locked} /> {it.locked ? "Locked" : "Lock"}
              </button>
              {it.origin === "inferred" && (
                <button className="btn btn-sm btn-sage" onClick={() => manual({ origin: "explicit", confidence: 1 }, "You confirmed this interest.")}>Yes, that's me</button>
              )}
              <button className="btn btn-sm btn-quiet text-terra" onClick={() => {
                update((s) => {
                  const withHist = { ...s, interests: s.interests.filter((i) => i.id !== it.id) };
                  // Deleting is recorded in history, with the full interest kept for undo
                  const entry = { id: `chg_${Date.now().toString(36)}`, at: new Date().toISOString(), property: `interest:${it.id}`, label: `Deleted “${it.name}”`, previous: it.status, next: null, origin: "manual" as const, explanation: "You deleted this interest.", undo: { kind: "set-interest" as const, id: it.id, interest: it } };
                  return { ...withHist, history: [entry, ...s.history] };
                });
                toast(`Deleted “${it.name}”. You can restore it from History.`);
              }}>Delete</button>
            </div>

            <div>
              <h4 className="label">Why I think this</h4>
              {it.evidence.length === 0 ? <p className="mt-1 text-sm text-muted">No evidence recorded.</p> : (
                <ul className="mt-1 space-y-1.5 text-[0.88rem] text-ink-soft">
                  {it.evidence.slice(0, 5).map((e) => (
                    <li key={e.id}><span className="chip mr-1.5 !py-0 text-[0.68rem] uppercase tracking-wide">{e.type}</span>{e.explanation} <span className="text-muted">{ago(e.at)}</span></li>
                  ))}
                  {it.evidence.length > 5 && <li className="text-muted">…and {it.evidence.length - 5} more.</li>}
                </ul>
              )}
            </div>

            {recent.length > 0 && (
              <div>
                <h4 className="label">Recent changes</h4>
                <ul className="mt-1 space-y-1 text-[0.85rem] text-ink-soft">
                  {recent.map((h) => (
                    <li key={h.id} className="flex items-center gap-2">
                      <span className="flex-1">{h.label} <span className="text-muted">· {h.origin} · {ago(h.at)}</span></span>
                      {h.undo && !h.reversedBy && h.undo.kind !== "none" && (
                        <button className="btn btn-sm btn-quiet" onClick={() => update((s) => undoChange(s, h.id).state)}>Undo</button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export function Interests() {
  const { state, update, toast } = useStore();
  const [name, setName] = useState("");
  const groups: { title: string; list: Interest[] }[] = [
    { title: "Active", list: state.interests.filter((i) => i.status === "active").sort((a, b) => b.weight - a.weight) },
    { title: "Muted", list: state.interests.filter((i) => i.status === "muted") },
    { title: "Excluded", list: state.interests.filter((i) => i.status === "excluded") },
  ];
  return (
    <section>
      <p className="text-ink-soft">
        This is everything I believe you're interested in, and why. Anything you set yourself is final: I'll add evidence to it, but I'll never quietly change it.
      </p>

      <form className="mt-5 flex gap-2" onSubmit={(e) => {
        e.preventDefault();
        const n = name.trim();
        if (!n) return;
        update((s) => createInterest(s, { name: n, origin: "explicit", weight: 0.7, confidence: 1, evidence: [{ type: "stated", explanation: "You added this yourself.", confidence: 1 }] }, "manual", "You added this interest.").state);
        setName("");
        toast(`Added “${n}”. Open it to describe what you'd like from it.`);
      }}>
        <input type="text" aria-label="Add an interest" placeholder="Add an interest, e.g. Japanese joinery" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-primary shrink-0">Add</button>
      </form>

      {groups.map((g) => g.list.length > 0 && (
        <div key={g.title} className="mt-8">
          <h3 className="label">{g.title} · {g.list.length}</h3>
          <ul className="mt-1">{g.list.map((i) => <Row key={i.id} it={i} />)}</ul>
        </div>
      ))}
    </section>
  );
}
