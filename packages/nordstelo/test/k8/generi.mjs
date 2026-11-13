// Generator of the K8 fixtures (Spec 038 Lauf 2, S038-12, D-95). Local only, never in CI: it starts
// Chromium through the nordstelo renderer. No language model, no network (the renderer blocks
// every request outside its own origin).
//
// Run from the repository root, one Playwright run at a time (no other Playwright suite at the
// same time):
//
//   pnpm --filter @fundamento/nordstelo... build
//   node packages/nordstelo/test/k8/generi.mjs
//
// Determinism check: run it twice and compare (`cp -r packages/nordstelo/test/fixtures/k8 /tmp/a`,
// run again, `diff -r /tmp/a packages/nordstelo/test/fixtures/k8`); both runs must be byte-equal.
//
// What it does:
// 1. Loads the Modelo of the cxiuj config (all four brands) and builds its CSS projection into a
//    temporary folder (`buildProjekcioj`, Celo css), as `fm ablauf` does (D-39).
// 2. Creates the renderer from `dist` with that Modelo (probe names) and renders each
//    `test/fixtures/k8/<name>/enigo.html` as Variante F. The screenshot is not written.
//    - `roh/enigo.html` carries placeholders: `{{FREMDA_FAMILIO}}` becomes a generic CSS family
//      word that is no brand family of any combination, `{{EKSTER_STUFO}}` a length that lies off
//      every spacing step of every combination, derived from `solojDe` (step + half the distance to
//      the next step + 1 px, the first such value off all steps). The values reach `faktoj.json`
//      through the rendered facts.
//    - `sxablono/enigo.html` is the example markup of a Sxablono from `listArangxoj`, unchanged
//      but for text labels; the generator checks that.
// 3. Writes `faktoj.json` (`stabilaJson`) and `atendo.json`: the expected K8 result, computed here
//    by a reference computation of the ticket's definition – not with `k8.ts`.

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { listArangxoj, loadModelo, markerOf, projectModeloSource } from "@fundamento/modelo";
import { buildProjekcioj } from "@fundamento/projekcioj";
import { stabilaJson } from "../../dist/ablauf/raporto.js";
import { ASPEKTOJ, createRenderer, SCHEMES, solojDe } from "../../dist/index.js";

const FIKSAJXOJ = fileURLToPath(new URL("../fixtures/k8/", import.meta.url));
const CXIUJ_CONFIG = fileURLToPath(
  new URL(
    "../../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
    import.meta.url,
  ),
);
// Spec 052 (V-5, D-052-03): the M-1 markup (`anmelden-m1` a byte copy of
// specs/050-mvp-probelauf/daten/m1/F/anmelden/fragmento.html, `konto-m1` of …/F/konto/fragmento.html
// without the line `<span slot="heading">Kontoangaben</span>`, Rest C) and the counter-probes of
// D-052-01. They carry no placeholder and are rendered unchanged, like `roh`.
const NOMOJ = [
  "roh",
  "sxablono",
  "anmelden-m1",
  "konto-m1",
  "gegenprobe-a-eigener-abstand",
  "gegenprobe-b-doppelte-luecke",
  "gegenprobe-c-eigener-verteiler",
  "gegenprobe-d1-eigene-klasse",
  "gegenprobe-d2-part",
  "gegenprobe-3c-ero-mit-style",
  // K8I-004b (D-052-13): agent-written declarative shadow roots (on fm-* hosts; with an own <style>).
  "gegenprobe-e1-deklarativa-ombro",
  "gegenprobe-e2-fermita-ombro",
  "gegenprobe-e3-ombro-part",
];

/** CSS generic family words (CSS Fonts 4), none of them a brand's own family. */
const GENERIC_FAMILIES = [
  "fantasy",
  "cursive",
  "monospace",
  "serif",
  "sans-serif",
  "system-ui",
  "math",
];

// --- Placeholders of `roh` -------------------------------------------------------------------------

function solojDeCxiuj(modelo) {
  return ASPEKTOJ.flatMap((aspekto) =>
    SCHEMES.map((scheme) => solojDe(modelo, { aspekto, scheme })),
  );
}

