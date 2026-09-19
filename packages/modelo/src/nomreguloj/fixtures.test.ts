import { describe, expect, it } from "vitest";
import type { DtcgType } from "../contracts/index.js";
import {
  CELOJ,
  type Celo,
  checkTokenName,
  isNoTarget,
  NOM_REGULOJ,
  nomRegulo,
  TokenNameError,
} from "./index.js";

// Fixture tables per Celo (AK-03: at least ten per Celo, edge cases included). Each row is
// `[canonical name, expected target]`; derive and invert are both checked against it.
type Row = readonly [name: string, target: string];

const CSS_FIXTURES: readonly Row[] = [
  ["color.action.primary.rest", "--fm-color-action-primary-rest"],
  ["color.palette.blue.600", "--fm-color-palette-blue-600"],
  ["color.h2o.a1b2", "--fm-color-h2o-a1b2"],
  ["space.2x", "--fm-space-2x"],
  ["opacity", "--fm-opacity"],
  ["color.text.default", "--fm-color-text-default"],
  ["class.new.default", "--fm-class-new-default"],
  ["a.b.c.d.e.f.g.h.i.j", "--fm-a-b-c-d-e-f-g-h-i-j"],
  ["spacing.4", "--fm-spacing-4"],
  ["radius.md", "--fm-radius-md"],
  ["font.sans", "--fm-font-sans"],
  ["font.weight.bold", "--fm-font-weight-bold"],
  ["shadow.lg", "--fm-shadow-lg"],
  ["ease.out", "--fm-ease-out"],
  ["duration.fast", "--fm-duration-fast"],
  ["0", "--fm-0"],
];

const FIGMA_FIXTURES: readonly Row[] = [
  ["color.action.primary.rest", "color/action/primary/rest"],
  ["color.palette.blue.600", "color/palette/blue/600"],
  ["color.h2o.a1b2", "color/h2o/a1b2"],
  ["space.2x", "space/2x"],
  ["opacity", "opacity"],
  ["color.text.default", "color/text/default"],
  ["class.new.default", "class/new/default"],
  ["a.b.c.d.e.f.g.h.i.j", "a/b/c/d/e/f/g/h/i/j"],
  ["spacing.4", "spacing/4"],
  ["font.weight.bold", "font/weight/bold"],
  ["duration.fast", "duration/fast"],
  ["0", "0"],
];

const TYPESCRIPT_FIXTURES: readonly Row[] = [
  ["color.action.primary.rest", "vortaro.color.action.primary.rest"],
  ["color.palette.blue.600", 'vortaro.color.palette.blue["600"]'],
  ["color.h2o.a1b2", "vortaro.color.h2o.a1b2"],
  ["space.2x", 'vortaro.space["2x"]'],
  ["opacity", "vortaro.opacity"],
  ["color.text.default", "vortaro.color.text.default"],
  ["class.new.default", "vortaro.class.new.default"],
  ["a.b.c.d.e.f.g.h.i.j", "vortaro.a.b.c.d.e.f.g.h.i.j"],
  ["spacing.4", 'vortaro.spacing["4"]'],
  ["font.weight.bold", "vortaro.font.weight.bold"],
  ["0", 'vortaro["0"]'],
  ["z.007.x9", 'vortaro.z["007"].x9'],
];

const DTCG_FIXTURES: readonly Row[] = [
  ["color.action.primary.rest", "color.action.primary.rest"],
  ["color.palette.blue.600", "color.palette.blue.600"],
  ["color.h2o.a1b2", "color.h2o.a1b2"],
  ["space.2x", "space.2x"],
  ["opacity", "opacity"],
  ["color.text.default", "color.text.default"],
  ["class.new.default", "class.new.default"],
  ["a.b.c.d.e.f.g.h.i.j", "a.b.c.d.e.f.g.h.i.j"],
  ["spacing.4", "spacing.4"],
  ["font.weight.bold", "font.weight.bold"],
  ["0", "0"],
];

const STRING_FIXTURES: Readonly<Record<Exclude<Celo, "tailwind">, readonly Row[]>> = {
  css: CSS_FIXTURES,
  figma: FIGMA_FIXTURES,
  typescript: TYPESCRIPT_FIXTURES,
  dtcg: DTCG_FIXTURES,
};

// Tailwind: `[name, $type, target | null]`; `null` means NoTarget.
type TailwindRow = readonly [name: string, type: DtcgType | undefined, target: string | null];

