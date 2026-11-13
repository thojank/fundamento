#!/usr/bin/env node
// Spec 050 (AK-5): recomputes "green" for every exported screen from daten/ with the built
// decidiVerdon of @fundamento/ekranoj and checks it against what the run stored and against the
// machine-readable section of bericht.md. Needs node and a built checkout (pnpm build); no
// network, no model, no browser.
//
//   node specs/050-mvp-probelauf/pruefen.mjs [--daten <dir>] [--bericht <file>] [--repo <dir>]
//                                            [--ohne-bericht] [--abschnitt]
//
// Rule (implementation spec §2.3): green ⇔ decidiVerdon(enigo).verda && zusatz.length === 0;
// enigo === null means "not built", not red. Each daten/<zelle>/<F|0>/<slug>/fakto.json has the
// shape DatenFakto { zelle, varianto, slug, runde, verdaEkde, gespeichert: { verda }, enigo,
// zusatz }. The section in bericht.md is a fenced block with the info string `pruefen`, one line
// per cell and variant: `<zelle> <F|0> <X>/<n> <green slugs, comma-separated, sorted | ->`.
//
// Defaults: daten/ and bericht.md beside this script; the repo root two levels up (this script
// lives in <repo>/specs/050-mvp-probelauf/), overridable with --repo or PRUEFEN_REPO.
// Exit 0 consistent · 1 deviation · 2 usage, missing build, missing or malformed files.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const HELP =
  "Usage: node pruefen.mjs [--daten <dir>] [--bericht <file>] [--repo <dir>] [--ohne-bericht] [--abschnitt]";

function fail(msg) {
  console.error(`pruefen: ${msg}`);
  process.exit(2);
}

let daten = join(HERE, "daten");
let bericht = join(HERE, "bericht.md");
let repo = process.env.PRUEFEN_REPO ?? resolve(HERE, "..", "..");
let ohneBericht = false;
let nurAbschnitt = false;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  const wert = () => argv[++i] ?? fail(`${a} needs a value\n${HELP}`);
  if (a === "--daten") daten = resolve(wert());
  else if (a === "--bericht") bericht = resolve(wert());
  else if (a === "--repo") repo = resolve(wert());
  else if (a === "--ohne-bericht") ohneBericht = true;
  else if (a === "--abschnitt") nurAbschnitt = true;
  else if (a === "-h" || a === "--help") {
    console.log(HELP);
    process.exit(0);
  } else fail(`unknown argument ${a}\n${HELP}`);
}

const ekranojDist = join(repo, "packages/ekranoj/dist/index.js");
if (!existsSync(ekranojDist)) fail(`${ekranojDist} missing: run pnpm build in ${repo} (or pass --repo)`);
const { decidiVerdon } = await import(pathToFileURL(ekranojDist).href);
if (typeof decidiVerdon !== "function") fail(`decidiVerdon not exported by ${ekranojDist}`);
if (!existsSync(daten) || !statSync(daten).isDirectory()) fail(`no data folder ${daten}`);

const VARIANTOJ = ["F", "0"];
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const strukturFehler = [];
const abweichungen = [];
/** `${zelle} ${varianto}` → { n, gruen: slug[] } */
const zaehlung = new Map();
const zeilen = [];

