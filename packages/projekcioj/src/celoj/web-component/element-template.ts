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
  | "dialog";

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
  slots?: { name: string; default?: boolean; decorative?: boolean; list?: boolean }[];
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
export function hostOf(role: string, multiline = false): HostControl {
  if (role === "link") return "a";
  if (role === "textbox") return multiline ? "textarea" : "input";
  if (role === "dialog") return "dialog";
  if (role === "switch" || role === "checkbox") return "toggle";
  if (role === "radiogroup") return "group";
  if (role === "combobox") return "select";
  return "button";
}

/**
 * The decorative mark the control shows when a prop with an a11y text is true (Spec 008, D-05):
 * the fallback of the last decorative slot, so a slotted icon replaces it. An arrow out of a box,
 * in the current colour, sized like an icon; no text node, no name of its own.
 */
const MARK =
  '<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10l5-5M7 5h4v4M9 3H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7"/></svg>';

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

/** The outline of the check mark in a box of 16 × 16 (Spec 010 ②, D-08). */
const CHECK_PATH = "M6.4 12.6 2.2 8.4l1.4-1.4 2.8 2.8 6-6 1.4 1.4z";

/**
 * The chevron of a select in a box of 16 × 16 (Spec 010 ④, D-05): a filled outline pointing down,
 * centred, so that Figma imports one vector whose fill is the colour of the indicator, as for the
 * check mark (② D-09).
 */
const CHEVRON_PATH = "M1.9 5.7 3.3 4.3 8 9l4.7-4.7 1.4 1.4L8 11.8z";

/**
 * The sign the indicator of a toggle shows, per a11y role (Spec 010 ②, D-08, D-09): the check mark
 * of a checkbox, a filled vector in the current colour — the colour of the part indicator; a sign
 * of the projection, no text node (Art. VIII), like the mark of a required field. A knob has none.
 * The web fills the indicator with it (`100%`); the Figma Celo imports the same vector in its own
 * box of 16 (one shape for both pictures).
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
  if (role !== "checkbox") return undefined;
  return `<svg aria-hidden="true" viewBox="0 0 16 16" width="${size}" height="${size}" fill="currentColor"><path d="${CHECK_PATH}"/></svg>`;
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
function fieldMarkup(slots: NonNullable<ElementNames["slots"]>, textarea = false): string {
  // A text area (Spec 011 ②, D-11): the platform's textarea in place of the input.
  const native = textarea
    ? '<textarea part="control" id="control"></textarea>'
    : '<input part="control" id="control">';
  return `<div part="field"><label part="label" for="control"><slot></slot><span part="required-mark" aria-hidden="true">${REQUIRED_MARK}</span></label>${native}${textsMarkup(slots)}<span id="fm-texts" hidden></span></div>`;
}

/**
 * The shadow markup of a dialog (Spec 011 ②, plan ② D-12, G4): the platform's own dialog as the
 * control, named by its heading and described by its message; content for the fields of a form
 * dialog (E9), the reason as a tekstareo the dialog shows itself (its label from the slot reason),
 * the actions slotted butono at the end. aria-modal says what showModal does.
 */
function dialogMarkup(): string {
  return `<dialog part="control" aria-modal="true" aria-labelledby="heading" aria-describedby="message"><h2 part="heading" id="heading"><slot></slot></h2><p part="message" id="message"><slot name="message"></slot></p><div part="content"><slot name="content"></slot></div><fm-tekstareo part="reason" rows="3"><slot name="reason"></slot></fm-tekstareo><div part="actions"><slot name="actions"></slot></div><span id="fm-texts" hidden></span></dialog>`;
}

/**
 * The shadow markup of a select (Spec 010 ④, D-06): the field of the kampo — label with the mark
 * of a required field, help and error below — around the platform's own select (role combobox
 * from the browser) and the chevron (indicator) at its end, side by side in one row. The options
 * of the light DOM are written into the select as the platform's options when it renders; the
 * list that opens is the platform's (E3).
 */
