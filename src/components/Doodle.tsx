// A tiny illustration language: single-weight line drawings, rounded caps, one
// accent colour at most. Used sparingly, never as decoration for its own sake.
import type { CoverMotif } from "@/lib/types";

type Name = "cat" | "sprig" | "moon" | "plane" | "cup" | "star" | "book" | "lamp";

const common = {
  fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};

export function Doodle({ name, size = 56, className = "", title }: { name: Name; size?: number; className?: string; title?: string }) {
  const props = { width: size, height: size, viewBox: "0 0 64 64", className, role: title ? "img" : undefined, "aria-hidden": title ? undefined : true, "aria-label": title };
  switch (name) {
    case "cat":
      return (
        <svg {...props}>
          <g {...common}>
            <path d="M10 46c0-10 8-17 20-17s20 7 20 17c0 3-2 5-5 5H15c-3 0-5-2-5-5Z" />
            <path d="M44 38c4-5 10-4 12 0s-2 9-9 10" />
            <path d="M14 33c-1-6 1-11 5-13l3 5" />
            <path d="M24 26l4-6 3 6" opacity="0" />
            <path d="M17 41q3 2 6 0" />
            <path d="M20 47q2 1 4 0" opacity="0.7" />
          </g>
          <g {...common} className="anim-twinkle" strokeWidth={1.3}>
            <path d="M44 14h6l-6 6h6" />
            <path d="M53 8h4l-4 4h4" />
          </g>
        </svg>
      );
    case "sprig":
      return (
        <svg {...props}>
          <g {...common}>
            <path d="M32 58V22" />
            <path d="M32 40c-8 0-13-5-14-12 8 0 13 5 14 12Z" />
            <path d="M32 32c7-1 12-5 13-12-7 1-12 5-13 12Z" />
            <path d="M32 22c-5-2-7-6-7-11 5 2 7 6 7 11Z" />
            <path d="M32 22c4-2 6-6 6-10-4 2-6 6-6 10Z" />
          </g>
        </svg>
      );
    case "moon":
      return (
        <svg {...props}>
          <g {...common}>
            <path d="M42 46A20 20 0 0 1 26 10a22 22 0 1 0 28 32 20 20 0 0 1-12 4Z" transform="translate(-2 2)" />
          </g>
          <g {...common} className="anim-twinkle" strokeWidth={1.3}>
            <path d="M48 12v8M44 16h8" />
          </g>
        </svg>
      );
    case "plane":
      return (
        <svg {...props} className={`${className} anim-drift`}>
          <g {...common}>
            <path d="M8 30 56 10 40 54 29 38 8 30Z" />
            <path d="M29 38 56 10" />
            <path d="M29 38v12l6-7" />
          </g>
        </svg>
      );
    case "cup":
      return (
        <svg {...props}>
          <g {...common}>
            <path d="M12 26h34v10a14 14 0 0 1-14 14h-6A14 14 0 0 1 12 36V26Z" />
            <path d="M46 29h4a6 6 0 0 1 0 12h-5" />
            <path d="M6 56h46" />
          </g>
          <g {...common} className="anim-breathe" strokeWidth={1.3} opacity="0.7">
            <path d="M22 20c-2-3 2-5 0-8M32 20c-2-3 2-5 0-8M42 20c-2-3 2-5 0-8" />
          </g>
        </svg>
      );
    case "star":
      return (
        <svg {...props}>
          <g {...common}>
            <path d="M32 8l5 15 15 1-12 9 4 15-12-9-12 9 4-15-12-9 15-1 5-15Z" />
          </g>
        </svg>
      );
    case "book":
      return (
        <svg {...props}>
          <g {...common}>
            <path d="M8 14c8-3 16-3 24 2 8-5 16-5 24-2v36c-8-3-16-3-24 2-8-5-16-5-24-2V14Z" />
            <path d="M32 16v36" />
          </g>
        </svg>
      );
    case "lamp":
      return (
        <svg {...props}>
          <g {...common}>
            <path d="M22 10h20l8 20H14l8-20Z" />
            <path d="M32 30v22" />
            <path d="M22 54h20" />
          </g>
        </svg>
      );
  }
}

/** Series cover art: a small procedural pattern per motif, drawn in theme colours. */
export function Cover({ motif, className = "" }: { motif: CoverMotif; className?: string }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 200 120" className={className} role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="120" fill="var(--sage-soft)" />
      {motif === "window" && (
        <g {...stroke} style={{ color: "var(--sage)" }}>
          <rect x="56" y="18" width="88" height="84" rx="8" fill="var(--surface)" />
          <path d="M100 18v84M56 60h88" />
          <circle cx="78" cy="39" r="6" fill="var(--amber-soft)" stroke="var(--amber)" />
          <path d="M112 44l22-3M112 50l16-2" style={{ color: "var(--blue)" }} />
        </g>
      )}
      {motif === "grid" && (
        <g {...stroke} style={{ color: "var(--blue)" }}>
          {Array.from({ length: 8 }).map((_, i) => <path key={`h${i}`} d={`M20 ${20 + i * 12}H180`} opacity={0.5} />)}
          {Array.from({ length: 12 }).map((_, i) => <path key={`v${i}`} d={`M${20 + i * 14.5} 20V104`} opacity={0.5} />)}
          <rect x="62" y="44" width="60" height="36" rx="6" fill="var(--surface)" style={{ color: "var(--ink)" }} />
        </g>
      )}
      {motif === "orbit" && (
        <g {...stroke} style={{ color: "var(--blue)" }}>
          <circle cx="100" cy="60" r="14" fill="var(--amber-soft)" style={{ color: "var(--amber)" }} />
          <ellipse cx="100" cy="60" rx="64" ry="24" transform="rotate(-18 100 60)" />
          <circle cx="152" cy="42" r="4" fill="var(--surface)" />
        </g>
      )}
      {motif === "gear" && (
        <g {...stroke} style={{ color: "var(--terra)" }}>
          <circle cx="86" cy="62" r="26" fill="var(--surface)" />
          <circle cx="86" cy="62" r="8" />
          <circle cx="132" cy="48" r="15" fill="var(--surface)" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <path key={i} d={`M${86 + Math.cos(a) * 26} ${62 + Math.sin(a) * 26}L${86 + Math.cos(a) * 33} ${62 + Math.sin(a) * 33}`} />;
          })}
        </g>
      )}
      {motif === "wave" && (
        <g {...stroke} style={{ color: "var(--blue)" }}>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M0 ${40 + i * 14} Q 25 ${28 + i * 14} 50 ${40 + i * 14} T 100 ${40 + i * 14} T 150 ${40 + i * 14} T 200 ${40 + i * 14}`} opacity={1 - i * 0.18} />
          ))}
        </g>
      )}
      {motif === "leaf" && (
        <g {...stroke} style={{ color: "var(--sage)" }}>
          <path d="M100 104V30" />
          <path d="M100 76c-18 0-30-10-32-26 18 0 30 10 32 26Z" fill="var(--surface)" />
          <path d="M100 56c16-2 27-10 30-24-16 2-27 10-30 24Z" fill="var(--surface)" />
        </g>
      )}
    </svg>
  );
}
