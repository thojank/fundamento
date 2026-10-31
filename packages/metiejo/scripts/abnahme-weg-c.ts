// Spec 035, Befund 4.7 (Weg C): the research of a brand only named, on the synthetic page A of the
// tests (src/test-doubles/weg-c/) under the reserved domain marko.example (RFC 2606), through the
// local server as `pnpm fm metiejo` runs it (dist), started in this process for a throw-away brand
// in a temporary folder. The page and every file it loads come from the fixture through the fetch
// of Weg C: no network for the page. The renderer is the server's own – Playwright and Chromium if
// installed (`pnpm --filter @fundamento/eroj exec playwright install chromium`), else Weg C reads the
// code and says so in one sentence.
//
// Without --mit-modell no language model is asked (0 tokens): Weg C reads the given address and
// the brand page it links to. With --mit-modell the agent runs over Mistral ministral-14b-2512 (the
// maintainer's tariff) whatever the .env names, with a cost limit of 30 000 tokens per turn and the
// provider's limits (LIMOJ). The key never leaves the server: the script prints only whether it
// stands in the Kroniko or the log.
//
//   cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
//   pnpm build
//   pnpm --filter @fundamento/metiejo exec tsx scripts/abnahme-weg-c.ts [--mit-modell]
//     [--env <Pfad der .env>, ohne: die .env des Checkouts]
//     [--unbunt | --foto [img|hintergrund|picture] | --marke <datei> --ergebnis <datei>]
//     [--baum <Pfad eines gebauten Checkouts>]
//
// Spec 036, Befund 2.1: with --unbunt the page is the synthetic achromatic brand „Inko“ of the tests
// (src/test-doubles/unbunt/, inko.example): black, white and cream with three small pastel accents.
// The script prints the proposed lead colour, whether it is a very dark neutral, and its sentence.
//
// Spec 036, Befund 2.3: with --foto the page is the synthetic brand „Ruvelo“ of the tests
// (src/test-doubles/foto/, ruvelo.example): its defining colour only in a large product photo of
// the first screen – as img (default), background image or picture element –, the background of
// the page another colour. With --marke the address is a real brand's, read over the network, given
// in a JSON file outside the repo ({ "nomo", "url", "praegend" }, R-7): the script prints no name,
// no address and no colour value, only counts, shares and hit yes/no; everything else goes into
// the file of --ergebnis (outside the repo, mode 600). With --baum the server, renderer and
// measurement of another built checkout run (the „vorher“ of a comparison), the pages of the
// fixtures still come from this one. Both modes print the share of the defining colour – its
// family: the tones up to akzent.gleich_bis apart in the colour plane of OKLab – in the weighted
// screenshot of the pages read, measured with the weights of the checkout that runs.

