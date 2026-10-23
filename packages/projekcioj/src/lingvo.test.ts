// Spec 026 ② (Lingvo-Schalter): Esperanto stays the default; the display switches to German or
// English. In Figma the component names stay Esperanto (Art. II, Code Connect); the display name of
// the build's language stands in the description of the component and of the variable collection
// (`--lingvo de`, default Esperanto). The Vitrino switches at runtime: every name it shows stands
// in a span with the key of its translation, the translations in its data island. No identifier
// is translated: tags, props, CSS variables, token names, Figma component names and file names
// are the same in every language.

import { defaultModeloSource } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { CELOJ, type CeloInput, celoInputOf } from "./build.js";
import { FIGMA_CELO, type FigmaPlan } from "./celoj/figma/figma.js";
import { MODEL_FONTS } from "./celoj/figma/plugin-test-helpers.js";
import { figmaDouble } from "./celoj/figma/test-doubles/plugin.js";
import { vitrinoDatumoj } from "./celoj/vitrino/datumoj.js";
import { vitrinoHtml } from "./celoj/vitrino/html.js";

const prepared = celoInputOf(defaultModeloSource());
if (!prepared.ok) throw new Error("the repo Modelo must be valid");
const input = prepared.input;
const { modelo } = input;
const eroId = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name)?.ero.id;
const skemoId = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name)?.skemo.id;

const planOf = (
  lingvo?: "eo" | "de" | "en",
): FigmaPlan & { sxablonoj?: { name: string; description: string }[] } =>
  JSON.parse(
    FIGMA_CELO.generate({
      ...input,
      ...(lingvo === undefined ? {} : { lingvo }),
    } as CeloInput).find((file) => file.path === "figma/plan.json")?.text ?? "{}",
  );

describe("Figma: the display name of the build's language in the descriptions (Spec 026 ②)", () => {
  const eo = planOf();
  const de = planOf("de");
  const en = planOf("en");
  const set = (plan: FigmaPlan, name: string) =>
    plan.components.find((component) => component.set === name);

  it("with lingvo de the set glitilo names „Schieberegler (glitilo)“ first in its description and in its Uzo; en „Slider (glitilo)“", () => {
    const purpose = set(eo, "glitilo")?.description ?? "";
    expect(purpose).not.toContain("Schieberegler");
    // Nachlese 10 N-6: in German the purpose is German too (the English one stays in English).
    expect(set(de, "glitilo")?.description?.startsWith("Schieberegler (glitilo)\n\n")).toBe(true);
    expect(set(de, "glitilo")?.description).not.toContain(purpose);
    expect(set(de, "glitilo")?.uzo?.markdown.startsWith("Schieberegler (glitilo)\n\n")).toBe(true);
    expect(set(en, "glitilo")?.description).toBe(`Slider (glitilo)\n\n${purpose}`);
    expect(set(de, "butono")?.description?.startsWith("Schaltfläche (butono)\n\n")).toBe(true);
  });

  it("the collections carry the name of their Dimensio as their description; Esperanto writes none", () => {
    const description = (plan: FigmaPlan, name: string) =>
      (plan.collections.find((collection) => collection.name === name) as { description?: string })
        ?.description;
    expect(description(de, "aspekto")).toBe("Marke");
    expect(description(de, "color-scheme")).toBe("Farbschema");
    expect(description(en, "color-scheme")).toBe("Color scheme");
    expect(description(eo, "aspekto")).toBeUndefined();
  });

  it("the Sxablonoj name their display name first too", () => {
    const sxelo = (plan: typeof eo) => plan.sxablonoj?.find((entry) => entry.name === "sxelo");
    expect(sxelo(de)?.description.startsWith("Anwendungsrahmen (sxelo)\n\n")).toBe(true);
  });

  it("the plugin keeps the name of the Dimensio with the collection (the API has no description of a collection) and writes nothing on a second run", async () => {
    const code =
      FIGMA_CELO.generate({ ...input, lingvo: "de" } as CeloInput).find(
        (file) => file.path === "figma/plugin/code.js",
      )?.text ?? "";
    const double = figmaDouble({ fonts: MODEL_FONTS });
    const run = () =>
      new Function("figma", "options", `${code}\nreturn applyPlan(options);`)(
        double.figma,
        undefined,
      );
    await run();
    const aspekto = double.collections.find((collection) => collection.name === "aspekto");
    expect(aspekto?.getSharedPluginData("fundamento", "label")).toBe("Marke");
    const writes = double.counts.writes;
    await run();
    expect(double.counts.writes).toBe(writes);
  }, 120_000);

  it("a German build is a plugin of its own: its id and name name the language beside the brands (F-13)", () => {
    const manifest = (lingvo?: "de") =>
      JSON.parse(
        FIGMA_CELO.generate({
          ...input,
          ...(lingvo === undefined ? {} : { lingvo }),
        } as CeloInput).find((file) => file.path === "figma/plugin/manifest.json")?.text ?? "{}",
      ) as { id: string; name: string };
    // Spec 027: the ids of the Bauformen, the German build still one of its own.
    expect(manifest().id).toMatch(/^fundamento-bauformen-[0-9a-f]{8}$/);
    expect(manifest("de").id).toMatch(/^fundamento-bauformen-[0-9a-f]{8}$/);
    expect(manifest("de").id).not.toBe(manifest().id);
    expect(manifest("de").name).toContain("· komuna · de): apply plan");
  });

  it("Esperanto is the default: the plan without lingvo is the plan with lingvo eo", () => {
    expect(JSON.stringify(planOf("eo"))).toBe(JSON.stringify(eo));
  });
});

