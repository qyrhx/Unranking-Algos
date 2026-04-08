import { describe, it, expect } from 'vitest';
import {
  stirling_numbers,
  ordered_stirling_numbers,
  lah_numbers,
  ordered_lah_numbers,
  int_partitions
} from '../counting_algos';

describe('Stirling Numbers of the Second Kind (OEIS A008277)', () => {
  const expectedValues: [number, number, bigint][] = [
    [1, 1, 1n],
    [2, 1, 1n], [2, 2, 1n],
    [3, 1, 1n], [3, 2, 3n], [3, 3, 1n],
    [4, 1, 1n], [4, 2, 7n], [4, 3, 6n], [4, 4, 1n],
    [5, 1, 1n], [5, 2, 15n], [5, 3, 25n], [5, 4, 10n], [5, 5, 1n],
    [6, 1, 1n], [6, 2, 31n], [6, 3, 90n], [6, 4, 65n], [6, 5, 15n], [6, 6, 1n],
    [7, 1, 1n], [7, 2, 63n], [7, 3, 301n], [7, 4, 350n], [7, 5, 140n], [7, 6, 21n], [7, 7, 1n],
    [8, 1, 1n], [8, 2, 127n], [8, 3, 966n], [8, 4, 1701n], [8, 5, 1050n], [8, 6, 266n], [8, 7, 28n], [8, 8, 1n],
    [9, 1, 1n], [9, 2, 255n], [9, 3, 3025n], [9, 4, 7770n], [9, 5, 6951n], [9, 6, 2646n], [9, 7, 462n], [9, 8, 36n], [9, 9, 1n],
    [10, 1, 1n], [10, 2, 511n], [10, 3, 9330n], [10, 4, 34105n], [10, 5, 42525n], [10, 6, 22827n], [10, 7, 5880n], [10, 8, 750n], [10, 9, 45n], [10, 10, 1n],
  ];

  it('exact values from OEIS', () => {
    for (const [n, k, expected] of expectedValues) {
      expect(stirling_numbers(n, k)).toBe(expected);
    }
  });

  it('returns 0 for invalid inputs', () => {
    expect(stirling_numbers(-1, 1)).toBe(0n);
    expect(stirling_numbers(1, -1)).toBe(0n);
    expect(stirling_numbers(1, 2)).toBe(0n);
    expect(stirling_numbers(0, 1)).toBe(0n);
  });
});


describe('Ordered Stirling Numbers (OEIS A131689)', () => {
  const expectedValues: [number, number, bigint][] = [
    [1, 1, 1n],
    [2, 1, 1n], [2, 2, 2n],
    [3, 1, 1n], [3, 2, 6n], [3, 3, 6n],
    [4, 1, 1n], [4, 2, 14n], [4, 3, 36n], [4, 4, 24n],
    [5, 1, 1n], [5, 2, 30n], [5, 3, 150n], [5, 4, 240n], [5, 5, 120n],
    [6, 1, 1n], [6, 2, 62n], [6, 3, 540n], [6, 4, 1560n], [6, 5, 1800n], [6, 6, 720n],
    [7, 1, 1n], [7, 2, 126n], [7, 3, 1806n], [7, 4, 8400n], [7, 5, 16800n], [7, 6, 15120n], [7, 7, 5040n],
    [8, 1, 1n], [8, 2, 254n], [8, 3, 5796n], [8, 4, 40824n], [8, 5, 126000n], [8, 6, 191520n], [8, 7, 141120n], [8, 8, 40320n],
    [9, 1, 1n], [9, 2, 510n], [9, 3, 18150n], [9, 4, 186480n], [9, 5, 834120n], [9, 6, 1905120n], [9, 7, 2328480n], [9, 8, 1451520n], [9, 9, 362880n],
  ];

  it('exact values from OEIS', () => {
    for (const [n, k, expected] of expectedValues) {
      expect(ordered_stirling_numbers(n, k)).toBe(expected);
    }
  });
});

