// Spec 036 Teil 4, Befund 4.3 (Weg B): the material run. Material – images, a PDF, links – read
// through the local server as `pnpm fm metiejo` runs it (dist), started in this process, each
// material into a throw-away brand in a temporary folder. Per material and step the script prints
// what the take-over proposes – the value with its provenance (source, file or address, feature,
// share) and how sure it is – or that the step is open, with its sentence, and whether the known
// target was hit. At the end tokens in/out, requests, cost, duration, and whether a key stands in
// the Kroniko or the log.
//
// Default material: the synthetic set of the tests (src/test-doubles/uebernahme/, the invented brand
// „Sablo“), each picture with a known target per step, plus four pages of Sablo for a link, served
// on 127.0.0.1 by this process (no network). With --material <datei> (repeatable) the given files
// are read instead – a picture, a PDF, a font, or a JSON { "url" } for a link –, only from outside
// the repo (R-7); their names and values are not printed.
//
// With --marke <datei> (repeatable, JSON { "nomo", "url", "praegend"? } outside the repo) and
// --ergebnis <datei> (outside the repo, mode 600) a real brand is measured anonymously (D-27): its
// address is read as a link, and the first screen of the page, rendered by Chromium (Playwright of
// this package), is read as a picture; the target per step comes from the rendered page itself
// (computed styles: the buttons' radius against their height, drawn shadows, the ground, the body
// font) and from „praegend“ for the lead colour. Screenshot and targets are kept beside the result
// file (mode 600) and reused, so that „vorher“ and „nachher“ read the same picture. The output
// names no brand, no address and no value: per step only „Wert“ or „offen“ and hit yes/no.
//
// With --baum <built checkout> the server of another checkout runs (the „vorher“ of a comparison):
// a checkout without the route of the proposals per step (BASIS) is measured by what its reading
// proposed per Faceto (the answer of `materialo`), mapped to the steps.
//
// Without --mit-modell no language model is asked (0 tokens). With --mit-modell one chat turn per
// brand asks the assistant about the form, over Mistral ministral-14b-2512 (the maintainer's
// tariff) whatever the .env names, with a cost limit of 30 000 tokens per turn and the provider's
// limits (LIMOJ). The key never leaves the server.
//
//   cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
//   pnpm build
//   pnpm --filter @fundamento/metiejo exec tsx scripts/abnahme-weg-b.ts [--mit-modell]
//     [--env <Pfad der .env>, ohne: die .env des Checkouts]
//     [--material <datei>]… | [--marke <datei>]… --ergebnis <datei>
//     [--baum <Pfad eines gebauten Checkouts>]

import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { cpus, loadavg, tmpdir } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { parseAgordoColor } from "@fundamento/agordilo";
import { oklabOf } from "../src/enportilo/uebernahme/bildformen.js";
import { UEBERNAHME } from "../src/enportilo/uebernahme/datoj.js";
import { stufeOf } from "../src/enportilo/uebernahme/form.js";
import { SCHRITT_IDS } from "../src/enportilo/uebernahme/vorschlag.js";
import { farbAbstand, KREILO } from "../src/kreilo/kreilo.js";
import {
  BAENDER_CSS,
  BAENDER_HTML,
  SABLO_CSS,
  SABLO_HTML,
  TEXT_CSS,
  TEXT_HTML,
} from "../src/test-doubles/uebernahme.js";
import { BILD_ZIELE, STUFEN_CSS, STUFEN_HTML } from "../src/test-doubles/uebernahme-bilder.js";

const repo = resolve(import.meta.dirname, "..", "..", "..");
const args = process.argv.slice(2);
const valuesOf = (name: string) =>
  args.flatMap((arg, index) => (arg === name ? [resolve(args[index + 1] ?? "")] : []));
