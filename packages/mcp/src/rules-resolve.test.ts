// resolve, list_reguloj, list_jugxoj, validate and derive_name (Spec 001, D-13, FR-18,
// contracts/mcp-tools.md; task T025).

import {
  buildModelo,
  NOM_REGULOJ,
  projectModeloSource,
  readModeloFiles,
  resolve,
} from "@fundamento/modelo";
import { afterAll, describe, expect, it } from "vitest";
import {
  closeClients,
  connect,
  EKZEMPLO_CONFIG,
  EKZEMPLO_PACKAGE,
  INCOMPLETE_CONFIG,
  output,
} from "./test-doubles/client.js";

afterAll(closeClients);

type Issue = { rule: string; severity: string; path: string };
type Envelope = { issues: Issue[]; allowed?: string[] };
type Resolved = {
  assignment: Record<string, string>;
  tokens: Record<string, { value: unknown; origin: { set: string; package?: string } }>;
};
type Regulo = { id: string; name: string; aspekto?: string };

const INCOMPLETE_PACKAGE = new URL(
  "../../modelo/test/fixtures/invalid/aspekto-incomplete/aspekto-ekzemplo",
  import.meta.url,
).pathname;

describe("resolve", async () => {
  const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
  const { files } = readModeloFiles(projectModeloSource(EKZEMPLO_CONFIG));
  if (files === undefined) throw new Error("ekzemplo did not load");
  const direct = buildModelo(files).modelo;
  const DARK = { aspekto: "ekzemplo", "color-scheme": "dark" };

  it("equals the direct resolver, provenance and package included", async () => {
    const answer = await output<Resolved>(client, "resolve", {
      assignment: DARK,
      tokens: ["color.text.default"],
    });
    const expected = resolve(direct, DARK);
    if (!expected.ok) throw new Error("direct resolve failed");
    expect(Object.keys(answer.tokens)).toEqual(["color.text.default"]);
    expect(answer.tokens["color.text.default"]).toEqual(
      JSON.parse(JSON.stringify(expected.rezolvo.tokens["color.text.default"])),
    );
    expect(answer.tokens["color.text.default"]?.origin.set).toBe(
      "aspekto/ekzemplo+color-scheme/dark",
    );
    expect(answer.tokens["color.text.default"]?.origin.package).toBe("aspekto-ekzemplo");
    expect(answer.assignment).toEqual(expected.rezolvo.assignment);
  });

  it("fills defaults, matches prefixes by segment and returns every token without a filter", async () => {
    const byPrefix = await output<Resolved>(client, "resolve", { tokens: ["color.action"] });
    expect(Object.keys(byPrefix.assignment)).toHaveLength(6);
    expect(byPrefix.assignment.aspekto).toBe("komuna");
    expect(Object.keys(byPrefix.tokens)).toHaveLength(18);
    const all = await output<Resolved>(client, "resolve");
    expect(Object.keys(all.tokens)).toHaveLength(served.modeloJson.tokens.length);
  });

  it.each([
    [{ "colour-scheme": "dark" }, "resolve-unknown-dimensio", "aspekto"],
    [{ "color-scheme": "dim" }, "resolve-unknown-valoro", "light"],
    [{ aspekto: "nenia" }, "resolve-unknown-valoro", "ekzemplo"],
  ])("rejects %j with %s and the allowed names", async (assignment, rule, allowedName) => {
    const envelope = await output<Envelope>(client, "resolve", { assignment });
    expect(envelope.issues.map((issue) => issue.rule)).toEqual([rule]);
    expect(envelope.allowed).toContain(allowedName);
  });

  it("answers an unknown token with token-unknown", async () => {
    const envelope = await output<Envelope>(client, "resolve", { tokens: ["color.text.defualt"] });
    expect(envelope.issues[0]?.rule).toBe("token-unknown");
    expect(envelope.allowed?.[0]).toBe("color.text.default");
  });
});

