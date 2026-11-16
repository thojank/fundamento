// Spec 056 T8 (KBS-4.1, plan D-25): the binding browser check of Teil V and the Abläufe 1–7 in
// Chromium, and the eleven images of the product spec, written outside the repo.
//
//   pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-056.ts --ziel <dir>
//
// Starts the built CLI (`fm metiejo`) as a child process on a free port with a temporary, empty
// workdir and a temporary font cache (`XDG_CACHE_HOME`), creates a brand through the start page and
// works the canvas in Chromium at 2100×1250. AK-7 is measured at the start layout of a new brand
// and again with all six added nodes: the node boxes are pairwise disjoint; every edge path,
// sampled with `getPointAtLength` every 2 px, lies in no box but those of its two ends; every edge
// `d` contains `C`; every port is round (computed radius); a colour edge carries its colour, every
// other edge the grey role. Node heights are measured against `ARANGXO_056` (§2.3), also at the
// tight cases (five values, three Zielgruppe fields, all six sliders, twelve images with eight
// detected colours, the Schrift sliders at their ends, the Marke at its fullest). Then it walks the
// Abläufe 1–7 (AK 1, 15, 16, 17 in the browser) and stops with an error at the first failure.
// The browser reaches nothing but the Metiejo: every other request is aborted and counted; the
// Fontsource files of the Schrift node come through the product's own route (`/api/tiparo/…`),
// which reads them from npm on the server side; an image address is served by a local server.
// These images are records, not baselines; nothing compares them.

import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { createServer as httpServer } from "node:http";
import { createServer, type Server } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { setTimeout as warten } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { deflateSync } from "node:zlib";
import {
  altecoDe,
  BEISPIELE_HILFE,
  DATEI_FEHLT,
  EIGENE_SCHRIFT_SAETZE,
  FOLGO_SAETZE,
  FUENF_WERTE_SATZ,
  NE_KONEKTITA_MARKO_SATZ,
  PINTEREST_SATZ,
  TEKSTO_HILFOJ,
} from "@fundamento/metiejo/gestalten";
import { type Browser, chromium, type Locator, type Page } from "playwright";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const CLI = join(REPO, "packages/cli/dist/index.js");
const LEINWAND = join(REPO, "packages/nodredaktilo/dist/leinwand.js");
const ZIP = join(REPO, "packages/metiejo/test/fixtures/valid/tiparo-056/lato-400-700.zip");
const BAU_BEFEHL =
  "pnpm exec turbo run build --filter=@fundamento/cli --filter=@fundamento/metiejo --filter=@fundamento/nodredaktilo";

/** The viewport of the images of Spec 054, 055 and 056. */
const VIEWPORT = { width: 2100, height: 1250 } as const;
const START_TAKT_MS = 250;
/** An invented brand; the start page derives its identifier from it. */
const MARKE = "lumeto";
const FIKSAJ = ["teksto-ausgangslage", "teksto-markenkern", "teksto-werte"] as const;
const ALDONEBLAJ = [
  ["Zielgruppe", "teksto-zielgruppe"],
  ["Wettbewerb", "teksto-wettbewerb"],
  ["Persönlichkeit", "teksto-persoenlichkeit"],
  ["Tonalität", "teksto-tonalitaet"],
  ["Beispiele", "beispiele"],
  ["Schrift", "schrift"],
] as const;
const BEISPIELE_KANTE = "beispiele.el>marko.en.bildo";
const kanteVonWert = (w: string): string => `teksto-werte.el.${w}>marko.en.teksto`;
/** Writing a hand value to Primär (invented). */
const HAND = "#336699";

class Abbruch extends Error {}

/** Fails the run with a clear message unless `bedingung` holds. */
function pruefe(bedingung: boolean, schritt: string, was: string): asserts bedingung {
  if (!bedingung) throw new Abbruch(`${schritt}: ${was}`);
  console.log(`ok  ${schritt}: ${was}`);
}

// ---------------------------------------------------------------------------------------------
// Test images: horizontal bands of whole colours (the Enportilo measures them exactly)

