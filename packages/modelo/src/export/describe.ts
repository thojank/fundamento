// The S6 "what is here?" answer, computed from `modelo.json` alone (AK-06, Art. III/VII). Pure,
// so the Gvidanto and the conformance suite can reuse it on any export.

import type { ModeloJson } from "../contracts/modelo.js";

const WORDS = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
] as const;

/** A count as an English word for 0 to 12 (`no` for zero), otherwise as digits. */
export function countWord(count: number): string {
  return WORDS[count] ?? String(count);
}

function counted(count: number, singular: string, plural: string): string {
  return `${countWord(count)} ${count === 1 ? singular : plural}`;
}

/** The facts of the S6 dialog, every one derived from the export. */
export interface ModeloDescription {
  version: string;
  /** Dimensio names in export (priority) order. */
  dimensioj: string[];
  /** Aspekto names in export order. */
  aspektoj: string[];
  tokenCount: number;
  /** Distinct types among the inventoried tokens. */
  typeCount: number;
  reguloCount: number;
  /** Reguloj with a non-blank kialo. */
  reguloWithKialoCount: number;
  eroCount: number;
  /** One-sentence answer, e.g. "Fundamento v0.1.0: six Dimensioj (…), one Aspekto `komuna`, …". */
  sentence: string;
}

/** Answers "what is here?" (S6) from a parsed `modelo.json`. Pure. */
export function describeModelo(modelo: ModeloJson): ModeloDescription {
  const version = modelo.fundamento.version;
  const dimensioj = modelo.dimensioj.map((dimensio) => dimensio.name);
  const aspektoj = modelo.aspektoj.map((aspekto) => aspekto.name);
  const tokenCount = modelo.tokens.length;
  const typeCount = new Set(modelo.tokens.map((token) => token.type)).size;
  const reguloCount = modelo.reguloj.length;
  const reguloWithKialoCount = modelo.reguloj.filter((regulo) => regulo.kialo.trim() !== "").length;
  const eroCount = modelo.eroj.length;

  const dimensioPart = `${counted(dimensioj.length, "Dimensio", "Dimensioj")}${
    dimensioj.length === 0 ? "" : ` (${dimensioj.join(", ")})`
  }`;
  const aspektoPart = `${counted(aspektoj.length, "Aspekto", "Aspektoj")}${
    aspektoj.length === 0 ? "" : ` ${aspektoj.map((name) => `\`${name}\``).join(", ")}`
  }`;
  const tokenPart = `${tokenCount} ${tokenCount === 1 ? "token" : "tokens"} in ${counted(typeCount, "type", "types")}`;
  const reguloPart =
    reguloWithKialoCount === reguloCount
      ? `${counted(reguloCount, "rule", "rules")} with reasons`
      : `${counted(reguloCount, "rule", "rules")}, ${countWord(reguloWithKialoCount)} with reasons`;
  const eroPart = counted(eroCount, "Ero", "Eroj");

  return {
    version,
    dimensioj,
    aspektoj,
    tokenCount,
    typeCount,
    reguloCount,
    reguloWithKialoCount,
    eroCount,
    sentence: `Fundamento v${version}: ${dimensioPart}, ${aspektoPart}, ${tokenPart}, ${reguloPart}, ${eroPart}.`,
  };
}
