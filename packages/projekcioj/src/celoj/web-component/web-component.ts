// Web Component Celo (Spec 003, FR-07, plan D-07, contracts/projekcioj §3). For every Ero it writes
// into @fundamento/eroj/src/generated/: the Skemo as a descriptor, the stylesheet (every design
// value a token), and the element from the behaviour template (element-template.ts). Native Custom
// Element, open Shadow DOM with delegatesFocus, a native <button part="control"> inside, form
// participation through ElementInternals. The mapping of platform-neutral part properties to CSS
// is Celo knowledge and lives only here (Art. VIII). Pure.

import {
  boundToken,
  combinationsOf,
  isBindingKeyword,
  isEntryKey,
  type LoadedEro,
  nomRegulo,
  type ParityItem,
  type Skemo,
  type SkemoPartProperty,
  type SkemoPartSource,
  STATE_KEY,
  type Uzo,
} from "@fundamento/modelo";
import type { Celo, CeloInput, GeneratedFile } from "../../build.js";
import { elementSource, hostOf } from "./element-template.js";

/** Slotted icons: a pseudo-element, so it follows the :where() of the control. */
const ICONS = 'slot[name^="icon-"]::slotted(*)';

/** The mark an icon slot falls back to (Spec 008, D-05): styled like a slotted icon. */
const MARK = 'slot[name^="icon-"] > svg';

/** The selector of a part in the shadow tree; `control` carries the combination and state. */
function partSelector(part: string, control: string): string {
  if (part === "icon") return `:where(${control}) ${ICONS}, :where(${control}) ${MARK}`;
  if (part === "focus-ring") return `:where(${control}:focus-visible)`;
  return `:where(${control})`;
}

/**
 * The selector of a part of a field (Spec 009, D-08): the combination stands on the field, the
 * state on the native input inside (`:has()`), and every part is its own element — label, help,
 * error and the mark of a required field; the placeholder is the input's own pseudo-element; the
 * gap between the parts belongs to the field itself.
 */
function fieldPartSelector(
  part: string,
  property: string,
  data: string,
  state: string,
  select = false,
): string {
  const root = `[part="field"]${data}${state === "" ? "" : `:has([part="control"]${state})`}`;
  if (part === "box" && property === "gap") return `:where(${root})`;
  // A select (Spec 010 ④, D-06) shows its placeholder as the first option, chosen while nothing
  // else is: the colour of the placeholder is the select's while that option is the chosen one.
  // Outside :where(), so that it wins over the colour of the text in every state (specificity).
  if (part === "placeholder" && select) {
    return `:where(${root}) [part="control"]:has(> option[value=""]:checked)`;
  }
  if (part === "placeholder") return `:where(${root}) [part="control"]::placeholder`;
  // The chevron of a select is an element of its own beside the select (D-06).
  if (part === "indicator") return `:where(${root}) [part="indicator"]`;
  if (part === "focus-ring") return `:where(${root}) [part="control"]:focus-visible`;
  if (["label", "help", "error", "required-mark"].includes(part)) {
    return `:where(${root}) [part="${part}"]`;
  }
  return `:where(${root}) [part="control"]`;
}

/**
 * Whether the Ero is a field (a composite of label, input, help and error): a text field, or a
 * select (Spec 010 ④, D-06) — the same field around the platform's select.
 */
const isField = (skemo: Skemo): boolean =>
  hostOf(skemo.a11y.role) === "input" || isSelect(skemo) || isTextarea(skemo);

/** Whether the Ero is a text area (Spec 011 ②, D-11): a textbox over several lines, with rows. */
export const isMultiline = (skemo: Skemo): boolean =>
  skemo.props.some((prop) => prop.name === "rows");
const isTextarea = (skemo: Skemo): boolean => skemo.a11y.role === "textbox" && isMultiline(skemo);

/** Whether the Ero is a dialog (Spec 011 ②, D-12): the platform's dialog, opened modal. */
const isDialog = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "dialog";

/** Static text (Spec 011 ③, D-08): the badge, a span without a role. */
const isText = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "text";

/** A live region (Spec 011 ③, D-09, D-10): the notice, the loading and empty state. */
const isStatus = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "status";

/**
 * The selector of a part of a live region (Spec 011 ③): the combination stands on the control
 * (data-intent, data-kind); surface, accent, border, box and motion are the control itself, every
 * other part — heading, message, details, text, actions, indicator, dismiss — its own element.
 */
function statusPartSelector(part: string, data: string): string {
  const control = `[part="control"]${data}`;
  if (["surface", "accent", "border", "box", "motion"].includes(part)) return `:where(${control})`;
  return `:where(${control}) [part="${part}"]`;
}

/**
 * The selector of a part of a dialog (Spec 011 ②, D-12): the dialog itself is the control and
 * carries the combination (data-size, data-reason) and the parts surface, border and box; the
 * backdrop is its ::backdrop; heading, message, content, reason and actions are elements of their
 * own inside it. One state, rest.
 */
function dialogPartSelector(part: string, data: string): string {
  const root = `[part="control"]${data}`;
  if (part === "backdrop") return `:where(${root})::backdrop`;
  if (["heading", "message", "content", "reason", "actions"].includes(part)) {
    return `:where(${root}) [part="${part}"]`;
  }
  return `:where(${root})`;
}

