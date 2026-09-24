// AK-12 (second half), narrowed on 2026-09-20 at the maintainer's decision: the exported Modelo
// carries no Celo-specific *mappings*. A sentence that belongs to a Celo says so in a typed field —
// a Jugxo in `ref.celo`, a Manko in `celo` — and may then name that tool in its own fields. The
// word alone is not a mapping; the constitution itself names the tool in Article X.
//
// The licence is a condition, not a list of permitted fields (maintainer, 2026-09-23): whoever
// declares may name, whoever does not declare may not. These tests are the guard for that: a real
// mapping has to trip the check, a declaring sentence must not — and the rule has to hold for a
// kind of sentence nobody taught the checker about by name.

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

/** A Manko declares its Celo in `celo`; its outward reference is a link that names the tool (F41). */
const mankoOfCelo = {
  id: "man_01M37TQHM886J48FX84PZZTY4X",
  celo: "figma",
  property: "textCase",
  modelo: "Die Schreibweise eines Textes ist je Marke ausdrückbar.",
  instead: "Das Ziel nimmt die Bindung nicht an.",
  evidence: "in setBoundVariable: Unknown field: 'textCase'.",
  date: "2026-09-23",
  external: "https://forum.figma.com/t/add-variable-support-for-letter-case/69878",
  closing: {
    measure: "binding-accepted",
    statement: "Die Bindung auf textCase wirft keine Ausnahme mehr.",
  },
};

describe("no Celo-specific mappings in the Modelo (AK-12, Art. VIII)", () => {
  it("passes a Jugxo that names its Celo in ref.celo and in its prose", () => {
    expect(celoMappingLeaks({ jugxoj: [jugxoOfCelo] })).toEqual([]);
  });

  // The rule, not a list: nothing in the checker knows the word `mankoj`. The Manko passes because
  // it declares, and its link and its nested closing are its own fields.
  it("passes a Manko that declares its Celo in the typed field and names it in its own fields", () => {
    expect(celoMappingLeaks({ mankoj: [mankoOfCelo] })).toEqual([]);
  });

  it("trips on a Manko whose fields name a Celo it does not declare", () => {
    const document = { mankoj: [{ ...mankoOfCelo, celo: "tailwind" }] };
    expect(celoMappingLeaks(document)).toEqual([
      { pointer: "/mankoj/0/external", needle: "figma" },
    ]);
  });

  it("trips on a Manko that names a Celo without the typed field", () => {
    const { celo, ...rest } = mankoOfCelo;
    expect(celoMappingLeaks({ mankoj: [rest] })).toEqual([
      { pointer: "/mankoj/0/external", needle: "figma" },
    ]);
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
