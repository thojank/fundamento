// The comparison against another state of the Modelo (Spec 004 T010, maintainer's requirement of
// 2026-09-20): every pair shows WCAG and APCA next to each other, and the change against the
// snapshot that `fm modelo mezuroj` wrote.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultModeloSource, projectModeloSource } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "../../build.js";
import type { VitrinoBazo, VitrinoDatumoj } from "./datumoj.js";
import { VITRINO_FILE } from "./vitrino.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const fm = join(repoRoot, "packages/cli/dist/index.js");
const dirs: string[] = [];

afterAll(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const islandOf = (html: string): VitrinoDatumoj =>
  JSON.parse(
    (
      /<script type="application\/json" id="fm-vitrino">(.*?)<\/script>/s.exec(html)?.[1] ?? "{}"
    ).replaceAll("<\\/", "</"),
  ) as VitrinoDatumoj;

describe("fm modelo mezuroj writes a snapshot the Vitrino can compare with", () => {
  // One snapshot for the whole file: taking it costs a full evaluation of 72 combinations, and
  // four of them next to the other packages' tests overload the parallel gate.
  let file = "";
  beforeAll(() => {
    const dir = mkdtempSync(join(tmpdir(), "fm-mezuroj-"));
    dirs.push(dir);
    file = join(dir, "mezuroj.json");
    execFileSync(process.execPath, [fm, "modelo", "mezuroj", "--out", file], { encoding: "utf8" });
  }, 120_000);

  const readSnapshot = (): VitrinoBazo => JSON.parse(readFileSync(file, "utf8")) as VitrinoBazo;

  it("writes every pair of every combination with its WCAG and APCA value", () => {
    const dir = join(file, "..");
    const snapshot = readSnapshot();
    const first = Object.values(snapshot.mezuroj)[0] ?? [];
    expect(Object.keys(snapshot.mezuroj).length).toBe(72);
    expect(first.length).toBeGreaterThan(50);
    expect(first[0]?.wcag2).toBeGreaterThan(1);
    expect(snapshot.apcaHintoj).toBeGreaterThan(0);
    // Deterministic: two runs of the same Modelo give the same bytes.
    const again = join(dir, "again.json");
    execFileSync(process.execPath, [fm, "modelo", "mezuroj", "--out", again], { encoding: "utf8" });
    expect(readFileSync(again, "utf8")).toBe(readFileSync(file, "utf8"));
  }, 120_000);

  it("shows the change per pair and the change of the advisory APCA count", async () => {
    const dir = mkdtempSync(join(tmpdir(), "fm-bazo-"));
    dirs.push(dir);
    // A snapshot of a worse state: every pair a little weaker than today.
    const snapshot = readSnapshot();
    for (const rows of Object.values(snapshot.mezuroj)) {
      for (const row of rows) {
        row.wcag2 = Number((row.wcag2 - 0.5).toFixed(2));
        row.apca = Number((row.apca - 3).toFixed(1));
      }
    }
    snapshot.apcaHintoj = snapshot.apcaHintoj - 450;

    const out = join(dir, "projekcioj");
    const built = await buildProjekcioj({
      outDir: out,
      source: defaultModeloSource(),
      bazo: snapshot,
    });
    expect(built.ok).toBe(true);
    const datumoj = islandOf(readFileSync(join(out, VITRINO_FILE), "utf8"));
    const rows = Object.values(datumoj.mezuroj)[0] ?? [];
    const row = rows[0];
    expect(row?.bazo).toBeDefined();
    expect((row?.wcag2 ?? 0) - (row?.bazo?.wcag2 ?? 0)).toBeCloseTo(0.5, 2);
    expect(datumoj.apcaHintoj.bazo).toBe(datumoj.apcaHintoj.nun - 450);
  }, 180_000);

  // A snapshot of the repo Modelo covers komuna's 72 combinations; a build of the ekzemplo
  // composition has 144. Counting 144 combinations against a 72-combination snapshot would
  // report a rise that is only the second Aspekto, so the totals are compared where both states
  // have data, and the rest is named.
  it("counts the change only where both states have the combination", async () => {
    const dir = mkdtempSync(join(tmpdir(), "fm-bazo-parta-"));
    dirs.push(dir);
    const snapshot = readSnapshot();

    const out = join(dir, "projekcioj");
    const built = await buildProjekcioj({
      outDir: out,
      source: projectModeloSource(
        join(
          repoRoot,
          "packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
        ),
      ),
      bazo: snapshot,
    });
    expect(built.ok).toBe(true);
    const { apcaHintoj } = islandOf(readFileSync(join(out, VITRINO_FILE), "utf8"));
    expect(apcaHintoj.kombinoj).toBe(144);
    expect(apcaHintoj.bazoKombinoj).toBe(72);
    expect(apcaHintoj.komunaj?.kombinoj).toBe(72);
    expect(apcaHintoj.komunaj?.nun).toBeLessThan(apcaHintoj.nun);
    // Every combination of the snapshot is in this build, so its total is the comparable number.
    expect(apcaHintoj.mankantaj).toBe(0);
  }, 240_000);

  it("takes the snapshot through the CLI as well", () => {
    const dir = mkdtempSync(join(tmpdir(), "fm-bazo-cli-"));
    dirs.push(dir);
    const out = join(dir, "projekcioj");
    execFileSync(process.execPath, [fm, "projekcioj", "build", "--out", out, "--bazo", file], {
      encoding: "utf8",
    });
    const datumoj = islandOf(readFileSync(join(out, VITRINO_FILE), "utf8"));
    expect(datumoj.apcaHintoj.bazo).toBe(datumoj.apcaHintoj.nun);
  }, 180_000);
});
