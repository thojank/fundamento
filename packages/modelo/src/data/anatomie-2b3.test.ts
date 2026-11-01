// Spec 036 Teil 5 ②b-3 (Spec 029 abgleich.json, aspect "anatomie"; decided 24.10.): the new parts
// and slots of the fields, choices and menus. Every new slot and part stands after those the Ero
// had (Arkitekturo contract: the props of 0.2.0 unchanged, new slots and parts appended); a part
// that needs words names them in the Modelo (Art. VIII), in de and en.

import { describe, expect, it } from "vitest";
import { briefOf } from "../gvidanto/eroj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const entryOf = (ero: string) => {
  const entry = modelo.eroj.find((candidate) => candidate.ero.name === ero);
  if (entry === undefined) throw new Error(`${ero} missing`);
  return entry;
};
const tokensOf = (value: unknown) => Math.ceil(Buffer.byteLength(JSON.stringify(value)) / 3);
const tradukoOf = (ero: string, path: string, lingvo: "de" | "en") =>
  modelo.tradukoj?.[lingvo]?.[`${entryOf(ero).skemo.id}/${path}`];

/** A-markobutono-4, A-sxaltilo-4: a slot help for the description, as at the other fields. */
const HELPED = ["markobutono", "sxaltilo"] as const;

describe("②b-3 A-markobutono-4, A-sxaltilo-4: the slot help", () => {
  it.each(HELPED)("%s: help is a text slot beside the control, the last slot", (ero) => {
    const { skemo } = entryOf(ero);
    expect(skemo.slots.at(-1)).toEqual({ name: "help", text: true, beside: true });
  });

  it.each(HELPED)("%s: the part help looks as the help of every field", (ero) => {
    const { skemo } = entryOf(ero);
    expect(skemo.parts.help).toEqual(entryOf("elekto").skemo.parts.help);
  });

  it.each(HELPED)("%s: help describes the control first", (ero) => {
    expect(entryOf(ero).skemo.a11y.description?.[0]).toBe("slot:help");
  });

  it.each(HELPED)(
    "%s: the Uzo takes one text in help; slot and part are named in de and en",
    (ero) => {
      expect(entryOf(ero).uzo.slots?.help).toEqual({ accepts: ["text"], max: 1, nesting: 0 });
      for (const path of ["slots/help", "parts/help"]) {
        expect(tradukoOf(ero, path, "de")).toBe("Hilfe");
        expect(tradukoOf(ero, path, "en")).toBe("Help");
      }
    },
  );

  it.each(HELPED)("%s: the brief stays under 750", (ero) => {
    expect(tokensOf(briefOf(entryOf(ero)))).toBeLessThan(750);
  });
});

/** A-elekto-4: a description per option (part option-description), for tariffs or deliveries. */
describe("②b-3 A-elekto-4: option-description", () => {
  it("elekto: the part option-description, muted in the caption, the last part", () => {
    const { skemo } = entryOf("elekto");
    expect(Object.keys(skemo.parts).at(-1)).toBe("option-description");
    expect(skemo.parts["option-description"]).toEqual({
      color: { fixed: "color.text.muted" },
      typography: { fixed: "typography.caption" },
    });
  });

  it("elekto: the part is named in de and en; the Uzo says where its words come from", () => {
    expect(tradukoOf("elekto", "parts/option-description", "de")).toBe("Beschreibung der Option");
    expect(tradukoOf("elekto", "parts/option-description", "en")).toBe("Option description");
    expect(JSON.stringify(entryOf("elekto").uzo)).toContain("description");
  });

  it("elekto: the brief stays under 750", () => {
    expect(tokensOf(briefOf(entryOf("elekto")))).toBeLessThan(750);
  });
});
