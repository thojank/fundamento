// Spec 055 (MP-1b, T3 canvas, LNS-2.1): Neutral on the canvas. Without an own colour Neutral is
// derived from Primär: `herkunft: "primaer"`, „abgeleitet“ without a Tönung and „von Hand“ with one,
// and the Bildo carries the fixed edge Primär → Neutral (plan D-18) in Primär's colour. With an own
// colour (`neutral.farbe`) it is `herkunft: "eigene"`, „von Hand“, carries the colour as its value,
// its swatch follows the colour, and the fixed edge is gone. `kabloj` `neutral: null` drops the whole
// `neutral` of the effective Agordo (D-16). Over HTTP, `/api/leinwand` shows each change of
// `POST /api/marko/:name/leinwand {neutral: {farbe}}` at once, and no answer judges.

import type { Agordo } from "@fundamento/agordilo";
import { buildModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { gestaltenDe, paletrojDe, wirksamerAgordo } from "./grafeo-gestalten.js";
import {
  type Bildo,
  type BildoFarbo,
  type BildoLigo,
  type BildoPaletro,
  type Kabloj,
  kablojDe,
  type LeinwandSxangxo,
  ligoId,
  ligojKun,
  NELEGEBLA_SATZ,
  NEUTRAL_FARBO_ENIR,
} from "./grafeo-gestalten-sicht.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { type Bases, loadBases, startAgordo } from "./vorschau.js";

const FARBE = "#e8e2d6";
const FEST_ID = ligoId("farbo-primaer.el", NEUTRAL_FARBO_ENIR);

let bases: Bases;
let LEER: Agordo;

function bildoDe(agordo: Agordo, kabloj: Kabloj = {}): Bildo {
  const start = startAgordo(agordo.name, "leer", bases);
  const palettes = paletrojDe(wirksamerAgordo(agordo, start, kabloj), bases);
  return gestaltenDe(agordo, { start, kabloj, palettes, rev: 3 });
}

function farbo(bildo: Bildo, rolo: string): BildoFarbo {
  const found = bildo.nodoj.find((n) => n.id === `farbo-${rolo}`);
  if (found?.speco !== "farbo") throw new Error(`no colour node ${rolo}`);
  return found;
}

const festaj = (bildo: Bildo): BildoLigo[] => bildo.ligoj.filter((l) => l.fest === true);

/** The light step 100 of the neutral palette the derivation gives for an (effective) Agordo. */
function neutralCent(agordo: Agordo): string | undefined {
  return paletrojDe(agordo, bases)?.steps.find((s) => s.palette === "neutral" && s.step === "100")
    ?.hex;
}

beforeAll(() => {
  bases = loadBases();
  LEER = startAgordo("lumeto", "leer", bases);
});

describe("Spec 055 T3: Neutral derived from Primär (Abnahme 3, data)", () => {
  it("without farbe and Tönung: herkunft primaer, „abgeleitet“, no value, Tönung 0", () => {
    const n = farbo(bildoDe(LEER), "neutral");
    expect({
      herkunft: n.herkunft,
      stato: n.stato,
      wert: n.wert,
      toenung: n.toenung,
      elir: n.elir,
    }).toEqual({
      herkunft: "primaer",
      stato: "abgeleitet",
      wert: undefined,
      toenung: 0,
      elir: "mezuro",
    });
    expect(n.hex).toBe(neutralCent(LEER));
  });

  it("with a Tönung and without farbe: still herkunft primaer, now „von Hand“", () => {
    const n = farbo(bildoDe({ ...LEER, neutral: { toenung: 0.35 } }), "neutral");
    expect([n.herkunft, n.stato, n.wert, n.toenung]).toEqual([
      "primaer",
      "von-hand",
      undefined,
      0.35,
    ]);
  });

  it("carries exactly one fixed edge Primär → Neutral in Primär's colour (D-18)", () => {
    const faelle = [
      LEER,
      { ...LEER, neutral: { toenung: 0.35 } },
      { ...LEER, leitfarbe: "#f5c400" },
    ];
    const befunde: string[] = [];
    for (const agordo of faelle) {
      const bildo = bildoDe(agordo);
      const erwartet: BildoLigo = {
        id: FEST_ID,
        de: "farbo-primaer.el",
        al: NEUTRAL_FARBO_ENIR,
        art: "farbo",
        hex: farbo(bildo, "primaer").hex,
        fest: true,
      };
      const ist = festaj(bildo);
      if (JSON.stringify(ist) !== JSON.stringify([erwartet]))
        befunde.push(`${agordo.leitfarbe}/${agordo.neutral?.toenung}: ${JSON.stringify(ist)}`);
    }
    expect(befunde).toEqual([]);
  });

  it("the fixed edge survives the session and is no entry of kabloj", () => {
    const bildo = bildoDe(LEER);
    const ligoj = ligojKun({ geloest: [], gezogen: [], nodoj: [] }, bildo);
    expect(ligoj.filter((l) => l.fest === true).map((l) => l.id)).toEqual([FEST_ID]);
    const nodoj = bildo.nodoj.map((n) =>
      n.speco === "farbo" ? { id: n.id, stato: n.stato } : { id: n.id },
    );
    expect(kablojDe(ligoj, nodoj)).toEqual({});
  });
});

describe("Spec 055 T3: an own Neutral colour (Abnahme 3, data)", () => {
  it("with farbe: herkunft eigene, the value, „von Hand“, no fixed edge", () => {
    const bildo = bildoDe({ ...LEER, neutral: { toenung: 1, farbe: FARBE } });
    const n = farbo(bildo, "neutral");
    expect([n.herkunft, n.wert, n.stato, n.toenung]).toEqual(["eigene", FARBE, "von-hand", 1]);
    expect(festaj(bildo)).toEqual([]);
    expect(bildo.ligoj.some((l) => l.al === NEUTRAL_FARBO_ENIR)).toBe(false);
  });

  it("the swatch follows the own colour: step 100 of the palette derived from it", () => {
    const eigene = { ...LEER, neutral: { toenung: 1, farbe: FARBE } };
    const rot = { ...LEER, neutral: { toenung: 1, farbe: "#ff0000" } };
    const hexe = [LEER, eigene, rot].map((a) => farbo(bildoDe(a), "neutral").hex);
    expect(hexe).toEqual([LEER, eigene, rot].map(neutralCent));
    expect(new Set(hexe).size).toBe(3);
  });

  it("with farbe and no Tönung the node shows the effective Tönung 1", () => {
    const n = farbo(bildoDe({ ...LEER, neutral: { farbe: FARBE } }), "neutral");
    expect([n.herkunft, n.stato, n.toenung]).toEqual(["eigene", "von-hand", 1]);
  });

  it("the Palette's neutral row is fed by Neutral in both states", () => {
    const vico = (agordo: Agordo) =>
      (bildoDe(agordo).nodoj.find((n) => n.speco === "paletro") as BildoPaletro).vicoj.find(
        (v) => v.rolo === "neutral",
      );
    expect([
      vico(LEER)?.fonto,
      vico({ ...LEER, neutral: { toenung: 1, farbe: FARBE } })?.fonto,
    ]).toEqual(["neutral", "neutral"]);
  });

  it("the canvas change type takes { neutral: { farbe } }", () => {
    const sxangxoj: LeinwandSxangxo[] = [
      { neutral: { farbe: FARBE } },
      { neutral: { farbe: null } },
    ];
    expect(sxangxoj).toHaveLength(2);
  });
});

describe("Spec 055 D-16: kabloj neutral: null drops the whole neutral", () => {
  it("drops Tönung and farbe; neutral: neutral keeps both", () => {
    const start = startAgordo(LEER.name, "leer", bases);
    const mit = { ...LEER, neutral: { toenung: 0.5, farbe: FARBE } } as Agordo;
    const geloest = wirksamerAgordo(mit, start, { neutral: null });
    expect("neutral" in geloest).toBe(false);
    expect(geloest).toEqual(LEER);
    expect(wirksamerAgordo(mit, start, { neutral: "neutral" })).toEqual(mit);
    // Without farbe the result is the same as dropping only the Tönung (054).
    expect(
      wirksamerAgordo({ ...LEER, neutral: { toenung: 0.5 } }, start, { neutral: null }),
    ).toEqual(LEER);
  });

  it("the detached row derives grey, not the own colour", () => {
    const mit = { ...LEER, neutral: { toenung: 1, farbe: "#ff0000" } } as Agordo;
    const bildo = bildoDe(mit, { neutral: null });
    const vico = (bildo.nodoj.find((n) => n.speco === "paletro") as BildoPaletro).vicoj.find(
      (v) => v.rolo === "neutral",
    );
    expect(vico?.stufoj.find((s) => s.stufo === "100")?.hex).toBe(neutralCent(LEER));
  });
});

// ---------------------------------------------------------------------------------------------
// Over HTTP

const text = (body: Buffer): string => body.toString("utf8");

/** The words of a judgment: every Regulo's name, id, statement and kialo, and the report's marks. */
function urteilsWoerter(): string[] {
  const modelo = buildModelo(loadBases().structure.files).modelo;
  return [
    ...modelo.reguloj
      .flatMap((r) => [r.name, r.id, r.statement, r.kialo])
      .filter((wort): wort is string => typeof wort === "string" && wort !== ""),
    "probleme",
    "betroffen",
    "Problem",
    "Prüfung",
    "Betroffen",
    "Vorschlag",
    "raporto",
  ];
}

describe("Spec 055 T3: /api/leinwand follows POST {neutral: {farbe}} without a server reload", () => {
  let server: TestServilo;
  const antworten: string[] = [];
  const NAME = "neutralejo";

  const frage = async (method: "GET" | "POST", path: string, korpo?: unknown) => {
    const antwort = await server.anfrage(
      method,
      path,
      korpo === undefined ? undefined : JSON.stringify(korpo),
    );
    antworten.push(`${antwort.status} ${text(antwort.body)}`);
    return { status: antwort.status, json: JSON.parse(text(antwort.body)) as unknown };
  };
  const leinwand = async (): Promise<Bildo> => {
    const { status, json } = await frage("GET", `/api/leinwand?marko=${NAME}`);
    expect(status).toBe(200);
    return json as Bildo;
  };
  const schreiben = (korpo: unknown) => frage("POST", `/api/marko/${NAME}/leinwand`, korpo);
  const stand = (bildo: Bildo) => {
    const n = farbo(bildo, "neutral");
    return {
      herkunft: n.herkunft,
      stato: n.stato,
      wert: n.wert ?? null,
      toenung: n.toenung,
      fest: festaj(bildo).map((l) => [l.id, l.hex]),
    };
  };

  beforeAll(async () => {
    server = await testServilo("grafeo-neutral-055-");
    await markeAnlegen(server, NAME, "leer");
  });

  afterAll(async () => {
    await server?.close();
  });

  it("sets, shows, takes back the own colour; a pure red and a hard yellow are saved", async () => {
    const vorher = await leinwand();
    const primaerHex = farbo(vorher, "primaer").hex;
    expect(stand(vorher)).toEqual({
      herkunft: "primaer",
      stato: "abgeleitet",
      wert: null,
      toenung: 0,
      fest: [[FEST_ID, primaerHex]],
    });

    expect((await schreiben({ neutral: { farbe: FARBE } })).status).toBe(200);
    const eigene = await leinwand();
    expect(eigene.rev).toBe(vorher.rev + 1);
    expect(stand(eigene)).toEqual({
      herkunft: "eigene",
      stato: "von-hand",
      wert: FARBE,
      toenung: 1,
      fest: [],
    });
    expect(farbo(eigene, "neutral").hex).toBe(
      neutralCent({ ...LEER, name: NAME, neutral: { toenung: 1, farbe: FARBE } }),
    );

    expect((await schreiben({ neutral: { farbe: null } })).status).toBe(200);
    // Back to the derivation: the edge returns, the Tönung 1 written with the colour stays.
    expect(stand(await leinwand())).toEqual({
      herkunft: "primaer",
      stato: "von-hand",
      wert: null,
      toenung: 1,
      fest: [[FEST_ID, primaerHex]],
    });

    expect((await schreiben({ neutral: { farbe: "#ff0000" } })).status).toBe(200);
    expect((await schreiben({ farbe: { rolle: "primaer", wert: "#f5c400" } })).status).toBe(200);
    const bunt = await leinwand();
    expect([farbo(bunt, "neutral").wert, farbo(bunt, "primaer").wert]).toEqual([
      "#ff0000",
      "#f5c400",
    ]);
    expect(festaj(bunt)).toEqual([]);
  });

  it("refuses an unreadable colour with the calm sentence at the field and changes nothing", async () => {
    const vorher = await leinwand();
    const antwort = await schreiben({ neutral: { farbe: "blau" } });
    expect([antwort.status, antwort.json]).toEqual([
      422,
      { feld: "neutral.farbe", satz: NELEGEBLA_SATZ },
    ]);
    expect(await leinwand()).toEqual(vorher);
  });

  it("no answer names a rule or a problem count", () => {
    const woerter = urteilsWoerter();
    const funde = antworten.flatMap((a) =>
      woerter.filter((w) => a.includes(w)).map((w) => `${w} in ${a.slice(0, 60)}`),
    );
    expect(funde).toEqual([]);
    expect(antworten.length).toBeGreaterThan(5);
  });
});
