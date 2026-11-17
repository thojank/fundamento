// Spec 058 T10 (MAW-5.1, plan Q-5): the binding browser checks of this spec in Chromium and the
// sixteen images of the technical spec, written outside the repo.
//
//   pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-058.ts --ziel <dir>
//   pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-058.ts --ziel <dir> --echt
//
// The Metiejo runs in this process from the built `packages/metiejo/dist` (the `fm metiejo` child of
// `bilder-056.ts` cannot reach a model double: the provider's base addresses are fixed), with a
// temporary work folder, at 2100×1250. Without `--echt` the model is a counting double (0 $) that
// tells the three purposes apart by their temperature; Pinterest is the invented board of MAW-3.5
// (`esploro.fetch` double on the server, local thumbnails in the browser); the font packages are not
// fetched (offline). The browser reaches nothing but the Metiejo: every other request is aborted.
// It checks, and stops with exit code 1 at the first failure:
//   - AK-1 / AK-13: the main flow – „Neue Marke“, Grundlagen, two more inputs, a Pinterest link with
//     three images taken, a Layout-Beispiel with „Aufbau erkennen“, „Marke auswerten“, „Vorschlag
//     übernehmen“ (one Stand), „Namen und Beschreibung“ – and switching over „Marken“ and back;
//   - AK-5: „Anordnen“ with every addable node and a further preview: no box overlaps another, no
//     edge runs through a foreign box (the measurement of Spec 056), the same places after a reload;
//     the start layout with the fullest content too; the node heights against `ARANGXO_058`.
//     QA-Lauf 1 (B4): after „Anordnen“ an edge through a foreign box is printed as a recorded
//     finding („Befund“), not a failure – AK-5 asks for boxes without overlap, not for edges; the
//     start layouts keep the edge measurement as a check;
//   - AK-3: per layout × scheme at least three visible `data-mt-akzent` places whose computed colour
//     is the computed `--fm-color-sekundo-*` role, and one in „Komponenten“;
//   - AK-19: per button the frame shows its `data-mt-aufbau` (read from the holding page by
//     polling, never by navigation events); the dot at the Layout-Beispiel's layout; „wie
//     Layout-Beispiel“ returns; the row disabled in „Komponenten“; two previews, two layouts; the
//     same after a reload;
//   - AK-6: the double is called only by the three buttons; without a model nothing is red;
//   - `styling.md`: every `var(--fm-…)` of this spec's sources has a value in the browser.
//
// `--echt` (the one real run, product spec „Rahmen des Laufs“): the model of the Metiejo's own
// access (`readKi`, as `fm metiejo` reads it); before each KI click the script asks the price
// estimate and stops before the sum of the actual costs plus that estimate would pass 0.50 $. The
// checks that depend on the double's answers (counts, layouts) are left out in that mode.
// These images are records, not baselines; nothing compares them.

import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { setTimeout as warten } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { deflateSync } from "node:zlib";
import { altecoDe } from "@fundamento/metiejo/gestalten";
import { type Browser, type BrowserContext, chromium, type Locator, type Page } from "playwright";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const DIST = join(REPO, "packages/metiejo/dist/index.js");
const LEINWAND = join(REPO, "packages/nodredaktilo/dist/leinwand.js");
const BRETT_HTML = join(REPO, "packages/metiejo/src/test-doubles/pinterest-058/brett.html.txt");
const BAU_BEFEHL =
  "pnpm exec turbo run build --filter=@fundamento/metiejo && pnpm --filter @fundamento/nodredaktilo build";

const VIEWPORT = { width: 2100, height: 1250 } as const;
/** The cap of the one real run (product spec „Rahmen des Laufs“): a rule of this script only. */
const KAPPE_USD = 0.5;
const MARKE = "lumeto";
const NAME = "Lumeto";
const ANDERE = "provo";
const BRETT = "https://www.pinterest.de/lumeto/werkstatt/";
const STUFE = { stufe: 58 } as const;

class Abbruch extends Error {}

/** Fails the run with a clear message unless `bedingung` holds. */
function pruefe(bedingung: boolean, schritt: string, was: string): asserts bedingung {
  if (!bedingung) throw new Abbruch(`${schritt}: ${was}`);
  console.log(`ok  ${schritt}: ${was}`);
}

// ---------------------------------------------------------------------------------------------
// The Metiejo of `dist`, typed as far as this script uses it

