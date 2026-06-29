const KEY = "glyph.stats";
const MAX_RUNS = 500;

export interface Run {
  snippetId: string;
  title: string;
  wpm: number;
  accuracy: number;
  elapsedMs: number;
  completedAt: number;
  partial?: boolean;
}

export interface StatsSummary {
  totalRuns: number;
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
}

export function loadRuns(): Run[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Run[]) : [];
  } catch {
    return [];
  }
}

export function saveRun(run: Run): void {
  const runs = loadRuns();
  runs.push(run);
  if (runs.length > MAX_RUNS) runs.splice(0, runs.length - MAX_RUNS);
  localStorage.setItem(KEY, JSON.stringify(runs));
}

export function computeSummary(runs: Run[]): StatsSummary | null {
  if (runs.length === 0) return null;
  const wpms = runs.map((r) => r.wpm).filter((w) => w > 0);
  return {
    totalRuns: runs.length,
    bestWpm: Math.max(...wpms),
    avgWpm: wpms.length > 0 ? Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length) : 0,
    avgAccuracy: Math.round(runs.reduce((a, r) => a + r.accuracy, 0) / runs.length),
  };
}
