// Spec 011 ① (Nachlese 2 of Spec 010, plan ① D-03 to D-06): what the open points of Spec 010
// leave in the data — the brief names every axis a part is keyed by (O-3), the four Figma label
// words are confirmed by a Jugxo each (O-1, O-5, O-9, O-15), and the link colours are declared
// against every surface they stand on (QA L6 of Arkitekturo).

import { describe, expect, it } from "vitest";
import { briefOf } from "../gvidanto/eroj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const ero = (name: string) => {
  const entry = modelo.eroj.find((candidate) => candidate.ero.name === name);
  if (entry === undefined) throw new Error(`${name} missing`);
  return entry;
};

describe("O-3: the brief names boolean axes and the state of an entry", () => {
  it("checked is an axis of the sxaltilo and the markobutono: a boolean that keys their parts", () => {
    for (const name of ["sxaltilo", "markobutono"]) {
      const axes = briefOf(ero(name)).axes;
      // In the order of the props of the Skemo: checked stands before size there.
      expect(
        axes.map((axis) => axis.name),
        name,
      ).toEqual(["checked", "size"]);
      expect(axes.find((axis) => axis.name === "checked")).toEqual({
        name: "checked",
        values: ["true", "false"],
        default: "false",
      });
    }
  });

  it("selected is an axis of the elekto and the elektilo: the state of one entry of the slot options, without a default", () => {
    expect(briefOf(ero("elekto")).axes.map((axis) => axis.name)).toEqual([
      "size",
      "orientation",
      "selected",
    ]);
    expect(briefOf(ero("elektilo")).axes.map((axis) => axis.name)).toEqual(["size", "selected"]);
    for (const name of ["elekto", "elektilo"]) {
      expect(
        briefOf(ero(name)).axes.find((axis) => axis.name === "selected"),
        name,
      ).toEqual({
        name: "selected",
        values: ["true", "false"],
        slot: "options",
      });
    }
  });

  it("a boolean that keys no part is no axis: required, invalid, disabled, readonly, loading, external", () => {
    expect(briefOf(ero("kampo")).axes.map((axis) => axis.name)).toEqual(["kind", "size"]);
    expect(briefOf(ero("butono")).axes.map((axis) => axis.name)).toEqual([
      "emphasis",
      "intent",
      "size",
      "type",
    ]);
    expect(briefOf(ero("ligilo")).axes.map((axis) => axis.name)).toEqual(["placement", "size"]);
  });
});

describe("O-1, O-5, O-9, O-15: the Figma label words are confirmed (Jugxoj)", () => {
  const confirmed = modelo.jugxoj.filter(
    (jugxo) =>
      "celo" in jugxo.ref &&
      jugxo.ref.celo === "figma" &&
      jugxo.date === "2026-10-15" &&
      jugxo.context.includes("Spec 011 ①"),
  );

  it.each([
    ["switch", "Einstellung", "O-1"],
    ["checkbox", "Option", "O-5"],
    ["radiogroup", "Frage", "O-9"],
    ["combobox", "Auswahl", "O-15"],
  ])(
    "the word of the role %s is „%s“ (%s), approved by the maintainer on 2026-10-14",
    (role, word, point) => {
      const jugxo = confirmed.find((candidate) => candidate.kialo.includes(`„${word}“`));
      expect(jugxo, word).toBeDefined();
      expect(jugxo?.decision).toBe("approved");
      expect(jugxo?.ref).toEqual({ artikolo: "VIII", celo: "figma" });
      expect(jugxo?.kialo).toContain(role);
      expect(jugxo?.context).toContain(point);
      expect(jugxo?.context).toContain("2026-10-14");
    },
  );
});

describe("the link colours against every surface (Arkitekturo QA L6)", () => {
  it.each(["rest", "hover", "visited"])(
    "color.link.%s is paired with canvas, default, raised and sunken as text-normal",
    (state) => {
      for (const surface of ["canvas", "default", "raised", "sunken"]) {
        const pair = modelo.kontrastParoj.find(
          (candidate) => candidate.name === `link-${state}-on-background-${surface}`,
        );
        expect(pair, surface).toBeDefined();
        expect(pair?.foreground).toBe(`color.link.${state}`);
        expect(pair?.background).toBe(`color.background.${surface}`);
        expect(pair?.kategorio).toBe("text-normal");
      }
    },
  );
});
