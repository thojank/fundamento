// The files of a derived Aspekto package (Spec 016, G1, G2, G8): `aspekto.json` with its origin,
// the main set `aspekto/<name>` that assigns every token of the Vortaro (the six palettes new,
// everything else as the structure writes it), the conjunction sets of the reference Aspekto with
// their roles unchanged, `ids.lock.json`, the glyphs of the reference and the Jugxoj the Agordo
// records. `$themes.json` and the report follow once the Modelo is composed (derive.ts). Pure.

import {
  type AspektoFile,
  CORE_SET_NAME,
  type Fonto,
  type IdsLock,
  type Jugxo,
  MODELO_VERSION,
  type ModeloSetDocument,
  serializeIdsLock,
  type ValidationIssue,
} from "@fundamento/modelo";
import type { Agordo } from "./agordo.js";
import { type Mode, PALETTES, type PaletteName } from "./calibration.js";
import type { Gestalt } from "./gestalt.js";
import { derivedIdGenerator, namespaceOf } from "./ids.js";
import type { DerivedPalettes, DerivedStep, ModeOverride } from "./palettes.js";
import { isRecord as isJsonObject } from "./record.js";
import { referencePackage, type Structure } from "./structure.js";
import { AGORDILO_VERSION } from "./version.js";

export const EXTENSION_KEY = "com.ciferecigo.fundamento";
const FONT_ROLES = ["display", "body", "code"] as const;
const PALETTE_TOKEN = /^color\.palette\.([a-z]+)\.(\d+)$/;

/** A Jugxo the Agordo records, with the Regulo it names resolved to its ID. */
export interface RecordedJugxo {
  regulo: { id: string; name: string };
  kialo: string;
  date: string;
  name: string;
}

export interface PackageDocuments {
  /** Package-relative path → parsed value, for every JSON file of the package. */
  json: Record<string, unknown>;
  /** Package-relative path → text, for the glyphs and their licence. */
  text: Record<string, string>;
  /** The set name → package-relative file of each set. */
  sets: { name: string; path: string }[];
  /** The ID of each recorded Jugxo, in the order of the Agordo. */
  jugxoIds: string[];
}

function isPaletteToken(name: string): { palette: PaletteName; step: string } | undefined {
  const match = PALETTE_TOKEN.exec(name);
  const palette = match?.[1];
  if (palette === undefined || match?.[2] === undefined) return undefined;
  return (PALETTES as readonly string[]).includes(palette)
    ? { palette: palette as PaletteName, step: match[2] }
    : undefined;
}

/**
 * A set document rewritten for the derived Aspekto: tokens keep their `$type` and `$value` (no
 * IDs or descriptions — an override carries neither), group types stay, `replace` gives new values
 * by token name, the root gets the set's own ID and kondicxoj.
 */
function rewriteSet(
  value: unknown,
  id: string,
  kondicxoj: string[],
  replace: (name: string, value: unknown) => unknown,
): Record<string, unknown> {
  const walk = (node: Record<string, unknown>, path: string[]): Record<string, unknown> => {
    if ("$value" in node) {
      const name = path.join(".");
      return {
        ...(node.$type === undefined ? {} : { $type: node.$type }),
        $value: replace(name, node.$value),
      };
    }
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(node)) {
      if (key === "$extensions" || key === "$description") continue;
      if (key.startsWith("$")) {
        out[key] = child;
        continue;
      }
      if (isJsonObject(child)) out[key] = walk(child, [...path, key]);
    }
    return out;
  };
  const body = isJsonObject(value) ? walk(value, []) : {};
  return { $extensions: { [EXTENSION_KEY]: { id, kondicxoj } }, ...body };
}

/**
 * Writes tokens a set of the reference does not carry into a rewritten set (Spec 019 ①: the
 * shadow colours of stage 2 in the dark conjunction set), at their dotted path; groups keep the
 * `$type` they have.
 */
