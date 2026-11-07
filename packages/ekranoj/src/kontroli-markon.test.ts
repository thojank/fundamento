// Spec 038 1.8c: ekranoj asks check_markup when the server offers it, else it keeps the path of
// Spec 037 (D-03). The tool list decides once per run; the new path reads get_ero with `fields`
// (one follow-up for `rest`, D-28) and the link map from `navigation.target`, with the documented
// fallback; the page rules (`sxablonoRezulto`) are hints in the report and never keep a screen from
// green (D-29). On doubles only; the comparison with the AC-8 fixture against the real server lives
// in nordstelo (D-36), because ekranoj never imports the Gvidanto (AC-10).

import { describe, expect, it } from "vitest";
import {
  ERO_KAMPOJ,
  KURZPROFILAJ_KAMPOJ,
  kampaLegiloDe,
  kontroliMarkon,
  kontroliUzon,
  kuruEkranojn,
  LIGILAJ_ATRIBUTOJ,
  ligilajAtributojElKampoj,
  markaServilo,
  PERMESITA_MODELO,
  raportoDe,
  raportoMarkdown,
  skemoLegiloDe,
  statikaFakto,
  uzKontroliloDe,
} from "./index.js";
import { BildigiloDouble } from "./test-doubles/bildigilo.js";
import {
  type Peto,
  respondo,
  rondoDePeto,
  SkriptaModelo,
  slugDePeto,
} from "./test-doubles/chat.js";
import { planoKun } from "./test-doubles/faktoj.js";
import { CXIUJ_ILOJ, ilo, MALNOVAJ_ILOJ, MemoraPonto } from "./test-doubles/iloj.js";
import { neniamVerda, TaksiloDouble, VERDA } from "./test-doubles/taksilo.js";
import type { EkranojDeps, EkranojEnigo, Fakto, Plano } from "./tipoj.js";

const PLANO: Plano = planoKun(2); // liste → detail

const FRAGMENTOJ = [
  '<fm-karto level="2"><h2 slot="heading">Standard A-12</h2><p>Team Nord</p><fm-butono intent="primary">Öffnen</fm-butono></fm-karto>',
  '<fm-butono intent="rot" disabled="false">Zurück</fm-butono><fm-erfunden>x</fm-erfunden>',
  '<html lang="EN-gb"><body><fm-butono intent="secondary">Save</fm-butono></body></html>',
  "<p>Nur Text, keine Ero.</p>",
];

/** check_usage of the doubles: an error on the first instance of every judged list. */
const MIT_FEHLER = (instances: unknown[]) => ({
  instances: instances.length,
  valid: false,
  violations: [
    {
      instance: [0],
      issue: {
        rule: "karto-heading-required",
        severity: "error",
        path: "instances#/0",
        message: "Eine Karte braucht eine Überschrift.",
        suggestion: "heading füllen.",
        regulo: { id: "regulo-x", name: "karto-heading-required", kialo: "Lesbarkeit." },
      },
    },
  ],
});

const novaServilo = (o: ConstructorParameters<typeof MemoraPonto>[0] = {}) =>
  new MemoraPonto({ iloj: CXIUJ_ILOJ, ...o });

/** A fragment of screen `slug` that links to its planned targets (navigation complete). */
function fragmentoDe(plano: Plano, slug: string, rondo: number): string {
  const ligiloj = plano.kantoj
    .filter((kanto) => kanto.de === slug)
    .map((kanto) => `<fm-butono href="${kanto.al}.html">Weiter</fm-butono>`)
    .join("");
  return `<main data-rondo="${rondo}"><fm-karto><h2 slot="heading">Standard A-12</h2></fm-karto><nav>${ligiloj}</nav></main>`;
}

function skripto(plano: Plano) {
  return (peto: Peto) => {
    const slug = slugDePeto(peto);
    if (slug === undefined) return respondo(`\`\`\`json\n${JSON.stringify(plano)}\n\`\`\``);
    return respondo(`\`\`\`html\n${fragmentoDe(plano, slug, rondoDePeto(peto))}\n\`\`\``);
  };
}

const ENIGO: EkranojEnigo = {
  frazo: "Standards wie Standard A-12 für Team Nord verwalten",
  marko: "komuna",
  out: "/tmp/s038-logs/nicht-geschrieben",
  maksTokenoj: 1_000_000,
  plano: PLANO,
};

function depsDe(e: { chat: SkriptaModelo; tools: MemoraPonto; taksilo?: TaksiloDouble }) {
  const deps: EkranojDeps = {
    chat: e.chat,
    tools: e.tools,
    taksilo: e.taksilo ?? neniamVerda(),
    bildigilo: new BildigiloDouble(),
    marko: { konstrui: async () => ({ css: [] }) },
    nun: () => new Date("2026-11-06T12:00:00Z"),
    log: () => {},
  };
  return deps;
}

