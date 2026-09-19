// Aspekto completeness and the reference Aspekto (Spec 001, FR-10, D-04; task T008).

import { rmSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import type { ValidationIssue } from "../contracts/issues.js";
import { fixtureModeloSource } from "../load/source.js";
import { mutatedFixture } from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

const SET = "aspekto-ekzemplo/sets/aspekto/ekzemplo.json";
const CONJ = "aspekto-ekzemplo/sets/aspekto/ekzemplo+color-scheme/dark.json";
const CONJ_ID = "set_ekz_01M2WRK8G0EEEEEEEEEEEEEEE9";

type Tree = Record<string, Record<string, unknown>>;

const roots: string[] = [];
function validate(mutate: Parameters<typeof mutatedFixture>[1]) {
  const root = mutatedFixture("compose-two-aspektoj", mutate);
  roots.push(root);
  return validateModelo(fixtureModeloSource(root));
}
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

const pairs = (issues: readonly ValidationIssue[], rule: string) =>
  issues.filter((issue) => issue.rule === rule).map((issue) => issue.path);

/** Adds the conjunction set to the fixture package and registers its ID. */
function addConjunction(
  edit: Parameters<Parameters<typeof mutatedFixture>[1]>[0],
  tokens: Record<string, unknown>,
) {
  edit(CONJ, () => ({
    $extensions: {
      "com.ciferecigo.fundamento": {
        id: CONJ_ID,
        kondicxoj: ["aspekto=ekzemplo", "color-scheme=dark"],
      },
    },
    ...tokens,
  }));
  edit("aspekto-ekzemplo/ids.lock.json", (lock: { ids: Record<string, unknown> }) => {
    lock.ids[CONJ_ID] = { status: "active", type: "tokenSet" };
  });
}

describe("aspekto-incomplete (D-04)", () => {
  it("lists every core token missing from a non-reference Aspekto, one issue each at its pointer", () => {
    const report = validate((edit) =>
      edit(SET, (set: Tree) => {
        delete set.color?.text;
        delete (set.spacing as Record<string, unknown>).small;
      }),
    );
    expect(pairs(report.errors, "aspekto-incomplete")).toEqual([
      `${SET}#/color/text/default`,
      `${SET}#/spacing/small`,
    ]);
    expect(report.errors.map((issue) => issue.rule)).toEqual([
      "aspekto-incomplete",
      "aspekto-incomplete",
    ]);
  });

  it("counts an alias identical to core as a conscious override", () => {
    const report = validate((edit) =>
      edit(SET, (set: Tree) => {
        const text = set.color?.text as Record<string, Record<string, unknown>> | undefined;
        if (text?.default) text.default.$value = "{color.palette.neutral.900}";
      }),
    );
    expect(report.errors).toEqual([]);
  });

  it("exempts conjunction sets: they carry deltas only", () => {
    const report = validate((edit) =>
      addConjunction(edit, {
        color: { $type: "color", text: { default: { $value: "{color.palette.neutral.0}" } } },
      }),
    );
    // The new set also makes the package's $themes.json fragment stale (T011); that is all.
    expect(report.errors.map((issue) => [issue.rule, issue.path])).toEqual([
      ["themes-out-of-sync", "aspekto-ekzemplo/$themes.json#"],
    ]);
  });
});

describe("aspekto sets never introduce tokens (Q1)", () => {
  it("reports set-introduces-token in the Aspekto set", () => {
    const report = validate((edit) =>
      edit(SET, (set: Tree) => {
        (set.color?.palette as Record<string, unknown>).signal = {
          "500": { $value: { colorSpace: "srgb", components: [1, 0.3, 0], hex: "#ff4d00" } },
        };
      }),
    );
    expect(pairs(report.errors, "set-introduces-token")).toEqual([
      `${SET}#/color/palette/signal/500`,
    ]);
  });

  it("reports set-introduces-token in a conjunction set", () => {
    const report = validate((edit) =>
      addConjunction(edit, {
        color: {
          $type: "color",
          palette: { paper: { "100": { $value: "{color.palette.neutral.0}" } } },
        },
      }),
    );
    expect(pairs(report.errors, "set-introduces-token")).toEqual([
      `${CONJ}#/color/palette/paper/100`,
    ]);
  });
});

describe("the reference Aspekto (FR-10)", () => {
  it("needs no completeness but an empty own set", () => {
    const report = validate((edit) =>
      edit("data/dimensioj.json", (file: { dimensioj: Record<string, unknown>[] }) => {
        const aspekto = file.dimensioj.find((dimensio) => dimensio.name === "aspekto");
        if (aspekto) aspekto.referenceAspekto = "ekzemplo";
      }),
    );
    expect(pairs(report.errors, "aspekto-incomplete")).toEqual([]);
    const notEmpty = pairs(report.errors, "aspekto-reference-set-not-empty");
    expect(notEmpty.length).toBeGreaterThan(0);
    expect(notEmpty).toContain(`${SET}#/color/text/default`);
    expect(new Set(report.errors.map((issue) => issue.rule))).toEqual(
      new Set(["aspekto-reference-set-not-empty"]),
    );
  });
});
