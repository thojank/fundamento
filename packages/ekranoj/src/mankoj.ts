// Teil 3 – the Lückenliste (Spec 037 Lieferliste 3.1, C-7): what Fundamento lacked in a run, and
// the gaps of many runs merged into one list for Eroj-Runde 6/7, Muster-Runde 2 and the Gvidanto.
//
// Sources of one run (`mankojDeKuro`, written to the run's `mankoj.json` by eligo):
//   1. K5 gaps of the scorer left in the last state of a screen: `rebuilt-ero` (an Ero rebuilt
//      from native markup) and `raw-value` (a design value written into the fragment);
//   2. check_usage errors left in the last state of a screen (a Regulo the agent could not meet);
//   3. `suggest_ero` calls without a hit (the agent looked for an Ero for a goal, none came back);
//   4. the gaps the agent reported in its `mankoj` block (Ero, Sxablono or tool);
//   wished tools that match a tool of the Gvidanto are no gap and are dropped.
// Only the last state counts for 1 and 2: what the agent fixed with existing means in a later
// round was no gap of Fundamento. `ofteco` of a run = the screens that show the gap; `taskoj` =
// their slugs.
//
// Deterministic rules (also in specs/037-agenten-ekranoj/plan.md, „Lückenliste“):
//   speco  rebuilt-ero → ero; raw-value of a layout property (margin, padding, gap, width,
//          height, inset, top/right/bottom/left and their variants) → sxablono, any other design
//          property (colour, background, border, font, radius, shadow …) → ero; check_usage → ero
//          (ekranoj checks Ero instances only, D-S037-03-13); suggest_ero miss → ero; agent → as
//          reported.
//   celo   ero → eroj-rondo-6/7, sxablono → muster-rondo-2, ilo → gvidanto (never from the input).
//   propono the agent's own proposal when it gave one, else a fixed sentence per source (below).
//   nomo   whitespace collapsed; two gaps are the same when kind and name match without case.
//
// Across runs (`kunigiMankojn`): every given folder is searched for run folders (a folder with a
// `mankoj.json`; not below a run folder, not into `marko/`); `ofteco` is summed, `taskoj` become
// `<run>/<slug>` (run = the run folder relative to the parent of the given folder) and are united
// and sorted; `ekzemplo` and an own `propono` come from the first run in that order. The list is
// sorted by `ofteco` (descending), then `nomo`, then `speco` – the same for any order of folders.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import type { AgentaManko } from "./agento.js";
import type { Manko, Problemo, Rondo } from "./tipoj.js";

/** The file of a run folder that holds its gaps. */
export const MANKOJ_DOSIERO = "mankoj.json";

/** Where a gap goes (C-7): by its kind, always. */
export const MANKO_CELOJ: Readonly<Record<Manko["speco"], Manko["celo"]>> = {
  ero: "eroj-rondo-6/7",
  sxablono: "muster-rondo-2",
  ilo: "gvidanto",
};

const SPECOJ: readonly Manko["speco"][] = ["ero", "sxablono", "ilo"];

/** CSS properties that place and size things (layout means, the matter of a Sxablono). */
const AJXO_DE_ARANGXO =
  /^(margin(-[a-z]+)*|padding(-[a-z]+)*|gap|row-gap|column-gap|width|height|min-width|max-width|min-height|max-height|inset(-[a-z]+)*|top|right|bottom|left)$/;

const normigi = (teksto: string): string => teksto.replace(/\s+/g, " ").trim();
const sxlosiloDe = (speco: string, nomo: string): string =>
  `${speco}\u0000${normigi(nomo).toLowerCase()}`;
const kompari = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** Sorted as C-7 asks: ofteco descending, then nomo, then speco. */
export function ordigiMankojn(mankoj: readonly Manko[]): Manko[] {
  return [...mankoj].sort(
    (a, b) => b.ofteco - a.ofteco || kompari(a.nomo, b.nomo) || kompari(a.speco, b.speco),
  );
}

// --- One run -----------------------------------------------------------------------------------

/** One occurrence of a gap on one screen, before the run's occurrences are merged. */
interface Okazo {
  speco: Manko["speco"];
  nomo: string;
  slug: string;
  ekzemplo: string;
  propono: string;
}

