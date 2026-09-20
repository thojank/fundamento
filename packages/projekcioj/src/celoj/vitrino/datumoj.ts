// The data of the Vitrino (Spec 004, FR-06, data-model §4). Everything the document shows is
// computed here, at build time, from the Modelo: the browser only picks the slice that belongs to
// the combination on screen. A second contrast implementation in the browser would be a second
// truth (Art. VIII), so there is none.

import {
  type AspiroResult,
  combinationsOf,
  dimensioKovrado,
  evaluateAlirebleco,
  evaluateAspiroj,
  type LoadedEro,
  type Modelo,
  oklchLExtreme,
  oklchLightness,
  oklchLStepConsistency,
  palettePikoj,
  readDtcgColor,
  regularoEnforcementIssues,
  STATE_KEY,
  typeScaleConsistency,
  type ValidationIssue,
} from "@fundamento/modelo";
import type { CeloInput } from "../../build.js";

const PALETTE = /^color\.palette\.([a-z0-9-]+)\.(\d+)$/;
const SURFACES = [
  "color.background.sunken",
  "color.background.canvas",
  "color.background.default",
  "color.background.raised",
];
const TEXT = ["color.text.default", "color.text.subtle", "color.text.muted"];
/** Opaque roles that are a surface: the page, an action's fill, a status fill (Spec 004). */
const SURFACE_PATTERNS = [
  /^color\.background\./,
  /^color\.action\.[a-z-]+\.(rest|hover|pressed|selected|disabled)$/,
  /^color\.status\.[a-z-]+\.(basic|weak|subtle)$/,
];
const TYPE_SCALE = /^font\.size\.scale\.(\d+)$/;

export interface VitrinoRolo {
  token: string;
  /** The value as text: a hex, or `durchsichtig` / `#rrggbb, N % Deckung` for an overlay. */
  hex: string;
  /** OKLCH lightness; absent for an overlay, which has none until it lies on a surface. */
  l?: number;
  /** Lightness distance to the previous row, where the roles form a ladder. */
  alNaskbo?: number;
  /** Distance to the nearer anchor (pure white, pure black). */
  alEkstremo?: number;
}

export interface VitrinoMezuro {
  /** For an overlay: the surface the pair was measured on, the worst it may lie on (Spec 004). */
  surfaco?: string;
  paro: string;
  kategorio: string;
  wcag2: number;
  sojlo?: number;
  rezervo?: number;
  apca: number;
  apcaSojlo?: number;
  pasis: boolean;
  brancxo: string;
  /** The same pair in the comparison state, when a baseline was given. */
  bazo?: { wcag2: number; apca: number };
}

export interface VitrinoDatumoj {
  fundamento: string;
  aspektoj: string[];
  dimensioj: { name: string; valoroj: string[]; default: string }[];
  kombinoj: string[];
  paletroj: Record<
    string,
    {
      rampo: string;
      stupoj: { stupo: number; token: string; hex: string; l: number }[];
      regula: string;
    }[]
  >;
  roloj: Record<
    string,
    { surfaces: VitrinoRolo[]; text: VitrinoRolo[]; status: VitrinoRolo[]; agoj: VitrinoRolo[] }
  >;
  mezuroj: Record<string, VitrinoMezuro[]>;
  regularo: Record<string, { regulo: string; kialo: string; pasis: boolean; trovoj: string[] }[]>;
  aspiroj: Record<
    string,
    {
      metriko: string;
      limo: string;
      /** The tokens the goal applies to, or "alle Tokens": two coverage numbers need their scope. */
      amplekso: string;
      mezurita: string;
      atingita: boolean;
      kialo: string;
    }[]
  >;
  kovrado: Record<
    string,
    { dimensio: string; valoro: string; propraj: number; entute: number; parto: number }[]
  >;
  komparo: Record<string, { kriterio: string; a: string; b: string; pli: "a" | "b" | "egale" }[]>;
  /** The `fm-butono` grid as markup; the element upgrades it in the browser. */
  butono: string;
  /** Sum of the advisory APCA findings, now and in the baseline. */
  /**
   * Advisory APCA findings. `nun` counts this build, `kombinoj` how many combinations that is.
   * A snapshot may cover other combinations than this build (a second Aspekto doubles them), so
   * `komunaj` counts this build only where the snapshot has data, and `mankantaj` says how many
   * combinations of the snapshot are missing here — only then is `bazo` more than the comparison.
   */
  apcaHintoj: {
    nun: number;
    kombinoj: number;
    bazo?: number;
    bazoKombinoj?: number;
    komunaj?: { nun: number; kombinoj: number };
    mankantaj?: number;
  };
}

