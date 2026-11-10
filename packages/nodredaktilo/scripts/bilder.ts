// Spec 047 (NE-1, T5, P-3): images and measurements of the graph canvas, written outside the repo.
//
//   pnpm --filter @fundamento/nodredaktilo bilder --ziel <dir> [--luecken <file>]
//
// Starts the built CLI (`fm metiejo`) as a child process on a free port with a temporary workdir
// that holds the provo fixture as a brand. It never imports the Metiejo: nodredaktilo does not
// depend on it (D-2). Chromium via Playwright, fixed viewport, Playwright defaults untouched: a
// step that runs into one is written to messung.json as NICHT_GEMESSEN, never retried longer.
// These images are measurements, not baselines; nothing compares them.

import { type ChildProcess, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { setTimeout as warten } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import type { Grafeo, Grupo } from "@fundamento/metiejo/grafeo";
import { type Browser, chromium, errors, type Page } from "playwright";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const CLI = join(REPO, "packages/cli/dist/index.js");
const LEINWAND = join(REPO, "packages/nodredaktilo/dist/leinwand.js");
const PROVO_AGORDO = join(REPO, "packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json");
const BAU_BEFEHL = "pnpm build";

const VIEWPORT = { width: 1600, height: 1000 } as const;
/** Fresh page loads per brand, and expand cycles of the largest group (spec NE1-T5). */
const LAEUFE = 5;
/** Poll interval while the Metiejo starts. */
const START_TAKT_MS = 250;

const NICHT_GEMESSEN = "nicht gemessen: Playwright-Standardgrenze";

interface Marke {
  marke: "komuna" | "ekzemplo" | "provo";
  seite: string;
  api: string;
}

const MARKEN: readonly Marke[] = [
  { marke: "komuna", seite: "/aspekto/komuna/grafeo", api: "/api/grafeo?aspekto=komuna" },
  { marke: "ekzemplo", seite: "/aspekto/ekzemplo/grafeo", api: "/api/grafeo?aspekto=ekzemplo" },
  { marke: "provo", seite: "/marko/provo/grafeo", api: "/api/grafeo?marko=provo" },
];

const SKEMOJ = [
  { skemo: "light", datei: "hell" },
  { skemo: "dark", datei: "dunkel" },
] as const;

type Wert<T> = T | typeof NICHT_GEMESSEN;

interface Zeiten {
  median: number;
  max: number;
  laeufe: number[];
}

interface MarkenMessung {
  nodoj: number;
  ligoj: number;
  groessteGruppe: { id: string; patro: string; nodoj: number };
  zugeklappt: Wert<number>;
  bisSichtbarMs: Wert<Zeiten>;
  aufklappenMs: Wert<Zeiten>;
  offenBild: Wert<string>;
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

/** Every derived node without `kialo`, by group, ids sorted. */
function luecken(grafeo: Grafeo): Record<string, string[]> {
  const proGruppe = new Map<string, string[]>();
  for (const nodo of grafeo.nodoj) {
    if (nodo.speco !== "derivajxo" || nodo.kialo !== undefined) continue;
    proGruppe.set(nodo.grupo, [...(proGruppe.get(nodo.grupo) ?? []), nodo.id]);
  }
  return Object.fromEntries([...proGruppe].map(([grupo, ids]) => [grupo, ids.sort()]));
}

/** The level-2 group with the most direct nodes; ties go to the smaller id. */
function groessteGruppe(grafeo: Grafeo): Grupo & { patro: string } {
  let beste: (Grupo & { patro: string }) | undefined;
  for (const grupo of grafeo.grupoj) {
    const { patro } = grupo;
    if (patro === undefined) continue;
    if (
      beste === undefined ||
      grupo.nodoj.length > beste.nodoj.length ||
      (grupo.nodoj.length === beste.nodoj.length && grupo.id < beste.id)
    ) {
      beste = { ...grupo, patro };
    }
  }
  if (beste === undefined) throw new Error("Der Graph hat keine Gruppe der Ebene 2.");
  return beste;
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
 * Clicks a group's toggle and returns `data-nr-dauro` once `data-nr-rev` has moved on. `zeiger`:
 * a pointer click. Without it the click event goes to the toggle directly – needed to close the
 * largest group, whose toggle is a few pixels and covered by its members at the fitted zoom. The
 * canvas starts its clock in the click handler either way, so `dauro` means the same.
 */
async function faldi(seite: Page, grupo: string, zeiger = true): Promise<number> {
  const rev = await leinwandAttribut(seite, "data-nr-rev");
  const knopf = seite.locator(`[data-nr-grupo="${grupo}"] [data-nr-faldi]`);
  if (zeiger) await knopf.click();
  else await knopf.dispatchEvent("click");
  await seite.waitForFunction(
    (vorher) =>
      Number(document.querySelector("#nr-leinwand")?.getAttribute("data-nr-rev")) > vorher,
    rev,
  );
  return leinwandAttribut(seite, "data-nr-dauro");
}

async function misseMarke(
  browser: Browser,
  basis: string,
  marke: Marke,
  grafeo: Grafeo,
  bilder: string,
): Promise<MarkenMessung> {
  const gruppe = groessteGruppe(grafeo);
  const url = (skemo: string) => `${basis}${marke.seite}?scheme=${skemo}`;

  // Collapsed images, light and dark, fitted.
  for (const { skemo, datei } of SKEMOJ) {
    await gemessen(`${marke.marke}-${datei}.png`, async () => {
      const geladen = await laden(browser, url(skemo));
      try {
        await einpassen(geladen.seite);
        await geladen.seite.screenshot({ path: join(bilder, `${marke.marke}-${datei}.png`) });
      } finally {
        await geladen.schliessen();
      }
    });
  }

  // Time to visible and collapsed count: fresh loads in light.
  const preta: number[] = [];
  let zugeklappt: Wert<number> = NICHT_GEMESSEN;
  for (let lauf = 0; lauf < LAEUFE; lauf++) {
    const geladen = await gemessen(`${marke.marke} bisSichtbarMs`, () =>
      laden(browser, url("light")),
    );
    if (geladen === NICHT_GEMESSEN) break;
    preta.push(geladen.preta);
    if (lauf === 0) zugeklappt = geladen.zugeklappt;
    await geladen.schliessen();
  }
  const bisSichtbarMs: Wert<Zeiten> = preta.length === LAEUFE ? zeitenAus(preta) : NICHT_GEMESSEN;

  // Expand cycles of the largest group (its axis open), then the open image with a node selected.
  let aufklappenMs: Wert<Zeiten> = NICHT_GEMESSEN;
  let offenBild: Wert<string> = NICHT_GEMESSEN;
  const geladen = await gemessen(`${marke.marke} laden`, () => laden(browser, url("light")));
  if (geladen !== NICHT_GEMESSEN) {
    const { seite } = geladen;
    try {
      aufklappenMs = await gemessen(`${marke.marke} aufklappenMs`, async () => {
        await faldi(seite, gruppe.patro);
        const dauroj: number[] = [];
        for (let lauf = 0; lauf < LAEUFE; lauf++) {
          dauroj.push(await faldi(seite, gruppe.id));
          if (lauf < LAEUFE - 1) await faldi(seite, gruppe.id, false);
        }
        return zeitenAus(dauroj);
      });
      offenBild = await gemessen(`${marke.marke}-offen.png`, async () => {
        const erster = gruppe.nodoj[0];
        if (erster === undefined) throw new Error(`Gruppe ${gruppe.id} ist leer.`);
        // At the fitted zoom a node of a group this size is a few pixels tall and covered by its
        // neighbours, so a pointer click cannot hit it: the click event goes to the node directly.
        await seite.locator(`[data-nr-nodo="${erster}"]`).dispatchEvent("click");
        await seite.locator(`#nr-flanko[data-nr-elektita="${erster}"]`).waitFor();
        await einpassen(seite);
        const datei = `${marke.marke}-offen.png`;
        await seite.screenshot({ path: join(bilder, datei) });
        return erster;
      });
    } finally {
      await geladen.schliessen();
    }
  }

  return {
    nodoj: grafeo.nodoj.length,
    ligoj: grafeo.ligoj.length,
    groessteGruppe: { id: gruppe.id, patro: gruppe.patro, nodoj: gruppe.nodoj.length },
    zugeklappt,
    bisSichtbarMs,
    aufklappenMs,
    offenBild,
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
      messung[marke.marke] = await misseMarke(browser, basis, marke, grafeo, bilder);
      lueckenListe[marke.marke] = luecken(grafeo);
      console.log(`${marke.marke}: ${JSON.stringify(messung[marke.marke])}`);
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
