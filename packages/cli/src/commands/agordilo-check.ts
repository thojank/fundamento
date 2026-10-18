// `fm agordilo check <dir> [--json]`: runs the checks of a derived Aspekto package again and
// compares the result with the report it ships (Spec 016, G8). A package whose tokens or report
// were edited by hand, or that no longer holds against today's rules, fails.
import { resolve } from "node:path";
import { checkPackageDir } from "@fundamento/agordilo";
import { parseFlags, UsageError } from "../args.js";
import { type CliContext, type Command, EXIT_FAIL, EXIT_OK } from "../command.js";
import { formatIssue } from "./modelo-validate.js";

const COMMAND_LINE = "fm agordilo check";

const HELP = `${COMMAND_LINE}: Check a derived Aspekto package against its shipped report.

Usage: ${COMMAND_LINE} <dir> [--json]

Reads the package with the core, runs every check again (KontrastParoj in every combination,
kontrastSojloj, contrast-reserve, text-hierarchy, state-distinct, surface-order and the other
automatic Reguloj), rebuilds the report from the Agordo in its aspekto.json and compares it with
raporto.json and raporto.md byte for byte.

Options:
  --json      Print only the result as JSON on stdout
  -h, --help  Show this help

Exit codes: 0 the checks pass and the report matches, 1 they do not, 2 usage error.
`;

function run(args: readonly string[], context: CliContext): number {
  const { values, positionals } = parseFlags(args, { json: { type: "boolean" } }, COMMAND_LINE);
  if (positionals.length !== 1) {
    throw new UsageError(
      `\`${COMMAND_LINE}\` takes exactly one package directory, got ${positionals.length}.`,
      [`Usage: ${COMMAND_LINE} <dir>`],
    );
  }
  const dir = resolve(context.baseDir, positionals[0] ?? "");
  const result = checkPackageDir(dir);
  const summary = result.raporto?.summary;
  if (values.json === true) {
    context.stdout(
      `${JSON.stringify({ ok: result.ok, dir, summary, issues: result.issues }, null, 2)}\n`,
    );
  } else {
    const lines = [
      `Package: ${dir}`,
      `${result.ok ? "OK" : "FAILED"}: ${result.issues.length} issue${result.issues.length === 1 ? "" : "s"}`,
    ];
    if (summary !== undefined) {
      lines.push(
        `KontrastParoj: ${summary.pairs.passed} of ${summary.pairs.measured} evaluations pass`,
        `Violations: ${summary.violations.fixed} fixed, ${summary.violations.adjustable} adjustable (${summary.violations.covered} covered by a Jugxo)`,
      );
    }
    if (result.issues.length > 0) lines.push("", ...result.issues.map(formatIssue));
    context.stdout(`${lines.join("\n")}\n`);
  }
  return result.ok ? EXIT_OK : EXIT_FAIL;
}

export const agordiloCheck: Command = {
  name: "check",
  summary: "Run the checks of a derived Aspekto package again and compare with its report.",
  help: HELP,
  run,
};