import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { cpus, loadavg, tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { parseAgordoColor } from "@fundamento/agordilo";
import type { Bildigo, Bildilo, Pagxo } from "../src/enportilo/bildilo.js";
import { farbAbstand, KREILO } from "../src/kreilo/kreilo.js";
import { FOTO_SEITOJ, fetchFoto, HINTERGRUND, PRODUKT } from "../src/test-doubles/foto.js";
import { fetchInko, INKO, INKO_URL } from "../src/test-doubles/unbunt.js";
import { fetchA, MARKO_URL, NEBEN, PRAEGEND } from "../src/test-doubles/weg-c.js";

const repo = resolve(import.meta.dirname, "..", "..", "..");
const args = process.argv.slice(2);
const argOf = (name: string) =>
  args.includes(name) ? resolve(args[args.indexOf(name) + 1] ?? "") : undefined;
const mitModell = args.includes("--mit-modell");
const unbunt = args.includes("--unbunt");
const fotoArt = args.includes("--foto")
  ? ((["img", "hintergrund", "picture"] as const).find(
      (art) => art === args[args.indexOf("--foto") + 1],
    ) ?? "img")
  : undefined;
const markeFile = argOf("--marke");
const ergebnisFile = argOf("--ergebnis");
const root = argOf("--baum") ?? repo;
if (markeFile !== undefined && ergebnisFile === undefined)
  throw new Error("--marke braucht --ergebnis <datei> außerhalb des Repos.");
// Real paths: /tmp may be a link (macOS), and a link must not lead into the repo either.
const real = (file: string) => join(realpathSync(dirname(file)), basename(file));
for (const file of [markeFile, ergebnisFile])
  if (file !== undefined && !relative(realpathSync(repo), real(file)).startsWith(".."))
    throw new Error("Daten echter Marken nur außerhalb des Repos (R-7).");
const marke =
  markeFile === undefined
    ? undefined
    : (JSON.parse(readFileSync(markeFile, "utf8")) as {
        nomo: string;
        url: string;
        praegend: string;
      });
const dist = join(root, "packages/metiejo/dist");
const m = (await import(join(dist, "index.js"))) as typeof import("../src/index.js");
const { playwrightBildilo } = (await import(
  join(dist, "enportilo/bildilo.js")
)) as typeof import("../src/enportilo/bildilo.js");
const farboj = (await import(
  join(dist, "enportilo/farboj.js")
)) as typeof import("../src/enportilo/farboj.js");

// The renderer of the checkout that runs, recording what it rendered for the share below.
const bildigoj: Bildigo[] = [];
const server = playwrightBildilo();
const bildilo: Bildilo = {
  bildigi: async (pagxo: Pagxo) => {
    const bildigo = await server.bildigi(pagxo);
    bildigoj.push(bildigo);
    return bildigo;
  },
  malkodi: (bytes, tipo) => server.malkodi(bytes, tipo),
};

const envFile = argOf("--env") ?? join(repo, ".env");
const env = m.parseEnv(existsSync(envFile) ? readFileSync(envFile, "utf8") : "");
const ki = mitModell
  ? m.kiOf({ ...env, FM_KI_ANBIETER: "mistral", FM_KI_MODELL: "ministral-14b-2512" })
  : {};
if (mitModell && ki.provider === undefined) throw new Error("MISTRAL_API_KEY fehlt in der .env.");
const secrets = [env.MISTRAL_API_KEY, env.OPENROUTER_API_KEY, env.OPENAI_API_KEY].filter(
  (value): value is string => typeof value === "string" && value.length > 8,
);

const start = Date.now();
const scratch = mkdtempSync(join(tmpdir(), "fm-abnahme-weg-c-"));
const workdir = join(scratch, "marken");
const log: string[] = [];
const servilo = await m.startServilo(
  {
    port: 0,
    workdir,
    root: scratch,
    settings: m.settingsOf({}),
    ki: ki.provider === undefined ? {} : { ...ki, limo: 30_000, limoj: m.LIMOJ[ki.provider.name] },
    esploro: {
      bildilo,
      ...(marke !== undefined
        ? {}
        : { fetch: unbunt ? fetchInko : fotoArt !== undefined ? fetchFoto : fetchA }),
    },
  },
  { stderr: (text) => log.push(text) },
);
await fetch(`${servilo.url}/marko`, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: "name=ekzemplo&basis=komuna",
  redirect: "manual",
});
const response = await fetch(`${servilo.url}/api/marko/ekzemplo/esplori`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    nomo: marke?.nomo ?? (unbunt ? "Inko" : fotoArt !== undefined ? "Ruvelo" : "Ekzemplo"),
    url:
      marke?.url ?? (unbunt ? INKO_URL : fotoArt !== undefined ? FOTO_SEITOJ[fotoArt] : MARKO_URL),
    rajtoj: true,
  }),
});
const body = (await response.json()) as {
  satz?: string;
  proponoj?: { faceto: string; agordo: { leitfarbe?: string }; satz?: string }[];
  seitoj?: string[];
  antwort?: string;
  notoj?: string[];
  kosto?: { enigo: number; eligo: number; ms: number; requests: number };
  zaehlilo?: { satz: string };
};
const dauer = Date.now() - start;
const kroniko = join(workdir, "ekzemplo", "kroniko.jsonl");
const raw = (existsSync(kroniko) ? readFileSync(kroniko, "utf8") : "") + log.join("");
await servilo.close();
rmSync(scratch, { recursive: true, force: true });

const kosto = body.kosto ?? { enigo: 0, eligo: 0, ms: 0, requests: 0 };
const modelo = ki.provider?.toString();
const usd = modelo === undefined ? 0 : m.kostoOf(modelo, kosto);
const gvidkoloro = body.proponoj?.find((propono) => propono.faceto === "gvidkoloro");
const lead = gvidkoloro?.agordo.leitfarbe;
const leadShare = /\((\d+) % der gefundenen Farbe\)/.exec(gvidkoloro?.satz ?? "")?.[1];

// The defining colour's family in the weighted screenshots: every pixel with the weight of its
// place (the checkout's own weights), counted when its tone is up to gleich_bis from the defining
// colour in the colour plane of OKLab.
const praegend = marke?.praegend ?? (fotoArt !== undefined ? PRODUKT : unbunt ? INKO : PRAEGEND);
const target = parseAgordoColor(praegend);
const near = (colour: string) => {
  const oklch = parseAgordoColor(colour);
  return target !== undefined && oklch !== undefined
    ? farbAbstand(oklch, target) <= KREILO.akzent.gleich_bis
    : false;
};
let family = 0;
let weighted = 0;
const tones = new Map<number, boolean>();
for (const { bildo, logoj, bildoj } of bildigoj) {
  const pezoj = farboj.pezojOfEkrano(
    bildo.width,
    bildo.height,
    { width: 1280, height: 800 },
    logoj,
    bildoj,
  );
  for (let index = 0; index + 3 < bildo.rgba.length; index += 4) {
    if ((bildo.rgba[index + 3] ?? 0) < 128) continue;
    const key =
      ((bildo.rgba[index] ?? 0) << 16) |
      ((bildo.rgba[index + 1] ?? 0) << 8) |
      (bildo.rgba[index + 2] ?? 0);
    let inFamily = tones.get(key);
    if (inFamily === undefined) {
      inFamily = near(`#${key.toString(16).padStart(6, "0")}`);
      tones.set(key, inFamily);
    }
    const weight = pezoj[index / 4] ?? 1;
    weighted += weight;
    if (inFamily) family += weight;
  }
}
const familyShare = weighted === 0 ? 0 : (100 * family) / weighted;
const hit = lead !== undefined && near(lead);