/** Whether the Ero is a select (Spec 010 ④, D-06): the field of the kampo around a select. */
const isSelect = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "select";

/**
 * Whether the Ero is a toggle: a control with its label beside it — the track of a switch with
 * its knob (Spec 010 ①, D-09), the box of a checkbox with its check mark (Spec 010 ②, D-08).
 */
const isToggle = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "toggle";

/**
 * The selector of a part of a toggle (Spec 010 ①, D-09): the combination stands on the field, the
 * state on the button inside (`:has()`), like the field of the kampo. The track or box is the
 * button itself; the indicator, the label, the error and the mark of a required box are elements
 * of their own; the gap between control and label is the field's. The position of a knob is the
 * alignment of the track (D-04).
 */
function togglePartSelector(part: string, property: string, data: string, state: string): string {
  const root = `[part="field"]${data}${state === "" ? "" : `:has([part="control"]${state})`}`;
  if (part === "box" && property === "gap") return `:where(${root})`;
  if (part === "focus-ring") return `:where(${root}) [part="control"]:focus-visible`;
  if (part === "indicator" && property !== "position") return `:where(${root}) [part="indicator"]`;
  if (["label", "error", "required-mark"].includes(part)) return `:where(${root}) [part="${part}"]`;
  return `:where(${root}) [part="control"]`;
}

/** Whether the Ero is a radio group (Spec 010 ③, D-06): a group of rows, one per option. */
const isGroup = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "group";

/**
 * The states of a radio group (Spec 010 ③, D-06): hover and focus are a row's — the option under
 * the pointer, the option with the focus — invalid and disabled the group's. The Web Celo spells
 * them as the group and its rows speak them (aria-invalid, aria-disabled), not as data attributes.
 */
const GROUP_STATES: Readonly<Record<string, string | undefined>> = {
  invalid: '[aria-invalid="true"]',
  disabled: '[aria-disabled="true"]',
};
const ROW_STATES: Readonly<Record<string, string | undefined>> = {
  hover: ":hover",
  focus: ":focus-visible",
};

/**
 * The selector of a part of a radio group (Spec 010 ③, D-06): the combination and the states of the
 * group stand on the field, the state of one option (selected, E7) and its hover and focus on the
 * row; the circle is the row's control with the dot in it, the label of the option beside it. The
 * gap of the options stands between the parts of the field and between the rows; the gap of the box
 * between a circle and its label. Every prefix lies in :where(), so the order of the states decides.
 */
function groupPartSelector(
  part: string,
  property: string,
  data: string,
  entry: string,
  state: string,
): string {
  const root = `[part="field"]${data}${GROUP_STATES[state] ?? ""}`;
  const row = `[part="option"]${entry}${ROW_STATES[state] ?? ""}`;
  if (part === "options" && property === "gap")
    return `:where(${root}), :where(${root}) [part="options"]`;
  if (part === "box" && property === "gap") return `:where(${root} ${row})`;
  if (part === "focus-ring")
    return `:where(${root} [part="option"]:focus-visible) [part="control"]`;
  if (["label", "help", "error", "required-mark"].includes(part)) {
    return `:where(${root}) [part="${part}"]`;
  }
  if (part === "option-label" || part === "indicator")
    return `:where(${root} ${row}) [part="${part}"]`;
  return `:where(${root} ${row}) [part="control"]`;
}

/**
 * CSS selector suffix of each state. `focus` is :focus-visible (the focus ring and, since Spec
 * 008, a label colour of its own); `visited` is the link's own state (Spec 008, D-09).
 */
const STATE_SELECTORS: Readonly<Record<string, string | undefined>> = {
  rest: "",
  visited: ":visited",
  focus: ":focus-visible",
  hover: ":hover",
  pressed: ":active",
  // A field (Spec 009): wrong, read-only (the attribute, not :read-only, which disabled has too).
  invalid: '[aria-invalid="true"]',
  readonly: "[readonly]",
  loading: '[aria-busy="true"]',
  disabled: ":disabled",
};

/**
 * Later states win: they come later in the source (all selectors have the same specificity).
 * Visited and focus before hover and pressed, so a pointer on a visited link shows hover.
 */
const STATE_ORDER = [
  "rest",
  "visited",
  "focus",
  "hover",
  "pressed",
  "invalid",
  "readonly",
  "loading",
  "disabled",
];

const variable = (token: string, field?: string) =>
  `var(${nomRegulo("css").derive(token)}${field === undefined ? "" : `-${field}`})`;

/**
 * CSS declarations of a binding keyword (Spec 008, D-03, D-09). `inherit`: the typography is the
 * text's, so the control flows in the text (inline, breaking with it) and sets no font of its own.
 * `none`: the property is not set — the underline is off, a minimum is not written.
 */
function keywordDeclarations(part: string, property: string, token: string): string[] {
  if (token === "inherit") {
    return property === "typography" ? ["display: inline;", "white-space: normal;"] : [];
  }
  // The underline is switched off; a minimum that is none is simply not written.
  if (part === "underline" && property === "width") return ["text-decoration-line: none;"];
  // A colour that is none (Spec 010 ②, D-08): the part is not drawn in that combination — the
  // check mark of an unticked box — and keeps its place, so the box does not change its size.
  if (token === "none" && (property === "color" || property === "fill")) return ["opacity: 0;"];
  return [];
}

