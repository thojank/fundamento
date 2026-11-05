// Spec 040 T-5 (E-6): a test result from the Turborepo cache is only right if the hash of the test
// task covers every file the test reads. Turborepo hashes the files of the task's own package and,
// through `dependsOn`, the hashes of the tasks it waits for (each build hashes its package). A test
// that reads a file of a package it does not wait for, or of no package at all (`specs/`,
// `scripts/`, `.github/`), must name it under `inputs` in turbo.json – or a cache hit replays a
// green result after that file changed.
//
// This test finds such reads in the test code of every package and asks Turborepo itself
// (`turbo run test --dry=json`) which files the hash of each test task covers.
//
// ## What it finds – and what not
//
// It reads the source text, not the running program. A read is a path built from the test file's
// own place: `new URL("…", import.meta.url)`, `join`/`resolve` on such a path, a template literal
// that starts with one, `process.cwd()` (the package directory under Vitest and Playwright), and a
// relative `import`. A variable that holds such a path counts wherever it is used, unless it is
// the working directory of a spawned process (`cwd`, `INIT_CWD`) or `relative()` measures against
// it. Handed on whole – to a check, to `git ls-files` – it counts as a read of everything below.
// A part it cannot follow stands for one path segment when more of the path follows (`*`), and
// for everything below when it ends the path (`**`).
//
// It does not see a path that a spawned binary or a function of the product finds on its own, nor
// a path built from values it cannot follow. Behind it stand the write-only test cache on `main`,
// at night and on `workflow_dispatch` (ci.yml), and the Gegenprobe of Spec 040 (AC-B12).

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, posix, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));

/** A test file's text twice: without comments, and without comments and literal text. */
interface Source {
  code: string;
  /** Same length; the text of strings, templates and regular expressions is blanked out. */
  masked: string;
}

/** A path the test code reads, at a line of its file; it may hold `*` and `**`. */
interface Read {
  path: string;
  line: number;
  /** A relative import: the module runs, so what it reads counts as well. */
  imported?: true;
}

/** Characters after which a `/` starts a regular expression, not a division. */
const BEFORE_REGEX = /(?:^|[(,=:[!&|?{};+\-*%<>~^]|\breturn|\btypeof|\bcase)\s*$/;

/** Blank out comments (in both texts) and literal text (in `masked`), keeping every index. */
function scan(text: string): Source {
  let code = "";
  let masked = "";
  const keep = (part: string) => {
    code += part;
    masked += part;
  };
  const blank = (part: string, inCode: boolean) => {
    const spaces = part.replace(/[^\n]/g, " ");
    code += inCode ? part : spaces;
    masked += spaces;
  };
  // Open template literals and the braces inside their `${…}`.
  const stack: Array<"template" | "expression" | "brace"> = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i] ?? "";
    const next = text[i + 1] ?? "";
    if (stack.at(-1) === "template") {
      if (c === "\\") {
        blank(text.slice(i, i + 2), true);
        i += 2;
      } else if (c === "`") {
        keep(c);
        stack.pop();
        i += 1;
      } else if (c === "$" && next === "{") {
        keep("${");
        stack.push("expression");
        i += 2;
      } else {
        blank(c, true);
        i += 1;
      }
      continue;
    }
    if (c === "/" && (next === "/" || next === "*")) {
      const end = next === "/" ? text.indexOf("\n", i) : text.indexOf("*/", i + 2) + 2;
      const stop = end <= i ? text.length : end;
      blank(text.slice(i, stop), false);
      i = stop;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== c && text[j] !== "\n") j += text[j] === "\\" ? 2 : 1;
      keep(c);
      blank(text.slice(i + 1, j), true);
      if (j < text.length) keep(text[j] ?? "");
      i = j + 1;
    } else if (c === "/" && BEFORE_REGEX.test(code)) {
      let j = i + 1;
      let inClass = false;
      while (j < text.length && text[j] !== "\n" && (inClass || text[j] !== "/")) {
        if (text[j] === "[") inClass = true;
        if (text[j] === "]") inClass = false;
        j += text[j] === "\\" ? 2 : 1;
      }
      keep(c);
      blank(text.slice(i + 1, j), true);
      if (j < text.length) keep(text[j] ?? "");
      i = j + 1;
    } else {
      if (c === "`") stack.push("template");
      if (c === "{" && stack.length > 0) stack.push("brace");
      if (c === "}" && stack.length > 0) stack.pop();
      keep(c);
      i += 1;
    }
  }
  return { code, masked };
}

