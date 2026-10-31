// Stage 2 of the Agordilo (Spec 019, G2–G4): form, space, type and icon weight. Each slider is a
// function on the structure of the Vortaro — the core set and the sets of its Dimensioj — never on
// komuna's values at run time (Art. IV), rounded to the grid of the system: spacing on 4 px (2 px
// where the structure itself is finer), heights on 4 px, font sizes, radii and borders on whole px,
// weights on whole cuts. Every slider on its standard changes no token, so an Agordo of stage 1
// derives the bytes of stage 1 (G3). Where a slider brings a danger no Regulo names, it gives a
// hint, never a new rule (G4, E2). Pure.

import { CORE_SET_NAME, type ModeloFiles, typeScaleConsistency } from "@fundamento/modelo";
import type { Agordo } from "./agordo.js";
import type { RaportoHint } from "./raporto.js";
import { isRecord } from "./record.js";

/** The Phosphor weights (Spec 019, G2 ikono.gewicht); regular is the reference's own (komuna). */
export const IKONO_GEWICHTE = ["thin", "light", "regular", "bold", "fill", "duotone"] as const;
export type IkonoGewicht = (typeof IKONO_GEWICHTE)[number];

export type GestaltPath =
  | "form.radius"
  | "form.rahmen"
  | "form.schatten"
  | "raum.abstand"
  | "raum.hoehe"
  | "schrift.groesse"
  | "schrift.skala"
  | "schrift.gewicht";

/** A slider of stage 2: its range and its standard (G2). The standard is the structure. */
export interface GestaltSlider {
  path: GestaltPath;
  min: number;
  max: number;
  standard: number;
  /** The step of the Werkstatt's range input. */
  step: number;
}

/** Body text below this size gets a hint (G4: no Regulo sets a minimum; Regulo candidate K-1). */
export const BODY_TEXT_MIN_PX = 14;

/** The grid of spacing and heights (G3); a structure value off this grid keeps the finer one. */
const GRID = 4;
const FINE_GRID = 2;

/**
 * The form of the controls (Spec 035, V-3): a choice beside the radius slider, its stop past the
 * end. „pille“ points radius.role.control at radius.full – the alias the Schnellstart sets for
 * „ganz rund“ (Spec 024 K-5) – so controls are fully rounded while cards and surfaces
 * (radius.role.surface) keep their bounded radius. Named in a diff like a slider.
 */
export const BEDIENFORM_PATH = "form.bedienelemente";
export const BEDIENFORM_LABEL = "Bedienelemente";
export const BEDIENFORMEN = ["radius", "pille"] as const;
export type Bedienform = (typeof BEDIENFORMEN)[number];
const PILLE_TOKEN = "radius.role.control";
const PILLE_ALIAS = "radius.full";

/** Whether the controls of an Agordo are pills. */
export function bedienformOf(agordo: Agordo): Bedienform {
  return agordo.festgelegt?.[PILLE_TOKEN]?.alias === PILLE_ALIAS ? "pille" : "radius";
}

/** The Agordo with the controls as pills or back on the radius; an empty festgelegt goes. */
export function withBedienform(agordo: Agordo, form: Bedienform): Agordo {
  const festgelegt = { ...(agordo.festgelegt ?? {}) };
  if (form === "pille") festgelegt[PILLE_TOKEN] = { alias: PILLE_ALIAS };
  else if (bedienformOf(agordo) === "pille") delete festgelegt[PILLE_TOKEN];
  else return agordo;
  const { festgelegt: _before, ...rest } = agordo;
  return Object.keys(festgelegt).length === 0 ? (rest as Agordo) : { ...rest, festgelegt };
}

/** The radii form.radius multiplies (G2); radius.none and radius.full stay. */
const RADII = ["radius.small", "radius.medium", "radius.large", "radius.xlarge"];
const SHADOW_COLORS = ["color.shadow.key", "color.shadow.ambient"];
const DARK_SET = "color-scheme/dark";
const DIMENSION = /^\{([^}]+)\}$/;

