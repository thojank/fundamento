// Spec 055 (MP-1b, T2, data): the four Funktionsfarben are on the canvas of every brand. Without a
// value in `zusatzfarben` a node is „abgeleitet“ and shows the Basis of its derived palette (the light
// value of REFERENCE_STEPS[CALIBRATED_RAMP[p]], as `vicojDe` takes it); with a value it is „von Hand“.
// Every colour node hangs on Marke and feeds its own row. In the pure rules (plan D-17) an
// „abgeleitet“ node is a node without a value: as the source of its own row it changes nothing, as
// the source of another row it counts as null. Expectations come from the derivation itself.

import {
  type Agordo,
  CALIBRATED_RAMP,
  type DerivedPalettes,
  REFERENCE_STEPS,
} from "@fundamento/agordilo";
import { beforeAll, describe, expect, it } from "vitest";
import { gestaltenDe, paletrojDe, wirksamerAgordo } from "./grafeo-gestalten.js";
import {
  aldonebloj,
  type Bildo,
  type BildoFarbo,
  type BildoPaletro,
  FARBO_ROLOJ,
  type FarboRolo,
  KATALOGO_054,
  type Kabloj,
  kablojDe,
  ligoId,
  ligojKun,
  ROLO_PALETRO,
  STATUS_ROLOJ,
} from "./grafeo-gestalten-sicht.js";
import { hexOf } from "./sxtupoj.js";
import { type Bases, loadBases, startAgordo } from "./vorschau.js";

let bases: Bases;
let LEER: Agordo;
let WARNUNG: Agordo;

interface Fall {
  bildo: Bildo;
  palettes: DerivedPalettes | undefined;
}

function fallDe(agordo: Agordo, kabloj: Kabloj = {}): Fall {
  const start = startAgordo(agordo.name, "leer", bases);
  const palettes = paletrojDe(wirksamerAgordo(agordo, start, kabloj), bases);
  return { bildo: gestaltenDe(agordo, { start, kabloj, palettes, rev: 2 }), palettes };
}

function farbo(bildo: Bildo, rolo: FarboRolo): BildoFarbo {
  const found = bildo.nodoj.find((n) => n.id === `farbo-${rolo}`);
  if (found?.speco !== "farbo") throw new Error(`no colour node ${rolo}`);
  return found;
}

function paletro(bildo: Bildo): BildoPaletro {
  const found = bildo.nodoj.find((n) => n.id === "paletro");
  if (found?.speco !== "paletro") throw new Error("no palette");
  return found;
}

/** The light value of the Basis step of a row's derived palette. */
function basisHex(palettes: DerivedPalettes | undefined, rolo: FarboRolo): string | undefined {
  const paletroNomo = ROLO_PALETRO[rolo];
  const basis = REFERENCE_STEPS[CALIBRATED_RAMP[paletroNomo] as keyof typeof REFERENCE_STEPS];
  return palettes?.steps.find((s) => s.palette === paletroNomo && s.step === basis)?.hex;
}

const nodojDe = (bildo: Bildo) =>
  bildo.nodoj.map((n) => (n.speco === "farbo" ? { id: n.id, stato: n.stato } : { id: n.id }));

beforeAll(() => {
  bases = loadBases();
  LEER = startAgordo("lumeto", "leer", bases);
  WARNUNG = { ...LEER, zusatzfarben: { warning: "#d99a00" } };
});

describe("Spec 055 T2: the four Funktionsfarben from the start (Abnahme 2, data)", () => {
  it("an empty Agordo gives four nodes „abgeleitet“ with the light Basis of their palette", () => {
    const { bildo, palettes } = fallDe(LEER);
    const befunde: string[] = [];
    for (const rolo of STATUS_ROLOJ) {
      const n = farbo(bildo, rolo);
      const erwartet = basisHex(palettes, rolo);
      if (n.stato !== "abgeleitet") befunde.push(`${rolo}: stato ${n.stato}`);
      if (n.wert !== undefined) befunde.push(`${rolo}: carries a value`);
      if (erwartet === undefined || erwartet === "") befunde.push(`${rolo}: no Basis derived`);
      if (n.hex !== erwartet) befunde.push(`${rolo}: hex ${n.hex} ≠ ${erwartet}`);
      if (n.elir !== "farbo") befunde.push(`${rolo}: output ${n.elir}`);
    }
    expect(befunde).toEqual([]);
    expect(STATUS_ROLOJ).toEqual(["success", "warning", "danger", "info"]);
  });

  it("a value in zusatzfarben gives „von Hand“ with that value; the others stay derived", () => {
    const { bildo, palettes } = fallDe(WARNUNG);
    expect(farbo(bildo, "warning")).toMatchObject({
      wert: "#d99a00",
      hex: hexOf("#d99a00"),
      stato: "von-hand",
    });
    expect(
      (["success", "danger", "info"] as const).map((r) => [
        farbo(bildo, r).stato,
        farbo(bildo, r).hex,
      ]),
    ).toEqual(
      (["success", "danger", "info"] as const).map((r) => ["abgeleitet", basisHex(palettes, r)]),
    );
  });

  it("without a derivation the nodes stay, derived, with an empty hex", () => {
    const start = startAgordo(LEER.name, "leer", bases);
    const bildo = gestaltenDe(LEER, { start, kabloj: {}, palettes: undefined, rev: 1 });
    expect(bildo.ableitung).toBe("fehlt");
    expect(STATUS_ROLOJ.map((r) => [farbo(bildo, r).stato, farbo(bildo, r).hex])).toEqual(
      STATUS_ROLOJ.map(() => ["abgeleitet", ""]),
    );
  });

  it("removing the value (null) keeps the node: no zusatzfarben, node „abgeleitet“", () => {
    const { zusatzfarben: _weg, ...ohne } = WARNUNG;
    const { bildo } = fallDe(ohne);
    expect("zusatzfarben" in ohne).toBe(false);
    expect(farbo(bildo, "warning").stato).toBe("abgeleitet");
  });
});

