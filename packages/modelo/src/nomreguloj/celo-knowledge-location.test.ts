import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as contracts from "../contracts/index.js";
import * as modelo from "../index.js";
import * as nomreguloj from "./index.js";
import { TAILWIND_NAMESPACES } from "./tailwind.js";

// Art. VIII / FR-13b: the Tailwind namespace table is Celo knowledge. It lives only in
// `src/nomreguloj/` and is reachable neither through the schema nor through `src/contracts`.
const here = dirname(fileURLToPath(import.meta.url));
const contractsDir = join(here, "..", "contracts");

const NAMESPACE_MARKERS = TAILWIND_NAMESPACES.map((entry) => entry.namespace);

describe("Tailwind namespace table location (Art. VIII)", () => {
  it("is a non-empty table in this module", () => {
    expect(NAMESPACE_MARKERS).toContain("--font-weight-*");
    expect(NAMESPACE_MARKERS).toContain("--color-*");
  });

  it("is not in the Modelo schema", () => {
    const text = JSON.stringify(contracts.readModeloSchema());
    for (const marker of NAMESPACE_MARKERS) {
      expect(text, marker).not.toContain(marker.replace("*", ""));
    }
    expect(text.toLowerCase()).not.toContain("tailwind");
  });

  it("is not exported through src/contracts", () => {
    const exported = Object.entries(contracts).filter(([, value]) => typeof value !== "function");
    const text = JSON.stringify(exported);
    for (const marker of NAMESPACE_MARKERS) {
      expect(text, marker).not.toContain(marker.replace("*", ""));
    }
    expect(Object.keys(contracts).some((key) => key.toLowerCase().includes("tailwind"))).toBe(
      false,
    );
  });

  it("is not referenced by any source file in src/contracts", () => {
    const files = readdirSync(contractsDir).filter((file) => file.endsWith(".ts"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files.filter((f) => !f.endsWith(".test.ts"))) {
      const source = readFileSync(join(contractsDir, file), "utf8");
      expect(source, file).not.toMatch(/nomreguloj|tailwind/i);
    }
  });

  it("is not part of the public NomReguloj surface", () => {
    expect(Object.keys(nomreguloj)).not.toContain("TAILWIND_NAMESPACES");
    expect(Object.keys(modelo)).not.toContain("TAILWIND_NAMESPACES");
    expect(modelo.NOM_REGULOJ).toBe(nomreguloj.NOM_REGULOJ);
    expect(JSON.stringify(nomreguloj.NOM_REGULOJ)).not.toContain("--font-weight-");
  });
});