/** The index after the bracket that closes the one at `open` (in masked text). */
function afterBracket(masked: string, open: number): number {
  let depth = 0;
  for (let i = open; i < masked.length; i += 1) {
    const c = masked[i] ?? "";
    if ("([{".includes(c)) depth += 1;
    if (")]}".includes(c)) depth -= 1;
    if (depth === 0) return i + 1;
  }
  return masked.length;
}

/** The end of the expression that starts at `start`: where its statement or argument ends. */
function expressionEnd(masked: string, start: number): number {
  let i = start;
  while (i < masked.length) {
    const c = masked[i] ?? "";
    if ("([{".includes(c)) i = afterBracket(masked, i);
    else if (";\n,)]}".includes(c)) return i;
    else i += 1;
  }
  return i;
}

/** The ranges of the top-level arguments of the call whose bracket opens at `open`. */
function argumentRanges(masked: string, open: number): Array<readonly [number, number]> {
  const end = afterBracket(masked, open) - 1;
  const ranges: Array<readonly [number, number]> = [];
  let start = open + 1;
  let i = start;
  while (i < end) {
    const c = masked[i] ?? "";
    if ("([{".includes(c)) {
      i = afterBracket(masked, i);
      continue;
    }
    if (c === ",") {
      ranges.push([start, i]);
      start = i + 1;
    }
    i += 1;
  }
  if (masked.slice(start, end).trim() !== "") ranges.push([start, end]);
  return ranges;
}

/** A path while the source is followed. */
interface PathValue {
  path: string;
}

/** What `evaluate` needs besides the text: the file, its package and the variables known. */
interface Place {
  file: string;
  packageDir: string;
  lookup: (name: string) => PathValue | undefined;
}

/** The parts of a template literal at [start, end): literal text and `${…}` ranges in turn. */
function templateParts(
  source: Source,
  start: number,
  end: number,
): Array<string | readonly [number, number]> {
  const parts: Array<string | readonly [number, number]> = [];
  let i = start + 1;
  let text = "";
  while (i < end - 1) {
    if (source.masked.startsWith("${", i)) {
      parts.push(text);
      text = "";
      const close = afterBracket(source.masked, i + 1);
      parts.push([i + 2, close - 1]);
      i = close;
    } else {
      text += source.code[i] ?? "";
      i += 1;
    }
  }
  parts.push(text);
  return parts;
}

/** A path from literal parts and parts not followed: `*` before more path, `**` at its end. */
function globOf(parts: ReadonlyArray<string | undefined>): string {
  return parts
    .map((part, index) =>
      part !== undefined ? part : parts.slice(index + 1).some((rest) => rest) ? "*" : "**",
    )
    .join("");
}

/**
 * The path the expression at [start, end) names, from the file's place and the variables known
 * there; undefined when it is no such path (a value, a temporary directory, a plain string).
 */
