import { expect } from 'vitest';

export function fmt(obj: unknown): string {
  return JSON.stringify(obj);
}

export function partitionsEqual(a: number[][], b: number[][]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
}

/**
 * Exhaustively verifies that an unranking function enumerates exactly the expected
 * set of objects for given parameters (n, k). Specifically asserts that:
 * - every unranked object passes the provided validity check (the structure, i.e., right
     number of blocks, elements are in range, no duplicates within a partition, etc.)
 * - no two distinct ranks produce the same object
 * - the total number of objects matches the counting function
 *
 * @param n
 * @param k
 * @param countFn
 * @param unrankFn
 * @param validateFn: checks that an object is structurally valid
 * @param equalFn: checks equality between two objects
 */
export function exhaustiveTest<T>(
  n: number,
  k: number,
  countFn: (n: number, k: number) => bigint,
  unrankFn: (n: number, k: number, r: bigint) => T,
  validateFn: (obj: T, n: number, k: number) => boolean,
  equalFn: (a: T, b: T) => boolean
): void {
  const count = countFn(n, k);
  if (count === 0n) return;

  const seen: T[] = [];
  for (let r = 0n; r < count; r++) {
    const obj = unrankFn(n, k, r);

    expect(
      validateFn(obj, n, k),
      `Invalid object at n=${n}, k=${k}, rank=${r}: ${fmt(obj)}`
    ).toBe(true);

    for (const prev of seen) {
      expect(
        equalFn(obj, prev),
        `Duplicate at n=${n}, k=${k}, rank=${r}: ${fmt(obj)} already seen as ${fmt(prev)}`
      ).toBe(false);
    }
    seen.push(obj);
  }

  expect(
    BigInt(seen.length),
    `Wrong count at n=${n}, k=${k}: generated ${seen.length} objects but expected ${count}`
  ).toBe(count);
}

export function intPartitionsEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((val, idx) => val === sortedB[idx]);
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
