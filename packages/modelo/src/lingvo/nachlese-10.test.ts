// Nachlese 10 ① (decision of the maintainer, 2026-10-23): four names change — avizo shows every
// tone, not only info, and „Hinweis“ is the help of every field; „Auswahlfeld“ and „Auswahlliste“
// are easily confused; „Styled select“ names the look, not the function; „Pfadnavigation“ is usual
// in German interfaces. N-6: every purpose the Studio and Figma show in German stands in German;
// a missing one is an error of the check.

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { labelOf } from "./nomoj.js";
import { tradukoIssues } from "./tradukoj.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");

describe("the names of Nachlese 10 ①", () => {
  it.each([
    ["avizo", "de", "Meldung"],
    ["listelektilo", "de", "Listenauswahl"],
    ["listelektilo", "en", "Listbox"],
    ["spuro", "de", "Pfadnavigation"],
  ] as const)("%s is %s „%s“", (ero, lingvo, name) => {
    expect(labelOf(modelo, "ero", ero, lingvo)).toBe(name);
  });
});

describe("the purposes in German (Nachlese 10 N-6)", () => {
  it("every Ero and Sxablono with a Uzo has its purpose in German; a missing one is an error", () => {
    const de = modelo.tradukoj?.de ?? {};
    const uzoj = [
      ...modelo.eroj.flatMap((entry) => (entry.uzo === undefined ? [] : [entry.uzo])),
      ...(modelo.sxablonoj ?? []).flatMap((entry) => (entry.uzo === undefined ? [] : [entry.uzo])),
    ];
    expect(uzoj).toHaveLength(45);
    for (const uzo of uzoj) expect(de[`${uzo.id}/purpose`], uzo.id).toBeTruthy();
    const glitilo = modelo.eroj.find((entry) => entry.ero.name === "glitilo")?.uzo;
    const without = { ...de };
    delete without[`${glitilo?.id}/purpose`];
    const issues = tradukoIssues({ ...modelo, tradukoj: { ...modelo.tradukoj, de: without } });
    expect(issues.map((issue) => [issue.rule, issue.severity])).toEqual([
      ["traduko-missing", "error"],
    ]);
    expect(issues[0]?.path).toContain(`${glitilo?.id}~1purpose`);
  });
});
