// Make Kit Celo (Spec 003, FR-11, plan D-14, contracts/projekcioj §6). One self-contained package
// per Aspekto: the Eroj as a bundle, the Aspekto's CSS and Tailwind theme, and `guidelines/`
// generated from the Modelo, the Reguloj with their kialoj and the Jugxoj — not one hand-written
// line (Art. VII). No hex value anywhere: the guidelines name tokens and classes, never values, so
// a model reading them cannot copy a colour out of the system.
//
// `MAKE_KIT_CELO` writes the sources; `buildMakeKits` additionally bundles them with Vite (ESM and
// CJS) and writes the type declarations, so the package can be packed and installed (AK-08).

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import {
  type DtcgType,
  defaultModeloSource,
  isNoTarget,
  type Jugxo,
  type LoadedEro,
  type Modelo,
  type ModeloSource,
  nomRegulo,
  type ParityItem,
  type Regulo,
  type Uzo,
} from "@fundamento/modelo";
import { type Celo, type CeloInput, celoInputOf, type GeneratedFile } from "../../build.js";
import { aspektoStylesheet } from "../css/css.js";
import { componentName, reactSource } from "../react/react.js";
import { themeBlock } from "../tailwind/tailwind.js";
import { elementSource } from "../web-component/element-template.js";
import {
  elementNamesOf,
  isAvatar,
  isLight,
  isMultiline,
  isPopover,
  isSkip,
  isSuggest,
  isUpload,
  lightStylesheetOf,
  namesOf,
  stylesheetOf,
} from "../web-component/web-component.js";

/** `@fundamento/make-kit-komuna` (Q2: pre-releases under the dist-tag `next`, 0.1.0 under `latest`). */
export function makeKitName(aspekto: string): string {
  return `@fundamento/make-kit-${aspekto}`;
}

const DIR = "make-kit";

/** The Aspektoj a kit is built for: the values of the aspekto Dimensio. */
function aspektojOf(modelo: Modelo): string[] {
  return (
    modelo.dimensioj
      .find((dimensio) => dimensio.name === "aspekto")
      ?.valoroj.map((valoro) => valoro.name) ?? []
  );
}

/** The Aspektoj a kit is built for (a kit per Aspekto, Art. IV). */
export function kitAspektoj(modelo: Modelo): string[] {
  return aspektojOf(modelo);
}

/** The Aspekto whose kit stands for all of them where one has to be picked (the reference). */
export function kitReferenceAspekto(modelo: Modelo): string {
  const dimensio = modelo.dimensioj.find((entry) => entry.name === "aspekto");
  return dimensio?.referenceAspekto ?? dimensio?.valoroj[0]?.name ?? "";
}

/** Where a kit's guideline of one Ero is written inside the projections. */
export const guidelinePath = (aspekto: string, ero: string): string =>
  `${DIR}/${aspekto}/guidelines/components/${ero}.md`;

/** The declaration file a bundled kit ships. */
export const kitTypesPath = (aspekto: string): string => `${DIR}/${aspekto}/dist/index.d.ts`;

const tokenVariable = (name: string) => nomRegulo("css").derive(name);

function tailwindClass(name: string, type: DtcgType): string | undefined {
  const key = nomRegulo("tailwind").derive(name, type);
  if (isNoTarget(key)) return undefined;
  const utility = key.startsWith("--color-")
    ? "bg"
    : key.startsWith("--spacing-")
      ? "p"
      : key.startsWith("--radius-")
        ? "rounded"
        : undefined;
  return utility === undefined ? undefined : `${utility}${key.slice(key.indexOf("-fm-"))}`;
}

