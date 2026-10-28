// Spec 029 ①b b) – die Ero-Tokens von komuna nach der Fonto (Astryx 0.7.4, theme-neutral).
//
// Liest die Messungen des lokalen Vergleichs (.fundamento/vergleich/messungen.json, erzeugt von
// vergleich/vergleich.mjs aus den gepinnten Paketen: Overrides je Komponente im Theme und Stile der
// Komponenten in core) und schreibt je Ero-Token, das ein Gegenstück hat, den Wert der Fonto: hell
// und alles ohne Farbe in den Kern (packages/vortaro/sets/core.json – komuna ist die Referenzmarke,
// ihre Werte stehen im Kern; jede andere Marke belegt jedes Token selbst), Farben im Dunkeln nach
// komuna+color-scheme/dark.json. Ausgang ist der Alias, den das Skemo bindet; ein zweiter Lauf
// schreibt dasselbe. Ein Wert wird, wo es geht, ein Alias: zuerst die Rolle, auf die das
// Ero-Token schon zeigt, dann eine andere Rolle oder Stufe von komuna mit genau diesem Wert; sonst
// die nächste Stufe (ΔE2000, „rundita“) bzw. ein eigener Wert in px. Jeder Wert nennt seine Herkunft
// in deveno.json (Datei der Komponente, Element, Eigenschaft, Kombination und Modus). Wo eine Regulo
// gewinnt, steht die Anpassung in anpassoj-eroj.json mit ihrer Jugxo.
//
//   node scripts/fonto-astryx/eroj.mjs   (nach schreiben.mjs und vergleich.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { eroFaelle } from "./vergleich/faelle.mjs";
import { teileVon } from "./vergleich/vergleich.mjs";

const repo = join(fileURLToPath(new URL(".", import.meta.url)), "../..");
const modeloLib = await import(join(repo, "packages/modelo/dist/index.js"));
const { defaultModeloSource, loadModelo, resolveCombination, eroTokenojOf } = modeloLib;
const Color = createRequire(join(repo, "packages/modelo/package.json"))("colorjs.io").default;

const KOMUNA = join(repo, "packages/aspekto-komuna");
const CORE = join(repo, "packages/vortaro/sets/core.json");
const DARK = join(KOMUNA, "sets/aspekto/komuna+color-scheme/dark.json");
const DEVENO = join(KOMUNA, "deveno.json");
const MESSUNGEN = join(repo, ".fundamento/vergleich/messungen.json");
const ANPASSOJ = JSON.parse(readFileSync(new URL("./anpassoj-eroj.json", import.meta.url), "utf8"));

const messungen = JSON.parse(readFileSync(MESSUNGEN, "utf8"));
// Rollen, die komuna nach einer Regulo angepasst hat (J1–J7), je Modus: das Ero-Token folgt ihnen.
const adaptedRoles = { light: new Map(), dark: new Map() };
for (const entry of JSON.parse(readFileSync(DEVENO, "utf8")).valoroj) {
  if (entry.token.startsWith("ero.") || entry.maniero !== "adaptita") continue;
  const mode = entry.aro.includes("color-scheme/dark")
    ? "dark"
    : entry.aro === "core"
      ? "light"
      : undefined;
  if (mode !== undefined) adaptedRoles[mode].set(entry.token, entry.jugxo);
}
const definitions = new Map((await eroFaelle()).map((def) => [def.ero, def]));

// Ausgangslage: der Kern mit den Aliasen des Skemo, das Dunkel-Set ohne Ero-Werte.
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const coreSet = readJson(CORE);
const dark = readJson(DARK);
delete dark.ero;
writeFileSync(DARK, `${JSON.stringify(dark, null, 2)}\n`);

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("Das Modelo lädt nicht.");
const BASE = {
  aspekto: "komuna",
  viewport: "medium",
  density: "default",
  contrast: "default",
  motion: "reduced",
};
const resolved = {
  light: resolveCombination(modelo, { ...BASE, "color-scheme": "light" }).tokens,
  dark: resolveCombination(modelo, { ...BASE, "color-scheme": "dark" }).tokens,
};

// ---- Werte lesen ----
const hexOf = (value) =>
  value && typeof value === "object" && "hex" in value
    ? String(value.hex).toLowerCase()
    : undefined;
const alphaOf = (value) =>
  value && typeof value === "object" && typeof value.alpha === "number" ? value.alpha : 1;
const pxOf = (value) =>
  value && typeof value === "object" && typeof value.value === "number"
    ? value.unit === "rem"
      ? value.value * 16
      : value.value
    : undefined;
const pxText = (text) => {
  if (text === undefined || text === null) return undefined;
  const match = String(text).match(/^(-?[\d.]+)px$/);
  return match === null ? (String(text) === "0" ? 0 : undefined) : Number(match[1]);
};

/** Alle Farb-Tokens von komuna (Rollen zuerst, dann Stufen) mit ihrem Wert je Modus. */
const colorTokens = Object.keys(resolved.light).filter(
  (name) =>
    resolved.light[name]?.type === "color" &&
    !name.startsWith("ero.") &&
    !name.startsWith("sxablono."),
);
const ROLE_ORDER = [
  "color.action.",
  "color.text.",
  "color.border.",
  "color.background.",
  "color.status.",
  "color.focus.",
  "color.",
  "color.palette.neutral.",
  "color.palette.",
];
colorTokens.sort((a, b) => {
  const rank = (name) =>
    ROLE_ORDER.findIndex(
      (prefix) =>
        name.startsWith(prefix) && !(prefix === "color." && name.startsWith("color.palette.")),
    );
  return rank(a) - rank(b) || a.localeCompare(b);
});
const paletteSteps = colorTokens.filter(
  (name) => name.startsWith("color.palette.") && alphaOf(resolved.light[name]?.value) === 1,
);
const opaque = (mode, name) => alphaOf(resolved[mode][name]?.value) === 1;

const deltaE = (a, b) => new Color(a).deltaE2000(new Color(b));

/** Welche Rollen eine Eigenschaft zuerst nimmt, wenn mehrere den Wert haben. */
const PREFER = {
  "background-color": ["color.background.", "color.action.", "color.status."],
  color: ["color.text.", "color.action.", "color.status."],
  "border-color": ["color.border.", "color.status.", "color.focus."],
  "outline-color": ["color.focus.", "color.border."],
};
/** Ein Alias für einen sichtbaren Farbwert in einem Modus: die bisherige Rolle, eine Rolle oder Stufe mit diesem Wert, sonst die nächste Stufe. */
/** Die Reihenfolge für eine Eigenschaft: jede Randfarbe wie border-color, jede Fläche wie background-color. */
const preferOf = (property) =>
  PREFER[property] ??
  (/^border.*color$/.test(property ?? "")
    ? PREFER["border-color"]
    : /^outline.*color$/.test(property ?? "")
      ? PREFER["outline-color"]
      : /background/.test(property ?? "")
        ? PREFER["background-color"]
        : []);
function colorAlias(hex, mode, current, property) {
  if (
    current !== undefined &&
    opaque(mode, current) &&
    hexOf(resolved[mode][current]?.value) === hex
  )
    return { alias: current, maniero: "prenita" };
  // Die Rolle des Skemo bleibt, wenn sie dem Wert der Fonto kaum sichtbar nahe ist (ΔE2000 ≤ 1,5):
  // die Bedeutung bleibt (die inverse Fläche des Tooltips, nicht die gedrückte Aktion, die zufällig
  // Schwarz ist).
  // Nicht für eine Rolle, die nach einer Jugxo absichtlich von der Fonto weggerückt ist (die Fläche
  // nach J1: das Feld der Fonto ist weiß, die Fläche 97,5).
  if (
    current !== undefined &&
    !adaptedRoles[mode].has(current) &&
    opaque(mode, current) &&
    hexOf(resolved[mode][current]?.value) !== undefined &&
    deltaE(hex, hexOf(resolved[mode][current]?.value)) <= 1.5
  ) {
    return {
      alias: current,
      maniero: "rundita",
      noto: `Rolle des Skemo, ΔE2000 ${deltaE(hex, hexOf(resolved[mode][current]?.value)).toFixed(1)}`,
    };
  }
  const prefer = preferOf(property);
  // Rollen der passenden Gruppe, dann die Stufe selbst, erst dann eine fremde Rolle mit zufällig
  // gleichem Wert (die Fläche eines Tooltips ist keine gedrückte Aktion).
  const group =
    current === undefined || current.startsWith("color.palette.")
      ? undefined
      : current.split(".").slice(0, 2).join(".") + ".";
  const rank = (name) => {
    if (group !== undefined && name.startsWith(group)) return 0;
    if (name.startsWith("color.palette.")) return 1;
    const i = prefer.findIndex((prefix) => name.startsWith(prefix));
    return i !== -1 ? 2 + i : 99;
  };
  const exact = colorTokens
    .filter((name) => opaque(mode, name) && hexOf(resolved[mode][name]?.value) === hex)
    .sort((a, b) => rank(a) - rank(b))[0];
  if (exact !== undefined) return { alias: exact, maniero: "prenita" };
  let best;
  for (const name of paletteSteps) {
    const d = deltaE(hex, hexOf(resolved[mode][name]?.value));
    if (best === undefined || d < best.d) best = { name, d };
  }
  // Rollen und Ero-Tokens zeigen auf Stufen (color-semantic-literal, Art. IV): auch ein Ton
  // zwischen den Rampen nimmt die nächste Stufe; deveno.json nennt den Abstand.
  return {
    alias: best.name,
    maniero: "rundita",
    noto: `nächste Stufe ${best.name.replace("color.palette.", "")}, ΔE2000 ${best.d.toFixed(1)}`,
  };
}

