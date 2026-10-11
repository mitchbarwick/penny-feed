"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { analyseSubreddits, commitRedditSuggestions, parseSubreddits, type RedditAnalysis } from "@/lib/reddit";

export function Reddit() {
  const { state, update, toast } = useStore();
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<RedditAnalysis | null>(null);
  const [subs, setSubs] = useState<string[]>([]);
  const [chosen, setChosen] = useState<Set<string>>(new Set());

  const analyse = () => {
    const found = parseSubreddits(text);
    setSubs(found);
    const a = analyseSubreddits(found, state);
    setAnalysis(a);
    setChosen(new Set(a.suggestions.filter((s) => s.approved).map((s) => s.id)));
  };

  const commit = () => {
    if (!analysis) return;
    const picked = analysis.suggestions.filter((s) => chosen.has(s.id));
    const r = commitRedditSuggestions(state, picked, subs);
    update(() => r.state);
    toast(`Added ${r.created} new interest${r.created === 1 ? "" : "s"}, and strengthened the evidence on ${r.merged}.${r.protectedCount ? ` ${r.protectedCount} of yours were left exactly as you set them.` : ""}`);
    setAnalysis(null); setText("");
  };

  return (
    <section>
      <p className="text-ink-soft">
        Paste your subreddit subscriptions in any shape: a list of names, <code className="rounded bg-surface-2 px-1">r/names</code>, or a block copied from Reddit. I'll work out the <em>themes</em> behind them rather than copying them across, then show you before anything is saved. Nothing leaves your device.
      </p>
      <label className="mt-4 block"><span className="sr-only">Subreddits</span>
        <textarea placeholder={"r/spacex\nr/watches\nr/design\nr/todayilearned"} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <button className="btn btn-primary mt-3" onClick={analyse} disabled={!text.trim()}>Work out my interests</button>

      {analysis && (
        <div className="anim-rise mt-6">
          <p className="text-sm text-muted">Read {analysis.total} communities.</p>
          {analysis.suggestions.length === 0 && <p className="mt-2 text-ink-soft">I didn't recognise any of those, I'm afraid. Add the interests by hand in the Interests tab and I'll take it from there.</p>}
          <ul className="mt-3 space-y-3">
            {analysis.suggestions.map((s) => (
              <li key={s.id} className="paper p-4">
                <label className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1.5 size-4 accent-[var(--sage)]" checked={chosen.has(s.id)}
                    onChange={() => setChosen((c) => { const n = new Set(c); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n; })} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-semibold leading-tight">{s.name}</span>
                    <span className="mt-0.5 block text-sm text-ink-soft">{s.description}</span>
                    <span className="mt-1.5 block text-[0.8rem] text-muted">From {s.subs.map((x) => `r/${x}`).join(", ")} · {Math.round(s.confidence * 100)}% confident</span>
                    {s.related.length > 0 && <span className="mt-1 block text-[0.8rem] text-muted">Includes: {s.related.slice(0, 5).join(", ")}</span>}
                    {s.mergeInto && (
                      <span className="mt-1.5 block rounded-lg bg-blue-soft px-2.5 py-1.5 text-[0.8rem] text-ink-soft">
                        You already have “{s.mergeInto.name}”. {s.mergeInto.locked || s.mergeInto.origin === "explicit" ? "It's yours, so I'll only add evidence and leave your settings alone." : "I'll add this as evidence and fill in gaps."}
                      </span>
                    )}
                    {s.note && <span className="mt-1.5 block text-[0.8rem] text-terra">{s.note}</span>}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {analysis.ignored.length > 0 && (
            <details className="mt-4 text-sm text-ink-soft">
              <summary className="cursor-pointer font-semibold">{analysis.ignored.length} recognised but skipped on purpose</summary>
              <p className="mt-2 text-muted">{analysis.ignored.map((u) => `r/${u}`).join(", ")}</p>
              <p className="mt-1 text-muted">Memes, jokes, general Q&amp;A, and celebrity-focused communities. I don't turn these into interests. If I've skipped something you do care about, add it by hand in the Interests tab.</p>
            </details>
          )}
          {analysis.unknown.length > 0 && (
            <details className="mt-4 text-sm text-ink-soft">
              <summary className="cursor-pointer font-semibold">{analysis.unknown.length} I didn't recognise</summary>
              <p className="mt-2 text-muted">{analysis.unknown.map((u) => `r/${u}`).join(", ")}</p>
              <p className="mt-1 text-muted">I won't guess. The editor can classify these on its next run if you want, and you can add any of them as interests by hand.</p>
            </details>
          )}
          {analysis.suggestions.length > 0 && (
            <div className="mt-5 flex gap-2">
              <button className="btn btn-sage" onClick={commit} disabled={chosen.size === 0}>Add {chosen.size} to my ledger</button>
              <button className="btn btn-quiet" onClick={() => setAnalysis(null)}>Cancel</button>
            </div>
          )}
        </div>
      )}

      {state.redditImports.length > 0 && (
        <div className="mt-10">
          <h3 className="label">Past imports</h3>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft">
            {state.redditImports.map((r, i) => <li key={i}>{new Date(r.at).toLocaleDateString("en-AU")} · {r.subs.length} communities</li>)}
          </ul>
        </div>
      )}
      <p className="mt-8 text-[0.8rem] text-muted">Reddit only helps me understand you. I don't treat upvotes as quality, and I don't bring over comments or arguments.</p>
    </section>
  );
}