/** A table of role tokens of one prefix: name, its variable, its Tailwind class and its use. */
function tokenTable(input: CeloInput, prefix: string, utility = true): string {
  const rows = input.modeloJson.tokens
    .filter((token) => token.name.startsWith(prefix) && !token.name.startsWith(`${prefix}palette.`))
    .filter((token) => (token.description ?? "") !== "")
    .map((token) => {
      const css = `\`${tokenVariable(token.name)}\``;
      const tailwind = utility ? (tailwindClass(token.name, token.type as DtcgType) ?? "–") : "–";
      return `| \`${token.name}\` | ${css} | ${tailwind === "–" ? "–" : `\`${tailwind}\``} | ${token.description ?? ""} |`;
    });
  return ["| Token | CSS | Tailwind | Use |", "|---|---|---|---|", ...rows].join("\n");
}

/** The example instances of a Jugxo as one line of HTML, with its kialo. */
function exampleBlock(jugxo: Jugxo, tag: string): string {
  const instances = (jugxo.ekzemplo?.instances ?? [])
    .map((instance) => {
      const attributes = Object.entries(instance.props)
        .map(([key, value]) => (value === true ? ` ${key}` : ` ${key}="${String(value)}"`))
        .join("");
      // The options of a radio group (Spec 010 ③): one element per entry, its value its position.
      const entries = Object.entries(instance.texts ?? {})
        .flatMap(([slot, texts]) =>
          Array.isArray(texts)
            ? texts.map((text, index) => `<data slot="${slot}" value="${index + 1}">${text}</data>`)
            : [],
        )
        .join("");
      return `<${tag}${attributes}>${instance.label ?? ""}${entries}</${tag}>`;
    })
    .join("\n");
  const verdict = jugxo.decision === "approved" ? "CORRECT" : "WRONG";
  return `**${verdict}** — ${jugxo.kialo}\n\n\`\`\`html\n${instances}\n\`\`\``;
}

/** The first label of an example Jugxo of a Regulo with the given decision, if any. */
function exampleLabel(
  input: CeloInput,
  reguloId: string | undefined,
  decision: Jugxo["decision"],
  of?: string,
): string | undefined {
  if (reguloId === undefined) return undefined;
  for (const jugxo of input.modelo.jugxoj) {
    if (jugxo.decision !== decision || jugxo.ekzemplo?.regulo !== reguloId) continue;
    // A rule on the entries of a slot (Spec 010 ③: the options) shows them, not the label.
    const slot = of?.startsWith("slot:") === true ? of.slice("slot:".length) : undefined;
    const entries = jugxo.ekzemplo.instances
      .map((instance) => (slot === undefined ? undefined : instance.texts?.[slot]))
      .find((texts) => Array.isArray(texts));
    if (Array.isArray(entries)) return entries.join(", ");
    const label = jugxo.ekzemplo.instances.find((instance) => instance.label !== undefined)?.label;
    if (label !== undefined) return label;
  }
  return undefined;
}

/**
 * The sections of the Uzo (Spec 007 T026, A12, D-10): what the Ero is for, what it is not for
 * (boundaries and alternatives with action and kialo), what it stands with, what its slots take,
 * how it behaves in the layout, and what its label may say (fixed or adjustable, with an example
 * each way). Generated from the Uzo, the Reguloj and the Jugxoj; no hand-written line (Art. VII).
 */
function uzoSections(input: CeloInput, uzo: Uzo, reguloj: readonly Regulo[]): string {
  const reguloNamed = (name: string) => reguloj.find((regulo) => regulo.name === name);
  const notFor = [
    ...uzo.boundary.map(
      (boundary) =>
        `- **${boundary.case}** — ${
          boundary.action === "use-instead"
            ? `use-instead: use \`${boundary.ero ?? ""}\` instead`
            : boundary.action === "ask-human"
              ? "ask-human: ask a person, Fundamento does not cover this yet"
              : "not-supported: the component stops here"
        }. ${boundary.kialo}`,
    ),
    ...uzo.instead.map(
      (alternative) =>
        `- **${alternative.goal}** — ${
          alternative.ero === null
            ? "not covered yet (ask-human: ask a person)"
            : `use-instead: use \`${alternative.ero}\` instead`
        }. ${alternative.kialo}`,
    ),
  ].join("\n");
  const spacing = reguloNamed(uzo.composes.spacing.regulo);
  const together = [
    ...uzo.composes.containers.map((entry) => `- in \`${entry.name}\` — ${entry.kialo}`),
    ...uzo.composes.with.map((entry) => `- with \`${entry.ero}\` — ${entry.kialo}`),
    ...uzo.composes.never.map((entry) => `- never with \`${entry.ero}\` — ${entry.kialo}`),
    `- spacing: the space between siblings belongs to the ${uzo.composes.spacing.owner} (${uzo.composes.spacing.regulo})${spacing === undefined ? "" : ` — ${spacing.statement}`}`,
  ].join("\n");
  const slots = Object.entries(uzo.slots)
    .map(
      ([slot, rule]) =>
        `| \`${slot}\` | ${(rule.accepts ?? []).join(", ") || "–"} | ${rule.max ?? "–"} | ${rule.required === true ? "yes" : "no"} | ${rule.nesting ?? "–"} |`,
    )
    .join("\n");
  const allowances = Object.entries(uzo.layout)
    .flatMap(([prop, allowance]) => {
      if (typeof allowance !== "object") return [];
      const places = [
        ...(allowance.allowedIn.containers ?? []).map((name) => `a container of kind ${name}`),
        ...Object.entries(allowance.allowedIn.dimensioj ?? {}).flatMap(([dimensio, values]) =>
          values.map((value) => `${dimensio}=${value}`),
        ),
      ];
      const regulo = reguloNamed(allowance.regulo);
      return [
        `- \`${prop}\` only in ${places.join(" or ")} (${allowance.regulo})${regulo === undefined ? "" : `.\n  Why: ${regulo.kialo}`}`,
      ];
    })
    .join("\n");
  const text = uzo.content
    .map((rule) => {
      const regulo = reguloNamed(rule.regulo);
      const kind = rule.fixed
        ? "fixed: no brand overrides it"
        : `adjustable: a brand may override it with a Jugxo${rule.severity === "warning" ? "; reports a warning" : ""}`;
      const correct = exampleLabel(input, regulo?.id, "approved", rule.of);
      const wrong = exampleLabel(input, regulo?.id, "rejected", rule.of);
      return `- **${rule.regulo}** (${kind}) — ${regulo?.statement ?? ""}\n  Why: ${regulo?.kialo ?? ""}\n  CORRECT: "${correct ?? ""}" · WRONG: "${wrong ?? ""}"`;
    })
    .join("\n");
  return `
## What it is for

${uzo.purpose}

## Not for this

${notFor}

## Together with

${together}

## Slots

| Slot | Accepts | Max | Required | Nesting |
|---|---|---|---|---|
${slots}

## Layout

Size from the ${uzo.layout.size} (\`${uzo.layout.size}\`); the label ${uzo.layout.wrap === "never" ? "never wraps" : "may wrap"} (\`${uzo.layout.wrap}\`).
${allowances}

## Text

${text}
`;
}

