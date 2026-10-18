// Spec 010 ④, acceptance 1, 2 and 7 (G7): the select against the real MCP server (in-memory
// transport, every answer validated against the tool's output schema), over the served Modelo
// `core + aspekto-ekzemplo`. The dialogs are tests: "Land auswählen" is an elektilo with the kialo of
// its goal; "Dropdown mit drei Versandarten" stays an elekto (③ D-14), the select's own alternative
// choose-few says the same; "Wie heißt das Dropdown in Fundamento?" is answered by describe_term.
// check_usage finds two options with one label, an empty label, a placeholder that repeats the
// label and one that names an option; a prompt is allowed. The butono, the kampo and the elekto
// send choose-many to it. Every expected text is read from the data.

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
const elektilo = read<UzoFile>("eroj/elektilo/uzo.json").uzo;
const butono = read<UzoFile>("eroj/butono/uzo.json").uzo;
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
  violations: {
    issue: {
      rule: string;
      severity: string;
      message: string;
      suggestion: string;
      regulo?: { name: string; kialo: string };
    };
  }[];
};
type Brief = {
  ero: string;
  purpose?: string;
  axes: { name: string; values: string[]; default?: string }[];
  required: { props: string[]; slots: string[] };
  instead?: { goal: string; ero: string | null; kialo: string }[];
  boundary?: { case: string; action: string; kialo: string }[];
};
type Term = { term: string; matchedBy: string; prefLabel: Record<string, string> };

const COUNTRIES = [
  "Deutschland",
  "Österreich",
  "Schweiz",
  "Frankreich",
  "Italien",
  "Spanien",
  "Polen",
  "Dänemark",
];

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

const rules = (judged: Judged) =>
  judged.violations.map((entry) => [entry.issue.rule, entry.issue.severity]);

describe("the dialogs of the spec: a list of many, a dropdown of three", () => {
  it("'Land auswählen' is an elektilo: the goal choose-many with the kialo of elekto-options-few", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Land auswählen" });
    expect(answer.suggestion).toEqual({ ero: "elektilo", props: {} });
    expect(answer.suggestion?.ero).not.toBe("butono");
    expect(answer.matched).toEqual({ goal: "choose-many", keyword: "auswählen", lingvo: "de" });
    expect(answer.regulo?.name).toBe("elekto-options-few");
    expect(answer.kialo).toBe(kialoOf("elekto-options-few"));
    expect(answer.action).toBeUndefined();
  });

  it("'Dropdown mit drei Versandarten' stays an elekto: three visible options read faster (③ D-14)", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Dropdown mit drei Versandarten",
    });
    expect(answer.suggestion).toEqual({ ero: "elekto", props: {} });
    expect(answer.matched).toEqual({ goal: "choose-few", keyword: "drei", lingvo: "de" });
    expect(answer.boundary).toEqual({
      ero: "butono",
      case: "choose-few",
      action: "use-instead",
      kialo: butono.instead.find((entry) => entry.goal === "choose-few")?.kialo,
    });
    expect(answer.action).toBeUndefined();
  });

  it("'Wie heißt das Dropdown in Fundamento?': describe_term Dropdown names the Elektilo (Auswahlliste, select)", async () => {
    const term = await output<Term>(client, "describe_term", { term: "Dropdown" });
    expect(term.term).toBe("Elektilo");
    expect(term.matchedBy).toBe("altLabel");
    expect(term.prefLabel).toEqual({ eo: "Elektilo", en: "select", de: "Auswahlliste" });
  });

  it("'Combobox mit Suche' is a search in the list: the kompletigilo's since Spec 014 ⑤ (the select's alternative says the same)", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Combobox mit Suche" });
    expect(answer.suggestion).toEqual({ ero: "kompletigilo", props: {} });
    expect(answer.boundary).toBeUndefined();
    expect(elektilo.instead.find((entry) => entry.goal === "search-in-list")?.ero).toBe(
      "kompletigilo",
    );
  });
});

describe("check_usage of the select", () => {
  it("eight countries with a label and the prompt 'Bitte wählen' pass: the prompt is allowed", async () => {
    const clean = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "elektilo",
          props: { placeholder: "Bitte wählen" },
          label: "Land",
          texts: { options: COUNTRIES },
        },
      ],
    });
    expect(clean.valid).toBe(true);
    expect(clean.violations).toEqual([]);
  });

  it("two options with the same label violate option-labels-distinct, an error with its kialo", async () => {
    const same = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "elektilo",
          props: {},
          label: "Land",
          texts: { options: ["Deutschland", "Österreich", "Deutschland"] },
        },
      ],
    });
    expect(same.valid).toBe(false);
    expect(rules(same)).toEqual([["option-labels-distinct", "error"]]);
    expect(same.violations[0]?.issue.regulo?.kialo).toBe(kialoOf("option-labels-distinct"));
  });

  it("an empty label violates field-label-visible", async () => {
    const empty = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "elektilo", props: {}, label: "", texts: { options: COUNTRIES } }],
    });
    expect(empty.valid).toBe(false);
    expect(rules(empty)).toEqual([["field-label-visible", "error"]]);
  });

  it("a placeholder equal to the label warns with placeholder-not-label", async () => {
    const repeated = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "elektilo",
          props: { placeholder: "Land" },
          label: "Land",
          texts: { options: COUNTRIES },
        },
      ],
    });
    expect(rules(repeated)).toEqual([
      ["placeholder-not-label", "warning"],
      ["select-placeholder-is-prompt", "error"],
    ]);
  });

  it("an option as the placeholder is no prompt: select-placeholder-is-prompt, with the approved prompt as the solution", async () => {
    const option = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "elektilo",
          props: { placeholder: "Deutschland" },
          label: "Land",
          texts: { options: COUNTRIES },
        },
      ],
    });
    expect(option.valid).toBe(false);
    expect(rules(option)).toEqual([["select-placeholder-is-prompt", "error"]]);
    expect(option.violations[0]?.issue.regulo?.kialo).toBe(kialoOf("select-placeholder-is-prompt"));
    expect(option.violations[0]?.issue.suggestion).toMatch(/Bitte wählen/);
  });

  it("a single option is no choice (uzo-slot-min)", async () => {
    const one = await output<Judged>(client, "check_usage", {
      instances: [
        { ero: "elektilo", props: {}, label: "Land", texts: { options: ["Deutschland"] } },
      ],
    });
    expect(rules(one)).toEqual([["uzo-slot-min", "error"]]);
  });
});