/** The first generic family word that is no first family of any combination. */
function fremdaFamilio(soloj) {
  const familioj = new Set(soloj.flatMap((s) => s.familioj));
  const vorto = GENERIC_FAMILIES.find((familio) => !familioj.has(familio));
  if (vorto === undefined) throw new Error("Every generic family is a brand family.");
  return vorto;
}

/** A length off every spacing step of every combination: step + half the gap + 1. */
function eksterStufo(soloj) {
  const cxiujStupoj = [...new Set(soloj.flatMap((s) => s.interspacoj))];
  const ekster = (px) => cxiujStupoj.every((stupo) => Math.abs(px - stupo) > 0.5);
  for (const { interspacoj } of soloj) {
    for (let i = 0; i + 1 < interspacoj.length; i++) {
      const px = interspacoj[i] + (interspacoj[i + 1] - interspacoj[i]) / 2 + 1;
      if (ekster(px)) return Math.round(px * 100) / 100;
    }
  }
  throw new Error("No length lies off every spacing step.");
}

// --- The Sxablono example -----------------------------------------------------------------------

const senTeksto = (markup) => markup.trim().replace(/>[^<]+</g, "><");

function kontroliSxablonon(modelo, markup) {
  const ekzemploj = listArangxoj(modelo)
    .arangxoj.filter((arangxo) => arangxo.kind === "sxablono")
    .map((arangxo) => arangxo.example);
  if (!ekzemploj.includes(senTeksto(markup)))
    throw new Error("sxablono/enigo.html is not the example of a Sxablono of listArangxoj.");
}

// --- Reference computation of K8 (independent of k8.ts) ----------------------------------------

const KVAR_LOKOJ = 10_000;
const r4 = (x) => Math.round(x * KVAR_LOKOJ) / KVAR_LOKOJ;
const cent = (x) => Math.round(x * 100) / 100;
const komparo = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function loko(elementoj, indekso) {
  const tags = [];
  for (let i = indekso; i >= 0 && tags.length < 3; ) {
    const el = elementoj[i];
    if (el === undefined) break;
    tags.unshift(el.tag);
    i = el.parent;
  }
  return tags.length === 0 ? "body" : tags.join(" > ");
}

