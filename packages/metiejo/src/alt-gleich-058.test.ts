// Spec 058 (MP-2c, T1, MAW-1.1): the answers of the base commit `0f9ada50`, pinned before any
// change of this run. Spec 058 extends existing routes and pure functions only behind a switch
// (`stufe=58`, the new `sxtupo` ids, `vorschau: true`, the write key `name`, the option
// `{stufe: 58}`); without it every answer and every output below stays byte-identical. The
// checksums were taken on the untouched tree (`git status --short` empty) and must hold to the end
// of the run. Every brand and every address is invented; no network (an `esploro.fetch` double).

import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ALDONEBLAJ,
  ARANGXO_056,
  aldonebloj,
  altecoDe,
  estasEnhavoId,
  KATALOGO_056,
  largxoDe,
  poziciojKun,
  TEKSTO_IDS,
  vorschauHref,
} from "./grafeo-gestalten-sicht.js";
import { LEINWAND_DOSIERO } from "./leinwand-dosieroj.js";
import { enhavoDe, geloestDe, markoEnhavoDe, markoLigojDe } from "./leinwand-enhavo.js";
import {
  leinwandStatoRekomenco,
  parseLeinwandStato,
  serializeLeinwandStato,
} from "./leinwand-stato.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

const sha256 = (teksto: string | Buffer): string =>
  createHash("sha256").update(teksto).digest("hex");

/** A canvas state as the canvas of Spec 056 writes it (invented brand „lumeto“). */
const STATO_056 = {
  version: 1,
  knoten: [
    { id: "marko", x: 30, y: 60 },
    { id: "vorschau-hell", x: 1136, y: 24, inhalt: { etwas: 1 } },
    { id: "teksto-ausgangslage", inhalt: { text: "lumeto baut Leuchten für Werkstätten." } },
    {
      id: "teksto-markenkern",
      x: -340,
      y: 220,
      inhalt: { zweck: "Licht, das bleibt.", versprechen: "Gut sehen bei jeder Arbeit." },
    },
    {
      id: "teksto-werte",
      inhalt: {
        werte: [
          { id: "w1", text: "ehrlich" },
          { id: "w2", text: "robust" },
          { id: "w3", text: 7 },
        ],
      },
    },
    { id: "teksto-zielgruppe", speco: "teksto", inhalt: { wer: "Tischlereien", sorge: 3 } },
    { id: "teksto-tonalitaet", speco: "teksto", inhalt: { "warm-kuehl": 1, "ruhig-lebhaft": 5 } },
    {
      id: "beispiele",
      speco: "beispiele",
      inhalt: {
        dateien: [
          {
            name: "werkstatt.png",
            art: "png",
            farben: [{ hex: "#2f5bff", anteil: 60, hell: false, bunt: true, leit: true }],
          },
        ],
        verweise: [
          {
            adresse: "https://www.pinterest.de/lumeto/werkstatt/",
            satz: "Bilder von Pinterest bitte herunterladen und hier hochladen",
          },
        ],
        primaer: { folgt: true, zuletzt: "#2f5bff" },
      },
    },
    { id: "schrift", speco: "schrift", inhalt: { eigene: "keine Liste" } },
    { id: "vorschau-3", speco: "vorschau", schema: "dunkel", x: 1136, y: 1024 },
    { id: "unbekannt", x: 1, y: 2 },
  ],
  kabloj: {},
  geloest: ["teksto-werte.el.w2", "teksto-unbekannt.el"],
};

/** A canvas state as the canvas of Spec 055 writes it: places, a further preview, kabloj. */
const STATO_055 = {
  version: 1,
  knoten: [
    { id: "marko", x: 40, y: 50 },
    { id: "farbo-primaer", x: 310, y: 30 },
    { id: "vorschau-3", speco: "vorschau", schema: "hell" },
  ],
  kabloj: { success: null },
};

