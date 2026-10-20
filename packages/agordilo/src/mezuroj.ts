// The measurements of Spec 016 ① (plan ① M1, M2): how close the rule comes to the drawn
// reference brand, and how it holds over the colour wheel; and M4 of Spec 019 ①: the corners of
// every slider, the example brands and ten random Agordos. Measurements, not acceptance criteria;
// `pnpm --filter @fundamento/agordilo mezuroj` prints them as the tables of plan.md. Pure.

import { type ColorValue, deltaEOklab, readDtcgColor } from "@fundamento/modelo";
import type { Agordo } from "./agordo.js";
import { type Calibration, referenceTokens, structureModelo } from "./calibration.js";
import { deriveAspekto, floorsOf } from "./derive.js";
import { gestaltBasis, gestaltSliders, IKONO_GEWICHTE } from "./gestalt.js";
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

/** M4 (Spec 019 ①): the corner values of the sliders, the two example brands, random Agordos. */
export interface M4Row {
  label: string;
  /** The fields of the Agordo beside its name, compact. */
  agordo: string;
  passed: number;
  failed: number;
  /** Hints of stage 2 (agordilo-body-size, -border-collapse, -shadow-none) and all hints. */
  gestaltHints: string;
  hints: number;
  fixed: number;
  adjustable: number;
  /** The violated rules with their count. */
  rules: string;
  exportable: boolean;
}

/** The lead colour of M4's corner rows: komuna's own (accent.700), so only the slider moves. */
export const M4_LEAD = "#375479";

/** The sliders of stage 1 with their ranges (Spec 016, G4), for the corners of M4. */
const STAGE1_SLIDERS = [
  { path: "neutral.toenung", min: 0, max: 1 },
  { path: "regler.helligkeit", min: -1, max: 1 },
  { path: "regler.kontrast", min: -1, max: 1 },
  { path: "regler.saettigung", min: 0, max: 2 },
] as const;

function withSlider(agordo: Agordo, path: string, value: number): Agordo {
  const [group, key] = path.split(".") as [string, string];
  const record = agordo as unknown as Record<string, Record<string, unknown> | undefined>;
  return { ...agordo, [group]: { ...(record[group] ?? {}), [key]: value } } as Agordo;
}

/** A small seeded generator (mulberry32): the same ten random Agordos on every run. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fixed3 = (value: number): number => Math.round(value * 1000) / 1000;

/** The Agordos of M4, with a label each (seed 19 for the random ones). */
export function m4Agordos(
  structure: Structure,
  examples: readonly Agordo[] = [],
): {
  label: string;
  agordo: Agordo;
}[] {
  const sliders = gestaltSliders(gestaltBasis(structure.files));
  const base: Agordo = { name: "mezuro", leitfarbe: M4_LEAD };
  const rows: { label: string; agordo: Agordo }[] = [{ label: "Standard", agordo: base }];
  for (const slider of [...STAGE1_SLIDERS, ...sliders]) {
    for (const end of ["min", "max"] as const) {
      rows.push({
        label: `${slider.path} ${end} (${slider[end]})`,
        agordo: withSlider(base, slider.path, slider[end]),
      });
    }
  }
  for (const gewicht of IKONO_GEWICHTE.filter((weight) => weight !== "regular")) {
    rows.push({ label: `ikono.gewicht ${gewicht}`, agordo: { ...base, ikono: { gewicht } } });
  }
  for (const end of ["min", "max"] as const) {
    let agordo = base;
    for (const slider of sliders) agordo = withSlider(agordo, slider.path, slider[end]);
    rows.push({ label: `alle Form-Regler ${end}`, agordo });
  }
  for (const example of examples) rows.push({ label: example.name, agordo: example });
  const random = seededRandom(19);
  for (let index = 1; index <= 10; index += 1) {
    const l = fixed3(0.35 + random() * 0.35);
    const c = fixed3(0.04 + random() * 0.14);
    const h = fixed3(random() * 360);
    let agordo: Agordo = { name: `zufall-${index}`, leitfarbe: `oklch(${l} ${c} ${h})` };
    for (const slider of [...STAGE1_SLIDERS, ...sliders]) {
      agordo = withSlider(
        agordo,
        slider.path,
        fixed3(slider.min + random() * (slider.max - slider.min)),
      );
    }
    const gewicht = IKONO_GEWICHTE[Math.floor(random() * IKONO_GEWICHTE.length)] ?? "regular";
    rows.push({ label: `Zufall ${index}`, agordo: { ...agordo, ikono: { gewicht } } });
  }
  return rows;
}

const GESTALT_HINTS = ["agordilo-body-size", "agordilo-border-collapse", "agordilo-shadow-none"];

/** M4: every Agordo of m4Agordos derived and checked. */
export function measureM4(
  structure: Structure,
  calibration: Calibration,
  examples: readonly Agordo[] = [],
): M4Row[] {
  return m4Agordos(structure, examples).map(({ label, agordo }) => {
    const { raporto, exportable } = deriveAspekto(agordo, structure, calibration);
    const counts = new Map<string, number>();
    for (const violation of raporto.violations) {
      counts.set(violation.rule, (counts.get(violation.rule) ?? 0) + 1);
    }
    const { name: _name, ...fields } = agordo;
    return {
      label,
      agordo: JSON.stringify(fields),
      passed: raporto.summary.pairs.passed,
      failed: raporto.summary.pairs.failed,
      gestaltHints:
        raporto.hints
          .filter((hint) => GESTALT_HINTS.includes(hint.rule))
          .map((hint) => `${hint.rule.replace("agordilo-", "")} ${hint.subject}`)
          .join(", ") || "–",
      hints: raporto.summary.hints,
      fixed: raporto.summary.violations.fixed,
      adjustable: raporto.summary.violations.adjustable,
      rules: [...counts].map(([rule, count]) => `${rule} ${count}`).join(", "),
      exportable,
    };
  });
}
