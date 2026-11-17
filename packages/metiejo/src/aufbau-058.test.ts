// Spec 058 (MP-2c, T1, MAW-1.1, AK-18): the fixed mapping features → layout (`aufbauDe`), in the
// order of the technical spec: „Karten“ → Kartenraster; „Liste“, or left-aligned with restrained
// type and no large title image → Ruhige Liste; a large title image or large type → Großer Titel;
// else the first layout. The reason is a finished German sentence from the features. No model.

import { describe, expect, it } from "vitest";
import {
  AUFBAU_ETIKEDOJ,
  type AufbauId,
  MERKMALE_WERTE,
  type Merkmale,
  type MerkmaleLego,
} from "./grafeo-gestalten-sicht.js";
import { aufbauDe } from "./leinwand-auswertung.js";

/** The table of the technical spec, written out once more for the comparison. */
function tabelo(m: MerkmaleLego): AufbauId {
  if (m.inhalt === "karten") return "raster";
  if (
    m.inhalt === "liste" ||
    (m.achse === "links" && m.schrift === "zurueckhaltend" && m.titelbild !== "gross")
  )
    return "liste";
  if (m.titelbild === "gross" || m.schrift === "gross") return "titel";
  return "titel";
}

describe("MAW-1.1: aufbauDe – every row of the mapping and its order (AK-18)", () => {
  it("maps each row", () => {
    expect(aufbauDe({ inhalt: "karten" }).aufbau).toBe("raster");
    expect(aufbauDe({ inhalt: "liste" }).aufbau).toBe("liste");
    expect(aufbauDe({ achse: "links", schrift: "zurueckhaltend" }).aufbau).toBe("liste");
    expect(aufbauDe({ titelbild: "gross" }).aufbau).toBe("titel");
    expect(aufbauDe({ schrift: "gross" }).aufbau).toBe("titel");
    expect(aufbauDe({ inhalt: "fliesstext", achse: "mittig", dichte: "dicht" }).aufbau).toBe(
      "titel",
    );
    expect(aufbauDe({}).aufbau).toBe("titel");
    expect(aufbauDe(undefined).aufbau).toBe("titel");
  });

  it("follows the order of precedence", () => {
    // Karten before everything.
    expect(aufbauDe({ inhalt: "karten", titelbild: "gross", schrift: "gross" }).aufbau).toBe(
      "raster",
    );
    expect(aufbauDe({ inhalt: "karten", achse: "links", schrift: "zurueckhaltend" }).aufbau).toBe(
      "raster",
    );
    // A list before a large title image.
    expect(aufbauDe({ inhalt: "liste", titelbild: "gross" }).aufbau).toBe("liste");
    // Left-aligned and restrained only without a large title image.
    expect(aufbauDe({ achse: "links", schrift: "zurueckhaltend", titelbild: "gross" }).aufbau).toBe(
      "titel",
    );
    expect(aufbauDe({ achse: "links", schrift: "zurueckhaltend", titelbild: "klein" }).aufbau).toBe(
      "liste",
    );
  });

  it("agrees with the table for all 72 combinations of the five features", () => {
    const schluessel = Object.keys(MERKMALE_WERTE) as (keyof Merkmale)[];
    let kombinoj: MerkmaleLego[] = [{}];
    for (const k of schluessel)
      kombinoj = kombinoj.flatMap((m) => MERKMALE_WERTE[k].map((w) => ({ ...m, [k]: w })));
    expect(kombinoj).toHaveLength(72);
    expect(kombinoj.filter((m) => aufbauDe(m).aufbau !== tabelo(m))).toEqual([]);
  });
});

describe("MAW-1.1: aufbauDe – the reason sentence", () => {
  it("says the sentences of the product spec and the mockups", () => {
    expect(aufbauDe({ titelbild: "gross", schrift: "gross" }).grund).toBe(
      "Großer Titel, weil das Beispiel ein großes Titelbild und große Schrift zeigt",
    );
    expect(aufbauDe({ inhalt: "karten" }).grund).toBe(
      "Kartenraster, weil das Beispiel ein Raster aus Karten zeigt",
    );
    expect(aufbauDe({ inhalt: "karten", dichte: "luftig" }).grund).toBe(
      "Kartenraster, weil das Beispiel ein luftiges Raster aus Karten zeigt",
    );
    expect(aufbauDe({ achse: "links", inhalt: "liste", schrift: "zurueckhaltend" }).grund).toBe(
      "Ruhige Liste, weil das Beispiel linksbündig ist, eine Liste zeigt und die Schrift zurückhält",
    );
    expect(aufbauDe({ achse: "links", schrift: "zurueckhaltend" }).grund).toBe(
      "Ruhige Liste, weil das Beispiel linksbündig ist und die Schrift zurückhält",
    );
    expect(aufbauDe({ titelbild: "gross" }).grund).toBe(
      "Großer Titel, weil das Beispiel ein großes Titelbild zeigt",
    );
    expect(aufbauDe({ schrift: "gross" }).grund).toBe(
      "Großer Titel, weil das Beispiel große Schrift zeigt",
    );
    expect(aufbauDe({ inhalt: "fliesstext" }).grund).toBe(
      "Großer Titel, weil die Merkmale zu keinem Aufbau eindeutig passen",
    );
    expect(aufbauDe(undefined).grund).toBe("Großer Titel, weil noch keine Merkmale erkannt sind");
  });

  it("starts every reason with the layout's name and judges nothing", () => {
    const schluessel = Object.keys(MERKMALE_WERTE) as (keyof Merkmale)[];
    let kombinoj: MerkmaleLego[] = [{}];
    for (const k of schluessel)
      kombinoj = kombinoj.flatMap((m) => [m, ...MERKMALE_WERTE[k].map((w) => ({ ...m, [k]: w }))]);
    for (const m of kombinoj) {
      const { aufbau, grund } = aufbauDe(m);
      expect(grund.startsWith(`${AUFBAU_ETIKEDOJ[aufbau]}, weil `)).toBe(true);
      expect(/Fehler|Problem|falsch|ungültig|\.$/.test(grund)).toBe(false);
    }
  });
});