function withTokens(set: Record<string, unknown>, tokens: ReadonlyMap<string, unknown>) {
  for (const [name, value] of tokens) {
    const path = name.split(".");
    let node = set;
    for (const key of path.slice(0, -1)) {
      if (!isJsonObject(node[key])) node[key] = {};
      node = node[key] as Record<string, unknown>;
    }
    // A typed token (Spec 024: a set of the brand's own has no group types to inherit).
    const typed =
      isJsonObject(value) && "type" in value && "value" in value && Object.keys(value).length === 2;
    node[path.at(-1) ?? ""] = typed
      ? { ...(typeof value.type === "string" ? { $type: value.type } : {}), $value: value.value }
      : { $value: value };
  }
  return set;
}

/** The DTCG type of a core token: its own `$type` or the nearest group's, walking its path. */
function coreTypeOf(structure: Structure, token: string): string | undefined {
  const core = structure.files.sets.find((set) => set.name === CORE_SET_NAME)?.value;
  let node: unknown = core;
  let type: string | undefined =
    isJsonObject(core) && typeof core.$type === "string" ? core.$type : undefined;
  for (const key of token.split(".")) {
    if (!isJsonObject(node)) return type;
    node = node[key];
    if (isJsonObject(node) && typeof node.$type === "string") type = node.$type;
  }
  return type;
}

/** Tokens for `withTokens` with their type, so a set of the brand's own carries complete tokens. */
function typedTokens(
  structure: Structure,
  tokens: ReadonlyMap<string, unknown>,
): Map<string, unknown> {
  return new Map(
    [...tokens].map(([name, value]) => [name, { type: coreTypeOf(structure, name), value }]),
  );
}

function kondicxojOf(value: unknown): string[] {
  const extension = isJsonObject(value) && isJsonObject(value.$extensions) ? value.$extensions : {};
  const own = isJsonObject(extension[EXTENSION_KEY]) ? extension[EXTENSION_KEY] : {};
  return Array.isArray(own.kondicxoj) ? own.kondicxoj.map(String) : [];
}

function modeOf(kondicxoj: readonly string[]): Mode {
  return kondicxoj.includes("color-scheme=dark") ? "dark" : "light";
}

/** The palette values a set of the reference sets literally (komuna: neutral.950 in dark). */
function literalPaletteTokens(value: unknown, path: string[] = []): string[] {
  if (!isJsonObject(value)) return [];
  if ("$value" in value) {
    const name = path.join(".");
    return isPaletteToken(name) !== undefined && typeof value.$value === "object" ? [name] : [];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    key.startsWith("$") ? [] : literalPaletteTokens(child, [...path, key]),
  );
}

/** The conjunction sets of the reference Aspekto: what the derived Aspekto writes beside its own. */
export function referenceConjunctionSets(structure: Structure): ModeloSetDocument[] {
  const reference = referencePackage(structure);
  return structure.files.sets.filter(
    (set) => set.package === reference.name && set.name.includes("+"),
  );
}

/** The mode-specific palette values the structure overrides (G3: measured per mode). */
export function modeOverrides(structure: Structure): ModeOverride[] {
  return referenceConjunctionSets(structure).flatMap((set) => {
    const mode = modeOf(kondicxojOf(set.value));
    return literalPaletteTokens(set.value).flatMap((name) => {
      const token = isPaletteToken(name);
      return token === undefined ? [] : [{ mode, ...token }];
    });
  });
}

function colorValue(step: DerivedStep): Record<string, unknown> {
  return { colorSpace: "srgb", components: [...step.components], hex: step.hex };
}

function firstFamily(value: unknown): string | undefined {
  return Array.isArray(value) && typeof value[0] === "string" ? value[0] : undefined;
}

function coreFontValue(structure: Structure, role: string): unknown[] {
  const core = structure.files.sets.find((set) => set.name === CORE_SET_NAME)?.value;
  const font = isJsonObject(core) && isJsonObject(core.font) ? core.font : {};
  const family = isJsonObject(font.family) ? font.family : {};
  const token = isJsonObject(family[role]) ? family[role] : {};
  return Array.isArray(token.$value) ? token.$value : [];
}

