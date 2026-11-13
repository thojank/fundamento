// Spec 053 (LA-3.1): the tightened `label-required` on the agent-facing MCP surface, against the
// real server (in-memory transport, every answer validated against the tool's output schema by
// `output`/`call`), over the served repository Modelo – the server nordstelo's connectGvidanto
// starts for M-1. The fragments are copied inline from M-1 (specs/050-mvp-probelauf/daten/m1/F);
// this test reads nothing under specs/. Assertions use rule, severity, path and the message
// prefix that ekranoj's rondoj.ts reads, never whole prose.
//
// AC-1, AC-2, AC-3, AC-4, AC-7 (check_markup and check_usage), AC-13, AC-14 (get_ero brief).

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type Connected, closeClients, connect, output, preload } from "../test-doubles/client.js";

afterAll(closeClients);
preload();

type Issue = {
  rule: string;
  severity?: string;
  path?: string;
  message: string;
  suggestion?: string;
  regulo?: { id: string; name: string; kialo: string };
};
type Violation = { instance: number[]; issue: Issue };
type Judged = { instances: number; valid: boolean; violations: Violation[] };
type Instance = { ero: string; [key: string]: unknown };
type Marked = { eroj: Instance[]; rezulto: Judged };
type Brief = {
  ero: string;
  props?: { name: string; type: string; shown?: true; hidden?: true }[];
};

const RULE = "label-required";

/** The anmelden screen of M-1 F, byte for byte (fragmento.html): an empty brand link and button. */
const ANMELDEN = [
  "<fm-sxelo>",
  '  <fm-ligilo slot="brand" to="anmelden.html" label="Team Nord"></fm-ligilo>',
  '  <fm-navigado slot="nav" label="Hauptnavigation" page="anmelden.html">',
  '    <a href="registrieren.html">Konto anlegen</a>',
  '    <a href="passwort-vergessen.html">Passwort vergessen</a>',
  '    <a href="konto.html">Mein Konto</a>',
  "  </fm-navigado>",
  '  <fm-stako gap="large">',
  "    <fm-pagxo>",
  '      <fm-titolo slot="title" focusable level="1">Anmelden</fm-titolo>',
  '      <fm-teksto slot="subtitle">Melden Sie sich mit Ihrer E-Mail-Adresse und Ihrem Passwort an.</fm-teksto>',
  '      <fm-formularo label="Anmeldung">',
  '        <fm-kampo slot="fields" kind="email" name="email" label="E-Mail" autocomplete="email" required></fm-kampo>',
  '        <fm-kampo slot="fields" kind="password" name="passwort" label="Passwort" autocomplete="current-password" required></fm-kampo>',
  '        <fm-butono slot="actions" emphasis="high" type="submit" label="Anmelden"></fm-butono>',
  "      </fm-formularo>",
  "    </fm-pagxo>",
  "  </fm-stako>",
  "</fm-sxelo>",
].join("\n");

/** The two visible actions of M-1 F (konto, passwort-vergessen): text in the element. */
const SLOT_TEXT = [
  '<fm-butono emphasis="high">Abmelden</fm-butono>',
  '<fm-butono emphasis="high" type="submit" label="Link senden">Link senden</fm-butono>',
  '<fm-ligilo to="anmelden.html">Team Nord</fm-ligilo>',
].join("\n");

/** The message of the new case (section 2.2): it starts as rondoj.ts reads it. */
const ONLY_PROP =
  /^Instance (\d+) of (butono|ligilo) has only the label prop "([^"]+)", which is never shown, and no icon\.$/;
/** The suggestion of the new case: the right form, with the noun of the Ero's role. */
const ONLY_PROP_SUGGESTION =
  /^Write the label as the text of the element: <fm-(butono|ligilo) …>([^<]+)<\/fm-\1>\. The label prop names an icon-only (button|link) next to its icon\.$/;

const labelRequired = (judged: Judged) =>
  judged.violations.filter((violation) => violation.issue.rule === RULE);

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect());
});

