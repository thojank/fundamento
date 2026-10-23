// Nachlese 8 ② (Abnahme Spec 020, F-8 to F-13 and the collection guard): Figma shows the Sxablonoj
// as the Vitrino does at „mittel“ — each in a frame of its own, its regions laid out as on the
// web (the shell's head row, the page's title with badges beside the actions, the filter bar's
// row of fields above actions and count, the form a column, the editor's field beside its
// preview), the regions named as layers and never as visible words, the menu closed. The frame
// of the Sxablonoj has a surface bound to the background role, so it follows light and dark. The
// kodbloko is drawn as code in the code role with its copy button behind copyable; the markdovido
// shows a paragraph, a list and a quote. A core token lives in the collection aspekto whatever
// brands a build has.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultModeloSource, projectModeloSource } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj, celoInputOf } from "../../build.js";
import { traRolojFigma } from "../../test-doubles/tra-roloj.js";
import { FIGMA_CELO, FIGMA_NOT_DRAWN, type FigmaPlan } from "./figma.js";
import {
  descendant,
  modelDouble,
  pageNodes,
  repo,
  repoFiles,
  repoPlan,
  run,
} from "./plugin-test-helpers.js";
import type { DoubleNode } from "./test-doubles/plugin.js";

type Box = { name: string; direction: "HORIZONTAL" | "VERTICAL"; children: (string | Box)[] };
type Plan = Omit<FigmaPlan, "components" | "sxablonoj"> & {
  sxablonoj: {
    name: string;
    layout: Box;
    regions: {
      name: string;
      items: {
        set?: string;
        props?: Record<string, string>;
        text?: string;
        toggles?: Record<string, boolean>;
      }[];
    }[];
  }[];
  components: (FigmaPlan["components"][number] & {
    structure?: string;
    toggles?: { property: string; part: string; defaultValue: boolean }[];
    codeblock?: { caption: string; code: string; copy: string };
    markdown?: { paragraph: string; items: string[]; quote: string };
  })[];
};
// The plan through the roles its Ero-Token bindings alias (Constitution v2.3, tra-roloj.ts).
const plan = JSON.parse(
  traRolojFigma(JSON.stringify(repoPlan), repo.input.modelo),
) as unknown as Plan;

let out = "";
let html = "";
beforeAll(async () => {
  out = mkdtempSync(join(tmpdir(), "fm-nachlese-8-figma-"));
  const built = await buildProjekcioj({ outDir: out, source: defaultModeloSource() });
  expect(built.ok).toBe(true);
  html = readFileSync(join(out, "vitrino/index.html"), "utf8");
}, 180_000);
afterAll(() => rmSync(out, { recursive: true, force: true }));

const provoj = celoInputOf(
  projectModeloSource(
    new URL(
      "../../../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.provoj.config.json",
      import.meta.url,
    ).pathname,
  ),
);
if (!provoj.ok) throw new Error("core + provo + provo-kompakta must be valid");
// The plans through the roles the Ero-Tokens alias (Constitution v2.3, tra-roloj.ts).
const provojPlan = JSON.parse(
  traRolojFigma(
    FIGMA_CELO.generate(provoj.input).find((file) => file.path === "figma/plan.json")?.text ?? "{}",
    provoj.input.modelo,
  ),
) as FigmaPlan;

const homeOf = (of: Pick<FigmaPlan, "collections">) =>
  new Map(
    of.collections.flatMap((collection) =>
      collection.variables.map((variable) => [variable.name, collection.name] as const),
    ),
  );

describe("the collection of a variable does not depend on the brands of the build (② 1)", () => {
  it("komuna alone and komuna with the test brands place every variable alike; fundamento holds no core token", () => {
    const normal = homeOf(plan);
    const tested = homeOf(provojPlan);
    const moved = [...normal].filter(
      ([name, home]) => tested.has(name) && tested.get(name) !== home,
    );
    expect(moved).toEqual([]);
    expect(
      plan.collections.find((collection) => collection.name === "fundamento")?.variables,
    ).toEqual([]);
  });
});

const sxablono = (name: string) => plan.sxablonoj.find((entry) => entry.name === name);
const regionsIn = (box: Box): string[] =>
  box.children.flatMap((child) => (typeof child === "string" ? [child] : regionsIn(child)));

