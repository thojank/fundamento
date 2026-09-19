// "Did you mean" candidates for the Gvidanto functions (Spec 002): edit distance, then name. Pure.

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0] ?? 0;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j] ?? 0;
      row[j] = Math.min(
        above + 1,
        (row[j - 1] ?? 0) + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return row[b.length] ?? 0;
}

/** Up to `count` candidates closest to `wanted`. */
export function nearestNames(wanted: string, candidates: readonly string[], count = 5): string[] {
  return [...new Set(candidates)]
    .map((candidate) => ({ candidate, score: distance(wanted, candidate) }))
    .sort((a, b) => a.score - b.score || (a.candidate < b.candidate ? -1 : 1))
    .slice(0, count)
    .map(({ candidate }) => candidate);
}
