// Typography metrics (Spec 004 T002, G7, G7b, G8). A scale must be predictable; which ratio a
// brand picks is its own business (Fluida Marko, plan D-03). Pure.

export interface ScaleConsistency {
  /** Median ratio of the scale; 0 for a scale with fewer than two steps. */
  median: number;
  /** Largest relative deviation of a ratio from that median. */
  worst: number;
  /** Index of the ratio that deviates most, if any. */
  at?: number;
}

export interface RhythmRow {
  size: number;
  lineHeight: number;
  tracking: number;
}

export interface RhythmBreak {
  field: "lineHeight" | "tracking";
  from: number;
  to: number;
}

export interface RhythmResult {
  monotone: boolean;
  breaks: RhythmBreak[];
}

/** The ratios of neighbouring sizes, smallest size first. */
export function typeScaleRatio(sizes: readonly number[]): number[] {
  const sorted = [...sizes].sort((a, b) => a - b);
  return sorted.slice(1).map((size, index) => size / (sorted[index] as number));
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const half = sorted.length >> 1;
  return sorted.length % 2 === 1
    ? (sorted[half] as number)
    : ((sorted[half - 1] as number) + (sorted[half] as number)) / 2;
}

/** How regular a scale is: the largest relative deviation of a ratio from the median ratio. */
export function typeScaleConsistency(sizes: readonly number[]): ScaleConsistency {
  const ratios = typeScaleRatio(sizes);
  const middle = median(ratios);
  if (ratios.length === 0 || middle === 0) {
    return { median: middle, worst: 0 };
  }
  let worst = 0;
  let at: number | undefined;
  ratios.forEach((ratio, index) => {
    const deviation = Math.abs(ratio / middle - 1);
    if (deviation > worst) {
      worst = deviation;
      at = index;
    }
  });
  return { median: middle, worst, ...(at === undefined ? {} : { at }) };
}

/**
 * Rhythm: as the size grows, line height and tracking fall. Larger type needs less leading and
 * tighter tracking — that is legibility, not taste (Spec 004, G8).
 */
export function typeRhythm(rows: readonly RhythmRow[]): RhythmResult {
  const sorted = [...rows].sort((a, b) => a.size - b.size);
  const breaks: RhythmBreak[] = [];
  sorted.slice(1).forEach((row, index) => {
    const previous = sorted[index] as RhythmRow;
    if (row.lineHeight > previous.lineHeight) {
      breaks.push({ field: "lineHeight", from: previous.size, to: row.size });
    }
    if (row.tracking > previous.tracking) {
      breaks.push({ field: "tracking", from: previous.size, to: row.size });
    }
  });
  return { monotone: breaks.length === 0, breaks };
}
