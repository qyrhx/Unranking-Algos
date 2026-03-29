import { stirling_numbers, ordered_stirling_numbers,
  lah_numbers, ordered_lah_numbers, int_partitions }
from "./counting_algos.ts"

import { divmod, factorial } from "./utils"

export function unrank_stirling(n: number, k: number, r: bigint): number[][] {
  if (n <= 0 || k <= 0) return [];
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
  if (n <= 0 || k <= 0) return [];
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
  if (n <= 0 || k <= 0) return [];
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
  if (n <= 0 || k <= 0) return [];
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
  if (n <= 0 || k <= 0) return [];
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
  if (n <= 0 || k <= 0) return [];
  if (k === 1) return [n];
  if (n === k) return Array(n).fill(1);
  // Case A: smallest part is 1
  const cntA = int_partitions(n - 1, k - 1);
  if (r < cntA) return [1, ...unrank_int_partitions(n - 1, k - 1, r)];
  // Case B: all parts > 1, subtract 1 from each
  return unrank_int_partitions(n - k, k, r - cntA).map(i => i + 1);
}
