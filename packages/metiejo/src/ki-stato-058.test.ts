// Spec 058 (MP-2c, T5, MAW-3.3): `GET /api/marko/:name/ki?zweck=profil|namen|aufbau` (US-7, plan
// §3.3). The estimate before a click, computed from the stored canvas and the draft
// (`schaetzungDe` with the price of the configured model, the median of own earlier calls of the
// purpose from the Kroniko); `pret: false` with the existing sentence without a model. Reading only:
// draft, rev, `leinwand.json` and Kroniko stay, and no model is asked.

import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Provider } from "./asistanto/ki.js";
import { type LeinwandStato, ZWECKOJ } from "./grafeo-gestalten-sicht.js";
import {
  auftragAufbau,
  auftragNamen,
  eingabenDe,
  SCHAETZUNG_STARTO,
  schaetzungDe,
} from "./leinwand-auswertung.js";
import { markoDir } from "./marko.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

/** `TestServilo.anfrage` speaks PUT too; its type names only GET and POST. */
const put = (s: TestServilo, path: string, body: string): ReturnType<TestServilo["anfrage"]> =>
  (s.anfrage as (m: string, p: string, b?: string) => ReturnType<TestServilo["anfrage"]>)(
    "PUT",
    path,
    body,
  );

const SEKRETO = "sk-058-stato-nur-im-test";

const STATO: LeinwandStato = {
  version: 1,
  knoten: [
    {
      id: "teksto-grundlagen",
      inhalt: { beschreibung: "Lumeto baut ruhige Leuchten aus Altglas." },
    },
    { id: "teksto-werte", inhalt: { werte: [{ id: "w1", text: "ehrlich" }] } },
    { id: "ki-namen", speco: "ki", x: 24, y: -616, inhalt: {} },
  ],
  kabloj: {},
};

interface Antwort {
  pret: boolean;
  satz?: string;
  schaetzung?: { enigo: number; eligo: number; usd?: number; text: string };
}

let vokoj = 0;
const fakeFetch = (): Promise<Response> => {
  vokoj += 1;
  return Promise.reject(new Error("no model call in this test"));
};

