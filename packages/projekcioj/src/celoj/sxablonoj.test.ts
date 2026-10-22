// Spec 020 ① (G2): the Sxablonoj sxelo and pagxo through the Celoj. Web: a custom element
// fm-<name> with a slot per region, its layout on container queries, every space and surface a
// token; React and the Make Kit like the Eroj, the Make Kit with guidelines/patterns/<name>.md and
// a section in Guidelines.md; Figma an example frame of instances outside the component sets (no
// parity, E3); the Vitrino a section Sxablonoj with each example at three container widths.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultModeloSource, loadModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "../build.js";
import { traRolojCss, traRolojFigma } from "../test-doubles/tra-roloj.js";

let out = "";
// Read through the roles the Ero-Tokens alias (Constitution v2.3, tra-roloj.ts).
const modelo = loadModelo(defaultModeloSource()).modelo;
const read = (path: string) => {
  const text = readFileSync(join(out, path), "utf8");
  if (modelo === undefined) return text;
  return path.endsWith("plan.json") ? traRolojFigma(text, modelo) : traRolojCss(text, modelo);
};

beforeAll(async () => {
  out = mkdtempSync(join(tmpdir(), "fm-sxablonoj-"));
  const built = await buildProjekcioj({ outDir: out, source: defaultModeloSource() });
  expect(built.ok).toBe(true);
}, 180_000);

afterAll(() => rmSync(out, { recursive: true, force: true }));