function selectMarkup(slots: NonNullable<ElementNames["slots"]>, role: string): string {
  return `<div part="field"><label part="label" for="control"><slot></slot><span part="required-mark" aria-hidden="true">${REQUIRED_MARK}</span></label><div><select part="control" id="control"></select><span part="indicator" aria-hidden="true">${signOf(role) ?? ""}</span></div>${textsMarkup(slots)}<span id="fm-texts" hidden></span></div>`;
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
  return `<div part="field"><button part="control" id="control" type="button" role="${role}" aria-labelledby="label"><span part="indicator">${signOf(role) ?? ""}</span></button>${beside}<span id="fm-texts" hidden></span></div>`;
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

/** The shadow markup of the control: slots before the label (icon-start), the label, the rest. */
function markup(
  host: HostControl,
  slots: NonNullable<ElementNames["slots"]>,
  role: string,
  marked: boolean,
): string {
  if (host === "input") return fieldMarkup(slots);
  if (host === "textarea") return fieldMarkup(slots, true);
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
  slots = [
    { name: "label", default: true },
    { name: "icon-start", decorative: true },
    { name: "icon-end", decorative: true },
  ],
}: ElementNames): string {
  const head =
    inline === true
      ? `const SKEMO = ${constant}_SKEMO;\nconst CSS = ${constant}_CSS;`
      : `import { ${constant}_SKEMO as SKEMO } from "./skemo.js";\nimport { ${constant}_CSS as CSS } from "./${ero}.styles.js";`;
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
                : "button";
  const isToggle = host === "toggle";
  const isGroup = host === "group";
  const isSelect = host === "select";
  const isFieldHost = host === "input" || host === "textarea";
  // The platform element of a field: the generated code names it, so the types narrow (TS).
  const nativeField = host === "textarea" ? "HTMLTextAreaElement" : "HTMLInputElement";
  const isDialog = host === "dialog";
  const listSlot = slots.find((slot) => slot.list === true)?.name ?? "";
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
    select.required = required;
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
  const invalidReport = isFieldHost
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
  host === "input"
    ? `      // A number is a text input with a numeric keyboard and a whole-number pattern (Spec 011 ①,
      // E8; GOV.UK: type=number changes its value with the wheel and the arrows); a date is the
      // platform's own dialog; a password hides what is typed. Every other kind is its type.
      control.type = kind === "number" ? "text" : kind;
      if (kind === "number") {
        control.setAttribute("inputmode", "numeric");
        control.setAttribute("pattern", "-?[0-9]+");
      } else {
        control.removeAttribute("inputmode");
        control.removeAttribute("pattern");
      }
      // What the platform fills in, and the bounds of a number or a date (the platform checks
      // them on a date; the element on a number, below).
      for (const attribute of ["autocomplete", "min", "max"]) {
        const given = this.propValue(attribute);
        if (typeof given === "string" && given !== "") control.setAttribute(attribute, given);
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
      if (control.value !== text) control.value = text;
      this.#internals.setFormValue(text);
      const placeholder = this.propValue("placeholder");
      if (typeof placeholder === "string" && placeholder !== "") control.setAttribute("placeholder", placeholder);
      else control.removeAttribute("placeholder");
      const formName = this.propValue("name");
      if (typeof formName === "string" && formName !== "") control.setAttribute("name", formName);
      else control.removeAttribute("name");
      const required = this.propValue("required") === true;
      control.required = required;
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
    } else if (kind === "number" && text !== "" && !/^-?[0-9]+$/.test(text)) {
      flags = { patternMismatch: true };
      if (own === "") message = control.validationMessage;
    } else if (kind === "number" && text !== "") {
      const number = Number(text);
      const min = this.propValue("min");
      const max = this.propValue("max");
      if (typeof min === "string" && min !== "" && number < Number(min)) flags = { rangeUnderflow: true };
      else if (typeof max === "string" && max !== "" && number > Number(max)) flags = { rangeOverflow: true };
      if (own === "") message = this.#platformMessage(text, min, max);
    } else if (kind === "date" && !control.validity.valid) {
      flags = {
        badInput: control.validity.badInput,
        rangeUnderflow: control.validity.rangeUnderflow,
        rangeOverflow: control.validity.rangeOverflow,
      };
      if (own === "") message = control.validationMessage;
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
  const body = `
type Value = string | boolean;

const PROPS = SKEMO.props as readonly {
  name: string;
  kind: "enum" | "boolean" | "string" | "number";
  values?: readonly string[];
  default?: string | boolean | number;
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
/** The keys the Skemo names (Space, Enter): a toggle turns with these alone (Spec 010 ②). */
const KEYS = SKEMO.a11y.keys as readonly string[];
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
const warned = new Set<string>();

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
  static formAssociated = ${host === "a" || host === "dialog" ? "false" : "true"};
  static observedAttributes = PROPS.map((prop) => prop.name);

  readonly #internals: ElementInternals;
  readonly #control: HTMLElement;
  /** The element the combination is written on: the field of a composite, else the control. */
  readonly #root: HTMLElement;
  readonly #label: HTMLSlotElement;
  readonly #texts: HTMLElement;
${isFieldHost ? "  /** Whether a person touched the field or the form reported it invalid (Spec 011 ② F-8): the error shows from then on. */\n  #reported = false;\n" : ""}
  constructor() {
    super();
    this.#internals = this.attachInternals();
    const root = this.attachShadow({ mode: "open", delegatesFocus: true${isGroup ? ', slotAssignment: "manual"' : ""} });
    if (sheet === undefined) {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(CSS);
    }
    root.adoptedStyleSheets = [sheet];
    root.innerHTML = \`${markup(host, slots, role, marked)}\`;
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
    this.#root = root.querySelector('[part="field"]') ?? control;
    this.#label = label;
    this.#texts = texts;
    control.addEventListener("click", (event) => this.#activate(event));
${toggleKeys}${groupInit}${selectInit}${dialogInit}    label.addEventListener("slotchange", () => this.#render());
    for (const named of root.querySelectorAll("slot[name]")) {
      named.addEventListener("slotchange", () => this.#render());
    }
    if (control instanceof ${nativeField}) {
      // The value a person types is the form value (ElementInternals, as fm-butono submits), and
      // the prop reflects it, so a wrapper reads what stands in the field.
      control.addEventListener("input", () => {
        this.#internals.setFormValue(control.value);
        if (this.getAttribute("value") !== control.value) this.setAttribute("value", control.value);
      });
    }
${invalidReport}${inputEnter}  }

  connectedCallback(): void {
${isGroup ? "    this.#assign();\n" : ""}    this.#render();
  }

  attributeChangedCallback(): void {
    this.#render();
  }

  /**
   * The value of a prop after validation: an invalid value falls back to the default. Named apart
   * from the props: a field has a prop \`value\` (Spec 009), whose accessor must not shadow this.
   */
  propValue(name: string): Value | undefined {
    const prop = PROPS.find((candidate) => candidate.name === name);
    if (prop === undefined) return undefined;
    if (prop.kind === "boolean") return this.hasAttribute(name);
    const raw = this.getAttribute(name);
    if (prop.kind === "enum") {
      const allowed = prop.values ?? [];
      if (raw !== null && !allowed.includes(raw)) {
        warn(\`${tag}: \${name}="\${raw}" is not allowed; using \${String(prop.default)} (allowed: \${allowed.join(", ")}).\`);
      }
      return raw !== null && allowed.includes(raw) ? raw : String(prop.default ?? allowed[0] ?? "");
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
    const read: Record<string, string> = { ...values };
    for (const prop of PROPS) {
      if (prop.kind !== "string") continue;
      const given = this.propValue(prop.name);
      read[\`prop:\${prop.name}\`] = typeof given === "string" && given !== "" ? "filled" : "empty";
    }
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
        values[key] = String(prop?.default ?? "");
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
      if (busy) {
        control.setAttribute("aria-busy", "true");
        control.setAttribute("aria-disabled", "true");
      } else {
        control.removeAttribute("aria-busy");
        control.removeAttribute("aria-disabled");
      }
    }
    // A link: \`to\` is its target (Art. VIII, the Web Celo spells it href); \`external\` marks
    // that the target lies outside the application (Spec 008, D-09).
    if (control instanceof HTMLAnchorElement) {
      const to = this.propValue("to");
      if (typeof to === "string" && to !== "") control.setAttribute("href", to);
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
${inputRender}${toggleRender}${groupRender}${selectRender}${dialogRender}    // The texts of the slots that describe the control (Spec 009, D-02; a checkbox, Spec 010 ②):
    // shown while they have text, and its description in that order.
    for (const source of DESCRIPTION) {
      const [kind, name = ""] = source.split(":");
      const holder = this.shadowRoot?.getElementById(name);
      const has = kind === "slot" ? this.#filled(name) : typeof this.propValue(name) === "string";
      if (holder instanceof HTMLElement) holder.hidden = !has;
      if (has) described.push(name);
    }
    // What is heard in addition (Spec 008, D-02): the texts of every true boolean prop, in the
    // language of the document, as the description of the control; the mark shows with them.
    const lingvo = this.#lingvo();
    const heard = Object.entries(TEXTS)
      .filter(([prop]) => this.propValue(prop) === true)
      .map(([, byLingvo]) => byLingvo[lingvo] ?? byLingvo.en ?? Object.values(byLingvo)[0] ?? "");
    this.#texts.textContent = heard.join(" ");
    if (heard.length > 0) described.push("fm-texts");
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
    if (text === "" && typeof name === "string" && name !== "") control.setAttribute("aria-label", name);
    else control.removeAttribute("aria-label");
  }

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
${groupMethods}${selectMethods}${inputMethods}${dialogMethods}
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
      if (prop.kind === "boolean") this.toggleAttribute(prop.name, next === true);
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