for (const zelle of readdirSync(daten).sort()) {
  const zDir = join(daten, zelle);
  if (!isDir(zDir)) continue;
  for (const varianto of VARIANTOJ) {
    const vDir = join(zDir, varianto);
    if (!isDir(vDir)) continue;
    const slugs = readdirSync(vDir).filter((s) => existsSync(join(vDir, s, "fakto.json"))).sort();
    if (slugs.length === 0) continue;
    const key = `${zelle} ${varianto}`;
    const stand = { n: 0, gruen: [] };
    zaehlung.set(key, stand);
    for (const slug of slugs) {
      const ort = `${zelle}/${varianto}/${slug}/fakto.json`;
      let f;
      try {
        f = JSON.parse(readFileSync(join(vDir, slug, "fakto.json"), "utf8"));
      } catch (error) {
        strukturFehler.push(`${ort}: unreadable (${error instanceof Error ? error.message : error})`);
        continue;
      }
      const form = [];
      if (f.zelle !== zelle) form.push("zelle");
      if (f.varianto !== varianto) form.push("varianto");
      if (f.slug !== slug) form.push("slug");
      if (!(f.runde === null || Number.isInteger(f.runde))) form.push("runde");
      if (!(f.verdaEkde === null || Number.isInteger(f.verdaEkde))) form.push("verdaEkde");
      if (typeof f.gespeichert?.verda !== "boolean") form.push("gespeichert.verda");
      if (!(f.enigo === null || (typeof f.enigo === "object" && f.enigo.varianto === varianto && typeof f.enigo.taksado === "object")))
        form.push("enigo");
      if (!Array.isArray(f.zusatz) || f.zusatz.some((z) => typeof z !== "string")) form.push("zusatz");
      if (form.length > 0) {
        strukturFehler.push(`${ort}: field(s) ${form.join(", ")} do not fit DatenFakto`);
        continue;
      }
      stand.n += 1;
      const gespeichert = f.gespeichert.verda;
      let gruen = false;
      let malhelpoj = ["nicht-gebaut"];
      const fehler = [];
      if (f.enigo === null) {
        if (f.runde !== null) fehler.push("enigo null but runde set");
      } else {
        let decido;
        try {
          decido = decidiVerdon(f.enigo);
        } catch (error) {
          strukturFehler.push(`${ort}: decidiVerdon failed (${error instanceof Error ? error.message : error})`);
          stand.n -= 1;
          continue;
        }
        gruen = decido.verda && f.zusatz.length === 0;
        malhelpoj = [...f.zusatz, ...decido.malhelpoj];
      }
      if (gruen !== gespeichert) fehler.push(`recomputed ${gruen ? "green" : "not green"}, stored ${gespeichert ? "green" : "not green"}`);
      if (gespeichert && (f.verdaEkde === null || f.runde !== f.verdaEkde)) fehler.push(`green but verdaEkde ${f.verdaEkde} / runde ${f.runde}`);
      if (!gespeichert && f.verdaEkde !== null) fehler.push(`not green but verdaEkde ${f.verdaEkde}`);
      if (gruen) stand.gruen.push(slug);
      const zustand = f.enigo === null ? "nicht gebaut" : gruen ? "grün" : "nein";
      zeilen.push(
        `${fehler.length ? "ABWEICHUNG" : "ok        "} ${zelle} ${varianto} ${slug.padEnd(20)} ${zustand.padEnd(12)} runde ${String(f.runde ?? "-").padEnd(2)} malhelpoj ${malhelpoj.join(",") || "-"}${fehler.length ? ` · ${fehler.join("; ")}` : ""}`,
      );
      if (fehler.length) abweichungen.push(`${ort}: ${fehler.join("; ")}`);
    }
  }
}

if (zaehlung.size === 0) fail(`no daten/<zelle>/<F|0>/<slug>/fakto.json under ${daten}`);

const abschnitt = [...zaehlung.entries()].map(
  ([key, { n, gruen }]) => `${key} ${gruen.length}/${n} ${gruen.length ? [...gruen].sort().join(",") : "-"}`,
);
if (nurAbschnitt) {
  console.log(["```pruefen", ...abschnitt, "```"].join("\n"));
  process.exit(strukturFehler.length ? 2 : 0);
}

for (const z of zeilen) console.log(z);
for (const s of strukturFehler) console.error(`STRUKTUR  ${s}`);

// The machine-readable section of bericht.md must say the same, line for line (order free).
let berichtStand = "übersprungen (--ohne-bericht)";
if (!ohneBericht) {
  if (!existsSync(bericht)) fail(`${bericht} missing (or pass --ohne-bericht)`);
  const text = readFileSync(bericht, "utf8");
  const block = /^```pruefen[ \t]*\n([\s\S]*?)^```[ \t]*$/m.exec(text);
  if (block === null) fail(`${bericht}: no \`\`\`pruefen block`);
  const soll = new Map();
  for (const zeile of block[1].split("\n").map((z) => z.trim()).filter(Boolean)) {
    const m = /^(\S+)\s+(F|0)\s+(\d+)\/(\d+)\s+(\S+)$/.exec(zeile);
    if (m === null) fail(`${bericht}: line „${zeile}“ is not „<zelle> <F|0> <X>/<n> <slugs|->“`);
    const slugs = m[5] === "-" ? "-" : m[5].split(",").sort().join(",");
    soll.set(`${m[1]} ${m[2]}`, `${m[3]}/${m[4]} ${slugs}`);
  }
  const fehlend = [];
  for (const zeile of abschnitt) {
    const [zelle, varianto, ...rest] = zeile.split(" ");
    const key = `${zelle} ${varianto}`;
    if (!soll.has(key)) fehlend.push(`${key}: missing in bericht.md (data: ${rest.join(" ")})`);
    else if (soll.get(key) !== rest.join(" ")) fehlend.push(`${key}: bericht.md ${soll.get(key)}, data ${rest.join(" ")}`);
    soll.delete(key);
  }
  for (const key of soll.keys()) fehlend.push(`${key}: in bericht.md but not in daten/`);
  for (const f of fehlend) abweichungen.push(`bericht.md ${f}`);
  berichtStand = fehlend.length ? `${fehlend.length} Abweichung(en)` : "stimmt";
  for (const f of fehlend) console.log(`ABWEICHUNG bericht.md ${f}`);
}

console.log(`grün: ${abschnitt.join(" · ")}`);
console.log(
  `pruefen: ${[...zaehlung.values()].reduce((a, s) => a + s.n, 0)} Screens, ${zaehlung.size} Zelle×Variante, Abweichungen ${abweichungen.length}, Struktur ${strukturFehler.length}, bericht.md ${berichtStand}`,
);
process.exit(strukturFehler.length ? 2 : abweichungen.length ? 1 : 0);
