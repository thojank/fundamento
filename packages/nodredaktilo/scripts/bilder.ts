// Spec 047 (NE-1, T5, P-3), extended by Spec 048 (NE-1b, T4): images and measurements of the graph
// canvas, written outside the repo.
//
//   pnpm --filter @fundamento/nodredaktilo bilder --ziel <dir> [--luecken <file>]
//
// Starts the built CLI (`fm metiejo`) as a child process on a free port with a temporary workdir
// that holds the provo fixture as a brand. It never imports the Metiejo: nodredaktilo does not
// depend on it (D-2); the pure view logic comes through the same alias the bundle uses
// (`@fundamento/metiejo/grafeo` → `grafeo-sicht.ts`, no import of its own). Chromium via
// Playwright, fixed viewport, Playwright defaults untouched: a step that runs into one is written
// to messung.json as NICHT_GEMESSEN, never retried longer. These images are measurements, not
// baselines; nothing compares them.

import { type ChildProcess, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { setTimeout as warten } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  begruendungDe,
  type Grafeo,
  type Grupo,
  grupojDe,
  type Knotenart,
  knotenartDe,
  sichtbaro,
} from "@fundamento/metiejo/grafeo";
import { type Browser, chromium, errors, type Locator, type Page } from "playwright";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const CLI = join(REPO, "packages/cli/dist/index.js");
const LEINWAND = join(REPO, "packages/nodredaktilo/dist/leinwand.js");
const PROVO_AGORDO = join(REPO, "packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json");
const BAU_BEFEHL = "pnpm build";

const VIEWPORT = { width: 1600, height: 1000 } as const;
/** Fresh page loads per brand, and expand cycles per level (spec NE1-T5, Spec 048 C). */
const LAEUFE = 5;
/** Poll interval while the Metiejo starts. */
const START_TAKT_MS = 250;
/** The levels of the group tree that are measured (Spec 048 C: 1 to 4). */
const EBENOJ = [1, 2, 3, 4] as const;
/** "fehlt" per brand in Spec 047 (`specs/047-nodredaktilo-lego/luecken.json`, counted). */
const VORHER_047 = { komuna: 920, ekzemplo: 1842, provo: 1852 } as const;
/** The group whose ero sub-groups the second and third image show. */
const FARBE_KOMPONENTEN = "farbe/komponenten";

const NICHT_GEMESSEN = "nicht gemessen: Playwright-Standardgrenze";
/** A level, or an image subject, that the graph of a brand does not have. */
const NICHT_VORHANDEN = "nicht vorhanden";

type MarkenName = keyof typeof VORHER_047;

interface Marke {
  marke: MarkenName;
  seite: string;
  api: string;
}

const MARKEN: readonly Marke[] = [
  { marke: "komuna", seite: "/aspekto/komuna/grafeo", api: "/api/grafeo?aspekto=komuna" },
  { marke: "ekzemplo", seite: "/aspekto/ekzemplo/grafeo", api: "/api/grafeo?aspekto=ekzemplo" },
  { marke: "provo", seite: "/marko/provo/grafeo", api: "/api/grafeo?marko=provo" },
];

type Wert<T> = T | typeof NICHT_GEMESSEN;
type Vorhanden<T> = T | typeof NICHT_VORHANDEN;

interface Zeiten {
  median: number;
  max: number;
  laeufe: number[];
}

/**
 * How a toggle was clicked: `zeiger` a real pointer click (the toggle is the topmost element at its
 * centre), `ereignis` the click event sent to the toggle directly (047 D-T5-1: covered or too
 * small at the fitted zoom), `gemischt` both within one measurement.
 */
type Klick = "zeiger" | "ereignis" | "gemischt";

interface Aufklappen extends Zeiten {
  gruppe: string;
  /** The timed clicks that open the group. */
  klickAuf: Klick;
  /** The untimed clicks that close it again between two runs. */
  klickZu: Klick;
}

interface GroessteGruppe {
  id: string;
  /** What opening it shows: direct nodes + direct sub-groups. */
  kinder: number;
}

interface GeerbtBild {
  id: string;
  gruppe: string;
  de: string;
  klick: Klick;
}

