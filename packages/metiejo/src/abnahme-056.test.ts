// Spec 056 T8 (KBS-4.1): the Abnahme over HTTP, on one server, in the order a person walks the
// Abläufe – AK 1 (texts, three values, three images through the real upload route, a detected
// colour taken over as Primär, two Fontsource fonts through an npm double, the preview follows, no
// check asked), AK 15 (the Marke's `enhavo` after a change of the Kern or a value), AK 5 (a sixth
// value is never stored), AK 17 (Primär follows the images, a hand value or „als Primär
// übernehmen“ stops it, „folgen lassen“ switches it on, a detached edge stops it), AK 9 (a board
// link stays a reference with its sentence, a direct image address is read), AK 3 (the fixture ZIP
// with Regular and Bold), AK 2 (a reload and a Stand bring back texts, values, images, detected
// colours and fonts), AK 16 (detached edges into the Marke: `enhavo` without them, the same after a
// reload and a Stand, „Anordnung zurücksetzen“ plugs them all) and AK 4 (no export file names an
// image or carries its bytes). The canvas side of the follow rule is the client module `folgo.ts`,
// loaded by address as in erkannt-056; its context writes the whole canvas state as the shell does.
// Network and browser are doubles; invented brands only; counts and colours come from the answers.

import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { basename, extname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type Bildilo, SenBrowser } from "./enportilo/bildilo.js";
import {
  BEISPIELE_ELIR,
  type BeispielDosiero,
  type BildoFarbo,
  type BildoMarko,
  type BildoVorschau,
  type ErkanntaFarbo,
  type FolgoRezulto,
  FUENF_WERTE_SATZ,
  type InhaltBeispiele,
  type LeinwandAntwort,
  type LeinwandStato,
  type LeinwandStatoKnoto,
  type LeinwandSxangxo,
  PINTEREST_SATZ,
  type StandZeile,
  schnitteSatzDe,
  WERTE_GRENZE,
  type Wert,
  wertElirDe,
} from "./grafeo-gestalten-sicht.js";
import { findInBuffer, fingerprintsOf } from "./kontrolo.js";
import { enhavoDe, erkanntDe, markoEnhavoDe, wertAldoni } from "./leinwand-enhavo.js";
import { markoDir } from "./marko.js";
import { encodePng } from "./test-doubles/png.js";
import { type Antwort, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { tarballOf } from "./test-doubles/tar.js";
import { readTiparoj } from "./tiparoj.js";
import type { NpmDeps } from "./tiparoj-npm.js";

const NOMO = "lumeto";
const FORM = "application/x-www-form-urlencoded";
const STUB = "export {};\n";
const teksto = (wert: unknown): string => JSON.stringify(wert);
const text = (body: Buffer): string => body.toString("utf8");
type Metodo = "GET" | "POST" | "PUT" | "DELETE";

// ---------------------------------------------------------------------------------------------
// Test images (bands of whole colours, so the Enportilo measures them exactly) and the doubles

type Rgb = readonly [number, number, number];
const BLAU: Rgb = [47, 91, 255];
const CREME: Rgb = [239, 230, 214];
const ORANGE: Rgb = [210, 85, 44];
const DUNKEL: Rgb = [28, 29, 34];
const NAVY: Rgb = [22, 35, 95];
const LIME: Rgb = [198, 241, 53];
const GRUEN: Rgb = [31, 138, 76];

/** A 40×40 PNG of horizontal bands: each `[colour, percent]` from the top. */
function baendoj(baendo: readonly (readonly [Rgb, number])[]): Buffer {
  return encodePng(40, 40, (_x, y) => {
    let summe = 0;
    for (const [farbo, anteil] of baendo) {
      summe += anteil;
      if (y < (summe / 100) * 40) return [...farbo, 255];
    }
    const letzte = baendo[baendo.length - 1]?.[0] ?? CREME;
    return [...letzte, 255];
  });
}

const BILDER: readonly { name: string; bytes: Buffer }[] = [
  {
    name: "werkbank-blau.png",
    bytes: baendoj([
      [BLAU, 70],
      [CREME, 30],
    ]),
  },
  {
    name: "plakat-papier.png",
    bytes: baendoj([
      [CREME, 50],
      [ORANGE, 30],
      [DUNKEL, 20],
    ]),
  },
  {
    name: "leuchte-detail.png",
    bytes: baendoj([
      [NAVY, 40],
      [LIME, 60],
    ]),
  },
];
const SPAETER = {
  name: "blatt-gruen.png",
  bytes: baendoj([
    [GRUEN, 80],
    [CREME, 20],
  ]),
};
const ADRESSE_BILD = "https://bilder.example/fenster.png";
const ADRESSE_BOARD = "https://www.pinterest.de/lumeto/werkstatt/";
const FENSTER = baendoj([
  [ORANGE, 60],
  [CREME, 40],
]);

/** The network of the Beispiele route: one image address and one board page without images. */
const abrufe: string[] = [];
const fetchDouble = (url: string): Promise<Response> => {
  abrufe.push(url);
  if (url === ADRESSE_BILD)
    return Promise.resolve(
      new Response(new Uint8Array(FENSTER), { headers: { "content-type": "image/png" } }),
    );
  if (url === ADRESSE_BOARD)
    return Promise.resolve(
      new Response("<!doctype html><title>Pinterest</title><div id=root></div>", {
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
    );
  return Promise.reject(new TypeError("fetch failed"));
};
const bildilo: Bildilo = {
  bildigi: () => Promise.reject(new SenBrowser("kein Browser")),
  malkodi: () => Promise.reject(new SenBrowser("kein Browser")),
};

/** npm double: any Fontsource family has a version and a tarball with two Latin woff2 files. */
const REGISTRY = "https://registry.npmjs.org";
const npmAbrufe: string[] = [];
const idDe = (url: string): string =>
  decodeURIComponent(/@fontsource(?:%2f|\/)([^/]+)/i.exec(url)?.[1] ?? "");
const npmDe = (cacheDir: string): NpmDeps => ({
  fetchJson: async (url) => {
    npmAbrufe.push(url);
    const id = idDe(url);
    return {
      version: "5.0.0",
      license: "OFL-1.1",
      dist: { tarball: `${REGISTRY}/@fontsource/${id}/-/${id}-5.0.0.tgz` },
    };
  },
  fetchBytes: async (url) => {
    npmAbrufe.push(url);
    const id = idDe(url);
    return tarballOf([
      { path: "package/LICENSE", bytes: Buffer.from("SIL Open Font License 1.1 (test)") },
      { path: `package/files/${id}-latin-400-normal.woff2`, bytes: Buffer.from(`${id}-400`) },
      { path: `package/files/${id}-latin-700-normal.woff2`, bytes: Buffer.from(`${id}-700`) },
    ]);
  },
  cacheDir,
  date: "2026-11-16",
});

const FIKSTUROJ = fileURLToPath(new URL("../test/fixtures/valid/tiparo-056/", import.meta.url));

// ---------------------------------------------------------------------------------------------
// The client module `folgo.ts`, loaded by address (as erkannt-056)

type SkriboRezulto = { speco: "ok"; rev: number; gespeichert: string } | { speco: "problemo" };
interface Valoro {
  marko: string;
  bildo: LeinwandAntwort;
  skribi: (sxangxo: LeinwandSxangxo) => Promise<SkriboRezulto>;
  verbunden: (port: string) => boolean;
  inhaltDe: (id: string) => InhaltBeispiele | undefined;
  inhaltMeti: (id: string, inhalt: InhaltBeispiele, konservi: boolean) => void;
}
interface FolgoModulo {
  folgi(okazo: "dateien" | "gesteckt" | "verlangt", valoro: Valoro): Promise<void>;
  primaerUebernehmen(hex: string, valoro: Valoro): Promise<SkriboRezulto>;
  akzentUebernehmen(farbo: ErkanntaFarbo, valoro: Valoro): Promise<SkriboRezulto>;
  folgoDe(valoro: Valoro): FolgoRezulto | undefined;
}

async function folgoModulo(): Promise<FolgoModulo> {
  const adreso = (dosiero: string) => teksto(fileURLToPath(new URL(dosiero, import.meta.url)));
  const folgo = fileURLToPath(
    new URL("../../nodredaktilo/src/gestalten/folgo.ts", import.meta.url),
  );
  const kodo = readFileSync(folgo, "utf8")
    .replaceAll(
      'from "@fundamento/metiejo/gestalten"',
      `from ${adreso("./grafeo-gestalten-sicht.ts")}`,
    )
    .replaceAll('from "@fundamento/metiejo/enhavo"', `from ${adreso("./leinwand-enhavo.ts")}`);
  const kopio = join(mkdtempSync(join(tmpdir(), "abnahme-056-")), "folgo.ts");
  writeFileSync(kopio, kodo);
  try {
    return (await import(pathToFileURL(kopio).href)) as FolgoModulo;
  } finally {
    rmSync(join(kopio, ".."), { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------------------------

describe("Spec 056 T8: the Abläufe over HTTP (AK 1, 2, 3, 4, 5, 9, 15, 16, 17)", () => {
  let server: TestServilo;
  let stubDir: string;
  let folgo: FolgoModulo;
  const pruefungen: string[] = [];

  /** The canvas as the shell holds it: every node with its content, and the detached outputs. */
  const knoten = new Map<string, LeinwandStatoKnoto>();
  const geloest = new Set<string>();
  let bildo: LeinwandAntwort;
  const pendaj: Promise<Antwort>[] = [];

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
  const json = <T>(antwort: Antwort): T => JSON.parse(text(antwort.body)) as T;
  const leinwand = async (): Promise<LeinwandAntwort> => {
    const antwort = await senden("GET", `/api/leinwand?marko=${NOMO}`);
    expect(antwort.status).toBe(200);
    bildo = json<LeinwandAntwort>(antwort);
    return bildo;
  };
  const statoDe = (): LeinwandStato => ({
    version: 1,
    knoten: [...knoten.values()],
    kabloj: {},
    ...(geloest.size > 0 ? { geloest: [...geloest].sort() } : {}),
  });
  /** Writes the whole canvas state, as the shell's writer does after every saved change. */
  const konservi = async (): Promise<void> => {
    const antwort = await senden("PUT", `/api/marko/${NOMO}/leinwand-stato`, teksto(statoDe()));
    expect(antwort.status, text(antwort.body)).toBe(200);
  };
  const inhaltMeti = async (knoto: LeinwandStatoKnoto): Promise<void> => {
    knoten.set(knoto.id, knoto);
    await konservi();
  };
  const atendi = async (): Promise<void> => {
    for (const antwort of await Promise.all(pendaj.splice(0))) expect(antwort.status).toBe(200);
  };
  const markoDe = (a: LeinwandAntwort): BildoMarko | undefined =>
    a.nodoj.find((n): n is BildoMarko => n.speco === "marko");
  const farboDe = (a: LeinwandAntwort, rolo: string): BildoFarbo | undefined =>
    a.nodoj.find((n): n is BildoFarbo => n.speco === "farbo" && n.rolo === rolo);
  const primaer = async (): Promise<{ wert: string | undefined; stato: string | undefined }> => {
    const p = farboDe(await leinwand(), "primaer");
    return { wert: p?.wert?.toLowerCase(), stato: p?.stato };
  };
  const beispiele = (): InhaltBeispiele =>
    enhavoDe("beispiele", knoten.get("beispiele")?.inhalt) ?? {};
  const beispieleMeti = (inhalt: InhaltBeispiele): void => {
    knoten.set("beispiele", { id: "beispiele", speco: "beispiele", inhalt });
  };

  /** The context of `folgo.ts`: the Bildo of the server, the canvas state of this test. */
  const valoro: Valoro = {
    marko: NOMO,
    get bildo() {
      return bildo;
    },
    skribi: async (sxangxo) => {
      const antwort = await senden("POST", `/api/marko/${NOMO}/leinwand`, teksto(sxangxo));
      if (antwort.status !== 200) return { speco: "problemo" };
      await leinwand();
      return { speco: "ok", rev: bildo.rev, gespeichert: "" };
    },
    verbunden: (port) => !geloest.has(port),
    inhaltDe: (id) => (id === "beispiele" ? beispiele() : undefined),
    inhaltMeti: (_id, inhalt, konservi) => {
      beispieleMeti(inhalt);
      if (konservi)
        pendaj.push(senden("PUT", `/api/marko/${NOMO}/leinwand-stato`, teksto(statoDe())));
    },
  };

  /** One image through the real route; the answer's file goes into the Beispiele content. */
  const hochladen = async (name: string, bytes: Buffer): Promise<BeispielDosiero> => {
    const antwort = await senden(
      "POST",
      `/api/marko/${NOMO}/beispiele`,
      teksto({ filename: name, base64: bytes.toString("base64") }),
    );
    expect(antwort.status, text(antwort.body)).toBe(200);
    const { datei } = json<{ datei: BeispielDosiero }>(antwort);
    const dateien = (beispiele().dateien ?? []).filter((d) => d.name !== datei.name);
    beispieleMeti({ ...beispiele(), dateien: [...dateien, datei] });
    return datei;
  };
  const entfernen = async (name: string): Promise<void> => {
    const antwort = await senden("DELETE", `/api/marko/${NOMO}/beispiele/${name}`);
    expect(antwort.status).toBe(200);
    beispieleMeti({
      ...beispiele(),
      dateien: (beispiele().dateien ?? []).filter((d) => d.name !== name),
    });
  };
  /** After an image change: the follow rule runs as the node runs it, then its writes finish. */
  const folgen = async (okazo: "dateien" | "gesteckt" | "verlangt"): Promise<void> => {
    await konservi();
    await leinwand();
    await folgo.folgi(okazo, valoro);
    await atendi();
  };
  /** The first detected colour that may lead (the rule's candidate), from the stored files. */
  const leitDe = (): string | undefined =>
    erkanntDe(beispiele().dateien ?? []).find((f) => f.leit)?.hex;

  beforeAll(async () => {
    folgo = await folgoModulo();
    stubDir = mkdtempSync(join(tmpdir(), "abnahme-056-leinwand-"));
    writeFileSync(join(stubDir, "leinwand.js"), STUB);
    server = await testServilo("abnahme-056-", {
      leinwand: stubDir,
      esploro: { fetch: fetchDouble, bildilo },
      npm: npmDe(join(stubDir, "npm-cache")),
      pruefTor: async (marko) => {
        pruefungen.push(marko);
      },
    });
  });

  afterAll(async () => {
    await server?.close();
    rmSync(stubDir, { recursive: true, force: true });
  });

  it("Ablauf 1 (AK 15): a new brand; Kern and three values reach the Marke after each save", async () => {
    const kreo = await senden("POST", "/marko", `name=${NOMO}&basis=leer&ziel=leinwand`, FORM);
    expect(kreo.status).toBe(303);
    expect((await senden("GET", `/marko/${NOMO}/grafeo`)).status).toBe(200);
    const neu = await leinwand();
    // Nothing arrives yet: the Marke looks as before, no state file.
    expect({ stato: neu.stato, enhavo: markoDe(neu)?.enhavo }).toEqual({
      stato: null,
      enhavo: undefined,
    });

    await inhaltMeti({
      id: "teksto-ausgangslage",
      inhalt: { text: "lumeto baut Leuchten für Werkstätten. Jetzt kommt der eigene Shop." },
    });
    await inhaltMeti({
      id: "teksto-markenkern",
      inhalt: {
        zweck: "Gutes Licht dort, wo mit den Händen gearbeitet wird.",
        versprechen: "Jede Leuchte lässt sich reparieren.",
      },
    });
    expect(markoDe(await leinwand())?.enhavo).toEqual({
      kern: {
        zweck: "Gutes Licht dort, wo mit den Händen gearbeitet wird.",
        versprechen: "Jede Leuchte lässt sich reparieren.",
      },
      dazu: ["teksto-ausgangslage"],
    });

    // Three values, each added as the node adds it (Enter → `wertAldoni`) and saved.
    let werte: Wert[] = [];
    for (const wort of ["nahbar", "mutig", "gründlich"]) {
      const rezulto = wertAldoni(werte, wort);
      if (!("werte" in rezulto)) throw new Error(`value refused: ${wort}`);
      werte = rezulto.werte;
      await inhaltMeti({ id: "teksto-werte", inhalt: { werte } });
    }
    const mitWerten = markoDe(await leinwand())?.enhavo;
    expect(mitWerten?.werte?.map((w) => w.text)).toEqual(["nahbar", "mutig", "gründlich"]);

    // A change of the Kern and of a value stands in the Marke after the save, nothing reloaded.
    await inhaltMeti({
      id: "teksto-markenkern",
      inhalt: {
        zweck: "Gutes Licht für Hände, die arbeiten.",
        versprechen: "Jede Leuchte lässt sich reparieren.",
      },
    });
    const geaendert = werte.map((w) => (w.text === "mutig" ? { ...w, text: "mutiger" } : w));
    await inhaltMeti({ id: "teksto-werte", inhalt: { werte: geaendert } });
    const danach = markoDe(await leinwand())?.enhavo;
    expect({ zweck: danach?.kern?.zweck, werte: danach?.werte?.map((w) => w.text) }).toEqual({
      zweck: "Gutes Licht für Hände, die arbeiten.",
      werte: ["nahbar", "mutiger", "gründlich"],
    });
    await inhaltMeti({ id: "teksto-werte", inhalt: { werte } });
    expect(markoDe(await leinwand())?.enhavo).toEqual(markoEnhavoDe([...knoten.values()], []));
  });

  it("AK 5: a sixth value cannot be added, the node says why, and the server keeps five", async () => {
    let werte = enhavoDe("teksto-werte", knoten.get("teksto-werte")?.inhalt)?.werte ?? [];
    const drei = werte;
    for (const wort of ["offen", "klar"]) {
      const rezulto = wertAldoni(werte, wort);
      if (!("werte" in rezulto)) throw new Error(`value refused: ${wort}`);
      werte = rezulto.werte;
    }
    expect(werte).toHaveLength(WERTE_GRENZE);
    expect(wertAldoni(werte, "leise")).toEqual({ rifuzo: "kvin" });
    // The node shows the calm sentence from the shared constant.
    const listoj = readFileSync(
      fileURLToPath(
        new URL("../../nodredaktilo/src/gestalten/nodoj/teksto-listoj.tsx", import.meta.url),
      ),
      "utf8",
    );
    expect(listoj).toContain("FUENF_WERTE_SATZ");
    expect(FUENF_WERTE_SATZ).toBe(
      "Fünf Werte reichen. Werte sind Entscheidungshilfen, keine Poster.",
    );
    // A state with six values (no node writes one) is stored with five.
    const sechs = [...werte, { id: "w6", text: "leise" }];
    await inhaltMeti({ id: "teksto-werte", inhalt: { werte: sechs } });
    const gespeichert = (await leinwand()).stato?.knoten.find((k) => k.id === "teksto-werte");
    const roh = (gespeichert?.inhalt as { werte?: Wert[] } | undefined)?.werte ?? [];
    expect(roh.map((w) => w.text)).toEqual(werte.map((w) => w.text));
    expect(markoDe(bildo)?.enhavo?.werte).toHaveLength(WERTE_GRENZE);
    await inhaltMeti({ id: "teksto-werte", inhalt: { werte: drei } });
  });

  it("Ablauf 2 (AK 1, 17): three images; Primär follows, switches, is taken over, follows again", async () => {
    expect((await primaer()).stato).toBe("startwert");
    beispieleMeti({});
    for (const b of BILDER) await hochladen(b.name, b.bytes);
    await folgen("dateien");
    const ersteLeit = leitDe();
    expect(ersteLeit).toBeDefined();
    expect(await primaer()).toEqual({ wert: ersteLeit, stato: "aus-material" });
    expect(folgo.folgoDe(valoro)?.linio).toBe("folgt");
    // The Marke shows the detected colours, largest first.
    expect(markoDe(await leinwand())?.enhavo?.farben).toEqual(
      erkanntDe(beispiele().dateien ?? []).map(({ hex, anteil }) => ({ hex, anteil })),
    );

    // The image with the lead colour goes: Primär changes to the now largest colourful colour.
    const mitLeit = (beispiele().dateien ?? []).find((d) =>
      (d.farben ?? []).some((f) => f.hex === ersteLeit),
    );
    if (mitLeit === undefined) throw new Error("no image carries the lead colour");
    await entfernen(mitLeit.name);
    await folgen("dateien");
    const zweiteLeit = leitDe();
    expect(zweiteLeit).not.toBe(ersteLeit);
    expect(await primaer()).toEqual({ wert: zweiteLeit, stato: "aus-material" });

    // „als Primär übernehmen“ at another colourful field: Primär takes it, following ends.
    const andere = erkanntDe(beispiele().dateien ?? []).find(
      (f): f is ErkanntaFarbo => f.bunt && f.hex !== zweiteLeit,
    );
    if (andere === undefined) throw new Error("no second colourful colour");
    expect((await folgo.primaerUebernehmen(andere.hex, valoro)).speco).toBe("ok");
    await atendi();
    expect(await primaer()).toEqual({ wert: andere.hex, stato: "aus-material" });
    expect(beispiele().primaer).toEqual({ folgt: false, zuletzt: andere.hex });
    expect(folgo.folgoDe(valoro)?.linio).toBe("folgt-nicht");

    // A new image no longer changes Primär.
    await hochladen(SPAETER.name, SPAETER.bytes);
    await folgen("dateien");
    expect((await primaer()).wert).toBe(andere.hex);

    // „folgen lassen“: Primär follows the images again at once.
    await folgen("verlangt");
    expect(await primaer()).toEqual({ wert: leitDe(), stato: "aus-material" });
    expect(folgo.folgoDe(valoro)?.linio).toBe("folgt");

    // A colour by hand ends following as well.
    expect(
      (
        await senden(
          "POST",
          `/api/marko/${NOMO}/leinwand`,
          teksto({ farbe: { rolle: "primaer", wert: "#336699" } }),
        )
      ).status,
    ).toBe(200);
    await folgen("dateien");
    expect(await primaer()).toEqual({ wert: "#336699", stato: "von-hand" });
    expect(folgo.folgoDe(valoro)?.linio).toBe("folgt-nicht");
    await folgen("verlangt");
    expect((await primaer()).stato).toBe("aus-material");
  });

  it("Ablauf 3 (AK 9): a board link stays a reference with its sentence; an image address is read", async () => {
    const board = await senden(
      "POST",
      `/api/marko/${NOMO}/beispiele`,
      teksto({ url: ADRESSE_BOARD }),
    );
    expect({ status: board.status, korpo: json(board) }).toEqual({
      status: 200,
      korpo: { verweis: { adresse: ADRESSE_BOARD, satz: PINTEREST_SATZ } },
    });
    const bild = await senden(
      "POST",
      `/api/marko/${NOMO}/beispiele`,
      teksto({ url: ADRESSE_BILD }),
    );
    expect(bild.status).toBe(200);
    const { datei } = json<{ datei: BeispielDosiero }>(bild);
    expect({ name: datei.name, art: datei.art, farben: (datei.farben ?? []).length > 0 }).toEqual({
      name: "fenster.png",
      art: "png",
      farben: true,
    });
    expect(existsSync(join(markoDir(server.workdir, NOMO), "materialo", "fenster.png"))).toBe(true);
    expect(abrufe).toEqual([ADRESSE_BOARD, ADRESSE_BILD]);
    beispieleMeti({
      ...beispiele(),
      dateien: [...(beispiele().dateien ?? []), datei],
      verweise: [{ adresse: ADRESSE_BOARD, satz: PINTEREST_SATZ }],
    });
    await folgen("dateien");
  });

  it("Ablauf 4 (AK 1): two Fontsource fonts by search and kind; the node's CSS and the preview follow", async () => {
    const suche = async (q: string, art: string): Promise<string> => {
      const antwort = await senden(
        "GET",
        `/api/marko/${NOMO}/tiparoj?q=${encodeURIComponent(q)}&art=${art}`,
      );
      expect(antwort.status).toBe(200);
      const { treffer } = json<{ treffer: { id: string; category: string }[] }>(antwort);
      expect(treffer.length).toBeGreaterThan(0);
      expect(treffer.filter((t) => t.category !== art)).toEqual([]);
      return treffer[0]?.id ?? "";
    };
    // Without a search word: every family of the kind is counted, and only that kind is listed.
    const mono = await senden("GET", `/api/marko/${NOMO}/tiparoj?q=&art=monospace`);
    const art = json<{ treffer: { category: string }[]; anzahl: number }>(mono);
    expect({
      anzahl: art.anzahl,
      fremde: art.treffer.filter((t) => t.category !== "monospace").length,
    }).toEqual({
      anzahl: readTiparoj().tiparoj.filter((t) => t.category === "monospace").length,
      fremde: 0,
    });
    const ueberschrift = await suche("frau", "serif");
    const textSchrift = await suche("Inter", "sans-serif");
    const vorher = await leinwand();
    const vorschauVorher = vorher.nodoj.find((n): n is BildoVorschau => n.speco === "vorschau");
    const htmlVorher = text((await senden("GET", vorschauVorher?.href ?? "")).body);
    for (const [rolle, tiparo] of [
      ["display", ueberschrift],
      ["body", textSchrift],
    ] as const) {
      const antwort = await senden(
        "POST",
        `/api/marko/${NOMO}/leinwand`,
        teksto({ schrift: { rolle, tiparo } }),
      );
      expect(antwort.status, text(antwort.body)).toBe(200);
    }
    const schriften = json<{
      schriften: Record<string, { familie: string; tiparo?: string }>;
    }>(await senden("GET", `/api/marko/${NOMO}/schriften`));
    expect([schriften.schriften.display?.tiparo, schriften.schriften.body?.tiparo]).toEqual([
      ueberschrift,
      textSchrift,
    ]);
    // The node's real font comes through the product's own route (npm double, cache).
    for (const id of [ueberschrift, textSchrift]) {
      const css = await senden("GET", `/api/tiparo/${id}/css`);
      expect(css.status).toBe(200);
      expect(text(css.body)).toContain(`/api/tiparo/${id}/${id}-latin-400-normal.woff2`);
      const datei = await senden("GET", `/api/tiparo/${id}/${id}-latin-400-normal.woff2`);
      expect({ status: datei.status, bytes: text(datei.body) }).toEqual({
        status: 200,
        bytes: `${id}-400`,
      });
    }
    // The preview follows: a new rev, and its frame names both families.
    const nachher = await leinwand();
    expect(nachher.rev).toBe(vorher.rev + 2);
    const vorschau = nachher.nodoj.find((n): n is BildoVorschau => n.speco === "vorschau");
    expect(vorschau?.href).toContain(`rev=${nachher.rev}`);
    const html = text((await senden("GET", vorschau?.href ?? "")).body);
    expect(html).not.toBe(htmlVorher);
    for (const familie of [schriften.schriften.display?.familie, schriften.schriften.body?.familie])
      expect(html).toContain(familie ?? "–");
  });

  it("Ablauf 5 (AK 3): the fixture ZIP with Regular and Bold names the cuts and what is missing", async () => {
    const zip = readFileSync(join(FIKSTUROJ, "lato-400-700.zip"));
    const antwort = await senden(
      "POST",
      `/api/marko/${NOMO}/schriftdateien`,
      teksto({ filename: "Lato.zip", base64: zip.toString("base64") }),
    );
    expect(antwort.status).toBe(200);
    const { familien, uebergangen } = json<{
      familien: {
        familie: string;
        dateien: { name: string; gewicht: number; stil: string }[];
        fehlt: string[];
      }[];
      uebergangen: number;
    }>(antwort);
    expect(
      familien.map((f) => [f.familie, f.dateien.map((d) => [d.gewicht, d.stil]), f.fehlt]),
    ).toEqual([
      [
        "Lato",
        [
          [400, "normal"],
          [700, "normal"],
        ],
        ["Italic"],
      ],
    ]);
    expect(uebergangen).toBe(1);
    expect(schnitteSatzDe(["Regular 400", "Bold 700"], familien[0]?.fehlt ?? [])).toBe(
      "Gefunden: Regular 400, Bold 700. Es fehlt: Italic.",
    );
    expect(
      readdirSync(join(markoDir(server.workdir, NOMO), "fontoj"))
        .filter((d) => !d.startsWith("."))
        .sort(),
    ).toEqual(familien.flatMap((f) => f.dateien.map((d) => d.name)).sort());
    // The family is kept in the Schrift node; as Code font it is „lizenziert, nicht enthalten“.
    await inhaltMeti({
      id: "schrift",
      speco: "schrift",
      inhalt: {
        eigene: familien.map((f) => ({
          familie: f.familie,
          dateien: f.dateien.map((d) => ({ ...d, variabel: false, quelle: "tabellen" })),
        })),
      },
    });
    const gesetzt = await senden(
      "POST",
      `/api/marko/${NOMO}/leinwand`,
      teksto({ schrift: { rolle: "code", eigene: "Lato" } }),
    );
    expect(gesetzt.status, text(gesetzt.body)).toBe(200);
    const schriften = json<{ schriften: Record<string, { familie: string; lizenz: string }> }>(
      await senden("GET", `/api/marko/${NOMO}/schriften`),
    );
    expect(schriften.schriften.code).toMatchObject({
      familie: "Lato",
      lizenz: "lizenziert, nicht enthalten",
    });
  });

  it("Ablauf 6 (AK 2): a reload and a Stand bring back texts, values, images, colours and fonts", async () => {
    // „Reload“: a fresh answer carries what the canvas holds.
    const neu = await leinwand();
    const gespeichert = new Map((neu.stato?.knoten ?? []).map((k) => [k.id, k.inhalt] as const));
    const erwartet = new Map([...knoten.values()].map((k) => [k.id, k.inhalt] as const));
    expect([...gespeichert.keys()].sort()).toEqual([...erwartet.keys()].sort());
    for (const id of erwartet.keys())
      expect(enhavoDe(id as "beispiele", gespeichert.get(id)), id).toEqual(
        enhavoDe(id as "beispiele", erwartet.get(id)),
      );
    const erkannt = erkanntDe(enhavoDe("beispiele", gespeichert.get("beispiele"))?.dateien ?? []);
    expect(erkannt.length).toBeGreaterThan(0);
    expect(markoDe(neu)?.enhavo?.farben).toEqual(
      erkannt.map(({ hex, anteil }) => ({ hex, anteil })),
    );
    const schriftenVorher = text((await senden("GET", `/api/marko/${NOMO}/schriften`)).body);

    // „Stand speichern“, change texts, values, images and a font, „Öffnen“: as in the Stand.
    const stand = await senden("POST", `/api/marko/${NOMO}/staende`, teksto({ name: "Werkstatt" }));
    expect(stand.status).toBe(201);
    const { id } = json<{ id: string }>(stand);
    const primaerVorher = await primaer();
    const vorStand = statoDe();
    await inhaltMeti({ id: "teksto-markenkern", inhalt: { zweck: "Etwas ganz anderes." } });
    await inhaltMeti({ id: "teksto-werte", inhalt: { werte: [{ id: "w1", text: "laut" }] } });
    beispieleMeti({ ...beispiele(), dateien: [] });
    await konservi();
    for (const korpo of [
      { farbe: { rolle: "primaer", wert: "#d62828" } },
      { schrift: { rolle: "display", tiparo: "inter" } },
    ])
      expect((await senden("POST", `/api/marko/${NOMO}/leinwand`, teksto(korpo))).status).toBe(200);

    const oeffnen = await senden("POST", `/api/marko/${NOMO}/staende/${id}/oeffnen`);
    expect(oeffnen.status, text(oeffnen.body)).toBe(200);
    const offen = await leinwand();
    // The canvas the shell shows after „Öffnen“ is the Stand's.
    knoten.clear();
    for (const k of offen.stato?.knoten ?? []) knoten.set(k.id, k);
    expect({ knoten: offen.stato?.knoten, geloest: offen.stato?.geloest }).toEqual({
      knoten: vorStand.knoten,
      geloest: vorStand.geloest,
    });
    expect(await primaer()).toEqual(primaerVorher);
    expect(
      text((await senden("GET", `/api/marko/${NOMO}/schriften`)).body).replace(/"rev":\d+/, ""),
    ).toBe(schriftenVorher.replace(/"rev":\d+/, ""));
    const staende = json<StandZeile[]>(await senden("GET", `/api/marko/${NOMO}/staende`));
    expect(staende.map((z) => z.name)).toEqual(["vor dem Öffnen von „Werkstatt“", "Werkstatt"]);
  });

  it("Ablauf 7 (AK 16, 17): detached edges into the Marke persist through reload and Stand; reset plugs all", async () => {
    const werte = enhavoDe("teksto-werte", knoten.get("teksto-werte")?.inhalt)?.werte ?? [];
    const mutig = werte.find((w) => w.text === "mutig");
    if (mutig === undefined) throw new Error("no value mutig");
    geloest.add(wertElirDe(mutig.id));
    geloest.add(BEISPIELE_ELIR);
    await konservi();
    const geloestAntwort = await leinwand();
    const enhavo = markoDe(geloestAntwort)?.enhavo;
    expect({
      werte: enhavo?.werte?.map((w) => w.text),
      farben: enhavo?.farben,
      geloest: geloestAntwort.stato?.geloest,
    }).toEqual({
      werte: ["nahbar", "gründlich"],
      farben: undefined,
      geloest: [BEISPIELE_ELIR, wertElirDe(mutig.id)].sort(),
    });
    // Detached, Primär does not follow a new image, and stays as it is.
    const vorher = await primaer();
    await hochladen("zweites-blau.png", BILDER[0]?.bytes ?? Buffer.alloc(0));
    await folgen("dateien");
    expect(await primaer()).toEqual(vorher);
    expect(folgo.folgoDe(valoro)?.linio).toBe("folgt-nicht");

    // A Stand carries the detached edges; „Anordnung zurücksetzen“ plugs every one again.
    const stand = await senden("POST", `/api/marko/${NOMO}/staende`, teksto({ name: "Gelöst" }));
    expect(stand.status).toBe(201);
    const { id } = json<{ id: string }>(stand);
    expect((await senden("DELETE", `/api/marko/${NOMO}/leinwand-stato`)).status).toBe(200);
    const zurueck = await leinwand();
    expect({
      geloest: zurueck.stato?.geloest,
      werte: markoDe(zurueck)?.enhavo?.werte?.map((w) => w.text),
      farben: (markoDe(zurueck)?.enhavo?.farben ?? []).length > 0,
      inhalte: (zurueck.stato?.knoten ?? []).filter((k) => k.inhalt !== undefined).length,
    }).toEqual({
      geloest: undefined,
      werte: ["nahbar", "mutig", "gründlich"],
      farben: true,
      inhalte: knoten.size,
    });
    expect((await senden("POST", `/api/marko/${NOMO}/staende/${id}/oeffnen`)).status).toBe(200);
    expect((await leinwand()).stato?.geloest).toEqual(
      [BEISPIELE_ELIR, wertElirDe(mutig.id)].sort(),
    );
    // Plugged again, Primär follows the images once more.
    geloest.clear();
    await folgen("gesteckt");
    expect(folgo.folgoDe(valoro)?.linio).toBe("folgt");
    expect(pruefungen).toEqual([]);
  });

  it("AK 4: no export file names an uploaded image or carries its bytes; the search can find both", async () => {
    expect(pruefungen).toEqual([]);
    // A calm Primär by hand: the export's existing palette checks are not part of this run.
    expect(
      (
        await senden(
          "POST",
          `/api/marko/${NOMO}/leinwand`,
          teksto({ farbe: { rolle: "primaer", wert: "#1f5fbf" } }),
        )
      ).status,
    ).toBe(200);
    // „als Akzent übernehmen“ at the orange of the poster: its origin goes into the package.
    await leinwand();
    const orange = erkanntDe(beispiele().dateien ?? []).find((f) => f.hex === "#d2552c");
    if (orange === undefined) throw new Error("orange not detected");
    expect((await folgo.akzentUebernehmen(orange, valoro)).speco).toBe("ok");
    expect(farboDe(await leinwand(), "akzent")?.stato).toBe("aus-material");
    const gespeichert = await senden("POST", `/studio/${NOMO}/speichern`, "", FORM);
    expect(gespeichert.status).toBe(303);
    const dir = markoDir(server.workdir, NOMO);
    const alle = (wo: string): string[] => {
      const out: string[] = [];
      const iri = (nun: string) => {
        for (const ero of readdirSync(nun, { withFileTypes: true })) {
          const pado = join(nun, ero.name);
          if (ero.isDirectory()) iri(pado);
          else out.push(pado);
        }
      };
      if (existsSync(wo)) iri(wo);
      return out.sort();
    };
    const bilder = alle(join(dir, "materialo"))
      .filter((d) => /\.(png|jpe?g|webp|svg|pdf)$/.test(d))
      .map((d) => ({ name: basename(d), bytes: readFileSync(d) }));
    expect(bilder.length).toBeGreaterThanOrEqual(BILDER.length);
    const trovojEn = (dosiero: string): string[] => {
      const bytes = readFileSync(dosiero);
      const latin = bytes.toString("latin1");
      const trovoj: string[] = [];
      for (const b of bilder)
        for (const nomo of [b.name, basename(b.name, extname(b.name))])
          if (latin.includes(nomo) || text(bytes).includes(nomo)) trovoj.push(`${nomo} (Name)`);
      for (const t of findInBuffer(
        bytes,
        bilder.map((b) => fingerprintsOf(b.bytes, b.name)),
      ))
        trovoj.push(`${t.source} (Bytes)`);
      return trovoj;
    };
    const rezultoj = [...alle(join(dir, "eksporto")), join(dir, "agordo.json")];
    expect(rezultoj.length).toBeGreaterThan(20);
    const funde = Object.fromEntries(
      rezultoj.map((d) => [relative(dir, d), trovojEn(d)] as const).filter(([, t]) => t.length > 0),
    );
    expect(funde).toEqual({});
    // Control: the canvas state names the images, materialo/ holds their bytes.
    expect(trovojEn(join(dir, "leinwand.json")).some((t) => t.endsWith("(Name)"))).toBe(true);
    expect(
      bilder.filter(
        (b) => !trovojEn(join(dir, "materialo", b.name)).some((t) => t.endsWith("(Bytes)")),
      ),
    ).toEqual([]);
  });
});
