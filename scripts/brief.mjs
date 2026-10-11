// Fetch the editor's brief and print it as JSON. Credentials come from the env file automatically.
//   node scripts/brief.mjs            full brief
//   node scripts/brief.mjs --short    just what's usually needed to choose stories
import { loadPennyEnv } from "./penny-env.mjs";

const { briefUrl, token } = loadPennyEnv();
if (!briefUrl || !token) {
  console.error("Missing PENNY_BRIEF_URL or PENNY_INGEST_TOKEN (set them, or fix the env file path).");
  process.exit(1);
}

let res;
try {
  res = await fetch(briefUrl, { headers: { authorization: `Bearer ${token}` } });
} catch (e) {
  console.error(`Network error: ${e.message}`);
  process.exit(3);
}
const text = await res.text();
if (!res.ok) {
  console.error(`Brief request failed (${res.status}): ${text.slice(0, 300)}`);
  process.exit(3);
}
if (process.argv.includes("--short")) {
  const b = JSON.parse(text);
  const pick = {
    generatedAt: b.generatedAt,
    exclusions: b.exclusions,
    readerRequests: b.readerRequests,
    preferences: b.preferences,
    interests: b.interests.filter((i) => i.status === "active").sort((a, b) => b.weight - a.weight).map((i) => ({ name: i.name, priority: i.priority, origin: i.origin, description: i.description })),
    activeSeries: b.activeSeries,
    seriesFeedback: b.seriesFeedback,
    inventory: b.inventory,
    recentlyPublished: b.recentlyPublished.slice(0, 40),
  };
  console.log(JSON.stringify(pick, null, 2));
} else {
  console.log(text);
}
