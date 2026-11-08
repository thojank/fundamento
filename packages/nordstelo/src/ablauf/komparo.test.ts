// The comparison 4.3 (Spec 038 C-4, AC-6): small stored run folders in the old shape (the
// reference: no K8, no `penoj`) and in the new shape (both), written here, compared per flow ×
// variant – the missing side, the markers without Δ, the spread „≈“, the derived token mean, the
// folder lookup, determinism and the much older shape of the 037 measurement point as extra line.

import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  type KomparoDatumoj,
  type KomparoParo,
  komparo,
  komparoMd,
  NevalidaKomparo,
  trovuLaufon,
} from "./komparo.js";
import {
  RESTANTAJ_SUPRAJ,
  type RestantajEnKuro,
  restantajSuprajDe,
  STREUUNG_REIHE_K,
  stabilaJson,
} from "./raporto.js";
import {
  EKRANA_PENO,
  K,
  LFD,
  RUN_PENO,
  restantajSumo,
  skribiLaufon,
  UK,
} from "./test-doubles/laufoj.js";

const tmp = (prefix: string) => mkdtempSync(join(tmpdir(), prefix));

/** Old shape before (no K8, no penoj), new shape after; Δ total 16,7 for F and 16,8 for 0. */
function bazo() {
  const radiko = tmp("s038-komparo-");
  const antaux = skribiLaufon(join(radiko, "vorher"), "20261107-0900", {
    commit: "e4873c57",
    kuroj: [
      { tasko: LFD, varianto: "F", total: 70, r1: 50 },
      { tasko: LFD, varianto: "0", total: 40 },
    ],
  });
  const post = skribiLaufon(join(radiko, "nachher"), "20261107-1000", {
    commit: "c0de4d00",
    projekcioj: true,
    kuroj: [
      { tasko: LFD, varianto: "F", total: 86.7, r1: 60, k8: 0.9, penoj: true, verda: true },
      { tasko: LFD, varianto: "0", total: 56.8, k8: 0.8, penoj: true },
      { tasko: UK, varianto: "F", total: 90, k8: 0.7, penoj: true },
    ],
  });
  return { radiko, antaux, post };
}

const paro = (datumoj: KomparoDatumoj, tasko: string, varianto: "F" | "0"): KomparoParo => {
  const own = datumoj.paroj.find((p) => p.tasko === tasko && p.varianto === varianto);
  if (own === undefined) throw new Error(`no pair ${tasko} ${varianto}`);
  return own;
};

