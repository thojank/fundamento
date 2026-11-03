// Spec 029 ①: komuna takes the values of the Fonto; the Agordilo keeps deriving over the structure
// of komuna 0.2, rebuilt from the package komuna-0-2 — the structure every derived brand names as
// its origin (aspekto.json, agordilo.structure.sha256) and the calibration was measured on. The
// rebuilt structure is the same document, byte for byte in canonical JSON: the same fingerprint.

import { readFileSync } from "node:fs";
import { CORE_SET_NAME } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { readStructure, referencePackage } from "./index.js";

const storedSha = (fixture: string): string =>
  JSON.parse(
    readFileSync(
      new URL(`../../modelo/test/fixtures/valid/${fixture}/aspekto.json`, import.meta.url),
      "utf8",
    ),
  ).agordilo.structure.sha256;

const accent700 = (structure: ReturnType<typeof readStructure>): string | undefined => {
  const core = structure.files.sets.find((set) => set.name === CORE_SET_NAME)?.value as
    | { color: { palette: { accent: Record<string, { $value: { hex: string } }> } } }
    | undefined;
  return core?.color.palette.accent["700"]?.$value.hex;
};

describe("Spec 029 ①: the structure of komuna 0.2 for the Agordilo", () => {
  it("is rebuilt from komuna-0-2 with the fingerprint the derived brands name", () => {
    const structure = readStructure();
    expect(structure.fingerprint).toBe(storedSha("aspekto-provo/aspekto-provo"));
    expect(structure.fingerprint).toBe(storedSha("aspekto-provo-kompakta/aspekto-provo-kompakta"));
    // Spec 029 ②b-1: the spinner of the fields (M-5, 36 Ero-Tokens) and the clear button of four
    // more fields (M-6, 4) are part of the structure; so is the faldilo's summary by state
    // (M-1: its colour at rest, hover, focus and disabled, its fill disabled); Abnahme #122: the
    // clear button as large as the field's icon, the steppers of a number at icon size, each a
    // target of at least size.target.min (width); ②b-1b M-2: the states warning and success of the
    // twelve fields, the message and the kampo's status icon; Spec 035 2.3: the calendar and the ✕
    // of the date picker at the size of an icon with their targets, read-only as rest. Spec 036
    // Befund 1.1: radius.role.multiline, and the text area, the code block and the tooltip on it.
    expect(structure.fingerprint).toBe(
      "f1cb73acab94cecf893414533f76301387455be6fa068bd22d7ce8e4da9387c9",
    );
  });

  it("carries komuna 0.2: its name, its lead colour and its dark set", () => {
    const structure = readStructure();
    const reference = referencePackage(structure).aspekto.value as { name: string };
    expect(reference.name).toBe("komuna");
    expect(accent700(structure)).toBe("#375479");
    expect(
      structure.files.sets
        .filter((set) => set.package !== undefined)
        .map((set) => set.name)
        .sort(),
    ).toEqual(["aspekto/komuna", "aspekto/komuna+color-scheme/dark"]);
  });

  it("the structure of today's komuna is still readable, as a structure of its own", () => {
    const today = readStructure("komuna");
    expect(today.fingerprint).not.toBe(readStructure().fingerprint);
    expect(accent700(today)).toBe("#474747");
  });
});
