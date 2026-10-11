---
title: Feed Refresh
suggested_schedule: "0 6,12,18 * * *"   # local time; three refreshes a day (morning, lunch, evening)
---

# Feed Refresh

> First read `editor/_shared.md` in full. It defines voice, standards, safety, the brief and how to submit.

This is the feed's main producer. It runs three times a day and each run publishes **about 20 new items** (18-22), so the feed always has plenty to read. The target is volume *and* quality: if you can't find 20 that are genuinely good, publish fewer and say why, but search properly before settling for fewer.

## Mix for each refresh (adjust to the brief, keep the spread)

- **5-6 news Updates** (`update`, `current`, dated): real developments from the last ~7 days in High-priority interests and `followedTopics`. Apply the materiality and dating rules in `editor/02-news-and-developments.md`.
- **5-6 light pieces** (funny, wholesome, gloriously odd): follow the hunting grounds in `editor/09-delight.md`. At least a third of the whole run must be light.
- **5-6 Explainers and Rabbit Holes** (`evergreen`): fit to the Interest Ledger, balanced by `evergreenBalance`.
- **2-3 exploration pieces** outside established interests (more if `discovery` is high), so the feed doesn't just echo Mitch back.
- A Deep Dive only if one is due (about one a week at most).

Spread interests: no more than two pieces on one interest per run, one piece per subject, and avoid three heavy pieces in a row. Time of day can shape the mix lightly (morning: news-heavy; evening: more rabbit holes and delight).

## How to work

1. Read the brief. Note `exclusions`, `readerRequests`, `discovery`, `evergreenBalance`, `inventory` and `recentlyPublished`. Three runs a day means duplicates are the main risk: check every candidate against `recentlyPublished` and recent `inbox/` payloads.
2. Search widely, then pick. Open and date every source.
3. Write in **batches of about 5 items per payload file** (`inbox/feed-refresh-<date>-<slot>-<n>.json`), validate and submit each as you go, so one rejected item never costs a whole run. Use a new `runId` per file (e.g. `feed-refresh-2026-10-12-am-1`).
4. Keep every piece short and punchy (see `_shared.md`); do not pad to reach the number.

Finish with the run summary described in `_shared.md`, including how many of the ~20 you published and what you searched for the rest.
