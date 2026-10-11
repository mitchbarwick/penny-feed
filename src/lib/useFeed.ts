"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "./store";
import { mergeSnapshot, rank, type FeedEntry } from "./curation";

const LS_ANCHOR = "penny-feed:feed-anchor";

function getAnchor(): string | undefined {
  try { return localStorage.getItem(LS_ANCHOR) ?? undefined; } catch { return undefined; }
}

/**
 * The feed the reader sees: a stable, persisted order. New stories settle in
 * below what's next; preference changes re-rank only what hasn't been shown yet.
 */
export function useFeed() {
  const { state, items, series, update, hydrated } = useStore();
  const [anchor, setAnchorState] = useState<string | undefined>(undefined);
  const anchorRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const a = getAnchor();
    anchorRef.current = a;
    setAnchorState(a);
  }, []);

  const ranked = useMemo(() => (hydrated ? rank(state, items, series) : []), [state, items, series, hydrated]);

  // Items read since the snapshot was taken stay put (dimmed) until the next session.
  const keep = useMemo(() => {
    const k = new Set<string>();
    const since = state.feedSnapshotAt ?? "";
    for (const [id, p] of Object.entries(state.progress)) {
      if (p.status === "read" && p.lastOpened >= since && !state.dismissed.includes(id)) k.add(id);
    }
    return k;
  }, [state.progress, state.feedSnapshotAt, state.dismissed]);

  const merged = useMemo(
    () => mergeSnapshot(state.feedSnapshot, ranked, anchor, keep),
    [state.feedSnapshot, ranked, anchor, keep],
  );

  const entries: FeedEntry[] = useMemo(() => {
    const byKey = new Map(ranked.map((r) => [r.key, r]));
    const out: FeedEntry[] = [];
    for (const key of merged.order) {
      const e = byKey.get(key);
      if (e) { out.push(e); continue; }
      // read this session: not eligible any more, but still shown, quietly
      const item = items.find((i) => i.id === key);
      if (item) out.push({ key, kind: "item", item, series: series.find((s) => s.id === item.seriesId), score: 0, relevance: 0, discovery: false, reason: "You've read this one.", signals: [] });
    }
    return out;
  }, [merged.order, ranked, items, series]);

  // persist the order
  useEffect(() => {
    if (!hydrated || ranked.length === 0) return;
    const same = merged.order.length === state.feedSnapshot.length && merged.order.every((k, i) => k === state.feedSnapshot[i]);
    if (!same) update((s) => ({ ...s, feedSnapshot: merged.order, feedSnapshotAt: s.feedSnapshotAt ?? new Date().toISOString() }));
  }, [merged.order, hydrated, ranked.length, state.feedSnapshot, update]);

  const setAnchor = useCallback((key: string) => {
    anchorRef.current = key;
    try { localStorage.setItem(LS_ANCHOR, key); } catch { /* ignore */ }
  }, []);

  // Anchor state is only read at mount (for merging) and refreshed lazily, so scrolling never re-renders the feed.
  useEffect(() => {
    const h = () => setAnchorState(anchorRef.current);
    document.addEventListener("visibilitychange", h);
    return () => document.removeEventListener("visibilitychange", h);
  }, []);

  return { entries, fresh: merged.fresh, setAnchor, ready: hydrated };
}
