import { stirling_numbers, ordered_stirling_numbers,
  lah_numbers, ordered_lah_numbers, int_partitions } from "./counting_algos.ts"
import { divmod } from "./utils.ts"

// Prop 34
function formule2new(n: number, k: number, r: bigint, d0: number, d1: number): bigint {
  if (d0 >= d1) return 0n;
  if (d1 === 0) return stirling_numbers(n, k);

  let u = 0;
  let j = 0;
  let coefA = BigInt(n - d0 - j);
  let coefB = BigInt(n - d1 - j);
  let acc = 0n;

  while (n - Number(r) - (u + 1) >= 0) {
    acc += (coefA - coefB) * stirling_numbers(n - Number(r) - u, k - 1);
    u += 1;
    j += 1;
    coefA = (coefA * BigInt(n - d0 - j)) / BigInt(u + 1);
    coefB = (coefB * BigInt(n - d1 - j)) / BigInt(u + 1);
  }

  return acc;
}

function block_dicho(n: number, k: number, r: bigint): [number[], bigint] {
  const ret: number[] = [];
  let acc = 0n;
  let d0 = 0;
  let position = 1;
  let inf = 1;
  let sup = n;
  let complete = false;

  while (!complete) {
    while (inf < sup) {
      const mid = Math.floor((inf + sup) / 2);
      const rank_mid = formule2new(n, k, BigInt(position), d0, mid) + acc;
      if (r >= rank_mid) {
        inf = mid + 1;
      } else {
        sup = mid;
      }
    }

    const mid = inf;
    const rank_mid = formule2new(n, k, BigInt(position), d0, mid - 1) + acc;
    ret.push(mid - position);
    acc = rank_mid;
    const stirl = stirling_numbers(n - position, k - 1);
    if (r < stirl + acc) {
      complete = true;
    } else {
      position += 1;
      d0 = mid;
      inf = d0 + 1;
      sup = n;
      acc = stirl + acc;
    }
  }

  return [ret, acc];
}

export function unrank_stirling_lex(n: number, k: number, r: bigint): number[][] {
  const n0 = n;
  const res: number[][] = [];

  let r2: bigint = r;
  while (k > 1) {
    const [block, acc] = block_dicho(n, k, r2);
    res.push(block);
    r2 -= acc;
    n -= block.length;
    k -= 1;
  }

  res.push(Array.from({ length: n }, () => 0));
  return permutation_unrank_lex(n0, res);
}

function permutation_unrank_lex(n: number, pos: number[][]): number[][] {
  const L = Array.from({ length: n }, (_, i) => i + 1);
  return pos.map(block =>
    block.map(i => {
      const val = L[i];
      L.splice(i, 1);
      return val;
    })
  );
}


function formule2new_os(n: number, k: number, r: number, d0: number, d1: number): bigint {
  if (d0 >= d1) return 0n;
  if (d1 === 0) return ordered_stirling_numbers(n, k);

  let u = 0;
  let j = 0;
  let coefA = BigInt(n - d0 - j);
  let coefB = BigInt(n - d1 - j);
  let acc = 0n;

  while (n - r - (u + 1) >= 0) {
    acc += (coefA - coefB) * ordered_stirling_numbers(n - r - u, k - 1);
    u += 1;
    j += 1;
    coefA = (coefA * BigInt(n - d0 - j)) / BigInt(u + 1);
    coefB = (coefB * BigInt(n - d1 - j)) / BigInt(u + 1);
  }

  return acc;
}

function block_dicho_os(n: number, k: number, r: bigint): [number[], bigint] {
  const ret: number[] = [];
  let acc = 0n;
  let d0 = 0;
  let position = 1;
  let inf = 1;
  let sup = n;
  let complete = false;

  while (!complete) {
    while (inf < sup) {
      const mid = Math.floor((inf + sup) / 2);
      const rank_mid = formule2new_os(n, k, position, d0, mid) + acc;
      if (r >= rank_mid) {
        inf = mid + 1;
      } else {
        sup = mid;
      }
    }

    const mid = inf;
    const rank_mid = formule2new_os(n, k, position, d0, mid - 1) + acc;
    ret.push(mid - position);
    acc = rank_mid;
    const stirl = ordered_stirling_numbers(n - position, k - 1);
    if (r < stirl + acc) {
      complete = true;
    } else {
      position += 1;
      d0 = mid;
      inf = d0 + 1;
      sup = n;
      acc = stirl + acc;
    }
  }

  return [ret, acc];
}

export function unrank_ordered_stirling_lex(n: number, k: number, r: bigint): number[][] {
  const n0 = n;
  const res: number[][] = [];

  while (k > 1) {
    const [block, acc] = block_dicho_os(n, k, r);
    res.push(block);
    r -= acc;
    n -= block.length;
    k -= 1;
  }

  res.push(Array.from({ length: n }, () => 0));
  return permutation_unrank_lex(n0, res);
}

