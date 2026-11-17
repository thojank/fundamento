// Spec 058 (MP-2c, T9, MAW-4.2, part G, AK-7): the Layout-Beispiel's file routes.
//   POST   /api/marko/:name/layout-beispiel {filename, base64} → 200 {datei: {name, art, farben}} | 422 {satz}
//   DELETE /api/marko/:name/layout-beispiel                    → 200 {}
// Same formats, byte check, per-file limit and colour reading as Beispiele; the file lies in
// `materialo/layout/` (behind the work folder's `.gitignore`), one per brand: a new one replaces the
// old, and the features of the old one go. DELETE removes the file and its features, reason and dot;
// a preview's hand choice stays. The route stores the content itself (`layout-beispiel.inhalt`).
// The file appears in no export. Test images are made here; invented brand only; no model.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type Bildilo, SenBrowser } from "./enportilo/bildilo.js";
import {
  type BeispielDosiero,
  type InhaltLayout,
  LAYOUT_DOSIERUJO,
  type LeinwandStato,
  NELEGEBLA_DOSIERO_SATZ,
  TRO_GRANDA_SATZ,
} from "./grafeo-gestalten-sicht.js";
import { findInBuffer, fingerprintsOf } from "./kontrolo.js";
import { markoDir } from "./marko.js";
import { ANFRAGE_GRENZE } from "./servilo.js";
import { encodePng } from "./test-doubles/png.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

const NOMO = "lumeto";

/** `TestServilo.anfrage` speaks PUT and DELETE too; its type names only GET and POST. */
const anfrage = (
  s: TestServilo,
  method: "PUT" | "DELETE",
  path: string,
  body?: string,
): ReturnType<TestServilo["anfrage"]> =>
  (s.anfrage as (m: string, p: string, b?: string) => ReturnType<TestServilo["anfrage"]>)(
    method,
    path,
    body,
  );

/** A deterministic noise, so the bytes of each image are its own. */
function bruo(semo: number): () => number {
  let x = semo;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) % 256;
  };
}
function bildo(semo: number, supra: number[], malsupra: number[]): Buffer {
  const hazardo = bruo(semo);
  return encodePng(40, 40, (_x, y) =>
    y < 22 ? [...supra, 255] : y < 36 ? [...malsupra, 255] : [hazardo(), hazardo(), hazardo(), 255],
  );
}
const ERSTES = {
  name: "startseite-gross.png",
  bytes: bildo(0x51a7, [210, 85, 44], [247, 242, 232]),
};
const ZWEITES = { name: "plakat-raster.png", bytes: bildo(0x7e11, [47, 91, 255], [28, 29, 34]) };
const PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n2 0 obj<<>>stream\n0.82 0.33 0.17 rg 0 0 10 10 re f\nendstream endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
  "latin1",
);
const GIF = Buffer.from("GIF89a\u0001\u0000\u0001\u0000\u0000\u0000\u0000;", "latin1");
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(60, 7)]);

/** No browser: JPG/WebP are stored without colours, as Beispiele does. */
const bildilo: Bildilo = {
  bildigi: () => Promise.reject(new SenBrowser("kein Browser")),
  malkodi: () => Promise.reject(new SenBrowser("kein Browser")),
};

const json = (body: Buffer): unknown => JSON.parse(body.toString("utf8"));

let server: TestServilo;
const dir = () => join(markoDir(server.workdir, NOMO), "materialo", LAYOUT_DOSIERUJO);
const dosieroj = () =>
  existsSync(dir())
    ? readdirSync(dir())
        .filter((d) => !d.startsWith("."))
        .sort()
    : [];
const stato = (): LeinwandStato =>
  JSON.parse(readFileSync(join(markoDir(server.workdir, NOMO), "leinwand.json"), "utf8"));
const layoutInhalt = (): InhaltLayout | undefined =>
  stato().knoten.find((k) => k.id === "layout-beispiel")?.inhalt as InhaltLayout | undefined;
const hochladen = (filename: string, bytes: Buffer, name = NOMO) =>
  server.anfrage(
    "POST",
    `/api/marko/${name}/layout-beispiel`,
    JSON.stringify({ filename, base64: bytes.toString("base64") }),
  );

beforeAll(async () => {
  server = await testServilo("layout-beispiel-058-", { esploro: { bildilo } });
  await markeAnlegen(server, NOMO, "leer");
});

afterAll(async () => {
  await server?.close();
});

