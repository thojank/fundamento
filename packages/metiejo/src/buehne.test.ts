// Spec 036 Teil 3 through the local server, Befunde 3.4 and 3.5. 3.4: what material and research
// found comes back as tiles – a colour and its share of everything the reading saw, the largest
// first – so the dialog can show them. Without a language model; the material is invented.

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseEnv, settingsOf } from "./env.js";
import { MARKEN_DIR } from "./marko.js";
import type { PrivataDeps } from "./privata.js";
import { type Servilo, startServilo } from "./servilo.js";
import { encodePng } from "./test-doubles/png.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-buehne-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
let servilo: Servilo;

const deps: PrivataDeps = {
  remoteUrl: () => join(scratch, "nenie.git"),
  visibility: async () => "unknown",
  git: () => "",
  cacheDir: join(scratch, "cache"),
  env: {},
};

beforeAll(async () => {
  servilo = await startServilo(
    { port: 0, workdir, root, settings: settingsOf(parseEnv("")), deps },
    { stderr: () => {} },
  );
  await fetch(`${servilo.url}/marko`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "name=probomarko&basis=leer",
    redirect: "manual",
  });
});
afterAll(async () => {
  await servilo.close();
  rmSync(scratch, { recursive: true, force: true });
});

const post = (path: string, body: unknown) =>
  fetch(`${servilo.url}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

interface Kahelo {
  farbo: string;
  anteil: number;
}

describe("Spec 036, Befund 3.4: material comes back as tiles with a colour and its share", () => {
  it("an invented screenshot: two colours, the larger first, shares of the whole in per cent", async () => {
    // A band of petrol (30 × 8) over a light ground (40 × 30): 20 % and 80 %.
    const base64 = encodePng(40, 30, (x, y) =>
      y < 8 && x < 30 ? [0x0f, 0x76, 0x6e, 255] : [0xf4, 0xf4, 0xf2, 255],
    ).toString("base64");
    const response = await post("/api/marko/probomarko/materialo", {
      filename: "bildschirm.png",
      base64,
      rajtoj: true,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { kaheloj?: Kahelo[] };
    expect(body.kaheloj).toEqual([
      { farbo: "#f4f4f2", anteil: 80 },
      { farbo: "#0f766e", anteil: 20 },
    ]);
  });
});
