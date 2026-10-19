// Behaviour template of a generated Ero element (Spec 003, plan D-07; Spec 008, plan D-09).
// Hand-written once, here in the generator; every element in @fundamento/eroj is this template
// with the names of one Ero and its Skemo descriptor filled in (Art. I). The control inside is the
// native element of the Ero's a11y role: a button for `button`, a link for `link`. The element
// holds no visible text: the label comes from the default slot or the `label` prop (Art. VIII);
// what assistive technology hears in addition comes from `a11y.texts` of the Skemo, in the
// language of the document. Console warnings are developer messages.

/**
 * The native control an a11y role is rendered as (Celo knowledge, Art. VIII). `toggle` is a
 * native button with the role of the Skemo, a control with its label beside it: the track of a
 * switch with the knob in it (Spec 010 ①, D-09), the box of a checkbox with the check mark in it
 * (Spec 010 ②, D-08). `group` is a radio group (Spec 010 ③, D-06): an element with role
 * radiogroup named by its label, one row with role radio per option of the light DOM. `select` is
 * a select (Spec 010 ④, D-06): the platform's own select, role combobox from the browser, its
 * options mirrored from the light DOM, the list the platform's (E3).
 */
export type HostControl =
  | "button"
  | "a"
  | "input"
  | "textarea"
  | "toggle"
  | "group"
  | "select"
  | "dialog"
  | "text"
  | "status"
  | "meter"
  | "light"
  | "tabs"
  | "icon"
  | "separator"
  | "heading"
  | "paragraph"
  | "tooltip"
  | "popover"
  | "menu"
  | "disclosure"
  | "pagination"
  | "suggest"
  | "upload"
  | "card"
  | "avatar";

export interface ElementNames {
  /** `fm-butono` */
  tag: string;
  /** `FmButono` */
  className: string;
  /** `BUTONO` (prefix of the generated constants) */
  constant: string;
  /** `butono` (file name of the stylesheet) */
  ero: string;
  /** The native control of the a11y role; `button` when the role has no mapping. */
  host?: HostControl;
  /** The a11y role of the Skemo: a toggle renders it on its button (Spec 010 ②, D-08). */
  role?: string;
  /** Whether the Skemo has the part required-mark: a toggle shows it in its label (D-08). */
  marked?: boolean;
  /**
   * Slot names in the order the Skemo declares them; the default slot is the label. A slot whose
   * entries are options (Spec 010 ③, SkemoSlot.entry) is a `list`: one row per entry.
   */
  slots?: {
    name: string;
    default?: boolean;
    decorative?: boolean;
    list?: boolean;
    /** A text slot (Spec 011 ③): a live region holds it in a span, every other slot in a div. */
    text?: boolean;
    /** The text is for assistive technology alone, clipped from sight (Spec 011 ③, D-08). */
    hidden?: boolean;
  }[];
  /** Whether the Skemo has the part indicator: a status host turns it while loading (D-10). */
  indicator?: boolean;
  /** Whether the Skemo has the part dismiss: a status host shows a close butono in it (D-09). */
  dismiss?: boolean;
  /**
   * The custom property of the width from which a list with layout auto lays name and value side
   * by side (Spec 014 ①, plan ① D-03): the Uzo's columns-from (size.container.small →
   * --fm-size-container-small); absent, the element has no auto layout to resolve.
   */
  columnsFrom?: string;
  /**
   * The Ikonaro as the icon element knows it (Spec 014 ②, plan ② D-05): every name, and whether
   * its direction carries meaning (mirrored in right-to-left writing). An unknown name warns.
   */
  ikonaro?: { name: string; mirror?: boolean }[];
  /** A link that floats above the page (Spec 014 ②, plan ② D-07: the skip link, surface.layer). */
  skip?: boolean;
  /** Whether the Skemo has the part icon: a status host shows the icon of its intent (Spec 014 ②). */
  icon?: boolean;
  /** Spec 015 ① (plan ① D-04): a navigation whose items are a path — the breadcrumb, a light host with a list in its shadow. */
  breadcrumb?: boolean;
  /**
   * The Make Kit builds one file per Aspekto: the descriptor and the stylesheet are then constants
   * above the element instead of imports (D-14).
   */
  inline?: boolean;
}

/**
 * The native control of an a11y role; everything that is not a link is a button. A textbox over
 * several lines (Spec 011 ②, D-11: the Skemo has rows) is the platform's textarea; a dialog
 * (Spec 011 ②, D-12) the platform's dialog, opened modal.
 */
export function hostOf(
  role: string,
  multiline = false,
  popover = false,
  suggest = false,
  pagination = false,
  upload = false,
  avatar = false,
): HostControl {
  if (role === "link") return "a";
  // Spec 015 ② (plan ② D-05): the platform's file input is heard as a button; with a dropzone
  // part it is the file input of an alsxutilo, not a button of its own.
  if (role === "button" && upload) return "upload";
  // Spec 015 ① (plan ① D-03): a navigation with an ellipsis part draws its pages itself — a
  // shadow host; the breadcrumb stays a light host like the navigado (its links are the page's).
  if (role === "navigation" && pagination) return "pagination";
  // Spec 014 ⑤ (plan ⑤ D-03): a disclosure is the platform's details and summary (role group);
  // a combobox with a listbox part is the field of the kampo with a list of suggestions.
  if (role === "group") return "disclosure";
  if (role === "combobox" && suggest) return "suggest";
  // The overlays (Spec 014 ④, plan ④ D-05): a tooltip, a menu, and a popover — a non-modal dialog
  // with a trigger slot (the Celo tells the host apart from the modal dialog by that slot).
  if (role === "tooltip") return "tooltip";
  if (role === "menu") return "menu";
  if (role === "dialog" && popover) return "popover";
  // Static text (Spec 011 ③, D-08: the badge) is a span without a role attribute — generic is the
  // span's own role; a live region (D-09, D-10: notice, loading and empty state) is a div with
  // role status, alert where the Skemo's intent is danger.
  if (role === "generic") return "text";
  if (role === "status") return "status";
  // A meter (Spec 011 ④, D-08) is a div with role meter; a table or a list (D-09, D-10, E10) is
  // the platform's own element in the light DOM, which the Ero styles and extends: the shadow
  // holds only a region or a frame around the slot.
  if (role === "meter") return "meter";
  if (role === "table" || role === "list") return "light";
  // A navigation (Spec 011 ⑤, D-07) keeps the platform's own links in the light DOM too: the
  // shadow holds the nav landmark around them. Tabs (D-08) are rows with role tab, as a radio
  // group's are rows with role radio.
  if (role === "navigation") return "light";
  if (role === "tablist") return "tabs";
  // An icon (Spec 014 ②, plan ② D-05) is a span that shows the Aspekto's glyph as a mask; a
  // separator (D-06) a div with that role, or none where it only decorates.
  // Spec 015 ③ (plan ③ D-08): an image with an initials part is an avatar, not an icon.
  if (role === "img" && avatar) return "avatar";
  if (role === "img") return "icon";
  if (role === "separator") return "separator";
  // A heading (Spec 014 ③, plan ③ D-04) is a div with role heading and its level spoken as
  // aria-level — its text is the control; a paragraph is the platform's p, inline where it is code.
  if (role === "heading") return "heading";
  if (role === "paragraph") return "paragraph";
  if (role === "textbox") return multiline ? "textarea" : "input";
  if (role === "dialog") return "dialog";
  // Spec 015 ③ (plan ③ D-04): a card is the platform's article (a region where it is no
  // standalone content), its heading a composed titolo.
  if (role === "article") return "card";
  if (role === "switch" || role === "checkbox") return "toggle";
  if (role === "radiogroup") return "group";
  if (role === "combobox") return "select";
  return "button";
}

/**
 * The decorative mark the control shows when a prop with an a11y text is true (Spec 008, D-05):
 * the fallback of the last decorative slot, so a slotted icon replaces it. Since Nachlese 4 N-7
 * (Spec 014 ② O-7) the Ikonaro's external — the Aspekto draws it, in the current colour and the
 * size of the Ero; no hand-drawn arrow, no text node, no name of its own (the ikono is decorative
 * without a label).
 */
const MARK = '<fm-ikono name="external"></fm-ikono>';

/**
 * The sign of a required field (Spec 009, A2, D-07): an asterisk as a small vector in the current
 * colour — a sign of the projection, no text node (Art. VIII); its colour is the part required-mark.
 */
const REQUIRED_MARK =
  '<svg aria-hidden="true" viewBox="0 0 16 16" width="8" height="8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 2v12M2.8 5l10.4 6M13.2 5 2.8 11"/></svg>';

/**
 * The dot of a chosen option in a box of 16 × 16 (Spec 010 ③, D-05): a circle of radius 4 in the
 * middle, drawn as a path so that Figma imports one vector, as for the check mark (② D-09).
 */
const DOT_PATH = "M8 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8z";

/**
 * The check mark of a checkbox (Spec 010 ②, D-08): since Nachlese 4 N-7 (Spec 014 ② O-7) the
 * Ikonaro's check in the indicator, in the indicator's colour and the size of the box, as the
 * chevron of a select is (Spec 014 ②); the dot of a radio, the arc of a state and the mark of a
 * required field stay signs of the projection.
 */
const IKONO_CHECK = '<fm-ikono name="check"></fm-ikono>';

/**
 * The chevron of a select in a box of 16 × 16 (Spec 010 ④, D-05): a filled outline pointing down,
 * centred, so that Figma imports one vector whose fill is the colour of the indicator, as for the
 * check mark (② D-09).
 */
const CHEVRON_PATH = "M1.9 5.7 3.3 4.3 8 9l4.7-4.7 1.4 1.4L8 11.8z";

/**
 * The sign an indicator shows, per a11y role (Spec 010 ③, D-05): the dot of a chosen option, a
 * filled vector in the current colour — the colour of the part indicator; a sign of the
 * projection, no text node (Art. VIII), like the mark of a required field. A knob has none, and
 * since Nachlese 4 N-7 a checkbox neither: its check mark is the Ikonaro's (IKONO_CHECK). The web
 * fills the indicator with it (`100%`); the Figma Celo imports the same vector in its own box of
 * 16 (one shape for both pictures).
 */
export function signOf(role: string, size = "100%"): string | undefined {
  // The dot of a chosen option (Spec 010 ③, D-05): half the box of the indicator, in its middle.
  if (role === "radiogroup") {
    return `<svg aria-hidden="true" viewBox="0 0 16 16" width="${size}" height="${size}" fill="currentColor"><path d="${DOT_PATH}"/></svg>`;
  }
  // The chevron of a select (Spec 010 ④, D-05): the sign that a list opens from the field.
  if (role === "combobox") {
    return `<svg aria-hidden="true" viewBox="0 0 16 16" width="${size}" height="${size}" fill="currentColor"><path d="${CHEVRON_PATH}"/></svg>`;
  }
  return undefined;
}

/**
 * The text slots of a composite besides the label (Spec 009, D-08): each in its own part, hidden
 * while empty; the error announced live. Their texts are the description of the control.
 */
function textsMarkup(slots: NonNullable<ElementNames["slots"]>): string {
  return slots
    .filter((slot) => slot.default !== true && slot.decorative !== true && slot.list !== true)
    .map(
      (slot) =>
        `<span part="${slot.name}" id="${slot.name}" hidden${slot.name === "error" ? ' aria-live="polite"' : ""}><slot name="${slot.name}"></slot></span>`,
    )
    .join("");
}

/**
 * The shadow markup of a field (Spec 009, D-08): the label with the mark of a required field, the
 * native input, help and error below, each in its own part. The texts of the slots are the
 * description of the input (a11y.description), the error announced live.
 */
function fieldMarkup(
  slots: NonNullable<ElementNames["slots"]>,
  textarea = false,
  suggest = false,
): string {
  // A text area (Spec 011 ②, D-11): the platform's textarea in place of the input. A field with
  // suggestions (Spec 014 ⑤, D-03): the input as a combobox over a listbox — a popover of the
  // platform anchored to the field — with the count of suggestions in a live region.
  const native = textarea
    ? '<textarea part="control" id="control"></textarea>'
    : suggest
      ? '<input part="control" id="control" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="listbox" autocomplete="off">'
      : '<input part="control" id="control">';
  const listbox = suggest
    ? '<div part="listbox" role="listbox" id="listbox" popover="manual"></div><span part="count" role="status" aria-live="polite" class="fm-hidden"></span>'
    : "";
  return `<div part="field"><label part="label" for="control"><slot></slot><span part="required-mark" aria-hidden="true">${REQUIRED_MARK}</span></label>${native}${listbox}${textsMarkup(slots)}<span id="fm-texts" hidden></span></div>`;
}

/**
 * The shadow markup of a dialog (Spec 011 ②, plan ② D-12, G4): the platform's own dialog as the
 * control, named by its heading and described by its message; content for the fields of a form
 * dialog (E9), the reason as a tekstareo the dialog shows itself (its label from the slot reason,
 * its help from the slot reason-help: one sentence under the field that describes the textbox,
 * Spec 014 ① plan ① D-02), the actions slotted butono at the end. aria-modal says what showModal does.
 */
function dialogMarkup(): string {
  return `<dialog part="control" aria-modal="true" aria-labelledby="heading" aria-describedby="message"><fm-titolo part="heading" id="heading" level="2" size="headline-4"><slot></slot></fm-titolo><p part="message" id="message"><slot name="message"></slot></p><div part="content"><slot name="content"></slot></div><fm-tekstareo part="reason" rows="3"><slot name="reason"></slot><slot name="reason-help" slot="help"></slot></fm-tekstareo><div part="actions"><slot name="actions"></slot></div><span id="fm-texts" hidden></span></dialog>`;
}

/**
 * The shadow markup of a select (Spec 010 ④, D-06): the field of the kampo — label with the mark
 * of a required field, help and error below — around the platform's own select (role combobox
 * from the browser) and the chevron (indicator) at its end, side by side in one row. The options
 * of the light DOM are written into the select as the platform's options when it renders; the
 * list that opens is the platform's (E3).
 */
function selectMarkup(slots: NonNullable<ElementNames["slots"]>, role: string): string {
  void role;
  return `<div part="field"><label part="label" for="control"><slot></slot><span part="required-mark" aria-hidden="true">${REQUIRED_MARK}</span></label><div><select part="control" id="control"></select><span part="indicator" aria-hidden="true">${IKONO_CHEVRON}</span></div>${textsMarkup(slots)}<span id="fm-texts" hidden></span></div>`;
}

/**
 * The shadow markup of a toggle (Spec 010 ①, D-09; ②, D-08): a native button with the role of the
 * Skemo as the control — the track of a switch with its knob, the box of a checkbox with its check
 * mark — and the label beside it, named by the label (aria-labelledby); a click on the label
 * turns the control like a click on it (for). A checkbox carries the mark of a required box in
 * its label and its error under the label, in a column beside the box. aria-checked is set when
 * it renders.
 */
function toggleMarkup(
  role: string,
  slots: NonNullable<ElementNames["slots"]>,
  marked: boolean,
): string {
  const mark = marked
    ? `<span part="required-mark" aria-hidden="true">${REQUIRED_MARK}</span>`
    : "";
  const label = `<label part="label" id="label" for="control"><slot></slot>${mark}</label>`;
  const texts = textsMarkup(slots);
  const beside = texts === "" ? label : `<div>${label}${texts}</div>`;
  const sign = role === "checkbox" ? IKONO_CHECK : (signOf(role) ?? "");
  return `<div part="field"><button part="control" id="control" type="button" role="${role}" aria-labelledby="label"><span part="indicator">${sign}</span></button>${beside}<span id="fm-texts" hidden></span></div>`;
}

/**
 * The shadow markup of a radio group (Spec 010 ③, D-06): the group with role radiogroup, named by
 * its label (with the mark of a required group), the column of options — its rows are made by the
 * element, one per option — and help and error below. The element assigns the children to the
 * slots itself (manual slot assignment), so that every option gets a row of its own.
 */
function groupMarkup(slots: NonNullable<ElementNames["slots"]>, marked: boolean): string {
  const mark = marked
    ? `<span part="required-mark" aria-hidden="true">${REQUIRED_MARK}</span>`
    : "";
  return `<div part="field" id="control" role="radiogroup" aria-labelledby="label"><span part="label" id="label"><slot></slot>${mark}</span><div part="options"></div>${textsMarkup(slots)}<span id="fm-texts" hidden></span></div>`;
}

/**
 * One row of a radio group (Spec 010 ③, D-06): role radio, its state aria-checked, the circle
 * (control) with the dot (indicator) in it and the label of the option beside it; the option itself
 * is assigned to the row's slot. The element adds one row per option.
 */
function rowMarkup(role: string): string {
  return `<div part="option" role="radio" aria-checked="false" tabindex="-1"><span part="control"><span part="indicator">${signOf(role) ?? ""}</span></span><span part="option-label"><slot></slot></span></div>`;
}

/**
 * The arc of a loading indicator in a box of 16 × 16 (Spec 011 ③, D-10): three quarters of a
 * circle in the current colour, a sign of the projection like the check mark; the element turns
 * it with the motion roles of the Skemo.
 */
const ARC_PATH = "M8 2a6 6 0 1 1-6 6";

/**
 * The sign of a dismiss butono (Spec 011 ③, D-09; Spec 014 ②, G3): the ikono close in its
 * icon-start slot — the Aspekto's glyph, switching with the brand, decorative in the butono.
 */
const CROSS = '<fm-ikono slot="icon-start" name="close"></fm-ikono>';

/**
 * The chevron of a select (Spec 010 ④, D-05; Spec 014 ②, G3): the ikono chevron-down in the
 * indicator, in the size of the field (the element writes it); the Aspekto draws the glyph.
 */
const IKONO_CHEVRON = '<fm-ikono name="chevron-down"></fm-ikono>';

/**
 * The shadow markup of static text (Spec 011 ③, D-08, G4): a span without a role as the control,
 * the label in it, and every hidden text slot (the long form of a badge) in a span clipped from
 * sight but present for assistive technology — never a title attribute.
 */
function textMarkup(slots: NonNullable<ElementNames["slots"]>): string {
  const hidden = slots
    .filter((slot) => slot.hidden === true)
    .map(
      (slot) =>
        `<span part="${slot.name}" class="fm-hidden"><slot name="${slot.name}"></slot></span>`,
    )
    .join("");
  return `<span part="control"><slot></slot>${hidden}<span id="fm-texts" hidden></span></span>`;
}

/**
 * The shadow markup of a live region (Spec 011 ③, D-09, D-10, G4): a div with role status as
 * the control; first the words assistive technology hears with the content (the kind of a notice,
 * "lädt"), clipped from sight; the indicator where the Skemo has one; then the text slots in the
 * Skemo's order, the default slot as the message or text, every named slot in a holder hidden
 * while empty; and the dismiss butono where the Skemo has the part, hidden until dismissible.
 */
function statusMarkup(
  slots: NonNullable<ElementNames["slots"]>,
  indicator: boolean,
  dismiss: boolean,
  icon = false,
): string {
  const arc = `<svg aria-hidden="true" viewBox="0 0 16 16" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="${ARC_PATH}"/></svg>`;
  const holders = slots
    .filter((slot) => slot.decorative !== true)
    .map((slot) =>
      slot.default === true
        ? `<span part="${slot.name}" id="${slot.name}"><slot></slot></span>`
        : `<${slot.text === true ? "span" : "div"} part="${slot.name}" id="${slot.name}" hidden><slot name="${slot.name}"></slot></${slot.text === true ? "span" : "div"}>`,
    )
    .join("");
  // The icon of the intent (Spec 014 ②, G3, G6): an ikono named like the intent, decorative — the
  // intent word is heard already — in the colour of the part icon.
  const sign = icon ? '<span part="icon" aria-hidden="true"><fm-ikono></fm-ikono></span>' : "";
  return `<div part="control" role="status"><span id="fm-texts" class="fm-hidden"></span>${indicator ? `<span part="indicator" aria-hidden="true">${arc}</span>` : ""}${sign}<div>${holders}</div>${dismiss ? `<fm-butono part="dismiss" emphasis="low" size="small" hidden>${CROSS}</fm-butono>` : ""}</div>`;
}

/**
 * The shadow markup of a meter (Spec 011 ④, D-08, G4): a div with role meter as the control,
 * named by its label and described by its value text (the aria-valuetext too); the track with the
 * fill in it, whose inline size the element sets to the share of the range.
 */
function meterMarkup(): string {
  return `<div part="control" role="meter" aria-labelledby="label" aria-describedby="value-text"><span part="label" id="label"><slot></slot></span><span part="track"><span part="fill"></span></span><span part="value-text" id="value-text"><slot name="value-text"></slot></span><span id="fm-texts" hidden></span></div>`;
}

/**
 * The shadow markup of a light-DOM host (Spec 011 ④, D-09, D-10, E10): the platform's own table
 * or list stays in the light DOM; the shadow holds a focusable, named scroll region around a named
 * content slot (the table), or a plain frame around the default slot (the list); a default text
 * slot (the caption of a table) is not rendered here — the element writes it into the table.
 */
