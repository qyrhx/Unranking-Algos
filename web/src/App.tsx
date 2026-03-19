import { useState, useRef, useEffect } from "react";
import { algoMap } from "./algorithms";

export default function App() {
  // Inputs
  const [n, setN] = useState<number>(0);
  const [k, setK] = useState<number>(0);
  const [r, setR] = useState<number>(0);

  const [selectedAlgo, setSelectedAlgo] = useState(Array.from(algoMap.keys())[0]);

  const [result, setResult] = useState<any>("");
  const [listResult, setListResult] = useState<{ r: number; structure: any[] }[] | null>(null);
  const [listTotal, setListTotal] = useState<string | null>(null);
  const [listTruncated, setListTruncated] = useState(false);

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

      if (data.type === "count") {
        setListResult(null);
        setResult(`Total structures: ${data.result}`);
        return;
      }

      if (data.type === "unrank") {
        setListResult(null);
        setResult(data.result);
        return;
      }

      if (data.type === "random") {
        if (data.error) { setResult(data.error); return; }
        setListResult(null);
        setR(data.r);
        setResult(data.result);
        return;
      }

      if (data.type === "list_all") {
        setResult("");
        setListResult(data.result);
        setListTotal(data.total);
        setListTruncated(data.truncated);
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
    workerRef.current?.postMessage(msg);
  };

  const handleCount   = () => send({ type: "count",    algo: selectedAlgo, n, k });
  const handleUnrank  = () => send({ type: "unrank",   algo: selectedAlgo, n, k, r });
  const handleRandom  = () => send({ type: "random",   algo: selectedAlgo, n, k });
  const handleListAll = () => send({ type: "list_all", algo: selectedAlgo, n, k });

  const formatStructure = (s: any) => {
    if (Array.isArray(s) && Array.isArray(s[0])) {
      return s.map((row: any[]) => `[${row.join(", ")}]`).join("  ");
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
        {Array.from(algoMap.keys()).map(algo => (
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
            background: "#f0f0f0", minHeight: "1.5em", fontFamily: "monospace",
          }}>
            {Array.isArray(result) && Array.isArray(result[0])
              ? result.map((row: any[], i: number) => <div key={i}>[{row.join(", ")}]</div>)
              : result}
          </div>
        </div>
      )}

      {/* List all result */}
      {listResult && (
        <div style={{ marginTop: "1rem" }}>
          <strong>
            All structures ({listTruncated ? `first 1000 of ` : ""}{listTotal} total):
          </strong>
          <div style={{
            marginTop: "0.5rem", padding: "0.5rem", maxHeight: "500px",
            overflowY: "auto", background: "#f0f0f0", fontFamily: "monospace", fontSize: "0.85em",
          }}>
            {listResult.map(({ r: rank, structure }) => (
              <div key={rank}>
                <span style={{ color: "#888", marginRight: "0.5em" }}>r={rank}</span>
                {formatStructure(structure)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
