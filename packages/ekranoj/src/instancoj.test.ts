// check_usage instances (D-32): from the facts of the fragment and the Skemo read with get_ero.

import { describe, expect, it } from "vitest";
import {
  type EroSkemo,
  instancojElFakto,
  kontroliUzon,
  LIGILAJ_ATRIBUTOJ,
  ligilajAtributojDe,
  malobservojDe,
  skemoDe,
  skemoLegiloDe,
} from "./index.js";
import { MemoraPonto, SKEMOJ } from "./test-doubles/iloj.js";
import type { Fakto, ToolBridge } from "./tipoj.js";

const skemoj = new Map<string, EroSkemo>(
  Object.entries(SKEMOJ).flatMap(([nomo, body]) => {
    const skemo = skemoDe(JSON.stringify(body));
    return skemo === undefined ? [] : [[nomo, skemo] as [string, EroSkemo]];
  }),
);

const FAKTO: Fakto = {
  lingvo: "de-DE",
  bytes: 300,
  elements: [
    { tag: "fm-karto", attrs: { level: "2", tono: "hela" }, parent: -1, text: "" },
    { tag: "h2", attrs: { slot: "heading" }, parent: 0, text: "Standard A-12" },
    { tag: "p", attrs: {}, parent: 0, text: "Team Nord pflegt ihn." },
    { tag: "fm-butono", attrs: { intent: "primary", disabled: "" }, parent: 0, text: "Öffnen" },
    { tag: "fm-butono", attrs: { intent: "rot", disabled: "false" }, parent: -1, text: "Zurück" },
    { tag: "fm-erfunden", attrs: {}, parent: -1, text: "x" },
  ],
  aria: [],
  console: [],
  renders: [],
};

describe("instances from facts (D-32)", () => {
  it("reads the Skemo of a get_ero answer and nothing of an error", () => {
    expect(skemoj.get("butono")).toEqual({
      props: [
        { name: "intent", kind: "enum", values: ["primary", "secondary"] },
        { name: "disabled", kind: "boolean" },
        { name: "href", kind: "string" },
      ],
      slots: [{ name: "label", default: true }, { name: "icon" }],
    });
    expect(skemoDe('{"issues":[]}')).toBeUndefined();
    expect(skemoDe("kein JSON")).toBeUndefined();
  });

  it("types the props by the Skemo, fills slots, label, container and language, skips what is no Ero", () => {
    expect(instancojElFakto(FAKTO, skemoj)).toEqual([
      {
        ero: "karto",
        props: { level: 2 },
        label: "Team Nord pflegt ihn. Öffnen",
        texts: { heading: "Standard A-12" },
        slots: { heading: ["text"] },
        lingvo: "de",
      },
      {
        ero: "butono",
        props: { intent: "primary", disabled: true },
        label: "Öffnen",
        container: "karto-1",
        lingvo: "de",
      },
      { ero: "butono", props: { disabled: false }, label: "Zurück", lingvo: "de" },
    ]);
  });

  it("maps violations to their instances with Regulo and kialo, and a refused input to its issues", () => {
    const instancoj = instancojElFakto(FAKTO, skemoj);
    const respondo = JSON.stringify({
      instances: 3,
      valid: false,
      violations: [
        {
          instance: [1, 2],
          issue: {
            rule: "one-primary",
            severity: "error",
            path: "/1",
            message: "Nur eine Hauptaktion.",
            suggestion: "Eine Aktion secondary machen.",
            regulo: { id: "r-1", name: "unu-cxefa", kialo: "Eine Hauptaktion führt den Blick." },
          },
        },
        {
          instance: [0],
          issue: {
            rule: "hint",
            severity: "info",
            path: "/0",
            message: "Hinweis.",
            suggestion: "Nichts.",
          },
        },
      ],
    });
    expect(malobservojDe(respondo, instancoj)).toEqual([
      {
        rule: "one-primary",
        severity: "error",
        path: "/1",
        message: "Nur eine Hauptaktion.",
        suggestion: "Eine Aktion secondary machen.",
        regulo: { id: "r-1", name: "unu-cxefa", kialo: "Eine Hauptaktion führt den Blick." },
        loko: "fm-butono „Öffnen“, fm-butono „Zurück“",
      },
      {
        rule: "hint",
        severity: "info",
        path: "/0",
        message: "Hinweis.",
        suggestion: "Nichts.",
        loko: "fm-karto „Team Nord pflegt ihn. Öffnen“",
      },
    ]);
    const abgelehnt = JSON.stringify({
      issues: [
        {
          rule: "mcp-input-invalid",
          severity: "error",
          path: "check_usage/instances/0",
          message: "Input ist ungültig.",
          suggestion: "Schema lesen.",
        },
      ],
    });
    expect(malobservojDe(abgelehnt, instancoj)).toMatchObject([
      { rule: "mcp-input-invalid", loko: "check_usage-Eingabe" },
    ]);
    expect(malobservojDe("kaputt", instancoj)).toMatchObject([
      { rule: "check-usage-answer-invalid", severity: "error" },
    ]);
  });

  it("asks get_ero once per name and run, and check_usage only when there is an instance", async () => {
    const ponto = new MemoraPonto();
    const legi = skemoLegiloDe(ponto);
    await kontroliUzon(ponto, FAKTO, legi);
    await kontroliUzon(ponto, FAKTO, legi);
    expect(ponto.vokoj.map((voko) => `${voko.name} ${String(voko.args.name ?? "")}`)).toEqual([
      "get_ero karto",
      "get_ero butono",
      "get_ero erfunden",
      "check_usage ",
      "check_usage ",
    ]);
    const sen = await kontroliUzon(
      ponto,
      { ...FAKTO, elements: [{ tag: "p", attrs: {}, parent: -1, text: "x" }] },
      legi,
    );
    expect(sen).toEqual({ instancoj: [], malobservoj: [] });
    expect(ponto.vokoj.filter((voko) => voko.name === "check_usage")).toHaveLength(2);
  });
});

