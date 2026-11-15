// Spec 055 T5 (LNS-3.1, Abnahme 6): the named Stände of a brand, `marken/<name>/staende/<id>.json`.
// Pure: the id from the UTC time and the slug of the name (same second → `-2`, `-3`), the name
// proposal „TT.MM.JJJJ, HH:MM“ (local time of the server), the canonical content a backup compares,
// the reader of a Stand file and the list rows (newest first, swatches, `lesbar: false` for a file
// that does not read). Routes: `GET`/`POST /api/marko/:name/staende` and
// `POST /api/marko/:name/staende/:id/oeffnen` – „Öffnen“ backs the current state up as
// „vor dem Öffnen von „<Name>““ unless it is byte-identical to the Stand, replaces draft and
// `leinwand.json` (null → deleted), raises the rev and never touches `agordo.json` (with its
// historio). A Stand whose Agordo does not read answers 422 and changes nothing. No answer judges.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { join } from "node:path";
import type { Agordo } from "@fundamento/agordilo";
import { buildModelo, serializeCanonicalJson } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { paletrojDe } from "./grafeo-gestalten.js";
import type { LeinwandAntwort, LeinwandStato, StandZeile } from "./grafeo-gestalten-sicht.js";
import { LEINWAND_DOSIERO, STAENDE_DIR, standDosiero } from "./leinwand-dosieroj.js";
import { serializeLeinwandStato } from "./leinwand-stato.js";
import { markenFarbenDe, zeitpunktText } from "./marken-liste.js";
import {
  parseStand,
  STAND_ID_MUSTRO,
  STAND_NE_MALFERMEBLA_SATZ,
  type Stand,
  serializeStand,
  sicherungNomo,
  staendeSortiert,
  standEnhavo,
  standIdDe,
  standKrei,
  standNomo,
  standNomoPropono,
  standSlug,
  standZeileDe,
  standZeitId,
} from "./staende.js";
import {
  type Antwort,
  markeAnlegen,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";
import { loadBases } from "./vorschau.js";

const teksto = (wert: unknown): string => JSON.stringify(wert);
const text = (body: Buffer): string => body.toString("utf8");
const sha256 = (bytes: Buffer | string): string => createHash("sha256").update(bytes).digest("hex");

/** 15.11.2026 14:32:10.250 UTC: the clock of the pure tests. */
const ZEIT = new Date(Date.UTC(2026, 10, 15, 14, 32, 10, 250));

const AGORDO_BLAU = { name: "provo", leitfarbe: "#1f5fbf" } as Agordo;
const STATO: LeinwandStato = {
  version: 1,
  knoten: [{ id: "marko", x: 40, y: 80 }],
  kabloj: { akzent: null },
};

describe("Spec 055 T5: ids, names and the content of a Stand (pure)", () => {
  it("builds the id from the UTC second and the slug of the name", () => {
    expect(standZeitId(ZEIT)).toBe("20261115T143210Z");
    const id = standIdDe(ZEIT, "Blau kühl", () => false);
    expect(id).toBe("20261115T143210Z-blau-kuehl");
    expect(STAND_ID_MUSTRO.test(id)).toBe(true);
  });

  it("slugs: umlauts written out, other runs one dash, trimmed, at most 48 characters, may be empty", () => {
    expect(
      [
        "Blau kühl",
        "ÄÖÜ äöü ß",
        "  --Grün & Gelb!!  ",
        "vor dem Öffnen von „Blau kühl“",
        "Ça va? 100 %",
        "",
        "„…“",
        "x".repeat(60),
        `${"a".repeat(47)} b`,
      ].map(standSlug),
    ).toEqual([
      "blau-kuehl",
      "aeoeue-aeoeue-ss",
      "gruen-gelb",
      "vor-dem-oeffnen-von-blau-kuehl",
      "a-va-100",
      "",
      "",
      "x".repeat(48),
      "a".repeat(47),
    ]);
    for (const name of ["Blau kühl", "", "„…“", "x".repeat(60), `${"a".repeat(47)} b`]) {
      const id = standIdDe(ZEIT, name, () => false);
      expect(STAND_ID_MUSTRO.test(id), id).toBe(true);
    }
    expect(standIdDe(ZEIT, "„…“", () => false)).toBe("20261115T143210Z");
  });

  it("appends -2, -3 within the same second", () => {
    const belegt = new Set<string>();
    const ids = ["Blau kühl", "Blau kühl", "Blau kühl", "", ""].map((name) => {
      const id = standIdDe(ZEIT, name, (kandidat) => belegt.has(kandidat));
      belegt.add(id);
      return id;
    });
    expect(ids).toEqual([
      "20261115T143210Z-blau-kuehl",
      "20261115T143210Z-blau-kuehl-2",
      "20261115T143210Z-blau-kuehl-3",
      "20261115T143210Z",
      "20261115T143210Z-2",
    ]);
  });

  it("the id pattern refuses everything else", () => {
    expect(
      [
        "20261115T143210Z",
        "20261115T143210Z-a-2",
        "20261115T143210",
        "20261115T143210Z-",
        "20261115T143210Z--a",
        "20261115T143210Z-Blau",
        "../20261115T143210Z",
        "20261115T143210Z.json",
        "2026111T143210Z",
      ].map((id) => STAND_ID_MUSTRO.test(id)),
    ).toEqual([true, true, false, false, false, false, false, false, false]);
  });

  it("an empty name takes the proposal „TT.MM.JJJJ, HH:MM“ in local time; others stay as typed", () => {
    const lokal = new Date(2026, 0, 5, 7, 3, 59);
    expect(standNomoPropono(lokal)).toBe("05.01.2026, 07:03");
    expect(standNomoPropono(ZEIT)).toBe(zeitpunktText(ZEIT.toISOString()));
    expect(
      [undefined, "", "   ", " Blau kühl ", "Blau kühl"].map((n) => standNomo(n, lokal)),
    ).toEqual([
      "05.01.2026, 07:03",
      "05.01.2026, 07:03",
      "05.01.2026, 07:03",
      "Blau kühl",
      "Blau kühl",
    ]);
    expect(sicherungNomo("Blau kühl")).toBe("vor dem Öffnen von „Blau kühl“");
  });

  it("a Stand is version, id, name, time, the draft and the canvas state, written canonically", () => {
    const stand = standKrei({
      zeit: ZEIT,
      name: "",
      agordo: AGORDO_BLAU,
      leinwand: STATO,
      ekzistas: () => false,
    });
    expect(stand).toEqual({
      version: 1,
      id: "20261115T143210Z",
      name: zeitpunktText(ZEIT.toISOString()),
      zeit: "2026-11-15T14:32:10.250Z",
      agordo: AGORDO_BLAU,
      leinwand: STATO,
    });
    const bajtoj = serializeStand(stand);
    expect(bajtoj).toBe(serializeCanonicalJson(stand));
    expect(Object.keys(JSON.parse(bajtoj) as object)).toEqual([
      "agordo",
      "id",
      "leinwand",
      "name",
      "version",
      "zeit",
    ]);
  });

  it("compares content canonically: key order does not count, a value or the canvas does", () => {
    const umgekehrt = { leitfarbe: "#1f5fbf", name: "provo" };
    expect(standEnhavo(umgekehrt, STATO)).toBe(standEnhavo(AGORDO_BLAU, STATO));
    expect(standEnhavo(AGORDO_BLAU, null)).not.toBe(standEnhavo(AGORDO_BLAU, STATO));
    expect(standEnhavo({ ...AGORDO_BLAU, leitfarbe: "#d62828" }, STATO)).not.toBe(
      standEnhavo(AGORDO_BLAU, STATO),
    );
  });

  it("reads a Stand file: a valid one, one without its canvas part, and unreadable ones", () => {
    const stand: Stand = {
      version: 1,
      id: "20261115T143210Z-blau",
      name: "Blau",
      zeit: ZEIT.toISOString(),
      agordo: AGORDO_BLAU,
      leinwand: STATO,
    };
    expect(parseStand(serializeStand(stand))).toEqual({ speco: "stand", stand });
    const { leinwand: _l, ...ohne } = stand;
    expect(parseStand(teksto(ohne))).toEqual({
      speco: "stand",
      stand: { ...stand, leinwand: null },
    });
    expect(parseStand(teksto({ ...stand, leinwand: { version: 9 } }))).toEqual({
      speco: "stand",
      stand: { ...stand, leinwand: null },
    });
    expect(
      [
        "",
        "{kaputt",
        "[]",
        teksto({ ...stand, version: 2 }),
        teksto({ ...stand, agordo: undefined }),
        teksto({ ...stand, agordo: { name: "provo", leitfarbe: "oklch(1.5 0.1 30)" } }),
      ].map((t) => parseStand(t).speco),
    ).toEqual(["unlesbar", "unlesbar", "unlesbar", "unlesbar", "unlesbar", "unlesbar"]);
    expect(parseStand(teksto({ ...stand, agordo: {} }))).toEqual({
      speco: "unlesbar",
      name: "Blau",
      zeit: ZEIT.toISOString(),
    });
  });

  it("list rows: swatches for a readable Stand, lesbar false (time from the id) for one that is not", () => {
    const farben = { primaer: "#1f5fbf", neutral: "#f1f2f4" };
    const farbenDe = (agordo: Agordo) => ({ ...farben, primaer: agordo.leitfarbe });
    const stand: Stand = {
      version: 1,
      id: "20261115T143210Z-blau",
      name: "Blau",
      zeit: ZEIT.toISOString(),
      agordo: AGORDO_BLAU,
      leinwand: null,
    };
    expect(standZeileDe(stand.id, { speco: "stand", stand }, farbenDe)).toEqual({
      id: stand.id,
      name: "Blau",
      zeit: ZEIT.toISOString(),
      lesbar: true,
      farben,
    });
    expect(standZeileDe("20261115T143210Z-x", { speco: "unlesbar" }, farbenDe)).toEqual({
      id: "20261115T143210Z-x",
      name: "20261115T143210Z-x",
      zeit: "2026-11-15T14:32:10.000Z",
      lesbar: false,
    });
    expect(
      standZeileDe("20261115T143210Z-x", { speco: "unlesbar", name: "X", zeit: "z" }, farbenDe),
    ).toEqual({ id: "20261115T143210Z-x", name: "X", zeit: "z", lesbar: false });
  });

  it("sorts newest first; at the same time the later id first", () => {
    const zeile = (id: string, zeit: string): StandZeile => ({ id, name: id, zeit, lesbar: true });
    expect(
      staendeSortiert([
        zeile("20261115T100000Z-a", "2026-11-15T10:00:00.000Z"),
        zeile("20261115T120000Z-b", "2026-11-15T12:00:00.000Z"),
        zeile("20261115T120000Z-b-2", "2026-11-15T12:00:00.000Z"),
        zeile("20261115T110000Z", "2026-11-15T11:00:00.000Z"),
      ]).map((z) => z.id),
    ).toEqual([
      "20261115T120000Z-b-2",
      "20261115T120000Z-b",
      "20261115T110000Z",
      "20261115T100000Z-a",
    ]);
  });
});

/** The words of a judgment: every Regulo's name, id, statement and kialo, and the report's marks. */
function urteilsWoerter(): string[] {
  const modelo = buildModelo(loadBases().structure.files).modelo;
  return [
    ...modelo.reguloj
      .flatMap((r) => [r.name, r.id, r.statement, r.kialo])
      .filter((wort): wort is string => typeof wort === "string" && wort !== ""),
    "nicht exportierbar",
    "Problem",
    "Prüfung",
    "Betroffen",
    "probleme",
    "raporto",
  ];
}

describe("Spec 055 T5: the routes of the Stände", () => {
  let server: TestServilo;
  const bases = loadBases();

  const get = (path: string): Promise<Antwort> => server.anfrage("GET", path);
  const post = (path: string, body?: string): Promise<Antwort> =>
    server.anfrage("POST", path, body);
  /** PUT of the canvas state over its own connection (the shared helper knows GET and POST). */
  const put = (name: string, stato: LeinwandStato): Promise<Antwort> =>
    new Promise<Antwort>((done, fail) => {
      const body = teksto(stato);
      const anfrage = httpRequest(
        {
          host: "127.0.0.1",
          port: server.servilo.port,
          path: `/api/marko/${name}/leinwand-stato`,
          method: "PUT",
          headers: {
            connection: "close",
            "content-type": "application/json",
            "content-length": String(Buffer.byteLength(body)),
          },
        },
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
  const farbe = async (name: string, rolle: string, wert: string): Promise<void> => {
    const antwort = await post(`/api/marko/${name}/leinwand`, teksto({ farbe: { rolle, wert } }));
    expect(antwort.status, `${rolle} ${wert}`).toBe(200);
  };
  const speichern = async (name: string, korpo: unknown = {}) => {
    const antwort = await post(`/api/marko/${name}/staende`, teksto(korpo));
    expect(antwort.status, text(antwort.body)).toBe(201);
    return JSON.parse(text(antwort.body)) as { id: string; name: string; zeit: string };
  };
  const liste = async (name: string): Promise<StandZeile[]> => {
    const antwort = await get(`/api/marko/${name}/staende`);
    expect(antwort.status).toBe(200);
    return JSON.parse(text(antwort.body)) as StandZeile[];
  };
  const oeffnen = (name: string, id: string) => post(`/api/marko/${name}/staende/${id}/oeffnen`);
  const leinwand = async (name: string): Promise<LeinwandAntwort> => {
    const antwort = await get(`/api/leinwand?marko=${name}`);
    expect(antwort.status).toBe(200);
    return JSON.parse(text(antwort.body)) as LeinwandAntwort;
  };
  const dir = (name: string): string => join(server.workdir, name);
  const datei = (name: string, ...pfad: string[]): string | undefined => {
    const p = join(dir(name), ...pfad);
    return existsSync(p) ? readFileSync(p, "utf8") : undefined;
  };
  const standDe = (name: string, id: string): Stand =>
    JSON.parse(datei(name, STAENDE_DIR, standDosiero(id)) ?? "null") as Stand;
  const entwurf = (name: string): Agordo =>
    JSON.parse(datei(name, "entwurf.json") ?? datei(name, "agordo.json") ?? "null") as Agordo;
  /** Every file of a brand (with `staende/`), as hashes: what a refused request must not change. */
  const ordner = (name: string): Record<string, string> => {
    const out: Record<string, string> = {};
    const walk = (rel: string): void => {
      for (const e of readdirSync(join(dir(name), rel), { withFileTypes: true })) {
        const r = rel === "" ? e.name : `${rel}/${e.name}`;
        if (e.isDirectory()) walk(r);
        else out[r] = sha256(readFileSync(join(dir(name), r)));
      }
    };
    walk("");
    return out;
  };

  beforeAll(async () => {
    server = await testServilo("staende-055-");
    for (const name of ["provo", "lumeto", "komuna", "ablauf"])
      await markeAnlegen(server, name, "leer");
  });

  afterAll(async () => {
    await server?.close();
  });

  it("without staende/ the list is empty", async () => {
    expect(existsSync(join(dir("komuna"), STAENDE_DIR))).toBe(false);
    expect(await liste("komuna")).toEqual([]);
    expect(existsSync(join(dir("komuna"), STAENDE_DIR))).toBe(false);
  });

  it("POST saves the current draft and the canvas state (or null) as a Stand file; 201 {id, name, zeit}", async () => {
    await farbe("provo", "primaer", "#1f5fbf");
    const ohne = await speichern("provo", { name: "Ohne Leinwand" });
    expect(Object.keys(ohne)).toEqual(["id", "name", "zeit"]);
    expect(ohne.name).toBe("Ohne Leinwand");
    expect(ohne.id).toMatch(/^[0-9]{8}T[0-9]{6}Z-ohne-leinwand$/);
    expect(ohne.id.slice(0, 16)).toBe(standZeitId(new Date(ohne.zeit)));
    const bajtoj = datei("provo", STAENDE_DIR, standDosiero(ohne.id));
    expect(bajtoj).toBeDefined();
    const stand = standDe("provo", ohne.id);
    expect(bajtoj).toBe(serializeCanonicalJson(stand));
    expect(stand).toEqual({
      version: 1,
      id: ohne.id,
      name: "Ohne Leinwand",
      zeit: ohne.zeit,
      agordo: entwurf("provo"),
      leinwand: null,
    });

    expect((await put("provo", STATO)).status).toBe(200);
    const mit = await speichern("provo", { name: "Mit Leinwand" });
    expect(standDe("provo", mit.id).leinwand).toEqual(STATO);
  });

  it("an empty or missing name takes the proposal; equal names are allowed", async () => {
    for (const korpo of [{}, { name: "" }, { name: "   " }]) {
      const s = await speichern("lumeto", korpo);
      expect(s.name).toBe(zeitpunktText(s.zeit));
      expect(s.name).toMatch(/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}, [0-9]{2}:[0-9]{2}$/);
      expect(STAND_ID_MUSTRO.test(s.id)).toBe(true);
    }
    const a = await speichern("lumeto", { name: "Gleich" });
    const b = await speichern("lumeto", { name: "Gleich" });
    expect(a.id).not.toBe(b.id);
    expect((await liste("lumeto")).filter((z) => z.name === "Gleich")).toHaveLength(2);
  });

  it("GET lists newest first with swatches; a broken file is lesbar: false", async () => {
    await farbe("lumeto", "akzent", "#2e8b57");
    const mitAkzent = await speichern("lumeto", { name: "Mit Akzent" });
    writeFileSync(join(dir("lumeto"), STAENDE_DIR, "20200101T000000Z-kaputt.json"), "{kaputt");
    writeFileSync(join(dir("lumeto"), STAENDE_DIR, "notiz.txt"), "keine Stand-Datei");
    const zeilen = await liste("lumeto");
    expect(zeilen.map((z) => z.zeit)).toEqual([...zeilen.map((z) => z.zeit)].sort().reverse());
    expect(zeilen[0]?.id).toBe(mitAkzent.id);
    const agordo = entwurf("lumeto");
    expect(zeilen[0]).toEqual({
      id: mitAkzent.id,
      name: "Mit Akzent",
      zeit: mitAkzent.zeit,
      lesbar: true,
      farben: markenFarbenDe(agordo, paletrojDe(agordo, bases)),
    });
    expect(zeilen[0]?.farben?.akzent).toBe("#2e8b57");
    expect(zeilen[0]?.farben?.neutral).toMatch(/^#[0-9a-f]{6}$/);
    const ohneAkzent = zeilen.find((z) => z.name === "Gleich");
    expect(ohneAkzent?.farben !== undefined && !("akzent" in ohneAkzent.farben)).toBe(true);
    expect(zeilen.at(-1)).toEqual({
      id: "20200101T000000Z-kaputt",
      name: "20200101T000000Z-kaputt",
      zeit: "2020-01-01T00:00:00.000Z",
      lesbar: false,
    });
    expect(zeilen).toHaveLength(7);
  });

  it("„Öffnen“ backs up the current state, replaces draft and leinwand.json, raises the rev, keeps agordo.json", async () => {
    // Ablauf 4: blue with a layout → Stand „Blau kühl“ → red and two moved nodes → open it.
    await farbe("ablauf", "primaer", "#1f5fbf");
    const blauStato: LeinwandStato = {
      version: 1,
      knoten: [
        { id: "farbo-primaer", x: 320, y: 40 },
        { id: "paletro", x: 760, y: 40 },
      ],
      kabloj: {},
    };
    expect((await put("ablauf", blauStato)).status).toBe(200);
    const blau = await speichern("ablauf", { name: "Blau kühl" });
    const agordoJson = datei("ablauf", "agordo.json");
    await farbe("ablauf", "primaer", "#d62828");
    const rotStato: LeinwandStato = {
      version: 1,
      knoten: [
        { id: "farbo-primaer", x: 500, y: 300 },
        { id: "paletro", x: 900, y: 500 },
      ],
      kabloj: {},
    };
    expect((await put("ablauf", rotStato)).status).toBe(200);
    const rotAgordo = entwurf("ablauf");
    expect((await leinwand("ablauf")).stato?.knoten).toEqual(rotStato.knoten);
    const revVorher = (await leinwand("ablauf")).rev;

    const antwort = await oeffnen("ablauf", blau.id);
    expect(antwort.status, text(antwort.body)).toBe(200);
    const korpo = JSON.parse(text(antwort.body)) as { rev: number; sicherung?: string };
    expect(Object.keys(korpo).sort()).toEqual(["rev", "sicherung"]);
    expect(korpo.rev).toBe(revVorher + 1);
    expect(STAND_ID_MUSTRO.test(korpo.sicherung ?? "")).toBe(true);

    // The backup: the state before, under „vor dem Öffnen von „Blau kühl““.
    const sicherung = standDe("ablauf", korpo.sicherung ?? "");
    expect(sicherung.name).toBe("vor dem Öffnen von „Blau kühl“");
    expect(sicherung.agordo).toEqual(rotAgordo);
    expect(sicherung.leinwand).toEqual(rotStato);

    // Draft and canvas are the Stand's; agordo.json (and its historio) did not move.
    expect(entwurf("ablauf")).toEqual(standDe("ablauf", blau.id).agordo);
    expect(entwurf("ablauf").leitfarbe).toBe("#1f5fbf");
    expect(datei("ablauf", LEINWAND_DOSIERO)).toBe(serializeLeinwandStato(blauStato));
    expect(datei("ablauf", "agordo.json")).toBe(agordoJson);
    const nachher = await leinwand("ablauf");
    expect(nachher.rev).toBe(korpo.rev);
    expect(nachher.stato?.knoten).toEqual(blauStato.knoten);

    const zeilen = await liste("ablauf");
    expect(zeilen.map((z) => z.name)).toEqual(["vor dem Öffnen von „Blau kühl“", "Blau kühl"]);
    expect(zeilen[0]?.farben?.primaer).toBe("#d62828");
    expect(zeilen[1]?.farben?.primaer).toBe("#1f5fbf");

    // Opening the same Stand again: byte-identical, so no backup; the rev still moves on.
    const wieder = await oeffnen("ablauf", blau.id);
    expect(wieder.status).toBe(200);
    expect(JSON.parse(text(wieder.body))).toEqual({ rev: korpo.rev + 1 });
    expect(await liste("ablauf")).toHaveLength(2);
    expect(datei("ablauf", "agordo.json")).toBe(agordoJson);
  });

  it("a Stand without its canvas part deletes leinwand.json: the start layout", async () => {
    const zeilen = await liste("provo");
    const ohne = zeilen.find((z) => z.name === "Ohne Leinwand");
    expect(datei("provo", LEINWAND_DOSIERO)).toBeDefined();
    const antwort = await oeffnen("provo", ohne?.id ?? "");
    expect(antwort.status).toBe(200);
    expect(datei("provo", LEINWAND_DOSIERO)).toBeUndefined();
    expect((await leinwand("provo")).stato).toBeNull();
    // A file whose leinwand part is missing entirely reads the same way.
    const id = "20261115T000000Z-nur-agordo";
    writeFileSync(
      join(dir("provo"), STAENDE_DIR, standDosiero(id)),
      teksto({
        version: 1,
        id,
        name: "Nur Agordo",
        zeit: "2026-11-15T00:00:00.000Z",
        agordo: AGORDO_BLAU,
      }),
    );
    expect((await put("provo", STATO)).status).toBe(200);
    expect((await oeffnen("provo", id)).status).toBe(200);
    expect(datei("provo", LEINWAND_DOSIERO)).toBeUndefined();
    expect(entwurf("provo")).toEqual(AGORDO_BLAU);
  });

  it("a Stand whose Agordo does not read answers 422 {satz}; nothing is written, no backup", async () => {
    const id = "20261115T010000Z-alt";
    mkdirSync(join(dir("komuna"), STAENDE_DIR), { recursive: true });
    writeFileSync(
      join(dir("komuna"), STAENDE_DIR, standDosiero(id)),
      teksto({
        version: 1,
        id,
        name: "Alt",
        zeit: "2026-11-15T01:00:00.000Z",
        agordo: { name: "komuna", leitfarbe: "oklch(1.5 0.1 30)" },
        leinwand: null,
      }),
    );
    expect((await put("komuna", STATO)).status).toBe(200);
    const vorher = ordner("komuna");
    const revVorher = (await leinwand("komuna")).rev;
    for (const bad of [id, "20261115T020000Z-kaputt"]) {
      if (bad !== id) writeFileSync(join(dir("komuna"), STAENDE_DIR, standDosiero(bad)), "{");
      const nachBad = ordner("komuna");
      const antwort = await oeffnen("komuna", bad);
      expect(antwort.status).toBe(422);
      expect(JSON.parse(text(antwort.body))).toEqual({ satz: STAND_NE_MALFERMEBLA_SATZ });
      expect(ordner("komuna")).toEqual(nachBad);
    }
    expect(Object.keys(ordner("komuna")).length).toBe(Object.keys(vorher).length + 1);
    expect((await leinwand("komuna")).rev).toBe(revVorher);
    expect(STAND_NE_MALFERMEBLA_SATZ).toBe("Dieser Stand lässt sich nicht öffnen");
  });

  it("404 for an unknown brand, an unknown id and a malformed id", async () => {
    const [eine] = await liste("lumeto");
    // Valid Stand files under names the id pattern refuses: the check comes before the disk.
    const gueltig = datei("lumeto", STAENDE_DIR, standDosiero(eine?.id ?? "")) ?? "";
    for (const falsch of ["20261115T143210Z-Blau", "blau", "20991231T235959-nie"])
      writeFileSync(join(dir("lumeto"), STAENDE_DIR, standDosiero(falsch)), gueltig);
    const faelle: [string, Promise<Antwort>][] = [
      ["oeffnen blau", oeffnen("lumeto", "blau")],
      ["GET nenia", get("/api/marko/nenia/staende")],
      ["POST nenia", post("/api/marko/nenia/staende", "{}")],
      ["oeffnen nenia", oeffnen("nenia", eine?.id ?? "")],
      ["oeffnen unbekannt", oeffnen("lumeto", "20991231T235959Z-nie")],
      ["oeffnen ohne Z", oeffnen("lumeto", "20991231T235959-nie")],
      ["oeffnen Punkte", oeffnen("lumeto", "..")],
      ["oeffnen kodiert", oeffnen("lumeto", "%2E%2E%2Fagordo")],
      ["oeffnen Großbuchstaben", oeffnen("lumeto", "20261115T143210Z-Blau")],
    ];
    const status: Record<string, number> = {};
    for (const [fall, antwort] of faelle) status[fall] = (await antwort).status;
    expect(status).toEqual(Object.fromEntries(faelle.map(([fall]) => [fall, 404])));
    expect(existsSync(join(server.workdir, "nenia"))).toBe(false);
  });

  it("names no Regulo and no problem count in any answer", async () => {
    const woerter = urteilsWoerter();
    const [eine] = await liste("lumeto");
    const korpoj = [
      text((await get("/api/marko/lumeto/staende")).body),
      text((await post("/api/marko/lumeto/staende", teksto({ name: "Urteil" }))).body),
      text((await oeffnen("lumeto", eine?.id ?? "")).body),
      text((await oeffnen("komuna", "20261115T010000Z-alt")).body),
      text((await get("/api/marko/nenia/staende")).body),
      text((await oeffnen("lumeto", "20991231T235959Z-nie")).body),
    ];
    const befunde = korpoj.flatMap((k, i) =>
      woerter.filter((w) => k.includes(w)).map((w) => `${i}: ${w}`),
    );
    expect(befunde).toEqual([]);
  });
});