describe("MAW-4.2: POST /api/marko/:name/layout-beispiel", () => {
  it("reads and keeps an image in materialo/layout/, with its colours, and stores it on the node", async () => {
    const antwort = await hochladen(ERSTES.name, ERSTES.bytes);
    expect(antwort.status).toBe(200);
    const { datei } = json(antwort.body) as { datei: BeispielDosiero };
    expect(datei.name).toBe(ERSTES.name);
    expect(datei.art).toBe("png");
    const orange = datei.farben?.find((f) => f.hex === "#d2552c");
    expect(orange).toMatchObject({ bunt: true });
    expect(typeof orange?.hell).toBe("boolean");
    expect(orange?.anteil ?? 0).toBeGreaterThan(40);
    expect(dosieroj()).toEqual([ERSTES.name]);
    expect(readFileSync(join(dir(), ERSTES.name)).equals(ERSTES.bytes)).toBe(true);
    // Behind the work folder's .gitignore, as every Beispiel.
    expect(
      readFileSync(join(markoDir(server.workdir, NOMO), "materialo", ".gitignore"), "utf8"),
    ).toBe("*\n");
    expect(layoutInhalt()).toEqual({ datei });
    // Not one of the Beispiele: the Beispiele folder itself holds no copy.
    expect(existsSync(join(markoDir(server.workdir, NOMO), "materialo", ERSTES.name))).toBe(false);
  });

  it("a new one replaces the old one; the old file and its features go, a preview's hand choice stays", async () => {
    const mitMerkmalen: LeinwandStato = {
      version: 1,
      knoten: [
        {
          id: "layout-beispiel",
          inhalt: {
            ...layoutInhalt(),
            merkmale: { inhalt: "karten", dichte: "luftig" },
            worte: "Ein Raster aus Karten.",
          },
        },
        { id: "vorschau-hell", aufbau: "liste", ansicht: "marke" },
      ],
      kabloj: {},
    };
    expect(
      (
        await anfrage(
          server,
          "PUT",
          `/api/marko/${NOMO}/leinwand-stato`,
          JSON.stringify(mitMerkmalen),
        )
      ).status,
    ).toBe(200);
    expect(layoutInhalt()?.merkmale).toEqual({ inhalt: "karten", dichte: "luftig" });
    const antwort = await hochladen(ZWEITES.name, ZWEITES.bytes);
    expect(antwort.status).toBe(200);
    expect(dosieroj()).toEqual([ZWEITES.name]);
    const inhalt = layoutInhalt();
    expect(inhalt?.datei?.name).toBe(ZWEITES.name);
    expect(inhalt?.merkmale).toBeUndefined();
    expect(inhalt?.worte).toBeUndefined();
    expect(stato().knoten.find((k) => k.id === "vorschau-hell")?.aufbau).toBe("liste");
  });

  it("takes a PDF (colours, no layout reading here) and JPG without a browser with the Enportilo's sentence", async () => {
    const pdf = await hochladen("plakat.pdf", PDF);
    expect(pdf.status).toBe(200);
    expect((json(pdf.body) as { datei: BeispielDosiero }).datei.art).toBe("pdf");
    expect(dosieroj()).toEqual(["plakat.pdf"]);
    const jpg = await hochladen("seite.jpg", JPG);
    expect(jpg.status).toBe(200);
    const { datei } = json(jpg.body) as { datei: BeispielDosiero };
    expect(datei.art).toBe("jpg");
    expect(datei.satz).toMatch(/^Ohne Browser kann ich die Farben von seite\.jpg nicht messen/);
    expect(dosieroj()).toEqual(["seite.jpg"]);
  });

  it("refuses what Beispiele refuses and keeps the file it has", async () => {
    const vorher = dosieroj();
    for (const [filename, bytes] of [
      ["bild.gif", GIF],
      ["falsch.png", JPG],
      ["schrift.woff2", Buffer.concat([Buffer.from("wOF2", "latin1"), Buffer.alloc(20, 1)])],
      ["", ERSTES.bytes],
    ] as const) {
      const antwort = await hochladen(filename, bytes);
      expect(antwort.status, filename).toBe(422);
      expect(json(antwort.body), filename).toEqual({ satz: NELEGEBLA_DOSIERO_SATZ });
    }
    const kaputt = await server.anfrage("POST", `/api/marko/${NOMO}/layout-beispiel`, "{kein json");
    expect(kaputt.status).toBe(422);
    expect(dosieroj()).toEqual(vorher);
  });

  it("a body above the per-file limit answers 422 with the Beispiele sentence", async () => {
    const groesse = ANFRAGE_GRENZE + 1024;
    const antwort = await server.anfrage(
      "POST",
      `/api/marko/${NOMO}/layout-beispiel`,
      `{"filename":"riesig.png","base64":"${"A".repeat(groesse)}"}`,
    );
    expect(antwort.status).toBe(422);
    expect(json(antwort.body)).toEqual({ satz: `${NELEGEBLA_DOSIERO_SATZ}. ${TRO_GRANDA_SATZ}` });
  });

  it("answers 404 for an unknown brand", async () => {
    expect((await hochladen(ERSTES.name, ERSTES.bytes, "gibtsnicht")).status).toBe(404);
    expect((await anfrage(server, "DELETE", "/api/marko/gibtsnicht/layout-beispiel")).status).toBe(
      404,
    );
  });
});

