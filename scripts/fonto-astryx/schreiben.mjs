// Spec 029 ① – schreibt die Werte von komuna nach der Fonto astryx (theme-neutral 0.7.4) in den Kern,
// die Konjunktions-Sets von komuna, packages/aspekto-komuna/deveno.json und jugxoj.json.
//
// Aufruf (Messanleitung im plan von Spec 029):
//   mkdir -p /tmp/fonto && cd /tmp/fonto && npm pack @astryxdesign/core@0.7.4 @astryxdesign/theme-neutral@0.7.4
//   mkdir core neutral && tar xzf astryxdesign-core-0.7.4.tgz -C core && tar xzf astryxdesign-theme-neutral-0.7.4.tgz -C neutral
//   git checkout <main> -- packages/vortaro/sets/core.json packages/aspekto-komuna/sets/aspekto/komuna+color-scheme/dark.json
//   node scripts/fonto-astryx/schreiben.mjs "$PWD" /tmp/fonto && pnpm vortaro:themes
//   npx biome format --write packages/vortaro/sets/core.json packages/aspekto-komuna
// Die Anpassungen, bei denen eine Regulo oder ein Aspiro von komuna gewinnt, stehen in anpassoj.json.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dtcg, deveno as farbDeveno, hexOf, palette, roleOut } from "./werte.mjs";

const [repo] = process.argv.slice(2);
const EXT = "com.ciferecigo.fundamento";
const FONTO = "astryx";
const F_THEME = "packages/themes/neutral/src/neutralTheme.ts";
const F_CSS = "packages/themes/neutral/dist/theme.css";
const F_CORE = "packages/core/src/theme/tokens.stylex.ts";
const F_ICON = "packages/core/src/Icon/Icon.tsx";
const F_BUTTON = "packages/core/src/Button/Button.tsx";
const SET_IDS = {
  "viewport/compact": "set_01M5N7VJ4JQ9SVVN86F25NFCWV",
  "viewport/expanded": "set_01M5N7VJ4JQ9SVVN86F25NFCWW",
  "density/compact": "set_01M5N7VJ4JQ9SVVN86F25NFCWX",
  "density/comfortable": "set_01M5N7VJ4JQ9SVVN86F25NFCWY",
};
const ANPASSOJ = JSON.parse(readFileSync(new URL("./anpassoj.json", import.meta.url), "utf8"));
const px = (value) => ({ value, unit: "px" });
const ms = (value) => ({ value, unit: "ms" });
const deveno = [...farbDeveno];
const dev = (token, aro, dosiero, sxlosilo, fontoValoro, valoro, maniero, extra = {}) =>
  deveno.push({
    token,
    aro,
    fonto: FONTO,
    dosiero,
    sxlosilo,
    fontoValoro: String(fontoValoro),
    valoro: typeof valoro === "string" ? valoro : JSON.stringify(valoro),
    maniero,
    ...extra,
  });
const adapt = (token, mode = "light") => ANPASSOJ[token]?.[mode];

// ---------- Kern lesen ----------
const corePath = `${repo}/packages/vortaro/sets/core.json`;
const core = JSON.parse(readFileSync(corePath, "utf8"));
const at = (name) => name.split(".").reduce((node, key) => node?.[key], core);
function set(name, value) {
  const node = at(name);
  if (node === undefined || !("$value" in node)) throw new Error(`kein Token ${name}`);
  node.$value = value;
}

// ---------- Farben (hell) ----------
for (const [pal, steps] of Object.entries(palette.light)) {
  for (const [step, v] of Object.entries(steps)) {
    set(`color.palette.${pal}.${step}`, dtcg(v.c));
    dev(
      `color.palette.${pal}.${step}`,
      "core",
      v.src.dosiero,
      v.src.sxlosilo + (pal === "accent" ? " (Akzent der Fonto: neutral)" : ""),
      v.src.fontoValoro,
      hexOf(v.c),
      v.src.maniero,
      v.src.noto ? { noto: v.src.noto } : {},
    );
  }
}
for (const [token, alias] of Object.entries(roleOut.light)) set(token, alias);