const argOf = (name: string) => valuesOf(name)[0];
const mitModell = args.includes("--mit-modell");
const materialFiles = valuesOf("--material");
const markeFiles = valuesOf("--marke");
const ergebnisFile = argOf("--ergebnis");
const root = argOf("--baum") ?? repo;
if (markeFiles.length > 0 && ergebnisFile === undefined)
  throw new Error("--marke braucht --ergebnis <datei> außerhalb des Repos.");
// Real paths: /tmp may be a link (macOS), and a link must not lead into the repo either.
const real = (file: string) => join(realpathSync(dirname(file)), basename(file));
for (const file of [...materialFiles, ...markeFiles, ...(ergebnisFile ? [ergebnisFile] : [])])
  if (!relative(realpathSync(repo), real(file)).startsWith(".."))
    throw new Error("Material und Daten echter Marken nur außerhalb des Repos (R-7).");
const privat = materialFiles.length > 0 || markeFiles.length > 0;

const dist = join(root, "packages/metiejo/dist");
const m = (await import(join(dist, "index.js"))) as typeof import("../src/index.js");

const envFile = argOf("--env") ?? join(repo, ".env");
const env = m.parseEnv(existsSync(envFile) ? readFileSync(envFile, "utf8") : "");
const ki = mitModell
  ? m.kiOf({ ...env, FM_KI_ANBIETER: "mistral", FM_KI_MODELL: "ministral-14b-2512" })
  : {};
if (mitModell && ki.provider === undefined) throw new Error("MISTRAL_API_KEY fehlt in der .env.");
const secrets = [env.MISTRAL_API_KEY, env.OPENROUTER_API_KEY, env.OPENAI_API_KEY].filter(
  (value): value is string => typeof value === "string" && value.length > 8,
);

type SchrittId = (typeof SCHRITT_IDS)[number];
interface Herkunft {
  quelle?: string;
  datei?: string;
  adresse?: string;
  merkmal: string;
  anteil?: number;
}
interface Vorschlag {
  schritt: SchrittId;
  wert?: unknown;
  offen?: true;
  satz: string;
  herkunft?: Herkunft;
  sicherheit?: string;
}
/** A target per step: a value to match (partly), „offen“, or a colour family for the lead colour. */
type Ziel = { wert: Record<string, unknown> | string } | "offen";
interface Material {
  titel: string;
  eingabe: { filename: string; bytes: Buffer } | { url: string };
  ziele: Partial<Record<SchrittId, Ziel>>;
  /** The brand a chat turn asks about with --mit-modell. */
  chat?: boolean;
}

// The pages of Sablo for a link, on this machine.
const site = createServer((request, response) => {
  const pages: Record<string, [string, string]> = {
    "/stilo.css": ["text/css", SABLO_CSS],
    "/stufen.css": ["text/css", STUFEN_CSS],
    "/stufen": ["text/html", STUFEN_HTML],
    "/text.css": ["text/css", TEXT_CSS],
    "/text": ["text/html", TEXT_HTML],
    "/baender.css": ["text/css", BAENDER_CSS],
    "/baender": ["text/html", BAENDER_HTML],
  };
  const [type, body] = pages[request.url ?? ""] ?? ["text/html", SABLO_HTML];
  response.writeHead(200, { "content-type": type }).end(body);
});
await new Promise<void>((done) => site.listen(0, "127.0.0.1", done));
const seite = `http://127.0.0.1:${(site.address() as AddressInfo).port}/`;

const fixture = (name: string) =>
  readFileSync(join(repo, "packages/metiejo/src/test-doubles/uebernahme", name));
const LEIT = "#b45309";

