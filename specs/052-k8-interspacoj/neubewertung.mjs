#!/usr/bin/env node
// Spec 052 K8I-005 (AC-N1, AC-N2, AC-N5): re-evaluates the M-1 screens of Spec 050 without a model.
// No model, no network, no change to specs/050-*: it only reads there.
//
//   Control (AC-N1 b, --roh): k8() of this checkout on the raw facts of M-1 (outside the repo, read
//   only) must give byte for byte (stabilaJson) the stored taksado.k8 without `plena`.
//   Rendered (AC-N2, default): every fragmento.html of specs/050-mvp-probelauf/daten/m1/{F,0}/<slug>/
//   is rendered the way M-1 rendered it – ekranoj's simplaDokumento (the measurement „ganzer Ablauf“
//   hands ekranoj no `eligo.dokumento`), nordstelo's createRenderer with the css of all four brands
//   of the cxiuj config, bildigiloDeRenderer (contrast default: 4 brands × light/dark), the scorer
//   taksiloPorMezuro of the task anmelden-und-konto. `malobservoj`, `kompleta` and `zusatz` come
//   from the stored data (the markup is unchanged). Green ⇔ decidiVerdon(enigo).verda &&
//   zusatz.length === 0. Writes DatenFakto to <out>/m1/{F,0}/<slug>/fakto.json and <out>/last.txt.
//   Self-check (D-052-01, AC-N5): a `verteilita` pair whose origin is no fm-* element, or any
//   `verteilita` pair in Variante 0, ends the run with exit 5 (also alone: --selbstpruefung).
//
// Exit 0 ok · 1 control deviates (AC-N1 b) · 2 usage, missing build or files · 3 render not stable
// (console, brand font not loaded, render error) · 4 load(1 min) ≥ 10, nothing scored · 5 self-check.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const HELP = `Usage: node specs/052-k8-interspacoj/neubewertung.mjs [options]

  (no option)               render all 8 M-1 screens, score, self-check, write <out>
  --out <dir>               output folder (default: daten/neubewertung beside this script)
  --quelle <dir>            the stored M-1 data (default: <repo>/specs/050-mvp-probelauf/daten/m1)
  --roh <dir>               the raw M-1 run folder (the one holding anmelden-und-konto/{F,0}/1/rondoj/);
                            runs the control AC-N1 (b) and writes <out>/kontrolle.json; read only
  --nur-kontrolle           with --roh: the control only, no rendering
  --selbstpruefung <dir>    only the self-check over <dir>/m1/{F,0}/<slug>/fakto.json, no rendering
  --tabellen                print the Markdown tables of neubewertung.md from <quelle>, <out>
  --repo <dir>              the built checkout (default: two levels up)
  -h, --help                this text

Exit 0 ok · 1 control deviates · 2 usage/build/files · 3 render not stable · 4 load(1 min) ≥ 10
(wait, nothing is scored) · 5 self-check failed.`;

const stopp = (code, text) => {
  console.error(`neubewertung: ${text}`);
  process.exit(code);
};

let repo = resolve(HERE, "..", "..");
let out = join(HERE, "daten", "neubewertung");
let quelle;
let roh;
let nurKontrolle = false;
let selbstpruefung;
let tabellen = false;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  const wert = () => argv[++i] ?? stopp(2, `${a} needs a value\n${HELP}`);
  if (a === "--out") out = resolve(wert());
  else if (a === "--quelle") quelle = resolve(wert());
  else if (a === "--roh") roh = resolve(wert());
  else if (a === "--repo") repo = resolve(wert());
  else if (a === "--nur-kontrolle") nurKontrolle = true;
  else if (a === "--selbstpruefung") selbstpruefung = resolve(wert());
  else if (a === "--tabellen") tabellen = true;
  else if (a === "-h" || a === "--help") {
    console.log(HELP);
    process.exit(0);
  } else stopp(2, `unknown argument ${a}\n${HELP}`);
}
if (nurKontrolle && roh === undefined) stopp(2, "--nur-kontrolle needs --roh");
quelle ??= join(repo, "specs", "050-mvp-probelauf", "daten", "m1");

const VARIANTOJ = ["F", "0"];
const TASKO = "anmelden-und-konto";
const SLUGS = readdirSafe(join(quelle, "F"));

function readdirSafe(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((s) => existsSync(join(dir, s, "fakto.json")))
    .sort();
}
const legi = (file) => JSON.parse(readFileSync(file, "utf8"));
const sha = (text) => createHash("sha256").update(text).digest("hex");
const nomo = (elementoj, i) => {
  const e = elementoj[i];
  if (e === undefined) return `#${i}`;
  return `${e.tag}${e.attrs?.slot ? `[slot=${e.attrs.slot}]` : ""}`;
};

