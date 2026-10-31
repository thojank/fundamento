// Spec 036 Teil 4 (Befunde 4.1, 4.2): the synthetic material of the take-over, invented, with known
// targets. Two screenshots of the invented brand „Sablo“ – a warm light ground with a lighter surface
// and a rust lead colour, and a cool dark ground with a darker surface and a blue lead colour – each
// 70 % ground, 20 % surface, 10 % lead colour; a PDF of the light one whose fills repeat the shares
// (7 : 2 : 1) and whose embedded font is chosen per test; a page with its stylesheet for a link. The
// files in uebernahme/ are the same bytes (a test keeps them equal) for the Messanleitung.

import { readFileSync } from "node:fs";
import { encodePng } from "./png.js";

export interface Grund {
  /** The ground, the surface on it and the lead colour, #rrggbb. */
  grund: string;
  flaeche: string;
  leitfarbe: string;
  /** The target of the step „Neutraltöne“. */
  ziel: { grund: "hell" | "dunkel"; farbton: string; grundAnteil: number; flaecheAnteil: number };
}

export const GRUND_HELL: Grund = {
  grund: "#f3ecdf",
  flaeche: "#fbf8f2",
  leitfarbe: "#b45309",
  ziel: { grund: "hell", farbton: "warm", grundAnteil: 70, flaecheAnteil: 20 },
};

export const GRUND_DUNKEL: Grund = {
  grund: "#1a2230",
  flaeche: "#232c3b",
  leitfarbe: "#3b82f6",
  ziel: { grund: "dunkel", farbton: "kühl", grundAnteil: 70, flaecheAnteil: 20 },
};

const rgb = (hex: string) => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
  255,
];

/** 40 × 30 px: three rows of lead colour (10 %), six rows of surface (20 %), the rest ground. */
export function grundPng(grund: Grund): Buffer {
  return encodePng(40, 30, (_, y) =>
    rgb(y < 3 ? grund.leitfarbe : y < 9 ? grund.flaeche : grund.grund),
  );
}

const fill = (hex: string) =>
  [1, 3, 5]
    .map((start) => (Number.parseInt(hex.slice(start, start + 2), 16) / 255).toFixed(3))
    .join(" ");

/**
 * A one-page PDF of the light ground: the ground filled seven times, the surface twice, the lead
 * colour once, uncompressed; `schrift` is the embedded font (/BaseFont with a subset prefix).
 */
export function grundPdf(schrift: string, grund: Grund = GRUND_HELL): Buffer {
  const rects = [
    ...Array.from({ length: 7 }, () => grund.grund),
    ...Array.from({ length: 2 }, () => grund.flaeche),
    grund.leitfarbe,
  ]
    .map((hex, index) => `${fill(hex)} rg ${index * 10} 0 10 10 re f`)
    .join("\n");
  const content = `${rects}\nBT /F1 12 Tf 20 20 Td (Sablo) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    `<< /Type /Font /Subtype /TrueType /BaseFont /SABLOA+${schrift} >>`,
  ];
  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body, "latin1");
}

/** The page of Sablo for a link: the ground three times, the surface twice, the lead once. */
export const SABLO_HTML =
  '<!doctype html><html lang="de"><head><title>Sablo</title><link rel="stylesheet" href="/stilo.css"></head><body><main><div class="karte"><a class="knopf" href="/">Sablo</a></div></main></body></html>';
export const SABLO_CSS = `body { background: ${GRUND_HELL.grund}; color: #3d3427; font-family: "Helvetica Neue", Arial, sans-serif; }
main { background-color: ${GRUND_HELL.grund}; }
.seite { background: ${GRUND_HELL.grund}; }
.karte { background: ${GRUND_HELL.flaeche}; }
.kasten { background-color: ${GRUND_HELL.flaeche}; }
.knopf { background: ${GRUND_HELL.leitfarbe}; color: #ffffff; }
`;

/**
 * A page of Sablo whose text colour is named more often than its light ground (Spec 036 Teil 4,
 * measured at real brands): the ground of the neutrals is a background, never the colour of text.
 */
export const TEXT_HTML =
  '<!doctype html><html lang="de"><head><title>Sablo</title><link rel="stylesheet" href="/text.css"></head><body><h1>Sablo</h1><p>Brot.</p><div class="karte"><a class="knopf" href="/">Sablo</a></div></body></html>';
export const TEXT_FARBE = "#2b2622";
export const TEXT_CSS = `body { background: ${GRUND_HELL.grund}; color: ${TEXT_FARBE}; }
h1, h2 { color: ${TEXT_FARBE}; }
p { color: ${TEXT_FARBE}; }
a { color: ${TEXT_FARBE}; border-bottom: 1px solid ${TEXT_FARBE}; }
.karte { background-color: ${GRUND_HELL.flaeche}; }
.knopf { background: ${GRUND_HELL.leitfarbe}; color: ${TEXT_FARBE}; }
`;

/** The committed copies for the Messanleitung (uebernahme/). */
export const uebernahmeFixture = (name: string): Buffer =>
  readFileSync(new URL(`./uebernahme/${name}`, import.meta.url));

export const FIXTURES: Readonly<Record<string, () => Buffer>> = {
  "grund-hell.png": () => grundPng(GRUND_HELL),
  "grund-dunkel.png": () => grundPng(GRUND_DUNKEL),
  "sablo.pdf": () => grundPdf("Inter-Regular"),
};
