// Spec 053 (LA-3.1): the stored model-free re-evaluation of M-1 with the tightened `label-required`
// (specs/053-leere-aktion/daten/neubewertung/m1, written by neubewertung.mjs, LA-2.2), guarded in
// CI so it cannot drift from the code:
//
// - AC-17: the green decision of the stored data – F 0 of 4 with `malhelpoj` exactly
//   ["check_usage"] (Spec 052: 4 of 4), 0 still 0 of 4 with the reasons of Spec 052.
// - AC-8, AC-16 (drift guard): the stored `malobservoj` are what the current Gvidanto gives on the
//   unchanged specs/050-mvp-probelauf/daten/m1/<v>/<slug>/fragmento.html (M-1 path: the server in
//   the process and ekranoj's check_markup client, as in ac8.test.ts); the 052 findings stay and
//   the only additions are label-required errors on the empty actions.
// - AC-19: a text guard that neubewertung.mjs imports nothing but node:* and the dist of modelo,
//   ekranoj and nordstelo (same idea as the text guards of k8.test.ts and soloj.test.ts).
//
// Every screen and every count comes from the stored data; nothing is written.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  decidiVerdon,
  type Fakto,
  type Malhelpo,
  type Malobservo,
  uzKontroliloDe,
  type VerdaEnigo,
} from "@fundamento/ekranoj";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { stabilaJson } from "./ablauf/raporto.js";
import { connectGvidanto, type Gvidanto } from "./gvidanto.js";

const QUELLE = fileURLToPath(
  new URL("../../../specs/050-mvp-probelauf/daten/m1/", import.meta.url),
);
const BASIS = fileURLToPath(
  new URL("../../../specs/052-k8-interspacoj/daten/neubewertung/m1/", import.meta.url),
);
const NEU = fileURLToPath(
  new URL("../../../specs/053-leere-aktion/daten/neubewertung/m1/", import.meta.url),
);
const SKRIPTO = fileURLToPath(
  new URL("../../../specs/053-leere-aktion/neubewertung.mjs", import.meta.url),
);

const RULE = "label-required";
const VARIANTOJ = ["F", "0"] as const;
type Varianto = (typeof VARIANTOJ)[number];

/** A stored screen as specs/050-mvp-probelauf/pruefen.mjs reads it (DatenFakto). */
interface DatenFakto {
  zelle: string;
  varianto: Varianto;
  slug: string;
  runde: number;
  verdaEkde: number | null;
  gespeichert: { verda: boolean };
  /** Stored screens always carry the facts of their render. */
  enigo: VerdaEnigo & { fakto: Fakto };
  zusatz: string[];
}

interface Ekrano {
  varianto: Varianto;
  slug: string;
  fragmento: string;
  malnova: DatenFakto;
  nova: DatenFakto;
}

const legi = (file: string): DatenFakto => JSON.parse(readFileSync(file, "utf8")) as DatenFakto;

/** The screens of M-1: every <v>/<slug> of 050 with a fragmento.html, in name order. */
const ekranoj: Ekrano[] = VARIANTOJ.flatMap((varianto) => {
  const dir = join(QUELLE, varianto);
  return readdirSync(dir)
    .filter((slug) => existsSync(join(dir, slug, "fragmento.html")))
    .sort()
    .map((slug) => ({
      varianto,
      slug,
      fragmento: readFileSync(join(dir, slug, "fragmento.html"), "utf8"),
      malnova: legi(join(BASIS, varianto, slug, "fakto.json")),
      nova: legi(join(NEU, varianto, slug, "fakto.json")),
    }));
});
const de = (varianto: Varianto) => ekranoj.filter((ekrano) => ekrano.varianto === varianto);

/** Green as in Spec 052 and neubewertung.mjs: decidiVerdon and no zusatz. */
function verdeco(f: DatenFakto): { verda: boolean; malhelpoj: (Malhelpo | string)[] } {
  const decido = decidiVerdon(f.enigo);
  return {
    verda: decido.verda && f.zusatz.length === 0,
    malhelpoj: [...f.zusatz, ...decido.malhelpoj],
  };
}

