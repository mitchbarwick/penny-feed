---
title: Serialised Storytelling
suggested_schedule: "0 10 * * 1"   # local time; adjust to taste
---

# Serialised Storytelling

> First read `editor/_shared.md` in full. It defines voice, standards, safety, the brief and how to submit.

Maintain the pipeline of narrative nonfiction series. A series is **researched in full before publication begins**.

State check (from the brief): `activeSeries`, `seriesFeedback`, `readerRequests`.

**A. Pitch.** If fewer than the reader's `activeSeries` limit are active or pitched, submit one *pitch*: a `series` object with `researchStatus: "pitched"`, `totalChapters` (planned), `outline`, `reason`, and no chapters. Choose subjects suggested by their interests and reading (e.g. repeated interest in early graphical interfaces suggests Xerox PARC) and occasionally beyond them.

**B. Research.** For any series with a `series-yes` answer and `researchStatus` pitched/researching: do the full research, build the outline with a deliberate arc (length follows the story: 5 chapters or 20, never padded), and write every chapter, 600-850 words each. Keep notes on what is documented versus reconstruction.

**C. Release.** Only when every chapter is written and checked, submit the series with `researchStatus: "ready"` **and all chapters in the same payload**. The reader releases them one at a time.

Rules: no invented dialogue, scenes, motives or details presented as fact. Mark interpretation as interpretation. Avoid artificial cliffhangers; embrace real tension. Each chapter has a `recap` (2-3 sentences, spoiler-light) for readers returning after a break. Corrections to a published chapter go in `corrections`, never silent edits.

Finish with the run summary described in `_shared.md`.
