// Types of messung.mjs for TypeScript consumers (the tests in packages/modelo).

export declare const EXIT_OK: 0;
export declare const EXIT_FAIL: 1;
export declare const EXIT_USAGE: 2;
export declare const HELP: string;
export declare const JOB_LIMIT_SECONDS: number;

/** One job as `gh run view <id> --json jobs` reports it; only these fields are read. */
export interface RunJob {
  readonly name: string;
  readonly startedAt?: string | null;
  readonly completedAt?: string | null;
}

export interface MeasuredRun {
  readonly id: string;
  readonly jobs: readonly RunJob[];
}

export declare function jobSeconds(job: RunJob): number | undefined;
export declare function runSeconds(jobs: readonly RunJob[]): number | undefined;
export declare function formatDuration(seconds: number): string;
export declare function median(values: readonly number[]): number | undefined;
export declare function measurementTable(runs: readonly MeasuredRun[]): string;

export interface MessungIo {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  /** Returns the parsed output of `gh run view <id> --json jobs`. */
  readRun?: (id: string) => { jobs: readonly RunJob[] };
}

export declare function main(argv: readonly string[], io: MessungIo): number;