const nomoj = (ponto: MemoraPonto) => ponto.vokoj.map((voko) => voko.name);

describe("the path of a run (Spec 038 1.8c, D-03)", () => {
  it("knows a server of Spec 038 by check_markup in its tool list", () => {
    expect(markaServilo(CXIUJ_ILOJ.map(ilo))).toBe(true);
    expect(markaServilo(MALNOVAJ_ILOJ.map(ilo))).toBe(false);
    expect(markaServilo([])).toBe(false);
    const ponto = novaServilo();
    expect(uzKontroliloDe(ponto, CXIUJ_ILOJ.map(ilo)).vojo).toBe("check_markup");
    expect(uzKontroliloDe(ponto, MALNOVAJ_ILOJ.map(ilo)).vojo).toBe("check_usage");
  });

  it("asks check_markup and get_ero with fields on a server of Spec 038, from one tool list per run", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const tools = novaServilo({ checkUsage: MIT_FEHLER });
    const rezulto = await kuruEkranojn(ENIGO, depsDe({ chat, tools }));
    expect(tools.listoj).toBe(1);
    expect(nomoj(tools)).not.toContain("check_usage");
    const markoj = tools.vokoj.filter((voko) => voko.name === "check_markup");
    expect(markoj.length).toBeGreaterThan(0);
    expect(markoj[0]?.args).toEqual({
      fragment: fragmentoDe(PLANO, "liste", 1),
      lingvo: "de",
    });
    // The reads of the checker; the Kurzprofile ekranoj puts into round 2
    // (`fields: KURZPROFILAJ_KAMPOJ`, S038-20, S038-24) are asserted in rondoj.test.ts.
    const eroj = tools.vokoj.filter(
      (voko) => voko.name === "get_ero" && String(voko.args.fields) !== String(KURZPROFILAJ_KAMPOJ),
    );
    expect(eroj.map((voko) => voko.args)).toEqual([
      { name: "karto", fields: [...ERO_KAMPOJ] },
      { name: "butono", fields: [...ERO_KAMPOJ] },
    ]);
    // The judgement of check_markup's rezulto keeps the screen from green, as check_usage did.
    expect(rezulto.rondoj[0]?.liste?.malobservoj.map((m) => [m.rule, m.loko])).toEqual([
      ["karto-heading-required", "fm-karto"],
    ]);
    expect(rezulto.rondoj[0]?.liste?.malhelpoj).toContain("check_usage");
  });

  it("keeps the path of Spec 037 on an older server: get_ero without fields, check_usage", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const tools = new MemoraPonto({ checkUsage: MIT_FEHLER });
    const rezulto = await kuruEkranojn(ENIGO, depsDe({ chat, tools }));
    expect(nomoj(tools)).not.toContain("check_markup");
    expect(nomoj(tools)).toContain("check_usage");
    for (const voko of tools.vokoj.filter((v) => v.name === "get_ero")) {
      expect(voko.args).toEqual({ name: voko.args.name });
    }
    expect(rezulto.rondoj[0]?.liste?.malobservoj.map((m) => [m.rule, m.loko])).toEqual([
      ["karto-heading-required", "fm-karto"],
    ]);
  });

  it("offers list_arangxoj and check_markup to the agent on a server of Spec 038", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    await kuruEkranojn(ENIGO, depsDe({ chat, tools: novaServilo() }));
    const angebotene = new Set(chat.petoj.flatMap((peto) => peto.tools ?? []));
    expect(angebotene.has("list_arangxoj")).toBe(true);
    expect(angebotene.has("check_markup")).toBe(true);
    for (const skriba of ["save_agordo", "preview_agordo", "propose_agordo"]) {
      expect(angebotene.has(skriba)).toBe(false);
    }
  });
});

