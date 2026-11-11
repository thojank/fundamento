// Spec 047 (NE-1, T4): the routes of the graph canvas, through a running server. Two servers: one
// with a stub bundle (a temp dir with `leinwand.js`) and the ekzemplo fixture, one without either
// (`leinwand: null`, `ekzemploDir: null`). The brand provo is the fixture file copied into each
// server's brand folder. The graph API answers the bytes of `serializeGrafeo` computed here; the
// screens carry the brand's root attributes, the mount point and the two scripts; the Studio shows
// "Graph ansehen" only while the bundle is there; and every route of the block answers a missing
// thing with the same status and body.

import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { grafeoDe, grafeoDePaket, serializeGrafeo } from "./grafeo.js";
import { PROVO_DOSIERO, paketo, provoAgordo } from "./test-doubles/grafeo-047.js";
import { entwurf, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { checkDraft, loadBases } from "./vorschau.js";

const NICHT_GEBAUT = "Leinwand nicht gebaut: pnpm --filter @fundamento/nodredaktilo build";
const EKZEMPLO_FEHLT = "ekzemplo ist nur im Repo vorhanden";
const NICHT_GEFUNDEN = "<p>Nicht gefunden.";
const GENAU_EINER = "Genau einer der Parameter marko oder aspekto.";
const JSON_TYPE = "application/json; charset=utf-8";
const STUB = "export {};\n";

/** The screens of the block: path, the Aspekto on the root, the JSON URL of the mount point. */
const EKRANOJ = [
  { pfad: "/marko/provo/grafeo", aspekto: "provo", fonto: "/api/grafeo?marko=provo" },
  { pfad: "/aspekto/komuna/grafeo", aspekto: "komuna", fonto: "/api/grafeo?aspekto=komuna" },
  { pfad: "/aspekto/ekzemplo/grafeo", aspekto: "ekzemplo", fonto: "/api/grafeo?aspekto=ekzemplo" },
] as const;

/** One brand from a fixture file: the file copied as `<workdir>/<name>/agordo.json`. */
function markeKopieren(server: TestServilo, name: string, agordo?: Record<string, unknown>): void {
  const dir = join(server.workdir, name);
  mkdirSync(dir, { recursive: true });
  if (agordo === undefined) copyFileSync(PROVO_DOSIERO, join(dir, "agordo.json"));
  else writeFileSync(join(dir, "agordo.json"), `${JSON.stringify(agordo, null, 2)}\n`);
}

const text = (body: Buffer): string => body.toString("utf8");
const count = (haystack: string, needle: string): number => haystack.split(needle).length - 1;

/** What a route of the block should answer: status, and a text the body contains. */
interface Erwartung {
  pfad: string;
  status: number;
  enthaelt: string;
}

/** Each answer that differs from its expectation, as one line; empty when all hold. */
async function abweichungen(server: TestServilo, erwartungen: Erwartung[]): Promise<string[]> {
  const out: string[] = [];
  for (const e of erwartungen) {
    const antwort = await server.anfrage("GET", e.pfad);
    const korpo = text(antwort.body);
    if (antwort.status !== e.status || !korpo.includes(e.enthaelt)) {
      out.push(`${e.pfad}: ${antwort.status} ${JSON.stringify(korpo.slice(0, 120))}`);
    }
  }
  return out;
}

describe("Spec 047 T4: the routes of the graph canvas", () => {
  let mit: TestServilo;
  let ohne: TestServilo;
  let stubDir: string;

  beforeAll(async () => {
    stubDir = mkdtempSync(join(tmpdir(), "grafeo-route-047-leinwand-"));
    writeFileSync(join(stubDir, "leinwand.js"), STUB);
    mit = await testServilo("grafeo-route-047-mit-", { leinwand: stubDir });
    ohne = await testServilo("grafeo-route-047-ohne-", { leinwand: null, ekzemploDir: null });
    markeKopieren(mit, "provo");
    markeKopieren(ohne, "provo");
  });

  afterAll(async () => {
    await mit?.close();
    await ohne?.close();
    rmSync(stubDir, { recursive: true, force: true });
  });

  it("answers the graph of a brand and of komuna with the bytes of serializeGrafeo", async () => {
    const bases = loadBases();
    const erwartet = [
      {
        pfad: "/api/grafeo?marko=provo",
        korpo: serializeGrafeo(grafeoDe(provoAgordo(), bases)),
      },
      {
        pfad: "/api/grafeo?aspekto=komuna",
        korpo: serializeGrafeo(grafeoDePaket("komuna", paketo("komuna"))),
      },
    ];
    for (const server of [mit, ohne]) {
      for (const { pfad, korpo } of erwartet) {
        const antwort = await server.anfrage("GET", pfad);
        expect({ pfad, status: antwort.status, type: antwort.contentType }).toEqual({
          pfad,
          status: 200,
          type: JSON_TYPE,
        });
        expect(text(antwort.body) === korpo).toBe(true);
      }
    }
  });

  it("answers a cyclic draft with 422 and its errors, never with half a graph", async () => {
    const provo = JSON.parse(readFileSync(PROVO_DOSIERO, "utf8")) as Record<string, unknown>;
    markeKopieren(mit, "zyklo", { ...provo, name: "zyklo" });
    // Every draft enters through readAgordo, so a draft the server holds is a valid Agordo; what
    // can still not be drawn is a cycle among fixed tokens (GrafeoEraro).
    await entwurf(mit, "zyklo", {
      festgelegt: {
        ...(provo.festgelegt as Record<string, unknown>),
        "color.text.default": { wert: "{color.text.muted}" },
        "color.text.muted": { wert: "{color.text.default}" },
      },
    });
    const antwort = await mit.anfrage("GET", "/api/grafeo?marko=zyklo");
    expect({ status: antwort.status, type: antwort.contentType }).toEqual({
      status: 422,
      type: JSON_TYPE,
    });
    const { eraroj } = JSON.parse(text(antwort.body)) as {
      eraroj: { path: string; rule: string; message: string }[];
    };
    expect(eraroj.map((e) => e.rule)).toEqual(["grafeo-ciklo"]);
    expect(eraroj[0]?.path).toBe("color.text.default");
    expect(Object.keys(JSON.parse(text(antwort.body)) as object)).toEqual(["eraroj"]);
    // The screen is still shown: the canvas reads the 422 and shows the errors (`#nr-eraroj`), and
    // the shared check of this rev refuses the export, so the header says so.
    const ekrano = await mit.anfrage("GET", "/marko/zyklo/grafeo");
    expect(ekrano.status).toBe(200);
    expect(count(text(ekrano.body), `data-nr-fonto="/api/grafeo?marko=zyklo"`)).toBe(1);
    expect(text(ekrano.body)).toContain(
      `<fm-insigno intent="warning" id="nr-ne-eksportebla">nicht exportierbar</fm-insigno>`,
    );
  });

  it("shows each screen in the brand and the scheme, with the mount point and both scripts", async () => {
    const violations: string[] = [];
    for (const ekrano of EKRANOJ) {
      for (const [query, scheme] of [
        ["", "light"],
        ["?scheme=light", "light"],
        ["?scheme=dark", "dark"],
        ["?scheme=sepia", "light"],
      ] as const) {
        const pfad = `${ekrano.pfad}${query}`;
        const antwort = await mit.anfrage("GET", pfad);
        const html = text(antwort.body);
        const pruefe = (bedingung: boolean, was: string): void => {
          if (!bedingung) violations.push(`${pfad}: ${was}`);
        };
        pruefe(antwort.status === 200, `status ${antwort.status}`);
        pruefe(antwort.contentType.startsWith("text/html"), `type ${antwort.contentType}`);
        const wurzel = /<html\b[^>]*>/.exec(html)?.[0] ?? "";
        pruefe(wurzel.includes(`data-fm-aspekto="${ekrano.aspekto}"`), `root ${wurzel}`);
        pruefe(wurzel.includes(`data-fm-color-scheme="${scheme}"`), `root ${wurzel}`);
        pruefe(
          count(html, `<div id="nr-leinwand" data-nr-fonto="${ekrano.fonto}"></div>`) === 1,
          "mount point",
        );
        pruefe(count(html, `<script type="module" src="/eroj/define.js"></script>`) === 1, "eroj");
        pruefe(
          count(html, `<script type="module" src="/nodredaktilo/leinwand.js"></script>`) === 1,
          "bundle",
        );
        const stylesheet =
          ekrano.aspekto === "provo"
            ? `<link rel="stylesheet" href="/marko/provo/vorschau.css?rev=1">`
            : `<link rel="stylesheet" href="/aspekto/${ekrano.aspekto}/grafeo.css">`;
        pruefe(count(html, stylesheet) === 1, "stylesheet");
        pruefe(
          ekrano.aspekto !== "provo" ||
            html.includes(`to="/studio/provo/farbe${scheme === "dark" ? "?scheme=dark" : ""}"`),
          "link back to the Studio",
        );
      }
    }
    expect(violations).toEqual([]);
  });

  it("marks the screen of a brand the shared check does not export", async () => {
    const exportable = checkDraft(provoAgordo(), loadBases()).exportable;
    const html = text((await mit.anfrage("GET", "/marko/provo/grafeo")).body);
    expect(count(html, `id="nr-ne-eksportebla"`)).toBe(exportable ? 0 : 1);
    if (!exportable) {
      expect(html).toContain(
        `<fm-insigno intent="warning" id="nr-ne-eksportebla">nicht exportierbar</fm-insigno>`,
      );
    }
  });

  it("serves the stylesheet of a package as CSS, built in memory", async () => {
    for (const label of ["komuna", "ekzemplo"]) {
      const antwort = await mit.anfrage("GET", `/aspekto/${label}/grafeo.css`);
      expect({ label, status: antwort.status, type: antwort.contentType }).toEqual({
        label,
        status: 200,
        type: "text/css; charset=utf-8",
      });
      expect(text(antwort.body)).toContain(`[data-fm-aspekto="${label}"]`);
      const wieder = await mit.anfrage("GET", `/aspekto/${label}/grafeo.css`);
      expect(wieder.body.equals(antwort.body)).toBe(true);
    }
  });

  it("serves the bundle while it is there", async () => {
    const antwort = await mit.anfrage("GET", "/nodredaktilo/leinwand.js");
    expect({ status: antwort.status, type: antwort.contentType }).toEqual({
      status: 200,
      type: "text/javascript; charset=utf-8",
    });
    expect(text(antwort.body)).toBe(STUB);
  });

  it("puts one „Graph ansehen“ into the Studio only while the bundle is there", async () => {
    for (const [query, scheme] of [
      ["", "light"],
      ["?scheme=dark", "dark"],
    ] as const) {
      const html = text((await mit.anfrage("GET", `/studio/provo/farbe${query}`)).body);
      expect(count(html, "Graph ansehen")).toBe(1);
      expect(count(html, `data-href="/marko/provo/grafeo`)).toBe(1);
      expect(html).toContain(
        `<fm-butono size="small" emphasis="low" data-href="/marko/provo/grafeo?scheme=${scheme}">Graph ansehen</fm-butono>`,
      );
    }
    const ohneHtml = text((await ohne.anfrage("GET", "/studio/provo/farbe")).body);
    expect(count(ohneHtml, "Graph ansehen")).toBe(0);
    expect(count(ohneHtml, "/grafeo")).toBe(0);
  });

  it("answers a missing thing the same way on every route of the block", async () => {
    const beide: Erwartung[] = [
      { pfad: "/api/grafeo", status: 400, enthaelt: GENAU_EINER },
      { pfad: "/api/grafeo?marko=provo&aspekto=komuna", status: 400, enthaelt: GENAU_EINER },
      { pfad: "/api/grafeo?marko=nenia", status: 404, enthaelt: NICHT_GEFUNDEN },
      { pfad: "/api/grafeo?aspekto=nenia", status: 404, enthaelt: NICHT_GEFUNDEN },
      { pfad: "/marko/nenia/grafeo", status: 404, enthaelt: NICHT_GEFUNDEN },
      { pfad: "/aspekto/nenia/grafeo", status: 404, enthaelt: NICHT_GEFUNDEN },
      { pfad: "/aspekto/nenia/grafeo.css", status: 404, enthaelt: NICHT_GEFUNDEN },
      { pfad: "/aspekto/komuna/grafeo.css", status: 200, enthaelt: "--fm-" },
    ];
    expect(
      await abweichungen(mit, [
        ...beide,
        { pfad: "/api/grafeo?aspekto=ekzemplo", status: 200, enthaelt: `"nodoj"` },
      ]),
    ).toEqual([]);
    expect(
      await abweichungen(ohne, [
        ...beide,
        { pfad: "/api/grafeo?marko=provo", status: 200, enthaelt: `"nodoj"` },
        { pfad: "/api/grafeo?aspekto=ekzemplo", status: 404, enthaelt: EKZEMPLO_FEHLT },
        { pfad: "/aspekto/ekzemplo/grafeo", status: 404, enthaelt: EKZEMPLO_FEHLT },
        { pfad: "/aspekto/ekzemplo/grafeo.css", status: 404, enthaelt: EKZEMPLO_FEHLT },
        { pfad: "/marko/provo/grafeo", status: 503, enthaelt: NICHT_GEBAUT },
        { pfad: "/marko/provo/grafeo?scheme=dark", status: 503, enthaelt: NICHT_GEBAUT },
        { pfad: "/aspekto/komuna/grafeo", status: 503, enthaelt: NICHT_GEBAUT },
        { pfad: "/nodredaktilo/leinwand.js", status: 503, enthaelt: NICHT_GEBAUT },
      ]),
    ).toEqual([]);
  });
});
