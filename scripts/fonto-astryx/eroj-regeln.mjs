// Spec 029 ①b b) – Regeln gewinnen: schreibt die Ero-Tokens von komuna (eroj.mjs), prüft die
// KontrastParoj (check:alirebleco) und hält jedes Paar, das unter seine Schwelle fällt, in
// anpassoj-eroj.json fest: die Fläche des Paars (sonst die Schrift) bleibt in diesem Modus auf der
// Rolle, an die das Skemo sie bindet, mit der Jugxo der Kontraste. Wiederholt, bis die Prüfung hält.
//
//   node scripts/fonto-astryx/eroj-regeln.mjs   (nach vergleich.mjs; ruft eroj.mjs selbst auf)

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const repo = join(here, "../..");
const ANPASSOJ = join(here, "anpassoj-eroj.json");
const KONTRAST = "jug_01M5ZS3RD8HWV0EWSCGZAHA30K";
const { defaultModeloSource, eroTokenojOf, loadModelo } = await import(
  join(repo, "packages/modelo/dist/index.js")
);
const { modelo } = loadModelo(defaultModeloSource());
const skemoAlias = new Map(
  modelo.eroj.flatMap((entry) => eroTokenojOf(entry).map((tokeno) => [tokeno.name, tokeno.alias])),
);

for (let round = 1; round <= 6; round++) {
  execFileSync(process.execPath, [join(here, "eroj.mjs")], { cwd: repo, stdio: "ignore" });
  execFileSync(
    "pnpm",
    [
      "exec",
      "biome",
      "format",
      "--write",
      "packages/vortaro/sets/core.json",
      "packages/aspekto-komuna",
    ],
    { cwd: repo, stdio: "ignore" },
  );
  const run = spawnSync(
    process.execPath,
    [join(repo, "packages/modelo/dist/checks/run.js"), "alirebleco", "--json"],
    { cwd: repo, encoding: "utf8", maxBuffer: 1 << 28 },
  );
  const result = JSON.parse(run.stdout);
  const failing = result.errors.filter(
    (issue) => issue.path.includes("aspekto=komuna,") && issue.path.includes("/kontrastParo/ero."),
  );
  console.log(`Runde ${round}: ${failing.length} Bewertungen unter der Schwelle`);
  if (failing.length === 0) break;
  const anpassoj = JSON.parse(readFileSync(ANPASSOJ, "utf8"));
  // Je Runde und Paar eine Anpassung; ein Paar, dessen Fläche in dieser Runde schon zurückgeht, wartet
  // auf die nächste Prüfung.
  const chosen = new Set();
  for (const issue of failing) {
    const pair = issue.path.split("/kontrastParo/")[1];
    const [foreground, background] = pair.split("+");
    const mode = issue.path.includes("color-scheme=dark") ? "dark" : "light";
    const ratio = issue.message.match(/ratio ([\d.]+):1/)?.[1];
    const threshold = issue.message.match(/threshold ([\d.]+):1/)?.[1];
    // Die Fläche zuerst; ist sie schon angepasst, die Schrift.
    if (chosen.has(`${background}|${mode}`) || chosen.has(`${foreground}|${mode}`)) continue;
    const token = [background, foreground].find(
      (name) =>
        name.startsWith("ero.") && anpassoj[name]?.[mode] === undefined && skemoAlias.has(name),
    );
    if (token === undefined) continue;
    chosen.add(`${token}|${mode}`);
    (anpassoj[token] ??= {})[mode] = {
      alias: skemoAlias.get(token),
      maniero: "adaptita",
      jugxo: KONTRAST,
      kialo: `KontrastParo ${pair} hatte mit dem Wert der Fonto ${ratio}:1 (${mode === "dark" ? "dunkel" : "hell"}, Schwelle ${threshold}:1): ${token} bleibt auf der Rolle des Skemo.`,
    };
  }
  writeFileSync(
    ANPASSOJ,
    `${JSON.stringify(Object.fromEntries(Object.entries(anpassoj).sort(([a], [b]) => a.localeCompare(b))), null, 1)}\n`,
  );
}