describe("list_eroj and the brief (acceptance 1, 7)", () => {
  it("lists twenty-nine Eroj; the brief of the elektilo names the purpose, size, label and options as duties, its alternatives and boundaries", async () => {
    const listed = await output<{ eroj: { name: string }[] }>(client, "list_eroj", {});
    expect(listed.eroj.map((entry) => entry.name)).toEqual([
      "apartigilo",
      "atributlisto",
      "avizo",
      "butono",
      "dialogo",
      "elektilo",
      "elekto",
      "faldilo",
      "ikono",
      "insigno",
      "kampo",
      "kompletigilo",
      "konsileto",
      "langetaro",
      "ligilo",
      "markobutono",
      "menuo",
      "mezurilo",
      "navigado",
      "pagxigilo",
      "plenstato",
      "saltligilo",
      "spuro",
      "sxaltilo",
      "sxvebilo",
      "tabelo",
      "tekstareo",
      "teksto",
      "titolo",
    ]);
    const brief = await output<Brief>(client, "get_ero", { name: "elektilo", brief: true });
    expect(brief.purpose).toBe(elektilo.purpose);
    expect(brief.required).toEqual({ props: [], slots: ["label", "options"] });
    // Spec 011 ① (O-3): selected, the state of one option, is an axis of the brief too.
    expect(brief.axes.map((axis) => axis.name)).toEqual(["size", "selected"]);
    expect(brief.instead?.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["choose-few", "elekto"],
      // Spec 014 ⑤: covered by the kompletigilo.
      ["search-in-list", "kompletigilo"],
      ["multiple", null],
    ]);
    expect(brief.boundary?.map((entry) => [entry.case, entry.action])).toEqual([
      ["custom-popup", "not-supported"],
      ["grouped-options", "ask-human"],
      ["no-visible-label", "not-supported"],
    ]);
    const bytes = Buffer.byteLength(JSON.stringify(brief), "utf8");
    expect(Math.ceil(bytes / 3), `${bytes} bytes`).toBeLessThanOrEqual(750);
  });

  it.each(["butono", "kampo", "elekto"])(
    "the %s answers choose-many with the elektilo (use-instead, G5)",
    async (name) => {
      const brief = await output<Brief>(client, "get_ero", { name, brief: true });
      const many = brief.instead?.find((entry) => entry.goal === "choose-many");
      expect(many?.ero).toBe("elektilo");
      expect(many?.kialo).toMatch(/elektilo/);
      const bytes = Buffer.byteLength(JSON.stringify(brief), "utf8");
      expect(Math.ceil(bytes / 3), `${name}: ${bytes} bytes`).toBeLessThanOrEqual(750);
    },
  );
});

// Spec 011 ① (plan ① D-09): the empty option 'Alle' — once, as a real option, never beside a
// prompt; and it counts as an option for option-labels-distinct.
describe("Spec 011 ①: the empty option of the select", () => {
  it("'Alle' as empty-label with two options passes; beside a placeholder it is a contradiction the Skemo forbids", async () => {
    const right = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "elektilo",
          props: { "empty-label": "Alle" },
          label: "Status",
          texts: { options: ["Entwurf", "Gültig"] },
        },
      ],
    });
    expect(right.valid).toBe(true);
    expect(right.violations).toEqual([]);
    const both = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "elektilo",
          props: { "empty-label": "Alle", placeholder: "Bitte wählen" },
          label: "Status",
          texts: { options: ["Entwurf", "Gültig"] },
        },
      ],
    });
    expect(both.violations.map((entry) => entry.issue.rule)).toEqual(["ero-prop-constraint"]);
  });

  it("'Alle' twice — as empty-label and as an option — violates option-labels-distinct", async () => {
    const twice = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "elektilo",
          props: { "empty-label": "Alle" },
          label: "Status",
          texts: { options: ["Alle", "Entwurf"] },
        },
      ],
    });
    expect(twice.violations.map((entry) => entry.issue.rule)).toEqual(["option-labels-distinct"]);
  });
});