function referenco(facts, modelo) {
  const elementoj = facts.elements;
  const renders = facts.renders
    .filter((r) => r.contrast === "default" && r.k8 !== undefined)
    .sort((a, b) => komparo(a.aspekto, b.aspekto) || komparo(a.scheme, b.scheme));
  if (renders.length === 0) return undefined;

  let sxablono = { v: 0, t: "keine Sxablono mit erkannter Region im Markup" };
  const nomoj = new Map((modelo.sxablonoj ?? []).map((e) => [e.sxablono.name, e]));
  for (let i = 0; i < elementoj.length && sxablono.v === 0; i++) {
    const el = elementoj[i];
    const entry = el.tag.startsWith("fm-") ? nomoj.get(el.tag.slice(3)) : undefined;
    if (entry === undefined) continue;
    const slots = new Set();
    let defaulta = false;
    for (const region of entry.skemo.regions) {
      const m = markerOf(modelo, entry, region);
      if (m.slot !== undefined) slots.add(m.slot);
      if (m.default === true) defaulta = true;
    }
    let plena = defaulta && el.text !== "";
    for (const infano of elementoj) {
      if (infano.parent !== i) continue;
      const slot = infano.attrs.slot;
      if (slot === undefined ? defaulta : slots.has(slot)) plena = true;
    }
    if (plena) sxablono = { v: 1, t: `vollständig: \`${loko(elementoj, i)}\`` };
  }

  const kombinacioj = renders.map((render) => {
    const f = render.k8;
    const familioj = new Set(f.sondoj.filter((s) => s.eco === "font-family").map((s) => s.valoro));
    const koloroj = new Set(f.sondoj.filter((s) => s.eco === "color").map((s) => s.valoro));
    const stupoj = f.sondoj
      .filter((s) => s.eco === "spacing")
      .map((s) => Number(s.valoro))
      .filter((n) => Number.isFinite(n));
    const sur = (px) => stupoj.some((s) => cent(Math.abs(px - s)) <= 0.5);

    // ersatzschrift
    const tekstoj = [...f.tekstoj].sort(
      (a, b) =>
        a.elemento - b.elemento || komparo(a.fontFamily, b.fontFamily) || a.signoj - b.signoj,
    );
    let tuto = 0;
    let fremdaj = 0;
    const fremdajLauxoj = [];
    for (const t of tekstoj) {
      tuto += t.signoj;
      if (!familioj.has(t.fontFamily)) {
        fremdaj += t.signoj;
        fremdajLauxoj.push(t);
      }
    }
    let ersatzschrift;
    if (tuto === 0) ersatzschrift = { v: 1, t: "nichts zu prüfen" };
    else if (fremdajLauxoj.length === 0) ersatzschrift = { v: 1, t: "vollständig" };
    else
      ersatzschrift = {
        v: (tuto - fremdaj) / tuto,
        t: `${fremdajLauxoj.length} von ${tekstoj.length} Textläufen (${Math.round((fremdaj / tuto) * 100)} % der Zeichen) in Ersatzschrift, zuerst \`${loko(elementoj, fremdajLauxoj[0].elemento)}\``,
      };

    // nativaj (D-102)
    const nativaj = [...f.nativaj].sort((a, b) => a.elemento - b.elemento || komparo(a.tag, b.tag));
    const krudaj = [];
    for (const n of nativaj) {
      const kio = [];
      if (!familioj.has(n.fontFamily)) kio.push("Schrift");
      const fonoBona =
        n.backgroundColor === "transparent" ||
        n.backgroundColor === "rgba(0, 0, 0, 0)" ||
        koloroj.has(n.backgroundColor);
      let randojBonaj = true;
      for (let s = 0; s < 4; s++)
        if (n.borderStyle[s] !== "none" && !koloroj.has(n.borderColor[s])) randojBonaj = false;
      if (!koloroj.has(n.color) || !fonoBona || !randojBonaj) kio.push("Farbe");
      if (![...n.padding, ...n.margin].every((px) => px === 0 || sur(px))) kio.push("Abstand");
      if (kio.length > 0) krudaj.push({ n, kio });
    }
    let nativa;
    if (nativaj.length === 0) nativa = { v: 1, t: "nichts zu prüfen" };
    else if (krudaj.length === 0) nativa = { v: 1, t: "vollständig" };
    else
      nativa = {
        v: (nativaj.length - krudaj.length) / nativaj.length,
        t: `${krudaj.length} von ${nativaj.length} nativen Elementen roh (${krudaj[0].kio.join(", ")}), zuerst \`${loko(elementoj, krudaj[0].n.elemento)}\``,
      };

    // interspacoj (D-08, D-103; Spec 052 D-052-01, V-2): a pair with `verteilita` is counted
    // apart, never scored; the sentence names their number when there is one.
    const paroj = [];
    let verteilitaj = 0;
    for (const p of f.interspacoj) {
      if (p.verteilita === undefined) paroj.push(p);
      else verteilitaj += 1;
    }
    paroj.sort(
      (a, b) =>
        a.post - b.post ||
        a.antaux - b.antaux ||
        a.gepatro - b.gepatro ||
        komparo(a.akso, b.akso) ||
        a.px - b.px,
    );
    const eksterStupoj = paroj.filter((p) => !sur(p.px));
    let interspaco;
    if (paroj.length === 0) interspaco = { v: 1, t: "nichts zu prüfen" };
    else if (eksterStupoj.length === 0) interspaco = { v: 1, t: "vollständig" };
    else
      interspaco = {
        v: (paroj.length - eksterStupoj.length) / paroj.length,
        t: `${eksterStupoj.length} von ${paroj.length} Geschwisterabständen nicht auf einer Abstandsstufe, zuerst \`${loko(elementoj, eksterStupoj[0].post)}\` (${String(eksterStupoj[0].px).replace(".", ",")} px)`,
      };
    if (verteilitaj > 0) interspaco.t += `, ${verteilitaj} verteilte Abstände nicht gezählt`;

    const merkmaloj = {
      ersatzschrift: r4(ersatzschrift.v),
      nativaj: r4(nativa.v),
      interspacoj: r4(interspaco.v),
      sxablono: r4(sxablono.v),
    };
    const nesxargitaj = [
      ...new Set(
        f.tiparoj.filter((t) => !t.sxargita && familioj.has(t.familio)).map((t) => t.familio),
      ),
    ].sort(komparo);
    const kialoj = [{ merkmal: "ersatzschrift", teksto: ersatzschrift.t }];
    if (nesxargitaj.length > 0)
      kialoj.push({
        merkmal: "ersatzschrift",
        teksto: `Schriftquelle nicht erreichbar: ${nesxargitaj.join(", ")}`,
      });
    kialoj.push({ merkmal: "nativaj", teksto: nativa.t });
    kialoj.push({ merkmal: "interspacoj", teksto: interspaco.t });
    kialoj.push({ merkmal: "sxablono", teksto: sxablono.t });
    const kombinacio = {
      aspekto: render.aspekto,
      scheme: render.scheme,
      merkmaloj,
      kvoto: r4(
        (merkmaloj.ersatzschrift + merkmaloj.nativaj + merkmaloj.interspacoj + merkmaloj.sxablono) /
          4,
      ),
      kialoj,
    };
    if (nesxargitaj.length > 0) kombinacio.nekomparebla = "tiparo-ne-sxargita";
    return kombinacio;
  });

  const celoj = new Set(listArangxoj(modelo).mankoj.map((m) => m.celo));
  const mankoj = ["row", "column", "stack"].some((celo) => celoj.has(celo)) ? ["interspacoj"] : [];
  return {
    kvoto: r4(kombinacioj.reduce((sumo, k) => sumo + k.kvoto, 0) / kombinacioj.length),
    kombinacioj,
    mankoj,
  };
}

