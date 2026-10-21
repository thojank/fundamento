// Nachlese 8 ② (Abnahme Spec 020, V-1 to V-6, F-5, M5): what the Vitrino and the web Celo write.
// The page's title and badges keep a gap (V-1); the shell's navigation has the indent of its head
// and its main (V-2); a region in a column does not wrap, so a Sxablono in it keeps its width and
// the shell its height (V-3); the editor names its preview visibly in the role of the field's
// label, so both begin at the same height (V-4); the kodbloko's example is a command (V-5); the
// markdovido's shows a heading and a table (V-6); a nested list takes the indent of the Skemo
// (F-5); the controls of the Werkstatt follow a slider without transitions (M5).

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultModeloSource } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "../build.js";

let out = "";
let html = "";
const read = (path: string) => readFileSync(join(out, path), "utf8");
beforeAll(async () => {
  out = mkdtempSync(join(tmpdir(), "fm-nachlese-8-"));
  const built = await buildProjekcioj({ outDir: out, source: defaultModeloSource() });
  expect(built.ok).toBe(true);
  html = read("vitrino/index.html");
}, 180_000);
afterAll(() => rmSync(out, { recursive: true, force: true }));
const web = (path: string) => read(path);

const sectionOf = (id: string) => {
  const start = html.indexOf(`id="${id}"`);
  const end = html.indexOf("<section", start + 1);
  return html.slice(start, end === -1 ? undefined : end);
};
const css = (name: string) => web(`eroj/src/generated/${name}.styles.ts`).replaceAll('\\"', '"');

describe("the Sxablonoj on the web (V-1 to V-4)", () => {
  it("V-1: the title and the badges of the pagxo keep a gap", () => {
    expect(css("pagxo")).toMatch(/\[part="heading"\] \{[^}]*gap: var\(--fm-spacing-/);
  });

  it("V-2: the navigation of the sxelo has the inline padding of its head and main", () => {
    expect(css("sxelo")).toMatch(/\[part="nav"\] \{[^}]*padding-inline: var\(--fm-spacing-large\)/);
  });

  it("V-3: a region in a column does not wrap; only rows wrap", () => {
    expect(css("sxelo")).toMatch(
      /\[part="main"\] \{ display: flex; flex-direction: column; flex-wrap: nowrap;/,
    );
    expect(css("sxelo")).toMatch(
      /\[part="header"\] \{ display: flex; flex-direction: row; flex-wrap: wrap;/,
    );
  });

  it("V-4: the editor names its preview visibly, in the role of a field's label", () => {
    const element = web("eroj/src/generated/fm-redaktilo.ts");
    expect(element).toContain('part="preview-label"');
    expect(css("redaktilo")).toMatch(
      /\[part="preview-label"\] \{[^}]*font-size: var\(--fm-typography-label-/,
    );
  });
});

describe("the Vitrino's examples of the content Eroj (V-5, V-6) and the indent of a nested list (F-5)", () => {
  it("V-5: the kodbloko shows a command in every row", () => {
    const section = sectionOf("fm-vitrino-kodbloko");
    expect(section).not.toMatch(/<fm-kodbloko[^>]*>rest</);
    expect(section).toMatch(
      /<fm-kodbloko[^>]*>pnpm fm mcp<span slot="caption">Prüfung starten<\/span>/,
    );
  });

  it("V-6: the markdovido shows a heading and a table", () => {
    const section = sectionOf("fm-vitrino-markdovido");
    const source = /<fm-markdovido[^>]* source="([^"]*)"/.exec(section)?.[1] ?? "";
    expect(source).toMatch(/(^|&#10;)# \S/);
    expect(source).toMatch(/\| Name \| Status \|&#10;\|---\|:---:\|/);
  });

  it("F-5: a nested list takes the indent of the markdovido's Skemo", () => {
    const element = web("eroj/src/generated/fm-markdovido.ts");
    expect(element).toMatch(
      /:is\(ul, ol\) :is\(ul, ol\) \{[^}]*padding-inline-start: var\(--fm-spacing-large\)/,
    );
  });
});

describe("the Werkstatt's controls follow a slider without transitions (M5)", () => {
  it("the panel and the report set every motion duration to 0 in the Werkstatt", () => {
    const rule =
      /\[data-fm-modus="werkstatt"\] \.fm-werkstatt-kolumnoj \{([^}]*)\}/.exec(html)?.[1] ?? "";
    for (const name of ["fast", "medium", "slow", "deliberate"])
      expect(rule, name).toContain(`--fm-motion-duration-${name}: 0ms`);
  });
});
