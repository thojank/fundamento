// Spec 055 T6 (LNS-1.3, Abnahme 7 and 8): the Markenliste on the start screen. Under the heading
// „Angefangene Marken“ every brand of the working directory stands as a card: its name (Etikett,
// else the folder name), three swatches from the draft (Primär, Akzent, Neutral; Akzent dashed and
// empty when there is none), „zuletzt geändert“ (date and time, server local time) and the number of
// Stände. Newest first, then by name. A card leads to `/marko/<name>/grafeo`; an unreadable brand
// stands with its name and „lässt sich nicht lesen“, without swatches and without a link. The list
// sits outside the form (D-11), adds no button (D-10), no native link (D-12) and no judgment (H).

import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Agordo } from "@fundamento/agordilo";
import { buildModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { paletrojDe } from "./grafeo-gestalten.js";
import {
  LEINWAND_DOSIERO,
  LEINWAND_UNLESBAR_PRAEFIKSO,
  leinwandUnlesbarDosiero,
  STAENDE_DIR,
  STAND_SUFIKSO,
} from "./leinwand-dosieroj.js";
import {
  type MarkenZeile,
  markenFarbenDe,
  markenListeDe,
  markenListeSortiert,
  staendeText,
  zeitpunktText,
} from "./marken-liste.js";
import { createMarko, markoDir, writeDraft } from "./marko.js";
import { exampleScreenInput, SXTUPOJ, screen, screenInventory } from "./sxtupoj.js";
import { type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { loadBases } from "./vorschau.js";

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");
const count = (haystack: string, needle: string): number => haystack.split(needle).length - 1;

/** SHA-256 of `screen(exampleScreenInput("start"))` at `642ab220` (no Markenliste in the input). */
const START_642AB220 = "651e6a08d5e28492fe810c18ee669cf9f4c668bff32fec41c586e711cc963272";

const HEADING = "Angefangene Marken";
const LEER = "Noch keine Marke. Lege oben die erste an.";
const UNLESBAR = "lässt sich nicht lesen";

/** A local time (server local time, as the list shows it). */
const lokal = (jahr: number, monat: number, tag: number, stunde: number, minute: number): Date =>
  new Date(jahr, monat - 1, tag, stunde, minute);

/** The part of a screen the list stands in: from its section to the end of the section. */
function listenTeil(html: string): string {
  const start = html.indexOf('<section class="mt-marken"');
  if (start < 0) return "";
  return html.slice(start, html.indexOf("</section>", start) + "</section>".length);
}

const ZEILEN: MarkenZeile[] = [
  {
    name: "lumeto",
    etikedo: "Lumeto",
    lesbar: true,
    farben: { primaer: "#2f5bff", akzent: "#c6f135", neutral: "#e9ebf2" },
    geaendert: lokal(2026, 11, 15, 14, 41).toISOString(),
    staende: 3,
  },
  {
    name: "provo",
    etikedo: "provo",
    lesbar: true,
    farben: { primaer: "#7a3e9d", neutral: "#efedf2" },
    geaendert: lokal(2026, 11, 9, 17, 20).toISOString(),
    staende: 1,
  },
  {
    name: "komuna",
    etikedo: "komuna",
    lesbar: true,
    farben: { primaer: "#0fa37f", neutral: "#eef3f1" },
    geaendert: lokal(2026, 1, 5, 9, 7).toISOString(),
    staende: 0,
  },
  {
    name: "kaputa",
    etikedo: "kaputa",
    lesbar: false,
    geaendert: lokal(2026, 1, 1, 8, 0).toISOString(),
    staende: 0,
  },
];

const mitListe = (markenListe: MarkenZeile[]) => ({
  ...exampleScreenInput("start"),
  markenListe,
});

describe("LNS-1.3: the file names of D-1 (leinwand-dosieroj)", () => {
  it("names leinwand.json, staende/ with *.json and the backup without colons", () => {
    expect({
      leinwand: LEINWAND_DOSIERO,
      staende: STAENDE_DIR,
      sufikso: STAND_SUFIKSO,
      praefikso: LEINWAND_UNLESBAR_PRAEFIKSO,
      sicherung: leinwandUnlesbarDosiero(new Date("2026-11-15T14:41:07.123Z")),
    }).toEqual({
      leinwand: "leinwand.json",
      staende: "staende",
      sufikso: ".json",
      praefikso: "leinwand.unlesbar-",
      sicherung: "leinwand.unlesbar-2026-11-15T144107.123Z.json",
    });
  });
});

describe("LNS-1.3: the pure parts of the Markenliste", () => {
  it("writes the time as „15.11.2026, 14:41“ in server local time, with leading zeros", () => {
    expect([
      zeitpunktText(lokal(2026, 11, 15, 14, 41).toISOString()),
      zeitpunktText(lokal(2026, 1, 5, 9, 7).toISOString()),
    ]).toEqual(["15.11.2026, 14:41", "05.01.2026, 09:07"]);
  });

  it("counts the Stände as „0 Stände“, „1 Stand“, „N Stände“", () => {
    expect([0, 1, 2, 12].map(staendeText)).toEqual([
      "0 Stände",
      "1 Stand",
      "2 Stände",
      "12 Stände",
    ]);
  });

  it("sorts newest first, then by name", () => {
    const zeit = (iso: string) => ({ etikedo: "", lesbar: true, staende: 0, geaendert: iso });
    const sortiert = markenListeSortiert([
      { name: "provo", ...zeit("2026-11-01T10:00:00.000Z") },
      { name: "lumeto", ...zeit("2026-11-15T10:00:00.000Z") },
      { name: "komuna", ...zeit("2026-11-01T10:00:00.000Z") },
      { name: "alfa", ...zeit("2026-10-01T10:00:00.000Z") },
    ]);
    expect(sortiert.map((zeile) => zeile.name)).toEqual(["lumeto", "komuna", "provo", "alfa"]);
  });

  it("takes the swatches from an Agordo: Primär as hex, Akzent only when set, Neutral step 100 or empty", () => {
    const bases = loadBases();
    const ohne: Agordo = { name: "provo", leitfarbe: "#6B4FA0" };
    const mit: Agordo = { ...ohne, zweitfarbe: { farbe: "#0f8f86" } };
    const paletten = paletrojDe(ohne, bases);
    const neutral =
      paletten?.steps.find((step) => step.palette === "neutral" && step.step === "100")?.hex ?? "";
    expect(neutral).toMatch(/^#[0-9a-f]{6}$/);
    expect({
      ohne: markenFarbenDe(ohne, paletten),
      mit: markenFarbenDe(mit, paletrojDe(mit, bases)).akzent,
      gescheitert: markenFarbenDe(ohne, undefined),
    }).toEqual({
      ohne: { primaer: "#6b4fa0", neutral },
      mit: "#0f8f86",
      gescheitert: { primaer: "#6b4fa0", neutral: "" },
    });
  });
});

describe("LNS-1.3: markenListeDe reads the working directory", () => {
  let scratch: string;
  let workdir: string;
  const bases = loadBases();

  /** Sets the mtime of a file of a brand. */
  const mtime = (name: string, datei: string, zeit: Date) =>
    utimesSync(join(markoDir(workdir, name), datei), zeit, zeit);

  beforeAll(() => {
    scratch = mkdtempSync(join(tmpdir(), "markenliste-055-"));
    workdir = join(scratch, "marken");
    mkdirSync(workdir, { recursive: true });
    for (const [name, basis] of [
      ["provo", "leer"],
      ["lumeto", "leer"],
      ["komuna", "komuna"],
      ["alfa", "leer"],
    ] as const) {
      expect(createMarko(workdir, { name, basis }).issues).toEqual([]);
    }
    // lumeto: a draft with an Etikett and a Zweitfarbe, newer than its save; a canvas state newest.
    writeDraft(workdir, "lumeto", {
      name: "lumeto",
      leitfarbe: "#2f5bff",
      etikedoj: { marko: "Lumeto" },
      zweitfarbe: { farbe: "#c6f135" },
    });
    writeFileSync(join(markoDir(workdir, "lumeto"), LEINWAND_DOSIERO), "{}\n");
    const staende = join(markoDir(workdir, "lumeto"), STAENDE_DIR);
    mkdirSync(join(staende, "unterordner.json"), { recursive: true });
    for (const datei of ["20261115T134100Z.json", "20261115T134200Z-a.json", "notiz.txt"])
      writeFileSync(join(staende, datei), "{}\n");
    // komuna: one Stand.
    mkdirSync(join(markoDir(workdir, "komuna"), STAENDE_DIR));
    writeFileSync(join(markoDir(workdir, "komuna"), STAENDE_DIR, "20261101T080000Z.json"), "{}");
    // kaputa: an agordo.json that does not read.
    mkdirSync(markoDir(workdir, "kaputa"));
    writeFileSync(join(markoDir(workdir, "kaputa"), "agordo.json"), "{ nicht json");
    // A folder without agordo.json is no brand.
    mkdirSync(join(workdir, "leer"));

    mtime("provo", "agordo.json", lokal(2026, 11, 9, 17, 20));
    mtime("alfa", "agordo.json", lokal(2026, 11, 9, 17, 20));
    mtime("komuna", "agordo.json", lokal(2026, 11, 12, 9, 48));
    mtime("lumeto", "agordo.json", lokal(2026, 11, 1, 8, 0));
    mtime("lumeto", "entwurf.json", lokal(2026, 11, 14, 22, 10));
    mtime("lumeto", LEINWAND_DOSIERO, lokal(2026, 11, 15, 14, 41));
    mtime("kaputa", "agordo.json", lokal(2026, 10, 1, 12, 0));
  });

  afterAll(() => {
    rmSync(scratch, { recursive: true, force: true });
  });

  it("gives one row per brand: newest first, Etikett or name, draft swatches, Stände from files", () => {
    const neutralDe = (agordo: Agordo): string =>
      paletrojDe(agordo, bases)?.steps.find((s) => s.palette === "neutral" && s.step === "100")
        ?.hex ?? "";
    const lumetoEntwurf: Agordo = {
      name: "lumeto",
      leitfarbe: "#2f5bff",
      etikedoj: { marko: "Lumeto" },
      zweitfarbe: { farbe: "#c6f135" },
    };
    const zeilen = markenListeDe(workdir, bases);
    const komunaFarben = zeilen.find((zeile) => zeile.name === "komuna")?.farben;
    expect(zeilen).toEqual([
      {
        name: "lumeto",
        etikedo: "Lumeto",
        lesbar: true,
        farben: { primaer: "#2f5bff", akzent: "#c6f135", neutral: neutralDe(lumetoEntwurf) },
        geaendert: lokal(2026, 11, 15, 14, 41).toISOString(),
        staende: 2,
      },
      {
        name: "komuna",
        etikedo: "komuna",
        lesbar: true,
        farben: komunaFarben,
        geaendert: lokal(2026, 11, 12, 9, 48).toISOString(),
        staende: 1,
      },
      {
        name: "alfa",
        etikedo: "alfa",
        lesbar: true,
        farben: { primaer: expect.stringMatching(/^#[0-9a-f]{6}$/), neutral: expect.any(String) },
        geaendert: lokal(2026, 11, 9, 17, 20).toISOString(),
        staende: 0,
      },
      {
        name: "provo",
        etikedo: "provo",
        lesbar: true,
        farben: { primaer: expect.stringMatching(/^#[0-9a-f]{6}$/), neutral: expect.any(String) },
        geaendert: lokal(2026, 11, 9, 17, 20).toISOString(),
        staende: 0,
      },
      {
        name: "kaputa",
        etikedo: "kaputa",
        lesbar: false,
        geaendert: lokal(2026, 10, 1, 12, 0).toISOString(),
        staende: 0,
      },
    ]);
    const neutrale = zeilen.flatMap((zeile) => (zeile.farben ? [zeile.farben.neutral] : []));
    expect(neutrale.filter((hex) => !/^#[0-9a-f]{6}$/.test(hex))).toEqual([]);
    // Brands on the basis leer have no Zweitfarbe: their Akzent stays absent (dashed empty).
    expect(
      zeilen
        .filter((zeile) => zeile.name === "alfa" || zeile.name === "provo")
        .map((zeile) => zeile.farben?.akzent),
    ).toEqual([undefined, undefined]);
  });

  it("is empty for a working directory that does not exist", () => {
    expect(markenListeDe(join(scratch, "fehlt"), bases)).toEqual([]);
  });
});

describe("LNS-1.3: the Markenliste on the start screen", () => {
  const html = screen(mitListe(ZEILEN));
  const liste = listenTeil(html);

  it("keeps the start screen without a list byte for byte as at 642ab220", () => {
    expect(sha256(screen(exampleScreenInput("start")))).toBe(START_642AB220);
  });

  it("holds the M-2 invariants of sxtupoj.test.ts with a list", () => {
    const inventory = screenInventory(html);
    const verletzt: string[] = [];
    if (inventory.questions !== 1) verletzt.push(`questions ${inventory.questions}`);
    if (inventory.mainButtons > 1) verletzt.push(`main buttons ${inventory.mainButtons}`);
    if (inventory.back) verletzt.push("Zurück");
    if (inventory.next) verletzt.push("Weiter");
    for (const ero of ["<fm-sxelo", "<fm-pagxo", "<fm-formularo"])
      if (!html.includes(ero)) verletzt.push(`missing ${ero}`);
    if (/<(button|select|textarea|h[1-6])\b/.test(html)) verletzt.push("native control");
    for (const [input = ""] of html.matchAll(/<input\b[^>]*>/g))
      if (!/type="(range|color)"/.test(input)) verletzt.push(input);
    if (/<a\b/.test(html.replace(/<fm-navigado[\s\S]*?<\/fm-navigado>/g, "")))
      verletzt.push("<a> outside the navigation");
    for (const term of ["Aspekto", "Agordo", "Regulo", "Jugxo", "Vortaro", "Sxablono"])
      if (new RegExp(`\\b${term}\\b`).test(inventory.text)) verletzt.push(term);
    expect(verletzt).toEqual([]);
  });

  it("stands under the heading „Angefangene Marken“, outside the form and the choice of the start", () => {
    expect(liste).not.toBe("");
    expect(count(html, `<fm-titolo level="2">${HEADING}</fm-titolo>`)).toBe(1);
    expect(liste).toContain(HEADING);
    const formEnde = html.indexOf("</fm-formularo>");
    expect(html.indexOf('<section class="mt-marken"')).toBeGreaterThan(formEnde);
    expect(html.indexOf('<section class="mt-marken"')).toBeLessThan(
      html.indexOf("</section>", formEnde),
    );
    // Option B: beside the form, so the step is not one column.
    expect(count(html, '<section class="mt-sxtupo" data-mt-marken>')).toBe(1);
  });

  it("adds no button, no script and changes nothing in the form („Vorhandene Marke öffnen“ as before)", () => {
    const ohne = screen(exampleScreenInput("start"));
    const formular = (text: string) =>
      text.slice(text.indexOf("<fm-formularo"), text.indexOf("</fm-formularo>"));
    const tags = (text: string, re: RegExp) => [...text.matchAll(re)].map(([tag]) => tag);
    expect(formular(html)).toBe(formular(ohne));
    expect(tags(html, /<fm-butono\b[^>]*>[\s\S]*?<\/fm-butono>/g)).toEqual(
      tags(ohne, /<fm-butono\b[^>]*>[\s\S]*?<\/fm-butono>/g),
    );
    expect(tags(html, /<script\b[^>]*>/g)).toEqual(tags(ohne, /<script\b[^>]*>/g));
    expect({
      button: /role="button"|<fm-butono|<fm-sxaltilo|<fm-markobutono/.test(liste),
      anlegen: /anlegen/i.test(liste),
      oeffnen: /öffnen/i.test(liste),
    }).toEqual({ button: false, anlegen: false, oeffnen: false });
  });

  it("shows per brand a card with name, three swatches, „zuletzt geändert“ and the Stände", () => {
    const karten = [...liste.matchAll(/<fm-karto\b[^>]*>[\s\S]*?<\/fm-karto>/g)].map(([k]) => k);
    expect(karten).toHaveLength(4);
    const [lumeto = "", provo = "", komuna = ""] = karten;
    const farben = (karte: string) =>
      [...karte.matchAll(/<span class="mt-marken-farbe"([^>]*)><\/span>/g)].map(([, a]) => a);
    expect({
      heading: [...liste.matchAll(/<span slot="heading">([^<]*)<\/span>/g)].map(([, t]) => t),
      lumeto: farben(lumeto),
      provo: farben(provo),
      texte: karten.map((karte) =>
        [...karte.matchAll(/<fm-teksto[^>]*>([^<]*)<\/fm-teksto>/g)].map(([, t]) => t),
      ),
    }).toEqual({
      heading: ["Lumeto", "provo", "komuna", "kaputa"],
      lumeto: [
        ' data-mt-farbe="primaer" style="background-color: #2f5bff"',
        ' data-mt-farbe="akzent" style="background-color: #c6f135"',
        ' data-mt-farbe="neutral" style="background-color: #e9ebf2"',
      ],
      provo: [
        ' data-mt-farbe="primaer" style="background-color: #7a3e9d"',
        ' data-mt-farbe="akzent" data-mt-leer',
        ' data-mt-farbe="neutral" style="background-color: #efedf2"',
      ],
      texte: [
        ["zuletzt geändert 15.11.2026, 14:41", "3 Stände"],
        ["zuletzt geändert 09.11.2026, 17:20", "1 Stand"],
        ["zuletzt geändert 05.01.2026, 09:07", "0 Stände"],
        [UNLESBAR],
      ],
    });
    expect(komuna).toContain('data-mt-farbe="akzent" data-mt-leer');
  });

  it("leads every readable card to /marko/<name>/grafeo; the unreadable one has no link and no swatch", () => {
    const ziele = [...liste.matchAll(/<fm-ligilo\b[^>]*\bto="([^"]*)"/g)].map(([, to]) => to);
    expect(ziele).toEqual(["/marko/lumeto/grafeo", "/marko/provo/grafeo", "/marko/komuna/grafeo"]);
    const kaputa = /<fm-karto\b[^>]*data-mt-unlesbar[^>]*>[\s\S]*?<\/fm-karto>/.exec(liste)?.[0];
    expect(kaputa).toBeDefined();
    expect({
      link: kaputa?.includes("fm-ligilo"),
      farbe: kaputa?.includes("mt-marken-farbe"),
      satz: kaputa?.includes(UNLESBAR),
      name: kaputa?.includes('<span slot="heading">kaputa</span>'),
    }).toEqual({ link: false, farbe: false, satz: true, name: true });
  });

  it("says „Noch keine Marke. Lege oben die erste an.“ without brands", () => {
    const leer = listenTeil(screen(mitListe([])));
    expect(leer).toContain(HEADING);
    expect(leer).toContain(LEER);
    expect(leer).not.toContain("<fm-karto");
    expect(liste).not.toContain(LEER);
  });

  it("lays out with tokens only: an intrinsic grid, no media query, no literal colour or px", () => {
    const stile = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(([, css = ""]) => css);
    const eigen = stile.filter((css) => css.includes(".mt-marken"));
    expect(eigen).toHaveLength(1);
    const css = eigen[0] ?? "";
    const verletzt: string[] = [];
    if (css.includes("@media")) verletzt.push("@media");
    if (/#[0-9a-f]{3,8}\b|rgb|hsl|oklch/i.test(css)) verletzt.push("colour literal");
    if (/\d(px|ms|s)\b/.test(css)) verletzt.push("px or duration");
    if (!/repeat\(auto-fill, minmax\(min\(100%, [\d.]+rem\), 1fr\)\)/.test(css))
      verletzt.push("intrinsic grid");
    for (const [, wert = ""] of css.matchAll(/:\s*([^;{}]+);/g)) {
      const rest = wert
        .replace(/var\(--fm-[a-z0-9-]+\)/g, "")
        .replace(/[\d.]+(rem|fr|%)|\b\d+\b/g, "")
        .replace(
          /\b(grid|flex|wrap|none|dashed|transparent|start|auto-fill|repeat|minmax|min|span|column|auto)\b/g,
          "",
        )
        .replace(/[\s(),/*+-]/g, "");
      if (rest !== "") verletzt.push(`${wert.trim()} → ${rest}`);
    }
    expect(verletzt).toEqual([]);
  });

  it("names no rule, no problem count and no judgment (Abnahme 8)", () => {
    const modelo = buildModelo(loadBases().structure.files).modelo;
    const woerter = [
      ...modelo.reguloj
        .flatMap((r) => [r.name, r.id])
        .filter((wort): wort is string => typeof wort === "string" && wort !== ""),
      "Problem",
      "Prüfung",
      "Betroffen",
      "Vorschlag",
      "nicht exportierbar",
      "danger",
    ];
    const gefunden = (teil: string): string[] => {
      const text = screenInventory(teil).text;
      return woerter.filter((wort) => teil.includes(wort) || text.includes(wort));
    };
    expect(gefunden(liste)).toEqual([]);
    // The control: the same search finds a rule's name where one stands.
    const erste = modelo.reguloj[0]?.name ?? "";
    expect(erste).not.toBe("");
    expect(gefunden(`${liste}<fm-teksto>${erste}</fm-teksto>`)).toContain(erste);
  });

  it("changes no other step: a list in the input of a later step is ignored", () => {
    const abweichend = SXTUPOJ.filter(({ key }) => key !== "start")
      .filter(({ key }) => {
        const input = exampleScreenInput(key);
        return screen({ ...input, markenListe: ZEILEN }) !== screen(input);
      })
      .map(({ key }) => key);
    expect(abweichend).toEqual([]);
  });

  it("has no word of the private repos or the R-12 word in any new line", () => {
    expect(html).not.toContain(["cif", "ere", "cigo"].join(""));
  });
});

describe("LNS-1.3: GET / and the start answers of POST /marko carry the list (inputOf)", () => {
  let server: TestServilo;

  beforeAll(async () => {
    server = await testServilo("markenliste-055-");
  });

  afterAll(async () => {
    await server?.close();
  });

  it("says there is no brand yet, then lists a new brand with a link to its canvas", async () => {
    const vorher = (await server.anfrage("GET", "/")).body.toString("utf8");
    expect(vorher).toContain(LEER);
    expect(createMarko(server.workdir, { name: "lumeto", basis: "leer" }).issues).toEqual([]);
    const nachher = (await server.anfrage("GET", "/")).body.toString("utf8");
    expect(listenTeil(nachher)).toContain('to="/marko/lumeto/grafeo"');
    expect(listenTeil(nachher)).toContain("0 Stände");
    const fehler = await server.anfrage(
      "POST",
      "/marko",
      new URLSearchParams({ name: "", basis: "leer" }).toString(),
      "application/x-www-form-urlencoded",
    );
    expect(fehler.status).toBe(200);
    expect(listenTeil(fehler.body.toString("utf8"))).toContain('to="/marko/lumeto/grafeo"');
    const schritt = (await server.anfrage("GET", "/marko/lumeto/farbe")).body.toString("utf8");
    expect(schritt).not.toContain(HEADING);
  });
});
