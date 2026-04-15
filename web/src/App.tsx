import { useState, useRef, useEffect } from "react";
import { AlgoMap, Order, MsgType } from "./algomap.ts";
import PrefixTree from "./PrefixTree";

export default function App() {
  // Inputs
  const [n, setN] = useState<number>(0);
  const [k, setK] = useState<number>(0);
  const [r, setR] = useState<number>(0);

  const [selectedAlgo, setSelectedAlgo] = useState(Array.from(AlgoMap.keys())[0]);
  const [order, setOrder] = useState<Order>(Order.LEX);

  const [result, setResult] = useState<unknown>("");
  const [listResult, setListResult] = useState<{ r: number; structure: unknown[] }[] | null>(null);
  const [treeData, setTreeData] = useState<any>(null);
  const [listTotal, setListTotal] = useState<string | null>(null);
  const [countExceedsLimit, setCountExceedsLimit] = useState(false);

  const [loading, setLoading] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const createWorker = () => {
    const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    w.onmessage = (e) => {
      const data = e.data;
      setLoading(false);

      if (data.error) {
        setResult(data.error);
        return;
      }

      if (data.type === MsgType.COUNT) {
        setListResult(null);
        setResult(<>Total structures: <span style={{ color: "#b45309" }}>{data.result}</span></>);
        return;
      }

      if (data.type === MsgType.UNRANK) {
        setListResult(null);
        setResult(data.result);
        return;
      }

      if (data.type === MsgType.RANDOM) {
        if (data.error) { setResult(data.error); return; }
        setListResult(null);
        setR(data.r);
        setResult(data.result);
        return;
      }

      if (data.type === MsgType.LIST_ALL) {
        setResult("");
        setListResult(data.result);
        setTreeData(data.treeData);
        setListTotal(data.total);
        setCountExceedsLimit(data.countExceedsLimit);
        return;
      }
    };
    return w;
  };

  useEffect(() => {
    workerRef.current = createWorker();
    return () => workerRef.current?.terminate();
  }, []);

  const abortCalculation = () => {
    workerRef.current?.terminate();
    workerRef.current = createWorker();
    setLoading(false);
    setResult("Aborted.");
  };

  const send = (msg: object) => {
    setResult("Calculating...");
    setListResult(null);
    setLoading(true);
    workerRef.current?.postMessage({ ...msg, order });
  };

  const handleCount   = () => send({ type: MsgType.COUNT,    algo: selectedAlgo, n, k });
  const handleUnrank  = () => send({ type: MsgType.UNRANK,   algo: selectedAlgo, n, k, r });
  const handleRandom  = () => send({ type: MsgType.RANDOM,   algo: selectedAlgo, n, k });
  const handleListAll = () => send({ type: MsgType.LIST_ALL, algo: selectedAlgo, n, k });

  const formatStructure = (s: unknown) => {
    const bold = (str: string) =>
      str.split(/(\[|\]|,|\d+)/).map((c, i) =>
        c === '[' || c === ']' || c === ',' ? <b key={i}>{c}</b> :
          /^\d+$/.test(c) ? <span key={i} style={{ color: "#b45309" }}>{c}</span> :
            c
      );

    if (Array.isArray(s) && Array.isArray(s[0])) {
      return s.map((row: unknown[], i: number) => (
        <span key={i}>{i > 0 ? "  " : ""}{bold(`[${row.join(", ")}]`)}</span>
      ));
    }
    if (Array.isArray(s)) {
      return bold(`[${s.join(", ")}]`);
    }
    return JSON.stringify(s);
  };

  return (
    <div style={{
      display: "flex",
      gap: "2rem",
      padding: "1rem",
      height: "95vh", // Fill the screen
      fontFamily: "sans-serif"
    }}>
      <title>Twelvefold Unranking</title>
      {/* LEFT COLUMN: Controls & Results */}
      <div style={{
        width: "350px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto"
      }}>
        <h2 style={{ marginTop: 0 }}>Unranking</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label>n: <input type="number" value={n} onChange={e => setN(Number(e.target.value))} /></label><br />
          <label>k: <input type="number" value={k} onChange={e => setK(Number(e.target.value))} /></label><br />
          <label>r: <input type="number" value={r} onChange={e => setR(Number(e.target.value))} /></label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <strong>Algorithm:</strong>
          {Array.from(AlgoMap.keys()).map(algo => (
            <label key={algo} style={{ display: "block", fontSize: "0.9rem" }}>
              <input type="radio" checked={selectedAlgo === algo} onChange={() => setSelectedAlgo(algo)} />
              {algo}
            </label>
          ))}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <strong>Order:</strong><br/>
          <label>
            <input type="radio" checked={order === Order.LEX} onChange={() => setOrder(Order.LEX)} /> Lexicographic
          </label>
          <label style={{ marginRight: "1em" }}>
            <input type="radio" checked={order === Order.COMB} onChange={() => setOrder(Order.COMB)} /> Combinatorial
          </label>
        </div>

        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.4em", flexWrap: "wrap" }}>
          <button onClick={handleCount} disabled={loading}>Count</button>
          <button onClick={handleUnrank} disabled={loading}>Unrank</button>
          <button onClick={handleRandom} disabled={loading}>Random r</button>
          <button onClick={handleListAll} disabled={loading}>List all</button>
          {loading && <button onClick={abortCalculation}>Abort</button>}
        </div>

        {/* Results Area */}
        <div style={{ flex: 1 }}>
          {result && (
            <div style={{ marginBottom: "1rem" }}>
              <strong>Result:</strong>
              <div style={{
                marginTop: "0.4rem", padding: "0.5rem", maxHeight: "150px",
                overflow: "auto", whiteSpace: "pre",
                background: "#f0f0f0", fontFamily: "monospace", fontSize: "0.85rem"
              }}>
                {typeof result === 'string' ? result : Array.isArray(result) ? formatStructure(result) : result}
              </div>
            </div>
          )}

          {(listResult || countExceedsLimit) && (
            <div>
              <strong>All ({listTotal}):</strong>
              <div style={{
                marginTop: "0.4rem", padding: "0.5rem", maxHeight: "400px",
                overflowY: "auto", background: "#f0f0f0", fontFamily: "monospace", fontSize: "0.85rem",
              }}>
                {countExceedsLimit
                  ? <span style={{ color: "#dc2626" }}>Too many to list.</span>
                  : listResult.map(({ r: rank, structure }) => (
                    <div key={rank} style={{ borderBottom: "1px solid #ddd", padding: "2px 0" }}>
                      <span style={{ color: "#888", width: "5ch", display: "inline-block" }}>r={rank}</span>
                      {formatStructure(structure)}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: The Big Graph */}
      <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
        {/*order === Order.LEX && */listResult ? (
          <PrefixTree treeRoot={treeData} order={order} />
        ) : (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #ccc",
            color: "#666",
            borderRadius: "8px"
          }}>
            <p>Click <b>List all</b> to visualize the prefix tree.</p>
          </div>
        )}
      </div>
    </div>
  );
}
