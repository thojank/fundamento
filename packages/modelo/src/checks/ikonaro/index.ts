// Ikonaro check (Spec 014 ①, G3; Art. IV, Art. VII). Icons are vocabulary in the core and a
// picture in the Aspekto: `data/ikonaro.json` names the icons, and every installed Aspekto draws
// every name as `<package>/ikonoj/<name>.svg` — a square SVG without a fixed colour (currentColor
// inherits from the text) that carries its provenance (source, version, licence) in <metadata>.
// Only a square viewBox is asked for: the grid is the set's, the size is the Ero's (plan ① D-04).
// Runs on the repo (the reference Aspekto and the Aspektoj the Modelo knows beside it), on a
// project config (`--config`) or on a fixture root (`--fixture`: its `data/` and the Aspektoj its
// `fundamento.config.json` lists). Reads only the Ikonaro, strictly parsed but without schema
// validation, so the check works even when the rest of the Modelo is broken.

import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { basename, join } from "node:path";
import { readKonfiguro } from "../../config/read-config.js";
import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import { formatIssuePath, type ValidationIssue } from "../../contracts/issues.js";
import { modeloRootOf, relativeModeloPath } from "../../load/source.js";
import { knownAspektoConfigs } from "../alirebleco/index.js";
import { readStrictJsonFile } from "../parity/read-json.js";
import { checkSource } from "../source.js";

export const IKONARO_FILE_NAME = "ikonaro.json";
/** The folder of an Aspekto package that holds one glyph per Ikonaro name. */
export const GLYPH_DIR_NAME = "ikonoj";

/** The provenance lines a glyph's <metadata> must carry (Art. VII). */
const PROVENANCE_FIELDS = ["source", "version", "license"] as const;

/** Paint values that are no colour: the glyph inherits, or paints nothing. */
const NO_COLOR = new Set(["none", "currentcolor", "inherit"]);

const PAINT_PROPERTIES = ["fill", "stroke"] as const;

export async function check(options: CheckOptions): Promise<CheckResult> {
  const source = checkSource(options);
  const root = modeloRootOf(source);
  const errors: ValidationIssue[] = [...(source.sourceIssues ?? [])];
  const warnings: ValidationIssue[] = [];

  const absoluteIkonaro = join(source.dataDir, IKONARO_FILE_NAME);
  const ikonaroFile = relativeModeloPath(root, absoluteIkonaro);
  // The Ikonaro may be absent (the Modelo loads it as empty); then no name asks for a glyph.
  let ikonaro: IkonaroName[] = [];
  if (existsSync(absoluteIkonaro)) {
    const parsed = readStrictJsonFile(absoluteIkonaro, ikonaroFile);
    errors.push(...parsed.issues);
    ikonaro = ikonaroNames(parsed.value);
  }
  const names = new Set(ikonaro.map(({ name }) => name));

  const aspektoDirs = [...(source.aspektoPackages ?? [])];
  // Every other Aspekto the Modelo knows (Nachlese 3 W2): drawn by the same Ikonaro, so it is
  // checked as the reference is, on the repo run only.
  if (options.fixture === undefined && options.config === undefined) {
    for (const { configFile } of knownAspektoConfigs()) {
      const { konfiguro, issues } = readKonfiguro(configFile);
      errors.push(...issues);
      aspektoDirs.push(...(konfiguro?.aspektoPackages ?? []));
    }
  }

  const labels: string[] = [];
  let glyphs = 0;
  for (const dir of uniqueDirs(aspektoDirs)) {
    const label = aspektoLabel(dir);
    labels.push(label);
    const glyphDir = join(dir, GLYPH_DIR_NAME);
    const relativeGlyphDir = relativeModeloPath(root, glyphDir);
    const files = existsSync(glyphDir)
      ? readdirSync(glyphDir).filter((file) => file.endsWith(".svg"))
      : [];
    const drawn = new Set(files.map((file) => file.slice(0, -".svg".length)));

    for (const { name, index } of ikonaro) {
      if (drawn.has(name)) continue;
      errors.push({
        rule: "ikonaro-glyph-missing",
        severity: "error",
        path: formatIssuePath({ file: ikonaroFile, pointer: `/ikonaro/${index}` }),
        message: `The Aspekto ${label} draws no glyph for the Ikonaro name "${name}".`,
        suggestion: `Add ${GLYPH_DIR_NAME}/${name}.svg to the Aspekto ${label} (${relativeGlyphDir}/${name}.svg): a square SVG in currentColor with its provenance in <metadata> — every installed Aspekto draws every name (Art. IV).`,
      });
    }

    for (const file of files.sort()) {
      const name = file.slice(0, -".svg".length);
      const glyphFile = `${relativeGlyphDir}/${file}`;
      if (!names.has(name)) {
        warnings.push({
          rule: "ikonaro-glyph-unknown",
          severity: "warning",
          path: formatIssuePath({ file: glyphFile, pointer: "" }),
          message: `The Aspekto ${label} draws ${file}, but "${name}" is no name of the Ikonaro.`,
          suggestion: `Name the icon in ${ikonaroFile} (with its meaning and kialo), or remove the file from the Aspekto ${label}; the check deletes nothing.`,
        });
        continue;
      }
      glyphs += 1;
      errors.push(...glyphIssues(glyphFile, readFileSync(join(glyphDir, file), "utf8")));
    }
  }

  const ok = errors.length === 0;
  const stats = { aspektoj: labels.length, names: names.size, glyphs };
  const counts = `${stats.names} Ikonaro name(s) x ${stats.aspektoj} Aspekto(j)${
    labels.length === 0 ? "" : ` (${labels.join(", ")})`
  }, ${stats.glyphs} glyph(s)`;
  const unknown = warnings.length === 0 ? "" : `; ${warnings.length} glyph(s) without a name`;
  return {
    check: "ikonaro",
    ok,
    summary: ok
      ? `${counts}: every name drawn, every glyph square, in currentColor and with its provenance${unknown}.`
      : `${counts}: ${errors.length} error(s)${unknown}.`,
    errors,
    warnings,
    stats,
  };
}

