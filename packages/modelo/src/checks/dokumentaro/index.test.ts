// Spec 036 Teil 5 ③ (Spec 029 ③): check:dokumentaro. Every Ero page of the Vitrino shows nine
// sections; three of them – when not, do and don't, the keyboard – are written in the Uzo. The
// check reports a field that is missing or still holds the placeholder as an error, so the
// documentation is done when the check is green, not when someone says so.

import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { DOKU_KAMPOJ, isDokuOffen } from "../../eroj/dokumentaro.js";
import { check } from "./index.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const fixture = (path: string): string =>
  fileURLToPath(new URL(`../../../test/fixtures/${path}/`, import.meta.url));
const erojDir = fileURLToPath(new URL("../../../data/eroj/", import.meta.url));

interface ExpectedIssues {
  check: string;
  issues: { rule: string; path: string }[];
}

const readExpected = (path: string): ExpectedIssues =>
  JSON.parse(readFileSync(join(fixture(path), "expected-issues.json"), "utf8")) as ExpectedIssues;

const rulesAndPaths = (issues: readonly { rule: string; path: string }[]) =>
  issues.map(({ rule, path }) => ({ rule, path }));

const tempDirs: string[] = [];
afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A copy of valid/dokumentaro-plena with the Uzo of butono changed. */
function plenaWith(change: (uzo: Record<string, unknown>) => void): string {
  const root = mkdtempSync(join(tmpdir(), "fm-dokumentaro-"));
  tempDirs.push(root);
  cpSync(fixture("valid/dokumentaro-plena"), root, { recursive: true });
  const file = join(root, "data/eroj/butono/uzo.json");
  const value = JSON.parse(readFileSync(file, "utf8")) as { uzo: Record<string, unknown> };
  change(value.uzo);
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
  return root;
}

const UZO = "data/eroj/butono/uzo.json";

describe("check:dokumentaro (Spec 036 ③)", () => {
  it("passes valid/dokumentaro-plena: every Uzo has when-not, do-dont and keyboard written", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: fixture("valid/dokumentaro-plena"),
    });
    expect(result.check).toBe("dokumentaro");
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.stats).toMatchObject({ eroj: 2, kompletaj: 2, mankantaj: 0, offenaj: 0 });
  });

  it.each(["invalid/dokumentaro-mankas", "invalid/dokumentaro-offen"])(
    "fails %s with the expected rules and paths",
    async (path) => {
      const expected = readExpected(path);
      expect(expected.check).toBe("dokumentaro");
      const result = await check({ json: true, repoRoot, fixture: fixture(path) });
      expect(result.ok).toBe(false);
      expect(rulesAndPaths(result.errors)).toEqual(expected.issues);
      for (const issue of result.errors) {
        expect(issue.severity).toBe("error");
        expect(issue.message.length).toBeGreaterThan(0);
        expect(issue.suggestion?.length ?? 0).toBeGreaterThan(0);
      }
    },
  );

  it("counts the fields per Ero: three missing in butono, nothing in ligilo", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: fixture("invalid/dokumentaro-mankas"),
    });
    expect(result.stats).toMatchObject({
      eroj: 2,
      kompletaj: 1,
      mankantaj: 3,
      offenaj: 0,
      "mankoj:butono": 3,
      "mankoj:ligilo": 0,
    });
  });

  it("dokumentaro-when-not-self: when-not sends to the Ero itself", async () => {
    const root = plenaWith((uzo) => {
      uzo["when-not"] = [
        { case: { de: "Ein zweiter Knopf.", en: "A second button." }, ero: "butono" },
      ];
    });
    const result = await check({ json: true, repoRoot, fixture: root });
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "dokumentaro-when-not-self", path: `${UZO}#/uzo/when-not/0/ero` },
    ]);
  });

  it("dokumentaro-keyboard-key-missing: keyboard says none while the Skemo names keys", async () => {
    const root = plenaWith((uzo) => {
      uzo.keyboard = { none: { de: "Nicht fokussierbar.", en: "Not focusable." } };
    });
    const result = await check({ json: true, repoRoot, fixture: root });
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "dokumentaro-keyboard-key-missing", path: `${UZO}#/uzo/keyboard` },
    ]);
  });

  it("dokumentaro-placeholder: do-dont and keyboard may hold the marker too", async () => {
    const offen = { offen: { de: "Offen.", en: "Open." } };
    const root = plenaWith((uzo) => {
      uzo["do-dont"] = offen;
      uzo.keyboard = offen;
    });
    const result = await check({ json: true, repoRoot, fixture: root });
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "dokumentaro-placeholder", path: `${UZO}#/uzo/do-dont` },
      { rule: "dokumentaro-placeholder", path: `${UZO}#/uzo/keyboard` },
    ]);
    expect(result.stats).toMatchObject({ offenaj: 2, "mankoj:butono": 2 });
  });

  // The repo: what the check reports is what the data holds – one error per field that is
  // missing or still the placeholder, per Ero; counted from the files, not written down.
  it("reports on the repo exactly the fields the Uzo files still lack, per Ero", async () => {
    const result = await check({ json: true, repoRoot });
    const expected: Record<string, number> = {};
    let total = 0;
    for (const ero of readdirSync(erojDir).sort()) {
      const uzo = (
        JSON.parse(readFileSync(join(erojDir, ero, "uzo.json"), "utf8")) as {
          uzo: Record<string, unknown>;
        }
      ).uzo;
      const lacking = DOKU_KAMPOJ.filter(
        (field) => uzo[field] === undefined || isDokuOffen(uzo[field]),
      ).length;
      expected[`mankoj:${ero}`] = lacking;
      total += lacking;
    }
    const perEro = Object.fromEntries(
      Object.entries(result.stats).filter(([key]) => key.startsWith("mankoj:")),
    );
    expect(perEro).toEqual(expected);
    expect(
      result.errors.filter(
        ({ rule }) => rule === "dokumentaro-field-missing" || rule === "dokumentaro-placeholder",
      ),
    ).toHaveLength(total);
    expect(result.ok).toBe(result.errors.length === 0);
  });
});
