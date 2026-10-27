// Spec 030 (Verlauf und Rückkopplung): the Metiejo shows the north-star measure over time – every
// run with date, commit and model, the figure of Variante F against Variante 0 – and for the
// latest run each task with a link to the page the agent built and its screenshot. It reads
// .fundamento/nordstelo/historio.json in the checkout, which `pnpm nordstelo` writes.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseEnv, settingsOf } from "./env.js";
import { type NordsteloHistorio, nordsteloScreen } from "./nordstelo.js";
import { type Servilo, startServilo } from "./servilo.js";

const historio: NordsteloHistorio = {
  kuroj: [
    {
      id: "20261023-2200",
      dato: "2026-10-23T22:00:00.000Z",
      commit: "d29a520",
      anbieter: "mistral",
      modell: "mistral-large-latest",
      kennzahl: { F: 61.5, "0": 22 },
      streuung: { F: 8, "0": 12 },
      tokens: { input: 2_400_000, output: 300_000 },
      taskoj: [
        {
          tasko: "anmeldung",
          F: 80,
          "0": 30,
          pagxo: "20261023-2200/anmeldung/F-1/pagxo.html",
          bildo: "20261023-2200/anmeldung/F-1/bildo.png",
        },
      ],
    },
    {
      id: "20261030-0900",
      dato: "2026-10-30T09:00:00.000Z",
      commit: "abc1234",
      anbieter: "mistral",
      modell: "mistral-large-latest",
      kennzahl: { F: 70, "0": 21 },
      streuung: { F: 6, "0": 10 },
      tokens: { input: 2_500_000, output: 310_000 },
      abgebrochen: "Kostengrenze 3000000 Tokens erreicht",
      taskoj: [
        {
          tasko: "anmeldung",
          F: 90,
          "0": 25,
          pagxo: "20261030-0900/anmeldung/F-1/pagxo.html",
          bildo: "20261030-0900/anmeldung/F-1/bildo.png",
        },
      ],
    },
  ],
};

describe("nordsteloScreen", () => {
  const html = nordsteloScreen(historio);

  it("lists every run with date, commit, model, the figure F against 0, spread and tokens", () => {
    for (const text of [
      "d29a520",
      "abc1234",
      "mistral-large-latest",
      "61,5",
      "22",
      "70",
      "2.400.000",
      "Kostengrenze",
    ]) {
      expect(html, text).toContain(text);
    }
    expect(html.indexOf("abc1234")).toBeLessThan(html.indexOf("d29a520"));
  });

  it("draws the course of F and 0 over time", () => {
    expect(html).toMatch(/<svg[^>]*role="img"[^>]*aria-label="[^"]*Verlauf/);
    expect(html.match(/<polyline/g)).toHaveLength(2);
  });

  it("shows each task of the latest run with a link to its page and its screenshot", () => {
    expect(html).toContain('href="/nordstelo/dosiero/20261030-0900/anmeldung/F-1/pagxo.html"');
    expect(html).toContain('src="/nordstelo/dosiero/20261030-0900/anmeldung/F-1/bildo.png"');
  });

  it("says what to do when there is no run yet", () => {
    expect(nordsteloScreen({ kuroj: [] })).toContain("pnpm nordstelo");
  });
});

describe("the route /nordstelo", () => {
  const scratch = mkdtempSync(join(tmpdir(), "metiejo-nordstelo-"));
  const root = join(scratch, "checkout");
  const dir = join(root, ".fundamento", "nordstelo");
  let servilo: Servilo;

  beforeAll(async () => {
    mkdirSync(join(dir, "20261030-0900", "anmeldung", "F-1"), { recursive: true });
    writeFileSync(join(dir, "historio.json"), JSON.stringify(historio));
    writeFileSync(join(dir, "20261030-0900", "anmeldung", "F-1", "pagxo.html"), "<p>Seite</p>");
    servilo = await startServilo(
      { port: 0, workdir: join(scratch, "marken"), root, settings: settingsOf(parseEnv("")) },
      { stderr: () => {} },
    );
  });
  afterAll(async () => {
    await servilo.close();
    rmSync(scratch, { recursive: true, force: true });
  });

  it("serves the history and the files of the runs, nothing outside", async () => {
    const page = await fetch(`${servilo.url}/nordstelo`);
    expect(page.status).toBe(200);
    expect(await page.text()).toContain("abc1234");
    const file = await fetch(
      `${servilo.url}/nordstelo/dosiero/20261030-0900/anmeldung/F-1/pagxo.html`,
    );
    expect(await file.text()).toBe("<p>Seite</p>");
    const outside = await fetch(`${servilo.url}/nordstelo/dosiero/..%2F..%2Fpackage.json`);
    expect(outside.status).toBe(404);
  });
});

// Nachlese 11 ② (O-1 der Spec 030): the figure in the weighting of Nachlese 11 with the gate of
// Markenfähigkeit, and beside it the one of Spec 030, so the rule is seen to come from the north
// star and not from the result.
describe("nordsteloScreen with both weightings (Nachlese 11)", () => {
  const both: NordsteloHistorio = {
    kuroj: [
      {
        ...(historio.kuroj[0] as NordsteloHistorio["kuroj"][number]),
        kennzahl: { F: 70.4, "0": 31.2 },
        kennzahlAntauxa: { F: 71, "0": 74.3 },
      },
    ],
  };
  const html = nordsteloScreen(both);

  it("shows the figure of Spec 030 beside the new one", () => {
    expect(html).toContain("Spec 030");
    expect(html).toContain("74,3");
    expect(html).toContain("31,2");
  });
});
