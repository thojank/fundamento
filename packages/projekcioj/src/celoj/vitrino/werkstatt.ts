/// <reference lib="dom" />
// The Werkstatt of the Vitrino (Spec 016 ②, G7, plan ② D-04–D-12): the browser side of the
// Agordilo. From the data island `fm-werkstatt` (the structure core + komuna with its fingerprint,
// the calibration, the two schemas) it derives the six palettes of an Agordo live — on every
// change of the panel — and sets them as custom properties of the Vitrino, so every Ero follows;
// the checks (the same as the CI's, in the same library) run debounced and write the Raporto the
// CLI writes. The Agordo travels compressed in the fragment (`#agordo=…`) and leaves as a download;
// the Vitrino writes no file (E7). This module is bundled by Vite (werkstatt-bundle.ts) and
// embedded in the Vitrino; it holds no colour and no number of the brand of its own.

import {
  type Agordo,
  type AgordoPatch,
  type Calibration,
  type DerivedPalettes,
  type DerivedStep,
  deriveAspekto,
  derivePalettes,
  floorsOf,
  modeOverrides,
  parseAgordoColor,
  type Raporto,
  type RaportoViolation,
  readAgordo,
  type Structure,
  structureModelo,
} from "@fundamento/agordilo/browser";
import {
  CORE_SET_NAME,
  type Modelo,
  oklchColor,
  provideModeloSchemas,
  readDtcgColor,
  srgbComponentsOf,
} from "@fundamento/modelo";
import { cssVariable } from "../css/css.js";
import type { WerkstattDatumoj } from "./html.js";

