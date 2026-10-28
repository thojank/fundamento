// The foundation pages of the Vitrino (Spec 029 ① 5): Tokens, Farbe, Elevation, Form, Abstände,
// Typografie, Bewegung and Icons. The structure follows the Fonto – a scale shown as a pattern,
// colour roles as pairs light/dark with their contrast, the type scale with its roles – with texts
// of Fundamento's own. Every value is measured at build time from the resolved combinations of
// every brand; the page shows the chosen brand (the script fills the values, it computes nothing).

import {
  alphaOf,
  compositeOver,
  type Modelo,
  readDtcgColor,
  WCAG2_METRIC,
} from "@fundamento/modelo";
import { tekstoSpan } from "../../lingvo.js";

/** The level of a token in the Vortaro (Art. IV): a foundation, a role or an Ero-Token. */
export type Ebeno = "grundlage" | "rolle" | "ero";

/** The light and the dark value of a token in the base combination of a brand. */
export interface BazoValoro {
  light: string;
  dark: string;
}

/** Where a value comes from: a Fonto with its key and how it was taken, or the set of the brand. */
export interface BazoDeveno {
  fonto?: string;
  maniero?: string;
  sxlosilo?: string;
  jugxo?: string;
  aro: string;
}

export interface VitrinoBazoj {
  tokenoj: {
    name: string;
    ebeno: Ebeno;
    tipo: string;
    valoroj: Record<string, BazoValoro>;
    deveno: Record<string, BazoDeveno>;
  }[];
  koloro: Record<
    string,
    {
      token: string;
      light: string;
      dark: string;
      /** WCAG 2.x on color.background.default, for a text, border, icon or focus colour. */
      kontrasto?: { light: number; dark: number };
    }[]
  >;
  elevacio: Record<string, { token: string; valoro: string; dark: string }[]>;
  formo: Record<string, { token: string; valoro: string }[]>;
  spacoj: Record<string, { token: string; valoro: string }[]>;
  tipografio: Record<
    string,
    { token: string; familio: string; grandeco: string; linio: string; pezo: string }[]
  >;
  movado: Record<string, { token: string; valoro: string }[]>;
  /** The names of the Ikonaro, drawn by the chosen brand's glyphs. */
  ikonoj: string[];
}

