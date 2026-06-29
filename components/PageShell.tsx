"use client";

import { useEffect, useState } from "react";
import type { Snippet } from "@/lib/snippets";
import { CONCEPTS } from "@/lib/snippets";
import TypingTest from "./TypingTest";
import LeetCodeImport, { type ImportResult } from "./LeetCodeImport";
import { loadRuns, computeSummary, type StatsSummary, type Run } from "@/lib/stats";

const ASCII = String.raw`
  ____ _  __   ______  _   _
 / ___| | \ \ / /  _ \| | | |
| |  _| |  \ V /| |_) | |_| |
| |_| | |___| | |  __/|  _  |
 \____|_____|_| |_|   |_| |_|
`;

type View = "home" | "concept" | "leetcode" | "stats";

function WpmChart({ runs }: { runs: Run[] }) {
  const last = runs.slice(-30);
  if(last.length < 2) return null;
  const W=600, H=120, PAD=8;
  const wpms = last.map(r => r.wpm);
  const hi = Math.max(...wpms, 1);
  const x = (i: number) => PAD + (i / (last.length - 1)) * (W - PAD * 2);
  const y = (w: number) => H - PAD - (w / hi) * (H - PAD * 2);
  const pts = last.map((r,i) => `${x(i)},${y(r.wpm)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="wpmChart" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--correct)" strokeWidth="1.5" strokeLinejoin="round" />
      {last.map((r,i) => (
        <circle key={i} cx={x(i)} cy={y(r.wpm)} r="3" fill="var(--correct)" />
      ))}
    </svg>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="statPill">
      <span className="statPillValue">{value}</span>
      <span className="statPillLabel">{label}</span>
    </div>
  );
}

function fmt(ms: number) {
  return (ms / 1000).toFixed(1) + "s";
}

function fmtDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function PageShell({ builtins }: { builtins: Snippet[] }) {
  const [view, setView] = useState<View>("home");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const conceptPool = [...CONCEPTS, ...builtins];

  useEffect(() => {
    if (view === "home" || view === "stats") {
      const r = loadRuns();
      setRuns(r);
      setSummary(computeSummary(r));
    }
  }, [view]);

  function goHome() {
    setView("home");
    setResult(null);
  }

  // ── Stats view ──────────────────────────────────────────────────────────────
  if (view === "stats") {
    return (
      <div className="practiceView">
        <div className="statsViewBar">
          <button className="backLink" onClick={goHome}>← back</button>
          <span className="prompt statsViewTitle">user@glyph:~$ stats</span>
        </div>

        {summary && (
          <div className="statsStrip">
            <StatPill label="runs" value={summary.totalRuns} />
            <StatPill label="best wpm" value={summary.bestWpm} />
            <StatPill label="avg wpm" value={summary.avgWpm} />
            <StatPill label="avg acc" value={`${summary.avgAccuracy}%`} />
          </div>
        )}

        {runs.length === 0 ? (
          <p className="importInfo">No runs yet. Complete a problem to see your history.</p>
        ) : (
          <>
          <div className="chartWrap">
            <p className="chartLabel">wpm over last {Math.min(runs.length,30)} runs</p>
            <WpmChart runs={runs} />
          </div>
          <div className="runsTable">
            <div className="runsHeader">
              <span>problem</span>
              <span>wpm</span>
              <span>acc</span>
              <span>time</span>
              <span>date</span>
            </div>
            {[...runs].reverse().map((r, i) => (
              <div key={i} className="runsRow">
                <span className="runTitle">{r.title}{r.partial ? " ·" : ""}</span>
                <span className="runWpm">{r.wpm}</span>
                <span className="runAcc">{r.accuracy}%</span>
                <span className="runTime">{fmt(r.elapsedMs)}</span>
                <span className="runDate">{fmtDate(r.completedAt)}</span>
              </div>
            ))}
          </div>
          </>
        )}
      </div>
    );
  }

  // ── Landing ─────────────────────────────────────────────────────────────────
  if (view === "home") {
    return (
      <div className="landing">
        <div className="winBar">
          <span className="dot dot-red" />
          <span className="dot dot-amber" />
          <span className="dot dot-green" />
          <span className="prompt winPrompt">user@glyph:~$</span>
        </div>

        <div className="landingContent">
          <pre className="ascii" aria-label="Glyph">{ASCII}</pre>
          <p className="heroLead">
            <span className="accent">&gt;</span> Your fingers should know where
            every bracket lives<span className="blink">_</span>
          </p>
          <p className="heroSub">
            You type 80 WPM on prose. Half that on code. OAs don&apos;t care
            about your LinkedIn speed — they care how fast you can write{" "}
            <span className="accent">{"{"}</span>brackets
            <span className="accent">{"}"}</span>, operators, and indented loops
            under pressure. Build the muscle memory for the glyphs you actually
            use.
          </p>
          <div className="modeCards">
            <button className="modeCard" onClick={() => setView("concept")}>
              <span className="modeIcon">🧠</span>
              <span className="modeTitle">Revise a concept</span>
              <span className="modeDesc">
                Type a standard algorithm — sorts, search, BFS/DFS — to refresh
                how it works while you build speed.
              </span>
            </button>
            <button className="modeCard" onClick={() => setView("leetcode")}>
              <span className="modeIcon">📝</span>
              <span className="modeTitle">Revise my solved problems</span>
              <span className="modeDesc">
                Enter your LeetCode username and drill the problems you&apos;ve
                already solved. No login, no cookies.
              </span>
            </button>
          </div>

          {summary && (
            <>
              <div className="statsStrip">
                <StatPill label="runs" value={summary.totalRuns} />
                <StatPill label="best wpm" value={summary.bestWpm} />
                <StatPill label="avg wpm" value={summary.avgWpm} />
                <StatPill label="avg acc" value={`${summary.avgAccuracy}%`} />
              </div>
              <button className="statsBtn" onClick={() => setView("stats")}>
                view full history →
              </button>
            </>
          )}
        </div>

        <footer className="landingFooter">
          <span className="prompt">user@glyph:~$</span> esc to restart · tab+enter
          to skip · indent is automatic
          <span className="blink">&#9612;</span>
        </footer>
      </div>
    );
  }

  // ── Practice view ────────────────────────────────────────────────────────────
  return (
    <div className="practiceView">
      <button className="backLink" onClick={goHome}>
        ← back
      </button>

      {view === "concept" && (
        <TypingTest snippets={conceptPool} seenKey="concept" />
      )}

      {view === "leetcode" &&
        (!result ? (
          <LeetCodeImport onImported={setResult} />
        ) : result.solvedCount === 0 ? (
          <div className="emptyState">
            <p>
              We couldn&apos;t see any solved problems for{" "}
              <strong>{result.username}</strong> — almost always because that
              profile&apos;s <strong>submissions are private</strong>.
            </p>
            <p className="muted">
              LeetCode keeps the <em>list of which problems you solved</em>{" "}
              private by default. To use this mode, make your activity public:
            </p>
            <ol className="muted steps">
              <li>
                Open{" "}
                <a
                  className="linkBtn"
                  href="https://leetcode.com/profile/"
                  target="_blank"
                  rel="noreferrer"
                >
                  LeetCode → Settings → Privacy
                </a>
              </li>
              <li>Turn on public submissions / recent activity</li>
              <li>Re-submit one problem, then try again here</li>
            </ol>
            <button className="linkBtn" onClick={() => setResult(null)}>
              try again
            </button>
          </div>
        ) : result.matched.length === 0 ? (
          <div className="emptyState">
            <p>
              Found <strong>{result.solvedCount}</strong> recently-solved
              problem(s) for <strong>{result.username}</strong>, but none match
              an optimal solution we have <em>yet</em>.
            </p>
            <p className="muted">
              The library is growing — meanwhile, try{" "}
              <button className="linkBtn" onClick={() => setView("concept")}>
                revising a concept
              </button>
              .
            </p>
            <button className="linkBtn" onClick={() => setResult(null)}>
              try another username
            </button>
          </div>
        ) : (
          <>
            <p className="importInfo">
              {result.matched.length} of {result.solvedCount} recent solves
              matched — drilling those, no repeats.
              {result.unmatched.length > 0 &&
                ` (${result.unmatched.length} not yet in our library)`}
            </p>
            <TypingTest
              snippets={result.matched}
              seenKey={`lc.${result.username}`}
            />
          </>
        ))}
    </div>
  );
}