// S037-07 Befund 1: which Eroj are links and where their target stands comes from the Skemo
// (a11y role `link`, its one required string prop), read over MCP – nothing typed here but the
// invented test Ero.
describe("link props from the Skemo (S037-04)", () => {
  const SALTILO = {
    ero: { id: "ero-saltilo", name: "saltilo", description: "Ein Verweis" },
    skemo: {
      props: [
        { name: "celo", kind: "string", required: true },
        { name: "titolo", kind: "string" },
      ],
      slots: [{ name: "label", default: true }],
      a11y: { role: "link" },
    },
  };

  it("reads the role and the required props of a get_ero answer", () => {
    expect(skemoDe(JSON.stringify(SALTILO))).toEqual({
      props: [
        { name: "celo", kind: "string", required: true },
        { name: "titolo", kind: "string" },
      ],
      slots: [{ name: "label", default: true }],
      rolo: "link",
    });
  });

  it("maps every link Ero of the facts to its target prop, over the documented fallback", async () => {
    const fakto: Fakto = {
      ...FAKTO,
      elements: [
        { tag: "fm-saltilo", attrs: { celo: "detail.html" }, parent: -1, text: "Weiter" },
        { tag: "fm-butono", attrs: {}, parent: -1, text: "Speichern" },
      ],
    };
    const legi = async (nomo: string): Promise<EroSkemo | undefined> =>
      nomo === "saltilo" ? skemoDe(JSON.stringify(SALTILO)) : skemoj.get(nomo);
    expect(await ligilajAtributojDe({ liste: fakto }, legi)).toEqual({
      ...LIGILAJ_ATRIBUTOJ,
      "fm-saltilo": "celo",
    });
    // Without a readable Skemo the documented fallback stays.
    expect(await ligilajAtributojDe({ liste: fakto }, async () => undefined)).toEqual(
      LIGILAJ_ATRIBUTOJ,
    );
  });

  it("does not take an Ero that is no link or has no single required string prop", async () => {
    const fakto: Fakto = {
      ...FAKTO,
      elements: [{ tag: "fm-saltilo", attrs: {}, parent: -1, text: "" }],
    };
    const duaj = {
      ...SALTILO,
      skemo: {
        ...SALTILO.skemo,
        props: [...SALTILO.skemo.props, { name: "alia", kind: "string", required: true }],
      },
    };
    const neLigilo = { ...SALTILO, skemo: { ...SALTILO.skemo, a11y: { role: "button" } } };
    for (const body of [duaj, neLigilo]) {
      expect(
        await ligilajAtributojDe({ liste: fakto }, async () => skemoDe(JSON.stringify(body))),
      ).toEqual(LIGILAJ_ATRIBUTOJ);
    }
  });
});

