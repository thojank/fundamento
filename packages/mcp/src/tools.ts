// The tools of @fundamento/mcp as pure functions over what is served (Spec 001, D-13,
// contracts/mcp-tools.md). Each returns the output object or an error envelope (FR-18).

import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { deflateRawSync } from "node:zlib";
import {
  type Agordo,
  type Calibration,
  deriveAspekto,
  type GestaltBasis,
  gestaltBasis,
  historioEintrag,
  loadCalibration,
  PALETTES,
  parseAgordoColor,
  parseWunsch,
  proposeAgordo,
  type Raporto,
  readAgordo,
  readStructure,
  readWuensche,
  type Structure,
  vorschlagSatz,
  type Wuensche,
} from "@fundamento/agordilo";
import {
  CELOJ,
  type CheckContrastInput,
  type CheckUsageInput,
  CORE_SET_NAME,
  checkContrast,
  checkTokenName,
  checkUsage,
  completeAssignment,
  type DescribeTermInput,
  describeModelo,
  describeTerm,
  type ExplainInput,
  type ExplainReguloInput,
  explain,
  explainRegulo,
  type GetEroInput,
  type GetSxablonoInput,
  getEro,
  getSxablono,
  isNoTarget,
  listEroj,
  listSxablonoj,
  NOM_REGULOJ,
  oklchColor,
  resolve as resolveAssignment,
  type SuggestEroInput,
  srgbComponentsOf,
  suggestEro,
  type ValidationIssue,
  validateModelo,
  valoroNames,
  WCAG2_METRIC,
  withAspektoPackages,
} from "@fundamento/modelo";
import type { Served } from "./load.js";
import type { ToolName } from "./schemas.js";

export type ToolResult =
  | { ok: true; output: Record<string, unknown> }
  | { ok: false; envelope: { issues: ValidationIssue[]; allowed?: string[] } };

type Args = Record<string, unknown>;
type Tool = (served: Served, args: Args) => ToolResult;

const ok = (output: Record<string, unknown>): ToolResult => ({ ok: true, output });

function fail(issue: Omit<ValidationIssue, "severity">, allowed?: string[]): ToolResult {
  const envelope: { issues: ValidationIssue[]; allowed?: string[] } = {
    issues: [{ severity: "error", ...issue }],
  };
  if (allowed !== undefined) envelope.allowed = allowed;
  return { ok: false, envelope };
}

const ASPEKTO = "aspekto";
const ORDER = "core, then ascending priority, then condition count, then set name; last wins";

function aspektoSummary(entry: Served["modeloJson"]["aspektoj"][number]) {
  return {
    name: entry.name,
    reference: entry.reference === true,
    external: entry.external === true,
    owner: entry.owner,
    license: entry.license ?? entry.licenseNote ?? "",
    fonts: (entry.fonts ?? []).map((font) => ({
      family: font.family,
      license: font.license,
      redistributable: font.redistributable,
      scripts: font.scripts,
    })),
  };
}

function setsOf(served: Served, dimensio: string, valoro: string): string[] {
  return served.modelo.setoj
    .filter((set) => set.kondicxoj.some((k) => k.dimensio === dimensio && k.valoro === valoro))
    .map((set) => set.name)
    .sort();
}

/** Edit distance, for "did you mean" answers. */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0] ?? 0;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j] ?? 0;
      row[j] = Math.min(
        above + 1,
        (row[j - 1] ?? 0) + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return row[b.length] ?? 0;
}

/** Up to `count` candidates closest to `wanted`. */
export function nearest(wanted: string, candidates: readonly string[], count = 5): string[] {
  return [...candidates]
    .map((candidate) => ({ candidate, score: distance(wanted, candidate) }))
    .sort((a, b) => a.score - b.score || (a.candidate < b.candidate ? -1 : 1))
    .slice(0, count)
    .map(({ candidate }) => candidate);
}

