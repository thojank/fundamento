#!/usr/bin/env node
// Spec 053 LA-2.2 (AC-16 … AC-19): re-evaluates the M-1 screens of Spec 050 with the tightened
// `label-required` check, without a model, without a browser, without network.
//
//   For every screen of M-1 (variants F and 0) it reads the unchanged fragmento.html of
//   specs/050-mvp-probelauf/daten/m1/<v>/<slug>/ and the Spec 052 re-evaluation
//   specs/052-k8-interspacoj/daten/neubewertung/m1/<v>/<slug>/fakto.json. It recomputes only
//   `malobservoj` – the M-1 path: the in-process Gvidanto (nordstelo's connectGvidanto) and
//   ekranoj's uzKontroliloDe, i.e. check_markup on the fragment – and the score's K3 (with its
//   `total` and the `regulo` gaps) through nordstelo's pure scorer taksiloPorMezuro. `fakto`
//   (renders, axe, K8 facts), `kompleta`, `zusatz` and every other score value come from 052.
//   Green ⇔ decidiVerdon(enigo).verda && zusatz.length === 0. Writes DatenFakto to
//   <out>/m1/{F,0}/<slug>/fakto.json and <out>/last.txt, with nordstelo's stabilaJson.
//
//   Self-checks, all before anything is written (nothing is written when one fails):
//   (a) per screen the recomputed taksado equals 052 except K3, total and added `regulo`
//       gaps with key label-required;
//   (b) the new malobservoj equal 052's plus added findings with rule label-required and
//       severity error – no 052 finding disappears or changes;
//   (c) the same run with the stored 052 malobservoj instead of the new ones gives 052's
//       green on every screen (alone, printing only: --ohne-schaerfung).
//
// Imports: node:* and, at run time, the dist of modelo, ekranoj and nordstelo (AC-19).
// Exit 0 ok · 1 a self-check failed · 2 usage, missing build or files.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const HELP = `Usage: node specs/053-leere-aktion/neubewertung.mjs [options]

  (no option)          re-check all 8 M-1 screens, self-checks (a) (b) (c), write <out>
  --out <dir>          output folder (default: daten/neubewertung beside this script)
  --quelle <dir>       the stored M-1 data (default: <repo>/specs/050-mvp-probelauf/daten/m1)
  --basis <dir>        the Spec 052 re-evaluation (default:
                       <repo>/specs/052-k8-interspacoj/daten/neubewertung/m1)
  --repo <dir>         the built checkout (default: two levels up)
  --ohne-schaerfung    self-check (c) only: the stored 052 malobservoj through the same
                       pipeline; prints one line, writes nothing
  --tabellen           print the Markdown tables of neubewertung.md from <basis> and <out>
  --roh <dir>          accepted and ignored (Spec 053 needs no raw M-1 facts)
  -h, --help           this text

