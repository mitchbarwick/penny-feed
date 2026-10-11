// A deliberately tiny markup for editorial bodies. Editors write plain text:
//
//   Paragraphs are separated by a blank line.
//   ## A subheading
//   > A quotation (always attributed in the text, never invented)
//   ~ An interpretation line: analysis or speculation, set apart from fact
//   - bullet lines, or 1. numbered lines, one per line
//   --- (a section break)
//   Inline: *italic*, **bold**, [link text](https://example.com)
//
// Keeping it this small means the validator can reason about it and the
// renderer can never be tricked into running anything.

export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "quote"; text: string }
  | { t: "interp"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "hr" };

export function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  const chunks = body.replace(/\r\n/g, "\n").split(/\n{2,}/);
  for (const raw of chunks) {
    const c = raw.trim();
    if (!c) continue;
    if (c === "---") blocks.push({ t: "hr" });
    else if (c.startsWith("## ")) blocks.push({ t: "h", text: c.slice(3).trim() });
    else if (c.startsWith("> ")) blocks.push({ t: "quote", text: c.replace(/^> ?/gm, "").trim() });
    else if (c.startsWith("~ ")) blocks.push({ t: "interp", text: c.replace(/^~ ?/gm, "").trim() });
    else if (/^- /.test(c) && c.split("\n").every((l) => l.startsWith("- ")))
      blocks.push({ t: "ul", items: c.split("\n").map((l) => l.slice(2).trim()) });
    else if (/^1\. /.test(c) && c.split("\n").every((l) => /^\d+\. /.test(l)))
      blocks.push({ t: "ol", items: c.split("\n").map((l) => l.replace(/^\d+\. /, "").trim()) });
    else blocks.push({ t: "p", text: c.replace(/\n/g, " ") });
  }
  return blocks;
}

export type Inline =
  | { t: "text"; v: string }
  | { t: "em"; v: string }
  | { t: "strong"; v: string }
  | { t: "link"; v: string; href: string };

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: "text", v: s.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ t: "strong", v: m[1] });
    else if (m[2] !== undefined) out.push({ t: "em", v: m[2] });
    else out.push({ t: "link", v: m[3], href: m[4] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ t: "text", v: s.slice(last) });
  return out;
}

/** The opening portion shown in the feed: the first paragraph(s) up to ~maxWords. */
export function excerpt(body: string, maxWords = 55): string {
  const first = parseBlocks(body).find((b) => b.t === "p");
  if (!first || first.t !== "p") return "";
  const text = first.text.replace(/\*\*?|\[([^\]]+)\]\([^)]+\)/g, "$1");
  const words = text.split(/\s+/);
  return words.length <= maxWords ? text : words.slice(0, maxWords).join(" ") + "…";
}
