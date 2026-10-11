// Reddit onboarding. No API: the reader pastes subreddit names and we infer
// themes from a built-in map. Unknown communities are surfaced honestly as
// "I don't recognise this one" rather than guessed at; the editor's
// interest-inference task can classify those later.
import type { AppState, Evidence } from "./types";
import { createInterest, addEvidence, findInterest, nowIso, uid, withChange, norm } from "./ledger";

export function parseSubreddits(text: string): string[] {
  const found = new Set<string>();
  // Accept: r/foo, /r/foo, reddit.com/r/foo, bare words one per line or comma/space separated.
  const re = /(?:reddit\.com)?\/?r\/([A-Za-z0-9_]{2,21})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) found.add(m[1].toLowerCase());
  if (found.size === 0) {
    for (const tok of text.split(/[\s,;|]+/)) {
      const t = tok.replace(/^\/?r\//i, "").replace(/[^A-Za-z0-9_]/g, "");
      if (t.length >= 2 && t.length <= 21) found.add(t.toLowerCase());
    }
  }
  return [...found];
}

interface Theme {
  name: string;
  description: string;
  related: string[];
}

const T = (name: string, description: string, related: string[]): Theme => ({ name, description, related });

const THEMES = {
  space: T("Commercial spaceflight", "Launch vehicles, spacecraft engineering, commercial space businesses and exploration.", ["rockets", "launch vehicles", "spaceflight", "space exploration", "orbital mechanics"]),
  astro: T("Astronomy and cosmology", "What we're learning about the universe, and how.", ["astronomy", "cosmology", "telescopes", "planets"]),
  watches: T("Mechanical watches", "Watchmaking, precision engineering, design and history.", ["horology", "watchmaking", "watches", "collecting", "craftsmanship"]),
  productDesign: T("Product and interaction design", "Interaction design, design systems, industrial design and how products feel.", ["interaction design", "ux", "design systems", "industrial design", "typography"]),
  ai: T("AI and product design", "Generative UI, AI-first products, creative tools and how AI changes the craft of design.", ["generative ui", "ai products", "creative tools", "machine learning", "llms"]),
  ai2: T("Artificial intelligence", "Capabilities, research and consequences of modern AI.", ["machine learning", "llms", "ai research", "robotics"]),
  computing: T("Computing history", "Early computers, graphical interfaces and the people who built them.", ["retrocomputing", "graphical interfaces", "early personal computing", "xerox parc"]),
  engineering: T("Engineering and how things work", "Mechanisms, materials, infrastructure and the clever bits behind everyday things.", ["mechanical engineering", "materials", "infrastructure", "mechanisms"]),
  history: T("History", "Stories from the past, especially the overlooked, technical and surprising.", ["world history", "military history", "history of science", "forgotten events"]),
  science: T("Science", "Discoveries and the way science actually works.", ["biology", "physics", "chemistry", "medicine"]),
  nature: T("Nature and the natural world", "Animals, ecosystems, geology and the weirdness of living things.", ["animals", "ecology", "geology", "oceans"]),
  football: T("Football", "The game: tactics, history, and grassroots football.", ["soccer", "coaching", "club football", "tactics"]),
  sport: T("Sport", "Sporting stories, rivalries and seasons.", ["cricket", "rugby", "cycling", "motorsport", "athletics"]),
  motorsport: T("Motorsport", "Engineering and drama in racing.", ["formula 1", "racing", "engineering"]),
  film: T("Film and television", "Craft, history and criticism.", ["cinema", "tv", "directors"]),
  music: T("Music and sound", "Music history, production and listening.", ["lofi", "production", "synths", "audio"]),
  books: T("Books and writing", "Reading, writing and the history of publishing.", ["literature", "fiction", "essays"]),
  games: T("Games and game design", "Cosy and indie games, design craft and game history.", ["indie games", "cosy games", "game design"]),
  food: T("Food and cooking", "Technique, science and culture of food.", ["cooking", "baking", "coffee", "kitchen science"]),
  coffee: T("Coffee and tea", "Brewing, origin and ritual.", ["espresso", "tea", "brewing"]),
  money: T("Money and personal finance", "How money works. Treated with a strict materiality filter.", ["investing", "economics", "personal finance"]),
  parenting: T("Family and parenting", "Raising kids, family life and education.", ["parenting", "education", "schools"]),
  pets: T("Dogs and pets", "Living well with animals.", ["dogs", "french bulldogs", "pet health"]),
  home: T("Home and making", "Renovation, tools, woodworking and practical craft.", ["diy", "woodworking", "renovation", "tools"]),
  photo: T("Photography", "Seeing, composition and cameras.", ["cameras", "composition", "film photography"]),
  architecture: T("Architecture and cities", "Buildings, urbanism and how places work.", ["urbanism", "buildings", "transport"]),
  tech: T("Consumer technology", "Devices, software and the industry behind them.", ["gadgets", "software", "apple", "microsoft"]),
  programming: T("Software and programming", "Craft of building software.", ["programming", "web development", "open source"]),
  fitness: T("Health and fitness", "Training, nutrition and long-term health.", ["running", "strength training", "nutrition"]),
  outdoors: T("Outdoors and travel", "Walking, camping, travel and places.", ["hiking", "travel", "camping", "australia"]),
  aviation: T("Aviation", "How planes work and the history of flight.", ["aircraft", "airlines", "concorde"]),
  celeb: T("Celebrity controversy", "Gossip and celebrity drama.", []),
} as const;

