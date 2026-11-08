// Spec 038 MG-2 (1.2, 1.5, D-22, D-23, D-29): check_markup – markup text read into the flat element
// list nordstelo's facts carry, one core that derives the Ero instances from such a list (the
// semantics of nordstelo's `instancesOf`, the AC-8 oracle), the Sxablono instances from the region
// markers (MG-5), and the judgement of check_usage: `rezulto` on the Ero instances alone, the page
// rules apart in `sxablonoRezulto`. The expected element lists mirror ekranoj's `elementojDe`
// (twin; modelo cannot import it), the expected instances what `instancesOf` gives today.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Modelo } from "../contracts/modelo.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { valoroNames } from "../resolve/assignment.js";
import { checkUsage } from "./check-usage.js";
import * as gvidanto from "./index.js";

const loaded = loadModelo(defaultModeloSource()).modelo;
if (loaded === undefined) throw new Error("the repository Modelo could not be loaded");
const modelo: Modelo = loaded;

type Elemento = { tag: string; attrs: Record<string, string>; parent: number; text: string };
type Answer = Record<string, unknown>;
type Issue = { rule: string; path: string };
type Result = { ok: true; output: Answer } | { ok: false; issues: Issue[]; allowed?: string[] };

const fn = <T>(name: string): T => (gvidanto as Record<string, unknown>)[name] as T;

/** The reader through the Gvidanto's index (one export line, Spec 038 S038-05). */
const legi = (fragment: string): { elementoj: Elemento[]; lingvo?: string } =>
  fn<(fragment: string) => { elementoj: Elemento[]; lingvo?: string }>("legiMarkon")(fragment);

/** The core through the index. */
const kerno = (elementoj: Elemento[], lingvo?: string): Answer[] =>
  fn<(elementoj: Elemento[], modelo: Modelo, options: { lingvo?: string }) => Answer[]>(
    "instancojElElementoj",
  )(elementoj, modelo, lingvo === undefined ? {} : { lingvo });

/** checkMarkup through the index. */
const check = (input: Answer): Result =>
  fn<(modelo: Modelo, input: Answer) => Result>("checkMarkup")(modelo, input);

const output = (result: Result): Answer => {
  if (!result.ok) throw new Error(`checkMarkup refused: ${JSON.stringify(result.issues)}`);
  return result.output;
};

const el = (tag: string, parent: number, attrs: Record<string, string> = {}, text = "") => ({
  tag,
  attrs,
  parent,
  text,
});

describe("the markup reader (D-23, twin of ekranoj's elementojDe)", () => {
  it("reads nested elements with their attributes, parents and own text", () => {
    expect(
      legi(
        '<fm-karto level="2"><fm-titolo slot="heading" level="2">Kopf</fm-titolo>Inhalt <b>fett</b>\n  Ende</fm-karto>',
      ),
    ).toEqual({
      elementoj: [
        el("fm-karto", -1, { level: "2" }, "Inhalt Ende"),
        el("fm-titolo", 0, { slot: "heading", level: "2" }, "Kopf"),
        el("b", 0, {}, "fett"),
      ],
    });
  });

  it("does not open void and self-closed elements", () => {
    expect(legi('<p>a<br>b<img src="x.png" alt=x>c<fm-ikono name="add"/>d</p>')).toEqual({
      elementoj: [
        el("p", -1, {}, "a b c d"),
        el("br", 0),
        el("img", 0, { src: "x.png", alt: "x" }),
        el("fm-ikono", 0, { name: "add" }),
      ],
    });
  });

  it("keeps script and style content as raw text and decodes only textarea and title", () => {
    expect(
      legi(
        '<div><script>if (a < b) { x = "</div>&amp;"; }</script><style>p > a { color: red }</style><textarea name="t">a &amp; <b></textarea>&lt;ok&gt;</div>',
      ),
    ).toEqual({
      elementoj: [
        el("div", -1, {}, "<ok>"),
        el("script", 0, {}, 'if (a < b) { x = "</div>&amp;"; }'),
        el("style", 0, {}, "p > a { color: red }"),
        el("textarea", 0, { name: "t" }, "a & <b>"),
      ],
    });
  });

  it("decodes entities, lower-cases names, keeps the first of a twice-given attribute", () => {
    expect(
      legi(
        '<FM-Butono Emphasis="high" label="A &amp; B" data-x=\'&#x41;&#66;\' label="zwei" disabled>Tom &quot;&nbsp;&unknown;</FM-Butono>',
      ),
    ).toEqual({
      elementoj: [
        el(
          "fm-butono",
          -1,
          { emphasis: "high", label: "A & B", "data-x": "AB", disabled: "" },
          'Tom " &unknown;',
        ),
      ],
    });
  });

  it("drops the document's frame and comments, and takes the language of <html lang>", () => {
    expect(
      legi(
        '<!DOCTYPE html><html lang="de-CH"><head><title>T &amp; U</title></head><body><!-- <fm-teksto>nein</fm-teksto> --><fm-teksto>Hallo</fm-teksto></body></html>',
      ),
    ).toEqual({
      elementoj: [el("title", -1, {}, "T & U"), el("fm-teksto", -1, {}, "Hallo")],
      lingvo: "de-CH",
    });
    expect(legi("<fm-teksto>Hallo</fm-teksto>")).not.toHaveProperty("lingvo");
  });

  it("closes up to the matching open element and ignores a stray closing tag", () => {
    expect(legi("<div><span>a</div>b</p><i>c</i>")).toEqual({
      elementoj: [el("div", -1), el("span", 0, {}, "a"), el("i", -1, {}, "c")],
    });
  });
});

