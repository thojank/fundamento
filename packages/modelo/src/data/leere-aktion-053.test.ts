// Spec 053 (Befund F-052-4, Spec 052): an action without a visible name turns the screen red. A
// butono or ligilo that carries only label="…" – no text, no icon – looks empty (the butono an
// empty surface, the ligilo 0 × 0 px), yet its accessible name is set; label-required accepted
// any label prop until now. It now takes the prop only next to a filled icon slot (the Skemo's
// decorative icon-* slots), applies to the ligilo too, and the brief of get_ero says that label
// is hidden at both. label-names-action stays a warning and unchanged (Befund 1).

import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { EroInstance, Jugxo, Modelo } from "../contracts/modelo.js";
import { evaluateUsage } from "../eroj/usage.js";
import { checkMarkup } from "../gvidanto/check-markup.js";
import { checkUsage } from "../gvidanto/check-usage.js";
import { getEro } from "../gvidanto/eroj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const loaded = loadModelo(defaultModeloSource()).modelo;
if (loaded === undefined) throw new Error("the repo Modelo must load");
const modelo: Modelo = loaded;

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const dataDir = fileURLToPath(new URL("../../data/", import.meta.url));

const RULE = "label-required";
const ACTIONS = ["butono", "ligilo"] as const;
/** The stored fragments of M-1 F (Spec 050), the screens of the re-evaluation. */
const M1_F = join(repoRoot, "specs/050-mvp-probelauf/daten/m1/F");

const reguloNamed = (name: string) => {
  const regulo = modelo.reguloj.find((candidate) => candidate.name === name);
  if (regulo === undefined) throw new Error(`${name} missing`);
  return regulo;
};
const entryOf = (ero: string) => {
  const entry = modelo.eroj.find((candidate) => candidate.ero.name === ero);
  if (entry === undefined) throw new Error(`${ero} missing`);
  return entry;
};
/** The noun of an Ero in a message: its role (button, link). */
const nounOf = (ero: string) => entryOf(ero).skemo.a11y.role;

type Finding = {
  rule: string;
  severity: string;
  path: string;
  message: string;
  suggestion: string;
};

/** The findings of check_markup on a fragment, with the Ero of the instance they name. */
const markupFindings = (fragment: string): (Finding & { ero: string | undefined })[] => {
  const result = checkMarkup(modelo, { fragment, lingvo: "de" });
  if (!result.ok) throw new Error(`check_markup refused: ${JSON.stringify(result.issues)}`);
  const { eroj, rezulto } = result.output;
  return rezulto.violations.map(({ instance, issue }) => ({
    ero: eroj[instance?.[0] ?? -1]?.ero,
    rule: issue.rule,
    severity: issue.severity,
    path: issue.path,
    message: issue.message,
    suggestion: issue.suggestion,
  }));
};
/** The findings of check_usage on instances given directly. */
const usageFindings = (instances: EroInstance[]): Finding[] => {
  const result = checkUsage(modelo, { instances });
  if (!result.ok) throw new Error(`check_usage refused: ${JSON.stringify(result.issues)}`);
  return result.output.violations.map(({ issue }) => ({
    rule: issue.rule,
    severity: issue.severity,
    path: issue.path,
    message: issue.message,
    suggestion: issue.suggestion,
  }));
};
const ofRule = <T extends { rule: string }>(findings: T[]) =>
  findings.filter((finding) => finding.rule === RULE);

/** The message and suggestion of the new case (implementation spec 2.2). */
const onlyProp = (index: number, ero: string, label: string) => ({
  message: `Instance ${index} of ${ero} has only the label prop "${label}", which is never shown, and no icon.`,
  suggestion: `Write the label as the text of the element: <fm-${ero} …>${label}</fm-${ero}>. The label prop names an icon-only ${nounOf(ero)} next to its icon.`,
});
/** The message and suggestion of the unchanged case. */
const neither = (index: number, ero: string) => ({
  message: `Instance ${index} of ${ero} has neither a visible label nor a label prop.`,
  suggestion: `Give the label as slot text, or for an icon-only ${nounOf(ero)} set the label prop as its accessible name.`,
});

