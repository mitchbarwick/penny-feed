import { Fragment } from "react";
import { parseBlocks, parseInline, type Inline } from "@/lib/markup";

function Inlines({ text }: { text: string }) {
  const parts: Inline[] = parseInline(text);
  return (
    <>
      {parts.map((p, i) =>
        p.t === "text" ? <Fragment key={i}>{p.v}</Fragment>
        : p.t === "em" ? <em key={i}>{p.v}</em>
        : p.t === "strong" ? <strong key={i} className="font-semibold">{p.v}</strong>
        : <a key={i} href={p.href} target="_blank" rel="noopener noreferrer nofollow">{p.v}</a>,
      )}
    </>
  );
}

export function Prose({ body, compact = false, dropCap = true }: { body: string; compact?: boolean; dropCap?: boolean }) {
  const blocks = parseBlocks(body);
  return (
    <div className={`prose-penny ${compact ? "prose-compact" : ""}`}>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "p": return <p key={i} className={!dropCap ? "no-drop" : undefined}><Inlines text={b.text} /></p>;
          case "h": return <h2 key={i}>{b.text}</h2>;
          case "quote": return <blockquote key={i}><Inlines text={b.text} /></blockquote>;
          case "interp": return <p key={i} className="interp"><Inlines text={b.text} /></p>;
          case "ul": return <ul key={i} className="mb-[1.05em] list-disc space-y-1.5 pl-6">{b.items.map((x, j) => <li key={j}><Inlines text={x} /></li>)}</ul>;
          case "ol": return <ol key={i} className="mb-[1.05em] list-decimal space-y-1.5 pl-6">{b.items.map((x, j) => <li key={j}><Inlines text={x} /></li>)}</ol>;
          case "hr": return <hr key={i} />;
        }
      })}
    </div>
  );
}