/** Ein Farbwert im Format des Vortaro. */
function dtcgColor(hex) {
  const components = [1, 3, 5].map(
    (i) => Math.round((parseInt(hex.slice(i, i + 2), 16) / 255) * 10000) / 10000,
  );
  return { colorSpace: "srgb", components, hex: hex.toLowerCase() };
}
const contrast = (a, b) => {
  const lum = (hex) =>
    [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const [high, low] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

/** Dimension-Tokens von komuna je Familie, für einen Alias auf genau diesen Wert. */
const FAMILIES = {
  "min-block-size": ["size.control.", "size.scale.", "size."],
  "block-size": ["size.control.", "size.scale.", "size."],
  "min-inline-size": ["size.", "spacing."],
  "inline-size": ["size.", "spacing."],
  "padding-inline": ["spacing."],
  "padding-block": ["spacing."],
  padding: ["spacing."],
  gap: ["spacing."],
  "column-gap": ["spacing."],
  "border-radius": ["radius.role.", "radius."],
  "border-width": ["border.width."],
  "outline-width": ["border.width.", "focus."],
  "outline-offset": ["focus.", "spacing."],
};
const dimensionTokens = Object.keys(resolved.light).filter(
  (name) =>
    resolved.light[name]?.type === "dimension" &&
    !name.startsWith("ero.") &&
    !name.startsWith("sxablono."),
);
function dimensionAlias(px, property, current) {
  if (current !== undefined && pxOf(resolved.light[current]?.value) === px)
    return { alias: current, maniero: "prenita" };
  for (const prefix of FAMILIES[property] ?? []) {
    const hit = dimensionTokens.find(
      (name) => name.startsWith(prefix) && pxOf(resolved.light[name]?.value) === px,
    );
    if (hit !== undefined) return { alias: hit, maniero: "prenita" };
  }
  return { wert: { value: px, unit: "px" }, maniero: "prenita" };
}

/** Die Schichten eines berechneten box-shadow, ohne durchsichtige Hilfsschichten der Fonto. */
function shadowLayers(text) {
  if (text === undefined || text === "none") return [];
  return text
    .split(/,(?![^(]*\))/)
    .map((layer) => layer.trim())
    .map((layer) => {
      const color = layer.match(/(rgba?\([^)]*\)|oklch\([^)]*\)|color\([^)]*\))/)?.[1] ?? "";
      const numbers =
        layer
          .replace(color, "")
          .match(/-?[\d.]+px/g)
          ?.map((v) => Number.parseFloat(v)) ?? [];
      let alpha = 1;
      const rgba = color.match(/rgba?\([^,]+,[^,]+,[^,]+(?:,\s*([\d.]+))?\)/);
      if (rgba) alpha = rgba[1] === undefined ? 1 : Number(rgba[1]);
      const ok = color.match(/\/\s*([\d.]+)\)/);
      if (ok) alpha = Number(ok[1]);
      return {
        alpha: Math.round(alpha * 1000) / 1000,
        x: numbers[0] ?? 0,
        y: numbers[1] ?? 0,
        blur: numbers[2] ?? 0,
        spread: numbers[3] ?? 0,
        inset: layer.includes("inset"),
      };
    })
    .filter((layer) => layer.alpha > 0);
}
const shadowRoles = Object.keys(resolved.light).filter(
  (name) => name.startsWith("elevation.shadow.") && resolved.light[name]?.type === "shadow",
);
function shadowAlias(text, mode, current) {
  const want = shadowLayers(text);
  const of = (name) => {
    const value = resolved[mode][name]?.value;
    return (Array.isArray(value) ? value : value ? [value] : [])
      .map((layer) => ({
        alpha: Math.round((layer.color?.alpha ?? 1) * 1000) / 1000,
        x: pxOf(layer.offsetX),
        y: pxOf(layer.offsetY),
        blur: pxOf(layer.blur),
        spread: pxOf(layer.spread),
        inset: layer.inset === true,
      }))
      .filter((layer) => layer.alpha > 0);
  };
  const distance = (name) => {
    const have = of(name);
    if (have.length !== want.length) return 1000 + Math.abs(have.length - want.length);
    return have.reduce(
      (sum, layer, i) =>
        sum +
        Math.abs(layer.y - want[i].y) +
        Math.abs(layer.blur - want[i].blur) +
        Math.abs(layer.spread - want[i].spread) +
        20 * Math.abs(layer.alpha - want[i].alpha) +
        (layer.inset === want[i].inset ? 0 : 50),
      0,
    );
  };
  const candidates = [current, ...shadowRoles].filter(
    (name) => name !== undefined && resolved[mode][name] !== undefined,
  );
  const best = candidates.reduce((a, b) => (distance(b) < distance(a) ? b : a));
  if (want.length === 0)
    return {
      alias: best,
      maniero: distance(best) === 0 ? "prenita" : "rundita",
      noto: "kein Schatten bei der Fonto",
    };
  return {
    alias: best,
    maniero: distance(best) === 0 ? "prenita" : "rundita",
    ...(distance(best) === 0 ? {} : { noto: `nächster Schatten ${best}` }),
  };
}

/** Die Schriftrolle von komuna mit Größe und Gewicht der Fonto (Zeilenhöhe am nächsten). */
const typographyRoles = Object.keys(resolved.light).filter(
  (name) => name.startsWith("typography.") && resolved.light[name]?.type === "typography",
);
function typographyAlias(measured, current) {
  const size = pxText(measured["font-size"]?.roh);
  const weight = Number(measured["font-weight"]?.roh);
  const line = pxText(measured["line-height"]?.roh);
  if (size === undefined) return undefined;
  const of = (name) => {
    const value = resolved.light[name]?.value ?? {};
    const fontSize = pxOf(value.fontSize);
    return {
      fontSize,
      fontWeight: Number(value.fontWeight),
      lineHeight:
        typeof value.lineHeight === "number" && fontSize ? value.lineHeight * fontSize : undefined,
    };
  };
  const fits = (name) => of(name).fontSize === size && of(name).fontWeight === weight;
  if (current !== undefined && fits(current)) return { alias: current, maniero: "prenita" };
  const candidates = typographyRoles
    .filter(fits)
    .sort(
      (a, b) =>
        Math.abs((of(a).lineHeight ?? 0) - (line ?? 0)) -
        Math.abs((of(b).lineHeight ?? 0) - (line ?? 0)),
    );
  if (candidates.length > 0) return { alias: candidates[0], maniero: "prenita" };
  const nearest = typographyRoles
    .filter((name) => of(name).fontSize === size)
    .sort((a, b) => Math.abs(of(a).fontWeight - weight) - Math.abs(of(b).fontWeight - weight))[0];
  return nearest === undefined
    ? undefined
    : {
        alias: nearest,
        maniero: "rundita",
        noto: `Gewicht ${weight} der Fonto, Rolle mit ${of(nearest).fontWeight}`,
      };
}

// ---- Ero-Tokens und ihre Kombination ----
const leaves = (node, path, out) => {
  if (node === null || typeof node !== "object") return out;
  if ("$value" in node) out.push([path.join("."), node.$value]);
  for (const [key, child] of Object.entries(node))
    if (!key.startsWith("$")) leaves(child, [...path, key], out);
  return out;
};
const leafValue = (doc, name) => name.split(".").reduce((node, key) => node?.[key], doc)?.$value;
const currentAlias = (value) =>
  typeof value === "string" && value.startsWith("{") ? value.slice(1, -1) : undefined;
const setAt = (doc, name, value) => {
  const keys = name.split(".");
  let node = doc;
  for (const key of keys.slice(0, -1)) node = node[key] ??= {};
  node[keys.at(-1)] = { $type: resolved.light[name]?.type, $value: value };
};
/** Im Kern nur den Wert setzen: Typ und Id des Tokens bleiben. */
const setCore = (name, value) => {
  const node = name.split(".").reduce((current, key) => current?.[key], coreSet);
  if (node === undefined || !("$value" in node)) throw new Error(`${name} fehlt im Kern`);
  node.$value = value;
};
const mainEro = { set: setCore };
const darkEro = {};
const devenoEntries = [];
const report = { geschrieben: 0, ohneGegenstueck: 0, eroj: {} };