describe("Spec 055 T2: edges for all seven colour nodes", () => {
  it("ligojDe hangs every colour node on Marke and feeds its own row", () => {
    const { bildo } = fallDe(LEER);
    const ids = new Set(bildo.ligoj.map((l) => l.id));
    const fehlen = FARBO_ROLOJ.flatMap((rolo) =>
      [
        ligoId("marko.el", `farbo-${rolo}.en`),
        ligoId(`farbo-${rolo}.el`, `paletro.en.${rolo}`),
      ].filter((id) => !ids.has(id)),
    );
    expect(fehlen).toEqual([]);
    const statusLigoj = bildo.ligoj.filter((l) =>
      STATUS_ROLOJ.some((r) => l.de === `farbo-${r}.el`),
    );
    expect(statusLigoj.map((l) => [l.art, l.hex])).toEqual(
      STATUS_ROLOJ.map((r) => ["farbo", farbo(bildo, r).hex]),
    );
  });
});

describe("Spec 055 T2: „abgeleitet“ in the pure rules (plan D-17)", () => {
  it("kablojDe: a derived node at its own row changes nothing", () => {
    const { bildo } = fallDe(LEER);
    expect(kablojDe(bildo.ligoj, nodojDe(bildo))).toEqual({});
  });

  it("kablojDe: a derived node as the source of another row counts as null", () => {
    const { bildo } = fallDe(WARNUNG);
    const ligoj = ligojKun(
      { geloest: [], gezogen: [{ de: "farbo-success.el", al: "paletro.en.warning" }], nodoj: [] },
      bildo,
    );
    expect(ligoj.some((l) => l.id === ligoId("farbo-success.el", "paletro.en.warning"))).toBe(true);
    expect(kablojDe(ligoj, nodojDe(bildo))).toEqual({ warning: null });
  });

  it("vicojDe: a derived source is set (fonto, fontoHex) but carries no Basis", () => {
    const { bildo } = fallDe(WARNUNG);
    const vicoj = new Map(paletro(bildo).vicoj.map((v) => [v.rolo, v] as const));
    const befunde: string[] = [];
    for (const rolo of ["success", "danger", "info"] as const) {
      const v = vicoj.get(rolo);
      if (v?.fonto !== rolo) befunde.push(`${rolo}: fonto ${v?.fonto}`);
      if (v?.fontoHex !== farbo(bildo, rolo).hex) befunde.push(`${rolo}: fontoHex ${v?.fontoHex}`);
      if (v?.basis !== undefined) befunde.push(`${rolo}: Basis ${v.basis}`);
    }
    expect(befunde).toEqual([]);
    expect(vicoj.get("warning")?.basis).toBe("600");
  });

  it("vicojDe: a derived node drawn onto another row gives that row no Basis", () => {
    const { bildo } = fallDe(WARNUNG, { warning: "success" });
    const warnung = paletro(bildo).vicoj.find((v) => v.rolo === "warning");
    expect(warnung?.fonto).toBe("success");
    expect(warnung?.basis).toBeUndefined();
  });

  it("wirksamerAgordo: a derived source of another row counts as null", () => {
    const start = startAgordo(WARNUNG.name, "leer", bases);
    const alsQuelle = wirksamerAgordo(WARNUNG, start, { warning: "success" });
    expect(alsQuelle).toEqual(wirksamerAgordo(WARNUNG, start, { warning: null }));
    expect(alsQuelle.zusatzfarben).toBeUndefined();
    // At its own row it changes nothing.
    expect(wirksamerAgordo(WARNUNG, start, { success: "success" })).toEqual(WARNUNG);
  });

  it("aldonebloj: the four Funktionsfarben read „auf der Leinwand“ and add nothing", () => {
    const { bildo } = fallDe(LEER);
    const listo = aldonebloj(KATALOGO_054, nodojDe(bildo));
    const status = listo.filter((a) => STATUS_ROLOJ.some((r) => a.nodo === `farbo-${r}`));
    expect(status.map((a) => [a.nomo, a.stato])).toEqual([
      ["Farbe · Erfolg", "da"],
      ["Farbe · Warnung", "da"],
      ["Farbe · Fehler", "da"],
      ["Farbe · Hinweis", "da"],
    ]);
    expect(listo.some((a) => a.stato === "anlegen")).toBe(false);
  });
});
