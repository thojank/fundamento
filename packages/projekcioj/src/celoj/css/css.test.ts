// CSS Celo (Spec 003 T009; FR-05, plan D-05, contracts/projekcioj §1). Custom properties --fm-*
// per Aspekto and Dimensio, switched by data-fm-* attributes on the root; every selector in
// :where() so the source order is the resolver's set order.

import {
  checkCssCustomProperties,
  checkCssLiterals,
  cssPhysicalPropertyIssues,
  loadModelo,
  projectModeloSource,
  sortSetsForResolution,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { traRolojCss } from "../../test-doubles/tra-roloj.js";
import { WEB_COMPONENT_CELO } from "../web-component/web-component.js";
import { CSS_CELO } from "./css.js";

const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
  import.meta.url,
).pathname;
const source = projectModeloSource(config);
const prepared = celoInputOf(source);
if (!prepared.ok) throw new Error("core + ekzemplo must be valid");
const files = Object.fromEntries(CSS_CELO.generate(prepared.input).map((f) => [f.path, f.text]));
const combined = files["css/fundamento.css"] ?? "";

/** The selectors of the rule blocks, in source order. */
const selectors = (css: string) => [...css.matchAll(/^(\S.*) \{$/gm)].map((m) => m[1] ?? "");

describe("CSS Celo files (T009)", () => {
  it("writes one combined file and one per Aspekto", () => {
    expect(Object.keys(files).sort()).toEqual([
      "css/fundamento-ekzemplo.css",
      "css/fundamento-komuna.css",
      "css/fundamento.css",
    ]);
  });

  it("wraps every selector in :where(), so all rules have the same specificity", () => {
    for (const [path, css] of Object.entries(files)) {
      const list = selectors(css);
      expect(list.length, path).toBeGreaterThan(0);
      for (const selector of list) expect(selector, path).toMatch(/^:where\(.+\)$/);
    }
  });

  it("orders the blocks as the resolver orders the sets", () => {
    const { modelo } = loadModelo(source);
    if (modelo === undefined) throw new Error("unreachable");
    const expected = sortSetsForResolution(modelo, modelo.setoj)
      .filter((set) => Object.keys(set.tokens).length > 0)
      .map((set) => set.name);
    const comments = [...combined.matchAll(/^\/\* set (\S+) \*\/$/gm)].map((m) => m[1]);
    expect(comments).toEqual(expected);
  });

  it("turns a conjunction set into a combined selector; a default value also matches no attribute", () => {
    const block = combined.split(
      "/* set aspekto/ekzemplo+color-scheme/light+contrast/high */\n",
    )[1];
    expect(block?.split("\n")[0]).toBe(
      ':where(:root[data-fm-aspekto="ekzemplo"]:is([data-fm-color-scheme="light"], :not([data-fm-color-scheme]))[data-fm-contrast="high"]) {',
    );
  });

  it("writes aliases as var() references", () => {
    expect(combined).toContain("  --fm-color-text-default: var(--fm-color-palette-neutral-900);");
  });

  it("splits composite tokens into one property per field", () => {
    expect(combined).toMatch(/ {2}--fm-typography-label-1-font-size: /);
    expect(combined).toMatch(/ {2}--fm-focus-ring-width: /);
  });

  it("puts one Aspekto's values at :root in its own file", () => {
    const ekzemplo = files["css/fundamento-ekzemplo.css"] ?? "";
    expect(ekzemplo).not.toContain("data-fm-aspekto");
    expect(selectors(ekzemplo)[0]).toBe(":where(:root)");
  });

  it("passes the vortaro-lint rules: --fm- namespace, literals only in --fm- definitions, logical properties", () => {
    for (const [path, css] of Object.entries(files)) {
      expect(checkCssCustomProperties(path, css).issues, path).toEqual([]);
      expect(checkCssLiterals(path, css).issues, path).toEqual([]);
      expect(cssPhysicalPropertyIssues(path, css), path).toEqual([]);
    }
  });
});

describe("css-physical-property (T009, D-17)", () => {
  it("rejects physical properties and accepts logical ones", () => {
    const issues = cssPhysicalPropertyIssues(
      "a.css",
      "a {\n  margin-left: var(--fm-spacing-small);\n  padding-inline-start: var(--fm-spacing-small);\n  right: 0;\n}",
    );
    expect(issues.map((issue) => [issue.rule, issue.path])).toEqual([
      ["css-physical-property", "a.css:2:3"],
      ["css-physical-property", "a.css:4:3"],
    ]);
  });
});

// F31 (An P0, Maintainer 2026-09-23): Versalien und Sperrsatz sind ein typografisches Paar — kein
// Werkzeug braucht das eine ohne das andere. `letterSpacing` kam schon an; `textTransform` stand im
// Modelo und im Rezolvo, aber in keiner Projektion. Die kommende dritte Marke setzt ihre
// Mikro-Beschriftungen auf Versalien mit positivem Sperrsatz und ist ohne beides nicht ausdrückbar.
describe("capitals and tracking reach the web projection (F31)", () => {
  const css = combined;

  it("gives every typography role a text-transform property", () => {
    for (const role of ["display-1", "label-1", "kicker", "body-1"]) {
      expect(css, role).toContain(`--fm-typography-${role}-text-transform:`);
      expect(css, role).toContain(`--fm-typography-${role}-letter-spacing:`);
    }
  });

  // komunas kicker steht seit Spec 001 auf uppercase, ohne dass es je jemand gesehen hätte.
  it("carries the case the Modelo states, and none where it states none", () => {
    expect(css).toMatch(/--fm-typography-kicker-text-transform:\s*uppercase;/);
    expect(css).toMatch(/--fm-typography-body-1-text-transform:\s*none;/);
  });

  it("applies both wherever the component applies its typography", () => {
    // Through the roles the Ero-Tokens alias (Constitution v2.3, tra-roloj.ts).
    const component = traRolojCss(
      WEB_COMPONENT_CELO.generate(prepared.input)
        .map((file) => file.text)
        .join("\n"),
      prepared.input.modelo,
    );
    expect(component).toContain("text-transform: var(--fm-typography-label-1-text-transform)");
    expect(component).toContain("letter-spacing: var(--fm-typography-label-1-letter-spacing)");
  });
});

// Spec 014 ② (G3, plan ② D-05): the glyphs of every Aspekto reach the web as custom properties
// --fm-ikono-<name> (the SVG as a data URL), switched by data-fm-aspekto like every value — so an
// ikono changes its picture with the brand without a reload, and a mask in currentcolor draws it.
describe("the glyphs of the Ikonaro per Aspekto (Spec 014 ②)", () => {
  it("writes one block per Aspekto with every name of the Ikonaro as --fm-ikono-<name>", () => {
    const { modelo } = loadModelo(source);
    if (modelo === undefined) throw new Error("unreachable");
    expect(modelo.ikonaro.length).toBeGreaterThan(0);
    const komuna = combined.split("/* ikonoj komuna */\n")[1]?.split("\n}")[0] ?? "";
    const ekzemplo = combined.split("/* ikonoj ekzemplo */\n")[1]?.split("\n}")[0] ?? "";
    expect(komuna.split("\n")[0]).toBe(
      ':where(:root:is([data-fm-aspekto="komuna"], :not([data-fm-aspekto]))) {',
    );
    expect(ekzemplo.split("\n")[0]).toBe(':where(:root[data-fm-aspekto="ekzemplo"]) {');
    for (const { name } of modelo.ikonaro) {
      expect(komuna, name).toContain(`  --fm-ikono-${name}: url("data:image/svg+xml,`);
      expect(ekzemplo, name).toContain(`  --fm-ikono-${name}: url("data:image/svg+xml,`);
    }
    // Two styles of the same set: the pictures differ, the names are the same.
    const of = (block: string, name: string) =>
      new RegExp(`--fm-ikono-${name}: (.*);`).exec(block)?.[1];
    expect(of(komuna, "close")).not.toBe(of(ekzemplo, "close"));
    expect(of(komuna, "close")).toContain("%3Csvg");
    expect(of(komuna, "close")).not.toContain("<metadata>");
  });

  it("puts the glyphs of one Aspekto at :root in its own file", () => {
    const ekzemplo = files["css/fundamento-ekzemplo.css"] ?? "";
    expect(ekzemplo).toContain("/* ikonoj ekzemplo */\n:where(:root) {");
    expect(ekzemplo).toContain("  --fm-ikono-close: url(");
    expect(ekzemplo).not.toContain("/* ikonoj komuna */");
  });
});