/** The answers of the base commit (sha256 of the bytes), taken before any change. */
const VORHER_ROUTEN: Readonly<Record<string, string>> = {
  abrufe: "9afcc553babd5083ee86a07963a085efc8e40ff9cdea69ce854c6773d1c90302",
  "beispiele kurzlink": "d3054c9cb51c1aa25b22a60e7495d612b5d74f788e6f0dd9cc95dc466ce1dd75",
  "beispiele pinterest": "d8064ae49dfb24661a5193c396c7d4bba0f038b06657b8ea63c912e6e677dd37",
  "leinwand lumeto": "64333c86abe827b919d3aad0440be4b4fbffa6a027eef55a6859eef184c39cf8",
  "leinwand lumeto danach": "64333c86abe827b919d3aad0440be4b4fbffa6a027eef55a6859eef184c39cf8",
  "leinwand lumeto kabloj": "79180308371a7356c05de0bf570eacf955bb9b8777e410f813750d338b8eb061",
  "leinwand lumeto warm": "64333c86abe827b919d3aad0440be4b4fbffa6a027eef55a6859eef184c39cf8",
  "leinwand lumeto-drei": "80ff6fc853e51c41f88b68a5d202c15dd84496cf1db86f573188e41b18eca34e",
  "leinwand lumeto-drei kabloj": "d9ef096a1707ada271b0a7c9b593bc95f49d654ebfb6194793c0abc2e1c3dab2",
  "leinwand lumeto-drei warm": "80ff6fc853e51c41f88b68a5d202c15dd84496cf1db86f573188e41b18eca34e",
  "leinwand lumeto-zwei": "be8337f329eeb7c8288491b470b73d5b4566dbfe8ed93bf6d8f6d29fd8364127",
  "leinwand lumeto-zwei kabloj": "e13eafa365af12956604559053047ace766b9a33f59c79618a65d42b61103b0d",
  "leinwand lumeto-zwei warm": "be8337f329eeb7c8288491b470b73d5b4566dbfe8ed93bf6d8f6d29fd8364127",
  "vorschau dunkel": "f30253a97bbc57ce3df3adb903b932b20ba23cf10f0509c1ba2d5646411f5419",
  "vorschau hell": "b18fdfd48fa95922a30437bfaabba556ad4a42f5e2306d6d6d8b0f63889c0ac6",
  "vorschau hell kabloj": "ba0c4841d05dbcce1fde6ba874dbc4667f7b16e468dd4c80b34a8001d493223e",
  "vorschau unbekannt": "f30253a97bbc57ce3df3adb903b932b20ba23cf10f0509c1ba2d5646411f5419",
  "vorschau zwei dunkel": "aa4bf6ed36285134a2d812bf9c6c0a7b6d31e573deb31a7e595f40c3ad7090a3",
};

/** The outputs of the pure functions at the base commit (sha256 of their JSON). */
const VORHER_REIN: Readonly<Record<string, string>> = {
  ALDONEBLAJ: "8f6eb758765df4b2198c936c823b83e853d1c19e65727fbc4241106f14fa3f87",
  ARANGXO_056: "3b48de66665d116939e8ee89aec4ab572d32629825ad8fff914f683c4eee4973",
  KATALOGO_056: "200217c0656ffe95ecdee8353452461e94ea532d1734aacfb9af40b63899fae2",
  aldonebloj: "5d797fdc6a847001b13a08469e5ae63e7bb325f11aa8e1f9bd4105e9216068f0",
  enhavoDe: "e82c3a6ffaa94d6f9c6e5f0d93ced9320bb48119e201031d1f8a68b9a9f476f9",
  estasEnhavoId: "55abc689d459563444737a221096fffa01355d3a2b59e47e5cb4fb28a5fc9e85",
  "geloestDe 055": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  "geloestDe 056": "a14336e4efee2bf0941eabdf5dc95fa3a5e39e7a9ba4440e58ae8e760c24fc9a",
  "largxoDe altecoDe": "b70af23ce300c9351fc33189491041f098c6ea471ce6df0ac07c05ae5b3fec5e",
  "markoEnhavoDe 055": "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
  "markoEnhavoDe 056": "147fceffe91cbd9124f931ba48c4d9f6dd367618e920a4579fe9b6d5a4534c3e",
  "markoLigojDe 055": "6cdd613eeb5fbbae4b2127c8073c59361477322f6aa78f0f90834f329c0f7542",
  "markoLigojDe 056": "75eee8b060ae21692e14ff5599062084463508a51cfe1b6824ff6d26ebf43f17",
  "parse 055": "d3fa603351de36dcccd8aae3a1570b2421c83638527ba248dda8c5aa04a1a2a7",
  "parse 056": "7b0e3fab0baf49ae4792a7ac05a812a585cf748ac06602589481932a23e09794",
  poziciojKun: "befe12f6429b9eecd62097ab9bb0f7d6ab82149037aa0fb6fd606f49cf6c7708",
  "rekomenco 055": "3efd5b797b7a7abb9300bae4a5757804035265422ed406139ecc25e1257d31cc",
  "rekomenco 056": "c987301670b8e0bf00aad4dd3bd45e89f97a04d6ac57580a6b4b957db905aa04",
  "rekomenco null": "ac78dbfa1ab382513233d67d381fd677b316ec555ca7014def03b9ccecb601fe",
  "serialize 055": "af3e149d90eae727d0c960c1db2f2c1b9813ebe393f3cc0e4a31d041127c105b",
  "serialize 056": "868ea6a5674b3a9ff6b4ae52c80dfe8783996d70e3f228a560e9f14b7408b847",
  vorschauHref: "c135531990d43ccd7299a25d399911e81b01f7c7c6cc8fc2d082f7d0a94a563d",
};

