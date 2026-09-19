// Command tree, help output and dispatch for `fm`. Pure apart from the injected context, so the
// process edge (index.ts) stays the only place that touches `process`.
import { UsageError } from "./args.js";
import {
  type CliContext,
  type Command,
  type CommandGroup,
  EXIT_OK,
  EXIT_USAGE,
} from "./command.js";
import { modeloExport } from "./commands/modelo-export.js";
import { modeloValidate } from "./commands/modelo-validate.js";
import { closest } from "./suggest.js";

type Entry = Command | CommandGroup;

/** Top-level commands. Phase 6 adds `init`, `add`, `aspekto`, … here. */
const ENTRIES: readonly Entry[] = [
  {
    name: "modelo",
    summary: "Work with the Modelo: tokens, Dimensioj, Reguloj and Jugxoj.",
    commands: [modeloValidate, modeloExport],
  },
];

const HELP_FLAGS = new Set(["--help", "-h"]);
const TOP_LEVEL_FLAGS = ["--help", "--version", "-h"];

function isGroup(entry: Entry): entry is CommandGroup {
  return "commands" in entry;
}

interface CommandPath {
  words: string;
  summary: string;
}

/** Every runnable command as `fm <words>`, in declaration order. */
function commandPaths(): CommandPath[] {
  return ENTRIES.flatMap((entry) =>
    isGroup(entry)
      ? entry.commands.map((command) => ({
          words: `${entry.name} ${command.name}`,
          summary: command.summary,
        }))
      : [{ words: entry.name, summary: entry.summary }],
  );
}

function table(rows: readonly (readonly [string, string])[]): string {
  const width = Math.max(...rows.map(([left]) => left.length));
  return rows.map(([left, right]) => `  ${left.padEnd(width)}   ${right}`).join("\n");
}

function topLevelHelp(version: string): string {
  const commands = table(commandPaths().map((path) => [path.words, path.summary] as const));
  return `fm ${version}: the Fundamento command line.

Usage: fm <command> [options]

Commands:
${commands}

Options:
${table([
  ["-h, --help", "Show help for fm or for any command"],
  ["--version", "Print the fm version"],
])}

Run \`fm <command> --help\` for details. No configuration is needed.
`;
}

function groupHelp(group: CommandGroup): string {
  return `fm ${group.name}: ${group.summary}

Usage: fm ${group.name} <command> [options]

Commands:
${table(group.commands.map((command) => [command.name, command.summary] as const))}

Run \`fm ${group.name} <command> --help\` for details.
`;
}

/** Hint for an unknown command word, searched among `paths` by their last word and full words. */
function didYouMean(input: string, paths: readonly CommandPath[]): string[] {
  const best = closest(input, paths, (path) => [path.words.split(" ").at(-1) ?? "", path.words]);
  return best === undefined ? [] : [`Did you mean \`fm ${best.words}\`?`];
}

/** Help was requested anywhere before a `--` terminator. */
function wantsHelp(args: readonly string[]): boolean {
  const end = args.indexOf("--");
  return (end === -1 ? args : args.slice(0, end)).some((arg) => HELP_FLAGS.has(arg));
}

function runGroup(group: CommandGroup, args: readonly string[], context: CliContext): number {
  const [name, ...rest] = args;
  if (name === undefined) {
    context.stderr(groupHelp(group));
    return EXIT_USAGE;
  }
  if (HELP_FLAGS.has(name)) {
    context.stdout(groupHelp(group));
    return EXIT_OK;
  }
  if (name.startsWith("-")) {
    throw new UsageError(`Unknown option '${name}' for \`fm ${group.name}\`.`, [
      `Run \`fm ${group.name} --help\` to see its commands.`,
    ]);
  }
  const command = group.commands.find((candidate) => candidate.name === name);
  if (command === undefined) {
    const paths = group.commands.map((candidate) => ({
      words: `${group.name} ${candidate.name}`,
      summary: candidate.summary,
    }));
    throw new UsageError(`Unknown command '${name}' for \`fm ${group.name}\`.`, [
      ...didYouMean(name, paths),
      `Run \`fm ${group.name} --help\` to see its commands.`,
    ]);
  }
  return runCommand(command, rest, context);
}

function runCommand(command: Command, args: readonly string[], context: CliContext): number {
  if (wantsHelp(args)) {
    context.stdout(command.help);
    return EXIT_OK;
  }
  return command.run(args, context);
}

function dispatch(argv: readonly string[], context: CliContext): number {
  const [head, ...rest] = argv;
  if (head === undefined) {
    context.stderr(topLevelHelp(context.version));
    return EXIT_USAGE;
  }
  if (HELP_FLAGS.has(head)) {
    context.stdout(topLevelHelp(context.version));
    return EXIT_OK;
  }
  if (head === "--version") {
    context.stdout(`${context.version}\n`);
    return EXIT_OK;
  }
  if (head.startsWith("-")) {
    const best = closest(head, TOP_LEVEL_FLAGS, (flag) => [flag]);
    throw new UsageError(`Unknown option '${head}'.`, [
      ...(best === undefined ? [] : [`Did you mean \`${best}\`?`]),
      "Run `fm --help` to see all commands and options.",
    ]);
  }
  const entry = ENTRIES.find((candidate) => candidate.name === head);
  if (entry === undefined) {
    throw new UsageError(`Unknown command '${head}'.`, [
      ...didYouMean(head, [
        ...ENTRIES.map((candidate) => ({ words: candidate.name, summary: candidate.summary })),
        ...commandPaths(),
      ]),
      "Run `fm --help` to see all commands.",
    ]);
  }
  return isGroup(entry) ? runGroup(entry, rest, context) : runCommand(entry, rest, context);
}

/**
 * Runs `fm` with `argv` (without the node and script paths) and returns the exit code:
 * 0 success, 1 the checked thing is invalid, 2 usage error or failure to run. Never throws.
 */
export function main(argv: readonly string[], context: CliContext): number {
  try {
    return dispatch(argv, context);
  } catch (error) {
    if (error instanceof UsageError) {
      context.stderr(`fm: ${[error.message, ...error.hints].join("\n")}\n`);
      return EXIT_USAGE;
    }
    const reason = error instanceof Error ? error.message : String(error);
    context.stderr(`fm: unexpected error: ${reason}\n`);
    return EXIT_USAGE;
  }
}