describe("the Sxablonoj in the plan as the Vitrino shows them at „mittel“ (F-9, F-10, F-11)", () => {
  it("lays out each Sxablono as the web does", () => {
    expect(sxablono("sxelo")?.layout).toEqual({
      name: "frame",
      direction: "VERTICAL",
      children: [
        { name: "header", direction: "HORIZONTAL", children: ["brand", "principal"] },
        "nav",
        "notices",
        "main",
      ],
    });
    expect(sxablono("pagxo")?.layout).toEqual({
      name: "frame",
      direction: "VERTICAL",
      children: [
        {
          name: "head",
          direction: "HORIZONTAL",
          children: [
            {
              name: "lead",
              direction: "VERTICAL",
              children: [
                { name: "heading", direction: "HORIZONTAL", children: ["title", "badges"] },
                "subtitle",
              ],
            },
            "actions",
          ],
        },
        "sections",
      ],
    });
    expect(sxablono("filtrilo")?.layout).toEqual({
      name: "frame",
      direction: "VERTICAL",
      children: [
        "fields",
        { name: "footer", direction: "HORIZONTAL", children: ["actions", "status"] },
      ],
    });
    expect(sxablono("formularo")?.layout).toEqual({
      name: "frame",
      direction: "VERTICAL",
      children: ["fields", "actions"],
    });
    expect(sxablono("redaktilo")?.layout).toEqual({
      name: "frame",
      direction: "HORIZONTAL",
      children: ["field", "preview"],
    });
  });

  it("names no region as a visible word; every word is the Vitrino's example", () => {
    const section = html.slice(html.indexOf('id="fm-vitrino-sxablonoj"'));
    const names = new Set(
      plan.sxablonoj.flatMap((entry) => entry.regions.map((region) => region.name)),
    );
    for (const entry of plan.sxablonoj) {
      for (const region of entry.regions.filter((one) =>
        regionsIn(entry.layout).includes(one.name),
      )) {
        expect(region.items.length, `${entry.name}/${region.name}`).toBeGreaterThan(0);
        for (const item of region.items) {
          if (item.text === undefined) continue;
          expect(names.has(item.text), `${entry.name}/${region.name}: ${item.text}`).toBe(false);
          expect(section, `${entry.name}/${region.name}: ${item.text}`).toContain(item.text);
        }
      }
    }
  });

  it("the editor shows its preview as a markdovido; the field is a tekstareo of kind code; the menu is closed", () => {
    const regions = sxablono("redaktilo")?.regions ?? [];
    expect(regions.find((region) => region.name === "preview")?.items).toEqual([
      { set: "markdovido" },
    ]);
    expect(regions.find((region) => region.name === "field")?.items[0]).toMatchObject({
      set: "tekstareo",
      props: { kind: "code" },
    });
    const actions =
      sxablono("pagxo")?.regions.find((region) => region.name === "actions")?.items ?? [];
    expect(actions.map((item) => item.set)).toEqual(["butono", "menuo"]);
    expect(actions[1]?.toggles).toEqual({ open: false });
    const menuo = plan.components.find((component) => component.set === "menuo");
    expect(menuo?.toggles).toContainEqual({
      property: "open",
      part: "surface",
      defaultValue: true,
    });
  });
});

describe("kodbloko and markdovido are drawn as what they show (F-12)", () => {
  it("kodbloko: code in the code role, a caption, the copy button behind copyable", () => {
    const kodbloko = plan.components.find((component) => component.set === "kodbloko");
    expect(kodbloko?.structure).toBe("codeblock");
    expect(kodbloko?.toggles).toContainEqual({
      property: "copyable",
      part: "copy",
      defaultValue: false,
    });
    expect(kodbloko?.codeblock).toEqual({
      caption: "Prüfung starten",
      code: "pnpm fm mcp",
      copy: "Kopieren",
    });
    const variant = kodbloko?.variants[0] as {
      bindings: Record<string, string>;
      font?: { family: string };
    };
    expect(variant.bindings["text.typography"]).toBe("typography/code");
    expect(variant.font?.family).toBe("Geist Mono");
  });

  it("markdovido: a paragraph, a list and a quote; the line and the indents are drawn", () => {
    const markdovido = plan.components.find((component) => component.set === "markdovido");
    expect(markdovido?.structure).toBe("markdown");
    expect(markdovido?.markdown).toEqual({
      paragraph: "Ein Absatz mit Hervorhebung, Gewicht und STD-1.",
      items: ["eins", "zwei"],
      quote: "Ein Zitat.",
    });
    for (const part of ["legend", "quote", "indent"])
      expect(FIGMA_NOT_DRAWN[part], part).toBeUndefined();
    expect(FIGMA_NOT_DRAWN["scroll-ring"]).toBeDefined();
    expect(FIGMA_NOT_DRAWN.announce).toBeDefined();
  });
});

