// Fontoj check (Spec 029 ①, Constitution v2.4). Reads data/fontoj.json of the repo Modelo (or of the
// `--fixture` root), the notices each Fonto names, the deveno.json of every Aspekto package and the
// sets their values sit in — strictly parsed, without loading the Modelo, so the check works even
// when the rest is broken. It is the contract the CI holds every taken value to: a pinned Fonto
// with its licence text, a provenance that still matches the Aspekto, and a Jugxo for every value
// a rule changed.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import type { ValidationIssue } from "../../contracts/issues.js";
import { modeloRootOf, relativeModeloPath } from "../../load/source.js";
import { readStrictJsonFile } from "../parity/read-json.js";
import { checkSource } from "../source.js";
import { checkFontoj, type FontojDocument } from "./rules.js";

export * from "./rules.js";

export const FONTOJ_FILE_NAME = "fontoj.json";
export const DEVENO_FILE_NAME = "deveno.json";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The tokens of a set document by dotted name (a member with `$value` is a token). */
function tokensOf(value: unknown, prefix: string[] = []): Record<string, Record<string, unknown>> {
  if (!isObject(value)) return {};
  if ("$value" in value) return { [prefix.join(".")]: value };
  return Object.assign(
    {},
    ...Object.entries(value)
      .filter(([key]) => !key.startsWith("$"))
      .map(([key, child]) => tokensOf(child, [...prefix, key])),
  );
}

/** A notices file named relative to the Modelo: the nearest ancestor of the data directory holding it. */
function findNotices(dataDir: string, name: string): string | undefined {
  let dir = dataDir;
  for (let depth = 0; depth < 6; depth++) {
    const path = join(dir, name);
    if (existsSync(path)) return readFileSync(path, "utf8");
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

function idsOf(path: string): string[] {
  if (!existsSync(path)) return [];
  const value: unknown = JSON.parse(readFileSync(path, "utf8"));
  const jugxoj = isObject(value) && Array.isArray(value.jugxoj) ? value.jugxoj : [];
  return jugxoj.flatMap((jugxo: unknown) =>
    isObject(jugxo) && typeof jugxo.id === "string" ? [jugxo.id] : [],
  );
}

export async function check(options: CheckOptions): Promise<CheckResult> {
  const source = checkSource(options);
  const root = modeloRootOf(source);
  const readIssues: ValidationIssue[] = [];
  const read = (path: string): FontojDocument | undefined => {
    const file = relativeModeloPath(root, path);
    const parsed = readStrictJsonFile(path, file);
    readIssues.push(...parsed.issues);
    return parsed.issues.length === 0 ? { file, value: parsed.value } : undefined;
  };

  const fontojPath = join(source.dataDir, FONTOJ_FILE_NAME);
  const fontoj = existsSync(fontojPath) ? read(fontojPath) : undefined;
  const notices: Record<string, string | undefined> = {};
  const list =
    isObject(fontoj?.value) && Array.isArray(fontoj.value.fontoj) ? fontoj.value.fontoj : [];
  for (const fonto of list) {
    if (isObject(fonto) && typeof fonto.notices === "string" && !(fonto.notices in notices)) {
      notices[fonto.notices] = findNotices(source.dataDir, fonto.notices);
    }
  }

  const deveno: FontojDocument[] = [];
  const sets: Record<string, Record<string, Record<string, unknown>>> = {};
  const jugxoj = new Set(idsOf(join(source.dataDir, "jugxoj.json")));
  for (const dir of source.aspektoPackages ?? []) {
    for (const id of idsOf(join(dir, "jugxoj.json"))) jugxoj.add(id);
    const path = join(dir, DEVENO_FILE_NAME);
    if (!existsSync(path)) continue;
    const document = read(path);
    if (document === undefined) continue;
    deveno.push(document);
    const valoroj =
      isObject(document.value) && Array.isArray(document.value.valoroj)
        ? document.value.valoroj
        : [];
    for (const entry of valoroj) {
      const aro = isObject(entry) && typeof entry.aro === "string" ? entry.aro : undefined;
      const key = `${document.file}|${aro}`;
      if (aro === undefined || key in sets) continue;
      const setPath =
        aro === "core"
          ? join(source.vortaroDir, "sets", "core.json")
          : join(dir, "sets", `${aro}.json`);
      sets[key] = existsSync(setPath) ? tokensOf(JSON.parse(readFileSync(setPath, "utf8"))) : {};
    }
  }

  const { issues, stats } = checkFontoj({
    ...(fontoj === undefined ? {} : { fontoj }),
    notices,
    deveno,
    sets,
    jugxoj,
  });
  const errors = [...readIssues, ...issues];
  const ok = errors.length === 0;
  const names = list
    .flatMap((fonto: unknown) =>
      isObject(fonto) && typeof fonto.id === "string"
        ? [`${fonto.id} ${String(fonto.version)}`]
        : [],
    )
    .join(", ");
  const counts = `${stats.fontoj} Fonto(j)${names === "" ? "" : ` (${names})`}, ${stats.valoroj} taken value(s), ${stats.adaptitaj} adapted`;
  return {
    check: "fontoj",
    ok,
    summary: ok
      ? `${counts}: every Fonto pinned with its licence text, every value with its origin, every adaptation with its Jugxo.`
      : `${counts}: ${errors.length} issue(s).`,
    errors,
    warnings: [],
    stats,
  };
}
