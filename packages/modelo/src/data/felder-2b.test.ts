// Spec 029 ②b-1 (Abgleich ②a, entschieden 24.10.): the patterns of the fields across every field
// Ero. M-5 – loading in fields: a boolean `loading` like the butono's, spoken as busy (aria-busy)
// and described by the Modelo's word, drawn as a turning arc in the part `spinner`; the field stays
// operable (as the kompletigilo since Nachlese 4 N-9).

import { describe, expect, it } from "vitest";
import { briefOf } from "../gvidanto/eroj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { validateModelo } from "../validate/validate-modelo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const skemoOf = (ero: string) => {
  const entry = modelo.eroj.find((candidate) => candidate.ero.name === ero);
  if (entry === undefined) throw new Error(`${ero} missing`);
  return entry.skemo;
};

/** The fields of M-2 and M-5 (abgleich.json, Muster M-5). */
const FIELDS = [
  "kampo",
  "tekstareo",
  "elektilo",
  "listelektilo",
  "plurelektilo",
  "kompletigilo",
  "datelektilo",
  "glitilo",
  "elekto",
  "markobutono",
  "sxaltilo",
  "alsxutilo",
] as const;

describe("Spec 029 ②b-1 M-5: loading in every field", () => {
  it.each(FIELDS)(
    "%s: a boolean loading, false by default, busy, described by the Modelo's word",
    (ero) => {
      const skemo = skemoOf(ero);
      expect(skemo.props.find((prop) => prop.name === "loading")).toMatchObject({
        kind: "boolean",
        default: false,
      });
      expect(skemo.a11y.states?.loading).toEqual(["aria-busy"]);
      expect(skemo.a11y.texts?.loading).toEqual({ de: "lädt", en: "loading" });
    },
  );

  it.each(FIELDS)(
    "%s: the part spinner, an icon's size, the muted text's colour, room beside the label",
    (ero) => {
      const skemo = skemoOf(ero);
      expect(skemo.parts.spinner).toEqual({
        size: { fixed: "size.icon.small" },
        color: { fixed: "color.text.muted" },
        "inline-padding": { fixed: "spacing.small" },
      });
    },
  );

  it("the repo Modelo stays valid", () => {
    expect(validateModelo(defaultModeloSource()).errors).toEqual([]);
  });
});

// M-6 – a clear button in the field (abgleich.json, Muster M-6): a boolean `clearable`, the button
// named „{label} leeren“ for assistive technology. The plurelektilo had its own (Alle abwählen):
// clearable is true there by default and keeps its words, so nothing it did changes.
const CLEARABLE = [
  "kampo",
  "elektilo",
  "listelektilo",
  "plurelektilo",
  "datelektilo",
  "kompletigilo",
];

describe("Spec 029 ②b-1 M-6: a clear button in the field", () => {
  it.each(CLEARABLE)(
    "%s: a boolean clearable and the part clear as large as the field's icon (Abnahme #122)",
    (ero) => {
      const skemo = skemoOf(ero);
      expect(skemo.props.find((prop) => prop.name === "clearable")).toMatchObject({
        kind: "boolean",
        default: ero === "plurelektilo",
      });
      // Abnahme #122: no longer a small control – the icon of the field, the button around it a
      // target of at least size.target.min (feldrand.test.ts).
      const target = { width: { fixed: "size.target.min" } };
      expect(skemo.parts.clear).toEqual(
        ero === "plurelektilo"
          ? { size: { fixed: "size.control.small" } }
          : ero === "listelektilo"
            ? { size: { fixed: "size.icon.medium" }, ...target }
            : ero === "datelektilo"
              ? { size: { fixed: "size.target.min" } }
              : { size: { by: ["size"] }, ...target },
      );
    },
  );

  it.each(CLEARABLE.filter((ero) => ero !== "plurelektilo"))(
    "%s: the button is named after the field: „{label} leeren“",
    (ero) => {
      expect(skemoOf(ero).a11y.texts?.["clear-name"]).toEqual({
        de: "{label} leeren",
        en: "Clear {label}",
      });
    },
  );

  it("the plurelektilo keeps „Alle abwählen“", () => {
    expect(skemoOf("plurelektilo").a11y.texts?.["clear-name"]).toEqual({
      de: "Alle abwählen",
      en: "Clear all",
    });
  });
});

