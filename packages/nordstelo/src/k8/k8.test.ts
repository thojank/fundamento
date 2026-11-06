// K8 „Erscheinung“ (Spec 038 Lauf 2, AC-L2-4): every feature with a positive and a negative case on
// small hand-built facts for two brands, the boundary of D-08 (0.5 px on a step, 0.51 px not), an
// empty denominator („nichts zu prüfen“), the Sxablono feature, mankoj that do not block k8Plena,
// no K8 facts → undefined, contrast "high" ignored, and an unloaded brand font (nekomparebla).
// Every Sollwert is read from the probes these tests build; the values are invented.

import { defaultModeloSource, listArangxoj, loadModelo, markerOf } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import type { Facts, FaktoAspekto, NativaFingrospuro, Render, Sondo } from "../facts.js";
import { facts, h, type Node } from "../test-doubles/facts.js";
import {
  K8_MERKMALOJ,
  type K8Kombinacio,
  type K8Rezulto,
  k8,
  k8Plena,
  MANKO_AL_MERKMAL,
} from "./k8.js";

const { modelo: ladita } = loadModelo(defaultModeloSource());
if (ladita === undefined) throw new Error("the repository Modelo must load");
const modelo = ladita;

/** Invented Sollwerte of two brands: families, colours and spacing steps (px). */
interface Marko {
  familioj: string[];
  koloroj: string[];
  stupoj: number[];
}
const KOMUNA: Marko = {
  familioj: ["provo-sans", "provo-mono"],
  koloroj: ["farbo(1)", "farbo(2)", "farbo(3)"],
  stupoj: [3, 7, 11],
};
const EKZEMPLO: Marko = {
  familioj: ["ekz-grotesk"],
  koloroj: ["farbo(4)", "farbo(5)"],
  stupoj: [5, 9.5],
};
const FREMDA_FAMILIO = "fremda-familio";
const FREMDA_KOLORO = "farbo(99)";

function sondojDe(marko: Marko): Sondo[] {
  return [
    ...marko.familioj.map((valoro, i): Sondo => ({ eco: "font-family", token: `f${i}`, valoro })),
    ...marko.koloroj.map((valoro, i): Sondo => ({ eco: "color", token: `k${i}`, valoro })),
    ...marko.stupoj.map((px, i): Sondo => ({ eco: "spacing", token: `s${i}`, valoro: String(px) })),
  ];
}

function fakto(marko: Marko, aliaj: Partial<FaktoAspekto> = {}): FaktoAspekto {
  return {
    tekstoj: [],
    nativaj: [],
    interspacoj: [],
    orientiloj: [],
    sondoj: sondojDe(marko),
    tiparoj: marko.familioj.map((familio) => ({ familio, sxargita: true })),
    ...aliaj,
  };
}

function render(
  aspekto: string,
  k8Fakto: FaktoAspekto | undefined,
  scheme: Render["scheme"] = "light",
  contrast: Render["contrast"] = "default",
): Render {
  return { aspekto, scheme, contrast, axe: [], ...(k8Fakto === undefined ? {} : { k8: k8Fakto }) };
}

/** A native element in the brand's style (D-17): brand font and colours, steps, no border. */
function enStilo(marko: Marko, elemento: number, aliaj: Partial<NativaFingrospuro> = {}) {
  const [familio = "", koloro = ""] = [marko.familioj[0], marko.koloroj[0]];
  const stupo = marko.stupoj[0] ?? 0;
  const nativa: NativaFingrospuro = {
    tag: "button",
    elemento,
    enEro: false,
    fontFamily: familio,
    color: koloro,
    backgroundColor: "transparent",
    borderColor: [FREMDA_KOLORO, FREMDA_KOLORO, FREMDA_KOLORO, FREMDA_KOLORO],
    borderStyle: ["none", "none", "none", "none"],
    padding: [stupo, stupo, stupo, stupo],
    margin: [0, 0, 0, 0],
    ...aliaj,
  };
  return nativa;
}

