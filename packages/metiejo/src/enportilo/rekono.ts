// From findings to proposals (Spec 033 S2): one proposal per Faceto, as fields of the Agordo inside
// the ranges of the sliders, with the provenance of every value. The lead colour is the strongest
// saturated colour; further saturated colours in the hue bands of the status colours become those;
// the light neutrals give the tint of the neutrals; the most frequent family per role becomes the
// font (a webfont of the catalogue, else a licensed font that is named and not included); the median
// radius and spacing become the factors of the Agordo against the structure. A value beyond a
// slider's end is proposed at the end, and the sentence says so. Pure apart from the catalogue.

import { type Agordo, parseAgordoColor, reglerOf } from "@fundamento/agordilo";
import { buildModelo, resolveCombination } from "@fundamento/modelo";
import { fontoOf, licencedFonto, readTiparoj, type Tiparoj } from "../tiparoj.js";
import type { Bases } from "../vorschau.js";
import type { Herkunft, Trovo } from "./trovo.js";

export interface Propono {
  faceto: string;
  agordo: Partial<Agordo>;
  satz: string;
  herkunft: Herkunft[];
}

/** Hue bands of the status colours (OKLCH degrees). */
const STATUS_BANDS: readonly {
  rolle: "danger" | "warning" | "success" | "info";
  von: number;
  bis: number;
}[] = [
  { rolle: "danger", von: 10, bis: 45 },
  { rolle: "warning", von: 60, bis: 105 },
  { rolle: "success", von: 120, bis: 170 },
  { rolle: "info", von: 220, bis: 275 },
];
const SATURATED = 0.05;

const round2 = (value: number) => Math.round(value * 100) / 100;
const percent = (value: number) => `${Math.round(value)}`;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] ?? 0)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

const baseCache = new WeakMap<Bases, { radius: number; spacing: number }>();
/** radius.medium and spacing.medium of the structure, in px: what the factors of the Agordo multiply. */
function baseOf(bases: Bases): { radius: number; spacing: number } {
  let base = baseCache.get(bases);
  if (base === undefined) {
    const tokens = resolveCombination(buildModelo(bases.structure.files).modelo, {}).tokens;
    const pxOf = (name: string, fallback: number) => {
      const value = tokens[name]?.value as { value?: number } | undefined;
      return typeof value?.value === "number" && value.value > 0 ? value.value : fallback;
    };
    base = { radius: pxOf("radius.medium", 4), spacing: pxOf("spacing.medium", 8) };
    baseCache.set(bases, base);
  }
  return base;
}

let catalogue: Tiparoj | undefined;

/** The family in the catalogue: as written, or a joined name split at its capitals (SourceSansPro). */
function inCatalogue(family: string) {
  catalogue ??= readTiparoj();
  const names = [family, family.replace(/([a-z])([A-Z])/g, "$1 $2")].map((name) =>
    name.toLowerCase(),
  );
  return catalogue.tiparoj.find((tiparo) => names.includes(tiparo.family.toLowerCase()));
}

/** Sums the weight of equal findings and keeps up to three places. */
function grouped(trovoj: readonly Trovo[]) {
  const groups = new Map<
    string,
    { valoro: string | number; rolo?: Trovo["rolo"]; pezo: number; herkunft: Herkunft[] }
  >();
  for (const trovo of trovoj) {
    const key = `${trovo.rolo ?? ""}|${trovo.valoro}`;
    const group = groups.get(key) ?? {
      valoro: trovo.valoro,
      ...(trovo.rolo === undefined ? {} : { rolo: trovo.rolo }),
      pezo: 0,
      herkunft: [],
    };
    group.pezo += trovo.pezo;
    if (group.herkunft.length < 3) group.herkunft.push(trovo.herkunft);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.pezo - a.pezo);
}

function clampedFactor(
  bases: Bases,
  path: string,
  measured: number,
  base: number,
): { value: number; atEnd: boolean } {
  const regler = reglerOf(bases.gestalt).find((entry) => entry.path === path);
  const raw = round2(measured / base);
  if (regler === undefined) return { value: raw, atEnd: false };
  const value = round2(Math.min(regler.max, Math.max(regler.min, raw)));
  return { value, atEnd: value !== raw };
}

