// Nachlese 11 B-2 (conformance, measured on the living element): for every Ero and every Sxablono,
// every slot of the Skemo is a slot the element takes, and every slot the element offers is one of
// the Skemo; the same for the props (its observed attributes). A slot is taken where a child put
// into it is assigned to a slot of the shadow root or shows up in it (the options a select draws,
// the option a combobox shows for its value) — an element may read a slot from the light DOM
// without a <slot> of its own. The element offers what its shadow root holds as <slot>, the rows a
// breadcrumb makes per entry (name="item-…") and the slot a Markdown view fills with what it builds
// itself (data-fm-own) aside; a Sxablono offers its default region unnamed and by its name. The
// default slot takes its content with and without slot="<its name>". The events and React stand
// in packages/projekcioj/src/nachlese-11.test.ts.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();

interface Entity {
  tag: string;
  props: string[];
  slots: { name: string; default: boolean; entry: boolean }[];
  navigation: boolean;
}

const entities: Entity[] = [
  ...input.modelo.eroj.map((entry) => ({
    tag: `fm-${entry.ero.name}`,
    props: entry.skemo.props.map((prop) => prop.name),
    slots: entry.skemo.slots.map((slot) => ({
      name: slot.name,
      default: slot.default === true,
      entry: slot.entry !== undefined,
    })),
    navigation: entry.skemo.a11y.role === "navigation",
  })),
  ...(input.modelo.sxablonoj ?? []).map((entry) => ({
    tag: `fm-${entry.sxablono.name}`,
    props: entry.skemo.props.map((prop) => prop.name),
    slots: entry.skemo.regions.map((region) => ({
      name: region.name,
      default: region.default === true,
      entry: false,
    })),
    navigation: false,
  })),
];

test("covers the 40 Eroj and the 5 Sxablonoj", () => {
  expect(entities).toHaveLength(45);
});

test.describe("Nachlese 11 B-2: the element takes what the Skemo names, and nothing else", () => {
  test.setTimeout(120_000);

  test("slots and props of every Ero and Sxablono", async ({ page }) => {
    await serve(page, out, "");
    const measured = await page.evaluate(async (list) => {
      const frame = () => new Promise((done) => requestAnimationFrame(() => done(undefined)));
      const results: Record<string, { offered: string[]; observed: string[]; refused: string[] }> =
        {};
      for (const entity of list) {
        const bare = document.createElement(entity.tag);
        document.body.append(bare);
        await frame();
        const slots = [...(bare.shadowRoot?.querySelectorAll("slot") ?? [])];
        const offered = [
          ...new Set(
            slots.flatMap((slot) => {
              if (slot.hasAttribute("data-fm-own")) return [];
              const name = slot.getAttribute("name");
              if (name === null) return ["(default)"];
              return name.endsWith("-") ? [] : [name];
            }),
          ),
        ].sort();
        const observed = [
          ...((customElements.get(entity.tag) as unknown as { observedAttributes?: string[] })
            ?.observedAttributes ?? []),
        ].sort();
        bare.remove();
        const refused: string[] = [];
        const tries = entity.slots.flatMap((slot) =>
          slot.default
            ? [
                { ...slot, named: false },
                { ...slot, named: true },
              ]
            : [{ ...slot, named: true }],
        );
        for (const slot of tries) {
          const element = document.createElement(entity.tag);
          const marker = `fm-mark-${slot.name}${slot.named ? "-named" : ""}`;
          const child = document.createElement(
            entity.navigation && slot.default ? "a" : slot.entry ? "data" : "span",
          );
          child.textContent = marker;
          if (child instanceof HTMLAnchorElement) {
            child.href = `#${marker}`;
            child.setAttribute("data-page", marker);
          }
          if (slot.entry) {
            child.setAttribute("value", `${marker}-v`);
            if (entity.props.includes("value")) element.setAttribute("value", `${marker}-v`);
          }
          if (slot.named) child.setAttribute("slot", slot.name);
          element.append(child);
          document.body.append(element);
          await frame();
          await frame();
          const taken =
            child.assignedSlot !== null ||
            (element.shadowRoot?.textContent ?? "").includes(marker) ||
            [...(element.shadowRoot?.querySelectorAll("input") ?? [])].some(
              (field) => field.value === marker,
            ) ||
            [...(element.shadowRoot?.querySelectorAll("*") ?? [])].some((node) =>
              (node.shadowRoot?.textContent ?? "").includes(marker),
            );
          if (!taken) refused.push(`${slot.name}${slot.named ? ` (slot="${slot.name}")` : ""}`);
          element.remove();
        }
        results[entity.tag] = { offered, observed, refused };
      }
      return results;
    }, entities);

    const mismatches: string[] = [];
    for (const entity of entities) {
      const result = measured[entity.tag];
      if (result === undefined) {
        mismatches.push(`${entity.tag}: not measured`);
        continue;
      }
      const names = new Set(entity.slots.map((slot) => (slot.default ? "(default)" : slot.name)));
      const byName = entity.slots.find((slot) => slot.default)?.name;
      // Every <slot> the element offers is one the Skemo names (the default one also by its name).
      for (const offered of result.offered)
        if (!names.has(offered) && offered !== byName)
          mismatches.push(
            `${entity.tag} offers the slot ${offered}, which the Skemo does not name`,
          );
      // A default slot in the Skemo is an unnamed <slot> of the element, and only then.
      if (names.has("(default)") !== result.offered.includes("(default)"))
        mismatches.push(
          `${entity.tag}: default slot — element ${result.offered.includes("(default)")}, Skemo ${names.has("(default)")}`,
        );
      const props = [...entity.props].sort();
      if (JSON.stringify(result.observed) !== JSON.stringify(props))
        mismatches.push(
          `${entity.tag} props: element ${result.observed.join(", ")} · Skemo ${props.join(", ")}`,
        );
      for (const refused of result.refused)
        mismatches.push(`${entity.tag} does not take ${refused}`);
    }
    expect(mismatches).toEqual([]);
  });
});
