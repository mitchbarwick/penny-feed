const MS = { min: 60_000, hour: 3_600_000, day: 86_400_000 };

export function ago(iso: string, now = Date.now()): string {
  const d = now - Date.parse(iso);
  if (d < MS.hour) return "just now";
  if (d < MS.day) return `${Math.floor(d / MS.hour)}h ago`;
  const days = Math.floor(d / MS.day);
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return fmtDate(iso);
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "Still up?";
  if (h < 12) return "Morning.";
  if (h < 17) return "Afternoon.";
  if (h < 21) return "Evening.";
  return "Evening, night owl.";
}
