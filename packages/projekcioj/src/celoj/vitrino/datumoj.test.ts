// What the Vitrino shows (Spec 004 T008–T010, FR-06): the sections in the document and the data
// island behind them. Every number here is the one the checks compute, not a second calculation.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultModeloSource, evaluateAlirebleco, getEro, loadModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "../../build.js";
import { roundTo, VITRINO_OPTIONS, VITRINO_PROMPT, type VitrinoDatumoj } from "./datumoj.js";
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
    expect(datumoj.a11yRoloj).toEqual({
      // Spec 015 ②: the platform's file input is heard as a button.
      alsxutilo: "button",
      apartigilo: "separator",
      atributlisto: "list",
      // Spec 015 ③: the avatar is an image (told apart from the icon by its initials).
      avataro: "img",
      avizo: "status",
      butono: "button",
      dialogo: "dialog",
      elektilo: "combobox",
      elekto: "radiogroup",
      faldilo: "group",
      ikono: "img",
      insigno: "generic",
      kampo: "textbox",
      // Spec 015 ③: the card is the platform's article.
      karto: "article",
      kompletigilo: "combobox",
      konsileto: "tooltip",
      langetaro: "tablist",
      ligilo: "link",
      markobutono: "checkbox",
      menuo: "menu",
      mezurilo: "meter",
      navigado: "navigation",
      pagxigilo: "navigation",
      plenstato: "status",
      saltligilo: "link",
      spuro: "navigation",
      sxaltilo: "switch",
      sxvebilo: "dialog",
      tabelo: "table",
      tekstareo: "textbox",
      teksto: "paragraph",
      titolo: "heading",
    });
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

// Spec 010 ① (plan D-11): checked is a prop, not a state (E2), and still the first thing to see
// of a switch. A boolean prop that keys the parts gets its column like a boolean state does: the
// grid of the sxaltilo has the columns rest, checked and disabled, one row per size.
describe("the Vitrino shows the sxaltilo checked and unchecked (Spec 010 ①)", () => {
  it("has a column checked between rest and disabled, and a row per size", () => {
    const grid = datumoj.eroj.sxaltilo ?? "";
    expect(grid).toContain(
      '<th scope="col">rest</th><th scope="col">checked</th><th scope="col">disabled</th>',
    );
    for (const size of ["small", "medium", "large"]) {
      expect(grid).toContain(`<fm-sxaltilo size="${size}">${size}</fm-sxaltilo>`);
      expect(grid).toContain(`<fm-sxaltilo size="${size}" checked>${size}</fm-sxaltilo>`);
      expect(grid).toContain(`<fm-sxaltilo size="${size}" disabled>${size}</fm-sxaltilo>`);
    }
  });
});

// Spec 010 ② (plan ② D-13): the checkbox in the Vitrino, from the same grid as the switch and the
// field: a column for checked (it keys the parts), required (it carries an a11y text), invalid and
// disabled (states); the error text only under invalid, from the constraint of the Skemo.
describe("the Vitrino shows the markobutono ticked, required, invalid and disabled (Spec 010 ②)", () => {
  it("has the columns rest, checked, required, invalid, disabled and a row per size", () => {
    const grid = datumoj.eroj.markobutono ?? "";
    expect(grid).toContain(
      '<th scope="col">rest</th><th scope="col">checked</th><th scope="col">required</th><th scope="col">invalid</th><th scope="col">disabled</th>',
    );
    for (const size of ["small", "medium", "large"]) {
      expect(grid).toContain(`<fm-markobutono size="${size}">${size}</fm-markobutono>`);
      expect(grid).toContain(`<fm-markobutono size="${size}" checked>${size}</fm-markobutono>`);
      expect(grid).toContain(
        `<fm-markobutono size="${size}" invalid>${size}<span slot="error">Fehler</span></fm-markobutono>`,
      );
    }
    expect(grid.match(/slot="error"/g)).toHaveLength(3);
  });

  it("says that the label of the checkbox may break", () => {
    expect(html).toContain("Größe aus dem Inhalt, Label darf umbrechen.");
  });
});

