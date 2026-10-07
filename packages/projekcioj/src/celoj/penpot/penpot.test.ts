import { projectModeloSource } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { type CeloInput, celoInputOf } from "../../build.js";
import {
  assertConjunctionsInGroups,
  PENPOT_CELO,
  PenpotCeloError,
  penpotApplicationOrder,
  penpotFolders,
  penpotType,
} from "./penpot.js";
import { activate, importPenpotFolder, type PenpotToken } from "./test-doubles/penpot.js";

const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
  import.meta.url,
).pathname;
const prepared = celoInputOf(projectModeloSource(config));
if (!prepared.ok) throw new Error("core + ekzemplo must be valid");
const input: CeloInput = prepared.input;
const folders = penpotFolders(input);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A Modelo value, made comparable: a colour as #rrggbbaa, a px dimension as its number. */
function fromModelo(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(fromModelo);
  if (!isRecord(value)) return value;
  if (typeof value.hex === "string" && "colorSpace" in value) {
    const alpha = typeof value.alpha === "number" ? value.alpha : 1;
    return `${value.hex.toLowerCase()}${Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0")}`;
  }
  if (value.unit === "px" && typeof value.value === "number") return value.value;
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fromModelo(v)]));
}

/** A value as Penpot reads it, made comparable: "16" as 16, "#rrggbb" as #rrggbbff. */
function fromPenpot(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(fromPenpot);
  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fromPenpot(v)]));
  }
  if (typeof value !== "string") return value;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (/^#[0-9a-f]{6}$/i.test(value)) return `${value.toLowerCase()}ff`;
  if (/^#[0-9a-f]{8}$/i.test(value)) return value.toLowerCase();
  return value;
}

function walkTokens(
  tree: unknown,
  visit: (name: string, token: Record<string, unknown>) => void,
  prefix = "",
): void {
  if (!isRecord(tree)) return;
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith("$") || !isRecord(node)) continue;
    const name = prefix === "" ? key : `${prefix}.${key}`;
    if ("$value" in node) visit(name, node);
    else walkTokens(node, visit, name);
  }
}

describe("Penpot Celo: one folder per Aspekto", () => {
  it("writes komuna and ekzemplo, each with $themes.json and $metadata.json", () => {
    expect(Object.keys(folders)).toEqual(["ekzemplo", "komuna"]);
    const paths = PENPOT_CELO.generate(input).map((file) => file.path);
    expect(paths).toContain("penpot/komuna/$themes.json");
    expect(paths).toContain("penpot/ekzemplo/$metadata.json");
  });

  it("names every set file after the set name the themes use", () => {
    for (const [aspekto, files] of Object.entries(folders)) {
      const metadata = JSON.parse(files["$metadata.json"] ?? "{}") as { tokenSetOrder: string[] };
      const fileSets = Object.keys(files)
        .filter((file) => !file.startsWith("$"))
        .map((file) => file.slice(0, -".json".length));
      expect(fileSets.sort(), aspekto).toEqual([...metadata.tokenSetOrder].sort());
      const themes = JSON.parse(files["$themes.json"] ?? "[]") as {
        selectedTokenSets: Record<string, string>;
      }[];
      for (const theme of themes) {
        for (const set of Object.keys(theme.selectedTokenSets)) expect(fileSets).toContain(set);
      }
    }
  });

  it("is byte-identical over two runs", () => {
    expect(PENPOT_CELO.generate(input)).toEqual(PENPOT_CELO.generate(input));
  });
});

