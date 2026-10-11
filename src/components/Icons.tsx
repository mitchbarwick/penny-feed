const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const IconFeed = (p: { filled?: boolean }) => (
  <svg {...base}><path d="M5 4h14v16H5z" fill={p.filled ? "currentColor" : "none"} fillOpacity={0.12} /><path d="M8.5 9h7M8.5 13h7M8.5 16.5h4" /></svg>
);
export const IconLibrary = (p: { filled?: boolean }) => (
  <svg {...base}><path d="M5 4v16M10 4v16" /><path d="M14.5 5.5l4.6 1.2-4 13.3-4.6-1.2z" fill={p.filled ? "currentColor" : "none"} fillOpacity={0.12} /></svg>
);
export const IconWorld = (p: { filled?: boolean }) => (
  <svg {...base}><circle cx="12" cy="12" r="8" fill={p.filled ? "currentColor" : "none"} fillOpacity={0.12} /><path d="M4 12h16M12 4c2.6 2.4 3.6 5 3.6 8s-1 5.6-3.6 8c-2.6-2.4-3.6-5-3.6-8s1-5.6 3.6-8Z" /></svg>
);
export const IconGear = (p: { filled?: boolean }) => (
  <svg {...base}><circle cx="12" cy="12" r="3" fill={p.filled ? "currentColor" : "none"} fillOpacity={0.2} /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></svg>
);
export const IconBookmark = ({ on }: { on?: boolean }) => (
  <svg {...base} className={on ? "anim-settle" : ""}><path d="M7 4h10v16l-5-3.5L7 20V4Z" fill={on ? "currentColor" : "none"} /></svg>
);
export const IconMore = () => (
  <svg {...base}><circle cx="6" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="18" cy="12" r="1.2" fill="currentColor" /></svg>
);
export const IconCheck = () => (<svg {...base}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const IconChevron = ({ dir = "right" }: { dir?: "right" | "left" | "down" | "up" }) => (
  <svg {...base} style={{ transform: `rotate(${{ right: 0, down: 90, left: 180, up: 270 }[dir]}deg)` }}><path d="M9 6l6 6-6 6" /></svg>
);
export const IconLink = () => (<svg {...base}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" /></svg>);
export const IconClose = () => (<svg {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const IconLock = ({ on }: { on?: boolean }) => (
  <svg {...base}><rect x="5.5" y="10.5" width="13" height="9" rx="2" fill={on ? "currentColor" : "none"} fillOpacity={0.15} /><path d={on ? "M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" : "M8.5 10.5V8a3.5 3.5 0 0 1 6.6-1.6"} /></svg>
);
export const IconUndo = () => (<svg {...base}><path d="M9 7L4.5 11.5 9 16" /><path d="M5 11.5h8.5a5.5 5.5 0 0 1 0 11" transform="translate(0 -4)" /></svg>);
