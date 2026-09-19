import { describe, expect, it } from "vitest";
import { readModeloFiles } from "../load/files.js";
import { fixtureModeloSource } from "../load/source.js";
import { collectIdOccurrences } from "./id-occurrences.js";
import { fixtureRoot } from "./test-doubles/fixtures.js";

const minimalFiles = () => {
  const { files } = readModeloFiles(fixtureModeloSource(fixtureRoot("valid", "minimal")));
  if (files === undefined) throw new Error("valid/minimal did not read");
  return files;
};

describe("collectIdOccurrences", () => {
  it("collects every entity of the minimal fixture", () => {
    const occurrences = collectIdOccurrences(minimalFiles());
    const count = (type: string) => occurrences.filter((o) => o.entityType === type).length;
    expect(occurrences).toHaveLength(20);
    expect(count("token")).toBe(8);
    expect(count("tokenSet")).toBe(4);
    expect(count("dimensio")).toBe(2);
    expect(count("dimensioValoro")).toBe(4);
    expect(count("regulo")).toBe(1);
    expect(count("kontrastParo")).toBe(1);
    expect(occurrences.every((o) => !o.location.file.endsWith("$themes.json"))).toBe(true);
  });

  it("points at the id value itself", () => {
    const occurrences = collectIdOccurrences(minimalFiles());
    expect(occurrences).toContainEqual({
      id: "tok_01K5FMAJ0FRV73CQ8J0CJ9HV5S",
      entityType: "token",
      location: {
        file: "vortaro/sets/core.json",
        pointer: "/color/text/default/$extensions/com.ciferecigo.fundamento/id",
      },
    });
    expect(occurrences).toContainEqual({
      id: "dva_01K5FMAJ02GHG044FZ9966Q9ZB",
      entityType: "dimensioValoro",
      location: { file: "data/dimensioj.json", pointer: "/dimensioj/0/valoroj/1/id" },
    });
    expect(occurrences).toContainEqual({
      id: "set_01K5FMAJ07WSBKK3Q3SN0DG7H3",
      entityType: "tokenSet",
      location: {
        file: "vortaro/sets/color-scheme/dark.json",
        pointer: "/$extensions/com.ciferecigo.fundamento/id",
      },
    });
  });

  it("collects only core token definitions, not overrides", () => {
    const occurrences = collectIdOccurrences(minimalFiles());
    expect(
      occurrences.filter(
        (o) => o.entityType === "token" && o.location.file !== "vortaro/sets/core.json",
      ),
    ).toEqual([]);
  });

  it("points at the entity when the id is missing", () => {
    const files = minimalFiles();
    const reguloj = files.data["reguloj.json"].value as { reguloj: Record<string, unknown>[] };
    const regulo = reguloj.reguloj[0];
    if (regulo !== undefined) delete regulo.id;
    expect(collectIdOccurrences(files)).toContainEqual({
      id: undefined,
      entityType: "regulo",
      location: { file: "data/reguloj.json", pointer: "/reguloj/0" },
    });
  });
});
