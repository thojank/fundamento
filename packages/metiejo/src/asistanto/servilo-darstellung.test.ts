// Spec 035, Befund 4.5.1 through the local server: a proposal of the Enportilo shows what it means –
// the swatch of its colour, a crop of the material it comes from (served from the brand's own
// folder, as an image only) and the preview with the proposal beside the preview without it.

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseEnv, settingsOf } from "../env.js";
import { MARKEN_DIR } from "../marko.js";
import type { PrivataDeps } from "../privata.js";
import { type Servilo, startServilo } from "../servilo.js";
import { encodePng } from "../test-doubles/png.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-darstellung-"));
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

// An invented screenshot: a band of petrol over a light ground.
const screenshot = encodePng(40, 30, (x, y) =>
  y < 8 && x < 30 ? [0x0f, 0x76, 0x6e, 255] : [0xf4, 0xf4, 0xf2, 255],
);

const get = (path: string) => fetch(`${servilo.url}${path}`);

beforeAll(async () => {
  servilo = await startServilo(
    { port: 0, workdir, root, settings: settingsOf(parseEnv("")), deps },
    { stderr: () => {} },
  );
  await fetch(`${servilo.url}/marko`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "name=zeigo&basis=komuna",
    redirect: "manual",
  });
  const read = await fetch(`${servilo.url}/api/marko/zeigo/materialo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      filename: "bildschirm.png",
      base64: screenshot.toString("base64"),
      rajtoj: true,
    }),
  });
  expect(read.status).toBe(200);
});
afterAll(async () => {
  await servilo.close();
  rmSync(scratch, { recursive: true, force: true });
});

describe("Spec 035, Befund 4.5.1: the proposal shows its colour, its material and the change", () => {
  it("the step shows the swatch, the crop and the preview with the proposal", async () => {
    const html = await (await get("/asistanto/zeigo/gvidkoloro")).text();
    const proposal = /<fm-avizo intent="info" data-mt-propono>[\s\S]*?<\/fm-avizo>/.exec(html)?.[0];
    expect(proposal).toBeDefined();
    expect(proposal).toMatch(/data-mt-propono-farbe="#0f766e"/);
    expect(proposal).toContain('src="/marko/zeigo/materialo/bildschirm.png"');
    expect(html).toContain("data-mt-vorschau-propono");
  });

  it("the crop is the stored material, served as an image that runs nothing", async () => {
    const response = await get("/marko/zeigo/materialo/bildschirm.png");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-security-policy")).toContain("sandbox");
    expect(Buffer.from(await response.arrayBuffer()).equals(screenshot)).toBe(true);
  });

  it("nothing else of the brand's folder is served as material", async () => {
    for (const path of [
      "/marko/zeigo/materialo/..%2Fagordo.json",
      "/marko/zeigo/materialo/agordo.json",
      "/marko/zeigo/materialo/fehlt.png",
      "/marko/nenie/materialo/bildschirm.png",
    ]) {
      expect((await get(path)).status, path).toBe(404);
    }
  });

  it("the preview with the proposal is the brand with the proposal laid on, the draft unchanged", async () => {
    const before = await (await get("/marko/zeigo/vorschau.css")).text();
    const after = await (await get("/marko/zeigo/vorschau.css?propono=gvidkoloro")).text();
    expect(after).not.toBe(before);
    const page = await (
      await get("/marko/zeigo/vorschau?sxtupo=studio-farbe&breite=mittel&propono=gvidkoloro")
    ).text();
    expect(page).toMatch(/vorschau\.css\?rev=\d+&amp;propono=gvidkoloro/);
    expect(await (await get("/marko/zeigo/vorschau.css")).text()).toBe(before);
    const unknown = await (await get("/marko/zeigo/vorschau.css?propono=nenie")).text();
    expect(unknown).toBe(before);
  });
});
