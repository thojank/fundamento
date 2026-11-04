// Spec 040 T-6 (C-2, B-3, US-5): which packages a change touches, and which engines it needs.
//
//   node scripts/ci/betroffen.mjs                    in CI: writes pakete, alle, engines to $GITHUB_OUTPUT
//   node scripts/ci/betroffen.mjs --lokal            against origin/main, uncommitted changes included
//   node scripts/ci/betroffen.mjs --lokal --ausfuehren   runs `turbo run test` on that set (pnpm test:betroffen)
//
// The decision (`decide`) is pure: the event, the changed files, the packages Turborepo calls
// affected and the root inputs of the test tasks go in, the outputs come out. git and Turborepo
// are called only at the edges (`collect`). Whenever the base is unclear, everything is affected
// (E-7); a changed root file makes everything affected too (E-8). Tested in
// packages/modelo/src/ci/betroffen.test.ts.

import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const EXIT_OK = 0;
export const EXIT_FAIL = 1;
export const EXIT_USAGE = 2;

export const ALL_ENGINES = "chromium firefox webkit";
export const CHROMIUM = "chromium";

/** Events that test everything: the merge run on main, the nightly run, a run on demand (AC-B4). */
export const FULL_EVENTS = ["push", "schedule", "workflow_dispatch"];

/** The events that test only what a change touches; any other event tests everything. */
export const AFFECTED_EVENTS = ["pull_request", "lokal"];

/** E-8: a change to one of these files reaches every package. */
export const ROOT_FILES = [
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "package.json",
  "turbo.json",
  "tsconfig.base.json",
  ".nvmrc",
  ".npmrc",
  "biome.json",
];

/** E-8: a change below one of these directories reaches every package. */
export const ROOT_DIRS = [".github/workflows/", "scripts/"];

/**
 * B-3 (V-8): on a pull request, Firefox and WebKit run only when a change lies where an
 * engine-specific defect can come from – the rendered Eroj, the projections, the values they
 * render, a Playwright config. Otherwise Chromium alone, as before on every pull request.
 */
export const ENGINE_DIRS = [
  "packages/eroj/",
  "packages/projekcioj/",
  "packages/vortaro/",
  /^packages\/aspekto-[^/]+\//,
];
const PLAYWRIGHT_CONFIG = /(?:^|\/)playwright(?:\.[^/]+)?\.config\.ts$/;

export const HELP = `Usage: node scripts/ci/betroffen.mjs [--lokal [--ausfuehren]]

Without options (in CI): decides from GITHUB_EVENT_NAME and GITHUB_BASE_REF and appends
pakete (JSON list), alle (true/false) and engines to $GITHUB_OUTPUT and a line to
$GITHUB_STEP_SUMMARY. push, schedule and workflow_dispatch test everything.

--lokal       base origin/main (fetched first), uncommitted and untracked changes included;
              prints the list.
--ausfuehren  with --lokal: runs \`turbo run test\` on the affected packages with FM_AUSGABE=knapp
              (pnpm test:betroffen).
`;

/** A changed file that reaches every package (E-8). */
export function isRootFile(file) {
  return ROOT_FILES.includes(file) || ROOT_DIRS.some((dir) => file.startsWith(dir));
}

/** A changed file that needs all three engines on a pull request (B-3, V-8). */
export function needsAllEngines(file) {
  if (PLAYWRIGHT_CONFIG.test(file)) return true;
  return ENGINE_DIRS.some((dir) =>
    typeof dir === "string" ? file.startsWith(dir) : dir.test(file),
  );
}

/**
 * A glob of a turbo.json input (relative to the repository root) as a regular expression: `**`
 * spans directories, `*` and `?` stay within one; a leading dot is matched like any character.
 */
export function globToRegExp(glob) {
  let source = "";
  for (let i = 0; i < glob.length; i += 1) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      const slashAfter = glob[i + 2] === "/";
      source += slashAfter ? "(?:.*/)?" : ".*";
      i += slashAfter ? 2 : 1;
    } else if (c === "*") {
      source += "[^/]*";
    } else if (c === "?") {
      source += "[^/]";
    } else {
      source += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`^${source}$`);
}

