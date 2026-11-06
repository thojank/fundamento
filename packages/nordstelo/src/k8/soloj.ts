// Spec 038 2.2 (S038-11, contract C-B): the Sollwerte of K8 from the Modelo. Pure.
//
// The scoring Modelo knows only the reference brand; the other brands live in the Modelo of the
// project config the CSS is built from (D-S038-11-1). So K8 compares against what the browser
// measures from the brand's tokens, and this module gives two things:
// - `sondojDe`: which tokens the probe document measures. Brand-independent: the names of the core
//   set, by token type and by the spacing steps of `listArangxoj`, each with its CSS name from the
//   CSS projection's own naming rule (`cssVariable`, D-S038-11-3).
// - `solojDe`: the Modelo's own Sollwerte of one brand and scheme, resolved with the render's
//   assignment (D-107), for the fixture generator and the cross-check "projection = Modelo".
// No value is written here: no family, colour, length or token path; only token types and the
// groups `listArangxoj` names.

import {
  ASPEKTO_DIMENSIO,
  type Assignment,
  CORE_SET_NAME,
  type DtcgType,
  listArangxoj,
  type Modelo,
  type ResolvedToken,
  resolve,
  rezolvoPath,
  type ValidationIssue,
} from "@fundamento/modelo";
import { cssVariable } from "@fundamento/projekcioj";

/** One token the browser measures in the probe document (D-110, D-S038-11-1). */
export interface SondoPeto {
  token: string;
  css: string;
  eco: "color" | "font-family" | "spacing";
}

/** The Sollwerte of one combination, resolved with the render's assignment (D-107). */
export interface Soloj {
  aspekto: string;
  scheme: "light" | "dark";
  /** First family of each fontFamily token: unquoted, lower case, sorted, unique. */
  familioj: string[];
  /** px of each spacing step of `listArangxoj`: finite, > 0, unique, ascending. */
  interspacoj: number[];
  /** Token paths of every colour token of the combination, sorted (values come from probes). */
  koloroj: string[];
  /** The layout purposes without a means (`listArangxoj(modelo).mankoj`), in its order. */
  mankoj: { celo: string }[];
}

/** A combination the Modelo cannot answer: an unknown brand or a value K8 cannot read. */
export interface SolojProblemo {
  path: string;
  rule: string;
  message: string;
  suggestion: string;
}

/** Thrown by `solojDe`; carries every problem, the first one in its own fields. */
export class SolojEraro extends Error implements SolojProblemo {
  readonly path: string;
  readonly rule: string;
  readonly suggestion: string;
  readonly problemoj: SolojProblemo[];

  constructor(problemoj: SolojProblemo[]) {
    super(problemoj[0]?.message ?? "The combination has no Sollwerte.");
    this.name = "SolojEraro";
    this.path = problemoj[0]?.path ?? "";
    this.rule = problemoj[0]?.rule ?? "";
    this.suggestion = problemoj[0]?.suggestion ?? "";
    this.problemoj = problemoj;
  }
}

/** The probe kind of a token type; types without one are not measured. */
const TIPO_AL_ECO: Partial<Record<DtcgType, SondoPeto["eco"]>> = {
  color: "color",
  fontFamily: "font-family",
};

/** The only length unit of a Modelo dimension (DimensionValue); K8 compares in it. */
const UNUO = "px";

/**
 * The Dimensioj the renderer sets besides the brand (render.ts: `data-fm-color-scheme`,
 * `data-fm-motion`). Contrast, density and every other Dimensio take the Modelo's default: K8
 * measures only at contrast "default", and the renderer sets no density (D-107).
 */
const SCHEME_DIMENSIO = "color-scheme";
const MOTION_DIMENSIO = "motion";
const MOTION_DE_RENDER = "reduced";

/** The core tokens and the spacing steps the probe document measures, sorted by token. */
export function sondojDe(modelo: Modelo): SondoPeto[] {
  const koreo = modelo.setoj.find((set) => set.name === CORE_SET_NAME);
  const petoj: SondoPeto[] = [];
  for (const token of Object.values(koreo?.tokens ?? {})) {
    const eco = TIPO_AL_ECO[token.type];
    if (eco !== undefined) petoj.push({ token: token.name, css: cssVariable(token.name), eco });
  }
  for (const { token } of listArangxoj(modelo).interspacoj)
    petoj.push({ token, css: cssVariable(token), eco: "spacing" });
  return petoj.sort(lauxToken);
}

