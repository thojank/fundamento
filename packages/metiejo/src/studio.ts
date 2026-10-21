// The Studio (Spec 024 Runde 1, § 4): the fine work on the same data as the Schnellstart. Left the
// navigation (Grundlagen: Farbe, Schrift, Raum, Form, Tiefe, Bewegung; Semantik), in the middle
// the live preview, right the properties of the page. Every row is a token of the Modelo with the
// draft composed: its value in the chosen combination, its origin — Struktur (the Vortaro),
// abgeleitet (the derivation wrote it), gesetzt (the Studio set it) —, the alias with its
// candidates, a colour with its contrast against light and dark, a size per viewport. Setting a
// value goes into `festgelegt` of the Agordo, a display name into `etikedoj`; the screens are
// built of sxelo, navigado and formularo. Pure: the server gives the draft, this module the rows
// and the HTML.

import {
  type Agordo,
  composeFiles,
  derivationBasis,
  PALETTES,
  packageDocuments,
  packageLabel,
} from "@fundamento/agordilo";
import {
  buildModelo,
  type Modelo,
  oklchComponentsOf,
  readDtcgColor,
  resolveCombination,
  srgbComponentsOf,
  WCAG2_METRIC,
} from "@fundamento/modelo";
import { escapeHtml, jsonIsland, screenDocument } from "./html.js";
import { markoLabel } from "./ident.js";
import type { MarkoView } from "./sxtupoj.js";
import { type Bases, loadBases } from "./vorschau.js";

export type StudioPage = "farbe" | "schrift" | "raum" | "form" | "tiefe" | "bewegung" | "semantik";

export interface StudioPageInfo {
  key: StudioPage;
  title: string;
  /** The explanation in one sentence. */
  hint: string;
}

export const STUDIO_PAGES: readonly StudioPageInfo[] = [
  {
    key: "farbe",
    title: "Farbe",
    hint: "Die Paletten der Marke: je Stufe der Wert, der Kontrast gegen Hell und Dunkel und ob die Ableitung oder du ihn gesetzt hat.",
  },
  {
    key: "schrift",
    title: "Schrift",
    hint: "Die Familien und jeder Schriftstil: Familie, Größe je Viewport, Stärke, Zeilenhöhe, Laufweite und Schreibweise.",
  },
  {
    key: "raum",
    title: "Raum",
    hint: "Die Abstandsskala, die benannten Abstände, die Größen der Bedienelemente und die Rastermaße.",
  },
  {
    key: "form",
    title: "Form",
    hint: "Die Radien bis zur Pille und die Rahmenstärken, je mit der Rolle, die sie nutzt.",
  },
  {
    key: "tiefe",
    title: "Tiefe",
    hint: "Die Schatten und die Ebenen, dazu die Farben, aus denen ein Schatten gemacht ist.",
  },
  {
    key: "bewegung",
    title: "Bewegung",
    hint: "Die Dauern und Kurven, dazu was bei reduzierter Bewegung gilt.",
  },
  {
    key: "semantik",
    title: "Semantik",
    hint: "Je Rolle und Zustand die Grundlage, die sie nutzt – hell und dunkel –, dazu ein Anzeigename; die Prüfung zeigt sofort, welche Regeln betroffen sind.",
  },
];

export const isStudioPage = (value: string): value is StudioPage =>
  STUDIO_PAGES.some((page) => page.key === value);

export interface Kombination {
  scheme: "light" | "dark";
  density: "compact" | "default" | "comfortable";
  contrast: "default" | "high";
  viewport: "compact" | "medium" | "expanded";
}

export const DEFAULT_KOMBINATION: Kombination = {
  scheme: "light",
  density: "default",
  contrast: "default",
  viewport: "medium",
};

export const KOMBINATION_CHOICES: Readonly<
  Record<keyof Kombination, { label: string; values: readonly string[] }>
