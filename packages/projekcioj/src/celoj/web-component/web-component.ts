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

/**
 * The mark an icon slot falls back to (Spec 008, D-05): styled like a slotted icon. Since
 * Nachlese 4 N-7 the Ikonaro's external (an fm-ikono), no hand-drawn svg.
 */
const MARK = 'slot[name^="icon-"] > fm-ikono';

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
  entry = "",
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
  // The listbox of a field with suggestions (Spec 014 ⑤) and its rows: the suggestion by its
  // entry (aria-selected), the no-results text.
  if (part === "listbox" || part === "no-results") return `:where(${root}) [part="${part}"]`;
  if (part === "suggestion") return `:where(${root}) [part="suggestion"]${entry}`;
  return `:where(${root}) [part="control"]`;
}

/**
 * The selector of a part of a disclosure (Spec 014 ⑤, D-03): the combination (open) stands on
 * the details, the state on the summary; the chevron and the content are their own elements.
 */
function disclosurePartSelector(part: string, data: string, state: string): string {
  const root = `[part="control"]${data}`;
  if (part === "summary") return `:where(${root}) [part="summary"]${STATE_SELECTORS[state] ?? ""}`;
  if (part === "focus-ring") return `:where(${root}) [part="summary"]:focus-visible`;
  if (part === "indicator" || part === "content") return `:where(${root}) [part="${part}"]`;
  return `:where(${root})`;
}

/**
 * Whether the Ero is a field (a composite of label, input, help and error): a text field, or a
 * select (Spec 010 ④, D-06) — the same field around the platform's select.
 */
const isField = (skemo: Skemo): boolean =>
  hostOf(skemo.a11y.role) === "input" || isSelect(skemo) || isTextarea(skemo) || isSuggest(skemo);

/** Whether the Ero is a text area (Spec 011 ②, D-11): a textbox over several lines, with rows. */
export const isMultiline = (skemo: Skemo): boolean =>
  skemo.props.some((prop) => prop.name === "rows");
const isTextarea = (skemo: Skemo): boolean => skemo.a11y.role === "textbox" && isMultiline(skemo);

/**
 * A popover (Spec 014 ④, D-05): a non-modal dialog with a trigger slot — a layer of the platform
 * beside its trigger, told apart from the modal dialog by that slot.
 */
export const isPopover = (skemo: Skemo): boolean =>
  skemo.a11y.role === "dialog" && skemo.slots.some((slot) => slot.name === "trigger");

/** Whether the Ero is a dialog (Spec 011 ②, D-12): the platform's dialog, opened modal. */
const isDialog = (skemo: Skemo): boolean =>
  hostOf(skemo.a11y.role) === "dialog" && !isPopover(skemo);

/** A tooltip (Spec 014 ④, D-05): a layer of the platform with the role tooltip, anchored. */
const isTooltip = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "tooltip";

/** A menu (Spec 014 ④, D-05): a layer of the platform with the role menu and rows of entries. */
const isMenu = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "menu";

/** Static text (Spec 011 ③, D-08): the badge, a span without a role. */
const isText = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "text";

/** A live region (Spec 011 ③, D-09, D-10): the notice, the loading and empty state. */
const isStatus = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "status";

/** A meter (Spec 011 ④, D-08): the bar of a value in a range. */
const isMeter = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "meter";

/**
 * A light-DOM host (Spec 011 ④, D-09, D-10, E10): the platform's own table or list stays in the
 * light DOM; the Ero styles it through a stylesheet the document adopts, scoped to the host.
 */
export const isLight = (skemo: Skemo): boolean =>
  hostOf(skemo.a11y.role) === "light" && !isPagination(skemo);

/** The parts of a light-DOM host the shadow tree holds: the scroll region and its edge. */
const LIGHT_SHADOW_PARTS: ReadonlySet<string> = new Set(["region", "border", "focus-ring"]);

/** A pagination (Spec 015 ①, plan ① D-03): a navigation that draws its pages itself (an ellipsis part). */
export const isPagination = (skemo: Skemo): boolean =>
  skemo.a11y.role === "navigation" && skemo.parts.ellipsis !== undefined;

/**
 * A file input (Spec 015 ②, plan ② D-05): the platform's file input, heard as a button, with a
 * dropzone part — the field of the kampo around it, the chosen files listed below.
 */
export const isUpload = (skemo: Skemo): boolean =>
  skemo.a11y.role === "button" && skemo.parts.dropzone !== undefined;

/**
 * The selector of a part of a file input (Spec 015 ②, D-05): the combination stands on the field,
 * hover, focus, invalid and disabled on the platform's input inside (`:has()`, as a field's), the
 * state dragover on the field itself (the element marks it while files are dragged over the
 * dropzone); the dropzone carries its fill, room and border; the ring stands around the picker
 * whose input has the focus; the list's gap is the list's and every row's.
 */
function uploadPartSelector(part: string, property: string, data: string, state: string): string {
  const own = state === "dragover" ? "[dragover]" : "";
  const control = state === "dragover" ? "" : (STATE_SELECTORS[state] ?? "");
  const root = `[part="field"]${data}${own}${control === "" ? "" : `:has([part="control"]${control})`}`;
  if (part === "box" && property === "gap") return `:where(${root})`;
  if (part === "dropzone" || part === "border" || part === "motion") {
    return `:where(${root}) [part="dropzone"]`;
  }
  if (part === "focus-ring")
    return `:where(${root}) [part="picker"]:has([part="control"]:focus-visible)`;
  if (part === "choose") return `:where(${root}) [part="picker"]`;
  if (part === "file-list") {
    return `:where(${root}) [part="file-list"], :where(${root}) [part="file"]`;
  }
  return `:where(${root}) [part="${part}"]`;
}

/**
 * Layout of a file input (Spec 015 ②, D-05), keywords only: the host is a block, the field a
 * column of label, dropzone, help, error and the list; the dropzone a row of the picker and its
 * hint that wraps; the platform's input lies over the composed button (same box, transparent: the
 * one target for pointer and keyboard, its look the butono's); the list a column of rows, each the
 * name, the size and the remove butono; the mark of a required field shows only while marked.
 */
const uploadStructure = (disables: boolean): string =>
  [
    ":host { display: block; }",
    ':where([part="field"]) { display: flex; flex-direction: column; align-items: flex-start; }',
    ':where([part="label"]) { display: inline-flex; align-items: baseline; }',
    ':where([part="dropzone"]) { display: flex; flex-wrap: wrap; align-items: center; align-self: stretch; box-sizing: border-box; transition-property: background-color, border-color; }',
    ':where([part="picker"]) { position: relative; display: inline-flex; }',
    ':where([part="control"]) { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: pointer; }',
    ...(disables ? [':where([part="control"]:disabled) { cursor: not-allowed; }'] : []),
    ':where([part="file-list"]) { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; }',
    ':where([part="file-list"][hidden], [part="drop-hint"][hidden]) { display: none; }',
    ':where([part="file"]) { display: flex; align-items: center; }',
    ':where([part="file-name"]) { overflow-wrap: anywhere; }',
    ':where([part="field"]:not([data-marked="true"])) [part="required-mark"] { display: none; }',
    HIDDEN_TEXT,
  ].join("\n");

