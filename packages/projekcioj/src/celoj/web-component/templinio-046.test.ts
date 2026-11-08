// Spec 046 T4 (section C): the timeline templinio in the Web Component Celo. The platform's own
// ordered list stays in the light DOM (a light host, as the atributlisto's dl); the document's
// stylesheet draws a sign at the start of every entry by its data-status – a filled disc (done), a
// solid ring (current), a dashed ring (upcoming) – and a line between the signs, every value a
// token. Until T5 decides its Bauform the timeline is not in the Figma plan (as the layout Eroj,
// D-11).

import {
  componentCssIssues,
  cssPhysicalPropertyIssues,
  defaultModeloSource,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { FIGMA_CELO } from "../figma/figma.js";
import { isLayout, isTimeline, WEB_COMPONENT_CELO } from "./web-component.js";

const prepared = celoInputOf(defaultModeloSource());
if (!prepared.ok) throw new Error("the repo Modelo must be valid");
const raw = Object.fromEntries(
  WEB_COMPONENT_CELO.generate(prepared.input).map((file) => [file.path, file.text]),
);
const constantOf = (ero: string, name: string) =>
  JSON.parse(
    new RegExp(`export const ${name} = ("(?:[^"\\\\]|\\\\.)*");`).exec(
      raw[`eroj/src/generated/${ero}.styles.ts`] ?? "",
    )?.[1] ?? '""',
  ) as string;
const skemoOf = (ero: string) =>
  prepared.input.modelo.eroj.find((entry) => entry.ero.name === ero)?.skemo;

describe("Web Component Celo for the timeline (Spec 046 T4)", () => {
  const light = constantOf("templinio", "TEMPLINIO_LIGHT_CSS");

  it("is a timeline, and the only one: a list that answers the goal timeline", () => {
    const timelines = prepared.input.modelo.eroj
      .filter((entry) => isTimeline(entry.skemo))
      .map((entry) => entry.ero.name);
    expect(timelines).toEqual(["templinio"]);
    const templinio = skemoOf("templinio");
    if (templinio === undefined) throw new Error("templinio missing");
    expect(isLayout(templinio)).toBe(false);
  });

  it("generates an element with a light stylesheet for the platform's ol, and a React wrapper", () => {
    expect(raw["eroj/src/generated/fm-templinio.ts"]).toBeDefined();
    expect(light).toContain("fm-templinio > ol {");
    expect(light).toContain("list-style: none;");
    // Every entry carries a sign of its status, drawn by the element at its start.
    expect(light).toContain('fm-templinio > ol > li[data-status="done"] > [data-fm-marker]');
    expect(light).toContain('fm-templinio > ol > li[data-status="current"] > [data-fm-marker]');
    expect(light).toContain('fm-templinio > ol > li[data-status="upcoming"] > [data-fm-marker]');
  });

  it("draws the status by shape: dashed by default, solid when current or done, filled when done", () => {
    expect(light).toMatch(
      /fm-templinio > ol > li > \[data-fm-marker\] \{[^}]*border-style: var\(--fm-ero-templinio-marker-stroke\);/,
    );
    expect(light).toMatch(
      /li\[data-status="current"\] > \[data-fm-marker\] \{[^}]*border-style: var\(--fm-ero-templinio-current-stroke\);/,
    );
    expect(light).toMatch(
      /li\[data-status="done"\] > \[data-fm-marker\] \{[^}]*background-color: var\(--fm-ero-templinio-done-fill\);[^}]*border-style: var\(--fm-ero-templinio-done-stroke\);/,
    );
  });

  it("takes every design value from a token and passes the component CSS checks", () => {
    expect(light).not.toMatch(/@media|@container|\dpx/);
    expect(componentCssIssues("templinio.css", light)).toEqual([]);
    expect(cssPhysicalPropertyIssues("templinio.css", light)).toEqual([]);
  });

  it("names the list by its label and speaks the status word of every entry", () => {
    const element = raw["eroj/src/generated/fm-templinio.ts"] ?? "";
    expect(element).toContain("#decorateTimeline(");
    expect(element).toContain("data-fm-marker");
    expect(element).toContain('"data-status"');
  });

  it("leaves the other light hosts as they were: no timeline code in the atributlisto or tabelo", () => {
    for (const ero of ["atributlisto", "tabelo"]) {
      expect(raw[`eroj/src/generated/fm-${ero}.ts`]).not.toContain("decorateTimeline");
      expect(constantOf(ero, `${ero.toUpperCase()}_LIGHT_CSS`)).not.toContain("data-fm-marker");
    }
  });

  it("stays out of the Figma plan until T5 decides its Bauform", () => {
    const plan = JSON.parse(
      FIGMA_CELO.generate(prepared.input).find((file) => file.path === "figma/plan.json")?.text ??
        "{}",
    ) as { components: { set: string }[] };
    expect(plan.components.map((component) => component.set)).not.toContain("templinio");
  });
});