> = {
  scheme: { label: "Hell/Dunkel", values: ["light", "dark"] },
  density: { label: "Dichte", values: ["compact", "default", "comfortable"] },
  contrast: { label: "Kontrast", values: ["default", "high"] },
  viewport: { label: "Viewport", values: ["compact", "medium", "expanded"] },
};

/** A combination from query parameters; anything unknown falls back to the default. */
export function kombinationOf(params: URLSearchParams): Kombination {
  const pick = <K extends keyof Kombination>(key: K): Kombination[K] => {
    const value = params.get(key);
    return (
      value !== null && KOMBINATION_CHOICES[key].values.includes(value)
        ? value
        : DEFAULT_KOMBINATION[key]
    ) as Kombination[K];
  };
  return {
    scheme: pick("scheme"),
    density: pick("density"),
    contrast: pick("contrast"),
    viewport: pick("viewport"),
  };
}

export type Herkunft = "struktur" | "abgeleitet" | "gesetzt";

/** What a row's control takes: a colour, a dimension, a number, an alias, or the raw value as JSON. */
export type Art = "color" | "dimension" | "number" | "alias" | "json";

export interface StudioRow {
  token: string;
  /** The display name (etikedo) or the last part of the token. */
  label: string;
  type: string;
  /** The resolved value in the chosen combination. */
  value: unknown;
  /** The value as a person reads it. */
  shown: string;
  /** The alias the brand's main set points at, when the token is an alias there. */
  alias?: string;
  /** Tokens an alias may point at instead. */
  candidates?: string[];
  herkunft: Herkunft;
  art: Art;
  /** The value's unit, for a dimension. */
  unit?: string;
  /** A colour: OKLCH and the contrast against light and dark surfaces. */
  farbo?: { oklch: string; kontrastHell: number; kontrastDunkel: number };
  /** The value in dark, for a role or a palette step. */
  dunkel?: { shown: string; alias?: string };
  /** The size per viewport, for a font size role. */
  viewports?: Record<string, { shown: string; alias?: string }>;
  /** The value with reduced motion, for a motion role. */
  reduziert?: string;
}

