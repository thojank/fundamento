// Spec 058 (MP-2c, T9, MAW-4.2, parts G and H, AK-3, AK-17, AK-18): the view „Marke“ of a preview
// node (`markeKorpo`) in its three layouts and the view „Komponenten“ (`komponentenKorpo`).
//   - Every layout, in light and dark, has the accent in at least three places (`data-mt-akzent`
//     „flaeche“, „marke“, „hervorhebung“), never on a button, a link or the focus (no accent element
//     is or holds an `fm-butono`, `fm-ligilo`, `a` or `button`, and no CSS rule with an accent role
//     aims at one of them or at `:focus`). The band takes `color.brand.fill` with `color.brand.text`.
//   - The content follows the source table (Kernsatz → first sentence of the description → a
//     neutral sentence; description → neutral text; Leitgedanken → first three Werte → neutral;
//     Charakter → Persönlichkeit → neutral words); every text of the brand is escaped.
//   - The root carries `data-mt-aufbau`; headings come in order; the field has a label; the CSS has
//     no literal value and every `var(--fm-…)` it names is defined by the brand's stylesheet.
//   - „Komponenten“ is today's body of `sxtupo=vorschau` plus exactly one accent place (a badge).
// Pure where it can be; the two views over HTTP for light and dark. Invented brand only.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AUFBAUOJ, type AufbauId, type MarkeInhalt } from "./grafeo-gestalten-sicht.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";
import { MARKE_NEUTRAL, markeKorpo } from "./vorschau-marke.js";

const AKZENTOJ = ["flaeche", "marke", "hervorhebung"] as const;

/** One start tag of the markup with its attributes, and the tags open around it. */
interface Etikedo {
  nomo: string;
  atributoj: string;
  supraj: readonly { nomo: string; atributoj: string }[];
}

const MALPLENAJ = new Set(["input", "br", "img", "meta", "link", "hr", "source", "wbr"]);

/** Every start tag of `html` with the tags it stands in (a small parser for our own markup). */
function etikedojDe(html: string): Etikedo[] {
  const sen = html.replace(/<style>[\s\S]*?<\/style>/g, "");
  const stako: { nomo: string; atributoj: string }[] = [];
  const out: Etikedo[] = [];
  for (const m of sen.matchAll(/<(\/?)([a-z][a-z0-9-]*)([^>]*)>/g)) {
    const [, fino = "", nomo = "", atributoj = ""] = m;
    if (fino === "/") {
      const loko = stako.map((s) => s.nomo).lastIndexOf(nomo);
      if (loko >= 0) stako.length = loko;
      continue;
    }
    out.push({ nomo, atributoj, supraj: [...stako] });
    if (!MALPLENAJ.has(nomo) && !atributoj.trimEnd().endsWith("/")) stako.push({ nomo, atributoj });
  }
  return out;
}

const akzentoDe = (atributoj: string): string | undefined =>
  /\bdata-mt-akzent="([^"]*)"/.exec(atributoj)?.[1];

/** The kinds of the accent places, one entry per place. */
const akzentojDe = (html: string): string[] =>
  etikedojDe(html).flatMap((e) => {
    const a = akzentoDe(e.atributoj);
    return a === undefined ? [] : [a];
  });

