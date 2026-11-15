// Spec 055 T7 (LNS-4.1, Abnahme 1, plan D-19): the binding browser check of the start layout, the
// Abläufe 1–5 in Chromium and the seven images of the product spec, written outside the repo.
//
//   pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-055.ts --ziel <dir>
//
// Starts the built CLI (`fm metiejo`) as a child process on a free port with a temporary, empty
// workdir, creates a brand through the start page („Auf der Leinwand anlegen“) and works the canvas
// in Chromium at 2100×1250, Playwright defaults untouched. At the start layout it checks (D-19):
// the rendered node boxes are pairwise disjoint; every edge path, sampled with `getPointAtLength`,
// lies in no box except those of its two end nodes; every edge with a bend has round corners (`Q`
// or `A` in `d`) – a straight edge (one horizontal or vertical piece) has no corner and is counted
// as exempt. It measures every node height against the maximum of D-2 (`ARANGXO_055.alteco`), also
// with the Neutral field open. Then it walks the Abläufe 1–5 and stops with an error at the first
// failure. These images are records, not baselines; nothing compares them.

import { type ChildProcess, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { setTimeout as warten } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { ARANGXO_055, altecoDe } from "@fundamento/metiejo/gestalten";
import { type Browser, chromium, type Locator, type Page } from "playwright";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const CLI = join(REPO, "packages/cli/dist/index.js");
const LEINWAND = join(REPO, "packages/nodredaktilo/dist/leinwand.js");
const BAU_BEFEHL = "pnpm build";

/** The viewport of the images of Spec 054 and 055. */
const VIEWPORT = { width: 2100, height: 1250 } as const;
const START_TAKT_MS = 250;
/** An invented brand; the start page derives its identifier from it. */
const MARKE = "lumeto";
const FESTE_KANTE = "farbo-primaer.el>farbo-neutral.en.farbo";
const FUNKTIONSFARBEN = ["success", "warning", "danger", "info"] as const;
/** The colours of the run (invented). */
const FARBEN = {
  neutral: "#e8e2d6",
  warnung: "#d99a00",
  akzent: "#2e8b57",
  blau: "#1f5fbf",
  rot: "#d62828",
} as const;

class Abbruch extends Error {}

/** Fails the run with a clear message unless `bedingung` holds. */
function pruefe(bedingung: boolean, schritt: string, was: string): asserts bedingung {
  if (!bedingung) throw new Abbruch(`${schritt}: ${was}`);
  console.log(`ok  ${schritt}: ${was}`);
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

async function revDe(seite: Page): Promise<number> {
  return Number(await leinwand(seite).getAttribute("data-nr-rev"));
}

/** Waits until the Bildo of `rev` is painted and every preview shows it, nothing loading. */
async function warteStand(seite: Page, rev: number): Promise<void> {
  await seite.waitForFunction((rev) => {
    const el = document.getElementById("nr-leinwand");
    return (
      el !== null &&
      el.getAttribute("data-nr-rev") === String(rev) &&
      el.getAttribute("data-nr-vorschau-rev") === String(rev) &&
      (el.getAttribute("data-nr-vorschau-kabloj") ?? "") ===
        (el.getAttribute("data-nr-kabloj") ?? "") &&
      !el.hasAttribute("data-nr-vorschau-laedt")
    );
  }, rev);
  await gemalt(seite);
}

/** The node's place in flow units, from React Flow's transform (independent of the zoom). */
async function flussPlatz(seite: Page, id: string): Promise<{ x: number; y: number }> {
  const transform = await knoten(seite, id).evaluate((el) => (el as HTMLElement).style.transform);
  const treffer = /translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(transform);
  if (treffer === null) throw new Abbruch(`Platz: ${id} hat keinen Platz (${transform})`);
  return { x: Math.round(Number(treffer[1])), y: Math.round(Number(treffer[2])) };
}

const gleich = (a: { x: number; y: number }, b: { x: number; y: number }): boolean =>
  a.x === b.x && a.y === b.y;

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

/** Drags a node by its head (the first 12 px of the box) by (dx, dy) screen pixels. */
async function zieheKnoten(seite: Page, id: string, dx: number, dy: number): Promise<void> {
  const rahmen = await knoten(seite, id).boundingBox();
  if (rahmen === null) throw new Abbruch(`nicht sichtbar: ${id}`);
  const von = { x: rahmen.x + 40, y: rahmen.y + 12 };
  await ziehe(seite, von, { x: von.x + dx, y: von.y + dy });
}

/** Types a colour into a node's field (its inner `input`) and saves it with Enter. */
async function farbeSetzen(seite: Page, rolo: string, wert: string): Promise<number> {
  const vorher = await revDe(seite);
  const feld = seite.locator(`[data-nr-farbo-kampo="${rolo}"] input`);
  await feld.fill(wert);
  await feld.press("Enter");
  await warteStand(seite, vorher + 1);
  return vorher + 1;
}

/** The canvas state as the server holds it. */
async function statoDe(
  basis: string,
): Promise<{ knoten: { id: string }[]; kabloj: Record<string, unknown> } | null> {
  const antwort = (await (await fetch(`${basis}/api/leinwand?marko=${MARKE}`)).json()) as {
    stato: { knoten: { id: string }[]; kabloj: Record<string, unknown> } | null;
  };
  return antwort.stato;
}

/** Waits until the server holds a state for which `bedingung` holds (the canvas writes per frame). */
async function warteStato(
  seite: Page,
  basis: string,
  schritt: string,
  bedingung: (stato: Awaited<ReturnType<typeof statoDe>>) => boolean,
): Promise<void> {
  for (let i = 0; i < 200; i++) {
    if (bedingung(await statoDe(basis))) return;
    await gemalt(seite);
  }
  throw new Abbruch(`${schritt}: der Zustand der Leinwand wurde nicht geschrieben`);
}

/** A place on the empty stage: the pointer rests there, hovering nothing. */
const RUHEPLATZ = { x: 1900, y: VIEWPORT.height - 40 } as const;

/** Before an image: pointer off every control, every finite animation finished, painted. */
async function ruhig(seite: Page): Promise<void> {
  await seite.mouse.move(RUHEPLATZ.x, RUHEPLATZ.y);
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

const bild = async (seite: Page, ordner: string, datei: string): Promise<string> => {
  const pfad = join(ordner, datei);
  await ruhig(seite);
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
  await seite.screenshot({ path: pfad, clip: { x, y, width: x2 - x, height: y2 - y } });
  console.log(`Bild: ${pfad}`);
  return pfad;
}

interface Geometrie {
  knoten: number;
  ueberdeckungen: string[];
  kanten: number;
  geprueft: number;
  gerade: string[];
  durchFremde: string[];
  ohneRundung: string[];
}

/**
 * D-19 at the rendered start layout, in screen pixels: node boxes (`getBoundingClientRect`) and
 * edge points (`getPointAtLength` mapped by the path's screen matrix). The end nodes of an edge
 * are the parts of its id before the first „.“ of `de` and `al`.
 */
async function geometrie(seite: Page): Promise<Geometrie> {
  return seite.evaluate(() => {
    const boxen = [...document.querySelectorAll<HTMLElement>(".react-flow__node")].map((el) => {
      const r = el.getBoundingClientRect();
      return { id: el.dataset.id ?? "", l: r.left, t: r.top, r: r.right, b: r.bottom };
    });
    const ueberdeckungen: string[] = [];
    for (const [i, a] of boxen.entries())
      for (const b of boxen.slice(i + 1))
        if (a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b)
          ueberdeckungen.push(`${a.id}×${b.id}`);
    const pfade = [...document.querySelectorAll<SVGPathElement>("path[data-nr-ligo]")];
    const gerade: string[] = [];
    const durchFremde: string[] = [];
    const ohneRundung: string[] = [];
    let geprueft = 0;
    for (const pfad of pfade) {
      const id = pfad.getAttribute("data-nr-ligo") ?? "";
      const [de = "", al = ""] = id.split(">");
      const ende = new Set([de.split(".")[0], al.split(".")[0]]);
      const matrix = pfad.getScreenCTM();
      if (matrix === null) continue;
      const laenge = pfad.getTotalLength();
      const punkte: { x: number; y: number }[] = [];
      for (let s = 0; s <= laenge; s += 2) {
        const p = pfad.getPointAtLength(s);
        const q = new DOMPoint(p.x, p.y).matrixTransform(matrix);
        punkte.push({ x: q.x, y: q.y });
      }
      for (const box of boxen) {
        if (ende.has(box.id)) continue;
        const drin = punkte.find((p) => p.x > box.l && p.x < box.r && p.y > box.t && p.y < box.b);
        if (drin !== undefined)
          durchFremde.push(
            `${id} durch ${box.id} bei (${drin.x.toFixed(1)}, ${drin.y.toFixed(1)})`,
          );
      }
      // A straight edge: one horizontal or one vertical piece (no bend, so no corner to round).
      const xs = punkte.map((p) => p.x);
      const ys = punkte.map((p) => p.y);
      // (No named helper here: tsx would wrap it in `__name`, which the page does not know.)
      if (Math.max(...xs) === Math.min(...xs) || Math.max(...ys) === Math.min(...ys)) {
        gerade.push(`${id} (${pfad.getAttribute("d") ?? ""})`);
        continue;
      }
      geprueft++;
      if (!/[QA]/.test(pfad.getAttribute("d") ?? "")) ohneRundung.push(id);
    }
    return {
      knoten: boxen.length,
      ueberdeckungen,
      kanten: pfade.length,
      geprueft,
      gerade,
      durchFremde,
      ohneRundung,
    };
  });
}

interface Hoehe {
  id: string;
  gemessen: number;
  hoechstens: number;
}

/** The rendered heights in flow units (`offsetHeight` is not scaled by the zoom), against D-2. */
async function hoehen(seite: Page): Promise<Hoehe[]> {
  const gemessen = await seite.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".react-flow__node")].map((el) => ({
      id: el.dataset.id ?? "",
      gemessen: el.offsetHeight,
    })),
  );
  return gemessen.map((h) => ({ ...h, hoechstens: altecoDe(h.id) }));
}

