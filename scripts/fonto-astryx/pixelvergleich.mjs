// Spec 029 ① 1, Pixelvergleich: komuna-0-2 im Build mit allen Marken gegen komuna im Build von main.
// Je Abschnitt der Vitrino, den beide Builds haben (die Eroj, die Sxablonoj, Paletten, Flächen),
// und je Farbschema × Kontrast ein Bildschirmfoto des Abschnitts; der Vergleich zählt im Browser
// die Pixel, die sich unterscheiden. Aufruf (Messanleitung im plan):
//   node scripts/fonto-astryx/pixelvergleich.mjs <vitrino von main> <vitrino des Branches> [Marke main] [Marke Branch]
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(new URL("../../packages/eroj/package.json", import.meta.url));
const { chromium } = require("@playwright/test");

const [mainFile, branchFile, mainBrand = "komuna", branchBrand = "komuna-0-2"] =
  process.argv.slice(2);
const MODES = [
  ["light", "default"],
  ["dark", "default"],
  ["light", "high"],
  ["dark", "high"],
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: "reduce",
});
const open = async (file, brand, scheme, contrast) => {
  const page = await context.newPage();
  await page.goto(
    `${pathToFileURL(file).href}#aspekto=${brand}&color-scheme=${scheme}&contrast=${contrast}`,
  );
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content:
      "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }",
  });
  return page;
};
const ids = async (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("main > section[id^='fm-vitrino-']")].map((s) => s.id),
  );
const SKIP = new Set([
  "fm-vitrino-werkstatt",
  "fm-vitrino-kontrasto",
  "fm-vitrino-regularo",
  "fm-vitrino-kovrado",
  "fm-vitrino-komparo",
  "fm-vitrino-uzo",
]);

const result = { abschnitte: 0, bilder: 0, gleich: 0, anders: [] };
for (const [scheme, contrast] of MODES) {
  const a = await open(mainFile, mainBrand, scheme, contrast);
  const b = await open(branchFile, branchBrand, scheme, contrast);
  const common = (await ids(a)).filter(
    (id) => !SKIP.has(id) && !id.startsWith("fm-vitrino-tokenoj"),
  );
  const theirs = new Set(await ids(b));
  for (const id of common.filter((entry) => theirs.has(entry))) {
    // Each section alone at the top of the page: the branch has sections main does not have (the
    // foundation pages), which would move the rest by fractions of a pixel.
    const alone = (page) =>
      page.evaluate((only) => {
        for (const section of document.querySelectorAll("main > section"))
          section.hidden = section.id !== only;
        window.scrollTo(0, 0);
      }, id);
    await alone(a);
    await alone(b);
    const shotA = await a.locator(`#${id}`).screenshot();
    const shotB = await b.locator(`#${id}`).screenshot();
    result.bilder++;
    if (shotA.equals(shotB)) {
      result.gleich++;
      continue;
    }
    const diff = await b.evaluate(
      async ([x, y]) => {
        const load = (data) =>
          new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.src = `data:image/png;base64,${data}`;
          });
        const [ia, ib] = await Promise.all([load(x), load(y)]);
        if (ia.width !== ib.width || ia.height !== ib.height)
          return { size: [ia.width, ia.height, ib.width, ib.height], pixels: -1 };
        const canvas = (image) => {
          const c = document.createElement("canvas");
          c.width = image.width;
          c.height = image.height;
          const ctx = c.getContext("2d");
          ctx.drawImage(image, 0, 0);
          return ctx.getImageData(0, 0, image.width, image.height).data;
        };
        const da = canvas(ia),
          db = canvas(ib);
        let pixels = 0;
        for (let i = 0; i < da.length; i += 4)
          if (
            da[i] !== db[i] ||
            da[i + 1] !== db[i + 1] ||
            da[i + 2] !== db[i + 2] ||
            da[i + 3] !== db[i + 3]
          )
            pixels++;
        return { pixels, total: da.length / 4 };
      },
      [shotA.toString("base64"), shotB.toString("base64")],
    );
    if (diff.pixels === 0) result.gleich++;
    else result.anders.push({ id, scheme, contrast, ...diff });
  }
  result.abschnitte = Math.max(result.abschnitte, common.length);
  await a.close();
  await b.close();
}
await browser.close();
console.log(JSON.stringify(result, null, 1));
