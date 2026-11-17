#!/usr/bin/env node
// Spec 058 (MAW-5.1, AK-9): the diff search. Compares the working tree – tracked changes and new,
// not ignored files – with the base commit and lists, per rule, every hit with its file and line:
//   1. a path under a taboo area (product spec „Dateien“, plan §2 item 5);
//   2. a root file or the lockfile;
//   3. a dependency added, removed or changed in any package.json;
//   4. a new `--fm-` core token (a custom property defined in an added line of code);
//   5. a new limit, tolerance, time limit or `retries` in an added line of code (Markdown only
//      describes the rules and is not judged by 4 and 5; the words of rule 8 are searched everywhere);
//   6. an Agordo schema file;
//   7. a file under packages/modelo/data;
//   8. the brand word of R-12 of Spec 035 or the name of the private font repository – both taken at
//      run time from `oldNames()` of scripts/neutrale-namen/rules.mjs (never written here, never
//      printed: a hit names the word by its number).
// Exit code 0 when every rule has 0 hits, else 1. Reads only; writes nothing.
//
//   node specs/058-marke-auswerten/diff-suche.mjs [base]        (base: 0f9ada50)

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASIS = process.argv[2] ?? "0f9ada50";
const git = (...args) =>
  execFileSync("git", args, { cwd: REPO, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

const TABU = [
  "packages/modelo/",
  "packages/agordilo/",
  "packages/mcp/",
  "packages/eroj/src/",
  "packages/vortaro/",
  ".github/",
];
const LOCKFILE = "pnpm-lock.yaml";

/** Tracked changes against the base (working tree) and new files that git does not ignore. */
const geaendert = git("diff", "--name-only", BASIS).split("\n").filter(Boolean);
const neu = git("ls-files", "--others", "--exclude-standard").split("\n").filter(Boolean);
const alle = [...new Set([...geaendert, ...neu])].sort();

/** The added lines with their line numbers: from the diff, and every line of a new file. */
function hinzugefuegt() {
  const zeilen = [];
  let datei = "";
  let nr = 0;
  for (const z of git("diff", "-U0", "--no-color", BASIS).split("\n")) {
    if (z.startsWith("+++ ")) datei = z.slice(6);
    else if (z.startsWith("@@")) nr = Number(/\+(\d+)/.exec(z)?.[1] ?? "0");
    else if (z.startsWith("+") && !z.startsWith("+++"))
      zeilen.push({ datei, nr: nr++, text: z.slice(1) });
  }
  for (const datei of neu) {
    const pfad = join(REPO, datei);
    if (!existsSync(pfad)) continue;
    const bytes = readFileSync(pfad);
    if (bytes.includes(0)) continue; // a binary file: no lines
    for (const [i, text] of bytes.toString("utf8").split("\n").entries())
      zeilen.push({ datei, nr: i + 1, text });
  }
  return zeilen;
}
const zeilen = hinzugefuegt();
/** Rules 4 and 5 judge code and data; Markdown only describes them (spec, plan, tasks, report). */
const kodZeilen = zeilen.filter((z) => !z.datei.endsWith(".md"));

const regeln = [];
const regel = (name, treffer) => regeln.push({ name, treffer });

// 1, 2, 6, 7: paths
regel(
  "Tabu-Pfade",
  alle.filter((d) => TABU.some((t) => d.startsWith(t)) || d === ".env" || d.endsWith("/.env")),
);
regel(
  "Root-Dateien und Lockfile",
  alle.filter((d) => !d.includes("/") || d.endsWith(LOCKFILE)),
);
regel(
  "Agordo-Schema",
  alle.filter((d) => /agordo[^/]*\.schema\.json$|\.schema\.json$/i.test(d)),
);
regel(
  "packages/modelo/data",
  alle.filter((d) => d.startsWith("packages/modelo/data/")),
);

// 3: dependencies of every changed package.json
const ABHAENGIGKEITEN = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];
const abhTreffer = [];
for (const d of alle.filter((x) => x.endsWith("package.json"))) {
  const jetzt = existsSync(join(REPO, d)) ? JSON.parse(readFileSync(join(REPO, d), "utf8")) : {};
  let vorher = {};
  try {
    vorher = JSON.parse(git("show", `${BASIS}:${d}`));
  } catch {
    vorher = {};
  }
  for (const k of ABHAENGIGKEITEN)
    if (JSON.stringify(jetzt[k] ?? {}) !== JSON.stringify(vorher[k] ?? {}))
      abhTreffer.push(`${d}: ${k}`);
}
regel("Abhängigkeiten", abhTreffer);

// 4: a custom property --fm-… defined (not used) in an added line
regel(
  "neuer --fm- Kern-Token",
  kodZeilen
    .filter(
      (z) =>
        /(^|[\s;{"'`(])--fm-[a-z0-9-]+\s*:/.test(z.text) &&
        !/var\(--fm-/.test(z.text.split(":")[0]),
    )
    .map((z) => `${z.datei}:${z.nr}`),
);

// 5: a new limit, tolerance, time limit or retries in an added line (this file names the patterns
// and is left out of this rule)
const GRENZE = [
  /\bretries\b/i,
  /\b(test|hook)Timeout\b/,
  /\btimeout\s*[:=]/i,
  /waitForTimeout/,
  /\btoleran(z|ce)\b/i,
  /\b[A-Z][A-Z0-9_]*(GRENZE|LIMIT|LIMO|TEMPOLIMO|TOLERANZ|BUDGET)[A-Z0-9_]*\s*=/,
  /\bnew Budget\(\s*\d/,
];
// The existing default of the Kostengrenze at the base (`options.ki?.limo ?? N` in servilo.ts): a
// test double that builds `new Budget(N)` with exactly that value uses the existing value as it is
// (plan §2 item 1); it is listed apart, not counted. Any other number counts.
const BESTEHEND = /limo \?\? ([\d_]+)/.exec(
  git("show", `${BASIS}:packages/metiejo/src/servilo.ts`),
)?.[1];
const SELBST = "specs/058-marke-auswerten/diff-suche.mjs";
const grenzZeilen = kodZeilen.filter(
  (z) => z.datei !== SELBST && GRENZE.some((m) => m.test(z.text)),
);
const bestehend = (z) =>
  BESTEHEND !== undefined &&
  z.text.includes(`new Budget(${BESTEHEND})`) &&
  GRENZE.filter((m) => m.test(z.text)).length === 1;
regel(
  "neue Grenze, Toleranz, Zeitlimit, retries",
  grenzZeilen
    .filter((z) => !bestehend(z))
    .map((z) => `${z.datei}:${z.nr}: ${z.text.trim().slice(0, 100)}`),
);
const hinweise = grenzZeilen
  .filter(bestehend)
  .map(
    (z) =>
      `${z.datei}:${z.nr}: ${z.text.trim().slice(0, 100)} (bestehender Wert ${BESTEHEND} aus servilo.ts, nicht gezählt)`,
  );

// 8: the two words (assembled at run time, compared in lower case, never printed)
const { oldNames } = await import(
  pathToFileURL(join(REPO, "scripts/neutrale-namen/rules.mjs")).href
);
const namen = oldNames();
const woerter = [namen.word, namen.fontRepoName].map((w) => w.toLowerCase());
const wortTreffer = [];
for (const z of zeilen)
  woerter.forEach((w, i) => {
    if (z.text.toLowerCase().includes(w)) wortTreffer.push(`${z.datei}:${z.nr}: Wort ${i + 1}`);
  });
for (const d of alle)
  woerter.forEach((w, i) => {
    if (d.toLowerCase().includes(w)) wortTreffer.push(`${d}: Wort ${i + 1} im Pfad`);
  });
regel("Wort aus R-12 / Name des privaten Schriften-Repos", wortTreffer);

console.log(
  `Diff-Suche gegen ${BASIS}: ${alle.length} Dateien (${geaendert.length} geändert, ${neu.length} neu), ${zeilen.length} hinzugefügte Zeilen`,
);
let summe = 0;
for (const { name, treffer } of regeln) {
  summe += treffer.length;
  console.log(`${treffer.length === 0 ? "0 Treffer" : `${treffer.length} Treffer`} – ${name}`);
  for (const t of treffer) console.log(`    ${t}`);
}
for (const h of hinweise) console.log(`Hinweis: ${h}`);
process.exitCode = summe === 0 ? 0 : 1;