const hoehenText = (liste: readonly Hoehe[]): string =>
  liste.map((h) => `${h.id} ${h.gemessen}/${h.hoechstens}`).join(", ");

async function lauf(browser: Browser, basis: string, ordner: string): Promise<void> {
  const kontext = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const seite = await kontext.newPage();
  const fehler: string[] = [];
  seite.on("pageerror", (f) => fehler.push(f.message));
  seite.on("console", (m) => {
    if (m.type() === "error") fehler.push(m.text());
  });
  const pruefeSeite = (schritt: string) =>
    pruefe(
      fehler.length === 0,
      schritt,
      `keine Seiten- oder Konsolenfehler (${fehler.join(" | ")})`,
    );
  try {
    // ── Ablauf 1: a new brand, without frames; the D-19 check at the start layout ─────────────
    await seite.goto(`${basis}/`);
    await seite.locator('fm-kampo[name="name"] input').fill(MARKE);
    await seite.locator('fm-butono[data-mt-ziel="leinwand"]').click();
    await seite.waitForURL(`${basis}/marko/${MARKE}/grafeo`);
    await leinwand(seite).and(seite.locator("[data-nr-preta]")).waitFor();
    await warteStand(seite, 1);
    await ruhig(seite);
    pruefe(
      (await seite.locator(".react-flow__node[data-id^='fazo-']").count()) === 0 &&
        !((await seite.locator("body").textContent()) ?? "").includes("kommt später"),
      "Ablauf 1",
      "keine Rahmen, kein „kommt später“",
    );
    pruefe(
      (await seite.locator(".react-flow__node[data-id^='farbo-']").count()) === 7,
      "Ablauf 1",
      "sieben Farbknoten",
    );
    const stati = await Promise.all(
      ["primaer", "neutral", "akzent", ...FUNKTIONSFARBEN].map(async (rolo) =>
        knoten(seite, `farbo-${rolo}`)
          .locator("[data-nr-farbo-stato]")
          .getAttribute("data-nr-farbo-stato"),
      ),
    );
    pruefe(
      JSON.stringify(stati) ===
        JSON.stringify([
          "startwert",
          "abgeleitet",
          "leer",
          "abgeleitet",
          "abgeleitet",
          "abgeleitet",
          "abgeleitet",
        ]),
      "Ablauf 1",
      `Primär Startwert, Neutral abgeleitet, Akzent leer, Funktionsfarben abgeleitet (${stati.join(", ")})`,
    );
    pruefe(
      (await seite.locator("[data-nr-neutral-herkunft=primaer]").count()) === 1 &&
        (await seite.locator(`path[data-nr-ligo="${FESTE_KANTE}"]`).count()) === 1,
      "Ablauf 1",
      "Neutral „aus Primär abgeleitet“ mit der Kante von Primär",
    );
    const geo = await geometrie(seite);
    console.log(
      `D-19: ${geo.knoten} Knoten, ${geo.kanten} Kanten, davon ${geo.geprueft} mit Knick geprüft, ${geo.gerade.length} gerade ausgenommen: ${geo.gerade.join("; ")}`,
    );
    pruefe(geo.knoten === 11, "D-19", `11 Knoten gerendert (${geo.knoten})`);
    pruefe(
      geo.ueberdeckungen.length === 0,
      "D-19",
      `Knotenboxen paarweise ohne Schnitt (${geo.ueberdeckungen.join(", ")})`,
    );
    pruefe(
      geo.durchFremde.length === 0,
      "D-19",
      `keine Kante durch eine fremde Box (${geo.durchFremde.join("; ")})`,
    );
    pruefe(
      geo.ohneRundung.length === 0,
      "D-19",
      `jede Kante mit Knick hat Q oder A (${geo.ohneRundung.join(", ")})`,
    );
    pruefe(
      geo.geprueft + geo.gerade.length === geo.kanten,
      "D-19",
      "jede Kante geprüft oder als gerade ausgenommen",
    );
    const startHoehen = await hoehen(seite);
    console.log(`Höhen beim Start (gemessen/höchstens): ${hoehenText(startHoehen)}`);
    const zuHoch = startHoehen.filter((h) => h.gemessen > h.hoechstens);
    pruefe(zuHoch.length === 0, "D-2", `keine Höhe über ihrem Maximum (${hoehenText(zuHoch)})`);
    pruefe(ARANGXO_055.alteco["farbo-kompakta"] === 96, "D-2", "Maxima unverändert (kompakt 96)");
    pruefeSeite("Ablauf 1");
    await bild(seite, ordner, "01-neue-marke.png");

    // ── Bild 2: Neutral derived – the edge from Primär and the sentence ───────────────────────
    pruefe(
      ((await seite.locator("[data-nr-neutral-herkunft]").textContent()) ?? "").includes(
        "aus Primär abgeleitet",
      ),
      "Ablauf 2",
      "Satz „aus Primär abgeleitet“",
    );
    await bildVon(seite, ordner, "02-neutral-abgeleitet.png", [
      knoten(seite, "farbo-primaer"),
      knoten(seite, "farbo-neutral"),
    ]);

    // ── Ablauf 2: an own Neutral colour; the field open stays within its maximum ───────────────
    await seite.locator("[data-nr-neutral-eigene]").click();
    await seite.locator('[data-nr-farbo-kampo="neutral"] input').waitFor();
    await gemalt(seite);
    const offen = (await hoehen(seite)).find((h) => h.id === "farbo-neutral");
    pruefe(
      offen !== undefined && offen.gemessen <= offen.hoechstens,
      "D-2",
      `Neutral mit offenem Feld ${offen?.gemessen}/${offen?.hoechstens}`,
    );
    const revNeutral = await farbeSetzen(seite, "neutral", FARBEN.neutral);
    pruefe(
      (await seite.locator("[data-nr-neutral-herkunft=eigene]").textContent())?.trim() ===
        "eigene Farbe" &&
        (await seite.locator(`path[data-nr-ligo="${FESTE_KANTE}"]`).count()) === 0,
      "Ablauf 2",
      "Satz „eigene Farbe“, Kante gelöst",
    );
    pruefe(
      (await knoten(seite, "farbo-neutral")
        .locator("[data-nr-farbo-stato]")
        .getAttribute("data-nr-farbo-stato")) === "von-hand" &&
        (await seite.locator("[data-nr-toenung-wert]").textContent())?.trim() === "1,00",
      "Ablauf 2",
      "„von Hand“, Tönung 1,00",
    );
    pruefe(
      (
        (await seite.locator("[data-nr-vico=neutral] .nr-g-paletro-etikedo").textContent()) ?? ""
      ).includes("eigene Farbe · Tönung 1,00"),
      "Ablauf 2",
      "Palette „eigene Farbe · Tönung 1,00“",
    );
    pruefe(
      (await leinwand(seite).getAttribute("data-nr-vorschau-rev")) === String(revNeutral),
      "Ablauf 2",
      `beide Vorschauen auf rev ${revNeutral} ohne Neuladen`,
    );
    pruefeSeite("Ablauf 2");
    await bild(seite, ordner, "03-neutral-eigene-farbe.png");
    const revZurueck = await revDe(seite);
    await seite.locator("[data-nr-farbo-zurueck=neutral]").click();
    await warteStand(seite, revZurueck + 1);
    pruefe(
      (await seite.locator("[data-nr-neutral-herkunft=primaer]").count()) === 1 &&
        (await seite.locator(`path[data-nr-ligo="${FESTE_KANTE}"]`).count()) === 1,
      "Ablauf 2",
      "„zurück zur Ableitung“: Kante wieder da",
    );

    // ── Bild 4: one Funktionsfarbe by hand, three derived ─────────────────────────────────────
    await farbeSetzen(seite, "warning", FARBEN.warnung);
    const funkcioj = await Promise.all(
      FUNKTIONSFARBEN.map((rolo) =>
        knoten(seite, `farbo-${rolo}`)
          .locator("[data-nr-farbo-stato]")
          .getAttribute("data-nr-farbo-stato"),
      ),
    );
    pruefe(
      JSON.stringify(funkcioj) ===
        JSON.stringify(["abgeleitet", "von-hand", "abgeleitet", "abgeleitet"]),
      "Funktionsfarbe",
      `Warnung „von Hand“, drei „abgeleitet“ (${funkcioj.join(", ")})`,
    );
    await bildVon(seite, ordner, "04-funktionsfarbe-von-hand.png", [
      ...FUNKTIONSFARBEN.map((rolo) => knoten(seite, `farbo-${rolo}`)),
      knoten(seite, "paletro"),
    ]);

    // ── Ablauf 3: move, detach, add a preview, reload – the same canvas ───────────────────────
    await farbeSetzen(seite, "akzent", FARBEN.akzent);
    await zieheKnoten(seite, "paletro", 90, 0);
    const palette = await flussPlatz(seite, "paletro");
    pruefe(
      palette.x > ARANGXO_055.nodoj.paletro.x,
      "Ablauf 3",
      `Palette nach rechts (${palette.x})`,
    );
    const akzentEingang = seite.locator('[data-nr-anschluss="paletro.en.akzent"]');
    const vonAkzent = await mitte(akzentEingang);
    await ziehe(seite, vonAkzent, { x: vonAkzent.x - 60, y: vonAkzent.y + 260 });
    await seite.locator('[data-nr-vico="akzent"][data-nr-fonto="-"]').waitFor();
    await seite.locator("[data-nr-aldoni]").click();
    await seite.locator("[data-nr-menuo]").waitFor();
    await seite.locator('[data-nr-aldoneblo="Komponenten"]').click();
    await knoten(seite, "vorschau-3").waitFor();
    await warteStato(
      seite,
      basis,
      "Ablauf 3",
      (s) =>
        s !== null &&
        s.kabloj.akzent === null &&
        s.knoten.some((k) => k.id === "paletro") &&
        s.knoten.some((k) => k.id === "vorschau-3"),
    );
    pruefe(
      ((await seite.locator("[data-nr-gespeichert]").textContent()) ?? "").includes("gespeichert"),
      "Ablauf 3",
      "„gespeichert HH:MM“ in der Kopfleiste",
    );
    await seite.reload();
    await leinwand(seite).and(seite.locator("[data-nr-preta]")).waitFor();
    await warteStand(seite, await revDe(seite));
    pruefe(
      gleich(await flussPlatz(seite, "paletro"), palette),
      "Ablauf 3",
      "Palette nach dem Neuladen am neuen Platz",
    );
    pruefe(
      (await seite.locator('[data-nr-vico="akzent"][data-nr-fonto="-"]').count()) === 1 &&
        ((await seite.locator('[data-nr-vico="akzent"]').textContent()) ?? "").includes(
          "nicht verbunden",
        ),
      "Ablauf 3",
      "Akzent-Zeile „nicht verbunden“",
    );
    pruefe(
      (await leinwand(seite).getAttribute("data-nr-vorschau-kabloj")) === "akzent:-",
      "Ablauf 3",
      "die Vorschau zeigt den wirksamen Agordo ohne Akzent",
    );
    pruefe(
      (await knoten(seite, "vorschau-3").count()) === 1,
      "Ablauf 3",
      "weitere Vorschau noch da",
    );
    pruefeSeite("Ablauf 3");
    await bild(seite, ordner, "05-nach-neuladen.png");
    await seite.locator("[data-nr-anordnung-zuruecksetzen]").click();
    await seite.locator('[data-nr-vico="akzent"][data-nr-fonto="akzent"]').waitFor();
    await gemalt(seite);
    const { x: px, y: py } = ARANGXO_055.nodoj.paletro;
    pruefe(
      gleich(await flussPlatz(seite, "paletro"), { x: px, y: py }),
      "Ablauf 3",
      "„Anordnung zurücksetzen“: Startplatz",
    );
    pruefe(
      (await knoten(seite, "vorschau-3").count()) === 1,
      "Ablauf 3",
      "hinzugefügter Knoten bleibt",
    );

    // ── Ablauf 4: a Stand, a change, „Öffnen“ ───────────────────────────────────────────────
    await farbeSetzen(seite, "primaer", FARBEN.blau);
    // A layout of its own for the Stand: Marke moved down (it is no start layout any more).
    await zieheKnoten(seite, "marko", 0, 60);
    await warteStato(
      seite,
      basis,
      "Ablauf 4",
      (s) => s?.knoten.some((k) => k.id === "marko") === true,
    );
    await seite.locator("[data-nr-stand-speichern]").click();
    const nomo = seite.locator("[data-nr-stand-kampo] input");
    await nomo.waitFor();
    await nomo.fill("Blau kühl");
    await seite.locator("[data-nr-stand-konservi]").click();
    await seite
      .locator("[data-nr-stand-mesagxo]")
      .filter({ hasText: "Stand „Blau kühl“ gespeichert" })
      .waitFor();
    const blauMarke = await flussPlatz(seite, "marko");
    const blauPrimaer = await flussPlatz(seite, "farbo-primaer");
    const blauPalette = await flussPlatz(seite, "paletro");
    await farbeSetzen(seite, "primaer", FARBEN.rot);
    await zieheKnoten(seite, "farbo-primaer", 0, -30);
    await zieheKnoten(seite, "paletro", 120, 60);
    await warteStato(
      seite,
      basis,
      "Ablauf 4",
      (s) => s?.knoten.some((k) => k.id === "farbo-primaer") === true,
    );
    pruefe(
      !gleich(await flussPlatz(seite, "paletro"), blauPalette) &&
        !gleich(await flussPlatz(seite, "farbo-primaer"), blauPrimaer),
      "Ablauf 4",
      "Primär rot, zwei Knoten verschoben",
    );
    await seite.locator("[data-nr-staende]").click();
    await seite.locator('[data-nr-staende-listo][data-nr-preta="true"]').waitFor();
    const zeile = seite.locator("[data-nr-stand]").filter({ hasText: "Blau kühl" });
    pruefe((await zeile.count()) === 1, "Ablauf 4", "Zeile „Blau kühl“ in der Liste");
    const revVor = await revDe(seite);
    await zeile.locator("[data-nr-stand-oeffnen]").click();
    await seite.waitForFunction(
      (r) => document.getElementById("nr-leinwand")?.getAttribute("data-nr-rev") === String(r),
      revVor + 1,
    );
    await seite.locator("[data-nr-staende-listo]").waitFor({ state: "detached" });
    await warteStand(seite, revVor + 1);
    const primaerWert = await seite
      .locator('[data-nr-farbo-kampo="primaer"]')
      .evaluate((el) => (el as HTMLElement & { value?: string }).value ?? el.getAttribute("value"));
    pruefe(
      String(primaerWert).toLowerCase() === FARBEN.blau,
      "Ablauf 4",
      `Primär wieder Blau (${primaerWert})`,
    );
    pruefe(
      gleich(await flussPlatz(seite, "marko"), blauMarke) &&
        gleich(await flussPlatz(seite, "farbo-primaer"), blauPrimaer) &&
        gleich(await flussPlatz(seite, "paletro"), blauPalette),
      "Ablauf 4",
      `die alten Positionen (Marke ${JSON.stringify(blauMarke)})`,
    );
    pruefe(seite.url() === `${basis}/marko/${MARKE}/grafeo`, "Ablauf 4", "ohne Neuladen der Seite");
    await seite.locator("[data-nr-staende]").click();
    await seite.locator('[data-nr-staende-listo][data-nr-preta="true"]').waitFor();
    const namen = await seite.locator("[data-nr-stand-nomo-teksto]").allTextContents();
    pruefe(
      JSON.stringify(namen) === JSON.stringify(["vor dem Öffnen von „Blau kühl“", "Blau kühl"]),
      "Ablauf 4",
      `Liste ${JSON.stringify(namen)}`,
    );
    pruefeSeite("Ablauf 4");
    await bild(seite, ordner, "06-staende.png");
    await seite.keyboard.press("Escape");
    await seite.locator("[data-nr-staende-listo]").waitFor({ state: "detached" });

    // ── Ablauf 5: the Startseite with its list, one click to the canvas ─────────────────────
    await seite.goto(`${basis}/`);
    const link = seite.locator(`fm-ligilo[to="/marko/${MARKE}/grafeo"]`);
    await link.waitFor();
    pruefe(
      ((await seite.locator("section.mt-marken").textContent()) ?? "").includes(
        "Angefangene Marken",
      ),
      "Ablauf 5",
      "„Angefangene Marken“ auf der Startseite",
    );
    pruefeSeite("Ablauf 5");
    await bild(seite, ordner, "07-startseite-markenliste.png");
    await link.click();
    await seite.waitForURL(`${basis}/marko/${MARKE}/grafeo`);
    await leinwand(seite).and(seite.locator("[data-nr-preta]")).waitFor();
    await warteStand(seite, await revDe(seite));
    pruefe(
      gleich(await flussPlatz(seite, "marko"), blauMarke) &&
        gleich(await flussPlatz(seite, "farbo-primaer"), blauPrimaer) &&
        gleich(await flussPlatz(seite, "paletro"), blauPalette),
      "Ablauf 5",
      "die Leinwand öffnet im gespeicherten Zustand",
    );
    pruefeSeite("Ablauf 5");
  } finally {
    await kontext.close();
  }
}

