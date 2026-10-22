// The component pages of the Studio (Spec 024 Runde 2, § 4 Komponenten): one page per Ero and per
// Sxablono, generated from the Skemo — never written by hand, so a new Ero gets its page by itself
// (M-4). The anatomy names the parts, the matrix spans variants × states (a click chooses the
// cell, the cell travels in the URL), the properties of the chosen cell are its Ero-Tokens
// (Constitution v2.3) — per part the alias to choose among the roles or a value of its own —, the
// measures, the typography, the behaviour the Skemo knows as axes and props; the usage stands
// beside it in German, read-only: Uzo, Kialo, Do and Don't, keyboard, writing rules.
// Zurücksetzen restores the alias on the role. Pure: the server gives the draft, this module the
// view and the HTML.

import type { Agordo } from "@fundamento/agordilo";
import {
  buildModelo,
  CORE_SET_NAME,
  type Combination,
  combinationsOf,
  eroTokenNameOf,
  isEroTokenName,
  type LoadedEro,
  type LoadedSxablono,
  type Modelo,
  reguloIn,
  resolveCombination,
  type Skemo,
  type SkemoPartProperty,
  type SkemoPartSource,
  STATE_KEY,
  uzoIn,
  variantKeys,
} from "@fundamento/modelo";
import { escapeHtml, jsonIsland, screenDocument } from "./html.js";
import { markoLabel } from "./ident.js";
import {
  assignmentOf,
  candidatesOf,
  composeDraft,
  DEFAULT_KOMBINATION,
  farboOf,
  KOMBINATION_CHOICES,
  type Kombination,
  type KomponentoEntry,
  type KomponentoRef,
  komponentoNav,
  komponentoUrl,
  rowHtml,
  STUDIO_PAGES,
  type StudioGroup,
  type StudioRow,
  setTokens,
  shownOf,
} from "./studio.js";
import type { MarkoView } from "./sxtupoj.js";
import { type Bases, loadBases } from "./vorschau.js";

export type KomponentoKind = KomponentoRef["kind"];
export type { KomponentoEntry, KomponentoRef };

/** German labels of the parts of the Skemoj; a part without one keeps its name. */
export const PART_LABELS: Readonly<Record<string, string>> = {
  surface: "Fläche",
  label: "Beschriftung",
  border: "Rahmen",
  icon: "Icon",
  "focus-ring": "Fokusring",
  box: "Box",
  motion: "Bewegung",
  control: "Kontrolle",
  field: "Feld",
  text: "Text",
  help: "Hilfe",
  error: "Fehler",
  placeholder: "Platzhalter",
  "required-mark": "Pflichtzeichen",
  indicator: "Anzeiger",
  track: "Spur",
  knob: "Knopf",
  underline: "Unterstrich",
  heading: "Überschrift",
  message: "Nachricht",
  content: "Inhalt",
  actions: "Aktionen",
  backdrop: "Abdunklung",
  accent: "Akzent",
  dismiss: "Schließen",
  list: "Liste",
  item: "Eintrag",
  items: "Einträge",
  entry: "Eintrag",
  separator: "Trenner",
  line: "Linie",
  glyph: "Glyphe",
  caption: "Beschriftung der Tabelle",
  head: "Kopf",
  cell: "Zelle",
  "row-header": "Zeilenkopf",
  sort: "Sortierung",
  "sort-indicator": "Sortierzeichen",
  region: "Region",
  term: "Begriff",
  value: "Wert",
  fill: "Füllung",
  unknown: "Unbekannt",
  tab: "Reiter",
  panel: "Panel",
  "selected-indicator": "Auswahlzeichen",
  listbox: "Vorschlagsliste",
  suggestion: "Vorschlag",
  dropzone: "Ablagefläche",
  files: "Dateien",
  file: "Datei",
  remove: "Entfernen",
  media: "Medien",
  meta: "Meta",
  picture: "Bild",
  initials: "Initialen",
  quote: "Zitat",
  indent: "Einzug",
  code: "Code",
  "scroll-ring": "Scrollring",
  summary: "Zusammenfassung",
  options: "Optionen",
  option: "Option",
  frame: "Rahmen der Seite",
  header: "Kopfzeile",
  lead: "Vorspann",
  badges: "Statusetiketten",
  sections: "Abschnitte",
  container: "Container",
  divider: "Trennlinie",
  nav: "Navigation",
  principal: "Hauptbereich",
  notices: "Hinweise",
  fields: "Felder",
  footer: "Fußzeile",
  preview: "Vorschau",
  ellipsis: "Auslassung",
  pages: "Seiten",
};