/** token name → `$value`, for one set document. */
type Flat = Map<string, unknown>;

interface Dimension {
  value: number;
  unit: string;
}

/** What the sliders of stage 2 are functions on: the structure, read once. */
export interface GestaltBasis {
  core: Flat;
  /** The DTCG type of every core token (inherited from its groups): how a Projekcio writes it. */
  types: Map<string, string>;
  /** The sets of the Vortaro's Dimensioj (no Aspekto), by set name. */
  overlays: Map<string, Flat>;
  /** The median ratio of neighbouring steps of font.size.scale, three decimals: the standard of skala. */
  skala: number;
  /** The sojlo of the Regulo type-scale (0.1): the rounding to whole px keeps the scale inside it. */
  typeScaleMax: number;
  /** font.size.scale.* sorted by size, with the position of the step the body text uses. */
  fontScale: { name: string; size: number; unit: string }[];
  bodyIndex: number;
  /** The steps of size.scale.* that size.control.* points at in core or in any Dimensio. */
  controlSteps: string[];
  /** size.target.min, resolved in core (the floor of touch-target-min). */
  target: number;
  /** border.width.focus, resolved in core (the floor of protected-minimum). */
  focusWidth: number;
  /** color.palette.shade.* with their opacity, ascending. */
  shades: { name: string; alpha: number }[];
}

/** Round half away from zero, without a negative zero. */
export function roundHalf(value: number): number {
  const rounded = Math.sign(value) * Math.round(Math.abs(value));
  return rounded === 0 ? 0 : rounded;
}

function flatten(
  value: unknown,
  path: string[] = [],
  out: Flat = new Map(),
  types?: Map<string, string>,
  inherited?: string,
): Flat {
  if (!isRecord(value)) return out;
  const type = typeof value.$type === "string" ? value.$type : inherited;
  if ("$value" in value) {
    out.set(path.join("."), value.$value);
    if (types !== undefined && type !== undefined) types.set(path.join("."), type);
    return out;
  }
  for (const [key, child] of Object.entries(value)) {
    if (!key.startsWith("$")) flatten(child, [...path, key], out, types, type);
  }
  return out;
}

function isDimension(value: unknown): value is Dimension {
  return isRecord(value) && typeof value.value === "number" && typeof value.unit === "string";
}

const aliasOf = (value: unknown): string | undefined =>
  typeof value === "string" ? DIMENSION.exec(value)?.[1] : undefined;

/** Resolves a token through layers (the last layer wins), following aliases. */
function resolveIn(name: string, layers: readonly Flat[], depth = 0): unknown {
  if (depth > 32) throw new Error(`Alias cycle at ${name}`);
  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const layer = layers[index];
    if (layer?.has(name)) {
      const value = layer.get(name);
      const alias = aliasOf(value);
      return alias === undefined ? value : resolveIn(alias, layers, depth + 1);
    }
  }
  return undefined;
}

function pxOf(value: unknown): number {
  if (typeof value === "number") return value;
  return isDimension(value) ? value.value : Number.NaN;
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] ?? 0)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