// Jugxoj der Eroj (eine je Grund), mit den Tokens, die sie betreffen.
const JUGXOJ_EROJ = {
  ziel: { id: "jug_01M5ZT2Z2V5GMPZXTDV3BK8PRE" },
  kontrast: { id: "jug_01M5ZS3RD8HWV0EWSCGZAHA30K" },
  rollen: { id: "jug_01M5ZNMRXQEZY8N0FJ7FVQNG7C" },
  rahmen: { id: "jug_01M5ZNJ4SM3XWE76KJ431Y7B3G" },
  lesbar: { id: "jug_01M5ZN8QFKFKBR76C7B320RGJ9" },
  zustaende: { id: "jug_01M5ZMZSNG2G533GB0RY9HVNSG" },
  kontur: { id: "jug_01M5ZN30KJ3DFY1FXD8K3HHEJ6" },
};
const sameHex = (a, b) => a !== undefined && b !== undefined && a.toLowerCase() === b.toLowerCase();
const rawHex = (text) => {
  const m = String(text ?? "").match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (m === null || (m[4] !== undefined && Number(m[4]) < 1)) return undefined;
  return (
    "#" +
    [m[1], m[2], m[3]].map((v) => Math.round(Number(v)).toString(16).padStart(2, "0")).join("")
  );
};