function componentGuideline(
  input: CeloInput,
  entry: LoadedEro,
  reguloj: readonly Regulo[],
): string {
  const { tag } = namesOf(entry.ero);
  const name = componentName(entry.ero);
  const skemo = entry.skemo;
  const props = skemo.props
    .map((prop) => {
      const values =
        prop.kind === "enum"
          ? (prop.values ?? []).map((value) => `\`${value}\``).join(", ")
          : prop.kind;
      const fallback = prop.default === undefined ? "–" : `\`${String(prop.default)}\``;
      // A prop whose name is a reserved word of JavaScript (Spec 014 ④: for) is htmlFor in React;
      // the cell keeps the prop's own name (parity reads it), the meaning says React's.
      const react = prop.name === "for" ? "In React `htmlFor`. " : "";
      return `| \`${prop.name}\` | ${values} | ${fallback} | ${react}${prop.description ?? ""} |`;
    })
    .join("\n");
  const goals = (skemo.goals ?? [])
    .map((goal) => {
      const props = Object.entries(goal.props)
        .map(([key, value]) => `\`${key}=${String(value)}\``)
        .join(", ");
      const words = Object.values(goal.keywords).flat().slice(0, 4).join(", ");
      return `| ${goal.goal} | ${words} | ${props} | ${goal.regulo === undefined ? "–" : `\`${goal.regulo}\``} |`;
    })
    .join("\n");
  const rules = reguloj
    .map((regulo) => `- **${regulo.name}** — ${regulo.statement}\n  Why: ${regulo.kialo}`)
    .join("\n");
  const examples = input.modelo.jugxoj
    .filter(
      (jugxo) =>
        jugxo.ekzemplo !== undefined && "ero" in jugxo.ref && jugxo.ref.ero === entry.ero.id,
    )
    .map((jugxo) => exampleBlock(jugxo, tag))
    .join("\n\n");
  const states = skemo.states.map((state) => `\`${state}\``).join(", ");
  // Spec 008 (D-12): no button wording for every Ero. The states a prop switches are the boolean
  // props that are also states; the rest come from the browser.
  const switched = skemo.props
    .filter((prop) => prop.kind === "boolean" && skemo.states.includes(prop.name))
    .map((prop) => `\`${prop.name}\``);
  const origin =
    switched.length === 0
      ? "They come from the browser (hover, press, focus, visited)"
      : `They come from the browser (hover, press, focus) or from ${switched.join(" and ")}`;
  const target =
    skemo.a11y.role === "link"
      ? " The prop `to` is the destination; the element renders it as the link's target."
      : "";
  // Only an Ero with a label prop has an icon-only form (Spec 010 ①: the switch, like the field,
  // always shows its label and has no such prop).
  const iconOnly = skemo.props.some((prop) => prop.name === "label")
    ? ` for an icon-only ${entry.ero.name} set \`label\` as its accessible name.`
    : "";
  // A slot whose entries are options (Spec 010 ③, E7): how an option is written, and which is
  // chosen — the one whose value is the prop the Skemo names.
  const options = skemo.slots
    .flatMap((slot) =>
      slot.entry === undefined
        ? []
        : [
            ` Each option is an element in the slot \`${slot.name}\` with its value: \`<data slot="${slot.name}" value="express">Express</data>\`; the option whose value is \`${slot.entry.equals}\` is chosen.`,
          ],
    )
    .join("");
  return `# ${name}

${entry.ero.description}

Use \`<${name}>\` in React, or the element \`<${tag}>\` in plain HTML. The label is the children of
the component${iconOnly === "" ? "; it always shows." : `;${iconOnly}`}${target}${options}

## Props

| Prop | Values | Default | Meaning |
|---|---|---|---|
${props}

States: ${states}. ${origin}; never style them yourself.

## Which ${entry.ero.name} for which goal

| Goal | Words | Use | Rule |
|---|---|---|---|
${goals}

## Rules

${rules}

## Examples

${examples}
${entry.uzo === undefined ? "" : uzoSections(input, entry.uzo, reguloj)}`;
}

