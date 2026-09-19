// The typography of the Phase-1 Vortaro (Spec 001, FR-04, FR-05, D-02, D-11; task T014).

import { describe, expect, it } from "vitest";
import { aliasTarget, CORE_SET_NAME } from "../contracts/grammar.js";
import type { LoadedToken } from "../contracts/modelo.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { resolve } from "../resolve/resolve.js";

const { modelo } = loadModelo(defaultModeloSource());
const core = modelo?.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};

const ROLES = [
  "display.1",
  "display.2",
  "display.3",
  "headline.1",
  "headline.2",
  "headline.3",
  "headline.4",
  "body.1",
  "body.2",
  "label.1",
  "label.2",
  "caption",
  "code",
  "kicker",
];

function composite(role: string): Record<string, unknown> {
  const token = core[`typography.${role}`] as LoadedToken | undefined;
  expect(token?.type, role).toBe("typography");
  return token?.value as Record<string, unknown>;
}

describe("typography roles (FR-04, D-02)", () => {
  it.each(ROLES)("typography.%s aliases role tokens for size, line height and tracking", (role) => {
    const value = composite(role);
    expect(aliasTarget(value.fontSize)).toBe(`font.size.${role}`);
    expect(aliasTarget(value.lineHeight)).toBe(`font.lineheight.${role}`);
    expect(aliasTarget(value.letterSpacing)).toBe(`font.tracking.${role}`);
    expect(aliasTarget(value.fontFamily)).toMatch(/^font\.family\.(display|body|code)$/);
    expect(aliasTarget(value.fontWeight)).toMatch(/^font\.weight\./);
  });

  it("puts the kicker in capitals with positive tracking (D-11)", () => {
    expect(core["typography.kicker"]?.textTransform).toBe("uppercase");
    expect(aliasTarget(core["font.tracking.kicker"]?.value)).toBe("font.tracking.scale.caps");
  });

  it("keeps size and tracking scales on the same steps (D-11, K-review)", () => {
    const sizeSteps = Object.keys(core)
      .filter((name) => name.startsWith("font.size.scale."))
      .map((name) => name.slice("font.size.scale.".length));
    expect(sizeSteps).toHaveLength(12);
    for (const step of sizeSteps) {
      expect(core[`font.tracking.scale.${step}`]?.type, step).toBe("dimension");
    }
  });

  it("keeps the Phase-0 IDs of the renamed body tokens (FR-14)", () => {
    expect(core["typography.body.1"]?.id).toBe("tok_01M2VEEE0QJXF3E9TY0JX4XVC6");
    expect(core["font.size.body.1"]?.id).toBe("tok_01M2VEEE0QJXF3E9TY0JX4XVBY");
    expect(core["font.lineheight.body.1"]?.id).toBe("tok_01M2VEEE0QJXF3E9TY0JX4XVC1");
    for (const old of ["typography.body", "font.size.body", "font.lineheight.body"]) {
      expect(core[old], old).toBeUndefined();
    }
  });

  it("names Geist and Geist Mono with generic fallbacks (FR-05)", () => {
    expect(core["font.family.display"]?.value).toEqual(["Geist", "system-ui", "sans-serif"]);
    expect(core["font.family.body"]?.value).toEqual(["Geist", "system-ui", "sans-serif"]);
    expect(core["font.family.code"]?.value).toEqual(["Geist Mono", "ui-monospace", "monospace"]);
  });
});

describe("typography across Dimensioj (AK-05 as amended, K3)", () => {
  const resolved = (assignment: Record<string, string>) => {
    if (modelo === undefined) throw new Error("repo did not load");
    const outcome = resolve(modelo, assignment);
    if (!outcome.ok) throw new Error(JSON.stringify(outcome.issues));
    return outcome.rezolvo.tokens;
  };

  it("viewport=compact changes display sizes and tracking, with provenance per field", () => {
    const medium = resolved({})["typography.display.1"];
    const compact = resolved({ viewport: "compact" })["typography.display.1"];
    expect(compact?.value).not.toEqual(medium?.value);
    expect(compact?.fieldAliases?.["/fontSize"]?.[0]).toEqual({
      set: "viewport/compact",
      token: "font.size.display.1",
    });
    expect(compact?.fieldAliases?.["/letterSpacing"]?.[0]).toEqual({
      set: "viewport/compact",
      token: "font.tracking.display.1",
    });
  });

  it("density leaves every typography role unchanged (K3)", () => {
    for (const density of ["compact", "comfortable"]) {
      const tokens = resolved({ density });
      const reference = resolved({});
      for (const role of ROLES) {
        expect(tokens[`typography.${role}`]?.value, `${density} ${role}`).toEqual(
          reference[`typography.${role}`]?.value,
        );
      }
    }
  });

  it("reports the kicker's textTransform with the set that states it", () => {
    expect(resolved({})["typography.kicker"]?.textTransform).toEqual({
      value: "uppercase",
      set: "core",
    });
    expect(resolved({})["typography.body.1"]?.textTransform).toBeUndefined();
  });
});
