// Spec 033 S2 (Weg B): the Enportilo reads material of an existing brand – screenshots and logos
// (PNG, SVG), style guides (PDF), websites (HTML and their CSS) – and finds colours, font families,
// radii and spacing, each with its provenance (file, place). From the findings it proposes values
// per Faceto, through the fields of the Agordo, inside the ranges of the sliders. Deterministic,
// without a browser and without a language model.

import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { deflateSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { encodePng } from "../test-doubles/png.js";
import { loadBases } from "../vorschau.js";
import { farbojOfPixels } from "./farboj.js";
import { legiPdf } from "./pdf.js";
import { decodePng } from "./png.js";
import { proponojOf } from "./rekono.js";
import { legiRetejon } from "./retejo.js";
import { legiSvg } from "./svg.js";

/** A screenshot: mostly a light grey page, a teal button area, a small red error badge. */
const screenshot = encodePng(40, 30, (x, y) =>
  y < 6 && x < 30
    ? [0x0f, 0x76, 0x6e, 255]
    : y > 26 && x > 34
      ? [0xc8, 0x32, 0x2c, 255]
      : [0xf4, 0xf4, 0xf2, 255],
);

describe("reading material (Spec 033 S2)", () => {
  it("decodes a PNG to its pixels", () => {
    const image = decodePng(screenshot);
    expect([image.width, image.height]).toEqual([40, 30]);
    expect([...image.rgba.slice(0, 4)]).toEqual([0x0f, 0x76, 0x6e, 255]);
  });

  it("finds the dominant colours of the pixels with their share", () => {
    const image = decodePng(screenshot);
    const farboj = farbojOfPixels(image.rgba, "bildschirm.png");
    const hexes = farboj.map((farbo) => farbo.valoro);
    expect(hexes[0]).toBe("#f4f4f2");
    expect(hexes).toContain("#0f766e");
    expect(hexes).toContain("#c8322c");
    expect(farboj[0]?.herkunft).toEqual({
      dosiero: "bildschirm.png",
      loko: expect.stringContaining("%"),
    });
  });

  it("reads the colours of an SVG logo from fill and stroke", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg"><path fill="#0F766E" d="M0 0h10v10z"/><circle style="stroke:#c8322c;fill:none" r="3"/></svg>';
    const trovoj = legiSvg(svg, "logo.svg");
    expect(trovoj.map((trovo) => trovo.valoro)).toEqual(["#0f766e", "#c8322c"]);
    expect(trovoj[0]?.herkunft.loko).toMatch(/^Zeile 1/);
  });

  it("reads the fill colours and the font names of a PDF style guide", () => {
    const content =
      "BT /F1 12 Tf ET 0.059 0.463 0.431 rg 0 0 10 10 re f 0.059 0.463 0.431 rg 1 0 0 RG";
    const stream = deflateSync(Buffer.from(content, "latin1"));
    const pdf = Buffer.concat([
      Buffer.from(
        "%PDF-1.4\n1 0 obj << /Type /Font /BaseFont /ABCDEF+Inter-Bold >> endobj\n2 0 obj << /Length ",
      ),
      Buffer.from(`${stream.length} /Filter /FlateDecode >>\nstream\n`),
      stream,
      Buffer.from("\nendstream\nendobj\n%%EOF\n"),
    ]);
    const trovoj = legiPdf(pdf, "styleguide.pdf");
    const farboj = trovoj.filter((trovo) => trovo.kind === "farbo").map((trovo) => trovo.valoro);
    expect(farboj[0]).toBe("#0f766e");
    expect(farboj).toContain("#ff0000");
    expect(trovoj.find((trovo) => trovo.kind === "tiparo")).toMatchObject({
      valoro: "Inter",
      herkunft: { dosiero: "styleguide.pdf" },
    });
  });

  describe("a website and its CSS", () => {
    let server: Server;
    let base = "";
    beforeAll(async () => {
      server = createServer((request, response) => {
        if (request.url === "/paletro") {
          response
            .writeHead(200, { "content-type": "text/html" })
            .end(
              "<style>:root{--color-action-primary-rest:var(--p-accent);--p-accent:var(--p-violet-700);--p-red-900:#8a0011;--p-red-800:#8a0011;--p-red-700:#8a0011;--p-violet-700:#62419a}.x{color:#8a0011}</style>",
            );
          return;
        }
        if (request.url === "/variabloj") {
          response
            .writeHead(200, { "content-type": "text/html" })
            .end(
              "<style>:root{--brand-radius-medium:6px;--brand-font-family-body:'Inter',sans-serif;--brand-font-family-heading:Fraunces,serif;--brand-font-family-mono:'JetBrains Mono',monospace;--brand-spacing-small:8px;--brand-spacing-large:1rem;--brand-shadow:0 1px 2px #0003}</style>",
            );
          return;
        }
        if (request.url === "/stilo.css") {
          response
            .writeHead(200, { "content-type": "text/css" })
            .end(
              [
                ":root { --brand: #0f766e; }",
                "body { font-family: 'Inter', system-ui, sans-serif; color: #1c1c1c; background: #f4f4f2; }",
                'h1, h2 { font-family: "Fraunces", serif; }',
                ".btn { background: var(--brand); border-radius: 8px; padding: 12px 16px; }",
                ".card { border-radius: 8px; padding: 16px; gap: 16px; }",
                ".badge { border-radius: 9999px; background: #c8322c; }",
              ].join("\n"),
            );
          return;
        }
        response
          .writeHead(200, { "content-type": "text/html" })
          .end(
            '<html><head><link rel="stylesheet" href="/stilo.css"><style>.x{color:#0f766e}</style></head><body></body></html>',
          );
      });
      await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
      base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });
    afterAll(() => server.close());

    // Probe run 29.10. (provo): a style sheet with every palette step; the names say which is the brand's.
    it("a colour named primary, brand, accent or action – through var() chains, used before defined – weighs more", async () => {
      const trovoj = await legiRetejon(`${base}/paletro`);
      const weight = (hex: string) => trovoj.find((trovo) => trovo.valoro === hex)?.pezo ?? 0;
      expect(weight("#62419a")).toBeGreaterThan(weight("#8a0011"));
    });

    // Probe run 29.10. (provo): a brand's CSS keeps radius, families and spacing in custom properties.
    it("reads radius, families and spacing from custom properties by their names", async () => {
      const trovoj = await legiRetejon(`${base}/variabloj`);
      const by = (kind: string) =>
        trovoj.filter((trovo) => trovo.kind === kind).map((trovo) => [trovo.valoro, trovo.rolo]);
      expect(by("radiuso")).toEqual([[6, undefined]]);
      expect(by("tiparo")).toEqual(
        expect.arrayContaining([
          ["Inter", "body"],
          ["Fraunces", "display"],
          ["JetBrains Mono", "code"],
        ]),
      );
      expect(by("spaco").map(([value]) => value)).toEqual([8, 16]);
    });

    it("reads colours, families, radii and spacing with file and line", async () => {
      const trovoj = await legiRetejon(`${base}/`);
      const by = (kind: string) => trovoj.filter((trovo) => trovo.kind === kind);
      expect(by("farbo").map((trovo) => trovo.valoro)).toEqual(
        expect.arrayContaining(["#0f766e", "#c8322c", "#f4f4f2"]),
      );
      expect(by("tiparo").map((trovo) => [trovo.valoro, trovo.rolo])).toEqual(
        expect.arrayContaining([
          ["Inter", "body"],
          ["Fraunces", "display"],
        ]),
      );
      expect(by("radiuso").map((trovo) => trovo.valoro)).toEqual([8, 8]);
      expect(by("spaco").map((trovo) => trovo.valoro)).toEqual(expect.arrayContaining([12, 16]));
      const brand = by("farbo").find((trovo) => trovo.valoro === "#0f766e");
      expect(brand?.herkunft).toMatchObject({ dosiero: `${base}/stilo.css`, loko: "Zeile 1" });
    });
  });
});