const texts = (node: DoubleNode | undefined): DoubleNode[] =>
  (node?.children ?? []).flatMap((child) =>
    child.type === "TEXT" ? [child, ...texts(child)] : texts(child),
  );
const instances = (node: DoubleNode | undefined): DoubleNode[] =>
  (node?.children ?? []).flatMap((child) =>
    child.type === "INSTANCE" ? [child, ...instances(child)] : instances(child),
  );
const mainOf = (node: DoubleNode | undefined) =>
  (node as unknown as { mainComponent?: DoubleNode } | undefined)?.mainComponent;

describe("the plugin draws the Sxablonoj and the two content sets (F-8 to F-12)", () => {
  it("the frame Sxablonoj has a surface bound to the background role; each Sxablono a frame of its own with its rows", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const frame = pageNodes(double).find((node) => node.name === "Sxablonoj");
    const [fill] = (frame?.properties.fills ?? []) as {
      boundVariables?: { color?: { name: string } };
    }[];
    expect(fill?.boundVariables?.color?.name).toBe("color/background/default");
    // Spec 027 B-8: the sxelo is a set; without a sidebar a variant stands as the web's frame.
    const sxelo = frame?.children
      .find((child) => child.name === "sxelo")
      ?.children.find((child) => child.name === "width=medium, sidebar=false");
    expect(sxelo?.children.map((child) => child.name)).toEqual([
      "header",
      "nav",
      "notices",
      "main",
    ]);
    const header = descendant(sxelo, "header");
    expect(header?.properties.layoutMode).toBe("HORIZONTAL");
    expect(header?.children.map((child) => child.name)).toEqual(["brand", "principal"]);
    const footer = descendant(
      frame?.children.find((child) => child.name === "filtrilo"),
      "footer",
    );
    expect(footer?.children.map((child) => child.name)).toEqual(["actions", "status"]);
    const fields = descendant(
      frame?.children.find((child) => child.name === "filtrilo"),
      "fields",
    );
    expect(fields?.properties.layoutMode).toBe("HORIZONTAL");
    const redaktilo = frame?.children.find((child) => child.name === "redaktilo");
    expect(redaktilo?.properties.layoutMode).toBe("HORIZONTAL");
    expect(mainOf(instances(descendant(redaktilo, "preview"))[0])?.parent?.name).toBe("markdovido");
    const menu = instances(
      descendant(
        frame?.children.find((child) => child.name === "pagxo"),
        "actions",
      ),
    ).find((node) => mainOf(node)?.parent?.name === "menuo");
    const properties = (menu?.properties.componentProperties ?? {}) as Record<string, unknown>;
    expect(Object.entries(properties).find(([key]) => key.split("#")[0] === "open")?.[1]).toBe(
      false,
    );
    const names = new Set(
      plan.sxablonoj.flatMap((entry) => entry.regions.map((region) => region.name)),
    );
    for (const text of texts(frame))
      expect(
        names.has(String(text.properties.characters)),
        String(text.properties.characters),
      ).toBe(false);
  });

  it("the kodbloko's set shows the copy button through copyable; the markdovido's set its example", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find(
      (node) => node.type === "COMPONENT_SET" && node.name === "kodbloko",
    );
    const definitions = (set?.properties.componentPropertyDefinitions ?? {}) as Record<
      string,
      { type: string; defaultValue: unknown }
    >;
    expect(
      Object.entries(definitions).find(([key]) => key.split("#")[0] === "copyable")?.[1],
    ).toMatchObject({
      type: "BOOLEAN",
      defaultValue: false,
    });
    const variant = set?.children[0];
    const copy = descendant(variant, "copy");
    expect(copy?.properties.visible).toBe(false);
    expect(texts(variant).map((text) => text.properties.characters)).toEqual(
      expect.arrayContaining(["Prüfung starten", "pnpm fm mcp", "Kopieren"]),
    );
    const code = descendant(variant, "text");
    expect((code?.properties.fontName as { family?: string } | undefined)?.family).toBe(
      "Geist Mono",
    );
    const markdown = pageNodes(double).find(
      (node) => node.type === "COMPONENT_SET" && node.name === "markdovido",
    );
    expect(texts(markdown?.children[0]).map((text) => text.properties.characters)).toEqual(
      expect.arrayContaining([
        "Ein Absatz mit Hervorhebung, Gewicht und STD-1.",
        "• eins",
        "• zwei",
        "Ein Zitat.",
      ]),
    );
  });
});