describe("the comparison 4.3 (komparo, C-4)", () => {
  it("puts the old shape (no K8, no penoj) and the new shape side by side per flow × variant", () => {
    const { antaux, post } = bazo();
    const datumoj = komparo([{ dir: antaux }], [{ dir: post }]);
    expect(datumoj.paroj.map((p) => `${p.tasko} ${p.varianto}`)).toEqual([
      `${LFD} F`,
      `${LFD} 0`,
      `${UK} F`,
    ]);
    const lfdF = paro(datumoj, LFD, "F");
    expect(lfdF.antaux).toMatchObject({
      lauf: "20261107-0900",
      commit: "e4873c57",
      total: 70,
      k8: null,
      k: K(0.9),
      lastaRondo: "3",
      r1r3: { R1: 50, R3: 70, delto: 20 },
      markoj: [],
      // D-199: 60 000 tokens in ÷ 2 screens × 3 rounds.
      tokenoj: {
        mezo: { enigo: 10_000, eligo: 100 },
        abgeleitet: true,
        konstruitajEkranRondoj: 6,
        jeEkrano: null,
        penoPlano: null,
      },
      sxargoj: [{ antaux: { l1: 1 }, post: { l1: 2 }, kernoj: 10 }],
      lastoSuperKernoj: false,
    });
    expect(lfdF.post).toMatchObject({
      total: 86.7,
      k8: 0.9,
      r1r3: { R1: 60, R3: 86.7, delto: 26.7 },
      verdaj: { komuna: 1 },
      ekranoj: 2,
      k8JeMarko: { komuna: 0.9, ekzemplo: 0.5 },
      k7: RUN_PENO,
      tokenoj: {
        mezo: { enigo: 9_000, eligo: 90 },
        abgeleitet: false,
        penoPlano: { inputTokens: 6_000, outputTokens: 60, requests: 0, toolCalls: 3 },
      },
    });
    expect(lfdF.post?.tokenoj.jeEkrano?.a).toEqual({
      sumo: { inputTokens: 27_000, outputTokens: 270, requests: 3, toolCalls: 3 },
      jeRondo: { "1": EKRANA_PENO, "2": EKRANA_PENO, "3": EKRANA_PENO },
    });
    expect(lfdF.delto).toMatchObject({
      total: 16.7,
      enStreuung: true,
      k8: null,
      tokenojEnigo: -1_000,
      tokenojAbgeleitet: true,
    });
    expect(lfdF.senDelto).toBeNull();
    // 16,8 is outside the spread: the number, no „≈“.
    expect(paro(datumoj, LFD, "0").delto).toMatchObject({ total: 16.8, enStreuung: false });
    expect(datumoj.laufoj.antaux[0]).toMatchObject({ kunK8: false, kunPenoj: false });
    expect(datumoj.laufoj.post[0]).toMatchObject({ kunK8: true, kunPenoj: true });
    expect(datumoj.streuung.reiheK).toBe(STREUUNG_REIHE_K);

    // F against 0 per side, last round.
    expect(datumoj.f0.find((r) => r.tasko === LFD)).toMatchObject({
      antaux: { F: 70, "0": 40, delto: 30, enStreuung: false },
      post: { F: 86.7, "0": 56.8, delto: 29.9, enStreuung: false },
    });

    const md = komparoMd(datumoj);
    expect(md).toContain("+16,7 ≈");
    expect(md).toMatch(/\+16,8(?! ≈)/);
    expect(md).toContain("nicht vorhanden");
    expect(md).toContain("abgeleitet");
  });

  it("shows „—“ with the reason where a flow is only on one side", () => {
    const { antaux, post } = bazo();
    const datumoj = komparo([{ dir: antaux }], [{ dir: post }]);
    const uk = paro(datumoj, UK, "F");
    expect(uk.antaux).toBeNull();
    expect(uk.antauxKialo).toContain(UK);
    expect(uk.delto).toBeNull();
    expect(uk.senDelto).not.toBeNull();
    expect(komparoMd(datumoj)).toContain("—");
  });

  it("gives no Δ for a disturbed folder, a load above the cores, a run not started or a partial one", () => {
    const radiko = tmp("s038-komparo-markoj-");
    const antaux = skribiLaufon(radiko, "vorher", {
      commit: "e4873c57",
      kuroj: [
        { tasko: LFD, varianto: "F", total: 70 },
        { tasko: LFD, varianto: "0", total: 40 },
        { tasko: UK, varianto: "F", nekomencita: true },
        { tasko: UK, varianto: "0", total: 40, haltigo: "max-tokens" },
      ],
    });
    const post = skribiLaufon(radiko, "nachher", {
      commit: "c0de4d00",
      kuroj: [
        { tasko: LFD, varianto: "F", total: 80, k8: 0.9, penoj: true },
        { tasko: LFD, varianto: "0", total: 50, k8: 0.9, penoj: true, l1: 12 },
        { tasko: UK, varianto: "F", total: 90, k8: 0.9, penoj: true },
        { tasko: UK, varianto: "0", total: 50, k8: 0.9, penoj: true },
      ],
    });

    const gestoert = komparo([{ dir: antaux, gestoerta: true }], [{ dir: post }]);
    const lfdF = paro(gestoert, LFD, "F");
    expect(lfdF.antaux?.markoj).toContain("gestoert");
    expect(lfdF.delto).toBeNull();
    expect(lfdF.senDelto).toContain("gestört");
    expect(gestoert.laufoj.antaux[0]?.gestoerta).toBe(true);
    expect(komparoMd(gestoert)).toContain("gestört");

    const datumoj = komparo([{ dir: antaux }], [{ dir: post }]);
    expect(paro(datumoj, LFD, "F").delto).toMatchObject({ total: 10 });
    const lasto = paro(datumoj, LFD, "0");
    expect(lasto.post?.markoj).toEqual(["lasto-super-kernoj"]);
    expect(lasto.post?.lastoSuperKernoj).toBe(true);
    expect(lasto.delto).toBeNull();
    expect(lasto.senDelto).toContain("Last > Kerne");
    const nekomencita = paro(datumoj, UK, "F");
    expect(nekomencita.antaux?.markoj).toContain("nekomencita");
    expect(nekomencita.antaux?.nekomencitaj).toEqual([1]);
    expect(nekomencita.antaux?.total).toBeNull();
    expect(nekomencita.delto).toBeNull();
    const teilweise = paro(datumoj, UK, "0");
    expect(teilweise.antaux?.markoj).toContain("teilweise");
    expect(teilweise.delto).toBeNull();
    // The folder lists its runs that did not start.
    expect(datumoj.laufoj.antaux[0]?.nekomencitaj).toEqual([
      { tasko: UK, varianto: "F", ripeto: 1 },
    ]);
    const md = komparoMd(datumoj);
    expect(md).toContain("Last > Kerne");
    expect(md).toContain("teilweise");
    expect(md).toContain("nicht gestartet");
  });

  it("merges several folders of one side per flow × variant and refuses the same pair twice", () => {
    const radiko = tmp("s038-komparo-paroj-");
    const vorher0 = skribiLaufon(join(radiko, "vorher-0"), "20261107-0900", {
      commit: "e4873c57",
      kuroj: [{ tasko: LFD, varianto: "0", total: 40 }],
    });
    const vorherF = skribiLaufon(join(radiko, "vorher-F"), "20261107-0930", {
      commit: "e4873c57",
      kuroj: [{ tasko: LFD, varianto: "F", total: 70 }],
    });
    const post = skribiLaufon(join(radiko, "nachher"), "20261107-1000", {
      commit: "c0de4d00",
      kuroj: [
        { tasko: LFD, varianto: "F", total: 80, penoj: true },
        { tasko: LFD, varianto: "0", total: 50, penoj: true },
      ],
    });
    const datumoj = komparo([{ dir: vorher0 }, { dir: vorherF }], [{ dir: post }]);
    expect(paro(datumoj, LFD, "F").antaux?.lauf).toBe("20261107-0930");
    expect(paro(datumoj, LFD, "0").antaux?.lauf).toBe("20261107-0900");

    const duobla = skribiLaufon(join(radiko, "vorher-0-noch"), "20261107-0915", {
      commit: "e4873c57",
      kuroj: [{ tasko: LFD, varianto: "0", total: 41 }],
    });
    let eraro: unknown;
    try {
      komparo([{ dir: vorher0 }, { dir: duobla }], [{ dir: post }]);
    } catch (error) {
      eraro = error;
    }
    expect(eraro).toBeInstanceOf(NevalidaKomparo);
    const [problemo] = (eraro as NevalidaKomparo).problemoj;
    expect(problemo).toMatchObject({ path: "/antaux/1", rule: "komparo-paro-duobla" });
    expect(problemo?.message).toContain(`${LFD} 0`);
    expect(problemo?.suggestion).not.toBe("");
  });

  it("takes a parent folder with one run folder beside non-run folders such as projekcioj/", () => {
    const { radiko, antaux, post } = bazo();
    const parent = join(radiko, "nachher");
    expect(trovuLaufon(parent)).toBe(post);
    expect(trovuLaufon(post)).toBe(post);
    const perParent = komparo([{ dir: join(radiko, "vorher") }], [{ dir: parent }]);
    expect(stabilaJson(perParent)).toBe(stabilaJson(komparo([{ dir: antaux }], [{ dir: post }])));

    const malplena = tmp("s038-komparo-malplena-");
    mkdirSync(join(malplena, "projekcioj"));
    expect(() => trovuLaufon(malplena)).toThrow(NevalidaKomparo);
    skribiLaufon(radiko, "dua", { commit: "x", kuroj: [{ tasko: LFD, varianto: "F" }] });
    skribiLaufon(radiko, "tria", { commit: "x", kuroj: [{ tasko: LFD, varianto: "F" }] });
    try {
      trovuLaufon(radiko);
      expect.unreachable();
    } catch (error) {
      expect((error as NevalidaKomparo).problemoj[0]?.rule).toBe("komparo-pluraj-laufoj");
    }
  });

  it("gives the same bytes when computed twice", () => {
    const { antaux, post } = bazo();
    const unua = komparo([{ dir: antaux }], [{ dir: post }]);
    const dua = komparo([{ dir: antaux }], [{ dir: post }]);
    expect(stabilaJson(dua)).toBe(stabilaJson(unua));
    expect(komparoMd(dua)).toBe(komparoMd(unua));
    // No absolute path of the machine in the data.
    expect(stabilaJson(unua)).not.toContain(tmpdir());
  });

  it("loads the much older shape of the 037 measurement point as the extra line, „nicht vorhanden“ where fields are missing", () => {
    const { radiko, antaux, post } = bazo();
    const zusatzParent = join(radiko, "messpunkt-1");
    skribiLaufon(zusatzParent, "20261031-1342", {
      commit: "07585b5e",
      projekcioj: true,
      kuroj: [
        { tasko: LFD, varianto: "F", total: 75.9, malnova: true, haltigo: "max-tokens" },
        { tasko: LFD, varianto: "0", nekomencita: true, malnova: true },
      ],
    });
    const datumoj = komparo([{ dir: antaux }], [{ dir: post }], {
      zusatz: { dir: zusatzParent },
    });
    const lfdF = paro(datumoj, LFD, "F");
    expect(lfdF.zusatz).toMatchObject({
      lauf: "20261031-1342",
      commit: "07585b5e",
      total: 75.9,
      k8: null,
      markoj: ["teilweise"],
      tokenoj: { abgeleitet: true, jeEkrano: null },
    });
    // The extra line is never compared: Δ stays after − before.
    expect(lfdF.delto?.total).toBe(16.7);
    expect(paro(datumoj, UK, "F").zusatz).toBeNull();
    expect(paro(datumoj, UK, "F").zusatzKialo).toContain(UK);
    expect(datumoj.laufoj.zusatz).toMatchObject({ id: "20261031-1342", kunK8: false });
    const md = komparoMd(datumoj);
    expect(md).toContain("Stand vor 036 Teil 5");
    expect(md).toContain("nicht vorhanden");
    // Without --zusatz no pair has the field.
    expect(komparo([{ dir: antaux }], [{ dir: post }]).paroj.every((p) => !("zusatz" in p))).toBe(
      true,
    );
  });
});

