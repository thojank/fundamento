// Uzo rules beyond the schema (Spec 007 T012, data-model §2.2). The nine error fixtures of A11 run
// in validate-modelo.test.ts; these are the rules without a fixture of their own, each on a copy of
// valid/ero-uzo-minimal with one change.

import { rmSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { fixtureModeloSource } from "../load/source.js";
import { mutatedFixture } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";

const UZO = "data/eroj/butono/uzo.json";
type UzoJson = { uzo: Record<string, unknown> & { boundary: Record<string, unknown>[] } };

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

/** The (rule, path) pairs of a copy of valid/ero-uzo-minimal with its Uzo changed. */
function issuesWith(change: (file: UzoJson) => void): { rule: string; path: string }[] {
  const root = mutatedFixture("ero-uzo-minimal", (edit) => edit(UZO, change));
  roots.push(root);
  const report = validateModelo(fixtureModeloSource(root));
  return [...report.errors, ...report.warnings].map(({ rule, path }) => ({ rule, path }));
}

const BOUNDARY = { case: "navigation", action: "ask-human", kialo: "A person decides." };

describe("Uzo rules without a fixture of their own (T012)", () => {
  it("uzo-goal-twice: a goal stands in instead and as a boundary case (Art. I)", () => {
    const issues = issuesWith((file) => {
      file.uzo.instead = [
        { goal: "navigation", keywords: { en: ["navigate"] }, ero: null, kialo: "Not covered." },
      ];
    });
    expect(issues).toContainEqual({ rule: "uzo-goal-twice", path: `${UZO}#/uzo/instead/0/goal` });
  });

  it("uzo-regulo-unknown: a text rule names a Regulo that does not apply to the Ero", () => {
    const issues = issuesWith((file) => {
      file.uzo.content = [
        {
          regulo: "semantic-colors-alias-palette",
          fixed: false,
          check: { kind: "not-words", words: { en: ["ok"] } },
        },
      ];
    });
    expect(issues).toContainEqual({
      rule: "uzo-regulo-unknown",
      path: `${UZO}#/uzo/content/0/regulo`,
    });
    // An unknown Regulo has no examples to look for.
    expect(issues.map(({ rule }) => rule)).not.toContain("uzo-content-example-missing");
  });

  it("uzo-regulo-unknown: composes.spacing names a Regulo that does not exist", () => {
    const issues = issuesWith((file) => {
      (file.uzo.composes as { spacing: { regulo: string } }).spacing.regulo = "gibts-nicht";
    });
    expect(issues).toEqual([
      { rule: "uzo-regulo-unknown", path: `${UZO}#/uzo/composes/spacing/regulo` },
    ]);
  });

  it("uzo-prop-unknown: a layout key that is no boolean prop of the Skemo", () => {
    const issues = issuesWith((file) => {
      (file.uzo.layout as Record<string, unknown>).dense = {
        allowedIn: { containers: ["action-bar"] },
        regulo: "spacing-owned-by-container",
      };
    });
    expect(issues).toEqual([{ rule: "uzo-prop-unknown", path: `${UZO}#/uzo/layout/dense` }]);
  });

  it("uzo-use-instead-ero-missing: use-instead without the Ero to use", () => {
    const issues = issuesWith((file) => {
      file.uzo.boundary = [{ ...BOUNDARY, action: "use-instead" }];
    });
    expect(issues).toContainEqual({
      rule: "uzo-use-instead-ero-missing",
      path: `${UZO}#/uzo/boundary/0`,
    });
  });

  it("uzo-ero-unknown: a slot accepts an Ero that does not exist", () => {
    const issues = issuesWith((file) => {
      file.uzo.slots = { label: { accepts: ["text", "insigno"] } };
    });
    expect(issues).toEqual([
      { rule: "uzo-ero-unknown", path: `${UZO}#/uzo/slots/label/accepts/1` },
    ]);
  });

  it("uzo-kialo-missing: a container without its reason", () => {
    const issues = issuesWith((file) => {
      (file.uzo.composes as { containers: unknown[] }).containers = [{ name: "dialog" }];
    });
    expect(issues).toContainEqual({
      rule: "uzo-kialo-missing",
      path: `${UZO}#/uzo/composes/containers/0`,
    });
  });

  it("uzo-skemo-missing: the Uzo names a Skemo other than the one next to it", () => {
    const issues = issuesWith((file) => {
      file.uzo.skemo = "ske_01M4H2T373YV05DRJP6V7RB5PN";
    });
    expect(issues).toEqual([{ rule: "uzo-skemo-missing", path: `${UZO}#/uzo/skemo` }]);
  });

  // data-model §9: until F1-T00 the goals of a text rule are checked against Skemo.intents.
  it("intent-unknown: a text rule applies to a goal the Skemo does not know", () => {
    const issues = issuesWith((file) => {
      file.uzo.content = [
        {
          regulo: "spacing-owned-by-container",
          fixed: true,
          when: { goal: ["destructive"] },
          check: { kind: "verb-and-object", goal: "destructive" },
        },
      ];
    });
    expect(issues).toContainEqual({
      rule: "intent-unknown",
      path: `${UZO}#/uzo/content/0/when/goal/0`,
    });
    expect(issues).toContainEqual({
      rule: "intent-unknown",
      path: `${UZO}#/uzo/content/0/check/goal`,
    });
  });
});
