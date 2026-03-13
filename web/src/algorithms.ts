import { LRUCache } from "lru-cache";

export const algoMap = new Map();

algoMap.set("Stirling", {rankFn: stirling_numbers, unrankFn: unrank_stirling});
algoMap.set("Ordered Stirling", {rankFn: ordered_stirling_numbers, unrankFn: unrank_ordered_stirling});
algoMap.set("Lah", {rankFn: lah_numbers, unrankFn: unrank_lah});
algoMap.set("Ordered Lah", {rankFn: ordered_lah_numbers, unrankFn: unrank_ordered_lah});
algoMap.set("Int Partition", {rankFn: int_partitions, unrankFn: unrank_int_partitions});


function serialize_nk(n, k): string {
    return `${n},${k}`
}

function divmod(a, b) {
    return [Math.floor(a / b), a % b];
}

const stirling_numbers_cache = new LRUCache<string, bigint>({max: 5000});
export function stirling_numbers(n: bigint, k: bigint): bigint {
    // There is exactly 1 way to partition 0 elements into 0 groups.
    if (n == 0 && k == 0) return 1;
    // ex: Partition 0 elements into 3 groups -> impossible
    if (n == 0 || k == 0) return 0;

    const s = serialize_nk(n, k);

    const cached = stirling_numbers_cache.get(s);
    if (cached !== undefined) return cached;

    const res = stirling_numbers(n-1, k-1) + k*stirling_numbers(n-1, k);
    stirling_numbers_cache.set(s, res);
    return res;
}

const lah_numbers_cache = new LRUCache<string, bigint>({max: 5000});
export function lah_numbers(n: bigint, k: bigint): bigint {
    if (n == 0 && k == 0) return 1;
    if (n == 0 || k == 0) return 0;
    if (n == k) return 1;

    const key = serialize_nk(n, k);

    const cached = lah_numbers_cache.get(key);
    if (cached !== undefined) return cached;

    const res = lah_numbers(n-1, k-1) + (n+k-1)*lah_numbers(n-1, k);
    lah_numbers_cache.set(key, res);
    return res;
}

export function unrank_stirling(n, k, r): number[][] {
    if (n == 0 || k == 0)
        return [];
    if (r < stirling_numbers(n-1, k-1)) {
        let res = unrank_stirling(n-1, k-1, r);
        res.push([n]);
        return res
    }

    const r2 = r - stirling_numbers(n-1, k-1);
    const [pos, r3] = divmod(r2, stirling_numbers(n-1, k));
    let us = unrank_stirling(n-1, k, r3);
    us[pos].push(n);
    return us;
}

export function unrank_lah(n, k, r) {
    if (n == 0 && k == 0)
        return [];
    if (n == 0 || k == 0)
        return [];
    if (n == k) // bloc for each number
        return Array.from({ length: n }, (_, x) => [x + 1]);

    let fst_case_cnt = lah_numbers(n-1, k-1);
    if (r < fst_case_cnt) { // Singleton
        let res = unrank_lah(n-1, k-1, r);
        res.push([n]);
        return res;
    }
    // Inserer dans une des boites
    const r2 = r - fst_case_cnt;
    let [pos, r3] = divmod(r2, lah_numbers(n-1, k));
    let res = unrank_lah(n-1, k, r3);
    // trouver l'indice
    for (const boite of res) {
        if (pos < boite.length + 1) {
            boite.splice(pos, 0, n);
            break;
        }
        pos -= boite.length + 1;
    }
    return res
}

export function unrank_perm(n, r) { // unrank de n! different orders
    let elems = Array.from({ length: n }, (_, i) => i + 1); // [1, 2, ..., n]
    let perm = [];

    for (let m = n; m > 0; m--) {
        let f = factorial(m - 1);
        let [idx, newR] = divmod(r, f);
        r = newR;
        perm.push(elems.splice(idx, 1)[0]);
    }
    return perm;
}

