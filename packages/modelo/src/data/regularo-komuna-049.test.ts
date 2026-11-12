// Spec 049 (KIA-1.1): the 24 approved Reguloj of komuna, as package Reguloj in
// `packages/aspekto-komuna/reguloj.json` (aspekto komuna, manual, appliesTo.tokens). Checks the file
// against its schema, the repo Modelo against the approved table (tech spec §5, implementation
// spec §2.2), the ids against komuna's ids.lock.json, the names against the core and the ekzemplo
// project, and the table against the komuna gaps Spec 048 measured (`specs/048-…/luecken.json`,
// hashed by this package's test task through `specs/**`).

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "../contracts/ajv.js";
import { matchesTokenPattern } from "../contracts/grammar.js";
import type { Modelo } from "../contracts/modelo.js";
import { SCHEMA_DEFS } from "../contracts/schema.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, projectModeloSource } from "../load/source.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";

const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

// The approved table: Regulo name → `appliesTo.tokens` → the komuna decisions without reason it
// closes (the same table as packages/metiejo/src/grafeo-kialo-049.test.ts).
const TABELO: readonly { name: string; tokens: readonly string[]; luecken: readonly string[] }[] = [
  {
    name: "komuna-dauer-null",
    tokens: ["motion.duration.scale.0"],
    luecken: ["motion.duration.scale.0"],
  },
  {
    name: "komuna-kurven",
    tokens: ["motion.easing.curve.*"],
    luecken: [
      "motion.easing.curve.accelerate",
      "motion.easing.curve.decelerate",
      "motion.easing.curve.expressive",
      "motion.easing.curve.linear",
    ],
  },
  {
    name: "komuna-ebenen",
    tokens: ["elevation.layer.*"],
    luecken: [
      "elevation.layer.base",
      "elevation.layer.modal",
      "elevation.layer.navigation",
      "elevation.layer.overlay",
      "elevation.layer.raised",
      "elevation.layer.toast",
    ],
  },
  {
    name: "komuna-syntax-schluesselwort",
    tokens: ["color.syntax.keyword"],
    luecken: ["color.syntax.keyword"],
  },
  { name: "komuna-syntax-name", tokens: ["color.syntax.name"], luecken: ["color.syntax.name"] },
  {
    name: "komuna-syntax-zeichenkette",
    tokens: ["color.syntax.string"],
    luecken: ["color.syntax.string"],
  },
  { name: "komuna-syntax-zahl", tokens: ["color.syntax.number"], luecken: ["color.syntax.number"] },
  {
    name: "komuna-syntax-kommentar",
    tokens: ["color.syntax.comment"],
    luecken: ["color.syntax.comment"],
  },
  {
    name: "komuna-randbreiten",
    tokens: ["border.width.scale.*"],
    luecken: ["border.width.scale.1", "border.width.scale.2", "border.width.scale.3"],
  },
  { name: "komuna-rand-betont", tokens: ["border.width.strong"], luecken: ["border.width.strong"] },
  {
    name: "komuna-rundung-bedienelement",
    tokens: ["radius.role.control"],
    luecken: ["radius.role.control"],
  },
  {
    name: "komuna-rundung-mehrzeilig",
    tokens: ["radius.role.multiline"],
    luecken: ["radius.role.multiline"],
  },
  { name: "komuna-rundung-pille", tokens: ["radius.role.pill"], luecken: ["radius.role.pill"] },
  {
    name: "komuna-rundung-flaeche",
    tokens: ["radius.role.surface"],
    luecken: ["radius.role.surface"],
  },
  { name: "komuna-rundung-tag", tokens: ["radius.role.tag"], luecken: ["radius.role.tag"] },
  { name: "komuna-strichart", tokens: ["stroke.*"], luecken: ["stroke.dashed", "stroke.solid"] },
  {
    name: "komuna-groessen",
    tokens: ["size.scale.*"],
    luecken: [
      "size.scale.100",
      "size.scale.1000",
      "size.scale.200",
      "size.scale.300",
      "size.scale.400",
      "size.scale.500",
      "size.scale.600",
      "size.scale.900",
    ],
  },
  {
    name: "komuna-spalten",
    tokens: ["layout.columns.*"],
    luecken: ["layout.columns.12", "layout.columns.4", "layout.columns.8"],
  },
  {
    name: "komuna-umbrueche",
    tokens: ["size.breakpoint.*"],
    luecken: ["size.breakpoint.expanded", "size.breakpoint.medium"],
  },
  {
    name: "komuna-container",
    tokens: ["size.container.*"],
    luecken: [
      "size.container.large",
      "size.container.max",
      "size.container.medium",
      "size.container.small",
    ],
  },
  {
    name: "komuna-schriftfamilien",
    tokens: ["font.family.*"],
    luecken: ["font.family.body", "font.family.code", "font.family.display"],
  },
  {
    name: "komuna-zeilenhoehen",
    tokens: ["font.lineheight.scale.*"],
    luecken: [
      "font.lineheight.scale.loose",
      "font.lineheight.scale.normal",
      "font.lineheight.scale.relaxed",
      "font.lineheight.scale.snug",
      "font.lineheight.scale.solid",
      "font.lineheight.scale.tight",
    ],
  },
  {
    name: "komuna-laufweite",
    tokens: ["font.tracking.scale.*"],
    luecken: [
      "font.tracking.scale.100",
      "font.tracking.scale.1000",
      "font.tracking.scale.1100",
      "font.tracking.scale.1200",
      "font.tracking.scale.200",
      "font.tracking.scale.300",
      "font.tracking.scale.400",
      "font.tracking.scale.500",
      "font.tracking.scale.600",
      "font.tracking.scale.700",
      "font.tracking.scale.800",
      "font.tracking.scale.900",
      "font.tracking.scale.caps",
    ],
  },
  {
    name: "komuna-schriftgewichte",
    tokens: ["font.weight.*"],
    luecken: [
      "font.weight.black",
      "font.weight.bold",
      "font.weight.extrabold",
      "font.weight.extralight",
      "font.weight.light",
      "font.weight.medium",
      "font.weight.regular",
      "font.weight.semibold",
      "font.weight.thin",
    ],
  },
];

