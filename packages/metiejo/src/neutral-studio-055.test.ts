// Spec 055 T3 (LNS-1.2): the Studio does not show the own Neutral colour (`neutral.farbe`), but it
// must not lose it. Read-only: the Studio's paths are driven as they are – its live slider of the
// Tönung (`POST /api/marko/:name/entwurf`, `patched` merges `neutral` field by field) and its save
// (`POST /studio/:name/speichern`). A red result here is a Befund for the report, never a fix in
// the Studio. The save of a change of `neutral.farbe` alone writes a history entry by hand with an
// empty diff (D-7).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Agordo } from "@fundamento/agordilo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  entwurf,
  markeAnlegen,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";

const FARBE = "#e8e2d6";
const FORM = "application/x-www-form-urlencoded";

describe("Spec 055 T3: the Studio keeps neutral.farbe (read-only)", () => {
  let server: TestServilo;

  const leinwand = async (name: string, korpo: unknown): Promise<number> => {
    const antwort = await server.anfrage(
      "POST",
      `/api/marko/${name}/leinwand`,
      JSON.stringify(korpo),
    );
    expect(antwort.status, JSON.stringify(korpo)).toBe(200);
    return (JSON.parse(antwort.body.toString("utf8")) as { rev: number }).rev;
  };
  const datei = (name: string, file: string): Agordo =>
    JSON.parse(readFileSync(join(server.workdir, name, file), "utf8")) as Agordo;
  const speichern = async (name: string): Promise<void> => {
    const antwort = await server.anfrage(
      "POST",
      `/studio/${name}/speichern`,
      "eksporto-aspekto=ja",
      FORM,
    );
    expect(antwort.status).toBe(303);
  };

  beforeAll(async () => {
    server = await testServilo("neutral-studio-055-");
    await markeAnlegen(server, "studio-neutral", "leer");
  });

  afterAll(async () => {
    await server?.close();
  });

  it("the live slider of the Tönung keeps the own colour beside the new value", async () => {
    await leinwand("studio-neutral", { neutral: { farbe: FARBE } });
    await entwurf(server, "studio-neutral", { neutral: { toenung: 0.5 } });
    expect(datei("studio-neutral", "entwurf.json").neutral).toEqual({
      toenung: 0.5,
      farbe: FARBE,
    });
  });

  it("saving writes the own colour into agordo.json unchanged", async () => {
    await speichern("studio-neutral");
    expect(datei("studio-neutral", "agordo.json").neutral).toEqual({
      toenung: 0.5,
      farbe: FARBE,
    });
  });

  it("a save of a change of neutral.farbe alone records a history entry by hand without a diff (D-7)", async () => {
    await leinwand("studio-neutral", { neutral: { farbe: "#ff0000" } });
    await speichern("studio-neutral");
    const gespeichert = datei("studio-neutral", "agordo.json");
    expect(gespeichert.neutral).toEqual({ toenung: 0.5, farbe: "#ff0000" });
    const letzter = gespeichert.historio?.at(-1);
    expect({ wunsch: letzter?.wunsch, diff: letzter?.diff }).toEqual({ wunsch: "Hand", diff: [] });
  });
});