/**
 * A card (Spec 015 ③, plan ③ D-04): the platform's article — the surface with its border is the
 * control, the media lies edge to edge above (horizontal: beside) the body, whose padding and gap
 * are the box's; heading (the composed titolo), content, meta and actions are its own elements.
 */
export const isCard = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "card";

function cardPartSelector(part: string, data: string): string {
  const root = `[part="control"]${data}`;
  if (part === "box") return `:where(${root}) [part="body"]`;
  if (["heading", "content", "meta", "actions"].includes(part)) {
    return `:where(${root}) [part="${part}"]`;
  }
  return `:where(${root})`;
}

/**
 * Layout of a card (Spec 015 ③, D-04), keywords only: the host is a block that takes the width of
 * its container (Uzo size container); the surface a column that clips its media to its radius,
 * a row where the card is horizontal and not stacked (the element marks a horizontal card in a
 * container narrower than the Uzo's columns-from with fm-stacked) — the media a third, the body
 * two; a slotted image is a block that fills the media; meta and actions are rows that wrap; media,
 * meta and actions without content take no room. The orientation is read from the host's own
 * attribute: it keys no part, so no data attribute carries it (the parity inventory reads them as
 * props of the Skemo).
 */
const cardStructure: string = [
  ":host { display: block; }",
  ':where([part="control"]) { display: flex; flex-direction: column; box-sizing: border-box; margin: 0; overflow: hidden; border-style: solid; }',
  ':host([orientation="horizontal"]) :where([part="control"]:not(.fm-stacked)) { flex-direction: row; }',
  ':host([orientation="horizontal"]) :where([part="control"]:not(.fm-stacked)) [part="media"] { flex: 1 1 0; }',
  ':host([orientation="horizontal"]) :where([part="control"]:not(.fm-stacked)) [part="body"] { flex: 2 1 0; }',
  ':where([part="media"]) { display: flex; flex-direction: column; }',
  ':where([part="media"]) > slot::slotted(*) { display: block; }',
  ':where([part="body"]) { display: flex; flex-direction: column; box-sizing: border-box; }',
  ':where([part="heading"], [part="content"]) { overflow-wrap: anywhere; }',
  ':where([part="meta"], [part="actions"]) { display: flex; flex-wrap: wrap; align-items: center; }',
  ':where([part="media"][hidden], [part="meta"][hidden], [part="actions"][hidden]) { display: none; }',
].join("\n");

/** A breadcrumb (Spec 015 ①, plan ① D-04): a navigation with a separator part between its items. */
export const isBreadcrumb = (skemo: Skemo): boolean =>
  skemo.a11y.role === "navigation" && skemo.parts.separator !== undefined;

/** A navigation (Spec 011 ⑤, D-07): the platform's own links in the light DOM, the nav in the shadow. */
const isNav = (skemo: Skemo): boolean => skemo.a11y.role === "navigation" && !isPagination(skemo);

/**
 * Whether a part property of a light-DOM host stands in the shadow sheet: the region of a table
 * and its edge; the gap of a navigation (between the items, on the nav itself). Everything else
 * stands in the document's stylesheet (`lightStylesheetOf`).
 */
function lightShadowProperty(skemo: Skemo, part: string, property: string): boolean {
  // A breadcrumb (Spec 015 ①): the list's gap and the chevrons are the shadow's, the links the
  // page's — the height of the box is the links' minimum height, the size of a target (2.5.8).
  if (isBreadcrumb(skemo)) {
    return (part === "box" && property !== "height") || part === "separator";
  }
  if (isNav(skemo)) return part === "box" && property === "gap";
  return LIGHT_SHADOW_PARTS.has(part);
}

/** Tabs (Spec 011 ⑤, D-08): rows with role tab in a tablist, the panel beside. */
const isTabs = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "tabs";

/** An icon (Spec 014 ②, D-05): the control sized by the box, the glyph a mask inside it. */
const isIcon = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "icon" && !isAvatar(skemo);

/**
 * An avatar (Spec 015 ③, plan ③ D-08): an image with an initials part — the control sized by the
 * box, the picture and the initials inside it, both round.
 */
export const isAvatar = (skemo: Skemo): boolean =>
  skemo.a11y.role === "img" && skemo.parts.initials !== undefined;

function avatarPartSelector(part: string, data: string): string {
  const root = `[part="control"]${data}`;
  if (part === "image" || part === "initials") return `:where(${root}) [part="${part}"]`;
  return `:where(${root})`;
}

/**
 * Layout of an avatar (Spec 015 ③, D-08), keywords and 0 only: an inline block in the line; the
 * control a box that clips; the picture and the initials fill it (a stretched flex item, the
 * picture cropped to cover the circle), the initials centred on one line; whichever is not shown
 * takes no room.
 */
const avatarStructure: string = [
  ":host { display: inline-block; vertical-align: middle; }",
  ':where([part="control"]) { display: inline-flex; box-sizing: border-box; overflow: hidden; }',
  ':where([part="image"], [part="initials"]) { flex: 1 1 0; align-self: stretch; box-sizing: border-box; min-inline-size: 0; margin: 0; }',
  ':where([part="image"]) { display: block; object-fit: cover; }',
  ':where([part="initials"]) { display: flex; align-items: center; justify-content: center; white-space: nowrap; overflow: hidden; }',
  ':where([part="image"][hidden], [part="initials"][hidden]) { display: none; }',
].join("\n");

/** A separator (Spec 014 ②, D-06): the control is the line. */
const isSeparator = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "separator";

/** A heading (Spec 014 ③, D-04): the text is the control, its level spoken. */
const isHeading = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "heading";

/** A paragraph (Spec 014 ③, D-04): running text in a type role, inline where it is code. */
const isParagraph = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "paragraph";

/**
 * A link that floats above the page (Spec 014 ②, D-07): the skip link — a link whose surface has
 * a layer. Celo knowledge: the layer says it lies over the page, so it is fixed at the start of
 * the viewport and hidden until it has the focus.
 */
export const isSkip = (skemo: Skemo): boolean =>
  skemo.a11y.role === "link" && skemo.parts.surface?.layer !== undefined;

/**
 * The states of a tab (Spec 011 ⑤, D-08): hover and focus are the row's, disabled the row's too
 * (a tab the markup disables, spoken as aria-disabled); the list itself has no state.
 */
const TAB_STATES: Readonly<Record<string, string | undefined>> = {
  hover: ":hover",
  focus: ":focus-visible",
  disabled: '[aria-disabled="true"]',
};

/**
 * The selector of a part of the tabs (Spec 011 ⑤, D-08): the tablist is the control and carries
 * the part list (its line and the gap); tab (the row), tabs (its text) and the selected indicator
 * (its block-end edge) are the row, with the state of one tab (active, E7: aria-selected) and its
 * hover, focus and disabled; the panel is its own element.
 */
