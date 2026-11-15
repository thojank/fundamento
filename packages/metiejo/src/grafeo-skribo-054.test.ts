// Spec 054 T4 (MPFG-3.1): the canvas's own write path `POST /api/marko/:name/leinwand`. It reads one
// change (a colour of a node, the Tönung, or a palette step for light or dark), refuses only what is
// no valid Agordo or no readable colour (422 `{feld, satz}`, the draft and its rev stay), and writes
// everything else through `setDraft` – never a check, never a rule, never a 409 (E-1, E-6). The pure
// part (`grafeo-skribo.ts`) is tested beside the route; the route runs on a server of its own with
// counters on the check's gate (`pruefTor`) and on `checkDraft`.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { type Agordo, readAgordo } from "@fundamento/agordilo";
import { buildModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { readKroniko } from "./asistanto/kroniko.js";
import {
  type Bildo,
  type BildoFarbo,
  type BildoPaletro,
  NELEGEBLA_SATZ,
} from "./grafeo-gestalten-sicht.js";
import {
  dtcgDe,
  farboHex,
  leinwandSchreiben,
  NEVALIDA_SATZ,
  PRIMAER_SATZ,
  paletroStufojDe,
  SCHEMA_SATZ,
  STUFO_SATZ,
  TOENUNG_SATZ,
} from "./grafeo-skribo.js";
import { patched } from "./servilo.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { loadBases } from "./vorschau.js";

// A counter on every derivation with checks (`checkDraft`): the write path must never call it.
const zaehler = vi.hoisted(() => ({ checkDraft: 0 }));
// The factory runs when the module is first imported, not while Vitest collects; it chains with
// `then` so no `await` stands in a module-level statement (modelo `ci/test-setup.test.ts`).
vi.mock("./vorschau.js", (original) =>
  original<typeof import("./vorschau.js")>().then((echt) => ({
    ...echt,
    checkDraft: (...args: Parameters<typeof echt.checkDraft>) => {
      zaehler.checkDraft++;
      return echt.checkDraft(...args);
    },
  })),
);

const text = (body: Buffer): string => body.toString("utf8");
const json = (body: Buffer): unknown => JSON.parse(text(body));

/** A minimal valid Agordo of an invented brand. */
const LUMO: Agordo = { name: "lumo", leitfarbe: "#375479" } as Agordo;

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

describe("Spec 054 T4: the pure write path of the canvas (grafeo-skribo.ts)", () => {
  const stufoj = paletroStufojDe(loadBases().calibration);

  it("reads hex 3/6 and oklch(L C H) as #rrggbb and refuses everything else (D-4)", () => {
    expect({
      lang: farboHex("#F5C400"),
      kurz: farboHex("#abc"),
      oklch: farboHex("oklch(0.7 0.1 200)"),
      prozent: farboHex("oklch(70% 0.1 200)"),
      raender: farboHex("  #f5c400 "),
    }).toEqual({
      lang: "#f5c400",
      kurz: "#aabbcc",
      oklch: expect.stringMatching(/^#[0-9a-f]{6}$/),
      prozent: farboHex("oklch(0.7 0.1 200)"),
      raender: "#f5c400",
    });
    const unlesbar = ["#12", "blau", "oklch(x)", "", "oklch(1.5 0.1 20)", "#f5c40g", "rgb(1,2,3)"];
    expect(unlesbar.filter((wert) => farboHex(wert) !== undefined)).toEqual([]);
    expect(dtcgDe("#aabbcc")).toEqual({
      colorSpace: "srgb",
      components: [0.6667, 0.7333, 0.8],
      hex: "#aabbcc",
    });
  });

  it("knows the steps each palette has: the calibration's, the Zweitfarbe only ZWEITFARBE_STEPS", () => {
    expect(stufoj.get("accent")?.has("700")).toBe(true);
    expect(stufoj.get("accent")?.has("25")).toBe(true);
    expect(stufoj.get("sekundo")?.has("700")).toBe(true);
    expect(stufoj.get("sekundo")?.has("25")).toBe(false);
    expect(stufoj.get("sekundo")?.has("975")).toBe(false);
    expect([...stufoj.keys()].sort()).toEqual(
      ["accent", "danger", "info", "neutral", "sekundo", "success", "warning"].sort(),
    );
  });

  it("maps the colour changes exactly as `patched` does (Primär, Akzent, Funktionsfarbe)", () => {
    const mitAllem = {
      ...LUMO,
      zweitfarbe: { farbe: "#17b3a8", herkunft: { quelle: "bild", merkmal: "Logo" } },
      zusatzfarben: { success: "#2e8b57" },
    } as Agordo;
    const faelle: [unknown, Record<string, unknown>][] = [
      [{ farbe: { rolle: "primaer", wert: "#f5c400" } }, { leitfarbe: "#f5c400" }],
      [{ farbe: { rolle: "akzent", wert: "#c6f135" } }, { zweitfarbe: { farbe: "#c6f135" } }],
      [{ farbe: { rolle: "akzent", wert: null } }, { zweitfarbe: null }],
      [{ farbe: { rolle: "warning", wert: "#d99a00" } }, { zusatzfarben: { warning: "#d99a00" } }],
      [{ farbe: { rolle: "success", wert: null } }, { zusatzfarben: { success: null } }],
      [{ toenung: 0.35 }, { neutral: { toenung: 0.35 } }],
    ];
    const abweichungen: string[] = [];
    for (const [korpo, patch] of faelle) {
      const rezulto = leinwandSchreiben(mitAllem, korpo, stufoj);
      const erwartet = patched(mitAllem, patch);
      if (rezulto.speco !== "ok" || JSON.stringify(rezulto.agordo) !== JSON.stringify(erwartet))
        abweichungen.push(`${JSON.stringify(korpo)} → ${JSON.stringify(rezulto)}`);
    }
    expect(abweichungen).toEqual([]);
  });

  it("drops herkunft when the Zweitfarbe is written, and an empty zusatzfarben group", () => {
    const mitHerkunft = {
      ...LUMO,
      zweitfarbe: { farbe: "#17b3a8", herkunft: { quelle: "bild", merkmal: "Logo" } },
      zusatzfarben: { info: "#3366cc" },
    } as Agordo;
    const akzent = leinwandSchreiben(
      mitHerkunft,
      { farbe: { rolle: "akzent", wert: "#c6f135" } },
      stufoj,
    );
    const info = leinwandSchreiben(mitHerkunft, { farbe: { rolle: "info", wert: null } }, stufoj);
    expect(akzent.speco === "ok" ? akzent.agordo.zweitfarbe : undefined).toEqual({
      farbe: "#c6f135",
    });
    expect(info.speco === "ok" ? "zusatzfarben" in info.agordo : undefined).toBe(false);
  });

  it("writes a light step as a DTCG value and keeps modoj; null removes wert and alias only (AK-11)", () => {
    const token = "color.palette.accent.500";
    const vorher = {
      ...LUMO,
      festgelegt: {
        [token]: {
          alias: "color.palette.neutral.500",
          modoj: { "color-scheme=dark": { wert: dtcgDe("#112233") } },
        },
      },
    } as Agordo;
    const hell = leinwandSchreiben(vorher, { stufe: { token, wert: "#abc" } }, stufoj);
    expect(hell.speco === "ok" ? hell.agordo.festgelegt?.[token] : hell).toEqual({
      modoj: { "color-scheme=dark": { wert: dtcgDe("#112233") } },
      wert: dtcgDe("#aabbcc"),
    });
    const zurueck = leinwandSchreiben(
      hell.speco === "ok" ? hell.agordo : vorher,
      { stufe: { token, wert: null, schema: "hell" } },
      stufoj,
    );
    expect(zurueck.speco === "ok" ? zurueck.agordo.festgelegt?.[token] : zurueck).toEqual({
      modoj: { "color-scheme=dark": { wert: dtcgDe("#112233") } },
    });
    // An entry that is empty afterwards goes, and an empty festgelegt with it.
    const nurHell = leinwandSchreiben(LUMO, { stufe: { token, wert: "#abcdef" } }, stufoj);
    const leer = leinwandSchreiben(
      nurHell.speco === "ok" ? nurHell.agordo : LUMO,
      { stufe: { token, wert: null } },
      stufoj,
    );
    expect(leer.speco === "ok" ? leer.agordo : leer).toEqual(LUMO);
  });

  it("writes a dark step only under modoj and leaves wert; null removes only the dark value (AK-24)", () => {
    const token = "color.palette.neutral.900";
    const hell = leinwandSchreiben(LUMO, { stufe: { token, wert: "#101010" } }, stufoj);
    const basis = hell.speco === "ok" ? hell.agordo : LUMO;
    const dunkel = leinwandSchreiben(
      basis,
      { stufe: { token, wert: "oklch(0.3 0.02 250)", schema: "dunkel" } },
      stufoj,
    );
    const eintrag = dunkel.speco === "ok" ? dunkel.agordo.festgelegt?.[token] : undefined;
    expect(eintrag?.wert).toEqual(dtcgDe("#101010"));
    expect(eintrag?.modoj?.["color-scheme=dark"]).toEqual({
      wert: dtcgDe(farboHex("oklch(0.3 0.02 250)") ?? ""),
    });
    const ohneDunkel = leinwandSchreiben(
      dunkel.speco === "ok" ? dunkel.agordo : basis,
      { stufe: { token, wert: null, schema: "dunkel" } },
      stufoj,
    );
    expect(ohneDunkel.speco === "ok" ? ohneDunkel.agordo : ohneDunkel).toEqual(basis);
  });

  it("removes the Akzent and leaves its set steps in festgelegt (R-3)", () => {
    const token = "color.palette.sekundo.500";
    const vorher = {
      ...LUMO,
      zweitfarbe: { farbe: "#c6f135" },
      festgelegt: { [token]: { wert: dtcgDe("#334400") } },
    } as Agordo;
    const rezulto = leinwandSchreiben(vorher, { farbe: { rolle: "akzent", wert: null } }, stufoj);
    expect(rezulto.speco === "ok" ? rezulto.agordo : rezulto).toEqual({
      ...LUMO,
      festgelegt: { [token]: { wert: dtcgDe("#334400") } },
    });
  });

  it("refuses only unreadable values and an invalid Agordo, naming the field in a calm sentence", () => {
    const faelle: [unknown, { feld: string; satz: string }][] = [
      [
        { farbe: { rolle: "primaer", wert: "#12" } },
        { feld: "farbe.primaer", satz: NELEGEBLA_SATZ },
      ],
      [
        { farbe: { rolle: "primaer", wert: "blau" } },
        { feld: "farbe.primaer", satz: NELEGEBLA_SATZ },
      ],
      [
        { farbe: { rolle: "primaer", wert: "oklch(x)" } },
        { feld: "farbe.primaer", satz: NELEGEBLA_SATZ },
      ],
      [{ farbe: { rolle: "akzent", wert: "" } }, { feld: "farbe.akzent", satz: NELEGEBLA_SATZ }],
      [
        { farbe: { rolle: "danger", wert: "oklch(1.5 0.1 20)" } },
        { feld: "farbe.danger", satz: NELEGEBLA_SATZ },
      ],
      [{ farbe: { rolle: "primaer", wert: null } }, { feld: "farbe.primaer", satz: PRIMAER_SATZ }],
      [{ toenung: 1.5 }, { feld: "toenung", satz: TOENUNG_SATZ }],
      [{ toenung: -0.1 }, { feld: "toenung", satz: TOENUNG_SATZ }],
      [{ toenung: "viel" }, { feld: "toenung", satz: TOENUNG_SATZ }],
      [
        { stufe: { token: "color.palette.accent.500", wert: "blau" } },
        { feld: "stufe.color.palette.accent.500", satz: NELEGEBLA_SATZ },
      ],
      [
        { stufe: { token: "color.palette.accent.500", wert: "#123456", schema: "sepia" } },
        { feld: "stufe.color.palette.accent.500", satz: SCHEMA_SATZ },
      ],
      // B-3: steps the palette cannot have, and tokens that are no palette step.
      [
        { stufe: { token: "color.palette.sekundo.25", wert: "#123456" } },
        { feld: "stufe.color.palette.sekundo.25", satz: STUFO_SATZ },
      ],
      [
        { stufe: { token: "color.palette.accent.33", wert: "#123456" } },
        { feld: "stufe.color.palette.accent.33", satz: STUFO_SATZ },
      ],
      [
        { stufe: { token: "color.palette.fremda.500", wert: "#123456" } },
        { feld: "stufe.color.palette.fremda.500", satz: STUFO_SATZ },
      ],
      [
        { stufe: { token: "color.text.default", wert: null } },
        { feld: "stufe.color.text.default", satz: STUFO_SATZ },
      ],
    ];
    const abweichungen: string[] = [];
    for (const [korpo, erwartet] of faelle) {
      const rezulto = leinwandSchreiben(LUMO, korpo, stufoj);
      const ist =
        rezulto.speco === "rifuzita" ? { feld: rezulto.feld, satz: rezulto.satz } : rezulto;
      if (JSON.stringify(ist) !== JSON.stringify(erwartet))
        abweichungen.push(`${JSON.stringify(korpo)} → ${JSON.stringify(ist)}`);
    }
    expect(abweichungen).toEqual([]);
  });

  it("calls a body of another shape malformed (not exactly one known change)", () => {
    const faelle: unknown[] = [
      {},
      [],
      null,
      "farbe",
      { farbe: { rolle: "neutral", wert: "#123456" } },
      { farbe: { rolle: "primaer" } },
      { farbe: { rolle: "primaer", wert: 5 } },
      { farbe: { rolle: "primaer", wert: "#123456" }, toenung: 0.2 },
      { stufe: { wert: "#123456" } },
      { stufe: { token: "color.palette.accent.500", wert: 3 } },
      { anders: 1 },
    ];
    expect(
      faelle
        .map((korpo) => ({ korpo, speco: leinwandSchreiben(LUMO, korpo, stufoj).speco }))
        .filter(({ speco }) => speco !== "malformita"),
    ).toEqual([]);
  });

  it("states the bounds of the Tönung sentence as the schema has them", () => {
    const schema = JSON.parse(
      readFileSync(new URL("../../modelo/schema/modelo.schema.json", import.meta.url), "utf8"),
    ) as { $defs: { Agordo: { properties: { neutral: { properties: { toenung: object } } } } } };
    const { minimum, maximum } = schema.$defs.Agordo.properties.neutral.properties.toenung as {
      minimum: number;
      maximum: number;
    };
    expect(TOENUNG_SATZ).toBe(`Die Tönung ist eine Zahl von ${minimum} bis ${maximum}.`);
    expect(NEVALIDA_SATZ).not.toBe("");
  });
});

describe("Spec 054 T4: POST /api/marko/:name/leinwand on a server", () => {
  let server: TestServilo;
  let pruefungen: string[];
  const antworten: string[] = [];

  const schreiben = async (name: string, korpo: unknown | string) => {
    const antwort = await server.anfrage(
      "POST",
      `/api/marko/${name}/leinwand`,
      typeof korpo === "string" ? korpo : JSON.stringify(korpo),
    );
    antworten.push(`${antwort.status} ${text(antwort.body)}`);
    return antwort;
  };
  /** The draft on disk (`entwurf.json`); before the first change the brand's `agordo.json`. */
  const entwurfDatei = (name: string): string => {
    const entwurf = join(server.workdir, name, "entwurf.json");
    return readFileSync(
      existsSync(entwurf) ? entwurf : join(server.workdir, name, "agordo.json"),
      "utf8",
    );
  };
  const entwurfDe = (name: string): Agordo => {
    const { agordo } = readAgordo(JSON.parse(entwurfDatei(name)));
    if (agordo === undefined) throw new Error(`draft of ${name} does not read`);
    return agordo;
  };
  const bildoDe = async (name: string): Promise<Bildo> =>
    json((await server.anfrage("GET", `/api/leinwand?marko=${name}`)).body) as Bildo;
  const stufoDe = (bildo: Bildo, token: string) =>
    (bildo.nodoj.find((n) => n.speco === "paletro") as BildoPaletro | undefined)?.vicoj
      .flatMap((vico) => vico.stufoj)
      .find((stufo) => stufo.tokeno === token);

  beforeAll(async () => {
    pruefungen = [];
    server = await testServilo("grafeo-skribo-054-", {
      pruefTor: async (name) => {
        pruefungen.push(name);
      },
    });
    for (const name of ["gelbo", "nelegebla", "stufoj", "akzento", "funkcio", "toeno"])
      await markeAnlegen(server, name, "leer");
    zaehler.checkDraft = 0;
    pruefungen.length = 0;
  });

  afterAll(async () => {
    await server?.close();
  });

  it("saves a hard yellow as Primär: 200, rev+1, draft on disk, a Kroniko entry of the sliders (AK-3)", async () => {
    const revVorher = (await bildoDe("gelbo")).rev;
    const kronikoVorher = readKroniko(server.workdir, "gelbo").length;
    const antwort = await schreiben("gelbo", { farbe: { rolle: "primaer", wert: "#f5c400" } });
    expect(antwort.status).toBe(200);
    expect(antwort.contentType.startsWith("application/json")).toBe(true);
    const korpo = json(antwort.body) as { rev: number; gespeichert: string };
    expect(Object.keys(korpo).sort()).toEqual(["gespeichert", "rev"]);
    expect(korpo.rev).toBe(revVorher + 1);
    expect(Number.isNaN(Date.parse(korpo.gespeichert))).toBe(false);
    expect(entwurfDe("gelbo").leitfarbe).toBe("#f5c400");
    const neu = readKroniko(server.workdir, "gelbo").slice(kronikoVorher);
    expect(neu.length).toBeGreaterThan(0);
    expect(neu.map((e) => ({ ago: e.ago, fonto: e.fonto }))).toEqual(
      neu.map(() => ({ ago: "sxangxo", fonto: "regilo" })),
    );
    const bildo = await bildoDe("gelbo");
    const primaer = bildo.nodoj.find((n) => n.id === "farbo-primaer") as BildoFarbo;
    expect({ rev: bildo.rev, wert: primaer.wert, stato: primaer.stato }).toEqual({
      rev: korpo.rev,
      wert: "#f5c400",
      stato: "von-hand",
    });
  });

  it("does not save an unreadable value: 422 {feld, satz}, draft and rev unchanged (AK-4)", async () => {
    const vorher = { datei: entwurfDatei("nelegebla"), rev: (await bildoDe("nelegebla")).rev };
    const abweichungen: string[] = [];
    for (const [korpo, feld] of [
      [{ farbe: { rolle: "primaer", wert: "#12" } }, "farbe.primaer"],
      [{ farbe: { rolle: "primaer", wert: "blau" } }, "farbe.primaer"],
      [{ farbe: { rolle: "akzent", wert: "oklch(x)" } }, "farbe.akzent"],
      [{ farbe: { rolle: "warning", wert: "#12" } }, "farbe.warning"],
      [
        { stufe: { token: "color.palette.accent.500", wert: "blau" } },
        "stufe.color.palette.accent.500",
      ],
      [{ toenung: 2 }, "toenung"],
      [
        { stufe: { token: "color.palette.sekundo.25", wert: "#123456" } },
        "stufe.color.palette.sekundo.25",
      ],
    ] as const) {
      const antwort = await schreiben("nelegebla", korpo);
      const ist = { status: antwort.status, korpo: json(antwort.body) as Record<string, unknown> };
      if (
        ist.status !== 422 ||
        Object.keys(ist.korpo).sort().join() !== "feld,satz" ||
        ist.korpo.feld !== feld ||
        typeof ist.korpo.satz !== "string"
      )
        abweichungen.push(`${JSON.stringify(korpo)} → ${JSON.stringify(ist)}`);
    }
    expect(abweichungen).toEqual([]);
    expect({ datei: entwurfDatei("nelegebla"), rev: (await bildoDe("nelegebla")).rev }).toEqual(
      vorher,
    );
  });

  it("saves a step that breaks a contrast and shows it set; null gives it back (AK-12, AK-11)", async () => {
    const token = "color.palette.accent.700";
    const gelb = await schreiben("stufoj", { stufe: { token, wert: "#f5c400" } });
    expect(gelb.status).toBe(200);
    expect(entwurfDe("stufoj").festgelegt?.[token]).toEqual({ wert: dtcgDe("#f5c400") });
    expect(stufoDe(await bildoDe("stufoj"), token)).toMatchObject({
      hex: "#f5c400",
      gesetzt: true,
    });
    const zurueck = await schreiben("stufoj", { stufe: { token, wert: null, schema: "hell" } });
    expect(zurueck.status).toBe(200);
    expect(entwurfDe("stufoj").festgelegt).toBeUndefined();
    const abgeleitet = stufoDe(await bildoDe("stufoj"), token);
    expect(abgeleitet?.gesetzt).toBe(false);
    expect(abgeleitet?.hex).not.toBe("#f5c400");
  });

  it("stores oklch(…) and #abc steps as DTCG srgb values, visible as set in /api/leinwand (D-4)", async () => {
    const faelle = [
      { token: "color.palette.accent.300", wert: "oklch(0.8 0.1 250)" },
      { token: "color.palette.success.200", wert: "#abc" },
    ];
    for (const { token, wert } of faelle)
      expect((await schreiben("stufoj", { stufe: { token, wert } })).status).toBe(200);
    const bildo = await bildoDe("stufoj");
    const entwurf = entwurfDe("stufoj");
    expect(
      faelle.map(({ token, wert }) => ({
        gespeichert: entwurf.festgelegt?.[token],
        stufo: stufoDe(bildo, token),
        hex: farboHex(wert),
      })),
    ).toEqual(
      faelle.map(({ wert }) => ({
        gespeichert: { wert: dtcgDe(farboHex(wert) ?? "") },
        stufo: expect.objectContaining({ hex: farboHex(wert), gesetzt: true }),
        hex: expect.stringMatching(/^#[0-9a-f]{6}$/),
      })),
    );
    for (const { token } of faelle) await schreiben("stufoj", { stufe: { token, wert: null } });
  });

  it("writes dark separately: only modoj, wert stays; null removes only dark (AK-24)", async () => {
    const token = "color.palette.neutral.900";
    await schreiben("stufoj", { stufe: { token, wert: "#101010" } });
    const dunkel = await schreiben("stufoj", {
      stufe: { token, wert: "#e0e0e0", schema: "dunkel" },
    });
    expect(dunkel.status).toBe(200);
    expect(entwurfDe("stufoj").festgelegt?.[token]).toEqual({
      wert: dtcgDe("#101010"),
      modoj: { "color-scheme=dark": { wert: dtcgDe("#e0e0e0") } },
    });
    expect(stufoDe(await bildoDe("stufoj"), token)).toMatchObject({
      hex: "#101010",
      gesetzt: true,
      hexDunkel: "#e0e0e0",
      gesetztDunkel: true,
    });
    await schreiben("stufoj", { stufe: { token, wert: null, schema: "dunkel" } });
    expect(entwurfDe("stufoj").festgelegt?.[token]).toEqual({ wert: dtcgDe("#101010") });
    expect(stufoDe(await bildoDe("stufoj"), token)).toMatchObject({
      hex: "#101010",
      gesetzt: true,
      gesetztDunkel: false,
    });
    await schreiben("stufoj", { stufe: { token, wert: null } });
    expect(entwurfDe("stufoj").festgelegt).toBeUndefined();
  });

  it("sets and removes the Akzent; the Akzent steps set by hand stay (R-3)", async () => {
    const token = "color.palette.sekundo.500";
    expect(
      (await schreiben("akzento", { farbe: { rolle: "akzent", wert: "#c6f135" } })).status,
    ).toBe(200);
    expect((await schreiben("akzento", { stufe: { token, wert: "#334400" } })).status).toBe(200);
    expect(entwurfDe("akzento").zweitfarbe).toEqual({ farbe: "#c6f135" });
    expect((await schreiben("akzento", { farbe: { rolle: "akzent", wert: null } })).status).toBe(
      200,
    );
    const entwurf = entwurfDe("akzento");
    expect({ zweitfarbe: entwurf.zweitfarbe, festgelegt: entwurf.festgelegt }).toEqual({
      zweitfarbe: undefined,
      festgelegt: { [token]: { wert: dtcgDe("#334400") } },
    });
    const akzent = (await bildoDe("akzento")).nodoj.find((n) => n.id === "farbo-akzent");
    expect((akzent as BildoFarbo).stato).toBe("leer");
  });

  it("adds a Funktionsfarbe and removes it with null; sets the Tönung", async () => {
    expect(
      (await schreiben("funkcio", { farbe: { rolle: "warning", wert: "oklch(0.75 0.15 80)" } }))
        .status,
    ).toBe(200);
    expect(entwurfDe("funkcio").zusatzfarben).toEqual({ warning: "oklch(0.75 0.15 80)" });
    expect((await bildoDe("funkcio")).nodoj.some((n) => n.id === "farbo-warning")).toBe(true);
    expect((await schreiben("funkcio", { farbe: { rolle: "warning", wert: null } })).status).toBe(
      200,
    );
    expect(entwurfDe("funkcio").zusatzfarben).toBeUndefined();
    expect((await bildoDe("funkcio")).nodoj.some((n) => n.id === "farbo-warning")).toBe(false);
    expect((await schreiben("toeno", { toenung: 0.35 })).status).toBe(200);
    expect(entwurfDe("toeno").neutral).toEqual({ toenung: 0.35 });
    const neutral = (await bildoDe("toeno")).nodoj.find((n) => n.id === "farbo-neutral");
    expect((neutral as BildoFarbo).toenung).toBe(0.35);
  });

  it("answers 404 without the brand and 400 for a body that is no change", async () => {
    const faelle: [string, string, number][] = [
      ["nenia", JSON.stringify({ toenung: 0.2 }), 404],
      ["toeno", "kein json", 400],
      ["toeno", "[]", 400],
      [
        "toeno",
        JSON.stringify({ toenung: 0.2, farbe: { rolle: "primaer", wert: "#123456" } }),
        400,
      ],
      ["toeno", JSON.stringify({ farbe: { rolle: "neutral", wert: "#123456" } }), 400],
    ];
    const ist = [];
    for (const [name, korpo] of faelle) ist.push((await schreiben(name, korpo)).status);
    expect(ist).toEqual(faelle.map(([, , status]) => status));
  });

  it("never judges: no check, no checkDraft, no 409, no rule words in any answer (E-1, AK-9)", async () => {
    expect(pruefungen).toEqual([]);
    expect(zaehler.checkDraft).toBe(0);
    expect(antworten.length).toBeGreaterThan(20);
    const woerter = urteilsWoerter();
    const befunde: string[] = [];
    for (const antwort of antworten) {
      if (antwort.startsWith("409")) befunde.push(`409: ${antwort}`);
      for (const wort of woerter) if (antwort.includes(wort)) befunde.push(`${wort}: ${antwort}`);
      // Only the answers of a protocol error (400, 404) carry the usual `issues` of /api/marko/*.
      if (/^(200|422) /.test(antwort) && antwort.includes("issues")) befunde.push(antwort);
    }
    expect(befunde).toEqual([]);
  });
});