const CRC = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(bytes: Buffer): number {
  let c = -1;
  for (const b of bytes) c = (CRC[(c ^ b) & 0xff] ?? 0) ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function teil(typ: string, daten: Buffer): Buffer {
  const kopf = Buffer.alloc(8);
  kopf.writeUInt32BE(daten.length, 0);
  kopf.write(typ, 4, "ascii");
  const pruef = Buffer.alloc(4);
  pruef.writeUInt32BE(crc32(Buffer.concat([Buffer.from(typ, "ascii"), daten])), 0);
  return Buffer.concat([kopf, daten, pruef]);
}
const rgb = (hex: string): number[] =>
  [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
/** A 40×40 PNG of bands `[hex, percent]` from the top. */
function baender(baender: readonly (readonly [string, number])[]): Buffer {
  const breite = 40;
  const hoehe = 40;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(breite, 0);
  ihdr.writeUInt32BE(hoehe, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const roh = Buffer.alloc((breite * 4 + 1) * hoehe);
  for (let y = 0; y < hoehe; y++) {
    let summe = 0;
    let farbe = baender[0]?.[0] ?? "#000000";
    for (const [hex, anteil] of baender) {
      summe += anteil;
      if (y < (summe / 100) * hoehe) {
        farbe = hex;
        break;
      }
    }
    for (let x = 0; x < breite; x++)
      roh.set([...rgb(farbe), 255], y * (breite * 4 + 1) + 1 + x * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    teil("IHDR", ihdr),
    teil("IDAT", deflateSync(roh)),
    teil("IEND", Buffer.alloc(0)),
  ]);
}
const BLAU = "#2f5bff";
const BILDER = [
  {
    name: "werkbank-blau.png",
    buffer: baender([
      [BLAU, 70],
      ["#efe6d6", 30],
    ]),
  },
  {
    name: "plakat-papier.png",
    buffer: baender([
      ["#efe6d6", 50],
      ["#d2552c", 30],
      ["#1c1d22", 20],
    ]),
  },
  {
    name: "leuchte-detail.png",
    buffer: baender([
      ["#16235f", 40],
      ["#c6f135", 60],
    ]),
  },
] as const;
const GRUEN = {
  name: "blatt-gruen.png",
  buffer: baender([
    ["#1f8a4c", 90],
    ["#efe6d6", 10],
  ]),
};
const GIF = Buffer.from("GIF89a\u0001\u0000\u0001\u0000\u0000\u0000\u0000;", "latin1");
const FENSTER = baender([
  ["#7a2898", 60],
  ["#fafafa", 40],
]);

// ---------------------------------------------------------------------------------------------
// Processes

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

// ---------------------------------------------------------------------------------------------
// The page

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
const nodo = (seite: Page, id: string): Locator => seite.locator(`[data-nr-nodo="${id}"]`);

async function revDe(seite: Page): Promise<number> {
  return Number(await leinwand(seite).getAttribute("data-nr-rev"));
}

/** Polls `bedingung` (with a frame between tries) until it holds; aborts after `versuche`. */
async function warteBis(
  seite: Page,
  schritt: string,
  was: string,
  bedingung: () => Promise<boolean>,
  versuche = 300,
): Promise<void> {
  for (let i = 0; i < versuche; i++) {
    if (await bedingung()) return;
    await gemalt(seite);
    await warten(20);
  }
  await seite.screenshot({ path: join(tmpdir(), "bilder-056-abbruch.png") });
  throw new Abbruch(`${schritt}: ${was} (nicht eingetreten)`);
}

/** Waits until the Bildo of the newest rev is painted and every preview shows it. */
async function warteVorschau(seite: Page): Promise<void> {
  await seite.waitForFunction(() => {
    const el = document.getElementById("nr-leinwand");
    return (
      el !== null &&
      el.getAttribute("data-nr-rev") === el.getAttribute("data-nr-vorschau-rev") &&
      !el.hasAttribute("data-nr-vorschau-laedt")
    );
  });
  await gemalt(seite);
}

async function laden(seite: Page): Promise<void> {
  await leinwand(seite).and(seite.locator("[data-nr-preta]")).waitFor();
  await warteVorschau(seite);
}

const mitte = async (ziel: Locator): Promise<{ x: number; y: number }> => {
  const rahmen = await ziel.boundingBox();
  if (rahmen === null) throw new Abbruch(`nicht sichtbar: ${ziel.toString()}`);
  return { x: rahmen.x + rahmen.width / 2, y: rahmen.y + rahmen.height / 2 };
};

/** A pointer drag from a port to a port in small steps (React Flow needs moves in between). */
async function stecke(seite: Page, von: Locator, nach: Locator): Promise<void> {
  const a = await mitte(von);
  const b = await mitte(nach);
  await seite.mouse.move(a.x, a.y);
  await seite.mouse.down();
  await seite.mouse.move(b.x + 10, b.y - 6, { steps: 14 });
  await seite.mouse.move(b.x, b.y, { steps: 4 });
  await seite.mouse.up();
  await gemalt(seite);
}

/** Selects an edge by a click on a point of its curve that hits the edge, and presses its „×“. */
async function loese(seite: Page, kante: string): Promise<void> {
  const punkt = await seite.evaluate((id) => {
    const pfad = document.querySelector<SVGPathElement>(
      `.react-flow__edge[data-id="${CSS.escape(id)}"] path.nr-g-kanto`,
    );
    const matrix = pfad?.getScreenCTM();
    if (pfad === null || pfad === undefined || matrix === null || matrix === undefined) return null;
    const laenge = pfad.getTotalLength();
    for (let s = 6; s < laenge - 6; s += 2) {
      const q = new DOMPoint(
        pfad.getPointAtLength(s).x,
        pfad.getPointAtLength(s).y,
      ).matrixTransform(matrix);
      const el = document.elementFromPoint(q.x, q.y);
      if (el?.closest(".react-flow__edge")?.getAttribute("data-id") === id)
        return { x: q.x, y: q.y };
    }
    return null;
  }, kante);
  if (punkt === null) throw new Abbruch(`Kante nicht greifbar: ${kante}`);
  await seite.mouse.click(punkt.x, punkt.y);
  await gemalt(seite);
  await seite.locator(`[data-nr-ligo-forigi="${kante}"]`).click();
  await gemalt(seite);
}

/** A place on the empty stage: the pointer rests there, hovering nothing. */
const RUHEPLATZ = { x: 1312, y: VIEWPORT.height - 12 } as const;

/** Before an image: pointer off every control, every finite animation finished, painted. */
async function ruhig(seite: Page): Promise<void> {
  await seite.mouse.move(RUHEPLATZ.x, RUHEPLATZ.y);
  // No focus ring in an image (a field left by Tab keeps the next one focused).
  await seite.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
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

/** Leaves the focused field (Tab, as a person does): the field saves on leaving. */
async function leereStelle(seite: Page): Promise<void> {
  await seite.keyboard.press("Tab");
  await gemalt(seite);
}

async function einpassen(seite: Page): Promise<void> {
  await seite.locator('[data-nr-zomo="fit"]').click();
  await warten(400);
  await gemalt(seite);
}

const bild = async (seite: Page, ordner: string, datei: string): Promise<void> => {
  await ruhig(seite);
  const pfad = join(ordner, datei);
  await seite.screenshot({ path: pfad });
  console.log(`Bild: ${pfad}`);
};

/** An image of a region around some elements of the page (padding in px). */
async function bildVon(
  seite: Page,
  ordner: string,
  datei: string,
  ziele: readonly Locator[],
  rand = 28,
): Promise<void> {
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
}

// ---------------------------------------------------------------------------------------------
// Teil V and AK-7, measured in the browser

interface Geometrie {
  knoten: string[];
  ueberdeckungen: string[];
  kanten: number;
  durchFremde: string[];
  ohneC: string[];
  eckigePunkte: string[];
  falscheFarbe: string[];
  farbKanten: number;
}

/**
 * AK-7 in screen pixels: node boxes (`getBoundingClientRect`), edge points (`getPointAtLength`
 * every 2 px, mapped by the path's screen matrix), port radii, edge strokes. `farben` maps the id
 * of every colour edge to its source colour as `rgb(r, g, b)`. The ends of an edge are the nodes
 * that hold its two ports.
 */
async function geometrie(seite: Page, farben: Record<string, string>): Promise<Geometrie> {
  return seite.evaluate((farben) => {
    const boxen = [...document.querySelectorAll<HTMLElement>(".react-flow__node")].map((el) => {
      const r = el.getBoundingClientRect();
      return { id: el.dataset.id ?? "", l: r.left, t: r.top, r: r.right, b: r.bottom };
    });
    const ueberdeckungen: string[] = [];
    for (const [i, a] of boxen.entries())
      for (const b of boxen.slice(i + 1))
        if (a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b)
          ueberdeckungen.push(`${a.id}×${b.id}`);
    // The grey role, resolved where the canvas defines it.
    const probe = document.createElement("span");
    probe.style.color = "var(--fm-color-text-muted)";
    document.getElementById("nr-leinwand")?.append(probe);
    const grau = getComputedStyle(probe).color;
    probe.remove();
    const anschluesse = [...document.querySelectorAll<HTMLElement>(".react-flow__handle")];
    const durchFremde: string[] = [];
    const ohneC: string[] = [];
    const falscheFarbe: string[] = [];
    let farbKanten = 0;
    const kanten = [...document.querySelectorAll<HTMLElement>(".react-flow__edge")];
    for (const kante of kanten) {
      const id = kante.dataset.id ?? "";
      const pfad = kante.querySelector<SVGPathElement>("path.nr-g-kanto");
      const matrix = pfad?.getScreenCTM();
      if (pfad === null || pfad === undefined || matrix === null || matrix === undefined) {
        ohneC.push(`${id} (kein Pfad)`);
        continue;
      }
      const [de = "", al = ""] = id.split(">");
      const ende = new Set(
        [de, al].map(
          (port) =>
            anschluesse
              .find((h) => h.dataset.nrAnschluss === port)
              ?.closest<HTMLElement>(".react-flow__node")?.dataset.id ?? port.split(".")[0],
        ),
      );
      const laenge = pfad.getTotalLength();
      for (let s = 0; s <= laenge; s += 2) {
        const p = pfad.getPointAtLength(s);
        const q = new DOMPoint(p.x, p.y).matrixTransform(matrix);
        const box = boxen.find(
          (b) => !ende.has(b.id) && q.x > b.l && q.x < b.r && q.y > b.t && q.y < b.b,
        );
        if (box !== undefined) {
          durchFremde.push(`${id} durch ${box.id} bei (${q.x.toFixed(1)}, ${q.y.toFixed(1)})`);
          break;
        }
      }
      if (!(pfad.getAttribute("d") ?? "").includes("C")) ohneC.push(id);
      const strich = getComputedStyle(pfad).stroke;
      const soll = farben[id];
      if (pfad.getAttribute("data-nr-art") === "farbo") {
        farbKanten++;
        if (soll === undefined || strich !== soll)
          falscheFarbe.push(`${id}: ${strich} statt ${soll}`);
      } else if (strich !== grau) falscheFarbe.push(`${id}: ${strich} statt grau ${grau}`);
    }
    const eckigePunkte = anschluesse
      .filter((h) => h.classList.contains("nr-g-anschluss"))
      .filter((h) => {
        const radius = getComputedStyle(h).borderTopLeftRadius;
        const zahl = Number.parseFloat(radius);
        return radius.endsWith("%") ? zahl < 50 : zahl < h.offsetWidth / 2 - 0.5;
      })
      .map((h) => `${h.dataset.nrAnschluss}: ${getComputedStyle(h).borderTopLeftRadius}`);
    return {
      knoten: boxen.map((b) => b.id),
      ueberdeckungen,
      kanten: kanten.length,
      durchFremde,
      ohneC,
      eckigePunkte,
      falscheFarbe,
      farbKanten,
    };
  }, farben);
}

/** The colour edges of the Bildo with their colour as the browser writes it (`rgb(r, g, b)`). */
async function farbKantenDe(basis: string): Promise<Record<string, string>> {
  const antwort = (await (await fetch(`${basis}/api/leinwand?marko=${MARKE}`)).json()) as {
    ligoj: { id: string; art: string; hex?: string }[];
  };
  return Object.fromEntries(
    antwort.ligoj
      .filter((l) => l.art === "farbo" && l.hex !== undefined)
      .map((l) => [l.id, `rgb(${rgb(l.hex ?? "").join(", ")})`]),
  );
}

async function pruefeGeometrie(
  seite: Page,
  basis: string,
  schritt: string,
  erwartet: readonly string[],
): Promise<void> {
  const geo = await geometrie(seite, await farbKantenDe(basis));
  console.log(
    `${schritt}: ${geo.knoten.length} Knoten, ${geo.kanten} Kanten, davon ${geo.farbKanten} Farbkanten`,
  );
  pruefe(
    erwartet.every((id) => geo.knoten.includes(id)),
    schritt,
    `Knoten da (${erwartet.join(", ")})`,
  );
  pruefe(geo.kanten > 0, schritt, "Kanten gezeichnet");
  pruefe(
    geo.ueberdeckungen.length === 0,
    schritt,
    `Knotenboxen paarweise ohne Schnitt (${geo.ueberdeckungen.join(", ")})`,
  );
  pruefe(
    geo.durchFremde.length === 0,
    schritt,
    `keine Kante durch eine fremde Box (${geo.durchFremde.join("; ")})`,
  );
  pruefe(geo.ohneC.length === 0, schritt, `jedes d enthält C (${geo.ohneC.join(", ")})`);
  pruefe(
    geo.eckigePunkte.length === 0,
    schritt,
    `Anschlüsse rund (${geo.eckigePunkte.join(", ")})`,
  );
  pruefe(
    geo.falscheFarbe.length === 0 && geo.farbKanten > 0,
    schritt,
    `Farbkanten in ihrer Farbe, alle anderen in der grauen Rolle (${geo.falscheFarbe.join("; ")})`,
  );
}

interface Hoehe {
  id: string;
  gemessen: number;
  hoechstens: number;
}

/** The rendered heights in flow units (`offsetHeight` is not scaled by the zoom) against §2.3. */
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

async function pruefeHoehen(seite: Page, schritt: string, nur?: readonly string[]): Promise<void> {
  const alle = (await hoehen(seite)).filter((h) => nur === undefined || nur.includes(h.id));
  console.log(`Höhen ${schritt} (gemessen/höchstens): ${hoehenText(alle)}`);
  const zuHoch = alle.filter((h) => h.gemessen > h.hoechstens);
  pruefe(zuHoch.length === 0, schritt, `keine Höhe über ihrem Maximum (${hoehenText(zuHoch)})`);
}

// ---------------------------------------------------------------------------------------------
// The server's view

interface Stand {
  primaer: { wert: string | undefined; stato: string };
  akzent: { wert: string | undefined; stato: string };
  knoten: { id: string; inhalt?: Record<string, unknown> }[];
  geloest: string[];
}
async function standDe(basis: string): Promise<Stand> {
  const a = (await (await fetch(`${basis}/api/leinwand?marko=${MARKE}`)).json()) as {
    nodoj: { id: string; wert?: string; stato?: string }[];
    stato: { knoten: Stand["knoten"]; geloest?: string[] } | null;
  };
  const farbe = (id: string) => {
    const n = a.nodoj.find((x) => x.id === id);
    return { wert: n?.wert?.toLowerCase(), stato: n?.stato ?? "" };
  };
  return {
    primaer: farbe("farbo-primaer"),
    akzent: farbe("farbo-akzent"),
    knoten: a.stato?.knoten ?? [],
    geloest: a.stato?.geloest ?? [],
  };
}
const inhaltDe = (s: Stand, id: string): Record<string, unknown> | undefined =>
  s.knoten.find((k) => k.id === id)?.inhalt;

// ---------------------------------------------------------------------------------------------

/** Types into a field of a node and leaves it (Tab), as a person does. */
async function schreibe(seite: Page, feld: Locator, wort: string): Promise<void> {
  await feld.click();
  await seite.keyboard.type(wort);
}

async function wertSetzen(seite: Page, wort: string): Promise<void> {
  const feld = nodo(seite, "teksto-werte").locator('fm-kampo[data-nr-teksto-linio="wert"] input');
  await feld.click();
  await seite.keyboard.type(wort);
  await seite.keyboard.press("Enter");
  await gemalt(seite);
}

const markoWerte = (seite: Page): Promise<string[]> =>
  seite.locator("[data-nr-marko-wert]").allTextContents();

/** The files dropped onto Beispiele (one DataTransfer, as a person drags them in). */
async function ziehen(
  seite: Page,
  dateien: readonly { name: string; buffer: Buffer; typ: string }[],
) {
  await seite.evaluate(
    (dateien) => {
      const dt = new DataTransfer();
      for (const d of dateien)
        dt.items.add(
          new File([Uint8Array.from(atob(d.b64), (c) => c.charCodeAt(0))], d.name, { type: d.typ }),
        );
      const ziel = document.querySelector('[data-nr-nodo="beispiele"] [data-nr-beispiele]');
      for (const typ of ["dragenter", "dragover", "drop"])
        ziel?.dispatchEvent(
          new DragEvent(typ, { bubbles: true, cancelable: true, dataTransfer: dt }),
        );
    },
    dateien.map((d) => ({ name: d.name, b64: d.buffer.toString("base64"), typ: d.typ })),
  );
}

async function lauf(
  browser: Browser,
  basis: string,
  ordner: string,
  bildAdresse: string,
  arbeit: string,
): Promise<void> {
  const kontext = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const cdn: string[] = [];
  const fremde: string[] = [];
  await kontext.route(
    (u) => !u.href.startsWith(basis) && u.protocol !== "data:" && u.protocol !== "blob:",
    (r) => {
      const u = r.request().url();
      (u.includes("jsdelivr") || u.includes("fontsource") ? cdn : fremde).push(u);
      return r.abort();
    },
  );
  const seite = await kontext.newPage();
  const fehler: string[] = [];
  seite.on("pageerror", (f) => fehler.push(f.message));
  seite.on("console", (m) => {
    // Aborted CDN fonts of the preview and the expected 422 of an unreadable file are no failure.
    if (m.type() === "error" && !/net::ERR_FAILED|status of 422/.test(m.text()))
      fehler.push(m.text());
  });
  const tiparoRoute: string[] = [];
  seite.on("response", (r) => {
    if (r.url().includes("/api/tiparo/"))
      tiparoRoute.push(`${r.status()} ${new URL(r.url()).pathname}`);
  });
  const pruefeSeite = (schritt: string) =>
    pruefe(
      fehler.length === 0,
      schritt,
      `keine Seiten- oder Konsolenfehler (${fehler.join(" | ")})`,
    );
  const ohneNeuladen = async (schritt: string) =>
    pruefe(
      (await seite.evaluate(() => (window as { __bilder056?: number }).__bilder056)) === 1,
      schritt,
      "ohne Neuladen der Seite",
    );
  const stand = () => standDe(basis);

  try {
    // ── Ablauf 1: a new brand; AK-7 at the start layout ──────────────────────────────────────
    await seite.goto(`${basis}/`);
    await seite.locator('fm-kampo[name="name"] input').fill(MARKE);
    await seite.locator('fm-butono[data-mt-ziel="leinwand"]').click();
    await seite.waitForURL(`${basis}/marko/${MARKE}/grafeo`);
    await laden(seite);
    await seite.evaluate(() => {
      (window as { __bilder056?: number }).__bilder056 = 1;
    });
    // Every `var(--fm-…)` the canvas sources read names a value of the Belegung (an unknown name
    // silently falls back to the inherited value).
    const gelesen = [
      ...new Set(
        quellenDe(join(REPO, "packages/nodredaktilo/src")).flatMap((kodo) =>
          [...kodo.matchAll(/var\((--fm-[a-z0-9-]*[a-z0-9])(?![\w$-])/g)].map((m) => m[1] ?? ""),
        ),
      ),
    ];
    const unbekannt = await seite.evaluate((namen) => {
      const stil = getComputedStyle(document.getElementById("nr-leinwand") ?? document.body);
      return namen.filter((n) => stil.getPropertyValue(n).trim() === "");
    }, gelesen);
    pruefe(
      unbekannt.length === 0,
      "Teil V",
      `jede gelesene --fm-Rolle hat einen Wert (${gelesen.length} Namen; unbekannt: ${unbekannt.join(", ")})`,
    );
    const boxDe = async (id: string) => {
      const b = await knoten(seite, id).boundingBox();
      if (b === null) throw new Abbruch(`nicht sichtbar: ${id}`);
      return b;
    };
    const marke = await boxDe("marko");
    for (const id of FIKSAJ) {
      const b = await boxDe(id);
      pruefe(b.x + b.width < marke.x, "Ablauf 1", `${id} links der Marke`);
      pruefe(
        (await nodo(seite, id).getAttribute("data-nr-leer")) !== null &&
          (await nodo(seite, id).evaluate((n) => getComputedStyle(n).borderTopStyle)) === "dashed",
        "Ablauf 1",
        `${id} leer, gestrichelt`,
      );
    }
    pruefe(
      (await nodo(seite, "teksto-ausgangslage").locator("textarea").getAttribute("placeholder")) ===
        TEKSTO_HILFOJ["teksto-ausgangslage"] &&
        (await nodo(seite, "teksto-markenkern")
          .locator('textarea[data-nr-teksto-kampo="zweck"]')
          .getAttribute("placeholder")) === TEKSTO_HILFOJ["teksto-markenkern"] &&
        (await nodo(seite, "teksto-werte")
          .locator('[data-nr-teksto-satz="hilfe"]')
          .textContent()) === TEKSTO_HILFOJ["teksto-werte"],
      "Ablauf 1",
      "jeder Knoten mit seiner Frage",
    );
    const blass = await seite.evaluate(() =>
      ["teksto-ausgangslage.el>marko.en.teksto", "teksto-markenkern.el>marko.en.teksto"].map(
        (id) =>
          document
            .querySelector(`.react-flow__edge[data-id="${id}"] path.nr-g-kanto`)
            ?.hasAttribute("data-nr-matt") === true,
      ),
    );
    pruefe(blass.every(Boolean), "Ablauf 1", "blasse Verbindungen in die Marke");
    await pruefeGeometrie(seite, basis, "AK-7 Start", ["marko", ...FIKSAJ]);
    await pruefeHoehen(seite, "Start");
    pruefeSeite("Ablauf 1");
    await bild(seite, ordner, "01-neue-marke.png");

    // Ablauf 1, step 3: Ausgangslage and Markenkern; the Marke shows the Kern (AK 15).
    await schreibe(
      seite,
      nodo(seite, "teksto-ausgangslage").locator("textarea"),
      "lumeto baut Leuchten für Werkstätten und Ateliers. Jetzt kommt der eigene Shop.",
    );
    await schreibe(
      seite,
      nodo(seite, "teksto-markenkern").locator('textarea[data-nr-teksto-kampo="zweck"]'),
      "Gutes Licht dort, wo mit den Händen gearbeitet wird.",
    );
    await schreibe(
      seite,
      nodo(seite, "teksto-markenkern").locator('textarea[data-nr-teksto-kampo="versprechen"]'),
      "Jede Leuchte lässt sich reparieren, ein Leben lang.",
    );
    await leereStelle(seite);
    await warteBis(seite, "Ablauf 1", "Kern gespeichert", async () => {
      const k = inhaltDe(await stand(), "teksto-markenkern");
      return typeof k?.versprechen === "string";
    });
    pruefe(
      /gespeichert \d\d:\d\d/.test(
        (await seite.locator("[data-nr-gespeichert]").textContent()) ?? "",
      ),
      "Ablauf 1",
      "„gespeichert HH:MM“",
    );
    pruefe(
      (await nodo(seite, "teksto-markenkern").getAttribute("data-nr-leer")) === null &&
        (await nodo(seite, "teksto-ausgangslage").getAttribute("data-nr-leer")) === null,
      "Ablauf 1",
      "Ausgangslage und Markenkern fest",
    );
    const kern = (await seite.locator('[data-nr-marko-teil="kern"]').textContent()) ?? "";
    pruefe(
      kern.includes("Gutes Licht") && kern.includes("Jede Leuchte"),
      "AK 15",
      "die Marke zeigt Zweck und Versprechen",
    );
    // Ablauf 1, step 4: three values, each with its own port and edge.
    for (const wort of ["nahbar", "mutig", "gründlich"]) await wertSetzen(seite, wort);
    await warteBis(seite, "Ablauf 1", "drei Werte gespeichert", async () => {
      const w = inhaltDe(await stand(), "teksto-werte")?.werte;
      return Array.isArray(w) && w.length === 3;
    });
    for (const w of ["w1", "w2", "w3"])
      pruefe(
        (await seite.locator(`[data-nr-anschluss="teksto-werte.el.${w}"]`).count()) === 1 &&
          (await seite.locator(`.react-flow__edge[data-id="${kanteVonWert(w)}"]`).count()) === 1,
        "Ablauf 1",
        `${w}: eigener Anschluss, eigene Verbindung`,
      );
    pruefe(
      (await markoWerte(seite)).join(",") === "nahbar,mutig,gründlich",
      "AK 15",
      "die Marke zeigt die drei Werte",
    );
    // AK 15: a change of the Kern stands in the Marke after leaving the field, without reload.
    const zweck = nodo(seite, "teksto-markenkern").locator(
      'textarea[data-nr-teksto-kampo="zweck"]',
    );
    await zweck.click();
    await zweck.fill(`${await zweck.inputValue()} Jeden Tag.`);
    await leereStelle(seite);
    await warteBis(seite, "AK 15", "geänderter Kern gespeichert", async () =>
      String(inhaltDe(await stand(), "teksto-markenkern")?.zweck ?? "").endsWith("Jeden Tag."),
    );
    pruefe(
      ((await seite.locator('[data-nr-marko-teil="kern"]').textContent()) ?? "").includes(
        "Jeden Tag.",
      ),
      "AK 15",
      "geänderter Kern im Marke-Knoten",
    );
    await ohneNeuladen("AK 15");
    pruefeSeite("Ablauf 1");
    await bild(seite, ordner, "02-kern-und-werte.png");

    // Five values: the field goes, the calm sentence stands (AK 5); then back to three.
    for (const wort of ["offen", "klar"]) await wertSetzen(seite, wort);
    const werteKnoto = nodo(seite, "teksto-werte");
    await warteBis(
      seite,
      "AK 5",
      "fünf Werte",
      async () => (await werteKnoto.locator("[data-nr-wert]").count()) === 5,
    );
    pruefe(
      (await werteKnoto.locator('fm-kampo[data-nr-teksto-linio="wert"]').count()) === 0 &&
        (await werteKnoto.locator('[data-nr-teksto-satz="kvin"]').textContent()) ===
          FUENF_WERTE_SATZ,
      "AK 5",
      "kein Feld mehr, der ruhige Satz",
    );
    await pruefeHoehen(seite, "fünf Werte", ["teksto-werte", "marko"]);
    await bildVon(seite, ordner, "03-fuenf-werte.png", [
      knoten(seite, "teksto-werte"),
      knoten(seite, "marko"),
    ]);
    for (const w of ["w5", "w4"]) {
      await werteKnoto.locator(`[data-nr-teksto-forigi="${w}"]`).click();
      await gemalt(seite);
    }
    await warteBis(seite, "AK 5", "zurück auf drei Werte", async () => {
      const w = inhaltDe(await stand(), "teksto-werte")?.werte;
      return Array.isArray(w) && w.length === 3;
    });

    // ── The six added nodes: AK-7 at their start places ─────────────────────────────────────
    for (const [nomo] of ALDONEBLAJ) {
      await seite.locator("[data-nr-aldoni]").click();
      await seite.locator(`[data-nr-aldoneblo="${nomo}"]`).click();
      await gemalt(seite);
    }
    for (const [, id] of ALDONEBLAJ) await knoten(seite, id).waitFor();
    await einpassen(seite);
    await pruefeGeometrie(seite, basis, "AK-7 mit allen sechs", [
      "marko",
      ...FIKSAJ,
      ...ALDONEBLAJ.map(([, id]) => id),
    ]);
    pruefe(
      (await seite.locator(`.react-flow__edge[data-id="${BEISPIELE_KANTE}"]`).count()) === 1 &&
        (await seite
          .locator('.react-flow__edge[data-id="schrift.el>vorschau-hell.en.tiparo"]')
          .count()) === 1,
      "Ablauf 2/4",
      "Beispiele → Marke, Schrift → Vorschau",
    );
    await pruefeHoehen(seite, "alle sechs angelegt");

    // The four added text nodes filled (AK 6).
    const zielgruppe = nodo(seite, "teksto-zielgruppe");
    for (const [feld, wort] of [
      ["wer", "Menschen, die mit den Händen arbeiten: Tischler, Goldschmiede, Uhrmacher."],
      ["sorge", "Schlechtes Licht am Abend, Schatten auf dem Werkstück."],
      ["vertrauen", "Reparierbarkeit und ehrliche Auskunft."],
    ] as const)
      await schreibe(seite, zielgruppe.locator(`textarea[data-nr-teksto-kampo="${feld}"]`), wort);
    const wettbewerb = nodo(seite, "teksto-wettbewerb");
    for (const [i, [name, adresse]] of [
      ["Leuchtwerk Berlin GmbH", "https://www.leuchtwerk-berlin.example/ueber-uns"],
      ["Strahl", ""],
      ["Werklicht", "werklicht.example"],
    ].entries()) {
      await schreibe(
        seite,
        wettbewerb.locator(
          `[data-nr-wettbewerb="${i}"] fm-kampo[data-nr-teksto-linio="name"] input`,
        ),
        name ?? "",
      );
      if (adresse !== undefined && adresse !== "")
        await schreibe(
          seite,
          wettbewerb.locator(
            `[data-nr-wettbewerb="${i}"] fm-kampo[data-nr-teksto-linio="adresse"] input`,
          ),
          adresse,
        );
    }
    await leereStelle(seite);
    // QA run 1: a name of 22 characters stands whole in its field, the address placeholder is not
    // cut (the Wettbewerb shows its own content, AK 6).
    const zeileFeld = (i: number, linio: "name" | "adresse") =>
      wettbewerb.locator(
        `[data-nr-wettbewerb="${i}"] fm-kampo[data-nr-teksto-linio="${linio}"] input`,
      );
    const nameFeld = await zeileFeld(0, "name").evaluate((e) => ({
      wert: (e as HTMLInputElement).value,
      scroll: e.scrollWidth,
      breite: e.clientWidth,
    }));
    pruefe(
      nameFeld.wert.length === 22 && nameFeld.scroll <= nameFeld.breite,
      "AK 6",
      `Wettbewerb: „${nameFeld.wert}“ ganz sichtbar (${nameFeld.scroll}/${nameFeld.breite} px)`,
    );
    const platzhalter = await zeileFeld(1, "adresse").evaluate((e) => {
      // The placeholder measured as a value (setting `value` fires no event, nothing is stored).
      const feld = e as HTMLInputElement;
      const vorher = feld.value;
      feld.value = feld.placeholder;
      const masse = { text: feld.placeholder, scroll: feld.scrollWidth, breite: feld.clientWidth };
      feld.value = vorher;
      return masse;
    });
    pruefe(
      platzhalter.text !== "" && platzhalter.scroll <= platzhalter.breite,
      "AK 6",
      `Wettbewerb: Platzhalter „${platzhalter.text}“ nicht abgeschnitten (${platzhalter.scroll}/${platzhalter.breite} px)`,
    );
    const persoenlichkeit = nodo(seite, "teksto-persoenlichkeit").locator(
      'fm-kampo[data-nr-teksto-linio="eigenschaft"] input',
    );
    for (const wort of ["ruhig", "genau", "warm"]) {
      await persoenlichkeit.click();
      await seite.keyboard.type(wort);
      await seite.keyboard.press("Enter");
      await gemalt(seite);
    }
    const ton = nodo(seite, "teksto-tonalitaet");
    for (const [id, stellung] of [
      ["foermlich-locker", 1],
      ["sachlich-verspielt", -2],
      ["ruhig-lebhaft", 0],
      ["bescheiden-bestimmt", 2],
      ["klassisch-modern", 1],
      ["warm-kuehl", -1],
    ] as const) {
      const r = await ton.locator(`[data-nr-ton="${id}"]`).boundingBox();
      if (r === null) throw new Abbruch(`Regler nicht sichtbar: ${id}`);
      await seite.mouse.click(r.x + 6 + ((r.width - 12) * (stellung + 2)) / 4, r.y + r.height / 2);
      await gemalt(seite);
    }
    await leereStelle(seite);
    await warteBis(seite, "AK 6", "vier Text-Knoten gespeichert", async () => {
      const s = await stand();
      const z = inhaltDe(s, "teksto-zielgruppe");
      const w = inhaltDe(s, "teksto-wettbewerb")?.liste;
      const p = inhaltDe(s, "teksto-persoenlichkeit")?.eigenschaften;
      const t = inhaltDe(s, "teksto-tonalitaet");
      return (
        typeof z?.vertrauen === "string" &&
        Array.isArray(w) &&
        w.length === 3 &&
        Array.isArray(p) &&
        p.length === 3 &&
        t !== undefined &&
        Object.keys(t).length === 6
      );
    });
    for (const id of [
      "teksto-zielgruppe",
      "teksto-wettbewerb",
      "teksto-persoenlichkeit",
      "teksto-tonalitaet",
    ])
      pruefe(
        (await nodo(seite, id).getAttribute("data-nr-leer")) === null,
        "AK 6",
        `${id} gefüllt, fest`,
      );
    await pruefeHoehen(seite, "Text-Knoten gefüllt", [
      "teksto-zielgruppe",
      "teksto-wettbewerb",
      "teksto-persoenlichkeit",
      "teksto-tonalitaet",
      "marko",
    ]);
    pruefeSeite("AK 6");
    await einpassen(seite);
    await bild(seite, ordner, "04-text-knoten-alle.png");

    // ── Ablauf 2: three images; Primär follows, switches, is taken over (AK 1, 17) ───────────
    const beispiele = nodo(seite, "beispiele");
    pruefe(
      ((await beispiele.textContent()) ?? "").includes(BEISPIELE_HILFE),
      "Ablauf 2",
      "Hilfe im Knoten",
    );
    pruefe((await stand()).primaer.stato === "startwert", "Ablauf 2", "Primär hat den Startwert");
    await ziehen(seite, [
      ...BILDER.map((b) => ({ ...b, typ: "image/png" })),
      { name: "gruss.gif", buffer: GIF, typ: "image/gif" },
    ]);
    await seite.locator("[data-nr-beispiele-meldoj]").waitFor();
    await warteBis(
      seite,
      "Ablauf 2",
      "Primär folgt",
      async () => (await stand()).primaer.stato === "aus-material",
    );
    pruefe(
      (await seite.locator("[data-nr-beispiel] img").count()) === 3,
      "Ablauf 2",
      "drei Vorschaubilder",
    );
    pruefe(
      ((await seite.locator("[data-nr-beispiele-meldoj]").textContent()) ?? "").includes(
        "„gruss.gif“: Diese Datei kann Fundamento nicht lesen",
      ) && !existsSync(join(arbeit, MARKE, "materialo", "gruss.gif")),
      "AK 10",
      "unlesbare Datei ruhig am Knoten",
    );
    const zeilen = await seite.locator("[data-nr-erkannt-farbo]").evaluateAll((es) =>
      es.map((e) => ({
        hex: (e as HTMLElement).dataset.nrErkanntFarbo ?? "",
        text: e.textContent ?? "",
      })),
    );
    console.log(`Erkannt: ${zeilen.map((z) => z.text).join(" | ")}`);
    pruefe(
      zeilen.length > 0 &&
        zeilen.length <= 8 &&
        zeilen.every((z) => /\d+ %/.test(z.text) && /(hell|dunkel) · (bunt|unbunt)/.test(z.text)),
      "Ablauf 2",
      "Farbfelder mit Anteil, hell/dunkel, bunt/unbunt",
    );
    let s = await stand();
    pruefe(
      s.primaer.wert === BLAU,
      "AK 17",
      `die größte bunte Farbe wird Primär (${s.primaer.wert})`,
    );
    pruefe(
      (await seite
        .locator(`[data-nr-erkannt-farbo="${BLAU}"][data-nr-erkannt-primaer]`)
        .count()) === 1 &&
        (await seite.locator("[data-nr-folgo]").textContent()) === FOLGO_SAETZE.folgt,
      "Ablauf 2",
      "das Feld trägt „Primär“, „Primär folgt den Beispielen.“",
    );
    pruefe(
      (await knoten(seite, "farbo-primaer")
        .locator("[data-nr-farbo-stato]")
        .getAttribute("data-nr-farbo-stato")) === "aus-material",
      "Ablauf 2",
      "Farbknoten Primär „aus Material“",
    );
    await warteVorschau(seite);
    pruefe(
      (await seite.locator('[data-nr-marko-teil="beispiele"]').count()) === 1,
      "AK 15",
      "die Marke zeigt die Farben der Beispiele",
    );
    await ohneNeuladen("Ablauf 2");
    pruefeSeite("Ablauf 2");
    await bildVon(seite, ordner, "05-beispiele-erkannt.png", [
      knoten(seite, "beispiele"),
      knoten(seite, "marko"),
      knoten(seite, "farbo-primaer"),
    ]);
    // Ablauf 2, step 5: the blue image goes; Primär changes to the now largest colourful colour.
    await seite.locator('[data-nr-beispiel="werkbank-blau.png"]').hover();
    await seite.locator('[data-nr-beispiel-forigi="werkbank-blau.png"]').click();
    await warteBis(seite, "AK 17", "Primär wechselt", async () => {
      const p = (await stand()).primaer;
      return p.wert !== BLAU && p.stato === "aus-material";
    });
    s = await stand();
    pruefe(true, "AK 17", `ein anderes Bild ändert Primär (${s.primaer.wert})`);
    // Ablauf 2, step 6: another field „als Primär übernehmen“.
    const andere = await seite.locator("[data-nr-erkannt-farbo]").evaluateAll(
      (es, jetzt) =>
        es
          .map((e) => ({
            hex: (e as HTMLElement).dataset.nrErkanntFarbo ?? "",
            text: e.textContent ?? "",
          }))
          .filter((z) => z.hex !== jetzt && z.text.includes("· bunt"))
          .map((z) => z.hex),
      s.primaer.wert,
    );
    const anderes = andere[0];
    if (anderes === undefined) throw new Abbruch("Ablauf 2: kein anderes buntes Feld");
    await seite.locator(`[data-nr-erkannt-farbo="${anderes}"] button`).first().click();
    await gemalt(seite);
    await seite
      .locator(`[data-nr-erkannt-farbo="${anderes}"] [data-nr-uebernehmen="primaer"]`)
      .click();
    await warteBis(
      seite,
      "Ablauf 2",
      "übernommen",
      async () => (await stand()).primaer.wert === anderes,
    );
    await warteBis(
      seite,
      "Ablauf 2",
      "Zeile „Primär folgt nicht.“",
      async () =>
        ((await seite.locator("[data-nr-folgo]").textContent()) ?? "").startsWith(
          FOLGO_SAETZE["folgt-nicht"],
        ) && (await seite.locator("[data-nr-folgen-lassen]").count()) === 1,
    );
    await warteVorschau(seite);
    pruefe(
      (await stand()).primaer.stato === "aus-material" &&
        (await seite
          .locator(`[data-nr-erkannt-farbo="${anderes}"][data-nr-erkannt-primaer]`)
          .count()) === 1,
      "Ablauf 2",
      `„als Primär übernehmen“ ${anderes}, „Primär folgt nicht.“ mit „folgen lassen“, Vorschau auf neuem rev`,
    );
    const paletteVorher = await knoten(seite, "paletro").innerHTML();
    pruefeSeite("Ablauf 2");
    await bild(seite, ordner, "06-farbe-uebernommen.png");
    // AK 17: a new image no longer changes Primär; „folgen lassen“ follows again; a hand value ends it.
    await seite
      .locator("[data-nr-beispiele-dosieroj]")
      .setInputFiles([{ ...GRUEN, mimeType: "image/png" }]);
    await seite.locator('[data-nr-beispiel="blatt-gruen.png"] img').waitFor();
    await warten(600);
    pruefe(
      (await stand()).primaer.wert === anderes,
      "AK 17",
      "neues Bild ändert Primär nicht mehr",
    );
    await seite.locator("[data-nr-folgen-lassen]").click();
    await warteBis(seite, "AK 17", "„folgen lassen“", async () => {
      const p = (await stand()).primaer;
      return p.wert !== anderes && p.stato === "aus-material";
    });
    pruefe(
      (await seite.locator("[data-nr-folgo]").textContent()) === FOLGO_SAETZE.folgt,
      "AK 17",
      `„folgen lassen“: Primär folgt wieder (${(await stand()).primaer.wert})`,
    );
    pruefe(
      (await knoten(seite, "paletro").innerHTML()) !== paletteVorher,
      "Ablauf 2",
      "Palette folgt ohne Neuladen",
    );
    const hand = seite.locator('[data-nr-farbo-kampo="primaer"] input');
    await hand.fill(HAND);
    await hand.press("Enter");
    await warteBis(
      seite,
      "AK 17",
      "Farbe von Hand",
      async () => (await stand()).primaer.wert === HAND,
    );
    await warteBis(seite, "AK 17", "Zeile nach Hand", async () =>
      ((await seite.locator("[data-nr-folgo]").textContent()) ?? "").startsWith(
        FOLGO_SAETZE["folgt-nicht"],
      ),
    );
    pruefe(
      (await stand()).primaer.stato === "von-hand",
      "AK 17",
      "eine Farbe von Hand beendet das Folgen",
    );

    // ── Ablauf 3: a board link and an image address (AK 9) ──────────────────────────────────
    const link = seite.locator("[data-nr-beispiele-link] input");
    await link.fill("https://www.pinterest.invalid/lumeto/werkstatt/");
    await seite.locator("[data-nr-beispiele-ligi]").click();
    await seite.locator("[data-nr-verweis]").first().waitFor();
    pruefe(
      ((await seite.locator("[data-nr-verweis]").first().textContent()) ?? "").includes(
        PINTEREST_SATZ,
      ),
      "AK 9",
      "der Link steht als Verweis mit dem Satz",
    );
    await link.fill(bildAdresse);
    await link.press("Enter");
    await seite.locator('[data-nr-beispiel="fenster.png"] img').waitFor();
    pruefe(true, "AK 9", "eine direkte Bildadresse wird geladen und gezeigt");
    pruefeSeite("Ablauf 3");
    await bildVon(seite, ordner, "07-pinterest-verweis.png", [knoten(seite, "beispiele")]);

    // ── Ablauf 4: Schrift aus Fontsource (AK 1) ─────────────────────────────────────────────
    const schrift = nodo(seite, "schrift");
    await schrift.locator('[data-nr-schrift-rolle="display"]').click();
    await schrift.locator("[data-nr-schrift-suche] input").fill("frau");
    await schrift.locator('[data-nr-schrift-art="serif"]').click();
    await schrift.locator('[data-nr-schrift-treffer="fraunces"]').waitFor();
    const treffer = await schrift.locator("[data-nr-schrift-treffer]").allTextContents();
    pruefe(
      treffer.length > 0 &&
        treffer.every((t) => t.includes("Serif")) &&
        treffer.some((t) => t.includes("OFL")),
      "Ablauf 4",
      `Treffer nur Serif, mit Familie, Art, Lizenz (${treffer.join(" | ")})`,
    );
    await schrift.locator('[data-nr-schrift-treffer="fraunces"]').click();
    await schrift.locator('[data-nr-schrift-familie="display"]', { hasText: "Fraunces" }).waitFor();
    await schrift.locator('[data-nr-schrift-rolle="body"]').click();
    await schrift.locator("[data-nr-schrift-suche] input").fill("Inter");
    await schrift.locator('[data-nr-schrift-treffer="inter"]').click();
    await schrift.locator('[data-nr-schrift-familie="body"]', { hasText: "Inter" }).waitFor();
    await seite.waitForFunction(
      () =>
        ["Fraunces", "Inter"].every((f) =>
          [...document.fonts].some(
            (x) => x.family.replace(/"/g, "") === f && x.status === "loaded",
          ),
        ),
      null,
      { timeout: 120_000 },
    );
    const stil = (sel: string, prop: "fontFamily" | "fontSize") =>
      schrift
        .locator(sel)
        .first()
        .evaluate((e, p) => getComputedStyle(e)[p], prop);
    pruefe(
      (await stil("[data-nr-schrift-aa]", "fontFamily")).startsWith("Fraunces") &&
        (await stil('[data-nr-schrift-zeile="display"]', "fontFamily")).startsWith("Fraunces") &&
        (await stil('[data-nr-schrift-zeile="body"]', "fontFamily")).startsWith("Inter"),
      "Ablauf 4",
      "„Aa“ und Zeile 1 in Fraunces, Zeile 2 in Inter, beide geladen",
    );
    pruefe(
      tiparoRoute.some((a) => /^200 \/api\/tiparo\/fraunces\/.+\.woff2$/.test(a)) &&
        tiparoRoute.some((a) => /^200 \/api\/tiparo\/inter\/.+\.woff2$/.test(a)),
      "Ablauf 4",
      "die Schriftdateien kommen über die eigene Route",
    );
    await warteVorschau(seite);
    const vorschauSchrift = () =>
      seite.evaluate(() => {
        const rahmen =
          document.querySelector<HTMLIFrameElement>(
            '[data-nr-vorschau-kadro="vorschau-hell"] iframe[data-nr-vorschau-rahmen="gezeigt"]',
          ) ??
          document.querySelector<HTMLIFrameElement>(
            '[data-nr-vorschau-kadro="vorschau-hell"] iframe',
          );
        const d = rahmen?.contentDocument;
        if (d === null || d === undefined) return { familien: [] as string[], groessen: "" };
        const els = [...d.querySelectorAll("body *")];
        return {
          familien: [...new Set(els.map((e) => getComputedStyle(e).fontFamily))],
          groessen: els
            .filter((e) => /^H[1-3]$/.test(e.tagName))
            .map((e) => getComputedStyle(e).fontSize)
            .join(","),
        };
      });
    await warteBis(seite, "Ablauf 4", "Vorschau mit beiden Schriften", async () => {
      const v = await vorschauSchrift();
      return (
        v.familien.some((f) => f.includes("Fraunces")) &&
        v.familien.some((f) => f.includes("Inter"))
      );
    });
    pruefe(true, "AK 1", "die Vorschau folgt ohne Neuladen (Fraunces und Inter)");
    const vorZeile = await stil('[data-nr-schrift-zeile="display"]', "fontSize");
    const vorVorschau = (await vorschauSchrift()).groessen;
    const revVor = await revDe(seite);
    const skala = schrift.locator('[data-nr-schrift-regler="schrift.skala"] #thumb-start');
    await skala.focus();
    await skala.press("End");
    await warteBis(
      seite,
      "Ablauf 4",
      "Skala geschrieben",
      async () => (await revDe(seite)) > revVor,
    );
    await warteVorschau(seite);
    await warteBis(
      seite,
      "Ablauf 4",
      "Überschrift folgt",
      async () =>
        (await stil('[data-nr-schrift-zeile="display"]', "fontSize")) !== vorZeile &&
        (await vorschauSchrift()).groessen !== vorVorschau,
    );
    pruefe(true, "Ablauf 4", "der Regler Skala verändert die Überschrift in Knoten und Vorschau");
    await pruefeHoehen(seite, "Schrift, Skala am Ende", ["schrift"]);
    await ohneNeuladen("Ablauf 4");
    pruefeSeite("Ablauf 4");
    await bildVon(seite, ordner, "08-schrift-fontsource.png", [
      knoten(seite, "schrift"),
      knoten(seite, "vorschau-hell"),
    ]);
    for (const pfad of ["schrift.groesse", "schrift.gewicht"]) {
      const r0 = await revDe(seite);
      const griff = schrift.locator(`[data-nr-schrift-regler="${pfad}"] #thumb-start`);
      await griff.focus();
      await griff.press("End");
      await warteBis(
        seite,
        "Ablauf 4",
        `${pfad} geschrieben`,
        async () => (await revDe(seite)) > r0,
      );
    }
    await gemalt(seite);
    await pruefeHoehen(seite, "Schrift, alle Regler am Ende", ["schrift"]);

    // ── Ablauf 5: an own font from a ZIP (AK 3, 8) ──────────────────────────────────────────
    await schrift.locator("[data-nr-eigene-auf]").click();
    await gemalt(seite);
    pruefe(
      JSON.stringify(await schrift.locator("[data-nr-eigene-saetze] li").allTextContents()) ===
        JSON.stringify(EIGENE_SCHRIFT_SAETZE),
      "Ablauf 5",
      "die vier Sätze wörtlich",
    );
    await schrift
      .locator("[data-nr-eigene-dosieroj]")
      .setInputFiles([
        { name: "Lato.zip", mimeType: "application/zip", buffer: readFileSync(ZIP) },
      ]);
    const familie = schrift.locator('[data-nr-eigene-familie="Lato"]');
    await familie.waitFor();
    pruefe(
      (await familie.locator("[data-nr-eigene-schnitte]").textContent()) ===
        "Gefunden: Regular 400, Bold 700. Es fehlt: Italic.",
      "AK 3",
      "Familie, „Regular 400, Bold 700“, „Es fehlt: Italic.“",
    );
    pruefeSeite("Ablauf 5");
    await bildVon(seite, ordner, "09-schrift-zip.png", [knoten(seite, "schrift")]);
    await familie.locator('[data-nr-eigene-setzen="display"]').click();
    await seite.waitForFunction(
      () =>
        getComputedStyle(
          document.querySelector('[data-nr-nodo="schrift"] [data-nr-schrift-aa]') ?? document.body,
        ).fontFamily.includes("Lato") &&
        [...document.fonts].some(
          (f) => f.family.replace(/"/g, "") === "Lato" && f.status === "loaded",
        ),
      null,
      { timeout: 30_000 },
    );
    pruefe(true, "Ablauf 5", "„als Überschrift setzen“: „Aa“ in der eigenen Schrift");
    await familie.locator("[data-nr-eigene-privat]").click();
    await familie.locator("[data-nr-eigene-satz]").waitFor();
    pruefe(
      ((await familie.locator("[data-nr-eigene-satz]").textContent()) ?? "").includes(
        "FM_TIPAROJ_REPO",
      ),
      "AK 8",
      "ohne Variable der vorhandene Satz, der sie nennt",
    );
    await schrift.locator("[data-nr-eigene-auf]").click();
    await ohneNeuladen("Ablauf 5");
    pruefeSeite("Ablauf 5");

    // ── Ablauf 6: reload, then a Stand (AK 2) ───────────────────────────────────────────────
    const vorNeuladen = await stand();
    await seite.reload();
    await laden(seite);
    await einpassen(seite);
    pruefe(
      (await nodo(seite, "teksto-ausgangslage").locator("textarea").inputValue()).startsWith(
        "lumeto baut",
      ) &&
        (await markoWerte(seite)).join(",") === "nahbar,mutig,gründlich" &&
        (await seite.locator("[data-nr-beispiel] img").count()) === 4 &&
        (await seite.locator("[data-nr-verweis]").count()) === 1 &&
        (await seite.locator("[data-nr-erkannt-farbo]").count()) > 0 &&
        (
          (await nodo(seite, "schrift")
            .locator('[data-nr-schrift-familie="body"]')
            .textContent()) ?? ""
        ).includes("Inter") &&
        (
          (await nodo(seite, "schrift")
            .locator('[data-nr-schrift-familie="display"]')
            .textContent()) ?? ""
        ).includes("Lato"),
      "AK 2",
      "nach dem Neuladen: Texte, Werte, Beispiele, erkannte Farben, Schriften",
    );
    pruefe(
      JSON.stringify((await stand()).knoten) === JSON.stringify(vorNeuladen.knoten),
      "AK 2",
      "der Zustand der Leinwand ist derselbe",
    );
    pruefeSeite("Ablauf 6");
    await bild(seite, ordner, "10-nach-neuladen.png");
    await seite.evaluate(() => {
      (window as { __bilder056?: number }).__bilder056 = 1;
    });
    await seite.locator("[data-nr-stand-speichern]").click();
    const standName = seite.locator("[data-nr-stand-kampo] input");
    await standName.waitFor();
    await standName.fill("Werkstatt");
    await seite.locator("[data-nr-stand-konservi]").click();
    await seite
      .locator("[data-nr-stand-mesagxo]")
      .filter({ hasText: "Stand „Werkstatt“ gespeichert" })
      .waitFor();
    const imStand = await stand();
    const ausgangslage = nodo(seite, "teksto-ausgangslage").locator("textarea");
    await ausgangslage.click();
    await ausgangslage.fill(`${await ausgangslage.inputValue()} Und noch ein Satz.`);
    await leereStelle(seite);
    await warteBis(seite, "AK 2", "Änderung gespeichert", async () =>
      String(inhaltDe(await stand(), "teksto-ausgangslage")?.text ?? "").endsWith("noch ein Satz."),
    );
    await seite.locator("[data-nr-staende]").click();
    await seite.locator('[data-nr-staende-listo][data-nr-preta="true"]').waitFor();
    const revStand = await revDe(seite);
    await seite
      .locator("[data-nr-stand]")
      .filter({ hasText: "Werkstatt" })
      .locator("[data-nr-stand-oeffnen]")
      .click();
    await warteBis(
      seite,
      "AK 2",
      "Stand geöffnet",
      async () => (await revDe(seite)) === revStand + 1,
    );
    await seite.locator("[data-nr-staende-listo]").waitFor({ state: "detached" });
    await warteBis(
      seite,
      "AK 2",
      "Ausgangslage aus dem Stand",
      async () =>
        !(await nodo(seite, "teksto-ausgangslage").locator("textarea").inputValue()).endsWith(
          "noch ein Satz.",
        ),
    );
    pruefe(
      JSON.stringify((await stand()).knoten) === JSON.stringify(imStand.knoten),
      "AK 2",
      "nach „Stand öffnen“ alles wie im Stand",
    );
    await ohneNeuladen("Ablauf 6");
    pruefeSeite("Ablauf 6");

    // ── Ablauf 7: detach and plug (AK 16, 17) ───────────────────────────────────────────────
    await loese(seite, kanteVonWert("w2"));
    await warteBis(
      seite,
      "Ablauf 7",
      "„mutig“ gelöst",
      async () => (await markoWerte(seite)).join(",") === "nahbar,gründlich",
    );
    const kopf = async () =>
      ((await seite.locator("[data-nr-kapo]").innerText()) ?? "").replace(/\s+/g, " ");
    pruefe(
      (await seite.locator('[data-nr-wert="w2"][data-nr-geloest]').count()) === 1 &&
        /1 Verbindung gelöst · ?zurücksetzen/.test(await kopf()),
      "AK 16",
      "„mutig“ blass, „1 Verbindung gelöst · zurücksetzen“",
    );
    await stecke(
      seite,
      seite.locator('[data-nr-anschluss="teksto-werte.el.w2"]'),
      seite.locator('[data-nr-anschluss="marko.en.teksto"]'),
    );
    await warteBis(
      seite,
      "Ablauf 7",
      "gesteckt",
      async () => (await markoWerte(seite)).length === 3,
    );
    pruefe(
      (await seite.locator("[data-nr-ligo-hinweis]").count()) === 0,
      "AK 16",
      "wieder gesteckt, drei Werte",
    );
    // Following on, then Beispiele detached: Primär stays, a new image changes nothing (AK 17).
    await seite.locator("[data-nr-folgen-lassen]").click();
    await warteBis(
      seite,
      "AK 17",
      "folgt",
      async () => (await stand()).primaer.stato === "aus-material",
    );
    await loese(seite, kanteVonWert("w2"));
    await loese(seite, BEISPIELE_KANTE);
    await warteBis(
      seite,
      "Ablauf 7",
      "zwei gelöst",
      async () => (await stand()).geloest.length === 2,
    );
    const primaerGeloest = (await stand()).primaer;
    pruefe(
      (await seite.locator('[data-nr-marko-teil="beispiele"]').count()) === 0 &&
        (await nodo(seite, "beispiele").getAttribute("data-nr-geloest")) !== null &&
        ((await nodo(seite, "beispiele").textContent()) ?? "").includes(NE_KONEKTITA_MARKO_SATZ) &&
        /2 Verbindungen gelöst · ?zurücksetzen/.test(await kopf()),
      "AK 16",
      "Beispiele blass mit Satz, keine Farbpunkte an der Marke, Kopfleiste zählt zwei",
    );
    pruefeSeite("Ablauf 7");
    await bild(seite, ordner, "11-verbindung-geloest.png");
    await seite
      .locator("[data-nr-beispiele-dosieroj]")
      .setInputFiles([
        { name: "zweites-blau.png", mimeType: "image/png", buffer: BILDER[0].buffer },
      ]);
    await seite.locator('[data-nr-beispiel="zweites-blau.png"] img').waitFor();
    await warten(600);
    pruefe(
      JSON.stringify((await stand()).primaer) === JSON.stringify(primaerGeloest),
      "AK 17",
      "gelöst: ein neues Bild ändert Primär nicht",
    );
    await seite.reload();
    await laden(seite);
    pruefe(
      (await markoWerte(seite)).join(",") === "nahbar,gründlich" &&
        (await nodo(seite, "beispiele").getAttribute("data-nr-geloest")) !== null,
      "AK 16",
      "nach dem Neuladen weiter gelöst",
    );
    await seite.locator("[data-nr-anordnung-zuruecksetzen]").click();
    await warteBis(
      seite,
      "AK 16",
      "zurückgesetzt",
      async () => (await stand()).geloest.length === 0,
    );
    const zustand = async () =>
      `${(await markoWerte(seite)).join(",")} | Farbpunkte ${await seite.locator('[data-nr-marko-teil="beispiele"]').count()} | Hinweis ${await seite.locator("[data-nr-ligo-hinweis]").count()}`;
    await warteBis(
      seite,
      "AK 16",
      "„Anordnung zurücksetzen“ steckt alle Verbindungen wieder",
      async () =>
        (await markoWerte(seite)).length === 3 &&
        (await seite.locator('[data-nr-marko-teil="beispiele"]').count()) === 1,
      100,
    ).catch(async (f: unknown) => {
      console.log(`Zustand nach „Anordnung zurücksetzen“: ${await zustand()}`);
      throw f;
    });
    pruefe(true, "AK 16", "„Anordnung zurücksetzen“ steckt alle Verbindungen wieder");

    // ── Tight heights (§2.3): twelve images with eight detected colours, the fullest Marke ──
    await einpassen(seite);
    const muster = Array.from(
      { length: 12 - (await seite.locator("[data-nr-beispiel]").count()) },
      (_, i) => ({
        name: `muster-${i}.png`,
        buffer: baender([
          [`#${(40 + i * 15).toString(16).padStart(2, "0")}64c8`, 70],
          ["#f0f0f0", 30],
        ]),
        typ: "image/png",
      }),
    );
    await ziehen(seite, muster);
    await warteBis(
      seite,
      "Höhen",
      "zwölf Vorschaubilder",
      async () => (await seite.locator("[data-nr-beispiel] img").count()) === 12,
    );
    await warten(400);
    const reihen = await seite.locator("[data-nr-erkannt-farbo]").count();
    pruefe(reihen === 8, "Höhen", `acht Felder unter „Erkannt“ (${reihen})`);
    const mitVerweis = (await hoehen(seite)).find((h) => h.id === "beispiele");
    console.log(
      `Höhe Beispiele mit zwölf Bildern, acht Feldern und einem Verweis: ${mitVerweis?.gemessen}/${mitVerweis?.hoechstens} (ein Verweis lässt den Knoten nach unten wachsen)`,
    );
    await seite.locator("[data-nr-verweis-forigi]").first().click();
    await warteBis(
      seite,
      "Höhen",
      "Verweis entfernt",
      async () => (await seite.locator("[data-nr-verweis]").count()) === 0,
    );
    await pruefeHoehen(seite, "zwölf Bilder, acht Felder", ["beispiele", "marko"]);
    await pruefeGeometrie(seite, basis, "AK-7 mit vollen Inhalten", [
      "marko",
      ...FIKSAJ,
      ...ALDONEBLAJ.map(([, id]) => id),
    ]);
    await pruefeHoehen(seite, "volle Inhalte");

    // ── QA run 1, Randfall: an image removed, an older Stand still names it ─────────────────
    // The tile reads „Datei fehlt“ without a word broken; its „×“ removes it without a request
    // for the file that is already gone (no console error).
    await seite.locator("[data-nr-stand-speichern]").click();
    await standName.waitFor();
    await standName.fill("Muster");
    await seite.locator("[data-nr-stand-konservi]").click();
    await seite
      .locator("[data-nr-stand-mesagxo]")
      .filter({ hasText: "Stand „Muster“ gespeichert" })
      .waitFor();
    const fehlend = "muster-0.png";
    await seite.locator(`[data-nr-beispiel="${fehlend}"]`).hover();
    await seite.locator(`[data-nr-beispiel-forigi="${fehlend}"]`).click();
    await seite.locator(`[data-nr-beispiel="${fehlend}"]`).waitFor({ state: "detached" });
    await seite.locator("[data-nr-staende]").click();
    await seite.locator('[data-nr-staende-listo][data-nr-preta="true"]').waitFor();
    await seite
      .locator("[data-nr-stand]")
      .filter({ hasText: "Muster" })
      .locator("[data-nr-stand-oeffnen]")
      .click();
    await seite.locator("[data-nr-staende-listo]").waitFor({ state: "detached" });
    const kachel = seite.locator(`[data-nr-beispiel="${fehlend}"][data-nr-fehlt]`);
    await kachel.waitFor();
    const etikedo = await kachel.evaluate((k) => {
      const teksto = [...k.childNodes].find((n) => n.nodeType === Node.TEXT_NODE);
      const inhalt = teksto?.textContent ?? "";
      // A word split over two lines has two rectangles.
      const geteilt = [...inhalt.matchAll(/\S+/g)].filter((m) => {
        const r = document.createRange();
        r.setStart(teksto as Node, m.index);
        r.setEnd(teksto as Node, m.index + m[0].length);
        return r.getClientRects().length !== 1;
      });
      const ganz = document.createRange();
      if (teksto !== undefined) ganz.selectNodeContents(teksto);
      return {
        inhalt,
        zeilen: ganz.getClientRects().length,
        geteilt: geteilt.map((m) => m[0]),
        abgeschnitten: k.scrollWidth > k.clientWidth || k.scrollHeight > k.clientHeight,
      };
    });
    pruefe(
      etikedo.inhalt === DATEI_FEHLT && etikedo.geteilt.length === 0 && !etikedo.abgeschnitten,
      "Randfall",
      `Kachel „${etikedo.inhalt}“ ohne geteiltes Wort, nicht abgeschnitten (${etikedo.zeilen} Zeile(n); geteilt: ${etikedo.geteilt.join(", ")})`,
    );
    const anfragen: string[] = [];
    const notieren = (r: { method(): string; url(): string }) => {
      if (r.url().includes(`/beispiele/${fehlend}`)) anfragen.push(`${r.method()} ${r.url()}`);
    };
    seite.on("request", notieren);
    await kachel.hover();
    await seite.locator(`[data-nr-beispiel-forigi="${fehlend}"]`).click();
    await kachel.waitFor({ state: "detached" });
    await warteBis(
      seite,
      "Randfall",
      "Kachel aus dem Inhalt entfernt",
      async () =>
        !JSON.stringify(inhaltDe(await stand(), "beispiele") ?? {}).includes(`"${fehlend}"`),
    );
    seite.off("request", notieren);
    pruefe(
      anfragen.length === 0,
      "Randfall",
      `„×“ an „Datei fehlt“ ohne Anfrage nach der Datei (${anfragen.join(" | ")})`,
    );
    pruefeSeite("Randfall");
    pruefeSeite("Ende");
    console.log(`Schrift-Route: ${[...new Set(tiparoRoute)].join(", ")}`);
    console.log(
      `abgebrochene CDN-Anfragen der Vorschau: ${cdn.length}; andere fremde Anfragen: ${fremde.length}`,
    );
    pruefe(
      fremde.length === 0,
      "Netz",
      `keine Anfrage des Browsers nach außen außer der Vorschau-CDN (${fremde.slice(0, 3).join(" ")})`,
    );
  } finally {
    await kontext.close();
  }
}

/** The text of every `.ts`/`.tsx` file below `dir`. */
function quellenDe(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((ero) => {
    const pfad = join(dir, ero.name);
    if (ero.isDirectory()) return quellenDe(pfad);
    return /\.tsx?$/.test(ero.name) ? [readFileSync(pfad, "utf8")] : [];
  });
}

/** Relative paths count from where pnpm was called (INIT_CWD), not from the package. */
const vomAufruf = (pfad: string): string => resolve(process.env.INIT_CWD ?? process.cwd(), pfad);

async function main(): Promise<number> {
  const { values } = parseArgs({ options: { ziel: { type: "string" } }, strict: true });
  if (values.ziel === undefined) {
    console.error(
      "Kein --ziel angegeben: das Skript schreibt nichts. Aufruf: pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-056.ts --ziel <bilder-ordner>",
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

  const arbeit = await mkdtemp(join(tmpdir(), "nr-bilder-056-"));
  const cache = await mkdtemp(join(tmpdir(), "nr-bilder-056-cache-"));
  // A local image address (the browser never asks it; the Metiejo fetches it for Beispiele).
  const bildPort = await freierPort();
  const bildServer: Server = httpServer((frage, antwort) => {
    if (frage.url === "/fenster.png") {
      antwort.writeHead(200, { "content-type": "image/png" });
      antwort.end(FENSTER);
    } else {
      antwort.writeHead(404);
      antwort.end();
    }
  });
  await new Promise<void>((fertig) => bildServer.listen(bildPort, "127.0.0.1", () => fertig()));
  const port = await freierPort();
  const basis = `http://127.0.0.1:${port}`;
  const umgebung: NodeJS.ProcessEnv = { ...process.env, XDG_CACHE_HOME: cache };
  delete umgebung.FM_TIPAROJ_REPO;
  const kind = spawn(
    process.execPath,
    [CLI, "metiejo", "--port", String(port), "--workdir", arbeit],
    {
      cwd: REPO,
      env: umgebung,
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
    await lauf(browser, basis, ordner, `http://127.0.0.1:${bildPort}/fenster.png`, arbeit);
    return 0;
  } catch (fehler) {
    console.error(
      `Abgebrochen: ${fehler instanceof Error ? fehler.message.split("\n")[0] : String(fehler)}`,
    );
    return 1;
  } finally {
    await browser?.close();
    await beende(kind);
    await new Promise<void>((fertig) => bildServer.close(() => fertig()));
    await rm(arbeit, { recursive: true, force: true });
    await rm(cache, { recursive: true, force: true });
  }
}

process.exitCode = await main();
