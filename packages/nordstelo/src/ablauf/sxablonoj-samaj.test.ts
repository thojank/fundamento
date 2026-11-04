// D-06 „gleiche Muster für gleiche Zwecke“ on stored facts: purposes by ARIA role (shared by F and
// 0), signatures from the Modelo's Skemo (F) or native tag and classes (0), and the share of
// uniform purposes. The expected prop names and defaults are read from the Modelo, not typed.

import { fileURLToPath } from "node:url";
import type { Fakto } from "@fundamento/ekranoj";
import { defaultModeloSource, loadModelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { planoDe, trovuTaskon } from "./katalogo.js";
import { legiKuron } from "./poentoj.js";
import { CELOJ, celoNomo, sxablonojSamaj } from "./sxablonoj-samaj.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo must load");
const tasko = trovuTaskon("liste-filter-detail");
if (tasko === undefined) throw new Error("the flow liste-filter-detail must exist");
const plano = planoDe(tasko);
const dir = (varianto: string) =>
  fileURLToPath(
    new URL(`../../test/fixtures/ablauf/liste-filter-detail/${varianto}/`, import.meta.url),
  );
const F = legiKuron(dir("F"));
const NUL = legiKuron(dir("0"));
const round = (kuro: typeof F, n: string): Record<string, Fakto> => {
  const faktoj = kuro.rondoj[n];
  if (faktoj === undefined) throw new Error(`no round ${n}`);
  return faktoj;
};

const butono = modelo.eroj.find((entry) => entry.ero.name === "butono");
if (butono === undefined) throw new Error("the Modelo has the Ero butono");
const emphasis = butono.skemo.props.find(
  (prop) => prop.kind === "enum" && prop.name === "emphasis",
);

