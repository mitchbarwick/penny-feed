# Integrations: what's verified, what isn't

The brief asks not to assume that a connection in one Claude environment exists in another. This is the honest state, as of building.

## Scheduled tasks

**Verified (from the Claude desktop app's task tooling in this environment):**
- Tasks are stored as `SKILL.md` files under `C:\Users\mitch\.claude\scheduled-tasks\<taskId>\`, with a cron schedule in **local time**.
- Each run starts with **no memory** of any conversation, so the prompts must be self-contained. The files in `editor/` are written that way: each tells the run to read `editor/_shared.md` first.
- Tasks run **while the desktop app is open**; if it was closed at the due time, they run at next launch. This means the feed's freshness depends on your PC being on. That's acceptable for a reading app, and the reader never breaks when the editor is quiet.
- You already run ~19 tasks this way (see `Documents\personal-ai\scheduled-tasks`).

**Not yet verified. Do these before trusting anything:**
1. Can a scheduled run reach the internet and run shell commands (`curl` or `node`) to POST to the endpoint? Create the Feed Refresh task, press **Run now** once, and read the summary. If it can't, the `inbox/` file bridge exists for exactly this.
2. Do the env vars exist in the task's shell? Scheduled tasks don't inherit your terminal. Either put `PENNY_INGEST_URL`/`PENNY_INGEST_TOKEN`/`PENNY_BRIEF_URL` in a local file the prompt reads (kept out of the repo, e.g. `C:\Users\mitch\Documents\personal-ai\penny-feed.env`) and mention its path in the task prompt, or paste them into the prompt (less good: the token is then stored in the task file).

I have **not** created any scheduled tasks. They're persistent, outward-facing configuration, so that's your call. To install one: in Claude, ask it to create a scheduled task using `editor/01-daily-discovery.md` (the Feed Refresh prompt) as the prompt body, with the suggested cron. Start with just Feed Refresh (`01`, three times a day, ~20 items a run) and Editorial Review and watch a few runs.

## Gmail (Inbox Discovery)

This session has a Gmail connector with read and write tools (including send, label, trash). **The Inbox Discovery prompt forbids everything except search and read**, but a prompt is a policy, not a lock. For genuine least privilege:

- Prefer a connector or OAuth client that grants **`gmail.readonly` only**. If the connector you use also exposes send/modify tools, the task still *can* call them, so keep the prompt's prohibition and review early runs.
- Restrict scope with a Gmail **label** (e.g. `penny-feed`) applied by a filter to the newsletters you want read, then put that label in Your World → Sources → Approved Gmail labels. The task refuses to run without one.
- Whether a *scheduled task* can use the same Gmail connector as an interactive session is **unverified**. Check by running the task once. If it can't, options are a small separate ingestion worker (Gmail API, `gmail.readonly`, label-scoped, posting to the same `/ingest` endpoint) or Gmail forwarding rules to a dedicated mailbox.
- Data minimisation: the prompt never stores bodies; an item keeps the original article link plus a short newsletter note.
- To disconnect: revoke the connector in Claude settings and Google's third-party access page; delete items with `discoveredVia = 'inbox'` if you want them gone.

## Social Radar and the People Ledger

Platforms like LinkedIn and Facebook restrict automated access and logged-in scraping. This project does **not** attempt it. Recommended, in order:
1. **Notification emails** ("X started a new position", "X has a birthday"…) forwarded or labelled into the approved label. Reliable and permitted.
2. **Public personal sites, blogs, RSS** you list under a person's "places I'm allowed to look".
3. **You paste a link** to a post: tell the editor in Your World → Tell me, or add it to the person's profile list.

If none are available for someone, Social Radar skips them and says so.

## Reddit

Onboarding uses paste-in subscriptions only (no API). Ongoing discovery from Reddit, if any, is a pointer to primary sources, never evidence, and never imports comments or rankings.