/** The fixed proposal of a K5 gap (`rebuilt-ero`, `raw-value`). */
function okazoDeTaksado(slug: string, kind: string, key: string): Okazo | undefined {
  if (kind === "rebuilt-ero") {
    return {
      speco: "ero",
      nomo: `Ero für ${key}`,
      slug,
      ekzemplo: `${slug}.html: ${key} nachgebaut`,
      propono: `Eine Ero für ${key} anbieten oder suggest_ero und den Gvidanto auf die bestehende Ero führen lassen.`,
    };
  }
  if (kind === "raw-value") {
    const arangxo = AJXO_DE_ARANGXO.test(key);
    return arangxo
      ? {
          speco: "sxablono",
          nomo: `Layoutmittel für ${key}`,
          slug,
          ekzemplo: `${slug}.html: ${key} als Wert im Fragment`,
          propono: `Ein Muster oder eine Region für ${key} anbieten, damit kein Wert im Fragment steht.`,
        }
      : {
          speco: "ero",
          nomo: `Gestaltung über ${key}`,
          slug,
          ekzemplo: `${slug}.html: ${key} als Wert im Fragment`,
          propono: `Eine Variante oder Eigenschaft der Ero für ${key} anbieten, damit kein Wert im Fragment steht.`,
        };
  }
  return undefined;
}

const defaultPropono = (speco: Manko["speco"], nomo: string): string =>
  speco === "ilo"
    ? `Ein Lesewerkzeug „${nomo}“ im Gvidanto anbieten.`
    : speco === "sxablono"
      ? `Ein Muster (Sxablono) „${nomo}“ anbieten.`
      : `Eine Ero „${nomo}“ anbieten.`;

/**
 * Whether a `suggest_ero` answer has no hit: no suggestion, no candidates, and no boundary that
 * names another Ero – a boundary whose action is `ask-human` hands the case to a person because
 * Fundamento has nothing for it (seen on the real Gvidanto: „noch keine Schrittanzeige“), so it
 * counts as a miss. An error envelope or anything unreadable is no miss (the call failed).
 */
export function sugestoSenTrafo(respondo: string): boolean {
  let valoro: unknown;
  try {
    valoro = JSON.parse(respondo);
  } catch {
    return false;
  }
  if (typeof valoro !== "object" || valoro === null || Array.isArray(valoro)) return false;
  const r = valoro as Record<string, unknown>;
  if (!("suggestion" in r) || r.suggestion !== null) return false;
  if (Array.isArray(r.candidates) && r.candidates.length > 0) return false;
  const limo = r.boundary;
  if (limo === undefined || limo === null) return true;
  return typeof limo === "object" && (limo as { action?: unknown }).action === "ask-human";
}

/** One `suggest_ero` call of a screen without a hit: the goal the agent asked for. */
export interface SugestoSenTrafo {
  slug: string;
  celo: string;
}

export interface KuraMankoEnigo {
  /** The screens of the run, in plan order. */
  slugoj: readonly string[];
  /** The last state of every screen (the last built round; carried forward for green ones). */
  lasta?: Rondo;
  /** The gaps the agent reported, per screen (each once per screen). */
  agentaj: readonly { slug: string; manko: AgentaManko }[];
  sugestojSenTrafo: readonly SugestoSenTrafo[];
  /** Every tool the Gvidanto listed (unfiltered); a wished tool of that name is no gap. */
  iloj: readonly string[];
}

/** The gaps of one run (C-7), from every source of the header, sorted. */
export function mankojDeKuro(e: KuraMankoEnigo): Manko[] {
  const okazoj: Okazo[] = [];
  for (const slug of e.slugoj) {
    const stato = e.lasta?.[slug];
    if (stato === undefined) continue;
    for (const manko of stato.taksado.mankoj) {
      const okazo = okazoDeTaksado(slug, manko.kind, manko.key);
      if (okazo !== undefined) okazoj.push(okazo);
    }
    for (const m of stato.malobservoj) {
      if (m.severity !== "error" || m.rule === "check-usage-unavailable") continue;
      const regulo = m.regulo?.name ?? m.rule;
      okazoj.push({
        speco: "ero",
        nomo: `Regulo ${regulo}`,
        slug,
        ekzemplo: `${slug}.html: ${m.loko ?? m.path}`,
        propono: `Die Regulo ${regulo} blieb bis zur letzten Runde verletzt: eine passende Variante der Ero anbieten oder den Vorschlag der Regulo im Gvidanto schärfen.`,
      });
    }
  }
  for (const { slug, celo } of e.sugestojSenTrafo) {
    const nomo = normigi(celo);
    if (nomo === "") continue;
    okazoj.push({
      speco: "ero",
      nomo,
      slug,
      ekzemplo: `${slug}.html: suggest_ero „${nomo}“ ohne Treffer`,
      propono: `Eine Ero für das Ziel „${nomo}“ anbieten oder das Ziel als Schlüsselwort einer bestehenden Ero aufnehmen.`,
    });
  }
  const iloj = new Set(e.iloj.map((ilo) => ilo.toLowerCase()));
  for (const { slug, manko } of e.agentaj) {
    const nomo = normigi(manko.nomo);
    if (nomo === "") continue;
    if (manko.speco === "ilo" && iloj.has(nomo.toLowerCase())) continue;
    okazoj.push({
      speco: manko.speco,
      nomo,
      slug,
      // The agent's own example stays as it wrote it (S037-03); without one, its screen.
      ekzemplo: manko.ekzemplo === "" ? `${slug}.html` : manko.ekzemplo,
      propono: manko.propono === "" ? defaultPropono(manko.speco, nomo) : manko.propono,
    });
  }
  const mankoj = new Map<string, Manko>();
  for (const okazo of okazoj) {
    const sxlosilo = sxlosiloDe(okazo.speco, okazo.nomo);
    const antaua = mankoj.get(sxlosilo);
    if (antaua === undefined) {
      mankoj.set(sxlosilo, {
        speco: okazo.speco,
        nomo: okazo.nomo,
        ofteco: 1,
        taskoj: [okazo.slug],
        ekzemplo: okazo.ekzemplo,
        propono: okazo.propono,
        celo: MANKO_CELOJ[okazo.speco],
      });
    } else if (!antaua.taskoj.includes(okazo.slug)) {
      antaua.ofteco += 1;
      antaua.taskoj.push(okazo.slug);
    }
  }
  return ordigiMankojn([...mankoj.values()]);
}

