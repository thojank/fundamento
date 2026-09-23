// `fm modelo validate [path] [--config <file>] [--aspekto <dir>]…`: validates the repo Modelo, a
// Modelo root (<root>/vortaro, <root>/data) or a project config, optionally with extra Aspekto
// packages (Spec 001, D-07), and prints a human summary or, with --json, only the report.
import { statSync } from "node:fs";
import { resolve } from "node:path";
import {
  defaultModeloSource,
  fixtureModeloSource,
  type ModeloSource,
  modeloRootOf,
  projectModeloSource,
  type ValidationIssue,
  type ValidationReport,
  validateModelo,
  withAspektoPackages,
} from "@fundamento/modelo";
import { parseFlags, UsageError } from "../args.js";
import { type CliContext, type Command, EXIT_FAIL, EXIT_OK } from "../command.js";

const COMMAND_LINE = "fm modelo validate";

const SUMMARY_KEYS = [
  "tokens",
  "types",
  "setoj",
  "dimensioj",
  "combinations",
  "reguloj",
  "jugxoj",
  "mankoj",
  "kontrastParoj",
] as const satisfies readonly (keyof ValidationReport["summary"])[];

const HELP = `${COMMAND_LINE}: Validate a Modelo against its schema and every Modelo rule.

Usage: ${COMMAND_LINE} [path] [--aspekto <dir>]… [--json]
       ${COMMAND_LINE} --config <file> [--aspekto <dir>]… [--json]

Without a path, validates the Modelo of this repository with its reference Aspekto komuna.
With a path, validates the Modelo root there: a directory containing
  vortaro/   $themes.json, $metadata.json and sets/
  data/      dimensioj.json, reguloj.json, jugxoj.json, mankoj.json, kontrastparoj.json,
             ids.lock.json
Relative paths resolve against the directory you ran the command from.

Options:
  --path <path>    The Modelo root to validate (same as the [path] argument)
  --config <file>  A project's fundamento.config.json: the core, komuna and the Aspekto
                   packages it lists (not together with a path)
  --aspekto <dir>  An Aspekto package directory to validate with the core; repeatable
  --json           Print only the ValidationReport as JSON on stdout
  -h, --help       Show this help

Exit codes: 0 valid, 1 invalid, 2 usage error.
`;

const ROOT_SUGGESTION =
  "Pass the path of a Modelo root: a directory containing vortaro/ ($themes.json, $metadata.json, sets/) and data/ (the Modelo data files). Omit the path to validate the repo Modelo.";

interface Target {
  /** Where the Modelo lives, for the human header. */
  label: string;
  source: ModeloSource;
}

function isDirectory(path: string): boolean {
  return statSync(path, { throwIfNoEntry: false })?.isDirectory() ?? false;
}

function emptyReport(errors: ValidationIssue[]): ValidationReport {
  return {
    valid: false,
    errors,
    warnings: [],
    summary: {
      tokens: 0,
      types: 0,
      setoj: 0,
      dimensioj: 0,
      combinations: 0,
      reguloj: 0,
      jugxoj: 0,
      mankoj: 0,
      kontrastParoj: 0,
    },
  };
}

/** Structured errors when `given` is not a Modelo root, or none when it is. */
function rootIssues(given: string, absolute: string, baseDir: string): ValidationIssue[] {
  if (!isDirectory(absolute)) {
    return [
      {
        rule: "file-missing",
        severity: "error",
        path: given,
        message: `No directory exists at ${absolute} (relative paths resolve against ${baseDir}).`,
        suggestion: ROOT_SUGGESTION,
      },
    ];
  }
  const trimmed = given.replace(/[\\/]+$/, "");
  return (["vortaro", "data"] as const)
    .filter((part) => !isDirectory(resolve(absolute, part)))
    .map((part) => ({
      rule: "file-missing",
      severity: "error",
      path: `${trimmed}/${part}`,
      message: `${absolute} is not a Modelo root: it has no ${part}/ directory.`,
      suggestion: ROOT_SUGGESTION,
    }));
}

function pathArgument(
  values: Record<string, unknown>,
  positionals: readonly string[],
): string | undefined {
  if (positionals.length > 1) {
    throw new UsageError(
      `\`${COMMAND_LINE}\` takes at most one path, got ${positionals.length}: ${positionals.join(" ")}.`,
      ["Quote paths that contain spaces."],
    );
  }
  const flag = typeof values.path === "string" ? values.path : undefined;
  const positional = positionals[0];
  if (flag !== undefined && positional !== undefined && flag !== positional) {
    throw new UsageError(
      `\`${COMMAND_LINE}\` got two different paths: '${positional}' and --path '${flag}'.`,
      ["Give the path once, either as an argument or with --path."],
    );
  }
  return flag ?? positional;
}

