import type { IngestItem } from "@/lib/ingest-schema";
import type { Item, Series } from "@/lib/types";

const words = (n: number, seed = "word") => Array.from({ length: n }, (_, i) => `${seed}${i % 7}`).join(" ");

/** A valid, approved update payload item. */
export function goodItem(over: Partial<IngestItem> = {}): IngestItem {
  return {
    id: "test-item-one",
    format: "update",
    headline: "A perfectly reasonable headline about something",
    body: `Something happened. ${words(140, "alpha")}.`,
    topics: ["Commercial spaceflight"],
    timeliness: "current",
    significance: 0.7,
    sources: [{ url: "https://example.com/a", name: "Example", type: "primary" }],
    stage: "approved",
    ...over,
  } as IngestItem;
}

export function payload(items: IngestItem[], over: Record<string, unknown> = {}) {
  return { schemaVersion: 1, task: "test-task", runId: "run-" + Math.random().toString(36).slice(2, 10), items, series: [], corrections: [], archive: [], ...over };
}

export const emptyContent = { items: [] as Item[], series: [] as Series[] };

export function chapterBody(n: number) {
  return `Chapter ${n}. ${words(650, "story")}.`;
}

export function seriesPayload(over: Record<string, unknown> = {}) {
  return {
    id: "test-series",
    title: "A Test Series Title",
    description: "A description that is comfortably longer than twenty characters.",
    subject: "Testing",
    topics: ["Computing history"],
    motif: "window",
    researchStatus: "ready",
    totalChapters: 3,
    outline: ["One", "Two", "Three"],
    sources: [{ url: "https://example.com/s", name: "S", type: "archive" }],
    ...over,
  };
}
