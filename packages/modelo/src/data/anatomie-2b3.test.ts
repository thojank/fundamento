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
      expect(entryOf(ero).uzo?.slots.help).toEqual({ accepts: ["text"], max: 1, nesting: 0 });
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

/** A-elektilo-4, A-listelektilo-4, A-kompletigilo-4, A-plurelektilo-4: headings of option groups. */
const HEADING = {
  color: { fixed: "color.text.muted" },
  typography: { fixed: "typography.caption" },
};
const GROUPED: Readonly<Record<string, Record<string, unknown>>> = {
  // The select's list is the platform's (E3): the heading has no room of its own.
  elektilo: HEADING,
  listelektilo: { ...HEADING, "inline-padding": { fixed: "spacing.medium" } },
  kompletigilo: { ...HEADING, "inline-padding": { fixed: "spacing.medium" } },
  plurelektilo: { ...HEADING, "inline-padding": { fixed: "spacing.medium" } },
};

describe("②b-3 A-elektilo-4, A-listelektilo-4, A-kompletigilo-4, A-plurelektilo-4: group-heading", () => {
  it.each(Object.entries(GROUPED))(
    "%s: the part group-heading, muted in the caption",
    (ero, part) => {
      expect(entryOf(ero).skemo.parts["group-heading"]).toEqual(part);
      expect(tradukoOf(ero, "parts/group-heading", "de")).toBe("Gruppenüberschrift");
      expect(tradukoOf(ero, "parts/group-heading", "en")).toBe("Group heading");
    },
  );

  it.each(Object.keys(GROUPED))(
    "%s: the Uzo says that an option names its group (attribute group)",
    (ero) => {
      expect(entryOf(ero).uzo?.purpose).toContain("group");
    },
  );

  it.each(Object.keys(GROUPED))("%s: the brief stays under 750", (ero) => {
    expect(tokensOf(briefOf(entryOf(ero)))).toBeLessThan(750);
  });

  it("listelektilo: the part divider between two groups, a line of the subtle border", () => {
    expect(entryOf("listelektilo").skemo.parts.divider).toEqual({
      color: { fixed: "color.border.subtle" },
      width: { fixed: "border.width.default" },
    });
    expect(tradukoOf("listelektilo", "parts/divider", "de")).toBe("Trenner");
    expect(tradukoOf("listelektilo", "parts/divider", "en")).toBe("Divider");
  });
});

/** A-plurelektilo-1 (select-all, moved from ②b-2, D-S36-4.1-11), A-plurelektilo-4: „alle wählen“. */
describe("②b-3 A-plurelektilo-1, A-plurelektilo-4: select-all", () => {
  it("plurelektilo: select-all a boolean, the last prop, false by default; its words in de and en", () => {
    const { skemo } = entryOf("plurelektilo");
    expect(skemo.props.at(-1)).toMatchObject({
      name: "select-all",
      kind: "boolean",
      default: false,
    });
    expect(skemo.a11y.texts?.["select-all"]).toEqual({ de: "Alle wählen", en: "Select all" });
  });

  it("plurelektilo: the part select-all looks as a row of the list", () => {
    const { skemo } = entryOf("plurelektilo");
    expect(skemo.parts["select-all"]).toEqual({
      color: { fixed: "color.text.default" },
      typography: { fixed: "typography.label.1" },
      height: { fixed: "size.target.min" },
      "inline-padding": { fixed: "spacing.medium" },
    });
    expect(tradukoOf("plurelektilo", "props/select-all", "de")).toBe("Alle wählen");
    expect(tradukoOf("plurelektilo", "parts/select-all", "en")).toBe("Select all");
  });

  it("plurelektilo: the brief flags select-all", () => {
    expect(briefOf(entryOf("plurelektilo")).flags).toContain("select-all");
  });
});