// Spec 046 F-B1: the fallback adopts the default slot and names the found child as check_markup
// does (L5-1, L5-3); the two paths meet the same AC-8 expectation (nordstelo/src/ac8.test.ts).
describe("the default slot on the fallback (Spec 046 F-B1, L5-1)", () => {
  const faktoDe = (elements: Fakto["elements"]): Fakto => ({ ...FAKTO, elements });

  it("adopts a direct child in the explicitly named default slot, without changing the facts", () => {
    const fakto = faktoDe([
      { tag: "fm-butono", attrs: {}, parent: -1, text: "" },
      { tag: "span", attrs: { slot: "label" }, parent: 0, text: "Speichern" },
    ]);
    const antaue = structuredClone(fakto);
    expect(instancojElFakto(fakto, skemoj)).toEqual([
      { ero: "butono", props: {}, label: "Speichern", lingvo: "de" },
    ]);
    expect(fakto).toEqual(antaue);
  });

  it("does not adopt a child in the default slot of an Ero further up", () => {
    const fakto = faktoDe([
      { tag: "fm-karto", attrs: {}, parent: -1, text: "" },
      { tag: "fm-butono", attrs: {}, parent: 0, text: "" },
      { tag: "span", attrs: { slot: "content" }, parent: 1, text: "Innen" },
    ]);
    expect(instancojElFakto(fakto, skemoj)).toEqual([
      { ero: "karto", props: {}, label: "Innen", lingvo: "de" },
      { ero: "butono", props: {}, container: "karto-1", lingvo: "de" },
    ]);
  });

  it("leaves a child in a slot that is not the default slot as it was", () => {
    const fakto = faktoDe([
      { tag: "fm-butono", attrs: {}, parent: -1, text: "" },
      { tag: "span", attrs: { slot: "icon" }, parent: 0, text: "x" },
    ]);
    expect(instancojElFakto(fakto, skemoj)).toEqual([
      { ero: "butono", props: {}, texts: { icon: "x" }, slots: { icon: ["text"] }, lingvo: "de" },
    ]);
  });
});

