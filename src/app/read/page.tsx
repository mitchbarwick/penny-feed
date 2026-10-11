"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { useActions } from "@/lib/actions";
import { FORMAT_LABEL } from "@/lib/types";
import { seriesProgress } from "@/lib/curation";
import { fmtDate } from "@/lib/dates";
import { Prose } from "@/components/Prose";
import { Sources } from "@/components/Sources";
import { Doodle } from "@/components/Doodle";
import { IconBookmark, IconChevron } from "@/components/Icons";
import { markProgress } from "@/components/FeedCard";

function Reader() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id") ?? "";
  const { state, update, items, series, hydrated } = useStore();
  const { toggleSave, startSeries } = useActions();
  const item = items.find((i) => i.id === id);
  const s = item?.seriesId ? series.find((x) => x.id === item.seriesId) : undefined;
  const endRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);
  const restored = useRef(false);
  const lastSave = useRef(0);

  const pr = useMemo(() => (s ? seriesProgress(state, s, items) : null), [s, state, items]);
  const prevChapter = s && item?.chapter && item.chapter > 1 ? pr?.chapters.find((c) => c.chapter === item.chapter! - 1) : undefined;
  const blockedBy = prevChapter && state.progress[prevChapter.id]?.status !== "read" ? prevChapter : undefined;
  const nextChapter = s && item?.chapter ? pr?.chapters.find((c) => c.chapter === item.chapter! + 1) : undefined;
  const progress = item ? state.progress[item.id] : undefined;

  // Opening a chapter implicitly starts the series.
  useEffect(() => {
    if (hydrated && s && !state.seriesStarted[s.id] && !blockedBy) startSeries(s);
  }, [hydrated, s, state.seriesStarted, blockedBy, startSeries]);

  // Restore position
  useEffect(() => {
    if (!hydrated || !item || restored.current || blockedBy) return;
    restored.current = true;
    const p = progress;
    if (p && p.status === "reading" && p.position > 0.03) {
      // Fonts and images can change the page height after first paint, so settle in two passes.
      const jump = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: max * p.position, behavior: "instant" });
      };
      requestAnimationFrame(jump);
      setTimeout(jump, 350);
    } else if (!p || p.status !== "read") {
      markProgress(update, item.id, { status: "reading" });
    }
  }, [hydrated, item, progress, update, blockedBy]);

  // Track position and completion
  useEffect(() => {
    if (!item || blockedBy) return;
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
      setPct(p);
      const now = Date.now();
      if (now - lastSave.current > 1200) {
        lastSave.current = now;
        markProgress(update, item.id, { position: p });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [item, update, blockedBy]);

  useEffect(() => {
    if (!item || !endRef.current || blockedBy) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) markProgress(update, item.id, { status: "read", position: 1 }); }, { threshold: 0.9 });
    io.observe(endRef.current);
    return () => io.disconnect();
  }, [item, update, blockedBy]);

  if (!hydrated) return <div className="min-h-[60vh]" aria-busy="true" />;
  if (!item) {
    return (
      <main className="mx-auto max-w-[680px] px-5 pt-16 text-center">
        <div className="mx-auto w-fit text-sage"><Doodle name="plane" size={64} /></div>
        <h1 className="mt-4 font-display text-2xl font-semibold">I can't find that one.</h1>
        <p className="mt-2 text-ink-soft">It may have been archived. Back to the feed?</p>
        <Link href="/" className="btn mt-5">Back to the feed</Link>
      </main>
    );
  }

  const saved = state.saved.includes(item.id);
  const away = pr?.lastOpened ? (Date.now() - Date.parse(pr.lastOpened)) / 86_400_000 : 0;
  const lastOpenedOther = pr?.chapters.some((c) => c.id !== item.id && state.progress[c.id]);
  const showRecap = Boolean(item.recap) && away > 6 && lastOpenedOther && progress?.status !== "read";

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-[3px] bg-transparent" aria-hidden>
        <div className="h-full bg-terra/80 transition-[width] duration-200" style={{ width: `${Math.round(pct * 100)}%` }} />
      </div>
      <main className="mx-auto max-w-[680px] px-5 pb-16 pt-5 md:px-6">
        <div className="flex items-center justify-between">
          <button onClick={() => (history.length > 1 ? router.back() : router.push("/"))} className="btn btn-sm btn-quiet -ml-3"><IconChevron dir="left" /> Back</button>
          <button aria-label={saved ? "Remove from library" : "Save to library"} aria-pressed={saved} onClick={() => toggleSave(item)} className={`grid size-11 place-items-center rounded-full hover:bg-surface-2 ${saved ? "text-terra" : "text-muted"}`}>
            <IconBookmark on={saved} />
          </button>
        </div>

        {blockedBy ? (
          <section className="paper mt-8 p-6 text-center">
            <div className="mx-auto w-fit text-sage"><Doodle name="book" size={56} /></div>
            <h1 className="mt-3 font-display text-2xl font-semibold">Chapter {blockedBy.chapter} first.</h1>
            <p className="mt-2 text-ink-soft">
              “{s?.title}” works best in order, so I never show a later chapter before an earlier one. Pick up with “{blockedBy.headline}”.
            </p>
            <Link href={`/read/?id=${encodeURIComponent(blockedBy.id)}`} className="btn btn-primary mt-4">Go to chapter {blockedBy.chapter}</Link>
          </section>
        ) : (
          <article className="mt-6">
            <p className="label flex flex-wrap gap-x-2">
              <span className="text-terra">{FORMAT_LABEL[item.format]}</span><span aria-hidden>·</span>
              <span>{item.readingMinutes} min</span><span aria-hidden>·</span>
              <time dateTime={item.eventDate ?? item.publishedAt}>{fmtDate(item.eventDate ?? item.publishedAt)}</time>
              {item.sample && (<><span aria-hidden>·</span><span>Sample</span></>)}
            </p>
            {s && item.chapter && (
              <p className="mt-2 font-display text-base italic text-sage">
                <Link href={`/series/?id=${encodeURIComponent(s.id)}`}>{s.title}</Link> · Chapter {item.chapter} of {s.totalChapters}
              </p>
            )}
            <h1 className="mt-2 font-display text-[2.1rem] font-semibold leading-[1.1] tracking-[-0.015em] md:text-[2.5rem]">{item.headline}</h1>
            {item.dek && <p className="font-read mt-3 text-[1.25rem] italic leading-snug text-ink-soft">{item.dek}</p>}

            {showRecap && (
              <p className="mt-5 rounded-xl border border-line bg-sage-soft/50 px-4 py-3 text-[0.95rem] leading-snug text-ink-soft">
                <span className="label mr-1.5 text-sage">Previously</span>{item.recap}
              </p>
            )}

            <div className="mt-7"><Prose body={item.body} /></div>
            <div ref={endRef} className="h-px" />

            <Sources item={item} />

            {s && nextChapter && (
              <section className="paper mt-10 p-5">
                <p className="label">Next</p>
                <h2 className="mt-1 font-display text-xl font-semibold">Chapter {nextChapter.chapter}: {nextChapter.headline}</h2>
                <p className="mt-1 text-sm text-ink-soft">No waiting. Carry on whenever you like.</p>
                <Link href={`/read/?id=${encodeURIComponent(nextChapter.id)}`} className="btn btn-primary mt-3" onClick={() => markProgress(update, item.id, { status: "read", position: 1 })}>Continue to chapter {nextChapter.chapter}<IconChevron /></Link>
              </section>
            )}
            {s && !nextChapter && item.chapter === s.totalChapters && (
              <section className="paper mt-10 p-6 text-center">
                <div className="mx-auto w-fit text-amber"><Doodle name="star" size={52} /></div>
                <h2 className="mt-2 font-display text-xl font-semibold">That's the end of “{s.title}”.</h2>
                <p className="mt-1 text-sm text-ink-soft">It lives in your library now, ready to be read again in one go.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Link href="/library/" className="btn">Open library</Link>
                  <Link href="/world/#steer" className="btn btn-primary">Find me something similar</Link>
                </div>
              </section>
            )}
          </article>
        )}
      </main>
    </>
  );
}

export default function ReadPage() {
  return <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}><Reader /></Suspense>;
}