export function unrank_ordered_stirling(n, k, r) {
    // Base cases
    if (k === 1) {
        return [Array.from({ length: n }, (_, i) => i + 1)]; // one block (order inside doesn't matter)
    }
    if (k === n) {
        let perm = unrank_perm(n, r); // order of singleton blocks
        return perm.map(x => [x]);
    }

    // Case A: n is a singleton block [n], inserted in one of k positions
    let cntA = k * ordered_stirling_numbers(n - 1, k - 1);
    if (r < cntA) {
        let [pos, newR] = divmod(r, ordered_stirling_numbers(n - 1, k - 1));
        r = newR;
        let res = unrank_ordered_stirling(n - 1, k - 1, r);
        res.splice(pos, 0, [n]);
        return res;
    }

    // Case B: n joins one of the k existing blocks
    r = r - cntA;
    let [pos, newR] = divmod(r, ordered_stirling_numbers(n - 1, k));
    r = newR;
    let res = unrank_ordered_stirling(n - 1, k, r);
    res[pos].push(n);
    // res[pos].sort(); // commented out as in original
    return res;
}

export function factorial(n) {
    if (n < 0) throw new Error("Negative numbers not allowed");
    if (n <= 1) return 1;

    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
const ordered_stirling_cache = new LRUCache<string, number>({max: 5000});
export function ordered_stirling_numbers(n, k): bigint {
    const key = serialize_nk(n, k);

    // Check cache first
    const cached = ordered_stirling_cache.get(key);
    if (cached !== undefined) {
        return cached;
    }

    // Base cases
    if (k === 1 || k === n) {
        const result = factorial(k);
        ordered_stirling_cache.set(key, result);
        return result;
    }

    // Recursive calculation
    const result = k * (ordered_stirling_numbers(n - 1, k - 1) +
                        ordered_stirling_numbers(n - 1, k));

    // Store in cache
    ordered_stirling_cache.set(key, result);
    return result;
}

const int_partitions_cache = new LRUCache({max: 5000});
export function int_partitions(n, k): bigint {
    // Base cases
    if (n < 1) return 0;
    if (k === 1 || n === k) return 1;

    const key = serialize_nk(n, k);
    const cached = int_partitions_cache.get(key);
    if (cached !== undefined) return cached;

    const result = int_partitions(n - 1, k - 1) + int_partitions(n - k, k);
    int_partitions_cache.set(key, result);
    return result;
}

export function unrank_int_partitions(n, k, r) {
    // Base cases
    if (n < 1) return [];
    if (k === 1) return [n];
    if (n === k) return Array(n).fill(1);

    const partitionsCount = int_partitions(n - 1, k - 1);

    if (r < partitionsCount) {
        return [1, ...unrank_int_partitions(n - 1, k - 1, r)];
    } else {
        const r2 = r - partitionsCount;
        const res = unrank_int_partitions(n - k, k, r2);
        return res.map(i => i + 1);
    }
}

const ordered_lah_cache = new LRUCache({max: 5000});
export function ordered_lah_numbers(n, k): bigint {
    // Base cases
    if (k === 1 || k === n) {
        return factorial(n);
    }

    const key = serialize_nk(n, k);
    const cached = ordered_lah_cache.get(key);
    if (cached !== undefined) return cached;

    const result = k * ordered_lah_numbers(n - 1, k - 1) +
                   (n - 1 + k) * ordered_lah_numbers(n - 1, k);

    ordered_lah_cache.set(key, result);
    return result;
}

export function unrank_ordered_lah(n, k, r) {
    if (n === 0 && k === 0)
        return [];

    if (n === 0 || k === 0)
        return [];

    // one block: all permutations inside that block
    if (k === 1) {
        return [unrank_perm(n, r)];
    }

    // each element alone, order of blocks matters
    if (k === n) {
        let perm = unrank_perm(n, r);
        return perm.map(x => [x]);
    }

    // CASE A: create new block [n] in one of k positions
    let cntA = k * ordered_lah_numbers(n - 1, k - 1);

    if (r < cntA) {
        let [pos, newR] = divmod(r, ordered_lah_numbers(n - 1, k - 1));
        let res = unrank_ordered_lah(n - 1, k - 1, newR);
        res.splice(pos, 0, [n]);
        return res;
    }

    // CASE B: insert n into one of the existing ordered blocks
    r = r - cntA;

    let [pos, newR] = divmod(r, ordered_lah_numbers(n - 1, k));
    let res = unrank_ordered_lah(n - 1, k, newR);

    for (const block of res) {
        if (pos < block.length + 1) {
            block.splice(pos, 0, n);
            return res;
        }
        pos -= block.length + 1;
    }

    return res;
}