// The K8 twin (Spec 038 T-2, E-4, D-06): nordstelo's `k8/faktoj.ts` and ekranoj's
// `aspekto-faktoj.ts` must turn the same DOM into the same facts. Without a browser: (1) the two
// browser parts are the same source after normalising `Function.prototype.toString()`, (2) both
// normalisers give the same output for the cases of `faktoj.test.ts` and for the stored K8 facts
// of the fixture `ablauf-038/post`, which are a fixed point, (3) a deliberately changed copy makes
// (1) resp. (2) red.
//
// The two sides reach this test in different shapes: `@fundamento/ekranoj` from its `dist` (built
// by tsc), `./faktoj.js` transformed by Vitest. Proven on the real pair (S038-29), they differ only
// in whitespace and indentation, in comments (the JSDoc text inside `aspektoFaktojEnPagxo` names
// the other package) and in trailing commas (tsc keeps them, the Vitest transform drops them).
// So the normalisation cuts the source into tokens – string, template and regex literals stay
// whole – and drops exactly: comments, whitespace between tokens, a trailing comma before `)`, `]`
// or `}` (not after `,` or `[`, where it would make an array hole), and the function's own name.
// Nothing else (no quotes, no parentheses, no identifiers) is touched; a remaining difference is a
// finding, not a reason to loosen this (R-6).

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  aspektoFaktojEnPagxo as ekranojAspekto,
  normigiAspektoFaktojn as ekranojNormigi,
  sondojEnPagxo as ekranojSondoj,
} from "@fundamento/ekranoj";
import { describe, expect, it } from "vitest";
import { stabilaJson } from "../ablauf/raporto.js";
import type { Facts, FaktoAspekto } from "../facts.js";
import {
  aspektoFaktojEnPagxo,
  type FaktoAspektoKruda,
  normigiAspektoFaktojn,
  sondojEnPagxo,
} from "./faktoj.js";
import { KRUDA, NORMIGAJ_KAZOJ } from "./test-doubles/aspekto-kazoj.js";

const POST = fileURLToPath(new URL("../../test/fixtures/ablauf-038/post", import.meta.url));

