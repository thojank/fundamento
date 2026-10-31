#!/usr/bin/env node
// Spec 036 Teil 6 (D-11): the codemod that gives the public repository neutral names. Runs over
// `git ls-files` of one checkout, applies the rule table of rules.mjs to every tracked text file
// except the exception list (verbatim spec copies, D-23) and the outputs of generators, writes a
// file only when its content changes, formats the changed files with the checkout's formatter and
// then reruns the generators that exist in the checkout.
// Deterministic and idempotent: a second run changes nothing. Touches nothing outside the
// checkout: no untracked or ignored file, no symlink, no path outside the root.
//
// Usage: node scripts/neutrale-namen/codemod.mjs [--root <dir>] [--dry-run | --check]
//        [--exceptions <file>] [--no-generators] [--json] [--help]
// Exit codes: 0 = done (or nothing to do), 1 = --check found changes, a generator failed or an
// old name is left that no rule can remove, 2 = usage or setup error.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { EXCEPTIONS_FILE, FORMATTER, GENERATORS, mapText, oldNames } from "./rules.mjs";

export const EXIT_OK = 0;
export const EXIT_FAIL = 1;
export const EXIT_USAGE = 2;

export const HELP = `Usage: node scripts/neutrale-namen/codemod.mjs [options]

Gives the checkout neutral names (Spec 036 Teil 6): the DTCG extension key, the schema IDs, the
ontology base, the private font repository and the remaining mentions of the old name. Runs over
\`git ls-files\`, skips the exception list (${EXCEPTIONS_FILE}) and the outputs of
generators, writes only on change, formats the changed files with the checkout's formatter
(Biome, if biome.json exists) and reruns the generators that exist (schema types, build,
Ero-Tokens). A second run changes nothing.

Options:
  --root <dir>         Checkout to rewrite (default: the git top level of the current directory).
  --dry-run            List what would change; write nothing, run no generator.
  --check              Like --dry-run, but exit 1 when anything would change.
  --exceptions <file>  Exception list (default: <root>/${EXCEPTIONS_FILE}).
  --no-generators      Run neither the formatter nor the generators (generated outputs are then
                       rewritten as text).
  --json               Print the report as JSON.
  -h, --help           Show this help.

Exit codes: 0 = done, 1 = --check found changes, a generator failed or an old name is left,
2 = usage or setup error.
`;

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/**
 * Valid UTF-8 text, else undefined: binary files are never rewritten. A NUL alone does not make a
 * file binary (two sources of the Modelo use it as a key separator in a template string).
 */
function decodeText(bytes) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return undefined;
  }
}

