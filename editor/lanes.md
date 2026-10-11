# Lanes: how the feed gets its volume

The feed needs **at least 20 new items, three times a day** (about 60 a day). One task can't do that well, so the work is split into four *lanes* that run in parallel in each of three daily slots (morning, midday, evening), plus News. Each lane run publishes **a batch of 5-6 short pieces** in its own territory. Lanes stay in their own territory so that parallel runs don't collide.

**Quota.** A lane run's job is to publish its batch. Unlike the other tasks, "publish nothing" is *not* the default here: if you can't find 5, keep looking (search more angles, widen to the lane's adjacent territory). Publish fewer only if you genuinely can't verify enough stories, and say why in the summary. Quality still beats volume: never fill the quota with weak or unverified pieces. Stop at 6.

**Shape of a batch piece** ("quick hit"):
- 250-450 words (`rabbit_hole` for evergreen oddities and stories; `update` for recent, dated developments; `explainer` for a crisp "how/why" at 350-500).
- Hook first, one vivid detail, a real joke or aside, a landing last line. No background section. See "It's a feed, not a textbook" in `_shared.md`.
- 2 sources minimum (one solid), put limits in `caveats`, not in the body.
- Mood mix inside a batch: at least 2 of the 5-6 must be properly light/funny/exciting; at most 1 should be heavy.
- Variety inside a batch: no two pieces on the same subject, and no more than 2 on the same interest.

**One payload per run.** Put all the batch's items in a single payload file (max 12 per payload), validate with `npm run validate -- inbox/<file>.json`, then submit. If some items are rejected, fix or replace just those and resubmit them in a second payload with a new `runId`.

**Dedupe is on you first.** Before researching, read `recentlyPublished` from the brief *and* list `inbox/` for payloads from the last 48 hours (other lanes run at the same time). Avoid every subject already covered. When researching, pick stories no other lane is likely to take (stay in your lane).

## The lanes

### Lane A: Minds, ideas and science
Philosophy, mind and consciousness, free will, meditation and contemplative research, psychology, neuroscience, ethics, big-picture science, medicine and how things work. The register of *Making Sense* and *Within Reason*: rigorous but gripping. Include a few mind-bending "wait, what?" pieces and a couple of funny ones (famous experiments gone wrong, thought experiments, scientists being human).

### Lane B: Delight, humour and sport
Funny, joyful, exciting, wholesome and gloriously odd true stories. Absurd events, bureaucratic comedy, spectacular failures and happy accidents, clever hacks and Easter eggs, great sporting moments and underdog tales (football, NRL, A-League, Spurs and Newcastle Jets are welcome), animals being animals, good news, pop-culture and internet-history curiosities. Most of this lane should be light.

### Lane C: History, art, design and technology
History (especially technical, overlooked and surprising), art and illustration, graphic and product design, typography, architecture and interiors, AI and product design, consumer tech, computing history, spaceflight, watches and engineering, games and game design (Nintendo and cosy games welcome), film and TV craft. Mix the heavy with the delightful.

### Lane D: Australia, food, nature and the wider world
Australian and local stories (Newcastle, Hunter, Maitland, NSW), Australian history and culture, food and cooking, nature and animals, travel and outdoors, music, books and writing, fantasy and sci-fi, buy-it-for-life and sustainable living, cars, whisky and BBQ, health and fitness, quirky true stories. Once a week or so, per `_shared.md` "Special topics", one careful, non-explicit piece of journalism or memoir about the adult film industry (never more than one in a batch, never in consecutive batches).

## Slots (local time)
Morning ~6:00, midday ~12:00, evening ~18:00. News and Developments runs separately three times a day for genuinely recent, material news only.
