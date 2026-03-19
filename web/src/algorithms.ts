// TODO: memory errors + lexico + visualization

import { LRUCache } from "lru-cache";

export const algoMap = new Map();

algoMap.set("Stirling", {countFn: stirling_numbers, unrankFn: unrank_stirling});
algoMap.set("Ordered Stirling", {countFn: ordered_stirling_numbers, unrankFn: unrank_ordered_stirling});
algoMap.set("Lah", {countFn: lah_numbers, unrankFn: unrank_lah});
algoMap.set("Ordered Lah", {countFn: ordered_lah_numbers, unrankFn: unrank_ordered_lah});
algoMap.set("Int Partition", {countFn: int_partitions, unrankFn: unrank_int_partitions});


function serialize_nk(n, k): string {
  return `${n},${k}`
}

function divmod(a, b) {
  return [Math.floor(a / b), a % b];
}

const stirling_numbers_cache = new LRUCache<string, bigint>({max: 5000});
export function stirling_numbers(n: bigint, k: bigint): bigint {
  // There is exactly 1 way to partition 0 elements into 0 groups.
  if (n == 0 && k == 0) return 1;
  // ex: Partition 0 elements into 3 groups -> impossible
  if (n == 0 || k == 0) return 0;

  const s = serialize_nk(n, k);

  const cached = stirling_numbers_cache.get(s);
  if (cached !== undefined) return cached;

  const res = stirling_numbers(n-1, k-1) + k*stirling_numbers(n-1, k);
  stirling_numbers_cache.set(s, res);
  return res;
}

export function unrank_stirling(n, k, r): number[][] {
  if (n == 0 || k == 0)
    return [];

  const cntA = stirling_numbers(n-1, k-1);

  if (r < cntA) {
    let res = unrank_stirling(n-1, k-1, r);
    res.push([n]);
    return res
  }

  const r2 = r - cntA;
  const [pos, r3] = divmod(r2, stirling_numbers(n-1, k));
  let us = unrank_stirling(n-1, k, r3);
  us[pos].push(n);
  return us;
}

const lah_numbers_cache = new LRUCache<string, bigint>({max: 5000});
export function lah_numbers(n: bigint, k: bigint): bigint {
  if (n == 0 && k == 0) return 1;
  if (n == 0 || k == 0) return 0;
  if (n == k) return 1;

  const key = serialize_nk(n, k);

  const cached = lah_numbers_cache.get(key);
  if (cached !== undefined) return cached;

  const res = lah_numbers(n-1, k-1) + (n+k-1)*lah_numbers(n-1, k);
  lah_numbers_cache.set(key, res);
  return res;
}

export function unrank_lah(n, k, r) {
  if (n == 0 && k == 0)
    return [];
  if (n == 0 || k == 0)
    return [];
  if (n == k) // bloc for each number
    return Array.from({ length: n }, (_, x) => [x + 1]);

  let fst_case_cnt = lah_numbers(n-1, k-1);
  if (r < fst_case_cnt) { // Singleton
    // let res = unrank_lah(n-1, k-1, r);
    // res.push([n]);
    // return res;
    return [...unrank_lah(n-1, k-1, r), [n]];
  }
  // Inserer dans une des boites
  const r2 = r - fst_case_cnt;
  let [pos, r3] = divmod(r2, lah_numbers(n-1, k));
  let res = unrank_lah(n-1, k, r3);
  // trouver l'indice
  for (const boite of res) {
    if (pos < boite.length + 1) {
      boite.splice(pos, 0, n);
      break;
    }
    pos -= boite.length + 1;
  }
  return res;
}

export function unrank_perm(n, r) { // unrank de n! different orders
  let elems = Array.from({ length: n }, (_, i) => i + 1); // [1, 2, ..., n]
  let perm = [];

  for (let m = n; m > 0; m--) {
    let f = factorial(m - 1);
    let [idx, newR] = divmod(r, f);
    r = newR;
    perm.push(elems.splice(idx, 1)[0]);
  }
  return perm;
}

export function unrank_ordered_stirling(n, k, r) {
  // Base cases
  if (k === 1) {
    return [Array.from({ length: n }, (_, i) => i + 1)]; // one block (order inside doesn't matter)
  }
  if (k === n) {
    let perm = unrank_perm(n, r); // order of singleton blocks
    return perm.map(x => [x]);
  }

  // Case A: n is a singleton block [n], inserted in one of k positions
  let cntA = k * ordered_stirling_numbers(n - 1, k - 1);
  if (r < cntA) {
    let [pos, newR] = divmod(r, ordered_stirling_numbers(n - 1, k - 1));
    r = newR;
    let res = unrank_ordered_stirling(n - 1, k - 1, r);
    res.splice(pos, 0, [n]);
    return res;
  }

  // Case B: n joins one of the k existing blocks
  r = r - cntA;
  let [pos, newR] = divmod(r, ordered_stirling_numbers(n - 1, k));
  r = newR;
  let res = unrank_ordered_stirling(n - 1, k, r);
  res[pos].push(n);
  // res[pos].sort(); // commented out as in original
  return res;
}

