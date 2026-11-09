// Spec 046 T2, B-5 (guard): data-span on a child of the grid is no invented attribute. check_markup
// has no rule for invented attributes (it drops what is no prop, check-markup.ts), and data-span
// stands on the child, not on fm-krado – so the data-span part is green from the start and guards
// that it stays so; what turns green with T2 is fm-krado itself, with columns as its prop.

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { checkMarkup } from "./check-markup.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");

const GRID =
  '<fm-krado columns="3"><div data-span="2">Eins</div><div>Zwei</div><div data-span="9">Drei</div></fm-krado>';

/** What check_markup says, as JSON: no finding may name data-span. */
function answer(fragment: string) {
  const result = checkMarkup(modelo as NonNullable<typeof modelo>, { fragment });
  if (!result.ok) throw new Error(JSON.stringify(result.issues));
  return result.output;
}

describe("check_markup on the grid (Spec 046 T2, B-5)", () => {
  it("guard (green from the start): data-span on a child of a layout Ero is never a finding", () => {
    const output = answer('<fm-vico gap="small"><div data-span="2">Eins</div></fm-vico>');
    expect(JSON.stringify(output.rezulto)).not.toContain("data-span");
    expect(output.rezulto.valid).toBe(true);
  });

  it("reads fm-krado columns=3 as an instance of krado; data-span is no finding", () => {
    const output = answer(GRID);
    expect(output.eroj.map((instance) => [instance.ero, instance.props])).toEqual([
      ["krado", { columns: "3" }],
    ]);
    expect(JSON.stringify(output.rezulto)).not.toContain("data-span");
    expect(output.rezulto.valid).toBe(true);
  });

  // check_markup drops a value the Skemo does not allow, as for every Ero (butono emphasis="huge"
  // alike): the default stands, the Web Component warns, nordstelo K2 names it (invented-value).
  // That it names no finding here is the repo's behaviour, not T2's (plan F-T2-2).
  it("drops a column count outside 1 to 12 or auto, so the default stands", () => {
    const output = answer('<fm-krado columns="13"><div>Eins</div></fm-krado>');
    expect(output.eroj.map((instance) => [instance.ero, instance.props])).toEqual([["krado", {}]]);
  });
});
