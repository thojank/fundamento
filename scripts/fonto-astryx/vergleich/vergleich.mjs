// Spec 029 ①b e): lokaler Vergleich Fundamento (komuna) | Fonto (Astryx 0.7.4, theme-neutral) je
// Ero, hell und dunkel, in Ruhe, Hover, gedrückt, Fokus, deaktiviert und lädt. Baut beide Seiten,
// misst je Teil die CSS-Eigenschaften, die die Ero-Tokens von Fundamento treiben, macht Bilder und
// schreibt messungen.json und die Vergleichsseite nach .fundamento/vergleich/ (nicht veröffentlicht,
// nicht in der Vitrino). Der Code der Fonto läuft nur hier, als devDependency dieses Verzeichnisses.
//
//   node scripts/fonto-astryx/vergleich/vergleich.mjs [--ero butono,kampo] [--ohne-bilder]

import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { eroFaelle, rollout } from "./faelle.mjs";
import { seite } from "./seite.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
const repo = join(here, "../../..");
// VERGLEICH_OUT: ein eigenes Ausgabeverzeichnis (mehrere Läufe nebeneinander).
const out = process.env.VERGLEICH_OUT ?? join(repo, ".fundamento/vergleich");
const args = process.argv.slice(2);
const only = args.includes("--ero") ? args[args.indexOf("--ero") + 1].split(",") : undefined;
const bilder = !args.includes("--ohne-bilder");
// --dom: nur die Struktur beider Seiten je Ero ausgeben (Ruhe, erste Kombination), zum Schreiben der Fälle.
const dom = args.includes("--dom");
const requireEroj = createRequire(join(repo, "packages/eroj/package.json"));
const { chromium } = requireEroj("@playwright/test");

/** Die CSS-Eigenschaften je Teil, die Ero-Tokens treiben: aus den erzeugten Stilen der Eroj. */
export async function teileVon(ero) {
  const file = join(repo, "packages/eroj/dist/generated", `${ero}.styles.js`);
  const mod = await import(file);
  const css = Object.values(mod)
    .filter((value) => typeof value === "string")
    .join("\n");
  const parts = {};
  const vars = {};
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const named = [...selector.matchAll(/part="([a-z-]+)"/g)].map((match) => match[1]);
    const part =
      named.length > 0 ? named[named.length - 1] : selector.includes(":host") ? ":host" : undefined;
    if (part === undefined) continue;
    for (const declaration of body.split(";")) {
      const match = declaration.match(/^\s*([a-z-]+)\s*:(.*)$/s);
      if (match === null || !match[2].includes("var(--fm-ero-")) continue;
      (parts[part] ??= new Set()).add(match[1]);
      for (const [, name] of match[2].matchAll(/var\((--fm-ero-[a-z0-9-]+)/g)) {
        // Geht der Selektor hinter dem Teil weiter (ein Nachfahre, ::slotted), trifft er ein anderes
        // Element als den Teil: nicht gemessen, wie ein Pseudo-Element.
        let after = selector.slice(
          selector.lastIndexOf(`part="${part}"]`) + `part="${part}"]`.length,
        );
        // Ein Attribut hinter dem Teil ([aria-selected], [data-range] …) ist ein anderes Element
        // derselben Art (die gewählte Zelle), nicht der Teil in Ruhe.
        const head = part === ":host" ? "" : (after.match(/^[^\s>+~]*/)?.[0] ?? "");
        // Attribute und Klassen hinter dem Teil ([aria-selected], .fm-danger): Varianten oder andere Elemente.
        const qualifiers = [
          ...[...head.matchAll(/\[([a-z-]+)/g)].map((m) => m[1]),
          ...[...head.replace(/\[[^\]]*\]/g, "").matchAll(/\.([a-z][a-z0-9-]*)/g)].map(
            (m) => `class:${m[1]}`,
          ),
        ];
        for (let i = 0; i < 4; i++)
          after = after.replace(/\([^()]*\)/g, "").replace(/\[[^\]]*\]/g, "");
        const nested =
          part !== ":host" && (/::slotted/.test(after) || /[\s>+~]/.test(after.trim()));
        const pseudo = /::(?!slotted|part)[a-z-]+/.test(selector)
          ? selector.match(/::(?!slotted|part)([a-z-]+)/)[1]
          : nested
            ? "nachfahre"
            : undefined;
        (vars[name] ??= []).push({
          part,
          property: match[1],
          ...(pseudo ? { pseudo } : {}),
          ...(qualifiers.length > 0 ? { qualifiers } : {}),
        });
      }
    }
  }
  return {
    parts: Object.fromEntries(Object.entries(parts).map(([part, set]) => [part, [...set]])),
    vars,
  };
}

