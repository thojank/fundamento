// What the Vitrino shows (Spec 004 T008–T010, FR-06): the sections in the document and the data
// island behind them. Every number here is the one the checks compute, not a second calculation.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultModeloSource, evaluateAlirebleco, getEro, loadModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "../../build.js";
import { roundTo, type VitrinoDatumoj } from "./datumoj.js";
import { VITRINO_FILE } from "./vitrino.js";

const dirs: string[] = [];
let html = "";
let datumoj: VitrinoDatumoj;

beforeAll(async () => {
  const out = mkdtempSync(join(tmpdir(), "fm-vitrino-datumoj-"));
  dirs.push(out);
  const built = await buildProjekcioj({ outDir: out, source: defaultModeloSource() });
  expect(built.ok).toBe(true);
  html = readFileSync(join(out, VITRINO_FILE), "utf8");
  const island = /<script type="application\/json" id="fm-vitrino">(.*?)<\/script>/s.exec(html);
  datumoj = JSON.parse((island?.[1] ?? "{}").replaceAll("<\\/", "</")) as VitrinoDatumoj;
}, 120_000);

afterAll(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("the sections of FR-06", () => {
  it("has all ten sections, each with a heading", () => {
    for (const id of [
      "kapo",
      "paletroj",
      "roloj",
      "butono",
      "kontrasto",
      "regularo",
      "kovrado",
      "komparo",
    ]) {
      expect(html, id).toContain(`id="fm-vitrino-${id}"`);
    }
    expect(html.match(/<h2>/g)?.length ?? 0).toBeGreaterThanOrEqual(7);
  });

  it("shows every palette step with its token, hex and lightness", () => {
    const ramps = datumoj.paletroj.komuna ?? [];
    expect(ramps.map((ramp) => ramp.rampo)).toContain("accent");
    const accent = ramps.find((ramp) => ramp.rampo === "accent");
    expect(accent?.stupoj.length).toBeGreaterThan(8);
    const step = accent?.stupoj[0];
    expect(html).toContain(`<code>${step?.token}</code>`);
    expect(html).toContain(step?.hex ?? "never");
    expect(step?.l).toBeGreaterThan(0);
    expect(accent?.regula).toMatch(/% vom Median/);
  });

  it("shows the four surfaces with their distance to the neighbour and to the anchor", () => {
    const roles = datumoj.roloj["komuna|light|default"];
    expect(roles?.surfaces.map((row) => row.token)).toEqual([
      "color.background.sunken",
      "color.background.canvas",
      "color.background.default",
      "color.background.raised",
    ]);
    expect(roles?.surfaces[1]?.alNaskbo).toBeGreaterThan(0.02);
    expect(roles?.surfaces[3]?.alEkstremo).toBeGreaterThan(0.02);
    expect(roles?.text).toHaveLength(3);
    expect(roles?.status.length).toBeGreaterThan(10);
    expect(roles?.agoj.length).toBeGreaterThan(10);
  });

  it("renders fm-butono for every combination of the Skemo", () => {
    expect(html).toContain("<fm-butono");
    expect(html).toContain('emphasis="high"');
    expect(html).toContain('intent="danger"');
    expect(html).toContain("disabled");
    expect(html).toContain("loading");
    expect(html).not.toContain("react");
  });

  it("carries WCAG and APCA of every pair, with threshold, reserve and result", () => {
    const { modelo } = loadModelo(defaultModeloSource());
    if (modelo === undefined) throw new Error("the repository Modelo could not be loaded");
    const evaluation = evaluateAlirebleco(modelo, {
      kontrastParojFile: "data/kontrastparoj.json",
      collect: true,
    });
    const first = evaluation.measurements?.[0];
    const key = modelo.dimensioj
      .map((dimensio) => first?.combination[dimensio.name] ?? "")
      .join("|");
    const rows = datumoj.mezuroj[key] ?? [];
    expect(rows.length).toBe(modelo.kontrastParoj.length);
    const row = rows.find((entry) => entry.paro === first?.pair.name);
    expect(row?.wcag2).toBeCloseTo(first?.main.ratio ?? 0, 1);
    expect(row?.apca).not.toBe(0);
    expect(row?.rezervo).toBeDefined();
    expect(typeof row?.pasis).toBe("boolean");
  });

  it("counts the advisory APCA findings", () => {
    expect(datumoj.apcaHintoj.nun).toBeGreaterThan(1000);
  });

  it("carries every automatic Regulo with its kialo and its result per combination", () => {
    const key = datumoj.kombinoj[0] ?? "";
    const rules = datumoj.regularo[key] ?? [];
    expect(rules.length).toBeGreaterThan(15);
    for (const rule of rules) {
      expect(rule.kialo.length).toBeGreaterThan(20);
      expect(typeof rule.pasis).toBe("boolean");
    }
    expect(rules.every((rule) => rule.pasis)).toBe(true);
  });

  it("carries the design goals of the brand with target, measurement and result", () => {
    const goals = datumoj.aspiroj.komuna ?? [];
    expect(goals.length).toBe(5);
    expect(goals.map((goal) => goal.metriko)).toContain("dimensio-kovrado");
    for (const goal of goals) {
      expect(goal.atingita).toBe(true);
      expect(goal.limo).not.toBe("");
      expect(goal.mezurita).not.toBe("–");
      expect(goal.kialo.length).toBeGreaterThan(20);
    }
  });

  // The page shows two coverage numbers: the comparison counts every token of the dark set, the
  // design goal only the four role groups it names. Without the scope the two look contradictory.
  it("names the token scope of every design goal", () => {
    const goals = datumoj.aspiroj.komuna ?? [];
    const dark = goals.find((goal) => goal.metriko === "dimensio-kovrado");
    expect(dark?.amplekso).toContain("color.background.**");
    expect(dark?.amplekso).toContain("color.status.**");
    const reserve = goals.find((goal) => goal.metriko === "wcag2-reserve");
    expect(reserve?.amplekso).toBe("alle Tokens");
  });

  // A translucent action value is an overlay: showing it as #000000 with lightness 0.000 read like
  // pure black (maintainer's review of 2026-09-20).
  it("shows a translucent action value as an overlay, with its opacity", () => {
    const rows = datumoj.roloj["komuna|light|default"]?.agoj ?? [];
    const rest = rows.find((row) => row.token === "color.action.tertiary.rest");
    expect(rest?.hex).toBe("durchsichtig");
    expect(rest?.l).toBeUndefined();
    const hover = rows.find((row) => row.token === "color.action.tertiary.hover");
    expect(hover?.hex).toBe("#000000, 8 % Deckung");
    expect(hover?.l).toBeUndefined();
    const opaque = rows.find((row) => row.token === "color.action.primary.rest");
    expect(opaque?.hex).toMatch(/^#[0-9a-f]{6}$/);
    expect(opaque?.l).toBeGreaterThan(0);
  });

  // An overlay is measured on the worst surface it may lie on; the table says which one it was
  // (maintainer's review of 2026-09-20).
  it("names the surface that decided an overlay pair", () => {
    const rows = datumoj.mezuroj["komuna|medium|default|light|default|default"] ?? [];
    const hover = rows.find((row) => row.paro === "action-tertiary-text-on-action-tertiary-hover");
    expect(hover?.surfaco).toBe("color.background.sunken");
    const plain = rows.find((row) => row.paro === "text-on-background");
    expect(plain?.surfaco).toBeUndefined();
  });

  // "1 764 Hinweise" says nothing without the categories (maintainer's decision of 2026-09-20).
  it("breaks the advisory APCA findings down by category, with the worst value and the change", () => {
    const rows = datumoj.apcaHintoj.kategorioj ?? [];
    expect(rows.length).toBeGreaterThan(1);
    expect(rows.map((row) => row.kategorio)).toContain("text-normal");
    for (const row of rows) {
      expect(row.nun, row.kategorio).toBeGreaterThanOrEqual(0);
      expect(row.mezuroj, row.kategorio).toBeGreaterThan(0);
      // The worst value is an APCA Lc, and it names the pair it belongs to.
      expect(row.plejMalbona, row.kategorio).toBeGreaterThan(0);
      expect(row.plejMalbonaParo, row.kategorio).not.toBe("");
      // The threshold column names the band, because contrast=high raises it.
      expect(row.sojlo, row.kategorio).toMatch(/^\d+(–\d+)?$/);
    }
    const textNormal = rows.find((row) => row.kategorio === "text-normal");
    // The repo Modelo builds without a comparison state here, so no baseline column.
    expect(textNormal?.bazo).toBeUndefined();
  });

  it("carries the coverage per Dimensio value", () => {
    const coverage = datumoj.kovrado.komuna ?? [];
    const dark = coverage.find(
      (entry) => entry.dimensio === "color-scheme" && entry.valoro === "dark",
    );
    expect(dark?.propraj).toBe(57);
    expect(dark?.entute).toBe(76);
    expect(coverage.some((entry) => entry.dimensio === "motion")).toBe(true);
  });
});

// Spec 007 T027 (A12, S5): the Vitrino answers "Wann nehme ich den Butono nicht?" from the same
// data as get_ero; there is no second source.
describe("the Vitrino carries the Uzo of every Ero (T027, S5)", () => {
  it("the data island holds the Uzo of the butono, equal to get_ero", () => {
    const { modelo } = loadModelo(defaultModeloSource());
    if (modelo === undefined) throw new Error("the repo Modelo must load");
    const direct = getEro(modelo, { name: "butono" });
    if (!direct.ok) throw new Error("get_ero butono failed");
    expect(datumoj.uzo?.butono).toEqual(JSON.parse(JSON.stringify(direct.output.uzo)));
  });

  it("renders the section Gebrauch with the boundaries and their kialo", () => {
    expect(html).toContain('id="fm-vitrino-uzo"');
    expect(html).toContain("<h2>Gebrauch</h2>");
    for (const boundary of datumoj.uzo?.butono?.boundary ?? []) {
      expect(html).toContain(boundary.case);
      expect(html).toContain(boundary.kialo);
    }
    expect(html).toContain("Wann nehme ich den Butono nicht?");
  });
});

// Nachlese der Abnahmen von Spec 004 (M1, 2026-10-12, Befund 2 und 5), Spec 008 (C8) und Spec 009
// (F-5, F-6, C8), 2026-10-13: what the maintainer saw in the Vitrino and no test had caught.
describe("the Vitrino after the acceptances (Nachlese 2026-10-13)", () => {
  // F-5 (Spec 009 C4): Figma shows "Hinweis" and "Fehler" in the field, the Vitrino showed no
  // help and no error text. The error text stands only where the Skemo allows it: the constraint
  // "slot error filled ⇒ invalid" keeps it out of every other column.
  it("the kampo shows the help text in every cell and the error text only in the invalid column (F-5)", () => {
    const cells = html.match(/<fm-kampo[^>]*>.*?<\/fm-kampo>/g) ?? [];
    expect(cells.length).toBeGreaterThan(10);
    const withHelp = cells.filter((cell) => cell.includes('<span slot="help">Hinweis</span>'));
    expect(withHelp.length).toBe(cells.length);
    const invalid = cells.filter((cell) => /<fm-kampo[^>]* invalid[ >]/.test(cell));
    expect(invalid.length).toBeGreaterThan(0);
    const withError = cells.filter((cell) => cell.includes('<span slot="error">Fehler</span>'));
    expect(withError).toEqual(invalid);
    // The butono and the ligilo have no help or error slot: their cells stay as they were.
    expect(html.match(/<fm-butono[^>]*>[^<]*<span/g)).toBeNull();
  });

  // F-6 (Spec 009 C8): the slot table did not say that the label of the kampo is a duty.
  it("the slot table carries the column Pflicht, ja for the label of the kampo (F-6)", () => {
    expect(html).toContain('<th scope="col">Pflicht</th>');
    expect(html).toContain(
      '<tr><th scope="row"><code>label</code></th><td>text</td><td>1</td><td>0</td><td>ja</td></tr>',
    );
    expect(html).toContain(
      '<tr><th scope="row"><code>help</code></th><td>text</td><td>1</td><td>0</td><td>–</td></tr>',
    );
  });

  // C8 (Spec 008 and 009): "Label darf umbrechen" holds for the ligilo only inline, and the kampo's
  // line that never breaks is the input line, not the label. The subject comes from the a11y role.
  it("the layout sentence names the subject and the placement (C8)", () => {
    expect(datumoj.a11yRoloj).toEqual({ butono: "button", kampo: "textbox", ligilo: "link" });
    expect(html).toContain("Größe aus dem Inhalt, Label bricht nie um.");
    expect(html).toContain("Größe aus dem Inhalt, Label darf umbrechen (inline), standalone nie.");
    expect(html).toContain("Größe aus dem Container, Eingabezeile bricht nie um.");
    expect(html).not.toContain("Container, Label bricht nie um");
  });

  // Spec 004 M1, Befund 5: shade and tint showed #000000 / #ffffff with L 0.000 / 1.000, the alpha
  // swallowed — the same words as the overlays of the action roles (maintainer's review of
  // 2026-09-20), and no lightness, because an overlay has none until it lies on a surface.
  it("shade and tint show their opacity and no lightness in the palettes (Befund 5)", () => {
    const ramps = datumoj.paletroj.komuna ?? [];
    const shade = ramps.find((ramp) => ramp.rampo === "shade");
    expect(shade).toBeDefined();
    const zero = shade?.stupoj.find((step) => step.stupo === 0);
    expect(zero?.hex).toBe("durchsichtig");
    expect(zero?.l).toBeUndefined();
    const eight = shade?.stupoj.find((step) => step.stupo === 8);
    expect(eight?.hex).toBe("#000000, 8 % Deckung");
    expect(eight?.l).toBeUndefined();
    const tint = ramps.find((ramp) => ramp.rampo === "tint");
    expect(tint?.stupoj.find((step) => step.stupo === 8)?.hex).toBe("#ffffff, 8 % Deckung");
    expect(html).toContain("<td>#000000, 8 % Deckung</td><td>–</td>");
    const accent = ramps.find((ramp) => ramp.rampo === "accent");
    expect(accent?.stupoj.every((step) => typeof step.l === "number")).toBe(true);
  });

  // Spec 004 M1, Befund 5: color.text.default in dark showed "NaN" as its distance to the anchor.
  // L was 1.000 there; 1 − L is a number in exponent notation ("1e-16"), and the rounding glued
  // "e3" to it. The document never shows NaN, and the rounding takes any finite number.
  it("rounds any finite number, and the document shows no NaN (Befund 5)", () => {
    expect(roundTo(1e-7)).toBe(0);
    expect(roundTo(1 - 0.9999999999999999)).toBe(0);
    expect(roundTo(-2.220446049250313e-16)).toBe(0);
    expect(roundTo(0.0499809)).toBe(0.05);
    expect(roundTo(48.46, 1)).toBe(48.5);
    expect(html).not.toContain("NaN");
    for (const entry of Object.values(datumoj.roloj)) {
      for (const row of [...entry.surfaces, ...entry.text, ...entry.status, ...entry.agoj]) {
        if (row.alEkstremo !== undefined)
          expect(row.alEkstremo, row.token).toBeGreaterThanOrEqual(0);
      }
    }
  });

  // Spec 004 M1, Befund 2: the button "Gegenüberstellung" toggled a class on the last section and
  // nothing changed where the button stands. Now it leads to the section (maintainer: remove it or
  // let it jump); the two-column class is gone with the toggle.
  it("the button leads to the comparison instead of toggling a class (Befund 2)", () => {
    expect(html).toContain(
      '<button type="button" id="fm-vitrino-komparo-switch">Zur Gegenüberstellung</button>',
    );
    expect(html).not.toContain("fm-kolumnoj");
    expect(html).not.toContain("fm-kolumno ");
    expect(html).toContain('<section id="fm-vitrino-komparo" tabindex="-1">');
    expect(html).toMatch(/komparoSection\.scrollIntoView\(/);
    expect(html).toMatch(/komparoSection\.focus\(/);
  });
});
