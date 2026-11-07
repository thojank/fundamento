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
  it("names its constants: F and 0 from the Spec 038 measurement 4, the plan from Reihe K", () => {
    // The spec fixes these numbers (A-4, D-S038-35-1); the source stands in kostoj.ts, not in a test.
    expect([TOKENOJ_EKRANO_RONDO_F, TOKENOJ_EKRANO_RONDO_0, TOKENOJ_PLANO]).toEqual([
      80_011, 5_414, 5_000,
    ]);
  });

  it("computes Variante F from TOKENOJ_EKRANO_RONDO_F per screen-round", () => {
    const takso = taksiKostojn({
      ekranoj: 2,
      rondoj: 3,
      varianto: "F",
      planPeto: false,
      maksTokenoj: 1e6,
    });
    expect(takso.tokenoj).toBe(2 * 3 * TOKENOJ_EKRANO_RONDO_F);
  });

  it("is the mean of what the Spec 038 runs spent per built screen-round (Messung 4)", () => {
    // Spec 038 plan „Messung 4“ (F-S038-28-2), nachher on code head D bfe19023: Variante F spent
    // 2 080 286 tokens in over 26 built screen-rounds (from `penoj`), mean 80 011 exactly.
    // Before (Messung 1.9, S038-26): 459 306 tokens in over 7 built screen-rounds, mean 65 615;
    // before that (Spec 037 S037-10, D-186): 3 × 70 000 + 5 000 covered abnahme-komuna.
    const gemessen = 2_080_286;
    const gebautajRondoj = 26;
    const takso = taksiKostojn({
      ekranoj: 1,
      rondoj: gebautajRondoj,
      varianto: "F",
      planPeto: false,
      maksTokenoj: 1e7,
    });
    expect(takso.tokenoj).toBe(Math.round(gemessen / gebautajRondoj) * gebautajRondoj);
    // Covers the measured sum up to the rounding: less than one token short per screen-round.
    expect(takso.tokenoj).toBeGreaterThan(gemessen - gebautajRondoj);
  });

  it("takes the upper end of the measured Variante 0 range, so it does not underestimate (D-S038-35-1)", () => {
    // Spec 038 plan „Messung 4“: Variante 0 nachher 3 609 (anmelden-und-konto) and 5 414
    // (liste-filter-detail) tokens in per built screen-round.
    const gemessenaj = [3_609, 5_414];
    const takso = taksiKostojn({
      ekranoj: 1,
      rondoj: 1,
      varianto: "0",
      planPeto: false,
      maksTokenoj: 1e6,
    });
    expect(takso.tokenoj).toBe(Math.max(...gemessenaj));
  });

  it("counts screens × rounds × tokens + the plan request and prices them with kostoOf", () => {
    const takso = taksiKostojn({
      ekranoj: 3,
      varianto: "F",
      planPeto: true,
      modelo: PERMESITA_MODELO,
      maksTokenoj: 250_000,
    });
    const tokenoj = 3 * 3 * TOKENOJ_EKRANO_RONDO_F + TOKENOJ_PLANO;
    // Priced at the higher of the input and output price (the estimate does not split).
    const usd = Math.max(
      kostoDe(PERMESITA_MODELO, { enigo: tokenoj, eligo: 0 }).usd ?? Number.NaN,
      kostoDe(PERMESITA_MODELO, { enigo: 0, eligo: tokenoj }).usd ?? Number.NaN,
    );
    expect(takso).toMatchObject({
      ekranoj: 3,
      rondoj: 3,
      tokenoj,
      superasLimon: tokenoj > 250_000,
      maksTokenoj: 250_000,
    });
    expect(takso.superasLimon).toBe(true);
    expect(takso.usd).toBeCloseTo(usd, 10);
    expect(takso.satz).toContain("3 Screens × 3 Runden (Variante F) + Plananfrage");
    expect(takso.satz).toContain(`${new Intl.NumberFormat("de-DE").format(tokenoj)} Tokens`);
    expect(takso.satz).toContain(
      `${new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(usd)} $`,
    );
    expect(takso.satz).toContain("Teilergebnis");
  });

  it("takes the limit of five screens when the plan is still open, Variante 0 its own tokens", () => {
    expect(taksiKostojn({ varianto: "0", planPeto: true, maksTokenoj: 1e6 }).tokenoj).toBe(
      5 * 3 * TOKENOJ_EKRANO_RONDO_0 + TOKENOJ_PLANO,
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
