// Spec 058 (MP-2c, T3, MAW-3.1, plan §3.3): `GET /api/marken` – the started brands for „Marken“ in
// the canvas header. The answer is `{marken: MarkenZeile[]}` with the data and the order of the
// start page's Markenliste (`markenListeDe`: newest first, then by name; an unreadable brand stands
// with its name and without swatches). Reading writes nothing: the draft, its rev and the Kroniko of
// every brand stay, and no file of the working directory changes. Only GET answers. Invented brands
// only („lumeto“, „provo“, „kaputa“).

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { LEINWAND_DOSIERO, STAENDE_DIR } from "./leinwand-dosieroj.js";
import { type MarkenZeile, markenListeDe } from "./marken-liste.js";
import { markoDir } from "./marko.js";
import {
  entwurf,
  markeAnlegen,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";
import { loadBases } from "./vorschau.js";

/** A local time (server local time, as the start page's list shows it). */
const lokal = (tag: number, stunde: number): Date => new Date(2026, 10, tag, stunde, 0);

/** Every file below the working directory: relative path → SHA-256 and mtime. */
function abdruckDe(workdir: string): Record<string, string> {
  const ergebnis: Record<string, string> = {};
  const gehen = (dir: string): void => {
    for (const ero of readdirSync(dir, { withFileTypes: true })) {
      const pfad = join(dir, ero.name);
      if (ero.isDirectory()) gehen(pfad);
      else
        ergebnis[relative(workdir, pfad)] =
          `${createHash("sha256").update(readFileSync(pfad)).digest("hex")} ${statSync(pfad).mtimeMs}`;
    }
  };
  gehen(workdir);
  return ergebnis;
}

describe("MAW-3.1: GET /api/marken", () => {
  let server: TestServilo;

  const marken = async (): Promise<{ status: number; typ: string; korpo: unknown }> => {
    const antwort = await server.anfrage("GET", "/api/marken");
    return {
      status: antwort.status,
      typ: antwort.contentType,
      korpo: antwort.status === 200 ? JSON.parse(antwort.body.toString("utf8")) : undefined,
    };
  };

  const rev = async (name: string): Promise<number> => {
    const antwort = await server.anfrage("GET", `/api/leinwand?marko=${name}`);
    expect(antwort.status).toBe(200);
    return (JSON.parse(antwort.body.toString("utf8")) as { rev: number }).rev;
  };

  beforeAll(async () => {
    server = await testServilo("marken-058-");
  });

  afterAll(async () => {
    await server?.close();
  });

  it("answers an empty list while there is no brand", async () => {
    const r = await marken();
    expect(r.status).toBe(200);
    expect(r.typ).toContain("application/json");
    expect(r.korpo).toEqual({ marken: [] });
  });

  it("answers the start page's rows in its order: newest first, then by name", async () => {
    await markeAnlegen(server, "Lumeto Studio", "leer");
    await markeAnlegen(server, "provo", "leer");
    await markeAnlegen(server, "alfa", "leer");
    await entwurf(server, "lumeto-studio", { zweitfarbe: { farbe: "#c6f135" } });
    const staende = join(markoDir(server.workdir, "lumeto-studio"), STAENDE_DIR);
    mkdirSync(staende, { recursive: true });
    writeFileSync(join(staende, "20261115T134100Z.json"), "{}\n");
    writeFileSync(join(markoDir(server.workdir, "lumeto-studio"), LEINWAND_DOSIERO), "{}\n");
    // kaputa: an agordo.json that does not read – listed with its name, without swatches.
    mkdirSync(markoDir(server.workdir, "kaputa"));
    writeFileSync(join(markoDir(server.workdir, "kaputa"), "agordo.json"), "{ nicht json");
    // The files that exist (a brand without a change has no entwurf.json yet).
    const zeit = (name: string, datei: string, z: Date) => {
      const pfad = join(markoDir(server.workdir, name), datei);
      if (existsSync(pfad)) utimesSync(pfad, z, z);
    };
    for (const datei of ["agordo.json", "entwurf.json"]) {
      zeit("provo", datei, lokal(9, 17));
      zeit("alfa", datei, lokal(9, 17));
      zeit("lumeto-studio", datei, lokal(1, 8));
    }
    zeit("lumeto-studio", LEINWAND_DOSIERO, lokal(15, 14));
    zeit("kaputa", "agordo.json", lokal(1, 12));

    const r = await marken();
    expect(r.status).toBe(200);
    const zeilen = (r.korpo as { marken: MarkenZeile[] }).marken;
    expect(Object.keys(r.korpo as object)).toEqual(["marken"]);
    expect(zeilen.map((z) => z.name)).toEqual(["lumeto-studio", "alfa", "provo", "kaputa"]);
    expect(zeilen).toEqual(markenListeDe(server.workdir, loadBases()));
    expect(zeilen[0]).toEqual(
      expect.objectContaining({
        name: "lumeto-studio",
        etikedo: "Lumeto Studio",
        lesbar: true,
        farben: expect.objectContaining({ akzent: "#c6f135" }),
        geaendert: lokal(15, 14).toISOString(),
        staende: 1,
      }),
    );
    expect(zeilen[3]).toEqual({
      name: "kaputa",
      etikedo: "kaputa",
      lesbar: false,
      geaendert: lokal(1, 12).toISOString(),
      staende: 0,
    });
  });

  it("writes nothing: draft, rev and Kroniko of every brand and every file stay", async () => {
    const namen = ["lumeto-studio", "alfa", "provo"];
    const revs = await Promise.all(namen.map(rev));
    const kroniko = (name: string) =>
      readFileSync(join(markoDir(server.workdir, name), "kroniko.jsonl"), "utf8");
    const kronikoj = namen.map(kroniko);
    expect(kronikoj.every((k) => k.length > 0)).toBe(true);
    const vorher = abdruckDe(server.workdir);
    for (let i = 0; i < 3; i += 1) expect((await marken()).status).toBe(200);
    expect(abdruckDe(server.workdir)).toEqual(vorher);
    expect(namen.map(kroniko)).toEqual(kronikoj);
    expect(await Promise.all(namen.map(rev))).toEqual(revs);
  });

  it("answers only GET: another method or path is left to the routes after it", async () => {
    const vorher = abdruckDe(server.workdir);
    for (const [method, path] of [
      ["POST", "/api/marken"],
      ["GET", "/api/marken/lumeto-studio"],
      ["GET", "/api/markenliste"],
    ] as const) {
      const antwort = await server.anfrage(method, path, method === "POST" ? "{}" : undefined);
      expect(antwort.status, `${method} ${path}`).not.toBe(200);
    }
    expect(abdruckDe(server.workdir)).toEqual(vorher);
  });
});
