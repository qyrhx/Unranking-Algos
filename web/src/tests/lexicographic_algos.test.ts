import { describe, it, expect } from 'vitest';
import { exhaustiveTest,
  partitionsEqual,
  intPartitionsEqual,
  isValidIntPartition,
  isValidSetPartition
} from './test_utils';
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
} from '../lexicographic_algos';

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
            (p, n, k) => isValidSetPartition(p as number[][], n) && (p as number[][]).length === k,
            partitionsEqual
          );
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
            (p, n, k) => isValidSetPartition(p as number[][], n) && (p as number[][]).length === k,
            partitionsEqual
          );
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
            (p, n, k) => isValidSetPartition(p as number[][], n) && (p as number[][]).length === k,
            partitionsEqual
          );
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
            (p, n, k) => isValidSetPartition(p as number[][], n) && (p as number[][]).length === k,
            partitionsEqual
          );
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
            (p, n, k) => isValidIntPartition(p as number[], n, k),
            intPartitionsEqual
          );
        }
      }
    });
  });
});
;
