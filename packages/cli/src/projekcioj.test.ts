// `fm projekcioj build` (Spec 003 T008, plan D-01): generates every projection of the Modelo.
//
// F12: Diese Tests prüfen die Verdrahtung des Befehls, nicht die Arbeit der Celoj. Sie bauen
// deshalb je einen Celo; den vollständigen Bau aller acht führt die CI im Schritt `Check: Parity`
// aus (`pnpm check:parity` ruft `fm projekcioj build --out .fundamento/projekcioj` auf und prüft
// das Ergebnis), und der Make-Kit-Test baut genau den Celo, dessen Bündel er behauptet.

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const built = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const repoRoot = dirname(dirname(fileURLToPath(new URL("..", import.meta.url))));

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
  // Ein Celo, damit der Test nur die Arbeit tut, die er behauptet: gemessen 1,4 s lokal (alle acht
  // Celoj: 2,3 s). Das Budget ist an der CI gemessen, nicht am Entwicklungsrechner — dort ist
  // derselbe Aufruf etwa siebenmal langsamer: der vollständige Bau brauchte 14,8 s (Lauf
  // 35538715928), ein Celo lief bei 10 s noch (Lauf 35586902757, dort abgebrochen). 30 s sind
  // rund das Doppelte der gemessenen CI-Zeit: eine echte Verlangsamung fällt auf, Last nicht.
  // Der Löwenanteil ist die feste Arbeit jedes Baus — Modelo laden, prüfen, alle Kombinationen
  // auflösen —, nicht die Zahl der Celoj; die Zerlegung bringt Klarheit, keine große Ersparnis.
  it("writes the projection of the chosen Celo to --out and lists it", { timeout: 30_000 }, () => {
    const { out, run } = build(["--celo", "css"]);
    expect(run.stderr).toBe("");
    expect(run.status).toBe(0);
    expect(run.stdout).toMatch(/^fm projekcioj build: wrote \d+ files for the Celoj css to /);
    expect(existsSync(join(out, "projekcioj.json"))).toBe(true);
    expect(existsSync(join(out, "css"))).toBe(true);
    expect(existsSync(join(out, "figma"))).toBe(false);
  });

  // Fällt vor dem Bau: die Auswahl wird geprüft, bevor das Modelo geladen wird.
  it("names the Celoj it knows when --celo names none of them", { timeout: 10_000 }, () => {
    const { run } = build(["--celo", "sketch"]);
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("sketch");
    expect(run.stderr).toContain("css");
    expect(run.stdout).toBe("");
  });

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
  }, 300_000);
});
