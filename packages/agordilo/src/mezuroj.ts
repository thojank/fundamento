// The measurements of Spec 016 ① (plan ① M1, M2): how close the rule comes to the drawn
// reference brand, and how it holds over the colour wheel. Measurements, not acceptance criteria;
// `pnpm --filter @fundamento/agordilo mezuroj` prints them as the tables of plan.md. Pure.

import { type ColorValue, deltaEOklab, readDtcgColor } from "@fundamento/modelo";
import type { Agordo } from "./agordo.js";
import { type Calibration, referenceTokens, structureModelo } from "./calibration.js";
import { deriveAspekto, floorsOf } from "./derive.js";
import { modeOverrides } from "./package.js";
import { derivePalettes, NEUTRAL_SHARE } from "./palettes.js";
import type { Structure } from "./structure.js";

export interface M1Row {
  token: string;
  mode: "light" | "dark";
  komuna: string;
  derived: string;
  /** ΔE in OKLab × 100 (the usual scale: 2 is about a just noticeable difference). */
  deltaE: number;
}

const hexOf = (color: ColorValue): string =>
  `#${color.components
    .map((channel) =>
      Math.round((channel === "none" ? 0 : channel) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;

/** The Agordo of M1: komuna's lead colour (accent.700) and the tint komuna's neutrals have. */
export function m1Agordo(structure: Structure, calibration: Calibration): Agordo {
  const tokens = referenceTokens(structureModelo(structure), "light");
  const lead = readDtcgColor(tokens["color.palette.accent.700"]?.value);
  const toenung =
    calibration.palettes.neutral.chroma / (calibration.palettes.accent.chroma * NEUTRAL_SHARE);
  return {
    name: "komuna-mezuro",
    leitfarbe: lead === undefined ? "#000000" : hexOf(lead),
    neutral: { toenung: Math.round(Math.min(1, toenung) * 100) / 100 },
  };
}

/** M1: ΔE per step of the palettes derived from komuna's lead colour against komuna. */
export function measureM1(structure: Structure, calibration: Calibration): M1Row[] {
  const modelo = structureModelo(structure);
  const agordo = m1Agordo(structure, calibration);
  const palettes = derivePalettes(agordo, calibration, floorsOf(modelo), modeOverrides(structure));
  const reference = {
    light: referenceTokens(modelo, "light"),
    dark: referenceTokens(modelo, "dark"),
  };
  return [...palettes.steps, ...palettes.overrides].map((step) => {
    const token = `color.palette.${step.palette}.${step.step}`;
    const komuna = readDtcgColor(reference[step.mode][token]?.value) ?? {
      colorSpace: "srgb",
      components: [0, 0, 0],
    };
    const derived: ColorValue = { colorSpace: "srgb", components: [...step.components] };
    return {
      token,
      mode: step.mode,
      komuna: hexOf(komuna),
      derived: step.hex,
      deltaE: Math.round(deltaEOklab(komuna, derived) * 10_000) / 100,
    };
  });
}

/** The ten lead colours of M2: the colour wheel, a yellow, a cyan, very dark, very light, grey. */
export const M2_LEAD_COLOURS: readonly { label: string; leitfarbe: string }[] = [
  { label: "Rot", leitfarbe: "#d7263d" },
  { label: "Orange", leitfarbe: "#f28c28" },
  { label: "Gelb (hell)", leitfarbe: "#f5c400" },
  { label: "Grün", leitfarbe: "#2e8b57" },
  { label: "Cyan", leitfarbe: "#00b8d9" },
  { label: "Blau", leitfarbe: "#1e5bd8" },
  { label: "Violett", leitfarbe: "#7b3fbf" },
  { label: "sehr dunkel", leitfarbe: "#1a1033" },
  { label: "sehr hell", leitfarbe: "#e8f4ff" },
  { label: "ungesättigt", leitfarbe: "#7a7f85" },
];

export interface M2Row {
  label: string;
  leitfarbe: string;
  passed: number;
  failed: number;
  fixed: number;
  adjustable: number;
  /** The violated rules with their count. */
  rules: string;
  /** The distinct suggestions. */
  suggestions: string[];
  exportable: boolean;
}

/** M2: each lead colour derived and checked; pairs passed and failed, violations, suggestions. */
export function measureM2(structure: Structure, calibration: Calibration): M2Row[] {
  return M2_LEAD_COLOURS.map(({ label, leitfarbe }) => {
    const { raporto } = deriveAspekto({ name: "mezuro", leitfarbe }, structure, calibration);
    const counts = new Map<string, number>();
    for (const violation of raporto.violations) {
      counts.set(violation.rule, (counts.get(violation.rule) ?? 0) + 1);
    }
    return {
      label,
      leitfarbe,
      passed: raporto.summary.pairs.passed,
      failed: raporto.summary.pairs.failed,
      fixed: raporto.summary.violations.fixed,
      adjustable: raporto.summary.violations.adjustable,
      rules: [...counts].map(([rule, count]) => `${rule} ${count}`).join(", "),
      suggestions: [...new Set(raporto.violations.map((violation) => violation.suggestion))],
      exportable: raporto.summary.exportable,
    };
  });
}
