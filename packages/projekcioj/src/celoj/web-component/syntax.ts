// The small grammars of the code block (Spec 036 Teil 5 ②b-5; Spec 029 ①-2, A-kodbloko-6): Celo
// knowledge (Art. VIII) of how the words of a few languages fall into the kinds the Skemo colours
// (parts keyword, name, string, number, comment). No dependency: each grammar is an ordered list of
// patterns tried at every position of the text; the first that matches takes the word, a match of
// kind "" stays plain text (an identifier is consumed whole, so no keyword is found inside it).
// The patterns are written for this Celo, from the languages' own grammars; no other system's
// grammar is copied (clean room).

/** One rule: the kind of the words it matches ("" = plain) and its pattern source (sticky). */
export type SyntaxRule = readonly [kind: "" | SyntaxKind, source: string];

/** The kinds of words the Skemo of the kodbloko colours (parts and roles color.syntax.*). */
export type SyntaxKind = "keyword" | "name" | "string" | "number" | "comment";

const DOUBLE_QUOTED = String.raw`"(?:[^"\\\n]|\\.)*"?`;
const SINGLE_QUOTED = String.raw`'(?:[^'\\\n]|\\.)*'?`;
const BLOCK_COMMENT = String.raw`\/\*[\s\S]*?(?:\*\/|$)`;

const JAVASCRIPT: readonly SyntaxRule[] = [
  ["comment", String.raw`\/\/[^\n]*`],
  ["comment", BLOCK_COMMENT],
  ["string", DOUBLE_QUOTED],
  ["string", SINGLE_QUOTED],
  ["string", String.raw`\u0060(?:[^\u0060\\]|\\[\s\S])*\u0060?`],
  [
    "keyword",
    String.raw`\b(?:as|async|await|break|case|catch|class|const|continue|default|delete|do|else|enum|export|extends|finally|for|from|function|if|implements|import|in|instanceof|interface|let|new|of|private|protected|public|readonly|return|static|super|switch|this|throw|try|type|typeof|var|void|while|yield)\b`,
  ],
  ["number", String.raw`\b(?:true|false|null|undefined)\b`],
  [
    "number",
    String.raw`\b(?:0[xX][\dA-Fa-f_]+|0[bB][01_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?n?)\b`,
  ],
  ["name", String.raw`[A-Za-z_$][\w$]*(?=\s*\()`],
  ["", String.raw`[A-Za-z_$][\w$]*`],
];

const JSON_RULES: readonly SyntaxRule[] = [
  ["name", String.raw`"(?:[^"\\\n]|\\.)*"(?=\s*:)`],
  ["string", DOUBLE_QUOTED],
  ["number", String.raw`-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?`],
  ["number", String.raw`\b(?:true|false|null)\b`],
];

const SHELL: readonly SyntaxRule[] = [
  ["comment", String.raw`(?<![^\s])#[^\n]*`],
  ["string", String.raw`"(?:[^"\\]|\\[\s\S])*"?`],
  ["string", "'[^']*'?"],
  ["name", String.raw`\$\{[^}\n]*\}?|\$[A-Za-z_]\w*`],
  ["keyword", String.raw`(?<![^\s])--?[A-Za-z][\w-]*`],
  ["name", String.raw`(?<=(?:^|[\n|;&(])[ \t]*)[A-Za-z_./][\w./-]*`],
  ["number", String.raw`\b\d+\b`],
  ["", String.raw`[A-Za-z_][\w./-]*`],
];

const CSS: readonly SyntaxRule[] = [
  ["comment", BLOCK_COMMENT],
  ["string", DOUBLE_QUOTED],
  ["string", SINGLE_QUOTED],
  ["keyword", String.raw`@[\w-]+|!important\b`],
  ["number", String.raw`#[\dA-Fa-f]{3,8}\b`],
  ["name", String.raw`(?<=(?:^|[{;\n])\s*)--?[A-Za-z_][\w-]*(?=\s*:)(?![^\n;{}]*\{)`],
  ["", String.raw`-?[A-Za-z_][\w-]*`],
  ["number", String.raw`-?(?:\d+\.?\d*|\.\d+)(?:%|[A-Za-z]+)?`],
];

const HTML: readonly SyntaxRule[] = [
  ["comment", String.raw`<!--[\s\S]*?(?:-->|$)`],
  ["keyword", String.raw`(?<=<\/?)[A-Za-z][\w:.-]*`],
  ["name", String.raw`(?<=\s)[A-Za-z_:@][\w:.-]*(?=\s*=)`],
  ["string", String.raw`(?<==\s*)(?:"[^"]*"?|'[^']*'?)`],
  ["", String.raw`[A-Za-z][\w-]*`],
];

const PYTHON: readonly SyntaxRule[] = [
  ["comment", String.raw`#[^\n]*`],
  [
    "string",
    String.raw`(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)`,
  ],
  [
    "keyword",
    String.raw`\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b`,
  ],
  ["number", String.raw`\b(?:True|False|None)\b`],
  ["number", String.raw`\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?j?\b`],
  ["name", String.raw`[A-Za-z_]\w*(?=\s*\()`],
  ["", String.raw`[A-Za-z_]\w*`],
];

/** The grammars by name; a language the block knows is one of these or one of their short names. */
export const SYNTAX_GRAMMARS: Readonly<Record<string, readonly SyntaxRule[]>> = {
  javascript: JAVASCRIPT,
  json: JSON_RULES,
  shell: SHELL,
  css: CSS,
  html: HTML,
  python: PYTHON,
};

/** The names a person writes for a language (lower case) and the grammar each means. */
export const SYNTAX_ALIASES: Readonly<Record<string, string>> = {
  javascript: "javascript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  typescript: "javascript",
  ts: "javascript",
  tsx: "javascript",
  json: "json",
  jsonc: "json",
  shell: "shell",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  console: "shell",
  css: "css",
  scss: "css",
  html: "html",
  xml: "html",
  svg: "html",
  python: "python",
  py: "python",
};

/**
 * The grammars as a constant of the element's code: JSON with the backtick and the dollar sign
 * escaped, so the code the template writes holds neither.
 */
export function syntaxConstants(): string {
  const escaped = (value: unknown) =>
    JSON.stringify(value).replaceAll("`", "\\u0060").replaceAll("$", "\\u0024");
  return `/** Spec 036 ②b-5 (①-2): the grammars of the languages the code block colours. */
const SYNTAX_GRAMMARS: Readonly<Record<string, readonly (readonly [string, string])[]>> = ${escaped(SYNTAX_GRAMMARS)};
/** The names of the languages, lower case, and the grammar each means. */
const SYNTAX_ALIASES: Readonly<Record<string, string>> = ${escaped(SYNTAX_ALIASES)};
`;
}
