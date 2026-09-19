// FR-01 / AK-01 (Spec 001, tasks T012–T015): the core Vortaro covers every category of the
// checklist in test/fixtures/coverage/kategorioj.json (Spec 000 research §4 plus Spec 001
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
  readFileSync(new URL("../../test/fixtures/coverage/kategorioj.json", import.meta.url), "utf8"),
) as { kategorioj: Kategorio[] };

/**
 * Categories not delivered yet: they are expected to fail (`it.fails`) until their task lands.
 * T013 removes the colour categories, T014 the typography categories, T015 the rest; after T015
 * this set is empty and removed (T015 "Done when").
 */
const PENDING = new Set([
  "color.palette",
  "color.action",
  "color.surface",
  "color.text",
  "color.border",
  "color.link",
  "color.navigation",
  "color.status",
  "color.brand",
  "color.shadow-backdrop",
  "focus",
  "typography.families-weights",
  "typography.scales",
  "typography.roles",
  "spacing",
  "shape",
  "elevation",
  "motion",
  "size",
  "layout",
  "opacity",
]);

const { modelo } = loadModelo(defaultModeloSource());
const core = new Set(
  Object.keys(modelo?.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {}),
);

describe("coverage of the core Vortaro (FR-01, AK-01)", () => {
  it("lists every pending category in the checklist", () => {
    const ids = new Set(kategorioj.map((kategorio) => kategorio.id));
    expect([...PENDING].filter((id) => !ids.has(id))).toEqual([]);
  });

  for (const kategorio of kategorioj) {
    const test = PENDING.has(kategorio.id) ? it.fails : it;
    test(`coverage: ${kategorio.id}`, () => {
      const missing = kategorio.tokens.filter((name) => !core.has(name));
      expect(missing, `${kategorio.id} (${kategorio.source})`).toEqual([]);
    });
  }

  it("stays within the planned size of 250–400 core tokens", () => {
    if (PENDING.size > 0) return; // meaningful once every category is delivered (T015)
    expect(core.size).toBeGreaterThanOrEqual(250);
    expect(core.size).toBeLessThanOrEqual(400);
  });
});