const describe: Tool = (served) => {
  const { modeloJson, report } = served;
  const description = describeModelo(modeloJson);
  const byType: Record<string, number> = {};
  for (const token of modeloJson.tokens) byType[token.type] = (byType[token.type] ?? 0) + 1;
  return ok({
    version: description.version,
    dimensioj: description.dimensioj,
    aspektoj: modeloJson.aspektoj.map(aspektoSummary),
    tokens: { count: description.tokenCount, byType, byGroup: description.tokensByGroup },
    reguloj: {
      count: description.reguloCount,
      withKialo: description.reguloWithKialoCount,
      automatic: description.reguloAutomaticCount,
    },
    jugxoj: { count: description.jugxoCount },
    eroj: { count: description.eroCount },
    validation: { errors: report.errors.length, warnings: report.warnings.length },
    sentence: description.sentence,
  });
};

const listDimensioj: Tool = (served) =>
  ok({
    dimensioj: served.modelo.dimensioj.map((dimensio) => ({
      name: dimensio.name,
      priority: dimensio.priority,
      default: dimensio.default,
      valoroj: dimensio.valoroj.map((valoro) => ({
        name: valoro.name,
        sets: setsOf(served, dimensio.name, valoro.name),
      })),
    })),
    order: ORDER,
  });

const listAspektoj: Tool = (served) =>
  ok({
    aspektoj: served.modeloJson.aspektoj.map((entry) => {
      const detail: Record<string, unknown> = {
        ...aspektoSummary(entry),
        id: entry.id,
        package: entry.package ?? "data/dimensioj.json",
        sets: setsOf(served, ASPEKTO, entry.name),
      };
      if (entry.idNamespace !== undefined) detail.idNamespace = entry.idNamespace;
      return detail;
    }),
  });

const searchTokens: Tool = (served, args) => {
  const prefix = typeof args.prefix === "string" ? args.prefix : undefined;
  const text = typeof args.text === "string" ? args.text.toLowerCase() : undefined;
  const limit = typeof args.limit === "number" ? args.limit : 50;
  const offset = typeof args.offset === "number" ? args.offset : 0;
  const matches = served.modeloJson.tokens.filter(
    (token) =>
      (prefix === undefined || token.name === prefix || token.name.startsWith(`${prefix}.`)) &&
      (args.type === undefined || token.type === args.type) &&
      (args.role === undefined || token.role === args.role) &&
      (text === undefined ||
        token.name.toLowerCase().includes(text) ||
        (token.description ?? "").toLowerCase().includes(text)),
  );
  return ok({ total: matches.length, tokens: matches.slice(offset, offset + limit) });
};

const getToken: Tool = (served, args) => {
  const { tokens } = served.modeloJson;
  const entry =
    typeof args.id === "string"
      ? tokens.find((token) => token.id === args.id)
      : tokens.find((token) => token.name === args.name);
  if (entry === undefined) {
    const wanted = typeof args.name === "string" ? args.name : String(args.id);
    return fail(
      {
        rule: "token-unknown",
        path: `token/${wanted}`,
        message: `No token ${wanted} exists in the served Modelo.`,
        suggestion: "Use search_tokens to find tokens by prefix, type, role or text.",
      },
      nearest(
        wanted,
        tokens.map((token) => (typeof args.id === "string" ? token.id : token.name)),
      ),
    );
  }
  const core = served.modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens[entry.name];
  const overrides = served.modelo.setoj
    .filter((set) => set.name !== CORE_SET_NAME && set.tokens[entry.name] !== undefined)
    .sort((a, b) => (a.name < b.name ? -1 : 1))
    .map((set) => {
      const override: Record<string, unknown> = {
        set: set.name,
        kondicxoj: set.kondicxoj.map((k) => `${k.dimensio}=${k.valoro}`),
        value: set.tokens[entry.name]?.value,
      };
      if (set.package !== undefined) override.package = set.package;
      return override;
    });
  const output: Record<string, unknown> = {
    ...entry,
    definition: { set: CORE_SET_NAME, value: core?.value },
    overrides,
  };
  if (core?.textTransform !== undefined) output.textTransform = core.textTransform;
  return ok(output);
};

