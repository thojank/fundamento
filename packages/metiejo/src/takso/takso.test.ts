// Spec 033 S6: time and cost of the language model, estimated before the start per path and model
// and counted during the work. Prices are data with a date and a source (prezoj.json). The estimate
// stands on measured averages: at first the start values of the trial runs of S1–S5 (takso.json)
// and the speed of a model in the runs of the Nordstern-Kennzahl, later the Kroniko of the brands.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import type { KronikoEro } from "../asistanto/kroniko.js";
import { kostoOf, PREZOJ, prezoOf } from "./prezoj.js";
import {
  type Mezuro,
  mezurojOf,
  nordsteloRapidoj,
  STARTO,
  taksi,
  taksoSatz,
  zaehlilo,
} from "./takso.js";

const MINISTRAL = "mistral/ministral-14b-2512";
const NEMOTRON = "openrouter/nvidia/nemotron-3-ultra-550b-a55b:free";
const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-takso-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const ero = (input: Partial<KronikoEro>): KronikoEro => ({
  tempo: "2026-10-29T12:00:00.000Z",
  ago: "babilo",
  fonto: "babilo",
  persono: null,
  rolo: null,
  ...input,
});

describe("prices as data with a date (Spec 033 S6)", () => {
  it("names ministral-14b-2512 and voxtral-mini-transcribe-3-0 with price, date and source", () => {
    const chat = prezoOf(MINISTRAL);
    expect(chat).toMatchObject({ enigo: 0.2, eligo: 0.2 });
    const voxtral = prezoOf("mistral/voxtral-mini-transcribe-3-0");
    expect(voxtral?.minuto).toBe(0.0035);
    for (const prezo of PREZOJ.modeloj) {
      expect(prezo.dato, prezo.modelo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(prezo.fonto, prezo.modelo).toMatch(/^https:\/\//);
    }
  });

  it("charges tokens per million and audio per minute; :free costs nothing; an unknown model has no price", () => {
    expect(kostoOf(MINISTRAL, { enigo: 6696, eligo: 151 })).toBeCloseTo(0.0013694, 7);
    expect(
      kostoOf("mistral/voxtral-mini-transcribe-3-0", { enigo: 0, eligo: 0, sekundoj: 60 }),
    ).toBeCloseTo(0.0035, 7);
    expect(kostoOf(NEMOTRON, { enigo: 50_000, eligo: 900 })).toBe(0);
    expect(kostoOf("openai/ein-modell-ohne-preis", { enigo: 10, eligo: 10 })).toBeUndefined();
  });
});

describe("the counter of a brand from its Kroniko (Spec 033 S6)", () => {
  it("sums tokens, requests, time, waits and dollars, the transcription by its seconds", () => {
    const sum = zaehlilo([
      ero({
        modelo: MINISTRAL,
        kosto: { enigo: 1000, eligo: 50, ms: 2000, requests: 2 },
        detaloj: { atendoj: 1 },
      }),
      ero({
        fonto: "parolo",
        modelo: MINISTRAL,
        kosto: { enigo: 500, eligo: 20, ms: 1500, requests: 1 },
        detaloj: {
          atendoj: 0,
          transkribo: { modelo: "mistral/voxtral-mini-transcribe-3-0", ms: 400, sekundoj: 30 },
        },
      }),
      ero({ ago: "sxangxo", fonto: "regilo", faceto: "formo" }),
    ]);
    expect(sum).toMatchObject({ enigo: 1500, eligo: 70, requests: 3, ms: 3900, atendoj: 1 });
    expect(sum.usd).toBeCloseTo(1570 * 0.2e-6 + 0.5 * 0.0035, 8);
    expect(sum.senPrezo).toEqual([]);
  });

  it("names a model without a price instead of counting it as free", () => {
    const sum = zaehlilo([
      ero({ modelo: "openai/ein-modell-ohne-preis", kosto: { enigo: 10, eligo: 1, ms: 5 } }),
    ]);
    expect(sum.usd).toBeUndefined();
    expect(sum.senPrezo).toEqual(["openai/ein-modell-ohne-preis"]);
  });
});

describe("the measurements: Kroniko and Nordstern runs (Spec 033 S6)", () => {
  it("tells the turns apart: Kreilo (Weg A), research (Weg C), speech and chat", () => {
    const mezuroj = mezurojOf([
      ero({
        modelo: MINISTRAL,
        kosto: { enigo: 900, eligo: 40, ms: 1800, requests: 2 },
        detaloj: { vojo: "A" },
      }),
      ero({
        fonto: "agento",
        modelo: MINISTRAL,
        kosto: { enigo: 1400, eligo: 120, ms: 5000, requests: 3 },
      }),
      ero({
        fonto: "parolo",
        modelo: MINISTRAL,
        kosto: { enigo: 3900, eligo: 70, ms: 9000, requests: 3 },
      }),
      ero({ modelo: MINISTRAL, kosto: { enigo: 2400, eligo: 60, ms: 4000, requests: 2 } }),
      ero({ ago: "sxangxo", fonto: "babilo", faceto: "formo" }),
    ]);
    expect(mezuroj.map((mezuro) => mezuro.zugo)).toEqual(["kreilo", "esploro", "parolo", "babilo"]);
    expect(mezuroj[0]).toMatchObject({
      modelo: MINISTRAL,
      requests: 2,
      enigo: 900,
      eligo: 40,
      ms: 1800,
    });
  });

  it("reads the time per request of a model from the runs of the Nordstern-Kennzahl", () => {
    const dir = join(scratch, "nordstelo");
    const run = join(dir, "20261029-1127");
    mkdirSync(join(run, "anmeldung", "F-1"), { recursive: true });
    mkdirSync(join(run, "anmeldung", "F-2"), { recursive: true });
    mkdirSync(join(dir, "projekcioj"), { recursive: true });
    writeFileSync(
      join(run, "stato.json"),
      JSON.stringify({ anbieter: "mistral", modell: "ministral-14b-2512" }),
    );
    writeFileSync(
      join(run, "anmeldung", "F-1", "rezulto.json"),
      JSON.stringify({ effort: { requests: 4, ms: 8000 } }),
    );
    writeFileSync(
      join(run, "anmeldung", "F-2", "rezulto.json"),
      JSON.stringify({ effort: { requests: 6, ms: 12_000 } }),
    );
    expect(nordsteloRapidoj(dir).get(MINISTRAL)).toBe(2000);
    expect(nordsteloRapidoj(join(scratch, "fehlt")).size).toBe(0);
  });
});

describe("the estimate before the start, per path and model (Spec 033 S6)", () => {
  it("has start values for every turn and the three paths, each with its source", () => {
    for (const zugo of ["kreilo", "babilo", "parolo", "esploro", "materialo"] as const) {
      expect(STARTO.zugoj[zugo].fonto.length, zugo).toBeGreaterThan(10);
    }
    for (const vojo of ["A", "B", "C"] as const)
      expect(STARTO.vojoj[vojo].fonto.length).toBeGreaterThan(10);
    expect(STARTO.zugoj.materialo.requests).toBe(0);
  });

  it("from the start values, Weg A lies within ±50 % of the measured Abnahme 1 (6 847 tokens, 36,2 s)", () => {
    const takso = taksi({ vojo: "A", modelo: MINISTRAL });
    expect(takso.bazo).toBe("start");
    expect(takso.enigo + takso.eligo).toBeGreaterThan(6847 * 0.5);
    expect(takso.enigo + takso.eligo).toBeLessThan(6847 * 1.5);
    expect(takso.ms).toBeGreaterThan(36_200 * 0.5);
    expect(takso.ms).toBeLessThan(36_200 * 1.5);
    expect(takso.usd).toBeCloseTo(((takso.enigo + takso.eligo) * 0.2) / 1e6, 8);
  });

  it("for another model the Nordstern runs scale the time by the speed of the model", () => {
    const rapidoj = new Map([
      [MINISTRAL, 8000],
      [NEMOTRON, 24_000],
    ]);
    const start = taksi({ zugo: "babilo", modelo: MINISTRAL });
    const scaled = taksi({ zugo: "babilo", modelo: NEMOTRON, rapidoj });
    expect(scaled.bazo).toBe("nordstern");
    expect(scaled.ms).toBe(Math.round(start.ms * 3));
    expect(scaled.usd).toBe(0);
  });

  it("without any measurement of the model it says the values were measured with another", () => {
    const takso = taksi({ zugo: "babilo", modelo: "openai/ein-modell-ohne-preis" });
    expect(takso.bazo).toBe("start");
    expect(takso.usd).toBeUndefined();
    expect(taksoSatz(takso)).toContain(MINISTRAL);
    expect(taksoSatz(takso)).toContain("Kosten unbekannt");
  });

  it("once the Kroniko has turns of the model, their median is the estimate", () => {
    const mezuroj: Mezuro[] = [1000, 3000, 2000].map((enigo, index) => ({
      zugo: "babilo",
      modelo: MINISTRAL,
      requests: 2 + index,
      enigo,
      eligo: 50,
      ms: 4000,
    }));
    const takso = taksi({ zugo: "babilo", modelo: MINISTRAL, mezuroj });
    expect(takso).toMatchObject({ bazo: "protokoll", n: 3, enigo: 2000, requests: 3, ms: 4000 });
  });

  it("says it in one line: time, tokens, dollars and the basis", () => {
    const satz = taksoSatz({
      requests: 7,
      enigo: 6700,
      eligo: 150,
      ms: 36_200,
      usd: 0.00137,
      bazo: "protokoll",
      n: 4,
      modelo: MINISTRAL,
    });
    expect(satz).toBe("≈ 36 s · ≈ 6 850 Tokens · ≈ 0,0014 $ · Grundlage: Protokoll (4 Züge)");
  });
});
