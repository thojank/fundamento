// Spec 026 ② (Lingvo-Schalter): Studio and Schnellstart have the same switch as the Vitrino —
// Esperanto / Deutsch / English, Esperanto the default —, and the choice stays per browser
// (localStorage, guarded by try/catch: without storage the switch still works for the page). The
// names of the Eroj, Sxablonoj, parts, axes, values, states and Dimensioj stand in spans with the
// key of their name; their German and English names stand in the page's data island.

import type { Agordo } from "@fundamento/agordilo";
import { buildModelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { CLIENT_SCRIPT } from "./html.js";
import { komponentoList, komponentoScreen, komponentoView } from "./komponentoj.js";
import { DEFAULT_KOMBINATION, exampleStudioInput, studioScreen } from "./studio.js";
import { exampleScreenInput, screen } from "./sxtupoj.js";
import { loadBases } from "./vorschau.js";

const bases = loadBases();
const modelo = buildModelo(bases.structure.files).modelo;
const butono = modelo.eroj.find((entry) => entry.ero.name === "butono");
const agordo: Agordo = { name: "provo", leitfarbe: "#6b4fa0", etikedoj: { marko: "Provo GmbH" } };
const komponento = komponentoScreen({
  view: komponentoView({ kind: "ero", name: "butono" }, agordo, bases, DEFAULT_KOMBINATION, {
    emphasis: "high",
    intent: "neutral",
    size: "medium",
    state: "rest",
  }),
  marko: { name: "provo", agordo, saved: false, rev: 1 },
  kombination: DEFAULT_KOMBINATION,
  komponentoj: komponentoList(bases),
  probleme: 0,
  expert: {},
});
const islandOf = (html: string) =>
  JSON.parse(
    (
      /<script type="application\/json" id="fm-nomoj">(.*?)<\/script>/s.exec(html)?.[1] ?? "{}"
    ).replaceAll("<\\/", "</"),
  ) as Record<string, Record<string, string>>;

describe("Studio and Schnellstart: the Lingvo switch (Spec 026 ②)", () => {
  it("every screen has the switch Esperanto / Deutsch / English with Esperanto chosen, and the data island", () => {
    for (const html of [
      studioScreen(exampleStudioInput("farbe")),
      screen(exampleScreenInput("farbe")),
      komponento,
    ]) {
      // M-2: an Ero of the screen, like the switches of the combination — no native control;
      // Nachlese 10 N-1: its name in the span of its words (Sprache, Language, lingvo).
      expect(html).toContain(
        '<fm-elekto name="lingvo" value="eo" orientation="horizontal" size="small" data-fm-lingvo-wahl><span data-fm-teksto="lingvo">lingvo</span><data slot="options" value="eo">Esperanto</data><data slot="options" value="de">Deutsch</data><data slot="options" value="en">English</data></fm-elekto>',
      );
      expect(html).toContain('<script type="application/json" id="fm-nomoj">');
      expect(html).toContain('data-fm-lingvo="eo"');
    }
  });

  it("the component page names the Ero, its parts and its states in spans with their keys; the island has their German and English names", () => {
    expect(komponento).toContain(`<span data-fm-nomo="${butono?.ero.id}/name">butono</span>`);
    expect(komponento).toContain(
      `<span data-fm-nomo="${butono?.skemo.id}/parts/focus-ring">focus-ring</span>`,
    );
    expect(komponento).toContain(
      `<span data-fm-nomo="${butono?.skemo.id}/states/hover">hover</span>`,
    );
    const island = islandOf(komponento);
    expect(island.de?.[`${butono?.ero.id}/name`]).toBe("Schaltfläche");
    expect(island.en?.[`${butono?.ero.id}/name`]).toBe("Button");
    expect(island.de?.[`${butono?.skemo.id}/parts/focus-ring`]).toBe("Fokusring");
    expect(island.en?.[`${butono?.skemo.id}/states/hover`]).toBe("Hover");
  });

  it("the client script keeps the choice per browser, guarded by try/catch", () => {
    expect(CLIENT_SCRIPT).toContain('localStorage.setItem("fundamento-lingvo"');
    expect(CLIENT_SCRIPT).toContain('localStorage.getItem("fundamento-lingvo")');
    expect(CLIENT_SCRIPT).toMatch(/try \{[^}]*localStorage/);
  });
});
