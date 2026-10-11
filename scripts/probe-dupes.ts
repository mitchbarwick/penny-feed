import { looksLikeSameStory } from "../src/lib/ingest-schema";
const mk = (headline: string, topics: string[], urls: string[] = [], dek = "") => ({ headline, dek, topics, sources: urls.map((url) => ({ url, name: "x", type: "primary" as const })) });
const ex = (id: string, headline: string, topics: string[], urls: string[] = [], dek = "") => ({ id, headline, dek, topics, sourceUrls: urls });
const live = [
  ex("duel", "Two rival theories of consciousness were made to bet on the outcome in advance. Neither won", ["Mind and consciousness", "Science and medicine", "Philosophy and ideas"]),
  ex("libet", "The famous experiment that 'disproved' free will may have been measuring noise", ["Philosophy of mind", "Free will", "Neuroscience", "Science and medicine"]),
  ex("med", "Meditation can go wrong for some people, and researchers are now counting how often", ["Meditation and contemplative practice", "Mind and consciousness", "Science and medicine"]),
  ex("alto", "The Xerox Alto: a research computer that was never put on sale", ["Computing history", "Graphical interfaces", "Xerox PARC"]),
  ex("apollo", "The Apollo computer's software was woven by hand, one wire at a time", ["Computing history", "Commercial spaceflight", "Engineering and forgotten inventions"]),
];
const cases: [string, ReturnType<typeof mk>, boolean][] = [
  ["deep dive on same study (should flag)", mk("Two theories of consciousness were put to a fair test. Neither won, and the fight got nastier", ["Mind and consciousness", "Philosophy and ideas", "Science and medicine"]), true],
  ["same study, other words, shared source", mk("A giant adversarial collaboration pitted IIT against global workspace and neither survived", ["Mind and consciousness", "Science and medicine"], ["https://x.test/a"]), false],
  ["different consciousness story (should pass)", mk("What anaesthesia reveals about where consciousness switches off", ["Mind and consciousness", "Science and medicine"]), false],
  ["different Xerox story (should pass)", mk("Smalltalk, the language that wanted children to program", ["Computing history", "Xerox PARC"]), false],
  ["Alto retread (should flag)", mk("Why the Xerox Alto was never sold, and who got to use it", ["Computing history", "Xerox PARC", "Graphical interfaces"]), true],
  ["meditation different angle (should pass)", mk("What a month of silent retreat does to attention, measured", ["Meditation and contemplative practice", "Science and medicine"]), false],
];
for (const [name, item, want] of cases) {
  const hits = live.map((e) => ({ id: e.id, why: looksLikeSameStory(item, e) })).filter((h) => h.why);
  const got = hits.length > 0;
  console.log(`${got === want ? "ok  " : "MISS"} ${name}${hits.length ? "  -> " + hits.map((h) => `${h.id}: ${h.why}`).join("; ") : ""}`);
}
