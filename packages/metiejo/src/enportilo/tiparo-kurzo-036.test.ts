// Spec 036 Teil 4, Nachbesserung A-3 (maintainer, 02.11.): Weg C read the shorthand
// `font: normal normal clamp(2rem …)` as a family name. The family of a stylesheet comes only from
// font-family or from the family part of the shorthand – the list after the size and an optional
// line height; a shorthand with nothing after its size names no family.

import { describe, expect, it } from "vitest";
import { legiRetejon, type RetejoFetch } from "./retejo.js";

const SHORTHAND =
  'normal normal clamp(2rem, 4vw + 1rem, 3.5rem)/1.1 "Ruvelo Display", Georgia, serif';
const BARE = "normal normal clamp(2rem, 4vw, 3rem)";

const pageOf =
  (css: string): RetejoFetch =>
  async () =>
    new Response(`<!doctype html><html><head><style>${css}</style></head><body></body></html>`, {
      headers: { "content-type": "text/html" },
    });

async function familiesOf(css: string): Promise<[unknown, string | undefined][]> {
  const trovoj = await legiRetejon("https://ruvelo.example/", pageOf(css));
  return trovoj
    .filter((trovo) => trovo.kind === "tiparo")
    .map((trovo) => [trovo.valoro, trovo.kind === "tiparo" ? trovo.rolo : undefined]);
}

describe("Spec 036 Teil 4: the family of a font shorthand is the list after its size", () => {
  it('font: normal normal clamp(2rem …)/1.1 "Ruvelo Display", … names Ruvelo Display', async () => {
    expect(await familiesOf(`h1 { font: ${SHORTHAND}; }`)).toEqual([["Ruvelo Display", "display"]]);
  });

  it("a custom property for a font holding the shorthand names Ruvelo Display, never its size", async () => {
    expect(await familiesOf(`:root { --font-display: ${SHORTHAND}; }`)).toEqual([
      ["Ruvelo Display", "display"],
    ]);
  });

  it("the bare shorthand font: normal normal clamp(2rem …) names no family", async () => {
    expect(await familiesOf(`h1 { font: ${BARE}; } :root { --font-heading: ${BARE}; }`)).toEqual(
      [],
    );
  });

  it("font-family stays as before", async () => {
    expect(
      await familiesOf(
        "body { font-family: \"Ruvelo Text\", system-ui, sans-serif; } :root { --font-body: 'Ruvelo Text', sans-serif; }",
      ),
    ).toEqual([
      ["Ruvelo Text", "body"],
      ["Ruvelo Text", "body"],
    ]);
  });
});
