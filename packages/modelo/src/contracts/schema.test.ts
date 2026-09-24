import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "./ajv.js";
import { DTCG_TYPES, TOKEN_ROLES, TOKEN_VALUE_DEFS } from "./dtcg.js";
import {
  ENTITY_ID_PREFIXES,
  ENTITY_TYPES,
  ID_NAMESPACE_PATTERN_SOURCE,
  ULID_PATTERN_SOURCE,
} from "./entity-ids.js";
import {
  ALIAS_PATTERN,
  KONDICXO_PATTERN,
  NAME_PATTERN,
  SET_NAME_PATTERN,
  TOKEN_NAME_PATTERN,
} from "./grammar.js";
import {
  DATA_FILE_SCHEMA_DEFS,
  MODELO_SCHEMA_ID,
  readModeloSchema,
  SCHEMA_DEFS,
} from "./schema.js";

const ULID = "01J8Z3K4M5N6P7Q8R9S0T1V2W3";
const id = (prefix: string): string => `${prefix}_${ULID}`;

const color = { colorSpace: "srgb", components: [0.1, 0.2, 0.3] };
const px = (value: number) => ({ value, unit: "px" });
const ms = (value: number) => ({ value, unit: "ms" });

interface Sample {
  def: string;
  valid: unknown[];
  invalid: unknown[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function defsOf(schema: unknown): Record<string, unknown> {
  if (!isRecord(schema) || !isRecord(schema.$defs)) {
    throw new Error("schema has no $defs");
  }
  return schema.$defs;
}

// A token wrapped in a set file so the whole DTCG tree path (group -> token) is exercised.
const setWith = (token: unknown): unknown => ({ color: { token } });
const typed = (type: string, value: unknown): unknown => setWith({ $type: type, $value: value });

const dimensio = {
  id: id("dim"),
  name: "contrast",
  priority: 5,
  default: "default",
  valoroj: [
    {
      id: id("dva"),
      name: "default",
      kontrastSojloj: {
        wcag2: { "text-normal": 4.5, "text-large": 3, ui: 3 },
        apca: { "text-normal": 75, "text-large": 60, ui: 45 },
      },
    },
  ],
};

const regulo = {
  id: id("reg"),
  name: "text-has-kontrastparo",
  statement: "Every text-on-background combination has a KontrastParo.",
  kialo: "Unchecked combinations are where contrast regressions hide.",
  scope: "vortaro",
  checkability: "automatic",
};

const jugxo = {
  id: id("jug"),
  ref: { regulo: id("reg") },
  decision: "approved",
  kialo: "Decorative element, not text.",
  date: "2026-09-19",
  context: "Divider on the landing page.",
};

const manko = {
  id: id("man"),
  celo: "figma",
  property: "textCase",
  modelo: "A typography role carries its case as a Fundamento extension.",
  instead: "The target takes the case only as a value, never as a binding.",
  evidence: "Unknown field",
  date: "2026-09-23",
  external: "Measured on the text node; the tool's documentation does not list the field.",
  closing: {
    measure: "binding-accepted",
    statement: "A run binds the property to a variable and the target does not refuse it.",
  },
};

const kontrastParo = {
  id: id("kpa"),
  name: "text-on-surface",
  foreground: "color.text.default",
  background: "color.surface.base",
  kategorio: "text-normal",
};

const rezolvo = {
  assignment: { aspekto: "neutra", "color-scheme": "light" },
  tokens: {
    "color.text.default": {
      id: id("tok"),
      type: "color",
      value: color,
      origin: { set: "core", setId: id("set") },
      aliasChain: [{ token: "color.palette.neutral.900", set: "color-scheme/dark" }],
    },
    "border.focus": {
      id: id("tok"),
      type: "border",
      value: { color, width: px(2), style: "solid" },
      origin: { set: "core", setId: id("set") },
      aliasChain: [],
      fieldAliases: { color: [{ token: "color.focus", set: "core" }] },
    },
  },
};

const samples: Sample[] = [
  {
    def: "TokenSetFile",
    valid: [
      {},
      {
        $description: "Core set",
        $extensions: { "com.ciferecigo.fundamento": { id: id("set"), kondicxoj: [] } },
        color: {
          $type: "color",
          text: {
            default: {
              $value: "{color.palette.neutral.900}",
              $description: "Default text",
              $extensions: {
                "com.ciferecigo.fundamento": { id: id("tok"), role: "foreground" },
                "org.example.other": { anything: true },
              },
            },
          },
        },
      },
      {
        $extensions: {
          "com.ciferecigo.fundamento": {
            id: id("set"),
            kondicxoj: ["aspekto=neutra", "color-scheme=dark"],
          },
        },
      },
    ],
    invalid: [
      { Color: { $type: "color", $value: color } }, // name grammar: uppercase segment
      { "on-primary": { $type: "color", $value: color } }, // name grammar: hyphen
      { color: { $type: "colour", $value: color } }, // unknown type
      { color: { $type: "color", $value: color, extra: 1 } }, // token with child
      { $extensions: { "com.ciferecigo.fundamento": { id: id("tok"), kondicxoj: [] } } }, // wrong prefix
      { $extensions: { "com.ciferecigo.fundamento": { id: id("set"), kondicxoj: ["dark"] } } },
      { $extensions: { "com.ciferecigo.fundamento": { id: id("set") } } }, // kondicxoj missing
      setWith({ $value: color, $extensions: { "com.ciferecigo.fundamento": { role: "x" } } }),
      { color: { $extensions: { "com.ciferecigo.fundamento": { id: id("set") } } } }, // group ext
      { $extends: "{other}" }, // DTCG group extension is not supported
    ],
  },
  {
    def: "TokenSetFile",
    valid: [
      typed("color", color),
      typed("color", { colorSpace: "oklch", components: [0.5, "none", 120], alpha: 0.5 }),
      typed("color", { ...color, hex: "#1a334d" }),
      typed("color", "{color.palette.blue.600}"),
      typed("dimension", px(16)),
      typed("dimension", px(-4)),
      typed("fontFamily", "system-ui"),
      typed("fontFamily", ["system-ui", "sans-serif"]),
      typed("fontWeight", 400),
      typed("fontWeight", "semi-bold"),
      typed("duration", ms(200)),
      typed("duration", { value: 0.2, unit: "s" }),
      typed("cubicBezier", [0.4, 0, 0.2, 1]),
      typed("cubicBezier", [0, -2, 1, 3]),
      typed("number", 1.5),
      typed("strokeStyle", "dashed"),
      typed("strokeStyle", { dashArray: [px(4), "{size.gap}"], lineCap: "round" }),
      typed("shadow", {
        color: "{color.shadow}",
        offsetX: px(0),
        offsetY: px(2),
        blur: px(4),
        spread: px(0),
      }),
      typed("shadow", [
        { color, offsetX: px(0), offsetY: px(1), blur: px(2), spread: px(0), inset: true },
        { color, offsetX: px(0), offsetY: px(4), blur: "{size.blur}", spread: px(0) },
      ]),
      typed("typography", {
        fontFamily: "{font.family.body}",
        fontSize: px(16),
        fontWeight: 400,
        letterSpacing: px(0),
        lineHeight: 1.5,
      }),
      typed("border", { color: "{color.border}", width: px(1), style: "solid" }),
      typed("border", { color, width: "{border.width.thin}", style: "{border.style}" }),
      typed("gradient", [
        { color, position: 0 },
        { color: "{color.end}", position: "{gradient.stop}" },
      ]),
      typed("transition", {
        duration: ms(200),
        delay: "{motion.delay.none}",
        timingFunction: [0.4, 0, 0.2, 1],
      }),
      typed("transition", {
        duration: "{motion.fast}",
        delay: ms(0),
        timingFunction: "{motion.ease}",
      }),
      setWith({ $value: px(4) }), // type inherited: structural check only
    ],
    invalid: [
      typed("color", "#ff0000"), // CSS hex string is not a DTCG 2025.10 color
      typed("color", { colorSpace: "cmyk", components: [0, 0, 0] }),
      typed("color", { colorSpace: "srgb", components: [0, 0] }),
      typed("color", { ...color, alpha: 1.5 }),
      typed("color", { ...color, hex: "#fff" }),
      typed("dimension", "16px"),
      typed("dimension", { value: 1, unit: "rem" }),
      typed("fontFamily", ""),
      typed("fontFamily", []),
      typed("fontWeight", 1001),
      typed("fontWeight", "fat"),
      typed("duration", { value: 200, unit: "min" }),
      typed("duration", { value: -1, unit: "ms" }),
      typed("cubicBezier", [1.2, 0, 0.2, 1]),
      typed("cubicBezier", [0.4, 0, 0.2]),
      typed("number", "1.5"),
      typed("strokeStyle", "wavy"),
      typed("strokeStyle", { dashArray: [px(4)], lineCap: "pointy" }),
      typed("shadow", { color, offsetX: px(0), offsetY: px(2), blur: px(4) }),
      typed("typography", { fontFamily: "system-ui", fontSize: px(16) }),
      typed("border", { color, width: px(1), style: "wavy" }),
      typed("gradient", [{ color, position: 2 }]),
      typed("transition", { duration: ms(1), delay: ms(0), timingFunction: "ease-in" }),
      typed("color", { $ref: "#/color/base" }), // JSON-Pointer references are not supported
      typed("dimension", "{unterminated"),
      setWith({ $type: "color", $value: color, $description: 42 }),
    ],
  },
  {
    def: "DimensiojFile",
    valid: [
      { dimensioj: [] },
      { dimensioj: [dimensio] },
      {
        dimensioj: [
          {
            id: id("dim"),
            name: "aspekto",
            priority: 1,
            default: "neutra",
            valoroj: [
              {
                id: id("dva"),
                name: "neutra",
                aspekto: { owner: "Fundamento", licenseNote: "MIT" },
              },
            ],
          },
        ],
      },
    ],
    invalid: [
      {},
      { dimensioj: [{ ...dimensio, id: id("dva") }] },
      { dimensioj: [{ ...dimensio, priority: 0 }] },
      { dimensioj: [{ ...dimensio, priority: 1.5 }] },
      { dimensioj: [{ ...dimensio, name: "ColorScheme" }] },
      { dimensioj: [{ ...dimensio, valoroj: [] }] },
      {
        dimensioj: [
          {
            ...dimensio,
            valoroj: [{ id: id("dva"), name: "high", kontrastSojloj: { wcag2: { ui: 3 } } }],
          },
        ],
      },
      {
        dimensioj: [
          { ...dimensio, valoroj: [{ id: id("dva"), name: "neutra", aspekto: { owner: "x" } }] },
        ],
      },
    ],
  },
  {
    def: "RegulojFile",
    valid: [{ reguloj: [] }, { reguloj: [regulo, { ...regulo, checkability: "manual" }] }],
    invalid: [
      { reguloj: [{ ...regulo, kialo: "" }] },
      { reguloj: [{ ...regulo, kialo: "   " }] },
      { reguloj: [{ ...regulo, id: id("jug") }] },
      { reguloj: [{ ...regulo, checkability: "sometimes" }] },
      {
        reguloj: [
          {
            id: regulo.id,
            name: regulo.name,
            statement: regulo.statement,
            scope: regulo.scope,
            checkability: regulo.checkability,
          },
        ],
      },
    ],
  },
  {
    def: "JugxojFile",
    valid: [
      { jugxoj: [] },
      { jugxoj: [jugxo, { ...jugxo, ref: { ero: id("ero") } }] },
      { jugxoj: [{ ...jugxo, ref: { artikolo: "X" }, decision: "deviation-recorded" }] },
      { jugxoj: [{ ...jugxo, ref: { artikolo: "XIII" } }] },
    ],
    invalid: [
      { jugxoj: [{ ...jugxo, ref: { regulo: id("ero") } }] },
      { jugxoj: [{ ...jugxo, ref: { regulo: id("reg"), ero: id("ero") } }] },
      { jugxoj: [{ ...jugxo, decision: "maybe" }] },
      { jugxoj: [{ ...jugxo, decision: "deviation recorded" }] },
      { jugxoj: [{ ...jugxo, ref: { artikolo: "XIV" } }] },
      { jugxoj: [{ ...jugxo, ref: { artikolo: "x" } }] },
      { jugxoj: [{ ...jugxo, ref: { artikolo: "X", regulo: id("reg") } }] },
      { jugxoj: [{ ...jugxo, date: "19.09.2026" }] },
      { jugxoj: [{ ...jugxo, kialo: "" }] },
    ],
  },
  {
    def: "MankojFile",
    valid: [{ mankoj: [] }, { mankoj: [manko, { ...manko, property: "textDecoration" }] }],
    invalid: [
      // A Manko without a closing condition is invalid, as a Regulo without a kialo (Art. VI).
      { mankoj: [{ ...manko, closing: undefined }] },
      { mankoj: [{ ...manko, closing: { statement: "Someday." } }] },
      { mankoj: [{ ...manko, closing: { measure: "someone-says-so", statement: "Someday." } }] },
      { mankoj: [{ ...manko, closing: { measure: "binding-accepted", statement: "" } }] },
      { mankoj: [{ ...manko, evidence: "" }] },
      { mankoj: [{ ...manko, date: "23.09.2026" }] },
      { mankoj: [{ ...manko, id: id("jug") }] },
      { mankoj: [{ ...manko, celo: "Figma" }] },
      { mankoj: [{ ...manko, kialo: "beside the point" }] },
    ],
  },
  {
    def: "KontrastParojFile",
    valid: [{ kontrastParoj: [] }, { kontrastParoj: [kontrastParo] }],
    invalid: [
      { kontrastParoj: [{ ...kontrastParo, kategorio: "text-small" }] },
      { kontrastParoj: [{ ...kontrastParo, foreground: "color-text" }] },
      { kontrastParoj: [{ ...kontrastParo, id: id("tok") }] },
    ],
  },
  {
    def: "IdsLock",
    valid: [
      { ids: {} },
      {
        ids: {
          [id("tok")]: { type: "token", status: "active" },
          [id("set")]: { type: "tokenSet", status: "retired" },
        },
      },
    ],
    invalid: [
      {},
      { ids: { "tok-123": { type: "token", status: "active" } } },
      { ids: { [id("tok")]: { type: "widget", status: "active" } } },
      { ids: { [id("tok")]: { type: "token", status: "deleted" } } },
      { ids: { [`tok_${ULID.toLowerCase()}`]: { type: "token", status: "active" } } },
    ],
  },
  {
    def: "Rezolvo",
    valid: [rezolvo, { assignment: {}, tokens: {} }],
    invalid: [
      { assignment: {} },
      {
        assignment: {},
        tokens: { "color.x": { ...rezolvo.tokens["color.text.default"], origin: { set: "core" } } },
      },
      {
        assignment: {},
        tokens: { "Color.X": rezolvo.tokens["color.text.default"] },
      },
    ],
  },
  {
    def: "Ero",
    valid: [{ id: id("ero"), name: "butono", skemo: id("ske"), description: "A button." }],
    invalid: [{ id: id("ske"), name: "butono", skemo: id("ske") }, { id: id("ero") }],
  },
  {
    def: "Skemo",
    valid: [
      {
        id: id("ske"),
        ero: id("ero"),
        props: [
          {
            name: "variant",
            kind: "enum",
            values: ["primary", "secondary", "tertiary"],
            default: "primary",
          },
          { name: "disabled", kind: "boolean", default: false },
        ],
        states: ["rest", "hover", "pressed", "disabled"],
        // Spec 003: slots, parts, bindings and a11y are required.
        slots: [{ name: "label", default: true, text: true }],
        parts: { surface: { fill: { by: ["variant", "state"] } } },
        bindings: [
          {
            part: "surface",
            property: "fill",
            when: { variant: "primary", state: "rest" },
            token: "color.action.primary.rest",
          },
        ],
        a11y: { role: "button", name: ["slot:label"], states: {}, keys: ["Enter", "Space"] },
      },
    ],
    invalid: [
      { id: id("ske"), ero: id("ero"), props: [{ name: "variant", kind: "css" }], states: [] },
      { id: id("ske"), ero: id("ero"), props: [] },
    ],
  },
  {
    def: "Sxablono",
    valid: [{ id: id("sxa"), name: "login-page", kind: "page", eroj: [id("ero")] }],
    invalid: [{ id: id("sxa"), name: "login-page", kind: "widget", eroj: [] }],
  },
  {
    def: "Projekcio",
    valid: [{ id: id("prj"), name: "tokens-web", celo: id("cel") }],
    invalid: [{ id: id("prj"), name: "tokens-web", celo: id("prj") }],
  },
  {
    def: "Celo",
    valid: [{ id: id("cel"), name: "penpot", description: "Design tool" }],
    invalid: [{ id: id("cel") }, { id: id("cel"), name: "x", mapping: {} }],
  },
];

const modeloJson = {
  $schema: "./modelo.schema.json",
  fundamento: { version: "0.0.1" },
  dimensioj: [dimensio],
  aspektoj: [{ id: id("dva"), name: "neutra", owner: "Fundamento", licenseNote: "MIT" }],
  tokenTypes: ["color", "border"],
  tokens: [
    {
      id: id("tok"),
      name: "color.text.default",
      type: "color",
      description: "Default text",
      role: "foreground",
    },
    { id: id("tok"), name: "border.focus", type: "border" },
  ],
  setoj: [
    {
      id: id("set"),
      name: "core",
      kondicxoj: [],
      tree: { color: { $type: "color", base: { $value: color } } },
    },
    {
      id: id("set"),
      name: "aspekto/neutra+color-scheme/dark",
      kondicxoj: ["aspekto=neutra", "color-scheme=dark"],
      tree: {},
    },
  ],
  reguloj: [regulo],
  jugxoj: [jugxo],
  mankoj: [manko],
  kontrastParoj: [kontrastParo],
  eroj: [],
  skemoj: [],
  rezolvo,
};

describe("modelo schema", () => {
  it("is draft 2020-12 with a stable $id", () => {
    const schema = readModeloSchema();
    expect(schema).toMatchObject({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: MODELO_SCHEMA_ID,
    });
  });

  it("compiles with Ajv in strict mode", () => {
    const ajv = createModeloAjv();
    expect(ajv.opts.strict).toBe(true);
    expect(ajv.opts.allErrors).toBe(true);
    for (const def of Object.keys(defsOf(readModeloSchema()))) {
      expect(() => getModeloValidator(ajv, def), def).not.toThrow();
    }
    expect(ajv.getSchema(MODELO_SCHEMA_ID)).toBeTypeOf("function");
  });

  it("names every def referenced by the contracts", () => {
    const defs = defsOf(readModeloSchema());
    const referenced = [
      ...Object.values(SCHEMA_DEFS),
      ...Object.values(DATA_FILE_SCHEMA_DEFS),
      ...Object.values(TOKEN_VALUE_DEFS),
    ];
    for (const def of referenced) {
      expect(defs, def).toHaveProperty(def);
    }
  });

  describe.each(samples.map((sample, index) => ({ ...sample, index })))(
    "$def (#$index)",
    ({ def, valid, invalid }) => {
      const validate = getModeloValidator(createModeloAjv(), def);

      it.each(valid.map((value, i) => ({ value, i })))("accepts valid sample $i", ({ value }) => {
        const ok = validate(value);
        expect(validate.errors ?? [], JSON.stringify(value)).toEqual([]);
        expect(ok).toBe(true);
      });

      it.each(invalid.map((value, i) => ({ value, i })))(
        "rejects invalid sample $i",
        ({ value }) => {
          expect(validate(value), JSON.stringify(value)).toBe(false);
        },
      );
    },
  );

  describe("modelo.json export root", () => {
    const validate = getModeloValidator(createModeloAjv());

    it("accepts a complete export", () => {
      const ok = validate(modeloJson);
      expect(validate.errors ?? []).toEqual([]);
      expect(ok).toBe(true);
    });

    it("rejects an export with a missing section or foreign key", () => {
      const { eroj: _eroj, ...withoutEroj } = modeloJson;
      expect(validate(withoutEroj)).toBe(false);
      expect(validate({ ...modeloJson, fundamento: { version: "latest" } })).toBe(false);
      expect(validate({ ...modeloJson, extra: true })).toBe(false);
      expect(validate({ ...modeloJson, tokenTypes: ["colour"] })).toBe(false);
    });
  });

  it("enforces the ID prefix per entity type", () => {
    const ajv = createModeloAjv();
    const defs = defsOf(readModeloSchema());
    for (const entityType of ENTITY_TYPES) {
      const prefix = ENTITY_ID_PREFIXES[entityType];
      const def = `${entityType[0]?.toUpperCase()}${entityType.slice(1)}Id`;
      expect(defs[def], def).toEqual({
        type: "string",
        pattern: `^${prefix}_(?:${ID_NAMESPACE_PATTERN_SOURCE}_)?${ULID_PATTERN_SOURCE}$`,
      });
      const validate = getModeloValidator(ajv, def);
      expect(validate(`${prefix}_${ULID}`)).toBe(true);
      expect(validate(`${prefix}_ekz_${ULID}`)).toBe(true); // namespaced (D-06)
      expect(validate(`${prefix}_E_${ULID}`)).toBe(false);
      for (const other of Object.values(ENTITY_ID_PREFIXES).filter((p) => p !== prefix)) {
        expect(validate(`${other}_${ULID}`)).toBe(false);
      }
      expect(validate(`${prefix}_${ULID.slice(1)}`)).toBe(false); // 25 chars
      expect(validate(`${prefix}_8${ULID.slice(1)}`)).toBe(false); // timestamp overflow
      expect(validate(`${prefix}_${ULID.slice(0, -1)}U`)).toBe(false); // not Crockford
    }
  });

  it("keeps enums and patterns in sync with the contract constants", () => {
    const defs = defsOf(readModeloSchema());
    expect(defs.DtcgType).toEqual({ type: "string", enum: [...DTCG_TYPES] });
    expect(defs.TokenRole).toEqual({ type: "string", enum: [...TOKEN_ROLES] });
    expect(defs.EntityType).toEqual({ type: "string", enum: [...ENTITY_TYPES] });
    expect(defs.TokenName).toEqual({ type: "string", pattern: TOKEN_NAME_PATTERN.source });
    expect(defs.Name).toEqual({ type: "string", pattern: NAME_PATTERN.source });
    expect(defs.KondicxoExpression).toEqual({ type: "string", pattern: KONDICXO_PATTERN.source });
    expect(defs.SetName).toEqual({ type: "string", pattern: SET_NAME_PATTERN.source });
    expect(defs.Alias).toEqual({ type: "string", pattern: ALIAS_PATTERN.source });
  });
});
