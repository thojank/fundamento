// Spec 056 (MP-2a, T4, KBS-3.2): the routes of the node Beispiele. `POST …/beispiele` takes one file
// (`{filename, base64}`) or one address (`{url}`), reads it through the Enportilo in a temporary
// work folder and keeps it in `marken/<name>/materialo/` only when it reads (plan D-9); every colour
// carries the flags of `farbArtDe` (D-5). An address is fetched once through `esploro.fetch`
// without a cookie (D-10): an image goes on like an upload, anything else becomes a reference with
// its sentence. A body above the request limit answers 422 with TRO_GRANDA_SATZ (D-11).
// `DELETE …/beispiele/:datei` removes one file. Every test runs in a temporary work folder with
// doubles for the network and the browser; invented brands only.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { type Bildilo, SenBrowser } from "./enportilo/bildilo.js";
import { MATERIALO_DIR } from "./enportilo/materialo.js";
import { farbArtDe } from "./farb-arto.js";
import {
  type BeispielDosiero,
  KEIN_BILD_SATZ,
  NELEGEBLA_DOSIERO_SATZ,
  PINTEREST_SATZ,
  TRO_GRANDA_SATZ,
  type Verweis,
} from "./grafeo-gestalten-sicht.js";
import { KREILO } from "./kreilo/datoj.js";
import { ANFRAGE_GRENZE } from "./servilo.js";
import { encodePng } from "./test-doubles/png.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

const MARKO = "provo";

/** A small PNG: the left `links` columns of 10 in `a`, the rest in `b` (RGB). */
const png = (a: number[], b: number[], links = 6): Buffer =>
  encodePng(10, 10, (x) => [...(x < links ? a : b), 255]);
const BLAU = [47, 91, 255];
const GRAU = [128, 128, 128];
const ROT = [210, 60, 40];

const SVG = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4">\n<rect fill="#2f5bff" width="4" height="2"/>\n<rect fill="#2f5bff" y="2" width="2" height="2"/>\n<rect fill="#f3efe6" x="2" y="2" width="2" height="2"/>\n</svg>\n',
);

function pdf(): Buffer {
  const stream = deflateSync(
    Buffer.from(
      "0.184 0.357 1 rg 0 0 10 10 re f\n0.95 0.94 0.9 rg 0 0 5 5 re f\n0.184 0.357 1 rg\n",
      "latin1",
    ),
  );
  return Buffer.concat([
    Buffer.from(`%PDF-1.4\n1 0 obj << /Length ${stream.length} /Filter /FlateDecode >>\nstream\n`),
    stream,
    Buffer.from("\nendstream\nendobj\n%%EOF\n"),
  ]);
}

/** A JPEG/WebP head the Enportilo accepts by its bytes (the pixels come from the browser double). */
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(60, 1)]);
const WEBP = Buffer.concat([
  Buffer.from("RIFF", "latin1"),
  Buffer.alloc(4, 0),
  Buffer.from("WEBPVP8 ", "latin1"),
  Buffer.alloc(40, 2),
]);
const GIF = Buffer.from("GIF89a\u0001\u0000\u0001\u0000\u0000\u0000\u0000;", "latin1");
const WOFF2 = Buffer.concat([Buffer.from("wOF2", "latin1"), Buffer.alloc(40, 3)]);

/** What the browser double does with a JPG/WebP: nothing (no browser) or a blue picture. */
let mitBrowser = false;
const bildilo: Bildilo = {
  bildigi: () => Promise.reject(new SenBrowser("kein Browser")),
  malkodi: () => {
    if (!mitBrowser) return Promise.reject(new SenBrowser("kein Browser"));
    const rgba = new Uint8Array(4 * 16);
    for (let i = 0; i < 16; i++) rgba.set([...BLAU, 255], 4 * i);
    return Promise.resolve({ width: 4, height: 4, rgba });
  },
};

