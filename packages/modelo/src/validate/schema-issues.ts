// Pipeline step 2: Ajv schema validation of every raw Modelo file, with Ajv's errors turned into
// catalog issues. Ajv reports cascades (`if`, every failed `anyOf` branch) and structure that a
// semantic rule checks with a better message; both are filtered so each problem surfaces once.

import type { ErrorObject, ModeloAjv } from "../contracts/ajv.js";
import { getModeloValidator } from "../contracts/ajv.js";
import { formatIssuePath, type RuleId, type ValidationIssue } from "../contracts/issues.js";
import { DATA_FILE_SCHEMA_DEFS, type DataFileName, SCHEMA_DEFS } from "../contracts/schema.js";
import { appendPointer } from "../json/pointer.js";
import type { ModeloDocument, ModeloFiles } from "../load/files.js";
import { checkTokenName } from "../nomreguloj/token-name.js";
import { isJsonObject, pointerSegments, valueAtPointer } from "./raw.js";

const EXT = "/\\$extensions/com\\.ciferecigo\\.fundamento";

/**
 * Pointers (of the error, or of the missing member for `required`) that a semantic rule or
 * `checkIds` covers. Ajv errors there are dropped in favour of the specific rule.
 */
const SET_FILE_SEMANTIC = [
  // Token values: `token-value-invalid` checks own and inherited types alike (token rules).
  /(^|\/)\$value(\/|$)/,
  // IDs of tokens and the set root: `checkIds` (id-missing, id-format); override tokens:
  // `set-override-has-extensions`.
  new RegExp(`${EXT}/id$`),
  // Individual kondicxoj: `set-kondicxoj-unknown` (set rules).
  new RegExp(`^${EXT}/kondicxoj/\\d+$`),
];

const DATA_FILE_SEMANTIC: Record<DataFileName, RegExp[]> = {
  "dimensioj.json": [
    /^\/dimensioj\/\d+\/(id|priority|default)(\/|$)/,
    /^\/dimensioj\/\d+\/valoroj\/\d+\/id(\/|$)/,
  ],
  "reguloj.json": [/^\/reguloj\/\d+\/(id|kialo)(\/|$)/],
  "jugxoj.json": [/^\/jugxoj\/\d+\/(id|ref)(\/|$)/],
  // Completeness, the Celo and the closing condition are the Manko rules' business (F41).
  "mankoj.json": [
    /^\/mankoj\/\d+\/(id|celo|property|modelo|instead|evidence|date|external|closing)(\/|$)/,
  ],
  "kontrastparoj.json": [/^\/kontrastParoj\/\d+\/(id|foreground|background)(\/|$)/],
  "ids.lock.json": [],
};

/** Subtrees whose schema errors collapse into one issue of a specific rule, at the subtree. */
const DATA_FILE_SUBTREE_RULES: Record<DataFileName, { pattern: RegExp; rule: RuleId }[]> = {
  "dimensioj.json": [
    {
      pattern: /^(\/dimensioj\/\d+\/valoroj\/\d+\/kontrastSojloj)(\/|$)/,
      rule: "kontrast-sojloj-invalid",
    },
    {
      pattern: /^(\/dimensioj\/\d+\/valoroj\/\d+\/aspekto)(\/|$)/,
      rule: "aspekto-metadata-missing",
    },
  ],
  "reguloj.json": [],
  "jugxoj.json": [],
  "mankoj.json": [],
  "kontrastparoj.json": [],
  "ids.lock.json": [],
};

const SUBTREE_SUGGESTIONS: Partial<Record<RuleId, string>> = {
  "kontrast-sojloj-invalid":
    'Give kontrastSojloj as { "wcag2": { "text-normal": n, "text-large": n, "ui": n }, "apca"?: { … } } with ratios between 1 and 21.',
  "aspekto-metadata-missing":
    'Give the Aspekto metadata as { "owner": "…", "licenseNote": "…" }, both non-empty.',
  "aspekto-font-scripts-missing":
    'List the writing systems the font covers as ISO 15924 codes, e.g. "scripts": ["Latn"] (at least one).',
};

