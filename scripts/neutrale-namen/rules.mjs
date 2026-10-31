// Spec 036 Teil 6 (D-11, D-23, D-24, D-25): the rule table of the codemod that gives the public
// repository neutral names. One module, used by the codemod (codemod.mjs), by the readers of the
// old names and the byte-equality harness of S36-5.2, and by the merge simulation of S36-6.2.
//
// The old names never stand here as plain text (D-23): they are composed at run time from
// fragments, so neither the run's guard (`pruefen`) nor `check:privat` needs an exception for this
// file. The checks themselves only know SHA-256 hashes of the old names.
//
// Every rule is deterministic and idempotent: no output of a rule contains an input of any rule,
// so a second run over the mapped tree changes nothing.

/** The fragments of the word that R-12 of Spec 036 bans (the old brand and domain name). */
const WORD_FRAGMENTS = Object.freeze(["cif", "ere", "cigo"]);

const word = WORD_FRAGMENTS.join("");
const fontRepoName = `fundamento-aspekto-${word}`;

/**
 * The old names, composed at run time (D-23). Never write them into a file of the repository;
 * `check:privat` finds them by hash.
 */
export function oldNames() {
  return Object.freeze({
    word,
    /** The DTCG extension key of every token, set and ID. */
    extensionKey: `com.${word}.fundamento`,
    /** The base of every schema `$id` and absolute `$ref` (a path follows). */
    schemaBase: `https://${word}.com/fundamento/schema/`,
    /** The ontology base (a fragment may follow). */
    ontologioBase: `https://fundamento.${word}.com/ontologio`,
    /** The private repository of the licensed fonts (also used as folder and archive name). */
    fontRepoName,
    /** The same repository with its owner. */
    fontRepoFull: `thojank/${fontRepoName}`,
  });
}

/** The new names (D-09, D-25). */
export const NEW_NAMES = Object.freeze({
  extensionKey: "fundamento",
  schemaPrefix: "urn:fundamento:schema:",
  ontologio: "urn:fundamento:ontologio",
  /** The value the private font repository is reached by (Spec 036 6.6). */
  fontRepoVariable: "FM_TIPAROJ_REPO",
  /** Neutral folder and archive name of the private package (source spec, Teil 6). */
  privateFolder: "fundamento-tiparoj-privataj",
  /** The neutral wording of the constitution and the road map for the private Aspekto (D-24). */
  privateAspekto: "privates Aspekto-Paket",
  /** Neutral placeholder name for the private Aspekto where a name is needed (D-S36-5.1-4). */
  placeholder: "privata",
  /** Reserved, non-resolving host for a mention of the old web site (RFC 2606). */
  placeholderHost: "privata.example",
});

/** The expression a test file uses instead of the word (D-24): composed at run time. */
export function composedWordExpression() {
  return `[${WORD_FRAGMENTS.map((fragment) => JSON.stringify(fragment)).join(", ")}].join("")`;
}

/**
 * The URN of a schema from the path after the old schema base (D-25): without `.schema.json` or
 * `.json`, every `/` becomes `:`. `modelo.schema.json` → `urn:fundamento:schema:modelo`,
 * `mcp/common.json` → `urn:fundamento:schema:mcp:common`.
 */
