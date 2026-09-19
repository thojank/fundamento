// The "what is here?" answer of Spec 001 (D-14, Q4; task T020): Dimensioj, Aspektoj with license,
// font and reference/external flags, token counts per group; never a claim of completeness.

import { describe, expect, it } from "vitest";
import type { ModeloJson } from "../contracts/modelo.js";
import { readModeloSchema } from "../contracts/schema.js";
import { buildModelo } from "../load/build.js";
import { readModeloFiles } from "../load/files.js";
import { defaultModeloSource, projectModeloSource } from "../load/source.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { describeModelo } from "./describe.js";
import { exportModelo } from "./export-modelo.js";

function modeloJsonOf(source = defaultModeloSource()): ModeloJson {
  const { files } = readModeloFiles(source);
  if (files === undefined) throw new Error("did not read");
  const exported = exportModelo({
    modelo: buildModelo(files).modelo,
    sets: files.sets,
    schema: readModeloSchema(),
  });
  return JSON.parse(exported.modeloJson) as ModeloJson;
}

const repo = modeloJsonOf();
const project = modeloJsonOf(
  projectModeloSource(`${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`),
);

describe("describeModelo (D-14)", () => {
  it("counts tokens per top-level group, recomputed from modelo.json", () => {
    const description = describeModelo(repo);
    const expected: Record<string, number> = {};
    for (const token of repo.tokens) {
      const group = token.name.split(".")[0] ?? "";
      expected[group] = (expected[group] ?? 0) + 1;
    }
    expect(description.tokensByGroup).toEqual(expected);
    expect(Object.keys(description.tokensByGroup)).toEqual(Object.keys(expected).sort());
    expect(description.jugxoCount).toBe(repo.jugxoj.length);
  });

  it("describes each Aspekto with reference/external, license and font", () => {
    expect(describeModelo(project).aspektoDetails).toEqual([
      { name: "komuna", reference: true, external: false, license: "MIT", font: "Geist" },
      {
        name: "ekzemplo",
        reference: false,
        external: true,
        license: "proprietary",
        font: "Ekzempla Grotesk",
      },
    ]);
  });

  it("names Dimensioj, Aspektoj and counts per group in the sentence", () => {
    const { sentence, tokensByGroup } = describeModelo(project);
    expect(sentence).toMatch(
      /^Fundamento v0\.1\.0: six Dimensioj \(aspekto, viewport, density, color-scheme, contrast, motion\), two Aspektoj \(`komuna`: reference, MIT, Geist; `ekzemplo`: external, proprietary, Ekzempla Grotesk\), \d+ tokens in \w+ types \(.+\), \w+ rules with reasons \(\w+ automatic\), \w+ Jugxoj, one Ero\. Ask explain why a value is what it is\.$/,
    );
    expect(sentence).toContain(`color ${tokensByGroup.color}`);
    expect(sentence).toContain(`typography ${tokensByGroup.typography}`);
  });

  it("never claims complete coverage (Q4)", () => {
    for (const modeloJson of [repo, project]) {
      expect(describeModelo(modeloJson).sentence).not.toMatch(/complete|vollst|coverage/i);
    }
  });
});
