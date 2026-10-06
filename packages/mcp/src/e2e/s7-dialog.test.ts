// AK-06: the S7 dialog against the fixture Aspekto ekzemplo. Every number in the answers is
// recomputed from fundamento://export/modelo.json, and every value from a direct resolve() on
// the source Modelo (contracts/mcp-tools.md, "S7 acceptance mapping"; task T028).

import {
  allAssignments,
  buildModelo,
  type ModeloJson,
  projectModeloSource,
  readModeloFiles,
  resolve,
} from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TOOL_NAMES } from "../schemas.js";
import {
  type Connected,
  call,
  closeClients,
  connect,
  EKZEMPLO_CONFIG,
  output,
  preload,
} from "../test-doubles/client.js";

afterAll(closeClients);
preload({ config: EKZEMPLO_CONFIG });

type Resolved = {
  tokens: Record<
    string,
    { value: unknown; origin: { set: string; package?: string }; aliasChain: unknown[] }
  >;
};

// Die Verbindung entsteht im `beforeAll`, nicht auf Modulebene: Modulcode läuft, während Vitest
// alle Dateien einsammelt — die Leitung stünde dann offen, bis dieser Test an der Reihe ist.
let client: Connected["client"];
let modeloJson: ModeloJson;

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
  const { contents } = await client.readResource({ uri: "fundamento://export/modelo.json" });
  modeloJson = JSON.parse((contents[0] as { text: string }).text) as ModeloJson;
});
const { files } = readModeloFiles(projectModeloSource(EKZEMPLO_CONFIG));
if (files === undefined) throw new Error("ekzemplo did not load");
const source = buildModelo(files).modelo;

const count = <T>(items: readonly T[], key: (item: T) => string) =>
  items.reduce<Record<string, number>>((out, item) => {
    out[key(item)] = (out[key(item)] ?? 0) + 1;
    return out;
  }, {});

describe("S7 with ekzemplo (AK-06)", () => {
  it("every tool answers with schema-conformant JSON", async () => {
    const inputs: Record<string, Record<string, unknown>> = {
      get_token: { name: "color.text.default" },
      derive_name: { name: "color.text.default" },
      check_contrast: { foreground: "color.text.default", background: "color.background.default" },
      explain: { token: "color.text.default" },
      explain_regulo: { name: "text-hierarchy" },
      describe_term: { term: "Aspekto" },
      get_ero: { name: "butono" },
      suggest_ero: { intent: "Löschen" },
      check_usage: {
        instances: [{ ero: "butono", props: { variant: "primary" }, label: "Speichern" }],
      },
    };
    for (const name of TOOL_NAMES) {
      const result = await call(client, name, inputs[name] ?? {});
      expect(result.isError, name).toBeFalsy();
    }
  });

  it("'Was gibt's hier?': describe, recomputed from modelo.json", async () => {
    const answer = await output<{
      dimensioj: string[];
      aspektoj: { name: string }[];
      tokens: { count: number; byType: Record<string, number>; byGroup: Record<string, number> };
      reguloj: { count: number; withKialo: number; automatic: number };
      jugxoj: { count: number };
      validation: { errors: number };
      sentence: string;
    }>(client, "describe");
    expect(answer.dimensioj).toEqual(modeloJson.dimensioj.map((dimensio) => dimensio.name));
    expect(answer.aspektoj.map((aspekto) => aspekto.name)).toEqual(["komuna", "ekzemplo"]);
    expect(answer.tokens.count).toBe(modeloJson.tokens.length);
    expect(answer.tokens.byType).toEqual(count(modeloJson.tokens, (token) => token.type));
    expect(answer.tokens.byGroup).toEqual(
      count(modeloJson.tokens, (token) => token.name.split(".")[0] ?? ""),
    );
    expect(answer.reguloj.count).toBe(modeloJson.reguloj.length);
    expect(answer.reguloj.withKialo).toBe(
      modeloJson.reguloj.filter((regulo) => regulo.kialo.trim() !== "").length,
    );
    expect(answer.jugxoj.count).toBe(modeloJson.jugxoj.length);
    expect(answer.validation.errors).toBe(0);
    expect(answer.sentence).toContain(`${modeloJson.tokens.length} tokens`);
    for (const [group, n] of Object.entries(answer.tokens.byGroup)) {
      expect(answer.sentence).toContain(`${group} ${n}`);
    }
    expect(answer.sentence).not.toMatch(/\b(all|complete|every)\b/i);
    // Spec 002 FR-14: Reguloj (automatic) and Jugxoj, and the pointer to explain.
    expect(answer.reguloj.automatic).toBe(
      modeloJson.reguloj.filter((regulo) => regulo.checkability === "automatic").length,
    );
    expect(answer.sentence).toContain(`${answer.reguloj.automatic} automatic`);
    expect(answer.sentence).toMatch(/Ask explain why a value is what it is\.$/);
  });

  it("'Welche Farbe hat primärer Text in ekzemplo im Dark Mode?': resolve", async () => {
    const assignment = { aspekto: "ekzemplo", "color-scheme": "dark" };
    const answer = await output<Resolved>(client, "resolve", {
      assignment,
      tokens: ["color.text.default"],
    });
    const direct = resolve(source, assignment);
    if (!direct.ok) throw new Error("direct resolve failed");
    const expected = direct.rezolvo.tokens["color.text.default"];
    const token = answer.tokens["color.text.default"];
    expect(token?.value).toEqual(JSON.parse(JSON.stringify(expected?.value)));
    expect(token?.origin.set).toBe("aspekto/ekzemplo+color-scheme/dark");
    expect(token?.aliasChain).toEqual(JSON.parse(JSON.stringify(expected?.aliasChain)));
  });

  it("'Warum gibt es keine Schatten in ekzemplo?': list_reguloj, search_tokens, resolve", async () => {
    const { reguloj } = await output<{ reguloj: { name: string; kialo: string }[] }>(
      client,
      "list_reguloj",
      { aspekto: "ekzemplo" },
    );
    const flat = reguloj.find((regulo) => regulo.name === "elevation-flat");
    expect(flat?.kialo).toBe(
      modeloJson.reguloj.find((regulo) => regulo.name === "elevation-flat")?.kialo,
    );
    const shadows = await output<{ total: number; tokens: { name: string }[] }>(
      client,
      "search_tokens",
      { prefix: "elevation.shadow" },
    );
    expect(shadows.total).toBe(
      modeloJson.tokens.filter((token) => token.name.startsWith("elevation.shadow.")).length,
    );
    const combinations = allAssignments(source).filter(
      (assignment) => assignment.aspekto === "ekzemplo",
    );
    expect(combinations).toHaveLength(72);
    for (const assignment of combinations) {
      const answer = await output<Resolved>(client, "resolve", {
        assignment,
        tokens: ["elevation.shadow"],
      });
      expect(Object.keys(answer.tokens)).toEqual(shadows.tokens.map((token) => token.name).sort());
      for (const token of Object.values(answer.tokens)) {
        expect(token.origin.set).toBe("aspekto/ekzemplo");
        expect(token.origin.package).toBe("aspekto-ekzemplo");
        expect(token.value).toMatchObject({
          color: { alpha: 0 },
          offsetX: { value: 0 },
          offsetY: { value: 0 },
          blur: { value: 0 },
          spread: { value: 0 },
        });
      }
    }
  });
});