/** The synthetic set: every committed picture and the PDF, two pages, each with its targets. */
function synthetisch(): Material[] {
  const offen = { form: "offen", elevation: "offen", dichte: "offen" } as const;
  const bilder: Material[] = Object.entries(BILD_ZIELE).map(([name, entry]) => ({
    titel: name,
    eingabe: { filename: name, bytes: fixture(name) },
    ziele: {
      [entry.schritt]: entry.ziel === "offen" ? "offen" : { wert: { ...entry.ziel } },
    } as Material["ziele"],
    ...(name === "form-knopf.png" ? { chat: true } : {}),
  }));
  return [
    {
      titel: "grund-hell.png",
      eingabe: { filename: "grund-hell.png", bytes: fixture("grund-hell.png") },
      ziele: { leitfarbe: { wert: LEIT }, neutraltoene: { wert: { grund: "hell" } }, ...offen },
    },
    {
      titel: "grund-dunkel.png",
      eingabe: { filename: "grund-dunkel.png", bytes: fixture("grund-dunkel.png") },
      ziele: { leitfarbe: { wert: "#3b82f6" }, neutraltoene: { wert: { grund: "dunkel" } } },
    },
    {
      titel: "sablo.pdf",
      eingabe: { filename: "sablo.pdf", bytes: fixture("sablo.pdf") },
      ziele: {
        schrift: { wert: { familie: "Inter" } },
        neutraltoene: { wert: { grund: "hell" } },
        ...offen,
      },
    },
    ...bilder,
    {
      titel: "Link Sablo (Seite)",
      eingabe: { url: seite },
      ziele: {
        leitfarbe: { wert: LEIT },
        neutraltoene: { wert: { grund: "hell" } },
        schrift: { wert: { familie: "Inter" } },
        elevation: "offen",
      },
    },
    {
      titel: "Link Sablo (viel Text)",
      eingabe: { url: `${seite}text` },
      ziele: { neutraltoene: { wert: { grund: "hell" } } },
    },
    {
      titel: "Link Sablo (dunkle Bänder)",
      eingabe: { url: `${seite}baender` },
      ziele: { neutraltoene: { wert: { grund: "hell" } } },
    },
    {
      titel: "Link Sablo (Stufen)",
      eingabe: { url: `${seite}stufen` },
      ziele: {
        form: { wert: { pille: false } },
        elevation: { wert: { schatten: true } },
        dichte: { wert: { dichte: "luftig" } },
      },
    },
  ];
}

/** Files outside the repo: a JSON with an address is a link, anything else an upload. */
function ausDateien(): Material[] {
  return materialFiles.map((file, index) => ({
    titel: `Material ${index + 1}`,
    eingabe:
      extname(file).toLowerCase() === ".json"
        ? { url: (JSON.parse(readFileSync(file, "utf8")) as { url: string }).url }
        : { filename: `material-${index + 1}${extname(file)}`, bytes: readFileSync(file) },
    ziele: {},
    ...(index === 0 ? { chat: true } : {}),
  }));
}

interface Knopf {
  h: number;
  w: number;
  radius: number;
}
/** The targets in the rendered page: in its first screen (for the picture) and on the whole page. */
interface Soll {
  knoepfe: Knopf[];
  knoepfeSeite: Knopf[];
  schatten: number;
  schattenSeite: number;
  grund: string;
  schrift: string;
}

/** The targets in the rendered page. A string: the compiler of this script adds helpers to a
 * function that the page does not know. */
const SOLL_IM_BROWSER = String.raw`(() => {
  const transparent = (colour) => /rgba\(0, 0, 0, 0\)|transparent/.test(colour);
  const rendered = (element) => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return box.width > 0 && box.height > 0 && style.visibility !== "hidden" &&
      style.display !== "none" && Number(style.opacity) > 0;
  };
  const onScreen = (element) => {
    const box = element.getBoundingClientRect();
    return box.top < innerHeight && box.bottom > 0;
  };
  const buttons = [...document.querySelectorAll(
    'button, [role=button], input[type=submit], input[type=button], a[class*="btn" i], a[class*="button" i]',
  )].filter(rendered).map((element) => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return { element, h: box.height, w: box.width,
      radius: Number.parseFloat(style.borderTopLeftRadius) || 0, bg: style.backgroundColor };
  }).filter((knopf) => knopf.h >= 20 && knopf.h <= 80 && knopf.w >= 1.2 * knopf.h && !transparent(knopf.bg));
  const plain = (list) => list.map(({ h, w, radius }) => ({ h, w, radius }));
  const shadows = [...document.querySelectorAll("body *")].filter((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return style.boxShadow !== "none" && !/inset/.test(style.boxShadow) &&
      box.width * box.height >= 2000 && rendered(element);
  });
  const grund = [document.body, document.documentElement]
    .map((element) => getComputedStyle(element).backgroundColor)
    .find((colour) => !transparent(colour)) ?? "rgb(255, 255, 255)";
  const schrift = (getComputedStyle(document.body).fontFamily.split(",")[0] ?? "")
    .trim().replace(/^["']|["']$/g, "");
  return {
    knoepfe: plain(buttons.filter((knopf) => onScreen(knopf.element))),
    knoepfeSeite: plain(buttons),
    schatten: shadows.filter(onScreen).length,
    schattenSeite: shadows.length,
    grund,
    schrift,
  };
})()`;

