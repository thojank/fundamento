// Spec 038 1.4 and 1.8b: nordstelo derives neither instances nor link targets on its own. K3 takes
// the instances of a page from the Gvidanto core `instancojElElementoj` (D-22) and the navigation of
// a flow reads which Ero is a link, and where it holds its target, from `navigationOf` (D-34) – the
// one derivation behind get_ero's `navigation`. The two functions are watched (unchanged answers);
// what they give is AC-8 (ac8.test.ts) and the existing score and navigation tests.

import { readFileSync } from "node:fs";
import * as modeloModule from "@fundamento/modelo";
import { defaultModeloSource, loadModelo, type NordsteloFile } from "@fundamento/modelo";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { faktojPorNavigado } from "./ablauf/poentoj.js";
import { score } from "./score.js";
import { facts, h } from "./test-doubles/facts.js";

// No `await` at module level (modelo test-setup.test.ts): the factory returns the promise.
vi.mock("@fundamento/modelo", (importOriginal) =>
  importOriginal<typeof import("@fundamento/modelo")>().then((original) => ({
    ...original,
    instancojElElementoj: vi.fn(original.instancojElElementoj),
    navigationOf: vi.fn(original.navigationOf),
  })),
);

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo must load");

const katalogo = JSON.parse(
  readFileSync(new URL("../../modelo/data/nordstelo.json", import.meta.url), "utf8"),
) as NordsteloFile;
const tasko = katalogo.taskoj[0];
if (tasko === undefined) throw new Error("the catalogue must hold a task");

describe("one derivation (Spec 038 1.4, 1.8b)", () => {
  beforeEach(() => {
    vi.mocked(modeloModule.instancojElElementoj).mockClear();
    vi.mocked(modeloModule.navigationOf).mockClear();
  });

  it("takes the instances of K3 from instancojElElementoj with the elements and the language of the facts", () => {
    const page = facts(
      [
        h("fm-butono", { emphasis: "high" }, "Speichern"),
        h("fm-ligilo", { to: "liste.html" }, "Liste"),
      ],
      [],
      { lingvo: "de-DE" },
    );
    const result = score({ facts: page, tasko, variant: "F", modelo, pezoj: [] });
    expect(vi.mocked(modeloModule.instancojElElementoj)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(modeloModule.instancojElElementoj)).toHaveBeenCalledWith(
      page.elements,
      modelo,
      { lingvo: "de-DE" },
    );
    expect(result.k.K3).not.toBeNull();
  });

  it("asks nothing of the core in Variante 0 (K3 does not apply)", () => {
    const page = facts([h("button", {}, "Speichern")], []);
    expect(score({ facts: page, tasko, variant: "0", modelo, pezoj: [] }).k.K3).toBeNull();
    expect(vi.mocked(modeloModule.instancojElElementoj)).not.toHaveBeenCalled();
  });

  it("reads the link Eroj of the navigation from navigationOf, once per Ero of the Modelo", () => {
    const page = facts([h("fm-ligilo", { to: "detail.html" }, "Details")], []);
    const result = faktojPorNavigado({ liste: page }, modelo);
    expect(vi.mocked(modeloModule.navigationOf)).toHaveBeenCalledTimes(modelo.eroj.length);
    for (const entry of modelo.eroj) {
      expect(vi.mocked(modeloModule.navigationOf)).toHaveBeenCalledWith(entry);
    }
    expect(result.liste?.elements[0]?.attrs).toEqual({ to: "detail.html", href: "detail.html" });
  });
});