/** The page body of most cases: main > table > tr > td, and a button. */
const KORPO: Node[] = [
  h("main", {}, h("table", {}, h("tr", {}, h("td", {}, "Zelle"))), h("button", {}, "Los")),
];

const kun = (renders: Render[], korpo: Node[] = KORPO): Facts => facts(korpo, [], { renders });

/** The only combination of a result. */
function sola(rezulto: K8Rezulto | undefined): K8Kombinacio {
  expect(rezulto?.kombinacioj).toHaveLength(1);
  const kombinacio = rezulto?.kombinacioj[0];
  if (kombinacio === undefined) throw new Error("one combination expected");
  return kombinacio;
}

const kialoDe = (k: K8Kombinacio, merkmal: string): string[] =>
  k.kialoj.filter((kialo) => kialo.merkmal === merkmal).map((kialo) => kialo.teksto);

describe("k8 – which renders count (D-96, D-98)", () => {
  it("is undefined without K8 facts", () => {
    expect(k8(kun([render("komuna", undefined), render("ekzemplo", undefined)]), modelo)).toBe(
      undefined,
    );
  });

  it("ignores contrast high, also when only it carries K8 facts", () => {
    const schlecht = fakto(KOMUNA, {
      tekstoj: [{ elemento: 3, fontFamily: FREMDA_FAMILIO, signoj: 4 }],
    });
    expect(k8(kun([render("komuna", schlecht, "light", "high")]), modelo)).toBe(undefined);
    const gut = fakto(KOMUNA, {
      tekstoj: [{ elemento: 3, fontFamily: KOMUNA.familioj[0] ?? "", signoj: 4 }],
    });
    const k = sola(
      k8(
        kun([render("komuna", schlecht, "light", "high"), render("komuna", gut, "light")]),
        modelo,
      ),
    );
    expect(k.merkmaloj.ersatzschrift).toBe(1);
  });

  it("sorts the combinations by aspekto and scheme and averages their kvoto", () => {
    const rezulto = k8(
      kun([
        render("komuna", fakto(KOMUNA), "light"),
        render("komuna", fakto(KOMUNA), "dark"),
        render("ekzemplo", fakto(EKZEMPLO), "light"),
      ]),
      modelo,
    );
    expect(rezulto?.kombinacioj.map((k) => `${k.aspekto}/${k.scheme}`)).toEqual([
      "ekzemplo/light",
      "komuna/dark",
      "komuna/light",
    ]);
    const kvotoj = rezulto?.kombinacioj.map((k) => k.kvoto) ?? [];
    const mezo = kvotoj.reduce((a, b) => a + b, 0) / kvotoj.length;
    expect(rezulto?.kvoto).toBe(Math.round(mezo * 10_000) / 10_000);
    for (const k of rezulto?.kombinacioj ?? []) {
      const merkmaloj = K8_MERKMALOJ.map((merkmal) => k.merkmaloj[merkmal]);
      const atendita = merkmaloj.reduce((a, b) => a + b, 0) / merkmaloj.length;
      expect(k.kvoto).toBe(Math.round(atendita * 10_000) / 10_000);
    }
  });
});

describe("k8 – ersatzschrift (D-99, D-101)", () => {
  it("is 1 when every text run is in a brand family", () => {
    const k = sola(
      k8(
        kun([
          render(
            "komuna",
            fakto(KOMUNA, {
              tekstoj: KOMUNA.familioj.map((fontFamily, i) => ({
                elemento: i + 1,
                fontFamily,
                signoj: 5,
              })),
            }),
          ),
        ]),
        modelo,
      ),
    );
    expect(k.merkmaloj.ersatzschrift).toBe(1);
    expect(kialoDe(k, "ersatzschrift")).toEqual(["vollständig"]);
  });

  it("weights the substitute font by characters and names the first place", () => {
    const k = sola(
      k8(
        kun([
          render(
            "komuna",
            fakto(KOMUNA, {
              tekstoj: [
                { elemento: 4, fontFamily: KOMUNA.familioj[0] ?? "", signoj: 3 },
                { elemento: 3, fontFamily: FREMDA_FAMILIO, signoj: 9 },
              ],
            }),
          ),
        ]),
        modelo,
      ),
    );
    expect(k.merkmaloj.ersatzschrift).toBe(0.25);
    expect(kialoDe(k, "ersatzschrift")).toEqual([
      "1 von 2 Textläufen (75 % der Zeichen) in Ersatzschrift, zuerst `table > tr > td`",
    ]);
  });

  it("compares with the probes of its own brand", () => {
    const tekstoj = [{ elemento: 3, fontFamily: KOMUNA.familioj[0] ?? "", signoj: 4 }];
    const rezulto = k8(
      kun([
        render("komuna", fakto(KOMUNA, { tekstoj })),
        render("ekzemplo", fakto(EKZEMPLO, { tekstoj })),
      ]),
      modelo,
    );
    expect(rezulto?.kombinacioj.map((k) => [k.aspekto, k.merkmaloj.ersatzschrift])).toEqual([
      ["ekzemplo", 0],
      ["komuna", 1],
    ]);
  });
});