export function formatIssue(issue: ValidationIssue): string {
  const lines = [
    `  [${issue.severity}] ${issue.rule}`,
    `    path:        ${issue.path}`,
    `    message:     ${issue.message}`,
    `    suggestion:  ${issue.suggestion}`,
  ];
  if (issue.regulo !== undefined) {
    lines.push(`    regulo:      ${issue.regulo.name} (${issue.regulo.id})`);
    lines.push(`    kialo:       ${issue.regulo.kialo}`);
  }
  if (issue.combination !== undefined) {
    const pairs = Object.entries(issue.combination).map(([key, value]) => `${key}=${value}`);
    lines.push(`    combination: ${pairs.join(", ")}`);
  }
  return lines.join("\n");
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function formatReport(report: ValidationReport, label: string, pathsRelativeTo: string): string {
  const width = Math.max(...SUMMARY_KEYS.map((key) => key.length));
  const verdict = report.valid ? "VALID" : "INVALID";
  const parts = [
    `Modelo: ${label}`,
    `${verdict}: ${plural(report.errors.length, "error")}, ${plural(report.warnings.length, "warning")}`,
    "",
    ...SUMMARY_KEYS.map((key) => `  ${key.padEnd(width)}  ${report.summary[key]}`),
  ];
  if (report.errors.length + report.warnings.length > 0) {
    parts.push("", `Issue paths are relative to ${pathsRelativeTo}.`);
  }
  if (report.errors.length > 0) {
    parts.push("", `Errors (${report.errors.length}):`, ...report.errors.map(formatIssue));
  }
  if (report.warnings.length > 0) {
    parts.push("", `Warnings (${report.warnings.length}):`, ...report.warnings.map(formatIssue));
  }
  return `${parts.join("\n")}\n`;
}

function run(args: readonly string[], context: CliContext): number {
  const { values, positionals } = parseFlags(
    args,
    {
      path: { type: "string" },
      config: { type: "string" },
      aspekto: { type: "string", multiple: true },
      json: { type: "boolean" },
    },
    COMMAND_LINE,
  );
  const given = pathArgument(values, positionals);
  const config = typeof values.config === "string" ? values.config : undefined;
  if (given !== undefined && config !== undefined) {
    throw new UsageError(`\`${COMMAND_LINE}\` takes a path or --config, not both.`, [
      "A project config names its own core; add packages with --aspekto <dir>.",
    ]);
  }
  const packages = (Array.isArray(values.aspekto) ? values.aspekto : [])
    .filter((dir): dir is string => typeof dir === "string")
    .map((dir) => resolve(context.baseDir, dir));
  const withPackages = (base: Target): Target =>
    packages.length === 0
      ? base
      : {
          label: `${base.label} + Aspekto packages ${packages.join(", ")}`,
          source: withAspektoPackages(base.source, packages),
        };

  let target: Target | undefined;
  let report: ValidationReport;
  if (config !== undefined) {
    const file = resolve(context.baseDir, config);
    target = withPackages({ label: `project ${file}`, source: projectModeloSource(file, config) });
    report = validateModelo(target.source);
  } else if (given === undefined) {
    const source = defaultModeloSource();
    target = withPackages({ label: `repo Modelo (${modeloRootOf(source)})`, source });
    report = validateModelo(target.source);
  } else {
    const absolute = resolve(context.baseDir, given);
    const issues = rootIssues(given, absolute, context.baseDir);
    if (issues.length > 0) {
      report = emptyReport(issues);
    } else {
      target = withPackages({ label: absolute, source: fixtureModeloSource(absolute) });
      report = validateModelo(target.source);
    }
  }

  if (values.json === true) {
    context.stdout(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    const label = target?.label ?? resolve(context.baseDir, given ?? ".");
    const relativeTo = target === undefined ? context.baseDir : modeloRootOf(target.source);
    context.stdout(formatReport(report, label, relativeTo));
  }
  return report.valid ? EXIT_OK : EXIT_FAIL;
}

export const modeloValidate: Command = {
  name: "validate",
  summary:
    "Validate the repo Modelo, a Modelo root or a project config (plus --aspekto packages) against every Modelo rule.",
  help: HELP,
  run,
};
