// A test double of Penpot's token import and theme activation, read from Penpot's source
// (penpot/penpot@fc8a126, 2026-10-06) — not a converter, a witness. It does what Penpot does with a
// folder import, and nothing Fundamento would like it to do:
// - `import_export.cljs` `file-path->set-name`: the set name is the file path without `.json`.
// - `tokens_lib.cljc` `add-set`: sets live in a tree of folders split at `/`; `get-sets` walks it
//   depth first, a folder where its first set was added. `tokenSetOrder` only decides the order of
//   insertion, never the order of application.
// - `parse-multi-set-dtcg-json`: a theme is a group, a name and the set names of
//   `selectedTokenSets`, whatever their status.
// - `files/tokens.cljc` `get-tokens-in-active-sets`: the active sets are the union of the sets of
//   the active themes, merged in set order; the later set wins a token.
// - `token.cljc` `dtcg-token-type->token-type`: a token whose `$type` Penpot does not know is
//   skipped on import.
// Aliases are resolved by name across the merged tokens, as Style Dictionary does for Penpot.

/** The `$type` names Penpot reads (`token.cljc`, `dtcg-token-type->token-type`). */
export const PENPOT_READS = new Set([
  "boolean",
  "borderRadius",
  "color",
  "dimension",
  "fontFamilies",
  "fontSizes",
  "fontWeights",
  "letterSpacing",
  "number",
  "opacity",
  "other",
  "rotation",
  "shadow",
  "sizing",
  "spacing",
  "string",
  "borderWidth",
  "textCase",
  "textDecoration",
  "typography",
  "fontWeight",
  "fontSize",
  "fontFamily",
  "boxShadow",
]);

export interface PenpotToken {
  type: string;
  value: unknown;
}

interface PenpotTheme {
  group: string;
  name: string;
  sets: string[];
}

export interface PenpotFile {
  /** Set names in Penpot's order of application. */
  sets: string[];
  themes: PenpotTheme[];
  /** `group/name` of the themes active right after the import. */
  activeThemes: string[];
  /** Token name -> type, of every token the import skipped. */
  skipped: Map<string, string>;
  tokensOf(set: string): ReadonlyMap<string, PenpotToken>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function flatten(
  tree: Record<string, unknown>,
  prefix: string,
  inherited: string | undefined,
  out: Map<string, PenpotToken>,
  skipped: Map<string, string>,
): void {
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith("$") || !isRecord(node)) continue;
    const name = prefix === "" ? key : `${prefix}.${key}`;
    const type = typeof node.$type === "string" ? node.$type : inherited;
    if (!("$value" in node)) {
      flatten(node, name, type, out, skipped);
      continue;
    }
    if (type === undefined || !PENPOT_READS.has(type)) {
      skipped.set(name, String(type));
      continue;
    }
    out.set(name, { type, value: node.$value });
  }
}

/** Imports a folder the way Penpot does: `files` maps the path inside the folder to its text. */
export function importPenpotFolder(files: Readonly<Record<string, string>>): PenpotFile {
  const themes = JSON.parse(files["$themes.json"] ?? "[]") as {
    group: string;
    name: string;
    selectedTokenSets: Record<string, string>;
  }[];
  const metadata = JSON.parse(files["$metadata.json"] ?? "{}") as {
    tokenSetOrder?: string[];
    activeThemes?: string[];
  };
  const fileSets = Object.keys(files)
    .filter((path) => !path.startsWith("$") && path.endsWith(".json"))
    .map((path) => path.slice(0, -".json".length));
  const inserted = [...new Set([...(metadata.tokenSetOrder ?? []), ...fileSets])].filter((name) =>
    fileSets.includes(name),
  );

  // The folder tree: a folder is a Map, a set a string leaf; insertion order is kept.
  type Folder = Map<string, Folder | string>;
  const root: Folder = new Map();
  for (const name of inserted) {
    const parts = name.split("/");
    let folder = root;
    for (const part of parts.slice(0, -1)) {
      const key = `G-${part}`;
      let next = folder.get(key);
      if (!(next instanceof Map)) {
        next = new Map();
        folder.set(key, next);
      }
      folder = next;
    }
    folder.set(`S-${parts.at(-1)}`, name);
  }
  const order: string[] = [];
  const walk = (folder: Folder) => {
    for (const entry of folder.values()) {
      if (entry instanceof Map) walk(entry);
      else order.push(entry);
    }
  };
  walk(root);

  const skipped = new Map<string, string>();
  const tokens = new Map<string, Map<string, PenpotToken>>();
  for (const name of order) {
    const out = new Map<string, PenpotToken>();
    flatten(JSON.parse(files[`${name}.json`] ?? "{}"), "", undefined, out, skipped);
    tokens.set(name, out);
  }
  return {
    sets: order,
    themes: themes.map((theme) => ({
      group: theme.group,
      name: theme.name,
      sets: Object.keys(theme.selectedTokenSets).filter((set) => inserted.includes(set)),
    })),
    activeThemes: metadata.activeThemes ?? [],
    skipped,
    tokensOf: (set) => tokens.get(set) ?? new Map(),
  };
}

/** The tokens Penpot shows with the given themes active (`group/name`), aliases resolved. */
export function activate(
  file: PenpotFile,
  activeThemes: readonly string[],
): Map<string, PenpotToken> {
  const active = new Set(
    file.themes
      .filter((theme) => activeThemes.includes(`${theme.group}/${theme.name}`))
      .flatMap((theme) => theme.sets),
  );
  const merged = new Map<string, PenpotToken>();
  for (const set of file.sets) {
    if (!active.has(set)) continue;
    for (const [name, token] of file.tokensOf(set)) merged.set(name, token);
  }
  const resolve = (value: unknown, depth: number): unknown => {
    if (depth > 32) throw new Error("alias cycle");
    if (typeof value === "string") {
      const match = /^\{([^}]+)\}$/.exec(value);
      if (match === null) return value;
      const target = merged.get(match[1] ?? "");
      if (target === undefined) throw new Error(`missing reference ${value}`);
      return resolve(target.value, depth + 1);
    }
    if (Array.isArray(value)) return value.map((item) => resolve(item, depth));
    if (isRecord(value)) {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v, depth)]));
    }
    return value;
  };
  return new Map(
    [...merged].map(([name, token]) => [
      name,
      { type: token.type, value: resolve(token.value, 0) },
    ]),
  );
}
