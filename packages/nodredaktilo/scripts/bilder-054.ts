// Spec 054 T8 (MPFG-5.1, AK-7, AK-15, AK-25): the nine images of the view Gestalten and the
// measurement, written outside the repo.
//
//   pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-054.ts --ziel <dir> [--messung <file>]
//
// `--ziel` is the folder of the images (01-… to 09-….png); the measurement goes to `--messung`, by
// default `messung.json` beside that folder. Starts the built CLI (`fm metiejo`) as a child process
// on a free port with a temporary, empty workdir, creates a brand through the start page („Auf der
// Leinwand anlegen“) and works the canvas in Chromium with a fixed viewport, Playwright defaults
// untouched. On the way it does what only a browser shows and stops with an error when any of it
// fails: drag a node and a phase, drag the Tönung slider (the node stays), detach Akzent → Palette
// and „zurücksetzen“, plug Primär into „Warnung“, add a Funktionsfarbe and a preview through
// „+ Knoten“, switch the canvas to light, „Farbe aus dem Knoten“ at the Basis, a step for dark only.
// The measurement: five Primär changes, each from `fill+Enter` until every connected preview shows
// the new rev (median, max, the five values), and the bundle size before and after. No threshold.
// These images are measurements, not baselines; nothing compares them.

import { type ChildProcess, execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { setTimeout as warten } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { ARANGXO_054 } from "@fundamento/metiejo/gestalten";
import { type Browser, chromium, type Locator, type Page } from "playwright";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const CLI = join(REPO, "packages/cli/dist/index.js");
const LEINWAND = join(REPO, "packages/nodredaktilo/dist/leinwand.js");
const BAU_BEFEHL = "pnpm build";

/** Room for the whole canvas at 1:1 (ARANGXO_054 spans about 2014 × 1112 px plus the header). */
const VIEWPORT = { width: 2100, height: 1250 } as const;
const START_TAKT_MS = 250;
/** An invented brand; the start page derives its identifier from it. */
const MARKE = "lumeto";

/** The bundle before this run: built at aa53d3f4 (tasks.md „Ausgangsmaß Bündel“). */
const BUENDEL_VORHER = {
  stand: "aa53d3f41c56ab96bf3eae9b3b90e9a8625bd767",
  roh: 635_947,
  gzip: 170_082,
} as const;

/** The colours of the run (invented, close to the mockup's look). */
const FARBEN = {
  primaer: "#2f5bff",
  akzent: "#c6f135",
  erfolg: "#2e8b57",
  dunkel: "#1d3a99",
} as const;
/** The five Primär values of the measurement. */
const MESSWERTE = ["#f5c400", "#2f5bff", "#7a3e9d", "#d14b2b", "#2f5bff"] as const;

class Abbruch extends Error {}

/** Fails the run with a clear message unless `bedingung` holds. */
function pruefe(bedingung: boolean, schritt: string, was: string): asserts bedingung {
  if (!bedingung) throw new Abbruch(`${schritt}: ${was}`);
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

async function warteAufMetiejo(basis: string, kind: ChildProcess): Promise<void> {
  for (;;) {
    if (kind.exitCode !== null || kind.signalCode !== null)
      throw new Abbruch(`Die Metiejo ist beendet (${kind.exitCode ?? kind.signalCode}).`);
    try {
      if ((await fetch(`${basis}/`)).ok) return;
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

/** Two animation frames: what React and React Flow scheduled is painted. */
const gemalt = (seite: Page): Promise<void> =>
  seite.evaluate(
    () =>
      new Promise<void>((fertig) =>
        requestAnimationFrame(() => requestAnimationFrame(() => fertig())),
      ),
  );

const leinwand = (seite: Page): Locator => seite.locator("#nr-leinwand");
const knoten = (seite: Page, id: string): Locator =>
  seite.locator(`.react-flow__node[data-id="${id}"]`);

/** The rev of the Bildo on screen (`data-nr-rev`). */
async function revDe(seite: Page): Promise<number> {
  return Number(await leinwand(seite).getAttribute("data-nr-rev"));
}

/**
 * Waits until the Bildo of `rev` is painted and every connected preview shows it (`kabloj` the
 * effective view they show; "" = the Agordo's), nothing loading.
 */
async function warteStand(seite: Page, rev: number, kabloj = ""): Promise<void> {
  await seite.waitForFunction(
    ({ rev, kabloj }) => {
      const el = document.getElementById("nr-leinwand");
      return (
        el !== null &&
        el.getAttribute("data-nr-rev") === String(rev) &&
        el.getAttribute("data-nr-vorschau-rev") === String(rev) &&
        (el.getAttribute("data-nr-vorschau-kabloj") ?? "") === kabloj &&
        !el.hasAttribute("data-nr-vorschau-laedt")
      );
    },
    { rev, kabloj },
  );
  await gemalt(seite);
}

/** The node's place on the screen (the zoom stays as fitted, so a move shows 1:1). */
async function platzDe(seite: Page, id: string): Promise<{ x: number; y: number }> {
  const rahmen = await knoten(seite, id).boundingBox();
  pruefe(rahmen !== null, "Platz", `${id} ist nicht sichtbar`);
  return { x: Math.round(rahmen.x), y: Math.round(rahmen.y) };
}

/** Two places agree to the pixel (both are rounded screen positions). */
const nah = (a: { x: number; y: number }, b: { x: number; y: number }): boolean =>
  Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1;

const mitte = async (ziel: Locator): Promise<{ x: number; y: number }> => {
  const rahmen = await ziel.boundingBox();
  if (rahmen === null) throw new Abbruch(`nicht sichtbar: ${ziel.toString()}`);
  return { x: rahmen.x + rahmen.width / 2, y: rahmen.y + rahmen.height / 2 };
};

/** A pointer drag in small steps (React Flow needs moves between down and up). */
async function ziehe(
  seite: Page,
  von: { x: number; y: number },
  nach: { x: number; y: number },
): Promise<void> {
  await seite.mouse.move(von.x, von.y);
  await seite.mouse.down();
  await seite.mouse.move(von.x + 4, von.y + 4, { steps: 2 });
  await seite.mouse.move(nach.x, nach.y, { steps: 16 });
  await seite.mouse.up();
  await gemalt(seite);
}

/** Types a colour into a node's field and saves it with Enter; returns the new rev. */
async function farbeSetzen(seite: Page, rolo: string, wert: string): Promise<number> {
  const vorher = await revDe(seite);
  const feld = seite.locator(`[data-nr-farbo-kampo="${rolo}"] input`);
  await feld.fill(wert);
  await feld.press("Enter");
  await warteStand(seite, vorher + 1, (await leinwand(seite).getAttribute("data-nr-kabloj")) ?? "");
  return vorher + 1;
}

/** A place on the empty stage below the phases: the pointer rests there, hovering nothing. */
const RUHEPLATZ = { x: 1300, y: VIEWPORT.height - 90 } as const;

/**
 * Before an image: the pointer off every control (no hover state), every finite animation and
 * transition finished (the light along the edges of a new rev, the Eroj after a scheme switch),
 * then painted.
 */
async function ruhig(seite: Page, zeigerWeg = true): Promise<void> {
  if (zeigerWeg) await seite.mouse.move(RUHEPLATZ.x, RUHEPLATZ.y);
  await seite.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().endTime !== Number.POSITIVE_INFINITY)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
  await gemalt(seite);
}

const bild = async (
  seite: Page,
  ordner: string,
  datei: string,
  zeigerWeg = true,
): Promise<string> => {
  const pfad = join(ordner, datei);
  await ruhig(seite, zeigerWeg);
  await seite.screenshot({ path: pfad });
  console.log(`Bild: ${pfad}`);
  return pfad;
};

/** An image of a region around some elements of the page (padding in px). */
async function bildVon(
  seite: Page,
  ordner: string,
  datei: string,
  ziele: readonly Locator[],
  rand = 24,
): Promise<string> {
  await ruhig(seite);
  const rahmen = [];
  for (const ziel of ziele) {
    const r = await ziel.boundingBox();
    if (r === null) throw new Abbruch(`${datei}: nicht sichtbar: ${ziel.toString()}`);
    rahmen.push(r);
  }
  const x = Math.max(0, Math.min(...rahmen.map((r) => r.x)) - rand);
  const y = Math.max(0, Math.min(...rahmen.map((r) => r.y)) - rand);
  const x2 = Math.min(VIEWPORT.width, Math.max(...rahmen.map((r) => r.x + r.width)) + rand);
  const y2 = Math.min(VIEWPORT.height, Math.max(...rahmen.map((r) => r.y + r.height)) + rand);
  const pfad = join(ordner, datei);
  await ruhig(seite);
  await seite.screenshot({ path: pfad, clip: { x, y, width: x2 - x, height: y2 - y } });
  console.log(`Bild: ${pfad}`);
  return pfad;
}

interface Zeiten {
  median: number;
  max: number;
  laeufe: number[];
}

function zeitenAus(laeufe: readonly number[]): Zeiten {
  const sortiert = [...laeufe].sort((a, b) => a - b);
  const m = Math.floor(sortiert.length / 2);
  const median =
    sortiert.length % 2 === 1
      ? (sortiert[m] ?? 0)
      : ((sortiert[m - 1] ?? 0) + (sortiert[m] ?? 0)) / 2;
  return { median, max: sortiert.at(-1) ?? 0, laeufe: [...laeufe] };
}

/**
 * One measured Primär change: from `fill+Enter` (clock in the page, started right before Enter)
 * until `data-nr-vorschau-rev` is the new rev, nothing loads, and both fixed previews show a loaded
 * document of that rev.
 */
async function missAenderung(seite: Page, wert: string): Promise<number> {
  const neu = (await revDe(seite)) + 1;
  const feld = seite.locator('[data-nr-farbo-kampo="primaer"] input');
  await feld.fill(wert);
  await seite.evaluate(() => {
    (window as unknown as { nrMessStart: number }).nrMessStart = performance.now();
  });
  await feld.press("Enter");
  const dauer = await seite.waitForFunction(
    (rev) => {
      const el = document.getElementById("nr-leinwand");
      if (el === null) return false;
      if (el.getAttribute("data-nr-vorschau-rev") !== String(rev)) return false;
      if (el.hasAttribute("data-nr-vorschau-laedt")) return false;
      for (const id of ["vorschau-hell", "vorschau-dunkel"]) {
        const rahmen = document.querySelector<HTMLIFrameElement>(
          `[data-nr-vorschau-kadro="${id}"] iframe[data-nr-vorschau-rahmen="gezeigt"]`,
        );
        const dok = rahmen?.contentDocument;
        if (dok === null || dok === undefined || dok.readyState !== "complete") return false;
        if (!dok.URL.includes(`rev=${rev}`)) return false;
      }
      return performance.now() - (window as unknown as { nrMessStart: number }).nrMessStart;
    },
    neu,
    { polling: "raf" },
  );
  const ms = Math.round(((await dauer.jsonValue()) as number) * 10) / 10;
  pruefe((await revDe(seite)) === neu, "Messung", `rev ${neu} erwartet`);
  return ms;
}

/**
 * The bundle now, raw and gzip – with the same tool and level as the baseline (`gzip -6 -c`;
 * zlib in Node writes a few hundred bytes less for the same file, so it would not compare).
 */
function buendel(): { roh: number; gzip: number } {
  const roh = readFileSync(LEINWAND).length;
  const gzip = execFileSync("gzip", ["-6", "-c", LEINWAND], { maxBuffer: 64 * 1024 * 1024 }).length;
  return { roh, gzip };
}

async function lauf(browser: Browser, basis: string, ordner: string): Promise<Zeiten> {
  const kontext = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const seite = await kontext.newPage();
  const seitenfehler: string[] = [];
  seite.on("pageerror", (fehler) => seitenfehler.push(fehler.message));
  const pruefeSeite = (schritt: string) =>
    pruefe(seitenfehler.length === 0, schritt, `Seitenfehler: ${seitenfehler.join(" | ")}`);
  try {
    // ── 1: a new brand straight after creating it on the start page ────────────────────────
    await seite.goto(`${basis}/`);
    await seite.locator('fm-kampo[name="name"] input').fill(MARKE);
    await seite.locator('fm-butono[data-mt-ziel="leinwand"]').click();
    await seite.waitForURL(`${basis}/marko/${MARKE}/grafeo`);
    await leinwand(seite).and(seite.locator("[data-nr-preta]")).waitFor();
    pruefe(
      (await seite.locator("html").getAttribute("data-fm-color-scheme")) === "dark",
      "Anlegen",
      "die Leinwand öffnet nicht dunkel",
    );
    await warteStand(seite, 1);
    pruefe(
      (await seite.locator(".react-flow__node[data-id^='fazo-']").count()) === 6,
      "Anlegen",
      "nicht sechs Phasen",
    );
    pruefeSeite("Anlegen");
    await bild(seite, ordner, "01-neue-marke.png");

    // ── 2: three colours – Primär, Akzent, the Tönung by its slider (the node stays) ───────────
    await farbeSetzen(seite, "primaer", FARBEN.primaer);
    await farbeSetzen(seite, "akzent", FARBEN.akzent);
    const neutralVorher = await platzDe(seite, "farbo-neutral");
    const glitilo = seite.locator("[data-nr-toenung]");
    const regler = await glitilo.boundingBox();
    pruefe(regler !== null, "Regler", "der Regler „Tönung“ ist nicht sichtbar");
    const revRegler = await revDe(seite);
    const zeile = regler.y + regler.height / 2;
    await ziehe(
      seite,
      { x: regler.x + 2, y: zeile },
      { x: regler.x + regler.width * 0.35, y: zeile },
    );
    await warteStand(seite, revRegler + 1);
    const neutralNachher = await platzDe(seite, "farbo-neutral");
    pruefe(
      neutralNachher.x === neutralVorher.x && neutralNachher.y === neutralVorher.y,
      "Regler",
      `der Knoten Neutral hat sich bewegt (${JSON.stringify(neutralVorher)} → ${JSON.stringify(neutralNachher)})`,
    );
    const toenungEtikedo = await knoten(seite, "farbo-neutral")
      .locator(".nr-g-etikedo")
      .first()
      .textContent();
    pruefe(
      /Tönung 0,[1-9]/.test(toenungEtikedo ?? ""),
      "Regler",
      `die Tönung wurde nicht gesetzt („${toenungEtikedo}“)`,
    );
    pruefeSeite("Farben");
    await bild(seite, ordner, "02-drei-farben.png");

    // ── 3: a step by hand – „Farbe aus dem Knoten“ at the Basis of Primär, pin visible ────────
    const basisStufe = seite.locator('[data-nr-vico="primaer"] [data-nr-stufo][data-nr-basis]');
    pruefe((await basisStufe.count()) === 1, "Basis", "Primär hat nicht genau eine Basis");
    const basisToken = (await basisStufe.getAttribute("data-nr-stufo")) ?? "";
    await basisStufe.click();
    const kampo = seite.locator(`[data-nr-stufo-kampo="${basisToken}"]`);
    await kampo.waitFor();
    await kampo.locator("[data-nr-stufo-el-nodo]").click();
    const hell = await kampo.locator('[data-nr-stufo-valoro="hell"]').getAttribute("value");
    pruefe(
      hell?.toLowerCase() === FARBEN.primaer,
      "Farbe aus dem Knoten",
      `das Feld „hell“ zeigt ${hell}, nicht ${FARBEN.primaer}`,
    );
    const revStufe = await revDe(seite);
    await kampo.locator("[data-nr-stufo-uebernehmen]").click();
    await warteStand(seite, revStufe + 1);
    await seite.keyboard.press("Escape");
    await kampo.waitFor({ state: "detached" });
    const gesetzt = seite.locator(`[data-nr-stufo="${basisToken}"]`);
    pruefe(
      (await gesetzt.getAttribute("data-nr-nadel-hell")) !== null &&
        (await gesetzt.getAttribute("data-nr-basis")) !== null,
      "Stufe von Hand",
      `${basisToken} trägt keine Nadel oder ist nicht mehr Basis`,
    );
    pruefeSeite("Stufe");
    await bild(seite, ordner, "03-stufe-von-hand.png");

    // ── 4: both previews in one image ────────────────────────────────────────────────────────
    await bildVon(seite, ordner, "04-vorschau-hell-dunkel.png", [
      knoten(seite, "vorschau-hell"),
      knoten(seite, "vorschau-dunkel"),
    ]);

    // ── 5: the view Verstehen of the same brand ─────────────────────────────────────────────
    const verstehen = await kontext.newPage();
    verstehen.on("pageerror", (fehler) => seitenfehler.push(fehler.message));
    await verstehen.goto(`${basis}/marko/${MARKE}/grafeo?ansicht=verstehen`);
    await verstehen.locator("#nr-leinwand[data-nr-preta]").waitFor();
    pruefe(
      (await verstehen.locator("#nr-leinwand").getAttribute("data-nr-ansicht")) === null,
      "Verstehen",
      "Verstehen mountet die Ansicht Gestalten",
    );
    await gemalt(verstehen);
    await bild(verstehen, ordner, "05-ansicht-verstehen.png");
    await verstehen.close();

    // ── 6: the same canvas, light (no reload, places stay) ──────────────────────────────────
    await seite.evaluate(() => {
      (window as unknown as { nrOhneNeuladen: boolean }).nrOhneNeuladen = true;
    });
    await seite.locator('[data-nr-skemo="hell"]').click();
    await seite.waitForFunction(
      () => document.documentElement.getAttribute("data-fm-color-scheme") === "light",
    );
    pruefe(
      (await seite.evaluate(
        () => (window as unknown as { nrOhneNeuladen?: boolean }).nrOhneNeuladen === true,
      )) && seite.url().includes("scheme=light"),
      "Leinwand hell",
      "die Seite wurde neu geladen oder die Adresse trägt scheme=light nicht",
    );
    await bild(seite, ordner, "06-leinwand-hell.png");
    await seite.locator('[data-nr-skemo="dunkel"]').click();
    await seite.waitForFunction(
      () => document.documentElement.getAttribute("data-fm-color-scheme") === "dark",
    );

    // ── 7: a step with its own dark value (split) and the marked Basis ──────────────────────
    const dunkelToken = "color.palette.accent.300";
    await seite.locator(`[data-nr-stufo="${dunkelToken}"]`).click();
    const dunkelKampo = seite.locator(`[data-nr-stufo-kampo="${dunkelToken}"]`);
    await dunkelKampo.waitFor();
    await dunkelKampo.locator('[data-nr-stufo-valoro="dunkel"] input').fill(FARBEN.dunkel);
    const revDunkel = await revDe(seite);
    await dunkelKampo.locator("[data-nr-stufo-uebernehmen]").click();
    await warteStand(seite, revDunkel + 1);
    await seite.keyboard.press("Escape");
    await dunkelKampo.waitFor({ state: "detached" });
    const geteilt = seite.locator(`[data-nr-stufo="${dunkelToken}"]`);
    pruefe(
      (await geteilt.getAttribute("data-nr-geteilt")) !== null &&
        (await geteilt.getAttribute("data-nr-nadel-dunkel")) !== null &&
        (await geteilt.getAttribute("data-nr-nadel-hell")) === null,
      "Stufe dunkel",
      `${dunkelToken} ist nicht geteilt oder trägt die falsche Nadel`,
    );
    await bildVon(seite, ordner, "07-stufe-dunkel-und-basis.png", [knoten(seite, "paletro")]);

    // ── 8: Akzent detached from the Palette, with the notice in the header ──────────────────
    const akzentEingang = seite.locator('[data-nr-anschluss="paletro.en.akzent"]');
    const vonAkzent = await mitte(akzentEingang);
    await ziehe(seite, vonAkzent, { x: vonAkzent.x - 120, y: vonAkzent.y + 230 });
    await seite.locator('[data-nr-vico="akzent"][data-nr-fonto="-"]').waitFor();
    await seite.locator("[data-nr-ligo-hinweis]").waitFor();
    const revLigo = await revDe(seite);
    await warteStand(seite, revLigo, "akzent:-");
    pruefe(
      ((await seite.locator('[data-nr-vico="akzent"]').textContent()) ?? "").includes(
        "nicht verbunden",
      ),
      "Akzent lösen",
      "die Akzent-Zeile zeigt nicht „nicht verbunden“",
    );
    pruefeSeite("Akzent lösen");
    await bild(seite, ordner, "08-akzent-geloest.png");
    await seite.locator("[data-nr-ligoj-zuruecksetzen]").click();
    await seite.locator("[data-nr-ligo-hinweis]").waitFor({ state: "detached" });
    await seite.locator('[data-nr-vico="akzent"][data-nr-fonto="akzent"]').waitFor();
    await warteStand(seite, revLigo, "");

    // Primär plugged into „Warnung“: that row is derived from Primär, with its Basis.
    await ziehe(
      seite,
      await mitte(seite.locator('[data-nr-anschluss="farbo-primaer.el"]')),
      await mitte(seite.locator('[data-nr-anschluss="paletro.en.warning"]')),
    );
    await seite.locator('[data-nr-vico="warning"][data-nr-fonto="primaer"]').waitFor();
    await warteStand(seite, revLigo, "warning:primaer");
    pruefe(
      (await seite.locator('[data-nr-vico="warning"] [data-nr-stufo][data-nr-basis]').count()) ===
        1,
      "Primär an Warnung",
      "die Zeile Warnung hat keine Basis",
    );
    pruefe((await revDe(seite)) === revLigo, "Primär an Warnung", "der rev hat sich geändert");
    await seite.locator("[data-nr-ligoj-zuruecksetzen]").click();
    await seite.locator("[data-nr-ligo-hinweis]").waitFor({ state: "detached" });
    await warteStand(seite, revLigo, "");

    // ── 9: the open list „+ Knoten“ ─────────────────────────────────────────────────────────
    await seite.locator("[data-nr-aldoni]").click();
    await seite.locator("[data-nr-menuo]").waitFor();
    await bild(seite, ordner, "09-liste-knoten.png", false);

    // A node and a phase dragged; then a Funktionsfarbe through „+ Knoten“ keeps their places.
    const anfragen: string[] = [];
    const notiere = (anfrage: { url(): string }) => anfragen.push(anfrage.url());
    await seite.keyboard.press("Escape");
    await seite.locator("[data-nr-menuo]").waitFor({ state: "detached" });
    seite.on("request", notiere);
    const neutralStart = await platzDe(seite, "farbo-neutral");
    const neutralKopf = await mitte(knoten(seite, "farbo-neutral").locator(".nr-g-kapo").first());
    await ziehe(seite, neutralKopf, { x: neutralKopf.x + 60, y: neutralKopf.y + 40 });
    const neutralVerschoben = await platzDe(seite, "farbo-neutral");
    pruefe(
      neutralVerschoben.x > neutralStart.x + 30 && neutralVerschoben.y > neutralStart.y + 20,
      "Knoten ziehen",
      `der Knoten Neutral steht noch bei ${JSON.stringify(neutralVerschoben)}`,
    );
    const markeStart = await platzDe(seite, "marko");
    const fazoStart = await platzDe(seite, "fazo-4");
    const fazoKopf = await mitte(knoten(seite, "fazo-4").locator(".nr-g-fazo-kapo"));
    await ziehe(seite, fazoKopf, { x: fazoKopf.x + 10, y: fazoKopf.y + 50 });
    const fazoNachher = await platzDe(seite, "fazo-4");
    const markeNachher = await platzDe(seite, "marko");
    const neutralMitPhase = await platzDe(seite, "farbo-neutral");
    const dx = fazoNachher.x - fazoStart.x;
    const dy = fazoNachher.y - fazoStart.y;
    pruefe(dy > 20, "Phase ziehen", `Phase 4 hat sich nicht bewegt (${dx}, ${dy})`);
    pruefe(
      nah(markeNachher, { x: markeStart.x + dx, y: markeStart.y + dy }) &&
        nah(neutralMitPhase, { x: neutralVerschoben.x + dx, y: neutralVerschoben.y + dy }),
      "Phase ziehen",
      `die Knoten sind nicht mit ihrer Phase gewandert (Phase ${dx}, ${dy}; Marke ${JSON.stringify(markeStart)} → ${JSON.stringify(markeNachher)})`,
    );
    seite.off("request", notiere);
    pruefe(anfragen.length === 0, "Ziehen", `Anfragen beim Ziehen: ${anfragen.join(", ")}`);

    await seite.locator("[data-nr-aldoni]").click();
    const erfolg = seite.locator('[data-nr-aldoneblo="Farbe · Erfolg"][data-nr-stato="anlegen"]');
    await erfolg.click();
    await knoten(seite, "farbo-success").waitFor();
    await farbeSetzen(seite, "success", FARBEN.erfolg);
    pruefe(
      (await seite.locator('[data-nr-vico="success"]').getAttribute("data-nr-fonto")) === "success",
      "Funktionsfarbe",
      "die Zeile Erfolg hängt nicht an ihrem Knoten",
    );
    // The new node stands at its start slot inside the moved phase (zoom 1:1 after fitting).
    const erfolgPlatz = await platzDe(seite, "farbo-success");
    const slot = ARANGXO_054.funkcioj;
    pruefe(
      nah(erfolgPlatz, { x: fazoNachher.x + slot.x, y: fazoNachher.y + slot.y }),
      "Funktionsfarbe",
      `der neue Knoten steht nicht an seinem Startplatz in der verschobenen Phase (${JSON.stringify(erfolgPlatz)})`,
    );
    pruefe(
      nah(await platzDe(seite, "farbo-neutral"), neutralMitPhase) &&
        nah(await platzDe(seite, "marko"), markeNachher),
      "Plätze",
      "verschobene Knoten stehen nach dem Neurechnen nicht mehr an ihrem Platz",
    );
    await seite.locator("[data-nr-aldoni]").click();
    await seite.locator('[data-nr-aldoneblo="Komponenten"][data-nr-stato="weitere"]').click();
    await knoten(seite, "vorschau-3").waitFor();
    await seite.locator('[data-nr-forigi="vorschau-3"]').click();
    await knoten(seite, "vorschau-3").waitFor({ state: "detached" });
    pruefeSeite("Knoten");

    // A reload puts every node back at its start place.
    await seite.reload();
    await seite.locator("#nr-leinwand[data-nr-preta]").waitFor();
    await warteStand(seite, await revDe(seite));
    pruefe(
      nah(await platzDe(seite, "farbo-neutral"), neutralStart) &&
        nah(await platzDe(seite, "marko"), markeStart),
      "Neu laden",
      "nach dem Neuladen stehen die Knoten nicht am Startplatz",
    );

    // ── Measurement: five Primär changes until every preview shows them ─────────────────────
    const laeufe: number[] = [];
    for (const wert of MESSWERTE) laeufe.push(await missAenderung(seite, wert));
    pruefeSeite("Messung");
    return zeitenAus(laeufe);
  } finally {
    await kontext.close();
  }
}

/** Relative paths count from where pnpm was called (INIT_CWD), not from the package. */
const vomAufruf = (pfad: string): string => resolve(process.env.INIT_CWD ?? process.cwd(), pfad);

async function main(): Promise<number> {
  const { values } = parseArgs({
    options: { ziel: { type: "string" }, messung: { type: "string" } },
    strict: true,
  });
  if (values.ziel === undefined) {
    console.error(
      "Kein --ziel angegeben: das Skript schreibt nichts. Aufruf: pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-054.ts --ziel <bilder-ordner> [--messung <datei>]",
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
  const ordner = vomAufruf(values.ziel);
  const messungDatei =
    values.messung === undefined
      ? join(dirname(ordner), "messung.json")
      : vomAufruf(values.messung);
  await mkdir(ordner, { recursive: true });

  const arbeit = await mkdtemp(join(tmpdir(), "nr-bilder-054-"));
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
    const zeiten = await lauf(browser, basis, ordner);
    const messung = {
      vorschauNachAenderungMs: {
        ...zeiten,
        was: "Primär fünfmal ändern: von fill+Enter bis data-nr-vorschau-rev = neuer rev, kein data-nr-vorschau-laedt und beide festen Vorschauen geladen (readyState complete, Adresse mit dem neuen rev)",
        werte: [...MESSWERTE],
      },
      buendel: {
        datei: "packages/nodredaktilo/dist/leinwand.js",
        gzip: "gzip -6 -c (wie das Ausgangsmaß in tasks.md)",
        vorher: BUENDEL_VORHER,
        nachher: buendel(),
      },
      umgebung: {
        chromium: browser.version(),
        viewport: VIEWPORT,
        vorschauen: 2,
      },
    };
    await writeFile(messungDatei, `${JSON.stringify(messung, null, 2)}\n`);
    console.log(`Geschrieben: ${messungDatei}`);
    console.log(JSON.stringify(messung));
    return 0;
  } catch (fehler) {
    console.error(
      `Abgebrochen: ${fehler instanceof Error ? fehler.message.split("\n")[0] : String(fehler)}`,
    );
    return 1;
  } finally {
    await browser?.close();
    await beende(kind);
    await rm(arbeit, { recursive: true, force: true });
  }
}

process.exitCode = await main();
