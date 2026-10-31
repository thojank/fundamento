// Spec 036 Teil 6 (6.3): readers take the old and the new identifiers for one version, writers
// write only the new ones. The writers of the Modelo: `pnpm id:new` (its instructions name the
// field an ID goes into), `pnpm vortaro:ero-tokenoj` (it writes Ero-Tokens into the core and the
// Aspekto sets, also into a set written in the old form) and the export. The old names are
// composed at run time by the codemod's rule table (D-23).

import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import {
  legacyIdentifiers,
  NEW_NAMES,
  oldNames,
} from "../../../../scripts/neutrale-namen/rules.mjs";
import { runEroTokenojCli } from "../eroj/ero-tokenoj-cli.js";
import { prepareModeloExport } from "../export/prepare.js";
import { IDS_HELP } from "../ids/cli.js";
import { defaultModeloSource, fixtureModeloSource } from "../load/source.js";
import { FUNDAMENTO_EXTENSION_KEY } from "./dtcg.js";
import { currentNameForm } from "./names.js";
import { CONFIG_SCHEMA_ID, MODELO_SCHEMA_ID } from "./schema.js";

const old = oldNames();
const OLD_IDENTIFIERS = [old.extensionKey, old.schemaBase, old.ontologioBase];
const fixtures = fileURLToPath(new URL("../../test/fixtures/", import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), "fm-names-writers-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

/** The old identifiers a text still names (none, for a writer of Spec 036 Teil 6). */
const oldIn = (text: string): string[] => OLD_IDENTIFIERS.filter((name) => text.includes(name));

describe("writers write only the new identifiers (Spec 036 6.3)", () => {
  it("the code writes the new form: the extension key, the schema IDs and the reader's target", () => {
    expect(FUNDAMENTO_EXTENSION_KEY).toBe(NEW_NAMES.extensionKey);
    expect(MODELO_SCHEMA_ID).toBe(`${NEW_NAMES.schemaPrefix}modelo`);
    expect(CONFIG_SCHEMA_ID).toBe(`${NEW_NAMES.schemaPrefix}config`);
    expect(currentNameForm().id).toBe("neutral");
  });

  it("pnpm id:new names the new extension key as the field of an ID", () => {
    expect(IDS_HELP).toContain(`$extensions["${NEW_NAMES.extensionKey}"].id`);
    expect(oldIn(IDS_HELP)).toEqual([]);
  });

  it("pnpm vortaro:ero-tokenoj writes the Ero-Tokens with the new key, also into a core written in the old form", () => {
    const dir = join(scratch, "ero-tokenoj");
    cpSync(join(fixtures, "invalid/ero-tokeno-unknown"), dir, { recursive: true });
    const corePath = join(dir, "vortaro/sets/core.json");
    const core: unknown = JSON.parse(readFileSync(corePath, "utf8"));
    writeFileSync(corePath, `${JSON.stringify(legacyIdentifiers(core), null, 2)}\n`);
    const quiet = { cwd: dir, defaultSource: defaultModeloSource, stdout() {}, stderr() {} };
    expect(runEroTokenojCli(["--root", "."], quiet)).toBe(0);
    const written = JSON.parse(readFileSync(corePath, "utf8")) as { ero: unknown };
    const ero = JSON.stringify(written.ero);
    expect(ero).toContain(`"${NEW_NAMES.extensionKey}":{"id":"tok_`);
    expect(oldIn(ero)).toEqual([]);
  });

  it("the export (modelo.json, modelo.schema.json, rezolvoj.json, Tokens-Studio folders) names only the new identifiers", () => {
    const result = prepareModeloExport(
      fixtureModeloSource(join(fixtures, "valid/compose-two-aspektoj")),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { modeloJson, schemaJson, rezolvojJson, vortaro } = result.files;
    const texts = [
      modeloJson,
      schemaJson,
      rezolvojJson,
      ...Object.values(vortaro).flatMap(Object.values),
    ];
    for (const text of texts) expect(oldIn(text)).toEqual([]);
    const schema = JSON.parse(schemaJson) as {
      $defs: { TokenExtensions: { properties: Record<string, unknown> } };
    };
    expect(Object.keys(schema.$defs.TokenExtensions.properties)).toEqual([NEW_NAMES.extensionKey]);
  });

  it("the Agordilo's derived packages in the fixtures (its committed output) name only the new identifiers", () => {
    for (const name of ["aspekto-provo", "aspekto-provo-kompakta"]) {
      const dir = join(fixtures, "valid", name, name);
      for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
        const text = readFileSync(join(entry.parentPath, entry.name), "utf8");
        expect(oldIn(text), `${name}/${entry.name}`).toEqual([]);
      }
    }
  });
});
