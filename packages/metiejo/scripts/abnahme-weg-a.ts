// Spec 033, Abnahme 1 and 5: Weg A of a throw-away brand in a temporary folder, through the local
// server as `pnpm fm metiejo` runs it (dist), with the time of every step (B-13). Five sentences, two
// synthetic inspiration images, two wishes in the chat, all twelve steps released, Prüfung, export,
// `fm projekcioj build`. Before the start the server's estimate of Weg A; at the end estimate against
// measurement (±50 %) and the counter of the Kroniko.
//
// Without --mit-modell no language model is asked (0 tokens): the Kreilo takes the lead colour from
// the images, the two wishes are left out – for the local steps only. With --mit-modell the chat runs
// over Mistral ministral-14b-2512 (the maintainer's tariff) whatever the .env names, with a cost limit
// of 30 000 tokens per turn and the provider's limits (LIMOJ). The key never leaves the server: the
// script prints only whether it stands in the Kroniko or the log.
//
//   cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
//   pnpm build
//   pnpm --filter @fundamento/metiejo exec tsx scripts/abnahme-weg-a.ts [--mit-modell] [--laeufe 3]
//     [--env <Pfad der .env>, ohne: die .env des Checkouts]

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { cpus, loadavg, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { CELO_WEG_A, inspiroWegA, KARAKTERO_WEG_A } from "../src/test-doubles/weg-a.js";

const root = resolve(import.meta.dirname, "..", "..", "..");
const args = process.argv.slice(2);
const mitModell = args.includes("--mit-modell");
const laeufe = Number(args[args.indexOf("--laeufe") + 1] ?? 1) || 1;
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

async function lauf(nummer: number): Promise<Record<string, number>> {
  // B-13: per step the wall clock and the CPU time of this process (the server runs in it); for the
  // projections the CPU time of the child process. Wall far above CPU: the step waited – for the
  // processor (load) or the disk.
  const schritte: Record<string, { ms: number; cpu: number }> = {};
  let mark = Date.now();
  let cpuMark = process.cpuUsage();
  const schritt = (name: string, childCpu?: number) => {
    const now = Date.now();
    const cpu = process.cpuUsage(cpuMark);
    schritte[name] = {
      ms: now - mark,
      cpu: childCpu ?? Math.round((cpu.user + cpu.system) / 1000),
    };
    mark = now;
    cpuMark = process.cpuUsage();
  };
  const start = Date.now();
  const scratch = mkdtempSync(join(tmpdir(), "fm-abnahme-weg-a-"));
  const workdir = join(scratch, "marken");
  const log: string[] = [];
  const servilo = await m.startServilo(
    {
      port: 0,
      workdir,
      root: scratch,
      settings: m.settingsOf({}),
      ki:
        ki.provider === undefined ? {} : { ...ki, limo: 30_000, limoj: m.LIMOJ[ki.provider.name] },
    },
    { stderr: (text) => log.push(text) },
  );
  const post = (path: string, body: unknown) =>
    fetch(servilo.url + path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  schritt("Server starten");
  await fetch(`${servilo.url}/marko`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "name=pano&basis=komuna",
    redirect: "manual",
  });
  const takso = (await (await fetch(`${servilo.url}/api/marko/pano/takso`)).json()) as {
    modelo: string;
    vojoj: { A: { satz: string; enigo: number; eligo: number; ms: number; usd?: number } };
  };
  schritt("Marke anlegen, Schätzung");
  const kreilo = await post("/api/marko/pano/kreilo", {
    celo: CELO_WEG_A,
    karaktero: KARAKTERO_WEG_A,
    festgelegt: {},
    inspiro: inspiroWegA().map(({ filename, bytes }) => ({
      filename,
      base64: bytes.toString("base64"),
    })),
    rajtoj: true,
  });
  if (!kreilo.ok) throw new Error(`Kreilo: ${kreilo.status}`);
  schritt("Kreilo");
  if (mitModell) {
    for (const [faceto, teksto] of [
      ["gvidkoloro", "Die Leitfarbe etwas wärmer, bitte."],
      ["formo", "Etwas runder."],
    ] as const) {
      const turn = await post("/api/marko/pano/asistanto", { teksto, faceto });
      if (!turn.ok) throw new Error(`Chat ${faceto}: ${turn.status}`);
    }
    schritt("zwei Wünsche im Chat");
  }
  const stato = (await (await fetch(`${servilo.url}/api/marko/pano/stato`)).json()) as {
    facetoj: { name: string; stato: string }[];
  };
  for (const faceto of stato.facetoj) {
    if (faceto.stato === "offen")
      await post("/api/marko/pano/faceto", { faceto: faceto.name, ago: "akcepto" });
    await post("/api/marko/pano/faceto", { faceto: faceto.name, ago: "liberigo" });
  }
  const fertig = (await (await fetch(`${servilo.url}/api/marko/pano/stato`)).json()) as {
    prozent: number;
    zaehlilo: { satz: string; enigo: number; eligo: number; ms: number };
  };
  schritt("zwölf Freigaben");
  const pruefung = (await (await post("/api/marko/pano/pruefung", {})).json()) as {
    exportable: boolean;
  };
  schritt("Prüfung");
  await fetch(`${servilo.url}/studio/pano/speichern`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "eksporto-aspekto=ja&eksporto-css=ja&eksporto-figma=ja",
    redirect: "manual",
  });
  const eksporto = join(workdir, "pano", "eksporto");
  schritt("Export");
  const projekcioj = spawnSync(
    "/usr/bin/time",
    [
      "-p",
      process.execPath,
      join(root, "packages/cli/dist/index.js"),
      "projekcioj",
      "build",
      "--config",
      join(eksporto, "fundamento.config.json"),
      "--out",
      join(eksporto, "projekcioj"),
    ],
    { encoding: "utf8" },
  );
  if (projekcioj.status !== 0) throw new Error("fm projekcioj build ist fehlgeschlagen.");
  const seconds = (label: string) =>
    Number(new RegExp(`^${label}\\s+([\\d.]+)`, "m").exec(projekcioj.stderr)?.[1] ?? 0);
  schritt("Projektionen", Math.round((seconds("user") + seconds("sys")) * 1000));
  const gesamt = Date.now() - start;
  const raw = readFileSync(join(workdir, "pano", "kroniko.jsonl"), "utf8") + log.join("");
  await servilo.close();
  const A = takso.vojoj.A;
  const tokens = fertig.zaehlilo.enigo + fertig.zaehlilo.eligo;
  console.log(`\nLauf ${nummer}${mitModell ? ` mit ${takso.modelo}` : " ohne Sprachmodell"}`);
  console.log(`  Schätzung Weg A vor dem Start: ${A.satz}`);
  console.log(`  Last (Mittel 1 min): ${loadavg()[0]?.toFixed(1)} bei ${cpus().length} Kernen`);
  console.log(`  ${"Schritt".padEnd(26)}   Uhr     CPU`);
  for (const [name, { ms, cpu }] of Object.entries(schritte))
    console.log(
      `  ${name.padEnd(26)} ${(ms / 1000).toFixed(1).padStart(5)} s ${(cpu / 1000).toFixed(1).padStart(5)} s`,
    );
  console.log(`  ${"gesamt".padEnd(26)} ${(gesamt / 1000).toFixed(1)} s`);
  console.log(
    `  freigegeben ${fertig.prozent} %, exportierbar ${pruefung.exportable}, Export ${existsSync(eksporto) ? readdirSync(eksporto).join(", ") : "fehlt"}`,
  );
  console.log(`  Zähler: ${fertig.zaehlilo.satz}`);
  if (mitModell)
    console.log(
      `  Schätzung/gemessen: Dauer ${(A.ms / gesamt).toFixed(2)}, Tokens ${(tokens === 0 ? 0 : (A.enigo + A.eligo) / tokens).toFixed(2)} (±50 % = 0,50–1,50)`,
    );
  console.log(
    `  Schlüssel in Kroniko oder Log: ${secrets.some((secret) => raw.includes(secret)) ? "JA – FEHLER" : "nein"}`,
  );
  rmSync(scratch, { recursive: true, force: true });
  return Object.fromEntries([
    ...Object.entries(schritte).map(([name, { ms }]) => [name, ms]),
    ["gesamt", gesamt],
  ]);
}

for (let nummer = 1; nummer <= laeufe; nummer += 1) await lauf(nummer);
