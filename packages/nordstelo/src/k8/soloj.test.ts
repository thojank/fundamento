// The Sollwerte of K8 (Spec 038 Lauf 2, 2.2, AC-L2-3, AC-L2-9): the probe requests name every
// colour, font family and spacing token of the core set by its CSS name, the same for every Modelo
// (D-S038-11-1); the Sollwerte per brand and scheme are the Modelo's own, resolved with the render's
// assignment (D-107); an unknown brand is a structured error; and the source holds no value.

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  ASPEKTO_DIMENSIO,
  CORE_SET_NAME,
  defaultModeloSource,
  listArangxoj,
  loadModelo,
  type Modelo,
  projectModeloSource,
  referenceAspektoOf,
  resolve,
} from "@fundamento/modelo";
import { cssVariable } from "@fundamento/projekcioj";
import { describe, expect, it } from "vitest";
import { ASPEKTOJ } from "../render.js";
import { SolojEraro, type SondoPeto, solojDe, sondojDe } from "./soloj.js";

const SCHEMES = ["light", "dark"] as const;

const CXIUJ_CONFIG = fileURLToPath(
  new URL(
    "../../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
    import.meta.url,
  ),
);

function sxargi(source: Parameters<typeof loadModelo>[0], kio: string): Modelo {
  const { modelo } = loadModelo(source);
  if (modelo === undefined) throw new Error(`${kio} must load`);
  return modelo;
}

const cxiujModelo = sxargi(projectModeloSource(CXIUJ_CONFIG), "the cxiuj-config Modelo");
const defaultModelo = sxargi(defaultModeloSource(), "the repository Modelo");

