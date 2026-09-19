// Loading and exporting Eroj (Spec 003 T004; D-02): `data/eroj/<ero>/skemo.json` holds one Ero
// and its Skemo, is schema-validated like every data file and appears in `modelo.json`.

import { describe, expect, it } from "vitest";
import { readModeloSchema } from "../contracts/schema.js";
import { buildModeloJson } from "../export/export-modelo.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";
import { readModeloFiles } from "./files.js";
import { loadModelo } from "./load-modelo.js";
import { defaultModeloSource, fixtureModeloSource } from "./source.js";

const ERO_MINIMAL = fixtureModeloSource(fixtureRoot("valid", "ero-minimal"));

describe("Eroj in the Modelo (T004)", () => {
  it("loads data/eroj/<ero>/skemo.json as one Ero with its Skemo and file", () => {
    const { modelo } = loadModelo(ERO_MINIMAL);
    expect(modelo?.eroj).toHaveLength(1);
    expect(modelo?.eroj[0]?.file).toBe("data/eroj/butono/skemo.json");
    expect(modelo?.eroj[0]?.ero.name).toBe("butono");
    expect(modelo?.eroj[0]?.skemo.ero).toBe(modelo?.eroj[0]?.ero.id);
  });

  it("validates the fixture without issues, IDs registered in its lock", () => {
    const report = validateModelo(ERO_MINIMAL);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
  });

  it("keeps a Modelo without data/eroj valid, with no Eroj", () => {
    const { modelo } = loadModelo(fixtureModeloSource(fixtureRoot("valid", "minimal")));
    expect(modelo?.eroj).toEqual([]);
  });

  it("exports the Ero into eroj and the Skemo into skemoj of modelo.json", () => {
    const { files } = readModeloFiles(ERO_MINIMAL);
    const { modelo } = loadModelo(ERO_MINIMAL);
    if (files === undefined || modelo === undefined) throw new Error("fixture must load");
    const json = buildModeloJson({ modelo, sets: files.sets, schema: readModeloSchema() });
    expect(json.eroj.map((ero) => ero.name)).toEqual(["butono"]);
    expect(json.skemoj.map((skemo) => skemo.ero)).toEqual([json.eroj[0]?.id]);
  });

  it("the repo Modelo loads (with or without Eroj)", () => {
    expect(loadModelo(defaultModeloSource()).modelo).toBeDefined();
  });
});
