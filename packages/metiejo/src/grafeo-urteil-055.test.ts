// Spec 055 T7 (LNS-4.1, Abnahme 8): no judgment anywhere along Gestalten, the canvas state, the
// Stände and the Markenliste, checked across every endpoint they use. One whole session over HTTP –
// create the brand with `ziel=leinwand`, the Startseite with its list, the canvas data with and
// without a state file, a hard yellow as Primär and a pure red as own Neutral colour, PUT/DELETE of
// the state, saving, listing and opening Stände – answers only 2xx and never asks the check (a
// counter on the check's gate and one on `checkDraft`). No answer carries a rule's name, id,
// statement or kialo, a problem count or a mark of the report. The error answers keep one semantics
// on every new route: an unknown brand is 404 `{satz}` with the same sentence; the canvas write
// paths answer 422 in one shape `{feld?, satz}`. A control (the stage's frame of the same brand)
// proves the word search can fail.

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { LeinwandAntwort, LeinwandStato, StandZeile } from "./grafeo-gestalten-sicht.js";
import { STAENDE_DIR } from "./leinwand-dosieroj.js";
import { type Antwort, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { loadBases } from "./vorschau.js";

// A counter on every derivation with checks (`checkDraft`): no route of this file may call it.
const zaehler = vi.hoisted(() => ({ checkDraft: 0 }));
// The factory chains with `then`, so no `await` stands in a module-level statement (modelo
// `ci/test-setup.test.ts`).
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
const NENIA_SATZ = "Diese Marke gibt es nicht.";
const text = (body: Buffer): string => body.toString("utf8");
const teksto = (wert: unknown): string => JSON.stringify(wert);

/**
 * The words of a judgment: every Regulo's name, id, statement and kialo from the loaded Modelo, and
 * the marks of the check's report and of a problem count (as `grafeo-urteil-054`).
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

/** One answer: what was asked and what came back. */
interface Schritt {
  was: string;
  status: number;
  korpo: string;
}

type Metodo = "GET" | "POST" | "PUT" | "DELETE";

/**
 * What a reader of the Startseite meets: the page without the `<style>` and `<script>` blocks of the
 * shared shell (`html.ts` names the check's container `mt-pruefung` there for every step, as at
 * `642ab220`; the start screen has no such container).
 */
const sichtbar = (html: string): string =>
  html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<script[\s\S]*?<\/script>/g, "");

/** The Markenliste section of the Startseite (the form above it is the 054 start, unchanged). */
const markenListeDe = (html: string): string => {
  const de = html.indexOf('<section class="mt-marken"');
  return de < 0 ? "" : html.slice(de, html.indexOf("</section>", de) + "</section>".length);
};

