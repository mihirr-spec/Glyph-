"use client";

import { useState } from "react";
import type { Snippet } from "@/lib/snippets";
import { CONCEPTS } from "@/lib/snippets";
import TypingTest from "./TypingTest";
import LeetCodeImport, { type ImportResult } from "./LeetCodeImport";

interface Props {
  builtins: Snippet[];
  onViewChange?: (isHome: boolean) => void;
}

type View = "home" | "concept" | "leetcode";

export default function TrainerApp({ builtins, onViewChange }: Props) {
  const [view, setView] = useState<View>("home");

  function navigate(next: View) {
    setView(next);
    onViewChange?.(next === "home");
  }
  const [result, setResult] = useState<ImportResult | null>(null);

  // Concept mode draws on the standard algorithms plus the curated problems.
  const conceptPool = [...CONCEPTS, ...builtins];

  if (view === "home") {
    return (
      <div className="modeCards">
        <button className="modeCard" onClick={() => navigate("concept")}>
          <span className="modeIcon">🧠</span>
          <span className="modeTitle">Revise a concept</span>
          <span className="modeDesc">
            Type a standard algorithm — sorts, search, BFS/DFS — to refresh how it
            works while you build speed.
          </span>
        </button>
        <button className="modeCard" onClick={() => navigate("leetcode")}>
          <span className="modeIcon">📝</span>
          <span className="modeTitle">Revise my solved problems</span>
          <span className="modeDesc">
            Enter your LeetCode username and drill the problems you&apos;ve already
            solved. No login, no cookies.
          </span>
        </button>
      </div>
    );
  }

  if (view === "concept") {
    return (
      <>
        <button className="backLink" onClick={() => navigate("home")}>
          ← back
        </button>
        <TypingTest snippets={conceptPool} seenKey="concept" />
      </>
    );
  }

  // view === "leetcode"
  return (
    <>
      <button
        className="backLink"
        onClick={() => {
          navigate("home");
          setResult(null);
        }}
      >
        ← back
      </button>

      {!result ? (
        <LeetCodeImport onImported={setResult} />
      ) : result.solvedCount === 0 ? (
        <div className="emptyState">
          <p>
            We couldn&apos;t see any solved problems for{" "}
            <strong>{result.username}</strong> — almost always because that
            profile&apos;s <strong>submissions are private</strong>.
          </p>
          <p className="muted">
            LeetCode keeps the <em>list of which problems you solved</em> private
            by default (only the total count is public). To use this mode, make
            your activity public:
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
            Found <strong>{result.solvedCount}</strong> recently-solved problem(s)
            for <strong>{result.username}</strong>, but none match an optimal
            solution we have <em>yet</em>.
          </p>
          <p className="muted">
            The library is growing — meanwhile, try{" "}
            <button className="linkBtn" onClick={() => navigate("concept")}>
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
            {result.matched.length} of {result.solvedCount} recent solves matched —
            drilling those, no repeats.
            {result.unmatched.length > 0 &&
              ` (${result.unmatched.length} not yet in our library)`}
          </p>
          <TypingTest
            snippets={result.matched}
            seenKey={`lc.${result.username}`}
          />
        </>
      )}
    </>
  );
}
