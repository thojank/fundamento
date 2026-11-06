// The report of the measurement „ganzer Ablauf“ is a function of the stored records (D-33, AC-11):
// rebuilt from the run folder it gives the same bytes, also in another folder (no timestamp in
// the content), and the spread it compares against is the one of its source.

import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { type Fakto, PERMESITA_MODELO, type Varianto } from "@fundamento/ekranoj";
import { defaultModeloSource, loadModelo, type Modelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import type { TaksadoK8 } from "../ekrano-taksilo.js";
import type { Facts, Render } from "../facts.js";
import { type AblaufTasko, planoDe, trovuTaskon } from "./katalogo.js";
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

// Spec 038 Lauf 2 (2.4, contract C-E): K8 is a column of its own after „Muster“ and a section of
// its own; without K8 facts it reads „nicht geprüft“ and no `k8` key enters the data (D-98, D-106).
describe("the report of a measurement „ganzer Ablauf“: K8 (Spec 038, 2.4)", () => {
  const ANTEILE = "## Anteile je Aufgabe, Variante und Runde";
  const JE_SCREEN = "## Je Screen und Runde";
  const ABSCHNITT = "## K8 je Merkmal und Kombination";

  /** The table under a heading: its lines up to the next blank line after the header. */
  const tabelo = (md: string, kapo: string): string[] => {
    const lines = md.split("\n");
    const start = lines.findIndex((line) => line.startsWith(kapo));
    expect(start, kapo).toBeGreaterThanOrEqual(0);
    const rows: string[] = [];
    for (const line of lines.slice(start + 2)) {
      if (line === "") break;
      rows.push(line);
    }
    return rows;
  };

  /** Every key of a JSON value, at any depth. */
  const sxlosiloj = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.flatMap(sxlosiloj)
      : value !== null && typeof value === "object"
        ? Object.entries(value).flatMap(([key, own]) => [key, ...sxlosiloj(own)])
        : [];

  const k8Renders: Render[] = (
    JSON.parse(
      readFileSync(
        fileURLToPath(new URL("../../test/fixtures/k8/sxablono/faktoj.json", import.meta.url)),
        "utf8",
      ),
    ) as Facts
  ).renders;

  /** A copy of the run whose stored facts carry the K8 facts of the fixture per combination. */
  async function kuroKunK8(): Promise<string> {
    const dir = await stokitaKuro();
    const id = dir.split("/").at(-1) ?? "";
    const copy = join(mkdtempSync(join(tmpdir(), "s038-raporto-k8-")), id);
    cpSync(dir, copy, { recursive: true });
    const files = readdirSync(copy, { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(".fakto.json"))
      .sort();
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const facts = JSON.parse(readFileSync(join(copy, file), "utf8")) as Facts;
      const renders = facts.renders.map((render): Render => {
        const own = k8Renders.find(
          (other) =>
            other.aspekto === render.aspekto &&
            other.scheme === render.scheme &&
            other.contrast === render.contrast,
        );
        return own?.k8 === undefined ? render : { ...render, k8: own.k8 };
      });
      expect(
        renders.some((render) => render.k8 !== undefined),
        file,
      ).toBe(true);
      writeFileSync(join(copy, file), stabilaJson({ ...facts, renders }));
    }
    return copy;
  }

  it("puts the column K8 after „Muster“ in both tables", async () => {
    const { md } = raporto(await stokitaKuro());
    const anteile = tabelo(md, ANTEILE)[0] ?? "";
    const jeScreen = tabelo(md, JE_SCREEN)[0] ?? "";
    expect(anteile.endsWith("| Total | Navigation | Muster | K8 |")).toBe(true);
    expect(jeScreen.endsWith("| Total | Navigation | Muster | K8 | grün |")).toBe(true);
    // The separator has one cell per header cell.
    for (const kapo of [ANTEILE, JE_SCREEN]) {
      const [header = "", separator = ""] = tabelo(md, kapo);
      expect(separator.split("|").length, kapo).toBe(header.split("|").length);
    }
  });

  it("says „nicht geprüft“ for the stored facts and puts no k8 key into the data", async () => {
    const { md, datumoj } = raporto(await stokitaKuro());
    for (const kapo of [ANTEILE, JE_SCREEN]) {
      const rows = tabelo(md, kapo).slice(2);
      expect(rows.length, kapo).toBeGreaterThan(0);
      for (const row of rows) expect(row, kapo).toContain("| nicht geprüft |");
    }
    expect(md).not.toContain(ABSCHNITT);
    expect(sxlosiloj(datumoj)).not.toContain("k8");
  });

  it("with K8 facts gives the value per flow and screen and the section, byte for byte twice", async () => {
    const dir = await kuroKunK8();
    const unua = raporto(dir);
    const dua = raporto(dir);
    expect(dua.md).toBe(unua.md);
    expect(stabilaJson(dua.datumoj)).toBe(stabilaJson(unua.datumoj));

    const { md, datumoj } = unua;
    expect(md).toContain(ABSCHNITT);
    for (const kapo of [ANTEILE, JE_SCREEN]) {
      const rows = tabelo(md, kapo).slice(2);
      expect(rows.length, kapo).toBeGreaterThan(0);
      for (const row of rows) expect(row, kapo).not.toContain("nicht geprüft");
    }
    const sekcio = tabelo(md, ABSCHNITT);
    expect(sekcio.length).toBeGreaterThan(2);

    // The same K8 as the scorer of the measurement gives for the stored facts of a screen.
    const tasko = trovuTaskon("liste-filter-detail");
    if (tasko === undefined) throw new Error("the flow liste-filter-detail must exist");
    const taksilo = taksiloPorMezuro({ modelo, katalogo, tasko });
    const kuro = datumoj.kuroj.find((own) => own.varianto === "F");
    const [rondo, valoroj] = Object.entries(kuro?.rondoj ?? {})[0] ?? [];
    expect(valoroj).toBeDefined();
    for (const [slug, valoro] of Object.entries(valoroj?.ekranoj ?? {})) {
      const fakto = JSON.parse(
        readFileSync(
          join(dir, "liste-filter-detail", "F", "1", "rondoj", rondo ?? "", `${slug}.fakto.json`),
          "utf8",
        ),
      ) as Fakto;
      const ekrano = planoDe(tasko).ekranoj.find((own) => own.slug === slug);
      if (ekrano === undefined) throw new Error(`no screen ${slug}`);
      const taksado: TaksadoK8 = taksilo.taksi({ fakto, ekrano, varianto: "F" });
      const expected = taksado.k8?.kvoto;
      expect(expected, slug).toBeDefined();
      expect(valoro.k8, slug).toBe(expected);
    }
    expect(typeof valoroj?.fluo.k8).toBe("number");
  });
});
