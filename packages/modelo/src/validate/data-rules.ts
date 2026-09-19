// Rules over the data files in pipeline step 3: Dimensioj (FR-11, FR-16, Aspekto metadata),
// Reguloj and Jugxoj (Regularo), KontrastParoj (FR-16). They read the raw documents so pointers
// follow document order. Pure.

import { CORE_SET_NAME } from "../contracts/grammar.js";
import { formatIssuePath, type RuleId, type ValidationIssue } from "../contracts/issues.js";
import { isKonstitucioArtikolo, KONSTITUCIO_ARTIKOLOJ } from "../contracts/jugxo.js";
import type { Modelo } from "../contracts/modelo.js";
import type { ModeloDocument, ModeloFiles } from "../load/files.js";
import { isJsonObject, type JsonObject, rawEntries } from "./raw.js";

export const CONTRAST_DIMENSIO = "contrast";
export const ASPEKTO_DIMENSIO = "aspekto";

/** A KontrastParo whose background is an existing core color token (for per-combination checks). */
export interface CheckableKontrastParo {
  name: string;
  background: string;
  /** `<file>#/kontrastParoj/<i>/background`. */
  backgroundPath: string;
}

export interface DataRulesResult {
  issues: ValidationIssue[];
  kontrastParoj: CheckableKontrastParo[];
}

export function dataIssues(modelo: Modelo, files: ModeloFiles): DataRulesResult {
  const kontrast = kontrastParoIssues(modelo, files.data["kontrastparoj.json"]);
  return {
    issues: [
      ...dimensioIssues(files.data["dimensioj.json"], kontrast.count, composedAspektoNames(modelo)),
      ...reguloIssues(files.data["reguloj.json"]),
      ...jugxoIssues(files.data["jugxoj.json"], files.data["reguloj.json"]),
      ...kontrast.issues,
    ],
    kontrastParoj: kontrast.checkable,
  };
}

function issueAt(
  document: ModeloDocument,
  pointer: string,
  rule: RuleId,
  message: string,
  suggestion: string,
): ValidationIssue {
  return {
    rule,
    severity: "error",
    path: formatIssuePath({ file: document.file, pointer }),
    message,
    suggestion,
  };
}

function nameOf(entry: JsonObject, fallback: string): string {
  return typeof entry.name === "string" ? entry.name : fallback;
}

/** Aspekto names contributed by loaded packages (D-05). */
function composedAspektoNames(modelo: Modelo): string[] {
  return modelo.aspektoPackages.flatMap((pkg) =>
    pkg.composed && pkg.aspekto !== undefined ? [pkg.aspekto] : [],
  );
}

/**
 * - `dimensio-priority-invalid`: priorities are positive integers, unique (reported at the later
 *   Dimensio in file order).
 * - `dimensio-default-invalid`: `default` names one of the Dimensio's valoroj.
 * - `kontrast-sojloj-invalid`: every valoro of the `contrast` Dimensio carries kontrastSojloj and
 *   no other Dimensio does; KontrastParoj need a `contrast` Dimensio.
 * - `aspekto-metadata-missing`: every valoro of the `aspekto` Dimensio carries owner/license.
 * - `schema-violation`: duplicate Dimensio names, duplicate valoro names within a Dimensio.
 */
