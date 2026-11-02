// Spec 036 Teil 3, Befund 3.5 (QA run 1, web issue 3): the sentence of a check mark on the stage is
// read by the brand owner beside the component it marks. It names the problem in the check's words
// and the component and its part by their German names – never a token path of the Vortaro.

import type { RaportoViolation } from "@fundamento/agordilo";
import { buildModelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { pruefmarkojOf } from "./buehne-pruefung.js";
import { satzOf } from "./klartext.js";
import { loadBases } from "./vorschau.js";

const modelo = buildModelo(loadBases().structure.files).modelo;
const TOKEN_PATH = /\b[a-z]+\.[a-z]+(\.[a-z]+)+\b/;

const violation = {
  rule: "text-hierarchy",
  fixed: false,
  subject: "color.text.subtle",
  combination: "color-scheme=light,contrast=default",
  path: "rezolvo/color.text.subtle",
  message: "",
  cause: "",
  suggestion: "",
} as unknown as RaportoViolation;

describe("Spec 036, Befund 3.5: the stage's check sentence in the person's words", () => {
  it("the check's own sentence names the token (other surfaces keep it)", () => {
    expect(satzOf(violation)).toMatch(TOKEN_PATH);
  });

  it("every mark names the problem and the component, no token path", () => {
    const markoj = pruefmarkojOf([violation], modelo, satzOf);
    expect(markoj.map((marko) => marko.ero)).toEqual(expect.arrayContaining(["teksto"]));
    for (const marko of markoj) {
      expect(marko.satz, marko.ero).toMatch(/^Textstufen nicht unterscheidbar bei /);
      expect(marko.satz, marko.ero).not.toMatch(TOKEN_PATH);
      expect(marko.satz, marko.ero).toMatch(/\(hell\)\.$/);
    }
  });
});