interface MarkenMessung {
  nodoj: number;
  ligoj: number;
  arten: Record<Knotenart, number>;
  ohneGrund: number;
  geerbt: number;
  keinGrundInKette: number;
  vorher047: number;
  groessteGruppeJeEbene: Record<string, Vorhanden<GroessteGruppe>>;
  aufklappenMsJeEbene: Record<string, Vorhanden<Wert<Aufklappen>>>;
  zugeklappt: Wert<number>;
  bisSichtbarMs: Wert<Zeiten>;
  geerbtBild: Vorhanden<Wert<GeerbtBild>>;
}

/** Runs a step; a Playwright default that runs out becomes NICHT_GEMESSEN, anything else throws. */
async function gemessen<T>(name: string, schritt: () => Promise<T>): Promise<Wert<T>> {
  try {
    return await schritt();
  } catch (fehler) {
    if (fehler instanceof errors.TimeoutError) {
      console.error(`${name}: ${NICHT_GEMESSEN} – ${fehler.message.split("\n")[0]}`);
      return NICHT_GEMESSEN;
    }
    throw fehler;
  }
}

function zeitenAus(laeufe: readonly number[]): Zeiten {
  const sortiert = [...laeufe].sort((a, b) => a - b);
  const mitte = Math.floor(sortiert.length / 2);
  const median =
    sortiert.length % 2 === 1
      ? (sortiert[mitte] ?? 0)
      : ((sortiert[mitte - 1] ?? 0) + (sortiert[mitte] ?? 0)) / 2;
  return { median, max: sortiert.at(-1) ?? 0, laeufe: [...laeufe] };
}

const klickAus = (klicks: readonly Exclude<Klick, "gemischt">[]): Klick =>
  klicks.every((k) => k === "zeiger")
    ? "zeiger"
    : klicks.every((k) => k === "ereignis")
      ? "ereignis"
      : "gemischt";

function sortiereSchluessel(wert: unknown): unknown {
  if (Array.isArray(wert)) return wert.map(sortiereSchluessel);
  if (wert !== null && typeof wert === "object") {
    return Object.fromEntries(
      Object.entries(wert)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([k, v]) => [k, sortiereSchluessel(v)]),
    );
  }
  return wert;
}

/** Canonical JSON as in the repo: keys sorted deep, two spaces, trailing newline. */
function kanonisch(wert: unknown): string {
  return `${JSON.stringify(sortiereSchluessel(wert), null, 2)}\n`;
}

/**
 * Every Entscheidung without a reason (`begruendungDe` → "fehlt", the one definition of Spec 048
 * 2.2), by group, ids sorted.
 */
function luecken(grafeo: Grafeo): Record<string, string[]> {
  const proGruppe = new Map<string, string[]>();
  for (const nodo of grafeo.nodoj) {
    const begruendung = begruendungDe(grafeo, nodo.id);
    if (begruendung === undefined || !("montro" in begruendung) || begruendung.montro !== "fehlt")
      continue;
    proGruppe.set(nodo.grupo, [...(proGruppe.get(nodo.grupo) ?? []), nodo.id]);
  }
  return Object.fromEntries([...proGruppe].map(([grupo, ids]) => [grupo, ids.sort()]));
}

/** Kinds and reasons per brand, from the graph alone (Spec 048 C). */
function zaehle(grafeo: Grafeo) {
  const arten: Record<Knotenart, number> = { decido: 0, mekaniko: 0, transpreno: 0 };
  let ohneGrund = 0;
  let geerbt = 0;
  let keinGrundInKette = 0;
  for (const nodo of grafeo.nodoj) {
    const art = knotenartDe(grafeo, nodo.id);
    const begruendung = begruendungDe(grafeo, nodo.id);
    if (art === undefined || begruendung === undefined) continue;
    arten[art] += 1;
    if (!("montro" in begruendung)) continue;
    if (begruendung.montro === "fehlt") ohneGrund += 1;
    if (begruendung.montro === "geerbt") geerbt += 1;
    if (begruendung.montro === "neniu") keinGrundInKette += 1;
  }
  return { arten, ohneGrund, geerbt, keinGrundInKette };
}

