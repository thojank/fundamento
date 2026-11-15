// Spec 055 T3 (LNS-1.2): the own Neutral colour on the canvas's write path
// `POST /api/marko/:name/leinwand` with `{ neutral: { farbe } }`. And Abnahme 4 for the Agordoj a
// brand starts with (`startAgordo`): they derive byte for byte as on main 642ab220 (the checksums
// were taken there, before any change; the other Agordoj of the repo are pinned in agordilo's
// neutralfarbe-055.test.ts).

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { type Agordo, deriveAspekto, readAgordo } from "@fundamento/agordilo";
import { buildModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { type Bildo, NELEGEBLA_SATZ } from "./grafeo-gestalten-sicht.js";
import { leinwandSchreiben, paletroStufojDe } from "./grafeo-skribo.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { loadBases, startAgordo } from "./vorschau.js";

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

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");

/** The files of a package as one text: path and content, in the derivation's sorted order. */
const filesText = (files: Record<string, string>): string =>
  Object.entries(files)
    .map(([path, text]) => `${path}\u0000${text}\u0000`)
    .join("");

/** The canvas's own Agordo (the Belegung of the Leinwand), beside the start Agordoj. */
const BELEGUNG_DOSIERO = new URL(
  "../../nodredaktilo/belegung/leinwand.agordo.json",
  import.meta.url,
);

/**
 * Checksums at 642ab220 (taken before any change of LNS-1.2) of `startAgordo("provo", basis)` and
 * of the canvas's own Agordo: the derived palettes as JSON and every file of the derived package.
 */
const PINNED_642AB220: Record<string, { palettes: string; paket: string }> = {
  "nodredaktilo/belegung/leinwand.agordo.json": {
    palettes: "ca56e0d320e77fdfe628b8b973ee0fde66ac81c308230bc4d4713b6787ea2924",
    paket: "94837576a7595acf337707590b82ea036d59fe60a3719aaa4fb77b08ca7f4c42",
  },
  leer: {
    palettes: "a1c05ce8c610f299888a58bfc936b98cfa4cb789eee8f2510894b27b835b253a",
    paket: "9ad42a4f8cf301a89ba7f23d4424284f04cd89beaa04aede41fa69f801bc1290",
  },
  // Today's komuna leads with a grey: the palettes of the canvas's own Agordo (toenung 0).
  komuna: {
    palettes: "ca56e0d320e77fdfe628b8b973ee0fde66ac81c308230bc4d4713b6787ea2924",
    paket: "c8d417b34dcf0ad4b64e66a8c673ebb48506ae50b41bfb176a9b1ba02571618f",
  },
  // The palettes of `leer` (same lead colour); the fonts make the package differ.
  "komuna-0-2": {
    palettes: "a1c05ce8c610f299888a58bfc936b98cfa4cb789eee8f2510894b27b835b253a",
    paket: "2af5f59139177f416d89ae76a5d9d8f311ff221260a5bc74b64b42e9fcd35514",
  },
};

describe("Spec 055 Abnahme 4: the start Agordoj and the canvas's own derive as on 642ab220", () => {
  const bases = loadBases();
  const pruefsummen = (agordo: Agordo) => {
    const derivation = deriveAspekto(agordo, bases.structure, bases.calibration);
    return {
      palettes: sha256(JSON.stringify(derivation.palettes)),
      paket: sha256(filesText(derivation.files)),
    };
  };

  it.each(["leer", "komuna", "komuna-0-2"] as const)("startAgordo(provo, %s)", (basis) => {
    expect({ [basis]: pruefsummen(startAgordo("provo", basis, bases)) }).toEqual({
      [basis]: PINNED_642AB220[basis],
    });
  });

  it("nodredaktilo/belegung/leinwand.agordo.json", () => {
    const { agordo, issues } = readAgordo(JSON.parse(readFileSync(BELEGUNG_DOSIERO, "utf8")));
    expect(issues).toEqual([]);
    if (agordo === undefined) throw new Error("the Belegung's Agordo does not read");
    const label = "nodredaktilo/belegung/leinwand.agordo.json";
    expect({ [label]: pruefsummen(agordo) }).toEqual({ [label]: PINNED_642AB220[label] });
  });
});

// ---------------------------------------------------------------------------------------------
// The write path

const FARBE = "#e8e2d6";
/** A minimal valid Agordo of an invented brand. */
const LUMO: Agordo = { name: "lumo", leitfarbe: "#375479" } as Agordo;

const text = (body: Buffer): string => body.toString("utf8");
const json = (body: Buffer): unknown => JSON.parse(text(body));

describe("Spec 055 T3: { neutral: { farbe } } on the pure write path (grafeo-skribo.ts)", () => {
  const stufoj = paletroStufojDe(loadBases().calibration);
  const neutralNach = (agordo: Agordo, korpo: unknown) => {
    const rezulto = leinwandSchreiben(agordo, korpo, stufoj);
    return rezulto.speco === "ok" ? { neutral: rezulto.agordo.neutral ?? null } : rezulto;
  };

  it("sets the colour as typed (trimmed) and adds Tönung 1 only when there is none", () => {
    expect({
      ohne: neutralNach(LUMO, { neutral: { farbe: FARBE } }),
      mitToenung: neutralNach({ ...LUMO, neutral: { toenung: 0.3 } } as Agordo, {
        neutral: { farbe: FARBE },
      }),
      raender: neutralNach(LUMO, { neutral: { farbe: `  ${FARBE} ` } }),
      oklch: neutralNach(LUMO, { neutral: { farbe: "oklch(0.92 0.02 80)" } }),
      rot: neutralNach(LUMO, { neutral: { farbe: "#ff0000" } }),
      nullToenung: neutralNach({ ...LUMO, neutral: { toenung: 0 } } as Agordo, {
        neutral: { farbe: FARBE },
      }),
    }).toEqual({
      ohne: { neutral: { toenung: 1, farbe: FARBE } },
      mitToenung: { neutral: { toenung: 0.3, farbe: FARBE } },
      raender: { neutral: { toenung: 1, farbe: FARBE } },
      oklch: { neutral: { toenung: 1, farbe: "oklch(0.92 0.02 80)" } },
      rot: { neutral: { toenung: 1, farbe: "#ff0000" } },
      nullToenung: { neutral: { toenung: 0, farbe: FARBE } },
    });
  });

  it("removes the colour with null, keeps the Tönung, and drops an empty neutral", () => {
    expect({
      mitToenung: neutralNach({ ...LUMO, neutral: { toenung: 0.3, farbe: FARBE } } as Agordo, {
        neutral: { farbe: null },
      }),
      nurFarbe: neutralNach({ ...LUMO, neutral: { farbe: FARBE } } as Agordo, {
        neutral: { farbe: null },
      }),
      ohneFarbe: neutralNach(LUMO, { neutral: { farbe: null } }),
    }).toEqual({
      mitToenung: { neutral: { toenung: 0.3 } },
      nurFarbe: { neutral: null },
      ohneFarbe: { neutral: null },
    });
  });

  it("refuses an unreadable colour with the field neutral.farbe and the calm sentence", () => {
    const abweichungen: string[] = [];
    for (const wert of ["blau", "#12", "oklch(x)", "", "oklch(1.5 0.1 20)", "rgb(1,2,3)"]) {
      const rezulto = leinwandSchreiben(LUMO, { neutral: { farbe: wert } }, stufoj);
      if (
        JSON.stringify(rezulto) !==
        JSON.stringify({ speco: "rifuzita", feld: "neutral.farbe", satz: NELEGEBLA_SATZ })
      )
        abweichungen.push(`${wert} → ${JSON.stringify(rezulto)}`);
    }
    expect(abweichungen).toEqual([]);
  });

  it("calls a neutral body of another shape malformed", () => {
    const faelle: unknown[] = [
      { neutral: {} },
      { neutral: null },
      { neutral: "#e8e2d6" },
      { neutral: { farbe: 1 } },
      { neutral: { farbe: FARBE, toenung: 0.5 } },
      { neutral: { farbe: FARBE }, toenung: 0.5 },
    ];
    const ist = faelle.map((korpo) => leinwandSchreiben(LUMO, korpo, stufoj).speco);
    expect(ist).toEqual(faelle.map(() => "malformita"));
  });
});

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

describe("Spec 055 T3: POST /api/marko/:name/leinwand with { neutral: { farbe } } on a server", () => {
  let server: TestServilo;
  let pruefungen: string[];
  const antworten: string[] = [];

  const schreiben = async (name: string, korpo: unknown) => {
    const antwort = await server.anfrage(
      "POST",
      `/api/marko/${name}/leinwand`,
      JSON.stringify(korpo),
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
  const revDe = async (name: string): Promise<number> =>
    (json((await server.anfrage("GET", `/api/leinwand?marko=${name}`)).body) as Bildo).rev;

  beforeAll(async () => {
    pruefungen = [];
    server = await testServilo("neutral-skribo-055-", {
      pruefTor: async (name) => {
        pruefungen.push(name);
      },
    });
    for (const name of ["neutralo", "toenungo", "nelegebla"])
      await markeAnlegen(server, name, "leer");
    zaehler.checkDraft = 0;
    pruefungen.length = 0;
  });

  afterAll(async () => {
    await server?.close();
  });

  it("saves the own colour: 200 {rev, gespeichert}, rev+1, Tönung 1 added; null takes it back", async () => {
    const revVorher = await revDe("neutralo");
    const antwort = await schreiben("neutralo", { neutral: { farbe: FARBE } });
    expect(antwort.status).toBe(200);
    const korpo = json(antwort.body) as { rev: number; gespeichert: string };
    expect(Object.keys(korpo).sort()).toEqual(["gespeichert", "rev"]);
    expect(korpo.rev).toBe(revVorher + 1);
    expect(await revDe("neutralo")).toBe(korpo.rev);
    expect(entwurfDe("neutralo").neutral).toEqual({ toenung: 1, farbe: FARBE });

    const zurueck = await schreiben("neutralo", { neutral: { farbe: null } });
    expect(zurueck.status).toBe(200);
    expect((json(zurueck.body) as { rev: number }).rev).toBe(korpo.rev + 1);
    expect(entwurfDe("neutralo").neutral).toEqual({ toenung: 1 });
  });

  it("keeps a Tönung set before, and takes a pure red (Abnahme 8)", async () => {
    expect((await schreiben("toenungo", { toenung: 0.3 })).status).toBe(200);
    expect((await schreiben("toenungo", { neutral: { farbe: FARBE } })).status).toBe(200);
    expect(entwurfDe("toenungo").neutral).toEqual({ toenung: 0.3, farbe: FARBE });
    expect((await schreiben("toenungo", { neutral: { farbe: "#ff0000" } })).status).toBe(200);
    expect(entwurfDe("toenungo").neutral).toEqual({ toenung: 0.3, farbe: "#ff0000" });
  });

  it("does not save an unreadable colour: 422 {feld: neutral.farbe, satz}, draft and rev unchanged", async () => {
    const vorher = { datei: entwurfDatei("nelegebla"), rev: await revDe("nelegebla") };
    const abweichungen: string[] = [];
    for (const wert of ["blau", "#12"]) {
      const antwort = await schreiben("nelegebla", { neutral: { farbe: wert } });
      const ist = { status: antwort.status, korpo: json(antwort.body) };
      if (
        JSON.stringify(ist) !==
        JSON.stringify({ status: 422, korpo: { feld: "neutral.farbe", satz: NELEGEBLA_SATZ } })
      )
        abweichungen.push(`${wert} → ${JSON.stringify(ist)}`);
    }
    expect(abweichungen).toEqual([]);
    expect({ datei: entwurfDatei("nelegebla"), rev: await revDe("nelegebla") }).toEqual(vorher);
  });

  it("answers 400 for a neutral body of another shape", async () => {
    const ist = [];
    for (const korpo of [{ neutral: { farbe: 1 } }, { neutral: {} }])
      ist.push((await schreiben("nelegebla", korpo)).status);
    expect(ist).toEqual([400, 400]);
  });

  it("never judges: no check, no checkDraft, no 409, no rule words in any answer", async () => {
    expect(pruefungen).toEqual([]);
    expect(zaehler.checkDraft).toBe(0);
    expect(antworten.length).toBeGreaterThan(8);
    const woerter = urteilsWoerter();
    const befunde: string[] = [];
    for (const antwort of antworten) {
      if (antwort.startsWith("409")) befunde.push(`409: ${antwort}`);
      for (const wort of woerter) if (antwort.includes(wort)) befunde.push(`${wort}: ${antwort}`);
      if (/^(200|422) /.test(antwort) && antwort.includes("issues")) befunde.push(antwort);
    }
    expect(befunde).toEqual([]);
  });
});