function evaluate(source: Source, from: number, to: number, place: Place): PathValue | undefined {
  const { masked, code } = source;
  let start = from;
  let end = to;
  for (;;) {
    while (start < end && /\s/.test(masked[start] ?? "")) start += 1;
    while (end > start && /\s/.test(masked[end - 1] ?? "")) end -= 1;
    const text = masked.slice(start, end);
    const suffix = /(?:\.pathname|\.href|\s+as\s+[\w.]+)$/.exec(text);
    if (suffix !== null) {
      end -= suffix[0].length;
      continue;
    }
    const wrapper = /^(?:fileURLToPath|String|realpathSync|normalize|pathToFileURL)\(/.exec(text);
    if (wrapper !== null && afterBracket(masked, start + wrapper[0].length - 1) === end) {
      start += wrapper[0].length;
      end -= 1;
      continue;
    }
    break;
  }
  const text = masked.slice(start, end);
  const literalAt = ([s, e]: readonly [number, number]): string | undefined => {
    const lead = masked.slice(s, e).length - masked.slice(s, e).trimStart().length;
    const trimmed = masked.slice(s + lead, e).trimEnd();
    const isString = /^(["'])\s*\1$/.test(trimmed) || /^`\s*`$/.test(trimmed);
    return isString ? code.slice(s + lead + 1, s + lead + trimmed.length - 1) : undefined;
  };

  if (/^[A-Za-z_$][\w$]*$/.test(text)) return place.lookup(text);
  if (text === "process.cwd()") return { path: `${place.packageDir}/` };
  if (text === "import.meta.dirname" || text === "__dirname") {
    return { path: `${dirname(place.file)}/` };
  }
  if (text.startsWith("`") && text.endsWith("`")) {
    const parts = templateParts(source, start, end);
    const first = parts[1];
    if (parts[0] !== "" || typeof first !== "object") return undefined;
    const base = evaluate(source, first[0], first[1], place);
    if (base === undefined) return undefined;
    const rest = parts.slice(2).map((part) => (typeof part === "string" ? part : undefined));
    return { path: base.path + globOf(rest) };
  }
  const call = /^(new URL|(?:path\.|posix\.)?(?:join|resolve)|dirname)\(/.exec(text);
  if (call?.[1] === undefined || afterBracket(masked, start + call[0].length - 1) !== end) {
    return undefined;
  }
  const args = argumentRanges(masked, start + call[0].length - 1);
  if (call[1] === "dirname") {
    const inner = args[0] && evaluate(source, args[0][0], args[0][1], place);
    return inner ? { path: `${dirname(inner.path)}/` } : undefined;
  }
  if (call[1] === "new URL") {
    const [relativeArg, baseArg] = args;
    if (relativeArg === undefined || baseArg === undefined) return undefined;
    const baseText = masked.slice(baseArg[0], baseArg[1]).trim();
    const base =
      baseText === "import.meta.url"
        ? { path: place.file }
        : evaluate(source, baseArg[0], baseArg[1], place);
    if (base === undefined) return undefined;
    let relativePath = literalAt(relativeArg);
    if (relativePath === undefined) {
      const [s, e] = relativeArg;
      const lead = masked.slice(s, e).length - masked.slice(s, e).trimStart().length;
      const trimmedEnd = s + masked.slice(s, e).trimEnd().length;
      if (masked[s + lead] !== "`") return undefined;
      const parts = templateParts(source, s + lead, trimmedEnd);
      relativePath = globOf(parts.map((part) => (typeof part === "string" ? part : undefined)));
    }
    if (base.path.includes("*")) return base;
    return { path: fileURLToPath(new URL(relativePath, pathToFileURL(base.path))) };
  }
  // join and resolve: a path, then parts.
  const [first, ...rest] = args;
  const base = first && evaluate(source, first[0], first[1], place);
  if (!base) return undefined;
  const parts = rest.map((range) => literalAt(range));
  const glob = parts
    .map((part, index) => `/${part ?? (index < parts.length - 1 ? "*" : "**")}`)
    .join("");
  return { path: base.path.includes("*") ? base.path : join(base.path, glob) };
}

/** A working directory of a spawned process: where it runs, not what it reads. */
const WORKING_DIRECTORY =
  /\b(?:cwd|INIT_CWD|initCwd)\b(?:\s*:\s*[\w.| ]+?)?\s*[:=]\s*(?:fileURLToPath\()?\s*$/;

/** Where a variable is used, not read from: its definition, a working directory, a base. */
const USED_NOT_READ = [
  /\b(?:const|let|var)\s+$/,
  /\b(?:join|resolve|relative|dirname)\(\s*$/,
  /\bnew URL\(\s*(?:"[^"]*"|'[^']*'|`[^`]*`)\s*,\s*$/,
  /`\$\{\s*$/,
  WORKING_DIRECTORY,
  /\.\s*$/,
];

/** Where a path expression starts. */
const PATH_EXPRESSION =
  /\bnew URL\(|(?<![\w$.])(?:path\.|posix\.)?(?:join|resolve)\(|`\$\{|\bprocess\.cwd\(\)|\bimport\.meta\.dirname\b|(?<![\w$.])__dirname\b/g;

/**
 * Every path the test code in `text` reads, as described at the head of this file. Pure: the
 * result follows from the text, the file's place and its package directory.
 */
function findReads(text: string, file: string, packageDir: string): Read[] {
  const source = scan(text);
  const { masked } = source;
  const lineOf = (index: number): number => masked.slice(0, index).split("\n").length;

  // Definitions in order, each followed with the variables known before it.
  const definitions: Array<{ name: string; start: number; end: number; value?: PathValue }> = [];
  const placeAt = (index: number): Place => ({
    file,
    packageDir,
    lookup: (name) => {
      let value: PathValue | undefined;
      for (const definition of definitions) {
        if (definition.start >= index) break;
        if (definition.name === name) value = definition.value;
      }
      return value;
    },
  });
  for (const match of masked.matchAll(
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::\s*[\w.<>[\]| ]+)?=(?![=>])\s*/g,
  )) {
    const start = match.index + match[0].length;
    const end = expressionEnd(masked, start);
    const value = evaluate(source, start, end, placeAt(start));
    definitions.push({ name: match[1] ?? "", start, end, ...(value ? { value } : {}) });
  }

  const reads: Read[] = [];
  // A definition that names a path is no read; its uses are.
  const covered: Array<readonly [number, number]> = definitions
    .filter((definition) => definition.value !== undefined)
    .map((definition) => [definition.start, definition.end] as const);
  const inCovered = (index: number) => covered.some(([s, e]) => index >= s && index < e);

  for (const match of masked.matchAll(PATH_EXPRESSION)) {
    if (inCovered(match.index)) continue;
    const end =
      match[0] === "`${"
        ? afterBracket(masked, match.index + 2) +
          masked.slice(afterBracket(masked, match.index + 2)).indexOf("`") +
          1
        : expressionEnd(masked, match.index);
    const value = evaluate(source, match.index, end, placeAt(match.index));
    if (value === undefined) continue;
    covered.push([match.index, end]);
    const before = masked.slice(Math.max(0, match.index - 60), match.index);
    if (WORKING_DIRECTORY.test(before)) continue;
    reads.push({ path: value.path, line: lineOf(match.index) });
  }

  // A variable that names a path, used on its own: everything below that path is read.
  const names = new Set(definitions.filter((d) => d.value !== undefined).map((d) => d.name));
  for (const match of masked.matchAll(/(?<![\w$])[A-Za-z_$][\w$]*/g)) {
    if (!names.has(match[0]) || inCovered(match.index)) continue;
    const before = masked.slice(Math.max(0, match.index - 60), match.index);
    const after = masked.slice(match.index + match[0].length);
    if (USED_NOT_READ.some((pattern) => pattern.test(before))) continue;
    if (/^\s*(?:\.(?!\.)|:(?!:)|=(?![=>]))/.test(after)) continue;
    const value = placeAt(match.index).lookup(match[0]);
    if (value !== undefined) reads.push({ path: value.path, line: lineOf(match.index) });
  }

  for (const match of masked.matchAll(/\b(?:from|import)\s*\(?\s*["']|\brequire\(\s*["']/g)) {
    const quote = match.index + match[0].length - 1;
    const close = masked.indexOf(masked[quote] ?? "", quote + 1);
    const specifier = source.code.slice(quote + 1, close);
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      const path = resolve(dirname(file), specifier);
      reads.push({ path, line: lineOf(match.index), imported: true });
    }
  }
  return reads;
}

/** The test code of a package: tests, specs, their helpers and the test runners' configs. */
function isTestCode(path: string): boolean {
  if (!/\.(?:[cm]?[jt]s|[jt]sx)$/.test(path)) return false;
  if (/(?:^|\/)(?:fixtures|node_modules|dist)\//.test(path)) return false;
  return (
    /\.(?:test|spec|check)\.[^/]+$/.test(path) ||
    /(?:^|\/)(?:test|e2e|test-doubles)\//.test(path) ||
    /(?:^|\/)(?:vitest|playwright)[^/]*\.config\.[^/]+$/.test(path) ||
    /(?:^|\/)vitest\.global-setup\.[^/]+$/.test(path)
  );
}

/**
 * Reads the scan takes wider than they are, judged by hand. `reads` is the read as the scan
 * reports it (`*`: every read of the file), `really` what the test reads instead (nothing, when
 * the path is a working directory or the file is no part of the test task), and `evidence` a
 * text that must stand in a file for the judgement to hold.
 */
const JUDGED: ReadonlyArray<{
  file: string;
  reads: string;
  really: readonly string[];
  evidence: readonly [file: string, text: string];
}> = [
  // fm(args, initCwd): the root is the INIT_CWD of the spawned fm, which resolves --path there.
  {
    file: "packages/cli/src/index.test.ts",
    reads: ".",
    really: [],
    evidence: ["packages/cli/src/index.test.ts", "function fm(args: readonly string[], initCwd"],
  },
  // join(ROOT, file): the plan that STREUUNG_FONTO names.
  {
    file: "packages/nordstelo/src/ablauf/raporto.test.ts",
    reads: "**",
    really: ["specs/034-nachlese-12/plan.md"],
    evidence: [
      "packages/nordstelo/src/ablauf/raporto.ts",
      'STREUUNG_FONTO = "specs/034-nachlese-12/plan.md, ',
    ],
  },
  // readdirSync(packages) lists the names; of each package only its package.json is read.
  {
    file: "packages/projekcioj/src/fonto/komuna-eroj-fonto.test.ts",
    reads: "packages",
    really: ["packages/*/package.json"],
    evidence: [
      "packages/projekcioj/src/fonto/komuna-eroj-fonto.test.ts",
      "for (const dir of readdirSync(packages)) {",
    ],
  },
  // check:bazo runs it (vitest.bazo.config.ts); the config of the test task excludes it.
  {
    file: "packages/projekcioj/src/celoj/vitrino/bazo.test.ts",
    reads: "*",
    really: [],
    evidence: ["packages/projekcioj/vitest.config.ts", '"src/celoj/vitrino/bazo.test.ts"'],
  },
  // test:browser runs it (vitest.browser.config.ts), locally only; the test task excludes it.
  {
    file: "packages/ekranoj/src/bildigilo.browser.test.ts",
    reads: "*",
    really: [],
    evidence: ["packages/ekranoj/vitest.config.ts", '"**/*.browser.test.ts"'],
  },
];

/** A repo-relative path or glob (`*` one segment, `**` any) as a test for files at or below it. */
function matcher(glob: string): RegExp {
  if (glob === "") return /^/;
  const body = glob
    .split(/(\*\*|\*)/)
    .map((part) =>
      part === "**" ? ".*" : part === "*" ? "[^/]*" : part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"),
    )
    .join("");
  return new RegExp(`^${body}(?:/.*)?$`);
}

// ---------------------------------------------------------------------------------------------
// The repository and Turborepo's view of it.

interface DryTask {
  taskId: string;
  task: string;
  command: string;
  directory: string;
  inputs: Record<string, string>;
  dependencies: string[];
}

/** Every file Git knows or would add (new files count before their commit), repo-relative. */
function workspaceFiles(): string[] {
  return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\0")
    .filter((path) => path !== "");
}

/** `turbo run test lint --dry=json`: every task with its hashed files and what it waits for. */
function dryRun(): DryTask[] {
  // Outside any running task: a TURBO_* variable of a surrounding `turbo run` stays out.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith("TURBO_")),
  );
  const out = execFileSync(
    join(repoRoot, "node_modules/.bin/turbo"),
    ["run", "test", "lint", "--dry=json"],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: { ...env, TURBO_TELEMETRY_DISABLED: "1", DO_NOT_TRACK: "1" },
      maxBuffer: 256 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    },
  );
  return (JSON.parse(out) as { tasks: DryTask[] }).tasks;
}

/** A read whose files the hash of its test task does not cover. */
interface Uncovered {
  task: string;
  at: string;
  reads: string;
  missing: string[];
}

/** Every read in test code that the hash of its package's test task does not cover. */
function uncoveredReads(
  tasks: readonly DryTask[],
  files: readonly string[],
  used: Set<(typeof JUDGED)[number]>,
): Uncovered[] {
  const byId = new Map(tasks.map((task) => [task.taskId, task]));
  const closure = (id: string, seen = new Set<string>()): Set<string> => {
    if (seen.has(id)) return seen;
    seen.add(id);
    for (const dependency of byId.get(id)?.dependencies ?? []) closure(dependency, seen);
    return seen;
  };
  const result: Uncovered[] = [];
  for (const task of tasks.filter((candidate) => candidate.task === "test")) {
    const waitsFor = [...closure(task.taskId)].flatMap((id) => byId.get(id) ?? []);
    const hashed = new Set(
      waitsFor.flatMap((other) =>
        Object.keys(other.inputs).map((input) => posix.join(other.directory, input)),
      ),
    );
    const built = new Set(waitsFor.filter((o) => o.task === "build").map((o) => o.directory));
    const own = `${task.directory}/`;
    const testCode = files.filter(
      (path) => path.startsWith(own) && isTestCode(path.slice(own.length)),
    );
    // Test code first; a module it imports from outside the package runs with it, so what that
    // module reads and imports counts too.
    const queue = testCode.map((file) => ({ file, from: file }));
    const seen = new Set(testCode);
    for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
      const { file, from } = next;
      const text = readFileSync(join(repoRoot, file), "utf8");
      const reads = findReads(text, join(repoRoot, file), join(repoRoot, task.directory));
      for (const read of reads) {
        const found = relative(repoRoot, read.path).split("\\").join("/") || ".";
        const judged = JUDGED.find(
          (entry) => entry.file === file && (entry.reads === "*" || entry.reads === found),
        );
        if (judged !== undefined) used.add(judged);
        for (const rel of judged === undefined ? [found] : judged.really) {
          if (rel.startsWith("..") || `${rel}/`.startsWith(own)) continue;
          const glob = rel === "." ? "" : rel;
          const candidates = [glob, glob.replace(/\.js$/, ".ts"), glob.replace(/\.js$/, ".tsx")];
          const needed =
            candidates
              .map((candidate) => files.filter((path) => matcher(candidate).test(path)))
              .find((list) => list.length > 0) ?? [];
          const at = file === from ? `${file}:${read.line}` : `${file}:${read.line} (via ${from})`;
          if (needed.length === 0) {
            // Nothing Git knows: a build output or a file a run writes. A build output of another
            // package needs its build among the tasks this one waits for.
            const owner = /^packages\/[^/*]+/.exec(rel)?.[0];
            if (owner !== undefined && !built.has(owner)) {
              result.push({ task: task.taskId, at, reads: rel, missing: [`${owner}#build`] });
            }
            continue;
          }
          const missing = needed.filter((path) => !hashed.has(path) && !path.startsWith(own));
          if (missing.length > 0) {
            result.push({ task: task.taskId, at, reads: rel, missing });
          }
          if (read.imported && needed.length === 1 && !seen.has(needed[0] ?? "")) {
            const module = needed[0] ?? "";
            seen.add(module);
            if (!module.startsWith("packages/")) queue.push({ file: module, from });
          }
        }
      }
    }
  }
  return result;
}

describe("the scan for reads outside a package (turbo-inputs)", () => {
  const file = "/r/packages/p/src/a/b.test.ts";
  const paths = (text: string) => findReads(text, file, "/r/packages/p").map((read) => read.path);

  it("resolves new URL against the file, join and templates against a root, and relative imports", () => {
    const text = [
      'import { x } from "../../../../scripts/ci/messung.mjs";',
      'import { y } from "./nah.js";',
      'const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));',
      'const spec = readFileSync(new URL("../../../../specs/001/spec.md", import.meta.url));',
      'const lock = readFileSync(join(repoRoot, "packages", "q", "data.json"));',
      "const ci = `${repoRoot}.github/workflows/ci.yml`;",
      "readFileSync(ci);",
      'await import(join(repoRoot, "packages/eroj/test/vitrino-partoj.ts"));',
    ].join("\n");
    expect(paths(text).sort()).toEqual([
      "/r/.github/workflows/ci.yml",
      "/r/packages/eroj/test/vitrino-partoj.ts",
      "/r/packages/p/src/a/nah.js",
      "/r/packages/q/data.json",
      "/r/scripts/ci/messung.mjs",
      "/r/specs/001/spec.md",
    ]);
  });

  it("takes a root handed on whole as everything below it, and a part not followed as a glob", () => {
    const text = [
      'const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));',
      'execFileSync("git", ["-C", repoRoot, "ls-files"]);',
      'readFileSync(join(repoRoot, "specs", name));',
      "readFileSync(`${repoRoot}packages/${name}/package.json`);",
      "readFileSync(new URL(`../../../${dir}/aspekto.json`, import.meta.url));",
    ].join("\n");
    expect(paths(text).sort()).toEqual([
      "/r/",
      "/r/packages/*/aspekto.json",
      "/r/packages/*/package.json",
      "/r/specs/**",
    ]);
  });

  it("does not count a definition, a working directory, relative(), a comment or a string", () => {
    const text = [
      'const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));',
      'execFileSync("pnpm", ["build"], { cwd: repoRoot });',
      'execFileSync("pnpm", ["build"], { cwd: fileURLToPath(new URL("../..", import.meta.url)) });',
      "const env = { ...process.env, INIT_CWD: repoRoot };",
      "const shown = relative(repoRoot, file);",
      '// readFileSync(new URL("../../../../specs/x.md", import.meta.url));',
      'const quoted = "readFileSync(join(repoRoot, \\"specs\\"))";',
      'const pattern = /join\\(repoRoot, "x"\\)/;',
      'const own = join(process.cwd(), "test", "fixtures");',
      "readFileSync(own);",
    ].join("\n");
    expect(paths(text)).toEqual(["/r/packages/p/test/fixtures"]);
  });

  it("follows a variable to its last definition before the use", () => {
    const text = [
      'let root = fileURLToPath(new URL("../../../../docs/", import.meta.url));',
      "readdirSync(root);",
      'root = mkdtempSync(join(tmpdir(), "x"));',
      'const root = mkdtempSync(join(tmpdir(), "y"));',
      "readdirSync(root);",
    ].join("\n");
    expect(paths(text)).toEqual(["/r/docs/"]);
  });
});

describe("turbo.json covers what the tests read (Spec 040 T-5, E-6)", () => {
  let tasks: DryTask[] = [];
  let uncovered: Uncovered[] = [];
  const used = new Set<(typeof JUDGED)[number]>();

  beforeAll(() => {
    tasks = dryRun();
    uncovered = uncoveredReads(tasks, workspaceFiles(), used);
  });

  it("every test task keeps its own package in the hash ($TURBO_DEFAULT$)", () => {
    const turbo = JSON.parse(readFileSync(join(repoRoot, "turbo.json"), "utf8")) as {
      tasks: Record<string, { inputs?: string[] }>;
    };
    for (const [name, definition] of Object.entries(turbo.tasks)) {
      if ((name === "test" || name.endsWith("#test")) && definition.inputs !== undefined) {
        expect(definition.inputs, name).toContain("$TURBO_DEFAULT$");
      }
    }
  });

  // A cache that outlives the run (ci.yml keeps .turbo/cache) must not replay a build or a lint
  // after the root configs they read changed: every tsconfig extends tsconfig.base.json, and
  // Biome takes its rules from the root biome.json.
  it("every build and lint hashes the root configs it reads (tsconfig.base.json, biome.json)", () => {
    const run = tasks.filter(
      (task) => (task.task === "build" || task.task === "lint") && task.command !== "<NONEXISTENT>",
    );
    expect(run.length).toBeGreaterThan(10);
    for (const task of run) {
      const hashed = Object.keys(task.inputs).map((input) => posix.join(task.directory, input));
      if (/\btsc\b/.test(task.command)) expect(hashed, task.taskId).toContain("tsconfig.base.json");
      if (/\bbiome\b/.test(task.command)) expect(hashed, task.taskId).toContain("biome.json");
    }
  });

  it("every file a test reads outside its package is in the hash of its test task", () => {
    expect(tasks.filter((task) => task.task === "test").length).toBeGreaterThan(5);
    const report = uncovered.map((entry) => {
      const shown = entry.missing.slice(0, 3).join(", ");
      const more = entry.missing.length > 3 ? ` (+${entry.missing.length - 3})` : "";
      return `${entry.task}: ${entry.at} reads ${entry.reads}, not hashed: ${shown}${more}`;
    });
    expect(report).toEqual([]);
  });

  it("every read judged by hand is still found, and its evidence still stands", () => {
    for (const entry of JUDGED) {
      expect(used.has(entry), `${entry.file} ${entry.reads}`).toBe(true);
      const [file, text] = entry.evidence;
      expect(readFileSync(join(repoRoot, file), "utf8"), file).toContain(text);
    }
  });
});
