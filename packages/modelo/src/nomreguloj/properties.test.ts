import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { DTCG_TYPES, type DtcgType, isTokenName } from "../contracts/index.js";
import { CELOJ, isNoTarget, nomRegulo } from "./index.js";
import { TAILWIND_NAMESPACES } from "./tailwind.js";

// Property tests over random grammar-conforming names (AK-03). Fixed seed: offline, reproducible.
const PARAMS = { seed: 20260919, numRuns: 1000 } as const;

const segmentArb = fc.string({
  unit: fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789"),
  minLength: 1,
  maxLength: 6,
});

/** Namespace paths from the table, so a good share of names hits a Tailwind namespace. */
const namespacePrefixArb = fc.constantFrom(
  ...TAILWIND_NAMESPACES.map((namespace) => namespace.path),
);

const nameArb: fc.Arbitrary<string> = fc
  .tuple(
    fc.oneof(namespacePrefixArb, segmentArb),
    fc.array(segmentArb, { minLength: 0, maxLength: 6 }),
  )
  .map(([head, tail]) => [head, ...tail].join("."));

const typeArb: fc.Arbitrary<DtcgType> = fc.constantFrom(...DTCG_TYPES);

/** A namespace-prefixed name with one of the namespace's allowed types: a Tailwind hit. */
const tailwindCaseArb: fc.Arbitrary<readonly [string, DtcgType]> = fc
  .constantFrom(...TAILWIND_NAMESPACES)
  .chain((namespace) =>
    fc.tuple(
      fc
        .array(segmentArb, { minLength: 1, maxLength: 5 })
        .map((keys) => [namespace.path, ...keys].join(".")),
      fc.constantFrom(...namespace.types),
    ),
  );

/** Random (name, $type) pairs, half of them built to hit a Tailwind namespace. */
const caseArb: fc.Arbitrary<readonly [string, DtcgType]> = fc.oneof(
  fc.tuple(nameArb, typeArb),
  tailwindCaseArb,
);

/** Derives a Celo target that is known to be a string (every Celo except a Tailwind miss). */
function target(celo: (typeof CELOJ)[number], name: string, type: DtcgType): string | null {
  const result = nomRegulo(celo).derive(name, type);
  return isNoTarget(result) ? null : result;
}

describe("generated names are grammar-conforming", () => {
  it("nameArb only yields canonical names", () => {
    fc.assert(
      fc.property(nameArb, (name) => isTokenName(name)),
      PARAMS,
    );
  });

  it("a substantial share of names has a Tailwind target", () => {
    const sample = fc.sample(caseArb, { seed: PARAMS.seed, numRuns: 2000 });
    const hits = sample.filter(([name, type]) => target("tailwind", name, type) !== null);
    expect(hits.length).toBeGreaterThan(800);
  });
});

describe.each(CELOJ)("%s NomRegulo properties", (celo) => {
  it("is deterministic", () => {
    fc.assert(
      fc.property(caseArb, ([name, type]) => {
        expect(target(celo, name, type)).toBe(target(celo, name, type));
      }),
      PARAMS,
    );
  });

  it("is injective: distinct names give distinct targets", () => {
    fc.assert(
      fc.property(caseArb, caseArb, ([a, typeA], [b, typeB]) => {
        fc.pre(a !== b);
        const targetA = target(celo, a, typeA);
        const targetB = target(celo, b, typeB);
        fc.pre(targetA !== null && targetB !== null);
        expect(targetA).not.toBe(targetB);
      }),
      PARAMS,
    );
  });

  it("is injective over whole sets of names", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(caseArb, { minLength: 2, maxLength: 40, selector: ([name]) => name }),
        (cases) => {
          const targets = cases.flatMap(([name, type]) => {
            const result = target(celo, name, type);
            return result === null ? [] : [result];
          });
          expect(new Set(targets).size).toBe(targets.length);
        },
      ),
      PARAMS,
    );
  });

  it("round-trips: invert(derive(n)) === n (over names with a target)", () => {
    fc.assert(
      fc.property(caseArb, ([name, type]) => {
        const result = target(celo, name, type);
        fc.pre(result !== null);
        expect(nomRegulo(celo).invert(result ?? "")).toBe(name);
      }),
      PARAMS,
    );
  });

  it("invert accepts nothing that derive cannot produce", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 40 }), (candidate) => {
        const name = nomRegulo(celo).invert(candidate);
        if (name !== null) {
          expect(isTokenName(name)).toBe(true);
          const forward = nomRegulo(celo).derive(name, typeFor(name));
          expect(forward).toBe(candidate);
        }
      }),
      PARAMS,
    );
  });

  it("invert returns null for targets corrupted outside the target grammar", () => {
    const badChar = fc.constantFrom("A", "Z", "-", "_", " ", ".", "/", "ü", "é", '"', "[", "$");
    fc.assert(
      fc.property(caseArb, badChar, fc.nat(), ([name, type], char, position) => {
        const valid = target(celo, name, type);
        fc.pre(valid !== null);
        const text = valid ?? "";
        const index = position % (text.length + 1);
        const corrupted = text.slice(0, index) + char + text.slice(index);
        const inverted = nomRegulo(celo).invert(corrupted);
        // Some insertions stay inside the grammar (e.g. `-` or `.` between two segments, `/`
        // in Figma); then the result must be a different, round-tripping name.
        if (inverted !== null) {
          expect(inverted).not.toBe(name);
          expect(nomRegulo(celo).derive(inverted, typeFor(inverted))).toBe(corrupted);
        }
      }),
      PARAMS,
    );
  });

  it("invert returns null for strings with characters no target contains", () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 20 }),
        fc.constantFrom("A", "_", " ", "ü", "\n", "\t"),
        fc.string({ maxLength: 20 }),
        (before, char, after) => {
          expect(nomRegulo(celo).invert(before + char + after)).toBeNull();
        },
      ),
      PARAMS,
    );
  });
});

describe("tailwind keys carry fm after the namespace and name the CSS variable's segments", () => {
  it("dropping the fm segment of the key gives the CSS derivation's segments", () => {
    fc.assert(
      fc.property(caseArb, ([name, type]) => {
        const entry = target("tailwind", name, type);
        fc.pre(entry !== null);
        const segments = (entry ?? "").slice(2).split("-");
        const fm = segments.indexOf("fm");
        expect(fm).toBeGreaterThan(0);
        segments.splice(fm, 1);
        expect(`--fm-${segments.join("-")}`).toBe(nomRegulo("css").derive(name));
      }),
      PARAMS,
    );
  });
});

/** A $type allowed for the name's Tailwind namespace, so a Tailwind inverse re-derives. */
function typeFor(name: string): DtcgType {
  const segments = name.split(".");
  const namespace = [...TAILWIND_NAMESPACES]
    .sort((a, b) => b.path.split(".").length - a.path.split(".").length)
    .find((entry) => entry.path.split(".").every((segment, i) => segments[i] === segment));
  return namespace?.types[0] ?? "color";
}
