// The screen of the assistant (Spec 033 S1) with the findings of Spec 035, Befund 4.5: what a
// model answers is shown safely – Markdown as Eroj built from text, never as HTML (D-02).

import { describe, expect, it } from "vitest";
import { type AsistantoInput, asistantoScreen } from "./ekrano.js";
import type { FacetoStand } from "./stato.js";

const stand = (name: string, nomo: string): FacetoStand => ({
  name,
  nomo,
  stato: "definiert",
  gruen: true,
  probleme: 0,
  pezo: 1,
  freigebbar: true,
  freigabeSatz: "Bereit zur Freigabe.",
});

const inputOf = (overrides: Partial<AsistantoInput> = {}): AsistantoInput => ({
  marko: { name: "lumo", label: "Lumo", rev: 3 },
  faceto: { ...stand("gvidkoloro", "Leitfarbe und Akzente"), kialo: "Die Farbe der Marke." },
  vollstaendigkeit: {
    prozent: 0,
    definiert: 50,
    facetoj: [stand("gvidkoloro", "Leitfarbe und Akzente"), stand("formo", "Form (Radien)")],
    nochNicht: [
      { umfang: 2, nomo: "Sprache und Ton" },
      { umfang: 3, nomo: "Bildwelt, Logo, Illustration, Verhalten und Klang" },
    ],
  },
  historio: [],
  ki: { pret: true, modelo: "mistral/ministral-14b-2512" },
  zaehlilo: "0 Tokens",
  ...overrides,
});

const ANTWORT =
  'Die Dichte steht jetzt auf **1,75**. <img src=x onerror="window.fmXss=1"><script>window.fmXss=2</script>';

describe("Spec 035, Befund 4.5.3 (D-02): the chat shows Markdown safely, never model output as HTML", () => {
  it("an answer of the model is the source of an fm-markdovido, escaped, with no element of its own", () => {
    const html = asistantoScreen(
      inputOf({
        historio: [
          { role: "user", content: "Dichter, bitte." },
          { role: "assistant", content: ANTWORT },
        ],
      }),
    );
    const card = /<fm-karto data-mt-rolle="assistant">[\s\S]*?<\/fm-karto>/.exec(html)?.[0] ?? "";
    expect(card).toContain("<fm-markdovido");
    expect(card).toContain(
      'source="Die Dichte steht jetzt auf **1,75**. &lt;img src=x onerror=&quot;window.fmXss=1&quot;&gt;&lt;script&gt;window.fmXss=2&lt;/script&gt;"',
    );
    expect(html).not.toMatch(/<img src=x/);
    expect(html).not.toContain("<script>window.fmXss");
  });

  it("what the person wrote stays plain text", () => {
    const html = asistantoScreen(
      inputOf({ historio: [{ role: "user", content: "**fett** <b>x</b>" }] }),
    );
    const card = /<fm-karto data-mt-rolle="user">[\s\S]*?<\/fm-karto>/.exec(html)?.[0] ?? "";
    expect(card).toContain("<fm-teksto>**fett** &lt;b&gt;x&lt;/b&gt;</fm-teksto>");
    expect(card).not.toContain("fm-markdovido");
  });
});

// Spec 035, Befund 4.5.1: a proposal showed a theory („die stärkste kräftige Farbe deines Materials
// (18 % …)“). It shows what it means now – the colour as a swatch, a crop of the material, the
// preview before and after on the real Eroj – and says it in one sentence at most.
type Propono = NonNullable<AsistantoInput["propono"]>;
const leitfarbe: Propono = {
  satz: "Leitfarbe #0f766e: die stärkste kräftige Farbe deines Materials (82 % der gefundenen Farbe).",
  herkunft: [{ dosiero: "bildschirm.png", loko: "82 % der Fläche" }],
  agordo: { leitfarbe: "#0f766e" },
};
const sentencesOf = (text: string) =>
  text
    .split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])/)
    .map((part) => part.trim())
    .filter((part) => part !== "").length;