// ---------- Typografie ----------
// Skala über Basis 14 und Verhältnis 1,2 (theme-neutral: typography.scale {base: 14, ratio: 1.2}).
const SCALE = {
  100: ["xs", 10],
  200: ["sm", 12],
  300: ["base", 14],
  400: ["lg", 17],
  500: ["xl", 20],
  600: ["2xl", 24],
  700: ["3xl", 29],
  800: ["4xl", 35],
  900: ["5xl", 42],
};
const REM = {
  xs: "0.625rem",
  sm: "0.75rem",
  base: "0.875rem",
  lg: "1.0625rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.8125rem",
  "4xl": "2.1875rem",
  "5xl": "2.625rem",
};
for (const [step, [name, size]] of Object.entries(SCALE)) {
  set(`font.size.scale.${step}`, px(size));
  dev(
    `font.size.scale.${step}`,
    "core",
    F_CSS,
    `--font-size-${name}`,
    REM[name],
    px(size),
    "konvertita",
    { noto: "rem × 16 px" },
  );
}
// Über 5xl hat die Fonto keine Stufe; Basis 14 × 1,2^n, gerundet (abgeleitet).
for (const [step, n, size] of [
  [1000, 7, 50],
  [1100, 8, 60],
  [1200, 9, 72],
]) {
  set(`font.size.scale.${step}`, px(size));
  dev(
    `font.size.scale.${step}`,
    "core",
    F_THEME,
    `typography.scale {base: 14, ratio: 1.2}, Stufe +${n}`,
    `14 × 1,2^${n}`,
    px(size),
    "derivita",
    { noto: "Die Fonto endet bei +6 (5xl); weitergerechnet mit Basis und Verhältnis." },
  );
}
// Rollen: Fundamento-Rolle → Stufe, Fonto-Rolle, Leading, Gewicht.
const TYPE = {
  "display.1": [900, "display-1", 1.2381, "regular"],
  "display.2": [800, "display-2", 1.2571, "regular"],
  "display.3": [700, "display-3", 1.3793, "regular"],
  "headline.1": [600, "heading-1", 1.3333, "semibold"],
  "headline.2": [500, "heading-2", 1.4, "semibold"],
  "headline.3": [400, "heading-3", 1.4118, "bold"],
  "headline.4": [300, "heading-4", 1.4286, "bold"],
  "body.1": [300, "body", 1.4286, "regular"],
  "body.2": [200, "supporting", 1.6667, "regular"],
  "label.1": [300, "label", 1.4286, "medium"],
  "label.2": [200, "supporting", 1.6667, "medium"],
  caption: [200, "supporting", 1.6667, "regular"],
  code: [300, "code", 1.4286, "regular"],
  kicker: [200, "heading-5", 1.6667, "semibold"],
};
const WEIGHT_KEY = { regular: "normal", medium: "medium", semibold: "semibold", bold: "bold" };
for (const [role, [step, fonto, leading, weight]] of Object.entries(TYPE)) {
  set(`font.size.${role}`, `{font.size.scale.${step}}`);
  dev(
    `font.size.${role}`,
    "core",
    F_CSS,
    `--text-${fonto}-size`,
    `var(--font-size-${SCALE[step][0]})`,
    `{font.size.scale.${step}}`,
    "prenita",
  );
  const lh = adapt(`font.lineheight.${role}`)?.valoro ?? leading;
  set(`font.lineheight.${role}`, lh);
  dev(
    `font.lineheight.${role}`,
    "core",
    F_CSS,
    `--text-${fonto}-leading`,
    leading,
    lh,
    lh === leading ? "prenita" : "adaptita",
    lh === leading
      ? {}
      : {
          jugxo: adapt(`font.lineheight.${role}`).jugxo,
          kialo: adapt(`font.lineheight.${role}`).kialo,
        },
  );
  // Laufweite: komuna behält ihre Laufweiten (Familie Geist); die Rolle folgt der Stufe ihrer Größe.
  set(
    `font.tracking.${role}`,
    role === "kicker" ? "{font.tracking.scale.caps}" : `{font.tracking.scale.${step}}`,
  );
  const typo = at(`typography.${role}`);
  typo.$value = { ...typo.$value, fontWeight: `{font.weight.${weight}}` };
  dev(
    `typography.${role}`,
    "core",
    F_CSS,
    `--text-${fonto}-weight`,
    `var(--font-weight-${WEIGHT_KEY[weight]})`,
    `{font.weight.${weight}}`,
    "prenita",
    { kampo: "fontWeight" },
  );
}

// ---------- Größen, Radien, Fokus, Rand ----------
set("size.scale.700", px(36));
set("size.scale.800", px(40));
set("size.control.small", "{size.scale.500}");
set("size.control.medium", "{size.scale.600}");
set("size.control.large", "{size.scale.700}");
for (const [token, key, value] of [
  ["size.control.small", "--size-element-sm", 28],
  ["size.control.medium", "--size-element-md", 32],
  ["size.control.large", "--size-element-lg", 36],
])
  dev(token, "core", F_CORE, key, `${value}px`, at(token).$value, "prenita");
dev("size.scale.700", "core", F_CORE, "--size-element-lg", "36px", px(36), "prenita");
dev("size.scale.800", "core", F_CORE, "--size-element-lg + 4px", "36px", px(40), "derivita", {
  noto: "Stufe für density=comfortable (eine Stufe über lg); die Fonto hat keine Dichte.",
});
for (const [token, key, value] of [
  ["size.icon.small", "sm", 16],
  ["size.icon.medium", "md", 20],
  ["size.icon.large", "lg", 24],
])
  dev(token, "core", F_ICON, `IconSize '${key}'`, `${value}px`, at(token).$value, "prenita", {
    noto: "gleich dem Wert von komuna",
  });