const KOMUNA_DIR = new URL("../../../aspekto-komuna/", import.meta.url);
const REGULOJ_FILE = fileURLToPath(new URL("reguloj.json", KOMUNA_DIR));
const LUECKEN_048 = new URL(
  "../../../../specs/048-nodredaktilo-grupoj-kialoj/luecken.json",
  import.meta.url,
);

const json = (file: string | URL): unknown => JSON.parse(readFileSync(file, "utf8"));

function modeloOf(source: Parameters<typeof loadModelo>[0], what: string): Modelo {
  const { modelo } = loadModelo(source);
  if (modelo === undefined) throw new Error(`${what} must load`);
  return modelo;
}

const modelo = modeloOf(defaultModeloSource(), "the repo Modelo");
const komunaReguloj = modelo.reguloj.filter((regulo) => regulo.aspekto === "komuna");

/** Every distinct token name over every set of a Modelo. */
const tokenNomoj = (m: Modelo): string[] => [
  ...new Set(m.setoj.flatMap((set) => Object.keys(set.tokens))),
];

describe("Spec 049: komuna's package Reguloj (AC-3)", () => {
  it("has a schema-valid reguloj.json, sorted by id", () => {
    expect(existsSync(REGULOJ_FILE), `${REGULOJ_FILE} is missing`).toBe(true);
    const file = json(REGULOJ_FILE) as { reguloj?: { id: string }[] };
    const validate = getModeloValidator(createModeloAjv(), SCHEMA_DEFS.regulojFile);
    expect(validate(file), JSON.stringify(validate.errors)).toBe(true);
    const ids = (file.reguloj ?? []).map(({ id }) => id);
    expect(ids).toEqual([...ids].sort(compareText));
  });

  it("are exactly the 24 approved names, each manual with the table's patterns and a kialo", () => {
    expect(komunaReguloj.map(({ name }) => name).sort(compareText)).toEqual(
      TABELO.map(({ name }) => name).sort(compareText),
    );
    const befunde: string[] = [];
    for (const vico of TABELO) {
      const regulo = komunaReguloj.find((entry) => entry.name === vico.name);
      if (regulo === undefined) continue;
      if (regulo.checkability !== "manual") befunde.push(`${vico.name}: ${regulo.checkability}`);
      if (JSON.stringify(regulo.appliesTo) !== JSON.stringify({ tokens: vico.tokens }))
        befunde.push(`${vico.name}: appliesTo ${JSON.stringify(regulo.appliesTo)}`);
      if (regulo.kialo.trim() === "") befunde.push(`${vico.name}: empty kialo`);
      if (!regulo.scope.startsWith("aspekto komuna:"))
        befunde.push(`${vico.name}: scope ${regulo.scope}`);
    }
    expect(befunde).toEqual([]);
  });

  it("has patterns that each match at least one token of the Modelo", () => {
    const nomoj = tokenNomoj(modelo);
    const patterns = [
      ...TABELO.flatMap(({ tokens }) => tokens),
      ...komunaReguloj.flatMap((regulo) => regulo.appliesTo?.tokens ?? []),
    ];
    const senTrafo = patterns.filter(
      (pattern) => !nomoj.some((name) => matchesTokenPattern(pattern, name)),
    );
    expect(senTrafo).toEqual([]);
  });

  it("has every id active as a regulo in komuna's ids.lock.json", () => {
    const lock = json(new URL("ids.lock.json", KOMUNA_DIR)) as {
      ids: Record<string, { status?: string; type?: string }>;
    };
    expect(komunaReguloj).toHaveLength(TABELO.length);
    const befunde = komunaReguloj
      .filter((regulo) => {
        const entry = lock.ids[regulo.id];
        return entry?.status !== "active" || entry.type !== "regulo";
      })
      .map(({ id, name }) => `${name}: ${id}`);
    expect(befunde).toEqual([]);
  });

  it("has names that are unique in the repo Modelo and in the ekzemplo project", () => {
    const ekzemplo = modeloOf(
      projectModeloSource(`${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`),
      "core + komuna + ekzemplo",
    );
    const befunde: string[] = [];
    for (const [nomo, m] of [
      ["repo", modelo],
      ["ekzemplo", ekzemplo],
    ] as const) {
      for (const { name } of TABELO) {
        const n = m.reguloj.filter((regulo) => regulo.name === name).length;
        if (n !== 1) befunde.push(`${nomo}: ${name} ${n}×`);
      }
      const names = m.reguloj.map((regulo) => regulo.name);
      const doubles = names.filter((name, index) => names.indexOf(name) !== index);
      if (doubles.length > 0) befunde.push(`${nomo}: doubles ${doubles.join(", ")}`);
    }
    expect(befunde).toEqual([]);
  });
});

describe("Spec 049: the table against the komuna gaps of Spec 048", () => {
  const luecken048 = (json(LUECKEN_048) as { komuna: Record<string, string[]> }).komuna;
  const komuna048 = Object.values(luecken048).flat().sort(compareText);

  it("closes exactly the komuna decisions without reason of Spec 048", () => {
    const tabelo = TABELO.flatMap(({ luecken }) => luecken).sort(compareText);
    expect(tabelo).toEqual(komuna048);
    expect(new Set(tabelo).size).toBe(tabelo.length);
  });

  it("assigns each gap to the row whose patterns match it, and to no other row", () => {
    const befunde: string[] = [];
    for (const token of komuna048) {
      const rows = TABELO.filter(({ tokens }) =>
        tokens.some((pattern) => matchesTokenPattern(pattern, token)),
      ).map(({ name }) => name);
      const assigned = TABELO.find(({ luecken }) => luecken.includes(token))?.name;
      if (rows.length !== 1 || rows[0] !== assigned)
        befunde.push(`${token}: patterns of ${rows.join(", ") || "no row"}, table ${assigned}`);
    }
    expect(befunde).toEqual([]);
  });
});
