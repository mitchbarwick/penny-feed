"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { seriesProgress } from "@/lib/curation";
import { FORMAT_LABEL } from "@/lib/types";
import { ago } from "@/lib/dates";
import { Cover, Doodle } from "@/components/Doodle";
import { IconChevron } from "@/components/Icons";
import { useActions } from "@/lib/actions";

const TABS = ["Saved", "Series", "History", "Following"] as const;
type Tab = (typeof TABS)[number];

export default function LibraryPage() {
  const { state, update, items, series, hydrated } = useStore();
  const { toggleSave } = useActions();
  const [tab, setTab] = useState<Tab>("Saved");

  const saved = useMemo(() => state.saved.map((id) => items.find((i) => i.id === id)).filter(Boolean), [state.saved, items]);
  const history = useMemo(
    () => Object.values(state.progress).sort((a, b) => b.lastOpened.localeCompare(a.lastOpened)).map((p) => ({ p, item: items.find((i) => i.id === p.itemId) })).filter((x) => x.item).slice(0, 60),
    [state.progress, items],
  );
  const started = series.filter((s) => state.seriesStarted[s.id]).map((s) => ({ s, pr: seriesProgress(state, s, items) }));
  const active = started.filter((x) => !x.pr.complete);
  const complete = started.filter((x) => x.pr.complete);

  if (!hydrated) return <div className="min-h-[60vh]" aria-busy="true" />;

  return (
    <main className="mx-auto max-w-[680px] px-5 pb-10 pt-8 md:px-6">
      <h1 className="font-display text-[2rem] font-semibold tracking-tight">Library</h1>
      <p className="mt-1 text-ink-soft">Everything worth keeping, in one quiet place.</p>

      <div role="tablist" aria-label="Library sections" className="scroll-hide -mx-1 mt-5 flex gap-1 overflow-x-auto px-1">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`min-h-[40px] shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${tab === t ? "bg-ink text-bg" : "text-muted hover:bg-surface-2"}`}>{t}</button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Saved" && (
          saved.length === 0 ? <Empty doodle="book" title="Nothing saved yet." text="Tap the bookmark on anything you'd like to keep. It'll settle in here." />
          : <ul className="divide-y divide-line">
              {saved.map((i) => i && (
                <li key={i.id} className="flex items-start gap-3 py-5">
                  <div className="min-w-0 flex-1">
                    <p className="label"><span className="text-terra">{FORMAT_LABEL[i.format]}</span> · {i.readingMinutes} min</p>
                    <Link href={`/read/?id=${encodeURIComponent(i.id)}`} className="mt-1 block font-display text-xl font-semibold leading-snug hover:text-terra">{i.headline}</Link>
                    {i.dek && <p className="font-read mt-1 italic text-ink-soft">{i.dek}</p>}
                  </div>
                  <button className="btn btn-sm btn-quiet" onClick={() => toggleSave(i)}>Remove</button>
                </li>
              ))}
            </ul>
        )}

        {tab === "Series" && (
          <div className="space-y-8">
            <SeriesGroup title="In progress" rows={active} state={state} emptyText="No series on the go. When I've something worth starting, it'll show up in your feed." />
            <SeriesGroup title="Finished" rows={complete} state={state} emptyText="Nothing finished yet." />
          </div>
        )}

        {tab === "History" && (
          history.length === 0 ? <Empty doodle="lamp" title="No history yet." text="What you open appears here, newest first." />
          : <ul className="divide-y divide-line">
              {history.map(({ p, item }) => (
                <li key={p.itemId}>
                  <Link href={`/read/?id=${encodeURIComponent(p.itemId)}`} className="flex items-center gap-3 py-4 hover:text-terra">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-lg font-semibold">{item!.headline}</span>
                      <span className="text-xs text-muted">{FORMAT_LABEL[item!.format]} · {p.status === "read" ? "Read" : `${Math.round(p.position * 100)}% in`} · {ago(p.lastOpened)}</span>
                    </span>
                    <IconChevron />
                  </Link>
                </li>
              ))}
            </ul>
        )}

        {tab === "Following" && (
          state.followed.length === 0 ? <Empty doodle="sprig" title="Not following anything." text="Use “Follow” on a story's menu and the topic will live here." />
          : <ul className="flex flex-wrap gap-2">
              {state.followed.map((t) => (
                <li key={t} className="chip pr-1.5">{t}
                  <button className="ml-1 grid size-6 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink" aria-label={`Unfollow ${t}`}
                    onClick={() => update((s) => ({ ...s, followed: s.followed.filter((x) => x !== t) }))}>×</button>
                </li>
              ))}
            </ul>
        )}
      </div>
    </main>
  );
}

function Empty({ doodle, title, text }: { doodle: "book" | "lamp" | "sprig"; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-12 text-center">
      <div className="text-sage"><Doodle name={doodle} size={64} /></div>
      <h2 className="mt-3 font-display text-xl font-semibold">{title}</h2>
      <p className="mt-1 max-w-xs text-ink-soft">{text}</p>
    </div>
  );
}

function SeriesGroup({ title, rows, state, emptyText }: { title: string; rows: { s: ReturnType<typeof useStore>["series"][number]; pr: ReturnType<typeof seriesProgress> }[]; state: ReturnType<typeof useStore>["state"]; emptyText: string }) {
  return (
    <section>
      <h2 className="label mb-3">{title}</h2>
      {rows.length === 0 ? <p className="text-ink-soft">{emptyText}</p> : (
        <ul className="space-y-3">
          {rows.map(({ s, pr }) => (
            <li key={s.id}>
              <Link href={`/series/?id=${encodeURIComponent(s.id)}`} className="paper flex overflow-hidden hover:border-sage">
                <div className="hidden w-28 shrink-0 text-sage sm:block"><Cover motif={s.motif} className="size-full" /></div>
                <div className="flex-1 p-4">
                  <h3 className="font-display text-lg font-semibold leading-tight">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted">{pr.read} of {s.totalChapters} chapters{state.seriesStarted[s.id] ? "" : ""}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pr.read} aria-valuemax={s.totalChapters}>
                    <div className="h-full rounded-full bg-sage" style={{ width: `${(pr.read / s.totalChapters) * 100}%` }} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