describe("Spec 053 data: label-required names butono and ligilo (AC-9, AC-10, AC-12, AC-13)", () => {
  it("the Regulo keeps its ID and applies to butono and ligilo; statement and scope name the icon slots", () => {
    const regulo = reguloNamed(RULE);
    expect(regulo.id).toBe("reg_01M2XMV80DG7JCJDTZGE66MGHY");
    expect(regulo.appliesTo).toEqual({ eroj: ["butono", "ligilo"] });
    for (const text of [regulo.statement, regulo.scope]) {
      expect(text).toMatch(/\bbutono\b/);
      expect(text).toMatch(/\bligilo\b/);
      expect(text).toMatch(/icon-start/);
      expect(text).toMatch(/icon-end/);
    }
    expect(regulo.kialo).toMatch(/a name nobody sees is no label for sighted people/);
  });

  it("the ligilo has the boundary no-accessible-label via label-required, last like the butono's", () => {
    for (const ero of ACTIONS) {
      const boundary = entryOf(ero).uzo?.boundary ?? [];
      const last = boundary.at(-1);
      expect(last?.case, ero).toBe("no-accessible-label");
      expect(last?.action, ero).toBe("not-supported");
      expect(last?.via, ero).toEqual({ regulo: RULE });
      expect(last?.kialo, ero).toMatch(/\bbecause\b/);
    }
  });

  it("the Skemo of butono and ligilo says label is never shown (shown: false); the fields keep shown: true", () => {
    for (const ero of ACTIONS) {
      const label = entryOf(ero).skemo.props.find((prop) => prop.name === "label");
      expect(label?.shown, ero).toBe(false);
      expect(label?.description, ero).toMatch(/never shown/);
    }
    for (const ero of reguloNamed("field-label-visible").appliesTo?.eroj ?? []) {
      expect(entryOf(ero).skemo.props.find((prop) => prop.name === "label")?.shown, ero).toBe(true);
    }
  });

  it("label-names-action stays byte-identical: the Regulo and the Uzo entries (AC-12)", () => {
    const raw = JSON.parse(readFileSync(join(dataDir, "reguloj.json"), "utf8")) as {
      reguloj: { name: string }[];
    };
    const regulo = raw.reguloj.find((candidate) => candidate.name === "label-names-action");
    const sha = (value: unknown) =>
      createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
    expect(sha(regulo)).toBe(LABEL_NAMES_ACTION_REGULO);
    const uzo = JSON.parse(readFileSync(join(dataDir, "eroj/butono/uzo.json"), "utf8")) as {
      uzo: { content: { regulo?: string }[] };
    };
    expect(sha(uzo.uzo.content.filter((entry) => entry.regulo === "label-names-action"))).toBe(
      LABEL_NAMES_ACTION_UZO,
    );
  });
});

/** SHA-256 (first 16 hex digits) of the label-names-action data on main 433b40b4, before Spec 053. */
const LABEL_NAMES_ACTION_REGULO = "44eed0460cb487ba";
const LABEL_NAMES_ACTION_UZO = "89097e5446cae6ee";

describe("Spec 053 brief: label is hidden at butono and ligilo (AC-13 – AC-15)", () => {
  it.each(ACTIONS)('%s: the brief has { name: "label", type: "string", hidden: true }', (ero) => {
    const brief = getEro(modelo, { name: ero, brief: true });
    if (!brief.ok) throw new Error(`get_ero ${ero} failed`);
    const label = brief.output.props?.find((prop) => prop.name === "label");
    // Key order name, type, hidden (implementation spec 2.3).
    expect(JSON.stringify(label)).toBe(
      JSON.stringify({ name: "label", type: "string", hidden: true }),
    );
  });

  it("the kampo keeps shown: true and no prop of any brief is both shown and hidden", () => {
    const kampo = getEro(modelo, { name: "kampo", brief: true });
    if (!kampo.ok) throw new Error("get_ero kampo failed");
    expect(kampo.output.props).toContainEqual({ name: "label", type: "string", shown: true });
    for (const entry of modelo.eroj) {
      const brief = getEro(modelo, { name: entry.ero.name, brief: true });
      if (!brief.ok) throw new Error(`get_ero ${entry.ero.name} failed`);
      for (const prop of brief.output.props ?? []) {
        const skemo = entry.skemo.props.find((candidate) => candidate.name === prop.name);
        expect("hidden" in prop, `${entry.ero.name}.${prop.name}`).toBe(skemo?.shown === false);
        expect("shown" in prop, `${entry.ero.name}.${prop.name}`).toBe(skemo?.shown === true);
      }
    }
  });
});

