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

const KONTROLA_SUGESTO = `--lauf-id ${KONTROLA_PREFIKSO}<name> --kontroll-modelo ${KONTROLA_MODELO}`;

/**
 * The control pair alone, without a provider (C-3): [] or one problem. The option must name exactly
 * `KONTROLA_MODELO` (`model-not-allowed`), only a run id `kontrolle-…` may carry it
 * (`control-run-id`), and a run id `kontrolle-…` needs it (`control-model-option`).
 */
export function kontroliKontrolon(kontrolo: Kontrolo = {}): Problemo[] {
  const { laufId, kontrolModelo } = kontrolo;
  const kontrolLauf = laufId?.startsWith(KONTROLA_PREFIKSO) === true;
  if (kontrolModelo !== undefined && kontrolModelo !== KONTROLA_MODELO) {
    return [
      {
        path: "/kontroll-modelo",
        rule: "model-not-allowed",
        message: `--kontroll-modelo „${kontrolModelo}“ ist nicht erlaubt; der Kontrolllauf nimmt nur ${KONTROLA_MODELO}.`,
        suggestion: `--kontroll-modelo ${KONTROLA_MODELO} angeben oder die Option weglassen (dann gilt ${PERMESITA_MODELO} aus der .env).`,
      },
    ];
  }
  if (kontrolModelo !== undefined && !kontrolLauf) {
    return [
      {
        path: "/lauf-id",
        rule: "control-run-id",
        message: `--kontroll-modelo gilt nur für einen Kontrolllauf; die Lauf-ID ${laufId === undefined ? "fehlt" : `„${laufId}“ beginnt nicht mit ${KONTROLA_PREFIKSO}`}.`,
        suggestion: `${KONTROLA_SUGESTO} angeben, oder --kontroll-modelo weglassen.`,
      },
    ];
  }
  if (kontrolModelo === undefined && kontrolLauf) {
    return [
      {
        path: "/kontroll-modelo",
        rule: "control-model-option",
        message: `Die Lauf-ID „${laufId}“ ist ein Kontrolllauf, aber --kontroll-modelo fehlt.`,
        suggestion: `${KONTROLA_SUGESTO} angeben, oder eine Lauf-ID ohne ${KONTROLA_PREFIKSO} wählen.`,
      },
    ];
  }
  return [];
}

/**
 * [] when the model may run, otherwise one problem: (a) `PERMESITA_MODELO` without the option and
 * without a control run id, or (b) a control run id with `--kontroll-modelo KONTROLA_MODELO` and
 * the provider built from it. Every other combination is refused.
 */
export function kontroliModelon(provider: NomitaModelo, kontrolo?: Kontrolo): Problemo[] {
  const paro = kontroliKontrolon(kontrolo);
  if (paro.length > 0) return paro;
  const nomo = provider.toString();
  if (kontrolo?.kontrolModelo !== undefined) {
    if (nomo === KONTROLA_MODELO) return [];
    return [
      {
        path: "/kontroll-modelo",
        rule: "model-not-allowed",
        message: `Der Kontrolllauf nimmt ${KONTROLA_MODELO}, gebaut ist aber „${nomo}“.`,
        suggestion: `Den Anbieter des Kontrolllaufs aus --kontroll-modelo ${KONTROLA_MODELO} bauen (Schlüssel OPENROUTER_API_KEY in der .env).`,
      },
    ];
  }
  if (nomo === PERMESITA_MODELO) return [];
  const [name, ...model] = PERMESITA_MODELO.split("/");
  return [
    {
      path: "FM_KI_MODELL",
      rule: "model-not-allowed",
      message: `Das Modell „${nomo}“ ist nicht erlaubt; erlaubt ist nur ${PERMESITA_MODELO}.`,
      suggestion:
        nomo === KONTROLA_MODELO
          ? `${KONTROLA_MODELO} läuft nur als Kontrolllauf: ${KONTROLA_SUGESTO} angeben und in der .env FM_KI_ANBIETER=${name} und FM_KI_MODELL=${model.join("/")} lassen.`
          : `In der .env FM_KI_ANBIETER=${name} und FM_KI_MODELL=${model.join("/")} setzen.`,
    },
  ];
}

/**
 * The settings a provider of the control run is built from: the values of the .env with
 * `FM_KI_ANBIETER`/`FM_KI_MODELL` taken from `--kontroll-modelo` (the key stays the .env's).
 */
export function agordojPorKontrolo(
  agordoj: Readonly<Record<string, string | undefined>>,
  kontrolModelo: string,
): Record<string, string | undefined> {
  const [anbieter = "", ...modelo] = kontrolModelo.split("/");
  return { ...agordoj, FM_KI_ANBIETER: anbieter, FM_KI_MODELL: modelo.join("/") };
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

/** Throws `MalpermesitaModelo` unless the model may run (`kontroliModelon`). */
export function gardiModelon(provider: NomitaModelo, kontrolo?: Kontrolo): void {
  const [problemo] = kontroliModelon(provider, kontrolo);
  if (problemo !== undefined) throw new MalpermesitaModelo(problemo);
}