for (const [token, key, rem, value] of [
  ["radius.small", "--radius-inner", "0.375rem", 6],
  ["radius.medium", "--radius-element", "0.625rem", 10],
  ["radius.large", "--radius-container", "0.75rem", 12],
  ["radius.xlarge", "--radius-page", "1.75rem", 28],
]) {
  set(token, px(value));
  dev(token, "core", F_CSS, key, rem, px(value), "konvertita", { noto: "rem × 16 px" });
}
dev("radius.none", "core", F_CSS, "--radius-none", "0px", at("radius.none").$value, "prenita");
dev("radius.full", "core", F_CSS, "--radius-full", "9999px", at("radius.full").$value, "prenita");
set("focus.offset", px(3));
dev("focus.offset", "core", F_CORE, "--focus-outline-offset", "3px", px(3), "prenita");
dev(
  "border.width.focus",
  "core",
  F_CORE,
  "--focus-outline-width",
  "2px",
  at("border.width.focus").$value,
  "prenita",
);
dev(
  "border.width.default",
  "core",
  F_CORE,
  "--border-width",
  "1px",
  at("border.width.default").$value,
  "prenita",
);
const SPACING = {
  0: 0,
  50: 0.5,
  100: 1,
  150: 1.5,
  200: 2,
  300: 3,
  400: 4,
  500: 5,
  600: 6,
  800: 8,
  1000: 10,
  1200: 12,
};
for (const [step, n] of Object.entries(SPACING)) {
  const key = `--spacing-${String(n).replace(".", "-")}`;
  dev(
    `spacing.scale.${step}`,
    "core",
    F_CORE,
    key,
    `${n * 0.25}rem`,
    at(`spacing.scale.${step}`).$value,
    "konvertita",
    { noto: "rem × 16 px, gleich dem Wert von komuna" },
  );
}

// ---------- Elevation ----------
const FONTO_SHADOW = {
  "--shadow-low": {
    light: "0 2px 4px 5 %, 0 4px 8px 10 %",
    dark: "0 2px 4px 25 %, 0 4px 8px 40 %, inset 1px 8 % Weiß",
  },
  "--shadow-med": {
    light: "0 2px 4px 5 %, 0 4px 12px 10 %",
    dark: "0 2px 4px 35 %, 0 4px 12px 50 %, inset 1px 12 % Weiß",
  },
  "--shadow-high": {
    light: "0 4px 6px 10 %, 0 12px 24px 15 %",
    dark: "0 4px 6px 50 %, 0 12px 24px 70 %, inset 1px 15 % Weiß",
  },
};
// Eine Deckkraft, die eine Stufe von shade (Schwarz) oder tint (Weiß) genau hat, ist ein Alias auf
// sie; die anderen stehen als Wert (die Fonto hat feinere Stufen als Fundamento).
const SHADE_STEPS = [0, 8, 10, 25, 50],
  TINT_STEPS = [8, 10];
const black = (a) =>
  SHADE_STEPS.includes(Math.round(a * 100))
    ? `{color.palette.shade.${Math.round(a * 100)}}`
    : { colorSpace: "srgb", components: [0, 0, 0], alpha: a, hex: "#000000" };
const white = (a) =>
  TINT_STEPS.includes(Math.round(a * 100))
    ? `{color.palette.tint.${Math.round(a * 100)}}`
    : { colorSpace: "srgb", components: [1, 1, 1], alpha: a, hex: "#ffffff" };
const layer = (y, blur, color, extra = {}) => ({
  color,
  offsetX: px(0),
  offsetY: px(y),
  blur: px(blur),
  spread: px(0),
  ...extra,
});
const rim = (a) => ({
  color: white(a),
  offsetX: px(0),
  offsetY: px(0),
  blur: px(0),
  spread: px(1),
  inset: true,
});
const SHADOWS = {
  light: {
    raised: ["--shadow-low", [layer(2, 4, black(0.05)), layer(4, 8, black(0.1))]],
    overlay: ["--shadow-med", [layer(2, 4, black(0.05)), layer(4, 12, black(0.1))]],
    floating: ["--shadow-high", [layer(4, 6, black(0.1)), layer(12, 24, black(0.15))]],
    modal: ["--shadow-high", [layer(4, 6, black(0.1)), layer(12, 24, black(0.15))]],
  },
  dark: {
    raised: ["--shadow-low", [layer(2, 4, black(0.25)), layer(4, 8, black(0.4)), rim(0.08)]],
    overlay: ["--shadow-med", [layer(2, 4, black(0.35)), layer(4, 12, black(0.5)), rim(0.12)]],
    floating: ["--shadow-high", [layer(4, 6, black(0.5)), layer(12, 24, black(0.7)), rim(0.15)]],
    modal: ["--shadow-high", [layer(4, 6, black(0.5)), layer(12, 24, black(0.7)), rim(0.15)]],
  },
};
for (const [level, [key, layers]] of Object.entries(SHADOWS.light)) {
  set(`elevation.shadow.${level}`, layers);
  dev(
    `elevation.shadow.${level}`,
    "core",
    F_CSS,
    `${key} (light)`,
    FONTO_SHADOW[key].light,
    layers,
    "prenita",
    {
      noto:
        level === "modal"
          ? "Die Fonto hat drei Stufen; modal nimmt wie floating die höchste."
          : undefined,
    },
  );
}

