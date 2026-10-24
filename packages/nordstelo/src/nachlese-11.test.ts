// Nachlese 11 ② (Entscheidung O-1 der Spec 030): Markenfähigkeit ist ein Tor. A page that cannot
// switch brand or mode gets nothing for K4 (accessible in every brand and mode) and K5 (no raw
// values, no rebuilt Eroj); a page that follows only part of the combinations gets points only for
// that part. K5 weighs 25 instead of 10, the other weights shrink in proportion. Both weightings
// are reported — the old one of Spec 030 without the gate, the new one with it — so the rule is
// seen to come from the north star, not from the result. The stored results rescore without a run.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  defaultModeloSource,
  loadModelo,
  type NordsteloFile,
  type Tasko,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import type { Render } from "./facts.js";
import { type RunRecord, summarize } from "./report.js";
import { markdownReport } from "./run.js";
import { multmarkeco, scoreBoth } from "./score.js";
import { cleanRenders, facts, h } from "./test-doubles/facts.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo must load");
const katalogo = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../modelo/data/nordstelo.json", import.meta.url)), "utf8"),
) as NordsteloFile;
const login = katalogo.taskoj.find((tasko) => tasko.name === "anmeldung") as Tasko;

const FIELDS = [
  h(
    "fm-formularo",
    {},
    h("fm-kampo", { kind: "email", required: "" }, "E-Mail"),
    h("fm-kampo", { kind: "password", required: "" }, "Passwort"),
    h("fm-butono", { emphasis: "high", type: "submit" }, "Anmelden"),
  ),
];
const ARIA = [
  { role: "textbox", name: "E-Mail erforderlich" },
  { role: "textbox", name: "Passwort erforderlich" },
  { role: "button", name: "Anmelden" },
];
const PLAIN = [
  h(
    "form",
    {},
    h("label", { for: "e" }, "E-Mail"),
    h("input", { id: "e", type: "email" }),
    h("button", { type: "submit" }, "Anmelden"),
  ),
];
const DARK = h("style", {}, "@media (prefers-color-scheme: dark) { body { color: white; } }");
const CONTRAST = h("style", {}, "@media (prefers-contrast: more) { body { color: black; } }");

describe("Nachlese 11 ②: the weights of the catalogue", () => {
  it("K5 weighs 25; the other weights of Spec 030 shrink in proportion (× 75/90)", () => {
    const of = (pezoj: NordsteloFile["pezoj"]) =>
      Object.fromEntries(pezoj.map((pezo) => [pezo.kriterio, pezo.pezo]));
    expect(of(katalogo.pezojAntauxaj?.pezoj ?? [])).toEqual({
      K1: 20,
      K2: 15,
      K3: 15,
      K4: 20,
      K5: 10,
      K6: 20,
    });
    const nova = of(katalogo.pezoj);
    expect(nova.K5).toBe(25);
    for (const kriterio of ["K1", "K2", "K3", "K4", "K6"] as const) {
      const old = of(katalogo.pezojAntauxaj?.pezoj ?? [])[kriterio] ?? 0;
      expect(nova[kriterio], kriterio).toBeCloseTo((old * 75) / 90, 2);
    }
    expect(Object.values(nova).reduce((sum, value) => sum + (value ?? 0), 0)).toBeCloseTo(100, 1);
  });

  it("the gate names K4 and K5 with a kialo from the north star; the old weighting says where it comes from", () => {
    expect(katalogo.multmarkeco?.kriterioj).toEqual(["K4", "K5"]);
    expect(katalogo.multmarkeco?.kialo.de).toMatch(/jede Marke/);
    expect(katalogo.pezojAntauxaj?.nomo).toBe("Spec 030");
    expect(katalogo.pezoj.find((pezo) => pezo.kriterio === "K5")?.kialo.de).toMatch(
      /Nordstern|jede Marke/,
    );
  });
});