export function proponojOf(trovoj: readonly Trovo[], bases: Bases): Propono[] {
  const proponoj: Propono[] = [];
  const colours = grouped(trovoj.filter((trovo) => trovo.kind === "farbo")).map((group) => ({
    ...group,
    oklch: parseAgordoColor(String(group.valoro)),
  }));
  const totalColour = colours.reduce((sum, colour) => sum + colour.pezo, 0) || 1;
  const saturated = colours.filter((colour) => (colour.oklch?.c ?? 0) >= SATURATED);
  // Probe run 29.10.: the lead colour is a strong colour of middle lightness – a style sheet full of
  // palette steps would otherwise make its most frequent light tint the lead.
  const lead =
    [...saturated]
      .filter((colour) => (colour.oklch?.l ?? 0) >= 0.3 && (colour.oklch?.l ?? 0) <= 0.8)
      .sort((a, b) => b.pezo * (b.oklch?.c ?? 0) - a.pezo * (a.oklch?.c ?? 0))[0] ?? saturated[0];
  if (lead !== undefined) {
    proponoj.push({
      faceto: "gvidkoloro",
      agordo: { leitfarbe: String(lead.valoro) },
      satz: `Leitfarbe ${lead.valoro}: die stärkste kräftige Farbe deines Materials (${percent((100 * lead.pezo) / totalColour)} % der gefundenen Farbe).`,
      herkunft: lead.herkunft,
    });
  }
  const neutrals = colours.filter(
    (colour) => colour.oklch !== undefined && colour.oklch.c < SATURATED && colour.oklch.l > 0.85,
  );
  if (neutrals.length > 0) {
    const weight = neutrals.reduce((sum, colour) => sum + colour.pezo, 0);
    const chroma =
      neutrals.reduce((sum, colour) => sum + (colour.oklch?.c ?? 0) * colour.pezo, 0) / weight;
    const toenung = round2(Math.min(1, chroma / 0.02));
    proponoj.push({
      faceto: "neutralaj",
      agordo: { neutral: { toenung } },
      satz: `Neutraltöne mit Tönung ${String(toenung).replace(".", ",")}: so farbig sind die hellen Flächen deines Materials (${neutrals.map((colour) => colour.valoro).join(", ")}).`,
      herkunft: neutrals.flatMap((colour) => colour.herkunft).slice(0, 3),
    });
  }
  const status: Partial<
    Record<"danger" | "warning" | "success" | "info", { valoro: string; herkunft: Herkunft[] }>
  > = {};
  // The strong steps of middle lightness first, as for the lead colour; pale tints only without one.
  const middle = (entry: (typeof saturated)[number]) =>
    (entry.oklch?.l ?? 0) >= 0.3 && (entry.oklch?.l ?? 0) <= 0.8;
  const byStrength = (a: (typeof saturated)[number], b: (typeof saturated)[number]) =>
    b.pezo * (b.oklch?.c ?? 0) - a.pezo * (a.oklch?.c ?? 0);
  const others = saturated.filter((entry) => entry !== lead);
  for (const colour of [
    ...others.filter(middle).sort(byStrength),
    ...others.filter((entry) => !middle(entry)),
  ]) {
    const hue = colour.oklch?.h ?? -1;
    const band = STATUS_BANDS.find((entry) => hue >= entry.von && hue <= entry.bis);
    if (band !== undefined && status[band.rolle] === undefined) {
      status[band.rolle] = { valoro: String(colour.valoro), herkunft: colour.herkunft };
    }
  }
  const statusEntries = Object.entries(status) as [
    keyof typeof status,
    { valoro: string; herkunft: Herkunft[] },
  ][];
  if (statusEntries.length > 0) {
    proponoj.push({
      faceto: "statoj",
      agordo: {
        zusatzfarben: Object.fromEntries(
          statusEntries.map(([rolle, entry]) => [rolle, entry.valoro]),
        ),
      },
      satz: `Statusfarben aus deinem Material: ${statusEntries.map(([rolle, entry]) => `${rolle} ${entry.valoro}`).join(", ")}.`,
      herkunft: statusEntries.flatMap(([, entry]) => entry.herkunft),
    });
  }
  const families = grouped(trovoj.filter((trovo) => trovo.kind === "tiparo"));
  const schriften: NonNullable<Agordo["schriften"]> = {};
  const herkunftSchrift: Herkunft[] = [];
  const named: string[] = [];
  for (const rolo of ["body", "display", "code"] as const) {
    const best = families.find((family) => family.rolo === rolo);
    if (best === undefined) continue;
    const tiparo = inCatalogue(String(best.valoro));
    schriften[rolo] =
      tiparo !== undefined ? fontoOf(tiparo) : licencedFonto(String(best.valoro), ["Latn"]);
    herkunftSchrift.push(...best.herkunft);
    named.push(
      `${rolo === "body" ? "Fließtext" : rolo === "display" ? "Überschriften" : "Code"} ${tiparo?.family ?? best.valoro}${tiparo === undefined ? " (lizenziert, nicht enthalten)" : ` (${tiparo.license})`}`,
    );
  }
  if (named.length > 0) {
    proponoj.push({
      faceto: "tiparo",
      agordo: { schriften },
      satz: `Schriften: ${named.join(", ")}.`,
      herkunft: herkunftSchrift,
    });
  }
  const base = baseOf(bases);
  const radii = trovoj.filter((trovo) => trovo.kind === "radiuso");
  if (radii.length > 0) {
    const measured = median(radii.map((trovo) => Number(trovo.valoro)));
    const factor = clampedFactor(bases, "form.radius", measured, base.radius);
    proponoj.push({
      faceto: "formo",
      agordo: { form: { radius: factor.value } },
      satz: `Radius ${String(factor.value).replace(".", ",")}: der mittlere Radius deines Materials ist ${measured} px${factor.atEnd ? "; das liegt jenseits vom Ende des Reglers, vorgeschlagen ist das Ende" : ""}.`,
      herkunft: radii.slice(0, 3).map((trovo) => trovo.herkunft),
    });
  }
  const spacings = trovoj.filter((trovo) => trovo.kind === "spaco");
  if (spacings.length > 0) {
    const measured = median(spacings.map((trovo) => Number(trovo.valoro)));
    const factor = clampedFactor(bases, "raum.abstand", measured, base.spacing);
    proponoj.push({
      faceto: "spaco",
      agordo: { raum: { abstand: factor.value } },
      satz: `Abstand ${String(factor.value).replace(".", ",")}: der mittlere Innenabstand deines Materials ist ${measured} px${factor.atEnd ? "; das liegt jenseits vom Ende des Reglers, vorgeschlagen ist das Ende" : ""}.`,
      herkunft: spacings.slice(0, 3).map((trovo) => trovo.herkunft),
    });
  }
  const order = ["gvidkoloro", "neutralaj", "statoj", "tiparo", "formo", "spaco"];
  return proponoj.sort((a, b) => order.indexOf(a.faceto) - order.indexOf(b.faceto));
}