interface Servilo {
  port: number;
  close(): Promise<void>;
}
interface Provider {
  toString(): string;
  name: string;
}
interface MetiejoDist {
  startServilo(
    options: Record<string, unknown>,
    io: { stderr: (text: string) => void },
  ): Promise<Servilo>;
  Provider: new (name: string, model: string, key: string) => Provider;
  parseEnv(text: string): Record<string, string>;
  settingsOf(values: Record<string, string>): unknown;
  readKi(root: string): { provider?: Provider; satz?: string };
  LIMOJ: Readonly<Record<string, unknown>>;
  MARKEN_DIR: string;
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
/** A PNG of bands `[hex, percent]` from the top. */
function baender(liste: readonly (readonly [string, number])[], breite = 40, hoehe = 40): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(breite, 0);
  ihdr.writeUInt32BE(hoehe, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const roh = Buffer.alloc((breite * 4 + 1) * hoehe);
  for (let y = 0; y < hoehe; y++) {
    let summe = 0;
    let farbe = liste[0]?.[0] ?? "#000000";
    for (const [hex, anteil] of liste) {
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
/** The invented pin images: each number its own warm or cool pair. */
const PIN_FARBEN = ["#2f5bff", "#d2552c", "#1e1d22", "#c6f135", "#ebe5d8", "#7a3e9d", "#17b3a8"];
const pinBild = (nummer: number): Buffer =>
  baender([
    [PIN_FARBEN[nummer % PIN_FARBEN.length] ?? "#2f5bff", 65],
    [PIN_FARBEN[(nummer + 3) % PIN_FARBEN.length] ?? "#ebe5d8", 35],
  ]);
/** The Layout-Beispiel: five colours, the fullest the node shows. */
const LAYOUT_PNG = baender(
  [
    ["#1e1d22", 30],
    ["#f0ece4", 25],
    ["#2f5bff", 20],
    ["#d2552c", 15],
    ["#c6f135", 10],
  ],
  64,
  60,
);

// ---------------------------------------------------------------------------------------------
// The model double: the fullest realistic answers (product spec: six to eight names)

const ANTWORTEN = {
  profil: {
    kernsatz:
      "Gutes Licht aus Altglas, dort wo mit den Händen gearbeitet wird – jeden Tag, ein Leben lang.",
    leitgedanken: [
      { titel: "Nah am Werkstück", text: "Licht, das dem Handgriff folgt und nicht dem Raum." },
      { titel: "Ehrlich gebaut", text: "Jedes Teil lässt sich tauschen; nichts ist verklebt." },
      { titel: "Zweites Leben", text: "Altglas wird Leuchte, und die Leuchte bleibt reparierbar." },
    ],
    charakter: ["handfest", "warm", "geradeaus", "geduldig", "klar"],
    passt: [
      "„ehrlich“ und Altglas tragen dieselbe Haltung durch Beschreibung und Werte.",
      "„robust“ und die Werkstatt sprechen mit einer Stimme.",
    ],
    reibt: ["Die Beschreibung sagt „warm“, das Blau aus den Beispielen ist eher kühl und laut."],
    vorschlag: {
      primaer: { hex: "#2144c7", grund: "Das Blau der Beispiele, ruhiger, damit es trägt." },
      akzent: { hex: "#d2552c", grund: "Das warme Orange für „ehrlich“, sparsam gesetzt." },
      neutral: { hex: "#ebe5d8", grund: "Warm getönt statt kühl grau, passt zu Altglas." },
      schrift: { display: "Lora", body: "Inter", grund: "Handwerklich im Titel, gut lesbar." },
    },
  },
  namen: {
    namen: [
      "Glimmer",
      "Scherbenlicht",
      "Altglanz",
      "Funkel",
      "Lichtwerk",
      "Klarschein",
      "Hellgut",
      "Glaswerk",
    ].map((name) => ({
      name,
      grund: `„${name}“ verbindet das Licht mit dem Handwerk und bleibt im Ohr, ohne laut zu sein.`,
    })),
    beschreibung:
      "Lumeto baut Leuchten aus Altglas für kleine Werkstätten, die gut sehen wollen – reparierbar, ehrlich und gemacht für jeden Tag an der Werkbank.",
  },
  aufbau: {
    merkmale: {
      titelbild: "klein",
      inhalt: "karten",
      dichte: "luftig",
      achse: "mittig",
      schrift: "gross",
    },
    worte:
      "Ein luftiges Raster aus Karten unter einem kleinen Titelbild, die Schrift groß und mittig gesetzt.",
  },
} as const;
type Zweck = keyof typeof ANTWORTEN;
const TEMPERATUREN: Readonly<Record<string, Zweck>> = {
  "0.2": "profil",
  "0.8": "namen",
  "0.1": "aufbau",
};

const modelo = { vokoj: { profil: 0, namen: 0, aufbau: 0 } as Record<Zweck, number> };
const summeVokoj = (): number => modelo.vokoj.profil + modelo.vokoj.namen + modelo.vokoj.aufbau;
async function modelDouble(_url: string, init?: RequestInit): Promise<Response> {
  const korpo = JSON.parse(String(init?.body ?? "{}")) as { temperature?: number };
  const zweck = TEMPERATUREN[String(korpo.temperature)];
  if (zweck === undefined) return new Response('{"message":"unbekannt"}', { status: 400 });
  modelo.vokoj[zweck] += 1;
  return new Response(
    JSON.stringify({
      choices: [{ message: { role: "assistant", content: JSON.stringify(ANTWORTEN[zweck]) } }],
      usage: { prompt_tokens: 1400, completion_tokens: 500 },
    }),
    { status: 200 },
  );
}

// ---------------------------------------------------------------------------------------------
// Pinterest on the server: the invented board and its images (nothing else is fetched)

const serverAbrufe: string[] = [];
function mitAdresse(antwort: Response, url: string): Response {
  Object.defineProperty(antwort, "url", { value: url });
  return antwort;
}
function esploroDouble(url: string): Promise<Response> {
  serverAbrufe.push(url);
  if (url === BRETT)
    return Promise.resolve(
      mitAdresse(
        new Response(readFileSync(BRETT_HTML, "utf8"), {
          headers: { "content-type": "text/html" },
        }),
        url,
      ),
    );
  const pin = /^https:\/\/i\.pinimg\.com\/736x\/.*?(\d{4})\.\w+$/.exec(url);
  if (pin !== null)
    return Promise.resolve(
      mitAdresse(
        new Response(new Uint8Array(pinBild(Number(pin[1]))), {
          headers: { "content-type": "image/png" },
        }),
        url,
      ),
    );
  return Promise.reject(new TypeError("fetch failed (offline)"));
}
const npmOffline = {
  fetchJson: (): Promise<unknown> => Promise.reject(new TypeError("offline")),
  fetchBytes: (): Promise<Buffer> => Promise.reject(new TypeError("offline")),
};

// ---------------------------------------------------------------------------------------------
// The page

const gemalt = (seite: Page): Promise<void> =>
  seite.evaluate(
    () =>
      new Promise<void>((fertig) =>
        requestAnimationFrame(() => requestAnimationFrame(() => fertig())),
      ),
  );
const nodo = (seite: Page, id: string): Locator => seite.locator(`[data-nr-nodo="${id}"]`);
const knoten = (seite: Page, id: string): Locator =>
  seite.locator(`.react-flow__node[data-id="${id}"]`);

/** Polls `bedingung` (a frame between tries) until it holds; stops the run after `versuche`. */
async function warteBis(
  seite: Page,
  schritt: string,
  was: string,
  bedingung: () => Promise<boolean>,
  versuche = 300,
): Promise<void> {
  for (let i = 0; i < versuche; i++) {
    if (await bedingung().catch(() => false)) return;
    await gemalt(seite).catch(() => undefined);
    await warten(20);
  }
  await seite.screenshot({ path: join(tmpdir(), "bilder-058-abbruch.png") });
  throw new Abbruch(`${schritt}: ${was} (nicht eingetreten)`);
}

/** Every write of the canvas is answered: „gespeichert“ stands in the header. */
async function gespeichert(seite: Page): Promise<void> {
  await seite.waitForFunction(
    () => document.querySelector('[data-nr-gespeichert]:not([data-nr-gespeichert="ne"])') !== null,
  );
  await warten(400);
}

async function laden(seite: Page, basis: string, marke = MARKE): Promise<void> {
  await seite.goto(`${basis}/marko/${marke}/grafeo`);
  await seite.locator("#nr-leinwand[data-nr-preta]").waitFor();
  await gemalt(seite);
  await warten(400);
}

const zoomDe = (seite: Page): Promise<number> =>
  seite.evaluate(() => {
    const t = document.querySelector<HTMLElement>(".react-flow__viewport")?.style.transform ?? "";
    return Number(/scale\(([\d.]+)\)/.exec(t)?.[1] ?? "1");
  });

async function einpassen(seite: Page): Promise<void> {
  await seite.locator('[data-nr-zomo="fit"]').click();
  await warten(400);
  await gemalt(seite);
}

/** Pointer off every control, no focus ring, every finite animation finished, painted. */
async function ruhig(seite: Page): Promise<void> {
  await seite.mouse.move(VIEWPORT.width - 8, VIEWPORT.height - 8);
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

/** A point of the empty stage (the pane, no node, no edge, no control), or null. */
const leererPunkt = (seite: Page): Promise<{ x: number; y: number } | null> =>
  seite.evaluate(() => {
    for (let y = 140; y < window.innerHeight - 20; y += 37)
      for (let x = 20; x < window.innerWidth - 20; x += 41) {
        const el = document.elementFromPoint(x, y);
        if (el?.classList.contains("react-flow__pane")) return { x, y };
      }
    return null;
  });

/**
 * Brings nodes into view at a readable zoom: fit, zoom in with „+“ until `zoom` is reached (or the
 * nodes would not fit any more), then drag the empty stage until their centre is the window's.
 */
async function zeige(seite: Page, ids: readonly string[], zoom = 0.9): Promise<void> {
  await einpassen(seite);
  const groesse = async () => {
    const r = await Promise.all(ids.map((id) => knoten(seite, id).boundingBox()));
    const boxen = r.filter((b): b is NonNullable<typeof b> => b !== null);
    if (boxen.length !== ids.length) throw new Abbruch(`nicht gerendert: ${ids.join(", ")}`);
    const l = Math.min(...boxen.map((b) => b.x));
    const t = Math.min(...boxen.map((b) => b.y));
    const r2 = Math.max(...boxen.map((b) => b.x + b.width));
    const b2 = Math.max(...boxen.map((b) => b.y + b.height));
    return { l, t, b: r2 - l, h: b2 - t };
  };
  for (let i = 0; i < 12 && (await zoomDe(seite)) < zoom; i++) {
    const g = await groesse();
    const faktor = 1.2;
    if (g.b * faktor > VIEWPORT.width - 80 || g.h * faktor > VIEWPORT.height - 160) break;
    await seite.locator('[data-nr-zomo="+"]').click();
    await warten(250);
  }
  for (let i = 0; i < 4; i++) {
    const g = await groesse();
    const dx = VIEWPORT.width / 2 - (g.l + g.b / 2);
    const dy = (VIEWPORT.height + 100) / 2 - (g.t + g.h / 2);
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) break;
    const p = await leererPunkt(seite);
    if (p === null) break;
    await seite.mouse.move(p.x, p.y);
    await seite.mouse.down();
    await seite.mouse.move(p.x + dx, p.y + dy, { steps: 12 });
    await seite.mouse.up();
    await gemalt(seite);
    await warten(150);
  }
}

/** An image of the whole window. */
async function bild(seite: Page, ordner: string, datei: string): Promise<string> {
  await ruhig(seite);
  const pfad = join(ordner, `${datei}.png`);
  await seite.screenshot({ path: pfad });
  console.log(`Bild: ${pathToFileURL(pfad).href}`);
  return pfad;
}

/** An image of the region around some elements (padding in px). */
async function bildVon(
  seite: Page,
  ordner: string,
  datei: string,
  ziele: readonly Locator[],
  rand = 28,
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
  const pfad = join(ordner, `${datei}.png`);
  await seite.screenshot({ path: pfad, clip: { x, y, width: x2 - x, height: y2 - y } });
  console.log(`Bild: ${pathToFileURL(pfad).href}`);
  return pfad;
}

// ---------------------------------------------------------------------------------------------
// AK-5: boxes and edges, measured in the browser (the method of bilder-056.ts)

interface Geometrie {
  knoten: string[];
  ueberdeckungen: string[];
  kanten: number;
  durchFremde: string[];
  ohneC: string[];
}

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
    const anschluesse = [...document.querySelectorAll<HTMLElement>(".react-flow__handle")];
    const durchFremde: string[] = [];
    const ohneC: string[] = [];
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
    }
    return {
      knoten: boxen.map((b) => b.id),
      ueberdeckungen,
      kanten: kanten.length,
      durchFremde,
      ohneC,
    };
  });
}

