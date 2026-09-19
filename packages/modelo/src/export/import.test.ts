// The export is a complete read model (FR-17): the Modelo rebuilt from modelo.json resolves every
// combination exactly like the source Modelo (Spec 001, T024).

import { describe, expect, it } from "vitest";
import type { ModeloJson } from "../contracts/modelo.js";
import { readModeloSchema } from "../contracts/schema.js";
import { buildModelo } from "../load/build.js";
import { readModeloFiles } from "../load/files.js";
import { projectModeloSource } from "../load/source.js";
import { allAssignments } from "../resolve/assignment.js";
import { resolve } from "../resolve/resolve.js";
import { serializeCanonicalJson } from "../themes/serialize.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { exportModelo } from "./export-modelo.js";
import { modeloFromExport } from "./import.js";

const { files } = readModeloFiles(
  projectModeloSource(`${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`),
);
if (files === undefined) throw new Error("did not read");
const source = buildModelo(files).modelo;
const modeloJson = JSON.parse(
  exportModelo({ modelo: source, sets: files.sets, schema: readModeloSchema() }).modeloJson,
) as ModeloJson;

describe("modeloFromExport", () => {
  const rebuilt = modeloFromExport(modeloJson);

  it("resolves every combination exactly like the source Modelo", { timeout: 30_000 }, () => {
    const differing = allAssignments(source).filter(
      (assignment) =>
        // The export sorts keys canonically; compare in that form.
        serializeCanonicalJson(resolve(source, assignment)) !==
        serializeCanonicalJson(resolve(rebuilt, assignment)),
    );
    expect(allAssignments(rebuilt)).toHaveLength(144);
    expect(differing).toEqual([]);
  });

  it("keeps packages, namespaces and Aspekto metadata", () => {
    expect(rebuilt.aspektoPackages.map((pkg) => [pkg.aspekto, pkg.name, pkg.namespace])).toEqual([
      ["komuna", "@fundamento/aspekto-komuna", undefined],
      ["ekzemplo", "aspekto-ekzemplo", "ekz"],
    ]);
    expect(rebuilt.setoj.find((set) => set.name === "aspekto/ekzemplo")?.package).toBe(
      "aspekto-ekzemplo",
    );
    expect(rebuilt.reguloj).toEqual(source.reguloj);
    expect(rebuilt.kontrastParoj).toEqual(source.kontrastParoj);
  });
});
