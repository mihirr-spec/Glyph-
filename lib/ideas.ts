// One-line "core idea" per snippet, shown after a problem is completed so the
// typist can revise the concept on the go. Keyed by snippet id.

export const IDEAS: Record<string, string> = {
  // Curated LeetCode-style
  "two-sum-py":
    "Hash each number to its index; for every value check if its complement was already seen — O(n).",
  "reverse-list-py":
    "Walk the list once, flipping each node's next pointer to the previous node.",
  "valid-parens-js":
    "Push opening brackets onto a stack; on a closer, the top must be its match.",
  "max-subarray-js":
    "Kadane's: keep a running sum, restart it whenever it dips below the current number.",
  "binary-search-java":
    "Halve the search range each step by comparing the middle element to the target — O(log n).",
  "fib-cpp":
    "Climbing stairs = Fibonacci: each step's ways = sum of the previous two.",
  "merge-py":
    "Sort by start, then merge any interval that overlaps the last one kept.",
  "anagram-js":
    "Count each char in the first string, decrement for the second; all counts must hit zero.",

  // Concept algorithms
  "bubble-sort-py":
    "Repeatedly swap adjacent out-of-order pairs; largest 'bubbles' to the end each pass. O(n^2).",
  "selection-sort-py":
    "Each pass selects the smallest remaining element and places it at the front. O(n^2).",
  "insertion-sort-js":
    "Grow a sorted prefix by inserting each new element into its correct spot. Great on nearly-sorted data.",
  "quick-sort-py":
    "Pick a pivot, partition into smaller/equal/larger, recurse. Average O(n log n).",
  "merge-sort-js":
    "Divide in half, sort each, then merge two sorted halves. Stable, guaranteed O(n log n).",
  "heap-sort-py":
    "Build a heap, then repeatedly pop the min/max. O(n log n), in-place with an array heap.",
  "counting-sort-py":
    "Count occurrences of each value, then emit them in order. O(n+k), only for bounded integers.",
  "shell-sort-js":
    "Insertion sort across decreasing gaps so elements move far quickly before fine-tuning.",
  "linear-search-py":
    "Scan every element until the target is found. O(n) — the baseline search.",
  "bfs-py":
    "Explore level by level using a queue; finds shortest paths in unweighted graphs.",
  "dfs-py":
    "Go as deep as possible before backtracking; uses recursion (or an explicit stack).",
  "kadane-py":
    "Track the best subarray ending here; reset when the running sum turns negative.",
  "fib-dp-py":
    "Build answers bottom-up so each subproblem is solved once. Classic intro to DP.",
  "knapsack-py":
    "For each item choose take/skip; dp[i][w] = best value within weight w. O(n*capacity).",
  "lcs-py":
    "Match characters: equal -> diagonal+1, else carry the best of left/up. O(m*n).",
  "lis-js":
    "Patience sorting: keep the smallest possible tail per length via binary search. O(n log n).",
  "coin-change-py":
    "Unbounded DP: dp[x] = fewest coins to make x, building up from 0.",
  "edit-distance-py":
    "DP over insert/delete/replace; dp[i][j] = min edits to convert prefixes. O(m*n).",
  "dijkstra-py":
    "Greedily expand the closest unvisited node using a min-heap. Non-negative weights only.",
  "topo-sort-py":
    "Repeatedly emit nodes with no remaining prerequisites (indegree 0). DAGs only.",
  "union-find-py":
    "Track set membership with path compression + union by rank — near O(1) per op.",
  "kmp-py":
    "Precompute a longest-prefix-suffix table so matching never re-scans characters. O(n+m).",
  "euclid-gcd-py":
    "GCD(a,b) = GCD(b, a mod b); repeat until the remainder is zero.",
  "sieve-py":
    "Mark multiples of each prime as composite; what's left are primes. O(n log log n).",
  "fast-power-py":
    "Square the base and halve the exponent — exponentiation in O(log n) multiplications.",
  "floyd-cycle-py":
    "Tortoise & hare: a fast pointer laps a slow one iff there's a cycle. O(1) space.",
  "quickselect-py":
    "Quicksort's partition but recurse into only the side holding the kth element. Avg O(n).",
  "sliding-window-max-py":
    "Monotonic deque keeps indices of useful candidates; front is the window's max. O(n).",
  "reverse-string-js":
    "Two pointers from both ends swapping inward until they meet. O(n), O(1) space.",
};
