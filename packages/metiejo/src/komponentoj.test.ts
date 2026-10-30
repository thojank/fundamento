// The component pages of the Studio (Spec 024 Runde 2, § 4 Komponenten): one page per Ero and per
// Sxablono, generated from the Skemo, never by hand (M-4). The anatomy with its parts, the matrix
// variants × states (a click chooses the cell), the properties of the chosen cell — per part its
// Ero-Token as an alias to choose or a value of its own, the measures, the typography, the
// behaviour the Skemo knows —, the usage beside it in German (Uzo, Kialo, Do and Don't, keyboard,
// writing rules) and Zurücksetzen, which restores the alias on the role.

import type { Agordo } from "@fundamento/agordilo";
import { fixtureModeloSource, loadModelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import {
  komponentoList,
  komponentoPreview,
  komponentoScreen,
  komponentoView,
  komponentoViewOf,
  zeloOf,
} from "./komponentoj.js";
import { DEFAULT_KOMBINATION } from "./studio.js";
import { loadBases } from "./vorschau.js";
import { previewBody } from "./vorschau-korpo.js";

const bases = loadBases();
const agordo: Agordo = { name: "provo", leitfarbe: "#6b4fa0", etikedoj: { marko: "Provo GmbH" } };
const BUTONO = { kind: "ero", name: "butono" } as const;
const FILL = "ero.butono.surface.fill.emphasis.high.intent.neutral.rest";

describe("komponentoList (M-4: a page per Ero and per Sxablono, from the Skemo)", () => {
  it("lists every Ero of the structure, then every Sxablono, each with a title", () => {
    const list = komponentoList(bases);
    expect(list.filter((entry) => entry.kind === "ero")).toHaveLength(40);
    expect(list.filter((entry) => entry.kind === "sxablono")).toHaveLength(5);
    expect(list[0]).toMatchObject({ kind: "ero", name: "alsxutilo" });
    expect(list.at(-1)).toMatchObject({ kind: "sxablono", name: "sxelo" });
    for (const entry of list) expect(entry.title.length).toBeGreaterThan(0);
  });
});

describe("komponentoView of the butono", () => {
  // The cell of the high emphasis at rest, medium size: the one the Spec names as its example.
  const view = komponentoView(BUTONO, agordo, bases, DEFAULT_KOMBINATION, {
    emphasis: "high",
    intent: "neutral",
    size: "medium",
    state: "rest",
  });

  it("names the anatomy: every part of the Skemo with a German label and its properties", () => {
    const labels = Object.fromEntries(view.anatomio.map((part) => [part.part, part.label]));
    expect(labels).toMatchObject({
      surface: "Fläche",
      label: "Beschriftung",
      border: "Rahmen",
      icon: "Icon",
      "focus-ring": "Fokusring",
    });
    expect(view.anatomio.find((part) => part.part === "surface")?.properties).toEqual(["fill"]);
    expect(view.anatomio.find((part) => part.part === "box")?.properties).toContain("radius");
  });

  it("spans the matrix variants × states from the axes of the Skemo, minus what a constraint forbids", () => {
    expect(view.matrico.axes).toEqual(["emphasis", "intent", "size"]);
    expect(view.matrico.variants).toHaveLength(12);
    expect(view.matrico.variants).toContainEqual({
      emphasis: "high",
      intent: "danger",
      size: "small",
    });
    expect(
      view.matrico.variants.some((v) => v.emphasis === "medium" && v.intent === "danger"),
    ).toBe(false);
    expect(view.matrico.states).toEqual([
      "rest",
      "hover",
      "pressed",
      "focus",
      "disabled",
      "loading",
    ]);
    expect(view.zelo).toEqual({
      emphasis: "high",
      intent: "neutral",
      size: "medium",
      state: "rest",
    });
  });

  it("lists per part the Ero-Tokens of the chosen cell: the alias, its candidates among the roles, the origin", () => {
    const surface = view.groups.find((group) => group.key === "surface");
    const fill = surface?.rows.find((row) => row.token === FILL);
    expect(fill).toMatchObject({
      alias: "color.action.primary.rest",
      art: "alias",
      herkunft: "struktur",
      type: "color",
    });
    expect(fill?.shown).toMatch(/^#[0-9a-f]{6}$/);
    expect(fill?.candidates).toContain("color.action.secondary.rest");
    expect(fill?.candidates).toContain("color.palette.accent.900");
    expect(fill?.candidates?.some((candidate) => candidate.startsWith("ero."))).toBe(false);
    const border = view.groups.find((group) => group.key === "border");
    expect(border?.rows.map((row) => row.token)).toContain("ero.butono.border.width");
    const label = view.groups.find((group) => group.key === "label");
    const typography = label?.rows.find(
      (row) => row.token === "ero.butono.label.typography.size.medium",
    );
    expect(typography?.alias).toBe("typography.label.1");
    expect(typography?.candidates).toContain("typography.label.2");
    expect(typography?.candidates?.every((candidate) => candidate.startsWith("typography."))).toBe(
      true,
    );
  });

  it("follows the chosen cell: another variant and state name other tokens", () => {
    const hover = komponentoView(BUTONO, agordo, bases, DEFAULT_KOMBINATION, {
      emphasis: "medium",
      intent: "neutral",
      state: "hover",
    });
    const fill = hover.groups
      .flatMap((group) => group.rows)
      .find((row) => row.token === "ero.butono.surface.fill.emphasis.medium.intent.neutral.hover");
    expect(fill?.alias).toBe("color.action.secondary.hover");
    expect(
      zeloOf(new URLSearchParams("zelo=emphasis%3Dmedium%2Cintent%3Dneutral%2Cstate%3Dhover")),
    ).toEqual({
      emphasis: "medium",
      intent: "neutral",
      state: "hover",
    });
  });

  it("names the behaviour the Skemo knows as axes and props, and a position as a term", () => {
    expect(view.verhalten.map((entry) => entry.name)).toEqual(
      expect.arrayContaining([
        "emphasis",
        "intent",
        "size",
        "type",
        "disabled",
        "loading",
        "full-width",
      ]),
    );
    const sxaltilo = komponentoView(
      { kind: "ero", name: "sxaltilo" },
      agordo,
      bases,
      DEFAULT_KOMBINATION,
    );
    expect(
      // The knob's position, a term of its part (message-position, Spec 029 ②b-1b M-2, is a prop).
      sxaltilo.verhalten.find((entry) => entry.name.endsWith(".position"))?.values,
    ).toEqual(["start", "end"]);
  });

  it("shows the usage in German: purpose, instead with reasons, keyboard, writing rules, do and don't", () => {
    expect(view.gebrauch.zweck).toMatch(/Aktion/);
    expect(view.gebrauch.stattdessen.length).toBeGreaterThan(0);
    expect(view.gebrauch.stattdessen[0]?.kialo).not.toMatch(/\b(because|the)\b/);
    expect(view.gebrauch.tastatur).toEqual(["Enter", "Space"]);
    expect(view.gebrauch.schreibregeln.length).toBeGreaterThan(0);
    expect(view.gebrauch.schreibregeln.join(" ")).not.toMatch(/\b(the|because)\b/);
    expect(view.gebrauch.dos.length + view.gebrauch.donts.length).toBeGreaterThan(0);
  });

  it("a set Ero-Token shows gesetzt with its alias; Zurücksetzen restores the role", () => {
    const set = komponentoView(
      BUTONO,
      { ...agordo, festgelegt: { [FILL]: { alias: "color.palette.accent.900" } } },
      bases,
      DEFAULT_KOMBINATION,
      { emphasis: "high", intent: "neutral", size: "medium", state: "rest" },
    );
    const fill = set.groups.flatMap((group) => group.rows).find((row) => row.token === FILL);
    expect(fill?.herkunft).toBe("gesetzt");
    expect(fill?.alias).toBe("color.palette.accent.900");
    const html = komponentoScreen({
      view: set,
      marko: { name: "provo", agordo: set.agordo, saved: false, rev: 1 },
      kombination: DEFAULT_KOMBINATION,
      komponentoj: komponentoList(bases),
      probleme: 0,
      expert: {},
    });
    expect(html).toContain(`data-mt-zuruecksetzen="${FILL}"`);
  });
});

describe("komponentoView of a Sxablono", () => {
  it("has one cell and the fixed tokens of its parts", () => {
    const view = komponentoView(
      { kind: "sxablono", name: "pagxo" },
      agordo,
      bases,
      DEFAULT_KOMBINATION,
    );
    expect(view.matrico.variants).toEqual([{}]);
    expect(view.matrico.states).toEqual(["rest"]);
    const gap = view.groups
      .flatMap((group) => group.rows)
      .find((row) => row.token === "sxablono.pagxo.frame.gap");
    expect(gap?.alias).toBe("spacing.xlarge");
    expect(gap?.candidates).toContain("spacing.large");
    expect(view.gebrauch.zweck?.length).toBeGreaterThan(0);
  });
});

describe("M-4: a page for a new Ero without code", () => {
  it("builds the view from a test Skemo of a Modelo of its own", () => {
    const { modelo } = loadModelo(
      fixtureModeloSource(
        new URL("../../modelo/test/fixtures/valid/ero-minimal/", import.meta.url).pathname,
      ),
    );
    if (modelo === undefined) throw new Error("fixture");
    const view = komponentoViewOf(
      {
        modelo,
        name: "komuna",
        agordo: { name: "komuna", leitfarbe: "#000000" },
        derived: new Set(),
      },
      BUTONO,
      DEFAULT_KOMBINATION,
    );
    expect(view.anatomio.map((part) => part.part)).toEqual(["surface", "label", "box"]);
    expect(view.matrico.variants).toEqual([{ emphasis: "high" }]);
    expect(view.groups.flatMap((group) => group.rows).map((row) => row.token)).toEqual(
      expect.arrayContaining([
        "ero.butono.surface.fill.emphasis.high.rest",
        "ero.butono.label.color",
        "ero.butono.box.gap",
      ]),
    );
  });
});

describe("the screen and the preview of a component page", () => {
  const view = komponentoView(BUTONO, agordo, bases, DEFAULT_KOMBINATION, {
    emphasis: "high",
    intent: "neutral",
    size: "medium",
    state: "rest",
  });
  const html = komponentoScreen({
    view,
    marko: { name: "provo", agordo, saved: false, rev: 1 },
    kombination: DEFAULT_KOMBINATION,
    komponentoj: komponentoList(bases),
    probleme: 0,
    expert: {},
  });

  it("renders the matrix with a link per cell, the chosen cell marked, the anatomy and the controls", () => {
    expect(html).toContain('class="mt-matrico"');
    expect(html).toContain(
      "zelo=emphasis%3Dhigh%2Cintent%3Dneutral%2Csize%3Dmedium%2Cstate%3Dhover",
    );
    expect(html).toContain('aria-current="true"');
    expect(html).toContain("Fokusring");
    expect(html).toContain(`data-mt-festlegen="${FILL}"`);
    expect(html).toContain("Tastatur");
    expect(html).toContain("Komponenten");
    expect(html).toContain('href="/studio/provo/ero/alsxutilo"');
    expect(html).toContain('href="/studio/provo/sxablono/sxelo"');
    expect(html).toContain("sxtupo=komponento-ero-butono");
  });

  it("the preview shows the Ero in every variant and a swatch of every cell from its Ero-Tokens", () => {
    const preview = komponentoPreview(view);
    expect(preview).toContain('<fm-butono emphasis="high" intent="neutral"');
    expect(preview).toContain('<fm-butono emphasis="low" intent="neutral"');
    expect(preview).toContain(
      "var(--fm-ero-butono-surface-fill-emphasis-high-intent-neutral-hover)",
    );
    expect(previewBody("komponento-ero-butono", "mittel", agordo)).toContain("<fm-butono");
  });

  it("O-2: the preview of the Grundlagen shows the five Sxablonoj beside the page's own content", () => {
    const farbe = previewBody("studio-farbe", "mittel", agordo);
    for (const sxablono of ["fm-sxelo", "fm-pagxo", "fm-formularo", "fm-filtrilo", "fm-redaktilo"])
      expect(farbe, sxablono).toContain(`<${sxablono}`);
  });
});
