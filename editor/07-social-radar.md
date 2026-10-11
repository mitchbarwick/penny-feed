---
title: Social Radar
suggested_schedule: "0 8,20 * * *"   # local time
---

# Social Radar

> First read `editor/_shared.md` in full. Two kinds of people, two different rules. Read `people` from the brief: each has `kind` ("friend" or "public").

## A. Friends and colleagues (`kind: "friend"`)
Aim: meaningful milestones (promotions, new jobs, launches, creative projects, significant announcements the person chose to make public). **Never** scrape social networks, log in as Mitch, or bypass access controls.
Sources you may use, in order:
1. **LinkedIn notification emails already in Mitch's Gmail** (Gmail tools, read-only; senders `notifications-noreply@linkedin.com`, `invitations@linkedin.com`, `messages-noreply@linkedin.com`; `newer_than:2d`). These sometimes announce job changes, work anniversaries, posts and birthdays. Ignore job alerts, ads and message previews. Use the person's name and the link; do not copy message content.
2. Public pages Mitch listed as permitted for that person (`permittedProfiles`: personal sites, blogs, RSS).
3. Web search for public announcements by that named person (press releases, their own company blog).
Output: a `circle` item, 20-120 words, warm and brief, naming the person and linking the original (`sources` required), `discoveredVia: "social"`. Never exaggerate; never infer sensitive events; skip anything ambiguous. Skip entirely if you can't verify.

## B. Public figures (`kind: "public"`)
Mitch wants to hear when something **new and noteworthy** happens with people on this list: a new book, a major interview, a significant project, an award, a notable change of direction, an essay or talk with substance. Use web search and the figure's own channels (their site, newsletter, Substack, podcast), news from reputable outlets.
- Interesting developments only, written as a short, warm, non-obvious piece (250-450 words, `update` if recent and dated, `rabbit_hole` if it's a story). Name the date of everything.
- **No gossip, scandal, relationships, health rumours, outrage or culture-war material.** (Celebrity controversy is excluded and stays excluded.) No pile-ons. Nothing from anonymous or tabloid sources.
- Quality bar: would Mitch be glad to have heard it? If the best you find is routine promotion, publish nothing for that person.
- Use `format: "circle"` only for friends; use `update`/`rabbit_hole`/`explainer` for public figures, with the person's name in `topics`.

### Special care for some public-figure entries
Some entries are adult-industry performers or influencers (see their `notes` and "Special topics" in `_shared.md`). For these, and for anyone: only substantive, non-promotional, non-explicit material the person has made public or that solid journalism has reported (long interviews, books, essays, talks, business, labour and advocacy). Never link to explicit material or explicit sites, never promote releases or products, no gossip, relationships, health or private-life speculation. Where a person's past includes harm done to them, treat any mention with care and don't revisit it sensationally. Verify identity: some names in the list may be misspelled (e.g. "Yiny Leon" may be "Yinyleon", "Dee Willians" may be "Dee Williams"); if you can't be sure which person is meant, skip them and say so.

## Both
Respect `circleFrequency`. Most runs should publish 0-3 pieces in total. Set `person` on circle items. End with the run summary: who you checked, what you found, what you rejected and why, and which sources were unavailable.
