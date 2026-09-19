// CLI edge of the ID registry: `pnpm id:new` and `pnpm id:retire` (FR-05a).
//
// Usage: node packages/modelo/dist/ids/cli.js new <entityType> [--count N] [--lock <path>] [--json]
//        node packages/modelo/dist/ids/cli.js retire <id> [--lock <path>] [--json]
// Exit codes: 0 = ok, 1 = domain error (invalid lock, unknown ID, I/O), 2 = usage.

import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { ENTITY_ID_PREFIXES, ENTITY_TYPES, type EntityType } from "../contracts/entity-ids.js";
import type { ValidationIssue } from "../contracts/issues.js";
import { allocateIds, retireId } from "./lock.js";
import {
  defaultLockPath,
  readIdsLockFile,
  readLockNamespace,
  writeIdsLockFile,
} from "./lock-file.js";
import { createIdGenerator, type IdGenerator, systemUlidSource } from "./ulid-source.js";

export const EXIT_OK = 0;
export const EXIT_DOMAIN_ERROR = 1;
export const EXIT_USAGE = 2;

export interface IdsCliEnv {
  /** Directory that `--lock` is resolved against. */
  cwd: string;
  /** Lock used when `--lock` is omitted. */
  defaultLockPath: string;
  nextId: IdGenerator;
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

const TYPE_LIST = ENTITY_TYPES.map(
  (type) => `  ${type.padEnd(16)}${ENTITY_ID_PREFIXES[type]}_`,
).join("\n");

export const IDS_HELP = `Fundamento ID registry (packages/modelo/data/ids.lock.json)

Every Modelo entity carries a stable, opaque ID: <prefix>_<ULID>, e.g. tok_01K5FMAJ0AND635FTMQ9558Y63.
In an external Aspekto package the ID carries the package namespace: <prefix>_<ns>_<ULID>. The
namespace is "idNamespace" in the aspekto.json next to the --lock file.
IDs are issued only by this command and never reused. Never write or edit IDs by hand.

Usage:
  pnpm id:new <entityType> [--count N] [--lock <path>] [--json]
      Generate N (default 1) new IDs, register them as "active" and print them,
      one per line (or as JSON with --json). Paste each ID into the entity's "id"
      field (tokens and sets: $extensions["com.ciferecigo.fundamento"].id).

  pnpm id:retire <id> [--lock <path>] [--json]
      Mark an ID "retired" after its entity was removed. A retired ID can never
      appear in the Modelo again. Retiring an unknown ID is an error.

Options:
  --count N        Number of IDs to generate (positive integer, default 1).
  --lock <path>    Lock file, relative to the directory you run the command from.
                   Default: packages/modelo/data/ids.lock.json (independent of cwd).
                   The file must already exist; a missing lock is an error and is
                   never created implicitly.
  --json           Print a JSON result instead of plain text.
  -h, --help       Show this help.

Entity types and prefixes:
${TYPE_LIST}

Exit codes: 0 ok, 1 domain error (invalid lock, unknown ID), 2 usage error.
`;

const USAGE = `Usage: pnpm id:new <entityType> [--count N] [--lock <path>] [--json]
       pnpm id:retire <id> [--lock <path>] [--json]
Run with --help for details.
`;

type Command =
  | { kind: "help" }
  | { kind: "new"; entityType: EntityType; count: number; lock: string; json: boolean }
  | { kind: "retire"; id: string; lock: string; json: boolean };

type ParseResult = { ok: true; command: Command } | { ok: false; message: string };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isEntityType(value: string): value is EntityType {
  return (ENTITY_TYPES as readonly string[]).includes(value);
}

function parseCount(raw: string | undefined): number | undefined {
  if (raw === undefined) {
    return 1;
  }
  if (!/^[1-9][0-9]*$/.test(raw)) {
    return undefined;
  }
  const count = Number(raw);
  return Number.isSafeInteger(count) ? count : undefined;
}

export function parseIdsArgs(argv: readonly string[], env: IdsCliEnv): ParseResult {
  let parsed: ReturnType<typeof parseStrict>;
  try {
    parsed = parseStrict(argv);
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
  const { values, positionals } = parsed;
  if (values.help) {
    return { ok: true, command: { kind: "help" } };
  }
  const [subcommand, argument, ...rest] = positionals;
  if (subcommand === undefined) {
    return { ok: false, message: "Missing command: expected 'new' or 'retire'." };
  }
  if (subcommand !== "new" && subcommand !== "retire") {
    return { ok: false, message: `Unknown command '${subcommand}': expected 'new' or 'retire'.` };
  }
  if (argument === undefined) {
    return {
      ok: false,
      message: subcommand === "new" ? "Missing <entityType>." : "Missing <id>.",
    };
  }
  if (rest.length > 0) {
    return { ok: false, message: `Unexpected arguments: ${rest.join(" ")}` };
  }
  const lock = values.lock === undefined ? env.defaultLockPath : resolve(env.cwd, values.lock);

  if (subcommand === "retire") {
    if (values.count !== undefined) {
      return { ok: false, message: "--count is only valid for 'new'." };
    }
    return { ok: true, command: { kind: "retire", id: argument, lock, json: values.json } };
  }

  if (!isEntityType(argument)) {
    return {
      ok: false,
      message: `Unknown entity type '${argument}'. Valid entity types: ${ENTITY_TYPES.join(", ")}.`,
    };
  }
  const count = parseCount(values.count);
  if (count === undefined) {
    return {
      ok: false,
      message: `--count must be a positive integer, got '${values.count ?? ""}'.`,
    };
  }
  return {
    ok: true,
    command: { kind: "new", entityType: argument, count, lock, json: values.json },
  };
}

function parseStrict(argv: readonly string[]) {
  return parseArgs({
    args: [...argv],
    allowPositionals: true,
    strict: true,
    options: {
      count: { type: "string" },
      lock: { type: "string" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
}

function formatIssues(issues: readonly ValidationIssue[]): string {
  return issues
    .map(
      (issue) =>
        `${issue.severity} ${issue.rule} ${issue.path}\n  ${issue.message}\n  suggestion: ${issue.suggestion}\n`,
    )
    .join("");
}

async function runNew(command: Extract<Command, { kind: "new" }>, env: IdsCliEnv): Promise<number> {
  const read = await readIdsLockFile(command.lock);
  if (!read.ok) {
    env.stderr(formatIssues(read.issues));
    return EXIT_DOMAIN_ERROR;
  }
  const namespace = await readLockNamespace(command.lock);
  if (!namespace.ok) {
    env.stderr(formatIssues(namespace.issues));
    return EXIT_DOMAIN_ERROR;
  }
  const { lock, ids } = allocateIds(
    read.lock,
    command.entityType,
    command.count,
    env.nextId,
    namespace.namespace,
  );
  const writeIssues = await writeIdsLockFile(command.lock, lock);
  if (writeIssues.length > 0) {
    env.stderr(formatIssues(writeIssues));
    return EXIT_DOMAIN_ERROR;
  }
  env.stdout(
    command.json
      ? `${JSON.stringify(
          {
            entityType: command.entityType,
            ...(namespace.namespace === undefined ? {} : { namespace: namespace.namespace }),
            ids,
            lock: command.lock,
          },
          null,
          2,
        )}\n`
      : ids.map((id) => `${id}\n`).join(""),
  );
  return EXIT_OK;
}

async function runRetire(
  command: Extract<Command, { kind: "retire" }>,
  env: IdsCliEnv,
): Promise<number> {
  const read = await readIdsLockFile(command.lock);
  if (!read.ok) {
    env.stderr(formatIssues(read.issues));
    return EXIT_DOMAIN_ERROR;
  }
  const result = retireId(read.lock, command.id);
  if (!result.ok) {
    env.stderr(`error ${result.message}\n  suggestion: ${result.suggestion}\n`);
    return EXIT_DOMAIN_ERROR;
  }
  if (!result.alreadyRetired) {
    const writeIssues = await writeIdsLockFile(command.lock, result.lock);
    if (writeIssues.length > 0) {
      env.stderr(formatIssues(writeIssues));
      return EXIT_DOMAIN_ERROR;
    }
  }
  env.stdout(
    command.json
      ? `${JSON.stringify(
          {
            id: command.id,
            status: "retired",
            alreadyRetired: result.alreadyRetired,
            lock: command.lock,
          },
          null,
          2,
        )}\n`
      : `${command.id} ${result.alreadyRetired ? "was already retired" : "retired"}\n`,
  );
  return EXIT_OK;
}

/** Runs the ID CLI. Never throws: failures become messages on stderr plus an exit code. */
export async function runIdsCli(argv: readonly string[], env: IdsCliEnv): Promise<number> {
  const parsed = parseIdsArgs(argv, env);
  if (!parsed.ok) {
    env.stderr(`${parsed.message}\n${USAGE}`);
    return EXIT_USAGE;
  }
  const { command } = parsed;
  try {
    switch (command.kind) {
      case "help":
        env.stdout(IDS_HELP);
        return EXIT_OK;
      case "new":
        return await runNew(command, env);
      case "retire":
        return await runRetire(command, env);
    }
  } catch (error) {
    env.stderr(`error ${errorMessage(error)}\n`);
    return EXIT_DOMAIN_ERROR;
  }
}

if (import.meta.main) {
  process.exitCode = await runIdsCli(process.argv.slice(2), {
    // pnpm runs root scripts in the repo root; INIT_CWD is the directory the user invoked it from.
    cwd: process.env.INIT_CWD ?? process.cwd(),
    defaultLockPath: defaultLockPath(),
    nextId: createIdGenerator(systemUlidSource()),
    stdout: (text) => process.stdout.write(text),
    stderr: (text) => process.stderr.write(text),
  });
}