/** Whole-segment prefix match: `color.action` matches `color.action.primary`, not `color.actionx`. */
const matchesPrefix = (name: string, prefix: string) =>
  name === prefix || name.startsWith(`${prefix}.`);

const aspektoNames = (served: Served) => served.modeloJson.aspektoj.map((entry) => entry.name);

function unknownAspekto(served: Served, aspekto: string): ToolResult {
  return fail(
    {
      rule: "resolve-unknown-valoro",
      path: `aspekto/${aspekto}`,
      message: `Unknown Aspekto '${aspekto}'.`,
      suggestion: `Use one of the served Aspektoj: ${aspektoNames(served).join(", ")}.`,
    },
    aspektoNames(served),
  );
}

const resolveTool: Tool = (served, args) => {
  const given = (args.assignment ?? {}) as Record<string, string>;
  const completed = completeAssignment(served.modelo, given);
  const first = completed.issues[0];
  if (first !== undefined) {
    const dimensio = served.modelo.dimensioj.find(
      (candidate) => `assignment/${candidate.name}` === first.path,
    );
    const allowed =
      first.rule === "resolve-unknown-valoro" && dimensio !== undefined
        ? valoroNames(dimensio)
        : served.modelo.dimensioj.map((candidate) => candidate.name);
    return { ok: false, envelope: { issues: completed.issues, allowed } };
  }
  const names = served.modeloJson.tokens.map((token) => token.name);
  const wanted = Array.isArray(args.tokens) ? (args.tokens as string[]) : undefined;
  for (const entry of wanted ?? []) {
    if (!names.some((name) => matchesPrefix(name, entry))) {
      return fail(
        {
          rule: "token-unknown",
          path: `tokens/${entry}`,
          message: `No token is named ${entry} or lies below it.`,
          suggestion: "Use search_tokens to find token names and prefixes.",
        },
        nearest(entry, names),
      );
    }
  }
  const outcome = resolveAssignment(served.modelo, completed.assignment ?? {});
  if (!outcome.ok) return { ok: false, envelope: { issues: outcome.issues } };
  const tokens = Object.fromEntries(
    Object.entries(outcome.rezolvo.tokens)
      .filter(
        ([name]) => wanted === undefined || wanted.some((entry) => matchesPrefix(name, entry)),
      )
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
  return ok({ assignment: outcome.rezolvo.assignment, tokens });
};

const byName = <T extends { name: string }>(a: T, b: T) =>
  a.name < b.name ? -1 : a.name > b.name ? 1 : 0;

const listReguloj: Tool = (served, args) => {
  const aspekto = typeof args.aspekto === "string" ? args.aspekto : undefined;
  if (aspekto !== undefined && !aspektoNames(served).includes(aspekto)) {
    return unknownAspekto(served, aspekto);
  }
  const text = typeof args.text === "string" ? args.text.toLowerCase() : undefined;
  const reguloj = served.modeloJson.reguloj
    .filter((regulo) => regulo.aspekto === undefined || regulo.aspekto === aspekto)
    .filter(
      (regulo) =>
        text === undefined ||
        [regulo.name, regulo.statement, regulo.kialo, regulo.scope].some((field) =>
          field.toLowerCase().includes(text),
        ),
    )
    .sort(byName);
  return ok({ reguloj });
};

const listJugxoj: Tool = (served, args) => {
  const aspekto = typeof args.aspekto === "string" ? args.aspekto : undefined;
  if (aspekto !== undefined && !aspektoNames(served).includes(aspekto)) {
    return unknownAspekto(served, aspekto);
  }
  const ref = args.ref as Record<string, string> | undefined;
  const jugxoj = served.modeloJson.jugxoj
    .filter(
      (jugxo) => aspekto === undefined || jugxo.aspekto === undefined || jugxo.aspekto === aspekto,
    )
    .filter(
      (jugxo) =>
        ref === undefined ||
        Object.entries(ref).every(
          ([key, value]) => (jugxo.ref as unknown as Record<string, string>)[key] === value,
        ),
    )
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return ok({ jugxoj });
};

const validate: Tool = (served, args) => {
  if (typeof args.aspektoPath !== "string") {
    return ok({
      valid: served.report.errors.length === 0,
      errors: served.report.errors,
      warnings: served.report.warnings,
      scope: "served",
    });
  }
  if (served.source === undefined) {
    return fail({
      rule: "mcp-input-invalid",
      path: "validate/aspektoPath",
      message:
        "This server serves a pre-built export (--export); it has no core to validate against.",
      suggestion: "Start the server without --export, or run `fm modelo validate --aspekto <dir>`.",
    });
  }
  const report = validateModelo(withAspektoPackages(served.source, [args.aspektoPath]));
  return ok({
    valid: report.errors.length === 0,
    errors: report.errors,
    warnings: report.warnings,
    scope: "package",
  });
};

const deriveName: Tool = (served, args) => {
  const name = String(args.name);
  const grammar = checkTokenName(name, `derive_name/${name}`);
  if (grammar !== null) {
    return {
      ok: false,
      envelope: {
        issues: [{ ...grammar, path: `derive_name/${name}` }],
      },
    };
  }
  const type = served.modeloJson.tokens.find((token) => token.name === name)?.type;
  const celoj = typeof args.celo === "string" ? [args.celo as (typeof CELOJ)[number]] : CELOJ;
  const derivations: Record<string, string> = {};
  const issues: ValidationIssue[] = [];
  for (const celo of celoj) {
    const derived = NOM_REGULOJ[celo].derive(name, type);
    if (isNoTarget(derived)) {
      issues.push({
        rule: "nomregulo-no-target",
        severity: "warning",
        path: `derive_name/${name}/tailwind`,
        message: derived.reason,
        suggestion: "Use the CSS custom property; Tailwind has no theme variable for this token.",
      });
      continue;
    }
    derivations[celo] = derived;
  }
  return ok(issues.length === 0 ? { name, derivations } : { name, derivations, issues });
};

/** Spec 002 FR-09: the contrast of any colour pair, from the modelo function. */
const checkContrastTool: Tool = (served, args) => {
  const result = checkContrast(served.modelo, args as unknown as CheckContrastInput);
  if (!result.ok) {
    return {
      ok: false,
      envelope: {
        issues: result.issues,
        ...(result.allowed === undefined ? {} : { allowed: result.allowed }),
      },
    };
  }
  return ok(result.output as unknown as Record<string, unknown>);
};

/** Spec 002 FR-10: why a token has its value, from the modelo function and the served report. */
const explainTool: Tool = (served, args) => {
  const result = explain(served.modelo, args as unknown as ExplainInput, served.report);
  if (!result.ok) {
    return {
      ok: false,
      envelope: {
        issues: result.issues,
        ...(result.allowed === undefined ? {} : { allowed: result.allowed }),
      },
    };
  }
  return ok(JSON.parse(JSON.stringify(result.output)) as Record<string, unknown>);
};

/** Spec 002 FR-11: a Regulo with its reason and its violations in the served Modelo. */
const explainReguloTool: Tool = (served, args) => {
  const result = explainRegulo(served.modelo, args as unknown as ExplainReguloInput, served.report);
  if (!result.ok) {
    return {
      ok: false,
      envelope: {
        issues: result.issues,
        ...(result.allowed === undefined ? {} : { allowed: result.allowed }),
      },
    };
  }
  return ok(JSON.parse(JSON.stringify(result.output)) as Record<string, unknown>);
};

/** Spec 002 FR-12: a term of the Ontologio with its instances in the served Modelo. */
const describeTermTool: Tool = (served, args) => {
  const result = describeTerm(served.modelo, args as unknown as DescribeTermInput);
  if (!result.ok) {
    return {
      ok: false,
      envelope: {
        issues: result.issues,
        ...(result.allowed === undefined ? {} : { allowed: result.allowed }),
      },
    };
  }
  return ok(JSON.parse(JSON.stringify(result.output)) as Record<string, unknown>);
};

/** The answer of a Gvidanto function as a tool result (Spec 002, Spec 003). */
function gvidanto(
  result:
    | { ok: true; output: unknown }
    | { ok: false; issues: ValidationIssue[]; allowed?: string[] },
): ToolResult {
  if (!result.ok) {
    return {
      ok: false,
      envelope: {
        issues: result.issues,
        ...(result.allowed === undefined ? {} : { allowed: result.allowed }),
      },
    };
  }
  return ok(JSON.parse(JSON.stringify(result.output)) as Record<string, unknown>);
}

/** list_eroj (Spec 003 FR-13): every Ero with its variants and props. */
const listErojTool: Tool = (served) => ok(listEroj(served.modelo));

/** get_ero (Spec 003 FR-13): one Ero with Skemo, Reguloj, examples and projections. */
const getEroTool: Tool = (served, args) =>
  gvidanto(getEro(served.modelo, args as unknown as GetEroInput));

/** suggest_ero (Spec 003 FR-13): the Ero and the props a goal asks for (goal since F1-T00). */
const suggestEroTool: Tool = (served, args) =>
  gvidanto(suggestEro(served.modelo, args as unknown as SuggestEroInput));

/** check_usage (Spec 003 FR-13): instances against the Ero Reguloj. */
const checkUsageTool: Tool = (served, args) =>
  gvidanto(checkUsage(served.modelo, args as unknown as CheckUsageInput));

/** list_sxablonoj (Spec 020, G3): every Sxablono with its kind and regions. */
const listSxablonojTool: Tool = (served) =>
  ok(JSON.parse(JSON.stringify(listSxablonoj(served.modelo))) as Record<string, unknown>);

/** get_sxablono (Spec 020, G3): one Sxablono with Skemo and Uzo, or its brief. */
const getSxablonoTool: Tool = (served, args) =>
  gvidanto(getSxablono(served.modelo, args as unknown as GetSxablonoInput));

/**
 * The structure and calibration preview_agordo derives over: the repository's core with komuna,
 * as `fm agordilo derive` reads them — read once, on the first call.
 */
let agordiloBasis: { structure: Structure; calibration: Calibration } | undefined;

const round = (value: number, digits: number): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

/** `#rrggbb` of an sRGB colour, each channel clipped to the gamut. */
const hexOf = (components: readonly number[]): string =>
  `#${components
    .map((channel) =>
      Math.round(Math.min(1, Math.max(0, channel)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;

/** The report in short (preview_agordo, propose_agordo): no pair list, the kialo per violation. */
function raportoShort(served: Served, raporto: Raporto) {
  const kialoj = new Map(
    served.modelo.reguloj
      .filter((regulo) => regulo.aspekto === undefined)
      .map((regulo) => [regulo.name, regulo.kialo]),
  );
  return {
    summary: raporto.summary,
    checks: raporto.checks.map(({ rule, fixed, passed, violations }) => ({
      rule,
      fixed,
      passed,
      violations,
    })),
    violations: raporto.violations.map(({ path: _path, regulo, ...violation }) => ({
      ...violation,
      ...(regulo === undefined
        ? {}
        : { regulo: { ...regulo, kialo: kialoj.get(regulo.name) ?? "" } }),
    })),
    jugxoj: raporto.jugxoj,
  };
}

/**
 * preview_agordo (Spec 016 ③, G9): an Agordo through the Agordilo — derived, checked, explained —
 * without writing anything. The report is the one `fm agordilo derive` writes (without the pair
 * list); every violation carries the kialo of its Regulo, and the lead colour its own contrast.
 */
const previewAgordo: Tool = (served, args) => {
  const { agordo, issues } = readAgordo(args.agordo, "agordo");
  if (agordo === undefined) return { ok: false, envelope: { issues } };
  agordiloBasis ??= { structure: readStructure(), calibration: loadCalibration() };
  const { raporto, palettes, exportable } = deriveAspekto(
    agordo,
    agordiloBasis.structure,
    agordiloBasis.calibration,
  );
  const lead = parseAgordoColor(agordo.leitfarbe) ?? { l: 0, c: 0, h: 0 };
  const leadRgb = srgbComponentsOf(oklchColor(lead.l, lead.c, lead.h));
  const leadColor = {
    colorSpace: "srgb" as const,
    components: leadRgb.map((c) => Math.min(1, Math.max(0, c))),
  };
  const contrastOn = (surface: number) =>
    round(
      WCAG2_METRIC.compute(leadColor, {
        colorSpace: "srgb",
        components: [surface, surface, surface],
      }),
      2,
    );
  const apca = raporto.hints.filter((hint) => hint.rule === "contrast-advisory").length;
  return ok({
    aspekto: raporto.aspekto,
    exportable,
    writes: false,
    leitfarbe: {
      input: agordo.leitfarbe,
      hex: hexOf(leadRgb),
      onWhite: contrastOn(1),
      onBlack: contrastOn(0),
    },
    ...raportoShort(served, raporto),
    palettes: PALETTES.map((palette) => ({
      palette,
      source: {
        hue: round(palettes.sources[palette].hue, 2),
        chroma: round(palettes.sources[palette].chroma, 4),
        origin: palettes.sources[palette].origin,
      },
      steps: palettes.steps
        .filter((step) => step.palette === palette)
        .map((step) => ({
          step: step.step,
          hex: step.hex,
          target: round(step.target, 2),
          achieved: round(step.achieved, 2),
          onTarget: step.onTarget,
        })),
    })),
    hints: { apca, other: raporto.hints.length - apca },
  });
};

/** What the Agordo tools of Spec 019 ③ read once: the gestalt basis and the wish vocabulary. */
let promptBasis: { gestalt: GestaltBasis; wuensche: Wuensche } | undefined;

function agordoBases() {
  agordiloBasis ??= { structure: readStructure(), calibration: loadCalibration() };
  promptBasis ??= {
    gestalt: gestaltBasis(agordiloBasis.structure.files),
    wuensche: readWuensche(),
  };
  return { ...agordiloBasis, ...promptBasis };
}

/** The repository root: the Vitrino of `fm projekcioj build --out .fundamento/projekcioj` lies below. */
const REPO_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const VITRINO = join(REPO_ROOT, ".fundamento", "projekcioj", "vitrino", "index.html");

/** A part of the Werkstatt's fragment: deflate-raw, base64url (Spec 016 ② D-10). */
const fragmentPart = (value: unknown): string =>
  deflateRawSync(Buffer.from(JSON.stringify(value), "utf8")).toString("base64url");

/** The link into the Werkstatt: the Agordo before, the proposal on top (Spec 019 ②, G7). */
function werkstattLink(before: Agordo, proposed: Agordo, wunsch: string | undefined) {
  const vorschlag = wunsch === undefined ? { agordo: proposed } : { wunsch, agordo: proposed };
  const fragment = `#aspekto=komuna&modus=werkstatt&agordo=${fragmentPart(before)}&vorschlag=${fragmentPart(vorschlag)}`;
  return { fragment, file: `${pathToFileURL(VITRINO).href}${fragment}` };
}

