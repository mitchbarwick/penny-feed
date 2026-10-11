import type { Format, Item, SourceRef } from "@/lib/types";
import { readingMinutes } from "@/lib/ingest-schema";

const DAY = 86_400_000;
// Sample items are dated relative to "now" so the demo always feels fresh.
export const daysAgo = (n: number, hour = 7) => {
  const d = new Date(Date.now() - n * DAY);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const SAMPLE_NOTE =
  "Sample item written for development. Links point to well-known reference pages and are indicative, not a verified citation trail.";

export const ref = (url: string, name: string, type: SourceRef["type"] = "specialist", note?: string): SourceRef => ({
  url, name, type, accessedAt: new Date().toISOString(), note,
});

type Draft = Omit<Item, "readingMinutes" | "status" | "version" | "sample" | "publishedAt" | "format"> & {
  published: number;
  hour?: number;
};

export function make(format: Format, d: Draft): Item {
  const { published, hour, ...rest } = d;
  return {
    ...rest,
    format,
    readingMinutes: readingMinutes(d.body),
    publishedAt: daysAgo(published, hour),
    status: "published",
    version: 1,
    sample: true,
    caveats: [...(d.caveats ?? []), SAMPLE_NOTE],
  };
}
