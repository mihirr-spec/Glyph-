# TypeonCode

A Monkeytype-style typing trainer — but instead of random prose, you type real
**LeetCode-style code solutions**. Practice the keystrokes you actually use all
day: brackets, operators, indentation, identifiers.

## Features

- Character-by-character feedback (correct / incorrect / untyped) with a blinking caret
- **Automatic indentation** — just press `Enter`, leading whitespace is filled for you
- Live WPM, accuracy, and timer
- A library of Easy/Medium/Hard problems across Python, JavaScript, Java, and C++
- `Esc` to restart · skip / shuffle / next-problem controls

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000, click the code box, and start typing.

## Add your own problems

Edit `lib/snippets.ts` and add a `Snippet`:

```ts
{
  id: "unique-id",
  title: "Problem Name",
  difficulty: "Medium",
  language: "python",
  code: `def solution():\n    ...`,
}
```

## Stack

Next.js (App Router) · React · TypeScript · CSS Modules. Zero backend — fully
client-side and deployable to Vercel as a static app.
