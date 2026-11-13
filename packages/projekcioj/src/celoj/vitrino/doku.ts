// The documentation page of every Ero in the Vitrino (Spec 036 Teil 5 ③, Spec 029 ③): nine
// sections in this order – Zweck, Wann nicht, Anatomie, Varianten und Größen, Zustände, Do/Don't,
// Barrierefreiheit with the contrast matrix per state, Theming, Beispiele – each heading in German
// and English for the Lingvo switch. The page of an Ero is its section with the live grid and,
// right after it, the section this module writes (`fm-vitrino-doku-<ero>`, Ansehen only).
//
// Nothing here is a table written by hand: the purpose and the three written fields come from
// the Uzo (`when-not`, `do-dont`, `keyboard`, German and English), anatomy, variants and states
// from the Skemo, the contrast matrix from the KontrastParoj Alirebleco measures (the script
// fills the ratios of the combination on screen from the data island), the Theming table from
// the Ero-Tokens, the examples from the Jugxoj. A pure function of the Modelo.

import {
  type DokuTexto,
  type EroTokeno,
  eroKontrastParojOf,
  eroTokenojOf,
  examplesOf,
  isDokuOffen,
  type LoadedEro,
  type Modelo,
  STATE_KEY,
  skemoNomoKey,
  traduko,
} from "@fundamento/modelo";
import { nomoSpan, tekstoSpan } from "../../lingvo.js";
import { iconEroOf, slotChildrenOf } from "../make-kit/ekzemplo.js";

/** The nine sections of an Ero page, in the order of Spec 029 ③. */
export const DOKU_SEKCIOJ = [
  "zweck",
  "wann-nicht",
  "anatomie",
  "varianten",
  "zustaende",
  "do-dont",
  "barrierefreiheit",
  "theming",
  "beispiele",
] as const;

/** The words of the documentation page, German and English (Spec 026 ② Lingvo switch). */
export const DOKU_TEKSTOJ: Readonly<Record<string, { de: string; en: string }>> = {
  doku: { de: "Doku", en: "Documentation" },
  "doku.zweck": { de: "Zweck", en: "Purpose" },
  "doku.wann-nicht": { de: "Wann nicht", en: "When not" },
  "doku.anatomie": { de: "Anatomie", en: "Anatomy" },
  "doku.varianten": { de: "Varianten und Größen", en: "Variants and sizes" },
  "doku.zustaende": { de: "Zustände", en: "States" },
  "doku.do-dont": { de: "Do/Don't", en: "Do/Don't" },
  "doku.barrierefreiheit": { de: "Barrierefreiheit", en: "Accessibility" },
  "doku.theming": { de: "Theming", en: "Theming" },
  "doku.beispiele": { de: "Beispiele", en: "Examples" },
  "doku.do": { de: "Do", en: "Do" },
  "doku.dont": { de: "Don't", en: "Don't" },
  "doku.tastatur": { de: "Tastatur", en: "Keyboard" },
  "doku.kontrastmatrix": { de: "Kontrastmatrix je Zustand", en: "Contrast matrix per state" },
  "doku.kol.teil": { de: "Teil", en: "Part" },
  "doku.kol.art": { de: "Art", en: "Kind" },
  "doku.kol.pflicht": { de: "Pflicht", en: "Required" },
  "doku.kol.eigenschaften": { de: "Eigenschaften", en: "Properties" },
  "doku.kol.achse": { de: "Achse", en: "Axis" },
  "doku.kol.werte": { de: "Werte", en: "Values" },
  "doku.kol.standard": { de: "Standard", en: "Default" },
  "doku.kol.veraltet": { de: "veraltet, gilt als", en: "deprecated, renders as" },
  "doku.kol.zustand": { de: "Zustand", en: "State" },
  "doku.kol.aria": { de: "ARIA", en: "ARIA" },
  "doku.kol.tasten": { de: "Tasten", en: "Keys" },
  "doku.kol.wirkung": { de: "Wirkung", en: "Effect" },
  "doku.kol.zelle": { de: "Teil und Variante", en: "Part and variant" },
  "doku.kol.token": { de: "Ero-Token", en: "Ero-Token" },
  "doku.kol.variante": { de: "Variante", en: "Variant" },
  "doku.kol.rolle": { de: "Rolle (Standard)", en: "Role (default)" },
  "doku.rolle": { de: "Rolle", en: "Role" },
  "doku.name": { de: "Name aus", en: "Name from" },
  "doku.beschreibung": { de: "Beschreibung aus", en: "Description from" },
  "doku.schalter": { de: "Schalter", en: "Switches" },
  "doku.kontrast.enkonduko": {
    de: "WCAG-Kontrast je Teil, Variante und Zustand in der gewählten Kombination, aus den Messungen der Prüfung Alirebleco: Zahl ≥ Schwelle besteht. Steht der Text auf einer eigenen Fläche, zählt dieses Paar, sonst das schwächste Paar seiner Rolle. Deaktiviert ist ausgenommen.",
    en: "WCAG contrast per part, variant and state in the chosen combination, from the measurements of the Alirebleco check: ratio ≥ threshold passes. Where the text lies on a fill of its own, that pair counts, otherwise the weakest pair of its role. Disabled is exempt.",
  },
  "doku.theming.enkonduko": {
    de: "Jedes Ero-Token mit Teil, Variante und Zustand und der Rolle, auf die es in komuna zeigt; eine Marke setzt das Token, die Farbe folgt der gewählten Marke.",
    en: "Every Ero-Token with its part, variant and state and the role it points to in komuna; a brand sets the token, the colour follows the chosen brand.",
  },
};