Exit 0 ok · 1 self-check failed · 2 usage, missing build or files.`;

const stopp = (code, text) => {
  console.error(`neubewertung: ${text}`);
  process.exit(code);
};

let repo = resolve(HERE, "..", "..");
let out = join(HERE, "daten", "neubewertung");
let quelle;
let basis;
let roh;
let ohneSchaerfung = false;
let tabellen = false;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  const wert = () => argv[++i] ?? stopp(2, `${a} needs a value\n${HELP}`);
  if (a === "--out") out = resolve(wert());
  else if (a === "--quelle") quelle = resolve(wert());
  else if (a === "--basis") basis = resolve(wert());
  else if (a === "--repo") repo = resolve(wert());
  else if (a === "--roh") roh = resolve(wert());
  else if (a === "--ohne-schaerfung") ohneSchaerfung = true;
  else if (a === "--tabellen") tabellen = true;
  else if (a === "-h" || a === "--help") {
    console.log(HELP);
    process.exit(0);
  } else stopp(2, `unknown argument ${a}\n${HELP}`);
}
quelle ??= join(repo, "specs", "050-mvp-probelauf", "daten", "m1");
basis ??= join(repo, "specs", "052-k8-interspacoj", "daten", "neubewertung", "m1");
if (roh !== undefined)
  console.log(`neubewertung: --roh ${roh} ignored (Spec 053 reads no raw facts, Q-8)`);

const VARIANTOJ = ["F", "0"];
const TASKO = "anmelden-und-konto";
const RULE = "label-required";

const legi = (file) => JSON.parse(readFileSync(file, "utf8"));
const slugsDe = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((s) => existsSync(join(dir, s, "fakto.json")))
        .sort()
    : [];
const ekranojDe = () =>
  VARIANTOJ.flatMap((varianto) =>
    slugsDe(join(basis, varianto)).map((slug) => ({ varianto, slug })),
  );

// --- The built checkout -------------------------------------------------------------------------
const dist = (rel) => {
  const file = join(repo, rel);
  if (!existsSync(file))
    stopp(2, `${rel} missing: run pnpm build in the checkout (or pass --repo)`);
  return import(pathToFileURL(file).href);
};

const raporto = await dist("packages/nordstelo/dist/ablauf/raporto.js");
const ek = await dist("packages/ekranoj/dist/index.js");
const json = raporto.stabilaJson;
const verdeco = (enigo, zusatz) => {
  const decido = ek.decidiVerdon(enigo);
  return {
    verda: decido.verda && zusatz.length === 0,
    malhelpoj: [...zusatz, ...decido.malhelpoj],
  };
};
if (tabellen) {
  skribiTabelojn();
  process.exit(0);
}

const ns = await dist("packages/nordstelo/dist/index.js");
const katalogo = await dist("packages/nordstelo/dist/ablauf/katalogo.js");
const poentoj = await dist("packages/nordstelo/dist/ablauf/poentoj.js");
const md = await dist("packages/modelo/dist/index.js");
const { modelo } = md.loadModelo(md.defaultModeloSource());
if (modelo === undefined) stopp(2, "the repository Modelo does not load");
const tasko = katalogo.trovuTaskon(TASKO);
if (tasko === undefined) stopp(2, `task ${TASKO} not in the catalogue`);
const plano = katalogo.planoDe(tasko, "de");
const ekranoj = ekranojDe();
if (ekranoj.length === 0) stopp(2, `no <v>/<slug>/fakto.json under ${basis}`);
const taksilo = raporto.taksiloPorMezuro({ modelo, katalogo: poentoj.legiKatalogon(), tasko });

const novaMankoj = (m) => m.kind === "regulo" && m.key === RULE;
const sen = (taksado) => {
  const { total: _total, mankoj, k, ...resto } = taksado;
  const { K3: _k3, ...kResto } = k;
  return { ...resto, k: kResto, mankoj: mankoj.filter((m) => !novaMankoj(m)) };
};

// --- Re-check every screen ------------------------------------------------------------------------
const gvidanto = await ns.connectGvidanto();
const rezultoj = [];
const eraroj = [];
let vojo;
try {
  const kontrolilo = ek.uzKontroliloDe(gvidanto.bridge, await gvidanto.bridge.list());
  vojo = kontrolilo.vojo;
  if (vojo !== "check_markup") stopp(2, `the Gvidanto offers no check_markup (path ${vojo})`);
  for (const { varianto, slug } of ekranoj) {
    const kie = `${varianto}/${slug}`;
    const fragmentoDosiero = join(quelle, varianto, slug, "fragmento.html");
    if (!existsSync(fragmentoDosiero)) stopp(2, `${kie}: ${fragmentoDosiero} missing`);
    const fragmento = readFileSync(fragmentoDosiero, "utf8");
    const f = legi(join(basis, varianto, slug, "fakto.json"));
    if (f.enigo === null) stopp(2, `${kie}: 052 has no enigo (not built)`);
    const ekrano = plano.ekranoj.find((e) => e.slug === slug);
    if (ekrano === undefined) stopp(2, `${slug} is no screen of ${TASKO}`);
    const { fakto } = f.enigo;
    const { malobservoj } = await kontrolilo.kontroli({ fakto, fragmento });
    const taksado = taksilo.taksi({ fakto, ekrano, varianto });

    // (a) Nothing but K3, total and the label-required gap moves.
    const malnovaTaksado = f.enigo.taksado;
    if (malnovaTaksado.mankoj.some(novaMankoj))
      eraroj.push(`(a) ${kie}: 052 already has the gap regulo/${RULE}`);
    if (json(sen(taksado)) !== json(sen(malnovaTaksado)))
      eraroj.push(`(a) ${kie}: taksado differs from 052 beyond K3, total and regulo/${RULE}`);

    // (b) The 052 findings stay byte-identical; the only additions are label-required errors.
    const restantaj = malobservoj.map(json);
    for (const m of f.enigo.malobservoj) {
      const i = restantaj.indexOf(json(m));
      if (i < 0) eraroj.push(`(b) ${kie}: 052 finding ${m.rule} ${m.path} disappeared or changed`);
      else restantaj.splice(i, 1);
    }
    const aldonitaj = restantaj.map((s) => JSON.parse(s));
    for (const m of aldonitaj)
      if (m.rule !== RULE || m.severity !== "error")
        eraroj.push(`(b) ${kie}: added finding ${m.rule}/${m.severity ?? "error"} ${m.path}`);

    // (c) The stored 052 malobservoj through the same pipeline give 052's green.
    const sen053 = verdeco({ ...f.enigo, taksado, malobservoj: f.enigo.malobservoj }, f.zusatz);
    if (sen053.verda !== f.gespeichert.verda)
      eraroj.push(
        `(c) ${kie}: without the tightening green ${sen053.verda}, 052 stored ${f.gespeichert.verda}`,
      );

    const enigo = { varianto, taksado, malobservoj, fakto, kompleta: f.enigo.kompleta };
    const nun = verdeco(enigo, f.zusatz);
    rezultoj.push({
      varianto,
      slug,
      aldonitaj: aldonitaj.length,
      sen053,
      nun,
      dosiero: join("m1", varianto, slug, "fakto.json"),
      datumo: {
        zelle: "m1",
        varianto,
        slug,
        runde: f.runde,
        verdaEkde: nun.verda ? f.runde : null,
        gespeichert: { verda: nun.verda },
        enigo,
        zusatz: [...f.zusatz],
        herkunft: {
          ...f.herkunft,
          neubewertung:
            "Spec 053: check_markup auf unverändertem fragmento.html, ohne Modell, ohne Rendering",
        },
      },
    });
  }
} finally {
  await gvidanto.close();
}

const zaehlo = (varianto, verda) => {
  const vico = rezultoj.filter((r) => r.varianto === varianto);
  const verdaj = vico.filter((r) => verda(r)).map((r) => r.slug);
  return `${varianto} ${verdaj.length}/${vico.length} (${verdaj.join(",") || "-"})`;
};
const linio = (verda) =>
  `${rezultoj.length} Screens, grün ${VARIANTOJ.map((v) => zaehlo(v, verda)).join(", ")}`;

for (const e of eraroj) console.error(`SELBSTPRUEFUNG ${e}`);
if (ohneSchaerfung) {
  console.log(
    `ohne-schaerfung: ${linio((r) => r.sen053.verda)}; ${eraroj.filter((e) => e.startsWith("(c)")).length ? "ABWEICHUNG von 052" : "gleich 052"}; nichts geschrieben`,
  );
  process.exit(eraroj.length ? 1 : 0);
}
if (eraroj.length > 0) stopp(1, `self-check failed (${eraroj.length}), nothing written`);

for (const r of rezultoj)
  console.log(
    `geprüft ${r.varianto} ${r.slug.padEnd(20)} +${r.aldonitaj} ${RULE} · K3 ${r.datumo.enigo.taksado.k.K3 ?? "-"} · grün ${r.nun.verda} (ohne Schärfung ${r.sen053.verda}) · malhelpoj ${r.nun.malhelpoj.join(",") || "-"}`,
  );
console.log(`selbstpruefung: (a) ok, (b) ok, (c) ${linio((r) => r.sen053.verda)}, gleich 052`);

let commit = "unbekannt";
try {
  commit = execFileSync("git", ["-C", repo, "rev-parse", "--short=8", "HEAD"], {
    encoding: "utf8",
  }).trim();
  const dirty = execFileSync("git", ["-C", repo, "status", "--porcelain", "--", "packages"], {
    encoding: "utf8",
  }).trim();
  if (dirty !== "") commit += "-dirty(packages)";
} catch {}

for (const r of rezultoj) {
  mkdirSync(dirname(join(out, r.dosiero)), { recursive: true });
  writeFileSync(join(out, r.dosiero), json(r.datumo));
}
const repoRel = (p) => relative(repo, p) || ".";
writeFileSync(
  join(out, "last.txt"),
  [
    `Commit: ${commit}`,
    `Node: ${process.version}`,
    `Prüfweg: ${vojo} (Gvidanto im Prozess, ohne Modell, ohne Rendering)`,
    `Quelle: ${repoRel(quelle)} (fragmento.html)`,
    `Basis: ${repoRel(basis)} (fakto.json)`,
    "",
  ].join("\n"),
);
console.log(`neubewertung: ${linio((r) => r.nun.verda)}`);
process.exit(0);

// --- Tables for neubewertung.md ------------------------------------------------------------------
function skribiTabelojn() {
  const nombro = (x) => (x === undefined || x === null ? "–" : String(x).replace(".", ","));
  const jesNe = (b) => (b ? "**ja**" : "nein");
  const listo = (malobservoj) =>
    malobservoj.length === 0
      ? "–"
      : malobservoj
          .map((m) => `\`${m.rule}\` ${m.severity ?? "error"} \`${m.path}\` ${m.loko ?? ""}`.trim())
          .join("<br>");
  const paroj = ekranojDe().map(({ varianto, slug }) => {
    const nPath = join(out, "m1", varianto, slug, "fakto.json");
    if (!existsSync(nPath)) stopp(2, `${nPath} missing: run the re-evaluation first`);
    const malnova = legi(join(basis, varianto, slug, "fakto.json"));
    return { varianto, slug, malnova, nova: legi(nPath) };
  });
  const malhelpoj = (f) => {
    const d = verdeco(f.enigo, f.zusatz).malhelpoj;
    return d.length ? d.map((m) => `\`${m}\``).join(", ") : "–";
  };
  for (const varianto of VARIANTOJ) {
    console.log(`\n#### Variante ${varianto}\n`);
    console.log(
      "| Screen | `malobservoj` 052 | `malobservoj` 053 | K3 052 → 053 | total 052 → 053 | grün 052 → 053 | `malhelpoj` 052 | `malhelpoj` 053 |",
    );
    console.log("|---|---|---|---|---|---|---|---|");
    for (const { slug, malnova, nova } of paroj.filter((p) => p.varianto === varianto)) {
      const a = malnova.enigo;
      const b = nova.enigo;
      console.log(
        `| ${slug} | ${listo(a.malobservoj)} | ${listo(b.malobservoj)} | ${nombro(a.taksado.k.K3)} → ${nombro(b.taksado.k.K3)} | ${nombro(a.taksado.total)} → ${nombro(b.taksado.total)} | ${jesNe(malnova.gespeichert.verda)} → ${jesNe(nova.gespeichert.verda)} | ${malhelpoj(malnova)} | ${malhelpoj(nova)} |`,
      );
    }
  }
  console.log("\n#### Neue Befunde im Wortlaut\n");
  for (const { varianto, slug, malnova, nova } of paroj) {
    const alt = new Set(malnova.enigo.malobservoj.map(json));
    for (const m of nova.enigo.malobservoj.filter((x) => !alt.has(json(x))))
      console.log(`- ${varianto} ${slug} \`${m.path}\` (${m.loko}): ${m.message}`);
  }
}