describe("Spec 053 label-required: only the label prop and no icon is an error (AC-1 – AC-7)", () => {
  it('AC-1: <fm-butono type="submit" label="Anmelden"> gives one error with the new message', () => {
    expect(
      ofRule(markupFindings('<fm-butono type="submit" label="Anmelden"></fm-butono>')),
    ).toEqual([
      {
        ero: "butono",
        rule: RULE,
        severity: "error",
        path: "instances#/0",
        ...onlyProp(0, "butono", "Anmelden"),
      },
    ]);
  });

  it('AC-2: <fm-ligilo slot="brand" to="anmelden.html" label="Team Nord"> gives the same for ligilo', () => {
    expect(
      ofRule(
        markupFindings('<fm-ligilo slot="brand" to="anmelden.html" label="Team Nord"></fm-ligilo>'),
      ),
    ).toEqual([
      {
        ero: "ligilo",
        rule: RULE,
        severity: "error",
        path: "instances#/0",
        ...onlyProp(0, "ligilo", "Team Nord"),
      },
    ]);
  });

  it("AC-3: the label prop next to a filled icon slot is the icon-only action (markup)", () => {
    for (const fragment of [
      '<fm-butono label="Schließen"><fm-ikono slot="icon-start" name="close"></fm-ikono></fm-butono>',
      '<fm-butono label="Schließen"><fm-ikono slot="icon-end" name="close"></fm-ikono></fm-butono>',
      '<fm-ligilo to="profil.html" label="Profil"><fm-ikono slot="icon-start" name="person"></fm-ikono></fm-ligilo>',
    ]) {
      expect(ofRule(markupFindings(fragment)), fragment).toEqual([]);
    }
  });

  it.each(ACTIONS)(
    "AC-3: %s with the label prop and a filled icon-start or icon-end passes (check_usage)",
    (ero) => {
      for (const slot of ["icon-start", "icon-end"]) {
        const instance: EroInstance = {
          ero,
          props: { label: "Schließen" },
          slots: { [slot]: ["icon"] },
        };
        expect(ofRule(usageFindings([instance])), slot).toEqual([]);
      }
    },
  );

  it("AC-4: text of the element passes, with or without the label prop", () => {
    for (const fragment of [
      "<fm-butono>Abmelden</fm-butono>",
      '<fm-butono type="submit" emphasis="high">Link senden</fm-butono>',
      '<fm-butono label="Abmelden">Abmelden</fm-butono>',
      '<fm-ligilo to="anmelden.html">Team Nord</fm-ligilo>',
      '<fm-ligilo to="anmelden.html" label="Team Nord">Team Nord</fm-ligilo>',
    ]) {
      expect(ofRule(markupFindings(fragment)), fragment).toEqual([]);
    }
  });

  it.each(ACTIONS)(
    "AC-5: %s without text and label prop stays the unchanged finding, with or without an icon",
    (ero) => {
      const bare: EroInstance = { ero, props: {} };
      const withIcon: EroInstance = { ero, props: {}, slots: { "icon-start": ["icon"] } };
      for (const [index, instance] of [bare, withIcon].entries()) {
        expect(ofRule(usageFindings([instance])), String(index)).toEqual([
          { rule: RULE, severity: "error", path: "instances#/0", ...neither(0, ero) },
        ]);
      }
    },
  );

  it("AC-5: the butono's suggestion of the unchanged case is byte-identical", () => {
    expect(neither(0, "butono").suggestion).toBe(
      "Give the label as slot text, or for an icon-only button set the label prop as its accessible name.",
    );
  });

  it("AC-6: blank text or &nbsp; counts as empty, and so does a blank label prop", () => {
    for (const fragment of [
      '<fm-butono label="Anmelden">   </fm-butono>',
      '<fm-butono label="Anmelden">&nbsp;</fm-butono>',
      '<fm-butono label="Anmelden">\n  &nbsp; \n</fm-butono>',
    ]) {
      expect(ofRule(markupFindings(fragment)), fragment).toEqual([
        expect.objectContaining({ severity: "error", ...onlyProp(0, "butono", "Anmelden") }),
      ]);
    }
    expect(ofRule(markupFindings('<fm-ligilo to="a.html" label="  "></fm-ligilo>'))).toEqual([
      expect.objectContaining({ severity: "error", ...neither(0, "ligilo") }),
    ]);
    for (const ero of ACTIONS) {
      expect(
        ofRule(usageFindings([{ ero, label: "  ", props: { label: "Weiter" } }])),
        ero,
      ).toEqual([expect.objectContaining(onlyProp(0, ero, "Weiter"))]);
      expect(ofRule(usageFindings([{ ero, label: " ", props: { label: "  " } }])), ero).toEqual([
        expect.objectContaining(neither(0, ero)),
      ]);
    }
  });

  it("AC-7: both messages start as ekranoj's rondoj.ts reads them and name the instance", () => {
    const findings = ofRule(
      markupFindings(
        '<fm-butono>Weiter</fm-butono><fm-ligilo to="a.html" label="Start"></fm-ligilo><fm-butono></fm-butono>',
      ),
    );
    expect(findings.map((finding) => [finding.path, finding.ero])).toEqual([
      ["instances#/1", "ligilo"],
      ["instances#/2", "butono"],
    ]);
    for (const finding of findings) {
      expect(/^Instance \d+ of (\S+) has/.exec(finding.message)?.[1]).toBe(finding.ero);
    }
  });

  it("edge cases: the automatic icon of download or external and the state of the instance do not count", () => {
    for (const props of [
      { to: "bericht.pdf", label: "Bericht", download: true },
      { to: "https://example.org", label: "Bericht", external: true },
    ]) {
      expect(ofRule(usageFindings([{ ero: "ligilo", props }]))).toEqual([
        expect.objectContaining(onlyProp(0, "ligilo", "Bericht")),
      ]);
    }
    for (const props of [
      { label: "Senden", loading: true },
      { label: "Senden", disabled: true },
    ]) {
      expect(ofRule(usageFindings([{ ero: "butono", props }]))).toEqual([
        expect.objectContaining(onlyProp(0, "butono", "Senden")),
      ]);
    }
    // An instance without slots has no icon; an empty icon slot is no icon either.
    expect(
      ofRule(
        usageFindings([{ ero: "butono", props: { label: "X" }, slots: { "icon-start": [] } }]),
      ),
    ).toEqual([expect.objectContaining(onlyProp(0, "butono", "X"))]);
  });
});

