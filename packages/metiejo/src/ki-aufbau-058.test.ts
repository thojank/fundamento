// Spec 058 (MP-2c, T9, MAW-4.2, part G, AK-8, AK-12, AK-18): „Aufbau erkennen“,
// `POST /api/marko/:name/ki/aufbau` → 200 {merkmale, worte, aufbau, grund, kosto}. The only route of
// this spec that sends an image: the Layout-Beispiel's file, downscaled to the longest side
// ≤ MAX_RANDO and re-encoded, as exactly one `image_url` part beside the fixed question – no text of
// the brand, no file name. PNG, JPG and WebP only (PDF/SVG: 422 NUR_BILD_SATZ); without a browser to
// decode a JPG/WebP: 422 with the Enportilo's sentence. A provider error that shows the model reads
// no images: 502 KEINE_BILDER_SATZ, else the general sentence. Neither stderr nor the Kroniko carries
// a piece of the image. The result is stored in `layout-beispiel.inhalt` by the route (the file
// stays). The model is a counting fetch double, the browser a `bildilo` double (offline, 0 $).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Provider } from "./asistanto/ki.js";
import { type Bildilo, MAX_RANDO, SenBrowser } from "./enportilo/bildilo.js";
import { decodePng } from "./enportilo/png.js";
import {
  type InhaltLayout,
  KEINE_BILDER_SATZ,
  KEINE_EINGABE_SATZ,
  KI_NICHT_GEANTWORTET_SATZ,
  KI_UNLESBAR_SATZ,
  type LeinwandStato,
  NUR_BILD_SATZ,
} from "./grafeo-gestalten-sicht.js";
import { markoDir } from "./marko.js";
import { encodePng } from "./test-doubles/png.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

const SEKRETO = "sk-058-aufbau-nur-im-test";
const BESCHREIBUNG = "Lumeto macht Leuchten aus Altglas für kleine Werkstätten.";
const NAME = "Lumeto Leuchtenwerk";

/** `TestServilo.anfrage` speaks PUT too; its type names only GET and POST. */
const put = (s: TestServilo, path: string, body: string): ReturnType<TestServilo["anfrage"]> =>
  (s.anfrage as (m: string, p: string, b?: string) => ReturnType<TestServilo["anfrage"]>)(
    "PUT",
    path,
    body,
  );

/** A deterministic noise, so the image's bytes are its own. */
function bruo(semo: number): () => number {
  let x = semo;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) % 256;
  };
}
/** Wider than MAX_RANDO, so it has to be scaled down. */
const BREIT = (() => {
  const hazardo = bruo(0x3a7c);
  return encodePng(MAX_RANDO + 476, 60, (_x, y) =>
    y < 30 ? [210, 85, 44, 255] : [hazardo(), hazardo(), hazardo(), 255],
  );
})();
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(80, 9)]);
const SVG = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="#d2552c"/></svg>',
);
const PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n2 0 obj<<>>stream\n0.82 0.33 0.17 rg 0 0 10 10 re f\nendstream endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
  "latin1",
);

const ANTWORT = JSON.stringify({
  merkmale: {
    titelbild: "gross",
    inhalt: "fliesstext",
    dichte: "luftig",
    achse: "mittig",
    schrift: "gross",
  },
  worte: "Ein großes Titelbild mit großer Schrift, darunter luftiger Text.",
});

/** The fetch double: counts, keeps the bodies, answers what `antwort` says. */
const modelo = {
  vokoj: 0,
  korpoj: [] as string[],
  antwort: ANTWORT as string,
  status: 200,
  fehler: "invalid request",
};
const fakeFetch = async (_url: string, init: RequestInit): Promise<Response> => {
  modelo.vokoj += 1;
  modelo.korpoj.push(String(init.body));
  if (modelo.status !== 200)
    return new Response(JSON.stringify({ message: modelo.fehler }), { status: modelo.status });
  return new Response(
    JSON.stringify({
      choices: [{ message: { role: "assistant", content: modelo.antwort } }],
      usage: { prompt_tokens: 900, completion_tokens: 60 },
    }),
    { status: 200 },
  );
};
const sleep = (): Promise<void> => Promise.resolve();

