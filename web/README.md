# Unranking Web App

A web interface to run and explore lexicographic unranking algorithms for Rota's combinatorial structures.

## Requirements

- [Node.js](https://nodejs.org/) (v18+)

## Install & Run

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
```

## Tests

```bash
npm run test
```

Tests cover:

- **Counting functions:** exact values for Stirling numbers, Lah numbers, ordered variants, and integer partitions, cross-checked against [Online Encyclopedia of Integer Sequences (OEIS)](http://oeis.org)
- **Combinatorial-order unranking:** exhaustive bijection checks for small values of *n* and *k*
- **Lexicographic-order unranking:** same exhaustive checks for the lex variants

## Libraries

- [React](https://react.dev/): UI framework
- [Vite](https://vitejs.dev/): build tool and dev server
- [TypeScript](https://www.typescriptlang.org/): type safety
- [Vitest](https://vitest.dev/): test runner
- [lru-cache](https://www.npmjs.com/package/lru-cache): memoization of counting functions