describe("Spec 055 T7: no judgment along Gestalten, canvas state, Stände and Markenliste", () => {
  let server: TestServilo;
  let stubDir: string;
  let pruefungen: string[];
  let woerter: string[];
  /** Every answer of every test of this file, searched for judgment words at the end. */
  const alle: Schritt[] = [];

  /** Any method over its own connection (the shared helper knows GET and POST only). */
  const senden = (method: Metodo, path: string, body?: string, type?: string): Promise<Antwort> =>
    new Promise<Antwort>((done, fail) => {
      const headers: Record<string, string> = { connection: "close" };
      if (body !== undefined) {
        headers["content-type"] = type ?? "application/json";
        headers["content-length"] = String(Buffer.byteLength(body));
      }
      const anfrage = httpRequest(
        { host: "127.0.0.1", port: server.servilo.port, path, method, headers },
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
  const frage = async (
    method: Metodo,
    path: string,
    body?: string,
    type?: string,
  ): Promise<Schritt> => {
    const antwort = await senden(method, path, body, type);
    const schritt = { was: `${method} ${path}`, status: antwort.status, korpo: text(antwort.body) };
    alle.push(schritt);
    return schritt;
  };
  const anlegen = async (name: string): Promise<void> => {
    const kreo = await frage("POST", "/marko", `name=${name}&basis=leer&ziel=leinwand`, FORM);
    expect(kreo.status, `POST /marko ${name}`).toBe(303);
  };

  beforeAll(async () => {
    pruefungen = [];
    woerter = urteilsWoerter();
    stubDir = mkdtempSync(join(tmpdir(), "grafeo-urteil-055-leinwand-"));
    writeFileSync(join(stubDir, "leinwand.js"), STUB);
    server = await testServilo("grafeo-urteil-055-", {
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

  it("runs a whole session over HTTP with only 2xx and never asks the check", async () => {
    const name = "lumeto";
    const sitzung: Schritt[] = [];
    const mit = async (schritt: Promise<Schritt>): Promise<Schritt> => {
      const s = await schritt;
      sitzung.push(s);
      return s;
    };
    const leinwand = async (): Promise<LeinwandAntwort> => {
      const s = await mit(frage("GET", `/api/leinwand?marko=${name}`));
      expect(s.status).toBe(200);
      return JSON.parse(s.korpo) as LeinwandAntwort;
    };
    const vorschauen = async (antwort: LeinwandAntwort): Promise<void> => {
      for (const n of antwort.nodoj) if (n.speco === "vorschau") await mit(frage("GET", n.href));
      await mit(frage("GET", `/marko/${name}/vorschau.css?rev=${antwort.rev}`));
    };

    await mit(frage("GET", "/"));
    await anlegen(name);
    await mit(frage("GET", "/"));
    await mit(frage("GET", `/marko/${name}/grafeo`));
    const ohneDatei = await leinwand();
    expect(ohneDatei.stato).toBeNull();
    await vorschauen(ohneDatei);

    // Colours without judgment: a hard yellow as Primär, a pure red as own Neutral colour, an
    // Akzent, a Funktionsfarbe, the Tönung.
    for (const korpo of [
      { farbe: { rolle: "primaer", wert: "#f5c400" } },
      { neutral: { farbe: "#ff0000" } },
      { farbe: { rolle: "akzent", wert: "#c6f135" } },
      { farbe: { rolle: "warning", wert: "#d99a00" } },
      { toenung: 0.35 },
    ]) {
      const s = await mit(frage("POST", `/api/marko/${name}/leinwand`, teksto(korpo)));
      expect(s.status, teksto(korpo)).toBe(200);
    }
    // The canvas state: a moved node, a detached connection, a further preview.
    const stato: LeinwandStato = {
      version: 1,
      knoten: [
        { id: "paletro", x: 820, y: 40 },
        { id: "vorschau-3", speco: "vorschau", schema: "hell", x: 1136, y: 1024 },
      ],
      kabloj: { akzent: null },
    };
    expect(
      (await mit(frage("PUT", `/api/marko/${name}/leinwand-stato`, teksto(stato)))).status,
    ).toBe(200);
    const mitDatei = await leinwand();
    expect(mitDatei.stato?.kabloj).toEqual({ akzent: null });
    await vorschauen(mitDatei);
    // Stände: save, change, save again, list, open the first one, list again.
    const erster = await mit(
      frage("POST", `/api/marko/${name}/staende`, teksto({ name: "Gelb und Rot" })),
    );
    expect(erster.status).toBe(201);
    const { id } = JSON.parse(erster.korpo) as { id: string };
    expect(
      (
        await mit(
          frage(
            "POST",
            `/api/marko/${name}/leinwand`,
            teksto({ farbe: { rolle: "primaer", wert: "#2f5bff" } }),
          ),
        )
      ).status,
    ).toBe(200);
    expect((await mit(frage("POST", `/api/marko/${name}/staende`, "{}"))).status).toBe(201);
    expect((await mit(frage("GET", `/api/marko/${name}/staende`))).status).toBe(200);
    expect((await mit(frage("POST", `/api/marko/${name}/staende/${id}/oeffnen`))).status).toBe(200);
    const liste = JSON.parse(
      (await mit(frage("GET", `/api/marko/${name}/staende`))).korpo,
    ) as StandZeile[];
    expect(liste).toHaveLength(3);
    await vorschauen(await leinwand());
    // „Anordnung zurücksetzen“, then the canvas and the Startseite once more.
    expect((await mit(frage("DELETE", `/api/marko/${name}/leinwand-stato`))).status).toBe(200);
    await vorschauen(await leinwand());
    await mit(frage("GET", "/"));

    expect(sitzung.length).toBeGreaterThan(30);
    expect(sitzung.filter((s) => s.status < 200 || s.status > 299).map((s) => s.was)).toEqual([]);
    expect({ pruefungen, checkDraft: zaehler.checkDraft }).toEqual({
      pruefungen: [],
      checkDraft: 0,
    });
  });

  it("answers an unknown brand with the same 404 {satz} on every new route", async () => {
    const pfade: [method: Metodo, path: string, body?: string][] = [
      ["PUT", "/api/marko/nenia/leinwand-stato", teksto({ version: 1, knoten: [], kabloj: {} })],
      ["PUT", "/api/marko/nenia/leinwand-stato", "kaputt"],
      ["DELETE", "/api/marko/nenia/leinwand-stato"],
      ["GET", "/api/marko/nenia/staende"],
      ["POST", "/api/marko/nenia/staende", teksto({ name: "Blau kühl" })],
      ["POST", "/api/marko/nenia/staende", "kein json"],
      ["POST", "/api/marko/nenia/staende/20261115T143210Z-blau-kuehl/oeffnen"],
    ];
    const falsch: string[] = [];
    for (const [method, path, body] of pfade) {
      const { status, korpo } = await frage(method, path, body);
      if (status !== 404 || korpo !== teksto({ satz: NENIA_SATZ }))
        falsch.push(`${status} ${method} ${path}: ${korpo}`);
    }
    expect(falsch).toEqual([]);
    // The older routes of the canvas still answer an unknown brand with 404 (their 054 bodies).
    const alt: string[] = [];
    for (const [method, path, body] of [
      ["GET", "/api/leinwand?marko=nenia"],
      ["POST", "/api/marko/nenia/leinwand", teksto({ neutral: { farbe: "#ff0000" } })],
    ] as const) {
      const { status } = await frage(method, path, body);
      if (status !== 404) alt.push(`${status} ${method} ${path}`);
    }
    expect(alt).toEqual([]);
  });

  it("answers 422 on the canvas write paths in one shape {feld?, satz}, and writes nothing", async () => {
    const name = "provo";
    await anlegen(name);
    const staende = await frage("POST", `/api/marko/${name}/staende`, teksto({ name: "kaputt" }));
    expect(staende.status).toBe(201);
    const { id } = JSON.parse(staende.korpo) as { id: string };
    // The Stand file gets an Agordo that does not read: „Öffnen“ must answer 422.
    writeFileSync(
      join(server.workdir, name, STAENDE_DIR, `${id}.json`),
      teksto({
        version: 1,
        id,
        name: "kaputt",
        zeit: "2026-11-15T14:32:10.000Z",
        leinwand: null,
        agordo: { name },
      }),
    );
    const { rev } = JSON.parse((await frage("GET", `/api/leinwand?marko=${name}`)).korpo) as {
      rev: number;
    };
    const faelle: [method: Metodo, path: string, body?: string][] = [
      ["POST", `/api/marko/${name}/leinwand`, teksto({ neutral: { farbe: "blau" } })],
      ["POST", `/api/marko/${name}/leinwand`, teksto({ neutral: { farbe: "#12" } })],
      [
        "POST",
        `/api/marko/${name}/leinwand`,
        teksto({ farbe: { rolle: "primaer", wert: "blau" } }),
      ],
      ["POST", `/api/marko/${name}/leinwand`, teksto({ toenung: 2 })],
      ["PUT", `/api/marko/${name}/leinwand-stato`, "kaputt"],
      ["PUT", `/api/marko/${name}/leinwand-stato`, teksto({ version: 2, knoten: [], kabloj: {} })],
      ["POST", `/api/marko/${name}/staende/${id}/oeffnen`],
    ];
    const formen: string[] = [];
    for (const [method, path, body] of faelle) {
      const { status, korpo } = await frage(method, path, body);
      const wert = JSON.parse(korpo) as Record<string, unknown>;
      const schluessel = Object.keys(wert).sort();
      const passt =
        status === 422 &&
        typeof wert.satz === "string" &&
        wert.satz !== "" &&
        (schluessel.join() === "satz" ||
          (schluessel.join() === "feld,satz" && typeof wert.feld === "string"));
      if (!passt) formen.push(`${status} ${method} ${path}: ${korpo}`);
    }
    expect(formen).toEqual([]);
    const nachher = JSON.parse((await frage("GET", `/api/leinwand?marko=${name}`)).korpo) as {
      rev: number;
      stato: unknown;
    };
    expect({ rev: nachher.rev, stato: nachher.stato }).toEqual({ rev, stato: null });
    expect({ pruefungen, checkDraft: zaehler.checkDraft }).toEqual({
      pruefungen: [],
      checkDraft: 0,
    });
  });

  it("carries no rule name, problem count or report sentence in any answer of this file", () => {
    const routen = new Set(
      alle.map((s) =>
        s.was
          .split("?")[0]
          ?.replace(/\/(lumeto|provo|nenia)\b/, "/:name")
          .replace(/\/staende\/[^/]+\/oeffnen$/, "/staende/:id/oeffnen"),
      ),
    );
    expect([...routen].sort()).toEqual([
      "DELETE /api/marko/:name/leinwand-stato",
      "GET /",
      "GET /api/leinwand",
      "GET /api/marko/:name/staende",
      "GET /marko/:name/grafeo",
      "GET /marko/:name/vorschau",
      "GET /marko/:name/vorschau.css",
      "POST /api/marko/:name/leinwand",
      "POST /api/marko/:name/staende",
      "POST /api/marko/:name/staende/:id/oeffnen",
      "POST /marko",
      "PUT /api/marko/:name/leinwand-stato",
    ]);
    // The Startseite carries its list (with the brand of the session) in at least one answer.
    const listen = alle.filter((s) => s.was === "GET /").map((s) => markenListeDe(s.korpo));
    expect(listen.some((l) => l.includes("/marko/lumeto/grafeo"))).toBe(true);
    const status = new Set(alle.map((s) => s.status));
    expect([200, 201, 303, 404, 422].filter((code) => !status.has(code))).toEqual([]);
    const befunde: string[] = [];
    for (const schritt of alle) {
      const korpo = schritt.was === "GET /" ? sichtbar(schritt.korpo) : schritt.korpo;
      for (const wort of woerter)
        if (korpo.includes(wort)) befunde.push(`${schritt.was} (${schritt.status}): ${wort}`);
    }
    expect(befunde).toEqual([]);
  });

  it("control: the stage's frame of the same brand carries judgment words and asks the check", async () => {
    pruefungen.length = 0;
    const { rev } = JSON.parse((await frage("GET", "/api/leinwand?marko=lumeto")).korpo) as {
      rev: number;
    };
    const buehne = await frage(
      "GET",
      `/marko/lumeto/vorschau?sxtupo=buehne-farbe&breite=mittel&scheme=light&rev=${rev}`,
    );
    alle.pop();
    expect(buehne.status).toBe(200);
    expect(woerter.filter((wort) => buehne.korpo.includes(wort)).length).toBeGreaterThan(0);
    expect(pruefungen).toEqual(["lumeto"]);
  });
});