/** Reads the structure once: the core set and the sets of the Dimensioj of the Vortaro. */
export function gestaltBasis(files: ModeloFiles): GestaltBasis {
  const types = new Map<string, string>();
  const core = flatten(
    files.sets.find((set) => set.name === CORE_SET_NAME)?.value,
    [],
    new Map(),
    types,
  );
  const overlays = new Map<string, Flat>();
  for (const set of files.sets) {
    if (set.name === CORE_SET_NAME || set.package !== undefined) continue;
    overlays.set(set.name, flatten(set.value));
  }

  const fontScale = [...core]
    .filter(([name, value]) => /^font\.size\.scale\.\d+$/.test(name) && isDimension(value))
    .map(([name, value]) => ({
      name,
      size: (value as Dimension).value,
      unit: (value as Dimension).unit,
    }))
    .sort((a, b) => a.size - b.size);
  const ratios = fontScale.slice(1).map((step, index) => step.size / (fontScale[index]?.size ?? 1));
  const skala = Math.round(median(ratios) * 1000) / 1000;
  const bodyStep = aliasOf(core.get("font.size.body.1"));
  const bodyIndex = Math.max(
    0,
    fontScale.findIndex((step) => step.name === bodyStep),
  );

  const controlSteps = new Set<string>();
  for (const layer of [core, ...overlays.values()]) {
    for (const [name, value] of layer) {
      if (!name.startsWith("size.control.")) continue;
      const alias = aliasOf(value);
      if (alias?.startsWith("size.scale.")) controlSteps.add(alias);
    }
  }

  const shades = [...core]
    .filter(([name]) => name.startsWith("color.palette.shade."))
    .map(([name, value]) => ({
      name,
      alpha: isRecord(value) && typeof value.alpha === "number" ? value.alpha : 1,
    }))
    .sort((a, b) => a.alpha - b.alpha || (a.name < b.name ? -1 : 1));

  const reguloj = files.data["reguloj.json"]?.value;
  const typeScale = (
    isRecord(reguloj) && Array.isArray(reguloj.reguloj) ? reguloj.reguloj : []
  ).find((regulo: unknown) => isRecord(regulo) && regulo.name === "type-scale");
  const sojlo = isRecord(typeScale) && isRecord(typeScale.sojlo) ? typeScale.sojlo.max : undefined;

  return {
    core,
    types,
    overlays,
    skala,
    typeScaleMax: typeof sojlo === "number" ? sojlo : 0.1,
    fontScale,
    bodyIndex,
    controlSteps: [...controlSteps].sort(),
    target: pxOf(resolveIn("size.target.min", [core])),
    focusWidth: pxOf(resolveIn("border.width.focus", [core])),
    shades,
  };
}

/** The sliders of stage 2 with their ranges and standards (G2); skala's standard is measured. */
export function gestaltSliders(basis: GestaltBasis): GestaltSlider[] {
  return [
    { path: "form.radius", min: 0, max: 2, standard: 1, step: 0.05 },
    { path: "form.rahmen", min: 0.5, max: 2, standard: 1, step: 0.05 },
    { path: "form.schatten", min: 0, max: 2, standard: 1, step: 0.05 },
    { path: "raum.abstand", min: 0.75, max: 1.5, standard: 1, step: 0.05 },
    { path: "raum.hoehe", min: 0.85, max: 1.25, standard: 1, step: 0.05 },
    { path: "schrift.groesse", min: -1, max: 1, standard: 0, step: 0.05 },
    // Nachtrag 20.10. (Maintainer, ① O-5): the upper bound is 1.25 (at 1.5 display.1 was 417 px).
    { path: "schrift.skala", min: 1.125, max: 1.25, standard: basis.skala, step: 0.001 },
    { path: "schrift.gewicht", min: -1, max: 1, standard: 0, step: 0.05 },
  ];
}

/** The value of a slider in an Agordo; its standard where the Agordo does not name it. */
export function gestaltValue(agordo: Agordo, slider: GestaltSlider): number {
  const [group, key] = slider.path.split(".") as [string, string];
  const value = (agordo as unknown as Record<string, Record<string, unknown> | undefined>)[group]?.[
    key
  ];
  return typeof value === "number" ? value : slider.standard;
}

export interface Gestalt {
  /** token name → new `$value` in the main set aspekto/<name>; only tokens that change. */
  main: Map<string, unknown>;
  /** token name → new `$value` in the conjunction set with color-scheme=dark. */
  dark: Map<string, unknown>;
  /** Dangers no Regulo names (G4): hints in the Raporto, Regulo candidates in the plan. */
  hints: RaportoHint[];
}

const dimension = (value: number, unit: string): Dimension => ({ value, unit });