// The brief of get_ero (Maintainer 29.10., before M-2): a boolean prop that is no axis stands as
// its name in flags, in Skemo order, not as {name, type} in props; the ceiling 750 stays.
describe("Spec 029 ②b-1: the brief lists boolean props as flags", () => {
  it.each(modelo.eroj.map((entry) => entry.ero.name))(
    "%s: no boolean in props, every one in flags",
    (ero) => {
      const entry = modelo.eroj.find((candidate) => candidate.ero.name === ero);
      if (entry === undefined) throw new Error(ero);
      const brief = briefOf(entry);
      const axes = new Set(brief.axes.map((axis) => axis.name));
      const booleans = entry.skemo.props
        .filter((prop) => prop.kind === "boolean" && !axes.has(prop.name))
        .map((prop) => prop.name);
      expect((brief.props ?? []).filter((prop) => prop.type === "boolean")).toEqual([]);
      expect(brief.flags ?? []).toEqual(booleans);
    },
  );

  it("the kampo: its flags, and its brief well under 750", () => {
    const entry = modelo.eroj.find((candidate) => candidate.ero.name === "kampo");
    if (entry === undefined) throw new Error("kampo");
    const brief = briefOf(entry);
    expect(brief.flags).toEqual([
      "required",
      "disabled",
      "readonly",
      "invalid",
      "stepper",
      "loading",
      "clearable",
    ]);
    expect(Math.ceil(Buffer.byteLength(JSON.stringify(brief)) / 3)).toBeLessThanOrEqual(700);
  });
});

// M-1 – the reason for disabled (abgleich.json, Muster M-1; Maintainer 29.10.: in a konsileto): a
// text slot disabled-reason at every Ero with disabled; it describes the element, and a reason
// without disabled is a contradiction (constraint). The faldilo gets disabled with it (A-faldilo-3);
// the boundary tooltip-on-disabled of the konsileto is decided: the slot says it, not a konsileto.
const REASONED = [
  "kampo",
  "tekstareo",
  "elektilo",
  "listelektilo",
  "plurelektilo",
  "kompletigilo",
  "datelektilo",
  "glitilo",
  "elekto",
  "markobutono",
  "sxaltilo",
  "alsxutilo",
  "butono",
  "menuo",
  "faldilo",
];

describe("Spec 029 ②b-1 M-1: the reason for disabled", () => {
  it.each(REASONED)(
    "%s: a text slot disabled-reason that describes it, only with disabled",
    (ero) => {
      const skemo = skemoOf(ero);
      expect(skemo.props.find((prop) => prop.name === "disabled")).toMatchObject({
        kind: "boolean",
      });
      expect(skemo.slots).toContainEqual({ name: "disabled-reason", text: true });
      expect(skemo.a11y.description ?? []).toContain("slot:disabled-reason");
      expect(skemo.constraints ?? []).toContainEqual(
        expect.objectContaining({
          when: { "slot:disabled-reason": "filled" },
          allowed: { disabled: ["true"] },
        }),
      );
    },
  );

  it("the faldilo can be disabled, a state of its own", () => {
    expect(skemoOf("faldilo").states).toContain("disabled");
  });

  it("the konsileto's boundary tooltip-on-disabled is decided: not the konsileto's, the slot's", () => {
    const uzo = modelo.eroj.find((entry) => entry.ero.name === "konsileto")?.uzo;
    const boundary = uzo?.boundary.find((entry) => entry.case === "tooltip-on-disabled");
    expect(boundary?.action).toBe("not-supported");
    expect(boundary?.kialo).toContain("disabled-reason");
  });
});
