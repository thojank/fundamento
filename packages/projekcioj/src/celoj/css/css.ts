// CSS Celo (Spec 003, FR-05, plan D-05, contracts/projekcioj §1). One rule block per token set:
// `core` at `:where(:root)`, every other set at the data-fm-* attributes of its kondicxoj. Every
// selector is wrapped in :where(), so all blocks have the same specificity and the source order,
// which is the resolver's set order, decides; aliases become var() references, so late binding in
// the browser matches the resolver. Composite tokens get one property per field. Pure.

import {
  CORE_SET_NAME,
  type LoadedSet,
  type LoadedToken,
  type Modelo,
  nomRegulo,
  type Rezolvo,
  sortSetsForResolution,
} from "@fundamento/modelo";
import type { Celo, CeloInput, GeneratedFile } from "../../build.js";

/** The Dimensio whose values are Aspektoj; its attribute is dropped in the per-Aspekto files. */
const ASPEKTO = "aspekto";

/** Composite fields in CSS order, and their property suffix. */
const COMPOSITE_FIELDS: Readonly<Record<string, readonly (readonly [string, string])[]>> = {
  typography: [
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontWeight", "font-weight"],
    ["letterSpacing", "letter-spacing"],
    ["lineHeight", "line-height"],
    // F31: Versalien stehen im Modelo neben dem Wert, nicht darin — die Rolle sagt „uppercase",
    // der Wert sagt Größe und Gewicht. In CSS ist beides eine Deklaration, also trägt die Rolle
    // beide Eigenschaften, und wo das Modelo nichts sagt, steht `none`. Ohne die Vorgabe wäre
    // `text-transform: var(--fm-…)` eine Deklaration ohne Wert und fiele aus.
    ["textTransform", "text-transform"],
  ],
  border: [
    ["color", "color"],
    ["width", "width"],
    ["style", "style"],
  ],
};

/** `--fm-<token>` (the CSS NomRegulo). */
export function cssVariable(name: string): string {
  return nomRegulo("css").derive(name);
}

const ALIAS = /^\{([a-z0-9]+(?:\.[a-z0-9]+)*)\}$/;

/** A CSS value for a literal of `type`, or for an alias `{token}` a var() reference. */
export function cssValue(type: string, value: unknown): string {
  if (typeof value === "string") {
    const alias = ALIAS.exec(value);
    if (alias?.[1] !== undefined) return `var(${cssVariable(alias[1])})`;
  }
  switch (type) {
    case "color":
      return colorValue(value);
    case "dimension":
    case "duration":
      return unitValue(value);
    case "number":
    case "fontWeight":
      return String(value);
    case "cubicBezier":
      return Array.isArray(value) ? `cubic-bezier(${value.join(", ")})` : String(value);
    case "fontFamily":
      return (Array.isArray(value) ? value : [value])
        .map((family) => familyName(String(family)))
        .join(", ");
    case "strokeStyle":
      return typeof value === "string" ? value : "solid";
    case "shadow":
      return (Array.isArray(value) ? value : [value]).map(shadowLayer).join(", ");
    default:
      return String(value);
  }
}

