import { describe, expect, it } from "vitest";
import {
  agordojPorKontrolo,
  gardiModelon,
  KONTROLA_MODELO,
  KONTROLA_PREFIKSO,
  type Kontrolo,
  kontroliKontrolon,
  kontroliModelon,
  MalpermesitaModelo,
  PERMESITA_MODELO,
} from "./index.js";

/** Stands for metiejo's `Provider`: `toString()` is `<provider>/<model>`, the key stays inside. */
const provider = (name: string, model: string) => ({
  key: "geheim-schluessel-1234",
  toString: () => `${name}/${model}`,
});

describe("model guard (D-19)", () => {
  it("allows exactly the one model of the run", () => {
    expect(PERMESITA_MODELO).toBe("mistral/ministral-14b-2512");
    expect(kontroliModelon(provider("mistral", "ministral-14b-2512"))).toEqual([]);
    expect(() => gardiModelon(provider("mistral", "ministral-14b-2512"))).not.toThrow();
  });

  it("refuses any other provider or model with a structured error and no key", () => {
    const others = [
      provider("mistral", "mistral-large-2512"),
      provider("openai", "ministral-14b-2512"),
      provider("openrouter", "mistral/ministral-14b-2512"),
      provider("mistral", "Ministral-14b-2512"),
      provider("mistral", ""),
    ];
    expect(
      others.map((entry) => kontroliModelon(entry).map(({ path, rule }) => ({ path, rule }))),
    ).toEqual(others.map(() => [{ path: "FM_KI_MODELL", rule: "model-not-allowed" }]));

    const refused = provider("openai", "gpt-x");
    let caught: unknown;
    try {
      gardiModelon(refused);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(MalpermesitaModelo);
    const problemo = (caught as MalpermesitaModelo).problemo;
    expect(problemo.rule).toBe("model-not-allowed");
    expect(problemo.message).toContain("openai/gpt-x");
    expect(problemo.message).toContain(PERMESITA_MODELO);
    expect(JSON.stringify(problemo)).not.toContain(refused.key);
    expect(String(caught)).not.toContain(refused.key);
  });
});

describe("the control model exception (Spec 038 A-5, C-3, AK-6)", () => {
  const ministral = provider("mistral", "ministral-14b-2512");
  const sonnet = provider("openrouter", "anthropic/claude-sonnet-5.5");
  const kerno = (problemoj: readonly { path: string; rule: string }[]) =>
    problemoj.map(({ path, rule }) => ({ path, rule }));

  it("names the control model and the run id prefix exactly; the one model stays as it was", () => {
    expect(KONTROLA_MODELO).toBe("openrouter/anthropic/claude-sonnet-5.5");
    expect(KONTROLA_PREFIKSO).toBe("kontrolle-");
    expect(PERMESITA_MODELO).toBe("mistral/ministral-14b-2512");
  });

  it("allows (a) ministral without the option and with any run id that is no control run", () => {
    for (const kontrolo of [undefined, {}, { laufId: "abnahme-komuna-l5-v1" }, { laufId: "x" }]) {
      expect(kontroliModelon(ministral, kontrolo), JSON.stringify(kontrolo)).toEqual([]);
      expect(() => gardiModelon(ministral, kontrolo)).not.toThrow();
    }
    expect(kontroliKontrolon({})).toEqual([]);
    expect(kontroliKontrolon()).toEqual([]);
  });

  it("allows (b) the control model with a run id kontrolle-… and the option naming it exactly", () => {
    const kontrolo: Kontrolo = { laufId: "kontrolle-komuna", kontrolModelo: KONTROLA_MODELO };
    expect(kontroliKontrolon(kontrolo)).toEqual([]);
    expect(kontroliModelon(sonnet, kontrolo)).toEqual([]);
    expect(() => gardiModelon(sonnet, kontrolo)).not.toThrow();
  });

  it("refuses every other combination with one structured problem: path and rule exact", () => {
    const kazoj: [string, ReturnType<typeof provider>, Kontrolo | undefined, string, string][] = [
      // The option without the prefix: a wrong prefix, another id, no id at all.
      [
        "wrong prefix",
        sonnet,
        { laufId: "kontrolle_komuna", kontrolModelo: KONTROLA_MODELO },
        "/lauf-id",
        "control-run-id",
      ],
      [
        "prefix not at the start",
        sonnet,
        { laufId: "x-kontrolle-komuna", kontrolModelo: KONTROLA_MODELO },
        "/lauf-id",
        "control-run-id",
      ],
      [
        "other run id",
        sonnet,
        { laufId: "foo", kontrolModelo: KONTROLA_MODELO },
        "/lauf-id",
        "control-run-id",
      ],
      [
        "option without run id",
        sonnet,
        { kontrolModelo: KONTROLA_MODELO },
        "/lauf-id",
        "control-run-id",
      ],
      // The prefix without the option, whatever the .env says.
      [
        "prefix without option (ministral)",
        ministral,
        { laufId: "kontrolle-x" },
        "/kontroll-modelo",
        "control-model-option",
      ],
      [
        "prefix without option (sonnet in .env)",
        sonnet,
        { laufId: "kontrolle-x" },
        "/kontroll-modelo",
        "control-model-option",
      ],
      // Another model with the option: with and without the prefix.
      [
        "other model with option and prefix",
        provider("openrouter", "other/model"),
        { laufId: "kontrolle-x", kontrolModelo: "openrouter/other/model" },
        "/kontroll-modelo",
        "model-not-allowed",
      ],
      [
        "other model with option, no prefix",
        provider("openrouter", "other/model"),
        { laufId: "foo", kontrolModelo: "openrouter/other/model" },
        "/kontroll-modelo",
        "model-not-allowed",
      ],
      [
        "ministral as the option",
        ministral,
        { laufId: "kontrolle-x", kontrolModelo: PERMESITA_MODELO },
        "/kontroll-modelo",
        "model-not-allowed",
      ],
      [
        "case differs",
        sonnet,
        { laufId: "kontrolle-x", kontrolModelo: "openrouter/anthropic/Claude-Sonnet-5.5" },
        "/kontroll-modelo",
        "model-not-allowed",
      ],
      // The pair is right, but the provider is not the one the option names.
      [
        "pair right, provider from the .env",
        ministral,
        { laufId: "kontrolle-x", kontrolModelo: KONTROLA_MODELO },
        "/kontroll-modelo",
        "model-not-allowed",
      ],
      // Another model without the option.
      [
        "other model, no option",
        provider("mistral", "mistral-large-2512"),
        { laufId: "foo" },
        "FM_KI_MODELL",
        "model-not-allowed",
      ],
      // Sonnet only in the .env, without the option (with or without a plain run id).
      ["sonnet only in .env", sonnet, undefined, "FM_KI_MODELL", "model-not-allowed"],
      [
        "sonnet only in .env, plain id",
        sonnet,
        { laufId: "abnahme-komuna-l5-v1" },
        "FM_KI_MODELL",
        "model-not-allowed",
      ],
    ];
    for (const [nomo, modelo, kontrolo, path, rule] of kazoj) {
      const problemoj = kontroliModelon(modelo, kontrolo);
      expect(kerno(problemoj), nomo).toEqual([{ path, rule }]);
      const [problemo] = problemoj;
      expect(problemo?.message.length, nomo).toBeGreaterThan(0);
      expect(problemo?.suggestion.length, nomo).toBeGreaterThan(0);
      expect(JSON.stringify(problemoj), nomo).not.toContain(modelo.key);
      expect(() => gardiModelon(modelo, kontrolo), nomo).toThrow(MalpermesitaModelo);
    }
  });

  it("checks the pair alone, without a provider, with the same rules", () => {
    expect(kerno(kontroliKontrolon({ laufId: "kontrolle-x" }))).toEqual([
      { path: "/kontroll-modelo", rule: "control-model-option" },
    ]);
    expect(kerno(kontroliKontrolon({ laufId: "foo", kontrolModelo: KONTROLA_MODELO }))).toEqual([
      { path: "/lauf-id", rule: "control-run-id" },
    ]);
    expect(
      kerno(kontroliKontrolon({ laufId: "kontrolle-x", kontrolModelo: "openrouter/other/model" })),
    ).toEqual([{ path: "/kontroll-modelo", rule: "model-not-allowed" }]);
    expect(kerno(kontroliKontrolon({ laufId: "foo" }))).toEqual([]);
  });

  it("points the suggestion of Sonnet in the .env at the two options", () => {
    const [problemo] = kontroliModelon(sonnet);
    expect(problemo?.message).toContain(KONTROLA_MODELO);
    expect(problemo?.suggestion).toContain("--lauf-id kontrolle-");
    expect(problemo?.suggestion).toContain(`--kontroll-modelo ${KONTROLA_MODELO}`);
  });

  it("builds the settings of the control provider from the option, the key stays the .env's", () => {
    const agordoj = {
      FM_KI_ANBIETER: "mistral",
      FM_KI_MODELL: "ministral-14b-2512",
      MISTRAL_API_KEY: "m-geheim",
      OPENROUTER_API_KEY: "o-geheim",
    };
    expect(agordojPorKontrolo(agordoj, KONTROLA_MODELO)).toEqual({
      ...agordoj,
      FM_KI_ANBIETER: "openrouter",
      FM_KI_MODELL: "anthropic/claude-sonnet-5.5",
    });
    // The .env itself is not changed.
    expect(agordoj.FM_KI_ANBIETER).toBe("mistral");
  });
});
