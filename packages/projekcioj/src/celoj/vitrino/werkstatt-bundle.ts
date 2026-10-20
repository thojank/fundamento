// The Agordilo for the browser (Spec 016 ②, plan ② D-03): the Werkstatt entry of this package
// (`werkstatt.ts`, compiled to dist) bundled by Vite into one module the Vitrino embeds — the
// same library the CLI runs, with the node edge of the Modelo (`node:fs`, `node:path` …) replaced
// by stubs that throw when called; nothing in the pure path calls them. Bundled once per process:
// the bundle depends on the code alone, never on the Modelo being built.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** The compiled entry, relative to the package root: valid from `src/` (tests) and `dist/`. */
const ENTRY = "dist/celoj/vitrino/werkstatt.js";
const OUT_NAME = "werkstatt.js";

let cached: string | undefined;

/**
 * The bundled Werkstatt as one ES module. The bundler runs in a child process whose working
 * directory is the package root, so module ids are relative and two builds give the same bytes
 * (AK-02, like the Make Kits).
 */
export function bundleWerkstatt(): string {
  if (cached !== undefined) return cached;
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  const out = mkdtempSync(join(tmpdir(), "fm-werkstatt-"));
  const vite = createRequire(import.meta.url).resolve("vite");
  const script = `
import { builtinModules } from "node:module";
import { pathToFileURL } from "node:url";
const { build } = await import(pathToFileURL(${JSON.stringify(vite)}).href);
const builtins = new Set(builtinModules);
const STUB = "\\0fm-node-stub:";
// Every node builtin becomes a module of the same names whose members throw when called: the
// Modelo's I/O edge is imported with its pure modules, never run in the browser.
const stubs = {
  name: "fm-node-stub",
  enforce: "pre",
  resolveId(id) {
    const bare = id.replace(/^node:/, "");
    return id.startsWith("node:") || builtins.has(bare) ? STUB + bare : null;
  },
  async load(id) {
    if (!id.startsWith(STUB)) return null;
    const name = id.slice(STUB.length);
    const real = await import("node:" + name);
    const names = Object.keys(real).filter(
      (key) => key !== "default" && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key),
    );
    const throwing = (key) =>
      "export const " + key + " = () => { throw new Error(" +
      JSON.stringify("node:" + name + "." + key + " is not available in the browser (Fundamento Werkstatt).") +
      "); };";
    const lines = names.map((key) => {
      // What the Modelo reads at load time — its version from package.json, the schemas — it
      // addresses as new URL(…, import.meta.url); Vite inlines those files as data: URLs in a
      // library build, so the read decodes the URL it is given. Nothing else is ever read.
      if (name === "fs" && key === "readFileSync") {
        return [
          "export const readFileSync = (path) => {",
          "  const text = String(path);",
          "  if (text.startsWith(\\"data:\\")) {",
          "    const comma = text.indexOf(\\",\\");",
          "    const body = text.slice(comma + 1);",
          "    if (!text.slice(0, comma).endsWith(\\";base64\\")) return decodeURIComponent(body);",
          "    return new TextDecoder().decode(Uint8Array.from(atob(body), (c) => c.charCodeAt(0)));",
          "  }",
          "  throw new Error(" + JSON.stringify("node:fs.readFileSync reads nothing but an inlined file in the browser (Fundamento Werkstatt).") + ");",
          "};",
        ].join("\\n");
      }
      return typeof real[key] === "function" ? throwing(key) : "export const " + key + " = undefined;";
    });
    return lines.join("\\n") + "\\nexport default {};\\n";
  },
};
// Nachlese 6 N6-3: the schemas come with the island (provideModeloSchemas) and the Ontologio is
// never read in the Werkstatt; inlined, they stood in the Vitrino twice (Spec 016 ② B-3). Their
// URLs point nowhere, so a read of them would throw — only package.json stays inlined.
const PROVIDED = /new URL\\(\\s*"(\\.\\.\\/\\.\\.\\/(?:schema\\/(?:modelo|config|ontologio)\\.schema|data\\/ontologio)\\.json)",\\s*import\\.meta\\.url\\s*\\)/g;
const provided = {
  name: "fm-provided-files",
  enforce: "pre",
  transform(code, id) {
    if (!id.includes("/modelo/dist/")) return null;
    const next = code.replace(PROVIDED, (_match, path) => "new URL(" + JSON.stringify("fm-provided:" + path.split("/").pop()) + ")");
    return next === code ? null : { code: next, map: null };
  },
};
await build({
  configFile: false,
  logLevel: "silent",
  root: ".",
  plugins: [provided, stubs],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    lib: { entry: ${JSON.stringify(ENTRY)}, formats: ["es"], fileName: () => ${JSON.stringify(OUT_NAME)} },
    outDir: ${JSON.stringify(out)},
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
    target: "es2022",
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
`;
  try {
    execFileSync(process.execPath, ["--input-type=module", "-e", script], {
      cwd: root,
      stdio: "pipe",
    });
    cached = readFileSync(join(out, OUT_NAME), "utf8");
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
  return cached;
}
