// Loads the editor's credentials so tasks never need shell tricks to read them.
// Order: real environment variables win; otherwise the env file (PENNY_ENV_FILE, or the default below).
// Never prints values.
import { readFileSync } from "node:fs";

const DEFAULT_FILE = "C:\\Users\\mitch\\Documents\\personal-ai\\penny-feed.env";

export function loadPennyEnv() {
  const file = process.env.PENNY_ENV_FILE || DEFAULT_FILE;
  let text = "";
  try {
    text = readFileSync(file, "utf8");
  } catch {
    /* fine if the variables are already set */
  }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return {
    ingestUrl: process.env.PENNY_INGEST_URL,
    briefUrl: process.env.PENNY_BRIEF_URL,
    token: process.env.PENNY_INGEST_TOKEN,
  };
}