describe("list_reguloj and list_jugxoj", async () => {
  const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
  const core = served.modeloJson.reguloj.filter((regulo) => regulo.aspekto === undefined);

  it("lists the core Reguloj without an Aspekto, and adds that Aspekto's with one", async () => {
    const plain = await output<{ reguloj: Regulo[] }>(client, "list_reguloj");
    expect(plain.reguloj.map((regulo) => regulo.name)).toEqual(
      core.map((regulo) => regulo.name).sort(),
    );
    const ekzemplo = await output<{ reguloj: Regulo[] }>(client, "list_reguloj", {
      aspekto: "ekzemplo",
    });
    expect(ekzemplo.reguloj).toHaveLength(core.length + 1);
    expect(ekzemplo.reguloj.find((regulo) => regulo.aspekto === "ekzemplo")?.name).toBe(
      "elevation-flat",
    );
  });

  it("filters by text and rejects an unknown Aspekto", async () => {
    const focus = await output<{ reguloj: Regulo[] }>(client, "list_reguloj", { text: "FOCUS" });
    expect(focus.reguloj.map((regulo) => regulo.name)).toContain("focus-ring-dual-contrast");
    const envelope = await output<Envelope>(client, "list_reguloj", { aspekto: "nenia" });
    expect(envelope.issues[0]?.rule).toBe("resolve-unknown-valoro");
    expect(envelope.allowed).toEqual(["komuna", "ekzemplo"]);
  });

  it("lists Jugxoj by reference", async () => {
    const all = await output<{ jugxoj: { id: string }[] }>(client, "list_jugxoj");
    expect(all.jugxoj).toHaveLength(served.modeloJson.jugxoj.length);
    const articleX = await output<{ jugxoj: { id: string; ref: { artikolo?: string } }[] }>(
      client,
      "list_jugxoj",
      { ref: { artikolo: "X" } },
    );
    expect(articleX.jugxoj.map((jugxo) => jugxo.id)).toContain("jug_01M2VRT7KQ77W91MVXB4GXSRZ4");
    expect(articleX.jugxoj.every((jugxo) => jugxo.ref.artikolo === "X")).toBe(true);
    const none = await output<{ jugxoj: unknown[] }>(client, "list_jugxoj", {
      ref: { regulo: "reg_01M2VEEE5280TGESDHQQ14EA33" },
      aspekto: "ekzemplo",
    });
    expect(none.jugxoj.length).toBeLessThanOrEqual(all.jugxoj.length);
  });
});

describe("validate", async () => {
  const repo = await connect();
  const incomplete = await connect({ config: INCOMPLETE_CONFIG });

  it("reports the served Modelo", async () => {
    expect(await output(repo.client, "validate")).toEqual({
      valid: true,
      errors: [],
      warnings: [],
      scope: "served",
    });
    const report = await output<{ valid: boolean; errors: Issue[] }>(incomplete.client, "validate");
    expect(report.valid).toBe(false);
    expect(report.errors).toHaveLength(4);
  });

  it("validates a local package against the served core", async () => {
    expect(await output(repo.client, "validate", { aspektoPath: EKZEMPLO_PACKAGE })).toMatchObject({
      valid: true,
      errors: [],
      scope: "package",
    });
    const broken = await output<{ valid: boolean; errors: Issue[]; scope: string }>(
      repo.client,
      "validate",
      { aspektoPath: INCOMPLETE_PACKAGE },
    );
    expect(broken.scope).toBe("package");
    expect(broken.valid).toBe(false);
    expect(broken.errors.map((issue) => issue.rule)).toContain("aspekto-incomplete");
  });
});

describe("derive_name", async () => {
  const { client, served } = await connect();

  it("derives the five Celoj with the Phase-0 NomReguloj", async () => {
    const name = "color.text.default";
    expect(await output(client, "derive_name", { name })).toEqual({
      name,
      derivations: {
        css: NOM_REGULOJ.css.derive(name, "color"),
        figma: NOM_REGULOJ.figma.derive(name, "color"),
        typescript: NOM_REGULOJ.typescript.derive(name, "color"),
        tailwind: NOM_REGULOJ.tailwind.derive(name, "color"),
        dtcg: NOM_REGULOJ.dtcg.derive(name, "color"),
      },
    });
    expect(await output(client, "derive_name", { name, celo: "figma" })).toEqual({
      name,
      derivations: { figma: NOM_REGULOJ.figma.derive(name, "color") },
    });
  });

  it("derives Tailwind names with fm in the theme key (Constitution v1.6, T002)", async () => {
    expect(
      await output(client, "derive_name", { name: "color.action.primary.rest", celo: "tailwind" }),
    ).toEqual({
      name: "color.action.primary.rest",
      derivations: { tailwind: "--color-fm-action-primary-rest" },
    });
  });

  it("omits Tailwind with a warning when there is no namespace", async () => {
    const opacity = served.modeloJson.tokens.find((token) => token.name.startsWith("opacity."));
    if (opacity === undefined) throw new Error("no opacity token");
    const answer = await output<{ derivations: Record<string, string>; issues: Issue[] }>(
      client,
      "derive_name",
      { name: opacity.name },
    );
    expect(Object.keys(answer.derivations)).toEqual(["css", "figma", "typescript", "dtcg"]);
    expect(answer.issues.map((issue) => [issue.rule, issue.severity])).toEqual([
      ["nomregulo-no-target", "warning"],
    ]);
  });

  it("rejects a name outside the grammar", async () => {
    const envelope = await output<Envelope>(client, "derive_name", { name: "Color.Text" });
    expect(envelope.issues[0]?.rule).toBe("token-name-grammar");
  });
});