describe("the web Celo of the Sxablonoj", () => {
  it("writes fm-sxelo and fm-pagxo with their styles and defines them beside the Eroj", () => {
    for (const name of ["sxelo", "pagxo"]) {
      const element = read(`eroj/src/generated/fm-${name}.ts`);
      expect(element).toContain(`customElements.define("fm-${name}"`);
      const styles = read(`eroj/src/generated/${name}.styles.ts`);
      // The layout follows the container, never the viewport; spaces come from tokens.
      expect(styles).toContain("container-type: inline-size");
      expect(styles).toContain("@container");
      expect(styles).not.toContain("@media");
      expect(styles).toMatch(/var\(--fm-spacing-/);
    }
    const index = read("eroj/src/generated/index.ts");
    expect(index).toContain("fm-sxelo.js");
    expect(index).toContain("fm-pagxo.js");
  });

  it("sxelo: the landmarks banner and main, the notices polite, a skip link of its own; pagxo: a slot per region", () => {
    const sxelo = read("eroj/src/generated/fm-sxelo.ts");
    for (const region of ["brand", "principal", "nav", "notices", "main"])
      expect(sxelo, region).toContain(`name="${region}"`);
    expect(sxelo).toContain("<header");
    expect(sxelo).toContain("<main");
    expect(sxelo).toContain('aria-live="polite"');
    expect(sxelo).toContain("fm-saltligilo");
    const pagxo = read("eroj/src/generated/fm-pagxo.ts");
    for (const region of ["title", "badges", "subtitle", "actions"])
      expect(pagxo, region).toContain(`name="${region}"`);
  });
});

describe("React and the Make Kit", () => {
  it("React has Sxelo and Pagxo", () => {
    const react = read("eroj/src/generated/react.ts");
    expect(react).toMatch(/export (const|function) Sxelo\b/);
    expect(react).toMatch(/export (const|function) Pagxo\b/);
  });

  it("the Make Kit writes guidelines/patterns/<name>.md and a section in Guidelines.md", () => {
    for (const aspekto of ["komuna"]) {
      const base = `make-kit/${aspekto}/guidelines`;
      const guidelines = read(`${base}/Guidelines.md`);
      expect(guidelines).toContain("## Patterns (Sxablonoj)");
      expect(guidelines).toContain("patterns/sxelo.md");
      expect(guidelines).toContain("patterns/pagxo.md");
      const page = read(`${base}/patterns/pagxo.md`);
      expect(page).toContain("# Pagxo");
      expect(page).toContain("<fm-pagxo>");
      expect(page).toContain("## Regions");
      expect(page).toMatch(/^\| `title` \| titolo \| 1 \| yes \|/m);
      expect(page).toContain("level=1, focusable");
      const shell = read(`${base}/patterns/sxelo.md`);
      expect(shell).toMatch(/^\| `nav` \| navigado \|/m);
      expect(shell).toContain("## What it is for");
      expect(read(`make-kit/${aspekto}/src/element.ts`)).toContain('"fm-sxelo"');
    }
  });
});

describe("Figma: example frames of instances, outside the sets (E3)", () => {
  it("the plan has an example per Sxablono, regions as named frames holding instances of the Ero sets", () => {
    const plan = JSON.parse(read("figma/plan.json")) as {
      components: { set: string }[];
      sxablonoj?: {
        name: string;
        regions: { name: string; direction: string; items: { set?: string }[] }[];
      }[];
    };
    expect(plan.components.map((component) => component.set)).not.toContain("sxelo");
    // Spec 020 ②: formularo and filtrilo beside them; ③: redaktilo.
    expect(plan.sxablonoj?.map((entry) => entry.name)).toEqual([
      "filtrilo",
      "formularo",
      "pagxo",
      "redaktilo",
      "sxelo",
    ]);
    const sxelo = plan.sxablonoj?.find((entry) => entry.name === "sxelo");
    expect(sxelo?.regions.map((region) => region.name)).toEqual([
      "brand",
      "principal",
      "nav",
      "notices",
      "main",
    ]);
    const sets = new Set(plan.components.map((component) => component.set));
    for (const region of (plan.sxablonoj ?? []).flatMap((entry) => entry.regions))
      for (const item of region.items)
        if (item.set !== undefined) expect(sets.has(item.set), item.set).toBe(true);
    expect(sxelo?.regions.find((region) => region.name === "nav")?.items[0]?.set).toBe("navigado");
  });
});

describe("the Vitrino section Sxablonoj", () => {
  it("shows each Sxablono at the three container widths schmal, mittel, breit", () => {
    const html = read("vitrino/index.html");
    expect(html).toContain('id="fm-vitrino-sxablonoj"');
    const section = html.slice(html.indexOf('id="fm-vitrino-sxablonoj"'));
    for (const name of ["sxelo", "pagxo"]) {
      for (const width of ["schmal", "mittel", "breit"])
        expect(section, `${name} ${width}`).toMatch(
          new RegExp(`data-fm-breite="${width}"[^>]*>\\s*<fm-${name}[ >]`),
        );
    }
  });
});

// Spec 020 ②: formularo and filtrilo through the same Celoj.
describe("formularo and filtrilo (Spec 020 ②)", () => {
  it("web: the form sends submit itself (novalidate), the filter bar is the landmark search with a polite status", () => {
    const form = read("eroj/src/generated/fm-formularo.ts");
    expect(form).toContain('customElements.get("fm-formularo")');
    for (const region of ["problems", "fields", "actions"])
      expect(form, region).toContain(`name="${region}"`);
    expect(form).toContain('new CustomEvent("submit"');
    const bar = read("eroj/src/generated/fm-filtrilo.ts");
    expect(bar).toContain('role="search"');
    expect(bar).toContain('aria-live="polite"');
    expect(read("eroj/src/generated/filtrilo.styles.ts")).toContain("flex-wrap: wrap");
  });

  it("Make Kit and Vitrino carry both", () => {
    const base = "make-kit/komuna/guidelines";
    expect(read(`${base}/patterns/formularo.md`)).toMatch(
      /^\| `actions` \| butono \|.*exactly one with type=submit/m,
    );
    expect(read(`${base}/patterns/filtrilo.md`)).toMatch(/^\| `status` \|/m);
    const html = read("vitrino/index.html");
    const section = html.slice(html.indexOf('id="fm-vitrino-sxablonoj"'));
    expect(section).toMatch(/data-fm-breite="schmal"[^>]*>\s*<fm-formularo[ >]/);
    expect(section).toMatch(/data-fm-breite="breit"[^>]*>\s*<fm-filtrilo[ >]/);
  });
});

// Spec 020 ③: two Eroj and a Sxablono of content through the same Celoj.
describe("kodbloko, markdovido and redaktilo (Spec 020 ③)", () => {
  it("web: the two Eroj and the editor are elements; the markdown view builds its content without innerHTML", () => {
    for (const tag of ["fm-kodbloko", "fm-markdovido", "fm-redaktilo"])
      expect(read(`eroj/src/generated/${tag}.ts`), tag).toContain(`customElements.get("${tag}")`);
    const markdown = read("eroj/src/generated/fm-markdovido.ts");
    expect(markdown).toContain("createElement");
    // The one innerHTML is the element's own shadow template, a literal of the generator.
    expect(markdown.match(/\.innerHTML\s*=/g)).toHaveLength(1);
    expect(markdown).toMatch(/root\.innerHTML = `<div part="control">/);
    expect(markdown).not.toContain("insertAdjacentHTML");
  });

  it("Make Kit: a component guideline for each Ero, a pattern for the editor; Figma sets for the Eroj; the Vitrino shows all three", () => {
    const base = "make-kit/komuna/guidelines";
    expect(read(`${base}/components/kodbloko.md`)).toContain("# Kodbloko");
    expect(read(`${base}/components/markdovido.md`)).toContain("# Markdovido");
    expect(read(`${base}/patterns/redaktilo.md`)).toMatch(/^\| `field` \| tekstareo \|/m);
    const plan = JSON.parse(read("figma/plan.json")) as { components: { set: string }[] };
    const sets = plan.components.map((component) => component.set);
    expect(sets).toContain("kodbloko");
    expect(sets).toContain("markdovido");
    const html = read("vitrino/index.html");
    expect(html).toContain('id="fm-vitrino-kodbloko"');
    expect(html).toContain('id="fm-vitrino-markdovido"');
    const section = html.slice(html.indexOf('id="fm-vitrino-sxablonoj"'));
    expect(section).toMatch(/data-fm-breite="breit"[^>]*>\s*<fm-redaktilo[ >]/);
  });
});