/** The fonts of aspekto.json: the Agordo's families, the reference's for every other role. */
function fontsOf(agordo: Agordo, structure: Structure): Fonto[] {
  const reference = referencePackage(structure).aspekto.value;
  const referenceFonts: Fonto[] =
    isJsonObject(reference) && Array.isArray(reference.fonts) ? (reference.fonts as Fonto[]) : [];
  const fonts: Fonto[] = [];
  for (const role of FONT_ROLES) {
    const own = agordo.schriften?.[role];
    const font =
      own ??
      referenceFonts.find((entry) => entry.family === firstFamily(coreFontValue(structure, role)));
    if (font !== undefined && !fonts.some((entry) => entry.family === font.family)) {
      fonts.push(font);
    }
  }
  return fonts;
}

/** The AGORDO_PATH of check.ts, repeated to keep package.ts free of the checks. */
const AGORDO_ISSUE_PATH = "agordo#/ikono/gewicht";

export interface IkonoChoice {
  /** The Phosphor weight drawn; the reference's style when the Agordo names none. */
  weight: string;
  /** Ikonaro name → SVG text, for every name the reference draws. */
  glyphs: Record<string, string>;
  /** aspekto.json#/ikonoj of the derived package. */
  ikonoj?: NonNullable<AspektoFile["ikonoj"]>;
  /** A weight without a glyph for every name is refused (Spec 019 ①, E6). */
  issues: ValidationIssue[];
}

/**
 * The glyphs of the derived package (Spec 019, G2 ikono.gewicht, E6): the reference's own, or
 * the weight the Agordo names from data/ikonoj — only where that weight has a glyph for every
 * name the reference draws; a missing glyph is reported at the Agordo and the reference's glyph
 * stands in, so the package still composes for the checks while the export is refused.
 */
export function ikonoChoice(agordo: Agordo, structure: Structure): IkonoChoice {
  const reference = referencePackage(structure);
  const referenceValue = isJsonObject(reference.aspekto.value) ? reference.aspekto.value : {};
  const referenceIkonoj = isJsonObject(referenceValue.ikonoj)
    ? (referenceValue.ikonoj as NonNullable<AspektoFile["ikonoj"]>)
    : undefined;
  const own = reference.ikonoj ?? {};
  const style = referenceIkonoj?.style ?? "regular";
  const weight = agordo.ikono?.gewicht ?? style;
  if (weight === style) {
    return {
      weight,
      glyphs: { ...own },
      ...(referenceIkonoj === undefined ? {} : { ikonoj: referenceIkonoj }),
      issues: [],
    };
  }
  const drawn = structure.ikonoGewichte?.glyphs[weight] ?? {};
  const names = Object.keys(own).sort();
  const missing = names.filter((name) => drawn[name] === undefined);
  const glyphs = Object.fromEntries(names.map((name) => [name, drawn[name] ?? own[name] ?? ""]));
  const provenance = structure.ikonoGewichte?.provenance ?? {};
  const text = (key: string, fallback: string | undefined): string =>
    typeof provenance[key] === "string" ? (provenance[key] as string) : (fallback ?? "");
  const ikonoj: NonNullable<AspektoFile["ikonoj"]> = {
    set: text("set", referenceIkonoj?.set),
    style: weight,
    version: text("version", referenceIkonoj?.version),
    license: text("license", referenceIkonoj?.license),
    source: text("source", referenceIkonoj?.source).replace("<gewicht>", weight),
    read: text("read", referenceIkonoj?.read),
    ...(referenceIkonoj?.names === undefined ? {} : { names: referenceIkonoj.names }),
  };
  const issues: ValidationIssue[] =
    missing.length === 0
      ? []
      : [
          {
            rule: "ikonaro-glyph-missing",
            severity: "error",
            path: AGORDO_ISSUE_PATH,
            message: `The Phosphor weight ${weight} has no glyph for ${missing.map((name) => JSON.stringify(name)).join(", ")}; every Aspekto draws every name of the Ikonaro (Art. IV).`,
            suggestion: `Choose a weight whose glyphs are all in the repository (${Object.keys(structure.ikonoGewichte?.glyphs ?? {}).join(", ") || "none"} besides ${style}), or add the missing Phosphor glyphs to data/ikonoj/${weight} with their provenance and licence (Spec 019, E6).`,
          },
        ];
  return { weight, glyphs, ikonoj, issues };
}

