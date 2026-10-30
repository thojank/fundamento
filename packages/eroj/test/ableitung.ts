// The verdict of the derivation of the Werkstatt (M5, Spec 019 ②; #118): the palettes of one slider
// change in the median at most 150 ms. The limit stays 150 ms – on the runner of the reference.
//
// The derivation is computation – two frames, the worker's colour mathematics, the values set on
// the main thread – and it takes as long as the runner is fast: in 105 CI runs 77–108 ms on fast
// runners, 110–120 ms on middle ones and 131–153 ms on slow ones (#118 red with 152.8 ms). So the
// runner's speed is measured beside it, with a fixed load of the same kind (referenzLast), and the
// median is counted on the runner of the reference: divided by k = reference / REFERENZ_SCHNELL_MS,
// never by less than 1, so no machine is held stricter than before and a slow runner is held like a
// fast one. A derivation that becomes slower stays red on every runner (the Gegenprobe).

export const ABLEITUNG_GRENZE_MS = 150;

/**
 * The reference load on the fast CI runners (median), the runner the limit of 150 ms stands for.
 * Provisional: the local reference (37.3 ms) times the ratio of the fast CI runner to this machine
 * in the derivation (101 / 76 ms); set from CI measurements of the reference (PR, follow-up commit).
 */
export const REFERENZ_SCHNELL_MS = 50;

export interface AbleitungUrteil {
  rot: boolean;
  /** The runner's factor: its reference over the fast runner's, at least 1. */
  k: number;
  /** The median of the derivation counted on the runner of the reference. */
  normiert: number;
  grund: string;
}

export function ableitungUrteil(messung: { median: number; referenz: number }): AbleitungUrteil {
  const k = Math.max(1, messung.referenz / REFERENZ_SCHNELL_MS);
  const normiert = messung.median / k;
  const rot = normiert > ABLEITUNG_GRENZE_MS;
  return {
    rot,
    k,
    normiert,
    grund: rot
      ? `Ableitung im Median ${normiert.toFixed(1)} ms auf dem Bezugsrunner (gemessen ${messung.median.toFixed(1)} ms, k ${k.toFixed(2)}), Grenze ${ABLEITUNG_GRENZE_MS} ms`
      : "",
  };
}

/**
 * The reference load (runs in the page; no closure over this module): colour mathematics of the
 * kind the derivation does – conversions with cube roots, powers and angles over a fixed set of
 * values – seven times; the median in milliseconds. It touches no part of the Werkstatt, so a slower
 * Werkstatt never makes the runner look slower.
 */
export function referenzLast(): number {
  const durations: number[] = [];
  let sink = 0;
  for (let round = 0; round < 7; round++) {
    const started = performance.now();
    for (let index = 0; index < 200_000; index++) {
      const r = ((index * 37) % 256) / 255;
      const g = ((index * 59) % 256) / 255;
      const b = ((index * 83) % 256) / 255;
      const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      const l = Math.cbrt(0.4122 * lin(r) + 0.5363 * lin(g) + 0.0514 * lin(b));
      const m = Math.cbrt(0.2119 * lin(r) + 0.6807 * lin(g) + 0.1074 * lin(b));
      const s = Math.cbrt(0.0883 * lin(r) + 0.2817 * lin(g) + 0.63 * lin(b));
      const a = 1.978 * l - 2.4286 * m + 0.4506 * s;
      const bb = 0.0259 * l + 0.7828 * m - 0.8087 * s;
      sink += Math.hypot(a, bb) + Math.atan2(bb, a);
    }
    durations.push(performance.now() - started);
  }
  (globalThis as unknown as { fmReferenzSink: number }).fmReferenzSink = sink;
  durations.sort((x, y) => x - y);
  return durations[3] ?? 0;
}

/**
 * The Gegenprobe (runs in the page): every request of the Werkstatt for palettes waits `ms` on the
 * main thread before its worker gets it – the derivation becomes slower by that much, as a slower
 * derivation of the Werkstatt would. Checks are left alone.
 */
export function ableitungVerlangsamen(ms: number): void {
  const post = Worker.prototype.postMessage;
  Worker.prototype.postMessage = function (this: Worker, ...args: unknown[]) {
    const message = args[0] as { kind?: string } | undefined;
    if (message?.kind === "palettes") {
      const until = performance.now() + ms;
      while (performance.now() < until) {
        // the artificial slowdown
      }
    }
    return (post as (...rest: unknown[]) => void).apply(this, args);
  } as typeof Worker.prototype.postMessage;
}
