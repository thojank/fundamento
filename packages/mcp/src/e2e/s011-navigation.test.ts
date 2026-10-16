// Spec 011 ⑤ (Gvidanto, Abnahme): the navigation dialogs of the spec against the real MCP server
// (in-memory transport, every answer validated against the tool's output schema), over the served
// Modelo `core + aspekto-ekzemplo`. Every expected text is read from the data, never restated here.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { UzoFile } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type Connected,
  closeClients,
  connect,
  EKZEMPLO_CONFIG,
  output,
  preload,
} from "../test-doubles/client.js";

afterAll(closeClients);
preload({ config: EKZEMPLO_CONFIG });

const DATA = new URL("../../../modelo/data/", import.meta.url);
const read = <T>(path: string): T =>
  JSON.parse(readFileSync(fileURLToPath(new URL(path, DATA)), "utf8")) as T;
const navigado = read<UzoFile>("eroj/navigado/uzo.json").uzo;
const langetaro = read<UzoFile>("eroj/langetaro/uzo.json").uzo;
const switchView = navigado.instead.find((entry) => entry.goal === "switch-view");
const formChoice = langetaro.instead.find((entry) => entry.goal === "form-choice");
const pages = langetaro.instead.find((entry) => entry.goal === "pages");
if (switchView === undefined || formChoice === undefined || pages === undefined) {
  throw new Error("cross-links missing");
}
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Suggested = {
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: Record<string, string> } | null;
  boundary?: { ero: string; case: string; action: string; kialo: string };
  action?: string;
  candidates?: { kind: string; ero: string; case?: string; goal?: string; kialo?: string }[];
  kialo?: string;
};
type Judged = {
  valid: boolean;
  violations: { issue: { rule: string; severity: string; regulo?: { kialo: string } } }[];
};
type Brief = {
  ero: string;
  axes: { name: string; values: string[] }[];
  required: { props: string[]; slots: string[] };
};
type Listed = { eroj: { name: string }[] };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the navigation dialogs of the spec: 'Reiter oder Navigation?'", () => {
  it("'Hauptnavigation mit aktueller Seite' → a navigado, citing link-label-names-destination", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Hauptnavigation mit aktueller Seite",
    });
    expect(answer.suggestion).toEqual({ ero: "navigado", props: {} });
    expect(answer.kialo).toBe(kialoOf("link-label-names-destination"));
  });

  it("'Reiter für Inhalt, Versionen und Regeln' → a langetaro, citing option-labels-distinct", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Reiter für Inhalt, Versionen und Regeln",
    });
    expect(answer.suggestion).toEqual({ ero: "langetaro", props: {} });
    expect(answer.kialo).toBe(kialoOf("option-labels-distinct"));
  });

  it("'Tabs, um zwischen Liste und Formular zu wechseln' (the spec's dialog): a person decides — the tabs' form-choice stands beside the other reading", async () => {
    // The spec answers conditionally (langetaro only when both views belong to the same thing,
    // else navigado): Fundamento picks no reading; the tabs' own alternative form-choice names
    // why a choice in a form is no switch of views (OP-12).
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Tabs, um zwischen Liste und Formular zu wechseln",
    });
    expect(answer.action).toBe("ask-human");
    expect(answer.candidates).toContainEqual(
      expect.objectContaining({ ero: "langetaro", case: "form-choice", kialo: formChoice.kialo }),
    );
  });

  it("'Reiter für die Hauptseiten' → the navigado, with the tabs' reason (pages are the navigado's)", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Reiter für die Hauptseiten der Anwendung",
    });
    expect(answer.suggestion).toEqual({ ero: "navigado", props: {} });
    expect(answer.boundary).toMatchObject({ ero: "langetaro", case: "pages", kialo: pages.kialo });
    expect(pages.ero).toBe("navigado");
    expect(switchView.ero).toBe("langetaro");
  });

  it("'ein Hamburger-Menü für schmale Bildschirme' stops: not supported, with the navigado's reason", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "ein Hamburger-Menü für schmale Bildschirme",
    });
    expect(answer.suggestion).toBeNull();
    expect(answer.boundary).toMatchObject({
      ero: "navigado",
      case: "collapsed-mobile",
      action: "not-supported",
    });
  });
});

describe("check_usage of the navigation and the tabs", () => {
  it("an item 'hier' violates link-label-names-destination (widened); 'Standards' passes", async () => {
    const wrong = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "navigado", props: { label: "Hauptnavigation" }, texts: { items: "hier" } }],
    });
    expect(wrong.violations.map((entry) => entry.issue.rule)).toEqual([
      "link-label-names-destination",
    ]);
    expect(wrong.violations[0]?.issue.regulo?.kialo).toBe(kialoOf("link-label-names-destination"));
    const right = await output<Judged>(client, "check_usage", {
      instances: [
        { ero: "navigado", props: { label: "Hauptnavigation" }, texts: { items: "Standards" } },
      ],
    });
    expect(right.valid).toBe(true);
  });

  it("two tabs 'Inhalt' violate option-labels-distinct (widened); distinct tabs pass", async () => {
    const wrong = await output<Judged>(client, "check_usage", {
      instances: [
        { ero: "langetaro", props: { label: "Standard" }, texts: { tabs: ["Inhalt", "Inhalt"] } },
      ],
    });
    expect(wrong.violations.map((entry) => entry.issue.rule)).toEqual(["option-labels-distinct"]);
    const right = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "langetaro",
          props: { label: "Standard" },
          texts: { tabs: ["Inhalt", "Versionen", "Regeln"] },
        },
      ],
    });
    expect(right.valid).toBe(true);
  });
});

describe("list_eroj and the briefs", () => {
  it("lists seventeen Eroj; the briefs of navigado and langetaro name their axes and duties", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj.map((entry) => entry.name)).toEqual([
      "atributlisto",
      "avizo",
      "butono",
      "dialogo",
      "elektilo",
      "elekto",
      "insigno",
      "kampo",
      "langetaro",
      "ligilo",
      "markobutono",
      "mezurilo",
      "navigado",
      "plenstato",
      "sxaltilo",
      "tabelo",
      "tekstareo",
    ]);
    const navigation = await output<Brief>(client, "get_ero", { name: "navigado", brief: true });
    expect(navigation.axes.map((axis) => axis.name)).toEqual(["orientation", "current"]);
    expect(navigation.required).toEqual({ props: ["label"], slots: ["items"] });
    const tabs = await output<Brief>(client, "get_ero", { name: "langetaro", brief: true });
    expect(tabs.axes.map((axis) => axis.name)).toEqual(["active"]);
    expect(tabs.required).toEqual({ props: ["label"], slots: ["tabs", "panel"] });
    for (const brief of [navigation, tabs]) {
      expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
    }
  });
});
