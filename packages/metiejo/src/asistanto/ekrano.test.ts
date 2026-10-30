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