const escapeHtml = (text: string): string =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ??
      character,
  );

/** A word of the page in its span, German as written (the switch writes English). */
const t = (key: string): string => tekstoSpan(key, escapeHtml(DOKU_TEKSTOJ[key]?.de ?? key));

/** A text of the Uzo in both languages; the stylesheet shows the one the switch chooses. */
const bi = (text: DokuTexto): string =>
  `<span lang="de" data-fm-doku-lingvo="de">${escapeHtml(text.de)}</span><span lang="en" data-fm-doku-lingvo="en">${escapeHtml(text.en)}</span>`;

const code = (text: string): string => `<code>${escapeHtml(text)}</code>`;

const table = (caption: string, head: readonly string[], rows: readonly string[]): string =>
  `<table><caption>${caption}</caption><thead><tr>${head
    .map((cell) => `<th scope="col">${t(cell)}</th>`)
    .join("")}</tr></thead><tbody>${rows.join("")}</tbody></table>`;

/** A table that may be wider than the page: a named region the keyboard reaches (axe). */
const region = (label: string, body: string): string =>
  `<div class="fm-doku-rollo" role="region" tabindex="0" aria-label="${escapeHtml(label)}">${body}</div>`;

const sekcio = (ero: string, key: string, body: string): string =>
  `<section id="fm-doku-${ero}-${key}" data-fm-doku-sekcio="${key}"><h3>${t(`doku.${key}`)}</h3>${body}</section>`;

/** A field still holding the placeholder, or missing: the page says so in both languages. */
function open(field: string, value: unknown): string | undefined {
  if (value === undefined) {
    return `<p data-fm-doku-mankas="${field}">${bi({ de: "Fehlt.", en: "Missing." })}</p>`;
  }
  if (isDokuOffen(value)) {
    return `<p data-fm-doku-offen="${field}">${bi((value as { offen: DokuTexto }).offen)}</p>`;
  }
  return undefined;
}

