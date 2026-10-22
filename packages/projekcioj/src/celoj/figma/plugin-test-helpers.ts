// Shared by the tests of the generated Figma plugin (Nachlese 5 ①, O-5): the plans, the fonts of
// a prepared file, the runner and the walkers over the double. No tests here; the tests stand in
// plugin-<topic>.test.ts, split from plugin.test.ts by topic so Vitest runs them side by side.

import { defaultModeloSource, projectModeloSource } from "@fundamento/modelo";
import { celoInputOf } from "../../build.js";
import { FIGMA_CELO, type FigmaPlan } from "./figma.js";
import { type DoubleNode, figmaDouble } from "./test-doubles/plugin.js";

export const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
  import.meta.url,
).pathname;
const preparedResult = celoInputOf(projectModeloSource(config));
if (!preparedResult.ok) throw new Error("core + ekzemplo must be valid");
// Exported once checked: the tests read it as the valid input, as they did in one file.
export const prepared = preparedResult;
export const files = Object.fromEntries(
  FIGMA_CELO.generate(prepared.input).map((f) => [f.path, f.text]),
);
export const plan = JSON.parse(files["figma/plan.json"] ?? "{}") as FigmaPlan;
/**
 * A file that has the model's font, as a prepared test file would. Only the tests of the fallback
 * run in a bare file, where the label falls back to Inter with a warning.
 */
// The fonts the two-brand fixture asks for: komuna's Geist Medium and ekzemplo's Archivo SemiBold,
// and the two crossings a field-by-field binding passes through. A prepared file has all four; a
// real Geist and a real Archivo both ship these cuts (F30).
export const MODEL_FONTS = [
  { family: "Geist", style: "Medium" },
  { family: "Geist", style: "Black" },
  // Spec 008: the inline ligilo takes the running text's role (typography.body.1), Regular in
  // komuna and Medium in ekzemplo (plan D-11).
  { family: "Geist", style: "Regular" },
  { family: "Archivo", style: "Regular" },
  { family: "Archivo", style: "Medium" },
  { family: "Archivo", style: "Black" },
  // Spec 011 ②: the heading of the dialogo is typography.headline.4, SemiBold in komuna and Black
  // in ekzemplo (above), with the crossing Archivo SemiBold a field-by-field binding passes
  // through (a real Archivo ships it). The code text of the tekstareo is typography.code: Geist
  // Mono in komuna, in the Regular cut and the Medium crossing. The fixture's ekzemplo names the
  // generic `ui-monospace` first in its code stack, and the plan takes the first family of a
  // stack (F30) — a prepared file cannot have a font of that name; it stands here so the two-brand
  // tests measure the binding, not the fixture's stack (Befund for the fixture, Spec 011 ②).
  { family: "Geist", style: "SemiBold" },
  { family: "Archivo", style: "SemiBold" },
  { family: "Geist Mono", style: "Regular" },
  { family: "Geist Mono", style: "Medium" },
  { family: "ui-monospace", style: "Regular" },
  { family: "ui-monospace", style: "Medium" },
] as const;
export const modelDouble = () => figmaDouble({ fonts: MODEL_FONTS });
/** The example frames beside the apartigilo's set (Nachlese 4 N-6, F-7), in their order. */
export const SEPARATOR_EXAMPLE_NAMES = [
  "apartigilo – waagerecht zwischen zwei Texten",
  "apartigilo – senkrecht zwischen zwei Texten",
] as const;
/**
 * The abort of F10c lifted: a test that takes a variant out of a set the plugin made and runs it
 * again measures what such a run reports — which is only there once the run goes on.
 */
export const LIFT = { createInFoundSet: true } as const;
/**
 * One run per describe: the tests of a Bauform read what the run drew and never change it, so the
 * first `drawn()` runs the plugin and every later one reads the same double (B-14: a run over a
 * plan with the third level takes seconds; a suite ran it forty times).
 */
export function once<T>(draw: () => Promise<T>): () => Promise<T> {
  let pending: Promise<T> | undefined;
  return () => {
    pending ??= draw();
    return pending;
  };
}
/** Runs the generated plugin source against a double. */
export async function run(
  double: ReturnType<typeof figmaDouble>,
  source = files["figma/plugin/code.js"] ?? "",
  options?: typeof LIFT,
) {
  const module = new Function("figma", "options", `${source}\nreturn applyPlan(options);`);
  await module(double.figma, options);
}
/**
 * The nodes on the page, and those of every section on it in place of the section's children
 * (F-2), and those of the plugin's frame in the section (F-8: the sets lie in the frame „Eroj" in
 * the section „Fundamento"): a node a test looks for is found either way.
 */
export function pageNodes(double: ReturnType<typeof figmaDouble>): DoubleNode[] {
  const open = (child: DoubleNode): DoubleNode[] =>
    child.type === "SECTION" ||
    (child.type === "FRAME" && child.getSharedPluginData("fundamento", "frame") !== "")
      ? [child, ...child.children.flatMap(open)]
      : [child];
  return (double.root.children[0]?.children ?? []).flatMap(open);
}
/**
 * Spec 014 ③ (F31): the ekzemplo fixture writes its display roles in capitals, komuna does not —
 * the titolo's display variants carry TEXT_CASE_VARIES, and the run says so once per set. The one
 * warning every run over both Aspektoj reports.
 */
export const TITOLO_CASE_WARNING =
  "titolo: Die Schreibweise der Beschriftung ist nicht in allen Modi dieselbe. textCase ist in Figma kein bindbares Feld, also bleibt sie ungesetzt — eine Marke auszuwählen wäre keine Projektion.";
// F8 (Abnahme M1): Figma binds only the RGB of a variable to a paint — the deckkraft stays 1 and a
// translucent token renders opaque. The plugin therefore sets `paint.opacity` from the plan, in
// every case, and keeps the binding to `color` so the file still shows which variable rules the
// fill.
// The Modelo of this repository — the plan the maintainer runs in Figma.
const repoResult = celoInputOf(defaultModeloSource());
if (!repoResult.ok) throw new Error("the repo Modelo must be valid");
// Exported once checked, like prepared.
export const repo = repoResult;
export const repoFiles = Object.fromEntries(
  FIGMA_CELO.generate(repo.input).map((file) => [file.path, file.text]),
);
export const repoPlan = JSON.parse(repoFiles["figma/plan.json"] ?? "{}") as FigmaPlan;
/**
 * The set of the butono in a list of components or of their reports: the Ero order sorts the
 * avizo before it since Spec 011 ③, so the butono is no longer the first set of the plan.
 */
export const butonoOf = <T>(components: readonly T[] | undefined): T | undefined =>
  components?.find((component) => (component as { set?: unknown }).set === "butono");
/** The node of that name below `node`, at any depth: the control sits inside the focus ring. */
export function descendant(node: DoubleNode | undefined, name: string): DoubleNode | undefined {
  for (const child of node?.children ?? []) {
    if (child.name === name) return child;
    const found = descendant(child, name);
    if (found !== undefined) return found;
  }
  return undefined;
}
/** The colour a node shows for a paint field: what the first visible paint holds. */
export function double_shown(node: DoubleNode, field: "fills" | "strokes") {
  const [paint] = (node.properties[field] ?? []) as { color?: unknown; visible?: boolean }[];
  return paint === undefined || paint.visible === false ? undefined : paint.color;
}
