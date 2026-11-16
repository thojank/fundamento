// Spec 056 T8 (KBS-4.1, AK 10, product spec D): no judgment along the new nodes, checked across
// every endpoint they use. One whole session over HTTP – a brand created for the canvas, the canvas
// data with contents for all nine new nodes, PUT/DELETE of the state, images by upload and by
// address, a board link, removing an image, the font catalog with a kind, the Schrift data, a
// Fontsource font through the product's own route (npm double), an own font from a ZIP, the private
// repo button, Stände – answers only 2xx and never asks the check (a counter on the check's gate and
// one on `checkDraft`). No answer, no sentence constant of the new nodes and no source of the new
// node components carries a rule's name, id, statement or kialo, a problem count or a mark of the
// report. The error answers keep one semantics on every new route: an unknown brand is 404 with the
// same sentence; every new write path and every unreadable file answers 422 in one shape
// `{feld?, satz}` and writes nothing. A control – a rule name written as a competitor's name – proves
// the search can fail.

import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { buildModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { type Bildilo, SenBrowser } from "./enportilo/bildilo.js";
import type {
  BeispielDosiero,
  LeinwandAntwort,
  LeinwandStato,
  LeinwandStatoKnoto,
} from "./grafeo-gestalten-sicht.js";
import * as sicht from "./grafeo-gestalten-sicht.js";
import { ANFRAGE_GRENZE } from "./servilo.js";
import { encodePng } from "./test-doubles/png.js";
import { type Antwort, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { tarballOf } from "./test-doubles/tar.js";
import type { NpmDeps } from "./tiparoj-npm.js";
import { loadBases } from "./vorschau.js";

// A counter on every derivation with checks (`checkDraft`): no route of this file may call it.
const zaehler = vi.hoisted(() => ({ checkDraft: 0 }));
vi.mock("./vorschau.js", (original) =>
  original<typeof import("./vorschau.js")>().then((echt) => ({
    ...echt,
    checkDraft: (...args: Parameters<typeof echt.checkDraft>) => {
      zaehler.checkDraft++;
      return echt.checkDraft(...args);
    },
  })),
);

const FORM = "application/x-www-form-urlencoded";
const STUB = "export {};\n";
const NENIA_SATZ = "Diese Marke gibt es nicht.";
const text = (body: Buffer): string => body.toString("utf8");
const teksto = (wert: unknown): string => JSON.stringify(wert);

/** Every Regulo's name, id, statement and kialo, and the marks of a report (as grafeo-urteil-055). */
function urteilsWoerter(): string[] {
  const modelo = buildModelo(loadBases().structure.files).modelo;
  return [
    ...modelo.reguloj
      .flatMap((r) => [r.name, r.id, r.statement, r.kialo])
      .filter((wort): wort is string => typeof wort === "string" && wort !== ""),
    "nicht exportierbar",
    "nr-ne-eksportebla",
    "mt-pruefung",
    "data-mt-pruefung",
    "mt-probleme",
    "Problem",
    "Prüfung",
    "Betroffen",
    "Vorschlag",
    "probleme",
    "betroffen",
    "raporto",
  ];
}

// ---------------------------------------------------------------------------------------------
// Files, the network and npm (doubles; nothing leaves the machine)

const png = (a: number[], b: number[]): Buffer =>
  encodePng(10, 10, (x) => [...(x < 6 ? a : b), 255]);
const BLAU = png([47, 91, 255], [128, 128, 128]);
const ROT = png([210, 60, 40], [243, 239, 230]);
const SVG = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><rect fill="#2f5bff" width="4" height="4"/></svg>\n',
);
function pdf(): Buffer {
  const stream = deflateSync(Buffer.from("0.184 0.357 1 rg 0 0 10 10 re f\n", "latin1"));
  return Buffer.concat([
    Buffer.from(`%PDF-1.4\n1 0 obj << /Length ${stream.length} /Filter /FlateDecode >>\nstream\n`),
    stream,
    Buffer.from("\nendstream\nendobj\n%%EOF\n"),
  ]);
}
const GIF = Buffer.from("GIF89a\u0001\u0000\u0001\u0000\u0000\u0000\u0000;", "latin1");
const ZIP = readFileSync(
  fileURLToPath(new URL("../test/fixtures/valid/tiparo-056/lato-400-700.zip", import.meta.url)),
);
/** An empty ZIP (only the end record): readable, without a font. */
const LEERES_ZIP = (() => {
  const fino = Buffer.alloc(22);
  fino.writeUInt32LE(0x06054b50, 0);
  return fino;
})();

const ADRESSE_BILD = "https://bilder.example/plakat.png";
const ADRESSE_BOARD = "https://www.pinterest.de/lumeto/werkstatt/";
const ADRESSE_SEITE = "https://seite.example/";
const fetchDouble = (url: string): Promise<Response> => {
  if (url === ADRESSE_BILD)
    return Promise.resolve(
      new Response(new Uint8Array(ROT), { headers: { "content-type": "image/png" } }),
    );
  if (url === ADRESSE_BOARD || url === ADRESSE_SEITE)
    return Promise.resolve(
      new Response("<!doctype html><title>Seite</title>", {
        headers: { "content-type": "text/html" },
      }),
    );
  return Promise.reject(new TypeError("fetch failed"));
};
const bildilo: Bildilo = {
  bildigi: () => Promise.reject(new SenBrowser("kein Browser")),
  malkodi: () => Promise.reject(new SenBrowser("kein Browser")),
};
const idDe = (url: string): string =>
  decodeURIComponent(/@fontsource(?:%2f|\/)([^/]+)/i.exec(url)?.[1] ?? "");
const npmDe = (cacheDir: string): NpmDeps => ({
  fetchJson: async (url) => ({
    version: "5.0.0",
    license: "OFL-1.1",
    dist: { tarball: `https://registry.npmjs.org/@fontsource/${idDe(url)}/-/x-5.0.0.tgz` },
  }),
  fetchBytes: async (url) =>
    tarballOf([
      { path: "package/LICENSE", bytes: Buffer.from("SIL Open Font License 1.1 (test)") },
      {
        path: `package/files/${idDe(url)}-latin-400-normal.woff2`,
        bytes: Buffer.from("woff2-400"),
      },
    ]),
  cacheDir,
  date: "2026-11-16",
});

// ---------------------------------------------------------------------------------------------

/** One answer: what was asked and what came back. */
interface Schritt {
  was: string;
  status: number;
  korpo: string;
}

type Metodo = "GET" | "POST" | "PUT" | "DELETE";

/** The page a reader meets, without the `<style>` and `<script>` blocks of the shared shell. */
const sichtbar = (html: string): string =>
  html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<script[\s\S]*?<\/script>/g, "");