const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".json": "application/json",
};

function serve(roots) {
  const server = createServer((request, response) => {
    const path = decodeURIComponent(request.url.split("?")[0]);
    for (const [prefix, dir] of roots) {
      if (!path.startsWith(prefix)) continue;
      const file = join(dir, path.slice(prefix.length) || "index.html");
      if (existsSync(file)) {
        response.writeHead(200, {
          "content-type": TYPES[extname(file)] ?? "application/octet-stream",
        });
        response.end(readFileSync(file));
        return;
      }
    }
    response.writeHead(404);
    response.end();
  });
  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

// ---- im Browser: Messung eines Elements ----
// Farben: roh (berechneter Wert) und sichtbar (Überlagerung, Deckkraft und Untergrund verrechnet).
function measureInPage({ element, properties }) {
  const parse = (text) => {
    if (!text || text === "none" || text === "transparent") return [0, 0, 0, 0];
    const srgb = text.match(/color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.e-]+))?\)/);
    if (srgb)
      return [
        Number(srgb[1]) * 255,
        Number(srgb[2]) * 255,
        Number(srgb[3]) * 255,
        srgb[4] === undefined ? 1 : Number(srgb[4]),
      ];
    const rgb = text.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    if (rgb)
      return [
        Number(rgb[1]),
        Number(rgb[2]),
        Number(rgb[3]),
        rgb[4] === undefined ? 1 : Number(rgb[4]),
      ];
    // Jede andere Farbschreibweise (oklch, oklab, color-mix …) über die Leinwand des Browsers.
    if (!/^(oklch|oklab|lab|lch|hsl|hwb|color)\(/.test(text)) return undefined;
    const canvas = (self.__fmCanvas ??= document
      .createElement("canvas")
      .getContext("2d", { willReadFrequently: true }));
    canvas.clearRect(0, 0, 1, 1);
    canvas.fillStyle = "#000";
    canvas.fillStyle = text;
    canvas.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = canvas.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const over = (top, bottom) => {
    const a = top[3] + bottom[3] * (1 - top[3]);
    if (a === 0) return [0, 0, 0, 0];
    return [0, 1, 2]
      .map((i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a)
      .concat(a);
  };
  const overlays = (style) =>
    [
      ...(style.backgroundImage ?? "").matchAll(
        /(rgba?\([^)]*\)|color\(srgb[^)]*\)|okl(?:ch|ab)\([^)]*\))/g,
      ),
    ]
      .map((m) => parse(m[1]))
      .filter(Boolean);
  const fillOf = (el) => {
    const style = getComputedStyle(el);
    let color = parse(style.backgroundColor) ?? [0, 0, 0, 0];
    const layers = overlays(style);
    if (layers.length > 0) color = over(layers[0], color);
    return color;
  };
  const parentOf = (el) =>
    el.parentElement ?? (el.getRootNode() instanceof ShadowRoot ? el.getRootNode().host : null);
  const underlayOf = (el) => {
    const chain = [];
    for (let node = parentOf(el); node !== null; node = parentOf(node)) chain.push(node);
    let base = [255, 255, 255, 1];
    for (const node of chain.reverse()) base = over(fillOf(node), base);
    return base;
  };
  const opacityOf = (el) => {
    let value = 1;
    for (let node = el; node !== null; node = parentOf(node))
      value *= Number(getComputedStyle(node).opacity);
    return value;
  };
  const style = getComputedStyle(element);
  const ground = underlayOf(element);
  const ownFill = over(fillOf(element), ground);
  const opacity = opacityOf(element);
  const fade = (color) =>
    [0, 1, 2].map((i) => color[i] * opacity + ground[i] * (1 - opacity)).concat(1);
  const hex = (c) =>
    "#" +
    c
      .slice(0, 3)
      .map((v) => Math.round(v).toString(16).padStart(2, "0"))
      .join("");
  const result = {};
  const camel = (name) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const rect = element.getBoundingClientRect();
  for (const property of properties) {
    const raw = style[camel(property)] ?? style.getPropertyValue(property);
    const entry = { roh: raw };
    if (property === "background-color") entry.sichtbar = hex(fade(ownFill));
    else if (/(^|-)color$/.test(property) && parse(raw) !== undefined)
      entry.sichtbar = hex(fade(over(parse(raw), ownFill)));
    if (
      entry.sichtbar === undefined &&
      /(^|-)color$/.test(property) &&
      parse(raw) !== undefined &&
      parse(raw)[3] >= 1
    )
      entry.sichtbar = hex(parse(raw));
    result[property] = entry;
  }
  result["@box"] = {
    roh: `${Math.round(rect.width)}×${Math.round(rect.height)}`,
    hoehe: Math.round(rect.height * 100) / 100,
  };
  result["@opacity"] = { roh: String(opacity) };
  return result;
}

