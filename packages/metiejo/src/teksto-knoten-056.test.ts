// Spec 056 (MP-2a, T3, KBS-3.1): the seven text nodes of the view Gestalten – Ausgangslage,
// Zielgruppe, Wettbewerb, Markenkern, Werte, Persönlichkeit and Tonalität. The nodes
// (`nodredaktilo/src/gestalten/nodoj/teksto*.tsx`) have no test runner of their own (plan D-25);
// their sources are read for the contract the canvas relies on: they take everything from the
// shell's context (plan §2.2) and the shared rules (`wertAldoni`, `eigenschaftAldoni`,
// `estasMalplena`), every help line and every calm sentence comes from the shared constants, Werte
// draws one port per value (`teksto-werte.el.<id>`), and no colour literal, rule word or private
// name stands in them. Over HTTP a canvas state with all seven contents round-trips through
// `PUT …/leinwand-stato` and `GET /api/leinwand` (AK-6, data side). Invented brands only.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  EIGENSCHAFTEN_HINWEIS,
  ENHAVO_ETIKEDOJ,
  FUENF_EIGENSCHAFTEN_SATZ,
  FUENF_WERTE_SATZ,
  type LeinwandAntwort,
  type LeinwandStato,
  MARKENKERN_ETIKEDOJ,
  MARKENKERN_HINWEIS,
  TEKSTO_HILFOJ,
  TEKSTO_IDS,
  TONALITAET_MITTE,
  TONALITAET_PAROJ,
  WERT_HINZUFUEGEN,
  wertElirDe,
  ZIELGRUPPE_ETIKEDOJ,
} from "./grafeo-gestalten-sicht.js";
import { LEINWAND_DOSIERO } from "./leinwand-dosieroj.js";
import { enhavoDe, markoEnhavoDe } from "./leinwand-enhavo.js";
import { parseLeinwandStato, serializeLeinwandStato } from "./leinwand-stato.js";
import {
  type Antwort,
  markeAnlegen,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";
import { loadBases } from "./vorschau.js";

const NODOJ_DIR = fileURLToPath(
  new URL("../../nodredaktilo/src/gestalten/nodoj/", import.meta.url),
);

/** The sources of the text nodes: `teksto.tsx` and every `teksto-*.tsx` beside it. */
function fontoj(): { dosiero: string; kodo: string }[] {
  return readdirSync(NODOJ_DIR)
    .filter((name) => /^teksto(?:-[a-z0-9-]+)?\.tsx$/.test(name))
    .sort()
    .map((dosiero) => ({ dosiero, kodo: readFileSync(join(NODOJ_DIR, dosiero), "utf8") }));
}

const kodoDe = (): string =>
  fontoj()
    .map((f) => f.kodo)
    .join("\n");

/** The code without comments, so a rule about code is not met by a sentence in a comment. */
const senKomentoj = (kodo: string): string =>
  kodo.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

/** Every module a source imports from. */
const importojDe = (kodo: string): string[] =>
  [...kodo.matchAll(/^\s*import\b[\s\S]*?from\s+"([^"]+)";?/gm)].map((m) => m[1] ?? "");

/** What the nodes may import: the shared rules, React Flow, React and the shell's own modules. */
const PERMESITAJ = new Set([
  "@fundamento/metiejo/gestalten",
  "@fundamento/metiejo/enhavo",
  "@xyflow/react",
  "react",
  "../anschluss.js",
  "../kunteksto.js",
  "../roloj.js",
  "../sxelo.js",
]);

/** The members of the context a text node may use (plan §2.2). */
const KUNTEKSTO = new Set(["inhaltDe", "inhaltMeti", "verbunden", "markoGeloest", "forigi"]);

describe("Spec 056 T3: the sources of the seven text nodes", () => {
  it("are teksto.tsx (exporting TekstoNodo) and its own teksto-*.tsx files", () => {
    const dosieroj = fontoj().map((f) => f.dosiero);
    expect(dosieroj).toContain("teksto.tsx");
    expect(readFileSync(join(NODOJ_DIR, "teksto.tsx"), "utf8")).toMatch(
      /export function TekstoNodo\(/,
    );
  });

  it("import only the shared rules, React, React Flow and the shell; never fetch or write the Agordo", () => {
    const fremdaj = fontoj().flatMap(({ dosiero, kodo }) =>
      importojDe(kodo)
        .filter((de) => !PERMESITAJ.has(de) && !/^\.\/teksto(?:-[a-z0-9-]+)?\.js$/.test(de))
        .map((de) => `${dosiero}: ${de}`),
    );
    expect(fremdaj).toEqual([]);
    const kodo = senKomentoj(kodoDe());
    const verboten = ["fetch(", "XMLHttpRequest", "skribi", "datumoj", "localStorage"].filter((w) =>
      kodo.includes(w),
    );
    expect(verboten).toEqual([]);
  });

  it("take only inhaltDe, inhaltMeti, verbunden, markoGeloest and forigi from the context", () => {
    const kodo = senKomentoj(kodoDe());
    const vokoj = [...kodo.matchAll(/useGestalten\(\)/g)].length;
    const destrukturoj = [...kodo.matchAll(/const\s*\{([^}]*)\}\s*=\s*useGestalten\(\)/g)];
    expect(vokoj).toBeGreaterThan(0);
    expect(destrukturoj.length).toBe(vokoj);
    const membroj = destrukturoj.flatMap((m) =>
      (m[1] ?? "")
        .split(",")
        .map((s) => s.split(":")[0]?.trim() ?? "")
        .filter((s) => s !== ""),
    );
    expect(membroj.filter((m) => !KUNTEKSTO.has(m))).toEqual([]);
    expect(membroj).toEqual(expect.arrayContaining(["inhaltDe", "inhaltMeti"]));
  });

  it("add values and traits and tell empty from written only with the shared rules", () => {
    const kodo = senKomentoj(kodoDe());
    const vokoj = ["wertAldoni(", "eigenschaftAldoni(", "estasMalplena("].filter(
      (f) => !kodo.includes(f),
    );
    expect(vokoj).toEqual([]);
    // No own duplicate test or limit: case folding and the five belong to the shared rules.
    const eigene = [
      /toLowerCase|toLocaleLowerCase|toUpperCase|toLocaleUpperCase/,
      /(?:>=|>|===|!==|<|<=)\s*5\b/,
      /\b5\s*(?:>=|>|===|!==|<|<=)/,
    ]
      .filter((muster) => muster.test(kodo))
      .map(String);
    expect(eigene).toEqual([]);
    expect(kodo).toMatch(/\bWERTE_GRENZE\b/);
  });

  it("take every help line, title, label and calm sentence from the shared constants", () => {
    const kodo = kodoDe();
    const nomoj = [
      "ENHAVO_ETIKEDOJ",
      "TEKSTO_HILFOJ",
      "ZIELGRUPPE_ETIKEDOJ",
      "MARKENKERN_ETIKEDOJ",
      "MARKENKERN_HINWEIS",
      "WERT_HINZUFUEGEN",
      "FUENF_WERTE_SATZ",
      "EIGENSCHAFTEN_HINWEIS",
      "FUENF_EIGENSCHAFTEN_SATZ",
      "TONALITAET_PAROJ",
      "TONALITAET_MITTE",
    ];
    const senUzo = nomoj.filter(
      (nomo) => [...senKomentoj(kodo).matchAll(new RegExp(`\\b${nomo}\\b`, "g"))].length < 2,
    );
    expect(senUzo).toEqual([]);
    const vortoj = [
      ...TEKSTO_IDS.map((id) => ENHAVO_ETIKEDOJ[id]),
      ...Object.values(TEKSTO_HILFOJ),
      ...Object.values(ZIELGRUPPE_ETIKEDOJ),
      ...Object.values(MARKENKERN_ETIKEDOJ),
      MARKENKERN_HINWEIS,
      WERT_HINZUFUEGEN,
      FUENF_WERTE_SATZ,
      EIGENSCHAFTEN_HINWEIS,
      FUENF_EIGENSCHAFTEN_SATZ,
      TONALITAET_MITTE,
      ...TONALITAET_PAROJ.flatMap((p) => [p.links, p.rechts]),
    ].filter((v): v is string => typeof v === "string");
    // Typed in: as a string literal, as JSX text, or (a sentence) anywhere, comments included.
    const tajpitaj = vortoj.filter(
      (v) =>
        [`"${v}"`, `'${v}'`, `\`${v}\``, `>${v}<`].some((form) => kodo.includes(form)) ||
        (v.includes(" ") && kodo.includes(v)),
    );
    expect(tajpitaj).toEqual([]);
  });

  it("give Werte one port per value, `teksto-werte.el.<id>`, and every other node `<id>.el`", () => {
    expect(["w1", "w4"].map(wertElirDe)).toEqual(["teksto-werte.el.w1", "teksto-werte.el.w4"]);
    const kodo = senKomentoj(kodoDe());
    // The value's port stands inside the map over the values, named by the value's id.
    const pordoj = [
      ...kodo.matchAll(
        /\.map\(\s*\(?\s*(\w+)\b[\s\S]{0,1500}?<Anschluss\b[^>]*\bport=\{wertElirDe\(\1\.id\)\}/g,
      ),
    ];
    expect(pordoj.length).toBe(1);
    expect(kodo).not.toMatch(/teksto-werte\.el/);
    expect(kodo).toMatch(/<Anschluss\b[^>]*\bport=\{`\$\{id\}\.el`\}[^>]*\bsupro=\{42\}/);
  });

  it("carry no colour literal, not even in a comment", () => {
    const LITERALE = [
      /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])/g,
      /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\s*\(/gi,
    ];
    const treffer = fontoj().flatMap(({ dosiero, kodo }) =>
      kodo
        .split("\n")
        .flatMap((linio, i) =>
          LITERALE.flatMap((m) =>
            [...linio.matchAll(m)].map((t) => `${dosiero}:${i + 1}: ${t[0]}`),
          ),
        ),
    );
    expect(treffer).toEqual([]);
  });

  it("name no rule, no problem count, no required field, no red, and no private name", () => {
    const modelo = buildModelo(loadBases().structure.files).modelo;
    const woerter = [
      ...modelo.reguloj
        .flatMap((r) => [r.name, r.id])
        .filter((w): w is string => typeof w === "string" && w.length > 3),
      "Problem",
      "Prüfung",
      "Pflicht",
      "required",
      "invalid",
      "noch offen",
      "danger",
      ["cif", "ere", "cigo"].join(""),
    ];
    const kodo = kodoDe();
    expect(woerter.filter((w) => kodo.includes(w))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------------
// The data side over HTTP (AK-6)

/** All seven contents, as a person writes them (invented); a long text with no limit of this run. */
const INHALTE: Readonly<Record<(typeof TEKSTO_IDS)[number], Record<string, unknown>>> = {
  "teksto-ausgangslage": {
    text: `lumeto baut Leuchten für Werkstätten.\n\n${"Jetzt kommt der eigene Shop. ".repeat(200)}`,
  },
  "teksto-zielgruppe": {
    wer: "Menschen, die mit den Händen arbeiten",
    sorge: "Schlechtes Licht am Abend",
    vertrauen: "Reparierbarkeit",
  },
  "teksto-wettbewerb": {
    liste: [{ name: "Lampenhaus", adresse: "https://lampenhaus.example" }, { name: "Strahl" }],
  },
  "teksto-markenkern": {
    zweck: "Gutes Licht dort, wo mit den Händen gearbeitet wird.",
    versprechen: "Jede Leuchte lässt sich reparieren, ein Leben lang.",
  },
  "teksto-werte": {
    werte: [
      { id: "w1", text: "nahbar" },
      { id: "w3", text: "gründlich" },
      { id: "w2", text: "mutig" },
    ],
  },
  "teksto-persoenlichkeit": { eigenschaften: ["ruhig", "genau", "warm", "direkt", "offen"] },
  "teksto-tonalitaet": { "foermlich-locker": 1, "warm-kuehl": -2, "klassisch-modern": 0 },
};

/** The state: the three fixed text nodes without `speco`, the four added ones with it. */
const STATO: LeinwandStato = {
  version: 1,
  knoten: TEKSTO_IDS.map((id) =>
    ["teksto-ausgangslage", "teksto-markenkern", "teksto-werte"].includes(id)
      ? { id, inhalt: INHALTE[id] }
      : { id, speco: "teksto" as const, inhalt: INHALTE[id] },
  ),
  kabloj: {},
};

describe("Spec 056 T3: the contents of the seven text nodes round-trip over HTTP", () => {
  let server: TestServilo;
  const teksto = (wert: unknown): string => JSON.stringify(wert);
  const put = (name: string, korpo: unknown): Promise<Antwort> =>
    new Promise<Antwort>((done, fail) => {
      const body = teksto(korpo);
      const anfrage = httpRequest(
        {
          host: "127.0.0.1",
          port: server.servilo.port,
          path: `/api/marko/${name}/leinwand-stato`,
          method: "PUT",
          headers: {
            connection: "close",
            "content-type": "application/json",
            "content-length": String(Buffer.byteLength(body)),
          },
        },
        (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk: Buffer) => chunks.push(chunk));
          response.on("end", () =>
            done({
              status: response.statusCode ?? 0,
              contentType: String(response.headers["content-type"] ?? ""),
              body: Buffer.concat(chunks),
            }),
          );
          response.on("error", fail);
        },
      );
      anfrage.on("error", fail);
      anfrage.end(body);
    });

  beforeAll(async () => {
    server = await testServilo("teksto-knoten-056-");
    await markeAnlegen(server, "lumeto", "leer");
  });

  afterAll(async () => {
    await server?.close();
  });

  it("PUT stores all seven contents unchanged; GET gives them back and the Marke its enhavo", async () => {
    // Every content is already in the shape the shared reader keeps (nothing drops on the way).
    expect(Object.fromEntries(TEKSTO_IDS.map((id) => [id, enhavoDe(id, INHALTE[id])]))).toEqual(
      INHALTE,
    );
    expect((await put("lumeto", STATO)).status).toBe(200);
    const pfad = join(server.workdir, "lumeto", LEINWAND_DOSIERO);
    expect(existsSync(pfad)).toBe(true);
    const lego = parseLeinwandStato(readFileSync(pfad, "utf8"));
    if (!("stato" in lego)) throw new Error("the stored state does not read");
    expect(readFileSync(pfad, "utf8")).toBe(serializeLeinwandStato(lego.stato));
    const antwort = await server.anfrage("GET", "/api/leinwand?marko=lumeto");
    expect(antwort.status).toBe(200);
    const bildo = JSON.parse(antwort.body.toString("utf8")) as LeinwandAntwort;
    const zurueck = Object.fromEntries(
      (bildo.stato?.knoten ?? []).flatMap((k) =>
        (TEKSTO_IDS as readonly string[]).includes(k.id) ? [[k.id, k.inhalt]] : [],
      ),
    );
    expect(zurueck).toEqual(INHALTE);
    const added = (bildo.stato?.knoten ?? [])
      .filter((k) => k.speco === "teksto")
      .map((k) => k.id)
      .sort();
    expect(added).toEqual([
      "teksto-persoenlichkeit",
      "teksto-tonalitaet",
      "teksto-wettbewerb",
      "teksto-zielgruppe",
    ]);
    const marko = bildo.nodoj.find((n) => n.speco === "marko");
    expect(marko?.speco === "marko" ? marko.enhavo : undefined).toEqual(
      markoEnhavoDe(lego.stato.knoten, []),
    );
  });
});
