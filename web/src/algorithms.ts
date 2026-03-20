import { LRUCache } from "lru-cache";

export const algoMap = new Map();

// Wrap when populating the map
algoMap.set("Stirling", {
  countFn: safeCount(stirling_numbers),
  unrankFn: safeUnrank(stirling_numbers, unrank_stirling)
});

algoMap.set("Ordered Stirling", {
  countFn: safeCount(ordered_stirling_numbers),
  unrankFn: safeUnrank(ordered_stirling_numbers, unrank_ordered_stirling)
});

algoMap.set("Lah", {
  countFn: safeCount(lah_numbers),
  unrankFn: safeUnrank(lah_numbers, unrank_lah)
});

algoMap.set("Ordered Lah", {
  countFn: safeCount(ordered_lah_numbers),
  unrankFn: safeUnrank(ordered_lah_numbers, unrank_ordered_lah)
});

algoMap.set("Int Partition", {
  countFn: safeCount(int_partitions),
  unrankFn: safeUnrank(int_partitions, unrank_int_partitions)
});

type CountFn = (n: number, k: number) => bigint;
type UnrankFn = (n: number, k: number, r: number) => number[][] | number[];

function safeCount(countFn: CountFn): CountFn {
  return (n: number, k: number) => {
    if (n < 0 || k < 0) return 0n;
    if (k > n) return 0n;
    return countFn(n, k);
  };
}

function safeUnrank(countFn: CountFn, unrankFn: UnrankFn): UnrankFn {
  return (n: number, k: number, r: number) => {
    // Check for negative inputs
    if (n < 0) throw new Error(`n cannot be negative (got ${n})`);
    if (k < 0) throw new Error(`k cannot be negative (got ${k})`);
    if (r < 0) throw new Error(`rank r cannot be negative (got ${r})`);
    // Check k <= n constraint
    if (k > n) {
      throw new Error(`k (${k}) cannot be greater than n (${n})`);
    }
    // Check rank bounds
    const total = countFn(n, k);
    if (BigInt(r) >= total) {
      throw new Error(`Rank ${r} out of bounds [0, ${total})`);
    }
    return unrankFn(n, k, r);
  };
}

// Helpers

function serialize_nk(n: number, k: number): string {
  return `${n},${k}`;
}

// Integer division and remainder for bigint ranks
function divmod(a: bigint, b: bigint): [bigint, bigint] {
  return [a / b, a % b];
}

// bigint factorial + avoids overflow for large n
export function factorial(n: number): bigint {
  if (n < 0) throw new Error("Negative numbers not allowed");
  let result = 1n;
  for (let i = 2n; i <= BigInt(n); i++) result *= i;
  return result;
}

// Stirling numbers
const stirling_cache = new LRUCache<string, bigint>({ max: 10000 });
export function stirling_numbers(n: number, k: number): bigint {
  if (n === 0 && k === 0) return 1n;
  if (n === 0 || k === 0) return 0n;

  const key = serialize_nk(n, k);
  const cached = stirling_cache.get(key);
  if (cached !== undefined) return cached;

  const res = stirling_numbers(n - 1, k - 1) + BigInt(k) * stirling_numbers(n - 1, k);
  stirling_cache.set(key, res);
  return res;
}
export function unrank_stirling(n: number, k: number, r: number): number[][] {
  if (n === 0 || k === 0) return [];
  const cntA = stirling_numbers(n - 1, k - 1);
  if (BigInt(r) < cntA) {
    const res = unrank_stirling(n - 1, k - 1, r);
    res.push([n]);
    return res;
  }
  const [pos, r2] = divmod(BigInt(r) - cntA, stirling_numbers(n - 1, k));
  const res = unrank_stirling(n - 1, k, Number(r2));
  res[Number(pos)].push(n);
  return res;
}

// Ordered Stirling numbers
const ordered_stirling_cache = new LRUCache<string, bigint>({ max: 10000 });
export function ordered_stirling_numbers(n: number, k: number): bigint {
  if (k === 1 || k === n) return factorial(k);
  const key = serialize_nk(n, k);
  const cached = ordered_stirling_cache.get(key);
  if (cached !== undefined) return cached;
  const result = BigInt(k) * (ordered_stirling_numbers(n - 1, k - 1) + ordered_stirling_numbers(n - 1, k));
  ordered_stirling_cache.set(key, result);
  return result;
}
export function unrank_perm(n: number, r: number): number[] {
  const elems = Array.from({ length: n }, (_, i) => i + 1);
  const perm: number[] = [];
  let r2 = BigInt(r);
  for (let m = n; m > 0; m--) {
    const f = factorial(m - 1);
    const [idx, newR] = divmod(r2, f);
    r2 = newR;
    perm.push(elems.splice(Number(idx), 1)[0]);
  }
  return perm;
}
export function unrank_ordered_stirling(n: number, k: number, r: number): number[][] {
  if (k === 1) return [Array.from({ length: n }, (_, i) => i + 1)];
  if (k === n) return unrank_perm(n, r).map(x => [x]);
  // Case A: n is a singleton block inserted at one of k positions
  const cntA = BigInt(k) * ordered_stirling_numbers(n - 1, k - 1);
  if (r < cntA) {
    const [pos, newR] = divmod(BigInt(r), ordered_stirling_numbers(n - 1, k - 1));
    const res = unrank_ordered_stirling(n - 1, k - 1, newR);
    res.splice(Number(pos), 0, [n]);
    return res;
  }
  // Case B: n joins one of the k existing blocks
  const [pos, newR] = divmod(BigInt(r) - cntA, ordered_stirling_numbers(n - 1, k));
  const res = unrank_ordered_stirling(n - 1, k, newR);
  res[Number(pos)].push(n);
  return res;
}

