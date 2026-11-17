// Spec 058 (MP-2c, T4, MAW-3.2, AK-14): the write key `{name}` of the canvas's write path. It
// writes the display name `etikedoj.marko` through the existing draft path (`fonto` „regilo“),
// trimmed; empty or equal to the identifier removes the field; a value that is no text is refused
// with its field and a calm sentence, as the other keys are. Identifier, folder and canvas address
// never change, and a Stand holds the name (it holds the Agordo). Invented brands only.

import { readdirSync } from "node:fs";
import { type Agordo, readAgordo, reglerOf } from "@fundamento/agordilo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readKroniko } from "./asistanto/kroniko.js";
import {
  feldDe,
  leinwandSchreiben,
  NEVALIDA_SATZ,
  paletroStufojDe,
  type SkriboKatalogo,
  type SkriboRezulto,
} from "./grafeo-skribo.js";
import { readMarko } from "./marko.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { readTiparoj } from "./tiparoj.js";
import { loadBases } from "./vorschau.js";

const LUMETO: Agordo = { name: "lumeto", leitfarbe: "#375479" } as Agordo;

let stufoj: ReturnType<typeof paletroStufojDe>;
let katalogo: SkriboKatalogo;

beforeAll(() => {
  const bases = loadBases();
  stufoj = paletroStufojDe(bases.calibration);
  katalogo = { tiparoj: readTiparoj().tiparoj, regler: reglerOf(bases.gestalt) };
});

const agordoDe = (rezulto: SkriboRezulto): Agordo => {
  if (rezulto.speco !== "ok") throw new Error(JSON.stringify(rezulto));
  return rezulto.agordo;
};

describe("Spec 058 T4: {name} on the pure write path (AK-14)", () => {
  it("writes the trimmed name into etikedoj.marko; everything else stays", () => {
    const a = agordoDe(leinwandSchreiben(LUMETO, { name: "  Lumeto Tee  " }, stufoj, katalogo));
    expect(a.etikedoj).toEqual({ marko: "Lumeto Tee" });
    expect(a.name).toBe("lumeto");
    expect({ ...a, etikedoj: undefined }).toEqual({ ...LUMETO, etikedoj: undefined });
    expect(readAgordo(a).agordo).toEqual(a);
  });

  it("keeps the other display names of etikedoj", () => {
    const mitPalette = {
      ...LUMETO,
      etikedoj: { marko: "Lumeto", "color.palette.accent": "Ozean" },
    } as Agordo;
    expect(
      agordoDe(leinwandSchreiben(mitPalette, { name: "Lumeto Neu" }, stufoj, katalogo)).etikedoj,
    ).toEqual({ marko: "Lumeto Neu", "color.palette.accent": "Ozean" });
    expect(
      agordoDe(leinwandSchreiben(mitPalette, { name: "" }, stufoj, katalogo)).etikedoj,
    ).toEqual({ "color.palette.accent": "Ozean" });
  });

  it("removes the field for an empty name, spaces only, or the identifier itself", () => {
    const mitNamo = { ...LUMETO, etikedoj: { marko: "Lumeto Tee" } } as Agordo;
    for (const name of ["", "   ", "lumeto", " lumeto "]) {
      const a = agordoDe(leinwandSchreiben(mitNamo, { name }, stufoj, katalogo));
      expect(a).toEqual(LUMETO);
      expect("etikedoj" in a).toBe(false);
    }
    // Without a name before, removing leaves the Agordo as it was.
    expect(agordoDe(leinwandSchreiben(LUMETO, { name: "" }, stufoj, katalogo))).toEqual(LUMETO);
  });

  it("refuses a name that is no text with its field and a calm sentence (422 on the route)", () => {
    for (const name of [null, 7, true, ["Lumeto"], { marko: "Lumeto" }]) {
      expect(leinwandSchreiben(LUMETO, { name }, stufoj, katalogo)).toEqual({
        speco: "rifuzita",
        feld: "name",
        satz: NEVALIDA_SATZ,
      });
    }
    expect(feldDe({ name: "Lumeto" })).toBe("name");
  });

  it("reads the key with and without the catalog alike; a second key stays malformed", () => {
    expect(leinwandSchreiben(LUMETO, { name: "Lumeto" }, stufoj)).toEqual(
      leinwandSchreiben(LUMETO, { name: "Lumeto" }, stufoj, katalogo),
    );
    const zwei = leinwandSchreiben(LUMETO, { name: "Lumeto", toenung: 0.5 }, stufoj, katalogo);
    expect(zwei.speco).toBe("malformita");
  });
});