function lightMarkup(
  slots: NonNullable<ElementNames["slots"]>,
  role = "",
  breadcrumb = false,
): string {
  // A breadcrumb (Spec 015 ①, plan ① D-04): the nav landmark around an ordered list whose items
  // the element makes, one per link of the light DOM (manual slot assignment), a chevron between.
  if (breadcrumb) {
    return '<nav part="list"><ol part="items"></ol></nav><slot hidden></slot><span id="fm-texts" hidden></span>';
  }
  // A navigation (Spec 011 ⑤, D-07): the nav landmark, named by the label prop in the render,
  // around the links of the default slot; the gap between the items is its own.
  if (role === "navigation") {
    return '<nav part="list"><slot></slot></nav><span id="fm-texts" hidden></span>';
  }
  const content = slots.find((slot) => slot.default !== true && slot.text !== true);
  const defaultSlot = slots.find((slot) => slot.default === true);
  const frame =
    content !== undefined
      ? `<div part="region" role="region" tabindex="0"><slot name="${content.name}"></slot></div>`
      : `<div part="list"><slot></slot></div>`;
  const hiddenDefault =
    content !== undefined && defaultSlot?.text === true ? "<slot hidden></slot>" : "";
  const hiddenNamed = slots
    .filter((slot) => slot.default !== true && slot.text === true)
    .map((slot) => `<slot name="${slot.name}" hidden></slot>`)
    .join("");
  return `${frame}${hiddenDefault}${hiddenNamed}<span id="fm-texts" hidden></span>`;
}

/**
 * The dash of an empty value (Spec 011 ④, D-10): a short line in the current colour, a sign of
 * the projection like the check mark — no text node (Art. VIII, ero-hardcoded-string).
 */
const DASH_SIGN =
  '<svg aria-hidden="true" viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 8h10"/></svg>';

/**
 * The arrow of a sort button (Spec 011 ④, D-09; Spec 014 ②, G3): the ikono sort-ascending in the
 * size of the sort indicator; the element names it sort-descending where the column is sorted so.
 */
const SORT_SIGN = '<fm-ikono name="sort-ascending" size="small"></fm-ikono>';

/**
 * The shadow markup of an icon (Spec 014 ②, plan ② D-05): the masked glyph is the control itself —
 * one part, so an Ero that composes an icon keeps one [part="control"] of its own (a locator that
 * pierces shadow roots finds the composing Ero's control alone).
 */
function iconMarkup(): string {
  return '<span part="glyph"></span><slot hidden></slot><span id="fm-texts" hidden></span>';
}

/**
 * The shadow markup of a heading (Spec 014 ③, plan ③ D-04): the text is the control — one part,
 * named text, so an Ero that composes a heading (the dialogo) keeps one [part="control"] of its own.
 * The level is written as aria-level in the render; the size derives from it where none is given.
 */
function headingMarkup(): string {
  return '<div part="text" role="heading"><slot></slot><span id="fm-texts" hidden></span></div>';
}

/**
 * The shadow markup of a paragraph (Spec 014 ③, plan ③ D-04): the platform's p is the control;
 * a kind of code takes the role code in the render, so it is spoken as code.
 */
function paragraphMarkup(): string {
  return '<p part="control"><slot></slot><span id="fm-texts" hidden></span></p>';
}

/**
 * The shadow markup of a tooltip (Spec 014 ④, plan ④ D-05): the host itself is the popover of the
 * platform (manual: shown and hidden by the element, never by a click elsewhere) with the role
 * tooltip — it lies in the light DOM, in the tree scope of its trigger, so the anchor name of the
 * trigger reaches it (an anchor in another tree scope is not found, B-7); the control inside is
 * the surface, its text the slot.
 */
function tooltipMarkup(): string {
  return '<div part="control"><slot></slot><span id="fm-texts" hidden></span></div>';
}

/**
 * The shadow markup of a popover (Spec 014 ④, plan ④ D-05): the slotted trigger, then the control
 * — a popover of the platform (auto: light dismiss and Escape are the platform's) with the role
 * dialog, non-modal — holding a composed titolo as heading (level 2, the layer is a document of
 * its own) and the content.
 */
function popoverMarkup(): string {
  return '<slot name="trigger"></slot><div part="control" role="dialog" popover="auto" tabindex="-1"><fm-titolo part="heading" id="heading" level="2" size="headline-4"><slot name="heading"></slot></fm-titolo><div part="content"><slot></slot></div><span id="fm-texts" hidden></span></div>';
}

/**
 * The shadow markup of a menu (Spec 014 ④, plan ④ D-05): the element's own trigger (a low butono
 * with the icon more, hidden while a trigger is slotted), the slotted trigger, and the control — a
 * popover of the platform with the role menu, whose rows the element makes per entry (manual slot
 * assignment, as the tabs): a button with the role menuitem, or a separator for a slotted
 * apartigilo. The default slot stays empty and hidden (the entries lie in the rows).
 */
function menuMarkup(): string {
  return '<fm-butono part="trigger" emphasis="low"><fm-ikono name="more"></fm-ikono></fm-butono><slot name="trigger"></slot><div part="control" role="menu" popover="auto"></div><slot hidden></slot><span id="fm-texts" hidden></span>';
}

/** One row of a menu (Spec 014 ④): a button with the role menuitem; one tab stop at a time. */
const MENU_ROW =
  '<button part="item" role="menuitem" type="button" tabindex="-1"><slot></slot></button>';

/** A group line of a menu (Spec 014 ④): the slotted apartigilo in a row of its own. */
const MENU_SEPARATOR = '<div part="separator" role="none"><slot></slot></div>';

/**
 * The shadow markup of a disclosure (Spec 014 ⑤, plan ⑤ D-03): the platform's details as the
 * control, its summary holding the summary slot and the chevron (an ikono that turns with the
 * state), the content below; a group is the details' name, so the platform opens one at a time.
 */
function disclosureMarkup(): string {
  return '<details part="control"><summary part="summary"><slot name="summary"></slot><fm-ikono part="indicator" name="chevron-right"></fm-ikono></summary><div part="content"><slot></slot></div><span id="fm-texts" hidden></span></details>';
}

/** One row of the suggestions (Spec 014 ⑤): an option of the listbox, chosen with the keys or a click. */
const SUGGESTION_ROW = '<div part="suggestion" role="option" aria-selected="false"></div>';

/** The shadow markup of a separator (Spec 014 ②, plan ② D-06): the line, nothing else. */
function separatorMarkup(): string {
  return '<div part="control"></div><slot hidden></slot><span id="fm-texts" hidden></span>';
}

/**
 * The shadow markup of tabs (Spec 011 ⑤, D-08): the tablist (named by the label prop in the
 * render) whose rows the element makes, one per child of the default slot (manual slot
 * assignment, as the radio group); the panel, a tabpanel labelled by the selected tab, around the
 * panel slot; the default slot stays empty and hidden (the children lie in the rows).
 */
/**
 * The shadow markup of a file input (Spec 015 ②, plan ② D-05): the field of the kampo — the
 * label with the mark of a required field, help and error below — around the platform's own file
 * input. The input lies over the button that chooses (a composed butono with the ikono upload,
 * inert: the input is the one target, the button its look), both in the picker; the dropzone
 * holds the picker and its hint; the error holder shows the slot and the element's own message;
 * the list of the chosen files follows, and a live region says how many there are.
 */
function uploadMarkup(): string {
  return `<div part="field"><label part="label" for="control"><slot></slot><span part="required-mark" aria-hidden="true">${REQUIRED_MARK}</span></label><div part="dropzone"><span part="picker"><fm-butono part="choose" emphasis="medium" inert><fm-ikono slot="icon-start" name="upload"></fm-ikono><span id="choose-text"></span></fm-butono><input part="control" id="control" type="file"></span><span part="drop-hint" id="drop-hint" hidden></span></div><span part="help" id="help" hidden><slot name="help"></slot></span><span part="error" id="error" hidden aria-live="polite"><slot name="error"></slot><span id="file-error"></span></span><ul part="file-list" hidden></ul><span part="count" role="status" aria-live="polite" class="fm-hidden"></span><span id="fm-texts" hidden></span></div>`;
}

/** One chosen file (Spec 015 ②): its name, its size and the butono that removes it. */
const FILE_ROW =
  '<li part="file"><span part="file-name"></span><span part="file-size"></span><fm-butono part="remove" emphasis="low" size="small"><fm-ikono slot="icon-start" name="close"></fm-ikono></fm-butono></li>';

/**
 * The shadow markup of a pagination (Spec 015 ①, plan ① D-03): the nav landmark around an ordered
 * list the element fills from page and total-pages — the arrow back, the pages, the arrow forth —
 * every item a button (mode button) or the platform's link (mode link).
 */
function paginationMarkup(): string {
  return '<nav part="list"><ol part="pages"></ol></nav><slot hidden></slot><span id="fm-texts" hidden></span>';
}

/**
 * The ellipsis of a pagination (Spec 015 ①, plan ① D-03): three dots in the current colour, a sign
 * of the projection like the dash of an empty value — no text node (Art. VIII, ero-hardcoded-string).
 */
const ELLIPSIS_SIGN =
  '<svg aria-hidden="true" viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>';

/** The chevron after a level of a breadcrumb (Spec 015 ①): decorative, mirrored in RTL. */
const BREADCRUMB_SEPARATOR =
  '<fm-ikono part="separator" name="chevron-right" aria-hidden="true"></fm-ikono>';

/** One item of a breadcrumb (Spec 015 ①): the slotted link and the chevron after it. */
const BREADCRUMB_ENTRY = `<li part="entry"><slot name="item-"></slot>${BREADCRUMB_SEPARATOR}</li>`;

function tabsMarkup(): string {
  return '<div part="control" role="tablist"></div><div part="panel" role="tabpanel" tabindex="0"><slot name="panel"></slot></div><slot hidden></slot><span id="fm-texts" hidden></span>';
}

/** One row of the tabs (Spec 011 ⑤, D-08): a button with role tab; its edge is the indicator. */
const TAB_ROW = '<button part="tab" role="tab" type="button"><slot></slot></button>';

/**
 * The shadow markup of an avatar (Spec 015 ③, plan ③ D-08): the control is the image of the
 * person, named by the name (or hidden where decorative); inside it the platform's img — empty
 * alt, the control carries the name — and the initials, both decorative; the element shows the
 * picture once it has loaded, else the initials.
 */
function avatarMarkup(): string {
  return '<span part="control"><img part="image" alt="" hidden><span part="initials" aria-hidden="true"></span></span><slot hidden></slot><span id="fm-texts" hidden></span>';
}

/**
 * The shadow markup of a card (Spec 015 ③, plan ③ D-04): the platform's article named by its
 * heading — a composed titolo at the card's level in the type role of the part heading — the media
 * edge to edge above (beside, horizontal) a body of heading, content, meta and actions; media,
 * meta and actions show only while they have content.
 */
function cardMarkup(): string {
  return '<article part="control" aria-labelledby="heading"><div part="media" hidden><slot name="media"></slot></div><div part="body"><fm-titolo part="heading" id="heading" level="2" size="headline-4"><slot name="heading"></slot></fm-titolo><div part="content"><slot></slot></div><div part="meta" hidden><slot name="meta"></slot></div><div part="actions" hidden><slot name="actions"></slot></div></div><span id="fm-texts" hidden></span></article>';
}

/** The shadow markup of the control: slots before the label (icon-start), the label, the rest. */
function markup(
  host: HostControl,
  slots: NonNullable<ElementNames["slots"]>,
  role: string,
  marked: boolean,
  indicator = false,
  dismiss = false,
  icon = false,
  breadcrumb = false,
): string {
  if (host === "text") return textMarkup(slots);
  if (host === "status") return statusMarkup(slots, indicator, dismiss, icon);
  if (host === "icon") return iconMarkup();
  if (host === "separator") return separatorMarkup();
  if (host === "heading") return headingMarkup();
  if (host === "paragraph") return paragraphMarkup();
  if (host === "tooltip") return tooltipMarkup();
  if (host === "popover") return popoverMarkup();
  if (host === "menu") return menuMarkup();
  if (host === "meter") return meterMarkup();
  if (host === "light") return lightMarkup(slots, role, breadcrumb);
  if (host === "pagination") return paginationMarkup();
  if (host === "upload") return uploadMarkup();
  if (host === "card") return cardMarkup();
  if (host === "avatar") return avatarMarkup();
  if (host === "tabs") return tabsMarkup();
  if (host === "input") return fieldMarkup(slots);
  if (host === "textarea") return fieldMarkup(slots, true);
  if (host === "suggest") return fieldMarkup(slots, false, true);
  if (host === "disclosure") return disclosureMarkup();
  if (host === "dialog") return dialogMarkup();
  if (host === "toggle") return toggleMarkup(role, slots, marked);
  if (host === "group") return groupMarkup(slots, marked);
  if (host === "select") return selectMarkup(slots, role);
  const before = slots.filter((slot) => slot.default !== true && slot.name.endsWith("-start"));
  const after = slots.filter((slot) => slot.default !== true && !slot.name.endsWith("-start"));
  const last = after.at(-1)?.name;
  const named = (slot: { name: string }) =>
    `<slot name="${slot.name}">${slot.name === last ? MARK : ""}</slot>`;
  const inner = `${before.map(named).join("")}<slot></slot>${after.map(named).join("")}<span id="fm-texts" hidden></span>`;
  return host === "a"
    ? `<a part="control">${inner}</a>`
    : `<button part="control" type="button">${inner}</button>`;
}