/** CSS declarations of one part property bound to `token` (Celo knowledge, Art. VIII). */
function declarations(skemo: Skemo, part: string, property: string, token: string): string[] {
  // A position is a term (Spec 010 ①, D-04): the alignment of the track along the writing
  // direction, so right to left mirrors itself; structure, no design value.
  if (property === "position") {
    return [`justify-content: ${token === "end" ? "flex-end" : "flex-start"};`];
  }
  // The stroke of a border (Spec 011 ③, D-10): a stroke.* token is the border style (dashed for
  // an empty state); none draws no border in that combination.
  if (property === "stroke") {
    return [token === "none" ? "border-style: none;" : `border-style: ${variable(token)};`];
  }
  // The accent of a notice (Spec 011 ③, D-09): a line along the start edge of the surface, its
  // colour and width bound; the writing direction mirrors it.
  if (isStatus(skemo) && part === "accent") {
    if (property === "color") return [`border-inline-start-color: ${variable(token)};`];
    if (property === "width") return [`border-inline-start-width: ${variable(token)};`];
  }
  // The inline padding of a live region is its padding on every side, as the dialog's (D-09).
  if (isStatus(skemo) && part === "box" && property === "inline-padding") {
    return [`padding: ${variable(token)};`];
  }
  if (isBindingKeyword(token)) return keywordDeclarations(part, property, token);
  // The underline of a link (Spec 008): a text decoration of the width and colour bound.
  if (part === "underline") {
    if (property === "width") {
      return ["text-decoration-line: underline;", `text-decoration-thickness: ${variable(token)};`];
    }
    if (property === "color") return [`text-decoration-color: ${variable(token)};`];
  }
  // The lift of a surface (Spec 011 ②, D-07): a shadow token as the box shadow.
  if (property === "shadow") return [`box-shadow: ${variable(token)};`];
  // The veil of a dialog (Spec 011 ②, D-12): the backdrop's colour is its fill.
  if (part === "backdrop" && property === "color") return [`background-color: ${variable(token)};`];
  // The surface of a dialog (Spec 011 ②, D-12) takes the width of its size; that it never takes
  // more than the viewport gives is the platform's own rule for a dialog (its max-width). Its
  // inline padding is its padding on every side.
  if (isDialog(skemo) && part === "surface" && property === "width") {
    return [`inline-size: ${variable(token)};`];
  }
  if (isDialog(skemo) && part === "box" && property === "inline-padding") {
    return [`padding: ${variable(token)};`];
  }
  switch (property as SkemoPartProperty) {
    case "fill":
      return [`background-color: ${variable(token)};`];
    case "color": {
      if (part === "focus-ring") {
        // The gap between control and ring, filled in the gap colour (focus-ring-dual-contrast).
        const offset = fixedToken(skemo.parts[part]?.offset);
        return offset === undefined
          ? []
          : [`box-shadow: 0 0 0 ${variable(offset)} ${variable(token)};`];
      }
      return part === "border"
        ? [`border-color: ${variable(token)};`]
        : [`color: ${variable(token)};`];
    }
    case "typography":
      return [
        `font-family: ${variable(token, "font-family")};`,
        `font-size: ${variable(token, "font-size")};`,
        `font-weight: ${variable(token, "font-weight")};`,
        `letter-spacing: ${variable(token, "letter-spacing")};`,
        `line-height: ${variable(token, "line-height")};`,
        // Gesperrte Versalien sind ein Paar (F31): Wer die Rolle setzt, setzt beide Werte, und die
        // Rolle trägt sie je Modus — eine Marke in Versalien schaltet mit, ohne Sonderregel.
        `text-transform: ${variable(token, "text-transform")};`,
      ];
    case "width":
      return part === "border"
        ? [`border-width: ${variable(token)};`]
        : [`min-inline-size: ${variable(token)};`];
    case "height":
      return [`min-block-size: ${variable(token)};`];
    case "inline-padding":
      return [`padding-inline: ${variable(token)};`];
    case "gap":
      return [`gap: ${variable(token)};`];
    case "radius":
      return [`border-radius: ${variable(token)};`];
    case "ring":
      return [
        `outline-width: ${variable(token, "width")};`,
        `outline-style: ${variable(token, "style")};`,
        `outline-color: ${variable(token, "color")};`,
      ];
    case "offset":
      return [`outline-offset: ${variable(token)};`];
    case "size":
      return [`inline-size: ${variable(token)};`, `block-size: ${variable(token)};`];
    case "duration":
      return [`transition-duration: ${variable(token)};`];
    case "easing":
      return [`transition-timing-function: ${variable(token)};`];
    default:
      return [];
  }
}

function fixedToken(source: SkemoPartSource | undefined): string | undefined {
  return source !== undefined && "fixed" in source ? source.fixed : undefined;
}

/**
 * Layout that carries no design value: keywords only (the design values come from tokens). An Ero
 * whose Uzo says `wrap: with-text` (Spec 008, D-04) has an inline host, so it breaks with the text
 * it stands in; every other host is an inline block. The mark in an icon slot shows only while a
 * prop with an a11y text is true (`data-marked`, D-05).
 */
