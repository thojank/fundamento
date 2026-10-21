// Webfonts (Spec 023, K-3, §4.7) and licensed fonts (§4.5). The catalogue is the family list of
// Fontsource with its licence metadata, read once by `tiparoj:import` and kept in data/tiparoj.json
// with its provenance (Art. VII): source, day, what was kept. Only a family with an SPDX licence
// of the allowlist enters the catalogue; without a licence no font is taken over. A licensed font
// of a brand is a name with "lizenziert, nicht enthalten"; its file never enters a public result.
// Pure apart from `readTiparoj`, the I/O edge.

import { readFileSync } from "node:fs";
import type { Fonto } from "@fundamento/modelo";

export interface Tiparo {
  /** The Fontsource id (`inter`, `source-sans-3`). */
  id: string;
  family: string;
  /** SPDX licence expression of the allowlist. */
  license: string;
  category: string;
  /** Writing systems as ISO 15924 codes, sorted. */
  scripts: string[];
  variable: boolean;
}

export interface Tiparoj {
  provenance: { source: string; date: string; read: string; count: number; dropped: number };
  tiparoj: Tiparo[];
}

export const TIPAROJ_SOURCE = "https://api.fontsource.org/v1/fonts";
export const TIPAROJ_URL = new URL("../data/tiparoj.json", import.meta.url);

/** The licences a webfont may carry into a package or the Make Kit (K-3: open source, permissive). */
export const TIPARO_LICENSES: readonly string[] = [
  "OFL-1.1",
  "Apache-2.0",
  "UFL-1.0",
  "CC0-1.0",
  "MIT",
  "Unlicense",
];

const LICENSE_BY_LOWER = new Map(
  TIPARO_LICENSES.map((license) => [license.toLowerCase(), license]),
);

/**
 * Fontsource subsets → ISO 15924. `null`: no writing system (symbols, maths, emoji). A subset not
 * listed here drops out; the import names it, so the list grows with the catalogue.
 */
