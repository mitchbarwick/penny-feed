# Penny Feed

A private, AI-curated reading app: a personal magazine written and edited for one reader, with no ads, no engagement mechanics and no outrage. Claude researches and writes; this app is the quiet place you read it.

Written in Penny's voice. Built as a mobile-first PWA: static Next.js on GitHub Pages, Supabase for data, Claude scheduled tasks as the editorial staff.

> **Status:** the reader is built and works today in local demo mode. The cloud backend, ingestion API and editor prompts are written and tested at the logic level, but **have not yet been deployed or run end to end.** See [What's done and what isn't](#whats-done-and-what-isnt).

## Run it locally (no accounts needed)

```bash
npm install
npm run dev        # http://localhost:3000
```

With no `.env`, the app runs in **demo mode**: sample stories (clearly labelled), and everything you do (reading progress, ledger, preferences) is saved in this browser. You can already try the Interest Ledger, steering, Reddit import, saving, series reading, and pasting an ingestion payload under Settings.

```bash
npm test           # logic tests: ingestion, ledger, feed, privacy
npm run typecheck
npm run build      # static export to ./out
```

## Using it on your iPhone

Deploy it (see [docs/DEPLOY.md](docs/DEPLOY.md)), open the URL in Safari, then Share → **Add to Home Screen**. It launches full-screen, remembers where you were, and keeps working offline for what you've already loaded.

## How it fits together

```
 Claude scheduled tasks (the editor)            GitHub Pages (the reader)
 editor/*.md prompts                            static Next.js PWA
   │  1. GET  /functions/v1/brief  ───────────────┐        │ signs in (Supabase Auth)
   │  2. research + write                         │        │ reads items/series
   │  3. POST /functions/v1/ingest ──► validate ──┼──► Supabase Postgres ◄── reads/writes
   ▼        (bearer token)           dedupe       │     items · series · state · ingestion_jobs
 never holds DB credentials                       └─ ledger, preferences, requests
```

- **Reader** (`src/`): feed, reader, library, Your World (ledger, steering, people, Reddit, history), settings.
- **Editor** (`editor/`): eight reusable task prompts plus one shared set of standing instructions.
- **Ingestion** (`supabase/functions/ingest`): validates schema and editorial rules, de-duplicates, is idempotent per `runId`, keeps every version.
- **Brief** (`supabase/functions/brief`): hands the editor your ledger, exclusions, requests and what's already published.

The feed works fully without the editor running: it only ever shows what's already published.

## What's done and what isn't

| Area | State |
|---|---|
| Reading experience, six formats, series reader, themes, PWA shell | **Done**, visually checked on mobile and desktop widths |
| 21 sample items + a 5-chapter sample series (all labelled sample) | **Done** |
| Interest Ledger: locks, explicit-beats-inferred, history, undo, evidence | **Done**, tested |
| Steering in plain English, with preview and undo | **Done** (rule-based parser, tested) |
| Feed ranking: relevance, significance, novelty, time, diversity, discovery, circle, series continuity; stable order | **Done**, tested |
| Reading persistence: scroll position, progress, saved, series chapter progress | **Done** |
| Reddit paste import → suggested ledger entries → review | **Done** (built-in subreddit-to-theme map; unknown communities are flagged, not guessed) |
| People Ledger UI | **Done** |
| Ingestion logic (validation, dedupe, corrections, archive, series rules) | **Done**, tested; same code runs in the edge function |
| Supabase schema, RLS, edge functions, auth gate | **Written; not deployed or run** |
| Cloud sync of state | **Written; untested against a real project** |
| Editor task prompts | **Written; no scheduled task has been created or run** |
| Gmail (Inbox Discovery) | **Prompt written; connection not set up.** See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) |
| Social Radar | **Prompt written; no sources connected** (notification-email route recommended) |
| Narrative memory (connections to past reading) | Partial: the editor sees what you've read; no separate memory store (by design, v1) |
| Playwright/automated mobile layout tests | **Not built.** Layouts were checked by hand in a browser |
| Push notifications | **Deliberately not built** (no pressure to return) |

## Project map

```
src/app/            pages: feed, read, series, library, world, settings
src/components/     FeedCard, Prose, Sources, Doodle (illustration set), world/* panels
src/lib/            pure logic: ledger, curation, ingest-core/schema, reddit, brief, store
src/data/           sample content
editor/             scheduled-task prompts (+ _shared.md standing instructions)
supabase/           migration, edge functions (_shared is generated: npm run sync:functions)
docs/               DEPLOY, INGESTION, INTEGRATIONS, DECISIONS
tests/              vitest suites
```

## Environment variables

See [.env.example](.env.example). The two `NEXT_PUBLIC_*` Supabase values are public by design and protected by auth + RLS. The ingest token and service-role key never go in the browser or the repo.

## Editing shared code

`src/lib` modules used by the edge functions are copied to `supabase/functions/_shared` with Deno-style imports. After changing them run `npm run sync:functions`; a test fails if they drift.
