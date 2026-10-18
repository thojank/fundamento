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
} from "@fundamento/modelo";
import type { Agordo } from "./agordo.js";
import { type Mode, PALETTES, type PaletteName } from "./calibration.js";
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
      const step = byToken.get(token);
      if (step !== undefined) return colorValue(step);
      const role = /^font\.family\.([a-z]+)$/.exec(token)?.[1];
      const own = role === undefined ? undefined : agordo.schriften?.[role as "display"];
      if (own !== undefined && Array.isArray(value)) return [own.family, ...value.slice(1)];
      return value;
    },
  );
  sets.push({ name: mainName, path: mainPath });

  for (const set of referenceConjunctionSets(structure)) {
    const kondicxoj = kondicxojOf(set.value).map((entry) =>
      entry === `aspekto=${referenceName}` ? `aspekto=${name}` : entry,
    );
    const mode = modeOf(kondicxoj);
    const setName = set.name.replace(`aspekto/${referenceName}`, mainName);
    const path = `sets/${setName}.json`;
    json[path] = rewriteSet(set.value, mint("tokenSet"), kondicxoj, (token, value) => {
      const step = byModeToken.get(`${mode}:${token}`);
      return step === undefined ? value : colorValue(step);
    });
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
  if (isJsonObject(referenceValue.ikonoj)) {
    aspekto.ikonoj = referenceValue.ikonoj as NonNullable<AspektoFile["ikonoj"]>;
  }
  if (agordo.aspiroj !== undefined && agordo.aspiroj.length > 0) aspekto.aspiroj = agordo.aspiroj;
  aspekto.agordilo = {
    version: AGORDILO_VERSION,
    structure: { vortaro: MODELO_VERSION, reference: referenceName, sha256: structure.fingerprint },
    agordo,
  };
  json["aspekto.json"] = aspekto;
  json["ids.lock.json"] = ids;

  const text: Record<string, string> = {};
  for (const [glyph, svg] of Object.entries(reference.ikonoj ?? {}).sort(([a], [b]) =>
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
