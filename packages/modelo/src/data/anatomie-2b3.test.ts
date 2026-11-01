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

/** A-glitilo-4: marks without words (part tick) at every step, with the Boolean ticks. */
describe("②b-3 A-glitilo-4: tick", () => {
  it("glitilo: ticks a boolean, the last prop, false by default", () => {
    const { skemo } = entryOf("glitilo");
    expect(skemo.props.at(-1)).toMatchObject({ name: "ticks", kind: "boolean", default: false });
  });

  it("glitilo: the part tick, the last part – a line across the track in the strong border", () => {
    const { skemo } = entryOf("glitilo");
    expect(Object.keys(skemo.parts).at(-1)).toBe("tick");
    expect(skemo.parts.tick).toEqual({
      color: { fixed: "color.border.strong" },
      width: { fixed: "border.width.strong" },
      height: { fixed: "spacing.small" },
    });
  });

  it("glitilo: prop and part are named in de and en; the brief flags ticks, under 750", () => {
    expect(tradukoOf("glitilo", "props/ticks", "de")).toBe("Markierungen");
    expect(tradukoOf("glitilo", "props/ticks", "en")).toBe("Ticks");
    expect(tradukoOf("glitilo", "parts/tick", "de")).toBe("Markierung");
    expect(tradukoOf("glitilo", "parts/tick", "en")).toBe("Tick");
    const brief = briefOf(entryOf("glitilo"));
    expect(brief.flags).toContain("ticks");
    expect(tokensOf(brief)).toBeLessThan(750);
  });
});

/** A-alsxutilo-4: the upload icon in the dropzone, the ikono upload of the Ikonaro (Phosphor). */
describe("②b-3 A-alsxutilo-4: the upload icon", () => {
  it("alsxutilo: the part icon, the last part, as large as a large icon and muted", () => {
    const { skemo } = entryOf("alsxutilo");
    expect(Object.keys(skemo.parts).at(-1)).toBe("icon");
    expect(skemo.parts.icon).toEqual({
      size: { fixed: "size.icon.large" },
      color: { fixed: "color.text.muted" },
    });
  });

  it("alsxutilo: the icon is the Ikonaro's upload; the part is named in de and en", () => {
    expect((modelo.ikonaro ?? []).map((ikono) => ikono.name)).toContain("upload");
    expect(tradukoOf("alsxutilo", "parts/icon", "de")).toBe("Symbol");
    expect(tradukoOf("alsxutilo", "parts/icon", "en")).toBe("Icon");
  });

  it("alsxutilo: the brief stays under 750", () => {
    expect(tokensOf(briefOf(entryOf("alsxutilo")))).toBeLessThan(750);
  });
});
