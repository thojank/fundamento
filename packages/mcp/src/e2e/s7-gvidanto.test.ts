// AK-06 of Spec 002: the S7 Gvidanto dialog against core + aspekto-ekzemplo
// (contracts/mcp-tools.md §6). Every number and value of an answer is recomputed independently:
// counts from fundamento://export/modelo.json, values and chains from resolve() on the source
// Modelo, ratios from the Alirebleco evaluation, terms from ontologio.json. A mutation check
// changes one number in each answer and requires the verification to fail.

import {
  buildModelo,
  evaluateAlirebleco,
  formatCombination,
  type ModeloJson,
  type PairMeasurement,
  projectModeloSource,
  readModeloFiles,
  readOntologio,
  resolveCombination,
  truncate2,
} from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type Connected,
  closeClients,
  connect,
  EKZEMPLO_CONFIG,
  output,
  preload,
} from "../test-doubles/client.js";

afterAll(closeClients);
preload({ config: EKZEMPLO_CONFIG });

type Json = Record<string, unknown>;

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
const measurements = evaluateAlirebleco(source, {
  kontrastParojFile: "data/kontrastparoj.json",
  collect: true,
}).measurements as PairMeasurement[];
const measured = (pair: string, combination: string) =>
  measurements.find(
    (entry) =>
      entry.pair.name === pair && formatCombination(source, entry.combination) === combination,
  );

// Question 1: "Was gibt's hier?"
function verifyDescribe(answer: Json): void {
  const reguloj = answer.reguloj as { count: number; withKialo: number; automatic: number };
  expect(reguloj.count).toBe(modeloJson.reguloj.length);
  expect(reguloj.automatic).toBe(
    modeloJson.reguloj.filter((regulo) => regulo.checkability === "automatic").length,
  );
  expect((answer.jugxoj as { count: number }).count).toBe(modeloJson.jugxoj.length);
  expect(answer.sentence).toContain(" automatic)");
  expect(answer.sentence).toMatch(/Ask explain why a value is what it is\.$/);
}

// Question 2: "Warum ist color.text.subtle in komuna, dark, high contrast dieser Wert?"
const Q2 = {
  token: "color.text.subtle",
  assignment: { aspekto: "komuna", "color-scheme": "dark", contrast: "high" },
};
function verifyExplainSubtle(answer: Json): void {
  const direct = resolveCombination(source, Q2.assignment).tokens[Q2.token];
  expect(answer.value).toEqual(direct?.value);
  expect(
    (answer.aliasChain as { token: string; set: string }[]).map(({ token, set }) => ({
      token,
      set,
    })),
  ).toEqual(direct?.aliasChain);
  const reguloj = answer.reguloj as { name: string; kialo: string; result: string }[];
  const hierarchy = reguloj.find((regulo) => regulo.name === "text-hierarchy");
  expect(hierarchy?.kialo).toBe(
    modeloJson.reguloj.find((regulo) => regulo.name === "text-hierarchy")?.kialo,
  );
  expect(hierarchy?.result).toBe("passed");
  const pair = (
    answer.kontrastParoj as { name: string; main: { ratio: number }; passed: boolean }[]
  ).find((entry) => entry.name === "text-subtle-on-background-default");
  const expected = measured("text-subtle-on-background-default", String(answer.combination));
  expect(pair?.main.ratio).toBe(Number(truncate2(expected?.main.ratio ?? 0)));
  expect(pair?.passed).toBe(expected?.passed);
}

// Question 3: "Darf ich color.text.muted auf color.background.sunken setzen?"
function verifyCheckContrast(answer: Json): void {
  expect((answer.declared as { position: string }).position).toBe("main");
  const groups = answer.results as {
    ratio: number;
    threshold: number;
    passed: boolean;
    combinations: string[];
  }[];
  let total = 0;
  for (const group of groups) {
    for (const combination of group.combinations) {
      const expected = measured("text-muted-on-background-sunken", combination);
      expect(group.ratio).toBe(Number(truncate2(expected?.main.ratio ?? 0)));
      expect(group.threshold).toBe(expected?.threshold);
      expect(group.passed).toBe(expected?.passed);
      total += 1;
    }
  }
  expect(total).toBe(144);
  expect((answer.summary as { combinations: number }).combinations).toBe(total);
}

// Question 4: "Warum hat die Warnfläche in ekzemplo einen Rand?"
function verifyWarningBorder(answer: Json): void {
  const pair = (
    answer.kontrastParoj as {
      name: string;
      position: string;
      branch: string;
      kialo: string;
      main: { ratio: number };
      aux: { ratio: number };
    }[]
  ).find((entry) => entry.name === "status-warning-basic-on-background-default");
  expect(pair?.position).toBe("aux-foreground");
  expect(pair?.branch).toBe("aux");
  const expected = measured(
    "status-warning-basic-on-background-default",
    String(answer.combination),
  );
  expect(pair?.main.ratio).toBe(Number(truncate2(expected?.main.ratio ?? 0)));
  expect(pair?.aux.ratio).toBe(Number(truncate2(expected?.aux?.ratio ?? 0)));
  expect(pair?.main.ratio).toBeLessThan(3);
  expect(pair?.aux.ratio).toBeGreaterThanOrEqual(3);
  expect(pair?.kialo).toBe(
    source.kontrastParoj.find(
      (entry) => entry.name === "status-warning-basic-on-background-default",
    )?.kialo,
  );
}