/** First family of a fontFamily value (string or list): unquoted, lower case. */
function unuaFamilio(valoro: unknown): string | undefined {
  const unua = Array.isArray(valoro) ? valoro[0] : valoro;
  if (typeof unua !== "string") return undefined;
  const familio = (unua.split(",")[0] ?? "").trim().replace(/^["']|["']$/g, "");
  return familio === "" ? undefined : familio.toLowerCase();
}

/** Every family of a fontFamily value, lower case (for the literal guard). */
function cxiujFamilioj(valoro: unknown): string[] {
  const listo = Array.isArray(valoro) ? valoro : [valoro];
  return listo
    .filter((ero): ero is string => typeof ero === "string")
    .flatMap((ero) => ero.split(","))
    .map((ero) =>
      ero
        .trim()
        .replace(/^["']|["']$/g, "")
        .toLowerCase(),
    )
    .filter((ero) => ero !== "");
}

/** The test's own resolution of a combination, with D-107 spelled out. */
function rezolvo(modelo: Modelo, aspekto: string, scheme: "light" | "dark") {
  const rezulto = resolve(modelo, {
    [ASPEKTO_DIMENSIO]: aspekto,
    "color-scheme": scheme,
    contrast: "default",
    motion: "reduced",
  });
  if (!rezulto.ok) throw new Error(`${aspekto}/${scheme} must resolve`);
  return rezulto.rezolvo;
}

/** The Sollwerte recomputed in the test from `resolve` (no fixed numbers). */
function atenditaj(modelo: Modelo, aspekto: string, scheme: "light" | "dark") {
  const { tokens } = rezolvo(modelo, aspekto, scheme);
  const familioj = new Set<string>();
  const koloroj: string[] = [];
  for (const [nomo, token] of Object.entries(tokens)) {
    if (token.type === "color") koloroj.push(nomo);
    if (token.type === "fontFamily") {
      const familio = unuaFamilio(token.value);
      if (familio !== undefined) familioj.add(familio);
    }
  }
  const interspacoj = new Set<number>();
  for (const { token } of listArangxoj(modelo).interspacoj) {
    const valoro = tokens[token]?.value as { value: number; unit: string } | undefined;
    if (valoro?.unit === "px" && Number.isFinite(valoro.value) && valoro.value > 0)
      interspacoj.add(valoro.value);
  }
  return {
    aspekto,
    scheme,
    familioj: [...familioj].sort(),
    interspacoj: [...interspacoj].sort((a, b) => a - b),
    koloroj: koloroj.sort(),
    mankoj: listArangxoj(modelo).mankoj.map(({ celo }) => ({ celo })),
  };
}

const kombinacioj = ASPEKTOJ.flatMap((aspekto) => SCHEMES.map((scheme) => ({ aspekto, scheme })));

describe("solojDe: the Sollwerte per brand and scheme (D-107)", () => {
  it("equals the recomputation from resolve for every brand × scheme of the cxiuj Modelo", () => {
    const malsamaj: string[] = [];
    for (const { aspekto, scheme } of kombinacioj) {
      const soloj = solojDe(cxiujModelo, { aspekto, scheme });
      const atendo = atenditaj(cxiujModelo, aspekto, scheme);
      if (JSON.stringify(soloj) !== JSON.stringify(atendo)) malsamaj.push(`${aspekto}/${scheme}`);
    }
    expect(malsamaj).toEqual([]);
  });

  it("resolves with the Modelo's default density (the renderer sets none)", () => {
    const densa = cxiujModelo.dimensioj.find((dimensio) => dimensio.name === "density");
    const malsamaj: string[] = [];
    for (const { aspekto, scheme } of kombinacioj) {
      if (rezolvo(cxiujModelo, aspekto, scheme).assignment.density !== densa?.default)
        malsamaj.push(`${aspekto}/${scheme}`);
    }
    expect(densa).toBeDefined();
    expect(malsamaj).toEqual([]);
  });

  it("gives every colour token path and one family per fontFamily token at most", () => {
    const koreo = cxiujModelo.setoj.find((set) => set.name === CORE_SET_NAME);
    const tokens = Object.values(koreo?.tokens ?? {});
    const koloroj = tokens.filter((token) => token.type === "color").length;
    const familioj = tokens.filter((token) => token.type === "fontFamily").length;
    const malsamaj: string[] = [];
    for (const { aspekto, scheme } of kombinacioj) {
      const soloj = solojDe(cxiujModelo, { aspekto, scheme });
      if (soloj.koloroj.length !== koloroj) malsamaj.push(`${aspekto}/${scheme} koloroj`);
      if (soloj.familioj.length === 0 || soloj.familioj.length > familioj)
        malsamaj.push(`${aspekto}/${scheme} familioj`);
    }
    expect(koloroj).toBeGreaterThan(0);
    expect(malsamaj).toEqual([]);
  });

  it("has strictly ascending, finite spacing steps > 0", () => {
    const malsamaj: string[] = [];
    for (const { aspekto, scheme } of kombinacioj) {
      const { interspacoj } = solojDe(cxiujModelo, { aspekto, scheme });
      if (interspacoj.length === 0) malsamaj.push(`${aspekto}/${scheme}: empty`);
      for (const [indekso, valoro] of interspacoj.entries()) {
        const antaux = interspacoj[indekso - 1];
        if (!Number.isFinite(valoro) || valoro <= 0)
          malsamaj.push(`${aspekto}/${scheme}: ${valoro}`);
        if (antaux !== undefined && antaux >= valoro)
          malsamaj.push(`${aspekto}/${scheme}: ${antaux} >= ${valoro}`);
      }
    }
    expect(malsamaj).toEqual([]);
  });

  it("takes the mankoj from listArangxoj", () => {
    const atendo = listArangxoj(cxiujModelo).mankoj.map(({ celo }) => celo);
    const malsamaj: string[] = [];
    for (const { aspekto, scheme } of kombinacioj) {
      const celoj = solojDe(cxiujModelo, { aspekto, scheme }).mankoj.map(({ celo }) => celo);
      if (JSON.stringify(celoj) !== JSON.stringify(atendo)) malsamaj.push(`${aspekto}/${scheme}`);
    }
    expect(malsamaj).toEqual([]);
  });

  it("answers the reference brand from the repository Modelo as well", () => {
    const referenco = referenceAspektoOf(defaultModelo);
    expect(referenco).toBeDefined();
    for (const scheme of SCHEMES) {
      const aspekto = referenco ?? "";
      expect(solojDe(defaultModelo, { aspekto, scheme })).toEqual(
        atenditaj(defaultModelo, aspekto, scheme),
      );
    }
  });

  it("refuses an unknown brand with a structured error, not an empty list", () => {
    const nekonata = `${ASPEKTOJ.join("-")}-nekonata`;
    const kaptita = kaptu(() => solojDe(cxiujModelo, { aspekto: nekonata, scheme: "light" }));
    expect(kaptita).toBeInstanceOf(SolojEraro);
    const eraro = kaptita as SolojEraro;
    expect(eraro.path).toBe(`assignment/${ASPEKTO_DIMENSIO}`);
    expect(eraro.rule).toBe("resolve-unknown-valoro");
    expect(eraro.message).toContain(nekonata);
    expect(ASPEKTOJ.filter((aspekto) => !eraro.suggestion.includes(aspekto))).toEqual([]);
    expect(eraro.problemoj.length).toBeGreaterThan(0);
  });

  it("refuses a brand the repository Modelo does not know (D-S038-11-1)", () => {
    const fremdaj = ASPEKTOJ.filter(
      (aspekto) =>
        !resolve(defaultModelo, { [ASPEKTO_DIMENSIO]: aspekto }).ok &&
        resolve(cxiujModelo, { [ASPEKTO_DIMENSIO]: aspekto }).ok,
    );
    const malsamaj: string[] = [];
    for (const aspekto of fremdaj) {
      const kaptita = kaptu(() => solojDe(defaultModelo, { aspekto, scheme: "dark" }));
      if (!(kaptita instanceof SolojEraro) || kaptita.rule !== "resolve-unknown-valoro")
        malsamaj.push(aspekto);
    }
    expect(fremdaj.length).toBeGreaterThan(0);
    expect(malsamaj).toEqual([]);
  });
});

function kaptu(fn: () => unknown): unknown {
  try {
    fn();
  } catch (eraro) {
    return eraro;
  }
  return undefined;
}

describe("sondojDe: the probe requests (C-B, D-S038-11-3)", () => {
  function atenditajPetoj(modelo: Modelo): SondoPeto[] {
    const koreo = modelo.setoj.find((set) => set.name === CORE_SET_NAME);
    const petoj: SondoPeto[] = [];
    for (const token of Object.values(koreo?.tokens ?? {})) {
      if (token.type === "color")
        petoj.push({ token: token.name, css: cssVariable(token.name), eco: "color" });
      if (token.type === "fontFamily")
        petoj.push({ token: token.name, css: cssVariable(token.name), eco: "font-family" });
    }
    for (const { token } of listArangxoj(modelo).interspacoj)
      petoj.push({ token, css: cssVariable(token), eco: "spacing" });
    return petoj.sort((a, b) => (a.token < b.token ? -1 : a.token > b.token ? 1 : 0));
  }

  it("asks for every colour, fontFamily and spacing token once, by its CSS name, sorted", () => {
    const petoj = sondojDe(cxiujModelo);
    const malsamaj: string[] = [];
    for (const [indekso, peto] of petoj.entries()) {
      if (peto.css !== cssVariable(peto.token)) malsamaj.push(`${peto.token}: css`);
      const antaux = petoj[indekso - 1];
      if (antaux !== undefined && antaux.token >= peto.token) malsamaj.push(`${peto.token}: order`);
    }
    expect(malsamaj).toEqual([]);
    expect(petoj).toEqual(atenditajPetoj(cxiujModelo));
    for (const eco of ["color", "font-family", "spacing"] as const)
      expect(petoj.some((peto) => peto.eco === eco)).toBe(true);
  });

  it("is the same for the repository Modelo and the cxiuj Modelo (core names only)", () => {
    expect(sondojDe(defaultModelo)).toEqual(sondojDe(cxiujModelo));
  });
});

describe("no literals in the K8 source (AC-L2-9)", () => {
  it("holds no colour value, px value, font family or token path of the data", () => {
    const dosieroj = ["./soloj.ts", "./k8.ts"]
      .map((dosiero) => fileURLToPath(new URL(dosiero, import.meta.url)))
      .filter((dosiero) => existsSync(dosiero));
    const familioj = new Set<string>();
    for (const { aspekto, scheme } of kombinacioj) {
      for (const token of Object.values(rezolvo(cxiujModelo, aspekto, scheme).tokens)) {
        if (token.type === "fontFamily")
          for (const familio of cxiujFamilioj(token.value)) familioj.add(familio);
      }
    }
    const koreo = cxiujModelo.setoj.find((set) => set.name === CORE_SET_NAME);
    const vojoj = Object.keys(koreo?.tokens ?? {}).filter((nomo) => nomo.includes("."));
    const sxablonoj: [string, RegExp][] = [
      ["colour hex", /#[0-9a-f]{3,8}\b/i],
      ["rgb(", /rgb\(/i],
      ["oklch(", /oklch\(/i],
      ["px value", /\d+px/i],
    ];
    const ene = (teksto: string, vorto: string) =>
      new RegExp(
        `(?<![a-z0-9.-])${vorto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9-])`,
        "i",
      ).test(teksto);
    const malobservoj: string[] = [];
    for (const dosiero of dosieroj) {
      const teksto = readFileSync(dosiero, "utf8");
      for (const [nomo, sxablono] of sxablonoj)
        if (sxablono.test(teksto)) malobservoj.push(`${dosiero}: ${nomo}`);
      for (const familio of familioj)
        if (ene(teksto, familio)) malobservoj.push(`${dosiero}: font family ${familio}`);
      for (const vojo of vojoj)
        if (ene(teksto, vojo)) malobservoj.push(`${dosiero}: token path ${vojo}`);
    }
    expect(dosieroj.length).toBeGreaterThan(0);
    expect(familioj.size).toBeGreaterThan(0);
    expect(malobservoj).toEqual([]);
  });
});
