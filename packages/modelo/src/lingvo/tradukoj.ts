// The texts of the Uzoj and the Reguloj in another language (Nachlese 8 ③, decision d of the
// maintainer): English stays the source — the text of the entry itself —, a translation is a text
// of data/tradukoj.json under the ID of the text: the ID of the entry and the path of the text in
// it. The way of the keywords and the a11y texts (a text per language), kept out of the entries,
// so every answer without a language stays as it was. Pure.

import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { Modelo } from "../contracts/modelo.js";

/** A language a text can be asked in; English is the source. */
export type Lingvo = "de" | "en";

/** One text the Vitrino shows, with its ID and its English source. */
export interface Teksto {
  key: string;
  en: string;
}

/** The texts of one Uzo — of an Ero or of a Sxablono — with their IDs. */
interface UzoTexts {
  id: string;
  purpose?: string;
  instead?: readonly { goal: string; kialo?: string }[];
  boundary?: readonly { case: string; kialo?: string }[];
  composes?: {
    containers?: readonly { name: string; kialo?: string }[];
    with?: readonly { ero: string; kialo?: string }[];
    never?: readonly { ero: string; kialo?: string }[];
  };
}

function uzoTekstoj(uzo: UzoTexts): Teksto[] {
  const out: Teksto[] = [];
  const add = (path: string, text: string | undefined) => {
    if (text !== undefined && text.trim() !== "") out.push({ key: `${uzo.id}/${path}`, en: text });
  };
  add("purpose", uzo.purpose);
  for (const entry of uzo.instead ?? []) add(`instead/${entry.goal}/kialo`, entry.kialo);
  for (const entry of uzo.boundary ?? []) add(`boundary/${entry.case}/kialo`, entry.kialo);
  for (const entry of uzo.composes?.containers ?? [])
    add(`composes/containers/${entry.name}/kialo`, entry.kialo);
  for (const entry of uzo.composes?.with ?? [])
    add(`composes/with/${entry.ero}/kialo`, entry.kialo);
  for (const entry of uzo.composes?.never ?? [])
    add(`composes/never/${entry.ero}/kialo`, entry.kialo);
  return out;
}

/**
 * Whether an ID is one of the core Modelo — not of an Aspekto package, whose IDs carry its
 * namespace (`reg_ekz_…`): its texts stand in its package, not in data/tradukoj.json.
 */
const coreId = (id: string) => !/^[a-z]{3}_[a-z]{2,8}_/.test(id);

/**
 * Every text of the core Modelo the Vitrino shows (Nachlese 8 ③): the purpose and the kialoj of
 * every Uzo of an Ero and of a Sxablono, the statement and the kialo of every Regulo — in the
 * order of the Modelo. A Regulo of an Aspekto package is its own text and stays English.
 */
export function tekstojOf(modelo: Modelo): Teksto[] {
  return [
    ...modelo.eroj.flatMap((entry) =>
      entry.uzo === undefined ? [] : uzoTekstoj(entry.uzo as unknown as UzoTexts),
    ),
    ...(modelo.sxablonoj ?? []).flatMap((entry) =>
      entry.uzo === undefined ? [] : uzoTekstoj(entry.uzo as unknown as UzoTexts),
    ),
    ...modelo.reguloj
      .filter((regulo) => coreId(regulo.id))
      .flatMap((regulo) => [
        { key: `${regulo.id}/statement`, en: regulo.statement },
        { key: `${regulo.id}/kialo`, en: regulo.kialo },
      ]),
  ];
}

/** The text in the language asked for, else its English source. */
export function traduko(
  modelo: Modelo,
  lingvo: Lingvo | undefined,
  key: string,
  en: string,
): string {
  if (lingvo === undefined || lingvo === "en") return en;
  return modelo.tradukoj?.[lingvo]?.[key] ?? en;
}

/** The file the translations stand in, for the path of an issue. */
const FILE = "data/tradukoj.json";

const pointerOf = (lingvo: string, key: string) =>
  `/tradukoj/${lingvo}/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`;

