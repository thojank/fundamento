// AK-09: the Phase-3 dialog of contracts/mcp-tools, over the served Modelo `core +
// aspekto-ekzemplo`. Three questions a designer or an agent asks, each answered by the tools.
// Every expected value is recomputed from the Skemo and `reguloj.json`, never restated here: a
// changed Modelo changes the expectation, and a wrong answer fails.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { RegulojFile, Skemo } from "@fundamento/modelo";
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

const { skemo } = read<{ skemo: Skemo }>("eroj/butono/skemo.json");
const { reguloj } = read<RegulojFile>("reguloj.json");
const reguloNamed = (name: string) => {
  const regulo = reguloj.find((entry) => entry.name === name);
  if (regulo === undefined) throw new Error(`no Regulo ${name}`);
  return regulo;
};
const intentNamed = (name: string) => {
  const intent = (skemo.intents ?? []).find((entry) => entry.intent === name);
  if (intent === undefined) throw new Error(`no intent ${name}`);
  return intent;
};
const valuesOf = (prop: string) => {
  const found = skemo.props.find((entry) => entry.name === prop);
  if (found?.values === undefined) throw new Error(`no prop ${prop}`);
  return [...found.values];
};

// Die Verbindung entsteht im `beforeAll`, nicht auf Modulebene: Modulcode läuft, während Vitest
// alle Dateien einsammelt — die Leitung stünde dann offen, bis dieser Test an der Reihe ist.
let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("AK-09: the Phase-3 dialog with ekzemplo", () => {
  it("'Welchen Button nehme ich für Löschen?': suggest_ero names variant, tone and the Regulo", async () => {
    const destructive = intentNamed("destructive");
    const regulo = reguloNamed(String(destructive.regulo));
    const answer = await output<{
      matched: { intent: string; keyword: string; lingvo: string } | null;
      suggestion: { ero: string; props: Record<string, string> } | null;
      kialo?: string;
      regulo?: { id: string; name: string; kialo: string };
    }>(client, "suggest_ero", { intent: "Löschen" });

    expect(answer.matched?.intent).toBe(destructive.intent);
    expect(answer.matched?.keyword).toBe("löschen");
    expect(answer.suggestion).toEqual({
      ero: "butono",
      props: Object.fromEntries(
        Object.entries(destructive.props).map(([key, value]) => [key, String(value)]),
      ),
    });
    expect(answer.regulo?.id).toBe(regulo.id);
    expect(answer.regulo?.name).toBe(regulo.name);
    expect(answer.kialo).toBe(regulo.kialo);
  });

  it("'Ist dieser Screen konform?': check_usage names both instances and the kialo", async () => {
    const regulo = reguloNamed("one-primary-per-container");
    const instances = [
      { ero: "butono", props: { variant: "primary" }, container: "dialog", label: "Speichern" },
      { ero: "butono", props: { variant: "primary" }, container: "dialog", label: "Weiter" },
    ];
    const answer = await output<{
      instances: number;
      valid: boolean;
      violations: { instance: number[]; issue: { rule: string; regulo?: { kialo: string } } }[];
    }>(client, "check_usage", { instances });

    expect(answer.instances).toBe(instances.length);
    expect(answer.valid).toBe(false);
    expect(answer.violations).toHaveLength(1);
    expect(answer.violations[0]?.instance).toEqual([0, 1]);
    expect(answer.violations[0]?.issue.rule).toBe(regulo.name);
    expect(answer.violations[0]?.issue.regulo?.kialo).toBe(regulo.kialo);

    // The same screen with one primary action is conformant.
    const fixed = await output<{ valid: boolean }>(client, "check_usage", {
      instances: [
        instances[0],
        { ero: "butono", props: { variant: "tertiary" }, container: "dialog", label: "Abbrechen" },
      ],
    });
    expect(fixed.valid).toBe(true);
  });

  it("'Wie heißt die Variante in Figma und in React?': get_ero gives one name and one list", async () => {
    const answer = await output<{
      projekcioj: {
        figma: { componentSet: string; properties: Record<string, string[] | string> };
        react: { component: string; props: Record<string, string[] | string> };
        webComponent: { tag: string; attributes: Record<string, string[] | string> };
      };
    }>(client, "get_ero", { name: "butono" });

    const values = valuesOf("variant");
    expect(answer.projekcioj.figma.componentSet).toBe("butono");
    expect(answer.projekcioj.figma.properties.variant).toEqual(values);
    expect(answer.projekcioj.react.props.variant).toEqual(values);
    expect(answer.projekcioj.webComponent.attributes.variant).toEqual(values);
    expect(answer.projekcioj.react.component).toBe("Butono");
    expect(answer.projekcioj.webComponent.tag).toBe("fm-butono");
  });
});