/**
 * Builds every file of the package except `$themes.json` and the report: the sets over the
 * structure, aspekto.json with the origin (the structure's fingerprint, node/structure.ts), the
 * lock, the glyphs and the Jugxoj the Agordo records (already resolved to their Reguloj).
 */
export function packageDocuments(
  agordo: Agordo,
  structure: Structure,
  palettes: DerivedPalettes,
  jugxoj: readonly RecordedJugxo[],
  gestalt?: Gestalt,
): PackageDocuments {
  const { name } = agordo;
  const reference = referencePackage(structure);
  const referenceValue = isJsonObject(reference.aspekto.value) ? reference.aspekto.value : {};
  const referenceName = typeof referenceValue.name === "string" ? referenceValue.name : "";
  const nextId = derivedIdGenerator(name);
  const ids: IdsLock = { ids: {} };
  const mint = (type: "dimensioValoro" | "tokenSet" | "jugxo"): string => {
    const id = nextId(type);
    ids.ids[id] = { status: "active", type };
    return id;
  };

  const aspektoId = mint("dimensioValoro");
  const byToken = new Map<string, DerivedStep>(
    palettes.steps.map((step) => [`color.palette.${step.palette}.${step.step}`, step]),
  );
  const byModeToken = new Map<string, DerivedStep>(
    palettes.overrides.map((step) => [
      `${step.mode}:color.palette.${step.palette}.${step.step}`,
      step,
    ]),
  );

  const json: Record<string, unknown> = {};
  const sets: { name: string; path: string }[] = [];
  const core = structure.files.sets.find((set) => set.name === CORE_SET_NAME);
  const mainName = `aspekto/${name}`;
  const mainPath = `sets/${mainName}.json`;
  json[mainPath] = rewriteSet(
    core?.value,
    mint("tokenSet"),
    [`aspekto=${name}`],
    (token, value) => {
      // Spec 024 (festgelegt): what the Studio set wins over everything the derivation writes.
      const set = agordo.festgelegt?.[token];
      if (set?.alias !== undefined) return `{${set.alias}}`;
      if (set?.wert !== undefined) return set.wert;
      const step = byToken.get(token);
      if (step !== undefined) return colorValue(step);
      if (gestalt?.main.has(token) === true) return gestalt.main.get(token);
      const role = /^font\.family\.([a-z]+)$/.exec(token)?.[1];
      const own = role === undefined ? undefined : agordo.schriften?.[role as "display"];
      if (own !== undefined && Array.isArray(value)) return [own.family, ...value.slice(1)];
      return value;
    },
  );
  // Spec 024 ② (festgelegt.schreibweise): the case of a typography role stands beside its value,
  // as the Vortaro carries it — the one extension an override may carry (set rules).
  for (const [token, set] of Object.entries(agordo.festgelegt ?? {})) {
    if (set.schreibweise === undefined) continue;
    const node = token
      .split(".")
      .reduce<unknown>(
        (current, key) => (isJsonObject(current) ? current[key] : undefined),
        json[mainPath],
      );
    if (isJsonObject(node) && "$value" in node) {
      node.$extensions = { [EXTENSION_KEY]: { textTransform: set.schreibweise } };
    }
  }
  sets.push({ name: mainName, path: mainPath });

  // Spec 024 (festgelegt.modoj): per Dimensio condition the tokens the Studio set, for the
  // brand's conjunction set of that condition — the reference's dark set where it has one, a set
  // of the brand's own for every other condition.
  const setByKondicxo = new Map<string, Map<string, unknown>>();
  for (const [token, set] of Object.entries(agordo.festgelegt ?? {})) {
    for (const [kondicxo, own] of Object.entries(set.modoj ?? {})) {
      const value = own.alias !== undefined ? `{${own.alias}}` : own.wert;
      if (value === undefined) continue;
      const tokens = setByKondicxo.get(kondicxo) ?? new Map<string, unknown>();
      tokens.set(token, value);
      setByKondicxo.set(kondicxo, tokens);
    }
  }
  const written = new Set<string>();
  for (const set of referenceConjunctionSets(structure)) {
    const kondicxoj = kondicxojOf(set.value).map((entry) =>
      entry === `aspekto=${referenceName}` ? `aspekto=${name}` : entry,
    );
    const mode = modeOf(kondicxoj);
    const setName = set.name.replace(`aspekto/${referenceName}`, mainName);
    const path = `sets/${setName}.json`;
    const rewritten = rewriteSet(set.value, mint("tokenSet"), kondicxoj, (token, value) => {
      const own = kondicxoj
        .filter((entry) => !entry.startsWith("aspekto="))
        .map((entry) => setByKondicxo.get(entry)?.get(token))
        .find((entry) => entry !== undefined);
      if (own !== undefined) return own;
      const step = byModeToken.get(`${mode}:${token}`);
      return step === undefined ? value : colorValue(step);
    });
    let document =
      mode === "dark" && gestalt !== undefined ? withTokens(rewritten, gestalt.dark) : rewritten;
    for (const kondicxo of kondicxoj.filter((entry) => !entry.startsWith("aspekto="))) {
      const own = setByKondicxo.get(kondicxo);
      if (own !== undefined && kondicxoj.length === 2) {
        document = withTokens(document, typedTokens(structure, own));
        written.add(kondicxo);
      }
    }
    json[path] = document;
    sets.push({ name: setName, path });
  }
  for (const [kondicxo, tokens] of [...setByKondicxo.entries()].sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    if (written.has(kondicxo)) continue;
    const [dimensio = "", valoro = ""] = kondicxo.split("=");
    const setName = `${mainName}+${dimensio}/${valoro}`;
    const path = `sets/${setName}.json`;
    json[path] = withTokens(
      rewriteSet({}, mint("tokenSet"), [`aspekto=${name}`, kondicxo], (_token, value) => value),
      typedTokens(structure, tokens),
    );
    sets.push({ name: setName, path });
  }

  const jugxoIds = jugxoj.map(() => mint("jugxo"));
  if (jugxoj.length > 0) {
    json["jugxoj.json"] = {
      jugxoj: jugxoj.map(
        (jugxo, index): Jugxo => ({
          id: jugxoIds[index] ?? "",
          ref: { regulo: jugxo.regulo.id },
          aspekto: name,
          decision: "deviation-recorded",
          kialo: jugxo.kialo,
          date: jugxo.date,
          context: `Deviation from the adjustable rule ${jugxo.regulo.name}, recorded by ${jugxo.name} in the Agordo of the Aspekto ${name} and written by the Agordilo (Spec 016, G6); the violations it covers are listed in raporto.json.`,
        }),
      ),
    };
  }

  const aspekto: AspektoFile = {
    id: aspektoId,
    name,
    owner: agordo.owner ?? `${name} (derived by the Agordilo)`,
    license: agordo.license ?? "proprietary",
    idNamespace: namespaceOf(name),
    fonts: fontsOf(agordo, structure),
  };
  const ikono = ikonoChoice(agordo, structure);
  if (ikono.ikonoj !== undefined) aspekto.ikonoj = ikono.ikonoj;
  if (agordo.aspiroj !== undefined && agordo.aspiroj.length > 0) aspekto.aspiroj = agordo.aspiroj;
  if (agordo.etikedoj !== undefined && Object.keys(agordo.etikedoj).length > 0) {
    aspekto.etikedoj = agordo.etikedoj;
  }
  aspekto.agordilo = {
    version: AGORDILO_VERSION,
    structure: { vortaro: MODELO_VERSION, reference: referenceName, sha256: structure.fingerprint },
    agordo,
  };
  json["aspekto.json"] = aspekto;
  json["ids.lock.json"] = ids;

  const text: Record<string, string> = {};
  for (const [glyph, svg] of Object.entries(ikono.glyphs).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    text[`ikonoj/${glyph}.svg`] = svg;
  }
  if (structure.ikonojLicense !== undefined) text["ikonoj/LICENSE"] = structure.ikonojLicense;
  return { json, text, sets, jugxoIds };
}

/** The bytes of a JSON file of the package: the lock canonical, every other file as built. */
export function serializeDocument(path: string, value: unknown): string {
  if (path === "ids.lock.json") return serializeIdsLock(value as IdsLock);
  return `${JSON.stringify(value, null, 2)}\n`;
}
