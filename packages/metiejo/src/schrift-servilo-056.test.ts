// Spec 056 (MP-2a, T6, KBS-3.4, plan D-21, D-22): the catalog half of the node Schrift.
//   GET /api/marko/:name/tiparoj?q=&art=   the filter by kind, only when the query has `art`; without
//                                          it the existing route answers byte for byte as before
//   GET /api/marko/:name/schriften         {rev, schriften, regler} from the draft
//   GET /api/tiparo/:id/css, /:id/:datei   the Fontsource files through the `fetchFontFiles` cache,
//                                          503 {satz: SCHRIFT_OFFLINE_SATZ} without npm or network
// Setting a font or a slider goes through the canvas's write path (`POST …/leinwand`, KBS-1.1).
// Counts come from data/tiparoj.json and `reglerOf`, none typed. Offline: npm is a double with a
// tarball built here; invented brands only.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { reglerOf } from "@fundamento/agordilo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SCHRIFT_ARTOJ, SCHRIFT_OFFLINE_SATZ } from "./grafeo-gestalten-sicht.js";
import { markeAnlegen, sha256, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { tarballOf } from "./test-doubles/tar.js";
import { LICENCED_NOTE, readTiparoj, searchTiparoj, type Tiparo } from "./tiparoj.js";
import type { NpmDeps } from "./tiparoj-npm.js";
import { loadBases } from "./vorschau.js";

const MARKO = "provo";
const katalogo = readTiparoj();
const bases = loadBases();
const SCHRIFT_REGLER = reglerOf(bases.gestalt).filter((r) => r.path.startsWith("schrift."));

type Json = Record<string, unknown>;
const json = (body: Buffer): Json => JSON.parse(body.toString("utf8")) as Json;

interface Treffer {
  id: string;
  family: string;
  license: string;
  category: string;
}

/** The first family of a kind in the catalog (by id), so no name is typed. */
const unuaDe = (kategorio: string): Tiparo => {
  const tiparo = katalogo.tiparoj.find(
    (t) => t.category === kategorio && t.scripts.includes("Latn"),
  );
  if (tiparo === undefined) throw new Error(`no ${kategorio} family in the catalog`);
  return tiparo;
};

// npm double: the registry names a version and a tarball with LICENSE and two Latin woff2 files.
const REGULAR = Buffer.from("woff2-regular-056");
const BOLD = Buffer.from("woff2-bold-056");
const SERIF = unuaDe("serif");
const tarball = tarballOf([
  { path: "package/LICENSE", bytes: Buffer.from("SIL Open Font License 1.1 (test)") },
  { path: `package/files/${SERIF.id}-latin-400-normal.woff2`, bytes: REGULAR },
  { path: `package/files/${SERIF.id}-latin-700-normal.woff2`, bytes: BOLD },
]);
const scratch = mkdtempSync(join(tmpdir(), "fm-schrift-056-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
const npmAbrufe: string[] = [];
const npmDe = (cacheDir: string, online: boolean): NpmDeps => ({
  fetchJson: async (url) => {
    npmAbrufe.push(url);
    if (!online) throw new Error("offline");
    return {
      version: "5.0.0",
      license: SERIF.license,
      dist: {
        tarball: `https://registry.npmjs.org/@fontsource/${SERIF.id}/-/${SERIF.id}-5.0.0.tgz`,
      },
    };
  },
  fetchBytes: async (url) => {
    npmAbrufe.push(url);
    if (!online) throw new Error("offline");
    return tarball;
  },
  cacheDir,
  date: "2026-11-16",
});

let server: TestServilo;
let kunNpm: TestServilo;
let senReto: TestServilo;
const tiparoj = (query: string, s: TestServilo = server) =>
  s.anfrage("GET", `/api/marko/${MARKO}/tiparoj${query}`);
const schriften = async (marko = MARKO) => server.anfrage("GET", `/api/marko/${marko}/schriften`);
const skribi = (korpo: unknown) =>
  server.anfrage("POST", `/api/marko/${MARKO}/leinwand`, JSON.stringify(korpo));

beforeAll(async () => {
  server = await testServilo("fm-schrift-056-a-");
  kunNpm = await testServilo("fm-schrift-056-b-", { npm: npmDe(join(scratch, "cache"), true) });
  senReto = await testServilo("fm-schrift-056-c-", {
    npm: npmDe(join(scratch, "leer-cache"), false),
  });
  for (const s of [server, kunNpm, senReto]) await markeAnlegen(s, MARKO, "leer");
});

afterAll(async () => {
  await Promise.all([server.close(), kunNpm.close(), senReto.close()]);
});

describe("GET …/tiparoj with art (D-22)", () => {
  it("filters by each kind: every hit of that kind, the count from the catalog", async () => {
    for (const { kategorio } of SCHRIFT_ARTOJ) {
      const anzahl = katalogo.tiparoj.filter((t) => t.category === kategorio).length;
      const answer = await tiparoj(`?q=&art=${kategorio}`);
      expect(answer.status).toBe(200);
      const body = json(answer.body) as { treffer: Treffer[]; anzahl: number; satz?: string };
      expect(body.anzahl).toBe(anzahl);
      expect(body.treffer.length).toBe(Math.min(12, anzahl));
      expect(body.treffer.filter((t) => t.category !== kategorio)).toEqual([]);
      expect(body.satz).toBeUndefined();
    }
  });

  it("an empty kind means every kind", async () => {
    const body = json((await tiparoj("?q=&art=")).body) as { anzahl: number; treffer: Treffer[] };
    expect(body.anzahl).toBe(katalogo.tiparoj.length);
    expect(body.treffer.length).toBe(Math.min(12, katalogo.tiparoj.length));
  });

  it("search and filter together: the search runs on the kind's families only", async () => {
    const query = SERIF.family.slice(0, 4).toLowerCase();
    const nurSerif = {
      ...katalogo,
      tiparoj: katalogo.tiparoj.filter((t) => t.category === "serif"),
    };
    const erwartet = searchTiparoj(nurSerif, query, 12).map((t) => t.id);
    const body = json((await tiparoj(`?q=${query}&art=serif`)).body) as {
      treffer: Treffer[];
      anzahl: number;
    };
    expect(body.treffer.map((t) => t.id)).toEqual(erwartet);
    expect(body.treffer.map((t) => t.id)).toContain(SERIF.id);
    expect(body.anzahl).toBe(searchTiparoj(nurSerif, query, Number.MAX_SAFE_INTEGER).length);
    // The same search in another kind does not find the serif family.
    const mono = json((await tiparoj(`?q=${query}&art=monospace`)).body) as { treffer: Treffer[] };
    expect(mono.treffer.map((t) => t.id)).not.toContain(SERIF.id);
  });

  it("each hit names family, kind and licence", async () => {
    const body = json((await tiparoj(`?q=${encodeURIComponent(SERIF.family)}&art=serif`)).body) as {
      treffer: Treffer[];
    };
    expect(body.treffer[0]).toEqual({
      id: SERIF.id,
      family: SERIF.family,
      license: SERIF.license,
      category: "serif",
    });
  });

  it("no hit: the Studio's own sentence, word for word", async () => {
    const query = "zzqxv";
    const alt = json((await tiparoj(`?q=${query}`)).body) as { satz: string };
    const neu = json((await tiparoj(`?q=${query}&art=serif`)).body) as {
      treffer: Treffer[];
      satz: string;
    };
    expect(neu.treffer).toEqual([]);
    expect(typeof alt.satz).toBe("string");
    expect(neu.satz).toBe(alt.satz);
  });

  it("an unknown kind is refused calmly; an unknown brand answers 404 {satz}", async () => {
    const art = await tiparoj("?q=a&art=gotisch");
    expect(art.status).toBe(422);
    expect(Object.keys(json(art.body)).sort()).toEqual(["feld", "satz"]);
    expect(json(art.body).feld).toBe("art");
    const marko = await server.anfrage("GET", "/api/marko/nenia/tiparoj?q=a&art=serif");
    expect(marko.status).toBe(404);
    expect(Object.keys(json(marko.body))).toEqual(["satz"]);
  });
});

describe("GET …/tiparoj without art: the existing route, byte for byte", () => {
  // sha256 of the bodies the route answered before KBS-3.4 (stub in place, = 6d34a75a).
  const VORHER: Record<string, string> = {
    "/api/marko/provo/tiparoj?q=inter":
      "200 application/json; charset=utf-8 1874bc2c104a01c2a666dd88b925a3d648664291638376bac5e48cee09e35579",
    "/api/marko/provo/tiparoj?q=zzqxv":
      "200 application/json; charset=utf-8 9f67b72e43b0762d1ea9e079606eaa5f2803e9938a7300a9e7bf93a820866e56",
    "/api/marko/provo/tiparoj?q=":
      "200 application/json; charset=utf-8 e233d4ca48951e74c035f3ad3351d8bb94d471281026dcb7082ba6b74a9959da",
    "/api/marko/provo/tiparoj":
      "200 application/json; charset=utf-8 e233d4ca48951e74c035f3ad3351d8bb94d471281026dcb7082ba6b74a9959da",
    "/api/marko/nenia/tiparoj?q=serif":
      "200 application/json; charset=utf-8 db8c6b43a45fdef40a75bb7bccb4df762eba46809248d6ee1c6f83bacbaaa2d9",
  };
  it("answers every query as before", async () => {
    const abweichend: string[] = [];
    for (const [path, hash] of Object.entries(VORHER)) {
      const answer = await server.anfrage("GET", path);
      const ist = `${answer.status} ${answer.contentType} ${sha256(answer.body)}`;
      if (ist !== hash) abweichend.push(`${path} → ${ist}`);
    }
    expect(abweichend).toEqual([]);
  });
});

describe("GET …/schriften (D-21)", () => {
  it("names rev, no font yet, and the three Schrift sliders with their ranges", async () => {
    const answer = await schriften();
    expect(answer.status).toBe(200);
    const body = json(answer.body) as {
      rev: number;
      schriften: Json;
      regler: {
        pfad: string;
        etikedo: string;
        min: number;
        max: number;
        step: number;
        wert: number;
      }[];
    };
    expect(Object.keys(body).sort()).toEqual(["regler", "rev", "schriften"]);
    expect(typeof body.rev).toBe("number");
    expect(body.regler).toEqual(
      SCHRIFT_REGLER.map((r) => ({
        pfad: r.path,
        etikedo: r.label,
        min: r.min,
        max: r.max,
        step: r.step,
        wert: r.standard,
      })),
    );
    expect(body.regler.map((r) => r.pfad).sort()).toEqual([
      "schrift.gewicht",
      "schrift.groesse",
      "schrift.skala",
    ]);
  });

  it("an unknown brand answers 404 {satz}", async () => {
    const answer = await schriften("nenia");
    expect(answer.status).toBe(404);
    expect(Object.keys(json(answer.body))).toEqual(["satz"]);
  });
});

describe("setting fonts and sliders through POST …/leinwand (KBS-1.1 path)", () => {
  const revNun = async (): Promise<number> =>
    (json((await schriften()).body) as { rev: number }).rev;

  it("sets heading, text and code; each write rev+1; …/schriften names them", async () => {
    const rollen = {
      display: SERIF,
      body: unuaDe("sans-serif"),
      code: unuaDe("monospace"),
    } as const;
    for (const [rolle, tiparo] of Object.entries(rollen)) {
      const vorher = await revNun();
      const answer = await skribi({ schrift: { rolle, tiparo: tiparo.id } });
      expect(answer.status).toBe(200);
      expect((json(answer.body) as { rev: number }).rev).toBe(vorher + 1);
    }
    const body = json((await schriften()).body) as { schriften: Json };
    expect(body.schriften).toEqual(
      Object.fromEntries(
        Object.entries(rollen).map(([rolle, t]) => [
          rolle,
          { familie: t.family, lizenz: t.license, tiparo: t.id },
        ]),
      ),
    );
  });

  it("each slider at its maximum: written, rev+1, …/schriften shows the value", async () => {
    for (const regler of SCHRIFT_REGLER) {
      const vorher = await revNun();
      const answer = await skribi({ regler: { pfad: regler.path, wert: regler.max } });
      expect(answer.status).toBe(200);
      expect((json(answer.body) as { rev: number }).rev).toBe(vorher + 1);
    }
    const body = json((await schriften()).body) as { regler: { pfad: string; wert: number }[] };
    expect(body.regler.map((r) => [r.pfad, r.wert])).toEqual(
      SCHRIFT_REGLER.map((r) => [r.path, r.max]),
    );
  });

  it("a slider out of range: 422 {feld, satz}, nothing changes", async () => {
    for (const regler of SCHRIFT_REGLER) {
      const vorher = await revNun();
      const answer = await skribi({
        regler: { pfad: regler.path, wert: regler.max + regler.step },
      });
      expect(answer.status).toBe(422);
      const body = json(answer.body);
      expect(Object.keys(body).sort()).toEqual(["feld", "satz"]);
      expect(body.feld).toBe(regler.path);
      expect(await revNun()).toBe(vorher);
    }
  });

  it("an own font by family name: „lizenziert, nicht enthalten“, marked eigene", async () => {
    const answer = await skribi({ schrift: { rolle: "display", eigene: "Hausschrift Provo" } });
    expect(answer.status).toBe(200);
    const body = json((await schriften()).body) as { schriften: { display: Json } };
    expect(body.schriften.display).toEqual({
      familie: "Hausschrift Provo",
      lizenz: LICENCED_NOTE,
      eigene: true,
    });
  });
});

describe("GET /api/tiparo/:id/css and /api/tiparo/:id/:datei", () => {
  it("with npm: @font-face rules on the product's own route, the files from the cache", async () => {
    const css = await kunNpm.anfrage("GET", `/api/tiparo/${SERIF.id}/css`);
    expect(css.status).toBe(200);
    expect(css.contentType).toMatch(/^text\/css/);
    const text = css.body.toString("utf8");
    const regeln = text.split("\n").filter((l) => l.startsWith("@font-face"));
    expect(regeln.length).toBe(2);
    expect(text).toContain(`font-family: ${JSON.stringify(SERIF.family)}`);
    expect(text).toContain(`url(/api/tiparo/${SERIF.id}/${SERIF.id}-latin-400-normal.woff2)`);
    expect(text).toContain(`url(/api/tiparo/${SERIF.id}/${SERIF.id}-latin-700-normal.woff2)`);
    expect(text).not.toContain("https://");

    const datei = await kunNpm.anfrage(
      "GET",
      `/api/tiparo/${SERIF.id}/${SERIF.id}-latin-700-normal.woff2`,
    );
    expect(datei.status).toBe(200);
    expect(datei.contentType).toBe("font/woff2");
    expect(datei.body.equals(BOLD)).toBe(true);
    // Read once from npm: the second request comes from the cache.
    const abrufe = npmAbrufe.filter((u) => !u.includes("offline")).length;
    await kunNpm.anfrage("GET", `/api/tiparo/${SERIF.id}/css`);
    expect(npmAbrufe.filter((u) => !u.includes("offline")).length).toBe(abrufe);
  });

  it("only the woff2 files of a catalog font; unknown id or file → 404 {satz}", async () => {
    const pfade = [
      `/api/tiparo/${SERIF.id}/LICENSE`,
      `/api/tiparo/${SERIF.id}/herkunto.json`,
      `/api/tiparo/${SERIF.id}/..%2Fherkunto.json`,
      `/api/tiparo/${SERIF.id}/andere-latin-400-normal.woff2`,
      "/api/tiparo/gibt-es-nicht-056/css",
    ];
    const falsch: string[] = [];
    for (const pfad of pfade) {
      const answer = await kunNpm.anfrage("GET", pfad);
      if (answer.status !== 404 || Object.keys(json(answer.body)).join() !== "satz")
        falsch.push(`${pfad} → ${answer.status}`);
    }
    expect(falsch).toEqual([]);
  });

  it("a family without Latin letters: no rule, so the node keeps the fallback (no network)", async () => {
    const ohneLatein = katalogo.tiparoj.find((t) => !t.scripts.includes("Latn"));
    if (ohneLatein === undefined) throw new Error("the catalog has no family without Latin");
    const vorher = npmAbrufe.length;
    const css = await kunNpm.anfrage("GET", `/api/tiparo/${ohneLatein.id}/css`);
    expect(css.status).toBe(200);
    expect(css.body.toString("utf8")).toBe("");
    expect(npmAbrufe.length).toBe(vorher);
  });

  it("without npm (the test default) or offline without cache: 503 with the sentence", async () => {
    for (const [s, pfad] of [
      [server, `/api/tiparo/${SERIF.id}/css`],
      [server, `/api/tiparo/${SERIF.id}/${SERIF.id}-latin-400-normal.woff2`],
      [senReto, `/api/tiparo/${SERIF.id}/css`],
      [senReto, `/api/tiparo/${SERIF.id}/${SERIF.id}-latin-400-normal.woff2`],
    ] as const) {
      const answer = await s.anfrage("GET", pfad);
      expect(answer.status).toBe(503);
      expect(json(answer.body)).toEqual({ satz: SCHRIFT_OFFLINE_SATZ });
    }
  });

  it("offline, the choice is still stored", async () => {
    const answer = await senReto.anfrage(
      "POST",
      `/api/marko/${MARKO}/leinwand`,
      JSON.stringify({ schrift: { rolle: "display", tiparo: SERIF.id } }),
    );
    expect(answer.status).toBe(200);
    const body = json((await senReto.anfrage("GET", `/api/marko/${MARKO}/schriften`)).body) as {
      schriften: { display: Json };
    };
    expect(body.schriften.display).toEqual({
      familie: SERIF.family,
      lizenz: SERIF.license,
      tiparo: SERIF.id,
    });
  });
});