describe("k8 – nativaj (D-102, D-17)", () => {
  const nur = (marko: Marko, nativa: NativaFingrospuro) =>
    sola(k8(kun([render("komuna", fakto(marko, { nativaj: [nativa] }))]), modelo));

  it("counts a native element in brand style as not raw, inside an Ero or not", () => {
    for (const enEro of [false, true]) {
      const k = nur(KOMUNA, enStilo(KOMUNA, 4, { enEro }));
      expect(k.merkmaloj.nativaj).toBe(1);
      expect(kialoDe(k, "nativaj")).toEqual(["vollständig"]);
    }
  });

  it("lets a background or border colour of the brand pass, and a border style none", () => {
    const [, zweite = ""] = KOMUNA.koloroj;
    const k = nur(
      KOMUNA,
      enStilo(KOMUNA, 4, {
        backgroundColor: zweite,
        borderColor: [zweite, FREMDA_KOLORO, zweite, zweite],
        borderStyle: ["solid", "none", "solid", "solid"],
      }),
    );
    expect(k.merkmaloj.nativaj).toBe(1);
  });

  it("counts a foreign font, a foreign colour, a foreign border or an off-step side as raw", () => {
    const stupo = KOMUNA.stupoj[0] ?? 0;
    const kazoj: [string, Partial<NativaFingrospuro>, string][] = [
      ["font", { fontFamily: FREMDA_FAMILIO }, "Schrift"],
      ["colour", { color: FREMDA_KOLORO }, "Farbe"],
      ["background", { backgroundColor: FREMDA_KOLORO }, "Farbe"],
      ["border", { borderStyle: ["none", "solid", "none", "none"] }, "Farbe"],
      ["padding", { padding: [stupo, stupo + 1, stupo, stupo] }, "Abstand"],
      ["margin", { margin: [0, 0, stupo + 1, 0] }, "Abstand"],
    ];
    const malobservoj: string[] = [];
    for (const [nomo, aliaj, kio] of kazoj) {
      const k = nur(KOMUNA, enStilo(KOMUNA, 4, aliaj));
      const kialo = `1 von 1 nativen Elementen roh (${kio}), zuerst \`main > button\``;
      if (k.merkmaloj.nativaj !== 0 || kialoDe(k, "nativaj")[0] !== kialo)
        malobservoj.push(`${nomo}: ${k.merkmaloj.nativaj} ${kialoDe(k, "nativaj").join()}`);
    }
    expect(malobservoj).toEqual([]);
  });

  it("gives the share of elements in brand style", () => {
    const k = sola(
      k8(
        kun([
          render(
            "komuna",
            fakto(KOMUNA, {
              nativaj: [
                enStilo(KOMUNA, 1, { tag: "table" }),
                enStilo(KOMUNA, 4, { fontFamily: FREMDA_FAMILIO, color: FREMDA_KOLORO }),
                enStilo(KOMUNA, 0, { tag: "h1" }),
                enStilo(KOMUNA, 2, { tag: "a" }),
              ],
            }),
          ),
        ]),
        modelo,
      ),
    );
    expect(k.merkmaloj.nativaj).toBe(0.75);
    expect(kialoDe(k, "nativaj")).toEqual([
      "1 von 4 nativen Elementen roh (Schrift, Farbe), zuerst `main > button`",
    ]);
  });
});

