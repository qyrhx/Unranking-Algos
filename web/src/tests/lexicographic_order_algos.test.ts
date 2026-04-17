import { describe, it, expect } from 'vitest';
import {
  exhaustiveTest,
  lexOrderTest,
  isValidSetPartition,
  isValidIntPartition,
  isCanonicalStirling,
  isCanonicalLah,
  isCanonicalIntPartition,
  lexLessSetPartition,
  lexLessIntPartition,
} from './test_utils.ts';
import {
  stirling_numbers,
  ordered_stirling_numbers,
  lah_numbers,
  ordered_lah_numbers,
  int_partitions
} from '../counting_algos';
import {
  unrank_stirling_lex,
  unrank_ordered_stirling_lex,
  unrank_lah_lex,
  unrank_ordered_lah_lex,
  unrank_int_partitions_lex
} from '../lexicographic_order_algos';

describe('Unranking - Lexicographic Order', () => {
  describe('Stirling Set Partitions (Lex)', () => {
    it('returns empty array for invalid inputs', () => {
      expect(unrank_stirling_lex(0, 1, 0n)).toEqual([]);
      expect(unrank_stirling_lex(1, 0, 0n)).toEqual([]);
    });

    it('exhaustive test for small values', () => {
      for (let n = 1; n <= 6; n++) {
        for (let k = 1; k <= n; k++) {
          exhaustiveTest(
            n, k,
            stirling_numbers,
            unrank_stirling_lex,
            (p, n, k) =>
              isValidSetPartition(p as number[][], n) &&
              (p as number[][]).length === k &&
              isCanonicalStirling(p as number[][])
          );
        }
      }
    });

    it('output is in lexicographic order', () => {
      for (let n = 1; n <= 6; n++) {
        for (let k = 1; k <= n; k++) {
          lexOrderTest(n, k, stirling_numbers, unrank_stirling_lex, lexLessSetPartition);
        }
      }
    });
  });

  describe('Ordered Stirling Set Partitions (Lex)', () => {
    it('exhaustive test for small values', () => {
      for (let n = 1; n <= 5; n++) {
        for (let k = 1; k <= n; k++) {
          exhaustiveTest(
            n, k,
            ordered_stirling_numbers,
            unrank_ordered_stirling_lex,
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

    it('output is in lexicographic order', () => {
      for (let n = 1; n <= 5; n++) {
        for (let k = 1; k <= n; k++) {
          lexOrderTest(n, k, ordered_stirling_numbers, unrank_ordered_stirling_lex, lexLessSetPartition);
        }
      }
    });
  });

  describe('Lah Partitions (Lex)', () => {
    it('exhaustive test for small values', () => {
      for (let n = 1; n <= 5; n++) {
        for (let k = 1; k <= n; k++) {
          exhaustiveTest(
            n, k,
            lah_numbers,
            unrank_lah_lex,
            (p, n, k) =>
              isValidSetPartition(p as number[][], n) &&
              (p as number[][]).length === k &&
              isCanonicalLah(p as number[][])
          );
        }
      }
    });

    it('output is in lexicographic order', () => {
      for (let n = 1; n <= 5; n++) {
        for (let k = 1; k <= n; k++) {
          lexOrderTest(n, k, lah_numbers, unrank_lah_lex, lexLessSetPartition);
        }
      }
    });
  });

  describe('Ordered Lah Partitions (Lex)', () => {
    it('exhaustive test for small values', () => {
      for (let n = 1; n <= 5; n++) {
        for (let k = 1; k <= n; k++) {
          exhaustiveTest(
            n, k,
            ordered_lah_numbers,
            unrank_ordered_lah_lex,
            (p, n, k) =>
              isValidSetPartition(p as number[][], n) &&
              (p as number[][]).length === k
          );
        }
      }
    }, 60000);

    it('output is in lexicographic order', () => {
      for (let n = 1; n <= 5; n++) {
        for (let k = 1; k <= n; k++) {
          lexOrderTest(n, k, ordered_lah_numbers, unrank_ordered_lah_lex, lexLessSetPartition);
        }
      }
    }, 60000);
  });

  describe('Integer Partitions (Lex)', () => {
    it('returns empty array for invalid inputs', () => {
      expect(unrank_int_partitions_lex(0, 1, 0n)).toEqual([]);
      expect(unrank_int_partitions_lex(1, 0, 0n)).toEqual([]);
    });

    it('exhaustive test for small values', () => {
      for (let n = 1; n <= 10; n++) {
        for (let k = 1; k <= n; k++) {
          exhaustiveTest(
            n, k,
            int_partitions,
            unrank_int_partitions_lex,
            (p, n, k) =>
              isValidIntPartition(p as number[], n, k) &&
              isCanonicalIntPartition(p as number[])
          );
        }
      }
    });

    it('output is in lexicographic order', () => {
      for (let n = 1; n <= 10; n++) {
        for (let k = 1; k <= n; k++) {
          lexOrderTest(n, k, int_partitions, unrank_int_partitions_lex, lexLessIntPartition);
        }
      }
    });
  });
});
