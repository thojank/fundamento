// Spec 036 Teil 5 ②b-5 (Spec 029 ①-2, O-2): colours for the kinds of words in a code block. Five
// roles color.syntax.* – keyword, name, string, number, comment – alias steps of the brand's own
// palettes (clean room: no value of another system), each a foreground with a declared KontrastParo
// on the code block's ground (background.sunken) and on a highlighted line (background.default).
// Every Aspekto assigns them; the binding WCAG check measures every pair in every brand.

import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { check } from "../checks/alirebleco/index.js";
import { aliasTarget, CORE_SET_NAME } from "../contracts/grammar.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const KINDS = ["keyword", "name", "string", "number", "comment"] as const;
const GROUNDS = ["background-sunken", "background-default"] as const;

const { modelo } = loadModelo(defaultModeloSource());
const core = modelo?.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};

describe("syntax colours (①-2)", () => {
  it.each(KINDS)("color.syntax.%s is a foreground role on a palette step", (kind) => {
    const token = core[`color.syntax.${kind}`];
    expect(token?.id).toMatch(/^tok_/);
    expect(token?.role).toBe("foreground");
    expect(aliasTarget(token?.value)).toMatch(/^color\.palette\.[a-z]+\.\d+$/);
  });

  it("the kinds differ from each other and from the code's text in komuna", () => {
    const targets = KINDS.map((kind) => aliasTarget(core[`color.syntax.${kind}`]?.value));
    expect(new Set(targets).size).toBe(KINDS.length);
    expect(targets).not.toContain(aliasTarget(core["color.text.default"]?.value));
  });

  it("every kind has a text pair on the code block's ground and on a highlighted line", () => {
    const pairs = modelo?.kontrastParoj ?? [];
    for (const kind of KINDS) {
      for (const ground of GROUNDS) {
        const pair = pairs.find((entry) => entry.name === `syntax-${kind}-on-${ground}`);
        expect(pair, `syntax-${kind}-on-${ground}`).toMatchObject({
          foreground: `color.syntax.${kind}`,
          background: `color.${ground.replace("-", ".")}`,
          kategorio: "text-normal",
        });
      }
    }
  });

  it("every pair meets WCAG in every combination of every brand", async () => {
    const result = await check({ json: true, repoRoot });
    const failing = [...result.errors, ...result.warnings].filter(
      (issue) =>
        /syntax-/.test(issue.message) &&
        (issue.rule === "contrast-external-aspekto" || issue.severity === "error"),
    );
    expect(failing.map((issue) => issue.message)).toEqual([]);
    expect(result.stats.aspektoj).toBe(5);
  });
});
