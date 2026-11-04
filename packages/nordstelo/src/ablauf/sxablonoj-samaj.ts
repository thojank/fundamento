// „Gleiche Muster für gleiche Zwecke“ (Spec 037, D-06), pure and deterministic from the stored
// facts of a flow and its plan. Per screen the purposes are found by ARIA role – the explicit role
// attribute, else the role the Modelo's Skemo gives an Ero (a11y.role), else the implicit role of
// the native element – so Variante F and Variante 0 share one detection. Per purpose the pattern is
// a signature: in Variante F the Ero tag with its shaping enum props (those the Skemo's parts are
// styled by, missing values filled with the Skemo default) or the Sxablono name; in Variante 0 the
// native tag with its sorted classes. A purpose counts when it occurs on at least two screens; it
// is uniform when all its occurrences carry one signature. `kvoto` = uniform / counted purposes, 1
// when no purpose occurs on two screens (nothing could differ, as D-05 gives 1 for nothing planned).
// No prop name, role of an Ero or Sxablono is typed here: all of it is read from the Modelo.

import type { Fakto, FaktoElemento, Plano, Varianto } from "@fundamento/ekranoj";
import type { Modelo } from "@fundamento/modelo";

/** The purposes of D-06, in report order; fields are `kampo:<input kind>` (one per kind). */
export const CELOJ = [
  "cxefnavigado",
  "pagxokapo",
  "cxefago",
  "kampo",
  "listo",
  "tabelo",
  "statusmesagxo",
] as const;
export type CeloSpeco = (typeof CELOJ)[number];

/** German names of the purposes for the report. */
export const CELO_NOMOJ: Readonly<Record<CeloSpeco, string>> = {
  cxefnavigado: "Hauptnavigation",
  pagxokapo: "Seitenkopf",
  cxefago: "Hauptaktion",
  kampo: "Formularfeld",
  listo: "Liste",
  tabelo: "Tabelle",
  statusmesagxo: "Statusmeldung",
};

/** The report name of a purpose key, e.g. `kampo:email` → „Formularfeld (email)“. */
export function celoNomo(celo: string): string {
  const [speco, ...rest] = celo.split(":");
  const nomo = CELO_NOMOJ[speco as CeloSpeco] ?? celo;
  return rest.length === 0 ? nomo : `${nomo} (${rest.join(":")})`;
}

/** One purpose over the flow. */
export interface CeloRezulto {
  /** Screens on which the purpose occurs, in plan order. */
  ekranoj: string[];
  /** Signature → screens that use it (plan order); keys sorted. */
  subskriboj: Record<string, string[]>;
  /** Counted: the purpose occurs on at least two screens. */
  nombrata: boolean;
  /** Counted and one signature only. */
  unueca: boolean;
}

/** The patterns of one screen. */
export interface EkranaSxablono {
  /** Purposes found on the screen (sorted as in `celoj`). */
  celoj: string[];
  /** Counted purposes of this screen whose pattern differs between screens. */
  neunuecaj: string[];
  /** No counted purpose of this screen differs. */
  unueca: boolean;
}

export interface SxablonojRezulto {
  /** uniform / counted purposes; 1 when none is counted. */
  kvoto: number;
  nombritaj: number;
  unuecaj: number;
  celoj: Record<string, CeloRezulto>;
  perEkrano: Record<string, EkranaSxablono>;
}

export interface SxablonojEnigo {
  plano: Plano;
  faktoj: Readonly<Record<string, Fakto>>;
  varianto: Varianto;
  modelo: Modelo;
}

// --- what the Modelo says about its Eroj and Sxablonoj ------------------------------------------

interface EroKono {
  rolo: string;
  /** Enum props the Skemo's parts are styled by, sorted by name, with their default. */
  formantaj: { name: string; default?: string }[];
  /** The enum prop whose values are HTML input types (the input kind of a field), if any. */
  enigspeco?: { name: string; default?: string };
}

interface Kono {
  eroj: Map<string, EroKono>;
  sxablonoj: Set<string>;
}

