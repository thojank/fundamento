import { describe, expect, expectTypeOf, it } from "vitest";
import type {
  DtcgType as GeneratedDtcgType,
  EntityType as GeneratedEntityType,
  TokenRole as GeneratedTokenRole,
} from "../generated/modelo-schema.js";
import {
  CHECK_NAMES,
  type CheckResult,
  DTCG_TYPES,
  type DtcgType,
  ENTITY_ID_PREFIXES,
  ENTITY_TYPES,
  type EntityType,
  entityTypeOfId,
  FUNDAMENTO_EXTENSION_KEY,
  formatIssuePath,
  isRuleId,
  isTokenName,
  JUGXO_DECISIONS,
  KONSTITUCIO_ARTIKOLOJ,
  type ResolveOutcome,
  RULE_IDS,
  readModeloSchema,
  TOKEN_NAME_PATTERN,
  TOKEN_ROLES,
  type TokenRole,
  type ValidationIssue,
} from "./index.js";

describe("token-name grammar (FR-13a)", () => {
  it("is the exact spec pattern", () => {
    expect(TOKEN_NAME_PATTERN.source).toBe("^[a-z0-9]+(\\.[a-z0-9]+)*$");
  });

  it.each(["opacity", "color.action.primary.rest", "color.palette.blue.600", "a.1.b2"])(
    "accepts %s",
    (name) => {
      expect(isTokenName(name)).toBe(true);
    },
  );

  it.each(["", "Color", "color.on-primary", "color_x", "color..x", ".color", "color ", "farbe.ü"])(
    "rejects %j",
    (name) => {
      expect(isTokenName(name)).toBe(false);
    },
  );
});

describe("entity ID prefixes (§2.3)", () => {
  it("maps every entity type to its prefix", () => {
    expect(ENTITY_ID_PREFIXES).toEqual({
      token: "tok",
      tokenSet: "set",
      dimensio: "dim",
      dimensioValoro: "dva",
      regulo: "reg",
      jugxo: "jug",
      kontrastParo: "kpa",
      ero: "ero",
      skemo: "ske",
      sxablono: "sxa",
      projekcio: "prj",
      celo: "cel",
    });
    expect(Object.keys(ENTITY_ID_PREFIXES)).toEqual([...ENTITY_TYPES]);
  });

  it("recovers the entity type from a well-formed ID only", () => {
    expect(entityTypeOfId("dva_01J8Z3K4M5N6P7Q8R9S0T1V2W3")).toBe("dimensioValoro");
    expect(entityTypeOfId("xyz_01J8Z3K4M5N6P7Q8R9S0T1V2W3")).toBeUndefined();
    expect(entityTypeOfId("tok_01J8Z3K4M5N6P7Q8R9S0T1V2W")).toBeUndefined();
    expect(entityTypeOfId("tok_01j8z3k4m5n6p7q8r9s0t1v2w3")).toBeUndefined();
  });
});

describe("rule catalog (§2.6)", () => {
  it("contains every rule ID exactly once", () => {
    expect(new Set(RULE_IDS).size).toBe(RULE_IDS.length);
    expect(RULE_IDS).toHaveLength(114);
    expect(RULE_IDS).toContain("nomregulo-no-target");
    expect(RULE_IDS).toContain("id-namespace-mismatch");
    expect(RULE_IDS).toContain("id-namespace-duplicate");
    for (const rule of [
      "json-duplicate-key",
      "schema-violation",
      "token-name-grammar",
      "alias-unresolvable-in-combination",
      "set-override-ambiguous",
      "id-orphaned",
      "aspekto-metadata-missing",
      "metadata-out-of-sync",
      "resolve-unknown-valoro",
      "jugxo-ref-missing",
      "contrast-advisory",
      "clean-room-foreign-prefix",
      "parity-state-mismatch",
    ]) {
      expect(isRuleId(rule), rule).toBe(true);
    }
    expect(isRuleId("made-up-rule")).toBe(false);
  });

  it("formats located issue paths as <file>#<JSON Pointer>", () => {
    expect(
      formatIssuePath({
        file: "vortaro/sets/core.json",
        pointer: "/color/action/primary/rest/$value",
      }),
    ).toBe("vortaro/sets/core.json#/color/action/primary/rest/$value");
    expect(formatIssuePath({ file: "data/ids.lock.json", pointer: "" })).toBe(
      "data/ids.lock.json#",
    );
  });
});

describe("shared constants", () => {
  it("lists the DTCG 2025.10 types, roles and the extension key", () => {
    expect(DTCG_TYPES).toHaveLength(13);
    expect(TOKEN_ROLES).toEqual([
      "palette",
      "foreground",
      "background",
      "border",
      "focus",
      "shadow",
      "backdrop",
      "disabled",
      "decorative",
    ]);
    expect(FUNDAMENTO_EXTENSION_KEY).toBe("com.ciferecigo.fundamento");
    expect(CHECK_NAMES).toEqual(["vortaro-lint", "parity", "regularo", "alirebleco", "clean-room"]);
  });

  it("shares its union types with the generated schema types", () => {
    expectTypeOf<DtcgType>().toEqualTypeOf<GeneratedDtcgType>();
    expectTypeOf<EntityType>().toEqualTypeOf<GeneratedEntityType>();
    expectTypeOf<TokenRole>().toEqualTypeOf<GeneratedTokenRole>();
  });

  it("types issues, check results and resolve outcomes per §2.5/§2.6/§2.8", () => {
    const issue: ValidationIssue = {
      rule: "alias-cycle",
      severity: "error",
      path: "rezolvo(color-scheme=dark)/color.a",
      message: "Alias cycle color.a -> color.b -> color.a.",
      suggestion: "Point one of the tokens at a literal value.",
      combination: { "color-scheme": "dark" },
    };
    const result: CheckResult = {
      check: "regularo",
      ok: false,
      summary: "1 error",
      errors: [issue],
      warnings: [],
      stats: { reguloj: 2 },
    };
    const outcome: ResolveOutcome = { ok: false, issues: [issue] };
    expect(result.errors[0]?.rule).toBe("alias-cycle");
    expect(outcome.ok).toBe(false);
  });
});

describe("Jugxo vocabulary", () => {
  const defs = readModeloSchema().$defs as Record<string, { properties: Record<string, unknown> }>;

  it("lists the constitution's Articles I to XIII in order", () => {
    expect(KONSTITUCIO_ARTIKOLOJ).toEqual([
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
      "XI",
      "XII",
      "XIII",
    ]);
  });

  it("matches the schema's artikolo enum and decision enum", () => {
    expect(defs.JugxoArtikoloRef?.properties.artikolo).toEqual({
      enum: [...KONSTITUCIO_ARTIKOLOJ],
    });
    expect(defs.Jugxo?.properties.decision).toEqual({ type: "string", enum: [...JUGXO_DECISIONS] });
    expect(JUGXO_DECISIONS).toEqual(["approved", "rejected", "deviation-recorded"]);
  });
});