function guidelines(input: CeloInput, aspekto: string): GeneratedFile[] {
  const base = `${DIR}/${aspekto}/guidelines`;
  const reguloj = input.modelo.reguloj.filter((regulo) => regulo.appliesTo?.eroj !== undefined);
  const eroj = input.modelo.eroj;
  const dimensioj = input.modelo.dimensioj
    .map(
      (dimensio) =>
        `| \`data-fm-${dimensio.name}\` | ${dimensio.valoroj.map((valoro) => `\`${valoro.name}\``).join(", ")} | \`${dimensio.default}\` |`,
    )
    .join("\n");
  const ruleLines = reguloj.map((regulo) => `- ${regulo.statement}`).join("\n");
  // Spec 009 (D-10, Art. VII): an entry of text comes from the field Ero, never from a raw input;
  // generated from the Uzo of every Ero that is a textbox.
  const fieldLines = eroj
    .filter(
      (entry) =>
        entry.skemo.a11y.role === "textbox" && !isMultiline(entry.skemo) && entry.uzo !== undefined,
    )
    .map(
      (entry) =>
        `- Every entry of text is a \`<${componentName(entry.ero)}>\` (${entry.uzo?.purpose ?? ""}); never a raw input element, and never a field without its visible label.`,
    )
    .join("\n");
  // Spec 011 ② (G7, plan ② D-14): every text of several lines comes from the text area (a textbox
  // with rows), one line from the field; generated from both where the Modelo has them.
  const fieldName = eroj.find(
    (entry) => entry.skemo.a11y.role === "textbox" && !isMultiline(entry.skemo),
  );
  const areaLines = eroj
    .filter(
      (entry) =>
        entry.skemo.a11y.role === "textbox" && isMultiline(entry.skemo) && entry.uzo !== undefined,
    )
    .map(
      (entry) =>
        `- Every text that runs over several lines (a comment, a description, a reason) is a \`<${componentName(entry.ero)}>\`${fieldName === undefined ? "" : `; one line is a \`<${componentName(fieldName.ero)}>\``}.`,
    )
    .join("\n");
  // Spec 011 ② (G7, plan ② D-14): every confirmation before an action that cannot be undone comes
  // from the dialog, whose heading names the decision; never a second button that asks.
  const dialogLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "dialog" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every confirmation before an action that cannot be undone is a \`<${componentName(entry.ero)}>\` whose heading names the decision; never a second button that asks.`,
    )
    .join("\n");
  // Spec 010 ① (G7, plan D-12): every on/off setting that applies at once comes from the switch,
  // never from a button that pretends; generated from every Ero with role switch.
  const switchLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "switch" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every on/off setting that applies at once is a \`<${componentName(entry.ero)}>\`; never a button that pretends.`,
    )
    .join("\n");
  // Spec 010 ② (G7, plan ② D-12): every yes/no that applies with the form comes from the checkbox,
  // and what applies at once from the switch; generated from every Ero with role checkbox, the
  // switch named where the Modelo has one.
  const switchName = eroj.find((entry) => entry.skemo.a11y.role === "switch");
  const checkboxLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "checkbox" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every yes/no that applies with the form is a \`<${componentName(entry.ero)}>\`${switchName === undefined ? "" : `; a setting that applies at once is a \`<${componentName(switchName.ero)}>\``}.`,
    )
    .join("\n");
  // Spec 010 ③ (G7, plan ③ D-11): a choice of one among a few visible options comes from the radio
  // group; six or more go into a list — named once the Modelo has one (elektilo, Spec 010 ④, plan ④
  // D-11), until then the kit says that it has none.
  const listName = eroj.find((entry) => entry.skemo.a11y.role === "combobox");
  const radioLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "radiogroup" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- A choice of one among a few visible options is an \`<${componentName(entry.ero)}>\`; six or more go into ${listName === undefined ? "a list, which this kit does not have yet: ask a person" : `an \`<${componentName(listName.ero)}>\` list`}.`,
    )
    .join("\n");
  // Spec 010 ④ (G7, plan ④ D-11): a choice of one among many options comes from the select, whose
  // list is the platform's; up to five visible options from the radio group, named where the
  // Modelo has one. Generated from every Ero with role combobox.
  const radioName = eroj.find((entry) => entry.skemo.a11y.role === "radiogroup");
  const selectLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "combobox" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- A choice of one among many options is an \`<${componentName(entry.ero)}>\` list${radioName === undefined ? "" : `; up to five visible options are an \`<${componentName(radioName.ero)}>\``}.`,
    )
    .join("\n");
  // Spec 011 ③ (G7, plan ③ D-12): a status in one to three words is the badge (role generic),
  // a sentence the notice; generated from every Ero with role generic, the notice named where the
  // Modelo has one.
  const noticeName = eroj.find(
    (entry) =>
      entry.skemo.a11y.role === "status" &&
      entry.skemo.props.some((prop) => prop.name === "intent"),
  );
  const badgeLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "generic" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every status in one to three words next to what it describes (draft, in review, 3 violations) is an \`<${componentName(entry.ero)}>\`${noticeName === undefined ? "" : `; a sentence is an \`<${componentName(noticeName.ero)}>\``}.`,
    )
    .join("\n");
  // Spec 011 ③ (plan ③ D-12): a message in the flow of the page is the notice (a live region with
  // an intent); never a toast; what needs a decision is the dialog, named where the Modelo has one.
  // Spec 014 ④: the popover shares the role; the modal dialog is the one without a trigger slot.
  const dialogName = eroj.find(
    (entry) => entry.skemo.a11y.role === "dialog" && !isPopover(entry.skemo),
  );
  const noticeLines = eroj
    .filter(
      (entry) =>
        entry.skemo.a11y.role === "status" &&
        entry.skemo.props.some((prop) => prop.name === "intent") &&
        entry.uzo !== undefined,
    )
    .map(
      (entry) =>
        `- Every message in the flow of the page about what happened or what to watch for (saved, could not save) is an \`<${componentName(entry.ero)}>\`; never a toast${dialogName === undefined ? "" : `, and what needs a decision is a \`<${componentName(dialogName.ero)}>\``}.`,
    )
    .join("\n");
  // Spec 011 ③ (plan ③ D-12): an area that loads or is empty shows the state (a live region with
  // a kind); never a bare spinner; a working button is the butono's own loading.
  // Spec 015 ②: the file input is heard as a button too; the butono is the button without a dropzone.
  const buttonName = eroj.find(
    (entry) => entry.skemo.a11y.role === "button" && !isUpload(entry.skemo),
  );
  const stateLines = eroj
    .filter(
      (entry) =>
        entry.skemo.a11y.role === "status" &&
        entry.skemo.props.some((prop) => prop.name === "kind") &&
        entry.uzo !== undefined,
    )
    .map(
      (entry) =>
        `- Every area whose content loads or is empty shows a \`<${componentName(entry.ero)}>\` with a text; never a bare spinner${buttonName === undefined ? "" : `, and a working button is the \`<${componentName(buttonName.ero)}>\`'s own loading`}.`,
    )
    .join("\n");
  // Spec 011 ④ (G7, plan ④ D-12): many records are the table around the platform's own table
  // with a caption, one record the list around the platform's own description list, a known value
  // in a known range the meter with its number as text; generated from the roles table, list and
  // meter, the companions named where the Modelo has them.
  const recordName = eroj.find((entry) => entry.skemo.a11y.role === "list");
  const badgeName = eroj.find((entry) => entry.skemo.a11y.role === "generic");
  const tableLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "table" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every list of records with the same fields is a \`<${componentName(entry.ero)}>\` around the platform's own table with a caption${recordName === undefined ? "" : `; one record is an \`<${componentName(recordName.ero)}>\``}.`,
    )
    .join("\n");
  const recordLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "list" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every record shown as names and values is an \`<${componentName(entry.ero)}>\` around the platform's own description list; never a table for one record${fieldName === undefined ? "" : `, and editing is a form of \`<${componentName(fieldName.ero)}>\``}.`,
    )
    .join("\n");
  const meterLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "meter" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every known value within a known range is a \`<${componentName(entry.ero)}>\` with its number as text; an unknown value is never 0${badgeName === undefined ? "" : `, and a status in a word is an \`<${componentName(badgeName.ero)}>\``}.`,
    )
    .join("\n");
  // Spec 011 ⑤ (G7, plan ⑤ D-10): the navigation between the main pages is the navigado around
  // the platform's own links (named, the current page marked), a switch of views on one page the
  // langetaro with distinct tabs; generated from the roles navigation and tablist, the companions
  // named where the Modelo has them.
  const linkName = eroj.find((entry) => entry.skemo.a11y.role === "link");
  // Spec 015 ①: the pagxigilo and the spuro share the role; the navigado is the one without an
  // ellipsis or a separator part.
  const plainNavigation = (entry: LoadedEro) =>
    entry.skemo.a11y.role === "navigation" &&
    entry.skemo.parts.ellipsis === undefined &&
    entry.skemo.parts.separator === undefined;
  const navigationName = eroj.find(plainNavigation);
  const navigationLines = eroj
    .filter((entry) => plainNavigation(entry) && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every navigation between the main pages of an application is a \`<${componentName(entry.ero)}>\` around the platform's own links, named and with the current page marked${linkName === undefined ? "" : `; a single link is a \`<${componentName(linkName.ero)}>\``}.`,
    )
    .join("\n");
  // Spec 015 ① (G7, plan ① D-07): every long list in pages gets the pagxigilo, every page in a
  // hierarchy shows its path in the spuro; generated from the role navigation with the parts
  // ellipsis and separator, the companions named where the Modelo has them.
  const pagerButton = buttonName;
  const tabsName = eroj.find((entry) => entry.skemo.a11y.role === "tablist");
  const paginationLines = eroj
    .filter(
      (entry) =>
        entry.skemo.a11y.role === "navigation" &&
        entry.skemo.parts.ellipsis !== undefined &&
        entry.uzo !== undefined,
    )
    .map(
      (entry) =>
        `- Every long list in pages gets a \`<${componentName(entry.ero)}>\` under it, the current page marked and an arrow back and forth${pagerButton === undefined ? "" : `; more on demand is a \`<${componentName(pagerButton.ero)}>\``}${tabsName === undefined ? "" : `, views of one thing are a \`<${componentName(tabsName.ero)}>\``}.`,
    )
    .join("\n");
  const breadcrumbLines = eroj
    .filter(
      (entry) =>
        entry.skemo.a11y.role === "navigation" &&
        entry.skemo.parts.separator !== undefined &&
        entry.uzo !== undefined,
    )
    .map(
      (entry) =>
        `- Every page inside a hierarchy shows its path in a \`<${componentName(entry.ero)}>\` at its head, each level a link and the current page text${navigationName === undefined ? "" : `; the places beside a page are the \`<${componentName(navigationName.ero)}>\``}.`,
    )
    .join("\n");
  const tabsLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "tablist" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every switch between views of the same thing on one page is a \`<${componentName(entry.ero)}>\` with distinct tab labels${radioName === undefined ? "" : `; a choice in a form is an \`<${componentName(radioName.ero)}>\``}${navigationName === undefined ? "" : `, and the pages of an application are a \`<${componentName(navigationName.ero)}>\``}.`,
    )
    .join("\n");
  // Spec 014 ② (G10, plan ② D-10): every icon is the ikono with a name of the Ikonaro, never a
  // pasted SVG; every dividing line the apartigilo; the first focusable element of a page the
  // saltligilo (the link that floats); generated from the roles img, separator and link.
  const iconLines = eroj
    .filter(
      (entry) =>
        entry.skemo.a11y.role === "img" && !isAvatar(entry.skemo) && entry.uzo !== undefined,
    )
    .map(
      (entry) =>
        `- Every icon is an \`<${componentName(entry.ero)}>\` with a name from the Ikonaro, decorative unless it carries meaning (then with a \`label\`); never paste an SVG.`,
    )
    .join("\n");
  const separatorLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "separator" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every line that separates groups of content is an \`<${componentName(entry.ero)}>\`; where space alone separates, use spacing and no line.`,
    )
    .join("\n");
  // Spec 014 ③ (G7, plan ③ D-07): every heading is the titolo with its level, every running text
  // the teksto in a type role; generated from the roles heading and paragraph.
  const headingLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "heading" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every heading is a \`<${componentName(entry.ero)}>\` with its \`level\` (the structure of the page); its \`size\` is design, never a level chosen for its size.`,
    )
    .join("\n");
  const paragraphLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "paragraph" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every running text, caption, kicker or inline code is a \`<${componentName(entry.ero)}>\` in a type role; never a styled span.`,
    )
    .join("\n");
  // Spec 014 ④ (G7, plan ④ D-08): every hover hint is the konsileto bound to its control, every
  // non-modal layer the sxvebilo, every set of actions on one object the menuo; generated from
  // the roles tooltip, dialog with a trigger slot (the popover) and menu.
  const tooltipLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "tooltip" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every name or short hint of a control shown on hover or focus is a \`<${componentName(entry.ero)}>\` bound to it with \`htmlFor\`; what a person needs to act stands visibly as text.`,
    )
    .join("\n");
  const popoverLines = eroj
    .filter((entry) => isPopover(entry.skemo) && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every non-modal layer with content beside its trigger is a \`<${componentName(entry.ero)}>\`${dialogName === undefined ? "" : `; a layer that asks for a decision is a \`<${componentName(dialogName.ero)}>\``}.`,
    )
    .join("\n");
  const menuLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "menu" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every set of actions on one object behind a single button is a \`<${componentName(entry.ero)}>\` whose entries name their actions; never a button per action in a row.`,
    )
    .join("\n");
  // Spec 014 ⑤ (G7, plan ⑤ D-06): every secondary content opened on demand is the faldilo, every
  // field with suggestions the kompletigilo; generated from the roles group with a summary slot
  // and combobox with a listbox part.
  const selectName = eroj.find(
    (entry) => entry.skemo.a11y.role === "combobox" && !isSuggest(entry.skemo),
  );
  const disclosureLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "group" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every secondary content a person opens on demand is a \`<${componentName(entry.ero)}>\` whose summary names what it hides; several with one \`group\` open one at a time.`,
    )
    .join("\n");
  const suggestLines = eroj
    .filter((entry) => isSuggest(entry.skemo) && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every field whose values a person types and picks from suggestions is a \`<${componentName(entry.ero)}>\`${selectName === undefined ? "" : `; a fixed short list is an \`<${componentName(selectName.ero)}>\``}.`,
    )
    .join("\n");
  // Spec 015 ② (G7, plan ② D-08): every file a form asks for is the alsxutilo, its help naming
  // kinds and size; generated from the role button with a dropzone part, the kampo named beside.
  const uploadLines = eroj
    .filter((entry) => isUpload(entry.skemo) && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every file a form asks for is an \`<${componentName(entry.ero)}>\` whose help names the kinds and the size it takes (\`accept\`, \`max-size\`)${fieldName === undefined ? "" : `; a text a person types is a \`<${componentName(fieldName.ero)}>\``}, and sending the files is the application's.`,
    )
    .join("\n");
  // Spec 015 ③ (G7, plan ③ D-06): every summary of one thing is the karto at the level of its
  // heading; generated from the role article, the record list and the notice named beside it.
  const cardLines = eroj
    .filter((entry) => entry.skemo.a11y.role === "article" && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every summary of one thing — a heading, an image, a sentence and at most two actions — is a \`<${componentName(entry.ero)}>\` with the \`level\` of its heading${recordName === undefined ? "" : `; the fields of one record are an \`<${componentName(recordName.ero)}>\``}${noticeName === undefined ? "" : `, what happened is an \`<${componentName(noticeName.ero)}>\``}, and a whole card is never one link.`,
    )
    .join("\n");
  // Spec 015 ③ (G7, plan ③ D-10): every person or thing shown as a picture or initials is the
  // avataro with its name; generated from the image with an initials part, the badge named beside.
  const avatarLines = eroj
    .filter((entry) => isAvatar(entry.skemo) && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- Every person or thing shown as a picture or as initials is an \`<${componentName(entry.ero)}>\` with its \`name\` (\`decorative\` where the name stands beside it)${badgeName === undefined ? "" : `; a status is an \`<${componentName(badgeName.ero)}>\``}, never a dot or a colour worked out from the name.`,
    )
    .join("\n");
  const skipLines = eroj
    .filter((entry) => isSkip(entry.skemo) && entry.uzo !== undefined)
    .map(
      (entry) =>
        `- The first focusable element of a page is a \`<${componentName(entry.ero)}>\` to the main content${linkName === undefined ? "" : `; a reference inside the text is a \`<${componentName(linkName.ero)}>\``}.`,
    )
    .join("\n");
  return [
    {
      path: `${base}/Guidelines.md`,
      text: `# Fundamento (${aspekto})

