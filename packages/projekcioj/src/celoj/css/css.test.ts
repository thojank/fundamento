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
