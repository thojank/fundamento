// Starting the configurator from a command line: shared by `fm metiejo` (Spec 023, K-1). The
// checkout root is this package's repository; its .env is the only source of settings (§4.3); the
// brands live outside it (FM_MARKEN_DIR, O-3). Logs go to stderr, never a value of the .env.

import { execFile } from "node:child_process";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { markenDirOf, readSettings } from "./env.js";
import { defaultDeps } from "./privata.js";
import { CHECKOUT_ROOT } from "./root.js";
import { startServilo } from "./servilo.js";
import { defaultNpmDeps } from "./tiparoj-npm.js";

export const DEFAULT_PORT = 7301;

/** The flags, in `node:util` parseArgs form. */
export const METIEJO_FLAGS = {
  port: { type: "string" },
  workdir: { type: "string" },
  open: { type: "boolean" },
} as const;

export function metiejoHelp(commandLine: string): string {
  return `${commandLine}: The brand configurator (Metiejo, Spec 023) as a local server.

Usage: ${commandLine} [--port <n>] [--workdir <dir>] [--open]

Step by step from a name and a lead colour to a checked Aspekto package: colour, webfont with
licence or a licensed font in your private repository, form, space, type and icons, the preview
in the five Sxablonoj, the report in plain words, the save and the exports (package, CSS, Figma
plugin). Open http://localhost:${DEFAULT_PORT} in a browser on this machine; the server answers
loopback requests only.

Settings come from the .env in the root of the checkout (see .env.example): FM_TIPAROJ_REPO names
the private repository of licensed fonts; without it their upload is locked. No value is logged.

Options:
  --port <n>       The port (default: ${DEFAULT_PORT})
  --workdir <dir>  Where the brands live (default: FM_MARKEN_DIR, else ~/Fundamento/marken; never inside the checkout)
  --open           Open the browser (macOS)
  -h, --help       Show this help

Exit codes: 0 stopped, 1 the server could not start, 2 usage error.
`;
}

export interface MetiejoOptions {
  port: number;
  workdir?: string;
  open: boolean;
}

/** A mistake in the flags; `hints` are extra lines such as "Did you mean …?". */
export class MetiejoUsageError extends Error {
  readonly hints: readonly string[];
  constructor(message: string, hints: readonly string[] = []) {
    super(message);
    this.name = "MetiejoUsageError";
    this.hints = hints;
  }
}

/** Checks parsed flag values; relative paths resolve against `baseDir`. */
export function metiejoOptions(
  values: Readonly<Record<string, unknown>>,
  positionals: readonly string[],
  baseDir: string,
  commandLine: string,
): MetiejoOptions {
  if (positionals.length > 0) {
    throw new MetiejoUsageError(
      `\`${commandLine}\` takes no arguments, got: ${positionals.join(" ")}.`,
      [`Run \`${commandLine} --help\` for its options.`],
    );
  }
  let port = DEFAULT_PORT;
  if (typeof values.port === "string") {
    port = Number(values.port);
    if (!/^\d+$/.test(values.port) || port < 1 || port > 65_535) {
      throw new MetiejoUsageError(
        `--port must be a port number from 1 to 65535, got '${values.port}'.`,
      );
    }
  }
  const options: MetiejoOptions = { port, open: values.open === true };
  if (typeof values.workdir === "string") options.workdir = resolve(baseDir, values.workdir);
  return options;
}

export interface MetiejoIo {
  stderr: (text: string) => void;
}

/** Runs the server until the process is signalled. */
export async function runMetiejo(
  options: MetiejoOptions,
  io: MetiejoIo,
  name: string,
): Promise<number> {
  const root = CHECKOUT_ROOT;
  const settings = readSettings(root);
  const workdir = options.workdir ?? markenDirOf(settings, homedir(), root);
  let servilo: Awaited<ReturnType<typeof startServilo>>;
  try {
    servilo = await startServilo(
      {
        port: options.port,
        workdir,
        root,
        settings,
        npm: defaultNpmDeps(),
        ...(settings.tiparojRepo === undefined ? {} : { deps: defaultDeps(settings.tiparojRepo) }),
      },
      io,
    );
  } catch (error) {
    io.stderr(
      `${name}: the server could not start: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    return 1;
  }
  if (options.open && process.platform === "darwin") {
    execFile("open", [`http://localhost:${servilo.port}`], () => undefined);
  }
  await new Promise<void>((done) => {
    for (const signal of ["SIGINT", "SIGTERM"] as const) process.once(signal, () => done());
  });
  await servilo.close();
  return 0;
}
