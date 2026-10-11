import { describe, expect, it } from "vitest";
import { seedState } from "@/lib/seed";
import { mergeSnapshot, rank, seriesProgress, activeSeries } from "@/lib/curation";
import { SAMPLE_ITEMS, SAMPLE_SERIES } from "@/data/sample";
import { patchInterest, setPref } from "@/lib/ledger";
import { buildBrief } from "@/lib/brief";
import { toDocs, fromDocs } from "@/lib/docs";
import type { AppState } from "@/lib/types";

const MAC = "sample-making-of-the-macintosh";
const ch = (n: number) => `${MAC}-ch${n}`;

function started(s: AppState): AppState {
  return { ...s, seriesStarted: { [MAC]: new Date().toISOString() } };
}
function read(s: AppState, ...ids: string[]): AppState {
  const progress = { ...s.progress };
  for (const id of ids) progress[id] = { itemId: id, status: "read", position: 1, lastOpened: new Date().toISOString(), completedAt: new Date().toISOString() };
  return { ...s, progress };
}
const keys = (s: AppState) => rank(s, SAMPLE_ITEMS, SAMPLE_SERIES).map((e) => e.key);

describe("series ordering and continuity", () => {
  it("shows no chapters until the series is started", () => {
    expect(keys(seedState()).filter((k) => k.startsWith(MAC))).toEqual([]);
  });
  it("offers the series as a pitch before it's started", () => {
    expect(keys(seedState())).toContain(`pitch:${MAC}`);
  });
  it("shows only the next unread chapter, never a later one", () => {
    const s = started(seedState());
    expect(keys(s).filter((k) => k.startsWith(MAC))).toEqual([ch(1)]);
    const s2 = read(s, ch(1));
    expect(keys(s2).filter((k) => k.startsWith(MAC))).toEqual([ch(2)]);
    const s3 = read(s2, ch(2), ch(3));
    expect(keys(s3).filter((k) => k.startsWith(MAC))).toEqual([ch(4)]);
  });
  it("tracks progress precisely, and completes only after every chapter is read", () => {
    const series = SAMPLE_SERIES.find((x) => x.id === MAC)!;
    let s = started(seedState());
    expect(seriesProgress(s, series, SAMPLE_ITEMS).read).toBe(0);
    s = read(s, ch(1), ch(2), ch(3), ch(4));
    const mid = seriesProgress(s, series, SAMPLE_ITEMS);
    expect(mid.read).toBe(4);
    expect(mid.complete).toBe(false);
    expect(mid.next?.id).toBe(ch(5));
    s = read(s, ch(5));
    expect(seriesProgress(s, series, SAMPLE_ITEMS).complete).toBe(true);
    expect(keys(s).filter((k) => k.startsWith(MAC))).toEqual([]);
    expect(activeSeries(s, SAMPLE_SERIES, SAMPLE_ITEMS)).toEqual([]);
  });
  it("respects the active-series limit", () => {
    const other = { ...SAMPLE_SERIES[1], researchStatus: "ready" as const };
    const s = setPref({ ...started(seedState()), seriesStarted: { [MAC]: "2026-01-01T00:00:00Z", [other.id]: "2026-01-02T00:00:00Z" } }, "activeSeries", 1, "manual", "x");
    expect(activeSeries(s, [SAMPLE_SERIES[0], other], SAMPLE_ITEMS).length).toBe(2);
  });
});

describe("what the feed leaves out", () => {
  it("hides anything on an excluded or muted subject", () => {
    let s = seedState();
    s = patchInterest(s, "commercial-spaceflight", { status: "muted" }, "manual", "mute").state;
    const shown = rank(s, SAMPLE_ITEMS, SAMPLE_SERIES).flatMap((e) => (e.item ? [e.item] : []));
    expect(shown.some((i) => i.topics.includes("Commercial spaceflight"))).toBe(false);
    expect(shown.length).toBeGreaterThan(5);
  });
  it("drops dismissed and read standalone items", () => {
    let s = seedState();
    s = { ...s, dismissed: ["sample-starship-catch"] };
    s = read(s, "sample-voyager-fix");
    const k = keys(s);
    expect(k).not.toContain("sample-starship-catch");
    expect(k).not.toContain("sample-voyager-fix");
  });
  it("gives every entry an understandable reason", () => {
    for (const e of rank(seedState(), SAMPLE_ITEMS, SAMPLE_SERIES)) expect(e.reason.length).toBeGreaterThan(10);
  });
});

