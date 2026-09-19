// The tools of @fundamento/mcp as pure functions over what is served (Spec 001, D-13,
// contracts/mcp-tools.md). Each returns the output object or an error envelope (FR-18).

import {
  CELOJ,
  type CheckContrastInput,
  CORE_SET_NAME,
  checkContrast,
  checkTokenName,
  completeAssignment,
  describeModelo,
  isNoTarget,
  NOM_REGULOJ,
  resolve as resolveAssignment,
  type ValidationIssue,
  validateModelo,
  valoroNames,
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
    reguloj: { count: description.reguloCount, withKialo: description.reguloWithKialoCount },
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
};