/** One definition everywhere (2.2): the work list, the count and the axis badges must agree. */
function pruefeEineDefinition(
  marke: string,
  grafeo: Grafeo,
  liste: Record<string, string[]>,
  ohneGrund: number,
): void {
  const inListe = Object.values(liste).reduce((summe, ids) => summe + ids.length, 0);
  const anAchsen = sichtbaro(grafeo, [], { ohneGrund: true })
    .nodoj.filter((nodo) => nodo.speco === "grupo" && nodo.grupo === undefined)
    .reduce((summe, nodo) => summe + (nodo.ohneGrund ?? 0), 0);
  if (inListe !== ohneGrund || anAchsen !== ohneGrund) {
    throw new Error(
      `${marke}: luecken ${inListe}, ohneGrund ${ohneGrund}, Achsen ${anAchsen} – nicht eine Definition.`,
    );
  }
}

const ebeneDe = (grupo: Grupo): number => grupo.id.split("/").length;

/** What opening a group shows: its direct nodes and its direct sub-groups. */
function kinderJeGruppe(grafeo: Grafeo): Map<string, number> {
  const kinder = new Map(grafeo.grupoj.map((grupo) => [grupo.id, grupo.nodoj.length]));
  for (const grupo of grafeo.grupoj) {
    if (grupo.patro !== undefined) kinder.set(grupo.patro, (kinder.get(grupo.patro) ?? 0) + 1);
  }
  return kinder;
}

/** Per level the group with the most children; ties go to the smaller id. */
function groessteGruppeJeEbene(grafeo: Grafeo): Map<number, GroessteGruppe> {
  const kinder = kinderJeGruppe(grafeo);
  const beste = new Map<number, GroessteGruppe>();
  for (const grupo of grafeo.grupoj) {
    const ebene = ebeneDe(grupo);
    const n = kinder.get(grupo.id) ?? 0;
    const bisher = beste.get(ebene);
    if (bisher === undefined || n > bisher.kinder || (n === bisher.kinder && grupo.id < bisher.id))
      beste.set(ebene, { id: grupo.id, kinder: n });
  }
  return beste;
}

/** The Übernahme for the third image: smallest `ero.*` id under `farbe/komponenten` with "geerbt". */
function geerbtWahl(grafeo: Grafeo): { id: string; gruppe: string; de: string } | undefined {
  for (const nodo of grafeo.nodoj) {
    if (!nodo.id.startsWith("ero.") || !nodo.grupo.startsWith(`${FARBE_KOMPONENTEN}/`)) continue;
    const begruendung = begruendungDe(grafeo, nodo.id);
    if (begruendung !== undefined && "montro" in begruendung && begruendung.montro === "geerbt")
      return { id: nodo.id, gruppe: nodo.grupo, de: begruendung.de };
  }
  return undefined;
}

const freierPort = (): Promise<number> =>
  new Promise((fertig, fehler) => {
    const server = createServer();
    server.once("error", fehler);
    server.listen(0, "127.0.0.1", () => {
      const adresse = server.address();
      const port = typeof adresse === "object" && adresse !== null ? adresse.port : 0;
      server.close(() => fertig(port));
    });
  });

/** Waits until `GET /` answers; fails when the child exits first. */
async function warteAufMetiejo(basis: string, kind: ChildProcess): Promise<void> {
  for (;;) {
    if (kind.exitCode !== null || kind.signalCode !== null) {
      throw new Error(`Die Metiejo ist beendet (${kind.exitCode ?? kind.signalCode}).`);
    }
    try {
      const antwort = await fetch(`${basis}/`);
      if (antwort.ok) return;
    } catch {
      // not listening yet
    }
    await warten(START_TAKT_MS);
  }
}

async function beende(kind: ChildProcess): Promise<void> {
  if (kind.exitCode !== null || kind.signalCode !== null) return;
  const ende = new Promise<void>((fertig) => kind.once("exit", () => fertig()));
  kind.kill("SIGTERM");
  await ende;
}

async function holeGrafeo(basis: string, api: string): Promise<Grafeo> {
  const antwort = await fetch(`${basis}${api}`);
  if (!antwort.ok) throw new Error(`${api} antwortet ${antwort.status}.`);
  return (await antwort.json()) as Grafeo;
}

const leinwandAttribut = async (seite: Page, name: string): Promise<number> =>
  Number(await seite.locator("#nr-leinwand").getAttribute(name));

