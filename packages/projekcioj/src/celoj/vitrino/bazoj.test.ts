// Spec 029 ① 5: the foundation pages of the Vitrino – Tokens, Farbe, Elevation, Form, Abstände,
// Typografie, Bewegung, Icons – with texts of their own, the Lingvo-Schalter and the chosen brand.
// Built here with all five brands (fundamento.cxiuj.config.json), as the maintainer opens it.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { projectModeloSource } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "../../build.js";
import { VITRINO_TEKSTOJ, type VitrinoDatumoj } from "./datumoj.js";
import { VITRINO_FILE } from "./vitrino.js";

const CXIUJ = fileURLToPath(
  new URL(
    "../../../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
    import.meta.url,
  ),
);
const PAGES = {
  tokenoj: "Tokens",
  koloro: "Farbe",
  elevacio: "Elevation",
  formo: "Form",
  spacoj: "Abstände",
  tipografio: "Typografie",
  movado: "Bewegung",
  ikonoj: "Icons",
} as const;

const dirs: string[] = [];
let html = "";
let datumoj: VitrinoDatumoj;

beforeAll(async () => {
  const out = mkdtempSync(join(tmpdir(), "fm-vitrino-bazoj-"));
  dirs.push(out);
  const built = await buildProjekcioj({ outDir: out, source: projectModeloSource(CXIUJ) });
  expect(built.ok).toBe(true);
  const full = readFileSync(join(out, VITRINO_FILE), "utf8");
  html = full
    .replace(/<script type="module" id="fm-vitrino-werkstatt-skripto">[\s\S]*?<\/script>/, "")
    .replace(/<script type="application\/json" id="fm-werkstatt">[\s\S]*?<\/script>/, "");
  const island = /<script type="application\/json" id="fm-vitrino">(.*?)<\/script>/s.exec(html);
  datumoj = JSON.parse((island?.[1] ?? "{}").replaceAll("<\\/", "</")) as VitrinoDatumoj;
}, 240_000);

