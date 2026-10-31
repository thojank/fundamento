// The catalogue „ganzer Ablauf“ (Spec 037, Lieferliste 2.1, D-23): five flows of 3–5 screens,
// every plan valid for ekranoj, every screen with criteria, slugs unique, and nothing of it in the
// Modelo. The counts 5 and 3–5 are fixed by the source spec; everything else is derived.

import { readFileSync } from "node:fs";
import { MAKS_EKRANOJ, type Problemo, validiPlanon } from "@fundamento/ekranoj";
import {
  checkNordstelo,
  defaultModeloSource,
  loadModelo,
  type NordsteloFile,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import {
  ABLAUF_EKRANOJ_MIN,
  ABLAUF_TASKOJ,
  ABLAUF_TASKOJ_NOMBRO,
  type AblaufTasko,
  kriteriojDe,
  planoDe,
  taskoDe,
  trovuTaskon,
  validiKatalogon,
} from "./katalogo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo must load");
const modeloKatalogo = JSON.parse(
  readFileSync(new URL("../../../modelo/data/nordstelo.json", import.meta.url), "utf8"),
) as NordsteloFile;

/** A deep copy to break one rule at a time. */
const copy = (): AblaufTasko[] => structuredClone([...ABLAUF_TASKOJ]) as AblaufTasko[];
const rules = (problemoj: Problemo[]) => problemoj.map((p) => `${p.rule} ${p.path}`);