/** The TypeScript source of one element. */
export function elementSource({
  tag,
  className,
  constant,
  ero,
  inline,
  host = "button",
  role = "button",
  marked = false,
  indicator = false,
  dismiss = false,
  columnsFrom,
  ikonaro = [],
  skip = false,
  icon = false,
  breadcrumb = false,
  slots = [
    { name: "label", default: true },
    { name: "icon-start", decorative: true },
    { name: "icon-end", decorative: true },
  ],
}: ElementNames): string {
  const isLight = host === "light";
  const head =
    inline === true
      ? `const SKEMO = ${constant}_SKEMO;\nconst CSS = ${constant}_CSS;${isLight ? `\nconst LIGHT_CSS = ${constant}_LIGHT_CSS;` : ""}`
      : `import { ${constant}_SKEMO as SKEMO } from "./skemo.js";\nimport { ${constant}_CSS as CSS${isLight ? `, ${constant}_LIGHT_CSS as LIGHT_CSS` : ""} } from "./${ero}.styles.js";`;
  const control =
    host === "a"
      ? "a"
      : host === "input"
        ? "input"
        : host === "textarea"
          ? "textarea"
          : host === "dialog"
            ? "dialog"
            : host === "group"
              ? "[role=radiogroup]"
              : host === "select"
                ? "select"
                : host === "text"
                  ? "span"
                  : host === "status"
                    ? "div"
                    : host === "meter"
                      ? "div"
                      : host === "light"
                        ? "[part='region'], [part='list']"
                        : host === "tabs"
                          ? "[role=tablist]"
                          : host === "icon"
                            ? "span"
                            : host === "separator"
                              ? "div"
                              : host === "heading"
                                ? "[part='text']"
                                : host === "paragraph"
                                  ? "p"
                                  : host === "tooltip"
                                    ? "[part='control']"
                                    : host === "disclosure"
                                      ? "details"
                                      : host === "pagination"
                                        ? "[part='list']"
                                        : host === "suggest" || host === "upload"
                                          ? "input"
                                          : host === "card"
                                            ? "article"
                                            : host === "avatar"
                                              ? "[part='control']"
                                              : host === "popover"
                                                ? "[role=dialog]"
                                                : host === "menu"
                                                  ? "[role=menu]"
                                                  : "button";
  const isToggle = host === "toggle";
  const isGroup = host === "group";
  const isSelect = host === "select";
  const isSuggest = host === "suggest";
  const isUpload = host === "upload";
  const isDisclosure = host === "disclosure";
  const isFieldHost = host === "input" || host === "textarea" || isSuggest;
  // The platform element of a field: the generated code names it, so the types narrow (TS).
  const nativeField = host === "textarea" ? "HTMLTextAreaElement" : "HTMLInputElement";
  const isDialog = host === "dialog";
  const isStatus = host === "status";
  const isMeter = host === "meter";
  const isTabs = host === "tabs";
  const isPagination = host === "pagination";
  const isBreadcrumb = isLight && breadcrumb;
  const isNav = isLight && role === "navigation" && !breadcrumb;
  const isIcon = host === "icon";
  const isSeparator = host === "separator";
  const isHeading = host === "heading";
  const isParagraph = host === "paragraph";
  const isTooltip = host === "tooltip";
  const isPopover = host === "popover";
  const isMenu = host === "menu";
  const isOverlay = isTooltip || isPopover || isMenu;
  const isCard = host === "card";
  const isAvatar = host === "avatar";
  const isSkip = host === "a" && skip;
  const isStatic =
    isStatus ||
    host === "text" ||
    isMeter ||
    isLight ||
    isTabs ||
    isIcon ||
    isSeparator ||
    isHeading ||
    isParagraph ||
    isOverlay ||
    isDisclosure ||
    isPagination ||
    isCard ||
    isAvatar;
  const listSlot = slots.find((slot) => slot.list === true)?.name ?? "";
  const namedSlots = slots
    .filter((slot) => slot.default !== true && slot.decorative !== true)
    .map((slot) => slot.name);
  // Only the element of a toggle carries these lines (Spec 010 ①, D-09; ②, D-08).
  const toggleRender = isToggle
    ? `    // A toggle (Spec 010 ①, D-09): checked is spoken as aria-checked; in a form it sends "on"
    // under its name while checked and nothing while not, as a native checkbox does.
    const checked = this.propValue("checked") === true;
    control.setAttribute("aria-checked", String(checked));
    this.#internals.setFormValue(checked ? "on" : null);
    // A checkbox (Spec 010 ②, D-08): required is spoken as aria-required and is the validity of
    // the form — a required box left empty keeps the form from being sent, with the text of
    // a11y.texts.required as its message; invalid is spoken as aria-invalid and set by a filled
    // error slot (constraint of the Skemo).
    const required = this.propValue("required") === true;
    if (required) control.setAttribute("aria-required", "true");
    else control.removeAttribute("aria-required");
    const missing = TEXTS.required?.[this.#lingvo()] ?? TEXTS.required?.en ?? "";
    if (required && !checked && missing !== "") {
      this.#internals.setValidity({ valueMissing: true }, missing, control);
    } else {
      this.#internals.setValidity({});
    }
    if (HAS_PROP.has("invalid")) {
      const invalid = this.propValue("invalid") === true || this.#filled("error");
      if (invalid) control.setAttribute("aria-invalid", "true");
      else control.removeAttribute("aria-invalid");
    }
`
    : "";
  // A radio group (Spec 010 ③, D-06): the chosen row is the option whose value is the prop value —
  // selected is the state of the row (aria-checked), never of the group; one tab stop, the chosen
  // row or else the first; the chosen value is the form's, and a required group without a choice
  // keeps the form from being sent.
  const groupRender = isGroup
    ? `    const group = control;
    const rows = this.#rows();
    const values = this.#values();
    const value = this.propValue("value");
    const chosen = typeof value === "string" && value !== "" ? values.indexOf(value) : -1;
    const off = this.propValue("disabled") === true;
    rows.forEach((row, index) => {
      row.setAttribute("aria-checked", String(index === chosen));
      row.tabIndex = !off && index === (chosen === -1 ? 0 : chosen) ? 0 : -1;
      if (off) row.setAttribute("aria-disabled", "true");
      else row.removeAttribute("aria-disabled");
    });
    if (off) group.setAttribute("aria-disabled", "true");
    else group.removeAttribute("aria-disabled");
    const orientation = this.propValue("orientation");
    group.setAttribute("aria-orientation", typeof orientation === "string" ? orientation : "vertical");
    this.#internals.setFormValue(chosen === -1 ? null : (values[chosen] ?? null));
    const required = this.propValue("required") === true;
    if (required) group.setAttribute("aria-required", "true");
    else group.removeAttribute("aria-required");
    const missing = TEXTS.required?.[this.#lingvo()] ?? TEXTS.required?.en ?? "";
    const first = rows[0];
    if (required && chosen === -1 && missing !== "" && first !== undefined) {
      this.#internals.setValidity({ valueMissing: true }, missing, first);
    } else {
      this.#internals.setValidity({});
    }
    const invalid = this.propValue("invalid") === true || this.#filled("error");
    if (invalid) group.setAttribute("aria-invalid", "true");
    else group.removeAttribute("aria-invalid");
`
    : "";
  // A select (Spec 010 ④, D-06): the options of the light DOM become the platform's options of the
  // select, in their order; while no option is chosen the select shows the placeholder as a
  // disabled first option without a value — the prompt, which cannot be chosen back. The chosen
  // value is the form's, and a required select without a choice keeps the form from being sent.
  const selectRender = isSelect
    ? `    const select = control as HTMLSelectElement;
    const entries = this.#entries();
    const value = this.propValue("value");
    const wanted = typeof value === "string" ? value : "";
    const chosen = wanted === "" ? -1 : entries.findIndex((entry) => entry.value === wanted);
    const placeholder = this.propValue("placeholder");
    // The empty option (Spec 011 ①, plan ① D-09): with empty-label the first option is a real one
    // — the value "", the text of empty-label, chosen while nothing else is, never disabled — and
    // there is no prompt beside it (the Skemo forbids both, the empty option wins).
    const emptyLabel = this.propValue("empty-label");
    const empty = typeof emptyLabel === "string" && emptyLabel !== "";
    const options = [
      ...(empty
        ? [{ value: "", text: emptyLabel, prompt: false }]
        : chosen === -1
          ? [{ value: "", text: typeof placeholder === "string" ? placeholder : "", prompt: true }]
          : []),
      ...entries.map((entry) => ({ ...entry, prompt: false })),
    ];
    const same =
      select.options.length === options.length &&
      options.every((option, index) => {
        const present = select.options[index];
        return (
          present !== undefined &&
          present.value === option.value &&
          present.text === option.text &&
          present.disabled === option.prompt
        );
      });
    if (!same) {
      select.replaceChildren(
        ...options.map((option) => {
          const element = document.createElement("option");
          element.value = option.value;
          element.textContent = option.text;
          element.disabled = option.prompt;
          return element;
        }),
      );
    }
    select.selectedIndex = chosen === -1 ? 0 : chosen + (empty ? 1 : 0);
    this.#internals.setFormValue(chosen === -1 ? (empty ? "" : null) : (entries[chosen]?.value ?? null));
    const formName = this.propValue("name");
    if (typeof formName === "string" && formName !== "") select.setAttribute("name", formName);
    else select.removeAttribute("name");
    const required = this.propValue("required") === true;
    // B-1 (Abnahme 014 ①, Spec 015 ② D-11): no required on the native control — the platform would show its validationMessage as a bubble; the validity is the Ero's (ElementInternals).
    select.required = false;
    if (required) select.setAttribute("aria-required", "true");
    else select.removeAttribute("aria-required");
    const missing = TEXTS.required?.[this.#lingvo()] ?? TEXTS.required?.en ?? "";
    if (required && chosen === -1 && missing !== "") {
      this.#internals.setValidity({ valueMissing: true }, missing, select);
    } else {
      this.#internals.setValidity({});
    }
    const invalid = this.propValue("invalid") === true || this.#filled("error");
    if (invalid) select.setAttribute("aria-invalid", "true");
    else select.removeAttribute("aria-invalid");
`
    : "";
  // The constructor of a select (Spec 010 ④, D-06): it follows the options of the light DOM, and a
  // choice in the platform's list is the prop value; input comes from the select itself (composed),
  // change is said again by the element, because the select's own does not leave the shadow root.
  const selectInit = isSelect
    ? `    new MutationObserver(() => this.#render()).observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["slot", "value"],
    });
    control.addEventListener("change", () => {
      const chosen = (control as HTMLSelectElement).value;
      if (this.getAttribute("value") !== chosen) this.setAttribute("value", chosen);
      this.dispatchEvent(new Event("change", { bubbles: true }));
    });
`
    : "";
  // The methods of a select (Spec 010 ④, D-06): its options, read from the light DOM.
  const selectMethods = isSelect
    ? `
  /** The options of the select: every child in the slot of the options, its value and its text. */
  #entries(): { value: string; text: string }[] {
    return [...this.children]
      .filter((child) => child.getAttribute("slot") === "${listSlot}")
      .map((child) => {
        const text = child.textContent?.trim() ?? "";
        return { value: child.getAttribute("value") ?? text, text };
      });
  }
`
    : "";
  // The constructor of a radio group: it assigns the children to the slots and follows them, and
  // the arrow keys move and choose (Spec 010 ③, D-06).
  const groupInit = isGroup
    ? `    new MutationObserver(() => {
      this.#assign();
      this.#render();
    }).observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["slot", "value"],
    });
    control.addEventListener("keydown", (event) => this.#key(event));
`
    : "";
  // The methods of a radio group (Spec 010 ③, D-06): its rows and their values, the assignment of
  // the children, the keys of the Skemo, the choice.
  const groupMethods = isGroup
    ? `
  /** Focus goes to the one tab stop of the group: the chosen row, else the first. */
  override focus(options?: FocusOptions): void {
    const rows = this.#rows();
    (rows.find((row) => row.tabIndex === 0) ?? rows[0])?.focus(options);
  }

  /** The rows of the group, one per option. */
  #rows(): HTMLElement[] {
    return [...(this.shadowRoot?.querySelectorAll('[part="option"]') ?? [])] as HTMLElement[];
  }

  /** The value of each option: its attribute value, else its text. */
  #values(): string[] {
    return this.#rows().map((row) => {
      const option = row.querySelector("slot")?.assignedNodes()[0];
      return option instanceof Element
        ? (option.getAttribute("value") ?? option.textContent?.trim() ?? "")
        : "";
    });
  }

  /**
   * Assigns the children to the slots (manual slot assignment): every child in the slot of the
   * options to a row of its own, made here; the others by their slot name, the rest to the label.
   */
  #assign(): void {
    const shadow = this.shadowRoot;
    if (shadow === null) return;
    const label: (Element | Text)[] = [];
    const options: Element[] = [];
    const named = new Map<string, (Element | Text)[]>();
    for (const node of this.childNodes) {
      if (!(node instanceof Element) && !(node instanceof Text)) continue;
      const slot = node instanceof Element ? node.getAttribute("slot") : null;
      if (slot === null) label.push(node);
      else if (slot === "${listSlot}" && node instanceof Element) options.push(node);
      else named.set(slot, [...(named.get(slot) ?? []), node]);
    }
    this.#label.assign(...label);
    for (const holder of shadow.querySelectorAll("slot[name]")) {
      (holder as HTMLSlotElement).assign(...(named.get(holder.getAttribute("name") ?? "") ?? []));
    }
    const list = shadow.querySelector('[part="options"]');
    if (!(list instanceof HTMLElement)) return;
    while (list.children.length > options.length) list.lastElementChild?.remove();
    while (list.children.length < options.length) {
      list.insertAdjacentHTML("beforeend", \`${rowMarkup(role)}\`);
    }
    options.forEach((option, index) => {
      list.children[index]?.querySelector("slot")?.assign(option);
    });
  }

  /** The keys of the Skemo: the arrows move and choose, wrapping around; Space chooses. */
  #key(event: KeyboardEvent): void {
    const key = event.key === " " ? "Space" : event.key;
    if (!KEYS.includes(key) || this.propValue("disabled") === true) return;
    const rows = this.#rows();
    if (rows.length === 0) return;
    const row = event.composedPath().find(
      (node) => node instanceof HTMLElement && node.getAttribute("part") === "option",
    );
    const at = Math.max(0, rows.indexOf(row as HTMLElement));
    const next =
      key === "ArrowDown" || key === "ArrowRight"
        ? (at + 1) % rows.length
        : key === "ArrowUp" || key === "ArrowLeft"
          ? (at - 1 + rows.length) % rows.length
          : key === "Space"
            ? at
            : undefined;
    if (next === undefined) return;
    event.preventDefault();
    this.#choose(next);
  }

  /** Chooses the option of a row: its value is the prop value; input and change, as a radio. */
  #choose(index: number): void {
    const row = this.#rows()[index];
    const value = this.#values()[index];
    if (row === undefined || value === undefined) return;
    row.focus();
    if (this.getAttribute("value") === value) return;
    this.setAttribute("value", value);
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }
`
    : "";
  // A checkbox turns with Space alone (Spec 010 ②, D-08): the Skemo names its keys, and Enter on a
  // native button would turn it too.
  const toggleKeys = isToggle
    ? `    if (!KEYS.includes("Enter")) {
      control.addEventListener("keydown", (event) => {
        if (event.key === "Enter") event.preventDefault();
      });
    }
`
    : "";
  // A button submits or resets its form (type); a toggle turns instead.
  const toggleActivate = isToggle
    ? `    // A toggle (Spec 010 ①, D-09): every activation — pointer, Space, Enter where the Skemo
    // names it, a click on the label — turns it; the element says so with input and change, as a
    // native checkbox does.
    this.toggleAttribute("checked", this.propValue("checked") !== true);
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true }));
`
    : `    const type = this.propValue("type");
    const form = this.#internals.form;
    if (form === null) return;
    if (type === "submit") form.requestSubmit();
    else if (type === "reset") form.reset();
`;
  // Enter sends the form (Spec 011 ①, O-7), as it does in a native one-line input: the input lies
  // in the shadow tree, so the platform's implicit submission does not reach the form around the
  // element; the form checks its validity first and sends once. Only the element of a textbox.
  // A field shows its error once a person has touched it — typed into it — or once the form was
  // sent and the platform said invalid on the host (Spec 011 ② F-8); an empty, untouched required
  // field shows none, as the other fields of a form.
  const invalidReport =
    isFieldHost || isUpload
      ? `    this.addEventListener("invalid", () => {
      this.#reported = true;
      this.#render();
    });
    control.addEventListener("input", () => {
      if (this.#reported) return;
      this.#reported = true;
      this.#render();
    });
`
      : "";
  const inputEnter =
    host === "input"
      ? `    control.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || !KEYS.includes("Enter")) return;
      const form = this.#internals.form;
      if (form === null) return;
      event.preventDefault();
      form.requestSubmit();
    });
`
      : "";
  // The render of a field (Spec 009, D-08; Spec 011 ①, E8, O-7): only the element of a textbox
  // carries these lines — the kinds, the attributes and the validity need the field's methods.
  const inputRender = isFieldHost
    ? `    if (control instanceof ${nativeField}) {
      const kind = String(this.propValue("kind") ?? "text");
${
  host === "input" || isSuggest
    ? `      // A number is a text input with a numeric keyboard and a whole-number pattern (Spec 011 ①,
      // E8; GOV.UK: type=number changes its value with the wheel and the arrows); a date is the
      // platform's own dialog; a password hides what is typed. Nachlese 5 O-14: an address and a
      // web address are text inputs like the number, each with the keyboard of its kind — the
      // platform would judge their form on the native input and show its message as a bubble.
      // Every other kind is its type.
      const inputMode = kind === "number" ? "numeric" : kind === "email" || kind === "url" ? kind : "";
      control.type = inputMode === "" ? kind : "text";
      // B-1 (Spec 015 ② D-11): no pattern on the native input; the element checks the whole number
      // itself (#validate), so the platform has no message to show as a bubble.
      control.removeAttribute("pattern");
      if (inputMode !== "") control.setAttribute("inputmode", inputMode);
      else control.removeAttribute("inputmode");
      // What the platform fills in, and the bounds of a number or a date. The element checks both
      // bounds itself (#validate); on a date they stand for the platform's dialog only, and only
      // while the date lies within them (O-14), so the native input is never invalid for a bound.
      const dateOutside = kind === "date" && this.#dateOutside(String(this.propValue("value") ?? ""), this.propValue("min"), this.propValue("max")) !== "";
      for (const attribute of ["autocomplete", "min", "max"]) {
        const given = this.propValue(attribute);
        const bound = attribute !== "autocomplete";
        if (typeof given === "string" && given !== "" && !(bound && dateOutside)) control.setAttribute(attribute, given);
        else control.removeAttribute(attribute);
      }
`
    : `      // A text area (Spec 011 ②, D-11): rows is its height; code is written without the
      // platform's spelling check, in the code typography the stylesheet binds.
      const rows = this.propValue("rows");
      control.setAttribute("rows", String(rows ?? ""));
      if (kind === "code") control.setAttribute("spellcheck", "false");
      else control.removeAttribute("spellcheck");
`
}      const value = this.propValue("value");
      const text = typeof value === "string" ? value : "";
${
  isSuggest
    ? `      // The field shows the words of the chosen suggestion; the form carries its value.
      const shown = this.#entries().find((entry) => entry.value === text)?.text ?? text;
      if (control.value !== shown) control.value = shown;`
    : `      if (control.value !== text) control.value = text;`
}
      this.#internals.setFormValue(text);
      const placeholder = this.propValue("placeholder");
      if (typeof placeholder === "string" && placeholder !== "") control.setAttribute("placeholder", placeholder);
      else control.removeAttribute("placeholder");
      const formName = this.propValue("name");
      if (typeof formName === "string" && formName !== "") control.setAttribute("name", formName);
      else control.removeAttribute("name");
      const required = this.propValue("required") === true;
      // B-1 (Abnahme 014 ①, Spec 015 ② D-11): no required on the native control — the platform would show its validationMessage as a bubble; the validity is the Ero's (ElementInternals).
      control.required = false;
      if (required) control.setAttribute("aria-required", "true");
      else control.removeAttribute("aria-required");
      const disabled = this.propValue("disabled") === true;
      control.readOnly = !disabled && this.propValue("readonly") === true;
      const invalid = this.propValue("invalid") === true || this.#filled("error");
      this.#validate(control, kind, text, required, invalid);
    }
`
    : "";
  // The methods of a field (Spec 011 ①, O-7): its validity in the form, the message of the error
  // slot, the platform's own message for a number out of its bounds, and the reset of the form.
  const inputMethods = isFieldHost
    ? `
  /** The text of the error slot: the message of the form while the field is invalid. */
  #errorText(): string {
    const slot = this.shadowRoot?.querySelector('slot[name="error"]');
    return slot instanceof HTMLSlotElement
      ? slot
          .assignedNodes({ flatten: true })
          .map((node) => node.textContent ?? "")
          .join("")
          .trim()
      : "";
  }

  /**
   * The validity of the field in its form (Spec 011 ①, O-7, E8): a required field left empty, a
   * number that is no whole number or lies outside min and max, and a date the platform refuses
   * keep the form from being sent. The message is the error slot's text (error-says-what-to-do),
   * else the text of a11y.texts.required or the platform's own; the control says aria-invalid.
   */
  #validate(control: HTMLInputElement | HTMLTextAreaElement, kind: string, text: string, required: boolean, invalid: boolean): void {
    const own = this.#errorText();
    let flags: ValidityStateFlags = {};
    let message = own;
    if (required && text === "") {
      flags = { valueMissing: true };
      if (own === "") message = TEXTS.required?.[this.#lingvo()] ?? TEXTS.required?.en ?? "";
    }${
      isSuggest
        ? ` else if (text !== "" && this.propValue("allow-free") !== true && !this.#entries().some((entry) => entry.value === text || entry.text === text)) {
      // Spec 014 ⑤: without allow-free the value is one of the suggestions.
      flags = { badInput: true };
      if (own === "") message = TEXTS["options-empty"]?.[this.#lingvo()] ?? TEXTS["options-empty"]?.en ?? "";
    }`
        : ""
    } else if (kind === "number" && text !== "" && !/^-?[0-9]+$/.test(text)) {
      flags = { patternMismatch: true };
      if (own === "") message = this.#patternMessage(text);
    } else if (kind === "number" && text !== "") {
      const number = Number(text);
      const min = this.propValue("min");
      const max = this.propValue("max");
      if (typeof min === "string" && min !== "" && number < Number(min)) flags = { rangeUnderflow: true };
      else if (typeof max === "string" && max !== "" && number > Number(max)) flags = { rangeOverflow: true };
      if (own === "") message = this.#platformMessage(text, min, max);
    } else if (kind === "date" && control.validity.badInput) {
      // A date typed only in part: the platform knows it, and only the platform can say it.
      flags = { badInput: true };
      if (own === "") message = control.validationMessage;
    } else if (kind === "date" && text !== "") {
      // Nachlese 5 O-14: the bounds of a date are the element's, as those of a whole number: a date
      // is YYYY-MM-DD, which compares as text; the words are a probe date's.
      const min = this.propValue("min");
      const max = this.propValue("max");
      const outside = this.#dateOutside(text, min, max);
      if (outside === "under") flags = { rangeUnderflow: true };
      else if (outside === "over") flags = { rangeOverflow: true };
      if (outside !== "" && own === "") message = this.#probeMessage("date", text, min, max);
    } else if ((kind === "email" || kind === "url") && text !== "" && this.#formMismatch(kind, text)) {
      // Nachlese 5 O-14: the form of an address or a web address is judged by a probe of its kind,
      // with the platform's grammar and words (the shown input is a text input).
      flags = { typeMismatch: true };
      if (own === "") message = this.#probeMessage(kind, text, undefined, undefined);
    }
    const wrong = Object.values(flags).some((flag) => flag === true);
    if (wrong && message !== "") this.#internals.setValidity(flags, message, control);
    else this.#internals.setValidity({});
    // Spec 011 ② F-8: an empty required field a person has not touched shows no error — the
    // form's validity holds it back, but aria-invalid (and the error border) comes only with the
    // prop invalid, a filled error slot, or once the field was touched or the form reported it
    // (the platform's invalid event on sending), as the other fields of a form do.
    if (invalid || (wrong && this.#reported)) control.setAttribute("aria-invalid", "true");
    else control.removeAttribute("aria-invalid");
  }

  /**
   * The platform's own words for a whole number outside its bounds, asked of a number input that
   * is never shown (the shown one is a text input, E8): no text of the element's own (Art. VIII).
   */
  #platformMessage(text: string, min: Value | undefined, max: Value | undefined): string {
    const probe = document.createElement("input");
    probe.type = "number";
    probe.step = "1";
    if (typeof min === "string" && min !== "") probe.min = min;
    if (typeof max === "string" && max !== "") probe.max = max;
    probe.value = text;
    return probe.validationMessage;
  }

  /**
   * Where a date lies against its bounds (Nachlese 5 O-14): "under", "over" or "" — compared as
   * text, which YYYY-MM-DD allows; a value or a bound that is no such date compares to nothing.
   */
  #dateOutside(text: string, min: Value | undefined, max: Value | undefined): "" | "under" | "over" {
    const day = /^\\d{4}-\\d{2}-\\d{2}$/;
    if (!day.test(text)) return "";
    if (typeof min === "string" && day.test(min) && text < min) return "under";
    if (typeof max === "string" && day.test(max) && text > max) return "over";
    return "";
  }

  /**
   * Whether a text lacks the form of an address or a web address (Nachlese 5 O-14), judged by an
   * input of that kind no one sees: the platform's grammar, not the element's.
   */
  #formMismatch(kind: string, text: string): boolean {
    const probe = document.createElement("input");
    probe.type = kind;
    probe.value = text;
    return probe.validity.typeMismatch;
  }

  /**
   * The platform's own words for a value of a kind (Nachlese 5 O-14: a date out of its bounds, an
   * address or a web address without its form), asked of an input of that kind that is never
   * shown: no text of the element's own (Art. VIII).
   */
  #probeMessage(kind: string, text: string, min: Value | undefined, max: Value | undefined): string {
    const probe = document.createElement("input");
    probe.type = kind;
    if (typeof min === "string" && min !== "") probe.min = min;
    if (typeof max === "string" && max !== "") probe.max = max;
    probe.value = text;
    return probe.validationMessage;
  }

  /**
   * The platform's own words for a text that is no whole number, asked of an input that is never
   * shown (B-1, Spec 015 ② D-11: the shown one carries no pattern, so it shows no bubble).
   */
  #patternMessage(text: string): string {
    const probe = document.createElement("input");
    probe.pattern = "-?[0-9]+";
    probe.value = text;
    return probe.validationMessage;
  }

  /** A reset of the form empties the field, as it empties a native input. */
  formResetCallback(): void {
    this.#reported = false;
    this.removeAttribute("value");
  }

  /** The validity of the field, as a native input exposes it (ElementInternals). */
  get validity(): ValidityState {
    return this.#internals.validity;
  }

  /** The message of the validity, as a native input exposes it. */
  get validationMessage(): string {
    return this.#internals.validationMessage;
  }

  /** Whether the field is valid; fires invalid when it is not, as a native input does. */
  checkValidity(): boolean {
    return this.#internals.checkValidity();
  }
`
    : "";
  // The constructor of a dialog (Spec 011 ②, D-12): the platform's cancel (Escape) and close say
  // cancel and take open back; a click on a slotted action confirms (emphasis high) or cancels;
  // every input in the content or the reason area re-judges the lock of the confirmation.
  const dialogInit = isDialog
    ? `    control.addEventListener("cancel", (event) => {
      event.preventDefault();
      this.#cancel();
    });
    control.addEventListener("close", () => {
      // The platform fires close after the dialog closed (a task later). A dialog shown again in
      // between is open now: the late event takes nothing back (Spec 011 ③ Nachbesserung, CI-Lauf
      // 38976295942: cancel, then open again in one go, and the confirmation vanished).
      if ((control as HTMLDialogElement).open) return;
      if (this.hasAttribute("open")) this.removeAttribute("open");
    });
    root.querySelector('[part="actions"]')?.addEventListener("click", (event) => {
      const action = event
        .composedPath()
        .find((node) => node instanceof HTMLElement && node.tagName.toLowerCase() === "fm-butono");
      if (!(action instanceof HTMLElement) || action.hasAttribute("disabled")) return;
      if (action.getAttribute("emphasis") === "high") this.#confirm();
      else this.#cancel();
    });
    root.addEventListener("input", () => this.#lock());
    this.addEventListener("input", () => this.#lock());
`
    : "";
  // The render of a dialog (Spec 011 ②, D-12, E9): open shows it modal (the focus trap and the
  // top layer are the platform's), the first field of the content takes the focus, else the reason
  // area, else the confirmation; the reason area is shown only with a reason, required when the
  // reason is; the confirmation is locked while a required reason is empty or a field in the
  // content is invalid.
  const dialogRender = isDialog
    ? `    const dialog = control as HTMLDialogElement;
    const reason = String(this.propValue("reason") ?? "none");
    const area = this.#reasonArea();
    if (area !== undefined) {
      area.toggleAttribute("required", reason === "required");
      area.toggleAttribute("hidden", reason === "none");
    }
    const open = this.propValue("open") === true;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
    // The children of a parsed element arrive after it connects: the render runs again on every
    // slotchange, and the focus is set while nothing inside the dialog has it (the dialog itself
    // takes it from showModal when it has no focusable child yet).
    if (dialog.open) {
      const active = this.shadowRoot?.activeElement;
      if (active === null || active === undefined || active === dialog) this.#focusFirst();
    }
    this.#lock();
`
    : "";
  const dialogMethods = isDialog
    ? `
  /** The reason area the dialog shows itself: a tekstareo in its shadow tree. */
  #reasonArea(): HTMLElement | undefined {
    const area = this.shadowRoot?.querySelector('[part="reason"]');
    return area instanceof HTMLElement ? area : undefined;
  }

  /** The text of the reason, read from the area; empty without a reason. */
  #reasonText(): string {
    const area = this.#reasonArea();
    const value = area === undefined ? undefined : (area as HTMLElement & { value?: unknown }).value;
    return typeof value === "string" ? value.trim() : "";
  }

  /** The slotted actions: every fm-butono in the slot actions; the one with emphasis high confirms. */
  #actions(): HTMLElement[] {
    return [...this.children].filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement &&
        child.getAttribute("slot") === "actions" &&
        child.tagName.toLowerCase() === "fm-butono",
    );
  }

  /** Whether the confirmation is locked: a required reason without text, an invalid field in the content. */
  #locked(): boolean {
    if (this.propValue("reason") === "required" && this.#reasonText() === "") return true;
    return [...this.children].some(
      (child) => child.getAttribute("slot") === "content" && child.matches(":invalid"),
    );
  }

  /** Writes the lock on the confirming action (disabled), and takes it back. */
  #lock(): void {
    const locked = this.#locked();
    for (const action of this.#actions()) {
      if (action.getAttribute("emphasis") !== "high") continue;
      if (locked) {
        if (!action.hasAttribute("disabled")) {
          action.setAttribute("disabled", "");
          action.setAttribute("data-fm-locked", "");
        }
      } else if (action.hasAttribute("data-fm-locked")) {
        action.removeAttribute("disabled");
        action.removeAttribute("data-fm-locked");
      }
    }
  }

  /** The focus on opening (G4): the first field of the content, else the reason area, else the confirmation. */
  #focusFirst(): void {
    const field = [...this.children].find(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.getAttribute("slot") === "content",
    );
    const reason = this.propValue("reason") === "none" ? undefined : this.#reasonArea();
    const confirm = this.#actions().find((action) => action.getAttribute("emphasis") === "high");
    (field ?? reason ?? confirm ?? this.#actions()[0])?.focus();
  }

  /** Confirms: the event carries the reason and may be prevented, then the dialog stays open. */
  #confirm(): void {
    if (this.#locked()) return;
    const event = new CustomEvent("confirm", { bubbles: true, cancelable: true, detail: { reason: this.#reasonText() } });
    const go = this.dispatchEvent(event);
    if (go) this.removeAttribute("open");
  }

  /** Cancels: the dialog closes, the application hears cancel. */
  #cancel(): void {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("cancel", { bubbles: true }));
  }
`
    : "";
  // The constructor of a live region (Spec 011 ③, D-09): a click on the dismiss butono the notice
  // shows itself says dismiss.
  const statusInit =
    isStatus && dismiss
      ? `    root.querySelector('[part="dismiss"]')?.addEventListener("click", (event) => {
      event.stopPropagation();
      this.#dismiss();
    });
`
      : "";
  // The render of a live region (Spec 011 ③, D-09, D-10, G4): the role follows intent (danger is
  // an alert), busy follows kind (loading); every named slot shows while it has content; the
  // dismiss butono shows while dismissible and is named by a11y.texts.dismissible; the indicator
  // turns while loading.
  const statusRender = isStatus
    ? `    if (HAS_PROP.has("intent")) {
      const intent = this.propValue("intent");
      control.setAttribute("role", intent === "danger" ? "alert" : "status");
    }
    if (HAS_PROP.has("kind")) {
      const kind = this.propValue("kind");
      control.setAttribute("aria-busy", String(kind === "loading"));
    }
    for (const name of NAMED_SLOTS) {
      const holder = this.shadowRoot?.getElementById(name);
      if (holder instanceof HTMLElement) holder.hidden = !this.#filled(name);
    }
${
  dismiss
    ? `    const closer = this.shadowRoot?.querySelector('[part="dismiss"]');
    if (closer instanceof HTMLElement) {
      const shown = HAS_PROP.has("dismissible") && this.propValue("dismissible") === true;
      closer.hidden = !shown;
      const word = TEXTS.dismissible;
      const name = word?.[this.#lingvo()] ?? word?.en ?? "";
      if (name !== "") closer.setAttribute("label", name);
    }
`
    : ""
}${indicator ? "    this.#spin();\n" : ""}`
    : "";
  const statusMethods = isStatus
    ? `${
        dismiss
          ? `
  /**
   * Dismisses the notice (Spec 011 ③, D-09): the event may be prevented, then the notice stays;
   * otherwise the notice hides itself and the focus goes to the next focusable element of the
   * page after it, else to the one before it — the person is never left on nothing.
   */
  #dismiss(): void {
    const go = this.dispatchEvent(new CustomEvent("dismiss", { bubbles: true, cancelable: true }));
    if (!go) return;
    const next = this.#neighbour();
    this.setAttribute("hidden", "");
    next?.focus();
  }

  /** The focusable element after the notice in document order, else the one before it. */
  #neighbour(): HTMLElement | undefined {
    const candidates = [...document.querySelectorAll<HTMLElement>("*")].filter(
      (element) =>
        !this.contains(element) &&
        !element.hidden &&
        !element.hasAttribute("disabled") &&
        element.closest("[hidden]") === null &&
        (element.tagName.includes("-") ||
          element.matches('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')),
    );
    const after = candidates.find(
      (element) => this.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
    const before = candidates
      .filter((element) => this.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING)
      .at(-1);
    return after ?? before;
  }
`
          : ""
      }${
        indicator
          ? `
  /**
   * Turns the indicator while loading (Spec 011 ③, D-10): one turn per duration of the motion
   * role the stylesheet binds (read from the transition of the control), with its easing, for ever;
   * under reduced motion the duration role is instant and nothing turns (motion-reduced-instant).
   */
  #spin(): void {
    const indicator = this.shadowRoot?.querySelector('[part="indicator"]');
    if (!(indicator instanceof HTMLElement)) return;
    const running = indicator.getAnimations();
    const style = getComputedStyle(this.#control);
    const raw = style.transitionDuration.split(",")[0]?.trim() ?? "0s";
    const duration = Number.parseFloat(raw) * (raw.endsWith("ms") ? 1 : 1000);
    // The first easing of the list, a keyword or a function with its arguments (never split at
    // the commas inside cubic-bezier()).
    const easing = /^[a-z-]+(?:\\([^)]*\\))?/.exec(style.transitionTimingFunction)?.[0] ?? "linear";
    const turning = this.isConnected && this.propValue("kind") === "loading" && duration > 0;
    if (!turning) {
      for (const animation of running) animation.cancel();
      return;
    }
    if (running.length > 0) return;
    indicator.animate([{ transform: "rotate(0turn)" }, { transform: "rotate(1turn)" }], {
      duration,
      easing,
      iterations: Number.POSITIVE_INFINITY,
    });
  }
`
          : ""
      }`
    : "";
  // The render of a meter (Spec 011 ④, D-08, G4): the range and the value spoken as the platform
  // speaks a meter; an unknown value has no aria-valuenow and marks the control, so the track shows
  // the dashed edge of the part unknown and no fill; the fill's inline size is the share of the
  // range (a ratio the element computes, no design value); the value text is the aria-valuetext.
  const meterRender = isMeter
    ? `    const min = Number(this.propValue("min") ?? 0);
    const max = Number(this.propValue("max") ?? 100);
    const rawValue = this.propValue("value");
    const known = typeof rawValue === "string" && rawValue.trim() !== "" && Number.isFinite(Number(rawValue));
    control.setAttribute("aria-valuemin", String(min));
    control.setAttribute("aria-valuemax", String(max));
    // ARIA requires aria-valuenow on a meter (axe aria-required-attr): an unknown value says the
    // start of the range as its number and its text as what is heard ("nicht geprüft"), so no one
    // hears 0 (plan ④ D-08, Abweichung 13).
    control.setAttribute("aria-valuenow", String(known ? Number(rawValue) : min));
    // A presence attribute, not a value: the parity inventory reads data-<prop>="…" as props.
    control.toggleAttribute("data-unknown", !known);
    const share = known && max > min ? Math.min(1, Math.max(0, (Number(rawValue) - min) / (max - min))) : 0;
    const fill = this.shadowRoot?.querySelector('[part="fill"]');
    if (fill instanceof HTMLElement) fill.style.inlineSize = \`\${share * 100}%\`;
    control.setAttribute("aria-valuetext", this.#slotText("value-text"));
`
    : "";
  // The render of a light-DOM host (Spec 011 ④, D-09, D-10, E10): the platform's own table or
  // list in the light DOM gets what the Ero adds — the caption from the default slot (hidden from
  // sight with caption-hidden, never missing) and the region's name, the sort buttons in the
  // headers that carry data-sort with aria-sort on the sorted column, the numeric mark on the
  // cells of a numeric column, the empty state as a plenstato over all columns while there are no
  // rows; the dash and the a11y text of an empty value, the name of the list. Every write checks
  // what stands there, so the observer of the light DOM does not loop.
  // Layout auto (Spec 014 ①, plan ① D-03): a list whose Uzo names columns-from resolves auto to
  // columns or stacked by its own inline size, after the enums are written on the host.
  const isAuto = isLight && columnsFrom !== undefined;
  // Spec 015 ③ (plan ③ D-04): a horizontal card stacks below the Uzo's columns-from, measured as
  // layout auto measures its width.
  const isStacking = isCard && columnsFrom !== undefined;
  const observesSize = isAuto || isStacking;
  const lightRender = isLight
    ? `    this.#decorate();
${isAuto ? "    this.#autoLayout();\n" : ""}`
    : "";
  const autoConstant = observesSize
    ? `/** The width from which layout auto lays name and value side by side, a card its media beside its body (Spec 014 ①, Spec 015 ③: the Uzo's columns-from). */
const COLUMNS_FROM = ${JSON.stringify(columnsFrom)};
`
    : "";
  const autoField = observesSize
    ? "  /** Observes the inline size of the element while its layout is auto (Spec 014 ①) or it is a horizontal card (Spec 015 ③). */\n  #sizes: ResizeObserver | undefined;\n"
    : "";
  const autoDisconnect = observesSize
    ? `
  disconnectedCallback(): void {
    this.#sizes?.disconnect();
    this.#sizes = undefined;
  }
`
    : "";
  const autoMethods = isStacking
    ? `
  /**
   * A horizontal card (Spec 015 ③, plan ③ D-04): the media beside the body while the element is
   * at least as wide as the Uzo's columns-from, else stacked like a vertical card — measured as
   * layout auto measures (a container query takes no var()). A class marks the stacked card, no
   * data attribute: the parity inventory reads data-* as props of the Skemo.
   */
  #autoLayout(): void {
    const control = this.#control;
    if (this.propValue("orientation") !== "horizontal" || !this.isConnected) {
      this.#sizes?.disconnect();
      this.#sizes = undefined;
      control.classList.remove("fm-stacked");
      return;
    }
    if (this.#sizes === undefined) {
      this.#sizes = new ResizeObserver(() => requestAnimationFrame(() => this.#autoLayout()));
      this.#sizes.observe(this);
    }
    const style = getComputedStyle(this);
    const box = this.getBoundingClientRect();
    const inline = style.writingMode.startsWith("horizontal") ? box.width : box.height;
    const raw = style.getPropertyValue(COLUMNS_FROM).trim();
    const number = Number.parseFloat(raw);
    const threshold = raw.endsWith("rem")
      ? number * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
      : raw.endsWith("em")
        ? number * Number.parseFloat(style.fontSize)
        : number;
    // Without the token (no Aspekto loaded) the wide case stands, as the stylesheet draws it.
    control.classList.toggle("fm-stacked", Number.isFinite(threshold) && inline < threshold);
  }
`
    : isAuto
      ? `
  /**
   * Layout auto (Spec 014 ①, plan ① D-03): columns while the element is at least as wide as the
   * Uzo's columns-from, else stacked; columns and stacked stand as they are. A container query
   * takes no var(), so the element observes its own inline size and reads the token's custom
   * property. The observer resolves in the next frame: the switch changes the block size of the
   * element, which an observer callback must not do to the element it observes.
   */
  #autoLayout(): void {
    if (this.propValue("layout") !== "auto" || !this.isConnected) {
      this.#sizes?.disconnect();
      this.#sizes = undefined;
      return;
    }
    if (this.#sizes === undefined) {
      this.#sizes = new ResizeObserver(() => requestAnimationFrame(() => this.#autoLayout()));
      this.#sizes.observe(this);
    }
    const style = getComputedStyle(this);
    const box = this.getBoundingClientRect();
    const inline = style.writingMode.startsWith("horizontal") ? box.width : box.height;
    const raw = style.getPropertyValue(COLUMNS_FROM).trim();
    const number = Number.parseFloat(raw);
    const threshold = raw.endsWith("rem")
      ? number * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
      : raw.endsWith("em")
        ? number * Number.parseFloat(style.fontSize)
        : number;
    // Without the token (no Aspekto loaded) the wide case stands, as the stylesheet draws auto.
    const resolved = Number.isFinite(threshold) && inline < threshold ? "stacked" : "columns";
    if (this.getAttribute("data-layout") !== resolved) this.setAttribute("data-layout", resolved);
  }
`
      : "";
  const lightInit = isLight
    ? `    if (lightSheet === undefined) {
      lightSheet = new CSSStyleSheet();
      lightSheet.replaceSync(LIGHT_CSS);
    }
    if (!document.adoptedStyleSheets.includes(lightSheet)) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, lightSheet];
    }
    new MutationObserver(() => this.#render()).observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ${isNav ? '["slot", "href", "data-page", "data-count", "data-count-description"]' : isBreadcrumb ? '["slot", "href", "data-page"]' : '["slot", "data-sort", "numeric"]'},
    });
${
  isNav || isBreadcrumb
    ? ""
    : `    this.addEventListener("click", (event) => {
      const button = event
        .composedPath()
        .find(
          (node) =>
            node instanceof HTMLButtonElement && node.parentElement?.hasAttribute("data-sort") === true,
        );
      if (!(button instanceof HTMLButtonElement) || !this.contains(button)) return;
      const column = button.parentElement?.getAttribute("data-sort") ?? "";
      const current = this.propValue("sort");
      const direction =
        current === column && this.propValue("direction") === "ascending" ? "descending" : "ascending";
      this.dispatchEvent(new CustomEvent("sort-change", { bubbles: true, detail: { column, direction } }));
    });
`
}`
    : "";
  const lightMethods = isBreadcrumb
    ? `
  /**
   * Assigns the items to the list (manual slot assignment, Spec 015 ①, plan ① D-04): every child
   * without a slot to a list item of its own, made here, with the chevron after it; the last
   * item carries none.
   */
  #assign(): void {
    const list = this.shadowRoot?.querySelector('[part="items"]');
    if (!(list instanceof HTMLElement)) return;
    const items = [...this.children].filter((child) => child.getAttribute("slot") === null);
    if (list.children.length !== items.length) {
      list.replaceChildren();
      items.forEach((_item, index) => {
        list.insertAdjacentHTML("beforeend", ${JSON.stringify(BREADCRUMB_ENTRY)}.replace('name="item-"', 'name="item-' + index + '"'));
      });
    }
    items.forEach((item, index) => {
      const entry = list.children[index];
      entry?.querySelector("slot")?.assign(item);
      // A chevron stands between two levels only (Abnahme S-2): the last level, the current page,
      // has none. Removed, not hidden — the icon's own display would win over [hidden].
      const separator = entry?.querySelector('[part="separator"]');
      const last = index === items.length - 1;
      if (last && separator !== null && separator !== undefined) separator.remove();
      if (!last && (separator === null || separator === undefined)) {
        entry?.insertAdjacentHTML("beforeend", ${JSON.stringify(BREADCRUMB_SEPARATOR)});
      }
    });
  }

  /** Writes what the Ero adds to the links (Spec 015 ①, D-04); every write first compares. */
  #decorate(): void {
    this.#assign();
    // The landmark is named by the label prop, else by the Modelo's word (a11y.texts label-empty).
    const label = this.propValue("label");
    const fallback = TEXTS["label-empty"];
    const spoken = fallback === undefined ? "" : (fallback[this.#lingvo()] ?? fallback.en ?? "");
    const name = typeof label === "string" && label !== "" ? label : spoken;
    if (this.#control.getAttribute("aria-label") !== name) this.#control.setAttribute("aria-label", name);
    // The current page (E7): the item whose key is the page prop, else the last item, carries
    // aria-current="page"; no other does. The stylesheet binds weight and underline to it.
    const page = this.propValue("page");
    const wanted = typeof page === "string" && page !== "" ? page : null;
    const items = [...this.children].filter((child) => child.getAttribute("slot") === null);
    items.forEach((item, index) => {
      const key = item.getAttribute("data-page") ?? item.getAttribute("href") ?? item.textContent?.trim() ?? "";
      const current = wanted === null ? index === items.length - 1 : key === wanted;
      if (current && item.getAttribute("aria-current") !== "page") item.setAttribute("aria-current", "page");
      if (!current && item.hasAttribute("aria-current")) item.removeAttribute("aria-current");
    });
  }
`
    : isNav
      ? `
  /** Writes what the Ero adds to the links (Spec 011 ⑤, D-07); every write first compares. */
  #decorate(): void {
    // The landmark is named by the label prop (a11y.name prop:label).
    const label = this.propValue("label");
    const name = typeof label === "string" && label !== "" ? label : null;
    if (this.#control.getAttribute("aria-label") !== name) {
      if (name === null) this.#control.removeAttribute("aria-label");
      else this.#control.setAttribute("aria-label", name);
    }
    // The current page (G4, E7): the item whose key — its data-page, else its href — is the page
    // prop carries aria-current="page"; no other does. Colour alone never says it: the stylesheet
    // binds the underline to [aria-current].
    const page = this.propValue("page");
    const wanted = typeof page === "string" && page !== "" ? page : null;
    for (const item of this.querySelectorAll(":scope > a")) {
      const key = item.getAttribute("data-page") ?? item.getAttribute("href") ?? item.textContent?.trim() ?? "";
      const current = wanted !== null && key === wanted;
      if (current && item.getAttribute("aria-current") !== "page") item.setAttribute("aria-current", "page");
      if (!current && item.hasAttribute("aria-current")) item.removeAttribute("aria-current");
      // A count next to an item (the spec: 1 Version in Prüfung) is a composed insigno with intent
      // info: the digit is not heard (aria-hidden), the description is (the badge's hidden slot).
      const count = item.getAttribute("data-count");
      const description = item.getAttribute("data-count-description") ?? "";
      let badge = item.querySelector(":scope > fm-insigno");
      if (count === null || count === "") {
        badge?.remove();
        continue;
      }
      if (badge === null) {
        badge = document.createElement("fm-insigno");
        badge.setAttribute("intent", "info");
        badge.setAttribute("size", "small");
        badge.innerHTML = '<span aria-hidden="true"></span><span slot="description"></span>';
        item.append(badge);
      }
      const digit = badge.querySelector('[aria-hidden="true"]');
      if (digit !== null && digit.textContent !== count) digit.textContent = count;
      const heard = badge.querySelector('[slot="description"]');
      if (heard !== null && heard.textContent !== description) heard.textContent = description;
    }
  }
`
      : isLight
        ? `
  /** The platform's own table or list in the light DOM, the first child of its kind. */
  #native(kind: "table" | "dl"): HTMLElement | undefined {
    const node = [...this.children].find((child) => child.tagName.toLowerCase() === kind);
    return node instanceof HTMLElement ? node : undefined;
  }

  /** Writes what the Ero adds to the native element; every write first compares. */
  #decorate(): void {
    const table = this.#native("table");
    if (table !== undefined) this.#decorateTable(table);
    const list = this.#native("dl");
    if (list !== undefined) this.#decorateList(list);
  }

  #decorateTable(table: HTMLElement): void {
    // The caption from the default slot (Spec 011 ④, D-09): written into the table, where the
    // platform names it; hidden from sight with caption-hidden, never removed (G4).
    const captionText = this.#slotText("");
    let caption = table.querySelector(":scope > caption");
    if (caption === null && captionText !== "") {
      caption = document.createElement("caption");
      table.prepend(caption);
    }
    if (caption instanceof HTMLElement) {
      if (caption.textContent !== captionText) caption.textContent = captionText;
      const hidden = HAS_PROP.has("caption-hidden") && this.propValue("caption-hidden") === true;
      if (caption.classList.contains("fm-hidden") !== hidden) caption.classList.toggle("fm-hidden", hidden);
    }
    const region = this.shadowRoot?.querySelector('[part="region"]');
    if (region instanceof HTMLElement && region.getAttribute("aria-label") !== (captionText || null)) {
      if (captionText === "") region.removeAttribute("aria-label");
      else region.setAttribute("aria-label", captionText);
    }
    // The sort buttons (Spec 011 ④, D-09, G4): every header that carries data-sort holds a button
    // with its text and the indicator; aria-sort stands on the sorted column alone.
    const sorted = this.propValue("sort");
    const direction = String(this.propValue("direction") ?? "ascending");
    for (const header of table.querySelectorAll(":scope > thead th")) {
      const key = header.getAttribute("data-sort");
      if (key === null) continue;
      let button = header.querySelector(":scope > button");
      if (button === null) {
        button = document.createElement("button");
        button.setAttribute("type", "button");
        button.append(...header.childNodes);
        button.insertAdjacentHTML("beforeend", \`${SORT_SIGN}\`);
        header.append(button);
      }
      const wanted = typeof sorted === "string" && sorted === key ? direction : null;
      if (header.getAttribute("aria-sort") !== wanted) {
        if (wanted === null) header.removeAttribute("aria-sort");
        else header.setAttribute("aria-sort", wanted);
      }
      // The arrow is an ikono (Spec 014 ②, G3): named by the direction of the sorted column.
      const arrow = button.querySelector("fm-ikono");
      const arrowName = wanted === "descending" ? "sort-descending" : "sort-ascending";
      if (arrow !== null && arrow.getAttribute("name") !== arrowName) arrow.setAttribute("name", arrowName);
    }
    // A numeric column (Spec 011 ④, D-09): the header carries numeric, its cells get the mark.
    const headers = [...table.querySelectorAll(":scope > thead th")];
    const numeric = headers.map((header) => header.hasAttribute("numeric"));
    for (const row of table.querySelectorAll(":scope > tbody > tr:not([data-fm-empty])")) {
      [...row.children].forEach((cell, index) => {
        if (numeric[index] === true && !cell.hasAttribute("numeric")) cell.setAttribute("numeric", "");
      });
    }
    // The empty state (Spec 011 ④, D-09): without rows, the empty slot's text as a plenstato over
    // all columns; rows take it away.
    const body = table.querySelector(":scope > tbody");
    if (body !== null && NAMED_SLOTS.includes("empty")) {
      const rows = [...body.children].filter((row) => !row.hasAttribute("data-fm-empty"));
      const placeholder = body.querySelector(":scope > tr[data-fm-empty]");
      const emptyText = this.#slotText("empty");
      if (rows.length === 0 && emptyText !== "") {
        if (placeholder === null) {
          body.insertAdjacentHTML(
            "beforeend",
            \`<tr data-fm-empty><td colspan="\${Math.max(1, headers.length)}"><fm-plenstato kind="empty"></fm-plenstato></td></tr>\`,
          );
        }
        const state = body.querySelector(":scope > tr[data-fm-empty] fm-plenstato");
        if (state instanceof HTMLElement && state.textContent !== emptyText) state.textContent = emptyText;
      } else if (placeholder !== null) {
        placeholder.remove();
      }
    }
  }

  #decorateList(list: HTMLElement): void {
    // The name of the list (Spec 011 ④, D-10): the label prop, as the platform names a list.
    const label = this.propValue("label");
    const name = typeof label === "string" && label !== "" ? label : null;
    if (list.getAttribute("aria-label") !== name) {
      if (name === null) list.removeAttribute("aria-label");
      else list.setAttribute("aria-label", name);
    }
    // An empty value (Spec 011 ④, D-10, G4): a dash to see, the a11y text of the default slot's
    // empty entry to hear (a11y.texts <slot>-empty), clipped from sight; a value filled in later
    // takes both away.
    const slot = (SKEMO.slots as readonly { name: string; default?: boolean }[]).find((candidate) => candidate.default === true);
    const heard = slot === undefined ? undefined : TEXTS[\`\${slot.name}-empty\`];
    if (heard === undefined) return;
    const lingvo = this.#lingvo();
    const word = heard[lingvo] ?? heard.en ?? Object.values(heard)[0] ?? "";
    for (const value of list.querySelectorAll(":scope > dd")) {
      const marked = value.hasAttribute("data-fm-empty");
      const ours = value.querySelector(":scope > .fm-hidden") !== null;
      if (marked && !ours) {
        value.removeAttribute("data-fm-empty");
        continue;
      }
      if (marked) continue;
      if ((value.textContent ?? "").trim() !== "" || value.children.length > 0) continue;
      value.setAttribute("data-fm-empty", "");
      value.innerHTML = \`<span class="fm-hidden">\${word}</span>${DASH_SIGN}\`;
    }
  }
`
        : "";
  // The text of a slot of the light DOM, read for a meter's value text and a table's caption or
  // empty state (the default slot is named "").
  const slotTextMethod =
    isMeter || isLight || isUpload
      ? `
  /** The text a slot holds (the default slot as ""), trimmed; empty without content. */
  #slotText(name: string): string {
    const slot = this.shadowRoot?.querySelector(name === "" ? "slot:not([name])" : \`slot[name="\${name}"]\`);
    return slot instanceof HTMLSlotElement
      ? slot
          .assignedNodes({ flatten: true })
          .map((node) => node.textContent ?? "")
          .join("")
          .trim()
      : "";
  }
`
      : "";
  // Tabs (Spec 011 ⑤, D-08): the constructor follows the children and the keys; a click on a row
  // selects its tab.
  // A pagination (Spec 015 ①, plan ① D-03, G5): a click on an item in mode button fires
  // page-change (cancelable) with the number; the page prop follows unless cancelled. In mode link
  // the platform follows the link; an item at the end (aria-disabled) does nothing.
  const paginationInit = isPagination
    ? `    control.addEventListener("click", (event) => {
      const item = event.composedPath().find(
        (node) => node instanceof HTMLElement && node.getAttribute("part") === "item",
      );
      if (!(item instanceof HTMLElement)) return;
      if (item.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        return;
      }
      if (item instanceof HTMLAnchorElement) return;
      const page = Number(item.getAttribute("data-page"));
      const accepted = this.dispatchEvent(
        new CustomEvent("page-change", { bubbles: true, cancelable: true, detail: { page } }),
      );
      if (accepted) this.setAttribute("page", String(page));
    });
`
    : "";
  // The render of a pagination (Spec 015 ①, plan ① D-03): the first and the last page, the current
  // one and its siblings, an ellipsis per gap (not heard); every page named by the Modelo's word
  // and its number (items-name), the arrows by theirs (prev-name, next-name); the landmark by the
  // label prop, else by the Modelo's word (label-empty); the current page says aria-current.
  const paginationRender = isPagination
    ? `    const list = this.shadowRoot?.querySelector('[part="pages"]');
    if (list instanceof HTMLElement) {
      const lingvo = this.#lingvo();
      const word = (key: string) => TEXTS[key]?.[lingvo] ?? TEXTS[key]?.en ?? "";
      const given = this.propValue("label");
      const landmark = typeof given === "string" && given !== "" ? given : word("label-empty");
      if (control.getAttribute("aria-label") !== landmark) control.setAttribute("aria-label", landmark);
      const pageCount = Math.max(1, Math.floor(Number(this.propValue("total-pages") ?? 1)) || 1);
      const current = Math.min(pageCount, Math.max(1, Math.floor(Number(this.propValue("page") ?? 1)) || 1));
      const siblings = Math.max(0, Math.floor(Number(this.propValue("siblings") ?? 1)) || 0);
      const link = this.propValue("mode") === "link";
      const template = String(this.propValue("href-template") ?? "?page={page}");
      const low = Math.max(2, current - siblings);
      const high = Math.min(pageCount - 1, current + siblings);
      const pages: (number | "gap")[] = [1];
      if (low > 2) pages.push("gap");
      for (let n = low; n <= high; n += 1) pages.push(n);
      if (high < pageCount - 1) pages.push("gap");
      if (pageCount > 1) pages.push(pageCount);
      const items: { kind: "prev" | "next" | "page" | "gap"; page: number }[] = [
        { kind: "prev", page: current - 1 },
        ...pages.map((page) => (page === "gap" ? { kind: "gap" as const, page: 0 } : { kind: "page" as const, page })),
        { kind: "next", page: current + 1 },
      ];
      const html = items
        .map((item) => {
          if (item.kind === "gap") return '<li part="ellipsis" aria-hidden="true">' + ${JSON.stringify(ELLIPSIS_SIGN)} + "</li>";
          const off = item.page < 1 || item.page > pageCount;
          const tag = link ? "a" : "button";
          const href = link && !off ? ' href="' + template.replace("{page}", String(item.page)) + '"' : "";
          const type = link ? "" : ' type="button"';
          const arrow = item.kind === "page" ? "" : ' data-arrow="' + item.kind + '"';
          const name = item.kind === "page" ? word("items-name") + " " + item.page : word(item.kind + "-name");
          const marked = item.kind === "page" && item.page === current ? ' aria-current="page"' : "";
          const disabled = off ? ' aria-disabled="true"' : "";
          const inner =
            item.kind === "page"
              ? String(item.page)
              : '<fm-ikono part="' + item.kind + '" name="' + (item.kind === "prev" ? "chevron-left" : "chevron-right") + '"></fm-ikono>';
          return '<li><' + tag + ' part="item"' + type + href + arrow + marked + disabled + ' aria-label="' + name + '" data-page="' + item.page + '">' + inner + "</" + tag + ">";
        })
        .join("");
      if (list.innerHTML !== html) list.innerHTML = html;
    }
`
    : "";
  const tabsInit = isTabs
    ? `    new MutationObserver(() => {
      this.#assign();
      this.#render();
    }).observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["slot", "value", "disabled", "aria-disabled"],
    });
    control.addEventListener("keydown", (event) => this.#key(event));
    control.addEventListener("click", (event) => {
      const row = event.composedPath().find(
        (node) => node instanceof HTMLElement && node.getAttribute("part") === "tab",
      );
      if (row instanceof HTMLElement) this.#choose(this.#rows().indexOf(row));
    });
`
    : "";
  // The render of tabs (Spec 011 ⑤, D-08, E7, G4): active is the state of one row (aria-selected),
  // never of the list; the selected tab is the prop's, else the first that is not disabled; one tab
  // stop (the selected tab); a disabled tab says so and is no stop; the panel is labelled by the
  // selected tab.
  const tabsRender = isTabs
    ? `    const rows = this.#rows();
    const values = this.#values();
    const disabledRows = this.#disabled();
    const selected = this.propValue("selected");
    const wanted = typeof selected === "string" && selected !== "" ? values.indexOf(selected) : -1;
    const active = wanted === -1 ? disabledRows.findIndex((off) => !off) : wanted;
    rows.forEach((row, index) => {
      const on = index === active;
      row.setAttribute("aria-selected", String(on));
      row.id = \`tab-\${index}\`;
      row.setAttribute("aria-controls", "panel");
      row.tabIndex = on && !disabledRows[index] ? 0 : -1;
      if (disabledRows[index]) row.setAttribute("aria-disabled", "true");
      else row.removeAttribute("aria-disabled");
    });
    const panel = this.shadowRoot?.querySelector('[part="panel"]');
    if (panel instanceof HTMLElement) {
      panel.id = "panel";
      if (active === -1) panel.removeAttribute("aria-labelledby");
      else panel.setAttribute("aria-labelledby", \`tab-\${active}\`);
    }
`
    : "";
  // The layer of an overlay (Spec 014 ④, plan ④ D-05, E11): anchored to its trigger with CSS
  // anchor positioning — the element writes one dashed name on the trigger (anchor-name) and the
  // control (position-anchor), the stylesheet places the side (position-area) and flips it where
  // there is no room (position-try-fallbacks). Where the platform has no anchor positioning, the
  // own fallback is the plain place under the trigger, measured once on opening.
  const overlayMethods = isOverlay
    ? `
  #overlayFocusWasInside = false;

  /** The id of the element, made once where the markup gives none (an anchor name needs one). */
  #overlayId(): string {
    if (this.id === "") this.id = \`fm-overlay-\${Math.random().toString(36).slice(2, 8)}\`;
    return this.id;
  }

  /** The popover of the platform: the host of a tooltip, the control of a popover or a menu. */
  #overlayLayer(): HTMLElement {
    return ${isTooltip ? "this" : "this.#control"};
  }

  /**
   * The element that carries the anchor name, in the tree scope of the layer (an anchor in
   * another tree scope is not found, B-7): the trigger of a tooltip (both in the light DOM); for
   * a popover or a menu the slot that holds the slotted trigger (its box wraps the trigger in
   * the shadow tree), else the own trigger of a menu.
   */
  #overlayAnchorTarget(trigger: HTMLElement): HTMLElement {
${
  isTooltip
    ? `    return trigger;`
    : `    const slot = this.shadowRoot?.querySelector('slot[name="trigger"]');
    if (!(slot instanceof HTMLSlotElement)) return trigger;
    return slot.assignedElements().includes(trigger) ? slot : trigger;`
}
  }

  /** Names the trigger as the anchor of the layer; the own fallback places it under the trigger. */
  #overlayAnchor(trigger: HTMLElement): void {
    const layer = this.#overlayLayer();
    const name = \`--fm-anchor-\${this.#overlayId()}\`;
    this.#overlayAnchorTarget(trigger).style.setProperty("anchor-name", name);
    layer.style.setProperty("position-anchor", name);
    // CSS is the stylesheet constant of the element; the platform's CSS object is the global's.
    const platform = (globalThis as { CSS?: { supports(query: string): boolean } }).CSS;
    if (platform !== undefined && platform.supports("anchor-name: --a")) return;
    const box = trigger.getBoundingClientRect();
    layer.style.insetBlockStart = \`\${box.bottom}px\`;
    layer.style.insetInlineStart = \`\${box.left}px\`;
  }

  /** The slotted trigger of a popover or a menu, else the element's own (a menu's butono). */
  #overlayTrigger(): HTMLElement | undefined {
    const slot = this.shadowRoot?.querySelector('slot[name="trigger"]');
    const slotted = slot instanceof HTMLSlotElement ? slot.assignedElements()[0] : undefined;
    if (slotted instanceof HTMLElement) return slotted;
    const own = this.shadowRoot?.querySelector('[part="trigger"]');
    return own instanceof HTMLElement ? own : undefined;
  }

  /**
   * The element of the trigger that carries the role button: the control inside a butono's
   * shadow (where aria-expanded and aria-haspopup are heard), else the trigger itself.
   */
  #overlayTriggerControl(): HTMLElement | undefined {
    const trigger = this.#overlayTrigger();
    const inner = trigger?.shadowRoot?.querySelector('[part="control"]');
    return inner instanceof HTMLElement ? inner : trigger;
  }

  /** Writes an ARIA attribute on the trigger and on its inner control alike. */
  #overlayTriggerAria(name: string, value: string): void {
    for (const target of [this.#overlayTrigger(), this.#overlayTriggerControl()]) {
      if (target !== undefined && target.getAttribute(name) !== value) target.setAttribute(name, value);
    }
  }

  /** Wires the trigger once: a click toggles, the keys of a menu button open. */
  #overlayBindTrigger(): void {
    const trigger = this.#overlayTrigger();
    if (trigger === undefined || trigger.dataset.fmOverlay === this.#overlayId()) return;
    trigger.dataset.fmOverlay = this.#overlayId();
    this.#overlayTriggerAria("aria-expanded", String(this.#control.matches(":popover-open")));
    // A pointer on the trigger while the layer is open: the platform's light dismiss closes the
    // layer on pointerdown (the trigger lies outside it), so the click that follows must not
    // open it again — the trigger closes, as an invoker of the platform would.
    trigger.addEventListener("pointerdown", () => {
      this.#overlayWasOpen = this.#control.matches(":popover-open");
    });
    trigger.addEventListener("click", () => {
      const wasOpen = this.#overlayWasOpen;
      this.#overlayWasOpen = false;
      if (wasOpen || this.#control.matches(":popover-open")) this.#overlayClose();
      else this.#overlayOpen();
    });
    trigger.addEventListener("keydown", (event) => {
      if (this.#control.matches(":popover-open")) return;
      if (event.key === "ArrowDown" || (${isMenu ? "true" : "false"} && (event.key === "Enter" || event.key === " "))) {
        event.preventDefault();
        this.#overlayOpen();
      }
    });
  }

  #overlayOpen(): void {
    const layer = this.#overlayLayer();
    const trigger = this.#overlayTrigger();
    if (trigger !== undefined) this.#overlayAnchor(trigger);
    if (!layer.matches(":popover-open")) layer.showPopover();
    // The toggle event of the platform is a task later; the trigger says the state at once, and
    // the focus moves at once too (a key pressed right after opening finds the layer).
    this.#overlayTriggerAria("aria-expanded", "true");
${
  isMenu
    ? `    this.#menuFocus(this.#menuEnabled()[0] ?? -1);`
    : isPopover
      ? `    this.#overlayFocusIn();`
      : "    // A tooltip takes no focus."
}
  }

  #overlayClose(): void {
    const layer = this.#overlayLayer();
    if (layer.matches(":popover-open")) layer.hidePopover();
    this.#overlayTriggerAria("aria-expanded", "false");
  }

  #overlayMirroring = false;
  #overlayWasOpen = false;

  /** Whether the focus lies in the layer: a row of a menu, or a child of the popover's content. */
  #overlayHoldsFocus(): boolean {
    const active = this.shadowRoot?.activeElement;
    if (active instanceof HTMLElement && this.#control.contains(active)) return true;
    const outer = document.activeElement;
    return outer instanceof HTMLElement && this.contains(outer) && outer.closest('[slot="trigger"]') === null && outer !== this;
  }

  /** Writes the open attribute from the platform's state; the render it triggers syncs nothing back. */
  #overlayMirror(open: boolean): void {
    if (this.hasAttribute("open") === open) return;
    this.#overlayMirroring = true;
    this.toggleAttribute("open", open);
    this.#overlayMirroring = false;
  }

  /** The open prop follows into the platform (the toggle event writes the attribute back). */
  #overlaySync(): void {
    if (this.#overlayMirroring) return;
    const wanted = this.propValue("open") === true;
    const layer = this.#overlayLayer();
    if (wanted && !layer.matches(":popover-open")) this.#overlayOpen();
    else if (!wanted && layer.matches(":popover-open")) this.#overlayClose();
  }

  /** The focus goes to the first focusable child of the layer, else to the layer itself. */
  #overlayFocusIn(): void {
    const control = this.#control;
    // An Ero of Fundamento delegates its focus (its host has no tabindex): it counts as focusable.
    const inside = [...this.querySelectorAll<HTMLElement>("*")].find(
      (node) =>
        node.getAttribute("slot") !== "trigger" &&
        node.getAttribute("slot") !== "heading" &&
        (node.tabIndex >= 0 || node.shadowRoot !== null) &&
        node.closest('[slot="trigger"]') === null,
    );
    (inside ?? control).focus();
    this.#overlayFocusWasInside = true;
  }
