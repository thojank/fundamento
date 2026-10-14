// Spec 010 ②, acceptance 1, 2 and 7 (G7): the checkbox against the real MCP server (in-memory
// transport, every answer validated against the tool's output schema), over the served Modelo
// `core + aspekto-ekzemplo`. The scenarios of section 2 are tests: "AGB akzeptieren" is a
// markobutono that must be ticked; the dark mode is a switch, not a checkbox, even when the
// question says checkbox; what applies at once is the switch's (instead immediate); a checkbox
// without its label is no checkbox. Every expected text is read from the data.

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
const markobutono = read<UzoFile>("eroj/markobutono/uzo.json").uzo;
const sxaltilo = read<UzoFile>("eroj/sxaltilo/uzo.json").uzo;
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Suggested = {
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: Record<string, unknown> } | null;
  kialo?: string;
  regulo?: { name: string };
  boundary?: { ero: string; case: string; action: string; kialo: string };
  action?: string;
};
type Judged = {
  valid: boolean;
  violations: { issue: { rule: string; severity: string; suggestion: string } }[];
};
type Brief = {
  ero: string;
  purpose?: string;
  axes: { name: string; values: string[]; default?: string }[];
  required: { props: string[]; slots: string[] };
  instead?: { goal: string; ero: string | null; kialo: string }[];
  boundary?: { case: string; action: string; kialo: string }[];
};

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the scenarios of section 2: terms, newsletter, dark mode", () => {
  it("'AGB akzeptieren' is a markobutono that must be ticked, with the kialo of required-marked", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "AGB akzeptieren" });
    expect(answer.suggestion).toEqual({ ero: "markobutono", props: { required: true } });
    expect(answer.matched?.goal).toBe("agree");
    expect(answer.regulo?.name).toBe("required-marked");
    expect(answer.kialo).toBe(kialoOf("required-marked"));
    expect(answer.action).toBeUndefined();
  });

  it("'Newsletter abonnieren' is the opt-in of the markobutono, nothing required", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Newsletter abonnieren",
    });
    expect(answer.suggestion).toEqual({ ero: "markobutono", props: {} });
    expect(answer.matched?.goal).toBe("opt-in");
  });

  it("'Eine Checkbox, die den Dark Mode sofort einschaltet' is a sxaltilo, not a markobutono", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Eine Checkbox, die den Dark Mode sofort einschaltet",
    });
    expect(answer.suggestion).toEqual({ ero: "sxaltilo", props: {} });
    expect(answer.suggestion?.ero).not.toBe("markobutono");
    expect(answer.matched?.goal).toBe("toggle");
    expect(answer.regulo?.name).toBe("switch-label-names-the-setting");
  });

  it("instead immediate: a setting that applies at once goes to the sxaltilo, with the markobutono's kialo", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Eine Einstellung, die sofort gilt",
    });
    expect(answer.suggestion).toEqual({ ero: "sxaltilo", props: {} });
    expect(answer.boundary).toEqual({
      ero: "markobutono",
      case: "immediate",
      action: "use-instead",
      kialo: markobutono.instead.find((entry) => entry.goal === "immediate")?.kialo,
    });
  });

  it("'Checkbox' asked of the switch: use-instead markobutono (G5)", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Checkbox" });
    expect(answer.suggestion).toEqual({ ero: "markobutono", props: {} });
    expect(answer.boundary).toEqual({
      ero: "sxaltilo",
      case: "needs-confirmation",
      action: "use-instead",
      kialo: sxaltilo.instead[0]?.kialo,
    });
  });

  // Spec 010 ③: the radio group is an Ero; one of a few is its goal choose-few now.
  it("'Radiobutton' is one of a few: the elekto since PR ③", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Radiobutton" });
    expect(answer.suggestion).toEqual({ ero: "elekto", props: {} });
    expect(answer.matched?.goal).toBe("choose-few");
    expect(answer.action).toBeUndefined();
  });
});

describe("check_usage of the checkbox", () => {
  it("a checkbox with an empty label violates field-label-visible", async () => {
    const empty = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "markobutono", props: { required: true }, label: "" }],
    });
    expect(empty.valid).toBe(false);
    expect(empty.violations.map((entry) => entry.issue.rule)).toEqual(["field-label-visible"]);
  });

  it("'Ich akzeptiere die AGB', required, passes; an error without invalid does not", async () => {
    const clean = await output<Judged>(client, "check_usage", {
      instances: [
        { ero: "markobutono", props: { required: true }, label: "Ich akzeptiere die AGB" },
      ],
    });
    expect(clean.valid).toBe(true);
    expect(clean.violations).toEqual([]);
    const contradiction = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "markobutono",
          props: { required: true },
          label: "Ich akzeptiere die AGB",
          texts: { error: "Akzeptiere die AGB, um fortzufahren" },
        },
      ],
    });
    expect(contradiction.violations.map((entry) => entry.issue.rule)).toEqual([
      "ero-prop-constraint",
    ]);
  });

  it("'Pflichtfeld' as the error violates the fixed error rule", async () => {
    const vague = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "markobutono",
          props: { required: true, invalid: true },
          label: "Ich akzeptiere die AGB",
          texts: { error: "Pflichtfeld" },
        },
      ],
    });
    expect(vague.violations.map((entry) => [entry.issue.rule, entry.issue.severity])).toEqual([
      ["error-says-what-to-do", "error"],
    ]);
  });
});

describe("list_eroj and the brief (acceptance 1)", () => {
  it("lists the Eroj; the brief of the markobutono names the purpose, the axes, the label as a duty and its alternatives", async () => {
    const listed = await output<{ eroj: { name: string }[] }>(client, "list_eroj", {});
    expect(listed.eroj.map((entry) => entry.name)).toEqual([
      "butono",
      "elekto",
      "kampo",
      "ligilo",
      "markobutono",
      "sxaltilo",
    ]);
    const brief = await output<Brief>(client, "get_ero", { name: "markobutono", brief: true });
    expect(brief.purpose).toBe(markobutono.purpose);
    expect(brief.required).toEqual({ props: [], slots: ["label"] });
    expect(brief.axes.map((axis) => axis.name)).toEqual(["size"]);
    expect(brief.instead?.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["immediate", "sxaltilo"],
      ["choose-one-of-few", "elekto"],
    ]);
    expect(brief.boundary?.map((entry) => entry.case)).toEqual([
      "indeterminate",
      "checkbox-group",
      "no-visible-label",
    ]);
  });
});
