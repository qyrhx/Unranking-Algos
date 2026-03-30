import { useState, useRef, useEffect } from "react";
import { AlgoMap, Order, MsgType } from "./algomap.ts";

export default function App() {
  // Inputs
  const [n, setN] = useState<number>(0);
  const [k, setK] = useState<number>(0);
  const [r, setR] = useState<number>(0);

  const [selectedAlgo, setSelectedAlgo] = useState(Array.from(AlgoMap.keys())[0]);
  const [order, setOrder] = useState<Order>(Order.COMB);

  const [result, setResult] = useState<any>("");
  const [listResult, setListResult] = useState<{ r: number; structure: any[] }[] | null>(null);
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

  const formatStructure = (s: any) => {
    const bold = (str: string) =>
      str.split(/(\[|\]|,|\d+)/).map((c, i) =>
        c === '[' || c === ']' || c === ',' ? <b key={i}>{c}</b> :
          /^\d+$/.test(c) ? <span key={i} style={{ color: "#b45309" }}>{c}</span> :
            c
      );

    if (Array.isArray(s) && Array.isArray(s[0])) {
      return s.map((row: any[], i: number) => (
        <span key={i}>{i > 0 ? "  " : ""}{bold(`[${row.join(", ")}]`)}</span>
      ));
    }
    if (Array.isArray(s)) {
      return bold(`[${s.join(", ")}]`);
    }
    return JSON.stringify(s);
  };

  return (
    <div style={{ maxWidth: 600, margin: "1rem auto" }}>
      <h2>Unranking</h2>

      {/* Numeric inputs */}
      <div style={{ marginBottom: "1rem" }}>
        <label>n: <input type="number" value={n} onChange={e => setN(Number(e.target.value))} /></label><br />
        <label>k: <input type="number" value={k} onChange={e => setK(Number(e.target.value))} /></label><br />
        <label>r: <input type="number" value={r} onChange={e => setR(Number(e.target.value))} /></label>
      </div>

      {/* Algorithm selection */}
      <div style={{ marginBottom: "1rem" }}>
        <p>Select algorithm:</p>
        {Array.from(AlgoMap.keys()).map(algo => (
          <label key={algo} style={{ display: "block" }}>
            <input
              type="radio"
              name="algorithm"
              checked={selectedAlgo === algo}
              onChange={() => setSelectedAlgo(algo)}
            />
            {algo}
          </label>
        ))}
      </div>

      {/* Order selection */}
      <div style={{ marginBottom: "1rem" }}>
        <p>Unranking order:</p>
        <label style={{ marginRight: "1em" }}>
          <input
            type="radio"
            name="order"
            checked={order === Order.COMB}
            onChange={() => setOrder(Order.COMB)}
          />
          Combinatorial
        </label>
        <label>
          <input
            type="radio"
            name="order"
            checked={order === Order.LEX}
            onChange={() => setOrder(Order.LEX)}
          />
          Lexicographic
        </label>
      </div>

      {/* Buttons */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5em", flexWrap: "wrap" }}>
        <button onClick={handleCount}   disabled={loading}>Count</button>
        <button onClick={handleUnrank}  disabled={loading}>Unrank</button>
        <button onClick={handleRandom}  disabled={loading}>Random r</button>
        <button onClick={handleListAll} disabled={loading}>List all</button>
        {loading && <button onClick={abortCalculation}>Abort</button>}
      </div>

      {/* Single result */}
      {result && (
        <div>
          <strong>Result:</strong>
          <div style={{
            marginTop: "0.5rem", padding: "0.5rem", maxHeight: "300px",
            overflowX: "auto", whiteSpace: "pre", overflowY: "auto",
            background: "#f0f0f0", minHeight: "1.5em", fontFamily: "monospace"
          }}>
            {typeof result === 'string' ? result : Array.isArray(result) ? formatStructure(result) : result}
          </div>
        </div>
      )}

      {/* List all result */}
      {listResult && (
        <div style={{ marginTop: "1rem" }}>
          <strong>All structures ({listTotal} total):</strong>
          <div style={{
            marginTop: "0.5rem", padding: "0.5rem", maxHeight: "500px",
            overflowY: "auto", background: "#f0f0f0", fontFamily: "monospace", fontSize: "0.9em",
          }}>
            {countExceedsLimit
              ? <span style={{ color: "#dc2626" }}>Count too large to list ({listTotal} structures).</span>
              : listResult.map(({ r: rank, structure }) => (
                <div key={rank}>
                  <span style={{ color: "#888", marginRight: "0.5em",
                    display: "inline-block", width: "7ch"
                  }}>
                    r={rank}
                  </span>
                  {formatStructure(structure)}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
