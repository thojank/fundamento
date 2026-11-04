// Facts without a browser: the elements of the markup, no render (never green, D-04).

import { describe, expect, it } from "vitest";
import { elementojDe, statikaFakto } from "./index.js";

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
