// Spec 040 T-7 (C-4): the lines of the terse test output, shared by the reporters of Playwright
// (knapp-playwright.mjs) and Vitest (knapp-vitest.mjs). With FM_AUSGABE=knapp a run prints one
// line per red test with its first error, then one summary line:
//
//   ✘ <file>:<line> › <title>
//     <first error, at most 20 lines>
//   N bestanden, M rot, K übersprungen, F wackelig in X s · Protokoll: <path>
//
// The full report (JUnit, in CI also Playwright's HTML) lies under test-reports/ of the package,
// outside Playwright's outputDir (test-results/, emptied at the start of every run).
//
// Plain JavaScript with a .d.mts beside it, like scripts/ci/: Playwright, Vitest and Node load it
// as it is, and no package owns scripts/ to type-check it against @playwright/test or vitest.

import { isAbsolute, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { stripVTControlCharacters } from "node:util";

/** The value of FM_AUSGABE that switches to the terse output. */
export const KNAPP = "knapp";

/** The most lines of an error the terse output prints. */
export const MAX_FEHLER_ZEILEN = 20;

/** The folder of a package that holds the reports of its test runs (ignored by git). */
export const BERICHTE = "test-reports";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

/** Whether the environment asks for the terse output. */
export function istKnapp(env = process.env) {
  return env.FM_AUSGABE === KNAPP;
}

/** The JUnit file of a run, relative to its config: test-reports/<name>/junit.xml. */
export function junitDatei(name) {
  return `${BERICHTE}/${name}/junit.xml`;
}

/** A path as the output shows it: from the repository root, or whole when it lies outside. */
export function anzeigePfad(path) {
  const rel = relative(repoRoot, path).split("\\").join("/");
  return rel === "" || rel.startsWith("..") || isAbsolute(rel) ? path : rel;
}

/** `✘ <file>:<line> › <title>`; without a line, `✘ <file> › <title>`. */
export function fehlerZeile({ datei, zeile, titel }) {
  return `✘ ${datei}${zeile === undefined ? "" : `:${zeile}`} › ${titel}`;
}

/** A frame of the test tools, of Node or of no file, not of the code under test. */
function istFremd(line) {
  return /^\s*at .*(?:\/node_modules\/|\(?node:|<anonymous>)/.test(line);
}

/**
 * The first error of a red test, every line indented by two spaces: no colours, no blank lines, no
 * frames of node_modules or Node itself, paths from the repository root, at most
 * MAX_FEHLER_ZEILEN lines.
 */
export function fehlerText(text) {
  return stripVTControlCharacters(String(text ?? ""))
    .replace(/(?:file:\/\/)?(\/[^\s:()]+)/g, (_, path) => anzeigePfad(path))
    .split("\n")
    .filter((line) => line.trim() !== "" && !istFremd(line))
    .map((line) => line.trim())
    .slice(0, MAX_FEHLER_ZEILEN)
    .map((line) => `  ${line}`);
}

/** `N bestanden, M rot, K übersprungen, F wackelig in X s · Protokoll: <path>`. */
export function summenZeile({ bestanden, rot, uebersprungen, wackelig, ms, protokoll }) {
  const sekunden = (ms / 1000).toFixed(1);
  return `${bestanden} bestanden, ${rot} rot, ${uebersprungen} übersprungen, ${wackelig} wackelig in ${sekunden} s · Protokoll: ${protokoll}`;
}
