// Types of betroffen.mjs for TypeScript consumers (the tests in packages/modelo).

export declare const EXIT_OK: 0;
export declare const EXIT_FAIL: 1;
export declare const EXIT_USAGE: 2;
export declare const ALL_ENGINES: "chromium firefox webkit";
export declare const CHROMIUM: "chromium";
export declare const FULL_EVENTS: readonly string[];
export declare const AFFECTED_EVENTS: readonly string[];
export declare const ROOT_FILES: readonly string[];
export declare const ROOT_DIRS: readonly string[];
export declare const ENGINE_DIRS: ReadonlyArray<string | RegExp>;
export declare const HELP: string;

/** The outputs of the job `betroffen` (C-2), plus the reasons for the log. */
export interface Decision {
  readonly alle: boolean;
  readonly pakete: readonly string[];
  readonly engines: "chromium" | "chromium firefox webkit";
  readonly gruende: readonly string[];
}

export interface DecideInput {
  /** GITHUB_EVENT_NAME, or "lokal". */
  readonly event: string;
  /** The merge base; undefined when it could not be found (E-7). */
  readonly base?: string;
  readonly changed?: readonly string[];
  /** Turborepo's changed packages and their dependents. */
  readonly affected?: readonly string[];
  readonly workspace?: readonly string[];
  /** rootTestInputs(turbo.json). */
  readonly inputs?: Readonly<Record<string, readonly string[]>>;
}

export declare function isRootFile(file: string): boolean;
export declare function needsAllEngines(file: string): boolean;
export declare function globToRegExp(glob: string): RegExp;
export declare function rootTestInputs(turbo: unknown): Record<string, string[]>;
export declare function readingPackages(
  changed: readonly string[],
  inputs: Readonly<Record<string, readonly string[]>>,
): string[];
export declare function decide(input: DecideInput): Decision;
export declare function outputLines(decision: Decision): string;
export declare function report(decision: Decision, base: string | undefined): string;
export declare function testArgs(decision: Decision): string[] | undefined;

export interface CollectOptions {
  readonly lokal?: boolean;
  readonly env?: Readonly<Record<string, string | undefined>>;
  /** The repository root. */
  readonly cwd?: string;
  /** The Turborepo command (default: this workspace's binary through Node). */
  readonly turbo?: readonly string[];
  readonly log?: (line: string) => void;
}

export declare function collect(options: CollectOptions): {
  decision: Decision;
  base: string | undefined;
};

export interface BetroffenIo {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  env?: Readonly<Record<string, string | undefined>>;
  cwd?: string;
  turbo?: readonly string[];
  /** Runs `turbo <args>`; returns the exit code. */
  run?: (args: readonly string[], env: Readonly<Record<string, string | undefined>>) => number;
}

export declare function main(argv: readonly string[], io: BetroffenIo): number;