const proposalOf = (html: string) =>
  /<fm-avizo intent="info" data-mt-propono>[\s\S]*?<\/fm-avizo>/.exec(html)?.[0] ?? "";
const textOf = (html: string) =>
  /<fm-teksto data-mt-propono-satz>([\s\S]*?)<\/fm-teksto>/.exec(html)?.[1] ?? "";

describe("Spec 035, Befund 4.5.1: a proposal shows what it means, in one sentence at most", () => {
  it("the lead colour: a swatch of the colour, a crop of the material, one sentence", () => {
    const html = proposalOf(asistantoScreen(inputOf({ propono: leitfarbe })));
    expect(textOf(html)).toBe("Leitfarbe #0f766e.");
    expect(sentencesOf(textOf(html))).toBe(1);
    expect(html).toContain('data-mt-propono-farbe="#0f766e" style="background-color: #0f766e"');
    expect(html).toContain('src="/marko/lumo/materialo/bildschirm.png"');
    expect(html).toContain("data-mt-propono-ausschnitt");
    expect(html).toContain("bildschirm.png, 82 % der Fläche");
  });

  it("the preview shows the step before and with the proposal, side by side", () => {
    const html = asistantoScreen(inputOf({ propono: leitfarbe }));
    expect(html).toContain("iframe data-mt-vorschau data-mt-src");
    expect(html).toMatch(
      /<iframe data-mt-vorschau-propono data-mt-src="\/marko\/lumo\/vorschau\?sxtupo=studio-farbe&amp;breite=mittel&amp;propono=gvidkoloro"/,
    );
    expect(html).toContain("Mit dem Vorschlag");
    expect(asistantoScreen(inputOf())).not.toContain("data-mt-vorschau-propono");
  });

  it("every proposal of the Enportilo and of Weg A is one sentence, and keeps what is not set", () => {
    const saetze = [
      "Neutraltöne mit Tönung 0,02: so farbig sind die hellen Flächen deines Materials (#f4f4f2, #e8e8e4).",
      "Statusfarben aus deinem Material: danger #c0392b, success #2e8b57.",
      "Schriften: Inter, Lora.",
      "Radius 2: der mittlere Radius deines Materials ist 18 px; das liegt jenseits vom Ende des Reglers, vorgeschlagen ist das Ende.",
      "Akzent #17b3a8: die zweite kräftige Farbe deiner Inspiration (25 % der Fläche), deutlich anders als die Leitfarbe #e4572e – noch nicht gesetzt, weil die Marke nur eine Markenpalette hat.",
    ];
    for (const satz of saetze) {
      const html = proposalOf(
        asistantoScreen(inputOf({ propono: { satz, herkunft: [{ dosiero: "marke.svg" }] } })),
      );
      expect(sentencesOf(textOf(html)), satz).toBe(1);
      // An explanation after the value goes; the swatch and the origin show it.
      if (/^\S+ [#\d]/.test(satz)) expect(textOf(html).length, satz).toBeLessThan(satz.length);
    }
    const akzent = proposalOf(
      asistantoScreen(inputOf({ propono: { satz: saetze[4] ?? "", herkunft: [] } })),
    );
    expect(textOf(akzent)).toContain("noch nicht gesetzt");
    expect(akzent).toContain('data-mt-propono-farbe="#17b3a8"');
    const radius = proposalOf(
      asistantoScreen(inputOf({ propono: { satz: saetze[3] ?? "", herkunft: [] } })),
    );
    expect(textOf(radius)).toContain("jenseits vom Ende des Reglers");
  });

  it("a link as origin has no crop; a value that is no colour is no swatch", () => {
    const html = proposalOf(
      asistantoScreen(
        inputOf({
          propono: {
            satz: 'Leitfarbe #12345g": ok.',
            herkunft: [{ dosiero: "https://marke.example/" }],
          },
        }),
      ),
    );
    expect(html).not.toContain("data-mt-propono-ausschnitt");
    expect(html).not.toContain("data-mt-propono-farbe");
  });
});