/** Every request of the fetch double, and what it answers per address. */
const abrufe: { url: string; init: RequestInit | undefined }[] = [];
const ANTWORTEN: Record<string, () => Response> = {
  "https://bilder.example/plakat.png": () =>
    new Response(new Uint8Array(png(ROT, GRAU)), { headers: { "content-type": "image/png" } }),
  "https://bilder.example/ohne-typ": () =>
    new Response(new Uint8Array(png(BLAU, GRAU)), {
      headers: { "content-type": "application/octet-stream" },
    }),
  "https://bilder.example/bild.gif": () =>
    new Response(new Uint8Array(GIF), { headers: { "content-type": "image/gif" } }),
  "https://www.pinterest.de/provo/werkstatt/": () =>
    new Response("<!doctype html><title>Pinterest</title><div id=root></div>", {
      headers: { "content-type": "text/html; charset=utf-8" },
    }),
  "https://pin.it/abc123": () =>
    new Response("<!doctype html><title>Pinterest</title>", {
      headers: { "content-type": "text/html" },
    }),
  "https://seite.example/": () =>
    new Response("<!doctype html><title>Seite</title><p>Hallo", {
      headers: { "content-type": "text/html" },
    }),
  "https://seite.example/fehlt.png": () => new Response("Nicht gefunden", { status: 404 }),
};
const fetchDouble = (url: string, init?: RequestInit): Promise<Response> => {
  abrufe.push({ url, init });
  const antwort = ANTWORTEN[url];
  return antwort === undefined
    ? Promise.reject(new TypeError("fetch failed"))
    : Promise.resolve(antwort());
};

let server: TestServilo;
const materialo = (): string => join(server.workdir, MARKO, MATERIALO_DIR);
const json = (body: Buffer): Record<string, unknown> =>
  JSON.parse(body.toString("utf8")) as Record<string, unknown>;
const hochladen = (filename: string, bytes: Buffer, marko = MARKO) =>
  server.anfrage(
    "POST",
    `/api/marko/${marko}/beispiele`,
    JSON.stringify({ filename, base64: bytes.toString("base64") }),
  );
const ligi = (url: string) =>
  server.anfrage("POST", `/api/marko/${MARKO}/beispiele`, JSON.stringify({ url }));
const forigi = (datei: string, marko = MARKO) =>
  new Promise<{ status: number; body: Buffer }>((done, fail) => {
    // `anfrage` of the shared double knows GET and POST; DELETE goes the same way by hand.
    import("node:http")
      .then(({ request }) => {
        const peto = request(
          {
            host: "127.0.0.1",
            port: server.servilo.port,
            path: `/api/marko/${marko}/beispiele/${datei}`,
            method: "DELETE",
            headers: { connection: "close" },
          },
          (respondo) => {
            const chunks: Buffer[] = [];
            respondo.on("data", (c: Buffer) => chunks.push(c));
            respondo.on("end", () =>
              done({ status: respondo.statusCode ?? 0, body: Buffer.concat(chunks) }),
            );
          },
        );
        peto.on("error", fail);
        peto.end();
      })
      .catch(fail);
  });

/** The files of the brand's `materialo/` besides `.gitignore`. */
const dosieroj = (): string[] =>
  existsSync(materialo())
    ? readdirSync(materialo())
        .filter((d) => d !== ".gitignore")
        .sort()
    : [];

beforeAll(async () => {
  server = await testServilo("beispiele-056-", { esploro: { fetch: fetchDouble, bildilo } });
  await markeAnlegen(server, MARKO, "leer");
});
afterAll(async () => {
  await server.close();
});
beforeEach(() => {
  mitBrowser = false;
  abrufe.length = 0;
});

/** Every colour of an answer carries the flags `farbArtDe` gives its hex (D-5). */
function flagojKorektaj(datei: BeispielDosiero): void {
  for (const farbo of datei.farben ?? []) {
    const arto = farbArtDe(farbo.hex, KREILO.unbunt);
    expect(arto).toBeDefined();
    expect({ hell: farbo.hell, bunt: farbo.bunt, leit: farbo.leit }).toEqual(arto);
  }
}