describe("check_markup for one screen (new path)", () => {
  it("does not call check_markup for an empty or whitespace-only fragment", async () => {
    const ponto = novaServilo();
    for (const fragmento of ["", "  \n\t "]) {
      expect(await kontroliMarkon(ponto, fragmento, "de")).toEqual({
        instancoj: [],
        malobservoj: [],
        sxablonajSugestoj: [],
      });
    }
    expect(ponto.vokoj).toEqual([]);
  });

  it("takes the instances from check_markup and the malobservoj from its rezulto, as the old path gives them", async () => {
    for (const fragmento of FRAGMENTOJ) {
      const nova = novaServilo({ checkUsage: MIT_FEHLER });
      const malnova = new MemoraPonto({ checkUsage: MIT_FEHLER });
      const fakto = statikaFakto(fragmento, "de");
      const atendita = await kontroliUzon(malnova, fakto, skemoLegiloDe(malnova));
      expect(await kontroliMarkon(nova, fragmento, "de"), fragmento).toEqual({
        ...atendita,
        sxablonajSugestoj: [],
      });
      expect(nomoj(nova)).toEqual(["check_markup"]);
      expect(nova.vokoj[0]?.args).toEqual({ fragment: fragmento, lingvo: "de" });
    }
  });

  it("reads a refusal as malobservoj of the input and an unreadable answer as one error", async () => {
    const issue = {
      rule: "uzo-slot-unknown",
      severity: "error",
      path: "check_usage/instances/0/slots",
      message: "Unbekannter Slot.",
      suggestion: "Slot der Skemo nehmen.",
    };
    const abgelehnt = await kontroliMarkon(
      novaServilo({ checkMarkup: () => ({ issues: [issue], allowed: ["label"] }) }),
      "<fm-butono>Öffnen</fm-butono>",
      "de",
    );
    expect(abgelehnt).toEqual({
      instancoj: [],
      malobservoj: [{ ...issue, loko: "check_usage-Eingabe" }],
      sxablonajSugestoj: [],
    });
    const kaputt = await kontroliMarkon(
      { list: async () => [], call: async () => "kein JSON" },
      "<fm-butono>Öffnen</fm-butono>",
      "de",
    );
    expect(kaputt.malobservoj.map((m) => [m.rule, m.severity])).toEqual([
      ["check-usage-answer-invalid", "error"],
    ]);
  });

  it("shows the page rules of sxablonoRezulto as hints, never as malobservoj (D-29)", async () => {
    const sugesto = {
      rule: "sxablono-region-props",
      severity: "error",
      path: "sxablonoj#/0/regions/title/0",
      message: "Die Region verlangt eine Eigenschaft.",
      suggestion: "focusable setzen.",
    };
    const ponto = novaServilo({
      checkMarkup: () => ({
        eroj: [{ ero: "butono", props: {}, label: "Öffnen", lingvo: "de" }],
        sxablonoj: [{ sxablono: "pagxo", props: {}, regions: {} }],
        rezulto: { instances: 1, valid: true, violations: [] },
        sxablonoRezulto: {
          instances: 1,
          valid: false,
          violations: [{ sxablono: [0], issue: sugesto }],
        },
      }),
    });
    const rezulto = await kontroliMarkon(
      ponto,
      "<fm-pagxo><fm-butono>Öffnen</fm-butono></fm-pagxo>",
      "de",
    );
    expect(rezulto.malobservoj).toEqual([]);
    expect(rezulto.sxablonajSugestoj).toEqual([{ ...sugesto, loko: "fm-pagxo" }]);
  });

  it("lets a screen with page-rule hints turn green and names the hints in the report", async () => {
    const sugesto = {
      rule: "sxablono-region-accepts",
      severity: "error",
      path: "sxablonoj#/0/regions/actions/0",
      message: "Die Region nimmt das nicht an.",
      suggestion: "Eine angenommene Ero nehmen.",
    };
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const tools = novaServilo({
      checkMarkup: () => ({
        eroj: [],
        sxablonoj: [{ sxablono: "pagxo", props: {}, regions: {} }],
        rezulto: { instances: 0, valid: true, violations: [] },
        sxablonoRezulto: {
          instances: 1,
          valid: false,
          violations: [{ sxablono: [0], issue: sugesto }],
        },
      }),
    });
    const rezulto = await kuruEkranojn(
      ENIGO,
      depsDe({ chat, tools, taksilo: new TaksiloDouble(() => VERDA) }),
    );
    const liste = rezulto.rondoj[0]?.liste;
    expect(liste?.verda).toBe(true);
    expect(liste?.malhelpoj).toEqual([]);
    expect(liste?.malobservoj).toEqual([]);
    expect(liste?.sxablonajSugestoj).toEqual([{ ...sugesto, loko: "fm-pagxo" }]);
    const raporto = raportoDe({
      id: "kuro-1",
      enigo: ENIGO,
      varianto: "F",
      lingvo: "de",
      bildigilo: true,
      rezulto,
      bildoj: [],
    });
    expect(raporto.rondoj[0]?.ekranoj.liste?.sxablonajSugestoj).toEqual([
      { ...sugesto, loko: "fm-pagxo" },
    ]);
    const md = raportoMarkdown(raporto);
    expect(md).toContain("Seitenregeln (Hinweis, zählt nicht für grün, D-29):");
    expect(md).toContain("- liste: sxablono-region-accepts (error) bei fm-pagxo");
  });
});