This kit is the design system Fundamento in the Aspekto \`${aspekto}\`. Build screens from its
components and its tokens; never write a colour, a size or a font value yourself.

- Use the components of this kit; do not rebuild them.
- Take every value from a token: Tailwind classes \`*-fm-*\` or the CSS variables \`--fm-*\`.
- Switch brand, colour scheme, contrast, density, viewport and motion with the \`data-fm-*\`
  attributes on \`<html>\`; never with a second stylesheet.
${ruleLines}
${fieldLines}
${areaLines}
${dialogLines}
${switchLines}
${checkboxLines}
${radioLines}
${selectLines}
${badgeLines}
${noticeLines}
${stateLines}
${tableLines}
${recordLines}
${meterLines}
${navigationLines}
${paginationLines}
${breadcrumbLines}
${tabsLines}
${iconLines}
${separatorLines}
${skipLines}
${headingLines}
${paragraphLines}
${tooltipLines}
${popoverLines}
${menuLines}
${disclosureLines}
${suggestLines}
${uploadLines}
${cardLines}
${avatarLines}

Where to look: \`setup.md\` for the imports, \`foundations/\` for the tokens, \`components/\` for
each component.
`,
    },
    {
      path: `${base}/setup.md`,
      text: `# Setup

Import the styles once, then use the components. There is no provider and no theme object.

\`\`\`tsx
import "${makeKitName(aspekto)}/styles.css";
import "${makeKitName(aspekto)}/tailwind.css"; // only with Tailwind v4
import { ${eroj.map((entry) => componentName(entry.ero)).join(", ")} } from "${makeKitName(aspekto)}";
\`\`\`

Set the Dimensioj on \`<html>\`; every value follows without a reload.

\`\`\`html
<html data-fm-color-scheme="dark" data-fm-contrast="high">
\`\`\`

See \`foundations/dimensioj.md\` for the attributes and their values.
`,
    },
    {
      path: `${base}/foundations/color.md`,
      text: `# Colour

Every colour is a role, never a value. Use the class or the variable, never a hex code.

${tokenTable(input, "color.")}
`,
    },
    {
      path: `${base}/foundations/typography.md`,
      text: `# Typography

Type comes as composite tokens: family, size, weight, letter spacing and line height together.

${tokenTable(input, "typography.", false)}

In CSS each field is its own variable, e.g. \`${tokenVariable("typography.label.1")}-font-size\`.
`,
    },
    {
      path: `${base}/foundations/spacing.md`,
      text: `# Spacing, size and radius

${tokenTable(input, "spacing.")}

${tokenTable(input, "size.")}

${tokenTable(input, "radius.")}
`,
    },
    {
      path: `${base}/foundations/dimensioj.md`,
      text: `# Dimensioj

Every Dimensio is an attribute on \`<html>\`; leaving it out means the default.

| Attribute | Values | Default |
|---|---|---|
${dimensioj}

A frame never mixes two values of one Dimensio: the whole document switches together.
`,
    },
    ...eroj.map((entry) => ({
      path: `${base}/components/${entry.ero.name}.md`,
      text: componentGuideline(input, entry, reguloj),
    })),
  ];
}

