"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { IconFeed, IconGear, IconLibrary, IconWorld, IconClose } from "./Icons";
import { Doodle } from "./Doodle";

const TABS = [
  { href: "/", label: "Feed", Icon: IconFeed },
  { href: "/library/", label: "Library", Icon: IconLibrary },
  { href: "/world/", label: "Your World", Icon: IconWorld },
  { href: "/settings/", label: "Settings", Icon: IconGear },
] as const;

function isActive(path: string, href: string) {
  const p = path.replace(/\/$/, "") || "/";
  const h = href.replace(/\/$/, "") || "/";
  return h === "/" ? p === "/" || p === "/read" || p === "/series" : p.startsWith(h);
}

function SignIn() {
  const { signIn, auth } = useStore();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-sm flex-col justify-center px-6">
      <div className="mb-6 text-sage"><Doodle name="lamp" size={64} /></div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Penny Feed</h1>
      <p className="mt-2 text-ink-soft">Right. This one's private, so I'll need to know it's you. 👩🏻‍🦰</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => { e.preventDefault(); setBusy(true); await signIn(email, pw); setBusy(false); }}
      >
        <label className="block"><span className="label">Email</span>
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
        </label>
        <label className="block"><span className="label">Password</span>
          <input type="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1" />
        </label>
        {auth.error && <p role="alert" className="text-sm text-terra">{auth.error}</p>}
        <button className="btn btn-primary w-full justify-center" disabled={busy}>{busy ? "One moment…" : "Come in"}</button>
      </form>
    </main>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "/";
  const { auth, toasts, dismissToast, contentSource, hydrated } = useStore();
  const [bannerOpen, setBannerOpen] = useState(true);

  if (auth.required && !auth.ready) return <div className="min-h-[100svh]" aria-busy="true" />;
  if (auth.required && !auth.session) return <SignIn />;

  return (
    <div className="min-h-[100svh]">
      {/* desktop top bar */}
      <header className="sticky top-0 z-30 hidden border-b border-line bg-bg/85 backdrop-blur md:block">
        <div className="mx-auto flex max-w-[720px] items-center justify-between px-6 py-3">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight">Penny Feed</Link>
          <nav aria-label="Primary" className="flex gap-1">
            {TABS.map(({ href, label }) => (
              <Link
                key={href} href={href} aria-current={isActive(path, href) ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${isActive(path, href) ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"}`}
              >{label}</Link>
            ))}
          </nav>
        </div>
      </header>

      {contentSource === "sample" && hydrated && bannerOpen && (
        <div className="mx-auto max-w-[720px] px-4 pt-3 md:px-6">
          <div className="flex items-start gap-3 rounded-2xl border border-line bg-amber-soft/60 px-4 py-2.5 text-[0.82rem] leading-snug text-ink-soft" role="note">
            <span className="mt-0.5 shrink-0 text-amber"><Doodle name="book" size={20} /></span>
            <p className="flex-1">
              <strong className="font-semibold text-ink">Sample stories.</strong> These are written to show how the feed looks and reads, not live reporting. Real stories arrive once the editor is connected.
            </p>
            <button aria-label="Hide note" className="-mr-1 -mt-1 grid size-8 place-items-center rounded-full text-muted hover:text-ink" onClick={() => setBannerOpen(false)}><IconClose /></button>
          </div>
        </div>
      )}

      <div className="pb-safe md:pb-24">{children}</div>

      {/* mobile bottom bar */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {TABS.map(({ href, label, Icon }) => {
            const on = isActive(path, href);
            return (
              <li key={href}>
                <Link href={href} aria-current={on ? "page" : undefined}
                  className={`flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[0.68rem] font-semibold tracking-wide transition-colors ${on ? "text-ink" : "text-muted"}`}>
                  <span className={on ? "text-terra" : ""}><Icon filled={on} /></span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* toasts */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[84px] z-40 flex flex-col items-center gap-2 px-4 md:bottom-6" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="anim-rise pointer-events-auto flex max-w-md items-center gap-3 rounded-full border border-line bg-ink py-2 pl-4 pr-2 text-sm text-bg shadow-lg">
            <span>{t.message}</span>
            {t.undo && (
              <button className="rounded-full bg-bg/15 px-3 py-1 text-xs font-semibold hover:bg-bg/25" onClick={() => { t.undo?.(); dismissToast(t.id); }}>Undo</button>
            )}
            <button aria-label="Dismiss" className="grid size-7 place-items-center rounded-full opacity-70 hover:opacity-100" onClick={() => dismissToast(t.id)}><IconClose /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
