// Spec 036 Teil 6 (6.3): for one version the readers accept Fundamento's own identifiers in the
// old and in the new form – the DTCG extension key, the schema IDs and the ontology base – and
// normalise them on read, so a token set, an Aspekto, a config or a data file that refers to a
// schema loads, validates and exports byte for byte the same in either form. The old names are
// composed at run time by the rule table of the codemod (D-23); no file names them.

import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import {
  legacyIdentifiers,
  mapIdentifiers,
  oldNames,
  schemaUrn,
} from "../../../../scripts/neutrale-namen/rules.mjs";
import { createModeloAjv } from "../contracts/ajv.js";
import { CONFIG_SCHEMA_ID, MODELO_SCHEMA_ID } from "../contracts/schema.js";
import { prepareModeloExport } from "../export/prepare.js";
import { checkOntologio, readOntologio } from "../ontologio/check.js";
import { loadModelo } from "./load-modelo.js";
import { defaultModeloSource, fixtureModeloSource } from "./source.js";

/** The two forms of the identifiers: the old one (read for one version) and the new one. */
const FORMS = ["alt", "neu"] as const;
type Form = (typeof FORMS)[number];

/** A JSON value with every identifier in the given form, whatever form it was written in. */
function inForm(value: unknown, form: Form): unknown {
  const neu: unknown = JSON.parse(mapIdentifiers(JSON.stringify(value)));
  return form === "neu" ? neu : legacyIdentifiers(neu);
}

/** The ID of a schema file of the repo (`modelo.schema.json`, `mcp/common.json`) in a form. */
function schemaIdIn(path: string, form: Form): string {
  return form === "neu" ? schemaUrn(path) : `${oldNames().schemaBase}${path}`;
}

const FIXTURE = fileURLToPath(
  new URL("../../test/fixtures/valid/compose-two-aspektoj/", import.meta.url),
);
const scratch = mkdtempSync(join(tmpdir(), "fm-legacy-names-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

function jsonFilesBelow(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
}

/**
 * The fixture with two Aspektoj, plus a data file and a config that refer to their schema by its
 * absolute ID, every JSON file rewritten in `form` (or left as written for `undefined`).
 */
function treeIn(form: Form | undefined): string {
  const root = join(scratch, form ?? "wie-geschrieben");
  cpSync(FIXTURE, root, { recursive: true });
  const referring: Record<string, unknown> = {
    "data/fontoj.json": {
      $schema: `${form === undefined ? MODELO_SCHEMA_ID : schemaIdIn("modelo.schema.json", form)}#/$defs/FontojFile`,
      fontoj: [],
    },
    "fundamento.config.json": {
      $schema: form === undefined ? CONFIG_SCHEMA_ID : schemaIdIn("config.schema.json", form),
      ...(JSON.parse(readFileSync(join(FIXTURE, "fundamento.config.json"), "utf8")) as object),
    },
  };
  for (const [file, value] of Object.entries(referring)) {
    writeFileSync(join(root, file), `${JSON.stringify(value, null, 2)}\n`);
  }
  if (form !== undefined) {
    for (const file of jsonFilesBelow(root)) {
      const value: unknown = JSON.parse(readFileSync(file, "utf8"));
      writeFileSync(file, `${JSON.stringify(inForm(value, form), null, 2)}\n`);
    }
  }
  return root;
}

function exportOf(root: string) {
  const result = prepareModeloExport(fixtureModeloSource(root));
  if (!result.ok) {
    throw new Error(
      `The Modelo at ${root} does not export: ${result.errors
        .slice(0, 5)
        .map((issue) => `${issue.rule} ${issue.path}`)
        .join("; ")}`,
    );
  }
  return result.files;
}

const written = treeIn(undefined);
const trees: Record<Form, string> = { alt: treeIn("alt"), neu: treeIn("neu") };
const asWritten = exportOf(written);

describe("Modelo readers accept the old and the new identifiers (Spec 036 6.3)", () => {
  it.each(FORMS)(
    "a Modelo whose sets, Aspekto, data files and config are written with the %s identifiers loads with the same token IDs",
    (form) => {
      const reference = loadModelo(fixtureModeloSource(written)).modelo;
      const loaded = loadModelo(fixtureModeloSource(trees[form])).modelo;
      expect(loaded).toBeDefined();
      const ids = (modelo: typeof loaded) =>
        (modelo?.setoj ?? []).flatMap((set) =>
          Object.values(set.tokens).map((token) => `${set.name} ${token.name} ${token.id}`),
        );
      expect(ids(loaded).length).toBeGreaterThan(0);
      expect(ids(loaded)).toEqual(ids(reference));
    },
  );

  it.each(FORMS)(
    "a Modelo written with the %s identifiers validates and exports byte for byte like the fixture as written",
    (form) => {
      expect(exportOf(trees[form])).toEqual(asWritten);
    },
  );

  it("the outputs of both forms are byte-equal once the old names are mapped to the new ones", () => {
    const [alt, neu] = FORMS.map((form) => JSON.stringify(exportOf(trees[form])));
    expect(mapIdentifiers(alt ?? "")).toBe(mapIdentifiers(neu ?? ""));
  });
});

describe("the schema loader (Ajv) knows both IDs of the Modelo schema and the config schema", () => {
  const ajv = createModeloAjv();

  it.each(FORMS)("a schema that refers to the Modelo schema by its %s ID compiles", (form) => {
    const validate = ajv.compile({ $ref: `${schemaIdIn("modelo.schema.json", form)}#/$defs/Name` });
    const canonical = ajv.compile({ $ref: `${MODELO_SCHEMA_ID}#/$defs/Name` });
    for (const sample of ["butono", "Kein Name", 3, ""]) {
      expect(validate(sample), JSON.stringify(sample)).toBe(canonical(sample));
    }
  });

  it.each(FORMS)("the config schema is found by its %s ID", (form) => {
    const validate = ajv.getSchema(schemaIdIn("config.schema.json", form));
    expect(validate).toBeDefined();
    expect(validate?.({ aspektoj: [] })).toBe(true);
    expect(validate?.({ aspektoj: "x" })).toBe(false);
  });
});

describe("the Ontologio is read with the old and the new base", () => {
  const constitution = readFileSync(
    new URL("../../../../.specify/memory/constitution.md", import.meta.url),
    "utf8",
  );
  const eroNames = (loadModelo(defaultModeloSource()).modelo?.eroj ?? []).map(
    (entry) => entry.ero.name,
  );

  it.each(FORMS)("an Ontologio written with the %s base passes every drift check", (form) => {
    expect(checkOntologio(inForm(readOntologio(), form), constitution, eroNames)).toEqual([]);
  });
});