// --- Many runs ---------------------------------------------------------------------------------

/** Folders that cannot be merged: every problem with path, rule, message and suggestion. */
export class MankojEraro extends Error {
  readonly problemoj: Problemo[];

  constructor(problemoj: Problemo[]) {
    super(problemoj.map((p) => `${p.path} ${p.rule}: ${p.message}`).join("\n"));
    this.name = "MankojEraro";
    this.problemoj = problemoj;
  }
}

const NE_SERCXATAJ = new Set(["marko", "node_modules", ".git"]);

/** The run folders below `dir` (a folder with a mankoj.json), sorted; not below a run folder. */
function kuraDosierujoj(dir: string): string[] {
  if (existsSync(join(dir, MANKOJ_DOSIERO))) return [dir];
  return readdirSync(dir, { withFileTypes: true })
    .filter((ero) => ero.isDirectory() && !NE_SERCXATAJ.has(ero.name))
    .map((ero) => ero.name)
    .sort(kompari)
    .flatMap((nomo) => kuraDosierujoj(join(dir, nomo)));
}

const unuigi = (vojo: string): string => vojo.split("\\").join("/");

/** One gap of a mankoj.json, checked; problems are added to `problemoj`. */
function legiMankon(valoro: unknown, path: string, problemoj: Problemo[]): Manko | undefined {
  const r =
    typeof valoro === "object" && valoro !== null && !Array.isArray(valoro)
      ? (valoro as Record<string, unknown>)
      : undefined;
  const speco = r?.speco;
  const nomo = typeof r?.nomo === "string" ? normigi(r.nomo) : "";
  const ofteco = r?.ofteco;
  const taskoj = r?.taskoj;
  if (
    r === undefined ||
    !SPECOJ.includes(speco as Manko["speco"]) ||
    nomo === "" ||
    typeof ofteco !== "number" ||
    !Number.isSafeInteger(ofteco) ||
    ofteco < 1 ||
    !Array.isArray(taskoj) ||
    !taskoj.every((tasko) => typeof tasko === "string")
  ) {
    problemoj.push({
      path,
      rule: "manko-invalid",
      message: "Keine Lücke nach C-7 (speco ero|sxablono|ilo, nomo, ofteco ≥ 1, taskoj).",
      suggestion: "Den Lauf neu schreiben lassen (fm ekranoj) oder den Eintrag entfernen.",
    });
    return undefined;
  }
  const s = speco as Manko["speco"];
  return {
    speco: s,
    nomo,
    ofteco,
    taskoj: taskoj as string[],
    ekzemplo: typeof r.ekzemplo === "string" ? r.ekzemplo : "",
    propono: typeof r.propono === "string" ? r.propono : "",
    celo: MANKO_CELOJ[s],
  };
}

/**
 * The Lückenliste of many runs (C-7): every folder is a run folder or holds run folders. Throws
 * `MankojEraro` with every problem when a folder does not exist, holds no run, or a mankoj.json
 * is not a list of gaps; nothing is merged then.
 */