export const SUBSET_SCRIPTS: Readonly<Record<string, string | null>> = {
  latin: "Latn",
  "latin-ext": "Latn",
  vietnamese: "Latn",
  cyrillic: "Cyrl",
  "cyrillic-ext": "Cyrl",
  greek: "Grek",
  "greek-ext": "Grek",
  japanese: "Jpan",
  korean: "Kore",
  "chinese-simplified": "Hans",
  "chinese-traditional": "Hant",
  "chinese-hongkong": "Hant",
  devanagari: "Deva",
  hebrew: "Hebr",
  arabic: "Arab",
  thai: "Thai",
  khmer: "Khmr",
  telugu: "Telu",
  tamil: "Taml",
  gujarati: "Gujr",
  bengali: "Beng",
  kannada: "Knda",
  gurmukhi: "Guru",
  malayalam: "Mlym",
  sinhala: "Sinh",
  ethiopic: "Ethi",
  "canadian-aboriginal": "Cans",
  syriac: "Syrc",
  oriya: "Orya",
  armenian: "Armn",
  cherokee: "Cher",
  lao: "Laoo",
  adlam: "Adlm",
  tifinagh: "Tfng",
  lisu: "Lisu",
  runic: "Runr",
  georgian: "Geor",
  myanmar: "Mymr",
  tibetan: "Tibt",
  mongolian: "Mong",
  javanese: "Java",
  balinese: "Bali",
  sundanese: "Sund",
  tagalog: "Tglg",
  thaana: "Thaa",
  "ol-chiki": "Olck",
  vai: "Vaii",
  nko: "Nkoo",
  osage: "Osge",
  coptic: "Copt",
  gothic: "Goth",
  glagolitic: "Glag",
  "old-italic": "Ital",
  ogham: "Ogam",
  samaritan: "Samr",
  mandaic: "Mand",
  "meetei-mayek": "Mtei",
  chakma: "Cakm",
  lepcha: "Lepc",
  limbu: "Limb",
  "new-tai-lue": "Talu",
  "tai-le": "Tale",
  "tai-tham": "Lana",
  "tai-viet": "Tavt",
  cham: "Cham",
  "kayah-li": "Kali",
  rejang: "Rjng",
  saurashtra: "Saur",
  "syloti-nagri": "Sylo",
  buginese: "Bugi",
  batak: "Batk",
  bamum: "Bamu",
  shavian: "Shaw",
  deseret: "Dsrt",
  osmanya: "Osma",
  "old-turkic": "Orkh",
  avestan: "Avst",
  kharoshthi: "Khar",
  brahmi: "Brah",
  kaithi: "Kthi",
  "sora-sompeng": "Sora",
  sharada: "Shrd",
  takri: "Takr",
  grantha: "Gran",
  khojki: "Khoj",
  khudawadi: "Sind",
  mahajani: "Mahj",
  modi: "Modi",
  multani: "Mult",
  siddham: "Sidd",
  tirhuta: "Tirh",
  newa: "Newa",
  bhaiksuki: "Bhks",
  marchen: "Marc",
  "masaram-gondi": "Gonm",
  "gunjala-gondi": "Gong",
  dogra: "Dogr",
  medefaidrin: "Medf",
  "hanifi-rohingya": "Rohg",
  "old-sogdian": "Sogo",
  sogdian: "Sogd",
  elymaic: "Elym",
  nandinagari: "Nand",
  "nyiakeng-puachue-hmong": "Hmnp",
  wancho: "Wcho",
  yezidi: "Yezi",
  chorasmian: "Chrs",
  "dives-akuru": "Diak",
  "khitan-small-script": "Kits",
  tangsa: "Tnsa",
  toto: "Toto",
  vithkuqi: "Vith",
  kawi: "Kawi",
  "nag-mundari": "Nagm",
  elbasan: "Elba",
  "caucasian-albanian": "Aghb",
  lycian: "Lyci",
  carian: "Cari",
  lydian: "Lydi",
  "old-north-arabian": "Narb",
  "old-south-arabian": "Sarb",
  "old-permic": "Perm",
  "pahawh-hmong": "Hmng",
  miao: "Plrd",
  palmyrene: "Palm",
  nabataean: "Nbat",
  hatran: "Hatr",
  manichaean: "Mani",
  "psalter-pahlavi": "Phlp",
  "inscriptional-pahlavi": "Phli",
  "inscriptional-parthian": "Prti",
  "old-persian": "Xpeo",
  ugaritic: "Ugar",
  "imperial-aramaic": "Armi",
  phoenician: "Phnx",
  "linear-a": "Lina",
  "linear-b": "Linb",
  cuneiform: "Xsux",
  "egyptian-hieroglyphs": "Egyp",
  "anatolian-hieroglyphs": "Hluw",
  cypriot: "Cprt",
  "cypro-minoan": "Cpmn",
  "old-uyghur": "Ougr",
  "old-hungarian": "Hung",
  tangut: "Tang",
  nushu: "Nshu",
  soyombo: "Soyo",
  "zanabazar-square": "Zanb",
  mro: "Mroo",
  "bassa-vah": "Bass",
  "pau-cin-hau": "Pauc",
  duployan: "Dupl",
  "mende-kikakui": "Mend",
  ahom: "Ahom",
  "warang-citi": "Wara",
  braille: "Brai",
  math: null,
  symbols: null,
  symbols2: null,
  emoji: null,
  music: null,
  menu: null,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The SPDX licence of the allowlist a text names (case aside), or nothing. */
export function normalizeLicense(text: unknown): string | undefined {
  return typeof text === "string" ? LICENSE_BY_LOWER.get(text.trim().toLowerCase()) : undefined;
}

/**
 * One entry of the Fontsource list as a Tiparo: with its SPDX licence and at least one writing
 * system, else nothing (§4.7: without a licence no take-over).
 */
export function tiparoFrom(raw: unknown): Tiparo | undefined {
  if (!isRecord(raw) || typeof raw.id !== "string" || typeof raw.family !== "string")
    return undefined;
  const license = normalizeLicense(raw.license);
  if (license === undefined) return undefined;
  const subsets = Array.isArray(raw.subsets)
    ? raw.subsets.filter((s) => typeof s === "string")
    : [];
  const scripts = [
    ...new Set(
      subsets
        .map((subset) => SUBSET_SCRIPTS[subset])
        .filter((script): script is string => typeof script === "string"),
    ),
  ].sort();
  if (scripts.length === 0) return undefined;
  return {
    id: raw.id,
    family: raw.family,
    license,
    category: typeof raw.category === "string" ? raw.category : "",
    scripts,
    variable: raw.variable === true,
  };
}

/** The subsets of a raw list this module does not know, for the import to name. */
export function unknownSubsets(raw: readonly unknown[]): string[] {
  const unknown = new Set<string>();
  for (const entry of raw) {
    if (!isRecord(entry) || !Array.isArray(entry.subsets)) continue;
    for (const subset of entry.subsets) {
      if (typeof subset === "string" && !(subset in SUBSET_SCRIPTS)) unknown.add(subset);
    }
  }
  return [...unknown].sort();
}

/** The catalogue of a raw Fontsource list, sorted by id, with its provenance. */
export function catalogueOf(raw: readonly unknown[], date: string): Tiparoj {
  const tiparoj = raw
    .map(tiparoFrom)
    .filter((tiparo): tiparo is Tiparo => tiparo !== undefined)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return {
    provenance: {
      source: TIPAROJ_SOURCE,
      date,
      read: "Fontsource API v1 (family list with licence metadata), read by the Metiejo import; only families with an SPDX licence of the allowlist and at least one writing system kept",
      count: tiparoj.length,
      dropped: raw.length - tiparoj.length,
    },
    tiparoj,
  };
}

/** The bytes of data/tiparoj.json: the provenance, then one line per family. */
export function serializeTiparoj(tiparoj: Tiparoj): string {
  const lines = tiparoj.tiparoj.map((tiparo) => `  ${JSON.stringify(tiparo)}`);
  return `{\n "provenance": ${JSON.stringify(tiparoj.provenance)},\n "tiparoj": [\n${lines.join(",\n")}\n ]\n}\n`;
}

let cached: Tiparoj | undefined;

/** The catalogue of this package (I/O edge, read once). */
export function readTiparoj(): Tiparoj {
  cached ??= JSON.parse(readFileSync(TIPAROJ_URL, "utf8")) as Tiparoj;
  return cached;
}

const fold = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]+/g, "");

