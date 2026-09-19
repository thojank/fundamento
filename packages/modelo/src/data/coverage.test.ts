// FR-01 / AK-01 (Spec 001, tasks T012–T015): the core Vortaro covers every category of the
// checklist in test/fixtures/checklist/kategorioj.json (Spec 000 research §4 plus Spec 001
// research §6). One test per category, each naming its missing tokens, so the progress of
// T013–T015 is visible per category. The list lives in the test, not in the Modelo.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CORE_SET_NAME } from "../contracts/grammar.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

interface Kategorio {
  id: string;
  source: string;
  tokens: string[];
}

const { kategorioj } = JSON.parse(
  readFileSync(new URL("../../test/fixtures/checklist/kategorioj.json", import.meta.url), "utf8"),
) as { kategorioj: Kategorio[] };

const { modelo } = loadModelo(defaultModeloSource());
const core = new Set(
  Object.keys(modelo?.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {}),
);

describe("coverage of the core Vortaro (FR-01, AK-01)", () => {
  for (const kategorio of kategorioj) {
    it(`coverage: ${kategorio.id}`, () => {
      const missing = kategorio.tokens.filter((name) => !core.has(name));
      expect(missing, `${kategorio.id} (${kategorio.source})`).toEqual([]);
    });
  }

  it("stays within the planned size of 250–400 core tokens", () => {
    expect(core.size).toBeGreaterThanOrEqual(250);
    expect(core.size).toBeLessThanOrEqual(400);
  });
});