const derived = [];
const skemoAliasOf = new Map(
  modelo.eroj.flatMap((entry) => eroTokenojOf(entry).map((tokeno) => [tokeno.name, tokeno.alias])),
);
const BEHALTEN = ["ero.avizo.accent."];
// Abnahme 28.10. (O-1b-4 entschieden): der Innenabstand des butono wie die Fonto (12 px); ein Knopf
// nur mit Icon ist quadratisch ohne Innenabstand – das zeichnet das Element, nicht das Token.
const uneinheitlich = [];
for (const [ero, def] of definitions) {
  const loaded = modelo.eroj.find((entry) => entry.ero.name === ero);
  if (loaded === undefined) continue;
  const { vars } = await teileVon(ero);
  // Boolesche Attribute der Fälle („checked“ leer) heißen wie die Schlüssel der Ero-Tokens: leer =
  // true; fehlt das Attribut, wo andere Fälle es setzen, false.
  const raw = Object.entries(messungen.faelle).filter(
    ([, f]) => f.ero === ero && f.fonto !== undefined,
  );
  const booleans = new Set(
    raw.flatMap(([, f]) =>
      Object.entries(f.kombino)
        .filter(([, v]) => v === "")
        .map(([k]) => k),
    ),
  );
  const faelle = raw.map(([id, f]) => {
    const kombino = Object.fromEntries(
      Object.entries(f.kombino).map(([k, v]) => [k, v === "" ? "true" : v]),
    );
    for (const key of booleans) kombino[key] ??= "false";
    return [id, { ...f, kombino }];
  });
  if (faelle.length === 0) continue;
  const tokens = eroTokenojOf(loaded);
  for (const tokeno of tokens) setCore(tokeno.name, `{${tokeno.alias}}`);
  report.eroj[ero] = { tokens: tokens.length, geschrieben: 0 };
  const component = Object.keys(def.quelle)[0];
  for (const { name: token, when, alias: skemoAlias } of tokens) {
    const varName = `--fm-ero-${token.slice(4).replaceAll(".", "-")}`;
    const uses = Object.entries(vars)
      .filter(([name]) => name === varName || name.startsWith(`${varName}-`))
      .flatMap(([, list]) => list);
    // Ein Pseudo-Element (::backdrop, ::placeholder) misst der Vergleich nicht: das Token bleibt auf seiner Rolle.
    // Ein Nachfahre zählt, wenn die Fall-Datei für Teil und Eigenschaft einen eigenen Selektor nennt.
    // Ein Attribut hinter dem Teil, das keine Prop des Skemo und kein Zustand ist (aria-selected,
    // data-range, data-today …), meint ein anderes Element derselben Art (die gewählte Zelle).
    const VARIANT_ATTRIBUTES = new Set([
      "aria-disabled",
      "aria-invalid",
      "aria-busy",
      "aria-readonly",
      "data-state",
    ]);
    const props = new Set(loaded.skemo.props.map((prop) => prop.name));
    for (const use of uses) {
      if (
        use.pseudo === undefined &&
        (use.qualifiers ?? []).some(
          (name) =>
            !VARIANT_ATTRIBUTES.has(name) &&
            !(name.startsWith("data-") && props.has(name.slice(5))),
        )
      )
        use.pseudo = "nachfahre";
    }
    const explicit = (use) =>
      use.pseudo === "nachfahre" &&
      typeof def.teile[use.part] === "object" &&
      def.teile[use.part][use.property] !== undefined;
    if (uses.length === 0 || uses.every((use) => use.pseudo !== undefined && !explicit(use)))
      continue;
    uses.sort(
      (a, b) =>
        (a.pseudo === undefined || explicit(a) ? 0 : 1) -
        (b.pseudo === undefined || explicit(b) ? 0 : 1),
    );
    // Teile, die Fundamento nach der Abgleichstabelle (②a, entschieden 24.10.) behält, wo die Fonto
    // keine hat: kein Wert der Fonto (die farbige Kante der avizo, A-avizo-4).
    if (BEHALTEN.some((prefix) => token.startsWith(prefix))) continue;
    // Der Fall der Fonto: jede Achse des Tokens wie im Fall, Zustand gleich (ohne Zustand: Ruhe;
    // der Fokusring nur im Fokus).
    const focusRing = uses.every(
      (use) =>
        use.property.startsWith("outline") ||
        (use.property === "box-shadow" && /focus/.test(token)),
    );
    const state = when.state ?? (focusRing ? "focus" : "rest");
    // Eine Achse, die keiner der Fälle der Fonto führt (die Fonto hat sie nicht): der Wert der Fonto
    // gilt nur für den Standardwert der Achse im Skemo; die anderen Werte bleiben auf ihrer Rolle.
    const caseKeys = new Set(faelle.flatMap(([, f]) => Object.keys(f.kombino)));
    const defaults = Object.fromEntries(
      loaded.skemo.props
        .filter((prop) => prop.default !== undefined)
        .map((prop) => [prop.name, String(prop.default)]),
    );
    // Ein Schlüssel ohne Standard im Skemo (aktiv, gewählt, aktuell eines Eintrags) steht auf „false“.
    if (
      Object.entries(when).some(
        ([k, v]) => k !== "state" && !caseKeys.has(k) && (defaults[k] ?? "false") !== v,
      )
    ) {
      report.ohneGegenstueck++;
      continue;
    }
    const fits = ([, f]) =>
      Object.entries(when).every(
        ([k, v]) => k === "state" || f.kombino[k] === undefined || f.kombino[k] === v,
      ) && Object.entries(f.kombino).every(([k, v]) => when[k] === undefined || when[k] === v);
    // Gezeichnet: gemessen und größer als ein verborgenes Element (1×1, etwa der Sprunglink in Ruhe).
    const drawn = ([, f], p) => {
      const box = f.fonto?.light?.teile?.[p]?.["@box"]?.roh;
      if (box === undefined) return f.fonto?.light?.teile?.[p] !== undefined;
      const [w, h] = box.split("×").map(Number);
      return w > 1 || h > 1;
    };
    // Ohne Zustand: zuerst die Ruhe, sonst der erste Fall, in dem der Teil gezeichnet ist (die
    // Fehlermeldung erscheint nur bei invalid).
    const usePart = uses[0].part;
    const hit =
      faelle.find((f) => fits(f) && f[1].state === state && drawn(f, usePart)) ??
      (when.state === undefined && !focusRing
        ? faelle.find((f) => fits(f) && drawn(f, usePart))
        : undefined) ??
      (when.state === undefined ? faelle.find((f) => fits(f) && drawn(f, usePart)) : undefined) ??
      faelle.find((f) => fits(f) && f[1].state === state);
    if (hit === undefined) {
      report.ohneGegenstueck++;
      continue;
    }
    const [caseId, fall] = hit;
    const { part, property } = uses[0];
    // Der Fokusring der Fonto: nur, wo sie im Fokus eine Outline zeichnet (Felder zeigen Fokus über
    // Rand und inneren Schatten; dort bleibt der Ring von komuna).
    if (
      focusRing &&
      (fall.state !== "focus" ||
        (fall.fonto?.light?.teile?.[part]?.["outline-style"]?.roh ?? "none") === "none")
    ) {
      report.ohneGegenstueck++;
      continue;
    }
    // Ein Token, das eine Achse nicht trennt, über die die Fonto verschiedene Werte zeigt (die
    // Farbe des Titels einer Meldung je Status): kein Wert der Fonto, die Achse fehlt (②b).
    const measure = (f) => {
      const m = f.fonto?.light?.teile?.[part];
      if (m === undefined) return undefined;
      if (property === "min-block-size" || property === "block-size") return m["@box"]?.hoehe;
      return (
        m[property]?.sichtbar ??
        m[property]?.roh ??
        (m["font-size"] ? `${m["font-size"]?.roh}/${m["font-weight"]?.roh}` : undefined)
      );
    };
    const siblings = faelle.filter((f) => fits(f) && f[1].state === fall.state && drawn(f, part));
    if (
      new Set(siblings.map(([, f]) => JSON.stringify(measure(f))).filter((v) => v !== undefined))
        .size > 1
    ) {
      uneinheitlich.push(token);
      continue;
    }
    const selector = def.teile[part];
    if (selector === undefined) continue;
    const type = resolved.light[token]?.type;
    const current = skemoAlias;
    const at = (mode) => fall.fonto?.[mode]?.teile?.[part];
    const kombino = def.kombinoj?.[Number(caseId.split("|")[1])]?.fonto ?? {};
    const sxlosilo = (mode, prop) =>
      `${component} ${JSON.stringify({ ...kombino, ...(def.groessen?.[fall.kombino.size] ?? {}) })} ${state}, ${mode}: ${selector} ${prop} (gemessen)`;
    const entry = {
      ero,
      token,
      when,
      type,
      current,
      component,
      dosiero: def.quelle[component],
      sxlosilo,
      part,
      property,
    };
    if (type === "color") {
      const noBorder = (mode) =>
        property === "border-color" &&
        pxText(at(mode)?.["border-width"]?.roh ?? at(mode)?.["border-top-width"]?.roh) === 0;
      // Deckkraft 0 (ein geschlossenes Popover): nichts gezeichnet, der Rohwert gilt.
      const hidden = (mode) => Number(at(mode)?.["@opacity"]?.roh ?? 1) === 0;
      const read = (mode) => {
        if (noBorder(mode))
          return hidden(mode)
            ? rawHex(at(mode)?.["background-color"]?.roh)
            : at(mode)?.["background-color"]?.sichtbar;
        const m = at(mode)?.[property];
        return hidden(mode) ? (rawHex(m?.roh) ?? m?.sichtbar) : (m?.sichtbar ?? rawHex(m?.roh));
      };
      const composed = (mode) =>
        (!hidden(mode) && noBorder(mode)) ||
        (at(mode)?.[property]?.sichtbar !== undefined &&
          !sameHex(at(mode)?.[property]?.sichtbar, rawHex(at(mode)?.[property]?.roh)));
      entry.modes = {};
      for (const mode of ["light", "dark"]) {
        const hex = read(mode);
        if (hex === undefined) continue;
        // Durchsichtig, ohne Überlagerung und Deckkraft: eine Rolle mit genau diesem Wert (Farbe und
        // Deckkraft, etwa der feine Rand 8 % Schwarz) ist das Gegenstück, nicht die verrechnete Stufe.
        const raw = at(mode)?.[property]?.roh;
        const rgba = String(raw ?? "").match(
          /rgba\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/,
        );
        // Ganz durchsichtig ohne Überlagerung (der ghost-Knopf): eine durchsichtige Rolle, zuerst die des Skemo.
        // hover und gedrückt legt die Fonto eine Überlagerung über die durchsichtige Fläche.
        const overlay = ["hover", "pressed"].includes(fall.state);
        // Hover und gedrückt über einer durchsichtigen Fläche: die Überlagerung selbst, durchsichtig –
        // die Rolle des Skemo trägt sie schon (aus ①, gerundet nach J8).
        if (
          rgba &&
          !noBorder(mode) &&
          overlay &&
          Number(rgba[4]) === 0 &&
          current !== undefined &&
          alphaOf(resolved[mode][current]?.value) < 1 &&
          alphaOf(resolved[mode][current]?.value) > 0
        ) {
          entry.modes[mode] = {
            hex,
            composed: false,
            prop: property,
            fixed: {
              alias: current,
              maniero: "kunmetita-rundita",
              noto: "Überlagerung der Fonto über durchsichtiger Fläche, durchsichtig wie dort; die Rolle trägt sie (①, J8)",
            },
          };
          continue;
        }
        if (rgba && !noBorder(mode) && !overlay && Number(rgba[4]) === 0) {
          const clear = [current, ...colorTokens].find(
            (name) =>
              name !== undefined &&
              !name.startsWith("color.palette.") &&
              resolved[mode][name]?.type === "color" &&
              alphaOf(resolved[mode][name]?.value) === 0,
          );
          if (clear !== undefined) {
            entry.modes[mode] = {
              hex,
              composed: false,
              prop: property,
              fixed: { alias: clear, maniero: "prenita", noto: "durchsichtig wie die Fonto" },
            };
            continue;
          }
        }
        if (
          rgba &&
          !noBorder(mode) &&
          Number(at(mode)?.["@opacity"]?.roh ?? 1) === 1 &&
          Number(rgba[4]) > 0
        ) {
          const target =
            "#" +
            [rgba[1], rgba[2], rgba[3]]
              .map((v) => Math.round(Number(v)).toString(16).padStart(2, "0"))
              .join("");
          const prefer = preferOf(property);
          const rank = (name) => {
            const i = prefer.findIndex((prefix) => name.startsWith(prefix));
            return i === -1 ? 50 : i;
          };
          const role = colorTokens
            .filter(
              (name) =>
                !name.startsWith("color.palette.") &&
                hexOf(resolved[mode][name]?.value) === target &&
                Math.abs(alphaOf(resolved[mode][name]?.value) - Number(rgba[4])) < 0.006,
            )
            .sort((a, b) => rank(a) - rank(b))[0];
          if (role !== undefined) {
            entry.modes[mode] = {
              hex,
              composed: false,
              prop: property,
              want: Number(rgba[4]),
              fixed: {
                alias: role,
                maniero: "prenita",
                noto: `durchsichtig wie die Fonto (${Math.round(Number(rgba[4]) * 100)} %)`,
              },
            };
            continue;
          }
          // Keine Rolle mit genau dieser Deckkraft, aber die Rolle des Skemo ist dieselbe Farbe
          // durchsichtig (die Überlagerung der Zustände, nach J8 auf shade/tint gerundet): sie bleibt.
          if (
            current !== undefined &&
            hexOf(resolved[mode][current]?.value) === target &&
            alphaOf(resolved[mode][current]?.value) < 1
          ) {
            entry.modes[mode] = {
              hex,
              composed: false,
              prop: property,
              want: Number(rgba[4]),
              fixed: {
                alias: current,
                maniero: "rundita",
                noto: `durchsichtig wie die Fonto (${Math.round(Number(rgba[4]) * 100)} %), Deckkraft der Rolle ${Math.round(alphaOf(resolved[mode][current]?.value) * 100)} % (J8)`,
              },
            };
            continue;
          }
          // Abnahme 28.10.: keine Rolle trägt die Farbe durchsichtig – die nächste durchsichtige Stufe
          // der Palette (shade, tint) derselben Farbe. Verrechnet mit dem Weiß der Vergleichsseite
          // wäre die Fläche deckend und gliche auf einer grauen Seite der Seite (secondary der
          // Fonto: Schwarz 6 % über dem, worauf der Knopf steht).
          const step = colorTokens
            .filter(
              (name) =>
                name.startsWith("color.palette.") &&
                hexOf(resolved[mode][name]?.value) === target &&
                alphaOf(resolved[mode][name]?.value) > 0 &&
                alphaOf(resolved[mode][name]?.value) < 1,
            )
            .sort(
              (a, b) =>
                Math.abs(alphaOf(resolved[mode][a]?.value) - Number(rgba[4])) -
                Math.abs(alphaOf(resolved[mode][b]?.value) - Number(rgba[4])),
            )[0];
          if (step !== undefined) {
            const exact = Math.abs(alphaOf(resolved[mode][step]?.value) - Number(rgba[4])) < 0.006;
            entry.modes[mode] = {
              hex,
              composed: false,
              prop: property,
              want: Number(rgba[4]),
              fixed: {
                alias: step,
                maniero: exact ? "prenita" : "rundita",
                noto: `durchsichtig wie die Fonto (${Math.round(Number(rgba[4]) * 100)} %)${exact ? "" : `, nächste Stufe der Palette ${Math.round(alphaOf(resolved[mode][step]?.value) * 100)} %`}`,
              },
            };
            continue;
          }
        }
        entry.modes[mode] = {
          hex,
          composed: composed(mode),
          prop: noBorder(mode) ? "border-width 0 → background-color" : property,
          why: noBorder(mode)
            ? "kein Rand bei der Fonto: Randfarbe = Fläche des Elements"
            : "sichtbarer Wert: Überlagerung, Deckkraft und Untergrund verrechnet",
        };
      }
      if (entry.modes.light === undefined) continue;
    } else if (type === "dimension") {
      const m = at("light");
      const first = (text) =>
        text === undefined ? undefined : String(text).trim().split(/\s+/)[0];
      const px =
        property === "min-block-size" || property === "block-size"
          ? m?.["@box"]?.hoehe
          : pxText(first(m?.[property]?.roh));
      if (px === undefined || Number.isNaN(px)) continue;
      // Ein Teil, der nicht gezeichnet ist (geschlossenes Popover, 0×0), hat keine Höhe der Fonto.
      if (
        (property === "min-block-size" ||
          property === "block-size" ||
          property === "inline-size" ||
          property === "min-inline-size") &&
        /^0×|×0$/.test(m?.["@box"]?.roh ?? "")
      )
        continue;
      entry.px = px;
      entry.prop = property === "min-block-size" ? "Höhe des Elements" : property;
      entry.property = property;
    } else if (type === "typography") {
      const m = at("light");
      if (m === undefined || m["font-size"] === undefined) continue;
      entry.typo = m;
    } else if (type === "shadow") {
      entry.shadow = { light: at("light")?.[property]?.roh, dark: at("dark")?.[property]?.roh };
      if (entry.shadow.light === undefined) continue;
    } else {
      continue;
    }
    derived.push(entry);
  }
}