export interface StudioGroup {
  key: string;
  title: string;
  /** The token the display name of this group belongs to, where a group may carry one. */
  etikedoToken?: string;
  rows: StudioRow[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const ALIAS = /^\{([a-z0-9.-]+)\}$/;
const aliasOf = (value: unknown): string | undefined =>
  typeof value === "string" ? ALIAS.exec(value)?.[1] : undefined;

const round = (value: number, digits = 2): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const hexOf = (components: readonly number[]): string =>
  `#${components
    .map((channel) =>
      Math.round(Math.min(1, Math.max(0, channel)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;

/** A value as a person reads it: a dimension with its unit, a colour as hex, a list joined. */
export function shownOf(value: unknown): string {
  if (value === undefined || value === null) return "–";
  if (typeof value === "number") return String(round(value, 3));
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    if (value.every((entry) => typeof entry === "number")) return `[${value.join(", ")}]`;
    if (value.every((entry) => typeof entry === "string")) return value.join(", ");
    return value.map(shownOf).join(" | ");
  }
  if (isRecord(value)) {
    if (typeof value.value === "number" && typeof value.unit === "string")
      return `${round(value.value, 3)}${value.unit}`;
    const colour = readDtcgColor(value);
    if (colour !== undefined)
      return typeof colour.hex === "string" ? colour.hex : hexOf(srgbComponentsOf(colour));
    if ("offsetX" in value) {
      return ["offsetX", "offsetY", "blur", "spread"]
        .map((key) => shownOf(value[key]))
        .join(" ")
        .concat(" ", shownOf(value.color));
    }
    if ("fontFamily" in value) {
      return [
        value.fontFamily,
        value.fontSize,
        value.fontWeight,
        value.lineHeight,
        value.letterSpacing,
      ]
        .map(shownOf)
        .join(" · ");
    }
    return JSON.stringify(value);
  }
  return String(value);
}

interface Composed {
  modelo: Modelo;
  /** Tokens the derivation writes anew (palettes, gestalt, fonts): abgeleitet. */
  derived: Set<string>;
}

/** The draft composed with the structure: the Modelo the preview and the rows read. */
export function composeDraft(agordo: Agordo, bases: Bases): Composed {
  const basis = derivationBasis(agordo, bases.structure, bases.calibration);
  const documents = packageDocuments(agordo, bases.structure, basis.palettes, [], basis.gestalt);
  const files = composeFiles(bases.structure, packageLabel(agordo), documents, []);
  const derived = new Set<string>();
  for (const step of basis.palettes.steps)
    derived.add(`color.palette.${step.palette}.${step.step}`);
  for (const name of basis.gestalt.main.keys()) derived.add(name);
  for (const name of basis.gestalt.dark.keys()) derived.add(name);
  for (const role of ["display", "body", "code"] as const) {
    if (agordo.schriften?.[role] !== undefined) derived.add(`font.family.${role}`);
  }
  return { modelo: buildModelo(files).modelo, derived };
}

const assignmentOf = (
  name: string,
  kombination: Kombination,
  motion = "default",
): Record<string, string> => ({
  aspekto: name,
  "color-scheme": kombination.scheme,
  density: kombination.density,
  contrast: kombination.contrast,
  viewport: kombination.viewport,
  motion,
});

function setTokens(modelo: Modelo, setName: string): Record<string, { value: unknown }> {
  return modelo.setoj.find((set) => set.name === setName)?.tokens ?? {};
}

/** The tokens an alias of `target` may point at instead: the same scale, every palette for a palette step. */
export function candidatesOf(modelo: Modelo, target: string): string[] {
  const core = setTokens(modelo, "core");
  const prefix = target.startsWith("color.palette.")
    ? "color.palette."
    : target.startsWith("radius.")
      ? "radius."
      : `${target.split(".").slice(0, -1).join(".")}.`;
  return Object.keys(core)
    .filter(
      (name) =>
        name.startsWith(prefix) &&
        !name.startsWith("radius.role.") &&
        aliasOf(core[name]?.value) === undefined,
    )
    .sort((a, b) => {
      const na = Number(a.split(".").at(-1));
      const nb = Number(b.split(".").at(-1));
      return Number.isNaN(na) || Number.isNaN(nb)
        ? a.localeCompare(b, "en")
        : a.localeCompare(b, "en", { numeric: true });
    });
}

const kontrast = (components: readonly number[], surface: readonly number[]): number =>
  round(
    WCAG2_METRIC.compute(
      { colorSpace: "srgb", components: [...components] as [number, number, number] },
      { colorSpace: "srgb", components: [...surface] as [number, number, number] },
    ),
  );

function farboOf(value: unknown): StudioRow["farbo"] | undefined {
  const colour = readDtcgColor(value);
  if (colour === undefined) return undefined;
  const components = srgbComponentsOf(colour);
  const [l, c, h] = oklchComponentsOf({ colorSpace: "srgb", components });
  return {
    oklch: `oklch(${round(l, 3)} ${round(c, 3)} ${round(h, 1)})`,
    kontrastHell: kontrast(components, [1, 1, 1]),
    kontrastDunkel: kontrast(components, [0, 0, 0]),
  };
}

const artOf = (type: string, alias: string | undefined, value: unknown): Art => {
  if (alias !== undefined) return "alias";
  if (type === "color") return "color";
  if (type === "dimension" || type === "duration") return "dimension";
  if (type === "number" || type === "fontWeight") return "number";
  if (isRecord(value) && typeof value.value === "number" && typeof value.unit === "string")
    return "dimension";
  if (typeof value === "number") return "number";
  return "json";
};

interface RowContext {
  agordo: Agordo;
  composed: Composed;
  kombination: Kombination;
  name: string;
  main: Record<string, { value: unknown }>;
  dark: Record<string, { value: unknown }>;
  resolved: Record<string, { value: unknown; type: string }>;
  resolvedDark: Record<string, { value: unknown; type: string }>;
}

function herkunftOf(context: RowContext, token: string): Herkunft {
  if (context.agordo.festgelegt?.[token] !== undefined) return "gesetzt";
  return context.composed.derived.has(token) ? "abgeleitet" : "struktur";
}

function rowOf(context: RowContext, token: string): StudioRow | undefined {
  const resolved = context.resolved[token];
  if (resolved === undefined) return undefined;
  const alias = aliasOf(context.main[token]?.value);
  const label = context.agordo.etikedoj?.[token] ?? token.split(".").slice(-2).join(".");
  const row: StudioRow = {
    token,
    label,
    type: resolved.type,
    value: resolved.value,
    shown: shownOf(resolved.value),
    herkunft: herkunftOf(context, token),
    art: artOf(resolved.type, alias, resolved.value),
  };
  if (alias !== undefined) {
    row.alias = alias;
    row.candidates = candidatesOf(context.composed.modelo, alias);
  }
  if (isRecord(resolved.value) && typeof resolved.value.unit === "string")
    row.unit = resolved.value.unit;
  const farbo = farboOf(resolved.value);
  if (farbo !== undefined) row.farbo = farbo;
  return row;
}

function withDark(context: RowContext, row: StudioRow): StudioRow {
  const dark = context.resolvedDark[row.token];
  if (dark === undefined) return row;
  const darkAlias = aliasOf(context.dark[row.token]?.value) ?? row.alias;
  return {
    ...row,
    dunkel: {
      shown: shownOf(dark.value),
      ...(darkAlias === undefined ? {} : { alias: darkAlias }),
    },
  };
}

const byStep = (a: string, b: string): number => a.localeCompare(b, "en", { numeric: true });

function tokensWithPrefix(
  context: RowContext,
  prefix: string,
  except: readonly string[] = [],
): string[] {
  return Object.keys(context.resolved)
    .filter((name) => name.startsWith(prefix) && !except.some((entry) => name.startsWith(entry)))
    .sort(byStep);
}

function group(
  context: RowContext,
  key: string,
  title: string,
  tokens: readonly string[],
  options: { dark?: boolean; etikedo?: boolean } = {},
): StudioGroup {
  const rows = tokens
    .map((token) => rowOf(context, token))
    .filter((row): row is StudioRow => row !== undefined)
    .map((row) => (options.dark === true ? withDark(context, row) : row));
  const out: StudioGroup = { key, title: context.agordo.etikedoj?.[key] ?? title, rows };
  if (options.etikedo === true) out.etikedoToken = key;
  return out;
}

/** The rows of a page of the Studio for a brand in a combination. */
export function studioRows(
  page: StudioPage,
  agordo: Agordo,
  bases: Bases,
  kombination: Kombination,
): StudioGroup[] {
  const composed = composeDraft(agordo, bases);
  const name = agordo.name;
  const resolve = (assignment: Record<string, string>) =>
    resolveCombination(composed.modelo, assignment).tokens as Record<
      string,
      { value: unknown; type: string }
    >;
  const context: RowContext = {
    agordo,
    composed,
    kombination,
    name,
    main: setTokens(composed.modelo, `aspekto/${name}`),
    dark: setTokens(composed.modelo, `aspekto/${name}+color-scheme/dark`),
    resolved: resolve(assignmentOf(name, kombination)),
    resolvedDark: resolve(assignmentOf(name, { ...kombination, scheme: "dark" })),
  };
  switch (page) {
    case "farbe":
      return [...PALETTES, "shade"].map((palette) =>
        group(
          context,
          `color.palette.${palette}`,
          palette,
          tokensWithPrefix(context, `color.palette.${palette}.`),
          {
            dark: true,
            etikedo: true,
          },
        ),
      );
    case "schrift": {
      const sizes = group(
        context,
        "font.size",
        "Größe je Schriftstil",
        tokensWithPrefix(context, "font.size.", ["font.size.scale."]),
      );
      for (const row of sizes.rows) {
        const viewports: NonNullable<StudioRow["viewports"]> = {};
        for (const viewport of KOMBINATION_CHOICES.viewport.values) {
          const resolved = resolve(
            assignmentOf(name, { ...kombination, viewport: viewport as Kombination["viewport"] }),
          )[row.token];
          const ownSet = setTokens(composed.modelo, `aspekto/${name}+viewport/${viewport}`);
          const coreSet = setTokens(composed.modelo, `viewport/${viewport}`);
          const alias =
            aliasOf(ownSet[row.token]?.value) ?? aliasOf(coreSet[row.token]?.value) ?? row.alias;
          viewports[viewport] = {
            shown: shownOf(resolved?.value),
            ...(alias === undefined ? {} : { alias }),
          };
        }
        row.viewports = viewports;
      }
      return [
        group(context, "font.family", "Familien", [
          "font.family.display",
          "font.family.body",
          "font.family.code",
        ]),
        sizes,
        group(
          context,
          "font.size.scale",
          "Skala der Größen",
          tokensWithPrefix(context, "font.size.scale."),
        ),
        group(context, "font.weight", "Stärken", tokensWithPrefix(context, "font.weight.")),
        group(
          context,
          "font.lineheight",
          "Zeilenhöhe je Schriftstil",
          tokensWithPrefix(context, "font.lineheight.", ["font.lineheight.scale."]),
        ),
        group(
          context,
          "font.tracking",
          "Laufweite je Schriftstil",
          tokensWithPrefix(context, "font.tracking.", ["font.tracking.scale."]),
        ),
        group(
          context,
          "typography",
          "Schriftstile (Zusammensetzung, nur zum Lesen)",
          tokensWithPrefix(context, "typography."),
        ),
      ];
    }
    case "raum":
      return [
        group(
          context,
          "spacing.scale",
          "Abstandsskala",
          tokensWithPrefix(context, "spacing.scale."),
        ),
        group(
          context,
          "spacing",
          "Benannte Abstände",
          tokensWithPrefix(context, "spacing.", ["spacing.scale."]),
        ),
        group(context, "size.control", "Höhen der Bedienelemente", [
          ...tokensWithPrefix(context, "size.control."),
          ...tokensWithPrefix(context, "size.target."),
        ]),
        group(context, "size.scale", "Größenskala", tokensWithPrefix(context, "size.scale.")),
        group(context, "layout", "Raster und Container", [
          ...tokensWithPrefix(context, "layout."),
          ...tokensWithPrefix(context, "size.container."),
          ...tokensWithPrefix(context, "size.breakpoint."),
        ]),
      ];
    case "form":
      return [
        group(context, "radius", "Radien", tokensWithPrefix(context, "radius.", ["radius.role."])),
        group(context, "radius.role", "Radius je Rolle", tokensWithPrefix(context, "radius.role.")),
        group(
          context,
          "border.width.scale",
          "Rahmenstärken",
          tokensWithPrefix(context, "border.width.scale."),
        ),
        group(
          context,
          "border.width",
          "Rahmenstärke je Rolle",
          tokensWithPrefix(context, "border.width.", ["border.width.scale."]),
        ),
        group(context, "focus", "Fokusring", [
          ...tokensWithPrefix(context, "focus."),
          ...tokensWithPrefix(context, "stroke."),
        ]),
      ];
    case "tiefe":
      return [
        group(
          context,
          "elevation.shadow",
          "Schatten",
          tokensWithPrefix(context, "elevation.shadow."),
        ),
        group(context, "elevation.layer", "Ebenen", tokensWithPrefix(context, "elevation.layer.")),
        group(
          context,
          "color.shadow",
          "Schattenfarben",
          tokensWithPrefix(context, "color.shadow."),
          { dark: true },
        ),
        group(context, "opacity", "Deckkraft", tokensWithPrefix(context, "opacity.")),
      ];
    case "bewegung": {
      const reduced = resolve(assignmentOf(name, kombination, "reduced"));
      const roles = group(
        context,
        "motion.duration",
        "Dauer je Rolle",
        tokensWithPrefix(context, "motion.duration.", ["motion.duration.scale."]),
      );
      const easings = group(
        context,
        "motion.easing",
        "Kurve je Rolle",
        tokensWithPrefix(context, "motion.easing.", ["motion.easing.curve."]),
      );
      for (const row of [...roles.rows, ...easings.rows])
        row.reduziert = shownOf(reduced[row.token]?.value);
      return [
        group(
          context,
          "motion.duration.scale",
          "Dauern",
          tokensWithPrefix(context, "motion.duration.scale."),
        ),
        roles,
        group(
          context,
          "motion.easing.curve",
          "Kurven",
          tokensWithPrefix(context, "motion.easing.curve."),
        ),
        easings,
      ];
    }
    case "semantik":
      return [
        ["color.text", "Text"],
        ["color.background", "Flächen"],
        ["color.border", "Rahmen"],
        ["color.action", "Aktionen"],
        ["color.status", "Status"],
        ["color.focus", "Fokus"],
        ["color.navigation", "Navigation"],
        ["color.link", "Links"],
        ["color.brand", "Marke"],
        ["color.backdrop", "Abdunklung"],
      ].map(([key = "", title = ""]) =>
        group(
          context,
          key,
          title,
          tokensWithPrefix(context, `${key}.`).concat(
            context.resolved[key] === undefined ? [] : [key],
          ),
          {
            dark: true,
          },
        ),
      );
  }
}

export interface StudioInput {
  page: StudioPage;
  marko: MarkoView;
  kombination: Kombination;
  groups: StudioGroup[];
  /** The number of uncovered violations of the draft. */
  probleme: number;
  message?: string;
  expert: { href?: string; sentence?: string };
  /** What the last change touched: the rules affected. */
  betroffen?: string[];
}

const HERKUNFT_LABEL: Readonly<Record<Herkunft, string>> = {
  struktur: "Struktur",
  abgeleitet: "abgeleitet",
  gesetzt: "gesetzt",
};

const pageUrl = (name: string, page: StudioPage, kombination: Kombination): string => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(kombination)) {
    if (value !== DEFAULT_KOMBINATION[key as keyof Kombination]) params.set(key, value);
  }
  const query = params.toString();
  return `/studio/${encodeURIComponent(name)}/${page}${query === "" ? "" : `?${query}`}`;
};

function control(row: StudioRow, modus?: string): string {
  const base = `data-mt-festlegen="${escapeHtml(row.token)}" data-mt-art="${row.art}"${modus === undefined ? "" : ` data-mt-modus="${escapeHtml(modus)}"`}`;
  const label = modus === undefined ? "Wert" : (modus.split("=")[1] ?? modus);
  switch (row.art) {
    case "alias": {
      const current = modus?.startsWith("color-scheme=")
        ? (row.dunkel?.alias ?? row.alias)
        : row.alias;
      return `<fm-elektilo name="${escapeHtml(`${row.token}${modus === undefined ? "" : `@${modus}`}`)}" value="${escapeHtml(current ?? "")}" size="small" ${base}>${escapeHtml(label)}${(
        row.candidates ?? []
      )
        .map(
          (candidate) =>
            `<data slot="options" value="${escapeHtml(candidate)}">${escapeHtml(candidate)}</data>`,
        )
        .join("")}</fm-elektilo>`;
    }
    case "color":
      return `<input type="color" value="${escapeHtml(row.shown)}" aria-label="${escapeHtml(`${row.label} ${label}`)}" ${base}>`;
    case "dimension":
      return `<fm-kampo kind="number" name="${escapeHtml(row.token)}" value="${escapeHtml(String(isRecord(row.value) ? row.value.value : row.value))}" size="small" data-mt-einheit="${escapeHtml(row.unit ?? "px")}" ${base}>${escapeHtml(label)} (${escapeHtml(row.unit ?? "px")})</fm-kampo>`;
    case "number":
      return `<fm-kampo kind="number" name="${escapeHtml(row.token)}" value="${escapeHtml(String(row.value))}" size="small" ${base}>${escapeHtml(label)}</fm-kampo>`;
    default:
      return `<fm-tekstareo kind="code" name="${escapeHtml(row.token)}" rows="3" value="${escapeHtml(JSON.stringify(row.value))}" ${base}>${escapeHtml(label)} als JSON</fm-tekstareo>`;
  }
}

function rowHtml(row: StudioRow, page: StudioPage): string {
  const parts: string[] = [];
  parts.push(
    `<fm-teksto><strong>${escapeHtml(row.label)}</strong> <fm-teksto kind="code">${escapeHtml(row.token)}</fm-teksto></fm-teksto>`,
  );
  const facts = [`Wert: ${row.shown}`];
  if (row.alias !== undefined) facts.push(`nutzt ${row.alias}`);
  if (row.farbo !== undefined)
    facts.push(
      row.farbo.oklch,
      `Kontrast hell ${row.farbo.kontrastHell}:1, dunkel ${row.farbo.kontrastDunkel}:1`,
    );
  if (row.dunkel !== undefined)
    facts.push(
      `dunkel: ${row.dunkel.shown}${row.dunkel.alias === undefined ? "" : ` (${row.dunkel.alias})`}`,
    );
  if (row.reduziert !== undefined) facts.push(`reduziert: ${row.reduziert}`);
  parts.push(
    `<fm-teksto kind="caption">${escapeHtml(facts.join(" · "))} <fm-insigno size="small" intent="${row.herkunft === "gesetzt" ? "info" : "neutral"}">${HERKUNFT_LABEL[row.herkunft]}</fm-insigno></fm-teksto>`,
  );
  if (page === "schrift" && row.viewports !== undefined) {
    for (const [viewport, entry] of Object.entries(row.viewports)) {
      parts.push(
        `<fm-teksto kind="caption">${escapeHtml(viewport)}: ${escapeHtml(entry.shown)}${entry.alias === undefined ? "" : ` (${escapeHtml(entry.alias)})`}</fm-teksto>`,
      );
      if (entry.alias !== undefined)
        parts.push(control({ ...row, alias: entry.alias }, `viewport=${viewport}`));
    }
  } else {
    if (row.type !== "typography") parts.push(control(row));
    if (row.dunkel !== undefined && (row.art === "alias" || row.art === "color")) {
      parts.push(
        control(
          row.art === "color" ? { ...row, shown: row.dunkel.shown } : row,
          "color-scheme=dark",
        ),
      );
    }
  }
  if (row.herkunft === "gesetzt") {
    parts.push(
      `<fm-butono emphasis="low" size="small" data-mt-zuruecksetzen="${escapeHtml(row.token)}">Zurücksetzen</fm-butono>`,
    );
  }
  return `<div class="mt-reihe" data-mt-token="${escapeHtml(row.token)}">${parts.join("")}</div>`;
}

/** The screen of a page of the Studio. */
export function studioScreen(input: StudioInput): string {
  const page = STUDIO_PAGES.find((entry) => entry.key === input.page) ?? STUDIO_PAGES[0];
  if (page === undefined) throw new Error("no pages");
  const name = input.marko.name;
  const label = markoLabel(name, input.marko.agordo.etikedoj?.marko);
  const nav = STUDIO_PAGES.map(
    (entry) =>
      `<a href="${pageUrl(name, entry.key, input.kombination)}" data-page="${entry.key}">${escapeHtml(entry.title)}</a>`,
  ).join("");
  const toggles = (Object.keys(KOMBINATION_CHOICES) as (keyof Kombination)[])
    .map(
      (key) =>
        `<fm-elekto name="${key}" value="${input.kombination[key]}" orientation="horizontal" size="small" data-mt-kombination="${key}">${escapeHtml(KOMBINATION_CHOICES[key].label)}${KOMBINATION_CHOICES[
          key
        ].values
          .map((value) => `<data slot="options" value="${value}">${value}</data>`)
          .join("")}</fm-elekto>`,
    )
    .join("");
  const groups = input.groups
    .map((groupEntry) => {
      const etikedo =
        groupEntry.etikedoToken === undefined
          ? ""
          : `<fm-kampo name="etikedo-${escapeHtml(groupEntry.etikedoToken)}" value="${escapeHtml(input.marko.agordo.etikedoj?.[groupEntry.etikedoToken] ?? "")}" size="small" placeholder="${escapeHtml(groupEntry.key.split(".").at(-1) ?? "")}" data-mt-etikedo="${escapeHtml(groupEntry.etikedoToken)}">Anzeigename</fm-kampo>`;
      return `<fm-faldilo open><span slot="summary">${escapeHtml(groupEntry.title)} <fm-teksto kind="code">${escapeHtml(groupEntry.key)}</fm-teksto></span><div class="mt-gruppe">${etikedo}${groupEntry.rows.map((row) => rowHtml(row, input.page)).join("")}</div></fm-faldilo>`;
    })
    .join("");
  const previewSrc = `/marko/${encodeURIComponent(name)}/vorschau?sxtupo=studio-${page.key}&breite=mittel&density=${input.kombination.density}&contrast=${input.kombination.contrast}&viewport=${input.kombination.viewport}`;
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
<fm-titolo slot="title" level="1" focusable>${escapeHtml(page.title)}</fm-titolo>
<fm-teksto slot="subtitle">${escapeHtml(page.hint)}</fm-teksto>
${expertLink}
<section class="mt-studio">
<fm-navigado label="Studio" page="${page.key}" orientation="vertical">${nav}<a href="/marko/${encodeURIComponent(name)}/farbe" data-page="schnellstart">Schnellstart</a></fm-navigado>
<div class="mt-studio-vorschau"><div class="mt-zeile">${toggles}</div><iframe data-mt-vorschau data-mt-src="${previewSrc}" title="Vorschau der Marke"></iframe></div>
<fm-formularo label="${escapeHtml(page.title)}" data-action="${pageUrl(name, page.key, input.kombination)}">
${groups}
<fm-butono slot="actions" type="submit" emphasis="medium">Übernehmen</fm-butono>
</fm-formularo>
</section>
${input.betroffen === undefined || input.betroffen.length === 0 ? "" : `<section><fm-teksto kind="caption">Betroffene Regeln: ${escapeHtml(input.betroffen.join(", "))}</fm-teksto></section>`}
${input.expert.href === undefined ? `<section><fm-titolo level="2">Expertenansicht</fm-titolo><fm-teksto>${escapeHtml(input.expert.sentence ?? "")}</fm-teksto></section>` : ""}
</fm-pagxo>
</fm-sxelo>
<script type="application/json" id="mt-sxtupo">${jsonIsland({ studio: page.key, marko: name, kombination: input.kombination })}</script>`;
  return screenDocument({
    title: `Studio – ${page.title} – ${name}`,
    body,
    root: {
      "data-mt-sxtupo": `studio-${page.key}`,
      "data-mt-marko": name,
      "data-mt-rev": String(input.marko.rev),
      "data-mt-scheme": input.kombination.scheme,
    },
  });
}

/** An input per page for the tests: a brand like provo with a set step and display names. */
export function exampleStudioInput(page: StudioPage): StudioInput {
  const bases = loadBases();
  const agordo: Agordo = {
    name: "provo",
    leitfarbe: "#6b4fa0",
    etikedoj: { marko: "Provo GmbH", "color.palette.accent": "Ozean" },
    festgelegt: {
      "color.palette.accent.700": {
        wert: { colorSpace: "srgb", components: [0.3843, 0.2549, 0.6039], hex: "#62419a" },
      },
    },
  };
  return {
    page,
    marko: { name: "provo", agordo, saved: false, rev: 1 },
    kombination: DEFAULT_KOMBINATION,
    groups: studioRows(page, agordo, bases, DEFAULT_KOMBINATION),
    probleme: 0,
    expert: { href: "/vitrino/index.html#aspekto=komuna&modus=werkstatt&agordo=ekzemplo" },
  };
}