describe("Penpot Celo: values and types as Penpot reads them", () => {
  it("writes dimensions and colours as strings, never as DTCG objects", () => {
    for (const files of Object.values(folders)) {
      for (const [path, text] of Object.entries(files)) {
        if (path.startsWith("$")) continue;
        walkTokens(JSON.parse(text), (name, token) => {
          if (!["dimension", "fontSizes", "letterSpacing", "color"].includes(String(token.$type))) {
            return;
          }
          expect(typeof token.$value, `${path} ${name}`).toBe("string");
        });
      }
    }
    const core = JSON.parse(folders.komuna?.["core.json"] ?? "{}");
    expect(core.spacing.scale["100"].$value).toBe("4");
    expect(core.color.palette.neutral["0"].$value).toMatch(/^#[0-9a-f]{6}$/);
    expect(core.color.palette.shade["0"].$value).toBe("#00000000");
  });

  it("types font sizes, letter spacing and opacity the way Penpot's fields ask", () => {
    expect(penpotType("font.size.body.1", "dimension")).toBe("fontSizes");
    expect(penpotType("font.size.scale.100", "dimension")).toBe("fontSizes");
    expect(penpotType("font.tracking.body.1", "dimension")).toBe("letterSpacing");
    expect(penpotType("opacity.disabled", "number")).toBe("opacity");
    expect(penpotType("spacing.medium", "dimension")).toBe("dimension");
    expect(penpotType("font.lineheight.body.1", "number")).toBe("number");
    expect(penpotType("font.family.body", "fontFamily")).toBe("fontFamilies");
    expect(penpotType("font.weight.bold", "fontWeight")).toBe("fontWeights");
    expect(penpotType("border.default", "border")).toBeUndefined();
  });

  // The table is keyed on names; the typography composites are the Modelo's own statement of what
  // a font size is. Both must agree, or the table has fallen behind the Vortaro.
  it("agrees with the typography composites about what a font size and a letter spacing are", () => {
    const tokens = new Map(input.modeloJson.tokens.map((token) => [token.name, token.type]));
    const core = input.modeloJson.setoj.find((set) => set.name === "core")?.tree;
    const flows = new Map<string, Set<string>>();
    const values = new Map<string, unknown>();
    walkTokens(core, (name, token) => values.set(name, token.$value));
    const follow = (value: unknown, field: string) => {
      const match = typeof value === "string" ? /^\{([^}]+)\}$/.exec(value) : null;
      if (match?.[1] === undefined) return;
      const target = match[1];
      if (!flows.has(field)) flows.set(field, new Set());
      flows.get(field)?.add(target);
      follow(values.get(target), field);
    };
    for (const [name, value] of values) {
      if (tokens.get(name) !== "typography" || !isRecord(value)) continue;
      follow(value.fontSize, "fontSize");
      follow(value.letterSpacing, "letterSpacing");
    }
    for (const name of flows.get("fontSize") ?? []) {
      expect(penpotType(name, "dimension"), name).toBe("fontSizes");
    }
    for (const name of flows.get("letterSpacing") ?? []) {
      expect(penpotType(name, "dimension"), name).toBe("letterSpacing");
    }
    expect(flows.get("fontSize")?.size).toBeGreaterThan(10);
  });

  it("keeps the tokens Penpot cannot read, in DTCG form, and each such type has a Manko", () => {
    for (const files of Object.values(folders)) {
      const core = JSON.parse(files["core.json"] ?? "{}");
      expect(core.border.default.$type).toBe("border");
      expect(core.motion.duration.scale["0"].$value).toEqual({ unit: "ms", value: 0 });
    }
    const withoutMankoj: CeloInput = { ...input, modeloJson: { ...input.modeloJson, mankoj: [] } };
    expect(() => penpotFolders(withoutMankoj)).toThrow(PenpotCeloError);
    expect(() => penpotFolders(withoutMankoj)).toThrow(/\$type border.*Manko/);
  });

  it("refuses a dimension in a unit Penpot does not read, naming the token", () => {
    const modeloJson = structuredClone(input.modeloJson);
    const core = modeloJson.setoj.find((set) => set.name === "core");
    if (core === undefined) throw new Error("no core");
    const tree = core.tree as { spacing: { scale: Record<string, { $value: unknown }> } };
    const step = tree.spacing.scale["100"];
    if (step === undefined) throw new Error("no spacing.scale.100");
    step.$value = { unit: "rem", value: 1 };
    expect(() => penpotFolders({ ...input, modeloJson })).toThrow(/spacing\.scale\.100.*rem/);
  });
});

