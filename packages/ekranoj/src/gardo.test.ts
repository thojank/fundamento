import { describe, expect, it } from "vitest";
import { gardiModelon, kontroliModelon, MalpermesitaModelo, PERMESITA_MODELO } from "./index.js";

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
