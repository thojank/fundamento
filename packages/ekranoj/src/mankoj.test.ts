// Teil 3, the Lückenliste (S037-06, C-7): the gaps of one run from every source, the merge of many
// run folders (two stored fixture runs with overlapping gaps), the structured errors, and the
// Markdown table in the Kennzahl's format, extended. Offline, deterministic, neutral contents.

import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  eligoDe,
  kunigiMankojn,
  kuruEkranojn,
  MANKO_CELOJ,
  MANKOJ_KOLUMNOJ,
  type Manko,
  MankojEraro,
  mankojDeKuro,
  mankojMarkdown,
  PERMESITA_MODELO,
  sugestoSenTrafo,
} from "./index.js";
import { BildigiloDouble } from "./test-doubles/bildigilo.js";
import { ilaRespondo, respondo, SkriptaModelo, slugDePeto } from "./test-doubles/chat.js";
import { planoKun, taksado } from "./test-doubles/faktoj.js";
import { MemoraPonto } from "./test-doubles/iloj.js";
import { MarkoDouble } from "./test-doubles/marko.js";
import { neniamVerda } from "./test-doubles/taksilo.js";
import type { Malobservo, RondoEkrano } from "./tipoj.js";

const FIKSAJXOJ = fileURLToPath(new URL("../test/fixtures/mankoj/", import.meta.url));
const A = join(FIKSAJXOJ, "261031-1000-standards");
const B = join(FIKSAJXOJ, "261031-1100-teams");

const legi = (dir: string): Manko[] =>
  JSON.parse(readFileSync(join(dir, "mankoj.json"), "utf8")) as Manko[];

/** The problems of a MankojEraro, as `path rule`. */
function problemojDe(ago: () => unknown): string[] {
  try {
    ago();
  } catch (eraro) {
    if (eraro instanceof MankojEraro) return eraro.problemoj.map((p) => `${p.path} ${p.rule}`);
    throw eraro;
  }
  throw new Error("kein MankojEraro");
}

describe("kunigiMankojn: the Lückenliste of many runs (C-7)", () => {
  it("sums ofteco, unites the tasks and sorts by ofteco, then nomo", () => {
    const mankoj = kunigiMankojn([A, B]);
    // Expected values derived from the two stored runs, not typed: a gap is the same across runs
    // when kind and name match without case and surrounding spaces.
    const sxlosilo = (m: Manko) => `${m.speco}:${m.nomo.trim().toLowerCase()}`;
    const kuroj = [
      { nomo: "261031-1000-standards", mankoj: legi(A) },
      { nomo: "261031-1100-teams", mankoj: legi(B) },
    ];
    const atendataj = new Map<string, { ofteco: number; taskoj: Set<string> }>();
    for (const kuro of kuroj) {
      for (const m of kuro.mankoj) {
        const ero = atendataj.get(sxlosilo(m)) ?? { ofteco: 0, taskoj: new Set<string>() };
        ero.ofteco += m.ofteco;
        for (const t of m.taskoj) ero.taskoj.add(`${kuro.nomo}/${t}`);
        atendataj.set(sxlosilo(m), ero);
      }
    }
    expect(mankoj).toHaveLength(atendataj.size);
    for (const m of mankoj) {
      const atendata = atendataj.get(sxlosilo(m));
      expect(m.ofteco, m.nomo).toBe(atendata?.ofteco);
      expect(m.taskoj, m.nomo).toEqual([...(atendata?.taskoj ?? [])].sort());
      expect(m.celo, m.nomo).toBe(MANKO_CELOJ[m.speco]);
    }
    expect(mankoj.map((m) => `${m.ofteco} ${m.speco} ${m.nomo}`)).toEqual([
      "5 ero Ero für h1",
      "2 sxablono listo-kun-filtrilo",
      "1 ero Statusanzeige",
      "1 ilo list_arangxoj",
    ]);
    // The overlapping pattern keeps the first run's example and its own proposal.
    expect(mankoj[1]).toEqual({
      speco: "sxablono",
      nomo: "listo-kun-filtrilo",
      ofteco: 2,
      taskoj: ["261031-1000-standards/liste", "261031-1100-teams/liste"],
      ekzemplo: "liste.html: Liste der Standards mit Filter",
      propono: "Sxablono Liste mit Filterleiste",
      celo: "muster-rondo-2",
    });
  });

  it("gives the same list for any order of the folders, and counts a run given twice once", () => {
    const AB = kunigiMankojn([A, B]);
    expect(kunigiMankojn([B, A])).toEqual(AB);
    expect(kunigiMankojn([A, B, A])).toEqual(AB);
  });

  it("finds the run folders below a folder that holds runs", () => {
    const mankoj = kunigiMankojn([FIKSAJXOJ]);
    expect(mankoj.map((m) => [m.nomo, m.ofteco])).toEqual(
      kunigiMankojn([A, B]).map((m) => [m.nomo, m.ofteco]),
    );
    expect(mankoj[0]?.taskoj).toContain("mankoj/261031-1100-teams/bearbeiten");
  });

  it("refuses with structured problems: no folder, a missing folder, a folder without a run", () => {
    expect(problemojDe(() => kunigiMankojn([]))).toEqual(["/ folders-missing"]);
    const malplena = mkdtempSync(join(tmpdir(), "ekranoj-mankoj-"));
    expect(problemojDe(() => kunigiMankojn([A, join(malplena, "ne-ekzistas"), malplena]))).toEqual([
      "/1 folder-missing",
      "/2 run-missing",
    ]);
  });

  it("refuses a mankoj.json that is no list of gaps, naming the entry", () => {
    const dir = mkdtempSync(join(tmpdir(), "ekranoj-mankoj-"));
    cpSync(A, join(dir, "a"), { recursive: true });
    mkdirSync(join(dir, "b"));
    writeFileSync(join(dir, "b", "mankoj.json"), "{}");
    mkdirSync(join(dir, "c"));
    writeFileSync(
      join(dir, "c", "mankoj.json"),
      JSON.stringify([
        { speco: "ero", nomo: "Ero für h2", ofteco: 1, taskoj: ["liste"] },
        { speco: "farbo", nomo: "x", ofteco: 1, taskoj: [] },
      ]),
    );
    const problemoj = problemojDe(() => kunigiMankojn([dir]));
    expect(problemoj).toEqual([
      `${join(dir, "b", "mankoj.json").split("\\").join("/")} mankoj-invalid`,
      `${join(dir, "c", "mankoj.json").split("\\").join("/")}/1 manko-invalid`,
    ]);
  });
});

