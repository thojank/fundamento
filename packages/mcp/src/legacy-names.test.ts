// Spec 036 Teil 6 (6.3): the MCP schemas accept the schema IDs in the old and in the new form for
// one version. A tool schema written with either form bundles to the same self-contained schema,
// and the process's Ajv resolves a reference to the common and the Modelo schema by either ID. The
// old names are composed at run time by the rule table of the codemod (D-23).

import { readFileSync } from "node:fs";
import { FUNDAMENTO_EXTENSION_KEY, sharedModeloAjv } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import {
  legacyIdentifiers,
  mapIdentifiers,
  oldNames,
  schemaUrn,
} from "../../../scripts/neutrale-namen/rules.mjs";
import { bundleSchema } from "./bundle.js";
import { compileToolSchemas, TOOL_NAMES } from "./schemas.js";

const FORMS = ["alt", "neu"] as const;
type Form = (typeof FORMS)[number];

/** The form the repo's own schemas are written in. */
const WRITTEN: Form = FUNDAMENTO_EXTENSION_KEY === oldNames().extensionKey ? "alt" : "neu";

function inForm(value: unknown, form: Form): Record<string, unknown> {
  const neu: unknown = JSON.parse(mapIdentifiers(JSON.stringify(value)));
  return (form === "neu" ? neu : legacyIdentifiers(neu)) as Record<string, unknown>;
}

function schemaIdIn(path: string, form: Form): string {
  return form === "neu" ? schemaUrn(path) : `${oldNames().schemaBase}${path}`;
}

const toolSchema = (name: string, kind: "input" | "output"): Record<string, unknown> =>
  JSON.parse(
    readFileSync(new URL(`../schema/tools/${name}.${kind}.json`, import.meta.url), "utf8"),
  ) as Record<string, unknown>;

describe("MCP schemas accept the old and the new schema IDs (Spec 036 6.3)", () => {
  it.each(FORMS)(
    "every tool schema written with the %s IDs bundles to the schema the client receives today",
    (form) => {
      for (const name of TOOL_NAMES) {
        for (const kind of ["input", "output"] as const) {
          const schema = toolSchema(name, kind);
          expect(bundleSchema(inForm(schema, form)), `${name}.${kind}`).toEqual(
            bundleSchema(schema),
          );
        }
      }
    },
  );

  it.each(FORMS)(
    "the shared Ajv resolves the common and the Modelo schema by their %s IDs",
    (form) => {
      compileToolSchemas();
      const ajv = sharedModeloAjv();
      const samples = [
        { issues: [] },
        { issues: "keine Liste" },
        { issues: [{ rule: "x", severity: "error", path: "a", message: "m", suggestion: "s" }] },
        "butono",
        "Kein Name",
        3,
      ];
      for (const [path, def] of [
        ["mcp/common.json", "ErrorEnvelope"],
        ["modelo.schema.json", "Name"],
      ] as const) {
        const byForm = ajv.compile({ $ref: `${schemaIdIn(path, form)}#/$defs/${def}` });
        const today = ajv.compile({ $ref: `${schemaIdIn(path, WRITTEN)}#/$defs/${def}` });
        expect(samples.some((sample) => today(sample))).toBe(true);
        for (const sample of samples) {
          expect(byForm(sample), `${def} ${JSON.stringify(sample)}`).toBe(today(sample));
        }
      }
    },
  );
});
