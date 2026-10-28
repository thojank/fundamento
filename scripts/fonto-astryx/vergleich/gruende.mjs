// Spec 029 ①b e): der Grund jeder Abweichung auf der Vergleichsseite. Liest die Messung
// (.fundamento/vergleich/messungen.json), die Herkunft (packages/aspekto-komuna/deveno.json), die
// Jugxoj von komuna und den Bericht des Generators (eroj.mjs, als JSON-Datei übergeben) und schreibt
// die Seite mit einer Spalte „Grund“ je Zelle neu: Jugxo, Rundung auf eine Stufe, Achse ohne
// Gegenstück (②b), behalten nach der Abgleichstabelle, oder nicht gemessen.
//
//   node scripts/fonto-astryx/eroj.mjs > /tmp/eroj.json && node scripts/fonto-astryx/vergleich/gruende.mjs /tmp/eroj.json

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { eroFaelle } from "./faelle.mjs";
import { SPALTEN, seite } from "./seite.mjs";
import { teileVon } from "./vergleich.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
const repo = join(here, "../../..");
const out = process.env.VERGLEICH_OUT ?? join(repo, ".fundamento/vergleich");
const bericht =
  process.argv[2] === undefined ? {} : JSON.parse(readFileSync(process.argv[2], "utf8"));
const messungen = JSON.parse(readFileSync(join(out, "messungen.json"), "utf8"));
const deveno = JSON.parse(
  readFileSync(join(repo, "packages/aspekto-komuna/deveno.json"), "utf8"),
).valoroj;
const jugxoj = new Map(
  JSON.parse(readFileSync(join(repo, "packages/aspekto-komuna/jugxoj.json"), "utf8")).jugxoj.map(
    (jugxo) => [jugxo.id, jugxo],
  ),
);
const definitions = await eroFaelle();

// Eine Spalte der Tabelle → die CSS-Eigenschaften, die sie zeigt.
const COLUMN_PROPS = {
  "@box": ["min-block-size", "block-size", "inline-size", "min-inline-size"],
  "padding-inline-start": ["padding-inline", "padding", "padding-inline-start"],
  "border-top-left-radius": ["border-radius"],
  "border-top-width": ["border-width", "border-inline-start-width", "border-block-end-width"],
  "border-top-color": ["border-color", "border-inline-start-color", "border-block-end-color"],
  "background-color": ["background-color"],
  color: ["color"],
  "font-size": ["font-size"],
};
const kurz = (id) => {
  const jugxo = jugxoj.get(id);
  return jugxo === undefined ? id : `Jugxo ${id.slice(-4)}: ${jugxo.kialo.split(/[.:]/)[0]}`;
};
const uneinheitlich = new Set(bericht.uneinheitlich ?? []);

const gruende = {};
for (const def of definitions) {
  const { vars } = await teileVon(def.ero);
  for (const [, property] of SPALTEN) {
    const props = COLUMN_PROPS[property] ?? [property];
    for (const [name, uses] of Object.entries(vars)) {
      for (const use of uses) {
        if (!props.includes(use.property)) continue;
        const token = `ero.${name.replace("--fm-ero-", "").split("-").join(".")}`;
        const entries = deveno.filter(
          (entry) =>
            entry.token.replaceAll("-", ".") === token ||
            name.startsWith(`--fm-ero-${entry.token.slice(4).replaceAll(".", "-")}`),
        );
        let grund;
        const adapted = entries.find((entry) => entry.jugxo !== undefined);
        if (adapted !== undefined) grund = kurz(adapted.jugxo);
        else if (entries.some((entry) => /rundita/.test(entry.maniero)))
          grund = `auf eine Stufe gerundet (${entries.find((entry) => /rundita/.test(entry.maniero))?.noto ?? "ΔE2000"})`;
        else if (
          entries.length === 0 &&
          [...uneinheitlich].some((t) =>
            name.startsWith(`--fm-ero-${t.slice(4).replaceAll(".", "-")}`),
          )
        )
          grund = "②b: die Fonto unterscheidet, was das Token nicht trennt";
        else if (entries.length === 0 && /butono-box-inline-padding/.test(name))
          grund = "②b: Form „nur Icon“ (O-1b-4)";
        else if (entries.length === 0 && /avizo-accent/.test(name))
          grund = "behalten nach Abgleichstabelle (A-avizo-4)";
        else if (entries.length === 0) grund = "kein gemessenes Gegenstück";
        // Ein konkreter Grund ersetzt „kein gemessenes Gegenstück“ (ein Pseudo-Element am selben Teil).
        const key = `${def.ero}|${use.part}|${property}`;
        if (
          grund !== undefined &&
          (gruende[key] === undefined ||
            (gruende[key] === "kein gemessenes Gegenstück" && use.pseudo === undefined))
        )
          gruende[key] = grund;
      }
    }
  }
}
messungen.gruende = gruende;
writeFileSync(join(out, "messungen.json"), JSON.stringify(messungen, null, 1));
writeFileSync(join(out, "index.html"), seite(messungen, definitions));
console.log(`${Object.keys(gruende).length} Gründe: file://${join(out, "index.html")}`);
