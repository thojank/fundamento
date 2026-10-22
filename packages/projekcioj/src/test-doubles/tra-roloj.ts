// Test support (not a double): a projection read through the roles its Ero-Tokens alias by
// default. Since Constitution v2.3 the Eroj and the Figma plan bind the third level
// (`--fm-ero-butono-surface-fill-emphasis-high-intent-neutral-rest`, `ero/butono/...`); the record
// of what every part binds stays readable as the roles the Skemo names, so the suites of the
// Celoj keep stating `var(--fm-color-action-primary-rest)` and `color/action/primary/rest`. The
// mapping is the derivation itself (`eroTokenojOfModelo`), never a list of its own; that the
// projections name the Ero-Tokens is proved in `ero-tokenoj.test.ts`.

import { eroTokenojOfModelo, type Modelo, nomRegulo } from "@fundamento/modelo";

function aliasMap(modelo: Modelo, celo: "css" | "figma"): Map<string, string> {
  const derive = (name: string) => nomRegulo(celo).derive(name);
  return new Map(
    eroTokenojOfModelo(modelo).map((token) => [derive(token.name), derive(token.alias)]),
  );
}

const caches = new WeakMap<Modelo, Partial<Record<"css" | "figma", Map<string, string>>>>();
function mapOf(modelo: Modelo, celo: "css" | "figma"): Map<string, string> {
  const own = caches.get(modelo) ?? {};
  own[celo] ??= aliasMap(modelo, celo);
  caches.set(modelo, own);
  return own[celo];
}

/** `name` or, where it is an Ero-Token's name with a field suffix, the role's name with it. */
function translate(name: string, map: Map<string, string>, separator: string): string {
  let head = name;
  let tail = "";
  while (head !== "") {
    const role = map.get(head);
    if (role !== undefined) return `${role}${tail}`;
    const at = head.lastIndexOf(separator);
    if (at === -1) return name;
    tail = `${head.slice(at)}${tail}`;
    head = head.slice(0, at);
  }
  return name;
}

/** A stylesheet (or any text with `--fm-*` properties) with every Ero-Token read as its role. */
export function traRolojCss(text: string, modelo: Modelo): string {
  const map = mapOf(modelo, "css");
  return text.replaceAll(/--fm-(?:ero|sxablono)-[a-z0-9-]+/g, (name) => translate(name, map, "-"));
}

/**
 * A Figma plan text with every binding of an Ero-Token variable read as its role variable. The
 * collections stay as they are — the Ero-Token variables exist, aliasing the roles —, only what
 * the components, the Sxablonoj and the stand-ins bind is read through the roles.
 */
export function traRolojFigma(text: string, modelo: Modelo): string {
  const map = mapOf(modelo, "figma");
  const plan = JSON.parse(text) as Record<string, unknown>;
  const { collections, ...rest } = plan;
  const translated = JSON.stringify(rest).replaceAll(
    /\b(?:ero|sxablono)\/[a-z0-9]+(?:\/[a-z0-9]+)*/g,
    (name) => translate(name, map, "/"),
  );
  return JSON.stringify({ collections, ...(JSON.parse(translated) as Record<string, unknown>) });
}

/**
 * A Figma variable name read as its role where it names an Ero-Token (with a field suffix); the
 * STRING twin of an Ero-Token's weight (F30, `…/style/…`) as the twin of its role's weight.
 */
export function traRolojFigmaName(name: string | undefined, modelo: Modelo): string | undefined {
  if (name === undefined) return undefined;
  const map = mapOf(modelo, "figma");
  const translated = translate(name, map, "/");
  if (translated !== name || !/^(?:ero|sxablono)\/.*\/style(?:\/|$)/.test(name)) return translated;
  const weight = translate(name.replace(/\/style(?=\/|$)/, "/weight"), map, "/");
  return weight.startsWith("font/weight/")
    ? `font/style/${weight.slice("font/weight/".length)}`
    : name;
}