export function factorial(n) {
  if (n < 0) throw new Error("Negative numbers not allowed");
  if (n <= 1) return 1;

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
const ordered_stirling_cache = new LRUCache<string, number>({max: 5000});
export function ordered_stirling_numbers(n, k): bigint {
  const key = serialize_nk(n, k);

  // Check cache first
  const cached = ordered_stirling_cache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  // Base cases
  if (k === 1 || k === n) {
    const result = factorial(k);
    ordered_stirling_cache.set(key, result);
    return result;
  }

  // Recursive calculation
  const result = k * (ordered_stirling_numbers(n - 1, k - 1) +
    ordered_stirling_numbers(n - 1, k));

  // Store in cache
  ordered_stirling_cache.set(key, result);
  return result;
}

const int_partitions_cache = new LRUCache({max: 5000});
export function int_partitions(n, k): bigint {
  // Base cases
  if (n < 1) return 0;
  if (k === 1 || n === k) return 1;

  const key = serialize_nk(n, k);
  const cached = int_partitions_cache.get(key);
  if (cached !== undefined) return cached;

  const result = int_partitions(n - 1, k - 1) + int_partitions(n - k, k);
  int_partitions_cache.set(key, result);
  return result;
}

export function unrank_int_partitions(n, k, r) {
  // Base cases
  if (n < 1) return [];
  if (k === 1) return [n];
  if (n === k) return Array(n).fill(1);

  const partitionsCount = int_partitions(n - 1, k - 1);

  if (r < partitionsCount) {
    return [1, ...unrank_int_partitions(n - 1, k - 1, r)];
  } else {
    const r2 = r - partitionsCount;
    const res = unrank_int_partitions(n - k, k, r2);
    return res.map(i => i + 1);
  }
}

const ordered_lah_cache = new LRUCache({max: 5000});
export function ordered_lah_numbers(n, k): bigint {
  // Base cases
  if (k === 1 || k === n) {
    return factorial(n);
  }

  const key = serialize_nk(n, k);
  const cached = ordered_lah_cache.get(key);
  if (cached !== undefined) return cached;

  const result = k * ordered_lah_numbers(n - 1, k - 1) +
    (n - 1 + k) * ordered_lah_numbers(n - 1, k);

  ordered_lah_cache.set(key, result);
  return result;
}

export function unrank_ordered_lah(n, k, r) {
  if (n === 0 && k === 0)
    return [];

  if (n === 0 || k === 0)
    return [];

  // one block: all permutations inside that block
  if (k === 1) {
    return [unrank_perm(n, r)];
  }

  // each element alone, order of blocks matters
  if (k === n) {
    let perm = unrank_perm(n, r);
    return perm.map(x => [x]);
  }

  // CASE A: create new block [n] in one of k positions
  let cntA = k * ordered_lah_numbers(n - 1, k - 1);

  if (r < cntA) {
    let [pos, newR] = divmod(r, ordered_lah_numbers(n - 1, k - 1));
    let res = unrank_ordered_lah(n - 1, k - 1, newR);
    res.splice(pos, 0, [n]);
    return res;
  }

  // CASE B: insert n into one of the existing ordered blocks
  r = r - cntA;

  let [pos, newR] = divmod(r, ordered_lah_numbers(n - 1, k));
  let res = unrank_ordered_lah(n - 1, k, newR);

  for (const block of res) {
    if (pos < block.length + 1) {
      block.splice(pos, 0, n);
      return res;
    }
    pos -= block.length + 1;
  }

  return res;
}

function comb(n, k): bigint {
  if (n < 0 || k < 0 || k > n) return 0n;
  if (k === 0 || k === n) return 1n;
  if (k > n - k) k = n - k;

  let result = 1n;
  for (let i = 0; i < k; i++) {
    result = result * BigInt(n - i) / BigInt(i + 1);
  }
  return result;
}

// Prop 36: Lah partitions with a given prefix.
export function prop36(n: number, k: number, prefix: bigint[]) {
  const l = prefix.length;

  if (prefix.includes(1n)) {
    // Case 1: 1 is in the prefix
    if (l > n - k + 1) return 0;

    let total = 0n;
    const maxU = n - k - l + 1;

    for (let u = 0; u <= maxU; u++) {
      const lahWays = lah_numbers(n - l - u, k - 1);
      const chooseWays = comb(n - l, u);
      const orderWays = factorial(u);
      total += lahWays * chooseWays * orderWays;
    }

    return total;
  } else {
    // Case 2: 1 is not in the prefix
    if (l > n - k) return 0n;

    let total = 0n;
    const maxU = n - k - l;

    for (let u = 0n; u <= maxU; u++) {
      total += lah_numbers(n - l - u - 1, k - 1) * comb(n - l - 1, u) * factorial(u + 1);
    }

    return total;
  }
}

// Prop 37, plus efficace
export function prop37(n: number, k: number, prefix: bigint[]): bigint {
  const l = prefix.length;
  const nMinusL = n - l;

  if (prefix.includes(1n)) {
    return lah_numbers(nMinusL, k - 1) + BigInt(k) * lah_numbers(nMinusL, k);
  } else {
    return lah_numbers(nMinusL, k);
  }
}