/** The stored files are written with stabilaJson (sorted keys); compare in that form. */
const json = (value: unknown) => stabilaJson(value);
const novajTrovoj = (ekrano: Ekrano): Malobservo[] => {
  const malnovaj = new Set(ekrano.malnova.enigo.malobservoj.map(json));
  return ekrano.nova.enigo.malobservoj.filter((m) => !malnovaj.has(json(m)));
};

describe("the stored re-evaluation of M-1 covers every screen (AC-17)", () => {
  it("holds one stored screen per fragmento.html of M-1, both variants, and nothing else", () => {
    expect(de("F").length).toBeGreaterThan(0);
    expect(de("0").map((e) => e.slug)).toEqual(de("F").map((e) => e.slug));
    for (const varianto of VARIANTOJ) {
      const stored = readdirSync(join(NEU, varianto))
        .filter((slug) => existsSync(join(NEU, varianto, slug, "fakto.json")))
        .sort();
      expect(stored, varianto).toEqual(de(varianto).map((e) => e.slug));
    }
    for (const { varianto, slug, nova } of ekranoj) {
      expect([nova.zelle, nova.varianto, nova.slug], `${varianto}/${slug}`).toEqual([
        "m1",
        varianto,
        slug,
      ]);
    }
  });
});

describe("green after the tightening (AC-17)", () => {
  it("F: was green on every screen in Spec 052, is green on none now, kept back only by check_usage", () => {
    const f = de("F");
    expect(f.filter((e) => verdeco(e.malnova).verda).length).toBe(f.length);
    const nun = f.map((e) => ({ slug: e.slug, ...verdeco(e.nova) }));
    expect(nun.filter((e) => e.verda)).toEqual([]);
    for (const e of nun) expect(e.malhelpoj, e.slug).toEqual(["check_usage"]);
  });

  it("0: green on none, with the reasons of Spec 052 (its green rule does not read check_usage)", () => {
    for (const e of de("0")) {
      const nun = verdeco(e.nova);
      expect(nun.verda, e.slug).toBe(false);
      expect(nun.malhelpoj, e.slug).toEqual(verdeco(e.malnova).malhelpoj);
      expect(nun.malhelpoj, e.slug).not.toContain("check_usage");
    }
  });

  it("stores the decision it computes: gespeichert.verda and verdaEkde agree with decidiVerdon", () => {
    for (const { varianto, slug, nova } of ekranoj) {
      const { verda } = verdeco(nova);
      expect(nova.gespeichert.verda, `${varianto}/${slug}`).toBe(verda);
      expect(nova.verdaEkde, `${varianto}/${slug}`).toBe(verda ? nova.runde : null);
    }
  });

  it("changes nothing but malobservoj and the score: fakto, kompleta and zusatz are those of 052", () => {
    for (const { varianto, slug, malnova, nova } of ekranoj) {
      const kie = `${varianto}/${slug}`;
      expect(json(nova.enigo.fakto), kie).toBe(json(malnova.enigo.fakto));
      expect(nova.enigo.kompleta, kie).toBe(malnova.enigo.kompleta);
      expect(nova.zusatz, kie).toEqual(malnova.zusatz);
      expect(nova.runde, kie).toBe(malnova.runde);
    }
  });
});

