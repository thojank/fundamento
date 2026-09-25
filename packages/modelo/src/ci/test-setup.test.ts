// Kein Test baut seine Verbindung zur Sammelzeit auf (Befund vom 2026-09-24).
//
// Modulcode und ein `describe("…", async () => { … })` laufen, während Vitest die Dateien
// einsammelt — nicht, wenn der Test dran ist. Wer dort einen Server startet oder eine Verbindung
// aufbaut, hält sie über die gesamte Sammel- und Laufzeit aller übrigen Dateien offen: Zwischen dem
// Aufbau und der ersten Anfrage liegen Minuten. Vierzehn Stellen trugen das Muster; eine davon hielt
// dabei einen echten Socket offen.
//
// **Was dieser Test nicht geleistet hat.** Der Anlass war ein flakender Test in
// `packages/mcp/src/resources-http.test.ts` („serves the tools", `read ECONNRESET`). Die Umstellung
// auf `beforeAll` hat ihn **nicht** behoben: Er fiel danach erneut, im Push-Lauf von `a7ba401`, nach
// 8799 ms. Die Sammelzeit war also nicht seine Ursache; welche es ist, ist offen und wird außerhalb
// dieses Tests untersucht. Dieser Test bleibt richtig, aber aus eigenem Grund: Aufbau zur Sammelzeit
// ist falsch, gleich ob etwas davon fällt.
//
// Kein `retry` und kein höheres Timeout: Ein Wiederholungsversuch macht einen Befund unsichtbar,
// statt ihn zu beheben.
//
// Der Aufbau gehört in ein `beforeAll` mit dem passenden `afterAll`. Dann entsteht die Verbindung,
// wenn die Datei läuft, und sie wird geschlossen, wenn die Datei fertig ist.
//
// ## Was dieser Test prüft — und was nicht
//
// Er prüft zwei **Formen**, nicht die Bedeutung: ein asynchrones `describe` und ein `await` in einer
// Anweisung auf Modulebene. Beide Formen sind das, was in diesem Repo den Fehler erzeugt hat.
//
// Er weiß **nicht**, ob ein Aufruf eine Leitung öffnet. `preload()` steht absichtlich auf
// Modulebene und ist richtig dort: Es rechnet, ohne zu verbinden. Umgekehrt bliebe ein Aufruf, der
// eine Verbindung öffnet, ohne erwartet zu werden (`void connect()`), unbemerkt — er trägt kein
// `await`. Wer eine solche Zeile schreibt, kommt an diesem Test vorbei. In die strenge Richtung
// irrt er bei einer Pfeilfunktion, deren Parameterliste über mehrere Zeilen läuft: Steht der Pfeil
// nicht auf der ersten Zeile, gilt ein `await` in ihrem Rumpf als Modulebene.
//
// Außerhalb des Geltungsbereichs liegen die Playwright-Specs in `packages/eroj/test/*.spec.ts`:
// Sie liegen nicht unter `src`, und `test.describe` hat ein eigenes Ausführungsmodell. Geprüft am
// 2026-09-24: keine von ihnen trägt das Muster.

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
 * Kommentare und Zeichenketten heraus, Zeilenzahl erhalten. Ohne das liest die Erkennung ihre
 * eigenen Kommentare als Code — und ein Kommentar am Zeilenanfang würde als Kopf einer Anweisung
 * gelten, sodass die Funktion darunter nicht mehr als Funktion erkannt wird.
 */
function codeOnly(text: string): string {
  let inBlock = false;
  return text
    .split("\n")
    .map((line) => {
      let out = "";
      for (let i = 0; i < line.length; i++) {
        if (inBlock) {
          if (line.startsWith("*/", i)) {
            inBlock = false;
            i++;
          }
          continue;
        }
        if (line.startsWith("/*", i)) {
          inBlock = true;
          i++;
          continue;
        }
        if (line.startsWith("//", i)) break;
        const quote = line[i];
        if (quote === '"' || quote === "'" || quote === "`") {
          const close = line.indexOf(quote, i + 1);
          if (close < 0) break; // mehrzeilige Zeichenkette: Rest der Zeile zählt nicht als Code
          i = close;
          continue;
        }
        out += line[i];
      }
      return out;
    })
    .join("\n");
}

/**
 * Der Kopf eines `describe`-Aufrufs: von seiner Zeile bis zum ersten `=>`. Nur dort entscheidet
 * sich, ob der Rumpf asynchron ist; ein `async` weiter unten gehört zu einem `it` und ist richtig.
 */