const structure = (inlineHost: boolean, disables: boolean, bordered: boolean): string =>
  [
    `:host { display: ${inlineHost ? "inline" : "inline-block"}; vertical-align: ${inlineHost ? "baseline" : "middle"}; }`,
    ":host([full-width]) { display: block; }",
    // A border style only for an Ero with a border part (Abnahme 2026-10-13, F-3): without the
    // part nothing sets the width, and the browser draws its initial medium border.
    `:where([part="control"]) { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; margin: 0; ${bordered ? "border-style: solid; " : ""}cursor: pointer; appearance: none; text-decoration: none; white-space: nowrap; transition-property: background-color, color, border-color, text-decoration-color; }`,
    ':host([full-width]) :where([part="control"]) { display: flex; }',
    ':where([part="control"]:focus:not(:focus-visible)) { outline-width: 0; }',
    // Only an Ero that can be disabled has the rule: the inventory reads the state from it.
    ...(disables
      ? [
          ':where([part="control"]:disabled, [part="control"][aria-disabled="true"]) { cursor: not-allowed; }',
        ]
      : []),
    `:where([part="control"]) ${ICONS}, :where([part="control"]) ${MARK} { flex: none; vertical-align: middle; }`,
    `:where([part="control"]:not([data-marked="true"])) ${MARK} { display: none; }`,
  ].join("\n");

/**
 * Layout of a field (Spec 009, D-08), keywords only: the host is a block that takes the width of
 * its container (E3), the field a column of label, input, help and error; the input fills the
 * column; the mark of a required field (an asterisk drawn as a small vector, no text) shows only
 * while the field is marked (data-marked).
 */
const fieldStructure = (disables: boolean, select = false, textarea = false): string =>
  [
    ":host { display: block; }",
    ':where([part="field"]) { display: flex; flex-direction: column; align-items: stretch; }',
    ':where([part="label"]) { display: inline-flex; align-items: baseline; }',
    // A text area (Spec 011 ②, D-11) may be dragged taller, never wider: its width is the container's.
    `:where([part="control"]) { display: block; box-sizing: border-box; margin: 0; border-style: solid; appearance: none; ${textarea ? "resize: vertical; " : ""}transition-property: background-color, color, border-color; }`,
    ':where([part="control"]:focus:not(:focus-visible)) { outline-width: 0; }',
    ...(disables ? [':where([part="control"]:disabled) { cursor: not-allowed; }'] : []),
    ':where([part="field"]:not([data-marked="true"])) [part="required-mark"] { display: none; }',
    ...(select ? selectStructure : []),
  ].join("\n");

/**
 * Layout of a dialog (Spec 011 ②, D-12), keywords only: the host holds nothing of its own (the
 * dialog lies in the top layer); the dialog is a column of heading, message, content, the reason
 * area and the actions; heading and message carry no margin of the user agent's; the content is a
 * column; the actions a row at the end (the writing direction mirrors it); the reason area stands
 * only with a reason. The cursor and the border style are the dialog's own.
 */
const dialogStructure: string = [
  ":host { display: contents; }",
  ':where([part="control"]) { display: flex; flex-direction: column; box-sizing: border-box; border-style: solid; transition-property: background-color, border-color; }',
  ':where([part="control"]:not([open])) { display: none; }',
  // A heading or a message that is a long word breaks inside the word (O-8 of Spec 011 ①): the
  // surface keeps the width of its size.
  ':where([part="heading"]) { margin: 0; overflow-wrap: anywhere; }',
  ':where([part="message"]) { margin: 0; overflow-wrap: anywhere; }',
  ':where([part="message"]:not(:has(slot:not(:empty)))) { display: none; }',
  ':where([part="content"]) { display: flex; flex-direction: column; }',
  ':where([part="actions"]) { display: flex; justify-content: flex-end; flex-wrap: wrap; }',
  ':where([part="control"][data-reason="none"]) [part="reason"] { display: none; }',
].join("\n");

/**
 * A text for assistive technology alone (Spec 011 ③, D-08, G4): clipped from sight, present in
 * the accessible content; no size literal (clip-path instead of the 1px box), structure only.
 */
const HIDDEN_TEXT =
  ".fm-hidden { position: absolute; clip-path: inset(50%); overflow: hidden; white-space: nowrap; }";

/**
 * Layout of static text (Spec 011 ③, D-08), keywords only: the badge is an inline block that
 * hugs its label and never wraps (the Uzo says never); no cursor, no transition, nothing to press.
 */
const textStructure = (bordered: boolean): string =>
  [
    ":host { display: inline-block; vertical-align: middle; }",
    `:where([part="control"]) { display: inline-flex; align-items: center; box-sizing: border-box; margin: 0; ${bordered ? "border-style: solid; " : ""}white-space: nowrap; }`,
    HIDDEN_TEXT,
  ].join("\n");

