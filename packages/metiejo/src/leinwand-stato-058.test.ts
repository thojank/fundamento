// Spec 058 (MP-2c, T1, MAW-1.1, AK-17): the new data in `leinwand.json` – Grundlagen, „Namen und
// Beschreibung“ with its own detached edges, the Layout-Beispiel, the Markenprofil on the Marke and
// view and layout of every preview (fixed and added) – survive writing, reading and a Stand; a field
// of the wrong type drops out on its own; „zurücksetzen“ keeps contents and choices. Over HTTP:
// `GET /api/leinwand?stufe=58` answers the state and the previews' choices with their 058 address,
// and writes nothing (draft, rev and Kroniko unchanged). Invented brand „lumeto“ only.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MATERIALO_DIR } from "./enportilo/materialo.js";
import {
  GRUNDLAGEN_ELIR,
  KI_NAMEN_ID,
  LAYOUT_DOSIERUJO,
  type LeinwandStato,
  type Profil,
} from "./grafeo-gestalten-sicht.js";
import { abdruckDe, markeInhaltDe } from "./leinwand-auswertung.js";
import { LEINWAND_DOSIERO } from "./leinwand-dosieroj.js";
import {
  leinwandStatoRekomenco,
  parseLeinwandStato,
  serializeLeinwandStato,
} from "./leinwand-stato.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

const KOSTO = {
  enigo: 1200,
  eligo: 600,
  usd: 0.002,
  modelo: "mistral/klein",
  zeit: "2026-11-17T09:05:00.000Z",
};

const PROFIL: Profil = {
  kernsatz: "Licht, das bei jeder Arbeit bleibt.",
  leitgedanken: [{ titel: "Ehrlich", text: "Wir sagen, was eine Leuchte kann." }],
  charakter: ["klar", "warm", "handfest"],
  passt: ["ruhig"],
  reibt: [],
  vorschlag: {
    primaer: { hex: "#c6f135", grund: "frisch" },
    schrift: { display: "fraunces", body: "inter", grund: "lesbar" },
  },
  verworfen: ["neutral"],
  abdruck: "a1b2c3d4e5f60718",
  eingaben: { primaer: "#2f5bff", display: "inter" },
  gesichert: "2026-11-17T09-05-00-000",
  kosto: KOSTO,
};

/** A state of Spec 058 with every new field (canonical order of `serializeLeinwandStato`). */
const STATO_058: LeinwandStato = {
  version: 1,
  knoten: [
    { id: "marko", inhalt: { profil: PROFIL } },
    { id: "vorschau-hell", ansicht: "komponenten", aufbau: "raster" },
    { id: "vorschau-dunkel", x: 1700, y: 900, aufbau: "liste" },
    { id: "teksto-grundlagen", inhalt: { beschreibung: "lumeto baut Leuchten für Werkstätten." } },
    { id: "teksto-ausgangslage", inhalt: { text: "Werkstätten sind zu dunkel." } },
    {
      id: KI_NAMEN_ID,
      speco: "ki",
      x: 30,
      y: -600,
      inhalt: {
        vorschlag: {
          namen: [{ name: "Lichtwerk", grund: "aus dem Kern" }],
          beschreibung: "lumeto macht Werkstätten hell.",
          abdruck: "0011223344556677",
          gesichert: "2026-11-17T09-06-00-000",
          kosto: KOSTO,
        },
      },
      geloest: ["teksto-ausgangslage.el"],
    },
    {
      id: "layout-beispiel",
      inhalt: {
        datei: {
          name: "plakat.png",
          art: "png",
          farben: [{ hex: "#111111", anteil: 70, hell: false, bunt: false, leit: false }],
        },
        merkmale: {
          titelbild: "gross",
          inhalt: "karten",
          dichte: "luftig",
          achse: "mittig",
          schrift: "gross",
        },
        worte: "Großes Bild, drei Karten.",
        abdruck: "8899aabbccddeeff",
        kosto: KOSTO,
      },
    },
    {
      id: "beispiele",
      speco: "beispiele",
      inhalt: {
        dateien: [
          { name: "pin-1.jpg", art: "jpg", quelle: "https://i.pinimg.com/736x/aa/pin-1.jpg" },
        ],
        verweise: [{ adresse: "https://pin.it/2lumeto", titel: "Werkstatt-Licht" }],
      },
    },
    { id: "vorschau-3", speco: "vorschau", schema: "dunkel", ansicht: "marke", aufbau: "titel" },
    {
      id: "vorschau-4",
      speco: "vorschau",
      schema: "hell",
      x: 1646,
      y: 2424,
      ansicht: "komponenten",
    },
  ],
  kabloj: {},
  geloest: [GRUNDLAGEN_ELIR],
};