// Ableitung je Modus; danach die Regel „ein Zustand fällt nicht mit Ruhe zusammen“.
const byName = new Map(derived.map((entry) => [entry.token, entry]));
for (const entry of derived) {
  if (entry.type !== "color") continue;
  for (const mode of ["light", "dark"]) {
    const m = entry.modes[mode];
    if (m === undefined) continue;
    const base = mode === "dark" ? (entry.modes.light?.how?.alias ?? entry.current) : entry.current;
    let how =
      ANPASSOJ[entry.token]?.[mode] ??
      m.fixed ??
      colorAlias(
        m.hex,
        mode,
        base,
        entry.property === "border-color" && m.prop.startsWith("border-width 0")
          ? "background-color"
          : entry.property,
      );
    // Die nächste Stufe hat den Wert der bisherigen Rolle: die Rolle bleibt.
    if (
      how.maniero === "rundita" &&
      base !== undefined &&
      sameHex(hexOf(resolved[mode][base]?.value), hexOf(resolved[mode][how.alias]?.value))
    )
      how = { ...how, alias: base };
    if (how.jugxo === undefined && m.composed) {
      how = {
        ...how,
        maniero: how.maniero === "rundita" ? "kunmetita-rundita" : "kunmetita",
        noto: how.noto ? `${m.why}; ${how.noto}` : m.why,
      };
    }
    m.how = how;
  }
}
// Eine Deckkraft je Paint (Parität, Art. X, wie J4): durchsichtig nur, wenn beide Modi durchsichtig
// sind; sonst nimmt auch der durchsichtige Modus den verrechneten, deckenden Wert.
for (const entry of derived) {
  if (entry.type !== "color") continue;
  const fixed = ["light", "dark"].filter((mode) => entry.modes[mode]?.fixed !== undefined);
  if (fixed.length !== 1 || entry.modes.light === undefined || entry.modes.dark === undefined)
    continue;
  const mode = fixed[0];
  const m = entry.modes[mode];
  const how = colorAlias(
    m.hex,
    mode,
    mode === "dark" ? (entry.modes.light?.how?.alias ?? entry.current) : entry.current,
    entry.property,
  );
  m.how = {
    ...how,
    maniero: how.maniero === "rundita" ? "kunmetita-rundita" : "kunmetita",
    noto: `eine Deckkraft je Paint (Parität): verrechnet wie der andere Modus${how.noto ? `; ${how.noto}` : ""}`,
  };
  delete m.fixed;
}
// Beide Modi durchsichtig, aber verschieden deckend (secondary der Fonto: hell Schwarz 6 %, dunkel
// Weiß 10 %): Figma kennt eine Deckkraft je Paint (parity-alpha-varies-by-mode). Die gemeinsame
// Deckkraft, die beiden Werten der Fonto am nächsten liegt (die größere Abweichung zählt); je Modus
// eine Rolle mit genau dieser Deckkraft und Farbe, sonst die Stufe der Palette (Abnahme 28.10.).
const translucentWith = (mode, hex, alpha) =>
  colorTokens.filter(
    (name) =>
      hexOf(resolved[mode][name]?.value) === hex &&
      alphaOf(resolved[mode][name]?.value) > 0 &&
      alphaOf(resolved[mode][name]?.value) < 1 &&
      (alpha === undefined || Math.abs(alphaOf(resolved[mode][name]?.value) - alpha) < 0.006),
  );
for (const entry of derived) {
  if (entry.type !== "color") continue;
  const [light, dark] = [entry.modes.light, entry.modes.dark];
  if (light?.want === undefined || dark?.want === undefined) continue;
  if (light.how?.jugxo !== undefined || dark.how?.jugxo !== undefined) continue;
  const alphaNow = (m, mode) => alphaOf(resolved[mode][m.how.alias]?.value);
  if (Math.abs(alphaNow(light, "light") - alphaNow(dark, "dark")) < 0.006) continue;
  const hexes = {
    light: hexOf(resolved.light[light.how.alias]?.value),
    dark: hexOf(resolved.dark[dark.how.alias]?.value),
  };
  const alphas = (mode) =>
    translucentWith(mode, hexes[mode]).map((name) => alphaOf(resolved[mode][name]?.value));
  const common = alphas("light").filter((a) => alphas("dark").some((b) => Math.abs(a - b) < 0.006));
  const best = common.sort(
    (a, b) =>
      Math.max(Math.abs(a - light.want), Math.abs(a - dark.want)) -
        Math.max(Math.abs(b - light.want), Math.abs(b - dark.want)) || a - b,
  )[0];
  if (best === undefined) continue;
  for (const [mode, m] of [
    ["light", light],
    ["dark", dark],
  ]) {
    const prefer = preferOf(entry.property);
    const rank = (name) => {
      if (name.startsWith("color.palette.")) return 100;
      const i = prefer.findIndex((prefix) => name.startsWith(prefix));
      return i === -1 ? 50 : i;
    };
    const alias = translucentWith(mode, hexes[mode], best).sort((a, b) => rank(a) - rank(b))[0];
    if (alias === undefined) continue;
    const exact = Math.abs(best - m.want) < 0.006;
    m.how = {
      alias,
      maniero: exact ? "prenita" : "rundita",
      noto: `durchsichtig wie die Fonto (${Math.round(m.want * 100)} %); eine Deckkraft je Paint (Parität): ${Math.round(best * 100)} % in beiden Modi`,
    };
  }
}
const restOf = (entry) => {
  if (entry.when.state === undefined || entry.when.state === "rest") return undefined;
  const name = entry.token.replace(new RegExp(`\\.${entry.when.state}$`), ".rest");
  return byName.get(name);
};
const zustaende = [];
const kontur = [];
const lesbar = [];
for (const entry of derived) {
  if (entry.type !== "color" || !["hover", "pressed"].includes(entry.when.state)) continue;
  const rest = restOf(entry);
  for (const mode of ["light", "dark"]) {
    const m = entry.modes[mode];
    const r = rest?.modes?.[mode];
    if (m?.how === undefined || r?.how === undefined || entry.current === undefined) continue;
    const value = (how) => hexOf(resolved[mode][how.alias]?.value);
    if (!sameHex(m.hex, r.hex) && sameHex(value(m.how), value(r.how))) {
      // Die Fonto unterscheidet den Zustand (Überlagerung von 5 bzw. 10 %), gerundet fiele er auf
      // die Ruhe: die Rolle des Zustands bleibt (dort hat state-distinct schon gewonnen, J5).
      m.how = {
        alias: entry.current,
        maniero: "adaptita",
        jugxo: JUGXOJ_EROJ.zustaende.id,
        kialo:
          "Gerundet fiele der Zustand auf die Ruhe; die Rolle des Zustands bleibt (state-distinct).",
      };
      zustaende.push(`${entry.token}${mode === "dark" ? " (dunkel)" : ""}`);
    }
  }
}

