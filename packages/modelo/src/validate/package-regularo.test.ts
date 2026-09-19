// Reguloj and Jugxoj in Aspekto packages (Spec 001, D-10; task T021).

import { rmSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { projectModeloSource } from "../load/source.js";
import { fixtureRoot, mutatedFixture } from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

const configOf = (root: string) => `${root}/fundamento.config.json`;
const REGULOJ = "aspekto-ekzemplo/reguloj.json";

describe("package Reguloj (D-10)", () => {
  it("joins the Modelo's Regularo, scoped to the package's Aspekto", () => {
    const { modelo } = loadModelo(
      projectModeloSource(configOf(fixtureRoot("valid", "aspekto-ekzemplo"))),
    );
    const flat = modelo?.reguloj.find((regulo) => regulo.name === "elevation-flat");
    expect(flat?.aspekto).toBe("ekzemplo");
    expect(flat?.id).toMatch(/^reg_ekz_/);
    expect(modelo?.reguloj.filter((regulo) => regulo.aspekto === undefined).length).toBeGreaterThan(
      5,
    );
  });

  const errors = (change: (file: { reguloj: Record<string, unknown>[] }) => void) => {
    const root = mutatedFixture("aspekto-ekzemplo", (edit) => edit(REGULOJ, change));
    roots.push(root);
    return validateModelo(projectModeloSource(configOf(root))).errors.map((issue) => [
      issue.rule,
      issue.path.slice(issue.path.indexOf("aspekto-ekzemplo/")),
    ]);
  };

  it("reports regulo-kialo-missing in the package file", () => {
    expect(
      errors((file) => {
        delete file.reguloj[0]?.kialo;
      }),
    ).toEqual([["regulo-kialo-missing", `${REGULOJ}#/reguloj/0/kialo`]]);
  });

  it("reports regulo-aspekto-unknown for an Aspekto that is not loaded", () => {
    expect(
      errors((file) => {
        if (file.reguloj[0]) file.reguloj[0].aspekto = "alia";
      }),
    ).toEqual([["regulo-aspekto-unknown", `${REGULOJ}#/reguloj/0/aspekto`]]);
  });
});