const ROOT_PREFIX = "$TURBO_ROOT$/";

/**
 * The files outside its own package that each package's test task hashes (turbo.json `inputs`
 * under `$TURBO_ROOT$`): a change there is a change of that test, not of the package's build, so
 * it adds that package alone, without its dependents. Negated inputs are kept with their `!`.
 */
export function rootTestInputs(turbo) {
  const tasks = turbo !== null && typeof turbo === "object" ? turbo.tasks : undefined;
  const result = {};
  if (tasks === null || typeof tasks !== "object") return result;
  for (const [id, task] of Object.entries(tasks)) {
    const match = /^(.+)#test$/.exec(id);
    if (match === null || !Array.isArray(task?.inputs)) continue;
    const globs = task.inputs
      .filter((input) => typeof input === "string")
      .map((input) => (input.startsWith("!") ? ["!", input.slice(1)] : ["", input]))
      .filter(([, input]) => input.startsWith(ROOT_PREFIX))
      .map(([not, input]) => `${not}${input.slice(ROOT_PREFIX.length)}`);
    if (globs.length > 0) result[match[1]] = globs;
  }
  return result;
}

/** The packages whose test task hashes one of the changed files from outside the package. */
export function readingPackages(changed, inputs) {
  const result = [];
  for (const [name, globs] of Object.entries(inputs)) {
    const include = globs.filter((glob) => !glob.startsWith("!")).map(globToRegExp);
    const exclude = globs
      .filter((glob) => glob.startsWith("!"))
      .map((g) => globToRegExp(g.slice(1)));
    const reads = changed.some(
      (file) => include.some((re) => re.test(file)) && !exclude.some((re) => re.test(file)),
    );
    if (reads) result.push(name);
  }
  return result.sort();
}

function sorted(names) {
  return [...new Set(names)].sort();
}

/**
 * The pure decision (C-2).
 *
 * @param input.event     GITHUB_EVENT_NAME, or "lokal"
 * @param input.base      the merge base, or undefined when it could not be found (E-7)
 * @param input.changed   changed files relative to the root (only read with a base)
 * @param input.affected  Turborepo's changed packages and their dependents (`...[<base>]`)
 * @param input.workspace every package of the workspace
 * @param input.inputs    rootTestInputs(turbo.json)
 * @returns { alle, pakete, engines, gruende }; with alle, pakete is the whole workspace
 */
export function decide({ event, base, changed = [], affected = [], workspace = [], inputs = {} }) {
  const all = (gruende, engines = ALL_ENGINES) => ({
    alle: true,
    pakete: sorted(workspace),
    engines,
    gruende,
  });
  if (!AFFECTED_EVENTS.includes(event)) {
    return all([`event ${event || "(none)"}: every package, every engine`]);
  }
  if (base === undefined) {
    return all(["no merge base found: every package, every engine (E-7)"]);
  }
  const engineFiles = changed.filter(needsAllEngines);
  const engines = engineFiles.length > 0 ? ALL_ENGINES : CHROMIUM;
  const engineGrund =
    engineFiles.length > 0
      ? `engines ${ALL_ENGINES}: ${engineFiles.slice(0, 3).join(", ")}${engineFiles.length > 3 ? ", …" : ""} (B-3)`
      : `engines ${CHROMIUM}: no change needs Firefox or WebKit (B-3)`;
  const rootFiles = changed.filter(isRootFile);
  if (rootFiles.length > 0) {
    const shown = `${rootFiles.slice(0, 5).join(", ")}${rootFiles.length > 5 ? ", …" : ""}`;
    return all([`root files changed: ${shown} (E-8)`, engineGrund], engines);
  }
  const pakete = sorted([...affected, ...readingPackages(changed, inputs)]);
  return {
    alle: false,
    pakete,
    engines,
    gruende: [
      `${changed.length} changed file(s), ${pakete.length} affected package(s)`,
      engineGrund,
    ],
  };
}

