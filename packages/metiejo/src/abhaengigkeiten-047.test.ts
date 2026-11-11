// Spec 047 (NE-1, T2, P-5): the canvas adds nothing to what a published package pulls in. React,
// React Flow and dagre live in @fundamento/nodredaktilo as devDependencies only; Vite bundles them
// into one browser file, and no package reaches them at run time. The test reads the manifests of
// the workspace and builds each package's closure over `dependencies`, `optionalDependencies` and
// `peerDependencies` (devDependencies never ship), then scans the sources of every other package
// for a React, React Flow or dagre import.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const PACKAGES_DIR = fileURLToPath(new URL("../../", import.meta.url));

interface Manifest {
  name: string;
  version?: string;
  license?: string;
  private?: boolean;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/** Every workspace manifest, by package dir name. */
function manifests(): Map<string, Manifest> {
  const out = new Map<string, Manifest>();
  for (const entry of readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = join(PACKAGES_DIR, entry.name, "package.json");
    if (!existsSync(file)) continue;
    out.set(entry.name, JSON.parse(readFileSync(file, "utf8")) as Manifest);
  }
  return out;
}

/** The names a package needs at run time: its own fields, never devDependencies. */
const runtimeNames = (m: Manifest): string[] =>
  [
    ...Object.keys(m.dependencies ?? {}),
    ...Object.keys(m.optionalDependencies ?? {}),
    ...Object.keys(m.peerDependencies ?? {}),
  ].sort();

/** The run-time closure of a package over the workspace: external names are leaves. */
function closure(start: Manifest, byName: ReadonlyMap<string, Manifest>): string[] {
  const seen = new Set<string>();
  const queue = [...runtimeNames(start)];
  while (queue.length > 0) {
    const name = queue.shift();
    if (name === undefined || seen.has(name)) continue;
    seen.add(name);
    const workspace = byName.get(name);
    if (workspace !== undefined) queue.push(...runtimeNames(workspace));
  }
  return [...seen].sort();
}

const isCanvasLibrary = (name: string): boolean =>
  name === "@fundamento/nodredaktilo" ||
  name.startsWith("@xyflow/") ||
  name.startsWith("@dagrejs/");

const isReact = (name: string): boolean =>
  name === "react" ||
  name === "react-dom" ||
  name.startsWith("react-") ||
  name.startsWith("@types/react");

/**
 * R-6: the React entries in the closures of the published packages on `main`. `@fundamento/cli`
 * reaches `react` and `react-dom` through cli → metiejo → eroj, whose optional peer they are
 * (`packages/eroj/package.json`). The canvas must not add to this.
 */
const REACT_EN_PUBLIKAJ: Record<string, string[]> = {
  "@fundamento/cli": ["react", "react-dom"],
};

/**
 * D-4: modules that mention a React import at the start of a line without importing React
 * themselves. `react.ts` of the Eroj re-exports the generated wrappers (`generated/` is skipped);
 * the two of the Projekcioj write React sources as template strings.
 */
const ESCEPTOJ: Record<string, string> = {
  "packages/eroj/src/react.ts": "re-exports the generated React wrappers (Spec 003, D-08)",
  "packages/projekcioj/src/celoj/react/react.ts": "writes the React projection as text",
  "packages/projekcioj/src/celoj/make-kit/make-kit.ts": "writes the Make kit's React types as text",
};

const SKIPPED_DIRS = new Set(["node_modules", "dist", "generated"]);
const SOURCE_FILE = /\.(?:ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) out.push(...sourceFiles(join(dir, entry.name)));
    } else if (SOURCE_FILE.test(entry.name)) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

const SPECIFIER = String.raw`["'](?:react(?:-dom)?(?:\/[^"']*)?["']|@xyflow\/|@dagrejs\/)`;
/** Import, export-from, side-effect import, dynamic import and require – at statement start. */
const FORBIDDEN_IMPORT = [
  new RegExp(
    String.raw`^\s*(?:import|export)\s+(?:type\s+)?(?:[\w$]+\s*,?\s*)?(?:\{[^}]*\}|\*(?:\s+as\s+[\w$]+)?)?\s*from\s*${SPECIFIER}`,
    "m",
  ),
  new RegExp(String.raw`^\s*import\s*${SPECIFIER}`, "m"),
  new RegExp(
    String.raw`^\s*(?:(?:const|let|var)\s+[^=\n]+=\s*)?(?:await\s+)?(?:import|require)\s*\(\s*${SPECIFIER}`,
    "m",
  ),
];

