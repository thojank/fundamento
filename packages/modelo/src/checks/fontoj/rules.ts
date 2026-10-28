// The rules of check:fontoj (Spec 029 ①, Constitution v2.4, Art. V „Fonto" and Art. VII). Pure: the
// I/O edge (index.ts) hands in the documents. A Fonto is pinned (a version and a commit, exact
// package versions) and its copyright stands in the notices; every value taken from it names a
// listed Fonto, a token of its set and the value written there; an adapted value names its Jugxo.

import type { ValidationIssue } from "../../contracts/issues.js";

/** One document as read: its path relative to the Modelo root and its value. */
export interface FontojDocument {
  file: string;
  value: unknown;
}

export interface FontojInput {
  /** data/fontoj.json, absent in a Modelo that takes from no Fonto. */
  fontoj?: FontojDocument;
  /** The text of each notices file a Fonto names, by its path as written; undefined when missing. */
  notices: Record<string, string | undefined>;
  /** deveno.json of every Aspekto package that has one. */
  deveno: FontojDocument[];
  /** The tokens of every set by package-relative set name (`core`, `aspekto/komuna+…`), per deveno file. */
  sets: Record<string, Record<string, Record<string, unknown>>>;
  /** Every Jugxo ID the Modelo knows (data and packages). */
  jugxoj: ReadonlySet<string>;
}

export interface FontojStats {
  fontoj: number;
  valoroj: number;
  adaptitaj: number;
  [key: string]: number;
}

const VERSION = /^\d+\.\d+\.\d+$/;
const COMMIT = /^[0-9a-f]{40}$/;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const issue = (
  rule: string,
  path: string,
  message: string,
  suggestion: string,
): ValidationIssue => ({
  rule: rule as ValidationIssue["rule"],
  severity: "error",
  path,
  message,
  suggestion,
});

/** Values with sorted keys, so a recorded value compares with the written one whatever the order. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (isObject(value))
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])]),
    );
  return value;
}

/** The value as the provenance records it: an alias as written, a colour as hex, else JSON. */
function recorded(value: unknown): string {
  if (typeof value === "string") return value;
  if (isObject(value) && typeof value.hex === "string" && "colorSpace" in value) {
    return typeof value.alpha === "number" && value.alpha < 1
      ? JSON.stringify(canonical(value))
      : value.hex;
  }
  return JSON.stringify(canonical(value));
}

function sameValue(written: unknown, entry: string): boolean {
  if (recorded(written) === entry) return true;
  try {
    return JSON.stringify(canonical(JSON.parse(entry))) === JSON.stringify(canonical(written));
  } catch {
    return false;
  }
}

