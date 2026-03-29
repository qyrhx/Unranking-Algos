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
