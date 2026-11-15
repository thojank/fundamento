// Spec 055 T4 (LNS-2.2, Abnahme 5): the canvas state of a brand, `marken/<name>/leinwand.json`. The
// pure reader `parseLeinwandStato` checks the version and the types, skips unknown node ids and
// drops entries with wrong types; the file is written canonically. The routes: `GET /api/leinwand`
// answers the Bildo plus `stato` (and `statoUnlesbar` for a file that does not read) and applies the
// file's `kabloj` when the request carries none (D-15: as `{}` when its effective Agordo does not
// read); it never writes. `PUT`/`DELETE /api/marko/:name/leinwand-stato` write the whole state
// („Anordnung zurücksetzen“ keeps added nodes, without places, and `kabloj: {}`) and never touch the
// draft, its rev or the Kroniko; an unreadable file is first renamed to its backup name. The cache
// of `/api/leinwand` never answers with a state that is gone (D-14). No answer judges.

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildModelo, serializeCanonicalJson } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readKroniko } from "./asistanto/kroniko.js";
import type {
  Bildo,
  BildoPaletro,
  BildoVorschau,
  Kabloj,
  LeinwandAntwort,
  LeinwandStato,
  Pozicio,
} from "./grafeo-gestalten-sicht.js";
import { LEINWAND_DOSIERO, LEINWAND_UNLESBAR_PRAEFIKSO } from "./leinwand-dosieroj.js";
import {
  LEINWAND_STATO_SATZ,
  leinwandStatoRekomenco,
  parseLeinwandStato,
  serializeLeinwandStato,
} from "./leinwand-stato.js";
import {
  type Antwort,
  markeAnlegen,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";
import { loadBases } from "./vorschau.js";

/** What the tests use of `stato.ts` (loaded by address: it lies outside this package). */
interface SesioNodo {
  speco: "vorschau";
  id: string;
  schema: "hell" | "dunkel";
  inhalt?: Record<string, unknown>;
}
interface Sesio {
  nodoj: readonly SesioNodo[];
  gezogen: readonly { de: string; al: string }[];
  geloest: readonly string[];
}
interface StatoModulo {
  sitzungDeKabloj(kabloj: Kabloj, bildo: Bildo, nodoj?: readonly SesioNodo[]): Sesio;
  kablojDeSesio(bildo: Bildo, sesio: Sesio): Kabloj;
  statoDeSesio(
    bildo: Bildo,
    sesio: Sesio,
    verschoben: ReadonlyMap<string, Pozicio>,
    kabloj: Kabloj,
  ): LeinwandStato;
  sesioDeStato(
    stato: Omit<LeinwandStato, "version"> | null,
    bildo: Bildo,
  ): { sesio: Sesio; verschoben: Map<string, Pozicio>; vorschauNombro: number };
}
/**
 * `nodredaktilo/src/gestalten/stato.ts` (that package has no test runner, 054 D-7). It imports the
 * shared module under the bundle's alias; a copy in a temp folder names this package's module by
 * its address instead, nothing else changes.
 */
async function statoModulo(): Promise<StatoModulo> {
  const quelle = fileURLToPath(
    new URL("../../nodredaktilo/src/gestalten/stato.ts", import.meta.url),
  );
  const sicht = fileURLToPath(new URL("./grafeo-gestalten-sicht.ts", import.meta.url));
  const kodo = readFileSync(quelle, "utf8");
  const ersetzt = kodo.replace('from "@fundamento/metiejo/gestalten"', `from ${teksto(sicht)}`);
  if (ersetzt === kodo) throw new Error("stato.ts no longer imports @fundamento/metiejo/gestalten");
  const kopio = join(mkdtempSync(join(tmpdir(), "leinwand-stato-055-")), "stato.ts");
  writeFileSync(kopio, ersetzt);
  try {
    return (await import(pathToFileURL(kopio).href)) as StatoModulo;
  } finally {
    rmSync(join(kopio, ".."), { recursive: true, force: true });
  }
}

const sha256 = (bytes: Buffer | string): string => createHash("sha256").update(bytes).digest("hex");
const text = (body: Buffer): string => body.toString("utf8");
const teksto = (wert: unknown): string => JSON.stringify(wert);

/** A full, valid state of the tech spec's shape (invented places). */
const GANZ: LeinwandStato = {
  version: 1,
  knoten: [
    { id: "marko", x: 24, y: 120 },
    { id: "farbo-primaer", x: 280, y: 54 },
    { id: "vorschau-3", speco: "vorschau", schema: "hell", x: 1500, y: 900, inhalt: {} },
  ],
  kabloj: { akzent: null },
};

describe("Spec 055 T4: parseLeinwandStato (pure)", () => {
  it("reads a valid state as it is", () => {
    expect(parseLeinwandStato(teksto(GANZ))).toEqual({ stato: GANZ });
    const leer = { version: 1, knoten: [], kabloj: {} };
    expect(parseLeinwandStato(teksto(leer))).toEqual({ stato: leer });
  });

  it("calls an unknown version, broken JSON or a wrong frame unreadable", () => {
    const unlesbar = [
      "{kaputt",
      "",
      "null",
      "[]",
      "1",
      teksto({ ...GANZ, version: 2 }),
      teksto({ ...GANZ, version: "1" }),
      teksto({ ...GANZ, version: 1.5 }),
      teksto({ knoten: [], kabloj: {} }),
      teksto({ version: 1, knoten: {}, kabloj: {} }),
      teksto({ version: 1, kabloj: {} }),
      teksto({ version: 1, knoten: [] }),
      teksto({ version: 1, knoten: [], kabloj: [] }),
      teksto({ version: 1, knoten: [], kabloj: null }),
    ].filter((t) => teksto(parseLeinwandStato(t)) !== teksto({ unlesbar: true }));
    expect(unlesbar).toEqual([]);
  });

  it("skips unknown node ids and later duplicates", () => {
    const rezulto = parseLeinwandStato(
      teksto({
        version: 1,
        knoten: [
          { id: "fazo-1", x: 1, y: 2 },
          { id: "text-1", speco: "text", x: 1, y: 2 },
          { id: "vorschau-2", speco: "vorschau", schema: "hell" },
          { id: "vorschau-x", speco: "vorschau", schema: "hell" },
          { id: "farbo-blau", x: 1, y: 2 },
          { id: "paletro", x: 700, y: 30 },
          { id: "paletro", x: 9, y: 9 },
          { id: "vorschau-hell", x: 1200, y: 40 },
          { id: "vorschau-4", speco: "vorschau", schema: "dunkel" },
          { id: "vorschau-4", speco: "vorschau", schema: "hell" },
        ],
        kabloj: {},
      }),
    );
    expect(rezulto).toEqual({
      stato: {
        version: 1,
        knoten: [
          { id: "paletro", x: 700, y: 30 },
          { id: "vorschau-hell", x: 1200, y: 40 },
          { id: "vorschau-4", speco: "vorschau", schema: "dunkel" },
        ],
        kabloj: {},
      },
    });
  });

  it("drops entries and fields with wrong types; a place needs both finite numbers (§2.1)", () => {
    const rezulto = parseLeinwandStato(
      `{"version":1,"kabloj":{},"knoten":[
        {"id":"marko","x":"24","y":120},
        {"id":"farbo-akzent","x":300},
        {"id":"farbo-info","x":300,"y":1e999},
        {"id":"farbo-neutral","x":310.5,"y":260.25,"speco":"vorschau","schema":"hell","inhalt":{"a":1}},
        {"id":7,"x":1,"y":2},
        "paletro",
        null,
        {"id":"vorschau-3","speco":"vorschau","schema":"hell","x":1500},
        {"id":"vorschau-5","speco":"vorschau","schema":"grau","x":1,"y":2},
        {"id":"vorschau-6","schema":"hell","x":1,"y":2},
        {"id":"vorschau-7","speco":"vorschau","schema":"dunkel","x":1,"y":2,"inhalt":[1]},
        {"id":"vorschau-8","speco":"vorschau","schema":"hell","x":-1e999,"y":5}
      ]}`,
    );
    expect(rezulto).toEqual({
      stato: {
        version: 1,
        knoten: [
          { id: "farbo-neutral", x: 310.5, y: 260.25 },
          { id: "vorschau-3", speco: "vorschau", schema: "hell" },
          { id: "vorschau-7", speco: "vorschau", schema: "dunkel", x: 1, y: 2 },
          { id: "vorschau-8", speco: "vorschau", schema: "hell" },
        ],
        kabloj: {},
      },
    });
  });

  it("keeps only kabloj entries kablojEl would read", () => {
    const rezulto = parseLeinwandStato(
      teksto({
        version: 1,
        knoten: [],
        kabloj: {
          akzent: null,
          warning: "primaer",
          farbe: null,
          info: "blau",
          neutral: "primaer",
          primaer: "neutral",
          danger: 3,
        },
      }),
    );
    expect(rezulto).toEqual({
      stato: { version: 1, knoten: [], kabloj: { akzent: null, warning: "primaer" } },
    });
  });

  it("passes inhalt on unchanged (reserved for Spec 056)", () => {
    const inhalt = { titel: "Hallo", absaetze: [{ text: "eins", stil: { gross: true } }], n: 0 };
    const rezulto = parseLeinwandStato(
      teksto({
        version: 1,
        knoten: [{ id: "vorschau-3", speco: "vorschau", schema: "hell", inhalt }],
        kabloj: {},
      }),
    );
    expect(rezulto).toEqual({
      stato: {
        version: 1,
        knoten: [{ id: "vorschau-3", speco: "vorschau", schema: "hell", inhalt }],
        kabloj: {},
      },
    });
  });

  it("writes canonically: sorted keys, given node order, the same bytes for the same state", () => {
    const umgestellt = {
      kabloj: { akzent: null },
      knoten: GANZ.knoten.map((k) => Object.fromEntries(Object.entries(k).reverse())),
      version: 1,
    };
    const a = serializeLeinwandStato(GANZ);
    expect(a).toBe(serializeCanonicalJson(GANZ));
    const b = parseLeinwandStato(teksto(umgestellt));
    expect("stato" in b ? serializeLeinwandStato(b.stato) : "unlesbar").toBe(a);
    expect(parseLeinwandStato(a)).toEqual({ stato: GANZ });
  });

  it("„Anordnung zurücksetzen“ keeps the added nodes without places and drops kabloj", () => {
    expect(leinwandStatoRekomenco(GANZ)).toEqual({
      version: 1,
      knoten: [{ id: "vorschau-3", speco: "vorschau", schema: "hell", inhalt: {} }],
      kabloj: {},
    });
    expect(leinwandStatoRekomenco(null)).toEqual({ version: 1, knoten: [], kabloj: {} });
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

describe("Spec 055 T4: the routes of the canvas state", () => {
  let server: TestServilo;

  const get = (path: string): Promise<Antwort> => server.anfrage("GET", path);
  /** PUT and DELETE over their own connection (the shared helper knows GET and POST only). */
  const senden = (method: "PUT" | "DELETE", path: string, body?: string): Promise<Antwort> =>
    new Promise<Antwort>((done, fail) => {
      const headers: Record<string, string> = { connection: "close" };
      if (body !== undefined) {
        headers["content-type"] = "application/json";
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
  const put = (name: string, korpo: unknown) =>
    senden(
      "PUT",
      `/api/marko/${name}/leinwand-stato`,
      typeof korpo === "string" ? korpo : teksto(korpo),
    );
  const loeschen = (name: string) => senden("DELETE", `/api/marko/${name}/leinwand-stato`);
  const antwortDe = async (path: string): Promise<LeinwandAntwort> => {
    const antwort = await get(path);
    expect(antwort.status, path).toBe(200);
    return JSON.parse(text(antwort.body)) as LeinwandAntwort;
  };
  const dateiDe = (name: string): string | undefined => {
    const pfad = join(server.workdir, name, LEINWAND_DOSIERO);
    return existsSync(pfad) ? readFileSync(pfad, "utf8") : undefined;
  };
  /** Draft, agordo.json and Kroniko of a brand: what a state route must never change. */
  const entwurfDe = async (name: string) => {
    const dir = join(server.workdir, name);
    const dosieroj: Record<string, string> = {};
    for (const eintrag of readdirSync(dir, { withFileTypes: true })) {
      if (!eintrag.isFile() || eintrag.name.startsWith("leinwand")) continue;
      dosieroj[eintrag.name] = sha256(readFileSync(join(dir, eintrag.name)));
    }
    const { rev } = await antwortDe(`/api/leinwand?marko=${name}&kabloj=`);
    return { dosieroj, rev, kroniko: readKroniko(server.workdir, name).length };
  };
  const ordnerDe = (name: string): Record<string, string> => {
    const dir = join(server.workdir, name);
    const out: Record<string, string> = {};
    for (const eintrag of readdirSync(dir, { withFileTypes: true }))
      if (eintrag.isFile()) out[eintrag.name] = sha256(readFileSync(join(dir, eintrag.name)));
    return out;
  };
  /** The answer without `stato`/`statoUnlesbar`: the Bildo alone. */
  const bildoTeil = (a: LeinwandAntwort): unknown => {
    const { stato: _stato, statoUnlesbar: _unlesbar, ...bildo } = a;
    return bildo;
  };
  const vicoFonto = (a: LeinwandAntwort, rolo: string): string | null | undefined =>
    (a.nodoj.find((n) => n.speco === "paletro") as BildoPaletro | undefined)?.vicoj.find(
      (v) => v.rolo === rolo,
    )?.fonto;
  const hrefs = (a: LeinwandAntwort): string[] =>
    a.nodoj.filter((n): n is BildoVorschau => n.speco === "vorschau").map((v) => v.href);

  beforeAll(async () => {
    server = await testServilo("leinwand-stato-055-");
    for (const name of ["provo", "lumeto", "komuna", "rekomenco", "unlesbaro", "kasxo"]) {
      await markeAnlegen(server, name, "leer");
      const akzent = await server.anfrage(
        "POST",
        `/api/marko/${name}/leinwand`,
        teksto({ farbe: { rolle: "akzent", wert: "#2e8b57" } }),
      );
      if (akzent.status !== 200) throw new Error(`Akzent of ${name}: ${akzent.status}`);
    }
    // D-15: a Zweitfarbe the row Primär cannot carry (as in grafeo-wirksam-054).
    const dir = join(server.workdir, "lumeco");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "agordo.json"),
      `${teksto({ name: "lumeco", leitfarbe: "#336699", zweitfarbe: { farbe: "oklch(1.5 0.1 30)" } })}\n`,
    );
  });

  afterAll(async () => {
    await server?.close();
  });

  it("answers stato: null and kabloj {} without a file, and GET writes nothing", async () => {
    const vorher = ordnerDe("provo");
    const antwort = await antwortDe("/api/leinwand?marko=provo");
    expect({
      stato: antwort.stato,
      kabloj: antwort.kabloj,
      unlesbar: "statoUnlesbar" in antwort,
    }).toEqual({ stato: null, kabloj: {}, unlesbar: false });
    await antwortDe("/api/leinwand?marko=provo");
    expect(ordnerDe("provo")).toEqual(vorher);
    expect(dateiDe("provo")).toBeUndefined();
  });

  it("PUT writes the state canonically, leaves draft, rev and Kroniko, and the next GET applies its kabloj", async () => {
    const vorher = await entwurfDe("lumeto");
    const ohneDatei = await antwortDe("/api/leinwand?marko=lumeto");
    const stato: LeinwandStato = {
      version: 1,
      knoten: [
        { id: "paletro", x: 900, y: 60 },
        { id: "vorschau-3", speco: "vorschau", schema: "dunkel", x: 1600, y: 1100 },
        { id: "fazo-2", x: 1, y: 1 },
      ],
      kabloj: { akzent: null },
    };
    const antwort = await put("lumeto", stato);
    expect(antwort.status).toBe(200);
    const korpo = JSON.parse(text(antwort.body)) as Record<string, unknown>;
    expect(Object.keys(korpo)).toEqual(["gespeichert"]);
    expect(Number.isNaN(Date.parse(String(korpo.gespeichert)))).toBe(false);
    const gespeichert: LeinwandStato = { ...stato, knoten: stato.knoten.slice(0, 2) };
    expect(dateiDe("lumeto")).toBe(serializeCanonicalJson(gespeichert));
    expect(await entwurfDe("lumeto")).toEqual(vorher);

    const nachher = await antwortDe("/api/leinwand?marko=lumeto");
    expect(nachher.stato).toEqual({ knoten: gespeichert.knoten, kabloj: { akzent: null } });
    expect(nachher.kabloj).toEqual({ akzent: null });
    expect(vicoFonto(ohneDatei, "akzent")).toBe("akzent");
    expect(vicoFonto(nachher, "akzent")).toBe(null);
    expect(hrefs(nachher).every((h) => h.endsWith("&kabloj=akzent:-"))).toBe(true);
    // The same Bildo as a request with the query `kabloj=akzent:-`.
    const mitAbfrage = await antwortDe("/api/leinwand?marko=lumeto&kabloj=akzent:-");
    expect(bildoTeil(nachher)).toEqual(bildoTeil(mitAbfrage));
    expect(mitAbfrage.stato).toEqual(nachher.stato);
    // A kabloj query keeps the 054 meaning, also an empty one: the Agordo's view.
    const leer = await antwortDe("/api/leinwand?marko=lumeto&kabloj=");
    expect({ kabloj: leer.kabloj, fonto: vicoFonto(leer, "akzent"), stato: leer.stato }).toEqual({
      kabloj: {},
      fonto: "akzent",
      stato: nachher.stato,
    });
    expect((await get("/api/leinwand?marko=lumeto&kabloj=akzent")).status).toBe(400);
  });

  it("never answers a state that is gone (D-14): PUT and DELETE drop the cached answer", async () => {
    const erste = await get("/api/leinwand?marko=kasxo");
    expect(text((await get("/api/leinwand?marko=kasxo")).body)).toBe(text(erste.body));
    const stato: LeinwandStato = { version: 1, knoten: [{ id: "marko", x: 5, y: 6 }], kabloj: {} };
    expect((await put("kasxo", stato)).status).toBe(200);
    const zweite = await antwortDe("/api/leinwand?marko=kasxo");
    expect(zweite.stato).toEqual({ knoten: stato.knoten, kabloj: {} });
    expect(bildoTeil(zweite)).toEqual(bildoTeil(JSON.parse(text(erste.body)) as LeinwandAntwort));
    expect((await put("kasxo", { ...stato, knoten: [{ id: "marko", x: 7, y: 8 }] })).status).toBe(
      200,
    );
    expect((await antwortDe("/api/leinwand?marko=kasxo")).stato?.knoten).toEqual([
      { id: "marko", x: 7, y: 8 },
    ]);
    expect((await loeschen("kasxo")).status).toBe(200);
    expect((await antwortDe("/api/leinwand?marko=kasxo")).stato).toEqual({
      knoten: [],
      kabloj: {},
    });
    // A file changed beside the server is not answered from the cache either.
    writeFileSync(
      join(server.workdir, "kasxo", LEINWAND_DOSIERO),
      serializeLeinwandStato({ version: 1, knoten: [{ id: "paletro", x: 1, y: 2 }], kabloj: {} }),
    );
    expect((await antwortDe("/api/leinwand?marko=kasxo")).stato?.knoten).toEqual([
      { id: "paletro", x: 1, y: 2 },
    ]);
  });

  it("answers a file kabloj whose effective Agordo does not read as kabloj {} (D-15)", async () => {
    const dosiero = join(server.workdir, "lumeco", LEINWAND_DOSIERO);
    writeFileSync(dosiero, serializeLeinwandStato({ version: 1, knoten: [], kabloj: {} }));
    const ohne = await get("/api/leinwand?marko=lumeco");
    writeFileSync(
      dosiero,
      serializeLeinwandStato({ version: 1, knoten: [], kabloj: { primaer: "akzent" } }),
    );
    const mit = await get("/api/leinwand?marko=lumeco");
    expect({ status: mit.status, gleich: text(mit.body) === text(ohne.body) }).toEqual({
      status: 200,
      gleich: true,
    });
    expect((JSON.parse(text(mit.body)) as LeinwandAntwort).stato).toEqual({
      knoten: [],
      kabloj: {},
    });
    // The query keeps the 054 answer; with an empty one the stored state is answered as it is.
    expect((await get("/api/leinwand?marko=lumeco&kabloj=primaer:akzent")).status).toBe(422);
    expect((await antwortDe("/api/leinwand?marko=lumeco&kabloj=")).stato).toEqual({
      knoten: [],
      kabloj: { primaer: "akzent" },
    });
  });

  it("answers an unreadable file with stato null and statoUnlesbar; the next PUT backs it up first", async () => {
    const dosiero = join(server.workdir, "unlesbaro", LEINWAND_DOSIERO);
    const violations: string[] = [];
    for (const kaputt of ["{kaputt", teksto({ version: 2, knoten: [], kabloj: {} })]) {
      for (const eintrag of readdirSync(join(server.workdir, "unlesbaro")))
        if (eintrag.startsWith(LEINWAND_UNLESBAR_PRAEFIKSO))
          rmSync(join(server.workdir, "unlesbaro", eintrag));
      writeFileSync(dosiero, kaputt);
      const vorher = ordnerDe("unlesbaro");
      const antwort = await antwortDe("/api/leinwand?marko=unlesbaro");
      if (antwort.stato !== null) violations.push(`${kaputt}: stato ${teksto(antwort.stato)}`);
      if (antwort.statoUnlesbar !== true) violations.push(`${kaputt}: no statoUnlesbar`);
      if (teksto(antwort.kabloj) !== "{}") violations.push(`${kaputt}: kabloj`);
      if (teksto(ordnerDe("unlesbaro")) !== teksto(vorher)) violations.push(`${kaputt}: GET wrote`);
      const stato: LeinwandStato = {
        version: 1,
        knoten: [{ id: "marko", x: 1, y: 1 }],
        kabloj: {},
      };
      const geschrieben = await put("unlesbaro", stato);
      if (geschrieben.status !== 200) violations.push(`${kaputt}: PUT ${geschrieben.status}`);
      const sicherungen = readdirSync(join(server.workdir, "unlesbaro")).filter((n) =>
        n.startsWith(LEINWAND_UNLESBAR_PRAEFIKSO),
      );
      if (sicherungen.length !== 1) violations.push(`${kaputt}: backups ${teksto(sicherungen)}`);
      const [sicherung = ""] = sicherungen;
      if (!/^leinwand\.unlesbar-\d{4}-\d{2}-\d{2}T\d{6}\.\d{3}Z\.json$/.test(sicherung))
        violations.push(`${kaputt}: name ${sicherung}`);
      else if (readFileSync(join(server.workdir, "unlesbaro", sicherung), "utf8") !== kaputt)
        violations.push(`${kaputt}: backup bytes`);
      if (dateiDe("unlesbaro") !== serializeLeinwandStato(stato))
        violations.push(`${kaputt}: new file`);
      const danach = await antwortDe("/api/leinwand?marko=unlesbaro");
      if ("statoUnlesbar" in danach) violations.push(`${kaputt}: still statoUnlesbar`);
    }
    expect(violations).toEqual([]);
  });

  it("DELETE („Anordnung zurücksetzen“) keeps added nodes without places and kabloj {}", async () => {
    const vorher = await entwurfDe("rekomenco");
    expect((await loeschen("rekomenco")).status).toBe(200);
    expect(dateiDe("rekomenco")).toBe(
      serializeLeinwandStato({ version: 1, knoten: [], kabloj: {} }),
    );
    const stato = {
      version: 1,
      knoten: [
        { id: "farbo-akzent", x: 300, y: 700 },
        { id: "vorschau-3", speco: "vorschau", schema: "hell", x: 1500, y: 900, inhalt: { a: 1 } },
        { id: "vorschau-4", speco: "vorschau", schema: "dunkel" },
      ],
      kabloj: { akzent: null },
    };
    expect((await put("rekomenco", stato)).status).toBe(200);
    const antwort = await loeschen("rekomenco");
    expect(antwort.status).toBe(200);
    expect(Object.keys(JSON.parse(text(antwort.body)) as object)).toEqual(["gespeichert"]);
    const zurueck = {
      version: 1,
      knoten: [
        { id: "vorschau-3", speco: "vorschau", schema: "hell", inhalt: { a: 1 } },
        { id: "vorschau-4", speco: "vorschau", schema: "dunkel" },
      ],
      kabloj: {},
    };
    expect(dateiDe("rekomenco")).toBe(serializeCanonicalJson(zurueck));
    const nachher = await antwortDe("/api/leinwand?marko=rekomenco");
    expect({ stato: nachher.stato, kabloj: nachher.kabloj }).toEqual({
      stato: { knoten: zurueck.knoten, kabloj: {} },
      kabloj: {},
    });
    expect(await entwurfDe("rekomenco")).toEqual(vorher);
  });

  it("answers a wrong shape with 422 {feld, satz} and writes nothing", async () => {
    const vorher = ordnerDe("komuna");
    const falsch: string[] = [];
    for (const korpo of [
      "kaputt",
      "",
      "[]",
      teksto({ version: 2, knoten: [], kabloj: {} }),
      teksto({ version: 1, knoten: {}, kabloj: {} }),
      teksto({ version: 1, knoten: [] }),
      teksto({ knoten: [], kabloj: {} }),
    ]) {
      const antwort = await put("komuna", korpo);
      const erwartet = teksto({ feld: "leinwand-stato", satz: LEINWAND_STATO_SATZ });
      if (antwort.status !== 422 || teksto(JSON.parse(text(antwort.body))) !== erwartet)
        falsch.push(`${korpo}: ${antwort.status} ${text(antwort.body)}`);
    }
    expect(falsch).toEqual([]);
    expect(ordnerDe("komuna")).toEqual(vorher);
  });

  it("answers an unknown brand with 404 on PUT and DELETE and creates nothing", async () => {
    const stato = teksto({ version: 1, knoten: [], kabloj: {} });
    const put404 = await put("nenia", stato);
    const delete404 = await loeschen("nenia");
    expect([put404.status, delete404.status]).toEqual([404, 404]);
    expect(JSON.parse(text(put404.body))).toEqual({ satz: "Diese Marke gibt es nicht." });
    expect(text(delete404.body)).toBe(text(put404.body));
    expect(existsSync(join(server.workdir, "nenia"))).toBe(false);
  });

  it("leaves the preview routes byte-identical: they never read the file", async () => {
    const { rev } = await antwortDe("/api/leinwand?marko=provo&kabloj=");
    const pfade = [
      `/marko/provo/vorschau?sxtupo=vorschau&breite=mittel&scheme=light&rev=${rev}`,
      `/marko/provo/vorschau?sxtupo=vorschau&breite=mittel&scheme=dark&rev=${rev}`,
      `/marko/provo/vorschau.css?rev=${rev}`,
    ];
    const vorher = await Promise.all(pfade.map(async (p) => sha256((await get(p)).body)));
    expect(
      (await put("provo", { version: 1, knoten: [], kabloj: { akzent: null, primaer: null } }))
        .status,
    ).toBe(200);
    const nachher = await Promise.all(pfade.map(async (p) => sha256((await get(p)).body)));
    expect(nachher).toEqual(vorher);
    expect((await loeschen("provo")).status).toBe(200);
  });

  it("names no Regulo and no problem count in any answer", async () => {
    const woerter = urteilsWoerter();
    const korpoj = [
      text((await get("/api/leinwand?marko=lumeto")).body),
      text((await put("lumeto", { version: 1, knoten: [], kabloj: {} })).body),
      text((await put("lumeto", "kaputt")).body),
      text((await loeschen("lumeto")).body),
      text((await loeschen("nenia")).body),
      text((await get("/api/leinwand?marko=unlesbaro")).body),
    ];
    const befunde = korpoj.flatMap((k, i) =>
      woerter.filter((w) => k.includes(w)).map((w) => `${i}: ${w}`),
    );
    expect(befunde).toEqual([]);
  });

  it("sitzungDeKabloj draws a session with exactly the stored kabloj; state and session convert both ways (D-13)", async () => {
    const m = await statoModulo();
    // Two Funktionsfarben with a value and a Tönung, so Neutral feeds its row (a node without a
    // value feeds nothing: `{neutral: null}` would then be the Agordo's view itself).
    for (const sxangxo of [
      { farbe: { rolle: "info", wert: "#1e88c8" } },
      { farbe: { rolle: "success", wert: "#2f9e44" } },
      { toenung: 0.35 },
    ]) {
      const antwort = await server.anfrage("POST", "/api/marko/provo/leinwand", teksto(sxangxo));
      expect(antwort.status).toBe(200);
    }
    const bildo = await antwortDe("/api/leinwand?marko=provo&kabloj=");
    const weitere: SesioNodo[] = [{ speco: "vorschau", id: "vorschau-3", schema: "hell" }];
    const falsch: string[] = [];
    for (const kabloj of [
      {},
      { akzent: null },
      { primaer: null, neutral: null },
      { akzent: "primaer" },
      { warning: "info" },
      { info: null, success: "akzent" },
      { primaer: "akzent", akzent: "primaer" },
      { neutral: null, warning: "primaer", danger: "akzent", info: "success" },
    ] satisfies Kabloj[]) {
      for (const nodoj of [[], weitere]) {
        const sesio = m.sitzungDeKabloj(kabloj, bildo, nodoj);
        const zurueck = m.kablojDeSesio(bildo, sesio);
        if (
          teksto(zurueck) !==
          teksto(m.kablojDeSesio(bildo, m.sitzungDeKabloj(zurueck, bildo, nodoj)))
        )
          falsch.push(`not stable: ${teksto(kabloj)}`);
        if (teksto(Object.entries(zurueck).sort()) !== teksto(Object.entries(kabloj).sort()))
          falsch.push(`${teksto(kabloj)} with ${nodoj.length} → ${teksto(zurueck)}`);
      }
    }
    expect(falsch).toEqual([]);

    // No state before the first change: the start session gives a state the server would not need.
    const start = m.sesioDeStato(null, bildo);
    expect({
      stato: m.statoDeSesio(
        bildo,
        start.sesio,
        start.verschoben,
        m.kablojDeSesio(bildo, start.sesio),
      ),
      nombro: start.vorschauNombro,
    }).toEqual({ stato: { version: 1, knoten: [], kabloj: {} }, nombro: 3 });

    const stato = {
      knoten: [
        { id: "paletro", x: 710.5, y: 30 },
        { id: "vorschau-5", speco: "vorschau", schema: "dunkel", x: 3, y: 4, inhalt: { a: 1 } },
        { id: "vorschau-3", speco: "vorschau", schema: "hell" },
      ],
      kabloj: { akzent: null },
    } satisfies Omit<LeinwandStato, "version">;
    const geladen = m.sesioDeStato(stato, bildo);
    expect({
      nodoj: geladen.sesio.nodoj.map((n) => n.id),
      verschoben: [...geladen.verschoben.keys()],
      nombro: geladen.vorschauNombro,
    }).toEqual({
      nodoj: ["vorschau-5", "vorschau-3"],
      verschoben: ["paletro", "vorschau-5"],
      nombro: 6,
    });
    expect(
      m.statoDeSesio(
        bildo,
        geladen.sesio,
        geladen.verschoben,
        m.kablojDeSesio(bildo, geladen.sesio),
      ),
    ).toEqual({ version: 1, ...stato });
  });
});