// Question 5: "Was ist ein Aspekto?"
function verifyAspekto(answer: Json): void {
  const concept = readOntologio().concepts.find((entry) => entry.term === "Aspekto");
  expect(answer.definition).toEqual(concept?.definition);
  expect(answer.uri).toBe(concept?.uri);
  expect((answer.instances as { count: number; names: string[] }).names).toEqual(
    modeloJson.aspektoj.map((aspekto) => aspekto.name).sort(),
  );
  expect((answer.instances as { count: number }).count).toBe(modeloJson.aspektoj.length);
}

// Sechs Fragen, einmal gestellt und danach nur noch nachgerechnet. Sie werden im Hook gestellt,
// nicht beim Einsammeln der Dateien: Sonst liefe der ganze Dialog über eine Leitung, die zu diesem
// Zeitpunkt nur aufgebaut wurde, weil Vitest die Datei gelesen hat.
let answers: {
  describe: Json;
  explainSubtle: Json;
  checkContrast: Json;
  warningBorder: Json;
  aspekto: Json;
  marke: Json;
};

beforeAll(async () => {
  answers = {
    describe: await output(client, "describe"),
    explainSubtle: await output(client, "explain", Q2),
    checkContrast: await output(client, "check_contrast", {
      foreground: "color.text.muted",
      background: "color.background.sunken",
    }),
    warningBorder: await output(client, "explain", {
      token: "color.status.warning.border",
      assignment: { aspekto: "ekzemplo" },
    }),
    aspekto: await output(client, "describe_term", { term: "Aspekto" }),
    marke: await output(client, "describe_term", { term: "Marke" }),
  };
});

describe("S7 Gvidanto dialog with ekzemplo (Spec 002 AK-06)", () => {
  it("1 'Was gibt's hier?': describe", () => verifyDescribe(answers.describe));
  it("2 'Warum ist color.text.subtle in komuna, dark, high contrast dieser Wert?': explain", () =>
    verifyExplainSubtle(answers.explainSubtle));
  it("3 'Darf ich color.text.muted auf color.background.sunken setzen?': check_contrast", () =>
    verifyCheckContrast(answers.checkContrast));
  it("4 'Warum hat die Warnfläche in ekzemplo einen Rand?': explain on the border", () =>
    verifyWarningBorder(answers.warningBorder));
  it("5 'Was ist ein Aspekto?': describe_term, also for 'Marke'", () => {
    verifyAspekto(answers.aspekto);
    expect(answers.marke).toMatchObject({ term: "Aspekto", matchedBy: "altLabel" });
  });
});

describe("mutation check: one wrong number fails the dialog", () => {
  const bump = (value: Json, path: (string | number)[]) => {
    const copy = structuredClone(value) as Json;
    let node: Record<string | number, unknown> = copy;
    for (const key of path.slice(0, -1)) node = node[key] as Record<string | number, unknown>;
    const last = path.at(-1) as string | number;
    node[last] = (node[last] as number) + 1;
    return copy;
  };
  const subtlePair = () =>
    (answers.explainSubtle.kontrastParoj as { name: string }[]).findIndex(
      (entry) => entry.name === "text-subtle-on-background-default",
    );
  const borderPair = () =>
    (answers.warningBorder.kontrastParoj as { name: string }[]).findIndex(
      (entry) => entry.name === "status-warning-basic-on-background-default",
    );

  it.each([
    [
      "describe reguloj.automatic",
      () => verifyDescribe(bump(answers.describe, ["reguloj", "automatic"])),
    ],
    ["describe jugxoj.count", () => verifyDescribe(bump(answers.describe, ["jugxoj", "count"]))],
    [
      "explain pair ratio",
      () =>
        verifyExplainSubtle(
          bump(answers.explainSubtle, ["kontrastParoj", subtlePair(), "main", "ratio"]),
        ),
    ],
    [
      "check_contrast group ratio",
      () => verifyCheckContrast(bump(answers.checkContrast, ["results", 0, "ratio"])),
    ],
    [
      "check_contrast summary",
      () => verifyCheckContrast(bump(answers.checkContrast, ["summary", "combinations"])),
    ],
    [
      "border aux ratio",
      () =>
        verifyWarningBorder(
          bump(answers.warningBorder, ["kontrastParoj", borderPair(), "aux", "ratio"]),
        ),
    ],
    ["Aspekto instance count", () => verifyAspekto(bump(answers.aspekto, ["instances", "count"]))],
  ])("%s", (_label, verify) => {
    expect(verify).toThrow();
  });
});