describe("k8 – interspacoj (D-08, D-103)", () => {
  const gapo = (px: number) => ({ gepatro: 0, antaux: 1, post: 4, akso: "y" as const, px });
  const kun1 = (marko: Marko, px: number[]) =>
    sola(k8(kun([render("komuna", fakto(marko, { interspacoj: px.map(gapo) }))]), modelo));

  it("counts a gap 0.5 px beside a step as on the step, 0.51 px not", () => {
    for (const marko of [KOMUNA, EKZEMPLO]) {
      for (const stupo of marko.stupoj) {
        expect(kun1(marko, [stupo]).merkmaloj.interspacoj).toBe(1);
        expect(kun1(marko, [stupo + 0.5]).merkmaloj.interspacoj).toBe(1);
        expect(kun1(marko, [stupo - 0.5]).merkmaloj.interspacoj).toBe(1);
      }
      const unua = marko.stupoj[0] ?? 0;
      const k = kun1(marko, [unua - 0.51]);
      expect(k.merkmaloj.interspacoj).toBe(0);
      expect(kialoDe(k, "interspacoj")).toEqual([
        `1 von 1 Geschwisterabständen nicht auf einer Abstandsstufe, zuerst \`main > button\` (${String(Math.round((unua - 0.51) * 100) / 100).replace(".", ",")} px)`,
      ]);
    }
  });

  it("gives the share of gaps on a step", () => {
    const [a = 0, b = 0] = KOMUNA.stupoj;
    expect(kun1(KOMUNA, [a, b, a + 0.51, b + 0.5]).merkmaloj.interspacoj).toBe(0.75);
  });
});

describe("k8 – nichts zu prüfen (D-99)", () => {
  it("gives 1 with „nichts zu prüfen“ for an empty denominator", () => {
    const k = sola(k8(kun([render("komuna", fakto(KOMUNA))], []), modelo));
    for (const merkmal of ["ersatzschrift", "nativaj", "interspacoj"] as const) {
      expect(k.merkmaloj[merkmal]).toBe(1);
      expect(kialoDe(k, merkmal)).toEqual(["nichts zu prüfen"]);
    }
    expect(k.merkmaloj.sxablono).toBe(0);
  });

  it("gives 1 with „nichts zu prüfen“ for text runs without characters", () => {
    const k = sola(
      k8(
        kun([
          render(
            "komuna",
            fakto(KOMUNA, { tekstoj: [{ elemento: 1, fontFamily: FREMDA_FAMILIO, signoj: 0 }] }),
          ),
        ]),
        modelo,
      ),
    );
    expect(k.merkmaloj.ersatzschrift).toBe(1);
    expect(kialoDe(k, "ersatzschrift")).toEqual(["nichts zu prüfen"]);
  });
});

