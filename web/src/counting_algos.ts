import { LRUCache } from "lru-cache";

import { factorial } from "./utils.ts"

// Helpers
function serialize_nk(n: number, k: number): string {
  return `${n},${k}`;
}

// Stirling numbers
const stirling_cache = new LRUCache<string, bigint>({ max: 10000 });
export function stirling_numbers(n: number, k: number): bigint {
  if (n === 0 && k === 0) return 1n;
  if (n <= 0 || k <= 0 || k > n) return 0n;

  const key = serialize_nk(n, k);
  const cached = stirling_cache.get(key);
  if (cached !== undefined) return cached;

  const res = stirling_numbers(n - 1, k - 1) + BigInt(k) * stirling_numbers(n - 1, k);
  stirling_cache.set(key, res);
  return res;
}

// Ordered Stirling numbers
const ordered_stirling_cache = new LRUCache<string, bigint>({ max: 10000 });
export function ordered_stirling_numbers(n: number, k: number): bigint {
  if (n < 0 || k < 0 || k > n) return 0n;
  if (k === 1 || k === n) return factorial(k);
  const key = serialize_nk(n, k);
  const cached = ordered_stirling_cache.get(key);
  if (cached !== undefined) return cached;
  const result = BigInt(k) * (ordered_stirling_numbers(n - 1, k - 1) + ordered_stirling_numbers(n - 1, k));
  ordered_stirling_cache.set(key, result);
  return result;
}

// Lah numbers
const lah_cache = new LRUCache<string, bigint>({ max: 10000 });
export function lah_numbers(n: number, k: number): bigint {
  if (n === 0 && k === 0) return 1n;
  if (n <= 0 || k <= 0 || k > n) return 0n;
  if (n === k) return 1n;
  const key = serialize_nk(n, k);
  const cached = lah_cache.get(key);
  if (cached !== undefined) return cached;
  const res = lah_numbers(n - 1, k - 1) + BigInt(n + k - 1) * lah_numbers(n - 1, k);
  lah_cache.set(key, res);
  return res;
}

// Ordered Lah numbers
const ordered_lah_cache = new LRUCache<string, bigint>({ max: 10000 });
export function ordered_lah_numbers(n: number, k: number): bigint {
  if (n < 0 || k < 0) return 0n;
  if (k === 1 || k === n || k > n) return factorial(n);
  const key = serialize_nk(n, k);
  const cached = ordered_lah_cache.get(key);
  if (cached !== undefined) return cached;
  const result =
    BigInt(k) * ordered_lah_numbers(n - 1, k - 1) +
      BigInt(n - 1 + k) * ordered_lah_numbers(n - 1, k);
  ordered_lah_cache.set(key, result);
  return result;
}

const int_partitions_cache = new LRUCache<string, bigint>({ max: 10000 });
export function int_partitions(n: number, k: number): bigint {
  if (k === 0) return n > 0 ? 0n : 1n;
  if (n === 0) return k > 0 ? 0n : 1n;
  if (n < k) return 0n;
  if (n === k) return 1n;
  const key = serialize_nk(n, k);
  const cached = int_partitions_cache.get(key);
  if (cached !== undefined) return cached;
  const result = int_partitions(n - 1, k - 1) + int_partitions(n - k, k);
  int_partitions_cache.set(key, result);
  return result;
}