// ---------- Bewegung ----------
for (const [step, key, value] of [
  [1, "--duration-fast", 125],
  [2, "--duration-medium", 300],
  [3, "--duration-slow", 700],
  [4, "--duration-slow-max", 935],
]) {
  set(`motion.duration.scale.${step}`, ms(value));
  dev(
    `motion.duration.scale.${step}`,
    "core",
    F_CSS,
    key,
    `${value}ms`,
    ms(value),
    "prenita",
    step === 4 ? { noto: "deliberate: die längste Dauer der Fonto (slow-max)." } : {},
  );
}
set("motion.easing.curve.smooth", [0.24, 1, 0.4, 1]);
dev(
  "motion.easing.curve.smooth",
  "core",
  F_CORE,
  "--ease-standard",
  "cubic-bezier(0.24, 1, 0.4, 1)",
  [0.24, 1, 0.4, 1],
  "prenita",
);

// ---------- Deckkraft ----------
for (const [token, key, value] of [
  ["opacity.disabled", "Button disabled opacity", 0.5],
  ["opacity.hover", "--color-overlay-hover (Alpha)", 0.05],
  ["opacity.pressed", "--color-overlay-pressed (Alpha)", 0.1],
  ["opacity.overlay", "--color-overlay light (Alpha)", 0.5],
]) {
  set(token, value);
  dev(
    token,
    "core",
    token === "opacity.disabled" ? F_BUTTON : F_THEME,
    key,
    value,
    value,
    "prenita",
  );
}

writeFileSync(corePath, `${JSON.stringify(core, null, 2)}\n`);

// ---------- komuna+color-scheme/dark ----------
const dir = `${repo}/packages/aspekto-komuna/sets/aspekto`;
const tree = (entries) => {
  const out = {};
  for (const [name, value] of entries) {
    const keys = name.split(".");
    let node = out;
    for (const key of keys.slice(0, -1)) node = node[key] ??= {};
    node[keys.at(-1)] = { $value: value };
  }
  return out;
};
const darkEntries = [];
for (const [pal, steps] of Object.entries(palette.dark)) {
  for (const [step, v] of Object.entries(steps)) {
    // Eine Stufe, die im Dunkeln gleich bleibt, steht nicht im Set – außer neutral.950: die tönte
    // komuna 0.2 im Dunkeln, und ihre abgeleiteten Marken tun es noch; nennt komuna sie nicht, läge
    // die Figma-Variable je nach Markenliste in einer anderen Sammlung (Nachlese 8 ② 1).
    if (hexOf(v.c) === hexOf(palette.light[pal][step].c) && !(pal === "neutral" && step === "950"))
      continue;
    darkEntries.push([`color.palette.${pal}.${step}`, dtcg(v.c)]);
    dev(
      `color.palette.${pal}.${step}`,
      "aspekto/komuna+color-scheme/dark",
      v.src.dosiero,
      v.src.sxlosilo,
      v.src.fontoValoro,
      hexOf(v.c),
      v.src.maniero,
    );
  }
}
for (const [token, alias] of Object.entries(roleOut.dark)) darkEntries.push([token, alias]);
for (const [level, [key, layers]] of Object.entries(SHADOWS.dark)) {
  darkEntries.push([`elevation.shadow.${level}`, layers]);
  dev(
    `elevation.shadow.${level}`,
    "aspekto/komuna+color-scheme/dark",
    F_CSS,
    `${key} (dark: Schatten und 1 px Lichtkante innen)`,
    FONTO_SHADOW[key].dark,
    layers,
    "prenita",
  );
}
const darkSet = {
  $extensions: {
    [EXT]: {
      id: "set_01M2VEEDW45A0B9Q4GQ465NCHN",
      kondicxoj: ["aspekto=komuna", "color-scheme=dark"],
    },
  },
  ...tree(darkEntries),
};
// $type der Gruppen wie im Kern
darkSet.color.$type = "color";
darkSet.elevation.$type = "shadow";
writeFileSync(`${dir}/komuna+color-scheme/dark.json`, `${JSON.stringify(darkSet, null, 2)}\n`);