describe("D-06 patterns of a flow", () => {
  it("finds two main-action signatures in round 1: the purpose is not uniform, kvoto < 1", () => {
    const rezulto = sxablonojSamaj({ plano, faktoj: round(F, "1"), varianto: "F", modelo });
    const ago = rezulto.celoj.cxefago;
    expect(ago?.nombrata).toBe(true);
    expect(ago?.unueca).toBe(false);
    const signatures = Object.keys(ago?.subskriboj ?? {});
    expect(signatures).toHaveLength(2);
    expect(signatures.every((s) => s.startsWith("fm-butono["))).toBe(true);
    expect(signatures.some((s) => s.includes("[emphasis=high]"))).toBe(true);
    expect(signatures.some((s) => s.includes("[emphasis=medium]"))).toBe(true);
    expect(rezulto.kvoto).toBeLessThan(1);
    expect(rezulto.kvoto).toBe(rezulto.unuecaj / rezulto.nombritaj);
    expect(rezulto.perEkrano["standard-detail"]).toEqual(
      expect.objectContaining({ unueca: false, neunuecaj: ["cxefago"] }),
    );
    expect(rezulto.perEkrano["standard-verlauf"]?.unueca).toBe(true);
  });

  it("is uniform once round 3 uses one main action everywhere", () => {
    const rezulto = sxablonojSamaj({ plano, faktoj: round(F, "3"), varianto: "F", modelo });
    const differing = Object.entries(rezulto.celoj)
      .filter(([, celo]) => celo.nombrata && !celo.unueca)
      .map(([key]) => key);
    expect(differing).toEqual([]);
    expect(rezulto.kvoto).toBe(1);
    expect(rezulto.nombritaj).toBeGreaterThan(0);
  });

  it("compares native tags and sorted classes in Variante 0", () => {
    const rezulto = sxablonojSamaj({ plano, faktoj: round(NUL, "1"), varianto: "0", modelo });
    expect(Object.keys(rezulto.celoj.cxefago?.subskriboj ?? {})).toEqual(["button.knopf.primaer"]);
    expect(Object.keys(rezulto.celoj.pagxokapo?.subskriboj ?? {})).toEqual(["h1.kopf"]);
    expect(Object.keys(rezulto.celoj.cxefnavigado?.subskriboj ?? {})).toEqual(["nav.hauptnav"]);
    expect(Object.keys(rezulto.celoj.tabelo?.subskriboj ?? {})).toEqual(["table.tabelle"]);
    const fm = Object.values(rezulto.celoj).flatMap((celo) =>
      Object.keys(celo.subskriboj).filter((s) => s.startsWith("fm-")),
    );
    expect(fm).toEqual([]);
    expect(rezulto.kvoto).toBe(1);
  });

  it("detects the same purposes in F and 0 (by role, not by tag)", () => {
    const f = sxablonojSamaj({ plano, faktoj: round(F, "3"), varianto: "F", modelo });
    const nul = sxablonojSamaj({ plano, faktoj: round(NUL, "1"), varianto: "0", modelo });
    expect(Object.keys(nul.celoj)).toEqual(Object.keys(f.celoj));
    for (const { slug } of plano.ekranoj)
      expect(nul.perEkrano[slug]?.celoj, slug).toEqual(f.perEkrano[slug]?.celoj);
    // Keys in report order: the order of CELOJ.
    const order = Object.keys(f.celoj).map((key) => CELOJ.indexOf(key.split(":")[0] as never));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(celoNomo("kampo:search")).toBe("Formularfeld (search)");
    expect(celoNomo("cxefago")).toBe("Hauptaktion");
  });

  it("gives 1 when no purpose occurs on two screens", () => {
    const one = { ...plano, ekranoj: plano.ekranoj.slice(0, 1), kantoj: [] };
    const rezulto = sxablonojSamaj({ plano: one, faktoj: round(F, "1"), varianto: "F", modelo });
    expect(rezulto.nombritaj).toBe(0);
    expect(rezulto.kvoto).toBe(1);
    expect(Object.values(rezulto.celoj).every((celo) => !celo.nombrata && !celo.unueca)).toBe(true);
  });

  it("reads the shaping props and their defaults from the Skemo", () => {
    expect(emphasis?.default).toBeDefined();
    const page = (attrs: Record<string, string>): Fakto => ({
      lingvo: "de",
      bytes: 1,
      elements: [{ tag: "fm-butono", attrs, parent: -1, text: "Speichern" }],
      aria: [{ role: "button", name: "Speichern" }],
      console: [],
      renders: [],
    });
    const two = { ...plano, ekranoj: plano.ekranoj.slice(0, 2), kantoj: [] };
    const [a, b] = two.ekranoj.map((ekrano) => ekrano.slug);
    if (a === undefined || b === undefined) throw new Error("two screens");
    const same = (x: Record<string, string>, y: Record<string, string>) =>
      sxablonojSamaj({ plano: two, faktoj: { [a]: page(x), [b]: page(y) }, varianto: "F", modelo })
        .celoj.cxefago?.unueca;
    // The default of the Skemo fills a missing prop.
    expect(same({}, { emphasis: String(emphasis?.default) })).toBe(true);
    // A prop the parts are not styled by does not shape the pattern; one they are styled by does.
    expect(same({ type: "submit" }, { type: "button" })).toBe(true);
    const other = emphasis?.values?.find((value) => value !== String(emphasis.default));
    expect(same({}, { emphasis: other ?? "" })).toBe(false);
  });

  it("names the Sxablono when only its shadow root carries the main navigation", () => {
    const shell = (link: string): Fakto => ({
      lingvo: "de",
      bytes: 1,
      elements: [
        { tag: "fm-sxelo", attrs: {}, parent: -1, text: "" },
        { tag: "fm-ligilo", attrs: { slot: "nav", href: link }, parent: 0, text: "Standards" },
      ],
      aria: [{ role: "navigation", name: "Team Nord" }],
      console: [],
      renders: [],
    });
    const two = { ...plano, ekranoj: plano.ekranoj.slice(0, 2), kantoj: [] };
    const [a, b] = two.ekranoj.map((ekrano) => ekrano.slug);
    if (a === undefined || b === undefined) throw new Error("two screens");
    const rezulto = sxablonojSamaj({
      plano: two,
      faktoj: { [a]: shell(`${b}.html`), [b]: shell(`${a}.html`) },
      varianto: "F",
      modelo,
    });
    expect(rezulto.celoj.cxefnavigado?.subskriboj).toEqual({ "fm-sxelo": [a, b] });
    expect(rezulto.celoj.cxefnavigado?.unueca).toBe(true);
  });
});