// --- Self-check (D-052-01): only Eroj and Sxablonoj distribute, never in Variante 0 ------------
function kontroliVerteilitajn(dir) {
  const eraroj = [];
  let paroj = 0;
  for (const varianto of VARIANTOJ) {
    for (const slug of readdirSafe(join(dir, "m1", varianto))) {
      const f = legi(join(dir, "m1", varianto, slug, "fakto.json"));
      const fakto = f.enigo?.fakto;
      for (const render of fakto?.renders ?? []) {
        for (const p of render.k8?.interspacoj ?? []) {
          if (p.verteilita === undefined) continue;
          paroj += 1;
          const ero = String(p.verteilita.ero ?? "");
          const kie = `${varianto}/${slug} ${render.aspekto}/${render.scheme} ${p.antaux}→${p.post} (${nomo(fakto.elements, p.antaux)} → ${nomo(fakto.elements, p.post)}, ${p.px} px, origin ${ero || "-"})`;
          if (!ero.startsWith("fm-")) eraroj.push(`verteilita without fm-* origin: ${kie}`);
          if (varianto === "0") eraroj.push(`verteilita in Variante 0: ${kie}`);
        }
      }
    }
  }
  return { eraroj, paroj };
}

if (selbstpruefung !== undefined) {
  const { eraroj, paroj } = kontroliVerteilitajn(selbstpruefung);
  for (const e of eraroj) console.error(`SELBSTPRUEFUNG ${e}`);
  console.log(`selbstpruefung: ${paroj} verteilita pair(s), ${eraroj.length} error(s)`);
  process.exit(eraroj.length ? 5 : 0);
}

// --- The built checkout -------------------------------------------------------------------------
const dist = (rel) => {
  const file = join(repo, rel);
  if (!existsSync(file))
    stopp(2, `${rel} missing: run pnpm build in the checkout (or pass --repo)`);
  return import(pathToFileURL(file).href);
};

if (tabellen) {
  await skribiTabelojn();
  process.exit(0);
}

const ek = await dist("packages/ekranoj/dist/index.js");
const ns = await dist("packages/nordstelo/dist/index.js");
const raporto = await dist("packages/nordstelo/dist/ablauf/raporto.js");
const katalogo = await dist("packages/nordstelo/dist/ablauf/katalogo.js");
const poentoj = await dist("packages/nordstelo/dist/ablauf/poentoj.js");
const md = await dist("packages/modelo/dist/index.js");
const { modelo } = md.loadModelo(md.defaultModeloSource());
if (modelo === undefined) stopp(2, "the repository Modelo does not load");
const tasko = katalogo.trovuTaskon(TASKO);
if (tasko === undefined) stopp(2, `task ${TASKO} not in the catalogue`);
const plano = katalogo.planoDe(tasko, "de");
if (SLUGS.length === 0) stopp(2, `no <slug>/fakto.json under ${join(quelle, "F")}`);

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

const senPlena = (k8) => {
  if (k8 === undefined) return undefined;
  const { plena: _plena, ...resto } = k8;
  return resto;
};

