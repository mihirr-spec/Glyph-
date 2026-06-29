"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Snippet } from "@/lib/snippets";
import { markSeen, seenIds } from "@/lib/seen";
import { saveRun } from "@/lib/stats";
import { IDEAS, PROBLEMS } from "@/lib/ideas";
import styles from "./TypingTest.module.css";

interface Props {
  snippets: Snippet[];
  seenKey?: string;
}

type Mode = "snippet" | "time";
const TIME_OPTIONS = [10, 20, 30, 40] as const;
type TimeOption = (typeof TIME_OPTIONS)[number];

function orderUnseenFirst(snippets: Snippet[], seenKey?: string): number[] {
  const indices = snippets.map((_, i) => i);
  const shuffle = (a: number[]) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  if (!seenKey) return shuffle(indices);
  const seen = seenIds(seenKey);
  const unseen = shuffle(indices.filter((i) => !seen.has(snippets[i].id)));
  const done = shuffle(indices.filter((i) => seen.has(snippets[i].id)));
  return [...unseen, ...done];
}

function leadingWhitespaceAt(text: string, index: number): string {
  let ws = "";
  let i = index;
  while (i < text.length && (text[i] === " " || text[i] === "\t")) {
    ws += text[i];
    i++;
  }
  return ws;
}

export default function TypingTest({ snippets, seenKey }: Props) {
  const langs = useMemo(
    () => Array.from(new Set(snippets.map((s) => String(s.language)))),
    [snippets]
  );
  const [langFilter, setLangFilter] = useState<string>(() =>
    langs.includes("cpp") ? "cpp" : "all"
  );
  const pool = useMemo(
    () =>
      langFilter === "all"
        ? snippets
        : snippets.filter((s) => String(s.language) === langFilter),
    [snippets, langFilter]
  );

  const [mode, setMode] = useState<Mode>("snippet");
  const [timeLimit, setTimeLimit] = useState<TimeOption>(30);

  const [order, setOrder] = useState<number[]>(() => orderUnseenFirst(pool, seenKey));
  const [pick, setPick] = useState(0);
  const snippet = pool[order[pick % order.length]] ?? pool[0];
  const target = snippet.code;

  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  // Time mode
  const [timeDone, setTimeDone] = useState(false);
  const [timeResult, setTimeResult] = useState<{ wpm: number; accuracy: number; chars: number } | null>(null);
  const [accChars, setAccChars] = useState(0); // correct chars across completed snippets (display)
  const accCharsRef = useRef(0);  // correct chars (source of truth)
  const accTotalRef = useRef(0);  // total chars typed across completed snippets

  const containerRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  const snippetFinished = finishedAt !== null;
  const isOver = snippetFinished || timeDone;

  const reset = useCallback((advance = false) => {
    setTyped("");
    setStartedAt(null);
    setFinishedAt(null);
    setNow(0);
    setTimeDone(false);
    setTimeResult(null);
    setAccChars(0);
    accCharsRef.current = 0;
    accTotalRef.current = 0;
    if (advance) setPick((p) => p + 1);
    containerRef.current?.focus();
  }, []);

  function changeMode(newMode: Mode, newLimit?: TimeOption) {
    setMode(newMode);
    if (newLimit !== undefined) setTimeLimit(newLimit);
    reset();
  }

  function skip() {
    if (startedAt !== null && !isOver && typed.length >= 10) {
      const elapsedMs = Date.now() - startedAt;
      const mins = elapsedMs / 60000;
      const cc = typed.split("").filter((c, i) => c === target[i]).length;
      saveRun({
        snippetId: snippet.id,
        title: snippet.title,
        wpm: mins > 0 ? Math.round(cc / 5 / mins) : 0,
        accuracy: typed.length > 0 ? Math.round((cc / typed.length) * 100) : 100,
        elapsedMs,
        completedAt: Date.now(),
        partial: true,
      });
    }
    reset(true);
  }

  function stopTimedRun() {
    if (startedAt === null) { reset(); return; }
    const elapsed = Date.now() - startedAt;
    const cc = typed.split("").filter((c, i) => c === target[i]).length;
    accCharsRef.current += cc;
    accTotalRef.current += typed.length;
    finaliseTimedRun(elapsed);
  }

  function finaliseTimedRun(elapsedMs: number) {
    const totalCorrect = accCharsRef.current;
    const totalTyped = accTotalRef.current;
    const wpm = Math.round(totalCorrect / 5 / (elapsedMs / 60000));
    const accuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;
    saveRun({
      snippetId: `timed-${timeLimit}s`,
      title: `${timeLimit}s timed`,
      wpm,
      accuracy,
      elapsedMs,
      completedAt: Date.now(),
    });
    setAccChars(totalCorrect);
    setTimeResult({ wpm, accuracy, chars: totalCorrect });
    setTimeDone(true);
  }

  const shuffle = useCallback(() => {
    setOrder(orderUnseenFirst(pool, seenKey));
    reset();
  }, [pool, seenKey, reset]);

  useEffect(() => {
    setOrder(orderUnseenFirst(pool, seenKey));
    setPick(0);
    reset();
  }, [pool, seenKey, reset]);

  useEffect(() => {
    if (startedAt === null || isOver) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt, isOver]);

  // Detect time-mode end
  useEffect(() => {
    if (mode !== "time" || startedAt === null || timeDone || now === 0) return;
    if (now - startedAt < timeLimit * 1000) return;
    const cc = typed.split("").filter((c, i) => c === target[i]).length;
    accCharsRef.current += cc;
    accTotalRef.current += typed.length;
    finaliseTimedRun(timeLimit * 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); reset(); return; }
      if (isOver) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        setTyped((t) => t.slice(0, -1));
        return;
      }

      let ch: string | null = null;
      if (e.key === "Enter") ch = "\n";
      else if (e.key === "Tab") ch = "\t";
      else if (e.key.length === 1) ch = e.key;
      if (ch === null) return;
      e.preventDefault();

      const currentMode = mode;

      setTyped((t) => {
        if (t.length >= target.length) return t;
        const expected = target[t.length];
        const correct = ch === expected;

        if (startedAt === null) setStartedAt(Date.now());

        let next = t + ch!;
        if (correct && expected === "\n") {
          next += leadingWhitespaceAt(target, next.length);
        }

        if (next.length >= target.length) {
          if (currentMode === "time") {
            const cc = [...next].filter((c, i) => c === target[i]).length;
            accCharsRef.current += cc;
            accTotalRef.current += next.length;
            setAccChars(accCharsRef.current);
            setPick((p) => p + 1);
            return "";
          } else {
            setFinishedAt(Date.now());
          }
        }
        return next;
      });
    },
    [isOver, reset, startedAt, target, mode]
  );

  useEffect(() => { containerRef.current?.focus(); }, [pick]);
  useEffect(() => { caretRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [typed]);
  useEffect(() => { if (snippetFinished && seenKey) markSeen(seenKey, snippet.id); }, [snippetFinished, seenKey, snippet.id]);

  useEffect(() => {
    if (!snippetFinished || finishedAt === null || startedAt === null) return;
    saveRun({
      snippetId: snippet.id,
      title: snippet.title,
      wpm,
      accuracy,
      elapsedMs: finishedAt - startedAt,
      completedAt: finishedAt,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippetFinished]);

  // Stats (final-state accuracy: backspace and correct = better accuracy)
  const elapsedMs = startedAt === null ? 0 : (finishedAt ?? (now || Date.now())) - startedAt;
  const minutes = elapsedMs / 60000;
  const correctChars = useMemo(() => {
    let c = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) c++;
    return c;
  }, [typed, target]);
  const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
  const wpmLabel = startedAt === null || elapsedMs < 2000 ? "—" : String(wpm);
  const accuracy = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100;
  const accuracyLabel = typed.length > 0 ? `${accuracy}%` : "—";
  const totalWords = Math.round(target.length / 5);
  const typedWords = Math.round(correctChars / 5);

  const liveNow = now || (startedAt ? Date.now() : 0);
  const remaining =
    mode === "time"
      ? startedAt === null
        ? timeLimit
        : Math.max(0, timeLimit - Math.floor((liveNow - startedAt) / 1000))
      : null;
  const liveTimeWpm =
    startedAt !== null && elapsedMs > 2000
      ? Math.round((accChars + correctChars) / 5 / (elapsedMs / 60000))
      : 0;

  const idea = IDEAS[snippet.id];
  const problem = PROBLEMS[snippet.id];
  const typing = startedAt !== null && !isOver;

  return (
    <section className={styles.wrap}>
      <div className={styles.modeBar}>
        <button
          className={mode === "snippet" ? styles.modeActive : styles.modeBtn}
          onClick={() => changeMode("snippet")}
          disabled={typing}
        >
          snippet
        </button>
        <span className={styles.modeSep}>|</span>
        {TIME_OPTIONS.map((t) => (
          <button
            key={t}
            className={mode === "time" && timeLimit === t ? styles.modeActive : styles.modeBtn}
            onClick={() => changeMode("time", t)}
            disabled={typing}
          >
            {t}s
          </button>
        ))}
      </div>

      <div className={styles.meta}>
        <span className={styles.title}>{snippet.title}</span>
        <span className={`${styles.badge} ${styles[snippet.difficulty]}`}>
          {snippet.difficulty}
        </span>
        {langs.length > 1 && (
          <select
            className={styles.langSelect}
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
          >
            <option value="all">all</option>
            {langs.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
      </div>

      {problem && (
        <p className={styles.problem}>
          <strong>problem:</strong> {problem}
        </p>
      )}

      {/* Hide live stats once results are showing */}
      {!isOver && (
        mode === "time" ? (
          <div className={styles.stats}>
            <div className={`${styles.stat} ${remaining !== null && remaining <= 5 ? styles.urgent : ""}`}>
              <span className={styles.statValue} style={{ fontSize: 36 }}>
                {remaining ?? timeLimit}
              </span>
              <span className={styles.statLabel}>seconds</span>
            </div>
            <Stat label="wpm" value={liveTimeWpm > 0 ? String(liveTimeWpm) : "—"} />
            <Stat label="acc" value={accuracyLabel} />
          </div>
        ) : (
          <div className={styles.stats}>
            <Stat label="wpm" value={wpmLabel} />
            <Stat label="acc" value={accuracyLabel} />
            <Stat label="time" value={`${(elapsedMs / 1000).toFixed(1)}s`} />
            <Stat label="words" value={`${typedWords}/${totalWords}`} />
          </div>
        )
      )}

      <div
        ref={containerRef}
        className={styles.code}
        tabIndex={0}
        role="textbox"
        aria-label="Typing area"
        onKeyDown={handleKey}
        onClick={() => containerRef.current?.focus()}
      >
        {target.split("").map((ch, i) => {
          let cls = styles.untyped;
          if (i < typed.length) cls = typed[i] === ch ? styles.correct : styles.incorrect;
          const isCaret = i === typed.length;
          const display = ch === "\t" ? "    " : ch;
          return (
            <span
              key={i}
              ref={isCaret ? caretRef : undefined}
              className={`${cls} ${isCaret ? styles.caret : ""}`}
            >
              {display}
            </span>
          );
        })}
        {typed.length >= target.length && (
          <span ref={caretRef} className={`${styles.untyped} ${styles.caret}`}>&nbsp;</span>
        )}
      </div>

      {isOver ? (
        mode === "time" && timeResult ? (
          <div className={styles.result}>
            <div className={styles.resultBig}>
              <Stat label="wpm" value={timeResult.wpm} big />
              <Stat label="accuracy" value={`${timeResult.accuracy}%`} big />
              <Stat label="chars" value={timeResult.chars} big />
            </div>
            <div className={styles.actions}>
              <button className={styles.primary} onClick={() => reset()}>
                try again →
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.result}>
            <div className={styles.resultBig}>
              <Stat label="wpm" value={wpm} big />
              <Stat label="accuracy" value={`${accuracy}%`} big />
              <Stat label="time" value={`${(elapsedMs / 1000).toFixed(1)}s`} big />
            </div>
            {idea && (
              <p className={styles.idea}>
                <span className={styles.ideaTag}>// idea</span> {idea}
              </p>
            )}
            <div className={styles.actions}>
              <button className={styles.primary} onClick={() => reset(true)}>
                next problem →
              </button>
              <button className={styles.ghost} onClick={() => reset()}>
                retry
              </button>
            </div>
          </div>
        )
      ) : (
        <div className={styles.actions}>
          {mode === "time" ? (
            <button className={styles.ghost} onClick={stopTimedRun}>stop</button>
          ) : (
            <>
              <button className={styles.ghost} onClick={skip}>skip →</button>
              <button className={styles.ghost} onClick={shuffle}>shuffle</button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, big }: { label: string; value: string | number; big?: boolean }) {
  return (
    <div className={big ? styles.statBig : styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