// Spec 010 ③ (plan ③ D-13): the radio group in the Vitrino, from the same grid: a column for
// required (it carries an a11y text), invalid and disabled (states); every cell three options, the
// first chosen (value of the Ero = value of the option, E7), the help everywhere and the error
// only under invalid (constraint). The words of the options are the Figma set's (one source).
describe("the Vitrino shows the elekto with three options, required, invalid and disabled (Spec 010 ③)", () => {
  const OPTIONS =
    '<data slot="options" value="1">Eins</data><data slot="options" value="2">Zwei</data><data slot="options" value="3">Drei</data>';

  it("has the columns rest, required, invalid, disabled and a row per size, three options in every cell", () => {
    const grid = datumoj.eroj.elekto ?? "";
    expect(grid).toContain(
      '<th scope="col">rest</th><th scope="col">required</th><th scope="col">invalid</th><th scope="col">disabled</th>',
    );
    for (const size of ["small", "medium", "large"]) {
      expect(grid).toContain(
        `<fm-elekto size="${size}" value="1">${size}${OPTIONS}<span slot="help">Hinweis</span></fm-elekto>`,
      );
      expect(grid).toContain(
        `<fm-elekto size="${size}" value="1" invalid>${size}${OPTIONS}<span slot="help">Hinweis</span><span slot="error">Fehler</span></fm-elekto>`,
      );
    }
    expect(grid.match(/<data slot="options"/g)).toHaveLength(3 * 4 * 3);
    expect(grid.match(/slot="error"/g)).toHaveLength(3);
    expect(VITRINO_OPTIONS).toEqual(["Eins", "Zwei", "Drei"]);
  });

  it("says that no option of the radio group breaks", () => {
    expect(html).toContain("Größe aus dem Inhalt, keine Option bricht um.");
  });
});

// Spec 010 ④ (plan ④ D-13): the select in the Vitrino, from the same grid: a column for required
// (it carries an a11y text), invalid and disabled (states); every cell the closed field with the
// prompt "Bitte wählen" — no option chosen, the Figma set's word — and three options in its list,
// the help everywhere and the error only under invalid (constraint).
describe("the Vitrino shows the elektilo closed with the prompt, required, invalid and disabled (Spec 010 ④)", () => {
  const OPTIONS =
    '<data slot="options" value="1">Eins</data><data slot="options" value="2">Zwei</data><data slot="options" value="3">Drei</data>';

  it("has the columns rest, required, invalid, disabled and a row per size, the prompt and three options in every cell", () => {
    const grid = datumoj.eroj.elektilo ?? "";
    expect(grid).toContain(
      '<th scope="col">rest</th><th scope="col">required</th><th scope="col">invalid</th><th scope="col">disabled</th>',
    );
    for (const size of ["small", "medium", "large"]) {
      expect(grid).toContain(
        `<fm-elektilo size="${size}" placeholder="Bitte wählen">${size}${OPTIONS}<span slot="help">Hinweis</span></fm-elektilo>`,
      );
      expect(grid).toContain(
        `<fm-elektilo size="${size}" placeholder="Bitte wählen" invalid>${size}${OPTIONS}<span slot="help">Hinweis</span><span slot="error">Fehler</span></fm-elektilo>`,
      );
    }
    expect(grid).not.toMatch(/<fm-elektilo[^>]* value=/);
    expect(grid.match(/<data slot="options"/g)).toHaveLength(3 * 4 * 3);
    expect(grid.match(/slot="error"/g)).toHaveLength(3);
    expect(VITRINO_PROMPT).toBe("Bitte wählen");
    // The radio group keeps its first option chosen.
    expect(datumoj.eroj.elekto ?? "").toContain('<fm-elekto size="small" value="1">');
  });

  it("says that the field of the select never breaks and takes its size from the container", () => {
    expect(html).toContain("Größe aus dem Container, Feld bricht nie um.");
  });
});

