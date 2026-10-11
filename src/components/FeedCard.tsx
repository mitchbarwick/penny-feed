"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import type { FeedEntry } from "@/lib/curation";
import { seriesProgress } from "@/lib/curation";
import { FORMAT_LABEL, type Item } from "@/lib/types";
import { excerpt } from "@/lib/markup";
import { ago, fmtDate } from "@/lib/dates";
import { useStore } from "@/lib/store";
import { useActions } from "@/lib/actions";
import { nowIso } from "@/lib/ledger";
import { Prose } from "./Prose";
import { Sources } from "./Sources";
import { IconBookmark, IconMore, IconChevron, IconClose } from "./Icons";
import { Cover } from "./Doodle";

const INLINE: Item["format"][] = ["update", "explainer", "rabbit_hole", "circle"];

export function markProgress(
  update: ReturnType<typeof useStore>["update"], id: string, patch: { status?: "reading" | "read"; position?: number },
) {
  update((s) => {
    const cur = s.progress[id];
    if (cur?.status === "read" && patch.status !== "read") return { ...s, progress: { ...s.progress, [id]: { ...cur, lastOpened: nowIso() } } };
    return {
      ...s,
      progress: {
        ...s.progress,
        [id]: {
          itemId: id,
          status: patch.status ?? cur?.status ?? "reading",
          position: patch.position ?? cur?.position ?? 0,
          lastOpened: nowIso(),
          completedAt: patch.status === "read" ? nowIso() : cur?.completedAt,
        },
      },
    };
  });
}

function Meta({ item, extra }: { item: Item; extra?: string }) {
  return (
    <p className="label flex flex-wrap items-center gap-x-2">
      <span className="text-terra">{FORMAT_LABEL[item.format]}</span>
      <span aria-hidden>·</span>
      <span>{item.readingMinutes} min</span>
      <span aria-hidden>·</span>
      <time dateTime={item.eventDate ?? item.publishedAt}>
        {item.eventDate && item.timeliness === "current" ? fmtDate(item.eventDate) : ago(item.publishedAt)}
      </time>
      {extra && (<><span aria-hidden>·</span><span>{extra}</span></>)}
    </p>
  );
}

