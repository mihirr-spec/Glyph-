export type Language = "python" | "javascript" | "java" | "cpp";

export type Difficulty = "easy" | "medium" | "hard";

export interface Snippet {
  id: string;
  title: string;
  difficulty: Difficulty;
  // Built-ins use a known union; imported LeetCode submissions can be any lang.
  language: Language | string;
  code: string;
  // Present on snippets imported from a LeetCode account.
  source?: "builtin" | "leetcode";
  url?: string;
}

/** Extract the LeetCode problem slug from a problem URL, e.g. "two-sum". */
export function slugFromUrl(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/\/problems\/([^/]+)/);
  return m ? m[1] : null;
}

// LeetCode-style solutions. Tabs are normalized to spaces so typing is predictable.
export const SNIPPETS: Snippet[] = [
  {
    id: "two-sum-py",
    title: "Two Sum",
    difficulty: "easy",
    language: "python",
    url: "https://leetcode.com/problems/two-sum/",
    code: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []`,
  },
  {
    id: "reverse-list-py",
    title: "Reverse Linked List",
    difficulty: "easy",
    language: "python",
    url: "https://leetcode.com/problems/reverse-linked-list/",
    code: `def reverse_list(head):
    prev = None
    while head:
        nxt = head.next
        head.next = prev
        prev = head
        head = nxt
    return prev`,
  },
  {
    id: "valid-parens-js",
    title: "Valid Parentheses",
    difficulty: "easy",
    language: "javascript",
    url: "https://leetcode.com/problems/valid-parentheses/",
    code: `function isValid(s) {
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}`,
  },
  {
    id: "max-subarray-js",
    title: "Maximum Subarray",
    difficulty: "medium",
    language: "javascript",
    url: "https://leetcode.com/problems/maximum-subarray/",
    code: `function maxSubArray(nums) {
  let best = nums[0];
  let cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
  },
  {
    id: "binary-search-java",
    title: "Binary Search",
    difficulty: "easy",
    language: "java",
    url: "https://leetcode.com/problems/binary-search/",
    code: `int search(int[] nums, int target){
    int lo=0, hi=nums.length-1;
    while(lo<=hi){
        int mid=lo+(hi-lo)/2;
        if(nums[mid]==target) return mid;
        if(nums[mid]<target) lo=mid+1;
        else hi=mid-1;
    }
    return -1;
}`,
  },
  {
    id: "fib-cpp",
    title: "Climbing Stairs",
    difficulty: "easy",
    language: "cpp",
    url: "https://leetcode.com/problems/climbing-stairs/",
    code: `int climb_stairs(int n){
    int a=1, b=1;
    for(int i=0; i<n; i++){
        int t=a+b;
        a=b;
        b=t;
    }
    return a;
}`,
  },
  {
    id: "merge-py",
    title: "Merge Intervals",
    difficulty: "medium",
    language: "python",
    url: "https://leetcode.com/problems/merge-intervals/",
    code: `def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    res = []
    for start, end in intervals:
        if res and start <= res[-1][1]:
            res[-1][1] = max(res[-1][1], end)
        else:
            res.append([start, end])
    return res`,
  },
  {
    id: "anagram-js",
    title: "Valid Anagram",
    difficulty: "easy",
    language: "javascript",
    url: "https://leetcode.com/problems/valid-anagram/",
    code: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (const c of s) count[c] = (count[c] || 0) + 1;
  for (const c of t) {
    if (!count[c]) return false;
    count[c]--;
  }
  return true;
}`,
  },
];

// Standard algorithms to revise the *concept* — not tied to a specific LeetCode
// problem. Used by the "revise a concept" mode.
export const CONCEPTS: Snippet[] = [
  {
    id: "bubble-sort-py",
    title: "Bubble Sort",
    difficulty: "easy",
    language: "python",
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
  },
  {
    id: "selection-sort-py",
    title: "Selection Sort",
    difficulty: "easy",
    language: "python",
    code: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        lo = i
        for j in range(i + 1, n):
            if arr[j] < arr[lo]:
                lo = j
        arr[i], arr[lo] = arr[lo], arr[i]
    return arr`,
  },
  {
    id: "insertion-sort-js",
    title: "Insertion Sort",
    difficulty: "easy",
    language: "javascript",
    code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
  },
  {
    id: "quick-sort-py",
    title: "Quick Sort",
    difficulty: "medium",
    language: "python",
    code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    mid = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + mid + quick_sort(right)`,
  },
  {
    id: "merge-sort-js",
    title: "Merge Sort",
    difficulty: "medium",
    language: "javascript",
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  const merged = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) merged.push(left[i++]);
    else merged.push(right[j++]);
  }
  return merged.concat(left.slice(i)).concat(right.slice(j));
}`,
  },
  {
    id: "bfs-py",
    title: "Breadth-First Search",
    difficulty: "medium",
    language: "python",
    code: `from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph[node]:
            if nxt not in visited:
                visited.add(nxt)
                queue.append(nxt)
    return order`,
  },
  {
    id: "dfs-py",
    title: "Depth-First Search",
    difficulty: "medium",
    language: "python",
    code: `def dfs(graph, start):
    visited = set()
    order = []

    def explore(node):
        visited.add(node)
        order.append(node)
        for nxt in graph[node]:
            if nxt not in visited:
                explore(nxt)

    explore(start)
    return order`,
  },
  {
    id: "heap-sort-py",
    title: "Heap Sort",
    difficulty: "medium",
    language: "python",
    code: `import heapq

def heap_sort(arr):
    heap = list(arr)
    heapq.heapify(heap)
    return [heapq.heappop(heap) for _ in range(len(heap))]`,
  },
  {
    id: "counting-sort-py",
    title: "Counting Sort",
    difficulty: "medium",
    language: "python",
    code: `def counting_sort(arr):
    if not arr:
        return arr
    hi = max(arr)
    counts = [0] * (hi + 1)
    for x in arr:
        counts[x] += 1
    out = []
    for value, c in enumerate(counts):
        out.extend([value] * c)
    return out`,
  },
  {
    id: "shell-sort-js",
    title: "Shell Sort",
    difficulty: "medium",
    language: "javascript",
    code: `function shellSort(arr) {
  const n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      const tmp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > tmp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = tmp;
    }
  }
  return arr;
}`,
  },
  {
    id: "linear-search-py",
    title: "Linear Search",
    difficulty: "easy",
    language: "python",
    code: `def linear_search(arr, target):
    for i, value in enumerate(arr):
        if value == target:
            return i
    return -1`,
  },
  {
    id: "kadane-py",
    title: "Kadane's Maximum Subarray",
    difficulty: "medium",
    language: "python",
    code: `def max_subarray(nums):
    best = cur = nums[0]
    for n in nums[1:]:
        cur = max(n, cur + n)
        best = max(best, cur)
    return best`,
  },
  {
    id: "fib-dp-py",
    title: "Fibonacci (Bottom-Up DP)",
    difficulty: "easy",
    language: "python",
    code: `def fib(n):
    if n < 2:
        return n
    dp = [0, 1]
    for i in range(2, n + 1):
        dp.append(dp[i - 1] + dp[i - 2])
    return dp[n]`,
  },
  {
    id: "knapsack-py",
    title: "0/1 Knapsack",
    difficulty: "medium",
    language: "python",
    code: `def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                take = values[i - 1] + dp[i - 1][w - weights[i - 1]]
                dp[i][w] = max(dp[i][w], take)
    return dp[n][capacity]`,
  },
  {
    id: "lcs-py",
    title: "Longest Common Subsequence",
    difficulty: "medium",
    language: "python",
    code: `def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
  },
  {
    id: "lis-js",
    title: "Longest Increasing Subsequence",
    difficulty: "medium",
    language: "javascript",
    code: `function lengthOfLIS(nums) {
  const tails = [];
  for (const n of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < n) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = n;
  }
  return tails.length;
}`,
  },
  {
    id: "coin-change-py",
    title: "Coin Change",
    difficulty: "medium",
    language: "python",
    code: `def coin_change(coins, amount):
    dp = [float("inf")] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    return dp[amount] if dp[amount] != float("inf") else -1`,
  },
  {
    id: "edit-distance-py",
    title: "Edit Distance",
    difficulty: "hard",
    language: "python",
    code: `def edit_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]`,
  },
  {
    id: "dijkstra-py",
    title: "Dijkstra's Shortest Path",
    difficulty: "hard",
    language: "python",
    code: `import heapq

