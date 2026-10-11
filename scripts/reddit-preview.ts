// Preview what the Reddit import would suggest for a list of subreddits, without touching any state.
//   npm run reddit:preview -- subs.txt
import { readFileSync } from "node:fs";
import { analyseSubreddits, parseSubreddits } from "../src/lib/reddit";
import { seedState } from "../src/lib/seed";

const [file] = process.argv.slice(2);
if (!file) { console.error("usage: npm run reddit:preview -- <file>"); process.exit(1); }
const subs = parseSubreddits(readFileSync(file, "utf8"));
const a = analyseSubreddits(subs, seedState());
console.log(`${subs.length} communities read\n`);
for (const s of a.suggestions) {
  console.log(`${s.approved ? "[x]" : "[ ]"} ${s.name}  (${s.subs.length} communities, ${Math.round(s.confidence * 100)}%${s.mergeInto ? `, merges into "${s.mergeInto.name}"` : ""})`);
}
console.log(`\nRecognised but not turned into interests: ${a.ignored.length}`);
console.log(`Unrecognised (${a.unknown.length}): ${a.unknown.join(", ")}`);
