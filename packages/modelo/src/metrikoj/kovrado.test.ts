// dimensio-kovrado (Spec 004 T002, G9, G10) over an invented Modelo and over the repository one.

import { describe, expect, it } from "vitest";
import type { Modelo } from "../contracts/modelo.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { dimensioKovrado } from "./kovrado.js";

const set = (
  name: string,
  kondicxoj: { dimensio: string; valoro: string }[],
  tokens: string[],
) => ({
  name,
  kondicxoj,
  file: `sets/${name}.json`,
  tokens: Object.fromEntries(
    tokens.map((token) => [token, { name: token, type: "color", value: "{x}" }]),
  ),
});

const fixture = {
  setoj: [
    set(
      "color-scheme/dark",
      [{ dimensio: "color-scheme", valoro: "dark" }],
      ["color.background.default", "color.text.default", "color.action.primary.rest"],
    ),
    set(
      "aspekto/marko-a+color-scheme/dark",
      [
        { dimensio: "aspekto", valoro: "marko-a" },
        { dimensio: "color-scheme", valoro: "dark" },
      ],
      ["color.background.default", "color.action.primary.rest"],
    ),
    set(
      "aspekto/marko-b+color-scheme/dark",
      [
        { dimensio: "aspekto", valoro: "marko-b" },
        { dimensio: "color-scheme", valoro: "dark" },
      ],
      ["color.text.default"],
    ),
  ],
} as unknown as Modelo;

describe("dimensio-kovrado", () => {
  it("counts the tokens a brand sets itself against the tokens the Dimensio re-points", () => {
    const a = dimensioKovrado(fixture, {
      aspekto: "marko-a",
      dimensio: "color-scheme",
      valoro: "dark",
    });
    expect(a).toMatchObject({ own: 2, total: 3 });
    expect(a.share).toBeCloseTo(2 / 3, 6);
    expect(a.ownTokens).toEqual(["color.action.primary.rest", "color.background.default"]);
  });

  it("ignores what another brand sets", () => {
    // marko-b sets color.text.default; for marko-a that token stays generic, not foreign.
    const b = dimensioKovrado(fixture, {
      aspekto: "marko-a",
      dimensio: "color-scheme",
      valoro: "dark",
    });
    expect(b.tokens).toEqual([
      "color.action.primary.rest",
      "color.background.default",
      "color.text.default",
    ]);
  });

  it("restricts the count to a scope of token patterns", () => {
    const scoped = dimensioKovrado(fixture, {
      aspekto: "marko-a",
      dimensio: "color-scheme",
      valoro: "dark",
      scope: ["color.background.*"],
    });
    expect(scoped).toMatchObject({ own: 1, total: 1, share: 1 });
  });

  it("is 1 when a Dimensio value re-points nothing", () => {
    expect(
      dimensioKovrado(fixture, { aspekto: "marko-a", dimensio: "contrast", valoro: "high" }),
    ).toMatchObject({ own: 0, total: 0, share: 1 });
  });

  it("measures the repository: komuna sets one of the tokens its dark mode re-points", () => {
    const { modelo } = loadModelo(defaultModeloSource());
    if (modelo === undefined) throw new Error("the repository Modelo could not be loaded");
    const dark = dimensioKovrado(modelo, {
      aspekto: "komuna",
      dimensio: "color-scheme",
      valoro: "dark",
    });
    expect(dark.total).toBe(76);
    expect(dark.own).toBe(1);
    const roles = dimensioKovrado(modelo, {
      aspekto: "komuna",
      dimensio: "color-scheme",
      valoro: "dark",
      scope: ["color.background.**", "color.text.**", "color.action.**", "color.status.**"],
    });
    expect(roles).toMatchObject({ own: 0, total: 56 });
  });
});
