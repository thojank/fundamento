#!/usr/bin/env node
// Spec 038 T0 (S038-01): writes the contract fixtures of the MCP server and the AC-8 fixtures of
// nordstelo and ekranoj from a built checkout, so that the answers of `main` before PR A stay
// reproducible ("Bezug vorher").
//
//   node packages/mcp/test/kontrakto/generi.mjs <repo-root> <target-root>
//
// <repo-root> is a built checkout (pnpm install --frozen-lockfile && pnpm build); every package is
// loaded from its `dist` by file URL, never from this checkout. <target-root> receives
//   packages/mcp/test/fixtures/kontrakto/    tool names, input schemas, prompt, one file per tool
//   packages/nordstelo/test/fixtures/ac8/    K3, regulo gaps and check_usage judgement per case
//   packages/ekranoj/test/fixtures/ac8/      instances and malobservoj per fragment
// The output is deterministic: two runs against the same checkout give the same bytes. The run
// refuses (exit 3) when an answer names the checkout's path or the home directory. No network, no
// clock, no model.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [rootArg, targetArg] = process.argv.slice(2);
if (rootArg === undefined || targetArg === undefined) {
  process.stderr.write("usage: node generi.mjs <repo-root> <target-root>\n");
  process.exit(2);
}
const root = realpathSync(resolve(rootArg));
const target = resolve(targetArg);
const here = dirname(new URL(import.meta.url).pathname);

/** Writes save_agordo, reads files of the structure, or answers with an absolute path (D-37). */
const EXCLUDED = [
  { werkzeug: "preview_agordo", grund: "reads the structure files of the repository from disk" },
  {
    werkzeug: "propose_agordo",
    grund: "answers with a file:// link to the Werkstatt that embeds the absolute repository path",
  },
  { werkzeug: "save_agordo", grund: "writes a file" },
];
const FORBIDDEN = [...new Set([resolve(rootArg), root, homedir()])];
/** Answers up to this size are stored as text beside their hash (readable diffs). */
const INLINE_LIMIT = 8 * 1024;

const load = (relative) => import(pathToFileURL(join(root, relative)).href);
const mcp = await load("packages/mcp/dist/index.js");
const modeloPackage = await load("packages/modelo/dist/index.js");
const nordstelo = await load("packages/nordstelo/dist/index.js");
const ekranoj = await load("packages/ekranoj/dist/index.js");
const clientDir = realpathSync(
  join(root, "packages/mcp/node_modules/@modelcontextprotocol/client"),
);
const clientEntry = JSON.parse(readFileSync(join(clientDir, "package.json"), "utf8")).exports["."]
  .import.default;
const { Client, InMemoryTransport } = await import(
  pathToFileURL(join(clientDir, clientEntry)).href
);

const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

function refusePaths(where, text) {
  for (const path of FORBIDDEN) {
    if (text.includes(path)) {
      process.stderr.write(`generi: ${where} names a local path; refusing to write fixtures\n`);
      process.exit(3);
    }
  }
}

// --- the server, in process, as nordstelo's connectGvidanto starts it ---------------------------

const served = mcp.loadServed();
const server = mcp.createFundamentoServer(served);
const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
const client = new Client({ name: "kontrakto-038", version: "0" });
await Promise.all([server.connect(serverSide), client.connect(clientSide)]);

/** The answer text the client receives (the text content, joined as nordstelo joins it). */
async function ask(name, args) {
  const result = await client.callTool({ name, arguments: args });
  const text = (result.content ?? [])
    .filter((entry) => entry.type === "text")
    .map((entry) => entry.text ?? "")
    .join("\n");
  refusePaths(`${name} ${JSON.stringify(args)}`, text);
  return { text, isError: result.isError === true };
}

const bridge = {
  list: async () => (await client.listTools()).tools,
  call: async (name, args) => (await ask(name, args)).text,
};

// --- contract fixtures ----------------------------------------------------------------------------

const toolNames = [...mcp.TOOL_NAMES];
const listed = (await client.listTools()).tools;
if (JSON.stringify(listed.map((tool) => tool.name)) !== JSON.stringify(toolNames)) {
  process.stderr.write("generi: tools/list does not list TOOL_NAMES in order\n");
  process.exit(4);
}
const inputSchemas = Object.fromEntries(
  listed.map((tool) => [
    tool.name,
    { description: tool.description, inputSchema: tool.inputSchema },
  ]),
);
refusePaths("tools/list", JSON.stringify(inputSchemas));