describe('Lah Numbers (OEIS A271703)', () => {
  const expectedValues: [number, number, bigint][] = [
    [1, 1, 1n],
    [2, 1, 2n], [2, 2, 1n],
    [3, 1, 6n], [3, 2, 6n], [3, 3, 1n],
    [4, 1, 24n], [4, 2, 36n], [4, 3, 12n], [4, 4, 1n],
    [5, 1, 120n], [5, 2, 240n], [5, 3, 120n], [5, 4, 20n], [5, 5, 1n],
    [6, 1, 720n], [6, 2, 1800n], [6, 3, 1200n], [6, 4, 300n], [6, 5, 30n], [6, 6, 1n],
    [7, 1, 5040n], [7, 2, 15120n], [7, 3, 12600n], [7, 4, 4200n], [7, 5, 630n], [7, 6, 42n], [7, 7, 1n],
    [8, 1, 40320n], [8, 2, 141120n], [8, 3, 141120n], [8, 4, 58800n], [8, 5, 11760n], [8, 6, 1176n], [8, 7, 56n], [8, 8, 1n],
    [9, 1, 362880n], [9, 2, 1451520n], [9, 3, 1693440n], [9, 4, 846720n], [9, 5, 211680n], [9, 6, 28224n], [9, 7, 2016n], [9, 8, 72n], [9, 9, 1n],
  ];

  it('exact values from OEIS', () => {
    for (const [n, k, expected] of expectedValues) {
      expect(lah_numbers(n, k)).toBe(expected);
    }
  });
});

describe('Ordered Lah Numbers (not in OEIS, values taken from the paper)', () => {
  const expectedValues: [number, number, bigint][] = [
    [1, 1, 1n],
    [2, 1, 2n], [2, 2, 2n],
    [3, 1, 6n], [3, 2, 12n], [3, 3, 6n],
    [4, 1, 24n], [4, 2, 72n], [4, 3, 72n], [4, 4, 24n],
    [5, 1, 120n], [5, 2, 480n], [5, 3, 720n], [5, 4, 480n], [5, 5, 120n],
    [6, 1, 720n], [6, 2, 3600n], [6, 3, 7200n], [6, 4, 7200n], [6, 5, 3600n], [6, 6, 720n],
    [7, 1, 5040n], [7, 2, 30240n], [7, 3, 75600n], [7, 4, 100800n], [7, 5, 75600n], [7, 6, 30240n], [7, 7, 5040n],
    [8, 1, 40320n], [8, 2, 282240n], [8, 3, 846720n], [8, 4, 1411200n], [8, 5, 1411200n], [8, 6, 846720n], [8, 7, 282240n], [8, 8, 40320n],
  ];

  it('exact values from the paper', () => {
    for (const [n, k, expected] of expectedValues) {
      expect(ordered_lah_numbers(n, k)).toBe(expected);
    }
  });
});


describe('Integer Partitions (OEIS A008284)', () => {
  const expectedValues: [number, number, bigint][] = [
    [1, 1, 1n],
    [2, 1, 1n], [2, 2, 1n],
    [3, 1, 1n], [3, 2, 1n], [3, 3, 1n],
    [4, 1, 1n], [4, 2, 2n], [4, 3, 1n], [4, 4, 1n],
    [5, 1, 1n], [5, 2, 2n], [5, 3, 2n], [5, 4, 1n], [5, 5, 1n],
    [6, 1, 1n], [6, 2, 3n], [6, 3, 3n], [6, 4, 2n], [6, 5, 1n], [6, 6, 1n],
    [7, 1, 1n], [7, 2, 3n], [7, 3, 4n], [7, 4, 3n], [7, 5, 2n], [7, 6, 1n], [7, 7, 1n],
    [8, 1, 1n], [8, 2, 4n], [8, 3, 5n], [8, 4, 5n], [8, 5, 3n], [8, 6, 2n], [8, 7, 1n], [8, 8, 1n],
    [9, 1, 1n], [9, 2, 4n], [9, 3, 7n], [9, 4, 6n], [9, 5, 5n], [9, 6, 3n], [9, 7, 2n], [9, 8, 1n], [9, 9, 1n],
    [10, 1, 1n], [10, 2, 5n], [10, 3, 8n], [10, 4, 9n], [10, 5, 7n], [10, 6, 5n], [10, 7, 3n], [10, 8, 2n], [10, 9, 1n], [10, 10, 1n],
    [11, 1, 1n], [11, 2, 5n], [11, 3, 10n], [11, 4, 11n], [11, 5, 10n], [11, 6, 7n], [11, 7, 5n], [11, 8, 3n], [11, 9, 2n], [11, 10, 1n], [11, 11, 1n],
  ];

  it('exact values from OEIS', () => {
    for (const [n, k, expected] of expectedValues) {
      expect(int_partitions(n, k)).toBe(expected);
    }
  });
});
