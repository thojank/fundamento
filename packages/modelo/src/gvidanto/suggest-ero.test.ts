// suggest_ero (Spec 003 T023, FR-13, D-16 §2): a word of intent to an Ero with its props.

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { suggestEro } from "./suggest-ero.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo could not be loaded");

const suggest = (intent: string, lingvo?: "en" | "de") => {
  const result = suggestEro(modelo, lingvo === undefined ? { intent } : { intent, lingvo });
  if (!result.ok) throw new Error(`suggest_ero ${intent} failed`);
  return result.output;
};

describe("suggest_ero", () => {
  it("suggests the destructive button for Löschen, delete and Entfernen!", () => {
    for (const text of ["Löschen", "delete", "Entfernen!"]) {
      const output = suggest(text);
      expect(output.intent).toBe(text);
      expect(output.matched?.intent).toBe("destructive");
      expect(output.suggestion).toEqual({
        ero: "butono",
        props: { variant: "primary", tone: "danger" },
      });
      expect(output.regulo?.name).toBe("destructive-not-primary-color");
      expect(output.kialo).toBe(output.regulo?.kialo);
    }
  });

  it("suggests tertiary for Abbrechen and primary for Speichern", () => {
    expect(suggest("Abbrechen").suggestion).toEqual({
      ero: "butono",
      props: { variant: "tertiary" },
    });
    const confirm = suggest("Speichern");
    expect(confirm.matched?.intent).toBe("confirm");
    expect(confirm.suggestion).toEqual({ ero: "butono", props: { variant: "primary" } });
    expect(confirm.regulo?.name).toBe("one-primary-per-container");
  });

  it("names the keyword and its language", () => {
    expect(suggest("Bitte alles löschen").matched).toEqual({
      intent: "destructive",
      keyword: "löschen",
      lingvo: "de",
    });
    expect(suggest("Delete this row").matched?.lingvo).toBe("en");
  });

  it("takes only the given language when lingvo is set", () => {
    expect(suggest("delete", "en").matched?.lingvo).toBe("en");
    const german = suggestEro(modelo, { intent: "delete", lingvo: "de" });
    expect(german.ok).toBe(false);
    if (german.ok) return;
    expect(german.issues.map((issue) => issue.rule)).toEqual(["intent-unknown"]);
  });

  it("answers an unknown intent with intent-unknown and the known intents", () => {
    const result = suggestEro(modelo, { intent: "hüpfen" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.rule)).toEqual(["intent-unknown"]);
    expect(result.issues[0]?.path).toBe("suggest_ero/intent");
    expect(result.allowed).toEqual(["destructive", "confirm", "dismiss"]);
  });

  it("is deterministic: the same input gives the same output", () => {
    expect(suggest("Löschen")).toEqual(suggest("Löschen"));
  });
});