export function checkFontoj(input: FontojInput): { issues: ValidationIssue[]; stats: FontojStats } {
  const issues: ValidationIssue[] = [];
  const stats: FontojStats = { fontoj: 0, valoroj: 0, adaptitaj: 0 };
  const known = new Set<string>();
  const fontoj = isObject(input.fontoj?.value) ? input.fontoj?.value.fontoj : undefined;
  const fontojFile = input.fontoj?.file ?? "data/fontoj.json";
  (Array.isArray(fontoj) ? fontoj : []).forEach((fonto: unknown, index) => {
    if (!isObject(fonto) || typeof fonto.id !== "string") return;
    stats.fontoj++;
    known.add(fonto.id);
    const at = `${fontojFile}#/fontoj/${index}`;
    if (typeof fonto.version !== "string" || !VERSION.test(fonto.version)) {
      issues.push(
        issue(
          "fonto-unpinned",
          `${at}/version`,
          `The Fonto ${fonto.id} names the version ${JSON.stringify(fonto.version)}, not one version; a Fonto is taken from a pinned version (Art. V, Fonto 1).`,
          "Give the exact version that was read, e.g. 0.7.4; a later version comes only with a new spec.",
        ),
      );
    }
    if (typeof fonto.commit !== "string" || !COMMIT.test(fonto.commit)) {
      issues.push(
        issue(
          "fonto-unpinned",
          `${at}/commit`,
          `The Fonto ${fonto.id} names ${JSON.stringify(fonto.commit)} as its commit, not the 40 hex digits of one commit (Art. V, Fonto 1).`,
          "Give the full commit of the tag that was read (git rev-parse <tag>).",
        ),
      );
    }
    const packages = Array.isArray(fonto.packages) ? fonto.packages : [];
    packages.forEach((pkg: unknown, packageIndex) => {
      if (isObject(pkg) && (typeof pkg.version !== "string" || !VERSION.test(pkg.version))) {
        issues.push(
          issue(
            "fonto-unpinned",
            `${at}/packages/${packageIndex}/version`,
            `The package ${String(pkg.name)} of the Fonto ${fonto.id} names ${JSON.stringify(pkg.version)}, not one version.`,
            "Give the exact version of the package that was read.",
          ),
        );
      }
    });
    const notices = typeof fonto.notices === "string" ? input.notices[fonto.notices] : undefined;
    const copyright = typeof fonto.copyright === "string" ? fonto.copyright : "";
    const license = typeof fonto.license === "string" ? fonto.license : "";
    if (
      notices === undefined ||
      copyright === "" ||
      !notices.includes(copyright) ||
      !notices.includes(`fonto: ${fonto.id}`) ||
      !noticesHaveLicense(notices, license)
    ) {
      issues.push(
        issue(
          "fonto-notice-missing",
          `${at}/notices`,
          `The notices ${JSON.stringify(fonto.notices)} do not carry the copyright and the licence text of the Fonto ${fonto.id} (Art. V, Fonto 2).`,
          `Add a section \`fonto: ${fonto.id}\` with "${copyright}" and the full ${license} licence text to ${String(fonto.notices ?? "THIRD_PARTY_NOTICES.md")}.`,
        ),
      );
    }
  });

  for (const document of input.deveno) {
    const valoroj = isObject(document.value) ? document.value.valoroj : undefined;
    (Array.isArray(valoroj) ? valoroj : []).forEach((entry: unknown, index) => {
      if (!isObject(entry)) return;
      stats.valoroj++;
      const at = `${document.file}#/valoroj/${index}`;
      if (typeof entry.fonto !== "string" || !known.has(entry.fonto)) {
        issues.push(
          issue(
            "fonto-unknown",
            `${at}/fonto`,
            `${String(entry.token)} names the Fonto ${JSON.stringify(entry.fonto)}, which data/fontoj.json does not list (Art. V, Fonto 2).`,
            "List the Fonto in data/fontoj.json with its licence, version and commit, or correct the provenance.",
          ),
        );
      }
      const set = input.sets[`${document.file}|${String(entry.aro)}`];
      const token = set?.[String(entry.token)];
      if (token === undefined) {
        issues.push(
          issue(
            "deveno-token-unknown",
            `${at}/token`,
            `${String(entry.token)} is not a token of the set ${String(entry.aro)}; the provenance points at nothing (Art. VII).`,
            "Point the provenance at the token and the set that hold the taken value, or remove it.",
          ),
        );
      } else {
        const written =
          typeof entry.kampo === "string" && isObject(token.$value)
            ? token.$value[entry.kampo]
            : token.$value;
        if (typeof entry.valoro !== "string" || !sameValue(written, entry.valoro)) {
          issues.push(
            issue(
              "deveno-stale",
              `${at}/valoro`,
              `${String(entry.token)} in ${String(entry.aro)} is ${recorded(written)}, the provenance records ${String(entry.valoro)}; the value changed without its origin (Art. VII).`,
              "Record where the new value comes from, or restore the value the provenance names.",
            ),
          );
        }
      }
      if (entry.maniero === "adaptita") {
        stats.adaptitaj++;
        if (typeof entry.jugxo !== "string" || !input.jugxoj.has(entry.jugxo)) {
          issues.push(
            issue(
              "deveno-jugxo-missing",
              `${at}/jugxo`,
              `${String(entry.token)} departs from the Fonto (adaptita) but names ${entry.jugxo === undefined ? "no Jugxo" : `the unknown Jugxo ${String(entry.jugxo)}`}; a rule that wins is recorded as a Jugxo (Art. V, Fonto 5).`,
              "Record the deviation as a Jugxo (pnpm id:new jugxo) with its kialo and name it here.",
            ),
          );
        }
      }
    });
  }
  return { issues, stats };
}

/** The licence text is there: MIT by its first line, any other SPDX licence by its name. */
function noticesHaveLicense(notices: string, license: string): boolean {
  if (license === "MIT") return notices.includes("MIT License") && notices.includes("Permission");
  return license !== "" && notices.includes(license);
}
