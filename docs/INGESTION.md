# Ingestion

How the editor publishes into the feed. The schema lives in code ([`src/lib/ingest-schema.ts`](../src/lib/ingest-schema.ts)); this page is the human version.

## Endpoint

`POST {SUPABASE_URL}/functions/v1/ingest`
`Authorization: Bearer <INGEST_TOKEN>` · `Content-Type: application/json` · max 2 MB

Companion: `GET …/functions/v1/brief` (same auth) returns the editor's brief.

## Payload (schema version 1)

```jsonc
{
  "schemaVersion": 1,
  "task": "daily-discovery",
  "runId": "daily-discovery-2026-10-12-1",   // idempotency key for the whole submission
  "items": [{
    "id": "voyager-1-memory-fix",             // stable slug; reuse to update
    "format": "update",                        // update|explainer|rabbit_hole|deep_dive|series_chapter|circle
    "headline": "Voyager 1 was fixed from more than twenty light-hours away",
    "dek": "optional one-line subtitle",
    "body": "Markup: paragraphs, ## headings, > quotes, ~ analysis, - bullets, 1. lists, *em*, **b**, [x](https://…)",
    "topics": ["Space exploration", "Engineering"],
    "timeliness": "current",                   // current | evergreen
    "eventDate": "2024-04-20T00:00:00Z",       // optional
    "significance": 0.7,                       // 0-1, honest
    "reason": "Why this is here, in Penny's voice.",
    "sources": [{ "url": "https://…", "name": "NASA", "type": "official", "accessedAt": "2026-10-12T06:30:00Z", "note": "optional" }],
    "caveats": ["anything needing qualification"],
    "discoveredVia": "web",                    // web|inbox|reddit|social|reader-request
    "stage": "approved"                        // drafted|validated|approved; only approved publishes
  }],
  "series": [{ "id": "…", "title": "…", "description": "…", "subject": "…", "topics": ["…"],
    "motif": "window", "researchStatus": "ready", "totalChapters": 5, "outline": ["…"], "sources": [] }],
  "corrections": [{ "itemId": "voyager-1-memory-fix", "note": "The fault was in the flight data subsystem, not the memory of the attitude computer." }],
  "archive": ["item-id-to-withdraw"]
}
```

Series chapters are items with `format: "series_chapter"`, `seriesId`, `chapter`, optional `recap`. Series pitches are `series` entries with `researchStatus: "pitched"` and no chapters.

## What the endpoint does

1. Checks the token (constant-time; fails closed if the server token is unset or weak).
2. Validates the schema. A malformed payload is rejected **whole** (HTTP 422), writing nothing.
3. Applies editorial checks per item. An item that fails is rejected with reasons; the others still publish:
   no sources · not `approved` · wrong length for its format · excluded topic · script-like or instruction-like text · deep dive without fact/analysis separation · circle item too long or without a person · near-duplicate headline (≥ 0.82 trigram similarity) · identical source set · duplicate series chapter · chapter beyond series length · chapter of a series not fully researched.
4. Upserts accepted items in one statement (a half-written item can't appear), keeping every version in `item_versions`.
5. Records the run in `ingestion_jobs` (visible in Settings → Scheduled-task health).

Re-sending the same `runId` returns the stored result with `"idempotentReplay": true` and writes nothing. A run that *crashed* releases its `runId`, so retrying is safe. A run with rejected items should be fixed and resubmitted under a **new** `runId`.

Unchanged re-submissions (`same id, same content`) report `unchanged`. Changed ones become `updated` with `version + 1` and the **original publication date preserved**. Corrections add a visible note and set `status: corrected`; nothing is rewritten silently.

## Response

```json
{ "ok": true, "runId": "…",
  "accepted": [{ "id": "…", "action": "created|updated|unchanged" }],
  "rejected": [{ "id": "…", "reasons": ["no source references"] }],
  "seriesAccepted": [], "corrected": [], "archived": [], "warnings": [] }
```

Errors: `401` bad token · `400` bad JSON/runId · `413` too large · `422` invalid payload (with `errors`) · `500` server error (retry same `runId`).

## Bridges

| Situation | Use |
|---|---|
| Task can run Node and reach the internet | `node scripts/ingest-file.mjs payload.json` |
| Task can run `curl` | see `editor/_shared.md` |
| Check a payload without sending it | `npm run validate -- payload.json` |
| Task can't reach the network | write `inbox/<task>-<date>.json`; load it in Settings → Ingestion |
| Demo mode (no Supabase) | paste into Settings → Ingestion; same validation and dedupe |
