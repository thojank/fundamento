// CLI edge of the Ero-Tokens (Constitution v2.3, Spec 024 ②): `pnpm vortaro:ero-tokenoj
// [--root <path> | --config <file>] [--check]`. Derives every Ero-Token from the Skemoj and writes
// it into the core set — as an alias on the role token the Skemo binds, with an ID from the lock —
// and into the main set of every Aspekto package (of a project with `--config`) as the same alias.
// A token the core already has keeps its value and its ID (the reference brand may have re-pointed
// it); a token no Skemo derives any more is removed. `--check` writes nothing and exits 1 when a
// file would change. The rest of a set file stays byte for byte: the core is written by hand, only
// the groups `ero` and `sxablono` are the machine's.
//
// Usage: node packages/modelo/dist/eroj/ero-tokenoj-cli.js [--root <path> | --config <file>] [--check]
// Exit codes: 0 = written (or nothing to write), 1 = Modelo cannot be loaded, a file cannot be
// written or drift under --check, 2 = usage error. Never prints stack traces.

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import type { IdsLock } from "../contracts/entity-ids.js";
import { CORE_SET_NAME } from "../contracts/grammar.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type { ModeloSource } from "../contracts/modelo.js";
import { normalizeNames } from "../contracts/names.js";
import { allocateIds, retireId, serializeIdsLock } from "../ids/lock.js";
import { createIdGenerator, systemUlidSource } from "../ids/ulid-source.js";
import { ASPEKTO_DIMENSIO, referenceAspektoOf } from "../load/build.js";
import { loadModelo } from "../load/load-modelo.js";
import {
  defaultModeloSource,
  fixtureModeloSource,
  modeloRootOf,
  projectModeloSource,
} from "../load/source.js";
import { ERO_TOKEN_ROLE, type EroTokeno, eroTokenojOfModelo } from "./ero-tokenoj.js";

export const EXIT_OK = 0;
export const EXIT_DOMAIN_ERROR = 1;
export const EXIT_USAGE = 2;