async function pruefeGeometrie(
  seite: Page,
  schritt: string,
  /** QA-Lauf 1 (B4): edges through a foreign box are a recorded finding here, not a failure. */
  kantenAlsBefund = false,
): Promise<Geometrie> {
  const geo = await geometrie(seite);
  console.log(`${schritt}: ${geo.knoten.length} Knoten, ${geo.kanten} Kanten`);
  pruefe(geo.kanten > 0, schritt, "Kanten gezeichnet");
  pruefe(
    geo.ueberdeckungen.length === 0,
    schritt,
    `Knotenboxen paarweise ohne Schnitt (${geo.ueberdeckungen.join(", ")})`,
  );
  if (kantenAlsBefund && geo.durchFremde.length > 0)
    console.log(
      `Befund ${schritt} (kein AK): ${geo.durchFremde.length} Kante(n) durch eine fremde Box (${geo.durchFremde.join("; ")})`,
    );
  else
    pruefe(
      geo.durchFremde.length === 0,
      schritt,
      `keine Kante durch eine fremde Box (${geo.durchFremde.join("; ")})`,
    );
  pruefe(geo.ohneC.length === 0, schritt, `jedes d enthält C (${geo.ohneC.join(", ")})`);
  return geo;
}

interface Hoehe {
  id: string;
  gemessen: number;
  hoechstens: number;
}
/** The rendered heights in flow units (`offsetHeight` is not scaled by the zoom) against §3.1. */
async function hoehen(seite: Page): Promise<Hoehe[]> {
  const gemessen = await seite.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".react-flow__node")].map((el) => ({
      id: el.dataset.id ?? "",
      gemessen: el.offsetHeight,
    })),
  );
  return gemessen.map((h) => ({ ...h, hoechstens: altecoDe(h.id, STUFE) }));
}
const hoehenText = (liste: readonly Hoehe[]): string =>
  liste.map((h) => `${h.id} ${h.gemessen}/${h.hoechstens}`).join(", ");
async function pruefeHoehen(seite: Page, schritt: string): Promise<void> {
  const alle = (await hoehen(seite)).filter((h) => h.hoechstens > 0);
  console.log(`Höhen ${schritt} (gemessen/höchstens): ${hoehenText(alle)}`);
  const zuHoch = alle.filter((h) => h.gemessen > h.hoechstens);
  pruefe(zuHoch.length === 0, schritt, `keine Höhe über ihrem Maximum (${hoehenText(zuHoch)})`);
}

/** The places of the nodes as React Flow sets them (transform), sorted. */
const plaetze = (seite: Page): Promise<string> =>
  seite.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".react-flow__node")]
      .map((el) => `${el.dataset.id} ${el.style.transform}`)
      .sort()
      .join("|"),
  );

// ---------------------------------------------------------------------------------------------
// AK-3 and AK-19: the preview frames, read from the holding page

interface KadroStato {
  href: string;
  url: string;
  aufbau: string | null;
  scheme: string | null;
}

/** The shown frame of a preview; null while it loads (or while a frame is on its way). */
const kadroStato = (seite: Page, id: string): Promise<KadroStato | null> =>
  seite.evaluate((id) => {
    const kadro = document.querySelector(`[data-nr-vorschau-kadro="${id}"]`);
    const f = kadro?.querySelector<HTMLIFrameElement>('iframe[data-nr-vorschau-rahmen="gezeigt"]');
    if (!f || kadro?.querySelector('iframe[data-nr-vorschau-rahmen="venonta"]')) return null;
    try {
      const d = f.contentDocument;
      if (d?.readyState !== "complete" || d.URL === "about:blank") return null;
      return {
        href: f.dataset.nrHref ?? "",
        url: d.URL,
        aufbau: d.querySelector("[data-mt-aufbau]")?.getAttribute("data-mt-aufbau") ?? null,
        scheme: d.documentElement.getAttribute("data-fm-color-scheme"),
      };
    } catch {
      return null;
    }
  }, id);

/** Polls until the frame of `id` shows `aufbau` (null: no Marke page) at its own address. */
async function warteKadro(
  seite: Page,
  schritt: string,
  id: string,
  aufbau: string | null,
): Promise<KadroStato> {
  await warteBis(seite, schritt, `${id} zeigt data-mt-aufbau=${aufbau}`, async () => {
    const s = await kadroStato(seite, id).catch(() => null);
    return s !== null && s.aufbau === aufbau && s.url.endsWith(s.href);
  });
  const s = await kadroStato(seite, id);
  if (s === null) throw new Abbruch(`${schritt}: ${id} ohne Rahmen`);
  return s;
}

interface AkzentOrt {
  art: string;
  sichtbar: boolean;
  gleich: boolean;
  aktiv: boolean;
}
/** The accent places of a frame: kind, visible, whether the computed colour is the role's. */
const akzentoj = (seite: Page, id: string): Promise<AkzentOrt[] | null> =>
  seite.evaluate((id) => {
    const f = document.querySelector<HTMLIFrameElement>(
      `[data-nr-vorschau-kadro="${id}"] iframe[data-nr-vorschau-rahmen="gezeigt"]`,
    );
    const d = f?.contentDocument;
    const w = f?.contentWindow;
    if (!d || !w) return null;
    const rolo = (v: string) => {
      const p = d.createElement("span");
      p.style.color = `var(${v})`;
      d.body.append(p);
      const c = w.getComputedStyle(p).color;
      p.remove();
      return c;
    };
    const flaeche = rolo("--fm-color-sekundo-surface");
    const form = rolo("--fm-color-sekundo-illustration");
    const fill = rolo("--fm-color-sekundo-badge-fill");
    const text = rolo("--fm-color-sekundo-badge-text");
    return [...d.querySelectorAll<HTMLElement>("[data-mt-akzent]")].map((el) => {
      const cs = w.getComputedStyle(el);
      const box = el.getBoundingClientRect();
      const art = el.dataset.mtAkzent ?? "";
      const gleich =
        art === "flaeche"
          ? cs.backgroundColor === flaeche
          : art === "marke"
            ? cs.backgroundColor === fill && cs.color === text
            : cs.backgroundColor === form || cs.boxShadow.includes(form);
      const aktiv =
        el.closest("fm-butono, fm-ligilo, a, button") !== null ||
        el.querySelector("fm-butono, fm-ligilo, a, button") !== null;
      return {
        art,
        sichtbar: box.width > 0 && box.height > 0 && cs.visibility !== "hidden",
        gleich,
        aktiv,
      };
    });
  }, id);