/** Schema issues of every set and data file (themes/metadata are checked by drift instead). */
export function schemaIssues(files: ModeloFiles, ajv: ModeloAjv): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const set of files.sets) {
    const validate = getModeloValidator(ajv, SCHEMA_DEFS.tokenSetFile);
    if (!validate(set.value)) {
      issues.push(
        ...mapErrors(validate.errors ?? [], set, SCHEMA_DEFS.tokenSetFile, {
          semantic: SET_FILE_SEMANTIC,
          subtrees: [],
          isSetFile: true,
        }),
      );
    }
  }
  for (const pkg of files.packages) {
    for (const [name, document] of [
      ["reguloj.json", pkg.reguloj],
      ["jugxoj.json", pkg.jugxoj],
    ] as const) {
      if (document === undefined) continue;
      const defName = DATA_FILE_SCHEMA_DEFS[name];
      const validate = getModeloValidator(ajv, defName);
      if (!validate(document.value)) {
        issues.push(
          ...mapErrors(validate.errors ?? [], document, defName, {
            semantic: DATA_FILE_SEMANTIC[name],
            subtrees: DATA_FILE_SUBTREE_RULES[name],
            isSetFile: false,
          }),
        );
      }
    }
    for (const [document, defName] of [
      [pkg.aspekto, SCHEMA_DEFS.aspektoFile],
      [pkg.idsLock, SCHEMA_DEFS.idsLock],
    ] as const) {
      const validate = getModeloValidator(ajv, defName);
      if (!validate(document.value)) {
        issues.push(
          ...mapErrors(validate.errors ?? [], document, defName, {
            // The Aspekto's ID is checked by `checkIds` (id-missing, id-format).
            semantic: defName === SCHEMA_DEFS.aspektoFile ? [/^\/id(\/|$)/] : [],
            subtrees:
              defName === SCHEMA_DEFS.aspektoFile
                ? [
                    {
                      pattern: /^(\/fonts\/\d+\/scripts)(\/|$)/,
                      rule: "aspekto-font-scripts-missing",
                    },
                  ]
                : [],
            isSetFile: false,
          }),
        );
      }
    }
  }
  for (const document of files.eroj) {
    const validate = getModeloValidator(ajv, SCHEMA_DEFS.eroFile);
    if (!validate(document.value)) {
      issues.push(
        ...mapErrors(validate.errors ?? [], document, SCHEMA_DEFS.eroFile, {
          // The IDs of Ero and Skemo are checked by `checkIds` (id-missing, id-format).
          semantic: [/^\/(ero|skemo)\/id(\/|$)/],
          subtrees: [],
          isSetFile: false,
        }),
      );
    }
  }
  for (const name of Object.keys(DATA_FILE_SCHEMA_DEFS) as DataFileName[]) {
    const document = files.data[name];
    const defName = DATA_FILE_SCHEMA_DEFS[name];
    const validate = getModeloValidator(ajv, defName);
    if (!validate(document.value)) {
      issues.push(
        ...mapErrors(validate.errors ?? [], document, defName, {
          semantic: DATA_FILE_SEMANTIC[name],
          subtrees: DATA_FILE_SUBTREE_RULES[name],
          isSetFile: false,
        }),
      );
    }
  }
  return issues;
}

interface MappingContext {
  semantic: readonly RegExp[];
  subtrees: readonly { pattern: RegExp; rule: RuleId }[];
  isSetFile: boolean;
}

/** The pointer an error is about: the missing member for `required`, else the instance. */
function targetPointer(error: ErrorObject): string {
  if (error.keyword === "required" && typeof error.params.missingProperty === "string") {
    return appendPointer(error.instancePath, error.params.missingProperty);
  }
  return error.instancePath;
}

function isWithin(pointer: string, ancestor: string): boolean {
  return pointer === ancestor || pointer.startsWith(`${ancestor}/`);
}

function mapErrors(
  errors: readonly ErrorObject[],
  document: ModeloDocument,
  defName: string,
  context: MappingContext,
): ValidationIssue[] {
  // 1. `if` errors only say that a `then`/`else` failed; that failure is reported itself.
  // 2. Errors a semantic rule covers are dropped.
  const relevant = errors.filter(
    (error) =>
      error.keyword !== "if" &&
      !context.semantic.some((pattern) => pattern.test(targetPointer(error))),
  );
  // 3. A failed `anyOf` also reports every failed branch; keep only the outermost `anyOf`.
  const anyOfPointers = [
    ...new Set(relevant.filter((error) => error.keyword === "anyOf").map((e) => e.instancePath)),
  ];
  const outermost = anyOfPointers.filter(
    (pointer) => !anyOfPointers.some((other) => other !== pointer && isWithin(pointer, other)),
  );
  const collapsed = relevant.filter((error) => {
    const covering = outermost.find((pointer) => isWithin(targetPointer(error), pointer));
    if (covering === undefined) {
      return true;
    }
    // Keep exactly one error per collapsed subtree: the outermost `anyOf` itself.
    return error.keyword === "anyOf" && error.instancePath === covering;
  });
  // 4. Map, then keep one issue per (rule, path): several errors inside one subtree (e.g. a
  //    malformed kontrastSojloj) become a single issue at the subtree.
  const issues = new Map<string, ValidationIssue>();
  for (const error of collapsed) {
    const issue = toIssue(error, document, defName, context);
    const key = `${issue.rule} ${issue.path}`;
    if (!issues.has(key)) {
      issues.set(key, issue);
    }
  }
  return [...issues.values()];
}

