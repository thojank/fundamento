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

import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { cpus, loadavg, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fetchA, MARKO_URL, NEBEN, PRAEGEND } from "../src/test-doubles/weg-c.js";

const root = resolve(import.meta.dirname, "..", "..", "..");
const args = process.argv.slice(2);
const mitModell = args.includes("--mit-modell");
const m = (await import(
  join(root, "packages/metiejo/dist/index.js")
)) as typeof import("../src/index.js");

const envFile = args.includes("--env")
  ? resolve(args[args.indexOf("--env") + 1] ?? "")
  : join(root, ".env");
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
    esploro: { fetch: fetchA },
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
  body: JSON.stringify({ nomo: "Ekzemplo", url: MARKO_URL, rajtoj: true }),
});
const body = (await response.json()) as {
  satz?: string;
  proponoj?: { faceto: string; agordo: { leitfarbe?: string } }[];
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
const lead = body.proponoj?.find((propono) => propono.faceto === "gvidkoloro")?.agordo.leitfarbe;
console.log(`\nWeg C ${modelo === undefined ? "ohne Sprachmodell" : `mit ${modelo}`}`);
console.log(`  Last (Mittel 1 min): ${loadavg()[0]?.toFixed(1)} bei ${cpus().length} Kernen`);
if (!response.ok) console.log(`  Antwort des Servers ${response.status}: ${body.satz ?? ""}`);
console.log(`  Seiten gelesen: ${(body.seitoj ?? []).join(", ") || "keine"}`);
console.log(
  `  Leitfarbe: ${lead ?? "keine"} – prägende Farbe ${PRAEGEND} ${lead === PRAEGEND ? "getroffen" : `verfehlt${lead === NEBEN ? ` (Nebenfarbe ${NEBEN} aus dem CSS)` : ""}`}`,
);
console.log(`  Hinweise: ${(body.notoj ?? []).join(" ") || "keine"}`);
console.log(`  Antwort: ${body.antwort ?? ""}`);
console.log(
  `  Tokens ein ${kosto.enigo}, aus ${kosto.eligo}, Anfragen ${kosto.requests}, Kosten ${usd === undefined ? "ohne Preis" : `${usd.toFixed(5)} $`}, Dauer ${(dauer / 1000).toFixed(1)} s (Recherche ${(kosto.ms / 1000).toFixed(1)} s)`,
);
if (body.zaehlilo !== undefined) console.log(`  Zähler: ${body.zaehlilo.satz}`);
console.log(
  `  Schlüssel in Kroniko oder Log: ${secrets.some((secret) => raw.includes(secret)) ? "JA – FEHLER" : "nein"}`,
);