// ---------- Konjunktions-Sets Bildschirmbreite und Dichte ----------
function conj(name, entries, types) {
  const [dimensio, valoro] = name.split("/");
  const out = {
    $extensions: {
      [EXT]: { id: SET_IDS[name], kondicxoj: ["aspekto=komuna", `${dimensio}=${valoro}`] },
    },
    ...tree(entries),
  };
  for (const [path, type] of Object.entries(types))
    path.split(".").reduce((node, key) => node[key], out).$type = type;
  mkdirSync(`${dir}/komuna+${dimensio}`, { recursive: true });
  writeFileSync(`${dir}/komuna+${dimensio}/${valoro}.json`, `${JSON.stringify(out, null, 2)}\n`);
}
// Bildschirmbreite schmal = Anpassung der Fonto bei Touch und schmaler Breite: Basis 16, Verhältnis 1,1736.
const TOUCH = {
  100: ["xs", 12, "0.75rem"],
  200: ["sm", 14, "0.875rem"],
  300: ["base", 16, "1rem"],
  400: ["lg", 19, "1.1875rem"],
  500: ["xl", 22, "1.375rem"],
  600: ["2xl", 26, "1.625rem"],
  700: ["3xl", 30, "1.875rem"],
  800: ["4xl", 36, "2.25rem"],
  900: ["5xl", 42, "2.625rem"],
};
const TOUCH_LEADING = {
  "display.1": 1.2381,
  "display.2": 1.2222,
  "display.3": 1.4667,
  "headline.1": 1.3846,
  "headline.2": 1.4545,
  "headline.3": 1.4737,
  "headline.4": 1.5,
  "body.1": 1.5,
  "body.2": 1.4286,
  "label.1": 1.5,
  "label.2": 1.4286,
  caption: 1.4286,
  code: 1.5,
  kicker: 1.4286,
};
const compact = [];
for (const [step, [name, size, rem]] of Object.entries(TOUCH)) {
  compact.push([`font.size.scale.${step}`, px(size)]);
  dev(
    `font.size.scale.${step}`,
    "aspekto/komuna+viewport/compact",
    F_CSS,
    `@media (width < 1024px) and (pointer: coarse): --font-size-${name}`,
    rem,
    px(size),
    "konvertita",
  );
}
for (const [step, n, size] of [
  [1000, 7, 49],
  [1100, 8, 58],
  [1200, 9, 68],
]) {
  compact.push([`font.size.scale.${step}`, px(size)]);
  dev(
    `font.size.scale.${step}`,
    "aspekto/komuna+viewport/compact",
    F_THEME,
    `adaptations: scale {base: 16, ratio: 1.1736}, Stufe +${n}`,
    `16 × 1,1736^${n}`,
    px(size),
    "derivita",
  );
}
for (const [role, [step]] of Object.entries(TYPE)) {
  compact.push([`font.size.${role}`, `{font.size.scale.${step}}`]);
  compact.push([
    `font.tracking.${role}`,
    role === "kicker" ? "{font.tracking.scale.caps}" : `{font.tracking.scale.${step}}`,
  ]);
  const fontoLh = TOUCH_LEADING[role];
  const lh = adapt(`font.lineheight.${role}`, "compact")?.valoro ?? fontoLh;
  compact.push([`font.lineheight.${role}`, lh]);
  dev(
    `font.lineheight.${role}`,
    "aspekto/komuna+viewport/compact",
    F_CSS,
    `@media (width < 1024px) and (pointer: coarse): --text-${TYPE[role][1]}-leading`,
    fontoLh,
    lh,
    lh === fontoLh ? "prenita" : "adaptita",
    lh === fontoLh
      ? {}
      : {
          jugxo: adapt(`font.lineheight.${role}`, "compact").jugxo,
          kialo: adapt(`font.lineheight.${role}`, "compact").kialo,
        },
  );
}
conj("viewport/compact", compact, {
  "font.size": "dimension",
  "font.tracking": "dimension",
  "font.lineheight": "number",
});
// Bildschirmbreite weit: die Fonto vergrößert die Schrift nicht; die Rollen bleiben bei ihrer Stufe.
const expanded = [];
for (const role of [
  "display.1",
  "display.2",
  "display.3",
  "headline.1",
  "headline.2",
  "headline.3",
  "headline.4",
]) {
  expanded.push([`font.size.${role}`, `{font.size.scale.${TYPE[role][0]}}`]);
  expanded.push([`font.tracking.${role}`, `{font.tracking.scale.${TYPE[role][0]}}`]);
}
conj("viewport/expanded", expanded, { "font.size": "dimension", "font.tracking": "dimension" });
// Dunkel und hoher Kontrast: Das gemeinsame Set color-scheme/dark+contrast/high zeigt die Karte auf
// Stufe 15 und die zweite Aktion gedrückt auf Stufe 30 – bei der neuen komuna die Stufen der Fläche
// und der Ruhe. Die Fonto hat keinen hohen Kontrast; komuna behält hier ihre dunklen Stufen.
// Hoher Kontrast: Die gemeinsamen Sets contrast/high und color-scheme/dark+contrast/high zeigen die
// Karte, die zweite Aktion gedrückt und die destruktive Aktion auf Stufen, die zur neuen komuna
// nicht passen (Fläche und Ruhe fallen zusammen; die Fonto färbt destruktiv weich, die gemeinsamen
// Sets kräftig). Die Fonto hat keinen hohen Kontrast; komuna leitet ihn aus ihren Stufen ab.
const HIGH = {
  light: {
    id: "set_01M5N82WZEQ9DM65MW9Q8SWH32",
    entries: [
      ["color.status.warning.basic", roleOut.light["color.status.warning.basic"]],
      ["color.action.danger.rest", "{color.palette.danger.150}"],
      ["color.action.danger.hover", "{color.palette.danger.50}"],
      ["color.action.danger.pressed", "{color.palette.danger.25}"],
      ["color.action.danger.text", "{color.palette.danger.800}"],
    ],
  },
  dark: {
    id: "set_01M5N81WFGG7QN7NJV4E8H014M",
    entries: [
      ["color.background.raised", roleOut.dark["color.background.raised"]],
      ["color.action.secondary.hover", "{color.palette.neutral.800}"],
      ["color.action.secondary.pressed", "{color.palette.neutral.800}"],
      ["color.action.secondary.selected", "{color.palette.neutral.800}"],
      ["color.action.danger.rest", "{color.palette.danger.800}"],
      ["color.action.danger.hover", "{color.palette.danger.900}"],
      ["color.action.danger.pressed", "{color.palette.danger.950}"],
      ["color.action.danger.text", "{color.palette.danger.50}"],
      ["color.status.danger.text", "{color.palette.danger.50}"],
      ["color.status.danger.basic", "{color.palette.danger.200}"],
    ],
  },
};
for (const [scheme, { id, entries }] of Object.entries(HIGH)) {
  const out = {
    $extensions: {
      [EXT]: { id, kondicxoj: ["aspekto=komuna", `color-scheme=${scheme}`, "contrast=high"] },
    },
    ...tree(entries),
  };
  out.color.$type = "color";
  mkdirSync(`${dir}/komuna+color-scheme/${scheme}+contrast`, { recursive: true });
  writeFileSync(
    `${dir}/komuna+color-scheme/${scheme}+contrast/high.json`,
    `${JSON.stringify(out, null, 2)}\n`,
  );
  for (const [token, value] of entries)
    dev(
      token,
      `aspekto/komuna+color-scheme/${scheme}+contrast/high`,
      F_THEME,
      `hoher Kontrast ${scheme === "light" ? "hell" : "dunkel"} (die Fonto hat keinen)`,
      "kein Wert",
      value,
      "derivita",
      {
        noto: "Abgeleitet aus den Stufen von komuna: die gemeinsamen Sets für hohen Kontrast zeigen auf Stufen, die zur neuen komuna nicht passen (surface-distinct, state-distinct, Kontrast 7:1).",
      },
    );
}
// Dichte: die Fonto hat keine; eine Stufe der Größenskala nach unten oder oben (abgeleitet).
conj(
  "density/compact",
  [
    ["size.control.small", "{size.scale.400}"],
    ["size.control.medium", "{size.scale.500}"],
    ["size.control.large", "{size.scale.600}"],
  ],
  { "size.control": "dimension" },
);
conj(
  "density/comfortable",
  [
    ["size.control.small", "{size.scale.600}"],
    ["size.control.medium", "{size.scale.700}"],
    ["size.control.large", "{size.scale.800}"],
  ],
  { "size.control": "dimension" },
);
for (const [aro, values] of [
  ["aspekto/komuna+density/compact", [400, 500, 600]],
  ["aspekto/komuna+density/comfortable", [600, 700, 800]],
])
  for (const [i, role] of ["small", "medium", "large"].entries())
    dev(
      `size.control.${role}`,
      aro,
      F_CORE,
      `--size-element-sm/md/lg, eine Stufe ${aro.includes("compact") ? "kleiner" : "größer"}`,
      "keine Dichte in der Fonto",
      `{size.scale.${values[i]}}`,
      "derivita",
    );

