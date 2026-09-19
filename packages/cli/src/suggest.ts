// "Did you mean …?" support for usage errors: plain Levenshtein distance, no dependencies.

/** Levenshtein distance (insertions, deletions and substitutions all cost 1). */
export function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const substitution = (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1);
      const deletion = (previous[j] ?? 0) + 1;
      const insertion = (current[j - 1] ?? 0) + 1;
      current.push(Math.min(substitution, deletion, insertion));
    }
    previous = current;
  }
  return previous[b.length] ?? 0;
}

/**
 * The candidate closest to `input`, comparing against each of its keys. Ties go to the earlier
 * candidate. Returns undefined only when there are no candidates.
 */
export function closest<T>(
  input: string,
  candidates: readonly T[],
  keysOf: (candidate: T) => readonly string[],
): T | undefined {
  let best: T | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    for (const key of keysOf(candidate)) {
      const distance = editDistance(input, key);
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    }
  }
  return best;
}
