import { NextResponse } from "next/server";
import { getRecentSolved } from "@/lib/leetcode";
import { SNIPPETS, slugFromUrl, type Snippet } from "@/lib/snippets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  username?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const username = body.username?.trim();
  if (!username) {
    return NextResponse.json(
      { error: "A LeetCode username is required." },
      { status: 400 }
    );
  }

  try {
    // An empty list (not an error) means the profile keeps submissions private —
    // we still return a 200 so the UI can explain how to make them public.
    const solved = await getRecentSolved(username, 20);

    // Match solved problems against the snippets we have an optimal solution for.
    const bySlug = new Map<string, Snippet>();
    for (const snip of SNIPPETS) {
      const slug = slugFromUrl(snip.url);
      if (slug) bySlug.set(slug, snip);
    }

    const matched: Snippet[] = [];
    for (const p of solved) {
      const snip = bySlug.get(p.titleSlug);
      if (snip) matched.push(snip);
    }

    return NextResponse.json({
      solvedCount: solved.length,
      matched,
      // Solved problems we don't yet have an optimal solution for.
      unmatched: solved
        .filter((p) => !bySlug.has(p.titleSlug))
        .map((p) => ({ title: p.title, url: `https://leetcode.com/problems/${p.titleSlug}/` })),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to load from LeetCode.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
