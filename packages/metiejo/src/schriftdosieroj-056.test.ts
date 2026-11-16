// Spec 056 (MP-2a, T7, KBS-3.5): the routes of own fonts.
//   POST /api/marko/:name/schriftdateien {filename, base64} – a font file or a ZIP is read first
//        (tiparo-legi.ts, zip-legi.ts); only then its font files go into `marken/<name>/fontoj/`
//        (never the ZIP); a file that does not read is 422 {satz} and nothing is stored.
//   GET  /marko/:name/fontoj/:datei – an own font file of that brand, for @font-face.
//   POST /api/marko/:name/schrift-privat {familie, bestaetigt?} – the existing way into the private
//        repository (`privataState`, `uploadFont`), after a confirmation.
// Setting a family goes through the write path of the canvas (`{schrift: {rolle, eigene}}`) and
// makes it „lizenziert, nicht enthalten“; the preview gets @font-face on the brand's own files.
// Temporary work folders, a local bare repository through `PrivataDeps` (as privata.test.ts) – no
// test pushes anywhere real, no test goes into the network. Invented brands only.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { crc32, deflateRawSync } from "node:zlib";
import type { Agordo } from "@fundamento/agordilo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseEnv, settingsOf } from "./env.js";
import {
  NELEGEBLA_DOSIERO_SATZ,
  type SchriftDosiero,
  TRO_GRANDA_SATZ,
  ZIP_OHNE_SCHRIFT_SATZ,
} from "./grafeo-gestalten-sicht.js";
import { readMarko } from "./marko.js";
import { type PrivataDeps, privataState } from "./privata.js";
import { eigeneFontFace, FONTOJ_DIR } from "./schriftdosieroj-vojoj.js";
import { ANFRAGE_GRENZE, dateiGrenzeDe, type VojoKunteksto } from "./servilo.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { fehltDe, schnitteBeschreibungDe } from "./tiparo-legi.js";
import { LICENCED_NOTE } from "./tiparoj.js";

const MARKO = "provo";
const ALIA = "lumeto";
const fikstur = (nomo: string): Buffer =>
  readFileSync(new URL(`../test/fixtures/valid/tiparo-056/${nomo}`, import.meta.url));
const REGULAR = "lato-latin-400-normal.woff2";
const BOLD = "lato-latin-700-normal.woff2";

/** A small TrueType font with `name` and `OS/2` only (family „Hausschrift“). */
function hausschrift(gewicht: number): Buffer {
  const u16 = (n: number): Buffer => Buffer.from([n >> 8, n & 0xff]);
  const nomo = Buffer.from("Hausschrift", "utf16le").swap16();
  const name = Buffer.concat([
    u16(0),
    u16(1),
    u16(18),
    u16(3),
    u16(1),
    u16(0x409),
    u16(1),
    u16(nomo.length),
    u16(0),
    nomo,
  ]);
  const os2 = Buffer.alloc(96);
  os2.writeUInt16BE(4, 0);
  os2.writeUInt16BE(gewicht, 4);
  os2.writeUInt16BE(0x40, 62);
  const tabeloj: [string, Buffer][] = [
    ["OS/2", os2],
    ["name", Buffer.concat([name, Buffer.alloc((4 - (name.length % 4)) % 4)])],
  ];
  const kapo = Buffer.alloc(12 + 16 * tabeloj.length);
  kapo.writeUInt32BE(0x00010000, 0);
  kapo.writeUInt16BE(tabeloj.length, 4);
  let ofseto = kapo.length;
  tabeloj.forEach(([etikedo, datumo], i) => {
    kapo.write(etikedo, 12 + 16 * i, "latin1");
    kapo.writeUInt32BE(ofseto, 12 + 16 * i + 8);
    kapo.writeUInt32BE(datumo.length, 12 + 16 * i + 12);
    ofseto += datumo.length;
  });
  return Buffer.concat([kapo, ...tabeloj.map(([, d]) => d)]);
}