// ---------- Jugxoj ----------
const J = {
  flaechenHell: "jug_01M5N89C1TWQ57VAQD0V6V4KR7",
  flaechenDunkel: "jug_01M5N89C1WQ308F9302JTZRVZE",
  text: "jug_01M5N89C1WQ308F9302JTZRVZF",
  rahmen: "jug_01M5N89C1WQ308F9302JTZRVZG",
  zustaende: "jug_01M5N89C1WQ308F9302JTZRVZH",
  status: "jug_01M5N89C1WQ308F9302JTZRVZJ",
  zeilen: "jug_01M5N89C1WQ308F9302JTZRVZK",
  rundung: "jug_01M5N89C1WQ308F9302JTZRVZM",
};
function jugxoOf(d) {
  if (d.maniero.includes("rundita")) return J.rundung;
  if (d.maniero !== "adaptita") return undefined;
  const dark = d.aro.includes("dark");
  if (d.token.startsWith("font.lineheight.")) return J.zeilen;
  if (d.token === "color.background.inverse" || (d.token.startsWith("color.background.") && !dark))
    return J.flaechenHell;
  if (d.token.startsWith("color.background.")) return J.flaechenDunkel;
  if (d.token.startsWith("color.text.")) return J.text;
  if (d.token.startsWith("color.border.")) return J.rahmen;
  if (d.token.startsWith("color.action.")) return J.zustaende;
  if (d.token.startsWith("color.status.")) return J.status;
  throw new Error(`kein Jugxo für ${d.token}`);
}
for (const d of deveno) {
  const id = jugxoOf(d);
  if (id !== undefined) d.jugxo = id;
}
const REG = {
  surfaceDistinct: "reg_01M2ZHPC0HH52JQJDZ2KMVECVP",
  surfaceOrder: "reg_01M2X5AMA1FH06H7BARC9QSTJB",
  textHierarchy: "reg_01M2X5DXT0TJ1ZYQG95RWX02ZV",
  stateDistinct: "reg_01M2X5G6TX43QJ21SFD4WFNM3W",
  contrastReserve: "reg_01M2ZHPC0G6PFCX6YH5YVPPG70",
  typeRhythm: "reg_01M2ZJ0YJ3CWC217Q7VC1RS6VS",
};
// Die helle inverse Fläche des Kerns der Fonto ist kein Wert von theme-neutral und keiner von
// komuna (gerundet): die Jugxo nennt Token und Stufe, nicht den Wert (#113 O-6); den Schlüssel
// der Fonto nennt deveno.json.
const quelle = (d) =>
  d.dosiero.startsWith("packages/core/") && d.aro === "core" && d.fontoValoro.startsWith("#")
    ? "hell aus dem Kern der Fonto"
    : d.fontoValoro;