console.log(`\nWeg C ${modelo === undefined ? "ohne Sprachmodell" : `mit ${modelo}`}`);
console.log(`  Last (Mittel 1 min): ${loadavg()[0]?.toFixed(1)} bei ${cpus().length} Kernen`);
console.log(`  Messung: ${root === repo ? "dieser Checkout" : `Checkout ${root}`}`);
if (marke !== undefined) {
  const notoj = body.notoj ?? [];
  console.log(
    `  Marke aus ${basename(markeFile ?? "")} (Name, Adresse und Farbwerte nur im Ergebnis)`,
  );
  if (!response.ok) console.log(`  Antwort des Servers ${response.status}`);
  console.log(`  Seiten gelesen: ${(body.seitoj ?? []).length}, gerendert: ${bildigoj.length}`);
  console.log(
    `  Blockiert: ${notoj.some((satz) => satz.includes("blockiert")) ? "ja" : "nein"}, ohne Browser: ${notoj.some((satz) => satz.startsWith("Ohne Browser")) ? "ja" : "nein"}, nicht darstellbar: ${notoj.some((satz) => satz.includes("nicht darstellen")) ? "ja" : "nein"}`,
  );
  console.log(
    `  Leitfarbe: ${lead === undefined ? "keine" : `in der Familie der prägenden Farbe: ${hit ? "ja (getroffen)" : "nein (verfehlt)"}, ${leadShare ?? "?"} % der gefundenen Farbe`}`,
  );
  console.log(
    `  Prägende Farbe (Familie) im gewichteten Bildschirm: ${familyShare.toFixed(1).replace(".", ",")} %`,
  );
  writeFileSync(
    ergebnisFile ?? "",
    `${JSON.stringify({ zeit: new Date().toISOString(), baum: root, modelo: modelo ?? null, status: response.status, ...body, leitfarbe: lead ?? null, getroffen: hit, anteilFamilie: Math.round(familyShare * 10) / 10 }, null, 1)}\n`,
    { mode: 0o600 },
  );
  chmodSync(ergebnisFile ?? "", 0o600);
} else {
  if (!response.ok) console.log(`  Antwort des Servers ${response.status}: ${body.satz ?? ""}`);
  console.log(`  Seiten gelesen: ${(body.seitoj ?? []).join(", ") || "keine"}`);
}
if (marke !== undefined) {
  // Printed above, anonymously.
} else if (fotoArt !== undefined) {
  console.log(
    `  Leitfarbe: ${lead ?? "keine"} (${leadShare ?? "?"} % der gefundenen Farbe) – Produktfoto als ${fotoArt}, prägende Farbe ${PRODUKT} ${lead === PRODUKT ? "getroffen" : `verfehlt${lead === HINTERGRUND ? ` (Hintergrund ${HINTERGRUND})` : ""}`}`,
  );
  console.log(
    `  Prägende Farbe (Familie) im gewichteten Bildschirm: ${familyShare.toFixed(1).replace(".", ",")} %`,
  );
} else if (unbunt) {
  console.log(
    `  Leitfarbe: ${lead ?? "keine"} – unbunte Marke, Tinte ${INKO} ${lead === INKO ? "getroffen" : "verfehlt"}`,
  );
  console.log(`  Satz: ${gvidkoloro?.satz ?? "keiner"}`);
} else {
  console.log(
    `  Leitfarbe: ${lead ?? "keine"} – prägende Farbe ${PRAEGEND} ${lead === PRAEGEND ? "getroffen" : `verfehlt${lead === NEBEN ? ` (Nebenfarbe ${NEBEN} aus dem CSS)` : ""}`}`,
  );
}
if (marke === undefined) {
  console.log(`  Hinweise: ${(body.notoj ?? []).join(" ") || "keine"}`);
  console.log(`  Antwort: ${body.antwort ?? ""}`);
}
console.log(
  `  Tokens ein ${kosto.enigo}, aus ${kosto.eligo}, Anfragen ${kosto.requests}, Kosten ${usd === undefined ? "ohne Preis" : `${usd.toFixed(5)} $`}, Dauer ${(dauer / 1000).toFixed(1)} s (Recherche ${(kosto.ms / 1000).toFixed(1)} s)`,
);
if (body.zaehlilo !== undefined) console.log(`  Zähler: ${body.zaehlilo.satz}`);
console.log(
  `  Schlüssel in Kroniko oder Log: ${secrets.some((secret) => raw.includes(secret)) ? "JA – FEHLER" : "nein"}`,
);
