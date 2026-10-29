// The verdict of M5 and G5 (Spec 019 ②; Nachlese 12 ③): the Werkstatt never blocks the main thread
// longer than 50 ms. The limit stays 50 ms; what changed is how a slow runner is told apart from a
// slow Werkstatt (measured in 23 CI runs, plan Nachlese 12 D-03):
// - Scripts: the longest work of scripts in one frame (Long Animation Frames, forced style and
//   layout inside a script included) – at most 50 ms, in every one of the changes. This is the
//   Werkstatt's own work; a block of 80 ms is red on every runner.
// - Rendering: per change the longest block of the main thread (Long Tasks); the 90th percentile
//   over the changes at most 50 ms. On slow runners single frames of style and layout reach 51 to
//   65 ms (scripts: none) in one or two of 50 changes; a Werkstatt that blocks in most changes is
//   red all the same.

export const M5_GRENZE_MS = 50;
/** The share of the changes whose longest block counts against the limit. */
export const M5_PERZENTIL = 0.9;

export interface M5Messung {
  /** Per change, the longest block of the main thread while it was derived and checked (ms). */
  perChange: number[];
  /** The longest work of scripts in one frame over all changes (ms); 0 where none reached 5 ms. */
  scriptLongest: number;
}

export interface M5Urteil {
  rot: boolean;
  /** The 90th percentile of the blocks per change (ms). */
  perzentil: number;
  gruende: string[];
}

export function perzentil(values: readonly number[], share: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(share * sorted.length) - 1)] ?? 0;
}

export function m5Urteil(messung: M5Messung): M5Urteil {
  const p = perzentil(messung.perChange, M5_PERZENTIL);
  const gruende: string[] = [];
  if (messung.scriptLongest > M5_GRENZE_MS)
    gruende.push(
      `Skripte blockieren ${Math.round(messung.scriptLongest)} ms in einem Frame (Grenze ${M5_GRENZE_MS} ms)`,
    );
  if (p > M5_GRENZE_MS)
    gruende.push(
      `${Math.round(M5_PERZENTIL * 100)}. Perzentil der Blockade je Änderung ${Math.round(p)} ms (Grenze ${M5_GRENZE_MS} ms)`,
    );
  return { rot: gruende.length > 0, perzentil: p, gruende };
}
