// Spec 058 (MP-2c, T10, MAW-5.1, AK-6): no model call without a click. One counting model double
// for all three KI routes (it tells them apart by the temperature, D-6). Everything a session does
// without the three buttons – creating brands, loading the canvas and its previews in every layout,
// writing contents, a name, colours and fonts, asking the price of all three purposes, uploading,
// removing and uploading again a Layout-Beispiel, a Pinterest preview and taking an image from it,
// „Anordnen“ (a state with new places), detaching and plugging edges, switching brands over
// „Marken“, saving and opening a Stand – leaves the counter at 0. Each POST of the three routes is
// exactly one call of its own purpose and none of the others.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { LeinwandAntwort, LeinwandStato, Zweck } from "./grafeo-gestalten-sicht.js";
import {
  BRETT_058,
  type KiServilo058,
  kiServilo058,
  LAYOUT_NAME_058,
  LAYOUT_PNG_058,
  markeMitAllem,
  PIN_BILD_058,
  STATO_058,
  senden,
} from "./test-doubles/ki-058.js";

const ZWECKOJ: readonly Zweck[] = ["profil", "namen", "aufbau"];

describe("MAW-5.1 (AK-6): the model is called only by the three buttons", () => {
  let k: KiServilo058;
  /** Every request of the session without a button, with its status. */
  const schritte: string[] = [];
  const frage = async (
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: unknown,
  ): Promise<string> => {
    const a = await senden(
      k.server,
      method,
      path,
      body === undefined ? undefined : JSON.stringify(body),
    );
    schritte.push(`${a.status} ${method} ${path.slice(0, 80)}`);
    return a.body.toString("utf8");
  };

  beforeAll(async () => {
    k = await kiServilo058("ki-zaehler-058-");
  });

  afterAll(async () => {
    await k?.server.close();
  });

  it("calls nothing on load, writes, estimates, layout, Pinterest, Anordnen, plugging, switching or Stände", async () => {
    for (const name of ["lumeto", "provo"]) await markeMitAllem(k.server, name);
    expect(k.modelo.summe()).toBe(0);

    // Load: the page, the canvas data with and without the 058 switch, fonts, the brand list.
    await frage("GET", "/");
    await frage("GET", "/marko/lumeto/grafeo");
    await frage("GET", "/api/leinwand?marko=lumeto");
    const bildo = JSON.parse(
      await frage("GET", "/api/leinwand?marko=lumeto&stufe=58"),
    ) as LeinwandAntwort;
    await frage("GET", "/api/marko/lumeto/schriften");
    await frage("GET", "/api/marken");

    // Every preview, in every layout and in „Komponenten“, light and dark.
    const vorschauen = bildo.nodoj.filter((n) => n.speco === "vorschau");
    expect(vorschauen.length).toBeGreaterThanOrEqual(2);
    for (const v of vorschauen) {
      await frage("GET", v.href);
      for (const aufbau of ["titel", "raster", "liste"])
        await frage("GET", v.href.replace(/aufbau=[a-z]+/, `aufbau=${aufbau}`));
      await frage(
        "GET",
        v.href.replace(/sxtupo=marke[^&]*(&aufbau=[a-z]+)?(&inh=[0-9a-z]+)?/, "sxtupo=komponenten"),
      );
    }

    // The price of all three purposes (read-only).
    for (const zweck of ZWECKOJ) await frage("GET", `/api/marko/lumeto/ki?zweck=${zweck}`);

    // Writes: a description typed, a name, colours, a font, a slider.
    const geschrieben: LeinwandStato = {
      ...STATO_058,
      knoten: STATO_058.knoten.map((n) =>
        n.id === "teksto-grundlagen" ? { ...n, inhalt: { beschreibung: "Neu getippt." } } : n,
      ),
    };
    await frage("PUT", "/api/marko/lumeto/leinwand-stato", geschrieben);
    for (const sxangxo of [
      { name: "Lumeto Licht" },
      { farbe: { rolle: "akzent", wert: "#d2552c" } },
      { neutral: { farbe: "#ebe5d8" } },
      { schrift: { rolle: "body", tiparo: "inter" } },
    ])
      await frage("POST", "/api/marko/lumeto/leinwand", sxangxo);

    // Layout-Beispiel: remove and upload again (colours only).
    await frage("DELETE", "/api/marko/lumeto/layout-beispiel");
    await frage("POST", "/api/marko/lumeto/layout-beispiel", {
      filename: LAYOUT_NAME_058,
      base64: LAYOUT_PNG_058.toString("base64"),
    });

    // Pinterest: the preview, then one image taken (only the `esploro.fetch` double is asked).
    await frage("POST", "/api/marko/lumeto/beispiele", { url: BRETT_058, vorschau: true });
    await frage("POST", "/api/marko/lumeto/beispiele", { url: PIN_BILD_058(1) });

    // „Anordnen“ (new places, one PUT) and detaching / plugging edges.
    const angeordnet: LeinwandStato = {
      ...geschrieben,
      knoten: geschrieben.knoten.map((n, i) => ({ ...n, x: 40 * i, y: 30 * i })),
    };
    await frage("PUT", "/api/marko/lumeto/leinwand-stato", angeordnet);
    await frage("PUT", "/api/marko/lumeto/leinwand-stato", {
      ...angeordnet,
      geloest: ["teksto-grundlagen.el", "teksto-werte.el.w2"],
      knoten: angeordnet.knoten.map((n) =>
        n.id === "ki-namen" ? { ...n, geloest: ["teksto-werte.el.w1"] } : n,
      ),
    });
    await frage("PUT", "/api/marko/lumeto/leinwand-stato", angeordnet);

    // Switching brands over „Marken“ and back.
    await frage("GET", "/api/marken");
    await frage("GET", "/api/leinwand?marko=provo&stufe=58");
    await frage("GET", "/api/marken");
    await frage("GET", "/api/leinwand?marko=lumeto&stufe=58");

    // A Stand saved and opened.
    const { id } = JSON.parse(
      await frage("POST", "/api/marko/lumeto/staende", { name: "vor dem Klick" }),
    ) as { id: string };
    await frage("POST", `/api/marko/lumeto/staende/${id}/oeffnen`);
    await frage("GET", "/api/leinwand?marko=lumeto&stufe=58");

    expect(schritte.length).toBeGreaterThan(30);
    expect(schritte.filter((s) => !/^(200|201|303) /.test(s))).toEqual([]);
    expect({ vokoj: k.modelo.vokoj, korpoj: k.modelo.korpoj.length }).toEqual({
      vokoj: { profil: 0, namen: 0, aufbau: 0 },
      korpoj: 0,
    });
  });

  it("one POST of each route is exactly one call of its own purpose", async () => {
    const vorher = k.modelo.summe();
    expect(vorher).toBe(0);
    for (const zweck of ZWECKOJ) {
      const davor = { ...k.modelo.vokoj };
      const a = await k.peti("lumeto", zweck);
      expect(a.status, `${zweck}: ${a.body.toString("utf8").slice(0, 120)}`).toBe(200);
      expect(k.modelo.vokoj).toEqual({ ...davor, [zweck]: davor[zweck] + 1 });
    }
    expect(k.modelo.vokoj).toEqual({ profil: 1, namen: 1, aufbau: 1 });
    // The answers carry the result, and reading the canvas afterwards calls nothing.
    await frage("GET", "/api/leinwand?marko=lumeto&stufe=58");
    for (const zweck of ZWECKOJ) await frage("GET", `/api/marko/lumeto/ki?zweck=${zweck}`);
    expect(k.modelo.summe()).toBe(3);
  });
});
