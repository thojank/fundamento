// Spec 058 (MP-2c, T8, MAW-3.5, AK-15): the Pinterest preview of the node Beispiele.
// `pinterestVorschauDe(html, adresse)` reads a title and up to twelve distinct images (host
// `i.pinimg.com` only, size variants once) from a page; `POST …/beispiele {url, vorschau: true}`
// checks the address with `permesataAdreso` before fetching, reads the page only when the final
// address after the redirects is Pinterest's and answers `{verweis: {adresse, titel?, bilder}}`,
// else the reference with the Pinterest sentence. Taking an image is the existing `{url}` call.
// Every page here is INVENTED (`test-doubles/pinterest-058/`, no copy of a real page); every request
// goes to the `esploro.fetch` double, and the global `fetch` throws: no network. The pages end in
// `.html.txt` so the linter does not parse them (`pin.html.txt` holds broken JSON on purpose).

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { pinterestVorschauDe } from "./beispiele-pinterest.js";
import { type Bildilo, SenBrowser } from "./enportilo/bildilo.js";
import { MATERIALO_DIR } from "./enportilo/materialo.js";
import { type BeispielDosiero, KEIN_BILD_SATZ, PINTEREST_SATZ } from "./grafeo-gestalten-sicht.js";
import { encodePng } from "./test-doubles/png.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

const MARKO = "provo";
const FIKSAJOJ = join(dirname(fileURLToPath(import.meta.url)), "test-doubles", "pinterest-058");
const fiksajxo = (nomo: string): string => readFileSync(join(FIKSAJOJ, nomo), "utf8");
const BRETT = fiksajxo("brett.html.txt");
const PIN = fiksajxo("pin.html.txt");
const ANMELDUNG = fiksajxo("anmeldung.html.txt");
/** A login page with a mosaic of pins behind its form: still a login, never read. */
const ANMELDUNG_MOSAIK = ANMELDUNG.replace(
  "</body>",
  '<img src="https://i.pinimg.com/236x/e1/e2/e3/e1e2e3000000mosa.jpg"></body>',
);

const BRETT_ADRESSE = "https://www.pinterest.de/provo/werkstatt/";
const bildDe = (groesse: string, nr: string, fino = "jpg"): string =>
  `https://i.pinimg.com/${groesse}/a1/b2/c3/a1b2c3d4e5f6${nr}.${fino}`;
const FINOJ: Readonly<Record<string, string>> = { "0005": "png", "0010": "webp" };
const NUMEROJ = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(4, "0"));
const BRETT_BILDER = NUMEROJ.map((nr) => ({
  vorschau: bildDe("236x", nr, FINOJ[nr]),
  bild: bildDe("736x", nr, FINOJ[nr]),
}));

// ---------------------------------------------------------------------------------------------
// The pure reading
// ---------------------------------------------------------------------------------------------

describe("pinterestVorschauDe (pure)", () => {
  it("a board: og:title, the first twelve of fourteen images, size variants once", () => {
    const vorschau = pinterestVorschauDe(BRETT, BRETT_ADRESSE);
    expect(vorschau.titel).toBe("Werkstatt & Holz");
    expect(vorschau.bilder).toEqual(BRETT_BILDER);
  });

  it("only i.pinimg.com, no avatar box, no page asset, no other host", () => {
    const adresoj = pinterestVorschauDe(BRETT, BRETT_ADRESSE).bilder.flatMap((b) => [
      b.vorschau,
      b.bild,
    ]);
    for (const adreso of adresoj) expect(new URL(adreso).hostname).toBe("i.pinimg.com");
    expect(adresoj.join(" ")).not.toMatch(/avat|bilder\.example|s\.pinimg|75x75/);
  });

  it("a single pin: <title> without og:title, one image from two sizes, broken JSON is no harm", () => {
    expect(pinterestVorschauDe(PIN, "https://www.pinterest.de/pin/1/")).toEqual({
      titel: "Hobelbank aus Eiche",
      bilder: [
        {
          vorschau: "https://i.pinimg.com/236x/c4/d5/e6/c4d5e6f7a8b90001.jpg",
          bild: "https://i.pinimg.com/736x/c4/d5/e6/c4d5e6f7a8b90001.jpg",
        },
      ],
    });
  });

  it("a login page, an empty page, plain text: an empty list", () => {
    expect(pinterestVorschauDe(ANMELDUNG, BRETT_ADRESSE).bilder).toEqual([]);
    expect(pinterestVorschauDe("", BRETT_ADRESSE)).toEqual({ bilder: [] });
    expect(pinterestVorschauDe("kein html", BRETT_ADRESSE)).toEqual({ bilder: [] });
  });
});