/**
 * The sources of a kit: the elements in one module (the Skemo and the stylesheet inline, so the
 * kit carries no workspace dependency), the React wrapper beside it, and an index that joins them.
 * The wrapper imports the element module, never the index: that keeps the three files in one
 * direction and out of an import cycle (F6).
 */
function sources(input: CeloInput, aspekto: string): GeneratedFile[] {
  const header = `// Generated by fm projekcioj build from the Modelo (Aspekto ${aspekto}); do not edit (Art. I).\n`;
  // Every Ero in one module (D-14); the template scopes each element's names (Spec 008).
  const elements = input.modelo.eroj
    .map((entry) => {
      const { constant } = namesOf(entry.ero);
      // A light-DOM host (Spec 011 ④, E10) carries the document's stylesheet too.
      const light = isLight(entry.skemo)
        ? `const ${constant}_LIGHT_CSS = ${JSON.stringify(lightStylesheetOf(entry.skemo, namesOf(entry.ero).tag))};\n`
        : "";
      return `const ${constant}_SKEMO = ${JSON.stringify(entry.skemo)} as const;
const ${constant}_CSS = ${JSON.stringify(stylesheetOf(entry.skemo, entry.uzo))};
${light}${elementSource(elementNamesOf(entry, true, input.modelo.ikonaro))}`;
    })
    .join("\n");
  const defines = input.modelo.eroj
    .map(({ ero }) => `  define${namesOf(ero).className}();`)
    .join("\n");
  return [
    {
      path: `${DIR}/${aspekto}/src/element.ts`,
      text: `${header}${elements}
/** Registers every Ero once. Importing this module already did it; this is the explicit way. */
export function defineEroj(): void {
${defines}
}
`,
    },
    {
      path: `${DIR}/${aspekto}/src/react.ts`,
      text: header + reactSource(input.modelo.eroj, "./element.js"),
    },
    {
      path: `${DIR}/${aspekto}/src/index.ts`,
      text: `${header}export * from "./element.js";
export * from "./react.js";
`,
    },
  ];
}

