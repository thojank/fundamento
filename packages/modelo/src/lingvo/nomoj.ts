// The display names of the Lingvo-Schalter (Spec 026 ②, decision of the maintainer 2026-10-22):
// Esperanto stays the default and is the identifier itself; German and English are names under
// the ID of their entry in data/tradukoj.json, the way of the texts of Nachlese 8 ③ (rule 0.1).
// An Ero or a Sxablono under its ID (`<id>/name`); its parts, axes, values, states, slots and
// regions under the ID of its Skemo (`<ske>/parts/<part>`, `<ske>/props/<prop>/values/<value>`,
// …); a Dimensio and its values under their IDs (`<dim>/name`, `<dva>/name`). Only the display
// changes: tags, props, CSS variables, token and component names stay Esperanto (Art. II). Pure.

import type { Modelo } from "../contracts/modelo.js";

/** A language the display switches to; Esperanto is the default and the identifier itself. */
export type AnzeigeLingvo = "eo" | "de" | "en";

export const ANZEIGE_LINGVOJ: readonly AnzeigeLingvo[] = ["eo", "de", "en"];

/** The languages every name stands in (data/tradukoj.json). */
export const NOMO_LINGVOJ = ["de", "en"] as const;

export type NomoKind =
  | "ero"
  | "sxablono"
  | "part"
  | "prop"
  | "value"
  | "state"
  | "slot"
  | "region"
  | "dimensio"
  | "valoro";

/** One name the Vitrino and the Studio show: its key, its Esperanto name and what it names. */
export interface Nomo {
  key: string;
  eo: string;
  kind: NomoKind;
  /** The Ero, Sxablono or Dimensio it belongs to. */
  of: string;
}

interface SkemoNames {
  id: string;
  parts?: Readonly<Record<string, unknown>>;
  props?: readonly { name: string; values?: readonly (string | number)[] }[];
  states?: readonly string[];
  slots?: readonly { name: string }[];
  regions?: readonly { name: string }[];
}

/** The key of a name of a Skemo: `<ske>/parts/<part>`, `<ske>/props/<prop>/values/<value>`, … */
export const skemoNomoKey = (
  skemo: string,
  kind: "parts" | "props" | "states" | "slots" | "regions",
  name: string,
  value?: string | number,
): string => `${skemo}/${kind}/${name}${value === undefined ? "" : `/values/${value}`}`;

function skemoNomoj(skemo: SkemoNames, of: string): Nomo[] {
  const out: Nomo[] = [];
  for (const part of Object.keys(skemo.parts ?? {}))
    out.push({ key: skemoNomoKey(skemo.id, "parts", part), eo: part, kind: "part", of });
  for (const prop of skemo.props ?? []) {
    out.push({ key: skemoNomoKey(skemo.id, "props", prop.name), eo: prop.name, kind: "prop", of });
    for (const value of prop.values ?? [])
      out.push({
        key: skemoNomoKey(skemo.id, "props", prop.name, value),
        eo: String(value),
        kind: "value",
        of,
      });
  }
  for (const state of skemo.states ?? [])
    out.push({ key: skemoNomoKey(skemo.id, "states", state), eo: state, kind: "state", of });
  for (const slot of skemo.slots ?? [])
    out.push({ key: skemoNomoKey(skemo.id, "slots", slot.name), eo: slot.name, kind: "slot", of });
  for (const region of skemo.regions ?? [])
    out.push({
      key: skemoNomoKey(skemo.id, "regions", region.name),
      eo: region.name,
      kind: "region",
      of,
    });
  return out;
}

/**
 * Every name the Vitrino and the Studio show, in the order of the Modelo: each Ero with the names
 * of its Skemo, each Sxablono with the names of its Skemo, each Dimensio with its values — but
 * the brands, the values of aspekto, which are names of their own.
 */
export function nomojOf(modelo: Modelo): Nomo[] {
  return [
    ...modelo.eroj.flatMap((entry) => [
      { key: `${entry.ero.id}/name`, eo: entry.ero.name, kind: "ero" as const, of: entry.ero.name },
      ...skemoNomoj(entry.skemo as unknown as SkemoNames, entry.ero.name),
    ]),
    ...(modelo.sxablonoj ?? []).flatMap((entry) => [
      {
        key: `${entry.sxablono.id}/name`,
        eo: entry.sxablono.name,
        kind: "sxablono" as const,
        of: entry.sxablono.name,
      },
      ...skemoNomoj(entry.skemo as unknown as SkemoNames, entry.sxablono.name),
    ]),
    ...modelo.dimensioj.flatMap((dimensio) => [
      {
        key: `${dimensio.id}/name`,
        eo: dimensio.name,
        kind: "dimensio" as const,
        of: dimensio.name,
      },
      // The values of aspekto are the brands: names of their own, never translated.
      ...(dimensio.name === "aspekto" ? [] : (dimensio.valoroj ?? [])).map((valoro) => ({
        key: `${valoro.id}/name`,
        eo: valoro.name,
        kind: "valoro" as const,
        of: dimensio.name,
      })),
    ]),
  ];
}

/** A name in the language asked for; Esperanto, a missing language or name: the identifier. */
export function nomo(
  modelo: Modelo,
  lingvo: AnzeigeLingvo | undefined,
  key: string,
  eo: string,
): string {
  if (lingvo === undefined || lingvo === "eo") return eo;
  const name = modelo.tradukoj?.[lingvo]?.[key];
  return name === undefined || name.trim() === "" ? eo : name;
}

/** The display name of an Ero or a Sxablono (`label` beside `name` in the Gvidanto). */
export function labelOf(
  modelo: Modelo,
  kind: "ero" | "sxablono",
  name: string,
  lingvo: AnzeigeLingvo | undefined,
): string {
  const id =
    kind === "ero"
      ? modelo.eroj.find((entry) => entry.ero.name === name)?.ero.id
      : (modelo.sxablonoj ?? []).find((entry) => entry.sxablono.name === name)?.sxablono.id;
  return id === undefined ? name : nomo(modelo, lingvo, `${id}/name`, name);
}

/** The label to add beside a name, or nothing without a language. */
export const labelBeside = (
  modelo: Modelo,
  kind: "ero" | "sxablono",
  name: string,
  lingvo: AnzeigeLingvo | undefined,
): { label?: string } =>
  lingvo === undefined ? {} : { label: labelOf(modelo, kind, name, lingvo) };

/**
 * The names of every language for a page (Vitrino, Studio): key → name per language, only the
 * names of the Modelo, never its texts.
 */
export function nomoTabelo(
  modelo: Modelo,
): Record<(typeof NOMO_LINGVOJ)[number], Record<string, string>> {
  const nomoj = nomojOf(modelo);
  const table = { de: {} as Record<string, string>, en: {} as Record<string, string> };
  for (const lingvo of NOMO_LINGVOJ) {
    for (const entry of nomoj) {
      const name = modelo.tradukoj?.[lingvo]?.[entry.key];
      if (name !== undefined && name.trim() !== "") table[lingvo][entry.key] = name;
    }
  }
  return table;
}
