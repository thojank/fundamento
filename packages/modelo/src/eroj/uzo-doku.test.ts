// Spec 036 Teil 5 ③ (Spec 029 ③): the Uzo carries the fields of the documentation per Ero that no
// other data holds – when not (with the Ero to take instead), do and don't, the keyboard – in
// German and English. Schema → data → check: the schema knows the fields and their placeholder,
// every Ero of the repo carries them, check:dokumentaro reports what is still open.

import { readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { fixtureModeloSource } from "../load/source.js";
import { fixtureRoot, mutatedFixture } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";
import { DOKU_KAMPOJ, DOKU_OFFEN, isDokuOffen } from "./dokumentaro.js";

const schema = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../schema/modelo.schema.json", import.meta.url)), "utf8"),
) as { $defs: Record<string, { properties?: Record<string, unknown>; required?: string[] }> };
const erojDir = fileURLToPath(new URL("../../data/eroj/", import.meta.url));

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

describe("Uzo schema: the documentation fields (Spec 036 ③)", () => {
  it("names when-not, do-dont and keyboard in the Uzo", () => {
    const properties = Object.keys(schema.$defs.Uzo?.properties ?? {});
    expect(DOKU_KAMPOJ).toEqual(["when-not", "do-dont", "keyboard"]);
    for (const field of DOKU_KAMPOJ) expect(properties).toContain(field);
  });

  it("writes every text in German and English, and has a placeholder of its own", () => {
    expect(schema.$defs.UzoTexto?.required).toEqual(["de", "en"]);
    expect(schema.$defs.UzoOffen?.required).toEqual(["offen"]);
    expect(schema.$defs.UzoWhenNot?.required).toEqual(["case", "ero"]);
    expect(schema.$defs.UzoDoDont?.required).toEqual(["do", "dont"]);
    expect(schema.$defs.UzoKeyboardKey?.required).toEqual(["keys", "action"]);
    expect(isDokuOffen({ offen: DOKU_OFFEN })).toBe(true);
    expect(isDokuOffen([{ keys: ["Enter"], action: DOKU_OFFEN }])).toBe(false);
  });

  it("valid/dokumentaro-plena validates with the three fields written", () => {
    const report = validateModelo(fixtureModeloSource(fixtureRoot("valid", "dokumentaro-plena")));
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
  });

  it("valid/dokumentaro-plena validates with the placeholder in every field", () => {
    const root = mutatedFixture("dokumentaro-plena", (edit) =>
      edit("data/eroj/butono/uzo.json", (file: { uzo: Record<string, unknown> }) => {
        for (const field of DOKU_KAMPOJ) file.uzo[field] = { offen: DOKU_OFFEN };
      }),
    );
    roots.push(root);
    expect(validateModelo(fixtureModeloSource(root)).errors).toEqual([]);
  });

  it("uzo-ero-unknown: when-not sends to an Ero that does not exist", () => {
    const root = mutatedFixture("dokumentaro-plena", (edit) =>
      edit("data/eroj/butono/uzo.json", (file: { uzo: Record<string, unknown> }) => {
        file.uzo["when-not"] = [{ case: { de: "Weg.", en: "Away." }, ero: "gibts-nicht" }];
      }),
    );
    roots.push(root);
    const issues = validateModelo(fixtureModeloSource(root)).errors.map(({ rule, path }) => ({
      rule,
      path,
    }));
    expect(issues).toContainEqual({
      rule: "uzo-ero-unknown",
      path: "data/eroj/butono/uzo.json#/uzo/when-not/0/ero",
    });
  });

  it("a text without its English half is a schema error", () => {
    const root = mutatedFixture("dokumentaro-plena", (edit) =>
      edit("data/eroj/butono/uzo.json", (file: { uzo: Record<string, unknown> }) => {
        file.uzo["do-dont"] = { do: [{ de: "Nur Deutsch." }], dont: [{ de: "x", en: "x" }] };
      }),
    );
    roots.push(root);
    const errors = validateModelo(fixtureModeloSource(root)).errors;
    expect(
      errors.some(({ path }) => path.startsWith("data/eroj/butono/uzo.json#/uzo/do-dont")),
    ).toBe(true);
  });
});

describe("the Uzo data: every Ero carries the documentation fields (Spec 036 ③)", () => {
  const eroj = readdirSync(erojDir).sort();
  it.each(eroj)("%s has when-not, do-dont and keyboard, written or as the placeholder", (ero) => {
    const uzo = (
      JSON.parse(readFileSync(join(erojDir, ero, "uzo.json"), "utf8")) as {
        uzo: Record<string, unknown>;
      }
    ).uzo;
    for (const field of DOKU_KAMPOJ) {
      expect(uzo[field], `${ero}: ${field}`).toBeDefined();
      // A placeholder is the marker of the run, word for word, so a search finds every one.
      if (isDokuOffen(uzo[field])) expect(uzo[field]).toEqual({ offen: DOKU_OFFEN });
    }
  });
});