/** The lines for $GITHUB_OUTPUT. */
export function outputLines(decision) {
  return [
    `pakete=${JSON.stringify(decision.pakete)}`,
    `alle=${decision.alle ? "true" : "false"}`,
    `engines=${decision.engines}`,
  ].join("\n");
}

/** The human-readable report: log, step summary, `--lokal`. */
export function report(decision, base) {
  const lines = [
    `betroffen (base ${base ?? "unknown"}):`,
    `  alle: ${decision.alle}`,
    `  pakete: ${decision.pakete.length === 0 ? "(none)" : decision.pakete.join(" ")}`,
    `  engines: ${decision.engines}`,
    ...decision.gruende.map((grund) => `  - ${grund}`),
  ];
  return `${lines.join("\n")}\n`;
}

/**
 * The `turbo run test` arguments for a decision; undefined when nothing is affected. Spec 040 T-7:
 * Turborepo shows the logs of failed tasks only, as in CI – with FM_AUSGABE=knapp their red tests
 * and the summary line.
 */
export function testArgs(decision) {
  const run = ["run", "test", "--output-logs=errors-only"];
  if (decision.alle) return run;
  if (decision.pakete.length === 0) return undefined;
  return [...run, ...decision.pakete.map((name) => `--filter=${name}`)];
}

// ── I/O at the edges ────────────────────────────────────────────────────────────────────────────

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

/** The Turborepo binary of this workspace, run with Node (no pnpm, independent of the cwd). */
function defaultTurbo() {
  return [process.execPath, createRequire(import.meta.url).resolve("turbo/bin/turbo")];
}

function git(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function lines(text) {
  return text.split("\n").filter((line) => line !== "");
}

function turboPackages(turbo, args, cwd) {
  const [file, ...prefix] = turbo;
  const out = execFileSync(file, [...prefix, "ls", ...args, "--output=json"], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, TURBO_TELEMETRY_DISABLED: "1", DO_NOT_TRACK: "1" },
  });
  const parsed = JSON.parse(out.slice(out.indexOf("{")));
  return parsed.packages.items.map((item) => item.name);
}

/** The merge base with origin/<ref>, fetching the ref if it is missing; undefined on failure. */
function mergeBase(ref, cwd, log, fetchFirst) {
  const remote = `refs/remotes/origin/${ref}`;
  try {
    if (fetchFirst) {
      git(["fetch", "--quiet", "--no-tags", "origin", `+refs/heads/${ref}:${remote}`], cwd);
    } else {
      try {
        git(["rev-parse", "--verify", "--quiet", remote], cwd);
      } catch {
        git(["fetch", "--quiet", "--no-tags", "origin", `+refs/heads/${ref}:${remote}`], cwd);
      }
    }
    return git(["merge-base", remote, "HEAD"], cwd);
  } catch (error) {
    const reason = error instanceof Error ? (error.stderr || error.message).toString().trim() : "";
    log(
      `betroffen: no merge base with origin/${ref}${reason ? ` (${reason.split("\n")[0]})` : ""}`,
    );
    return undefined;
  }
}

/** The files changed since the base: committed, and with `lokal` uncommitted and untracked too. */
function changedFiles(base, cwd, lokal) {
  const committed = lokal
    ? git(["diff", "--name-only", "--no-renames", base], cwd)
    : git(["diff", "--name-only", "--no-renames", base, "HEAD"], cwd);
  const untracked = lokal ? git(["ls-files", "--others", "--exclude-standard"], cwd) : "";
  return sorted([...lines(committed), ...lines(untracked)]);
}

/**
 * Collects the facts with git and Turborepo, then decides. Any failure of the edges ends in
 * "everything" with its reason (E-7), never in fewer tests.
 */