function colorValue(value: unknown): string {
  if (typeof value !== "object" || value === null) return String(value);
  const color = value as { hex?: string; alpha?: number; components?: number[] };
  const hex =
    color.hex ??
    `#${(color.components ?? [0, 0, 0])
      .map((component) =>
        Math.round(component * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;
  if (color.alpha === undefined || color.alpha >= 1) return hex.toLowerCase();
  return `${hex.toLowerCase()}${Math.round(color.alpha * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

function unitValue(value: unknown): string {
  if (typeof value !== "object" || value === null) return String(value);
  const { value: amount, unit } = value as { value: number; unit: string };
  return `${amount}${unit}`;
}

function familyName(family: string): string {
  return /^[a-z-]+$/i.test(family) ? family : `"${family.replaceAll('"', '\\"')}"`;
}

function shadowLayer(layer: unknown): string {
  if (typeof layer === "string") return cssValue("shadow", layer);
  const l = layer as Record<string, unknown>;
  const parts = [
    cssValue("dimension", l.offsetX),
    cssValue("dimension", l.offsetY),
    cssValue("dimension", l.blur),
    cssValue("dimension", l.spread),
    cssValue("color", l.color),
  ];
  return l.inset === true ? `inset ${parts.join(" ")}` : parts.join(" ");
}

/** The declarations of one token: one for simple types, one per field for composites. */
export function tokenDeclarations(
  name: string,
  type: string,
  value: unknown,
  options: { textTransform?: string | undefined; base?: boolean } = {},
): [string, string][] {
  const fields = COMPOSITE_FIELDS[type];
  if (fields === undefined) return [[cssVariable(name), cssValue(type, value)]];
  const alias = typeof value === "string" ? ALIAS.exec(value)?.[1] : undefined;
  return fields.flatMap(([field, suffix]): [string, string][] => {
    const property = `${cssVariable(name)}-${suffix}`;
    if (field === "textTransform") {
      // Die Schreibweise steht im Modelo neben dem Wert, und der letzte Satz, der sie nennt,
      // gewinnt (D-11). In CSS heißt das: Wer sie nicht nennt, schreibt auch nichts — sonst
      // löschte jeder spätere Satz die Versalien eines früheren. Nur der Grundsatz schreibt die
      // Vorgabe, damit die Eigenschaft überall einen Wert hat (F31).
      if (options.textTransform !== undefined) return [[property, options.textTransform]];
      // Ein Alias ohne eigene Schreibweise trägt die seines Ziels (Constitution v2.3: ein
      // Ero-Token auf einer Schriftrolle schreibt, wie die Rolle schreibt).
      if (alias !== undefined) return [[property, `var(${cssVariable(alias)}-${suffix})`]];
      return options.base === true ? [[property, "none"]] : [];
    }
    if (alias !== undefined) return [[property, `var(${cssVariable(alias)}-${suffix})`]];
    const fieldValue = (value as Record<string, unknown> | undefined)?.[field];
    return [[property, cssValue(FIELD_TYPES[field] ?? "dimension", fieldValue)]];
  });
}

const FIELD_TYPES: Readonly<Record<string, string>> = {
  fontFamily: "fontFamily",
  fontSize: "dimension",
  fontWeight: "fontWeight",
  letterSpacing: "dimension",
  lineHeight: "number",
  color: "color",
  width: "dimension",
  style: "strokeStyle",
};

/** AK-03: the expected computed value of every --fm-* property in one resolved combination. */
export function cssDeclarationsOf(rezolvo: Rezolvo): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, token] of Object.entries(rezolvo.tokens)) {
    for (const [property, value] of tokenDeclarations(name, token.type, token.value, {
      textTransform: token.textTransform?.value,
      base: true,
    })) {
      out[property] = value;
    }
  }
  return out;
}

/** `:where(:root…)` for the kondicxoj of a set; a default value also matches a missing attribute. */
function selectorOf(modelo: Modelo, set: LoadedSet, dropAspekto: boolean): string {
  const priority = (dimensio: string) =>
    modelo.dimensioj.find((candidate) => candidate.name === dimensio)?.priority ?? 0;
  const parts = [...set.kondicxoj]
    .filter((kondicxo) => !(dropAspekto && kondicxo.dimensio === ASPEKTO))
    .sort((a, b) => priority(a.dimensio) - priority(b.dimensio))
    .map(({ dimensio, valoro }) => {
      const attribute = `data-fm-${dimensio}`;
      const isDefault =
        modelo.dimensioj.find((candidate) => candidate.name === dimensio)?.default === valoro;
      return isDefault
        ? `:is([${attribute}="${valoro}"], :not([${attribute}]))`
        : `[${attribute}="${valoro}"]`;
    });
  return `:where(:root${parts.join("")})`;
}

function tokenTypeOf(modelo: Modelo, token: LoadedToken): string {
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME);
  return core?.tokens[token.name]?.type ?? token.type;
}

function stylesheet(
  modelo: Modelo,
  sets: readonly LoadedSet[],
  title: string,
  dropAspekto: boolean,
): string {
  const blocks = sets
    .filter((set) => Object.keys(set.tokens).length > 0)
    .map((set) => {
      const declarations = Object.values(set.tokens)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .flatMap((token) =>
          tokenDeclarations(token.name, tokenTypeOf(modelo, token), token.value, {
            textTransform: token.textTransform,
            base: set.name === CORE_SET_NAME,
          }),
        )
        .map(([property, value]) => `  ${property}: ${value};`);
      return `/* set ${set.name} */\n${selectorOf(modelo, set, dropAspekto)} {\n${declarations.join("\n")}\n}\n`;
    });
  return `/* ${title}. Generated by fm projekcioj build from the Fundamento Modelo; do not edit. */\n\n${blocks.join("\n")}`;
}