/** A ZIP of deflated entries (the fixture's is built by `zip`, these by hand). */
function zip(eroj: readonly { nomo: string; datumo: Buffer }[]): Buffer {
  const lokaj: Buffer[] = [];
  const centraj: Buffer[] = [];
  let ofseto = 0;
  for (const ero of eroj) {
    const premita = deflateRawSync(ero.datumo);
    const nomo = Buffer.from(ero.nomo, "utf8");
    const loka = Buffer.alloc(30);
    loka.writeUInt32LE(0x04034b50, 0);
    loka.writeUInt16LE(20, 4);
    loka.writeUInt16LE(0x0800, 6);
    loka.writeUInt16LE(8, 8);
    loka.writeUInt32LE(crc32(ero.datumo), 14);
    loka.writeUInt32LE(premita.length, 18);
    loka.writeUInt32LE(ero.datumo.length, 22);
    loka.writeUInt16LE(nomo.length, 26);
    const centra = Buffer.alloc(46);
    centra.writeUInt32LE(0x02014b50, 0);
    centra.writeUInt16LE(20, 4);
    centra.writeUInt16LE(20, 6);
    centra.writeUInt16LE(0x0800, 8);
    centra.writeUInt16LE(8, 10);
    centra.writeUInt32LE(crc32(ero.datumo), 16);
    centra.writeUInt32LE(premita.length, 20);
    centra.writeUInt32LE(ero.datumo.length, 24);
    centra.writeUInt16LE(nomo.length, 28);
    centra.writeUInt32LE(ofseto, 42);
    lokaj.push(loka, nomo, premita);
    centraj.push(centra, nomo);
    ofseto += 30 + nomo.length + premita.length;
  }
  const centro = Buffer.concat(centraj);
  const fino = Buffer.alloc(22);
  fino.writeUInt32LE(0x06054b50, 0);
  fino.writeUInt16LE(eroj.length, 8);
  fino.writeUInt16LE(eroj.length, 10);
  fino.writeUInt32LE(centro.length, 12);
  fino.writeUInt32LE(ofseto, 16);
  return Buffer.concat([...lokaj, centro, fino]);
}

const json = (body: Buffer): Record<string, unknown> =>
  JSON.parse(body.toString("utf8")) as Record<string, unknown>;
const dosiero = (name: string, gewicht: number): SchriftDosiero => ({
  name,
  gewicht,
  stil: "normal",
  variabel: false,
  quelle: "tabellen",
});

const hochladen = (s: TestServilo, filename: string, bytes: Buffer, marko = MARKO) =>
  s.anfrage(
    "POST",
    `/api/marko/${marko}/schriftdateien`,
    JSON.stringify({ filename, base64: bytes.toString("base64") }),
  );
const fontoj = (s: TestServilo, marko = MARKO): string[] => {
  const dir = join(s.workdir, marko, FONTOJ_DIR);
  return existsSync(dir) ? readdirSync(dir).sort() : [];
};
const leer = (s: TestServilo, marko = MARKO): void => {
  rmSync(join(s.workdir, marko, FONTOJ_DIR), { recursive: true, force: true });
};

let server: TestServilo;
beforeAll(async () => {
  server = await testServilo("schriftdosieroj-056-");
  await markeAnlegen(server, MARKO, "leer");
  await markeAnlegen(server, ALIA, "leer");
});
afterAll(async () => {
  await server.close();
});

