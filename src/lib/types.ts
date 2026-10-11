// Core domain types. The ingestion schema (ingest-schema.ts) is the wire format
// the editor uses; these are what the reader works with once content is loaded.

export type Format =
  | "update"
  | "explainer"
  | "rabbit_hole"
  | "deep_dive"
  | "series_chapter"
  | "circle";

export const FORMAT_LABEL: Record<Format, string> = {
  update: "The Update",
  explainer: "The Explainer",
  rabbit_hole: "The Rabbit Hole",
  deep_dive: "The Deep Dive",
  series_chapter: "The Series",
  circle: "From My Circle",
};

export type EditorialStatus =
  | "discovered"
  | "researched"
  | "drafted"
  | "validated"
  | "approved"
  | "published"
  | "corrected"
  | "archived";

export type SourceType =
  | "primary"
  | "official"
  | "academic"
  | "reporting"
  | "specialist"
  | "essay"
  | "archive"
  | "newsletter"
  | "personal"
  | "community";

export interface SourceRef {
  url: string;
  name: string;
  type: SourceType;
  publishedAt?: string;
  accessedAt?: string;
  /** What this source was used for, or caveats about it. */
  note?: string;
}

export interface Correction {
  at: string;
  note: string;
}

export interface Item {
  /** Stable id chosen by the editor. Re-submitting the same id is an update. */
  id: string;
  format: Format;
  headline: string;
  dek?: string;
  /** Lightweight markup, see lib/markup.ts */
  body: string;
  readingMinutes: number;
  topics: string[];
  publishedAt: string;
  eventDate?: string;
  /** current = loses value as it ages; evergreen = keeps it */
  timeliness: "current" | "evergreen";
  significance: number; // 0-1, the editor's honest view
  status: EditorialStatus;
  /** Why this was chosen, in Penny's voice. Shown under "Why am I seeing this?" */
  reason?: string;
  sources: SourceRef[];
  /** Claims the editor flagged as needing qualification */
  caveats?: string[];
  seriesId?: string;
  chapter?: number;
  /** Short recap used when the reader has been away from a series */
  recap?: string;
  /** For circle items: id/name of the person this concerns */
  person?: string;
  version: number;
  corrections?: Correction[];
  /** Origin of discovery; displayed quietly, never used to segregate the feed */
  discoveredVia?: "web" | "inbox" | "reddit" | "social" | "reader-request";
  /** Demo content only */
  sample?: boolean;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  subject: string;
  topics: string[];
  motif: CoverMotif;
  /** suggested = a pitch the reader hasn't accepted; the editor has not researched it yet */
  status: "suggested" | "active" | "complete";
  researchStatus: "pitched" | "researching" | "ready";
  totalChapters: number;
  outline: string[];
  sources: SourceRef[];
  reason?: string;
  sample?: boolean;
  version: number;
}

export type CoverMotif = "orbit" | "gear" | "wave" | "grid" | "leaf" | "window";

// ---------------------------------------------------------------- Ledger

export type InterestOrigin = "explicit" | "inferred";
export type InterestStatus = "active" | "muted" | "excluded";

export interface Evidence {
  id: string;
  type:
    | "stated"
    | "reddit"
    | "email"
    | "saved"
    | "series"
    | "feedback"
    | "reading"
    | "profile"
    | "steering";
  explanation: string;
  confidence: number; // 0-1
  at: string;
}

export interface Interest {
  id: string;
  name: string;
  description: string;
  related: string[]; // subtopics / adjacent subjects. Also used for topic matching.
  /** 0-1 */
  weight: number;
  /** 0-1: how sure we are this is a real interest */
  confidence: number;
  origin: InterestOrigin;
  status: InterestStatus;
  /** Locked = only the reader may change it. Behavioural inference can add evidence, never change values. */
  locked: boolean;
  evidence: Evidence[];
  createdAt: string;
  updatedAt: string;
  reinforcedAt?: string;
  /** Temporary muting/boosting; auto-reverts */
  until?: string;
  revertTo?: { status: InterestStatus; weight: number };
}

export type ChangeOrigin = "manual" | "feedback" | "steering" | "reddit" | "email" | "system";

export interface PreferenceChange {
  id: string;
  at: string;
  /** e.g. "interest:ai-product-design.weight" or "prefs.newsBalance" */
  property: string;
  label: string;
  previous: unknown;
  next: unknown;
  origin: ChangeOrigin;
  explanation: string;
  /** If this entry reversed another */
  reverses?: string;
  /** Set once reversed */
  reversedBy?: string;
  /** Snapshot needed to undo (interest create/delete) */
  undo?: UndoOp;
}

export type UndoOp =
  | { kind: "set-interest"; interest: Interest | null; id: string }
  | { kind: "set-pref"; key: keyof Preferences; value: Preferences[keyof Preferences] }
  | { kind: "none" };

export interface Preferences {
  /** 0 = all current developments, 1 = all evergreen */
  evergreenBalance: number;
  /** 0 = stay in lane, 1 = lots of exploration */
  discovery: number;
  /** 0 = very mixed, 1 = happy with runs of the same subject */
  focus: number;
  length: "short" | "mixed" | "long";
  technicality: "gentle" | "balanced" | "deep";
  circleFrequency: "rare" | "occasional" | "often";
  activeSeries: 1 | 2 | 3;
  formatMix: Record<Exclude<Format, "series_chapter">, number>; // 0-1 appetite
  excludedTopics: string[];
  writingStyleNote: string;
}

export interface Person {
  id: string;
  name: string;
  relationship: string;
  /** 1 close .. 3 acquaintance */
  closeness: 1 | 2 | 3;
  profiles: { label: string; url: string; permitted: boolean }[];
  interestedIn: string[];
  lastChecked?: string;
  notes: string;
  updates: { at: string; itemId?: string; summary: string }[];
}

export interface SourcePrefs {
  prioritisedSenders: string[];
  excludedSenders: string[];
  mutedCategories: string[];
  approvedLabels: string[];
}

// ---------------------------------------------------------------- Reader state

export interface Progress {
  itemId: string;
  status: "unread" | "reading" | "read";
  /** 0-1 scroll position within the item */
  position: number;
  lastOpened: string;
  completedAt?: string;
}

export type FeedbackType =
  | "more"
  | "less"
  | "follow"
  | "mute"
  | "dismiss"
  | "save"
  | "unsave"
  | "series-yes"
  | "series-no"
  | "reader-request";

export interface Feedback {
  id: string;
  itemId?: string;
  seriesId?: string;
  type: FeedbackType;
  topic?: string;
  reason?: string;
  at: string;
  /** ids of PreferenceChange entries this produced */
  resulted: string[];
}

export interface AppState {
  v: 1;
  interests: Interest[];
  prefs: Preferences;
  history: PreferenceChange[];
  people: Person[];
  sourcePrefs: SourcePrefs;
  progress: Record<string, Progress>;
  saved: string[];
  dismissed: string[];
  followed: string[]; // topics
  seriesStarted: Record<string, string>; // seriesId -> ISO
  feedback: Feedback[];
  feedSnapshot: string[]; // order shown to the reader; new stories settle in below
  feedSnapshotAt?: string;
  theme: "system" | "light" | "dark";
  seenIntro: boolean;
  redditImports: { at: string; subs: string[] }[];
  hideSamples?: boolean;
  ingestLog?: IngestLogEntry[];
}

export interface IngestLogEntry {
  at: string;
  task: string;
  runId: string;
  accepted: number;
  rejected: number;
  errors: string[];
}
