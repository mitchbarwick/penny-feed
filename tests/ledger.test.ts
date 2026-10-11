import { describe, expect, it } from "vitest";
import { seedState } from "@/lib/seed";
import {
  addEvidence, applyFeedback, applySteering, createInterest, expireTemporary, findInterest, parseSteering,
  patchInterest, setPref, undoChange,
} from "@/lib/ledger";

const item = (topics: string[], headline = "A story") => ({ id: "i1", topics, headline });

describe("ledger overrides", () => {
  it("never lets behaviour change an explicit interest", () => {
    const s = seedState();
    const before = s.interests.find((i) => i.id === "ai-product-design")!;
    const r = applyFeedback(s, item(["AI and product design"]), "less");
    const after = r.state.interests.find((i) => i.id === "ai-product-design")!;
    expect(after.weight).toBe(before.weight);
    expect(r.message).toMatch(/set .* yourself|locked/i);
    // ...but the feedback is still recorded as evidence
    expect(after.evidence.length).toBe(before.evidence.length + 1);
  });
  it("never lets behaviour change a locked interest", () => {
    let s = seedState();
    s = patchInterest(s, "mechanical-watches", { locked: true }, "manual", "lock").state;
    const r = patchInterest(s, "mechanical-watches", { weight: 0.1 }, "feedback", "less like this");
    expect(r.blocked).toMatch(/locked/);
    expect(r.state.interests.find((i) => i.id === "mechanical-watches")!.weight).toBe(0.58);
  });
  it("moves an inferred interest in small steps on feedback, and records why", () => {
    const s = seedState();
    const r = applyFeedback(s, item(["Mechanical watches"], "Harrison's watch"), "more");
    const after = r.state.interests.find((i) => i.id === "mechanical-watches")!;
    expect(after.weight).toBeGreaterThan(0.58);
    expect(after.weight).toBeLessThan(0.75);
    expect(r.state.history[0].origin).toBe("feedback");
    expect(r.state.history[0].explanation).toMatch(/Harrison/);
  });
  it("a manual change always wins and makes the interest explicit", () => {
    const s = seedState();
    const r = patchInterest(s, "mechanical-watches", { weight: 0.95 }, "manual", "you did it");
    const after = r.state.interests.find((i) => i.id === "mechanical-watches")!;
    expect(after.weight).toBe(0.95);
    expect(after.origin).toBe("explicit");
  });
  it("evidence never changes weight or status of explicit interests", () => {
    const s = addEvidence(seedState(), "ai-product-design", { type: "reading", explanation: "read lots", confidence: 1 });
    const i = s.interests.find((x) => x.id === "ai-product-design")!;
    expect(i.weight).toBe(0.92);
    expect(i.confidence).toBe(1);
  });
  it("keeps the explicit exclusion from reappearing via passive activity", () => {
    const s = seedState();
    const r = applyFeedback(s, item(["Celebrity gossip"]), "more");
    const i = r.state.interests.find((x) => x.id === "celebrity-controversy")!;
    expect(i.status).toBe("excluded");
    expect(i.weight).toBe(0);
  });
  it("creates a tentative interest when you ask for more of something new", () => {
    const r = applyFeedback(seedState(), item(["Japanese joinery"]), "more");
    const i = findInterest(r.state.interests, "Japanese joinery")!;
    expect(i.origin).toBe("inferred");
    expect(i.confidence).toBeLessThan(0.6);
  });
});

