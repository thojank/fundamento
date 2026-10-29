// Spec 033 S2 (Weg B) through the local server: material of an existing brand – uploads and a link –
// asks for the confirmation at the start (Amendment v2.5), is read by the Enportilo, and becomes a
// proposal per Faceto with provenance; "Vorschlag übernehmen" applies it through the draft. The
// Kroniko holds the foreign basis, the confirmation, every proposal and the take-over.

import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readKroniko } from "../asistanto/kroniko.js";
import { parseEnv, settingsOf } from "../env.js";
import { MARKEN_DIR } from "../marko.js";
import type { PrivataDeps } from "../privata.js";
import { type Servilo, startServilo } from "../servilo.js";
import { encodePng } from "../test-doubles/png.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-enportilo-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
let servilo: Servilo;
let site: Server;
let siteUrl = "";

const deps: PrivataDeps = {
  remoteUrl: () => join(scratch, "nenie.git"),
  visibility: async () => "unknown",
  git: () => "",
  cacheDir: join(scratch, "cache"),
  env: {},
};

const screenshot = encodePng(40, 30, (x, y) =>
  y < 8 && x < 30 ? [0x0f, 0x76, 0x6e, 255] : [0xf4, 0xf4, 0xf2, 255],
).toString("base64");

beforeAll(async () => {
  site = createServer((request, response) => {
    if (request.url === "/s.css") {
      response
        .writeHead(200, { "content-type": "text/css" })
        .end("body{font-family:Inter,sans-serif}.btn{border-radius:6px;padding:10px 12px;background:#0f766e}");
      return;
    }
    response.writeHead(200, { "content-type": "text/html" }).end('<link rel="stylesheet" href="/s.css">');
  });
  await new Promise<void>((done) => site.listen(0, "127.0.0.1", done));
  siteUrl = `http://127.0.0.1:${(site.address() as AddressInfo).port}/`;
  servilo = await startServilo(
    { port: 0, workdir, root, settings: settingsOf(parseEnv("")), deps },
    { stderr: () => {} },
  );
  await fetch(`${servilo.url}/marko`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "name=lumo&basis=komuna",
    redirect: "manual",
  });
});
afterAll(async () => {
  await servilo.close();
  site.close();
  rmSync(scratch, { recursive: true, force: true });
});

const post = (path: string, body: unknown) =>
  fetch(`${servilo.url}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

type Proponoj = { proponoj: { faceto: string; satz: string; herkunft: { dosiero: string }[] }[] };

describe("Weg B: material of an existing brand (Spec 033 S2)", () => {
  it("material without the confirmation is not read: the confirmation comes first", async () => {
    const response = await post("/api/marko/lumo/materialo", { filename: "bildschirm.png", base64: screenshot });
    expect(response.status).toBe(409);
    expect(((await response.json()) as { satz: string }).satz).toContain("Bestätigung");
    expect(readKroniko(workdir, "lumo").some((entry) => entry.ago === "fremda")).toBe(false);
  });

  it("a screenshot with the confirmation: the foreign basis, the confirmation and a proposal per Faceto with provenance", async () => {
    const response = await post("/api/marko/lumo/materialo", {
      filename: "bildschirm.png",
      base64: screenshot,
      rajtoj: true,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as Proponoj;
    const lead = body.proponoj.find((propono) => propono.faceto === "gvidkoloro");
    expect(lead?.herkunft[0]?.dosiero).toBe("bildschirm.png");
    expect(existsSync(join(workdir, "lumo", "materialo", "bildschirm.png"))).toBe(true);
    const entries = readKroniko(workdir, "lumo");
    expect(entries.find((entry) => entry.ago === "fremda")?.detaloj).toMatchObject({ kiel: "upload" });
    expect(entries.some((entry) => entry.ago === "konfirmo")).toBe(true);
    const proposal = entries.find((entry) => entry.ago === "propono" && entry.faceto === "gvidkoloro");
    expect(proposal?.fonto).toBe("agento");
    expect(JSON.stringify(proposal?.detaloj)).toContain("bildschirm.png");
  });

  it("a link: the website's CSS gives the family, the radius and the spacing, with the file", async () => {
    const response = await post("/api/marko/lumo/materialo", { url: siteUrl, rajtoj: true });
    expect(response.status).toBe(200);
    const body = (await response.json()) as Proponoj;
    const faceted = body.proponoj.map((propono) => propono.faceto);
    expect(faceted).toEqual(expect.arrayContaining(["tiparo", "formo", "spaco"]));
    const formo = body.proponoj.find((propono) => propono.faceto === "formo");
    expect(formo?.herkunft[0]?.dosiero).toBe(`${siteUrl}s.css`);
    expect(readKroniko(workdir, "lumo").filter((entry) => entry.ago === "fremda").at(-1)?.detaloj).toMatchObject({
      kiel: "link",
    });
  });

  it("the assistant shows the proposal of the step with its provenance; taking it applies it to the draft", async () => {
    const html = await (await fetch(`${servilo.url}/asistanto/lumo/formo`)).text();
    expect(html).toContain("Vorschlag");
    expect(html).toContain("s.css");
    const taken = await post("/api/marko/lumo/faceto", { faceto: "formo", ago: "akcepto" });
    expect(taken.status).toBe(200);
    const stato = (await (await fetch(`${servilo.url}/api/marko/lumo/stato`)).json()) as {
      facetoj: { name: string; stato: string }[];
    };
    expect(stato.facetoj.find((faceto) => faceto.name === "formo")?.stato).toBe("definiert");
    const entries = readKroniko(workdir, "lumo");
    const change = entries.findLast((entry) => entry.ago === "sxangxo" && entry.faceto === "formo");
    expect(change?.fonto).toBe("agento");
  });

  it("a font file goes to the fonts of the brand and is proposed as a licensed font; without a private repository it waits", async () => {
    const response = await post("/api/marko/lumo/materialo", {
      filename: "Hausschrift-Regular.woff2",
      base64: Buffer.from("wOF2fake").toString("base64"),
      rajtoj: true,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as Proponoj & { satzoj: string[] };
    expect(body.proponoj.find((propono) => propono.faceto === "tiparo")?.satz).toContain("Hausschrift");
    expect(body.satzoj.join(" ")).toContain("FM_TIPAROJ_REPO");
    expect(existsSync(join(workdir, "lumo", "fontoj", "Hausschrift-Regular.woff2"))).toBe(true);
  });

  it("a file the Enportilo cannot read is named, nothing else changes", async () => {
    const response = await post("/api/marko/lumo/materialo", { filename: "notizen.docx", base64: "AAAA", rajtoj: true });
    expect(response.status).toBe(422);
    expect(((await response.json()) as { satz: string }).satz).toMatch(/PNG|SVG|PDF/);
  });
});