describe("ranking responds to the ledger", () => {
  it("raising an interest moves its stories up; lowering moves them down", () => {
    const base = keys(seedState());
    const pos = (ks: string[], id: string) => ks.indexOf(id);
    let up = patchInterest(seedState(), "mechanical-watches", { weight: 1 }, "manual", "up").state;
    let down = patchInterest(seedState(), "mechanical-watches", { weight: 0.1 }, "manual", "down").state;
    expect(pos(keys(up), "sample-harrison-h4")).toBeLessThanOrEqual(pos(base, "sample-harrison-h4"));
    expect(pos(keys(down), "sample-harrison-h4")).toBeGreaterThanOrEqual(pos(base, "sample-harrison-h4"));
  });
  it("avoids long runs of the same subject", () => {
    const ks = rank(seedState(), SAMPLE_ITEMS, SAMPLE_SERIES).slice(0, 8).map((e) => e.item?.topics[0] ?? "pitch");
    for (let i = 3; i < ks.length; i++) expect(new Set(ks.slice(i - 3, i + 1)).size).toBeGreaterThan(1);
  });
  it("keeps some discovery in the mix", () => {
    const ranked = rank(seedState(), SAMPLE_ITEMS, SAMPLE_SERIES);
    expect(ranked.some((e) => e.discovery)).toBe(true);
  });
});

describe("feed stability", () => {
  const ranked = rank(seedState(), SAMPLE_ITEMS, SAMPLE_SERIES);
  const order = ranked.map((r) => r.key);

  it("starts from the ranked order when nothing has been shown", () => {
    expect(mergeSnapshot([], ranked, undefined).order).toEqual(order);
  });
  it("never rearranges what the reader has already passed, or the next few items", () => {
    const snapshot = order.slice(0, 10);
    const anchor = snapshot[3];
    const merged = mergeSnapshot(snapshot, ranked, anchor).order;
    expect(merged.slice(0, 9)).toEqual(snapshot.slice(0, 9)); // head + next five
    expect(new Set(merged)).toEqual(new Set(order));
  });
  it("settles new stories in beneath, and reports how many", () => {
    const withoutLast = ranked.slice(0, -2);
    const snapshot = withoutLast.map((r) => r.key);
    const r = mergeSnapshot(snapshot, ranked, snapshot[2]);
    expect(r.fresh).toBe(2);
    expect(r.order.slice(0, 8)).toEqual(snapshot.slice(0, 8));
  });
  it("drops items that are no longer eligible, but keeps those read this session", () => {
    const snapshot = [...order.slice(0, 4), "gone-item"];
    expect(mergeSnapshot(snapshot, ranked, undefined).order).not.toContain("gone-item");
    expect(mergeSnapshot(snapshot, ranked, undefined, new Set(["gone-item"])).order).toContain("gone-item");
  });
});

describe("persistence and the editor's brief", () => {
  it("round-trips the reader's state through the synced documents", () => {
    let s = read(started(seedState()), ch(1));
    s = { ...s, saved: ["sample-starship-catch"], followed: ["Mechanical watches"] };
    s = patchInterest(s, "mechanical-watches", { weight: 0.9 }, "manual", "x").state;
    const back = fromDocs(seedState(), JSON.parse(JSON.stringify(toDocs(s))));
    expect(back.progress[ch(1)].status).toBe("read");
    expect(back.saved).toEqual(["sample-starship-catch"]);
    expect(back.seriesStarted[MAC]).toBeTruthy();
    expect(back.interests.find((i) => i.id === "mechanical-watches")!.weight).toBe(0.9);
    expect(back.history).toHaveLength(1);
  });
  it("hands the editor exclusions, requests, and what's already published", () => {
    const s: AppState = { ...seedState(), feedback: [{ id: "f", type: "reader-request", reason: "More design history please", at: new Date().toISOString(), resulted: [] }] };
    const b = buildBrief(s, SAMPLE_ITEMS, SAMPLE_SERIES);
    expect(b.exclusions.topics).toContain("Celebrity controversy");
    expect(b.readerRequests[0].text).toMatch(/design history/);
    expect(b.recentlyPublished.length).toBeGreaterThan(10);
    expect(b.interests.find((i) => i.name === "AI and product design")).toMatchObject({ origin: "explicit", priority: "High" });
  });
});
