// Spec 029 ① – die Farben von komuna nach der Fonto astryx (theme-neutral 0.7.4): Paletten aus den
// Rampen der Fonto auf die Stufen von Fundamento, jede Rolle aus dem Token der Fonto, mit Herkunft.
// Liest nur Daten der Fonto (die Paletten als JSON aus neutralPalettes.generated.ts), führt keinen
// Code der Fonto aus. Wird von schreiben.mjs geladen.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const [repo, fontoDir] = process.argv.slice(2);
const require = createRequire(`${repo}/packages/modelo/package.json`);
const Color = require("colorjs.io").default;
const _EXT = "com.ciferecigo.fundamento";
const FONTO = "astryx";
const F_PAL = "packages/themes/neutral/src/neutralPalettes.generated.ts";
const F_THEME = "packages/themes/neutral/src/neutralTheme.ts";
const F_CORE = "packages/core/src/theme/tokens.stylex.ts";

// ---------- Fonto lesen (nur Daten) ----------
const palTs = readFileSync(`${fontoDir}/neutral/package/src/neutralPalettes.generated.ts`, "utf8");
const palJson = palTs.slice(palTs.indexOf("export const palette = ") + 23);
const PAL = JSON.parse(palJson.slice(0, palJson.indexOf("\n} as const") + 2));
// Die inverse Fläche steht nicht in theme-neutral, sondern im Kern der Fonto (light-dark(hell,
// dunkel)); der Wert wird dort gelesen, nicht hier zitiert (#113 O-6).
const coreTs = readFileSync(`${fontoDir}/core/package/src/theme/tokens.stylex.ts`, "utf8");
const lightDark = (key) => {
  const found = new RegExp(`'${key}': 'light-dark\\((#[0-9A-Fa-f]{6}), (#[0-9A-Fa-f]{6})\\)'`).exec(
    coreTs,
  );
  if (found === null) throw new Error(`${key} fehlt in ${F_CORE}`);
  return [found[1], found[2]];
};

// ---------- Farbmathematik ----------
const hex2 = (n) =>
  Math.round(Math.min(1, Math.max(0, n)) * 255)
    .toString(16)
    .padStart(2, "0");
function parse(text) {
  // '#rrggbb' oder '#rrggbbaa'
  const t = text.trim();
  if (/^#[0-9a-fA-F]{8}$/.test(t)) {
    return {
      r: parseInt(t.slice(1, 3), 16) / 255,
      g: parseInt(t.slice(3, 5), 16) / 255,
      b: parseInt(t.slice(5, 7), 16) / 255,
      a: parseInt(t.slice(7, 9), 16) / 255,
    };
  }
  const c = new Color(t).to("srgb");
  return { r: c.coords[0], g: c.coords[1], b: c.coords[2], a: c.alpha ?? 1 };
}
const hexOf = (c) => `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`;
const over = (top, bottom) => {
  const a = top.a + bottom.a * (1 - top.a);
  const mix = (t, b) => (t * top.a + b * bottom.a * (1 - top.a)) / a;
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a };
};
const withAlpha = (c, a) => ({ ...c, a });
const mixSrgb = (a, b, wb) => ({
  r: a.r * (1 - wb) + b.r * wb,
  g: a.g * (1 - wb) + b.g * wb,
  b: a.b * (1 - wb) + b.b * wb,
  a: 1,
});
const toColor = (c) => new Color("srgb", [c.r, c.g, c.b]);
const dE = (a, b) => toColor(a).deltaE(toColor(b), "2000");
const _L = (c) => toColor(c).to("oklch").coords[0];
function oklabMid(a, b) {
  const x = toColor(a).to("oklab").coords,
    y = toColor(b).to("oklab").coords;
  const m = new Color("oklab", [(x[0] + y[0]) / 2, (x[1] + y[1]) / 2, (x[2] + y[2]) / 2]).to(
    "srgb",
  );
  return { r: m.coords[0], g: m.coords[1], b: m.coords[2], a: 1 };
}
const round4 = (n) => Math.round(n * 10000) / 10000;
function inGamut(c) {
  const g = toColor(c).toGamut({ space: "srgb", method: "css" });
  return {
    r: Math.min(1, Math.max(0, g.coords[0])),
    g: Math.min(1, Math.max(0, g.coords[1])),
    b: Math.min(1, Math.max(0, g.coords[2])),
    a: 1,
  };
}
function oklabExtrapolate(from, to, t) {
  const x = toColor(from).to("oklab").coords,
    y = toColor(to).to("oklab").coords;
  const m = new Color("oklab", [
    y[0] + (y[0] - x[0]) * t,
    y[1] + (y[1] - x[1]) * t,
    y[2] + (y[2] - x[2]) * t,
  ]).to("srgb");
  return { r: m.coords[0], g: m.coords[1], b: m.coords[2], a: 1 };
}
const dtcg = (c) => {
  const v = {
    colorSpace: "srgb",
    components: [c.r, c.g, c.b].map((n) => Math.min(1, Math.max(0, round4(n)))),
  };
  if (c.a < 1) v.alpha = round4(c.a);
  v.hex = hexOf(c);
  return v;
};

