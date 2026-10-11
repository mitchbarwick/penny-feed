// Submit a payload file to the ingestion endpoint. The bridge for any environment
// that can run Node but would rather not hand-write a curl command.
//
//   PENNY_INGEST_URL=... PENNY_INGEST_TOKEN=... node scripts/ingest-file.mjs payload.json
//
// Exit codes: 0 accepted (even if some items were rejected: read the output),
//             1 usage/config problem, 2 server rejected the whole payload, 3 network/server error.
import { readFile } from "node:fs/promises";
import { loadPennyEnv } from "./penny-env.mjs";

const [file] = process.argv.slice(2);
const { ingestUrl: url, token } = loadPennyEnv();

if (!file || !url || !token) {
  console.error("usage: PENNY_INGEST_URL=… PENNY_INGEST_TOKEN=… node scripts/ingest-file.mjs <payload.json>");
  process.exit(1);
}

let body;
try {
  body = await readFile(file, "utf8");
  JSON.parse(body);
} catch (e) {
  console.error(`Can't read ${file} as JSON: ${e.message}`);
  process.exit(1);
}

let res;
try {
  res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body,
  });
} catch (e) {
  console.error(`Network error: ${e.message}. Re-sending the same runId is safe.`);
  process.exit(3);
}

const text = await res.text();
let out;
try { out = JSON.parse(text); } catch { out = { raw: text }; }
console.log(JSON.stringify(out, null, 2));

if (res.status === 422 || res.status === 400) process.exit(2);
if (!res.ok) process.exit(3);
const rejected = out.rejected?.length ?? 0;
if (rejected) console.error(`\n${rejected} item(s) were rejected. Fix them and re-submit with a NEW runId.`);
