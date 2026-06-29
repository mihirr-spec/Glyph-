"use client";

import { useEffect, useState } from "react";
import type { Snippet } from "@/lib/snippets";
import { CONCEPTS } from "@/lib/snippets";
import TypingTest from "./TypingTest";
import { loadRuns, computeSummary, type StatsSummary, type Run } from "@/lib/stats";

const ASCII = String.raw`
  ____ _  __   ______  _   _
 / ___| | \ \ / /  _ \| | | |
| |  _| |  \ V /| |_) | |_| |
| |_| | |___| | |  __/|  _  |
 \____|_____|_| |_|   |_| |_|
`;

type View = "home" | "practice" | "stats";

function WpmChart({ runs }: { runs: Run[] }) {
  const last = runs.slice(-30);
  if (last.length < 2) return null;
  const W = 600, H = 120, PAD = 8;
  const wpms = last.map(r => r.wpm);
  const hi = Math.max(...wpms, 1);
  const x = (i: number) => PAD + (i / (last.length - 1)) * (W - PAD * 2);
  const y = (w: number) => H - PAD - (w / hi) * (H - PAD * 2);
  const pts = last.map((r, i) => `${x(i)},${y(r.wpm)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="wpmChart" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--correct)" strokeWidth="1.5" strokeLinejoin="round" />
      {last.map((r, i) => (
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
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const pool = [...CONCEPTS, ...builtins];

  useEffect(() => {
    if (view === "home" || view === "stats") {
      const r = loadRuns();
      setRuns(r);
      setSummary(computeSummary(r));
    }
  }, [view]);

  // ── Stats view ──────────────────────────────────────────────────────────────
  if (view === "stats") {
    return (
      <div className="practiceView">
        <div className="statsViewBar">
          <button className="backLink" onClick={() => setView("home")}>← back</button>
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
          <p className="importInfo">no runs yet. complete a problem to see your history.</p>
        ) : (
          <>
            <div className="chartWrap">
              <p className="chartLabel">wpm over last {Math.min(runs.length, 30)} runs</p>
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
            <span className="accent">&gt;</span> your fingers should know where
            every bracket lives<span className="blink">_</span>
          </p>
          <p className="heroSub">
            you type 80 wpm on prose. half that on code. oas don&apos;t care
            about your linkedin speed — they care how fast you can write{" "}
            <span className="accent">{"{"}</span>brackets
            <span className="accent">{"}"}</span>, operators, and indented loops
            under pressure. build the muscle memory for the glyphs you actually
            use.
          </p>

          <button className="modeCard" style={{ maxWidth: 420 }} onClick={() => setView("practice")}>
            <span className="modeIcon">🧠</span>
            <span className="modeTitle">start practicing</span>
            <span className="modeDesc">
              type standard algorithms — sorts, search, bfs/dfs, bit manipulation —
              to build speed on the code patterns you actually use in oas.
            </span>
          </button>

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
          <span className="prompt">user@glyph:~$</span> esc to restart · skip to next · indent is automatic
          <span className="blink">&#9612;</span>
        </footer>
      </div>
    );
  }

  // ── Practice view ────────────────────────────────────────────────────────────
  return (
    <div className="practiceView">
      <button className="backLink" onClick={() => setView("home")}>
        ← back
      </button>
      <TypingTest snippets={pool} seenKey="concept" />
    </div>
  );
}