/** A measurement snapshot of another state of the Modelo (`fm modelo mezuroj`). */
export interface VitrinoBazo {
  mezuroj: Record<string, { paro: string; wcag2: number; apca: number }[]>;
  apcaHintoj: number;
}

const round = (value: number, digits = 3): number =>
  Number(Math.round(Number(`${value}e${digits}`)) + `e-${digits}`);

const plainHex = (color: { hex?: string; components: readonly (number | "none")[] }): string => {
  if (typeof color.hex === "string") return color.hex;
  const channel = (component: number | "none") =>
    Math.round((component === "none" ? 0 : component) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${color.components.map(channel).join("")}`;
};

/** An overlay is named as one: a fully transparent value has no colour, a translucent one a cover. */
const overlayText = (value: unknown): string | undefined => {
  const color = readDtcgColor(value);
  const alpha = color?.alpha ?? 1;
  if (color === undefined || alpha >= 1) return undefined;
  return alpha === 0 ? "durchsichtig" : `${plainHex(color)}, ${Math.round(alpha * 100)} % Deckung`;
};

const hexOf = (value: unknown): string => {
  const color = readDtcgColor(value);
  if (color === undefined) return "";
  const hex = color.hex;
  if (typeof hex === "string") return hex;
  const channel = (component: number | "none") =>
    Math.round((component === "none" ? 0 : component) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${color.components.map(channel).join("")}`;
};

const lightnessOf = (value: unknown): number => {
  const color = readDtcgColor(value);
  return color === undefined ? 0 : round(oklchLightness(color));
};

/** `aspekto|color-scheme|contrast|density|viewport|motion`, in Dimensio priority order. */
export function kombinoKey(modelo: Modelo, assignment: Readonly<Record<string, string>>): string {
  return modelo.dimensioj.map((dimensio) => assignment[dimensio.name] ?? "").join("|");
}

const rolesKey = (assignment: Readonly<Record<string, string>>): string =>
  [assignment.aspekto, assignment["color-scheme"], assignment.contrast].join("|");

function roleRows(
  tokens: Record<string, { value: unknown }>,
  names: readonly string[],
  ladder: boolean,
): VitrinoRolo[] {
  const rows: VitrinoRolo[] = [];
  for (const [index, token] of names.entries()) {
    const entry = tokens[token];
    if (entry === undefined) continue;
    const color = readDtcgColor(entry.value);
    if (color === undefined) continue;
    const overlay = overlayText(entry.value);
    if (overlay !== undefined) {
      // An overlay has no lightness of its own until it lies on a surface (Spec 004).
      rows.push({ token, hex: overlay });
      continue;
    }
    const l = round(oklchLightness(color));
    const previousL = rows.at(-1)?.l;
    rows.push({
      token,
      hex: hexOf(entry.value),
      l,
      ...(ladder && previousL !== undefined && index > 0
        ? { alNaskbo: round(Math.abs(l - previousL)) }
        : {}),
      ...(ladder ? { alEkstremo: round(oklchLExtreme(color)) } : {}),
    });
  }
  return rows;
}

const byPrefix = (tokens: Record<string, { value: unknown }>, prefix: string): string[] =>
  Object.keys(tokens)
    .filter((name) => name.startsWith(prefix))
    .sort();

/** The `fm-butono` grid: every variant, tone and size the Skemo declares. */
export function butonoMarkup(eroj: readonly LoadedEro[]): string {
  const entry = eroj.find((candidate) => candidate.ero.name === "butono");
  if (entry === undefined) return "<p>Kein Ero <code>butono</code> im Modelo.</p>";
  const keys = ["variant", "tone", "size"].filter((key) =>
    entry.skemo.props.some((prop) => prop.name === key),
  );
  const rows = combinationsOf(entry.skemo, keys)
    .filter((combination) => combination[STATE_KEY] === undefined)
    .map((combination) => {
      const attributes = Object.entries(combination)
        .map(([key, value]) => ` ${key}="${value}"`)
        .join("");
      const label = Object.values(combination).join(" · ");
      return `<tr><th scope="row">${label}</th><td><fm-butono${attributes}>${label}</fm-butono></td><td><fm-butono${attributes} disabled>${label}</fm-butono></td><td><fm-butono${attributes} loading>${label}</fm-butono></td></tr>`;
    })
    .join("");
  return `<table><caption>fm-butono, jede Kombination der Skemo</caption><thead><tr><th scope="col">Kombination</th><th scope="col">rest</th><th scope="col">disabled</th><th scope="col">loading</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function regularoOf(
  modelo: Modelo,
  issues: readonly ValidationIssue[],
): VitrinoDatumoj["regularo"] {
  const byCombination = new Map<string, Map<string, string[]>>();
  for (const issue of issues) {
    if (issue.combination === undefined) continue;
    const key = kombinoKey(modelo, issue.combination);
    const rules = byCombination.get(key) ?? new Map<string, string[]>();
    rules.set(issue.rule, [...(rules.get(issue.rule) ?? []), issue.path]);
    byCombination.set(key, rules);
  }
  const automatic = modelo.reguloj.filter((regulo) => regulo.checkability === "automatic");
  const result: VitrinoDatumoj["regularo"] = {};
  for (const assignment of allAssignments(modelo)) {
    const key = kombinoKey(modelo, assignment);
    const found = byCombination.get(key);
    result[key] = automatic.map((regulo) => ({
      regulo: regulo.name,
      kialo: regulo.kialo,
      pasis: found?.get(regulo.name) === undefined,
      trovoj: found?.get(regulo.name) ?? [],
    }));
  }
  return result;
}

/** Every combination of the Modelo, in canonical order. */
function allAssignments(modelo: Modelo): Record<string, string>[] {
  let assignments: Record<string, string>[] = [{}];
  for (const dimensio of modelo.dimensioj) {
    const values = dimensio.valoroj.map((valoro) => valoro.name);
    assignments = assignments.flatMap((assignment) =>
      values.map((value) => ({ ...assignment, [dimensio.name]: value })),
    );
  }
  return assignments;
}

function aspirojOf(results: readonly AspiroResult[]): VitrinoDatumoj["aspiroj"] {
  const result: VitrinoDatumoj["aspiroj"] = {};
  for (const entry of results) {
    const limo = [
      entry.aspiro.min === undefined ? undefined : `min ${entry.aspiro.min}`,
      entry.aspiro.max === undefined ? undefined : `max ${entry.aspiro.max}`,
    ]
      .filter((part): part is string => part !== undefined)
      .join(", ");
    result[entry.aspekto] = [
      ...(result[entry.aspekto] ?? []),
      {
        metriko: entry.aspiro.metriko,
        limo,
        amplekso: entry.aspiro.appliesTo?.tokens?.join(", ") ?? "alle Tokens",
        mezurita: entry.measured?.text ?? "–",
        atingita: entry.reached,
        kialo: entry.aspiro.kialo,
      },
    ];
  }
  return result;
}

export interface VitrinoDatumojInput {
  input: CeloInput;
  /** A measurement snapshot to compare with (`--bazo`), when one was given. */
  bazo?: VitrinoBazo;
}

export function vitrinoDatumoj({ input, bazo }: VitrinoDatumojInput): VitrinoDatumoj {
  const { modelo } = input;
  const evaluation = evaluateAlirebleco(modelo, {
    kontrastParojFile: "data/kontrastparoj.json",
    collect: true,
  });
  const aspektoj = (
    modelo.dimensioj.find((dimensio) => dimensio.name === "aspekto")?.valoroj ?? []
  ).map((valoro) => valoro.name);

  const paletroj: VitrinoDatumoj["paletroj"] = {};
  const roloj: VitrinoDatumoj["roloj"] = {};
  // Per Aspekto, for the comparison (FR-08): the worst ramp regularity, the smallest distance an
  // opaque surface keeps from an anchor, and the regularity of the type scale.
  const rampoj = new Map<string, number>();
  const ankroj = new Map<string, number>();
  const tipoj = new Map<string, number>();
  for (const rezolvo of input.rezolvoj.rezolvoj) {
    const assignment = rezolvo.assignment as Record<string, string>;
    const tokens = rezolvo.tokens as Record<string, { value: unknown }>;
    const aspekto = assignment.aspekto ?? "";
    if (
      paletroj[aspekto] === undefined &&
      assignment["color-scheme"] === "light" &&
      assignment.contrast === "default"
    ) {
      const ramps = new Map<string, { stupo: number; token: string; hex: string; l: number }[]>();
      for (const [name, token] of Object.entries(tokens)) {
        const match = PALETTE.exec(name);
        if (match?.[1] === undefined || match[2] === undefined) continue;
        ramps.set(match[1], [
          ...(ramps.get(match[1]) ?? []),
          {
            stupo: Number(match[2]),
            token: name,
            hex: hexOf(token.value),
            l: lightnessOf(token.value),
          },
        ]);
      }
      for (const [, steps] of palettePikoj(tokens)) {
        rampoj.set(aspekto, Math.max(rampoj.get(aspekto) ?? 0, oklchLStepConsistency(steps).worst));
      }
      paletroj[aspekto] = [...ramps.entries()]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([rampo, stupoj]) => {
          const sorted = [...stupoj].sort((a, b) => a.stupo - b.stupo);
          const steps = sorted.flatMap((step) => {
            const color = readDtcgColor(tokens[step.token]?.value);
            return color === undefined ? [] : [{ step: step.stupo, value: color }];
          });
          const consistency = oklchLStepConsistency(steps);
          return {
            rampo,
            stupoj: sorted,
            regula: `${(consistency.worst * 100).toFixed(1)} % vom Median ${consistency.median.toFixed(3)}`,
          };
        });
    }
    for (const [name, token] of Object.entries(tokens)) {
      if (!SURFACE_PATTERNS.some((pattern) => pattern.test(name))) continue;
      const colour = readDtcgColor(token.value);
      // An overlay has no surface of its own, so it keeps no distance from an anchor.
      if (colour === undefined || (colour.alpha ?? 1) < 1) continue;
      ankroj.set(
        aspekto,
        Math.min(ankroj.get(aspekto) ?? Number.POSITIVE_INFINITY, oklchLExtreme(colour)),
      );
    }
    if (tipoj.get(aspekto) === undefined) {
      const sizes = Object.entries(tokens)
        .filter(([name]) => TYPE_SCALE.test(name))
        .sort(([a], [b]) => Number(TYPE_SCALE.exec(a)?.[1]) - Number(TYPE_SCALE.exec(b)?.[1]))
        .flatMap(([, token]) => {
          const value = (token as { value: unknown }).value;
          const size =
            typeof value === "object" && value !== null && "value" in value
              ? Number((value as { value: unknown }).value)
              : Number.NaN;
          return Number.isFinite(size) ? [size] : [];
        });
      if (sizes.length > 2) tipoj.set(aspekto, typeScaleConsistency(sizes).worst);
    }

    const key = rolesKey(assignment);
    if (roloj[key] === undefined) {
      roloj[key] = {
        surfaces: roleRows(tokens, SURFACES, true),
        text: roleRows(tokens, TEXT, true),
        status: roleRows(tokens, byPrefix(tokens, "color.status."), false),
        agoj: roleRows(tokens, byPrefix(tokens, "color.action."), false),
      };
    }
  }

  const mezuroj: VitrinoDatumoj["mezuroj"] = {};
  let apcaNun = 0;
  let apcaKomunaj = 0;
  const apcaPerAspekto = new Map<string, number>();
  const komunajKombinoj = new Set<string>();
  for (const measurement of evaluation.measurements ?? []) {
    const key = kombinoKey(modelo, measurement.combination);
    const branch = measurement.branch === "aux" ? measurement.aux : measurement.main;
    if (branch === undefined) continue;
    const wcag2 = branch.metrics.wcag2;
    const apca = branch.metrics.apca;
    const bazoEntry = bazo?.mezuroj[key]?.find((entry) => entry.paro === measurement.pair.name);
    const advisory =
      apca !== undefined && apca.threshold !== undefined && apca.passed === false ? 1 : 0;
    apcaNun += advisory;
    const aspektoOfKey = key.slice(0, key.indexOf("|"));
    apcaPerAspekto.set(aspektoOfKey, (apcaPerAspekto.get(aspektoOfKey) ?? 0) + advisory);
    if (bazo?.mezuroj[key] !== undefined) {
      apcaKomunaj += advisory;
      komunajKombinoj.add(key);
    }
    mezuroj[key] = [
      ...(mezuroj[key] ?? []),
      {
        paro: measurement.pair.name,
        kategorio: measurement.kategorio,
        wcag2: round(branch.ratio, 2),
        ...(wcag2?.threshold === undefined
          ? {}
          : { sojlo: wcag2.threshold, rezervo: round(branch.ratio / wcag2.threshold - 1, 4) }),
        apca: round(apca?.value ?? 0, 1),
        ...(apca?.threshold === undefined ? {} : { apcaSojlo: apca.threshold }),
        ...(measurement.surface === undefined ? {} : { surfaco: measurement.surface }),
        pasis: measurement.passed,
        brancxo: measurement.branch ?? "none",
        ...(bazoEntry === undefined
          ? {}
          : { bazo: { wcag2: bazoEntry.wcag2, apca: bazoEntry.apca } }),
      },
    ];
  }

  const kovrado: VitrinoDatumoj["kovrado"] = {};
  for (const aspekto of aspektoj) {
    for (const dimensio of modelo.dimensioj) {
      if (dimensio.name === "aspekto") continue;
      for (const valoro of dimensio.valoroj) {
        if (valoro.name === dimensio.default) continue;
        const result = dimensioKovrado(modelo, {
          aspekto,
          dimensio: dimensio.name,
          valoro: valoro.name,
        });
        if (result.total === 0) continue;
        kovrado[aspekto] = [
          ...(kovrado[aspekto] ?? []),
          {
            dimensio: dimensio.name,
            valoro: valoro.name,
            propraj: result.own,
            entute: result.total,
            parto: round(result.share, 4),
          },
        ];
      }
    }
  }

  return {
    fundamento: input.modeloJson.fundamento.version,
    aspektoj,
    dimensioj: modelo.dimensioj
      .filter((dimensio) => dimensio.name !== "aspekto")
      .map((dimensio) => ({
        name: dimensio.name,
        valoroj: dimensio.valoroj.map((valoro) => valoro.name),
        default: dimensio.default,
      })),
    kombinoj: allAssignments(modelo).map((assignment) => kombinoKey(modelo, assignment)),
    paletroj,
    roloj,
    mezuroj,
    regularo: regularoOf(modelo, regularoEnforcementIssues(modelo)),
    aspiroj: aspirojOf(evaluateAspiroj(modelo)),
    kovrado,
    komparo: komparoOf({
      aspektoj,
      mezuroj,
      kovrado,
      paletroj,
      roloj,
      apca: apcaPerAspekto,
      tipoj,
      rampoj,
      ankroj,
    }),
    butono: butonoMarkup(modelo.eroj),
    apcaHintoj: {
      nun: apcaNun,
      kombinoj: Object.keys(mezuroj).length,
      ...(bazo === undefined
        ? {}
        : {
            bazo: bazo.apcaHintoj,
            bazoKombinoj: Object.keys(bazo.mezuroj).length,
            komunaj: { nun: apcaKomunaj, kombinoj: komunajKombinoj.size },
            mankantaj: Object.keys(bazo.mezuroj).filter((key) => mezuroj[key] === undefined).length,
          }),
    },
  };
}

/**
 * Criterion by criterion, two Aspektoj side by side; no overall verdict (FR-17). Every criterion
 * says which direction is ahead: fewer advisory APCA findings is better, a larger distance to the
 * anchor is better (maintainer's review of 2026-09-20).
 */
function komparoOf(input: {
  aspektoj: readonly string[];
  mezuroj: VitrinoDatumoj["mezuroj"];
  kovrado: VitrinoDatumoj["kovrado"];
  paletroj: VitrinoDatumoj["paletroj"];
  roloj: VitrinoDatumoj["roloj"];
  apca: ReadonlyMap<string, number>;
  tipoj: ReadonlyMap<string, number>;
  rampoj: ReadonlyMap<string, number>;
  ankroj: ReadonlyMap<string, number>;
}): VitrinoDatumoj["komparo"] {
  const { aspektoj, mezuroj, kovrado, apca, tipoj, rampoj: rampWorst, ankroj: anchor } = input;
  const result: VitrinoDatumoj["komparo"] = {};
  const rowsOf = (aspekto: string) =>
    Object.entries(mezuroj).flatMap(([key, rows]) => (key.startsWith(`${aspekto}|`) ? rows : []));
  const minReserve = (aspekto: string): number => {
    const reserves = rowsOf(aspekto).flatMap((row) =>
      row.rezervo === undefined ? [] : [row.rezervo],
    );
    return reserves.length === 0 ? 0 : Math.min(...reserves);
  };
  const passRate = (aspekto: string): number => {
    const rows = rowsOf(aspekto);
    return rows.length === 0 ? 0 : rows.filter((row) => row.pasis).length / rows.length;
  };
  const coverage = (aspekto: string, dimensio: string, valoro: string): number =>
    kovrado[aspekto]?.find((entry) => entry.dimensio === dimensio && entry.valoro === valoro)
      ?.parto ?? 0;
  const percent = (value: number): string => `${(value * 100).toFixed(1)} %`;
  const criteria: {
    kriterio: string;
    of: (aspekto: string) => number;
    format: (value: number) => string;
    /** Which side is ahead: "higher" for a reserve, "lower" for a finding count. */
    better: "higher" | "lower";
  }[] = [
    { kriterio: "kleinste Kontrast-Reserve", of: minReserve, format: percent, better: "higher" },
    {
      kriterio: "Bestehensquote der KontrastParoj",
      of: passRate,
      format: percent,
      better: "higher",
    },
    {
      kriterio: "Regelmäßigkeit der Paletten",
      of: (aspekto) => (input.paletroj[aspekto] === undefined ? 0 : (rampWorst.get(aspekto) ?? 0)),
      format: (value) => `${(value * 100).toFixed(1)} % vom Median`,
      better: "lower",
    },
    {
      kriterio: "Abstand zum Anker",
      of: (aspekto) => Math.max(0, anchor.get(aspekto) ?? 0),
      format: (value) => value.toFixed(3),
      better: "higher",
    },
    {
      kriterio: "Regelmäßigkeit der Typo-Skala",
      of: (aspekto) => tipoj.get(aspekto) ?? 0,
      format: (value) => `${(value * 100).toFixed(1)} % vom Median`,
      better: "lower",
    },
    {
      kriterio: "beratende APCA-Hinweise",
      of: (aspekto) => apca.get(aspekto) ?? 0,
      format: (value) => String(value),
      better: "lower",
    },
  ];
  // One row per Dimensio value the coverage knows: every brand decides for itself how much of a
  // Dimensio it sets (G10), and the comparison shows it value by value, not only for dark.
  const dimensioValues = new Map<string, { dimensio: string; valoro: string }>();
  for (const aspekto of aspektoj) {
    for (const entry of kovrado[aspekto] ?? []) {
      dimensioValues.set(`${entry.dimensio}=${entry.valoro}`, {
        dimensio: entry.dimensio,
        valoro: entry.valoro,
      });
    }
  }
  for (const [label, { dimensio, valoro }] of [...dimensioValues.entries()].sort(([a], [b]) =>
    a < b ? -1 : 1,
  )) {
    criteria.push({
      kriterio: `eigene Werte in ${label}`,
      of: (aspekto) => coverage(aspekto, dimensio, valoro),
      format: percent,
      better: "higher",
    });
  }

  for (const [index, a] of aspektoj.entries()) {
    for (const b of aspektoj.slice(index + 1)) {
      result[`${a}|${b}`] = criteria.map((criterion) => {
        const valueA = criterion.of(a);
        const valueB = criterion.of(b);
        const shownA = criterion.format(valueA);
        const shownB = criterion.format(valueB);
        // Equal is what the reader sees: two values that print the same are not a lead.
        const same = shownA === shownB;
        const aAhead = criterion.better === "higher" ? valueA > valueB : valueA < valueB;
        return {
          kriterio: criterion.kriterio,
          a: shownA,
          b: shownB,
          pli: same ? ("egale" as const) : aAhead ? ("a" as const) : ("b" as const),
        };
      });
    }
  }
  return result;
}
