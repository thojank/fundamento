// Spec 058 (MP-2c, T7, MAW-4.1): „Marke auswerten“ – `POST /api/marko/:name/ki/profil` through the
// shared KI helper (`leinwand-ki.ts`), product spec E level 2, E-2, E-3 (AK-2, AK-6, AK-11, AK-12,
// AK-16, AK-17). The model is a counting fetch double (offline, 0 $):
//   - no call without the POST, exactly one with it;
//   - the body is text only – no `image_url`, no file name, no image or Pinterest address – even with
//     Beispiele (an image taken from Pinterest, a Pinterest link) and a Layout-Beispiel present; it
//     carries the Layout-Beispiel's features and words, Tonalität, detected and set colours, fonts;
//   - stderr and the Kroniko carry no key, no text of the brand and no image data;
//   - a partly unreadable answer keeps the readable part and names the rest in `verworfen`; an
//     unreadable one is 422 with its cost and writes nothing; the rest of the §3.3 error table;
//   - the result is stored in `marko.inhalt` of the brand it was asked for;
//   - taking over every part of the proposal through the canvas write path leaves `veraltet` false
//     (the shared pure function over the state after the writes); changing an input makes it true.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Provider } from "./asistanto/ki.js";
import {
  type BildoFarbo,
  KEINE_EINGABE_SATZ,
  KI_NICHT_GEANTWORTET_SATZ,
  KI_UNLESBAR_SATZ,
  type LeinwandStato,
  type Profil,
} from "./grafeo-gestalten-sicht.js";
import {
  type AuswertungEnigo,
  eingabenDe,
  profilEingabenDe,
  veraltet,
} from "./leinwand-auswertung.js";
import { KI_TEMPERATUROJ } from "./leinwand-ki.js";
import { markoDir } from "./marko.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

/** `TestServilo.anfrage` speaks PUT too; its type names only GET and POST. */
const put = (s: TestServilo, path: string, body: string): ReturnType<TestServilo["anfrage"]> =>
  (s.anfrage as (m: string, p: string, b?: string) => ReturnType<TestServilo["anfrage"]>)(
    "PUT",
    path,
    body,
  );

const SEKRETO = "sk-058-profil-nur-im-test";
const BESCHREIBUNG = "Lumeto baut Leuchten aus Altglas für kleine Werkstätten.";

/**
 * The canvas state of the brand (invented): Grundlagen, Werte, Tonalität, Wettbewerb with a
 * Pinterest and an image address, Beispiele with an image taken from Pinterest and a Pinterest
 * link, a Layout-Beispiel with its file, features and words.
 */
const STATO: LeinwandStato = {
  version: 1,
  knoten: [
    { id: "teksto-grundlagen", inhalt: { beschreibung: BESCHREIBUNG } },
    {
      id: "teksto-werte",
      inhalt: {
        werte: [
          { id: "w1", text: "ehrlich" },
          { id: "w2", text: "robust" },
        ],
      },
    },
    {
      id: "teksto-tonalitaet",
      speco: "teksto",
      x: 0,
      y: 400,
      inhalt: { "foermlich-locker": 1, "warm-kuehl": -2 },
    },
    {
      id: "teksto-wettbewerb",
      speco: "teksto",
      x: 0,
      y: 0,
      inhalt: {
        liste: [
          { name: "Hellraum", adresse: "https://www.pinterest.de/hellraum/" },
          { adresse: "https://bilder.example/schild.png" },
        ],
      },
    },
    {
      id: "beispiele",
      speco: "beispiele",
      x: 400,
      y: -1296,
      inhalt: {
        dateien: [
          {
            name: "werkstatt-foto.png",
            art: "png",
            farben: [{ hex: "#2f5bff", anteil: 60, hell: false, bunt: true, leit: true }],
            quelle: "https://i.pinimg.com/736x/aa/bb/werkstatt.jpg",
          },
        ],
        verweise: [{ adresse: "https://pin.it/2lumeto", titel: "Werkstatt-Licht" }],
      },
    },
    {
      id: "layout-beispiel",
      inhalt: {
        datei: {
          name: "layout-seite.png",
          art: "png",
          farben: [{ hex: "#1e1d22", anteil: 70, hell: false, bunt: false, leit: false }],
        },
        merkmale: { inhalt: "karten", dichte: "luftig" },
        worte: "Ein ruhiges Raster aus drei Karten.",
      },
    },
  ],
  kabloj: {},
};

