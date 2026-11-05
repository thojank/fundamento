// Spec 040 T-7 (C-4): the reporters of a Vitest config, the terse reporter and a JUnit writer.
//
// vitestAusgabe(name, configDefaults.reporters) goes into `test` of every Vitest config:
// - always JunitVitest, which writes test-reports/<name>/junit.xml next to the config, silently –
//   Vitest's own junit reporter prints "JUNIT report written to …" after every run;
// - with FM_AUSGABE=knapp KnappVitest (and the location of every test for its lines), otherwise
//   the reporters Vitest chooses itself (configDefaults.reporters), so the output stays as it was.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { stripVTControlCharacters } from "node:util";
import {
  anzeigePfad,
  fehlerText,
  fehlerZeile,
  istKnapp,
  junitDatei,
  summenZeile,
} from "./knapp.mjs";

/** `reporters` (and, terse, `includeTaskLocation`) for `test` of a Vitest config. */
export function vitestAusgabe(name, standard, env = process.env) {
  const junit = new JunitVitest({ datei: junitDatei(name) });
  return istKnapp(env)
    ? {
        reporters: [new KnappVitest({ protokoll: junitDatei(name) }), junit],
        includeTaskLocation: true,
      }
    : { reporters: [...standard, junit] };
}

/** The title path of a test below its file: describes, then the test, joined by " › ". */
function titelpfad(task) {
  const names = [];
  for (let node = task; node !== undefined && node.type !== "module"; node = node.parent) {
    names.unshift(node.name);
  }
  return names.join(" › ");
}

/** The line of a test: its location, else the first frame of the error in its file. */
function zeileVon(testCase, error) {
  if (testCase.location !== undefined) return testCase.location.line;
  const frame = error?.stacks?.find((stack) => stack.file === testCase.module.moduleId);
  if (frame !== undefined) return frame.line;
  const file = testCase.module.moduleId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`${file}:(\\d+):\\d+`).exec(error?.stack ?? "");
  return match === null ? undefined : Number(match[1]);
}

/** Every test of the run with its state: passed, failed, skipped, pending (never run). */
function* alleTests(testModules) {
  for (const testModule of testModules) yield* testModule.children.allTests();
}

/** The suites and modules of the run that failed outside a test (a hook, an import). */
function* fehlerAusserhalb(testModules) {
  for (const testModule of testModules) {
    for (const suite of [testModule, ...testModule.children.allSuites()]) {
      for (const error of suite.errors()) yield { suite, error };
    }
  }
}

/**
 * One line per red test with its first error, as soon as it has failed for the last time, the
 * errors outside a test at the end, then one summary line.
 */
export class KnappVitest {
  /** @param {{ protokoll: string, schreiben?: (text: string) => void }} options */
  constructor({ protokoll, schreiben }) {
    this.protokoll = protokoll;
    this.schreiben = schreiben ?? ((text) => process.stdout.write(text));
    this.root = process.cwd();
    this.start = performance.now();
  }

  onInit(vitest) {
    this.root = vitest.config.root;
    this.start = performance.now();
  }

  onTestCaseResult(testCase) {
    const result = testCase.result();
    if (result.state !== "failed") return;
    const [erster] = result.errors;
    this.zeilen([
      fehlerZeile({
        datei: anzeigePfad(testCase.module.moduleId),
        zeile: zeileVon(testCase, erster),
        titel: titelpfad(testCase),
      }),
      ...fehlerText(erster?.stack ?? erster?.message),
    ]);
  }

  onTestRunEnd(testModules, unhandledErrors) {
    const zahl = { bestanden: 0, rot: 0, uebersprungen: 0, wackelig: 0 };
    for (const testCase of alleTests(testModules)) {
      const { state } = testCase.result();
      if (state === "failed") zahl.rot += 1;
      else if (state === "passed" && testCase.diagnostic()?.flaky) zahl.wackelig += 1;
      else if (state === "passed") zahl.bestanden += 1;
      else zahl.uebersprungen += 1;
    }
    for (const { suite, error } of fehlerAusserhalb(testModules)) {
      zahl.rot += 1;
      const datei = anzeigePfad(suite.type === "module" ? suite.moduleId : suite.module.moduleId);
      const titel = suite.type === "module" ? "error outside a test" : titelpfad(suite);
      this.zeilen([fehlerZeile({ datei, titel }), ...fehlerText(error.stack ?? error.message)]);
    }
    for (const error of unhandledErrors) {
      zahl.rot += 1;
      this.zeilen([
        fehlerZeile({ datei: "(Vitest)", titel: "unhandled error" }),
        ...fehlerText(error.stack ?? error.message),
      ]);
    }
    this.zeilen([
      summenZeile({
        ...zahl,
        ms: performance.now() - this.start,
        protokoll: anzeigePfad(resolve(this.root, this.protokoll)),
      }),
    ]);
  }

