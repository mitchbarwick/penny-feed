"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useStore } from "@/lib/store";
import { useActions } from "@/lib/actions";
import { seriesProgress } from "@/lib/curation";
import { Cover, Doodle } from "@/components/Doodle";
import { IconCheck, IconChevron } from "@/components/Icons";

function SeriesView() {
  const id = useSearchParams().get("id") ?? "";
  const { state, items, series, hydrated } = useStore();
  const { startSeries } = useActions();
  const s = series.find((x) => x.id === id);
  if (!hydrated) return <div className="min-h-[60vh]" aria-busy="true" />;
  if (!s) return (
    <main className="mx-auto max-w-[680px] px-5 pt-16 text-center">
      <h1 className="font-display text-2xl font-semibold">No such series.</h1>
      <Link href="/library/" className="btn mt-4">Back to the library</Link>
    </main>
  );
  const pr = seriesProgress(state, s, items);
  const started = Boolean(state.seriesStarted[s.id]);
  const ready = s.researchStatus === "ready" && pr.chapters.length > 0;
  const next = pr.next ?? pr.chapters[0];

  return (
    <main className="mx-auto max-w-[680px] px-5 pb-16 pt-4 md:px-6">
      <Link href="/library/" className="btn btn-sm btn-quiet -ml-3"><IconChevron dir="left" /> Library</Link>
      <div className="paper mt-3 overflow-hidden">
        <div className="h-36 text-sage"><Cover motif={s.motif} className="size-full" /></div>
        <div className="p-5">
          <p className="label"><span className="text-terra">The Series</span> · {s.subject}</p>
          <h1 className="mt-2 font-display text-[2rem] font-semibold leading-tight tracking-tight">{s.title}</h1>
          <p className="font-read mt-2 text-[1.12rem] leading-relaxed text-ink-soft">{s.description}</p>
          <p className="mt-3 text-sm text-muted">
            {s.totalChapters} chapters · about {Math.round(s.totalChapters * 5)} minutes in all
            {ready && ` · ${pr.read} read`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ready && next && (
              <Link href={`/read/?id=${encodeURIComponent(next.id)}`} className="btn btn-primary" onClick={() => !started && startSeries(s)}>
                {pr.read === 0 ? "Start chapter 1" : pr.complete ? "Read again from the start" : `Continue with chapter ${next.chapter}`}
                <IconChevron />
              </Link>
            )}
            {!ready && <p className="text-sm text-ink-soft">{s.researchStatus === "pitched" ? "Not researched yet. Say yes in the feed and the editor will research the whole thing first." : "The editor is still researching this one. I won't publish chapter one until every chapter is ready."}</p>}
          </div>
        </div>
      </div>

      <h2 className="label mb-3 mt-8">Chapters</h2>
      <ol className="divide-y divide-line rounded-2xl border border-line bg-surface">
        {s.outline.map((title, idx) => {
          const n = idx + 1;
          const ch = pr.chapters.find((c) => c.chapter === n);
          const st = ch ? state.progress[ch.id] : undefined;
          const prev = pr.chapters.find((c) => c.chapter === n - 1);
          const locked = n > 1 && (!prev || state.progress[prev.id]?.status !== "read") && st?.status !== "read" && n !== (pr.next?.chapter ?? 1);
          const inner = (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className={`grid size-8 shrink-0 place-items-center rounded-full border text-sm font-semibold ${st?.status === "read" ? "border-sage bg-sage text-white" : "border-line text-muted"}`}>
                {st?.status === "read" ? <IconCheck /> : n}
              </span>
              <span className="flex-1">
                <span className={`block font-display text-[1.05rem] font-semibold leading-tight ${locked ? "text-muted" : ""}`}>{ch?.headline ?? title}</span>
                <span className="text-xs text-muted">
                  {ch ? `${ch.readingMinutes} min` : "Not published"}
                  {st?.status === "reading" && st.position > 0.03 ? ` · ${Math.round(st.position * 100)}% in` : ""}
                  {locked ? " · after the chapter before" : ""}
                </span>
              </span>
              {ch && !locked && <IconChevron />}
            </div>
          );
          return <li key={n}>{ch && !locked ? <Link href={`/read/?id=${encodeURIComponent(ch.id)}`} className="block hover:bg-surface-2">{inner}</Link> : <div className="opacity-80">{inner}</div>}</li>;
        })}
      </ol>
      <div className="mt-10 flex justify-center text-sage"><Doodle name="sprig" size={48} /></div>
    </main>
  );
}

export default function SeriesPage() {
  return <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}><SeriesView /></Suspense>;
}