/** The first screen of a real brand's page and its targets, rendered once and kept (mode 600). */
async function marke(file: string, index: number): Promise<Material[]> {
  const input = JSON.parse(readFileSync(file, "utf8")) as { url: string; praegend?: string };
  const stem = join(dirname(ergebnisFile ?? ""), basename(file, ".json"));
  const png = `${stem}-bildschirm.png`;
  const sollFile = `${stem}-soll.json`;
  if (!existsSync(png) || !existsSync(sollFile)) {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.goto(input.url, { waitUntil: "load", timeout: 30_000 });
      await page.waitForTimeout(1500);
      writeFileSync(png, await page.screenshot({ type: "png" }), { mode: 0o600 });
      const soll = (await page.evaluate(SOLL_IM_BROWSER)) as Soll;
      writeFileSync(sollFile, `${JSON.stringify(soll)}\n`, { mode: 0o600 });
    } finally {
      await browser.close();
    }
    chmodSync(png, 0o600);
    chmodSync(sollFile, 0o600);
  }
  const soll = JSON.parse(readFileSync(sollFile, "utf8")) as Soll;
  const rgb = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(soll.grund);
  const hell = oklabOf(
    Number(rgb?.[1] ?? 255),
    Number(rgb?.[2] ?? 255),
    Number(rgb?.[3] ?? 255),
  )[0];
  /** The stage most buttons show, „offen“ without a button. */
  const formZiel = (knoepfe: readonly Knopf[]): Ziel => {
    const counts = new Map<number | "pille", number>();
    for (const knopf of knoepfe) {
      const stufe = stufeOf({ radius: Math.min(knopf.radius, knopf.h / 2), height: knopf.h });
      counts.set(stufe, (counts.get(stufe) ?? 0) + 1);
    }
    const stufe = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (stufe === undefined) return "offen";
    return {
      wert: stufe === "pille" ? { radius: 2, pille: true } : { radius: stufe, pille: false },
    };
  };
  const generic = /^(sans-serif|serif|monospace|system-ui|-apple-system|cursive|fantasy)$/i;
  const gemeinsam: Material["ziele"] = {
    ...(input.praegend === undefined ? {} : { leitfarbe: { wert: input.praegend } }),
    neutraltoene: { wert: { grund: hell >= 0.6 ? "hell" : "dunkel" } },
  };
  // A stylesheet speaks for the whole site: its targets are those of the whole page; a picture
  // shows its first screen and never a font.
  const link: Material["ziele"] = {
    ...gemeinsam,
    ...(soll.schrift === "" || generic.test(soll.schrift)
      ? {}
      : { schrift: { wert: { familie: soll.schrift } } }),
    ...(soll.knoepfeSeite.length === 0 ? {} : { form: formZiel(soll.knoepfeSeite) }),
    elevation: { wert: { schatten: soll.schattenSeite > 0 } },
  };
  const bild: Material["ziele"] = {
    ...gemeinsam,
    schrift: "offen",
    form: formZiel(soll.knoepfe),
    elevation: { wert: { schatten: soll.schatten > 0 } },
  };
  return [
    { titel: `Marke ${index + 1}, Link`, eingabe: { url: input.url }, ziele: link },
    {
      titel: `Marke ${index + 1}, erster Bildschirm`,
      eingabe: { filename: "bildschirm.png", bytes: readFileSync(png) },
      ziele: bild,
      chat: true,
    },
  ];
}