type ThemeKey = keyof typeof THEMES;

// subreddit (lowercase) -> themes
const MAP: Record<string, ThemeKey[]> = {
  spacex: ["space"], space: ["space", "astro"], nasa: ["space"], rocketry: ["space", "engineering"], spaceporn: ["astro"],
  astronomy: ["astro"], astrophotography: ["astro", "photo"], blueorigin: ["space"], starship: ["space"],
  watches: ["watches"], watchescirclejerk: ["watches"], seiko: ["watches"], rolex: ["watches"], omega: ["watches"],
  watchporn: ["watches"], horology: ["watches"], microbrandwatches: ["watches"], affordablewatches: ["watches"], watchexchange: ["watches"],
  design: ["productDesign"], userexperience: ["productDesign"], ux_design: ["productDesign"], uxdesign: ["productDesign"], web_design: ["productDesign"],
  industrialdesign: ["productDesign", "engineering"], typography: ["productDesign"], graphic_design: ["productDesign"], figma: ["productDesign"],
  designporn: ["productDesign"], interactiondesign: ["productDesign"],
  chatgpt: ["ai", "ai2"], openai: ["ai2"], claudeai: ["ai", "ai2"], anthropic: ["ai2"], localllama: ["ai2"], singularity: ["ai2"],
  artificial: ["ai2"], machinelearning: ["ai2"], stablediffusion: ["ai"], midjourney: ["ai"], aiart: ["ai"], claudecode: ["ai", "programming"],
  cursor: ["ai", "programming"], futurology: ["ai2", "science"],
  retrobattlestations: ["computing"], vintagecomputing: ["computing"], apple: ["tech", "computing"], mac: ["tech", "computing"],
  macsetups: ["tech", "productDesign"], hackernews: ["tech", "programming"], retrocomputing: ["computing"],
  engineering: ["engineering"], mechanicalengineering: ["engineering"], engineeringporn: ["engineering"], civilengineering: ["engineering", "architecture"],
  askengineers: ["engineering"], mildlyinteresting: ["history"], theydidthemath: ["science"], damnthatsinteresting: ["science", "history"],
  todayilearned: ["history", "science"], history: ["history"], askhistorians: ["history"], historyporn: ["history"], badhistory: ["history"],
  militaryhistory: ["history"], depthhub: ["history", "books"], science: ["science"], askscience: ["science"], biology: ["science"],
  physics: ["science"], chemistry: ["science"], medicine: ["science"], nature: ["nature"], natureismetal: ["nature"], aquariums: ["nature"],
  soccer: ["football"], football: ["football"], coachingsoccer: ["football"], premierleague: ["football"], a_league: ["football"], aleague: ["football"],
  socceroos: ["football"], matildas: ["football"], footballtactics: ["football"], coaching: ["football"], coachsoccer: ["football"],
  formula1: ["motorsport"], f1technical: ["motorsport", "engineering"], motorsport: ["motorsport"], nrl: ["sport"], cricket: ["sport"],
  afl: ["sport"], tennis: ["sport"], cycling: ["sport"], nba: ["sport"], nfl: ["sport"], running: ["fitness"],
  movies: ["film"], television: ["film"], criterion: ["film"], truefilm: ["film"], filmmakers: ["film"],
  music: ["music"], listentothis: ["music"], lofi: ["music"], lofihiphop: ["music"], synthesizers: ["music"], wearethemusicmakers: ["music"],
  books: ["books"], literature: ["books"], suggestmeabook: ["books"], writing: ["books"], truereddit: ["books"],
  games: ["games"], cozygames: ["games"], indiegaming: ["games"], gamedev: ["games", "programming"], stardewvalley: ["games"], nintendoswitch: ["games"],
  coffee: ["coffee", "food"], espresso: ["coffee"], tea: ["coffee"], cooking: ["food"], food: ["food"], baking: ["food"], breadit: ["food"],
  personalfinance: ["money"], ausfinance: ["money"], investing: ["money"], fire: ["money"], australianproperty: ["money"], etfs: ["money"],
  parenting: ["parenting"], daddit: ["parenting"], teachers: ["parenting"], australianteachers: ["parenting"],
  frenchbulldogs: ["pets"], dogs: ["pets"], dogtraining: ["pets"], aww: ["pets"], dogswithjobs: ["pets"],
  diy: ["home"], woodworking: ["home"], homeimprovement: ["home"], fixit: ["home", "engineering"], tools: ["home"], australianrenovations: ["home"],
  photography: ["photo"], itookapicture: ["photo"], analog: ["photo"],
  architecture: ["architecture"], urbanplanning: ["architecture"], cityporn: ["architecture"], fuckcars: ["architecture"], infrastructureporn: ["architecture", "engineering"],
  technology: ["tech"], gadgets: ["tech"], programming: ["programming"], webdev: ["programming"], learnprogramming: ["programming"], reactjs: ["programming"],
  typescript: ["programming"], nextjs: ["programming"], fitness: ["fitness"], bodyweightfitness: ["fitness"],
  australia: ["outdoors"], newcastle: ["outdoors"], hiking: ["outdoors"], camping: ["outdoors"], travel: ["outdoors"], bushwalking: ["outdoors"],
  aviation: ["aviation"], flying: ["aviation"], avgeek: ["aviation"], boeing: ["aviation"], concorde: ["aviation"],
  popculturechat: ["celeb"], entertainment: ["celeb"], celebritygossip: ["celeb"], lipstickalley: ["celeb"], hollywoodgossip: ["celeb"],
};