/** The browser double: decodes a JPG into a small picture, or there is no browser. */
let mitBrowser = true;
const bildilo: Bildilo = {
  bildigi: () => Promise.reject(new SenBrowser("kein Browser")),
  malkodi: () => {
    if (!mitBrowser) return Promise.reject(new SenBrowser("kein Browser"));
    const rgba = new Uint8Array(4 * 12 * 8);
    for (let i = 0; i < 96; i++) rgba.set([47, 91, 255, 255], 4 * i);
    return Promise.resolve({ width: 12, height: 8, rgba });
  },
};

const json = (body: Buffer): unknown => JSON.parse(body.toString("utf8"));

interface Korpo {
  messages: {
    role: string;
    content: string | { type: string; text?: string; image_url?: { url: string } }[];
  }[];
}

describe("MAW-4.2: POST /api/marko/:name/ki/aufbau", () => {
  let server: TestServilo;
  const stderr: string[] = [];
  const marko = (name = "lumeto") => markoDir(server.workdir, name);
  const layoutInhalt = (name = "lumeto"): InhaltLayout | undefined =>
    (
      JSON.parse(readFileSync(join(marko(name), "leinwand.json"), "utf8")) as LeinwandStato
    ).knoten.find((k) => k.id === "layout-beispiel")?.inhalt as InhaltLayout | undefined;
  const hochladen = async (filename: string, bytes: Buffer, name = "lumeto") => {
    const a = await server.anfrage(
      "POST",
      `/api/marko/${name}/layout-beispiel`,
      JSON.stringify({ filename, base64: bytes.toString("base64") }),
    );
    expect(a.status, filename).toBe(200);
  };
  const peti = (name = "lumeto") => server.anfrage("POST", `/api/marko/${name}/ki/aufbau`, "{}");

  beforeAll(async () => {
    server = await testServilo(
      "ki-aufbau-058-",
      {
        ki: {
          provider: new Provider("mistral", "ministral-14b-2512", SEKRETO),
          fetch: fakeFetch,
          sleep,
        },
        esploro: { bildilo },
      },
      undefined,
      (t) => stderr.push(t),
    );
    for (const name of ["lumeto", "leer"]) await markeAnlegen(server, name, "leer");
    // Text of the brand on the canvas and as its name: none of it may reach the model here.
    const stato: LeinwandStato = {
      version: 1,
      knoten: [{ id: "teksto-grundlagen", inhalt: { beschreibung: BESCHREIBUNG } }],
      kabloj: {},
    };
    expect(
      (await put(server, "/api/marko/lumeto/leinwand-stato", JSON.stringify(stato))).status,
    ).toBe(200);
    expect(
      (await server.anfrage("POST", "/api/marko/lumeto/leinwand", JSON.stringify({ name: NAME })))
        .status,
    ).toBe(200);
  });

  afterAll(async () => {
    await server?.close();
  });

  it("without a Layout-Beispiel: 422 „Noch keine Eingabe mit Inhalt“, no model call", async () => {
    const a = await peti("leer");
    expect(a.status).toBe(422);
    expect(json(a.body)).toEqual({ satz: KEINE_EINGABE_SATZ });
    expect(modelo.vokoj).toBe(0);
  });

  it("uploading calls no model; one POST is one call with exactly one image, scaled to MAX_RANDO", async () => {
    await hochladen("startseite.png", BREIT);
    expect(modelo.vokoj).toBe(0);
    const a = await peti();
    expect(a.status).toBe(200);
    expect(modelo.vokoj).toBe(1);
    const korpo = JSON.parse(modelo.korpoj[0] ?? "{}") as Korpo;
    const partoj = korpo.messages.flatMap((m) => (Array.isArray(m.content) ? m.content : []));
    const bildoj = partoj.filter((p) => p.type === "image_url");
    expect(bildoj).toHaveLength(1);
    expect(modelo.korpoj[0]?.split("image_url").length).toBe(3); // the type and the key, once each
    const url = bildoj[0]?.image_url?.url ?? "";
    expect(url.startsWith("data:image/png;base64,")).toBe(true);
    const gesendet = decodePng(Buffer.from(url.slice("data:image/png;base64,".length), "base64"));
    expect(Math.max(gesendet.width, gesendet.height)).toBe(MAX_RANDO);
    expect(gesendet.width).toBe(MAX_RANDO);
    // The fixed question stands beside it as text.
    expect(partoj.some((p) => p.type === "text" && (p.text ?? "").includes("Aufbau"))).toBe(true);
  });

  it("the body carries no text of the brand and no file name (AK-12)", () => {
    const korpo = modelo.korpoj[0] ?? "";
    for (const stueck of [
      BESCHREIBUNG,
      "Altglas",
      NAME,
      "Leuchtenwerk",
      "startseite",
      ".png",
      "lumeto",
    ])
      expect(korpo, stueck).not.toContain(stueck);
  });

  it("answers the features, the words, the layout, its reason and the cost, and stores them on the node", async () => {
    // The answer of the POST above.
    const inhalt = layoutInhalt();
    expect(inhalt?.datei?.name).toBe("startseite.png");
    expect(inhalt?.merkmale).toEqual({
      titelbild: "gross",
      inhalt: "fliesstext",
      dichte: "luftig",
      achse: "mittig",
      schrift: "gross",
    });
    expect(inhalt?.worte).toBe("Ein großes Titelbild mit großer Schrift, darunter luftiger Text.");
    expect(inhalt?.kosto).toMatchObject({
      enigo: 900,
      eligo: 60,
      modelo: "mistral/ministral-14b-2512",
    });
    const a = await peti();
    expect(a.status).toBe(200);
    const r = json(a.body) as Record<string, unknown>;
    expect(Object.keys(r).sort()).toEqual(["aufbau", "grund", "kosto", "merkmale", "worte"]);
    expect(r.aufbau).toBe("titel");
    expect(r.grund).toBe(
      "Großer Titel, weil das Beispiel ein großes Titelbild und große Schrift zeigt",
    );
    expect(r.merkmale).toEqual(inhalt?.merkmale);
  });

  it("writes one Kroniko entry per call; neither stderr nor the Kroniko carries a piece of the image or the key", () => {
    const kroniko = readFileSync(join(server.workdir, "lumeto", "kroniko.jsonl"), "utf8");
    const eintraege = kroniko
      .trim()
      .split("\n")
      .map((z) => JSON.parse(z) as { detaloj?: { zweck?: string } })
      .filter((z) => z.detaloj?.zweck === "leinwand-aufbau");
    expect(eintraege).toHaveLength(2);
    const korpo = JSON.parse(modelo.korpoj[0] ?? "{}") as Korpo;
    const url =
      korpo.messages
        .flatMap((m) => (Array.isArray(m.content) ? m.content : []))
        .find((p) => p.type === "image_url")?.image_url?.url ?? "";
    const daten = url.slice("data:image/png;base64,".length);
    const quelle = BREIT.toString("base64");
    const stuecke = [
      daten.slice(200, 260),
      daten.slice(daten.length / 2, daten.length / 2 + 60),
      quelle.slice(200, 260),
      "data:image",
      SEKRETO,
    ];
    const log = stderr.join("");
    for (const s of stuecke) {
      expect(s.length).toBeGreaterThan(9);
      expect(log, s.slice(0, 12)).not.toContain(s);
      expect(kroniko, s.slice(0, 12)).not.toContain(s);
    }
  });

  it("a partly unreadable answer keeps the readable part and names the rest", async () => {
    modelo.antwort = JSON.stringify({ merkmale: { inhalt: "karten", dichte: "eng" } });
    const a = await peti();
    modelo.antwort = ANTWORT;
    expect(a.status).toBe(200);
    const r = json(a.body) as {
      merkmale: unknown;
      aufbau: string;
      verworfen?: string[];
      worte?: string;
    };
    expect(r.merkmale).toEqual({ inhalt: "karten" });
    expect(r.aufbau).toBe("raster");
    expect(r.worte).toBeUndefined();
    expect(r.verworfen).toEqual(expect.arrayContaining(["dichte", "worte"]));
    expect(layoutInhalt()?.worte).toBeUndefined();
    expect(layoutInhalt()?.datei?.name).toBe("startseite.png");
  });

  it("an answer that does not read at all: 422 with its cost; the stored result stays", async () => {
    const vorher = layoutInhalt();
    modelo.antwort = "Leider kann ich das nicht.";
    const a = await peti();
    modelo.antwort = ANTWORT;
    expect(a.status).toBe(422);
    const r = json(a.body) as { satz: string; kosto?: unknown };
    expect(r.satz).toBe(KI_UNLESBAR_SATZ);
    expect(r.kosto).toBeDefined();
    expect(layoutInhalt()).toEqual(vorher);
  });

  it("a provider error that shows the model reads no images: 502 „liest keine Bilder“; another error: the general sentence", async () => {
    const vorher = layoutInhalt();
    modelo.status = 400;
    modelo.fehler = "Image input is not supported for this model";
    const ohneBilder = await peti();
    modelo.fehler = "invalid request";
    const anderer = await peti();
    modelo.status = 200;
    expect(ohneBilder.status).toBe(502);
    expect((json(ohneBilder.body) as { satz: string }).satz).toBe(KEINE_BILDER_SATZ);
    expect(anderer.status).toBe(502);
    expect((json(anderer.body) as { satz: string }).satz).toBe(KI_NICHT_GEANTWORTET_SATZ);
    expect(layoutInhalt()).toEqual(vorher);
    expect(stderr.join("")).not.toContain(SEKRETO);
  });

  it("PDF and SVG: 422 „Aufbau erkennen geht nur mit einem Bild“, no model call", async () => {
    for (const [filename, bytes] of [
      ["plakat.pdf", PDF],
      ["zeichnung.svg", SVG],
    ] as const) {
      await hochladen(filename, bytes);
      const vokoj = modelo.vokoj;
      const a = await peti();
      expect(a.status, filename).toBe(422);
      expect(json(a.body), filename).toEqual({ satz: NUR_BILD_SATZ });
      expect(modelo.vokoj, filename).toBe(vokoj);
    }
  });

  it("a JPG goes through the browser; without one: 422 with the Enportilo's sentence, no model call", async () => {
    await hochladen("seite.jpg", JPG);
    const mit = await peti();
    expect(mit.status).toBe(200);
    const korpo = JSON.parse(modelo.korpoj.at(-1) ?? "{}") as Korpo;
    const url =
      korpo.messages
        .flatMap((m) => (Array.isArray(m.content) ? m.content : []))
        .find((p) => p.type === "image_url")?.image_url?.url ?? "";
    const gesendet = decodePng(Buffer.from(url.slice("data:image/png;base64,".length), "base64"));
    expect([gesendet.width, gesendet.height]).toEqual([12, 8]);
    mitBrowser = false;
    const vokoj = modelo.vokoj;
    const ohne = await peti();
    mitBrowser = true;
    expect(ohne.status).toBe(422);
    expect((json(ohne.body) as { satz: string }).satz).toMatch(
      /^Ohne Browser kann ich die Farben von seite\.jpg nicht messen; das Bild liegt im Material\.$/,
    );
    expect(modelo.vokoj).toBe(vokoj);
  });

  it("answers 404 for an unknown brand and 503 without a model", async () => {
    expect((await peti("gibtsnicht")).status).toBe(404);
    const ohne = await testServilo("ki-aufbau-058-ohne-");
    try {
      await markeAnlegen(ohne, "lumeto", "leer");
      const a = await ohne.anfrage("POST", "/api/marko/lumeto/ki/aufbau", "{}");
      expect(a.status).toBe(503);
      expect((json(a.body) as { satz: string }).satz).toMatch(/^Kein Sprachmodell eingerichtet/);
    } finally {
      await ohne.close();
    }
  });
});