describe("mankojMarkdown: the table of the Lückenliste", () => {
  it("has the Kennzahl's columns, extended, and one row per gap", () => {
    const mankoj = kunigiMankojn([A, B]);
    const linioj = mankojMarkdown(mankoj).trimEnd().split("\n");
    expect(MANKOJ_KOLUMNOJ).toEqual([
      "#",
      "Art",
      "Lücke",
      "Anzahl",
      "Aufgaben",
      "Beispielstelle",
      "Vorschlag",
      "Ziel",
    ]);
    expect(linioj[0]).toBe(
      "| # | Art | Lücke | Anzahl | Aufgaben | Beispielstelle | Vorschlag | Ziel |",
    );
    expect(linioj[1]).toBe("|---|---|---|---|---|---|---|---|");
    expect(linioj).toHaveLength(mankoj.length + 2);
    for (const [i, m] of mankoj.entries()) {
      const cxeloj = (linioj[i + 2] ?? "").slice(2, -2).split(" | ");
      expect(cxeloj).toHaveLength(MANKOJ_KOLUMNOJ.length);
      expect(cxeloj[0]).toBe(String(i + 1));
      expect(cxeloj[1]).toBe(m.speco);
      expect(cxeloj[3]).toBe(String(m.ofteco));
      expect(cxeloj[4]).toBe(m.taskoj.join(", "));
      expect(cxeloj[7]).toBe(m.celo);
    }
  });

  it("escapes a pipe and a line break in a cell, and shows an empty list as one row", () => {
    const manko: Manko = {
      speco: "ero",
      nomo: "Wahl a | b",
      ofteco: 1,
      taskoj: ["liste"],
      ekzemplo: "liste.html:\nzwei Zeilen",
      propono: "Eine Ero anbieten.",
      celo: "eroj-rondo-6/7",
    };
    const linio = mankojMarkdown([manko]).trimEnd().split("\n")[2];
    expect(linio).toBe(
      "| 1 | ero | Wahl a \\| b | 1 | liste | liste.html: zwei Zeilen | Eine Ero anbieten. | eroj-rondo-6/7 |",
    );
    expect(mankojMarkdown([]).trimEnd().split("\n")).toHaveLength(3);
  });
});

