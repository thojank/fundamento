// Tailwind v4 Celo (Spec 003 T010; FR-06, plan D-06, Constitution v1.6 Art. XII): tokens in the
// @theme under the namespace fm (--color-fm-* -> bg-fm-*), never through prefix().

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { isNoTarget, nomRegulo, projectModeloSource } from "@fundamento/modelo";
import { compile } from "tailwindcss";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { TAILWIND_CELO } from "./tailwind.js";

const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
  import.meta.url,
).pathname;
const prepared = celoInputOf(projectModeloSource(config));
if (!prepared.ok) throw new Error("core + ekzemplo must be valid");
const files = TAILWIND_CELO.generate(prepared.input);
const theme = files.find((file) => file.path === "tailwind/fundamento.tailwind.css")?.text ?? "";

/** `--key: value` entries inside the @theme block. */
const entries = Object.fromEntries(
  [...theme.matchAll(/^ {2}(--[a-z0-9-]+): (.+);$/gm)].map((m) => [m[1] ?? "", m[2] ?? ""]),
);

describe("Tailwind Celo (T010)", () => {
  it("writes one @theme inline block", () => {
    expect(files.map((file) => file.path)).toEqual(["tailwind/fundamento.tailwind.css"]);
    expect(theme).toMatch(/^@theme inline \{$/m);
  });

  it("has an entry for every token with a Tailwind target, named by derive_name, valued var(--fm-…)", () => {
    const expected: Record<string, string> = {};
    for (const token of prepared.input.modeloJson.tokens) {
      const key = nomRegulo("tailwind").derive(token.name, token.type);
      if (isNoTarget(key)) continue;
      expected[key] = `var(${nomRegulo("css").derive(token.name)})`;
    }
    expect(Object.keys(expected).length).toBeGreaterThan(100);
    expect(entries).toEqual(expected);
  });

  it("never uses prefix()", () => {
    expect(theme).not.toMatch(/prefix\(/);
  });

  it("builds in Tailwind 4.3.3 next to the host's own, unprefixed utilities", async () => {
    const require = createRequire(import.meta.url);
    const tailwindDir = dirname(require.resolve("tailwindcss/package.json"));
    const compiler = await compile(`@import "tailwindcss";\n${theme}`, {
      base: tailwindDir,
      loadStylesheet: async (id: string, base: string) => {
        const path = id === "tailwindcss" ? `${tailwindDir}/index.css` : `${base}/${id}`;
        return { path, base: dirname(path), content: readFileSync(path, "utf8") };
      },
    });
    const css = compiler.build(["bg-fm-action-primary-rest", "bg-red-500", "p-fm-medium"]);
    expect(css).toMatch(
      /\.bg-fm-action-primary-rest \{\s*background-color: var\(--fm-color-action-primary-rest\);/,
    );
    expect(css).toMatch(/\.bg-red-500 \{/);
    expect(css).toMatch(/\.p-fm-medium \{\s*padding: var\(--fm-spacing-medium\);/);
  });
});
