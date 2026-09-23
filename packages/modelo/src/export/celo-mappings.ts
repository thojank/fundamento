// AK-12, Article VIII: the canonical Modelo carries no Celo-specific mappings. What that means was
// narrowed by the maintainer on 2026-09-20: a *mapping* is a name, key or value that tells a
// consumer what something is called in a Celo. The mere word is not a mapping — Article X of the
// constitution names the tool itself.
//
// The licence is a rule, not a list of permitted fields (maintainer, 2026-09-23): a sentence that
// declares its Celo in a typed field may name that Celo, and the names derived from it, in its own
// fields; a sentence that declares none may not. A Jugxo declares it in `ref.celo`, a Manko in
// `celo` (F41). A list would have to grow with every new field, and prose would become the
// loophole — as a condition the rule carries the next kind of sentence without anyone maintaining
// it. Everywhere else the ban stands: no key naming a Celo, no derived name in any value, and no
// Celo named in prose that does not declare it.

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** What a sentence declares, and the field it stands in — relative to the sentence. */
interface Declaration {
  pointer: string;
  /** What the field says; not necessarily a Celo the code knows. */
  celo: string;
}

/**
 * The Celo this sentence declares in a typed field: a Manko says it in `celo`, a Jugxo in
 * `ref.celo`. No typed field, no declaration — and no licence to name a Celo.
 */
function declaration(node: Record<string, unknown>): Declaration | undefined {
  if (typeof node.celo === "string") return { pointer: "/celo", celo: node.celo };
  const ref = node.ref;
  if (isRecord(ref) && typeof ref.celo === "string") {
    return { pointer: "/ref/celo", celo: ref.celo };
  }
  return undefined;
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
  // A sentence that declares a Celo opens the licence for its own fields. One that declares a name
  // no Celo of Fundamento carries opens nothing: the typed field is wrong, and the fields that
  // leaned on it fall with it.
  const declared = declaration(node);
  let scope = celo;
  if (declared !== undefined) {
    if ((CELOJ as readonly string[]).includes(declared.celo)) {
      scope = declared.celo;
    } else {
      scope = undefined;
      out.push({ pointer: `${pointer}${declared.pointer}`, needle: declared.celo });
    }
  }
  const declaringKey = declared?.pointer.split("/")[1];
  for (const [key, value] of Object.entries(node)) {
    const here = `${pointer}/${key}`;
    const found = KEY_NAMES.find((name) => key.toLowerCase().includes(name));
    if (found !== undefined) {
      out.push({ pointer: here, needle: found });
      continue;
    }
    // The declaring field is the one place a Celo stands as itself; it was read above.
    if (key === declaringKey) {
      if (declared?.pointer === `/${key}`) continue;
      for (const [refKey, refValue] of Object.entries(value as Record<string, unknown>)) {
        if (refKey !== "celo") walk(refValue, `${here}/${refKey}`, scope, out);
      }
      continue;
    }
    walk(value, here, scope, out);
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
