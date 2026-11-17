// Spec 058 (MP-2c, T10, MAW-5.1): the shared doubles of the cross tests `ki-*-058`, `eksporto-058`,
// `abnahme-058` and `grafeo-urteil-058`. Offline, 0 $, invented brand „lumeto“ only:
//   - one model double for all three KI routes; it tells the purpose by the temperature of the
//     request (D-6: profile 0.2, names 0.8, layout 0.1), counts every call, keeps every body and can
//     answer an error, an unreadable or a partly unreadable text, or hold the answer;
//   - an `esploro.fetch` double for Pinterest (the invented board of MAW-3.5) and its images;
//   - a `bildilo` double that decodes a JPG into a small picture (no browser in a unit test);
//   - the canvas state of a brand with every input of this spec, and a server with all of it.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Provider } from "../asistanto/ki.js";
import type { Bildilo } from "../enportilo/bildilo.js";
import { SenBrowser } from "../enportilo/bildilo.js";
import type { LeinwandStato, Merkmale, Zweck } from "../grafeo-gestalten-sicht.js";
import { KI_TEMPERATUROJ } from "../leinwand-ki.js";
import { markoDir } from "../marko.js";
import type { ServiloOptions } from "../servilo.js";
import { encodePng } from "./png.js";
import { type Antwort, type TestServilo, testServilo } from "./servilo-044.js";

/** A key that exists only in the tests: no log, no file, no answer may carry it. */
export const SEKRETO_058 = "sk-058-quer-nur-im-test";
export const MODELO_058 = "ministral-14b-2512";

/** Text of the brand (invented). None of it may reach a log, the Kroniko or the layout request. */
export const BESCHREIBUNG_058 = "Lumeto baut Leuchten aus Altglas für kleine Werkstätten.";
export const NAME_058 = "Lumeto Leuchtenwerk";
export const MARKEN_TEXTE_058 = [
  "Altglas",
  "Werkstätten",
  "ehrlich",
  "robust",
  "Hellraum",
  NAME_058,
] as const;

/** Names of image files and addresses of this state: none may reach a profile or names body. */
export const BILD_NAMEN_058 = [
  "werkstatt-foto",
  "layout-seite-058",
  "a1b2c3d4e5f60001",
  ".png",
  ".jpg",
  "pinimg",
  "pinterest",
  "pin.it",
  "bilder.example",
  "Werkstatt-Licht",
] as const;

/** `TestServilo.anfrage` speaks PUT and DELETE too; its type names only GET and POST. */
export const senden = (
  s: TestServilo,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: string,
): Promise<Antwort> =>
  (s.anfrage as (m: string, p: string, b?: string) => Promise<Antwort>)(method, path, body);

export const json = (body: Buffer): unknown => JSON.parse(body.toString("utf8"));

/** A deterministic noise (xorshift), so the bytes of an image are its own. */
export function bruo(semo: number): () => number {
  let x = semo;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) % 256;
  };
}

/** The Layout-Beispiel of the brand: two colour bands and a stripe of noise (invented). */
export const LAYOUT_NAME_058 = "layout-seite-058.png";
export const LAYOUT_PNG_058: Buffer = (() => {
  const hazardo = bruo(0x5805);
  return encodePng(64, 48, (_x, y) =>
    y < 20
      ? [47, 91, 255, 255]
      : y < 40
        ? [240, 236, 228, 255]
        : [hazardo(), hazardo(), hazardo(), 255],
  );
})();

/** A JPG as Pinterest serves it (the header and invented bytes; the `bildilo` double decodes it). */
export function jpgDe(semo: number): Buffer {
  const hazardo = bruo(semo);
  return Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
    Buffer.from(Array.from({ length: 600 }, () => hazardo())),
  ]);
}

/** The browser double: a JPG/WebP decodes into a 12×8 picture of one blue. */
export const BILDILO_058: Bildilo = {
  bildigi: () => Promise.reject(new SenBrowser("kein Browser")),
  malkodi: () => {
    const rgba = new Uint8Array(4 * 12 * 8);
    for (let i = 0; i < 96; i++) rgba.set([47, 91, 255, 255], 4 * i);
    return Promise.resolve({ width: 12, height: 8, rgba });
  },
};

// ---------------------------------------------------------------------------------------------
// Pinterest (the invented board of MAW-3.5) and its images, through `esploro.fetch`

export const BRETT_058 = "https://www.pinterest.de/lumeto/werkstatt/";
const BRETT_HTML = readFileSync(
  fileURLToPath(new URL("./pinterest-058/brett.html.txt", import.meta.url)),
  "utf8",
);
/** The images the board shows, by their `736x` address (the address „nehmen“ asks). */
export const PIN_BILD_058 = (n: number): string =>
  `https://i.pinimg.com/736x/a1/b2/c3/a1b2c3d4e5f600${String(n).padStart(2, "0")}.jpg`;
export const PIN_BYTES_058 = (n: number): Buffer => jpgDe(0x7000 + n);