const materials: Material[] =
  markeFiles.length > 0
    ? (await Promise.all(markeFiles.map((file, index) => marke(file, index)))).flat()
    : materialFiles.length > 0
      ? ausDateien()
      : synthetisch();

const start = Date.now();
const scratch = mkdtempSync(join(tmpdir(), "fm-abnahme-weg-b-"));
const workdir = join(scratch, "marken");
const log: string[] = [];
const servilo = await m.startServilo(
  {
    port: 0,
    workdir,
    root: scratch,
    settings: m.settingsOf({}),
    ki: ki.provider === undefined ? {} : { ...ki, limo: 30_000, limoj: m.LIMOJ[ki.provider.name] },
  },
  { stderr: (text) => log.push(text) },
);
const post = (path: string, body: unknown) =>
  fetch(`${servilo.url}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

interface ProponoBasis {
  faceto: string;
  agordo: Record<string, unknown>;
  herkunft?: { dosiero: string; loko?: string }[];
}

/** A checkout without the steps (BASIS): what its reading proposed per Faceto, as steps. */
function ausProponoj(proponoj: readonly ProponoBasis[]): Vorschlag[] {
  const of = (faceto: string) => proponoj.find((propono) => propono.faceto === faceto);
  const herkunftOf = (propono: ProponoBasis): Herkunft => {
    const first = propono.herkunft?.[0];
    return { datei: first?.dosiero ?? "", merkmal: first?.loko ?? "" };
  };
  const step = (
    schritt: SchrittId,
    faceto: string,
    wertOf: (agordo: Record<string, unknown>) => unknown,
  ): Vorschlag => {
    const propono = of(faceto);
    const wert = propono === undefined ? undefined : wertOf(propono.agordo);
    return propono === undefined || wert === undefined
      ? { schritt, offen: true, satz: "" }
      : { schritt, wert, herkunft: herkunftOf(propono), satz: "" };
  };
  const group = (agordo: Record<string, unknown>, key: string) =>
    (agordo[key] ?? {}) as Record<string, unknown>;
  return SCHRITT_IDS.map((schritt) => {
    switch (schritt) {
      case "leitfarbe":
        return step(schritt, "gvidkoloro", (agordo) => agordo.leitfarbe);
      case "neutraltoene":
        return step(schritt, "neutralaj", (agordo) => ({ ...group(agordo, "neutral") }));
      case "schrift":
        return step(schritt, "tiparo", (agordo) =>
          Object.fromEntries(
            Object.entries(group(agordo, "schriften")).map(([rolo, fonto]) => [
              rolo,
              { familie: (fonto as { family?: string }).family },
            ]),
          ),
        );
      case "form":
        return step(schritt, "formo", (agordo) => {
          const radius = group(agordo, "form").radius;
          return radius === undefined ? undefined : { radius, pille: false };
        });
      case "dichte":
        return step(schritt, "spaco", (agordo) => {
          const abstand = group(agordo, "raum").abstand;
          return typeof abstand !== "number"
            ? undefined
            : {
                abstand,
                dichte:
                  abstand <= UEBERNAHME.dichte.link_kompakt_bis
                    ? "kompakt"
                    : abstand >= UEBERNAHME.dichte.link_luftig_ab
                      ? "luftig"
                      : "ausgewogen",
              };
        });
      default:
        return { schritt, offen: true, satz: "" };
    }
  });
}

const familyNear = (colour: string, target: string) => {
  const a = parseAgordoColor(colour);
  const b = parseAgordoColor(target);
  return a !== undefined && b !== undefined && farbAbstand(a, b) <= KREILO.akzent.gleich_bis;
};

/** Whether a proposal hits its target: open where open is right, the value's named keys equal. */
function getroffen(vorschlag: Vorschlag | undefined, ziel: Ziel): boolean {
  // Open is right only when it is named: a step without a sentence is missing, not open (4.2).
  if (ziel === "offen") return vorschlag?.offen === true && vorschlag.satz.trim() !== "";
  if (vorschlag === undefined || vorschlag.offen === true) return false;
  if (typeof ziel.wert === "string") return familyNear(String(vorschlag.wert), ziel.wert);
  if (vorschlag.schritt === "schrift") {
    const familien = Object.values((vorschlag.wert ?? {}) as Record<string, { familie?: string }>);
    return familien.some(
      (entry) =>
        entry.familie?.toLowerCase() ===
        String((ziel.wert as { familie: string }).familie).toLowerCase(),
    );
  }
  const wert = (vorschlag.wert ?? {}) as Record<string, unknown>;
  return Object.entries(ziel.wert).every(([key, value]) => wert[key] === value);
}

interface Lauf {
  titel: string;
  status: number;
  quelle: "Schritte" | "Facetoj";
  vorschlagoj: Vorschlag[];
  treffer: Partial<Record<SchrittId, boolean>>;
  ziele: Material["ziele"];
}
const laeufe: Lauf[] = [];
const kosto = { enigo: 0, eligo: 0, ms: 0, requests: 0 };
let index = 0;
for (const material of materials) {
  index += 1;
  const name = `material-${index}`;
  await fetch(`${servilo.url}/marko`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `name=${name}&basis=komuna`,
    redirect: "manual",
  });
  const read = await post(
    `/api/marko/${name}/materialo`,
    "url" in material.eingabe
      ? { url: material.eingabe.url, rajtoj: true }
      : {
          filename: material.eingabe.filename,
          base64: material.eingabe.bytes.toString("base64"),
          rajtoj: true,
        },
  );
  const answer = (await read.json()) as { proponoj?: ProponoBasis[] };
  const route = await fetch(`${servilo.url}/api/marko/${name}/uebernahme`);
  const schritte = route.status === 200;
  const vorschlagoj = schritte
    ? ((await route.json()) as { vorschlagoj: Vorschlag[] }).vorschlagoj
    : ausProponoj(answer.proponoj ?? []);
  if (vorschlagoj.length === 0 && read.ok) vorschlagoj.push(...ausProponoj(answer.proponoj ?? []));
  const treffer: Lauf["treffer"] = {};
  for (const [schritt, ziel] of Object.entries(material.ziele) as [SchrittId, Ziel][])
    treffer[schritt] = getroffen(
      vorschlagoj.find((vorschlag) => vorschlag.schritt === schritt),
      ziel,
    );
  laeufe.push({
    titel: material.titel,
    status: read.status,
    quelle: schritte ? "Schritte" : "Facetoj",
    vorschlagoj,
    treffer,
    ziele: material.ziele,
  });
  if (mitModell && material.chat === true && read.ok) {
    const turn = await post(`/api/marko/${name}/asistanto`, {
      teksto: "Was übernimmst du aus meinem Material für die Form, und was bleibt offen?",
      faceto: "formo",
    });
    const body = (await turn.json()) as { kosto?: typeof kosto; satz?: string };
    if (!turn.ok) log.push(`Chat ${turn.status}: ${body.satz ?? ""}\n`);
    for (const key of ["enigo", "eligo", "ms", "requests"] as const)
      kosto[key] += body.kosto?.[key] ?? 0;
  }
}
const dauer = Date.now() - start;
const raw =
  readdirSync(workdir)
    .map((brand) => join(workdir, brand, "kroniko.jsonl"))
    .filter((file) => existsSync(file))
    .map((file) => readFileSync(file, "utf8"))
    .join("") + log.join("");
await servilo.close();
site.close();
rmSync(scratch, { recursive: true, force: true });

const modelo = ki.provider?.toString();
const usd = modelo === undefined ? 0 : m.kostoOf(modelo, kosto);
const ort = (herkunft: Herkunft | undefined) =>
  herkunft === undefined
    ? ""
    : `${herkunft.quelle ?? ""} ${herkunft.datei ?? herkunft.adresse ?? ""}: ${herkunft.merkmal}${herkunft.anteil === undefined ? "" : `, ${herkunft.anteil} %`}`;
const jaNein = (value: boolean | undefined) => (value === undefined ? "–" : value ? "ja" : "nein");

console.log(`\nWeg B (Material) ${modelo === undefined ? "ohne Sprachmodell" : `mit ${modelo}`}`);
console.log(`  Last (Mittel 1 min): ${loadavg()[0]?.toFixed(1)} bei ${cpus().length} Kernen`);
console.log(`  Messung: ${root === repo ? "dieser Checkout" : `Checkout ${root}`}`);
for (const lauf of laeufe) {
  console.log(
    `\n  ${lauf.titel}${lauf.status === 200 ? "" : ` – Antwort des Servers ${lauf.status}`} (${lauf.quelle === "Schritte" ? "Vorschläge je Schritt" : "aus den Vorschlägen je Faceto, Stand ohne Schritte"})`,
  );
  for (const vorschlag of lauf.vorschlagoj) {
    const ziel = lauf.treffer[vorschlag.schritt];
    const tail = ziel === undefined ? "" : ` – Ziel getroffen: ${jaNein(ziel)}`;
    if (privat) {
      console.log(
        `    ${vorschlag.schritt.padEnd(12)} ${vorschlag.offen === true ? "offen" : `vorgeschlagen (Wert, Sicherheit ${vorschlag.sicherheit ?? "–"})`}${tail}`,
      );
    } else if (vorschlag.offen === true) {
      console.log(
        `    ${vorschlag.schritt.padEnd(12)} ${vorschlag.satz === "" ? "kein Vorschlag, kein Satz" : `offen: ${vorschlag.satz}`}${tail}`,
      );
    } else {
      console.log(
        `    ${vorschlag.schritt.padEnd(12)} vorgeschlagen ${JSON.stringify(vorschlag.wert)} · ${ort(vorschlag.herkunft)}${vorschlag.sicherheit === undefined ? "" : ` · ${vorschlag.sicherheit}`}${tail}`,
      );
    }
  }
}
console.log("\n  Je Schritt (Ziele):");
for (const schritt of SCHRITT_IDS) {
  const mit = laeufe.filter((lauf) => lauf.treffer[schritt] !== undefined);
  if (schritt === "zweitfarbe") {
    console.log("    zweitfarbe   Ziel: siehe Teil 2b (D-03)");
    continue;
  }
  const hits = mit.filter((lauf) => lauf.treffer[schritt] === true).length;
  console.log(
    `    ${schritt.padEnd(12)} ${mit.length === 0 ? "kein Ziel" : `${hits}/${mit.length} getroffen`}`,
  );
}
if (ergebnisFile !== undefined) {
  writeFileSync(
    ergebnisFile,
    `${JSON.stringify({ zeit: new Date().toISOString(), baum: root, modelo: modelo ?? null, kosto, laeufe }, null, 1)}\n`,
    { mode: 0o600 },
  );
  chmodSync(ergebnisFile, 0o600);
  console.log(`\n  Ergebnis mit allen Werten: ${privat ? "lokal (Rechte 600)" : ergebnisFile}`);
}
console.log(
  `\n  Tokens ein ${kosto.enigo}, aus ${kosto.eligo}, Anfragen ${kosto.requests}, Kosten ${usd === undefined ? "ohne Preis" : `${usd.toFixed(5)} $`}, Dauer ${(dauer / 1000).toFixed(1)} s`,
);
console.log(
  `  Schlüssel in Kroniko oder Log: ${secrets.some((secret) => raw.includes(secret)) ? "JA – FEHLER" : "nein"}`,
);