// ---------- Fonto-Referenzen (wie in neutralTheme.ts) ----------
const FAM = { N: "neutral", R: "red", Y: "yellow", G: "green", B: "blue" };
const ref = (f, ramp, stop, alpha) => ({ kind: "ref", fam: FAM[f], ramp, stop, alpha });
const lit = (hex) => ({ kind: "lit", hex });
const T = {
  "--color-background-surface": [ref("N", "light", 100), ref("N", "dark", 15)],
  "--color-background-body": [ref("N", "light", 95), ref("N", "dark", 10)],
  "--color-background-card": [ref("N", "light", 100), ref("N", "dark", 10)],
  "--color-background-muted": [ref("N", "light", 95), ref("N", "dark", 10)],
  "--color-background-inverted": lightDark("--color-background-inverted").map(lit),
  "--color-accent": [ref("N", "light", 10), ref("N", "dark", 95)],
  "--color-accent-muted": [ref("N", "light", 95), ref("N", "dark", 15)],
  "--color-neutral": [ref("N", "light", 0, 0x0f), ref("N", "dark", 100, 0x1a)],
  "--color-overlay": [ref("N", "light", 0, 0x80), ref("N", "dark", 0, 0xcc)],
  "--color-overlay-hover": [ref("N", "light", 0, 0x0d), ref("N", "dark", 100, 0x0d)],
  "--color-overlay-pressed": [ref("N", "light", 0, 0x1a), ref("N", "dark", 100, 0x1a)],
  "--color-text-primary": [ref("N", "light", 0), ref("N", "dark", 100)],
  "--color-text-secondary": [ref("N", "light", 30), ref("N", "dark", 65)],
  "--color-text-disabled": [ref("N", "light", 60), ref("N", "dark", 35)],
  "--color-text-accent": [ref("N", "light", 10), ref("N", "dark", 95)],
  "--color-on-accent": [ref("N", "light", 100), ref("N", "dark", 5)],
  "--color-on-success": [ref("N", "light", 100), ref("N", "dark", 5)],
  "--color-on-error": [ref("N", "light", 100), ref("N", "dark", 5)],
  "--color-on-warning": [ref("N", "light", 5), ref("N", "light", 5)],
  "--color-icon-secondary": [ref("N", "light", 45), ref("N", "dark", 65)],
  "--color-success": [ref("G", "light", 25), ref("G", "light", 80)],
  "--color-error": [ref("R", "light", 25), ref("R", "dark", 85)],
  "--color-warning": [ref("Y", "light", 25), ref("Y", "light", 85)],
  "--color-success-muted": [ref("G", "dark", 85), ref("G", "light", 75, 0x3d)],
  "--color-error-muted": [ref("R", "light", 85), ref("R", "dark", 75, 0x3d)],
  "--color-warning-muted": [ref("Y", "dark", 90), ref("Y", "light", 75, 0x3d)],
  "--color-border": [ref("N", "light", 0, 0x14), ref("N", "dark", 100, 0x1a)],
  "--color-border-emphasized": [ref("N", "light", 85), ref("N", "dark", 35)],
  "--color-shadow": [ref("N", "light", 0, 0x1a), ref("N", "dark", 0, 0x4d)],
  "--color-background-red": [ref("R", "light", 85), ref("R", "dark", 25)],
  "--color-border-red": [ref("R", "light", 80), ref("R", "light", 65)],
  "--color-text-red": [ref("R", "light", 25), ref("R", "dark", 80)],
  "--color-background-yellow": [ref("Y", "dark", 90), ref("Y", "dark", 25)],
  "--color-border-yellow": [ref("Y", "dark", 80), ref("Y", "light", 65)],
  "--color-text-yellow": [ref("Y", "light", 25), ref("Y", "light", 80)],
  "--color-background-green": [ref("G", "dark", 85), ref("G", "dark", 25)],
  "--color-border-green": [ref("G", "dark", 80), ref("G", "light", 65)],
  "--color-text-green": [ref("G", "light", 25), ref("G", "light", 75)],
  "--color-background-blue": [ref("B", "light", 85), ref("B", "dark", 25)],
  "--color-border-blue": [ref("B", "light", 80), ref("B", "dark", 65)],
  "--color-text-blue": [ref("B", "light", 25), ref("B", "dark", 80)],
  // lokale Tokens des Themes (statusFill, Destruktiv-Overlay, Info-Muted)
  "--astryx-theme-neutral-color-status-fill-accent": [lit("#0074e2"), lit("#6d9cfe")],
  "--astryx-theme-neutral-color-status-fill-success": [lit("#198100"), lit("#64af4c")],
  "--astryx-theme-neutral-color-status-fill-warning": [lit("#ffce2f"), lit("#ffce2f")],
  "--astryx-theme-neutral-color-status-fill-error": [lit("#c9303a"), lit("#ff705d")],
  "--astryx-theme-neutral-color-status-muted-accent": [
    ref("B", "light", 85),
    ref("B", "dark", 75, 0x3d),
  ],
  "--astryx-theme-neutral-color-destructive-overlay-hover": [
    ref("R", "light", 70, 0x0d),
    ref("R", "dark", 65, 0x0d),
  ],
  "--astryx-theme-neutral-color-destructive-overlay-pressed": [
    ref("R", "light", 70, 0x1a),
    ref("R", "dark", 65, 0x1a),
  ],
};
const LOCAL = (k) => k.startsWith("--astryx-theme-neutral-");
const fileOf = (key) => (key === "--color-background-inverted" ? F_CORE : F_THEME);
const MODES = ["light", "dark"];
const fontoColor = (key, mode) => {
  const r = T[key][mode === "light" ? 0 : 1];
  if (r.kind === "lit") return { ...parse(r.hex) };
  const c = parse(PAL[r.fam][r.ramp][String(r.stop)]);
  return r.alpha === undefined ? c : withAlpha(c, r.alpha / 255);
};
const describe = (key, mode) => {
  const r = T[key][mode === "light" ? 0 : 1];
  const where =
    r.kind === "lit"
      ? r.hex
      : `${r.fam}.${r.ramp}[${r.stop}]${r.alpha === undefined ? "" : ` + ${r.alpha.toString(16).toUpperCase().padStart(2, "0")}`}`;
  return `${key} (${mode}: ${where})`;
};