/** Every address the double was asked, in order. */
export const esploroAdresoj: string[] = [];
export const esploroFetch058 = (url: string): Promise<Response> => {
  esploroAdresoj.push(url);
  if (url === BRETT_058) {
    const r = new Response(BRETT_HTML, { headers: { "content-type": "text/html" } });
    Object.defineProperty(r, "url", { value: url });
    return Promise.resolve(r);
  }
  const pin = /^https:\/\/i\.pinimg\.com\/736x\/a1\/b2\/c3\/a1b2c3d4e5f600(\d\d)\.jpg$/.exec(url);
  if (pin !== null) {
    const r = new Response(new Uint8Array(PIN_BYTES_058(Number(pin[1]))), {
      headers: { "content-type": "image/jpeg" },
    });
    Object.defineProperty(r, "url", { value: url });
    return Promise.resolve(r);
  }
  return Promise.reject(new TypeError("fetch failed"));
};

// ---------------------------------------------------------------------------------------------
// The canvas state of the brand: every input of this spec (invented)

export const STATO_058: LeinwandStato = {
  version: 1,
  knoten: [
    { id: "teksto-grundlagen", inhalt: { beschreibung: BESCHREIBUNG_058 } },
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
          },
          {
            name: "a1b2c3d4e5f60001.jpg",
            art: "jpg",
            farben: [{ hex: "#2f5bff", anteil: 100, hell: false, bunt: true, leit: true }],
            quelle: PIN_BILD_058(1),
          },
        ],
        verweise: [{ adresse: BRETT_058, titel: "Werkstatt-Licht" }],
      },
    },
    { id: "ki-namen", speco: "ki", x: 24, y: -616, inhalt: {} },
  ],
  kabloj: {},
};

// ---------------------------------------------------------------------------------------------
// The model double

export const PROFIL_ANTWORT_058 = {
  kernsatz: "Gutes Licht aus Altglas, dort wo mit den Händen gearbeitet wird.",
  leitgedanken: [
    { titel: "Nah am Werkstück", text: "Licht, das dem Handgriff folgt." },
    { titel: "Ehrlich gebaut", text: "Jedes Teil lässt sich tauschen." },
    { titel: "Zweites Leben", text: "Altglas wird Leuchte." },
  ],
  charakter: ["handfest", "warm", "geradeaus"],
  passt: ["„ehrlich“ und Altglas tragen dieselbe Haltung."],
  reibt: ["Die Tonalität sagt „warm“, das Blau ist kühl."],
  vorschlag: {
    primaer: { hex: "#c6f135", grund: "Frisch wie die Werkstatt." },
    akzent: { hex: "#d2552c", grund: "Warm für „ehrlich“." },
    neutral: { hex: "#ebe5d8", grund: "Warm getönt statt kühl grau." },
    schrift: { display: "Lora", body: "Inter", grund: "Handwerklich und gut lesbar." },
  },
};
export const NAMEN_ANTWORT_058 = {
  namen: [
    "Glimmer",
    "Scherbenlicht",
    "Altglanz",
    "Funkel",
    "Lichtwerk",
    "Klarschein",
    "Hellgut",
  ].map((name) => ({ name, grund: `Klingt nach Licht und Handwerk (${name}).` })),
  beschreibung: "Leuchten aus Altglas, gebaut für kleine Werkstätten, die gut sehen wollen.",
};
export const AUFBAU_ANTWORT_058: { merkmale: Merkmale; worte: string } = {
  merkmale: {
    titelbild: "klein",
    inhalt: "karten",
    dichte: "luftig",
    achse: "mittig",
    schrift: "gross",
  },
  worte: "Ein luftiges Raster aus Karten.",
};

/** A partly unreadable answer per purpose (product spec, edge cases „teilweise unlesbar“). */
export const TEILWEISE_058: Readonly<Record<Zweck, string>> = {
  profil: JSON.stringify({
    ...PROFIL_ANTWORT_058,
    vorschlag: { ...PROFIL_ANTWORT_058.vorschlag, primaer: { hex: "grün", grund: "?" } },
  }),
  namen: JSON.stringify({ ...NAMEN_ANTWORT_058, namen: NAMEN_ANTWORT_058.namen.slice(0, 4) }),
  aufbau: JSON.stringify({
    ...AUFBAU_ANTWORT_058,
    merkmale: { ...AUFBAU_ANTWORT_058.merkmale, dichte: "sehr dicht" },
  }),
};

const ANTWORTEN: Readonly<Record<Zweck, string>> = {
  profil: JSON.stringify(PROFIL_ANTWORT_058),
  namen: JSON.stringify(NAMEN_ANTWORT_058),
  aufbau: JSON.stringify(AUFBAU_ANTWORT_058),
};

/** The purpose of a request, told by its temperature (D-6). */
export function zweckDe(korpo: string): Zweck | undefined {
  const t = (JSON.parse(korpo) as { temperature?: number }).temperature;
  return (Object.keys(KI_TEMPERATUROJ) as Zweck[]).find((z) => KI_TEMPERATUROJ[z] === t);
}