/** German labels of the part properties. */
export const PROPERTY_LABELS: Readonly<Record<string, string>> = {
  fill: "Füllung",
  color: "Farbe",
  typography: "Schriftstil",
  width: "Breite",
  height: "Höhe",
  "inline-padding": "Innenabstand",
  gap: "Abstand",
  radius: "Radius",
  ring: "Ring",
  offset: "Abstand des Rings",
  size: "Größe",
  duration: "Dauer",
  easing: "Kurve",
  position: "Lage",
  shadow: "Schatten",
  stroke: "Strich",
  weight: "Stärke",
  layer: "Ebene",
};

const STATE_LABELS: Readonly<Record<string, string>> = {
  rest: "Ruhe",
  hover: "Zeigen",
  pressed: "Drücken",
  focus: "Fokus",
  disabled: "Gesperrt",
  loading: "Laden",
  visited: "Besucht",
  invalid: "Ungültig",
  readonly: "Nur lesen",
  dragover: "Darüber gezogen",
};

export const stateLabel = (state: string): string => STATE_LABELS[state] ?? state;
export const partLabel = (part: string): string => PART_LABELS[part] ?? part;
export const propertyLabel = (property: string): string => PROPERTY_LABELS[property] ?? property;

/** Every Ero of the structure, then every Sxablono, each in the Modelo's order. */
export function komponentoList(bases: Bases): KomponentoEntry[] {
  return komponentoListOf(buildModelo(bases.structure.files).modelo);
}

export function komponentoListOf(modelo: Modelo): KomponentoEntry[] {
  return [
    ...modelo.eroj.map((entry) => ({
      kind: "ero" as const,
      name: entry.ero.name,
      title: entry.ero.name,
    })),
    ...(modelo.sxablonoj ?? []).map((entry) => ({
      kind: "sxablono" as const,
      name: entry.sxablono.name,
      title: entry.sxablono.name,
    })),
  ];
}

export interface Anatomio {
  part: string;
  label: string;
  /** The properties the part has, in the order of the Skemo. */
  properties: string[];
}

export interface Matrico {
  /** The axes of the variants: the keyed enum and boolean props, in Skemo order. */
  axes: string[];
  variants: Combination[];
  states: string[];
}

export interface Verhalten {
  name: string;
  kind: string;
  values: string[];
  default?: string;
  description?: string;
}

export interface Gebrauch {
  zweck?: string;
  stattdessen: { goal: string; ero?: string; kialo: string }[];
  grenzen: { case: string; action: string; ero?: string; kialo: string }[];
  dos: string[];
  donts: string[];
  tastatur: string[];
  schreibregeln: string[];
}

export interface KomponentoView {
  ref: KomponentoRef;
  title: string;
  description: string;
  agordo: Agordo;
  anatomio: Anatomio[];
  matrico: Matrico;
  /** The chosen cell: the variant with the state. */
  zelo: Combination;
  /** The Ero-Tokens of the cell, grouped by part. */
  groups: StudioGroup[];
  verhalten: Verhalten[];
  gebrauch: Gebrauch;
  /** The markup of the Ero in the preview, per variant (the tag with its props). */
  tag: string;
  /** The Skemo the view was built from (a Sxablono as a Skemo of parts), for the preview. */
  skemo: Skemo;
}