/** Tokens after which a `/` starts a regex literal, not a division. */
const ANTAUX_REGULESPRIMO = new Set([
  ...["(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "<", ">"],
  ...["~", "^", "=>", "&&", "||", "??", "===", "!==", "==", "!=", "return", "typeof", "case"],
  ...["in", "of"],
]);

const SIGNO =
  /^(?:[A-Za-z_$][\w$]*|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?|\.\.\.|===|!==|\?\?=|\?\.|\?\?|=>|&&|\|\||==|!=|<=|>=|\+\+|--|[+\-*/%]=|[\s\S])/;

/** The end (exclusive) of the quoted literal that starts at `i`. */
function finoDeCitajxo(fonto: string, i: number): number {
  const cito = fonto[i];
  let j = i + 1;
  while (j < fonto.length && fonto[j] !== cito) j += fonto[j] === "\\" ? 2 : 1;
  return j + 1;
}

/** The end (exclusive) of the template literal that starts at `i`, `${…}` nested. */
function finoDeSxablono(fonto: string, i: number): number {
  let j = i + 1;
  let profundo = 0;
  while (j < fonto.length && !(fonto[j] === "`" && profundo === 0)) {
    if (fonto[j] === "\\") j += 2;
    else if (fonto.startsWith("${", j)) {
      profundo += 1;
      j += 2;
    } else {
      if (fonto[j] === "}" && profundo > 0) profundo -= 1;
      j += 1;
    }
  }
  return j + 1;
}

/** The end (exclusive) of the regex literal (with flags) that starts at `i`. */
function finoDeRegulesprimo(fonto: string, i: number): number {
  let j = i + 1;
  let klaso = false;
  while (j < fonto.length && (klaso || fonto[j] !== "/")) {
    if (fonto[j] === "\\") j += 2;
    else {
      if (fonto[j] === "[") klaso = true;
      else if (fonto[j] === "]") klaso = false;
      j += 1;
    }
  }
  j += 1;
  while (j < fonto.length && /[a-z]/i.test(fonto[j] ?? "")) j += 1;
  return j;
}

/** The tokens of `fonto` without whitespace and comments; literals stay whole. */
function signojDe(fonto: string): string[] {
  const signoj: string[] = [];
  let i = 0;
  while (i < fonto.length) {
    const c = fonto[i] ?? "";
    let fino: number;
    if (/\s/.test(c)) {
      i += 1;
      continue;
    }
    if (fonto.startsWith("//", i)) {
      const linio = fonto.indexOf("\n", i);
      i = linio < 0 ? fonto.length : linio;
      continue;
    }
    if (fonto.startsWith("/*", i)) {
      const fermo = fonto.indexOf("*/", i + 2);
      i = fermo < 0 ? fonto.length : fermo + 2;
      continue;
    }
    if (c === '"' || c === "'") fino = finoDeCitajxo(fonto, i);
    else if (c === "`") fino = finoDeSxablono(fonto, i);
    else if (c === "/" && (signoj.length === 0 || ANTAUX_REGULESPRIMO.has(signoj.at(-1) ?? "")))
      fino = finoDeRegulesprimo(fonto, i);
    else fino = i + (SIGNO.exec(fonto.slice(i))?.[0].length ?? 1);
    signoj.push(fonto.slice(i, fino));
    i = fino;
  }
  return signoj;
}

const FERMILOJ = new Set([")", "]", "}"]);

/** `Function.prototype.toString()` normalised: comments, whitespace, trailing comma, name. */
function normigitaFonto(fonto: string): string[] {
  const signoj = signojDe(fonto).filter(
    (signo, k, cxiuj) =>
      !(
        signo === "," &&
        FERMILOJ.has(cxiuj[k + 1] ?? "") &&
        cxiuj[k - 1] !== "," &&
        cxiuj[k - 1] !== "["
      ),
  );
  return signoj[0] === "function" && signoj[2] === "(" ? ["function", ...signoj.slice(2)] : signoj;
}

type Normigilo = (kruda: FaktoAspektoKruda) => FaktoAspekto;

/** The names of the cases where the two normalisers give different JSON. */
function malsamajKazoj(
  a: Normigilo,
  b: Normigilo,
  kazoj: readonly (readonly [string, FaktoAspektoKruda])[],
): string[] {
  return kazoj.flatMap(([nomo, kruda]) =>
    stabilaJson(a(kruda)) === stabilaJson(b(kruda)) ? [] : [nomo],
  );
}

/** Every stored `k8` of the fact files below `dir`, named by file, brand and scheme. */
function k8DeFiksajxo(dir: string): [string, FaktoAspekto][] {
  return readdirSync(dir).flatMap((nomo): [string, FaktoAspekto][] => {
    const vojo = join(dir, nomo);
    if (statSync(vojo).isDirectory()) return k8DeFiksajxo(vojo);
    if (!nomo.endsWith(".fakto.json")) return [];
    const fakto = JSON.parse(readFileSync(vojo, "utf8")) as Facts;
    return fakto.renders.flatMap((render, k): [string, FaktoAspekto][] =>
      render.k8 === undefined
        ? []
        : [[`${vojo.slice(POST.length + 1)} #${k} ${render.aspekto} ${render.scheme}`, render.k8]],
    );
  });
}

/** The browser parts: name, nordstelo's copy, ekranoj's copy. */
const BROWSER_PARTOJ = [
  ["aspektoFaktojEnPagxo", aspektoFaktojEnPagxo, ekranojAspekto],
  ["sondojEnPagxo", sondojEnPagxo, ekranojSondoj],
] as const;

/** Template literals with a placeholder, built so the test source holds no `${` in a string. */
const SXABLONO_KUN_SPACO = ["`a $", "{x}`"].join("");
const SXABLONO_SEN_SPACO = ["`a$", "{x}`"].join("");

describe("the K8 twin (T-2, E-4)", () => {
  describe("the normalisation of the source", () => {
    it("keeps literals whole and drops only comments, whitespace, a trailing comma and the name", () => {
      expect(normigitaFonto("function a() {\n  // x\n  return [1, 2,];\n}")).toEqual(
        normigitaFonto("function b(){/* y */return [1,2];}"),
      );
      expect(normigitaFonto('function a() { return "a b"; }')).not.toEqual(
        normigitaFonto('function a() { return "ab"; }'),
      );
      expect(normigitaFonto('function a(x) { return x.replace(/ a /g, ""); }')).not.toEqual(
        normigitaFonto('function a(x) { return x.replace(/a/g, ""); }'),
      );
      expect(normigitaFonto(`function a(x) { return ${SXABLONO_KUN_SPACO}; }`)).not.toEqual(
        normigitaFonto(`function a(x) { return ${SXABLONO_SEN_SPACO}; }`),
      );
      expect(normigitaFonto("function a() { return [,]; }")).not.toEqual(
        normigitaFonto("function a() { return []; }"),
      );
      expect(normigitaFonto("function a() { return 1 / 2 / 3; }")).toEqual([
        ...["function", "(", ")", "{", "return", "1", "/", "2", "/", "3", ";", "}"],
      ]);
    });
  });

  it.each(BROWSER_PARTOJ)(
    "(1) %s is the same source in nordstelo and ekranoj",
    (_nomo, nia, ilia) => {
      const niaFonto = normigitaFonto(nia.toString());
      expect(niaFonto.length).toBeGreaterThan(100);
      expect(normigitaFonto(ilia.toString())).toEqual(niaFonto);
    },
  );

  it("(2) both normalisers give the same output for the cases of faktoj.test.ts", () => {
    expect(NORMIGAJ_KAZOJ.length).toBe(4);
    expect(malsamajKazoj(normigiAspektoFaktojn, ekranojNormigi, NORMIGAJ_KAZOJ)).toEqual([]);
  });

  it("(2) both give the same output for the stored K8 facts of ablauf-038/post, a fixed point", () => {
    const k8 = k8DeFiksajxo(POST);
    expect(k8.length).toBe(16);
    expect(malsamajKazoj(normigiAspektoFaktojn, ekranojNormigi, k8)).toEqual([]);
    const neFiksaj = k8.flatMap(([nomo, faktoj]) =>
      stabilaJson(normigiAspektoFaktojn(faktoj)) === stabilaJson(faktoj) ? [] : [nomo],
    );
    expect(neFiksaj).toEqual([]);
  });

  describe("(3) a deliberately changed copy makes the comparison red", () => {
    it("(1) is red for a copy of aspektoFaktojEnPagxo with another element list", () => {
      const fonto = ekranojAspekto.toString();
      const sxangxita = fonto.replace(/"ol",?(\s*)\]/, "$1]");
      expect(sxangxita).not.toBe(fonto);
      expect(normigitaFonto(sxangxita)).not.toEqual(
        normigitaFonto(aspektoFaktojEnPagxo.toString()),
      );
    });

    it("(1) stays green for a copy that changes only comments, whitespace and the name", () => {
      const fonto = ekranojSondoj.toString();
      const sxangxita = `/* kopio */ ${fonto.replace("function sondojEnPagxo", "function  kopio").replace(/\n/g, "\n\n  // -\n")}`;
      expect(sxangxita).not.toBe(fonto);
      expect(normigitaFonto(sxangxita)).toEqual(normigitaFonto(sondojEnPagxo.toString()));
    });

    it("(2) is red for a copy of normigiAspektoFaktojn that rounds px to 0.1", () => {
      const kopio: Normigilo = (kruda) => {
        const normigita = ekranojNormigi(kruda);
        return {
          ...normigita,
          interspacoj: normigita.interspacoj.map((interspaco) => ({
            ...interspaco,
            px: Math.round(interspaco.px * 10) / 10,
          })),
        };
      };
      expect(malsamajKazoj(normigiAspektoFaktojn, kopio, NORMIGAJ_KAZOJ)).toEqual([
        "KRUDA",
        "KRUDA permutita",
      ]);
      expect(stabilaJson(kopio(KRUDA))).not.toBe(stabilaJson(normigiAspektoFaktojn(KRUDA)));
    });
  });
});
