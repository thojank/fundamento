// The run of the measurement „ganzer Ablauf“ (Spec 037, Lieferliste 2.3, AC-11, AC-12): two flows
// × two variants through a `kuruEkranojn` double, the rounds 1 and 3 stored per run, the report
// with F against 0 and round 1 against round 3 per flow and per screen, the model guard before any
// request, one Budget over the whole measurement and the load before and after each run.

import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { MalpermesitaModelo, PERMESITA_MODELO, type Varianto } from "@fundamento/ekranoj";
import { defaultModeloSource, loadModelo, type Modelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { type AblaufTasko, planoDe, trovuTaskon } from "./katalogo.js";
import { type AblaufDeps, kunKomunaBudgxeto, kuriAblaufon, validiAblaufon } from "./kuro.js";
import type { FluaPoento, KuraPoento } from "./poentoj.js";
import { legiKatalogon } from "./poentoj.js";
import { type KuroRekordo, kuroDir, type LaufRekordo, taksiloPorMezuro } from "./raporto.js";
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
