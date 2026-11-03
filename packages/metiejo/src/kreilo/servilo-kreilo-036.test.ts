// Spec 036, Befund 1.5 (Spec 035 D-95): the client of the entry questions shows what the person must
// know of the inspiration before it forwards to the assistant. The server names those sentences
// apart from the proposal (notoj): here the sentence „ohne Browser“ of a JPG (Spec 035 D-78), and
// none for a PNG, which Node decodes itself. The browser is a double that cannot start.

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { playwrightBildilo } from "../enportilo/bildilo.js";
import { parseEnv, settingsOf } from "../env.js";
import { MARKEN_DIR } from "../marko.js";
import { type Servilo, startServilo } from "../servilo.js";
import { encodePng } from "../test-doubles/png.js";
import { fixture } from "../test-doubles/weg-c.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-kreilo-036-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
let servilo: Servilo;

beforeAll(async () => {
  servilo = await startServilo(
    {
      port: 0,
      workdir,
      root,
      settings: settingsOf(parseEnv("")),
      esploro: {
        bildilo: playwrightBildilo(async () => {
          throw new Error("Cannot find package 'playwright'");
        }),
      },
    },
    { stderr: () => {} },
  );
  for (const name of ["senbrowsera", "rekte"]) {
    await fetch(`${servilo.url}/marko`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `name=${name}&basis=komuna`,
      redirect: "manual",
    });
  }
});

afterAll(async () => {
  await servilo.close();
  rmSync(scratch, { recursive: true, force: true });
});

const kreilo = async (name: string, inspiro: { filename: string; base64: string }[]) =>
  (await (
    await fetch(`${servilo.url}/api/marko/${name}/kreilo`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ celo: "", karaktero: {}, festgelegt: {}, inspiro, rajtoj: true }),
    })
  ).json()) as { satz: string; notoj?: string[] };

describe("the answer of the entry questions names what the person must know (Spec 036, D-95)", () => {
  it("a JPG without a browser: the sentence „ohne Browser“ apart from the proposal", async () => {
    const body = await kreilo("senbrowsera", [
      { filename: "bild.jpg", base64: fixture("bild.jpg").toString("base64") },
    ]);
    expect(body.notoj).toEqual([
      "Ohne Browser kann ich die Farben von bild.jpg nicht messen; das Bild liegt im Material.",
    ]);
    expect(body.satz).toContain(body.notoj?.[0]);
  });

  it("a PNG: nothing to know, no sentence", async () => {
    const png = encodePng(8, 8, () => [0x2f, 0x6b, 0x3a, 255]).toString("base64");
    const body = await kreilo("rekte", [{ filename: "wald.png", base64: png }]);
    expect(body.notoj).toEqual([]);
  });
});
