// Nachlese 8 ③ (Entscheidung d): the Vitrino shows the texts of the Uzoj and the Reguloj in German
// — the section Gebrauch and the kialoj of the automatic Reguloj —; the guidelines of the Make Kit
// stay English.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultModeloSource, loadModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "../build.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const de = modelo.tradukoj?.de ?? {};
const butono = modelo.eroj.find((entry) => entry.ero.name === "butono")?.uzo;
const regulo = modelo.reguloj.find((entry) => entry.name === "touch-target-min");
const escaped = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

let out = "";
const read = (path: string) => readFileSync(join(out, path), "utf8");
beforeAll(async () => {
  out = mkdtempSync(join(tmpdir(), "fm-nachlese-8-germana-"));
  const built = await buildProjekcioj({ outDir: out, source: defaultModeloSource() });
  expect(built.ok).toBe(true);
}, 180_000);
afterAll(() => rmSync(out, { recursive: true, force: true }));

describe("the Vitrino in German (③)", () => {
  it("the section Gebrauch shows the purpose, the boundaries and the rules in German", () => {
    // The article of the butono in the section Gebrauch: the Werkstatt carries the files of the
    // Modelo as they are, its English sources too.
    const html =
      read("vitrino/index.html").match(/<article><h3>butono<\/h3>.*?<\/article>/s)?.[0] ?? "";
    const german = de[`${butono?.id}/purpose`] ?? "";
    expect(german).not.toBe("");
    expect(html).toContain(escaped(german));
    expect(html).not.toContain(escaped(butono?.purpose ?? "?"));
    const boundary = butono?.boundary[0];
    expect(html).toContain(escaped(de[`${butono?.id}/boundary/${boundary?.case}/kialo`] ?? "?"));
  });

  it("the kialoj of the automatic Reguloj are German", () => {
    const html = read("vitrino/index.html");
    expect(html).toContain(JSON.stringify(de[`${regulo?.id}/kialo`] ?? "?").slice(1, -1));
  });

  it("the guidelines of the Make Kit stay English", () => {
    const guideline = read("make-kit/komuna/guidelines/components/butono.md");
    expect(guideline).toContain(butono?.purpose ?? "?");
    expect(guideline).not.toContain(de[`${butono?.id}/purpose`] ?? "?");
  });
});
