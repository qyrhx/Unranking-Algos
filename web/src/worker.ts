import { algoMap } from "./algorithms";

self.onmessage = (e) => {
  const { type, algo, n, k, r } = e.data;

  const entry = algoMap.get(algo);

  if (!entry) {
    self.postMessage("Invalid algorithm");
    return;
  }

  const result =
    type === "rank"
      ? entry.rankFn(n, k)
      : entry.unrankFn(n, k, r);

  self.postMessage(result);
};