/** Two animation frames: what React and React Flow scheduled is painted. */
const gemalt = (seite: Page): Promise<void> =>
  seite.evaluate(
    () =>
      new Promise<void>((fertig) =>
        requestAnimationFrame(() => requestAnimationFrame(() => fertig())),
      ),
  );

/** "Übersicht einpassen": the fit-view control of React Flow. */
async function einpassen(seite: Page): Promise<void> {
  await seite.locator(".react-flow__controls-fitview").click();
  await gemalt(seite);
}

/** Whether a pointer at the element's centre hits the element (inside the viewport, uncovered). */
const erreichbar = (ziel: Locator): Promise<boolean> =>
  ziel.evaluate((element) => {
    const rahmen = element.getBoundingClientRect();
    const x = rahmen.left + rahmen.width / 2;
    const y = rahmen.top + rahmen.height / 2;
    if (rahmen.width === 0 || x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false;
    const getroffen = document.elementFromPoint(x, y);
    return getroffen !== null && (getroffen === element || element.contains(getroffen));
  });

/** A real pointer click where it reaches the element, else the click event (047 D-T5-1). */
async function klicke(ziel: Locator): Promise<Exclude<Klick, "gemischt">> {
  if (await erreichbar(ziel)) {
    await ziel.click();
    return "zeiger";
  }
  await ziel.dispatchEvent("click");
  return "ereignis";
}

interface Geladen {
  seite: Page;
  preta: number;
  zugeklappt: number;
  schliessen: () => Promise<void>;
}

/** A fresh context and page, loaded until `data-nr-preta`. */
async function laden(browser: Browser, url: string): Promise<Geladen> {
  const kontext = await browser.newContext({ viewport: VIEWPORT });
  const seite = await kontext.newPage();
  seite.on("pageerror", (fehler) => console.error(`Seitenfehler auf ${url}: ${fehler.message}`));
  try {
    await seite.goto(url);
    await seite.locator("#nr-leinwand[data-nr-preta]").waitFor();
    const preta = await leinwandAttribut(seite, "data-nr-preta");
    const zugeklappt = await seite.locator(".react-flow__node").count();
    return { seite, preta, zugeklappt, schliessen: () => kontext.close() };
  } catch (fehler) {
    await kontext.close();
    throw fehler;
  }
}

/**
 * Clicks a group's toggle (`klicke`) and returns `data-nr-dauro` once `data-nr-rev` has moved on,
 * with how it clicked. The canvas starts its clock in the click handler either way, so `dauro`
 * means the same for both kinds of click.
 */
async function faldi(
  seite: Page,
  grupo: string,
): Promise<{ dauro: number; klick: Exclude<Klick, "gemischt"> }> {
  const rev = await leinwandAttribut(seite, "data-nr-rev");
  const klick = await klicke(seite.locator(`[data-nr-grupo="${grupo}"] [data-nr-faldi]`));
  await seite.waitForFunction(
    (vorher) =>
      Number(document.querySelector("#nr-leinwand")?.getAttribute("data-nr-rev")) > vorher,
    rev,
  );
  return { dauro: await leinwandAttribut(seite, "data-nr-dauro"), klick };
}

/** Opens the groups in order (outermost first), untimed. */
async function oeffne(seite: Page, grupoj: readonly string[]): Promise<void> {
  for (const grupo of grupoj) await faldi(seite, grupo);
}

/** The three images of a brand, light and fitted, on one page. */
async function bilderDerMarke(
  geladen: Geladen,
  marke: MarkenName,
  grafeo: Grafeo,
  bilder: string,
): Promise<Vorhanden<Wert<GeerbtBild>>> {
  const { seite } = geladen;
  await gemessen(`${marke}-zu.png`, async () => {
    await einpassen(seite);
    await seite.screenshot({ path: join(bilder, `${marke}-zu.png`) });
  });

  const farbe = await gemessen(`${marke}-farbe-komponenten.png`, async () => {
    await oeffne(seite, grupojDe(grafeo, FARBE_KOMPONENTEN).concat(FARBE_KOMPONENTEN));
    await einpassen(seite);
    await seite.screenshot({ path: join(bilder, `${marke}-farbe-komponenten.png`) });
  });
  if (farbe === NICHT_GEMESSEN) return NICHT_GEMESSEN;

  const wahl = geerbtWahl(grafeo);
  if (wahl === undefined) {
    console.error(
      `${marke}-ero-offen-geerbt.png: ${NICHT_VORHANDEN} (keine Übernahme mit „geerbt“)`,
    );
    return NICHT_VORHANDEN;
  }
  return gemessen(`${marke}-ero-offen-geerbt.png`, async () => {
    const offen = new Set([...grupojDe(grafeo, FARBE_KOMPONENTEN), FARBE_KOMPONENTEN]);
    await oeffne(
      seite,
      grupojDe(grafeo, wahl.id).filter((grupo) => !offen.has(grupo)),
    );
    const klick = await klicke(seite.locator(`[data-nr-nodo="${wahl.id}"]`));
    const flanko = seite.locator(`#nr-flanko[data-nr-elektita="${wahl.id}"]`);
    await flanko.waitFor();
    await flanko.locator(`[data-nr-art="Übernahme"]`).waitFor();
    await flanko.locator(`[data-nr-geerbt="${wahl.de}"]`).waitFor();
    await einpassen(seite);
    await seite.screenshot({ path: join(bilder, `${marke}-ero-offen-geerbt.png`) });
    return { ...wahl, klick };
  });
}

/**
 * Expand time of the largest group of one level: a fresh page, its ancestors opened untimed, then
 * LAEUFE timed openings, each but the last closed again untimed.
 */
async function aufklappen(
  browser: Browser,
  url: string,
  grafeo: Grafeo,
  gruppe: string,
  name: string,
): Promise<Wert<Aufklappen>> {
  const geladen = await gemessen(`${name} laden`, () => laden(browser, url));
  if (geladen === NICHT_GEMESSEN) return NICHT_GEMESSEN;
  const { seite } = geladen;
  try {
    return await gemessen(name, async () => {
      await oeffne(seite, grupojDe(grafeo, gruppe));
      const dauroj: number[] = [];
      const auf: Exclude<Klick, "gemischt">[] = [];
      const zu: Exclude<Klick, "gemischt">[] = [];
      for (let lauf = 0; lauf < LAEUFE; lauf++) {
        const offen = await faldi(seite, gruppe);
        dauroj.push(offen.dauro);
        auf.push(offen.klick);
        if (lauf < LAEUFE - 1) zu.push((await faldi(seite, gruppe)).klick);
      }
      return { gruppe, ...zeitenAus(dauroj), klickAuf: klickAus(auf), klickZu: klickAus(zu) };
    });
  } finally {
    await geladen.schliessen();
  }
}

async function misseMarke(
  browser: Browser,
  basis: string,
  marke: Marke,
  grafeo: Grafeo,
  bilder: string,
): Promise<MarkenMessung> {
  const url = `${basis}${marke.seite}?scheme=light`;

  // The three images on one page: collapsed, farbe/komponenten open, one ero sub-group open.
  let geerbtBild: Vorhanden<Wert<GeerbtBild>> = NICHT_GEMESSEN;
  const bildSeite = await gemessen(`${marke.marke} laden`, () => laden(browser, url));
  if (bildSeite !== NICHT_GEMESSEN) {
    try {
      geerbtBild = await bilderDerMarke(bildSeite, marke.marke, grafeo, bilder);
    } finally {
      await bildSeite.schliessen();
    }
  }

  // Time to visible and collapsed count: fresh loads in light.
  const preta: number[] = [];
  let zugeklappt: Wert<number> = NICHT_GEMESSEN;
  for (let lauf = 0; lauf < LAEUFE; lauf++) {
    const geladen = await gemessen(`${marke.marke} bisSichtbarMs`, () => laden(browser, url));
    if (geladen === NICHT_GEMESSEN) break;
    preta.push(geladen.preta);
    if (lauf === 0) zugeklappt = geladen.zugeklappt;
    await geladen.schliessen();
  }
  const bisSichtbarMs: Wert<Zeiten> = preta.length === LAEUFE ? zeitenAus(preta) : NICHT_GEMESSEN;

  // Largest group and expand time per level.
  const groesste = groessteGruppeJeEbene(grafeo);
  const groessteGruppeJeEbeneWert: Record<string, Vorhanden<GroessteGruppe>> = {};
  const aufklappenMsJeEbene: Record<string, Vorhanden<Wert<Aufklappen>>> = {};
  for (const ebene of EBENOJ) {
    const gruppe = groesste.get(ebene);
    groessteGruppeJeEbeneWert[ebene] = gruppe ?? NICHT_VORHANDEN;
    aufklappenMsJeEbene[ebene] =
      gruppe === undefined
        ? NICHT_VORHANDEN
        : await aufklappen(
            browser,
            url,
            grafeo,
            gruppe.id,
            `${marke.marke} aufklappenMs Ebene ${ebene}`,
          );
  }

  return {
    nodoj: grafeo.nodoj.length,
    ligoj: grafeo.ligoj.length,
    ...zaehle(grafeo),
    vorher047: VORHER_047[marke.marke],
    groessteGruppeJeEbene: groessteGruppeJeEbeneWert,
    aufklappenMsJeEbene,
    zugeklappt,
    bisSichtbarMs,
    geerbtBild,
  };
}

/** Relative paths count from where pnpm was called (INIT_CWD), not from the package. */
const vomAufruf = (pfad: string): string => resolve(process.env.INIT_CWD ?? process.cwd(), pfad);

async function main(): Promise<number> {
  const { values } = parseArgs({
    options: { ziel: { type: "string" }, luecken: { type: "string" } },
    strict: true,
  });
  if (values.ziel === undefined) {
    console.error(
      "Kein --ziel angegeben: das Skript schreibt nichts. Aufruf: pnpm --filter @fundamento/nodredaktilo bilder --ziel <verzeichnis> [--luecken <datei>]",
    );
    return 2;
  }
  const fehlt = [CLI, LEINWAND].filter((datei) => !existsSync(datei));
  if (fehlt.length > 0) {
    console.error(
      `Nicht gebaut: ${fehlt.join(", ")}. Zuerst im Repo-Wurzelverzeichnis: ${BAU_BEFEHL}`,
    );
    return 2;
  }
  const ziel = vomAufruf(values.ziel);
  const bilder = join(ziel, "bilder");
  await mkdir(bilder, { recursive: true });

  const arbeit = await mkdtemp(join(tmpdir(), "nr-bilder-"));
  await mkdir(join(arbeit, "provo"));
  await copyFile(PROVO_AGORDO, join(arbeit, "provo", "agordo.json"));

  const port = await freierPort();
  const basis = `http://127.0.0.1:${port}`;
  const kind = spawn(
    process.execPath,
    [CLI, "metiejo", "--port", String(port), "--workdir", arbeit],
    { cwd: REPO, stdio: ["ignore", "ignore", "inherit"] },
  );
  let browser: Browser | undefined;
  try {
    await warteAufMetiejo(basis, kind);
    browser = await chromium.launch();
    console.log(
      `Metiejo ${basis}, Chromium ${browser.version()}, ${VIEWPORT.width}×${VIEWPORT.height}`,
    );
    const messung: Record<string, MarkenMessung> = {};
    const lueckenListe: Record<string, Record<string, string[]>> = {};
    for (const marke of MARKEN) {
      const grafeo = await holeGrafeo(basis, marke.api);
      const liste = luecken(grafeo);
      const gemessenFuerMarke = await misseMarke(browser, basis, marke, grafeo, bilder);
      pruefeEineDefinition(marke.marke, grafeo, liste, gemessenFuerMarke.ohneGrund);
      messung[marke.marke] = gemessenFuerMarke;
      lueckenListe[marke.marke] = liste;
      console.log(`${marke.marke}: ${JSON.stringify(gemessenFuerMarke)}`);
    }
    await writeFile(join(ziel, "messung.json"), kanonisch(messung));
    console.log(`Geschrieben: ${join(ziel, "messung.json")}, ${bilder}`);
    if (values.luecken !== undefined) {
      const datei = vomAufruf(values.luecken);
      await mkdir(dirname(datei), { recursive: true });
      await writeFile(datei, kanonisch(lueckenListe));
      console.log(`Geschrieben: ${datei}`);
    }
    return 0;
  } finally {
    await browser?.close();
    await beende(kind);
    await rm(arbeit, { recursive: true, force: true });
  }
}

process.exitCode = await main();