describe("POST /api/marko/:name/beispiele – a file (D-9, D-5)", () => {
  it("PNG: 200 with colours and flags, kept in materialo/ behind .gitignore", async () => {
    const bytes = png(BLAU, GRAU);
    const antwort = await hochladen("plakat.png", bytes);
    expect(antwort.status).toBe(200);
    const { datei } = json(antwort.body) as { datei: BeispielDosiero };
    expect(datei.name).toBe("plakat.png");
    expect(datei.art).toBe("png");
    expect(datei.satz).toBeUndefined();
    expect(datei.farben?.map((f) => [f.hex, f.anteil])).toEqual([
      ["#2f5bff", 60],
      ["#808080", 40],
    ]);
    flagojKorektaj(datei);
    expect(datei.farben?.[0]).toMatchObject({ bunt: true, leit: true });
    expect(datei.farben?.[1]).toMatchObject({ bunt: false, leit: false });
    expect(readFileSync(join(materialo(), "plakat.png")).equals(bytes)).toBe(true);
    expect(readFileSync(join(materialo(), ".gitignore"), "utf8")).toBe("*\n");
  });

  it("SVG and PDF: colours from their fills as shares in percent, with flags", async () => {
    const svg = await hochladen("zeichen.svg", SVG);
    expect(svg.status).toBe(200);
    const s = (json(svg.body) as { datei: BeispielDosiero }).datei;
    expect(s.art).toBe("svg");
    expect(s.farben?.map((f) => f.hex)).toEqual(["#2f5bff", "#f3efe6"]);
    expect(Math.round((s.farben ?? []).reduce((summe, f) => summe + f.anteil, 0))).toBe(100);
    flagojKorektaj(s);

    const p = await hochladen("leitfaden.pdf", pdf());
    expect(p.status).toBe(200);
    const d = (json(p.body) as { datei: BeispielDosiero }).datei;
    expect(d.art).toBe("pdf");
    expect(d.farben?.[0]?.hex).toBe("#2f5bff");
    expect(d.farben?.[0]?.anteil).toBeGreaterThan(d.farben?.[1]?.anteil ?? 100);
    flagojKorektaj(d);
    expect(existsSync(join(materialo(), "zeichen.svg"))).toBe(true);
    expect(existsSync(join(materialo(), "leitfaden.pdf"))).toBe(true);
  });

  it("JPG and WebP without the browser: kept, the existing sentence, no colours", async () => {
    for (const [name, bytes, art] of [
      ["werkbank.jpg", JPG, "jpg"],
      ["detail.jpeg", JPG, "jpg"],
      ["leuchte.webp", WEBP, "webp"],
    ] as const) {
      const antwort = await hochladen(name, bytes);
      expect(antwort.status).toBe(200);
      const { datei } = json(antwort.body) as { datei: BeispielDosiero };
      expect(datei).toEqual({
        name,
        art,
        farben: [],
        satz: `Ohne Browser kann ich die Farben von ${name} nicht messen; das Bild liegt im Material.`,
      });
      expect(readFileSync(join(materialo(), name)).equals(bytes)).toBe(true);
    }
  });

  it("JPG with the browser: the colours of its pixels", async () => {
    mitBrowser = true;
    const antwort = await hochladen("blau.jpg", JPG);
    expect(antwort.status).toBe(200);
    const { datei } = json(antwort.body) as { datei: BeispielDosiero };
    expect(datei.farben?.map((f) => [f.hex, f.anteil])).toEqual([["#2f5bff", 100]]);
    flagojKorektaj(datei);
  });

  it("an unreadable file: 422 with the sentence, nothing kept, a good file of that name untouched", async () => {
    const gut = png(ROT, GRAU);
    expect((await hochladen("bild.png", gut)).status).toBe(200);
    const vorher = dosieroj();
    const kaputt = png(BLAU, GRAU).subarray(0, 40);
    for (const [name, bytes] of [
      ["animation.gif", GIF],
      ["brief.docx", Buffer.from("PK\u0003\u0004 kein Bild", "latin1")],
      ["schrift.woff2", WOFF2],
      ["bild.png", kaputt],
      ["bild.png", Buffer.from("kein PNG")],
      ["bild.svg", gut],
      ["bild.pdf", gut],
      ["bild.jpg", gut],
      ["bild.webp", gut],
      ["ohne-endung", gut],
      ["", gut],
    ] as const) {
      const antwort = await hochladen(name, bytes);
      expect({ name, status: antwort.status, body: json(antwort.body) }).toEqual({
        name,
        status: 422,
        body: { satz: NELEGEBLA_DOSIERO_SATZ },
      });
    }
    expect(dosieroj()).toEqual(vorher);
    expect(readFileSync(join(materialo(), "bild.png")).equals(gut)).toBe(true);
    expect(existsSync(join(server.workdir, MARKO, "fontoj", "schrift.woff2"))).toBe(false);
  });

  it("a body without a file or an address: 422 with the sentence", async () => {
    for (const korpo of ["{", "[]", "{}", JSON.stringify({ filename: "a.png" })]) {
      const antwort = await server.anfrage("POST", `/api/marko/${MARKO}/beispiele`, korpo);
      expect(antwort.status).toBe(422);
      expect(json(antwort.body)).toEqual({ satz: NELEGEBLA_DOSIERO_SATZ });
    }
  });

  it("the same name again: the new file replaces the old one", async () => {
    expect((await hochladen("wechsel.png", png(ROT, GRAU))).status).toBe(200);
    const neu = png(BLAU, BLAU);
    const antwort = await hochladen("wechsel.png", neu);
    expect(antwort.status).toBe(200);
    const { datei } = json(antwort.body) as { datei: BeispielDosiero };
    expect(datei.farben?.map((f) => f.hex)).toEqual(["#2f5bff"]);
    expect(readFileSync(join(materialo(), "wechsel.png")).equals(neu)).toBe(true);
  });

  it("a name with a path stays inside materialo/ under its plain name", async () => {
    const antwort = await hochladen("../../ausbruch.png", png(ROT, GRAU));
    expect(antwort.status).toBe(200);
    expect((json(antwort.body) as { datei: BeispielDosiero }).datei.name).toBe("ausbruch.png");
    expect(existsSync(join(materialo(), "ausbruch.png"))).toBe(true);
    expect(existsSync(join(server.workdir, "ausbruch.png"))).toBe(false);
    expect(existsSync(join(server.workdir, MARKO, "ausbruch.png"))).toBe(false);
  });

  it("above the request limit: 422 with „Sie ist größer als 24 MB.“, nothing kept", async () => {
    const vorher = dosieroj();
    const groesse = ANFRAGE_GRENZE + 1024;
    const korpo = `{"filename":"riesig.png","base64":"${"A".repeat(groesse)}"}`;
    const antwort = await server.anfrage("POST", `/api/marko/${MARKO}/beispiele`, korpo);
    expect(antwort.status).toBe(422);
    expect(json(antwort.body)).toEqual({ satz: `${NELEGEBLA_DOSIERO_SATZ}. ${TRO_GRANDA_SATZ}` });
    expect(dosieroj()).toEqual(vorher);
  });

  it("an unknown brand: 404 {satz}, nothing written", async () => {
    const antwort = await hochladen("plakat.png", png(BLAU, GRAU), "nenia");
    expect(antwort.status).toBe(404);
    expect(json(antwort.body)).toEqual({ satz: "Diese Marke gibt es nicht." });
    expect(existsSync(join(server.workdir, "nenia"))).toBe(false);
  });
});

