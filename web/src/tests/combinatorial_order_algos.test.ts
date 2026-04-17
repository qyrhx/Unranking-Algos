import { describe, it, expect } from 'vitest';
import {
  exhaustiveTest,
  isValidSetPartition,
  isValidIntPartition,
  isCanonicalStirling,
  isCanonicalLah,
  isCanonicalIntPartition,
} from './test_utils.ts';
import {
  stirling_numbers,
  ordered_stirling_numbers,
  lah_numbers,
  ordered_lah_numbers,
  int_partitions
} from '../counting_algos';
import {
  unrank_stirling,
  unrank_ordered_stirling,
  unrank_lah,
  unrank_ordered_lah,
  unrank_int_partitions
} from '../combinatorial_order_algos';

describe('Unranking - Combinatorial Order', () => {
  describe('Stirling Set Partitions', () => {
    it('returns empty array for invalid inputs', () => {
      expect(unrank_stirling(0, 1, 0n)).toEqual([]);
      expect(unrank_stirling(1, 0, 0n)).toEqual([]);
      expect(unrank_stirling(1, 2, 0n)).toEqual([]);
    });

    it('exhaustive test for small values', () => {
      for (let n = 1; n <= 6; n++) {
        for (let k = 1; k <= n; k++) {
          exhaustiveTest(
            n, k,
            stirling_numbers,
            unrank_stirling,
            (p, n, k) =>
              isValidSetPartition(p as number[][], n) &&
              (p as number[][]).length === k &&
              isCanonicalStirling(p as number[][])
          );
        }
      }
    });
  });

  describe('Ordered Stirling Set Partitions', () => {
    it('returns empty array for invalid inputs', () => {
      expect(unrank_ordered_stirling(0, 1, 0n)).toEqual([]);
      expect(unrank_ordered_stirling(1, 0, 0n)).toEqual([]);
    });

    it('exhaustive test for small values', () => {
      for (let n = 1; n <= 5; n++) {
        for (let k = 1; k <= n; k++) {
          exhaustiveTest(
            n, k,
            ordered_stirling_numbers,
            unrank_ordered_stirling,
            // Ordered Stirling: blocks are an ordered sequence (no block sorting),
            // but elements within each block are sets (sorted ascending).
            (p, n, k) =>
              isValidSetPartition(p as number[][], n) &&
              (p as number[][]).length === k &&
              (p as number[][]).every(block =>
                block.every((e, i) => i === 0 || e > block[i - 1])
              )
          );
        }
      }
    });
  });

  describe('Lah Partitions', () => {
    it('returns empty array for invalid inputs', () => {
      expect(unrank_lah(0, 1, 0n)).toEqual([]);
      expect(unrank_lah(1, 0, 0n)).toEqual([]);
    });

    it('exhaustive test for small values', () => {
      for (let n = 1; n <= 5; n++) {
        for (let k = 1; k <= n; k++) {
          exhaustiveTest(
            n, k,
            lah_numbers,
            unrank_lah,
            (p, n, k) =>
              isValidSetPartition(p as number[][], n) &&
              (p as number[][]).length === k &&
              isCanonicalLah(p as number[][])
          );
        }
      }
    });
  });

  describe('Ordered Lah Partitions', () => {
    it('returns empty array for invalid inputs', () => {
      expect(unrank_ordered_lah(0, 1, 0n)).toEqual([]);
      expect(unrank_ordered_lah(1, 0, 0n)).toEqual([]);
    });

    it('exhaustive test for small values', () => {
      for (let n = 1; n <= 5; n++) {
        for (let k = 1; k <= n; k++) {
          exhaustiveTest(
            n, k,
            ordered_lah_numbers,
            unrank_ordered_lah,
            (p, n, k) =>
              isValidSetPartition(p as number[][], n) &&
              (p as number[][]).length === k
          );
        }
      }
    }, 60000);
  });

  describe('Integer Partitions', () => {
    it('returns empty array for invalid inputs', () => {
      expect(unrank_int_partitions(0, 1, 0n)).toEqual([]);
      expect(unrank_int_partitions(1, 0, 0n)).toEqual([]);
      expect(unrank_int_partitions(1, 2, 0n)).toEqual([]);
    });

    it('exhaustive test for small values', () => {
      for (let n = 1; n <= 10; n++) {
        for (let k = 1; k <= n; k++) {
          exhaustiveTest(
            n, k,
            int_partitions,
            unrank_int_partitions,
            (p, n, k) =>
              isValidIntPartition(p as number[], n, k) &&
              isCanonicalIntPartition(p as number[])
          );
        }
      }
    });
  });
});
