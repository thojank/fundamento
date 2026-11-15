// Spec 054 T8 (MPFG-5.1, AK-1, AK-3, AK-9, AK-12): no judgment anywhere along the view Gestalten,
// checked across every endpoint it uses. A whole session over HTTP – create the brand on the start
// screen with `ziel=leinwand`, open the page, load its data and both previews, set Primär to a hard
// yellow, an Akzent, a Funktionsfarbe, the Tönung, a step for dark only, look at the effective view
// of changed connections – answers only 2xx, never asks the check (a counter on the check's gate and
// one on `checkDraft`), and no answer carries a rule's name, id, statement or kialo, a problem count
// or a mark of the report. The error answers keep the same semantics on every route: a missing brand
// is 404 on page, data, write path and previews; a malformed `kabloj` is 400 on all three routes
// that read it. A control (the stage's frame of the same brand) proves the word search can fail.

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Bildo, BildoPaletro, BildoVorschau, Stufo } from "./grafeo-gestalten-sicht.js";
import { type Antwort, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { loadBases } from "./vorschau.js";

// A counter on every derivation with checks (`checkDraft`): the view must never call it.
const zaehler = vi.hoisted(() => ({ checkDraft: 0 }));
// The factory runs when the module is first imported, not while Vitest collects; it chains with
// `then` so no `await` stands in a module-level statement (modelo `ci/test-setup.test.ts`).
vi.mock("./vorschau.js", (original) =>
  original<typeof import("./vorschau.js")>().then((echt) => ({
    ...echt,
    checkDraft: (...args: Parameters<typeof echt.checkDraft>) => {
      zaehler.checkDraft++;
      return echt.checkDraft(...args);
    },
  })),
);

const FORM = "application/x-www-form-urlencoded";
const STUB = "export {};\n";
const text = (body: Buffer): string => body.toString("utf8");

/**
 * The words of a judgment: every Regulo's name, id, statement and kialo from the loaded Modelo, and
 * the marks of the check's report and of a problem count.
 */
function urteilsWoerter(): string[] {
  const modelo = buildModelo(loadBases().structure.files).modelo;
  return [
    ...modelo.reguloj
      .flatMap((r) => [r.name, r.id, r.statement, r.kialo])
      .filter((wort): wort is string => typeof wort === "string" && wort !== ""),
    "nicht exportierbar",
    "nr-ne-eksportebla",
    "mt-pruefung",
    "data-mt-pruefung",
    "mt-probleme",
    "Problem",
    "Prüfung",
    "Betroffen",
    "Vorschlag",
    "probleme",
    "betroffen",
    "raporto",
  ];
}

/** One answer of the session: what was asked and what came back. */
interface Schritt {
  was: string;
  status: number;
  korpo: string;
}

const vorschauenDe = (bildo: Bildo): BildoVorschau[] =>
  bildo.nodoj.filter((n): n is BildoVorschau => n.speco === "vorschau");
const stufoDe = (bildo: Bildo, token: string): Stufo | undefined =>
  (bildo.nodoj.find((n) => n.speco === "paletro") as BildoPaletro | undefined)?.vicoj
    .flatMap((vico) => vico.stufoj)
    .find((stufo) => stufo.tokeno === token);

describe("Spec 054 T8: no judgment along the view Gestalten, across every endpoint", () => {
  let server: TestServilo;
  let stubDir: string;
  let pruefungen: string[];
  let woerter: string[];
  /** Every answer of every test of this file, searched for judgment words at the end. */
  const alle: Schritt[] = [];

  const frage = async (
    method: "GET" | "POST",
    path: string,
    body?: string,
    type?: string,
  ): Promise<Schritt> => {
    const antwort: Antwort = await server.anfrage(method, path, body, type);
    const schritt = { was: `${method} ${path}`, status: antwort.status, korpo: text(antwort.body) };
    alle.push(schritt);
    return schritt;
  };
  const schreiben = (name: string, korpo: unknown): Promise<Schritt> =>
    frage("POST", `/api/marko/${name}/leinwand`, JSON.stringify(korpo));
  const bildoDe = async (path: string): Promise<Bildo> => {
    const schritt = await frage("GET", path);
    expect(schritt.status, path).toBe(200);
    return JSON.parse(schritt.korpo) as Bildo;
  };

  beforeAll(async () => {
    pruefungen = [];
    woerter = urteilsWoerter();
    stubDir = mkdtempSync(join(tmpdir(), "grafeo-urteil-054-leinwand-"));
    writeFileSync(join(stubDir, "leinwand.js"), STUB);
    server = await testServilo("grafeo-urteil-054-", {
      leinwand: stubDir,
      pruefTor: async (name) => {
        pruefungen.push(name);
      },
    });
    zaehler.checkDraft = 0;
  });

  afterAll(async () => {
    await server?.close();
    rmSync(stubDir, { recursive: true, force: true });
  });

  it("runs the whole AK-1 session over HTTP with only 2xx and never asks the check (AK-1, AK-3, AK-12)", async () => {
    const name = "frejo";
    const sitzung: Schritt[] = [];
    const mit = async (schritt: Promise<Schritt>): Promise<Schritt> => {
      const s = await schritt;
      sitzung.push(s);
      return s;
    };
    /** The page, its data and every preview the Bildo names (document and stylesheet). */
    const oeffnen = async (kabloj = ""): Promise<Bildo> => {
      const q = kabloj === "" ? "" : `&kabloj=${kabloj}`;
      const bildo = await bildoDe(`/api/leinwand?marko=${name}${q}`);
      sitzung.push(alle.at(-1) as Schritt);
      for (const v of vorschauenDe(bildo)) await mit(frage("GET", v.href));
      await mit(frage("GET", `/marko/${name}/vorschau.css?rev=${bildo.rev}${q}`));
      return bildo;
    };

    const kreo = await frage("POST", "/marko", `name=${name}&basis=leer&ziel=leinwand`, FORM);
    expect(kreo.status).toBe(303);
    await mit(frage("GET", `/marko/${name}/grafeo`));
    await mit(frage("GET", `/marko/${name}/grafeo?scheme=light`));
    await mit(frage("GET", "/nodredaktilo/leinwand.css"));
    const start = await oeffnen();

    // Three colours freely: a hard yellow as Primär, an Akzent, a Funktionsfarbe; the Tönung.
    const aenderungen: unknown[] = [
      { farbe: { rolle: "primaer", wert: "#f5c400" } },
      { farbe: { rolle: "akzent", wert: "#c6f135" } },
      { farbe: { rolle: "warning", wert: "#d99a00" } },
      { toenung: 0.35 },
      // A step that breaks a contrast (the yellow on accent 700) and a step for dark only.
      { stufe: { token: "color.palette.accent.700", wert: "#f5c400" } },
      { stufe: { token: "color.palette.neutral.900", wert: "#d0d0d0", schema: "dunkel" } },
    ];
    let bildo = start;
    for (const korpo of aenderungen) {
      const antwort = await mit(schreiben(name, korpo));
      expect(antwort.status, JSON.stringify(korpo)).toBe(200);
      expect((JSON.parse(antwort.korpo) as { rev: number }).rev).toBe(bildo.rev + 1);
      bildo = await oeffnen();
    }
    // The effect is in the data and in the previews of the new rev.
    expect(stufoDe(bildo, "color.palette.accent.700")).toMatchObject({
      hex: "#f5c400",
      gesetzt: true,
    });
    expect(stufoDe(bildo, "color.palette.neutral.900")).toMatchObject({
      hexDunkel: "#d0d0d0",
      gesetztDunkel: true,
    });
    const css = sitzung.at(-1)?.korpo ?? "";
    expect(css.toLowerCase()).toContain("#d0d0d0");
    expect(css.toLowerCase()).toContain("#f5c400");
    // Changed connections in the session: effective views, nothing written.
    for (const kabloj of ["akzent:-", "warning:primaer", "primaer:-,neutral:-"])
      await oeffnen(kabloj);
    expect((await bildoDe(`/api/leinwand?marko=${name}`)).rev).toBe(bildo.rev);

    expect(sitzung.length).toBeGreaterThan(30);
    expect(sitzung.filter((s) => s.status < 200 || s.status > 299).map((s) => s.was)).toEqual([]);
    expect({ pruefungen, checkDraft: zaehler.checkDraft }).toEqual({
      pruefungen: [],
      checkDraft: 0,
    });
  });

  it("answers a missing brand with 404 on page, data, write path and previews", async () => {
    const pfade: [method: "GET" | "POST", path: string, body?: string][] = [
      ["GET", "/marko/nenia/grafeo"],
      ["GET", "/marko/nenia/grafeo?ansicht=verstehen"],
      ["GET", "/marko/nenia/grafeo?scheme=light"],
      ["GET", "/api/leinwand?marko=nenia"],
      ["GET", "/api/leinwand?marko=nenia&kabloj=akzent:-"],
      ["GET", "/api/leinwand?marko=nenia&kabloj=akzent"],
      ["POST", "/api/marko/nenia/leinwand", JSON.stringify({ toenung: 0.2 })],
      [
        "POST",
        "/api/marko/nenia/leinwand",
        JSON.stringify({ farbe: { rolle: "primaer", wert: "#f5c400" } }),
      ],
      ["GET", "/marko/nenia/vorschau?sxtupo=vorschau&breite=mittel&scheme=light&rev=1"],
      ["GET", "/marko/nenia/vorschau?sxtupo=vorschau&breite=mittel&scheme=dark&rev=1"],
      [
        "GET",
        "/marko/nenia/vorschau?sxtupo=vorschau&breite=mittel&scheme=dark&rev=1&kabloj=akzent:-",
      ],
      ["GET", "/marko/nenia/vorschau.css?rev=1"],
      ["GET", "/marko/nenia/vorschau.css?rev=1&kabloj=akzent"],
    ];
    const falsch: string[] = [];
    for (const [method, path, body] of pfade) {
      const { status } = await frage(method, path, body);
      if (status !== 404) falsch.push(`${status} ${method} ${path}`);
    }
    expect(falsch).toEqual([]);
  });

  it("answers a malformed kabloj with 400 on all three routes and writes nothing", async () => {
    const name = "kablo";
    expect(
      (await frage("POST", "/marko", `name=${name}&basis=leer&ziel=leinwand`, FORM)).status,
    ).toBe(303);
    const { rev } = await bildoDe(`/api/leinwand?marko=${name}`);
    const falsch: string[] = [];
    for (const kabloj of ["akzent", "akzent:blau", "neutral:primaer", "akzent:-,akzent:-"]) {
      const q = `kabloj=${encodeURIComponent(kabloj)}`;
      for (const path of [
        `/api/leinwand?marko=${name}&${q}`,
        `/marko/${name}/vorschau?sxtupo=vorschau&breite=mittel&scheme=light&rev=${rev}&${q}`,
        `/marko/${name}/vorschau.css?rev=${rev}&${q}`,
      ]) {
        const { status } = await frage("GET", path);
        if (status !== 400) falsch.push(`${status} ${path}`);
      }
    }
    expect(falsch).toEqual([]);
    expect((await bildoDe(`/api/leinwand?marko=${name}`)).rev).toBe(rev);
  });

  it("answers the write path with 200, 422, 400 and 404, each without a judgment", async () => {
    const name = "skribo";
    expect(
      (await frage("POST", "/marko", `name=${name}&basis=leer&ziel=leinwand`, FORM)).status,
    ).toBe(303);
    const faelle: [korpo: string, status: number, marko?: string][] = [
      [JSON.stringify({ farbe: { rolle: "primaer", wert: "#f5c400" } }), 200],
      [JSON.stringify({ stufe: { token: "color.palette.accent.700", wert: "#fff3b0" } }), 200],
      [JSON.stringify({ farbe: { rolle: "primaer", wert: "blau" } }), 422],
      [JSON.stringify({ farbe: { rolle: "akzent", wert: "oklch(x)" } }), 422],
      [JSON.stringify({ toenung: 2 }), 422],
      [JSON.stringify({ stufe: { token: "color.palette.sekundo.25", wert: "#123456" } }), 422],
      [JSON.stringify({ farbe: { rolle: "primaer", wert: null } }), 422],
      ["kein json", 400],
      [JSON.stringify({ toenung: 0.2, farbe: { rolle: "primaer", wert: "#123456" } }), 400],
      [JSON.stringify({ farbe: { rolle: "neutral", wert: "#123456" } }), 400],
      [JSON.stringify({ toenung: 0.2 }), 404, "nenia"],
    ];
    const ist: number[] = [];
    for (const [korpo, , marko = name] of faelle)
      ist.push((await frage("POST", `/api/marko/${marko}/leinwand`, korpo)).status);
    expect(ist).toEqual(faelle.map(([, status]) => status));
    expect({ pruefungen, checkDraft: zaehler.checkDraft }).toEqual({
      pruefungen: [],
      checkDraft: 0,
    });
  });

  it("carries no rule name, problem count or report sentence in any answer of this file (AK-9)", () => {
    // Every route the view uses, each with its answers of every status.
    const routen = new Set(
      alle.map((s) => s.was.split("?")[0]?.replace(/\/(frejo|kablo|skribo|nenia)\b/, "/:name")),
    );
    expect([...routen].sort()).toEqual([
      "GET /api/leinwand",
      "GET /marko/:name/grafeo",
      "GET /marko/:name/vorschau",
      "GET /marko/:name/vorschau.css",
      "GET /nodredaktilo/leinwand.css",
      "POST /api/marko/:name/leinwand",
      "POST /marko",
    ]);
    const status = new Set(alle.map((s) => s.status));
    expect([200, 303, 400, 404, 422].filter((code) => !status.has(code))).toEqual([]);
    const befunde: string[] = [];
    for (const schritt of alle)
      for (const wort of woerter)
        if (schritt.korpo.includes(wort)) befunde.push(`${schritt.was}: ${wort}`);
    expect(befunde).toEqual([]);
  });

  it("control: the stage's frame of the same brand carries judgment words and asks the check", async () => {
    pruefungen.length = 0;
    const { rev } = await bildoDe("/api/leinwand?marko=frejo");
    const buehne = await frage(
      "GET",
      `/marko/frejo/vorschau?sxtupo=buehne-farbe&breite=mittel&scheme=light&rev=${rev}`,
    );
    alle.pop();
    expect(buehne.status).toBe(200);
    expect(woerter.filter((wort) => buehne.korpo.includes(wort)).length).toBeGreaterThan(0);
    expect(pruefungen).toEqual(["frejo"]);
  });
});
