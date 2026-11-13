// Spec 052 A (K8I-002, AC-A3, AC-A4, V-3, D-052-04): an empty live region of a Sxablono takes no
// room in its frame and stays heard. The projector derives the live regions from `region.live` of
// the Skemo (no list of names), marks an empty one with `data-fm-leer` in `#render` (the same
// "filled" check as HIDEABLE) and writes one rule that takes `[part][data-fm-leer]` out of the flow
// on the pattern of `.fm-hidden` – no length, no `display: none`, no `hidden` – with the frame as
// its reference box. A Sxablono without a live region keeps its element and stylesheet byte for
// byte (the guard is green before the fix and must stay green after it).

import { createHash } from "node:crypto";
import {
  baseResolution,
  componentCssIssues,
  defaultModeloSource,
  type LoadedSxablono,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { sxablonoElementSource, sxablonoStylesheetOf } from "./sxablono-template.js";

const prepared = celoInputOf(defaultModeloSource());
if (!prepared.ok) throw new Error("the repo Modelo must be valid");
const { modelo } = prepared.input;
const base = baseResolution(modelo);
const sxablonoj = modelo.sxablonoj ?? [];

/** The live regions of a Sxablono, in Skemo order: what the projector must derive. */
const liveOf = (entry: LoadedSxablono): string[] =>
  entry.skemo.regions.filter((region) => region.live !== undefined).map((region) => region.name);

const entryOf = (name: string): LoadedSxablono => {
  const entry = sxablonoj.find((candidate) => candidate.sxablono.name === name);
  if (entry === undefined) throw new Error(`the repo Modelo has no Sxablono ${name}`);
  return entry;
};

/** The body of `#render()` in a generated element module (up to its closing brace). */
function renderBodyOf(source: string): string {
  const start = source.indexOf("#render(): void {");
  if (start === -1) return "";
  const end = source.indexOf("\n  }\n", start);
  return source.slice(start, end === -1 ? undefined : end);
}

/** The declarations of the rule with exactly this selector, or undefined. */
function declarationsOf(css: string, selector: string): string[] | undefined {
  for (const line of css.split("\n")) {
    const match = /^(.+?) \{ (.*) \}$/.exec(line.trim());
    if (match?.[1] !== selector) continue;
    return (match[2] ?? "")
      .split(";")
      .map((declaration) => declaration.trim())
      .filter((declaration) => declaration !== "")
      .sort();
  }
  return undefined;
}

/** D-052-04: the pattern of `.fm-hidden` without a length. */
const LEER_RULE = [
  "clip-path: inset(50%)",
  "overflow: hidden",
  "position: absolute",
  "white-space: nowrap",
];

/** What the element module of a Sxablono with live regions must state (V-3). */
function liveFindings(entry: LoadedSxablono): string[] {
  const name = entry.sxablono.name;
  const live = liveOf(entry);
  const findings: string[] = [];
  for (const [label, source] of [
    ["module", sxablonoElementSource(entry)],
    ["inline", sxablonoElementSource(entry, { inline: true })],
  ] as const) {
    if (!source.includes(`const LIVE: readonly string[] = ${JSON.stringify(live)};`))
      findings.push(`${name} ${label}: no LIVE list ${JSON.stringify(live)}`);
    const render = renderBodyOf(source);
    if (!render.includes("for (const region of LIVE)"))
      findings.push(`${name} ${label}: #render does not walk LIVE`);
    const toggles = render.includes('toggleAttribute("data-fm-leer"');
    const setsAndRemoves =
      render.includes('setAttribute("data-fm-leer"') &&
      render.includes('removeAttribute("data-fm-leer"');
    if (!toggles && !setsAndRemoves)
      findings.push(`${name} ${label}: #render does not set and remove data-fm-leer`);
  }
  const css = sxablonoStylesheetOf(entry, base);
  const leer = declarationsOf(css, "[part][data-fm-leer]");
  if (JSON.stringify(leer) !== JSON.stringify(LEER_RULE))
    findings.push(`${name} css: [part][data-fm-leer] is ${JSON.stringify(leer)}`);
  const frame = css
    .split("\n")
    .filter((line) => line.trim().startsWith('[part="frame"] {'))
    .join("\n");
  if (!frame.includes("position: relative;"))
    findings.push(`${name} css: the frame is no reference box (position: relative)`);
  return findings;
}

describe("Spec 052 A: the live regions come from region.live of the Skemo (AC-A3)", () => {
  it("the repo Modelo has live regions exactly in sxelo (notices) and filtrilo (status)", () => {
    // The precondition of the cases below, read from the Modelo, not assumed.
    expect(
      Object.fromEntries(
        sxablonoj
          .filter((entry) => liveOf(entry).length > 0)
          .map((entry) => [entry.sxablono.name, liveOf(entry)]),
      ),
    ).toEqual({ filtrilo: ["status"], sxelo: ["notices"] });
  });

  for (const name of ["sxelo", "filtrilo"]) {
    it(`${name}: LIVE, data-fm-leer in #render, the rule and the reference box (module and inline)`, () => {
      expect(liveFindings(entryOf(name))).toEqual([]);
    });
  }

  it("every Sxablono with a live region gets the rule (the set from the Modelo)", () => {
    const withLive = sxablonoj.filter((entry) => liveOf(entry).length > 0);
    expect(withLive.length).toBeGreaterThan(0);
    expect(withLive.flatMap(liveFindings)).toEqual([]);
  });

  it("a test copy with live on another region gives that region, without a name list", () => {
    const pagxo = entryOf("pagxo");
    expect(liveOf(pagxo)).toEqual([]);
    const copy: LoadedSxablono = {
      ...pagxo,
      skemo: {
        ...pagxo.skemo,
        regions: pagxo.skemo.regions.map((region) =>
          region.name === "subtitle" ? { ...region, live: "polite" } : region,
        ),
      },
    };
    expect(liveOf(copy)).toEqual(["subtitle"]);
    expect(liveFindings(copy)).toEqual([]);
    // And the other way round: sxelo without live on notices has no live code at all.
    const sxelo = entryOf("sxelo");
    const silent: LoadedSxablono = {
      ...sxelo,
      skemo: {
        ...sxelo.skemo,
        regions: sxelo.skemo.regions.map(({ live: _live, ...region }) => region),
      },
    };
    expect(sxablonoElementSource(silent)).not.toContain("data-fm-leer");
    expect(sxablonoElementSource(silent)).not.toContain("const LIVE");
    expect(sxablonoStylesheetOf(silent, base)).not.toContain("data-fm-leer");
  });

  it("the stylesheet of every Sxablono with live passes componentCssIssues (D-052-04)", () => {
    const issues = sxablonoj
      .filter((entry) => liveOf(entry).length > 0)
      .flatMap((entry) =>
        componentCssIssues(`${entry.sxablono.name}.css`, sxablonoStylesheetOf(entry, base)).map(
          (issue) => `${entry.sxablono.name}: ${issue.message}`,
        ),
      );
    expect(issues).toEqual([]);
  });

  it("the empty live region is never hidden, display: none or display: contents", () => {
    const findings: string[] = [];
    for (const entry of sxablonoj.filter((candidate) => liveOf(candidate).length > 0)) {
      const leer = declarationsOf(sxablonoStylesheetOf(entry, base), "[part][data-fm-leer]") ?? [];
      for (const declaration of leer)
        if (/^display:/.test(declaration)) findings.push(`${entry.sxablono.name}: ${declaration}`);
      const render = renderBodyOf(sxablonoElementSource(entry));
      // The loop over LIVE must not touch `hidden` (that is HIDEABLE's).
      const loop = render.slice(render.indexOf("for (const region of LIVE)"));
      const own = loop.slice(0, loop.indexOf("\n    }\n") + 1);
      if (own.includes(".hidden")) findings.push(`${entry.sxablono.name}: LIVE sets hidden`);
    }
    expect(findings).toEqual([]);
  });
});

// The guard (AC-A4): the SHA-256 of the element module, the inline element and the stylesheet of
// every Sxablono without a live region, taken on the state before the fix (K8I-002, on 662ed28f).
// The set of Sxablonoj is derived from the Modelo; a new Sxablono without live has to be pinned
// here on purpose.
const PINNED: Readonly<Record<string, { module: string; inline: string; css: string }>> = {
  formularo: {
    module: "bed3e6d34c5eb844deced219ef42a7160a99fbc03fc43ad5f387fcf43058216c",
    inline: "6c36b56bb86127fe319a305e92e4d339fee33c1e3a83559d6f4bd3d437c59dd0",
    css: "4cf3280a5d22f93fba6ec64afff53ee719022d4d8e3e83aa3683eb15be260e49",
  },
  pagxo: {
    module: "bef48a4b860e574fa78d80fd07f0b64a2831056921b813d1b22596520edf4f03",
    inline: "9473733b103f0a6000ae4433aea5142613b09b8da3d5835defb6bda2815ffc3e",
    css: "182591d05def60eb464d5f1ad062dc11e7157286ae24195eb97bdc119ac6f1d6",
  },
  redaktilo: {
    module: "3dbc8f540840686ee74fdb3a13e6f3d3bd07c2c20e4281bb1460c9dbcd4102d7",
    inline: "8c1883597beddde26d9bd490109500bfe648b74aac22132754e8755c0f9439a6",
    css: "ff037faa8bc5a438f13d7030fac68438ba449628c42c3d9be78e50f1f880532d",
  },
};

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");

describe("Spec 052 A guard: a Sxablono without live stays byte-identical (AC-A4)", () => {
  it("pins exactly the Sxablonoj of the Modelo that have no live region", () => {
    const without = sxablonoj
      .filter((entry) => liveOf(entry).length === 0)
      .map((entry) => entry.sxablono.name)
      .sort();
    expect(without.length).toBeGreaterThan(0);
    expect(Object.keys(PINNED).sort()).toEqual(without);
  });

  it("element module, inline element and stylesheet keep their bytes", () => {
    const actual = Object.fromEntries(
      sxablonoj
        .filter((entry) => liveOf(entry).length === 0)
        .map((entry) => [
          entry.sxablono.name,
          {
            module: sha256(sxablonoElementSource(entry)),
            inline: sha256(sxablonoElementSource(entry, { inline: true })),
            css: sha256(sxablonoStylesheetOf(entry, base)),
          },
        ]),
    );
    expect(actual).toEqual(PINNED);
  });
});