/** The context a view is built in: the composed Modelo of the draft, as the Studio reads it. */
export interface KomponentoContext {
  modelo: Modelo;
  /** The Aspekto the rows resolve in. */
  name: string;
  agordo: Agordo;
  /** Tokens the derivation writes anew (abgeleitet). */
  derived: Set<string>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const ALIAS = /^\{([a-z0-9.]+)\}$/;
const aliasOf = (value: unknown): string | undefined =>
  typeof value === "string" ? ALIAS.exec(value)?.[1] : undefined;

/** The cell from the query (`zelo=emphasis=high,intent=neutral,state=hover`); empty when absent. */
export function zeloOf(params: URLSearchParams): Combination {
  const raw = params.get("zelo");
  if (raw === null || raw === "") return {};
  const out: Record<string, string> = {};
  for (const entry of raw.split(",")) {
    const [key, value] = entry.split("=");
    if (
      key !== undefined &&
      value !== undefined &&
      /^[a-z0-9-]+$/.test(key) &&
      /^[a-z0-9-]+$/.test(value)
    )
      out[key] = value;
  }
  return out;
}

export const zeloParam = (zelo: Combination): string =>
  Object.entries(zelo)
    .map(([key, value]) => `${key}=${value}`)
    .join(",");

/** The keys a part property is keyed by, following sameAs. */
function keysOf(skemo: Skemo, source: SkemoPartSource | undefined, depth = 0): string[] {
  if (source === undefined || depth > 8) return [];
  if ("by" in source) return [...source.by];
  if ("sameAs" in source) {
    const [part = "", property = ""] = source.sameAs.split(".");
    return keysOf(skemo, skemo.parts[part]?.[property as SkemoPartProperty], depth + 1);
  }
  return [];
}

/** A Sxablono as a Skemo of parts alone, as the Ero-Tokens derive it. */
function sxablonoSkemo(entry: LoadedSxablono): Skemo {
  return {
    id: entry.skemo.id,
    ero: entry.sxablono.id,
    props: [],
    states: ["rest"],
    slots: [],
    parts: entry.skemo.parts,
    bindings: [],
    a11y: { role: "none", name: [], states: {}, keys: [] },
  } as unknown as Skemo;
}

/** The candidates an Ero-Token may alias: roles and palette steps for a colour, the scale of its role else. */
export function eroCandidatesOf(modelo: Modelo, type: string, alias: string | undefined): string[] {
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};
  if (type === "color") {
    const names = Object.values(core)
      .filter((token) => token.type === "color" && !isEroTokenName(token.name))
      .map((token) => token.name);
    const roles = names.filter((name) => !name.startsWith("color.palette.")).sort();
    const palette = names
      .filter((name) => name.startsWith("color.palette."))
      .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
    return [...roles, ...palette];
  }
  if (alias === undefined) return [];
  // The family of the role: every token of its type under the prefix of its name but the last
  // segment (size.control.*, typography.label.*, spacing.*), roles and literals alike.
  const prefix = `${alias.split(".").slice(0, -1).join(".")}.`;
  const own = Object.values(core)
    .filter(
      (token) =>
        token.type === type && !isEroTokenName(token.name) && token.name.startsWith(prefix),
    )
    .map((token) => token.name)
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  return own.length > 0 ? own : candidatesOf(modelo, alias).filter((name) => !isEroTokenName(name));
}

