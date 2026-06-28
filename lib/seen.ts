// Per-device "already typed" tracking via localStorage — no backend needed.
// Each mode keeps its own pool so concept progress and LeetCode progress don't
// collide.

import type { Snippet } from "./snippets";

const PREFIX = "toc.seen.";

function read(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function write(key: string, seen: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify([...seen]));
  } catch {
    // Storage full or unavailable — non-fatal, we just lose no-repeat memory.
  }
}

export function seenIds(key: string): Set<string> {
  return read(key);
}

export function markSeen(key: string, id: string): void {
  const seen = read(key);
  seen.add(id);
  write(key, seen);
}

export function resetSeen(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

/**
 * Pick a random snippet from `pool` that hasn't been seen under `key`.
 * When every snippet has been seen, the pool resets and picks from all again.
 */
export function pickUnseen(key: string, pool: Snippet[]): Snippet | null {
  if (pool.length === 0) return null;
  let seen = read(key);
  let remaining = pool.filter((s) => !seen.has(s.id));
  if (remaining.length === 0) {
    resetSeen(key);
    seen = new Set();
    remaining = pool;
  }
  return remaining[Math.floor(Math.random() * remaining.length)];
}
