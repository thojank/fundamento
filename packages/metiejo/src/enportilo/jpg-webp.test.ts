// Spec 035, Befund 4.5.6 (D-11): both upload fields – the material of a brand (Weg B) and the
// inspiration of the Kreilo (Weg A) – take JPG/JPEG and WebP besides PNG, SVG and PDF, and the
// Enportilo measures them by area. Node decodes neither; the same optional browser as Weg C does
// (here a double; the real Chromium in packages/eroj/test/weg-c.spec.ts). Without a browser the
// image is taken and stored, and one sentence says that its colours could not be measured. A file
// whose bytes are not what its name says is refused. Size limits stay as they are.

import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readKroniko } from "../asistanto/kroniko.js";
import { parseEnv, settingsOf } from "../env.js";
import { MARKEN_DIR } from "../marko.js";
import { type Servilo, type ServiloOptions, startServilo } from "../servilo.js";
import { bildoFoto, fixture, PRAEGEND } from "../test-doubles/weg-c.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-jpg-webp-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
const servers: Servilo[] = [];
let servilo: Servilo;
const decoded: string[] = [];

/** The browser double: decodes every JPG or WebP into the synthetic photo (2/3 teal). */
const bildilo = {
  bildigi: async () => {
    throw new Error("no page in this test");
  },
  malkodi: async (_bytes: Uint8Array, tipo: string) => {
    decoded.push(tipo);
    return bildoFoto();
  },
};

async function start(esploro: ServiloOptions["esploro"]): Promise<Servilo> {
  const server = await startServilo(
    {
      port: 0,
      workdir,
      root,
      settings: settingsOf(parseEnv("")),
      ...(esploro === undefined ? {} : { esploro }),
    },
    { stderr: () => {} },
  );
  servers.push(server);
  return server;
}

async function brand(server: Servilo, name: string): Promise<void> {
  await fetch(`${server.url}/marko`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `name=${name}&basis=komuna`,
    redirect: "manual",
  });
}