/** The link to the page of an Ero (its grid) or to the Sxablonoj, with the name in its span. */
function linkTo(modelo: Modelo, name: string): string {
  const ero = modelo.eroj.find((entry) => entry.ero.name === name);
  if (ero !== undefined) {
    return `<a href="#fm-vitrino-${escapeHtml(name)}">${nomoSpan(`${ero.ero.id}/name`, escapeHtml(name))}</a>`;
  }
  const sxablono = (modelo.sxablonoj ?? []).find((entry) => entry.sxablono.name === name);
  return sxablono === undefined
    ? code(name)
    : `<a href="#fm-vitrino-sxablonoj">${nomoSpan(`${sxablono.sxablono.id}/name`, escapeHtml(name))}</a>`;
}

function zweck(modelo: Modelo, entry: LoadedEro): string {
  const uzo = entry.uzo;
  if (uzo === undefined) return open("purpose", undefined) ?? "";
  const de = traduko(modelo, "de", `${uzo.id}/purpose`, uzo.purpose);
  return `<p>${bi({ de, en: uzo.purpose })}</p>`;
}

function wannNicht(modelo: Modelo, entry: LoadedEro): string {
  const value = entry.uzo?.["when-not"];
  const marked = open("when-not", value);
  if (marked !== undefined || !Array.isArray(value)) return marked ?? "";
  return `<ul>${value
    .map((item) => `<li>${bi(item.case)} → ${linkTo(modelo, item.ero)}</li>`)
    .join("")}</ul>`;
}

function anatomie(entry: LoadedEro): string {
  const { skemo } = entry;
  const slots = new Set(skemo.slots.map((slot) => slot.name));
  const parts = Object.keys(skemo.parts);
  const names = [
    ...parts,
    ...skemo.slots.map((slot) => slot.name).filter((s) => !parts.includes(s)),
  ];
  const rows = names.map((name) => {
    const isPart = parts.includes(name);
    const isSlot = slots.has(name);
    const kind =
      isPart && isSlot
        ? bi({ de: "Teil und Slot", en: "part and slot" })
        : isSlot
          ? bi({ de: "Slot", en: "slot" })
          : bi({ de: "Teil", en: "part" });
    const required = !isSlot
      ? "–"
      : entry.uzo?.slots[name]?.required === true
        ? bi({ de: "Pflicht", en: "required" })
        : bi({ de: "optional", en: "optional" });
    const properties = Object.keys(skemo.parts[name] ?? {});
    return `<tr><th scope="row">${code(name)}</th><td>${kind}</td><td>${required}</td><td>${properties.length === 0 ? "–" : properties.map(code).join(", ")}</td></tr>`;
  });
  return table(
    `${escapeHtml(entry.ero.name)}: ${t("doku.anatomie")}`,
    ["doku.kol.teil", "doku.kol.art", "doku.kol.pflicht", "doku.kol.eigenschaften"],
    rows,
  );
}

function varianten(entry: LoadedEro): string {
  const { skemo } = entry;
  const prop = (name: string) => nomoSpan(skemoNomoKey(skemo.id, "props", name), escapeHtml(name));
  const value = (name: string, v: string) =>
    nomoSpan(skemoNomoKey(skemo.id, "props", name, v), escapeHtml(v));
  const axes = skemo.props.filter((p) => p.kind === "enum");
  const rows = axes.map((p) => {
    const deprecated = Object.entries(p.deprecatedValues ?? {})
      .map(([old, now]) => `${code(old)} → ${value(p.name, now)}`)
      .join(", ");
    return `<tr><th scope="row">${prop(p.name)}</th><td>${(p.values ?? []).map((v) => value(p.name, String(v))).join(", ")}</td><td>${p.default === undefined ? "–" : value(p.name, String(p.default))}</td><td>${deprecated === "" ? "–" : deprecated}</td></tr>`;
  });
  const switches = skemo.props.filter(
    (p) => p.kind === "boolean" && !skemo.states.includes(p.name),
  );
  return `${
    rows.length === 0
      ? `<p>${bi({ de: "Keine Achse.", en: "No axis." })}</p>`
      : table(
          `${escapeHtml(entry.ero.name)}: ${t("doku.varianten")}`,
          ["doku.kol.achse", "doku.kol.werte", "doku.kol.standard", "doku.kol.veraltet"],
          rows,
        )
  }${switches.length === 0 ? "" : `<p>${t("doku.schalter")}: ${switches.map((p) => prop(p.name)).join(", ")}</p>`}`;
}