/** The view of a component from a context (M-4: any Modelo with the Ero, no code). */
export function komponentoViewOf(
  context: KomponentoContext,
  ref: KomponentoRef,
  kombination: Kombination,
  zelo: Combination = {},
): KomponentoView {
  const { modelo, name, agordo } = context;
  const ero =
    ref.kind === "ero" ? modelo.eroj.find((entry) => entry.ero.name === ref.name) : undefined;
  const sxablono =
    ref.kind === "sxablono"
      ? (modelo.sxablonoj ?? []).find((entry) => entry.sxablono.name === ref.name)
      : undefined;
  if (ero === undefined && sxablono === undefined) {
    throw new Error(`No ${ref.kind} ${ref.name} in the Modelo.`);
  }
  const skemo = ero !== undefined ? ero.skemo : sxablonoSkemo(sxablono as LoadedSxablono);
  const owner = ref.name;
  const prefix = ref.kind;
  const axes = ero === undefined ? [] : variantKeys(skemo).filter((key) => key !== STATE_KEY);
  const variants = ero === undefined ? [{}] : combinationsOf(skemo, axes);
  const states = ero === undefined ? ["rest"] : [...skemo.states];
  const first = variants[0] ?? {};
  // The chosen variant: the value of every axis from the cell, else the default of the prop, else
  // the first variant's — so a cell named by some axes (emphasis and intent) still lands.
  const wanted: Record<string, string> = {};
  for (const axis of axes) {
    const prop = skemo.props.find((candidate) => candidate.name === axis);
    const fallback = prop?.default === undefined ? first[axis] : String(prop.default);
    wanted[axis] = zelo[axis] ?? fallback ?? "";
  }
  const chosenVariant =
    variants.find((variant) => axes.every((axis) => variant[axis] === wanted[axis])) ??
    variants.find((variant) =>
      axes.every((axis) => zelo[axis] === undefined || variant[axis] === zelo[axis]),
    ) ??
    first;
  const state = states.includes(zelo[STATE_KEY] ?? "") ? (zelo[STATE_KEY] ?? "rest") : "rest";
  const cell: Combination = {
    ...chosenVariant,
    ...(ero === undefined ? {} : { [STATE_KEY]: state }),
  };

  const main = setTokens(modelo, `aspekto/${name}`);
  // Only the Dimensioj the Modelo has (M-4: a Modelo of its own may have fewer).
  const known = new Set(modelo.dimensioj.map((dimensio) => dimensio.name));
  const assignment = (scheme: Kombination["scheme"]) =>
    Object.fromEntries(
      Object.entries(assignmentOf(name, { ...kombination, scheme })).filter(([key]) =>
        known.has(key),
      ),
    );
  const resolved = resolveCombination(modelo, assignment(kombination.scheme)).tokens as Record<
    string,
    { value: unknown; type: string; textTransform?: { value: string } }
  >;
  const resolvedDark = resolveCombination(modelo, assignment("dark")).tokens as Record<
    string,
    { value: unknown; type: string }
  >;
  const dark = setTokens(modelo, `aspekto/${name}+color-scheme/dark`);

  const anatomio: Anatomio[] = Object.entries(skemo.parts).map(([part, properties]) => ({
    part,
    label: partLabel(part),
    properties: Object.keys(properties),
  }));

  const groups: StudioGroup[] = [];
  for (const [part, properties] of Object.entries(skemo.parts)) {
    const rows: StudioRow[] = [];
    for (const [property, source] of Object.entries(properties)) {
      if (source === undefined || "sameAs" in source) continue;
      const keys = keysOf(skemo, source);
      // Keys of the property the matrix does not span (the state of one entry, a prop the matrix
      // leaves aside): one row per value of them, named after it.
      const extra = keys.filter((key) => key !== STATE_KEY && !axes.includes(key));
      for (const combination of combinationsOf(skemo, extra)) {
        const full = { ...cell, ...combination };
        const token = eroTokenNameOf(prefix, owner, skemo, part, property, full);
        if (token === undefined) continue;
        const value = resolved[token];
        if (value === undefined) continue;
        const alias =
          aliasOf(main[token]?.value) ??
          aliasOf(modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens[token]?.value);
        const suffix = Object.entries(combination)
          .map(([key, v]) => `${key}=${v}`)
          .join(", ");
        const row: StudioRow = {
          token,
          label: `${propertyLabel(property)}${suffix === "" ? "" : ` (${suffix})`}`,
          type: value.type,
          value: value.value,
          shown: shownOf(value.value),
          herkunft: agordo.festgelegt?.[token] !== undefined ? "gesetzt" : "struktur",
          art: alias !== undefined ? "alias" : artOf(value.type),
        };
        if (alias !== undefined) {
          row.alias = alias;
          row.candidates = eroCandidatesOf(modelo, value.type, alias);
        }
        if (isRecord(value.value) && typeof value.value.unit === "string")
          row.unit = value.value.unit;
        const farbo = farboOf(value.value);
        if (farbo !== undefined) row.farbo = farbo;
        const darkValue = resolvedDark[token];
        if (value.type === "color" && darkValue !== undefined) {
          const darkAlias = aliasOf(dark[token]?.value) ?? alias;
          row.dunkel = {
            shown: shownOf(darkValue.value),
            ...(darkAlias === undefined ? {} : { alias: darkAlias }),
          };
        }
        rows.push(row);
      }
    }
    if (rows.length > 0) groups.push({ key: part, title: partLabel(part), rows });
  }

  const verhalten: Verhalten[] = skemo.props.map((prop) => ({
    name: prop.name,
    kind: prop.kind,
    values:
      prop.kind === "enum"
        ? [...(prop.values ?? [])]
        : prop.kind === "boolean"
          ? ["true", "false"]
          : [],
    ...(prop.default === undefined ? {} : { default: String(prop.default) }),
    ...(prop.description === undefined ? {} : { description: prop.description }),
  }));
  for (const [part, properties] of Object.entries(skemo.parts)) {
    if (properties.position === undefined) continue;
    verhalten.push({
      name: `${part}.position`,
      kind: "term",
      values: ["start", "end"],
      description: `Die Lage des Teils ${partLabel(part)} am Anfang oder Ende, ein Begriff des Skemo (kein Token).`,
    });
  }

  return {
    ref,
    title: ref.name,
    description: ero?.ero.description ?? sxablono?.sxablono.description ?? "",
    agordo,
    anatomio,
    matrico: { axes, variants, states },
    zelo: cell,
    groups,
    verhalten,
    gebrauch: gebrauchOf(modelo, ero, sxablono, skemo),
    tag: `fm-${ref.name}`,
    skemo,
  };
}