/**
 * Layout of a live region (Spec 011 ③, D-09, D-10), keywords only: the host is a block that takes
 * the width of its container (Uzo size container) and hides itself once dismissed; the control a
 * row — the indicator (where the Skemo has one), a column of the text slots, the dismiss butono at
 * the end — with the accent as the line along the start edge where the Skemo has the part, and
 * the border style from the stroke binding where it has one (so none is drawn where the Skemo
 * says none). A state with an indicator centres itself; the indicator is not drawn where its
 * colour is none (the Skemo keys it by kind), so no room stays empty.
 */
const statusStructure = (skemo: Skemo): string => {
  const accent = skemo.parts.accent !== undefined;
  const stroked = skemo.parts.border?.stroke !== undefined;
  const bordered = skemo.parts.border !== undefined && !stroked;
  const centred = skemo.parts.indicator !== undefined;
  return [
    ":host { display: block; }",
    ":host([hidden]) { display: none; }",
    `:where([part="control"]) { display: flex; align-items: ${centred ? "center" : "flex-start"}; ${centred ? "justify-content: center; text-align: center; " : ""}box-sizing: border-box; margin: 0; ${accent ? "border-inline-start-style: solid; " : ""}${bordered ? "border-style: solid; " : ""}}`,
    `:where([part="control"]) > div { display: flex; flex-direction: column; ${centred ? "" : "flex: 1 1 auto; "}min-inline-size: 0; }`,
    ':where([part="control"]) > div > [part] { margin: 0; overflow-wrap: anywhere; }',
    ':where([part="actions"]) { display: flex; flex-wrap: wrap; }',
    ':where([part="indicator"]) { display: block; flex: none; }',
    ':where([part="indicator"]) > svg { display: block; }',
    ':where([part="dismiss"][hidden]) { display: none; }',
    HIDDEN_TEXT,
  ].join("\n");
};

/**
 * The indicator of a live region is not drawn where its colour is none (Spec 011 ③, D-10): the
 * rule stands after the token rules, so the inventory reads the values of kind in the Skemo's
 * order (loading, empty), as every other side states them.
 */
function statusUndrawn(skemo: Skemo): string[] {
  return skemo.bindings
    .filter(
      (binding) =>
        binding.part === "indicator" && binding.property === "color" && binding.token === "none",
    )
    .map(
      (binding) =>
        `:where([part="control"]${Object.entries(binding.when ?? {})
          .map(([key, value]) => `[data-${key}="${value}"]`)
          .join("")}) [part="indicator"] { display: none; }`,
    );
}

/**
 * Layout of a select (Spec 010 ④, D-06), keywords only: the select and its chevron stand in one
 * row; the select fills it, the chevron does not shrink, lies over the end of the select (its
 * margins, from tokens, below) and lets every pointer through to the select, whose list opens.
 */
const selectStructure: readonly string[] = [
  ':where([part="field"]) > div { display: flex; align-items: center; }',
  ':where([part="field"]) > div > [part="control"] { flex: 1 1 auto; min-inline-size: 0; cursor: pointer; }',
  ':where([part="indicator"]) { display: block; flex: none; position: relative; pointer-events: none; }',
  ':where([part="indicator"]) > svg { display: block; }',
];

/**
 * Where the chevron of a select stands (Spec 010 ④, D-06), per combination of the props that key
 * the measures: inside the end of the control, its border and inline padding away from the edge;
 * the text of the select ends a gap before it. Arithmetic over the bound tokens only — the
 * inline padding, the size of the indicator, the gap of the box and the border width — so every
 * design value is still a token (Art. X gate 1). Celo knowledge (Art. VIII): the Skemo says that a
 * chevron is part of the field, the Web Celo where it stands.
 */
function selectRules(skemo: Skemo): [string, string[]][] {
  const keys = [
    ...new Set([
      ...keysOf(skemo, skemo.parts.box?.["inline-padding"]),
      ...keysOf(skemo, skemo.parts.indicator?.size),
    ]),
  ].filter((key) => key !== STATE_KEY);
  const rules: [string, string[]][] = [];
  for (const combination of combinationsOf(skemo, keys)) {
    const token = (part: string, property: string) =>
      boundToken(skemo, part, property, combination)?.token;
    const padding = token("box", "inline-padding");
    const size = token("indicator", "size");
    const gap = token("box", "gap");
    const border = token("border", "width");
    if (
      [padding, size, gap, border].some((value) => value === undefined || isBindingKeyword(value))
    )
      continue;
    const v = (name: string | undefined) => variable(name ?? "");
    const data = keys.map((key) => `[data-${key}="${combination[key] ?? ""}"]`).join("");
    rules.push([
      fieldPartSelector("box", "inline-padding", data, "", true),
      [`padding-inline-end: calc(${v(padding)} + ${v(size)} + ${v(gap)});`],
    ]);
    rules.push([
      fieldPartSelector("indicator", "size", data, "", true),
      [
        `margin-inline-start: calc(-1 * (${v(size)} + ${v(padding)} + ${v(border)}));`,
        `margin-inline-end: calc(${v(padding)} + ${v(border)});`,
      ],
    ]);
  }
  return rules;
}

/**
 * Layout of a toggle (Spec 010 ①, D-05, D-09; ②, D-08), keywords only: the field is a row of
 * control and label; the control is a native button with a border and no padding, its size the
 * indicator's plus the border (no size of its own); the indicator does not shrink and its sign
 * fills it; the label switches the control like a label does. It never wraps where the Uzo says
 * never (the switch); where it may wrap (the checkbox), it breaks beside the box, which stays at
 * the first line, and the error stands under it in a column. The mark of a required box shows
 * only while the box is marked (data-marked), as in the field.
 */