function scaled(value: unknown, factor: number, round: (px: number) => number): unknown {
  return isDimension(value) ? dimension(round(value.value * factor), value.unit) : value;
}

/** The shade step whose opacity is nearest to `alpha` (ties: the lighter one). */
function nearestShade(basis: GestaltBasis, alpha: number): string | undefined {
  let best: { name: string; distance: number } | undefined;
  for (const shade of basis.shades) {
    const distance = Math.abs(shade.alpha - alpha);
    if (best === undefined || distance < best.distance - 1e-9)
      best = { name: shade.name, distance };
  }
  return best?.name;
}

function shadowLayers(value: unknown, factor: number): unknown {
  const layer = (entry: unknown): unknown => {
    if (!isRecord(entry)) return entry;
    const out: Record<string, unknown> = { ...entry };
    for (const field of ["offsetX", "offsetY", "blur"]) {
      out[field] = scaled(entry[field], factor, roundHalf);
    }
    return out;
  };
  return Array.isArray(value) ? value.map(layer) : layer(value);
}

/** Sets `name` in `out` when the new value differs from the structure's. */
function put(out: Map<string, unknown>, basis: Flat, name: string, value: unknown): void {
  if (JSON.stringify(basis.get(name)) !== JSON.stringify(value)) out.set(name, value);
}

/** The opacity of the shade a shadow colour resolves to in a set of layers. */
function shadowAlpha(name: string, layers: readonly Flat[]): { alias?: string; alpha: number } {
  let alias: string | undefined;
  for (let index = layers.length - 1; index >= 0 && alias === undefined; index -= 1) {
    if (layers[index]?.has(name)) alias = aliasOf(layers[index]?.get(name));
  }
  const value = resolveIn(name, layers);
  return {
    ...(alias === undefined ? {} : { alias }),
    alpha: isRecord(value) && typeof value.alpha === "number" ? value.alpha : 1,
  };
}

/**
 * The tokens an Agordo's sliders of stage 2 change, and the hints they give (G2–G4). Every slider
 * on its standard — or absent — changes nothing.
 */