// ---------- Rollen: Fundamento-Token ← Fonto ----------
// Quelle: {key} ein Fonto-Token; {over: [oben, unten]} Überlagerung wie in der Fonto (Button,
// Link, Navigation); {fade: [key, anteil, unter]} Deckkraft (Button disabled 0.5);
// {mixTint: key} Link-Hover (color-mix 15 % mit tint-hover).
const k = (key) => ({ key });
const ROLES = {
  "color.background.canvas": { src: k("--color-background-body"), where: "Seite (body)" },
  "color.background.default": { src: k("--color-background-surface"), where: "Fläche (surface)" },
  "color.background.raised": { src: k("--color-background-card"), where: "Karte (card)" },
  "color.background.sunken": {
    src: k("--color-background-muted"),
    where: "vertiefte Fläche (muted)",
  },
  "color.background.inverse": {
    src: k("--color-background-inverted"),
    where: "inverse Fläche (core)",
  },
  "color.text.default": { src: k("--color-text-primary") },
  "color.text.subtle": { src: k("--color-text-secondary") },
  "color.text.muted": {
    src: k("--color-icon-secondary"),
    where: "drittes Textgewicht: icon-secondary",
  },
  "color.text.inverse": { src: k("--color-on-accent") },
  "color.text.disabled": { src: k("--color-text-disabled") },
  "color.link.rest": { src: k("--color-text-accent"), where: "Link.tsx: text-accent" },
  "color.link.hover": {
    src: { mixTint: "--color-text-accent" },
    where: "Link.tsx: color-mix(text-accent, tint-hover 15 %)",
  },
  "color.link.visited": {
    src: k("--color-text-accent"),
    where: "Link.tsx: kein eigener Wert für besuchte Links",
  },
  "color.border.default": {
    src: k("--color-border-emphasized"),
    where: "Feldrahmen (inputStyles)",
  },
  "color.border.subtle": { src: k("--color-border") },
  "color.border.strong": {
    src: k("--color-accent"),
    where: "Feldrahmen mit Fokus (inputStyles :focus-within)",
  },
  "color.border.inverse": {
    src: { swap: "--color-border-emphasized" },
    where: "border-emphasized des anderen Modus",
  },
  "color.border.disabled": {
    src: k("--color-border-emphasized"),
    where: "Feldrahmen deaktiviert (inputStyles)",
  },
  "color.action.primary.rest": { src: k("--color-accent"), where: "Button primary" },
  "color.action.primary.hover": {
    src: { over: ["--color-overlay-hover", "--color-accent"] },
    where: "Button primary + overlay-hover",
  },
  "color.action.primary.pressed": {
    src: { over: ["--color-overlay-pressed", "--color-accent"] },
    where: "Button primary + overlay-pressed",
  },
  "color.action.primary.selected": {
    src: { over: ["--color-overlay-pressed", "--color-accent"] },
    where: "wie pressed",
  },
  "color.action.primary.disabled": {
    src: { fade: ["--color-accent", 0.5, "--color-background-surface"] },
    where: "Button disabled: opacity 0.5",
  },
  "color.action.primary.text": { src: k("--color-on-accent") },
  "color.action.secondary.rest": {
    src: { over: ["--color-neutral", "--color-background-surface"] },
    where: "Button secondary auf surface",
  },
  "color.action.secondary.hover": {
    src: { over: ["--color-overlay-hover", "--color-neutral", "--color-background-surface"] },
    where: "Button secondary + overlay-hover",
  },
  "color.action.secondary.pressed": {
    src: { over: ["--color-overlay-pressed", "--color-neutral", "--color-background-surface"] },
    where: "Button secondary + overlay-pressed",
  },
  "color.action.secondary.selected": {
    src: { over: ["--color-overlay-pressed", "--color-neutral", "--color-background-surface"] },
    where: "wie pressed",
  },
  "color.action.secondary.disabled": {
    src: { fade: ["--color-neutral", 0.5, "--color-background-surface"] },
    where: "Button disabled: opacity 0.5",
  },
  "color.action.secondary.text": { src: k("--color-text-primary") },
  "color.action.tertiary.rest": { src: { transparent: true }, where: "Button ghost: transparent" },
  "color.action.tertiary.hover": {
    src: k("--color-overlay-hover"),
    where: "Button ghost + overlay-hover",
  },
  "color.action.tertiary.pressed": {
    src: k("--color-overlay-pressed"),
    where: "Button ghost + overlay-pressed",
  },
  "color.action.tertiary.selected": { src: k("--color-overlay-pressed"), where: "wie pressed" },
  "color.action.tertiary.disabled": {
    src: { transparent: true },
    where: "Button ghost: transparent",
  },
  "color.action.tertiary.text": { src: k("--color-text-primary"), where: "Button ghost" },
  "color.action.danger.rest": {
    src: { perMode: ["--color-error-muted", "--color-background-red"] },
    where: "Button destructive (theme-neutral: error-muted; dunkel deckend background-red)",
  },
  "color.action.danger.hover": {
    src: {
      overPerMode: [
        "--astryx-theme-neutral-color-destructive-overlay-hover",
        ["--color-error-muted", "--color-background-red"],
      ],
    },
    where: "Button destructive + destructive-overlay-hover",
  },
  "color.action.danger.pressed": {
    src: {
      overPerMode: [
        "--astryx-theme-neutral-color-destructive-overlay-pressed",
        ["--color-error-muted", "--color-background-red"],
      ],
    },
    where: "Button destructive + destructive-overlay-pressed",
  },
  "color.action.danger.text": {
    src: k("--color-error"),
    where: "Button destructive (theme-neutral: color error)",
  },
  "color.navigation.rest": {
    src: { perMode: ["--color-background-surface", "--color-background-body"] },
    where: "Fläche unter der Navigation",
  },
  "color.navigation.hover": {
    src: {
      overPerMode: [
        "--color-overlay-hover",
        ["--color-background-surface", "--color-background-body"],
      ],
    },
    where: "SideNav + overlay-hover",
  },
  "color.navigation.selected": {
    src: k("--color-accent-muted"),
    where: "Item selected: accent-muted",
  },
  "color.navigation.text.rest": { src: k("--color-text-secondary"), where: "SideNavItem" },
  "color.navigation.text.selected": { src: k("--color-text-primary") },
  "color.brand.fill": { src: k("--color-accent") },
  "color.brand.text": { src: k("--color-on-accent") },
  "color.focus.ring": {
    src: k("--color-accent"),
    where: "--focus-outline-color: var(--color-accent)",
  },
  "color.focus.inner": {
    src: k("--color-background-surface"),
    where: "Lücke des Fokusrings (outline-offset) zeigt die Fläche",
  },
  "color.shadow.key": { src: k("--color-shadow") },
  "color.shadow.ambient": {
    src: k("--color-overlay-hover"),
    where: "leichte Schattenschicht (shadow-low, 5 %)",
  },
  "color.backdrop": { src: k("--color-overlay"), where: "Dialog-Hintergrund (overlay)" },
};
const STATUS = {
  success: {
    fill: "--astryx-theme-neutral-color-status-fill-success",
    muted: "--color-success-muted",
    bg: "--color-background-green",
    text: "--color-text-green",
    on: "--color-on-success",
    border: "--color-border-green",
  },
  warning: {
    fill: "--astryx-theme-neutral-color-status-fill-warning",
    muted: "--color-warning-muted",
    bg: "--color-background-yellow",
    text: "--color-text-yellow",
    on: "--color-on-warning",
    border: "--color-border-yellow",
  },
  danger: {
    fill: "--astryx-theme-neutral-color-status-fill-error",
    muted: "--color-error-muted",
    bg: "--color-background-red",
    text: "--color-text-red",
    on: "--color-on-error",
    border: "--color-border-red",
  },
  info: {
    fill: "--astryx-theme-neutral-color-status-fill-accent",
    muted: "--astryx-theme-neutral-color-status-muted-accent",
    bg: "--color-background-blue",
    text: "--color-text-blue",
    on: "--color-on-accent",
    border: "--color-border-blue",
  },
};
for (const [s, m] of Object.entries(STATUS)) {
  ROLES[`color.status.${s}.basic`] = { src: k(m.fill), where: "Badge/StatusDot: status fill" };
  ROLES[`color.status.${s}.weak`] = {
    src: { perMode: [m.muted, m.bg] },
    where:
      "hell: muted; dunkel: background-<farbe> (die Fonto legt muted mit 24 % über die Fläche; deckend ist ihre Fläche background-<farbe>)",
  };
  ROLES[`color.status.${s}.subtle`] = { src: k(m.bg), where: "background-<farbe>" };
  ROLES[`color.status.${s}.text`] = { src: k(m.text), where: "text-<farbe>" };
  ROLES[`color.status.${s}.on`] = { src: k(m.on) };
  ROLES[`color.status.${s}.border`] = { src: k(m.border), where: "border-<farbe>" };
}
const _STATUS_FAM = { success: "G", warning: "Y", danger: "R", info: "B" };