/** HTML input types (HTML standard) that name what a text field takes. */
const INPUT_TYPES = new Set([
  "text",
  "email",
  "password",
  "tel",
  "url",
  "search",
  "number",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
]);

/** Every `by` list anywhere below a Skemo's parts. */
function stylingProps(parts: unknown, into: Set<string>): Set<string> {
  if (Array.isArray(parts)) {
    for (const entry of parts) stylingProps(entry, into);
  } else if (parts !== null && typeof parts === "object") {
    for (const [key, value] of Object.entries(parts)) {
      if (key === "by" && Array.isArray(value)) {
        for (const name of value) if (typeof name === "string") into.add(name);
      } else stylingProps(value, into);
    }
  }
  return into;
}

const asText = (value: unknown): string | undefined =>
  value === undefined || value === null ? undefined : String(value);

function konoDe(modelo: Modelo): Kono {
  const eroj = new Map<string, EroKono>();
  for (const entry of modelo.eroj) {
    const by = stylingProps(entry.skemo.parts, new Set());
    const enums = entry.skemo.props.filter((prop) => prop.kind === "enum");
    const formantaj = enums
      .filter((prop) => by.has(prop.name))
      .map((prop) => {
        const fallback = asText(prop.default);
        return fallback === undefined
          ? { name: prop.name }
          : { name: prop.name, default: fallback };
      })
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    const kind = enums.find(
      (prop) => (prop.values ?? []).filter((value) => INPUT_TYPES.has(value)).length >= 2,
    );
    const kindDefault = asText(kind?.default);
    eroj.set(entry.ero.name, {
      rolo: entry.skemo.a11y.role,
      formantaj,
      ...(kind === undefined
        ? {}
        : {
            enigspeco:
              kindDefault === undefined
                ? { name: kind.name }
                : { name: kind.name, default: kindDefault },
          }),
    });
  }
  const sxablonoj = new Set((modelo.sxablonoj ?? []).map((entry) => entry.sxablono.name));
  return { eroj, sxablonoj };
}

// --- roles ----------------------------------------------------------------------------------------

const fmName = (tag: string): string | undefined =>
  tag.startsWith("fm-") ? tag.slice(3) : undefined;

const BUTTON_INPUTS = new Set(["button", "submit", "reset", "image"]);

/** The implicit ARIA role of a native element (HTML-AAM, the cases the purposes need). */
function nativeRole(element: FaktoElemento): string | undefined {
  const tag = element.tag;
  if (/^h[1-6]$/.test(tag)) return "heading";
  switch (tag) {
    case "a":
      return element.attrs.href === undefined ? undefined : "link";
    case "button":
      return "button";
    case "nav":
      return "navigation";
    case "main":
      return "main";
    case "header":
      return "banner";
    case "ul":
    case "ol":
    case "menu":
    case "dl":
      // dl: browsers expose a description list as a list (and fm-atributlisto says list too).
      return "list";
    case "table":
      return "table";
    case "textarea":
      return "textbox";
    case "output":
      return "status";
    case "progress":
      return "progressbar";
    case "meter":
      return "meter";
    case "dialog":
      return "dialog";
    case "select":
      return element.attrs.multiple !== undefined || Number(element.attrs.size ?? "0") > 1
        ? "listbox"
        : "combobox";
    case "input": {
      const type = (element.attrs.type ?? "text").toLowerCase();
      if (BUTTON_INPUTS.has(type)) return "button";
      if (type === "checkbox" || type === "radio") return type;
      if (type === "range") return "slider";
      if (type === "number") return "spinbutton";
      if (type === "search") return "searchbox";
      if (type === "hidden" || type === "file") return undefined;
      return "textbox";
    }
    default:
      return undefined;
  }
}

function roleOf(element: FaktoElemento, kono: Kono): string | undefined {
  const explicit = element.attrs.role?.trim().split(/\s+/)[0];
  if (explicit !== undefined && explicit !== "") return explicit;
  const name = fmName(element.tag);
  if (name !== undefined) return kono.eroj.get(name)?.rolo;
  return nativeRole(element);
}