describe("get_ero brief says the label of butono and ligilo is hidden (AC-13, AC-14)", () => {
  it.each(["butono", "ligilo"])(
    "%s: the brief carries { name: label, type: string, hidden: true }, within the output schema",
    async (name) => {
      const brief = await output<Brief>(client, "get_ero", { name, brief: true });
      const label = brief.props?.find((prop) => prop.name === "label");
      expect(label).toEqual({ name: "label", type: "string", hidden: true });
      // Key order of the contract (section 2.3): name, type, hidden.
      expect(Object.keys(label ?? {})).toEqual(["name", "type", "hidden"]);
    },
  );

  it("the kampo keeps shown: true and no prop of any brief is both shown and hidden", async () => {
    const kampo = await output<Brief>(client, "get_ero", { name: "kampo", brief: true });
    expect(kampo.props?.find((prop) => prop.name === "label")).toEqual({
      name: "label",
      type: "string",
      shown: true,
    });
    for (const name of ["butono", "ligilo", "kampo"]) {
      const brief = await output<Brief>(client, "get_ero", { name, brief: true });
      const both = (brief.props ?? []).filter((prop) => prop.shown && prop.hidden);
      expect(both, name).toEqual([]);
    }
  });
});

describe("check_markup on the anmelden screen of M-1 F (AC-1, AC-2, AC-7)", () => {
  it("gives two label-required errors, ligilo and butono, with the new message and suggestion", async () => {
    const answer = await output<Marked>(client, "check_markup", { fragment: ANMELDEN });
    expect(answer.rezulto.valid).toBe(false);
    const found = labelRequired(answer.rezulto);
    const linkAt = answer.eroj.findIndex((instance) => instance.ero === "ligilo");
    const buttonAt = answer.eroj.findIndex((instance) => instance.ero === "butono");
    expect([linkAt, buttonAt].every((index) => index >= 0)).toBe(true);
    expect(
      found.map((violation) => [violation.instance, violation.issue.severity ?? "error"]),
    ).toEqual([
      [[linkAt], "error"],
      [[buttonAt], "error"],
    ]);
    const parsed = found.map((violation) => ONLY_PROP.exec(violation.issue.message)?.slice(1));
    expect(parsed).toEqual([
      [String(linkAt), "ligilo", "Team Nord"],
      [String(buttonAt), "butono", "Anmelden"],
    ]);
    const suggested = found.map((violation) =>
      ONLY_PROP_SUGGESTION.exec(violation.issue.suggestion ?? "")?.slice(1),
    );
    expect(suggested).toEqual([
      ["ligilo", "Team Nord", "link"],
      ["butono", "Anmelden", "button"],
    ]);
    // The Regulo block keeps its name; the ID stays one for both Eroj.
    expect(new Set(found.map((violation) => violation.issue.regulo?.id)).size).toBe(1);
    expect(found.map((violation) => violation.issue.regulo?.name)).toEqual([RULE, RULE]);
  });

  it("keeps label-names-action a warning on the empty Anmelden button (AC-12)", async () => {
    const answer = await output<Marked>(client, "check_markup", { fragment: ANMELDEN });
    const names = answer.rezulto.violations.filter(
      (violation) => violation.issue.rule === "label-names-action",
    );
    expect(names.map((violation) => violation.issue.severity)).toEqual(["warning"]);
  });

  it("finds no label-required for an action with text in the element (AC-4)", async () => {
    const answer = await output<Marked>(client, "check_markup", { fragment: SLOT_TEXT });
    expect(answer.eroj.map((instance) => instance.ero)).toEqual(["butono", "butono", "ligilo"]);
    expect(labelRequired(answer.rezulto)).toEqual([]);
  });
});