// Anpassungen: eine Regulo oder ein Aspiro von komuna gewinnt (Jugxo). Wird nach den Messungen
// gefüllt: token → mode → {step, regulo|aspiro, kialo}.
const ANPASSOJ = JSON.parse(readFileSync(new URL("./anpassoj.json", import.meta.url), "utf8"));

// ---------- Paletten ----------
const OUR_STEPS = [
  0, 25, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950, 975, 1000,
];
const stopOf = (step) => 100 - step / 10; // 25 → 97.5
const PALETTES = { neutral: "N", accent: "N", success: "G", warning: "Y", danger: "R", info: "B" };
// Welche Rampe (light/dark der Fonto) braucht eine Stufe je Modus? Aus den Referenzen der Rollen.
const usage = {}; // fam → mode → stop → Set(ramp)
function note(key, mode) {
  const r = T[key][mode === "light" ? 0 : 1];
  if (r.kind !== "ref" || r.alpha !== undefined) return;
  const GRID = new Set([100, 95, 90, 85, 80, 70, 60, 50, 40, 30, 20, 15, 10, 5, 0]);
  // Eine Fonto-Stufe zwischen zwei Stufen von Fundamento: beide Nachbarn aus derselben Rampe.
  const stops = GRID.has(r.stop) ? [r.stop] : [r.stop - 5, r.stop + 5];
  for (const stop of stops) {
    usage[r.fam] ??= {};
    usage[r.fam][mode] ??= {};
    usage[r.fam][mode][stop] ??= new Set();
    usage[r.fam][mode][stop].add(r.ramp);
  }
}
const keysOf = (src) =>
  [
    src.key,
    src.mixTint,
    src.swap,
    ...(src.over ?? []),
    ...(src.fade ? [src.fade[0], src.fade[2]] : []),
    ...(src.perMode ?? []),
    ...(src.overPerMode ? [src.overPerMode[0], ...src.overPerMode[1]] : []),
  ].filter(Boolean);
