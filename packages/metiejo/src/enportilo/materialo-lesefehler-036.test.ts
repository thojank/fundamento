// Spec 036 Teil 4 (QA run 1, API issue 4; Teil 1, 1.3 user words): a file the decoder cannot read –
// a PNG cut off after its first bytes – is refused with 422 and one German sentence, never with the
// decoder's own internal message.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GRUND_HELL, grundPng } from "../test-doubles/uebernahme.js";
import { startUebernahme, type UebernahmeServilo } from "../test-doubles/uebernahme-servilo.js";

let servilo: UebernahmeServilo;

beforeAll(async () => {
  servilo = await startUebernahme();
  await servilo.marko("kaputt");
});
afterAll(async () => {
  await servilo.close();
});

describe("Spec 036 Teil 4: an unreadable material is named in user words", () => {
  it("a truncated PNG: 422 with a German sentence, no decoder message", async () => {
    const read = await servilo.legi("kaputt", {
      filename: "kaputt.png",
      bytes: grundPng(GRUND_HELL).subarray(0, 60),
    });
    expect(read.status).toBe(422);
    const satz = String(read.body.satz);
    expect(satz).toMatch(/^Das Material ließ sich nicht lesen/);
    expect(satz).toMatch(/beschädigt oder unvollständig/);
    expect(satz).not.toMatch(/unexpected|end of file|Error|buffer|range/i);
  });

  it("the server goes on reading the next material", async () => {
    const read = await servilo.legi("kaputt", {
      filename: "grund-hell.png",
      bytes: grundPng(GRUND_HELL),
    });
    expect(read.status).toBe(200);
  });
});