export function deriveGestalt(agordo: Agordo, basis: GestaltBasis): Gestalt {
  const sliders = gestaltSliders(basis);
  const at = (path: GestaltPath): number => {
    const slider = sliders.find((entry) => entry.path === path);
    return slider === undefined ? 0 : gestaltValue(agordo, slider);
  };
  const { core } = basis;
  const main = new Map<string, unknown>();
  const dark = new Map<string, unknown>();

  // form.radius: radius.small … xlarge, whole px; Spec 035 V-3: the pill points the controls' role
  // at radius.full (as the Agordo's festgelegt does), so the Werkstatt shows it live.
  const radius = at("form.radius");
  for (const name of RADII) put(main, core, name, scaled(core.get(name), radius, roundHalf));
  if (bedienformOf(agordo) === "pille") put(main, core, PILLE_TOKEN, `{${PILLE_ALIAS}}`);

  // form.rahmen: border.width.scale.*, never below 1 px; the focus ring keeps the reference's width.
  const rahmen = at("form.rahmen");
  const widths: { name: string; px: number }[] = [];
  for (const [name, value] of core) {
    if (!/^border\.width\.scale\./.test(name) || !isDimension(value)) continue;
    const next = dimension(Math.max(1, roundHalf(value.value * rahmen)), value.unit);
    widths.push({ name, px: next.value });
    put(main, core, name, next);
  }
  const focus = pxOf(resolveIn("border.width.focus", [core, main]));
  if (focus < basis.focusWidth) {
    const holding = widths
      .filter((width) => width.px >= basis.focusWidth)
      .sort((a, b) => a.px - b.px || (a.name < b.name ? -1 : 1))[0];
    if (holding !== undefined) put(main, core, "border.width.focus", `{${holding.name}}`);
  }

  // form.schatten: offsets and blur of elevation.shadow.*, the opacity of color.shadow.* per mode.
  const schatten = at("form.schatten");
  for (const [name, value] of core) {
    if (name.startsWith("elevation.shadow.")) put(main, core, name, shadowLayers(value, schatten));
  }
  const darkSet = basis.overlays.get(DARK_SET) ?? new Map();
  for (const name of SHADOW_COLORS) {
    for (const [layers, out, base] of [
      [[core], main, core],
      [[core, darkSet], dark, darkSet],
    ] as const) {
      const { alias, alpha } = shadowAlpha(name, layers);
      const shade = nearestShade(basis, alpha * schatten);
      if (shade !== undefined && shade !== alias) put(out, base, name, `{${shade}}`);
    }
  }

  // raum.abstand: spacing.scale.* on the 4 px grid (2 px where the structure is finer).
  const abstand = at("raum.abstand");
  for (const [name, value] of core) {
    if (!/^spacing\.scale\./.test(name) || !isDimension(value)) continue;
    const grid = value.value % GRID === 0 ? GRID : FINE_GRID;
    put(main, core, name, dimension(roundHalf((value.value * abstand) / grid) * grid, value.unit));
  }

  // raum.hoehe: the steps of size.scale.* the controls use, 4 px grid, never below size.target.min.
  const hoehe = at("raum.hoehe");
  for (const name of basis.controlSteps) {
    const value = core.get(name);
    if (!isDimension(value)) continue;
    const height = Math.max(basis.target, roundHalf((value.value * hoehe) / GRID) * GRID);
    put(main, core, name, dimension(height, value.unit));
  }

  // schrift.skala and schrift.groesse: every step of font.size.scale in whole px. skala multiplies
  // each neighbouring ratio by skala / standard around the body text, so the scale stays as regular
  // as the structure's (type-scale); groesse moves every size by up to two steps of the structure's
  // scale (its median ratio), whatever skala spreads — the two sliders stay apart.
  const skala = at("schrift.skala");
  const groesse = at("schrift.groesse");
  const spread = skala / basis.skala;
  const shift = basis.skala ** (2 * groesse);
  const exact = basis.fontScale.map(
    (step, index) => step.size * spread ** (index - basis.bodyIndex) * shift,
  );
  const sizes = wholePxScale(exact, basis.typeScaleMax);
  for (const [index, step] of basis.fontScale.entries()) {
    put(main, core, step.name, dimension(sizes[index] ?? step.size, step.unit));
  }

  // schrift.gewicht: font.weight.* by whole cuts (100), up to two, inside the structure's weights.
  const cuts = roundHalf(2 * at("schrift.gewicht"));
  const weights = [...core].filter(
    ([name, value]) => /^font\.weight\./.test(name) && typeof value === "number",
  ) as [string, number][];
  const lightest = Math.min(...weights.map(([, value]) => value));
  const heaviest = Math.max(...weights.map(([, value]) => value));
  for (const [name, value] of weights) {
    put(main, core, name, Math.min(heaviest, Math.max(lightest, value + cuts * 100)));
  }

  return { main, dark, hints: gestaltHints(basis, main, schatten) };
}

/**
 * A type scale in whole px (G3) that stays inside the sojlo of type-scale (G4): each size rounded
 * half away from zero; where that tears the ratios of the small steps apart beyond the sojlo, the
 * whole-px scale with the smallest worst deviation is taken (each step rounded down or up, strictly
 * rising; ties: the one nearest the exact sizes). Deterministic.
 */