/** A-menuo-4: an icon per entry, the heading of a group of entries; the divider is the apartigilo. */
describe("②b-3 A-menuo-4: icon, group-heading", () => {
  it("menuo: the part icon, as large as a medium icon; the row keeps a gap for it", () => {
    const { skemo } = entryOf("menuo");
    expect(skemo.parts.icon).toEqual({ size: { fixed: "size.icon.medium" } });
    expect(skemo.parts.item?.gap).toEqual({ fixed: "spacing.small" });
  });

  it("menuo: the part group-heading, muted in the caption, with the room of a row", () => {
    expect(entryOf("menuo").skemo.parts["group-heading"]).toEqual({
      color: { fixed: "color.text.muted" },
      typography: { fixed: "typography.caption" },
      "inline-padding": { fixed: "spacing.medium" },
    });
  });

  it("menuo: icon and group-heading are named; the Uzo names the attributes icon and group", () => {
    expect(tradukoOf("menuo", "parts/icon", "de")).toBe("Symbol");
    expect(tradukoOf("menuo", "parts/group-heading", "en")).toBe("Group heading");
    const purpose = entryOf("menuo").uzo?.purpose;
    expect(purpose).toContain("attribute icon");
    expect(purpose).toContain("attribute group");
    expect(tokensOf(briefOf(entryOf("menuo")))).toBeLessThan(750);
  });
});

/** A-navigado-1, A-navigado-4: sections with a heading in a vertical navigation, an icon per item. */
describe("②b-3 A-navigado-1, A-navigado-4: section-heading, icon-start", () => {
  it("navigado: the part section-heading, muted in the caption, with the room of an item", () => {
    expect(entryOf("navigado").skemo.parts["section-heading"]).toEqual({
      color: { fixed: "color.text.muted" },
      typography: { fixed: "typography.caption" },
      "inline-padding": { fixed: "spacing.small" },
    });
  });

  it("navigado: the decorative slot icon-start, the last slot; the part icon; a gap in the item", () => {
    const { skemo, uzo } = entryOf("navigado");
    expect(skemo.slots.at(-1)).toEqual({ name: "icon-start", decorative: true });
    expect(skemo.parts.icon).toEqual({ size: { fixed: "size.icon.medium" } });
    expect(skemo.parts.item?.gap).toEqual({ fixed: "spacing.xsmall" });
    expect(uzo?.slots["icon-start"]).toEqual({ accepts: ["icon", "ikono"], max: 1, nesting: 0 });
  });

  it("navigado: named in de and en; the Uzo names the headings of sections; brief under 750", () => {
    expect(tradukoOf("navigado", "parts/section-heading", "de")).toBe("Abschnittsüberschrift");
    expect(tradukoOf("navigado", "slots/icon-start", "en")).toBe("Icon at the start");
    expect(entryOf("navigado").uzo?.purpose).toContain("heading");
    expect(tokensOf(briefOf(entryOf("navigado")))).toBeLessThan(750);
  });
});

/** A-teksto-1 (moved from ②b-2, D-S36-4.2-6): max-lines; the tooltip on truncation is A-teksto-4. */
describe("②b-3 A-teksto-1: max-lines", () => {
  it("teksto: max-lines a number, the last prop; named in de and en", () => {
    const { skemo } = entryOf("teksto");
    expect(skemo.props.at(-1)).toMatchObject({ name: "max-lines", kind: "number" });
    expect(tradukoOf("teksto", "props/max-lines", "de")).toBe("Höchstzahl der Zeilen");
    expect(tradukoOf("teksto", "props/max-lines", "en")).toBe("Maximum lines");
  });

  it("teksto: the brief names max-lines and stays under 750", () => {
    const brief = briefOf(entryOf("teksto"));
    expect(brief.props).toContainEqual({ name: "max-lines", type: "number" });
    expect(tokensOf(brief)).toBeLessThan(750);
  });
});

/** A-insigno-4, A-ligilo-4, A-spuro-4: a decorative slot icon-start, as at butono and signeto. */
const STARTED = ["insigno", "ligilo", "spuro"] as const;

