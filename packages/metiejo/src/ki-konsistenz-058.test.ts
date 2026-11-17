// Spec 058 (MP-2c, T10, MAW-5.1, plan §3.3): the three KI routes – `profil` („Marke auswerten“),
// `namen` („Vorschlagen“) and `aufbau` („Aufbau erkennen“) – answer every case of the error table the
// same way: an unknown brand (404), no model (503), no input with content (422), a provider error
// (502 with cost), the existing cost limit (502, no call), an unreadable answer (422 with cost) give
// one status, one body shape and one sentence across the three; none of them writes. A partly
// unreadable answer is 200 with the readable part and the rest named in `verworfen`, stored. Every
// result is stored with the brand it was asked for, even while another brand is written meanwhile.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  KEINE_EINGABE_SATZ,
  KI_NICHT_GEANTWORTET_SATZ,
  KI_UNLESBAR_SATZ,
  type LeinwandStato,
  type Zweck,
} from "./grafeo-gestalten-sicht.js";
import {
  json,
  type KiServilo058,
  kiServilo058,
  markeMitAllem,
  STATO_058,
  senden,
  TEILWEISE_058,
} from "./test-doubles/ki-058.js";
import { markeAnlegen } from "./test-doubles/servilo-044.js";

const ZWECKOJ: readonly Zweck[] = ["profil", "namen", "aufbau"];

/** Where each route stores its result in `leinwand.json`. */
const ORT: Readonly<Record<Zweck, { id: string; feld: string }>> = {
  profil: { id: "marko", feld: "profil" },
  namen: { id: "ki-namen", feld: "vorschlag" },
  aufbau: { id: "layout-beispiel", feld: "merkmale" },
};

/** The answer of one case: status, sorted keys, the sentence, the keys of the cost. */
interface Form {
  status: number;
  schluessel: string;
  satz: unknown;
  kosto: string;
}
function formDe(status: number, body: Buffer): Form {
  const wert = json(body) as Record<string, unknown>;
  return {
    status,
    schluessel: Object.keys(wert).sort().join(","),
    satz: wert.satz,
    kosto:
      typeof wert.kosto === "object" && wert.kosto !== null
        ? Object.keys(wert.kosto).sort().join(",")
        : "",
  };
}

