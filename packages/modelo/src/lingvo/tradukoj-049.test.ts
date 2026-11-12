// Spec 049 (F-KIA2-1, decision of the maintainer 2026-11-11): the Reguloj of an Aspekto package are
// its own texts and need no entry in data/tradukoj.json — also those of komuna, the reference
// Aspekto, whose IDs carry no namespace (core format `reg_01…`). A package Regulo is known by its
// `aspekto` field (no core Regulo carries one), not only by the namespace of its ID.

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { tekstojOf, tradukoIssues } from "./tradukoj.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const core = modelo.reguloj.find((regulo) => regulo.aspekto === undefined);
if (core === undefined) throw new Error("the repo Modelo has a core Regulo");

/** A package Regulo of komuna with a core-format ID, as `pnpm id:new` mints it for komuna. */
const komuna = {
  ...core,
  id: "reg_01ZZZZZZZZZZZZZZZZZZZZZZZZ",
  name: "komuna-provo-049",
  statement: "komuna führt eine Wahl.",
  kialo: "Ein Grund in der Sprache des Pakets.",
  aspekto: "komuna",
};
/** A package Regulo with a namespaced ID, as an external Aspekto mints it. */
const ekzemplo = { ...komuna, id: "reg_ekz_01ZZZZZZZZZZZZZZZZZZZZZZZZ", aspekto: "ekzemplo" };
const probe = { ...modelo, eroj: [], sxablonoj: [], reguloj: [core, komuna, ekzemplo] };

describe("the texts of the Reguloj that need a translation (Spec 049, F-KIA2-1)", () => {
  it("names the core Regulo and neither package Regulo, with or without a namespace", () => {
    expect(tekstojOf(probe).map((teksto) => teksto.key)).toEqual([
      `${core.id}/statement`,
      `${core.id}/kialo`,
    ]);
  });

  it("reports no missing translation for a package Regulo with a core-format ID", () => {
    const missing = tradukoIssues(probe).filter((issue) => issue.rule === "traduko-missing");
    expect(missing.map((issue) => issue.path)).toEqual([]);
  });
});
