// Spec 036 Teil 5 ③ (Spec 029 ③): every Ero page of the Vitrino has nine sections, in this order,
// with the Lingvo switch – Zweck, Wann nicht, Anatomie, Varianten und Größen, Zustände, Do/Don't,
// Barrierefreiheit with the contrast matrix per state, Theming, Beispiele. The page of an Ero is
// its section with the live grid and, right after it, the section of its documentation; the
// matrix comes from the Alirebleco measurements, the Theming table from the Ero-Tokens, the
// examples from the Jugxoj – no table is written by hand.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DOKU_OFFEN,
  defaultModeloSource,
  eroKontrastParojOf,
  eroTokenojOf,
  examplesOf,
  fixtureModeloSource,
  getEro,
  loadModelo,
  type Modelo,
  type ModeloSource,
} from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "../../build.js";
import { VITRINO_TEKSTOJ } from "./datumoj.js";
import { DOKU_SEKCIOJ, dokuMarkup } from "./doku.js";
import { VITRINO_FILE } from "./vitrino.js";

function loaded(source: ModeloSource): Modelo {
  const { modelo } = loadModelo(source);
  if (modelo === undefined) throw new Error("the Modelo does not load");
  return modelo;
}

const escaped = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

let out = "";
let html = "";
const modelo = loaded(defaultModeloSource());

beforeAll(async () => {
  out = mkdtempSync(join(tmpdir(), "fm-vitrino-doku-"));
  const built = await buildProjekcioj({ outDir: out, source: defaultModeloSource() });
  expect(built.ok).toBe(true);
  html = readFileSync(join(out, VITRINO_FILE), "utf8");
}, 180_000);

afterAll(() => rmSync(out, { recursive: true, force: true }));

/** The markup of one top-level section of the Vitrino, by its id. */
function sectionOf(id: string): string {
  const start = html.indexOf(`<section id="${id}"`);
  if (start === -1) return "";
  const next = html.indexOf('\n<section id="fm-vitrino-', start + 1);
  return html.slice(start, next === -1 ? undefined : next);
}

