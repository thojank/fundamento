// Constitution v2.3 (Spec 024 Runde 2): the projections and the Eroj read the Ero-Tokens. The CSS
// Celo writes the third level as custom properties (an alias as var(), the case of a typography
// alias following its role), the Web Component Celo binds every part to its Ero-Token, the Figma
// Celo makes every Ero-Token a variable of the collection aspekto and binds the components to it,
// and every existing brand is pixel-equal: an Ero-Token resolves to the value of the role token the
// Skemo binds, in every brand and every mode (M-3).

import { fileURLToPath } from "node:url";
import {
  defaultModeloSource,
  eroTokenojOfModelo,
  projectModeloSource,
  resolveCombination,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "./build.js";
import { CSS_CELO } from "./celoj/css/css.js";
import { FIGMA_CELO } from "./celoj/figma/figma.js";
import { WEB_COMPONENT_CELO } from "./celoj/web-component/web-component.js";

const PROVOJ = fileURLToPath(
  new URL(
    "../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.provoj.config.json",
    import.meta.url,
  ),
);

const prepared = celoInputOf(projectModeloSource(PROVOJ));
if (!prepared.ok) throw new Error("The provoj Modelo does not load.");
const { input } = prepared;
const repo = celoInputOf(defaultModeloSource());
if (!repo.ok) throw new Error("The repository Modelo does not load.");

const text = (files: { path: string; text: string }[], path: string): string =>
  files.find((file) => file.path === path)?.text ?? "";

describe("CSS Celo: the third level as custom properties", () => {
  const css = text(CSS_CELO.generate(input), "css/fundamento.css");

  it("writes every Ero-Token of the core as an alias var() on its role token", () => {
    expect(css).toContain(
      "--fm-ero-butono-surface-fill-emphasis-high-intent-neutral-rest: var(--fm-color-action-primary-rest);",
    );
    expect(css).toContain("--fm-sxablono-pagxo-frame-gap: var(--fm-spacing-xlarge);");
  });

  it("a typography Ero-Token follows the case of its role (text-transform as var())", () => {
    expect(css).toContain(
      "--fm-ero-teksto-text-typography-kind-kicker-size-1-text-transform: var(--fm-typography-kicker-text-transform);",
    );
    expect(css).toContain(
      "--fm-ero-butono-label-typography-size-medium-font-family: var(--fm-typography-label-1-font-family);",
    );
  });

  it("every brand assigns the Ero-Tokens in its own block, as aliases", () => {
    const provo = css.slice(
      css.indexOf("/* set aspekto/provo */"),
      css.indexOf("/* set aspekto/provo+"),
    );
    expect(provo).toContain(
      "--fm-ero-butono-surface-fill-emphasis-high-intent-neutral-rest: var(--fm-color-action-primary-rest);",
    );
  });
});

describe("Web Component Celo: the Eroj read the Ero-Tokens", () => {
  const files = WEB_COMPONENT_CELO.generate(input);

  it("binds every part of the butono to its Ero-Token, no role token in the stylesheet", () => {
    const sheet = text(files, "eroj/src/generated/butono.styles.ts");
    expect(sheet).toContain("var(--fm-ero-butono-surface-fill-emphasis-high-intent-neutral-rest)");
    expect(sheet).toContain("var(--fm-ero-butono-surface-fill-emphasis-high-intent-neutral-hover)");
    expect(sheet).toContain("var(--fm-ero-butono-label-typography-size-small-font-size)");
    expect(sheet).toContain("var(--fm-ero-butono-box-radius)");
    expect(sheet).not.toContain("var(--fm-color-action-primary-rest)");
    expect(sheet).not.toContain("var(--fm-typography-label-1-font-size)");
  });

  it("a keyword binding stays a keyword (the inline link inherits) and a Sxablono reads its own tokens", () => {
    const ligilo = text(files, "eroj/src/generated/ligilo.styles.ts");
    expect(ligilo).toContain("display: inline;");
    const pagxo = text(files, "eroj/src/generated/pagxo.styles.ts");
    expect(pagxo).toContain("var(--fm-sxablono-pagxo-frame-gap)");
    expect(pagxo).not.toContain("var(--fm-spacing-xlarge)");
  });
});

describe("Figma Celo: the Ero-Tokens as variables in the brand modes", () => {
  const plan = JSON.parse(text(FIGMA_CELO.generate(input), "figma/plan.json")) as {
    collections: {
      name: string;
      modes: string[];
      variables: { name: string; values: Record<string, unknown> }[];
    }[];
    components: {
      set: string;
      variants: { props: Record<string, string>; bindings: Record<string, string> }[];
    }[];
  };
  const aspekto = plan.collections.find((collection) => collection.name === "aspekto");

  it("every Ero-Token is a variable of the collection aspekto, each brand mode an alias on its role", () => {
    const variable = aspekto?.variables.find(
      (candidate) => candidate.name === "ero/butono/surface/fill/emphasis/high/intent/neutral/rest",
    );
    expect(variable).toBeDefined();
    expect(Object.keys(variable?.values ?? {}).sort()).toEqual([
      "komuna",
      "provo",
      "provo-kompakta",
    ]);
    expect(variable?.values.provo).toEqual({ alias: "color/action/primary/rest" });
    expect(
      aspekto?.variables.some((candidate) => candidate.name === "sxablono/pagxo/frame/gap"),
    ).toBe(true);
  });

  it("the components bind their parts to the Ero-Token variables", () => {
    const butono = plan.components.find((component) => component.set === "butono");
    const variant = butono?.variants.find(
      (candidate) =>
        candidate.props.emphasis === "high" &&
        candidate.props.intent === "neutral" &&
        candidate.props.size === "medium" &&
        candidate.props.state === "hover",
    );
    expect(variant?.bindings["surface.fill"]).toBe(
      "ero/butono/surface/fill/emphasis/high/intent/neutral/hover",
    );
    expect(variant?.bindings["label.typography"]).toBe("ero/butono/label/typography/size/medium");
  });

  it("counts the variables of the plan (measured for plan ②)", () => {
    const total = plan.collections.reduce(
      (sum, collection) => sum + collection.variables.length,
      0,
    );
    const ero = plan.collections.reduce(
      (sum, collection) =>
        sum + collection.variables.filter((v) => /^(ero|sxablono)\//.test(v.name)).length,
      0,
    );
    process.stderr.write(`Figma variables: ${total}, of them ${ero} of the third level\n`);
    expect(ero).toBeGreaterThan(900);
  });
});

describe("M-3: every existing brand is pixel-equal after the migration", () => {
  it("an Ero-Token resolves to the value of its role token in every brand, scheme and contrast", () => {
    const differences: string[] = [];
    const tokens = eroTokenojOfModelo(input.modelo);
    // Spec 029 ①b b): komuna sets the Ero-Tokens with a counterpart in the Fonto to the values of the
    // Fonto (each with its origin in deveno.json); every other Ero-Token of komuna, and every token
    // of every other brand, still resolves to its role.
    const fromFonto = new Set(
      (input.modelo.deveno ?? [])
        .filter((entry) => entry.token.startsWith("ero."))
        .map((entry) => entry.token),
    );
    for (const aspekto of ["komuna", "provo", "provo-kompakta"]) {
      for (const scheme of ["light", "dark"]) {
        for (const contrast of ["default", "high"]) {
          const { tokens: resolved } = resolveCombination(input.modelo, {
            aspekto,
            "color-scheme": scheme,
            contrast,
          });
          for (const token of tokens) {
            if (aspekto === "komuna" && fromFonto.has(token.name)) continue;
            if (
              JSON.stringify(resolved[token.name]?.value) !==
              JSON.stringify(resolved[token.alias]?.value)
            )
              differences.push(`${aspekto} ${scheme} ${contrast} ${token.name}`);
          }
        }
      }
    }
    expect(differences).toEqual([]);
  });

  it("the same for ekzemplo of the repository release path", () => {
    const ekzemplo = celoInputOf(
      projectModeloSource(
        fileURLToPath(
          new URL(
            "../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
            import.meta.url,
          ),
        ),
      ),
    );
    if (!ekzemplo.ok) throw new Error("ekzemplo");
    const { tokens: resolved } = resolveCombination(ekzemplo.input.modelo, { aspekto: "ekzemplo" });
    const differences = eroTokenojOfModelo(ekzemplo.input.modelo)
      .filter(
        (token) =>
          JSON.stringify(resolved[token.name]?.value) !==
          JSON.stringify(resolved[token.alias]?.value),
      )
      .map((token) => token.name);
    expect(differences).toEqual([]);
    expect(
      repo.input.modeloJson.tokens.filter((token) => token.name.startsWith("ero.")).length,
    ).toBeGreaterThan(800);
  });
});