/** The text of the page without tags and without its stylesheet. */
const tekstoDe = (html: string): string =>
  html
    .replace(/<style>[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

const stiloDe = (html: string): string =>
  [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? "").join("\n");

/** The heading levels in the order of the markup (Ero titles and cards, native headings). */
function nivelojDe(html: string): number[] {
  return etikedojDe(html).flatMap((e) => {
    if (/^h[1-6]$/.test(e.nomo)) return [Number(e.nomo.slice(1))];
    if (e.nomo === "fm-titolo" || e.nomo === "fm-karto") {
      const n = /\blevel="([1-6])"/.exec(e.atributoj)?.[1];
      return n === undefined ? [] : [Number(n)];
    }
    return [];
  });
}

const PLENA: MarkeInhalt = {
  name: "Lumeto",
  kernsatz: "Gutes Licht dort, wo mit den Händen gearbeitet wird.",
  beschreibung: "Lumeto baut Leuchten für Werkstätten. Jede lässt sich reparieren.",
  leitgedanken: [
    { titel: "Nah am Werkstück", text: "Licht, das dem Handgriff folgt." },
    { titel: "Mutig einfach", text: "Ein Schalter, ein Gelenk." },
    { titel: "Gründlich gebaut", text: "Jedes Teil lässt sich tauschen." },
  ],
  werte: ["ehrlich", "robust", "nahbar", "leise"],
  charakter: ["nahbar", "mutig", "gründlich"],
  persoenlichkeit: ["warm", "ruhig"],
};

describe("MAW-4.2: markeKorpo – three layouts", () => {
  it.each(AUFBAUOJ)(
    "%s: the root carries data-mt-aufbau and the page shows the brand",
    (aufbau) => {
      const html = markeKorpo(PLENA, aufbau);
      const wurzel = etikedojDe(html)[0];
      expect(wurzel?.atributoj).toContain(`data-mt-aufbau="${aufbau}"`);
      expect(etikedojDe(html).filter((e) => /data-mt-aufbau=/.test(e.atributoj))).toHaveLength(1);
      const teksto = tekstoDe(html);
      expect(teksto).toContain("Lumeto");
      expect(teksto).toContain("Gutes Licht dort");
    },
  );

  it("the three layouts are three different pages of the same building blocks", () => {
    const seiten = AUFBAUOJ.map((a) => markeKorpo(PLENA, a));
    expect(new Set(seiten).size).toBe(3);
    for (const html of seiten)
      for (const ero of [
        "fm-titolo",
        "fm-teksto",
        "fm-butono",
        "fm-kampo",
        "fm-avizo",
        "fm-ligilo",
      ])
        expect(html, ero).toContain(`<${ero}`);
    // Cards as Eroj in „Großer Titel“ and „Kartenraster“, the Leitgedanken as a numbered list in „Ruhige Liste“.
    expect(seiten[0]).toContain("<fm-karto");
    expect(seiten[1]).toContain("<fm-karto");
    expect(seiten[2]).toContain("<ol");
    // Marks (Insignoj) as real Eroj; „Ruhige Liste“ names the Charakter words as a quiet line.
    expect(seiten[0]).toContain("<fm-insigno");
    expect(seiten[1]).toContain("<fm-insigno");
    expect(seiten[2]).toMatch(/class="mt-worte"/);
  });

  it.each(AUFBAUOJ)("%s: buttons of high and medium emphasis, none in an accent role", (aufbau) => {
    const html = markeKorpo(PLENA, aufbau);
    expect(html).toMatch(/<fm-butono[^>]*emphasis="high"/);
    expect(html).toMatch(/<fm-butono[^>]*emphasis="medium"/);
  });
});

describe("MAW-4.2: the accent in at least three places (part H)", () => {
  it.each(AUFBAUOJ)("%s: Fläche, Marke and Hervorhebung, at least three places", (aufbau) => {
    const kinds = akzentojDe(markeKorpo(PLENA, aufbau));
    expect(kinds.length).toBeGreaterThanOrEqual(3);
    for (const a of AKZENTOJ) expect(kinds, a).toContain(a);
    expect(kinds.filter((a) => !(AKZENTOJ as readonly string[]).includes(a))).toEqual([]);
    // The numbers of the three cards (or list entries) are accent marks too.
    expect(kinds.filter((a) => a === "marke").length).toBeGreaterThanOrEqual(4);
  });

  it.each(AUFBAUOJ)("%s: never on a button, a link or around one", (aufbau) => {
    const aktivaj = ["fm-butono", "fm-ligilo", "a", "button"];
    const fehler = etikedojDe(markeKorpo(PLENA, aufbau)).filter(
      (e) =>
        aktivaj.includes(e.nomo) &&
        (akzentoDe(e.atributoj) !== undefined ||
          e.supraj.some((s) => akzentoDe(s.atributoj) !== undefined)),
    );
    expect(fehler.map((e) => `${e.nomo}${e.atributoj}`)).toEqual([]);
  });

  it("the accent roles stand only in rules for accent places, never for actions, links or focus", () => {
    const stilo = stiloDe(markeKorpo(PLENA, "titel"));
    const reguloj = [...stilo.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
      selektilo: (m[1] ?? "").trim(),
      deklaroj: m[2] ?? "",
    }));
    const kunAkzento = reguloj.filter((r) => r.deklaroj.includes("--fm-color-sekundo-"));
    expect(kunAkzento.length).toBeGreaterThanOrEqual(3);
    for (const r of kunAkzento) {
      expect(r.selektilo).not.toMatch(/butono|ligilo|button|focus|(^|[\s,>+~])a([\s,:.[]|$)/);
      expect(r.selektilo).toMatch(/data-mt-akzent|mt-/);
    }
    for (const rolo of [
      "--fm-color-sekundo-surface",
      "--fm-color-sekundo-illustration",
      "--fm-color-sekundo-badge-fill",
      "--fm-color-sekundo-badge-text",
    ])
      expect(stilo, rolo).toContain(`var(${rolo})`);
    // D-5: the band in the primary colour carries its text role.
    expect(stilo).toContain("var(--fm-color-brand-fill)");
    expect(stilo).toContain("var(--fm-color-brand-text)");
    // The focus stays visible: nothing takes the outline away.
    expect(stilo).not.toMatch(/outline\s*:\s*(none|0)/);
  });

  it("uses no literal value: no px, rem, em, ms, hex or colour function", () => {
    for (const aufbau of AUFBAUOJ) {
      const stilo = stiloDe(markeKorpo(PLENA, aufbau));
      expect(stilo).not.toMatch(/\d(px|rem|em|ms|s)\b/);
      expect(stilo).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?|oklch)\(/);
      // Logical properties only.
      expect(stilo).not.toMatch(
        /\b(margin|padding|border)-(left|right|top|bottom)\b|(^|[\s;{])(width|height)\s*:/,
      );
    }
  });
});

describe("MAW-4.2: where the contents come from (source table)", () => {
  it("Kernsatz first; then the first sentence of the description; else a neutral sentence", () => {
    const h1 = (inhalt: MarkeInhalt) => {
      const html = markeKorpo(inhalt, "titel");
      const m = /<fm-titolo[^>]*level="1"[^>]*>([\s\S]*?)<\/fm-titolo>/.exec(html);
      // The mark of the headline is inline: its tags stand inside a word's line, not between words.
      return (m?.[1] ?? "").replace(/<[^>]+>/g, "").trim();
    };
    expect(h1(PLENA)).toBe("Gutes Licht dort, wo mit den Händen gearbeitet wird.");
    const { kernsatz: _k, ...senKern } = PLENA;
    expect(h1(senKern)).toBe("Lumeto baut Leuchten für Werkstätten.");
    expect(h1({ name: "Lumeto" })).toBe(MARKE_NEUTRAL.kernsatz);
  });

  it("the description, else a neutral text", () => {
    expect(tekstoDe(markeKorpo(PLENA, "raster"))).toContain(PLENA.beschreibung);
    expect(tekstoDe(markeKorpo({ name: "Lumeto" }, "raster"))).toContain(MARKE_NEUTRAL.text);
  });

  it("three Leitgedanken; else the first three Werte; else neutral contents", () => {
    for (const aufbau of AUFBAUOJ) {
      const mit = tekstoDe(markeKorpo(PLENA, aufbau));
      for (const g of PLENA.leitgedanken ?? []) {
        expect(mit).toContain(g.titel);
        expect(mit).toContain(g.text);
      }
      const { leitgedanken: _l, ...senGedanken } = PLENA;
      const werte = tekstoDe(markeKorpo(senGedanken, aufbau));
      for (const w of ["ehrlich", "robust", "nahbar"]) expect(werte).toContain(w);
      expect(werte).not.toContain("leise");
      const neutral = tekstoDe(markeKorpo({ name: "Lumeto" }, aufbau));
      for (const k of MARKE_NEUTRAL.karten) expect(neutral).toContain(k.titel);
    }
  });

  it("Charakter as marks; else Persönlichkeit; else neutral words", () => {
    const insignoj = (inhalt: MarkeInhalt) =>
      [...markeKorpo(inhalt, "titel").matchAll(/<fm-insigno[^>]*>([^<]*)<\/fm-insigno>/g)].map(
        (m) => m[1],
      );
    expect(insignoj(PLENA)).toEqual(["nahbar", "mutig", "gründlich"]);
    const { charakter: _c, ...senCharakter } = PLENA;
    expect(insignoj(senCharakter)).toEqual(["warm", "ruhig"]);
    expect(insignoj({ name: "Lumeto" })).toEqual([...MARKE_NEUTRAL.worte]);
  });

  it("an empty brand shows its name and invented neutral content in every layout", () => {
    for (const aufbau of AUFBAUOJ) {
      const teksto = markeKorpo({ name: "Leerlicht" }, aufbau).replace(/<[^>]+>/g, "");
      expect(teksto).toContain("Leerlicht");
      expect(teksto).toContain(MARKE_NEUTRAL.kernsatz);
      expect(akzentojDe(markeKorpo({ name: "Leerlicht" }, aufbau)).length).toBeGreaterThanOrEqual(
        3,
      );
    }
  });

  it("escapes every text of the brand", () => {
    const boese = '<script>alert("x")</script>&<b>';
    const inhalt: MarkeInhalt = {
      name: boese,
      kernsatz: `Satz ${boese}`,
      beschreibung: `Text ${boese}`,
      leitgedanken: [{ titel: `T ${boese}`, text: `G ${boese}` }],
      werte: [`W ${boese}`],
      charakter: [`C ${boese}`],
      persoenlichkeit: [`P ${boese}`],
    };
    for (const aufbau of AUFBAUOJ) {
      const html = markeKorpo(inhalt, aufbau);
      expect(html).not.toContain("<script>");
      expect(html).not.toContain("<b>");
      expect(html).toContain("&lt;script&gt;");
    }
    const { leitgedanken: _l, charakter: _c, ...ohne } = inhalt;
    const html = markeKorpo(ohne, "liste");
    expect(html).not.toContain("<script>");
    expect(html).toContain("W &lt;script&gt;");
    expect(html).toContain("P &lt;script&gt;");
  });

  it("a very long name or Kernsatz wraps instead of running out of the page", () => {
    const lang = "Leuchtenmanufakturwerkstattgenossenschaft".repeat(3);
    for (const aufbau of AUFBAUOJ) {
      const html = markeKorpo({ name: lang, kernsatz: `${lang} ${lang}` }, aufbau);
      expect(stiloDe(html)).toMatch(/overflow-wrap:\s*anywhere/);
      expect(tekstoDe(html)).toContain(lang);
    }
  });
});

describe("MAW-4.2: the page holds the usual accessibility bar", () => {
  it.each(AUFBAUOJ)("%s: one h1 first, no level skipped", (aufbau: AufbauId) => {
    const niveloj = nivelojDe(markeKorpo(PLENA, aufbau));
    expect(niveloj[0]).toBe(1);
    expect(niveloj.filter((n) => n === 1)).toHaveLength(1);
    for (let i = 1; i < niveloj.length; i++)
      expect(niveloj[i] ?? 0, `heading ${i}`).toBeLessThanOrEqual((niveloj[i - 1] ?? 0) + 1);
  });

  it.each(AUFBAUOJ)(
    "%s: the field has a label and nothing is taken out of the tab order",
    (aufbau) => {
      const html = markeKorpo(PLENA, aufbau);
      const kampo = /<fm-kampo[^>]*>([\s\S]*?)<\/fm-kampo>/.exec(html);
      expect(
        tekstoDe((kampo?.[1] ?? "").replace(/<span slot="help">[\s\S]*?<\/span>/, "")).trim(),
      ).not.toBe("");
      expect(html).not.toMatch(/tabindex="-?[1-9]|tabindex="-1"/);
    },
  );
});

describe("MAW-4.2: the two views over HTTP, light and dark", () => {
  let server: TestServilo;
  const seite = async (query: string): Promise<string> => {
    const a = await server.anfrage("GET", `/marko/lumeto/vorschau?${query}`);
    expect(a.status).toBe(200);
    return a.body.toString("utf8");
  };
  const korpo = (html: string): string =>
    html.slice(
      html.indexOf("<body>") + "<body>".length,
      html.indexOf('<script type="application/json"'),
    );

  beforeAll(async () => {
    server = await testServilo("vorschau-marke-058-");
    await markeAnlegen(server, "lumeto", "leer");
  });

  afterAll(async () => {
    await server?.close();
  });

  it("every layout × scheme shows at least three accent places of all three kinds", async () => {
    for (const aufbau of AUFBAUOJ)
      for (const scheme of ["light", "dark"]) {
        const html = await seite(
          `sxtupo=marke&breite=mittel&scheme=${scheme}&rev=1&aufbau=${aufbau}&inh=0011223344556677`,
        );
        expect(html).toContain(`data-fm-color-scheme="${scheme}"`);
        expect(html).toContain(`data-mt-aufbau="${aufbau}"`);
        const kinds = akzentojDe(korpo(html));
        expect(kinds.length, `${aufbau} ${scheme}`).toBeGreaterThanOrEqual(3);
        for (const a of AKZENTOJ) expect(kinds, `${aufbau} ${scheme}`).toContain(a);
      }
  });

  it("„Komponenten“ is today's body plus exactly one accent place, a badge", async () => {
    for (const scheme of ["light", "dark"]) {
      const vorschau = korpo(await seite(`sxtupo=vorschau&breite=mittel&scheme=${scheme}&rev=1`));
      const komponenten = korpo(
        await seite(`sxtupo=komponenten&breite=mittel&scheme=${scheme}&rev=1`),
      );
      expect(komponenten.endsWith(vorschau.replace(/^\n/, ""))).toBe(true);
      const plus = komponenten.slice(0, komponenten.length - vorschau.replace(/^\n/, "").length);
      expect(akzentojDe(plus)).toEqual(["marke"]);
      expect(akzentojDe(vorschau)).toEqual([]);
      expect(stiloDe(plus)).toContain("var(--fm-color-sekundo-badge-fill)");
      expect(stiloDe(plus)).toContain("var(--fm-color-sekundo-badge-text)");
    }
  });

  it("every var(--fm-…) of the page is defined by the brand's stylesheet", async () => {
    const css = (await server.anfrage("GET", "/marko/lumeto/vorschau.css?rev=1")).body.toString(
      "utf8",
    );
    const definitaj = new Set([...css.matchAll(/(--fm-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
    const nomoj = new Set<string>();
    for (const aufbau of AUFBAUOJ)
      for (const m of stiloDe(markeKorpo(PLENA, aufbau)).matchAll(/var\((--fm-[a-z0-9-]+)/g))
        nomoj.add(m[1] ?? "");
    const komponenten = await seite("sxtupo=komponenten&breite=mittel&scheme=light&rev=1");
    for (const m of stiloDe(korpo(komponenten)).matchAll(/var\((--fm-[a-z0-9-]+)/g))
      nomoj.add(m[1] ?? "");
    expect(nomoj.size).toBeGreaterThan(20);
    expect([...nomoj].filter((n) => !definitaj.has(n)).sort()).toEqual([]);
  });
});