describe("the findings of the stored data (AC-8)", () => {
  it("keeps every finding of 052 and adds only label-required errors", () => {
    for (const ekrano of ekranoj) {
      const nunaj = ekrano.nova.enigo.malobservoj.map(json);
      for (const m of ekrano.malnova.enigo.malobservoj)
        expect(nunaj, `${ekrano.varianto}/${ekrano.slug}`).toContain(json(m));
      for (const m of novajTrovoj(ekrano))
        expect([m.rule, m.severity ?? "error"], `${ekrano.varianto}/${ekrano.slug}`).toEqual([
          RULE,
          "error",
        ]);
    }
  });

  it("F: label-required on the empty brand link of every screen and the empty submit buttons", () => {
    const trovoj = Object.fromEntries(
      de("F").map((e) => [
        e.slug,
        e.nova.enigo.malobservoj.filter((m) => m.rule === RULE).map((m) => m.loko),
      ]),
    );
    expect(trovoj).toEqual({
      anmelden: ["fm-ligilo", "fm-butono"],
      konto: ["fm-ligilo"],
      "passwort-vergessen": ["fm-ligilo"],
      registrieren: ["fm-ligilo", "fm-butono"],
    });
    for (const e of de("F"))
      for (const m of e.nova.enigo.malobservoj.filter((x) => x.rule === RULE))
        expect(m.message, e.slug).toMatch(
          /^Instance \d+ of (butono|ligilo) has only the label prop /,
        );
  });

  it("keeps the label-names-action warnings of 052 byte-identical", () => {
    for (const { varianto, slug, malnova, nova } of ekranoj) {
      const nomoj = (f: DatenFakto) =>
        f.enigo.malobservoj.filter((m) => m.rule === "label-names-action").map(json);
      expect(nomoj(nova), `${varianto}/${slug}`).toEqual(nomoj(malnova));
    }
  });
});

describe("the stored malobservoj are what the current Gvidanto gives (drift guard, AC-8, AC-16)", () => {
  let gvidanto: Gvidanto;

  beforeAll(async () => {
    gvidanto = await connectGvidanto();
  });

  afterAll(async () => {
    await gvidanto.close();
  });

  it("check_markup on every unchanged fragmento.html of M-1 gives the stored malobservoj", async () => {
    const kontrolilo = uzKontroliloDe(gvidanto.bridge, await gvidanto.bridge.list());
    expect(kontrolilo.vojo).toBe("check_markup");
    const abweichungen: string[] = [];
    for (const { varianto, slug, fragmento, nova } of ekranoj) {
      const { malobservoj } = await kontrolilo.kontroli({ fakto: nova.enigo.fakto, fragmento });
      if (json(malobservoj) !== json(nova.enigo.malobservoj))
        abweichungen.push(`${varianto}/${slug}: ${json(malobservoj)}`);
    }
    expect(ekranoj.length).toBeGreaterThan(0);
    expect(abweichungen).toEqual([]);
  });
});

describe("neubewertung.mjs runs no model (AC-19, text guard)", () => {
  const teksto = readFileSync(SKRIPTO, "utf8");
  const kodo = teksto.replace(/^\s*\/\/.*$/gm, "");

  it("imports statically only node:* modules", () => {
    const statikaj = [...kodo.matchAll(/^import\b[^;]*?\bfrom\s*"([^"]+)"/gm)].map((m) => m[1]);
    const nudaj = [...kodo.matchAll(/^import\s*"([^"]+)"/gm)].map((m) => m[1]);
    expect(statikaj.length).toBeGreaterThan(0);
    expect([...statikaj, ...nudaj].filter((s) => !s?.startsWith("node:"))).toEqual([]);
  });

  it("imports at run time only the dist of modelo, ekranoj and nordstelo, through one helper", () => {
    // The one dynamic import sits in the helper `dist`, which resolves a path in the checkout.
    expect([...kodo.matchAll(/\bimport\s*\(/g)].length).toBe(1);
    expect(kodo).toMatch(
      /const dist = \(rel\) => \{[\s\S]{0,300}?return import\(pathToFileURL\(file\)\.href\);\s*\};/,
    );
    const celoj = [...kodo.matchAll(/\bdist\(\s*([^)]*)\)/g)].map((m) => m[1]?.trim());
    expect(celoj.length).toBeGreaterThan(0);
    const fremdaj = celoj.filter(
      (celo) => !/^"packages\/(modelo|ekranoj|nordstelo)\/dist\/[\w/.-]+\.js"$/.test(celo ?? ""),
    );
    expect(fremdaj).toEqual([]);
  });

  it("neither requires, fetches nor names a model provider", () => {
    expect(kodo).not.toMatch(/\brequire\s*\(|\bcreateRequire\b|\bfetch\s*\(|https?:\/\//);
    expect(kodo).not.toMatch(/anthropic|openai|mistral|gemini|ollama/i);
  });
});
