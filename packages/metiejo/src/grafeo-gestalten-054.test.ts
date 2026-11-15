// Spec 054 (MP-1, T1): the data of the view Gestalten. `gestaltenDe` turns the stored Agordo and
// the derivation of the effective Agordo into the Bildo – six phases as nodes, the special nodes,
// the edges that follow from the Agordo, the seven palette rows with Basis and dark values – and
// carries no judgment. `poziciojKun` keeps moved places over a new Bildo. Expectations come from the
// derivation itself (`paletrojDe`), never from pinned values; fixtures are invented brands.

import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import {
  type Agordo,
  CALIBRATED_RAMP,
  type DerivedPalettes,
  REFERENCE_STEPS,
  readAgordo,
} from "@fundamento/agordilo";
import { buildModelo } from "@fundamento/modelo";
import { beforeAll, describe, expect, it } from "vitest";
import { gestaltenDe, paletrojDe, serializeBildo, wirksamerAgordo } from "./grafeo-gestalten.js";
import {
  ARANGXO_055,
  type Bildo,
  type BildoFarbo,
  type BildoNodo,
  type BildoPaletro,
  FARBO_ROLOJ,
  type FarboRolo,
  type Kabloj,
  type Pozicio,
  poziciojKun,
  ROLO_PALETRO,
  vorschauHref,
} from "./grafeo-gestalten-sicht.js";
import { provoAgordo } from "./test-doubles/grafeo-047.js";
import { type Bases, loadBases, startAgordo } from "./vorschau.js";

/** A DTCG sRGB colour as `colourWert` in servilo.ts writes it. */
function dtcg(hex: string): { colorSpace: "srgb"; components: number[]; hex: string } {
  const components = [1, 3, 5].map(
    (index) =>
      Math.round((Number.parseInt(hex.slice(index, index + 2), 16) / 255) * 10_000) / 10_000,
  );
  return { colorSpace: "srgb", components, hex };
}

let bases: Bases;
let LEER: Agordo;
let FARBIG: Agordo;
let MATERIAL: Agordo;
let ALLE: Agordo;
let GESETZT: Agordo;
let PROVO: Agordo;

interface Fall {
  bildo: Bildo;
  palettes: DerivedPalettes | undefined;
}

/** The Bildo as the server builds it: effective Agordo → derivation → gestaltenDe. */
function fallDe(agordo: Agordo, kabloj: Kabloj = {}, rev = 3): Fall {
  const start = startAgordo(agordo.name, "leer", bases);
  const palettes = paletrojDe(wirksamerAgordo(agordo, start, kabloj), bases);
  return { bildo: gestaltenDe(agordo, { start, kabloj, palettes, rev }), palettes };
}

const faelle = new Map<string, Fall>();
function fall(nomo: string): Fall {
  const found = faelle.get(nomo);
  if (found === undefined) throw new Error(`no case ${nomo}`);
  return found;
}

function nodo<T extends BildoNodo["speco"]>(
  bildo: Bildo,
  id: string,
  speco: T,
): Extract<BildoNodo, { speco: T }> {
  const found = bildo.nodoj.find((entry) => entry.id === id);
  if (found === undefined || found.speco !== speco) throw new Error(`no ${speco} node ${id}`);
  return found as Extract<BildoNodo, { speco: T }>;
}

const farbo = (bildo: Bildo, rolo: FarboRolo): BildoFarbo => nodo(bildo, `farbo-${rolo}`, "farbo");
const paletro = (bildo: Bildo): BildoPaletro => nodo(bildo, "paletro", "paletro");

