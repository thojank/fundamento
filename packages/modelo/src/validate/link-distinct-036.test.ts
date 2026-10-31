// Spec 036, Befund 2.1 (V-1): links of an achromatic brand. When a link differs from the text by
// less than the sojlo in OKLCH lightness (an achromatic brand gives it the colour of the text), a
// second feature is required: the underline of the link in running text resolves to a width above
// 0 in every state. A link without it is rejected with a suggestion – never by a silent turn to a
// colourful link. The threshold is data (reguloj.json); a test ties the statement to it.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Regulo } from "../contracts/modelo.js";
import { fixtureModeloSource } from "../load/source.js";
import { fixtureRoot } from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

const RULE = "link-distinct-from-text";
const FIXTURE = "regulo-link-unbunt-underline";

const reguloj = (
  JSON.parse(readFileSync(new URL("../../data/reguloj.json", import.meta.url), "utf8")) as {
    reguloj: Regulo[];
  }
).reguloj;

describe("link-distinct-from-text (Spec 036, Befund 2.1, V-1)", () => {
  it("is a Regulo of the Modelo with a kialo, its threshold as sojlo, tied to the statement", () => {
    const regulo = reguloj.find((entry) => entry.name === RULE);
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.sojlo).toEqual({ metric: "oklch-l-delta", min: 0.3 });
    expect(regulo?.statement).toContain(`by less than ${regulo?.sojlo?.min} in OKLCH lightness`);
    expect(regulo?.kialo).toContain(`${regulo?.sojlo?.min}`);
    expect(regulo?.kialo.length ?? 0).toBeGreaterThan(80);
    expect(regulo?.appliesTo?.eroj).toEqual(["ligilo"]);
  });

  it("rejects an achromatic brand whose link in running text has no underline (path, rule)", () => {
    const report = validateModelo(fixtureModeloSource(fixtureRoot("invalid", FIXTURE)));
    const issues = report.errors.filter((issue) => issue.rule === RULE);
    expect(issues.map(({ rule, path }) => ({ rule, path }))).toEqual([
      {
        rule: RULE,
        path: "rezolvo(color-scheme=light,contrast=default)/ero.butono.underline.width.placement.inline.rest",
      },
      {
        rule: RULE,
        path: "rezolvo(color-scheme=light,contrast=high)/ero.butono.underline.width.placement.inline.rest",
      },
    ]);
    const [issue] = issues;
    expect(issue?.message).toContain("color.text.default");
    expect(issue?.suggestion).toMatch(/underline/);
    // The way out is the second feature, not a colourful link.
    expect(issue?.suggestion).toMatch(/not .*colourful|no colourful/);
    expect(issue?.regulo?.name).toBe(RULE);
  });

  it("accepts the same achromatic brand with its underline", () => {
    const report = validateModelo(fixtureModeloSource(fixtureRoot("valid", FIXTURE)));
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
  });
});