  zeilen(lines) {
    this.schreiben(`${lines.join("\n")}\n`);
  }
}

const XML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

/** Text for XML, without colours and without characters XML 1.0 does not allow. */
function xml(text) {
  return stripVTControlCharacters(String(text ?? ""))
    .replace(/[^\t\n\r\u0020-\uD7FF\uE000-\uFFFD]/gu, "")
    .replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char);
}

function attributes(values) {
  return Object.entries(values)
    .map(([key, value]) => `${key}="${xml(value)}"`)
    .join(" ");
}

const sekunden = (ms) => ((ms ?? 0) / 1000).toFixed(3);

/** A JUnit file of the run, written without a line on the console. */
export class JunitVitest {
  /** @param {{ datei: string }} options – relative to the root of the Vitest config */
  constructor({ datei }) {
    this.datei = datei;
    this.root = process.cwd();
  }

  onInit(vitest) {
    this.root = vitest.config.root;
  }

  onTestRunEnd(testModules, unhandledErrors) {
    const suites = [];
    const total = { tests: 0, failures: 0, errors: 0, skipped: 0, time: 0 };
    for (const testModule of testModules) {
      const datei = relative(this.root, testModule.moduleId).split("\\").join("/");
      const cases = [];
      const count = { tests: 0, failures: 0, errors: 0, skipped: 0 };
      for (const testCase of testModule.children.allTests()) {
        const result = testCase.result();
        const head = attributes({
          classname: datei,
          name: titelpfad(testCase),
          time: sekunden(testCase.diagnostic()?.duration),
        });
        count.tests += 1;
        if (result.state === "failed") {
          count.failures += 1;
          const [erster] = result.errors;
          cases.push(
            `    <testcase ${head}>\n      <failure ${attributes({ message: erster?.message, type: erster?.name ?? "Error" })}>${xml(erster?.stack ?? erster?.message)}</failure>\n    </testcase>`,
          );
        } else if (result.state === "skipped" || result.state === "pending") {
          count.skipped += 1;
          cases.push(`    <testcase ${head}>\n      <skipped/>\n    </testcase>`);
        } else {
          cases.push(`    <testcase ${head}/>`);
        }
      }
      for (const suite of [testModule, ...testModule.children.allSuites()]) {
        for (const error of suite.errors()) {
          count.errors += 1;
          const name = suite.type === "module" ? "error outside a test" : titelpfad(suite);
          cases.push(
            `    <testcase ${attributes({ classname: datei, name, time: "0.000" })}>\n      <error ${attributes({ message: error.message, type: error.name ?? "Error" })}>${xml(error.stack ?? error.message)}</error>\n    </testcase>`,
          );
        }
      }
      const time = testModule.diagnostic().duration;
      suites.push(
        `  <testsuite ${attributes({ name: datei, tests: count.tests, failures: count.failures, errors: count.errors, skipped: count.skipped, time: sekunden(time) })}>\n${cases.join("\n")}\n  </testsuite>`,
      );
      for (const key of ["tests", "failures", "errors", "skipped"]) total[key] += count[key];
      total.time += time;
    }
    if (unhandledErrors.length > 0) {
      const cases = unhandledErrors.map(
        (error) =>
          `    <testcase ${attributes({ classname: "unhandled errors", name: error.message, time: "0.000" })}>\n      <error ${attributes({ message: error.message, type: error.name ?? "Error" })}>${xml(error.stack ?? error.message)}</error>\n    </testcase>`,
      );
      suites.push(
        `  <testsuite ${attributes({ name: "unhandled errors", tests: unhandledErrors.length, failures: 0, errors: unhandledErrors.length, skipped: 0, time: "0.000" })}>\n${cases.join("\n")}\n  </testsuite>`,
      );
      total.tests += unhandledErrors.length;
      total.errors += unhandledErrors.length;
    }
    const head = attributes({ name: "vitest", ...total, time: sekunden(total.time) });
    const path = resolve(this.root, this.datei);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(
      path,
      `<?xml version="1.0" encoding="UTF-8"?>\n<testsuites ${head}>\n${suites.join("\n")}\n</testsuites>\n`,
    );
  }
}