export function kunigiMankojn(dirs: readonly string[]): Manko[] {
  const problemoj: Problemo[] = [];
  if (dirs.length === 0) {
    problemoj.push({
      path: "/",
      rule: "folders-missing",
      message: "Keine Ordner angegeben.",
      suggestion: "Mindestens einen Laufordner nennen, z. B. .fundamento/ekranoj.",
    });
  }
  const kuroj = new Map<string, string>();
  for (const [index, dir] of dirs.entries()) {
    const absoluta = resolve(dir);
    if (!existsSync(absoluta) || !statSync(absoluta).isDirectory()) {
      problemoj.push({
        path: `/${index}`,
        rule: "folder-missing",
        message: `Der Ordner ${dir} existiert nicht.`,
        suggestion: "Einen Laufordner von fm ekranoj nennen (mit mankoj.json).",
      });
      continue;
    }
    const trovitaj = kuraDosierujoj(absoluta);
    if (trovitaj.length === 0) {
      problemoj.push({
        path: `/${index}`,
        rule: "run-missing",
        message: `Im Ordner ${dir} liegt kein Lauf (keine ${MANKOJ_DOSIERO}).`,
        suggestion: "Einen Laufordner von fm ekranoj nennen oder den Ordner, der Läufe enthält.",
      });
    }
    for (const kuro of trovitaj) {
      if (!kuroj.has(kuro))
        kuroj.set(kuro, unuigi(relative(dirname(absoluta), kuro)) || basename(kuro));
    }
  }
  const legitaj: { nomo: string; mankoj: Manko[] }[] = [];
  for (const [kuro, nomo] of kuroj) {
    const dosiero = join(kuro, MANKOJ_DOSIERO);
    let valoro: unknown;
    try {
      valoro = JSON.parse(readFileSync(dosiero, "utf8"));
    } catch {
      valoro = undefined;
    }
    if (!Array.isArray(valoro)) {
      problemoj.push({
        path: unuigi(dosiero),
        rule: "mankoj-invalid",
        message: `${MANKOJ_DOSIERO} ist keine JSON-Liste.`,
        suggestion: "Den Lauf neu schreiben lassen (fm ekranoj).",
      });
      continue;
    }
    const mankoj = valoro.flatMap((ero, i) => {
      const manko = legiMankon(ero, `${unuigi(dosiero)}/${i}`, problemoj);
      return manko === undefined ? [] : [manko];
    });
    legitaj.push({ nomo, mankoj });
  }
  if (problemoj.length > 0) throw new MankojEraro(problemoj);

  legitaj.sort((a, b) => kompari(a.nomo, b.nomo));
  const kunigitaj = new Map<string, Manko & { taskaro: Set<string> }>();
  for (const { nomo: kuro, mankoj } of legitaj) {
    for (const manko of mankoj) {
      const sxlosilo = sxlosiloDe(manko.speco, manko.nomo);
      const taskoj = manko.taskoj.map((tasko) => `${kuro}/${tasko}`);
      const antaua = kunigitaj.get(sxlosilo);
      if (antaua === undefined) {
        kunigitaj.set(sxlosilo, {
          ...manko,
          propono: manko.propono === "" ? defaultPropono(manko.speco, manko.nomo) : manko.propono,
          taskaro: new Set(taskoj),
          taskoj: [],
        });
        continue;
      }
      antaua.ofteco += manko.ofteco;
      for (const tasko of taskoj) antaua.taskaro.add(tasko);
      if (antaua.ekzemplo === "") antaua.ekzemplo = manko.ekzemplo;
    }
  }
  return ordigiMankojn(
    [...kunigitaj.values()].map(({ taskaro, ...manko }) => ({
      ...manko,
      taskoj: [...taskaro].sort(kompari),
    })),
  );
}

// --- The table ---------------------------------------------------------------------------------

/** The columns of the Lückenliste: the Kennzahl's `| # | Art | Lücke | Anzahl |`, extended. */
export const MANKOJ_KOLUMNOJ: readonly string[] = [
  "#",
  "Art",
  "Lücke",
  "Anzahl",
  "Aufgaben",
  "Beispielstelle",
  "Vorschlag",
  "Ziel",
];

const cxelo = (teksto: string): string =>
  teksto
    .replaceAll("|", "\\|")
    .replace(/\s*\n\s*/g, " ")
    .trim();

/** The Lückenliste as a Markdown table (as the Kennzahl's top 10 of the gaps, extended). */
export function mankojMarkdown(mankoj: readonly Manko[]): string {
  const linioj = [
    `| ${MANKOJ_KOLUMNOJ.join(" | ")} |`,
    `|${MANKOJ_KOLUMNOJ.map(() => "---").join("|")}|`,
  ];
  for (const [index, manko] of mankoj.entries()) {
    linioj.push(
      `| ${[
        String(index + 1),
        manko.speco,
        cxelo(manko.nomo),
        String(manko.ofteco),
        cxelo(manko.taskoj.join(", ")),
        cxelo(manko.ekzemplo),
        cxelo(manko.propono),
        manko.celo,
      ].join(" | ")} |`,
    );
  }
  if (mankoj.length === 0) linioj.push(`| – | – | keine Lücke | 0 | – | – | – | – |`);
  return `${linioj.join("\n")}\n`;
}
