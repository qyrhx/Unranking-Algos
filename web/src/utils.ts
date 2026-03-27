// Integer division and remainder for bigint ranks
export function divmod(a: bigint, b: bigint): [bigint, bigint] {
  return [a / b, a % b];
}

// bigint factorial + avoids overflow for large n
export function factorial(n: number): bigint {
  if (n < 0) throw new Error("Negative numbers not allowed");
  let result = 1n;
  for (let i = 2n; i <= BigInt(n); i++) result *= i;
  return result;
}

export type CountFn = (n: number, k: number) => bigint;
export type UnrankFn = (n: number, k: number, r: bigint) => number[][] | number[];

export function safeCount(countFn: CountFn): CountFn {
  return (n: number, k: number) => {
    if (n < 0 || k < 0) return 0n;
    if (k > n) return 0n;
    return countFn(n, k);
  };
}

export function safeUnrank(countFn: CountFn, unrankFn: UnrankFn): UnrankFn {
  return (n: number, k: number, r: bigint) => {
    // Check for negative inputs
    if (n < 0) throw new Error(`n cannot be negative (got ${n})`);
    if (k < 0) throw new Error(`k cannot be negative (got ${k})`);
    if (r < 0) throw new Error(`rank r cannot be negative (got ${r})`);
    // Check k <= n constraint
    if (k > n) {
      throw new Error(`k (${k}) cannot be greater than n (${n})`);
    }
    // Check rank bounds
    const total = countFn(n, k);
    if (BigInt(r) >= total) {
      throw new Error(`Rank ${r} out of bounds [0, ${total})`);
    }
    return unrankFn(n, k, r);
  };
}
