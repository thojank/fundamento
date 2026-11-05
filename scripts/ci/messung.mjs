// Spec 040 (C-5): the duration of every CI job across a few runs, as a Markdown table for
// specs/040-ci-schneller/plan.md › "Messungen". Read-only: it calls `gh run view <id> --json jobs`
// and nothing else on GitHub.
//
//   node scripts/ci/messung.mjs <run-id> [<run-id> …]
//
// The core (`measurementTable`) is pure — parsed `gh` JSON in, Markdown out — and is tested from
// recorded runs in packages/modelo/src/ci/messung.test.ts.

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const EXIT_OK = 0;
export const EXIT_FAIL = 1;
export const EXIT_USAGE = 2;

export const HELP = `Usage: node scripts/ci/messung.mjs <run-id> [<run-id> …]

Prints one row per job name and one column per run with the duration completedAt − startedAt
(m:ss), then median and range. A job that ran into the limit (timeout-minutes: 15) shows as
"≥ 15:00 (abgebrochen)". Reads each run with \`gh run view <id> --json jobs\`.
`;

/** Every job of ci.yml runs with `timeout-minutes: 15`; a job this long was cut off. */
export const JOB_LIMIT_SECONDS = 15 * 60;

const LIMIT_TEXT = `≥ ${formatDuration(JOB_LIMIT_SECONDS)}`;
const RUN_ROW = "**Lauf gesamt** (erster Start bis letztes Ende)";
const SUM_ROW = "**Jobzeit Summe**";

/** A timestamp of gh, or undefined when unset (missing, null or gh's zero date). */
function time(value) {
  if (typeof value !== "string" || value.startsWith("0001-")) return undefined;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? undefined : ms;
}

/** completedAt − startedAt in whole seconds; undefined while not started or not finished. */
export function jobSeconds(job) {
  const start = time(job.startedAt);
  const end = time(job.completedAt);
  if (start === undefined || end === undefined) return undefined;
  return Math.round((end - start) / 1000);
}

/** First start to last end of a run; undefined when a job has not finished (or no jobs). */
export function runSeconds(jobs) {
  if (jobs.length === 0) return undefined;
  let first = Number.POSITIVE_INFINITY;
  let last = Number.NEGATIVE_INFINITY;
  for (const job of jobs) {
    const start = time(job.startedAt);
    const end = time(job.completedAt);
    if (start === undefined || end === undefined) return undefined;
    first = Math.min(first, start);
    last = Math.max(last, end);
  }
  return Math.round((last - first) / 1000);
}

/** Seconds as m:ss; minutes are not wrapped into hours. */
export function formatDuration(seconds) {
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

/** The middle value; for an even count the mean of the two middle values, rounded. */
export function median(values) {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

/** A job duration; at or past the limit only the limit is meaningful. */
function jobValue(seconds) {
  return seconds >= JOB_LIMIT_SECONDS ? LIMIT_TEXT : formatDuration(seconds);
}

/** The median and range cells of a row; `format` renders one value. */
function summary(values, format) {
  if (values.length === 0) return ["–", "–"];
  const low = Math.min(...values);
  const high = Math.max(...values);
  const range = low === high ? format(low) : `${format(low)}–${format(high)}`;
  return [format(median(values)), range];
}

const byCodePoint = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * The Markdown table: one row per job name (sorted by code point), one column per run, then
 * median and range; a job missing from a run is "–", one not yet finished "läuft". Two rows
 * close it: the wall clock of each run and the summed job time (runner minutes).
 */
export function measurementTable(runs) {
  const names = [...new Set(runs.flatMap((run) => run.jobs.map((job) => job.name)))].sort(
    byCodePoint,
  );
  const lines = [
    `| Job | ${runs.map((run) => run.id).join(" | ")} | Median | Spannweite |`,
    `|${"---|".repeat(runs.length + 3)}`,
  ];
  for (const name of names) {
    const cells = [];
    const values = [];
    for (const run of runs) {
      const job = run.jobs.find((candidate) => candidate.name === name);
      if (job === undefined) {
        cells.push("–");
        continue;
      }
      const seconds = jobSeconds(job);
      if (seconds === undefined) {
        cells.push("läuft");
        continue;
      }
      values.push(seconds);
      cells.push(seconds >= JOB_LIMIT_SECONDS ? `${LIMIT_TEXT} (abgebrochen)` : jobValue(seconds));
    }
    lines.push(`| ${[name, ...cells, ...summary(values, jobValue)].join(" | ")} |`);
  }
  const totals = [
    [RUN_ROW, (run) => runSeconds(run.jobs)],
    [
      SUM_ROW,
      (run) => {
        const seconds = run.jobs.map(jobSeconds);
        return seconds.includes(undefined) ? undefined : seconds.reduce((a, b) => a + b, 0);
      },
    ],
  ];
  for (const [label, measure] of totals) {
    const perRun = runs.map(measure);
    const values = perRun.filter((value) => value !== undefined);
    const cells = perRun.map((value) => (value === undefined ? "läuft" : formatDuration(value)));
    lines.push(`| ${[label, ...cells, ...summary(values, formatDuration)].join(" | ")} |`);
  }
  return lines.join("\n");
}

function ghRun(id) {
  const out = execFileSync("gh", ["run", "view", id, "--json", "jobs"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return JSON.parse(out);
}

/** The CLI: returns the exit code; output goes through `io.stdout`/`io.stderr`. */
export function main(argv, io) {
  if (argv.includes("--help") || argv.includes("-h")) {
    io.stdout(HELP);
    return EXIT_OK;
  }
  if (argv.length === 0) {
    io.stderr(`No run ID given.\n${HELP}`);
    return EXIT_USAGE;
  }
  const bad = argv.find((arg) => !/^\d+$/.test(arg));
  if (bad !== undefined) {
    io.stderr(`Not a run ID: "${bad}"\n${HELP}`);
    return EXIT_USAGE;
  }
  const readRun = io.readRun ?? ghRun;
  const runs = [];
  try {
    for (const id of argv) runs.push({ id, jobs: readRun(id).jobs });
  } catch (error) {
    io.stderr(`${error instanceof Error ? error.message : String(error)}\n`);
    return EXIT_FAIL;
  }
  io.stdout(`${measurementTable(runs)}\n`);
  return EXIT_OK;
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  process.exitCode = main(process.argv.slice(2), {
    stdout: (text) => process.stdout.write(text),
    stderr: (text) => process.stderr.write(text),
  });
}
