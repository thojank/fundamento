/// <reference lib="dom" />
// The Werkstatt of the Vitrino (Spec 016 ②, G7, plan ② D-04–D-12): the browser side of the
// Agordilo. From the data island `fm-werkstatt` (the structure core + komuna with its fingerprint,
// the calibration, the two schemas) it derives the six palettes of an Agordo live — on every
// change of the panel — and sets them as custom properties of the Vitrino, so every Ero follows;
// the checks (the same as the CI's, in the same library) run debounced and write the Raporto the
// CLI writes. The Agordo travels compressed in the fragment (`#agordo=…`) and leaves as a download;
// the Vitrino writes no file (E7). This module is bundled by Vite (werkstatt-bundle.ts) and
// embedded in the Vitrino; it holds no colour and no number of the brand of its own.
//
// Spec 019 ② (G5, G7): stage 2 — the groups Form, Raum, Schrift and Icons beside Farbe, their
// values live as custom properties (written by the CSS Celo's own formatter), a reset per slider,
// undo and redo in the page's memory, the suggestion bar of a link from propose_agordo
// (`#vorschlag=…`), fonts the browser lacks named as a hint. The palettes and the check run in two
// workers made from this very module (its text, as a Blob): the main thread only sets values, so
// moving a slider never blocks it. Without workers the same code runs on the main thread.

import {
  type Agordo,
  type AgordoPatch,
  type Calibration,
  type DerivedPalettes,
  type DerivedStep,
  deriveAspekto,
  deriveGestalt,
  derivePalettes,
  floorsOf,
  type GestaltBasis,
  gestaltBasis,
  IKONO_GEWICHTE,
  modeOverrides,
  parseAgordoColor,
  type Raporto,
  type RaportoViolation,
  type Regler,
  readAgordo,
  reglerDiff,
  reglerOf,
  reglerValue,
  type Structure,
  structureModelo,
  type Vorschlag,
  vorschlagSatz,
  withRegler,
} from "@fundamento/agordilo/browser";
import {
  CORE_SET_NAME,
  type Modelo,
  oklchColor,
  provideModeloSchemas,
  readDtcgColor,
  srgbComponentsOf,
} from "@fundamento/modelo";
import { cssVariable, glyphValue, tokenDeclarations } from "../css/css.js";
import type { WerkstattDatumoj } from "./html.js";

/** The fragment and the check wait this long after the last change (plan ② D-07, M3). */
const CHECK_DELAY_MS = 400;
const FRAGMENT_DELAY_MS = 300;
const STATUS = ["success", "warning", "danger", "info"] as const;
/** Changes of one control closer than this are one step of the history (a drag, a typed word). */
const HISTORY_MERGE_MS = 600;
/**
 * Nachlese 8 ② (M5, D-14): the entries of the report written in one task before the main thread
 * is given back. An entry costs about 0.65 ms on a CI runner (its Eroj with their shadow roots);
 * 73 entries in one task were a block of 52 ms. Twelve stay under 10 ms.
 */
const REPORT_BATCH = 12;
const FONT_ROLES = ["display", "body", "code"] as const;
const GROUPS = [
  { key: "farbe", label: "Farbe" },
  { key: "form", label: "Form" },
  { key: "raum", label: "Raum" },
  { key: "schrift", label: "Schrift" },
] as const;

/** The id of a slider: stage 1 keeps its ids of Spec 016 (fm-werkstatt-helligkeit …). */
function reglerId(path: string): string {
  const [group, key] = path.split(".");
  return group === "regler" || group === "neutral"
    ? `fm-werkstatt-${key}`
    : `fm-werkstatt-${group}-${key}`;
}

/** A font the browser has, judged by the width of a sample against three generic fallbacks. */
function fontInstalled(family: string): boolean {
  const context = document.createElement("canvas").getContext("2d");
  if (context === null) return true;
  const sample = "mmmmmmmmmmlli1WWQ@";
  const quoted = `"${family.replaceAll('"', "")}"`;
  for (const fallback of ["monospace", "serif", "sans-serif"]) {
    context.font = `72px ${fallback}`;
    const base = context.measureText(sample).width;
    context.font = `72px ${quoted}, ${fallback}`;
    if (context.measureText(sample).width !== base) return true;
  }
  return false;
}

/** The messages between the page and its workers (palettes live, the check debounced). */
type WorkerRequest =
  | { kind: "init"; datumoj: WerkstattDatumoj }
  | { kind: "palettes" | "check"; id: number; agordo: Agordo };
type WorkerAnswer =
  | { kind: "palettes"; id: number; palettes: DerivedPalettes; ms: number }
  | { kind: "check"; id: number; raporto: Raporto; ms: number }
  | { kind: "error"; id: number; message: string };

interface VitrinoApi {
  setFragmentPart(name: string, value: string | undefined): void;
  getFragmentPart(name: string): string | undefined;
  onFragment(handler: (parts: Map<string, string>) => void): void;
  setModus(modus: string): void;
  render(): void;
}

interface State {
  agordo: Agordo;
  palettes?: DerivedPalettes;
  raporto?: Raporto;
  /** How many checks ran; tests wait on it. */
  checked: number;
  /** The last derivation and check, in milliseconds (in the worker, or here without one). */
  timings: { derive: number; check: number };
  /** Whether the palettes and the check run in workers (G5); false on the main thread. */
  worker: boolean;
}

const esc = (text: string): string =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ??
      character,
  );
const ratio = (value: number): string => `${value.toFixed(2)}:1`;
const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`The Werkstatt has no element ${id}.`);
  return element as T;
};