// --- Control AC-N1 (b) ---------------------------------------------------------------------------
let kontrolEraroj = 0;
if (roh !== undefined) {
  const kontrolo = [];
  for (const varianto of VARIANTOJ) {
    for (const slug of readdirSafe(join(quelle, varianto))) {
      const f = legi(join(quelle, varianto, slug, "fakto.json"));
      const rondo = f.herkunft?.rondo;
      if (typeof rondo !== "string") stopp(2, `${varianto}/${slug}: no herkunft.rondo`);
      const dosiero = join(roh, `${rondo}.fakto.json`);
      if (!existsSync(dosiero)) {
        kontrolo.push({ varianto, slug, rondo, prueffaehig: false });
        console.log(
          `KONTROLLE ${varianto} ${slug}: raw facts missing (${rondo}.fakto.json) – nicht prüfbar`,
        );
        kontrolEraroj += 1;
        continue;
      }
      const kruda = legi(dosiero);
      const nova = ns.k8(kruda, modelo);
      const gespeichert = senPlena(f.enigo?.taksado?.k8);
      const a = raporto.stabilaJson(nova ?? null);
      const b = raporto.stabilaJson(gespeichert ?? null);
      const sama = a === b;
      const novaPlena = nova === undefined ? undefined : ns.k8Plena(nova);
      const verdaNova =
        ek.decidiVerdon({
          ...f.enigo,
          taksado: {
            ...f.enigo.taksado,
            k8: nova === undefined ? undefined : { ...nova, plena: novaPlena },
          },
        }).verda && f.zusatz.length === 0;
      const samaVerdo = verdaNova === f.gespeichert.verda;
      if (!sama || !samaVerdo) kontrolEraroj += 1;
      kontrolo.push({
        varianto,
        slug,
        rondo,
        prueffaehig: true,
        k8Gleich: sama,
        sha256: { kontrolle: sha(a), gespeichert: sha(b) },
        verda: { kontrolle: verdaNova, gespeichert: f.gespeichert.verda },
        kvoto: nova?.kvoto ?? null,
        interspacoj: Object.fromEntries(
          (nova?.kombinacioj ?? []).map((k) => [
            `${k.aspekto}/${k.scheme}`,
            k.merkmaloj.interspacoj,
          ]),
        ),
      });
      console.log(
        `${sama && samaVerdo ? "ok        " : "ABWEICHUNG"} kontrolle ${varianto} ${slug.padEnd(20)} k8 ${sama ? "byte-gleich" : "abweichend"} (sha256 ${sha(a).slice(0, 12)}) · grün ${verdaNova} / gespeichert ${f.gespeichert.verda}`,
      );
    }
  }
  mkdirSync(out, { recursive: true });
  writeFileSync(
    join(out, "kontrolle.json"),
    raporto.stabilaJson({ commit, tasko: TASKO, kontrolo }),
  );
  console.log(`kontrolle: ${kontrolo.length} Screens, Abweichungen ${kontrolEraroj}`);
  if (nurKontrolle) process.exit(kontrolEraroj ? 1 : 0);
}

// --- Rendered AC-N2 ------------------------------------------------------------------------------
const lastText = () =>
  os
    .loadavg()
    .map((x) => x.toFixed(2))
    .join(" ");
const kerne = os.availableParallelism?.() ?? os.cpus().length;
const lastVor = lastText();
if (os.loadavg()[0] >= 10)
  stopp(4, `load(1 min) ${lastVor.split(" ")[0]} ≥ 10: wait, nothing scored`);

