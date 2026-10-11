"use client";
// The reader's brain: one context holding personal state (persisted locally,
// synced to Supabase when configured) and content (bundled samples, or live
// from Supabase). The app keeps working with neither the network nor the editor.
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { AppState, Feedback, Item, Series } from "./types";
import { seedState } from "./seed";
import { DOC_KEYS, fromDocs, toDocs, type DocKey } from "./docs";
import { expireTemporary, nowIso, uid } from "./ledger";
import { supabase, supabaseConfigured } from "./supabase";
import { rowToItem, rowToSeries, type ItemRow, type SeriesRow } from "./rows";
import { SAMPLE_ITEMS, SAMPLE_SERIES } from "@/data/sample";
import { ingest, type ContentSnapshot } from "./ingest-core";
import type { IngestResult } from "./ingest-schema";

const LS_STATE = "penny-feed:state:v1";
const LS_CONTENT = "penny-feed:content:v1";
const LS_LOCAL = "penny-feed:local-content:v1";

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, v: string) {
  try { localStorage.setItem(key, v); } catch { /* storage full or blocked: carry on */ }
}

function loadLocal(): AppState {
  const raw = safeGet(LS_STATE);
  if (!raw) return seedState();
  try {
    const parsed = JSON.parse(raw) as AppState;
    // Forward-fill any fields added since this was saved.
    return { ...seedState(), ...parsed, prefs: { ...seedState().prefs, ...parsed.prefs } };
  } catch {
    return seedState();
  }
}

type Toast = { id: string; message: string; undo?: () => void };

interface Ctx {
  state: AppState;
  hydrated: boolean;
  update: (fn: (s: AppState) => AppState) => void;
  items: Item[];
  series: Series[];
  contentSource: "sample" | "live";
  contentLoading: boolean;
  refreshContent: () => Promise<void>;
  /** null = no auth needed (demo mode) */
  auth: { required: boolean; session: Session | null; ready: boolean; error?: string };
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  syncStatus: "off" | "idle" | "syncing" | "error";
  toasts: Toast[];
  toast: (message: string, undo?: () => void) => void;
  dismissToast: (id: string) => void;
  addFeedback: (f: Omit<Feedback, "id" | "at" | "resulted"> & { resulted?: string[] }) => void;
  /** Demo-mode ingestion: runs the same validation and dedupe as the edge function. */
  ingestLocal: (raw: unknown) => { ok: true; result: IngestResult } | { ok: false; errors: string[] };
}