describe("Penpot Celo: themes from the conjunctions", () => {
  const themesOf = (aspekto: string) =>
    JSON.parse(folders[aspekto]?.["$themes.json"] ?? "[]") as {
      group: string;
      name: string;
      selectedTokenSets: Record<string, string>;
    }[];

  it("joins the Dimensioj a conjunction set ties together into one group, one theme per combination", () => {
    for (const aspekto of ["komuna", "ekzemplo"]) {
      const groups = [...new Set(themesOf(aspekto).map((theme) => theme.group))];
      expect(groups, aspekto).toEqual(["viewport", "density", "color-scheme+contrast", "motion"]);
      expect(
        themesOf(aspekto)
          .filter((theme) => theme.group === "color-scheme+contrast")
          .map((theme) => theme.name),
      ).toEqual(["light+default", "light+high", "dark+default", "dark+high"]);
    }
  });

  it("folds the brand into the sets: no aspekto group, no aspekto set", () => {
    for (const [aspekto, files] of Object.entries(folders)) {
      expect(
        Object.keys(files).some((file) => file.startsWith("aspekto/")),
        aspekto,
      ).toBe(false);
      expect(themesOf(aspekto).some((theme) => theme.group === "aspekto")).toBe(false);
    }
  });

  it("activates the default of every group right after the import", () => {
    const metadata = JSON.parse(folders.komuna?.["$metadata.json"] ?? "{}");
    expect(metadata.activeThemes).toEqual([
      "viewport/medium",
      "density/default",
      "color-scheme+contrast/light+default",
      "motion/default",
    ]);
  });

  // Penpot applies sets folder by folder, not in tokenSetOrder (measured 2026-10-07: with the
  // canonical name color-scheme/dark+contrast/high, 30 tokens were wrong in dark/high).
  it("names a conjunction set from its highest Dimensio, so Penpot's folders keep the order", () => {
    for (const files of Object.values(folders)) {
      expect(files["contrast/high+color-scheme/dark.json"]).toBeDefined();
      const { tokenSetOrder } = JSON.parse(files["$metadata.json"] ?? "{}");
      expect(penpotApplicationOrder(tokenSetOrder)).toEqual(tokenSetOrder);
    }
    expect(Object.keys(folders.ekzemplo ?? {})).toContain("contrast/high+color-scheme/light.json");
  });

  it("finds the order Penpot would break: the folder tree, not tokenSetOrder", () => {
    expect(
      penpotApplicationOrder([
        "core",
        "color-scheme/dark",
        "color-scheme/dark+contrast/high",
        "contrast/high",
      ]),
    ).toEqual(["core", "color-scheme/dark", "color-scheme/dark+contrast/high", "contrast/high"]);
    expect(
      penpotApplicationOrder([
        "core",
        "color-scheme/dark",
        "contrast/high",
        "color-scheme/dark+contrast/high",
      ]),
    ).toEqual(["core", "color-scheme/dark", "color-scheme/dark+contrast/high", "contrast/high"]);
  });

  it("stops with a named cause when a conjunction set spans two groups", () => {
    const sets = [
      {
        name: "color-scheme/dark+motion/reduced",
        conditions: [
          ["color-scheme", "dark"],
          ["motion", "reduced"],
        ] as [string, string][],
      },
    ];
    expect(() =>
      assertConjunctionsInGroups(sets, [["color-scheme", "contrast"], ["motion"]]),
    ).toThrow(/color-scheme\/dark\+motion\/reduced.*color-scheme.*motion/);
    expect(() => assertConjunctionsInGroups(sets, [["color-scheme", "motion"]])).not.toThrow();
  });
});

// Abnahme: every combination resolves in Penpot exactly as the resolver resolves it. The table of
// the report (light/dark × default/high) is the template; here every combination of every
// Dimensio is checked, per Aspekto.
describe("Penpot Celo: Abnahme against rezolvoj.json", () => {
  for (const aspekto of ["komuna", "ekzemplo"]) {
    it(`${aspekto}: every combination, 0 deviations; only the Manko types are skipped`, () => {
      const file = importPenpotFolder(folders[aspekto] ?? {});
      expect([...new Set(file.skipped.values())].sort()).toEqual([
        "border",
        "cubicBezier",
        "duration",
        "strokeStyle",
      ]);
      expect(file.skipped.size).toBe(24);
      const rezolvoj = input.rezolvoj.rezolvoj.filter((r) => r.assignment.aspekto === aspekto);
      expect(rezolvoj.length).toBe(72);
      const deviations: string[] = [];
      for (const rezolvo of rezolvoj) {
        const assignment = rezolvo.assignment as Record<string, string>;
        const active = file.themes
          .filter((theme) =>
            theme.group
              .split("+")
              .every((dimensio, index) => assignment[dimensio] === theme.name.split("+")[index]),
          )
          .map((theme) => `${theme.group}/${theme.name}`);
        expect(active.length).toBe(4);
        const shown: Map<string, PenpotToken> = activate(file, active);
        for (const [name, token] of Object.entries(rezolvo.tokens)) {
          if (file.skipped.has(name)) continue;
          const got = shown.get(name);
          if (JSON.stringify(fromPenpot(got?.value)) !== JSON.stringify(fromModelo(token.value))) {
            deviations.push(`${JSON.stringify(assignment)} ${name}`);
          }
        }
      }
      expect(deviations.slice(0, 5)).toEqual([]);
      expect(deviations.length).toBe(0);
    });
  }
});
