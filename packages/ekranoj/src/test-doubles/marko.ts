// A brand-build double (C-6 `Marko`): writes a small stylesheet with invented token values per
// brand and a tiny self-contained element module, as the Make Kit's `element.js` is one. The two
// brands differ in their values only; the tests read the values from the written files (AC-7).
// Neutral, invented values; no real brand is built here.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Marko, MarkoKonstruo } from "../tipoj.js";

/** Invented token values per repo brand name (only the two the AC-7 tests compare). */
const VALOROJ: Record<string, Record<string, string>> = {
  komuna: {
    "--fm-agado-fono": "oklch(0.42 0.11 250)",
    "--fm-agado-teksto": "oklch(0.98 0.01 250)",
    "--fm-spaco-meza": "0.875rem",
  },
  provo: {
    "--fm-agado-fono": "oklch(0.51 0.19 310)",
    "--fm-agado-teksto": "oklch(0.97 0.02 310)",
    "--fm-spaco-meza": "1.125rem",
  },
};

export const ELEMENTA_MODULO = [
  "//#region src/element.ts",
  "class FmProvilo extends HTMLElement {}",
  "function defineFmProvilo() {",
  '\tif (typeof customElements === "undefined" || customElements.get("fm-provilo") !== void 0) return;',
  '\tcustomElements.define("fm-provilo", FmProvilo);',
  "}",
  "defineFmProvilo();",
  "//#endregion",
  "export { FmProvilo, defineFmProvilo };",
  "",
].join("\n");

export class MarkoDouble implements Marko {
  readonly dosierujoj: string[] = [];
  readonly #aspekto: string;

  constructor(aspekto: string) {
    this.#aspekto = aspekto;
  }

  async konstrui(dir: string): Promise<MarkoKonstruo> {
    this.dosierujoj.push(dir);
    const valoroj = VALOROJ[this.#aspekto] ?? {};
    const deklaroj = Object.entries(valoroj).map(([nomo, valoro]) => `  ${nomo}: ${valoro};`);
    mkdirSync(join(dir, "css"), { recursive: true });
    writeFileSync(
      join(dir, "css", "fundamento.css"),
      `:root[data-fm-aspekto="${this.#aspekto}"] {\n${deklaroj.join("\n")}\n}\n`,
    );
    mkdirSync(join(dir, "make-kit", this.#aspekto, "dist"), { recursive: true });
    writeFileSync(join(dir, "make-kit", this.#aspekto, "dist", "element.js"), ELEMENTA_MODULO);
    return {
      css: ["css/fundamento.css"],
      skripto: `make-kit/${this.#aspekto}/dist/element.js`,
    };
  }
}