describe("mankojDeKuro: the gaps of one run from every source", () => {
  const malobservo = (severity: Malobservo["severity"], name: string): Malobservo => ({
    rule: "regulo",
    severity,
    path: "/instances/0",
    message: "Eine Regulo ist verletzt.",
    suggestion: "Titel setzen.",
    regulo: { id: `reg-${name}`, name, kialo: "Eine Karte braucht einen Titel." },
    loko: "fm-karto",
  });
  const stato = (e: Partial<RondoEkrano> = {}): RondoEkrano => ({
    taksado: taksado(),
    malobservoj: [],
    navigado: { kompleta: true, mankantaj: [], mortaj: [] },
    verda: false,
    ...e,
  });

  it("takes K5 gaps and check_usage errors of the last state, suggest_ero misses and the agent's gaps", () => {
    const mankoj = mankojDeKuro({
      slugoj: ["liste", "detail"],
      lasta: {
        liste: stato({
          taksado: {
            ...taksado({ K5: 0 }),
            mankoj: [
              { kind: "rebuilt-ero", key: "h1" },
              { kind: "raw-value", key: "margin-top" },
              { kind: "raw-value", key: "color" },
              { kind: "invented-tag", key: "fm-nenio" },
            ],
          },
          malobservoj: [malobservo("error", "karto-titolo"), malobservo("warning", "karto-bildo")],
        }),
        detail: stato({
          taksado: { ...taksado({ K5: 0.8 }), mankoj: [{ kind: "rebuilt-ero", key: "h1" }] },
        }),
      },
      sugestojSenTrafo: [
        { slug: "detail", celo: "Zeitleiste  der Prüfschritte" },
        { slug: "detail", celo: "Zeitleiste der Prüfschritte" },
      ],
      agentaj: [
        {
          slug: "liste",
          manko: { speco: "ilo", nomo: "list_arangxoj", ekzemplo: "", propono: "" },
        },
        { slug: "liste", manko: { speco: "ilo", nomo: "get_ero", ekzemplo: "", propono: "" } },
        {
          slug: "detail",
          manko: {
            speco: "sxablono",
            nomo: "listo-kun-filtrilo",
            ekzemplo: "Liste",
            propono: "Muster",
          },
        },
      ],
      iloj: ["describe", "get_ero", "suggest_ero", "check_usage"],
    });
    expect(mankoj.map((m) => `${m.ofteco} ${m.speco} ${m.nomo} → ${m.celo}`)).toEqual([
      "2 ero Ero für h1 → eroj-rondo-6/7",
      "1 ero Gestaltung über color → eroj-rondo-6/7",
      "1 sxablono Layoutmittel für margin-top → muster-rondo-2",
      "1 ero Regulo karto-titolo → eroj-rondo-6/7",
      "1 ero Zeitleiste der Prüfschritte → eroj-rondo-6/7",
      "1 ilo list_arangxoj → gvidanto",
      "1 sxablono listo-kun-filtrilo → muster-rondo-2",
    ]);
    expect(mankoj[0]?.taskoj).toEqual(["liste", "detail"]);
    const ilo = mankoj.find((m) => m.speco === "ilo");
    expect(ilo?.propono).toBe("Ein Lesewerkzeug „list_arangxoj“ im Gvidanto anbieten.");
    expect(mankoj.find((m) => m.nomo === "Regulo karto-titolo")?.ekzemplo).toBe(
      "liste.html: fm-karto",
    );
    for (const m of mankoj) expect(m.propono, m.nomo).not.toBe("");
  });

  it("finds no gap in a green run without reports", () => {
    expect(
      mankojDeKuro({
        slugoj: ["liste"],
        lasta: { liste: stato({ verda: true }) },
        sugestojSenTrafo: [],
        agentaj: [],
        iloj: [],
      }),
    ).toEqual([]);
  });

  it("reads a suggest_ero answer without a hit", () => {
    expect(sugestoSenTrafo(JSON.stringify({ goal: "x", matched: null, suggestion: null }))).toBe(
      true,
    );
    expect(
      sugestoSenTrafo(JSON.stringify({ goal: "x", matched: null, suggestion: { ero: "butono" } })),
    ).toBe(false);
    expect(
      sugestoSenTrafo(
        JSON.stringify({
          goal: "x",
          matched: null,
          suggestion: null,
          candidates: [{ ero: "karto" }],
        }),
      ),
    ).toBe(false);
    // A boundary that hands the decision to a person: Fundamento has no Ero for it (real Gvidanto).
    expect(
      sugestoSenTrafo(
        JSON.stringify({
          goal: "Zeitleiste der Prüfschritte",
          matched: { goal: "steps", keyword: "schritte", lingvo: "de" },
          suggestion: null,
          boundary: {
            ero: "navigado",
            case: "steps",
            action: "ask-human",
            kialo: "Noch keine Schrittanzeige.",
          },
        }),
      ),
    ).toBe(true);
    // A boundary that names the Ero to use instead is a hit.
    expect(
      sugestoSenTrafo(
        JSON.stringify({
          goal: "x",
          matched: { goal: "y", keyword: "y", lingvo: "de" },
          suggestion: null,
          boundary: { ero: "butono", case: "y", action: "use", kialo: "Eine Aktion." },
        }),
      ),
    ).toBe(false);
    expect(sugestoSenTrafo(JSON.stringify({ issues: [{ rule: "goal-empty" }] }))).toBe(false);
    expect(sugestoSenTrafo("kein JSON")).toBe(false);
  });
});