describe("Spec 047 (P-5): the canvas adds no run-time dependency", () => {
  const all = manifests();
  const byName = new Map([...all.values()].map((m) => [m.name, m] as const));

  it("(0) nodredaktilo is private, MIT, 0.2.0, devDependencies only, without a test script", () => {
    const nodredaktilo = all.get("nodredaktilo");
    expect(nodredaktilo, "packages/nodredaktilo/package.json").toBeDefined();
    if (nodredaktilo === undefined) return;
    expect({
      name: nodredaktilo.name,
      private: nodredaktilo.private,
      license: nodredaktilo.license,
      version: nodredaktilo.version,
      dependencies: nodredaktilo.dependencies,
      optionalDependencies: nodredaktilo.optionalDependencies,
      peerDependencies: nodredaktilo.peerDependencies,
      test: nodredaktilo.scripts?.test,
    }).toEqual({
      name: "@fundamento/nodredaktilo",
      private: true,
      license: "MIT",
      version: "0.2.0",
      dependencies: undefined,
      optionalDependencies: undefined,
      peerDependencies: undefined,
      test: undefined,
    });
    const dev = Object.keys(nodredaktilo.devDependencies ?? {});
    const missing = ["react", "react-dom", "@xyflow/react", "@dagrejs/dagre"].filter(
      (name) => !dev.includes(name),
    );
    expect(missing).toEqual([]);

    const metiejo = all.get("metiejo");
    const where = (field: keyof Manifest): boolean => {
      const value = metiejo?.[field];
      return typeof value === "object" && value !== null && "@fundamento/nodredaktilo" in value;
    };
    expect({
      dependencies: where("dependencies"),
      optionalDependencies: where("optionalDependencies"),
      peerDependencies: where("peerDependencies"),
      devDependencies: where("devDependencies"),
    }).toEqual({
      dependencies: false,
      optionalDependencies: false,
      peerDependencies: false,
      devDependencies: true,
    });
  });

  it("(1) no published package has nodredaktilo, @xyflow/* or @dagrejs/* in its closure", () => {
    const violations = [...all.values()]
      .filter((m) => m.private !== true)
      .flatMap((m) =>
        closure(m, byName)
          .filter(isCanvasLibrary)
          .map((dep) => `${m.name} → ${dep}`),
      );
    expect(violations).toEqual([]);
  });

  it("(2) the React entries in the published closures are the ones of main (R-6)", () => {
    const found: Record<string, string[]> = {};
    for (const m of [...all.values()].sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (m.private === true) continue;
      const react = closure(m, byName).filter(isReact);
      if (react.length > 0) found[m.name] = react;
    }
    expect(found).toEqual(REACT_EN_PUBLIKAJ);
  });

  it("(3) the manifests of the Eroj and the Projekcioj do not mention the canvas libraries", () => {
    const mentions = ["eroj", "projekcioj"].flatMap((dir) => {
      const text = readFileSync(join(PACKAGES_DIR, dir, "package.json"), "utf8");
      return ["@xyflow/react", "@dagrejs/dagre", "@fundamento/nodredaktilo"]
        .filter((name) => text.includes(name))
        .map((name) => `packages/${dir}/package.json: ${name}`);
    });
    expect(mentions).toEqual([]);
  });

  it("(4) no module outside nodredaktilo imports react, react-dom, @xyflow/* or @dagrejs/*", () => {
    // The paths are named from the checkout root; they are looked up below the packages dir.
    const stale = Object.keys(ESCEPTOJ).filter(
      (file) => !existsSync(join(PACKAGES_DIR, file.slice("packages/".length))),
    );
    expect(stale).toEqual([]);

    const violations: string[] = [];
    for (const dir of [...all.keys()].sort()) {
      if (dir === "nodredaktilo") continue;
      const src = join(PACKAGES_DIR, dir, "src");
      if (!existsSync(src)) continue;
      for (const file of sourceFiles(src)) {
        const relative = `packages/${file.slice(PACKAGES_DIR.length)}`;
        if (relative in ESCEPTOJ) continue;
        const text = readFileSync(file, "utf8");
        if (FORBIDDEN_IMPORT.some((pattern) => pattern.test(text))) violations.push(relative);
      }
    }
    expect(violations).toEqual([]);
  });
});