const ANTWORT_OBJEKTO = {
  kernsatz: "Gutes Licht aus Altglas, dort wo mit den Händen gearbeitet wird.",
  leitgedanken: [
    { titel: "Nah am Werkstück", text: "Licht, das dem Handgriff folgt." },
    { titel: "Ehrlich gebaut", text: "Jedes Teil lässt sich tauschen." },
    { titel: "Zweites Leben", text: "Altglas wird Leuchte." },
  ],
  charakter: ["handfest", "warm", "geradeaus", "geduldig"],
  passt: ["„ehrlich“ und Altglas tragen dieselbe Haltung."],
  reibt: ["Die Tonalität sagt „warm“, das Blau aus den Beispielen ist kühl."],
  vorschlag: {
    primaer: { hex: "#C6F135", grund: "Frisch wie die Werkstatt." },
    akzent: { hex: "#d2552c", grund: "Warm für „ehrlich“." },
    neutral: { hex: "#ebe5d8", grund: "Warm getönt statt kühl grau." },
    schrift: { display: "Lora", body: "Inter", grund: "Handwerklich und gut lesbar." },
  },
};
const ANTWORT = JSON.stringify(ANTWORT_OBJEKTO);

/** The fetch double: counts, keeps the bodies, answers what `antwort` says. */
const modelo = {
  vokoj: 0,
  korpoj: [] as string[],
  antwort: ANTWORT as string,
  status: 200,
  halt: undefined as Promise<void> | undefined,
  alveninta: undefined as (() => void) | undefined,
};
const fakeFetch = async (_url: string, init: RequestInit): Promise<Response> => {
  modelo.vokoj += 1;
  modelo.korpoj.push(String(init.body));
  modelo.alveninta?.();
  if (modelo.halt !== undefined) await modelo.halt;
  if (modelo.status !== 200)
    return new Response(JSON.stringify({ message: "invalid request" }), { status: modelo.status });
  return new Response(
    JSON.stringify({
      choices: [{ message: { role: "assistant", content: modelo.antwort } }],
      usage: { prompt_tokens: 900, completion_tokens: 300 },
    }),
    { status: 200 },
  );
};
const sleep = (): Promise<void> => Promise.resolve();

const json = (body: Buffer): unknown => JSON.parse(body.toString("utf8"));

