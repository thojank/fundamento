// Spec 029 ① (Constitution v2.4, Art. V): the fingerprint check leaves out values with a valid
// Fonto provenance and stays as it was for every other value. A value is exempt when the
// deveno.json of its Aspekto package names a Fonto that data/fontoj.json lists pinned (a version
// and a commit) with its copyright in the notices it names; the exemption covers exactly the
// `$value` of that token in that set. deveno.json itself records the values of the Fonto, as a
// fingerprint list records hashes, and is not searched.
//
// A deveno.json belongs to the Modelo of the nearest registry above it; the registry decides its
// Fontoj, and `aro: "core"` is the core of that Modelo — in the repository
// packages/vortaro/sets/core.json. The scanned tree holds the cores and registries of the test
// fixtures too; the first of them in sort order is a fixture's (Befund aus Sitzung C, #113).

import { dirname, posix } from "node:path";
import { findNodeAtLocation, parseTree } from "jsonc-parser";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const VERSION = /^\d+\.\d+\.\d+$/;
const COMMIT = /^[0-9a-f]{40}$/;
const DEVENO = /(^|\/)deveno\.json$/;
/** Where a Modelo keeps its Fonto registry and its core, relative to its root. */
const REGISTRY_PATHS = ["data/fontoj.json", "packages/modelo/data/fontoj.json"];
const CORE_PATHS = ["vortaro/sets/core.json", "packages/vortaro/sets/core.json"];

const under = (root: string, relative: string): string =>
  root === "." ? relative : `${root}/${relative}`;

/** The root of the Modelo a file belongs to: the nearest directory above it with a registry. */
function modeloRoot(file: string, paths: ReadonlySet<string>): string | undefined {
  for (let dir = dirname(file); ; dir = posix.dirname(dir)) {
    if (REGISTRY_PATHS.some((relative) => paths.has(under(dir, relative)))) return dir;
    if (dir === ".") return undefined;
  }
}

export interface FontoExemptions {
  /** deveno.json files: provenance, not searched. */
  files: Set<string>;
  /** Per set file, the [start, end) offsets of `$value`s with a valid Fonto provenance. */
  ranges: Map<string, [number, number][]>;
}

function parse(text: string | undefined): unknown {
  if (text === undefined) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** The Fontoj of one registry with a valid provenance: pinned, with their copyright in their notices. */
function validFontoj(
  registries: readonly string[],
  text: (path: string) => string | undefined,
): Set<string> {
  const valid = new Set<string>();
  for (const path of registries) {
    const value = parse(text(path));
    const fontoj = isObject(value) && Array.isArray(value.fontoj) ? value.fontoj : [];
    for (const fonto of fontoj) {
      if (!isObject(fonto) || typeof fonto.id !== "string") continue;
      const pinned =
        typeof fonto.version === "string" &&
        VERSION.test(fonto.version) &&
        typeof fonto.commit === "string" &&
        COMMIT.test(fonto.commit);
      const notices = typeof fonto.notices === "string" ? text(fonto.notices) : undefined;
      if (
        pinned &&
        typeof fonto.copyright === "string" &&
        notices?.includes(fonto.copyright) === true
      ) {
        valid.add(fonto.id);
      }
    }
  }
  return valid;
}

export function fontoExemptions(
  paths: readonly string[],
  text: (path: string) => string | undefined,
): FontoExemptions {
  const files = new Set(paths.filter((path) => DEVENO.test(path)));
  const ranges = new Map<string, [number, number][]>();
  const known = new Set(paths);
  for (const deveno of files) {
    const root = modeloRoot(deveno, known);
    if (root === undefined) continue;
    const valid = validFontoj(
      REGISTRY_PATHS.map((relative) => under(root, relative)).filter((path) => known.has(path)),
      text,
    );
    const core = CORE_PATHS.map((relative) => under(root, relative)).find((path) =>
      known.has(path),
    );
    const value = parse(text(deveno));
    const valoroj = isObject(value) && Array.isArray(value.valoroj) ? value.valoroj : [];
    const dir = dirname(deveno);
    for (const entry of valoroj) {
      if (!isObject(entry) || typeof entry.fonto !== "string" || !valid.has(entry.fonto)) continue;
      if (typeof entry.token !== "string" || typeof entry.aro !== "string") continue;
      const file =
        entry.aro === "core" ? core : `${dir === "." ? "" : `${dir}/`}sets/${entry.aro}.json`;
      const source = file === undefined ? undefined : text(file);
      if (file === undefined || source === undefined) continue;
      const tree = parseTree(source);
      const node = tree && findNodeAtLocation(tree, [...entry.token.split("."), "$value"]);
      if (node === undefined) continue;
      ranges.set(file, [...(ranges.get(file) ?? []), [node.offset, node.offset + node.length]]);
    }
  }
  return { files, ranges };
}
