// The model guard (D-19): Spec 037 runs one model only. The guard compares `provider.toString()`
// of metiejo's `Provider` (`<provider>/<model>`, never the key) and refuses anything else before
// the first request, with a structured error. Spec 038 A-5 (C-3, D-244): the one narrow exception
// is the control run – a run id with the prefix `kontrolle-` and the explicit option
// `--kontroll-modelo` naming exactly `KONTROLA_MODELO`; every other combination is refused.

import type { Problemo } from "./tipoj.js";

/** The one model of Spec 037 (D-19), in the form of `Provider.toString()`. */
export const PERMESITA_MODELO = "mistral/ministral-14b-2512";

/** The control model of Spec 038 (D-244; OpenRouter ID verified in S038-31, recorded in the plan). */
export const KONTROLA_MODELO = "openrouter/anthropic/claude-sonnet-5.5";

/** The run id prefix of the control run (A-5): only such a run may use `KONTROLA_MODELO`. */
export const KONTROLA_PREFIKSO = "kontrolle-";

/** Anything that names itself `<provider>/<model>` – metiejo's `Provider` does. */
export interface NomitaModelo {
  toString(): string;
}

/** The run id and the control model option of a call (`--lauf-id`, `--kontroll-modelo`). */
export interface Kontrolo {
  laufId?: string;
  kontrolModelo?: string;
}

/** The control pair alone, without a provider (C-3): [] or one problem. */
export function kontroliKontrolon(_kontrolo: Kontrolo = {}): Problemo[] {
  throw new Error("S038-36: kontroliKontrolon is not implemented yet");
}

/** [] when the model is the allowed one, otherwise one problem. */
export function kontroliModelon(provider: NomitaModelo, _kontrolo?: Kontrolo): Problemo[] {
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

/**
 * The settings a provider of the control run is built from: the values of the .env with
 * `FM_KI_ANBIETER`/`FM_KI_MODELL` taken from `--kontroll-modelo` (the key stays the .env's).
 */
export function agordojPorKontrolo(
  _agordoj: Readonly<Record<string, string | undefined>>,
  _kontrolModelo: string,
): Record<string, string | undefined> {
  throw new Error("S038-36: agordojPorKontrolo is not implemented yet");
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
export function gardiModelon(provider: NomitaModelo, kontrolo?: Kontrolo): void {
  const [problemo] = kontroliModelon(provider, kontrolo);
  if (problemo !== undefined) throw new MalpermesitaModelo(problemo);
}