function zustaende(entry: LoadedEro): string {
  const { skemo } = entry;
  const rows = skemo.states.map((state) => {
    const aria = skemo.a11y.states[state] ?? [];
    return `<tr><th scope="row">${nomoSpan(skemoNomoKey(skemo.id, "states", state), escapeHtml(state))}</th><td>${aria.length === 0 ? "–" : aria.map(code).join(", ")}</td></tr>`;
  });
  return table(
    `${escapeHtml(entry.ero.name)}: ${t("doku.zustaende")}`,
    ["doku.kol.zustand", "doku.kol.aria"],
    rows,
  );
}

function doDont(entry: LoadedEro): string {
  const value = entry.uzo?.["do-dont"];
  const marked = open("do-dont", value);
  if (marked !== undefined || value === undefined || !("do" in value)) return marked ?? "";
  const list = (items: readonly DokuTexto[]) =>
    `<ul>${items.map((item) => `<li>${bi(item)}</li>`).join("")}</ul>`;
  return `<h4>${t("doku.do")}</h4>${list(value.do)}<h4>${t("doku.dont")}</h4>${list(value.dont)}`;
}

function tastatur(entry: LoadedEro): string {
  const value = entry.uzo?.keyboard;
  const marked = open("keyboard", value);
  if (marked !== undefined || value === undefined) return marked ?? "";
  if (!Array.isArray(value)) {
    return "none" in value ? `<p>${bi(value.none)}</p>` : "";
  }
  return table(
    `${escapeHtml(entry.ero.name)}: ${t("doku.tastatur")}`,
    ["doku.kol.tasten", "doku.kol.wirkung"],
    value.map(
      (row) =>
        `<tr><th scope="row">${row.keys.map((key) => `<kbd>${escapeHtml(key)}</kbd>`).join(" ")}</th><td>${bi(row.action)}</td></tr>`,
    ),
  );
}

/** `key=value · key=value` of a combination without its state. */
const variantOf = (when: Readonly<Record<string, string>>): string =>
  Object.entries(when)
    .filter(([key]) => key !== STATE_KEY)
    .map(([key, value]) => `${key}=${value}`)
    .join(" · ");

/** States that are not read, so their pairs are not measured (as Alirebleco exempts them). */
const EXEMPT_STATES: ReadonlySet<string> = new Set(["disabled"]);

/**
 * The contrast matrix per state: per foreground part (a colour Ero-Token) and variant one row,
 * per state of the Skemo one column. A cell names the pairs whose measurement it shows: the
 * Ero's own pair where a brand departs from the roles (`data-fm-doku-paro`, measured only then),
 * else the declared pair of its roles on its own fill, or – for a text beside the element – every
 * declared pair of its foreground role; the script writes the weakest ratio of the combination.
 */