/** Relative paths count from where pnpm was called (INIT_CWD), not from the package. */
const vomAufruf = (pfad: string): string => resolve(process.env.INIT_CWD ?? process.cwd(), pfad);

async function main(): Promise<number> {
  const { values } = parseArgs({ options: { ziel: { type: "string" } }, strict: true });
  if (values.ziel === undefined) {
    console.error(
      "Kein --ziel angegeben: das Skript schreibt nichts. Aufruf: pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-055.ts --ziel <bilder-ordner>",
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
  await mkdir(ordner, { recursive: true });

  const arbeit = await mkdtemp(join(tmpdir(), "nr-bilder-055-"));
  const port = await freierPort();
  const basis = `http://127.0.0.1:${port}`;
  const kind = spawn(
    process.execPath,
    [CLI, "metiejo", "--port", String(port), "--workdir", arbeit],
    {
      cwd: REPO,
      stdio: ["ignore", "ignore", "inherit"],
    },
  );
  let browser: Browser | undefined;
  try {
    await warteAufMetiejo(basis, kind);
    browser = await chromium.launch();
    console.log(
      `Metiejo ${basis}, Chromium ${browser.version()}, ${VIEWPORT.width}×${VIEWPORT.height}`,
    );
    await lauf(browser, basis, ordner);
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
