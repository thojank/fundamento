// The score of one run (Spec 030, Bewertung K1–K6): pure over the stored facts of the rendered
// page, the task and the Modelo. The same facts always give the same number (Determinismus).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  defaultModeloSource,
  loadModelo,
  type NordsteloFile,
  type Tasko,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { type ScoreInput, score } from "./score.js";
import { cleanRenders, facts, h } from "./test-doubles/facts.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo must load");
const katalogo = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../modelo/data/nordstelo.json", import.meta.url)), "utf8"),
) as NordsteloFile;
const login = katalogo.taskoj.find((tasko) => tasko.name === "anmeldung") as Tasko;

const GOOD = [
  h(
    "fm-formularo",
    {},
    h("fm-kampo", { kind: "email", required: "" }, "E-Mail"),
    h("fm-kampo", { kind: "password", required: "" }, "Passwort"),
    h("fm-butono", { emphasis: "high", type: "submit" }, "Anmelden"),
  ),
];
const GOOD_ARIA = [
  { role: "textbox", name: "E-Mail erforderlich" },
  { role: "textbox", name: "Passwort erforderlich" },
  { role: "button", name: "Anmelden" },
];

const input = (over: Partial<ScoreInput> = {}): ScoreInput => ({
  facts: facts(GOOD, GOOD_ARIA),
  tasko: login,
  variant: "F",
  modelo,
  pezoj: katalogo.pezoj,
  ...over,
});

describe("score (K1–K6)", () => {
  it("a clean page of Fundamento's Eroj scores 100", () => {
    const result = score(input());
    expect(result.k).toEqual({ K1: 1, K2: 1, K3: 1, K4: 1, K5: 1, K6: 1 });
    expect(result.total).toBe(100);
    expect(result.gaps).toEqual([]);
  });

  it("K1: an error in the console or an empty page fails the render", () => {
    expect(
      score(input({ facts: facts(GOOD, GOOD_ARIA, { console: ["TypeError: x"] }) })).k.K1,
    ).toBe(0);
    expect(score(input({ facts: facts([], []) })).k.K1).toBe(0);
  });

  it("K2: invented tags, props, values and slots are gaps of their own", () => {
    const page = [
      h(
        "fm-formularo",
        {},
        h("fm-knopf", {}, "Los"),
        h("fm-butono", { variant: "primary", emphasis: "huge", type: "submit" }, "Anmelden"),
        h("fm-kampo", { kind: "email" }, "E-Mail", h("span", { slot: "icon" }, "@")),
      ),
    ];
    const result = score(input({ facts: facts(page, GOOD_ARIA) }));
    expect(result.k.K2).toBeLessThan(1);
    expect(
      result.gaps.filter((gap) => gap.kind.startsWith("invented")).map((gap) => gap.key),
    ).toEqual(["fm-knopf", "butono.variant", "butono.emphasis=huge", "kampo.slot=icon"]);
  });

  it("K3: a Regulo check_usage reports is a gap; two primary actions in one form", () => {
    const page = [
      h(
        "fm-formularo",
        {},
        h("fm-kampo", { kind: "email" }, "E-Mail"),
        h("fm-butono", { emphasis: "high", type: "submit" }, "Anmelden"),
        h("fm-butono", { emphasis: "high" }, "Registrieren"),
      ),
    ];
    const result = score(input({ facts: facts(page, GOOD_ARIA) }));
    expect(result.k.K3).toBeLessThan(1);
    expect(result.gaps.map((gap) => `${gap.kind} ${gap.key}`)).toContain(
      "regulo one-primary-per-container",
    );
  });

  it("K4: the share of renders (4 Aspektoj × 2 schemes × 2 contrasts) without an axe violation", () => {
    const renders = cleanRenders().map((render, index) =>
      index < 4 ? { ...render, axe: [{ id: "color-contrast", nodes: 2 }] } : render,
    );
    const result = score(input({ facts: facts(GOOD, GOOD_ARIA, { renders }) }));
    expect(result.k.K4).toBe(0.75);
    expect(result.gaps).toContainEqual({ kind: "a11y", key: "color-contrast" });
  });

  it("K5: raw values and native elements outside an Ero are gaps; inside an Ero they are its content", () => {
    const page = [
      h(
        "fm-formularo",
        { style: "padding: 12px; color: #333" },
        h("fm-kampo", { kind: "email" }, "E-Mail"),
        h("button", { type: "submit" }, "Anmelden"),
        h("fm-tabelo", {}, "Liste", h("table", { slot: "content" })),
      ),
      h("style", {}, ".x { font-family: Arial; margin: var(--fm-spacing-small); }"),
    ];
    const result = score(input({ facts: facts(page, GOOD_ARIA) }));
    expect(
      result.gaps.filter((gap) => gap.kind === "raw-value" || gap.kind === "rebuilt-ero"),
    ).toEqual([
      { kind: "raw-value", key: "color" },
      { kind: "raw-value", key: "font-family" },
      { kind: "raw-value", key: "padding" },
      { kind: "rebuilt-ero", key: "button" },
    ]);
    expect(result.k.K5).toBeCloseTo(0.2);
  });

  it("K6: the share of the task's criteria that hold; a criterion without a check for the variant does not count", () => {
    const missingPassword = [
      h(
        "fm-formularo",
        {},
        h("fm-kampo", { kind: "email" }, "E-Mail"),
        h("fm-butono", { emphasis: "high", type: "submit" }, "Anmelden"),
      ),
    ];
    const result = score(
      input({
        facts: facts(
          missingPassword,
          GOOD_ARIA.filter((n) => n.name !== "Passwort erforderlich"),
        ),
      }),
    );
    expect(result.k.K6).toBeGreaterThan(0);
    expect(result.k.K6).toBeLessThan(1);
    expect(result.gaps.filter((gap) => gap.kind === "criterion").length).toBeGreaterThan(0);
  });

  it("Variante 0: K2 and K3 do not apply; the total is weighted over K1, K4, K5 and K6", () => {
    const plain = [
      h(
        "form",
        {},
        h("label", {}, "E-Mail", h("input", { type: "email", required: "" })),
        h("label", {}, "Passwort", h("input", { type: "password", required: "" })),
        h("button", { type: "submit" }, "Anmelden"),
      ),
    ];
    const result = score(input({ variant: "0", facts: facts(plain, GOOD_ARIA) }));
    expect(result.k.K2).toBeNull();
    expect(result.k.K3).toBeNull();
    expect(result.k.K5).toBeLessThan(1);
    expect(result.total).toBeGreaterThan(0);
    expect(result.total).toBeLessThan(100);
  });

  it("is deterministic: the same facts, also as a copy, give the same score", () => {
    const first = input({ facts: facts(GOOD, GOOD_ARIA, { console: ["x"] }) });
    expect(score(first)).toEqual(score(structuredClone(first)));
    expect(JSON.stringify(score(first))).toBe(JSON.stringify(score(first)));
  });
});