/**
 * propose_agordo (Spec 019 ③, G6.1): a wish in words and explicit values move the sliders, from
 * the wish vocabulary; the answer is the new Agordo, the diff, the report in short and a link
 * into the Werkstatt. An unknown wish asks back; a movement stops before a fixed rule. Read-only.
 */
const proposeAgordoTool: Tool = (served, args) => {
  const { agordo, issues } = readAgordo(args.agordo, "agordo");
  if (agordo === undefined) return { ok: false, envelope: { issues } };
  const bases = agordoBases();
  const wunsch = typeof args.wunsch === "string" ? args.wunsch : undefined;
  const regler = (args.regler ?? {}) as Record<string, number | string>;
  const parsed =
    wunsch === undefined ? { treffer: [], unbekannt: [] } : parseWunsch(wunsch, bases.wuensche);
  const wish =
    wunsch === undefined
      ? {}
      : {
          wish: {
            text: wunsch,
            matched: parsed.treffer.map((entry) => ({ word: entry.wort, kialo: entry.kialo })),
            unknown: parsed.unbekannt,
          },
        };
  const known = bases.wuensche.wuensche.map((entry) => entry.wort);
  if (parsed.treffer.length === 0 && Object.keys(regler).length === 0) {
    // G6.1 Grenze: no movement, no guess — the question goes back to the person.
    const unknown = parsed.unbekannt.length === 0 ? (wunsch ?? "") : parsed.unbekannt.join(", ");
    return ok({
      aspekto: agordo.name,
      writes: false,
      ...wish,
      action: "ask-human",
      known,
      kialo: `The wish vocabulary knows no movement for „${unknown}“; Fundamento does not guess what it should mean (Spec 019 G6). Ask which of the known wishes is meant, or set the sliders yourself: ${known.join(", ")}.`,
      agordo,
      diff: [],
      sentence: vorschlagSatz(wunsch, []),
      kialoj: [],
      atLimit: [],
    });
  }
  const proposed = proposeAgordo(
    agordo,
    { ...(wunsch === undefined ? {} : { wunsch }), regler },
    bases.wuensche,
    bases.gestalt,
    bases.structure,
    bases.calibration,
  );
  const { raporto, exportable } = proposed.derivation;
  return ok({
    aspekto: agordo.name,
    writes: false,
    ...wish,
    agordo: proposed.agordo,
    diff: proposed.diff,
    sentence: vorschlagSatz(wunsch, proposed.diff),
    kialoj: proposed.saetze,
    atLimit: proposed.amEnde,
    ...(proposed.angehalten === undefined
      ? {}
      : {
          stopped: {
            share: proposed.angehalten.anteil,
            rules: proposed.angehalten.regeln,
            sentence:
              proposed.angehalten.anteil === 0
                ? `Stopped before the fixed rule ${proposed.angehalten.regeln.join(", ")}: no part of the movement holds, the Agordo stays as it was.`
                : `Stopped before the fixed rule ${proposed.angehalten.regeln.join(", ")}: the movement goes ${Math.round(proposed.angehalten.anteil * 100)} % of the way.`,
          },
        }),
    exportable,
    ...raportoShort(served, raporto),
    link: werkstattLink(agordo, proposed.agordo, wunsch),
  });
};