const taksilo = raporto.taksiloPorMezuro({ modelo, katalogo: poentoj.legiKatalogon(), tasko });
const cli = await dist("packages/nordstelo/dist/ablauf/cli-ablauf.js");
const pj = await dist("packages/projekcioj/dist/index.js");
const tmp = mkdtempSync(join(os.tmpdir(), "s052-neubewertung."));
const rezultoj = [];
let renderer;
try {
  // D-39 / cli-ablauf realaPreparo: the css of all four brands of the cxiuj config.
  const projekcioj = join(tmp, "projekcioj");
  const bau = await pj.buildProjekcioj({
    outDir: projekcioj,
    source: md.projectModeloSource(
      join(
        repo,
        "packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
      ),
    ),
    celoj: ["css"],
  });
  if (!bau.ok) stopp(3, "the css projection of all brands did not build");
  renderer = await ns.createRenderer({
    projekcioj,
    erojDist: join(repo, "packages/eroj/dist"),
    concurrency: 1,
  });
  const bildigilo = cli.bildigiloDeRenderer(renderer);
  for (const varianto of VARIANTOJ) {
    for (const slug of readdirSafe(join(quelle, varianto))) {
      const f = legi(join(quelle, varianto, slug, "fakto.json"));
      const fragmento = readFileSync(join(quelle, varianto, slug, "fragmento.html"), "utf8");
      const ekrano = plano.ekranoj.find((e) => e.slug === slug);
      if (ekrano === undefined) stopp(2, `${slug} is no screen of ${TASKO}`);
      const lingvo = f.enigo?.fakto?.lingvo ?? "de";
      const dokumento = ek.simplaDokumento({ ekrano, fragmento, varianto, lingvo });
      let bildigo;
      try {
        bildigo = await bildigilo.render(dokumento, {
          aspektoj: ["komuna"],
          varianto,
          sondoPetoj: taksilo.sondoPetoj,
        });
      } catch (error) {
        stopp(3, `${varianto}/${slug}: render failed (${error?.message ?? error})`);
      }
      const fakto = bildigo.fakto;
      if (fakto.console.length > 0)
        stopp(3, `${varianto}/${slug}: console not empty: ${fakto.console.join(" | ")}`);
      if (fakto.renders.length !== 8 || fakto.renders.some((r) => r.k8 === undefined))
        stopp(3, `${varianto}/${slug}: ${fakto.renders.length} renders, not 8 with K8 facts`);
      for (const r of fakto.renders) {
        const mankas = (r.k8.tiparoj ?? []).filter((t) => !t.sxargita).map((t) => t.familio);
        if (mankas.length > 0)
          stopp(
            3,
            `${varianto}/${slug} ${r.aspekto}/${r.scheme}: font not loaded: ${mankas.join(", ")}`,
          );
      }
      const taksado = taksilo.taksi({ fakto, ekrano, varianto });
      const enigo = {
        varianto,
        taksado,
        malobservoj: f.enigo.malobservoj,
        fakto,
        kompleta: f.enigo.kompleta,
      };
      const verda = ek.decidiVerdon(enigo).verda && f.zusatz.length === 0;
      rezultoj.push({
        dosiero: join("m1", varianto, slug, "fakto.json"),
        datumo: {
          zelle: "m1",
          varianto,
          slug,
          runde: f.runde,
          verdaEkde: verda ? f.runde : null,
          gespeichert: { verda },
          enigo,
          zusatz: [...f.zusatz],
          herkunft: {
            ...f.herkunft,
            neubewertung: "Spec 052 K8I-005: fragmento.html neu gerendert, ohne Modell",
          },
        },
      });
      const k8 = taksado.k8;
      console.log(
        `gerendert ${varianto} ${slug.padEnd(20)} K8 ${k8?.kvoto ?? "-"} plena ${k8?.plena ?? "-"} · grün ${verda} · malhelpoj ${ek.decidiVerdon(enigo).malhelpoj.join(",") || "-"}`,
      );
    }
  }
} finally {
  await renderer?.close().catch(() => {});
  rmSync(tmp, { recursive: true, force: true });
}
const lastNach = lastText();

// Self-check before anything is written: scored data with an agent pair never lands in <out>.
const probe = mkdtempSync(join(os.tmpdir(), "s052-selbst."));
for (const r of rezultoj) {
  mkdirSync(dirname(join(probe, r.dosiero)), { recursive: true });
  writeFileSync(join(probe, r.dosiero), raporto.stabilaJson(r.datumo));
}
const selbst = kontroliVerteilitajn(probe);
rmSync(probe, { recursive: true, force: true });
for (const e of selbst.eraroj) console.error(`SELBSTPRUEFUNG ${e}`);
if (selbst.eraroj.length > 0)
  stopp(5, `self-check failed (${selbst.eraroj.length}), nothing written`);

for (const r of rezultoj) {
  mkdirSync(dirname(join(out, r.dosiero)), { recursive: true });
  writeFileSync(join(out, r.dosiero), raporto.stabilaJson(r.datumo));
}
writeFileSync(
  join(out, "last.txt"),
  [
    `Last vor: ${lastVor}`,
    `Last nach: ${lastNach}`,
    `Kerne: ${kerne}`,
    `Commit: ${commit}`,
    `Node: ${process.version}`,
    "Quelle: specs/050-mvp-probelauf/daten/m1 (fragmento.html, fakto.json)",
    "",
  ].join("\n"),
);
const verdaj = (v) =>
  rezultoj
    .filter((r) => r.datumo.varianto === v && r.datumo.gespeichert.verda)
    .map((r) => r.datumo.slug);