export interface RedditSuggestion {
  id: string;
  name: string;
  description: string;
  related: string[];
  confidence: number;
  weight: number;
  subs: string[];
  /** If it matches something already in the ledger */
  mergeInto?: { id: string; name: string; locked: boolean; origin: string; status: string };
  /** Starts approved unless it is a themed exclusion candidate */
  approved: boolean;
  note?: string;
}

export interface RedditAnalysis {
  suggestions: RedditSuggestion[];
  unknown: string[];
  total: number;
}

export function analyseSubreddits(subs: string[], state: AppState): RedditAnalysis {
  const buckets = new Map<ThemeKey, string[]>();
  const unknown: string[] = [];
  for (const sub of subs) {
    const keys = MAP[sub.toLowerCase()];
    if (!keys) { unknown.push(sub); continue; }
    for (const k of keys) buckets.set(k, [...(buckets.get(k) ?? []), sub]);
  }
  const suggestions: RedditSuggestion[] = [];
  for (const [key, list] of buckets) {
    const theme = THEMES[key];
    // Confidence: one community is a hint; several is a pattern. Never above 0.85 from this source alone.
    const confidence = Math.min(0.85, 0.35 + 0.17 * list.length);
    const hit = findInterest(state.interests, theme.name);
    const gossip = key === "celeb";
    suggestions.push({
      id: key,
      name: theme.name,
      description: theme.description,
      related: [...theme.related],
      confidence,
      weight: Math.min(0.8, 0.35 + 0.1 * list.length),
      subs: list,
      mergeInto: hit ? { id: hit.id, name: hit.name, locked: hit.locked, origin: hit.origin, status: hit.status } : undefined,
      approved: !gossip,
      note: gossip ? "This looks like gossip. I've left it unticked. Tick it only if you actually want it; you could also exclude it." : undefined,
    });
  }
  suggestions.sort((a, b) => b.subs.length - a.subs.length || b.confidence - a.confidence);
  return { suggestions, unknown, total: subs.length };
}

/** Commit the approved suggestions. Explicit/locked entries only ever receive evidence. */
export function commitRedditSuggestions(
  state: AppState,
  chosen: RedditSuggestion[],
  allSubs: string[],
): { state: AppState; created: number; merged: number; protectedCount: number } {
  let s = state;
  let created = 0, merged = 0, protectedCount = 0;
  for (const sug of chosen) {
    const ev: Omit<Evidence, "id" | "at"> = {
      type: "reddit",
      explanation: `Subscribed to ${sug.subs.map((x) => "r/" + x).join(", ")}.`,
      confidence: sug.confidence,
    };
    const existing = findInterest(s.interests, sug.name);
    if (existing) {
      s = addEvidence(s, existing.id, ev);
      // Fill gaps in related subjects only if it's an inferred, unlocked entry.
      if (!existing.locked && existing.origin === "inferred") {
        const rel = [...new Set([...existing.related, ...sug.related])];
        s = { ...s, interests: s.interests.map((i) => (i.id === existing.id ? { ...i, related: rel } : i)) };
      } else protectedCount++;
      const r = withChange(s, {
        property: `interest:${existing.id}.evidence`,
        label: `${existing.name} · evidence`,
        previous: null,
        next: ev.explanation,
        origin: "reddit",
        explanation: "Reddit import added supporting evidence. Your settings for this interest were not changed.",
        undo: { kind: "none" },
      });
      s = r.state;
      merged++;
    } else {
      const c = createInterest(
        s,
        { name: sug.name, description: sug.description, related: sug.related, weight: sug.weight, confidence: sug.confidence, origin: "inferred", evidence: [ev] },
        "reddit",
        `Suggested from your subreddits (${sug.subs.map((x) => "r/" + x).join(", ")}) and approved by you.`,
      );
      s = c.state;
      created++;
    }
  }
  s = { ...s, redditImports: [{ at: nowIso(), subs: allSubs }, ...s.redditImports] };
  return { state: s, created, merged, protectedCount };
}