def dijkstra(graph, start):
    dist = {start: 0}
    pq = [(0, start)]
    while pq:
        d, node = heapq.heappop(pq)
        if d > dist.get(node, float("inf")):
            continue
        for nxt, weight in graph[node]:
            nd = d + weight
            if nd < dist.get(nxt, float("inf")):
                dist[nxt] = nd
                heapq.heappush(pq, (nd, nxt))
    return dist`,
  },
  {
    id: "topo-sort-py",
    title: "Topological Sort",
    difficulty: "medium",
    language: "python",
    code: `from collections import deque

def topological_sort(graph, n):
    indegree = [0] * n
    for node in graph:
        for nxt in graph[node]:
            indegree[nxt] += 1
    queue = deque([i for i in range(n) if indegree[i] == 0])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph.get(node, []):
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order`,
  },
  {
    id: "union-find-py",
    title: "Union-Find (DSU)",
    difficulty: "medium",
    language: "python",
    code: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        return True`,
  },
  {
    id: "kmp-py",
    title: "KMP String Matching",
    difficulty: "hard",
    language: "python",
    code: `def kmp_search(text, pattern):
    lps = [0] * len(pattern)
    k = 0
    for i in range(1, len(pattern)):
        while k and pattern[i] != pattern[k]:
            k = lps[k - 1]
        if pattern[i] == pattern[k]:
            k += 1
        lps[i] = k
    k = 0
    for i, ch in enumerate(text):
        while k and ch != pattern[k]:
            k = lps[k - 1]
        if ch == pattern[k]:
            k += 1
        if k == len(pattern):
            return i - k + 1
    return -1`,
  },
  {
    id: "euclid-gcd-py",
    title: "Euclidean GCD",
    difficulty: "easy",
    language: "python",
    code: `def gcd(a, b):
    while b:
        a, b = b, a % b
    return a`,
  },
  {
    id: "sieve-py",
    title: "Sieve of Eratosthenes",
    difficulty: "medium",
    language: "python",
    code: `def sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if is_prime[i]:
            for j in range(i * i, n + 1, i):
                is_prime[j] = False
    return [i for i in range(n + 1) if is_prime[i]]`,
  },
  {
    id: "fast-power-py",
    title: "Fast Exponentiation",
    difficulty: "medium",
    language: "python",
    code: `def fast_pow(base, exp, mod=None):
    result = 1
    while exp > 0:
        if exp & 1:
            result = result * base
            if mod:
                result %= mod
        base = base * base
        if mod:
            base %= mod
        exp >>= 1
    return result`,
  },
  {
    id: "floyd-cycle-py",
    title: "Floyd's Cycle Detection",
    difficulty: "medium",
    language: "python",
    code: `def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
  },
  {
    id: "quickselect-py",
    title: "Quickselect (Kth Smallest)",
    difficulty: "medium",
    language: "python",
    code: `def quickselect(arr, k):
    pivot = arr[len(arr) // 2]
    lows = [x for x in arr if x < pivot]
    highs = [x for x in arr if x > pivot]
    pivots = [x for x in arr if x == pivot]
    if k < len(lows):
        return quickselect(lows, k)
    if k < len(lows) + len(pivots):
        return pivot
    return quickselect(highs, k - len(lows) - len(pivots))`,
  },
  {
    id: "sliding-window-max-py",
    title: "Sliding Window Maximum",
    difficulty: "hard",
    language: "python",
    code: `from collections import deque

def max_sliding_window(nums, k):
    dq = deque()
    res = []
    for i, n in enumerate(nums):
        while dq and nums[dq[-1]] <= n:
            dq.pop()
        dq.append(i)
        if dq[0] == i - k:
            dq.popleft()
        if i >= k - 1:
            res.append(nums[dq[0]])
    return res`,
  },
  {
    id: "reverse-string-js",
    title: "Reverse a String In Place",
    difficulty: "easy",
    language: "javascript",
    code: `function reverseString(chars) {
  let lo = 0;
  let hi = chars.length - 1;
  while (lo < hi) {
    [chars[lo], chars[hi]] = [chars[hi], chars[lo]];
    lo++;
    hi--;
  }
  return chars;
}`,
  },
  {
    id: "binary-search-cpp",
    title: "Binary Search",
    difficulty: "easy",
    language: "cpp",
    code: `int binary_search(vector<int>& nums, int target){
    int lo=0, hi=nums.size()-1;
    while(lo<=hi){
        int mid=lo+(hi-lo)/2;
        if(nums[mid]==target) return mid;
        if(nums[mid]<target) lo=mid+1;
        else hi=mid-1;
    }
    return -1;
}`,
  },
  {
    id: "two-sum-cpp",
    title: "Two Sum",
    difficulty: "easy",
    language: "cpp",
    code: `vector<int> two_sum(vector<int>& nums, int target){
    unordered_map<int,int> seen;
    for(int i=0; i<nums.size(); i++){
        int comp=target-nums[i];
        if(seen.count(comp)) return {seen[comp], i};
        seen[nums[i]]=i;
    }
    return {};
}`,
  },
  {
    id: "max-subarray-cpp",
    title: "Maximum Subarray",
    difficulty: "medium",
    language: "cpp",
    code: `int max_subarray(vector<int>& nums){
    int best=nums[0], cur=nums[0];
    for(int i=1; i<nums.size(); i++){
        cur=max(nums[i], cur+nums[i]);
        best=max(best, cur);
    }
    return best;
}`,
  },
  {
    id: "valid-parens-cpp",
    title: "Valid Parentheses",
    difficulty: "easy",
    language: "cpp",
    code: `bool is_valid(string s){
    stack<char> st;
    for(char c : s){
        if(c=='(' || c=='[' || c=='{') st.push(c);
        else{
            if(st.empty()) return false;
            if(c==')' && st.top()!='(') return false;
            if(c==']' && st.top()!='[') return false;
            if(c=='}' && st.top()!='{') return false;
            st.pop();
        }
    }
    return st.empty();
}`,
  },
  {
    id: "reverse-list-cpp",
    title: "Reverse Linked List",
    difficulty: "easy",
    language: "cpp",
    code: `ListNode* reverse_list(ListNode* head){
    ListNode* prev=nullptr;
    while(head){
        ListNode* nxt=head->next;
        head->next=prev;
        prev=head;
        head=nxt;
    }
    return prev;
}`,
  },
  {
    id: "merge-intervals-cpp",
    title: "Merge Intervals",
    difficulty: "medium",
    language: "cpp",
    code: `vector<vector<int>> merge(vector<vector<int>>& intervals){
    sort(intervals.begin(), intervals.end());
    vector<vector<int>> res;
    for(auto& iv : intervals){
        if(res.empty() || iv[0]>res.back()[1])
            res.push_back(iv);
        else
            res.back()[1]=max(res.back()[1], iv[1]);
    }
    return res;
}`,
  },
];