const TAILWIND_FIXTURES: readonly TailwindRow[] = [
  ["color.action.primary.rest", "color", "--color-action-primary-rest"],
  ["color.palette.blue.600", "color", "--color-palette-blue-600"],
  ["color.h2o.a1b2", "color", "--color-h2o-a1b2"],
  ["color.class.new.default", "color", "--color-class-new-default"],
  ["color.a.b.c.d.e.f.g.h", "color", "--color-a-b-c-d-e-f-g-h"],
  ["spacing.4", "dimension", "--spacing-4"],
  ["spacing.0", "dimension", "--spacing-0"],
  ["radius.md", "dimension", "--radius-md"],
  ["font.sans", "fontFamily", "--font-sans"],
  ["font.weight.bold", "fontWeight", "--font-weight-bold"],
  ["font.weight.700", "fontWeight", "--font-weight-700"],
  ["shadow.lg", "shadow", "--shadow-lg"],
  ["ease.out", "cubicBezier", "--ease-out"],
  ["text.xl", "dimension", "--text-xl"],
  ["leading.tight", "number", "--leading-tight"],
  ["inset.shadow.sm", "shadow", "--inset-shadow-sm"],
  // No namespace for the first segment.
  ["duration.fast", "duration", null],
  ["opacity", "number", null],
  ["class.new.default", "color", null],
  // Namespace without a key.
  ["color", "color", null],
  ["font.weight", "fontWeight", null],
  // Namespace matches, but the $type is not allowed there.
  ["color.primary", "dimension", null],
  ["spacing.4", "color", null],
  ["font.weight.bold", "fontFamily", null],
  ["font.sans", "fontWeight", null],
  ["inset.sm", "shadow", null],
  // No $type given.
  ["color.primary", undefined, null],
];

describe.each(Object.entries(STRING_FIXTURES))("%s NomRegulo fixtures", (celo, rows) => {
  const regulo = nomRegulo(celo as Celo);

  it("has at least ten fixtures", () => {
    expect(rows.length).toBeGreaterThanOrEqual(10);
  });

  it.each(rows)("derives %s -> %s", (name, target) => {
    expect(regulo.derive(name)).toBe(target);
  });

  it.each(rows)("inverts %s <- %s", (name, target) => {
    expect(regulo.invert(target)).toBe(name);
  });
});

describe("tailwind NomRegulo fixtures", () => {
  const regulo = nomRegulo("tailwind");

  it("has at least ten fixtures with and ten without a target", () => {
    expect(TAILWIND_FIXTURES.filter((row) => row[2] !== null).length).toBeGreaterThanOrEqual(10);
    expect(TAILWIND_FIXTURES.filter((row) => row[2] === null).length).toBeGreaterThanOrEqual(10);
  });

  it("covers the namespaces color, spacing, radius, font, font-weight, shadow and ease", () => {
    const targets = TAILWIND_FIXTURES.flatMap((row) => (row[2] === null ? [] : [row[2]]));
    for (const prefix of [
      "--color-",
      "--spacing-",
      "--radius-",
      "--font-sans",
      "--font-weight-",
      "--shadow-",
      "--ease-",
    ]) {
      expect(
        targets.some((target) => target.startsWith(prefix)),
        prefix,
      ).toBe(true);
    }
  });

  it.each(TAILWIND_FIXTURES)("derives %s ($type %s) -> %s", (name, type, target) => {
    const result = regulo.derive(name, type);
    if (target === null) {
      expect(isNoTarget(result)).toBe(true);
      if (isNoTarget(result)) {
        expect(result.celo).toBe("tailwind");
        expect(result.reason.length).toBeGreaterThan(0);
      }
    } else {
      expect(result).toBe(target);
    }
  });

  it.each(TAILWIND_FIXTURES.filter((row) => row[2] !== null))(
    "inverts %s <- %s",
    (name, _type, target) => {
      expect(regulo.invert(target ?? "")).toBe(name);
    },
  );

  it("names the reason for a missing target", () => {
    const noNamespace = regulo.derive("duration.fast", "duration");
    const wrongType = regulo.derive("font.weight.bold", "fontFamily");
    expect(isNoTarget(noNamespace) && noNamespace.reason).toMatch(/namespace/);
    expect(isNoTarget(wrongType) && wrongType.reason).toMatch(/fontFamily/);
  });

  it("produces the same variable as the CSS Celo under prefix(fm)", () => {
    const entry = regulo.derive("color.action.primary.rest", "color");
    expect(typeof entry === "string" && `--fm-${entry.slice(2)}`).toBe(
      nomRegulo("css").derive("color.action.primary.rest"),
    );
  });
});

