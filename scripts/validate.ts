// Dry-run a payload locally: the same schema, editorial checks and deduplication
// the live endpoint applies, with no network and nothing written.
//
//   npm run validate -- payload.json [existing-content.json]
import { readFileSync } from "node:fs";
import { ingest } from "../src/lib/ingest-core";

const [file, existing] = process.argv.slice(2);
if (!file) {
  console.error("usage: npm run validate -- <payload.json> [existing-content.json]");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(file, "utf8"));
const current = existing ? JSON.parse(readFileSync(existing, "utf8")) : { items: [], series: [] };
const res = ingest(raw, current);

if (!res.ok) {
  console.error("REJECTED (nothing would be written):");
  for (const e of res.errors) console.error("  • " + e);
  process.exit(2);
}
const { result } = res.outcome;
for (const a of result.accepted) console.log(`✓ ${a.id}  (${a.action})`);
for (const s of result.seriesAccepted) console.log(`✓ series ${s.id}  (${s.action})`);
for (const r of result.rejected) console.log(`✗ ${r.id}\n    ${r.reasons.join("\n    ")}`);
for (const w of result.warnings) console.log(`⚠ ${w}`);
process.exit(result.rejected.length ? 1 : 0);