// Spec 011 ② (plan ② D-15): the grid of the tekstareo has one row per kind × size, the columns
// rest, required, invalid and disabled, help in every cell and the error under invalid, like the
// kampo; the grid of the dialogo shows every size × reason as a closed dialog behind a button that
// opens it (the dialog is modal: six open at once would cover the page), with heading, message,
// the reason's label and two actions, at most one with emphasis high.
describe("the Vitrino shows the tekstareo and the dialogo (Spec 011 ②)", () => {
  it("tekstareo: a row per kind × size, the columns rest, required, invalid, disabled; help everywhere, the error under invalid", () => {
    const grid = datumoj.eroj.tekstareo ?? "";
    expect(grid).toContain('<th scope="col">required</th>');
    expect(grid).toContain('<th scope="col">invalid</th>');
    expect(grid).toContain('<th scope="col">disabled</th>');
    expect(grid).toContain(
      '<fm-tekstareo kind="code" size="medium">code · medium<span slot="help">Hinweis</span></fm-tekstareo>',
    );
    expect(grid).toContain(
      '<fm-tekstareo kind="text" size="small" invalid>text · small<span slot="help">Hinweis</span><span slot="error">Fehler</span></fm-tekstareo>',
    );
    expect((grid.match(/<tr>/g) ?? []).length).toBe(7);
  });

  it("dialogo: a row per size × reason, each cell a button that opens the closed dialog with heading, message, reason label and two actions", () => {
    const grid = datumoj.eroj.dialogo ?? "";
    expect((grid.match(/<fm-dialogo /g) ?? []).length).toBe(6);
    expect(grid).toContain(
      '<fm-butono emphasis="medium" data-fm-opens="fm-vitrino-dialogo-small-none">Öffnen</fm-butono>',
    );
    expect(grid).toContain(
      '<fm-dialogo id="fm-vitrino-dialogo-small-required" size="small" reason="required">small · required',
    );
    expect(grid).toContain('<span slot="message">Nachricht</span>');
    expect(grid).toContain('<span slot="reason">Begründung</span>');
    // Spec 014 ① (plan ① D-02), Abnahme ① F-2: the help of the reason field, one sentence, in every
    // cell that has a reason field (optional, required) and in none without (the Skemo's constraint).
    expect(grid).toContain(
      'reason="required">medium · required<span slot="message">Nachricht</span><span slot="reason">Begründung</span><span slot="reason-help">Nenne den Grund in einem Satz.</span>',
    );
    expect(grid).toContain(
      'reason="none">small · none<span slot="message">Nachricht</span><span slot="reason">Begründung</span><fm-butono',
    );
    expect((grid.match(/<span slot="reason-help">/g) ?? []).length).toBe(4);
    expect(grid).toContain(
      '<fm-butono slot="actions" emphasis="low">Abbrechen</fm-butono><fm-butono slot="actions" emphasis="high">Bestätigen</fm-butono>',
    );
    // No cell opens the dialog on its own: open is no column.
    expect(grid).not.toContain(" open>");
    expect(grid).not.toContain('<th scope="col">open</th>');
  });
});

// Spec 011 ③ (plan ③ D-13): the grid of the insigno has one row per intent × size with the label
// and the hidden description; the grid of the avizo one row per intent, the columns rest and
// dismissible, heading and details slotted with their words; the grid of the plenstato one row
// per kind, no actions (the Skemo forbids them while loading).
describe("the Vitrino shows the insigno, the avizo and the plenstato (Spec 011 ③)", () => {
  it("insigno: a row per intent × size, the label and the hidden description", () => {
    const grid = datumoj.eroj.insigno ?? "";
    expect((grid.match(/<fm-insigno /g) ?? []).length).toBe(10);
    expect(grid).toContain(
      '<fm-insigno intent="success" size="small">success · small<span slot="description">Beschreibung</span></fm-insigno>',
    );
    expect(grid).not.toContain('<th scope="col">disabled</th>');
  });

  it("avizo: a row per intent, the columns rest and dismissible, heading and details with their words", () => {
    const grid = datumoj.eroj.avizo ?? "";
    expect((grid.match(/<tr>/g) ?? []).length).toBe(5);
    expect(grid).toContain('<th scope="col">dismissible</th>');
    expect(grid).toContain(
      '<fm-avizo intent="danger" dismissible>danger<span slot="heading">Überschrift</span><span slot="details">Einzelheit</span></fm-avizo>',
    );
  });

  it("plenstato: a row per kind, the text alone", () => {
    const grid = datumoj.eroj.plenstato ?? "";
    expect(grid).toContain('<fm-plenstato kind="loading">loading</fm-plenstato>');
    expect(grid).toContain('<fm-plenstato kind="empty">empty</fm-plenstato>');
    expect(grid).not.toContain('slot="actions"');
  });
});

