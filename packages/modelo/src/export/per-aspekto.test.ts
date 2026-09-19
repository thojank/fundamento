// Export per Aspekto (Spec 001, D-09, AK-10; task T019): one complete Tokens-Studio folder per
// Aspekto and core.referenceAspekto in modelo.json.

import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { ModeloJson } from "../contracts/modelo.js";
import { readModeloSchema } from "../contracts/schema.js";
import { buildModelo } from "../load/build.js";
import { readModeloFiles } from "../load/files.js";
import { defaultModeloSource, projectModeloSource } from "../load/source.js";
import type { TokensStudioMetadata, TokensStudioTheme } from "../themes/derive.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { exportModelo, type ModeloExport } from "./export-modelo.js";

function exportOf(source = defaultModeloSource()): ModeloExport {
  const { files } = readModeloFiles(source);
  if (files === undefined) throw new Error("did not read");
  return exportModelo({
    modelo: buildModelo(files).modelo,
    sets: files.sets,
    schema: readModeloSchema(),
  });
}

const EKZEMPLO = () =>
  projectModeloSource(`${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`);

const themes = (folder: Record<string, string> | undefined) =>
  JSON.parse(folder?.["$themes.json"] ?? "[]") as TokensStudioTheme[];

describe("modelo.json (FR-10)", () => {
  it("names the reference Aspekto under core", () => {
    const modeloJson = JSON.parse(exportOf().modeloJson) as ModeloJson & {
      core?: { referenceAspekto?: string };
    };
    expect(modeloJson.core).toEqual({ referenceAspekto: "komuna" });
  });
});

describe("Tokens-Studio folder per Aspekto (D-09)", () => {
  it("writes one complete folder for komuna in the repo", () => {
    const { vortaro } = exportOf();
    expect(Object.keys(vortaro)).toEqual(["komuna"]);
    const folder = vortaro.komuna ?? {};
    expect(folder["sets/core.json"]).toBeDefined();
    expect(folder["sets/aspekto/komuna.json"]).toBeDefined();
    expect(folder["sets/aspekto/komuna+color-scheme/dark.json"]).toBeDefined();
    expect(folder["sets/color-scheme/dark.json"]).toBeDefined();
    const metadata = JSON.parse(folder["$metadata.json"] ?? "{}") as TokensStudioMetadata;
    expect(metadata.tokenSetOrder[0]).toBe("core");
    expect(
      Object.keys(folder)
        .filter((file) => file.startsWith("sets/"))
        .map((file) => file.slice("sets/".length, -".json".length))
        .sort(),
    ).toEqual([...metadata.tokenSetOrder].sort());
    expect(
      themes(folder)
        .filter((theme) => theme.group === "aspekto")
        .map((t) => t.name),
    ).toEqual(["komuna"]);
  });

  it("keeps each brand in its own folder: no conjunction set leaks across Aspektoj (research §4)", () => {
    const { vortaro } = exportOf(EKZEMPLO());
    expect(Object.keys(vortaro)).toEqual(["ekzemplo", "komuna"]);
    const ekzemplo = vortaro.ekzemplo ?? {};
    expect(Object.keys(ekzemplo).some((file) => file.includes("aspekto/komuna"))).toBe(false);
    expect(ekzemplo["sets/aspekto/ekzemplo+color-scheme/dark.json"]).toBeDefined();
    expect(
      themes(ekzemplo)
        .filter((t) => t.group === "aspekto")
        .map((t) => t.name),
    ).toEqual(["ekzemplo"]);
    const dark = themes(ekzemplo).find((t) => t.group === "color-scheme" && t.name === "dark");
    expect(Object.keys(dark?.selectedTokenSets ?? {})).not.toContain(
      "aspekto/komuna+color-scheme/dark",
    );
  });

  // Four full exports (two with 144 combinations): ~2.5 s alone, more on a loaded CI runner.
  it("is byte-identical over two exports, with and without the external package (AK-10)", {
    timeout: 30_000,
  }, () => {
    const hash = (value: ModeloExport) =>
      createHash("sha256").update(JSON.stringify(value)).digest("hex");
    expect(hash(exportOf())).toBe(hash(exportOf()));
    expect(hash(exportOf(EKZEMPLO()))).toBe(hash(exportOf(EKZEMPLO())));
  });
});
