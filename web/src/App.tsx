import { useState } from "react";
import { stirling_numbers, lah_numbers, ordered_stirling_numbers,
         ordered_lah_numbers, int_partitions,
         unrank_stirling, unrank_lah, unrank_ordered_stirling,
         unrank_ordered_lah, unrank_int_partitions } from './algorithms';

type Algorithm =
  | "stirling"
  | "orderedStirling"
  | "lah"
  | "orderedLah"
  | "intPartition";

export default function App() {
  // Inputs
  const [n, setN] = useState<number>(0);
  const [k, setK] = useState<number>(0);
  const [r, setR] = useState<number>(0);

  // Always have a default selected algorithm
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithm>("stirling");

  const [result, setResult] = useState<any>("");

  // Map algorithms to their functions
  const rankFuncs: Record<Algorithm, (n: number, k: number) => any> = {
    stirling: stirling_numbers,
    orderedStirling: ordered_stirling_numbers,
    lah: lah_numbers,
    orderedLah: ordered_lah_numbers,
    intPartition: int_partitions,
  };

  const unrankFuncs: Record<Algorithm, (n: number, k: number, r: number) => any> = {
    stirling: unrank_stirling,
    orderedStirling: unrank_ordered_stirling,
    lah: unrank_lah,
    orderedLah: unrank_ordered_lah,
    intPartition: unrank_int_partitions,
  };

  const handleRank = () => {
    const fn = rankFuncs[selectedAlgo];
    const res = fn(n, k);
    setResult(res);
  };

  const handleUnrank = () => {
    const fn = unrankFuncs[selectedAlgo];
    const res = fn(n, k, r);
    setResult(res);
  };

  return (
      <div style={{ maxWidth: 500, margin: "1rem auto"}}>
          <h2>Unranking</h2>

          {/* Numeric inputs */}
          <div style={{ marginBottom: "1rem" }}>
              <label>n: <input type="number" value={n} onChange={e => setN(Number(e.target.value))} /></label><br/>
              <label>k: <input type="number" value={k} onChange={e => setK(Number(e.target.value))} /></label><br/>
              <label>r: <input type="number" value={r} onChange={e => setR(Number(e.target.value))} /></label>
          </div>

          {/* Algorithm selection */}
          <div style={{ marginBottom: "1rem" }}>
              <p>Select algorithm:</p>
              {(["Stirling","Ordered Stirling","Lah","Ordered Lah","Int Partition"] as Algorithm[]).map(algo => (
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
          <div style={{ marginBottom: "1rem" }}>
              <button onClick={handleRank}>Rank</button>
              <button onClick={handleUnrank} style={{ marginLeft: "0.5rem" }}>Unrank</button>
          </div>

          {/* Result */}
          <div>
              <strong>Result:</strong>
              <div
                  style={{
                      marginTop: "0.5rem",
                      padding: "0.5rem",
                      maxHeight: "500px",
                      overflowX: "auto",
                      whiteSpace: "pre",
                      overflowY: "auto",
                      background: "#f0f0f0",
                      minHeight: "1.5em",
                      fontFamily: "monospace",
                  }}
              >
                  {Array.isArray(result) && Array.isArray(result[0])
                  ? result.map((row: any[], i: number) => (
                      <div key={i}>[{row.join(", ")}]</div>
                  ))
                  : result}
              </div>
          </div>
      </div>
  );
}
