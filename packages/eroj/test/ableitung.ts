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
 * The reference load on the fast CI runners (median), the runner the limit of 150 ms stands for:
 * the median reference of the fast runners in ableitung-kalibrierung.tsv (Spec 035 Befund 1.1;
 * 5 of 16 attempts, 38.7–46.2 ms). It replaces the provisional 50 ms (local reference times the
 * ratio of the fast CI runner to the local machine); a test ties it to the table.
 */
export const REFERENZ_SCHNELL_MS = 41.5;

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
 * The classes of the CI runners by the median of the derivation measured on them (Spec 034): fast
 * below 110 ms, middle from 110 to 130 ms, slow above 130 ms.
 */
export const RUNNER_SCHNELL_UNTER_MS = 110;
export const RUNNER_LANGSAM_UEBER_MS = 130;

export type RunnerKlasse = "schnell" | "mittel" | "langsam";

export function runnerKlasse(ableitungMedian: number): RunnerKlasse {
  if (ableitungMedian < RUNNER_SCHNELL_UNTER_MS) return "schnell";
  if (ableitungMedian > RUNNER_LANGSAM_UEBER_MS) return "langsam";
  return "mittel";
}

/** One attempt of the calibration in CI (Spec 035 Befund 1.1): a row of ableitung-kalibrierung.tsv. */
export interface KalibrierVersuch {
  lauf: string;
  versuch: number;
  head: string;
  referenz: number;
  ableitungMedian: number;
  gegenprobeNormiert: number;
  gegenprobeRot: boolean;
  klasse: RunnerKlasse;
}

/** Reads the calibration table (tab-separated, one header row; columns by name). */
export function kalibrierungLesen(tsv: string): KalibrierVersuch[] {
  const [kopf = "", ...zeilen] = tsv.split("\n").filter((zeile) => zeile.trim() !== "");
  const spalten = kopf.split("\t");
  return zeilen.map((zeile) => {
    const werte = zeile.split("\t");
    const wert = (name: string): string => {
      const index = spalten.indexOf(name);
      if (index < 0 || werte[index] === undefined) {
        throw new Error(`ableitung-kalibrierung.tsv: column ${name} missing`);
      }
      return werte[index];
    };
    const ableitungMedian = Number(wert("ableitung_median_ms"));
    return {
      lauf: wert("run_id"),
      versuch: Number(wert("attempt")),
      head: wert("head_sha"),
      referenz: Number(wert("referenz_ms")),
      ableitungMedian,
      gegenprobeNormiert: Number(wert("gegenprobe_normiert_ms")),
      gegenprobeRot: wert("gegenprobe_rot") === "true",
      klasse: runnerKlasse(ableitungMedian),
    };
  });
}

/** The median of the reference on the fast runners of the table, to a tenth of a millisecond. */
export function bezugswertOf(versuche: readonly KalibrierVersuch[]): number {
  const referenzen = versuche
    .filter((versuch) => versuch.klasse === "schnell")
    .map((versuch) => versuch.referenz)
    .sort((a, b) => a - b);
  if (referenzen.length === 0) throw new Error("no attempt on a fast runner in the table");
  const mitte = Math.floor(referenzen.length / 2);
  const median =
    referenzen.length % 2 === 1
      ? (referenzen[mitte] ?? 0)
      : ((referenzen[mitte - 1] ?? 0) + (referenzen[mitte] ?? 0)) / 2;
  return Math.round(median * 10) / 10;
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
