// The prices of the language models (Spec 033 S6): data with the date they were read and the page
// they were read on (data/prezoj.json), in US dollars – tokens per million, speech per minute. A
// pattern with * stands for a family (openrouter/*:free). A model without a price has none: the
// counter and the estimate say so instead of counting it as free.

import { readFileSync } from "node:fs";

export interface Prezo {
  /** provider/model, as Provider.toString() writes it; * matches any text. */
  modelo: string;
  /** Dollars per million input tokens. */
  enigo?: number;
  /** Dollars per million output tokens. */
  eligo?: number;
  /** Dollars per minute of audio. */
  minuto?: number;
  dato: string;
  fonto: string;
}

export interface PrezojDatoj {
  kialo: string;
  modeloj: Prezo[];
}

export const PREZOJ_URL = new URL("../../data/prezoj.json", import.meta.url);
export const PREZOJ: PrezojDatoj = JSON.parse(readFileSync(PREZOJ_URL, "utf8")) as PrezojDatoj;

const matches = (pattern: string, modelo: string) =>
  new RegExp(
    `^${pattern
      .split("*")
      .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
      .join(".*")}$`,
  ).test(modelo);

/** The price of a model: its own entry first, then a pattern. */
export function prezoOf(modelo: string, prezoj: PrezojDatoj = PREZOJ): Prezo | undefined {
  return (
    prezoj.modeloj.find((prezo) => prezo.modelo === modelo) ??
    prezoj.modeloj.find((prezo) => prezo.modelo.includes("*") && matches(prezo.modelo, modelo))
  );
}

/** Dollars for tokens and seconds of audio; undefined without a price. */
export function kostoOf(
  modelo: string,
  uzo: { enigo: number; eligo: number; sekundoj?: number },
  prezoj: PrezojDatoj = PREZOJ,
): number | undefined {
  const prezo = prezoOf(modelo, prezoj);
  if (prezo === undefined) return undefined;
  return (
    (uzo.enigo * (prezo.enigo ?? 0)) / 1e6 +
    (uzo.eligo * (prezo.eligo ?? 0)) / 1e6 +
    ((uzo.sekundoj ?? 0) / 60) * (prezo.minuto ?? 0)
  );
}
