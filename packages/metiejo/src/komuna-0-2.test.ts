// Spec 029 ① 1: komuna-0-2 can be chosen in the Studio. The start screen offers it beside empty
// and komuna: a brand starts from the reference as it was before the Fonto (its lead colour and
// fonts), or from today's komuna, whose accent is neutral like the Fonto's.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { createMarko, MARKEN_DIR, readMarko } from "./marko.js";
import { exampleScreenInput, screen } from "./sxtupoj.js";
import { startAgordo } from "./vorschau.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-komuna-0-2-"));
const workdir = join(scratch, MARKEN_DIR);
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe("Spec 029 ①: komuna-0-2 in the Studio", () => {
  it("the start screen offers komuna-0-2 as a start beside empty and komuna", () => {
    const start = screen(exampleScreenInput("start"));
    for (const basis of ["leer", "komuna", "komuna-0-2"]) {
      expect(start).toContain(`value="${basis}"`);
    }
    expect(start).toContain("komuna-0-2");
  });

  it("komuna-0-2 starts with the lead colour and the fonts of komuna before the Fonto", () => {
    const agordo = startAgordo("malnova", "komuna-0-2");
    expect(agordo.leitfarbe).toBe("#375479");
    expect(agordo.schriften?.body?.family).toBe("Geist");
    expect(agordo.schriften?.code?.family).toBe("Geist Mono");
  });

  it("komuna starts with today's komuna: the neutral accent of the Fonto, the fonts of komuna", () => {
    const agordo = startAgordo("nova", "komuna");
    expect(agordo.leitfarbe).toBe("#474747");
    expect(agordo.schriften?.body?.family).toBe("Geist");
  });

  it("a brand created from komuna-0-2 keeps its start", () => {
    const result = createMarko(workdir, { name: "malnova", basis: "komuna-0-2" });
    expect(result.issues).toEqual([]);
    expect(readMarko(workdir, "malnova")?.agordo.leitfarbe).toBe("#375479");
  });
});
