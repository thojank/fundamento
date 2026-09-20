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

/** One Aspekto as the dialog names it. */
export interface AspektoDetail {
  name: string;
  reference: boolean;
  external: boolean;
  license: string;
  /** The first declared font family, if any. */
  font?: string;
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
  /** Reguloj that validation enforces (checkability automatic; Spec 002 FR-14). */
  reguloAutomaticCount: number;
  eroCount: number;
  jugxoCount: number;
  /** Token count per top-level group (`color`, `typography`, …), groups sorted by name. */
  tokensByGroup: Record<string, number>;
  /** Package Aspektoj with their flags, license and first font family (D-14). */
  aspektoDetails: AspektoDetail[];
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
  const reguloAutomaticCount = modelo.reguloj.filter(
    (regulo) => regulo.checkability === "automatic",
  ).length;
  const eroCount = modelo.eroj.length;
  const jugxoCount = modelo.jugxoj.length;
  const tokensByGroup: Record<string, number> = {};
  for (const group of modelo.tokens.map((token) => token.name.split(".")[0] ?? "").sort()) {
    tokensByGroup[group] = (tokensByGroup[group] ?? 0) + 1;
  }
  const aspektoDetails: AspektoDetail[] = modelo.aspektoj.flatMap((aspekto) => {
    if (aspekto.reference === undefined || aspekto.license === undefined) return [];
    const detail: AspektoDetail = {
      name: aspekto.name,
      reference: aspekto.reference,
      external: aspekto.external === true,
      license: aspekto.license,
    };
    const font = aspekto.fonts?.[0]?.family;
    if (font !== undefined) detail.font = font;
    return [detail];
  });
  const details = new Map(aspektoDetails.map((detail) => [detail.name, detail]));

  const dimensioPart = `${counted(dimensioj.length, "Dimensio", "Dimensioj")}${
    dimensioj.length === 0 ? "" : ` (${dimensioj.join(", ")})`
  }`;
  const aspektoPart = `${counted(aspektoj.length, "Aspekto", "Aspektoj")}${
    aspektoj.length === 0
      ? ""
      : ` (${aspektoj.map((name) => describeAspekto(name, details.get(name))).join("; ")})`
  }`;
  const groups = Object.entries(tokensByGroup)
    .map(([group, count]) => `${group} ${count}`)
    .join(", ");
  const tokenPart = `${tokenCount} ${tokenCount === 1 ? "token" : "tokens"} in ${counted(typeCount, "type", "types")}${
    groups === "" ? "" : ` (${groups})`
  }`;
  const automaticPart = `(${reguloAutomaticCount === 0 ? "none" : countWord(reguloAutomaticCount)} automatic)`;
  const reguloPart =
    reguloWithKialoCount === reguloCount
      ? `${counted(reguloCount, "rule", "rules")} with reasons ${automaticPart}`
      : `${counted(reguloCount, "rule", "rules")}, ${countWord(reguloWithKialoCount)} with reasons ${automaticPart}`;
  const eroNames = modelo.eroj.map((ero) => `\`${ero.name}\``).join(", ");
  const eroPart = `${counted(eroCount, "Ero", "Eroj")}${eroNames === "" ? "" : ` (${eroNames})`}`;

  return {
    version,
    dimensioj,
    aspektoj,
    tokenCount,
    typeCount,
    reguloCount,
    reguloWithKialoCount,
    reguloAutomaticCount,
    eroCount,
    jugxoCount,
    tokensByGroup,
    aspektoDetails,
    sentence: `Fundamento v${version}: ${dimensioPart}, ${aspektoPart}, ${tokenPart}, ${reguloPart}, ${counted(jugxoCount, "Jugxo", "Jugxoj")}, ${eroPart}. Ask explain why a value is what it is.`,
  };
}

/** "`komuna`: reference, MIT, Geist"; an Aspekto without package metadata is named only. */
function describeAspekto(name: string, detail: AspektoDetail | undefined): string {
  if (detail === undefined) return `\`${name}\``;
  const facts = [
    detail.reference ? "reference" : detail.external ? "external" : "included",
    detail.license,
    ...(detail.font === undefined ? [] : [detail.font]),
  ];
  return `\`${name}\`: ${facts.join(", ")}`;
}
