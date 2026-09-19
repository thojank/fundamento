// The tools of @fundamento/mcp as pure functions over what is served (Spec 001, D-13,
// contracts/mcp-tools.md). Each returns the output object or an error envelope (FR-18).

import { CORE_SET_NAME, describeModelo, type ValidationIssue } from "@fundamento/modelo";
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

/** Tools of T024; resolve, list_reguloj, list_jugxoj, validate and derive_name follow in T025. */
export const TOOLS: Partial<Record<ToolName, Tool>> = {
  describe,
  list_dimensioj: listDimensioj,
  list_aspektoj: listAspektoj,
  search_tokens: searchTokens,
  get_token: getToken,
};