const post = (server: Servilo, path: string, body: unknown) =>
  fetch(`${server.url}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const base64 = (name: string) => fixture(name).toString("base64");

/** The sentences of a text. */
const satzoj = (text: string): string[] =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((satz) => satz.trim())
    .filter((satz) => satz !== "");

beforeAll(async () => {
  servilo = await start({ bildilo });
  await brand(servilo, "foto");
  await brand(servilo, "inspiro");
});
afterAll(async () => {
  for (const server of servers) await server.close();
  rmSync(scratch, { recursive: true, force: true });
});

describe("JPG and WebP in both upload fields (Spec 035, Befund 4.5.6)", () => {
  it("both fields offer JPG, JPEG and WebP besides PNG, SVG and PDF", async () => {
    const material = await (await fetch(`${servilo.url}/asistanto/foto/gvidkoloro`)).text();
    const inspiration = await (await fetch(`${servilo.url}/asistanto/foto/komenco`)).text();
    const accept = (html: string, marker: string) =>
      new RegExp(`<fm-alsxutilo[^>]*accept="([^"]*)"[^>]*${marker}`).exec(html)?.[1]?.split(",");
    for (const [html, marker] of [
      [material, "data-mt-materialo-dosiero"],
      [inspiration, "data-mt-kreilo-inspiro"],
    ] as const) {
      expect(accept(html, marker), marker).toEqual(
        expect.arrayContaining([".png", ".jpg", ".jpeg", ".webp", ".svg", ".pdf"]),
      );
    }
  });

  it.each([
    ["bild.jpg", "bild.jpg", "image/jpeg"],
    ["foto.jpeg", "bild.jpg", "image/jpeg"],
    ["bild.webp", "bild.webp", "image/webp"],
  ])("the material field takes %s and the Enportilo measures it", async (filename, file, tipo) => {
    decoded.length = 0;
    const response = await post(servilo, "/api/marko/foto/materialo", {
      filename,
      base64: base64(file),
      rajtoj: true,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      proponoj: {
        faceto: string;
        agordo: { leitfarbe?: string };
        herkunft: { dosiero: string }[];
      }[];
      satzoj: string[];
    };
    const lead = body.proponoj.find((propono) => propono.faceto === "gvidkoloro");
    expect(lead?.agordo.leitfarbe).toBe(PRAEGEND);
    expect(lead?.herkunft[0]?.dosiero).toBe(filename);
    expect(body.satzoj).toEqual([]);
    expect(decoded).toEqual([tipo]);
  });

  it("the inspiration field of the Kreilo takes a JPG and a WebP and measures them", async () => {
    decoded.length = 0;
    const response = await post(servilo, "/api/marko/inspiro/kreilo", {
      celo: "Eine erfundene Marke.",
      karaktero: {},
      festgelegt: {},
      inspiro: [
        { filename: "bild.jpg", base64: base64("bild.jpg") },
        { filename: "bild.webp", base64: base64("bild.webp") },
      ],
      rajtoj: true,
    });
    expect(response.status).toBe(200);
    expect(decoded).toEqual(["image/jpeg", "image/webp"]);
    const lead = readKroniko(workdir, "inspiro").find(
      (entry) => entry.ago === "propono" && entry.faceto === "gvidkoloro",
    );
    expect(
      (lead?.detaloj as { herkunft?: { dosiero: string }[] } | undefined)?.herkunft?.map(
        (at) => at.dosiero,
      ),
    ).toEqual(expect.arrayContaining(["bild.jpg"]));
  });

  it("a file named .jpg or .webp whose bytes are something else is refused", async () => {
    for (const [filename, file, kind] of [
      ["falsch.jpg", "held.png", /JPEG/],
      ["falsch.webp", "bild.jpg", /WebP/],
    ] as const) {
      const response = await post(servilo, "/api/marko/foto/materialo", {
        filename,
        base64: base64(file),
        rajtoj: true,
      });
      expect(response.status, filename).toBe(422);
      expect(((await response.json()) as { satz: string }).satz).toMatch(kind);
    }
  });
});

describe("JPG and WebP without a browser (Spec 035, Befund 4.5.6, D-11)", () => {
  it("both fields take and store the image and say in one sentence that its colours are missing", async () => {
    const { playwrightBildilo } = await import("./bildilo.js");
    const server = await start({
      bildilo: playwrightBildilo(async () => {
        throw new Error("Cannot find package 'playwright'");
      }),
    });
    await brand(server, "senbrowser");
    const material = await post(server, "/api/marko/senbrowser/materialo", {
      filename: "bild.webp",
      base64: base64("bild.webp"),
      rajtoj: true,
    });
    expect(material.status).toBe(200);
    const body = (await material.json()) as { satzoj: string[] };
    expect(body.satzoj).toHaveLength(1);
    expect(satzoj(body.satzoj[0] ?? "")).toHaveLength(1);
    expect(body.satzoj[0]).toMatch(/Ohne Browser.*bild\.webp/);
    expect(existsSync(join(workdir, "senbrowser", "materialo", "bild.webp"))).toBe(true);

    const kreilo = await post(server, "/api/marko/senbrowser/kreilo", {
      celo: "",
      karaktero: {},
      festgelegt: {},
      inspiro: [{ filename: "bild.jpg", base64: base64("bild.jpg") }],
      rajtoj: true,
    });
    expect(kreilo.status).toBe(200);
    const satz = ((await kreilo.json()) as { satz: string }).satz;
    expect(satzoj(satz).filter((entry) => /Browser/.test(entry))).toHaveLength(1);
    expect(satz).toMatch(/Ohne Browser.*bild\.jpg/);
    expect(existsSync(join(workdir, "senbrowser", "materialo", "bild.jpg"))).toBe(true);
  });
});