/** The families a query names: the exact name first, then names that start with it, then contain it. */
export function searchTiparoj(tiparoj: Tiparoj, query: string, limit = 12): Tiparo[] {
  const needle = fold(query);
  if (needle === "") return [];
  const scored: { score: number; tiparo: Tiparo }[] = [];
  for (const tiparo of tiparoj.tiparoj) {
    const family = fold(tiparo.family);
    const id = fold(tiparo.id);
    const score =
      family === needle
        ? 0
        : family.startsWith(needle)
          ? 1
          : family.includes(needle)
            ? 2
            : id.includes(needle)
              ? 3
              : -1;
    if (score >= 0) scored.push({ score, tiparo });
  }
  return scored
    .sort((a, b) => a.score - b.score || a.tiparo.family.localeCompare(b.tiparo.family, "en"))
    .slice(0, limit)
    .map((entry) => entry.tiparo);
}

/** The Fonto of a webfont for the Agordo (K-3): licence, source, redistributable, scripts. */
export function fontoOf(tiparo: Tiparo): Fonto {
  return {
    family: tiparo.family,
    license: tiparo.license,
    source: `https://fontsource.org/fonts/${tiparo.id}`,
    redistributable: true,
    scripts: [...tiparo.scripts],
  };
}

/** What a licensed font says of itself in the brand (K-3). */
export const LICENCED_NOTE = "lizenziert, nicht enthalten";

/**
 * The Fonto of a licensed font (K-3): the name, "lizenziert, nicht enthalten", never redistributable.
 * The fallback comes from the structure: the font.family token keeps the stack behind the name.
 */
export function licencedFonto(family: string, scripts: readonly string[]): Fonto {
  return {
    family,
    license: "proprietary",
    source: `${LICENCED_NOTE}; die Datei liegt im privaten Repo des Markeninhabers (FM_TIPAROJ_REPO)`,
    redistributable: false,
    scripts: scripts.length === 0 ? ["Latn"] : [...scripts],
  };
}

const CDN = "https://cdn.jsdelivr.net/fontsource/fonts";

/**
 * The `@font-face` rules the preview loads a webfont with: the Latin subset in the regular and the
 * bold weight from the Fontsource CDN over https. The package carries no font file (K-3: the
 * Aspekto names the family and its licence; the files travel with the project that uses them).
 */
export function fontFaceCss(tiparo: Tiparo): string {
  if (!tiparo.scripts.includes("Latn")) return "";
  const family = JSON.stringify(tiparo.family);
  return [400, 700]
    .map(
      (weight) =>
        `@font-face { font-family: ${family}; font-style: normal; font-weight: ${weight}; font-display: swap; src: url(${CDN}/${tiparo.id}@latest/latin-${weight}-normal.woff2) format("woff2"); }`,
    )
    .join("\n");
}
