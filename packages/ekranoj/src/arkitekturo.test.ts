// AC-10 (Spec 037): ekranoj is an MCP client only. Its module graph never reaches nordstelo, the
// MCP server, the Eroj or the Gvidanto internals of the Modelo – not by a static, dynamic or
// type-only import, not by an `export … from`, not through a relative or `/dist/` path, and not as
// a dependency in package.json. `@fundamento/modelo` is allowed for types only (`import type`).
//
// Allowed transitively: `@fundamento/metiejo` loads `@fundamento/agordilo`, `@fundamento/eroj`,
// `@fundamento/modelo` and `@fundamento/projekcioj` itself; that is metiejo's graph, not ekranoj's
// (implementation spec §2.4, AC-10). This test reads ekranoj's own sources and manifest only.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL(".", import.meta.url));
const PACKAGE = resolve(SRC, "..");
const REPO = resolve(PACKAGE, "../..");

/** Repo-relative folders no specifier may resolve into (sources and builds). */
const FORBIDDEN_DIRS = [
  "packages/nordstelo",
  "packages/mcp",
  "packages/eroj",
  "packages/modelo/src/gvidanto",
  "packages/modelo/dist/gvidanto",
];
const FORBIDDEN_PACKAGES = ["@fundamento/nordstelo", "@fundamento/mcp", "@fundamento/eroj"];
const TYPES_ONLY = "@fundamento/modelo";
const DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

type Kind = "static" | "type" | "dynamic" | "side-effect" | "require";

interface Specifier {
  specifier: string;
  kind: Kind;
}

interface Violation {
  file: string;
  specifier: string;
  rule: "forbidden-import" | "modelo-value-import" | "dynamic-import-computed";
}

/**
 * The source without comments: a comment loads nothing. A line comment starts at `//` not preceded
 * by `:` (so `https://` in a string stays).
 */