const FIELD_ROLES = new Set([
  "textbox",
  "searchbox",
  "combobox",
  "listbox",
  "checkbox",
  "radio",
  "radiogroup",
  "switch",
  "slider",
  "spinbutton",
]);
const TABLE_ROLES = new Set(["table", "grid", "treegrid"]);
const STATUS_ROLES = new Set(["status", "alert"]);

// --- signatures -------------------------------------------------------------------------------

function nativeSignature(element: FaktoElemento): string {
  const classes = [...new Set((element.attrs.class ?? "").split(/\s+/).filter(Boolean))].sort();
  return [element.tag, ...classes].join(".");
}

function signatureOf(element: FaktoElemento, varianto: Varianto, kono: Kono): string {
  const name = fmName(element.tag);
  if (varianto === "0" || name === undefined) return nativeSignature(element);
  const ero = kono.eroj.get(name);
  if (ero === undefined) return element.tag; // a Sxablono, or a tag the Modelo does not know
  const props = ero.formantaj.map(
    (prop) => `[${prop.name}=${element.attrs[prop.name] ?? prop.default ?? ""}]`,
  );
  return `${element.tag}${props.join("")}`;
}

/**
 * The input kind of a field (one purpose per kind): for a text field the HTML input type – of a
 * native input its `type`, of an Ero the value of its enum prop whose values are input types –
 * otherwise, and for text fields without a type (textarea, a date Ero), the role. So a search field
 * is `search` in both variants, although the browser names the native one searchbox.
 */
function fieldKind(element: FaktoElemento, role: string, kono: Kono): string {
  if (role !== "textbox" && role !== "searchbox") return role;
  const name = fmName(element.tag);
  if (name === undefined) {
    return element.tag === "input" ? (element.attrs.type ?? "text").toLowerCase() : role;
  }
  const kind = kono.eroj.get(name)?.enigspeco;
  if (kind === undefined) return role;
  return element.attrs[kind.name] ?? kind.default ?? role;
}

// --- purposes of one screen --------------------------------------------------------------------

type Trovoj = Map<string, string[]>;

function add(trovoj: Trovoj, celo: string, subskribo: string): void {
  const list = trovoj.get(celo) ?? [];
  list.push(subskribo);
  trovoj.set(celo, list);
}

function purposesOf(fakto: Fakto, varianto: Varianto, kono: Kono): Trovoj {
  const elements = fakto.elements;
  const roles = elements.map((element) => roleOf(element, kono));
  const within = (index: number, wanted: (role: string | undefined) => boolean): boolean => {
    let parent = elements[index]?.parent ?? -1;
    while (parent !== -1) {
      if (wanted(roles[parent])) return true;
      parent = elements[parent]?.parent ?? -1;
    }
    return false;
  };
  const inNavigation = (index: number) => within(index, (role) => role === "navigation");
  const descendants = (index: number): number[] =>
    elements.flatMap((_, i) => {
      let parent = elements[i]?.parent ?? -1;
      while (parent !== -1) {
        if (parent === index) return [i];
        parent = elements[parent]?.parent ?? -1;
      }
      return [];
    });
  const signature = (index: number): string => {
    const element = elements[index];
    return element === undefined ? "" : signatureOf(element, varianto, kono);
  };
  const trovoj: Trovoj = new Map();

  // Hauptnavigation: of the outermost navigations the one with the most links (first on a tie).
  const navigations = roles.flatMap((role, i) =>
    role === "navigation" && !inNavigation(i) ? [i] : [],
  );
  let main: { index: number; links: number } | undefined;
  for (const index of navigations) {
    const links = descendants(index).filter((i) => roles[i] === "link").length;
    if (main === undefined || links > main.links) main = { index, links };
  }
  if (main !== undefined) add(trovoj, "cxefnavigado", signature(main.index));
  else if (fakto.aria.some((node) => node.role === "navigation")) {
    // The landmark exists only in a shadow root: a Sxablono renders it (Variante F).
    const sxablonoj = [
      ...new Set(
        elements.flatMap((element) => {
          const name = fmName(element.tag);
          return name !== undefined && kono.sxablonoj.has(name) ? [element.tag] : [];
        }),
      ),
    ].sort();
    add(trovoj, "cxefnavigado", sxablonoj.length === 0 ? "aria:navigation" : sxablonoj.join("+"));
  }

  // Seitenkopf: the first heading.
  const heading = roles.indexOf("heading");
  if (heading !== -1) add(trovoj, "pagxokapo", signature(heading));

  // Hauptaktion: of the buttons outside a navigation the first that submits, else the first.
  const buttons = roles.flatMap((role, i) => (role === "button" && !inNavigation(i) ? [i] : []));
  const submit = buttons.find((i) => elements[i]?.attrs.type === "submit");
  const action = submit ?? buttons[0];
  if (action !== undefined) add(trovoj, "cxefago", signature(action));

  for (const [index, role] of roles.entries()) {
    const element = elements[index];
    if (role === undefined || element === undefined) continue;
    if (FIELD_ROLES.has(role)) {
      add(trovoj, `kampo:${fieldKind(element, role, kono)}`, signature(index));
    } else if (role === "list" && !inNavigation(index) && !within(index, (r) => r === "list")) {
      add(trovoj, "listo", signature(index));
    } else if (TABLE_ROLES.has(role) && !inNavigation(index)) {
      add(trovoj, "tabelo", signature(index));
    } else if (STATUS_ROLES.has(role)) {
      add(trovoj, "statusmesagxo", signature(index));
    }
  }
  return trovoj;
}