export function collect({
  lokal = false,
  env = process.env,
  cwd = repoRoot,
  turbo,
  log = () => {},
}) {
  const event = lokal ? "lokal" : (env.GITHUB_EVENT_NAME ?? "");
  let workspace = [];
  let base;
  try {
    const turboCommand = turbo ?? defaultTurbo();
    workspace = turboPackages(turboCommand, [], cwd);
    if (!AFFECTED_EVENTS.includes(event)) return { decision: decide({ event, workspace }), base };
    const ref = lokal ? "main" : env.GITHUB_BASE_REF;
    if (lokal || ref) base = mergeBase(ref, cwd, log, lokal);
    else log("betroffen: GITHUB_BASE_REF is not set");
    if (base === undefined) {
      if (lokal) log("betroffen: origin/main not reachable – testing everything");
      return { decision: decide({ event, base, workspace }), base };
    }
    const changed = changedFiles(base, cwd, lokal);
    const inputs = rootTestInputs(JSON.parse(readFileSync(join(cwd, "turbo.json"), "utf8")));
    const early = decide({ event, base, changed, workspace, inputs });
    if (early.alle) return { decision: early, base };
    const affected = turboPackages(turboCommand, [`--filter=...[${base}]`], cwd);
    return { decision: decide({ event, base, changed, affected, workspace, inputs }), base };
  } catch (error) {
    log(`betroffen: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`);
    return { decision: decide({ event, base: undefined, workspace }), base: undefined };
  }
}

/**
 * @param io.stdout, io.stderr  output
 * @param io.env      the environment (GITHUB_*, PLAYWRIGHT_ENGINES)
 * @param io.cwd      the repository root
 * @param io.turbo    the Turborepo command (default: this workspace's binary through Node)
 * @param io.run      runs `turbo run test …`; returns the exit code (default: spawns, inherits stdio)
 */
export function main(argv, io) {
  if (argv.includes("--help") || argv.includes("-h")) {
    io.stdout(HELP);
    return EXIT_OK;
  }
  const unknown = argv.find((arg) => arg !== "--lokal" && arg !== "--ausfuehren");
  if (unknown !== undefined) {
    io.stderr(`Unknown option: "${unknown}"\n${HELP}`);
    return EXIT_USAGE;
  }
  const lokal = argv.includes("--lokal");
  const ausfuehren = argv.includes("--ausfuehren");
  if (ausfuehren && !lokal) {
    io.stderr(`--ausfuehren needs --lokal\n${HELP}`);
    return EXIT_USAGE;
  }
  const env = io.env ?? process.env;
  const { decision, base } = collect({
    lokal,
    env,
    cwd: io.cwd ?? repoRoot,
    turbo: io.turbo,
    log: (line) => io.stdout(`${line}\n`),
  });
  const text = report(decision, base);
  io.stdout(text);

  if (!lokal) {
    if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `${outputLines(decision)}\n`);
    if (env.GITHUB_STEP_SUMMARY) {
      appendFileSync(env.GITHUB_STEP_SUMMARY, `\`\`\`\n${text}\`\`\`\n`);
    }
    return EXIT_OK;
  }
  if (!ausfuehren) return EXIT_OK;

  const args = testArgs(decision);
  if (args === undefined) {
    io.stdout("betroffen: no package affected, no test to run\n");
    return EXIT_OK;
  }
  // The engines a pull request with these changes would run, unless the caller chose them.
  const runEnv = {
    ...env,
    FM_AUSGABE: "knapp",
    PLAYWRIGHT_ENGINES: env.PLAYWRIGHT_ENGINES || decision.engines,
  };
  const run =
    io.run ??
    ((turboArgs, childEnv) => {
      const [file, ...prefix] = io.turbo ?? defaultTurbo();
      const child = spawnSync(file, [...prefix, ...turboArgs], {
        cwd: io.cwd ?? repoRoot,
        env: childEnv,
        stdio: "inherit",
      });
      return child.status ?? EXIT_FAIL;
    });
  io.stdout(
    `betroffen: turbo ${args.join(" ")} (PLAYWRIGHT_ENGINES=${runEnv.PLAYWRIGHT_ENGINES})\n`,
  );
  return run(args, runEnv);
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  process.exitCode = main(process.argv.slice(2), {
    stdout: (text) => process.stdout.write(text),
    stderr: (text) => process.stderr.write(text),
  });
}
