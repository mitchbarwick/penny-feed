// Build the changes a Reddit import would make to a *stored* ledger, as three small JSON patches
// (new interests, evidence for existing ones, history entries), so they can be applied to the
// cloud `state` rows directly. Only the themes ticked by default are included.
//   npx tsx scripts/reddit-patch.ts subs.txt out-dir
import { readFileSync, writeFileSync } from "node:fs";
import { analyseSubreddits, commitRedditSuggestions, parseSubreddits } from "../src/lib/reddit";
import { seedState } from "../src/lib/seed";

const [file, outDir] = process.argv.slice(2);
const subs = parseSubreddits(readFileSync(file, "utf8"));
const base = seedState();
const a = analyseSubreddits(subs, base);
const chosen = a.suggestions.filter((s) => s.approved);
const r = commitRedditSuggestions(base, chosen, subs);

const baseIds = new Set(base.interests.map((i) => i.id));
const created = r.state.interests.filter((i) => !baseIds.has(i.id));
const evidence = r.state.interests
  .filter((i) => baseIds.has(i.id))
  .map((i) => {
    const before = base.interests.find((b) => b.id === i.id)!;
    const added = i.evidence.filter((e) => !before.evidence.some((x) => x.id === e.id));
    return { id: i.id, evidence: added, confidence: i.confidence };
  })
  .filter((p) => p.evidence.length);
const history = r.state.history;

writeFileSync(`${outDir}/new-interests.json`, JSON.stringify(created));
writeFileSync(`${outDir}/evidence.json`, JSON.stringify(evidence));
writeFileSync(`${outDir}/history.json`, JSON.stringify(history));
writeFileSync(`${outDir}/import.json`, JSON.stringify(r.state.redditImports));
console.log(`created ${created.length}, evidence on ${evidence.length}, history ${history.length}, skipped(unticked) ${a.suggestions.length - chosen.length}, ignored ${a.ignored.length}`);