export interface ModeloDouble {
  /** Every call (also the failed ones), per purpose and in total. */
  vokoj: Record<Zweck, number>;
  korpoj: { zweck: Zweck | undefined; korpo: string }[];
  /** An answer text instead of the readable one, per purpose. */
  antwort: Partial<Record<Zweck, string>>;
  /** A provider status other than 200 for every call. */
  status: number;
  /** While set, every answer waits for it; `alveninta` hears the arrival of a call. */
  halt: Promise<void> | undefined;
  alveninta: (() => void) | undefined;
  fetch: (url: string, init: RequestInit) => Promise<Response>;
  summe: () => number;
  nul: () => void;
}

export function modeloDouble(): ModeloDouble {
  const m: ModeloDouble = {
    vokoj: { profil: 0, namen: 0, aufbau: 0 },
    korpoj: [],
    antwort: {},
    status: 200,
    halt: undefined,
    alveninta: undefined,
    fetch: async (_url, init) => {
      const korpo = String(init.body);
      const zweck = zweckDe(korpo);
      if (zweck !== undefined) m.vokoj[zweck] += 1;
      m.korpoj.push({ zweck, korpo });
      m.alveninta?.();
      if (m.halt !== undefined) await m.halt;
      if (m.status !== 200)
        return new Response(JSON.stringify({ message: "invalid request" }), { status: m.status });
      const inhalt = zweck === undefined ? "" : (m.antwort[zweck] ?? ANTWORTEN[zweck]);
      return new Response(
        JSON.stringify({
          choices: [{ message: { role: "assistant", content: inhalt } }],
          usage: { prompt_tokens: 900, completion_tokens: 120 },
        }),
        { status: 200 },
      );
    },
    summe: () => m.vokoj.profil + m.vokoj.namen + m.vokoj.aufbau,
    nul: () => {
      m.vokoj = { profil: 0, namen: 0, aufbau: 0 };
      m.korpoj = [];
    },
  };
  return m;
}

// ---------------------------------------------------------------------------------------------
// The server

export interface KiServilo058 {
  server: TestServilo;
  modelo: ModeloDouble;
  stderr: string[];
  /** The text of a file of a brand's folder. */
  dosiero: (name: string, datei: string) => string;
  /** POST of a KI route: `profil`, `namen` or `aufbau`. */
  peti: (name: string, zweck: Zweck) => Promise<Antwort>;
}

/** `lumeto` with every input of this spec: the state, a name, a colour, fonts, the Layout-Beispiel. */
export async function markeMitAllem(server: TestServilo, name: string): Promise<void> {
  const kreo = await server.anfrage(
    "POST",
    "/marko",
    `name=${encodeURIComponent(name)}&basis=leer&ziel=leinwand`,
    "application/x-www-form-urlencoded",
  );
  if (kreo.status !== 303) throw new Error(`brand ${name} not created: ${kreo.status}`);
  const schritte: [method: "PUT" | "POST", path: string, body: unknown][] = [
    ["PUT", `/api/marko/${name}/leinwand-stato`, STATO_058],
    ["POST", `/api/marko/${name}/leinwand`, { name: NAME_058 }],
    ["POST", `/api/marko/${name}/leinwand`, { farbe: { rolle: "primaer", wert: "#2f5bff" } }],
    ["POST", `/api/marko/${name}/leinwand`, { schrift: { rolle: "display", tiparo: "fraunces" } }],
    [
      "POST",
      `/api/marko/${name}/layout-beispiel`,
      { filename: LAYOUT_NAME_058, base64: LAYOUT_PNG_058.toString("base64") },
    ],
  ];
  for (const [method, path, body] of schritte) {
    const a = await senden(server, method, path, JSON.stringify(body));
    if (a.status !== 200) throw new Error(`${method} ${path}: ${a.status} ${a.body.toString()}`);
  }
}

/** A server with the model double (or without a model), the Pinterest and browser doubles. */
export async function kiServilo058(
  prefix: string,
  opcioj: { senModelo?: boolean; limo?: number; extra?: Partial<ServiloOptions> } = {},
): Promise<KiServilo058> {
  const modelo = modeloDouble();
  const stderr: string[] = [];
  const server = await testServilo(
    prefix,
    {
      ...(opcioj.senModelo === true
        ? {}
        : {
            ki: {
              provider: new Provider("mistral", MODELO_058, SEKRETO_058),
              fetch: modelo.fetch,
              sleep: () => Promise.resolve(),
              ...(opcioj.limo === undefined ? {} : { limo: opcioj.limo }),
            },
          }),
      esploro: { fetch: esploroFetch058, bildilo: BILDILO_058 },
      ...opcioj.extra,
    },
    undefined,
    (t) => stderr.push(t),
  );
  return {
    server,
    modelo,
    stderr,
    dosiero: (name, datei) => readFileSync(join(markoDir(server.workdir, name), datei), "utf8"),
    peti: (name, zweck) => server.anfrage("POST", `/api/marko/${name}/ki/${zweck}`, "{}"),
  };
}
