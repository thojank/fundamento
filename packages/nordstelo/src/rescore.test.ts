// Determinism (Spec 030): the score of a stored result is always the same number. The fixtures
// are pages from the first run against the provider, with the facts their render produced; the
// test scores them again against the Modelo and the catalogue of this commit and expects the
// stored score, twice in a row. Only the generation by the agent varies, never the scoring.
// Nachlese 11 ②: the fixtures were scored by the rules of Spec 030; the old weighting (without the
// gate of Markenfähigkeit) gives their stored number again, the new one a number of its own.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defaultModeloSource, loadModelo, type NordsteloFile } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import type { Facts, Variant } from "./facts.js";
import { type Score, scoreBoth } from "./score.js";

const dir = fileURLToPath(new URL("../test/fixtures/kuroj/", import.meta.url));
const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo must load");
const katalogo = JSON.parse(
  readFileSync(new URL("../../modelo/data/nordstelo.json", import.meta.url), "utf8"),
) as NordsteloFile;

interface Stored {
  task: string;
  variant: Variant;
  score: Score;
}

const cases = existsSync(dir)
  ? readdirSync(dir).filter((name) => existsSync(`${dir}${name}/rezulto.json`))
  : [];

describe("rescoring stored results", () => {
  it("there are stored results of both variants from a run against a provider", () => {
    expect(cases.length).toBeGreaterThanOrEqual(4);
    const variants = new Set(
      cases.map(
        (name) =>
          (JSON.parse(readFileSync(`${dir}${name}/rezulto.json`, "utf8")) as Stored).variant,
      ),
    );
    expect([...variants].sort()).toEqual(["0", "F"]);
  });

  it.each(cases)("%s scores the stored number again, twice", (name) => {
    const stored = JSON.parse(readFileSync(`${dir}${name}/rezulto.json`, "utf8")) as Stored;
    const facts = JSON.parse(readFileSync(`${dir}${name}/fakto.json`, "utf8")) as Facts;
    expect(existsSync(`${dir}${name}/pagxo.html`)).toBe(true);
    const tasko = katalogo.taskoj.find((entry) => entry.name === stored.task);
    if (tasko === undefined) throw new Error(`no task ${stored.task}`);
    const input = { facts, tasko, variant: stored.variant, modelo };
    const first = scoreBoth(input, katalogo);
    expect(first.antauxa).toEqual(stored.score);
    expect(scoreBoth(input, katalogo)).toEqual(first);
    // The gate takes K4 and K5 only where a page does not follow every brand and mode.
    expect(first.nova.k.K4 ?? 0).toBeLessThanOrEqual(first.antauxa.k.K4 ?? 0);
    expect(first.nova.k.K5 ?? 0).toBeLessThanOrEqual(first.antauxa.k.K5 ?? 0);
  });
});
