// Spec 058 (MP-2c, T10, MAW-5.1): the acceptance of AK-11, AK-14, AK-16, AK-17 and AK-18 end to end
// at the server, with the model double (offline, 0 $) and the invented brand „lumeto“:
//   - AK-14: an older brand (a Spec 056 canvas without Grundlagen) gets Grundlagen leftmost at the
//     start places; a name writes `etikedoj.marko`, identifier, folder and canvas address stay;
//   - AK-18: „Aufbau erkennen“ gives the features; the layout follows by the fixed mapping, the
//     preview's address carries it and the answer names the reason; a hand choice wins;
//   - AK-16: profile and name proposal turn „veraltet“ when an input changes; taking over the own
//     proposal leaves the profile current;
//   - AK-11: the first takeover from a result saves exactly one Stand „vor Übernahme, HH:MM“ and
//     marks the result; a second one saves none; opening the Stand brings back the canvas and the
//     colours as they were before the click;
//   - AK-17: profile, name proposal, features and the layout choice are there after a reload and go
//     into Stände and come back from them.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type BildoFarbo,
  type LeinwandAntwort,
  type LeinwandStato,
  type NamenVorschlag,
  type Profil,
  poziciojKun,
  vorUebernahmeDe,
} from "./grafeo-gestalten-sicht.js";
import { type AuswertungEnigo, aufbauDe, eingabenDe, veraltet } from "./leinwand-auswertung.js";
import { markoDir } from "./marko.js";
import {
  AUFBAU_ANTWORT_058,
  json,
  type KiServilo058,
  kiServilo058,
  markeMitAllem,
  PROFIL_ANTWORT_058,
  senden,
} from "./test-doubles/ki-058.js";

const NOMO = "lumeto";