describe("Spec 053 on the stored fragments of M-1 F (AC-8)", () => {
  const screens = readdirSync(M1_F, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const findingsOf = (slug: string) =>
    markupFindings(readFileSync(join(M1_F, slug, "fragmento.html"), "utf8"));
  const pick = (rule: string, slug: string) =>
    findingsOf(slug)
      .filter((finding) => finding.rule === rule)
      .map((finding) => [finding.ero, finding.severity]);

  it("reads the four screens", () => {
    expect(screens).toEqual(["anmelden", "konto", "passwort-vergessen", "registrieren"]);
  });

  it("label-required: anmelden butono + ligilo, konto and passwort-vergessen ligilo, registrieren ligilo + butono", () => {
    const expected: Record<string, string[]> = {
      anmelden: ["butono", "ligilo"],
      konto: ["ligilo"],
      "passwort-vergessen": ["ligilo"],
      registrieren: ["butono", "ligilo"],
    };
    for (const slug of screens) {
      const found = pick(RULE, slug);
      expect(
        found.every(([, severity]) => severity === "error"),
        slug,
      ).toBe(true);
      expect(found.map(([ero]) => ero).sort(), slug).toEqual(expected[slug]);
    }
  });

  it("label-names-action stays as before: one warning on the butono of anmelden and of konto", () => {
    const expected: Record<string, string[][]> = {
      anmelden: [["butono", "warning"]],
      konto: [["butono", "warning"]],
      "passwort-vergessen": [],
      registrieren: [],
    };
    for (const slug of screens) {
      expect(pick("label-names-action", slug), slug).toEqual(expected[slug]);
    }
  });
});

describe("Spec 053 Jugxoj (AC-11)", () => {
  const regulo = reguloNamed(RULE);
  const examples = modelo.jugxoj.filter((jugxo) => jugxo.ekzemplo?.regulo === regulo.id);
  const lock = JSON.parse(readFileSync(join(dataDir, "ids.lock.json"), "utf8")) as {
    ids: Record<string, { status: string; type: string }>;
  };
  const evaluate = (jugxo: Jugxo) => evaluateUsage(modelo, jugxo.ekzemplo?.instances ?? []);

  // The icon is the entry "icon", not { ero: "ikono" }: the butono's icon-start allows no nesting
  // (uzo-slot-nesting), so the Ero form would make the CORRECT example invalid (deviation from
  // implementation spec Q-6, recorded in tasks.md).
  it("the approved icon-only example keeps its ID and decision and fills icon-start", () => {
    const corrected = modelo.jugxoj.find((jugxo) => jugxo.id === "jug_01M2XN0Q7YGPVYC981A9D98PT3");
    expect(corrected?.decision).toBe("approved");
    expect(corrected?.date).toBe("2026-09-19");
    expect(corrected?.ekzemplo?.instances[0]?.slots).toEqual({ "icon-start": ["icon"] });
    if (corrected === undefined) throw new Error("unreachable");
    expect(evaluate(corrected).violations).toEqual([]);
  });

  it("a rejected example for butono and for ligilo, each giving exactly one label-required error", () => {
    const rejected = examples.filter((jugxo) => jugxo.decision === "rejected");
    const onlyLabel = rejected.filter(
      (jugxo) =>
        jugxo.ekzemplo?.instances.every(
          (instance) =>
            typeof instance.props.label === "string" &&
            instance.label === undefined &&
            instance.slots === undefined,
        ) === true,
    );
    expect(
      onlyLabel
        .map((jugxo) => [
          jugxo.ekzemplo?.instances[0]?.ero,
          jugxo.ekzemplo?.instances[0]?.props.label,
        ])
        .sort(),
    ).toEqual([
      ["butono", "Konto speichern"],
      ["ligilo", "Team Nord"],
    ]);
    for (const jugxo of onlyLabel) {
      const ero = jugxo.ekzemplo?.instances[0]?.ero ?? "";
      expect(jugxo.ref, jugxo.id).toEqual({ ero: entryOf(ero).ero.id });
      const { violations } = evaluate(jugxo);
      expect(
        violations.map((violation) => violation.issue.rule),
        jugxo.id,
      ).toEqual([RULE]);
      expect(
        violations.map((violation) => violation.issue.severity),
        jugxo.id,
      ).toEqual(["error"]);
      expect(lock.ids[jugxo.id], jugxo.id).toEqual({ status: "active", type: "jugxo" });
    }
  });

  it("an approved Jugxo on the Regulo records the tightening: F-052-4, 2026-11-13, F 4/4 → 0/4", () => {
    const recorded = modelo.jugxoj.filter(
      (jugxo) =>
        "regulo" in jugxo.ref && jugxo.ref.regulo === regulo.id && jugxo.date === "2026-11-13",
    );
    expect(recorded.map((jugxo) => jugxo.decision)).toEqual(["approved"]);
    const [jugxo] = recorded;
    expect(jugxo?.ekzemplo).toBeUndefined();
    expect(jugxo?.kialo).toMatch(/F-052-4/);
    expect(jugxo?.kialo).toMatch(/4\/4/);
    expect(jugxo?.kialo).toMatch(/0\/4/);
    expect(jugxo?.context).toMatch(/Spec 053/);
    expect(lock.ids[jugxo?.id ?? ""]).toEqual({ status: "active", type: "jugxo" });
  });
});