describe("POST /api/marko/:name/schriftdateien – read first, then store", () => {
  it("the fixture ZIP: one family with Regular and Bold, the licence counted; only the fonts in fontoj/", async () => {
    leer(server);
    const antwort = await hochladen(server, "Lato.zip", fikstur("lato-400-700.zip"));
    expect({ status: antwort.status, korpo: json(antwort.body) }).toEqual({
      status: 200,
      korpo: {
        familien: [
          {
            familie: "Lato",
            dateien: [dosiero(REGULAR, 400), dosiero(BOLD, 700)],
            fehlt: ["Italic"],
          },
        ],
        uebergangen: 1,
      },
    });
    expect(fontoj(server)).toEqual([".gitignore", REGULAR, BOLD]);
    expect(readFileSync(join(server.workdir, MARKO, FONTOJ_DIR, ".gitignore"), "utf8")).toBe("*\n");
    expect(readFileSync(join(server.workdir, MARKO, FONTOJ_DIR, BOLD)).equals(fikstur(BOLD))).toBe(
      true,
    );
  });

  it("a single font file (WOFF), and a ZIP with two families lists each family", async () => {
    leer(server);
    const woff = await hochladen(
      server,
      "lato-latin-700-normal.woff",
      fikstur("lato-latin-700-normal.woff"),
    );
    const zwei = await hochladen(
      server,
      "marken.zip",
      zip([
        { nomo: `lato/${REGULAR}`, datumo: fikstur(REGULAR) },
        { nomo: "haus/Hausschrift-Bold.ttf", datumo: hausschrift(700) },
        { nomo: "haus/Hausschrift-Regular.ttf", datumo: hausschrift(400) },
      ]),
    );
    expect([json(woff.body), json(zwei.body)]).toEqual([
      {
        familien: [
          {
            familie: "Lato",
            dateien: [dosiero("lato-latin-700-normal.woff", 700)],
            fehlt: ["Regular", "Italic"],
          },
        ],
        uebergangen: 0,
      },
      {
        familien: [
          {
            familie: "Hausschrift",
            dateien: [
              dosiero("Hausschrift-Regular.ttf", 400),
              dosiero("Hausschrift-Bold.ttf", 700),
            ],
            fehlt: ["Italic"],
          },
          { familie: "Lato", dateien: [dosiero(REGULAR, 400)], fehlt: ["Bold", "Italic"] },
        ],
        uebergangen: 0,
      },
    ]);
    expect(fontoj(server)).toEqual([
      ".gitignore",
      "Hausschrift-Bold.ttf",
      "Hausschrift-Regular.ttf",
      REGULAR,
      "lato-latin-700-normal.woff",
    ]);
  });

  it("unreadable: no font, a broken ZIP, a ZIP with a broken font, another kind → 422, nothing stored", async () => {
    leer(server);
    const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13]);
    const fikso = fikstur("lato-400-700.zip");
    const antwortoj = [
      await hochladen(server, "Hausschrift.woff2", png),
      await hochladen(server, "Hausschrift.woff2", hausschrift(400)),
      await hochladen(server, "Lato.zip", fikso.subarray(0, fikso.length - 30)),
      await hochladen(
        server,
        "gemischt.zip",
        zip([
          { nomo: REGULAR, datumo: fikstur(REGULAR) },
          { nomo: "kaputt.ttf", datumo: png },
        ]),
      ),
      await hochladen(server, "Hausschrift.pdf", hausschrift(400)),
      await server.anfrage("POST", `/api/marko/${MARKO}/schriftdateien`, "{nicht json"),
    ];
    expect(antwortoj.map((a) => ({ status: a.status, korpo: json(a.body) }))).toEqual(
      antwortoj.map(() => ({ status: 422, korpo: { satz: NELEGEBLA_DOSIERO_SATZ } })),
    );
    expect(fontoj(server)).toEqual([]);
  });

  it("a ZIP without a font file: „In dieser ZIP-Datei sind keine Schriftdateien.“, nothing stored", async () => {
    leer(server);
    const antwort = await hochladen(
      server,
      "lizenz.zip",
      zip([{ nomo: "OFL.txt", datumo: fikstur("LICENSE") }]),
    );
    expect({ status: antwort.status, korpo: json(antwort.body) }).toEqual({
      status: 422,
      korpo: { satz: ZIP_OHNE_SCHRIFT_SATZ },
    });
    expect(fontoj(server)).toEqual([]);
  });

  it("a ZIP entry above the per-file limit (D-12) → 422; an existing file of the same name stays", async () => {
    leer(server);
    await hochladen(server, REGULAR, fikstur(REGULAR));
    const bombo = zip([
      { nomo: "granda.ttf", datumo: Buffer.alloc(dateiGrenzeDe(ANFRAGE_GRENZE) + 1) },
      { nomo: REGULAR, datumo: fikstur(BOLD) },
    ]);
    const antwort = await hochladen(server, "bombo.zip", bombo);
    expect({ status: antwort.status, korpo: json(antwort.body) }).toEqual({
      status: 422,
      korpo: { satz: NELEGEBLA_DOSIERO_SATZ },
    });
    expect(fontoj(server)).toEqual([".gitignore", REGULAR]);
    expect(
      readFileSync(join(server.workdir, MARKO, FONTOJ_DIR, REGULAR)).equals(fikstur(REGULAR)),
    ).toBe(true);
  });

  it("a body above the request limit → 422 with „Sie ist größer als 24 MB.“; an unknown brand → 404 {satz}", async () => {
    const zuGross = await server.anfrage(
      "POST",
      `/api/marko/${MARKO}/schriftdateien`,
      JSON.stringify({ filename: "gross.woff2", base64: "A".repeat(ANFRAGE_GRENZE + 1024) }),
    );
    const unbekannt = await hochladen(server, REGULAR, fikstur(REGULAR), "nenia-marko");
    expect([
      { status: zuGross.status, korpo: json(zuGross.body) },
      { status: unbekannt.status, satz: typeof json(unbekannt.body).satz },
    ]).toEqual([
      { status: 422, korpo: { satz: `${NELEGEBLA_DOSIERO_SATZ}. ${TRO_GRANDA_SATZ}` } },
      { status: 404, satz: "string" },
    ]);
    expect(existsSync(join(server.workdir, "nenia-marko"))).toBe(false);
  });
});

