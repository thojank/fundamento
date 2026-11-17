// Spec 058 (MP-2c, T5, MAW-3.3): „Namen und Beschreibung“ through the shared KI helper
// (`leinwand-ki.ts`) and `POST /api/marko/:name/ki/namen` (AK-4, AK-6, AK-8, AK-12, AK-17). The model
// is a counting fetch double (offline, 0 $): no call without the POST; the body is text only (no
// `image_url`, no file name, no image or Pinterest address); stderr and Kroniko carry no key and no
// text of the brand; the error table of plan §3.3; the result is stored in `leinwand.json` of the
// brand it was asked for, even when another brand is written meanwhile. The helper also carries a
// message with one image part unchanged (the way MAW-4.2 uses it) and logs none of it.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Budget, type ChatOptions, Provider } from "./asistanto/ki.js";
import type { KronikoInput } from "./asistanto/kroniko.js";
import {
  KEINE_EINGABE_SATZ,
  KI_NICHT_GEANTWORTET_SATZ,
  KI_UNLESBAR_SATZ,
  type LeinwandStato,
  type NamenVorschlag,
} from "./grafeo-gestalten-sicht.js";
import { eingabenAbdruckDe, eingabenDe } from "./leinwand-auswertung.js";
import { KI_TEMPERATUROJ, kiVoki } from "./leinwand-ki.js";
import { markoDir } from "./marko.js";
import type { VojoKunteksto } from "./servilo.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

/** `TestServilo.anfrage` speaks PUT too; its type names only GET and POST. */
const put = (s: TestServilo, path: string, body: string): ReturnType<TestServilo["anfrage"]> =>
  (s.anfrage as (m: string, p: string, b?: string) => ReturnType<TestServilo["anfrage"]>)(
    "PUT",
    path,
    body,
  );

const SEKRETO = "sk-058-namen-nur-im-test";
const BESCHREIBUNG = "Lumeto macht Leuchten aus Altglas für kleine Werkstätten.";

/** The canvas state of the brand (invented): Grundlagen, Werte, Beispiele with files and links, „Namen“. */
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
    { id: "ki-namen", speco: "ki", x: 24, y: -616, inhalt: {} },
  ],
  kabloj: {},
};

const NAMEN = [
  "Glimmer",
  "Scherbenlicht",
  "Altglanz",
  "Funkel",
  "Lichtwerk",
  "Klarschein",
  "Hellgut",
];
const ANTWORT = JSON.stringify({
  namen: NAMEN.map((name) => ({ name, grund: `Passt zu „ehrlich“ und Altglas (${name}).` })),
  beschreibung: "Leuchten aus Altglas, gebaut für kleine Werkstätten, die gut sehen wollen.",
});

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
      usage: { prompt_tokens: 120, completion_tokens: 80 },
    }),
    { status: 200 },
  );
};
const sleep = (): Promise<void> => Promise.resolve();

const json = (body: Buffer): unknown => JSON.parse(body.toString("utf8"));

