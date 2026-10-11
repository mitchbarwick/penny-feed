# Architecture decisions

Short records of choices that shaped the build, with the trade-off.

**1. Static Next.js on GitHub Pages + Supabase.** You wanted GitHub hosting; Pages is static-only, so anything dynamic (database, ingestion, auth) lives in Supabase. `output: "export"` means no Next server, no API routes. *Cost:* no server-side rendering of private content, which is fine since the content is private anyway. *Alternative considered:* Vercel + Supabase (richer Next features, not needed).

**2. Query-string routes (`/read/?id=…`) instead of dynamic segments.** Content is dynamic and unknown at build time; static export can't pre-render unknown ids. One shell page per view, id in the query.

**3. Demo mode is a first-class path.** With no env vars the app runs on bundled samples and localStorage. That kept Phase 1 independent of any account, and makes everything testable offline. Supabase is layered on, not required.

**4. Personal state as five JSON documents, content as real tables.** Content (`items`, `series`) is relational because the editor and the reader both query it. The ledger, preferences, history, progress and feedback are only ever read as a whole by one person, so they're `state` rows (`interests`, `prefs`, `history`, `reader`, `feedback`). *Why five and not one:* a phone's progress write must never overwrite a laptop's ledger edit. *Cost:* last write wins within a document; acceptable for one reader.

**5. The ledger is code, not a model.** Weights, locks, origin, evidence and history are explicit data with pure functions (`src/lib/ledger.ts`). Rule: behaviour may add evidence; only the reader (manual or steering) may change values; locked items never change; explicit beats inferred. Every change is a history entry with an undo snapshot; undoing adds a line rather than deleting one.

**6. Steering is a rule-based parser with a preview step.** No LLM in the browser. It handles the common phrasings (less/more/enough/never/for a while/shorter/longer), shows exactly what it would change, and applies only on confirmation. Anything it can't parse is passed to the editor verbatim as a request, which *can* interpret it. *Limit:* it's literal; unusual phrasing falls through to the editor.

**7. Ranking is a small weighted sum plus sequencing, not a model.** `rank()` scores relevance, significance, novelty, timeliness and format appetite; series continuity and circle importance add bonuses; sequencing then repairs diversity and inserts discovery at a steady cadence. No engagement signals feed it. Every entry carries a human-readable reason and signal list.

**8. Feed stability via a persisted snapshot.** The order you've been shown is stored. New stories merge in beneath the next five unread items; preference changes re-rank only what's below that. Items you read this session stay (dimmed) until next time.

**9. Only the next unread chapter is ever eligible.** Later chapters are inert until earlier ones are read; a deep link to a later chapter shows a gentle "chapter N first". Chapters are published together and released one at a time by the reader, so a series can't be left half-written.

**10. One validation core, three consumers.** `ingest-core.ts` is called by the edge function, the in-app importer and the tests. `scripts/sync-shared.mjs` copies it into `supabase/functions/_shared` with Deno-style imports; a test fails on drift.

**11. Editor never holds database credentials.** It holds a revocable bearer token for two narrow endpoints. The service-role key lives only in the Supabase function runtime. The reader's browser can read content but has no write policy on `items`/`series` at all.

**12. Owner table, not just "authenticated".** RLS policies require `is_owner()`, a row in `app_owner`. Even if sign-ups were accidentally re-enabled, a stranger would see nothing.

**13. Sample content is dated relative to "now".** It stays fresh in the demo, flagged `sample`, and is shown with a banner. Sample items pass the same validator as live ones (tested), so they're honest examples of the standard.

**14. Penny's voice, filtered.** UI microcopy and editorial reasons use Penny's warm, cheeky register. Published articles use an editorial subset: no innuendo, minimal emoji, restrained in series. Documented in `editor/_shared.md`.

**15. Deliberately not built.** Notifications, streaks, unread badges, counts of any kind, reactions, public metrics, comments, onboarding gamification. The brief's "respect for attention" is enforced by omission.

**16. Deployed edge functions are bundles, not the repo layout.** The Supabase connector deploys a flat set of files, so the live `ingest` ships `_shared/` inside the function folder (same code as `src/lib`, verified by the same tests). The live `brief` is a compact, self-contained build of `src/lib/brief.ts` (same output shape) to avoid shipping the ledger and ranking code to the edge. If you deploy with the CLI instead (`supabase functions deploy`), the repo layout works as-is.
