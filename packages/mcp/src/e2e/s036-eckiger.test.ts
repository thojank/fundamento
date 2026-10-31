// Spec 036 Befund 1.2: „eckiger“ from the pill goes one stop back, to 2 – not to the value the
// slider held when the pill was chosen. propose_agordo as an agent calls it, without a language
// model; the stops come from the wish vocabulary (agordilo data/wuensche.json).

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type Connected, closeClients, connect, output, preload } from "../test-doubles/client.js";

const workdir = mkdtempSync(join(tmpdir(), "fm-arbeit-"));
afterAll(async () => {
  await closeClients();
  rmSync(workdir, { recursive: true, force: true });
});
preload({ workdir });

type Proposal = {
  writes: false;
  agordo: Record<string, unknown> & {
    form?: Record<string, number>;
    festgelegt?: Record<string, { alias?: string }>;
  };
  diff: { path: string; label: string; vorher: number | string; nachher: number | string }[];
};

let client: Connected["client"];
beforeAll(async () => {
  ({ client } = await connect({ workdir }));
}, 120_000);

describe("„Mach die Marke eckiger.“ from the pill (Spec 036 Befund 1.2)", () => {
  it("a pill chosen at 0.5 goes back to 2: the controls on the radius, the slider one stop below the pill", async () => {
    const agordo = {
      name: "ekzemplo",
      leitfarbe: "#375479",
      form: { radius: 0.5 },
      festgelegt: { "radius.role.control": { alias: "radius.full" } },
    };
    const answer = await output<Proposal>(client, "propose_agordo", {
      agordo,
      wunsch: "Mach die Marke eckiger.",
    });
    expect(answer.writes).toBe(false);
    expect(answer.agordo.festgelegt).toBeUndefined();
    expect(answer.agordo.form?.radius).toBe(2);
    expect(answer.diff).toEqual([
      { path: "form.radius", label: "Radius", vorher: 0.5, nachher: 2 },
      { path: "form.bedienelemente", label: "Bedienelemente", vorher: "pille", nachher: "radius" },
    ]);
  }, 120_000);
});