// Spec 011 ④ (plan ④ D-13): the grid of the tabelo has one row per density with a table of
// three rows and three columns (one numeric, the first head sortable); the grid of the
// atributlisto one row per layout with three entries, one empty; the grid of the mezurilo one row
// per intent with the value example 66 and its text.
describe("the Vitrino shows the tabelo, the atributlisto and the mezurilo (Spec 011 ④)", () => {
  it("tabelo: a row per density, each a captioned table with a sortable head, a numeric column and three rows", () => {
    const grid = datumoj.eroj.tabelo ?? "";
    expect((grid.match(/<fm-tabelo /g) ?? []).length).toBe(2);
    expect(grid).toContain(
      '<fm-tabelo density="compact">compact<table slot="content"><thead><tr><th scope="col" data-sort="name">Name</th>',
    );
    expect(grid).toContain('<th scope="col" numeric>Anzahl</th>');
    // Three row headers per table, plus the Vitrino's own row header per combination.
    expect((grid.match(/<th scope="row">/g) ?? []).length).toBe(8);
  });

  it("atributlisto: a row per layout (columns, stacked, auto since Spec 014 ①), each a dl with three entries, the last value empty", () => {
    const grid = datumoj.eroj.atributlisto ?? "";
    expect((grid.match(/<fm-atributlisto /g) ?? []).length).toBe(3);
    // Abnahme ① F-1: the prop value is the row's heading, never text of the list itself — a word
    // in the default slot would stand above the dl as content.
    expect(grid).toContain('<fm-atributlisto layout="auto"><dl><dt>Version</dt><dd>3</dd>');
    expect(grid).not.toMatch(/<fm-atributlisto[^>]*>[^<]/);
    expect(grid).toContain('<fm-atributlisto layout="stacked"><dl><dt>Version</dt><dd>3</dd>');
    expect(grid).toContain("<dt>Gültig seit</dt><dd></dd></dl></fm-atributlisto>");
  });

  it("mezurilo: a row per intent, the value example 66 with its text, and one row without a value (Nachlese 3 W4)", () => {
    const grid = datumoj.eroj.mezurilo ?? "";
    // Four intents with the value, and the row "unbekannt": the meter without a value, its text
    // "nicht geprüft" — the picture of F-9.
    expect((grid.match(/<fm-mezurilo[ >]/g) ?? []).length).toBe(5);
    expect(grid).toContain(
      '<tr><th scope="row">unbekannt</th><td><fm-mezurilo>unbekannt<span slot="value-text">nicht geprüft</span></fm-mezurilo></td></tr>',
    );
    expect(grid).toContain(
      '<fm-mezurilo intent="warning" value="66">warning<span slot="value-text">66 % von 3 prüfbaren</span></fm-mezurilo>',
    );
  });
});

// Spec 011 ⑤ (plan ⑤ D-11): the grid of the navigado has one row (no prop keys its parts) with
// three links in the light DOM, the first the current page, named Navigation; the grid of the
// langetaro one row with three tabs, the first selected, the panel with its text, named Reiter.
describe("the Vitrino shows the navigado and the langetaro (Spec 011 ⑤)", () => {
  it("navigado: one row, three links of the Vitrino's words, the first current, named", () => {
    const grid = datumoj.eroj.navigado ?? "";
    expect((grid.match(/<fm-navigado /g) ?? []).length).toBe(1);
    expect(grid).toContain(
      '<fm-navigado label="Navigation" page="1"><a href="#fm-vitrino-navigado" data-page="1">Eins</a><a href="#fm-vitrino-navigado" data-page="2">Zwei</a>',
    );
    expect(grid).toContain('<th scope="row">rest</th>');
  });

  it("langetaro: one row, three tabs, the first selected, the panel with the first word, named", () => {
    const grid = datumoj.eroj.langetaro ?? "";
    expect((grid.match(/<fm-langetaro /g) ?? []).length).toBe(1);
    expect(grid).toContain(
      '<fm-langetaro label="Reiter" selected="1"><data value="1">Eins</data><data value="2">Zwei</data><data value="3">Drei</data><div slot="panel">Eins</div></fm-langetaro>',
    );
  });
});