describe("get_ero with fields and the link map (new path, D-28, 1.4)", () => {
  it("asks the four fields and follows rest exactly once per name and run", async () => {
    const ponto = novaServilo({
      kampoj: (nomo, fields) =>
        fields.length === 4
          ? { ero: nomo, role: "textbox", slots: { label: { content: ["text"] } }, rest: ["brief"] }
          : // The follow-up names rest again: it is not followed a second time.
            { ero: nomo, description: "Ein Feld", rest: ["brief"] },
    });
    const legi = kampaLegiloDe(ponto);
    const kampoj = await legi("kampo");
    await legi("kampo");
    expect(ponto.vokoj.map((voko) => voko.args)).toEqual([
      { name: "kampo", fields: ["brief", "slots", "role", "navigation"] },
      { name: "kampo", fields: ["brief"] },
    ]);
    expect(kampoj).toMatchObject({ rolo: "textbox" });
    expect(kampoj?.celaAtributo).toBeUndefined();
    expect(kampoj?.respondo).toMatchObject({ description: "Ein Feld", slots: { label: {} } });
  });

  it("asks no follow-up when nothing is left in rest", async () => {
    const ponto = novaServilo();
    await kampaLegiloDe(ponto)("butono");
    expect(ponto.vokoj.map((voko) => voko.args)).toEqual([
      { name: "butono", fields: ["brief", "slots", "role", "navigation"] },
    ]);
  });

  it("takes the link target from navigation.target and keeps the documented fallback for an unreadable answer", async () => {
    const kampoj: Record<string, unknown> = {
      saltilo: { ero: "saltilo", role: "link", navigation: { target: "celo" } },
      butono: { ero: "butono", role: "button" },
      ligilo: { issues: [{ rule: "ero-unknown", severity: "error", path: "get_ero/name" }] },
    };
    const ponto = novaServilo({ kampoj: (nomo) => kampoj[nomo] ?? "kein Objekt" });
    const fakto: Fakto = {
      ...statikaFakto(
        '<fm-saltilo celo="detail.html">Weiter</fm-saltilo><fm-ligilo to="liste.html">Liste</fm-ligilo><fm-butono href="x.html">Los</fm-butono><fm-nekonata></fm-nekonata>',
        "de",
      ),
    };
    const atributoj = await ligilajAtributojElKampoj({ liste: fakto }, kampaLegiloDe(ponto));
    expect(atributoj).toEqual({ ...LIGILAJ_ATRIBUTOJ, "fm-saltilo": "celo" });
    // A readable answer without navigation is no link, even where the fallback named the tag.
    const ponto2 = novaServilo({
      kampoj: (nomo) => ({ ero: nomo, role: "button" }),
    });
    expect(await ligilajAtributojElKampoj({ liste: fakto }, kampaLegiloDe(ponto2))).toEqual({});
  });
});

describe("the fallback (server without check_markup, D-03)", () => {
  it("gives the result of Spec 037 unchanged, and the new path gives the same on the same server data", async () => {
    for (const fragmento of FRAGMENTOJ) {
      const fakto = statikaFakto(fragmento, "de");
      const malnova = new MemoraPonto({ checkUsage: MIT_FEHLER });
      const rueckfall = uzKontroliloDe(malnova, MALNOVAJ_ILOJ.map(ilo));
      const referenz = new MemoraPonto({ checkUsage: MIT_FEHLER });
      const spec037 = await kontroliUzon(referenz, fakto, skemoLegiloDe(referenz));
      const ergebnis = await rueckfall.kontroli({ fakto, fragmento });
      expect(ergebnis, fragmento).toEqual({ ...spec037, sxablonajSugestoj: [] });
      expect(malnova.vokoj).toEqual(referenz.vokoj);
      const nova = novaServilo({ checkUsage: MIT_FEHLER });
      const neu = await uzKontroliloDe(nova, CXIUJ_ILOJ.map(ilo)).kontroli({ fakto, fragmento });
      expect(neu, fragmento).toEqual(ergebnis);
    }
  });

  it("reads the link map of the fallback with get_ero without fields", async () => {
    const malnova = new MemoraPonto();
    const fakto = statikaFakto('<fm-ligilo to="detail.html">Weiter</fm-ligilo>', "de");
    const atributoj = await uzKontroliloDe(malnova, MALNOVAJ_ILOJ.map(ilo)).ligilajAtributoj({
      liste: fakto,
    });
    expect(atributoj).toEqual(LIGILAJ_ATRIBUTOJ);
    expect(malnova.vokoj.map((voko) => voko.args)).toEqual([{ name: "ligilo" }]);
  });
});