// Die Rolle des Tokens ist nach einer Regulo angepasst (J1–J7) und die Fonto zeigt dort ihren
// ursprünglichen Wert: das Token folgt der angepassten Rolle, statt eine andere Rolle mit dem
// Wert der Fonto zu nehmen (die Regel gewinnt auch hier).
const rollen = [];
const FLAECHEN_JUGXOJ = new Set([
  "jug_01M5N89C1TWQ57VAQD0V6V4KR7",
  "jug_01M5N89C1WQ308F9302JTZRVZE",
]);
for (const entry of derived) {
  if (entry.type !== "color" || entry.current === undefined) continue;
  for (const mode of ["light", "dark"]) {
    const m = entry.modes[mode];
    const roleJugxo = adaptedRoles[mode].get(entry.current);
    // J1 und J2 ordnen die Flächen-Rollen untereinander (surface-distinct, surface-order); ein Feld
    // oder eine Karte auf einer Fläche bindet das nicht: es nimmt die Fläche der Fonto.
    if (FLAECHEN_JUGXOJ.has(roleJugxo)) continue;
    if (
      m?.how === undefined ||
      roleJugxo === undefined ||
      m.how.jugxo !== undefined ||
      m.how.alias === entry.current
    )
      continue;
    if (deltaE(m.hex, hexOf(resolved[mode][entry.current]?.value)) > 6) continue;
    m.how = {
      alias: entry.current,
      maniero: "adaptita",
      jugxo: JUGXOJ_EROJ.rollen.id,
      kialo: `Die Rolle ${entry.current} ist nach einer Regulo angepasst (Jugxo ${roleJugxo}); das Ero-Token folgt ihr.`,
    };
    rollen.push(`${entry.token}${mode === "dark" ? " (dunkel)" : ""}`);
  }
}

// Kein Rand bei der Fonto: die Randfarbe folgt der Fläche desselben Teils, auch nach der Regel oben.
for (const entry of derived) {
  if (entry.type !== "color" || entry.property !== "border-color") continue;
  const fill = derived.find(
    (other) =>
      other.ero === entry.ero &&
      other.part === entry.part &&
      other.property === "background-color" &&
      JSON.stringify(other.when) === JSON.stringify(entry.when),
  );
  for (const mode of ["light", "dark"]) {
    const m = entry.modes[mode];
    const f = fill?.modes?.[mode];
    if (m === undefined || f?.how === undefined || !m.prop.startsWith("border-width 0")) continue;
    m.how = {
      ...f.how,
      noto:
        f.how.jugxo === undefined
          ? `${m.why}${f.how.noto ? `; ${f.how.noto.replace(/^sichtbarer Wert[^;]*;? ?/, "")}` : ""}`.replace(
              /; $/,
              "",
            )
          : f.how.noto,
    };
    m.hex = f.hex;
  }
}

// Deaktiviert bleibt der Text lesbar (Spec 029 ①b c), Abnahme 27.10.): mindestens 3:1 zur Fläche
// desselben Teils. Wo die Fonto darunter liegt, rückt die Schrift weiter von der Fläche weg, auf
// der Rampe ihres Tons (gleiche Familie, nächste Stufe mit 3:1).
const valueHex = (how, mode) => how.wert?.hex ?? hexOf(resolved[mode][how.alias]?.value);
for (const entry of derived) {
  if (entry.type !== "color" || entry.property !== "color" || entry.when.state !== "disabled")
    continue;
  const fill = derived.find(
    (other) =>
      other.ero === entry.ero &&
      other.part === entry.part &&
      other.property === "background-color" &&
      JSON.stringify(other.when) === JSON.stringify(entry.when),
  );
  for (const mode of ["light", "dark"]) {
    const m = entry.modes[mode];
    const f = fill?.modes?.[mode];
    if (m?.how === undefined || f?.how === undefined) continue;
    const ground = valueHex(f.how, mode);
    const text = valueHex(m.how, mode);
    if (ground === undefined || text === undefined || contrast(text, ground) >= 3) continue;
    const family = paletteSteps.filter((name) => {
      const own = new Color(text).to("oklch");
      const step = new Color(hexOf(resolved[mode][name]?.value)).to("oklch");
      return Number.isNaN(own.coords[2]) || own.coords[1] < 0.03
        ? step.coords[1] < 0.03
        : Math.abs(((step.coords[2] - own.coords[2] + 540) % 360) - 180) < 30 &&
            step.coords[1] >= 0.03;
    });
    const candidates = family
      .map((name) => ({ name, hex: hexOf(resolved[mode][name]?.value) }))
      .filter((step) => contrast(step.hex, ground) >= 3)
      .sort((a, b) => deltaE(a.hex, text) - deltaE(b.hex, text));
    if (candidates.length === 0) continue;
    m.how = {
      alias: candidates[0].name,
      maniero: "adaptita",
      jugxo: JUGXOJ_EROJ.lesbar.id,
      kialo: `Die Fonto zeigt den deaktivierten Text mit ${contrast(m.hex, f.hex).toFixed(2)}:1 zu seiner Fläche, auf Stufen gerundet ${contrast(text, ground).toFixed(2)}:1; lesbar heißt bei Fundamento mindestens 3:1 zur Fläche: Stufe ${candidates[0].name.replace("color.palette.", "")} (${contrast(candidates[0].hex, ground).toFixed(2)}:1).`,
    };
    lesbar.push(`${entry.token}${mode === "dark" ? " (dunkel)" : ""}`);
  }
}

// Schrift auf der Fläche desselben Teils (außer deaktiviert): mindestens 4,5:1, für komuna mit der
// Reserve des Aspiro wcag2-reserve (4,95:1). Wo die Fonto darunter liegt (die Füllung eines
// Abzeichens, auf eine Stufe gerundet), rückt die Fläche auf die nächste Stufe ihres Tons, die das
// hält – wie J6 bei den Status-Füllungen (Regel gewinnt; Jugxo der Kontraste).
const huesOf = (hex) => new Color(hex).to("oklch").coords;
const familyOf = (hex, mode) => {
  const [, c, h] = huesOf(hex);
  return paletteSteps.filter((name) => {
    const [, sc, sh] = huesOf(hexOf(resolved[mode][name]?.value));
    return Number.isNaN(h) || c < 0.03
      ? sc < 0.03
      : sc >= 0.03 && Math.abs(((sh - h + 540) % 360) - 180) < 30;
  });
};
for (const entry of derived) {
  if (entry.type !== "color" || entry.property !== "color" || entry.when.state === "disabled")
    continue;
  const fill = derived.find(
    (other) =>
      other.ero === entry.ero &&
      other.part === entry.part &&
      other.property === "background-color" &&
      JSON.stringify(other.when) === JSON.stringify(entry.when),
  );
  if (fill === undefined) continue;
  for (const mode of ["light", "dark"]) {
    const t = entry.modes[mode];
    const f = fill.modes[mode];
    if (t?.how === undefined || f?.how === undefined || f.how.jugxo !== undefined) continue;
    const text = valueHex(t.how, mode);
    const ground = valueHex(f.how, mode);
    if (
      text === undefined ||
      ground === undefined ||
      alphaOf(resolved[mode][f.how.alias]?.value) < 1
    )
      continue;
    if (contrast(text, ground) >= 4.95) continue;
    const better = familyOf(ground, mode)
      .map((name) => ({ name, hex: hexOf(resolved[mode][name]?.value) }))
      .filter((step) => contrast(text, step.hex) >= 4.95)
      .sort((a, b) => deltaE(a.hex, ground) - deltaE(b.hex, ground))[0];
    if (better === undefined) continue;
    f.how = {
      alias: better.name,
      maniero: "adaptita",
      jugxo: JUGXOJ_EROJ.kontrast.id,
      kialo: `Schrift auf der Fläche der Fonto hätte ${contrast(text, ground).toFixed(2)}:1; komuna verlangt 4,5:1 mit Reserve (4,95:1): die Fläche nimmt Stufe ${better.name.replace("color.palette.", "")} (${contrast(text, better.hex).toFixed(2)}:1).`,
    };
  }
}

// Kontraste ohne Text, die die gerenderte Prüfung verlangt (check:alirebleco-eroj, WCAG 1.4.11,
// 3:1): der Griff auf der Spur des sxaltilo, die Kontur eines insigno gegen die Seite, die Kante
// der avizo auf ihrer Fläche, die Füllung des mezurilo auf seiner Spur. Hält ein Paar mit den Werten
// der Fonto nicht, geht zuerst die Vorderseite auf ihre Rolle zurück, dann auch die Hinterseite.
const PAGE = "color.background.default";
const NICHT_TEXT = [
  {
    vorne: /^ero\.sxaltilo\.indicator\.fill\.(.+)$/,
    hinten: (rest) => `ero.sxaltilo.surface.fill.${rest}`,
  },
  { vorne: /^ero\.sxaltilo\.border\.color\.(checked\.false\.(?!disabled).+)$/, hinten: () => PAGE },
  { vorne: /^ero\.insigno\.border\.color\.(.+)$/, hinten: () => PAGE },
  {
    vorne: /^ero\.avizo\.accent\.color\.(.+)$/,
    hinten: (rest) => `ero.avizo.surface.fill.${rest}`,
  },
  { vorne: /^ero\.mezurilo\.fill\.color\.(.+)$/, hinten: () => "ero.mezurilo.track.fill" },
];
const tokenValue = (name, mode) => {
  if (!name.startsWith("ero.")) return hexOf(resolved[mode][name]?.value);
  const entry = derived.find((other) => other.token === name);
  const how = entry?.modes?.[mode]?.how ?? (mode === "dark" ? entry?.modes?.light?.how : undefined);
  if (how !== undefined) return valueHex(how, mode);
  const alias = skemoAliasOf.get(name);
  return alias === undefined ? undefined : hexOf(resolved[mode][alias]?.value);
};
const toRole = (name, mode, why) => {
  const entry = derived.find((other) => other.token === name);
  if (entry?.modes?.[mode] === undefined || entry.current === undefined) return false;
  entry.modes[mode].how = {
    alias: entry.current,
    maniero: "adaptita",
    jugxo: JUGXOJ_EROJ.rahmen.id,
    kialo: why,
  };
  return true;
};
for (const paar of NICHT_TEXT) {
  for (const name of [...skemoAliasOf.keys()].filter((token) => paar.vorne.test(token))) {
    const back = paar.hinten(name.match(paar.vorne)[1]);
    for (const mode of ["light", "dark"]) {
      const ratio = () =>
        contrast(tokenValue(name, mode) ?? "#000000", tokenValue(back, mode) ?? "#ffffff");
      if (ratio() >= 3) continue;
      const before = ratio().toFixed(2);
      const why = `Kontrast ohne Text ${before}:1 (${name.split(".").slice(1, 3).join(".")} auf ${back}); ein Bedienelement braucht 3:1 (WCAG 1.4.11): die Rolle bleibt.`;
      toRole(name, mode, why);
      if (ratio() < 3 && back.startsWith("ero.")) toRole(back, mode, why);
    }
  }
}