describe("MAW-4.1: POST /api/marko/:name/ki/profil", () => {
  let server: TestServilo;
  const stderr: string[] = [];
  const dosiero = (name: string, datei: string): string =>
    readFileSync(join(markoDir(server.workdir, name), datei), "utf8");
  const stato = (name: string): LeinwandStato =>
    JSON.parse(dosiero(name, "leinwand.json")) as LeinwandStato;
  const profilDe = (name: string): Profil | undefined =>
    (stato(name).knoten.find((k) => k.id === "marko")?.inhalt as { profil?: Profil } | undefined)
      ?.profil;
  const peti = (name = "lumeto") => server.anfrage("POST", `/api/marko/${name}/ki/profil`, "{}");
  const skribi = async (name: string, sxangxo: unknown): Promise<number> =>
    (await server.anfrage("POST", `/api/marko/${name}/leinwand`, JSON.stringify(sxangxo))).status;

  /** The input of `eingabenDe` as the canvas builds it: the stored state, the Bildo, the fonts. */
  const enigoDe = async (name: string): Promise<AuswertungEnigo> => {
    const leinwand = json(
      (await server.anfrage("GET", `/api/leinwand?marko=${name}&stufe=58`)).body,
    ) as { nodoj: { speco: string }[]; stato: LeinwandStato | null };
    const schriftenAntwort = json(
      (await server.anfrage("GET", `/api/marko/${name}/schriften`)).body,
    ) as { schriften: Record<string, { familie: string; tiparo?: string }> };
    const schriften: AuswertungEnigo["schriften"] = {};
    for (const rolle of ["display", "body"] as const) {
      const s = schriftenAntwort.schriften[rolle];
      if (s !== undefined)
        schriften[rolle] = {
          familie: s.familie,
          ...(s.tiparo === undefined ? {} : { tiparo: s.tiparo }),
        };
    }
    return {
      stato: leinwand.stato ?? { knoten: [] },
      nomo: name,
      farben: leinwand.nodoj.filter((n): n is BildoFarbo => n.speco === "farbo"),
      schriften,
    };
  };

  beforeAll(async () => {
    server = await testServilo(
      "ki-profil-058-",
      {
        ki: {
          provider: new Provider("mistral", "ministral-14b-2512", SEKRETO),
          fetch: fakeFetch,
          sleep,
        },
      },
      undefined,
      (t) => stderr.push(t),
    );
    for (const name of ["lumeto", "zweite", "leerlicht"]) await markeAnlegen(server, name, "leer");
    for (const name of ["lumeto", "zweite"]) {
      const gesendet = await put(
        server,
        `/api/marko/${name}/leinwand-stato`,
        JSON.stringify(STATO),
      );
      expect(gesendet.status).toBe(200);
      // A set colour and a font pair are inputs too.
      expect(await skribi(name, { farbe: { rolle: "primaer", wert: "#2f5bff" } })).toBe(200);
      expect(await skribi(name, { schrift: { rolle: "display", tiparo: "fraunces" } })).toBe(200);
      expect(await skribi(name, { schrift: { rolle: "body", tiparo: "fraunces" } })).toBe(200);
    }
  });

  afterAll(async () => {
    await server?.close();
  });

  it("calls no model on load, writes or estimates (AK-6); one POST is one call", async () => {
    expect((await server.anfrage("GET", "/api/leinwand?marko=lumeto&stufe=58")).status).toBe(200);
    expect((await server.anfrage("GET", "/api/marko/lumeto/ki?zweck=profil")).status).toBe(200);
    expect(modelo.vokoj).toBe(0);
    const antwort = await peti();
    expect(antwort.status).toBe(200);
    expect(modelo.vokoj).toBe(1);
  });

  it("sends the whole input as text only: no image part, file name, image or Pinterest address (AK-12, E-3)", () => {
    const korpo = modelo.korpoj[0] ?? "";
    expect(korpo).not.toContain("image_url");
    expect(korpo).not.toContain("data:image");
    for (const stueck of [
      "werkstatt-foto",
      "layout-seite",
      ".png",
      ".jpg",
      "pinimg",
      "pinterest",
      "pin.it",
      "Werkstatt-Licht",
      "bilder.example",
    ])
      expect(korpo).not.toContain(stueck);
    const body = JSON.parse(korpo) as {
      model: string;
      temperature: number;
      messages: { role: string; content: unknown }[];
    };
    expect(body.model).toBe("ministral-14b-2512");
    expect(body.temperature).toBe(KI_TEMPERATUROJ.profil);
    expect(body.messages.every((m) => typeof m.content === "string")).toBe(true);
    // Everything that is text: Grundlagen, Werte, Tonalität as word pairs with values, the detected
    // colours, the Layout-Beispiel's features, words and colours, the set colour and the fonts.
    for (const stueck of [
      "Altglas",
      "ehrlich",
      "Hellraum",
      "förmlich – locker: 1",
      "warm – kühl: -2",
      "#2f5bff (60 %, dunkel, bunt)",
      "inhalt = karten",
      "Ein ruhiges Raster aus drei Karten.",
      "#1e1d22",
      "Primär #2f5bff",
      "Überschrift Fraunces",
    ])
      expect(korpo).toContain(stueck);
    expect(korpo).not.toContain("response_format");
  });

  it("answers and stores the profile in marko.inhalt, fonts as catalog ids, without `gesichert` (AK-2, AK-17)", async () => {
    const gespeichert = profilDe("lumeto");
    expect(gespeichert?.kernsatz).toBe(ANTWORT_OBJEKTO.kernsatz);
    expect(gespeichert?.leitgedanken).toEqual(ANTWORT_OBJEKTO.leitgedanken);
    expect(gespeichert?.charakter).toEqual(ANTWORT_OBJEKTO.charakter);
    expect(gespeichert?.passt).toEqual(ANTWORT_OBJEKTO.passt);
    expect(gespeichert?.reibt).toEqual(ANTWORT_OBJEKTO.reibt);
    expect(gespeichert?.vorschlag).toEqual({
      primaer: { hex: "#c6f135", grund: "Frisch wie die Werkstatt." },
      akzent: { hex: "#d2552c", grund: "Warm für „ehrlich“." },
      neutral: { hex: "#ebe5d8", grund: "Warm getönt statt kühl grau." },
      schrift: { display: "lora", body: "inter", grund: "Handwerklich und gut lesbar." },
    });
    expect(gespeichert?.verworfen).toBeUndefined();
    expect(gespeichert?.gesichert).toBeUndefined();
    expect(gespeichert?.kosto).toMatchObject({
      enigo: 900,
      eligo: 300,
      modelo: "mistral/ministral-14b-2512",
    });
    expect(Number.isNaN(Date.parse(gespeichert?.kosto.zeit ?? ""))).toBe(false);
    // The values of the five parts at the time of the evaluation, and the abdruck of the inputs.
    const enigo = await enigoDe("lumeto");
    const eingaben = eingabenDe(enigo, "profil");
    expect(gespeichert?.eingaben).toEqual(profilEingabenDe(eingaben));
    expect(gespeichert?.eingaben).toEqual({
      primaer: "#2f5bff",
      display: "fraunces",
      body: "fraunces",
    });
    expect(gespeichert === undefined ? true : veraltet(gespeichert, eingaben)).toBe(false);
    // The other nodes stay as they were written.
    expect(stato("lumeto").knoten.filter((k) => k.id !== "marko")).toEqual(
      STATO.knoten.filter((k) => k.id !== "marko"),
    );
    // A new evaluation answers what it stores; the next load carries it.
    const neu = await peti();
    const { profil } = json(neu.body) as { profil: Profil };
    expect(profil).toEqual(profilDe("lumeto"));
    const leinwand = json(
      (await server.anfrage("GET", "/api/leinwand?marko=lumeto&stufe=58")).body,
    ) as { stato: LeinwandStato };
    const knoto = leinwand.stato.knoten.find((k) => k.id === "marko");
    expect((knoto?.inhalt as { profil?: unknown } | undefined)?.profil).toEqual(profil);
  });

  it("writes one Kroniko entry per call without any text of the brand; stderr and Kroniko hold no key and no image data", () => {
    const linioj = dosiero("lumeto", "kroniko.jsonl").trim().split("\n");
    const ki = linioj
      .map((l) => JSON.parse(l) as Record<string, unknown>)
      .filter((e) => (e.detaloj as { zweck?: string } | undefined)?.zweck === "leinwand-profil");
    expect(ki).toHaveLength(modelo.vokoj);
    for (const ero of ki) {
      expect(ero).toMatchObject({
        ago: "propono",
        fonto: "agento",
        modelo: "mistral/ministral-14b-2512",
        kosto: { enigo: 900, eligo: 300, requests: 1 },
        detaloj: { zweck: "leinwand-profil" },
      });
      expect(ero.teksto).toBeUndefined();
      expect(ero.faceto).toBeUndefined();
      expect(Object.keys(ero.detaloj as object)).toEqual(["zweck"]);
    }
    const kroniko = dosiero("lumeto", "kroniko.jsonl");
    const log = stderr.join("");
    for (const stueck of [
      SEKRETO,
      "Altglas",
      "ehrlich",
      "Hellraum",
      "Werkstück",
      "handfest",
      "werkstatt-foto",
      "pinimg",
      "data:image",
      "base64",
    ]) {
      expect(kroniko).not.toContain(stueck);
      expect(log).not.toContain(stueck);
    }
  });

  it("keeps the readable part of a partly unreadable answer and names the rest in `verworfen`", async () => {
    modelo.antwort = JSON.stringify({
      ...ANTWORT_OBJEKTO,
      leitgedanken: [{ titel: "Nah am Werkstück", text: "Licht." }, { titel: "" }],
      vorschlag: {
        primaer: { hex: "grün", grund: "?" },
        akzent: ANTWORT_OBJEKTO.vorschlag.akzent,
        neutral: ANTWORT_OBJEKTO.vorschlag.neutral,
        schrift: { display: "Eine Schrift, die es nicht gibt", body: "Inter", grund: "" },
      },
    });
    const antwort = await peti();
    modelo.antwort = ANTWORT;
    expect(antwort.status).toBe(200);
    const { profil } = json(antwort.body) as { profil: Profil };
    expect(profil.kernsatz).toBe(ANTWORT_OBJEKTO.kernsatz);
    expect(profil.leitgedanken).toEqual([{ titel: "Nah am Werkstück", text: "Licht." }]);
    expect(profil.vorschlag).toEqual({
      akzent: { hex: "#d2552c", grund: "Warm für „ehrlich“." },
      neutral: { hex: "#ebe5d8", grund: "Warm getönt statt kühl grau." },
    });
    expect(profil.verworfen).toEqual(["leitgedanken", "primaer", "schrift"]);
    expect(profilDe("lumeto")).toEqual(profil);
  });

  it("maps an unreadable answer to 422 with its cost and changes nothing", async () => {
    expect((await peti()).status).toBe(200);
    const vorher = dosiero("lumeto", "leinwand.json");
    modelo.antwort = "Hier ist ein schönes Profil, leider ohne JSON.";
    const antwort = await peti();
    modelo.antwort = ANTWORT;
    expect(antwort.status).toBe(422);
    expect(json(antwort.body)).toMatchObject({
      satz: KI_UNLESBAR_SATZ,
      kosto: { enigo: 900, eligo: 300, modelo: "mistral/ministral-14b-2512" },
    });
    expect(dosiero("lumeto", "leinwand.json")).toBe(vorher);
  });

  it("maps a provider error to 502 with the existing sentence and cost, keeps the result", async () => {
    const vorher = dosiero("lumeto", "leinwand.json");
    modelo.status = 400;
    const antwort = await peti();
    modelo.status = 200;
    expect(antwort.status).toBe(502);
    const korpo = json(antwort.body) as { satz: string; kosto?: { enigo: number } };
    expect(korpo.satz).toBe(KI_NICHT_GEANTWORTET_SATZ);
    expect(korpo.kosto).toMatchObject({ enigo: 0, eligo: 0, modelo: "mistral/ministral-14b-2512" });
    expect(dosiero("lumeto", "leinwand.json")).toBe(vorher);
    expect(stderr.join("")).not.toContain(SEKRETO);
  });

  it("answers 422 „Noch keine Eingabe mit Inhalt“ without a call, 404 for an unknown brand", async () => {
    const vokoj = modelo.vokoj;
    const leer = await peti("leerlicht");
    expect(leer.status).toBe(422);
    expect(json(leer.body)).toEqual({ satz: KEINE_EINGABE_SATZ });
    const nenia = await peti("nirgends");
    expect(nenia.status).toBe(404);
    expect(json(nenia.body)).toEqual({ satz: "Diese Marke gibt es nicht." });
    expect((await server.anfrage("GET", "/api/marko/lumeto/ki/profil")).status).not.toBe(200);
    expect(modelo.vokoj).toBe(vokoj);
  });

  it("stores the result with the brand it was asked for while another brand is written", async () => {
    let los: () => void = () => undefined;
    modelo.halt = new Promise<void>((done) => {
      los = done;
    });
    const angekommen = new Promise<void>((done) => {
      modelo.alveninta = done;
    });
    modelo.antwort = JSON.stringify({ ...ANTWORT_OBJEKTO, kernsatz: "Die zweite Fassung." });
    const laufend = peti();
    await angekommen;
    const zweite: LeinwandStato = {
      ...STATO,
      knoten: STATO.knoten.map((k) =>
        k.id === "teksto-grundlagen" ? { ...k, inhalt: { beschreibung: "Etwas anderes." } } : k,
      ),
    };
    expect(
      (await put(server, "/api/marko/zweite/leinwand-stato", JSON.stringify(zweite))).status,
    ).toBe(200);
    const zweiteDatei = dosiero("zweite", "leinwand.json");
    los();
    const antwort = await laufend;
    modelo.halt = undefined;
    modelo.alveninta = undefined;
    modelo.antwort = ANTWORT;
    expect(antwort.status).toBe(200);
    expect(profilDe("lumeto")?.kernsatz).toBe("Die zweite Fassung.");
    expect(dosiero("zweite", "leinwand.json")).toBe(zweiteDatei);
    expect(profilDe("zweite")).toBeUndefined();
  });

  it("taking over every part through the write path leaves `veraltet` false; a changed input makes it true (AK-16)", async () => {
    expect((await peti()).status).toBe(200);
    const profil = profilDe("lumeto");
    const v = profil?.vorschlag;
    expect(v?.primaer !== undefined && v.akzent !== undefined && v.neutral !== undefined).toBe(
      true,
    );
    expect(v?.schrift).toEqual({
      display: "lora",
      body: "inter",
      grund: "Handwerklich und gut lesbar.",
    });
    // One write per part, exactly the canvas's keys.
    expect(await skribi("lumeto", { farbe: { rolle: "primaer", wert: v?.primaer?.hex } })).toBe(
      200,
    );
    expect(await skribi("lumeto", { farbe: { rolle: "akzent", wert: v?.akzent?.hex } })).toBe(200);
    expect(await skribi("lumeto", { neutral: { farbe: v?.neutral?.hex } })).toBe(200);
    expect(await skribi("lumeto", { schrift: { rolle: "display", tiparo: "lora" } })).toBe(200);
    expect(await skribi("lumeto", { schrift: { rolle: "body", tiparo: "inter" } })).toBe(200);
    const nach = eingabenDe(await enigoDe("lumeto"), "profil");
    // The writes landed: the inputs now carry the proposal.
    expect(profilEingabenDe(nach)).toEqual({
      primaer: "#c6f135",
      akzent: "#d2552c",
      neutral: "#ebe5d8",
      display: "lora",
      body: "inter",
    });
    expect(profil === undefined ? true : veraltet(profil, nach)).toBe(false);
    // Control: a value that is not the proposal, and a changed text, make it stale.
    expect(await skribi("lumeto", { farbe: { rolle: "akzent", wert: "#123456" } })).toBe(200);
    expect(
      profil === undefined ? false : veraltet(profil, eingabenDe(await enigoDe("lumeto"))),
    ).toBe(true);
    expect(await skribi("lumeto", { farbe: { rolle: "akzent", wert: v?.akzent?.hex } })).toBe(200);
    const anders = await enigoDe("lumeto");
    anders.stato = {
      ...anders.stato,
      knoten: anders.stato.knoten.map((k) =>
        k.id === "teksto-grundlagen" ? { ...k, inhalt: { beschreibung: "Ganz neu." } } : k,
      ),
    };
    expect(profil === undefined ? false : veraltet(profil, eingabenDe(anders))).toBe(true);
  });
});

