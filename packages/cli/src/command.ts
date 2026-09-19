// Shared shapes of the command tree. Commands depend on this file, never on cli.ts.

export const EXIT_OK = 0;
/** The checked thing is invalid (e.g. the Modelo has errors). */
export const EXIT_FAIL = 1;
/** Usage error, or `fm` could not run. */
export const EXIT_USAGE = 2;

export interface CliContext {
  /** Version of `@fundamento/cli`. */
  version: string;
  /** Directory relative paths resolve against: `INIT_CWD` when run through pnpm, else the cwd. */
  baseDir: string;
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

/** A runnable command. `help` is the full text for `--help`; `summary` is its one-line description. */
export interface Command {
  name: string;
  summary: string;
  help: string;
  run: (args: readonly string[], context: CliContext) => number | Promise<number>;
}

/** A named group of commands, e.g. `fm modelo <command>`. */
export interface CommandGroup {
  name: string;
  summary: string;
  commands: readonly Command[];
}
