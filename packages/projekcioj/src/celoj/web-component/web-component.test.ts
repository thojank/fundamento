// Web Component Celo (Spec 003 T011; FR-07, plan D-07, contracts/projekcioj §3): fm-butono is
// generated from the Skemo: a descriptor, a stylesheet whose design values are all tokens, and the
// element from the behaviour template. Nothing of butono is written by hand in @fundamento/eroj.

import {
  checkCustomElements,
  componentCssIssues,
  cssPhysicalPropertyIssues,
  defaultModeloSource,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { WEB_COMPONENT_CELO } from "./web-component.js";

const prepared = celoInputOf(defaultModeloSource());
if (!prepared.ok) throw new Error("the repo Modelo must be valid");
const files = Object.fromEntries(
  WEB_COMPONENT_CELO.generate(prepared.input).map((file) => [file.path, file.text]),
);
const butono = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "butono");
const styles = files["eroj/src/generated/butono.styles.ts"] ?? "";
const element = files["eroj/src/generated/fm-butono.ts"] ?? "";
const css = JSON.parse(/export const BUTONO_CSS = (".*");/s.exec(styles)?.[1] ?? '""') as string;

/** Properties that carry design values: they must reference tokens (Art. X gate 1). */
const DESIGN =
  /^(color|background-color|border-color|border-width|border-radius|min-block-size|min-inline-size|inline-size|block-size|padding-inline|gap|font-family|font-size|font-weight|letter-spacing|line-height|outline-width|outline-style|outline-color|outline-offset|box-shadow|transition-duration|transition-timing-function)$/;

describe("Web Component Celo (T011)", () => {
  it("generates the descriptor, the stylesheet, the element and an index", () => {
    expect(Object.keys(files).sort()).toEqual([
      "eroj/src/generated/butono.styles.ts",
      "eroj/src/generated/fm-butono.ts",
      "eroj/src/generated/index.ts",
      "eroj/src/generated/skemo.ts",
    ]);
  });

  it("puts the Skemo into the descriptor unchanged", () => {
    const skemo = /export const BUTONO_SKEMO = (\{.*\}) as const;/s.exec(
      files["eroj/src/generated/skemo.ts"] ?? "",
    )?.[1];
    expect(JSON.parse(skemo ?? "null")).toEqual(butono?.skemo);
  });

  it("gives every design property a token value (F2: the Ero stylesheet rule)", () => {
    expect([...css.matchAll(/var\(--fm-[a-z0-9-]+\)/g)].length).toBeGreaterThan(40);
    expect(componentCssIssues("butono.css", css)).toEqual([]);
  });

  it("uses logical properties only and keeps every target at least size.target.min", () => {
    expect(cssPhysicalPropertyIssues("butono.css", css)).toEqual([]);
    expect(css).toContain("min-inline-size: var(--fm-size-target-min);");
  });

  it("registers every element under a literal fm- name (FR-14, checked on the generated output)", () => {
    const index = files["eroj/src/generated/index.ts"] ?? "";
    const result = checkCustomElements("index.ts", index);
    expect(result.definitions).toBe(1);
    expect(result.issues).toEqual([]);
    expect(index).toContain('customElements.define("fm-butono", FmButono)');
  });

  it("exposes only ::part(control) and has no text of its own (Art. VIII)", () => {
    expect([...element.matchAll(/part="([a-z-]+)"/g)].map((m) => m[1])).toEqual(["control"]);
    const templates = [...element.matchAll(/`(<[^`]*)`/g)].map((m) => m[1] ?? "");
    expect(templates.length).toBeGreaterThan(0);
    for (const template of templates) expect(template).not.toMatch(/>[^<\s$][^<]*</);
  });
});
