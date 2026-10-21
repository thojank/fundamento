// `fm metiejo [--port <n>] [--workdir <dir>] [--open]`: the brand configurator (Spec 023, K-1) as
// a local server, the same as `pnpm fm metiejo` runs it.
import {
  METIEJO_FLAGS,
  MetiejoUsageError,
  metiejoHelp,
  metiejoOptions,
  runMetiejo,
} from "@fundamento/metiejo";
import { parseFlags, UsageError } from "../args.js";
import type { CliContext, Command } from "../command.js";

const COMMAND_LINE = "fm metiejo";

async function run(args: readonly string[], context: CliContext): Promise<number> {
  const { values, positionals } = parseFlags(args, METIEJO_FLAGS, COMMAND_LINE);
  let options: ReturnType<typeof metiejoOptions>;
  try {
    options = metiejoOptions(values, positionals, context.baseDir, COMMAND_LINE);
  } catch (error) {
    if (error instanceof MetiejoUsageError) throw new UsageError(error.message, error.hints);
    throw error;
  }
  return runMetiejo(options, { stderr: context.stderr }, COMMAND_LINE);
}

export const metiejo: Command = {
  name: "metiejo",
  summary: "Run the brand configurator (Metiejo) as a local server on 127.0.0.1 (Spec 023).",
  help: metiejoHelp(COMMAND_LINE),
  run,
};