const prompt = await client.getPrompt({ name: "gvidanto" });
const promptText = prompt.messages.map((message) => message.content?.text ?? "").join("\n");
refusePaths("prompts/get gvidanto", promptText);

const namesOf = async (tool, key) =>
  JSON.parse((await ask(tool, {})).text)[key].map((entry) => entry.name);
const eroj = await namesOf("list_eroj", "eroj");
const sxablonoj = await namesOf("list_sxablonoj", "sxablonoj");

const butono = (emphasis, label) => ({
  ero: "butono",
  props: { emphasis },
  container: "dialog",
  label,
});
const one = (input) => [{ fall: "standard", eingabe: input }];

/** The Eingabekatalog (plan.md): every existing tool except the three of D-37. */
const catalog = {
  describe: one({}),
  list_dimensioj: one({}),
  list_aspektoj: one({}),
  search_tokens: one({ prefix: "color.action", limit: 5 }),
  get_token: one({ name: "color.text.default" }),
  resolve: ["light", "dark"].map((scheme) => ({
    fall: `komuna-${scheme}`,
    eingabe: { assignment: { aspekto: "komuna", "color-scheme": scheme }, tokens: ["color.text"] },
  })),
  list_reguloj: one({}),
  list_jugxoj: one({}),
  validate: one({}),
  derive_name: one({ name: "color.action.primary.rest" }),
  check_contrast: one({ foreground: "color.text.muted", background: "color.background.sunken" }),
  explain: one({ token: "color.text.subtle" }),
  explain_regulo: one({ name: "state-distinct" }),
  describe_term: one({ term: "Aspekto" }),
  list_eroj: [
    { fall: "ohne-lingvo", eingabe: {} },
    { fall: "lingvo-de", eingabe: { lingvo: "de" } },
  ],
  get_ero: eroj.flatMap((name) => [
    { fall: `${name}-brief`, eingabe: { name, brief: true } },
    { fall: `${name}-voll`, eingabe: { name } },
  ]),
  suggest_ero: [
    { fall: "treffer", eingabe: { goal: "Löschen" } },
    { fall: "fehltreffer", eingabe: { goal: "Wolken zählen" } },
  ],
  check_usage: [
    { fall: "positiv", eingabe: { instances: [butono("high", "Speichern")] } },
    {
      fall: "regelverstoss",
      eingabe: { instances: [butono("high", "Speichern"), butono("high", "Weiter")] },
    },
    { fall: "unbekannte-ero", eingabe: { instances: [{ ero: "wolkenschaukel", props: {} }] } },
  ],
  list_sxablonoj: [
    { fall: "ohne-lingvo", eingabe: {} },
    { fall: "lingvo-de", eingabe: { lingvo: "de" } },
  ],
  get_sxablono: sxablonoj.flatMap((name) => [
    { fall: `${name}-brief`, eingabe: { name, brief: true } },
    { fall: `${name}-voll`, eingabe: { name } },
  ]),
};
const excludedNames = new Set(EXCLUDED.map((entry) => entry.werkzeug));
const missing = toolNames.filter((name) => !excludedNames.has(name) && catalog[name] === undefined);
if (missing.length > 0) {
  process.stderr.write(`generi: no catalog entry for ${missing.join(", ")}\n`);
  process.exit(4);
}

const kontrakto = {};
for (const name of toolNames) {
  if (excludedNames.has(name)) continue;
  const entries = [];
  for (const { fall, eingabe } of catalog[name]) {
    const { text, isError } = await ask(name, eingabe);
    const bytes = Buffer.byteLength(text, "utf8");
    entries.push({
      fall,
      eingabe,
      ...(isError ? { isError: true } : {}),
      sha256: sha256(text),
      bytes,
      ...(bytes < INLINE_LIMIT ? { antwort: text } : {}),
    });
  }
  kontrakto[name] = entries;
}

// --- AC-8: the cases ------------------------------------------------------------------------------

