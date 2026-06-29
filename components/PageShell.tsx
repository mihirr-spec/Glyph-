"use client";

import { useEffect, useState } from "react";
import type { Snippet } from "@/lib/snippets";
import { CONCEPTS } from "@/lib/snippets";
import TypingTest from "./TypingTest";
import LeetCodeImport, { type ImportResult } from "./LeetCodeImport";
import { loadRuns, computeSummary, type StatsSummary } from "@/lib/stats";

const ASCII = String.raw`
  ____ _  __   ______  _   _
 / ___| | \ \ / /  _ \| | | |
| |  _| |  \ V /| |_) | |_| |
| |_| | |___| | |  __/|  _  |
 \____|_____|_| |_|   |_| |_|
`;

type View = "home" | "concept" | "leetcode";

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="statPill">
      <span className="statPillValue">{value}</span>
      <span className="statPillLabel">{label}</span>
    </div>
  );
}

export default function PageShell({ builtins }: { builtins: Snippet[] }) {
  const [view, setView] = useState<View>("home");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const conceptPool = [...CONCEPTS, ...builtins];

  // Load stats from localStorage on mount and whenever we return to home.
  useEffect(() => {
    if (view === "home") setSummary(computeSummary(loadRuns()));
  }, [view]);

  function goHome() {
    setView("home");
    setResult(null);
  }

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
            <div className="statsStrip">
              <StatPill label="runs" value={summary.totalRuns} />
              <StatPill label="best wpm" value={summary.bestWpm} />
              <StatPill label="avg wpm" value={summary.avgWpm} />
              <StatPill label="avg acc" value={`${summary.avgAccuracy}%`} />
            </div>
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