function artOf(type: string): StudioRow["art"] {
  if (type === "color") return "color";
  if (type === "dimension" || type === "duration") return "dimension";
  if (type === "number" || type === "fontWeight") return "number";
  if (type === "shadow") return "schatten";
  return "json";
}

/** The usage in German, from the Uzo and the Reguloj through the translations (Nachlese 8 ③). */
function gebrauchOf(
  modelo: Modelo,
  ero: LoadedEro | undefined,
  sxablono: LoadedSxablono | undefined,
  skemo: Skemo,
): Gebrauch {
  const raw = (ero?.uzo ?? sxablono?.uzo) as
    | {
        id: string;
        purpose?: string;
        instead?: { goal: string; ero?: string | null; kialo?: string }[];
        boundary?: { case: string; action: string; ero?: string; kialo?: string }[];
        composes?: {
          with?: { ero: string; kialo?: string }[];
          never?: { ero: string; kialo?: string }[];
        };
        content?: { regulo: string }[];
      }
    | undefined;
  const reguloj = new Map(modelo.reguloj.map((regulo) => [regulo.name, regulo]));
  const statementDe = (name: string): string | undefined => {
    const regulo = reguloj.get(name);
    return regulo === undefined ? undefined : reguloIn(modelo, regulo, "de").statement;
  };
  if (raw === undefined) {
    return {
      stattdessen: [],
      grenzen: [],
      dos: [],
      donts: [],
      tastatur: [...(skemo.a11y.keys ?? [])],
      schreibregeln: [],
    };
  }
  const uzo = uzoIn(modelo, raw, "de");
  return {
    ...(uzo.purpose === undefined ? {} : { zweck: uzo.purpose }),
    stattdessen: (uzo.instead ?? []).map((entry) => ({
      goal: entry.goal,
      ...(typeof entry.ero === "string" ? { ero: entry.ero } : {}),
      kialo: entry.kialo ?? "",
    })),
    grenzen: (uzo.boundary ?? []).map((entry) => ({
      case: entry.case,
      action: entry.action,
      ...(entry.ero === undefined ? {} : { ero: entry.ero }),
      kialo: entry.kialo ?? "",
    })),
    dos: (uzo.composes?.with ?? []).map((entry) => `Mit ${entry.ero}: ${entry.kialo ?? ""}`.trim()),
    donts: (uzo.composes?.never ?? []).map((entry) =>
      `Nie mit ${entry.ero}: ${entry.kialo ?? ""}`.trim(),
    ),
    tastatur: [...(skemo.a11y.keys ?? [])],
    schreibregeln: (uzo.content ?? [])
      .map((entry) => statementDe(entry.regulo))
      .filter((statement): statement is string => statement !== undefined),
  };
}

/** The view of a component for a brand: the draft composed, the rows in the combination. */
export function komponentoView(
  ref: KomponentoRef,
  agordo: Agordo,
  bases: Bases,
  kombination: Kombination,
  zelo: Combination = {},
): KomponentoView {
  const composed = composeDraft(agordo, bases);
  return komponentoViewOf(
    { modelo: composed.modelo, name: agordo.name, agordo, derived: composed.derived },
    ref,
    kombination,
    zelo,
  );
}

/** Whether the structure knows the component. */
export function komponentoRefOf(
  bases: Bases,
  kind: string,
  name: string,
): KomponentoRef | undefined {
  if (kind !== "ero" && kind !== "sxablono") return undefined;
  return komponentoList(bases).find((entry) => entry.kind === kind && entry.name === name);
}

export interface KomponentoInput {
  view: KomponentoView;
  marko: MarkoView;
  kombination: Kombination;
  komponentoj: readonly KomponentoEntry[];
  probleme: number;
  message?: string;
  expert: { href?: string; sentence?: string };
  betroffen?: string[];
}