describe("proposals per Faceto with provenance (Spec 033 S2)", () => {
  const bases = loadBases();

  it("lead colour, neutrals, a status colour, the families, radius and spacing – each with where it came from", () => {
    const herkunft = (loko: string) => ({ dosiero: "test", loko });
    const proponoj = proponojOf(
      [
        { kind: "farbo", valoro: "#f4f4f2", pezo: 60, herkunft: herkunft("a") },
        { kind: "farbo", valoro: "#0f766e", pezo: 20, herkunft: herkunft("b") },
        { kind: "farbo", valoro: "#c8322c", pezo: 3, herkunft: herkunft("c") },
        { kind: "tiparo", valoro: "Inter", rolo: "body", pezo: 1, herkunft: herkunft("d") },
        { kind: "tiparo", valoro: "Fraunces", rolo: "display", pezo: 1, herkunft: herkunft("e") },
        { kind: "radiuso", valoro: 8, pezo: 1, herkunft: herkunft("f") },
        { kind: "spaco", valoro: 12, pezo: 1, herkunft: herkunft("g") },
      ],
      bases,
    );
    const of = (faceto: string) => proponoj.find((propono) => propono.faceto === faceto);
    expect(of("gvidkoloro")?.agordo).toEqual({ leitfarbe: "#0f766e" });
    expect(of("gvidkoloro")?.herkunft).toEqual([herkunft("b")]);
    expect(of("statoj")?.agordo).toEqual({ zusatzfarben: { danger: "#c8322c" } });
    expect(of("tiparo")?.agordo.schriften?.body?.family).toBe("Inter");
    expect(of("tiparo")?.agordo.schriften?.display?.family).toBe("Fraunces");
    expect(of("formo")?.agordo).toEqual({ form: { radius: 2 } });
    expect(of("spaco")?.agordo).toEqual({ raum: { abstand: 1.5 } });
    expect(of("neutralaj")).toBeDefined();
    for (const propono of proponoj) {
      expect(propono.satz.length, propono.faceto).toBeGreaterThan(10);
      expect(propono.herkunft.length, propono.faceto).toBeGreaterThan(0);
    }
  });

  // Probe run 29.10. (provo): a style sheet full of palette steps made a light tint the lead colour.
  it("the lead colour is a strong colour of middle lightness, not the most frequent light tint", () => {
    const at = { dosiero: "x" };
    const proponoj = proponojOf(
      [
        { kind: "farbo", valoro: "#ded2fd", pezo: 9, herkunft: at },
        { kind: "farbo", valoro: "#f3ecff", pezo: 7, herkunft: at },
        { kind: "farbo", valoro: "#62419a", pezo: 3, herkunft: at },
        { kind: "farbo", valoro: "#1d0f33", pezo: 2, herkunft: at },
      ],
      bases,
    );
    expect(proponoj.find((propono) => propono.faceto === "gvidkoloro")?.agordo).toEqual({
      leitfarbe: "#62419a",
    });
  });

  it("a status colour, too, is the strong step of middle lightness, not a pale tint", () => {
    const at = { dosiero: "x" };
    const proponoj = proponojOf(
      [
        { kind: "farbo", valoro: "#62419a", pezo: 9, herkunft: at },
        { kind: "farbo", valoro: "#ffcabc", pezo: 6, herkunft: at },
        { kind: "farbo", valoro: "#cf3738", pezo: 2, herkunft: at },
      ],
      bases,
    );
    expect(proponoj.find((propono) => propono.faceto === "statoj")?.agordo).toEqual({
      zusatzfarben: { danger: "#cf3738" },
    });
  });

  it("a value outside a slider's range is proposed at its end, and says so", () => {
    const proponoj = proponojOf(
      [{ kind: "radiuso", valoro: 40, pezo: 1, herkunft: { dosiero: "x", loko: "y" } }],
      bases,
    );
    const formo = proponoj.find((propono) => propono.faceto === "formo");
    expect(formo?.agordo.form?.radius).toBe(2);
    expect(formo?.satz).toMatch(/Ende des Reglers/);
  });

  it("a family the catalogue does not have is a licensed font: named, not included", () => {
    const proponoj = proponojOf(
      [
        {
          kind: "tiparo",
          valoro: "Hausschrift Grotesk",
          rolo: "body",
          pezo: 1,
          herkunft: { dosiero: "x" },
        },
      ],
      bases,
    );
    const body = proponoj.find((propono) => propono.faceto === "tiparo")?.agordo.schriften?.body;
    expect(body?.family).toBe("Hausschrift Grotesk");
    expect(body?.redistributable).toBe(false);
  });
});