// Ränder, deren Rolle eine KontrastParo mit 3:1 trägt (Feld, Status): die Regel gewinnt, wo die
// Fonto heller zeichnet (WCAG 1.4.11, Aspiro wcag2-reserve von komuna: 3,3:1), außer deaktiviert.
const rahmen = [];
const BORDER_ROLES = /^color\.(border\.(default|strong|inverse)|status\.[a-z]+\.border)$/;
for (const entry of derived) {
  if (
    entry.type !== "color" ||
    entry.property !== "border-color" ||
    entry.when.state === "disabled" ||
    entry.current === undefined ||
    !BORDER_ROLES.test(entry.current)
  )
    continue;
  const fill = derived.find(
    (other) =>
      other.ero === entry.ero &&
      other.part === entry.part &&
      other.property === "background-color" &&
      JSON.stringify(other.when) === JSON.stringify(entry.when),
  );
  for (const mode of ["light", "dark"]) {
    const m = entry.modes[mode];
    if (m?.how === undefined || m.prop.startsWith("border-width 0")) continue;
    const ground =
      fill?.modes?.[mode]?.how === undefined
        ? hexOf(resolved[mode]["color.background.default"]?.value)
        : valueHex(fill.modes[mode].how, mode);
    const value = valueHex(m.how, mode);
    if (ground === undefined || value === undefined || contrast(value, ground) >= 3.3) continue;
    m.how = {
      alias: entry.current,
      maniero: "adaptita",
      jugxo: JUGXOJ_EROJ.rahmen.id,
      kialo: `Der Rand der Fonto hat ${contrast(m.hex, ground).toFixed(2)}:1 zur Fläche; ein Rand, der ein Bedienelement erkennbar macht, braucht 3:1 (WCAG 1.4.11), für komuna mit Reserve: die Rolle ${entry.current} bleibt.`,
    };
    rahmen.push(`${entry.token}${mode === "dark" ? " (dunkel)" : ""}`);
  }
}

// Schreiben: hell (und alles ohne Farbe) in komuna, Farben im Dunkeln nur, wo der helle Alias dort
// nicht den Wert der Fonto trifft.
for (const entry of derived) {
  const push = (aro, value, measured, mode, prop, how) =>
    devenoEntries.push({
      token: entry.token,
      aro,
      fonto: "astryx",
      dosiero: entry.dosiero,
      sxlosilo: entry.sxlosilo(mode, prop),
      fontoValoro: String(measured),
      valoro: typeof value === "string" ? value : JSON.stringify(value),
      maniero: how.maniero,
      ...(how.noto ? { noto: how.noto } : {}),
      ...(how.jugxo ? { jugxo: how.jugxo, kialo: how.kialo } : {}),
    });
  if (entry.type === "color") {
    for (const mode of ["light", "dark"]) {
      const own = ANPASSOJ[entry.token]?.[mode];
      if (own !== undefined && entry.modes[mode] !== undefined) entry.modes[mode].how = own;
    }
    const light = entry.modes.light;
    const lightValue = light.how.wert ?? `{${light.how.alias}}`;
    setCore(entry.token, lightValue);
    push("core", lightValue, light.hex, "hell", light.prop, light.how);
    const d = entry.modes.dark;
    if (d?.how !== undefined && light.how.alias !== undefined) {
      const lightAliasDark = hexOf(resolved.dark[light.how.alias]?.value);
      const darkTarget = hexOf(resolved.dark[d.how.alias]?.value);
      if (
        d.how.wert !== undefined ||
        (d.how.alias !== light.how.alias && !sameHex(lightAliasDark, darkTarget)) ||
        (d.how.jugxo === JUGXOJ_EROJ.kontrast.id && d.how.alias !== light.how.alias)
      ) {
        const darkValue = d.how.wert ?? `{${d.how.alias}}`;
        setAt(darkEro, entry.token, darkValue);
        push("aspekto/komuna+color-scheme/dark", darkValue, d.hex, "dunkel", d.prop, d.how);
      }
    }
  } else if (entry.type === "dimension") {
    let how =
      ANPASSOJ[entry.token]?.light ?? dimensionAlias(entry.px, entry.property, entry.current);
    // Kein Rand bei der Fonto: die Breite bleibt (Kontur in erzwungenen Farben), die Farbe ist die Fläche.
    if (
      entry.property === "border-width" &&
      entry.px === 0 &&
      entry.current !== undefined &&
      (pxOf(resolved.light[entry.current]?.value) ?? 0) > 0
    ) {
      how = {
        alias: entry.current,
        maniero: "adaptita",
        jugxo: JUGXOJ_EROJ.kontur.id,
        kialo:
          "Die Fonto zeichnet keinen Rand; die Breite bleibt, die Farbe ist die Fläche: unsichtbar, in erzwungenen Farben eine Kontur.",
      };
      kontur.push(entry.token);
    }
    // Mindest-Zielgröße (touch-target-min, WCAG 2.5.8): eine Größe, die das Skemo auf 24 px oder mehr
    // bindet, geht nicht unter die Rolle, auch wenn die Fonto kleiner zeichnet.
    const SIZE = new Set(["min-inline-size", "min-block-size", "inline-size", "block-size"]);
    const roleSize = pxOf(resolved.light[entry.current]?.value);
    const targetMin = pxOf(resolved.light["size.target.min"]?.value) ?? 24;
    if (
      how.jugxo === undefined &&
      SIZE.has(entry.property) &&
      roleSize !== undefined &&
      roleSize >= targetMin &&
      entry.px < targetMin
    ) {
      how = {
        alias: "size.target.min",
        maniero: "adaptita",
        jugxo: JUGXOJ_EROJ.ziel.id,
        kialo: `Die Fonto zeichnet ${entry.px} px; ein Ziel für den Zeiger braucht ${targetMin} px (touch-target-min, WCAG 2.5.8): size.target.min.`,
      };
    }
    const v = how.wert ?? `{${how.alias}}`;
    setCore(entry.token, v);
    push("core", v, `${entry.px}px`, "hell", entry.prop, how);
  } else if (entry.type === "shadow") {
    const how =
      ANPASSOJ[entry.token]?.light ?? shadowAlias(entry.shadow.light, "light", entry.current);
    setCore(entry.token, `{${how.alias}}`);
    push("core", `{${how.alias}}`, entry.shadow.light, "hell", "box-shadow", how);
    if (entry.shadow.dark !== undefined) {
      const darkHow =
        ANPASSOJ[entry.token]?.dark ?? shadowAlias(entry.shadow.dark, "dark", how.alias);
      if (darkHow.alias !== how.alias) {
        setAt(darkEro, entry.token, `{${darkHow.alias}}`);
        push(
          "aspekto/komuna+color-scheme/dark",
          `{${darkHow.alias}}`,
          entry.shadow.dark,
          "dunkel",
          "box-shadow",
          darkHow,
        );
      }
    }
  } else if (entry.type === "typography") {
    const how = ANPASSOJ[entry.token]?.light ?? typographyAlias(entry.typo, entry.current);
    if (how === undefined) continue;
    const v = how.wert ?? `{${how.alias}}`;
    setCore(entry.token, v);
    const m = entry.typo;
    push(
      "core",
      v,
      `${m["font-size"]?.roh} ${m["font-weight"]?.roh} / ${m["line-height"]?.roh}`,
      "hell",
      "font-size, font-weight, line-height",
      how,
    );
  }
  report.geschrieben++;
  report.eroj[entry.ero].geschrieben++;
}
report.zustaende = zustaende.length;
report.lesbar = lesbar.length;
report.rahmen = rahmen.length;
report.rollen = rollen.length;
report.uneinheitlich = uneinheitlich;