const liste = (id) =>
  deveno
    .filter((d) => d.jugxo === id)
    .map(
      (d) =>
        `${d.token}${d.aro === "core" ? "" : ` (${d.aro.replace("aspekto/komuna+", "")})`}: ${quelle(d)} → ${d.valoro}`,
    )
    .join("; ");
const DATUM = "2026-10-23";
const KONTEXT =
  "Spec 029 ① (Fonto astryx, theme-neutral 0.7.4, Commit 704757fd827c6fa00a71af80b06d5da99d155e45): Herkunft je Wert in packages/aspekto-komuna/deveno.json. ";
const jugxoj = [
  {
    id: J.flaechenHell,
    ref: { regulo: REG.surfaceDistinct },
    kialo:
      "Die Fonto legt Fläche und Karte als reines Weiß auf eine Seite in Stufe 95. Das Aspiro oklch-l-extreme von komuna hält jede Fläche 0,02 von Weiß und Schwarz entfernt, und surface-distinct verlangt 0,02 zwischen benachbarten Flächen. Die Regel gewinnt (Art. V, Fonto 5): die Karte ist die hellste erlaubte Stufe (97,5), die Fläche Stufe 95, die Seite 90, die vertiefte Fläche 85; die inverse Fläche im Dunkeln 97,5 statt Weiß.",
  },
  {
    id: J.flaechenDunkel,
    ref: { regulo: REG.surfaceOrder },
    kialo:
      "Im Dunkeln liegen bei der Fonto Seite, Karte und vertiefte Fläche auf Stufe 10 unter der Fläche (15). surface-order verlangt sunken ≤ canvas ≤ default ≤ raised, surface-distinct 0,02 Abstand: die Karte ist eine Stufe heller als die Fläche (20), die vertiefte Fläche eine dunkler als die Seite (5).",
  },
  {
    id: J.text,
    ref: { regulo: REG.textHierarchy },
    kialo:
      "Das zweite und dritte Textgewicht der Fonto fallen im Dunkeln auf dieselbe Stufe (65), und hell hält das dritte (icon-secondary) auf der vertieften Fläche keine 4,5:1. text-hierarchy verlangt drei unterscheidbare Gewichte mit 0,05 Abstand und fallendem Kontrast, die Alirebleco 4,5:1 mit der Reserve von komuna: hell rücken beide eine Stufe dunkler (20 und 30), dunkel das zweite eine heller (80). Den Text im Dunkeln setzt die Fonto reinweiß; reines Weiß überstrahlt auf dunkler Fläche (Befund R4 von komuna, Halation): Stufe 97,5.",
  },
  {
    id: J.rahmen,
    ref: { artikolo: "X" },
    kialo:
      "Der Feldrahmen der Fonto (border-emphasized: 85 hell, 35 dunkel) hat auf den Flächen 1,0–2,0:1. Ein Rahmen, der ein Feld erkennbar macht, braucht nach WCAG 1.4.11 3:1, für komuna mit 10 % Reserve (Aspiro wcag2-reserve), auf jeder Fläche: hell Stufe 40, dunkel 60; der Rahmen auf der inversen Fläche Stufe 50. Der feine Rahmen der Fonto ist hell 8 % Schwarz, dunkel 10 % Weiß; eine Farbe mit wechselnder Deckkraft hat in einer Projektion mit einer Deckkraft je Farbe keine treue Abbildung (Parität, Art. X): dunkel 8 % Weiß.",
  },
  {
    id: J.zustaende,
    ref: { regulo: REG.stateDistinct },
    kialo:
      "Die Fonto zeigt hover und gedrückt mit 5 % und 10 % Überlagerung. Das ändert die Helligkeit um weniger als 0,02; state-distinct verlangt 0,05, und eine Stufe der Fonto hat 0,043. Die Zustände gehen deshalb eine oder zwei Stufen weiter, in der Richtung der Fonto, wo der Kontrast der Schrift es erlaubt, sonst in der anderen; reines Schwarz verbietet das Aspiro oklch-l-extreme, und die zweite Aktion bleibt im Dunkeln gedrückt auf der Stufe von hover, damit weiße Schrift 4,5:1 hält. Die gewählte dritte Aktion ist bei der Fonto eine Überlagerung; eine dauerhafte Wahl ist bei Fundamento eine Fläche (Befund Spec 004): deckend, die Überlagerung der Fonto auf der Fläche.",
  },
  {
    id: J.status,
    ref: { regulo: REG.contrastReserve },
    kialo:
      "Weiß auf den Füllungen der Fonto für Erfolg, Fehler und Info (gerundet auf Stufe 50) hält keine 4,5:1 mit der Reserve von komuna, die Status-Ränder der Fonto (80/85) keine 3:1, und rote Schrift auf roter Fläche im Dunkeln keine 4,95:1. Füllungen und Ränder rücken auf Stufe 40 ihrer Rampe, die rote Schrift im Dunkeln auf 85.",
  },
  {
    id: J.zeilen,
    ref: { regulo: REG.typeRhythm },
    kialo:
      "Bei Touch und schmaler Breite wächst bei der Fonto die Zeilenhöhe von display-2 zu display-1 und von supporting (14 px) zu body und label (16 px). type-rhythm verlangt in jeder Familie eine mit der Größe fallende Zeilenhöhe: display.1 nimmt 1,2222, body.2 und label.2 nehmen 1,5.",
  },
  {
    id: J.rundung,
    ref: { artikolo: "IV" },
    kialo:
      "Die Fonto hat 21 Stufen je Rampe in Schritten von 5, Fundamento 17 (neutral) und 16; Rollen zeigen auf Stufen (Art. IV, semantic-colors-alias-palette). Ein Wert der Fonto zwischen zwei Stufen von Fundamento (65, 45, 35, 25, die Füllfarben außerhalb der Rampen, Überlagerungen) nimmt die nächste Stufe in ΔE2000; neue Stufen hätten jede Marke geändert. Die durchsichtigen Überlagerungen nehmen die nächste Deckkraft von shade/tint.",
  },
].map((j) => ({
  id: j.id,
  ref: j.ref,
  aspekto: "komuna",
  decision: "deviation-recorded",
  kialo: j.kialo,
  date: DATUM,
  context: `${KONTEXT}Betroffen: ${liste(j.id)}.`,
}));
writeFileSync(
  `${repo}/packages/aspekto-komuna/jugxoj.json`,
  `${JSON.stringify({ jugxoj }, null, 2)}\n`,
);

// ---------- Herkunft ----------
const doc = {
  aspekto: "komuna",
  valoroj: deveno.map((d) =>
    Object.fromEntries(Object.entries(d).filter(([, v]) => v !== undefined)),
  ),
};
writeFileSync(`${repo}/packages/aspekto-komuna/deveno.json`, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`geschrieben: ${deveno.length} Herkunftsangaben`);
