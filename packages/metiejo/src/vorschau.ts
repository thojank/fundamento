// The derivation behind the configurator (Spec 023, §3, §4.1): the same library as `fm agordilo
// derive` and the Werkstatt — the Agordilo over the structure of the Vortaro with its calibration.
// The preview is the stylesheet the CSS Celo writes for a Modelo with the draft composed; the
// check is the derivation with every check of the CI. Two runs with the same values give the same
// bytes. Read once at the I/O edge (`loadBases`), pure after it.

import {
  type Agordo,
  type Calibration,
  composeFiles,
  type Derivation,
  derivationBasis,
  deriveAspekto,
  type GestaltBasis,
  gestaltBasis,
  loadCalibration,
  packageDocuments,
  packageLabel,
  readStructure,
  referencePackage,
  type Structure,
} from "@fundamento/agordilo";
import {
  buildModelo,
  CORE_SET_NAME,
  type Fonto,
  readDtcgColor,
  srgbComponentsOf,
} from "@fundamento/modelo";
import { CSS_CELO } from "@fundamento/projekcioj";

export interface Bases {
  structure: Structure;
  calibration: Calibration;
  gestalt: GestaltBasis;
}

let cached: Bases | undefined;

/** The structure, the calibration and the gestalt basis, read once per process. */
export function loadBases(): Bases {
  if (cached === undefined) {
    const structure = readStructure();
    cached = { structure, calibration: loadCalibration(), gestalt: gestaltBasis(structure.files) };
  }
  return cached;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function walk(node: unknown, path: readonly string[]): unknown {
  return path.reduce<unknown>(
    (current, key) => (isRecord(current) ? current[key] : undefined),
    node,
  );
}

const FONT_ROLES = ["display", "body", "code"] as const;

/** The name of the reference Aspekto of the structure (komuna). */
export function referenceName(bases: Bases): string {
  const value = referencePackage(bases.structure).aspekto.value;
  return isRecord(value) && typeof value.name === "string" ? value.name : "komuna";
}

/**
 * The lead colour of the reference (its accent.700 as hex), the start of an empty brand: the
 * reference's values live in the core set, its own set restates what differs (as the Werkstatt reads it).
 */
export function referenceLeadColour(bases: Bases): string {
  for (const name of [`aspekto/${referenceName(bases)}`, CORE_SET_NAME]) {
    const set = bases.structure.files.sets.find((entry) => entry.name === name);
    const colour = readDtcgColor(walk(set?.value, ["color", "palette", "accent", "700", "$value"]));
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

/** The fonts of the reference by role: the first family of font.family.<role> in the core, as aspekto.json names it. */
export function referenceFonts(bases: Bases): Partial<Record<(typeof FONT_ROLES)[number], Fonto>> {
  const aspekto = referencePackage(bases.structure).aspekto.value;
  const fonts = isRecord(aspekto) && Array.isArray(aspekto.fonts) ? (aspekto.fonts as Fonto[]) : [];
  const core = bases.structure.files.sets.find((entry) => entry.name === CORE_SET_NAME);
  const out: Partial<Record<(typeof FONT_ROLES)[number], Fonto>> = {};
  for (const role of FONT_ROLES) {
    const value = walk(core?.value, ["font", "family", role, "$value"]);
    const first = Array.isArray(value) ? value[0] : value;
    const font = fonts.find((entry) => entry.family === first);
    if (font !== undefined) out[role] = font;
  }
  return out;
}

/** The Agordo a brand starts with (step 1): empty — a name and the reference's lead colour — or komuna's colour and fonts. */
export function startAgordo(
  name: string,
  basis: "leer" | "komuna",
  bases: Bases = loadBases(),
): Agordo {
  const leitfarbe = referenceLeadColour(bases);
  if (basis === "leer") return { name, leitfarbe };
  const fonts = referenceFonts(bases);
  const schriften: NonNullable<Agordo["schriften"]> = {};
  if (fonts.display !== undefined) schriften.display = fonts.display;
  if (fonts.body !== undefined) schriften.body = fonts.body;
  if (fonts.code !== undefined) schriften.code = fonts.code;
  return Object.keys(schriften).length === 0 ? { name, leitfarbe } : { name, leitfarbe, schriften };
}

let komunaStylesheet: string | undefined;

/** The stylesheet of the structure alone (core and komuna), for the screens of the configurator. */
export function komunaCss(bases: Bases): string {
  if (komunaStylesheet === undefined) {
    const modelo = buildModelo(bases.structure.files).modelo;
    komunaStylesheet =
      CSS_CELO.generate({ modelo } as Parameters<typeof CSS_CELO.generate>[0])[0]?.text ?? "";
  }
  return komunaStylesheet;
}

/**
 * The preview (§3: "Vorschau sofort"): the draft derived — palettes, gestalt, the package documents
 * — and composed with the structure; the CSS Celo writes the stylesheet with every Aspekto and
 * Dimensio, switched by data-fm-* on the root. No check runs here; that is `checkDraft`.
 */
export function previewCss(agordo: Agordo, bases: Bases): string {
  const { palettes, gestalt } = derivationBasis(agordo, bases.structure, bases.calibration);
  const documents = packageDocuments(agordo, bases.structure, palettes, [], gestalt);
  const files = composeFiles(bases.structure, packageLabel(agordo), documents, []);
  const modelo = buildModelo(files).modelo;
  return CSS_CELO.generate({ modelo } as Parameters<typeof CSS_CELO.generate>[0])[0]?.text ?? "";
}

/** The derivation with every check of the CI (G5 of Spec 016): the report, the export decision. */
export function checkDraft(agordo: Agordo, bases: Bases): Derivation {
  return deriveAspekto(agordo, bases.structure, bases.calibration);
}
