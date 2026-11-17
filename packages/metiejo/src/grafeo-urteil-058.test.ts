// Spec 058 (MP-2c, T10, MAW-5.1, AK-8, plan §2 item 10): no judgement in Gestalten along this spec.
// One session over HTTP through every route of this spec – the brand list, a new brand for the
// canvas, the canvas data with the 058 switch, the price of the three purposes, the three KI routes
// (readable, with a provider error, unreadable, partly unreadable; and without a model), the
// Layout-Beispiel (upload, an unreadable file, removal), the Pinterest preview, the name write, every
// preview page in the three layouts light and dark and „Komponenten“, Stände – and the sentence
// constants of this spec and the sources of its canvas files carry no rule's name, id, statement or
// kialo, no problem count and no mark of a report (the word list of `grafeo-urteil-056`). „Vorschlag“
// is left out of that list here: product spec D/E name the KI's proposal („Vorschlagen“,
// „Gestaltungsvorschlag“, „Vorschlag übernehmen“), it is no rule's word. A control proves the
// search can fail.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { LeinwandAntwort, LeinwandStato, Zweck } from "./grafeo-gestalten-sicht.js";
import * as sicht from "./grafeo-gestalten-sicht.js";
import {
  BRETT_058,
  type KiServilo058,
  kiServilo058,
  LAYOUT_PNG_058,
  markeMitAllem,
  senden,
  TEILWEISE_058,
} from "./test-doubles/ki-058.js";
import { loadBases } from "./vorschau.js";
import { MARKE_NEUTRAL } from "./vorschau-marke.js";

/** Every Regulo's name, id, statement and kialo, and the marks of a report (as grafeo-urteil-056). */
function urteilsWoerter(): string[] {
  const modelo = buildModelo(loadBases().structure.files).modelo;
  return [
    ...modelo.reguloj
      .flatMap((r) => [r.name, r.id, r.statement, r.kialo])
      .filter((wort): wort is string => typeof wort === "string" && wort !== ""),
    "nicht exportierbar",
    "nr-ne-eksportebla",
    "mt-pruefung",
    "data-mt-pruefung",
    "mt-probleme",
    "Problem",
    "Prüfung",
    "Betroffen",
    "probleme",
    "betroffen",
    "raporto",
  ];
}

/** The sentence constants of this spec (plan, MAW-1.1 „Sätze und Wörter“), flattened. */
function saetze058(): string[] {
  const out: string[] = [];
  const iri = (wert: unknown): void => {
    if (typeof wert === "string") out.push(wert);
    else if (Array.isArray(wert)) for (const w of wert) iri(w);
    else if (typeof wert === "object" && wert !== null) for (const w of Object.values(wert)) iri(w);
  };
  const namen = new Set<string>([
    "ETIKEDOJ_058",
    "GRUNDLAGEN_ETIKEDOJ",
    "GRUNDLAGEN_HINWEIS",
    "VORSCHLAGEN",
    "MARKE_AUSWERTEN",
    "AUFBAU_ERKENNEN",
    "NEU",
    "UEBERNEHMEN",
    "UEBERNOMMEN",
    "VORSCHLAG_UEBERNEHMEN",
    "VERALTET",
    "KI_LAEUFT",
    "KEIN_SPRACHMODELL_SATZ",
    "KEINE_EINGABE_SATZ",
    "KI_NICHT_GEANTWORTET_SATZ",
    "KI_UNLESBAR_SATZ",
    "KI_TEILWEISE_SATZ",
    "KEINE_BILDER_SATZ",
    "STAND_FEHLT_SATZ",
    "NAME_FREI_SATZ",
    "ENTWURF_UNGEPRUEFT",
    "GESTALTUNGSVORSCHLAG",
    "MARKENPROFIL_EINZELHEITEN",
    "WORAUS_ES_ENTSTAND",
    "NOCH_NICHT_AUSGEWERTET_SATZ",
    "BILD_GEHT_SATZ",
    "NUR_BILD_SATZ",
    "ANSICHT_ETIKEDOJ",
    "AUFBAU_ETIKEDOJ",
    "ANSICHT",
    "AUFBAU",
    "WIE_LAYOUT",
    "AUFBAU_KOMPONENTEN_SATZ",
  ]);
  const gefunden = Object.entries(sicht).filter(([nomo]) => namen.has(nomo));
  if (gefunden.length !== namen.size) throw new Error("a sentence constant is missing");
  for (const [, wert] of gefunden) iri(wert);
  iri(MARKE_NEUTRAL);
  out.push(
    sicht.vorUebernahmeDe(9, 5),
    sicht.offenSatzDe(["Werte", "Zielgruppe"]),
    sicht.vorschauTitoloDe("marke"),
    sicht.vorschauTitoloDe("komponenten"),
    sicht.wieLayoutSatzDe("weil das Beispiel Karten zeigt"),
    sicht.vonHandSatzDe("raster"),
  );
  return out;
}