describe("k8 – sxablono (D-100, D-S038-12-1)", () => {
  const sxablonoj = modelo.sxablonoj ?? [];
  const sxablonoDe = (korpo: Node[], aspektoj: [string, Marko][] = [["komuna", KOMUNA]]) =>
    k8(
      kun(
        aspektoj.map(([aspekto, marko]) => render(aspekto, fakto(marko))),
        korpo,
      ),
      modelo,
    );

  it("is 1 for a Sxablono with a region filled by its marker slot, in every combination", () => {
    const malobservoj: string[] = [];
    for (const entry of sxablonoj) {
      for (const region of entry.skemo.regions) {
        const { slot } = markerOf(modelo, entry, region);
        if (slot === undefined) continue;
        const korpo = [
          h("div", {}, h(`fm-${entry.sxablono.name}`, {}, h("span", { slot }, "Inhalt"))),
        ];
        const rezulto = sxablonoDe(korpo, [
          ["komuna", KOMUNA],
          ["ekzemplo", EKZEMPLO],
        ]);
        const valoroj = rezulto?.kombinacioj.map((k) => k.merkmaloj.sxablono);
        if (JSON.stringify(valoroj) !== JSON.stringify([1, 1]))
          malobservoj.push(`${entry.sxablono.name}/${region.name}: ${JSON.stringify(valoroj)}`);
        const kialo = rezulto?.kombinacioj[0]?.kialoj.find((x) => x.merkmal === "sxablono");
        if (kialo?.teksto !== `vollständig: \`div > fm-${entry.sxablono.name}\``)
          malobservoj.push(`${entry.sxablono.name}/${region.name}: ${kialo?.teksto}`);
      }
    }
    expect(sxablonoj.length).toBeGreaterThan(0);
    expect(malobservoj).toEqual([]);
  });

  it("is 1 for a default region filled by own text or a child without slot", () => {
    const kunDefaulta = sxablonoj.filter((entry) =>
      entry.skemo.regions.some((region) => markerOf(modelo, entry, region).default === true),
    );
    const malobservoj: string[] = [];
    for (const entry of kunDefaulta) {
      const tag = `fm-${entry.sxablono.name}`;
      for (const korpo of [[h(tag, {}, "Text")], [h(tag, {}, h("p", {}, "Absatz"))]]) {
        const valoro = sola(sxablonoDe(korpo)).merkmaloj.sxablono;
        if (valoro !== 1) malobservoj.push(`${entry.sxablono.name}: ${valoro}`);
      }
    }
    expect(kunDefaulta.length).toBeGreaterThan(0);
    expect(malobservoj).toEqual([]);
  });

  it("is 0 without a Sxablono, for an unknown fm- name, and for a Sxablono with no region filled", () => {
    const sxablonoSenDefaulta = sxablonoj.find((entry) =>
      entry.skemo.regions.every((region) => markerOf(modelo, entry, region).default !== true),
    );
    const sxablonoNomo = sxablonoj[0]?.sxablono.name ?? "";
    const korpoj: Node[][] = [
      [h("main", {}, h("p", {}, "Text"))],
      [h(`fm-${sxablonoNomo}-nekonata`, {}, h("span", { slot: "x" }, "Text"))],
      [h(`fm-${sxablonoNomo}`, {})],
      [h(`fm-${sxablonoNomo}`, {}, h("span", { slot: "nenia-regiono" }, "Text"))],
    ];
    if (sxablonoSenDefaulta !== undefined)
      korpoj.push([h(`fm-${sxablonoSenDefaulta.sxablono.name}`, {}, h("p", {}, "ohne slot"))]);
    const malobservoj: string[] = [];
    for (const [i, korpo] of korpoj.entries()) {
      const k = sola(sxablonoDe(korpo));
      if (k.merkmaloj.sxablono !== 0) malobservoj.push(`case ${i}: ${k.merkmaloj.sxablono}`);
      if (kialoDe(k, "sxablono")[0] !== "keine Sxablono mit erkannter Region im Markup")
        malobservoj.push(`case ${i}: ${kialoDe(k, "sxablono").join()}`);
    }
    expect(malobservoj).toEqual([]);
  });
});

