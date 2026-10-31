// The report of the measurement „ganzer Ablauf“ is a function of the stored records (D-33, AC-11):
// rebuilt from the run folder it gives the same bytes, also in another folder (no timestamp in
// the content), and the spread it compares against is the one of its source.

import { cpSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PERMESITA_MODELO, type Varianto } from "@fundamento/ekranoj";
import { defaultModeloSource, loadModelo, type Modelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { type AblaufTasko, trovuTaskon } from "./katalogo.js";
import { kuriAblaufon } from "./kuro.js";
import { legiKatalogon } from "./poentoj.js";
import {
  lastoSuperKernoj,
  raporto,
  STREUUNG_FONTO,
  STREUUNG_REIHE_K,
  stabilaJson,
  taksiloPorMezuro,
} from "./raporto.js";
import {
  ASPEKTOJ_DUOBLAJ,
  duoblaKuro,
  faktojElDosierujo,
  kalkulantaChat,
} from "./test-doubles/ekranoj.js";

const geladen = loadModelo(defaultModeloSource()).modelo;
if (geladen === undefined) throw new Error("the repository Modelo must load");
const modelo: Modelo = geladen;
const katalogo = legiKatalogon();
const fixtures = fileURLToPath(new URL("../../test/fixtures/ablauf/", import.meta.url));
const ROOT = fileURLToPath(new URL("../../../../", import.meta.url));

async function stokitaKuro(): Promise<string> {
  const out = mkdtempSync(join(tmpdir(), "s037-raporto-"));
  const { kuruEkranojn } = duoblaKuro({
    faktoj: (_tasko: string, varianto: Varianto) =>
      faktojElDosierujo(`${fixtures}liste-filter-detail/${varianto}/`),
  });
  const { dir } = await kuriAblaufon(
    { taskoj: ["liste-filter-detail"], maksTokenoj: 1_000_000, out },
    {
      kuruEkranojn,
      kiModelo: PERMESITA_MODELO,
      kuraDeps: () => ({
        chat: kalkulantaChat({ input: 400, output: 100, modelo: PERMESITA_MODELO }),
        tools: { list: async () => [], call: async () => "" },
        marko: { konstrui: async () => ({ css: [] }) },
        nun: () => new Date(Date.UTC(2026, 9, 31, 9, 5)),
        log: () => undefined,
      }),
      taksiloPor: (tasko: AblaufTasko) => taksiloPorMezuro({ modelo, katalogo, tasko }),
      modelo,
      markoj: ASPEKTOJ_DUOBLAJ,
      sxargo: () => ({ sxargo: { l1: 1.5, l5: 1.25, l15: 1 }, kernoj: 8 }),
      nun: () => new Date(Date.UTC(2026, 9, 31, 9, 5)),
      commit: "abc1234",
      log: () => undefined,
    },
  );
  return dir;
}

describe("the report of a measurement „ganzer Ablauf“", () => {
  it("is rebuilt from the stored records byte for byte (determinism, AC-11)", async () => {
    const dir = await stokitaKuro();
    const md = readFileSync(join(dir, "raporto.md"), "utf8");
    const json = readFileSync(join(dir, "raporto.json"), "utf8");
    const again = raporto(dir);
    expect(again.md).toBe(md);
    expect(stabilaJson(again.datumoj)).toBe(json);
    // Twice in a row, and with the files removed: the same.
    rmSync(join(dir, "raporto.md"));
    rmSync(join(dir, "raporto.json"));
    expect(raporto(dir).md).toBe(md);
    expect(stabilaJson(raporto(dir).datumoj)).toBe(json);
  });

  it("carries no timestamp: the same records in another folder give the same report but for the run id", async () => {
    const dir = await stokitaKuro();
    const id = dir.split("/").at(-1) ?? "";
    expect(id).toBe("20261031-0905");
    const other = join(mkdtempSync(join(tmpdir(), "s037-raporto-")), "20991231-2359");
    cpSync(dir, other, { recursive: true });
    const md = raporto(other).md;
    expect(md).toContain("20991231-2359");
    expect(md.replaceAll("20991231-2359", id)).toBe(raporto(dir).md);
    expect(md).not.toMatch(/2026-10-31|T\d\d:\d\d/);
  });

  it("names the spread of Reihe K with the value of its source line", () => {
    const cut = STREUUNG_FONTO.indexOf(", „");
    const [file, line] = [STREUUNG_FONTO.slice(0, cut), STREUUNG_FONTO.slice(cut + 2)];
    const plan = readFileSync(join(ROOT, file ?? ""), "utf8");
    const match = /Streuung \(H [\d,]+, K ([\d,]+)\)/.exec(plan);
    expect(line).toBe(`„${match?.[0]}“`);
    expect(STREUUNG_REIHE_K).toBe(Number(match?.[1]?.replace(",", ".")));
  });

  it("states the brands, the spread, tokens and $ by kostoOf in the report", async () => {
    const dir = await stokitaKuro();
    const { md, datumoj } = raporto(dir);
    expect(md).toContain(
      `Marken: ${ASPEKTOJ_DUOBLAJ.join(", ")} × hell/dunkel, Kontrast Standard (D-39)`,
    );
    expect(md).toContain(`Streuung Reihe K: 16,7 Punkte (Quelle: ${STREUUNG_FONTO})`);
    // The double sends nothing: 0 tokens, 0 $ (ministral has a price; unknown would say so).
    expect(datumoj.sumo).toMatchObject({ tokenoj: { enigo: 0, eligo: 0 }, usd: 0, kuroj: 2 });
    expect(md).toContain("Kosten 0 $");
    expect(datumoj.kuroj.every((k) => k.lastoSuperKernoj === false)).toBe(true);
    expect(
      lastoSuperKernoj({
        antaux: { l1: 9, l5: 1, l15: 1 },
        post: { l1: 1, l5: 1, l15: 1 },
        kernoj: 8,
      }),
    ).toBe(true);
  });

  it("says „Kosten unbekannt“ for a model without a price, never 0", async () => {
    const dir = await stokitaKuro();
    const lauf = JSON.parse(readFileSync(join(dir, "lauf.json"), "utf8")) as Record<
      string,
      unknown
    >;
    const other = join(mkdtempSync(join(tmpdir(), "s037-raporto-")), "20261031-0905");
    cpSync(dir, other, { recursive: true });
    const { writeFileSync } = await import("node:fs");
    writeFileSync(
      join(other, "lauf.json"),
      stabilaJson({ ...lauf, kiModelo: "nenia/modelo-sen-prezo" }),
    );
    const { md, datumoj } = raporto(other);
    expect(datumoj.sumo.usd).toBeNull();
    expect(md).toContain("· Kosten unbekannt (metiejo");
    expect(trovuTaskon("liste-filter-detail")).toBeDefined();
  });
});