// --- Main --------------------------------------------------------------------------------------

const { modelo } = loadModelo(projectModeloSource(CXIUJ_CONFIG));
if (modelo === undefined) throw new Error("The cxiuj-config Modelo does not load.");
const soloj = solojDeCxiuj(modelo);
const anstatauxoj = {
  "{{FREMDA_FAMILIO}}": fremdaFamilio(soloj),
  "{{EKSTER_STUFO}}": `${eksterStufo(soloj)}px`,
};

const projekcioj = mkdtempSync(join(tmpdir(), "nordstelo-k8-"));
try {
  const built = await buildProjekcioj({
    outDir: projekcioj,
    source: projectModeloSource(CXIUJ_CONFIG),
    celoj: ["css"],
  });
  if (!built.ok) throw new Error("The css projection of the cxiuj config does not build.");
  const erojDist = join(
    dirname(fileURLToPath(import.meta.resolve("@fundamento/eroj/package.json"))),
    "dist",
  );
  const renderer = await createRenderer({ projekcioj, erojDist, concurrency: 1, modelo });
  try {
    for (const nomo of NOMOJ) {
      const dosierujo = join(FIKSAJXOJ, nomo);
      const enigo = readFileSync(join(dosierujo, "enigo.html"), "utf8");
      if (nomo === "sxablono") kontroliSxablonon(modelo, enigo);
      let html = enigo;
      for (const [lokokupilo, valoro] of Object.entries(anstatauxoj))
        html = html.replaceAll(lokokupilo, valoro);
      if (html.includes("{{")) throw new Error(`${nomo}/enigo.html keeps a placeholder.`);
      const { facts } = await renderer.render(html, "F");
      writeFileSync(join(dosierujo, "faktoj.json"), stabilaJson(facts));
      writeFileSync(join(dosierujo, "atendo.json"), stabilaJson(referenco(facts, modelo)));
      process.stdout.write(
        `${nomo}: ${facts.renders.filter((r) => r.k8 !== undefined).length} renders with K8\n`,
      );
    }
  } finally {
    await renderer.close();
  }
} finally {
  rmSync(projekcioj, { recursive: true, force: true });
}