function asyncDescribes(source: string): number[] {
  const lines = codeOnly(source).split("\n");
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

/** Eröffnet diese Zeile einen Vitest-Rückruf? Dessen Rumpf läuft später, nicht beim Einsammeln. */
const CALLBACK = /^(describe|it|test|before(All|Each)|after(All|Each))\b/;

/**
 * Definiert diese Zeile eine Funktion? Ihr Rumpf läuft erst, wenn jemand sie aufruft. Eine
 * Deklaration mit `function` zählt immer; eine Zuweisung — an eine Konstante wie an eine Eigenschaft,
 * `globalThis.fetch = async (…) => …` — nur, wenn der Pfeil schon auf dieser Zeile steht. Sonst wäre
 * `const y = (await f()).z` eine Funktion, nur weil rechts eine Klammer beginnt.
 */
function definesFunction(head: string): boolean {
  if (/^(export\s+)?(async\s+)?function\b/.test(head)) return true;
  const assignsExpression =
    /^(export\s+)?((const|let|var)\s+)?[\w$.{},\s:]+=\s*(async\s*)?(\(|<|function\b)/.test(head);
  return assignsExpression && (head.includes("=>") || /=\s*(async\s+)?function\b/.test(head));
}

/**
 * `await` in einer Anweisung auf Modulebene. Eine Anweisung beginnt am Zeilenanfang und reicht bis
 * zur nächsten Zeile am Zeilenanfang — so wird auch ein `await` gefunden, das eingerückt in einem
 * Objektliteral steht (`const answers = { a: await … }`), wo eine reine Zeilenprüfung vorbeiliefe.
 * Rückrufe von Vitest und Funktionsdefinitionen zählen nicht: Ihr Rumpf läuft später.
 */
function moduleLevelAwaits(source: string): number[] {
  const lines = codeOnly(source).split("\n");
  const found: number[] = [];
  for (let start = 0; start < lines.length; start++) {
    const head = lines[start] ?? "";
    // Ein Kopf beginnt mit einem Namen. Eine Zeile, die mit einer schließenden Klammer anfängt,
    // setzt fort — etwa das `) {` einer mehrzeiligen Signatur, das sonst als eigene Anweisung gälte
    // und den Rumpf der Funktion darunter zur Modulebene erklärte.
    if (!/^[A-Za-z_$]/.test(head)) continue;
    let end = start + 1;
    while (end < lines.length && (/^\s/.test(lines[end] ?? "") || (lines[end] ?? "") === "")) end++;
    if (!CALLBACK.test(head) && !definesFunction(head)) {
      for (let i = start; i < end; i++) {
        if (/\bawait\b/.test(lines[i] ?? "")) found.push(i + 1);
      }
    }
    start = end - 1;
  }
  return found;
}

const offendersOf = (find: (text: string) => number[]) =>
  allTestFiles().flatMap((file) =>
    find(readFileSync(file, "utf8")).map((line) => `${relative(repoRoot, file)}:${line}`),
  );

describe("no test sets up its suite at collection time", () => {
  it("has no `describe(…, async)` anywhere under packages/*/src", () => {
    expect(
      offendersOf(asyncDescribes),
      "Ein asynchrones `describe` läuft zur Sammelzeit. Server und Verbindungen gehören in ein " +
        "`beforeAll` mit passendem `afterAll`, sonst steht die Leitung offen, bis der Test dran ist.",
    ).toEqual([]);
  });

  it("has no `await` in a module-level statement under packages/*/src", () => {
    expect(
      offendersOf(moduleLevelAwaits),
      "Modulcode läuft, während Vitest die Dateien einsammelt. Was auf eine Antwort wartet, " +
        "gehört in ein `beforeAll`; auf Modulebene darf nur stehen, was rechnet, ohne zu verbinden.",
    ).toEqual([]);
  });

  // Wächter für die Erkennung selbst: Sie muss den Kopf treffen und den Rumpf in Ruhe lassen.
  it("finds an async describe in the head and ignores an async test in the body", () => {
    expect(asyncDescribes('describe("x", async () => {\n  it("y", async () => {});\n});')).toEqual([
      1,
    ]);
    expect(asyncDescribes('describe("x", () => {\n  it("y", async () => {});\n});')).toEqual([]);
    expect(asyncDescribes('describe.each([1])("x", async (n) => {});')).toEqual([1]);
    expect(asyncDescribes('describe(\n  "a long name",\n  async () => {},\n);')).toEqual([1]);
  });

  // Und für die zweite Erkennung, mit beiden Formen, die im Repo standen.
  it("finds a module-level await, plain and nested in a literal", () => {
    expect(moduleLevelAwaits("const { client } = await connect();\n")).toEqual([1]);
    expect(
      moduleLevelAwaits('const answers = {\n  a: await output(client, "describe"),\n};'),
    ).toEqual([2]);
    expect(moduleLevelAwaits("beforeAll(async () => {\n  client = await connect();\n});")).toEqual(
      [],
    );
    expect(moduleLevelAwaits('it("x", async () => {\n  await call();\n});')).toEqual([]);
    expect(moduleLevelAwaits("const read = async (p: string) => {\n  await open(p);\n};")).toEqual(
      [],
    );
    expect(moduleLevelAwaits("async function read() {\n  await open();\n}")).toEqual([]);
    // Zuweisung einer Funktion an eine Eigenschaft: ihr Rumpf läuft später (Falschmeldung bis
    // 2026-09-25, gefunden, als der Wächter eine Messinstrumentierung anschlug).
    expect(
      moduleLevelAwaits("globalThis.fetch = async (input) => {\n  await original(input);\n};"),
    ).toEqual([]);
    // Eine Klammer rechts vom Gleichheitszeichen macht noch keine Funktion.
    expect(moduleLevelAwaits("const y = (await f()).z;")).toEqual([1]);
    // Mehrzeilige Signatur: Das `) {` in Spalte 0 setzt fort, es beginnt keine neue Anweisung.
    expect(moduleLevelAwaits("async function run(\n  a: A,\n) {\n  await a.go();\n}")).toEqual([]);
  });
});
