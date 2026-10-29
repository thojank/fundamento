// Spec 029 ②b-1 (Abgleich ②a, entschieden 24.10.): the patterns of the fields across every field
// Ero. M-5 – loading in fields: a boolean `loading` like the butono's, spoken as busy (aria-busy)
// and described by the Modelo's word, drawn as a turning arc in the part `spinner`; the field stays
// operable (as the kompletigilo since Nachlese 4 N-9).

import { describe, expect, it } from "vitest";
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
    "%s: a boolean clearable and the part clear in a small control's size",
    (ero) => {
      const skemo = skemoOf(ero);
      expect(skemo.props.find((prop) => prop.name === "clearable")).toMatchObject({
        kind: "boolean",
        default: ero === "plurelektilo",
      });
      expect(skemo.parts.clear).toEqual({ size: { fixed: "size.control.small" } });
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