beforeAll(() => {
  bases = loadBases();
  LEER = startAgordo("lumeta", "leer", bases);
  FARBIG = {
    ...LEER,
    leitfarbe: "#2f5bff",
    zweitfarbe: { farbe: "#c6f135" },
    neutral: { toenung: 0.35 },
    zusatzfarben: { warning: "#d99a00" },
    etikedoj: { marko: "Lumeta Werk" },
  };
  MATERIAL = {
    ...LEER,
    zweitfarbe: {
      farbe: "oklch(0.86 0.17 92)",
      herkunft: { quelle: "bild", datei: "probe.png", merkmal: "Fläche oben links" },
    },
  };
  ALLE = {
    ...LEER,
    zusatzfarben: { success: "#2e8b57", warning: "#d99a00", danger: "#d7263d", info: "#1e88c8" },
  };
  GESETZT = {
    ...FARBIG,
    festgelegt: {
      "color.palette.accent.500": { wert: dtcg("#d7263d") },
      "color.palette.success.300": { modoj: { "color-scheme=dark": { wert: dtcg("#123456") } } },
    },
  };
  PROVO = provoAgordo();
  for (const [nomo, agordo] of Object.entries({ LEER, FARBIG, MATERIAL, ALLE, GESETZT, PROVO })) {
    faelle.set(nomo, fallDe(agordo));
  }
  faelle.set("FARBIG-akzent-geloest", fallDe(FARBIG, { akzent: null }));
  faelle.set("FARBIG-primaer-an-warnung", fallDe(FARBIG, { warning: "primaer" }));
  faelle.set("LEER-primaer-an-warnung", fallDe(LEER, { warning: "primaer" }));
  // An empty Akzent on the row Warnung: connected, but it feeds no colour (no Basis).
  faelle.set("LEER-akzent-an-warnung", fallDe(LEER, { warning: "akzent" }));
});

describe("Spec 054 T1: the fixtures are valid Agordoj", () => {
  it("reads every fixture without an issue", () => {
    const befunde: string[] = [];
    for (const [nomo, agordo] of Object.entries({ LEER, FARBIG, MATERIAL, ALLE, GESETZT })) {
      for (const issue of readAgordo(agordo).issues) befunde.push(`${nomo}: ${issue.message}`);
    }
    expect(befunde).toEqual([]);
  });
});

describe("Spec 054 T1: phases are nodes (AK-20, R-13)", () => {
  // Spec 055 (T1): the phase frames are gone; `fazo` stays on the nodes as a purpose tag only.
  it("has no phase nodes any more (Spec 055 T1)", () => {
    const { bildo } = fall("FARBIG");
    expect(bildo.nodoj.filter((entry) => (entry.speco as string) === "fazo")).toEqual([]);
  });

  it("gives every node a purpose tag of phase 4 or 5, and every node a unique id", () => {
    const befunde: string[] = [];
    for (const [nomo, { bildo }] of faelle) {
      const ids = bildo.nodoj.map((n) => n.id);
      if (new Set(ids).size !== ids.length) befunde.push(`${nomo}: duplicate node ids`);
      for (const n of bildo.nodoj) {
        const tag: string = n.fazo;
        if (tag !== "fazo-4" && tag !== "fazo-5") befunde.push(`${nomo}: ${n.id} has no tag`);
      }
    }
    expect(befunde).toEqual([]);
  });

  it("puts Marke, the colours and the Palette in phase 4 and the previews in phase 5", () => {
    const { bildo } = fall("ALLE");
    const fazoDe = Object.fromEntries(bildo.nodoj.map((n) => [n.id, n.fazo]));
    expect(fazoDe).toEqual({
      marko: "fazo-4",
      "farbo-primaer": "fazo-4",
      "farbo-akzent": "fazo-4",
      "farbo-neutral": "fazo-4",
      "farbo-success": "fazo-4",
      "farbo-warning": "fazo-4",
      "farbo-danger": "fazo-4",
      "farbo-info": "fazo-4",
      paletro: "fazo-4",
      "vorschau-hell": "fazo-5",
      "vorschau-dunkel": "fazo-5",
    });
  });
});