for (const role of Object.values(ROLES))
  for (const key of keysOf(role.src)) for (const mode of MODES) note(key, mode);
const conflicts = [];
function rampFor(fam, mode, stop) {
  const set = usage[fam]?.[mode]?.[stop];
  if (set === undefined) return "light";
  if (set.size > 1 && PAL[fam].light[String(stop)] !== PAL[fam].dark[String(stop)])
    conflicts.push(`${fam} ${mode} ${stop}: beide Rampen`);
  return [...set][0];
}
function paletteValue(pal, step, mode) {
  const fam = FAM[PALETTES[pal]];
  const stop = stopOf(step);
  if (Number.isInteger(stop)) {
    const ramp = rampFor(fam, mode, stop);
    return {
      c: parse(PAL[fam][ramp][String(stop)]),
      src: {
        dosiero: F_PAL,
        sxlosilo: `palette.${fam}.${ramp}.${stop}`,
        fontoValoro: PAL[fam][ramp][String(stop)],
        maniero: "prenita",
      },
    };
  }
  const lo = Math.floor(stop / 5) * 5,
    hi = lo + 5;
  const ramp =
    rampFor(fam, mode, lo) === "dark" || rampFor(fam, mode, hi) === "dark" ? "dark" : "light";
  if (stop > 50) {
    // 97,5: Mitte zwischen Weiß und 95 in OKLab, in sRGB gehalten.
    const c = inGamut(
      oklabMid(parse(PAL[fam][ramp][String(lo)]), parse(PAL[fam][ramp][String(hi)])),
    );
    return {
      c,
      src: {
        dosiero: F_PAL,
        sxlosilo: `palette.${fam}.${ramp}.${hi} … ${lo}`,
        fontoValoro: `${PAL[fam][ramp][String(hi)]} … ${PAL[fam][ramp][String(lo)]}`,
        maniero: "interpolita",
        noto: `Stufe ${stop} der Fonto gibt es nicht; Mitte der Nachbarn in OKLab, in sRGB gehalten.`,
      },
    };
  }
  // 2,5: eine halbe Stufe hinter 5, in der Richtung von 10 → 5 (Schwarz ist ein Anker, kein Schritt).
  const c = inGamut(oklabExtrapolate(parse(PAL[fam][ramp]["10"]), parse(PAL[fam][ramp]["5"]), 0.5));
  return {
    c,
    src: {
      dosiero: F_PAL,
      sxlosilo: `palette.${fam}.${ramp}.10 → 5`,
      fontoValoro: `${PAL[fam][ramp]["10"]} → ${PAL[fam][ramp]["5"]}`,
      maniero: "interpolita",
      noto: "Stufe 2,5 der Fonto gibt es nicht; eine halbe Stufe über 5 hinaus in OKLab (Schwarz ist Anker), in sRGB gehalten.",
    },
  };
}
const palette = {}; // mode → pal → step → {c, src}
for (const mode of MODES) {
  palette[mode] = {};
  for (const pal of Object.keys(PALETTES)) {
    palette[mode][pal] = {};
    for (const step of OUR_STEPS) {
      if (pal !== "neutral" && (step === 0 || step === 1000)) continue;
      palette[mode][pal][step] = paletteValue(pal, step, mode);
    }
  }
}
// Durchsichtige Stufen bleiben die von komuna (shade = Schwarz, tint = Weiß mit N %).
const SHADE = [0, 8, 10, 25, 50],
  TINT = [8, 10];