// Spec 014 ② (G3, G10, plan ② D-09): the Vitrino shows icons — the Ikonaro as a grid per size,
// every name an fm-ikono (the picture switches with the Aspekto), the status icons named in a
// row of their own; the butono carries an icon-start in every cell (the same example Figma
// draws); the apartigilo in both orientations; the saltligilo as a row.
describe("the Vitrino shows the Ikonaro and the Grundbausteine (Spec 014 ②)", () => {
  it("the section ikono is a grid: one row per size with every name, one row per status intent, named", () => {
    const { modelo } = loadModelo(defaultModeloSource());
    if (modelo === undefined) throw new Error("the repository Modelo could not be loaded");
    const section = datumoj.eroj.ikono ?? "";
    for (const { name } of modelo.ikonaro) {
      expect(section, name).toContain(`<fm-ikono name="${name}" size="small"`);
      expect(section, name).toContain(`<fm-ikono name="${name}" size="medium"`);
      expect(section, name).toContain(`<fm-ikono name="${name}" size="large"`);
    }
    for (const intent of ["info", "success", "warning", "danger"]) {
      expect(section, intent).toContain(
        `<fm-ikono name="${intent}" size="medium" intent="${intent}" label="`,
      );
    }
    expect(section).not.toContain('intent="neutral"');
    expect(section).toContain('<th scope="row">small</th>');
    expect(section).toContain('<th scope="row">danger</th>');
    expect(html).toContain('id="fm-vitrino-ikono"');
  });

  it("the butono carries the example icon in its icon-start slot in every cell; the ligilo none", () => {
    const butono = datumoj.eroj.butono ?? "";
    expect(butono).toContain('<fm-ikono slot="icon-start" name="check"></fm-ikono>');
    expect((butono.match(/<fm-butono /g) ?? []).length).toBe(
      (butono.match(/<fm-ikono slot="icon-start"/g) ?? []).length,
    );
    expect(datumoj.eroj.ligilo ?? "").not.toContain("<fm-ikono");
  });

  it("the apartigilo stands in both orientations, the saltligilo in one row pointing at its section", () => {
    const apartigilo = datumoj.eroj.apartigilo ?? "";
    expect(apartigilo).toContain('<fm-apartigilo orientation="horizontal"');
    expect(apartigilo).toContain('<fm-apartigilo orientation="vertical"');
    const saltligilo = datumoj.eroj.saltligilo ?? "";
    // The target is the section itself: its id without the fragment sign (the link spells it).
    expect(saltligilo).toContain('<fm-saltligilo to="fm-vitrino-saltligilo">');
    expect(saltligilo).not.toContain('to="#fm-vitrino-saltligilo"');
  });
});

// Spec 014 ③ (plan ③ D-06): the Vitrino shows the titolo in every size with its level derived,
// and the teksto in every kind × size × emphasis.
describe("the Vitrino shows the titolo and the teksto (Spec 014 ③)", () => {
  it("the titolo has one row per size, each a heading whose level follows the size", () => {
    const section = datumoj.eroj.titolo ?? "";
    expect(section).toContain('<fm-titolo size="display-1" level="1">display-1</fm-titolo>');
    expect(section).toContain('<fm-titolo size="headline-2" level="2">headline-2</fm-titolo>');
    expect(section).toContain('<fm-titolo size="headline-4" level="4">headline-4</fm-titolo>');
    expect((section.match(/<fm-titolo /g) ?? []).length).toBe(7);
  });

  it("the teksto has fifteen rows of kind · size · emphasis", () => {
    const section = datumoj.eroj.teksto ?? "";
    expect((section.match(/<fm-teksto /g) ?? []).length).toBe(15);
    expect(section).toContain(
      '<fm-teksto kind="code" size="1" emphasis="high">code · 1 · high</fm-teksto>',
    );
    expect(section).not.toContain('kind="caption" size="2"');
  });
});