describe("the icon-only action passes label-required (AC-3)", () => {
  // Markup with fm-ikono in icon-start also gives the pre-existing `uzo-slot-nesting` (Spec 053
  // LA-1.1, follow-up candidate); this test asserts only on label-required.
  const MARKUP = [
    '<fm-butono emphasis="low" size="small" label="Schließen"><fm-ikono slot="icon-start" name="close"></fm-ikono></fm-butono>',
    '<fm-ligilo to="hilfe.html" label="Hilfe"><fm-ikono slot="icon-start" name="help"></fm-ikono></fm-ligilo>',
  ].join("\n");

  it("check_markup: butono and ligilo with an icon in icon-start and a label prop", async () => {
    const answer = await output<Marked>(client, "check_markup", { fragment: MARKUP });
    expect(answer.eroj.map((instance) => instance.ero)).toEqual([
      "butono",
      "ikono",
      "ligilo",
      "ikono",
    ]);
    expect(labelRequired(answer.rezulto)).toEqual([]);
  });

  it("check_usage: butono and ligilo with a filled icon slot (icon-start, icon-end) are valid", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [
        { ero: "butono", props: { label: "Schließen" }, slots: { "icon-start": ["icon"] } },
        {
          ero: "ligilo",
          props: { to: "hilfe.html", label: "Hilfe" },
          slots: { "icon-end": ["icon"] },
        },
      ],
    });
    expect(labelRequired(answer)).toEqual([]);
    expect(answer.violations.filter((violation) => violation.issue.severity === "error")).toEqual(
      [],
    );
  });

  it("check_usage: the same label prop without the icon is the new error (control)", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [
        { ero: "butono", props: { label: "Schließen" } },
        { ero: "ligilo", props: { to: "hilfe.html", label: "Hilfe" } },
      ],
    });
    expect(labelRequired(answer).map((violation) => violation.instance)).toEqual([[0], [1]]);
  });
});

describe("check_usage and check_markup agree on the same instances (AC-7)", () => {
  it("gives the same label-required findings for the instances check_markup derives", async () => {
    const marked = await output<Marked>(client, "check_markup", { fragment: ANMELDEN });
    const used = await output<Judged>(client, "check_usage", { instances: marked.eroj });
    expect(used.instances).toBe(marked.rezulto.instances);
    const shape = (judged: Judged) =>
      labelRequired(judged).map((violation) => ({
        instance: violation.instance,
        rule: violation.issue.rule,
        severity: violation.issue.severity ?? "error",
        message: violation.issue.message,
        suggestion: violation.issue.suggestion,
        regulo: violation.issue.regulo,
      }));
    const fromUsage = shape(used);
    expect(fromUsage.length).toBeGreaterThan(0);
    expect(fromUsage).toEqual(shape(marked.rezulto));
  });

  it("butono and ligilo use the same message shape in both cases (only the noun differs)", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [
        { ero: "butono", props: { label: "Konto speichern" } },
        { ero: "ligilo", props: { to: "anmelden.html", label: "Team Nord" } },
        { ero: "butono", props: {} },
        { ero: "ligilo", props: { to: "anmelden.html" } },
      ],
    });
    const found = labelRequired(answer);
    expect(found.map((violation) => violation.instance)).toEqual([[0], [1], [2], [3]]);
    const skeleton = (text: string) =>
      text
        .replace(/\b(butono|ligilo)\b/g, "<ero>")
        .replace(/\b(button|link)\b/g, "<noun>")
        .replace(/"[^"]*"/g, '"…"')
        .replace(/>[^<]+</g, ">…<")
        .replace(/\d+/g, "N");
    const [butonoProp, ligiloProp, butonoNeither, ligiloNeither] = found.map((violation) => ({
      message: skeleton(violation.issue.message),
      suggestion: skeleton(violation.issue.suggestion ?? ""),
    }));
    expect(ligiloProp).toEqual(butonoProp);
    expect(ligiloNeither).toEqual(butonoNeither);
    expect(butonoProp).not.toEqual(butonoNeither);
    for (const violation of found) {
      expect(violation.issue.message).toMatch(/^Instance \d+ of (butono|ligilo) has /);
      expect(violation.issue.severity ?? "error").toBe("error");
    }
  });
});
