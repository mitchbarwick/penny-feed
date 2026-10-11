import type { Item } from "@/lib/types";
import { fmtDate } from "@/lib/dates";
import { IconLink } from "./Icons";

const TYPE_LABEL: Record<string, string> = {
  primary: "Primary source", official: "Official", academic: "Research", reporting: "Reporting", specialist: "Specialist",
  essay: "Essay", archive: "Archive", newsletter: "Newsletter", personal: "Personal post", community: "Community",
};

/** Provenance, kept quiet but always available. */
export function Sources({ item }: { item: Item }) {
  return (
    <section aria-label="Sources and provenance" className="mt-8 border-t border-line pt-4 text-[0.88rem] text-ink-soft">
      <h3 className="label mb-2">Sources</h3>
      <ul className="space-y-2">
        {item.sources.map((s) => (
          <li key={s.url} className="flex items-start gap-2">
            <span className="mt-0.5 text-muted"><IconLink /></span>
            <span>
              <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-blue underline decoration-1 underline-offset-2">{s.name}</a>
              <span className="text-muted"> · {TYPE_LABEL[s.type] ?? s.type}{s.accessedAt ? ` · read ${fmtDate(s.accessedAt)}` : ""}</span>
              {s.note && <span className="block text-muted">{s.note}</span>}
            </span>
          </li>
        ))}
      </ul>
      {item.caveats && item.caveats.length > 0 && (
        <div className="mt-4">
          <h3 className="label mb-1">Worth knowing</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted">{item.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
      )}
      {item.corrections && item.corrections.length > 0 && (
        <div className="mt-4 rounded-xl border border-line bg-surface-2 p-3">
          <h3 className="label mb-1 text-terra">Corrected</h3>
          <ul className="space-y-1">{item.corrections.map((c, i) => <li key={i}><span className="text-muted">{fmtDate(c.at)}:</span> {c.note}</li>)}</ul>
          <p className="mt-1 text-xs text-muted">Version {item.version}. The original publication date is unchanged.</p>
        </div>
      )}
    </section>
  );
}