describe("POST /api/marko/:name/beispiele – an address (D-10)", () => {
  it("an image address: fetched once without a cookie, then like an upload", async () => {
    const antwort = await ligi("https://bilder.example/plakat.png");
    expect(antwort.status).toBe(200);
    const { datei } = json(antwort.body) as { datei: BeispielDosiero };
    expect(datei.name).toBe("plakat.png");
    expect(datei.art).toBe("png");
    expect(datei.farben?.[0]?.hex).toBe("#d23c28");
    flagojKorektaj(datei);
    expect(existsSync(join(materialo(), "plakat.png"))).toBe(true);
    expect(abrufe).toHaveLength(1);
    const init = abrufe[0]?.init;
    expect(init?.redirect).toBe("follow");
    expect(init?.credentials).toBe("omit");
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    const kapoj = new Headers(init?.headers);
    expect(kapoj.has("cookie")).toBe(false);
    expect(kapoj.has("authorization")).toBe(false);
  });

  it("an image without image type: known by its bytes, named by them", async () => {
    const antwort = await ligi("https://bilder.example/ohne-typ");
    expect(antwort.status).toBe(200);
    const { datei } = json(antwort.body) as { datei: BeispielDosiero };
    expect(datei.name).toBe("ohne-typ.png");
    expect(datei.farben?.[0]?.hex).toBe("#2f5bff");
  });

  it("an image the Enportilo does not read (GIF): 422 with the sentence, nothing kept", async () => {
    const vorher = dosieroj();
    const antwort = await ligi("https://bilder.example/bild.gif");
    expect(antwort.status).toBe(422);
    expect(json(antwort.body)).toEqual({ satz: NELEGEBLA_DOSIERO_SATZ });
    expect(dosieroj()).toEqual(vorher);
  });

  it("a Pinterest board: a reference with the Pinterest sentence, nothing kept", async () => {
    const vorher = dosieroj();
    for (const adresse of ["https://www.pinterest.de/provo/werkstatt/", "https://pin.it/abc123"]) {
      const antwort = await ligi(adresse);
      expect(antwort.status).toBe(200);
      expect(json(antwort.body)).toEqual({
        verweis: { adresse, satz: PINTEREST_SATZ } satisfies Verweis,
      });
    }
    expect(dosieroj()).toEqual(vorher);
  });

  it("another page, a missing image, an unreachable address: a reference with the other sentence", async () => {
    for (const adresse of [
      "https://seite.example/",
      "https://seite.example/fehlt.png",
      "https://nirgends.example/bild.png",
    ]) {
      const antwort = await ligi(adresse);
      expect(antwort.status).toBe(200);
      expect(json(antwort.body)).toEqual({ verweis: { adresse, satz: KEIN_BILD_SATZ } });
    }
  });

  it("no web address: 422 with the other sentence, nothing fetched", async () => {
    for (const url of ["kein link", "file:///etc/passwd", "javascript:alert(1)", " "]) {
      const antwort = await ligi(url);
      expect(antwort.status).toBe(422);
      expect(json(antwort.body)).toEqual({ satz: KEIN_BILD_SATZ });
    }
    expect(abrufe).toHaveLength(0);
  });
});