/** The sources of the new node components (product spec A, B, C), without comments. */
const NODOJ = fileURLToPath(new URL("../../nodredaktilo/src/gestalten/nodoj/", import.meta.url));
const NODO_DOSIEROJ = [
  "teksto.tsx",
  "teksto-kampoj.tsx",
  "teksto-listoj.tsx",
  "teksto-tonalitaet.tsx",
  "beispiele.tsx",
  "erkannt.tsx",
  "schrift.tsx",
  "schrift-eigene.tsx",
] as const;
const senKomentoj = (kodo: string): string =>
  kodo.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

/** Every exported string of the shared sicht module from the Spec 056 sentences on, flattened. */
function saetze056(): string[] {
  const out: string[] = [];
  const iri = (wert: unknown): void => {
    if (typeof wert === "string") out.push(wert);
    else if (Array.isArray(wert)) for (const w of wert) iri(w);
    else if (typeof wert === "object" && wert !== null) for (const w of Object.values(wert)) iri(w);
  };
  const namen = new Set<string>([
    "ENHAVO_ETIKEDOJ",
    "TEKSTO_HILFOJ",
    "ZIELGRUPPE_ETIKEDOJ",
    "MARKENKERN_ETIKEDOJ",
    "MARKENKERN_HINWEIS",
    "WERT_HINZUFUEGEN",
    "FUENF_WERTE_SATZ",
    "EIGENSCHAFTEN_HINWEIS",
    "FUENF_EIGENSCHAFTEN_SATZ",
    "TONALITAET_MITTE",
    "TONALITAET_PAROJ",
    "NE_KONEKTITA_MARKO_SATZ",
    "MARKO_ETIKEDOJ",
    "BEISPIELE_HILFE",
    "HOCHLADEN",
    "LINK_FELD",
    "PINTEREST_SATZ",
    "KEIN_BILD_SATZ",
    "DATEI_FEHLT",
    "NELEGEBLA_DOSIERO_SATZ",
    "TRO_GRANDA_SATZ",
    "ERKANNT",
    "ALS_PRIMAER",
    "ALS_AKZENT",
    "PRIMAER_MARKE",
    "FARB_ARTOJ",
    "FOLGO_SAETZE",
    "FOLGEN_LASSEN",
    "SCHRIFT_AA",
    "SCHRIFT_ROLLEN_ETIKEDOJ",
    "SCHRIFT_ARTOJ",
    "SCHRIFT_OFFLINE_SATZ",
    "EIGENE_SCHRIFT",
    "EIGENE_SCHRIFT_SAETZE",
    "ALS_UEBERSCHRIFT",
    "ALS_TEXT",
    "PRIVATES_REPO",
    "AUS_DATEINAME",
    "ZIP_OHNE_SCHRIFT_SATZ",
  ]);
  const gefunden = Object.entries(sicht).filter(([nomo]) => namen.has(nomo));
  if (gefunden.length !== namen.size) throw new Error("a sentence constant is missing");
  for (const [, wert] of gefunden) iri(wert);
  out.push(
    sicht.geloestHinweisDe(1),
    sicht.geloestHinweisDe(3),
    sicht.uebergangenSatzDe(3),
    sicht.schnitteSatzDe(["Bold 700"], ["Regular", "Italic"]),
    sicht.variabelSatzDe(100, 900),
  );
  return out;
}