// Spec 014 ④ (plan ④ D-07): the Vitrino shows the konsileto on an icon-only butono (hover or
// focus shows it), the sxvebilo behind its trigger with a heading and a text, and the menuo with
// its own trigger and three entries — one disabled, one danger behind a separator.
describe("the Vitrino shows the overlays (Spec 014 ④)", () => {
  it("the konsileto hangs on an icon-only butono of the Vitrino", () => {
    const section = datumoj.eroj.konsileto ?? "";
    expect(section).toContain(
      '<fm-butono id="fm-vitrino-konsileto-trigger" emphasis="low" label="Suchen"><fm-ikono name="search"></fm-ikono></fm-butono>',
    );
    expect(section).toContain(
      '<fm-konsileto for="fm-vitrino-konsileto-trigger">Suchen</fm-konsileto>',
    );
  });

  it("the sxvebilo opens behind a butono with a heading and a text", () => {
    const section = datumoj.eroj.sxvebilo ?? "";
    expect(section).toContain('<fm-sxvebilo label="Überschrift">');
    expect(section).toContain('<fm-butono slot="trigger" emphasis="medium">Öffnen</fm-butono>');
    expect(section).toContain('<span slot="heading">Überschrift</span>');
    expect(section).toContain("<fm-teksto>Inhalt</fm-teksto>");
  });

  it("the menuo shows its own trigger and three entries, one disabled, one danger behind a separator", () => {
    const section = datumoj.eroj.menuo ?? "";
    expect(section).toContain(
      '<fm-menuo><data value="edit">Bearbeiten</data><data value="duplicate" disabled>Duplizieren</data><fm-apartigilo></fm-apartigilo><data value="delete" intent="danger">Löschen</data></fm-menuo>',
    );
  });
});

// Spec 014 ⑤ (plan ⑤ D-05): the Vitrino shows the faldilo closed and open (open is a column, a
// keyed boolean like checked) with the word of its summary, and the kompletigilo like the
// elektilo — size per row, the booleans as columns, the three options — expanded among them.
describe("the Vitrino shows the faldilo and the kompletigilo (Spec 014 ⑤)", () => {
  it("the faldilo has the column open and the summary word", () => {
    const section = datumoj.eroj.faldilo ?? "";
    expect(section).toContain('<th scope="col">open</th>');
    expect(section).toContain('<span slot="summary">Lieferbedingungen</span>');
    expect(section).toContain("<fm-faldilo open>");
  });

  it("the kompletigilo has the columns of a field and expanded, three options and a prompt", () => {
    const section = datumoj.eroj.kompletigilo ?? "";
    for (const column of ["required", "disabled", "invalid", "expanded"]) {
      expect(section, column).toContain(`<th scope="col">${column}</th>`);
    }
    expect(section).toContain('<data slot="options" value="1">Eins</data>');
    expect(section).toContain('placeholder="Bitte wählen"');
    expect((section.match(/<fm-kompletigilo /g) ?? []).length).toBe(3 * 5);
  });
});

// Spec 015 ① (plan ① D-06): the Vitrino shows the pagxigilo on page 5 of 10 (both ellipses) in one
// row, named by the Modelo's word, and the spuro with three links of the Vitrino's words, the last
// the current page.
describe("the Vitrino shows the pagxigilo and the spuro (Spec 015 ①)", () => {
  it("pagxigilo: one row, page 5 of 10, no children (the Modelo's word names the landmark)", () => {
    const grid = datumoj.eroj.pagxigilo ?? "";
    expect((grid.match(/<fm-pagxigilo /g) ?? []).length).toBe(1);
    expect(grid).toContain('<fm-pagxigilo total-pages="10" page="5"></fm-pagxigilo>');
    expect(grid).not.toContain("unbekannt");
    expect(grid).toContain('<th scope="row">rest</th>');
  });

  it("spuro: one row, two links and the current page as text, the Vitrino's words (the Modelo's word names the landmark)", () => {
    const grid = datumoj.eroj.spuro ?? "";
    expect((grid.match(/<fm-spuro /g) ?? []).length).toBe(1);
    expect(grid).toContain(
      '<fm-spuro page="3"><a href="#fm-vitrino-spuro" data-page="1">Eins</a><a href="#fm-vitrino-spuro" data-page="2">Zwei</a><span data-page="3">Drei</span></fm-spuro>',
    );
  });
});