describe("Nachlese 11 ②: Markenfähigkeit (the gate)", () => {
  it("a page of Eroj follows every brand and mode: all 16 renders count", () => {
    const gate = multmarkeco(facts(FIELDS, ARIA), modelo);
    expect(gate.follows).toEqual({ aspekto: true, "color-scheme": true, contrast: true });
    expect(gate.share).toBe(1);
  });

  it("a page that pins its brand follows the modes only: the renders of the first brand count", () => {
    const pinned = [h("div", { "data-fm-aspekto": "komuna" }, ...FIELDS)];
    const gate = multmarkeco(facts(pinned, ARIA), modelo);
    expect(gate.follows.aspekto).toBe(false);
    expect(gate.share).toBe(4 / 16);
  });

  it("plain HTML follows no brand; a media query of its own follows the colour scheme or the contrast", () => {
    expect(multmarkeco(facts(PLAIN, ARIA), modelo).share).toBe(0);
    expect(multmarkeco(facts([DARK, ...PLAIN], ARIA), modelo).share).toBe(2 / 16);
    expect(multmarkeco(facts([DARK, CONTRAST, ...PLAIN], ARIA), modelo).share).toBe(4 / 16);
  });

  it("a page without renders (no page) follows nothing", () => {
    expect(multmarkeco(facts(FIELDS, ARIA, { renders: [] }), modelo).share).toBe(0);
  });
});

describe("Nachlese 11 ②: both weightings of one result", () => {
  const both = (body = FIELDS, renders: Render[] = cleanRenders(), variant: "F" | "0" = "F") =>
    scoreBoth({ facts: facts(body, ARIA, { renders }), tasko: login, variant, modelo }, katalogo);

  it("a clean page of Eroj scores 100 in both", () => {
    const { nova, antauxa } = both();
    expect(nova.total).toBe(100);
    expect(antauxa.total).toBe(100);
    expect(nova.multmarkeco).toBe(1);
  });

  it("plain HTML: the old weighting gives K4 and K5 as measured, the new one gives them nothing", () => {
    const { nova, antauxa } = both(PLAIN, cleanRenders(), "0");
    expect(antauxa.k.K4).toBe(1);
    expect(nova.k.K4).toBe(0);
    expect(nova.k.K5).toBe(0);
    expect(antauxa.k.K5).toBeGreaterThan(0);
    expect(nova.total).toBeLessThan(antauxa.total);
  });

  it("a page that follows part of the combinations gets K4 and K5 for that part only", () => {
    const { nova } = both([DARK, ...PLAIN], cleanRenders(), "0");
    expect(nova.k.K4).toBe(2 / 16);
    const lint = both([DARK, ...PLAIN], cleanRenders(), "0").antauxa.k.K5 ?? 0;
    expect(nova.k.K5).toBeCloseTo((lint * 2) / 16, 4);
  });

  it("K4 counts only the renders the page follows and that are clean", () => {
    const renders = cleanRenders().map((render) =>
      render.scheme === "dark" && render.aspekto === "komuna"
        ? { ...render, axe: [{ id: "color-contrast", nodes: 1 }] }
        : render,
    );
    const { nova } = both([DARK, ...PLAIN], renders, "0");
    // Followed: komuna light default and komuna dark default; the dark one has a finding.
    expect(nova.k.K4).toBe(1 / 16);
  });

  it("is deterministic", () => {
    expect(both(PLAIN, cleanRenders(), "0")).toEqual(both(PLAIN, cleanRenders(), "0"));
  });
});

describe("Nachlese 11 ②: the report carries both weightings", () => {
  const record = (task: string, variant: "F" | "0", repeat: number, body = FIELDS): RunRecord => {
    const { nova, antauxa } = scoreBoth(
      { facts: facts(body, ARIA), tasko: login, variant, modelo },
      katalogo,
    );
    return {
      task,
      variant,
      repeat,
      score: nova,
      antauxa,
      effort: { inputTokens: 100, outputTokens: 10, toolCalls: 2, ms: 1000, bytes: 300 },
    };
  };
  const records = [record("anmeldung", "F", 1), record("anmeldung", "0", 1, PLAIN)];

  it("summarize gives the figure F against 0 in the new weighting and in the old one", () => {
    const summary = summarize(records);
    expect(summary.variants.F.median).toBe(100);
    expect(summary.antauxa?.F.median).toBe(100);
    expect(summary.variants["0"].median).toBeLessThan(summary.antauxa?.["0"].median ?? 0);
    expect(summary.kriterioj?.F.K5).toBe(1);
  });

  it("the Markdown report names both weightings and the gate", () => {
    const text = markdownReport(
      {
        id: "x",
        dato: "2026-10-24T00:00:00Z",
        commit: "abc1234",
        anbieter: "openai",
        modell: "gpt-4.1-mini",
        maxTokens: 15_000_000,
      },
      summarize(records),
    );
    expect(text).toContain("Gewichtung Nachlese 11");
    expect(text).toContain("Gewichtung Spec 030");
    expect(text).toContain("Markenfähigkeit");
    expect(text).toContain("Mittel je Kriterium");
  });
});
