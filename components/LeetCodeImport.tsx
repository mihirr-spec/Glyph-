"use client";

import { useEffect, useState } from "react";
import type { Snippet } from "@/lib/snippets";
import styles from "./LeetCodeImport.module.css";

export interface ImportResult {
  username: string;
  solvedCount: number;
  matched: Snippet[];
  unmatched: { title: string; url: string }[];
}

interface Props {
  onImported: (result: ImportResult) => void;
}

const USERNAME_KEY = "toc.username";

export default function LeetCodeImport({ onImported }: Props) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(USERNAME_KEY);
    if (saved) setUsername(saved);
  }, []);

  async function handleImport() {
    const name = username.trim();
    setError(null);
    if (!name) {
      setError("Enter your LeetCode username.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/leetcode", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lookup failed.");

      localStorage.setItem(USERNAME_KEY, name);
      onImported({
        username: name,
        solvedCount: data.solvedCount as number,
        matched: data.matched as Snippet[],
        unmatched: data.unmatched as { title: string; url: string }[],
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.panel}>
      <p className={styles.help}>
        Enter your public LeetCode username. We read the problems you&apos;ve
        recently solved — no login, no cookies — and drill you on the ones we have
        an optimal solution for.
      </p>
      <p className={styles.note}>
        Note: LeetCode hides <em>which</em> problems you solved unless your profile
        submissions are public. If nothing loads, that&apos;s why — we&apos;ll show
        you how to fix it.
      </p>

      <label className={styles.field}>
        <span>LeetCode username</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleImport()}
          placeholder="e.g. johndoe"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.submit} onClick={handleImport} disabled={loading}>
        {loading ? "looking up…" : "load my problems"}
      </button>
    </div>
  );
}
