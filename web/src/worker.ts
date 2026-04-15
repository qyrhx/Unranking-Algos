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

function buildTree(results: { r: number; structure: any[] }[]): TreeNode | null {
  if (results.length === 0) return null;

  const root: TreeNode = {
    id: "root",
    prefix: [],
    rank: null,
    children: [],
    rankFirst: results[0].r,
    rankLast: results[results.length - 1].r
  };

  for (const { r, structure } of results) {
    let currentNode = root;
    for (let i = 0; i < structure.length; i++) {
      const val = structure[i];
      // Create a prefix array for this depth
      const currentPrefix = structure.slice(0, i + 1);
      const id = JSON.stringify(currentPrefix);

      let child = currentNode.children.find(c => c.id === id);
      if (!child) {
        child = {
          id,
          prefix: currentPrefix, // Crucial: This fixes the 'join' error
          rank: i === structure.length - 1 ? r : null,
          children: [],
          rankFirst: r,
          rankLast: r
        };
        currentNode.children.push(child);
      } else {
        // Update the range for internal nodes
        child.rankLast = r;
      }
      currentNode = child;
    }
  }
  return root;
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
      const MAX_LIST = 200;
      const count = entry.countFn(n, k);

      if (count <= 0n) {
        self.postMessage({ type: MsgType.LIST_ALL, result: [], treeData: null, total: "0" });
        return;
      }

      const exceeds = count > BigInt(MAX_LIST);
      if (exceeds) {
        self.postMessage({
          type: MsgType.LIST_ALL,
          result: null,
          treeData: null,
          total: count.toString(),
          countExceedsLimit: true,
        });
        return;
      }

      const limit = Number(count);
      const results = [];
      for (let i = 0; i < limit; i++) {
        results.push({ r: i, structure: unrankFn(n, k, BigInt(i)) });
      }

      const treeData = buildTree(results);

      self.postMessage({
        type: MsgType.LIST_ALL,
        result: results,
        treeData: treeData,
        total: count.toString(),
        countExceedsLimit: false,
      });
      return;
    }

    self.postMessage({ error: "Unknown message type" });
  } catch (err) {
    self.postMessage({ error: err.message || String(err) });
  }
};