describe("MAW-5.1: the three KI routes answer the error table identically", () => {
  let k: KiServilo058;
  let ohne: KiServilo058;
  let grenze: KiServilo058;
  const ergebnisDe = (s: KiServilo058, name: string, zweck: Zweck): unknown => {
    const stato = JSON.parse(s.dosiero(name, "leinwand.json")) as LeinwandStato;
    const inhalt = stato.knoten.find((n) => n.id === ORT[zweck].id)?.inhalt as
      | Record<string, unknown>
      | undefined;
    return inhalt?.[ORT[zweck].feld];
  };
  /** `leinwand.json` of a brand; "" while it has none. */
  const datei = (s: KiServilo058, name: string): string => {
    try {
      return s.dosiero(name, "leinwand.json");
    } catch {
      return "";
    }
  };
  /** Runs `fall` for each route; gives the forms, and whether `leinwand.json` stayed as it was. */
  const jeRoute = async (
    s: KiServilo058,
    name: string,
  ): Promise<{ formen: Record<Zweck, Form>; gleich: Record<Zweck, boolean> }> => {
    const formen = {} as Record<Zweck, Form>;
    const gleich = {} as Record<Zweck, boolean>;
    for (const zweck of ZWECKOJ) {
      const vorher = datei(s, name);
      const a = await s.peti(name, zweck);
      formen[zweck] = formDe(a.status, a.body);
      gleich[zweck] = datei(s, name) === vorher;
    }
    return { formen, gleich };
  };
  const einig = (formen: Record<Zweck, Form>): Form[] =>
    [...new Set(Object.values(formen).map((f) => JSON.stringify(f)))].map(
      (f) => JSON.parse(f) as Form,
    );

  beforeAll(async () => {
    k = await kiServilo058("ki-konsistenz-058-");
    ohne = await kiServilo058("ki-konsistenz-058-ohne-", { senModelo: true });
    // The cost limit of the existing protocol, reached before the first call (`limo: 0`).
    grenze = await kiServilo058("ki-konsistenz-058-grenze-", { limo: 0 });
    for (const s of [k, ohne, grenze]) {
      await markeMitAllem(s.server, "lumeto");
      await markeMitAllem(s.server, "zweite");
    }
    await markeAnlegen(k.server, "leer", "leer");
  });

  afterAll(async () => {
    for (const s of [k, ohne, grenze]) await s?.server.close();
  });

  it("an unknown brand: 404 with one sentence on all three", async () => {
    const formen = {} as Record<Zweck, Form>;
    for (const zweck of ZWECKOJ) {
      const a = await k.peti("nirgends", zweck);
      formen[zweck] = formDe(a.status, a.body);
    }
    expect(einig(formen)).toEqual([
      { status: 404, schluessel: "satz", satz: "Diese Marke gibt es nicht.", kosto: "" },
    ]);
  });

  it("no model: 503 {satz} with the same sentence on all three, nothing written", async () => {
    const { formen, gleich } = await jeRoute(ohne, "lumeto");
    const [form, ...rest] = einig(formen);
    expect(rest).toEqual([]);
    expect(form).toMatchObject({ status: 503, schluessel: "satz", kosto: "" });
    expect(String(form?.satz)).toMatch(/^Kein Sprachmodell eingerichtet/);
    expect(gleich).toEqual({ profil: true, namen: true, aufbau: true });
    expect(ohne.modelo.summe()).toBe(0);
  });

  it("no input with content: 422 „Noch keine Eingabe mit Inhalt“ on all three, no call", async () => {
    const { formen, gleich } = await jeRoute(k, "leer");
    expect(einig(formen)).toEqual([
      { status: 422, schluessel: "satz", satz: KEINE_EINGABE_SATZ, kosto: "" },
    ]);
    expect(gleich).toEqual({ profil: true, namen: true, aufbau: true });
    expect(k.modelo.summe()).toBe(0);
  });

  it("a provider error: 502 {satz, kosto} with the same sentence on all three, nothing written", async () => {
    k.modelo.status = 400;
    const { formen, gleich } = await jeRoute(k, "lumeto");
    k.modelo.status = 200;
    expect(einig(formen)).toEqual([
      {
        status: 502,
        schluessel: "kosto,satz",
        satz: KI_NICHT_GEANTWORTET_SATZ,
        kosto: "eligo,enigo,modelo,usd,zeit",
      },
    ]);
    expect(gleich).toEqual({ profil: true, namen: true, aufbau: true });
  });

  it("the existing cost limit: 502 with the same existing sentence on all three, no call", async () => {
    const { formen, gleich } = await jeRoute(grenze, "lumeto");
    const [form, ...rest] = einig(formen);
    expect(rest).toEqual([]);
    expect(form?.status).toBe(502);
    expect(String(form?.satz)).toMatch(/^Die Kostengrenze dieser Runde/);
    expect(gleich).toEqual({ profil: true, namen: true, aufbau: true });
    expect(grenze.modelo.summe()).toBe(0);
  });

  it("an unreadable answer: 422 {satz, kosto} with the same sentence on all three, nothing written", async () => {
    for (const zweck of ZWECKOJ) k.modelo.antwort[zweck] = "Leider kein JSON.";
    const { formen, gleich } = await jeRoute(k, "lumeto");
    k.modelo.antwort = {};
    expect(einig(formen)).toEqual([
      {
        status: 422,
        schluessel: "kosto,satz",
        satz: KI_UNLESBAR_SATZ,
        kosto: "eligo,enigo,modelo,usd,zeit",
      },
    ]);
    expect(gleich).toEqual({ profil: true, namen: true, aufbau: true });
  });

  it("a partly unreadable answer: 200, the readable part stored, the rest named in `verworfen`", async () => {
    const verworfen = {} as Record<Zweck, unknown>;
    for (const zweck of ZWECKOJ) {
      k.modelo.antwort[zweck] = TEILWEISE_058[zweck];
      const a = await k.peti("lumeto", zweck);
      expect(a.status, zweck).toBe(200);
      const wert = json(a.body) as Record<string, { verworfen?: unknown } | unknown>;
      const ergebnis = (zweck === "aufbau" ? wert : wert[ORT[zweck].feld]) as {
        verworfen?: unknown;
      };
      verworfen[zweck] = ergebnis.verworfen;
      expect(ergebnisDe(k, "lumeto", zweck), zweck).toBeDefined();
    }
    k.modelo.antwort = {};
    expect(verworfen).toEqual({ profil: ["primaer"], namen: ["namen"], aufbau: ["dichte"] });
  });

  it("every result is stored with the brand it was asked for while another brand is written", async () => {
    const falsch: string[] = [];
    for (const zweck of ZWECKOJ) {
      let los: () => void = () => undefined;
      k.modelo.halt = new Promise<void>((fertig) => {
        los = fertig;
      });
      const angekommen = new Promise<void>((fertig) => {
        k.modelo.alveninta = fertig;
      });
      const laufend = k.peti("lumeto", zweck);
      await angekommen;
      const anders: LeinwandStato = {
        ...STATO_058,
        knoten: STATO_058.knoten.map((n) =>
          n.id === "teksto-grundlagen" ? { ...n, inhalt: { beschreibung: `Anders ${zweck}.` } } : n,
        ),
      };
      const geschrieben = await senden(
        k.server,
        "PUT",
        "/api/marko/zweite/leinwand-stato",
        JSON.stringify(anders),
      );
      const zweiteDatei = k.dosiero("zweite", "leinwand.json");
      los();
      const a = await laufend;
      k.modelo.halt = undefined;
      k.modelo.alveninta = undefined;
      if (geschrieben.status !== 200) falsch.push(`${zweck}: PUT zweite ${geschrieben.status}`);
      if (a.status !== 200) falsch.push(`${zweck}: ${a.status}`);
      if (ergebnisDe(k, "lumeto", zweck) === undefined) falsch.push(`${zweck}: nicht bei lumeto`);
      if (k.dosiero("zweite", "leinwand.json") !== zweiteDatei)
        falsch.push(`${zweck}: zweite geändert`);
      if (ergebnisDe(k, "zweite", zweck) !== undefined) falsch.push(`${zweck}: bei zweite`);
    }
    expect(falsch).toEqual([]);
  });
});
