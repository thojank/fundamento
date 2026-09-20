// AK-12 (second half), narrowed on 2026-09-20 at the maintainer's decision: the exported Modelo
// carries no Celo-specific *mappings*. A Jugxo that belongs to a Celo says so in the typed field
// `ref.celo`; its prose may then name the tool. The word alone is not a mapping — the constitution
// itself names the tool in Article X.
//
// These tests are the guard for that narrowing: a real mapping has to trip the check, a Jugxo with
// its typed reference must not.

import { describe, expect, it } from "vitest";
import { celoMappingLeaks } from "./celo-mappings.js";

const jugxoOfCelo = {
  id: "jug_01M307X4DQQWRFTDXB1S5CGPN9",
  ref: { artikolo: "VIII", celo: "figma" },
  decision: "deviation-recorded",
  kialo: "Figma bindet an einer Fläche nur die Farbe an eine Variable.",
  date: "2026-09-20",
  context: "Spec 003 F8, Abnahme M1.",
};

describe("no Celo-specific mappings in the Modelo (AK-12, Art. VIII)", () => {
  it("passes a Jugxo that names its Celo in ref.celo and in its prose", () => {
    expect(celoMappingLeaks({ jugxoj: [jugxoOfCelo] })).toEqual([]);
  });

  it("trips on a key that names a Celo", () => {
    const document = { tokens: { color: { primary: { figma: { variable: "color/primary" } } } } };
    expect(celoMappingLeaks(document).map((leak) => leak.pointer)).toEqual([
      "/tokens/color/primary/figma",
    ]);
  });

  // The mapping the narrowing must keep catching: a token that carries the name it has in a Celo.
  it("trips on a value that maps a token to a Celo name", () => {
    const document = {
      tokens: { color: { primary: { $extensions: { nomo: "--color-primary" } } } },
    };
    expect(celoMappingLeaks(document)).toEqual([
      { pointer: "/tokens/color/primary/$extensions/nomo", needle: "--color-" },
    ]);
  });

  it("trips on prose outside a Jugxo that names a Celo", () => {
    const document = { reguloj: [{ kialo: "Diese Regel gilt, weil Figma es so macht." }] };
    expect(celoMappingLeaks(document)).toEqual([{ pointer: "/reguloj/0/kialo", needle: "figma" }]);
  });

  it("trips on Jugxo prose that names a Celo the Jugxo does not declare", () => {
    const document = { jugxoj: [{ ...jugxoOfCelo, kialo: "Tailwind benennt die Klassen um." }] };
    expect(celoMappingLeaks(document)).toEqual([
      { pointer: "/jugxoj/0/kialo", needle: "tailwind" },
    ]);
  });

  it("trips on a Jugxo whose prose names a Celo without the typed reference", () => {
    const { ref, ...rest } = jugxoOfCelo;
    const document = { jugxoj: [{ ...rest, ref: { artikolo: "VIII" } }] };
    expect(celoMappingLeaks(document)).toEqual([{ pointer: "/jugxoj/0/kialo", needle: "figma" }]);
  });

  // An unknown Celo grants no licence: the typed field is wrong, and the prose that leaned on it
  // falls with it.
  it("trips on a ref.celo that names no Celo the code knows", () => {
    const document = { jugxoj: [{ ...jugxoOfCelo, ref: { artikolo: "VIII", celo: "sketch" } }] };
    expect(celoMappingLeaks(document)).toEqual([
      { pointer: "/jugxoj/0/ref/celo", needle: "sketch" },
      { pointer: "/jugxoj/0/kialo", needle: "figma" },
    ]);
  });
});