describe("DELETE /api/marko/:name/beispiele/:datei", () => {
  it("removes the file; a second time, an unknown file or brand: 404 {satz}", async () => {
    expect((await hochladen("weg.png", png(BLAU, GRAU))).status).toBe(200);
    const antwort = await forigi("weg.png");
    expect(antwort.status).toBe(200);
    expect(existsSync(join(materialo(), "weg.png"))).toBe(false);
    for (const [datei, marko] of [
      ["weg.png", MARKO],
      ["nie.png", MARKO],
      ["plakat.png", "nenia"],
    ] as const) {
      const nein = await forigi(datei, marko);
      expect(nein.status).toBe(404);
      expect(typeof json(nein.body).satz).toBe("string");
    }
  });

  it("refuses path traversal and files that are no Beispiele", async () => {
    const agordo = join(server.workdir, MARKO, "agordo.json");
    expect(existsSync(agordo)).toBe(true);
    writeFileSync(join(materialo(), "notiz.txt"), "bleibt");
    for (const datei of [
      "..%2Fagordo.json",
      "%2E%2E%2F%2E%2E%2Fprovo%2Fagordo.json",
      ".gitignore",
      "notiz.txt",
      "a%20b.png",
    ]) {
      const nein = await forigi(datei);
      expect({ datei, status: nein.status }).toEqual({ datei, status: 404 });
    }
    expect(existsSync(agordo)).toBe(true);
    expect(existsSync(join(materialo(), ".gitignore"))).toBe(true);
    expect(existsSync(join(materialo(), "notiz.txt"))).toBe(true);
  });
});