describe("Spec 056 T8: no judgment along the new nodes, their routes and their sentences", () => {
  let server: TestServilo;
  let stubDir: string;
  let pruefungen: string[];
  let woerter: string[];
  /** Every answer of every test of this file, searched for judgment words at the end. */
  const alle: Schritt[] = [];

  const senden = (method: Metodo, path: string, body?: string, type?: string): Promise<Antwort> =>
    new Promise<Antwort>((done, fail) => {
      const headers: Record<string, string> = { connection: "close" };
      if (body !== undefined) {
        headers["content-type"] = type ?? "application/json";
        headers["content-length"] = String(Buffer.byteLength(body));
      }
      const anfrage = httpRequest(
        { host: "127.0.0.1", port: server.servilo.port, path, method, headers },
        (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk: Buffer) => chunks.push(chunk));
          response.on("end", () =>
            done({
              status: response.statusCode ?? 0,
              contentType: String(response.headers["content-type"] ?? ""),
              body: Buffer.concat(chunks),
            }),
          );
          response.on("error", fail);
        },
      );
      anfrage.on("error", fail);
      anfrage.end(body);
    });
  const frage = async (
    method: Metodo,
    path: string,
    body?: string,
    type?: string,
  ): Promise<Schritt> => {
    const antwort = await senden(method, path, body, type);
    const schritt = { was: `${method} ${path}`, status: antwort.status, korpo: text(antwort.body) };
    alle.push(schritt);
    return schritt;
  };
  const datei = (filename: string, bytes: Buffer): string =>
    teksto({ filename, base64: bytes.toString("base64") });
  const anlegen = async (name: string): Promise<void> => {
    const kreo = await frage("POST", "/marko", `name=${name}&basis=leer&ziel=leinwand`, FORM);
    expect(kreo.status, `POST /marko ${name}`).toBe(303);
  };
  /** What a brand holds on disk besides its draft: images, fonts, canvas state. */
  const bestand = (name: string): string[] =>
    ["materialo", "fontoj"].flatMap((dir) => {
      const pfad = join(server.workdir, name, dir);
      return existsSync(pfad) ? readdirSync(pfad).map((d) => `${dir}/${d}`) : [];
    });

  beforeAll(async () => {
    pruefungen = [];
    woerter = urteilsWoerter();
    stubDir = mkdtempSync(join(tmpdir(), "grafeo-urteil-056-leinwand-"));
    writeFileSync(join(stubDir, "leinwand.js"), STUB);
    server = await testServilo("grafeo-urteil-056-", {
      leinwand: stubDir,
      esploro: { fetch: fetchDouble, bildilo },
      npm: npmDe(join(stubDir, "npm-cache")),
      pruefTor: async (name) => {
        pruefungen.push(name);
      },
    });
    zaehler.checkDraft = 0;
  });

  afterAll(async () => {
    await server?.close();
    rmSync(stubDir, { recursive: true, force: true });
  });

  it("runs a whole session through every new route with only 2xx and never asks the check", async () => {
    const name = "lumeto";
    const sitzung: Schritt[] = [];
    const mit = async (schritt: Promise<Schritt>): Promise<Schritt> => {
      const s = await schritt;
      sitzung.push(s);
      return s;
    };
    const leinwand = async (): Promise<LeinwandAntwort> => {
      const s = await mit(frage("GET", `/api/leinwand?marko=${name}`));
      expect(s.status).toBe(200);
      return JSON.parse(s.korpo) as LeinwandAntwort;
    };
    const vorschauen = async (antwort: LeinwandAntwort): Promise<void> => {
      for (const n of antwort.nodoj) if (n.speco === "vorschau") await mit(frage("GET", n.href));
      await mit(frage("GET", `/marko/${name}/vorschau.css?rev=${antwort.rev}`));
    };
    const post = (pfad: string, korpo: string) => mit(frage("POST", pfad, korpo));

    await mit(frage("GET", "/"));
    await anlegen(name);
    await mit(frage("GET", `/marko/${name}/grafeo`));
    await vorschauen(await leinwand());

    // Images: four files, an image address, a board link and another page.
    const dateien: BeispielDosiero[] = [];
    for (const [filename, bytes] of [
      ["werkbank.png", BLAU],
      ["plakat.png", ROT],
      ["muster.svg", SVG],
      ["leitfaden.pdf", pdf()],
    ] as const) {
      const s = await post(`/api/marko/${name}/beispiele`, datei(filename, bytes));
      dateien.push((JSON.parse(s.korpo) as { datei: BeispielDosiero }).datei);
    }
    for (const url of [ADRESSE_BILD, ADRESSE_BOARD, ADRESSE_SEITE])
      await post(`/api/marko/${name}/beispiele`, teksto({ url }));
    await mit(frage("GET", `/marko/${name}/materialo/werkbank.png`));

    // Fonts: the catalog by kind, a Fontsource font through the own route, an own font from a ZIP.
    await mit(frage("GET", `/api/marko/${name}/tiparoj?q=frau&art=serif`));
    await mit(frage("GET", `/api/marko/${name}/tiparoj?q=zzqxv&art=`));
    await mit(frage("GET", `/api/marko/${name}/schriften`));
    const { treffer } = JSON.parse(
      (await mit(frage("GET", `/api/marko/${name}/tiparoj?q=Inter&art=sans-serif`))).korpo,
    ) as { treffer: { id: string }[] };
    const tiparo = treffer[0]?.id ?? "";
    await mit(frage("GET", `/api/tiparo/${tiparo}/css`));
    await mit(frage("GET", `/api/tiparo/${tiparo}/${tiparo}-latin-400-normal.woff2`));
    const zip = await post(`/api/marko/${name}/schriftdateien`, datei("Lato.zip", ZIP));
    const { familien } = JSON.parse(zip.korpo) as {
      familien: { familie: string; dateien: { name: string }[] }[];
    };
    await mit(frage("GET", `/marko/${name}/fontoj/${familien[0]?.dateien[0]?.name ?? ""}`));
    await post(`/api/marko/${name}/schrift-privat`, teksto({ familie: "Lato" }));

    // Writes of the canvas: colours from the images, fonts, sliders.
    for (const korpo of [
      { farbe: { rolle: "primaer", wert: "#2f5bff" } },
      { farbe: { rolle: "akzent", wert: "#d23c28", herkunft: { quelle: "bild", anteil: 40 } } },
      { schrift: { rolle: "body", tiparo } },
      { schrift: { rolle: "display", eigene: "Lato" } },
      { regler: { pfad: "schrift.skala", wert: 1.25 } },
    ])
      expect((await post(`/api/marko/${name}/leinwand`, teksto(korpo))).status, teksto(korpo)).toBe(
        200,
      );

    // The canvas state with a content in every new node, two detached edges into the Marke.
    const knoten: LeinwandStatoKnoto[] = [
      { id: "teksto-ausgangslage", inhalt: { text: "Leuchten für Werkstätten." } },
      { id: "teksto-markenkern", inhalt: { zweck: "Gutes Licht.", versprechen: "Hält lange." } },
      {
        id: "teksto-werte",
        inhalt: {
          werte: [
            { id: "w1", text: "nahbar" },
            { id: "w2", text: "mutig" },
            { id: "w3", text: "gründlich" },
          ],
        },
      },
      { id: "teksto-zielgruppe", speco: "teksto", inhalt: { wer: "Tischler", sorge: "Schatten" } },
      {
        id: "teksto-wettbewerb",
        speco: "teksto",
        inhalt: { liste: [{ name: "Lampenhaus", adresse: "lampenhaus.example" }] },
      },
      { id: "teksto-persoenlichkeit", speco: "teksto", inhalt: { eigenschaften: ["ruhig"] } },
      { id: "teksto-tonalitaet", speco: "teksto", inhalt: { "warm-kuehl": 1 } },
      {
        id: "beispiele",
        speco: "beispiele",
        inhalt: {
          dateien,
          verweise: [{ adresse: ADRESSE_BOARD, satz: sicht.PINTEREST_SATZ }],
          primaer: { folgt: false, zuletzt: "#2f5bff" },
        },
      },
      {
        id: "schrift",
        speco: "schrift",
        inhalt: {
          eigene: familien.map((f) => ({
            familie: f.familie,
            dateien: f.dateien,
          })),
        },
      },
    ];
    const stato: LeinwandStato = {
      version: 1,
      knoten,
      kabloj: {},
      geloest: ["teksto-werte.el.w2", sicht.BEISPIELE_ELIR],
    };
    expect(
      (await mit(frage("PUT", `/api/marko/${name}/leinwand-stato`, teksto(stato)))).status,
    ).toBe(200);
    const mitInhalt = await leinwand();
    expect(mitInhalt.stato?.knoten.length).toBe(knoten.length);
    await vorschauen(mitInhalt);

    // Stände: save, remove an image, open the Stand (a file missing now), reset the layout.
    const stand = await mit(frage("POST", `/api/marko/${name}/staende`, teksto({ name: "Licht" })));
    expect(stand.status).toBe(201);
    const { id } = JSON.parse(stand.korpo) as { id: string };
    await mit(frage("DELETE", `/api/marko/${name}/beispiele/plakat.png`));
    await mit(frage("GET", `/api/marko/${name}/staende`));
    await mit(frage("POST", `/api/marko/${name}/staende/${id}/oeffnen`));
    await vorschauen(await leinwand());
    expect((await mit(frage("DELETE", `/api/marko/${name}/leinwand-stato`))).status).toBe(200);
    await vorschauen(await leinwand());
    await mit(frage("GET", "/"));

    expect(sitzung.length).toBeGreaterThan(40);
    expect(
      sitzung.filter((s) => s.status < 200 || s.status > 299).map((s) => `${s.status} ${s.was}`),
    ).toEqual([]);
    expect({ pruefungen, checkDraft: zaehler.checkDraft }).toEqual({
      pruefungen: [],
      checkDraft: 0,
    });
  });

  it("answers an unknown brand with the same 404 {satz} on every new route", async () => {
    const pfade: [method: Metodo, path: string, body?: string][] = [
      ["POST", "/api/marko/nenia/beispiele", datei("werkbank.png", BLAU)],
      ["POST", "/api/marko/nenia/beispiele", teksto({ url: ADRESSE_BILD })],
      ["POST", "/api/marko/nenia/beispiele", "kein json"],
      ["DELETE", "/api/marko/nenia/beispiele/werkbank.png"],
      ["GET", "/api/marko/nenia/tiparoj?q=frau&art=serif"],
      ["GET", "/api/marko/nenia/tiparoj?art=unbekannt"],
      ["GET", "/api/marko/nenia/schriften"],
      ["POST", "/api/marko/nenia/schriftdateien", datei("Lato.zip", ZIP)],
      ["POST", "/api/marko/nenia/schriftdateien", "kein json"],
      ["POST", "/api/marko/nenia/schrift-privat", teksto({ familie: "Lato" })],
      ["POST", "/api/marko/nenia/schrift-privat", "kein json"],
      ["PUT", "/api/marko/nenia/leinwand-stato", teksto({ version: 1, knoten: [], kabloj: {} })],
      ["DELETE", "/api/marko/nenia/leinwand-stato"],
    ];
    const falsch: string[] = [];
    for (const [method, path, body] of pfade) {
      const { status, korpo } = await frage(method, path, body);
      if (status !== 404 || korpo !== teksto({ satz: NENIA_SATZ }))
        falsch.push(`${status} ${method} ${path}: ${korpo}`);
    }
    expect(falsch).toEqual([]);
    // The files of an unknown brand: the plain 404 page, as for any file that is not there.
    const dateienAlt: string[] = [];
    for (const path of [
      "/marko/nenia/fontoj/lato-latin-400-normal.woff2",
      "/marko/nenia/materialo/a.png",
    ]) {
      const { status } = await frage("GET", path);
      if (status !== 404) dateienAlt.push(`${status} ${path}`);
    }
    expect(dateienAlt).toEqual([]);
  });

  it("answers 422 in one shape {feld?, satz} on every new write path and unreadable file, and writes nothing", async () => {
    const name = "provo";
    await anlegen(name);
    const vorher = JSON.parse((await frage("GET", `/api/leinwand?marko=${name}`)).korpo) as {
      rev: number;
    };
    const zuGross = "x".repeat(ANFRAGE_GRENZE + 1);
    const faelle: [method: Metodo, path: string, body?: string][] = [
      // Beispiele: another format, a broken file, extension and bytes apart, a font, no address.
      ["POST", `/api/marko/${name}/beispiele`, datei("gruss.gif", GIF)],
      ["POST", `/api/marko/${name}/beispiele`, datei("kaputt.png", Buffer.from("kein Bild"))],
      ["POST", `/api/marko/${name}/beispiele`, datei("blau.jpg", BLAU)],
      ["POST", `/api/marko/${name}/beispiele`, datei("schrift.woff2", Buffer.from("wOF2xxxx"))],
      ["POST", `/api/marko/${name}/beispiele`, teksto({ url: "kein Link" })],
      ["POST", `/api/marko/${name}/beispiele`, "kein json"],
      ["POST", `/api/marko/${name}/beispiele`, zuGross],
      // Own fonts: no font, a broken ZIP, a ZIP without a font, another kind, malformed, too large.
      ["POST", `/api/marko/${name}/schriftdateien`, datei("notiz.woff2", Buffer.from("kein Font"))],
      ["POST", `/api/marko/${name}/schriftdateien`, datei("kaputt.zip", ZIP.subarray(0, 200))],
      ["POST", `/api/marko/${name}/schriftdateien`, datei("leer.zip", LEERES_ZIP)],
      ["POST", `/api/marko/${name}/schriftdateien`, datei("bild.png", BLAU)],
      ["POST", `/api/marko/${name}/schriftdateien`, "kein json"],
      ["POST", `/api/marko/${name}/schriftdateien`, zuGross],
      ["POST", `/api/marko/${name}/schrift-privat`, "kein json"],
      // The catalog with an unknown kind.
      ["GET", `/api/marko/${name}/tiparoj?art=unbekannt`],
      // The canvas write path with its new cases.
      [
        "POST",
        `/api/marko/${name}/leinwand`,
        teksto({ schrift: { rolle: "display", tiparo: "nenia-schrift" } }),
      ],
      [
        "POST",
        `/api/marko/${name}/leinwand`,
        teksto({ regler: { pfad: "schrift.skala", wert: 9 } }),
      ],
      // The canvas state with the new shape, unreadable.
      [
        "PUT",
        `/api/marko/${name}/leinwand-stato`,
        teksto({ version: 1, knoten: "nein", kabloj: {} }),
      ],
    ];
    const formen: string[] = [];
    for (const [method, path, body] of faelle) {
      const { status, korpo } = await frage(method, path, body);
      let wert: Record<string, unknown> = {};
      try {
        wert = JSON.parse(korpo) as Record<string, unknown>;
      } catch {
        // not JSON: the shape check below names it
      }
      const schluessel = Object.keys(wert).sort();
      const passt =
        status === 422 &&
        typeof wert.satz === "string" &&
        wert.satz !== "" &&
        (schluessel.join() === "satz" ||
          (schluessel.join() === "feld,satz" && typeof wert.feld === "string"));
      if (!passt) formen.push(`${status} ${method} ${path.slice(0, 60)}: ${korpo.slice(0, 120)}`);
    }
    expect(formen).toEqual([]);
    // A malformed change of a new case (a role or slider that does not exist, an origin on Primär)
    // takes the existing path of a malformed change: the same 400 shape as an older malformed body.
    const formDe = (korpo: string): string => {
      const wert = JSON.parse(korpo) as { issues?: Record<string, unknown>[] };
      return teksto((wert.issues ?? []).map((i) => [Object.keys(i).sort(), i.rule]));
    };
    const alt = await frage(
      "POST",
      `/api/marko/${name}/leinwand`,
      teksto({ farbe: { rolle: "glanz", wert: "#2f5bff" } }),
    );
    const misformoj: string[] = [];
    for (const korpo of [
      { schrift: { rolle: "titel", tiparo: "inter" } },
      { schrift: { rolle: "display" } },
      { regler: { pfad: "farbe.ton", wert: 1 } },
      { farbe: { rolle: "primaer", wert: "#2f5bff", herkunft: { quelle: "bild" } } },
      { farbe: { rolle: "akzent", wert: "#2f5bff", herkunft: { quelle: "link" } } },
    ]) {
      const s = await frage("POST", `/api/marko/${name}/leinwand`, teksto(korpo));
      if (s.status !== alt.status || formDe(s.korpo) !== formDe(alt.korpo))
        misformoj.push(`${s.status} ${teksto(korpo)}: ${s.korpo.slice(0, 120)}`);
    }
    expect({ alt: alt.status, misformoj }).toEqual({ alt: 400, misformoj: [] });
    // Every unreadable file says the calm sentence of product spec D.
    const dateiSaetze = alle
      .filter((s) => s.status === 422 && /beispiele|schriftdateien/.test(s.was))
      .map((s) => (JSON.parse(s.korpo) as { satz: string }).satz)
      .filter(
        (satz) =>
          !satz.startsWith(sicht.NELEGEBLA_DOSIERO_SATZ) &&
          satz !== sicht.ZIP_OHNE_SCHRIFT_SATZ &&
          satz !== sicht.KEIN_BILD_SATZ,
      );
    expect(dateiSaetze).toEqual([]);
    const nachher = JSON.parse((await frage("GET", `/api/leinwand?marko=${name}`)).korpo) as {
      rev: number;
      stato: unknown;
    };
    expect({ rev: nachher.rev, stato: nachher.stato, dateien: bestand(name) }).toEqual({
      rev: vorher.rev,
      stato: null,
      dateien: [],
    });
    expect({ pruefungen, checkDraft: zaehler.checkDraft }).toEqual({
      pruefungen: [],
      checkDraft: 0,
    });
  });

  it("carries no rule name, problem count or report mark in any answer, sentence or node source", () => {
    const routen = new Set(
      alle.map((s) =>
        (s.was.split("?")[0] ?? "")
          .replace(/\/(lumeto|provo|nenia)\b/, "/:name")
          .replace(/\/staende\/[^/]+\/oeffnen$/, "/staende/:id/oeffnen")
          .replace(/\/(beispiele|materialo|fontoj)\/[^/]+$/, "/$1/:datei")
          .replace(/^(GET \/api\/tiparo\/)[^/]+\/(css|[^/]+)$/, (_m, a: string, b: string) =>
            b === "css" ? `${a}:id/css` : `${a}:id/:datei`,
          ),
      ),
    );
    // Every new route of plan §2 is in the search.
    expect(
      [
        "POST /api/marko/:name/beispiele",
        "DELETE /api/marko/:name/beispiele/:datei",
        "GET /marko/:name/materialo/:datei",
        "GET /api/marko/:name/tiparoj",
        "GET /api/marko/:name/schriften",
        "GET /api/tiparo/:id/css",
        "GET /api/tiparo/:id/:datei",
        "POST /api/marko/:name/schriftdateien",
        "GET /marko/:name/fontoj/:datei",
        "POST /api/marko/:name/schrift-privat",
        "PUT /api/marko/:name/leinwand-stato",
        "DELETE /api/marko/:name/leinwand-stato",
        "GET /api/leinwand",
        "POST /api/marko/:name/leinwand",
      ].filter((r) => !routen.has(r)),
    ).toEqual([]);
    const status = new Set(alle.map((s) => s.status));
    expect([200, 201, 303, 404, 422].filter((code) => !status.has(code))).toEqual([]);

    const quellen: Schritt[] = [
      ...saetze056().map((satz, i) => ({ was: `Satz ${i}`, status: 0, korpo: satz })),
      ...NODO_DOSIEROJ.map((d) => ({
        was: `nodoj/${d}`,
        status: 0,
        korpo: senKomentoj(readFileSync(join(NODOJ, d), "utf8")),
      })),
    ];
    expect(quellen.length).toBeGreaterThan(NODO_DOSIEROJ.length + 60);
    const befunde: string[] = [];
    for (const schritt of [...alle, ...quellen]) {
      const korpo = schritt.was === "GET /" ? sichtbar(schritt.korpo) : schritt.korpo;
      for (const wort of woerter)
        if (korpo.includes(wort)) befunde.push(`${schritt.was} (${schritt.status}): ${wort}`);
    }
    expect(befunde).toEqual([]);
  });

  it("control: a rule name written as a competitor's name is found by the same search", async () => {
    const regel = woerter[0] ?? "";
    expect(regel).not.toBe("");
    const name = "komuna";
    await anlegen(name);
    alle.pop();
    const stato: LeinwandStato = {
      version: 1,
      knoten: [{ id: "teksto-wettbewerb", speco: "teksto", inhalt: { liste: [{ name: regel }] } }],
      kabloj: {},
    };
    const put = await senden("PUT", `/api/marko/${name}/leinwand-stato`, teksto(stato));
    expect(put.status).toBe(200);
    const antwort = text((await senden("GET", `/api/leinwand?marko=${name}`)).body);
    expect(woerter.filter((wort) => antwort.includes(wort))).toContain(regel);
  });
});
