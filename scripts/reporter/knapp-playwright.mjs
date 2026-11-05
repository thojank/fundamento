// Spec 040 T-7 (C-4): the reporters of a Playwright config, and the terse reporter itself.
//
// playwrightAusgabe(name) is the `reporter` of every Playwright config of the Eroj:
// - always JUnit, silently, to test-reports/<name>/junit.xml next to the config;
// - in CI also the HTML report (open: "never"; it prints nothing when CI is set) to
//   test-reports/<name>/html/ – locally it would print how to open it after every run;
// - with FM_AUSGABE=knapp the terse reporter below, otherwise Playwright's list reporter as before.
// Playwright resolves the relative paths against the directory of the config.

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  anzeigePfad,
  BERICHTE,
  fehlerText,
  fehlerZeile,
  istKnapp,
  junitDatei,
  summenZeile,
} from "./knapp.mjs";

/** This module, as the path a Playwright config names its reporter by. */
export const KNAPP_PLAYWRIGHT = fileURLToPath(import.meta.url);

/** The `reporter` of a Playwright config whose reports go to test-reports/<name>/. */
export function playwrightAusgabe(name, env = process.env) {
  const junit = junitDatei(name);
  return [
    istKnapp(env) ? [KNAPP_PLAYWRIGHT, { protokoll: junit }] : ["list"],
    ["junit", { outputFile: junit }],
    ...(env.CI ? [["html", { outputFolder: `${BERICHTE}/${name}/html`, open: "never" }]] : []),
  ];
}

/**
 * One line per red test with its first error, as soon as its last attempt has failed, and one
 * summary line at the end. In `--list` mode it leaves the output to Playwright's own listing.
 */
export class KnappPlaywright {
  /**
   * @param {{ protokoll?: string, configDir?: string, _mode?: string,
   *   schreiben?: (text: string) => void }} options
   */
  constructor(options = {}) {
    this.liste = options._mode === "list";
    this.protokoll = anzeigePfad(resolve(options.configDir ?? ".", options.protokoll ?? BERICHTE));
    this.schreiben = options.schreiben ?? ((text) => process.stdout.write(text));
    this.suite = undefined;
    this.mehrereProjekte = false;
    this.gemeldet = new Set();
    this.fehler = 0;
  }

  version() {
    return "v2";
  }

  printsToStdio() {
    return !this.liste;
  }

  onConfigure(config) {
    this.mehrereProjekte = config.projects.length > 1;
  }

  onBegin(suite) {
    this.suite = suite;
  }

  onTestEnd(test, result) {
    if (this.liste || result.retry < test.retries) return;
    if (test.outcome() === "unexpected") this.melde(test, result);
  }

  onError(error) {
    if (this.liste) return;
    this.fehler += 1;
    const datei = error.location ? anzeigePfad(error.location.file) : "(Playwright)";
    this.zeilen([
      fehlerZeile({ datei, zeile: error.location?.line, titel: "error outside a test" }),
      ...fehlerText(error.stack ?? error.message ?? error.value),
    ]);
  }

  onEnd(result) {
    if (this.liste) return;
    const zahl = { expected: 0, unexpected: 0, skipped: 0, flaky: 0 };
    for (const test of this.suite?.allTests() ?? []) {
      const outcome = test.outcome();
      zahl[outcome] += 1;
      // A red test whose last attempt never ended (interrupted, cut off): reported here.
      if (outcome === "unexpected" && !this.gemeldet.has(test))
        this.melde(test, test.results.at(-1));
    }
    this.zeilen([
      summenZeile({
        bestanden: zahl.expected,
        rot: zahl.unexpected + this.fehler,
        uebersprungen: zahl.skipped,
        wackelig: zahl.flaky,
        ms: result.duration,
        protokoll: this.protokoll,
      }),
    ]);
  }

  melde(test, result) {
    this.gemeldet.add(test);
    // The title path below the file: describes, then the test; the project when there are several.
    const titel = test.titlePath().slice(3).join(" › ");
    const projekt = this.mehrereProjekte ? ` [${test.parent.project()?.name ?? ""}]` : "";
    const [erster] = result?.errors ?? [];
    this.zeilen([
      fehlerZeile({
        datei: anzeigePfad(test.location.file),
        zeile: test.location.line,
        titel: `${titel}${projekt}`,
      }),
      ...fehlerText(erster?.stack ?? erster?.message ?? erster?.value ?? result?.status),
    ]);
  }

  zeilen(lines) {
    this.schreiben(`${lines.join("\n")}\n`);
  }
}

// biome-ignore lint/style/noDefaultExport: Playwright loads a reporter from the default export.
export default KnappPlaywright;
