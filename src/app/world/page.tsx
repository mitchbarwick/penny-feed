"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Interests } from "@/components/world/Interests";
import { Steer } from "@/components/world/Steer";
import { People } from "@/components/world/People";
import { Prefs } from "@/components/world/Prefs";
import { History } from "@/components/world/History";
import { Reddit } from "@/components/world/Reddit";
import { SourcePrefs } from "@/components/world/SourcePrefs";

const TABS = [
  { id: "interests", label: "Interests" },
  { id: "steer", label: "Tell me" },
  { id: "people", label: "People" },
  { id: "shape", label: "Shape" },
  { id: "history", label: "History" },
  { id: "reddit", label: "Reddit" },
  { id: "sources", label: "Sources" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function WorldPage() {
  const { hydrated } = useStore();
  const [tab, setTab] = useState<Tab>("interests");

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "") as Tab;
      if (TABS.some((t) => t.id === h)) setTab(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  if (!hydrated) return <div className="min-h-[60vh]" aria-busy="true" />;

  return (
    <main className="mx-auto max-w-[680px] px-5 pb-10 pt-8 md:px-6">
      <h1 className="font-display text-[2rem] font-semibold tracking-tight">Your World</h1>
      <p className="mt-1 text-ink-soft">What I know about you, and the dials to correct me. 🍎</p>

      <div role="tablist" aria-label="Your World sections" className="scroll-hide -mx-1 mt-5 flex gap-1 overflow-x-auto px-1">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id}
            onClick={() => { setTab(t.id); history.replaceState(null, "", `#${t.id}`); }}
            className={`min-h-[40px] shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${tab === t.id ? "bg-ink text-bg" : "text-muted hover:bg-surface-2"}`}>{t.label}</button>
        ))}
      </div>

      <div className="mt-6" role="tabpanel">
        {tab === "interests" && <Interests />}
        {tab === "steer" && <Steer />}
        {tab === "people" && <People />}
        {tab === "shape" && <Prefs />}
        {tab === "history" && <History />}
        {tab === "reddit" && <Reddit />}
        {tab === "sources" && <SourcePrefs />}
      </div>
    </main>
  );
}