describe("MAW-4.2: DELETE /api/marko/:name/layout-beispiel", () => {
  it("removes the file and its features; the hand choice of a preview stays", async () => {
    expect((await hochladen(ERSTES.name, ERSTES.bytes)).status).toBe(200);
    const mitMerkmalen: LeinwandStato = {
      version: 1,
      knoten: [
        {
          id: "layout-beispiel",
          inhalt: {
            ...layoutInhalt(),
            merkmale: { titelbild: "gross" },
            worte: "Großes Titelbild.",
          },
        },
        { id: "vorschau-hell", aufbau: "raster", ansicht: "marke" },
      ],
      kabloj: {},
    };
    expect(
      (
        await anfrage(
          server,
          "PUT",
          `/api/marko/${NOMO}/leinwand-stato`,
          JSON.stringify(mitMerkmalen),
        )
      ).status,
    ).toBe(200);
    const antwort = await anfrage(server, "DELETE", `/api/marko/${NOMO}/layout-beispiel`);
    expect(antwort.status).toBe(200);
    expect(json(antwort.body)).toEqual({});
    expect(dosieroj()).toEqual([]);
    const inhalt = layoutInhalt();
    expect(inhalt?.datei).toBeUndefined();
    expect(inhalt?.merkmale).toBeUndefined();
    expect(inhalt?.worte).toBeUndefined();
    expect(stato().knoten.find((k) => k.id === "vorschau-hell")?.aufbau).toBe("raster");
    // Again: nothing to remove, the same answer.
    expect((await anfrage(server, "DELETE", `/api/marko/${NOMO}/layout-beispiel`)).status).toBe(
      200,
    );
  });
});

describe("MAW-4.2 (AK-7): the Layout-Beispiel appears in no export", () => {
  /** Every file below `d`, absolute. */
  function dosierojSub(d: string): string[] {
    const out: string[] = [];
    const iri = (nun: string) => {
      for (const ero of readdirSync(nun, { withFileTypes: true })) {
        const pado = join(nun, ero.name);
        if (ero.isDirectory()) iri(pado);
        else out.push(pado);
      }
    };
    if (existsSync(d)) iri(d);
    return out.sort();
  }
  const trovojEn = (dosiero: string): string[] => {
    const bytes = readFileSync(dosiero);
    const latin = bytes.toString("latin1");
    const trovoj: string[] = [];
    const stem = basename(ZWEITES.name, extname(ZWEITES.name));
    for (const nomo of [ZWEITES.name, stem])
      if (latin.includes(nomo)) trovoj.push(`${nomo} (Name)`);
    for (const t of findInBuffer(bytes, [fingerprintsOf(ZWEITES.bytes, ZWEITES.name)]))
      trovoj.push(`${t.source} (Bytes)`);
    return trovoj;
  };

  it("saves and exports a brand with a Layout-Beispiel: no result names it or carries its bytes", async () => {
    expect((await hochladen(ZWEITES.name, ZWEITES.bytes)).status).toBe(200);
    const gespeichert = await server.anfrage(
      "POST",
      `/studio/${NOMO}/speichern`,
      "",
      "application/x-www-form-urlencoded",
    );
    expect(gespeichert.status).toBe(303);
    const marko = markoDir(server.workdir, NOMO);
    const rezultoj = [...dosierojSub(join(marko, "eksporto")), join(marko, "agordo.json")];
    expect(rezultoj.length).toBeGreaterThan(20);
    const funde = Object.fromEntries(
      rezultoj
        .map((d) => [relative(marko, d), trovojEn(d)] as const)
        .filter(([, t]) => t.length > 0),
    );
    expect(funde).toEqual({});
    // Positive control: the same search finds the file where it lies and its name in the state.
    expect(trovojEn(join(dir(), ZWEITES.name)).some((t) => t.endsWith("(Bytes)"))).toBe(true);
    expect(trovojEn(join(marko, "leinwand.json")).some((t) => t.endsWith("(Name)"))).toBe(true);
  });
});
