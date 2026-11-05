// Spec 041 (AC-3, AC-6): the verdict of M5 keeps its limit. B-14 is open and the maintainer
// decides; a fix lowers the block, it never raises the limit or the share it counts.
import { describe, expect, it } from "vitest";
import { M5_GRENZE_MS, M5_PERZENTIL } from "./m5.js";

describe("M5 limit (Spec 041)", () => {
  it("blocks count against 50 ms", () => {
    expect(M5_GRENZE_MS).toBe(50);
  });

  it("the 90th percentile of the changes counts", () => {
    expect(M5_PERZENTIL).toBe(0.9);
  });
});
