// The Vitrino Celo (Spec 004 T007, FR-05, FR-09, contracts/vitrino §1): one self-contained HTML
// file per build, written after the Make Kits are bundled, byte-identical for the same Modelo.

import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultModeloSource } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "../../build.js";
import { VITRINO_FILE } from "./vitrino.js";

const dirs: string[] = [];
let out = "";
let html = "";

beforeAll(async () => {
  out = mkdtempSync(join(tmpdir(), "fm-vitrino-"));
  dirs.push(out);
  const built = await buildProjekcioj({ outDir: out, source: defaultModeloSource() });
  expect(built.ok).toBe(true);
  html = readFileSync(join(out, VITRINO_FILE), "utf8");
}, 120_000);

afterAll(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("the Vitrino is one self-contained file", () => {
  it("is written to vitrino/index.html and stands in the manifest", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    const manifest = JSON.parse(readFileSync(join(out, "projekcioj.json"), "utf8")) as {
      files: Record<string, string>;
      celoj: string[];
    };
    expect(Object.keys(manifest.files)).toContain(VITRINO_FILE);
    expect(manifest.celoj).toContain("vitrino");
    expect(manifest.files[VITRINO_FILE]).toBe(createHash("sha256").update(html).digest("hex"));
  });

  it("loads nothing from outside itself", () => {
    // Spec 016 ②: the Werkstatt embeds the Modelo schema and the bundled Agordilo, whose texts
    // name schema URIs; what counts is that nothing is fetched — no element with a source, no
    // request from a script.
    const outside = html
      .replace(/<script type="application\/json"[\s\S]*?<\/script>/g, "")
      .replace(/<script type="module" id="fm-vitrino-werkstatt-skripto">[\s\S]*?<\/script>/, "");
    expect(outside).not.toContain("http://");
    expect(outside).not.toContain("https://");
    expect(html).not.toMatch(/<link[^>]+href=/);
    expect(html).not.toMatch(/<script[^>]+src=/);
    expect(html).not.toMatch(/<img[^>]+src=/);
    expect(html).not.toMatch(/\bfetch\(/);
    expect(html).not.toMatch(/XMLHttpRequest/);
    expect(html).not.toMatch(/\bimport\("https?:/);
  });

  it("carries the CSS of the projections and the element bundle of the reference kit", () => {
    const css = readFileSync(join(out, "css/fundamento.css"), "utf8");
    expect(html).toContain(css.trim().slice(0, 200));
    const element = readFileSync(join(out, "make-kit/komuna/dist/element.js"), "utf8");
    expect(html).toContain(element.trim().slice(0, 120));
  });

  it("is byte-identical for the same Modelo", async () => {
    const second = mkdtempSync(join(tmpdir(), "fm-vitrino-again-"));
    dirs.push(second);
    const built = await buildProjekcioj({ outDir: second, source: defaultModeloSource() });
    expect(built.ok).toBe(true);
    expect(readFileSync(join(second, VITRINO_FILE), "utf8")).toBe(html);
  }, 120_000);

  it("holds no colour of its own: every value comes from the Modelo", () => {
    const template = readFileSync(new URL("./html.ts", import.meta.url), "utf8");
    expect(template).not.toMatch(/#[0-9a-fA-F]{6}\b/);
    expect(template).not.toContain("oklch(");
  });
});

// Spec 016 ② (G7, plan ② D-01–D-03): the Vitrino carries a second mode, the Werkstatt. It embeds
// what the Agordilo needs to derive and check in the browser — the structure (core + komuna, with
// its fingerprint), the calibration and the two schemas — and the same library, bundled, with no
// node edge. The data island holds no machine path.
describe("the Werkstatt in the Vitrino (Spec 016 ②)", () => {
  const island = (): Record<string, unknown> =>
    JSON.parse(
      /<script type="application\/json" id="fm-werkstatt">([\s\S]*?)<\/script>/.exec(html)?.[1] ??
        "null",
    ) as Record<string, unknown>;

  it("switches between Ansehen and Werkstatt in the header, the mode in the fragment", () => {
    expect(html).toContain('data-fm-modus="ansehen"');
    expect(html).toContain('data-fm-modus="werkstatt"');
    expect(html).toContain('<section id="fm-vitrino-werkstatt"');
    expect(html).toContain("modus=");
  });

  it("embeds the structure with its fingerprint, the calibration and the schemas, with no path of this machine", () => {
    const data = island();
    const structure = data.structure as {
      fingerprint: string;
      files: {
        packages: { name: string }[];
        sets: { name: string; package?: string; file: string }[];
        data: Record<string, { file: string }>;
      };
    };
    expect(structure.fingerprint).toMatch(/^[0-9a-f]{64}$/);
    expect(structure.files.packages.map((pkg) => pkg.name)).toEqual(["@fundamento/aspekto-komuna"]);
    expect(structure.files.sets.some((set) => set.name === "core")).toBe(true);
    expect(
      structure.files.sets.every(
        (set) => set.package === undefined || set.package === "@fundamento/aspekto-komuna",
      ),
    ).toBe(true);
    for (const document of [...structure.files.sets, ...Object.values(structure.files.data)]) {
      expect(document.file, document.file).not.toMatch(/^\//);
      expect(document.file).not.toContain(tmpdir());
    }
    expect((data.calibration as { reference: string }).reference).toBe("komuna");
    const schemas = data.schemas as { modelo: { $id: string }; config: { $id: string } };
    expect(schemas.modelo.$id).toContain("modelo.schema.json");
    expect(schemas.config.$id).toContain("config.schema.json");
    expect(data.reference).toBe("komuna");
  });

  it("bundles the Agordilo for the browser: one module script, no node import, the same derivation", () => {
    const bundle =
      /<script type="module" id="fm-vitrino-werkstatt-skripto">([\s\S]*?)<\/script>/.exec(
        html,
      )?.[1] ?? "";
    expect(bundle.length).toBeGreaterThan(10_000);
    expect(bundle).not.toMatch(/from\s*["']node:/);
    expect(bundle).not.toMatch(/import\s*\(\s*["']node:/);
    expect(bundle).toContain("derivePalettes");
    expect(bundle).toContain("checkAspekto");
    expect(bundle).toContain("fmWerkstatt");
  });

  it("holds no colour of its own in the Werkstatt either", () => {
    const source = readFileSync(new URL("./werkstatt.ts", import.meta.url), "utf8");
    expect(source).not.toMatch(/#[0-9a-fA-F]{6}\b/);
    expect(source).not.toContain("oklch(");
  });
});
