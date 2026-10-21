// The settings of the Metiejo (Spec 023, §4.3, §4.5): the `.env` in the root of the checkout is
// the only source; the server reads the names of this spec and nothing else, shows and logs no
// value. What the app needs in round 1 is the private font repository (FM_TIPAROJ_REPO); the
// keys of the AI providers are read for round 2 and leave this module only as "present". Pure
// apart from `readSettings`, the I/O edge.

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/** The variables of the spec, in its order (§4.3). */
export const ENV_NAMES = [
  "FM_TIPAROJ_REPO",
  "FM_MARKEN_DIR",
  "FM_KI_ANBIETER",
  "FM_KI_MODELL",
  "MISTRAL_API_KEY",
  "OPENAI_API_KEY",
  "OPENROUTER_API_KEY",
] as const;

export type EnvName = (typeof ENV_NAMES)[number];

/** `owner/name` of a GitHub repository. */
export const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

/** What the app knows of its settings: never the value of a key (M-7). */
export interface Settings {
  /** The private font repository (`owner/name`), when FM_TIPAROJ_REPO names one. */
  tiparojRepo?: string;
  /** The folder of the brands (FM_MARKEN_DIR, O-3), as written; see `markenDirOf`. */
  markenDir?: string;
  /** The variables that are set, by name. */
  present: EnvName[];
}

const isEnvName = (key: string): key is EnvName => (ENV_NAMES as readonly string[]).includes(key);

function unquote(text: string): string {
  const trimmed = text.trim();
  const quote = trimmed[0];
  if ((quote === '"' || quote === "'") && trimmed.length >= 2 && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Reads a `.env` text: `KEY=VALUE` lines, an optional `export`, quotes around the value, comments
 * and empty lines aside. Only the names of the spec come back, only with a non-empty value.
 */
export function parseEnv(text: string): Partial<Record<EnvName, string>> {
  const values: Partial<Record<EnvName, string>> = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;
    const equals = line.indexOf("=");
    if (equals === -1) continue;
    const key = line
      .slice(0, equals)
      .trim()
      .replace(/^export\s+/, "");
    const value = unquote(line.slice(equals + 1));
    if (isEnvName(key) && value !== "") values[key] = value;
  }
  return values;
}

/** The settings of parsed values: the repository name, and which names are set. */
export function settingsOf(values: Partial<Record<EnvName, string>>): Settings {
  const present = ENV_NAMES.filter((name) => values[name] !== undefined);
  const repo = values.FM_TIPAROJ_REPO;
  const settings: Settings = { present };
  if (repo !== undefined && REPO_PATTERN.test(repo)) settings.tiparojRepo = repo;
  if (values.FM_MARKEN_DIR !== undefined) settings.markenDir = values.FM_MARKEN_DIR;
  return settings;
}

/**
 * Where the brands live (O-3 of plan ①): FM_MARKEN_DIR — `~` expanded, a relative path resolved
 * against the checkout root — else `~/Fundamento/marken`. Never inside the repository: the brand
 * module refuses that.
 */
export function markenDirOf(settings: Settings, home: string, root: string): string {
  const given = settings.markenDir;
  if (given === undefined || given === "") return join(home, "Fundamento", "marken");
  if (given === "~" || given.startsWith("~/")) return join(home, given.slice(2));
  return resolve(root, given);
}

/** The text of `.env.example`: the names, every value empty, no repository (§4.3). */
export function envExampleText(): string {
  return [
    "# Settings of the Metiejo (Spec 023, §4.3 and §4.5). Copy to .env in the checkout root and fill in",
    "# the values yourself; .env is ignored by git and read only by the local server, never logged.",
    "# FM_MARKEN_DIR: where the brands live, outside the repository (default ~/Fundamento/marken).",
    ...ENV_NAMES.map((name) => `${name}=`),
    "",
  ].join("\n");
}

/** Reads `<root>/.env` when it exists; nothing else is ever read (§4.3). */
export function readSettings(root: string): Settings {
  const file = join(root, ".env");
  if (!existsSync(file)) return { present: [] };
  return settingsOf(parseEnv(readFileSync(file, "utf8")));
}
