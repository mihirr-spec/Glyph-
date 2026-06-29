# Glyph

You type 80 WPM on prose. Half that on code. OAs don't care about your LinkedIn speed.

**Glyph** is a terminal-style typing trainer where you practice typing real LeetCode-style solutions — brackets, operators, indentation, and all the symbols interviews actually test you on.

## Features

- Full-cover landing → clean practice view, no clutter
- Character-by-character feedback (correct / incorrect / untyped) with a blinking caret
- Auto-scroll — the code window follows your caret so you never lose your place
- **Automatic indentation** — press `Enter` and leading whitespace is filled for you
- Live WPM, accuracy, and timer
- Stats persisted in `localStorage` — best WPM, avg WPM, avg accuracy, total runs
- Two modes: **Revise a concept** (sorts, BFS/DFS, DP, graphs) and **Revise my solved problems** (LeetCode import by username)
- `Esc` to restart · `Tab+Enter` to skip

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 and start typing.

## Stack

Next.js (App Router) · React · TypeScript · CSS Modules. Zero backend — fully client-side, deployable to Vercel.