export function FeedCard({ entry, onSeen }: { entry: FeedEntry; onSeen?: (key: string) => void }) {
  const item = entry.item!;
  const { state, update, items } = useStore();
  const { toggleSave, dismiss, react } = useActions();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [why, setWhy] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Swipe either way to dismiss (touch/pen only; vertical scrolling is untouched). Series chapters are
  // exempt: skipping one would silently stall the series, which has its own "Not for me".
  const canDismiss = item.format !== "series_chapter";
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState<-1 | 1 | 0>(0);
  const drag = useRef<{ id: number; x: number; y: number; active: boolean } | null>(null);
  const THRESHOLD = 96;

  const sendAway = useCallback((dir: -1 | 1) => {
    setLeaving(dir);
    window.setTimeout(() => dismiss(item), 200);
  }, [dismiss, item]);

  const onPointerDown = (e: RPointerEvent) => {
    if (!canDismiss || open || menu || leaving || e.pointerType === "mouse") return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, active: false };
  };
  const onPointerMove = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const mx = e.clientX - d.x;
    const my = e.clientY - d.y;
    if (!d.active) {
      if (Math.abs(mx) > 12 && Math.abs(mx) > Math.abs(my) * 1.6) d.active = true;
      else return;
    }
    setDx(mx);
  };
  const endDrag = (e: RPointerEvent, cancelled = false) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (d.active && !cancelled && Math.abs(dx) >= THRESHOLD) sendAway(dx < 0 ? -1 : 1);
    else setDx(0);
  };

  const saved = state.saved.includes(item.id);
  const progress = state.progress[item.id];
  const isRead = progress?.status === "read";
  const inline = INLINE.includes(item.format);
  const topic = item.topics[0];
  const followed = state.followed.some((f) => f.toLowerCase() === topic.toLowerCase());

  // tell the feed which card the reader is at, so new stories never shove it around
  useEffect(() => {
    const el = ref.current;
    if (!el || !onSeen) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) onSeen(entry.key); }, { rootMargin: "-35% 0px -55% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [entry.key, onSeen]);

  // finishing an inline piece marks it read
  useEffect(() => {
    if (!open || !endRef.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) markProgress(update, item.id, { status: "read", position: 1 }); }, { threshold: 0.6 });
    io.observe(endRef.current);
    return () => io.disconnect();
  }, [open, item.id, update]);

  const series = entry.series;
  const seriesInfo = series ? seriesProgress(state, series, items) : null;
  const away = seriesInfo?.lastOpened ? (Date.now() - Date.parse(seriesInfo.lastOpened)) / 86_400_000 : 0;

  return (
    <article ref={ref} data-key={entry.key} className={`anim-rise relative overflow-hidden py-9 ${isRead && !open ? "opacity-60" : ""}`}>
      {canDismiss && (dx !== 0 || leaving !== 0) && (
        <div aria-hidden className={`pointer-events-none absolute inset-y-0 flex items-center px-4 text-sm font-semibold text-muted ${(leaving || dx) < 0 ? "right-0" : "left-0"}`} style={{ opacity: leaving ? 1 : Math.min(1, Math.abs(dx) / THRESHOLD) }}>
          Not for me
        </div>
      )}
      <div
        style={{
          transform: leaving ? `translateX(${leaving * 110}%)` : dx ? `translateX(${dx}px)` : undefined,
          opacity: leaving ? 0 : dx ? 1 - Math.min(0.5, Math.abs(dx) / (THRESHOLD * 3)) : undefined,
          transition: drag.current?.active ? "none" : "transform 0.2s ease, opacity 0.2s ease",
          touchAction: canDismiss && !open && !menu ? "pan-y" : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e)}
        onPointerCancel={(e) => endDrag(e, true)}
      >
      <Meta item={item} extra={item.format === "series_chapter" && series ? `Chapter ${item.chapter} of ${series.totalChapters}` : item.sample ? "Sample" : undefined} />

      {item.format === "series_chapter" && series && (
        <p className="mt-1 font-display text-[0.95rem] italic text-sage">{series.title}</p>
      )}

      <h2 className="mt-2 font-display text-[1.65rem] font-semibold leading-[1.14] tracking-[-0.012em] text-ink md:text-[1.9rem]">
        {inline ? (
          <button className="text-left" onClick={() => { setOpen((o) => !o); if (!open) markProgress(update, item.id, { status: "reading" }); }} aria-expanded={open}>
            {item.headline}
          </button>
        ) : (
          <Link href={`/read/?id=${encodeURIComponent(item.id)}`}>{item.headline}</Link>
        )}
      </h2>
      {item.dek && <p className="font-read mt-2 text-[1.12rem] italic leading-snug text-ink-soft">{item.dek}</p>}

      {item.format === "series_chapter" && series && away > 6 && item.recap && (
        <p className="mt-3 rounded-xl border border-line bg-sage-soft/50 px-3.5 py-2.5 text-[0.92rem] leading-snug text-ink-soft">
          <span className="label mr-1 text-sage">Previously</span>
          {item.recap}
        </p>
      )}

      {!open && !(item.format === "circle") && (
        <p className="font-read mt-3 text-[1.08rem] leading-relaxed text-ink-soft">{excerpt(item.body, 46)}</p>
      )}

      {inline ? (
        <div className="expand" data-open={open}>
          <div inert={!open}>
            <div className="pt-4"><Prose body={item.body} compact dropCap={false} /></div>
            <div ref={endRef} />
            <Sources item={item} />
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between">
        {inline ? (
          <button className="btn btn-sm" onClick={() => { setOpen((o) => !o); if (!open) markProgress(update, item.id, { status: "reading" }); }}>
            {open ? "Close" : progress?.status === "read" ? "Read again" : item.format === "circle" ? "Details" : "Keep reading"}
            <IconChevron dir={open ? "up" : "down"} />
          </button>
        ) : (
          <Link href={`/read/?id=${encodeURIComponent(item.id)}`} className="btn btn-sm btn-primary">
            {progress && progress.status === "reading" && progress.position > 0.03 ? "Continue reading" : item.format === "series_chapter" ? `Read chapter ${item.chapter}` : "Read"}
            <IconChevron />
          </Link>
        )}
        <div className="flex items-center gap-1 text-muted">
          <button aria-label={saved ? "Remove from library" : "Save to library"} aria-pressed={saved} className={`grid size-11 place-items-center rounded-full hover:bg-surface-2 ${saved ? "text-terra" : ""}`} onClick={() => toggleSave(item)}>
            <IconBookmark on={saved} />
          </button>
          {canDismiss && (
            <button aria-label="Not interested: dismiss this story" className="grid size-11 place-items-center rounded-full hover:bg-surface-2" onClick={() => sendAway(-1)}>
              <IconClose />
            </button>
          )}
          <button aria-label="More options" aria-expanded={menu} className="grid size-11 place-items-center rounded-full hover:bg-surface-2" onClick={() => setMenu((m) => !m)}>
            <IconMore />
          </button>
        </div>
      </div>

      <div className="expand" data-open={menu}>
        <div inert={!menu}>
          <div className="mt-2 space-y-3 rounded-2xl border border-line bg-surface p-3.5">
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-sm" onClick={() => setWhy((w) => !w)} aria-expanded={why}>Why am I seeing this?</button>
              <button className="btn btn-sm" onClick={() => react(item, "more")}>More like this</button>
              <button className="btn btn-sm" onClick={() => react(item, "less")}>Less like this</button>
              <button className="btn btn-sm" onClick={() => react(item, "follow", topic)} disabled={followed}>{followed ? `Following ${topic}` : `Follow ${topic}`}</button>
              <button className="btn btn-sm" onClick={() => react(item, "mute", topic)}>Mute {topic}</button>
              {item.sources[0] && !item.sample && <a className="btn btn-sm" href={item.sources[0].url} target="_blank" rel="noopener noreferrer nofollow">Original source</a>}
              {canDismiss && <button className="btn btn-sm btn-quiet" onClick={() => dismiss(item)}>Dismiss</button>}
            </div>
            {why && (
              <div className="anim-rise text-[0.92rem] leading-snug text-ink-soft">
                <p>{entry.reason}</p>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[0.82rem]">
                  {entry.signals.map((s) => (<div className="contents" key={s.label}><dt className="text-muted">{s.label}</dt><dd>{s.value}</dd></div>))}
                  {item.discoveredVia && <><dt className="text-muted">Found via</dt><dd>{{ web: "Web research", inbox: "Your inbox", reddit: "Reddit (as a pointer, not evidence)", social: "Your circle", "reader-request": "Your request" }[item.discoveredVia]}</dd></>}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </article>
  );
}

export function SeriesPitchCard({ entry }: { entry: FeedEntry }) {
  const series = entry.series!;
  const { startSeries, declineSeries } = useActions();
  const ready = series.researchStatus === "ready";
  const { items, state, toast } = useStore();
  const first = items.find((i) => i.seriesId === series.id && i.chapter === 1);
  return (
    <article className="anim-rise py-6" data-key={entry.key}>
      <div className="paper overflow-hidden">
        <div className="h-28 text-sage"><Cover motif={series.motif} className="size-full" /></div>
        <div className="p-5">
          <p className="label"><span className="text-terra">The Series</span> · {ready ? `${series.totalChapters} chapters · ~5 min each` : "Planned"}</p>
          <h2 className="mt-2 font-display text-[1.5rem] font-semibold leading-tight">{series.title}</h2>
          <p className="font-read mt-2 text-[1.08rem] leading-relaxed text-ink-soft">{series.description}</p>
          <p className="mt-2 text-[0.9rem] italic text-muted">{entry.reason}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ready && first ? (
              <Link href={`/read/?id=${encodeURIComponent(first.id)}`} onClick={() => startSeries(series)} className="btn btn-primary">Start reading</Link>
            ) : (
              <button className="btn btn-primary" onClick={() => { startSeries(series); toast("Lovely. I've noted it for the editor, who'll research the lot before chapter one appears."); }}>Yes, research this</button>
            )}
            <Link href={`/series/?id=${encodeURIComponent(series.id)}`} className="btn">See the outline</Link>
            <button className="btn btn-quiet" onClick={() => declineSeries(series)} aria-label={`Not interested in ${series.title}`}>Not for me</button>
          </div>
          {!ready && state.seriesStarted[series.id] && <p className="mt-3 text-sm text-sage">You said yes. Research comes first; I never publish a series I haven't finished.</p>}
        </div>
      </div>
    </article>
  );
}
