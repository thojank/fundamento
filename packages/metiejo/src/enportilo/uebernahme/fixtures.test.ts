// Spec 036 Teil 4: the committed pictures and the PDF of the take-over (test-doubles/uebernahme/)
// are the bytes their generators draw – the Messanleitung and the material run read the files, the
// tests the generators.

import { describe, expect, it } from "vitest";
import { FIXTURES, uebernahmeFixture } from "../../test-doubles/uebernahme.js";
import { BILD_FIXTURES } from "../../test-doubles/uebernahme-bilder.js";

describe("Spec 036 Teil 4: the committed material equals its generator", () => {
  for (const [name, make] of Object.entries({ ...FIXTURES, ...BILD_FIXTURES })) {
    it(name, () => {
      expect(uebernahmeFixture(name).equals(make())).toBe(true);
    });
  }
});