export function wholePxScale(exact: readonly number[], sojlo: number): number[] {
  const rounded = exact.map((size) => Math.max(1, roundHalf(size)));
  const rising = (sizes: readonly number[]) =>
    sizes.every((size, i) => i === 0 || size > (sizes[i - 1] ?? 0));
  if (rising(rounded) && typeScaleConsistency(rounded).worst <= sojlo + 1e-9) return rounded;
  let best: { sizes: number[]; worst: number; error: number } | undefined;
  const choice = exact.map((size) => [
    ...new Set([Math.max(1, Math.floor(size)), Math.max(1, Math.ceil(size))]),
  ]);
  const walk = (index: number, sizes: number[]) => {
    if (index === exact.length) {
      const { worst } = typeScaleConsistency(sizes);
      const error = sizes.reduce(
        (sum, size, i) => sum + Math.abs(Math.log(size / (exact[i] ?? size))),
        0,
      );
      if (
        best === undefined ||
        worst < best.worst - 1e-12 ||
        (Math.abs(worst - best.worst) <= 1e-12 && error < best.error - 1e-12)
      ) {
        best = { sizes: [...sizes], worst, error };
      }
      return;
    }
    for (const size of choice[index] ?? []) {
      if (index > 0 && size <= (sizes[index - 1] ?? 0)) continue;
      sizes.push(size);
      walk(index + 1, sizes);
      sizes.pop();
    }
  };
  walk(0, []);
  return best?.sizes ?? rounded;
}

/** The hints of stage 2 (G4): dangers no Regulo names — Regulo candidates, never new rules. */
function gestaltHints(
  basis: GestaltBasis,
  main: Map<string, unknown>,
  schatten: number,
): RaportoHint[] {
  const hints: RaportoHint[] = [];
  const viewports: Flat[][] = [
    [],
    ...[...basis.overlays]
      .filter(([name]) => name.startsWith("viewport/"))
      .map(([, layer]) => [layer]),
  ];
  const bodies = [...basis.core.keys()].filter((name) => /^font\.size\.body\./.test(name)).sort();
  for (const name of bodies) {
    const sizes = viewports.map((layers) => pxOf(resolveIn(name, [basis.core, main, ...layers])));
    const below = sizes.filter((size) => size < BODY_TEXT_MIN_PX);
    if (below.length === 0) continue;
    hints.push({
      rule: "agordilo-body-size",
      subject: name,
      message: `Body text at ${Math.min(...below)} px, below ${BODY_TEXT_MIN_PX} px. No Regulo sets a minimum for body text (a Regulo candidate, Spec 019 G4); raise schrift.groesse to keep it readable.`,
      combinations: below.length,
    });
  }
  const layers = [basis.core, main];
  const regular = pxOf(resolveIn("border.width.default", layers));
  const strong = pxOf(resolveIn("border.width.strong", layers));
  if (regular === strong) {
    hints.push({
      rule: "agordilo-border-collapse",
      subject: "border.width.strong",
      message: `border.width.default and border.width.strong are both ${strong} px: contrast=high, which draws the default border as the strong one, no longer thickens it. No Regulo asks for the difference (a Regulo candidate, Spec 019 G4); raise form.rahmen.`,
      combinations: 1,
    });
  }
  if (schatten === 0) {
    hints.push({
      rule: "agordilo-shadow-none",
      subject: "elevation.shadow.*",
      message:
        "No shadow at all: raised and overlay surfaces are told apart by their lightness alone (surface-order and surface-distinct still bind). A Regulo candidate (Spec 019 G4); raise form.schatten above 0 to keep the layering visible.",
      combinations: 1,
    });
  }
  return hints;
}

/**
 * The resolved values of the structure with a Gestalt on top, over the named Dimensio sets (e.g.
 * `density/compact`): what a combination of the Vortaro reads, for the tests of the corners and the
 * Werkstatt — every token of the core, or only `names`. Light mode; composite values keep their
 * fields as written.
 */
export function gestaltTokens(
  basis: GestaltBasis,
  gestalt: Gestalt,
  overlays: readonly string[],
  names: Iterable<string> = basis.core.keys(),
): Map<string, unknown> {
  const layers = [
    basis.core,
    gestalt.main,
    ...overlays.map((name) => basis.overlays.get(name) ?? new Map()),
  ];
  const out = new Map<string, unknown>();
  for (const name of names) out.set(name, resolveIn(name, layers));
  return out;
}