describe("MAW-1.1: the routes answer as at 0f9ada50 without the switches of Spec 058", () => {
  let server: TestServilo;
  const abrufe: string[] = [];
  const fetchDouble = (url: string, init?: RequestInit): Promise<Response> => {
    abrufe.push(
      JSON.stringify({
        url,
        redirect: init?.redirect,
        credentials: init?.credentials,
        headers: init?.headers,
        signal: init?.signal instanceof AbortSignal,
      }),
    );
    if (url.startsWith("https://www.pinterest.de/") || url.startsWith("https://pin.it/"))
      return Promise.resolve(
        new Response("<!doctype html><title>lumeto auf Pinterest</title><div id=root></div>", {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    return Promise.reject(new TypeError("fetch failed"));
  };

  beforeAll(async () => {
    server = await testServilo("alt-gleich-058-", { esploro: { fetch: fetchDouble } });
    for (const name of ["lumeto", "lumeto-zwei", "lumeto-drei"])
      await markeAnlegen(server, name, "leer");
    writeFileSync(join(server.workdir, "lumeto-zwei", LEINWAND_DOSIERO), JSON.stringify(STATO_056));
    writeFileSync(join(server.workdir, "lumeto-drei", LEINWAND_DOSIERO), JSON.stringify(STATO_055));
  });

  afterAll(async () => {
    await server?.close();
  });

  it("gives the same bytes on every route without a switch of Spec 058", async () => {
    const nun: Record<string, string> = {};
    const frage = async (was: string, method: "GET" | "POST", pfad: string, korpo?: string) => {
      const a = await server.anfrage(method, pfad, korpo);
      nun[was] = sha256(`${a.status} ${a.contentType}\n${a.body.toString("utf8")}`);
    };
    // GET /api/leinwand without `stufe`: no file, a file of Spec 056, a file of Spec 055 – each
    // twice (the second answer may come from the cache).
    for (const name of ["lumeto", "lumeto-zwei", "lumeto-drei"]) {
      await frage(`leinwand ${name}`, "GET", `/api/leinwand?marko=${name}`);
      await frage(`leinwand ${name} warm`, "GET", `/api/leinwand?marko=${name}`);
      await frage(`leinwand ${name} kabloj`, "GET", `/api/leinwand?marko=${name}&kabloj=akzent:-`);
    }
    // The preview of the canvas (`sxtupo=vorschau`) in light and dark, with and without kabloj,
    // and an unknown `sxtupo` (it shows the same page as `vorschau` today).
    const vorschau = "/marko/lumeto/vorschau?sxtupo=vorschau&breite=mittel";
    await frage("vorschau hell", "GET", `${vorschau}&scheme=light&rev=1`);
    await frage("vorschau dunkel", "GET", `${vorschau}&scheme=dark&rev=1`);
    await frage("vorschau hell kabloj", "GET", `${vorschau}&scheme=light&rev=1&kabloj=akzent:-`);
    await frage(
      "vorschau unbekannt",
      "GET",
      "/marko/lumeto/vorschau?sxtupo=unbekannt&breite=mittel&scheme=dark&rev=1",
    );
    await frage(
      "vorschau zwei dunkel",
      "GET",
      "/marko/lumeto-zwei/vorschau?sxtupo=vorschau&breite=mittel&scheme=dark&rev=1",
    );
    // POST …/beispiele {url} with a Pinterest address, without `vorschau`: a reference.
    await frage(
      "beispiele pinterest",
      "POST",
      "/api/marko/lumeto/beispiele",
      JSON.stringify({ url: "https://www.pinterest.de/lumeto/werkstatt/" }),
    );
    await frage(
      "beispiele kurzlink",
      "POST",
      "/api/marko/lumeto/beispiele",
      JSON.stringify({ url: "https://pin.it/2lumeto" }),
    );
    nun.abrufe = sha256(abrufe.join("\n"));
    await frage("leinwand lumeto danach", "GET", "/api/leinwand?marko=lumeto");
    expect(nun).toEqual(VORHER_ROUTEN);
  });
});

describe("MAW-1.1: the shared pure functions give the outputs of 0f9ada50 without the option", () => {
  it("gives the same outputs for every 055/056 input", () => {
    const nun: Record<string, string> = {};
    const pin = (was: string, wert: unknown): void => {
      nun[was] = sha256(JSON.stringify(wert) ?? "undefined");
    };
    const ids = [
      "marko",
      "farbo-primaer",
      "farbo-neutral",
      "farbo-akzent",
      "farbo-success",
      "farbo-info",
      "paletro",
      "vorschau-hell",
      "vorschau-dunkel",
      "vorschau-3",
      "vorschau-4",
      ...TEKSTO_IDS,
      "beispiele",
      "schrift",
      "teksto-grundlagen",
      "ki-namen",
      "layout-beispiel",
      "unbekannt",
    ];
    pin(
      "largxoDe altecoDe",
      ids.map((id) => [id, largxoDe(id), altecoDe(id)]),
    );
    pin("poziciojKun", [
      ...poziciojKun(
        new Map([["marko", { x: 5, y: 6 }]]),
        ids.map((id) => ({ id })),
      ),
    ]);
    pin("ARANGXO_056", ARANGXO_056);
    pin("KATALOGO_056", KATALOGO_056);
    pin("ALDONEBLAJ", ALDONEBLAJ);
    pin(
      "aldonebloj",
      aldonebloj(KATALOGO_056, [
        { id: "farbo-akzent", stato: "leer" },
        { id: "teksto-zielgruppe" },
        { id: "ki-namen" },
        { id: "teksto-grundlagen" },
        { id: "layout-beispiel" },
      ]),
    );
    pin(
      "estasEnhavoId",
      ids.map((id) => estasEnhavoId(id)),
    );
    pin("vorschauHref", [
      vorschauHref("lumeto", "hell", 1, {}),
      vorschauHref("lumeto", "dunkel", 7, { akzent: null, success: "info" }),
      vorschauHref("über marke", "hell", 2, { neutral: "neutral" }),
    ]);
    for (const [name, stato] of [
      ["056", STATO_056],
      ["055", STATO_055],
    ] as const) {
      const lego = parseLeinwandStato(JSON.stringify(stato));
      pin(`parse ${name}`, lego);
      if (!("stato" in lego)) throw new Error(`state ${name} does not read`);
      pin(`serialize ${name}`, serializeLeinwandStato(lego.stato));
      pin(`rekomenco ${name}`, leinwandStatoRekomenco(lego.stato));
      pin(`markoLigojDe ${name}`, markoLigojDe(lego.stato.knoten, lego.stato.geloest ?? []));
      pin(`markoEnhavoDe ${name}`, markoEnhavoDe(lego.stato.knoten, lego.stato.geloest ?? []));
      pin(
        `geloestDe ${name}`,
        geloestDe(
          ["teksto-werte.el.w1", "beispiele.el", "schrift.el", "teksto-zielgruppe.el"],
          lego.stato.knoten,
        ),
      );
    }
    pin("rekomenco null", leinwandStatoRekomenco(null));
    const roh = {
      text: "Text",
      wer: "wer",
      liste: [{ name: "Leuchtwerk" }, {}],
      zweck: "Zweck",
      werte: [{ id: "w1", text: "klar" }],
      eigenschaften: ["ruhig", "ruhig", 4],
      "warm-kuehl": 2,
      dateien: [{ name: "a.png", art: "png", fehlt: true }],
      verweise: [{ adresse: "https://pin.it/x" }, { satz: "ohne Adresse" }],
      eigene: [{ familie: "Lumeta Sans", dateien: [] }],
    };
    // Only the ids of Spec 056 and before: the three new nodes and the Marke get a content of
    // their own (T1). This pin was taken from `git show 0f9ada50:` of both shared modules.
    pin(
      "enhavoDe",
      ids
        .filter((id) => !["teksto-grundlagen", "ki-namen", "layout-beispiel", "marko"].includes(id))
        .map((id) => [id, enhavoDe(id, roh) ?? null]),
    );
    expect(nun).toEqual(VORHER_REIN);
  });
});
