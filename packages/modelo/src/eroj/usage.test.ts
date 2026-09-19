// Ero Reguloj and the usage evaluation (Spec 003 T006; FR-03, plan D-04, data-model §3). The
// Reguloj come from the repo's data/reguloj.json, so their kialoj are the stored ones; the Skemo
// is a copy of valid/ero-minimal with the butono props, the danger constraint and the intents.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { EroInstance, Regulo } from "../contracts/modelo.js";
import { loadModelo } from "../load/load-modelo.js";
import { fixtureModeloSource } from "../load/source.js";
import { mutatedFixture } from "../validate/test-doubles/fixtures.js";
import { evaluateUsage, USAGE_ENFORCERS } from "./usage.js";

const ERO_REGULOJ = [
  "one-primary-per-container",
  "destructive-not-primary-color",
  "label-required",
];

const repoReguloj = (
  JSON.parse(readFileSync(new URL("../../data/reguloj.json", import.meta.url), "utf8")) as {
    reguloj: Regulo[];
  }
).reguloj;

const root = mutatedFixture("ero-minimal", (edit) => {
  edit("data/eroj/butono/skemo.json", (file: { skemo: Record<string, unknown> }) => {
    file.skemo.props = [
      {
        name: "variant",
        kind: "enum",
        values: ["primary", "secondary", "tertiary"],
        default: "secondary",
      },
      { name: "tone", kind: "enum", values: ["default", "danger"], default: "default" },
      { name: "disabled", kind: "boolean", default: false },
      { name: "label", kind: "string" },
    ];
    file.skemo.constraints = [
      { when: { tone: "danger" }, allowed: { variant: ["primary"] }, kialo: "Filled danger only." },
    ];
    file.skemo.intents = [
      {
        intent: "destructive",
        keywords: { en: ["delete"], de: ["löschen", "entfernen"] },
        props: { variant: "primary", tone: "danger" },
        regulo: "destructive-not-primary-color",
      },
    ];
    return file;
  });
  edit("data/reguloj.json", (file: { reguloj: Regulo[] }) => {
    file.reguloj.push(...repoReguloj.filter((regulo) => ERO_REGULOJ.includes(regulo.name)));
    return file;
  });
});
const { modelo } = loadModelo(fixtureModeloSource(root));
if (modelo === undefined) throw new Error("fixture must load");

const button = (props: EroInstance["props"], extra: Partial<EroInstance> = {}): EroInstance => ({
  ero: "butono",
  props,
  label: "Speichern",
  ...extra,
});

function rulesOf(instances: EroInstance[]) {
  if (modelo === undefined) throw new Error("unreachable");
  return evaluateUsage(modelo, instances).violations.map((violation) => ({
    instance: violation.instance,
    rule: violation.issue.rule,
  }));
}

describe("the four Ero Reguloj in the repo (data-model §3)", () => {
  it.each([...ERO_REGULOJ, "touch-target-min"])("%s exists, automatic, with a kialo", (name) => {
    const regulo = repoReguloj.find((candidate) => candidate.name === name);
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo.length ?? 0).toBeGreaterThan(60);
  });

  it.each(ERO_REGULOJ)("%s applies to butono and has a usage enforcer", (name) => {
    expect(repoReguloj.find((candidate) => candidate.name === name)?.appliesTo).toEqual({
      eroj: ["butono"],
    });
    expect(USAGE_ENFORCERS[name]).toBeDefined();
  });
});

describe("evaluateUsage (T006)", () => {
  it("one-primary-per-container: two primaries in one container give one violation naming both", () => {
    expect(
      rulesOf([
        button({ variant: "primary" }, { container: "dialog" }),
        button({ variant: "tertiary" }, { container: "dialog", label: "Abbrechen" }),
        button({ variant: "primary" }, { container: "dialog", label: "Weiter" }),
      ]),
    ).toEqual([{ instance: [0, 2], rule: "one-primary-per-container" }]);
  });

  it("one-primary-per-container: instances without a container form one container", () => {
    expect(rulesOf([button({ variant: "primary" }), button({ variant: "primary" })])).toEqual([
      { instance: [0, 1], rule: "one-primary-per-container" },
    ]);
  });

  it("one-primary-per-container: two containers pass", () => {
    expect(
      rulesOf([
        button({ variant: "primary" }, { container: "form" }),
        button({ variant: "primary" }, { container: "dialog" }),
      ]),
    ).toEqual([]);
  });

  it("destructive-not-primary-color: primary + default fails, by intent and by label", () => {
    expect(
      rulesOf([
        button({ variant: "primary" }, { intent: "destructive", container: "a" }),
        button({ variant: "primary" }, { label: "Löschen", container: "b" }),
      ]),
    ).toEqual([
      { instance: [0], rule: "destructive-not-primary-color" },
      { instance: [1], rule: "destructive-not-primary-color" },
    ]);
  });

  it("destructive-not-primary-color: primary + danger and secondary + default pass", () => {
    expect(
      rulesOf([
        button({ variant: "primary", tone: "danger" }, { intent: "destructive", container: "a" }),
        button({}, { label: "Löschen", container: "b" }),
      ]),
    ).toEqual([]);
  });

  it("label-required: an icon-only button without a label fails", () => {
    expect(rulesOf([button({}, { label: "" }), { ero: "butono", props: {} }])).toEqual([
      { instance: [0], rule: "label-required" },
      { instance: [1], rule: "label-required" },
    ]);
  });

  it("ero-prop-constraint: danger on a secondary button", () => {
    expect(rulesOf([button({ variant: "secondary", tone: "danger" })])).toEqual([
      { instance: [0], rule: "ero-prop-constraint" },
    ]);
  });

  it("ero-unknown: an Ero the Modelo does not have", () => {
    expect(rulesOf([{ ero: "karto", props: {}, label: "x" }])).toEqual([
      { instance: [0], rule: "ero-unknown" },
    ]);
  });

  it("every Regulo violation cites the stored Regulo and kialo", () => {
    if (modelo === undefined) throw new Error("unreachable");
    const { violations } = evaluateUsage(modelo, [
      button({ variant: "primary" }),
      button({ variant: "primary" }),
    ]);
    const stored = repoReguloj.find((regulo) => regulo.name === "one-primary-per-container");
    expect(violations[0]?.issue.regulo).toEqual({
      id: stored?.id,
      name: stored?.name,
      kialo: stored?.kialo,
    });
  });
});