const toggleStructure = (
  disables: boolean,
  wraps: boolean,
  texts: boolean,
  marked: boolean,
): string =>
  [
    ":host { display: inline-block; vertical-align: middle; }",
    `:where([part="field"]) { display: inline-flex; align-items: ${texts ? "flex-start" : "center"}; }`,
    ...(texts ? [':where([part="field"]) > div { display: flex; flex-direction: column; }'] : []),
    ':where([part="control"]) { display: inline-flex; align-items: center; box-sizing: border-box; margin: 0; padding: 0; border-style: solid; cursor: pointer; appearance: none; transition-property: background-color, border-color; }',
    ':where([part="indicator"]) { display: block; flex: none; transition-property: background-color; }',
    ':where([part="indicator"]) > svg { display: block; }',
    // A label that may wrap breaks inside a word longer than the line too (Spec 011 ① O-8): a long
    // compound or a pseudo-localised chain would otherwise push the Ero out of its container.
    `:where([part="label"]) { cursor: pointer; white-space: ${wraps ? "normal; overflow-wrap: anywhere" : "nowrap"}; }`,
    ':where([part="control"]:focus:not(:focus-visible)) { outline-width: 0; }',
    ...(disables
      ? [
          ':where([part="control"]:disabled) { cursor: not-allowed; }',
          ':where([part="field"]:has([part="control"]:disabled)) [part="label"] { cursor: not-allowed; }',
        ]
      : []),
    ...(marked
      ? [
          ':where([part="field"]:not([data-marked="true"])) [part="required-mark"] { display: none; }',
        ]
      : []),
  ].join("\n");

/**
 * Layout of a radio group (Spec 010 ③, D-06), keywords only: the field a column of label, options,
 * help and error; the options a column, a row where the group is horizontal (aria-orientation),
 * never breaking (Uzo wrap never); each option a row of circle and label that never breaks; the
 * circle a box with a border and no padding, its size the dot's plus the border; the focus is shown
 * on the circle, never as the row's own outline. The mark of a required group shows only while the
 * group is marked (data-marked), as in the field.
 */
const groupStructure = (disables: boolean, marked: boolean): string =>
  [
    ":host { display: inline-block; vertical-align: top; }",
    ':where([part="field"]) { display: flex; flex-direction: column; align-items: flex-start; }',
    ':where([part="label"]) { display: inline-flex; align-items: baseline; }',
    ':where([part="options"]) { display: flex; flex-direction: column; align-items: flex-start; }',
    ':where([part="field"][aria-orientation="horizontal"]) [part="options"] { flex-direction: row; flex-wrap: nowrap; }',
    ':where([part="option"]) { display: inline-flex; align-items: center; cursor: pointer; white-space: nowrap; }',
    ':where([part="option"]:focus) { outline-width: 0; }',
    ':where([part="control"]) { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; margin: 0; padding: 0; border-style: solid; flex: none; transition-property: background-color, border-color; }',
    ':where([part="indicator"]) { display: block; flex: none; transition-property: opacity; }',
    ':where([part="indicator"]) > svg { display: block; }',
    ...(disables
      ? [':where([part="field"][aria-disabled="true"]) [part="option"] { cursor: not-allowed; }']
      : []),
    ...(marked
      ? [
          ':where([part="field"]:not([data-marked="true"])) [part="required-mark"] { display: none; }',
        ]
      : []),
  ].join("\n");

/**
 * The stylesheet of one Ero: structure, then one rule per part property and combination (a state
 * without a binding of its own repeats rest, so every state of the Skemo has a rule the parity
 * inventory reads). The Uzo decides the host (D-04).
 */
