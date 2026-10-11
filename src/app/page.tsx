"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { useFeed } from "@/lib/useFeed";
import { greeting } from "@/lib/dates";
import { FeedCard, SeriesPitchCard } from "@/components/FeedCard";
import { Doodle } from "@/components/Doodle";
import { nowIso } from "@/lib/ledger";

export default function FeedPage() {
  const { state, update, toast, contentLoading } = useStore();
  const { entries, fresh, setAnchor, ready } = useFeed();
  const restored = useRef(false);

  // Return to exactly where the reader left off.
  useEffect(() => {
    if (!ready || restored.current || entries.length === 0) return;
    restored.current = true;
    let key: string | null = null;
    try { key = localStorage.getItem("penny-feed:feed-anchor"); } catch { /* ignore */ }
    if (!key) return;
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-key="${CSS.escape(key!)}"]`);
      if (el) (el as HTMLElement).scrollIntoView({ block: "start", behavior: "instant" });
    });
  }, [ready, entries.length]);

  if (!ready) return <div className="min-h-[60vh]" aria-busy="true" />;

  const unread = entries.filter((e) => e.kind === "pitch" || state.progress[e.key]?.status !== "read");
  const done = unread.length === 0;

  return (
    <main className="mx-auto max-w-[680px] px-5 md:px-6">
      <header className="flex items-end justify-between pb-2 pt-8 md:pt-10">
        <div>
          <p className="label">{new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="mt-1 font-display text-[2rem] font-semibold leading-none tracking-tight">{greeting()}</h1>
          <p className="mt-2 text-ink-soft">{done ? "You're all caught up. Genuinely." : "Here's what I've got for you."}</p>
        </div>
        <div className="text-amber" aria-hidden><Doodle name="cup" size={52} /></div>
      </header>

      {fresh > 0 && (
        <p className="mt-2 text-sm text-sage">
          {fresh === 1 ? "One new story has" : `${fresh} new stories have`} settled in further down. Nothing above you moved.
        </p>
      )}

      <div className="divide-y divide-line">
        {entries.map((e) => (
          e.kind === "pitch"
            ? <SeriesPitchCard key={e.key} entry={e} />
            : <FeedCard key={e.key} entry={e} onSeen={setAnchor} />
        ))}
      </div>

      <section className="my-10 flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-10 text-center" aria-label="End of the feed">
        <div className="text-sage"><Doodle name="cat" size={84} /></div>
        <h2 className="mt-3 font-display text-xl font-semibold">{done ? "That's everything for now." : "That's the lot, for the moment."}</h2>
        <p className="mt-2 max-w-sm text-ink-soft">
          I'd rather stop here than pad the feed with filler. There's no clock on this, and nothing's slipping past you. 🌙
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/library/" className="btn">Revisit your library</Link>
          <button
            className="btn btn-primary"
            onClick={() => {
              update((s) => ({ ...s, feedback: [{ id: `fb_${Date.now().toString(36)}`, type: "reader-request", reason: "Please research something fresh for the feed.", at: nowIso(), resulted: [] }, ...s.feedback] }));
              toast("Asked. The editor will see it on the next run. Nothing new will appear until it's genuinely worth your time.");
            }}
          >Ask for fresh research</button>
          <Link href="/world/#steer" className="btn btn-quiet">Tell me what you'd like</Link>
        </div>
        {contentLoading && <p className="mt-4 text-xs text-muted">Checking for anything new…</p>}
      </section>
    </main>
  );
}