/**
 * The selector of a part of a pagination (Spec 015 ①, D-03): the combination stands on the nav;
 * the item by its entry (aria-current) and state, its border on the item too; the ellipsis and
 * the arrows (the icons) their own elements; the box the nav and the list.
 */
function paginationPartSelector(part: string, data: string, entry: string, state: string): string {
  const root = `[part="list"]${data}`;
  const item = `[part="item"]${entry}${PAGINATION_STATES[state] ?? ""}`;
  if (part === "item" || part === "border") return `:where(${root} ${item})`;
  if (part === "focus-ring") return `:where(${root} [part="item"]:focus-visible)`;
  if (part === "box") return `:where(${root}, ${root} [part="pages"])`;
  return `:where(${root}) [part="${part}"]`;
}

/** The states of a pagination's item: disabled is aria-disabled (a link has no :disabled). */
const PAGINATION_STATES: Readonly<Record<string, string | undefined>> = {
  rest: "",
  hover: ":hover",
  focus: ":focus-visible",
  disabled: '[aria-disabled="true"]',
};

function tabsPartSelector(part: string, data: string, entry: string, state: string): string {
  const root = `[part="control"]${data}`;
  const row = `[part="tab"]${entry}${TAB_STATES[state] ?? ""}`;
  if (part === "list") return `:where(${root})`;
  if (part === "panel") return `:where([part="panel"])`;
  if (part === "focus-ring") return `:where(${root} [part="tab"]:focus-visible)`;
  return `:where(${root} ${row})`;
}

/**
 * The selector of a part of a meter (Spec 011 ④, D-08): the combination stands on the control;
 * the box is the control, the unknown part is the track while the value is unknown, every other
 * part its own element.
 */
function meterPartSelector(part: string, data: string): string {
  const control = `[part="control"]${data}`;
  if (part === "box") return `:where(${control})`;
  if (part === "unknown") return `:where(${control}[data-unknown]) [part="track"]`;
  return `:where(${control}) [part="${part}"]`;
}

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

/** A field with suggestions (Spec 014 ⑤, D-03): a combobox with a listbox part of its own. */
export const isSuggest = (skemo: Skemo): boolean =>
  skemo.a11y.role === "combobox" && skemo.parts.listbox !== undefined;

/** A disclosure (Spec 014 ⑤, D-03): the platform's details and summary. */
const isDisclosure = (skemo: Skemo): boolean => hostOf(skemo.a11y.role) === "disclosure";