export function stylesheetOf(skemo: Skemo, uzo?: Uzo): string {
  // Fixed rules stand before the keyed ones (Spec 008): a state rule that shares a selector with
  // a fixed rule (focus-visible: the ring and the focus colour) must still come after rest.
  const fixedRules = new Map<string, string[]>();
  const keyedRules = new Map<string, string[]>();
  let rules = fixedRules;
  const add = (selector: string, lines: readonly string[]) => {
    if (lines.length === 0) return;
    rules.set(selector, [...(rules.get(selector) ?? []), ...lines]);
  };
  // Fixed properties first: they do not depend on props or state.
  for (const [part, properties] of Object.entries(skemo.parts)) {
    for (const [property, source] of Object.entries(properties)) {
      const token = fixedToken(source);
      if (token !== undefined) {
        add(selectorOf(skemo, part, property, {}, []), declarations(skemo, part, property, token));
      }
    }
  }
  // Keyed properties, state by state, so later states win by source order.
  rules = keyedRules;
  const keyed: { part: string; property: string; keys: string[] }[] = [];
  for (const [part, properties] of Object.entries(skemo.parts)) {
    for (const [property, source] of Object.entries(properties)) {
      const keys = keysOf(skemo, source);
      if (keys.length > 0) keyed.push({ part, property, keys });
    }
  }
  for (const state of STATE_ORDER) {
    for (const { part, property, keys } of keyed) {
      if (!keys.includes(STATE_KEY) && state !== "rest") continue;
      for (const combination of combinationsOf(skemo, keys)) {
        if (keys.includes(STATE_KEY) && combination[STATE_KEY] !== state) continue;
        const bound = boundToken(skemo, part, property, combination);
        if (bound === undefined) continue;
        add(
          selectorOf(skemo, part, property, combination, keys),
          declarations(skemo, part, property, bound.token),
        );
      }
    }
  }
  // The place of the chevron of a select comes last (D-06): it refines the inline padding.
  const placed = isSelect(skemo) ? selectRules(skemo) : [];
  const tokenRules = [...fixedRules.entries(), ...keyedRules.entries(), ...placed].map(
    ([selector, lines]) => `${selector} {\n${lines.map((line) => `  ${line}`).join("\n")}\n}`,
  );
  const undrawn = isStatus(skemo) ? statusUndrawn(skemo) : [];
  const disables = skemo.states.includes("disabled") || skemo.states.includes("loading");
  const bordered = skemo.parts.border !== undefined;
  const base = isDialog(skemo)
    ? dialogStructure
    : isText(skemo)
      ? textStructure(bordered)
      : isStatus(skemo)
        ? statusStructure(skemo)
        : isField(skemo)
          ? fieldStructure(disables, isSelect(skemo), isTextarea(skemo))
          : isGroup(skemo)
            ? groupStructure(disables, skemo.parts["required-mark"] !== undefined)
            : isToggle(skemo)
              ? toggleStructure(
                  disables,
                  uzo?.layout.wrap !== undefined && uzo.layout.wrap !== "never",
                  skemo.slots.some((slot) => slot.default !== true && slot.text === true),
                  skemo.parts["required-mark"] !== undefined,
                )
              : structure(uzo?.layout.wrap === "with-text", disables, bordered);
  return `${base}\n${[...tokenRules, ...undrawn].join("\n")}\n`;
}

function keysOf(skemo: Skemo, source: SkemoPartSource | undefined, depth = 0): string[] {
  if (source === undefined || depth > 8) return [];
  if ("by" in source) return source.by;
  if ("sameAs" in source) {
    const [part = "", property = ""] = source.sameAs.split(".");
    return keysOf(skemo, skemo.parts[part]?.[property as SkemoPartProperty], depth + 1);
  }
  return [];
}

/** `:where([part="control"][data-emphasis="high"]:hover)`, or the slotted form for icons. */
function selectorOf(
  skemo: Skemo,
  part: string,
  property: string,
  combination: Readonly<Record<string, string>>,
  keys: readonly string[],
): string {
  // The state of one entry (Spec 010 ③, E7: selected) is no data attribute of the Ero: the row of
  // the option speaks it, as the Skemo names it in a11y.states (aria-checked).
  const data = keys
    .filter((key) => key !== STATE_KEY && !isEntryKey(skemo, key))
    .map((key) => `[data-${key}="${combination[key] ?? ""}"]`)
    .join("");
  const entry = keys
    .filter((key) => isEntryKey(skemo, key))
    .map((key) => `[${skemo.a11y.states[key]?.[0] ?? `data-${key}`}="${combination[key] ?? ""}"]`)
    .join("");
  if (isGroup(skemo)) {
    return groupPartSelector(part, property, data, entry, combination[STATE_KEY] ?? "rest");
  }
  if (isDialog(skemo)) return dialogPartSelector(part, data);
  if (isStatus(skemo)) return statusPartSelector(part, data);
  // Static text (Spec 011 ③, D-08): every part — surface, border, text, box — is the control.
  if (isText(skemo)) return `:where([part="control"]${data})`;
  const state = STATE_SELECTORS[combination[STATE_KEY] ?? "rest"] ?? "";
  if (isField(skemo)) return fieldPartSelector(part, property, data, state, isSelect(skemo));
  if (isToggle(skemo)) return togglePartSelector(part, property, data, state);
  return partSelector(part, `[part="control"]${data}${state}`);
}

/** `fm-butono`, `FmButono`, `BUTONO`. */
export function namesOf(ero: LoadedEro["ero"]): {
  tag: string;
  className: string;
  constant: string;
} {
  const camel = ero.name.replace(/(^|-)([a-z0-9])/g, (_match, _dash, letter: string) =>
    letter.toUpperCase(),
  );
  return {
    tag: `fm-${ero.name}`,
    className: `Fm${camel}`,
    constant: ero.name.replaceAll("-", "_").toUpperCase(),
  };
}

/** Everything the element template needs of one Ero: names, the native control, the slots. */
export function elementNamesOf(entry: LoadedEro, inline = false) {
  return {
    ...namesOf(entry.ero),
    ero: entry.ero.name,
    host: hostOf(entry.skemo.a11y.role, isMultiline(entry.skemo)),
    role: entry.skemo.a11y.role,
    marked: entry.skemo.parts["required-mark"] !== undefined,
    // Spec 011 ③: a live region turns its indicator and shows a dismiss butono where the Skemo
    // has the parts.
    indicator: entry.skemo.parts.indicator !== undefined,
    dismiss: entry.skemo.parts.dismiss !== undefined,
    slots: entry.skemo.slots.map((slot) => ({
      name: slot.name,
      ...(slot.default === undefined ? {} : { default: slot.default }),
      ...(slot.decorative === undefined ? {} : { decorative: slot.decorative }),
      ...(slot.entry === undefined ? {} : { list: true }),
      ...(slot.text === undefined ? {} : { text: slot.text }),
      ...(slot.hidden === undefined ? {} : { hidden: slot.hidden }),
    })),
    inline,
  };
}