describe("the core instancojElElementoj (D-22, the semantics of nordstelo's instancesOf)", () => {
  const elementoj = [
    el("div", -1),
    el(
      "fm-kampo",
      0,
      {
        label: "Name",
        required: "",
        disabled: "false",
        readonly: "FALSE",
        kind: "weird",
        unknown: "x",
        max: "10",
        id: "n",
      },
      "Eingabe",
    ),
    el("span", 1, { slot: "help" }, "Hilfe"),
    el("span", 1, { slot: "help" }, "Mehr"),
    el("fm-teksto", 1, { slot: "error" }, "Fehler"),
    el("em", 1, {}, "kursiv"),
    el("span", 1, { slot: "nope" }, "x"),
    el("fm-glitilo", 0, { min: "abc", max: "5.5", step: "1e2", value: "Infinity" }),
    el("fm-unbekannt", 0),
    el("fm-butono", 8, { emphasis: "high", intent: "loud" }, "Speichern"),
    el("fm-ikono", 9, { slot: "icon-start", name: "add" }),
    el("fm-quatsch", 9, { slot: "icon-end" }),
    el("b", 9, {}, "jetzt"),
  ];

  const expected = (lingvo?: string) => {
    const l = lingvo === undefined ? {} : { lingvo };
    return [
      {
        ero: "kampo",
        props: { required: true, disabled: false, readonly: true, max: "10", label: "Name" },
        label: "Eingabe kursiv",
        texts: { help: ["Hilfe", "Mehr"], error: "Fehler" },
        slots: { help: ["text", "text"], error: [{ ero: "teksto" }] },
        ...l,
      },
      { ero: "teksto", props: {}, label: "Fehler", container: "kampo-1", ...l },
      { ero: "glitilo", props: { max: 5.5, step: 100 }, ...l },
      {
        ero: "butono",
        props: { emphasis: "high" },
        label: "Speichern jetzt",
        texts: { "icon-start": "", "icon-end": "" },
        slots: { "icon-start": [{ ero: "ikono" }], "icon-end": ["text"] },
        container: "unbekannt-2",
        ...l,
      },
      { ero: "ikono", props: { name: "add" }, container: "butono-3", ...l },
    ];
  };

  it("types props by the Skemo, fills known slots, texts, label, container and lingvo", () => {
    const instances = kerno(elementoj, "de-DE");
    expect(instances).toEqual(expected("de"));
    // Key order as instancesOf writes it (props in Skemo order): byte-equal JSON.
    expect(JSON.stringify(instances)).toBe(JSON.stringify(expected("de")));
  });

  it("takes the language only as two letters (first two, lower case)", () => {
    const one = [el("fm-teksto", -1, {}, "Hallo")];
    const lingvoOf = (lingvo?: string) => kerno(one, lingvo)[0]?.lingvo;
    expect(["DE", "de-CH", "en", "", "d", "12", " de"].map((lingvo) => lingvoOf(lingvo))).toEqual([
      "de",
      "de",
      "en",
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(kerno(one)[0]).not.toHaveProperty("lingvo");
    expect(kerno(elementoj)).toEqual(expected());
  });

  it("takes a child in the default slot named explicitly as unslotted, as the Ero adopts it (Nachlese 11 B-2, S038-39b)", () => {
    const benannt = [
      el("fm-butono", -1, { emphasis: "medium" }),
      el("span", 0, { slot: "label" }, "Bearbeiten"),
      el("fm-ikono", 0, { slot: "icon-start", name: "edit" }),
    ];
    const ohne = benannt.map((element, index) =>
      index === 1 ? el("span", 0, {}, "Bearbeiten") : element,
    );
    expect(kerno(benannt, "de")).toEqual([
      {
        ero: "butono",
        props: { emphasis: "medium" },
        label: "Bearbeiten",
        texts: { "icon-start": "" },
        slots: { "icon-start": [{ ero: "ikono" }] },
        lingvo: "de",
      },
      { ero: "ikono", props: { name: "edit" }, container: "butono-1", lingvo: "de" },
    ]);
    expect(JSON.stringify(kerno(benannt, "de"))).toBe(JSON.stringify(kerno(ohne, "de")));
  });

  it("derives nothing from elements that are no Ero", () => {
    expect(kerno([el("fm-gibtsnicht", -1, {}, "x"), el("div", -1, {}, "y")], "de")).toEqual([]);
    expect(kerno([], "de")).toEqual([]);
  });
});

describe("checkMarkup (MG-2, D-29)", () => {
  const aspektoj = modelo.dimensioj
    .filter((dimensio) => dimensio.name === ASPEKTO_DIMENSIO)
    .flatMap(valoroNames);

  it("reads a valid fragment and judges its Ero instances (rezulto)", () => {
    const result = output(
      check({ fragment: '<fm-butono emphasis="high">Speichern</fm-butono>', lingvo: "de" }),
    );
    const eroj = [{ ero: "butono", props: { emphasis: "high" }, label: "Speichern", lingvo: "de" }];
    expect(Object.keys(result)).toEqual(["eroj", "sxablonoj", "rezulto"]);
    expect(result.eroj).toEqual(eroj);
    expect(result.sxablonoj).toEqual([]);
    expect(result.rezulto).toEqual(output(checkUsage(modelo, { instances: eroj })));
    expect((result.rezulto as { valid: boolean }).valid).toBe(true);
  });

  it("reports a rule violation in rezulto with its regulo", () => {
    const result = output(
      check({
        fragment:
          '<fm-butono emphasis="high">Speichern</fm-butono><fm-butono emphasis="high">Senden</fm-butono>',
        lingvo: "de",
      }),
    );
    const rezulto = result.rezulto as {
      valid: boolean;
      violations: { instance: number[]; issue: Issue & { regulo?: { name: string } } }[];
    };
    expect(rezulto.valid).toBe(false);
    const primary = rezulto.violations.filter(
      (violation) => violation.issue.rule === "one-primary-per-container",
    );
    expect(
      primary.map((violation) => [violation.issue.path, violation.issue.regulo?.name]),
    ).toEqual([["instances#/0", "one-primary-per-container"]]);
  });

  it('sees the label of a butono written in slot="label" (abnahme-komuna-l5-v1 detail, S038-39b)', () => {
    const result = output(
      check({
        fragment:
          '<fm-karto level="2"><span slot="heading">Standard-Informationen</span>' +
          '<fm-butono slot="actions" emphasis="medium" intent="neutral"><span slot="label">Bearbeiten</span></fm-butono>' +
          '<fm-butono slot="actions" emphasis="high" intent="danger"><span slot="label">Standard löschen</span></fm-butono></fm-karto>',
        lingvo: "de",
      }),
    );
    const butonoj = (result.eroj as Answer[]).filter((ero) => ero.ero === "butono");
    expect(butonoj.map((ero) => ero.label)).toEqual(["Bearbeiten", "Standard löschen"]);
    const rezulto = result.rezulto as { violations: { issue: Issue }[] };
    expect(rezulto.violations.map((violation) => violation.issue.rule)).not.toContain(
      "label-required",
    );
  });

  it("derives no instance from an unknown Ero tag and judges what is left", () => {
    const result = output(
      check({ fragment: "<fm-gibtsnicht>x</fm-gibtsnicht><fm-teksto>Hallo</fm-teksto>" }),
    );
    expect(result.eroj).toEqual([{ ero: "teksto", props: {}, label: "Hallo" }]);
    expect(output(check({ fragment: "<fm-gibtsnicht>x</fm-gibtsnicht><p>Text</p>" }))).toEqual({
      eroj: [],
      sxablonoj: [],
      rezulto: { instances: 0, valid: true, violations: [] },
    });
  });

  it("takes the language of <html lang> before the input's", () => {
    const fragment = '<html lang="en"><body><fm-teksto>Hi</fm-teksto></body></html>';
    expect(output(check({ fragment, lingvo: "de" })).eroj).toEqual([
      { ero: "teksto", props: {}, label: "Hi", lingvo: "en" },
    ]);
    expect(output(check({ fragment: "<fm-teksto>Hallo</fm-teksto>", lingvo: "de" })).eroj).toEqual([
      { ero: "teksto", props: {}, label: "Hallo", lingvo: "de" },
    ]);
  });

  it("sets aspekto and dimensioj on every Ero instance", () => {
    const aspekto = aspektoj[0] ?? "";
    const dimensio = modelo.dimensioj.find((entry) => entry.name !== ASPEKTO_DIMENSIO);
    if (dimensio === undefined) throw new Error("the Modelo has no Dimensio beside aspekto");
    const dimensioj = { [dimensio.name]: valoroNames(dimensio)[0] ?? "" };
    const result = output(
      check({
        fragment: "<fm-teksto>Hallo</fm-teksto><fm-teksto>Welt</fm-teksto>",
        aspekto,
        dimensioj,
      }),
    );
    expect(result.eroj).toEqual([
      { ero: "teksto", props: {}, label: "Hallo", aspekto, dimensioj },
      { ero: "teksto", props: {}, label: "Welt", aspekto, dimensioj },
    ]);
    expect(result.rezulto).toEqual(output(checkUsage(modelo, { instances: result.eroj as never })));
  });

  it("passes a refusal of check_usage through unchanged", () => {
    const fragment = "<fm-teksto>Hallo</fm-teksto>";
    const instance = { ero: "teksto", props: {}, label: "Hallo" };
    for (const [extra, path] of [
      [{ aspekto: "gibtsnicht" }, "check_usage/instances/0/aspekto"],
      [{ dimensioj: { gibtsnicht: "x" } }, "check_usage/instances/0/dimensioj/gibtsnicht"],
    ] as const) {
      const result = check({ fragment, ...extra });
      expect(result).toEqual(checkUsage(modelo, { instances: [{ ...instance, ...extra }] }));
      expect(result.ok).toBe(false);
      if (result.ok) continue;
      expect(result.issues.map((issue) => [issue.rule, issue.path])).toEqual([
        ["mcp-input-invalid", path],
      ]);
    }
  });

  it("refuses an empty fragment with a structured error at check_markup/fragment", () => {
    for (const fragment of ["", "  \n\t "]) {
      const result = check({ fragment });
      expect(result.ok).toBe(false);
      if (result.ok) continue;
      expect(result.issues.map((issue) => [issue.rule, issue.path])).toEqual([
        ["mcp-input-invalid", "check_markup/fragment"],
      ]);
    }
  });

  const SEITE = [
    "<fm-sxelo>",
    '  <fm-ligilo slot="brand" to="/">Beispiel</fm-ligilo>',
    '  <fm-navigado slot="nav" label="Hauptnavigation"><fm-ligilo to="liste.html">Liste</fm-ligilo></fm-navigado>',
    "  <fm-pagxo>",
    '    <fm-titolo slot="title" level="1" focusable>Übersicht</fm-titolo>',
    '    <fm-butono slot="actions" emphasis="high">Speichern</fm-butono>',
    '    <fm-butono slot="actions" emphasis="high">Exportieren</fm-butono>',
    "    <p>Inhalt der Seite</p>",
    "  </fm-pagxo>",
    "</fm-sxelo>",
  ].join("\n");

  it("finds the Sxablonoj of a page by their region markers and judges them apart", () => {
    const result = output(check({ fragment: SEITE, lingvo: "de" }));
    expect(Object.keys(result)).toEqual(["eroj", "sxablonoj", "rezulto", "sxablonoRezulto"]);
    expect(result.sxablonoj).toEqual([
      {
        sxablono: "sxelo",
        props: {},
        regions: {
          brand: [{ ero: "ligilo", props: { to: "/" } }],
          nav: [{ ero: "navigado", props: { label: "Hauptnavigation" } }],
          main: [{ sxablono: "pagxo" }],
        },
      },
      {
        sxablono: "pagxo",
        props: {},
        regions: {
          title: [{ ero: "titolo", props: { level: "1", focusable: true } }],
          actions: [
            { ero: "butono", props: { emphasis: "high" } },
            { ero: "butono", props: { emphasis: "high" } },
          ],
          sections: ["text"],
        },
      },
    ]);
    const sxablonoRezulto = result.sxablonoRezulto as {
      instances: number;
      valid: boolean;
      violations: { sxablono: number[]; issue: Issue }[];
    };
    expect(sxablonoRezulto.instances).toBe(2);
    expect(sxablonoRezulto.valid).toBe(false);
    expect(
      sxablonoRezulto.violations.map((violation) => [
        violation.sxablono,
        violation.issue.rule,
        violation.issue.path,
      ]),
    ).toEqual([[[1], "one-primary-per-container", "sxablonoj#/1/regions/actions"]]);
  });

  it("keeps rezulto the judgement of the Ero instances alone (D-29)", () => {
    const result = output(check({ fragment: SEITE, lingvo: "de" }));
    const eroj = result.eroj as { ero: string; container?: string }[];
    expect(eroj.map((instance) => [instance.ero, instance.container])).toEqual([
      ["ligilo", "sxelo-1"],
      ["navigado", "sxelo-1"],
      ["ligilo", "navigado-2"],
      ["titolo", "pagxo-3"],
      ["butono", "pagxo-3"],
      ["butono", "pagxo-3"],
    ]);
    expect(result.rezulto).toEqual(output(checkUsage(modelo, { instances: eroj as never })));
    const violations = (result.rezulto as { violations: Answer[] }).violations;
    expect(violations.filter((violation) => "sxablono" in violation)).toEqual([]);
  });

  it("reports a missing required region; an unknown slot and stray text go where the browser puts them", () => {
    const result = output(
      check({
        fragment:
          '<fm-sxelo>Freitext<fm-pagxo><fm-teksto slot="gibtsnicht">x</fm-teksto><fm-titolo slot="title" level="1" focusable>Ü</fm-titolo></fm-pagxo></fm-sxelo>',
      }),
    );
    expect(result.sxablonoj).toEqual([
      { sxablono: "sxelo", props: {}, regions: { main: ["text", { sxablono: "pagxo" }] } },
      {
        sxablono: "pagxo",
        props: {},
        regions: { title: [{ ero: "titolo", props: { level: "1", focusable: true } }] },
      },
    ]);
    const violations = (
      result.sxablonoRezulto as { violations: { sxablono: number[]; issue: Issue }[] }
    ).violations;
    expect(
      violations.map((violation) => [
        violation.sxablono,
        violation.issue.rule,
        violation.issue.path,
      ]),
    ).toEqual([[[0], "sxablono-region-required-missing", "sxablonoj#/0/regions/brand"]]);
  });

  it("types the props of a Sxablono by its Skemo", () => {
    const filtrilo = (modelo.sxablonoj ?? []).find((entry) =>
      entry.skemo.props.some((prop) => prop.kind === "string"),
    );
    if (filtrilo === undefined) throw new Error("no Sxablono with a string prop");
    const prop = filtrilo.skemo.props.find((entry) => entry.kind === "string")?.name ?? "";
    const name = filtrilo.sxablono.name;
    const result = output(
      check({ fragment: `<fm-${name} ${prop}="Suche" gibtsnicht="x"></fm-${name}>` }),
    );
    expect(result.sxablonoj).toEqual([{ sxablono: name, props: { [prop]: "Suche" }, regions: {} }]);
  });

  it("answers the same input with the same bytes", () => {
    const inputs = [
      { fragment: SEITE, lingvo: "de" },
      { fragment: "<fm-butono>Speichern</fm-butono>", aspekto: aspektoj[0] },
    ];
    for (const input of inputs) {
      expect(JSON.stringify(check(input))).toBe(JSON.stringify(check(input)));
    }
  });

  it("reads every example of list_arangxoj into known instances without refusal (S038-04-4)", () => {
    const list =
      fn<(modelo: Modelo) => { arangxoj: { name: string; example: string }[] }>("listArangxoj");
    const unread = list(modelo).arangxoj.flatMap((arangxo) => {
      const fmTags = legi(arangxo.example).elementoj.filter((element) =>
        element.tag.startsWith("fm-"),
      ).length;
      const result = check({ fragment: arangxo.example });
      if (!result.ok) return [`${arangxo.name}: refused`];
      const found =
        (result.output.eroj as unknown[]).length + (result.output.sxablonoj as unknown[]).length;
      return found === fmTags ? [] : [`${arangxo.name}: ${found} of ${fmTags}`];
    });
    expect(unread).toEqual([]);
  });

  it("imports nothing from ekranoj, nordstelo or projekcioj", () => {
    const source = readFileSync(new URL("./check-markup.ts", import.meta.url), "utf8");
    const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);
    expect(imports.filter((from) => /ekranoj|nordstelo|projekcioj/.test(from ?? ""))).toEqual([]);
  });
});
