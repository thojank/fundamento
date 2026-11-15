// Spec 054 T2 (MPFG-2.1): the two views of a brand's canvas and their data. `/marko/:name/grafeo`
// opens Gestalten – the canvas in the neutral Belegung of the editor package (its own stylesheet
// `/nodredaktilo/leinwand.css`, never the brand's), dark unless `scheme=light`, with the mount point
// of the bundle – and never asks the shared check (a counter on the check's gate). `?ansicht=verstehen`
// opens the 047 screen with a switch back; packages keep it without one. `/api/leinwand` answers the
// bytes of the Bildo computed here and writes nothing. Two servers as in 047: one with a stub bundle,
// one without (`leinwand: null`).

import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readAgordo } from "@fundamento/agordilo";
import { buildModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { gestaltenDe, paletrojDe, serializeBildo, wirksamerAgordo } from "./grafeo-gestalten.js";
import { gestaltenScreen } from "./grafeo-gestalten-ekrano.js";
import { grafeoScreen } from "./html.js";
import { PROVO_DOSIERO, provoAgordo } from "./test-doubles/grafeo-047.js";
import { type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { komunaCss, loadBases, previewCss, startAgordo } from "./vorschau.js";

const NICHT_GEBAUT = "Leinwand nicht gebaut: pnpm --filter @fundamento/nodredaktilo build";
const NICHT_GEFUNDEN = "<p>Nicht gefunden.";
const JSON_TYPE = "application/json; charset=utf-8";
const CSS_TYPE = "text/css; charset=utf-8";
const STUB = "export {};\n";
const BELEGUNG_DOSIERO = new URL(
  "../../nodredaktilo/belegung/leinwand.agordo.json",
  import.meta.url,
);

/**
 * SHA-256 of `grafeoScreen` for two fixed inputs (a brand with every field, a package), taken at
 * `aa53d3f4` before this run touched `html.ts`: without the new field the screen is unchanged.
 */
const GRAFEO_AA53D3F4 = {
  marke: "fd8579c340e84badf97aaa76f552bb55c646de0d9f08c73d71479ca4f2c557be",
  paket: "413badedeae777b7e8b8bedaf2fbaf3472fd55f3973ff01d072dea43ad3a5e5a",
};

const text = (body: Buffer): string => body.toString("utf8");
const count = (haystack: string, needle: string): number => haystack.split(needle).length - 1;
const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");
const wurzelDe = (html: string): string => /<html\b[^>]*>/.exec(html)?.[0] ?? "";

/** The Belegung as the server reads it: an ordinary Agordo, checked. */
function belegung() {
  const { agordo, issues } = readAgordo(JSON.parse(readFileSync(BELEGUNG_DOSIERO, "utf8")));
  if (agordo === undefined)
    throw new Error(`the Belegung is no valid Agordo: ${JSON.stringify(issues)}`);
  return agordo;
}

/** The mount point of Gestalten, exactly as MPFG-2.2 reads it. */
const montoDe = (name: string): string =>
  `<div id="nr-leinwand" data-nr-ansicht="gestalten" data-nr-fonto="/api/leinwand?marko=${name}" data-nr-marko="${name}"></div>`;

/** Every file under a brand's folder with its bytes (draft, Kroniko, …). */
function dosierojDe(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const eintrag of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!eintrag.isFile()) continue;
    const pfad = join(eintrag.parentPath, eintrag.name);
    out[pfad.slice(dir.length)] = sha256(readFileSync(pfad, "utf8"));
  }
  return out;
}

/** The words of a judgment: every Regulo's name, id, statement and kialo, and the report's marks. */
function urteilsWoerter(): string[] {
  const modelo = buildModelo(loadBases().structure.files).modelo;
  const reguloj = modelo.reguloj
    .flatMap((r) => [r.name, r.id, r.statement, r.kialo])
    .filter((wort): wort is string => typeof wort === "string" && wort !== "");
  return [
    ...reguloj,
    "nicht exportierbar",
    "nr-ne-eksportebla",
    "Problem",
    "Prüfung",
    "Betroffen",
    "Vorschlag",
    "probleme",
    "betroffen",
    "raporto",
  ];
}

