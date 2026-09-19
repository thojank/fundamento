// Skemo ↔ Vortaro rules (Spec 003 T005; FR-04, plan D-03, data-model §4, AK-01). Each case is a
// copy of valid/ero-minimal with one change; the rule, the path and the message are exact.

import { describe, expect, it } from "vitest";
import { fixtureModeloSource } from "../load/source.js";
import { fixtureRoot, mutatedFixture } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";

const FILE = "data/eroj/butono/skemo.json";
const ERO_ID = "ero_01M2XM2NGN3KJSKJ4JTXQWMF72";

type EroFile = {
  skemo: {
    props: { name: string; kind: string; values?: string[] }[];
    states: string[];
    parts: Record<string, Record<string, Record<string, unknown>>>;
    bindings: { part: string; property: string; when?: Record<string, string>; token: string }[];
    constraints?: unknown[];
    intents?: unknown[];
  };
};

function issuesOf(change: (file: EroFile) => void, extra?: (edit: never) => void) {
  const root = mutatedFixture("ero-minimal", (edit) => {
    edit(FILE, (value: EroFile) => {
      change(value);
      return value;
    });
    extra?.(edit as never);
  });
  const report = validateModelo(fixtureModeloSource(root));
  return [...report.errors, ...report.warnings].map((issue) => ({
    rule: issue.rule,
    path: issue.path,
    message: issue.message,
  }));
}

describe("valid/ero-minimal", () => {
  it("passes every Skemo rule", () => {
    expect(validateModelo(fixtureModeloSource(fixtureRoot("valid", "ero-minimal"))).errors).toEqual(
      [],
    );
  });
});

