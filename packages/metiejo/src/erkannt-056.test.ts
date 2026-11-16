// Spec 056 (MP-2a, T5, KBS-3.3): „Erkannt“ and „Farbe folgt den Bildern“ over HTTP. The client
// module `nodredaktilo/src/gestalten/folgo.ts` (that package has no test runner) is loaded with its
// two bundle aliases named by address, as leinwand-stato-055 loads `stato.ts`, and runs against a
// real server through a context double whose `skribi` posts to `POST …/leinwand` and whose
// `inhaltMeti(…, true)` puts the canvas state (`PUT …/leinwand-stato`). Every write is logged in
// call order, so the tests see the order of plan D-7 (colour first, then the state with `zuletzt`).
// Covered: „als Primär übernehmen“ (colour, then `{folgt: false, zuletzt}` → GET shows Primär
// „aus-material“), „als Akzent übernehmen“ (`herkunft` → Akzent „aus-material“ by the existing path),
// the follow rule for start value, hand value, detached edge, a Studio change, „folgen lassen“
// (also without a colourful colour, then a colourful image), a failed colour write (no state
// write), and the sources of `erkannt.tsx` / `folgo.ts`. Invented brands only.

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { farbArtDe } from "./farb-arto.js";
import {
  ALS_AKZENT,
  ALS_PRIMAER,
  BEISPIELE_ELIR,
  type BeispielDosiero,
  type BildoFarbo,
  ERKANNT,
  type ErkanntaFarbo,
  FARB_ARTOJ,
  FOLGEN_LASSEN,
  FOLGO_SAETZE,
  type FolgoRezulto,
  type InhaltBeispiele,
  type LeinwandAntwort,
  type LeinwandSxangxo,
  PRIMAER_MARKE,
} from "./grafeo-gestalten-sicht.js";
import { KREILO } from "./kreilo/datoj.js";
import { enhavoDe, erkanntDe } from "./leinwand-enhavo.js";
import {
  type Antwort,
  markeAnlegen,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";

const teksto = (wert: unknown): string => JSON.stringify(wert);

// ---------------------------------------------------------------------------------------------
// The client module, loaded by address

type SkriboRezulto =
  | { speco: "ok"; rev: number; gespeichert: string }
  | { speco: "nelegebla"; feld: string; satz: string }
  | { speco: "problemo" };

/** What `folgo.ts` reads of the shell's context (`GestaltenValoro`). */
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

const GESTALTEN = fileURLToPath(new URL("../../nodredaktilo/src/gestalten/", import.meta.url));
const FOLGO_TS = join(GESTALTEN, "folgo.ts");
const ERKANNT_TSX = join(GESTALTEN, "nodoj", "erkannt.tsx");

/** `folgo.ts` with its imports of the bundle's two aliases named by address. */
async function folgoModulo(): Promise<FolgoModulo> {
  const adreso = (dosiero: string) => teksto(fileURLToPath(new URL(dosiero, import.meta.url)));
  const kodo = readFileSync(FOLGO_TS, "utf8")
    .replaceAll(
      'from "@fundamento/metiejo/gestalten"',
      `from ${adreso("./grafeo-gestalten-sicht.ts")}`,
    )
    .replaceAll('from "@fundamento/metiejo/enhavo"', `from ${adreso("./leinwand-enhavo.ts")}`);
  const kopio = join(mkdtempSync(join(tmpdir(), "erkannt-056-")), "folgo.ts");
  writeFileSync(kopio, kodo);
  try {
    return (await import(pathToFileURL(kopio).href)) as FolgoModulo;
  } finally {
    rmSync(join(kopio, ".."), { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------------------------
// Colours and files (invented); the flags come from the real classification (D-5)

const BLAU = "#2f5bff";
const ROT = "#d2552c";
const GRUEN = "#1f8a4c";
const GRAU = "#8a8a8a";
const HAND = "#336699";
const STUDIO = "#445566";

function farbo(hex: string, anteil: number): ErkanntaFarbo {
  const arto = farbArtDe(hex, KREILO.unbunt);
  if (arto === undefined) throw new Error(`no colour: ${hex}`);
  return { hex, anteil, ...arto };
}
const dosiero = (
  name: string,
  farben: [string, number][],
  art: BeispielDosiero["art"] = "png",
): BeispielDosiero => ({ name, art, farben: farben.map(([hex, a]) => farbo(hex, a)) });

const BLAUES = dosiero("werkbank.png", [
  [BLAU, 70],
  [GRAU, 30],
]);
const ROTES = dosiero("plakat.png", [
  [ROT, 60],
  [GRAU, 40],
]);
const GRUENES = dosiero("blatt.pdf", [[GRUEN, 100]], "pdf");
const GRAUES = dosiero("beton.png", [[GRAU, 100]]);

// ---------------------------------------------------------------------------------------------
// The server and the context double

let server: TestServilo;
let folgo: FolgoModulo;

const senden = (method: "POST" | "PUT", path: string, body: string): Promise<Antwort> =>
  new Promise<Antwort>((done, fail) => {
    const anfrage = httpRequest(
      {
        host: "127.0.0.1",
        port: server.servilo.port,
        path,
        method,
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

async function bildoDe(name: string): Promise<LeinwandAntwort> {
  const antwort = await server.anfrage("GET", `/api/leinwand?marko=${name}`);
  expect(antwort.status).toBe(200);
  return JSON.parse(antwort.body.toString("utf8")) as LeinwandAntwort;
}
async function farboDe(
  name: string,
  rolo: "primaer" | "akzent",
): Promise<{ wert: string | undefined; stato: BildoFarbo["stato"] }> {
  const nodo = (await bildoDe(name)).nodoj.find((n) => n.id === `farbo-${rolo}`);
  if (nodo?.speco !== "farbo") throw new Error(`no farbo-${rolo}`);
  return { wert: nodo.wert?.toLowerCase(), stato: nodo.stato };
}
async function vonHand(name: string, rolle: "primaer" | "akzent", wert: string): Promise<void> {
  const antwort = await senden(
    "POST",
    `/api/marko/${name}/leinwand`,
    teksto({ farbe: { rolle, wert } }),
  );
  expect(antwort.status).toBe(200);
}

interface Sesio {
  valoro: Valoro;
  /** Every write in call order: `farbe <change>` or `stato <primaer>`. */
  log: string[];
  /** Detaches or plugs `beispiele.el`. */
  geloest: string[];
  /** Waits for every state write. */
  atendi(): Promise<void>;
  /** The next colour write fails (R-12: then the state is not written). */
  malsukcesi: boolean;
}

/** A session of the canvas for `name` with the Beispiele content `inhalt`, stored first. */
async function sesio(
  name: string,
  inhalt: InhaltBeispiele,
  geloest: string[] = [],
): Promise<Sesio> {
  const log: string[] = [];
  const pendaj: Promise<Antwort>[] = [];
  let nun: InhaltBeispiele = inhalt;
  let bildo = await bildoDe(name);
  const stati = () => ({
    version: 1,
    knoten: [{ id: "beispiele", speco: "beispiele", inhalt: nun }],
    kabloj: {},
    ...(s.geloest.length > 0 ? { geloest: s.geloest } : {}),
  });
  const s: Sesio = {
    log,
    geloest,
    malsukcesi: false,
    atendi: async () => {
      for (const antwort of await Promise.all(pendaj)) expect(antwort.status).toBe(200);
    },
    valoro: {
      marko: name,
      get bildo() {
        return bildo;
      },
      skribi: async (sxangxo) => {
        log.push(`farbe ${teksto(sxangxo)}`);
        if (s.malsukcesi) return { speco: "problemo" };
        const antwort = await senden("POST", `/api/marko/${name}/leinwand`, teksto(sxangxo));
        if (antwort.status !== 200) return { speco: "problemo" };
        bildo = await bildoDe(name);
        return { speco: "ok", rev: bildo.rev, gespeichert: "" };
      },
      verbunden: (port) => !s.geloest.includes(port),
      inhaltDe: (id) => (id === "beispiele" ? enhavoDe("beispiele", nun) : undefined),
      inhaltMeti: (id, neu, konservi) => {
        expect(id).toBe("beispiele");
        nun = neu;
        if (!konservi) return;
        log.push(`stato ${teksto(neu.primaer)}`);
        pendaj.push(senden("PUT", `/api/marko/${name}/leinwand-stato`, teksto(stati())));
      },
    },
  };
  expect((await senden("PUT", `/api/marko/${name}/leinwand-stato`, teksto(stati()))).status).toBe(
    200,
  );
  bildo = await bildoDe(name);
  return s;
}

/** Sets the files of the session's content (an upload or a removal of KBS-3.2), keeping `primaer`. */
function dateienMeti(s: Sesio, dateien: BeispielDosiero[]): void {
  const nun = s.valoro.inhaltDe("beispiele") ?? {};
  s.valoro.inhaltMeti("beispiele", { ...nun, dateien }, false);
}

const farbeLog = (rolle: string, wert: string) => `farbe ${teksto({ farbe: { rolle, wert } })}`;
const statoLog = (primaer: unknown) => `stato ${teksto(primaer)}`;

beforeAll(async () => {
  folgo = await folgoModulo();
  server = await testServilo("erkannt-056-");
  for (const name of [
    "provo-start",
    "provo-hand",
    "provo-geloest",
    "provo-studio",
    "provo-grau",
    "lumeto-primaer",
    "lumeto-akzent",
    "lumeto-fehler",
  ])
    await markeAnlegen(server, name, "leer");
});

afterAll(async () => {
  await server?.close();
});

// ---------------------------------------------------------------------------------------------

describe("Spec 056 T5: the colours of the test files are classified as the plan says (D-5)", () => {
  it("blue, red and green may lead, grey is not colourful", () => {
    expect([BLAU, ROT, GRUEN, GRAU].map((hex) => farbo(hex, 1).leit)).toEqual([
      true,
      true,
      true,
      false,
    ]);
    expect(farbo(GRAU, 1).bunt).toBe(false);
  });
});

describe("Spec 056 T5: „als Primär übernehmen“ and „als Akzent übernehmen“ over HTTP (D-6, D-23)", () => {
  it("Primär: the colour first, then {folgt: false, zuletzt}; GET shows Primär aus-material", async () => {
    const s = await sesio("lumeto-primaer", { dateien: [BLAUES, ROTES] });
    const rezulto = await folgo.primaerUebernehmen(ROT, s.valoro);
    await s.atendi();
    expect(rezulto.speco).toBe("ok");
    expect(s.log).toEqual([farbeLog("primaer", ROT), statoLog({ folgt: false, zuletzt: ROT })]);
    expect(await farboDe("lumeto-primaer", "primaer")).toEqual({
      wert: ROT,
      stato: "aus-material",
    });
    // The line now says „Primär folgt nicht.“; new images change nothing.
    expect(folgo.folgoDe(s.valoro)?.linio).toBe("folgt-nicht");
    dateienMeti(s, [GRUENES]);
    await folgo.folgi("dateien", s.valoro);
    await s.atendi();
    expect(s.log).toHaveLength(2);
    expect((await farboDe("lumeto-primaer", "primaer")).wert).toBe(ROT);
  });

  it("Primär: a taken colour replaces an existing value, and a grey can be taken too", async () => {
    const erste = await sesio("lumeto-primaer", { dateien: [BLAUES] });
    await folgo.primaerUebernehmen(BLAU, erste.valoro);
    await erste.atendi();
    expect((await farboDe("lumeto-primaer", "primaer")).wert).toBe(BLAU);
    const s = await sesio("lumeto-primaer", { dateien: [GRAUES, BLAUES] });
    expect((await folgo.primaerUebernehmen(GRAU, s.valoro)).speco).toBe("ok");
    await s.atendi();
    expect(s.log).toEqual([farbeLog("primaer", GRAU), statoLog({ folgt: false, zuletzt: GRAU })]);
    expect(await farboDe("lumeto-primaer", "primaer")).toEqual({
      wert: GRAU,
      stato: "aus-material",
    });
  });

  it("Akzent: writes herkunft without a file name; GET shows Akzent aus-material; Primär untouched", async () => {
    const s = await sesio("lumeto-akzent", {
      dateien: [BLAUES, GRUENES],
      primaer: { folgt: false },
    });
    const vorher = await farboDe("lumeto-akzent", "primaer");
    const [gruen] = erkanntDe([BLAUES, GRUENES]).filter((f) => f.hex === GRUEN);
    if (gruen === undefined) throw new Error("green not detected");
    expect((await folgo.akzentUebernehmen(gruen, s.valoro)).speco).toBe("ok");
    await s.atendi();
    expect(s.log).toEqual([
      `farbe ${teksto({ farbe: { rolle: "akzent", wert: GRUEN, herkunft: { quelle: "pdf", anteil: gruen.anteil } } })}`,
    ]);
    expect(await farboDe("lumeto-akzent", "akzent")).toEqual({
      wert: GRUEN,
      stato: "aus-material",
    });
    expect(await farboDe("lumeto-akzent", "primaer")).toEqual(vorher);
    // From an image the origin is „bild“; the same colour as Primär is set as well (no judgement).
    await vonHand("lumeto-akzent", "primaer", BLAU);
    const [blau] = erkanntDe([BLAUES]);
    if (blau === undefined) throw new Error("blue not detected");
    expect((await folgo.akzentUebernehmen(blau, s.valoro)).speco).toBe("ok");
    expect(s.log[1]).toBe(
      `farbe ${teksto({ farbe: { rolle: "akzent", wert: BLAU, herkunft: { quelle: "bild", anteil: blau.anteil } } })}`,
    );
    expect(await farboDe("lumeto-akzent", "akzent")).toEqual({ wert: BLAU, stato: "aus-material" });
  });

  it("a colour write that fails writes no state (tech R-12: the safe side)", async () => {
    const s = await sesio("lumeto-fehler", { dateien: [BLAUES] });
    s.malsukcesi = true;
    expect((await folgo.primaerUebernehmen(BLAU, s.valoro)).speco).toBe("problemo");
    await folgo.folgi("dateien", s.valoro);
    await s.atendi();
    expect(s.log).toEqual([farbeLog("primaer", BLAU), farbeLog("primaer", BLAU)]);
    expect(s.valoro.inhaltDe("beispiele")?.primaer).toBeUndefined();
    expect((await farboDe("lumeto-fehler", "primaer")).stato).toBe("startwert");
  });
});

describe("Spec 056 T5: „Farbe folgt den Bildern“ over HTTP (D-6, D-7, D-8, AK-17)", () => {
  it("start value: the largest colourful colour becomes Primär, colour first, then the state", async () => {
    const s = await sesio("provo-start", { dateien: [] });
    expect((await farboDe("provo-start", "primaer")).stato).toBe("startwert");
    dateienMeti(s, [BLAUES, ROTES]);
    await folgo.folgi("dateien", s.valoro);
    await s.atendi();
    expect(s.log).toEqual([farbeLog("primaer", BLAU), statoLog({ folgt: true, zuletzt: BLAU })]);
    expect(await farboDe("provo-start", "primaer")).toEqual({ wert: BLAU, stato: "aus-material" });
    expect(folgo.folgoDe(s.valoro)?.linio).toBe("folgt");
    // The blue image goes: Primär changes to the now largest colourful colour.
    dateienMeti(s, [ROTES]);
    await folgo.folgi("dateien", s.valoro);
    await s.atendi();
    expect(s.log.slice(2)).toEqual([
      farbeLog("primaer", ROT),
      statoLog({ folgt: true, zuletzt: ROT }),
    ]);
    expect(await farboDe("provo-start", "primaer")).toEqual({ wert: ROT, stato: "aus-material" });
    // The last image goes: Primär stays at the colour it followed last.
    dateienMeti(s, []);
    await folgo.folgi("dateien", s.valoro);
    await s.atendi();
    expect(s.log).toHaveLength(4);
    expect(await farboDe("provo-start", "primaer")).toEqual({ wert: ROT, stato: "aus-material" });
  });

  it("hand value: Primär does not follow, stores folgt: false; „folgen lassen“ follows at once", async () => {
    await vonHand("provo-hand", "primaer", HAND);
    const s = await sesio("provo-hand", { dateien: [] });
    dateienMeti(s, [ROTES]);
    await folgo.folgi("dateien", s.valoro);
    await s.atendi();
    expect(s.log).toEqual([statoLog({ folgt: false })]);
    expect(await farboDe("provo-hand", "primaer")).toEqual({ wert: HAND, stato: "von-hand" });
    expect(folgo.folgoDe(s.valoro)?.linio).toBe("folgt-nicht");
    await folgo.folgi("verlangt", s.valoro);
    await s.atendi();
    expect(s.log.slice(1)).toEqual([
      farbeLog("primaer", ROT),
      statoLog({ folgt: true, zuletzt: ROT }),
    ]);
    expect(await farboDe("provo-hand", "primaer")).toEqual({ wert: ROT, stato: "aus-material" });
    expect(folgo.folgoDe(s.valoro)?.linio).toBe("folgt");
  });

  it("detached: Primär does not follow and stays; plugged again it follows", async () => {
    const s = await sesio("provo-geloest", { dateien: [] }, [BEISPIELE_ELIR]);
    dateienMeti(s, [BLAUES]);
    await folgo.folgi("dateien", s.valoro);
    await s.atendi();
    expect(s.log).toEqual([statoLog({ folgt: true })]);
    expect((await farboDe("provo-geloest", "primaer")).stato).toBe("startwert");
    expect(folgo.folgoDe(s.valoro)?.linio).toBe("folgt-nicht");
    s.geloest.splice(0);
    await folgo.folgi("gesteckt", s.valoro);
    await s.atendi();
    expect(s.log.slice(1)).toEqual([
      farbeLog("primaer", BLAU),
      statoLog({ folgt: true, zuletzt: BLAU }),
    ]);
    expect(await farboDe("provo-geloest", "primaer")).toEqual({
      wert: BLAU,
      stato: "aus-material",
    });
  });

  it("a lead colour changed elsewhere (Studio, colour node) ends following", async () => {
    const s = await sesio("provo-studio", { dateien: [] });
    dateienMeti(s, [BLAUES]);
    await folgo.folgi("dateien", s.valoro);
    await s.atendi();
    await vonHand("provo-studio", "primaer", STUDIO);
    // The context's Bildo is the one after the hand write (the shell reloads it).
    const nova = await sesio("provo-studio", s.valoro.inhaltDe("beispiele") ?? {});
    expect(folgo.folgoDe(nova.valoro)?.linio).toBe("folgt-nicht");
    dateienMeti(nova, [ROTES, BLAUES]);
    await folgo.folgi("dateien", nova.valoro);
    await nova.atendi();
    expect(nova.log).toEqual([statoLog({ folgt: false, zuletzt: BLAU })]);
    expect(await farboDe("provo-studio", "primaer")).toEqual({ wert: STUDIO, stato: "von-hand" });
  });

  it("„folgen lassen“ without a colourful colour: Primär stays; a later colourful image is followed", async () => {
    await vonHand("provo-grau", "primaer", HAND);
    const s = await sesio("provo-grau", { dateien: [GRAUES], primaer: { folgt: false } });
    await folgo.folgi("verlangt", s.valoro);
    await s.atendi();
    expect(s.log).toEqual([statoLog({ folgt: true, seit: HAND })]);
    expect(folgo.folgoDe(s.valoro)?.linio).toBe("keine-bunte");
    expect(await farboDe("provo-grau", "primaer")).toEqual({ wert: HAND, stato: "von-hand" });
    dateienMeti(s, [GRAUES, GRUENES]);
    await folgo.folgi("dateien", s.valoro);
    await s.atendi();
    expect(s.log.slice(1)).toEqual([
      farbeLog("primaer", GRUEN),
      statoLog({ folgt: true, zuletzt: GRUEN }),
    ]);
    expect(await farboDe("provo-grau", "primaer")).toEqual({ wert: GRUEN, stato: "aus-material" });
  });

  it("several runs at once write one after the other, never interleaved", async () => {
    const s = await sesio("provo-start", {
      dateien: [BLAUES],
      primaer: { folgt: true, zuletzt: ROT },
    });
    await Promise.all([folgo.folgi("dateien", s.valoro), folgo.folgi("dateien", s.valoro)]);
    await s.atendi();
    expect(s.log).toEqual([farbeLog("primaer", BLAU), statoLog({ folgt: true, zuletzt: BLAU })]);
  });
});

// ---------------------------------------------------------------------------------------------
// The sources

describe("Spec 056 T5: the sources of erkannt.tsx and folgo.ts", () => {
  const ohneKommentare = (kodo: string): string =>
    kodo
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/\s\/\/.*$/gm, "");
  const erkannt = readFileSync(ERKANNT_TSX, "utf8");
  const folgoKodo = readFileSync(FOLGO_TS, "utf8");

  it("carry no colour literal, not even in comments", () => {
    const literalo = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/i;
    expect([literalo.test(erkannt), literalo.test(folgoKodo)]).toEqual([false, false]);
  });

  it("erkannt.tsx takes every sentence from the shared constants and types none", () => {
    const importo =
      /import\s*\{([^}]*)\}\s*from\s*"@fundamento\/metiejo\/gestalten"/.exec(erkannt)?.[1] ?? "";
    for (const nomo of [
      "ERKANNT",
      "ALS_PRIMAER",
      "ALS_AKZENT",
      "PRIMAER_MARKE",
      "FARB_ARTOJ",
      "FOLGO_SAETZE",
      "FOLGEN_LASSEN",
    ])
      expect(importo, nomo).toMatch(new RegExp(`\\b${nomo}\\b`));
    const kodo = ohneKommentare(erkannt);
    const saetze = [
      ERKANNT,
      ALS_PRIMAER,
      ALS_AKZENT,
      PRIMAER_MARKE,
      FOLGEN_LASSEN,
      ...Object.values(FARB_ARTOJ),
      ...Object.values(FOLGO_SAETZE),
    ];
    for (const satz of saetze) {
      for (const form of [`"${satz}"`, `'${satz}'`, `\`${satz}\``, `>${satz}<`])
        expect(kodo.includes(form), form).toBe(false);
      if (satz.length > 12) expect(kodo.includes(satz), satz).toBe(false);
    }
  });

  it("erkannt.tsx: real buttons with nodrag, the swatch colour as a custom property from the data", () => {
    const kodo = ohneKommentare(erkannt);
    const offen = [...kodo.matchAll(/<(button|fm-butono)\b/g)];
    expect(offen.length).toBeGreaterThanOrEqual(3);
    for (const treffer of offen)
      expect(kodo.slice(treffer.index, treffer.index + 400), treffer[0]).toMatch(/NODRAG/);
    for (const treffer of kodo.matchAll(/<button\b/g))
      expect(kodo.slice(treffer.index, treffer.index + 400)).toMatch(/type="button"/);
    expect(kodo).toMatch(/"--nr-g-erkannt-farbo":\s*\w/);
    expect(kodo).toMatch(/var\(--nr-g-erkannt-farbo\)/);
    expect(kodo).toMatch(/\bfolgi\(\s*"verlangt"/);
    expect(kodo).toMatch(/\berkanntDe\b/);
  });

  it("folgo.ts imports at run time only the two aliases of the bundle", () => {
    const fonti = [...folgoKodo.matchAll(/^\s*import\s+(?!type\b)[\s\S]*?from\s+"([^"]+)";/gm)].map(
      (t) => t[1],
    );
    expect(new Set(fonti)).toEqual(
      new Set(["@fundamento/metiejo/enhavo", "@fundamento/metiejo/gestalten"]),
    );
  });
});
