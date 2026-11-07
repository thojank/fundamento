// Facts without a browser: the elements of the markup, no render (never green, D-04).

import { describe, expect, it } from "vitest";
import {
  agentaTeksto,
  ekranaDokumento,
  elementojDe,
  FRAGMENTO_FINO,
  FRAGMENTO_KOMENCO,
  fragmentoEl,
  KADRO_ATRIBUTO,
  KLASIKA_SKRIPTO,
  statikaFakto,
} from "./index.js";

describe("facts without a browser", () => {
  it("reads elements, attributes, parents and own text; skips the document's wrappers", () => {
    const html =
      '<!doctype html><html lang="en"><body><main><!-- c --><fm-karto level="2"><h2 slot="heading">Standard &amp; A-12</h2><br><img src="x.png" alt=""/>Team   Nord</fm-karto><a href=\'detail.html\'>Weiter</a></main><style>.x { color: red }</style></body></html>';
    expect(elementojDe(html)).toEqual({
      lingvo: "en",
      elementoj: [
        { tag: "main", attrs: {}, parent: -1, text: "" },
        { tag: "fm-karto", attrs: { level: "2" }, parent: 0, text: "Team Nord" },
        { tag: "h2", attrs: { slot: "heading" }, parent: 1, text: "Standard & A-12" },
        { tag: "br", attrs: {}, parent: 1, text: "" },
        { tag: "img", attrs: { src: "x.png", alt: "" }, parent: 1, text: "" },
        { tag: "a", attrs: { href: "detail.html" }, parent: 0, text: "Weiter" },
        { tag: "style", attrs: {}, parent: -1, text: ".x { color: red }" },
      ],
    });
  });

  it("has no render, so axe is never checked", () => {
    const fakto = statikaFakto("<main>Team Nord</main>", "de");
    expect(fakto).toMatchObject({ lingvo: "de", bytes: 22, aria: [], console: [], renders: [] });
  });
});

describe("the frame never reaches the facts of a fragment (D-27, D-S038-19-3)", () => {
  const FRAGMENTO =
    '<main><h1>Standard A-12</h1><fm-karto level="2"><h2 slot="heading">Team Nord</h2></fm-karto><fm-ligilo to="detail.html">Weiter</fm-ligilo></main>';

  /** The frame of Spec 037 as it was written before S038-19: a plain link, no font rule. */
  const malnovaKadro = (fragmento: string): string =>
    [
      "<!doctype html>",
      '<html lang="de" data-fm-aspekto="komuna" data-fm-color-scheme="light">',
      "<head>",
      '<meta charset="utf-8">',
      '<link rel="stylesheet" href="../../marko/css/fundamento.css">',
      `<script src="../../marko/${KLASIKA_SKRIPTO}"></script>`,
      "</head>",
      "<body>",
      `<p ${KADRO_ATRIBUTO}><a href="../../superrigardo.html">Zur Übersicht</a></p>`,
      FRAGMENTO_KOMENCO,
      fragmento,
      FRAGMENTO_FINO,
      "</body>",
      "</html>",
      "",
    ].join("\n");

  const novaKadro = (fragmento: string): string =>
    ekranaDokumento({
      titolo: "Liste",
      fragmento,
      varianto: "F",
      lingvo: "de",
      aspekto: "komuna",
      marko: { css: ["css/fundamento.css"], skripto: KLASIKA_SKRIPTO, bazaTiparo: "--fm-provo" },
      radiko: "../../",
    });

  /** The static facts D-27 compares: elements, aria, lingvo, bytes. */
  const faktoj = (html: string) => {
    const { elements, aria, lingvo, bytes } = statikaFakto(fragmentoEl(html) ?? "", "de");
    return { elements, aria, lingvo, bytes, agenta: Buffer.byteLength(agentaTeksto(html)) };
  };

  it("gives the same elements, aria, language and bytes under the old and the new frame", () => {
    const nova = novaKadro(FRAGMENTO);
    // The new frame is really another one (fm-ligilo, a font rule), the fragment the same.
    expect(nova).not.toBe(malnovaKadro(FRAGMENTO));
    expect(nova).toContain('<fm-ligilo to="../../superrigardo.html"');
    expect(nova).toContain("font-family: var(--fm-provo)");
    expect(faktoj(nova)).toEqual(faktoj(malnovaKadro(FRAGMENTO)));
    expect(faktoj(nova).elements.map((e) => e.tag)).toEqual([
      "main",
      "h1",
      "fm-karto",
      "h2",
      "fm-ligilo",
    ]);
  });
});
