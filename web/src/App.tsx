import { useState, useRef, useEffect } from "react";

import { algoMap } from "./algorithms";

export default function App() {
    // Inputs
    const [n, setN] = useState<number>(0);
    const [k, setK] = useState<number>(0);
    const [r, setR] = useState<number>(0);

    const [selectedAlgo, setSelectedAlgo] = useState(Array.from(algoMap.keys())[0]);

    const [result, setResult] = useState<any>("");

    const [loading, setLoading] = useState(false);
    const workerRef = useRef<Worker | null>(null);
    useEffect(() => {
        workerRef.current = new Worker(
            new URL("./worker.ts", import.meta.url),
            { type: "module" }
        );

        workerRef.current.onmessage = (e) => {
            setLoading(false);
            setResult(e.data);
        };

        return () => workerRef.current?.terminate();
    }, []);
    const abortCalculation = () => {
        workerRef.current?.terminate();

        // recreate fresh worker
        workerRef.current = new Worker(
            new URL("./worker.ts", import.meta.url),
            { type: "module" }
        );

        workerRef.current.onmessage = (e) => {
            setLoading(false);
            setResult(e.data);
        };

        setLoading(false);
        setResult("Aborted.");
    };

    const handleRank = () => {
        setResult("Calculating...");
        setLoading(true);
        workerRef.current.postMessage({
            type: "rank",
            algo: selectedAlgo,
            n,
            k,
        });
    };

    const handleUnrank = () => {
        setResult("Calculating...");
        setLoading(true);
        workerRef.current.postMessage({
            type: "unrank",
            algo: selectedAlgo,
            n,
            k,
            r,
        });
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
        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5em" }}>
            <button onClick={handleRank} disabled={loading}>Rank</button>
            <button onClick={handleUnrank} disabled={loading}>Unrank</button>
            {loading && (
                <button onClick={abortCalculation}>
                    Abort
                </button>
            )}
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