/**
 * The rules of one glyph, reported at `<file>#`: an SVG root with a square viewBox `0 0 n n`, no
 * fixed colour on the root or a shape (fill or stroke, as attribute or in a style), and its
 * provenance in <metadata>. What is no SVG at all is reported as a missing viewBox only.
 */
export function glyphIssues(file: string, svgText: string): ValidationIssue[] {
  const path = formatIssuePath({ file, pointer: "" });
  // Comments and the metadata text are no markup; their words must not count as attributes.
  const markup = svgText
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<metadata\b[^>]*>[\s\S]*?<\/metadata>/g, "<metadata/>");
  const root = /<svg\b([^>]*)>/.exec(markup);
  if (root === null) {
    return [
      {
        rule: "ikonaro-glyph-viewbox",
        severity: "error",
        path,
        message: `${file} has no <svg> root element.`,
        suggestion: `Save the glyph as an SVG with a square viewBox, e.g. <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">.`,
      },
    ];
  }
  const issues: ValidationIssue[] = [];

  const viewBox = attributesOf(root[1] ?? "").get("viewBox");
  if (!isSquareViewBox(viewBox)) {
    issues.push({
      rule: "ikonaro-glyph-viewbox",
      severity: "error",
      path,
      message:
        viewBox === undefined
          ? `${file} has no viewBox; a glyph sits on a square grid.`
          : `${file} has the viewBox "${viewBox}", which is not a square grid "0 0 n n".`,
      suggestion:
        'Draw the glyph on a square grid starting at the origin, e.g. viewBox="0 0 24 24" (any n; the size comes from the Ero).',
    });
  }

  const colors: string[] = [];
  for (const tag of markup.matchAll(/<([a-zA-Z][\w:.-]*)\b([^>]*?)\/?>/g)) {
    const element = tag[1] ?? "";
    for (const [property, value] of paintsOf(tag[2] ?? "")) {
      if (!NO_COLOR.has(value.trim().toLowerCase())) {
        colors.push(`${property}="${value.trim()}" on <${element}>`);
      }
    }
  }
  if (colors.length > 0) {
    issues.push({
      rule: "ikonaro-glyph-fixed-color",
      severity: "error",
      path,
      message: `${file} paints a fixed colour: ${colors.join(", ")}.`,
      suggestion:
        "Use currentColor (or none) for fill and stroke, so the glyph takes the colour of its text in every Aspekto and colour scheme (Art. I, Art. IV).",
    });
  }

  const metadata = /<metadata\b[^>]*>([\s\S]*?)<\/metadata>/.exec(svgText);
  const missing =
    metadata === null
      ? [...PROVENANCE_FIELDS]
      : PROVENANCE_FIELDS.filter(
          (field) => !new RegExp(`^\\s*${field}:\\s*\\S`, "m").test(metadata[1] ?? ""),
        );
  if (missing.length > 0) {
    issues.push({
      rule: "ikonaro-glyph-provenance-missing",
      severity: "error",
      path,
      message:
        metadata === null
          ? `${file} has no <metadata> with its provenance (${missing.join(", ")}).`
          : `The <metadata> of ${file} does not name its ${missing.join(", ")}.`,
      suggestion:
        'Add one line each to the glyph\'s <metadata>: `source: <set>, icon "<name>" (<style>), <url>`, `version: <package> <version>`, `license: <licence>, <url>` (Art. VII).',
    });
  }
  return issues;
}

