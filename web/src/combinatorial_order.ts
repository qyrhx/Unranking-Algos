import { stirling_numbers, ordered_stirling_numbers,
  lah_numbers, ordered_lah_numbers, int_partitions }
from "./counting_algos.ts"

import { divmod, factorial } from "./utils"

export function unrank_stirling(n: number, k: number, r: bigint): number[][] {
  if (n === 0 || k === 0) return [];
  const cntA = stirling_numbers(n - 1, k - 1);
  if (r < cntA) {
    const res = unrank_stirling(n - 1, k - 1, r);
    res.push([n]);
    return res;
  }
  const [pos, r2] = divmod(r - cntA, stirling_numbers(n - 1, k));
  const res = unrank_stirling(n - 1, k, r2);
  res[Number(pos)].push(n);
  return res;
}

export function unrank_perm(n: number, r: bigint): number[] {
  const elems = Array.from({ length: n }, (_, i) => i + 1);
  const perm: number[] = [];
  let r2 = r;
  for (let m = n; m > 0; m--) {
    const f = factorial(m - 1);
    const [idx, newR] = divmod(r2, f);
    r2 = newR;
    perm.push(elems.splice(Number(idx), 1)[0]);
  }
  return perm;
}
export function unrank_ordered_stirling(n: number, k: number, r: bigint): number[][] {
  if (k === 1) return [Array.from({ length: n }, (_, i) => i + 1)];
  if (k === n) return Array.from({ length: n }, (_, i) => [i + 1]); // unrank_perm(n, r).map(x => [x]);
  // Case A: n is a singleton block inserted at one of k positions
  const cntA = BigInt(k) * ordered_stirling_numbers(n - 1, k - 1);
  if (r < cntA) {
    const [pos, newR] = divmod(r, ordered_stirling_numbers(n - 1, k - 1));
    const res = unrank_ordered_stirling(n - 1, k - 1, newR);
    res.splice(Number(pos), 0, [n]);
    return res;
  }
  // Case B: n joins one of the k existing blocks
  const [pos, newR] = divmod(r - cntA, ordered_stirling_numbers(n - 1, k));
  const res = unrank_ordered_stirling(n - 1, k, newR);
  res[Number(pos)].push(n);
  return res;
}

export function unrank_lah(n: number, k: number, r: bigint): number[][] {
  if (n === 0) return [];
  if (n === k) return Array.from({ length: n }, (_, x) => [x + 1]);
  const cntA = lah_numbers(n - 1, k - 1);
  // Case A: n is a new singleton block
  if (r < cntA) return [...unrank_lah(n - 1, k - 1, r), [n]];
  // Case B: insert n into one of the existing blocks
  const [blockIdx, r2] = divmod(r - cntA, lah_numbers(n - 1, k));
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

export function unrank_ordered_lah(n: number, k: number, r: bigint): number[][] {
  if (n === 0) return [];
  if (k === 1) return [unrank_perm(n, r)];
  if (k === n) return unrank_perm(n, r).map(x => [x]);
  // Case A: n is a new singleton block inserted at one of k positions
  const cntA = BigInt(k) * ordered_lah_numbers(n - 1, k - 1);
  if (r < cntA) {
    const [pos, newR] = divmod(r, ordered_lah_numbers(n - 1, k - 1));
    const res = unrank_ordered_lah(n - 1, k - 1, newR);
    res.splice(Number(pos), 0, [n]);
    return res;
  }
  // Case B: insert n into one of the existing ordered blocks
  const [blockIdx, newR] = divmod(r - cntA, ordered_lah_numbers(n - 1, k));
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

export function unrank_int_partitions(n: number, k: number, r: bigint): number[] {
  if (n < 1) return [];
  if (k === 1) return [n];
  if (n === k) return Array(n).fill(1);
  // Case A: smallest part is 1
  const cntA = int_partitions(n - 1, k - 1);
  if (r < cntA) return [1, ...unrank_int_partitions(n - 1, k - 1, r)];
  // Case B: all parts > 1, subtract 1 from each
  return unrank_int_partitions(n - k, k, r - cntA).map(i => i + 1);
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