`
    : "";
  // The tooltip's own ways: the trigger is any element of the page named by for; its words are
  // heard as the trigger's description unless they are its name.
  const tooltipMethods = isTooltip
    ? `
  #tooltipTrigger: HTMLElement | undefined;
  #tooltipTimer: ReturnType<typeof setTimeout> | undefined;

  /** The delay of the motion token: the transition duration the stylesheet binds. */
  #tooltipDelay(): number {
    const raw = getComputedStyle(this.#control).transitionDuration.split(",")[0]?.trim() ?? "0s";
    void raw.length;
    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? (raw.endsWith("ms") ? value : value * 1000) : 0;
  }

  /** Finds the trigger by id and wires it once; the description follows the words. */
  #tooltipBind(): void {
    const id = String(this.propValue("for") ?? "");
    const trigger = id === "" ? null : document.getElementById(id);
    if (!(trigger instanceof HTMLElement)) return;
    const words = (this.textContent ?? "").trim();
    const name = (trigger.getAttribute("label") ?? trigger.getAttribute("aria-label") ?? trigger.textContent ?? "").trim();
    if (words !== "" && words !== name) {
      trigger.setAttribute("aria-describedby", this.#overlayId());
      // The same words as a plain description too (ARIA 1.3): a tool that does not read a
      // reference into a host with a shadow tree still hears them.
      trigger.setAttribute("aria-description", words);
    } else if (trigger.getAttribute("aria-describedby") === this.id) {
      trigger.removeAttribute("aria-describedby");
      trigger.removeAttribute("aria-description");
    }
    if (this.#tooltipTrigger === trigger) return;
    this.#tooltipTrigger = trigger;
    trigger.addEventListener("mouseenter", () => this.#overlayShowSoon());
    trigger.addEventListener("mouseleave", () => this.#overlayHideSoon());
    trigger.addEventListener("focusin", () => this.#overlayShowSoon());
    trigger.addEventListener("focusout", () => this.#overlayHide());
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Escape") this.#overlayHide();
    });
  }

  #overlayShowSoon(): void {
    this.#overlayCancelHide();
    if (this.#tooltipTimer !== undefined) return;
    this.#tooltipTimer = setTimeout(() => {
      this.#tooltipTimer = undefined;
      const trigger = this.#tooltipTrigger;
      if (trigger === undefined) return;
      this.#overlayAnchor(trigger);
      if (!this.matches(":popover-open")) this.showPopover();
    }, this.#tooltipDelay());
  }

  #tooltipHideTimer: ReturnType<typeof setTimeout> | undefined;

  /** Leaving the trigger hides after a moment: the pointer may be on its way onto the layer. */
  #overlayHideSoon(): void {
    this.#overlayCancelShow();
    if (this.#tooltipHideTimer !== undefined) return;
    this.#tooltipHideTimer = setTimeout(() => {
      this.#tooltipHideTimer = undefined;
      this.#overlayHide();
    }, 150);
  }

  #overlayCancelHide(): void {
    if (this.#tooltipHideTimer === undefined) return;
    clearTimeout(this.#tooltipHideTimer);
    this.#tooltipHideTimer = undefined;
  }

  #overlayCancelShow(): void {
    if (this.#tooltipTimer === undefined) return;
    clearTimeout(this.#tooltipTimer);
    this.#tooltipTimer = undefined;
  }

  #overlayHide(): void {
    this.#overlayCancelShow();
    this.#overlayCancelHide();
    if (this.matches(":popover-open")) this.hidePopover();
  }
`
    : "";
  // The menu's own ways: rows per entry, the keys of the Skemo, select with the entry's id.
  const menuMethods = isMenu
    ? `
  /** Focus goes to the trigger of the menu. */
  override focus(options?: FocusOptions): void {
    this.#overlayTrigger()?.focus(options);
  }

  /** The rows of the menu, one per entry. */
  #menuRows(): HTMLElement[] {
    return [...(this.shadowRoot?.querySelectorAll('[part="item"]') ?? [])] as HTMLElement[];
  }

  /** The entry a row holds: the data element of the light DOM. */
  #menuEntryOf(row: HTMLElement): Element | undefined {
    const node = row.querySelector("slot")?.assignedNodes()[0];
    return node instanceof Element ? node : undefined;
  }

  /** The indexes of the rows a person may choose. */
  #menuEnabled(): number[] {
    return this.#menuRows()
      .map((row, index) => (row.getAttribute("aria-disabled") === "true" ? -1 : index))
      .filter((index) => index !== -1);
  }

  #menuFocus(index: number): void {
    const rows = this.#menuRows();
    rows.forEach((row, each) => {
      row.tabIndex = each === index ? 0 : -1;
    });
    rows[index]?.focus();
    this.#overlayFocusWasInside = true;
  }

  /** Chooses a row: select with its id (the value of the entry, else its text), then the menu closes. */
  #menuChoose(row: HTMLElement): void {
    if (row.getAttribute("aria-disabled") === "true") return;
    const entry = this.#menuEntryOf(row);
    const value = entry?.getAttribute("value") ?? entry?.textContent?.trim() ?? "";
    this.dispatchEvent(new CustomEvent("select", { bubbles: true, detail: { value } }));
    this.#overlayClose();
  }

  /** The keys of the Skemo on the rows: arrows wrap, Home and End jump, a letter finds, Enter or Space chooses, Escape closes. */
  #menuKey(event: KeyboardEvent): void {
    const key = event.key === " " ? "Space" : event.key;
    const enabled = this.#menuEnabled();
    const rows = this.#menuRows();
    const current = rows.findIndex((row) => row === this.shadowRoot?.activeElement);
    const at = enabled.indexOf(current);
    if (key === "Enter" || key === "Space") return;
    if (KEYS.includes(key)) {
      event.preventDefault();
      if (key === "ArrowDown") this.#menuFocus(enabled[(at + 1) % enabled.length] ?? -1);
      else if (key === "ArrowUp") this.#menuFocus(enabled[(at - 1 + enabled.length) % enabled.length] ?? -1);
      else if (key === "Home") this.#menuFocus(enabled[0] ?? -1);
      else if (key === "End") this.#menuFocus(enabled[enabled.length - 1] ?? -1);
      else if (key === "Escape") this.#overlayClose();
      // Enter and Space are the platform's own click on the row's button (keyup): the click
      // listener chooses once; nothing is done here, nothing is prevented.
      return;
    }
    if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey) return;
    const letter = event.key.toLowerCase();
    const order = [...enabled.slice(at + 1), ...enabled.slice(0, at + 1)];
    const found = order.find((index) => {
      const row = rows[index];
      const words = row === undefined ? "" : (this.#menuEntryOf(row)?.textContent ?? "");
      return words.trim().toLowerCase().startsWith(letter);
    });
    if (found !== undefined) this.#menuFocus(found);
  }

  /**
   * Assigns the children to the slots (manual slot assignment): every element without a slot to a
   * row of its own, made here — an apartigilo to a separator row, every other to a menu item; the
   * trigger to its slot.
   */
  #assign(): void {
    const shadow = this.shadowRoot;
    if (shadow === null) return;
    const entries: Element[] = [];
    const named = new Map<string, Element[]>();
    for (const node of this.children) {
      const slot = node.getAttribute("slot");
      if (slot === null) entries.push(node);
      else named.set(slot, [...(named.get(slot) ?? []), node]);
    }
    for (const holder of shadow.querySelectorAll("slot[name]")) {
      (holder as HTMLSlotElement).assign(...(named.get(holder.getAttribute("name") ?? "") ?? []));
    }
    const list = this.#control;
    const wanted = entries.map((entry) => (entry.tagName.toLowerCase() === "fm-apartigilo" ? "separator" : "item"));
    const same =
      list.children.length === wanted.length &&
      [...list.children].every((child, index) => child.getAttribute("part") === wanted[index]);
    if (!same) {
      list.replaceChildren();
      for (const kind of wanted) {
        list.insertAdjacentHTML("beforeend", kind === "separator" ? \`${MENU_SEPARATOR}\` : \`${MENU_ROW}\`);
      }
    }
    entries.forEach((entry, index) => {
      list.children[index]?.querySelector("slot")?.assign(entry);
    });
  }
`
    : "";
  // The ways of a field with suggestions (Spec 014 ⑤): its options from the light DOM, the rows
  // of the listbox, the keys of the Skemo, the choice, the validity of a free text.
  const suggestMethods = isSuggest
    ? `
  #suggestTyped = false;
  #suggestActive = -1;

  /** The options of the field: every child in the slot of the options, its value and its text. */
  #entries(): { value: string; text: string }[] {
    return [...this.children]
      .filter((child) => child.getAttribute("slot") === "options")
      .map((child) => {
        const text = child.textContent?.trim() ?? "";
        return { value: child.getAttribute("value") ?? text, text };
      });
  }

  #listbox(): HTMLElement {
    return this.shadowRoot?.querySelector('[part="listbox"]') as HTMLElement;
  }

  /** The options that match the typed text (the text, not the value, case-insensitive). */
  #suggestMatches(): { value: string; text: string }[] {
    const typed = (this.#control as HTMLInputElement).value.trim().toLowerCase();
    const minimum = Number(this.propValue("min-chars") ?? 1);
    if (typed.length < minimum) return [];
    const chosen = this.#entries().find((entry) => entry.value === this.getAttribute("value"));
    // The text of a chosen option shows no list of its own.
    if (chosen !== undefined && chosen.text.toLowerCase() === typed && !this.#suggestTyped) return [];
    return this.#entries().filter((entry) => entry.text.toLowerCase().includes(typed));
  }

  /** Writes the rows of the listbox from the matches and tells how many there are. */
  #suggestRows(): { value: string; text: string }[] {
    const listbox = this.#listbox();
    const matches = this.#suggestMatches();
    const rows = [...listbox.querySelectorAll('[part="suggestion"]')] as HTMLElement[];
    while (rows.length > matches.length) rows.pop()?.remove();
    while (rows.length < matches.length) {
      listbox.insertAdjacentHTML("beforeend", \`${SUGGESTION_ROW}\`);
      const row = listbox.lastElementChild;
      if (row instanceof HTMLElement) rows.push(row);
    }
    const value = this.getAttribute("value");
    matches.forEach((entry, index) => {
      const row = rows[index];
      if (row === undefined) return;
      row.id = \`suggestion-\${index}\`;
      row.dataset.value = entry.value;
      if (row.textContent !== entry.text) row.textContent = entry.text;
      row.setAttribute("aria-selected", String(entry.value === value));
    });
    const count = this.shadowRoot?.querySelector('[part="count"]');
    const lingvo = this.#lingvo();
    const none = TEXTS["options-empty"]?.[lingvo] ?? TEXTS["options-empty"]?.en ?? "";
    const word = TEXTS["options-count"]?.[lingvo] ?? TEXTS["options-count"]?.en ?? "";
    // While the application loads new suggestions (Nachlese 4 N-9, loading), the live region says
    // so in the words of a11y.texts; the count comes back with the next render.
    const loading = TEXTS["loading"]?.[lingvo] ?? TEXTS["loading"]?.en ?? "";
    const heard =
      this.propValue("loading") === true
        ? loading
        : matches.length === 0
          ? none
          : \`\${matches.length} \${word}\`;
    if (count instanceof HTMLElement && count.textContent !== heard) count.textContent = heard;
    let noResults = listbox.querySelector('[part="no-results"]');
    if (matches.length === 0 && this.#suggestTyped && noResults === null) {
      listbox.insertAdjacentHTML("beforeend", '<div part="no-results"></div>');
      noResults = listbox.querySelector('[part="no-results"]');
    }
    if (noResults instanceof HTMLElement) {
      noResults.textContent = none;
      noResults.hidden = matches.length > 0 || !this.#suggestTyped;
    }
    if (this.#suggestActive >= matches.length) this.#suggestActive = -1;
    this.#suggestMark();
    return matches;
  }

  /**
   * The active option is heard through aria-activedescendant on the input and seen through its
   * fill (Nachlese 4 N-8): the row says data-active, the state of its entry the stylesheet keys.
   */
  #suggestMark(): void {
    const rows = [...this.#listbox().querySelectorAll('[part="suggestion"]')] as HTMLElement[];
    const active = rows[this.#suggestActive];
    rows.forEach((row) => row.setAttribute("data-active", String(row === active)));
    if (active === undefined) this.#control.removeAttribute("aria-activedescendant");
    else this.#control.setAttribute("aria-activedescendant", active.id);
  }

  #suggestShow(): void {
    const matches = this.#suggestRows();
    const listbox = this.#listbox();
    const typed = (this.#control as HTMLInputElement).value.trim();
    const minimum = Number(this.propValue("min-chars") ?? 1);
    const show = typed.length >= minimum && (matches.length > 0 || this.#suggestTyped);
    if (show && !listbox.matches(":popover-open")) listbox.showPopover();
    if (!show && listbox.matches(":popover-open")) listbox.hidePopover();
    this.#control.setAttribute("aria-expanded", String(show));
    if (this.hasAttribute("expanded") !== show) this.toggleAttribute("expanded", show);
  }

  #suggestClose(): void {
    const listbox = this.#listbox();
    if (listbox.matches(":popover-open")) listbox.hidePopover();
    this.#control.setAttribute("aria-expanded", "false");
    if (this.hasAttribute("expanded")) this.removeAttribute("expanded");
    this.#suggestActive = -1;
    this.#suggestMark();
  }

  /** Takes a row as the value: the option's value in the attribute, its text in the field. */
  #suggestChoose(row: HTMLElement): void {
    const value = row.dataset.value ?? "";
    const entry = this.#entries().find((candidate) => candidate.value === value);
    this.#suggestTyped = false;
    (this.#control as HTMLInputElement).value = entry?.text ?? value;
    this.setAttribute("value", value);
    this.#suggestClose();
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /** The keys of the Skemo: the arrows move the active option, Enter takes it, Escape closes. */
  #suggestKey(event: KeyboardEvent): void {
    if (!KEYS.includes(event.key)) return;
    const listbox = this.#listbox();
    const rows = [...listbox.querySelectorAll('[part="suggestion"]')] as HTMLElement[];
    if (event.key === "Escape") {
      if (listbox.matches(":popover-open")) {
        event.preventDefault();
        this.#suggestClose();
      }
      return;
    }
    if (event.key === "Enter") {
      const active = rows[this.#suggestActive];
      if (active !== undefined && listbox.matches(":popover-open")) {
        event.preventDefault();
        this.#suggestChoose(active);
      }
      return;
    }
    event.preventDefault();
    if (!listbox.matches(":popover-open")) {
      this.#suggestTyped = true;
      this.#suggestShow();
    }
    if (rows.length === 0) return;
    const step = event.key === "ArrowDown" ? 1 : -1;
    this.#suggestActive = (this.#suggestActive + step + rows.length) % rows.length;
    this.#suggestMark();
  }
`
    : "";
  const tabsMethods = isTabs
    ? `
  /** Focus goes to the one tab stop: the selected tab, else the first. */
  override focus(options?: FocusOptions): void {
    const rows = this.#rows();
    (rows.find((row) => row.tabIndex === 0) ?? rows[0])?.focus(options);
  }

  /** The rows of the list, one per tab. */
  #rows(): HTMLElement[] {
    return [...(this.shadowRoot?.querySelectorAll('[part="tab"]') ?? [])] as HTMLElement[];
  }

  /** The child a row holds: the tab of the light DOM. */
  #tabOf(row: HTMLElement): Element | undefined {
    const node = row.querySelector("slot")?.assignedNodes()[0];
    return node instanceof Element ? node : undefined;
  }

  /** The id of each tab: its attribute value, else its text. */
  #values(): string[] {
    return this.#rows().map((row) => {
      const tab = this.#tabOf(row);
      return tab === undefined ? "" : (tab.getAttribute("value") ?? tab.textContent?.trim() ?? "");
    });
  }

  /** Whether each tab is disabled (its attribute disabled, or aria-disabled where the markup has none). */
  #disabled(): boolean[] {
    return this.#rows().map((row) => {
      const tab = this.#tabOf(row);
      return tab !== undefined && (tab.hasAttribute("disabled") || tab.getAttribute("aria-disabled") === "true");
    });
  }

  /**
   * Assigns the children to the slots (manual slot assignment): every element without a slot to a
   * row of its own, made here; the panel to its slot.
   */
  #assign(): void {
    const shadow = this.shadowRoot;
    if (shadow === null) return;
    const tabs: Element[] = [];
    const named = new Map<string, Element[]>();
    for (const node of this.children) {
      const slot = node.getAttribute("slot");
      if (slot === null) tabs.push(node);
      else named.set(slot, [...(named.get(slot) ?? []), node]);
    }
    for (const holder of shadow.querySelectorAll("slot[name]")) {
      (holder as HTMLSlotElement).assign(...(named.get(holder.getAttribute("name") ?? "") ?? []));
    }
    const list = this.#control;
    while (list.children.length > tabs.length) list.lastElementChild?.remove();
    while (list.children.length < tabs.length) {
      list.insertAdjacentHTML("beforeend", \`${TAB_ROW}\`);
    }
    tabs.forEach((tab, index) => {
      list.children[index]?.querySelector("slot")?.assign(tab);
    });
  }

  /** The keys of the Skemo: the arrows move and select, wrapping around; Home and End go to the ends. */
  #key(event: KeyboardEvent): void {
    if (!KEYS.includes(event.key)) return;
    const rows = this.#rows();
    const disabledRows = this.#disabled();
    const enabled = rows.map((_row, index) => index).filter((index) => !disabledRows[index]);
    if (enabled.length === 0) return;
    const row = event.composedPath().find(
      (node) => node instanceof HTMLElement && node.getAttribute("part") === "tab",
    );
    const at = Math.max(0, enabled.indexOf(rows.indexOf(row as HTMLElement)));
    const next =
      event.key === "ArrowRight"
        ? enabled[(at + 1) % enabled.length]
        : event.key === "ArrowLeft"
          ? enabled[(at - 1 + enabled.length) % enabled.length]
          : event.key === "Home"
            ? enabled[0]
            : event.key === "End"
              ? enabled[enabled.length - 1]
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    this.#choose(next);
  }

  /**
   * Selects the tab of a row (selection follows the focus, automatic activation): the event may
   * be prevented, then the selection stays; otherwise its id is the prop selected.
   */
  #choose(index: number): void {
    const row = this.#rows()[index];
    const value = this.#values()[index];
    if (row === undefined || value === undefined || this.#disabled()[index]) return;
    row.focus();
    if (this.getAttribute("selected") === value) return;
    const go = this.dispatchEvent(
      new CustomEvent("select", { bubbles: true, cancelable: true, detail: { value } }),
    );
    if (go) this.setAttribute("selected", value);
  }
`
    : "";
  // An icon (Spec 014 ②, plan ② D-05): the glyph is the Aspekto's picture of the name, a custom
  // property the CSS Celo projects (--fm-ikono-<name>), masked in the current colour; a name whose
  // direction carries meaning mirrors in right-to-left writing (data-mirror); named by its label
  // it is an image, without one it is decorative and hidden from assistive technology.
  const iconRender = isIcon
    ? `    const glyphName = String(this.propValue("name") ?? "");
    control.style.setProperty("--fm-ikono", \`var(--fm-ikono-\${glyphName})\`);
    // A class, no data attribute: the parity inventory reads data-* as props of the Skemo.
    control.classList.toggle("fm-mirror", IKONARO[glyphName] === true);
    const meaning = this.propValue("label");
    if (typeof meaning === "string" && meaning !== "") {
      control.setAttribute("role", "img");
      control.removeAttribute("aria-hidden");
    } else {
      control.removeAttribute("role");
      control.setAttribute("aria-hidden", "true");
    }
`
    : "";
  // A separator (Spec 014 ②, plan ② D-06): its role and orientation, none where it decorates.
  const separatorRender = isSeparator
    ? `    if (this.propValue("decorative") === true) {
      control.setAttribute("role", "none");
      control.removeAttribute("aria-orientation");
    } else {
      control.setAttribute("role", "separator");
      control.setAttribute("aria-orientation", String(this.propValue("orientation") ?? "horizontal"));
    }
`
    : "";
  // A heading (Spec 014 ③, plan ③ D-04): the level is spoken as aria-level (a11y.states); the size
  // follows the level where the attribute is absent — the enum has no default on purpose, so a
  // heading is never picked by its size: SIZE_OF_LEVEL is the Celo's reading of the Skemo's rule.
  const headingRender = isHeading
    ? `    const level = String(this.propValue("level") ?? "1");
    control.setAttribute("aria-level", level);
    if (this.getAttribute("size") === null) {
      const derived = SIZE_OF_LEVEL[level] ?? "headline-4";
      root.setAttribute("data-size", derived);
      if (root !== control) control.setAttribute("data-size", derived);
    }
`
    : "";
  // A paragraph (Spec 014 ③, plan ③ D-04): inline code is spoken as code; every other kind is
  // the platform's paragraph without a role attribute.
  const paragraphRender = isParagraph
    ? `    if (String(this.propValue("kind")) === "code") control.setAttribute("role", "code");
    else control.removeAttribute("role");
`
    : "";
  // A skip link (Spec 014 ②, plan ② D-07): an empty label shows the Modelo's words for it, in the
  // language of the document (a11y.texts label-empty), as the fallback content of the slot.
  // A card (Spec 015 ③, plan ③ D-04): its heading is a titolo at the card's level; content that
  // stands for itself is an article, a section of the page a region — named by its heading either
  // way. Media, meta and actions show while they have content; an image in the media says what it
  // shows (alt) or that it only decorates (alt="").
  const cardRender = isCard
    ? `    const heading = this.shadowRoot?.querySelector('[part="heading"]');
    if (heading instanceof HTMLElement) heading.setAttribute("level", String(this.propValue("level") ?? "1"));
    if (this.propValue("standalone") === true) control.removeAttribute("role");
    else control.setAttribute("role", "region");
    for (const name of NAMED_SLOTS) {
      if (name === "heading") continue;
      const holder = this.shadowRoot?.querySelector(\`[part="\${name}"]\`);
      if (holder instanceof HTMLElement) holder.hidden = !this.#filled(name);
    }
    const media = this.shadowRoot?.querySelector('slot[name="media"]');
    if (media instanceof HTMLSlotElement) {
      for (const node of media.assignedElements({ flatten: true })) {
        const images = node instanceof HTMLImageElement ? [node] : [...node.querySelectorAll("img")];
        if (images.some((image) => !image.hasAttribute("alt"))) {
          warn(\`${tag}: the image in media has no alt; give it the words of what it shows, or alt="" where it only decorates.\`);
        }
      }
    }
${isStacking ? "    this.#autoLayout();\n" : ""}`
    : "";
  // An avatar (Spec 015 ③, plan ③ D-08): an image named by the name, hidden where decorative; the
  // picture shows once it has loaded, else — none, still loading, or broken — the initials: the
  // first grapheme of the first and of the last word of the name (Intl.Segmenter, so a letter
  // with a combining mark stays one), at most two, in the writing of the document. No colour is
  // worked out from the name (E8): the initials take the fixed roles of the part.
  const avatarRender = isAvatar
    ? `    const avatarName = String(this.propValue("name") ?? "").trim();
    if (avatarName === "") warn(\`${tag}: name is required; an avatar without a name is a picture nobody hears (icon-meaning-named).\`);
    if (this.propValue("decorative") === true) {
      control.removeAttribute("role");
      control.removeAttribute("aria-label");
      control.setAttribute("aria-hidden", "true");
    } else {
      control.setAttribute("role", "img");
      control.setAttribute("aria-label", avatarName);
      control.removeAttribute("aria-hidden");
    }
    const initials = this.shadowRoot?.querySelector('[part="initials"]');
    const image = this.shadowRoot?.querySelector('[part="image"]');
    if (initials instanceof HTMLElement && image instanceof HTMLImageElement) {
      const lingvo = this.#lingvo();
      // Words are what spaces and dashes part (the word segmenters of the engines differ on
      // scripts such as Devanagari); a word's initial is its first grapheme that is a letter or a
      // digit, so a quote or a bracket before it does not count.
      const words = avatarName.split(/[\\s\\p{Pd}]+/u).filter((word) => word !== "");
      // Nachlese 5 N5-5 (O-18): the smallest size – the first value of the size axis – carries
      // one initial, as in Figma; two stood over its circle.
      const smallest = PROPS.find((prop) => prop.name === "size")?.values?.[0];
      const one = smallest !== undefined && this.propValue("size") === smallest;
      const picked = one
        ? words.slice(0, 1)
        : words.length > 1
          ? [words[0] ?? "", words[words.length - 1] ?? ""]
          : words;
      const graphemes = new Intl.Segmenter(lingvo, { granularity: "grapheme" });
      const letters = picked
        .map(
          (word) =>
            [...graphemes.segment(word)].find((grapheme) => /[\\p{L}\\p{N}]/u.test(grapheme.segment))
              ?.segment ?? "",
        )
        .join("")
        .toLocaleUpperCase(lingvo);
      if (initials.textContent !== letters) initials.textContent = letters;
      const picture = String(this.propValue("picture") ?? "");
      if (picture !== this.#picture) {
        this.#picture = picture;
        this.#loaded = false;
        if (picture === "") image.removeAttribute("src");
        else image.src = picture;
      }
      const shown = picture !== "" && this.#loaded;
      image.hidden = !shown;
      initials.hidden = shown;
    }
`
    : "";
  const skipRender = isSkip
    ? `    const fallback = TEXTS["label-empty"];
    if (fallback !== undefined) {
      const spoken = fallback[this.#lingvo()] ?? fallback.en ?? "";
      if (this.#label.textContent !== spoken) this.#label.textContent = spoken;
    }
`
    : "";
  // A tooltip (Spec 014 ④, plan ④ D-05, G5): shown while its trigger (for) is hovered or focused,
  // after the delay the motion token gives; hidden when the pointer leaves both, on blur and on
  // Escape; it describes the trigger (aria-describedby) unless its words are the trigger's own
  // name — then nothing is heard twice (an icon-only butono with its label).
  const tooltipInit = isTooltip
    ? `    // The host is the layer (D-05, B-7): a popover of the platform with the role tooltip.
    this.setAttribute("popover", "manual");
    if (!this.hasAttribute("role")) this.setAttribute("role", "tooltip");
    this.addEventListener("mouseenter", () => this.#overlayCancelHide());
    this.addEventListener("mouseleave", () => this.#overlayHideSoon());
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.matches(":popover-open")) this.#overlayHide();
    });
`
    : "";
  const tooltipRender = isTooltip
    ? `    this.#tooltipBind();
`
    : "";
  // A popover (Spec 014 ④, plan ④ D-05, G5): the slotted trigger toggles it and says aria-expanded;
  // the layer is a popover of the platform (light dismiss, Escape), anchored to the trigger; the
  // focus moves into the layer when it opens and back to the trigger when it closes; the open
  // attribute follows the platform's toggle event.
  const popoverInit = isPopover
    ? `    control.addEventListener("toggle", () => {
      // The event is a task later: the state of the platform now counts, not the event's (a
      // light dismiss right after opening would otherwise be undone by the mirror).
      const open = control.matches(":popover-open");
      this.#overlayMirror(open);
      this.#overlayTriggerAria("aria-expanded", String(open));
      // Opened by the platform (the open prop): the focus moves in unless it already is in.
      if (open && !this.#overlayHoldsFocus()) this.#overlayFocusIn();
      else if (!open && this.#overlayFocusWasInside) this.#overlayTrigger()?.focus();
    });
    control.addEventListener("focusout", (event) => {
      // Nachlese 5 ①: where the focus goes decides. Lost to nothing because the layer closed (Escape,
      // light dismiss), it was inside and goes back to the trigger; Chromium and WebKit give it
      // back themselves, Firefox left it on the body. Moved by the person to an element outside the
      // layer, it stays there. Moved within the layer, it is still inside.
      const next = event.relatedTarget;
      if (next === null) {
        if (!control.matches(":popover-open")) this.#overlayFocusWasInside = true;
        return;
      }
      const trigger = this.#overlayTrigger();
      this.#overlayFocusWasInside =
        next instanceof Node &&
        (control.contains(next) || this.contains(next)) &&
        !(trigger !== undefined && trigger.contains(next));
    });
    root.querySelector('slot[name="trigger"]')?.addEventListener("slotchange", () => this.#overlayBindTrigger());
    this.#overlayBindTrigger();
`
    : "";
  const popoverRender = isPopover
    ? `    const layerName = this.propValue("label");
    if (typeof layerName === "string" && layerName !== "") control.setAttribute("aria-label", layerName);
    else control.removeAttribute("aria-label");
    const heading = this.shadowRoot?.querySelector('[part="heading"]');
    if (heading instanceof HTMLElement) heading.hidden = !this.#filled("heading");
    this.#overlaySync();
`
    : "";
  // A menu (Spec 014 ④, plan ④ D-05, G5): the own trigger (hidden while one is slotted) or the
  // slotted one opens it — a click, ArrowDown, Enter or Space — and the first entry takes the
  // focus; the arrows move and wrap, Home and End jump, a letter finds an entry, a disabled entry
  // is skipped; Enter or Space fires select with the entry's id and closes; Escape closes and the
  // trigger takes the focus back. The rows are made per entry (manual slot assignment).
  const menuInit = isMenu
    ? `    new MutationObserver(() => {
      this.#assign();
      this.#render();
    }).observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["slot", "value", "disabled", "intent", "label"],
    });
    control.addEventListener("toggle", () => {
      const open = control.matches(":popover-open");
      this.#overlayMirror(open);
      this.#overlayTriggerAria("aria-expanded", String(open));
      // Opened by the platform (the open prop): the first entry takes the focus unless a row has
      // it already (a key pressed right after opening moved it).
      if (open && !this.#overlayHoldsFocus()) this.#menuFocus(this.#menuEnabled()[0] ?? -1);
      else if (!open && this.#overlayFocusWasInside) this.#overlayTrigger()?.focus();
    });
    control.addEventListener("focusout", (event) => {
      // Nachlese 5 ①: where the focus goes decides. Lost to nothing because the layer closed (Escape,
      // light dismiss), it was inside and goes back to the trigger; Chromium and WebKit give it
      // back themselves, Firefox left it on the body. Moved by the person to an element outside the
      // layer, it stays there. Moved within the layer, it is still inside.
      const next = event.relatedTarget;
      if (next === null) {
        if (!control.matches(":popover-open")) this.#overlayFocusWasInside = true;
        return;
      }
      const trigger = this.#overlayTrigger();
      this.#overlayFocusWasInside =
        next instanceof Node &&
        (control.contains(next) || this.contains(next)) &&
        !(trigger !== undefined && trigger.contains(next));
    });
    control.addEventListener("keydown", (event) => this.#menuKey(event));
    control.addEventListener("click", (event) => {
      const row = event.composedPath().find(
        (node) => node instanceof HTMLElement && node.getAttribute("part") === "item",
      );
      if (row instanceof HTMLElement) this.#menuChoose(row);
    });
    root.querySelector('slot[name="trigger"]')?.addEventListener("slotchange", () => this.#overlayBindTrigger());
    this.#overlayBindTrigger();
`
    : "";
  const menuRender = isMenu
    ? `    const own = this.shadowRoot?.querySelector('[part="trigger"]');
    const slotted = this.#filled("trigger");
    const fallback = TEXTS["label-empty"];
    const spoken = fallback === undefined ? "" : (fallback[this.#lingvo()] ?? fallback.en ?? "");
    const given = this.propValue("label");
    const menuName = typeof given === "string" && given !== "" ? given : spoken;
    if (own instanceof HTMLElement) {
      own.hidden = slotted;
      if (own.getAttribute("label") !== menuName) own.setAttribute("label", menuName);
    }
    control.setAttribute("aria-label", menuName);
    this.#overlayBindTrigger();
    this.#overlayTriggerAria("aria-haspopup", "menu");
    if (this.#overlayTriggerControl()?.hasAttribute("aria-expanded") !== true) {
      this.#overlayTriggerAria("aria-expanded", String(control.matches(":popover-open")));
    }
    for (const row of this.#menuRows()) {
      const entry = this.#menuEntryOf(row);
      const off = entry !== undefined && (entry.hasAttribute("disabled") || entry.getAttribute("aria-disabled") === "true");
      if (off) row.setAttribute("aria-disabled", "true");
      else row.removeAttribute("aria-disabled");
      row.classList.toggle("fm-danger", entry?.getAttribute("intent") === "danger");
    }
    this.#overlaySync();
`
    : "";
  // A disclosure (Spec 014 ⑤, plan ⑤ D-03, G5): the platform's details toggles on a click or a
  // key on its summary; the open attribute follows the platform's toggle event (and a group's
  // closing of the others), the chevron turns with it.
  const disclosureInit = isDisclosure
    ? `    control.addEventListener("toggle", () => {
      const open = (control as HTMLDetailsElement).open;
      if (this.hasAttribute("open") !== open) this.toggleAttribute("open", open);
      // The platform groups details by name within one tree; every disclosure lies in its own
      // shadow tree, so the group closes the others itself (B-4).
      const group = this.propValue("group");
      if (!open || typeof group !== "string" || group === "") return;
      const root = this.getRootNode();
      if (!(root instanceof Document || root instanceof ShadowRoot)) return;
      for (const other of root.querySelectorAll(\`${tag}[group="\${group}"]\`)) {
        if (other !== this && other.hasAttribute("open")) other.removeAttribute("open");
      }
    });
`
    : "";
  const disclosureRender = isDisclosure
    ? `    const details = control as HTMLDetailsElement;
    const open = this.propValue("open") === true;
    if (details.open !== open) details.open = open;
    const group = this.propValue("group");
    if (typeof group === "string" && group !== "") details.setAttribute("name", group);
    else details.removeAttribute("name");
    const chevron = this.shadowRoot?.querySelector('[part="indicator"]');
    const sign = open ? "chevron-down" : "chevron-right";
    if (chevron instanceof HTMLElement && chevron.getAttribute("name") !== sign) chevron.setAttribute("name", sign);
`
    : "";
  // A field with suggestions (Spec 014 ⑤, plan ⑤ D-03, G5): typing from min-chars on shows the
  // matching options in the listbox (a popover of the platform anchored to the field) and tells
  // the application (query); the arrows move the active option (aria-activedescendant), Enter
  // takes it as the value, Escape closes; without allow-free a text that is no option is invalid.
  const suggestInit = isSuggest
    ? `    new MutationObserver(() => this.#render()).observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["slot", "value"],
    });
    const input = control as HTMLInputElement;
    input.addEventListener("input", () => {
      this.#suggestTyped = true;
      if (this.getAttribute("value") !== input.value) this.setAttribute("value", input.value);
      this.dispatchEvent(new CustomEvent("query", { bubbles: true, detail: { query: input.value } }));
      this.#suggestShow();
    });
    input.addEventListener("keydown", (event) => this.#suggestKey(event));
    input.addEventListener("blur", () => this.#suggestClose());
    this.#listbox().addEventListener("mousedown", (event) => event.preventDefault());
    this.#listbox().addEventListener("click", (event) => {
      const row = event.composedPath().find(
        (node) => node instanceof HTMLElement && node.getAttribute("part") === "suggestion",
      );
      if (row instanceof HTMLElement) this.#suggestChoose(row);
    });
`
    : "";
  const suggestRender = isSuggest
    ? `    this.#suggestRows();
    if (this.propValue("expanded") === true && !this.#listbox().matches(":popover-open")) this.#suggestShow();
    if (this.propValue("expanded") !== true && this.#listbox().matches(":popover-open")) this.#suggestClose();
`
    : "";
  // A file input (Spec 015 ②, plan ② D-05, E7): the platform's file input chooses, the element
  // keeps the chosen files — a second choice adds to them where multiple allows, a drop on the
  // dropzone too — and writes them back into the input, so the platform's own list and the form
  // value always say the same. The dropzone is an addition for the pointer: dragover marks the
  // field (its state), a drop takes the files. Every remove takes one file away.
  // The picture of an avatar (Spec 015 ③): loaded, it replaces the initials; broken, they stay.
  const avatarInit = isAvatar
    ? `    const picture = root.querySelector('[part="image"]');
    if (picture instanceof HTMLImageElement) {
      picture.addEventListener("load", () => {
        this.#loaded = picture.naturalWidth > 0;
        this.#render();
      });
      picture.addEventListener("error", () => {
        this.#loaded = false;
        this.#render();
      });
    }
`
    : "";
  const uploadInit = isUpload
    ? `    const fileInput = control as HTMLInputElement;
    fileInput.addEventListener("change", () => {
      this.#take([...(fileInput.files ?? [])], true);
    });
    const zone = root.querySelector('[part="dropzone"]');
    const field = root.querySelector('[part="field"]');
    if (zone instanceof HTMLElement && field instanceof HTMLElement) {
      const over = (event: DragEvent) => {
        if (this.propValue("dropzone") !== true || this.propValue("disabled") === true) return;
        event.preventDefault();
        if (event.dataTransfer !== null) event.dataTransfer.dropEffect = "copy";
        field.setAttribute("dragover", "");
      };
      zone.addEventListener("dragenter", over);
      zone.addEventListener("dragover", over);
      zone.addEventListener("dragleave", (event) => {
        if (event.relatedTarget instanceof Node && zone.contains(event.relatedTarget)) return;
        field.removeAttribute("dragover");
      });
      zone.addEventListener("drop", (event) => {
        field.removeAttribute("dragover");
        if (this.propValue("dropzone") !== true || this.propValue("disabled") === true) return;
        event.preventDefault();
        this.#take([...(event.dataTransfer?.files ?? [])], false);
      });
    }
    root.querySelector('[part="file-list"]')?.addEventListener("click", (event) => {
      const remove = event
        .composedPath()
        .find((node) => node instanceof HTMLElement && node.getAttribute("part") === "remove");
      if (!(remove instanceof HTMLElement) || remove.hasAttribute("disabled")) return;
      this.#remove(Number(remove.getAttribute("data-index")));
    });
`
    : "";
  // The render of a file input (Spec 015 ②, plan ② D-05): accept and multiple on the platform's
  // input; the words of the Modelo on the button, the hint and every remove; one row per chosen
  // file with its name and its size; the validity — a file of another kind or larger than
  // max-size, else a required field without a file — with the Modelo's error (placeholders filled)
  // or the error slot's text; the files as the form value under the name; aria-invalid as a field.
  const uploadRender = isUpload
    ? `    {
      const input = control as HTMLInputElement;
      const shadow = this.shadowRoot;
      const language = this.#lingvo();
      const word = (key: string): string => TEXTS[key]?.[language] ?? TEXTS[key]?.en ?? "";
      const accept = this.propValue("accept");
      if (typeof accept === "string" && accept !== "") input.setAttribute("accept", accept);
      else input.removeAttribute("accept");
      const multiple = this.propValue("multiple") === true;
      input.multiple = multiple;
      if (!multiple && this.#files.length > 1) {
        this.#files = this.#files.slice(0, 1);
        this.#sync();
      }
      const disabled = this.propValue("disabled") === true;
      shadow?.querySelector('[part="choose"]')?.toggleAttribute("disabled", disabled);
      const chooseText = shadow?.getElementById("choose-text");
      if (chooseText instanceof HTMLElement) chooseText.textContent = word("choose-name");
      const hint = shadow?.getElementById("drop-hint");
      if (hint instanceof HTMLElement) {
        hint.textContent = word("drop-hint-name");
        hint.hidden = this.propValue("dropzone") !== true;
      }
      const list = shadow?.querySelector('[part="file-list"]');
      if (list instanceof HTMLElement) {
        while (list.children.length > this.#files.length) list.lastElementChild?.remove();
        while (list.children.length < this.#files.length) {
          list.insertAdjacentHTML("beforeend", \`${FILE_ROW}\`);
        }
        this.#files.forEach((file, index) => {
          const row = list.children[index];
          if (row === undefined) return;
          const fileName = row.querySelector('[part="file-name"]');
          if (fileName !== null) fileName.textContent = file.name;
          const fileSize = row.querySelector('[part="file-size"]');
          if (fileSize !== null) fileSize.textContent = this.#size(file.size, language);
          const remove = row.querySelector('[part="remove"]');
          if (remove !== null) {
            remove.setAttribute("label", this.#fill(word("remove-name"), { file: file.name }));
            remove.setAttribute("data-index", String(index));
            remove.toggleAttribute("disabled", disabled);
          }
        });
        list.hidden = this.#files.length === 0;
      }
      const required = this.propValue("required") === true;
      // B-1 (Abnahme 014 ①, Spec 015 ② D-11): no required on the native control — the platform would show its validationMessage as a bubble; the validity is the Ero's (ElementInternals).
      input.required = false;
      if (required) input.setAttribute("aria-required", "true");
      else input.removeAttribute("aria-required");
      const problem = this.#problem(language);
      this.#fileError = problem?.message ?? "";
      const own = shadow?.getElementById("file-error");
      if (own instanceof HTMLElement) own.textContent = this.#fileError;
      const missing = required && this.#files.length === 0;
      const slotted = this.#slotText("error");
      if (problem !== undefined) this.#internals.setValidity(problem.flags, problem.message, input);
      else if (missing) this.#internals.setValidity({ valueMissing: true }, slotted === "" ? word("required") : slotted, input);
      else this.#internals.setValidity({});
      const formName = this.propValue("name");
      if (typeof formName === "string" && formName !== "" && this.#files.length > 0) {
        const data = new FormData();
        for (const file of this.#files) data.append(formName, file);
        this.#internals.setFormValue(data);
      } else {
        this.#internals.setFormValue(null);
      }
      const invalid =
        this.propValue("invalid") === true ||
        this.#filled("error") ||
        problem !== undefined ||
        (missing && this.#reported);
      if (invalid) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
`
    : "";
  // The methods of a file input (Spec 015 ②, plan ② D-05): take, remove and write back the
  // files; the first file that breaks accept or max-size and its message; the size and the kinds
  // in the person's words (Intl, no word of the element's own: Art. VIII); the count spoken in
  // the live region; the reset of the form; the validity as a native input exposes it.
  const uploadMethods = isUpload
    ? `
  /** The chosen files, in the order they were chosen (the upload itself is the application's, E7). */
  get files(): readonly File[] {
    return [...this.#files];
  }

  /** Takes chosen or dropped files: added where multiple allows, else the first one alone. */
  #take(chosen: File[], native: boolean): void {
    if (chosen.length === 0) {
      // A cancelled dialog empties the platform's selection in some engines: the list stays.
      this.#sync();
      return;
    }
    this.#files = this.propValue("multiple") === true ? [...this.#files, ...chosen] : chosen.slice(0, 1);
    this.#reported = true;
    this.#sync();
    this.#render();
    this.#announce();
    if (!native) this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /** Removes one file; the focus goes to the next remove, else the previous, else the input. */
  #remove(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.#files.length) return;
    this.#files.splice(index, 1);
    this.#sync();
    this.#render();
    this.#announce();
    const removes = [...(this.shadowRoot?.querySelectorAll('[part="remove"]') ?? [])] as HTMLElement[];
    (removes[index] ?? removes[index - 1] ?? this.#control).focus();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /** Writes the files back into the platform's input, so both lists say the same. */
  #sync(): void {
    const input = this.#control as HTMLInputElement;
    if (typeof DataTransfer === "undefined") return;
    const transfer = new DataTransfer();
    for (const file of this.#files) transfer.items.add(file);
    input.files = transfer.files;
  }

  /** Says how many files are chosen (a live region): the Modelo's words with the number. */
  #announce(): void {
    const count = this.shadowRoot?.querySelector('[part="count"]');
    if (!(count instanceof HTMLElement)) return;
    const language = this.#lingvo();
    const words = TEXTS["file-list-count"]?.[language] ?? TEXTS["file-list-count"]?.en ?? "";
    count.textContent = this.#fill(words, { count: new Intl.NumberFormat(language).format(this.#files.length) });
  }

  /** The first chosen file that breaks accept (typeMismatch) or max-size (rangeOverflow). */
  #problem(language: string): { flags: ValidityStateFlags; message: string } | undefined {
    const accept = this.propValue("accept");
    const kinds =
      typeof accept === "string"
        ? accept.split(",").map((kind) => kind.trim().toLowerCase()).filter((kind) => kind !== "")
        : [];
    const bound = this.propValue("max-size");
    const limit = typeof bound === "string" && bound !== "" ? Number(bound) : 0;
    const word = (key: string): string => TEXTS[key]?.[language] ?? TEXTS[key]?.en ?? "";
    for (const file of this.#files) {
      if (kinds.length > 0 && !kinds.some((kind) => this.#fits(file, kind))) {
        return {
          flags: { typeMismatch: true },
          message: this.#fill(word("accept-invalid"), { file: file.name, accept: this.#kinds(kinds, language) }),
        };
      }
      if (Number.isFinite(limit) && limit > 0 && file.size > limit) {
        return {
          flags: { rangeOverflow: true },
          message: this.#fill(word("max-size-invalid"), { file: file.name, "max-size": this.#size(limit, language) }),
        };
      }
    }
    return undefined;
  }

  /** Whether a file is of a kind: an ending (.pdf), a media type (image/png) or a family (image/*). */
  #fits(file: File, kind: string): boolean {
    if (kind.startsWith(".")) return file.name.toLowerCase().endsWith(kind);
    const type = file.type.toLowerCase();
    if (kind.endsWith("/*")) return type.startsWith(kind.slice(0, -1));
    return type === kind;
  }

  /** The kinds as the person reads them: endings in capitals, joined with the language's or. */
  #kinds(kinds: readonly string[], language: string): string {
    const shown = kinds.map((kind) => (kind.startsWith(".") ? kind.slice(1).toUpperCase() : kind));
    return new Intl.ListFormat(language, { type: "disjunction" }).format(shown);
  }

  /** A size in the person's units (decimal: byte, kilobyte, megabyte), as Intl names them. */
  #size(bytes: number, language: string): string {
    const [unit, factor] =
      bytes >= 1_000_000 ? ["megabyte", 1_000_000] : bytes >= 1_000 ? ["kilobyte", 1_000] : ["byte", 1];
    return new Intl.NumberFormat(language, {
      style: "unit",
      unit,
      unitDisplay: "short",
      maximumFractionDigits: 1,
    }).format(bytes / factor);
  }

  /** A text of the Modelo with its placeholders ({file}, {count}, …) filled. */
  #fill(text: string, values: Readonly<Record<string, string>>): string {
    return text.replace(/\\{([a-z-]+)\\}/g, (match, key: string) => values[key] ?? match);
  }

  /** A reset of the form empties the list, as it empties a native file input. */
  formResetCallback(): void {
    this.#files = [];
    this.#reported = false;
    this.#sync();
    this.#render();
  }

  /** The validity of the field, as a native input exposes it (ElementInternals). */
  get validity(): ValidityState {
    return this.#internals.validity;
  }

  /** The message of the validity, as a native input exposes it. */
  get validationMessage(): string {
    return this.#internals.validationMessage;
  }

  /** Whether the field is valid; fires invalid when it is not, as a native input does. */
  checkValidity(): boolean {
    return this.#internals.checkValidity();
  }
`
    : "";
  // B-1 (Abnahme 014 ①, Spec 015 ② D-11): the validity of a choice in a form as a native control
  // exposes it — the select, the checkbox and switch, the radio group judge themselves through
  // ElementInternals like the fields, and say so through the same three members.
  const choiceValidityMethods =
    isSelect || isToggle || isGroup
      ? `
  /** The validity of the choice, as a native control exposes it (ElementInternals). */
  get validity(): ValidityState {
    return this.#internals.validity;
  }

  /** The message of the validity, as a native control exposes it. */
  get validationMessage(): string {
    return this.#internals.validationMessage;
  }

  /** Whether the choice is valid; fires invalid when it is not, as a native control does. */
  checkValidity(): boolean {
    return this.#internals.checkValidity();
  }
`
      : "";
  // The skip link moves the focus to its target (G5): a landmark takes it once it may (tabindex
  // -1, written where the markup has none); the fragment of the link is the platform's.
  const skipInit = isSkip
    ? `    control.addEventListener("click", () => {
      const to = this.propValue("to");
      const target = typeof to === "string" && to !== "" ? document.getElementById(to) : null;
      if (target === null) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      // At once, not a frame later: a Tab pressed right after Enter must find the target focused
      // (CI-Lauf 39080368228: the late focus took the focus back from the next element).
      target.focus();
    });
`
    : "";
  // The icons an Ero composes (Spec 014 ②, G3, G6): the status icon of a notice is named like
  // its intent; the chevron of a select and a slotted icon of a button take the size of the Ero.
  const composedIconRender = [
    isStatus && icon
      ? `    const statusIcon = this.shadowRoot?.querySelector('[part="icon"] fm-ikono');
    if (statusIcon !== null && statusIcon !== undefined) {
      const intentName = String(this.propValue("intent") ?? "");
      if (statusIcon.getAttribute("name") !== intentName) statusIcon.setAttribute("name", intentName);
    }
`
      : "",
    // The check mark of a checkbox (Nachlese 4 N-7) takes the size of the box like the chevron.
    isSelect || (isToggle && role === "checkbox")
      ? `    const chevron = this.shadowRoot?.querySelector('[part="indicator"] fm-ikono');
    const fieldSize = String(this.propValue("size") ?? "medium");
    if (chevron !== null && chevron !== undefined && chevron.getAttribute("size") !== fieldSize) {
      chevron.setAttribute("size", fieldSize);
    }
`
      : "",
    // A slotted icon and the mark the last icon slot falls back to (Nachlese 4 N-7: the ikono
    // external) take the size of the Ero.
    (host === "button" || host === "a") && !isSkip
      ? `    if (HAS_PROP.has("size")) {
      const iconSize = String(this.propValue("size") ?? "medium");
      const fallbacks = this.shadowRoot?.querySelectorAll('slot[name^="icon-"] > fm-ikono') ?? [];
      for (const slotted of [...this.querySelectorAll(':scope > fm-ikono[slot^="icon-"]'), ...fallbacks]) {
        if (slotted.getAttribute("size") !== iconSize) slotted.setAttribute("size", iconSize);
      }
    }
`
      : "",
  ].join("");
  const body = `
type Value = string | boolean;

const PROPS = SKEMO.props as readonly {
  name: string;
  kind: "enum" | "boolean" | "string" | "number";
  values?: readonly string[];
  default?: string | boolean | number;
  required?: boolean;
}[];
const CONSTRAINTS = (("constraints" in SKEMO ? SKEMO.constraints : []) ?? []) as readonly {
  when: Readonly<Record<string, string>>;
  allowed: Readonly<Record<string, readonly string[]>>;
  kialo: string;
}[];
/** What assistive technology hears when a boolean prop is true, per language (Spec 008, D-02). */
const TEXTS = (("texts" in SKEMO.a11y ? SKEMO.a11y.texts : {}) ?? {}) as Readonly<
  Record<string, Readonly<Record<string, string>>>
>;
/** Where the description comes from, in order: slot:help, slot:error (Spec 009, D-02). */
const DESCRIPTION = (("description" in SKEMO.a11y ? SKEMO.a11y.description : []) ?? []) as readonly string[];
const HAS_PROP = new Set(PROPS.map((prop) => prop.name));
/** The named slots of the Skemo, decorative ones aside: a live region shows each while it has content. */
const NAMED_SLOTS: readonly string[] = ${JSON.stringify(namedSlots)};
/**
 * What assistive technology hears while an enum prop has a value (Spec 011 ③, D-07): the texts
 * keyed <prop>-<value> — the kind of a notice ("Fehler:"), "lädt" while loading.
 */
const VALUED_TEXTS = PROPS.filter((prop) => prop.kind === "enum").flatMap((prop) =>
  (prop.values ?? []).flatMap((value) => {
    const heard = TEXTS[\`\${prop.name}-\${value}\`];
    return heard === undefined ? [] : [{ prop: prop.name, value, heard }];
  }),
);
/** The keys the Skemo names (Space, Enter): a toggle turns with these alone (Spec 010 ②). */
const KEYS = SKEMO.a11y.keys as readonly string[];
${
  isIcon
    ? `/** The names of the Ikonaro and whether each mirrors in right-to-left writing (Spec 014 ②). */
const IKONARO: Readonly<Record<string, boolean>> = ${JSON.stringify(Object.fromEntries(ikonaro.map((entry) => [entry.name, entry.mirror === true])))};
`
    : ""
}${
  isHeading
    ? `// The size a level implies where none is given (Spec 014 ③, plan ③ D-04): the first three
// levels take the headline of their number, the deeper ones the smallest headline.
const SIZE_OF_LEVEL: Readonly<Record<string, string>> = { "1": "headline-1", "2": "headline-2", "3": "headline-3", "4": "headline-4", "5": "headline-4", "6": "headline-4" };
`
    : ""
}
/**
 * Boolean props that key a part (Spec 010 ①, D-03: checked): written on the root as
 * data-<prop>="true|false", like an enum, because the stylesheet keys on them.
 */
const KEYED_BOOLEANS = PROPS.filter(
  (prop) =>
    prop.kind === "boolean" &&
    (Object.values(SKEMO.parts) as readonly Readonly<Record<string, { by?: readonly string[] }>>[]).some(
      (part) => Object.values(part).some((source) => source.by?.includes(prop.name) === true),
    ),
).map((prop) => prop.name);

let sheet: CSSStyleSheet | undefined;
${isLight ? "/** The stylesheet of the light DOM (Spec 011 ④, E10): adopted by the document once, scoped to the host. */\nlet lightSheet: CSSStyleSheet | undefined;\n" : ""}${autoConstant}const warned = new Set<string>();

function warn(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
}

function camel(name: string): string {
  return name.replace(/-([a-z0-9])/g, (_match, letter: string) => letter.toUpperCase());
}

/**
 * The base class. Without a DOM (server-side rendering) HTMLElement does not exist, and a class
 * declaration would throw at import time, so the module stays importable with a stand-in that is
 * never instantiated there.
 */
const Base = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

/** Generated from the Skemo of ${ero}; behaviour from the template in @fundamento/projekcioj. */
export class ${className} extends Base {
  static formAssociated = ${host === "a" || host === "dialog" || isStatic ? "false" : "true"};
  static observedAttributes = PROPS.map((prop) => prop.name);

  readonly #internals: ElementInternals;
  readonly #control: HTMLElement;
  /** The element the combination is written on: the field of a composite, else the control. */
  readonly #root: HTMLElement;
  readonly #label: HTMLSlotElement;
  readonly #texts: HTMLElement;
${autoField}${isAvatar ? '  /** The picture an avatar shows and whether it has loaded (Spec 015 ③): until then the initials stand. */\n  #picture = "";\n  #loaded = false;\n' : ""}${isUpload ? '  /** The chosen files (Spec 015 ②): the value of the field, in the order they were chosen. */\n  #files: File[] = [];\n  /** The element\'s own error: a chosen file breaks accept or max-size (empty while none does). */\n  #fileError = "";\n' : ""}${isFieldHost || isUpload ? "  /** Whether a person touched the field or the form reported it invalid (Spec 011 ② F-8): the error shows from then on. */\n  #reported = false;\n" : ""}
  constructor() {
    super();
    this.#internals = this.attachInternals();
    const root = this.attachShadow({ mode: "open", delegatesFocus: true${isGroup || isTabs || isMenu || isBreadcrumb ? ', slotAssignment: "manual"' : ""} });
    if (sheet === undefined) {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(CSS);
    }
    root.adoptedStyleSheets = [sheet];
    root.innerHTML = \`${markup(host, slots, role, marked, indicator, dismiss, icon, breadcrumb)}\`;
    const control = root.querySelector("${control}");
    const label = root.querySelector("slot:not([name])");
    const texts = root.querySelector("#fm-texts");
    if (
      !(control instanceof HTMLElement) ||
      !(label instanceof HTMLSlotElement) ||
      !(texts instanceof HTMLElement)
    ) {
      throw new Error("${tag}: shadow template is incomplete");
    }
    this.#control = control;
    // A light-DOM host carries the combination itself (Spec 011 ④, E10): the document's stylesheet
    // selects fm-tabelo[data-density="compact"] > table …
    this.#root = ${isLight ? "this" : `root.querySelector('[part="field"]') ?? control`};
    this.#label = label;
    this.#texts = texts;
    control.addEventListener("click", (event) => this.#activate(event));
${toggleKeys}${groupInit}${selectInit}${dialogInit}${statusInit}${lightInit}${paginationInit}${tabsInit}${tooltipInit}${popoverInit}${menuInit}${disclosureInit}${suggestInit}${uploadInit}${avatarInit}${skipInit}    label.addEventListener("slotchange", () => this.#render());
    for (const named of root.querySelectorAll("slot[name]")) {
      named.addEventListener("slotchange", () => this.#render());
    }
${
  isUpload
    ? ""
    : `    if (control instanceof ${nativeField}) {
      // The value a person types is the form value (ElementInternals, as fm-butono submits), and
      // the prop reflects it, so a wrapper reads what stands in the field.
      control.addEventListener("input", () => {
        this.#internals.setFormValue(control.value);
        if (this.getAttribute("value") !== control.value) this.setAttribute("value", control.value);
      });
    }
`
}${invalidReport}${inputEnter}  }

  connectedCallback(): void {
${isGroup || isTabs || isMenu ? "    this.#assign();\n" : ""}    this.#render();
  }

  attributeChangedCallback(): void {
    this.#render();
  }
${autoDisconnect}
  /**
   * The value of a prop after validation: an invalid value falls back to the default. Named apart
   * from the props: a field has a prop \`value\` (Spec 009), whose accessor must not shadow this.
   */
  propValue(name: string): Value | undefined {
    const prop = PROPS.find((candidate) => candidate.name === name);
    if (prop === undefined) return undefined;
    // A boolean whose default is true (Spec 015 ③, plan ③ D-03: standalone of a card) is true
    // while the attribute is absent and false only as name="false"; every other boolean is the
    // presence of its attribute.
    if (prop.kind === "boolean") {
      return prop.default === true ? this.getAttribute(name) !== "false" : this.hasAttribute(name);
    }
    const raw = this.getAttribute(name);
    if (prop.kind === "enum") {
      const allowed = prop.values ?? [];
      const fallback = String(prop.default ?? allowed[0] ?? "");
      if (raw !== null && !allowed.includes(raw)) {
        warn(\`${tag}: \${name}="\${raw}" is not allowed; using \${fallback} (allowed: \${allowed.join(", ")}).\`);
      }
      // A duty without a default (Spec 011 ③, R-10: kind of a state) falls back to the first
      // value and says so: the element never renders nothing, the developer hears what is missing.
      if (raw === null && prop.required === true) {
        warn(\`${tag}: \${name} is required (allowed: \${allowed.join(", ")}); using \${fallback}.\`);
      }
      return raw !== null && allowed.includes(raw) ? raw : fallback;
    }
    // A number (Spec 011 ②: rows) falls back to its default like an enum; a string has none.
    if (prop.kind === "number") return raw ?? (prop.default === undefined ? undefined : String(prop.default));
    return raw ?? undefined;
  }

  /** Enum values after validation and the Skemo constraints. */
  #enums(): Record<string, string> {
    const values: Record<string, string> = {};
    for (const prop of PROPS) {
      if (prop.kind === "enum") values[prop.name] = String(this.propValue(prop.name));
    }
    // A string prop reads as filled or empty in a constraint (Spec 011 ①, plan ① D-08), like a
    // slot: a bound on a kind without a scale, an empty option beside a prompt. Read here, never
    // written on the root as a data attribute.
    // Nachlese 5 O-10: a number prop too (max-size), given or not — its attribute, never the
    // default, as check_usage reads what an instance gives.
    const read: Record<string, string> = { ...values };
    for (const prop of PROPS) {
      if (prop.kind !== "string" && prop.kind !== "number") continue;
      const given = prop.kind === "number" ? this.getAttribute(prop.name) : this.propValue(prop.name);
      read[\`prop:\${prop.name}\`] = typeof given === "string" && given !== "" ? "filled" : "empty";
    }
    // A named slot reads as filled or empty (Spec 009 D-04; Spec 011 ③: actions of a state only
    // when empty), read here like a string prop.
    for (const name of NAMED_SLOTS) read[\`slot:\${name}\`] = this.#filled(name) ? "filled" : "empty";
    for (const constraint of CONSTRAINTS) {
      const applies = Object.entries(constraint.when).every(([key, value]) => read[key] === value);
      const violated = Object.entries(constraint.allowed).some(
        ([key, allowed]) => read[key] !== undefined && !allowed.includes(read[key] ?? ""),
      );
      if (!applies || !violated) continue;
      const given = Object.entries(constraint.when).map(([key, value]) => \`\${key}="\${value}"\`).join(" ");
      warn(\`${tag}: \${given} is not allowed here; using the default. \${constraint.kialo}\`);
      for (const key of Object.keys(constraint.when)) {
        const prop = PROPS.find((candidate) => candidate.name === key);
        if (prop !== undefined) values[key] = String(prop.default ?? prop.values?.[0] ?? "");
      }
    }
    return values;
  }

  /** The language of the document around the element: the nearest lang, two letters. */
  #lingvo(): string {
    const lang = this.closest("[lang]")?.getAttribute("lang") ?? document.documentElement.lang;
    return lang.toLowerCase().slice(0, 2);
  }

  /** Whether a named slot has content. */
  #filled(name: string): boolean {
    const slot = this.shadowRoot?.querySelector(\`slot[name="\${name}"]\`);
    return slot instanceof HTMLSlotElement && slot.assignedNodes({ flatten: true }).length > 0;
  }

  #render(): void {
    const control = this.#control;
    const root = this.#root;
    for (const [name, value] of Object.entries(this.#enums())) {
      root.setAttribute(\`data-\${name}\`, value);
      if (root !== control) control.setAttribute(\`data-\${name}\`, value);
    }
    for (const name of KEYED_BOOLEANS) {
      root.setAttribute(\`data-\${name}\`, String(this.propValue(name) === true));
    }
    if (HAS_PROP.has("disabled") && "disabled" in control) {
      (control as HTMLButtonElement).disabled = this.propValue("disabled") === true;
    }
    if (HAS_PROP.has("loading")) {
      const busy = this.propValue("loading") === true;
      // A button that works ignores activation; a field that loads suggestions (Nachlese 4 N-9)
      // stays operable — the person keeps typing — and is only busy.
      if (busy) {
        control.setAttribute("aria-busy", "true");
${isSuggest ? "" : '        control.setAttribute("aria-disabled", "true");\n'}      } else {
        control.removeAttribute("aria-busy");
${isSuggest ? "" : '        control.removeAttribute("aria-disabled");\n'}      }
    }
    // A link: \`to\` is its target (Art. VIII, the Web Celo spells it href); \`external\` marks
    // that the target lies outside the application (Spec 008, D-09).
    if (control instanceof HTMLAnchorElement) {
      const to = this.propValue("to");
      if (typeof to === "string" && to !== "") control.setAttribute("href", ${isSkip ? '"#" + to' : "to"});
      else {
        control.removeAttribute("href");
        warn(\`${tag}: to is required; a link without a target is text (boundary disabled-link).\`);
      }
      if (this.propValue("external") === true) control.setAttribute("rel", "external noopener noreferrer");
      else control.removeAttribute("rel");
    }
    // A field (Spec 009, D-08): the props of the Skemo on the native input, \`kind\` as its type,
    // \`invalid\` spoken as aria-invalid and set by a filled error slot (constraint of the Skemo);
    // disabled wins over readonly; help and error show only while they have text.
    const described: string[] = [];
${inputRender}${toggleRender}${groupRender}${selectRender}${dialogRender}${statusRender}${meterRender}${lightRender}${paginationRender}${tabsRender}${iconRender}${separatorRender}${headingRender}${paragraphRender}${tooltipRender}${popoverRender}${menuRender}${disclosureRender}${suggestRender}${uploadRender}${cardRender}${avatarRender}${skipRender}${composedIconRender}    // The texts of the slots that describe the control (Spec 009, D-02; a checkbox, Spec 010 ②):
    // shown while they have text, and its description in that order.
    for (const source of DESCRIPTION) {
      const [kind, name = ""] = source.split(":");
      const holder = this.shadowRoot?.getElementById(name);
      const has =
        kind === "slot"
          ? this.#filled(name)${isUpload ? ' || (name === "error" && this.#fileError !== "")' : ""}
          : typeof this.propValue(name) === "string";
      if (holder instanceof HTMLElement) holder.hidden = !has;
      if (has) described.push(name);
    }
    // What is heard in addition (Spec 008, D-02): the texts of every true boolean prop, in the
    // language of the document, as the description of the control; the mark shows with them.
    const lingvo = this.#lingvo();
${
  isStatic
    ? `    // A live region or static text (Spec 011 ③, D-07, D-09): what is heard stands in the content
    // itself, clipped from sight — the texts of the enum values the props have now (the kind of a
    // notice); a boolean's text names a part of the element (dismissible: the close butono), it
    // is not spoken here, and the region carries no description.
    const heard = VALUED_TEXTS.filter(({ prop, value }) => this.propValue(prop) === value).map(
      ({ heard: byLingvo }) => byLingvo[lingvo] ?? byLingvo.en ?? Object.values(byLingvo)[0] ?? "",
    );
    this.#texts.textContent = heard.join(" ");
`
    : `    const heard = Object.entries(TEXTS)
      .filter(([prop]) => this.propValue(prop) === true)${
        // The loading of a field with suggestions is said in its live region (Nachlese 4 N-9),
        // not described, and marks nothing (the mark is the required asterisk).
        isSuggest ? '\n      .filter(([prop]) => prop !== "loading")' : ""
      }
      .map(([, byLingvo]) => byLingvo[lingvo] ?? byLingvo.en ?? Object.values(byLingvo)[0] ?? "");
    this.#texts.textContent = heard.join(" ");
    if (heard.length > 0) described.push("fm-texts");
`
}
    // Removed and set again on purpose: a changed text in a hidden target alone does not reach
    // the accessibility tree of every engine; the attribute change does.
    control.removeAttribute("aria-describedby");
    if (described.length > 0) control.setAttribute("aria-describedby", described.join(" "));
    if (heard.length > 0) {
      root.setAttribute("data-marked", "true");
      if (root !== control) control.setAttribute("data-marked", "true");
    } else {
      root.removeAttribute("data-marked");
      control.removeAttribute("data-marked");
    }
    const text = this.#label
      .assignedNodes({ flatten: true })
      .map((node) => node.textContent ?? "")
      .join("")
      .trim();
    const name = this.propValue("label");
${
  isLight || isOverlay || isPagination || isCard || isAvatar
    ? `    // A light-DOM host names its region by the caption (Spec 011 ④, D-09) and its list by the
    // label prop on the dl itself (D-10); an overlay (Spec 014 ④) names its layer in its own
    // render, a pagination (Spec 015 ①, B-3) its landmark — the label, else the Modelo's word; a
    // card (Spec 015 ③) is named by its heading (aria-labelledby), an avatar by its name in its
    // own render; nothing is written here.
    void text;
    void name;
`
    : `    if (text === "" && typeof name === "string" && name !== "") control.setAttribute("aria-label", name);
    else control.removeAttribute("aria-label");
`
}  }

  #activate(event: Event): void {
    if (this.propValue("loading") === true || this.propValue("disabled") === true) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
${
  isGroup
    ? `    // A radio group (Spec 010 ③, D-06): a click on a row chooses its option.
    const row = event.composedPath().find(
      (node) => node instanceof HTMLElement && node.getAttribute("part") === "option",
    );
    if (row instanceof HTMLElement) this.#choose(this.#rows().indexOf(row));
`
    : `    if (!(this.#control instanceof HTMLButtonElement)) return;
${toggleActivate}`
}  }
${groupMethods}${selectMethods}${inputMethods}${dialogMethods}${statusMethods}${slotTextMethod}${lightMethods}${autoMethods}${tabsMethods}${overlayMethods}${tooltipMethods}${menuMethods}${suggestMethods}${uploadMethods}${choiceValidityMethods}
}

/**
 * Registers <${tag}> once. Called on import, and exported so a wrapper can call it explicitly:
 * a bundler may drop a bare side-effect import, but never a called function (F6). Without a DOM
 * (server-side rendering) it does nothing.
 */
export function define${className}(): void {
  if (typeof customElements === "undefined" || customElements.get("${tag}") !== undefined) return;
  customElements.define("${tag}", ${className});
}

define${className}();

for (const prop of PROPS) {
  Object.defineProperty(${className}.prototype, camel(prop.name), {
    configurable: true,
    enumerable: true,
    get(this: ${className}) {
      return this.propValue(prop.name);
    },
    set(this: ${className}, next: unknown) {
      // A boolean whose default is true (Spec 015 ③, plan ③ D-03) is written as "false" when off;
      // React 19 hands the wrapper's "false" to the property, React 18 to the attribute.
      if (prop.kind === "boolean" && prop.default === true) {
        if (next === false || next === "false") this.setAttribute(prop.name, "false");
        else this.removeAttribute(prop.name);
      } else if (prop.kind === "boolean") this.toggleAttribute(prop.name, next === true);
      else if (next === undefined || next === null) this.removeAttribute(prop.name);
      else this.setAttribute(prop.name, String(next));
    },
  });
}`;
  if (inline !== true)
    return `${head}
${body}
`;
  // The Make Kit holds every Ero in one module (D-14): each element's module-level names live in
  // a function scope of their own, so two Eroj never collide (Spec 008).
  const scoped = body
    .replace(`export class ${className} extends Base`, `class ${className} extends Base`)
    .replace(`export function define${className}()`, `function define${className}()`);
  return `const { ${className}, define${className} } = (() => {
${head}
${scoped}
  return { ${className}, define${className} };
})();
export { ${className}, define${className} };
`;
}