// ---------- Rollen auflösen ----------
function sourceColor(src, mode) {
  const m = mode === "light" ? 0 : 1;
  if (src.key) return fontoColor(src.key, mode);
  if (src.transparent) return { r: 0, g: 0, b: 0, a: 0 };
  if (src.mixTint) {
    const base = fontoColor(src.mixTint, mode);
    const tint = mode === "light" ? { r: 0, g: 0, b: 0, a: 1 } : { r: 1, g: 1, b: 1, a: 1 };
    return mixSrgb(base, tint, 0.15);
  }
  if (src.swap) return fontoColor(src.swap, mode === "light" ? "dark" : "light");
  if (src.over)
    return src.over.map((key) => fontoColor(key, mode)).reduceRight((acc, top) => over(top, acc));
  if (src.fade)
    return over(
      withAlpha(fontoColor(src.fade[0], mode), src.fade[1] * fontoColor(src.fade[0], mode).a),
      fontoColor(src.fade[2], mode),
    );
  if (src.perMode) return fontoColor(src.perMode[m], mode);
  if (src.overPerMode)
    return over(fontoColor(src.overPerMode[0], mode), fontoColor(src.overPerMode[1][m], mode));
  throw new Error(JSON.stringify(src));
}
function srcText(src, mode) {
  if (src.key) return describe(src.key, mode);
  if (src.transparent) return "transparent";
  if (src.mixTint)
    return `color-mix(${describe(src.mixTint, mode)}, ${mode === "light" ? "black" : "white"} 15 %)`;
  if (src.swap) return describe(src.swap, mode === "light" ? "dark" : "light");
  if (src.over) return src.over.map((key) => describe(key, mode)).join(" über ");
  if (src.fade)
    return `${describe(src.fade[0], mode)} mit Deckkraft ${src.fade[1]} über ${describe(src.fade[2], mode)}`;
  if (src.perMode) return describe(src.perMode[mode === "light" ? 0 : 1], mode);
  if (src.overPerMode)
    return `${describe(src.overPerMode[0], mode)} über ${describe(src.overPerMode[1][mode === "light" ? 0 : 1], mode)}`;
  return "?";
}
function famOf(token) {
  const s = /^color\.status\.([a-z]+)\./.exec(token)?.[1];
  if (s && token.endsWith(".on")) return "neutral";
  if (s) return s;
  if (token.startsWith("color.action.danger.") && !token.endsWith(".text")) return "danger";
  if (token === "color.action.danger.text") return "danger";
  return "neutral";
}
function nearestStep(c, pal, mode) {
  if (c.a < 1 - 1e-6) {
    const isBlack = c.r + c.g + c.b < 0.3;
    const list = isBlack ? SHADE : TINT;
    const best = list.reduce(
      (b, n) => (Math.abs(n / 100 - c.a) < Math.abs(b / 100 - c.a) ? n : b),
      list[0],
    );
    return {
      alias: `color.palette.${isBlack ? "shade" : "tint"}.${best}`,
      exact: Math.abs(best / 100 - c.a) < 0.004,
      value: { ...c, a: best / 100 },
    };
  }
  let best,
    bestD = Infinity;
  for (const [step, v] of Object.entries(palette[mode][pal])) {
    const d = dE(c, v.c);
    if (d < bestD) {
      bestD = d;
      best = step;
    }
  }
  return {
    alias: `color.palette.${pal}.${best}`,
    exact: bestD < 0.5,
    dE: bestD,
    value: palette[mode][pal][best].c,
  };
}
const roleOut = { light: {}, dark: {} };
const deveno = [];
for (const [token, role] of Object.entries(ROLES)) {
  for (const mode of MODES) {
    const fontoC = sourceColor(role.src, mode);
    const pal = famOf(token);
    const near = nearestStep(fontoC, pal, mode);
    const adapt = ANPASSOJ[token]?.[mode];
    const alias = adapt ? `color.palette.${adapt.step}` : near.alias;
    roleOut[mode][token] = `{${alias}}`;
    const composite = role.src.over || role.src.fade || role.src.mixTint || role.src.overPerMode;
    deveno.push({
      token,
      aro: mode === "light" ? "core" : "aspekto/komuna+color-scheme/dark",
      fonto: FONTO,
      dosiero:
        role.src.key && LOCAL(role.src.key)
          ? F_THEME
          : role.src.key
            ? fileOf(role.src.key)
            : F_THEME,
      sxlosilo: srcText(role.src, mode) + (role.where ? ` – ${role.where}` : ""),
      fontoValoro:
        fontoC.a < 1 ? `${hexOf(fontoC)} ${Math.round(fontoC.a * 1000) / 10} %` : hexOf(fontoC),
      valoro: `{${alias}}`,
      maniero: adapt
        ? "adaptita"
        : composite
          ? near.exact
            ? "kunmetita"
            : "kunmetita-rundita"
          : near.exact
            ? "prenita"
            : "rundita",
      ...(adapt ? { jugxo: adapt.jugxo ?? "TODO", kialo: adapt.kialo } : {}),
      ...(near.exact || adapt
        ? {}
        : {
            noto: `nächste Stufe ${near.alias.replace("color.palette.", "")}${near.dE === undefined ? "" : `, ΔE2000 ${near.dE.toFixed(1)}`}`,
          }),
      ...(adapt ? { noto: `Fonto-Stufe wäre ${near.alias.replace("color.palette.", "")}` } : {}),
    });
  }
}

// ---------- Ergebnis ----------
if (conflicts.length > 0) throw new Error(`Rampen-Konflikte: ${conflicts.join("; ")}`);

export { deveno, dtcg, hexOf, PAL, palette, parse, roleOut };
