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
    expect(html).not.toContain("http://");
    expect(html).not.toContain("https://");
    expect(html).not.toMatch(/<link[^>]+href=/);
    expect(html).not.toMatch(/<script[^>]+src=/);
    expect(html).not.toMatch(/<img[^>]+src=/);
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