/**
 * The licence of every kit, MIT, taken from the repository's LICENSE so the two never drift. It is
 * written into the kit (F25): `pnpm publish` had taken it from the repository root, `npm publish`
 * by hand did not, and the published 0.1.0-next.0 carried 17 files instead of 18.
 */
const LICENSE = readFileSync(new URL("../../../../../LICENSE", import.meta.url), "utf8");

/**
 * The version of the kits: `<modelo>-next.0` unless FUNDAMENTO_KIT_VERSION asks for another one
 * (release.yml hands the maintainer's input through). Two forms are taken: a pre-release of the
 * Modelo's version (`0.1.0-next.1`, published under `next`) and, since Nachlese 5 ③, exactly the
 * Modelo's version (`0.1.0`: the release itself, published under `latest`). Any other number is
 * refused: the kit would claim a version of nothing.
 */
export function kitVersion(input: CeloInput): string {
  const modelo = input.modeloJson.fundamento.version;
  const requested = input.env?.FUNDAMENTO_KIT_VERSION;
  if (requested === undefined || requested === "") return `${modelo}-next.0`;
  if (requested === modelo) return requested;
  if (!requested.startsWith(`${modelo}-`) || !/^\d+\.\d+\.\d+-[0-9A-Za-z.-]+$/.test(requested)) {
    throw new Error(
      `FUNDAMENTO_KIT_VERSION=${requested} is neither the Modelo's version ${modelo} nor a ` +
        `pre-release of it (expected ${modelo} or ${modelo}-<Vorabkennung>, e.g. ${modelo}-next.1).`,
    );
  }
  return requested;
}

export const MAKE_KIT_CELO: Celo = {
  name: "make-kit",
  generate(input: CeloInput): GeneratedFile[] {
    const version = kitVersion(input);
    return aspektojOf(input.modelo).flatMap((aspekto) => [
      { path: `${DIR}/${aspekto}/LICENSE`, text: LICENSE },
      {
        path: `${DIR}/${aspekto}/package.json`,
        text: `${JSON.stringify(
          {
            name: makeKitName(aspekto),
            version,
            description: `Fundamento Make kit: the Aspekto ${aspekto} with its Eroj, tokens and generated guidelines.`,
            license: "MIT",
            // Provenance checks the repository this package claims to come from (F7).
            repository: {
              type: "git",
              url: "git+https://github.com/thojank/fundamento.git",
              // The generator, not the generated folder: only this path exists in the repository,
              // so the link from npm leads somewhere (K2).
              directory: "packages/projekcioj",
            },
            homepage: "https://github.com/thojank/fundamento#readme",
            type: "module",
            main: "./dist/index.cjs",
            module: "./dist/index.js",
            types: "./dist/index.d.ts",
            exports: {
              ".": {
                types: "./dist/index.d.ts",
                import: "./dist/index.js",
                require: "./dist/index.cjs",
              },
              // Plain HTML: the elements alone, so no bare "react" import has to resolve (F6).
              "./element": {
                types: "./dist/element.d.ts",
                import: "./dist/element.js",
                require: "./dist/element.cjs",
              },
              "./styles.css": "./styles.css",
              "./tailwind.css": "./tailwind.css",
              "./guidelines/*": "./guidelines/*",
              "./package.json": "./package.json",
            },
            files: ["dist", "guidelines", "styles.css", "tailwind.css", "README.md", "LICENSE"],
            peerDependencies: { react: ">=18", "react-dom": ">=18" },
            publishConfig: { access: "public", tag: "next" },
            // Tree shaking must keep the registration of the elements and the stylesheets (K1).
            sideEffects: [
              "**/*.css",
              "./dist/element.js",
              "./dist/element.cjs",
              "./dist/index.js",
              "./dist/index.cjs",
            ],
          },
          null,
          2,
        )}\n`,
      },
      {
        path: `${DIR}/${aspekto}/README.md`,
        text: `# ${makeKitName(aspekto)}

The design system Fundamento as a Figma Make kit, in the Aspekto \`${aspekto}\`. Generated from the
Fundamento Modelo; every value is a token, every rule has a reason.

- \`styles.css\` — the tokens as CSS variables, switched by \`data-fm-*\` on \`<html>\`
- \`tailwind.css\` — the same tokens as a Tailwind v4 theme (\`bg-fm-…\`)
- \`guidelines/\` — what Figma Make reads: setup, foundations and one file per component

See \`guidelines/setup.md\`.
`,
      },
      {
        path: `${DIR}/${aspekto}/styles.css`,
        text: aspektoStylesheet(input.modelo, aspekto),
      },
      { path: `${DIR}/${aspekto}/tailwind.css`, text: themeBlock(input) },
      ...sources(input, aspekto),
      ...guidelines(input, aspekto),
    ]);
  },
};

