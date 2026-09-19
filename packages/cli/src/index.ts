#!/usr/bin/env node
// Entry point of the `fm` binary: the only place that touches `process`. Everything below is
// caught here, so users see a message and an exit code, never a stack trace.
import { readFileSync } from "node:fs";
import { EXIT_USAGE } from "./command.js";

export type { CliContext, Command, CommandGroup } from "./command.js";

/** Version from the cli package.json (valid from both `src/` and `dist/`). */
export function cliVersion(): string {
  const pkg: unknown = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  if (
    typeof pkg === "object" &&
    pkg !== null &&
    "version" in pkg &&
    typeof pkg.version === "string"
  ) {
    return pkg.version;
  }
  throw new Error("the @fundamento/cli package.json has no version");
}

async function runFromProcess(): Promise<void> {
  // A closed pipe (e.g. `fm … | head`) is not worth reporting; anything else is, without a trace.
  process.stdout.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EPIPE") return;
    process.stderr.write(`fm: cannot write output: ${error.message}\n`);
    process.exitCode = EXIT_USAGE;
  });
  try {
    // Imported lazily so that even a broken `@fundamento/modelo` install is reported, not thrown.
    const { main } = await import("./cli.js");
    const initCwd = process.env.INIT_CWD;
    process.exitCode = main(process.argv.slice(2), {
      version: cliVersion(),
      baseDir: initCwd !== undefined && initCwd !== "" ? initCwd : process.cwd(),
      stdout: (text) => process.stdout.write(text),
      stderr: (text) => process.stderr.write(text),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    process.stderr.write(`fm: unexpected error: ${reason}\n`);
    process.exitCode = EXIT_USAGE;
  }
}

if (import.meta.main) {
  await runFromProcess();
}