/**
 * The check of the translations (Nachlese 8 ③): for every language the Modelo translates into,
 * a text without its translation is an error (traduko-missing) — the Vitrino would show it in
 * English —, a translation whose text does not exist (any more) a warning (traduko-orphaned).
 */
export function tradukoIssues(modelo: Modelo): ValidationIssue[] {
  const tekstoj = tekstojOf(modelo);
  const keys = new Set(tekstoj.map((teksto) => teksto.key));
  const issues: ValidationIssue[] = [];
  for (const [lingvo, texts] of Object.entries(modelo.tradukoj ?? {})) {
    for (const teksto of tekstoj) {
      if ((texts[teksto.key] ?? "").trim() !== "") continue;
      issues.push({
        rule: "traduko-missing",
        severity: "error",
        path: formatIssuePath({ file: FILE, pointer: pointerOf(lingvo, teksto.key) }),
        message: `The text ${teksto.key} has no translation into ${lingvo}; the Vitrino would show it in English: "${teksto.en}"`,
        suggestion: `Add "${teksto.key}" to tradukoj.${lingvo} in ${FILE}, translated from the English text.`,
      });
    }
    for (const key of Object.keys(texts)) {
      if (keys.has(key)) continue;
      issues.push({
        rule: "traduko-orphaned",
        severity: "warning",
        path: formatIssuePath({ file: FILE, pointer: pointerOf(lingvo, key) }),
        message: `The translation ${key} into ${lingvo} names no text of the Modelo.`,
        suggestion: `Remove "${key}" from tradukoj.${lingvo}, or name the text by the ID of its entry and its path.`,
      });
    }
  }
  return issues;
}

/**
 * A Uzo with its texts in the language asked for (Nachlese 8 ③): the purpose and every kialo of
 * instead, boundary and composes; everything else — names, actions, slots — as it is.
 */
export function uzoIn<T extends UzoTexts>(modelo: Modelo, uzo: T, lingvo: Lingvo | undefined): T {
  if (lingvo === undefined || lingvo === "en") return uzo;
  const t = (path: string, en: string) => traduko(modelo, lingvo, `${uzo.id}/${path}`, en);
  const kialo = <E extends { kialo?: string }>(entry: E, path: string): E =>
    entry.kialo === undefined ? entry : { ...entry, kialo: t(path, entry.kialo) };
  return {
    ...uzo,
    ...(uzo.purpose === undefined ? {} : { purpose: t("purpose", uzo.purpose) }),
    ...(uzo.instead === undefined
      ? {}
      : { instead: uzo.instead.map((entry) => kialo(entry, `instead/${entry.goal}/kialo`)) }),
    ...(uzo.boundary === undefined
      ? {}
      : { boundary: uzo.boundary.map((entry) => kialo(entry, `boundary/${entry.case}/kialo`)) }),
    ...(uzo.composes === undefined
      ? {}
      : {
          composes: {
            ...uzo.composes,
            ...(uzo.composes.containers === undefined
              ? {}
              : {
                  containers: uzo.composes.containers.map((entry) =>
                    kialo(entry, `composes/containers/${entry.name}/kialo`),
                  ),
                }),
            ...(uzo.composes.with === undefined
              ? {}
              : {
                  with: uzo.composes.with.map((entry) =>
                    kialo(entry, `composes/with/${entry.ero}/kialo`),
                  ),
                }),
            ...(uzo.composes.never === undefined
              ? {}
              : {
                  never: uzo.composes.never.map((entry) =>
                    kialo(entry, `composes/never/${entry.ero}/kialo`),
                  ),
                }),
          },
        }),
  };
}

/** A Regulo (or a reference to one) with its statement and kialo in the language asked for. */
export function reguloIn<T extends { id: string; statement: string; kialo: string }>(
  modelo: Modelo,
  regulo: T,
  lingvo: Lingvo | undefined,
): T {
  if (lingvo === undefined || lingvo === "en") return regulo;
  return {
    ...regulo,
    statement: traduko(modelo, lingvo, `${regulo.id}/statement`, regulo.statement),
    kialo: traduko(modelo, lingvo, `${regulo.id}/kialo`, regulo.kialo),
  };
}