describe("GET /marko/:name/fontoj/:datei – only that brand's fontoj/", () => {
  it("serves an own font file with its type; 404 for another brand, a non-font, a traversal", async () => {
    leer(server);
    await hochladen(server, "Lato.zip", fikstur("lato-400-700.zip"));
    writeFileSync(join(server.workdir, MARKO, "geheim.woff2"), fikstur(BOLD));
    const datei = await server.anfrage("GET", `/marko/${MARKO}/fontoj/${REGULAR}`);
    expect({ status: datei.status, typ: datei.contentType }).toEqual({
      status: 200,
      typ: "font/woff2",
    });
    expect(datei.body.equals(fikstur(REGULAR))).toBe(true);
    const nicht = await Promise.all(
      [
        `/marko/${ALIA}/fontoj/${REGULAR}`,
        `/marko/${MARKO}/fontoj/.gitignore`,
        `/marko/${MARKO}/fontoj/..%2Fgeheim.woff2`,
        `/marko/${MARKO}/fontoj/fehlt.woff2`,
        `/marko/nenia-marko/fontoj/${REGULAR}`,
      ].map((pfad) => server.anfrage("GET", pfad)),
    );
    expect(nicht.map((a) => a.status)).toEqual([404, 404, 404, 404, 404]);
  });
});

describe("set an own font, and the preview shows it (R-5)", () => {
  it("„als Überschrift setzen“ through POST /leinwand: lizenziert, nicht enthalten; the preview has @font-face on fontoj/", async () => {
    leer(server);
    await hochladen(server, "Lato.zip", fikstur("lato-400-700.zip"));
    const gesetzt = await server.anfrage(
      "POST",
      `/api/marko/${MARKO}/leinwand`,
      JSON.stringify({ schrift: { rolle: "display", eigene: "Lato" } }),
    );
    expect(gesetzt.status).toBe(200);
    const display = readMarko(server.workdir, MARKO)?.draft.schriften?.display;
    expect(display).toMatchObject({
      family: "Lato",
      license: "proprietary",
      redistributable: false,
    });
    expect(display?.source).toContain(LICENCED_NOTE);

    const vorschau = (
      await server.anfrage("GET", `/marko/${MARKO}/vorschau?sxtupo=vorschau`)
    ).body.toString("utf8");
    const regeln = vorschau.match(/@font-face \{[^}]*\/marko\/provo\/fontoj\/[^}]*\}/g) ?? [];
    expect(regeln).toEqual([
      `@font-face { font-family: "Lato"; font-style: normal; font-weight: 400; font-display: swap; src: url(/marko/provo/fontoj/${REGULAR}) format("woff2"); }`,
      `@font-face { font-family: "Lato"; font-style: normal; font-weight: 700; font-display: swap; src: url(/marko/provo/fontoj/${BOLD}) format("woff2"); }`,
    ]);
    // Another brand with the same family set but no own file: no rule.
    await server.anfrage(
      "POST",
      `/api/marko/${ALIA}/leinwand`,
      JSON.stringify({ schrift: { rolle: "body", eigene: "Lato" } }),
    );
    const alia = (
      await server.anfrage("GET", `/marko/${ALIA}/vorschau?sxtupo=vorschau`)
    ).body.toString("utf8");
    expect(alia).not.toContain("/fontoj/");
  });

  it('eigeneFontFace gives "" for an Agordo without an own font, before it touches the context', () => {
    expect(eigeneFontFace({} as VojoKunteksto, MARKO, { name: MARKO } as Agordo)).toBe("");
  });
});