export interface EroTokenojCliEnv {
  /** Directory that `--root` and `--config` are resolved against. */
  cwd: string;
  /** The Modelo used when neither is given (the repo's Vortaro). */
  defaultSource: () => ModeloSource;
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

export const ERO_TOKENOJ_HELP = `Derive the Ero-Tokens of the Vortaro from the Skemoj (Constitution v2.3, Spec 024)

For every part property of every Ero and Sxablono, one token per combination of its keys
(ero.butono.surface.fill.emphasis.high.intent.neutral.hover) goes into the core set as an alias on
the role token the Skemo binds, with an ID from the lock, and into the main set of every Aspekto
package as the same alias. A token the core already has keeps its value and its ID; a token no
Skemo derives any more is removed. Run it after changing a Skemo; validation reports the drift
(ero-tokeno-missing, ero-tokeno-unknown).

Usage:
  pnpm vortaro:ero-tokenoj [--root <path> | --config <file>] [--check]

Options:
  --root <path>   A Modelo root (<path>/vortaro, <path>/data), e.g. a test fixture. Relative to the
                  directory you run the command from. Default: the repo Vortaro.
  --config <file> A project's fundamento.config.json: writes the Ero-Tokens into the main set of
                  every Aspekto package it lists (the core stays untouched).
  --check         Write nothing; exit 1 when a file would change.
  -h, --help      Show this help.

Exit codes: 0 written, 1 Modelo cannot be loaded, files cannot be written or drift under --check,
2 usage error.
`;

const USAGE = `Usage: pnpm vortaro:ero-tokenoj [--root <path> | --config <file>] [--check]
Run with --help for details.
`;

type Command =
  | { kind: "help" }
  | { kind: "write"; source: ModeloSource; packagesOnly: boolean; check: boolean };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function parseEroTokenojArgs(
  argv: readonly string[],
  env: EroTokenojCliEnv,
): { ok: true; command: Command } | { ok: false; message: string } {
  let parsed: ReturnType<typeof parseStrict>;
  try {
    parsed = parseStrict(argv);
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
  const { values, positionals } = parsed;
  if (values.help) return { ok: true, command: { kind: "help" } };
  if (positionals.length > 0) {
    return { ok: false, message: `Unexpected arguments: ${positionals.join(" ")}` };
  }
  if (values.root === "" || values.config === "") {
    return { ok: false, message: "--root and --config must not be empty." };
  }
  if (values.root !== undefined && values.config !== undefined) {
    return { ok: false, message: "Use either --root or --config, not both." };
  }
  const check = values.check === true;
  if (values.config !== undefined) {
    const source = projectModeloSource(resolve(env.cwd, values.config));
    return { ok: true, command: { kind: "write", source, packagesOnly: true, check } };
  }
  const source =
    values.root === undefined
      ? env.defaultSource()
      : fixtureModeloSource(resolve(env.cwd, values.root));
  return { ok: true, command: { kind: "write", source, packagesOnly: false, check } };
}

function parseStrict(argv: readonly string[]) {
  return parseArgs({
    args: [...argv],
    allowPositionals: true,
    strict: true,
    options: {
      root: { type: "string" },
      config: { type: "string" },
      check: { type: "boolean", default: false },
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

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The groups of the third level in a set tree. */
const GROUPS = ["ero", "sxablono"] as const;

/** The token nodes of the groups `ero` and `sxablono` of a set tree, by token name. */
function existingNodes(tree: Json): Map<string, Json> {
  const out = new Map<string, Json>();
  const walk = (node: Json, path: string[]) => {
    if ("$value" in node) {
      out.set(path.join("."), node);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith("$") || !isObject(child)) continue;
      walk(child, [...path, key]);
    }
  };
  for (const group of GROUPS) {
    const node = tree[group];
    if (isObject(node)) walk(node, [group]);
  }
  return out;
}

/** The groups `ero` and `sxablono` built from the derived tokens, every token at its dotted path. */
function groupsOf(tokens: readonly EroTokeno[], nodeOf: (token: EroTokeno) => Json): Json {
  const groups: Json = {};
  for (const token of tokens) {
    const path = token.name.split(".");
    let node = groups;
    for (const key of path.slice(0, -1)) {
      if (!isObject(node[key])) node[key] = {};
      node = node[key] as Json;
    }
    node[path.at(-1) ?? ""] = nodeOf(token);
  }
  return groups;
}

/**
 * The text of a set file with its groups `ero` and `sxablono` replaced: everything before them
 * stays byte for byte, the groups stand at the end as 2-space JSON. The file must be a JSON object
 * whose groups of the third level, if any, are its last members (the command writes them so).
 */
export function withEroGroups(text: string, groups: Json): string {
  const tree = JSON.parse(text) as Json;
  const keys = Object.keys(tree);
  const first = keys.findIndex((key) => (GROUPS as readonly string[]).includes(key));
  if (
    first !== -1 &&
    keys.slice(first).some((key) => !(GROUPS as readonly string[]).includes(key))
  ) {
    throw new Error(
      "The groups ero and sxablono must be the last members of the set file; move them to the end.",
    );
  }
  // Cut the old groups off textually: the text before the first group's key, trimmed of its
  // trailing comma and whitespace.
  let head = text.trimEnd();
  if (first !== -1) {
    const key = keys[first] ?? "";
    const at = head.lastIndexOf(`\n  ${JSON.stringify(key)}:`);
    if (at === -1)
      throw new Error(`The group ${key} is not written at the top level with two spaces.`);
    head = head.slice(0, at).trimEnd();
  } else {
    if (!head.endsWith("}")) throw new Error("The set file is no JSON object.");
    head = head.slice(0, -1).trimEnd();
  }
  if (head.endsWith(",")) head = head.slice(0, -1);
  const parts: string[] = [];
  for (const group of GROUPS) {
    const value = groups[group];
    if (value === undefined) continue;
    const serialized = JSON.stringify(value, null, 2)
      .split("\n")
      .map((line, index) => (index === 0 ? line : `  ${line}`))
      .join("\n");
    parts.push(`  ${JSON.stringify(group)}: ${serialized}`);
  }
  if (parts.length === 0) return `${head}\n}\n`;
  const separator = head.endsWith("{") ? "\n" : ",\n";
  return `${head}${separator}${parts.join(",\n")}\n}\n`;
}

export interface EroTokenojPlan {
  /** Absolute file → new text, only for files that change. */
  files: Map<string, string>;
  /** One line per set: derived, added, kept and removed. */
  summary: string[];
  /** Every Ero-Token the Skemoj derive. */
  tokens: EroTokeno[];
}

/** The ID a core node carries in its Fundamento extension, or an empty string. */
function idOf(node: Json): string {
  const extension = isObject(node.$extensions) ? node.$extensions : {};
  const own = isObject(extension["fundamento"]) ? extension["fundamento"] : {};
  return typeof own.id === "string" ? own.id : "";
}

/** The Fundamento extension of a core Ero-Token: its ID and, for a colour, the role ero. */
function extensionOf(id: string, token: EroTokeno): Json {
  return {
    fundamento: {
      id,
      ...(token.type === "color" ? { role: ERO_TOKEN_ROLE } : {}),
    },
  };
}

/** A kept core node with the role ero on a colour, where it lacks one (the migration adds it). */
function withRole(node: Json, token: EroTokeno): Json {
  if (token.type !== "color") return node;
  const extension = isObject(node.$extensions) ? node.$extensions : {};
  const own = isObject(extension["fundamento"]) ? extension["fundamento"] : {};
  if (own.role !== undefined) return node;
  return {
    ...node,
    $extensions: {
      ...extension,
      fundamento: { ...own, role: ERO_TOKEN_ROLE },
    },
  };
}

function describeWhen(token: EroTokeno): string {
  const entries = Object.entries(token.when);
  return entries.length === 0
    ? ""
    : ` when ${entries.map(([key, value]) => `${key}=${value}`).join(", ")}`;
}

/** Everything the command would write, computed without writing. */
export function planEroTokenoj(
  source: ModeloSource,
  packagesOnly: boolean,
  nextId = createIdGenerator(systemUlidSource()),
): { ok: true; plan: EroTokenojPlan } | { ok: false; issues: ValidationIssue[] } {
  const { modelo, issues } = loadModelo(source);
  if (modelo === undefined) return { ok: false, issues };
  const tokens = eroTokenojOfModelo(modelo);
  const files = new Map<string, string>();
  const summary: string[] = [];
  const root = modeloRootOf(source);
  const derived = new Set(tokens.map((token) => token.name));

  if (!packagesOnly) {
    const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME);
    if (core === undefined) throw new Error("The Vortaro has no core set.");
    const corePath = join(root, core.file);
    const coreText = readFileSync(corePath, "utf8");
    const existing = existingNodes(normalizeNames(JSON.parse(coreText) as Json, coreText));
    const missing = tokens.filter((token) => !existing.has(token.name));
    const lockPath = join(source.dataDir, "ids.lock.json");
    const ids = new Map<string, string>();
    // A token no Skemo derives any more leaves the core, and its ID is retired: an ID is never
    // reused, and an active ID without an entity is an orphan (id-orphaned).
    const stale = [...existing.entries()].filter(([name]) => !derived.has(name));
    if (missing.length > 0 || stale.length > 0) {
      let lock = JSON.parse(readFileSync(lockPath, "utf8")) as IdsLock;
      for (const [, node] of stale) {
        const retired = retireId(lock, idOf(node));
        if (retired.ok) lock = retired.lock;
      }
      if (missing.length > 0) {
        const allocated = allocateIds(lock, "token", missing.length, nextId);
        missing.forEach((token, index) => {
          ids.set(token.name, allocated.ids[index] ?? "");
        });
        lock = allocated.lock;
      }
      files.set(lockPath, serializeIdsLock(lock));
    }
    const groups = groupsOf(tokens, (token) => {
      const kept = existing.get(token.name);
      if (kept !== undefined) return withRole(kept, token);
      return {
        $type: token.type,
        $value: `{${token.alias}}`,
        $description: `${token.owner}: ${token.part}.${token.property}${describeWhen(token)} (Constitution v2.3, the Ero-Token of this cell); by default the role token the Skemo binds.`,
        $extensions: extensionOf(ids.get(token.name) ?? "", token),
      };
    });
    const next = withEroGroups(coreText, groups);
    const removed = [...existing.keys()].filter((name) => !derived.has(name)).length;
    if (next !== coreText) files.set(corePath, next);
    summary.push(
      `core: ${tokens.length} Ero-Tokens derived, ${missing.length} added, ${existing.size - removed} kept, ${removed} removed`,
    );
  }

  const reference = referenceAspektoOf(modelo);
  for (const pkg of modelo.aspektoPackages) {
    if (pkg.aspekto === undefined || pkg.aspekto === reference) continue;
    const set = modelo.setoj.find(
      (candidate) =>
        candidate.package === pkg.name && candidate.name === `${ASPEKTO_DIMENSIO}/${pkg.aspekto}`,
    );
    if (set === undefined) continue;
    const path = join(root, set.file);
    const text = readFileSync(path, "utf8");
    const existing = existingNodes(normalizeNames(JSON.parse(text) as Json, text));
    const groups = groupsOf(
      tokens,
      (token) => existing.get(token.name) ?? { $type: token.type, $value: `{${token.alias}}` },
    );
    const next = withEroGroups(text, groups);
    const added = tokens.filter((token) => !existing.has(token.name)).length;
    const removed = [...existing.keys()].filter((name) => !derived.has(name)).length;
    if (next !== text) files.set(path, next);
    summary.push(
      `${set.name}: ${added} added, ${existing.size - removed} kept, ${removed} removed`,
    );
  }
  return { ok: true, plan: { files, summary, tokens } };
}

/** Runs the CLI. Never throws: failures become messages on stderr plus an exit code. */
export function runEroTokenojCli(argv: readonly string[], env: EroTokenojCliEnv): number {
  const parsed = parseEroTokenojArgs(argv, env);
  if (!parsed.ok) {
    env.stderr(`${parsed.message}\n${USAGE}`);
    return EXIT_USAGE;
  }
  if (parsed.command.kind === "help") {
    env.stdout(ERO_TOKENOJ_HELP);
    return EXIT_OK;
  }
  let planned: ReturnType<typeof planEroTokenoj>;
  try {
    planned = planEroTokenoj(parsed.command.source, parsed.command.packagesOnly);
  } catch (error) {
    env.stderr(`error ${errorMessage(error)}\n`);
    return EXIT_DOMAIN_ERROR;
  }
  if (!planned.ok) {
    env.stderr(
      `${formatIssues(planned.issues)}error The Modelo could not be loaded; nothing was written.\n`,
    );
    return EXIT_DOMAIN_ERROR;
  }
  const { files, summary } = planned.plan;
  if (parsed.command.check) {
    if (files.size === 0) {
      env.stdout(`${summary.join("\n")}\nNothing would change.\n`);
      return EXIT_OK;
    }
    env.stderr(
      `${summary.join("\n")}\nThese files would change:\n${[...files.keys()].map((file) => `  ${file}`).join("\n")}\nRun pnpm vortaro:ero-tokenoj without --check.\n`,
    );
    return EXIT_DOMAIN_ERROR;
  }
  try {
    for (const [file, text] of files) writeFileSync(file, text);
  } catch (error) {
    env.stderr(`error Could not write: ${errorMessage(error)}\n`);
    return EXIT_DOMAIN_ERROR;
  }
  env.stdout(
    `${summary.join("\n")}\n${files.size === 0 ? "Nothing to write." : [...files.keys()].map((file) => `wrote ${file}`).join("\n")}\n`,
  );
  return EXIT_OK;
}

if (import.meta.main) {
  process.exitCode = runEroTokenojCli(process.argv.slice(2), {
    // pnpm runs root scripts in the repo root; INIT_CWD is the directory the user invoked it from.
    cwd: process.env.INIT_CWD ?? process.cwd(),
    defaultSource: defaultModeloSource,
    stdout: (text) => process.stdout.write(text),
    stderr: (text) => process.stderr.write(text),
  });
}
