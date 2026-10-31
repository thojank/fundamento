// The model guard (D-19): Spec 037 runs one model only. The guard compares `provider.toString()`
// of metiejo's `Provider` (`<provider>/<model>`, never the key) and refuses anything else before
// the first request, with a structured error.

import type { Problemo } from "./tipoj.js";

/** The one model of Spec 037 (D-19), in the form of `Provider.toString()`. */
export const PERMESITA_MODELO = "mistral/ministral-14b-2512";

/** Anything that names itself `<provider>/<model>` – metiejo's `Provider` does. */
export interface NomitaModelo {
  toString(): string;
}

/** [] when the model is the allowed one, otherwise one problem. */
export function kontroliModelon(provider: NomitaModelo): Problemo[] {
  const nomo = provider.toString();
  if (nomo === PERMESITA_MODELO) return [];
  const [name, ...model] = PERMESITA_MODELO.split("/");
  return [
    {
      path: "FM_KI_MODELL",
      rule: "model-not-allowed",
      message: `Das Modell „${nomo}“ ist nicht erlaubt; erlaubt ist nur ${PERMESITA_MODELO}.`,
      suggestion: `In der .env FM_KI_ANBIETER=${name} und FM_KI_MODELL=${model.join("/")} setzen.`,
    },
  ];
}

/** Refused before any request: carries the problem, never the key. */
export class MalpermesitaModelo extends Error {
  readonly problemo: Problemo;

  constructor(problemo: Problemo) {
    super(problemo.message);
    this.name = "MalpermesitaModelo";
    this.problemo = problemo;
  }
}

/** Throws `MalpermesitaModelo` unless the model is the allowed one. */
export function gardiModelon(provider: NomitaModelo): void {
  const [problemo] = kontroliModelon(provider);
  if (problemo !== undefined) throw new MalpermesitaModelo(problemo);
}