interface Rezolvo {
  assignment: Record<string, string>;
  tokens: Record<string, { value?: unknown; type?: string; origin?: { set?: string } }>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const round = (value: number, digits = 2): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

/** A value as the pages show it: a colour as hex (with its alpha), a measure with its unit. */
export function shown(value: unknown): string {
  const color = readDtcgColor(value);
  if (color !== undefined && isRecord(value) && typeof value.hex === "string") {
    const alpha = alphaOf(color);
    return alpha < 1 ? `${value.hex} · ${Math.round(alpha * 1000) / 10} %` : value.hex;
  }
  if (isRecord(value) && typeof value.value === "number" && typeof value.unit === "string") {
    return `${value.value}${value.unit}`;
  }
  if (Array.isArray(value) && value.length === 4 && value.every((n) => typeof n === "number")) {
    return `cubic-bezier(${value.join(", ")})`;
  }
  if (Array.isArray(value) && value.every((entry) => typeof entry === "string")) {
    return value.join(", ");
  }
  if (Array.isArray(value) || (isRecord(value) && "offsetY" in value)) {
    const layers = Array.isArray(value) ? value : [value];
    return layers
      .map((layer) => {
        if (!isRecord(layer)) return "";
        const measure = (key: string) => shown(layer[key]);
        return `${layer.inset === true ? "inset " : ""}${measure("offsetX")} ${measure("offsetY")} ${measure("blur")} ${measure("spread")} ${shown(layer.color)}`;
      })
      .join(", ");
  }
  if (isRecord(value)) {
    if ("fontSize" in value) {
      return `${shown(value.fontFamily)} · ${shown(value.fontSize)} / ${shown(value.lineHeight)} · ${shown(value.fontWeight)}`;
    }
    return Object.entries(value)
      .map(([key, entry]) => `${key} ${shown(entry)}`)
      .join(" · ");
  }
  return value === undefined ? "–" : String(value);
}

/** The level of a token: an Ero-Token by its name, a literal of the core a foundation, else a role. */
function ebenoOf(name: string, core: Rezolvo["tokens"][string] | undefined, modelo: Modelo): Ebeno {
  if (name.startsWith("ero.") || name.startsWith("sxablono.")) return "ero";
  const set = modelo.setoj.find((entry) => entry.name === "core");
  const raw = set?.tokens[name]?.value;
  if (typeof raw === "string" && raw.startsWith("{")) return "rolle";
  if (isRecord(raw) && Object.values(raw).some((v) => typeof v === "string" && v.startsWith("{")))
    return "rolle";
  return core === undefined ? "rolle" : "grundlage";
}

const TEXT_LIKE =
  /^color\.(text|link|border|focus\.ring|status\.[a-z]+\.(text|border|basic)|navigation\.text)/;

/** The base combination of a brand and colour scheme: every other Dimensio at its default. */
function baseOf(
  rezolvoj: readonly Rezolvo[],
  modelo: Modelo,
  aspekto: string,
  scheme: string,
): Rezolvo | undefined {
  const defaults = Object.fromEntries(
    modelo.dimensioj
      .filter((dimensio) => dimensio.name !== "aspekto")
      .map((dimensio) => [dimensio.name, dimensio.default]),
  );
  return rezolvoj.find(
    (rezolvo) =>
      rezolvo.assignment.aspekto === aspekto &&
      Object.entries({ ...defaults, "color-scheme": scheme }).every(
        ([key, value]) => rezolvo.assignment[key] === value,
      ),
  );
}

export function bazojDatumoj(
  modelo: Modelo,
  rezolvoj: readonly Rezolvo[],
  aspektoj: readonly string[],
): VitrinoBazoj {
  const bases = aspektoj.map((aspekto) => ({
    aspekto,
    light: baseOf(rezolvoj, modelo, aspekto, "light"),
    dark: baseOf(rezolvoj, modelo, aspekto, "dark"),
  }));
  const first = bases[0]?.light;
  const names = Object.keys(first?.tokens ?? {}).sort();
  const deveno = new Map<string, BazoDeveno>();
  for (const entry of modelo.deveno ?? []) {
    const key = `${entry.aspekto}|${entry.token}`;
    // The value of the base combination: the core's entry before a conjunction set's.
    if (deveno.has(key) && entry.aro !== "core") continue;
    deveno.set(key, {
      fonto: entry.fonto,
      maniero: entry.maniero,
      sxlosilo: entry.sxlosilo,
      ...(entry.jugxo === undefined ? {} : { jugxo: entry.jugxo }),
      aro: entry.aro,
    });
  }
  const tokenoj = names.map((name) => ({
    name,
    ebeno: ebenoOf(name, first?.tokens[name], modelo),
    tipo: first?.tokens[name]?.type ?? "",
    valoroj: Object.fromEntries(
      bases.map(({ aspekto, light, dark }) => [
        aspekto,
        { light: shown(light?.tokens[name]?.value), dark: shown(dark?.tokens[name]?.value) },
      ]),
    ),
    deveno: Object.fromEntries(
      bases.map(({ aspekto, light }) => [
        aspekto,
        deveno.get(`${aspekto}|${name}`) ?? { aro: light?.tokens[name]?.origin?.set ?? "core" },
      ]),
    ),
  }));
  const per = <T>(pick: (base: (typeof bases)[number]) => T[]): Record<string, T[]> =>
    Object.fromEntries(bases.map((base) => [base.aspekto, pick(base)]));
  const of = (base: Rezolvo | undefined, name: string) => base?.tokens[name]?.value;
  const filter = (pattern: RegExp) => names.filter((name) => pattern.test(name));
  const contrast = (base: Rezolvo | undefined, name: string): number | undefined => {
    const fg = readDtcgColor(of(base, name));
    const bg = readDtcgColor(of(base, "color.background.default"));
    if (fg === undefined || bg === undefined) return undefined;
    return round(WCAG2_METRIC.compute(alphaOf(fg) < 1 ? compositeOver(fg, bg) : fg, bg));
  };
  return {
    tokenoj,
    koloro: per(({ light, dark }) =>
      filter(/^color\.(?!palette\.)/).map((token) => {
        const l = contrast(light, token);
        const d = contrast(dark, token);
        return {
          token,
          light: shown(of(light, token)),
          dark: shown(of(dark, token)),
          ...(TEXT_LIKE.test(token) && l !== undefined && d !== undefined
            ? { kontrasto: { light: l, dark: d } }
            : {}),
        };
      }),
    ),
    elevacio: per(({ light, dark }) =>
      ["raised", "overlay", "floating", "modal"].map((level) => ({
        token: `elevation.shadow.${level}`,
        valoro: shown(of(light, `elevation.shadow.${level}`)),
        dark: shown(of(dark, `elevation.shadow.${level}`)),
      })),
    ),
    formo: per(({ light }) =>
      filter(/^radius\./).map((token) => ({ token, valoro: shown(of(light, token)) })),
    ),
    spacoj: per(({ light }) =>
      filter(/^spacing\./).map((token) => ({ token, valoro: shown(of(light, token)) })),
    ),
    tipografio: per(({ light }) =>
      filter(/^typography\./).map((token) => {
        const value = of(light, token);
        const field = (key: string) => (isRecord(value) ? value[key] : undefined);
        const family = field("fontFamily");
        return {
          token,
          familio: Array.isArray(family) ? String(family[0]) : shown(family),
          grandeco: shown(field("fontSize")),
          linio: shown(field("lineHeight")),
          pezo: shown(field("fontWeight")),
        };
      }),
    ),
    movado: per(({ light }) =>
      filter(/^motion\.(duration|easing)\.(?!scale|curve)/).map((token) => ({
        token,
        valoro: shown(of(light, token)),
      })),
    ),
    ikonoj: modelo.ikonaro.map((ikono) => ikono.name),
  };
}

const escapeHtml = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/** The texts of the pages, German in the HTML and English in VITRINO_TEKSTOJ (bazoj.ts below). */
export const BAZOJ_TEKSTOJ: Readonly<Record<string, { de: string; en: string }>> = {
  tokenoj: { de: "Tokens", en: "Tokens" },
  "tokenoj.enkonduko": {
    de: "Jeder Token des Vortaro, mit seiner Ebene, seinem Wert in der gewählten Marke hell und dunkel und seiner Herkunft. Grundlagen sind Paletten und Skalen, Rollen geben ihnen eine Bedeutung, Ero-Tokens binden eine Rolle an einen Teil einer Komponente. Die Suche filtert nach Namen.",
    en: "Every token of the Vortaro with its level, its value in the chosen brand, light and dark, and its origin. Foundations are palettes and scales, roles give them a meaning, Ero-Tokens bind a role to a part of a component. The search filters by name.",
  },
  "tokenoj.sercxo": { de: "Token suchen", en: "Search tokens" },
  "tokenoj.tabelo": { de: "Alle Tokens der gewählten Marke", en: "All tokens of the chosen brand" },
  koloro: { de: "Farbe", en: "Colour" },
  "koloro.enkonduko": {
    de: "Die Farbrollen der gewählten Marke als Paar aus hellem und dunklem Modus. Für Text, Rahmen und Fokus steht daneben der Kontrast auf der Fläche; die Prüfung verlangt 4,5:1 für Text und 3:1 für Bedienelemente. Die Paletten, aus denen die Rollen wählen, zeigt der Abschnitt Paletten.",
    en: "The colour roles of the chosen brand as a pair of light and dark mode. For text, borders and focus the contrast on the surface stands beside them; the check asks 4.5:1 for text and 3:1 for controls. The palettes the roles pick from are in the section Palettes.",
  },
  "koloro.tabelo": { de: "Farbrollen hell und dunkel", en: "Colour roles, light and dark" },
  elevacio: { de: "Elevation", en: "Elevation" },
  "elevacio.enkonduko": {
    de: "Vier Höhen: angehoben für Karten, Overlay für Menüs und Auswahllisten, schwebend für Hinweise, modal für Dialoge. Eine höhere Ebene wirft einen weiteren, weicheren Schatten; im Dunkeln zeichnet eine feine Lichtkante den Rand. Die Fläche selbst bleibt von der Seite unterscheidbar, auch ohne Schatten.",
    en: "Four heights: raised for cards, overlay for menus and option lists, floating for notices, modal for dialogs. A higher level casts a wider, softer shadow; in the dark a thin rim of light draws the edge. The surface stays distinct from the page without a shadow too.",
  },
  "elevacio.tabelo": { de: "Schatten je Höhe", en: "Shadow per height" },
  formo: { de: "Form", en: "Shape" },
  "formo.enkonduko": {
    de: "Die Radien der gewählten Marke. Ein Bedienelement nimmt den Radius für Elemente, eine Fläche den für Container, eine Pille den vollen. Liegt ein Element in einem anderen, wird sein Radius um den Abstand dazwischen kleiner, damit die Ecken parallel laufen.",
    en: "The radii of the chosen brand. A control takes the radius for elements, a surface the one for containers, a pill the full one. When an element sits inside another, its radius shrinks by the gap between them, so the corners run parallel.",
  },
  "formo.tabelo": { de: "Radien", en: "Radii" },
  spacoj: { de: "Abstände", en: "Spacing" },
  "spacoj.enkonduko": {
    de: "Die Abstandsskala in Schritten von vier Pixeln und die Rollen, die aus ihr wählen. Die Dimensio Dichte verschiebt die Rollen um eine Stufe; die Skala bleibt.",
    en: "The spacing scale in steps of four pixels and the roles that pick from it. The Dimensio density moves the roles by one step; the scale stays.",
  },
  "spacoj.tabelo": { de: "Abstände", en: "Spacing" },
  tipografio: { de: "Typografie", en: "Typography" },
  "tipografio.enkonduko": {
    de: "Die Schriftrollen mit Größe, Zeilenhöhe und Gewicht. Die Größen folgen einer Skala aus Basis und Verhältnis; bei schmaler Breite wächst die Basis, die größten Stufen bleiben. Jede Marke bringt ihre eigenen Schriftfamilien mit.",
    en: "The type roles with size, line height and weight. The sizes follow a scale of base and ratio; at a narrow width the base grows and the largest steps stay. Every brand brings its own families.",
  },
  "tipografio.tabelo": { de: "Schriftrollen", en: "Type roles" },
  movado: { de: "Bewegung", en: "Motion" },
  "movado.enkonduko": {
    de: "Dauern und Kurven der Bewegung. Kurze Dauern für Rückmeldungen, mittlere für Wechsel des Inhalts, lange für große Flächen. Wer weniger Bewegung wünscht, bekommt Dauern von null und eine lineare Kurve (Dimensio Bewegung).",
    en: "Durations and curves of motion. Short durations for feedback, medium ones for changes of content, long ones for large surfaces. Whoever asks for less motion gets durations of zero and a linear curve (Dimensio motion).",
  },
  "movado.tabelo": { de: "Dauern und Kurven", en: "Durations and curves" },
  ikonoj: { de: "Icons", en: "Icons" },
  "ikonoj.enkonduko": {
    de: "Das Ikonaro: jeder Name, den eine Komponente zeichnet, im Strich der gewählten Marke. Die Glyphen stehen im Paket der Marke mit ihrer Herkunft; ein Icon nimmt die Farbe des Textes um es herum.",
    en: "The Ikonaro: every name a component draws, in the stroke of the chosen brand. The glyphs live in the brand's package with their provenance; an icon takes the colour of the text around it.",
  },
  "bazoj.token": { de: "Token", en: "Token" },
  "bazoj.ebeno": { de: "Ebene", en: "Level" },
  "bazoj.hell": { de: "Hell", en: "Light" },
  "bazoj.dunkel": { de: "Dunkel", en: "Dark" },
  "bazoj.herkunft": { de: "Herkunft", en: "Origin" },
  "bazoj.kontrast": { de: "Kontrast hell / dunkel", en: "Contrast light / dark" },
  "bazoj.wert": { de: "Wert", en: "Value" },
  "bazoj.muster": { de: "Muster", en: "Sample" },
  "bazoj.familie": { de: "Familie", en: "Family" },
  "bazoj.groesse": { de: "Größe", en: "Size" },
  "bazoj.zeile": { de: "Zeilenhöhe", en: "Line height" },
  "bazoj.gewicht": { de: "Gewicht", en: "Weight" },
};

const t = (key: string): string => tekstoSpan(key, escapeHtml(BAZOJ_TEKSTOJ[key]?.de ?? key));
const intro = (key: string): string => `<p class="fm-bazoj-enkonduko">${t(`${key}.enkonduko`)}</p>`;
const head = (keys: string[]): string =>
  `<thead><tr>${keys.map((key) => `<th scope="col">${t(key)}</th>`).join("")}</tr></thead>`;
const cssVar = (token: string): string => `var(--fm-${token.replaceAll(".", "-")})`;
const cell = (token: string, field: string, value: string): string =>
  `<td data-fm-bazoj="${escapeHtml(token)}|${field}">${escapeHtml(value)}</td>`;
const swatch = (token: string, field: string, value: string): string =>
  `<td><span class="fm-bazoj-specimeno" data-fm-bazoj-specimeno="${escapeHtml(token)}|${field}"></span><span data-fm-bazoj="${escapeHtml(token)}|${field}">${escapeHtml(value)}</span></td>`;

/** The eight pages as sections of the Vitrino, with the values of the first brand. */
export function bazojSections(
  bazoj: VitrinoBazoj,
  aspekto: string,
  section: (id: string, title: string, body: string) => string,
): string {
  const ikonoj = bazoj.ikonoj;
  const tokens = bazoj.tokenoj
    .map((token) => {
      const value = token.valoroj[aspekto];
      return `<tr data-fm-bazoj-token="${escapeHtml(token.name)}"><th scope="row"><code>${escapeHtml(token.name)}</code></th><td>${escapeHtml(token.ebeno)}</td>${cell(token.name, "light", value?.light ?? "–")}${cell(token.name, "dark", value?.dark ?? "–")}${cell(token.name, "deveno", "")}</tr>`;
    })
    .join("");
  const koloro = (bazoj.koloro[aspekto] ?? [])
    .map(
      (row) =>
        `<tr><th scope="row"><code>${escapeHtml(row.token)}</code></th>${swatch(row.token, "light", row.light)}${swatch(row.token, "dark", row.dark)}${cell(row.token, "kontrasto", row.kontrasto === undefined ? "–" : `${row.kontrasto.light} / ${row.kontrasto.dark}`)}</tr>`,
    )
    .join("");
  const scale = (
    rows: { token: string; valoro: string }[],
    sample: (token: string) => string,
  ): string =>
    rows
      .map(
        (row) =>
          `<tr><th scope="row"><code>${escapeHtml(row.token)}</code></th><td>${sample(row.token)}</td>${cell(row.token, "valoro", row.valoro)}</tr>`,
      )
      .join("");
  const elevacio = (bazoj.elevacio[aspekto] ?? [])
    .map(
      (row) =>
        `<tr><th scope="row"><code>${escapeHtml(row.token)}</code></th><td><div class="fm-bazoj-alteco" style="box-shadow: ${cssVar(row.token)}"></div></td>${cell(row.token, "valoro", row.valoro)}${cell(row.token, "dark", row.dark)}</tr>`,
    )
    .join("");
  const tipografio = (bazoj.tipografio[aspekto] ?? [])
    .map((row) => {
      const v = (field: string) => `var(--fm-${row.token.replaceAll(".", "-")}-${field})`;
      return `<tr><th scope="row"><code>${escapeHtml(row.token)}</code></th><td><span style="font-family: ${v("font-family")}; font-size: ${v("font-size")}; line-height: ${v("line-height")}; font-weight: ${v("font-weight")}; letter-spacing: ${v("letter-spacing")}; text-transform: ${v("text-transform")}">Grundlagen 029</span></td>${cell(row.token, "familio", row.familio)}${cell(row.token, "grandeco", row.grandeco)}${cell(row.token, "linio", row.linio)}${cell(row.token, "pezo", row.pezo)}</tr>`;
    })
    .join("");
  const ikonaro = ikonoj
    .map(
      (name) =>
        `<figure class="fm-bazoj-ikono" data-fm-bazoj-ikono="${escapeHtml(name)}"><fm-ikono name="${escapeHtml(name)}" size="large"></fm-ikono><figcaption><code>${escapeHtml(name)}</code></figcaption></figure>`,
    )
    .join("");
  return [
    section(
      "tokenoj",
      "Tokens",
      `${intro("tokenoj")}<label class="fm-bazoj-sercxo">${t("tokenoj.sercxo")} <input type="search" data-fm-bazoj-sercxo autocomplete="off"></label><div class="fm-bazoj-rulumo" role="region" tabindex="0" aria-labelledby="fm-bazoj-tokenoj-titolo"><table class="fm-bazoj-tokenoj"><caption id="fm-bazoj-tokenoj-titolo">${t("tokenoj.tabelo")}</caption>${head(["bazoj.token", "bazoj.ebeno", "bazoj.hell", "bazoj.dunkel", "bazoj.herkunft"])}<tbody>${tokens}</tbody></table></div>`,
    ),
    section(
      "koloro",
      "Farbe",
      `${intro("koloro")}<table><caption>${t("koloro.tabelo")}</caption>${head(["bazoj.token", "bazoj.hell", "bazoj.dunkel", "bazoj.kontrast"])}<tbody>${koloro}</tbody></table>`,
    ),
    section(
      "elevacio",
      "Elevation",
      `${intro("elevacio")}<table><caption>${t("elevacio.tabelo")}</caption>${head(["bazoj.token", "bazoj.muster", "bazoj.hell", "bazoj.dunkel"])}<tbody>${elevacio}</tbody></table>`,
    ),
    section(
      "formo",
      "Form",
      `${intro("formo")}<table><caption>${t("formo.tabelo")}</caption>${head(["bazoj.token", "bazoj.muster", "bazoj.wert"])}<tbody>${scale(bazoj.formo[aspekto] ?? [], (token) => `<div class="fm-bazoj-formo" style="border-radius: ${cssVar(token)}"></div>`)}</tbody></table>`,
    ),
    section(
      "spacoj",
      "Abstände",
      `${intro("spacoj")}<table><caption>${t("spacoj.tabelo")}</caption>${head(["bazoj.token", "bazoj.muster", "bazoj.wert"])}<tbody>${scale(bazoj.spacoj[aspekto] ?? [], (token) => `<div class="fm-bazoj-spaco" style="inline-size: ${cssVar(token)}"></div>`)}</tbody></table>`,
    ),
    section(
      "tipografio",
      "Typografie",
      `${intro("tipografio")}<table><caption>${t("tipografio.tabelo")}</caption>${head(["bazoj.token", "bazoj.muster", "bazoj.familie", "bazoj.groesse", "bazoj.zeile", "bazoj.gewicht"])}<tbody>${tipografio}</tbody></table>`,
    ),
    section(
      "movado",
      "Bewegung",
      `${intro("movado")}<table><caption>${t("movado.tabelo")}</caption>${head(["bazoj.token", "bazoj.muster", "bazoj.wert"])}<tbody>${scale(bazoj.movado[aspekto] ?? [], (token) => (token.includes(".duration.") ? `<div class="fm-bazoj-movado" style="transition-duration: ${cssVar(token)}"></div>` : `<div class="fm-bazoj-movado" style="transition-timing-function: ${cssVar(token)}"></div>`))}</tbody></table>`,
    ),
    section("ikonoj", "Icons", `${intro("ikonoj")}<div class="fm-bazoj-ikonaro">${ikonaro}</div>`),
  ].join("\n");
}

/** The layout of the pages: no value of its own, only the tokens of the Vortaro. */
export const BAZOJ_CSS = `.fm-bazoj-enkonduko { max-inline-size: 70ch; }
/* A scrolling region is reached by the keyboard (axe scrollable-region-focusable). */
.fm-bazoj-rulumo { max-block-size: 70vh; overflow: auto; }
.fm-bazoj-tokenoj td, .fm-bazoj-tokenoj th { white-space: nowrap; }
.fm-bazoj-sercxo { display: inline-flex; gap: var(--fm-spacing-small); align-items: center; margin-block-end: var(--fm-spacing-medium); }
.fm-bazoj-specimeno { display: inline-block; inline-size: var(--fm-size-icon-medium); block-size: var(--fm-size-icon-medium); border: var(--fm-border-width-default) solid var(--fm-color-border-subtle); border-radius: var(--fm-radius-small); vertical-align: middle; margin-inline-end: var(--fm-spacing-small); }
.fm-bazoj-alteco { inline-size: var(--fm-size-control-large); block-size: var(--fm-size-control-large); background-color: var(--fm-color-background-raised); border-radius: var(--fm-radius-role-surface); }
.fm-bazoj-formo { inline-size: var(--fm-size-control-large); block-size: var(--fm-size-control-large); background-color: var(--fm-color-action-secondary-rest); border: var(--fm-border-width-default) solid var(--fm-color-border-default); }
.fm-bazoj-spaco { block-size: var(--fm-spacing-medium); background-color: var(--fm-color-action-primary-rest); }
.fm-bazoj-movado { inline-size: var(--fm-size-icon-medium); block-size: var(--fm-size-icon-medium); border-radius: var(--fm-radius-full); background-color: var(--fm-color-action-primary-rest); transition-property: transform; }
.fm-bazoj-movado:hover { transform: translateX(var(--fm-spacing-xlarge)); }
.fm-bazoj-ikonaro { display: grid; grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr)); gap: var(--fm-spacing-medium); }
.fm-bazoj-ikono { display: flex; flex-direction: column; align-items: center; gap: var(--fm-spacing-small); margin: 0; }`;

/** The script part of the pages: the values of the chosen brand, and the search. No computation. */
export const BAZOJ_SKRIPTO = `
function renderBazoj() {
  const bazoj = datumoj.bazoj;
  if (!bazoj) return;
  const aspekto = root.getAttribute("data-fm-aspekto");
  const values = new Map();
  for (const token of bazoj.tokenoj) {
    const value = token.valoroj[aspekto];
    const origin = token.deveno[aspekto] || {};
    values.set(token.name + "|light", value ? value.light : "–");
    values.set(token.name + "|dark", value ? value.dark : "–");
    values.set(token.name + "|deveno", origin.fonto
      ? "Fonto " + origin.fonto + " · " + origin.maniero + (origin.jugxo ? " · " + origin.jugxo : "") + " · " + origin.sxlosilo
      : origin.aro || "");
  }
  for (const row of bazoj.koloro[aspekto] || []) {
    values.set(row.token + "|kontrasto", row.kontrasto ? row.kontrasto.light + " / " + row.kontrasto.dark : "–");
  }
  for (const [key, rows] of [["elevacio", bazoj.elevacio], ["formo", bazoj.formo], ["spacoj", bazoj.spacoj], ["movado", bazoj.movado]]) {
    for (const row of rows[aspekto] || []) {
      values.set(row.token + "|valoro", row.valoro);
      if (row.dark !== undefined) values.set(row.token + "|dark", row.dark);
    }
  }
  for (const row of bazoj.tipografio[aspekto] || []) {
    for (const field of ["familio", "grandeco", "linio", "pezo"]) values.set(row.token + "|" + field, row[field]);
  }
  for (const element of document.querySelectorAll("[data-fm-bazoj]")) {
    const value = values.get(element.getAttribute("data-fm-bazoj"));
    if (value !== undefined) element.textContent = value;
  }
  for (const swatch of document.querySelectorAll("[data-fm-bazoj-specimeno]")) {
    const value = values.get(swatch.getAttribute("data-fm-bazoj-specimeno")) || "";
    swatch.style.backgroundColor = value.split(" ")[0];
  }
}

for (const input of document.querySelectorAll("[data-fm-bazoj-sercxo]")) {
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    for (const row of document.querySelectorAll("[data-fm-bazoj-token]")) {
      row.hidden = query !== "" && !row.getAttribute("data-fm-bazoj-token").includes(query);
    }
  });
}
`;