function block_lex_unrank_lah(n: number, k: number, r: bigint): [number[], bigint] {
  const block: number[] = [];
  let size = 1;
  let contains1 = false;
  let s_up = lah_numbers(n - (size - 1), k) - BigInt(n - size) * lah_numbers(n - size, k);

  while (true) {
    if (!contains1) {
      if (r < s_up) {
        const bigL = lah_numbers(n - size, k - 1);
        block.push(1);
        if (r < bigL) {
          return [block, r];
        } else {
          r -= bigL;
          size += 1;
          contains1 = true;
        }
      } else {
        r -= s_up;
        const sdown = lah_numbers(n - size, k);
        const [elt, rem] = divmod(r, sdown);
        block.push(Number(elt) + 2);
        r = rem;
        size += 1;
      }
      s_up = lah_numbers(n - (size - 1), k) - BigInt(n - size) * lah_numbers(n - size, k);
    } else {
      const [elt, rem] = divmod(r, s_up);
      block.push(Number(elt) + 1);
      r = rem;
      const bigL = lah_numbers(n - size, k - 1);
      if (r < bigL) {
        return [block, r];
      }
      r -= bigL;
      size += 1;
      s_up = lah_numbers(n - (size - 1), k) - BigInt(n - size) * lah_numbers(n - size, k);
    }
  }
}

function extract(block: number[], dispo: number[]): [number[], number[]] {
  const ret: number[] = [];
  for (const i of block) {
    ret.push(dispo[i - 1]);
    dispo.splice(i - 1, 1);
  }
  return [ret, dispo];
}

function extract_part(part: number[][], dispo: number[]): number[][] {
  const ret: number[][] = [];
  for (const block of part) {
    const [extracted, newDispo] = extract(block, dispo);
    dispo = newDispo;
    ret.push(extracted);
  }
  return ret;
}

export function unrank_lah_lex(n: number, k: number, r: bigint): number[][] {
  const part: number[][] = [];
  let size = n;
  let nb_block = k;

  for (let l = 0; l < k; l++) {
    const [block, rem] = block_lex_unrank_lah(size, nb_block, r);
    part.push(block);
    r = rem;
    size -= block.length;
    nb_block -= 1;
  }

  return extract_part(part, Array.from({ length: n }, (_, i) => i + 1));
}

function unrank_ordered_lah_lex_block(n: number, k: number, r: bigint): [number[], bigint] {
  const ret: number[] = [];
  let elt = n;
  let nb = ordered_lah_numbers(elt, k) / BigInt(elt);
  let add: bigint;
  [add, r] = divmod(r, nb);
  ret.push(Number(add) + 1);
  elt -= 1;

  while (true) {
    const lahRec = ordered_lah_numbers(elt, k - 1);
    if (r < lahRec) {
      return [ret, r];
    }
    r -= lahRec;
    nb = ordered_lah_numbers(elt, k) / BigInt(elt);
    [add, r] = divmod(r, nb);
    ret.push(Number(add) + 1);
    elt -= 1;
  }
}

export function unrank_ordered_lah_lex(n: number, k: number, r: bigint): number[][] {
  const part: number[][] = [];
  let size = n;
  let nb_block = k;
  let currentR = r;

  while (nb_block > 0) {
    const [block, rem] = unrank_ordered_lah_lex_block(size, nb_block, currentR);
    part.push(block);
    currentR = rem;
    size -= block.length;
    nb_block -= 1;
  }

  return extract_part(part, Array.from({ length: n }, (_, i) => i + 1));
}


export function unrank_int_partitions_lex(n: number, k: number, r: bigint): number[] {
  const acc: number[] = [];
  let lem = 2;

  if (k === n) {
    return Array(k).fill(1);
  }
  if (k === 1) {
    return [n];
  }

  if (r < int_partitions(n - 1, k - 1)) {
    acc.push(1);
    lem = 1;
    n -= 1;
    k -= 1;
  } else {
    r -= int_partitions(n - 1, k - 1);
  }

  const k_original = k;
  for (let i = 0; i < k_original; i++) {
    if (k === 1) {
      acc.push(n);
      return acc;
    }
    for (let j = lem; j <= n - k + 1; j++) {
      const magic: bigint = int_partitions(n - j - (k - 1) * (j - 1), k - 1);
      if (r < magic) {
        acc.push(j);
        n -= j;
        k -= 1;
        lem = j;
        break;
      }
      r -= magic;
    }
  }
  return acc;
}

console.log(unrank_int_partitions_lex(25, 8, 144n))
