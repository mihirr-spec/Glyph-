"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Snippet } from "@/lib/snippets";
import { markSeen, seenIds } from "@/lib/seen";
import { saveRun } from "@/lib/stats";
import { IDEAS, PROBLEMS } from "@/lib/ideas";
import styles from "./TypingTest.module.css";

interface Props {
  snippets: Snippet[];
  // When set, completed snippets are remembered in localStorage under this key
  // and unseen ones are surfaced first so the same problem doesn't repeat.
  seenKey?: string;
}

// Order unseen snippets first, then seen — shuffling within each group.
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

// Auto-fill leading whitespace at the start of every line so the typist
// never has to hit space/tab for indentation — they just press Enter.
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
  // Languages available in this snippet set, for the language filter.
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

  const [order, setOrder] = useState<number[]>(() =>
    orderUnseenFirst(pool, seenKey)
  );
  const [pick, setPick] = useState(0);
  const snippet = pool[order[pick % order.length]] ?? pool[0];
  const target = snippet.code;

  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0); // raw chars the user pressed
  const [errors, setErrors] = useState(0); // wrong keypresses (for accuracy)
  const containerRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  const finished = finishedAt !== null;

  const reset = useCallback(
    (advance = false) => {
      setTyped("");
      setStartedAt(null);
      setFinishedAt(null);
      setNow(0);
      setKeystrokes(0);
      setErrors(0);
      if (advance) setPick((p) => p + 1);
      containerRef.current?.focus();
    },
    []
  );

  const shuffle = useCallback(() => {
    setOrder(orderUnseenFirst(pool, seenKey));
    reset();
  }, [pool, seenKey, reset]);

  // Rebuild the typing order whenever the language filter changes the pool.
  useEffect(() => {
    setOrder(orderUnseenFirst(pool, seenKey));
    setPick(0);
    reset();
  }, [pool, seenKey, reset]);

  // Live timer
  useEffect(() => {
    if (startedAt === null || finished) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [startedAt, finished]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        reset();
        return;
      }
      if (finished) return;

      // Ignore modifier combos (let copy/paste etc. pass)
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

      setTyped((t) => {
        if (t.length >= target.length) return t;
        const expected = target[t.length];
        const correct = ch === expected;

        setKeystrokes((k) => k + 1);
        if (!correct) setErrors((x) => x + 1);
        if (startedAt === null) setStartedAt(Date.now());

        let next = t + ch!;

        // On a correct newline, auto-insert the next line's indentation.
        if (correct && expected === "\n") {
          const ws = leadingWhitespaceAt(target, next.length);
          next += ws;
        }

        // Auto-fill any inline spaces after a correct character so the typist
        // focuses on meaningful symbols, not whitespace between tokens.
        if (correct && expected !== "\n") {
          while (next.length < target.length && target[next.length] === " ") {
            next += " ";
          }
        }

        if (next.length >= target.length) {
          setFinishedAt(Date.now());
        }
        return next;
      });
    },
    [finished, reset, startedAt, target]
  );

  useEffect(() => {
    containerRef.current?.focus();
  }, [pick]);

  // Keep the caret visible as the user types.
  useEffect(() => {
    caretRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [typed]);

  // Remember a snippet once it's fully typed so it isn't surfaced again.
  useEffect(() => {
    if (finished && seenKey) markSeen(seenKey, snippet.id);
  }, [finished, seenKey, snippet.id]);

  // Persist completed run to localStorage.
  useEffect(() => {
    if (!finished || finishedAt === null || startedAt === null) return;
    saveRun({
      snippetId: snippet.id,
      title: snippet.title,
      wpm,
      accuracy,
      elapsedMs: finishedAt - startedAt,
      completedAt: finishedAt,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // Stats
  const elapsedMs =
    startedAt === null ? 0 : (finishedAt ?? (now || Date.now())) - startedAt;
  const minutes = elapsedMs / 60000;
  const correctChars = useMemo(() => {
    let c = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) c++;
    return c;
  }, [typed, target]);
  const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
  const accuracy =
    keystrokes > 0
      ? Math.round(((keystrokes - errors) / keystrokes) * 100)
      : 100;
  // Show a dash before any keys are pressed so it doesn't read as a real 100%.
  const accuracyLabel = keystrokes > 0 ? `${accuracy}%` : "—";
  const idea = IDEAS[snippet.id];
  const problem = PROBLEMS[snippet.id];

  return (
    <section className={styles.wrap}>
      <div className={styles.meta}>
        <span className={styles.title}>
          {snippet.title}
          {snippet.url ? (
            <a
              className={styles.problemLink}
              href={snippet.url}
              target="_blank"
              rel="noreferrer"
              title="View problem on LeetCode"
              aria-label={`View ${snippet.title} on LeetCode`}
            >
              🔗
            </a>
          ) : null}
        </span>
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
            {langs.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        )}
      </div>

      {problem && (
        <p className={styles.problem}>
          <strong>Problem:</strong> {problem}
        </p>
      )}

      <div className={styles.stats}>
        <Stat label="wpm" value={wpm} />
        <Stat label="acc" value={accuracyLabel} />
        <Stat label="time" value={`${(elapsedMs / 1000).toFixed(1)}s`} />
      </div>

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
          if (i < typed.length) {
            cls = typed[i] === ch ? styles.correct : styles.incorrect;
          }
          const isCaret = i === typed.length;
          const display =
            ch === "\n" ? "↵\n" : ch === "\t" ? "→   " : ch;
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

      {finished ? (
        <div className={styles.result}>
          <div className={styles.resultBig}>
            <Stat label="wpm" value={wpm} big />
            <Stat label="accuracy" value={`${accuracy}%`} big />
            <Stat
              label="time"
              value={`${(elapsedMs / 1000).toFixed(1)}s`}
              big
            />
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
      ) : (
        <div className={styles.actions}>
          <button className={styles.ghost} onClick={() => reset(true)}>
            skip →
          </button>
          <button className={styles.ghost} onClick={shuffle}>
            shuffle
          </button>
        </div>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  big,
}: {
  label: string;
  value: string | number;
  big?: boolean;
}) {
  return (
    <div className={big ? styles.statBig : styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