async function pruefeAkzent(seite: Page, id: string, schritt: string): Promise<number> {
  const orte = await akzentoj(seite, id);
  pruefe(orte !== null, schritt, "Rahmen lesbar");
  const gut = orte.filter((o) => o.sichtbar && o.gleich && !o.aktiv);
  const arten = [...new Set(gut.map((o) => o.art))].sort();
  pruefe(
    gut.length >= 3,
    schritt,
    `${gut.length} sichtbare Akzent-Stellen mit berechneter Farbe = --fm-color-sekundo-* (${arten.join(", ")})`,
  );
  pruefe(
    orte.every((o) => !o.aktiv),
    schritt,
    "keine Akzent-Stelle an Knopf oder Link",
  );
  return gut.length;
}

const aktiverAufbau = (seite: Page, id: string): Promise<string | null> =>
  seite
    .locator(`[data-nr-vorschau-aufbau="${id}"] [data-nr-aufbau][data-nr-aktiva="true"]`)
    .first()
    .getAttribute("data-nr-aufbau")
    .catch(() => null);
const punktAufbau = (seite: Page, id: string): Promise<string[]> =>
  seite.evaluate(
    (id) =>
      [...document.querySelectorAll(`[data-nr-vorschau-aufbau="${id}"] [data-nr-auto]`)].map(
        (e) => e.getAttribute("data-nr-aufbau") ?? "",
      ),
    id,
  );

/** Clicks a control through the DOM (React Flow nodes may sit under the header's shadow). */
async function klick(seite: Page, ziel: Locator): Promise<void> {
  await ziel.first().evaluate((el: HTMLElement) => el.click());
  // A click that navigates destroys the context: that is „not painted yet“, not a failure.
  await gemalt(seite).catch(() => undefined);
  await warten(120);
}

// ---------------------------------------------------------------------------------------------
// The real run: the cap

interface Kasse {
  echt: boolean;
  summe: number;
}

/** Before a KI click of the real run: stop when the estimate would pass the cap. */
async function vorKlick(basis: string, kasse: Kasse, zweck: Zweck): Promise<void> {
  if (!kasse.echt) return;
  const s = (await (await fetch(`${basis}/api/marko/${MARKE}/ki?zweck=${zweck}`)).json()) as {
    pret: boolean;
    schaetzung?: { usd?: number };
  };
  const usd = s.schaetzung?.usd;
  if (!s.pret || usd === undefined || kasse.summe + usd > KAPPE_USD)
    throw new Abbruch(
      `echter Durchlauf: ${zweck} nicht gestartet (bisher ${kasse.summe.toFixed(4)} $, Schätzung ${usd ?? "unbekannt"} $, Kappe ${KAPPE_USD} $)`,
    );
}
/** After a KI click: the answer's cost goes into the sum. */
async function nachKlick(
  seite: Page,
  kasse: Kasse,
  antwort: Promise<{ json(): Promise<unknown> }>,
): Promise<void> {
  const korpo = (await (await antwort).json()) as Record<string, unknown>;
  const kosto = (korpo.kosto ??
    (korpo.profil as { kosto?: unknown } | undefined)?.kosto ??
    (korpo.vorschlag as { kosto?: unknown } | undefined)?.kosto) as { usd?: number } | undefined;
  kasse.summe += kosto?.usd ?? 0;
  if (kasse.echt) console.log(`echter Durchlauf: bisher ${kasse.summe.toFixed(4)} $`);
  await gemalt(seite);
}

// ---------------------------------------------------------------------------------------------
// The sources of this spec, for the `styling.md` step

const GESTALTEN_058 = [
  "anordnen.ts",
  "flanko.tsx",
  "ki-knopo.tsx",
  "marken.tsx",
  "nodoj/grundlagen.tsx",
  "nodoj/ki-namen.tsx",
  "nodoj/layout-beispiel.tsx",
  "nodoj/marko-profil.tsx",
  "nodoj/marko-uebersicht.tsx",
  "nodoj/marko.tsx",
  "nodoj/vorschau.tsx",
  "nodoj/beispiele.tsx",
  "kanvaso.tsx",
  "kapo.tsx",
].map((d) => join(REPO, "packages/nodredaktilo/src/gestalten", d));
const SEITE_058 = [join(REPO, "packages/metiejo/src/vorschau-marke.ts")];
/** `var(--fm-…)` names per source file (a name built from parts ends in `-`: left out). */
function varNamen(dateien: readonly string[]): { datei: string; name: string }[] {
  return dateien.flatMap((datei) =>
    [
      ...new Set(
        [...readFileSync(datei, "utf8").matchAll(/var\((--fm-[a-z0-9-]*[a-z0-9])(?![\w$-])/g)].map(
          (m) => m[1] ?? "",
        ),
      ),
    ].map((name) => ({ datei: relative(REPO, datei), name })),
  );
}

// ---------------------------------------------------------------------------------------------

/** AK-6: nothing red. Every colour of the canvas is compared with every red `danger` role it defines. */
const rotesDe = (seite: Page): Promise<string[]> =>
  seite.evaluate(() => {
    const namen = new Set<string>();
    for (const blatt of [...document.styleSheets])
      try {
        for (const regel of [...blatt.cssRules])
          for (const m of regel.cssText.matchAll(/(--fm-[a-z0-9-]*danger[a-z0-9-]*)/g))
            namen.add(m[1] ?? "");
      } catch {
        // a sheet of another origin: none here
      }
    const wurzel = document.getElementById("nr-leinwand") ?? document.body;
    const probe = document.createElement("span");
    wurzel.append(probe);
    const rot = new Set<string>();
    for (const n of namen) {
      // Only a role that is defined here and resolves to a red (an undefined one would inherit).
      if (getComputedStyle(wurzel).getPropertyValue(n).trim() === "") continue;
      probe.style.color = `var(${n})`;
      const [r = 0, g = 0, b = 0] = (getComputedStyle(probe).color.match(/\d+/g) ?? []).map(Number);
      if (r - Math.max(g, b) > 40) rot.add(getComputedStyle(probe).color);
    }
    probe.remove();
    // Text and the frames of the controls; the brand's own colours (the Fehler node, the palette's
    // ramps, swatches) and the ports (the Bild port's colour) are content, not a tone of judgement.
    const inhalt =
      '.react-flow__node[data-id^="farbo-"], .react-flow__node[data-id="paletro"], .react-flow__handle, [data-nr-marko-farbe], .nr-g-farbo-klein, .nr-g-signo';
    const funde: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("#nr-leinwand *")) {
      if (el.closest(inhalt) !== null || el.getClientRects().length === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden") continue;
      const text = [...el.childNodes].some(
        (k) => k.nodeType === 3 && (k.textContent ?? "").trim() !== "",
      );
      const werte = [cs.borderTopColor, ...(text ? [cs.color] : [])];
      if (el.matches("button, fm-butono, [data-nr-ki-satz], [data-nr-ki-knopo]"))
        werte.push(cs.backgroundColor);
      for (const wert of werte)
        if (rot.has(wert)) funde.push(`${el.tagName.toLowerCase()}.${el.className}: ${wert}`);
    }
    return funde.slice(0, 5);
  });

/** Aborted requests of the preview page to the font CDN (counted, not a failure; as in 056). */
const cdn: string[] = [];

async function neuerKontext(
  browser: Browser,
  basis: string,
  fremd: string[],
): Promise<BrowserContext> {
  const kontext = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  // tsx keeps function names with a helper `__name`; functions sent to the page need it there too.
  await kontext.addInitScript("window.__name = (f) => f;");
  await kontext.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.startsWith(basis)) return route.continue();
    const thumb = /^https:\/\/i\.pinimg\.com\/236x\/.*?(\d{4})\.\w+$/.exec(url);
    if (thumb !== null)
      return route.fulfill({
        status: 200,
        contentType: "image/png",
        body: pinBild(Number(thumb[1])),
      });
    // Every other request is aborted; the font CDN of the preview page (precedent bilder-056.ts)
    // is counted apart from the rest.
    (url.includes("jsdelivr") || url.includes("fontsource") ? cdn : fremd).push(url);
    return route.abort();
  });
  return kontext;
}