const lego = (wert: unknown): LeinwandStato => {
  const l = parseLeinwandStato(JSON.stringify(wert));
  if (!("stato" in l)) throw new Error("does not read");
  return l.stato;
};

const knotoDe = (stato: LeinwandStato, id: string) => stato.knoten.find((k) => k.id === id);

describe("MAW-1.1: the new data read, write and read again (AK-17, pure)", () => {
  it("keeps every new field through write → read", () => {
    const stato = lego(STATO_058);
    expect(stato).toEqual(STATO_058);
    expect(lego(JSON.parse(serializeLeinwandStato(stato)))).toEqual(STATO_058);
  });

  it("lets a fixed node carry content or choices without a place", () => {
    const stato = lego(STATO_058);
    expect(knotoDe(stato, "marko")).toEqual({ id: "marko", inhalt: { profil: PROFIL } });
    expect(knotoDe(stato, "vorschau-hell")).toEqual({
      id: "vorschau-hell",
      ansicht: "komponenten",
      aufbau: "raster",
    });
    // Without anything of its own a fixed node still needs a place, as before.
    expect(
      lego({
        version: 1,
        knoten: [{ id: "marko" }, { id: "vorschau-hell", ansicht: "gross" }],
        kabloj: {},
      }).knoten,
    ).toEqual([]);
  });

  it("drops a field of the wrong type on its own, never the node or the file", () => {
    const stato = lego({
      version: 1,
      knoten: [
        { id: "vorschau-hell", x: 1, y: 2, ansicht: "gross", aufbau: "titel" },
        {
          id: "vorschau-dunkel",
          x: 1,
          y: 2,
          ansicht: "marke",
          aufbau: "auto",
          inhalt: { profil: PROFIL },
        },
        { id: "vorschau-3", speco: "vorschau", schema: "hell", aufbau: 3 },
        {
          id: "marko",
          x: 5,
          y: 6,
          inhalt: { profil: { ...PROFIL, leitgedanken: "eins", kosto: KOSTO } },
        },
        { id: "teksto-grundlagen", inhalt: { beschreibung: 7 } },
        {
          id: "layout-beispiel",
          inhalt: {
            merkmale: { titelbild: "riesig", inhalt: "liste" },
            worte: 3,
            kosto: { enigo: "x" },
          },
        },
        {
          id: KI_NAMEN_ID,
          speco: "ki",
          inhalt: { vorschlag: { namen: [], abdruck: "x" } },
          geloest: ["teksto-unbekannt.el", "beispiele.el", GRUNDLAGEN_ELIR],
        },
      ],
      kabloj: {},
    });
    const { leitgedanken: _l, ...ohneLeitgedanken } = PROFIL;
    expect(stato.knoten).toEqual([
      { id: "vorschau-hell", x: 1, y: 2, aufbau: "titel" },
      { id: "vorschau-dunkel", x: 1, y: 2, ansicht: "marke", aufbau: "auto" },
      { id: "vorschau-3", speco: "vorschau", schema: "hell" },
      { id: "marko", x: 5, y: 6, inhalt: { profil: ohneLeitgedanken } },
      { id: "teksto-grundlagen", inhalt: {} },
      { id: "layout-beispiel", inhalt: { merkmale: { inhalt: "liste" } } },
      { id: KI_NAMEN_ID, speco: "ki", inhalt: {}, geloest: [GRUNDLAGEN_ELIR] },
    ]);
    // A profile without its abdruck or cost is none; a „Namen“ node without `speco` is dropped.
    expect(
      lego({
        version: 1,
        knoten: [
          { id: "marko", x: 1, y: 1, inhalt: { profil: { ...PROFIL, kosto: undefined } } },
          { id: KI_NAMEN_ID, inhalt: {} },
        ],
        kabloj: {},
      }).knoten,
    ).toEqual([{ id: "marko", x: 1, y: 1 }]);
  });

  it("never keeps `fehlt` of a Layout-Beispiel file", () => {
    const stato = lego({
      version: 1,
      knoten: [
        {
          id: "layout-beispiel",
          inhalt: { datei: { name: "plakat.png", art: "png", fehlt: true } },
        },
      ],
      kabloj: {},
    });
    expect(stato.knoten).toEqual([
      { id: "layout-beispiel", inhalt: { datei: { name: "plakat.png", art: "png" } } },
    ]);
  });

  it("„Anordnung zurücksetzen“ keeps contents and preview choices, drops places and connections", () => {
    // A view alone keeps a fixed preview, as a layout choice alone does.
    expect(
      leinwandStatoRekomenco(
        lego({
          version: 1,
          knoten: [
            { id: "vorschau-hell", x: 1, y: 2, ansicht: "komponenten" },
            { id: "vorschau-dunkel", x: 3, y: 4 },
          ],
          kabloj: {},
        }),
      ).knoten,
    ).toEqual([{ id: "vorschau-hell", ansicht: "komponenten" }]);
    expect(leinwandStatoRekomenco(lego(STATO_058))).toEqual({
      version: 1,
      knoten: [
        { id: "marko", inhalt: { profil: PROFIL } },
        { id: "vorschau-hell", ansicht: "komponenten", aufbau: "raster" },
        { id: "vorschau-dunkel", aufbau: "liste" },
        {
          id: "teksto-grundlagen",
          inhalt: { beschreibung: "lumeto baut Leuchten für Werkstätten." },
        },
        { id: "teksto-ausgangslage", inhalt: { text: "Werkstätten sind zu dunkel." } },
        { id: KI_NAMEN_ID, speco: "ki", inhalt: (STATO_058.knoten[5] ?? { inhalt: {} }).inhalt },
        { id: "layout-beispiel", inhalt: (STATO_058.knoten[6] ?? { inhalt: {} }).inhalt },
        {
          id: "beispiele",
          speco: "beispiele",
          inhalt: (STATO_058.knoten[7] ?? { inhalt: {} }).inhalt,
        },
        {
          id: "vorschau-3",
          speco: "vorschau",
          schema: "dunkel",
          ansicht: "marke",
          aufbau: "titel",
        },
        { id: "vorschau-4", speco: "vorschau", schema: "hell", ansicht: "komponenten" },
      ],
      kabloj: {},
    });
  });
});