describe("preference history", () => {
  it("records every change with previous and next values", () => {
    const s = setPref(seedState(), "discovery", 0.6, "manual", "you moved it", "Discovery");
    expect(s.history[0]).toMatchObject({ property: "prefs.discovery", previous: 0.25, next: 0.6, origin: "manual" });
  });
  it("undo restores the old value and adds a new line instead of erasing", () => {
    let s = setPref(seedState(), "discovery", 0.6, "manual", "x");
    const id = s.history[0].id;
    const r = undoChange(s, id);
    expect(r.ok).toBe(true);
    expect(r.state.prefs.discovery).toBe(0.25);
    expect(r.state.history).toHaveLength(2);
    expect(r.state.history.find((h) => h.id === id)!.reversedBy).toBeTruthy();
    expect(undoChange(r.state, id).ok).toBe(false); // can't reverse twice
  });
  it("undo of a created interest removes it; undo of an edit restores only that field", () => {
    let s = seedState();
    const c = createInterest(s, { name: "Bookbinding", origin: "explicit" }, "manual", "added");
    expect(undoChange(c.state, c.change.id).state.interests.find((i) => i.id === c.interest.id)).toBeUndefined();

    s = patchInterest(s, "mechanical-watches", { weight: 0.9 }, "manual", "up").state;
    s = patchInterest(s, "mechanical-watches", { description: "Edited" }, "manual", "desc").state;
    const weightChange = s.history.find((h) => h.property.endsWith(".weight"))!;
    const u = undoChange(s, weightChange.id).state.interests.find((i) => i.id === "mechanical-watches")!;
    expect(u.weight).toBe(0.58);
    expect(u.description).toBe("Edited"); // later, unrelated edit survives
  });
});

describe("conversational steering", () => {
  const interests = seedState().interests;

  it("turns 'enough AI news, more design history' into explicit proposals", () => {
    const p = parseSteering("I've had enough AI news recently. Show me more interesting design history.", interests);
    expect(p.map((x) => x.kind)).toEqual(["reduce", "boost"]);
    expect(p[0].topic).toBe("AI and product design");
    expect(p[1].topic).toBe("Design history");
    expect(p[0].forDays).toBeGreaterThan(0);
  });
  it("understands 'less X for a while' as a temporary change", () => {
    const p = parseSteering("Less financial news for a while.", interests);
    expect(p[0]).toMatchObject({ kind: "reduce" });
    expect(p[0].forDays).toBeDefined();
  });
  it("applies changes, shows what changed, and the change is reversible", () => {
    const s0 = seedState();
    const text = "I want to learn more about Japanese joinery.";
    const p = parseSteering(text, s0.interests);
    const r = applySteering(s0, p, text);
    expect(r.summary[0]).toMatch(/joinery/i);
    expect(r.state.history[0].origin).toBe("steering");
    const added = r.state.interests.find((i) => /joinery/i.test(i.name));
    expect(added?.origin).toBe("explicit");
    expect(r.state.feedback[0].type).toBe("reader-request"); // the editor sees it too
  });
  it("exclusions are locked and added to the always-excluded list", () => {
    const s0 = seedState();
    const text = "Never show me cryptocurrency.";
    const r = applySteering(s0, parseSteering(text, s0.interests), text);
    const i = r.state.interests.find((x) => /cryptocurrency/i.test(x.name))!;
    expect(i.status).toBe("excluded");
    expect(i.locked).toBe(true);
    expect(r.state.prefs.excludedTopics.some((t) => /cryptocurrency/i.test(t))).toBe(true);
  });
  it("temporary changes revert on schedule", () => {
    const s0 = seedState();
    const text = "Less AI for a while";
    const r = applySteering(s0, parseSteering(text, s0.interests), text);
    const i = r.state.interests.find((x) => x.id === "ai-product-design")!;
    expect(i.weight).toBeLessThanOrEqual(0.2);
    expect(i.until).toBeTruthy();
    const later = expireTemporary(r.state, new Date(Date.now() + 30 * 86_400_000));
    const back = later.interests.find((x) => x.id === "ai-product-design")!;
    expect(back.weight).toBe(0.92);
    expect(back.until).toBeUndefined();
  });
  it("hands anything it can't parse to the editor without touching the ledger", () => {
    expect(parseSteering("hmm, surprise me with something good", interests)).toEqual([]);
  });
});