console.log(
  `neubewertung: ${rezultoj.length} Screens, grün F ${verdaj("F").length}/${rezultoj.filter((r) => r.datumo.varianto === "F").length} (${verdaj("F").join(",") || "-"}), 0 ${verdaj("0").length}/${rezultoj.filter((r) => r.datumo.varianto === "0").length}; verteilita ${selbst.paroj}; Last ${lastVor} → ${lastNach}`,
);
process.exit(kontrolEraroj ? 1 : 0);

// --- Tables for neubewertung.md ------------------------------------------------------------------
async function skribiTabelojn() {
  const nombro = (x) => (x === undefined || x === null ? "–" : String(x).replace(".", ","));
  const kombo = (k8, a, s) => k8?.kombinacioj?.find((k) => k.aspekto === a && k.scheme === s);
  const kontrolo = existsSync(join(out, "kontrolle.json"))
    ? legi(join(out, "kontrolle.json")).kontrolo
    : [];
  const ASP = ["komuna", "ekzemplo", "provo", "provo-kompakta"];
  const SCH = ["light", "dark"];
  for (const varianto of VARIANTOJ) {
    console.log(`\n### Variante ${varianto}\n`);
    console.log(
      "| Screen | Marke | Schema | interspacoj gesp. · Kontr. · gerend. | kvoto gesp. · Kontr. · gerend. |",
    );
    console.log("|---|---|---|---|---|");
    for (const slug of readdirSafe(join(quelle, varianto))) {
      const g = legi(join(quelle, varianto, slug, "fakto.json")).enigo.taksado.k8;
      const nPath = join(out, "m1", varianto, slug, "fakto.json");
      const n = existsSync(nPath) ? legi(nPath).enigo.taksado.k8 : undefined;
      const kRow = kontrolo.find((k) => k.varianto === varianto && k.slug === slug);
      for (const a of ASP)
        for (const s of SCH) {
          const kg = kombo(g, a, s);
          const kn = kombo(n, a, s);
          const ki = kRow?.k8Gleich ? kg : undefined;
          console.log(
            `| ${slug} | ${a} | ${s === "light" ? "hell" : "dunkel"} | ${nombro(kg?.merkmaloj.interspacoj)} · ${nombro(ki?.merkmaloj.interspacoj)} · ${nombro(kn?.merkmaloj.interspacoj)} | ${nombro(kg?.kvoto)} · ${nombro(ki?.kvoto)} · ${nombro(kn?.kvoto)} |`,
          );
        }
    }
  }
  console.log("\n### Paare (gerendert)\n");
  for (const varianto of VARIANTOJ)
    for (const slug of readdirSafe(join(out, "m1", varianto))) {
      const f = legi(join(out, "m1", varianto, slug, "fakto.json"));
      const el = f.enigo.fakto.elements;
      for (const r of f.enigo.fakto.renders) {
        const soloj = (r.k8.interspacoj ?? []).map(
          (p) =>
            `${p.antaux}→${p.post} ${nomo(el, p.antaux)}→${nomo(el, p.post)} ${p.akso} ${nombro(p.px)}${p.verteilita ? ` verteilita(${p.verteilita.ero})` : ""}`,
        );
        console.log(`${varianto} ${slug} ${r.aspekto}/${r.scheme}: ${soloj.join(" · ")}`);
      }
      const k8 = f.enigo.taksado.k8;
      for (const k of k8?.kombinacioj ?? []) {
        const t = k.kialoj.filter((x) => x.merkmal === "interspacoj").map((x) => x.teksto);
        const nicht1 = Object.entries(k.merkmaloj).filter(([, x]) => x !== 1);
        console.log(
          `  kialo ${k.aspekto}/${k.scheme}: ${t.join(" ")}${nicht1.length ? ` · nicht 1: ${nicht1.map(([m, x]) => `${m}=${x}`).join(",")}` : ""}`,
        );
      }
      console.log(
        `  malhelpoj: K=${JSON.stringify(f.enigo.taksado.k)} verda=${f.gespeichert.verda}`,
      );
    }
}