describe("Spec 054 T1: Marke and colour nodes come from the stored Agordo", () => {
  it("names the brand by etikedoj.marko or the identifier, as an unchecked draft", () => {
    expect(fall("FARBIG").bildo.marko).toEqual({
      name: "lumeta",
      etikedo: "Lumeta Werk",
      stato: "entwurf-ungepruft",
    });
    expect(fall("LEER").bildo.marko).toEqual({
      name: "lumeta",
      etikedo: "lumeta",
      stato: "entwurf-ungepruft",
    });
    expect(fall("LEER").bildo.rev).toBe(3);
  });

  it("an empty brand: Primär at the start value, Akzent and Neutral empty, no Funktionsfarbe", () => {
    const { bildo, palettes } = fall("LEER");
    const neutral100 = palettes?.steps.find((s) => s.palette === "neutral" && s.step === "100");
    expect(farbo(bildo, "primaer")).toMatchObject({
      wert: LEER.leitfarbe,
      stato: "startwert",
      elir: "farbo",
    });
    expect(farbo(bildo, "akzent").stato).toBe("leer");
    expect(farbo(bildo, "akzent").wert).toBeUndefined();
    expect(farbo(bildo, "neutral")).toMatchObject({
      stato: "abgeleitet",
      elir: "mezuro",
      toenung: 0,
      hex: neutral100?.hex,
    });
    expect(farbo(bildo, "neutral").wert).toBeUndefined();
    // Spec 055 (T2): the four Funktionsfarben are always there, derived without a value.
    expect(
      bildo.nodoj.flatMap((n) =>
        n.speco === "farbo" && /^farbo-(success|warning|danger|info)$/.test(n.id)
          ? [[n.id, n.stato]]
          : [],
      ),
    ).toEqual(["success", "warning", "danger", "info"].map((r) => [`farbo-${r}`, "abgeleitet"]));
  });

  it("set colours: by hand, the Tönung, a Funktionsfarbe only when the Agordo has it", () => {
    const { bildo, palettes } = fall("FARBIG");
    const neutral100 = palettes?.steps.find((s) => s.palette === "neutral" && s.step === "100");
    expect(farbo(bildo, "primaer")).toMatchObject({
      wert: "#2f5bff",
      hex: "#2f5bff",
      stato: "von-hand",
    });
    expect(farbo(bildo, "akzent")).toMatchObject({
      wert: "#c6f135",
      hex: "#c6f135",
      stato: "von-hand",
    });
    expect(farbo(bildo, "neutral")).toMatchObject({
      stato: "von-hand",
      elir: "mezuro",
      toenung: 0.35,
      hex: neutral100?.hex,
    });
    expect(farbo(bildo, "warning")).toMatchObject({
      wert: "#d99a00",
      stato: "von-hand",
      elir: "farbo",
    });
    // Spec 055 (T2): a Funktionsfarbe without a value is on the canvas, derived.
    expect(farbo(bildo, "success").stato).toBe("abgeleitet");
  });

  it("a Zweitfarbe with herkunft is „aus Material“; an oklch value keeps its text and draws as hex", () => {
    const akzent = farbo(fall("MATERIAL").bildo, "akzent");
    expect(akzent.stato).toBe("aus-material");
    expect(akzent.wert).toBe("oklch(0.86 0.17 92)");
    expect(akzent.hex).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("only the Neutral node carries a Tönung, every colour node a drawable hex", () => {
    const befunde: string[] = [];
    for (const [nomo, { bildo }] of faelle) {
      for (const n of bildo.nodoj) {
        if (n.speco !== "farbo") continue;
        if ((n.toenung !== undefined) !== (n.rolo === "neutral"))
          befunde.push(`${nomo}: ${n.id} toenung`);
        if ((n.elir === "mezuro") !== (n.rolo === "neutral")) befunde.push(`${nomo}: ${n.id} elir`);
        if (!/^#[0-9a-f]{6}$/.test(n.hex)) befunde.push(`${nomo}: ${n.id} hex ${n.hex}`);
      }
    }
    expect(befunde).toEqual([]);
  });

  it("colour nodes stay as stored when kabloj changes the effective view (AK-18)", () => {
    const stored = fall("FARBIG").bildo.nodoj.filter(
      (n) => n.speco === "farbo" && n.rolo !== "neutral",
    );
    for (const nomo of ["FARBIG-akzent-geloest", "FARBIG-primaer-an-warnung"]) {
      const view = fall(nomo).bildo.nodoj.filter(
        (n) => n.speco === "farbo" && n.rolo !== "neutral",
      );
      expect(view).toEqual(stored);
    }
  });
});

describe("Spec 054 T1: two previews, light and dark (AK-10, AK-23 data)", () => {
  it("has the nodes vorschau-hell and vorschau-dunkel with hrefs from vorschauHref", () => {
    const befunde: string[] = [];
    for (const [nomo, { bildo }] of faelle) {
      const vorschauen = bildo.nodoj.filter((n) => n.speco === "vorschau");
      const ist = vorschauen.map((n) => n.speco === "vorschau" && [n.id, n.schema, n.href]);
      const soll = (["hell", "dunkel"] as const).map((schema) => [
        `vorschau-${schema}`,
        schema,
        vorschauHref(bildo.marko.name, schema, bildo.rev, bildo.kabloj),
      ]);
      if (JSON.stringify(ist) !== JSON.stringify(soll))
        befunde.push(`${nomo}: ${JSON.stringify(ist)}`);
    }
    expect(befunde).toEqual([]);
  });

  it("vorschauHref uses sxtupo=vorschau, never a Bühne, and carries scheme, rev and kabloj", () => {
    const befunde: string[] = [];
    const varianten: [string, "hell" | "dunkel", number, Kabloj][] = [
      ["lumeta", "hell", 1, {}],
      ["lumeta", "dunkel", 7, {}],
      ["mit leer", "hell", 2, { akzent: null, warning: "primaer" }],
    ];
    for (const [marko, schema, rev, kabloj] of varianten) {
      const href = vorschauHref(marko, schema, rev, kabloj);
      const url = new URL(href, "http://127.0.0.1");
      if (url.pathname !== `/marko/${encodeURIComponent(marko)}/vorschau`)
        befunde.push(`path ${href}`);
      if (url.searchParams.get("sxtupo") !== "vorschau") befunde.push(`sxtupo ${href}`);
      if (href.includes("buehne-")) befunde.push(`buehne ${href}`);
      if (url.searchParams.get("scheme") !== (schema === "hell" ? "light" : "dark"))
        befunde.push(`scheme ${href}`);
      if (url.searchParams.get("rev") !== String(rev)) befunde.push(`rev ${href}`);
      if (url.searchParams.get("breite") !== "mittel") befunde.push(`breite ${href}`);
      const kablojParam = url.searchParams.get("kabloj");
      if (Object.keys(kabloj).length === 0 ? kablojParam !== null : kablojParam === null) {
        befunde.push(`kabloj ${href}`);
      }
    }
    expect(befunde).toEqual([]);
    expect(
      new URL(
        vorschauHref("lumeta", "hell", 1, { akzent: null, warning: "primaer" }),
        "http://x",
      ).searchParams.get("kabloj"),
    ).toBe("akzent:-,warning:primaer");
  });
});

describe("Spec 054 T1: the palette rows (AK-24, AK-25 data)", () => {
  it("always has seven rows in the fixed order with their palettes and input kinds", () => {
    const { bildo } = fall("LEER");
    expect(paletro(bildo).vicoj.map((v) => [v.rolo, v.paletro, v.etikedo, v.enir])).toEqual([
      ["neutral", "neutral", "Neutral", "mezuro"],
      ["primaer", "accent", "Primär", "farbo"],
      ["akzent", "sekundo", "Akzent", "farbo"],
      ["success", "success", "Erfolg", "farbo"],
      ["warning", "warning", "Warnung", "farbo"],
      ["danger", "danger", "Fehler", "farbo"],
      ["info", "info", "Hinweis", "farbo"],
    ]);
    expect(FARBO_ROLOJ).toEqual(paletro(bildo).vicoj.map((v) => v.rolo));
  });

  it("takes every step and its light value from the derivation, dark only where it differs", () => {
    const befunde: string[] = [];
    let geteilt = 0;
    let gleich = 0;
    for (const [nomo, { bildo, palettes }] of faelle) {
      if (palettes === undefined) {
        befunde.push(`${nomo}: no derivation`);
        continue;
      }
      for (const vico of paletro(bildo).vicoj) {
        const steps = palettes.steps.filter((s) => s.palette === vico.paletro);
        const soll = steps.map((s) => {
          const dark = palettes.overrides.find(
            (o) => o.palette === s.palette && o.step === s.step && o.mode === "dark",
          );
          return {
            stufo: s.step,
            tokeno: `color.palette.${s.palette}.${s.step}`,
            hex: s.hex,
            gesetzt: s.gesetzt === true,
            ...(dark !== undefined && dark.hex !== s.hex ? { hexDunkel: dark.hex } : {}),
            gesetztDunkel: dark?.gesetzt === true,
          };
        });
        geteilt += soll.filter((s) => "hexDunkel" in s).length;
        gleich += steps.filter((s) =>
          palettes.overrides.some(
            (o) =>
              o.palette === s.palette && o.step === s.step && o.mode === "dark" && o.hex === s.hex,
          ),
        ).length;
        if (!isDeepStrictEqual(vico.stufoj, soll)) befunde.push(`${nomo}: ${vico.rolo}`);
      }
    }
    expect(befunde).toEqual([]);
    // Both branches ran: the structure's own dark step (neutral.950) derives to the light value
    // today and stays whole (Befund B-5); a dark value set by hand (GESETZT) splits its step.
    expect(gleich).toBeGreaterThan(0);
    expect(geteilt).toBeGreaterThan(0);
  });

  it("the Akzent row has no steps without a Zweitfarbe, and the Zweitfarbe's steps with one", () => {
    const akzent = (nomo: string) =>
      paletro(fall(nomo).bildo).vicoj.find((v) => v.rolo === "akzent");
    expect(akzent("LEER")?.stufoj).toEqual([]);
    expect(akzent("LEER")?.fonto).toBe("akzent");
    expect(akzent("FARBIG")?.stufoj.length).toBeGreaterThan(0);
    expect(akzent("FARBIG-akzent-geloest")?.stufoj).toEqual([]);
    expect(akzent("FARBIG-akzent-geloest")?.fonto).toBeNull();
  });

  it("marks exactly one Basis per row fed by a colour, none for Neutral or rows without colour", () => {
    const befunde: string[] = [];
    for (const [nomo, { bildo }] of faelle) {
      const farboj = new Map(
        bildo.nodoj.flatMap((n) => (n.speco === "farbo" ? [[n.rolo, n] as const] : [])),
      );
      for (const vico of paletro(bildo).vicoj) {
        const fonto = vico.fonto === null ? undefined : farboj.get(vico.fonto);
        // Spec 055 (D-17): a derived Funktionsfarbe carries no colour of its own, like an empty one.
        const kolora =
          vico.rolo !== "neutral" &&
          fonto !== undefined &&
          fonto.stato !== "leer" &&
          fonto.stato !== "abgeleitet";
        const soll =
          kolora && vico.paletro !== "neutral"
            ? REFERENCE_STEPS[CALIBRATED_RAMP[vico.paletro] as keyof typeof REFERENCE_STEPS]
            : undefined;
        if (vico.basis !== soll)
          befunde.push(`${nomo}: ${vico.rolo} basis ${vico.basis} not ${soll}`);
        if (vico.basis !== undefined) {
          const n = vico.stufoj.filter((s) => s.stufo === vico.basis).length;
          if (n !== 1) befunde.push(`${nomo}: ${vico.rolo} has ${n} Basis steps`);
        }
        if ((vico.fontoHex !== undefined) !== (vico.fonto !== null)) {
          befunde.push(`${nomo}: ${vico.rolo} fontoHex ${vico.fontoHex} with fonto ${vico.fonto}`);
        }
        if (fonto !== undefined && vico.fontoHex !== fonto.hex)
          befunde.push(`${nomo}: ${vico.rolo} fontoHex`);
      }
    }
    expect(befunde).toEqual([]);
    // D-3: the Zweitfarbe's row takes the accent ladder's targets, so its Basis is 700 too.
    const akzent = paletro(fall("FARBIG").bildo).vicoj.find((v) => v.rolo === "akzent");
    expect(akzent?.basis).toBe(REFERENCE_STEPS.accent);
  });

  it("follows kabloj: Primär on Warnung feeds that row, a detached Akzent feeds none", () => {
    for (const nomo of ["FARBIG-primaer-an-warnung", "LEER-primaer-an-warnung"]) {
      const { bildo } = fall(nomo);
      const warnung = paletro(bildo).vicoj.find((v) => v.rolo === "warning");
      expect(warnung?.fonto).toBe("primaer");
      expect(warnung?.fontoHex).toBe(farbo(bildo, "primaer").hex);
      expect(warnung?.basis).toBe(REFERENCE_STEPS.warning);
      expect(bildo.kabloj).toEqual({ warning: "primaer" });
    }
    const leer = paletro(fall("LEER").bildo).vicoj.find((v) => v.rolo === "warning");
    // Spec 055 (D-17): the derived node Warnung is the row's source, but feeds no colour (no Basis).
    expect(leer?.fonto).toBe("warning");
    expect(leer?.basis).toBeUndefined();
    expect(fall("FARBIG-akzent-geloest").bildo.kabloj).toEqual({ akzent: null });
  });

  it("marks steps set by hand, light and dark separately (AK-11, AK-24 data)", () => {
    const vicoj = paletro(fall("GESETZT").bildo).vicoj;
    const stufo = (rolo: FarboRolo, step: string) =>
      vicoj.find((v) => v.rolo === rolo)?.stufoj.find((s) => s.stufo === step);
    expect(stufo("primaer", "500")).toMatchObject({
      hex: "#d7263d",
      gesetzt: true,
      gesetztDunkel: false,
    });
    expect(stufo("success", "300")).toMatchObject({
      gesetzt: false,
      gesetztDunkel: true,
      hexDunkel: "#123456",
    });
    const ohne = paletro(fall("FARBIG").bildo).vicoj.flatMap((v) => v.stufoj);
    expect(ohne.filter((s) => s.gesetzt || s.gesetztDunkel)).toEqual([]);
  });

  it("without a derivation: ableitung „fehlt“, seven rows without steps or Basis", () => {
    const start = startAgordo(FARBIG.name, "leer", bases);
    const bildo = gestaltenDe(FARBIG, { start, kabloj: {}, palettes: undefined, rev: 1 });
    expect(bildo.ableitung).toBe("fehlt");
    expect(paletro(bildo).vicoj.map((v) => [v.rolo, v.stufoj.length, v.basis])).toEqual(
      FARBO_ROLOJ.map((rolo) => [rolo, 0, undefined]),
    );
    expect(fall("FARBIG").bildo.ableitung).toBe("ok");
  });
});

describe("Spec 054 T1: the edges that follow from the Agordo", () => {
  it("connects Marke → each colour node → its own row, Palette → each preview", () => {
    const befunde: string[] = [];
    for (const [nomo, { bildo }] of faelle) {
      const farboj = bildo.nodoj.filter((n): n is BildoFarbo => n.speco === "farbo");
      const soll = [
        ...farboj.flatMap((n) => [
          `marko.el>${n.id}.en:marko:`,
          `${n.id}.el>paletro.en.${n.rolo}:${n.elir}:${n.elir === "farbo" ? n.hex : ""}`,
        ]),
        "paletro.el>vorschau-hell.en:marko:",
        "paletro.el>vorschau-dunkel.en:marko:",
        // Spec 055 D-18: the fixed edge Primär → Neutral while Neutral is derived from Primär.
        ...farboj.flatMap((n) =>
          n.rolo === "neutral" && n.herkunft === "primaer"
            ? [`farbo-primaer.el>farbo-neutral.en.farbo:farbo:${farbo(bildo, "primaer").hex}`]
            : [],
        ),
      ].sort();
      const ist = bildo.ligoj.map((l) => `${l.de}>${l.al}:${l.art}:${l.hex ?? ""}`).sort();
      if (JSON.stringify(ist) !== JSON.stringify(soll)) befunde.push(`${nomo}: ${ist.join(" ")}`);
      const ids = bildo.ligoj.map((l) => l.id);
      if (new Set(ids).size !== ids.length) befunde.push(`${nomo}: duplicate edge ids`);
    }
    expect(befunde).toEqual([]);
  });

  it("are the same with and without kabloj (the start of every session)", () => {
    expect(fall("FARBIG-akzent-geloest").bildo.ligoj).toEqual(fall("FARBIG").bildo.ligoj);
    expect(fall("FARBIG-primaer-an-warnung").bildo.ligoj).toEqual(fall("FARBIG").bildo.ligoj);
  });
});

describe("Spec 054 T1: no judgment in the Bildo (AK-9 data)", () => {
  it("names no Regulo, carries no problem count and no report sentence", () => {
    const modelo = buildModelo(bases.structure.files).modelo;
    const verboten = modelo.reguloj.flatMap((r) => [r.name, r.id, r.statement, r.kialo]);
    expect(verboten.length).toBeGreaterThan(0);
    const befunde: string[] = [];
    for (const [nomo, { bildo }] of faelle) {
      const teksto = serializeBildo(bildo);
      for (const wort of verboten)
        if (teksto.includes(`"${wort}"`) || teksto.includes(wort)) befunde.push(`${nomo}: ${wort}`);
      for (const key of [
        "probleme",
        "problemo",
        "betroffen",
        "regulo",
        "reguloj",
        "kialo",
        "raporto",
        "pruefung",
      ]) {
        if (teksto.includes(`"${key}"`)) befunde.push(`${nomo}: key ${key}`);
      }
    }
    expect(befunde).toEqual([]);
  });

  it("is deterministic and leaves its input as it was", () => {
    const before = structuredClone(GESETZT);
    const a = serializeBildo(fallDe(GESETZT, { warning: "primaer" }).bildo);
    const b = serializeBildo(fallDe(GESETZT, { warning: "primaer" }).bildo);
    expect(a).toBe(b);
    expect(GESETZT).toEqual(before);
  });
});

// Spec 055 (T1): the describe „ARANGXO_054 – fixed places from the mockup“ (phases without overlap,
// nodes inside their phase) is gone with the phases; grafeo-anordnung-055 checks ARANGXO_055.
describe("Spec 054 T1: poziciojKun – places in the session (AK-15 pure)", () => {
  const ids = (m: ReadonlyMap<string, Pozicio>) => [...m.keys()].sort();
  const start = (id: keyof typeof ARANGXO_055.nodoj) => ({
    x: ARANGXO_055.nodoj[id].x,
    y: ARANGXO_055.nodoj[id].y,
  });

  it("without moves gives every node its start place (Spec 055: absolute)", () => {
    const { bildo } = fall("FARBIG");
    const pozicioj = poziciojKun(new Map(), bildo.nodoj);
    expect(ids(pozicioj)).toEqual(bildo.nodoj.map((n) => n.id).sort());
    expect(pozicioj.get("marko")).toEqual(start("marko"));
    expect(pozicioj.get("farbo-warning")).toEqual(start("farbo-warning"));
  });

  it("places the Funktionsfarben below Neutral in the order Erfolg, Warnung, Fehler, Hinweis", () => {
    const pozicioj = poziciojKun(new Map(), fall("ALLE").bildo.nodoj);
    const ys = ["success", "warning", "danger", "info"].map(
      (r) => pozicioj.get(`farbo-${r}`)?.y ?? Number.NaN,
    );
    expect([...ys].sort((a, b) => a - b)).toEqual(ys);
    const neutral = pozicioj.get("farbo-neutral")?.y ?? Number.POSITIVE_INFINITY;
    expect(ys[0]).toBeGreaterThan(neutral);
    // Spec 055: every Funktionsfarbe has its own place; Hinweis alone keeps it.
    const nur = poziciojKun(new Map(), [{ id: "farbo-info" }]);
    expect(nur.get("farbo-info")).toEqual(start("farbo-info"));
  });

  it("keeps a moved node in place over a new Bildo and gives a new node its start place", () => {
    const verschoben = new Map<string, Pozicio>([["marko", { x: 5, y: 700 }]]);
    const vorher = poziciojKun(verschoben, fall("LEER").bildo.nodoj);
    const nachher = poziciojKun(verschoben, fall("FARBIG").bildo.nodoj);
    expect(vorher.get("marko")).toEqual({ x: 5, y: 700 });
    expect(nachher.get("marko")).toEqual({ x: 5, y: 700 });
    expect(nachher.get("farbo-warning")).toEqual(start("farbo-warning"));
    expect(nachher.get("farbo-primaer")).toEqual(vorher.get("farbo-primaer"));
  });

  it("drops entries for nodes that no longer exist", () => {
    const verschoben = new Map<string, Pozicio>([
      ["fazo-4", { x: 1, y: 2 }],
      ["vorschau-7", { x: 3, y: 4 }],
    ]);
    const pozicioj = poziciojKun(verschoben, fall("LEER").bildo.nodoj);
    expect(pozicioj.has("fazo-4")).toBe(false);
    expect(pozicioj.has("vorschau-7")).toBe(false);
    expect(ids(pozicioj)).toEqual(
      fall("LEER")
        .bildo.nodoj.map((n) => n.id)
        .sort(),
    );
  });

  it("places further previews in the slots below the fixed ones (Spec 055)", () => {
    const nodoj = [...fall("LEER").bildo.nodoj, { id: "vorschau-3" }, { id: "vorschau-4" }];
    const pozicioj = poziciojKun(new Map(), nodoj);
    const { x, y, dy } = ARANGXO_055.weitereVorschauen;
    expect(pozicioj.get("vorschau-3")).toEqual({ x, y });
    expect(pozicioj.get("vorschau-4")).toEqual({ x, y: y + dy });
    const hell = pozicioj.get("vorschau-hell");
    const dunkel = pozicioj.get("vorschau-dunkel");
    expect(hell?.x).toBe(ARANGXO_055.nodoj["vorschau-hell"].x);
    expect((dunkel?.y ?? 0) > (hell?.y ?? 0)).toBe(true);
  });
});

describe("Spec 054 T1: grafeo-gestalten-sicht.ts stays free of imports (browser bundle)", () => {
  it("has no import statement and no dynamic import", () => {
    const teksto = readFileSync(new URL("./grafeo-gestalten-sicht.ts", import.meta.url), "utf8");
    const linioj = teksto
      .split("\n")
      .filter(
        (linio) =>
          /^\s*(import|export\s+[^(]*\bfrom\b)/.test(linio) ||
          /\b(import|require)\s*\(/.test(linio),
      );
    expect(linioj).toEqual([]);
  });

  it("maps every row to its derived palette", () => {
    expect(ROLO_PALETRO).toEqual({
      neutral: "neutral",
      primaer: "accent",
      akzent: "sekundo",
      success: "success",
      warning: "warning",
      danger: "danger",
      info: "info",
    });
  });
});
