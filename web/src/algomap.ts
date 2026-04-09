import {stirling_numbers, ordered_stirling_numbers,
  lah_numbers, ordered_lah_numbers, int_partitions}
from "./counting_algos.ts"

import {unrank_stirling, unrank_ordered_stirling,
  unrank_lah, unrank_ordered_lah, unrank_int_partitions}
from "./combinatorial_order.ts"

import {unrank_stirling_lex, unrank_ordered_stirling_lex,
  unrank_lah_lex, unrank_ordered_lah_lex, unrank_int_partitions_lex}
from "./lexicographic_algos.ts"

export enum MsgType {
  COUNT,
  UNRANK,
  RANDOM,
  LIST_ALL,
}


export enum Order {
  COMB,
  LEX,
}

type AlgoEntry = {
  countFn: (n: number, k: number) => bigint;
  unrankFnComb: (n: number, k: number, r: bigint) => number[][] | number[];
  unrankFnLex: (n: number, k: number, r: bigint) => number[][] | number[];
};
export const AlgoMap = new Map<string, AlgoEntry>();

AlgoMap.set("Stirling", {
  countFn: stirling_numbers,
  unrankFnComb: unrank_stirling,
  unrankFnLex: unrank_stirling_lex
});

AlgoMap.set("Ordered Stirling", {
  countFn: ordered_stirling_numbers,
  unrankFnComb: unrank_ordered_stirling,
  unrankFnLex: unrank_ordered_stirling_lex
});

AlgoMap.set("Lah", {
  countFn: lah_numbers,
  unrankFnComb: unrank_lah,
  unrankFnLex: unrank_lah_lex
});

AlgoMap.set("Ordered Lah", {
  countFn: ordered_lah_numbers,
  unrankFnComb: unrank_ordered_lah,
  unrankFnLex: unrank_ordered_lah_lex
});

AlgoMap.set("Int Partition", {
  countFn: int_partitions,
  unrankFnComb: unrank_int_partitions,
  unrankFnLex: unrank_int_partitions_lex
});
