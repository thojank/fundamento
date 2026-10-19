// Maintainer script: prints the measurements M1 and M2 of Spec 016 ① and M4 of Spec 019 ① as
// Markdown tables.
// Usage: pnpm --filter @fundamento/agordilo mezuroj [m4]   (m4: only M4)

import { readFileSync } from "node:fs";
import { readAgordo } from "../agordo.js";
import { measureM1, measureM2, measureM4 } from "../mezuroj.js";
import { loadCalibration, readStructure } from "./structure.js";

const structure = readStructure();
const calibration = loadCalibration();
const out: string[] = [];

/** provo and provo-kompakta, the example brands (Modelo fixtures). */
function examples() {
  return ["aspekto-provo", "aspekto-provo-kompakta"].flatMap((dir) => {
    const url = new URL(`../../../modelo/test/fixtures/valid/${dir}/agordo.json`, import.meta.url);
    const { agordo } = readAgordo(JSON.parse(readFileSync(url, "utf8")));
    return agordo === undefined ? [] : [agordo];
  });
}

if (process.argv[2] === "m4") {
  const started = performance.now();
  const rows = measureM4(structure, calibration, examples());
  const seconds = (performance.now() - started) / 1000;
  out.push(
    `M4 – Eckwerte (${rows.length} Agordos, ${seconds.toFixed(1)} s mit Prüfung)`,
    "",
    "| Fall | Agordo | Paare bestanden | Paare verletzt | Hinweise Stufe 2 | Hinweise gesamt | Verstöße fest | Verstöße anpassbar | Regeln | Export |",
    "|---|---|---|---|---|---|---|---|---|---|",
  );
  for (const row of rows) {
    out.push(
      `| ${row.label} | \`${row.agordo}\` | ${row.passed} | ${row.failed} | ${row.gestaltHints} | ${row.hints} | ${row.fixed} | ${row.adjustable} | ${row.rules || "–"} | ${row.exportable ? "ja" : row.fixed > 0 ? "nein" : "nur mit Jugxo"} |`,
    );
  }
  process.stdout.write(`${out.join("\n")}\n`);
  process.exit(0);
}

const m1 = measureM1(structure, calibration);
const byPalette = new Map<string, number[]>();
for (const row of m1) {
  const palette = row.token.split(".")[2] ?? "";
  byPalette.set(palette, [...(byPalette.get(palette) ?? []), row.deltaE]);
}
out.push("M1 – ΔE OKLab × 100 je Palette (komunas Leitfarbe gegen komuna)", "");
out.push("| Palette | Stufen | ΔE max | ΔE Mittel |", "|---|---|---|---|");
for (const [palette, values] of byPalette) {
  const max = Math.max(...values);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  out.push(`| ${palette} | ${values.length} | ${max.toFixed(2)} | ${mean.toFixed(2)} |`);
}
out.push(
  "",
  "M1 – Stufen mit ΔE > 5",
  "",
  "| Token | Modus | komuna | abgeleitet | ΔE |",
  "|---|---|---|---|---|",
);
const above = m1.filter((row) => row.deltaE > 5);
for (const row of above) {
  out.push(
    `| ${row.token} | ${row.mode} | ${row.komuna} | ${row.derived} | ${row.deltaE.toFixed(2)} |`,
  );
}
if (above.length === 0) out.push("| – | – | – | – | keine |");
out.push(
  "",
  "M1 – alle Stufen",
  "",
  "| Token | Modus | komuna | abgeleitet | ΔE |",
  "|---|---|---|---|---|",
);
for (const row of m1) {
  out.push(
    `| ${row.token} | ${row.mode} | ${row.komuna} | ${row.derived} | ${row.deltaE.toFixed(2)} |`,
  );
}

const started = performance.now();
const m2 = measureM2(structure, calibration);
const seconds = (performance.now() - started) / 1000;
out.push(
  "",
  `M2 – zehn Leitfarben (${seconds.toFixed(1)} s für zehn Ableitungen mit Prüfung)`,
  "",
  "| Leitfarbe | Wert | Paare bestanden | Paare verletzt | Verstöße fest | Verstöße anpassbar | Regeln | Export | Vorschläge |",
  "|---|---|---|---|---|---|---|---|---|",
);
for (const row of m2) {
  out.push(
    `| ${row.label} | ${row.leitfarbe} | ${row.passed} | ${row.failed} | ${row.fixed} | ${row.adjustable} | ${row.rules || "–"} | ${row.exportable ? "ja" : "nein"} | ${row.suggestions.join(" / ") || "–"} |`,
  );
}
process.stdout.write(`${out.join("\n")}\n`);
