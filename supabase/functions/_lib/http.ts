// Small helpers shared by the editor-facing functions.

// Read through globalThis so the same file type-checks in Deno, Node and the test runner.
const env = (k: string): string | undefined =>
  (globalThis as unknown as { Deno: { env: { get(k: string): string | undefined } } }).Deno.env.get(k);

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

/** Constant-time string comparison so the token can't be probed byte by byte. */
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/** Returns a Response to send if the caller isn't allowed, otherwise null. */
export function requireEditor(req: Request): Response | null {
  const expected = env("INGEST_TOKEN");
  if (!expected || expected.length < 24) {
    // Fail closed: an unset or weak token means nobody gets in.
    return json({ error: "server_misconfigured", detail: "INGEST_TOKEN is not set (min 24 chars)." }, 500);
  }
  const header = req.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!given || !safeEqual(given, expected)) return json({ error: "unauthorized" }, 401);
  return null;
}