interface IkonaroName {
  name: string;
  /** Position in the `ikonaro` array, for the JSON Pointer of an issue. */
  index: number;
}

/** The `name` of every entry of an Ikonaro document; the schema is the validator's concern. */
function ikonaroNames(value: unknown): IkonaroName[] {
  if (typeof value !== "object" || value === null) return [];
  const entries = (value as { ikonaro?: unknown }).ikonaro;
  if (!Array.isArray(entries)) return [];
  return entries.flatMap((entry: unknown, index) => {
    const name =
      typeof entry === "object" && entry !== null ? (entry as { name?: unknown }).name : undefined;
    return typeof name === "string" && name !== "" ? [{ name, index }] : [];
  });
}

/** Aspekto package directories without duplicates, compared by real path (in order). */
function uniqueDirs(dirs: readonly string[]): string[] {
  const seen = new Set<string>();
  return dirs.filter((dir) => {
    const key = existsSync(dir) ? realpathSync(dir) : dir;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** The `name` in the package's aspekto.json, or the folder name when it cannot be read. */
function aspektoLabel(dir: string): string {
  try {
    const name: unknown = (
      JSON.parse(readFileSync(join(dir, "aspekto.json"), "utf8")) as { name?: unknown }
    ).name;
    if (typeof name === "string" && name !== "") return name;
  } catch {
    // The Aspekto loader reports an unreadable aspekto.json; the folder name stands in here.
  }
  return basename(dir);
}

function attributesOf(text: string): Map<string, string> {
  const attributes = new Map<string, string>();
  for (const match of text.matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    attributes.set(match[1] ?? "", match[2] ?? match[3] ?? "");
  }
  return attributes;
}

/** The fill and stroke of one start tag, from its attributes and from its style. */
function paintsOf(text: string): [property: string, value: string][] {
  const attributes = attributesOf(text);
  const paints: [string, string][] = [];
  for (const property of PAINT_PROPERTIES) {
    const value = attributes.get(property);
    if (value !== undefined) paints.push([property, value]);
  }
  for (const declaration of (attributes.get("style") ?? "").split(";")) {
    const colon = declaration.indexOf(":");
    if (colon < 0) continue;
    const property = declaration.slice(0, colon).trim().toLowerCase();
    if ((PAINT_PROPERTIES as readonly string[]).includes(property)) {
      paints.push([property, declaration.slice(colon + 1).replace(/!important/i, "")]);
    }
  }
  return paints;
}

/** `0 0 n n` with n > 0, separated by whitespace and/or commas. */
function isSquareViewBox(viewBox: string | undefined): boolean {
  if (viewBox === undefined) return false;
  const numbers = viewBox
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (numbers.length !== 4 || numbers.some((number) => !Number.isFinite(number))) return false;
  const [minX, minY, width, height] = numbers;
  return minX === 0 && minY === 0 && width === height && (width ?? 0) > 0;
}
