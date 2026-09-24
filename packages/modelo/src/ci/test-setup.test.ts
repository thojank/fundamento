// Kein Test baut seine Verbindung zur Sammelzeit auf (Befund vom 2026-09-24).
//
// Ein `describe("…", async () => { … })` läuft, während Vitest die Dateien einsammelt — nicht erst,
// wenn der Test dran ist. Wer dort einen Server startet oder eine Verbindung aufbaut, hält sie über
// die gesamte Sammel- und Laufzeit aller übrigen Dateien offen: Zwischen dem Aufbau und der ersten
// Anfrage liegen Minuten, und eine Leitung, die so lange unbenutzt offensteht, wird zurückgesetzt.
// Gemessen an `packages/mcp/src/resources-http.test.ts` („serves the tools"): derselbe Commit, zwei
// CI-Läufe, einer grün, einer rot mit `read ECONNRESET` — die erste Anfrage über die alte Leitung.
//
// Neun Stellen trugen das Muster, aber nur diese eine fiel je: Sie ist die einzige mit einem echten
// Socket. Die anderen acht sind nicht gesünder, sie sind nur stumm. Deshalb prüft dieser Test das
// Muster und nicht den Fehlerfall — und deshalb steht hier kein `retry` und kein höheres Timeout:
// Ein Wiederholungsversuch macht den Befund unsichtbar, statt ihn zu beheben.
//
// Der Aufbau gehört in ein `beforeAll` mit dem passenden `afterAll`. Dann entsteht die Verbindung,
// wenn die Datei läuft, und sie wird geschlossen, wenn die Datei fertig ist.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const packagesDir = join(repoRoot, "packages");

function testFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === "node_modules" || entry.name === "dist" ? [] : testFiles(path);
    }
    return entry.name.endsWith(".test.ts") ? [path] : [];
  });
}

// Jede `*.test.ts` unter `packages/<paket>/src` — dort wohnen die Tests, die Vitest einsammelt.
function allTestFiles(): string[] {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const src = join(packagesDir, entry.name, "src");
      try {
        return testFiles(src);
      } catch {
        return []; // Paket ohne src/, z. B. ein reines Datenpaket.
      }
    })
    .sort();
}

/**
 * Der Kopf eines `describe`-Aufrufs: von seiner Zeile bis zum ersten `=>`. Nur dort entscheidet
 * sich, ob der Rumpf asynchron ist; ein `async` weiter unten gehört zu einem `it` und ist richtig.
 */
function asyncDescribes(text: string): number[] {
  const lines = text.split("\n");
  const found: number[] = [];
  lines.forEach((line, index) => {
    if (!/^\s*describe(\.\w+)?\s*\(/.test(line)) return;
    let head = "";
    for (let i = index; i < lines.length && i < index + 6; i++) {
      head += lines[i] ?? "";
      if ((lines[i] ?? "").includes("=>") || (lines[i] ?? "").includes("function")) break;
    }
    if (/,\s*async\b/.test(head) || /\basync\s+function\b/.test(head)) found.push(index + 1);
  });
  return found;
}

describe("no test sets up its suite at collection time", () => {
  it("has no `describe(…, async)` anywhere under packages/*/src", () => {
    const offenders = allTestFiles().flatMap((file) =>
      asyncDescribes(readFileSync(file, "utf8")).map(
        (line) => `${relative(repoRoot, file)}:${line}`,
      ),
    );
    expect(
      offenders,
      "Ein asynchrones `describe` läuft zur Sammelzeit. Server und Verbindungen gehören in ein " +
        "`beforeAll` mit passendem `afterAll`, sonst steht die Leitung offen, bis der Test dran ist.",
    ).toEqual([]);
  });

  // Wächter für die Erkennung selbst: Sie muss den Kopf treffen und den Rumpf in Ruhe lassen.
  it("finds the pattern in the head and ignores an async test in the body", () => {
    expect(asyncDescribes('describe("x", async () => {\n  it("y", async () => {});\n});')).toEqual([
      1,
    ]);
    expect(asyncDescribes('describe("x", () => {\n  it("y", async () => {});\n});')).toEqual([]);
    expect(asyncDescribes('describe.each([1])("x", async (n) => {});')).toEqual([1]);
    expect(asyncDescribes('describe(\n  "a long name",\n  async () => {},\n);')).toEqual([1]);
  });
});
