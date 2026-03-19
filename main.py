import math
from functools import lru_cache

def L(n, k):
  if k == 0 and n == 0: return 1
  if k <= 0 or k > n: return 0
  return lah_number(n-1, k-1) + (n + k - 1) * lah_number(n-1, k)

def unrank(n, k, r):
  if k == 0:
    return []
  x = nb_stirling(n-1, k-1)
  if r < x:
    return unrank(n-1, k-1, r) + [n]
  else:
    return unrank(n-1, k, r - x)

def lah_number(n, k):
  if k == 0 and n == 0:
    return 1
  if (k == 0 and n != 0) or (k > n):
    return 0
  # k + n-1, soit l'element est insere au debut (donc k possibilites),
  # soit apres les autres nombres, donc n-1
  return (k + n-1) * lah_number(n-1, k) + lah_number(n-1, k-1)

def ordered_stirling(n, k):
  math.factoriel(k) * math.comb(n, k)

@lru_cache
def nb_stirling(n, k):
  if n == 0 and k == 0: return 1
  if n == 0 or k == 0: return 0
  return nb_stirling(n-1, k-1) + k*nb_stirling(n-1, k)

n, k = 5, 3
total = math.comb(n, k)
print(f"All C({n},{k}) = {total} combinations:")
for r in range(total):
  try:
    comb = unrank(n, k, r)
  except:
    continue
  print(f"-Rank {r}: {comb}")