/**
 * The glyphs of the Ikonaro as custom properties (Spec 014 ②, G3, plan ② D-05): per Aspekto one
 * block with `--fm-ikono-<name>` for every name of the Ikonaro, the Aspekto's SVG as a data URL,
 * switched by data-fm-aspekto like every value — so an ikono changes its picture with the brand
 * without a reload, and the element masks it in the current colour. The provenance stays in the
 * file of the package; the URL carries the picture alone.
 */
export function glyphValue(svg: string): string {
  const picture = svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<metadata\b[^>]*>[\s\S]*?<\/metadata>/g, "")
    .replace(/\s+/g, " ")
    .replace(/> </g, "><")
    .trim();
  return `url("data:image/svg+xml,${encodeURIComponent(picture)}")`;
}

function glyphBlocks(modelo: Modelo, aspektoj: readonly string[], dropAspekto: boolean): string {
  if (modelo.ikonaro.length === 0) return "";
  const dimensio = modelo.dimensioj.find((candidate) => candidate.name === ASPEKTO);
  return aspektoj
    .map((aspekto) => {
      const glyphs = modelo.aspektoPackages.find((pkg) => pkg.aspekto === aspekto)?.ikonoj ?? {};
      const declarations = modelo.ikonaro.flatMap(({ name }) => {
        const svg = glyphs[name];
        // A glyph is no token: its property keeps the namespace and the name of the Ikonaro.
        return svg === undefined ? [] : [`  --fm-ikono-${name}: ${glyphValue(svg)};`];
      });
      if (declarations.length === 0) return "";
      const selector = dropAspekto
        ? ":where(:root)"
        : dimensio?.default === aspekto
          ? `:where(:root:is([data-fm-${ASPEKTO}="${aspekto}"], :not([data-fm-${ASPEKTO}])))`
          : `:where(:root[data-fm-${ASPEKTO}="${aspekto}"])`;
      return `/* ikonoj ${aspekto} */\n${selector} {\n${declarations.join("\n")}\n}\n`;
    })
    .filter((block) => block !== "")
    .join("\n");
}

/** The stylesheet of one Aspekto with its values at `:root` (used by the Make Kit Celo, D-14). */
export function aspektoStylesheet(modelo: Modelo, aspekto: string): string {
  const own = sortSetsForResolution(modelo, modelo.setoj).filter((set) =>
    set.kondicxoj.every((kondicxo) => kondicxo.dimensio !== ASPEKTO || kondicxo.valoro === aspekto),
  );
  return `${stylesheet(modelo, own, `Fundamento: Aspekto ${aspekto} at :root`, true)}\n${glyphBlocks(modelo, [aspekto], true)}`;
}

export const CSS_CELO: Celo = {
  name: "css",
  generate({ modelo }: CeloInput): GeneratedFile[] {
    const ordered = sortSetsForResolution(modelo, modelo.setoj);
    const aspektoj =
      modelo.dimensioj.find((dimensio) => dimensio.name === ASPEKTO)?.valoroj.map((v) => v.name) ??
      [];
    const files: GeneratedFile[] = [
      {
        path: "css/fundamento.css",
        text: `${stylesheet(
          modelo,
          ordered,
          "Fundamento: every Aspekto, switched by data-fm-* on the root",
          false,
        )}\n${glyphBlocks(modelo, aspektoj, false)}`,
      },
    ];
    for (const aspekto of aspektoj) {
      const own = ordered.filter((set) =>
        set.kondicxoj.every(
          (kondicxo) => kondicxo.dimensio !== ASPEKTO || kondicxo.valoro === aspekto,
        ),
      );
      files.push({
        path: `css/fundamento-${aspekto}.css`,
        text: `${stylesheet(modelo, own, `Fundamento: Aspekto ${aspekto} at :root`, true)}\n${glyphBlocks(modelo, [aspekto], true)}`,
      });
    }
    return files;
  },
};