/** The matrix variants × states: a link per cell, the chosen one marked. */
function matrixHtml(input: KomponentoInput): string {
  const { view, marko, kombination } = input;
  const { axes, variants, states } = view.matrico;
  const cellOf = (variant: Combination, state: string): Combination =>
    view.ref.kind === "ero" ? { ...variant, [STATE_KEY]: state } : { ...variant };
  const isChosen = (cell: Combination): boolean =>
    Object.keys({ ...cell, ...view.zelo }).every((key) => cell[key] === view.zelo[key]);
  const head = states
    .map((state) => `<th scope="col">${escapeHtml(stateLabel(state))}</th>`)
    .join("");
  const rows = variants
    .map((variant) => {
      const label =
        axes.length === 0
          ? view.title
          : axes.map((axis) => `${axis}=${variant[axis] ?? ""}`).join(" · ");
      const cells = states
        .map((state) => {
          const cell = cellOf(variant, state);
          const chosen = isChosen(cell);
          return `<td><a href="${komponentoUrl(marko.name, view.ref, kombination, cell)}"${chosen ? ' aria-current="true"' : ""}>${escapeHtml(stateLabel(state))}</a></td>`;
        })
        .join("");
      return `<tr><th scope="row">${escapeHtml(label)}</th>${cells}</tr>`;
    })
    .join("");
  return `<table class="mt-matrico"><caption>Varianten × Zustände – ein Klick wählt die Zelle</caption><thead><tr><th scope="col">Variante</th>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

function gebrauchHtml(gebrauch: Gebrauch): string {
  const list = (title: string, items: readonly string[]): string =>
    items.length === 0
      ? ""
      : `<fm-titolo level="3">${escapeHtml(title)}</fm-titolo><ul>${items.map((item) => `<li><fm-teksto>${escapeHtml(item)}</fm-teksto></li>`).join("")}</ul>`;
  return [
    `<fm-titolo level="2">Gebrauch</fm-titolo>`,
    gebrauch.zweck === undefined ? "" : `<fm-teksto>${escapeHtml(gebrauch.zweck)}</fm-teksto>`,
    list(
      "Stattdessen",
      gebrauch.stattdessen.map(
        (entry) =>
          `${entry.goal}${entry.ero === undefined ? "" : ` → ${entry.ero}`}: ${entry.kialo}`,
      ),
    ),
    list(
      "Grenzen",
      gebrauch.grenzen.map(
        (entry) =>
          `${entry.case}${entry.ero === undefined ? "" : ` → ${entry.ero}`}: ${entry.kialo}`,
      ),
    ),
    list("Do", gebrauch.dos),
    list("Don't", gebrauch.donts),
    list("Tastatur", gebrauch.tastatur),
    list("Schreibregeln", gebrauch.schreibregeln),
  ].join("");
}

/** The screen of a component page. */
export function komponentoScreen(input: KomponentoInput): string {
  const { view, marko, kombination } = input;
  const name = marko.name;
  const label = markoLabel(name, marko.agordo.etikedoj?.marko);
  const nav = STUDIO_PAGES.map(
    (entry) =>
      `<a href="/studio/${encodeURIComponent(name)}/${entry.key}" data-page="${entry.key}">${escapeHtml(entry.title)}</a>`,
  ).join("");
  const toggles = (Object.keys(KOMBINATION_CHOICES) as (keyof Kombination)[])
    .map(
      (key) =>
        `<fm-elekto name="${key}" value="${kombination[key]}" orientation="horizontal" size="small" data-mt-kombination="${key}">${escapeHtml(KOMBINATION_CHOICES[key].label)}${KOMBINATION_CHOICES[
          key
        ].values
          .map((value) => `<data slot="options" value="${value}">${value}</data>`)
          .join("")}</fm-elekto>`,
    )
    .join("");
  const anatomy = `<fm-titolo level="2">Anatomie</fm-titolo><ul class="mt-anatomio">${view.anatomio
    .map(
      (part) =>
        `<li><fm-teksto><strong>${escapeHtml(part.label)}</strong> <fm-teksto kind="code">${escapeHtml(part.part)}</fm-teksto> – ${escapeHtml(part.properties.map(propertyLabel).join(", "))}</fm-teksto></li>`,
    )
    .join("")}</ul>`;
  const zelo = Object.entries(view.zelo)
    .map(([key, value]) => `${key}=${key === STATE_KEY ? stateLabel(value) : value}`)
    .join(" · ");
  const groups = view.groups
    .map(
      (group) =>
        `<fm-faldilo open><span slot="summary">${escapeHtml(group.title)} <fm-teksto kind="code">${escapeHtml(group.key)}</fm-teksto></span><div class="mt-gruppe">${group.rows.map((row) => rowHtml(row, "semantik")).join("")}</div></fm-faldilo>`,
    )
    .join("");
  const verhalten = `<fm-faldilo><span slot="summary">Verhalten</span><div class="mt-gruppe">${view.verhalten
    .map(
      (entry) =>
        `<fm-teksto><strong>${escapeHtml(entry.name)}</strong> (${escapeHtml(entry.kind)}): ${escapeHtml(entry.values.join(" | ") || "–")}${entry.default === undefined ? "" : ` · Standard ${escapeHtml(entry.default)}`}${entry.description === undefined ? "" : `<br><fm-teksto kind="caption">${escapeHtml(entry.description)}</fm-teksto>`}</fm-teksto>`,
    )
    .join("")}</div></fm-faldilo>`;
  const previewSrc = `/marko/${encodeURIComponent(name)}/vorschau?sxtupo=komponento-${view.ref.kind}-${encodeURIComponent(view.ref.name)}&breite=mittel&density=${kombination.density}&contrast=${kombination.contrast}&viewport=${kombination.viewport}${Object.keys(view.zelo).length === 0 ? "" : `&zelo=${encodeURIComponent(zeloParam(view.zelo))}`}`;
  const expertLink =
    input.expert.href === undefined
      ? ""
      : `<fm-ligilo slot="actions" to="${escapeHtml(input.expert.href)}" placement="standalone" external>Expertenansicht</fm-ligilo>`;
  const body = `<fm-sxelo>
<span slot="brand">Studio</span>
<span slot="principal">Marke ${escapeHtml(label)} · Prüfung: <fm-insigno intent="${input.probleme === 0 ? "success" : "warning"}" id="mt-probleme">${input.probleme} ${input.probleme === 1 ? "Problem" : "Probleme"}</fm-insigno> <fm-butono emphasis="high" size="small" data-mt-post="/studio/${encodeURIComponent(name)}/speichern">Speichern</fm-butono></span>
${input.message === undefined ? "" : `<fm-avizo slot="notices" intent="success">${escapeHtml(input.message)}</fm-avizo>`}
<fm-avizo slot="notices" intent="warning" id="mt-studio-meldung" hidden></fm-avizo>
<fm-pagxo>
<fm-titolo slot="title" level="1" focusable>${escapeHtml(view.title)}</fm-titolo>
<fm-teksto slot="subtitle">${escapeHtml(view.description)}</fm-teksto>
${expertLink}
<section class="mt-studio">
<div><fm-navigado label="Studio" page="${view.ref.kind}-${escapeHtml(view.ref.name)}" orientation="vertical">${nav}<a href="/marko/${encodeURIComponent(name)}/farbe" data-page="schnellstart">Schnellstart</a></fm-navigado>${komponentoNav(name, input.komponentoj, kombination, view.ref)}</div>
<div class="mt-studio-vorschau"><div class="mt-zeile">${toggles}</div>${matrixHtml(input)}<iframe data-mt-vorschau data-mt-src="${previewSrc}" title="Vorschau der Komponente"></iframe>${anatomy}</div>
<fm-formularo label="${escapeHtml(view.title)}" data-action="${komponentoUrl(name, view.ref, kombination, view.zelo)}">
<fm-teksto kind="caption">Zelle: ${escapeHtml(zelo || "–")}</fm-teksto>
${groups}
${verhalten}
<fm-butono slot="actions" type="submit" emphasis="medium">Übernehmen</fm-butono>
</fm-formularo>
</section>
<section class="mt-gebrauch">${gebrauchHtml(view.gebrauch)}</section>
${input.betroffen === undefined || input.betroffen.length === 0 ? "" : `<section><fm-teksto kind="caption">Betroffene Regeln: ${escapeHtml(input.betroffen.join(", "))}</fm-teksto></section>`}
${input.expert.href === undefined ? `<section><fm-titolo level="2">Expertenansicht</fm-titolo><fm-teksto>${escapeHtml(input.expert.sentence ?? "")}</fm-teksto></section>` : ""}
</fm-pagxo>
</fm-sxelo>
<script type="application/json" id="mt-sxtupo">${jsonIsland({ studio: `${view.ref.kind}-${view.ref.name}`, marko: name, kombination, zelo: view.zelo })}</script>`;
  return screenDocument({
    title: `Studio – ${view.title} – ${name}`,
    body,
    root: {
      "data-mt-sxtupo": `komponento-${view.ref.kind}-${view.ref.name}`,
      "data-mt-marko": name,
      "data-mt-rev": String(marko.rev),
      "data-mt-scheme": kombination.scheme,
    },
  });
}

/** The props of a variant as attributes of the element. */
const attributesOf = (variant: Combination): string =>
  Object.entries(variant)
    .filter(([key]) => key !== STATE_KEY)
    .map(([key, value]) =>
      value === "true" ? ` ${key}` : value === "false" ? "" : ` ${key}="${escapeHtml(value)}"`,
    )
    .join("");

/**
 * The preview of a component: the Ero in every variant (the element with its props and a word in
 * its default slot), and per cell a swatch of its colours — fill, text, border — drawn from the
 * Ero-Tokens of the cell, so every state shows its values, the ones a pointer or the keyboard would
 * bring. A Sxablono shows its one cell.
 */
export function komponentoPreview(view: KomponentoView): string {
  const { axes, variants, states } = view.matrico;
  const { skemo } = view;
  const variable = (token: string) => `var(--fm-${token.split(".").join("-")})`;
  const swatchOf = (cell: Combination): string => {
    const swatches: string[] = [];
    for (const [part, properties] of Object.entries(skemo.parts)) {
      for (const property of Object.keys(properties)) {
        if (property !== "fill" && property !== "color") continue;
        const token = eroTokenNameOf(view.ref.kind, view.ref.name, skemo, part, property, cell);
        if (token === undefined) continue;
        swatches.push(
          `<span class="mt-farbfeld" title="${escapeHtml(`${partLabel(part)} ${propertyLabel(property)}: ${token}`)}" style="background-color: ${variable(token)}"></span>`,
        );
      }
    }
    return swatches.join("");
  };
  const rows = variants.map((variant) => {
    const label =
      axes.length === 0
        ? view.title
        : axes.map((axis) => `${axis}=${variant[axis] ?? ""}`).join(" · ");
    const element =
      view.ref.kind === "ero"
        ? `<${view.tag}${attributesOf(variant)}>${escapeHtml(view.title)}</${view.tag}>`
        : `<${view.tag}><span slot="title">${escapeHtml(view.title)}</span></${view.tag}>`;
    const cells = states
      .map((state) => {
        const cell = view.ref.kind === "ero" ? { ...variant, [STATE_KEY]: state } : { ...variant };
        return `<td><span class="mt-zelle">${swatchOf(cell)}</span></td>`;
      })
      .join("");
    return `<tr><th scope="row"><fm-teksto kind="caption">${escapeHtml(label)}</fm-teksto><div class="mt-beispiel">${element}</div></th>${cells}</tr>`;
  });
  const head = states
    .map((state) => `<th scope="col">${escapeHtml(stateLabel(state))}</th>`)
    .join("");
  return `<section class="mt-flaeche"><h2>${escapeHtml(view.title)}: Varianten × Zustände</h2><table class="mt-matrico-vorschau"><thead><tr><th scope="col">Variante</th>${head}</tr></thead><tbody>${rows.join("")}</tbody></table></section>`;
}

/** The preview of a component page from its name (`komponento-<kind>-<name>`), for the frame. */
export function komponentoPreviewOf(
  sxtupo: string,
  agordo: Agordo,
  zelo: Combination = {},
): string {
  const match = /^komponento-(ero|sxablono)-([a-z0-9-]+)$/.exec(sxtupo);
  if (match === null) return "";
  const bases = loadBases();
  const ref: KomponentoRef = { kind: match[1] as KomponentoKind, name: match[2] ?? "" };
  if (komponentoRefOf(bases, ref.kind, ref.name) === undefined) return "";
  const composed = composeDraft(agordo, bases);
  const view = komponentoViewOf(
    { modelo: composed.modelo, name: agordo.name, agordo, derived: composed.derived },
    ref,
    DEFAULT_KOMBINATION,
    zelo,
  );
  return komponentoPreview(view);
}
