// Spec 054 (MP-1, T5, MPFG-3.2): the palette of the view Gestalten against what the brand really
// renders. A step set by hand for light, for dark or both shows in both preview stylesheets
// (`vorschau.css`, the light main set and the dark block of the brand) exactly as the Bildo of
// `/api/leinwand` draws it: `hex` light, `hexDunkel` only where dark differs (R-1, AK-24). „↺“
// (`wert: null`) gives a step back to the derivation for one scheme only (AK-11, AK-24). Every row fed
// by a colour node names its Basis, which is one of its steps, and the node's own colour (AK-25).
//
// Steps are set through the canvas's write path `POST /api/marko/:name/leinwand` (MPFG-3.1). While
// that route is missing (it answers 404 for a brand that exists), the same change is written as a
// draft fixture under a fresh name, the way the write path would store it (tech spec, step 4), so
// R-1 and the Basis stay testable; the tests that only the route can prove (null after a value) are
// marked and run once the route is there. Expectations come from the server's own answers, never
// from pinned hex values; fixtures are invented brands and the bases `leer` and `komuna`.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Agordo } from "@fundamento/agordilo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Bildo, BildoPaletro, Schema, Vico } from "./grafeo-gestalten-sicht.js";
import { provoAgordo } from "./test-doubles/grafeo-047.js";
import { type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { type Bases, loadBases, startAgordo } from "./vorschau.js";

/** A DTCG sRGB colour as `colourWert` in servilo.ts writes it (D-4: every stored step is one). */
function dtcg(hex: string): { colorSpace: "srgb"; components: number[]; hex: string } {
  const components = [1, 3, 5].map(
    (index) =>
      Math.round((Number.parseInt(hex.slice(index, index + 2), 16) / 255) * 10_000) / 10_000,
  );
  return { colorSpace: "srgb", components, hex };
}

/** One change of the step popover, as the canvas sends it. */
interface Stufe {
  token: string;
  wert: string | null;
  schema?: Schema;
}

type Festgelegt = Record<
  string,
  { wert?: unknown; alias?: unknown; modoj?: Record<string, { wert?: unknown }> }
>;

/** The write path's step semantics (tech spec, step 4), for the fixture fallback only. */
function mitStufe(agordo: Agordo, s: Stufe): Agordo {
  const festgelegt: Festgelegt = structuredClone((agordo.festgelegt ?? {}) as Festgelegt);
  const eintrag = { ...(festgelegt[s.token] ?? {}) };
  if ((s.schema ?? "hell") === "hell") {
    if (s.wert === null) {
      delete eintrag.wert;
      delete eintrag.alias;
    } else eintrag.wert = dtcg(s.wert);
  } else {
    const modoj = { ...(eintrag.modoj ?? {}) };
    if (s.wert === null) delete modoj["color-scheme=dark"];
    else modoj["color-scheme=dark"] = { wert: dtcg(s.wert) };
    if (Object.keys(modoj).length === 0) delete eintrag.modoj;
    else eintrag.modoj = modoj;
  }
  if (Object.keys(eintrag).length === 0) delete festgelegt[s.token];
  else festgelegt[s.token] = eintrag;
  const next = { ...agordo, festgelegt } as Agordo;
  if (Object.keys(festgelegt).length === 0) delete (next as { festgelegt?: unknown }).festgelegt;
  return next;
}

const token = (paletro: string, stufo: string): string => `color.palette.${paletro}.${stufo}`;
const cssName = (tokeno: string): string => `--fm-${tokeno.replaceAll(".", "-")}`;

/** The declarations of every block whose selector is exactly `selector`, in source order. */
function deklaroj(css: string, selector: string): Map<string, string> {
  const out = new Map<string, string>();
  const re = /([^{}]+)\{([^{}]*)\}/g;
  for (let m = re.exec(css); m !== null; m = re.exec(css)) {
    if ((m[1] ?? "").replace(/\/\*[\s\S]*?\*\//g, "").trim() !== selector) continue;
    for (const linio of (m[2] ?? "").split(";")) {
      const dupunkto = linio.indexOf(":");
      if (dupunkto < 0) continue;
      out.set(linio.slice(0, dupunkto).trim(), linio.slice(dupunkto + 1).trim());
    }
  }
  return out;
}

/** The value of a custom property as the brand renders it in one scheme (var() resolved). */
function valoro(
  css: string,
  aspekto: string,
  skemo: "light" | "dark",
): (nomo: string) => string | undefined {
  const cxefa = deklaroj(css, `:where(:root[data-fm-aspekto="${aspekto}"])`);
  const malhela = deklaroj(
    css,
    `:where(:root[data-fm-aspekto="${aspekto}"][data-fm-color-scheme="dark"])`,
  );
  const legi = (nomo: string, profundo: number): string | undefined => {
    const v = (skemo === "dark" ? malhela.get(nomo) : undefined) ?? cxefa.get(nomo);
    if (v === undefined || profundo > 8) return v;
    const ref = /^var\((--[a-z0-9-]+)\)$/.exec(v)?.[1];
    return ref === undefined ? v.toLowerCase() : legi(ref, profundo + 1);
  };
  return (nomo) => legi(nomo, 0);
}

const paletroDe = (bildo: Bildo): BildoPaletro => {
  const p = bildo.nodoj.find((n) => n.speco === "paletro");
  if (p === undefined || p.speco !== "paletro") throw new Error("no palette node");
  return p;
};
const vicoDe = (bildo: Bildo, rolo: Vico["rolo"]): Vico => {
  const v = paletroDe(bildo).vicoj.find((x) => x.rolo === rolo);
  if (v === undefined) throw new Error(`no row ${rolo}`);
  return v;
};

let server: TestServilo;
let bases: Bases;
/** Whether the write path of the canvas answers (MPFG-3.1 landed); decided by the first write. */
let skribvojo: boolean | undefined;

function dosieroSkribi(name: string, agordo: Agordo): void {
  const dir = join(server.workdir, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "agordo.json"), `${JSON.stringify({ ...agordo, name }, null, 2)}\n`);
}

/**
 * A brand `name` from `basis`, with `sxangxoj` applied: through the write path when it exists,
 * else as a draft fixture under `name-f` (the first brand is then never read again). Returns the
 * name to ask the server for.
 */
async function markeMit(name: string, basis: Agordo, sxangxoj: readonly Stufe[]): Promise<string> {
  dosieroSkribi(name, basis);
  for (const stufe of sxangxoj) {
    const antwort = await server.anfrage(
      "POST",
      `/api/marko/${name}/leinwand`,
      JSON.stringify({ stufe }),
    );
    if (antwort.status === 404 && skribvojo !== true) {
      skribvojo = false;
      break;
    }
    skribvojo = true;
    expect(antwort.status, `${name} ${JSON.stringify(stufe)}`).toBe(200);
  }
  if (skribvojo !== false || sxangxoj.length === 0) return name;
  const fiksa = `${name}-f`;
  dosieroSkribi(fiksa, sxangxoj.reduce(mitStufe, { ...basis, name: fiksa }));
  return fiksa;
}

async function bildoDe(name: string): Promise<Bildo> {
  const antwort = await server.anfrage("GET", `/api/leinwand?marko=${name}`);
  expect(antwort.status, `/api/leinwand ${name}`).toBe(200);
  return JSON.parse(antwort.body.toString("utf8")) as Bildo;
}

/** Both stylesheets the previews load (`scheme` light and dark), read for one scheme each. */
async function stilojDe(name: string, rev: number) {
  const legi = async (skemo: "light" | "dark") => {
    const antwort = await server.anfrage(
      "GET",
      `/marko/${name}/vorschau.css?rev=${rev}&scheme=${skemo}`,
    );
    expect(antwort.status).toBe(200);
    return valoro(antwort.body.toString("utf8"), name, skemo);
  };
  return { hell: await legi("light"), dunkel: await legi("dark") };
}

/**
 * The R-1 sweep: every step of every row in the Bildo against both stylesheets. Light = `hex`;
 * dark = `hexDunkel` when present, else `hex`; and `hexDunkel` is never equal to `hex`.
 */
async function sweep(name: string): Promise<{ bildo: Bildo; violations: string[] }> {
  const bildo = await bildoDe(name);
  const stiloj = await stilojDe(name, bildo.rev);
  const violations: string[] = [];
  for (const vico of paletroDe(bildo).vicoj) {
    for (const s of vico.stufoj) {
      const nomo = cssName(s.tokeno);
      const hell = stiloj.hell(nomo);
      const dunkel = stiloj.dunkel(nomo);
      if (hell !== s.hex.toLowerCase())
        violations.push(`${name} ${s.tokeno} hell ${hell} ≠ ${s.hex}`);
      const erwartet = (s.hexDunkel ?? s.hex).toLowerCase();
      if (dunkel !== erwartet)
        violations.push(`${name} ${s.tokeno} dunkel ${dunkel} ≠ ${erwartet}`);
      if (s.hexDunkel !== undefined && s.hexDunkel.toLowerCase() === s.hex.toLowerCase())
        violations.push(`${name} ${s.tokeno} split without a difference`);
    }
  }
  return { bildo, violations };
}

const stufoDe = (bildo: Bildo, paletro: string, stufo: string) => {
  const s = paletroDe(bildo)
    .vicoj.flatMap((v) => v.stufoj)
    .find((x) => x.tokeno === token(paletro, stufo));
  if (s === undefined) throw new Error(`no step ${paletro}.${stufo}`);
  return s;
};

beforeAll(async () => {
  bases = loadBases();
  server = await testServilo("grafeo-paletro-054-", { leinwand: null, ekzemploDir: null });
});

afterAll(async () => {
  await server?.close();
});

describe("Spec 054 T5: what the palette draws is what the brand renders, light and dark (R-1)", () => {
  it("draws every step of leer, komuna and provo as both stylesheets carry it; nothing set by hand", async () => {
    const violations: string[] = [];
    const geteilt: string[] = [];
    for (const [name, agordo] of [
      ["palo-leer", startAgordo("palo-leer", "leer", bases)],
      ["palo-komuna", startAgordo("palo-komuna", "komuna", bases)],
      ["palo-provo", { ...provoAgordo(), name: "palo-provo" }],
    ] as const) {
      dosieroSkribi(name, agordo);
      const r = await sweep(name);
      violations.push(...r.violations);
      for (const vico of paletroDe(r.bildo).vicoj)
        for (const s of vico.stufoj) {
          if (s.gesetzt || s.gesetztDunkel) violations.push(`${name} ${s.tokeno} pinned`);
          if (s.hexDunkel !== undefined) geteilt.push(`${name} ${s.tokeno}`);
        }
    }
    expect(violations).toEqual([]);
    // B-5 (confirmed): without a value by hand no step of these brands is split. The structure's
    // own dark value of neutral.950 derives to the light hex (agordilo package.ts:175, palettes.ts:373).
    expect(geteilt).toEqual([]);
  });

  it("a light value by hand holds in both schemes and pins only the light side", async () => {
    const name = await markeMit("palo-hell", startAgordo("palo-hell", "leer", bases), [
      { token: token("accent", "500"), wert: "#d7263d" },
    ]);
    const { bildo, violations } = await sweep(name);
    expect(violations).toEqual([]);
    const s = stufoDe(bildo, "accent", "500");
    expect({
      hex: s.hex,
      gesetzt: s.gesetzt,
      hexDunkel: s.hexDunkel,
      dunkel: s.gesetztDunkel,
    }).toEqual({ hex: "#d7263d", gesetzt: true, hexDunkel: undefined, dunkel: false });
  });

  it("a light value on neutral.950 – the step the structure sets for dark – leaves dark derived: split", async () => {
    const vorher = await bildoDe(
      await markeMit("palo-nigra-ref", startAgordo("palo-nigra-ref", "komuna", bases), []),
    );
    const name = await markeMit("palo-nigra", startAgordo("palo-nigra", "komuna", bases), [
      { token: token("neutral", "950"), wert: "#102030" },
    ]);
    const { bildo, violations } = await sweep(name);
    expect(violations).toEqual([]);
    const s = stufoDe(bildo, "neutral", "950");
    // R-1: the structure's own dark value of this step stays (it derives to the old light hex).
    expect({
      hex: s.hex,
      gesetzt: s.gesetzt,
      hexDunkel: s.hexDunkel,
      dunkel: s.gesetztDunkel,
    }).toEqual({
      hex: "#102030",
      gesetzt: true,
      hexDunkel: stufoDe(vorher, "neutral", "950").hex,
      dunkel: false,
    });
  });

  it("a dark value by hand splits the step and leaves light derived (AK-24)", async () => {
    const vorher = await bildoDe(
      await markeMit("palo-ref", startAgordo("palo-ref", "leer", bases), []),
    );
    const name = await markeMit("palo-dunkel", startAgordo("palo-dunkel", "leer", bases), [
      { token: token("success", "300"), wert: "#123456", schema: "dunkel" },
    ]);
    const { bildo, violations } = await sweep(name);
    expect(violations).toEqual([]);
    const s = stufoDe(bildo, "success", "300");
    expect({
      hex: s.hex,
      gesetzt: s.gesetzt,
      hexDunkel: s.hexDunkel,
      dunkel: s.gesetztDunkel,
    }).toEqual({
      hex: stufoDe(vorher, "success", "300").hex,
      gesetzt: false,
      hexDunkel: "#123456",
      dunkel: true,
    });
  });

  it("light and dark by hand on the Basis: both pins, split, and still the Basis (edge case)", async () => {
    const basis: Agordo = {
      ...startAgordo("palo-beide", "leer", bases),
      leitfarbe: "#f5c400",
    };
    const name = await markeMit("palo-beide", basis, [
      { token: token("accent", "700"), wert: "#f5c400", schema: "hell" },
      { token: token("accent", "700"), wert: "#3a2f00", schema: "dunkel" },
    ]);
    const { bildo, violations } = await sweep(name);
    expect(violations).toEqual([]);
    const vico = vicoDe(bildo, "primaer");
    const s = stufoDe(bildo, "accent", "700");
    expect({
      basis: vico.basis,
      hex: s.hex,
      hexDunkel: s.hexDunkel,
      gesetzt: s.gesetzt,
      dunkel: s.gesetztDunkel,
    }).toEqual({ basis: "700", hex: "#f5c400", hexDunkel: "#3a2f00", gesetzt: true, dunkel: true });
  });
});

describe("Spec 054 T5: back to the derivation, per scheme (AK-11, AK-24; needs the write path)", () => {
  it("„↺“ for dark removes only the dark value, „↺“ for light only the light one", async ({
    skip,
  }) => {
    const ref = await bildoDe(
      await markeMit("palo-zurueck-ref", startAgordo("palo-zurueck-ref", "leer", bases), []),
    );
    const name = await markeMit("palo-zurueck", startAgordo("palo-zurueck", "leer", bases), [
      { token: token("info", "400"), wert: "#204080", schema: "hell" },
      { token: token("info", "400"), wert: "#a0c0ff", schema: "dunkel" },
    ]);
    if (skribvojo !== true) skip("the write path POST /api/marko/:name/leinwand is not there yet");
    const post = async (stufe: Stufe) =>
      (await server.anfrage("POST", `/api/marko/${name}/leinwand`, JSON.stringify({ stufe })))
        .status;

    expect(await post({ token: token("info", "400"), wert: null, schema: "dunkel" })).toBe(200);
    const nurHell = await sweep(name);
    expect(nurHell.violations).toEqual([]);
    const a = stufoDe(nurHell.bildo, "info", "400");
    expect({
      hex: a.hex,
      gesetzt: a.gesetzt,
      hexDunkel: a.hexDunkel,
      dunkel: a.gesetztDunkel,
    }).toEqual({ hex: "#204080", gesetzt: true, hexDunkel: undefined, dunkel: false });

    expect(await post({ token: token("info", "400"), wert: null, schema: "hell" })).toBe(200);
    const zurueck = await sweep(name);
    expect(zurueck.violations).toEqual([]);
    const b = stufoDe(zurueck.bildo, "info", "400");
    const r = stufoDe(ref, "info", "400");
    expect({
      hex: b.hex,
      gesetzt: b.gesetzt,
      hexDunkel: b.hexDunkel,
      dunkel: b.gesetztDunkel,
    }).toEqual({ hex: r.hex, gesetzt: false, hexDunkel: r.hexDunkel, dunkel: false });
  });

  it("an unreadable step value writes nothing (422 with the calm sentence)", async ({ skip }) => {
    const name = await markeMit("palo-nelegebla", startAgordo("palo-nelegebla", "leer", bases), [
      { token: token("accent", "300"), wert: "#336699" },
    ]);
    if (skribvojo !== true) skip("the write path POST /api/marko/:name/leinwand is not there yet");
    const vorher = await bildoDe(name);
    const antwort = await server.anfrage(
      "POST",
      `/api/marko/${name}/leinwand`,
      JSON.stringify({ stufe: { token: token("accent", "300"), wert: "blau", schema: "dunkel" } }),
    );
    expect(antwort.status).toBe(422);
    const korpo = JSON.parse(antwort.body.toString("utf8")) as { feld?: string; satz?: string };
    expect(korpo.feld).toBe(`stufe.${token("accent", "300")}`);
    expect(await bildoDe(name)).toEqual(vorher);
  });
});

describe("Spec 054 T5: the Basis on the real /api/leinwand (AK-25)", () => {
  it("names the Basis and the node colour for Primär, Akzent and a Funktionsfarbe, none elsewhere", async () => {
    const agordo: Agordo = {
      ...startAgordo("palo-basis", "leer", bases),
      leitfarbe: "#f5c400",
      zweitfarbe: { farbe: "#c6f135" },
      zusatzfarben: { warning: "#d99a00" },
    };
    dosieroSkribi("palo-basis", agordo);
    const bildo = await bildoDe("palo-basis");
    const vicoj = paletroDe(bildo).vicoj;
    const kunBasis = vicoj
      .filter((v) => v.basis !== undefined)
      .map((v) => ({
        rolo: v.rolo,
        basis: v.basis,
        fontoHex: v.fontoHex,
        // Exactly one framed step: the Basis is one of the row's steps.
        kadroj: v.stufoj.filter((s) => s.stufo === v.basis).length,
      }));
    expect(kunBasis).toEqual([
      { rolo: "primaer", basis: "700", fontoHex: "#f5c400", kadroj: 1 },
      { rolo: "akzent", basis: "700", fontoHex: "#c6f135", kadroj: 1 },
      { rolo: "warning", basis: "600", fontoHex: "#d99a00", kadroj: 1 },
    ]);
    // The node's colour is the one the Farbe node shows (what „Farbe aus dem Knoten“ fills in).
    const knoten = Object.fromEntries(
      bildo.nodoj.flatMap((n) => (n.speco === "farbo" ? [[n.rolo, n.wert ?? n.hex] as const] : [])),
    );
    expect(kunBasis.map((v) => [v.rolo, v.fontoHex])).toEqual(
      kunBasis.map((v) => [v.rolo, knoten[v.rolo]]),
    );
    const ohne = vicoj.filter((v) => v.basis === undefined).map((v) => v.rolo);
    expect(ohne).toEqual(["neutral", "success", "danger", "info"]);
  });
});
