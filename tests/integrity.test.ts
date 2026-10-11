import { describe, expect, it, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
// @ts-expect-error plain JS module without types
import { build } from "../scripts/sync-shared.mjs";
import { SAMPLE_ITEMS, SAMPLE_SERIES } from "@/data/sample";
import { ingest } from "@/lib/ingest-core";
import { parseBlocks, parseInline, excerpt } from "@/lib/markup";
import { parseSubreddits, analyseSubreddits, commitRedditSuggestions } from "@/lib/reddit";
import { seedState } from "@/lib/seed";
import { patchInterest } from "@/lib/ledger";

describe("sample content meets the editorial standard it demonstrates", () => {
  it("every sample item and series passes the same validation as live content", () => {
    const payload = {
      schemaVersion: 1, task: "sample-check", runId: "sample-check-1",
      series: SAMPLE_SERIES.map((s) => ({ ...s, motif: s.motif })),
      items: SAMPLE_ITEMS.map((i) => ({ ...i, stage: "approved" })),
    };
    const r = ingest(payload, { items: [], series: [] });
    if (!r.ok) throw new Error(r.errors.join("\n"));
    expect(r.outcome.result.rejected, JSON.stringify(r.outcome.result.rejected, null, 1)).toEqual([]);
  });
  it("has 15-20+ items covering all six formats, with a multi-chapter series", () => {
    expect(SAMPLE_ITEMS.length).toBeGreaterThanOrEqual(15);
    expect(new Set(SAMPLE_ITEMS.map((i) => i.format)).size).toBe(6);
    expect(SAMPLE_ITEMS.filter((i) => i.seriesId).length).toBeGreaterThanOrEqual(5);
  });
  it("labels every sample as a sample and never as live reporting", () => {
    expect(SAMPLE_ITEMS.every((i) => i.sample)).toBe(true);
    expect(SAMPLE_ITEMS.every((i) => i.body.toLowerCase().includes("sample"))).toBe(true);
  });
  it("series chapters are 450+ words and in order", () => {
    const chs = SAMPLE_ITEMS.filter((i) => i.seriesId).sort((a, b) => a.chapter! - b.chapter!);
    expect(chs.map((c) => c.chapter)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("markup is inert", () => {
  it("never produces anything but text, emphasis and http(s) links", () => {
    const inl = parseInline("Hello <img src=x onerror=alert(1)> [click](javascript:alert(1)) [ok](https://example.com) *em*");
    expect(inl.filter((x) => x.t === "link").map((x) => (x as { href: string }).href)).toEqual(["https://example.com"]);
    expect(inl.some((x) => (x as { v: string }).v?.includes("<img"))).toBe(true); // kept as text, so React escapes it
  });
  it("parses blocks, lists and interpretation lines", () => {
    const b = parseBlocks("Para\n\n## Head\n\n~ analysis here\n\n- a\n- b\n\n1. one\n2. two\n\n---");
    expect(b.map((x) => x.t)).toEqual(["p", "h", "interp", "ul", "ol", "hr"]);
  });
  it("makes a clean excerpt", () => {
    expect(excerpt("**Bold** [link](https://x.y) text. ".repeat(30), 10).endsWith("…")).toBe(true);
  });
});

describe("Reddit onboarding", () => {
  it("parses names in any shape", () => {
    expect(parseSubreddits("r/SpaceX, /r/watches\nhttps://www.reddit.com/r/design/ ")).toEqual(["spacex", "watches", "design"]);
    expect(parseSubreddits("spacex\nwatches design")).toEqual(["spacex", "watches", "design"]);
  });
  it("infers themes rather than copying subreddits, with confidence from corroboration", () => {
    const a = analyseSubreddits(["spacex", "rocketry", "watches", "totallyunknownsub"], seedState());
    const space = a.suggestions.find((s) => s.name === "Commercial spaceflight")!;
    const watches = a.suggestions.find((s) => s.name === "Mechanical watches")!;
    expect(space.subs.length).toBe(2);
    expect(space.confidence).toBeGreaterThan(watches.confidence);
    expect(a.unknown).toEqual(["totallyunknownsub"]);
    expect(a.suggestions.every((s) => !s.name.toLowerCase().startsWith("r/"))).toBe(true);
  });
  it("reads Reddit's own page format and never mistakes user links for subreddits", () => {
    const pasted = [
      "* [leave](https://old.reddit.com/subreddits/mine#)[space](https://old.reddit.com/r/space/)",
      "* [unfollow](https://old.reddit.com/subreddits/mine#)[u/Slynyrd](https://old.reddit.com/user/Slynyrd/)",
      "* [leave](https://old.reddit.com/subreddits/mine#)[Design](https://old.reddit.com/r/Design/)",
    ].join("\n");
    expect(parseSubreddits(pasted)).toEqual(["space", "design"]);
  });
  it("spreads priority across your subscriptions instead of calling everything High", () => {
    const a = analyseSubreddits(["design", "uxdesign", "typography", "space", "astronomy", "watches", "casio", "coys", "soccer", "aleague"], seedState());
    const weights = a.suggestions.map((s) => s.weight);
    expect(Math.max(...weights)).toBeLessThanOrEqual(0.8);
    expect(new Set(weights.map((w) => w.toFixed(2))).size).toBeGreaterThan(1);
  });
  it("leaves weak signals, gossip and politics unticked, and skips memes and celebrity communities", () => {
    const a = analyseSubreddits(["politics", "worldnews", "libertarian", "pixelart", "funny", "me_irl", "sydneysweeney"], seedState());
    expect(a.suggestions.find((s) => s.name === "Current affairs and politics")?.approved).toBe(false);
    expect(a.suggestions.find((s) => s.name === "Art and illustration")?.approved).toBe(false); // one community
    expect(a.ignored.sort()).toEqual(["funny", "me_irl", "sydneysweeney"]);
  });
  it("only merges into an existing interest by name or deliberate alias, never loose overlap", () => {
    const a = analyseSubreddits(["history", "todayilearned2", "gaming", "games", "fantasy", "asoiaf", "webdev"], seedState());
    expect(a.suggestions.find((s) => s.name === "History")?.mergeInto).toBeUndefined();
    expect(a.suggestions.find((s) => s.name === "Games and game design")?.mergeInto).toBeUndefined();
    expect(a.suggestions.find((s) => s.name === "Fantasy and science fiction")?.mergeInto).toBeUndefined();
  });
  it("leaves gossip unticked by default", () => {
    const a = analyseSubreddits(["celebritygossip", "popculturechat"], seedState());
    expect(a.suggestions[0].approved).toBe(false);
  });
  it("adds evidence to existing interests without touching explicit or locked settings", () => {
    let s = seedState();
    s = patchInterest(s, "mechanical-watches", { locked: true, weight: 0.33 }, "manual", "mine").state;
    const a = analyseSubreddits(["watches", "seiko", "design"], s);
    const r = commitRedditSuggestions(s, a.suggestions, ["watches", "seiko", "design"]);
    const w = r.state.interests.find((i) => i.id === "mechanical-watches")!;
    expect(w.weight).toBe(0.33);
    expect(w.locked).toBe(true);
    expect(w.evidence[0].type).toBe("reddit");
    expect(r.protectedCount).toBeGreaterThan(0);
    expect(r.state.redditImports).toHaveLength(1);
    // the import itself is logged as Reddit-originated, and it never reversed the reader's own lock
    expect(r.state.history[0].origin).toBe("reddit");
    expect(r.state.history.filter((h) => h.origin === "reddit" && /weight|status|locked/.test(h.property))).toEqual([]);
  });
  it("merges duplicates instead of creating a second interest", () => {
    const s = seedState();
    const a = analyseSubreddits(["spacex"], s);
    const r = commitRedditSuggestions(s, a.suggestions, ["spacex"]);
    expect(r.state.interests.filter((i) => /spaceflight/i.test(i.name))).toHaveLength(1);
    expect(r.merged).toBe(1);
  });
});

describe("privacy and authentication", () => {
  beforeEach(() => vi.resetModules());

  async function guard(env: Record<string, string | undefined>) {
    (globalThis as unknown as { Deno: unknown }).Deno = { env: { get: (k: string) => env[k] } };
    // @ts-expect-error Deno-style import path with extension
    return (await import("../supabase/functions/_lib/http.ts")).requireEditor as (r: Request) => Response | null;
  }
  const req = (auth?: string) => new Request("https://x.test/ingest", { headers: auth ? { authorization: auth } : {} });
  const TOKEN = "a-long-random-editor-token-0123456789";

  it("rejects requests with no token or the wrong token", async () => {
    const requireEditor = await guard({ INGEST_TOKEN: TOKEN });
    expect((requireEditor(req()))!.status).toBe(401);
    expect((requireEditor(req("Bearer nope")))!.status).toBe(401);
    expect((requireEditor(req(TOKEN)))!.status).toBe(401); // must be Bearer
    expect((requireEditor(req("Bearer " + TOKEN + "x")))!.status).toBe(401);
  });
  it("accepts the right token", async () => {
    const requireEditor = await guard({ INGEST_TOKEN: TOKEN });
    expect(requireEditor(req("Bearer " + TOKEN))).toBeNull();
  });
  it("fails closed when the token is unset or weak", async () => {
    expect((await guard({}))(req("Bearer anything"))!.status).toBe(500);
    expect((await guard({ INGEST_TOKEN: "short" }))(req("Bearer short"))!.status).toBe(500);
  });
  it("database: row level security on every table, no anon access, no content writes for the reader", () => {
    const sql = readFileSync(new URL("../supabase/migrations/0001_init.sql", import.meta.url), "utf8");
    const tables = [...sql.matchAll(/create table if not exists public\.(\w+)/g)].map((m) => m[1]);
    expect(tables.length).toBeGreaterThanOrEqual(6);
    for (const t of tables) expect(sql, t).toMatch(new RegExp(`alter table public\\.${t}\\s+enable row level security`));
    expect(sql).toMatch(/revoke all on all tables in schema public from anon/);
    // The reader may only read content: no insert/update/delete policy on items, series, jobs.
    for (const t of ["items", "series", "ingestion_jobs", "item_versions"]) {
      expect(sql, t).not.toMatch(new RegExp(`on public\\.${t}\\s+for (insert|update|delete|all)`));
    }
    // Every policy is gated on the owner check.
    const policies = sql.match(/create policy[^;]+;/g) ?? [];
    for (const p of policies) expect(p).toMatch(/is_owner\(\)/);
  });
  it("the browser bundle only ever references the public anon key", () => {
    const client = readFileSync(new URL("../src/lib/supabase.ts", import.meta.url), "utf8");
    expect(client).not.toMatch(/SERVICE_ROLE|INGEST_TOKEN/);
  });
});

describe("shared code for the edge functions", () => {
  it("supabase/functions/_shared is in sync with src/lib (run `npm run sync:functions`)", async () => {
    const expected = await build();
    for (const [path, content] of Object.entries(expected)) {
      expect(readFileSync(path, "utf8"), path).toBe(content);
    }
  });
});

describe("Reddit commit targets", () => {
  it("never adds evidence to an unrelated interest and creates the themes it suggested", () => {
    const s = seedState();
    const a = analyseSubreddits(["gaming", "games", "minecraft", "asoiaf", "fantasy", "worldbuilding"], s);
    const r = commitRedditSuggestions(s, a.suggestions.filter((x) => x.approved), []);
    expect(r.created).toBe(2);
    expect(r.merged).toBe(0);
    for (const i of r.state.interests.filter((x) => s.interests.some((b) => b.id === x.id))) {
      expect(i.evidence.length).toBe(s.interests.find((b) => b.id === i.id)!.evidence.length);
    }
  });
});