export const GENERATED_DIR = "eroj/src/generated";

/** Where the stylesheet of one Ero is written inside the projections. */
export const stylesheetPath = (ero: string): string => `${GENERATED_DIR}/${ero}.styles.ts`;

export const WEB_COMPONENT_CELO: Celo = {
  name: "web-component",
  generate({ modelo }: CeloInput): GeneratedFile[] {
    const header = "// Generated by fm projekcioj build from the Skemo; do not edit (Art. I).\n";
    const eroj = modelo.eroj.map((entry) => ({ entry, ...namesOf(entry.ero) }));
    const files: GeneratedFile[] = [
      {
        path: `${GENERATED_DIR}/skemo.ts`,
        text:
          header +
          eroj
            .map(
              ({ entry, constant }) =>
                `export const ${constant}_SKEMO = ${JSON.stringify(entry.skemo)} as const;\n`,
            )
            .join(""),
      },
    ];
    for (const { entry, tag, constant } of eroj) {
      files.push({
        path: `${GENERATED_DIR}/${entry.ero.name}.styles.ts`,
        text: `${header}export const ${constant}_CSS = ${JSON.stringify(stylesheetOf(entry.skemo, entry.uzo))};\n`,
      });
      files.push({
        path: `${GENERATED_DIR}/${tag}.ts`,
        text: header + elementSource(elementNamesOf(entry)),
      });
    }
    // Every element module registers itself on import and exports its registration (F6);
    // defineEroj calls them all, for a user who wants one explicit line.
    const imports = eroj.map(
      ({ tag, className }) => `import { ${className}, define${className} } from "./${tag}.js";`,
    );
    const defines = eroj.map(({ className }) => `  define${className}();`);
    files.push({
      path: `${GENERATED_DIR}/index.ts`,
      text: `${header}${imports.join("\n")}\n\nexport * from "./skemo.js";\nexport { ${eroj.map(({ className }) => className).join(", ")} };\n\n/** Registers every Ero once; importing twice is safe. */\nexport function defineEroj(): void {\n${defines.join("\n")}\n}\n`,
    });
    return files;
  },
};

/** The CSS of a generated stylesheet module (`export const BUTONO_CSS = "…";`). */
function cssOf(moduleText: string): string {
  const match = /=\s*(".*")\s*;/s.exec(moduleText);
  return match?.[1] === undefined ? moduleText : (JSON.parse(match[1]) as string);
}

/** The state a selector addresses; the inverse of `STATE_SELECTORS` plus the focus ring (T021). */
function stateOf(selector: string): string {
  if (selector.includes('[aria-busy="true"]')) return "loading";
  if (selector.includes(":disabled") || selector.includes('[aria-disabled="true"]')) {
    return "disabled";
  }
  if (selector.includes(":focus-visible")) return "focus";
  if (selector.includes(":hover")) return "hover";
  if (selector.includes(":active")) return "pressed";
  if (selector.includes(":visited")) return "visited";
  if (selector.includes('[aria-invalid="true"]')) return "invalid";
  if (selector.includes("[readonly]")) return "readonly";
  return "rest";
}

/**
 * What the generated stylesheet emitted (Spec 003 T021, FR-12): the props it keys on with the
 * values it styles, and the states it addresses. Read from the stylesheet itself, so a value the
 * generator drops or misspells does not reach `parity/web-component.json`.
 */
export function stylesheetInventory(moduleText: string): ParityItem {
  const css = cssOf(moduleText);
  const props = new Map<string, string[]>();
  const states = new Set<string>();
  for (const [, rawSelector = ""] of css.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
    // `:focus:not(:focus-visible)` resets the ring; the state is what stays outside the :not().
    const selector = rawSelector.replaceAll(/:not\([^()]*\)/g, "");
    // The combination stands on the control, or on the field of a composite (Spec 009) or a
    // toggle (Spec 010 ②: the size of a checkbox keys only its label and its check mark, never
    // the box itself — the box is the mark plus its border).
    if (!selector.includes('[part="control"]') && !selector.includes('[part="field"]')) continue;
    states.add(stateOf(selector));
    for (const [, name = "", value = ""] of selector.matchAll(/\[data-([a-z0-9-]+)="([^"]*)"\]/g)) {
      const values = props.get(name) ?? [];
      if (!values.includes(value)) values.push(value);
      props.set(name, values);
    }
  }
  // A boolean prop that keys the parts (Spec 010 ①, D-03: checked) is written as
  // data-<prop>="true|false"; the inventory names its kind, as React and Figma do.
  for (const [name, values] of props) {
    if (values.every((value) => value === "true" || value === "false"))
      props.set(name, ["boolean"]);
  }
  return { props: Object.fromEntries(props), states: [...states], values: {} };
}