function kontrastmatrix(modelo: Modelo, entry: LoadedEro, tokens: readonly EroTokeno[]): string {
  const colours = tokens.filter((token) => token.property === "color");
  if (colours.length === 0) return "";
  const declared = new Map(
    modelo.kontrastParoj.map((pair) => [`${pair.foreground} ${pair.background}`, pair.name]),
  );
  const alias = new Map(tokens.map((token) => [token.name, token.alias]));
  const onFill = new Map<string, { own: string; roles: string }[]>();
  for (const pair of eroKontrastParojOf(modelo, false)) {
    if (pair.ero !== entry.ero.name) continue;
    const roles = declared.get(`${alias.get(pair.foreground)} ${alias.get(pair.background)}`);
    onFill.set(pair.foreground, [
      ...(onFill.get(pair.foreground) ?? []),
      { own: pair.name, roles: roles ?? "" },
    ]);
  }
  const byForeground = new Map<string, string[]>();
  for (const pair of modelo.kontrastParoj) {
    byForeground.set(pair.foreground, [...(byForeground.get(pair.foreground) ?? []), pair.name]);
  }
  const states = entry.skemo.states;
  const rows = new Map<string, { label: string; cells: Map<string, EroTokeno> }>();
  for (const token of colours) {
    const variant = variantOf(token.when);
    const key = `${token.part}|${variant}`;
    const row = rows.get(key) ?? {
      label: `${code(token.part)}${variant === "" ? "" : ` · ${escapeHtml(variant)}`}`,
      cells: new Map<string, EroTokeno>(),
    };
    const state = token.when[STATE_KEY];
    if (state === undefined) {
      for (const each of states) if (!row.cells.has(each)) row.cells.set(each, token);
    } else {
      row.cells.set(state, token);
    }
    rows.set(key, row);
  }
  const cell = (state: string, token: EroTokeno | undefined): string => {
    if (token === undefined) return "<td>–</td>";
    if (EXEMPT_STATES.has(state)) {
      return `<td>${bi({ de: "ausgenommen", en: "exempt" })}</td>`;
    }
    const own = onFill.get(token.name);
    const roles =
      own !== undefined
        ? own.map((pair) => pair.roles).filter((name) => name !== "")
        : (byForeground.get(token.alias) ?? []);
    const paro = own?.map((pair) => pair.own).join(" ") ?? "";
    return `<td data-fm-doku-paroj="${escapeHtml([...new Set(roles)].join(" "))}"${paro === "" ? "" : ` data-fm-doku-paro="${escapeHtml(paro)}"`}>–</td>`;
  };
  const body = [...rows.values()].map(
    (row) =>
      `<tr><th scope="row">${row.label}</th>${states.map((state) => cell(state, row.cells.get(state))).join("")}</tr>`,
  );
  const head = `<thead><tr><th scope="col">${t("doku.kol.zelle")}</th>${states
    .map(
      (state) =>
        `<th scope="col">${nomoSpan(skemoNomoKey(entry.skemo.id, "states", state), escapeHtml(state))}</th>`,
    )
    .join("")}</tr></thead>`;
  return `<h4>${t("doku.kontrastmatrix")}</h4><p>${t("doku.kontrast.enkonduko")}</p>${region(
    `${entry.ero.name}: Kontrastmatrix`,
    `<table><caption>${escapeHtml(entry.ero.name)}: ${t("doku.kontrastmatrix")}</caption>${head}<tbody>${body.join("")}</tbody></table>`,
  )}`;
}

function barrierefreiheit(modelo: Modelo, entry: LoadedEro, tokens: readonly EroTokeno[]): string {
  const { a11y } = entry.skemo;
  const list = (values: readonly string[] | undefined) =>
    values === undefined || values.length === 0 ? "–" : values.map(code).join(", ");
  return `<dl class="fm-doku-a11y"><div><dt>${t("doku.rolle")}</dt><dd>${code(a11y.role)}</dd></div><div><dt>${t("doku.name")}</dt><dd>${list(a11y.name)}</dd></div><div><dt>${t("doku.beschreibung")}</dt><dd>${list(a11y.description)}</dd></div></dl><h4>${t("doku.tastatur")}</h4>${tastatur(entry)}${kontrastmatrix(modelo, entry, tokens)}`;
}

function theming(entry: LoadedEro, tokens: readonly EroTokeno[]): string {
  const rows = tokens.map((token) => {
    const swatch =
      token.type === "color"
        ? `<span class="fm-swatch" style="background-color: var(--fm-${token.name.replaceAll(".", "-")})" aria-hidden="true"></span> `
        : "";
    const state = token.when[STATE_KEY];
    const variant = variantOf(token.when);
    return `<tr data-fm-token="${escapeHtml(token.name)}"><th scope="row">${code(token.name)}</th><td>${code(token.part)}</td><td>${code(token.property)}</td><td>${variant === "" ? "–" : escapeHtml(variant)}</td><td>${state === undefined ? "–" : escapeHtml(state)}</td><td>${swatch}${code(token.alias)}</td></tr>`;
  });
  return `<p>${t("doku.theming.enkonduko")}</p>${region(
    `${entry.ero.name}: Theming`,
    table(
      `${escapeHtml(entry.ero.name)}: ${t("doku.theming")}`,
      [
        "doku.kol.token",
        "doku.kol.teil",
        "doku.kol.eigenschaften",
        "doku.kol.variante",
        "doku.kol.zustand",
        "doku.kol.rolle",
      ],
      rows,
    ),
  )}`;
}

