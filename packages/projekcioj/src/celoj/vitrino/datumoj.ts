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
  readDtcgColor,
  regularoEnforcementIssues,
  STATE_KEY,
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

export interface VitrinoRolo {
  token: string;
  hex: string;
  l: number;
  /** Lightness distance to the previous row, where the roles form a ladder. */
  alNaskbo?: number;
  /** Distance to the nearer anchor (pure white, pure black). */
  alEkstremo?: number;
}

export interface VitrinoMezuro {
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
    const l = round(oklchLightness(color));
    const previous = rows.at(-1);
    rows.push({
      token,
      hex: hexOf(entry.value),
      l,
      ...(ladder && previous !== undefined && index > 0
        ? { alNaskbo: round(Math.abs(l - previous.l)) }
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
    komparo: komparoOf(aspektoj, mezuroj, kovrado, modelo),
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

/** Criterion by criterion, two Aspektoj side by side; no overall verdict (FR-17). */
function komparoOf(
  aspektoj: readonly string[],
  mezuroj: VitrinoDatumoj["mezuroj"],
  kovrado: VitrinoDatumoj["kovrado"],
  modelo: Modelo,
): VitrinoDatumoj["komparo"] {
  const result: VitrinoDatumoj["komparo"] = {};
  const minReserve = (aspekto: string): number => {
    let worst = Number.POSITIVE_INFINITY;
    for (const [key, rows] of Object.entries(mezuroj)) {
      if (!key.startsWith(`${aspekto}|`)) continue;
      for (const row of rows) if (row.rezervo !== undefined) worst = Math.min(worst, row.rezervo);
    }
    return worst === Number.POSITIVE_INFINITY ? 0 : worst;
  };
  const passRate = (aspekto: string): number => {
    let total = 0;
    let passed = 0;
    for (const [key, rows] of Object.entries(mezuroj)) {
      if (!key.startsWith(`${aspekto}|`)) continue;
      for (const row of rows) {
        total += 1;
        if (row.pasis) passed += 1;
      }
    }
    return total === 0 ? 0 : passed / total;
  };
  const darkCoverage = (aspekto: string): number =>
    kovrado[aspekto]?.find((entry) => entry.dimensio === "color-scheme" && entry.valoro === "dark")
      ?.parto ?? 0;
  const criteria: {
    kriterio: string;
    of: (aspekto: string) => number;
    format: (v: number) => string;
  }[] = [
    {
      kriterio: "kleinste Kontrast-Reserve",
      of: minReserve,
      format: (v) => `${(v * 100).toFixed(1)} %`,
    },
    {
      kriterio: "Bestehensquote der KontrastParoj",
      of: passRate,
      format: (v) => `${(v * 100).toFixed(1)} %`,
    },
    {
      kriterio: "eigene Werte im Dunkelmodus (alle Tokens)",
      of: darkCoverage,
      format: (v) => `${(v * 100).toFixed(1)} %`,
    },
  ];
  for (const [index, a] of aspektoj.entries()) {
    for (const b of aspektoj.slice(index + 1)) {
      result[`${a}|${b}`] = criteria.map((criterion) => {
        const valueA = criterion.of(a);
        const valueB = criterion.of(b);
        const same = Math.abs(valueA - valueB) < 1e-6;
        return {
          kriterio: criterion.kriterio,
          a: criterion.format(valueA),
          b: criterion.format(valueB),
          pli: same ? ("egale" as const) : valueA > valueB ? ("a" as const) : ("b" as const),
        };
      });
    }
  }
  void modelo;
  return result;
}