// Spec 015 ② (plan ② D-07): the Vitrino shows the alsxutilo in one row — at rest, with the
// dropzone, required, disabled and invalid — each with accept and max-size and a help that names
// kinds and size (file-constraints-stated); the error only under invalid.
describe("the Vitrino shows the alsxutilo (Spec 015 ②)", () => {
  it("one row, five columns, accept and max-size, the help names kinds and size", () => {
    const grid = datumoj.eroj.alsxutilo ?? "";
    expect((grid.match(/<fm-alsxutilo /g) ?? []).length).toBe(5);
    expect(grid).toContain(
      '<th scope="col">rest</th><th scope="col">dropzone</th><th scope="col">required</th><th scope="col">disabled</th><th scope="col">invalid</th>',
    );
    expect(grid).toContain(
      '<fm-alsxutilo max-size="5000000" accept=".pdf,.png" dropzone>rest<span slot="help">PDF oder PNG, höchstens 5 MB</span></fm-alsxutilo>',
    );
    expect((grid.match(/<span slot="error">/g) ?? []).length).toBe(1);
  });
});

// Spec 015 ③ (plan ③ D-06): the Vitrino shows the karto vertical with and without its picture
// (an inline SVG: the Vitrino loads nothing from outside) and horizontal across both columns —
// each with the heading, the sentence, a badge and two actions (one with emphasis high).
describe("the Vitrino shows the karto (Spec 015 ③)", () => {
  it("vertical with and without the picture, horizontal across both columns; level 3 under the section", () => {
    const grid = datumoj.eroj.karto ?? "";
    expect((grid.match(/<fm-karto /g) ?? []).length).toBe(3);
    expect(grid).toContain(
      '<th scope="col">orientation</th><th scope="col">mit Bild</th><th scope="col">ohne Bild</th>',
    );
    expect((grid.match(/<svg slot="media" aria-hidden="true"/g) ?? []).length).toBe(2);
    expect(grid).toContain('<td colspan="2"><fm-karto level="3" orientation="horizontal">');
    expect(grid).toContain(
      '<span slot="heading">Barrierefreiheit</span>Kontrast, Fokus und Namen in jeder Marke.<fm-insigno slot="meta">gültig</fm-insigno><fm-butono slot="actions" emphasis="high">Öffnen</fm-butono><fm-butono slot="actions" emphasis="low">Teilen</fm-butono>',
    );
    expect(grid).not.toMatch(/<img/);
    expect(html).toContain("Größe aus dem Container, Inhalt darf umbrechen.");
  });
});

// Spec 015 ③ (plan ③ D-10): the Vitrino shows the avataro in every size with the picture (an SVG
// as a data address: no request), with initials and with a picture that never loads; and one
// decorative beside the name. The icon keeps the Ikonaro grid.
describe("the Vitrino shows the avataro (Spec 015 ③)", () => {
  it("every size with picture, initials, broken picture and decorative; the Ikonaro grid stays the ikono's", () => {
    const grid = datumoj.eroj.avataro ?? "";
    expect((grid.match(/<fm-avataro /g) ?? []).length).toBe(12);
    expect(grid).toContain(
      '<th scope="col">size</th><th scope="col">Bild</th><th scope="col">Initialen</th><th scope="col">kaputtes Bild</th><th scope="col">decorative</th>',
    );
    expect(grid).toContain('<fm-avataro size="large" name="Erika Mustermann" picture="data:,">');
    expect(grid).toContain(
      'name="Erika Mustermann" decorative></fm-avataro><span>Erika Mustermann</span>',
    );
    expect((grid.match(/picture="data:image\/svg\+xml,/g) ?? []).length).toBe(3);
    expect(grid).not.toContain("http://");
    expect(datumoj.eroj.ikono ?? "").toContain("das Ikonaro je Größe");
    expect(html).toContain("Größe aus dem Inhalt, Initialen bricht nie um.");
  });
});
