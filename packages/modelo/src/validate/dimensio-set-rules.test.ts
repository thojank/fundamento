// Generic Dimensio sets are alias-only and re-point roles only (Spec 001, D-03, K4; task T009).
// The rules are pure functions here; T016 wires them into validateModelo together with the
// rewritten repo sets (the Phase-0 generic sets still hold literals until then).

import { rmSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import type { LoadedSet, LoadedToken, Modelo } from "../contracts/modelo.js";
import { fixtureModeloSource } from "../load/source.js";
import { dimensioSetIssues } from "./dimensio-set-rules.js";
import { mutatedMinimal } from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

function token(name: string, value: unknown, set: string): LoadedToken {
  return {
    name,
    type: "color",
    value,
    location: { file: `vortaro/sets/${set}.json`, pointer: `/${name.split(".").join("/")}/$value` },
  };
}

function set(name: string, kondicxoj: string[], tokens: LoadedToken[]): LoadedSet {
  return {
    name,
    kondicxoj: kondicxoj.map((k) => {
      const [dimensio = "", valoro = ""] = k.split("=");
      return { dimensio, valoro };
    }),
    file: `vortaro/sets/${name}.json`,
    tokens: Object.fromEntries(tokens.map((t) => [t.name, t])),
  };
}

const LITERAL = { colorSpace: "srgb", components: [0, 0, 0], hex: "#000000" };

function modelo(setoj: LoadedSet[]): Modelo {
  return {
    version: "0.1.0",
    dimensioj: [],
    setoj: [
      set(
        "core",
        [],
        [
          token("color.palette.neutral.900", LITERAL, "core"),
          token("color.palette.neutral.50", LITERAL, "core"),
          token("color.text.default", "{color.palette.neutral.900}", "core"),
        ],
      ),
      ...setoj,
    ],
    reguloj: [],
    jugxoj: [],
    kontrastParoj: [],
    eroj: [],
    idsLock: { ids: {} },
    aspektoPackages: [],
    themesFile: [],
    metadataFile: {},
  };
}

describe("dimensio-set-literal and dimensio-set-primitive (D-03, K4)", () => {
  it("accepts a generic set that re-points a role to another primitive", () => {
    const issues = dimensioSetIssues(
      modelo([
        set(
          "color-scheme/dark",
          ["color-scheme=dark"],
          [token("color.text.default", "{color.palette.neutral.50}", "color-scheme/dark")],
        ),
      ]),
    );
    expect(issues).toEqual([]);
  });

  it("reports a literal in a generic set (it would reach every Aspekto)", () => {
    const issues = dimensioSetIssues(
      modelo([
        set(
          "color-scheme/dark",
          ["color-scheme=dark"],
          [token("color.text.default", LITERAL, "color-scheme/dark")],
        ),
      ]),
    );
    expect(issues.map((i) => [i.rule, i.path])).toEqual([
      ["dimensio-set-literal", "vortaro/sets/color-scheme/dark.json#/color/text/default/$value"],
    ]);
  });

  it("reports a primitive re-pointed by a generic set, even to an alias", () => {
    const issues = dimensioSetIssues(
      modelo([
        set(
          "contrast/high",
          ["contrast=high"],
          [token("color.palette.neutral.900", "{color.palette.neutral.50}", "contrast/high")],
        ),
      ]),
    );
    expect(issues.map((i) => [i.rule, i.path])).toEqual([
      [
        "dimensio-set-primitive",
        "vortaro/sets/contrast/high.json#/color/palette/neutral/900/$value",
      ],
    ]);
  });

  it("reports both rules for a literal override of a primitive", () => {
    const issues = dimensioSetIssues(
      modelo([
        set(
          "contrast/high",
          ["contrast=high"],
          [token("color.palette.neutral.900", LITERAL, "contrast/high")],
        ),
      ]),
    );
    expect(issues.map((i) => i.rule).sort()).toEqual([
      "dimensio-set-literal",
      "dimensio-set-primitive",
    ]);
  });

  it("exempts Aspekto sets and conjunction sets: they belong to one Aspekto", () => {
    const issues = dimensioSetIssues(
      modelo([
        set(
          "aspekto/ekzemplo",
          ["aspekto=ekzemplo"],
          [token("color.palette.neutral.900", LITERAL, "aspekto/ekzemplo")],
        ),
        set(
          "aspekto/ekzemplo+color-scheme/dark",
          ["aspekto=ekzemplo", "color-scheme=dark"],
          [token("color.palette.neutral.900", LITERAL, "aspekto/ekzemplo+color-scheme/dark")],
        ),
      ]),
    );
    expect(issues).toEqual([]);
  });
});

describe("set-override-has-extensions allows textTransform only (D-11)", () => {
  const roots: string[] = [];
  afterAll(() => {
    for (const root of roots) rmSync(root, { recursive: true, force: true });
  });
  const HIGH = "vortaro/sets/contrast/high.json";
  const rules = (extension: Record<string, unknown>) => {
    const root = mutatedMinimal((edit) =>
      edit(HIGH, (value: { color: { text: { default: Record<string, unknown> } } }) => {
        value.color.text.default.$extensions = { "com.ciferecigo.fundamento": extension };
      }),
    );
    roots.push(root);
    return validateModelo(fixtureModeloSource(root)).errors.map((issue) => issue.rule);
  };

  it("accepts an override that only sets textTransform", () => {
    expect(rules({ textTransform: "uppercase" })).toEqual([]);
  });

  it("rejects an override that carries a role or an ID", () => {
    expect(rules({ textTransform: "uppercase", role: "foreground" })).toContain(
      "set-override-has-extensions",
    );
    expect(rules({ id: "tok_01K5FMAJ0FRV73CQ8J0CJ9HV5S" })).toContain(
      "set-override-has-extensions",
    );
  });
});
