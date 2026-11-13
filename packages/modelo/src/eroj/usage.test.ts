// Ero Reguloj and the usage evaluation (Spec 003 T006; FR-03, plan D-04, data-model §3). The
// Reguloj come from the repo's data/reguloj.json, so their kialoj are the stored ones; the Skemo
// is a copy of valid/ero-minimal with the butono props, the danger constraint and the goals.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { EroInstance, Regulo } from "../contracts/modelo.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, fixtureModeloSource } from "../load/source.js";
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
        name: "emphasis",
        kind: "enum",
        values: ["high", "medium", "low"],
        default: "medium",
      },
      { name: "intent", kind: "enum", values: ["neutral", "danger"], default: "neutral" },
      { name: "disabled", kind: "boolean", default: false },
      { name: "label", kind: "string" },
    ];
    file.skemo.constraints = [
      { when: { intent: "danger" }, allowed: { emphasis: ["high"] }, kialo: "Filled danger only." },
    ];
    file.skemo.goals = [
      {
        goal: "destructive",
        keywords: { en: ["delete"], de: ["löschen", "entfernen"] },
        props: { emphasis: "high", intent: "danger" },
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
    // Spec 011 ② (E5): one-primary-per-container is widened to the actions of a dialogo; Spec 015
    // ③ (G4): to the actions of a karto; Spec 053: label-required to the ligilo.
    const widened: Record<string, string[]> = {
      "one-primary-per-container": ["butono", "dialogo", "avizo", "karto"],
      "label-required": ["butono", "ligilo"],
    };
    expect(repoReguloj.find((candidate) => candidate.name === name)?.appliesTo).toEqual({
      eroj: widened[name] ?? ["butono"],
    });
    expect(USAGE_ENFORCERS[name]).toBeDefined();
  });
});

describe("evaluateUsage (T006)", () => {
  it("one-primary-per-container: two primaries in one container give one violation naming both", () => {
    expect(
      rulesOf([
        button({ emphasis: "high" }, { container: "dialog" }),
        button({ emphasis: "low" }, { container: "dialog", label: "Abbrechen" }),
        button({ emphasis: "high" }, { container: "dialog", label: "Weiter" }),
      ]),
    ).toEqual([{ instance: [0, 2], rule: "one-primary-per-container" }]);
  });

  it("one-primary-per-container: instances without a container form one container", () => {
    expect(rulesOf([button({ emphasis: "high" }), button({ emphasis: "high" })])).toEqual([
      { instance: [0, 1], rule: "one-primary-per-container" },
    ]);
  });

  it("one-primary-per-container: two containers pass", () => {
    expect(
      rulesOf([
        button({ emphasis: "high" }, { container: "form" }),
        button({ emphasis: "high" }, { container: "dialog" }),
      ]),
    ).toEqual([]);
  });

  it("destructive-not-primary-color: primary + default fails, by goal and by label", () => {
    expect(
      rulesOf([
        button({ emphasis: "high" }, { goal: "destructive", container: "a" }),
        button({ emphasis: "high" }, { label: "Löschen", container: "b" }),
      ]),
    ).toEqual([
      { instance: [0], rule: "destructive-not-primary-color" },
      { instance: [1], rule: "destructive-not-primary-color" },
    ]);
  });

  it("destructive-not-primary-color: primary + danger and secondary + default pass", () => {
    expect(
      rulesOf([
        button({ emphasis: "high", intent: "danger" }, { goal: "destructive", container: "a" }),
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
    expect(rulesOf([button({ emphasis: "medium", intent: "danger" })])).toEqual([
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
      button({ emphasis: "high" }),
      button({ emphasis: "high" }),
    ]);
    const stored = repoReguloj.find((regulo) => regulo.name === "one-primary-per-container");
    expect(violations[0]?.issue.regulo).toEqual({
      id: stored?.id,
      name: stored?.name,
      kialo: stored?.kialo,
    });
  });
});

// Spec 046 L5-2: one-primary-per-container counts only butono with emphasis=high; karto, dialogo
// and avizo are containers of actions only (their own emphasis is a surface, not a call to
// action). On the repository Modelo, where all four Eroj stand in appliesTo.
describe("one-primary-per-container counts actions only (Spec 046 L5-2)", () => {
  const repo = loadModelo(defaultModeloSource()).modelo;
  if (repo === undefined) throw new Error("the repository Modelo must load");
  const primaries = (instances: EroInstance[]) =>
    evaluateUsage(repo, instances)
      .violations.filter((violation) => violation.issue.rule === "one-primary-per-container")
      .map((violation) => violation.instance);
  const karto = (extra: Partial<EroInstance> = {}): EroInstance => ({
    ero: "karto",
    props: {},
    texts: { heading: "Titel" },
    slots: { heading: ["text"] },
    ...extra,
  });

  it("two karto without emphasis in one container are no violation", () => {
    expect(primaries([karto({ container: "list" }), karto({ container: "list" })])).toEqual([]);
    expect(primaries([karto(), karto()])).toEqual([]);
  });

  it("two karto with emphasis=high in one container are no violation either", () => {
    expect(
      primaries([karto({ props: { emphasis: "high" } }), karto({ props: { emphasis: "high" } })]),
    ).toEqual([]);
  });

  it("two butono with emphasis=high in one container still are", () => {
    const high: EroInstance = { ero: "butono", props: { emphasis: "high" }, label: "Weiter" };
    expect(
      primaries([
        { ...high, container: "karto-1" },
        { ...high, label: "Senden", container: "karto-1" },
      ]),
    ).toEqual([[0, 1]]);
    expect(primaries([karto(), high, karto(), { ...high, label: "Senden" }])).toEqual([[1, 3]]);
  });

  it("dialogo and avizo are containers only", () => {
    expect(
      primaries([
        { ero: "dialogo", props: { open: true }, texts: { heading: "Frage" } },
        { ero: "dialogo", props: { open: true }, texts: { heading: "Frage" } },
        { ero: "avizo", props: {}, texts: { message: "Hinweis" } },
        { ero: "avizo", props: {}, texts: { message: "Hinweis" } },
      ]),
    ).toEqual([]);
  });
});