const anlegen = async (basis: string, name: string): Promise<void> => {
  const a = await fetch(`${basis}/marko`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", connection: "close" },
    body: `name=${encodeURIComponent(name)}&basis=leer&ziel=leinwand`,
    redirect: "manual",
  });
  if (a.status !== 303) throw new Abbruch(`Marke ${name} nicht angelegt (${a.status})`);
};

async function lauf(
  browser: Browser,
  basis: string,
  ohneBasis: string,
  ordner: string,
  arbeit: string,
  kasse: Kasse,
): Promise<void> {
  const fremd: string[] = [];
  const kiPosts: string[] = [];
  const kontext = await neuerKontext(browser, basis, fremd);
  const seite = await kontext.newPage();
  const fehlerSeite: string[] = [];
  seite.on("pageerror", (e) => fehlerSeite.push(e.message));
  seite.on("request", (r) => {
    if (r.method() === "POST" && /\/api\/marko\/[^/]+\/ki\//.test(r.url())) kiPosts.push(r.url());
  });
  const layoutDatei = join(arbeit, "layout-beispiel-lumeto.png");
  writeFileSync(layoutDatei, LAYOUT_PNG);

  try {
    // --- AK-1 / AK-13: „Neue Marke“ from a canvas that is open --------------------------------
    await anlegen(basis, ANDERE);
    await laden(seite, basis, ANDERE);
    await klick(seite, seite.locator("[data-nr-neue-marke]"));
    await seite.locator("[data-nr-neue-marke-feld]").click();
    await seite.keyboard.type(NAME);
    await warteBis(seite, "Neue Marke", "„Anlegen“ an", async () =>
      seite.locator("[data-nr-anlegen]").evaluate((el) => !el.hasAttribute("disabled")),
    );
    await bild(seite, ordner, "01-neue-marke");
    // The image took the focus off the field (no focus ring): Enter there, as a person does.
    await seite.locator("[data-nr-neue-marke-feld]").click();
    await seite.keyboard.press("End");
    await seite.keyboard.press("Enter");
    await seite.waitForURL(`${basis}/marko/${MARKE}/grafeo`);
    await seite.locator("#nr-leinwand[data-nr-preta]").waitFor();
    await warten(400);
    pruefe(
      new URL(seite.url()).pathname === `/marko/${MARKE}/grafeo`,
      "AK-13",
      "„Neue Marke“ öffnet die Leinwand der neuen Marke",
    );
    pruefe(
      (await seite.locator("[data-nr-kapo-nomo]").textContent()) === NAME,
      "AK-13",
      "Kopfleiste zeigt den Namen",
    );
    const links = await seite.evaluate(
      () =>
        [...document.querySelectorAll<HTMLElement>(".react-flow__node")]
          .map((el) => ({ id: el.dataset.id, l: el.getBoundingClientRect().left }))
          .sort((a, b) => a.l - b.l)[0]?.id,
    );
    pruefe(
      links === "teksto-grundlagen",
      "AK-14",
      `„Marke · Grundlagen“ steht ganz links (${links})`,
    );
    pruefe(
      (await seite.locator("[data-nr-grundlagen-name]").inputValue()) === NAME,
      "AK-14",
      "Grundlagen zeigt den Namen",
    );
    await pruefeGeometrie(seite, "Startanordnung neue Marke");

    // --- Grundlagen and two more inputs ----------------------------------------------------------
    await seite.locator("[data-nr-grundlagen-beschreibung]").click();
    await seite.keyboard.type("Lumeto baut Leuchten aus Altglas für kleine Werkstätten.");
    await seite.keyboard.press("Tab");
    const ausgangslage = nodo(seite, "teksto-ausgangslage")
      .locator("textarea[data-nr-teksto-kampo]")
      .first();
    await ausgangslage.click();
    await seite.keyboard.type("Werkstätten arbeiten unter schlechtem Licht.");
    await seite.keyboard.press("Tab");
    for (const wort of ["ehrlich", "robust"]) {
      const feld = nodo(seite, "teksto-werte")
        .locator('fm-kampo[data-nr-teksto-linio="wert"] input')
        .last();
      await feld.click();
      await seite.keyboard.type(wort);
      await seite.keyboard.press("Enter");
      await gemalt(seite);
    }
    await gespeichert(seite);
    await zeige(seite, ["teksto-grundlagen", "teksto-ausgangslage", "teksto-werte", "marko"], 0.7);
    await bildVon(seite, ordner, "02-grundlagen", [
      nodo(seite, "teksto-grundlagen"),
      nodo(seite, "teksto-ausgangslage"),
    ]);
    pruefe(
      (await nodo(seite, "marko").locator('[data-nr-marko-teil="offen"]').count()) === 1,
      "AK-2",
      "die Übersicht nennt ruhig, was offen ist",
    );
    pruefe(
      (await nodo(seite, "marko").locator("[data-nr-marko-wert]").count()) === 2,
      "AK-2",
      "die Übersicht zeigt die zwei Werte",
    );
    await bildVon(seite, ordner, "03-uebersicht-ohne-ki", [nodo(seite, "marko")]);

    // --- AK-13: typing, switching over „Marken“ and back --------------------------------------
    await ausgangslage.click();
    await seite.keyboard.press("End");
    await seite.keyboard.type(" Auch abends.");
    await klick(seite, seite.locator("[data-nr-marken]"));
    await seite.locator('[data-nr-marken-listo][data-nr-preta="true"]').waitFor();
    await klick(seite, seite.locator(`[data-nr-marken-oeffnen="${ANDERE}"]`));
    await seite.waitForURL(`${basis}/marko/${ANDERE}/grafeo`);
    await seite.locator("#nr-leinwand[data-nr-preta]").waitFor();
    await klick(seite, seite.locator("[data-nr-marken]"));
    await seite.locator('[data-nr-marken-listo][data-nr-preta="true"]').waitFor();
    await klick(seite, seite.locator(`[data-nr-marken-oeffnen="${MARKE}"]`));
    await seite.waitForURL(`${basis}/marko/${MARKE}/grafeo`);
    await seite.locator("#nr-leinwand[data-nr-preta]").waitFor();
    await warten(400);
    pruefe(
      (await nodo(seite, "teksto-ausgangslage")
        .locator("textarea[data-nr-teksto-kampo]")
        .first()
        .inputValue()) === "Werkstätten arbeiten unter schlechtem Licht. Auch abends.",
      "AK-13",
      "nach „Marken“ → provo → zurück ist die letzte Eingabe da",
    );

    // --- Pinterest: preview, three images taken ------------------------------------------------
    await klick(seite, seite.locator("[data-nr-aldoni]"));
    await klick(seite, seite.locator('[data-nr-menuo] [data-nr-aldoneblo="Beispiele"]'));
    await nodo(seite, "beispiele").waitFor();
    await nodo(seite, "beispiele")
      .locator("[data-nr-beispiele-link]")
      .evaluate((el, a) => {
        const feld = el as HTMLInputElement;
        feld.value = a;
        feld.setAttribute("value", a);
      }, BRETT);
    await klick(seite, nodo(seite, "beispiele").locator("[data-nr-beispiele-ligi]"));
    const vorschau = seite.locator(`[data-nr-pinterest="${BRETT}"]`);
    await vorschau.locator("[data-nr-pinterest-bild]").first().waitFor();
    const gezeigt = await vorschau.locator("[data-nr-pinterest-bild]").count();
    pruefe(gezeigt === 12, "AK-15", `Titel und zwölf Vorschaubilder (${gezeigt})`);
    for (let i = 0; i < 3; i++) {
      await klick(
        seite,
        vorschau.locator("[data-nr-pinterest-bild]").nth(i).locator("[data-nr-pinterest-nehmen]"),
      );
      await warteBis(
        seite,
        "AK-1",
        `Bild ${i + 1} genommen`,
        async () =>
          (await nodo(seite, "beispiele").locator("[data-nr-beispiel]").count()) === i + 1,
      );
    }
    pruefe(
      (await vorschau.locator("[data-nr-genommen]").count()) === 3,
      "AK-1",
      "drei Bilder aus der Vorschau genommen",
    );
    await gespeichert(seite);
    await zeige(seite, ["beispiele"], 0.9);
    await bildVon(seite, ordner, "04-pinterest-vorschau", [nodo(seite, "beispiele")]);

    // --- Layout-Beispiel, „Aufbau erkennen“ ----------------------------------------------------
    await seite.locator("[data-nr-layout-dosiero]").setInputFiles(layoutDatei);
    await seite.locator(`[data-nr-layout-datei="${"layout-beispiel-lumeto.png"}"]`).waitFor();
    pruefe(
      summeVokoj() === 0,
      "AK-6",
      "kein Modellaufruf bis hierher (Laden, Tippen, Wechseln, Pinterest, Hochladen)",
    );
    await warteBis(seite, "Layout-Beispiel", "„Aufbau erkennen“ bereit", async () =>
      seite
        .locator('[data-nr-ki-knopo="aufbau"][data-nr-pret="true"]')
        .evaluate((el) => !el.hasAttribute("disabled")),
    );
    await vorKlick(basis, kasse, "aufbau");
    const aufbauAntwort = seite.waitForResponse((r) =>
      r.url().endsWith(`/api/marko/${MARKE}/ki/aufbau`),
    );
    await klick(seite, seite.locator('[data-nr-ki-knopo="aufbau"]'));
    await nachKlick(seite, kasse, aufbauAntwort);
    await seite.locator("[data-nr-layout-merkmale]").waitFor();
    const zielAufbau = kasse.echt ? null : "raster";
    if (zielAufbau !== null) {
      for (const id of ["vorschau-hell", "vorschau-dunkel"]) {
        await warteKadro(seite, "AK-18", id, zielAufbau);
        pruefe(
          JSON.stringify(await punktAufbau(seite, id)) === '["raster"]',
          "AK-19",
          `${id}: Punkt am Aufbau des Layout-Beispiels`,
        );
        pruefe(
          (
            (await seite.locator(`[data-nr-vorschau-grund="${id}"]`).textContent()) ?? ""
          ).startsWith("wie Layout-Beispiel · Kartenraster, weil"),
          "AK-18",
          `${id}: Grund genannt`,
        );
      }
    }
    await zeige(seite, ["layout-beispiel", "vorschau-hell"], 0.6);
    await bildVon(seite, ordner, "05-layout-beispiel", [
      nodo(seite, "layout-beispiel"),
      nodo(seite, "vorschau-hell"),
    ]);

    // --- „Marke auswerten“ ------------------------------------------------------------------------
    const marko = nodo(seite, "marko");
    await warteBis(seite, "AK-2", "Preis vor dem Klick", async () =>
      /^≈ /.test((await marko.locator("[data-nr-ki-schaetzung]").textContent()) ?? ""),
    );
    await vorKlick(basis, kasse, "profil");
    const profilAntwort = seite.waitForResponse((r) =>
      r.url().endsWith(`/api/marko/${MARKE}/ki/profil`),
    );
    await klick(seite, seite.locator('[data-nr-ki-knopo="profil"]'));
    await nachKlick(seite, kasse, profilAntwort);
    await marko.locator("[data-nr-profil]").waitFor();
    for (const t of ["kernsatz", "leitgedanken", "charakter", "passt", "reibt", "vorschlag"])
      pruefe(
        (await marko.locator(`[data-nr-profil-teil="${t}"]`).count()) === 1,
        "AK-2",
        `Markenprofil: ${t}`,
      );
    pruefe(
      /\$/.test((await marko.locator("[data-nr-ki-kosto]").textContent()) ?? ""),
      "AK-2",
      "tatsächlicher Preis danach",
    );
    await klick(seite, marko.locator(".nr-g-marko-kapo"));
    await seite.locator('aside[data-nr-flanko="marko"]').waitFor();
    await zeige(seite, ["marko"], 0.7);
    await bild(seite, ordner, "06-markenprofil");

    // --- „Vorschlag übernehmen“: one Stand, colours and fonts ---------------------------------
    const staendeVorher = (
      (await (await fetch(`${basis}/api/marko/${MARKE}/staende`)).json()) as unknown[]
    ).length;
    await klick(seite, marko.locator("[data-nr-vorschlag-alle]"));
    await warteBis(
      seite,
      "AK-2",
      "alle vier Teile übernommen",
      async () =>
        (await nodo(seite, "marko")
          .locator("[data-nr-vorschlag-teil] [data-nr-uebernommen]")
          .count()) === 4,
    );
    await gespeichert(seite);
    const staende = (await (await fetch(`${basis}/api/marko/${MARKE}/staende`)).json()) as {
      name: string;
    }[];
    pruefe(
      staende.length === staendeVorher + 1 &&
        /^vor Übernahme, \d\d:\d\d$/.test(staende[0]?.name ?? ""),
      "AK-11",
      `genau ein Stand „${staende[0]?.name}“`,
    );
    pruefe(
      (await nodo(seite, "schrift").count()) === 1,
      "AK-2",
      "Schrift-Knoten beim Übernehmen hinzugefügt",
    );
    await einpassen(seite);
    await bild(seite, ordner, "07-vorschlag-uebernommen");

    // --- AK-3 and AK-19: every layout by its button, light and dark ----------------------------
    const H = "vorschau-hell";
    const D = "vorschau-dunkel";
    const akzentZahlen: string[] = [];
    for (const aufbau of ["titel", "raster", "liste"]) {
      for (const id of [H, D]) {
        await klick(
          seite,
          seite.locator(`[data-nr-vorschau-aufbau="${id}"] [data-nr-aufbau="${aufbau}"]`),
        );
        const s = await warteKadro(seite, "AK-19", id, aufbau);
        pruefe(
          s.aufbau === aufbau && s.scheme === (id === H ? "light" : "dark"),
          "AK-19",
          `${id}: Knopf ${aufbau} zeigt seine Seite (${s.scheme})`,
        );
        pruefe(
          (await aktiverAufbau(seite, id)) === aufbau,
          "AK-19",
          `${id}: ${aufbau} hervorgehoben`,
        );
        const n = await pruefeAkzent(seite, id, `AK-3 ${aufbau} ${id === H ? "hell" : "dunkel"}`);
        akzentZahlen.push(`${aufbau}/${id === H ? "hell" : "dunkel"} ${n}`);
      }
      if (aufbau === "titel") {
        await zeige(seite, [H], 0.95);
        await bildVon(seite, ordner, "08-marke-titel-hell", [nodo(seite, H)]);
        await zeige(seite, [D], 0.95);
        await bildVon(seite, ordner, "09-marke-titel-dunkel", [nodo(seite, D)]);
      } else {
        await zeige(seite, [H], 0.95);
        await bildVon(seite, ordner, aufbau === "raster" ? "10-marke-raster" : "11-marke-liste", [
          nodo(seite, H),
        ]);
      }
    }
    console.log(`Akzent-Stellen je Aufbau/Schema: ${akzentZahlen.join(", ")}`);
    if (!kasse.echt) {
      pruefe(
        JSON.stringify(await punktAufbau(seite, H)) === '["raster"]',
        "AK-19",
        "der Punkt bleibt am Aufbau des Layout-Beispiels",
      );
      await klick(seite, seite.locator(`[data-nr-aufbau-auto="${H}"]`));
      await warteKadro(seite, "AK-19", H, "raster");
      pruefe(
        ((await seite.locator(`[data-nr-vorschau-grund="${H}"]`).textContent()) ?? "").startsWith(
          "wie Layout-Beispiel",
        ),
        "AK-19",
        "„wie Layout-Beispiel“ gibt die Wahl zurück",
      );
    }
    // „Komponenten“: the row disabled, one accent place more.
    await klick(
      seite,
      seite.locator(`[data-nr-vorschau-ansicht="${H}"] [data-nr-ansicht-wahl="komponenten"]`),
    );
    await warteKadro(seite, "AK-19", H, null);
    const aus = await seite.evaluate(
      (id) =>
        [...document.querySelectorAll(`[data-nr-vorschau-aufbau="${id}"] [data-nr-aufbau]`)].map(
          (e) => e.hasAttribute("disabled"),
        ),
      H,
    );
    pruefe(
      aus.length === 3 && aus.every(Boolean),
      "AK-19",
      "in „Komponenten“ sind die Aufbau-Knöpfe abgeschaltet",
    );
    const komponenten = await akzentoj(seite, H);
    pruefe(
      komponenten !== null &&
        komponenten.filter((o) => o.sichtbar && o.gleich && o.art === "marke").length === 1,
      "AK-3",
      "„Komponenten“ zeigt die bisherige Vorschau mit einer Akzent-Stelle",
    );
    await zeige(seite, [H], 0.95);
    await bildVon(seite, ordner, "12-komponenten-akzent", [nodo(seite, H)]);
    await klick(
      seite,
      seite.locator(`[data-nr-vorschau-ansicht="${H}"] [data-nr-ansicht-wahl="marke"]`),
    );
    // Two previews, two layouts at once.
    await klick(seite, seite.locator(`[data-nr-vorschau-aufbau="${H}"] [data-nr-aufbau="liste"]`));
    await klick(seite, seite.locator(`[data-nr-vorschau-aufbau="${D}"] [data-nr-aufbau="titel"]`));
    await warteKadro(seite, "AK-19", H, "liste");
    await warteKadro(seite, "AK-19", D, "titel");
    pruefe(true, "AK-19", "zwei Vorschau-Knoten zeigen zwei Aufbauten (liste, titel)");
    await gespeichert(seite);
    await zeige(seite, [H, D], 0.6);
    await bildVon(seite, ordner, "16-zwei-aufbauten-nebeneinander", [
      nodo(seite, H),
      nodo(seite, D),
    ]);
    await laden(seite, basis);
    await warteKadro(seite, "AK-19", H, "liste");
    await warteKadro(seite, "AK-19", D, "titel");
    pruefe(true, "AK-19", "nach dem Neuladen dieselbe Wahl");

    // --- „Namen und Beschreibung“ -------------------------------------------------------------
    await klick(seite, seite.locator("[data-nr-aldoni]"));
    await klick(seite, seite.locator('[data-nr-aldoneblo="Namen und Beschreibung"]'));
    const namen = nodo(seite, "ki-namen");
    await namen.waitFor();
    await warteBis(seite, "AK-4", "„Vorschlagen“ bereit", async () =>
      seite
        .locator('[data-nr-ki-knopo="namen"][data-nr-pret="true"]')
        .evaluate((el) => !el.hasAttribute("disabled")),
    );
    await vorKlick(basis, kasse, "namen");
    const namenAntwort = seite.waitForResponse((r) =>
      r.url().endsWith(`/api/marko/${MARKE}/ki/namen`),
    );
    await klick(seite, seite.locator('[data-nr-ki-knopo="namen"]'));
    await nachKlick(seite, kasse, namenAntwort);
    await namen.locator("[data-nr-name-idee]").first().waitFor();
    const ideen = await namen.locator("[data-nr-name-idee]").count();
    pruefe(ideen >= 6 && ideen <= 8, "AK-4", `${ideen} Namensideen mit Begründung`);
    const erster =
      (await namen.locator("[data-nr-name-idee]").first().getAttribute("data-nr-name-idee")) ?? "";
    await klick(
      seite,
      namen.locator(`[data-nr-name-idee="${erster}"] [data-nr-uebernehmen="name"]`),
    );
    await warteBis(
      seite,
      "AK-4",
      "Kopfleiste zeigt den übernommenen Namen",
      async () => (await seite.locator("[data-nr-kapo-nomo]").textContent()) === erster,
    );
    await klick(seite, namen.locator('[data-nr-uebernehmen="beschreibung"]'));
    await gespeichert(seite);
    pruefe(
      ((await nodo(seite, "marko").textContent()) ?? "").includes(erster),
      "AK-4",
      "die Pille zeigt den Namen",
    );
    await warteBis(
      seite,
      "AK-16",
      "„veraltet“ am Markenprofil",
      async () => (await nodo(seite, "marko").locator("[data-nr-veraltet]").count()) > 0,
    );
    await zeige(seite, ["ki-namen", "marko"], 0.6);
    await bildVon(seite, ordner, "13-namen-und-beschreibung", [namen, nodo(seite, "marko")]);
    if (!kasse.echt)
      pruefe(
        JSON.stringify(modelo.vokoj) === JSON.stringify({ profil: 1, namen: 1, aufbau: 1 }) &&
          kiPosts.length === 3,
        "AK-6",
        `je Knopf genau ein Aufruf, sonst keiner (${JSON.stringify(modelo.vokoj)}, ${kiPosts.length} POST)`,
      );

    // --- AK-5: the fullest content at the start places, then „Anordnen“ with every node --------
    for (;;) {
      await klick(seite, seite.locator("[data-nr-aldoni]"));
      const neu = seite.locator('[data-nr-menuo] [data-nr-stato="anlegen"]');
      if ((await neu.count()) === 0) break;
      await klick(seite, neu);
    }
    await klick(seite, seite.locator('[data-nr-menuo] [data-nr-stato="weitere"]'));
    await seite.keyboard.press("Escape");
    await gespeichert(seite);
    await laden(seite, basis);
    await pruefeHoehen(seite, "volle Inhalte");
    await klick(seite, seite.locator("[data-nr-anordnung-zuruecksetzen]"));
    await gespeichert(seite);
    await einpassen(seite);
    await pruefeGeometrie(seite, "Startanordnung mit allen Knoten und vollen Inhalten");
    const vokojVorAnordnen = summeVokoj();
    await klick(seite, seite.locator("[data-nr-anordnen]"));
    await gespeichert(seite);
    await einpassen(seite);
    const geo = await pruefeGeometrie(seite, "AK-5 „Anordnen“", true);
    pruefe(
      geo.knoten.length >= 20,
      "AK-5",
      `mit allen wählbaren Knoten und einer weiteren Vorschau (${geo.knoten.length})`,
    );
    const vorher = await plaetze(seite);
    await bild(seite, ordner, "14-angeordnet");
    await laden(seite, basis);
    pruefe((await plaetze(seite)) === vorher, "AK-5", "nach dem Neuladen dieselben Plätze");
    pruefe(
      summeVokoj() === vokojVorAnordnen,
      "AK-6",
      "„Anordnen“, Hinzufügen und Neuladen rufen kein Modell",
    );

    // --- styling.md: every var(--fm-…) of this spec's sources has a value ----------------------
    const leinwandNamen = varNamen(GESTALTEN_058);
    const unbekanntL = await seite.evaluate((liste) => {
      const stil = getComputedStyle(document.getElementById("nr-leinwand") ?? document.body);
      return liste
        .filter((v) => stil.getPropertyValue(v.name).trim() === "")
        .map((v) => `${v.datei}: ${v.name}`);
    }, leinwandNamen);
    pruefe(
      unbekanntL.length === 0,
      "styling.md",
      `${leinwandNamen.length} var(--fm-…) der Leinwand-Quellen haben einen Wert (${unbekanntL.join(", ")})`,
    );
    const seitenNamen = varNamen(SEITE_058);
    const unbekanntS = await seite.evaluate(
      ({ id, liste }) => {
        const f = document.querySelector<HTMLIFrameElement>(
          `[data-nr-vorschau-kadro="${id}"] iframe[data-nr-vorschau-rahmen="gezeigt"]`,
        );
        const d = f?.contentDocument;
        const w = f?.contentWindow;
        if (!d || !w) return ["kein Rahmen"];
        const stil = w.getComputedStyle(d.documentElement);
        return liste
          .filter((v) => stil.getPropertyValue(v.name).trim() === "")
          .map((v) => `${v.datei}: ${v.name}`);
      },
      { id: H, liste: seitenNamen },
    );
    pruefe(
      unbekanntS.length === 0,
      "styling.md",
      `${seitenNamen.length} var(--fm-…) der Seite „Marke“ haben einen Wert (${unbekanntS.join(", ")})`,
    );

    pruefe(fehlerSeite.length === 0, "Seite", `keine Skriptfehler (${fehlerSeite.join(" | ")})`);
    console.log(
      `abgebrochene CDN-Anfragen der Vorschau: ${cdn.length}; andere fremde Anfragen: ${fremd.length}`,
    );
    pruefe(
      fremd.length === 0,
      "Netz",
      `keine Anfrage des Browsers nach außen außer der Vorschau-CDN (${[...new Set(fremd)].slice(0, 3).join(" ")})`,
    );
    pruefe(
      serverAbrufe.every((u) => u === BRETT || u.startsWith("https://i.pinimg.com/736x/")),
      "Netz",
      "der Server ruft nur das erfundene Board und seine Bilder ab (Doubles)",
    );

    // --- Without a model: everything usable, nothing red --------------------------------------
    await ohneModell(browser, ohneBasis, ordner, layoutDatei);
  } finally {
    await kontext.close();
  }
}

async function ohneModell(
  browser: Browser,
  basis: string,
  ordner: string,
  layoutDatei: string,
): Promise<void> {
  const fremd: string[] = [];
  const kontext = await neuerKontext(browser, basis, fremd);
  try {
    const seite = await kontext.newPage();
    await anlegen(basis, MARKE);
    await laden(seite, basis);
    await seite.locator("[data-nr-grundlagen-beschreibung]").click();
    await seite.keyboard.type("Lumeto baut Leuchten aus Altglas für kleine Werkstätten.");
    await seite.keyboard.press("Tab");
    await seite.locator("[data-nr-layout-dosiero]").setInputFiles(layoutDatei);
    await seite.locator("[data-nr-layout-datei]").waitFor();
    await klick(seite, seite.locator("[data-nr-aldoni]"));
    await klick(seite, seite.locator('[data-nr-aldoneblo="Namen und Beschreibung"]'));
    await nodo(seite, "ki-namen").waitFor();
    await gespeichert(seite);
    for (const zweck of ["profil", "namen", "aufbau"]) {
      const knopo = seite.locator(`[data-nr-ki-knopo="${zweck}"]`);
      await warteBis(
        seite,
        "AK-6 ohne Modell",
        `${zweck}: ruhig abgeschaltet`,
        async () =>
          (await knopo.getAttribute("data-nr-pret")) === "false" &&
          (await knopo.evaluate((el) => el.hasAttribute("disabled"))),
      );
    }
    const saetze = await seite.locator("[data-nr-ki-satz]").allTextContents();
    pruefe(
      saetze.length >= 3 && saetze.every((s) => s === "Kein Sprachmodell eingerichtet"),
      "AK-6 ohne Modell",
      `„Kein Sprachmodell eingerichtet“ an jedem KI-Knopf (${saetze.length})`,
    );
    await warteKadro(seite, "AK-6 ohne Modell", "vorschau-hell", "titel");
    const rot = await rotesDe(seite);
    pruefe(rot.length === 0, "AK-6 ohne Modell", `nichts ist rot (${rot.join("; ")})`);
    await einpassen(seite);
    await bild(seite, ordner, "15-ohne-schluessel");
    pruefe(fremd.length === 0, "Netz", "ohne Modell: keine Anfrage nach außen");
  } finally {
    await kontext.close();
  }
}

/** Relative paths count from where pnpm was called (INIT_CWD), not from the package. */
const vomAufruf = (pfad: string): string => resolve(process.env.INIT_CWD ?? process.cwd(), pfad);

async function main(): Promise<number> {
  const { values } = parseArgs({
    options: { ziel: { type: "string" }, echt: { type: "boolean" } },
    strict: true,
  });
  if (values.ziel === undefined) {
    console.error(
      "Kein --ziel angegeben: das Skript schreibt nichts. Aufruf: pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-058.ts --ziel <bilder-ordner> [--echt]",
    );
    return 2;
  }
  const fehlt = [DIST, LEINWAND].filter((datei) => {
    try {
      readFileSync(datei);
      return false;
    } catch {
      return true;
    }
  });
  if (fehlt.length > 0) {
    console.error(
      `Nicht gebaut: ${fehlt.join(", ")}. Zuerst im Repo-Wurzelverzeichnis: ${BAU_BEFEHL}`,
    );
    return 2;
  }
  const echt = values.echt === true;
  const ordner = vomAufruf(values.ziel);
  mkdirSync(ordner, { recursive: true });
  const m = (await import(pathToFileURL(DIST).href)) as MetiejoDist;

  const scratch = await mkdtemp(join(tmpdir(), "nr-bilder-058-"));
  const servilo = async (
    sub: string,
    ki: Record<string, unknown> | undefined,
  ): Promise<Servilo> => {
    const root = join(scratch, sub);
    const workdir = join(root, m.MARKEN_DIR);
    mkdirSync(workdir, { recursive: true });
    return m.startServilo(
      {
        port: 0,
        workdir,
        root,
        settings: m.settingsOf(m.parseEnv("")),
        deps: {
          remoteUrl: () => join(scratch, "nenie.git"),
          visibility: async () => "unknown",
          git: () => "",
          cacheDir: join(scratch, "cache"),
          env: {},
        },
        npm: { ...npmOffline, cacheDir: join(scratch, "npm") },
        esploro: {
          fetch: esploroDouble,
          bildilo: {
            bildigi: () => Promise.reject(new Error("kein Browser im Server")),
            malkodi: () => Promise.reject(new Error("kein Browser im Server")),
          },
        },
        ...(ki === undefined ? {} : { ki }),
      },
      { stderr: (t) => process.stderr.write(t) },
    );
  };
  let ki: Record<string, unknown>;
  if (echt) {
    // The one real run: the Metiejo's own model access, read by the product as `fm metiejo` does.
    const echtKi = m.readKi(REPO);
    if (echtKi.provider === undefined) {
      console.error(`--echt: ${echtKi.satz ?? "kein Sprachmodell eingerichtet"}`);
      return 2;
    }
    ki = { ...echtKi, limoj: m.LIMOJ[echtKi.provider.name] };
  } else {
    ki = {
      provider: new m.Provider("mistral", "ministral-14b-2512", "sk-bilder-058-double"),
      fetch: modelDouble,
      sleep: () => Promise.resolve(),
    };
  }
  const mit = await servilo("mit", ki);
  const ohne = await servilo("ohne", undefined);
  const kasse: Kasse = { echt, summe: 0 };
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch();
    const basis = `http://127.0.0.1:${mit.port}`;
    console.log(
      `Metiejo ${basis} (${echt ? "echtes Modell" : "Modell-Double"}), ohne Modell http://127.0.0.1:${ohne.port}, Chromium ${browser.version()}, ${VIEWPORT.width}×${VIEWPORT.height}`,
    );
    await lauf(browser, basis, `http://127.0.0.1:${ohne.port}`, ordner, scratch, kasse);
    const bilder = readdirSync(ordner).filter((d) => /^\d\d-.*\.png$/.test(d));
    pruefe(bilder.length === 16, "Bilder", `16 Bilder in ${pathToFileURL(ordner).href}`);
    if (echt)
      console.log(`echter Durchlauf: Kosten ${kasse.summe.toFixed(4)} $ (Kappe ${KAPPE_USD} $)`);
    return 0;
  } catch (fehler) {
    console.error(
      `Abgebrochen: ${fehler instanceof Error ? fehler.message.split("\n")[0] : String(fehler)}`,
    );
    return 1;
  } finally {
    await browser?.close();
    await mit.close();
    await ohne.close();
    rmSync(scratch, { recursive: true, force: true });
  }
}

process.exitCode = await main();
