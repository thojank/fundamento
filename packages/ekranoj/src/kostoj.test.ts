// Costs (D-20, AC-9): the estimate before the start and the budget check before every request.

import { Budget, CostLimitReached, DayLimitReached } from "@fundamento/metiejo";
import { describe, expect, it } from "vitest";
import {
  haltigoDe,
  kostoDe,
  PERMESITA_MODELO,
  sendiSubBudgxeto,
  TOKENOJ_EKRANO_RONDO_0,
  TOKENOJ_EKRANO_RONDO_F,
  TOKENOJ_PLANO,
  taksiKostojn,
} from "./index.js";
import { respondo, SkriptaModelo } from "./test-doubles/chat.js";
import type { ChatModel } from "./tipoj.js";

describe("estimate (D-20)", () => {
  it("names its constants: F from the acceptance runs of S037-10, 0 and the plan from Reihe K", () => {
    expect([TOKENOJ_EKRANO_RONDO_F, TOKENOJ_EKRANO_RONDO_0, TOKENOJ_PLANO]).toEqual([
      70_000, 2_000, 5_000,
    ]);
  });

  it("covers what the acceptance run komuna spent on a plan and three screen-rounds (S037-10 Befund 2)", () => {
    // abnahme-komuna: plan request + 3 built screen-rounds = 210 402 tokens in + 2 995 out.
    const gemessen = 210_402 + 2_995;
    const takso = taksiKostojn({
      ekranoj: 1,
      rondoj: 3,
      varianto: "F",
      planPeto: true,
      maksTokenoj: 250_000,
    });
    expect(takso.tokenoj).toBeGreaterThanOrEqual(gemessen);
  });

  it("counts screens × rounds × tokens + the plan request and prices them with kostoOf", () => {
    const takso = taksiKostojn({
      ekranoj: 3,
      varianto: "F",
      planPeto: true,
      modelo: PERMESITA_MODELO,
      maksTokenoj: 250_000,
    });
    expect(takso).toMatchObject({
      ekranoj: 3,
      rondoj: 3,
      tokenoj: 635_000,
      superasLimon: true,
      maksTokenoj: 250_000,
    });
    expect(takso.usd).toBeCloseTo(0.127, 10);
    expect(takso.satz).toContain("3 Screens × 3 Runden (Variante F) + Plananfrage");
    expect(takso.satz).toContain("635.000 Tokens");
    expect(takso.satz).toContain("0,127 $");
    expect(takso.satz).toContain("Teilergebnis");
  });

  it("takes the limit of five screens when the plan is still open, Variante 0 its own tokens", () => {
    expect(taksiKostojn({ varianto: "0", planPeto: true, maksTokenoj: 1e6 }).tokenoj).toBe(
      5 * 3 * 2_000 + 5_000,
    );
  });

  it("says „Kosten unbekannt“ for a model without a price or without a name, never 0", () => {
    for (const modelo of ["mistral/ein-modell-ohne-preis", undefined]) {
      const takso = taksiKostojn({
        ekranoj: 1,
        varianto: "F",
        planPeto: false,
        ...(modelo === undefined ? {} : { modelo }),
        maksTokenoj: 1e6,
      });
      expect(takso.usd).toBeUndefined();
      expect(takso.satz).toContain("Kosten unbekannt");
    }
    expect(kostoDe("mistral/ein-modell-ohne-preis", { enigo: 10, eligo: 10 })).toEqual({});
    expect(kostoDe(undefined, { enigo: 10, eligo: 10 })).toEqual({});
    expect(kostoDe(PERMESITA_MODELO, { enigo: 1e6, eligo: 1e6 }).usd).toBeCloseTo(0.4, 10);
  });
});

describe("budget (AC-9)", () => {
  it("stops before the request whose estimate would pass the limit", async () => {
    const chat = new SkriptaModelo(() => respondo("ok", { input: 60, output: 40 }));
    const budget = new Budget(150);
    await sendiSubBudgxeto(chat, budget, [{ role: "user", content: "a" }]);
    await expect(
      sendiSubBudgxeto(chat, budget, [{ role: "user", content: "b" }]),
    ).rejects.toBeInstanceOf(CostLimitReached);
    expect(chat.petoj).toHaveLength(1);
    expect(budget.spent).toBe(100);
  });

  it("charges a model that does not charge the budget itself, once", async () => {
    const chat: ChatModel = { send: async () => respondo("ok", { input: 7, output: 3 }) };
    const budget = new Budget(1_000);
    await sendiSubBudgxeto(chat, budget, []);
    const charging = new SkriptaModelo(() => respondo("ok", { input: 7, output: 3 }));
    await sendiSubBudgxeto(charging, budget, []);
    expect(budget.spent).toBe(20);
  });

  it("maps the stop errors to the stop reason", () => {
    expect(haltigoDe(new CostLimitReached(1, 1))).toBe("max-tokens");
    expect(haltigoDe(new DayLimitReached("mistral", 1))).toBe("tagolimo");
    expect(haltigoDe(new Error("Anbieter antwortet 500"))).toBeUndefined();
  });
});
