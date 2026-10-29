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

/**
 * The second Gegenprobe (Nachlese 12 ③, maintainer 29.10.): a block of `ziel` ms of style and
 * layout, no long script. Runs in the page (page.evaluate; no closure over this module): a block of
 * elements laid out off screen is doubled until one recalculation of its style and layout, forced
 * once here to measure it, costs at least `ziel` ms on this runner. Then every hand-over of the
 * Werkstatt to its worker switches a class on the block and reads nothing, so the cost falls in the
 * rendering of the next frame – the block a slow Werkstatt would cause, not a script of its own.
 */
export function stilBlockadeEinbauen(ziel: number): { elemente: number; kosten: number } {
  const host = document.createElement("div");
  host.id = "fm-m5-stilblockade";
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:absolute;inset-inline-start:-100000px;inset-block-start:0;";
  const style = document.createElement("style");
  style.textContent =
    "#fm-m5-stilblockade > span { display: inline-block; inline-size: 7px; padding: 1px; }" +
    "#fm-m5-stilblockade.an > span { inline-size: 8px; padding: 2px; }";
  document.head.append(style);
  document.body.append(host);
  let elemente = 0;
  const grow = (count: number) => {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index++) {
      const span = document.createElement("span");
      span.textContent = "m";
      fragment.append(span);
    }
    host.append(fragment);
    elemente += count;
  };
  const kosten = () => {
    host.classList.toggle("an");
    const started = performance.now();
    void host.offsetHeight;
    return performance.now() - started;
  };
  grow(2000);
  let last = kosten();
  while (last < ziel && elemente < 2_000_000) {
    grow(elemente);
    last = Math.min(kosten(), kosten());
  }
  // Doubling overshoots: take off an eighth at a time while the block still costs `ziel`, so the
  // Gegenprobe stays near the limit (80 ms, not 160).
  while (last > ziel * 1.25) {
    const step = Math.floor(elemente / 8);
    for (let index = 0; index < step; index++) host.lastElementChild?.remove();
    const smaller = Math.min(kosten(), kosten());
    if (smaller < ziel) {
      grow(step);
      elemente -= step;
      last = Math.min(kosten(), kosten());
      break;
    }
    elemente -= step;
    last = smaller;
  }
  const post = Worker.prototype.postMessage;
  Worker.prototype.postMessage = function (this: Worker, ...args: unknown[]) {
    host.classList.toggle("an");
    return (post as (...rest: unknown[]) => void).apply(this, args);
  } as typeof Worker.prototype.postMessage;
  return { elemente, kosten: last };
}