/** `#rrggbb` of a colour text of the Agordo (hex or OKLCH), clipped to sRGB for the picker. */
function hexOf(text: string): string | undefined {
  const colour = parseAgordoColor(text);
  if (colour === undefined) return undefined;
  const components = srgbComponentsOf(oklchColor(colour.l, colour.c, colour.h));
  return `#${components
    .map((channel) =>
      Math.round(Math.min(1, Math.max(0, channel)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/**
 * The lead colour of the reference Aspekto (M1: hue and chroma of accent.700), read from the
 * structure: the reference's values live in the core set, its own set restates what differs.
 */
function referenceLeadColour(structure: Structure, reference: string): string {
  const walk = (node: unknown, path: readonly string[]): unknown =>
    path.reduce<unknown>(
      (current, key) =>
        typeof current === "object" && current !== null
          ? (current as Record<string, unknown>)[key]
          : undefined,
      node,
    );
  for (const name of [`aspekto/${reference}`, CORE_SET_NAME]) {
    const set = structure.files.sets.find((entry) => entry.name === name);
    const value = walk(set?.value, ["color", "palette", "accent", "700", "$value"]);
    const colour = readDtcgColor(value);
    if (colour === undefined) continue;
    if (typeof colour.hex === "string") return colour.hex;
    return `#${srgbComponentsOf(colour)
      .map((channel) =>
        Math.round(Math.min(1, Math.max(0, channel)) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;
  }
  throw new Error("The structure has no accent.700 for the reference Aspekto.");
}

/** `#agordo=…`: deflate-raw, base64url (plan ② D-10). */
async function compress(text: string): Promise<string> {
  const stream = new Blob([new TextEncoder().encode(text)])
    .stream()
    .pipeThrough(new CompressionStream("deflate-raw"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function decompress(part: string): Promise<string> {
  const binary = atob(part.replaceAll("-", "+").replaceAll("_", "/"));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(stream).text();
}

/** The Agordo with a patch applied (a suggestion, a slider, an override); null takes a target back. */
function patched(agordo: Agordo, patch: AgordoPatch): Agordo {
  const next: Agordo = structuredClone(agordo);
  if (patch.leitfarbe !== undefined) next.leitfarbe = patch.leitfarbe;
  if (patch.neutral !== undefined) next.neutral = { ...next.neutral, ...patch.neutral };
  if (patch.regler !== undefined) next.regler = { ...next.regler, ...patch.regler };
  if (patch.ziele !== undefined) {
    const ziele = { ...next.ziele };
    for (const [key, value] of Object.entries(patch.ziele)) {
      if (value === null) delete ziele[key];
      else ziele[key] = { ...ziele[key], ...value };
    }
    if (Object.keys(ziele).length === 0) delete next.ziele;
    else next.ziele = ziele;
  }
  return next;
}

class Werkstatt {
  readonly #datumoj: WerkstattDatumoj;
  readonly #structure: Structure;
  readonly #calibration: Calibration;
  readonly #modelo: Modelo;
  readonly #floors: ReturnType<typeof floorsOf>;
  readonly #overrides: ReturnType<typeof modeOverrides>;
  readonly #basis: GestaltBasis;
  readonly #regloj: Regler[];
  readonly #referenceStyle: string;
  readonly #vitrino: VitrinoApi;
  readonly #root = document.documentElement;
  readonly #eroTexts: Map<string, string>;
  readonly state: State;
  #built = false;
  #checkTimer: ReturnType<typeof setTimeout> | undefined;
  #fragmentTimer: ReturnType<typeof setTimeout> | undefined;
  #lastFragment: string | undefined;
  #sides: { draft: HTMLElement; reference: HTMLElement } | undefined;
  #lastValid: Agordo;
  /** The custom properties of stage 2 set on the root and the draft side (G7). */
  #gestaltProps = new Set<string>();
  /** Undo and redo, in the page's memory only (G7). */
  #past: Agordo[] = [];
  #future: Agordo[] = [];
  #lastRecord = { source: "", at: 0 };
  /** A suggestion of a link from propose_agordo, until it is taken or dropped (G7). */
  #vorschlag: Vorschlag | undefined;
  #lastVorschlag: string | undefined;
  /** The two workers (G5) and what is asked of them. */
  #live: Worker | undefined;
  #checker: Worker | undefined;
  #paletteRun = { id: 0, sent: 0, busy: false, started: 0 };
  #checkRun = { id: 0, sent: 0, busy: false, started: 0 };
  #paletteWaiters: (() => void)[] = [];
  #frame: number | undefined;
  #paletteFrame: number | undefined;
  #pendingPalettes: DerivedPalettes | undefined;
  #checkWaiters: ((raporto: Raporto) => void)[] = [];

  constructor(datumoj: WerkstattDatumoj, vitrino: VitrinoApi) {
    this.#datumoj = datumoj;
    this.#vitrino = vitrino;
    provideModeloSchemas(datumoj.schemas);
    this.#structure = datumoj.structure;
    this.#calibration = datumoj.calibration;
    this.#modelo = structureModelo(this.#structure);
    this.#floors = floorsOf(this.#modelo);
    this.#overrides = modeOverrides(this.#structure);
    this.#basis = gestaltBasis(this.#structure.files);
    this.#regloj = reglerOf(this.#basis);
    const referenceAspekto = this.#structure.files.packages[0]?.aspekto.value as
      | { ikonoj?: { style?: string } }
      | undefined;
    this.#referenceStyle = referenceAspekto?.ikonoj?.style ?? "regular";
    this.#eroTexts = new Map(
      this.#modelo.eroj.map((entry) => [entry.ero.name, JSON.stringify(entry.skemo)]),
    );
    const agordo: Agordo = {
      name: "entwurf",
      leitfarbe: referenceLeadColour(this.#structure, datumoj.reference),
    };
    this.#lastValid = agordo;
    // The schema of the Agordo is compiled on its first read (about 80 ms): here, while the page
    // loads, not on the first move of a slider (G5).
    readAgordo(agordo, "agordo.json");
    this.state = { agordo, checked: 0, timings: { derive: 0, check: 0 }, worker: false };
    this.#live = this.#spawn("palettes");
    this.#checker = this.#spawn("check");
  }

  // --- the workers (G5) -------------------------------------------------------------------------

  /** A worker from the text of this module; undefined where the browser gives none. */
  #spawn(kind: "palettes" | "check"): Worker | undefined {
    const source = document.getElementById("fm-vitrino-werkstatt-skripto")?.textContent ?? "";
    if (source === "" || typeof Worker === "undefined") return undefined;
    try {
      // A classic worker: Chromium starts no module worker from a Blob in a file:// page, Firefox
      // and WebKit start both. The module's own syntax is made classic — import.meta becomes the
      // worker's location (every URL built on it is absolute: data:, fm-provided:), the dead
      // CLI branch (import.meta.main) false, and an async function holds the whole.
      const classic = `"use strict";(async () => {\n${source
        .replaceAll("import.meta.main", "false")
        .replaceAll("import.meta.url", "self.location.href")}\n})();`;
      const url = URL.createObjectURL(new Blob([classic], { type: "text/javascript" }));
      const worker = new Worker(url, { name: `fm-werkstatt-${kind}` });
      worker.addEventListener("message", (event: MessageEvent<WorkerAnswer>) =>
        this.#onAnswer(event.data),
      );
      worker.addEventListener("error", () => this.#dropWorker(kind));
      worker.postMessage({ kind: "init", datumoj: this.#datumoj } satisfies WorkerRequest);
      return worker;
    } catch {
      return undefined;
    }
  }

  /** A worker that fails gives its work to the main thread. */
  #dropWorker(kind: "palettes" | "check"): void {
    if (kind === "palettes") {
      this.#live?.terminate();
      this.#live = undefined;
      this.#paletteRun.busy = false;
      this.#requestPalettes();
    } else {
      this.#checker?.terminate();
      this.#checker = undefined;
      this.#checkRun.busy = false;
      this.#requestCheck();
    }
    this.state.worker = this.#live !== undefined && this.#checker !== undefined;
  }

  #onAnswer(answer: WorkerAnswer): void {
    this.state.worker = this.#live !== undefined && this.#checker !== undefined;
    if (answer.kind === "error") {
      this.#status(`Die Werkstatt konnte nicht rechnen: ${answer.message}`);
      return;
    }
    if (answer.kind === "palettes") {
      this.#paletteRun.busy = false;
      this.state.timings.derive = performance.now() - this.#paletteRun.started;
      if (answer.id !== this.#paletteRun.id) {
        this.#requestPalettes();
        return;
      }
      // Set in the next frame, together with whatever else the frame changes.
      this.#pendingPalettes = answer.palettes;
      if (this.#paletteFrame === undefined) {
        this.#paletteFrame = requestAnimationFrame(() => {
          this.#paletteFrame = undefined;
          const palettes = this.#pendingPalettes;
          this.#pendingPalettes = undefined;
          if (palettes !== undefined) this.#applyPalettes(palettes);
          this.#flush(this.#paletteWaiters, undefined);
        });
      }
      return;
    }
    this.#checkRun.busy = false;
    this.state.timings.check = performance.now() - this.#checkRun.started;
    if (answer.id === this.#checkRun.id) this.#finishCheck(answer.raporto);
    else this.#requestCheck();
  }

  #flush<T>(waiters: ((value: T) => void)[], value: T): void {
    for (const resolve of waiters.splice(0)) resolve(value);
  }

  /** Asks for the palettes of the last valid Agordo; one request in flight, the newest wins. */
  #requestPalettes(): void {
    if (this.#paletteRun.busy) return;
    const id = this.#paletteRun.id;
    this.#paletteRun.started = performance.now();
    if (this.#live === undefined) {
      const palettes = derivePalettes(
        this.#lastValid,
        this.#calibration,
        this.#floors,
        this.#overrides,
      );
      this.state.timings.derive = performance.now() - this.#paletteRun.started;
      this.#applyPalettes(palettes);
      this.#flush(this.#paletteWaiters, undefined);
      return;
    }
    this.#paletteRun.busy = true;
    this.#paletteRun.sent = id;
    this.#live.postMessage({
      kind: "palettes",
      id,
      agordo: this.#lastValid,
    } satisfies WorkerRequest);
  }

  #requestCheck(): void {
    if (this.#checkRun.busy) return;
    const id = this.#checkRun.id;
    this.#checkRun.started = performance.now();
    if (this.#checker === undefined) {
      const { raporto } = deriveAspekto(this.#lastValid, this.#structure, this.#calibration);
      this.state.timings.check = performance.now() - this.#checkRun.started;
      this.#finishCheck(raporto);
      return;
    }
    this.#checkRun.busy = true;
    this.#checkRun.sent = id;
    this.#checker.postMessage({
      kind: "check",
      id,
      agordo: this.#lastValid,
    } satisfies WorkerRequest);
  }

  /** Starts: reads the fragment, builds the workshop when the mode is on, follows the root. */
  start(): void {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "data-fm-modus") this.#onModus();
        else if (this.#active()) {
          this.#reapply();
          this.#mirrorSides();
        }
      }
    });
    observer.observe(this.#root, {
      attributes: true,
      attributeFilter: ["data-fm-modus", ...this.#dimensioAttributes()],
    });
    this.#vitrino.onFragment((parts) => {
      const part = parts.get("agordo");
      if (part !== undefined && part !== this.#lastFragment) void this.#loadFragment(part);
      const vorschlag = parts.get("vorschlag");
      if (vorschlag !== this.#lastVorschlag) void this.#loadVorschlag(vorschlag);
    });
    const initial = this.#vitrino.getFragmentPart("agordo");
    if (initial !== undefined) void this.#loadFragment(initial);
    const vorschlag = this.#vitrino.getFragmentPart("vorschlag");
    if (vorschlag !== undefined) void this.#loadVorschlag(vorschlag);
    document.addEventListener("keydown", (event) => this.#onKey(event));
    this.#onModus();
  }

  #dimensioAttributes(): string[] {
    return this.#modelo.dimensioj.map((dimensio) => `data-fm-${dimensio.name}`);
  }

  #active(): boolean {
    return this.#root.getAttribute("data-fm-modus") === "werkstatt";
  }

  #onModus(): void {
    if (this.#active()) {
      this.#build();
      this.#applyDraft();
      this.#mirrorSides();
      this.#scheduleCheck();
    } else {
      this.#clearDraft();
    }
  }

  // --- the Agordo ------------------------------------------------------------------------------

  /**
   * Sets the Agordo: the panel follows, the values of stage 2 at once, the palettes from the live
   * worker, the check and the fragment wait. A change from the panel is a step of the history
   * (`record`, merged with the previous one of the same control within HISTORY_MERGE_MS).
   */
  setAgordo(
    agordo: Agordo,
    options: { write?: boolean; check?: "now" | "later"; record?: string | false } = {},
  ): void {
    const previous = this.state.agordo;
    if (options.record !== undefined && options.record !== false)
      this.#record(previous, options.record);
    this.state.agordo = agordo;
    const read = readAgordo(agordo, "agordo.json");
    if (read.agordo !== undefined) this.#lastValid = read.agordo;
    this.#syncPanel(read.issues.map((issue) => issue.path));
    this.#renderVorschlag();
    if (!this.#active()) return;
    this.#applyDraft();
    if (options.check === "now") void this.runCheck();
    else this.#scheduleCheck();
    if (options.write !== false) this.#scheduleFragment();
  }

  applyPatch(patch: AgordoPatch): void {
    this.setAgordo(patched(this.state.agordo, patch), { record: "patch" });
  }

  // --- the history (G7) ------------------------------------------------------------------------

  #record(previous: Agordo, source: string): void {
    const now = performance.now();
    const merge =
      source === this.#lastRecord.source && now - this.#lastRecord.at < HISTORY_MERGE_MS;
    this.#lastRecord = { source, at: now };
    if (!merge) this.#past.push(previous);
    this.#future = [];
    this.#syncHistory();
  }

  undo(): void {
    const previous = this.#past.pop();
    if (previous === undefined) return;
    this.#future.push(this.state.agordo);
    this.#lastRecord = { source: "", at: 0 };
    this.setAgordo(previous, { record: false });
    this.#syncHistory();
  }

  redo(): void {
    const next = this.#future.pop();
    if (next === undefined) return;
    this.#past.push(this.state.agordo);
    this.#lastRecord = { source: "", at: 0 };
    this.setAgordo(next, { record: false });
    this.#syncHistory();
  }

  #syncHistory(): void {
    if (!this.#built) return;
    const lock = (id: string, locked: boolean) => {
      const element = byId(id);
      if (locked) element.setAttribute("disabled", "");
      else element.removeAttribute("disabled");
    };
    lock("fm-werkstatt-malfari", this.#past.length === 0);
    lock("fm-werkstatt-refari", this.#future.length === 0);
  }

  /** ⌘Z / Ctrl+Z undoes, ⇧⌘Z / Ctrl+Shift+Z redoes — not inside a text field, which has its own. */
  #onKey(event: KeyboardEvent): void {
    if (!this.#active() || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z")
      return;
    const target = event.composedPath()[0];
    const text =
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLInputElement && !["range", "color", "checkbox"].includes(target.type));
    if (text) return;
    event.preventDefault();
    if (event.shiftKey) this.redo();
    else this.undo();
  }

  // --- the suggestion bar (G7) -------------------------------------------------------------------

  async #loadVorschlag(part: string | undefined): Promise<void> {
    this.#lastVorschlag = part;
    if (part === undefined) {
      this.#vorschlag = undefined;
      this.#renderVorschlag();
      return;
    }
    try {
      const value = JSON.parse(await decompress(part)) as { wunsch?: unknown; agordo?: unknown };
      const { agordo, issues } = readAgordo(value.agordo, "vorschlag.json", "/agordo");
      if (agordo === undefined) {
        this.#status(
          `Der Vorschlag im Fragment ist ungültig: ${issues.map((issue) => `${issue.path} – ${issue.message}`).join("; ")}`,
        );
        return;
      }
      this.#vorschlag = {
        ...(typeof value.wunsch === "string" ? { wunsch: value.wunsch } : {}),
        agordo,
      };
    } catch (error) {
      this.#status(
        `Der Vorschlag im Fragment ist nicht lesbar: ${error instanceof Error ? error.message : String(error)}`,
      );
      return;
    }
    this.#renderVorschlag();
  }

  #renderVorschlag(): void {
    if (!this.#built) return;
    const bar = byId("fm-werkstatt-vorschlag");
    if (this.#vorschlag === undefined) {
      bar.hidden = true;
      return;
    }
    const diff = reglerDiff(this.state.agordo, this.#vorschlag.agordo, this.#basis);
    byId("fm-werkstatt-vorschlag-satz").textContent = vorschlagSatz(this.#vorschlag.wunsch, diff);
    bar.hidden = false;
  }

  #closeVorschlag(take: boolean): void {
    const vorschlag = this.#vorschlag;
    this.#vorschlag = undefined;
    this.#lastVorschlag = undefined;
    this.#vitrino.setFragmentPart("vorschlag", undefined);
    if (take && vorschlag !== undefined) {
      this.setAgordo(vorschlag.agordo, { record: "vorschlag" });
      this.#lastRecord = { source: "", at: 0 };
    }
    this.#renderVorschlag();
  }

  async #loadFragment(part: string): Promise<void> {
    try {
      const value: unknown = JSON.parse(await decompress(part));
      const { agordo, issues } = readAgordo(value, "agordo.json");
      this.#lastFragment = part;
      if (agordo === undefined) {
        this.#status(
          `Die Agordo im Fragment ist ungültig: ${issues.map((issue) => `${issue.path} – ${issue.message}`).join("; ")}`,
        );
        return;
      }
      this.setAgordo(agordo, { write: false });
    } catch (error) {
      this.#status(
        `Die Agordo im Fragment ist nicht lesbar: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  #scheduleFragment(): void {
    clearTimeout(this.#fragmentTimer);
    this.#fragmentTimer = setTimeout(() => void this.#writeFragment(), FRAGMENT_DELAY_MS);
  }

  async #writeFragment(): Promise<void> {
    const part = await compress(JSON.stringify(this.#lastValid));
    this.#lastFragment = part;
    this.#vitrino.setFragmentPart("agordo", part);
  }

  // --- the derivation (live) and the check (debounced) ------------------------------------------

  /**
   * A new Agordo: the values of stage 2 and the palettes from the live worker — once per frame
   * however many inputs the frame brought (G5: the main thread only sets values).
   */
  #applyDraft(): void {
    this.#paletteRun.id += 1;
    if (this.#frame !== undefined) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = undefined;
      this.#applyGestalt();
      this.#requestPalettes();
    });
  }

  /** A new mode of the root: the mode-specific values again, nothing derived anew. */
  #reapply(): void {
    this.#applyGestalt();
    if (this.state.palettes !== undefined) this.#applyPalettes(this.state.palettes);
  }

  #applyPalettes(palettes: DerivedPalettes): void {
    this.state.palettes = palettes;
    this.#setProperties(this.#root, palettes);
    if (this.#sides !== undefined) this.#setProperties(this.#sides.draft, palettes);
    this.#renderPaletteValues(palettes);
  }

  /**
   * Form, space, type and icon weight (G7, Spec 019 ①): the tokens the Gestalt changes, written
   * with the declarations of the CSS Celo, on the root and the draft side. A token the dark
   * colour scheme sets anew takes the Gestalt's dark value in dark (or the stylesheet's); the
   * glyphs of a further Phosphor weight replace `--fm-ikono-<name>`.
   */
  #applyGestalt(): void {
    const gestalt = deriveGestalt(this.#lastValid, this.#basis);
    const dark = this.#root.getAttribute("data-fm-color-scheme") === "dark";
    const darkSet = this.#basis.overlays.get("color-scheme/dark");
    const next = new Map<string, string>();
    const declare = (name: string, value: unknown) => {
      for (const [property, css] of tokenDeclarations(
        name,
        this.#basis.types.get(name) ?? "",
        value,
      )) {
        next.set(property, css);
      }
    };
    for (const [name, value] of gestalt.main) {
      if (dark && darkSet?.has(name) === true) continue;
      declare(name, value);
    }
    if (dark) for (const [name, value] of gestalt.dark) declare(name, value);
    const weight = this.#lastValid.ikono?.gewicht ?? this.#referenceStyle;
    if (weight !== this.#referenceStyle) {
      for (const [name, svg] of Object.entries(
        this.#structure.ikonoGewichte?.glyphs[weight] ?? {},
      )) {
        next.set(`--fm-ikono-${name}`, glyphValue(svg));
      }
    }
    const targets = [this.#root, ...(this.#sides === undefined ? [] : [this.#sides.draft])];
    for (const property of this.#gestaltProps) {
      if (next.has(property)) continue;
      for (const target of targets) target.style.removeProperty(property);
    }
    for (const [property, css] of next) {
      for (const target of targets) {
        if (target.style.getPropertyValue(property) !== css)
          target.style.setProperty(property, css);
      }
    }
    this.#gestaltProps = new Set(next.keys());
    this.#hintFonts();
  }

  #setProperties(element: HTMLElement, palettes: DerivedPalettes): void {
    const mode = this.#root.getAttribute("data-fm-color-scheme") === "dark" ? "dark" : "light";
    // Nachlese 8 ② (M5): only what changed is written. A write of the root's inline style, even of
    // the value it has, makes the browser recompute the style of every element on screen.
    const set = (property: string, value: string) => {
      if (element.style.getPropertyValue(property) !== value)
        element.style.setProperty(property, value);
    };
    for (const step of palettes.steps) {
      set(cssVariable(`color.palette.${step.palette}.${step.step}`), step.hex);
    }
    for (const step of palettes.overrides) {
      if (step.mode === mode)
        set(cssVariable(`color.palette.${step.palette}.${step.step}`), step.hex);
    }
    for (const role of FONT_ROLES) {
      const font = this.#lastValid.schriften?.[role];
      const property = cssVariable(`font.family.${role}`);
      if (font === undefined) {
        if (element.style.getPropertyValue(property) !== "") element.style.removeProperty(property);
      } else set(property, JSON.stringify(font.family));
    }
  }

  #clearDraft(): void {
    const palettes = this.state.palettes;
    for (const step of [...(palettes?.steps ?? []), ...(palettes?.overrides ?? [])]) {
      this.#root.style.removeProperty(cssVariable(`color.palette.${step.palette}.${step.step}`));
    }
    for (const role of FONT_ROLES) {
      this.#root.style.removeProperty(cssVariable(`font.family.${role}`));
    }
    for (const property of this.#gestaltProps) this.#root.style.removeProperty(property);
    this.#gestaltProps = new Set();
  }

  #scheduleCheck(): void {
    clearTimeout(this.#checkTimer);
    this.#checkTimer = setTimeout(() => void this.runCheck(), CHECK_DELAY_MS);
  }

  /**
   * Runs every check of the Agordilo on the draft — in the check worker, or here without one — and
   * resolves with the Raporto of the Agordo as it is now (G5, G6).
   */
  runCheck(): Promise<Raporto> {
    clearTimeout(this.#checkTimer);
    const done = new Promise<Raporto>((resolve) => this.#checkWaiters.push(resolve));
    this.#checkRun.id += 1;
    this.#requestCheck();
    return done;
  }

  #finishCheck(raporto: Raporto): void {
    this.state.raporto = raporto;
    this.#reportRun += 1;
    const run = this.#reportRun;
    // The check counts as done once its report stands complete; a newer report that arrives
    // meanwhile takes over, and its end resolves every waiter.
    void this.#renderReport(raporto, run).then((complete) => {
      if (!complete) return;
      this.state.checked += 1;
      this.#renderExport(raporto);
      document.dispatchEvent(new CustomEvent("fm-werkstatt-raporto", { detail: raporto }));
      this.#flush(this.#checkWaiters, raporto);
    });
  }

  /** The palettes of the Agordo as it is now, once they are set. */
  #palettesNow(): Promise<void> {
    const done = new Promise<void>((resolve) => this.#paletteWaiters.push(resolve));
    this.#applyDraft();
    return done;
  }

  /**
   * M5 (Spec 019 ②): `count` slider changes, each derived (the palettes, with the values of stage
   * 2) and checked, the times in milliseconds, and the longest block of the main thread meanwhile
   * (Long Tasks, where the browser reports them). The Agordo is restored afterwards.
   */
  async measure(
    count: number,
  ): Promise<{ derive: number[]; check: number[]; longest: number; longTasks: number }> {
    const original = this.state.agordo;
    const derive: number[] = [];
    const check: number[] = [];
    const long: number[] = [];
    let observer: PerformanceObserver | undefined;
    if (PerformanceObserver.supportedEntryTypes?.includes("longtask") === true) {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) long.push(entry.duration);
      });
      observer.observe({ type: "longtask" });
    }
    for (let index = 0; index < count; index++) {
      const helligkeit = Math.round((-1 + (2 * (index + 1)) / (count + 1)) * 100) / 100;
      this.state.agordo = patched(original, { regler: { helligkeit } });
      this.#lastValid = this.state.agordo;
      const started = performance.now();
      await this.#palettesNow();
      derive.push(performance.now() - started);
      const checking = performance.now();
      await this.runCheck();
      check.push(performance.now() - checking);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    observer?.disconnect();
    this.setAgordo(original, { write: false });
    await this.runCheck();
    return { derive, check, longest: Math.max(0, ...long), longTasks: long.length };
  }

  // --- the panel --------------------------------------------------------------------------------

  #build(): void {
    if (this.#built) return;
    this.#built = true;
    const host = byId("fm-werkstatt-ujo");
    const slider = (regler: Regler) => {
      const id = reglerId(regler.path);
      return `<div class="fm-werkstatt-regilo"><label for="${id}">${esc(regler.label)}</label><output for="${id}">${regler.standard}</output><input type="range" id="${id}" min="${regler.min}" max="${regler.max}" step="${regler.step}" value="${regler.standard}"><fm-butono size="small" emphasis="low" data-fm-rekomenci-regilo="${esc(regler.path)}">Zurücksetzen<span class="fm-werkstatt-kasxita"> ${esc(regler.label)}</span></fm-butono></div>`;
    };
    const sliders = (group: string) =>
      this.#regloj
        .filter((regler) => regler.group === group)
        .map(slider)
        .join("");
    const weights = [
      this.#referenceStyle,
      ...IKONO_GEWICHTE.filter(
        (weight) =>
          weight !== this.#referenceStyle &&
          this.#structure.ikonoGewichte?.glyphs[weight] !== undefined,
      ),
    ];
    const groupOf = (key: string, label: string, content: string) =>
      `<fm-faldilo id="fm-werkstatt-gruppe-${key}" open><span slot="summary">${esc(label)}</span><div class="fm-werkstatt-grupo">${content}</div></fm-faldilo>`;
    const zusatzfarben = `<fieldset><legend>Zusatzfarben</legend>${STATUS.map(
      (status) =>
        `<div class="fm-werkstatt-koloro"><div><fm-markobutono id="fm-werkstatt-${status}-standard" checked>Standard</fm-markobutono><label for="fm-werkstatt-${status}-elektilo" class="fm-werkstatt-kasxita">${status} wählen</label><input type="color" id="fm-werkstatt-${status}-elektilo" disabled></div><fm-kampo id="fm-werkstatt-${status}" disabled>${status}<span slot="help">eigener Farbton, Hex oder OKLCH</span><span slot="error" hidden>Keine Farbe.</span></fm-kampo></div>`,
    ).join("")}</fieldset>`;
    const fonts = FONT_ROLES.map(
      (role) =>
        `<fm-kampo id="fm-werkstatt-schrift-${role}">Schrift ${role}<span slot="help">Name einer Schriftfamilie; leer: die der Struktur</span></fm-kampo>`,
    ).join("");
    host.innerHTML = `<div id="fm-werkstatt-vorschlag" class="fm-werkstatt-vorschlag" role="region" aria-label="Vorschlag" hidden><p id="fm-werkstatt-vorschlag-satz"></p><div class="fm-group"><fm-butono id="fm-werkstatt-vorschlag-uebernehmen" emphasis="high">Übernehmen</fm-butono><fm-butono id="fm-werkstatt-vorschlag-verwerfen" emphasis="medium">Verwerfen</fm-butono></div></div>
<div class="fm-group" role="group" aria-label="Verlauf"><fm-butono id="fm-werkstatt-malfari" emphasis="low" disabled>Rückgängig</fm-butono><fm-butono id="fm-werkstatt-refari" emphasis="low" disabled>Wiederholen</fm-butono></div>
<div class="fm-werkstatt-kolumnoj">
<form id="fm-werkstatt-panelo" class="fm-werkstatt-panelo" aria-label="Panel der Werkstatt">
<h3>Agordo</h3>
<fm-kampo id="fm-werkstatt-nomo" required>Name<span slot="help">Kleinbuchstaben, Ziffern, Bindestrich</span><span slot="error" hidden>Der Name folgt der Grammatik nicht.</span></fm-kampo>
<div class="fm-werkstatt-koloro"><div><label for="fm-werkstatt-leitfarbe-elektilo" class="fm-werkstatt-kasxita">Leitfarbe wählen</label><input type="color" id="fm-werkstatt-leitfarbe-elektilo"></div><fm-kampo id="fm-werkstatt-leitfarbe" required>Leitfarbe<span slot="help">Hex (#rrggbb) oder OKLCH (L C H)</span><span slot="error" hidden>Keine Farbe: Hex (#rrggbb) oder OKLCH (L C H).</span></fm-kampo></div>
${GROUPS.map((group) =>
  groupOf(
    group.key,
    group.label,
    group.key === "farbe"
      ? zusatzfarben + sliders("farbe")
      : group.key === "schrift"
        ? sliders("schrift") + fonts + '<p id="fm-werkstatt-schrift-hinweis" role="status"></p>'
        : sliders(group.key),
  ),
).join("")}
${groupOf("ikonoj", "Icons", `<fm-elektilo id="fm-werkstatt-ikono-gewicht" value="${esc(this.#referenceStyle)}">Icon-Gewicht${weights.map((weight) => `<data slot="options" value="${esc(weight)}">${esc(weight)}</data>`).join("")}<span slot="help">Phosphor; jede Glyphe des Ikonaro in diesem Gewicht</span></fm-elektilo>`)}
</form>
<div id="fm-werkstatt-raporto" class="fm-werkstatt-raporto">
<h3>Prüfbericht</h3>
<p id="fm-werkstatt-stato" class="fm-werkstatt-stato" role="status" aria-live="polite">Die Prüfung läuft …</p>
<dl class="fm-werkstatt-zahloj" id="fm-werkstatt-zahloj"></dl>
<ol id="fm-werkstatt-malobservoj" aria-label="Verstöße"></ol>
<div id="fm-werkstatt-apca"></div>
<div class="fm-group"><fm-butono id="fm-werkstatt-elsxuti" emphasis="high" disabled>Agordo herunterladen</fm-butono><fm-butono id="fm-werkstatt-jugxo-malfermi" emphasis="medium" disabled>Jugxo eintragen</fm-butono></div>
<p id="fm-werkstatt-elsxuti-kialo"></p>
<fm-dialogo id="fm-werkstatt-jugxo" size="medium" reason="required">Jugxo eintragen<span slot="message">Ein Jugxo deckt jeden Verstoß gegen eine anpassbare Regel; er steht in der Agordo und wandert ins Paket.</span><span slot="reason">Begründung</span><span slot="reason-help">Warum die Marke von der Regel abweicht, in einem Satz.</span><div slot="content"><fm-kampo id="fm-werkstatt-jugxo-dato" kind="date" required>Datum</fm-kampo><fm-kampo id="fm-werkstatt-jugxo-nomo" required>Name</fm-kampo></div><fm-butono slot="actions" emphasis="low">Abbrechen</fm-butono><fm-butono slot="actions" emphasis="high">Eintragen</fm-butono></fm-dialogo>
</div>
</div>
<div id="fm-werkstatt-paletroj"><h3>Paletten</h3><p>Sechs Paletten mit Stufe, Wert und erreichtem Kontrast gegen die Bezugsfläche des Modus. Ein Ziel je Stufe lässt sich überschreiben; eine überschriebene Stufe ist markiert und einzeln rücksetzbar.</p></div>
<div id="fm-werkstatt-komparo"><h3>Gegenüberstellung</h3><fm-elektilo id="fm-werkstatt-referenco" value="${esc(this.#datumoj.reference)}">Vergleich mit${this.#datumoj.aspektoj.map((aspekto) => `<data slot="options" value="${esc(aspekto)}">${esc(aspekto)}</data>`).join("")}</fm-elektilo><div class="fm-werkstatt-flankoj"><div data-fm-side="draft" aria-label="Entwurf"><h4 id="fm-werkstatt-flanko-entwurf">Entwurf</h4></div><div data-fm-side="reference" aria-label="Referenz"><h4 id="fm-werkstatt-flanko-referenco">${esc(this.#datumoj.reference)}</h4></div></div></div>`;
    this.#buildPalettes();
    this.#buildSides();
    this.#wirePanel();
    this.#syncPanel([]);
    this.#syncHistory();
    this.#renderVorschlag();
  }

  #wirePanel(): void {
    const nomo = byId("fm-werkstatt-nomo");
    nomo.addEventListener("input", () => {
      this.setAgordo(
        { ...this.state.agordo, name: nomo.getAttribute("value") ?? "" },
        { record: "name" },
      );
    });
    const leitfarbe = byId("fm-werkstatt-leitfarbe");
    const picker = byId<HTMLInputElement>("fm-werkstatt-leitfarbe-elektilo");
    leitfarbe.addEventListener("input", () => {
      this.setAgordo(
        { ...this.state.agordo, leitfarbe: leitfarbe.getAttribute("value") ?? "" },
        { record: "leitfarbe" },
      );
    });
    picker.addEventListener("input", () => {
      this.setAgordo({ ...this.state.agordo, leitfarbe: picker.value }, { record: "leitfarbe" });
    });
    for (const status of STATUS) {
      const standard = byId(`fm-werkstatt-${status}-standard`);
      const field = byId(`fm-werkstatt-${status}`);
      const colour = byId<HTMLInputElement>(`fm-werkstatt-${status}-elektilo`);
      const set = (value: string | undefined) => {
        const zusatzfarben = { ...this.state.agordo.zusatzfarben };
        if (value === undefined) delete zusatzfarben[status];
        else zusatzfarben[status] = value;
        const next: Agordo = { ...this.state.agordo };
        if (Object.keys(zusatzfarben).length === 0) delete next.zusatzfarben;
        else next.zusatzfarben = zusatzfarben;
        this.setAgordo(next, { record: `zusatzfarbe:${status}` });
      };
      standard.addEventListener("input", () => {
        set(standard.hasAttribute("checked") ? undefined : colour.value);
      });
      field.addEventListener("input", () => set(field.getAttribute("value") ?? ""));
      colour.addEventListener("input", () => set(colour.value));
    }
    for (const regler of this.#regloj) {
      const input = byId<HTMLInputElement>(reglerId(regler.path));
      input.addEventListener("input", () => {
        this.setAgordo(withRegler(this.state.agordo, regler.path, Number(input.value)), {
          record: regler.path,
        });
      });
    }
    byId("fm-werkstatt-panelo").addEventListener("click", (event) => {
      const button = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-fm-rekomenci-regilo]",
      );
      const path = button?.dataset.fmRekomenciRegilo;
      if (path === undefined) return;
      this.setAgordo(withRegler(this.state.agordo, path, undefined), { record: `reset:${path}` });
    });
    const gewicht = byId("fm-werkstatt-ikono-gewicht");
    const onWeight = () => {
      const value = gewicht.getAttribute("value") ?? this.#referenceStyle;
      const current = this.state.agordo.ikono?.gewicht ?? this.#referenceStyle;
      if (value === current) return;
      this.setAgordo(
        withRegler(
          this.state.agordo,
          "ikono.gewicht",
          value === this.#referenceStyle ? undefined : value,
        ),
        { record: "ikono.gewicht" },
      );
    };
    gewicht.addEventListener("input", onWeight);
    gewicht.addEventListener("change", onWeight);
    for (const role of FONT_ROLES) {
      const field = byId(`fm-werkstatt-schrift-${role}`);
      field.addEventListener("input", () => {
        const family = (field.getAttribute("value") ?? "").trim();
        const schriften = { ...this.state.agordo.schriften };
        const own = schriften[role];
        if (family === "") delete schriften[role];
        else if (own?.family !== family) {
          // A name alone (G2): the font travels as a name, never as a file; its licence is unknown,
          // so it is not redistributed (plan ① Abweichung 1, plan ② D-07).
          schriften[role] = {
            family,
            license: "proprietary",
            source: "Werkstatt: nur der Name, ohne Datei",
            redistributable: false,
            scripts: ["Latn"],
          };
        }
        const next: Agordo = { ...this.state.agordo };
        if (Object.keys(schriften).length === 0) delete next.schriften;
        else next.schriften = schriften;
        this.setAgordo(next, { record: `schrift:${role}` });
      });
    }
    byId("fm-werkstatt-malfari").addEventListener("click", () => this.undo());
    byId("fm-werkstatt-refari").addEventListener("click", () => this.redo());
    byId("fm-werkstatt-vorschlag-uebernehmen").addEventListener("click", () =>
      this.#closeVorschlag(true),
    );
    byId("fm-werkstatt-vorschlag-verwerfen").addEventListener("click", () =>
      this.#closeVorschlag(false),
    );
    byId("fm-werkstatt-panelo").addEventListener("submit", (event) => event.preventDefault());

    byId("fm-werkstatt-elsxuti").addEventListener("click", () => this.#download());
    const dialog = byId("fm-werkstatt-jugxo");
    byId("fm-werkstatt-jugxo-malfermi").addEventListener("click", () => {
      dialog.setAttribute("open", "");
    });
    dialog.addEventListener("confirm", (event) => {
      const reason = (event as CustomEvent<{ reason?: string }>).detail?.reason ?? "";
      const date = byId("fm-werkstatt-jugxo-dato").getAttribute("value") ?? "";
      const name = byId("fm-werkstatt-jugxo-nomo").getAttribute("value") ?? "";
      this.#recordJugxoj(reason, date, name);
    });
    const referenco = byId("fm-werkstatt-referenco");
    referenco.addEventListener("input", () => this.#mirrorSides());
    referenco.addEventListener("change", () => this.#mirrorSides());
  }

  /** The panel shows the Agordo; a field whose value does not read is marked invalid. */
  #syncPanel(invalidPaths: readonly string[]): void {
    if (!this.#built) return;
    const { agordo } = this.state;
    const invalid = (pointer: string) => invalidPaths.some((path) => path.endsWith(pointer));
    const field = (id: string, value: string | undefined, bad: boolean) => {
      const element = byId(id);
      if (element.getAttribute("value") !== (value ?? "")) {
        if (value === undefined || value === "") element.removeAttribute("value");
        else element.setAttribute("value", value);
      }
      if (bad) element.setAttribute("invalid", "");
      else element.removeAttribute("invalid");
      const error = element.querySelector<HTMLElement>('[slot="error"]');
      if (error !== null) error.hidden = !bad;
    };
    field("fm-werkstatt-nomo", agordo.name, invalid("#/name"));
    field("fm-werkstatt-leitfarbe", agordo.leitfarbe, invalid("#/leitfarbe"));
    const picker = byId<HTMLInputElement>("fm-werkstatt-leitfarbe-elektilo");
    const hex = hexOf(agordo.leitfarbe);
    if (hex !== undefined && picker.value !== hex) picker.value = hex;
    for (const status of STATUS) {
      const own = agordo.zusatzfarben?.[status];
      const standard = byId(`fm-werkstatt-${status}-standard`);
      if (own === undefined) standard.setAttribute("checked", "");
      else standard.removeAttribute("checked");
      field(`fm-werkstatt-${status}`, own, invalid(`#/zusatzfarben/${status}`));
      const kampo = byId(`fm-werkstatt-${status}`);
      const colour = byId<HTMLInputElement>(`fm-werkstatt-${status}-elektilo`);
      if (own === undefined) {
        kampo.setAttribute("disabled", "");
        colour.disabled = true;
      } else {
        kampo.removeAttribute("disabled");
        colour.disabled = false;
        const ownHex = hexOf(own);
        if (ownHex !== undefined && colour.value !== ownHex) colour.value = ownHex;
      }
    }
    for (const regler of this.#regloj) {
      const value = reglerValue(agordo, regler);
      const id = reglerId(regler.path);
      const input = byId<HTMLInputElement>(id);
      if (Number(input.value) !== value) input.value = String(value);
      const output = document.querySelector<HTMLOutputElement>(`output[for="${id}"]`);
      if (output !== null) output.value = String(value);
    }
    const gewicht = byId("fm-werkstatt-ikono-gewicht");
    const weight = agordo.ikono?.gewicht ?? this.#referenceStyle;
    if (gewicht.getAttribute("value") !== weight) gewicht.setAttribute("value", weight);
    for (const role of FONT_ROLES) {
      const field = byId(`fm-werkstatt-schrift-${role}`);
      const family = agordo.schriften?.[role]?.family ?? "";
      if ((field.getAttribute("value") ?? "") !== family) {
        if (family === "") field.removeAttribute("value");
        else field.setAttribute("value", family);
      }
    }
    this.#syncTargets();
  }

  // --- the palettes ----------------------------------------------------------------------------

  #stepKey(step: DerivedStep): string {
    return `${step.palette}.${step.step}${step.mode === "dark" ? ":dark" : ""}`;
  }

  #buildPalettes(): void {
    const palettes = derivePalettes(
      this.#lastValid,
      this.#calibration,
      this.#floors,
      this.#overrides,
    );
    const container = byId("fm-werkstatt-paletroj");
    const byPalette = new Map<string, DerivedStep[]>();
    for (const step of [...palettes.steps, ...palettes.overrides]) {
      byPalette.set(step.palette, [...(byPalette.get(step.palette) ?? []), step]);
    }
    for (const [palette, steps] of byPalette) {
      const rows = steps
        .map((step) => {
          const key = this.#stepKey(step);
          const id = `fm-werkstatt-stupo-${key.replace(/[.:]/g, "-")}`;
          const token = `color.palette.${step.palette}.${step.step}`;
          const surface = step.mode === "light" ? "neutral.0 (hell)" : "neutral.1000 (dunkel)";
          return `<tr id="${id}" tabindex="-1" data-fm-stupo="${esc(key)}" data-fm-superskribita="false"><th scope="row">${esc(step.step)}${step.mode === "dark" ? " (dunkel)" : ""}</th><td><span class="fm-swatch" data-fm-muestro aria-hidden="true"></span></td><td data-fm-valoro></td><td data-fm-celo-teksto></td><td data-fm-atingita></td><td><label for="${id}-celo" class="fm-werkstatt-kasxita">Kontrastziel ${esc(token)} gegen ${esc(surface)}</label><input type="number" class="fm-werkstatt-celo" id="${id}-celo" data-fm-celo="${esc(key)}" min="1" max="21" step="0.01" placeholder="Ziel"> <fm-butono size="small" emphasis="low" data-fm-rekomenci="${esc(key)}" hidden>Zurücksetzen</fm-butono></td></tr>`;
        })
        .join("");
      container.insertAdjacentHTML(
        "beforeend",
        `<table><caption>${esc(palette)} · Stufe, Wert, Ziel und erreichter Kontrast gegen die Bezugsfläche</caption><thead><tr><th scope="col">Stufe</th><th scope="col">Farbe</th><th scope="col">Wert</th><th scope="col">Ziel</th><th scope="col">Erreicht</th><th scope="col">Ziel überschreiben</th></tr></thead><tbody>${rows}</tbody></table>`,
      );
    }
    container.addEventListener("change", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.dataset.fmCelo === undefined) return;
      this.#setTarget(input.dataset.fmCelo, input.value === "" ? undefined : Number(input.value));
    });
    container.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-fm-rekomenci]",
      );
      if (button?.dataset.fmRekomenci !== undefined)
        this.#setTarget(button.dataset.fmRekomenci, undefined);
    });
  }

  #setTarget(key: string, value: number | undefined): void {
    const [token = "", mode] = key.split(":");
    const field = mode === "dark" ? "dunkel" : "hell";
    const current = this.state.agordo.ziele?.[token];
    if (value === undefined) {
      const rest = { ...current };
      delete rest[field];
      this.applyPatch({ ziele: { [token]: Object.keys(rest).length === 0 ? null : rest } });
      return;
    }
    if (!Number.isFinite(value) || value < 1 || value > 21) return;
    this.applyPatch({ ziele: { [token]: { [field]: value } } });
  }

  #renderPaletteValues(palettes: DerivedPalettes): void {
    if (!this.#built) return;
    // Nachlese 8 ② (M5): a text or a colour is written only where it changed; every write
    // replaced a text node and made the table lay out again.
    const text = (node: Element | null, value: string) => {
      if (node !== null && node.textContent !== value) node.textContent = value;
    };
    for (const step of [...palettes.steps, ...palettes.overrides]) {
      const row = document.querySelector<HTMLElement>(`tr[data-fm-stupo="${this.#stepKey(step)}"]`);
      if (row === null) continue;
      const swatch = row.querySelector<HTMLElement>("[data-fm-muestro]");
      if (swatch !== null && swatch.dataset.fmHex !== step.hex) {
        swatch.style.backgroundColor = step.hex;
        swatch.dataset.fmHex = step.hex;
      }
      text(row.querySelector("[data-fm-valoro]"), step.hex);
      text(
        row.querySelector("[data-fm-celo-teksto]"),
        `${ratio(step.target)}${step.onTarget ? "" : " (verfehlt)"}`,
      );
      text(
        row.querySelector("[data-fm-atingita]"),
        `${ratio(step.achieved)}${step.toneKept ? "" : " (ohne Ton)"}`,
      );
      const overridden = String(step.overridden === true);
      if (row.getAttribute("data-fm-superskribita") !== overridden)
        row.setAttribute("data-fm-superskribita", overridden);
    }
  }

  /** The target inputs show the overrides of the Agordo (ziele), the reset buttons where there is one. */
  #syncTargets(): void {
    for (const input of document.querySelectorAll<HTMLInputElement>("input[data-fm-celo]")) {
      const key = input.dataset.fmCelo ?? "";
      const [token = "", mode] = key.split(":");
      const own = this.state.agordo.ziele?.[token]?.[mode === "dark" ? "dunkel" : "hell"];
      if (document.activeElement !== input) input.value = own === undefined ? "" : String(own);
      const reset = input.parentElement?.querySelector<HTMLElement>("[data-fm-rekomenci]");
      if (reset !== null && reset !== undefined) reset.hidden = own === undefined;
    }
  }

  // --- the report -------------------------------------------------------------------------------

  /** Writes the report; false where a newer one took over before the list was complete. */
  async #renderReport(raporto: Raporto, run: number): Promise<boolean> {
    const { summary } = raporto;
    const apcaCount = raporto.hints.filter((hint) => hint.rule === "contrast-advisory").length;
    const badges: [string, string, number, string][] = [
      ["Paare bestanden", "pairs-passed", summary.pairs.passed, "success"],
      [
        "Paare verletzt",
        "pairs-failed",
        summary.pairs.failed,
        summary.pairs.failed > 0 ? "danger" : "neutral",
      ],
      [
        "feste Regeln verletzt",
        "violations-fixed",
        summary.violations.fixed,
        summary.violations.fixed > 0 ? "danger" : "neutral",
      ],
      [
        "anpassbare Regeln verletzt",
        "violations-adjustable",
        summary.violations.adjustable,
        summary.violations.adjustable > 0 ? "warning" : "neutral",
      ],
      ["durch Jugxo gedeckt", "violations-covered", summary.violations.covered, "info"],
      ["Hinweise (APCA)", "hints-apca", apcaCount, "neutral"],
    ];
    // The counters are written once and then updated in place (G5: a check renders little).
    const counters = byId("fm-werkstatt-zahloj");
    if (counters.childElementCount === 0) {
      counters.innerHTML = badges
        .map(
          ([label, key]) =>
            `<div><dt>${esc(label)}</dt><dd><fm-insigno data-fm-raporto="${key}"></fm-insigno></dd></div>`,
        )
        .join("");
    }
    for (const [, key, value, intent] of badges) {
      const badge = counters.querySelector<HTMLElement>(`[data-fm-raporto="${key}"]`);
      if (badge === null) continue;
      if (badge.getAttribute("intent") !== intent) badge.setAttribute("intent", intent);
      if (badge.textContent !== String(value)) badge.textContent = String(value);
    }
    // The APCA hints (advice) fill their list only while it is open: a check renders the count,
    // not a hundred list items (G5).
    const apca = raporto.hints.filter((hint) => hint.rule === "contrast-advisory");
    this.#renderApca(apca);
    this.#status(
      `Prüfbericht: ${summary.pairs.passed} von ${summary.pairs.measured} Paar-Auswertungen bestanden, ${raporto.violations.length} Verstöße (${summary.violations.fixed} fest, ${summary.violations.adjustable} anpassbar, ${summary.violations.covered} gedeckt), ${apca.length} APCA-Hinweise.`,
    );
    // Nachlese 8 ② (M5): a check replaces only the entries that changed — and writes them in
    // batches of REPORT_BATCH, giving the main thread back in between (D-14): the work grows with
    // the number of violations, the block does not.
    const list = byId("fm-werkstatt-malobservoj");
    const items = raporto.violations.map((violation) => this.#violationMarkup(violation));
    for (let index = 0; index < items.length; index++) {
      if (index > 0 && index % REPORT_BATCH === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (run !== this.#reportRun) return false;
      }
      const item = items[index] ?? "";
      if (this.#violationItems[index] === item && list.children[index] !== undefined) continue;
      const template = document.createElement("template");
      template.innerHTML = item;
      const entry = template.content.firstElementChild;
      if (!(entry instanceof HTMLElement)) continue;
      for (const button of entry.querySelectorAll<HTMLElement>("[data-fm-apliki]")) {
        button.addEventListener("click", () => {
          const at = Number(button.dataset.fmApliki);
          const patch = this.state.raporto?.violations[at]?.apply;
          if (patch !== undefined) this.applyPatch(patch);
        });
      }
      for (const button of entry.querySelectorAll<HTMLElement>("[data-fm-salto]")) {
        button.addEventListener("click", () => this.#jump(button.dataset.fmSalto ?? ""));
      }
      const old = list.children[index];
      if (old === undefined) list.append(entry);
      else old.replaceWith(entry);
      this.#violationItems[index] = item;
    }
    while (list.children.length > items.length) list.lastElementChild?.remove();
    this.#violationItems.length = items.length;
    return true;
  }

  #apcaHints: Raporto["hints"] = [];
  #violationItems: string[] = [];
  /** The report being written (M5): a newer one stops the older between two batches. */
  #reportRun = 0;
  #apcaListed: Raporto["hints"] | undefined;

  #renderApca(apca: Raporto["hints"]): void {
    this.#apcaHints = apca;
    const host = byId("fm-werkstatt-apca");
    let fold = host.querySelector<HTMLElement>("fm-faldilo");
    if (fold === null) {
      host.innerHTML = `<p hidden>Keine APCA-Hinweise.</p><fm-faldilo><span slot="summary"></span><ul></ul></fm-faldilo>`;
      fold = host.querySelector<HTMLElement>("fm-faldilo");
      if (fold === null) return;
      new MutationObserver(() => this.#listApca()).observe(fold, {
        attributes: true,
        attributeFilter: ["open"],
      });
    }
    const empty = host.querySelector<HTMLElement>("p");
    if (empty !== null) empty.hidden = apca.length > 0;
    fold.hidden = apca.length === 0;
    const summary = fold.querySelector('[slot="summary"]');
    if (summary !== null) summary.textContent = `${apca.length} APCA-Hinweise (beratend)`;
    this.#listApca();
  }

  #listApca(): void {
    const fold = byId("fm-werkstatt-apca").querySelector<HTMLElement>("fm-faldilo");
    if (fold === null || !fold.hasAttribute("open") || this.#apcaListed === this.#apcaHints) return;
    this.#apcaListed = this.#apcaHints;
    const list = fold.querySelector("ul");
    if (list !== null) {
      list.innerHTML = this.#apcaHints
        .map(
          (hint) =>
            `<li><code>${esc(hint.subject)}</code> (${hint.combinations}×): ${esc(hint.message)}</li>`,
        )
        .join("");
    }
  }

  #violationMarkup(violation: RaportoViolation): string {
    const index = this.state.raporto?.violations.indexOf(violation) ?? -1;
    const target = this.#jumpTarget(violation);
    const applyAttributes =
      violation.apply === undefined
        ? ""
        : ` data-fm-apliki="${index}"${violation.apply.leitfarbe === undefined ? "" : ` data-fm-apliki-leitfarbe="${esc(violation.apply.leitfarbe)}"`}`;
    return `<li data-fm-regulo="${esc(violation.rule)}"><p><strong>${esc(violation.rule)}</strong> <fm-insigno intent="${violation.fixed ? "danger" : "warning"}" size="small">${violation.fixed ? "fest" : "anpassbar"}</fm-insigno>${violation.jugxo === undefined ? "" : ` <fm-insigno intent="info" size="small">gedeckt durch ${esc(violation.jugxo)}</fm-insigno>`} <fm-butono size="small" emphasis="low" data-fm-salto="${esc(target)}">Zum Ero: <code>${esc(violation.subject)}</code></fm-butono></p><p>${esc(violation.message)}</p><p data-fm-kialo>Ursache: ${esc(violation.cause)}</p><p data-fm-propono>Vorschlag: ${esc(violation.suggestion)}</p>${violation.apply === undefined ? "" : `<fm-butono size="small" emphasis="medium"${applyAttributes}>Vorschlag übernehmen</fm-butono>`}</li>`;
  }

  /** The section that shows the pair of a violation: the first Ero whose Skemo binds one of its tokens. */
  #jumpTarget(violation: RaportoViolation): string {
    const pair = this.#modelo.kontrastParoj.find((entry) => entry.name === violation.subject);
    const tokens =
      pair === undefined
        ? [violation.subject]
        : [
            pair.foreground,
            pair.background,
            ...(pair.aux ? [pair.aux.foreground, pair.aux.background] : []),
          ];
    const step = /^color\.palette\.([a-z]+)\.(\d+)$/.exec(violation.subject);
    if (step !== null && pair === undefined) {
      const row = document.querySelector<HTMLElement>(`tr[data-fm-stupo="${step[1]}.${step[2]}"]`);
      if (row !== null) return row.id;
    }
    for (const [ero, text] of this.#eroTexts) {
      if (tokens.some((token) => text.includes(`"${token}"`))) return `fm-vitrino-${ero}`;
    }
    return "fm-werkstatt-paletroj";
  }

  #jump(id: string): void {
    const element = document.getElementById(id);
    if (element === null) return;
    if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "-1");
    element.scrollIntoView();
    element.focus();
  }

  /** A font of the Agordo the browser does not have is named (G7): the page shows a fallback. */
  #hintFonts(): void {
    if (!this.#built) return;
    const missing = FONT_ROLES.flatMap((role) => {
      const family = this.#lastValid.schriften?.[role]?.family;
      return family === undefined || fontInstalled(family) ? [] : [`${family} (${role})`];
    });
    const hint = byId("fm-werkstatt-schrift-hinweis");
    const text =
      missing.length === 0
        ? ""
        : `Schrift nicht installiert, Darstellung in Ersatzschrift: ${missing.join(", ")}.`;
    if (hint.textContent !== text) hint.textContent = text;
  }

  #status(text: string): void {
    if (!this.#built) return;
    byId("fm-werkstatt-stato").textContent = text;
  }

  // --- export and Jugxo (G6, E5) ---------------------------------------------------------------

  #renderExport(raporto: Raporto): void {
    const download = byId("fm-werkstatt-elsxuti");
    const jugxo = byId("fm-werkstatt-jugxo-malfermi");
    const reason = byId("fm-werkstatt-elsxuti-kialo");
    const fixedRules = [...new Set(raporto.violations.filter((v) => v.fixed).map((v) => v.rule))];
    const uncovered = [
      ...new Set(
        raporto.violations.filter((v) => !v.fixed && v.jugxo === undefined).map((v) => v.rule),
      ),
    ];
    // Nachlese 8 ② (M5): written only where it changes.
    const lock = (element: HTMLElement, locked: boolean) => {
      if (locked === element.hasAttribute("disabled")) return;
      if (locked) element.setAttribute("disabled", "");
      else element.removeAttribute("disabled");
    };
    const say = (text: string) => {
      if (reason.textContent !== text) reason.textContent = text;
    };
    if (fixedRules.length > 0) {
      lock(download, true);
      lock(jugxo, true);
      say(
        `Der Download ist gesperrt: feste Regel verletzt (${fixedRules.join(", ")}). Ein Jugxo öffnet keine feste Regel (G6); ändere die Agordo, bis sie hält.`,
      );
      return;
    }
    if (uncovered.length > 0) {
      lock(download, true);
      lock(jugxo, false);
      say(
        `Der Download ist gesperrt, bis ein Jugxo die anpassbaren Regeln deckt (${uncovered.join(", ")}): Begründung, Datum und Name. Der Jugxo steht in der Agordo.`,
      );
      return;
    }
    lock(download, !raporto.summary.exportable);
    lock(jugxo, true);
    say(
      raporto.summary.exportable
        ? "Der Download ist frei: keine Verstöße, oder jeder durch einen Jugxo gedeckt. Das Paket entsteht über `fm agordilo derive`."
        : "Der Download ist gesperrt: die Agordo selbst hat Fehler (siehe Prüfbericht).",
    );
  }

  #recordJugxoj(kialo: string, date: string, name: string): void {
    const raporto = this.state.raporto;
    if (raporto === undefined || kialo === "" || date === "" || name === "") return;
    const rules = [
      ...new Set(
        raporto.violations.filter((v) => !v.fixed && v.jugxo === undefined).map((v) => v.rule),
      ),
    ];
    const kept = (this.state.agordo.jugxoj ?? []).filter((jugxo) => !rules.includes(jugxo.regulo));
    const jugxoj = [...kept, ...rules.map((regulo) => ({ regulo, kialo, date, name }))];
    this.setAgordo({ ...this.state.agordo, jugxoj }, { check: "now", record: "jugxo" });
  }

  #download(): void {
    if (this.state.raporto?.summary.exportable !== true) return;
    const text = `${JSON.stringify(this.#lastValid, null, 2)}\n`;
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "agordo.json";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // --- the comparison (W-11) --------------------------------------------------------------------

  #buildSides(): void {
    const draft = document.querySelector<HTMLElement>('[data-fm-side="draft"]');
    const reference = document.querySelector<HTMLElement>('[data-fm-side="reference"]');
    if (draft === null || reference === null) return;
    this.#sides = { draft, reference };
    // The static stylesheet of the Vitrino, scoped to a side: every rule of the root again, at the
    // container that carries the attributes — so each side shows its Aspekto in the modes of the root.
    const css = document.getElementById("fm-vitrino-css")?.textContent ?? "";
    const style = document.createElement("style");
    style.id = "fm-werkstatt-flanko-css";
    style.textContent = css.replaceAll(":where(:root", ":where([data-fm-side]");
    document.head.append(style);
    const island = document.getElementById("fm-vitrino")?.textContent ?? "{}";
    const eroj = Object.keys((JSON.parse(island) as { eroj?: Record<string, string> }).eroj ?? {});
    const template = document.createElement("template");
    for (const ero of eroj) {
      const section = document.getElementById(`fm-vitrino-${ero}`);
      if (section === null) continue;
      template.innerHTML = section.innerHTML;
      for (const element of template.content.querySelectorAll("[id], [data-fm-opens]")) {
        element.removeAttribute("id");
        element.removeAttribute("data-fm-opens");
      }
      for (const heading of template.content.querySelectorAll("h2")) {
        const h5 = document.createElement("h5");
        h5.textContent = heading.textContent;
        heading.replaceWith(h5);
      }
      // Spec 026 ②: the sides compare looks, not names — the names stand as plain text, as before
      // the Lingvo-Schalter (a span in a narrow side's row head let axe read the overflowing
      // button of the other side as its ground).
      for (const name of template.content.querySelectorAll("[data-fm-nomo]")) {
        name.replaceWith(document.createTextNode(name.textContent ?? ""));
      }
      draft.append(template.content.cloneNode(true));
      reference.append(template.content.cloneNode(true));
    }
  }

  /** Both sides carry the Dimensioj of the root; the draft the reference's structure, the other the chosen Aspekto. */
  #mirrorSides(): void {
    if (this.#sides === undefined) return;
    const chosen = byId("fm-werkstatt-referenco").getAttribute("value") ?? this.#datumoj.reference;
    for (const [side, aspekto] of [
      [this.#sides.draft, this.#datumoj.reference],
      [this.#sides.reference, chosen],
    ] as const) {
      side.setAttribute("data-fm-aspekto", aspekto);
      for (const attribute of this.#dimensioAttributes()) {
        if (attribute === "data-fm-aspekto") continue;
        const value = this.#root.getAttribute(attribute);
        if (value === null) side.removeAttribute(attribute);
        else side.setAttribute(attribute, value);
      }
    }
    byId("fm-werkstatt-flanko-entwurf").textContent = `Entwurf ${this.#lastValid.name}`;
    byId("fm-werkstatt-flanko-referenco").textContent = chosen;
    if (this.state.palettes !== undefined)
      this.#setProperties(this.#sides.draft, this.state.palettes);
    for (const property of this.#gestaltProps) {
      this.#sides.draft.style.setProperty(property, this.#root.style.getPropertyValue(property));
    }
  }
}

/**
 * The worker side (G5): the same module, started from its own text as a Blob. It holds the
 * structure, derives the palettes or runs the checks of the Agordilo and answers with plain data.
 */
function workerMain(scope: {
  addEventListener(type: "message", listener: (event: MessageEvent<WorkerRequest>) => void): void;
  postMessage(message: WorkerAnswer): void;
}): void {
  let basis:
    | {
        structure: Structure;
        calibration: Calibration;
        floors: ReturnType<typeof floorsOf>;
        overrides: ReturnType<typeof modeOverrides>;
      }
    | undefined;
  scope.addEventListener("message", (event) => {
    const request = event.data;
    if (request.kind === "init") {
      provideModeloSchemas(request.datumoj.schemas);
      const structure = request.datumoj.structure;
      basis = {
        structure,
        calibration: request.datumoj.calibration,
        floors: floorsOf(structureModelo(structure)),
        overrides: modeOverrides(structure),
      };
      return;
    }
    if (basis === undefined) {
      scope.postMessage({ kind: "error", id: request.id, message: "not initialised" });
      return;
    }
    const started = performance.now();
    try {
      if (request.kind === "palettes") {
        const palettes = derivePalettes(
          request.agordo,
          basis.calibration,
          basis.floors,
          basis.overrides,
        );
        scope.postMessage({
          kind: "palettes",
          id: request.id,
          palettes,
          ms: performance.now() - started,
        });
      } else {
        const { raporto } = deriveAspekto(request.agordo, basis.structure, basis.calibration);
        scope.postMessage({
          kind: "check",
          id: request.id,
          raporto,
          ms: performance.now() - started,
        });
      }
    } catch (error) {
      scope.postMessage({
        kind: "error",
        id: request.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

if (typeof document === "undefined") {
  workerMain(globalThis as unknown as Parameters<typeof workerMain>[0]);
} else {
  const island = document.getElementById("fm-werkstatt");
  const api = (globalThis as unknown as { fmVitrino?: VitrinoApi }).fmVitrino;
  if (island?.textContent && api !== undefined) {
    const werkstatt = new Werkstatt(JSON.parse(island.textContent) as WerkstattDatumoj, api);
    (globalThis as unknown as { fmWerkstatt: unknown }).fmWerkstatt = {
      state: werkstatt.state,
      setAgordo: (agordo: Agordo) => werkstatt.setAgordo(agordo, { record: "api" }),
      applyPatch: (patch: AgordoPatch) => werkstatt.applyPatch(patch),
      runCheck: () => werkstatt.runCheck(),
      measure: (count: number) => werkstatt.measure(count),
      undo: () => werkstatt.undo(),
      redo: () => werkstatt.redo(),
    };
    werkstatt.start();
  }
}