/** The type declarations of a kit (deterministic text instead of a type build). */
function declarations(input: CeloInput, options: { elementsOnly?: boolean } = {}): string {
  const elements = input.modelo.eroj.map(
    (entry) => `export declare class ${namesOf(entry.ero).className} extends HTMLElement {}`,
  );
  if (options.elementsOnly === true) {
    return `// Generated by fm projekcioj build; do not edit (Art. I).
${elements.join("\n")}
export declare function defineEroj(): void;
`;
  }
  const components = input.modelo.eroj.flatMap((entry) => {
    const name = componentName(entry.ero);
    return [
      `export declare const ${name}: import("react").ForwardRefExoticComponent<`,
      `  ${name}Props & import("react").RefAttributes<HTMLElement>`,
      ">;",
    ];
  });
  return `// Generated by fm projekcioj build; do not edit (Art. I).
${reactSource(input.modelo.eroj, "./element.js", { typesOnly: true })}
${elements.join("\n")}
${components.join("\n")}
export declare function defineEroj(): void;
`;
}

/**
 * Writes every kit under `outDir` and bundles it with Vite in library mode (ESM and CJS, React
 * external), then writes the type declarations. Returns the directory of each Aspekto.
 */
export async function buildMakeKits(
  outDir: string,
  source: ModeloSource = defaultModeloSource(),
): Promise<Record<string, string>> {
  const prepared = celoInputOf(source);
  if (!prepared.ok) {
    throw new Error(
      `The Modelo is invalid (${prepared.errors.length} error(s)); run fm modelo validate.`,
    );
  }
  for (const file of MAKE_KIT_CELO.generate(prepared.input)) {
    const target = join(outDir, file.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.text);
  }
  const bundled = await bundleMakeKits(outDir, prepared.input);
  // `bundled` lists files; a kit is the directory two levels above them.
  return Object.fromEntries(
    [...new Set(bundled.map((path) => path.split("/")[1] ?? ""))].map((aspekto) => [
      aspekto,
      join(outDir, DIR, aspekto),
    ]),
  );
}

/**
 * Bundles the kit sources already written under `outDir` (ESM and CJS, React external) and writes
 * the type declarations. Returns the relative directory of each kit.
 */
export async function bundleMakeKits(outDir: string, input: CeloInput): Promise<string[]> {
  const kits: string[] = [];
  for (const aspekto of aspektojOf(input.modelo)) {
    const dir = join(outDir, DIR, aspekto);
    kits.push(
      `${DIR}/${aspekto}/dist/index.js`,
      `${DIR}/${aspekto}/dist/index.cjs`,
      `${DIR}/${aspekto}/dist/index.d.ts`,
      `${DIR}/${aspekto}/dist/element.js`,
      `${DIR}/${aspekto}/dist/element.cjs`,
      `${DIR}/${aspekto}/dist/element.d.ts`,
    );
    bundle(dir);
    writeFileSync(join(dir, "dist", "index.d.ts"), declarations(input));
    writeFileSync(join(dir, "dist", "element.d.ts"), declarations(input, { elementsOnly: true }));
  }
  return kits;
}

/**
 * Bundles one kit in a child process whose working directory is the kit: the bundler writes module
 * paths relative to the working directory, so building the same kit in two places gives the same
 * bytes (AK-02).
 */
function bundle(dir: string): void {
  const vite = createRequire(import.meta.url).resolve("vite");
  const script = `
import { pathToFileURL } from "node:url";
const { build } = await import(pathToFileURL(${JSON.stringify(vite)}).href);
await build({
  configFile: false,
  logLevel: "silent",
  root: ".",
  build: {
    lib: {
      // Two entries: the package (React) and the elements alone, for plain HTML (F6).
      entry: ["src/index.ts", "src/element.ts"],
      formats: ["es", "cjs"],
      fileName: (format, name) => (format === "cjs" ? name + ".cjs" : name + ".js"),
    },
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime"] },
  },
});
`;
  execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd: dir,
    stdio: "pipe",
  });
}

/** The names in backticks of a piece of a guideline: `` `primary`, `secondary` `` → two names. */
const ticked = (text: string): string[] =>
  [...text.matchAll(/`([^`]+)`/g)].map(([, value = ""]) => value);

/** The `## ` headings of a guideline, in order. */
export function guidelineSections(markdown: string): string[] {
  return [...markdown.matchAll(/^## (.+)$/gm)].map(([, heading = ""]) => heading.trim());
}

/** The body of one `## ` section of a guideline, or nothing. */
function sectionBody(markdown: string, heading: string): string | undefined {
  const start = markdown.indexOf(`\n## ${heading}\n`);
  if (start === -1) return undefined;
  const rest = markdown.slice(start + heading.length + 5);
  const end = rest.indexOf("\n## ");
  return end === -1 ? rest : rest.slice(0, end);
}

/**
 * What the component guideline of a kit documents (Spec 003 T021, FR-12): the props table with
 * its values and defaults, and the states sentence. Read from the Markdown a Make user reads, so
 * a guideline that documents a value the Skemo does not have fails the parity check. Since Spec
 * 007 the guideline also carries the Uzo (slots, layout, text); the inventory knows the sections
 * and reads props only from the Props table, so a slot table is not mistaken for a prop.
 */
export function guidelinesInventory(markdown: string): ParityItem & { sections: string[] } {
  const props: Record<string, string[]> = {};
  const values: Record<string, string> = {};
  for (const [, name = "", valueCell = "", defaultCell = ""] of (
    sectionBody(markdown, "Props") ?? markdown
  ).matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|([^|]*)\|([^|]*)\|/gm)) {
    const listed = ticked(valueCell);
    props[name] = listed.length > 0 ? listed : [valueCell.trim()];
    const [fallback] = ticked(defaultCell);
    if (fallback !== undefined) values[`default.${name}`] = fallback;
  }
  const states = /States:([^.]*)\./.exec(markdown);
  return {
    props,
    states: states === null ? [] : ticked(states[1] ?? ""),
    values,
    sections: guidelineSections(markdown),
  };
}
