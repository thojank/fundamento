// Spec 054 T6 (MPFG-3.3, AK-10, AK-23): the preview nodes of the view Gestalten. From the first
// Bildo there are exactly two, one light and one dark; each points at the brand's preview WITHOUT
// Prüfmarken (`sxtupo=vorschau`, never a frame of the stage `buehne-*`, whose document carries
// `pruefungHtml`) in its own scheme, at the rev of the Bildo. The document behind such an address
// carries no mark of the check and never asks the check (a counter on the check's gate); a frame of
// the stage at the same brand does both, so the assertions can fail. A new rev or a new `kabloj`
// gives a new address (a write through an existing route raises the rev the hrefs carry). The node
// itself (`nodoj/vorschau.tsx`) has no test runner of its own (D-7); its source is read for the
// contract the measurement script relies on: frames made by script only, double-buffered, the rev
// all connected previews show on the mount element, the sentence without an incoming edge.

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { pruefungHtml } from "./buehne-pruefung.js";
import {
  type Bildo,
  type BildoVorschau,
  NE_KONEKTITA_SATZ,
  vorschauHref,
} from "./grafeo-gestalten-sicht.js";
import { PROVO_DOSIERO } from "./test-doubles/grafeo-047.js";
import { type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

const VORSCHAU_TSX = fileURLToPath(
  new URL("../../nodredaktilo/src/gestalten/nodoj/vorschau.tsx", import.meta.url),
);

const text = (body: Buffer): string => body.toString("utf8");
const wurzelDe = (html: string): string => /<html\b[^>]*>/.exec(html)?.[0] ?? "";
const vorschauenDe = (bildo: Bildo): BildoVorschau[] =>
  bildo.nodoj.filter((n): n is BildoVorschau => n.speco === "vorschau");

/** The marks `pruefungHtml` lays into a document of the stage (empty list: the frame still has them). */
const PRUEFMARKEN = ['id="mt-pruefung"', "data-mt-pruefung", pruefungHtml([]).slice(0, 40)];

describe("Spec 054 T6: the preview nodes show the brand without Prüfmarken", () => {
  let server: TestServilo;
  let pruefungen: string[];

  /** A brand from the fixture file, under a name of its own (so no check of its rev is cached). */
  function marke(name: string): void {
    const dir = join(server.workdir, name);
    mkdirSync(dir, { recursive: true });
    if (name === "provo") copyFileSync(PROVO_DOSIERO, join(dir, "agordo.json"));
    else
      writeFileSync(
        join(dir, "agordo.json"),
        `${JSON.stringify({ ...JSON.parse(readFileSync(PROVO_DOSIERO, "utf8")), name }, null, 2)}\n`,
      );
  }

  async function bildoDe(name: string): Promise<Bildo> {
    const antwort = await server.anfrage("GET", `/api/leinwand?marko=${name}`);
    expect(antwort.status).toBe(200);
    return JSON.parse(text(antwort.body)) as Bildo;
  }

  beforeAll(async () => {
    pruefungen = [];
    server = await testServilo("grafeo-vorschau-054-", {
      pruefTor: async (name) => {
        pruefungen.push(name);
      },
    });
    for (const name of ["provo", "vorschauo", "bildilo", "kontrolo"]) marke(name);
  });

  afterAll(async () => {
    await server?.close();
  });

  it("gives exactly two previews from the first Bildo, light and dark, at the preview without Prüfmarken (AK-10, AK-23)", async () => {
    const violations: string[] = [];
    for (const name of ["provo", "vorschauo"]) {
      const bildo = await bildoDe(name);
      const vorschauen = vorschauenDe(bildo);
      const ids = vorschauen.map((v) => `${v.id}:${v.schema}:${v.fazo}`).sort();
      if (
        JSON.stringify(ids) !==
        JSON.stringify(["vorschau-dunkel:dunkel:fazo-5", "vorschau-hell:hell:fazo-5"])
      )
        violations.push(`${name}: nodes ${JSON.stringify(ids)}`);
      for (const v of vorschauen) {
        const adreso = new URL(v.href, "http://localhost");
        const pruefe = (bedingung: boolean, was: string): void => {
          if (!bedingung) violations.push(`${name} ${v.id}: ${was} (${v.href})`);
        };
        pruefe(adreso.pathname === `/marko/${name}/vorschau`, "path");
        pruefe(adreso.searchParams.get("sxtupo") === "vorschau", "sxtupo=vorschau");
        pruefe(!v.href.includes("buehne"), "no frame of the stage");
        pruefe(!adreso.searchParams.has("propono"), "no proposal");
        pruefe(adreso.searchParams.get("breite") === "mittel", "breite=mittel");
        pruefe(
          adreso.searchParams.get("scheme") === (v.schema === "hell" ? "light" : "dark"),
          "its own scheme",
        );
        pruefe(adreso.searchParams.get("rev") === String(bildo.rev), "the Bildo's rev");
        pruefe(!adreso.searchParams.has("kabloj"), "no kabloj while the view is the Agordo's");
        pruefe(v.href === vorschauHref(name, v.schema, bildo.rev, {}), "built by vorschauHref");
      }
    }
    expect(violations).toEqual([]);
  });

  it("serves at each preview href a document without Prüfmarken and asks no check, unlike the stage", async () => {
    // A brand no other test opens, so no check of its rev can be held from before.
    pruefungen.length = 0;
    const bildo = await bildoDe("bildilo");
    const violations: string[] = [];
    for (const v of vorschauenDe(bildo)) {
      const antwort = await server.anfrage("GET", v.href);
      const html = text(antwort.body);
      if (antwort.status !== 200) violations.push(`${v.id}: status ${antwort.status}`);
      if (!antwort.contentType.startsWith("text/html"))
        violations.push(`${v.id}: type ${antwort.contentType}`);
      const scheme = v.schema === "hell" ? "light" : "dark";
      if (!wurzelDe(html).includes(`data-fm-color-scheme="${scheme}"`))
        violations.push(`${v.id}: root ${wurzelDe(html)}`);
      if (!html.includes("<fm-")) violations.push(`${v.id}: no Eroj in the document`);
      for (const marko of PRUEFMARKEN)
        if (html.includes(marko)) violations.push(`${v.id}: carries ${marko}`);
    }
    expect(violations).toEqual([]);
    expect(pruefungen).toEqual([]);

    // The control: the stage's frame at the same brand and rev carries the marks and asks the check.
    const buehne = text(
      (await server.anfrage("GET", `/marko/kontrolo/vorschau?sxtupo=buehne-farbe&rev=${bildo.rev}`))
        .body,
    );
    expect(PRUEFMARKEN.filter((marko) => !buehne.includes(marko))).toEqual([]);
    expect(pruefungen).toEqual(["kontrolo"]);
  });

  it("gives a new address for a new rev or a new kabloj, and the same for the same inputs", async () => {
    const vor = await bildoDe("vorschauo");
    const antwort = await server.anfrage(
      "POST",
      "/api/marko/vorschauo/entwurf",
      JSON.stringify({ leitfarbe: "#f5c400" }),
    );
    expect(antwort.status).toBe(200);
    const nach = await bildoDe("vorschauo");
    expect(nach.rev).toBe(vor.rev + 1);
    const hrefs = (b: Bildo) => vorschauenDe(b).map((v) => v.href);
    // Every href of the new Bildo is new, and carries the new rev.
    expect(hrefs(nach).filter((h) => hrefs(vor).includes(h))).toEqual([]);
    expect(
      vorschauenDe(nach).map((v) => new URL(v.href, "http://localhost").searchParams.get("rev")),
    ).toEqual([String(nach.rev), String(nach.rev)]);

    const ohne = vorschauHref("vorschauo", "hell", nach.rev, {});
    expect(vorschauHref("vorschauo", "hell", nach.rev, {})).toBe(ohne);
    expect(vorschauHref("vorschauo", "hell", nach.rev + 1, {})).not.toBe(ohne);
    expect(vorschauHref("vorschauo", "dunkel", nach.rev, {})).not.toBe(ohne);
    const mit = vorschauHref("vorschauo", "hell", nach.rev, { akzent: null });
    expect(mit).not.toBe(ohne);
    expect(new URL(mit, "http://localhost").searchParams.get("kabloj")).toBe("akzent:-");
    expect(new URL(mit, "http://localhost").searchParams.get("sxtupo")).toBe("vorschau");
  });

  it("the node makes its frames by script, double-buffered, publishes the shown rev and shows the sentence without an edge", () => {
    const quelle = readFileSync(VORSCHAU_TSX, "utf8");
    const code = quelle
      .split("\n")
      .filter((zeile) => !/^\s*(\/\/|\*|\/\*)/.test(zeile))
      .join("\n");
    const fehlt = (
      [
        ["frames made by script", /document\.createElement\("iframe"\)/],
        ["the address from vorschauHref", /\bvorschauHref\(/],
        ["the old frame waits for the new one's load", /addEventListener\("load"/],
        ["the rev all connected previews show", /nrVorschauRev|data-nr-vorschau-rev/],
        ["the sentence without an edge", /\bNE_KONEKTITA_SATZ\b/],
        ["whether the input has an edge", /\bverbunden\(/],
        ["„×“ for a session preview", /\bforigi\(/],
        ["no drag from the frame", /\bNODRAG\b/],
        ["no canvas wheel over the frame", /\bNOWHEEL\b/],
      ] as const
    )
      .filter(([, muster]) => !muster.test(code))
      .map(([was]) => was);
    expect(fehlt).toEqual([]);
    const verboten = (
      [
        ["a frame in JSX (the parser's frames come back on reload in Firefox)", /<iframe\b/],
        ["a frame of the stage", /buehne/],
        // The context's `skemo` is the canvas's switch; a preview keeps its own scheme (AK-23).
        ["the canvas's scheme", /[{,]\s*skemo\s*[,}:]|\.skemo\b/],
      ] as const
    )
      .filter(([, muster]) => muster.test(code))
      .map(([was]) => was);
    expect(verboten).toEqual([]);
    expect(NE_KONEKTITA_SATZ).toBe(
      "Nicht verbunden. Ziehe eine Verbindung von der Palette oder der Marke hierher.",
    );
  });
});