describe("Spec 054 T2: the two views and the data of a brand's canvas", () => {
  let mit: TestServilo;
  let ohne: TestServilo;
  let stubDir: string;
  let pruefungen: string[];

  /** A brand from the fixture file, under a name of its own (so its check is never cached). */
  function marke(server: TestServilo, name: string): void {
    const dir = join(server.workdir, name);
    mkdirSync(dir, { recursive: true });
    if (name === "provo") copyFileSync(PROVO_DOSIERO, join(dir, "agordo.json"));
    else
      writeFileSync(
        join(dir, "agordo.json"),
        `${JSON.stringify({ ...JSON.parse(readFileSync(PROVO_DOSIERO, "utf8")), name }, null, 2)}\n`,
      );
  }

  beforeAll(async () => {
    pruefungen = [];
    stubDir = mkdtempSync(join(tmpdir(), "grafeo-route-054-leinwand-"));
    writeFileSync(join(stubDir, "leinwand.js"), STUB);
    mit = await testServilo("grafeo-route-054-mit-", {
      leinwand: stubDir,
      pruefTor: async (name) => {
        pruefungen.push(name);
      },
    });
    ohne = await testServilo("grafeo-route-054-ohne-", { leinwand: null, ekzemploDir: null });
    for (const name of ["provo", "gestalto", "nekontrolita", "kontrolo"]) marke(mit, name);
    marke(ohne, "provo");
  });

  afterAll(async () => {
    await mit?.close();
    await ohne?.close();
    rmSync(stubDir, { recursive: true, force: true });
  });

  it("opens Gestalten in the Belegung, dark unless scheme=light, with the mount point and both scripts", async () => {
    const aspekto = belegung().name;
    const violations: string[] = [];
    for (const [query, scheme] of [
      ["", "dark"],
      ["?scheme=light", "light"],
      ["?scheme=dark", "dark"],
      ["?scheme=sepia", "dark"],
      ["?ansicht=gestalten", "dark"],
      ["?ansicht=gestalten&scheme=light", "light"],
      ["?ansicht=sonstwas", "dark"],
    ] as const) {
      const pfad = `/marko/gestalto/grafeo${query}`;
      const antwort = await mit.anfrage("GET", pfad);
      const html = text(antwort.body);
      const pruefe = (bedingung: boolean, was: string): void => {
        if (!bedingung) violations.push(`${pfad}: ${was}`);
      };
      pruefe(antwort.status === 200, `status ${antwort.status}`);
      pruefe(antwort.contentType.startsWith("text/html"), `type ${antwort.contentType}`);
      const wurzel = wurzelDe(html);
      pruefe(wurzel.includes(`data-fm-aspekto="${aspekto}"`), `root ${wurzel}`);
      pruefe(wurzel.includes(`data-fm-color-scheme="${scheme}"`), `root ${wurzel}`);
      pruefe(count(html, montoDe("gestalto")) === 1, "mount point");
      pruefe(count(html, `id="nr-leinwand"`) === 1, "one mount point");
      pruefe(count(html, `<script type="module" src="/eroj/define.js"></script>`) === 1, "eroj");
      pruefe(
        count(html, `<script type="module" src="/nodredaktilo/leinwand.js"></script>`) === 1,
        "bundle",
      );
      pruefe(
        count(html, `<link rel="stylesheet" href="/nodredaktilo/leinwand.css">`) === 1,
        "Belegung",
      );
      pruefe(count(html, "<link ") === 1, "one stylesheet only");
      pruefe(!html.includes("vorschau.css"), "no stylesheet of the brand (AK-14)");
      pruefe(!html.includes("/api/grafeo"), "no 047 data");
    }
    expect(violations).toEqual([]);
  });

  it("never asks the shared check for Gestalten, but Verstehen still does", async () => {
    // A brand no other test opens, so no check of its rev can be held from before.
    pruefungen.length = 0;
    const statuses: number[] = [];
    for (const pfad of [
      "/marko/nekontrolita/grafeo",
      "/marko/nekontrolita/grafeo?scheme=light",
      "/marko/nekontrolita/grafeo?ansicht=gestalten",
      "/api/leinwand?marko=nekontrolita",
      "/nodredaktilo/leinwand.css",
    ]) {
      statuses.push((await mit.anfrage("GET", pfad)).status);
    }
    expect(statuses).toEqual([200, 200, 200, 200, 200]);
    expect(pruefungen).toEqual([]);
    // The control: the gate counts, the 047 view asks the check of its rev once.
    await mit.anfrage("GET", "/marko/kontrolo/grafeo?ansicht=verstehen");
    expect(pruefungen).toEqual(["kontrolo"]);
  });

  it("names no Regulo, no problem count and no report sentence on the page or in its data (AK-9)", async () => {
    const woerter = urteilsWoerter();
    const befunde: string[] = [];
    for (const pfad of [
      "/marko/gestalto/grafeo",
      "/marko/gestalto/grafeo?scheme=light",
      "/api/leinwand?marko=gestalto",
    ]) {
      const korpo = text((await mit.anfrage("GET", pfad)).body);
      for (const wort of woerter) if (korpo.includes(wort)) befunde.push(`${pfad}: ${wort}`);
    }
    expect(befunde).toEqual([]);
  });

  it("opens Verstehen as the 047 screen with a switch back; packages have none (AK-5, AK-8)", async () => {
    const zurueck = `<fm-ligilo to="/marko/provo/grafeo" placement="standalone">Gestalten</fm-ligilo>`;
    const verstehen = text(
      (await mit.anfrage("GET", "/marko/provo/grafeo?ansicht=verstehen")).body,
    );
    expect(
      count(verstehen, `<div id="nr-leinwand" data-nr-fonto="/api/grafeo?marko=provo"></div>`),
    ).toBe(1);
    expect(verstehen).not.toContain("data-nr-ansicht");
    expect(count(verstehen, zurueck)).toBe(1);
    expect(wurzelDe(verstehen)).toContain(`data-fm-aspekto="provo"`);
    expect(verstehen).toContain(`<link rel="stylesheet" href="/marko/provo/vorschau.css?rev=1">`);
    const dunkel = text(
      (await mit.anfrage("GET", "/marko/provo/grafeo?ansicht=verstehen&scheme=dark")).body,
    );
    expect(wurzelDe(dunkel)).toContain(`data-fm-color-scheme="dark"`);
    for (const label of ["komuna", "ekzemplo"]) {
      const paket = text((await mit.anfrage("GET", `/aspekto/${label}/grafeo`)).body);
      expect({
        label,
        schalter: count(paket, "Gestalten"),
        ansicht: count(paket, "ansicht"),
      }).toEqual({
        label,
        schalter: 0,
        ansicht: 0,
      });
    }
  });

  it("renders the 047 screen byte for byte as before without the new field (D-2)", () => {
    const marke = {
      aspekto: "provo",
      scheme: "dark",
      cssHref: "/marko/provo/vorschau.css?rev=3",
      fontFace: "@font-face{}",
      fonto: "/api/grafeo?marko=provo",
      studioHref: "/studio/provo/farbe?scheme=dark",
      neEksportebla: true,
    } as const;
    const paket = {
      aspekto: "komuna",
      scheme: "light",
      cssHref: "/aspekto/komuna/grafeo.css",
      fonto: "/api/grafeo?aspekto=komuna",
    } as const;
    expect({ marke: sha256(grafeoScreen(marke)), paket: sha256(grafeoScreen(paket)) }).toEqual(
      GRAFEO_AA53D3F4,
    );
    const mitSchalter = grafeoScreen({ ...marke, gestaltenHref: "/marko/provo/grafeo" });
    const schalter = ` <span id="nr-ansicht"><fm-ligilo to="/marko/provo/grafeo" placement="standalone">Gestalten</fm-ligilo> | Verstehen</span>`;
    expect(count(mitSchalter, schalter)).toBe(1);
    expect(mitSchalter.replace(schalter, "")).toBe(grafeoScreen(marke));
  });

  it("serves leinwand.css: the Belegung in both schemes, only existing --fm-* names, in memory", async () => {
    const aspekto = belegung().name;
    const antwort = await mit.anfrage("GET", "/nodredaktilo/leinwand.css");
    expect({ status: antwort.status, type: antwort.contentType }).toEqual({
      status: 200,
      type: CSS_TYPE,
    });
    const css = text(antwort.body);
    // R-7: the derivation of the Belegung itself, the same as for a brand's preview.
    const bases = loadBases();
    expect(css).toBe(previewCss(belegung(), bases));
    // R-14: the root of the page names the Belegung the stylesheet's selectors name.
    expect(css).toContain(`:where(:root[data-fm-aspekto="${aspekto}"]) {`);
    expect(css).toContain(
      `:where(:root[data-fm-aspekto="${aspekto}"][data-fm-color-scheme="dark"]) {`,
    );
    const seite = gestaltenScreen({ marko: "provo", etikedo: "provo", aspekto, scheme: "light" });
    expect(wurzelDe(seite)).toContain(`data-fm-aspekto="${aspekto}"`);
    const namen = (stilo: string): Set<string> =>
      new Set([...stilo.matchAll(/(--fm-[a-z0-9-]+):/g)].map(([, name = ""]) => name));
    const kern = namen(komunaCss(bases));
    expect([...namen(css)].filter((name) => !kern.has(name))).toEqual([]);
    const wieder = await mit.anfrage("GET", "/nodredaktilo/leinwand.css");
    expect(wieder.body.equals(antwort.body)).toBe(true);
    // The generic static route still serves the bundle.
    expect(text((await mit.anfrage("GET", "/nodredaktilo/leinwand.js")).body)).toBe(STUB);
  });

  it("answers /api/leinwand with the bytes of the Bildo and writes nothing", async () => {
    const bases = loadBases();
    const agordo = provoAgordo();
    const start = startAgordo("provo", "leer");
    const palettes = paletrojDe(wirksamerAgordo(agordo, start, {}), bases);
    const erwartet = serializeBildo(gestaltenDe(agordo, { start, kabloj: {}, palettes, rev: 1 }));
    const dir = join(mit.workdir, "provo");
    const vorher = dosierojDe(dir);
    for (const server of [mit, ohne]) {
      for (let mal = 0; mal < 2; mal++) {
        const antwort = await server.anfrage("GET", "/api/leinwand?marko=provo");
        expect({ status: antwort.status, type: antwort.contentType }).toEqual({
          status: 200,
          type: JSON_TYPE,
        });
        expect(text(antwort.body) === erwartet).toBe(true);
      }
    }
    expect(dosierojDe(dir)).toEqual(vorher);
    // The rev holds: the 047 view still links the stylesheet of rev 1.
    const verstehen = text(
      (await mit.anfrage("GET", "/marko/provo/grafeo?ansicht=verstehen")).body,
    );
    expect(verstehen).toContain("vorschau.css?rev=1");
  });

  it("answers a missing thing the same way on both views, the data and the Belegung", async () => {
    const abweichungen = async (
      server: TestServilo,
      erwartungen: { pfad: string; status: number; enthaelt: string }[],
    ): Promise<string[]> => {
      const out: string[] = [];
      for (const e of erwartungen) {
        const antwort = await server.anfrage("GET", e.pfad);
        const korpo = text(antwort.body);
        if (antwort.status !== e.status || !korpo.includes(e.enthaelt))
          out.push(`${e.pfad}: ${antwort.status} ${JSON.stringify(korpo.slice(0, 120))}`);
      }
      return out;
    };
    const beide = [
      { pfad: "/marko/nenia/grafeo", status: 404, enthaelt: NICHT_GEFUNDEN },
      { pfad: "/marko/nenia/grafeo?ansicht=verstehen", status: 404, enthaelt: NICHT_GEFUNDEN },
      { pfad: "/api/leinwand?marko=nenia", status: 404, enthaelt: NICHT_GEFUNDEN },
      { pfad: "/api/leinwand", status: 400, enthaelt: "Parameter marko" },
      { pfad: "/api/leinwand?marko=provo", status: 200, enthaelt: `"nodoj"` },
    ];
    expect(await abweichungen(mit, beide)).toEqual([]);
    expect(
      await abweichungen(ohne, [
        ...beide,
        { pfad: "/marko/provo/grafeo", status: 503, enthaelt: NICHT_GEBAUT },
        { pfad: "/marko/provo/grafeo?scheme=light", status: 503, enthaelt: NICHT_GEBAUT },
        { pfad: "/marko/provo/grafeo?ansicht=verstehen", status: 503, enthaelt: NICHT_GEBAUT },
        { pfad: "/nodredaktilo/leinwand.css", status: 503, enthaelt: NICHT_GEBAUT },
        { pfad: "/nodredaktilo/leinwand.js", status: 503, enthaelt: NICHT_GEBAUT },
      ]),
    ).toEqual([]);
  });
});
