"use client";
import { useCallback } from "react";
import { useStore } from "./store";
import { applyFeedback, nowIso, undoChange } from "./ledger";
import type { Item, Series } from "./types";

/** Reader gestures, expressed as inspectable ledger changes with an undo. */
export function useActions() {
  const { update, toast, addFeedback, state } = useStore();

  const undoMany = useCallback((ids: string[]) => {
    update((s) => {
      let cur = s;
      for (const id of ids) cur = undoChange(cur, id).state;
      return cur;
    });
  }, [update]);

  const toggleSave = useCallback((item: Item) => {
    const saved = state.saved.includes(item.id);
    update((s) => ({ ...s, saved: saved ? s.saved.filter((x) => x !== item.id) : [item.id, ...s.saved] }));
    addFeedback({ itemId: item.id, type: saved ? "unsave" : "save" });
    toast(saved ? "Removed from your library." : "Saved to your library.");
    // Saving is a gentle positive signal: evidence only, never a weight change.
    if (!saved) {
      update((s) => ({
        ...s,
        interests: s.interests.map((i) =>
          item.topics.some((t) => i.name.toLowerCase() === t.toLowerCase() || i.related.some((r) => r.toLowerCase() === t.toLowerCase()))
            ? { ...i, reinforcedAt: nowIso(), evidence: [{ id: `ev_${Date.now().toString(36)}`, type: "saved" as const, explanation: `You saved “${item.headline}”.`, confidence: 0.3, at: nowIso() }, ...i.evidence].slice(0, 40) }
            : i,
        ),
      }));
    }
  }, [state.saved, update, toast, addFeedback]);

  const dismiss = useCallback((item: Item) => {
    update((s) => ({ ...s, dismissed: [...s.dismissed, item.id] }));
    addFeedback({ itemId: item.id, type: "dismiss" });
    toast("Dismissed.", () => update((s) => ({ ...s, dismissed: s.dismissed.filter((x) => x !== item.id) })));
  }, [update, toast, addFeedback]);

  const react = useCallback((item: Item, type: "more" | "less" | "mute" | "follow", topic?: string) => {
    // Compute outside the updater so the history ids we hand to Undo are the ones that get stored.
    const r = applyFeedback(state, item, type, topic);
    const ids = r.changes.map((c) => c.id);
    update(() => r.state);
    addFeedback({ itemId: item.id, type, topic, resulted: ids });
    toast(r.message, ids.length ? () => undoMany(ids) : undefined);
  }, [state, update, toast, addFeedback, undoMany]);

  const startSeries = useCallback((series: Series) => {
    update((s) => ({ ...s, seriesStarted: { ...s.seriesStarted, [series.id]: nowIso() } }));
    addFeedback({ seriesId: series.id, type: "series-yes" });
  }, [update, addFeedback]);

  const declineSeries = useCallback((series: Series) => {
    addFeedback({ seriesId: series.id, type: "series-no" });
    toast("No problem. I won't pitch that one again.");
  }, [addFeedback, toast]);

  return { toggleSave, dismiss, react, startSeries, declineSeries };
}