// ---------------------------------------------------------------------------------------------
// The route
// ---------------------------------------------------------------------------------------------

/** A page answer as `fetch` gives it after following redirects: `url` is the final address. */
function seite(html: string, url: string, status = 200): Response {
  const respondo = new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
  Object.defineProperty(respondo, "url", { value: url });
  return respondo;
}

const ROT = [210, 60, 40, 255];
const GRAU = [128, 128, 128, 255];
const BILD = encodePng(10, 10, (x) => (x < 6 ? ROT : GRAU));
const bild = (url: string): Response => {
  const respondo = new Response(new Uint8Array(BILD), { headers: { "content-type": "image/png" } });
  Object.defineProperty(respondo, "url", { value: url });
  return respondo;
};

const abrufe: { url: string; init: RequestInit | undefined }[] = [];
const ANTWORTEN: Record<string, () => Response> = {
  [BRETT_ADRESSE]: () => seite(BRETT, BRETT_ADRESSE),
  // The short link: fetch follows the redirect, the answer names the board as its address.
  "https://pin.it/kurz1": () => seite(BRETT, "https://www.pinterest.de/provo/werkstatt/"),
  // A short link that ends on another host: the page is not read.
  "https://pin.it/fremd1": () => seite(BRETT, "https://fremd.example/werkstatt/"),
  // A board that sends to the login.
  "https://www.pinterest.de/provo/privat/": () =>
    seite(ANMELDUNG_MOSAIK, "https://www.pinterest.de/login/?next=%2Fprovo%2Fprivat%2F"),
  // A login page at the address itself.
  "https://www.pinterest.de/provo/gesperrt/": () =>
    seite(ANMELDUNG, "https://www.pinterest.de/provo/gesperrt/"),
  "https://www.pinterest.de/provo/verboten/": () =>
    seite(BRETT, "https://www.pinterest.de/provo/verboten/", 403),
  "https://www.pinterest.de/provo/zuviel/": () =>
    seite(BRETT, "https://www.pinterest.de/provo/zuviel/", 429),
  "https://www.pinterest.de/provo/leer/": () => seite("", "https://www.pinterest.de/provo/leer/"),
  "https://www.pinterest.de/pin/1/": () => seite(PIN, "https://www.pinterest.de/pin/1/"),
  "https://bilder.example/plakat.png": () => bild("https://bilder.example/plakat.png"),
  ...Object.fromEntries(BRETT_BILDER.map((b) => [b.bild, () => bild(b.bild)])),
};
const fetchDouble = (url: string, init?: RequestInit): Promise<Response> => {
  abrufe.push({ url, init });
  const antwort = ANTWORTEN[url];
  return antwort === undefined
    ? Promise.reject(new TypeError("fetch failed"))
    : Promise.resolve(antwort());
};
const bildilo: Bildilo = {
  bildigi: () => Promise.reject(new SenBrowser("kein Browser")),
  malkodi: () => Promise.reject(new SenBrowser("kein Browser")),
};

/** The global fetch: never called (no network). A plain list, so no mock reset clears it. */
const retoAbrufoj: string[] = [];
const retoAbrufo = (url: unknown): Promise<Response> => {
  retoAbrufoj.push(String(url));
  return Promise.reject(new Error("no network in tests"));
};

let server: TestServilo;
const materialo = (): string => join(server.workdir, MARKO, MATERIALO_DIR);
const dosieroj = (): string[] =>
  existsSync(materialo())
    ? readdirSync(materialo())
        .filter((d) => d !== ".gitignore")
        .sort()
    : [];
const json = (body: Buffer): unknown => JSON.parse(body.toString("utf8"));
const peti = (korpo: Record<string, unknown>) =>
  server.anfrage("POST", `/api/marko/${MARKO}/beispiele`, JSON.stringify(korpo));
const vorschau = (url: string) => peti({ url, vorschau: true });

beforeAll(async () => {
  vi.stubGlobal("fetch", retoAbrufo);
  server = await testServilo("pinterest-058-", { esploro: { fetch: fetchDouble, bildilo } });
  await markeAnlegen(server, MARKO, "leer");
});
afterAll(async () => {
  await server.close();
  vi.unstubAllGlobals();
});
beforeEach(() => {
  abrufe.length = 0;
});

