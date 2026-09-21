// `fm projekcioj build` (Spec 003 T008, plan D-01): generates every projection of the Modelo.
//
// F12: Diese Tests prüfen die Verdrahtung des Befehls, nicht die Arbeit, die ein Bau tut. Sie
// bauen deshalb je einen Celo — und der Verdrahtungstest gegen ein **minimales Fixture-Modelo**:
// Die Kosten eines Baus stecken nicht in der Zahl der Celoj, sondern im Modelo (laden, prüfen,
// alle Kombinationen auflösen). 144 Kombinationen des echten Modelos sind wieder Arbeit, die
// dieser Test nicht behauptet. Den vollständigen Bau mit dem echten Modelo führt die CI im
// Schritt `Check: Parity` aus (`pnpm check:parity` ruft `fm projekcioj build --out
// .fundamento/projekcioj` auf und prüft das Ergebnis).

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const built = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const repoRoot = dirname(dirname(fileURLToPath(new URL("..", import.meta.url))));

/**
 * The smallest Modelo the repository has: one Aspekto, two Dimensioj, four combinations. Enough
 * for the wiring of the command, and a fraction of the work of the real Modelo (F12).
 */
const FIXTURE = ["--fixture", "packages/modelo/test/fixtures/valid/minimal"] as const;

/** One spawn of the built binary, in the repository root. */
function build(args: readonly string[]) {
  const out = mkdtempSync(join(tmpdir(), "fm-cli-projekcioj-"));
  const env: NodeJS.ProcessEnv = { ...process.env, INIT_CWD: repoRoot };
  const run = spawnSync(process.execPath, [built, "projekcioj", "build", "--out", out, ...args], {
    cwd: repoRoot,
    env,
    encoding: "utf8",
  });
  return { out, run };
}

describe("fm projekcioj build (T008)", () => {
  // Budget aus der CI-Messung am Fixture, Grundlage ist der **langsamste** beobachtete Lauf:
  // 2,49 s (Lauf 35588499623) und 3,20 s (Lauf 35588496138), lokal 0,53 s. 10 s sind das
  // Dreifache des langsamsten Laufs und decken damit den beobachteten Faktor 2 zwischen den
  // Runnern ab; eine echte Verlangsamung fällt auf.
  it("writes the projection of the chosen Celo to --out and lists it", { timeout: 10_000 }, () => {
    const { out, run } = build([...FIXTURE, "--celo", "css"]);
    expect(run.stderr).toBe("");
    expect(run.status).toBe(0);
    expect(run.stdout).toMatch(/^fm projekcioj build: wrote \d+ files for the Celoj css to /);
    expect(existsSync(join(out, "projekcioj.json"))).toBe(true);
    expect(existsSync(join(out, "css"))).toBe(true);
    expect(existsSync(join(out, "figma"))).toBe(false);
  });

  // Fällt vor dem Bau: die Auswahl wird geprüft, bevor das Modelo geladen wird.
  it("names the Celoj it knows when --celo names none of them", { timeout: 10_000 }, () => {
    const { run } = build([...FIXTURE, "--celo", "sketch"]);
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("sketch");
    expect(run.stderr).toContain("css");
    expect(run.stdout).toBe("");
  });

  // Bestätigend: die Prüfung stand vor dem Test, sie war im ersten Lauf grün.
  it("takes either --config or --fixture, not both", { timeout: 10_000 }, () => {
    const { run } = build([...FIXTURE, "--config", "fundamento.config.json"]);
    expect(run.status).toBe(2);
    expect(run.stderr).toContain("--fixture");
  });

  // Dieser Test tut die Arbeit, die er behauptet: Er bündelt das Make Kit mit einem Bundler, und
  // das dauert. Gemessen auf der CI 18,9 s und 19,2 s (Läufe 35588499623, 35588496138). 60 s sind
  // das Dreifache des langsamsten Laufs; die bisherigen 300 s waren das Fünfzehnfache und hätten
  // eine echte Verlangsamung verschluckt.
  it("bundles the Make kit, so the output can be packed and published (T020)", () => {
    const { out, run } = build(["--celo", "make-kit"]);
    expect(run.status).toBe(0);
    for (const file of ["dist/index.js", "dist/index.cjs", "dist/index.d.ts", "package.json"]) {
      expect(existsSync(join(out, "make-kit/komuna", file)), file).toBe(true);
    }
    expect(run.stdout).toContain("make-kit");
    const manifest = JSON.parse(readFileSync(join(out, "projekcioj.json"), "utf8")) as {
      celoj: string[];
    };
    expect(manifest.celoj).toEqual(["make-kit"]);
  }, 60_000);
});