/** The canvas files of this spec (new, or replaced placeholders), without comments. */
const GESTALTEN = fileURLToPath(new URL("../../nodredaktilo/src/gestalten/", import.meta.url));
const DOSIEROJ = [
  "anordnen.ts",
  "flanko.tsx",
  "ki-datumoj.ts",
  "ki-knopo.tsx",
  "layout-datumoj.ts",
  "marken-datumoj.ts",
  "marken.tsx",
  "profil-datumoj.ts",
  "uebernehmen.ts",
  "nodoj/grundlagen.tsx",
  "nodoj/ki-namen.tsx",
  "nodoj/layout-beispiel.tsx",
  "nodoj/marko-profil.tsx",
  "nodoj/marko-uebersicht.tsx",
  "nodoj/vorschau.tsx",
] as const;
const senKomentoj = (kodo: string): string =>
  kodo.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
/**
 * What a source can show a person: its string literals and its JSX text. Identifiers (`setProblemo`
 * in `ki-knopo.tsx`, Esperanto for „problem“) are no visible word and stay out of the search.
 */
const sichtbar = (kodo: string): string =>
  [
    ...senKomentoj(kodo).matchAll(
      /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`|>([^<>{}();=]+)</g,
    ),
  ]
    .map((m) => m[0])
    .join("\n");

interface Schritt {
  was: string;
  status: number;
  korpo: string;
}

describe("MAW-5.1 (AK-8): no rule name, problem count or report mark along Spec 058", () => {
  let k: KiServilo058;
  let ohne: KiServilo058;
  let woerter: string[];
  const alle: Schritt[] = [];
  const frage = async (
    s: KiServilo058,
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: unknown,
  ): Promise<Schritt> => {
    const a = await senden(
      s.server,
      method,
      path,
      body === undefined ? undefined : JSON.stringify(body),
    );
    const schritt = { was: `${method} ${path}`, status: a.status, korpo: a.body.toString("utf8") };
    alle.push(schritt);
    return schritt;
  };

  beforeAll(async () => {
    woerter = urteilsWoerter();
    k = await kiServilo058("grafeo-urteil-058-");
    ohne = await kiServilo058("grafeo-urteil-058-ohne-", { senModelo: true });
    for (const s of [k, ohne]) await markeMitAllem(s.server, "lumeto");
  });

  afterAll(async () => {
    for (const s of [k, ohne]) await s?.server.close();
  });

  it("runs a session through every route of this spec", async () => {
    await frage(k, "GET", "/api/marken");
    await frage(k, "GET", "/marko/lumeto/grafeo");
    for (const zweck of ["profil", "namen", "aufbau"] as Zweck[]) {
      await frage(k, "GET", `/api/marko/lumeto/ki?zweck=${zweck}`);
      await frage(ohne, "GET", `/api/marko/lumeto/ki?zweck=${zweck}`);
      await frage(ohne, "POST", `/api/marko/lumeto/ki/${zweck}`, {});
      await frage(k, "POST", `/api/marko/lumeto/ki/${zweck}`, {});
      k.modelo.status = 400;
      await frage(k, "POST", `/api/marko/lumeto/ki/${zweck}`, {});
      k.modelo.status = 200;
      k.modelo.antwort[zweck] = "kein JSON";
      await frage(k, "POST", `/api/marko/lumeto/ki/${zweck}`, {});
      k.modelo.antwort[zweck] = TEILWEISE_058[zweck];
      await frage(k, "POST", `/api/marko/lumeto/ki/${zweck}`, {});
      delete k.modelo.antwort[zweck];
      await frage(k, "POST", `/api/marko/lumeto/ki/${zweck}`, {});
    }
    await frage(k, "POST", "/api/marko/lumeto/leinwand", { name: "Lumeto Licht" });
    await frage(k, "POST", "/api/marko/lumeto/beispiele", { url: BRETT_058, vorschau: true });
    await frage(k, "POST", "/api/marko/lumeto/layout-beispiel", {
      filename: "kaputt.png",
      base64: Buffer.from("kein Bild").toString("base64"),
    });
    const bildo = JSON.parse(
      (await frage(k, "GET", "/api/leinwand?marko=lumeto&stufe=58")).korpo,
    ) as LeinwandAntwort;
    for (const v of bildo.nodoj.filter((n) => n.speco === "vorschau")) {
      for (const aufbau of ["titel", "raster", "liste"])
        await frage(k, "GET", v.href.replace(/aufbau=[a-z]+/, `aufbau=${aufbau}`));
      await frage(
        k,
        "GET",
        v.href.replace(/sxtupo=marke(&aufbau=[a-z]+)?(&inh=[0-9a-z]+)?/, "sxtupo=komponenten"),
      );
    }
    const stand = await frage(k, "POST", "/api/marko/lumeto/staende", { name: "Licht" });
    const { id } = JSON.parse(stand.korpo) as { id: string };
    await frage(k, "DELETE", "/api/marko/lumeto/layout-beispiel");
    await frage(k, "POST", `/api/marko/lumeto/staende/${id}/oeffnen`);
    await frage(k, "POST", "/api/marko/lumeto/layout-beispiel", {
      filename: "wieder.png",
      base64: LAYOUT_PNG_058.toString("base64"),
    });
    const leer: LeinwandStato = { version: 1, knoten: [], kabloj: {} };
    await frage(k, "PUT", "/api/marko/lumeto/leinwand-stato", leer);
    await frage(k, "POST", "/api/marko/lumeto/ki/profil", {});
    await frage(k, "GET", "/api/leinwand?marko=lumeto&stufe=58");

    const status = new Set(alle.map((s) => s.status));
    expect([200, 201, 422, 502, 503].filter((code) => !status.has(code))).toEqual([]);
    expect(alle.length).toBeGreaterThan(40);
  });

  it("carries no rule name, problem count or report mark in any answer, sentence or canvas source", () => {
    const quellen: Schritt[] = [
      ...saetze058().map((satz, i) => ({ was: `Satz ${i}`, status: 0, korpo: satz })),
      ...DOSIEROJ.map((d) => ({
        was: `gestalten/${d}`,
        status: 0,
        korpo: sichtbar(readFileSync(join(GESTALTEN, d), "utf8")),
      })),
    ];
    expect(quellen.length).toBeGreaterThan(DOSIEROJ.length + 40);
    const befunde: string[] = [];
    for (const schritt of [...alle, ...quellen])
      for (const wort of woerter)
        if (schritt.korpo.includes(wort))
          befunde.push(`${schritt.was} (${schritt.status}): ${wort}`);
    expect(befunde).toEqual([]);
  });

  it("control: the source search sees string literals and JSX text", () => {
    expect(sichtbar('const a = "Prüfung"; <p>Problem</p>; const setProblemo = 1;')).toBe(
      '"Prüfung"\n>Problem<',
    );
  });

  it("control: a rule name written as a competitor's name is found by the same search", async () => {
    const regel = woerter[0] ?? "";
    expect(regel).not.toBe("");
    const stato: LeinwandStato = {
      version: 1,
      knoten: [{ id: "teksto-wettbewerb", speco: "teksto", inhalt: { liste: [{ name: regel }] } }],
      kabloj: {},
    };
    await frage(k, "PUT", "/api/marko/lumeto/leinwand-stato", stato);
    const antwort = (await frage(k, "GET", "/api/leinwand?marko=lumeto&stufe=58")).korpo;
    alle.splice(-2);
    expect(woerter.filter((wort) => antwort.includes(wort))).toContain(regel);
  });
});