function git(root, args) {
  const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed in ${root}: ${result.stderr.trim()}`);
  }
  return result.stdout;
}

/** The tracked files of the checkout, sorted, relative with `/` separators. */
export function trackedFiles(root) {
  return git(root, ["ls-files", "-z"])
    .split("\0")
    .filter((path) => path !== "")
    .sort();
}

/** Reads the exception list: `{ escepoj: [{ path, sha256, kialo }] }` (shared with check:privat). */
export function readExceptions(file) {
  const value = JSON.parse(readFileSync(file, "utf8"));
  if (!Array.isArray(value?.escepoj)) throw new Error(`${file}: no "escepoj" array.`);
  return value.escepoj.map((entry) => {
    if (typeof entry?.path !== "string" || typeof entry?.kialo !== "string") {
      throw new Error(`${file}: every exception needs a path and a kialo.`);
    }
    return entry;
  });
}

/** Whether `path` (relative) stays inside `root` after resolving symlinks of its parents. */
function insideRoot(root, path) {
  if (isAbsolute(path) || path.split("/").includes("..")) return false;
  const absolute = resolve(root, path);
  let real;
  try {
    real = realpathSync(absolute);
  } catch {
    return false;
  }
  const rel = relative(realpathSync(root), real);
  return rel !== "" && !rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel);
}

function scriptExists(root, manifest, script) {
  const path = join(root, manifest);
  if (!existsSync(path)) return false;
  try {
    const scripts = JSON.parse(readFileSync(path, "utf8")).scripts;
    return typeof scripts?.[script] === "string";
  } catch {
    return false;
  }
}

const defaultRunCommand = (command, cwd) => {
  const [program, ...args] = command;
  const result = spawnSync(program, args, { cwd, stdio: ["ignore", "inherit", "inherit"] });
  return result.status ?? 1;
};

/** The content hashes of the tracked files (to report what the generators changed). */
function snapshot(root, files) {
  const hashes = new Map();
  for (const path of files) {
    const absolute = join(root, path);
    if (existsSync(absolute) && lstatSync(absolute).isFile()) {
      hashes.set(path, sha256(readFileSync(absolute)));
    }
  }
  return hashes;
}

/**
 * Runs the codemod over one checkout. Options: `root` (required), `dryRun`, `exceptionsFile`,
 * `generators` (default true), `runCommand(command, cwd) → exit code` (tests pass a double).
 * Returns the report; writes nothing when `dryRun` is set.
 */
export function runCodemod(options) {
  const root = resolve(options.root);
  const dryRun = options.dryRun === true;
  const exceptionsFile = options.exceptionsFile ?? join(root, EXCEPTIONS_FILE);
  if (!existsSync(exceptionsFile)) {
    throw new Error(
      `Exception list ${exceptionsFile} is missing; without it the verbatim specs would be rewritten.`,
    );
  }
  const exceptions = new Set(readExceptions(exceptionsFile).map((entry) => entry.path));
  const runCommand = options.runCommand ?? defaultRunCommand;
  const generators =
    (options.generators ?? true)
      ? GENERATORS.filter((generator) => scriptExists(root, generator.manifest, generator.script))
      : [];
  const generatedPrefixes = generators.flatMap((generator) => generator.outputs);
  const word = oldNames().word;

  const files = trackedFiles(root);
  const report = {
    root,
    dryRun,
    files: files.length,
    changed: [],
    skipped: { exceptions: [], generated: [], binary: [], outside: [] },
    pathsWithOldName: [],
    generators: [],
    generatedChanges: [],
    left: [],
  };

  for (const path of files) {
    if (path.toLowerCase().includes(word)) report.pathsWithOldName.push(path);
    if (exceptions.has(path)) {
      report.skipped.exceptions.push(path);
      continue;
    }
    const absolute = join(root, path);
    if (!existsSync(absolute) || !lstatSync(absolute).isFile() || !insideRoot(root, path)) {
      // A deleted file, a symlink, a submodule or anything that would leave the checkout.
      report.skipped.outside.push(path);
      continue;
    }
    const bytes = readFileSync(absolute);
    const text = decodeText(bytes);
    if (text === undefined) {
      if (bytes.toString("latin1").toLowerCase().includes(word)) report.skipped.binary.push(path);
      continue;
    }
    if (generatedPrefixes.some((prefix) => path.startsWith(prefix))) {
      if (text.toLowerCase().includes(word)) report.skipped.generated.push(path);
      continue;
    }
    const mapped = mapText(text, path);
    if (mapped.text === text) continue;
    report.changed.push({ path, counts: mapped.counts });
    if (!dryRun) writeFileSync(absolute, mapped.text);
  }

  const steps = [...generators];
  const formatter = (options.generators ?? true) && existsSync(join(root, FORMATTER.config));
  if (formatter && report.changed.length > 0) {
    steps.unshift({
      id: FORMATTER.id,
      command: [...FORMATTER.command, ...report.changed.map((change) => change.path)],
    });
  }
  if (!dryRun && steps.length > 0) {
    const before = snapshot(root, files);
    for (const generator of steps) {
      const code = runCommand(generator.command, root);
      const command =
        generator.id === FORMATTER.id
          ? `${FORMATTER.command.join(" ")} <${report.changed.length} changed files>`
          : generator.command.join(" ");
      report.generators.push({ id: generator.id, command, code });
      if (code !== 0) break;
    }
    const after = snapshot(root, files);
    for (const path of files) {
      if (before.get(path) !== after.get(path)) report.generatedChanges.push(path);
    }
  }

  // What no rule removed: generated outputs are checked after their generator ran.
  if (!dryRun) {
    for (const path of report.skipped.generated) {
      const text = decodeText(readFileSync(join(root, path)));
      if (text?.toLowerCase().includes(word)) report.left.push(path);
    }
  }
  return report;
}

/** Sum of all replacements of a report, per rule. */
export function totals(report) {
  const sums = {};
  for (const { counts } of report.changed) {
    for (const [rule, count] of Object.entries(counts)) sums[rule] = (sums[rule] ?? 0) + count;
  }
  return Object.fromEntries(Object.entries(sums).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

/** Whether the report is a failure for the exit code. */
export function failed(report, check) {
  return (
    (check && (report.changed.length > 0 || report.skipped.generated.length > 0)) ||
    report.generators.some((generator) => generator.code !== 0) ||
    report.skipped.binary.length > 0 ||
    report.pathsWithOldName.length > 0 ||
    report.left.length > 0
  );
}

export function formatReport(report) {
  const lines = [];
  const verb = report.dryRun ? "would change" : "changed";
  lines.push(`${report.changed.length} of ${report.files} tracked files ${verb}.`);
  for (const { path, counts } of report.changed) {
    const parts = Object.entries(counts).map(([rule, count]) => `${rule}=${count}`);
    lines.push(`  ${path}  ${parts.join(" ")}`);
  }
  const sums = Object.entries(totals(report)).map(([rule, count]) => `${rule}=${count}`);
  if (sums.length > 0) lines.push(`Replacements: ${sums.join(" ")}`);
  lines.push(`Exceptions left untouched: ${report.skipped.exceptions.length}`);
  for (const path of report.skipped.exceptions) lines.push(`  ${path}`);
  if (report.skipped.generated.length > 0) {
    lines.push(
      `Generated files ${report.dryRun ? "to be regenerated" : "regenerated"}: ${report.skipped.generated.length}`,
    );
    for (const path of report.skipped.generated) lines.push(`  ${path}`);
  }
  for (const generator of report.generators) {
    lines.push(`Generator ${generator.id} (${generator.command}): exit ${generator.code}`);
  }
  if (report.generatedChanges.length > 0) {
    lines.push(`Files changed by the generators: ${report.generatedChanges.length}`);
    for (const path of report.generatedChanges) lines.push(`  ${path}`);
  }
  for (const path of report.skipped.binary)
    lines.push(`ERROR binary file names the old name: ${path}`);
  for (const path of report.pathsWithOldName) lines.push(`ERROR path names the old name: ${path}`);
  for (const path of report.left) lines.push(`ERROR old name left after its generator: ${path}`);
  return `${lines.join("\n")}\n`;
}

function parseCli(argv) {
  return parseArgs({
    args: argv,
    allowPositionals: false,
    strict: true,
    options: {
      root: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      check: { type: "boolean", default: false },
      exceptions: { type: "string" },
      "no-generators": { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
}

/** The CLI: returns the exit code; output goes through `io.stdout`/`io.stderr`. */
export function main(argv, io) {
  let values;
  try {
    ({ values } = parseCli(argv));
  } catch (error) {
    io.stderr(`${error instanceof Error ? error.message : String(error)}\n${HELP}`);
    return EXIT_USAGE;
  }
  if (values.help) {
    io.stdout(HELP);
    return EXIT_OK;
  }
  let report;
  try {
    const root = values.root ?? git(io.cwd, ["rev-parse", "--show-toplevel"]).trim();
    report = runCodemod({
      root: resolve(io.cwd, root),
      dryRun: values["dry-run"] || values.check,
      exceptionsFile:
        values.exceptions === undefined ? undefined : resolve(io.cwd, values.exceptions),
      generators: !values["no-generators"],
      runCommand: io.runCommand,
    });
  } catch (error) {
    io.stderr(`${error instanceof Error ? error.message : String(error)}\n`);
    return EXIT_USAGE;
  }
  io.stdout(
    values.json
      ? `${JSON.stringify({ ...report, totals: totals(report) }, null, 2)}\n`
      : formatReport(report),
  );
  return failed(report, values.check) ? EXIT_FAIL : EXIT_OK;
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  process.exitCode = main(process.argv.slice(2), {
    cwd: process.cwd(),
    stdout: (text) => process.stdout.write(text),
    stderr: (text) => process.stderr.write(text),
  });
}