const StoreCtx = createContext<Ctx | null>(null);
export const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => seedState());
  const [hydrated, setHydrated] = useState(false);
  const [local, setLocal] = useState<ContentSnapshot>({ items: [], series: [] });
  const [live, setLive] = useState<{ items: Item[]; series: Series[] } | null>(null);
  const [contentLoading, setContentLoading] = useState(supabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!supabaseConfigured);
  const [authError, setAuthError] = useState<string>();
  const [syncStatus, setSyncStatus] = useState<Ctx["syncStatus"]>(supabaseConfigured ? "idle" : "off");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushed = useRef<Record<string, string>>({});
  const remoteLoaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- hydrate from this device
  useEffect(() => {
    setState(expireTemporary(loadLocal()));
    try { const raw = safeGet(LS_LOCAL); if (raw) setLocal(JSON.parse(raw)); } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // --- persist locally on every change
  useEffect(() => {
    if (!hydrated) return;
    safeSet(LS_STATE, JSON.stringify(state));
  }, [state, hydrated]);

  // --- theme
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (state.theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", state.theme);
    const dark = state.theme === "dark" || (state.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#1d1a17" : "#f6efe3");
  }, [state.theme, hydrated]);

  // --- auth
  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const sb = supabase();
    if (!sb) return "Supabase isn't configured.";
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { setAuthError(error.message); return error.message; }
    setAuthError(undefined);
    return null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase()?.auth.signOut();
    remoteLoaded.current = false;
    pushed.current = {};
    setLive(null);
  }, []);

  // --- live content
  const refreshContent = useCallback(async () => {
    const sb = supabase();
    if (!sb || !session) return;
    setContentLoading(true);
    try {
      const [i, s] = await Promise.all([
        sb.from("items").select("*").in("status", ["published", "corrected"]).order("published_at", { ascending: false }).limit(600),
        sb.from("series").select("*"),
      ]);
      if (i.error) throw i.error;
      if (s.error) throw s.error;
      const next = { items: (i.data as ItemRow[]).map(rowToItem), series: (s.data as SeriesRow[]).map(rowToSeries) };
      setLive(next);
      safeSet(LS_CONTENT, JSON.stringify(next));
    } catch {
      // Offline or the backend is down: fall back to whatever we cached last time.
      const cached = safeGet(LS_CONTENT);
      if (cached && !live) { try { setLive(JSON.parse(cached)); } catch { /* ignore */ } }
    } finally {
      setContentLoading(false);
    }
  }, [session, live]);

  useEffect(() => {
    if (!session) return;
    void refreshContent();
    const onVis = () => { if (document.visibilityState === "visible") void refreshContent(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // --- remote state: pull once after sign-in, then push changes
  useEffect(() => {
    const sb = supabase();
    if (!sb || !session || !hydrated || remoteLoaded.current) return;
    remoteLoaded.current = true;
    (async () => {
      setSyncStatus("syncing");
      const { data, error } = await sb.from("state").select("key,value");
      if (error) { setSyncStatus("error"); return; }
      const docs: Partial<Record<DocKey, unknown>> = {};
      for (const row of data ?? []) if ((DOC_KEYS as readonly string[]).includes(row.key)) docs[row.key as DocKey] = row.value;
      if (Object.keys(docs).length) {
        setState((cur) => {
          const merged = fromDocs(cur, docs);
          for (const k of Object.keys(docs)) pushed.current[k] = JSON.stringify((toDocs(merged) as Record<string, unknown>)[k]);
          return merged;
        });
      }
      setSyncStatus("idle");
    })();
  }, [session, hydrated]);

  useEffect(() => {
    const sb = supabase();
    if (!sb || !session || !hydrated || !remoteLoaded.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const docs = toDocs(state);
      const rows = DOC_KEYS
        .map((k) => ({ key: k, json: JSON.stringify(docs[k]) }))
        .filter((r) => pushed.current[r.key] !== r.json)
        .map((r) => ({ key: r.key, value: JSON.parse(r.json), updated_at: nowIso() }));
      if (!rows.length) return;
      setSyncStatus("syncing");
      const { error } = await sb.from("state").upsert(rows);
      if (error) { setSyncStatus("error"); return; }
      for (const r of rows) pushed.current[r.key] = JSON.stringify(r.value);
      setSyncStatus("idle");
    }, 1500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [state, session, hydrated]);

  // --- service worker
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {});
  }, []);

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), []);

  const toast = useCallback((message: string, undo?: () => void) => {
    const id = uid("t");
    setToasts((t) => [...t.slice(-1), { id, message, undo }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), undo ? 7000 : 3800);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const addFeedback = useCallback<Ctx["addFeedback"]>((f) => {
    setState((s) => ({ ...s, feedback: [{ id: uid("fb"), at: nowIso(), resulted: [], ...f }, ...s.feedback].slice(0, 500) }));
  }, []);

  const liveHasContent = supabaseConfigured && live !== null && live.items.length > 0;
  const useSamples = !liveHasContent && !state.hideSamples;
  const base = liveHasContent ? live! : { items: [] as Item[], series: [] as Series[] };
  const merge = <T extends { id: string }>(...lists: T[][]) => [...new Map(lists.flat().map((x) => [x.id, x])).values()];
  const items = useMemo(
    () => merge(useSamples ? SAMPLE_ITEMS : [], base.items, supabaseConfigured ? [] : local.items),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useSamples, live, local],
  );
  const series = useMemo(
    () => merge(useSamples ? SAMPLE_SERIES : [], base.series, supabaseConfigured ? [] : local.series),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useSamples, live, local],
  );

  const ingestLocal = useCallback<Ctx['ingestLocal']>((raw) => {
    const current: ContentSnapshot = { items, series };
    const res = ingest(raw, current, { excludedTopics: state.prefs.excludedTopics });
    const task = (raw as { task?: string })?.task ?? 'manual';
    const runId = (raw as { runId?: string })?.runId ?? 'unknown';
    if (!res.ok) {
      setState((s) => ({ ...s, ingestLog: [{ at: nowIso(), task, runId, accepted: 0, rejected: 0, errors: res.errors }, ...(s.ingestLog ?? [])].slice(0, 30) }));
      return { ok: false, errors: res.errors };
    }
    const { outcome } = res;
    const next: ContentSnapshot = {
      items: merge(local.items, outcome.upsertItems),
      series: merge(local.series, outcome.upsertSeries),
    };
    setLocal(next);
    safeSet(LS_LOCAL, JSON.stringify(next));
    setState((s) => ({
      ...s,
      ingestLog: [{ at: nowIso(), task, runId, accepted: outcome.result.accepted.length, rejected: outcome.result.rejected.length, errors: outcome.result.rejected.flatMap((r) => r.reasons.map((x) => r.id + ': ' + x)) }, ...(s.ingestLog ?? [])].slice(0, 30),
    }));
    return { ok: true, result: outcome.result };
  }, [items, series, local, state.prefs.excludedTopics]);

  const value = useMemo<Ctx>(() => ({
    state, hydrated, update, items, series,
    contentSource: useSamples ? "sample" : "live",
    contentLoading, refreshContent,
    auth: { required: supabaseConfigured, session, ready: authReady, error: authError },
    signIn, signOut, syncStatus, toasts, toast, dismissToast, addFeedback, ingestLocal,
  }), [ingestLocal, state, hydrated, update, items, series, useSamples, contentLoading, refreshContent, session, authReady, authError, signIn, signOut, syncStatus, toasts, toast, dismissToast, addFeedback]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