/** Purpose keys in report order: the order of CELOJ, fields by input kind. */
function compareCeloj(a: string, b: string): number {
  const rank = (celo: string) => CELOJ.indexOf((celo.split(":")[0] ?? "") as CeloSpeco);
  return rank(a) - rank(b) || (a < b ? -1 : a > b ? 1 : 0);
}

/** D-06 over one flow: purposes per screen, signatures per purpose, the share of uniform ones. */
export function sxablonojSamaj(enigo: SxablonojEnigo): SxablonojRezulto {
  const kono = konoDe(enigo.modelo);
  const perScreen = new Map<string, Trovoj>();
  for (const { slug } of enigo.plano.ekranoj) {
    const fakto = Object.hasOwn(enigo.faktoj, slug) ? enigo.faktoj[slug] : undefined;
    if (fakto !== undefined) perScreen.set(slug, purposesOf(fakto, enigo.varianto, kono));
  }

  const keys = [...new Set([...perScreen.values()].flatMap((trovoj) => [...trovoj.keys()]))].sort(
    compareCeloj,
  );
  const celoj: Record<string, CeloRezulto> = {};
  for (const celo of keys) {
    const ekranoj: string[] = [];
    const bySignature = new Map<string, string[]>();
    for (const [slug, trovoj] of perScreen) {
      const subskriboj = trovoj.get(celo);
      if (subskriboj === undefined) continue;
      ekranoj.push(slug);
      for (const subskribo of new Set(subskriboj)) {
        const screens = bySignature.get(subskribo) ?? [];
        screens.push(slug);
        bySignature.set(subskribo, screens);
      }
    }
    const subskriboj: Record<string, string[]> = {};
    for (const key of [...bySignature.keys()].sort()) subskriboj[key] = bySignature.get(key) ?? [];
    const nombrata = ekranoj.length >= 2;
    celoj[celo] = { ekranoj, subskriboj, nombrata, unueca: nombrata && bySignature.size === 1 };
  }

  const counted = Object.values(celoj).filter((celo) => celo.nombrata);
  const uniform = counted.filter((celo) => celo.unueca).length;
  const perEkrano: Record<string, EkranaSxablono> = {};
  for (const { slug } of enigo.plano.ekranoj) {
    const own = keys.filter((celo) => celoj[celo]?.ekranoj.includes(slug));
    const neunuecaj = own.filter((celo) => celoj[celo]?.nombrata && !celoj[celo]?.unueca);
    perEkrano[slug] = { celoj: own, neunuecaj, unueca: neunuecaj.length === 0 };
  }
  return {
    kvoto: counted.length === 0 ? 1 : uniform / counted.length,
    nombritaj: counted.length,
    unuecaj: uniform,
    celoj,
    perEkrano,
  };
}