describe("②b-3 A-insigno-4, A-ligilo-4, A-spuro-4: the slot icon-start", () => {
  it.each(STARTED)("%s: icon-start a decorative slot, the last slot; one icon in it", (ero) => {
    const { skemo, uzo } = entryOf(ero);
    expect(skemo.slots.at(-1)).toEqual({ name: "icon-start", decorative: true });
    expect(uzo?.slots["icon-start"]).toEqual({ accepts: ["icon", "ikono"], max: 1, nesting: 0 });
  });

  it.each(STARTED)("%s: the slot is named in de and en; the Uzo names it", (ero) => {
    expect(tradukoOf(ero, "slots/icon-start", "de")).toBe("Symbol am Anfang");
    expect(tradukoOf(ero, "slots/icon-start", "en")).toBe("Icon at the start");
    expect(entryOf(ero).uzo?.purpose).toContain("icon-start");
  });

  it.each(STARTED)("%s: the brief stays under 750", (ero) => {
    expect(tokensOf(briefOf(entryOf(ero)))).toBeLessThan(750);
  });

  it("insigno: a gap between the icon and the words", () => {
    expect(entryOf("insigno").skemo.parts.box?.gap).toEqual({ fixed: "spacing.xsmall" });
  });

  it("spuro: the part icon as large as the separator; the item keeps a gap for it", () => {
    const { skemo } = entryOf("spuro");
    expect(skemo.parts.icon).toEqual({ size: { fixed: "size.icon.small" } });
    expect(skemo.parts.item?.gap).toEqual({ fixed: "spacing.xsmall" });
    expect(tradukoOf("spuro", "parts/icon", "de")).toBe("Symbol");
    expect(tradukoOf("spuro", "parts/icon", "en")).toBe("Icon");
  });
});

/** A-butono-4: the end content takes an insigno too (a count), the icon button stays a butono. */
describe("②b-3 A-butono-4: icon-end takes an insigno", () => {
  it("butono: the Uzo of icon-end accepts an insigno beside an icon", () => {
    expect(entryOf("butono").uzo?.slots["icon-end"]).toEqual({
      accepts: ["icon", "ikono", "insigno"],
      max: 1,
      nesting: 0,
    });
  });

  it("butono: the slots stay those of 0.2.0", () => {
    expect(entryOf("butono").skemo.slots.map((slot) => slot.name)).toEqual([
      "label",
      "icon-start",
      "icon-end",
      "disabled-reason",
    ]);
  });

  it("butono: the Uzo says an insigno may count at the end; brief under 750", () => {
    expect(entryOf("butono").uzo?.purpose).toContain("insigno");
    expect(tokensOf(briefOf(entryOf("butono")))).toBeLessThan(750);
  });
});

/** A-atributlisto-4: the title as slot heading; the part more came with max-entries (②b-2). */
describe("②b-3 A-atributlisto-4: heading, more", () => {
  it("atributlisto: heading a text slot, the last slot; one text in it", () => {
    const { skemo, uzo } = entryOf("atributlisto");
    expect(skemo.slots.at(-1)).toEqual({ name: "heading", text: true });
    expect(uzo?.slots.heading).toEqual({ accepts: ["text"], max: 1, nesting: 0 });
  });

  it("atributlisto: the part heading in the role of a small headline; the part more is there", () => {
    const { skemo } = entryOf("atributlisto");
    expect(skemo.parts.heading).toEqual({
      color: { fixed: "color.text.default" },
      typography: { fixed: "typography.headline.4" },
    });
    expect(skemo.parts.more).toBeDefined();
  });

  it("atributlisto: the heading names the list where no label does; named in de and en", () => {
    const { skemo, uzo } = entryOf("atributlisto");
    expect(skemo.a11y.name).toEqual(["prop:label", "slot:heading"]);
    for (const path of ["slots/heading", "parts/heading"]) {
      expect(tradukoOf("atributlisto", path, "de")).toBe("Überschrift");
      expect(tradukoOf("atributlisto", path, "en")).toBe("Heading");
    }
    expect(uzo?.purpose).toContain("heading");
    expect(tokensOf(briefOf(entryOf("atributlisto")))).toBeLessThan(750);
  });
});