export function schemaUrn(path) {
  const name = path.replace(/\.schema\.json$/, "").replace(/\.json$/, "");
  return `${NEW_NAMES.schemaPrefix}${name.split("/").join(":")}`;
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/** A dot as it stands in text, in a JSON string of a regex (`\\.`) or in a regex (`\.`). */
const DOT = String.raw`(?:\\\\|\\)?\.`;
/** A path segment of a schema URL: a name with dotted parts, never ending in a dot. */
const SEGMENT = String.raw`[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*`;

/** Replaces every match of `pattern` (global) and counts the replacements. */
function replaceCounting(text, pattern, replacement) {
  let count = 0;
  const result = text.replace(pattern, (...args) => {
    count += 1;
    return typeof replacement === "function" ? replacement(...args) : replacement;
  });
  return { text: result, count };
}

/** Replaces every occurrence of a literal string and counts the replacements. */
function replaceLiteral(text, from, to) {
  const parts = text.split(from);
  return { text: parts.join(to), count: parts.length - 1 };
}

/** Per-file wording (D-24): literal pairs, applied before the generic rules. */
function perFilePairs() {
  const { word: w } = oldNames();
  const priv = NEW_NAMES.privateAspekto;
  return Object.freeze({
    // Author line: the name stays, the domain goes.
    LICENSE: [[`Thorsten Jankowski (${w}.com)`, "Thorsten Jankowski"]],
    "README.md": [[`Thorsten Jankowski · [${w}.com](https://${w}.com)`, "Thorsten Jankowski"]],
    // Constitution Amendment v2.6 (redaktionell): the example name becomes a neutral wording.
    ".specify/memory/constitution.md": [
      [
        `\`aspekto: komuna\` (Referenz, MIT), \`aspekto: ${w}\` (extern, proprietär)`,
        `\`aspekto: komuna\` (Referenz, MIT), ein ${priv} (extern, proprietär)`,
      ],
      [`(z. B. \`${w}\`)`, `(z. B. ein ${priv})`],
      [`\`fm aspekto use ${w}\``, "`fm aspekto use <aspekto>`"],
      [`externes Aspekto-Paket \`${w}\``, `externes, ${priv}`],
    ],
    "docs/vojmapo.md": [
      [
        `| \`${fontRepoName}\` | privat (\`thojank/${fontRepoName}\`) |`,
        `| ${priv} | privat (Repo aus \`${NEW_NAMES.fontRepoVariable}\`) |`,
      ],
      [`externes Paket \`${w}\` (abgeleitet, privat)`, `externes, ${priv} (abgeleitet)`],
      [`die ${w}-Ableitung`, "die Ableitung des privaten Aspekto-Pakets"],
      [`(Befund ${w} sunken)`, "(Befund sunken aus dem privaten Aspekto-Paket)"],
      [`(wie bei ${w})`, "(wie beim privaten Aspekto-Paket)"],
      [`(wie ${w})`, "(wie beim privaten Aspekto-Paket)"],
      [`Abnahme ${w}`, "Abnahme des privaten Aspekto-Pakets"],
    ],
    "packages/modelo/data/reguloj.json": [
      [`finding from the ${w} acceptance`, "finding from the acceptance of a private Aspekto"],
    ],
  });
}

/** The constitution's version line and history entry of the amendment (D-24). */
const CONSTITUTION = ".specify/memory/constitution.md";
const CONSTITUTION_VERSION = ["Version 2.5 · 2026-10-24 ·", "Version 2.6 · 2026-10-31 ·"];
const CONSTITUTION_HISTORY_END = "Migration: keine Änderung an bestehenden Daten.";
const CONSTITUTION_AMENDMENT =
  "Migration: keine Änderung an bestehenden Daten; v2.6 (Spec 036 Teil 6, Constitution Amendment redaktionell, vom Maintainer zu bestätigen): Terminologio, Art. IV, Art. XIII und Phasenfolge nennen statt des Beispielnamens einer externen, proprietären Marke ein „privates Aspekto-Paket“. Grund: Das öffentliche Repo nennt keine fremde Marke und keine fremde Domain (Spec 036, V-3). Migration: keine; kein Grundsatz ändert sich.";

/** Whether a path is a test file whose assertions name the word (D-24). */
export function isTestFile(path) {
  return /\.(test|spec|check)\.[cm]?[jt]sx?$/.test(path);
}

/**
 * The rules in the order they apply. Each has an `id`, a `description` (English, for the report)
 * and `apply(text, path) → { text, count }`.
 */
export function rules() {
  const old = oldNames();
  const w = escapeRegExp(old.word);
  const pairs = perFilePairs();
  return Object.freeze([
    {
      id: "per-file",
      description:
        "Wording per file: LICENSE and README keep the author without the domain; the constitution, the road map and one Regulo name a private Aspekto (D-24).",
      apply(text, path) {
        let count = 0;
        for (const [from, to] of pairs[path] ?? []) {
          const step = replaceLiteral(text, from, to);
          text = step.text;
          count += step.count;
        }
        return { text, count };
      },
    },
    {
      id: "constitution-amendment",
      description:
        "Constitution Amendment v2.6 (redaktionell): version 2.5 → 2.6 and its history entry (D-24).",
      apply(text, path) {
        if (path !== CONSTITUTION) return { text, count: 0 };
        let count = 0;
        const version = replaceLiteral(text, CONSTITUTION_VERSION[0], CONSTITUTION_VERSION[1]);
        text = version.text;
        count += version.count;
        if (!text.includes("v2.6 (Spec 036") && text.includes(CONSTITUTION_HISTORY_END)) {
          const history = replaceLiteral(text, CONSTITUTION_HISTORY_END, CONSTITUTION_AMENDMENT);
          text = history.text;
          count += history.count;
        }
        return { text, count };
      },
    },
    {
      id: "test-assertion",
      description:
        "A test that asserts the word's absence composes it at run time instead of naming it (D-24).",
      apply(text, path) {
        if (!isTestFile(path)) return { text, count: 0 };
        const literal = replaceCounting(
          text,
          new RegExp(`(["'])${w}\\1`, "g"),
          composedWordExpression(),
        );
        const regex = replaceCounting(
          literal.text,
          new RegExp(String.raw`/\\b${w}\\b/`, "g"),
          `new RegExp(\`\\\\b\${${composedWordExpression()}}\\\\b\`)`,
        );
        return { text: regex.text, count: literal.count + regex.count };
      },
    },
    {
      id: "extension-key",
      description: `The DTCG extension key becomes \`${NEW_NAMES.extensionKey}\` (also escaped in a regex) (D-25).`,
      apply(text) {
        return replaceCounting(
          text,
          new RegExp(`com${DOT}${w}${DOT}fundamento`, "g"),
          NEW_NAMES.extensionKey,
        );
      },
    },
    {
      id: "schema-id",
      description: `A schema URL becomes \`${NEW_NAMES.schemaPrefix}<path>\` (without .schema.json/.json, "/" → ":"); a fragment stays (D-25).`,
      apply(text) {
        return replaceCounting(
          text,
          new RegExp(`https://${w}\\.com/fundamento/schema/((?:${SEGMENT})(?:/${SEGMENT})*)?`, "g"),
          (_match, path) => schemaUrn(path ?? ""),
        );
      },
    },
    {
      id: "ontologio",
      description: `The ontology base becomes \`${NEW_NAMES.ontologio}\`; a fragment stays (D-25).`,
      apply(text) {
        return replaceCounting(
          text,
          new RegExp(`https://fundamento${DOT}${w}${DOT}com/ontologio`, "g"),
          NEW_NAMES.ontologio,
        );
      },
    },
    {
      id: "font-repo",
      description: `The private font repository with its owner becomes \`$${NEW_NAMES.fontRepoVariable}\` (Spec 036 6.6).`,
      apply(text) {
        return replaceLiteral(text, old.fontRepoFull, `$${NEW_NAMES.fontRepoVariable}`);
      },
    },
    {
      id: "font-repo-name",
      description: `The private repository as folder, package or archive name becomes \`${NEW_NAMES.privateFolder}\` (source spec, Teil 6).`,
      apply(text) {
        return replaceLiteral(text, old.fontRepoName, NEW_NAMES.privateFolder);
      },
    },
    {
      id: "domain",
      description: `A remaining mention of the old web site becomes the reserved host \`${NEW_NAMES.placeholderHost}\`.`,
      apply(text) {
        return replaceCounting(
          text,
          new RegExp(`(?:www\\.)?${w}\\.(?:com|de)\\b`, "gi"),
          NEW_NAMES.placeholderHost,
        );
      },
    },
    {
      id: "word",
      description: `Any remaining occurrence of the word becomes the placeholder \`${NEW_NAMES.placeholder}\`.`,
      apply(text) {
        return replaceCounting(text, new RegExp(w, "gi"), NEW_NAMES.placeholder);
      },
    },
  ]);
}

/** The rule IDs in their order. */
export const RULE_IDS = Object.freeze(rules().map((rule) => rule.id));

/**
 * Maps the text of one repo file (path relative to the root, `/` separators) through every rule.
 * Returns the new text and the count per rule (only rules that matched).
 */
export function mapText(text, path) {
  const counts = {};
  for (const rule of rules()) {
    const step = rule.apply(text, path);
    if (step.count > 0) counts[rule.id] = step.count;
    text = step.text;
  }
  return { text, counts };
}

/**
 * Maps only the identifiers (extension key, schema IDs, ontology), without any wording. This is
 * the normalisation old → new of the readers and of the byte-equality harness (S36-5.2).
 */
export function mapIdentifiers(text) {
  for (const rule of rules()) {
    if (rule.id === "extension-key" || rule.id === "schema-id" || rule.id === "ontologio") {
      text = rule.apply(text, "").text;
    }
  }
  return text;
}

/**
 * Generators whose outputs are regenerated instead of text-replaced (technical spec, Teil 6). A
 * generator runs only when its script exists in the checkout; `outputs` are path prefixes the
 * text rules leave alone while the generator runs. `build` comes before the Ero-Tokens because
 * their CLI runs from `dist`, which must carry the new extension key.
 */
export const GENERATORS = Object.freeze([
  {
    id: "schema-types",
    manifest: "packages/modelo/package.json",
    script: "generate:types",
    command: ["pnpm", "--filter", "@fundamento/modelo", "generate:types"],
    outputs: ["packages/modelo/src/generated/"],
  },
  {
    id: "build",
    manifest: "package.json",
    script: "build",
    command: ["pnpm", "build"],
    outputs: [],
  },
  {
    id: "ero-tokenoj",
    manifest: "package.json",
    script: "vortaro:ero-tokenoj",
    command: ["pnpm", "vortaro:ero-tokenoj"],
    outputs: [],
  },
]);

/**
 * The formatter of the checkout, run over the changed files before the generators: a rule can
 * lengthen a line past the formatter's width or shorten one it had wrapped. Runs only when the
 * checkout has `config`; the changed paths follow the command.
 */
export const FORMATTER = Object.freeze({
  id: "biome",
  config: "biome.json",
  command: [
    "pnpm",
    "exec",
    "biome",
    "check",
    "--write",
    "--files-ignore-unknown=true",
    "--no-errors-on-unmatched",
  ],
});

/** Where the exception list lives in the checkout (shared with `check:privat`, D-23). */
export const EXCEPTIONS_FILE = "packages/modelo/src/checks/privat/escepoj.json";