describe("MAW-5.1: acceptance at the server (AK-11, AK-14, AK-16, AK-17, AK-18)", () => {
  let k: KiServilo058;

  const leinwand = async (name = NOMO): Promise<LeinwandAntwort> =>
    json(
      (await k.server.anfrage("GET", `/api/leinwand?marko=${name}&stufe=58`)).body,
    ) as LeinwandAntwort;
  /** The stored canvas state (`leinwand.json`), as the canvas writes it back. */
  const stato = async (name = NOMO): Promise<LeinwandStato> =>
    JSON.parse(k.dosiero(name, "leinwand.json")) as LeinwandStato;
  const inhalt = (s: LeinwandStato, id: string): Record<string, unknown> | undefined =>
    s.knoten.find((n) => n.id === id)?.inhalt as Record<string, unknown> | undefined;
  const profilDe = (s: LeinwandStato): Profil | undefined =>
    inhalt(s, "marko")?.profil as Profil | undefined;
  const vorschlagDe = (s: LeinwandStato): NamenVorschlag | undefined =>
    inhalt(s, "ki-namen")?.vorschlag as NamenVorschlag | undefined;
  const skribi = async (sxangxo: unknown, name = NOMO): Promise<number> =>
    (await senden(k.server, "POST", `/api/marko/${name}/leinwand`, JSON.stringify(sxangxo))).status;
  const statoMeti = async (s: LeinwandStato, name = NOMO): Promise<number> =>
    (await senden(k.server, "PUT", `/api/marko/${name}/leinwand-stato`, JSON.stringify(s))).status;
  const agordo = (name = NOMO): { name: string; etikedoj?: { marko?: string } } =>
    JSON.parse(k.dosiero(name, "entwurf.json")) as { name: string; etikedoj?: { marko?: string } };
  const staende = async (): Promise<{ id: string; name: string }[]> =>
    json((await k.server.anfrage("GET", `/api/marko/${NOMO}/staende`)).body) as {
      id: string;
      name: string;
    }[];
  const standSichern = async (name: string): Promise<string> => {
    const a = await senden(
      k.server,
      "POST",
      `/api/marko/${NOMO}/staende`,
      JSON.stringify({ name }),
    );
    expect(a.status).toBe(201);
    return (json(a.body) as { id: string }).id;
  };
  const standOeffnen = async (id: string): Promise<void> => {
    expect(
      (await k.server.anfrage("POST", `/api/marko/${NOMO}/staende/${id}/oeffnen`)).status,
    ).toBe(200);
  };
  /** The input of `eingabenDe`, built from the server's answers as the canvas builds it. */
  const enigoDe = async (): Promise<AuswertungEnigo> => {
    const l = await leinwand();
    const s = json((await k.server.anfrage("GET", `/api/marko/${NOMO}/schriften`)).body) as {
      schriften: Record<string, { familie: string; tiparo?: string }>;
    };
    const schriften: AuswertungEnigo["schriften"] = {};
    for (const rolle of ["display", "body"] as const) {
      const f = s.schriften[rolle];
      if (f !== undefined)
        schriften[rolle] = {
          familie: f.familie,
          ...(f.tiparo === undefined ? {} : { tiparo: f.tiparo }),
        };
    }
    return {
      stato: l.stato ?? { knoten: [] },
      nomo: agordo().etikedoj?.marko ?? NOMO,
      farben: l.nodoj.filter((n): n is BildoFarbo => n.speco === "farbo"),
      schriften,
    };
  };
  const farbeDe = (l: LeinwandAntwort, id: string): string | undefined => {
    const n = l.nodoj.find((x) => x.id === id) as { wert?: string } | undefined;
    return n?.wert?.toLowerCase();
  };
  const hrefDe = (l: LeinwandAntwort, id: string): string =>
    (l.nodoj.find((n) => n.id === id) as { href?: string } | undefined)?.href ?? "";

  beforeAll(async () => {
    k = await kiServilo058("abnahme-058-");
    await markeMitAllem(k.server, NOMO);
  });

  afterAll(async () => {
    await k?.server.close();
  });

  it("AK-14: an older brand gets Grundlagen leftmost; the name writes etikedoj.marko, identifier and folder stay", async () => {
    const kreo = await k.server.anfrage(
      "POST",
      "/marko",
      "name=altlicht&basis=leer&ziel=leinwand",
      "application/x-www-form-urlencoded",
    );
    expect(kreo.status).toBe(303);
    // A canvas of Spec 056: text nodes and Beispiele, no Grundlagen, no Layout-Beispiel.
    const alt: LeinwandStato = {
      version: 1,
      knoten: [
        { id: "teksto-ausgangslage", inhalt: { text: "Leuchten für Werkstätten." } },
        { id: "teksto-werte", inhalt: { werte: [{ id: "w1", text: "ehrlich" }] } },
        { id: "beispiele", speco: "beispiele", inhalt: { dateien: [] } },
      ],
      kabloj: {},
    };
    expect(await statoMeti(alt, "altlicht")).toBe(200);
    const l = await leinwand("altlicht");
    expect(l.stato?.knoten.map((n) => n.id)).toEqual(alt.knoten.map((n) => n.id));
    const ids = [
      ...new Set([
        "teksto-grundlagen",
        ...l.nodoj.map((n) => n.id),
        ...alt.knoten.map((n) => n.id),
      ]),
    ];
    const plaetze = poziciojKun(
      new Map(),
      ids.map((id) => ({ id })),
      { stufe: 58 },
    );
    const grundlagen = plaetze.get("teksto-grundlagen");
    expect(grundlagen).toBeDefined();
    const links = [...plaetze.entries()].filter(
      ([id, p]) => id !== "teksto-grundlagen" && p.x <= (grundlagen?.x ?? 0),
    );
    expect(links).toEqual([]);

    const ordner = markoDir(k.server.workdir, "altlicht");
    expect(await skribi({ name: "Altlicht Leuchten" }, "altlicht")).toBe(200);
    expect(agordo("altlicht")).toMatchObject({
      name: "altlicht",
      etikedoj: { marko: "Altlicht Leuchten" },
    });
    expect(markoDir(k.server.workdir, "altlicht")).toBe(ordner);
    expect((await k.server.anfrage("GET", "/marko/altlicht/grafeo")).status).toBe(200);
    expect((await leinwand("altlicht")).stato?.knoten.map((n) => n.id)).toEqual(
      alt.knoten.map((n) => n.id),
    );
  });

  it("AK-18: the features give the layout by the fixed mapping, with its reason; a hand choice wins", async () => {
    const a = await k.peti(NOMO, "aufbau");
    expect(a.status).toBe(200);
    const antwort = json(a.body) as {
      aufbau: string;
      grund: string;
      merkmale: Record<string, string>;
    };
    expect(antwort.merkmale).toEqual(AUFBAU_ANTWORT_058.merkmale);
    expect({ aufbau: antwort.aufbau, grund: antwort.grund }).toEqual(
      aufbauDe(AUFBAU_ANTWORT_058.merkmale),
    );
    expect(antwort.aufbau).toBe("raster");
    expect(antwort.grund).not.toBe("");
    let l = await leinwand();
    for (const id of ["vorschau-hell", "vorschau-dunkel"])
      expect(hrefDe(l, id)).toMatch(/[?&]aufbau=raster&/);
    // A hand choice on one preview wins over the features; the other still follows them.
    const s = await stato();
    expect(
      await statoMeti({ ...s, knoten: [...s.knoten, { id: "vorschau-hell", aufbau: "liste" }] }),
    ).toBe(200);
    l = await leinwand();
    expect(hrefDe(l, "vorschau-hell")).toMatch(/[?&]aufbau=liste&/);
    expect(hrefDe(l, "vorschau-dunkel")).toMatch(/[?&]aufbau=raster&/);
    expect(hrefDe(l, "vorschau-hell")).not.toMatch(/auto/);
  });

  it("AK-16: an input change makes profile and name proposal „veraltet“; the own takeover does not", async () => {
    expect((await k.peti(NOMO, "profil")).status).toBe(200);
    expect((await k.peti(NOMO, "namen")).status).toBe(200);
    const profil = profilDe(await stato());
    const vorschlag = vorschlagDe(await stato());
    expect(profil?.kernsatz).toBe(PROFIL_ANTWORT_058.kernsatz);
    expect(vorschlag?.namen.length).toBeGreaterThanOrEqual(6);
    const jetzt = await enigoDe();
    expect(veraltet(profil, eingabenDe(jetzt, "profil"))).toBe(false);
    expect(veraltet(vorschlag, eingabenDe(jetzt, "namen"))).toBe(false);
    // A changed input (the description, as typed in Grundlagen): both stale.
    const anders: AuswertungEnigo = {
      ...jetzt,
      stato: {
        ...jetzt.stato,
        knoten: jetzt.stato.knoten.map((n) =>
          n.id === "teksto-grundlagen"
            ? { ...n, inhalt: { beschreibung: "Etwas ganz anderes." } }
            : n,
        ),
      },
    };
    expect(veraltet(profil, eingabenDe(anders, "profil"))).toBe(true);
    expect(veraltet(vorschlag, eingabenDe(anders, "namen"))).toBe(true);
  });

  it("AK-11: the first takeover saves exactly one Stand and marks the result; the Stand brings back the state before the click", async () => {
    const vorKlick = await leinwand();
    const vorStato = await stato();
    const profil = profilDe(vorStato);
    expect(profil?.gesichert).toBeUndefined();
    const anzahl = (await staende()).length;
    // First takeover: the canvas saves the Stand, marks the result, then writes the parts.
    const standName = vorUebernahmeDe(9, 5);
    expect(standName).toBe("vor Übernahme, 09:05");
    const id = await standSichern(standName);
    const markiert: LeinwandStato = {
      ...vorStato,
      knoten: vorStato.knoten.map((n) =>
        n.id === "marko" ? { ...n, inhalt: { profil: { ...profil, gesichert: id } } } : n,
      ),
    };
    expect(await statoMeti(markiert)).toBe(200);
    const v = PROFIL_ANTWORT_058.vorschlag;
    expect(await skribi({ farbe: { rolle: "primaer", wert: v.primaer.hex } })).toBe(200);
    // A second takeover from the same result: no further Stand (`gesichert` is set).
    expect(profilDe(await stato())?.gesichert).toBe(id);
    expect(await skribi({ farbe: { rolle: "akzent", wert: v.akzent.hex } })).toBe(200);
    expect(await skribi({ neutral: { farbe: v.neutral.hex } })).toBe(200);
    expect(await skribi({ schrift: { rolle: "display", tiparo: "lora" } })).toBe(200);
    const liste = await staende();
    expect(liste).toHaveLength(anzahl + 1);
    expect(liste.filter((s) => s.name.startsWith("vor Übernahme, "))).toHaveLength(1);
    // The own takeover leaves the profile current.
    expect(veraltet(profilDe(await stato()), eingabenDe(await enigoDe(), "profil"))).toBe(false);
    const nach = await leinwand();
    expect(farbeDe(nach, "farbo-primaer")).toBe(v.primaer.hex);
    // Back: opening the Stand restores colours, font and canvas state of before the click.
    await standOeffnen(id);
    const zurueck = await leinwand();
    for (const farbe of ["farbo-primaer", "farbo-akzent", "farbo-neutral"])
      expect(farbeDe(zurueck, farbe), farbe).toBe(farbeDe(vorKlick, farbe));
    expect(zurueck.stato).toEqual(vorKlick.stato);
    expect(profilDe(await stato())?.gesichert).toBeUndefined();
  });

  it("AK-17: profile, name proposal, features and layout choice survive a reload and go into Stände", async () => {
    const vorher = await stato();
    const teile = (s: LeinwandStato) => ({
      profil: profilDe(s),
      vorschlag: vorschlagDe(s),
      merkmale: inhalt(s, "layout-beispiel")?.merkmale,
      wahl: s.knoten.find((n) => n.id === "vorschau-hell")?.aufbau,
    });
    const soll = teile(vorher);
    expect(soll.profil).toBeDefined();
    expect(soll.vorschlag).toBeDefined();
    expect(soll.merkmale).toEqual(AUFBAU_ANTWORT_058.merkmale);
    expect(soll.wahl).toBe("liste");
    // A reload: the same.
    expect(teile(await stato())).toEqual(soll);
    // Into a Stand, change all four, open the Stand: all four come back.
    const id = await standSichern("alle vier");
    const geaendert: LeinwandStato = {
      ...vorher,
      knoten: vorher.knoten
        .filter((n) => n.id !== "marko" && n.id !== "ki-namen")
        .map((n) => (n.id === "vorschau-hell" ? { ...n, aufbau: "titel" as const } : n)),
    };
    expect(await statoMeti(geaendert)).toBe(200);
    expect((await senden(k.server, "DELETE", `/api/marko/${NOMO}/layout-beispiel`)).status).toBe(
      200,
    );
    const mitte = teile(await stato());
    expect(mitte).toEqual({
      profil: undefined,
      vorschlag: undefined,
      merkmale: undefined,
      wahl: "titel",
    });
    await standOeffnen(id);
    expect(teile(await stato())).toEqual(soll);
    expect(hrefDe(await leinwand(), "vorschau-hell")).toMatch(/[?&]aufbau=liste&/);
  });
});