describe("POST /api/marko/:name/schrift-privat – the existing way only", () => {
  it("without FM_TIPAROJ_REPO: the existing sentence that names it", async () => {
    const antwort = await server.anfrage(
      "POST",
      `/api/marko/${MARKO}/schrift-privat`,
      JSON.stringify({ familie: "Lato", bestaetigt: true }),
    );
    expect({ status: antwort.status, korpo: json(antwort.body) }).toEqual({
      status: 200,
      korpo: { satz: privataState({ present: [] }).sentence },
    });
  });

  describe("with FM_TIPAROJ_REPO and a local bare repository (PrivataDeps)", () => {
    const REPO = "owner/name";
    let repoServer: TestServilo;
    let sichtbarkeit: "private" | "public" | "unknown" = "private";
    const scratch = mkdtempSync(join(tmpdir(), "schriftdosieroj-056-repo-"));
    const bare = join(scratch, "remote.git");
    const git = (args: readonly string[], cwd: string): string =>
      execFileSync("git", args, {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
    const remoteFiles = (): string[] => {
      try {
        return git(["ls-tree", "-r", "--name-only", "HEAD"], bare).split("\n").filter(Boolean);
      } catch {
        return [];
      }
    };
    const privat = (korpo: unknown) =>
      repoServer.anfrage("POST", `/api/marko/${MARKO}/schrift-privat`, JSON.stringify(korpo));

    beforeAll(async () => {
      execFileSync("git", ["init", "--bare", "-q", "-b", "main", bare]);
      const deps: PrivataDeps = {
        remoteUrl: () => bare,
        visibility: async () => sichtbarkeit,
        git,
        cacheDir: join(scratch, "cache"),
        env: { GIT_AUTHOR_NAME: "Metiejo Test", GIT_AUTHOR_EMAIL: "metiejo@example.invalid" },
      };
      repoServer = await testServilo("schriftdosieroj-056-privat-", {
        settings: settingsOf(parseEnv(`FM_TIPAROJ_REPO=${REPO}\n`)),
        deps,
      });
      await markeAnlegen(repoServer, MARKO, "leer");
      await hochladen(repoServer, "Lato.zip", fikstur("lato-400-700.zip"));
    });
    afterAll(async () => {
      await repoServer.close();
      rmSync(scratch, { recursive: true, force: true });
    });

    it("first the confirmation (the existing sentence), nothing pushed", async () => {
      const antwort = await privat({ familie: "Lato" });
      expect(json(antwort.body)).toEqual({
        satz: privataState({ tiparojRepo: REPO, present: ["FM_TIPAROJ_REPO"] }).sentence,
        frage: true,
      });
      expect(remoteFiles()).toEqual([]);
    });

    it("public or unknown: the existing „Kein Push: …“ sentence; the font stays and is served", async () => {
      sichtbarkeit = "public";
      const oeffentlich = json((await privat({ familie: "Lato", bestaetigt: true })).body);
      sichtbarkeit = "unknown";
      const unbekannt = json((await privat({ familie: "Lato", bestaetigt: true })).body);
      expect([oeffentlich.satz, unbekannt.satz]).toEqual([
        "Kein Push: Das Repo aus FM_TIPAROJ_REPO ist öffentlich. Lizenzierte Schriften gehen nur in ein privates Repo.",
        "Kein Push: Ob das Repo aus FM_TIPAROJ_REPO privat ist, lässt sich nicht feststellen (GitHub-API nicht erreichbar oder gh nicht angemeldet).",
      ]);
      expect(remoteFiles()).toEqual([]);
      expect((await repoServer.anfrage("GET", `/marko/${MARKO}/fontoj/${REGULAR}`)).status).toBe(
        200,
      );
    });

    it("private and confirmed: uploadFont per file of the family, with its sentences", async () => {
      sichtbarkeit = "private";
      const antwort = await privat({ familie: "Lato", bestaetigt: true });
      expect(json(antwort.body)).toEqual({
        satz: [REGULAR, BOLD]
          .map(
            (d) =>
              `Die Schrift Lato liegt jetzt in deinem privaten Repo (FM_TIPAROJ_REPO) unter tiparoj/lato/${d}. Die Marke nennt sie als „lizenziert, nicht enthalten“.`,
          )
          .join(" "),
      });
      expect(remoteFiles()).toEqual([`tiparoj/lato/${REGULAR}`, `tiparoj/lato/${BOLD}`]);
      expect(fontoj(repoServer)).toEqual([".gitignore", REGULAR, BOLD]);
    });

    it("a family without a file here: the existing sentence of the Studio, nothing pushed", async () => {
      const antwort = await privat({ familie: "Hausschrift", bestaetigt: true });
      expect(json(antwort.body)).toEqual({
        satz: "Kein Push: Es liegt keine Datei zum Hochladen bereit.",
      });
    });
  });
});

// ---------------------------------------------------------------------------------------------
// The node's own copy of „what lacks“ (the browser bundle cannot import tiparo-legi.ts)

interface DatumojModulo {
  fehltDe: typeof fehltDe;
  schnitteBeschreibungDe: typeof schnitteBeschreibungDe;
}

/**
 * `nodredaktilo/src/gestalten/schriftdosieroj-datumoj.ts` (no test runner there): a copy in a temp
 * folder names the shared module by its address instead of the bundle's alias.
 */
async function datumojModulo(): Promise<DatumojModulo> {
  const quelle = new URL(
    "../../nodredaktilo/src/gestalten/schriftdosieroj-datumoj.ts",
    import.meta.url,
  );
  const sicht = new URL("./grafeo-gestalten-sicht.ts", import.meta.url);
  const kodo = readFileSync(quelle, "utf8");
  const ersetzt = kodo.replace(
    'from "@fundamento/metiejo/gestalten"',
    `from ${JSON.stringify(sicht.pathname)}`,
  );
  if (ersetzt === kodo)
    throw new Error("schriftdosieroj-datumoj.ts no longer imports the shared module");
  const dir = mkdtempSync(join(tmpdir(), "schriftdosieroj-056-"));
  const kopio = join(dir, "schriftdosieroj-datumoj.ts");
  writeFileSync(kopio, ersetzt);
  try {
    return (await import(pathToFileURL(kopio).href)) as DatumojModulo;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("the node says what the server says", () => {
  it("fehltDe and schnitteBeschreibungDe of the node equal the reader's for every kind of family", async () => {
    const modulo = await datumojModulo();
    const v = (gewicht: number, gewichtBis: number, stil: "normal" | "italic" = "normal") => ({
      ...dosiero(`v-${gewicht}-${stil}.woff2`, gewicht),
      gewichtBis,
      variabel: true,
      stil,
    });
    const familioj: SchriftDosiero[][] = [
      [dosiero("a", 400), dosiero("b", 700)],
      [dosiero("b", 700)],
      [dosiero("a", 400), { ...dosiero("c", 400), stil: "italic" }, dosiero("b", 700)],
      [
        { ...dosiero("a", 300), quelle: "dateiname" },
        { ...dosiero("b", 900), stil: "italic" },
      ],
      [v(100, 900)],
      [v(100, 900), v(100, 900, "italic")],
      [v(500, 900), dosiero("a", 400)],
      [{ ...v(100, 900), quelle: "dateiname" }],
    ];
    expect(familioj.map((f) => [modulo.fehltDe(f), modulo.schnitteBeschreibungDe(f)])).toEqual(
      familioj.map((f) => [fehltDe(f), schnitteBeschreibungDe(f)]),
    );
  });
});