describe("the found child in a uzo-slot-accepts suggestion on the fallback (Spec 046 F-B1, L5-3)", () => {
  const DIALOGO = {
    ero: { id: "ero-dialogo", name: "dialogo", description: "Ein Dialog" },
    skemo: { props: [], slots: [{ name: "heading", default: true }, { name: "actions" }] },
    uzo: {
      slots: { heading: { accepts: ["text"] }, actions: { accepts: ["butono"] } },
      boundary: [],
    },
  };
  const AVIZO = {
    ero: { id: "ero-avizo", name: "avizo", description: "Ein Hinweis" },
    skemo: { props: [], slots: [{ name: "content", default: true }, { name: "icon" }] },
    uzo: { slots: { content: { accepts: ["text"] }, icon: { accepts: ["icon"] } }, boundary: [] },
  };
  const trovo = (rule: string, suggestion: string, instance = 0) => ({
    instance: [instance],
    issue: {
      rule,
      severity: "error",
      path: `instances#/${instance}`,
      message: `Befund ${rule}.`,
      suggestion,
    },
  });
  const ponto = (eroj: Record<string, unknown>, violations: unknown[]): ToolBridge => ({
    list: async () => [],
    call: async (name, args) =>
      JSON.stringify(
        name === "get_ero"
          ? (eroj[String(args.name)] ?? { issues: [] })
          : { instances: 1, valid: false, violations },
      ),
  });
  const fakto = (elements: Fakto["elements"]): Fakto => ({ ...FAKTO, elements });
  const ALT = "Put butono in the slot actions.";
  const malobservoj = async (
    eroj: Record<string, unknown>,
    elements: Fakto["elements"],
    violations: unknown[],
  ): Promise<string[]> => {
    const servilo = ponto(eroj, violations);
    const rezulto = await kontroliUzon(servilo, fakto(elements), skemoLegiloDe(servilo));
    return rezulto.malobservoj.map((malobservo) => malobservo.suggestion);
  };

  const DIALOGO_KUN_DIV: Fakto["elements"] = [
    { tag: "fm-dialogo", attrs: {}, parent: -1, text: "" },
    { tag: "span", attrs: { slot: "heading" }, parent: 0, text: "Entfernen?" },
    { tag: "div", attrs: { slot: "actions" }, parent: 0, text: "" },
  ];

  it("reads the slot rules of the Uzo from a get_ero answer", () => {
    expect(skemoDe(JSON.stringify(DIALOGO))?.uzo).toEqual({
      accepts: { heading: ["text"], actions: ["butono"] },
      limigitajSlotoj: [],
    });
    expect(skemoDe(JSON.stringify(SKEMOJ.butono))).not.toHaveProperty("uzo");
  });

  it("names a wrapper element and tells to slot each accepted Ero, leaving other rules as they are", async () => {
    expect(
      await malobservoj({ dialogo: DIALOGO }, DIALOGO_KUN_DIV, [
        trovo("uzo-slot-accepts", ALT),
        trovo("another-rule", "Bleibt."),
      ]),
    ).toEqual([
      'The slot actions holds a <div>, and it accepts fm-butono: set slot="actions" directly on each fm-butono instead of on the wrapping <div>.',
      "Bleibt.",
    ]);
  });

  it("names a wrong Ero, and keeps a kind such as icon as it is", async () => {
    const elements: Fakto["elements"] = [
      { tag: "fm-dialogo", attrs: {}, parent: -1, text: "" },
      { tag: "fm-avizo", attrs: { slot: "actions" }, parent: 0, text: "" },
      { tag: "fm-avizo", attrs: {}, parent: -1, text: "" },
      { tag: "span", attrs: { slot: "icon" }, parent: 2, text: "x" },
    ];
    expect(
      await malobservoj({ dialogo: DIALOGO, avizo: AVIZO }, elements, [
        trovo("uzo-slot-accepts", ALT),
        trovo("uzo-slot-accepts", "Put icon in the slot icon.", 2),
      ]),
    ).toEqual([
      "The slot actions holds a <fm-avizo>, and it accepts fm-butono: put fm-butono in the slot actions instead.",
      "The slot icon holds a <span>, and it accepts icon: put icon in the slot icon instead.",
    ]);
  });

  it("changes nothing where get_ero has no Uzo or the findings do not match the children", async () => {
    const senUzo = { dialogo: { ...DIALOGO, uzo: undefined } };
    expect(await malobservoj(senUzo, DIALOGO_KUN_DIV, [trovo("uzo-slot-accepts", ALT)])).toEqual([
      ALT,
    ]);
    expect(
      await malobservoj({ dialogo: DIALOGO }, DIALOGO_KUN_DIV, [
        trovo("uzo-slot-accepts", ALT),
        trovo("uzo-slot-accepts", ALT),
      ]),
    ).toEqual([ALT, ALT]);
  });

  it("skips a slot a boundary covers, as check_usage does", async () => {
    const eroj = {
      dialogo: {
        ...DIALOGO,
        uzo: { ...DIALOGO.uzo, boundary: [{ case: "x", via: { slot: "actions" } }] },
      },
      avizo: AVIZO,
    };
    const elements: Fakto["elements"] = [
      { tag: "fm-dialogo", attrs: {}, parent: -1, text: "" },
      { tag: "fm-avizo", attrs: { slot: "actions" }, parent: 0, text: "" },
    ];
    expect(await malobservoj(eroj, elements, [trovo("uzo-slot-accepts", ALT)])).toEqual([ALT]);
  });
});