/** A Gvidanto double whose suggest_ero finds nothing for one invented goal. */
const sercxantaPonto = (): MemoraPonto => {
  const ponto = new MemoraPonto();
  const voki = ponto.call.bind(ponto);
  ponto.call = async (name, args) => {
    const respondo = await voki(name, args);
    const goal = String(args.goal ?? "");
    return name === "suggest_ero" && goal === "Zeitleiste der Prüfschritte"
      ? JSON.stringify({ goal, matched: null, suggestion: null })
      : respondo;
  };
  return ponto;
};

describe("every run writes its gaps (mankoj.json, raporto.md)", () => {
  it("collects K5 gaps, suggest_ero misses and the agent's gaps of a run, and writes them", async () => {
    const plano = planoKun(2);
    const out = join(mkdtempSync(join(tmpdir(), "ekranoj-mankoj-kuro-")), "261031-1200-standards");
    const mankojBloko =
      '\n```mankoj\n[{"speco": "ilo", "nomo": "list_arangxoj", "ekzemplo": "Abstände", "propono": ""}, {"speco": "ilo", "nomo": "describe", "ekzemplo": "", "propono": ""}]\n```';
    const chat = new SkriptaModelo(
      (peto) => {
        const slug = slugDePeto(peto);
        if (slug === undefined) return respondo(`\`\`\`json\n${JSON.stringify(plano)}\n\`\`\``);
        if (!peto.messages.some((m) => m.role === "tool")) {
          return ilaRespondo([
            { name: "suggest_ero", args: { goal: "Zeitleiste der Prüfschritte", lingvo: "de" } },
            { name: "suggest_ero", args: { goal: "Aktion", lingvo: "de" } },
          ]);
        }
        const al = plano.kantoj.filter((k) => k.de === slug).map((k) => k.al);
        return respondo(
          `\`\`\`html\n<main><h1>Standard A-12</h1>${al.map((a) => `<a href="${a}.html">${a}</a>`).join("")}</main>\n\`\`\`${mankojBloko}`,
        );
      },
      { modelo: PERMESITA_MODELO },
    );
    const rezulto = await kuruEkranojn(
      { frazo: plano.celo, marko: "komuna", out, maksTokenoj: 1_000_000, plano },
      {
        chat,
        tools: sercxantaPonto(),
        taksilo: neniamVerda(),
        bildigilo: new BildigiloDouble(),
        marko: new MarkoDouble("komuna"),
        nun: () => new Date("2026-10-31T12:00:00Z"),
        log: () => undefined,
        eligo: eligoDe({ commit: "lokal" }),
      },
    );
    const slugoj = plano.ekranoj.map((e) => e.slug);
    // neniamVerda: K5 = 0 with a raw colour value and a rebuilt button on every screen.
    expect(rezulto.mankoj.map((m) => `${m.ofteco} ${m.speco} ${m.nomo} → ${m.celo}`)).toEqual([
      `${slugoj.length} ero Ero für button → eroj-rondo-6/7`,
      `${slugoj.length} ero Gestaltung über color → eroj-rondo-6/7`,
      `${slugoj.length} ero Zeitleiste der Prüfschritte → eroj-rondo-6/7`,
      `${slugoj.length} ilo list_arangxoj → gvidanto`,
    ]);
    for (const m of rezulto.mankoj) expect(m.taskoj).toEqual(slugoj);
    expect(JSON.parse(readFileSync(join(out, "mankoj.json"), "utf8"))).toEqual(rezulto.mankoj);
    const md = readFileSync(join(out, "raporto.md"), "utf8");
    expect(md).toContain("## Lücken (Teil 3)");
    expect(md).toContain(mankojMarkdown(rezulto.mankoj));
    // The written run is a run of the Lückenliste.
    expect(kunigiMankojn([out]).map((m) => m.ofteco)).toEqual(rezulto.mankoj.map((m) => m.ofteco));
  });
});