describe("the Ero page of the Vitrino (Spec 036 ③)", () => {
  it("names the nine sections in the order of Spec 029 ③", () => {
    expect(DOKU_SEKCIOJ).toEqual([
      "zweck",
      "wann-nicht",
      "anatomie",
      "varianten",
      "zustaende",
      "do-dont",
      "barrierefreiheit",
      "theming",
      "beispiele",
    ]);
    // Every heading in German and English (the Lingvo switch).
    for (const key of DOKU_SEKCIOJ) {
      expect(VITRINO_TEKSTOJ[`doku.${key}`]?.de, key).toBeTruthy();
      expect(VITRINO_TEKSTOJ[`doku.${key}`]?.en, key).toBeTruthy();
    }
  });

  it.each(modelo.eroj.map((entry) => entry.ero.name))(
    "%s: the documentation follows the grid, with the nine sections in order",
    (ero) => {
      const grid = html.indexOf(`<section id="fm-vitrino-${ero}"`);
      const doku = html.indexOf(`<section id="fm-vitrino-doku-${ero}"`);
      expect(grid).toBeGreaterThan(-1);
      expect(doku).toBeGreaterThan(grid);
      // Nothing between the grid and its documentation.
      expect(html.slice(grid + 1, doku)).not.toContain('<section id="fm-vitrino-');
      const markup = sectionOf(`fm-vitrino-doku-${ero}`);
      expect(markup).toContain('data-fm-modus-only="ansehen"');
      const order = [...markup.matchAll(/data-fm-doku-sekcio="([a-z-]+)"/g)].map((m) => m[1]);
      expect(order).toEqual([...DOKU_SEKCIOJ]);
      for (const key of DOKU_SEKCIOJ) expect(markup).toContain(`data-fm-teksto="doku.${key}"`);
    },
  );

  it.each(modelo.eroj.map((entry) => entry.ero.name))(
    "%s: purpose in German and English, the open fields marked as open",
    (ero) => {
      const markup = sectionOf(`fm-vitrino-doku-${ero}`);
      for (const lingvo of ["de", "en"] as const) {
        const answer = getEro(modelo, { name: ero, lingvo });
        if (!answer.ok || answer.output.uzo === undefined) throw new Error(ero);
        expect(markup).toContain(
          `<span lang="${lingvo}" data-fm-doku-lingvo="${lingvo}">${escaped(answer.output.uzo.purpose)}</span>`,
        );
      }
      const uzo = modelo.eroj.find((entry) => entry.ero.name === ero)?.uzo as
        | Record<string, unknown>
        | undefined;
      for (const field of ["when-not", "do-dont", "keyboard"]) {
        const value = uzo?.[field];
        const open = typeof value === "object" && value !== null && "offen" in value;
        expect(markup.includes(`data-fm-doku-offen="${field}"`), field).toBe(open);
      }
      if (markup.includes("data-fm-doku-offen=")) {
        expect(markup).toContain(escaped(DOKU_OFFEN.de));
        expect(markup).toContain(escaped(DOKU_OFFEN.en));
      }
    },
  );

  it.each(modelo.eroj.map((entry) => entry.ero.name))(
    "%s: Theming has one row per Ero-Token, Beispiele one entry per Jugxo example",
    (ero) => {
      const entry = modelo.eroj.find((candidate) => candidate.ero.name === ero);
      if (entry === undefined) throw new Error(ero);
      const markup = sectionOf(`fm-vitrino-doku-${ero}`);
      const rows = [...markup.matchAll(/<tr data-fm-token="([a-z0-9.]+)"/g)].map((m) => m[1]);
      expect(rows).toEqual(eroTokenojOf(entry).map((token) => token.name));
      const examples = [...markup.matchAll(/data-fm-doku-ekzemplo="([A-Za-z0-9_]+)"/g)].map(
        (m) => m[1],
      );
      expect(examples).toEqual(examplesOf(modelo, entry).map((example) => example.jugxo));
      expect(markup).toContain(`href="#fm-vitrino-${ero}"`);
    },
  );

  it("fills the contrast matrix only with pairs Alirebleco measures", () => {
    const known = new Set([
      ...modelo.kontrastParoj.map((pair) => pair.name),
      ...eroKontrastParojOf(modelo, false).map((pair) => pair.name),
    ]);
    const cells = [...html.matchAll(/data-fm-doku-paroj="([^"]*)"/g)].map((m) => m[1] ?? "");
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      for (const name of cell.split(" ").filter((part) => part !== "")) {
        expect(known.has(name), name).toBe(true);
      }
    }
    // Every Ero with a colour part has a matrix.
    for (const entry of modelo.eroj) {
      const colours = eroTokenojOf(entry).filter((token) => token.property === "color");
      const markup = sectionOf(`fm-vitrino-doku-${entry.ero.name}`);
      expect(markup.includes("data-fm-doku-paroj="), entry.ero.name).toBe(colours.length > 0);
    }
  });

  it("keeps the documentation out of the data island", () => {
    const island = /<script type="application\/json" id="fm-vitrino">(.*?)<\/script>/s.exec(html);
    expect(island?.[1]).toBeDefined();
    expect(island?.[1]).not.toContain("fm-vitrino-doku-");
  });
});

describe("the documentation of a Uzo with its fields written (valid/dokumentaro-plena)", () => {
  const plena = loaded(
    fixtureModeloSource(
      fileURLToPath(
        new URL("../../../../modelo/test/fixtures/valid/dokumentaro-plena/", import.meta.url),
      ),
    ),
  );
  const butono = plena.eroj.find((entry) => entry.ero.name === "butono");
  if (butono === undefined) throw new Error("butono missing");
  const markup = dokuMarkup(plena, butono);

  it("shows when-not with the link to the Ero to take instead, in both languages", () => {
    expect(markup).toContain(
      escaped("Wer zu einer anderen Ansicht wechseln will, folgt einem Verweis."),
    );
    expect(markup).toContain("Whoever moves to another view follows a link.");
    expect(markup).toContain('href="#fm-vitrino-ligilo"');
  });

  it("shows do and don't and the keyboard table, in both languages", () => {
    expect(markup).toContain("Die Beschriftung nennt die Handlung.");
    expect(markup).toContain("Two equally strong actions side by side.");
    expect(markup).toContain("<kbd>Enter</kbd>");
    expect(markup).toContain("<kbd>Space</kbd>");
    expect(markup).toContain("Löst die Handlung aus.");
    expect(markup).toContain("Starts the action.");
    expect(markup).not.toContain("data-fm-doku-offen=");
  });
});