describe("the catalogue „ganzer Ablauf“", () => {
  it("has the five flows of the source spec, in its order, with 3 to 5 screens each", () => {
    expect(ABLAUF_TASKOJ_NOMBRO).toBe(5);
    expect(ABLAUF_EKRANOJ_MIN).toBe(3);
    expect(MAKS_EKRANOJ).toBe(5);
    expect(ABLAUF_TASKOJ.map((tasko) => tasko.titolo.de)).toEqual([
      "Anmelden und Konto",
      "Liste mit Filter und Detail",
      "Formular in Schritten",
      "Einstellungen",
      "Übersicht mit Kennzahlen",
    ]);
    const outside = ABLAUF_TASKOJ.filter(
      (tasko) => tasko.ekranoj.length < 3 || tasko.ekranoj.length > 5,
    ).map((tasko) => `${tasko.slug}: ${tasko.ekranoj.length}`);
    expect(outside).toEqual([]);
  });

  it("is valid as a whole: validiKatalogon finds nothing", () => {
    expect(validiKatalogon()).toEqual([]);
  });

  it("gives ekranoj a valid plan for every flow (validiPlanon)", () => {
    const problems = ABLAUF_TASKOJ.flatMap((tasko) =>
      validiPlanon(planoDe(tasko)).map((p) => `${tasko.slug}: ${p.rule} ${p.path}`),
    );
    expect(problems).toEqual([]);
    const english = ABLAUF_TASKOJ.flatMap((tasko) =>
      validiPlanon(planoDe(tasko, "en")).map((p) => `${tasko.slug}: ${p.rule} ${p.path}`),
    );
    expect(english).toEqual([]);
  });

  it("plans edges only between the screens of the same flow, each screen linked", () => {
    const violations: string[] = [];
    for (const tasko of ABLAUF_TASKOJ) {
      const own = new Set(tasko.ekranoj.map((ekrano) => ekrano.slug));
      for (const kanto of tasko.kantoj) {
        if (!own.has(kanto.de) || !own.has(kanto.al) || kanto.de === kanto.al)
          violations.push(`${tasko.slug}: ${kanto.de} → ${kanto.al}`);
      }
      for (const slug of own) {
        if (!tasko.kantoj.some((kanto) => kanto.de === slug))
          violations.push(`${tasko.slug}: ${slug} links nowhere`);
        if (!tasko.kantoj.some((kanto) => kanto.al === slug))
          violations.push(`${tasko.slug}: nothing links to ${slug}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("gives every screen at least one criterion, and one that decides Variante 0", () => {
    const violations = ABLAUF_TASKOJ.flatMap((tasko) =>
      tasko.ekranoj.flatMap((ekrano) => {
        if (ekrano.kriterioj.length === 0) return [`${ekrano.slug}: none`];
        const decides0 = ekrano.kriterioj.some(
          (k) => k.kontrolo.kind !== "elemento" || k.kontrolo["0"] !== undefined,
        );
        return decides0 ? [] : [`${ekrano.slug}: none for Variante 0`];
      }),
    );
    expect(violations).toEqual([]);
  });

  it("uses slugs that are unique over the whole catalogue", () => {
    const slugs = ABLAUF_TASKOJ.flatMap((tasko) => [
      tasko.slug,
      ...tasko.ekranoj.map((ekrano) => ekrano.slug),
    ]);
    expect(slugs.filter((slug, index) => slugs.indexOf(slug) !== index)).toEqual([]);
    for (const tasko of ABLAUF_TASKOJ) expect(trovuTaskon(tasko.slug)).toBe(tasko);
    expect(trovuTaskon("gibt-es-nicht")).toBeUndefined();
  });

  it("names only Sxablonoj, Eroj and Reguloj the Modelo has (checkNordstelo on the in-memory Taskoj)", () => {
    const taskoj = ABLAUF_TASKOJ.flatMap((tasko) =>
      tasko.ekranoj.map((ekrano) => taskoDe(tasko, ekrano)),
    );
    expect(checkNordstelo(modelo, { ...modeloKatalogo, taskoj })).toEqual([]);
  });

  it("turns a screen into a Tasko in memory only: stable slug ids, never in the Modelo (D-23)", () => {
    const tasko = ABLAUF_TASKOJ[1];
    const ekrano = tasko?.ekranoj[0];
    if (tasko === undefined || ekrano === undefined) throw new Error("catalogue empty");
    const converted = taskoDe(tasko, ekrano);
    expect(converted.id).toBe(`${tasko.slug}/${ekrano.slug}`);
    expect(converted.kriterioj.map((k) => k.id)).toEqual(
      ekrano.kriterioj.map((_, index) => `${tasko.slug}/${ekrano.slug}/${index + 1}`),
    );
    expect(kriteriojDe(tasko)[ekrano.slug]).toEqual(converted.kriterioj);
    // No ULID anywhere, and the Modelo catalogue knows none of the flows.
    const all = JSON.stringify(ABLAUF_TASKOJ);
    expect(all).not.toMatch(/\b(tsk|kri)_[0-9A-Z]{26}\b/);
    const modeloNames = new Set(modeloKatalogo.taskoj.map((entry) => entry.name));
    const inModelo = ABLAUF_TASKOJ.flatMap((t) => [t.slug, ...t.ekranoj.map((e) => e.slug)]).filter(
      (slug) => modeloNames.has(slug),
    );
    expect(inModelo).toEqual([]);
  });

  it("can fail: every rule of validiKatalogon fires on a broken catalogue, with its path", () => {
    const fewer = copy().slice(0, 4);
    expect(rules(validiKatalogon(fewer))).toContain("ablauf-task-count /taskoj");

    const short = copy();
    short[0]?.ekranoj.splice(2);
    expect(rules(validiKatalogon(short))).toContain("ablauf-screen-count /taskoj/0/ekranoj");

    const foreign = copy();
    const otherSlug = foreign[1]?.ekranoj[0]?.slug ?? "";
    foreign[0]?.kantoj.push({ de: foreign[0]?.ekranoj[0]?.slug ?? "", al: otherSlug });
    const foreignIndex = (foreign[0]?.kantoj.length ?? 0) - 1;
    expect(rules(validiKatalogon(foreign))).toContain(
      `edge-unknown-screen /taskoj/0/kantoj/${foreignIndex}/al`,
    );

    const empty = copy();
    const firstScreen = empty[2]?.ekranoj[1];
    if (firstScreen) firstScreen.kriterioj = [];
    expect(rules(validiKatalogon(empty))).toContain(
      "ablauf-criterion-missing /taskoj/2/ekranoj/1/kriterioj",
    );

    const onlyF = copy();
    const screen = onlyF[3]?.ekranoj[0];
    if (screen)
      screen.kriterioj = [
        {
          ...(screen.kriterioj[0] ?? {}),
          kontrolo: { kind: "elemento", F: "fm-butono" },
        } as (typeof screen.kriterioj)[number],
      ];
    expect(rules(validiKatalogon(onlyF))).toContain(
      "ablauf-criterion-variant-0 /taskoj/3/ekranoj/0/kriterioj",
    );

    const twice = copy();
    const dup = twice[4]?.ekranoj[2];
    if (dup) dup.slug = twice[0]?.ekranoj[0]?.slug ?? "";
    expect(rules(validiKatalogon(twice))).toContain(
      "ablauf-slug-duplicate /taskoj/4/ekranoj/2/slug",
    );
  });
});