describe("invert rejects strings outside the target grammar", () => {
  const cases: Readonly<Record<Celo, readonly string[]>> = {
    css: [
      "",
      "--fm-",
      "--color-primary",
      "--fm-Color",
      "--fm-color--primary",
      "--fm-color-",
      "--fm-color_primary",
      "-fm-color",
      "--fm-color.primary",
      " --fm-color",
      "--fm-colör",
    ],
    figma: ["", "/", "color/", "/color", "color//x", "Color/x", "color.x", "color x", "colör"],
    typescript: [
      "",
      "vortaro",
      "color.x",
      "vortaro.",
      "vortaro.Color",
      'vortaro["color"]',
      "vortaro.600",
      "vortaro['600']",
      'vortaro["6-0"]',
      "vortaro..x",
      "vortaro.x[600]",
      "vortaro.x_y",
      "vortaro.x.",
    ],
    tailwind: [
      "",
      "--color",
      "--color-",
      "--fm-color-primary",
      "--duration-fast",
      "--opacity",
      "--Color-primary",
      "--color--primary",
      "--color_primary",
      "color-primary",
      "--font-weight",
    ],
    dtcg: ["", "Color", "color.", ".color", "color..x", "color-x", "color_x", "color x", "colör"],
  };

  it.each(CELOJ.flatMap((celo) => cases[celo].map((target) => [celo, target] as const)))(
    "%s: %j",
    (celo, target) => {
      expect(nomRegulo(celo).invert(target)).toBeNull();
    },
  );
});

describe("typescript targets are valid property accesses", () => {
  it.each(TYPESCRIPT_FIXTURES)("%s evaluates to the leaf via %s", (name, target) => {
    const vortaro: Record<string, unknown> = {};
    let node = vortaro;
    const segments = name.split(".");
    segments.forEach((segment, index) => {
      if (index === segments.length - 1) {
        node[segment] = name;
      } else {
        const child: Record<string, unknown> = {};
        node[segment] = child;
        node = child;
      }
    });
    const read = new Function("vortaro", `"use strict"; return ${target};`);
    expect(read(vortaro)).toBe(name);
  });
});

describe("invalid canonical names (token-name-grammar)", () => {
  const invalid = [
    "",
    "Color.primary",
    "color.on-primary",
    "color_primary",
    "color primary",
    "farbe.grün",
    "color..primary",
    ".color",
    "color.",
  ];

  it.each(invalid)("checkTokenName(%j) returns a token-name-grammar issue", (name) => {
    const issue = checkTokenName(name);
    expect(issue?.rule).toBe("token-name-grammar");
    expect(issue?.severity).toBe("error");
    expect(issue?.suggestion.length).toBeGreaterThan(0);
  });

  it("uses the given path for the issue", () => {
    expect(checkTokenName("Color", "sets/core.json#/Color")?.path).toBe("sets/core.json#/Color");
  });

  it("suggests the normalized name where one exists", () => {
    expect(checkTokenName("color.on-primary")?.suggestion).toContain("color.on.primary");
  });

  it("returns null for a valid name", () => {
    expect(checkTokenName("color.action.primary.rest")).toBeNull();
  });

  it.each(CELOJ.flatMap((celo) => invalid.map((name) => [celo, name] as const)))(
    "%s derive throws TokenNameError for %j",
    (celo, name) => {
      let thrown: unknown;
      try {
        nomRegulo(celo).derive(name, "color");
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(TokenNameError);
      expect(thrown instanceof TokenNameError && thrown.issue.rule).toBe("token-name-grammar");
    },
  );
});

describe("NOM_REGULOJ lookup", () => {
  it("has exactly the five Celoj", () => {
    expect([...CELOJ]).toEqual(["css", "figma", "typescript", "tailwind", "dtcg"]);
    expect(Object.keys(NOM_REGULOJ).sort()).toEqual([...CELOJ].sort());
  });

  it.each(CELOJ)("nomRegulo(%s) carries its celo", (celo) => {
    expect(nomRegulo(celo).celo).toBe(celo);
    expect(NOM_REGULOJ[celo]).toBe(nomRegulo(celo));
  });
});
