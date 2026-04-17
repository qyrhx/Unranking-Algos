import { expect } from 'vitest';

export function fmt(obj: unknown): string {
  return JSON.stringify(obj);
}

export function isValidSetPartition(partition: number[][], n: number): boolean {
  const seen = new Set<number>();
  for (const block of partition) {
    if (block.length === 0) return false;
    for (const elem of block) {
      if (elem < 1 || elem > n) return false;
      if (seen.has(elem)) return false;
      seen.add(elem);
    }
  }
  return seen.size === n;
}

export function isValidIntPartition(partition: number[], n: number, k: number): boolean {
  if (partition.length !== k) return false;
  const sum = partition.reduce((a, b) => a + b, 0);
  return sum === n && partition.every(p => p > 0);
}

// Canonical form per Definition 30 and the paper's is_well_formed:
// - each block must start with the smallest element not yet consumed
// - elements within each block must be strictly increasing
// Applies to: Stirling (comb + lex) and Ordered Stirling (lex).
export function isCanonicalStirling(partition: number[][]): boolean {
  const dispo = new Set<number>(partition.flat());
  for (const block of partition) {
    const smallest = Math.min(...dispo);
    if (block[0] !== smallest) return false;
    for (let i = 1; i < block.length; i++) {
      if (block[i] <= block[i - 1]) return false;
    }
    for (const e of block) dispo.delete(e);
  }
  return true;
}

// Canonical form for Lah: blocks are ordered sequences (no intra-block sort),
// but blocks are ordered by their minimum element.
// Matches the Python well_formed: min(old_block) < min(block) for each successive block.
export function isCanonicalLah(partition: number[][]): boolean {
  let prevMin = 0;
  for (const block of partition) {
    const curMin = Math.min(...block);
    if (curMin <= prevMin) return false;
    prevMin = curMin;
  }
  return true;
}

// Integer partitions: parts in non-decreasing order (lex canonical form per the paper).
export function isCanonicalIntPartition(partition: number[]): boolean {
  for (let i = 1; i < partition.length; i++) {
    if (partition[i] < partition[i - 1]) return false;
  }
  return true;
}

// Lex comparison for set partitions per Definition 27/28:
// compare block by block, element by element; a strict prefix is smaller.
export function lexLessSetPartition(a: number[][], b: number[][]): boolean {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    for (let j = 0; j < Math.min(a[i].length, b[i].length); j++) {
      if (a[i][j] !== b[i][j]) return a[i][j] < b[i][j];
    }
    if (a[i].length !== b[i].length) return a[i].length < b[i].length;
  }
  return a.length < b.length;
}

// Lex comparison for integer partitions: non-decreasing parts, compare element by element.
export function lexLessIntPartition(a: number[], b: number[]): boolean {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return a.length < b.length;
}

/**
 * Exhaustively verifies that an unranking function enumerates exactly the expected
 * set of objects for given parameters (n, k). Specifically asserts that:
 * - every unranked object passes the provided validity check
 * - no two distinct ranks produce the same object
 * - the total number of objects matches the counting function
 */
export function exhaustiveTest<T>(
  n: number,
  k: number,
  countFn: (n: number, k: number) => bigint,
  unrankFn: (n: number, k: number, r: bigint) => T,
  validateFn: (obj: T, n: number, k: number) => boolean,
): void {
  const count = countFn(n, k);
  if (count === 0n) return;

  const seen = new Set<string>();
  for (let r = 0n; r < count; r++) {
    const obj = unrankFn(n, k, r);

    expect(
      validateFn(obj, n, k),
      `Invalid object at n=${n}, k=${k}, rank=${r}: ${fmt(obj)}`
    ).toBe(true);

    seen.add(JSON.stringify(obj));
  }

  expect(
    BigInt(seen.size),
      `Wrong count at n=${n}, k=${k}: generated ${seen.size} objects but expected ${count}`
  ).toBe(count);
}

/**
 * Verifies that consecutive ranks produce strictly increasing objects in lex order.
 * Mirrors the Python correction() pattern: iterate r=0..count-2, check lt_lex(p, next).
 */
export function lexOrderTest<T>(
  n: number,
  k: number,
  countFn: (n: number, k: number) => bigint,
  unrankFn: (n: number, k: number, r: bigint) => T,
  lexLessFn: (a: T, b: T) => boolean
): void {
  const count = countFn(n, k);
  if (count <= 1n) return;
  for (let r = 0n; r < count - 1n; r++) {
    const a = unrankFn(n, k, r);
    const b = unrankFn(n, k, r + 1n);
    expect(
      lexLessFn(a, b),
      `Lex order violated at n=${n}, k=${k}, rank=${r}: ${fmt(a)} should be < ${fmt(b)}`
    ).toBe(true);
  }
}