/**
 * An example as code. A label may be an address (the ligilo's examples); its colon stands as a
 * character reference, so the page holds no literal address – it shows text and fetches nothing.
 */
const exampleCode = (text: string): string =>
  `<code>${escapeHtml(text).replaceAll(":", "&#58;")}</code>`;

const DECISIONS: Readonly<Record<string, DokuTexto>> = {
  approved: { de: "richtig", en: "right" },
  rejected: { de: "falsch", en: "wrong" },
  "deviation-recorded": { de: "Abweichung festgehalten", en: "deviation recorded" },
};

function beispiele(modelo: Modelo, entry: LoadedEro): string {
  const examples = examplesOf(modelo, entry);
  const iconEro = iconEroOf(modelo.eroj);
  const markupOf = (instance: (typeof examples)[number]["instances"][number]): string => {
    const attributes = Object.entries(instance.props)
      .map(([name, value]) => (value === true ? ` ${name}` : ` ${name}="${String(value)}"`))
      .join("");
    // Spec 053 (Q-5): the filled slots as children, as the Make Kit writes them; an icon-only
    // example shows its icon, not an empty element.
    return `<fm-${instance.ero}${attributes}>${slotChildrenOf(instance, iconEro)}${instance.label ?? ""}</fm-${instance.ero}>`;
  };
  const items = examples.map(
    (example) =>
      `<li data-fm-doku-ekzemplo="${escapeHtml(example.jugxo)}"><strong>${bi(DECISIONS[example.decision] ?? { de: example.decision, en: example.decision })}</strong>: ${example.instances.map((instance) => exampleCode(markupOf(instance))).join(" ")} – <span lang="en">${escapeHtml(example.kialo)}</span></li>`,
  );
  const grid = `<p><a href="#fm-vitrino-${escapeHtml(entry.ero.name)}">${bi({
    de: "Jede Variante in jedem Zustand: das Raster über dieser Doku",
    en: "Every variant in every state: the grid above this documentation",
  })}</a></p>`;
  return `${items.length === 0 ? `<p>${bi({ de: "Noch kein Beispiel aus einer Jugxo.", en: "No example from a Jugxo yet." })}</p>` : `<ul>${items.join("")}</ul>`}${grid}`;
}

/** The body of the documentation section of one Ero: the nine sections in order. */
export function dokuMarkup(modelo: Modelo, entry: LoadedEro): string {
  const ero = entry.ero.name;
  const tokens = eroTokenojOf(entry);
  const bodies: Record<(typeof DOKU_SEKCIOJ)[number], string> = {
    zweck: zweck(modelo, entry),
    "wann-nicht": wannNicht(modelo, entry),
    anatomie: anatomie(entry),
    varianten: varianten(entry),
    zustaende: zustaende(entry),
    "do-dont": doDont(entry),
    barrierefreiheit: barrierefreiheit(modelo, entry, tokens),
    theming: theming(entry, tokens),
    beispiele: beispiele(modelo, entry),
  };
  return DOKU_SEKCIOJ.map((key) => sekcio(ero, key, bodies[key])).join("");
}

/** The documentation of every Ero of the Modelo, by name (Spec 036 ③). */
export function dokuOf(modelo: Modelo): Record<string, string> {
  return Object.fromEntries(
    modelo.eroj.map((entry) => [entry.ero.name, dokuMarkup(modelo, entry)]),
  );
}