/** A refusal of save_agordo (E4): the path, the file, nothing written. */
function refuse(message: string, suggestion: string): ToolResult {
  return fail({ rule: "agordo-save-refused", path: "save_agordo/pfad", message, suggestion });
}

const inside = (root: string, path: string): boolean => {
  const rel = relative(root, path);
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
};

/**
 * save_agordo (Spec 019 ③, G6.2, W-25, W-26): writes an Agordo — only with confirm, only inside
 * the server's working directory, only *.json, never over a file that is no Agordo — and appends
 * a historio entry. A fixed rule locks the save; an adjustable one needs a Jugxo.
 */
const saveAgordoTool: Tool = (served, args) => {
  const { agordo, issues } = readAgordo(args.agordo, "agordo");
  if (agordo === undefined) return { ok: false, envelope: { issues } };
  const pfad = String(args.pfad ?? "");
  const root = resolve(served.workdir);
  const target = resolve(root, pfad);
  if (!pfad.endsWith(".json")) {
    return refuse(
      `save_agordo writes only *.json; ${JSON.stringify(pfad)} is none.`,
      "Name a path that ends in .json, e.g. marken/<name>.json.",
    );
  }
  if (!inside(root, target)) {
    return refuse(
      `${JSON.stringify(pfad)} lies outside the server's working directory (${root}); save_agordo never writes there.`,
      "Name a path inside the working directory, e.g. marken/<name>.json.",
    );
  }
  // A link may not lead out: the nearest existing folder (and an existing file) must lie inside.
  let probe = dirname(target);
  while (!existsSync(probe)) probe = dirname(probe);
  const realRoot = realpathSync(root);
  const realProbe = realpathSync(probe);
  if (realProbe !== realRoot && !inside(realRoot, realProbe)) {
    return refuse(
      `${JSON.stringify(pfad)} leads out of the working directory through a link.`,
      "Name a path inside the working directory that no link leads out of.",
    );
  }
  const exists = existsSync(target);
  let before: Agordo | undefined;
  if (exists) {
    if (!inside(realRoot, realpathSync(target))) {
      return refuse(
        `${JSON.stringify(pfad)} is a link out of the working directory.`,
        "Name another file inside the working directory.",
      );
    }
    let value: unknown;
    try {
      value = JSON.parse(readFileSync(target, "utf8"));
    } catch {
      value = undefined;
    }
    before = readAgordo(value, "agordo").agordo;
    if (before === undefined) {
      return refuse(
        `${JSON.stringify(pfad)} exists and is no Agordo; save_agordo never writes over another file.`,
        "Name a new path, or the path of an Agordo saved before.",
      );
    }
  }
  const bases = agordoBases();
  const {
    raporto,
    exportable,
    issues: refused,
  } = deriveAspekto(agordo, bases.structure, bases.calibration);
  if (!exportable) return { ok: false, envelope: { issues: refused } };
  const datum = typeof args.datum === "string" ? args.datum : new Date().toISOString().slice(0, 10);
  const wunsch = typeof args.wunsch === "string" ? args.wunsch : undefined;
  const { historio: given, ...rest } = agordo;
  const { historio: earlier, ...previous } = before ?? { historio: undefined };
  const entry = historioEintrag(
    before === undefined ? undefined : (previous as Agordo),
    rest as Agordo,
    wunsch,
    datum,
    bases.gestalt,
  );
  const toWrite: Agordo = { ...(rest as Agordo), historio: [...(earlier ?? given ?? []), entry] };
  const text = `${JSON.stringify(toWrite, null, 2)}\n`;
  const confirm = args.confirm === true;
  if (confirm) {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
  }
  return ok({
    writes: confirm,
    path: relative(root, target).split(sep).join("/"),
    exists,
    agordo: toWrite,
    entry,
    text,
    exportable,
    summary: raporto.summary,
  });
};

export const TOOLS: Record<ToolName, Tool> = {
  describe,
  list_dimensioj: listDimensioj,
  list_aspektoj: listAspektoj,
  search_tokens: searchTokens,
  get_token: getToken,
  resolve: resolveTool,
  list_reguloj: listReguloj,
  list_jugxoj: listJugxoj,
  validate,
  derive_name: deriveName,
  check_contrast: checkContrastTool,
  explain: explainTool,
  explain_regulo: explainReguloTool,
  describe_term: describeTermTool,
  list_eroj: listErojTool,
  get_ero: getEroTool,
  suggest_ero: suggestEroTool,
  check_usage: checkUsageTool,
  preview_agordo: previewAgordo,
  propose_agordo: proposeAgordoTool,
  save_agordo: saveAgordoTool,
  list_sxablonoj: listSxablonojTool,
  get_sxablono: getSxablonoTool,
};
