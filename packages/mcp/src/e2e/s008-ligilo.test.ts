// Spec 008, acceptance 2 and 3 (T024): the scenarios S1 to S3 and the example dialog of the spec
// against the real MCP server (in-memory transport, every answer validated against the tool's
// output schema), over the served Modelo `core + aspekto-ekzemplo`. Every expected text is read
// from the data (uzo.json, reguloj.json, jugxoj.json), never restated here: a changed Uzo changes
// the expectation, and a changed action breaks the test (mutation check, like AK-09).

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
const butono = read<UzoFile>("eroj/butono/uzo.json").uzo;
const ligilo = read<UzoFile>("eroj/ligilo/uzo.json").uzo;
const navigation = butono.boundary.find((entry) => entry.case === "navigation");
if (navigation === undefined) throw new Error("no boundary navigation");
const action = ligilo.instead.find((entry) => entry.goal === "action");
if (action === undefined) throw new Error("no alternative action");
const prompt = readFileSync(new URL("../../prompts/gvidanto.md", import.meta.url), "utf8");

type Suggested = {
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: Record<string, string> } | null;
  kialo?: string;
  regulo?: { name: string; kialo: string };
  boundary?: { ero: string; case: string; action: string; kialo: string };
  action?: string;
  candidates?: unknown[];
};
type Judged = {
  valid: boolean;
  violations: {
    instance: number[];
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
  boundary?: { case: string; action: string; ero?: string }[];
};

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("S1: the agent gets the link instead of a refusal", () => {
  it("'Zur Projektübersicht' is the ligilo with the kialo of the butono's boundary, no ask-human", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Zur Projektübersicht" });
    expect(answer.suggestion).toEqual({ ero: "ligilo", props: {} });
    expect(answer.boundary).toEqual({
      ero: "butono",
      case: "navigation",
      action: "use-instead",
      kialo: navigation.kialo,
    });
    expect(navigation.action).toBe("use-instead");
    expect(navigation.kialo).toMatch(/Fundamento covers it with ligilo\.$/);
    expect(answer.action).toBeUndefined();
    expect(answer.candidates).toBeUndefined();
  });

  it("the example dialog: 'Ich brauche einen Button, der zur Projektübersicht führt' → ligilo, kialo quoted, standalone proposed", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Ich brauche einen Button, der zur Projektübersicht führt",
    });
    expect(answer.suggestion?.ero).toBe("ligilo");
    // What the Gvidanto says next: this is navigation, there is the ligilo, the kialo of the
    // boundary; then it reads the ligilo and proposes placement standalone and a label that
    // names the destination. Prompt rule 13 binds the agent to the Ero the boundary points to.
    expect(answer.boundary?.kialo).toBe(navigation.kialo);
    expect(prompt).toMatch(
      /13\. When `suggest_ero` answers with a `boundary` whose action is `use-instead`.*quote its kialo.*Do not build the Ero the user named/,
    );
    const brief = await output<Brief>(client, "get_ero", { name: "ligilo", brief: true });
    expect(brief.axes.map((axis) => axis.name)).toEqual(["placement", "size"]);
    expect(brief.axes[0]?.values).toContain("standalone");
    // R-10 (Abnahme 2026-10-13): only the destination is a duty; label is the fallback name.
    expect(brief.required.props).toEqual(["to"]);
    expect(brief.purpose).toBe(ligilo.purpose);
  });

  it("'Dokumentation' is the external ligilo", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Dokumentation" });
    // R-9 (Abnahme 2026-10-13, A6): a boolean prop is a boolean, not the text "true".
    expect(answer.suggestion).toEqual({ ero: "ligilo", props: { external: true } });
    expect(answer.regulo?.name).toBe("external-link-marked");
  });
});

describe("S2: the agent writes the label right", () => {
  it("'hier klicken' on a link: the fixed rule link-label-names-destination, with kialo and a sentence that follows", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "ligilo", props: { placement: "standalone" }, label: "hier klicken" }],
    });
    expect(answer.valid).toBe(false);
    const errors = answer.violations.filter((entry) => entry.issue.severity === "error");
    expect(errors.map((entry) => entry.issue.rule)).toEqual(["link-label-names-destination"]);
    expect(errors[0]?.issue.regulo?.kialo).toMatch(/2\.4\.4/);
    expect(errors[0]?.issue.suggestion).toContain("Projektübersicht öffnen");
  });

  it("'click here' gets the English example when the instance says its language", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "ligilo", props: {}, label: "click here", lingvo: "en" }],
    });
    expect(answer.violations[0]?.issue.suggestion).toContain("Open the project overview");
  });

  it("'Projektübersicht öffnen' passes every text rule", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "ligilo", props: {}, label: "Projektübersicht öffnen" }],
    });
    expect(answer.valid).toBe(true);
    expect(answer.violations).toEqual([]);
  });
});

describe("S3: the agent does not take the link for an action", () => {
  it("'Speichern' as a link: the case action with use-instead butono, from the fixed rule", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "ligilo", props: {}, label: "Speichern" }],
    });
    expect(answer.valid).toBe(false);
    expect(answer.violations.map((entry) => entry.issue.rule)).toEqual([
      "link-navigates-button-acts",
    ]);
    const [violation] = answer.violations;
    expect(violation?.issue.message).toContain("action");
    expect(violation?.issue.message).toContain("use-instead");
    expect(violation?.issue.suggestion).toMatch(/^Use butono instead/);
    expect(violation?.issue.suggestion).toContain(action.kialo);
    expect(action.ero).toBe("butono");
  });

  it("'Speichern' asked as a goal is the butono, not the link", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Speichern" });
    expect(answer.suggestion?.ero).toBe("butono");
    expect(answer.action).toBeUndefined();
  });
});

describe("list_eroj and the brief (A5, acceptance 1)", () => {
  it("lists two Eroj and answers get_ero ligilo with Skemo and Uzo", async () => {
    const listed = await output<{ eroj: { name: string }[] }>(client, "list_eroj", {});
    expect(listed.eroj.map((entry) => entry.name)).toEqual([
      "butono",
      "elekto",
      "kampo",
      "ligilo",
      "markobutono",
      "sxaltilo",
    ]);
    const full = await output<{ skemo: { a11y: { role: string } }; uzo?: { purpose: string } }>(
      client,
      "get_ero",
      { name: "ligilo" },
    );
    expect(full.skemo.a11y.role).toBe("link");
    expect(full.uzo?.purpose).toBe(ligilo.purpose);
  });
});

// F-2 (Abnahme Spec 008, 2026-10-13, Doku): "Wie schalte ich die Marke in Figma um?" The mode is
// set on the page or on a frame or section, never on a single component set; the sets stand on
// "Automatisch" and follow. The prompt carries the answer, so a client agent says it right.
describe("F-2: the prompt says how the brand is switched in Figma", () => {
  it("rule 14 names the page or frame (section), never the single set, and Automatisch", async () => {
    const prompt = (await client.getPrompt({ name: "gvidanto" })).messages[0]?.content;
    const text = prompt?.type === "text" ? prompt.text : "";
    const rule14 = text.split("\n").find((line) => line.startsWith("14. ")) ?? "";
    expect(rule14).toMatch(/switch the brand in Figma/i);
    expect(rule14).toMatch(/mode of the collection `aspekto` on the page or on a frame or section/);
    expect(rule14).toMatch(/never on a single component set/);
    expect(rule14).toMatch(/Automatisch/);
  });
});
