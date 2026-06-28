// Server-side only. Talks to LeetCode's PUBLIC GraphQL endpoint using just a
// username — no cookies, no login. We can only read public data: the list of
// problems a user has recently solved (names + slugs), never their code.

const GRAPHQL = "https://leetcode.com/graphql";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export interface SolvedProblem {
  titleSlug: string;
  title: string;
}

async function gql<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = await fetch(GRAPHQL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": UA,
      referer: "https://leetcode.com",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`LeetCode responded ${res.status}. Try again in a moment.`);
  }
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) throw new Error("Empty response from LeetCode.");
  return json.data;
}

/**
 * Fetch the user's recently-accepted (solved) problems by public username.
 * The public endpoint only returns the most recent solves and only metadata
 * (title + slug) — never the submitted code. Results are de-duplicated.
 */
export async function getRecentSolved(
  username: string,
  limit = 20
): Promise<SolvedProblem[]> {
  const data = await gql<{
    recentAcSubmissionList: { title: string; titleSlug: string }[] | null;
  }>(
    `query recentAc($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
      }
    }`,
    { username, limit }
  );

  const list = data.recentAcSubmissionList;
  if (!list) {
    throw new Error(`No public activity found for "${username}".`);
  }

  const seen = new Set<string>();
  const solved: SolvedProblem[] = [];
  for (const s of list) {
    if (seen.has(s.titleSlug)) continue;
    seen.add(s.titleSlug);
    solved.push({ titleSlug: s.titleSlug, title: s.title });
  }
  return solved;
}