describe("MAW-3.3: GET /api/marko/:name/ki – estimate, read-only", () => {
  let mitPreis: TestServilo;
  let ohnePreis: TestServilo;
  let ohneModell: TestServilo;
  const ki = async (s: TestServilo, name: string, zweck: string) => {
    const r = await s.anfrage("GET", `/api/marko/${name}/ki?zweck=${zweck}`);
    return { status: r.status, korpo: JSON.parse(r.body.toString("utf8")) as Antwort };
  };

  beforeAll(async () => {
    mitPreis = await testServilo("ki-stato-058-preis-", {
      ki: { provider: new Provider("mistral", "ministral-14b-2512", SEKRETO), fetch: fakeFetch },
    });
    ohnePreis = await testServilo("ki-stato-058-tokens-", {
      ki: { provider: new Provider("mistral", "klein", SEKRETO), fetch: fakeFetch },
    });
    ohneModell = await testServilo("ki-stato-058-sen-");
    for (const s of [mitPreis, ohnePreis, ohneModell]) {
      await markeAnlegen(s, "lumeto", "leer");
      const gesendet = await put(s, "/api/marko/lumeto/leinwand-stato", JSON.stringify(STATO));
      expect(gesendet.status).toBe(200);
    }
  });

  afterAll(async () => {
    await mitPreis?.close();
    await ohnePreis?.close();
    await ohneModell?.close();
  });

  it("answers pret:false with the existing sentence for every purpose without a model", async () => {
    for (const zweck of ZWECKOJ) {
      const { status, korpo } = await ki(ohneModell, "lumeto", zweck);
      expect(status).toBe(200);
      expect(korpo.pret).toBe(false);
      expect(korpo.satz).toMatch(/^Kein Sprachmodell eingerichtet/);
      expect(korpo.schaetzung).toBeUndefined();
    }
  });

  it("answers the estimate of each purpose from the stored canvas, in dollars with a price", async () => {
    const namen = eingabenDe({ stato: STATO, nomo: "lumeto", farben: [], schriften: {} }, "namen");
    const preise = { enigo: 0.2, eligo: 0.2 };
    const erwartet = {
      namen: schaetzungDe("namen", auftragNamen(namen), preise, []),
      aufbau: schaetzungDe("aufbau", auftragAufbau(), preise, []),
    };
    expect(erwartet.namen.text).toMatch(/^≈ /);
    for (const zweck of ZWECKOJ) {
      const { status, korpo } = await ki(mitPreis, "lumeto", zweck);
      expect(status).toBe(200);
      expect(korpo.pret).toBe(true);
      expect(korpo.satz).toBeUndefined();
      const s = korpo.schaetzung;
      expect(s?.eligo).toBe(SCHAETZUNG_STARTO[zweck]);
      expect(s?.enigo).toBeGreaterThan(0);
      expect(typeof s?.usd).toBe("number");
      expect(s?.text).toMatch(/^≈ (\d+,\d{4} \$|< 0,0001 \$)$/);
      if (zweck !== "profil") expect(s).toEqual(erwartet[zweck]);
    }
    // The profile's order is longer than the names' (name, colours and fonts come in).
    const profil = (await ki(mitPreis, "lumeto", "profil")).korpo.schaetzung;
    expect(profil?.enigo).toBeGreaterThan(erwartet.namen.enigo);
  });

  it("names tokens without a price and takes the median of own calls from the Kroniko", async () => {
    const { korpo } = await ki(ohnePreis, "lumeto", "namen");
    expect(korpo.schaetzung?.usd).toBeUndefined();
    expect(korpo.schaetzung?.text).toBe(
      `≈ ${(korpo.schaetzung?.enigo ?? 0) + SCHAETZUNG_STARTO.namen} Tokens`,
    );
    const kroniko = join(markoDir(ohnePreis.workdir, "lumeto"), "kroniko.jsonl");
    for (const eligo of [300, 100, 200])
      appendFileSync(
        kroniko,
        `${JSON.stringify({
          tempo: "2026-11-17T10:00:00.000Z",
          ago: "propono",
          fonto: "agento",
          modelo: "mistral/klein",
          kosto: { enigo: 10, eligo, ms: 5, requests: 1 },
          detaloj: { zweck: "leinwand-namen" },
          persono: null,
          rolo: null,
        })}\n`,
      );
    expect((await ki(ohnePreis, "lumeto", "namen")).korpo.schaetzung?.eligo).toBe(200);
    expect((await ki(ohnePreis, "lumeto", "profil")).korpo.schaetzung?.eligo).toBe(
      SCHAETZUNG_STARTO.profil,
    );
  });

  it("reads only: draft, rev, leinwand.json and Kroniko stay; no model is asked", async () => {
    const dir = markoDir(mitPreis.workdir, "lumeto");
    const datei = (n: string) =>
      existsSync(join(dir, n)) ? readFileSync(join(dir, n), "utf8") : null;
    const rev = async () =>
      (
        JSON.parse(
          (await mitPreis.anfrage("GET", "/api/leinwand?marko=lumeto")).body.toString("utf8"),
        ) as { rev: number }
      ).rev;
    const vorher = {
      rev: await rev(),
      dateien: ["agordo.json", "entwurf.json", "leinwand.json", "kroniko.jsonl"].map(datei),
    };
    for (const zweck of ZWECKOJ) await ki(mitPreis, "lumeto", zweck);
    expect({
      rev: await rev(),
      dateien: ["agordo.json", "entwurf.json", "leinwand.json", "kroniko.jsonl"].map(datei),
    }).toEqual(vorher);
    expect(vokoj).toBe(0);
  });

  it("answers 404 for an unknown brand and 400 for an unknown purpose", async () => {
    expect((await mitPreis.anfrage("GET", "/api/marko/nirgends/ki?zweck=namen")).status).toBe(404);
    for (const zweck of ["", "bild", "namen2"])
      expect((await mitPreis.anfrage("GET", `/api/marko/lumeto/ki?zweck=${zweck}`)).status).toBe(
        400,
      );
  });
});
