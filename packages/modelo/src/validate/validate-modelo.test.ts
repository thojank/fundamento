// validateModelo (FUND-3.2, FR-06, AK-02): positive fixtures validate clean; every negative fixture
// fails with exactly its expected (rule, path) pairs. Negative tests assert path and rule, not prose.

import { rmSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import type { RuleId, ValidationIssue } from "../contracts/issues.js";
import { fixtureModeloSource } from "../load/source.js";
import {
  fixtureRoot,
  modeloValidationFixtures,
  mutatedFixture,
  mutatedMinimal,
} from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

const pairs = (issues: readonly ValidationIssue[]): { rule: string; path: string }[] =>
  issues.map(({ rule, path }) => ({ rule, path }));

const byPathThenRule = (
  a: { rule: string; path: string },
  b: { rule: string; path: string },
): number =>
  a.path < b.path ? -1 : a.path > b.path ? 1 : a.rule < b.rule ? -1 : a.rule > b.rule ? 1 : 0;

const validateFixture = (kind: "valid" | "invalid", name: string) =>
  validateModelo(fixtureModeloSource(fixtureRoot(kind, name)));

const tempRoots: string[] = [];
const validateMutation = (...args: Parameters<typeof mutatedMinimal>) => {
  const root = mutatedMinimal(...args);
  tempRoots.push(root);
  return validateModelo(fixtureModeloSource(root));
};
afterAll(() => {
  for (const root of tempRoots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("positive fixtures", () => {
  it.each(["minimal", "resolve-matrix"])("valid/%s has no errors and no warnings", (name) => {
    const report = validateFixture("valid", name);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
    expect(report.valid).toBe(true);
  });

  it("valid/resolve-tie has no errors and exactly the expected ambiguity warning", () => {
    const report = validateFixture("valid", "resolve-tie");
    expect(report.errors).toEqual([]);
    expect(report.valid).toBe(true);
    expect(pairs(report.warnings)).toEqual([
      {
        rule: "set-override-ambiguous",
        path: "rezolvo(aspekto=neutra,color-scheme=dark,contrast=high)/color.text.default",
      },
    ]);
    expect(report.warnings[0]?.severity).toBe("warning");
    expect(report.warnings[0]?.combination).toEqual({
      aspekto: "neutra",
      "color-scheme": "dark",
      contrast: "high",
    });
  });

  it("fills the summary counts", () => {
    expect(validateFixture("valid", "minimal").summary).toEqual({
      tokens: 8,
      types: 2,
      setoj: 4,
      dimensioj: 2,
      combinations: 4,
      reguloj: 1,
      jugxoj: 0,
      kontrastParoj: 1,
    });
  });
});

describe("negative fixtures", () => {
  const fixtures = modeloValidationFixtures();

  it("AK-02: covers at least the required cases", () => {
    const names = fixtures.map((fixture) => fixture.name);
    expect(names.length).toBeGreaterThanOrEqual(8);
    for (const required of [
      "modelo-name-grammar",
      "modelo-type-unknown",
      "modelo-value-invalid",
      "modelo-alias-target-missing",
      "modelo-alias-type-mismatch",
      "resolve-cross-set-cycle",
      "ids-duplicate",
      "ids-retired-reused",
      "modelo-set-introduces-token",
      "modelo-kondicxoj-contradictory",
      "modelo-set-changes-type",
      "json-duplicate-token-in-set",
    ]) {
      expect(names).toContain(required);
    }
  });

  it("has a negative fixture for every rule this pipeline owns", () => {
    const covered = new Set(
      fixtures.flatMap((fixture) => fixture.expected.issues.map((issue) => issue.rule)),
    );
    const owned: RuleId[] = [
      "json-syntax",
      "json-duplicate-key",
      "schema-violation",
      "token-name-grammar",
      "token-type-unknown",
      "token-value-invalid",
      "alias-target-missing",
      "alias-type-mismatch",
      "alias-cycle",
      "alias-unresolvable-in-combination",
      "set-introduces-token",
      "set-changes-type",
      "set-kondicxoj-contradictory",
      "set-kondicxoj-unknown",
      "set-name-mismatch",
      "set-override-has-extensions",
      "id-duplicate",
      "id-retired-reused",
      "dimensio-default-invalid",
      "dimensio-priority-invalid",
      "kontrast-sojloj-invalid",
      "aspekto-metadata-missing",
      "themes-out-of-sync",
      "metadata-out-of-sync",
      "regulo-kialo-missing",
      "jugxo-ref-missing",
      "kontrastparo-token-missing",
      "kontrastparo-not-color",
      "kontrastparo-background-transparent",
    ];
    expect(owned.filter((rule) => !covered.has(rule))).toEqual([]);
  });

  describe.each(fixtures.map((fixture) => [fixture.name, fixture.expected] as const))(
    "invalid/%s",
    (name, expected) => {
      const report = validateFixture("invalid", name);

      it("fails with exactly the expected errors (rule and path)", () => {
        expect(report.valid).toBe(false);
        expect(pairs(report.errors)).toEqual([...expected.issues].sort(byPathThenRule));
      });

      it("has exactly the expected warnings", () => {
        expect(pairs(report.warnings)).toEqual([...(expected.warnings ?? [])].sort(byPathThenRule));
      });

      it("names a message and a suggestion for every issue", () => {
        for (const issue of [...report.errors, ...report.warnings]) {
          expect(issue.message.trim()).not.toBe("");
          expect(issue.suggestion.trim()).not.toBe("");
          expect(issue.severity).toBe(report.errors.includes(issue) ? "error" : "warning");
        }
      });
    },
  );

  it.each([
    ["regularo-without-kialo", "regulo-kialo-missing", "data/reguloj.json#/reguloj/0/kialo"],
    ["regularo-dangling-jugxo", "jugxo-ref-missing", "data/jugxoj.json#/jugxoj/0/ref/regulo"],
  ])("agrees with pnpm check:regularo on invalid/%s", (name, rule, path) => {
    expect(pairs(validateFixture("invalid", name).errors)).toEqual([{ rule, path }]);
  });

  it("reports the transparent background at the first failing combination", () => {
    const [issue] = validateFixture("invalid", "modelo-kontrastparo-background-transparent").errors;
    expect(issue?.combination).toEqual({ "color-scheme": "dark", contrast: "default" });
  });

  it("reports the cross-set cycle only for its combination", () => {
    const [issue] = validateFixture("invalid", "resolve-cross-set-cycle").errors;
    expect(issue?.combination).toEqual({ "color-scheme": "dark" });
  });

  it("suggests the themes command for drift", () => {
    for (const name of ["modelo-themes-out-of-sync", "modelo-metadata-out-of-sync"]) {
      const [issue] = validateFixture("invalid", name).errors;
      expect(issue?.suggestion).toContain("pnpm vortaro:themes");
    }
  });
});

describe("rule variants", () => {
  type DimensiojJson = {
    dimensioj: { priority: unknown; valoroj: Record<string, unknown>[] }[];
  };
  type SetJson = {
    $extensions: Record<string, { kondicxoj: string[] }>;
    spacing: Record<string, Record<string, unknown>>;
  };

  const JUG_ID = "jug_01K5FMAJ0M0000000000000000";
  const withArtikoloJugxo = (artikolo: string) =>
    validateMutation((edit) => {
      edit("data/ids.lock.json", (v: { ids: Record<string, unknown> }) => {
        v.ids[JUG_ID] = { status: "active", type: "jugxo" };
      });
      edit("data/jugxoj.json", () => ({
        jugxoj: [
          {
            id: JUG_ID,
            ref: { artikolo },
            decision: "deviation-recorded",
            kialo: "A recorded deviation from the constitution.",
            date: "2026-09-19",
            context: "Validation test.",
          },
        ],
      }));
    });

  it("accepts a Jugxo that references a constitution Article", () => {
    const report = withArtikoloJugxo("X");
    expect(report.errors).toEqual([]);
    expect(report.summary.jugxoj).toBe(1);
  });

  // A Jugxo that belongs to a Celo names it beside the reference (AK-12, narrowed 2026-09-20).
  it("accepts a Jugxo that names its Celo beside the Article", () => {
    const report = validateMutation((edit) => {
      edit("data/ids.lock.json", (v: { ids: Record<string, unknown> }) => {
        v.ids[JUG_ID] = { status: "active", type: "jugxo" };
      });
      edit("data/jugxoj.json", () => ({
        jugxoj: [
          {
            id: JUG_ID,
            ref: { artikolo: "VIII", celo: "figma" },
            decision: "deviation-recorded",
            kialo: "A recorded deviation from the constitution.",
            date: "2026-09-20",
            context: "Validation test.",
          },
        ],
      }));
    });
    expect(report.errors).toEqual([]);
    expect(report.summary.jugxoj).toBe(1);
  });

  it("reports an unknown Article once, at ref/artikolo", () => {
    expect(withArtikoloJugxo("XIV").errors.map(({ rule, path }) => ({ rule, path }))).toEqual([
      { rule: "jugxo-ref-missing", path: "data/jugxoj.json#/jugxoj/0/ref/artikolo" },
    ]);
  });

  it("reports a duplicate priority at the later Dimensio", () => {
    const report = validateMutation((edit) =>
      edit("data/dimensioj.json", (v: DimensiojJson) => {
        const second = v.dimensioj[1];
        if (second !== undefined) second.priority = 1;
      }),
    );
    expect(pairs(report.errors)).toEqual([
      { rule: "dimensio-priority-invalid", path: "data/dimensioj.json#/dimensioj/1/priority" },
    ]);
  });

  it("reports a repeated kondicxo as contradictory", () => {
    const report = validateMutation((edit) =>
      edit("vortaro/sets/contrast/high.json", (v: SetJson) => {
        const extension = v.$extensions["com.ciferecigo.fundamento"];
        if (extension !== undefined) extension.kondicxoj = ["contrast=high", "contrast=high"];
      }),
    );
    // Two conditions also change the set's specificity, so the generated metadata drifts too.
    expect(pairs(report.errors)).toEqual([
      { rule: "metadata-out-of-sync", path: "vortaro/$metadata.json#" },
      {
        rule: "set-kondicxoj-contradictory",
        path: "vortaro/sets/contrast/high.json#/$extensions/com.ciferecigo.fundamento/kondicxoj/1",
      },
    ]);
  });

  it("reports kontrastSojloj on a Dimensio other than contrast", () => {
    const report = validateMutation((edit) =>
      edit("data/dimensioj.json", (v: DimensiojJson) => {
        const dark = v.dimensioj[0]?.valoroj[1];
        if (dark !== undefined) {
          dark.kontrastSojloj = { wcag2: { "text-normal": 4.5, "text-large": 3, ui: 3 } };
        }
      }),
    );
    expect(pairs(report.errors)).toEqual([
      {
        rule: "kontrast-sojloj-invalid",
        path: "data/dimensioj.json#/dimensioj/0/valoroj/1/kontrastSojloj",
      },
    ]);
  });

  it("reports a hyphenated key with a corrected name", () => {
    const report = validateMutation((edit) =>
      edit("vortaro/sets/core.json", (v: SetJson) => {
        v.spacing = { small: v.spacing.small ?? {}, "extra-large": v.spacing.medium ?? {} };
      }),
    );
    expect(pairs(report.errors)).toEqual([
      { rule: "token-name-grammar", path: "vortaro/sets/core.json#/spacing/extra-large" },
    ]);
    expect(report.errors[0]?.suggestion).toContain("spacing.extra.large");
  });

  it("reports a token without any type once", () => {
    const report = validateMutation((edit) =>
      edit("vortaro/sets/core.json", (v: SetJson) => {
        delete v.spacing.small?.$type;
      }),
    );
    expect(pairs(report.errors)).toEqual([
      { rule: "token-type-missing", path: "vortaro/sets/core.json#/spacing/small" },
    ]);
  });

  it("reports a blank kialo at the kialo", () => {
    const report = validateMutation((edit) =>
      edit("data/reguloj.json", (v: { reguloj: Record<string, unknown>[] }) => {
        const regulo = v.reguloj[0];
        if (regulo !== undefined) regulo.kialo = "   ";
      }),
    );
    expect(pairs(report.errors)).toEqual([
      { rule: "regulo-kialo-missing", path: "data/reguloj.json#/reguloj/0/kialo" },
    ]);
  });

  it("reports a missing data file and stops", () => {
    const report = validateMutation((_edit, root) => unlinkSync(join(root, "data/reguloj.json")));
    expect(pairs(report.errors)).toEqual([{ rule: "file-missing", path: "data/reguloj.json#" }]);
    expect(report.valid).toBe(false);
    expect(report.summary.tokens).toBe(0);
  });

  it("reports an invalid value of an explicitly typed token once (no Ajv cascade)", () => {
    const report = validateMutation((edit) =>
      edit("vortaro/sets/core.json", (v: SetJson) => {
        const small = v.spacing.small;
        if (small !== undefined) small.$value = { value: "4", unit: "rem" };
      }),
    );
    expect(pairs(report.errors)).toEqual([
      { rule: "token-value-invalid", path: "vortaro/sets/core.json#/spacing/small/$value" },
    ]);
  });
});

describe("determinism", () => {
  it("returns identical reports on repeated runs, sorted by path", () => {
    const first = validateFixture("invalid", "modelo-alias-unresolvable");
    const second = validateFixture("invalid", "modelo-alias-unresolvable");
    expect(second).toEqual(first);
    expect(pairs(first.errors)).toEqual([...pairs(first.errors)].sort(byPathThenRule));
  });
});

describe("KontrastParo aux members (Spec 002, T011)", () => {
  const aux = (auxPair: Record<string, string>) => {
    const root = mutatedFixture("regularo-kombinoj", (edit) =>
      edit("data/kontrastparoj.json", (file: { kontrastParoj: Record<string, unknown>[] }) => {
        file.kontrastParoj.push({
          id: "kpa_01M2WRK8G0GGGGGGGGGGGGGGG1",
          name: "action-primary-on-background",
          foreground: "color.action.primary.rest",
          background: "color.background.default",
          kategorio: "ui",
          aux: auxPair,
          kialo: "A border carries the pair.",
        });
      }),
    );
    auxRoots.push(root);
    return validateModelo(fixtureModeloSource(root))
      .errors.filter((issue) => issue.rule.startsWith("kontrastparo-"))
      .map((issue) => [issue.rule, issue.path]);
  };
  const auxRoots: string[] = [];
  afterAll(() => {
    for (const root of auxRoots) rmSync(root, { recursive: true, force: true });
  });

  it("reports an aux token that is no core token", () => {
    expect(aux({ foreground: "color.missing", background: "color.background.default" })).toEqual([
      ["kontrastparo-token-missing", "data/kontrastparoj.json#/kontrastParoj/1/aux/foreground"],
    ]);
  });

  it("reports an aux token that is no colour", () => {
    expect(aux({ foreground: "color.text.default", background: "spacing.small" })).toEqual([
      ["kontrastparo-not-color", "data/kontrastparoj.json#/kontrastParoj/1/aux/background"],
    ]);
  });
});
