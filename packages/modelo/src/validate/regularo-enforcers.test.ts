// Enforcers of the Reguloj made automatic after D-19 was confirmed (focus ring, typography roles,
// reduced motion, density scope). Each runs on an in-memory copy of the repo Modelo with one
// violation introduced.

import { describe, expect, it } from "vitest";
import type { Modelo } from "../contracts/modelo.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { REGULO_ENFORCERS } from "./regularo-enforcement.js";

const { modelo: repo } = loadModelo(defaultModeloSource());
if (repo === undefined) throw new Error("repo did not load");

function enforce(name: string, mutate: (modelo: Modelo) => void = () => {}) {
  const modelo = structuredClone(repo) as Modelo;
  mutate(modelo);
  const enforcer = REGULO_ENFORCERS[name];
  if (enforcer === undefined) throw new Error(`no enforcer for ${name}`);
  const regulo = modelo.reguloj.find((candidate) => candidate.name === name);
  if (regulo === undefined) throw new Error(`no Regulo ${name}`);
  return enforcer(modelo, regulo).map((issue) => [issue.rule, issue.path]);
}

const set = (modelo: Modelo, name: string) => {
  const found = modelo.setoj.find((candidate) => candidate.name === name);
  if (found === undefined) throw new Error(name);
  return found;
};

describe.each([
  "focus-ring-dual-contrast",
  "typography-roles-composite",
  "motion-reduced-instant",
  "density-affects-layout-only",
])("%s", (name) => {
  it("accepts the repo Modelo", () => {
    expect(enforce(name)).toEqual([]);
  });
});

describe("violations", () => {
  it("focus-ring-pair-missing when the ring is not paired with its gap colour", () => {
    expect(
      enforce("focus-ring-dual-contrast", (modelo) => {
        modelo.kontrastParoj = modelo.kontrastParoj.filter(
          (pair) =>
            !(pair.foreground === "color.focus.ring" && pair.background === "color.focus.inner"),
        );
      }),
    ).toEqual([["focus-ring-pair-missing", "vortaro/sets/core.json#/color/focus/ring"]]);
  });

  it("typography-role-not-composite when a composite field is a literal", () => {
    expect(
      enforce("typography-roles-composite", (modelo) => {
        const token = set(modelo, "core").tokens["typography.body.1"];
        if (token) (token.value as Record<string, unknown>).fontSize = { value: 16, unit: "px" };
      }),
    ).toEqual([["typography-role-not-composite", "vortaro/sets/core.json#/typography/body/1"]]);
  });

  it("motion-reduced-not-instant when a duration role keeps its time under motion=reduced", () => {
    expect(
      enforce("motion-reduced-instant", (modelo) => {
        delete set(modelo, "motion/reduced").tokens["motion.duration.slow"];
      }),
    ).toEqual([
      ["motion-reduced-not-instant", "rezolvo(aspekto=komuna,motion=reduced)/motion.duration.slow"],
    ]);
  });

  it("density-set-scope when density re-points typography", () => {
    expect(
      enforce("density-affects-layout-only", (modelo) => {
        const density = set(modelo, "density/compact");
        const viewportToken = set(modelo, "viewport/compact").tokens["font.size.display.1"];
        if (viewportToken) {
          density.tokens["font.size.display.1"] = {
            ...structuredClone(viewportToken),
            location: { file: density.file, pointer: "/font/size/display/1" },
          };
        }
      }),
    ).toEqual([["density-set-scope", "vortaro/sets/density/compact.json#/font/size/display/1"]]);
  });
});