/** Whether the Ero is a select (Spec 010 ④, D-06): the field of the kampo around a select. */
const isSelect = (skemo: Skemo): boolean =>
  hostOf(skemo.a11y.role) === "select" && !isSuggest(skemo);

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
  // Spec 015 ② (plan ② D-05): files dragged over the dropzone, before disabled.
  "dragover",
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
    // A colour that inherits (Spec 014 ②, D-05: the glyph of a neutral icon) says so, so the
    // combination has its rule and the inventory reads the value of the axis.
    if (property === "color") return ["color: inherit;"];
    return property === "typography" ? ["display: inline;", "white-space: normal;"] : [];
  }
  // The underline is switched off; a minimum that is none is simply not written.
  if (part === "underline" && property === "width") return ["text-decoration-line: none;"];
  // A border whose width is none draws no border (Spec 015 ①, B-6: a page of a pagination that
  // is not current) — not writing the width would leave the platform's own border of a button.
  if (part === "border" && property === "width" && token === "none") return ["border-style: none;"];
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
  // The room around the button of a file input's dropzone is its padding on every side (Spec 015
  // ②, D-05); none (no dropzone) writes nothing.
  if (isUpload(skemo) && part === "dropzone" && property === "inline-padding") {
    return isBindingKeyword(token) ? [] : [`padding: ${variable(token)};`];
  }
  // The inline padding of a card's body is its padding on every side (Spec 015 ③, D-04).
  if (isCard(skemo) && part === "box" && property === "inline-padding") {
    return [`padding: ${variable(token)};`];
  }
  // The inline padding of a live region is its padding on every side, as the dialog's (D-09).
  if (isStatus(skemo) && part === "box" && property === "inline-padding") {
    return [`padding: ${variable(token)};`];
  }
  // The fill of a meter (Spec 011 ④, D-08) is the colour of its bar; the unknown part is the
  // dashed edge of the track: its colour and width are the border's.
  if (isMeter(skemo) && part === "fill" && property === "color") {
    return [`background-color: ${variable(token)};`];
  }
  if (isMeter(skemo) && part === "unknown") {
    if (property === "color") return [`border-color: ${variable(token)};`];
    if (property === "width") return [`border-width: ${variable(token)};`];
  }
  // The line of a tablist and the indicator of the selected tab (Spec 011 ⑤, D-08) are block-end
  // edges: their colour and width are the border's; an indicator of width none is not drawn.
  if (isTabs(skemo) && (part === "list" || part === "selected-indicator")) {
    if (property === "color") return [`border-block-end-color: ${variable(token)};`];
    if (property === "width") {
      return token === "none"
        ? ["border-block-end-style: none;"]
        : ["border-block-end-style: solid;", `border-block-end-width: ${variable(token)};`];
    }
  }
  if (isBindingKeyword(token)) return keywordDeclarations(part, property, token);
  // The line of a separator (Spec 014 ②, D-06): the border of one edge of the control; which edge
  // is structure (the orientation), its colour and width are the line's.
  if (part === "line") {
    if (property === "color") return [`border-color: ${variable(token)};`];
    if (property === "width") return [`border-width: ${variable(token)};`];
  }
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
  // An overlay (Spec 014 ④, D-05): the box's inline padding is the layer's padding on every side,
  // as the dialog's; the surface's width is the most a popover or a menu takes (the layer hugs
  // its content below it).
  if (
    (isTooltip(skemo) || isPopover(skemo) || isMenu(skemo)) &&
    part === "box" &&
    property === "inline-padding"
  ) {
    return [`padding: ${variable(token)};`];
  }
  if ((isPopover(skemo) || isMenu(skemo)) && part === "surface" && property === "width") {
    return [`max-inline-size: ${variable(token)};`];
  }
  // The listbox of a field with suggestions (Spec 014 ⑤): its width is the most it takes, its
  // height the most it takes before it scrolls; a height of none is a listbox that is not shown.
  if (isSuggest(skemo) && part === "listbox" && property === "width") {
    return [`max-inline-size: ${variable(token)};`];
  }
  if (isSuggest(skemo) && part === "listbox" && property === "height") {
    return token === "none" ? ["display: none;"] : [`max-block-size: ${variable(token)};`];
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
    // The weight of a text where it departs from its role (Spec 014 ①, D-01): the current item of
    // a navigation, the active tab; none (the role's weight stands) writes nothing.
    case "weight":
      return [`font-weight: ${variable(token)};`];
    // The layer of a part above the page (Spec 014 ②, D-04): the skip link, the overlays of ④.
    case "layer":
      return [`z-index: ${variable(token)};`];
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
  // Nachlese 7 ① A-1: the render hides the message while its slot is empty (a slot element is
  // always :empty in the shadow tree; the rule before hid every message).
  ':where([part="message"][hidden]) { display: none; }',
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
 * Layout of a meter (Spec 011 ④, D-08), keywords only: the host is a block that takes the width of
 * its container; the control a column of label, track and value text; the track a row that clips
 * its fill, with no border unless the stroke binding draws the dashed edge; the fill a child
 * whose inline size the element sets.
 */
const meterStructure: string = [
  ":host { display: block; }",
  ':where([part="control"]) { display: flex; flex-direction: column; box-sizing: border-box; margin: 0; }',
  ':where([part="track"]) { display: flex; overflow: hidden; box-sizing: border-box; border-style: none; }',
  ':where([part="fill"]) { display: block; flex: none; align-self: stretch; }',
].join("\n");

/**
 * Layout of a light-DOM host in its shadow (Spec 011 ④, D-09, D-10, E10), keywords only: the host
 * is a block; a table lies in a focusable region that scrolls along the inline axis; a list in a
 * plain frame. Everything else stands in the document's stylesheet (`lightStylesheetOf`).
 */
const lightStructure = (skemo: Skemo): string =>
  isBreadcrumb(skemo)
    ? [
        // A breadcrumb (Spec 015 ①, plan ① D-04): the list is a row of its items that wraps; every
        // item holds the slotted link and the chevron after it.
        ":host { display: block; }",
        ':where([part="list"]) { display: block; }',
        ':where([part="items"]) { display: flex; flex-wrap: wrap; align-items: center; list-style: none; margin: 0; padding: 0; }',
        ':where([part="entry"]) { display: inline-flex; align-items: center; }',
        ':where([part="separator"]) { flex: none; }',
      ].join("\n")
    : isNav(skemo)
      ? [
          // A navigation (Spec 011 ⑤, D-07): the nav is a row of items that wraps (the order stays);
          // vertical stacks them along the inline size of the host.
          ":host { display: block; }",
          ':where([part="list"]) { display: flex; flex-wrap: wrap; align-items: center; }',
          ':where([part="list"][data-orientation="vertical"]) { flex-direction: column; align-items: stretch; }',
        ].join("\n")
      : [
          ":host { display: block; }",
          ':where([part="region"]) { display: block; overflow-x: auto; box-sizing: border-box; border-style: solid; }',
          ':where([part="region"]:focus:not(:focus-visible)) { outline-width: 0; }',
          ':where([part="list"]) { display: block; }',
        ].join("\n");

/**
 * Layout of tabs (Spec 011 ⑤, D-08), keywords only: the host is a block that takes the width of
 * its container; the tablist a row that never wraps (the Uzo says never) and scrolls along the
 * inline axis when the tabs are more than the line holds, with its line along the block-end edge;
 * every tab a button without the platform's border, its block-end edge the indicator; the panel a
 * block.
 */
/**
 * Layout of a pagination (Spec 015 ①, plan ① D-03), keywords only: the host is a block; the nav a
 * row that wraps; the pages a list without marks; every item a button or a link centred in its
 * box, its border solid (the current page's is bound), no decoration; an ellipsis centred.
 */
const paginationStructure: string = [
  ":host { display: block; }",
  ':where([part="list"]) { display: flex; flex-wrap: wrap; align-items: center; }',
  ':where([part="pages"]) { display: flex; flex-wrap: wrap; align-items: center; list-style: none; margin: 0; padding: 0; }',
  ':where([part="item"]) { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; margin: 0; border-style: solid; appearance: none; cursor: pointer; text-decoration: none; }',
  ':where([part="item"]:focus:not(:focus-visible)) { outline-width: 0; }',
  ':where([part="item"][aria-disabled="true"]) { cursor: not-allowed; }',
  ':where([part="ellipsis"]) { display: inline-flex; align-items: center; justify-content: center; }',
].join("\n");

const tabsStructure: string = [
  ":host { display: block; }",
  ':where([part="control"]) { display: flex; flex-wrap: nowrap; align-items: stretch; overflow-x: auto; box-sizing: border-box; border-block-end-style: solid; }',
  ':where([part="tab"]) { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; margin: 0; border-style: none; appearance: none; cursor: pointer; white-space: nowrap; transition-property: background-color, color, border-color; }',
  ':where([part="tab"]:focus:not(:focus-visible)) { outline-width: 0; }',
  ':where([part="tab"][aria-disabled="true"]) { cursor: not-allowed; }',
  ':where([part="panel"]) { display: block; }',
  ':where([part="panel"]:focus:not(:focus-visible)) { outline-width: 0; }',
].join("\n");

/**
 * Layout of an icon (Spec 014 ②, D-05), keywords only: the host hugs the control, the control is
 * the box (its size bound), the glyph fills it as a mask of the Aspekto's picture — the custom
 * property the element writes from the name — painted in the current colour, so the icon
 * inherits the colour of the text around it like a word; a glyph whose direction carries meaning
 * mirrors in right-to-left writing.
 */
const iconStructure: string = [
  ":host { display: inline-block; vertical-align: middle; }",
  ':where([part="glyph"]) { display: block; box-sizing: border-box; background-color: currentcolor; mask-image: var(--fm-ikono); mask-size: contain; mask-repeat: no-repeat; mask-position: center; }',
  ':host(:dir(rtl)) :where([part="glyph"].fm-mirror) { transform: scaleX(-1); }',
].join("\n");

/**
 * Layout of a separator (Spec 014 ②, D-06), keywords only: a horizontal line is a block across
 * its container with the border along its block-start edge; a vertical line stands beside its
 * neighbours (an inline flex item that stretches) with the border along its inline-start edge;
 * the other edges draw nothing. Colour and width are the line's (bound).
 */
const separatorStructure: string = [
  ":host { display: block; }",
  ':host([orientation="vertical"]) { display: inline-flex; align-self: stretch; vertical-align: middle; }',
  ':where([part="control"]) { display: block; box-sizing: border-box; border-style: none; }',
  ':where([part="control"][data-orientation="horizontal"]) { border-block-start-style: solid; }',
  ':where([part="control"][data-orientation="vertical"]) { border-inline-start-style: solid; align-self: stretch; }',
].join("\n");

/**
 * Layout of a heading (Spec 014 ③, D-04), keywords and 0 only: the host is a block that takes the
 * width of its container (Uzo size container, wrap allowed); the text carries no margin of its
 * own (spacing-owned-by-container) and breaks a word longer than the line, so nothing is clipped.
 */
const headingStructure: string = [
  ":host { display: block; }",
  ':where([part="text"]) { display: block; box-sizing: border-box; margin: 0; overflow-wrap: anywhere; }',
].join("\n");

/**
 * Layout of a paragraph (Spec 014 ③, D-04), keywords and 0 only: body, caption and kicker are
 * blocks that wrap and carry no margin (spacing-owned-by-container); inline code lies in the
 * sentence around it, so the host and the control are inline for that kind.
 */
const paragraphStructure: string = [
  ":host { display: block; }",
  ':host([kind="code"]) { display: inline; }',
  ':where([part="control"]) { display: block; box-sizing: border-box; margin: 0; overflow-wrap: anywhere; }',
  ':where([part="control"][data-kind="code"]) { display: inline; }',
].join("\n");

/**
 * The place of an overlay's control (Spec 014 ④, D-05, E11), keywords only: a popover of the
 * platform lies in the top layer, fixed, and leaves its insets to the anchor; the side is the
 * placement (position-area in logical directions, the Skemo's default first, the host attribute
 * overrides it — no data attribute, so the inventory reads no axis), flipped where there is no
 * room (position-try-fallbacks). Where the platform has no anchor positioning the element writes
 * the plain place under the trigger as inline insets (the own fallback, E11).
 */
const overlayPlace = (fallback: string, layer = '[part="control"]'): string =>
  [
    `${layer === ":host" ? ":host" : `:where(${layer})`} { position: fixed; inset: auto; margin: 0; box-sizing: border-box; position-area: ${fallback}; position-try-fallbacks: flip-block, flip-inline; }`,
    ...["block-start", "block-end", "inline-start", "inline-end"].map(
      (side) =>
        `:host([placement="${side}"])${layer === ":host" ? "" : ` ${layer}`} { position-area: ${side}; }`,
    ),
  ].join("\n");

/**
 * Layout of a tooltip (Spec 014 ④, D-05), keywords only: the host takes no place of its own (the
 * layer lies in the top layer); the control wraps its words and breaks a long one.
 */
const tooltipStructure = (fallback: string): string =>
  [
    // The host is the layer (D-05, B-7): a popover of the platform in the tree scope of its
    // trigger, so the anchor name reaches it; the control inside is the surface.
    overlayPlace(fallback, ":host"),
    ":host { border-style: none; }",
    ':where([part="control"]) { border-style: none; overflow-wrap: anywhere; transition-property: opacity; }',
  ].join("\n");

/**
 * Layout of a popover (Spec 014 ④, D-05), keywords only: the host stands inline where its trigger
 * stands; the control is a column of heading and content with its border; the content a column.
 */
const popoverStructure = (fallback: string): string =>
  [
    ":host { display: inline-block; }",
    // The slot's box wraps the slotted trigger in the shadow tree: it carries the anchor name.
    ':where(slot[name="trigger"]) { display: inline-block; }',
    overlayPlace(fallback),
    ':where([part="control"]) { display: flex; flex-direction: column; border-style: solid; overflow-wrap: anywhere; }',
    ':where([part="control"]:not(:popover-open)) { display: none; }',
    ':where([part="heading"]) { margin: 0; }',
    ':where([part="content"]) { display: flex; flex-direction: column; }',
  ].join("\n");

/**
 * Layout of a menu (Spec 014 ④, D-05), keywords only: the host stands inline where its trigger
 * stands; the control is a column of rows with its border; every row a button without the
 * platform's border that stretches across the column and never wraps; a disabled row says so to
 * the pointer; a separator row is a block.
 */
const menuStructure = (fallback: string): string =>
  [
    ":host { display: inline-block; }",
    ':where(slot[name="trigger"]) { display: inline-block; }',
    overlayPlace(fallback),
    ':where([part="control"]) { display: flex; flex-direction: column; align-items: stretch; border-style: solid; }',
    ':where([part="control"]:not(:popover-open)) { display: none; }',
    ':where([part="item"]) { display: flex; align-items: center; box-sizing: border-box; margin: 0; border-style: none; appearance: none; cursor: pointer; white-space: nowrap; text-align: start; transition-property: background-color, color; }',
    ':where([part="item"]:focus:not(:focus-visible)) { outline-width: 0; }',
    ':where([part="item"][aria-disabled="true"]) { cursor: not-allowed; }',
    ':where([part="separator"]) { display: block; }',
  ].join("\n");

/** The default side of an overlay's control: the Skemo's default of placement (D-05). */
const placementOf = (skemo: Skemo): string =>
  String(skemo.props.find((prop) => prop.name === "placement")?.default ?? "block-end");

/** The states of a menu's rows (Spec 014 ④): hover, focus and disabled on the row itself. */
const MENU_STATES: Readonly<Record<string, string | undefined>> = {
  hover: ":hover",
  focus: ":focus-visible",
  disabled: '[aria-disabled="true"]',
};

/**
 * The selector of a part of a menu (Spec 014 ④, D-05): the surface, border and box are the
 * control; item is the row in its state, danger-item the row of a danger entry (a class, no data
 * attribute: the inventory reads data-* as props), the focus ring the row with the focus.
 */
function menuPartSelector(part: string, data: string, state: string): string {
  const root = `[part="control"]${data}`;
  if (part === "item") return `:where(${root} [part="item"]${MENU_STATES[state] ?? ""})`;
  // The danger entry's colour outranks the row's colour by state: a selector with specificity
  // (:where has none), so the keyed rule written after it does not win.
  if (part === "danger-item") return `${root} [part="item"].fm-danger`;
  if (part === "focus-ring") return `:where(${root} [part="item"]:focus-visible)`;
  return `:where(${root})`;
}

/**
 * Layout of a disclosure (Spec 014 ⑤, D-03), keywords and 0 only: the host is a block; the
 * details is a block; the summary a row with the chevron at its end, without the platform's
 * marker, a pointer; the content a block, shown by the platform while open.
 */
const disclosureStructure: string = [
  ":host { display: block; }",
  ':where([part="control"]) { display: block; }',
  ':where([part="summary"]) { display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; margin: 0; list-style: none; cursor: pointer; transition-property: background-color, color; }',
  ':where([part="summary"])::-webkit-details-marker { display: none; }',
  ':where([part="summary"]:focus:not(:focus-visible)) { outline-width: 0; }',
  ':where([part="content"]) { display: block; overflow-wrap: anywhere; }',
].join("\n");

/**
 * Layout of the listbox of a field with suggestions (Spec 014 ⑤, D-03), keywords only: the
 * field is the anchor, the listbox a popover of the platform under it (the writing direction
 * mirrors it), a column of rows that scrolls when the suggestions are more than its height holds;
 * every row a line that never wraps, a pointer; the no-results text a block; the count a text for
 * assistive technology alone.
 */
const suggestStructure: string = [
  ':where([part="field"]) { anchor-name: --fm-field; }',
  ':where([part="listbox"]) { position: fixed; inset: auto; margin: 0; box-sizing: border-box; position-anchor: --fm-field; position-area: block-end; position-try-fallbacks: flip-block; display: flex; flex-direction: column; align-items: stretch; overflow: auto; border-style: none; }',
  ':where([part="listbox"]:not(:popover-open)) { display: none; }',
  ':where([part="suggestion"]) { display: flex; align-items: center; box-sizing: border-box; cursor: pointer; white-space: nowrap; }',
  ':where([part="no-results"]) { display: block; }',
  HIDDEN_TEXT,
].join("\n");

/**
 * Layout of a skip link (Spec 014 ②, D-07), keywords and 0 only, on top of a control's: the link
 * is fixed at the start of the viewport (the writing direction mirrors it) on its layer, and
 * clipped from sight until it has the focus — a keyboard user finds it first, nobody else sees
 * a word before the content.
 */
const skipStructure: string = [
  ':where([part="control"]) { position: fixed; inset-block-start: 0; inset-inline-start: 0; }',
  ':where([part="control"]:not(:focus-visible)) { clip-path: inset(50%); }',
].join("\n");

/**
 * The stylesheet of the light DOM (Spec 011 ④, D-09, D-10, E10): the document adopts it once;
 * every selector starts with the host's tag, the combination stands on the host (data-density,
 * data-layout). Celo knowledge: which element of the platform's table or list a part is.
 */
export function lightStylesheetOf(skemo: Skemo, tag: string): string {
  const rules: [string, string[]][] = [];
  const add = (selector: string, lines: readonly string[]) => {
    if (lines.length === 0) return;
    const found = rules.find(([candidate]) => candidate === selector);
    if (found === undefined) rules.push([selector, [...lines]]);
    else found[1].push(...lines);
  };
  const table = skemo.a11y.role === "table";
  const breadcrumb = isBreadcrumb(skemo);
  const nav = isNav(skemo) && !breadcrumb;
  // Where a part of the table lies (Spec 011 ④, D-09): the head row, every cell, the row headers,
  // the sort button in a header and its sign. Where a part of a navigation lies (Spec 011 ⑤,
  // D-07): every part is the link — item (its fill), items (its text), the underline, the box —
  // with the state of one item (current, E7) as aria-current on the link.
  const where = (
    part: string,
    data: string,
    state: string,
    entry = "",
    property = "",
  ): string | undefined => {
    // A breadcrumb (Spec 015 ①, D-04): every item of the light DOM — a link or, the current page,
    // a text — carries the item and its underline; box and separator stand in the shadow.
    if (breadcrumb) {
      const item = `${tag}${data} > *${entry}`;
      switch (part) {
        case "item":
        case "underline":
          return `${item}${state}`;
        case "box":
          return property === "height" ? item : undefined;
        case "focus-ring":
          return `${item}:focus-visible`;
        default:
          return undefined;
      }
    }
    if (nav) {
      const a = `${tag}${data} > a${entry}`;
      switch (part) {
        case "item":
        case "items":
        case "underline":
          return `${a}${state}`;
        case "box":
          return property === "gap" ? undefined : a;
        case "focus-ring":
          return `${a}:focus-visible`;
        default:
          return undefined;
      }
    }
    if (table) {
      const t = `${tag}${data} > table`;
      switch (part) {
        case "caption":
          return `${t} > caption`;
        case "head":
          return `${t} > thead th`;
        case "cell":
        case "border":
          return `${t} :is(td, th)`;
        case "row-header":
          return `${t} > tbody th`;
        case "sort":
          return `${t} > thead th > button${state}`;
        case "sort-indicator":
          return `${t} > thead th > button > fm-ikono`;
        case "focus-ring":
          return `${t} > thead th > button:focus-visible`;
        default:
          return undefined;
      }
    }
    const l = `${tag}${data} > dl`;
    switch (part) {
      case "term":
        return `${l} > dt`;
      case "value":
        return `${l} > dd`;
      default:
        return undefined;
    }
  };
  const lines = (part: string, property: string, token: string): string[] => {
    if (isBindingKeyword(token)) return keywordDeclarations(part, property, token);
    // The border of a table lies under every cell (Spec 011 ④, D-09): the block-end edge.
    if (table && part === "border") {
      if (property === "color") return [`border-block-end-color: ${variable(token)};`];
      if (property === "width") return [`border-block-end-width: ${variable(token)};`];
    }
    if (part === "focus-ring" && property === "color") {
      const offset = fixedToken(skemo.parts["focus-ring"]?.offset);
      return offset === undefined
        ? []
        : [`box-shadow: 0 0 0 ${variable(offset)} ${variable(token)};`];
    }
    return declarations(skemo, part, property, token);
  };
  for (const [part, properties] of Object.entries(skemo.parts)) {
    for (const [property, source] of Object.entries(properties)) {
      const token = fixedToken(source);
      if (token === undefined) continue;
      const selector = where(part, "", "", "", property);
      if (selector !== undefined) add(selector, lines(part, property, token));
    }
  }
  for (const state of STATE_ORDER) {
    for (const [part, properties] of Object.entries(skemo.parts)) {
      for (const [property, source] of Object.entries(properties)) {
        const keys = keysOf(skemo, source);
        if (keys.length === 0) continue;
        if (!keys.includes(STATE_KEY) && state !== "rest") continue;
        for (const combination of combinationsOf(skemo, keys)) {
          if (keys.includes(STATE_KEY) && combination[STATE_KEY] !== state) continue;
          const bound = boundToken(skemo, part, property, combination);
          if (bound === undefined) continue;
          const data = keys
            .filter((key) => key !== STATE_KEY && !isEntryKey(skemo, key))
            .map((key) => `[data-${key}="${combination[key] ?? ""}"]`)
            .join("");
          // The state of one entry (E7) stands on the link as the attribute the Skemo names
          // (aria-current): present while true, absent while false.
          const entry = keys
            .filter((key) => isEntryKey(skemo, key))
            .map((key) => {
              const attribute = skemo.a11y.states[key]?.[0] ?? `data-${key}`;
              return combination[key] === "true" ? `[${attribute}]` : `:not([${attribute}])`;
            })
            .join("");
          const selector = where(
            part,
            data,
            STATE_SELECTORS[combination[STATE_KEY] ?? "rest"] ?? "",
            entry,
            property,
          );
          if (selector !== undefined) add(selector, lines(part, property, bound.token));
        }
      }
    }
  }
  // The gaps of a list (Spec 011 ④, D-10): between the term and its value along the inline axis
  // (box.inline-padding by layout), between the entries (list.gap); stacked, the entries are
  // rows of their own, so the gap of the box lies between term and value and the list's gap
  // before every term but the first.
  if (!table) {
    const listGap = fixedToken(skemo.parts.list?.gap);
    const boxGap = fixedToken(skemo.parts.box?.gap);
    for (const layout of skemo.props.find((prop) => prop.name === "layout")?.values ?? []) {
      const inline = boundToken(skemo, "box", "inline-padding", { layout });
      const selector = `${tag}[data-layout="${layout}"] > dl`;
      if (inline !== undefined) add(selector, [`column-gap: ${variable(inline.token)};`]);
      if (layout === "stacked") {
        if (boxGap !== undefined) add(selector, [`row-gap: ${variable(boxGap)};`]);
        if (listGap !== undefined) {
          add(`${selector} > dt:not(:first-of-type)`, [
            `margin-block-start: ${variable(listGap)};`,
          ]);
        }
      } else if (listGap !== undefined) {
        add(selector, [`row-gap: ${variable(listGap)};`]);
      }
    }
  }
  const structure =
    nav || breadcrumb
      ? [
          `${tag} > ${breadcrumb ? "*" : "a"} { display: inline-flex; align-items: center; box-sizing: border-box; white-space: nowrap; transition-property: background-color, color, text-decoration-color; }`,
          `${tag} > ${breadcrumb ? "*" : "a"}:focus:not(:focus-visible) { outline-width: 0; }`,
        ]
      : table
        ? [
            `${tag} > table { border-collapse: collapse; caption-side: top; }`,
            `${tag} > table :is(td, th) { text-align: start; box-sizing: border-box; border-block-end-style: solid; }`,
            `${tag} > table :is(td, th)[numeric] { text-align: end; font-variant-numeric: tabular-nums; }`,
            `${tag} > table > thead th > button { display: inline-flex; align-items: center; appearance: none; border-style: none; cursor: pointer; font: inherit; color: inherit; text-align: inherit; }`,
            `${tag} > table > thead th > button > fm-ikono { flex: none; }`,
            `${tag} > table > tbody > tr[data-fm-empty] > td { text-align: center; }`,
            `${tag} ${HIDDEN_TEXT}`,
          ]
        : [
            `${tag} > dl { display: grid; margin: 0; }`,
            `${tag} > dl > :is(dt, dd) { margin: 0; }`,
            `${tag}[data-layout="columns"] > dl { grid-template-columns: max-content auto; }`,
            `${tag}[data-layout="stacked"] > dl { grid-template-columns: auto; }`,
            // Spec 014 ① (plan ① D-03): auto is drawn as the wide case until the element has
            // measured its container and written columns or stacked.
            `${tag}[data-layout="auto"] > dl { grid-template-columns: max-content auto; }`,
            `${tag} ${HIDDEN_TEXT}`,
          ];
  return `${structure.join("\n")}\n${rules
    .map(([selector, body]) => `${selector} {\n${body.map((line) => `  ${line}`).join("\n")}\n}`)
    .join("\n")}\n`;
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
  // A light-DOM host (Spec 011 ④, E10) keeps only the region and its edge in the shadow sheet;
  // every other part stands in the document's stylesheet (lightStylesheetOf).
  const shadowParts = Object.entries(skemo.parts).map(
    ([part, properties]): [string, Record<string, SkemoPartSource | undefined>] => [
      part,
      Object.fromEntries(
        Object.entries(properties).filter(
          ([property]) => !isLight(skemo) || lightShadowProperty(skemo, part, property),
        ),
      ),
    ],
  );
  // Fixed properties first: they do not depend on props or state.
  for (const [part, properties] of shadowParts) {
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
  for (const [part, properties] of shadowParts) {
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
  const undrawn = isStatus(skemo)
    ? statusUndrawn(skemo)
    : isMeter(skemo)
      ? [':where([part="control"][data-unknown]) [part="fill"] { display: none; }']
      : [];
  const disables = skemo.states.includes("disabled") || skemo.states.includes("loading");
  const bordered = skemo.parts.border !== undefined;
  const base = isDialog(skemo)
    ? dialogStructure
    : isTooltip(skemo)
      ? tooltipStructure(placementOf(skemo))
      : isPopover(skemo)
        ? popoverStructure(placementOf(skemo))
        : isMenu(skemo)
          ? menuStructure(placementOf(skemo))
          : isIcon(skemo)
            ? iconStructure
            : isSeparator(skemo)
              ? separatorStructure
              : isHeading(skemo)
                ? headingStructure
                : isParagraph(skemo)
                  ? paragraphStructure
                  : isText(skemo)
                    ? textStructure(bordered)
                    : isStatus(skemo)
                      ? statusStructure(skemo)
                      : isMeter(skemo)
                        ? meterStructure
                        : isPagination(skemo)
                          ? paginationStructure
                          : isUpload(skemo)
                            ? uploadStructure(disables)
                            : isCard(skemo)
                              ? cardStructure
                              : isAvatar(skemo)
                                ? avatarStructure
                                : isLight(skemo)
                                  ? lightStructure(skemo)
                                  : isTabs(skemo)
                                    ? tabsStructure
                                    : isDisclosure(skemo)
                                      ? disclosureStructure
                                      : isField(skemo)
                                        ? `${fieldStructure(disables, isSelect(skemo), isTextarea(skemo))}${isSuggest(skemo) ? `\n${suggestStructure}` : ""}`
                                        : isGroup(skemo)
                                          ? groupStructure(
                                              disables,
                                              skemo.parts["required-mark"] !== undefined,
                                            )
                                          : isToggle(skemo)
                                            ? toggleStructure(
                                                disables,
                                                uzo?.layout.wrap !== undefined &&
                                                  uzo.layout.wrap !== "never",
                                                skemo.slots.some(
                                                  (slot) =>
                                                    slot.default !== true && slot.text === true,
                                                ),
                                                skemo.parts["required-mark"] !== undefined,
                                              )
                                            : structure(
                                                uzo?.layout.wrap === "with-text",
                                                disables,
                                                bordered,
                                              );
  // A skip link adds its place above the page to a control's structure (Spec 014 ②, D-07).
  const floating = isSkip(skemo) ? `\n${skipStructure}` : "";
  return `${base}${floating}\n${[...tokenRules, ...undrawn].join("\n")}\n`;
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
  // The state of one entry (E7) as the attribute the Skemo names. aria-current is no boolean: it
  // is present ("page") on the current entry and absent elsewhere (Spec 015 ①, the pagination),
  // as the light hosts read it; aria-selected and aria-checked say true or false.
  const entry = keys
    .filter((key) => isEntryKey(skemo, key))
    .map((key) => {
      const attribute = skemo.a11y.states[key]?.[0] ?? `data-${key}`;
      if (attribute === "aria-current") {
        return combination[key] === "true" ? `[${attribute}]` : `:not([${attribute}])`;
      }
      return `[${attribute}="${combination[key] ?? ""}"]`;
    })
    .join("");
  if (isGroup(skemo)) {
    return groupPartSelector(part, property, data, entry, combination[STATE_KEY] ?? "rest");
  }
  if (isDialog(skemo)) return dialogPartSelector(part, data);
  // The overlays (Spec 014 ④): the tooltip's parts are all the control; the popover's heading and
  // content are their own elements in it; the menu's rows carry the states.
  if (isTooltip(skemo)) return `:where([part="control"]${data})`;
  if (isPopover(skemo)) {
    return part === "heading" || part === "content"
      ? `:where([part="control"]${data}) [part="${part}"]`
      : `:where([part="control"]${data})`;
  }
  if (isMenu(skemo)) return menuPartSelector(part, data, combination[STATE_KEY] ?? "rest");
  if (isStatus(skemo)) return statusPartSelector(part, data);
  if (isMeter(skemo)) return meterPartSelector(part, data);
  if (isTabs(skemo)) return tabsPartSelector(part, data, entry, combination[STATE_KEY] ?? "rest");
  // The shadow of a light-DOM host (Spec 011 ④, E10): the region and its edge, the ring on focus;
  // of a navigation (Spec 011 ⑤) the nav with the gap of its items.
  if (isLight(skemo)) {
    // A breadcrumb (Spec 015 ①, Abnahme S-1): the chevron's size and colour on the chevron, the
    // gap on the list of the levels — the nav keeps its width, so the levels stand in one line.
    if (isBreadcrumb(skemo)) {
      return part === "separator" ? ':where([part="separator"])' : ':where([part="items"])';
    }
    if (isNav(skemo)) return ':where([part="list"])';
    return part === "focus-ring"
      ? ':where([part="region"]:focus-visible)'
      : ':where([part="region"])';
  }
  // Static text (Spec 011 ③, D-08): every part — surface, border, text, box — is the control.
  // An icon (Spec 014 ②): the glyph is the control, it carries the box and the colour; a
  // separator: the control is the line.
  if (isIcon(skemo)) return `:where([part="glyph"]${data})`;
  // A heading (Spec 014 ③): its text is the control; a paragraph: the control is the text.
  if (isHeading(skemo)) return `:where([part="text"]${data})`;
  if (isText(skemo) || isSeparator(skemo) || isParagraph(skemo)) {
    return `:where([part="control"]${data})`;
  }
  if (isDisclosure(skemo))
    return disclosurePartSelector(part, data, combination[STATE_KEY] ?? "rest");
  if (isPagination(skemo))
    return paginationPartSelector(part, data, entry, combination[STATE_KEY] ?? "rest");
  if (isUpload(skemo)) {
    return uploadPartSelector(part, property, data, combination[STATE_KEY] ?? "rest");
  }
  if (isCard(skemo)) return cardPartSelector(part, data);
  if (isAvatar(skemo)) return avatarPartSelector(part, data);
  const state = STATE_SELECTORS[combination[STATE_KEY] ?? "rest"] ?? "";
  if (isField(skemo)) return fieldPartSelector(part, property, data, state, isSelect(skemo), entry);
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

/**
 * Everything the element template needs of one Ero: names, the native control, the slots. The
 * Ikonaro (Spec 014 ②) is what the icon element knows of the names and which of them mirror.
 */
export function elementNamesOf(
  entry: LoadedEro,
  inline = false,
  ikonaro: readonly { name: string; mirror?: boolean }[] = [],
) {
  const columnsFrom = entry.uzo?.layout["columns-from"];
  return {
    ...namesOf(entry.ero),
    ero: entry.ero.name,
    host: hostOf(
      entry.skemo.a11y.role,
      isMultiline(entry.skemo),
      isPopover(entry.skemo),
      isSuggest(entry.skemo),
      isPagination(entry.skemo),
      isUpload(entry.skemo),
      isAvatar(entry.skemo),
    ),
    role: entry.skemo.a11y.role,
    // Spec 015 ① (plan ① D-04): the breadcrumb is a light host with a list in its shadow.
    breadcrumb: isBreadcrumb(entry.skemo),
    marked: entry.skemo.parts["required-mark"] !== undefined,
    // Spec 011 ③: a live region turns its indicator and shows a dismiss butono where the Skemo
    // has the parts.
    indicator: entry.skemo.parts.indicator !== undefined,
    dismiss: entry.skemo.parts.dismiss !== undefined,
    // Spec 014 ②: a status host with the part icon shows the icon of its intent; a link with a
    // layer floats (the skip link); the icon element knows the Ikonaro.
    icon: entry.skemo.parts.icon !== undefined && hostOf(entry.skemo.a11y.role) === "status",
    skip: isSkip(entry.skemo),
    ikonaro: ikonaro.map((ikono) => ({
      name: ikono.name,
      ...(ikono.mirror === true ? { mirror: true } : {}),
    })),
    // Spec 014 ① (plan ① D-03): the width from which layout auto lays name and value side by side,
    // the Uzo's columns-from as the custom property its token is projected to.
    ...(columnsFrom === undefined ? {} : { columnsFrom: nomRegulo("css").derive(columnsFrom) }),
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
      // A light-DOM host (Spec 011 ④, E10) exports the document's stylesheet beside the shadow's.
      const lightCss = isLight(entry.skemo)
        ? `export const ${constant}_LIGHT_CSS = ${JSON.stringify(lightStylesheetOf(entry.skemo, tag))};\n`
        : "";
      files.push({
        path: `${GENERATED_DIR}/${entry.ero.name}.styles.ts`,
        text: `${header}export const ${constant}_CSS = ${JSON.stringify(stylesheetOf(entry.skemo, entry.uzo))};\n${lightCss}`,
      });
      files.push({
        path: `${GENERATED_DIR}/${tag}.ts`,
        text: header + elementSource(elementNamesOf(entry, false, modelo.ikonaro)),
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
  // Every exported sheet of the module (Spec 011 ④: the shadow's and the light DOM's).
  const sheets = [...moduleText.matchAll(/=\s*("(?:[^"\\]|\\.)*")\s*;/g)].map(
    (match) => JSON.parse(match[1] ?? '""') as string,
  );
  return sheets.length === 0 ? moduleText : sheets.join("\n");
}

/**
 * The parts that carry the combination of an Ero in its stylesheet (the stylesheet inventory):
 * the control, the field of a composite or a toggle, a list and its items, the glyph of an icon,
 * the text of a heading. A data attribute on any other part belongs to that part.
 */
const COMBINATION_PARTS: ReadonlySet<string> = new Set([
  "control",
  "field",
  "list",
  "item",
  "glyph",
  "text",
]);

/** The state a selector addresses; the inverse of `STATE_SELECTORS` plus the focus ring (T021). */
function stateOf(selector: string): string {
  // Spec 015 ② (plan ② D-05): the field of a file input while files are dragged over it.
  if (selector.includes("[dragover]")) return "dragover";
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
    // A light-DOM host (Spec 011 ④, E10) writes the combination on itself: fm-tabelo[data-…].
    // An icon (Spec 014 ②): its glyph is its control; a heading (Spec 014 ③): its text.
    // A pagination (Spec 015 ①): the states stand on its items in the list (the navigado's own
    // list carries only its orientation, no state and no prop of the Skemo's).
    if (
      !selector.includes('[part="control"]') &&
      !selector.includes('[part="field"]') &&
      !selector.includes('[part="list"] [part="item"]') &&
      !selector.includes('[part="glyph"]') &&
      !selector.includes('[part="text"]') &&
      !selector.trim().startsWith("fm-")
    )
      continue;
    states.add(stateOf(selector));
    // A data attribute on a part of its own is the state of one entry (Nachlese 4 N-8: the
    // active suggestion, data-active on the row — no ARIA attribute says it), not a prop of the
    // Ero: only what stands on the element that carries the combination counts.
    const compounds = selector.split(/[\s>+~]+/).filter((compound) => compound !== "");
    for (const compound of compounds) {
      const part = /\[part="([a-z0-9-]+)"\]/.exec(compound)?.[1];
      if (part !== undefined && !COMBINATION_PARTS.has(part)) continue;
      for (const [, name = "", value = ""] of compound.matchAll(
        /\[data-([a-z0-9-]+)="([^"]*)"\]/g,
      )) {
        const values = props.get(name) ?? [];
        if (!values.includes(value)) values.push(value);
        props.set(name, values);
      }
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
