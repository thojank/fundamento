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
import type { Fakto } from "./tipoj.js";

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
