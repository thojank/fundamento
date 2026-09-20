// touch-target-min (Spec 003 T006; WCAG 2.5.8): every size.control.* resolves to at least
// size.target.min in every combination. The threshold is the token, never a literal.

import { describe, expect, it } from "vitest";
import type { Modelo, Regulo } from "../contracts/modelo.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { COMBINATION_CHECKERS } from "./color-reguloj.js";
import type { CombinationContext } from "./combination-reguloj.js";
import { REGULO_ENFORCERS } from "./regularo-enforcement.js";

const px = (value: number) => ({ value: { value, unit: "px" } });

function context(tokens: Record<string, { value: unknown }>): CombinationContext {
  return {
    modelo: {} as Modelo,
    assignment: { aspekto: "komuna", density: "compact" },
    resolution: {
      tokens: tokens as CombinationContext["resolution"]["tokens"],
    } as CombinationContext["resolution"],
    regulo: { name: "touch-target-min" } as Regulo,
  };
}

describe("touch-target-min checker", () => {
  const checker = COMBINATION_CHECKERS["touch-target-min"];

  it("is registered as a combination checker and an enforcer", () => {
    expect(checker).toBeDefined();
    expect(REGULO_ENFORCERS["touch-target-min"]).toBeDefined();
  });

  it("reports a 22 px control below a 24 px target, naming both values", () => {
    const findings = checker?.(
      context({
        "size.target.min": px(24),
        "size.control.small": px(22),
        "size.control.medium": px(32),
      }),
    );
    expect(findings?.map((finding) => [finding.subject, finding.message])).toEqual([
      [
        "size.control.small",
        "size.control.small is 22px, below size.target.min (24px): a pointer target must be at least that wide and high (WCAG 2.5.8).",
      ],
    ]);
  });

  it("reads the threshold from the token: a 30 px target fails a 28 px control", () => {
    const findings = checker?.(
      context({ "size.target.min": px(30), "size.control.small": px(28) }),
    );
    expect(findings?.map((finding) => finding.subject)).toEqual(["size.control.small"]);
  });

  it("passes the repo Modelo in every combination", () => {
    const { modelo } = loadModelo(defaultModeloSource());
    const regulo = modelo?.reguloj.find((candidate) => candidate.name === "touch-target-min");
    expect(regulo).toBeDefined();
    if (modelo === undefined || regulo === undefined) return;
    expect(REGULO_ENFORCERS["touch-target-min"]?.(modelo, regulo)).toEqual([]);
  });
});
