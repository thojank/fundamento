// Spec 056 (MP-2a, T2, KBS-2.1): the shell of the canvas – what the server and the session carry
// for the new nodes. `GET /api/leinwand` without a state file answers the bytes of `6d34a75a`;
// with contents the Marke carries `enhavo`, `stato.geloest` comes back, and a file of Beispiele or
// of an own font that is gone is marked `fehlt: true` in the answer only (never in the file). `PUT`
// stores contents, added nodes and `geloest` canonically; `DELETE` keeps every content and drops
// places and `geloest`. The write path takes a font and a Schrift slider. The three route modules
// of the node tickets are stubs that handle nothing. The session helpers of `stato.ts` (loaded as
// in leinwand-stato-055) keep the edges into the Marke apart from the colour edges (D-18, D-19)
// and carry contents, added nodes and `geloest` both ways. Invented brands only.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { type Agordo, reglerOf } from "@fundamento/agordilo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { beispieleVojoj } from "./beispiele-vojoj.js";
import {
  BEISPIELE_HILFE,
  type Bildo,
  type BildoMarko,
  type Kabloj,
  type LeinwandAntwort,
  type LeinwandStato,
  type Pozicio,
  TRO_GRANDA_SATZ,
} from "./grafeo-gestalten-sicht.js";
import { reglerSatzDe } from "./grafeo-skribo.js";
import { LEINWAND_DOSIERO } from "./leinwand-dosieroj.js";
import { markoEnhavoDe } from "./leinwand-enhavo.js";
import { parseLeinwandStato, serializeLeinwandStato } from "./leinwand-stato.js";
import { eigeneFontFace, FONTOJ_DIR, schriftdosierojVojoj } from "./schriftdosieroj-vojoj.js";
import { ANFRAGE_GRENZE, dateiGrenzeDe, type VojoKunteksto } from "./servilo.js";
import {
  type Antwort,
  markeAnlegen,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";
import { tiparoVojoj } from "./tiparo-vojoj.js";
import { readTiparoj } from "./tiparoj.js";
import { loadBases } from "./vorschau.js";

const sha256 = (bytes: Buffer | string): string => createHash("sha256").update(bytes).digest("hex");
const text = (body: Buffer): string => body.toString("utf8");
const teksto = (wert: unknown): string => JSON.stringify(wert);

// ---------------------------------------------------------------------------------------------
// The session helpers of `stato.ts` (that package has no test runner; loaded as in 055)

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
  aldonitaj?: readonly string[];
  inhaltoj?: Readonly<Record<string, Record<string, unknown>>>;
  markoGeloest?: readonly string[];
}
interface StatoModulo {
  SESIO_KOMENCO: Sesio;
  kunZiehen(nun: Sesio, ligoj: readonly Bildo["ligoj"][number][], de: string, al: string): Sesio;
  kunLoesen(nun: Sesio, ids: readonly string[]): Sesio;
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

const STATO_TS = fileURLToPath(
  new URL("../../nodredaktilo/src/gestalten/stato.ts", import.meta.url),
);

/** `stato.ts` with its one import of the bundle's alias named by address (as leinwand-stato-055). */
async function statoModulo(): Promise<StatoModulo> {
  const sicht = fileURLToPath(new URL("./grafeo-gestalten-sicht.ts", import.meta.url));
  const kodo = readFileSync(STATO_TS, "utf8");
  const ersetzt = kodo.replace('from "@fundamento/metiejo/gestalten"', `from ${teksto(sicht)}`);
  if (ersetzt === kodo) throw new Error("stato.ts no longer imports @fundamento/metiejo/gestalten");
  const kopio = join(mkdtempSync(join(tmpdir(), "leinwand-sxelo-056-")), "stato.ts");
  writeFileSync(kopio, ersetzt);
  try {
    return (await import(pathToFileURL(kopio).href)) as StatoModulo;
  } finally {
    rmSync(join(kopio, ".."), { recursive: true, force: true });
  }
}

/** The values of Werte and the contents used throughout (invented). */
const WERTE = [
  { id: "w1", text: "nahbar" },
  { id: "w2", text: "mutig" },
  { id: "w3", text: "gründlich" },
];
const KERN = { zweck: "Licht, das man reparieren kann.", versprechen: "Es hält lange." };

/**
 * A state with contents in fixed and added nodes, a detached value and two files; its nodes in the
 * order the canvas writes them (Bildo nodes, then the nodes of this run in the order of the process).
 */
const INHALTE: LeinwandStato = {
  version: 1,
  knoten: [
    { id: "marko", x: 30, y: 60 },
    { id: "teksto-zielgruppe", speco: "teksto", inhalt: { wer: "Werkstätten" } },
    { id: "teksto-markenkern", inhalt: KERN },
    { id: "teksto-werte", x: -340, y: 470, inhalt: { werte: WERTE } },
    {
      id: "beispiele",
      speco: "beispiele",
      inhalt: {
        dateien: [
          {
            name: "da.png",
            art: "png",
            farben: [{ hex: "#2f5bff", anteil: 60, hell: false, bunt: true, leit: true }],
          },
          { name: "weg.png", art: "png" },
        ],
        primaer: { folgt: true },
      },
    },
    {
      id: "schrift",
      speco: "schrift",
      inhalt: {
        eigene: [
          {
            familie: "Lumo Sans",
            dateien: [
              {
                name: "LumoSans-Regular.woff2",
                gewicht: 400,
                stil: "normal",
                variabel: false,
                quelle: "tabellen",
              },
            ],
          },
        ],
      },
    },
  ],
  kabloj: {},
  geloest: ["teksto-werte.el.w2"],
};

/** The session helpers read a Bildo only for its node ids and its edges. */
const bildo = {
  nodoj: [{ id: "marko", speco: "marko", fazo: "fazo-4" }],
  ligoj: [],
} as unknown as Bildo;

describe("Spec 056 T2: the session of stato.ts keeps the edges into the Marke apart (D-18, D-19)", () => {
  let m: StatoModulo;
  const markoLigo = (de: string) => ({
    id: `${de}>marko.en.teksto`,
    de,
    al: "marko.en.teksto",
    art: "teksto" as const,
  });

  beforeAll(async () => {
    m = await statoModulo();
  });

  it("stato.ts keeps exactly one import statement, of the shared module, and none of enhavo (D-20)", () => {
    const kodo = readFileSync(STATO_TS, "utf8");
    const importoj = kodo.split("\n").filter((zeile) => /^\s*import\b/.test(zeile));
    expect({
      importoj: importoj.length,
      gestalten: (kodo.match(/from "@fundamento\/metiejo\/gestalten"/g) ?? []).length,
      enhavo: kodo.includes("@fundamento/metiejo/enhavo"),
    }).toEqual({ importoj: 1, gestalten: 1, enhavo: false });
  });

  it("kunZiehen at a Marke input plugs that output and detaches nothing else", () => {
    const ligoj = [markoLigo("teksto-werte.el.w1"), markoLigo("teksto-markenkern.el")];
    const nun: Sesio = {
      ...m.SESIO_KOMENCO,
      geloest: ["marko.el>farbo-akzent.en"],
      markoGeloest: ["beispiele.el", "teksto-werte.el.w3"],
    };
    const nova = m.kunZiehen(nun, ligoj, "teksto-werte.el.w3", "marko.en.teksto");
    expect({
      geloest: nova.geloest,
      gezogen: nova.gezogen,
      markoGeloest: nova.markoGeloest,
    }).toEqual({
      geloest: ["marko.el>farbo-akzent.en"],
      gezogen: [],
      markoGeloest: ["beispiele.el"],
    });
  });

  it("kunLoesen of an edge into the Marke detaches its output, never a colour edge", () => {
    const nova = m.kunLoesen(m.SESIO_KOMENCO, [
      "teksto-werte.el.w2>marko.en.teksto",
      "beispiele.el>marko.en.bildo",
      "marko.el>farbo-akzent.en",
    ]);
    expect({ geloest: nova.geloest, markoGeloest: nova.markoGeloest }).toEqual({
      geloest: ["marko.el>farbo-akzent.en"],
      markoGeloest: ["beispiele.el", "teksto-werte.el.w2"],
    });
  });

  it("sesioDeStato and statoDeSesio carry contents, added nodes, places and geloest both ways", async () => {
    const geladen = m.sesioDeStato(INHALTE, bildo);
    expect({
      aldonitaj: geladen.sesio.aldonitaj,
      inhaltoj: Object.keys(geladen.sesio.inhaltoj ?? {}).sort(),
      markoGeloest: geladen.sesio.markoGeloest,
      verschoben: [...geladen.verschoben.keys()].sort(),
    }).toEqual({
      aldonitaj: ["teksto-zielgruppe", "beispiele", "schrift"],
      inhaltoj: ["beispiele", "schrift", "teksto-markenkern", "teksto-werte", "teksto-zielgruppe"],
      markoGeloest: ["teksto-werte.el.w2"],
      verschoben: ["marko", "teksto-werte"],
    });
    const zurueck = m.statoDeSesio(bildo, geladen.sesio, geladen.verschoben, {});
    const lego = parseLeinwandStato(teksto(INHALTE));
    if (!("stato" in lego)) throw new Error("INHALTE does not read");
    // The state of the session is exactly what the reader makes of the file.
    expect(zurueck).toEqual(lego.stato);
    expect(parseLeinwandStato(serializeLeinwandStato(zurueck))).toEqual({ stato: zurueck });
  });

  it("drops a detached output whose value or node is gone, and writes no empty geloest", () => {
    const sesio: Sesio = {
      ...m.SESIO_KOMENCO,
      inhaltoj: { "teksto-werte": { werte: WERTE.slice(0, 1) } },
      markoGeloest: ["teksto-werte.el.w2", "beispiele.el", "teksto-werte.el.w1"],
    };
    expect(m.statoDeSesio(bildo, sesio, new Map(), {}).geloest).toEqual(["teksto-werte.el.w1"]);
    const leer = m.statoDeSesio(bildo, { ...sesio, markoGeloest: ["beispiele.el"] }, new Map(), {});
    expect("geloest" in leer).toBe(false);
  });
});

// ---------------------------------------------------------------------------------------------
// The routes

describe("Spec 056 T2: the routes of the canvas with the new nodes", () => {
  let server: TestServilo;
  const get = (path: string): Promise<Antwort> => server.anfrage("GET", path);
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
    senden("PUT", `/api/marko/${name}/leinwand-stato`, teksto(korpo));
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
  const markoDe = (a: LeinwandAntwort): BildoMarko | undefined =>
    a.nodoj.find((n): n is BildoMarko => n.speco === "marko");
  const inhaltDe = (a: LeinwandAntwort, id: string): Record<string, unknown> | undefined =>
    a.stato?.knoten.find((k) => k.id === id)?.inhalt;
  const fehltDe = (a: LeinwandAntwort): unknown => ({
    beispiele: (
      (inhaltDe(a, "beispiele")?.dateien ?? []) as { name: string; fehlt?: boolean }[]
    ).map((d) => [d.name, d.fehlt === true]),
    schrift: (
      (inhaltDe(a, "schrift")?.eigene ?? []) as { dateien: { name: string; fehlt?: boolean }[] }[]
    ).flatMap((f) => f.dateien.map((d) => [d.name, d.fehlt === true])),
  });

  beforeAll(async () => {
    server = await testServilo("leinwand-sxelo-056-");
    await markeAnlegen(server, "provo", "leer");
    await markeAnlegen(server, "lumeto", "leer");
    await markeAnlegen(server, "komuna", "komuna");
  });

  afterAll(async () => {
    await server?.close();
  });

  /** sha256 of `GET /api/leinwand` at `6d34a75a` (servilo.ts unchanged), taken before the edit. */
  const VORHER: Readonly<Record<string, string>> = {
    "provo ": "b5fcedbd6849ea53563e76d5a4c347137985c3ae4b03e6f94b4a68707f1e50c0",
    "provo &kabloj=akzent:-": "d2464ebbfe85e183ca480134fb5b15c2c72d03e06df5acefc1550c92ed34052f",
    "komuna ": "77bff7cc0ec7d41b9abe553e4448d15d43da32eb833b2b54073d14b8ab3da187",
  };

  it("answers without a state file the bytes of 6d34a75a", async () => {
    const ist: Record<string, string> = {};
    for (const schluessel of Object.keys(VORHER)) {
      const [name = "", abfrage = ""] = schluessel.split(" ");
      const antwort = await get(`/api/leinwand?marko=${name}${abfrage}`);
      ist[schluessel] = sha256(antwort.body);
    }
    expect(ist).toEqual(VORHER);
    expect(dateiDe("provo")).toBeUndefined();
  });

  it("PUT stores contents, added nodes and geloest canonically; GET gives the Marke its enhavo", async () => {
    expect((await put("lumeto", INHALTE)).status).toBe(200);
    const lego = parseLeinwandStato(teksto(INHALTE));
    if (!("stato" in lego)) throw new Error("INHALTE does not read");
    expect(dateiDe("lumeto")).toBe(serializeLeinwandStato(lego.stato));
    const antwort = await antwortDe("/api/leinwand?marko=lumeto");
    expect(markoDe(antwort)?.enhavo).toEqual(
      markoEnhavoDe(lego.stato.knoten, ["teksto-werte.el.w2"]),
    );
    expect(markoDe(antwort)?.enhavo?.werte?.map((w) => w.text)).toEqual(["nahbar", "gründlich"]);
    expect(antwort.stato?.geloest).toEqual(["teksto-werte.el.w2"]);
    expect(antwort.stato?.knoten.map((k) => k.id)).toEqual(lego.stato.knoten.map((k) => k.id));
  });

  it("marks a missing file fehlt: true in the answer only, and never writes it back", async () => {
    expect((await put("lumeto", INHALTE)).status).toBe(200);
    const materialo = join(server.workdir, "lumeto", "materialo");
    mkdirSync(materialo, { recursive: true });
    writeFileSync(join(materialo, "da.png"), "png");
    const datei = dateiDe("lumeto");
    const erste = await antwortDe("/api/leinwand?marko=lumeto");
    expect(fehltDe(erste)).toEqual({
      beispiele: [
        ["da.png", false],
        ["weg.png", true],
      ],
      schrift: [["LumoSans-Regular.woff2", true]],
    });
    expect(dateiDe("lumeto")).toBe(datei);
    // The answer's state sent back as it is: the file stays without `fehlt`.
    expect((await put("lumeto", { version: 1, ...erste.stato })).status).toBe(200);
    expect(dateiDe("lumeto")).toBe(datei);
    expect(dateiDe("lumeto")?.includes("fehlt")).toBe(false);
    // A file that appears or goes is seen by the next answer (no cached `fehlt`).
    const fontoj = join(server.workdir, "lumeto", FONTOJ_DIR);
    mkdirSync(fontoj, { recursive: true });
    writeFileSync(join(fontoj, "LumoSans-Regular.woff2"), "woff2");
    rmSync(join(materialo, "da.png"));
    expect(fehltDe(await antwortDe("/api/leinwand?marko=lumeto"))).toEqual({
      beispiele: [
        ["da.png", true],
        ["weg.png", true],
      ],
      schrift: [["LumoSans-Regular.woff2", false]],
    });
  });

  it("DELETE keeps every content, drops places and geloest; every edge into the Marke is back", async () => {
    expect((await put("lumeto", INHALTE)).status).toBe(200);
    expect((await loeschen("lumeto")).status).toBe(200);
    const antwort = await antwortDe("/api/leinwand?marko=lumeto");
    const stato = antwort.stato;
    expect({
      ids: stato?.knoten.map((k) => k.id),
      orte: stato?.knoten.filter((k) => k.x !== undefined || k.y !== undefined).length,
      inhalte: stato?.knoten.filter((k) => k.inhalt !== undefined).length,
      geloest: stato !== null && stato !== undefined && "geloest" in stato,
      werte: markoDe(antwort)?.enhavo?.werte?.map((w) => w.id),
    }).toEqual({
      ids: ["teksto-zielgruppe", "teksto-markenkern", "teksto-werte", "beispiele", "schrift"],
      orte: 0,
      inhalte: 5,
      geloest: false,
      werte: ["w1", "w2", "w3"],
    });
  });

  it("POST /leinwand sets a font and a Schrift slider (rev+1); a slider out of range is 422 {feld, satz}", async () => {
    const vorher = (await antwortDe("/api/leinwand?marko=komuna&kabloj=")).rev;
    const tiparo = readTiparoj().tiparoj.find((t) => t.scripts.includes("Latn"));
    if (tiparo === undefined) throw new Error("catalog without Latin");
    const schrift = await server.anfrage(
      "POST",
      "/api/marko/komuna/leinwand",
      teksto({ schrift: { rolle: "display", tiparo: tiparo.id } }),
    );
    expect(schrift.status).toBe(200);
    expect((JSON.parse(text(schrift.body)) as { rev: number }).rev).toBe(vorher + 1);
    const groesse = reglerOf(loadBases().gestalt).find((r) => r.path === "schrift.groesse");
    if (groesse === undefined) throw new Error("no slider schrift.groesse");
    const gut = await server.anfrage(
      "POST",
      "/api/marko/komuna/leinwand",
      teksto({ regler: { pfad: "schrift.groesse", wert: groesse.min } }),
    );
    expect(gut.status).toBe(200);
    const falsch = await server.anfrage(
      "POST",
      "/api/marko/komuna/leinwand",
      teksto({ regler: { pfad: "schrift.groesse", wert: groesse.max + groesse.step } }),
    );
    expect({ status: falsch.status, korpo: JSON.parse(text(falsch.body)) }).toEqual({
      status: 422,
      korpo: { feld: "schrift.groesse", satz: reglerSatzDe(groesse) },
    });
  });
});

// ---------------------------------------------------------------------------------------------
// The route stubs and the size limit

describe("Spec 056 T2: the route modules of the node tickets and the size limit (D-11, D-13)", () => {
  it("the three route modules leave a path of another route alone, and a brand without an own font adds no @font-face", async () => {
    const kunteksto = {} as VojoKunteksto;
    const peto = {} as Parameters<typeof beispieleVojoj>[1];
    const respondo = {} as Parameters<typeof beispieleVojoj>[2];
    // A path none of the three modules owns: each must answer `false` without touching the context.
    const url = new URL("http://127.0.0.1/api/marko/provo/entwurf");
    const rezultoj = await Promise.all(
      [beispieleVojoj, tiparoVojoj, schriftdosierojVojoj].map((vojo) =>
        vojo(kunteksto, peto, respondo, "POST", url.pathname, url),
      ),
    );
    expect(rezultoj).toEqual([false, false, false]);
    expect(eigeneFontFace(kunteksto, "provo", { name: "provo" } as Agordo)).toBe("");
  });

  it("the largest file of an upload is three quarters of the request limit: 24 MB, as the sentences say", () => {
    expect({ grenze: ANFRAGE_GRENZE, datei: dateiGrenzeDe(ANFRAGE_GRENZE) }).toEqual({
      grenze: 32 * 1024 * 1024,
      datei: 25_165_824,
    });
    const mb = `${Math.floor(dateiGrenzeDe(ANFRAGE_GRENZE) / (1024 * 1024))} MB`;
    expect([BEISPIELE_HILFE, TRO_GRANDA_SATZ].filter((satz) => !satz.includes(mb))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------------
// The sources of the shell (nodredaktilo has no test runner; its behaviour is checked in Chromium)

describe("Spec 056 T2: the sources of the shell (Teil V, D-4, D-15, D-24)", () => {
  const quelle = (pfad: string): string =>
    readFileSync(fileURLToPath(new URL(`../../nodredaktilo/${pfad}`, import.meta.url)), "utf8");
  /** The code without its comment lines (a comment may name what the code no longer calls). */
  const kodo = (pfad: string): string =>
    quelle(pfad)
      .split("\n")
      .filter((zeile) => !/^\s*(\/\/|\*|\/\*)/.test(zeile))
      .join("\n");

  it("draws every edge as a Bezier curve, the drawing line too, and no more lanes", () => {
    const kanto = kodo("src/gestalten/kanto.tsx");
    const kanvaso = kodo("src/gestalten/kanvaso.tsx");
    expect({
      bezier: /\bgetBezierPath\(/.test(kanto),
      smoothStep: /getSmoothStepPath/.test(kanto),
      spuroX: /\bspuroX\b/.test(kanto),
      linio: /ConnectionLineType\.Bezier/.test(kanvaso),
      katalogo: /\bKATALOGO_056\b/.test(kanvaso) && !/\bKATALOGO_054\b/.test(kanvaso),
    }).toEqual({ bezier: true, smoothStep: false, spuroX: false, linio: true, katalogo: true });
  });

  it("bundles leinwand-enhavo.ts under its alias (D-4)", () => {
    const vite = quelle("vite.config.ts");
    const tsconfig = JSON.parse(quelle("tsconfig.json")) as {
      compilerOptions: { paths: Record<string, string[]> };
    };
    expect({
      vite:
        /"@fundamento\/metiejo\/enhavo": enhavo/.test(vite) && vite.includes("leinwand-enhavo.ts"),
      tsconfig: tsconfig.compilerOptions.paths["@fundamento/metiejo/enhavo"],
    }).toEqual({ vite: true, tsconfig: ["../metiejo/src/leinwand-enhavo.ts"] });
  });
});