describe("Spec 058 T4: POST /api/marko/:name/leinwand {name} on a server (AK-14)", () => {
  let server: TestServilo;
  const MARKO = "lumeto";

  const text = (b: Buffer): string => b.toString("utf8");
  const schreiben = (korpo: unknown, marko = MARKO) =>
    server.anfrage("POST", `/api/marko/${marko}/leinwand`, JSON.stringify(korpo));
  const entwurfDe = (marko = MARKO): Agordo => {
    const gelesen = readMarko(server.workdir, marko);
    if (gelesen === undefined) throw new Error(`no brand ${marko}`);
    return gelesen.draft;
  };
  const bildoDe = async (marko = MARKO) => {
    const a = await server.anfrage("GET", `/api/leinwand?marko=${marko}&stufe=58`);
    expect(a.status).toBe(200);
    return JSON.parse(text(a.body)) as {
      rev: number;
      marko: { name: string; etikedo: string };
    };
  };

  beforeAll(async () => {
    server = await testServilo("grafeo-skribo-058-");
    await markeAnlegen(server, MARKO, "leer");
    await markeAnlegen(server, "Lumeto Tee", "leer");
  });

  afterAll(async () => {
    await server?.close();
  });

  it("writes etikedoj.marko through the draft path; identifier, folder and address stay", async () => {
    const vorher = await bildoDe();
    const kronikoVorher = readKroniko(server.workdir, MARKO).length;
    const antwort = await schreiben({ name: " Lumeto Licht " });
    expect(antwort.status).toBe(200);
    const korpo = JSON.parse(text(antwort.body)) as { rev: number; gespeichert: string };
    expect(Object.keys(korpo).sort()).toEqual(["gespeichert", "rev"]);
    expect(korpo.rev).toBe(vorher.rev + 1);
    const entwurf = entwurfDe();
    expect(entwurf.etikedoj).toEqual({ marko: "Lumeto Licht" });
    expect(entwurf.name).toBe(MARKO);
    expect(readdirSync(server.workdir).sort()).toEqual(["lumeto", "lumeto-tee"]);
    const neu = readKroniko(server.workdir, MARKO).slice(kronikoVorher);
    // The display name is no facet, so `setDraft` writes no Kroniko entry for it (as the Studio's
    // own path); whatever it writes carries the canvas's `fonto`.
    expect(neu.map((e) => e.fonto)).toEqual(neu.map(() => "regilo"));
    const nachher = await bildoDe();
    expect(nachher.marko).toEqual({ ...vorher.marko, name: MARKO, etikedo: "Lumeto Licht" });
  });

  it("removes the field for an empty name and for the identifier; pill shows the identifier", async () => {
    expect((await schreiben({ name: "Lumeto Licht" })).status).toBe(200);
    expect((await schreiben({ name: "" })).status).toBe(200);
    expect(entwurfDe().etikedoj).toBeUndefined();
    expect((await bildoDe()).marko.etikedo).toBe(MARKO);
    expect((await schreiben({ name: "Lumeto Licht" })).status).toBe(200);
    expect((await schreiben({ name: "lumeto" })).status).toBe(200);
    expect(entwurfDe().etikedoj).toBeUndefined();
  });

  it("shows the earlier display name of a brand written with a name; writing it again keeps it", async () => {
    expect((await bildoDe("lumeto-tee")).marko).toEqual(
      expect.objectContaining({ name: "lumeto-tee", etikedo: "Lumeto Tee" }),
    );
    expect((await schreiben({ name: "lumeto-tee" }, "lumeto-tee")).status).toBe(200);
    expect(entwurfDe("lumeto-tee").etikedoj).toBeUndefined();
    expect(entwurfDe("lumeto-tee").name).toBe("lumeto-tee");
  });

  it("refuses a name that is no text: 422 {feld, satz}, draft and rev unchanged", async () => {
    const vorher = { entwurf: entwurfDe(), rev: (await bildoDe()).rev };
    for (const name of [null, 7, ["Lumeto"]]) {
      const antwort = await schreiben({ name });
      expect(antwort.status).toBe(422);
      expect(JSON.parse(text(antwort.body))).toEqual({ feld: "name", satz: NEVALIDA_SATZ });
    }
    expect({ entwurf: entwurfDe(), rev: (await bildoDe()).rev }).toEqual(vorher);
  });

  it("a Stand holds the name: opening it brings the old name back", async () => {
    expect((await schreiben({ name: "Lumeto Alt" })).status).toBe(200);
    const stand = await server.anfrage(
      "POST",
      `/api/marko/${MARKO}/staende`,
      JSON.stringify({ name: "vor dem Namen" }),
    );
    expect(stand.status).toBe(201);
    const { id } = JSON.parse(text(stand.body)) as { id: string };
    expect((await schreiben({ name: "Lumeto Neu" })).status).toBe(200);
    expect((await bildoDe()).marko.etikedo).toBe("Lumeto Neu");
    const oeffnen = await server.anfrage(
      "POST",
      `/api/marko/${MARKO}/staende/${encodeURIComponent(id)}/oeffnen`,
      "",
    );
    expect(oeffnen.status).toBe(200);
    expect(entwurfDe().etikedoj).toEqual({ marko: "Lumeto Alt" });
    expect((await bildoDe()).marko).toEqual(
      expect.objectContaining({ name: MARKO, etikedo: "Lumeto Alt" }),
    );
    expect(readdirSync(server.workdir).sort()).toEqual(["lumeto", "lumeto-tee"]);
  });
});
