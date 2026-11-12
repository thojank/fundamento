// Spec 050 T2 (AC-2): the first check of a new rev solves only what changed. A change of the
// Zweitfarbe (the stage's colour step, T-A/T-B of Spec 036) leaves the lead colour, the status
// colours, the sliders and the targets as they were, so the six palettes of the calibration ask for
// the very same steps as before; only the twelve steps of the Zweitfarbe are new. Counted at the
// seam `solveStep` (each call solves one step by bisection), never by a clock. The bytes of the
// derivation stay those of 79a463bc: `metiejo/src/ableitung-050.test.ts`. Invented values.

import { beforeAll, describe, expect, it, vi } from "vitest";

// The original solver, only counted. No `await` here: the repository's guard reads a factory
// at module level as module code (modelo `ci/test-setup.test.ts`).
vi.mock("./solve.js", (importOriginal) =>
  importOriginal<typeof import("./solve.js")>().then((original) => ({
    ...original,
    solveStep: vi.fn(original.solveStep),
  })),
);

import type { Agordo } from "./agordo.js";
import { parseAgordoColor } from "./agordo.js";
import type { Calibration } from "./calibration.js";
import { derivationBasis } from "./derive.js";
import { loadCalibration, readStructure } from "./node/structure.js";
import { ZWEITFARBE_STEPS } from "./palettes.js";
import { solveStep } from "./solve.js";
import type { Structure } from "./structure.js";

const solved = vi.mocked(solveStep);

let structure: Structure;
let calibration: Calibration;

beforeAll(() => {
  structure = readStructure();
  calibration = loadCalibration();
});

const palettesOf = (agordo: Agordo) => derivationBasis(agordo, structure, calibration).palettes;

describe("a change of the Zweitfarbe solves only the Zweitfarbe (Spec 050 T2)", () => {
  it("solves the twelve steps of the new Zweitfarbe and none of the six other palettes", () => {
    const marke: Agordo = { name: "probekolora", leitfarbe: "#2a6f97" };
    palettesOf({ ...marke, zweitfarbe: { farbe: "#0f8f86" } });
    solved.mockClear();

    const neu = "#b04a7c";
    const palettes = palettesOf({ ...marke, zweitfarbe: { farbe: neu } });

    expect(solved).toHaveBeenCalledTimes(ZWEITFARBE_STEPS.length);
    const hue = parseAgordoColor(neu)?.h;
    expect(solved.mock.calls.map(([request]) => request.hue)).toEqual(
      ZWEITFARBE_STEPS.map(() => hue),
    );
    expect(palettes.steps.filter((step) => step.palette === "sekundo")).toHaveLength(
      ZWEITFARBE_STEPS.length,
    );
  });

  it("solves no step again for an Agordo whose palettes ask for nothing new", () => {
    const marke: Agordo = { name: "probeduobla", leitfarbe: "#8a4fff" };
    palettesOf(marke);
    solved.mockClear();

    palettesOf({ ...marke, name: "probeduobla-kopio" });

    expect(solved).not.toHaveBeenCalled();
  });

  it("hands each derivation its own values: changing one changes no later derivation", () => {
    const marke: Agordo = { name: "probesxangxo", leitfarbe: "#ef6c00" };
    const first = palettesOf(marke);
    const before = JSON.stringify(first);
    for (const step of first.steps) {
      step.components[0] = 0.5;
      step.hex = "#000000";
    }

    expect(JSON.stringify(palettesOf(marke))).toBe(before);
  });
});