describe("MAW-1.1: GET /api/leinwand?stufe=58 and the Stände (AK-17 over HTTP)", () => {
  let server: TestServilo;
  const MARKO = "lumeto";

  const senden = (method: "PUT" | "POST", pfad: string, korpo: string) =>
    new Promise<{ status: number; body: string }>((done, fail) => {
      const peto = request(
        {
          host: "127.0.0.1",
          port: server.servilo.port,
          path: pfad,
          method,
          headers: {
            connection: "close",
            "content-type": "application/json",
            "content-length": String(Buffer.byteLength(korpo)),
          },
        },
        (respondo) => {
          const chunks: Buffer[] = [];
          respondo.on("data", (c: Buffer) => chunks.push(c));
          respondo.on("end", () =>
            done({
              status: respondo.statusCode ?? 0,
              body: Buffer.concat(chunks).toString("utf8"),
            }),
          );
          respondo.on("error", fail);
        },
      );
      peto.on("error", fail);
      peto.end(korpo);
    });
  const leinwand = async (stufe = true) => {
    const a = await server.anfrage(
      "GET",
      `/api/leinwand?marko=${MARKO}${stufe ? "&stufe=58" : ""}`,
    );
    expect(a.status).toBe(200);
    return JSON.parse(a.body.toString("utf8")) as {
      rev: number;
      nodoj: { id: string; href?: string; ansicht?: string; aufbau?: string }[];
      stato: Omit<LeinwandStato, "version"> | null;
    };
  };
  const dosiero = (nomo: string): string | undefined => {
    const pfad = join(server.workdir, MARKO, nomo);
    return existsSync(pfad) ? readFileSync(pfad, "utf8") : undefined;
  };

  beforeAll(async () => {
    server = await testServilo("leinwand-stato-058-");
    await markeAnlegen(server, MARKO, "leer");
  });

  afterAll(async () => {
    await server?.close();
  });

  it("answers the new data and the previews' choices with their 058 address", async () => {
    const put = await senden(
      "PUT",
      `/api/marko/${MARKO}/leinwand-stato`,
      JSON.stringify(STATO_058),
    );
    expect(put.status).toBe(200);
    const antwort = await leinwand();
    const { version: _v, ...ohneVersion } = STATO_058;
    const layout = (STATO_058.knoten[6]?.inhalt ?? {}) as { datei: Record<string, unknown> };
    const beispiele = (STATO_058.knoten[7]?.inhalt ?? {}) as { dateien: Record<string, unknown>[] };
    // The files are not in `materialo/` and `materialo/layout/`: the answer marks them (only there).
    expect(antwort.stato).toEqual({
      ...ohneVersion,
      knoten: ohneVersion.knoten.map((k) =>
        k.id === "layout-beispiel"
          ? { ...k, inhalt: { ...k.inhalt, datei: { ...layout.datei, fehlt: true } } }
          : k.id === "beispiele"
            ? {
                ...k,
                inhalt: {
                  ...k.inhalt,
                  dateien: beispiele.dateien.map((d) => ({ ...d, fehlt: true })),
                },
              }
            : k,
      ),
    });
    expect(dosiero(LEINWAND_DOSIERO)).not.toContain("fehlt");
    const inh = abdruckDe(markeInhaltDe(STATO_058, MARKO));
    const vorschauen = antwort.nodoj.filter((n) => n.id.startsWith("vorschau-"));
    expect(vorschauen).toEqual([
      expect.objectContaining({
        id: "vorschau-hell",
        ansicht: "komponenten",
        aufbau: "raster",
        href: `/marko/${MARKO}/vorschau?sxtupo=komponenten&breite=mittel&scheme=light&rev=${antwort.rev}`,
      }),
      expect.objectContaining({
        id: "vorschau-dunkel",
        ansicht: "marke",
        aufbau: "liste",
        href: `/marko/${MARKO}/vorschau?sxtupo=marke&breite=mittel&scheme=dark&rev=${antwort.rev}&aufbau=liste&inh=${inh}`,
      }),
    ]);
    // With the files in place nothing is marked.
    mkdirSync(join(server.workdir, MARKO, MATERIALO_DIR, LAYOUT_DOSIERUJO), { recursive: true });
    writeFileSync(join(server.workdir, MARKO, MATERIALO_DIR, LAYOUT_DOSIERUJO, "plakat.png"), "x");
    writeFileSync(join(server.workdir, MARKO, MATERIALO_DIR, "pin-1.jpg"), "x");
    expect(JSON.stringify((await leinwand()).stato)).not.toContain("fehlt");
  });

  it("follows the Layout-Beispiel for „auto“ and answers as before without `stufe`", async () => {
    const stato = {
      ...STATO_058,
      knoten: STATO_058.knoten.filter(
        (k) => k.id !== "vorschau-hell" && k.id !== "vorschau-dunkel",
      ),
    };
    expect(
      (await senden("PUT", `/api/marko/${MARKO}/leinwand-stato`, JSON.stringify(stato))).status,
    ).toBe(200);
    const mit = await leinwand();
    expect(
      mit.nodoj
        .filter((n) => n.id.startsWith("vorschau-"))
        .map((n) => [n.ansicht, n.aufbau, n.href?.match(/aufbau=[a-z]+/)?.[0]]),
    ).toEqual([
      ["marke", "auto", "aufbau=raster"],
      ["marke", "auto", "aufbau=raster"],
    ]);
    const ohne = await leinwand(false);
    for (const n of ohne.nodoj.filter((v) => v.id.startsWith("vorschau-"))) {
      expect(n.ansicht).toBeUndefined();
      expect(n.aufbau).toBeUndefined();
      expect(n.href).toContain("?sxtupo=vorschau&");
    }
  });

  it("writes nothing on GET with stufe=58: draft, rev and Kroniko stay", async () => {
    const vorher = {
      entwurf: dosiero("entwurf.json"),
      agordo: dosiero("agordo.json"),
      kroniko: dosiero("kroniko.jsonl"),
      leinwand: dosiero(LEINWAND_DOSIERO),
      rev: (await leinwand(false)).rev,
    };
    await leinwand();
    await leinwand();
    expect({
      entwurf: dosiero("entwurf.json"),
      agordo: dosiero("agordo.json"),
      kroniko: dosiero("kroniko.jsonl"),
      leinwand: dosiero(LEINWAND_DOSIERO),
      rev: (await leinwand()).rev,
    }).toEqual(vorher);
  });

  it("takes the new data into a Stand and back (AK-17)", async () => {
    expect(
      (await senden("PUT", `/api/marko/${MARKO}/leinwand-stato`, JSON.stringify(STATO_058))).status,
    ).toBe(200);
    const gesichert = (await leinwand()).stato;
    const stand = await senden(
      "POST",
      `/api/marko/${MARKO}/staende`,
      JSON.stringify({ name: "mit Profil" }),
    );
    expect(stand.status).toBe(201);
    const { id } = JSON.parse(stand.body) as { id: string };
    expect(
      (
        await senden(
          "PUT",
          `/api/marko/${MARKO}/leinwand-stato`,
          JSON.stringify({ version: 1, knoten: [], kabloj: {} }),
        )
      ).status,
    ).toBe(200);
    expect((await leinwand()).stato).toEqual({ knoten: [], kabloj: {} });
    expect((await senden("POST", `/api/marko/${MARKO}/staende/${id}/oeffnen`, "")).status).toBe(
      200,
    );
    expect((await leinwand()).stato).toEqual(gesichert);
  });
});