/** Small, neutral fragments: slot data, links, a rule violation, an unknown Ero, a Sxablono page. */
const SMALL = [
  {
    fall: "ero-mit-slot-daten",
    tasko: "werkzeugliste",
    fragment: [
      '<fm-kampo kind="search" clearable><span slot="label">Suche</span><span slot="help">Name oder Nummer</span></fm-kampo>',
      '<fm-tabelo density="comfortable"><span slot="caption">Werkzeuge</span><div slot="content"><table><tr><td>Hammer</td><td>frei</td></tr></table></div></fm-tabelo>',
    ].join("\n"),
  },
  {
    fall: "link-ero",
    tasko: "detailseite",
    fragment: [
      '<fm-saltligilo to="#inhalt">Zum Inhalt</fm-saltligilo>',
      '<fm-ligilo to="detail.html"><span slot="label">Details anzeigen</span></fm-ligilo>',
      '<fm-ligilo to="liste.html" size="riesig">Zur Liste</fm-ligilo>',
    ].join("\n"),
  },
  {
    fall: "regelverstoss",
    tasko: "loeschen-bestaetigen",
    fragment: [
      "<fm-dialogo open>",
      '  <span slot="heading">Eintrag entfernen?</span>',
      '  <div slot="actions"><fm-butono emphasis="high" intent="danger">Entfernen</fm-butono><fm-butono emphasis="high">Abbrechen</fm-butono></div>',
      "</fm-dialogo>",
    ].join("\n"),
  },
  {
    fall: "unbekannte-ero",
    tasko: "anmeldung",
    fragment: [
      "<fm-wolkenschaukel>Schaukeln</fm-wolkenschaukel>",
      '<fm-butono emphasis="medium">Weiter</fm-butono>',
    ].join("\n"),
  },
  {
    fall: "sxablono-seite",
    tasko: "app-rahmen",
    fragment: [
      "<fm-sxelo>",
      '  <span slot="brand">Beispielseite</span>',
      '  <fm-navigado slot="nav" label="Hauptnavigation"><fm-ligilo to="liste.html">Liste</fm-ligilo></fm-navigado>',
      "  <fm-pagxo>",
      '    <fm-titolo level="1" slot="title">Übersicht</fm-titolo>',
      '    <div slot="actions"><fm-butono emphasis="high">Neu</fm-butono><fm-butono emphasis="high">Export</fm-butono></div>',
      '    <section slot="sections"><fm-teksto>Inhalt der Seite</fm-teksto></section>',
      "  </fm-pagxo>",
      "</fm-sxelo>",
    ].join("\n"),
  },
  {
    fall: "lingvo-aus-html",
    tasko: "anmeldung",
    fragment:
      '<html lang="EN-gb"><body><fm-butono emphasis="low" disabled="false">Save</fm-butono></body></html>',
  },
];

/**
 * The agent fragments of the Spec-037 acceptance run (komuna, round 2), between the frame markers;
 * they lie beside this generator (packages/mcp/test/fixtures/ac8-quellen), not in <repo-root>.
 */
const sourceDir = join(here, "../fixtures/ac8-quellen");
const ABNAHME = readdirSync(sourceDir)
  .filter((name) => name.endsWith(".html"))
  .sort()
  .map((name) => ({
    fall: name.replace(/\.html$/, ""),
    fragment: readFileSync(join(sourceDir, name), "utf8"),
  }));

const { modelo } = modeloPackage.loadModelo(modeloPackage.defaultModeloSource());
if (modelo === undefined) throw new Error("the Modelo of the checkout must load");
const katalogo = JSON.parse(
  readFileSync(join(root, "packages/modelo/data/nordstelo.json"), "utf8"),
);
const taskoOf = (name) => {
  const tasko = katalogo.taskoj.find((entry) => entry.name === name);
  if (tasko === undefined) throw new Error(`no task ${name}`);
  return tasko;
};
const notes = [];

function checkUsageOutput(instances) {
  const result = modeloPackage.checkUsage(modelo, { instances });
  if (!result.ok) throw new Error("checkUsage refused an empty list of instances");
  return result.output;
}