function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/** Every module specifier of a source text, ordered by position. */
function specifiersOf(text: string): Specifier[] {
  const source = withoutComments(text);
  const found: (Specifier & { at: number })[] = [];
  const patterns: [RegExp, (match: RegExpExecArray) => Specifier | undefined][] = [
    [
      /\b(?:import|export)\s+(type\s+)?[^;]*?\bfrom\s*["']([^"']+)["']/g,
      (m) => ({ specifier: m[2] ?? "", kind: m[1] === undefined ? "static" : "type" }),
    ],
    [/\bimport\s*["']([^"']+)["']/g, (m) => ({ specifier: m[1] ?? "", kind: "side-effect" })],
    [
      /\bimport\s*\(\s*(["'`])([^"'`]*)\1\s*[,)]/g,
      (m) => ({ specifier: m[2] ?? "", kind: "dynamic" }),
    ],
    // A computed specifier cannot be checked: it is a violation of its own.
    [/\bimport\s*\(\s*(?![\s"'`)])/g, () => ({ specifier: "<berechnet>", kind: "dynamic" })],
    [
      /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
      (m) => ({ specifier: m[1] ?? "", kind: "require" }),
    ],
  ];
  for (const [pattern, read] of patterns) {
    for (const match of source.matchAll(pattern)) {
      const entry = read(match);
      if (entry !== undefined) found.push({ ...entry, at: match.index });
    }
  }
  return found.sort((a, b) => a.at - b.at).map(({ specifier, kind }) => ({ specifier, kind }));
}

/** The repo-relative path a specifier points into, or undefined for third-party packages. */
function targetOf(file: string, specifier: string): string | undefined {
  if (specifier.startsWith(".") || specifier.startsWith("/")) {
    return relative(REPO, resolve(dirname(file), specifier))
      .split("\\")
      .join("/");
  }
  const scoped = /^@fundamento\/([^/]+)(\/.*)?$/.exec(specifier);
  if (scoped !== null) return `packages/${scoped[1]}${scoped[2] ?? ""}`;
  return undefined;
}

function violationsOf(file: string, source: string): Violation[] {
  const violations: Violation[] = [];
  const name = relative(PACKAGE, file).split("\\").join("/");
  for (const { specifier, kind } of specifiersOf(source)) {
    if (specifier === "<berechnet>" || specifier.includes("${")) {
      violations.push({ file: name, specifier, rule: "dynamic-import-computed" });
      continue;
    }
    const target = targetOf(file, specifier);
    const forbidden =
      FORBIDDEN_PACKAGES.some((pkg) => specifier === pkg || specifier.startsWith(`${pkg}/`)) ||
      (target !== undefined &&
        FORBIDDEN_DIRS.some((dir) => target === dir || target.startsWith(`${dir}/`)));
    if (forbidden) {
      violations.push({ file: name, specifier, rule: "forbidden-import" });
    } else if (
      (specifier === TYPES_ONLY || specifier.startsWith(`${TYPES_ONLY}/`)) &&
      kind !== "type"
    ) {
      violations.push({ file: name, specifier, rule: "modelo-value-import" });
    }
  }
  return violations;
}

function dependencyViolations(manifest: unknown): { field: string; name: string }[] {
  const violations: { field: string; name: string }[] = [];
  if (typeof manifest !== "object" || manifest === null) return violations;
  for (const field of DEPENDENCY_FIELDS) {
    const deps: unknown = (manifest as Record<string, unknown>)[field];
    if (typeof deps !== "object" || deps === null) continue;
    for (const name of Object.keys(deps)) {
      if (FORBIDDEN_PACKAGES.includes(name)) violations.push({ field, name });
    }
  }
  return violations;
}

/** The non-test sources of the package (test files and only they may use anything). */
function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return sources(path);
      return entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") ? [path] : [];
    })
    .sort();
}

describe("module graph (AC-10)", () => {
  it("imports nothing of nordstelo, mcp, eroj or the Gvidanto, and the Modelo for types only", () => {
    const files = sources(SRC);
    expect(files.map((file) => relative(SRC, file))).toContain("index.ts");
    const violations = files.flatMap((file) => violationsOf(file, readFileSync(file, "utf8")));
    expect(violations).toEqual([]);
  });

  it("depends on none of them in package.json", () => {
    const manifest: unknown = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    expect(dependencyViolations(manifest)).toEqual([]);
  });

  it("finds every forbidden form in a sample (the check can fail)", () => {
    const sample = [
      'import { score } from "@fundamento/nordstelo";',
      'import type { Tool } from "@fundamento/mcp/dist/tools.js";',
      'export { defineEroj } from "@fundamento/eroj";',
      "import {",
      "  renderEro,",
      '} from "../../eroj/src/index.js";',
      'const server = await import("../../mcp/dist/server.js");',
      'import "../../nordstelo/dist/index.js";',
      'export type { X } from "../../modelo/src/gvidanto/check-usage.js";',
      'const usage = await import("@fundamento/modelo/dist/gvidanto/index.js");',
      'import { loadModelo } from "@fundamento/modelo";',
      "const loaded = await import(name);",
      // biome-ignore lint/suspicious/noTemplateCurlyInString: source text of a template literal.
      "const other = await import(`../${name}.js`);",
      'import type { Modelo } from "@fundamento/modelo";',
      'import { chatCompletion } from "@fundamento/metiejo";',
      'const pw = await import("playwright");',
      'import { readFileSync } from "node:fs";',
      '// A comment loads nothing: import("@fundamento/nordstelo") and import (AC-10).',
      '/* import { score } from "@fundamento/nordstelo"; */',
    ].join("\n");
    expect(
      violationsOf(join(SRC, "sample.ts"), sample).map(({ specifier, rule }) => [specifier, rule]),
    ).toEqual([
      ["@fundamento/nordstelo", "forbidden-import"],
      ["@fundamento/mcp/dist/tools.js", "forbidden-import"],
      ["@fundamento/eroj", "forbidden-import"],
      ["../../eroj/src/index.js", "forbidden-import"],
      ["../../mcp/dist/server.js", "forbidden-import"],
      ["../../nordstelo/dist/index.js", "forbidden-import"],
      ["../../modelo/src/gvidanto/check-usage.js", "forbidden-import"],
      ["@fundamento/modelo/dist/gvidanto/index.js", "forbidden-import"],
      ["@fundamento/modelo", "modelo-value-import"],
      ["<berechnet>", "dynamic-import-computed"],
      // biome-ignore lint/suspicious/noTemplateCurlyInString: the specifier as written.
      ["../${name}.js", "dynamic-import-computed"],
    ]);
    expect(
      dependencyViolations({
        dependencies: { "@fundamento/metiejo": "workspace:*", "@fundamento/mcp": "workspace:*" },
        devDependencies: { "@fundamento/nordstelo": "workspace:*" },
        optionalDependencies: { "@fundamento/eroj": "workspace:*" },
      }),
    ).toEqual([
      { field: "dependencies", name: "@fundamento/mcp" },
      { field: "devDependencies", name: "@fundamento/nordstelo" },
      { field: "optionalDependencies", name: "@fundamento/eroj" },
    ]);
  });
});
