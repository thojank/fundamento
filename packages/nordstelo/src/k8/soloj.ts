// Spec 038 2.2 (S038-11, contract C-B): the Sollwerte of K8 from the Modelo. Red stub: the
// signatures only, so the tests load; the green commit brings the implementation.

import type { Modelo } from "@fundamento/modelo";

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
  familioj: string[];
  interspacoj: number[];
  koloroj: string[];
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
    super(problemoj[0]?.message ?? "S038-11: not implemented");
    this.name = "SolojEraro";
    this.path = problemoj[0]?.path ?? "";
    this.rule = problemoj[0]?.rule ?? "";
    this.suggestion = problemoj[0]?.suggestion ?? "";
    this.problemoj = problemoj;
  }
}

export function sondojDe(_modelo: Modelo): SondoPeto[] {
  throw new Error("S038-11: not implemented");
}

export function solojDe(
  _modelo: Modelo,
  _kombinacio: { aspekto: string; scheme: "light" | "dark" },
): Soloj {
  throw new Error("S038-11: not implemented");
}
