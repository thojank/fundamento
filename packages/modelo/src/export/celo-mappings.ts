// AK-12, Article VIII: the canonical Modelo carries no Celo-specific mappings. What that means was
// narrowed by the maintainer on 2026-09-20: a *mapping* is a name, key or value that tells a
// consumer what something is called in a Celo. The mere word is not a mapping — Article X of the
// constitution names the tool itself.
//
// A Jugxo that belongs to a Celo therefore declares it in the typed field `ref.celo`; its prose
// (`kialo`, `context`) may then name that Celo and names derived from it. Everywhere else the ban
// stands: no key naming a Celo, no derived name in any value, and no Celo named in prose that does
// not declare it.

import { TAILWIND_NAMESPACES } from "../nomreguloj/tailwind.js";
import { CELOJ } from "../nomreguloj/types.js";

/** A Celo name may never be a key: a key is a mapping by definition. */
const KEY_NAMES = CELOJ.filter((celo) => celo !== "dtcg");

/**
 * Celo names in text. `css` and `typescript` are left out on purpose: they are ordinary words of
 * the web platform in German prose, and the mapping they could carry is caught by the derived
 * names below.
 */
const TEXT_NAMES = ["tailwind", "figma", "penpot", "daisyui"] as const;

/** Names a Celo derives from the Modelo — the mapping a consumer must not be able to read off. */
const DERIVED_NAMES = [
  "--fm-",
  "--color-",
  "@theme",
  ...TAILWIND_NAMESPACES.map((entry) => entry.namespace.replace("*", "")),
];

/** Prose of a Jugxo: written for the maintainer, not read by a Celo. */
const JUGXO_PROSE = ["kialo", "context"];

export interface CeloMappingLeak {
  /** JSON pointer of the offending key or value. */
  pointer: string;
  /** The Celo name or derived name that was found. */
  needle: string;
}

/** Every Celo-specific mapping in a parsed Modelo or schema document, in document order. */
export function celoMappingLeaks(document: unknown): CeloMappingLeak[] {
  const out: CeloMappingLeak[] = [];
  walk(document, "", undefined, out);
  return out;
}

const JUGXO_ENTRY = /(^|\/)jugxoj\/\d+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The Celo a Jugxo declares in `ref.celo`, if this node is a Jugxo entry. */
function declaredCelo(node: Record<string, unknown>, pointer: string): string | undefined {
  if (!JUGXO_ENTRY.test(pointer)) return undefined;
  const ref = node.ref;
  return isRecord(ref) && typeof ref.celo === "string" ? ref.celo : undefined;
}

function walk(node: unknown, pointer: string, celo: string | undefined, out: CeloMappingLeak[]) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => {
      walk(item, `${pointer}/${index}`, celo, out);
    });
    return;
  }
  if (typeof node === "string") {
    text(node, pointer, celo, out);
    return;
  }
  if (!isRecord(node)) return;
  const jugxo = JUGXO_ENTRY.test(pointer);
  const scope = jugxo ? declaredCelo(node, pointer) : celo;
  for (const [key, value] of Object.entries(node)) {
    const here = `${pointer}/${key}`;
    const found = KEY_NAMES.find((name) => key.toLowerCase().includes(name));
    if (found !== undefined) {
      out.push({ pointer: here, needle: found });
      continue;
    }
    // The typed reference is the one place a Celo may be named outright; it has to name one.
    if (jugxo && key === "ref" && isRecord(value) && typeof value.celo === "string") {
      if (!(CELOJ as readonly string[]).includes(value.celo)) {
        out.push({ pointer: `${here}/celo`, needle: value.celo });
      }
      for (const [refKey, refValue] of Object.entries(value)) {
        if (refKey !== "celo") walk(refValue, `${here}/${refKey}`, scope, out);
      }
      continue;
    }
    walk(value, here, jugxo && JUGXO_PROSE.includes(key) ? scope : undefined, out);
  }
}

function text(value: string, pointer: string, celo: string | undefined, out: CeloMappingLeak[]) {
  const lower = value.toLowerCase();
  for (const needle of [...TEXT_NAMES, ...DERIVED_NAMES]) {
    if (!lower.includes(needle)) continue;
    // Prose of a Jugxo may name the Celo it declares, and the names that Celo derives.
    if (celo !== undefined && (needle === celo || derivedBy(needle, celo))) continue;
    out.push({ pointer, needle });
    return;
  }
}

/** `--color-*` and `@theme` are Tailwind's forms; `--fm-` is the CSS Celo's. */
function derivedBy(needle: string, celo: string): boolean {
  if (celo === "tailwind") return needle === "@theme" || needle.startsWith("--");
  if (celo === "css") return needle.startsWith("--");
  return false;
}