function toIssue(
  error: ErrorObject,
  document: ModeloDocument,
  defName: string,
  context: MappingContext,
): ValidationIssue {
  const { file } = document;
  const pointer = error.instancePath;

  if (context.isSetFile) {
    // A group member that is not a valid name segment ([a-z0-9]+, FR-13a).
    const extra = error.params.additionalProperty;
    if (
      error.keyword === "additionalProperties" &&
      typeof extra === "string" &&
      !extra.startsWith("$") &&
      !isToken(valueAtPointer(document.value, pointer))
    ) {
      const memberPointer = appendPointer(pointer, extra);
      const name = [...pointerSegments(pointer), extra].join(".");
      const issue = checkTokenName(name, formatIssuePath({ file, pointer: memberPointer }));
      if (issue !== null) {
        return {
          ...issue,
          message: `Group key ${JSON.stringify(extra)} is not a valid token name segment, so the name ${JSON.stringify(name)} breaks the name grammar (FR-13a).`,
        };
      }
    }
    if (error.keyword === "enum" && pointer.endsWith("/$type")) {
      return {
        rule: "token-type-unknown",
        severity: "error",
        path: formatIssuePath({ file, pointer }),
        message: `Unknown token type ${JSON.stringify(valueAtPointer(document.value, pointer))}.`,
        suggestion: `Use one of the DTCG 2025.10 types: ${allowedValues(error)}.`,
      };
    }
    if (error.keyword === "uniqueItems" && new RegExp(`^${EXT}/kondicxoj$`).test(pointer)) {
      const index = Math.max(Number(error.params.i), Number(error.params.j));
      return {
        rule: "set-kondicxoj-contradictory",
        severity: "error",
        path: formatIssuePath({ file, pointer: appendPointer(pointer, index) }),
        message: `The kondicxo ${JSON.stringify(valueAtPointer(document.value, appendPointer(pointer, index)))} is listed more than once.`,
        suggestion: "List each dimensio=valoro condition once.",
      };
    }
  }

  const target = targetPointer(error);
  for (const { pattern, rule } of context.subtrees) {
    const match = pattern.exec(target);
    if (match?.[1] !== undefined) {
      return {
        rule,
        severity: "error",
        path: formatIssuePath({ file, pointer: match[1] }),
        message: `${describe(error)} (at ${target}).`,
        suggestion: SUBTREE_SUGGESTIONS[rule] ?? schemaSuggestion(defName, error),
      };
    }
  }

  const kontrastParo = kontrastParoIssue(error, file);
  if (kontrastParo !== undefined) return kontrastParo;

  const where =
    error.keyword === "additionalProperties" && typeof error.params.additionalProperty === "string"
      ? appendPointer(pointer, error.params.additionalProperty)
      : pointer;
  return {
    rule: "schema-violation",
    severity: "error",
    path: formatIssuePath({ file, pointer: where }),
    message: `${describe(error)}.`,
    suggestion: schemaSuggestion(defName, error),
  };
}

/** The two `aux` rules of a KontrastParo (Spec 002, FR-07), in words an agent can act on. */
function kontrastParoIssue(error: ErrorObject, file: string): ValidationIssue | undefined {
  if (!error.schemaPath.includes("/KontrastParo/allOf/")) return undefined;
  const path = formatIssuePath({ file, pointer: error.instancePath });
  if (error.keyword === "not") {
    return {
      rule: "schema-violation",
      severity: "error",
      path,
      message:
        "A text pair (kategorio text-normal or text-large) cannot name an alternative pair aux: text must reach its own threshold.",
      suggestion:
        "Remove aux from this pair; an alternative pair is allowed for kategorio ui only (Spec 002, FR-07).",
    };
  }
  if (error.keyword === "required" && error.params.missingProperty === "kialo") {
    return {
      rule: "schema-violation",
      severity: "error",
      path,
      message:
        "A KontrastParo with an alternative pair aux must say why the alternative is enough.",
      suggestion:
        'Add "kialo" with the reason, e.g. which WCAG criterion lets the alternative carry the pair.',
    };
  }
  return undefined;
}

function isToken(node: unknown): boolean {
  return isJsonObject(node) && "$value" in node;
}

function allowedValues(error: ErrorObject): string {
  const allowed: unknown = error.params.allowedValues;
  return Array.isArray(allowed) ? allowed.map(String).join(", ") : "";
}

function describe(error: ErrorObject): string {
  switch (error.keyword) {
    case "additionalProperties":
      return `Unexpected member ${JSON.stringify(error.params.additionalProperty)}`;
    case "enum":
      return `Value must be one of: ${allowedValues(error)}`;
    case "anyOf":
      return "Value matches none of the allowed forms";
    default:
      return `Value ${error.message ?? "is invalid"}`;
  }
}

function schemaSuggestion(defName: string, error: ErrorObject): string {
  if (error.keyword === "additionalProperties") {
    return `Remove or rename the member; the Modelo schema (#/$defs/${defName}) does not allow it here.`;
  }
  return `Change the value to match the Modelo schema (#/$defs/${defName}, rule ${error.schemaPath}).`;
}