describe("POST …/beispiele {url, vorschau: true}", () => {
  it("a public board: title and twelve images, fetched once without cookie, nothing kept", async () => {
    const antwort = await vorschau(BRETT_ADRESSE);
    expect(antwort.status).toBe(200);
    expect(json(antwort.body)).toEqual({
      verweis: { adresse: BRETT_ADRESSE, titel: "Werkstatt & Holz", bilder: BRETT_BILDER },
    });
    expect(abrufe.map((a) => a.url)).toEqual([BRETT_ADRESSE]);
    const init = abrufe[0]?.init;
    expect(init?.redirect).toBe("follow");
    expect(init?.credentials).toBe("omit");
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    const kapoj = new Headers(init?.headers);
    expect(kapoj.has("cookie")).toBe(false);
    expect(kapoj.has("authorization")).toBe(false);
    expect(dosieroj()).toEqual([]);
  });

  it("a short link resolves through the redirect; the reference keeps the pasted address", async () => {
    const antwort = await vorschau("https://pin.it/kurz1");
    expect(json(antwort.body)).toEqual({
      verweis: { adresse: "https://pin.it/kurz1", titel: "Werkstatt & Holz", bilder: BRETT_BILDER },
    });
  });

  it("a single pin: its title and its one image", async () => {
    const antwort = await vorschau("https://www.pinterest.de/pin/1/");
    expect(json(antwort.body)).toEqual({
      verweis: {
        adresse: "https://www.pinterest.de/pin/1/",
        titel: "Hobelbank aus Eiche",
        bilder: [
          {
            vorschau: "https://i.pinimg.com/236x/c4/d5/e6/c4d5e6f7a8b90001.jpg",
            bild: "https://i.pinimg.com/736x/c4/d5/e6/c4d5e6f7a8b90001.jpg",
          },
        ],
      },
    });
  });

  it("a redirect to another host, a login, 403, 429, an empty page, no answer: the reference with the sentence", async () => {
    for (const adresse of [
      "https://pin.it/fremd1",
      "https://www.pinterest.de/provo/privat/",
      "https://www.pinterest.de/provo/gesperrt/",
      "https://www.pinterest.de/provo/verboten/",
      "https://www.pinterest.de/provo/zuviel/",
      "https://www.pinterest.de/provo/leer/",
      "https://www.pinterest.de/provo/nirgends/",
    ]) {
      const antwort = await vorschau(adresse);
      expect(antwort.status, adresse).toBe(200);
      expect(json(antwort.body), adresse).toEqual({ verweis: { adresse, satz: PINTEREST_SATZ } });
    }
    expect(dosieroj()).toEqual([]);
  });

  it("a private address is refused before fetching", async () => {
    for (const [adresse, satz] of [
      ["http://127.0.0.1/pinterest/", KEIN_BILD_SATZ],
      ["http://localhost:4100/brett/", KEIN_BILD_SATZ],
      ["http://192.168.1.20/brett/", KEIN_BILD_SATZ],
      ["http://[::1]/brett/", KEIN_BILD_SATZ],
      // Looks like Pinterest by its name, so it keeps Pinterest's sentence – and is not fetched.
      ["http://pinterest.local/brett/", PINTEREST_SATZ],
    ] as const) {
      const antwort = await vorschau(adresse);
      expect(antwort.status, adresse).toBe(200);
      expect(json(antwort.body), adresse).toEqual({ verweis: { adresse, satz } });
    }
    expect(abrufe).toEqual([]);
  });

  it("an image address with `vorschau` still goes on like an upload", async () => {
    const antwort = await vorschau("https://bilder.example/plakat.png");
    expect(antwort.status).toBe(200);
    const { datei } = json(antwort.body) as { datei: BeispielDosiero };
    expect(datei.name).toBe("plakat.png");
  });

  it("without `vorschau` a board stays the old reference", async () => {
    const antwort = await peti({ url: BRETT_ADRESSE });
    expect(json(antwort.body)).toEqual({
      verweis: { adresse: BRETT_ADRESSE, satz: PINTEREST_SATZ },
    });
  });
});

describe("taking an image: the existing {url} call", () => {
  it("is kept in materialo/ and evaluated; taking it again stores nothing twice", async () => {
    const erstes = BRETT_BILDER[0];
    expect(erstes).toBeDefined();
    if (erstes === undefined) return;
    const vorher = dosieroj();
    const antwort = await peti({ url: erstes.bild });
    expect(antwort.status).toBe(200);
    const { datei } = json(antwort.body) as { datei: BeispielDosiero };
    expect(datei.name).toBe("a1b2c3d4e5f60001.png");
    expect(datei.farben?.[0]?.hex).toBe("#d23c28");
    expect(dosieroj()).toEqual([...vorher, "a1b2c3d4e5f60001.png"].sort());
    await peti({ url: erstes.bild });
    expect(dosieroj()).toEqual([...vorher, "a1b2c3d4e5f60001.png"].sort());
  });
});

describe("no network", () => {
  it("every request went to the double, none to the global fetch", () => {
    expect(retoAbrufoj).toEqual([]);
    expect(globalThis.fetch).toBe(retoAbrufo);
  });
});
