import { AlgoMap, Order, MsgType } from "./algomap.ts";

function randomBigInt(max: bigint): bigint {
  if (max <= 0n) return 0n;

  // If max fits safely in a JS number, use Math.random()
  if (max <= BigInt(Number.MAX_SAFE_INTEGER)) {
    return BigInt(Math.floor(Math.random() * Number(max)));
  }

  // Otherwise, generate a random bigint bit by bit
  const bits = max.toString(2).length;
  let result: bigint;
  do {
    result = 0n;
    for (let i = 0; i < bits; i++) {
      if (Math.random() < 0.5) result |= (1n << BigInt(i));
    }
  } while (result >= max);
  return result;
}

self.onmessage = (e) => {
  try {
    const { type, algo, n, k, r, order } = e.data;

    const entry = AlgoMap.get(algo);

    if (!entry) {
      self.postMessage({ error: "Invalid algorithm" });
      return;
    }

    const unrankFn = order === Order.LEX ? entry.unrankFnLex : entry.unrankFnComb;

    if (type === MsgType.COUNT) {
      const count = entry.countFn(n, k);
      self.postMessage({ type: MsgType.COUNT, result: count.toString() });
      return;
    }

    if (type === MsgType.UNRANK) {
      const result = unrankFn(n, k, BigInt(r));
      self.postMessage({ type: MsgType.UNRANK, result });
      return;
    }

    if (type === MsgType.RANDOM) {
      const count = entry.countFn(n, k);
      if (count <= 0n) {
        self.postMessage({ type: MsgType.RANDOM, r: null, error: "No structures for these parameters." });
        return;
      }
      const randomR = randomBigInt(count);
      const result = unrankFn(n, k, randomR);
      self.postMessage({ type: MsgType.RANDOM, r: randomR.toString(), result });
      return;
    }

    if (type === MsgType.LIST_ALL) {
      const MAX_LIST = 1000;
      const count = entry.countFn(n, k);
      if (count <= 0n) {
        self.postMessage({ type: MsgType.LIST_ALL, result: [], total: 0 });
        return;
      }
      const limit = count > BigInt(MAX_LIST) ? MAX_LIST : Number(count);
      const results = [];
      for (let i = 0; i < limit; i++) {
        results.push({ r: i, structure: unrankFn(n, k, BigInt(i)) });
      }
      self.postMessage({
        type: MsgType.LIST_ALL,
        result: results,
        total: count.toString(),
        truncated: count > BigInt(MAX_LIST),
      });
      return;
    }

    self.postMessage({ error: "Unknown message type" });
  } catch (err: any) {
    self.postMessage({ error: err.message || String(err) });
  }
};
