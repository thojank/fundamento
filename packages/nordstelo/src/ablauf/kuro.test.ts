// The run of the measurement „ganzer Ablauf“ (Spec 037, Lieferliste 2.3, AC-11, AC-12): two flows
// × two variants through a `kuruEkranojn` double, the rounds 1 and 3 stored per run, the report
// with F against 0 and round 1 against round 3 per flow and per screen, the model guard before any
// request, one Budget over the whole measurement and the load before and after each run.

import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type AnbieterEraro,
  KONTROLA_MODELO,
  type KuruEkranojn,
  kunigiMankojn,
  MalpermesitaModelo,
  type Manko,
  PERMESITA_MODELO,
  type Peno,
  type Restanta,
  type Varianto,
} from "@fundamento/ekranoj";
import { defaultModeloSource, loadModelo, type Modelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { type AblaufTasko, planoDe, trovuTaskon } from "./katalogo.js";
import {
  type AblaufDeps,
  kunKomunaBudgxeto,
  kuriAblaufon,
  restantajLauxReguloDe,
  validiAblaufon,
} from "./kuro.js";
import type { FluaPoento, KuraPoento } from "./poentoj.js";
import { legiKatalogon } from "./poentoj.js";
import {
  type KuroRekordo,
  kuroDir,
  type LaufRekordo,
  type PenoKvar,
  stabilaJson,
  taksiloPorMezuro,
} from "./raporto.js";
import {
  ASPEKTOJ_DUOBLAJ,
  duoblaKuro,
  faktojElDosierujo,
  faktoKunLigiloj,
  kalkulantaChat,
} from "./test-doubles/ekranoj.js";
import { konstantaTaksilo } from "./test-doubles/taksilo.js";

const geladen = loadModelo(defaultModeloSource()).modelo;
if (geladen === undefined) throw new Error("the repository Modelo must load");
const modelo: Modelo = geladen;
const katalogo = legiKatalogon();

const fixtures = fileURLToPath(new URL("../../test/fixtures/ablauf/", import.meta.url));
const LFD = "liste-filter-detail";
const UK = "uebersicht-kennzahlen";
const taskoDe = (slug: string): AblaufTasko => {
  const tasko = trovuTaskon(slug);
  if (tasko === undefined) throw new Error(`no flow ${slug}`);
  return tasko;
};

/** Facts of uebersicht-kennzahlen: round 1 links only the first planned target, round 3 all. */
function ukFaktoj(varianto: Varianto) {
  const tasko = taskoDe(UK);
  const rondo = (cxiuj: boolean) =>
    Object.fromEntries(
      tasko.ekranoj.map((ekrano) => {
        const al = tasko.kantoj.filter((k) => k.de === ekrano.slug).map((k) => k.al);
        return [
          ekrano.slug,
          faktoKunLigiloj({
            titolo: `${ekrano.titolo} ${varianto}`,
            al: cxiuj ? al : al.slice(0, 1).concat(varianto === "0" ? ["archiv"] : []),
          }),
        ];
      }),
    );
  return { "1": rondo(false), "3": rondo(true) };
}

const faktoj = (tasko: string, varianto: Varianto) =>
  tasko === LFD ? faktojElDosierujo(`${fixtures}${LFD}/${varianto}/`) : ukFaktoj(varianto);

const expected = (varianto: Varianto): KuraPoento =>
  JSON.parse(readFileSync(`${fixtures}${LFD}/${varianto}/poentoj.json`, "utf8")) as KuraPoento;
const sumoDe = (varianto: Varianto, rondo: string): FluaPoento["sumo"] => {
  const own = expected(varianto).rondoj[rondo] ?? expected(varianto).rondoj["1"];
  if (own === undefined) throw new Error(`no round ${rondo}`);
  return own.sumo;
};

function deps(
  extra: Partial<AblaufDeps> & Pick<AblaufDeps, "kuruEkranojn">,
  kernoj = 10,
): AblaufDeps & { sxargoj: number; kuraVokoj: number } {
  const own: AblaufDeps & { sxargoj: number; kuraVokoj: number } = {
    sxargoj: 0,
    kuraVokoj: 0,
    kiModelo: PERMESITA_MODELO,
    kuraDeps: () => {
      own.kuraVokoj += 1;
      return {
        chat: kalkulantaChat({ input: 400, output: 100, modelo: PERMESITA_MODELO }),
        tools: {
          list: async () => [],
          call: async () => "",
        },
        marko: { konstrui: async () => ({ css: [] }) },
        nun: () => new Date(Date.UTC(2026, 9, 31, 12, 0)),
        log: () => undefined,
      };
    },
    taksiloPor: (tasko: AblaufTasko) => taksiloPorMezuro({ modelo, katalogo, tasko }),
    modelo,
    markoj: ASPEKTOJ_DUOBLAJ,
    sxargo: () => {
      own.sxargoj += 1;
      return { sxargo: { l1: own.sxargoj, l5: 2, l15: 3 }, kernoj };
    },
    nun: () => new Date(Date.UTC(2026, 9, 31, 12, 0)),
    commit: "abc1234",
    log: () => undefined,
    ...extra,
  };
  return own;
}

const kuroJson = (dir: string, tasko: string, varianto: Varianto) =>
  JSON.parse(
    readFileSync(join(kuroDir(dir, tasko, varianto, 1), "kuro.json"), "utf8"),
  ) as KuroRekordo;

describe("the measurement „ganzer Ablauf“", () => {
  it("runs 2 flows × 2 variants through kuruEkranojn with the catalogue plan and stores rounds 1 and 3", async () => {
    const out = mkdtempSync(join(tmpdir(), "s037-ablauf-"));
    const duobla = duoblaKuro({ faktoj });
    const own = deps({ kuruEkranojn: duobla.kuruEkranojn });
    const rezulto = await kuriAblaufon(
      { taskoj: [UK, LFD], varianten: ["0", "F"], maksTokenoj: 1_000_000, out },
      own,
    );
    // Catalogue order, F before 0 (D-25), one call per flow × variant, no plan request.
    expect(duobla.vokoj.map((v) => `${v.enigo.out.split("/").at(-3)} ${v.enigo.varianto}`)).toEqual(
      [`${LFD} F`, `${LFD} 0`, `${UK} F`, `${UK} 0`],
    );
    for (const voko of duobla.vokoj) {
      const slug = voko.enigo.out.split("/").at(-3) ?? "";
      expect(voko.enigo.plano).toEqual(planoDe(taskoDe(slug)));
      // D-07, D-34: the Gvidanto for F only.
      expect(voko.deps.tools === undefined).toBe(voko.enigo.varianto === "0");
    }
    expect(rezulto.dir).toBe(join(out, "20261031-1200"));
    for (const tasko of [LFD, UK]) {
      for (const varianto of ["F", "0"] as const) {
        const dir = kuroDir(rezulto.dir, tasko, varianto, 1);
        expect(existsSync(join(dir, "plano.json")), dir).toBe(true);
        for (const ekrano of taskoDe(tasko).ekranoj) {
          for (const n of ["1", "3"]) {
            const file = join(dir, "rondoj", n, `${ekrano.slug}.fakto.json`);
            expect(existsSync(file), file).toBe(true);
          }
        }
      }
    }
    // The stored facts are the ones the run got (D-33).
    expect(
      JSON.parse(
        readFileSync(
          join(kuroDir(rezulto.dir, LFD, "F", 1), "rondoj", "3", "standard-detail.fakto.json"),
          "utf8",
        ),
      ),
    ).toEqual(faktoj(LFD, "F")["3"]?.["standard-detail"]);
    // D-09: load before and after every run, with the cores.
    expect(own.sxargoj).toBe(2 * 4);
    expect(kuroJson(rezulto.dir, LFD, "F").sxargo).toEqual({
      antaux: { l1: 1, l5: 2, l15: 3 },
      post: { l1: 2, l5: 2, l15: 3 },
      kernoj: 10,
    });
    expect(kuroJson(rezulto.dir, LFD, "0").stato["3"]?.["standards-liste"]).toEqual({
      verda: true,
      verdaEkde: 1,
    });
    const lauf = JSON.parse(readFileSync(join(rezulto.dir, "lauf.json"), "utf8")) as LaufRekordo;
    expect(lauf).toMatchObject({
      commit: "abc1234",
      kiModelo: PERMESITA_MODELO,
      taskoj: [LFD, UK],
      varianten: ["F", "0"],
      ripetoj: 1,
      markoj: [...ASPEKTOJ_DUOBLAJ],
    });
    expect(lauf.takso.tokenoj).toBeGreaterThan(0);
  });

  it("reports F against 0 and round 1 against round 3 per flow and per screen, from the fixtures (AC-11)", async () => {
    const out = mkdtempSync(join(tmpdir(), "s037-ablauf-"));
    const { kuruEkranojn } = duoblaKuro({ faktoj });
    const { raporto } = await kuriAblaufon(
      { taskoj: [LFD, UK], maksTokenoj: 1_000_000, out },
      deps({ kuruEkranojn }),
    );
    const { komparoj } = raporto.datumoj;
    // Expected values: the committed scores of the fixtures (S037-07); round 3 of 0 is round 1
    // carried forward.
    for (const rondo of ["1", "3"]) {
      const row = komparoj.f0.find((r) => r.tasko === LFD && r.rondo === rondo);
      const F = sumoDe("F", rondo);
      const nul = sumoDe("0", "1");
      expect(row, `f0 ${rondo}`).toEqual({
        tasko: LFD,
        rondo,
        total: { F: F.total, "0": nul.total, delto: Math.round((F.total - nul.total) * 10) / 10 },
        navigado: {
          F: F.navigado,
          "0": nul.navigado,
          delto: Math.round((F.navigado - nul.navigado) * 1e4) / 1e4,
        },
        sxablonoj: {
          F: F.sxablonoj,
          "0": nul.sxablonoj,
          delto: Math.round((F.sxablonoj - nul.sxablonoj) * 1e4) / 1e4,
        },
        enStreuung: Math.abs(F.total - nul.total) <= 16.7,
      });
    }
    const r1r3 = komparoj.r1r3.find((r) => r.tasko === LFD && r.varianto === "F");
    expect(r1r3?.navigado).toEqual({
      R1: sumoDe("F", "1").navigado,
      R3: sumoDe("F", "3").navigado,
      delto: sumoDe("F", "3").navigado - sumoDe("F", "1").navigado,
    });
    expect(r1r3?.sxablonoj.delto).toBe(sumoDe("F", "3").sxablonoj - sumoDe("F", "1").sxablonoj);
    // The comparisons show a difference somewhere: they compute, they do not copy.
    expect(komparoj.f0.some((r) => (r.total.delto ?? 0) !== 0)).toBe(true);
    expect(komparoj.r1r3.some((r) => (r.navigado.delto ?? 0) !== 0)).toBe(true);
    // One row per flow × round for F/0, per flow × variant for R1/R3, per screen of both flows.
    expect(komparoj.f0).toHaveLength(2 * 2);
    expect(komparoj.r1r3).toHaveLength(2 * 2);
    const screens = [LFD, UK].flatMap((slug) =>
      taskoDe(slug).ekranoj.map((e) => `${slug}/${e.slug}`),
    );
    expect(komparoj.ekranoj.map((r) => `${r.tasko}/${r.ekrano}`)).toEqual(screens);
    const ekranoF = expected("F").rondoj["3"]?.ekranoj["standard-detail"]?.taksado?.total;
    const ekrano0 = expected("0").rondoj["1"]?.ekranoj["standard-detail"]?.taksado?.total;
    expect(komparoj.ekranoj.find((r) => r.ekrano === "standard-detail")?.f0R3).toEqual({
      F: ekranoF,
      "0": ekrano0,
      delto: Math.round(((ekranoF ?? 0) - (ekrano0 ?? 0)) * 10) / 10,
    });
    // The Markdown has a row per screen in the screen table and the flow rows of both tables.
    for (const screen of screens) {
      const [tasko, ekrano] = screen.split("/");
      expect(raporto.md).toContain(`| ${tasko} | ${ekrano} | `);
    }
    expect(raporto.md).toContain("## F gegen 0 je Aufgabe");
    expect(raporto.md).toContain("## Runde 1 gegen Runde 3 je Aufgabe");
    expect(raporto.md).toContain(`| ${LFD} | 1 | 100 | 44,4 | +55,6 |`);
    expect(raporto.md).toContain("ja, seit Runde 1");
  });

  it("writes the gaps of every run to mankoj.json, so fm ekranoj mankoj finds the measurement (Teil 3)", async () => {
    const out = mkdtempSync(join(tmpdir(), "s037-ablauf-"));
    const manko = (tasko: string): Manko => ({
      speco: "sxablono",
      nomo: "filtroliste",
      ofteco: 1,
      taskoj: [tasko === LFD ? "standards-liste" : "kennzahlen"],
      ekzemplo: "Liste mit Filter über der Tabelle",
      propono: "Sxablono für eine gefilterte Liste",
      celo: "muster-rondo-2",
    });
    const { kuruEkranojn } = duoblaKuro({
      faktoj,
      mankoj: (tasko, varianto) => (varianto === "F" ? [manko(tasko)] : []),
    });
    const { dir } = await kuriAblaufon(
      { taskoj: [LFD, UK], maksTokenoj: 1_000_000, out },
      deps({ kuruEkranojn }),
    );
    for (const tasko of [LFD, UK]) {
      for (const varianto of ["F", "0"] as const) {
        const file = join(kuroDir(dir, tasko, varianto, 1), "mankoj.json");
        expect(existsSync(file), file).toBe(true);
        expect(JSON.parse(readFileSync(file, "utf8"))).toEqual(
          varianto === "F" ? [manko(tasko)] : [],
        );
      }
    }
    const kunigitaj = kunigiMankojn([dir]);
    expect(kunigitaj).toHaveLength(1);
    expect(kunigitaj[0]).toMatchObject({ nomo: "filtroliste", ofteco: 2 });
    // The places are named by the run folder below the measurement and the screen.
    const id = dir.split("/").at(-1) ?? "";
    expect([...(kunigitaj[0]?.taskoj ?? [])].sort()).toEqual([
      `${id}/${LFD}/F/1/standards-liste`,
      `${id}/${UK}/F/1/kennzahlen`,
    ]);
  });

  it("refuses another model before any request: no folder, no dependency, no run (D-19)", async () => {
    const out = join(mkdtempSync(join(tmpdir(), "s037-ablauf-")), "nie");
    const duobla = duoblaKuro({ faktoj });
    const own = deps({
      kuruEkranojn: duobla.kuruEkranojn,
      kiModelo: "mistral/mistral-large-latest",
    });
    await expect(kuriAblaufon({ maksTokenoj: 1_000_000, out }, own)).rejects.toBeInstanceOf(
      MalpermesitaModelo,
    );
    expect(duobla.vokoj).toHaveLength(0);
    expect(own.kuraVokoj).toBe(0);
    expect(existsSync(out)).toBe(false);
  });

  it("accepts the control model only with the control pair and hands the pair to every run (Spec 038 C-3)", async () => {
    for (const kontrolo of [
      undefined,
      { laufId: "kontrolle-komuna" },
      { laufId: "foo", kontrolModelo: KONTROLA_MODELO },
      { kontrolModelo: KONTROLA_MODELO },
    ]) {
      const out = join(mkdtempSync(join(tmpdir(), "s038-kontrolo-")), "nie");
      const duobla = duoblaKuro({ faktoj });
      const own = deps({
        kuruEkranojn: duobla.kuruEkranojn,
        kiModelo: KONTROLA_MODELO,
        ...(kontrolo === undefined ? {} : { kontrolo }),
      });
      await expect(
        kuriAblaufon({ taskoj: [LFD], maksTokenoj: 1_000_000, out }, own),
        JSON.stringify(kontrolo),
      ).rejects.toBeInstanceOf(MalpermesitaModelo);
      expect(duobla.vokoj).toHaveLength(0);
      expect(existsSync(out)).toBe(false);
    }
    const paro = { laufId: "kontrolle-komuna", kontrolModelo: KONTROLA_MODELO };
    const out = mkdtempSync(join(tmpdir(), "s038-kontrolo-"));
    const duobla = duoblaKuro({ faktoj });
    const { kuroj } = await kuriAblaufon(
      { taskoj: [LFD], maksTokenoj: 1_000_000, out },
      deps({ kuruEkranojn: duobla.kuruEkranojn, kiModelo: KONTROLA_MODELO, kontrolo: paro }),
    );
    expect(kuroj).toHaveLength(2);
    expect(duobla.vokoj.map((voko) => voko.enigo.kontrolo)).toEqual([paro, paro]);
    // The ministral measurement stays as it was: no pair in any run.
    const sen = duoblaKuro({ faktoj });
    await kuriAblaufon(
      { taskoj: [LFD], maksTokenoj: 1_000_000, out: mkdtempSync(join(tmpdir(), "s038-kontrolo-")) },
      deps({ kuruEkranojn: sen.kuruEkranojn }),
    );
    expect(sen.vokoj.map((voko) => voko.enigo.kontrolo)).toEqual([undefined, undefined]);
  });

  it("keeps one token budget over the whole measurement: the run at the limit stops, the next does not start", async () => {
    const out = mkdtempSync(join(tmpdir(), "s037-ablauf-"));
    // Each request: 400 in + 100 out, two per built round. F of liste-filter-detail builds rounds
    // 1–3 (3 000), its 0 round 1 (4 000; rounds 2 and 3 carried green). F of the second flow
    // builds round 1 (5 000) and stops before the next request; its 0 does not start.
    const { kuruEkranojn, vokoj } = duoblaKuro({ faktoj, sendojPerRondo: 2 });
    const { kuroj, raporto } = await kuriAblaufon(
      { taskoj: [LFD, UK], maksTokenoj: 5_000, out },
      deps({ kuruEkranojn }),
    );
    expect(
      kuroj.map((k) => [k.tasko, k.varianto, k.haltigo ?? null, k.nekomencita === true]),
    ).toEqual([
      [LFD, "F", null, false],
      [LFD, "0", null, false],
      [UK, "F", "max-tokens", false],
      [UK, "0", "max-tokens", true],
    ]);
    expect(vokoj).toHaveLength(3);
    const spent = kuroj.reduce((sumo, k) => sumo + k.peno.inputTokens + k.peno.outputTokens, 0);
    expect(spent).toBe(5_000);
    expect(kuroj[2]?.faritajRondoj).toBe(1);
    // Each run is told what is left of the shared limit.
    expect(vokoj.map((v) => v.enigo.maksTokenoj)).toEqual([5_000, 2_000, 1_000]);
    expect(raporto.datumoj.sumo.nekomencitaj).toBe(1);
    expect(raporto.md).toContain("nicht gestartet (Tokengrenze)");
  });

  it("records a run that fails as „eraro“ with the tokens it used, and goes on with the next", async () => {
    const out = mkdtempSync(join(tmpdir(), "s037-ablauf-"));
    const duobla = duoblaKuro({ faktoj });
    const { kuroj, raporto } = await kuriAblaufon(
      { taskoj: [LFD], maksTokenoj: 1_000_000, out },
      deps({
        kuruEkranojn: async (enigo, ekranojDeps) => {
          if (enigo.varianto === "F") {
            await ekranojDeps.chat.send([{ role: "user", content: "x" }]);
            throw new Error("Renderer weg");
          }
          return duobla.kuruEkranojn(enigo, ekranojDeps);
        },
      }),
    );
    expect(kuroj.map((k) => [k.varianto, k.haltigo ?? null, k.eraro ?? null])).toEqual([
      ["F", "eraro", "Renderer weg"],
      ["0", null, null],
    ]);
    expect(kuroj[0]?.peno).toMatchObject({ inputTokens: 400, outputTokens: 100 });
    expect(raporto.md).toContain(`- ${LFD} F-1: Halt Fehler – Renderer weg`);
  });

  it("marks the time values of a run whose load was above the cores (D-09)", async () => {
    const out = mkdtempSync(join(tmpdir(), "s037-ablauf-"));
    const { kuruEkranojn } = duoblaKuro({ faktoj });
    // Load counts up 1, 2, 3, …; with 2 cores the second run (load 3 → 4) is above.
    const { raporto } = await kuriAblaufon(
      { taskoj: [LFD], maksTokenoj: 1_000_000, out },
      deps({ kuruEkranojn }, 2),
    );
    expect(raporto.datumoj.kuroj.map((k) => k.lastoSuperKernoj)).toEqual([false, true]);
    expect(raporto.md.match(/\(Last > Kerne\)/g)).toHaveLength(1);
  });

  it("stores the effort per round and screen of ekranoj as penoj in kuro.json, and the plan share (C-3, AC-6a)", async () => {
    const out = mkdtempSync(join(tmpdir(), "s038-penoj-"));
    const duobla = duoblaKuro({ faktoj, sendojPerRondo: 1 });
    // The double of ekranoj with `peno` per build: F every screen in rounds 1 and 2 except the
    // first screen in round 2 (no request there); 0 without any `peno` (a result before C-6).
    const kunPenoj: KuruEkranojn = async (enigo, d) => {
      const rezulto = await duobla.kuruEkranojn(enigo, d);
      const unua = rezulto.plano.ekranoj[0]?.slug;
      return {
        ...rezulto,
        rondoj: rezulto.rondoj.map((rondo, index) =>
          Object.fromEntries(
            Object.entries(rondo).map(([slug, ekrano]) => {
              const kun = enigo.varianto === "F" && index < 2 && !(index === 1 && slug === unua);
              const peno: Peno = {
                inputTokens: 100 + index,
                outputTokens: 20,
                requests: 1,
                toolCalls: 2,
                ms: 7,
                bytes: 9,
              };
              return [slug, kun ? { ...ekrano, peno } : ekrano];
            }),
          ),
        ),
      };
    };
    const { dir } = await kuriAblaufon(
      { taskoj: [LFD], maksTokenoj: 1_000_000, out },
      deps({ kuruEkranojn: kunPenoj }),
    );
    const F = kuroJson(dir, LFD, "F");
    const slugoj = Object.keys(F.stato["1"] ?? {}).sort();
    expect(slugoj.length).toBeGreaterThan(1);
    const unua = taskoDe(LFD).ekranoj[0]?.slug;
    const dua = Object.keys(F.stato["2"] ?? {})
      .filter((slug) => slug !== unua)
      .sort();
    expect(dua.length).toBeGreaterThan(0);
    const kvar = (index: number): PenoKvar => ({
      inputTokens: 100 + index,
      outputTokens: 20,
      requests: 1,
      toolCalls: 2,
    });
    expect(F.penoj).toEqual({
      "1": Object.fromEntries(slugoj.map((slug) => [slug, kvar(0)])),
      "2": Object.fromEntries(dua.map((slug) => [slug, kvar(1)])),
    });
    // Σ penoj + penoPlano = the run peno for the four counters (D-191).
    const sumo = (kampo: keyof PenoKvar) =>
      Object.values(F.penoj ?? {})
        .flatMap((rondo) => Object.values(rondo))
        .reduce((a, peno) => a + peno[kampo], 0);
    expect(F.penoPlano).toEqual({
      inputTokens: F.peno.inputTokens - sumo("inputTokens"),
      outputTokens: F.peno.outputTokens - sumo("outputTokens"),
      requests: F.peno.requests - sumo("requests"),
      toolCalls: F.peno.toolCalls - sumo("toolCalls"),
    });
    // No `peno` anywhere: neither field; the other fields as before.
    const nul = kuroJson(dir, LFD, "0");
    expect("penoj" in nul).toBe(false);
    expect("penoPlano" in nul).toBe(false);
    const { penoj: _penoj, penoPlano: _penoPlano, ...senPenoj } = F;
    expect(Object.keys(senPenoj).sort()).toEqual(Object.keys(nul).sort());
    // The report data never carry penoj (integra-raporto.json stays byte-identical).
    expect(readFileSync(join(dir, "raporto.json"), "utf8")).not.toContain("penoj");
  });

  it("checks the settings with structured problems", () => {
    expect(
      validiAblaufon({
        taskoj: ["nenio"],
        varianten: ["X" as Varianto],
        ripetoj: 0,
        maksTokenoj: 0,
        out: "/tmp",
      }).map((p) => [p.path, p.rule]),
    ).toEqual([
      ["/taskoj/0", "ablauf-task-unknown"],
      ["/varianten/0", "ablauf-variant-unknown"],
      ["/ripetoj", "ablauf-repeats-invalid"],
      ["/maksTokenoj", "max-tokens-invalid"],
    ]);
    expect(validiAblaufon({ maksTokenoj: 1, out: "/tmp" })).toEqual([]);
  });

  it("charges the shared budget for every request of a run's chat model", async () => {
    const { Budget } = await import("@fundamento/metiejo");
    const komuna = new Budget(1_000);
    const chat = kunKomunaBudgxeto(kalkulantaChat({ input: 400, output: 100 }), komuna);
    await chat.send([]);
    await chat.send([]);
    expect(komuna.spent).toBe(1_000);
    await expect(chat.send([])).rejects.toThrow(/Kostengrenze/);
    // A scorer that ignores the facts still lets the run finish (no dependency on the real one).
    expect(konstantaTaksilo(50).taksi).toBeTypeOf("function");
  });
});

describe("provider errors in kuro.json (Spec 038 A-1, AK-2, C-1)", () => {
  // Invented secrets, built at run time so no source line looks like a key.
  const SK = ["sk", "or", "v1", "0f1e2d3c4b5a6978".repeat(4)].join("-");
  const BEARER_VALORO = "ab12cd34".repeat(5);
  const QUERY_VALORO = "erfunden123";
  const SEKRETOJ = [SK, BEARER_VALORO, QUERY_VALORO];
  const SEKRETA = `Anbieter mistral antwortet 500: {"error":"bad ${SK}","url":"https://api.example.test/v1?key=${QUERY_VALORO}","h":"Authorization: Bearer ${BEARER_VALORO}"}`;
  const senSekretoj = (teksto: string) => SEKRETOJ.filter((s) => teksto.includes(s));
  const ERO: AnbieterEraro = {
    ekrano: "liste",
    rondo: 2,
    provo: 1,
    status: 503,
    mesagxo: 'Anbieter mistral antwortet 503: {"message":"Service unavailable"}',
    ago: "ripeto",
  };

  it("stores the caught errors of a run in the shape of ekranoj, and no field when there are none", async () => {
    const out = mkdtempSync(join(tmpdir(), "s038-32-kuro-"));
    const duobla = duoblaKuro({ faktoj });
    const kunEroj: KuruEkranojn = async (enigo, d) => {
      const rezulto = await duobla.kuruEkranojn(enigo, d);
      return enigo.varianto === "F"
        ? { ...rezulto, anbieterfehleroj: [ERO, { ...ERO, provo: 2, mesagxo: SEKRETA }] }
        : rezulto;
    };
    const { dir } = await kuriAblaufon(
      { taskoj: [LFD], maksTokenoj: 1_000_000, out },
      deps({ kuruEkranojn: kunEroj }),
    );
    const f = kuroJson(dir, LFD, "F");
    expect(f.anbieterfehleroj?.[0]).toEqual(ERO);
    expect(f.anbieterfehleroj?.[1]).toMatchObject({
      ekrano: "liste",
      rondo: 2,
      provo: 2,
      status: 503,
      ago: "ripeto",
    });
    expect(senSekretoj(readFileSync(join(kuroDir(dir, LFD, "F", 1), "kuro.json"), "utf8"))).toEqual(
      [],
    );
    expect("anbieterfehleroj" in kuroJson(dir, LFD, "0")).toBe(false);
  });

  it("cleans the message of a run that fails and keeps the errors it carries (error path)", async () => {
    const out = mkdtempSync(join(tmpdir(), "s038-32-kuro-"));
    const duobla = duoblaKuro({ faktoj });
    const linioj: string[] = [];
    const { dir, kuroj, raporto } = await kuriAblaufon(
      { taskoj: [LFD], maksTokenoj: 1_000_000, out },
      deps({
        log: (linio) => linioj.push(linio),
        kuruEkranojn: async (enigo, ekranojDeps) => {
          if (enigo.varianto === "F") {
            throw Object.assign(new Error(SEKRETA), {
              anbieterfehleroj: [ERO, { ...ERO, provo: 2, mesagxo: SEKRETA }],
            });
          }
          return duobla.kuruEkranojn(enigo, ekranojDeps);
        },
      }),
    );
    const f = kuroj[0];
    expect(f?.haltigo).toBe("eraro");
    expect(f?.eraro?.startsWith("Anbieter mistral antwortet 500: ")).toBe(true);
    expect(f?.anbieterfehleroj?.map((e) => [e.ekrano, e.rondo, e.provo, e.status, e.ago])).toEqual([
      ["liste", 2, 1, 503, "ripeto"],
      ["liste", 2, 2, 503, "ripeto"],
    ]);
    const kuroTeksto = readFileSync(join(kuroDir(dir, LFD, "F", 1), "kuro.json"), "utf8");
    expect(senSekretoj(kuroTeksto)).toEqual([]);
    expect(senSekretoj(linioj.join("\n"))).toEqual([]);
    expect(senSekretoj(raporto.md)).toEqual([]);
    expect("anbieterfehleroj" in (kuroj[1] ?? {})).toBe(false);
  });
});

describe("open deviations per rule in kuro.json and the report (Spec 038 A-2, AK-5, C-2)", () => {
  const slugoj = taskoDe(LFD).ekranoj.map((ekrano) => ekrano.slug);
  const [unua = "", dua = "", lasta = ""] = slugoj;
  const restanta = (ekrano: string, regulo: string): Restanta => ({
    ekrano,
    regulo,
    loko: `${ekrano}.html`,
    kialo: `${regulo} offen`,
  });
  // The last screen is never built (`nicht-gebaut`); rule totals aria 2, ero-prop-constraint 2,
  // label 1, nicht-gebaut 1 – the top three are aria, ero-prop-constraint (tie by name) and label
  // (tie with nicht-gebaut, by name).
  const RESTANTAJ: Restanta[] = [
    restanta(unua, "ero-prop-constraint"),
    restanta(dua, "aria"),
    restanta(unua, "aria"),
    restanta(lasta, "nicht-gebaut"),
    restanta(dua, "label"),
    restanta(unua, "ero-prop-constraint"),
  ];
  const LAUX_REGULO = {
    [unua]: { aria: 1, "ero-prop-constraint": 2 },
    [dua]: { aria: 1, label: 1 },
    [lasta]: { "nicht-gebaut": 1 },
  };

  /** F leaves the last screen unbuilt and the deviations above; 0 leaves nothing open. */
  const kunRestantaj = (): KuruEkranojn => {
    const duobla = duoblaKuro({ faktoj });
    return async (enigo, d) => {
      const rezulto = await duobla.kuruEkranojn(enigo, d);
      if (enigo.varianto !== "F") return rezulto;
      return {
        ...rezulto,
        rondoj: rezulto.rondoj.map((rondo) =>
          Object.fromEntries(Object.entries(rondo).filter(([slug]) => slug !== lasta)),
        ),
        restantaj: RESTANTAJ,
      };
    };
  };

  it("counts the deviations of ekranoj per slug and rule, sorted, whatever their order", () => {
    expect(restantajLauxReguloDe(RESTANTAJ)).toEqual(LAUX_REGULO);
    const inversa = restantajLauxReguloDe([...RESTANTAJ].reverse());
    expect(stabilaJson(inversa)).toBe(stabilaJson(LAUX_REGULO));
    expect(Object.keys(inversa)).toEqual(Object.keys(inversa).sort());
    for (const reguloj of Object.values(inversa))
      expect(Object.keys(reguloj)).toEqual(Object.keys(reguloj).sort());
    expect(restantajLauxReguloDe([])).toEqual({});
  });

  it("stores restantajLauxRegulo per slug of the last round, Σ = restantaj (unbuilt screens included)", async () => {
    const out = mkdtempSync(join(tmpdir(), "s038-33-kuro-"));
    const { dir, raporto } = await kuriAblaufon(
      { taskoj: [LFD], maksTokenoj: 1_000_000, out },
      deps({ kuruEkranojn: kunRestantaj() }),
    );
    const f = kuroJson(dir, LFD, "F");
    // The existing number is unchanged: the length of the list of ekranoj.
    expect(f.restantaj).toBe(RESTANTAJ.length);
    expect(f.restantajLauxRegulo).toEqual(LAUX_REGULO);
    expect(f.restantajLauxRegulo?.[lasta]).toEqual({ "nicht-gebaut": 1 });
    // The sum check (C-2): Σ over every slug and rule === restantaj.
    const sumo = Object.values(f.restantajLauxRegulo ?? {})
      .flatMap((reguloj) => Object.values(reguloj))
      .reduce((a, b) => a + b, 0);
    expect(sumo).toBe(f.restantaj);
    // Nothing open: the field is there and empty, restantaj 0.
    const nul = kuroJson(dir, LFD, "0");
    expect(nul.restantaj).toBe(0);
    expect(nul.restantajLauxRegulo).toEqual({});

    // The report: the three most frequent rules per flow × variant, ties by name.
    expect(raporto.md).toContain(
      "## Offene Abweichungen je Regel (nach der letzten Runde, häufigste drei)",
    );
    expect(raporto.md).toContain("| Aufgabe | Variante | offen | häufigste Regeln |");
    expect(raporto.md).toContain(
      `| ${LFD} | F | ${RESTANTAJ.length} | aria 2, ero-prop-constraint 2, label 1 |`,
    );
    expect(raporto.md).toContain(`| ${LFD} | 0 | 0 | – |`);
    expect(readFileSync(join(dir, "raporto.md"), "utf8")).toBe(raporto.md);
    // The report data stay as they were (integra-raporto.json byte-identical).
    const json = readFileSync(join(dir, "raporto.json"), "utf8");
    expect(json).not.toContain("restantajLauxRegulo");
    expect(json).not.toContain("restantajSupraj");
  });

  it("writes the same kuro.json and report twice", async () => {
    const kuri = async () => {
      const out = mkdtempSync(join(tmpdir(), "s038-33-kuro-"));
      const { dir, raporto } = await kuriAblaufon(
        { taskoj: [LFD], maksTokenoj: 1_000_000, out },
        deps({ kuruEkranojn: kunRestantaj() }),
      );
      return {
        kuro: readFileSync(join(kuroDir(dir, LFD, "F", 1), "kuro.json"), "utf8"),
        md: raporto.md,
      };
    };
    const unuaKuro = await kuri();
    const duaKuro = await kuri();
    expect(duaKuro.kuro).toBe(unuaKuro.kuro);
    expect(duaKuro.md).toBe(unuaKuro.md);
    expect(unuaKuro.kuro).toContain('"restantajLauxRegulo"');
  });

  it("has no restantajLauxRegulo on the error path; the report says „nicht vorhanden“", async () => {
    const out = mkdtempSync(join(tmpdir(), "s038-33-kuro-"));
    const duobla = duoblaKuro({ faktoj });
    const { dir, kuroj, raporto } = await kuriAblaufon(
      { taskoj: [LFD], maksTokenoj: 1_000_000, out },
      deps({
        kuruEkranojn: async (enigo, ekranojDeps) => {
          if (enigo.varianto === "F") throw new Error("Renderer weg");
          return duobla.kuruEkranojn(enigo, ekranojDeps);
        },
      }),
    );
    expect(kuroj[0]?.haltigo).toBe("eraro");
    expect(kuroj[0]?.restantaj).toBe(0);
    expect("restantajLauxRegulo" in (kuroj[0] ?? {})).toBe(false);
    expect("restantajLauxRegulo" in kuroJson(dir, LFD, "F")).toBe(false);
    expect(kuroJson(dir, LFD, "0").restantajLauxRegulo).toEqual({});
    expect(raporto.md).toContain(`| ${LFD} | F | – | nicht vorhanden |`);
    expect(raporto.md).toContain(`| ${LFD} | 0 | 0 | – |`);
  });
});