// Die Jugxoj der Eroj in jugxoj.json von komuna (ersetzt, mit den betroffenen Tokens).
const JUGXOJ = join(KOMUNA, "jugxoj.json");
const jugxoj = readJson(JUGXOJ);
const eigene = [
  {
    id: JUGXOJ_EROJ.zustaende.id,
    ref: { regulo: "reg_01M2X5G6TX43QJ21SFD4WFNM3W" },
    aspekto: "komuna",
    decision: "deviation-recorded",
    kialo:
      "Die Fonto zeigt hover und gedrückt der Eroj mit 5 % und 10 % Überlagerung. Auf die Stufen von Fundamento gerundet fällt ein solcher Zustand auf die Ruhe; state-distinct verlangt 0,05 Abstand in der Helligkeit. Wo das geschieht, bleibt das Ero-Token auf der Rolle des Zustands, die nach J5 schon weit genug von der Ruhe liegt.",
    date: "2026-10-27",
    context: `Spec 029 ①b (Fonto astryx, theme-neutral 0.7.4, Ero-Tokens nach den Stilen der Komponenten in core, gemessen im lokalen Vergleich): Herkunft je Wert in packages/aspekto-komuna/deveno.json. Betroffen: ${zustaende.join("; ")}.`,
  },
  {
    id: JUGXOJ_EROJ.kontur.id,
    ref: { artikolo: "X" },
    aspekto: "komuna",
    decision: "deviation-recorded",
    kialo:
      "Die Fonto zeichnet bei Knöpfen und ähnlichen Eroj keinen Rand. In erzwungenen Farben (Windows-Kontrast) ersetzt der Browser Flächen durch die Systemfarbe; ohne Rand verliert das Element dort seine Kontur (Alirebleco, Art. X). Die Randbreite bleibt deshalb, die Randfarbe ist die Fläche des Elements: sonst unsichtbar wie bei der Fonto, in erzwungenen Farben eine Kontur.",
    date: "2026-10-27",
    context: `Spec 029 ①b (Fonto astryx, theme-neutral 0.7.4): Herkunft je Wert in packages/aspekto-komuna/deveno.json. Betroffen: ${kontur.join("; ")}.`,
  },
  {
    id: JUGXOJ_EROJ.lesbar.id,
    ref: { artikolo: "X" },
    aspekto: "komuna",
    decision: "deviation-recorded",
    kialo:
      "Die Fonto zeichnet „deaktiviert“ als die eigene Variante mit halber Deckkraft; bei einigen Varianten (destructive) hat der Text dann weniger als 3:1 zu seiner Fläche. Abnahme ① des Maintainers (27.10.): der Text eines deaktivierten Elements bleibt sichtbar, blass, aber lesbar (Alirebleco, Art. X). Für Fundamento heißt lesbar mindestens 3:1 zur Fläche; die Schrift nimmt die nächste Stufe ihres Tons, die das hält.",
    date: "2026-10-27",
    context: `Spec 029 ①b c) (Fonto astryx, theme-neutral 0.7.4): Herkunft je Wert in packages/aspekto-komuna/deveno.json. Betroffen: ${lesbar.join("; ")}.`,
  },
  {
    id: JUGXOJ_EROJ.rahmen.id,
    ref: { artikolo: "X" },
    aspekto: "komuna",
    decision: "deviation-recorded",
    kialo:
      "Die Fonto zeichnet die Ränder von Feldern und Status-Rändern hell (Feldrand 85, 1,3:1 zur Fläche). Ein Rand, der ein Bedienelement oder seinen Zustand erkennbar macht, braucht nach WCAG 1.4.11 3:1, für komuna mit 10 % Reserve (Aspiro wcag2-reserve). Briefing ①b (27.10.): Feldränder bleiben mindestens 3:1, auch wenn die Fonto heller ist. Das Ero-Token bleibt auf seiner Rolle, die diese KontrastParo trägt (J4).",
    date: "2026-10-27",
    context: `Spec 029 ①b (Fonto astryx, theme-neutral 0.7.4): Herkunft je Wert in packages/aspekto-komuna/deveno.json. Betroffen: ${rahmen.join("; ")}.`,
  },
  {
    id: JUGXOJ_EROJ.ziel.id,
    ref: { regulo: "reg_01M2XMV80DG7JCJDTZGE66MGHZ" },
    aspekto: "komuna",
    decision: "deviation-recorded",
    kialo:
      "Die Fonto lässt Knöpfe und Griffe kleiner als 24 px werden (min-width 0, kleine Griffe und Sprunglinks). touch-target-min verlangt für jedes Ziel des Zeigers mindestens size.target.min (WCAG 2.5.8): wo das Skemo eine Größe auf 24 px oder mehr bindet, bleibt die Rolle.",
    date: "2026-10-27",
    context:
      "Spec 029 ①b (Fonto astryx, theme-neutral 0.7.4): Herkunft je Wert in packages/aspekto-komuna/deveno.json. Betroffen: .",
  },
  {
    id: JUGXOJ_EROJ.kontrast.id,
    ref: { artikolo: "X" },
    aspekto: "komuna",
    decision: "deviation-recorded",
    kialo:
      "Nach der Übernahme der Werte der Fonto fiel eine KontrastParo der Eroj unter ihre Schwelle (WCAG 2.x, im hohen Kontrast 7:1): die Fläche des Paars in diesem Modus bleibt auf der Rolle, an die das Skemo sie bindet und die die Prüfung hält (die Regel gewinnt, Art. V, Fonto 5). Gefunden von check:alirebleco im Lauf von eroj.mjs.",
    date: "2026-10-27",
    context: `Spec 029 ①b (Fonto astryx, theme-neutral 0.7.4): Herkunft je Wert in packages/aspekto-komuna/deveno.json. Betroffen: ${Object.entries(
      ANPASSOJ,
    )
      .flatMap(([token, modes]) =>
        Object.entries(modes)
          .filter(([, how]) => how.jugxo === JUGXOJ_EROJ.kontrast.id)
          .map(([mode]) => `${token}${mode === "dark" ? " (dunkel)" : ""}`),
      )
      .join("; ")}.`,
  },
  {
    id: JUGXOJ_EROJ.rollen.id,
    ref: { artikolo: "V" },
    aspekto: "komuna",
    decision: "deviation-recorded",
    kialo:
      "Ein Ero-Token zeigt auf eine Rolle von komuna, die nach einer Regulo von der Fonto abweicht (J1–J7: Flächen, Text im Dunkeln, Ränder, Zustände, Status). Die Fonto zeigt in der Komponente ihren ursprünglichen Wert. Die Regel gewinnt auch hier (Art. V, Fonto 5): das Ero-Token folgt der angepassten Rolle, statt eine andere Rolle zu nehmen, die zufällig den Wert der Fonto hat.",
    date: "2026-10-27",
    context: `Spec 029 ①b (Fonto astryx, theme-neutral 0.7.4): Herkunft je Wert in packages/aspekto-komuna/deveno.json. Betroffen: ${rollen.join("; ")}.`,
  },
].map((jugxo) =>
  jugxo.context.endsWith("Betroffen: .")
    ? {
        ...jugxo,
        context: jugxo.context.replace(
          "Betroffen: .",
          "Betroffen: in diesem Lauf keine Ero-Tokens.",
        ),
      }
    : jugxo,
);
// „Betroffen“ aus den endgültigen Herkunftsangaben: je Jugxo die Tokens, die sie am Ende tragen.
const betroffen = (id) =>
  devenoEntries
    .filter((entry) => entry.jugxo === id)
    .map((entry) => `${entry.token}${entry.aro.includes("color-scheme/dark") ? " (dunkel)" : ""}`)
    .join("; ") || "in diesem Lauf keine Ero-Tokens";
for (const jugxo of eigene)
  jugxo.context = jugxo.context.replace(/Betroffen: .*$/s, `Betroffen: ${betroffen(jugxo.id)}.`);
const ownIds = new Set(Object.values(JUGXOJ_EROJ).map((jugxo) => jugxo.id));
jugxoj.jugxoj = [...jugxoj.jugxoj.filter((jugxo) => !ownIds.has(jugxo.id)), ...eigene];
writeFileSync(JUGXOJ, `${JSON.stringify(jugxoj, null, 2)}\n`);

if (darkEro.ero !== undefined) dark.ero = darkEro.ero;
writeFileSync(CORE, `${JSON.stringify(coreSet, null, 2)}\n`);
writeFileSync(DARK, `${JSON.stringify(dark, null, 2)}\n`);
const deveno = readJson(DEVENO);
deveno.valoroj = [
  ...deveno.valoroj.filter((entry) => !entry.token.startsWith("ero.")),
  ...devenoEntries,
];
writeFileSync(DEVENO, `${JSON.stringify(deveno, null, 2)}\n`);
console.log(JSON.stringify(report, null, 1));
