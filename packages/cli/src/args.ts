// Flag parsing for commands on top of `node:util` `parseArgs`, turning every problem into a
// UsageError with a "Did you mean …?" hint instead of a thrown Node error.
import { type ParseArgsOptionsConfig, parseArgs } from "node:util";
import { closest } from "./suggest.js";

/** A mistake in how `fm` was called. The CLI edge prints it and exits 2. */
export class UsageError extends Error {
  readonly hints: readonly string[];

  constructor(message: string, hints: readonly string[] = []) {
    super(message);
    this.name = "UsageError";
    this.hints = hints;
  }
}

export interface ParsedFlags {
  values: Readonly<Record<string, string | boolean | (string | boolean)[] | undefined>>;
  positionals: readonly string[];
}

/**
 * Parses `args` against `options` (long names only). Unknown flags, missing values and values
 * given to boolean flags all raise a UsageError that names the command line it belongs to.
 */
export function parseFlags(
  args: readonly string[],
  options: ParseArgsOptionsConfig,
  commandLine: string,
): ParsedFlags {
  const { tokens } = parseArgs({
    args: [...args],
    options,
    strict: false,
    allowPositionals: true,
    tokens: true,
  });
  for (const token of tokens) {
    if (token.kind === "option" && !Object.hasOwn(options, token.name)) {
      const known = Object.keys(options).map((name) => `--${name}`);
      const best = closest(token.rawName, known, (flag) => [flag]);
      throw new UsageError(
        `Unknown option '${token.rawName}' for \`${commandLine}\`.`,
        best === undefined ? [] : [`Did you mean \`${best}\`?`],
      );
    }
  }
  try {
    const { values, positionals } = parseArgs({
      args: [...args],
      options,
      strict: true,
      allowPositionals: true,
    });
    return { values, positionals };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new UsageError(`Invalid arguments for \`${commandLine}\`: ${reason}`);
  }
}