/** A-plenstato-4: a slot heading (where one is) and a slot icon (what is missing). */
describe("②b-3 A-plenstato-4: heading, icon", () => {
  it("plenstato: heading a text slot, icon a decorative slot, after the slots of 0.2.0", () => {
    const { skemo, uzo } = entryOf("plenstato");
    expect(skemo.slots.map((slot) => slot.name)).toEqual(["text", "actions", "heading", "icon"]);
    expect(skemo.slots.at(-2)).toEqual({ name: "heading", text: true });
    expect(skemo.slots.at(-1)).toEqual({ name: "icon", decorative: true });
    expect(uzo?.slots.heading).toEqual({ accepts: ["text"], max: 1, nesting: 0 });
    expect(uzo?.slots.icon).toEqual({ accepts: ["icon", "ikono"], max: 1, nesting: 0 });
  });

  it("plenstato: the parts heading (label role) and icon (a large, muted icon)", () => {
    const { skemo } = entryOf("plenstato");
    expect(skemo.parts.heading).toEqual({
      color: { fixed: "color.text.default" },
      typography: { fixed: "typography.label.1" },
    });
    expect(skemo.parts.icon).toEqual({
      size: { fixed: "size.icon.large" },
      color: { fixed: "color.text.muted" },
    });
  });

  it("plenstato: named in de and en; the Uzo names both; brief under 750", () => {
    expect(tradukoOf("plenstato", "slots/heading", "de")).toBe("Überschrift");
    expect(tradukoOf("plenstato", "parts/heading", "en")).toBe("Heading");
    expect(tradukoOf("plenstato", "slots/icon", "de")).toBe("Symbol");
    expect(tradukoOf("plenstato", "parts/icon", "en")).toBe("Icon");
    const purpose = entryOf("plenstato").uzo?.purpose;
    expect(purpose).toContain("slot heading");
    expect(purpose).toContain("slot icon");
    expect(tokensOf(briefOf(entryOf("plenstato")))).toBeLessThan(750);
  });
});

/** A-tabelo-4: the foot of a table (part foot), for sums. */
describe("②b-3 A-tabelo-4: foot", () => {
  it("tabelo: the part foot, the last part, on the sunken ground in the label role", () => {
    const { skemo } = entryOf("tabelo");
    expect(Object.keys(skemo.parts).at(-1)).toBe("foot");
    expect(skemo.parts.foot).toEqual({
      fill: { fixed: "color.background.sunken" },
      color: { fixed: "color.text.default" },
      typography: { fixed: "typography.label.1" },
    });
  });

  it("tabelo: named in de and en; the Uzo names the foot row; brief under 750", () => {
    expect(tradukoOf("tabelo", "parts/foot", "de")).toBe("Fuß");
    expect(tradukoOf("tabelo", "parts/foot", "en")).toBe("Foot");
    expect(entryOf("tabelo").uzo?.purpose).toContain("tfoot");
    expect(tokensOf(briefOf(entryOf("tabelo")))).toBeLessThan(750);
  });
});

/** A-sxvebilo-4: a close button (part close): on touch there is no Escape. */
describe("②b-3 A-sxvebilo-4: close", () => {
  it("sxvebilo: dismissible a boolean, the last prop, false by default", () => {
    const { skemo } = entryOf("sxvebilo");
    expect(skemo.props.at(-1)).toMatchObject({
      name: "dismissible",
      kind: "boolean",
      default: false,
    });
  });

  it("sxvebilo: the part close as large as a small control, the last part; its words", () => {
    const { skemo } = entryOf("sxvebilo");
    expect(Object.keys(skemo.parts).at(-1)).toBe("close");
    expect(skemo.parts.close).toEqual({ size: { fixed: "size.control.small" } });
    expect(skemo.a11y.texts?.["close-name"]).toEqual({ de: "Schließen", en: "Close" });
  });

  it("sxvebilo: named in de and en; the brief flags dismissible, under 750", () => {
    expect(tradukoOf("sxvebilo", "props/dismissible", "de")).toBe("Schließbar");
    expect(tradukoOf("sxvebilo", "props/dismissible", "en")).toBe("Dismissible");
    expect(tradukoOf("sxvebilo", "parts/close", "de")).toBe("Schließen");
    expect(tradukoOf("sxvebilo", "parts/close", "en")).toBe("Close");
    const brief = briefOf(entryOf("sxvebilo"));
    expect(brief.flags).toContain("dismissible");
    expect(tokensOf(brief)).toBeLessThan(750);
  });
});