/** The fragment and the check wait this long after the last change (plan ② D-07, M3). */
const CHECK_DELAY_MS = 400;
const FRAGMENT_DELAY_MS = 300;
const STATUS = ["success", "warning", "danger", "info"] as const;
const SLIDERS = [
  { key: "toenung", label: "Neutral-Tönung", min: 0, max: 1, step: 0.01, fallback: 0 },
  { key: "helligkeit", label: "Helligkeit", min: -1, max: 1, step: 0.01, fallback: 0 },
  { key: "kontrast", label: "Kontrast", min: -1, max: 1, step: 0.01, fallback: 0 },
  { key: "saettigung", label: "Sättigung", min: 0, max: 2, step: 0.01, fallback: 1 },
] as const;
type SliderKey = (typeof SLIDERS)[number]["key"];

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
  /** The last derivation and check, in milliseconds. */
  timings: { derive: number; check: number };
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

  constructor(datumoj: WerkstattDatumoj, vitrino: VitrinoApi) {
    this.#datumoj = datumoj;
    this.#vitrino = vitrino;
    provideModeloSchemas(datumoj.schemas);
    this.#structure = datumoj.structure;
    this.#calibration = datumoj.calibration;
    this.#modelo = structureModelo(this.#structure);
    this.#floors = floorsOf(this.#modelo);
    this.#overrides = modeOverrides(this.#structure);
    this.#eroTexts = new Map(
      this.#modelo.eroj.map((entry) => [entry.ero.name, JSON.stringify(entry.skemo)]),
    );
    const agordo: Agordo = {
      name: "entwurf",
      leitfarbe: referenceLeadColour(this.#structure, datumoj.reference),
    };
    this.#lastValid = agordo;
    this.state = { agordo, checked: 0, timings: { derive: 0, check: 0 } };
  }

  /** Starts: reads the fragment, builds the workshop when the mode is on, follows the root. */
  start(): void {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "data-fm-modus") this.#onModus();
        else if (this.#active()) {
          this.#applyDraft();
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
    });
    const initial = this.#vitrino.getFragmentPart("agordo");
    if (initial !== undefined) void this.#loadFragment(initial);
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

  /** Sets the Agordo: the panel follows, the palettes are derived, the check and the fragment wait. */
  setAgordo(agordo: Agordo, options: { write?: boolean; check?: "now" | "later" } = {}): void {
    this.state.agordo = agordo;
    const read = readAgordo(agordo, "agordo.json");
    if (read.agordo !== undefined) this.#lastValid = read.agordo;
    this.#syncPanel(read.issues.map((issue) => issue.path));
    if (!this.#active()) return;
    this.#applyDraft();
    if (options.check === "now") this.runCheck();
    else this.#scheduleCheck();
    if (options.write !== false) this.#scheduleFragment();
  }

  applyPatch(patch: AgordoPatch): void {
    this.setAgordo(patched(this.state.agordo, patch));
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

  /** Derives the palettes of the last valid Agordo and sets them on the root and the draft side. */
  #applyDraft(): DerivedPalettes {
    const started = performance.now();
    const palettes = derivePalettes(
      this.#lastValid,
      this.#calibration,
      this.#floors,
      this.#overrides,
    );
    this.state.palettes = palettes;
    this.#setProperties(this.#root, palettes);
    if (this.#sides !== undefined) this.#setProperties(this.#sides.draft, palettes);
    this.#renderPaletteValues(palettes);
    this.state.timings.derive = performance.now() - started;
    return palettes;
  }

  #setProperties(element: HTMLElement, palettes: DerivedPalettes): void {
    const mode = this.#root.getAttribute("data-fm-color-scheme") === "dark" ? "dark" : "light";
    for (const step of palettes.steps) {
      element.style.setProperty(
        cssVariable(`color.palette.${step.palette}.${step.step}`),
        step.hex,
      );
    }
    for (const step of palettes.overrides) {
      if (step.mode === mode) {
        element.style.setProperty(
          cssVariable(`color.palette.${step.palette}.${step.step}`),
          step.hex,
        );
      }
    }
    for (const [role, font] of Object.entries(this.#lastValid.schriften ?? {})) {
      element.style.setProperty(cssVariable(`font.family.${role}`), JSON.stringify(font.family));
    }
  }

  #clearDraft(): void {
    const palettes = this.state.palettes;
    if (palettes === undefined) return;
    for (const step of [...palettes.steps, ...palettes.overrides]) {
      this.#root.style.removeProperty(cssVariable(`color.palette.${step.palette}.${step.step}`));
    }
    for (const role of Object.keys(this.#lastValid.schriften ?? {})) {
      this.#root.style.removeProperty(cssVariable(`font.family.${role}`));
    }
  }

  #scheduleCheck(): void {
    clearTimeout(this.#checkTimer);
    this.#checkTimer = setTimeout(() => this.runCheck(), CHECK_DELAY_MS);
  }

  /** Runs every check of the Agordilo on the draft and renders the Raporto (G5, G6). */
  runCheck(): Raporto {
    clearTimeout(this.#checkTimer);
    const started = performance.now();
    const derivation = deriveAspekto(this.#lastValid, this.#structure, this.#calibration);
    this.state.timings.check = performance.now() - started;
    this.state.raporto = derivation.raporto;
    this.state.checked += 1;
    this.#renderReport(derivation.raporto);
    this.#renderExport(derivation.raporto);
    document.dispatchEvent(new CustomEvent("fm-werkstatt-raporto", { detail: derivation.raporto }));
    return derivation.raporto;
  }

  /**
   * M3: `count` slider changes, each derived and checked at once, the times in milliseconds. The
   * Agordo is restored afterwards.
   */
  measure(count: number): { derive: number[]; check: number[] } {
    const original = this.state.agordo;
    const derive: number[] = [];
    const check: number[] = [];
    for (let index = 0; index < count; index++) {
      const helligkeit = Math.round((-1 + (2 * (index + 1)) / (count + 1)) * 100) / 100;
      this.state.agordo = patched(original, { regler: { helligkeit } });
      this.#lastValid = this.state.agordo;
      this.#applyDraft();
      derive.push(this.state.timings.derive);
      this.runCheck();
      check.push(this.state.timings.check);
    }
    this.setAgordo(original, { write: false, check: "now" });
    return { derive, check };
  }

  // --- the panel --------------------------------------------------------------------------------

  #build(): void {
    if (this.#built) return;
    this.#built = true;
    const host = byId("fm-werkstatt-ujo");
    host.innerHTML = `<div class="fm-werkstatt-kolumnoj">
<form id="fm-werkstatt-panelo" class="fm-werkstatt-panelo" aria-label="Panel der Werkstatt">
<h3>Agordo</h3>
<fm-kampo id="fm-werkstatt-nomo" required>Name<span slot="help">Kleinbuchstaben, Ziffern, Bindestrich</span><span slot="error" hidden>Der Name folgt der Grammatik nicht.</span></fm-kampo>
<div class="fm-werkstatt-koloro"><div><label for="fm-werkstatt-leitfarbe-elektilo" class="fm-werkstatt-kasxita">Leitfarbe wählen</label><input type="color" id="fm-werkstatt-leitfarbe-elektilo"></div><fm-kampo id="fm-werkstatt-leitfarbe" required>Leitfarbe<span slot="help">Hex (#rrggbb) oder OKLCH (L C H)</span><span slot="error" hidden>Keine Farbe: Hex (#rrggbb) oder OKLCH (L C H).</span></fm-kampo></div>
<fieldset><legend>Zusatzfarben</legend>${STATUS.map(
      (status) =>
        `<div class="fm-werkstatt-koloro"><div><fm-markobutono id="fm-werkstatt-${status}-standard" checked>Standard</fm-markobutono><label for="fm-werkstatt-${status}-elektilo" class="fm-werkstatt-kasxita">${status} wählen</label><input type="color" id="fm-werkstatt-${status}-elektilo" disabled></div><fm-kampo id="fm-werkstatt-${status}" disabled>${status}<span slot="help">eigener Farbton, Hex oder OKLCH</span><span slot="error" hidden>Keine Farbe.</span></fm-kampo></div>`,
    ).join("")}</fieldset>
${SLIDERS.map(
  (slider) =>
    `<div class="fm-werkstatt-regilo"><label for="fm-werkstatt-${slider.key}">${slider.label}</label><output for="fm-werkstatt-${slider.key}">${slider.fallback}</output><input type="range" id="fm-werkstatt-${slider.key}" min="${slider.min}" max="${slider.max}" step="${slider.step}" value="${slider.fallback}"></div>`,
).join("")}
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
  }

  #wirePanel(): void {
    const nomo = byId("fm-werkstatt-nomo");
    nomo.addEventListener("input", () => {
      this.setAgordo({ ...this.state.agordo, name: nomo.getAttribute("value") ?? "" });
    });
    const leitfarbe = byId("fm-werkstatt-leitfarbe");
    const picker = byId<HTMLInputElement>("fm-werkstatt-leitfarbe-elektilo");
    leitfarbe.addEventListener("input", () => {
      this.setAgordo({ ...this.state.agordo, leitfarbe: leitfarbe.getAttribute("value") ?? "" });
    });
    picker.addEventListener("input", () => {
      this.setAgordo({ ...this.state.agordo, leitfarbe: picker.value });
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
        this.setAgordo(next);
      };
      standard.addEventListener("input", () => {
        set(standard.hasAttribute("checked") ? undefined : colour.value);
      });
      field.addEventListener("input", () => set(field.getAttribute("value") ?? ""));
      colour.addEventListener("input", () => set(colour.value));
    }
    for (const slider of SLIDERS) {
      const input = byId<HTMLInputElement>(`fm-werkstatt-${slider.key}`);
      input.addEventListener("input", () => {
        const value = Number(input.value);
        this.setAgordo(
          slider.key === "toenung"
            ? patched(this.state.agordo, { neutral: { toenung: value } })
            : patched(this.state.agordo, { regler: { [slider.key]: value } }),
        );
      });
    }
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
    for (const slider of SLIDERS) {
      const value =
        slider.key === "toenung"
          ? (agordo.neutral?.toenung ?? slider.fallback)
          : (agordo.regler?.[slider.key as Exclude<SliderKey, "toenung">] ?? slider.fallback);
      const input = byId<HTMLInputElement>(`fm-werkstatt-${slider.key}`);
      if (Number(input.value) !== value) input.value = String(value);
      const output = document.querySelector<HTMLOutputElement>(
        `output[for="fm-werkstatt-${slider.key}"]`,
      );
      if (output !== null) output.value = String(value);
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
    for (const step of [...palettes.steps, ...palettes.overrides]) {
      const row = document.querySelector<HTMLElement>(`tr[data-fm-stupo="${this.#stepKey(step)}"]`);
      if (row === null) continue;
      const swatch = row.querySelector<HTMLElement>("[data-fm-muestro]");
      if (swatch !== null) swatch.style.backgroundColor = step.hex;
      const value = row.querySelector("[data-fm-valoro]");
      if (value !== null) value.textContent = step.hex;
      const target = row.querySelector("[data-fm-celo-teksto]");
      if (target !== null)
        target.textContent = `${ratio(step.target)}${step.onTarget ? "" : " (verfehlt)"}`;
      const achieved = row.querySelector("[data-fm-atingita]");
      if (achieved !== null)
        achieved.textContent = `${ratio(step.achieved)}${step.toneKept ? "" : " (ohne Ton)"}`;
      row.setAttribute("data-fm-superskribita", String(step.overridden === true));
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

  #renderReport(raporto: Raporto): void {
    const { summary } = raporto;
    const badge = (label: string, value: number, intent: string, key: string) =>
      `<div><dt>${esc(label)}</dt><dd><fm-insigno intent="${intent}" data-fm-raporto="${key}">${value}</fm-insigno></dd></div>`;
    byId("fm-werkstatt-zahloj").innerHTML = [
      badge("Paare bestanden", summary.pairs.passed, "success", "pairs-passed"),
      badge(
        "Paare verletzt",
        summary.pairs.failed,
        summary.pairs.failed > 0 ? "danger" : "neutral",
        "pairs-failed",
      ),
      badge(
        "feste Regeln verletzt",
        summary.violations.fixed,
        summary.violations.fixed > 0 ? "danger" : "neutral",
        "violations-fixed",
      ),
      badge(
        "anpassbare Regeln verletzt",
        summary.violations.adjustable,
        summary.violations.adjustable > 0 ? "warning" : "neutral",
        "violations-adjustable",
      ),
      badge("durch Jugxo gedeckt", summary.violations.covered, "info", "violations-covered"),
      badge(
        "Hinweise (APCA)",
        raporto.hints.filter((hint) => hint.rule === "contrast-advisory").length,
        "neutral",
        "hints-apca",
      ),
    ].join("");
    byId("fm-werkstatt-malobservoj").innerHTML = raporto.violations
      .map((violation) => this.#violationMarkup(violation))
      .join("");
    const apca = raporto.hints.filter((hint) => hint.rule === "contrast-advisory");
    byId("fm-werkstatt-apca").innerHTML =
      apca.length === 0
        ? "<p>Keine APCA-Hinweise.</p>"
        : `<fm-faldilo><span slot="summary">${apca.length} APCA-Hinweise (beratend)</span><ul>${apca
            .map(
              (hint) =>
                `<li><code>${esc(hint.subject)}</code> (${hint.combinations}×): ${esc(hint.message)}</li>`,
            )
            .join("")}</ul></fm-faldilo>`;
    this.#status(
      `Prüfbericht: ${summary.pairs.passed} von ${summary.pairs.measured} Paar-Auswertungen bestanden, ${raporto.violations.length} Verstöße (${summary.violations.fixed} fest, ${summary.violations.adjustable} anpassbar, ${summary.violations.covered} gedeckt), ${apca.length} APCA-Hinweise.`,
    );
    for (const button of byId("fm-werkstatt-malobservoj").querySelectorAll<HTMLElement>(
      "[data-fm-apliki]",
    )) {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.fmApliki);
        const patch = raporto.violations[index]?.apply;
        if (patch !== undefined) this.applyPatch(patch);
      });
    }
    for (const button of byId("fm-werkstatt-malobservoj").querySelectorAll<HTMLElement>(
      "[data-fm-salto]",
    )) {
      button.addEventListener("click", () => this.#jump(button.dataset.fmSalto ?? ""));
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
    const lock = (element: HTMLElement, locked: boolean) => {
      if (locked) element.setAttribute("disabled", "");
      else element.removeAttribute("disabled");
    };
    if (fixedRules.length > 0) {
      lock(download, true);
      lock(jugxo, true);
      reason.textContent = `Der Download ist gesperrt: feste Regel verletzt (${fixedRules.join(", ")}). Ein Jugxo öffnet keine feste Regel (G6); ändere die Agordo, bis sie hält.`;
      return;
    }
    if (uncovered.length > 0) {
      lock(download, true);
      lock(jugxo, false);
      reason.textContent = `Der Download ist gesperrt, bis ein Jugxo die anpassbaren Regeln deckt (${uncovered.join(", ")}): Begründung, Datum und Name. Der Jugxo steht in der Agordo.`;
      return;
    }
    lock(download, !raporto.summary.exportable);
    lock(jugxo, true);
    reason.textContent = raporto.summary.exportable
      ? "Der Download ist frei: keine Verstöße, oder jeder durch einen Jugxo gedeckt. Das Paket entsteht über `fm agordilo derive`."
      : "Der Download ist gesperrt: die Agordo selbst hat Fehler (siehe Prüfbericht).";
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
    this.setAgordo({ ...this.state.agordo, jugxoj }, { check: "now" });
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
  }
}

const island = document.getElementById("fm-werkstatt");
const api = (globalThis as unknown as { fmVitrino?: VitrinoApi }).fmVitrino;
if (island?.textContent && api !== undefined) {
  const werkstatt = new Werkstatt(JSON.parse(island.textContent) as WerkstattDatumoj, api);
  (globalThis as unknown as { fmWerkstatt: unknown }).fmWerkstatt = {
    state: werkstatt.state,
    setAgordo: (agordo: Agordo) => werkstatt.setAgordo(agordo),
    applyPatch: (patch: AgordoPatch) => werkstatt.applyPatch(patch),
    runCheck: () => werkstatt.runCheck(),
    measure: (count: number) => werkstatt.measure(count),
  };
  werkstatt.start();
}