/** K3 and regulo gaps from score() (Variante F, the catalogue's weights), check_usage by the twin. */
async function nordsteloCase(fall, facts, taskoName, source) {
  const result = nordstelo.score({
    facts,
    tasko: taskoOf(taskoName),
    variant: "F",
    modelo,
    pezoj: katalogo.pezoj,
    ...(katalogo.multmarkeco === undefined ? {} : { pordego: katalogo.multmarkeco.kriterioj }),
  });
  const reguloGaps = result.gaps.filter((gap) => gap.kind === "regulo");
  const skemoj = await ekranoj.skemojDe(facts, ekranoj.skemoLegiloDe(bridge));
  const instancoj = ekranoj.instancojElFakto(facts, skemoj);
  // Without an instance nordstelo and ekranoj call nothing; the MCP input needs one instance, so
  // the judgement is what the Modelo's checkUsage answers for none (what checkMarkup will give).
  const answer =
    instancoj.length === 0
      ? { text: JSON.stringify(checkUsageOutput([])), isError: false }
      : await ask("check_usage", { instances: instancoj });
  const urteil = JSON.parse(answer.text);
  // The oracle must say what score() saw: the error violations are the regulo gaps (score() keeps
  // each kind and key once).
  const unique = (keys) => [...new Set(keys)].sort();
  const fromUrteil = answer.isError
    ? urteil.issues.map((issue) => issue.rule)
    : urteil.violations
        .filter((violation) => violation.issue.severity === "error")
        .map((violation) => violation.issue.regulo?.name ?? violation.issue.rule);
  const fromScore = reguloGaps.map((gap) => gap.key);
  if (JSON.stringify(unique(fromUrteil)) !== JSON.stringify(unique(fromScore)))
    notes.push(`nordstelo ${fall}: check_usage of the twin and score() differ`);
  return {
    fall,
    ...source,
    tasko: taskoName,
    expected: {
      K3: result.k.K3,
      reguloGaps,
      instancoj,
      ...(answer.isError ? { urteilIstFehler: true } : {}),
      urteil,
    },
  };
}

const nordsteloCases = [];
const kurojDir = join(root, "packages/nordstelo/test/fixtures/kuroj");
for (const name of readdirSync(kurojDir).sort()) {
  const factsPath = `packages/nordstelo/test/fixtures/kuroj/${name}/fakto.json`;
  const rezulto = join(kurojDir, name, "rezulto.json");
  if (!existsSync(join(root, factsPath)) || !existsSync(rezulto)) continue;
  const factsText = readFileSync(join(root, factsPath), "utf8");
  const tasko = JSON.parse(readFileSync(rezulto, "utf8")).task;
  nordsteloCases.push(
    await nordsteloCase(`kuroj-${name}`, JSON.parse(factsText), tasko, {
      faktoPfad: factsPath,
      faktoSha256: sha256(factsText),
    }),
  );
}
for (const { fall, tasko, fragment } of SMALL) {
  const facts = ekranoj.statikaFakto(fragment, "de");
  nordsteloCases.push(await nordsteloCase(fall, facts, tasko, { facts }));
}

const ekranojCases = [];
for (const { fall, fragment } of [...ABNAHME, ...SMALL]) {
  const lingvo = "de";
  const fakto = ekranoj.statikaFakto(fragment, lingvo);
  const { instancoj, malobservoj } = await ekranoj.kontroliUzon(
    bridge,
    fakto,
    ekranoj.skemoLegiloDe(bridge),
  );
  ekranojCases.push({ fall, fragment, lingvo, expected: { instancoj, malobservoj } });
}
await client.close();

// --- write -----------------------------------------------------------------------------------------

let bezug = null;
try {
  bezug = execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
} catch {
  bezug = null;
}

function writeDir(relative, files) {
  const dir = join(target, relative);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    refusePaths(`${relative}/${name}`, content);
    writeFileSync(join(dir, name), content);
  }
}

writeDir("packages/mcp/test/fixtures/kontrakto", {
  "index.json": json({
    spec: "038",
    bezug,
    erzeugtMit: "packages/mcp/test/kontrakto/generi.mjs",
    werkzeuge: Object.fromEntries(
      Object.entries(kontrakto).map(([name, list]) => [name, list.length]),
    ),
    ausgenommen: EXCLUDED,
  }),
  "tool-names.json": json(toolNames),
  "input-schemas.json": json(inputSchemas),
  "prompt-gvidanto.txt": promptText,
  ...Object.fromEntries(
    Object.entries(kontrakto).map(([name, list]) => [`${name}.json`, json(list)]),
  ),
});
writeDir(
  "packages/nordstelo/test/fixtures/ac8",
  Object.fromEntries(nordsteloCases.map((entry) => [`${entry.fall}.json`, json(entry)])),
);
writeDir(
  "packages/ekranoj/test/fixtures/ac8",
  Object.fromEntries(ekranojCases.map((entry) => [`${entry.fall}.json`, json(entry)])),
);

const count = Object.values(kontrakto).reduce((sum, list) => sum + list.length, 0);
process.stdout.write(
  `generi: ${Object.keys(kontrakto).length} tools, ${count} catalog entries, ` +
    `${nordsteloCases.length} nordstelo cases, ${ekranojCases.length} ekranoj cases\n`,
);
for (const note of notes) process.stdout.write(`generi: note: ${note}\n`);
