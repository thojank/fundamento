// deriveThemes against real fixtures: one theme per DimensioValoro, conjunction sets under every
// theme they involve, tokenSetOrder in resolver order, and committed fixture files in sync.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { allAssignments } from "../resolve/assignment.js";
import { orderActiveSets } from "../resolve/order.js";
import { fixtureRoot, loadFixture } from "../resolve/test-doubles/fixtures.js";
import { deriveThemes } from "./derive.js";
import { serializeCanonicalJson, serializeThemes } from "./serialize.js";

describe("deriveThemes", () => {
  it("derives the resolve-matrix themes and set order", () => {
    const modelo = loadFixture("valid", "resolve-matrix");
    const { themes, metadata } = deriveThemes(modelo);
    const dva = (suffix: string) => `dva_01M2WRK8G0DDDDDDDDDDDDDD${suffix}`;
    expect(themes).toEqual([
      {
        id: dva("DG"),
        name: "neutra",
        group: "aspekto",
        selectedTokenSets: { core: "source", "aspekto/neutra+color-scheme/dark": "enabled" },
      },
      {
        id: dva("DH"),
        name: "light",
        group: "color-scheme",
        selectedTokenSets: { core: "source" },
      },
      {
        id: dva("DJ"),
        name: "dark",
        group: "color-scheme",
        selectedTokenSets: {
          core: "source",
          "color-scheme/dark": "enabled",
          "aspekto/neutra+color-scheme/dark": "enabled",
        },
      },
      { id: dva("DK"), name: "default", group: "contrast", selectedTokenSets: { core: "source" } },
      {
        id: dva("DM"),
        name: "high",
        group: "contrast",
        selectedTokenSets: { core: "source", "contrast/high": "enabled" },
      },
    ]);
    expect(metadata).toEqual({
      tokenSetOrder: [
        "core",
        "color-scheme/dark",
        "aspekto/neutra+color-scheme/dark",
        "contrast/high",
      ],
    });
  });

  it("agrees with the resolver: every combination's active sets are a subsequence of tokenSetOrder", () => {
    for (const name of ["minimal", "resolve-matrix", "resolve-tie"]) {
      const modelo = loadFixture("valid", name);
      const order = deriveThemes(modelo).metadata.tokenSetOrder;
      for (const assignment of allAssignments(modelo)) {
        const active = orderActiveSets(modelo, assignment).map((set) => set.name);
        expect(order.filter((set) => active.includes(set))).toEqual(active);
      }
    }
  });

  it("serializes canonically: sorted keys, 2-space indent, trailing newline", () => {
    expect(serializeCanonicalJson({ b: [2, { d: 1, c: 0 }], a: "x" })).toBe(
      '{\n  "a": "x",\n  "b": [\n    2,\n    {\n      "c": 0,\n      "d": 1\n    }\n  ]\n}\n',
    );
  });

  it.each([
    ["valid", "minimal"],
    ["valid", "resolve-matrix"],
    ["valid", "resolve-tie"],
    ["invalid", "resolve-cross-set-cycle"],
    ["invalid", "ids-duplicate"],
    ["invalid", "ids-retired-reused"],
  ] as const)("committed $themes.json / $metadata.json of %s/%s are in sync", (kind, name) => {
    const modelo = loadFixture(kind, name, { allowIssues: kind === "invalid" });
    const { themesJson, metadataJson } = serializeThemes(deriveThemes(modelo));
    const vortaro = join(fixtureRoot(kind, name), "vortaro");
    expect(readFileSync(join(vortaro, "$themes.json"), "utf8")).toBe(themesJson);
    expect(readFileSync(join(vortaro, "$metadata.json"), "utf8")).toBe(metadataJson);
  });
});