/**
 * The Modelo's Sollwerte of one brand and scheme. Throws `SolojEraro` when the combination does
 * not resolve (an unknown brand: `resolve-unknown-valoro` at `assignment/aspekto`) or when a value
 * cannot be read as K8 compares it (a spacing step not in px, a family that is no name).
 */
export function solojDe(
  modelo: Modelo,
  kombinacio: { aspekto: string; scheme: "light" | "dark" },
): Soloj {
  const belego: Assignment = {
    [ASPEKTO_DIMENSIO]: kombinacio.aspekto,
    [SCHEME_DIMENSIO]: kombinacio.scheme,
    [MOTION_DIMENSIO]: MOTION_DE_RENDER,
  };
  const rezulto = resolve(modelo, belego);
  if (!rezulto.ok) throw new SolojEraro(problemojDe(rezulto.issues));
  const { assignment, tokens } = rezulto.rezolvo;
  const problemoj: SolojProblemo[] = [];

  const familioj = new Set<string>();
  const koloroj: string[] = [];
  for (const [nomo, token] of Object.entries(tokens)) {
    if (token.type === "color") koloroj.push(nomo);
    if (token.type !== "fontFamily") continue;
    const familio = unuaFamilio(token.value);
    if (familio !== undefined) familioj.add(familio);
    else
      problemoj.push({
        path: rezolvoPath(modelo, assignment, nomo, ""),
        rule: "k8-familio-nelegebla",
        message: `The fontFamily token '${nomo}' resolves to no family name.`,
        suggestion: "Give the token a family name or a list of family names.",
      });
  }

  const interspacoj = new Set<number>();
  for (const { token } of listArangxoj(modelo).interspacoj) {
    const px = pxDe(tokens[token]);
    if (typeof px === "number") {
      if (Number.isFinite(px) && px > 0) interspacoj.add(px);
      continue;
    }
    problemoj.push({
      path: rezolvoPath(modelo, assignment, token, px.unuo === undefined ? "" : "/unit"),
      rule: "k8-interspaco-nelegebla",
      message:
        px.unuo === undefined
          ? `The spacing step '${token}' resolves to no dimension.`
          : `The spacing step '${token}' resolves in '${px.unuo}'; the Modelo states no root font size to convert it.`,
      suggestion: `State the spacing step as a dimension in ${UNUO}.`,
    });
  }
  if (problemoj.length > 0) throw new SolojEraro(problemoj);

  return {
    aspekto: kombinacio.aspekto,
    scheme: kombinacio.scheme,
    familioj: [...familioj].sort(),
    interspacoj: [...interspacoj].sort((a, b) => a - b),
    koloroj: koloroj.sort(),
    mankoj: listArangxoj(modelo).mankoj.map(({ celo }) => ({ celo })),
  };
}

function lauxToken(a: SondoPeto, b: SondoPeto): number {
  if (a.token !== b.token) return a.token < b.token ? -1 : 1;
  return a.eco < b.eco ? -1 : a.eco > b.eco ? 1 : 0;
}

/** The errors of a failed resolution (warnings follow them in `issues`). */
function problemojDe(issues: readonly ValidationIssue[]): SolojProblemo[] {
  const eraroj = issues.filter((issue) => issue.severity === "error");
  return (eraroj.length > 0 ? eraroj : issues).map(({ path, rule, message, suggestion }) => ({
    path,
    rule,
    message,
    suggestion,
  }));
}

/** First family of a fontFamily value (a name or a list): unquoted, lower case (C-A). */
function unuaFamilio(valoro: unknown): string | undefined {
  const unua: unknown = Array.isArray(valoro) ? valoro[0] : valoro;
  if (typeof unua !== "string") return undefined;
  const familio = (unua.split(",")[0] ?? "").trim().replace(/^["']|["']$/g, "");
  return familio === "" ? undefined : familio.toLowerCase();
}

/** px of a resolved dimension, or what kept it from being one. */
function pxDe(token: ResolvedToken | undefined): number | { unuo?: string } {
  const valoro: unknown = token?.value;
  if (typeof valoro !== "object" || valoro === null) return {};
  const { value, unit } = valoro as { value?: unknown; unit?: unknown };
  if (typeof unit !== "string" || typeof value !== "number") return {};
  return unit === UNUO ? value : { unuo: unit };
}