describe("open deviations per rule in the comparison (Spec 038 A-2, AK-5, C-2)", () => {
  // After: rule totals ero-prop-constraint 3, aria 2, label 2, nicht-gebaut 1 – aria and label tie
  // and are ordered by name; nicht-gebaut is the fourth and drops out of the top three.
  const LAUX_REGULO = {
    a: { "nicht-gebaut": 1, "ero-prop-constraint": 2 },
    b: { "ero-prop-constraint": 1, label: 2, aria: 2 },
  };
  const SUMO = restantajSumo(LAUX_REGULO);
  const SUPRAJ = [
    { regulo: "ero-prop-constraint", nombro: 3 },
    { regulo: "aria", nombro: 2 },
    { regulo: "label", nombro: 2 },
  ];

  function laufoj() {
    const radiko = tmp("s038-33-komparo-");
    const antaux = skribiLaufon(join(radiko, "vorher"), "20261107-0900", {
      commit: "e4873c57",
      kuroj: [
        // The older shape: a number of open deviations, no rules.
        { tasko: LFD, varianto: "F", total: 70, restantaj: 5 },
        { tasko: LFD, varianto: "0", total: 40 },
      ],
    });
    const post = skribiLaufon(join(radiko, "nachher"), "20261107-1000", {
      commit: "c0de4d00",
      kuroj: [
        { tasko: LFD, varianto: "F", total: 80, penoj: true, restantajLauxRegulo: LAUX_REGULO },
        { tasko: LFD, varianto: "0", total: 50, penoj: true, restantajLauxRegulo: {} },
      ],
    });
    return { antaux, post };
  }

  it("gives per flow × variant × side the sum and the three most frequent rules, ties by name", () => {
    const { antaux, post } = laufoj();
    const datumoj = komparo([{ dir: antaux }], [{ dir: post }]);
    const lfdF = paro(datumoj, LFD, "F");
    expect(lfdF.post?.restantajSupraj).toEqual({ sumo: SUMO, supraj: SUPRAJ });
    expect(lfdF.post?.restantajSupraj?.supraj).toHaveLength(RESTANTAJ_SUPRAJ);
    // Older shape: „nicht vorhanden“, never a guessed 0.
    expect(lfdF.antaux?.restantajSupraj).toBeNull();
    // Nothing open: the sum 0 and no rule.
    expect(paro(datumoj, LFD, "0").post?.restantajSupraj).toEqual({ sumo: 0, supraj: [] });
    expect(paro(datumoj, LFD, "0").antaux?.restantajSupraj).toBeNull();
  });

  it("shows the column in vergleich.md: the rules with their number, „nicht vorhanden“ for older shapes", () => {
    const { antaux, post } = laufoj();
    const md = komparoMd(komparo([{ dir: antaux }], [{ dir: post }]));
    expect(md).toContain(
      "## Offene Abweichungen je Regel (nach der letzten Runde, häufigste drei)",
    );
    expect(md).toContain("| Ablauf | Variante | Seite | offen | häufigste Regeln |");
    const teksto = SUPRAJ.map((r) => `${r.regulo} ${r.nombro}`).join(", ");
    expect(md).toContain(`| ${LFD} | F | nachher | ${SUMO} | ${teksto} |`);
    expect(md).toContain(`| ${LFD} | F | vorher | – | nicht vorhanden |`);
    expect(md).toContain(`| ${LFD} | 0 | nachher | 0 | – |`);
    expect(md).not.toContain("nicht-gebaut 1");
  });

  it("gives the same bytes when computed twice", () => {
    const { antaux, post } = laufoj();
    const unua = komparo([{ dir: antaux }], [{ dir: post }]);
    const dua = komparo([{ dir: antaux }], [{ dir: post }]);
    expect(stabilaJson(dua)).toBe(stabilaJson(unua));
    expect(komparoMd(dua)).toBe(komparoMd(unua));
  });

  it("sums the runs per rule and is only complete where every run with deviations has the rules", () => {
    const nova = (lauxRegulo: Record<string, Record<string, number>>): RestantajEnKuro => ({
      restantaj: restantajSumo(lauxRegulo),
      restantajLauxRegulo: lauxRegulo,
    });
    const unua = nova({ a: { "nicht-gebaut": 1, zeta: 1 }, b: { beta: 1 } });
    const dua = nova({ a: { zeta: 2 }, c: { "nicht-gebaut": 1, alfa: 1 } });
    const ambaux = restantajSuprajDe([unua, dua]);
    expect(ambaux).toEqual({
      sumo: unua.restantaj + dua.restantaj,
      supraj: [
        { regulo: "zeta", nombro: 3 },
        { regulo: "nicht-gebaut", nombro: 2 },
        { regulo: "alfa", nombro: 1 },
      ],
    });
    // The error path (no field, nothing open) adds nothing.
    expect(restantajSuprajDe([unua, dua, { restantaj: 0, restantajLauxRegulo: null }])).toEqual(
      ambaux,
    );
    // An older record with open deviations makes the sum incomplete: „nicht vorhanden“.
    expect(restantajSuprajDe([unua, { restantaj: 4, restantajLauxRegulo: null }])).toBeNull();
    expect(restantajSuprajDe([{ restantaj: 0, restantajLauxRegulo: null }])).toBeNull();
    expect(restantajSuprajDe([])).toBeNull();
  });
});