afterAll(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("Spec 029 ① 5: the foundation pages", () => {
  it("has the eight pages, each with a heading the Lingvo-Schalter switches", () => {
    for (const [key, heading] of Object.entries(PAGES)) {
      expect(html, key).toContain(`id="fm-vitrino-${key}"`);
      expect(html, key).toContain(`<h2><span data-fm-teksto="${key}">${heading}</span></h2>`);
      expect(VITRINO_TEKSTOJ[key]?.en, key).toBeTruthy();
    }
  });

  it("every page has a text of its own, in German and in English", () => {
    for (const key of Object.keys(PAGES)) {
      const intro = VITRINO_TEKSTOJ[`${key}.enkonduko`];
      expect(intro?.de, key).toBeTruthy();
      expect(intro?.en, key).toBeTruthy();
      expect(html, key).toContain(`data-fm-teksto="${key}.enkonduko"`);
    }
  });

  it("Tokens: every token with its level, its value per brand and mode and its origin, searchable", () => {
    const tokenoj = datumoj.bazoj?.tokenoj ?? [];
    // Spec 029 ②b-1: the spinner of the twelve fields (M-5, 36), the clear button of four (M-6, 4)
    // and the faldilo's summary by state (M-1: 5 added, its one colour gone); Abnahme #122: the
    // clear button of kampo, kompletigilo and elektilo by size (3 for 1 each, +6) and the target of
    // the six buttons at the end of a field (+6); ②b-1b M-2: the status of the twelve fields, their
    // message and the kampo's status icon (216). Spec 035 2.3.1 and 2.3.3: the targets of the date
    // picker's trigger and ✕ (+2).
    expect(tokenoj.length).toBe(1882);
    const levels = new Set(tokenoj.map((token) => token.ebeno));
    expect(levels).toEqual(new Set(["grundlage", "rolle", "ero"]));
    const text = tokenoj.find((token) => token.name === "color.text.default");
    expect(text?.ebeno).toBe("rolle");
    expect(text?.valoroj.komuna?.light).toBe("#000000");
    expect(text?.valoroj.komuna?.dark).toBe("#f8f8f8");
    // Die Herkunft: komuna aus der Fonto (Datei und Schlüssel), die anderen aus ihrem Set.
    expect(text?.deveno?.komuna).toMatchObject({ fonto: "astryx", maniero: "prenita" });
    expect(text?.valoroj["komuna-0-2"]?.light).not.toBe(text?.valoroj.komuna?.light);
    expect(Object.keys(text?.valoroj ?? {})).toEqual([
      "komuna",
      "ekzemplo",
      "provo",
      "provo-kompakta",
      "komuna-0-2",
    ]);
    expect(html).toMatch(/<input[^>]*type="search"[^>]*data-fm-bazoj-sercxo/);
  });

  it("Farbe: the roles light and dark as pairs, with their contrast on the surface", () => {
    const koloro = datumoj.bazoj?.koloro?.komuna ?? [];
    const text = koloro.find((row) => row.token === "color.text.default");
    expect(text?.light).toBe("#000000");
    expect(text?.dark).toBe("#f8f8f8");
    expect(text?.kontrasto?.light).toBeGreaterThan(15);
    expect(koloro.some((row) => row.token.startsWith("color.status."))).toBe(true);
  });

  it("Elevation, Form, Abstände and Bewegung show their scales with the values of the brand", () => {
    const bazoj = datumoj.bazoj;
    expect(bazoj?.elevacio?.komuna?.map((row) => row.token)).toEqual([
      "elevation.shadow.raised",
      "elevation.shadow.overlay",
      "elevation.shadow.floating",
      "elevation.shadow.modal",
    ]);
    expect(bazoj?.formo?.komuna?.find((row) => row.token === "radius.medium")?.valoro).toBe("10px");
    expect(bazoj?.spacoj?.komuna?.find((row) => row.token === "spacing.scale.400")?.valoro).toBe(
      "16px",
    );
    expect(bazoj?.movado?.komuna?.find((row) => row.token === "motion.duration.fast")?.valoro).toBe(
      "125ms",
    );
    expect(bazoj?.formo?.["komuna-0-2"]?.find((row) => row.token === "radius.medium")?.valoro).toBe(
      "4px",
    );
  });

  it("Typografie: the roles with size, line height and weight; provo with Prata", () => {
    const komuna = datumoj.bazoj?.tipografio?.komuna ?? [];
    expect(komuna.find((row) => row.token === "typography.body.1")).toMatchObject({
      grandeco: "14px",
      familio: "Geist",
    });
    const provo = datumoj.bazoj?.tipografio?.provo ?? [];
    expect(provo.find((row) => row.token === "typography.display.1")?.familio).toBe("Prata");
    // Spec 029 ①-6: Prata has the weight 400 only; provo's headings show it, not a faked cut.
    for (const token of [
      "typography.display.1",
      "typography.headline.1",
      "typography.headline.4",
    ]) {
      expect(provo.find((row) => row.token === token)?.pezo, token).toBe("400");
    }
  });

  it("Icons: every name of the Ikonaro, drawn by the chosen brand", () => {
    expect(html).toContain('id="fm-vitrino-ikonoj"');
    for (const name of ["check", "close", "edit", "calendar"]) {
      expect(html, name).toContain(`data-fm-bazoj-ikono="${name}"`);
    }
  });

  it("names the Fonto only as the origin of a value, never in the shown text", () => {
    const shown = html.replace(/<script[\s\S]*?<\/script>/g, "");
    expect(shown).not.toMatch(/astryx|Meta Platforms/i);
  });

  it("every table of the pages has a caption", () => {
    for (const key of Object.keys(PAGES)) {
      const start = html.indexOf(`id="fm-vitrino-${key}"`);
      const section = html.slice(start, html.indexOf("</section>", start));
      const tables = section.match(/<table/g)?.length ?? 0;
      const captions = section.match(/<caption/g)?.length ?? 0;
      expect(captions, key).toBe(tables);
    }
  });
});
