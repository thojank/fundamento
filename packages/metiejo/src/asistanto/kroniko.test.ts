// Spec 033 S1: the Kroniko – the record of a brand (Protokoll der Marke, Amendment v2.5). Every
// proposal, change, release, confirmation and notice, with time, source, model and cost; a file
// beside the brand, machine-readable (one JSON object per line, $defs/KronikoEro), built so that
// it can later go on as a table of a database with person and role.

import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createModeloAjv, documentSchemaIssues, SCHEMA_DEFS } from "@fundamento/modelo";
import { afterAll, describe, expect, it } from "vitest";
import { appendKroniko, KRONIKO_FILE, readKroniko } from "./kroniko.js";

const workdir = mkdtempSync(join(tmpdir(), "fm-kroniko-"));
mkdirSync(join(workdir, "lumo"), { recursive: true });
afterAll(() => rmSync(workdir, { recursive: true, force: true }));

describe("the Kroniko of a brand (Spec 033 S1)", () => {
  it("appends one JSON object per line in marken/<name>/kroniko.jsonl and reads them in order", () => {
    appendKroniko(workdir, "lumo", { ago: "kreo", fonto: "sistemo" });
    appendKroniko(workdir, "lumo", {
      ago: "sxangxo",
      fonto: "babilo",
      faceto: "gvidkoloro",
      teksto: "Die Leitfarbe ist wärmer.",
      modelo: "mistral/ministral-14b-2512",
      kosto: { enigo: 1200, eligo: 80, ms: 2100 },
      detaloj: { regler: "leitfarbe.ton", vorher: 250, nachher: 238 },
    });
    const lines = readFileSync(join(workdir, "lumo", KRONIKO_FILE), "utf8")
      .trim()
      .split("\n");
    expect(lines).toHaveLength(2);
    const entries = readKroniko(workdir, "lumo");
    expect(entries.map((entry) => entry.ago)).toEqual(["kreo", "sxangxo"]);
    expect(entries[1]?.tempo).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
  });

  it("every entry is valid against $defs/KronikoEro and leaves room for person and role", () => {
    const ajv = createModeloAjv();
    for (const entry of readKroniko(workdir, "lumo")) {
      expect(
        documentSchemaIssues({ file: KRONIKO_FILE, value: entry }, SCHEMA_DEFS.kronikoEro, ajv),
      ).toEqual([]);
      expect(entry.persono ?? null).toBeNull();
    }
    expect(
      documentSchemaIssues(
        { file: KRONIKO_FILE, value: { ago: "sxangxo", fonto: "babilo", tempo: "x" } },
        SCHEMA_DEFS.kronikoEro,
        ajv,
      ).length,
    ).toBeGreaterThan(0);
  });

  it("never writes a key: the redaction of the provider runs over every text before it is written", () => {
    const key = "sk-geheim-kroniko-42";
    appendKroniko(
      workdir,
      "lumo",
      { ago: "babilo", fonto: "babilo", teksto: `Fehler: Bearer ${key} abgelehnt` },
      (text) => text.split(key).join("‹Schlüssel›"),
    );
    const file = readFileSync(join(workdir, "lumo", KRONIKO_FILE), "utf8");
    expect(file).not.toContain(key);
    expect(file).toContain("‹Schlüssel›");
  });

  it("an export with its duration is an entry of the Kroniko (Spec 033 S6, O-10)", () => {
    const ajv = createModeloAjv();
    const entry = appendKroniko(workdir, "lumo", {
      ago: "eksporto",
      fonto: "sistemo",
      detaloj: {
        pasxo: "eksporto",
        ms: 5200,
        partoj: { paket: 900, projekcioj: 4100, pruefung: 200 },
      },
    });
    expect(
      documentSchemaIssues({ file: KRONIKO_FILE, value: entry }, SCHEMA_DEFS.kronikoEro, ajv),
    ).toEqual([]);
  });

  it("a brand without a record has an empty Kroniko", () => {
    expect(readKroniko(workdir, "nenie")).toEqual([]);
  });
});