describe("no identifier is translated (Spec 026 ②)", () => {
  it("every file of every Celo but the Figma plan and plugin is the same in German; the plan differs only in descriptions", () => {
    const filesOf = (lingvo?: "de") =>
      new Map(
        CELOJ.filter((celo) => celo.name !== "code-connect").flatMap((celo) =>
          celo
            .generate({ ...input, ...(lingvo === undefined ? {} : { lingvo }) } as CeloInput)
            .map((file) => [file.path, file.text] as const),
        ),
      );
    const eo = filesOf();
    const de = filesOf("de");
    expect([...de.keys()]).toEqual([...eo.keys()]);
    const changed = [...eo.keys()].filter((path) => eo.get(path) !== de.get(path));
    expect(changed.every((path) => path.startsWith("figma/"))).toBe(true);
    const strip = (text: string | undefined) =>
      JSON.stringify(JSON.parse(text ?? "{}"), (key, value) =>
        key === "description" || key === "markdown" || key === "lingvo" ? undefined : value,
      );
    expect(strip(de.get("figma/plan.json"))).toBe(strip(eo.get("figma/plan.json")));
  });
});

describe("the Vitrino: a switch Esperanto / Deutsch / English and the names in spans (Spec 026 ②)", () => {
  const html = vitrinoHtml({ css: "", elementJs: "", datumoj: vitrinoDatumoj({ input }) });
  const island = JSON.parse(
    (
      /<script type="application\/json" id="fm-vitrino">(.*?)<\/script>/s.exec(html)?.[1] ?? "{}"
    ).replaceAll("<\\/", "</"),
  ) as { nomoj?: Record<string, Record<string, string>> };

  it("the header has the switch with three buttons, Esperanto pressed", () => {
    expect(html).toContain('<div class="fm-group" role="group" aria-label="lingvo">');
    expect(html).toContain(
      '<button type="button" data-fm-lingvo="eo" aria-pressed="true">Esperanto</button>',
    );
    expect(html).toContain(
      '<button type="button" data-fm-lingvo="de" aria-pressed="false">Deutsch</button>',
    );
    expect(html).toContain(
      '<button type="button" data-fm-lingvo="en" aria-pressed="false">English</button>',
    );
  });

  it("the heading of an Ero, its states and the values of its axes stand in spans with the key of their name", () => {
    expect(html).toContain(`<h2><span data-fm-nomo="${eroId("glitilo")}/name">glitilo</span></h2>`);
    expect(html).toContain(`<span data-fm-nomo="${skemoId("butono")}/states/rest">rest</span>`);
    expect(html).toContain(
      `<span data-fm-nomo="${skemoId("butono")}/props/emphasis/values/high">high</span>`,
    );
    // The elements themselves are untouched.
    expect(html).toContain("<fm-glitilo ");
  });

  it("the data island carries the German and English names", () => {
    expect(island.nomoj?.de?.[`${eroId("glitilo")}/name`]).toBe("Schieberegler");
    expect(island.nomoj?.en?.[`${eroId("glitilo")}/name`]).toBe("Slider");
    expect(island.nomoj?.de?.[`${skemoId("butono")}/states/rest`]).toBe("Ruhe");
  });
});