// Lah numbers
const lah_cache = new LRUCache<string, bigint>({ max: 10000 });
export function lah_numbers(n: number, k: number): bigint {
  if (n === 0 && k === 0) return 1n;
  if (n === 0 || k === 0) return 0n;
  if (n === k) return 1n;
  const key = serialize_nk(n, k);
  const cached = lah_cache.get(key);
  if (cached !== undefined) return cached;
  const res = lah_numbers(n - 1, k - 1) + BigInt(n + k - 1) * lah_numbers(n - 1, k);
  lah_cache.set(key, res);
  return res;
}
export function unrank_lah(n: number, k: number, r: number): number[][] {
  if (n === 0) return [];
  if (n === k) return Array.from({ length: n }, (_, x) => [x + 1]);
  const cntA = lah_numbers(n - 1, k - 1);
  // Case A: n is a new singleton block
  if (r < cntA) return [...unrank_lah(n - 1, k - 1, r), [n]];
  // Case B: insert n into one of the existing blocks
  const [blockIdx, r2] = divmod(BigInt(r) - cntA, lah_numbers(n - 1, k));
  const res = unrank_lah(n - 1, k, r2);
  let pos = Number(blockIdx);
  for (const block of res) {
    if (pos < block.length + 1) {
      block.splice(pos, 0, n);
      break;
    }
    pos -= block.length + 1;
  }
  return res;
}

// Ordered Lah numbers
const ordered_lah_cache = new LRUCache<string, bigint>({ max: 10000 });
export function ordered_lah_numbers(n: number, k: number): bigint {
  if (k === 1 || k === n) return factorial(n);
  const key = serialize_nk(n, k);
  const cached = ordered_lah_cache.get(key);
  if (cached !== undefined) return cached;
  const result =
    BigInt(k) * ordered_lah_numbers(n - 1, k - 1) +
    BigInt(n - 1 + k) * ordered_lah_numbers(n - 1, k);
  ordered_lah_cache.set(key, result);
  return result;
}

export function unrank_ordered_lah(n: number, k: number, r: number): number[][] {
  if (n === 0) return [];
  if (k === 1) return [unrank_perm(n, r)];
  if (k === n) return unrank_perm(n, r).map(x => [x]);
  // Case A: n is a new singleton block inserted at one of k positions
  const cntA = BigInt(k) * ordered_lah_numbers(n - 1, k - 1);
  if (r < cntA) {
    const [pos, newR] = divmod(BigInt(r), ordered_lah_numbers(n - 1, k - 1));
    const res = unrank_ordered_lah(n - 1, k - 1, newR);
    res.splice(Number(pos), 0, [n]);
    return res;
  }
  // Case B: insert n into one of the existing ordered blocks
  const [blockIdx, newR] = divmod(BigInt(r) - cntA, ordered_lah_numbers(n - 1, k));
  const res = unrank_ordered_lah(n - 1, k, newR);
  let pos = Number(blockIdx);
  for (const block of res) {
    if (pos < block.length + 1) {
      block.splice(pos, 0, n);
      return res;
    }
    pos -= block.length + 1;
  }
  return res;
}

// Integer partitions
const int_partitions_cache = new LRUCache<string, bigint>({ max: 10000 });
export function int_partitions(n: number, k: number): bigint {
  if (n < 1) return 0n;
  if (k === 1 || n === k) return 1n;
  const key = serialize_nk(n, k);
  const cached = int_partitions_cache.get(key);
  if (cached !== undefined) return cached;
  const result = int_partitions(n - 1, k - 1) + int_partitions(n - k, k);
  int_partitions_cache.set(key, result);
  return result;
}
export function unrank_int_partitions(n: number, k: number, r: number): number[] {
  if (n < 1) return [];
  if (k === 1) return [n];
  if (n === k) return Array(n).fill(1);
  // Case A: smallest part is 1
  const cntA = int_partitions(n - 1, k - 1);
  if (r < cntA) return [1, ...unrank_int_partitions(n - 1, k - 1, r)];
  // Case B: all parts > 1, subtract 1 from each
  return unrank_int_partitions(n - k, k, BigInt(r) - cntA).map(i => i + 1);
}

// Combinatorial helpers
function comb(n: number, k: number): bigint {
  if (n < 0 || k < 0 || k > n) return 0n;
  if (k === 0 || k === n) return 1n;
  if (k > n - k) k = n - k;
  let result = 1n;
  for (let i = 0; i < k; i++) {
    result = result * BigInt(n - i) / BigInt(i + 1);
  }
  return result;
}

// Prefix counting formulas

// Prop 36: count Lah partitions sharing a given prefix
export function prop36(n: number, k: number, prefix: number[]): bigint {
  const l = prefix.length;
  if (prefix.includes(1)) {
    // Case 1: 1 is in the prefix
    if (l > n - k + 1) return 0n;
    let total = 0n;
    const maxU = n - k - l + 1;
    for (let u = 0; u <= maxU; u++) {
      total += lah_numbers(n - l - u, k - 1) * comb(n - l, u) * factorial(u);
    }
    return total;
  } else {
    // Case 2: 1 is not in the prefix
    if (l > n - k) return 0n;
    let total = 0n;
    const maxU = n - k - l;
    for (let u = 0; u <= maxU; u++) {
      total += lah_numbers(n - l - u - 1, k - 1) * comb(n - l - 1, u) * factorial(u + 1);
    }
    return total;
  }
}

// Prop 37: more efficient version of prop36
export function prop37(n: number, k: number, prefix: number[]): bigint {
  const nMinusL = n - prefix.length;
  if (prefix.includes(1)) {
    return lah_numbers(nMinusL, k - 1) + BigInt(k) * lah_numbers(nMinusL, k);
  } else {
    return lah_numbers(nMinusL, k);
  }
}
