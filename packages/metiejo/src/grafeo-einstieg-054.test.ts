// Spec 054 T2 (MPFG-2.1): the entry „Neue Marke auf der Leinwand“. The start screen (only the case
// `start` of `sxtupoj.ts`, E-10) carries the block with its own action, which sends the same form with
// `ziel=leinwand` through a small inline script (D-1: `fm-formularo` never sends its submitter). Every
// other step answers byte for byte as at `aa53d3f4` (AK-16). `POST /marko` with `ziel=leinwand`
// creates the brand on the basis `leer` and goes to its canvas; without `ziel` it goes on to `/farbe`
// as before; a taken or empty name answers with the sentence on the start screen (AK-1 entry, AK-13).

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { markoDir } from "./marko.js";
import { exampleScreenInput, SXTUPOJ, screen, screenInventory } from "./sxtupoj.js";
import { type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { startAgordo } from "./vorschau.js";

/**
 * SHA-256 of `screen(exampleScreenInput(key))` for every step, taken at `aa53d3f4` before this run
 * touched `sxtupoj.ts` (the same input, the untouched source). `start` is listed to prove it changed.
 */
const PRUEFSUMMEN_AA53D3F4: Readonly<Record<string, string>> = {
  start: "126b5848cbac8e5955ae79063e76f1ed8fc0d57d3aa670c8e199838308600738",
  farbe: "d029071d2709309d245f84d2e0b272c51d7a2604acec3bd7d6c47c46b45ce5f9",
  schrift: "f3aa54e82a42ae8fccaf73ec6d12d0925f972bf061c4c07340f2a694cbf0516f",
  form: "4fbd65e1d3d1be2ce875af4c9acfa00a3e4c379646d2bd087ca4c18c2d899777",
  raum: "0965eb3d25b7263bc7923d0ed67ef8e52bec6f96afa3d5fa90c84ec33d4a8c1d",
  groesse: "81bc847f13fabefa517e490ce28f24891bb4cc0b1570ad34c07f4b78c3bfc092",
  ikono: "cb7d4fd8daa774b14a602c2cd0e108eba10313c8fa4b8a79acbb4ea79b13ae91",
  vorschau: "9c90727d7ad3012a9007332dbb4f77ec8418491c2357d9ba7bb524cf07c724bd",
  fertig: "a12c8f64fadd9795e9ece7aea93e21b292c6b71c7487462e71bd20997f381ae8",
};

const BLOCK = "Neue Marke auf der Leinwand";
const AKTION = "Auf der Leinwand anlegen";
const FORM_TYPE = "application/x-www-form-urlencoded";

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");
const count = (haystack: string, needle: string): number => haystack.split(needle).length - 1;
/** Classic scripts: a `<script>` without a `type` (the JSON islands and modules carry one). */
const klassischeSkripte = (html: string): string[] =>
  [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(([, body = ""]) => body);

/** The direct children of the first `fm-formularo`, as their opening tags (a small tag walker). */
function kinderDesFormulars(html: string): string[] {
  const start = html.indexOf("<fm-formularo");
  const ende = html.indexOf("</fm-formularo>", start);
  const innen = html.slice(html.indexOf(">", start) + 1, ende);
  const kinder: string[] = [];
  let tiefe = 0;
  for (const [tag = "", schliessend, name = ""] of innen.matchAll(
    /<(\/?)([a-z][a-z0-9-]*)\b[^>]*>/g,
  )) {
    const leer = ["input", "br", "img", "meta", "link"].includes(name);
    if (schliessend === "/") {
      tiefe--;
      continue;
    }
    if (tiefe === 0) kinder.push(tag);
    if (!leer) tiefe++;
  }
  return kinder;
}

/** A POST of form values; the answer with its `location`. */
function senden(
  server: TestServilo,
  werte: Record<string, string>,
): Promise<{ status: number; location: string; body: string }> {
  const body = new URLSearchParams(werte).toString();
  return new Promise((done, fail) => {
    const anfrage = httpRequest(
      {
        host: "127.0.0.1",
        port: server.servilo.port,
        path: "/marko",
        method: "POST",
        headers: {
          connection: "close",
          "content-type": FORM_TYPE,
          "content-length": String(Buffer.byteLength(body)),
        },
      },
      (antwort) => {
        const chunks: Buffer[] = [];
        antwort.on("data", (chunk: Buffer) => chunks.push(chunk));
        antwort.on("end", () =>
          done({
            status: antwort.statusCode ?? 0,
            location: String(antwort.headers.location ?? ""),
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
        antwort.on("error", fail);
      },
    );
    anfrage.on("error", fail);
    anfrage.end(body);
  });
}

const gespeichert = (server: TestServilo, name: string): unknown =>
  JSON.parse(readFileSync(join(markoDir(server.workdir, name), "agordo.json"), "utf8"));

describe("Spec 054 T2: the block on the start screen (AK-16, E-10, D-1)", () => {
  const html = screen(exampleScreenInput("start"));

  it("carries the block and its action of medium emphasis as a direct child of the form", () => {
    const kinder = kinderDesFormulars(html);
    const aktion = kinder.filter((tag) => tag.startsWith("<fm-butono") && !tag.includes("slot="));
    expect(aktion).toEqual(['<fm-butono type="submit" emphasis="medium" data-mt-ziel="leinwand">']);
    expect(html).toContain(`${aktion[0]}${AKTION}</fm-butono>`);
    expect(count(html, BLOCK)).toBe(1);
    expect(kinder.some((tag) => tag === "<script>")).toBe(true);
  });

  it("keeps one name field, one identifier and one main button; no Vortaro term is visible", () => {
    const inventory = screenInventory(html);
    expect({
      name: count(html, 'name="name"'),
      kennung: count(html, "data-mt-kennung"),
      haupt: inventory.mainButtons,
      fragen: inventory.questions,
    }).toEqual({ name: 1, kennung: 1, haupt: 1, fragen: 1 });
    expect(inventory.text).toContain(BLOCK);
    expect(inventory.text).toContain(AKTION);
    const sichtbar: string[] = [];
    for (const term of ["Aspekto", "Agordo", "Regulo", "Jugxo", "Vortaro", "Sxablono", "ziel"]) {
      if (new RegExp(`\\b${term}\\b`).test(inventory.text)) sichtbar.push(term);
    }
    expect(sichtbar).toEqual([]);
  });

  it("adds ziel=leinwand to the values of the form only after a click on its action", () => {
    const skripte = klassischeSkripte(html);
    expect(skripte).toHaveLength(1);
    const skripto = skripte[0] ?? "";
    for (const teil of [
      '"submit"',
      '"click"',
      "detail.values",
      'ziel = "leinwand"',
      "data-mt-ziel",
    ])
      expect(skripto, teil).toContain(teil);
    // A classic script, registered while the page is parsed: before the module metiejo.js.
    expect(html.indexOf("<script>")).toBeLessThan(html.indexOf("</fm-formularo>"));
  });

  it("is the only change: every other step is byte for byte as at aa53d3f4", () => {
    const abweichend: string[] = [];
    const ohneSkript: string[] = [];
    for (const { key } of SXTUPOJ) {
      const ekrano = screen(exampleScreenInput(key));
      if (key === "start") {
        if (sha256(ekrano) === PRUEFSUMMEN_AA53D3F4.start) abweichend.push("start unchanged");
        continue;
      }
      if (sha256(ekrano) !== PRUEFSUMMEN_AA53D3F4[key]) abweichend.push(key);
      if (klassischeSkripte(ekrano).length > 0 || ekrano.includes("data-mt-ziel"))
        ohneSkript.push(key);
    }
    expect(SXTUPOJ.map(({ key }) => key)).toEqual(Object.keys(PRUEFSUMMEN_AA53D3F4));
    expect(abweichend).toEqual([]);
    expect(ohneSkript).toEqual([]);
  });
});

describe("Spec 054 T2: POST /marko with ziel=leinwand (AK-1 entry, AK-13)", () => {
  let server: TestServilo;

  beforeAll(async () => {
    server = await testServilo("grafeo-einstieg-054-");
  });

  afterAll(async () => {
    await server?.close();
  });

  it("creates the brand on the basis leer and goes to its canvas", async () => {
    const antwort = await senden(server, { name: "Lumo", basis: "komuna", ziel: "leinwand" });
    expect({ status: antwort.status, location: antwort.location }).toEqual({
      status: 303,
      location: "/marko/lumo/grafeo",
    });
    const start = startAgordo("lumo", "leer");
    expect(gespeichert(server, "lumo")).toEqual({ ...start, etikedoj: { marko: "Lumo" } });
  });

  it("goes on to /farbe without ziel, as before", async () => {
    const antwort = await senden(server, { name: "nubo", basis: "leer" });
    expect({ status: antwort.status, location: antwort.location }).toEqual({
      status: 303,
      location: "/marko/nubo/farbe",
    });
  });

  it("answers a taken or an empty name with the sentence on the start screen", async () => {
    const vergeben = await senden(server, { name: "lumo", basis: "leer", ziel: "leinwand" });
    expect(vergeben.status).toBe(200);
    expect(vergeben.body).toContain("Die Marke „lumo“ gibt es schon.");
    expect(vergeben.body).toContain(BLOCK);
    const leer = await senden(server, { name: "", basis: "leer", ziel: "leinwand" });
    const leerOhneZiel = await senden(server, { name: "", basis: "leer" });
    expect(leer.status).toBe(200);
    expect(leer.body).toContain("ergibt keine Kennung");
    expect(leer.body).toBe(leerOhneZiel.body);
  });

  it("answers basis=oeffnen with ziel=leinwand like a missing name and creates nothing", async () => {
    const leer = await senden(server, { name: "", basis: "leer" });
    const antwort = await senden(server, {
      name: "Sola",
      basis: "oeffnen",
      oeffnen: "lumo",
      ziel: "leinwand",
    });
    expect({ status: antwort.status, location: antwort.location }).toEqual({
      status: 200,
      location: "",
    });
    expect(antwort.body).toBe(leer.body);
    expect(existsSync(markoDir(server.workdir, "sola"))).toBe(false);
  });

  it("ignores any other ziel: the form goes on to /farbe", async () => {
    const antwort = await senden(server, { name: "vento", basis: "leer", ziel: "andere" });
    expect(antwort.location).toBe("/marko/vento/farbe");
  });
});
