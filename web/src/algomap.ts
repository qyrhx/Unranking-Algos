import {safeCount, safeUnrank} from "./utils.ts"

import {stirling_numbers, ordered_stirling_numbers,
  lah_numbers, ordered_lah_numbers, int_partitions}
from "./counting_algos.ts"

import {unrank_stirling, unrank_ordered_stirling,
  unrank_lah, unrank_ordered_lah, unrank_int_partitions}
from "./combinatorial_order.ts"

import {unrank_stirling_lex, unrank_ordered_stirling_lex,
  unrank_lah_lex, unrank_ordered_lah_lex, unrank_int_partitions_lex}
from "./lexicographic_algos.ts"

export let AlgoMap = new Map();

AlgoMap.set("Stirling", {
  countFn: safeCount(stirling_numbers),
  unrankFn: safeUnrank(stirling_numbers, unrank_stirling)
});

AlgoMap.set("Stirling Lex", {
  countFn: safeCount(stirling_numbers),
  unrankFn: safeUnrank(stirling_numbers, unrank_stirling_lex)
});

AlgoMap.set("Ordered Stirling", {
  countFn: safeCount(ordered_stirling_numbers),
  unrankFn: safeUnrank(ordered_stirling_numbers, unrank_ordered_stirling)
});

AlgoMap.set("Ordered Stirling Lex", {
  countFn: safeCount(ordered_stirling_numbers),
  unrankFn: safeUnrank(ordered_stirling_numbers, unrank_ordered_stirling_lex)
});

AlgoMap.set("Lah", {
  countFn: safeCount(lah_numbers),
  unrankFn: safeUnrank(lah_numbers, unrank_lah)
});

AlgoMap.set("Lah Lex", {
  countFn: safeCount(lah_numbers),
  unrankFn: safeUnrank(lah_numbers, unrank_lah_lex)
});

AlgoMap.set("Ordered Lah", {
  countFn: safeCount(ordered_lah_numbers),
  unrankFn: safeUnrank(ordered_lah_numbers, unrank_ordered_lah)
});

AlgoMap.set("Ordered Lah Lex", {
  countFn: safeCount(ordered_lah_numbers),
  unrankFn: safeUnrank(ordered_lah_numbers, unrank_ordered_lah_lex)
});

AlgoMap.set("Int Partition", {
  countFn: safeCount(int_partitions),
  unrankFn: safeUnrank(int_partitions, unrank_int_partitions)
});

AlgoMap.set("Int Partition Lex", {
  countFn: safeCount(int_partitions),
  unrankFn: safeUnrank(int_partitions, unrank_int_partitions_lex)
});