describe("k8 – mankoj and k8Plena (D-16, D-104, D-105)", () => {
  it("names the features of the layout purposes listArangxoj lacks", () => {
    const celoj = new Set<string>(listArangxoj(modelo).mankoj.map(({ celo }) => celo));
    const atenditaj = new Set(
      Object.entries(MANKO_AL_MERKMAL)
        .filter(([celo]) => celoj.has(celo))
        .map(([, merkmal]) => merkmal),
    );
    const rezulto = k8(kun([render("komuna", fakto(KOMUNA))]), modelo);
    expect(rezulto?.mankoj).toEqual(K8_MERKMALOJ.filter((merkmal) => atenditaj.has(merkmal)));
    expect(Object.values(MANKO_AL_MERKMAL).every((merkmal) => merkmal === "interspacoj")).toBe(
      true,
    );
  });

  const plena: K8Kombinacio = {
    aspekto: "komuna",
    scheme: "light",
    merkmaloj: { ersatzschrift: 1, nativaj: 1, interspacoj: 1, sxablono: 1 },
    kvoto: 1,
    kialoj: [],
  };
  const kunInterspacoj = (valoro: number): K8Kombinacio => ({
    ...plena,
    scheme: "dark",
    merkmaloj: { ...plena.merkmaloj, interspacoj: valoro },
  });

  it("holds despite interspacoj < 1 when interspacoj is a manko", () => {
    expect(
      k8Plena({ kvoto: 1, kombinacioj: [plena, kunInterspacoj(0.5)], mankoj: ["interspacoj"] }),
    ).toBe(true);
  });

  it("fails on interspacoj < 1 without the manko, and on any other feature < 1", () => {
    expect(k8Plena({ kvoto: 1, kombinacioj: [plena, kunInterspacoj(0.5)], mankoj: [] })).toBe(
      false,
    );
    for (const merkmal of K8_MERKMALOJ.filter((m) => m !== "interspacoj")) {
      const kombinacio = { ...plena, merkmaloj: { ...plena.merkmaloj, [merkmal]: 0.9999 } };
      expect(k8Plena({ kvoto: 1, kombinacioj: [plena, kombinacio], mankoj: ["interspacoj"] })).toBe(
        false,
      );
    }
  });

  it("holds for a page in brand style with a Sxablono, from k8 itself", () => {
    const sxablono = (modelo.sxablonoj ?? [])[0];
    const region = sxablono?.skemo.regions[0];
    if (sxablono === undefined || region === undefined) throw new Error("a Sxablono expected");
    const slot = markerOf(modelo, sxablono, region).slot ?? "";
    const korpo = [h(`fm-${sxablono.sxablono.name}`, {}, h("button", { slot }, "Los"))];
    const stupo = KOMUNA.stupoj[1] ?? 0;
    const rezulto = k8(
      kun(
        [
          render(
            "komuna",
            fakto(KOMUNA, {
              tekstoj: [{ elemento: 1, fontFamily: KOMUNA.familioj[0] ?? "", signoj: 3 }],
              nativaj: [enStilo(KOMUNA, 1)],
              interspacoj: [{ gepatro: -1, antaux: 0, post: 1, akso: "x", px: stupo + 1 }],
            }),
          ),
        ],
        korpo,
      ),
      modelo,
    );
    if (rezulto === undefined) throw new Error("a result expected");
    expect(sola(rezulto).merkmaloj.interspacoj).toBe(0);
    expect(k8Plena(rezulto)).toBe(rezulto.mankoj.includes("interspacoj"));
  });
});

describe("k8 – font source not reachable (edge case D-101)", () => {
  it("marks the combination nekomparebla and keeps the value computed", () => {
    const [familio = ""] = KOMUNA.familioj;
    const k = sola(
      k8(
        kun([
          render(
            "komuna",
            fakto(KOMUNA, {
              tekstoj: [
                { elemento: 3, fontFamily: familio, signoj: 1 },
                { elemento: 4, fontFamily: FREMDA_FAMILIO, signoj: 1 },
              ],
              tiparoj: [
                { familio, sxargita: false },
                { familio: KOMUNA.familioj[1] ?? "", sxargita: true },
              ],
            }),
          ),
        ]),
        modelo,
      ),
    );
    expect(k.nekomparebla).toBe("tiparo-ne-sxargita");
    expect(k.merkmaloj.ersatzschrift).toBe(0.5);
    expect(kialoDe(k, "ersatzschrift")).toContain(`Schriftquelle nicht erreichbar: ${familio}`);
  });

  it("stays comparable when every brand family is loaded or only a foreign one is not", () => {
    const k = sola(
      k8(
        kun([
          render(
            "komuna",
            fakto(KOMUNA, {
              tiparoj: [
                ...KOMUNA.familioj.map((familio) => ({ familio, sxargita: true })),
                { familio: FREMDA_FAMILIO, sxargita: false },
              ],
            }),
          ),
        ]),
        modelo,
      ),
    );
    expect("nekomparebla" in k).toBe(false);
    expect(kialoDe(k, "ersatzschrift").join()).not.toContain("Schriftquelle");
  });
});