describe("MAW-4.1: without a model and at the cost limit", () => {
  let senModelo: TestServilo;
  let grenze: TestServilo;
  let vokoj = 0;
  const zaehlend = async (url: string, init: RequestInit): Promise<Response> => {
    vokoj += 1;
    return fakeFetch(url, init);
  };

  beforeAll(async () => {
    senModelo = await testServilo("ki-profil-058-sen-");
    grenze = await testServilo("ki-profil-058-grenze-", {
      ki: { provider: new Provider("mistral", "klein", SEKRETO), fetch: zaehlend, sleep, limo: 0 },
    });
    for (const s of [senModelo, grenze]) {
      await markeAnlegen(s, "lumeto", "leer");
      await put(s, "/api/marko/lumeto/leinwand-stato", JSON.stringify(STATO));
    }
  });

  afterAll(async () => {
    await senModelo?.close();
    await grenze?.close();
  });

  it("answers 503 with the existing sentence when no model is configured", async () => {
    const antwort = await senModelo.anfrage("POST", "/api/marko/lumeto/ki/profil", "{}");
    expect(antwort.status).toBe(503);
    expect((json(antwort.body) as { satz: string }).satz).toMatch(
      /^Kein Sprachmodell eingerichtet/,
    );
  });

  it("answers 502 with the existing sentence of the cost limit and asks no provider", async () => {
    const antwort = await grenze.anfrage("POST", "/api/marko/lumeto/ki/profil", "{}");
    expect(antwort.status).toBe(502);
    expect((json(antwort.body) as { satz: string }).satz).toMatch(/^Die Kostengrenze dieser Runde/);
    expect(vokoj).toBe(0);
  });
});