async function main() {
  mkdirSync(out, { recursive: true });
  const definitions = (await eroFaelle()).filter(
    (def) => only === undefined || only.includes(def.ero),
  );
  const cases = rollout(definitions);
  const props = {};
  for (const def of definitions) props[def.ero] = await teileVon(def.ero);

  // Fundamento: Projekcioj von komuna (Standard-Konfiguration) und die gebauten Eroj.
  const fm = join(out, "fm");
  rmSync(fm, { recursive: true, force: true });
  execFileSync(
    process.execPath,
    [join(repo, "packages/cli/dist/index.js"), "projekcioj", "build", "--out", fm],
    { cwd: repo, stdio: "ignore" },
  );
  writeFileSync(
    join(fm, "index.html"),
    `<!doctype html><html lang="de" data-fm-aspekto="komuna" data-fm-motion="reduced"><head><meta charset="utf-8"><link rel="stylesheet" href="/fm/css/fundamento.css"><style>body{margin:0;background:var(--fm-color-background-default)} [data-fall]{display:inline-block;padding:12px;vertical-align:top;position:relative}</style><script type="module">import "/eroj/define.js"; const m=new URLSearchParams(location.search).get("mode"); if(m) document.documentElement.setAttribute("data-fm-color-scheme", m);</script></head><body><div style="padding:16px">${cases
      .map(
        (c) =>
          `<div data-fall="${c.id}"${c.breite ? ` style="min-width:${c.breite}px;min-height:${c.hoehe ?? 0}px"` : ""}>${c.html}</div>`,
      )
      .join("")}</div></body></html>`,
  );

  // Fonto: esbuild bündelt fonto.jsx mit der gepinnten Fonto.
  const fonto = join(out, "fonto");
  mkdirSync(fonto, { recursive: true });
  const { build } = createRequire(join(here, "package.json"))("esbuild");
  await build({
    entryPoints: [join(here, "fonto.jsx")],
    bundle: true,
    format: "esm",
    outfile: join(fonto, "fonto.js"),
    jsx: "automatic",
    nodePaths: [join(here, "node_modules")],
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "error",
  });
  // Das Reset der Fonto gehört zu ihren Stilen (Knöpfe, Überschriften ohne Browser-Standard).
  copyFileSync(
    join(here, "node_modules/@astryxdesign/core/src/reset.css"),
    join(fonto, "reset.css"),
  );
  copyFileSync(
    join(here, "node_modules/@astryxdesign/core/dist/astryx.css"),
    join(fonto, "core.css"),
  );
  copyFileSync(
    join(here, "node_modules/@astryxdesign/theme-neutral/dist/theme.css"),
    join(fonto, "theme.css"),
  );
  writeFileSync(
    join(fonto, "index.html"),
    `<!doctype html><html lang="de"><head><meta charset="utf-8"><link rel="stylesheet" href="/fonto/reset.css"><link rel="stylesheet" href="/fonto/core.css"><link rel="stylesheet" href="/fonto/theme.css"><style>body{margin:0} *,*::before,*::after{transition-duration:0s!important;animation-duration:0s!important;animation-delay:0s!important}</style><script>window.FAELLE=${JSON.stringify(cases.map((c) => ({ id: c.id, fonto: c.fonto, breite: c.breite, hoehe: c.hoehe })))}</script></head><body><div id="root"></div><script type="module" src="/fonto/fonto.js"></script></body></html>`,
  );

  const server = await serve([
    ["/fm/", fm],
    ["/eroj/", join(repo, "packages/eroj/dist")],
    ["/fonto/", fonto],
  ]);
  const origin = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const images = join(out, "bilder");
  if (bilder) {
    if (!args.includes("--merge")) rmSync(images, { recursive: true, force: true });
    mkdirSync(images, { recursive: true });
  }

  if (dom) {
    for (const side of ["fonto", "fm"]) {
      await page.goto(`${origin}/${side}/?mode=light`);
      if (side === "fm")
        await page.waitForFunction(() => customElements.get("fm-butono") !== undefined);
      await page.waitForSelector("[data-fall]");
      await page.waitForTimeout(400);
      const seen = new Set();
      for (const c of cases) {
        if (seen.has(c.ero) || c.state !== "rest") continue;
        seen.add(c.ero);
        const text = await page.locator(`[data-fall="${c.id}"]`).evaluate((el, s) => {
          const clean = (html) =>
            html
              .replace(/ class="[^"]*"/g, "")
              .replace(/ style="[^"]*"/g, "")
              .replace(/ id="[^"]*"/g, "");
          if (s === "fonto") return clean(el.innerHTML);
          const host = el.firstElementChild;
          const parts = [...(host?.shadowRoot?.querySelectorAll("[part]") ?? [])].map(
            (n) => `${n.tagName.toLowerCase()}[part="${n.getAttribute("part")}"]`,
          );
          return `${host?.outerHTML.slice(0, 300)}\n    Teile: ${parts.join(" ")}`;
        }, side);
        console.log(`== ${side} ${c.id}\n    ${text.slice(0, 2500)}`);
      }
    }
    await browser.close();
    server.close();
    if (errors.length > 0)
      console.log(`Fehler der Seiten: ${[...new Set(errors)].slice(0, 5).join(" | ")}`);
    return;
  }
  const messungen = {
    erzeugt: new Date().toISOString(),
    fonto: "astryx 0.7.4 (theme-neutral)",
    teile: props,
    faelle: {},
  };
  for (const side of ["fm", "fonto"]) {
    for (const mode of ["light", "dark"]) {
      await page.goto(`${origin}/${side}/?mode=${mode}`);
      if (side === "fm")
        await page.waitForFunction(() => customElements.get("fm-butono") !== undefined);
      await page.waitForSelector("[data-fall]");
      await page.waitForTimeout(300);
      for (const c of cases) {
        const holder = page.locator(`[data-fall="${c.id}"]`);
        const target =
          side === "fm"
            ? c.ziel.fm
              ? holder.locator(c.ziel.fm).first()
              : holder.locator(":scope > *").first()
            : c.ziel.fonto
              ? holder.locator(c.ziel.fonto).first()
              : holder.locator(":scope > *").first();
        await page.mouse.move(0, 0);
        await page.mouse.up();
        if (c.interago === "hover" || c.interago === "press")
          await target.hover({ force: true }).catch(() => {});
        if (c.interago === "press") await page.mouse.down();
        if (c.interago === "focus") {
          await page.keyboard.press("Shift");
          await target.focus().catch(() => {});
        }
        await page.waitForTimeout(c.interago ? 60 : 0);
        const parts = props[c.ero].parts;
        const measured = {};
        for (const [part, properties] of Object.entries(parts)) {
          // Fonto: ein Selektor je Teil, oder {"": Selektor, Eigenschaft: Selektor} je Eigenschaft.
          const groups = new Map();
          if (side === "fm") groups.set(null, properties);
          else {
            const spec = c.teile[part];
            if (spec === undefined) continue;
            for (const property of properties) {
              const selector = typeof spec === "string" ? spec : (spec[property] ?? spec[""]);
              if (!groups.has(typeof spec === "string" ? spec : spec[""]))
                groups.set(typeof spec === "string" ? spec : spec[""], []);
              if (selector === undefined) continue;
              groups.set(selector, [...(groups.get(selector) ?? []), property]);
            }
          }
          for (const [selector, list] of groups) {
            const handle =
              side === "fm"
                ? await holder.evaluateHandle((el, p) => {
                    const host = el.firstElementChild;
                    if (p === ":host") return host;
                    return host?.shadowRoot?.querySelector(`[part~="${p}"]`) ?? null;
                  }, part)
                : await holder.evaluateHandle(
                    (el, sel) => (sel === "&" ? el.firstElementChild : el.querySelector(sel)),
                    selector,
                  );
            const el = handle?.asElement?.() ?? null;
            if (el === null) continue;
            const values = await page.evaluate(
              ([fn, element, props]) =>
                new Function("arg", `return (${fn})(arg)`)({ element, properties: props }),
              [measureInPage.toString(), el, list],
            );
            // Die Größe des Teils misst der Selektor des Teils (der erste), nicht ein Kind.
            measured[part] = { ...values, ...(measured[part] ?? {}) };
          }
        }
        let bild;
        if (bilder) {
          bild = `${side}-${mode}-${c.id.replaceAll("|", "_")}.png`;
          await holder
            .screenshot({ path: join(images, bild), animations: "disabled" })
            .catch(() => (bild = undefined));
        }
        if (c.interago === "press") await page.mouse.up();
        if (c.interago === "focus") await target.evaluate((el) => el.blur()).catch(() => {});
        const entry = (messungen.faelle[c.id] ??= {
          ero: c.ero,
          kombino: c.kombino,
          state: c.state,
        });
        (entry[side] ??= {})[mode] = { teile: measured, bild };
      }
    }
  }
  await browser.close();
  server.close();
  // --merge: nur die gemessenen Eroj ersetzen, die übrigen der vorhandenen Messung behalten.
  if (args.includes("--merge") && existsSync(join(out, "messungen.json"))) {
    const before = JSON.parse(readFileSync(join(out, "messungen.json"), "utf8"));
    const measured = new Set(definitions.map((def) => def.ero));
    for (const [id, f] of Object.entries(before.faelle))
      if (!measured.has(f.ero)) messungen.faelle[id] = f;
    messungen.teile = { ...before.teile, ...messungen.teile };
  }
  writeFileSync(join(out, "messungen.json"), JSON.stringify(messungen, null, 1));
  writeFileSync(
    join(out, "index.html"),
    seite(messungen, args.includes("--merge") ? await eroFaelle() : definitions),
  );
  if (errors.length > 0)
    console.log(`Fehler der Seiten: ${[...new Set(errors)].slice(0, 5).join(" | ")}`);
  console.log(
    `${cases.length} Fälle, ${definitions.length} Eroj: file://${join(out, "index.html")}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();

export { measureInPage };