function dimensioIssues(
  document: ModeloDocument,
  kontrastParoCount: number,
  packageAspektoj: readonly string[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const priorities = new Map<number, string>();
  const names = new Set<string>();
  let hasContrast = false;

  for (const { entry, index } of rawEntries(document.value, "dimensioj")) {
    const pointer = `/dimensioj/${index}`;
    const name = nameOf(entry, `#${index}`);

    if (typeof entry.name === "string") {
      if (names.has(entry.name)) {
        issues.push(
          issueAt(
            document,
            `${pointer}/name`,
            "schema-violation",
            `Dimensio name '${entry.name}' is used twice.`,
            "Give every Dimensio a unique name.",
          ),
        );
      }
      names.add(entry.name);
    }

    const priority = entry.priority;
    if (typeof priority !== "number" || !Number.isInteger(priority) || priority < 1) {
      issues.push(
        issueAt(
          document,
          "priority" in entry ? `${pointer}/priority` : pointer,
          "dimensio-priority-invalid",
          `Dimensio '${name}' has priority ${JSON.stringify(priority) ?? "(none)"}; priorities are positive integers.`,
          "Set priority to a positive integer that no other Dimensio uses (1 = lowest; higher priorities win).",
        ),
      );
    } else {
      const holder = priorities.get(priority);
      if (holder !== undefined) {
        issues.push(
          issueAt(
            document,
            `${pointer}/priority`,
            "dimensio-priority-invalid",
            `Dimensio '${name}' has priority ${priority}, which '${holder}' already uses; the resolution order would be ambiguous.`,
            "Give every Dimensio a unique priority (1 = lowest; higher priorities win).",
          ),
        );
      } else {
        priorities.set(priority, name);
      }
    }

    const valoroj = rawEntries(entry, "valoroj");
    const valoroNames = [
      ...valoroj.flatMap(({ entry: valoro }) =>
        typeof valoro.name === "string" ? [valoro.name] : [],
      ),
      // The aspekto Dimensio's values come from the loaded packages (D-05).
      ...(entry.name === ASPEKTO_DIMENSIO ? packageAspektoj : []),
    ];
    const seenValoroj = new Set<string>();
    for (const { entry: valoro, index: valoroIndex } of valoroj) {
      if (typeof valoro.name === "string") {
        if (seenValoroj.has(valoro.name)) {
          issues.push(
            issueAt(
              document,
              `${pointer}/valoroj/${valoroIndex}/name`,
              "schema-violation",
              `Dimensio '${name}' has the valoro '${valoro.name}' twice.`,
              "Give every valoro of a Dimensio a unique name.",
            ),
          );
        }
        seenValoroj.add(valoro.name);
      }
    }
    if (typeof entry.default !== "string" || !valoroNames.includes(entry.default)) {
      issues.push(
        issueAt(
          document,
          "default" in entry ? `${pointer}/default` : pointer,
          "dimensio-default-invalid",
          `Dimensio '${name}' has default ${JSON.stringify(entry.default) ?? "(none)"}, which is not one of its valoroj.`,
          `Set default to one of: ${valoroNames.length === 0 ? "(no valoroj)" : valoroNames.join(", ")}.`,
        ),
      );
    }

    const isContrast = entry.name === CONTRAST_DIMENSIO;
    hasContrast ||= isContrast;
    for (const { entry: valoro, index: valoroIndex } of valoroj) {
      const valoroPointer = `${pointer}/valoroj/${valoroIndex}`;
      const valoroName = nameOf(valoro, `#${valoroIndex}`);
      const hasSojloj = "kontrastSojloj" in valoro;
      // A present but malformed kontrastSojloj is reported by the schema step (same rule).
      if (isContrast && !hasSojloj) {
        issues.push(
          issueAt(
            document,
            valoroPointer,
            "kontrast-sojloj-invalid",
            `The contrast valoro '${valoroName}' has no kontrastSojloj; the contrast check needs thresholds for every contrast valoro.`,
            'Add "kontrastSojloj": { "wcag2": { "text-normal": n, "text-large": n, "ui": n } } (optionally "apca").',
          ),
        );
      } else if (!isContrast && hasSojloj) {
        issues.push(
          issueAt(
            document,
            `${valoroPointer}/kontrastSojloj`,
            "kontrast-sojloj-invalid",
            `Valoro '${valoroName}' of Dimensio '${name}' carries kontrastSojloj; only the ${CONTRAST_DIMENSIO} Dimensio defines contrast thresholds.`,
            `Remove kontrastSojloj here and define the thresholds on the valoroj of '${CONTRAST_DIMENSIO}'.`,
          ),
        );
      }
      if (entry.name === ASPEKTO_DIMENSIO && !("aspekto" in valoro)) {
        issues.push(
          issueAt(
            document,
            valoroPointer,
            "aspekto-metadata-missing",
            `Aspekto '${valoroName}' has no owner/license metadata.`,
            'Add "aspekto": { "owner": "…", "licenseNote": "…" } to this valoro.',
          ),
        );
      }
    }
  }

  if (!hasContrast && kontrastParoCount > 0) {
    issues.push(
      issueAt(
        document,
        "/dimensioj",
        "kontrast-sojloj-invalid",
        `There are KontrastParoj but no '${CONTRAST_DIMENSIO}' Dimensio carrying their thresholds.`,
        `Add a '${CONTRAST_DIMENSIO}' Dimensio whose every valoro has kontrastSojloj, or remove the KontrastParoj.`,
      ),
    );
  }
  return issues;
}

/**
 * `regulo-kialo-missing`: every Regulo explains itself with a non-blank `kialo`. Reported at
 * `/reguloj/<i>/kialo` whether the member is missing, empty or whitespace-only.
 */
function reguloIssues(document: ModeloDocument): ValidationIssue[] {
  return rawEntries(document.value, "reguloj").flatMap(({ entry, index }) => {
    if (typeof entry.kialo === "string" && entry.kialo.trim() !== "") {
      return [];
    }
    const pointer = `/reguloj/${index}`;
    return [
      issueAt(
        document,
        // Always at the kialo member, missing or blank (same path as `pnpm check:regularo`).
        `${pointer}/kialo`,
        "regulo-kialo-missing",
        `Regulo '${nameOf(entry, `#${index}`)}' has no kialo (reason).`,
        'Add a non-empty "kialo" that explains why the Regulo exists.',
      ),
    ];
  });
}

/**
 * `jugxo-ref-missing`: a Jugxo refers to an existing Regulo (`{ regulo: id }`), Ero
 * (`{ ero: id }`; Phase 0 has no Eroj, so every Ero reference is dangling) or constitution
 * Article (`{ artikolo: "I".."XIII" }`).
 */
function jugxoIssues(document: ModeloDocument, reguloj: ModeloDocument): ValidationIssue[] {
  const reguloIds = new Set(
    rawEntries(reguloj.value, "reguloj").flatMap(({ entry }) =>
      typeof entry.id === "string" ? [entry.id] : [],
    ),
  );
  return rawEntries(document.value, "jugxoj").flatMap(({ entry, index }) => {
    const pointer = `/jugxoj/${index}`;
    const name = typeof entry.id === "string" ? entry.id : `#${index}`;
    const ref = entry.ref;
    if (isJsonObject(ref) && typeof ref.regulo === "string" && Object.keys(ref).length === 1) {
      return reguloIds.has(ref.regulo)
        ? []
        : [
            issueAt(
              document,
              `${pointer}/ref/regulo`,
              "jugxo-ref-missing",
              `Jugxo ${name} refers to Regulo ${ref.regulo}, which does not exist.`,
              `Refer to the ID of an existing Regulo (${listOrNone([...reguloIds].sort())}).`,
            ),
          ];
    }
    if (isJsonObject(ref) && "artikolo" in ref && Object.keys(ref).length === 1) {
      return isKonstitucioArtikolo(ref.artikolo)
        ? []
        : [
            issueAt(
              document,
              `${pointer}/ref/artikolo`,
              "jugxo-ref-missing",
              `Jugxo ${name} refers to Article ${String(ref.artikolo)}, which is not an Article of the constitution.`,
              `Refer to one of the Articles ${KONSTITUCIO_ARTIKOLOJ.join(", ")}.`,
            ),
          ];
    }
    if (isJsonObject(ref) && typeof ref.ero === "string" && Object.keys(ref).length === 1) {
      return [
        issueAt(
          document,
          `${pointer}/ref/ero`,
          "jugxo-ref-missing",
          `Jugxo ${name} refers to Ero ${ref.ero}, which does not exist (the Modelo has no Eroj).`,
          "Refer to an existing Regulo instead, or add the Ero first.",
        ),
      ];
    }
    return [
      issueAt(
        document,
        "ref" in entry ? `${pointer}/ref` : pointer,
        "jugxo-ref-missing",
        `Jugxo ${name} has no valid reference.`,
        'Set "ref" to { "regulo": "<reg_ id>" }, { "ero": "<ero_ id>" } or { "artikolo": "<I..XIII>" }.',
      ),
    ];
  });
}

/**
 * `kontrastparo-token-missing` (foreground/background is no core token) and
 * `kontrastparo-not-color` (it is not a color token). Pairs whose background is a core color
 * token are returned for the per-combination transparency check.
 */
function kontrastParoIssues(
  modelo: Modelo,
  document: ModeloDocument,
): { issues: ValidationIssue[]; checkable: CheckableKontrastParo[]; count: number } {
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME);
  const issues: ValidationIssue[] = [];
  const checkable: CheckableKontrastParo[] = [];
  const entries = rawEntries(document.value, "kontrastParoj");
  for (const { entry, index } of entries) {
    const name = nameOf(entry, `#${index}`);
    // The main pair, and the alternative pair `aux` when declared (Spec 002, FR-07).
    const members: {
      holder: Record<string, unknown>;
      base: string;
      field: "foreground" | "background";
    }[] = [
      { holder: entry, base: `/kontrastParoj/${index}`, field: "foreground" },
      { holder: entry, base: `/kontrastParoj/${index}`, field: "background" },
    ];
    if (isJsonObject(entry.aux)) {
      for (const field of ["foreground", "background"] as const) {
        members.push({ holder: entry.aux, base: `/kontrastParoj/${index}/aux`, field });
      }
    }
    for (const { holder, base, field } of members) {
      const pointer = `${base}/${field}`;
      const tokenName = holder[field];
      const token =
        typeof tokenName === "string" && core !== undefined && Object.hasOwn(core.tokens, tokenName)
          ? core.tokens[tokenName]
          : undefined;
      if (token === undefined) {
        issues.push(
          issueAt(
            document,
            field in holder ? pointer : base,
            "kontrastparo-token-missing",
            `KontrastParo '${name}' names ${field} ${JSON.stringify(tokenName) ?? "(none)"}, which is no core token.`,
            `Set ${field} to the canonical name of a color token defined in core.`,
          ),
        );
      } else if (token.type !== "color") {
        issues.push(
          issueAt(
            document,
            pointer,
            "kontrastparo-not-color",
            `KontrastParo '${name}' names ${field} ${token.name}, a ${token.type} token; contrast needs colors.`,
            `Set ${field} to a color token.`,
          ),
        );
      } else if (field === "background") {
        checkable.push({
          name,
          background: token.name,
          backgroundPath: formatIssuePath({ file: document.file, pointer }),
        });
      }
    }
  }
  return { issues, checkable, count: entries.length };
}

function listOrNone(names: readonly string[]): string {
  return names.length === 0 ? "none exist" : names.join(", ");
}