describe("MAW-3.3: POST /api/marko/:name/ki/namen", () => {
  let server: TestServilo;
  const stderr: string[] = [];
  const dosiero = (name: string, datei: string): string =>
    readFileSync(join(markoDir(server.workdir, name), datei), "utf8");
  const stato = (name: string): LeinwandStato =>
    JSON.parse(dosiero(name, "leinwand.json")) as LeinwandStato;
  const vorschlagDe = (name: string): NamenVorschlag | undefined =>
    (stato(name).knoten.find((k) => k.id === "ki-namen")?.inhalt as { vorschlag?: NamenVorschlag })
      ?.vorschlag;
  const peti = () => server.anfrage("POST", "/api/marko/lumeto/ki/namen", "{}");

  beforeAll(async () => {
    server = await testServilo(
      "ki-namen-058-",
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
    }
  });

  afterAll(async () => {
    await server?.close();
  });

  it("calls no model on load, writes or estimates (AK-6); one POST is one call", async () => {
    expect((await server.anfrage("GET", "/api/leinwand?marko=lumeto&stufe=58")).status).toBe(200);
    expect(
      (
        await server.anfrage(
          "POST",
          "/api/marko/lumeto/leinwand",
          JSON.stringify({ name: "Lumeto" }),
        )
      ).status,
    ).toBe(200);
    for (const zweck of ["namen", "profil", "aufbau"])
      expect((await server.anfrage("GET", `/api/marko/lumeto/ki?zweck=${zweck}`)).status).toBe(200);
    expect(modelo.vokoj).toBe(0);
    const antwort = await peti();
    expect(antwort.status).toBe(200);
    expect(modelo.vokoj).toBe(1);
  });

  it("sends text only: no image part, no file name, no image or Pinterest address (AK-12)", () => {
    const korpo = modelo.korpoj[0] ?? "";
    expect(korpo).not.toContain("image_url");
    for (const stueck of [
      "werkstatt-foto",
      ".png",
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
    expect(body.temperature).toBe(KI_TEMPERATUROJ.namen);
    expect(KI_TEMPERATUROJ).toEqual({ profil: 0.2, namen: 0.8, aufbau: 0.1 });
    expect(body.messages.every((m) => typeof m.content === "string")).toBe(true);
    expect(korpo).toContain("Altglas");
    expect(korpo).toContain("Hellraum");
    expect(korpo).not.toContain("response_format");
  });

  it("answers and stores the proposal in the node's inhalt, without `gesichert` (AK-4, AK-17)", async () => {
    const gespeichert = vorschlagDe("lumeto");
    expect(gespeichert?.namen.map((n) => n.name)).toEqual(NAMEN);
    expect(gespeichert?.namen.every((n) => n.grund.length > 0)).toBe(true);
    expect(gespeichert?.beschreibung).toContain("Leuchten aus Altglas");
    expect(gespeichert?.verworfen).toBeUndefined();
    expect(gespeichert?.gesichert).toBeUndefined();
    expect(gespeichert?.kosto).toMatchObject({
      enigo: 120,
      eligo: 80,
      modelo: "mistral/ministral-14b-2512",
    });
    expect(gespeichert?.kosto.usd).toBeCloseTo((120 * 0.2 + 80 * 0.2) / 1e6, 12);
    expect(Number.isNaN(Date.parse(gespeichert?.kosto.zeit ?? ""))).toBe(false);
    // The abdruck is that of the inputs connected to „Namen“ (veraltet compares against it).
    const enigo = { stato: STATO, nomo: "Lumeto", farben: [], schriften: {} };
    expect(gespeichert?.abdruck).toBe(eingabenAbdruckDe(eingabenDe(enigo, "namen")));
    // The other nodes stay as they were written.
    expect(stato("lumeto").knoten.filter((k) => k.id !== "ki-namen")).toEqual(
      STATO.knoten.filter((k) => k.id !== "ki-namen"),
    );
    // The answer of the route is the stored proposal; the next load carries it.
    const neu = await peti();
    expect((json(neu.body) as { vorschlag: NamenVorschlag }).vorschlag).toEqual(
      vorschlagDe("lumeto"),
    );
    const leinwand = json(
      (await server.anfrage("GET", "/api/leinwand?marko=lumeto&stufe=58")).body,
    ) as { stato: LeinwandStato };
    const knoto = leinwand.stato.knoten.find((k) => k.id === "ki-namen");
    expect((knoto?.inhalt as { vorschlag?: unknown } | undefined)?.vorschlag).toEqual(
      vorschlagDe("lumeto"),
    );
  });

  it("writes one Kroniko entry per call without any text of the brand; stderr and Kroniko hold no key", () => {
    const linioj = dosiero("lumeto", "kroniko.jsonl").trim().split("\n");
    const ki = linioj
      .map((l) => JSON.parse(l) as Record<string, unknown>)
      .filter((e) => (e.detaloj as { zweck?: string } | undefined)?.zweck === "leinwand-namen");
    expect(ki).toHaveLength(modelo.vokoj);
    for (const ero of ki) {
      expect(ero).toMatchObject({
        ago: "propono",
        fonto: "agento",
        modelo: "mistral/ministral-14b-2512",
        kosto: { enigo: 120, eligo: 80, requests: 1 },
        detaloj: { zweck: "leinwand-namen" },
      });
      expect(typeof (ero.kosto as { ms?: unknown }).ms).toBe("number");
      expect(ero.teksto).toBeUndefined();
      expect(ero.faceto).toBeUndefined();
      expect(Object.keys(ero.detaloj as object)).toEqual(["zweck"]);
    }
    const kroniko = dosiero("lumeto", "kroniko.jsonl");
    const log = stderr.join("");
    for (const stueck of [SEKRETO, "Altglas", "Glimmer", "ehrlich", "Hellraum"]) {
      expect(kroniko).not.toContain(stueck);
      expect(log).not.toContain(stueck);
    }
  });

  it("keeps the readable part of a partly unreadable answer and names it (KI_TEILWEISE)", async () => {
    modelo.antwort = JSON.stringify({
      namen: [{ name: "Glimmer", grund: "kurz" }, { name: "" }, { name: "Funkel", grund: "hell" }],
    });
    const antwort = await peti();
    modelo.antwort = ANTWORT;
    expect(antwort.status).toBe(200);
    const { vorschlag } = json(antwort.body) as { vorschlag: NamenVorschlag };
    expect(vorschlag.namen.map((n) => n.name)).toEqual(["Glimmer", "Funkel"]);
    expect(vorschlag.verworfen).toEqual(["namen", "beschreibung"]);
    expect(vorschlagDe("lumeto")).toEqual(vorschlag);
  });

  it("maps an unreadable answer to 422 with its cost and changes nothing", async () => {
    expect((await peti()).status).toBe(200);
    const vorher = dosiero("lumeto", "leinwand.json");
    modelo.antwort = "Hier sind ein paar Ideen, leider ohne JSON.";
    const antwort = await peti();
    modelo.antwort = ANTWORT;
    expect(antwort.status).toBe(422);
    expect(json(antwort.body)).toMatchObject({
      satz: KI_UNLESBAR_SATZ,
      kosto: { enigo: 120, eligo: 80, modelo: "mistral/ministral-14b-2512" },
    });
    expect(dosiero("lumeto", "leinwand.json")).toBe(vorher);
  });

  it("maps a provider error to 502 with the existing sentence, keeps the result, counts it in the Kroniko", async () => {
    const vorher = dosiero("lumeto", "leinwand.json");
    const kronikoVorher = dosiero("lumeto", "kroniko.jsonl").trim().split("\n").length;
    modelo.status = 400;
    const antwort = await peti();
    modelo.status = 200;
    expect(antwort.status).toBe(502);
    const korpo = json(antwort.body) as { satz: string; kosto?: { enigo: number } };
    expect(korpo.satz).toBe(KI_NICHT_GEANTWORTET_SATZ);
    expect(korpo.kosto).toMatchObject({ enigo: 0, eligo: 0, modelo: "mistral/ministral-14b-2512" });
    expect(dosiero("lumeto", "leinwand.json")).toBe(vorher);
    const linioj = dosiero("lumeto", "kroniko.jsonl").trim().split("\n");
    expect(linioj).toHaveLength(kronikoVorher + 1);
    expect(JSON.parse(linioj[linioj.length - 1] ?? "{}")).toMatchObject({
      ago: "propono",
      fonto: "agento",
      kosto: { enigo: 0, eligo: 0, requests: 1 },
      detaloj: { zweck: "leinwand-namen", eraro: KI_NICHT_GEANTWORTET_SATZ },
    });
    expect(stderr.join("")).not.toContain(SEKRETO);
  });

  it("answers 422 „Noch keine Eingabe mit Inhalt“ without a call, 404 for an unknown brand", async () => {
    const vokoj = modelo.vokoj;
    const leer = await server.anfrage("POST", "/api/marko/leerlicht/ki/namen", "{}");
    expect(leer.status).toBe(422);
    expect(json(leer.body)).toEqual({ satz: KEINE_EINGABE_SATZ });
    expect((await server.anfrage("POST", "/api/marko/nirgends/ki/namen", "{}")).status).toBe(404);
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
    modelo.antwort = JSON.stringify({
      namen: NAMEN.slice(0, 6).map((name) => ({ name: `${name}-B`, grund: "neu" })),
      beschreibung: "Eine zweite Fassung.",
    });
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
    expect(vorschlagDe("lumeto")?.namen[0]?.name).toBe("Glimmer-B");
    expect(dosiero("zweite", "leinwand.json")).toBe(zweiteDatei);
    expect(vorschlagDe("zweite")).toBeUndefined();
  });
});

describe("MAW-3.3: without a model and at the cost limit", () => {
  let senModelo: TestServilo;
  let grenze: TestServilo;
  let vokoj = 0;
  const zaehlend = async (url: string, init: RequestInit): Promise<Response> => {
    vokoj += 1;
    return fakeFetch(url, init);
  };

  beforeAll(async () => {
    senModelo = await testServilo("ki-namen-058-sen-");
    grenze = await testServilo("ki-namen-058-grenze-", {
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
    const antwort = await senModelo.anfrage("POST", "/api/marko/lumeto/ki/namen", "{}");
    expect(antwort.status).toBe(503);
    expect((json(antwort.body) as { satz: string }).satz).toMatch(
      /^Kein Sprachmodell eingerichtet/,
    );
  });

  it("answers 502 with the existing sentence of the cost limit and asks no provider", async () => {
    const antwort = await grenze.anfrage("POST", "/api/marko/lumeto/ki/namen", "{}");
    expect(antwort.status).toBe(502);
    expect((json(antwort.body) as { satz: string }).satz).toMatch(/^Die Kostengrenze dieser Runde/);
    expect(vokoj).toBe(0);
  });
});

describe("MAW-3.3: the shared helper carries one image part (for MAW-4.2) and logs none of it", () => {
  it("passes a message with parts unchanged; Kroniko and log hold no image data", async () => {
    const BILD = `data:image/jpeg;base64,${Buffer.from("bilddaten-058-".repeat(40)).toString("base64")}`;
    const korpoj: string[] = [];
    const log: string[] = [];
    const kroniko: KronikoInput[] = [];
    const chatOptions: ChatOptions = {
      fetch: async (_url, init) => {
        korpoj.push(String(init.body));
        return new Response(
          JSON.stringify({
            choices: [{ message: { role: "assistant", content: '{"merkmale": {}}' } }],
            usage: { prompt_tokens: 900, completion_tokens: 40 },
          }),
          { status: 200 },
        );
      },
      sleep,
      log: (line) => log.push(line),
    };
    const kunteksto = {
      kroniko: (_name: string, ero: KronikoInput) => {
        kroniko.push(ero);
        return ero;
      },
      ki: {
        provider: new Provider("mistral", "klein", SEKRETO),
        satz: () => "kein Modell",
        budget: () => new Budget(60_000),
        chatOptions: () => chatOptions,
        fehlerSatz: () => KI_NICHT_GEANTWORTET_SATZ,
        failedTurn: () => undefined,
      },
    } as unknown as VojoKunteksto;
    const r = await kiVoki(kunteksto, "lumeto", "aufbau", [
      { role: "system", content: "Beschreibe den Aufbau." },
      {
        role: "user",
        content: [
          { type: "text", text: "Wie ist die Seite aufgebaut?" },
          { type: "image_url", image_url: { url: BILD } },
        ],
      },
    ]);
    expect("teksto" in r && r.teksto).toBe('{"merkmale": {}}');
    expect(korpoj).toHaveLength(1);
    const body = JSON.parse(korpoj[0] ?? "{}") as {
      temperature: number;
      messages: { content: unknown }[];
    };
    expect(body.temperature).toBe(0.1);
    expect(body.messages[1]?.content).toEqual([
      { type: "text", text: "Wie ist die Seite aufgebaut?" },
      { type: "image_url", image_url: { url: BILD } },
    ]);
    expect((korpoj[0] ?? "").split('"type":"image_url"')).toHaveLength(2);
    expect(kroniko).toEqual([
      {
        ago: "propono",
        fonto: "agento",
        modelo: "mistral/klein",
        kosto: { enigo: 900, eligo: 40, ms: expect.any(Number), requests: 1 },
        detaloj: { zweck: "leinwand-aufbau" },
      },
    ]);
    const base64 = BILD.slice(BILD.indexOf(",") + 1, BILD.indexOf(",") + 41);
    expect(JSON.stringify(kroniko)).not.toContain(base64);
    expect(log.join("")).not.toContain(base64);
  });

  it("lets the caller name the sentence of an error (MAW-4.2: the model reads no images)", async () => {
    const failed: unknown[] = [];
    const kunteksto = {
      kroniko: () => undefined,
      ki: {
        provider: new Provider("mistral", "klein", SEKRETO),
        satz: () => "kein Modell",
        budget: () => new Budget(60_000),
        chatOptions: (): ChatOptions => ({
          fetch: async () =>
            new Response('{"message": "image input not supported"}', { status: 400 }),
          sleep,
        }),
        fehlerSatz: () => KI_NICHT_GEANTWORTET_SATZ,
        failedTurn: (...args: unknown[]) => failed.push(args),
      },
    } as unknown as VojoKunteksto;
    const r = await kiVoki(kunteksto, "lumeto", "aufbau", [{ role: "user", content: "x" }], {
      satzDe: (error) =>
        error instanceof Error && error.message.includes("image")
          ? "liest keine Bilder"
          : undefined,
    });
    expect(r).toMatchObject({ status: 502, satz: "liest keine Bilder", kosto: { enigo: 0 } });
    expect(failed).toHaveLength(1);
  });
});