describe("Skemo ↔ Vortaro rules (T005)", () => {
  it("skemo-token-missing: a fixed token that core does not define", () => {
    expect(
      issuesOf((file) => {
        (file.skemo.parts.label as Record<string, unknown>).color = { fixed: "color.text.missing" };
      }),
    ).toEqual([
      {
        rule: "skemo-token-missing",
        path: `${FILE}#/skemo/parts/label/color/fixed`,
        message:
          "Skemo of butono binds label.color to color.text.missing, which core does not define.",
      },
    ]);
  });

  it("skemo-token-type: a dimension bound to a colour property", () => {
    expect(
      issuesOf((file) => {
        (file.skemo.parts.label as Record<string, unknown>).color = { fixed: "spacing.small" };
      }),
    ).toEqual([
      {
        rule: "skemo-token-type",
        path: `${FILE}#/skemo/parts/label/color/fixed`,
        message:
          "Skemo of butono binds label.color to spacing.small of type dimension; color needs a token of type color.",
      },
    ]);
  });

  it("skemo-binding-missing: a variant value without a surface fill", () => {
    expect(
      issuesOf((file) => {
        const variant = file.skemo.props[0];
        if (variant !== undefined) variant.values = ["primary", "secondary"];
      }),
    ).toEqual([
      {
        rule: "skemo-binding-missing",
        path: `${FILE}#/skemo/parts/surface/fill`,
        message:
          "Skemo of butono has no binding for surface.fill when variant=secondary, state=rest.",
      },
    ]);
  });

  it("a state without its own binding inherits rest", () => {
    expect(
      issuesOf((file) => {
        file.skemo.states = ["rest", "hover"];
      }),
    ).toEqual([]);
  });

  it("skemo-binding-invalid: a binding keyed by an unknown prop", () => {
    expect(
      issuesOf((file) => {
        const binding = file.skemo.bindings[0];
        if (binding !== undefined) binding.when = { ...binding.when, size: "large" };
      }),
    ).toEqual([
      {
        rule: "skemo-binding-invalid",
        path: `${FILE}#/skemo/bindings/0/when/size`,
        message:
          "Skemo of butono keys a binding by size, which is neither an enum or boolean prop nor state.",
      },
    ]);
  });

  it("skemo-kontrastparo-missing: a label-on-surface pair that is not declared", () => {
    expect(
      issuesOf((file) => {
        const binding = file.skemo.bindings[0];
        if (binding !== undefined) binding.token = "color.palette.neutral.0";
      }),
    ).toEqual([
      {
        rule: "skemo-kontrastparo-missing",
        path: `${FILE}#/skemo/bindings/0`,
        message:
          "Skemo of butono puts label.color (color.text.default) on surface.fill (color.palette.neutral.0) when variant=primary, state=rest, but no KontrastParo declares that pair.",
      },
    ]);
  });

  it("skemo-kontrastparo-missing skips the disabled state", () => {
    expect(
      issuesOf((file) => {
        file.skemo.states = ["rest", "disabled"];
        file.skemo.bindings.push({
          part: "surface",
          property: "fill",
          when: { state: "disabled" },
          token: "color.palette.neutral.0",
        });
      }),
    ).toEqual([]);
  });

  it("skemo-constraint-invalid: a constraint on an unknown prop", () => {
    expect(
      issuesOf((file) => {
        file.skemo.constraints = [
          { when: { tone: "danger" }, allowed: { variant: ["primary"] }, kialo: "Filled only." },
        ];
      }),
    ).toEqual([
      {
        rule: "skemo-constraint-invalid",
        path: `${FILE}#/skemo/constraints/0/when/tone`,
        message: "Skemo of butono constrains tone, which is not a prop of butono.",
      },
    ]);
  });

  it("skemo-intent-invalid: an intent with a value the prop does not allow and an unknown Regulo", () => {
    expect(
      issuesOf((file) => {
        file.skemo.intents = [
          {
            intent: "confirm",
            keywords: { en: ["save"] },
            props: { variant: "ghost" },
            regulo: "no-such-regulo",
          },
        ];
      }),
    ).toEqual([
      {
        rule: "skemo-intent-invalid",
        path: `${FILE}#/skemo/intents/0/props/variant`,
        message: "Intent confirm of butono sets variant=ghost; variant allows primary.",
      },
      {
        rule: "skemo-intent-invalid",
        path: `${FILE}#/skemo/intents/0/regulo`,
        message: "Intent confirm of butono cites the Regulo no-such-regulo, which does not exist.",
      },
    ]);
  });

  it("jugxo-ekzemplo-invalid: an example instance with a value the Skemo does not allow", () => {
    expect(
      issuesOf(
        () => {},
        (edit: (file: string, change: (value: { jugxoj: unknown[] }) => unknown) => void) => {
          edit("data/jugxoj.json", (value) => {
            value.jugxoj.push({
              id: "jug_01M2XKF38358Z6WQH9KARYJ6F3",
              ref: { ero: ERO_ID },
              decision: "rejected",
              kialo: "A made-up variant.",
              date: "2026-09-19",
              context: "Fixture for jugxo-ekzemplo-invalid.",
              ekzemplo: { instances: [{ ero: "butono", props: { variant: "ghost" } }] },
            });
            return value;
          });
        },
      ).filter((issue) => !issue.rule.startsWith("id-")),
    ).toEqual([
      {
        rule: "jugxo-ekzemplo-invalid",
        path: "data/jugxoj.json#/jugxoj/0/ekzemplo/instances/0/props/variant",
        message:
          "Example instance 0 of Jugxo jug_01M2XKF38358Z6WQH9KARYJ6F3 sets variant=ghost; butono allows primary.",
      },
    ]);
  });

  it("a Jugxo may refer to an existing Ero (no longer dangling)", () => {
    expect(
      issuesOf(
        () => {},
        (edit: (file: string, change: (value: { jugxoj: unknown[] }) => unknown) => void) => {
          edit("data/jugxoj.json", (value) => {
            value.jugxoj.push({
              id: "jug_01M2XKF38358Z6WQH9KARYJ6F3",
              ref: { ero: ERO_ID },
              decision: "approved",
              kialo: "One primary in the dialog.",
              date: "2026-09-19",
              context: "Fixture.",
            });
            return value;
          });
        },
      ).filter((issue) => !issue.rule.startsWith("id-")),
    ).toEqual([]);
  });
});
