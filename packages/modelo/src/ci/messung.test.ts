// Spec 040 (C-5): the measurement tool scripts/ci/messung.mjs. The core is pure: the recorded
// output of `gh run view <id> --json jobs` (job names and timestamps only, three runs on `main`
// before PR A) goes in, a Markdown table comes out. No test here calls `gh` or the network.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  EXIT_FAIL,
  EXIT_OK,
  EXIT_USAGE,
  formatDuration,
  JOB_LIMIT_SECONDS,
  jobSeconds,
  type MeasuredRun,
  main,
  measurementTable,
  median,
  type RunJob,
  runSeconds,
} from "../../../../scripts/ci/messung.mjs";

const RUN_IDS = ["41827472808", "41842873743", "41873907893"] as const;

function recorded(id: string): { jobs: RunJob[] } {
  const url = new URL(`../../test/fixtures/ci/messung/${id}.json`, import.meta.url);
  return JSON.parse(readFileSync(url, "utf8")) as { jobs: RunJob[] };
}

const runs: MeasuredRun[] = RUN_IDS.map((id) => ({ id, jobs: recorded(id).jobs }));

/** The cells of the table row whose first cell is `label`. */
function row(table: string, label: string): string[] | undefined {
  for (const line of table.split("\n")) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells[0] === label) return cells.slice(1);
  }
  return undefined;
}

describe("the duration of one job", () => {
  it("is completedAt minus startedAt in whole seconds", () => {
    expect(
      jobSeconds({
        name: "a",
        startedAt: "2026-11-04T12:13:57Z",
        completedAt: "2026-11-04T12:29:13Z",
      }),
    ).toBe(916);
  });

  it("is unknown while the job has not started or not finished", () => {
    expect(jobSeconds({ name: "a" })).toBeUndefined();
    expect(jobSeconds({ name: "a", startedAt: "2026-11-04T12:13:57Z", completedAt: null })).toBe(
      undefined,
    );
    // gh reports an unset time as the zero date.
    expect(
      jobSeconds({
        name: "a",
        startedAt: "2026-11-04T12:13:57Z",
        completedAt: "0001-01-01T00:00:00Z",
      }),
    ).toBeUndefined();
  });

  it("formats as m:ss, minutes past the hour included", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(59)).toBe("0:59");
    expect(formatDuration(916)).toBe("15:16");
    expect(formatDuration(3725)).toBe("62:05");
  });

  it("knows the limit of every CI job, timeout-minutes: 15", () => {
    expect(JOB_LIMIT_SECONDS).toBe(15 * 60);
  });

  it("takes the wall clock of a run from the first start to the last end", () => {
    expect(runSeconds(recorded("41873907893").jobs)).toBe(15 * 60 + 22);
    expect(runSeconds([])).toBeUndefined();
  });
});

describe("the median", () => {
  it("is the middle value, or the rounded mean of the two middle values", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(3);
    expect(median([1, 2])).toBe(2);
    expect(median([])).toBeUndefined();
  });
});

describe("the measurement table of three runs on main before PR A", () => {
  const table = measurementTable(runs);

  it("has one column per run, then median and range", () => {
    const [header, rule] = table.split("\n");
    expect(header).toBe(`| Job | ${RUN_IDS.join(" | ")} | Median | Spannweite |`);
    expect(rule).toBe("|---|---|---|---|---|---|");
  });

  it("has one row per job name, sorted, a job missing from a run included", () => {
    const labels = table
      .split("\n")
      .slice(2)
      .filter((line) => line.startsWith("| "))
      .map((line) => line.split("|")[1]?.trim() ?? "");
    const jobs = labels.filter((label) => !label.startsWith("**"));
    expect(jobs).toHaveLength(15);
    expect(jobs).toEqual([...jobs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    expect(row(table, "Unit tests (ekranoj)")).toEqual(["–", "–", "0:38", "0:38", "0:38"]);
  });

  it("gives the duration per run with median and range", () => {
    expect(row(table, "Unit tests (cli)")).toEqual(["1:49", "1:34", "1:22", "1:34", "1:22–1:49"]);
    expect(row(table, "Build, lint and Modelo checks")).toEqual([
      "1:36",
      "1:25",
      "1:29",
      "1:29",
      "1:25–1:36",
    ]);
  });

  it("marks a job that ran into the 15-minute limit as aborted", () => {
    expect(row(table, "Rendered accessibility (Alirebleco of the Eroj)")).toEqual([
      "≥ 15:00 (abgebrochen)",
      "≥ 15:00 (abgebrochen)",
      "14:39",
      "≥ 15:00",
      "14:39–≥ 15:00",
    ]);
    expect(row(table, "Rendered checks (Vitrino)")).toEqual([
      "9:38",
      "12:30",
      "≥ 15:00 (abgebrochen)",
      "12:30",
      "9:38–≥ 15:00",
    ]);
  });

  it("ends with the wall clock of each run and the summed job time", () => {
    expect(row(table, "**Lauf gesamt** (erster Start bis letztes Ende)")).toEqual([
      "15:16",
      "15:17",
      "15:22",
      "15:17",
      "15:16–15:22",
    ]);
    expect(row(table, "**Jobzeit Summe**")).toEqual([
      "84:11",
      "89:58",
      "99:10",
      "89:58",
      "84:11–99:10",
    ]);
  });

  it("shows a job still running as running and leaves it out of median and range", () => {
    const running = measurementTable([
      {
        id: "1",
        jobs: [
          { name: "x", startedAt: "2026-11-04T10:00:00Z", completedAt: "2026-11-04T10:02:00Z" },
        ],
      },
      { id: "2", jobs: [{ name: "x", startedAt: "2026-11-04T11:00:00Z", completedAt: null }] },
    ]);
    expect(row(running, "x")).toEqual(["2:00", "läuft", "2:00", "2:00"]);
  });
});

describe("the CLI", () => {
  function run(argv: string[], readRun?: (id: string) => { jobs: readonly RunJob[] }) {
    let stdout = "";
    let stderr = "";
    const code = main(argv, {
      stdout: (text) => {
        stdout += text;
      },
      stderr: (text) => {
        stderr += text;
      },
      ...(readRun === undefined ? {} : { readRun }),
    });
    return { code, stdout, stderr };
  }

  it("prints the table of the given run IDs, read through the injected reader", () => {
    const read: string[] = [];
    const result = run([...RUN_IDS], (id) => {
      read.push(id);
      return recorded(id);
    });
    expect(result.code).toBe(EXIT_OK);
    expect(read).toEqual([...RUN_IDS]);
    expect(result.stdout).toBe(`${measurementTable(runs)}\n`);
  });

  it("rejects a call without run IDs or with an ID that is not a number", () => {
    expect(run([]).code).toBe(EXIT_USAGE);
    const bad = run(["41827472808", "main"], () => ({ jobs: [] }));
    expect(bad.code).toBe(EXIT_USAGE);
    expect(bad.stderr).toContain('"main"');
  });

  it("fails with the reader's message when a run cannot be read", () => {
    const result = run(["1"], () => {
      throw new Error("run 1 not found");
    });
    expect(result.code).toBe(EXIT_FAIL);
    expect(result.stderr).toContain("run 1 not found");
  });
});
