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
 * radiogroup named by its label, one row with role radio per option of the light DOM.
 */
export type HostControl = "button" | "a" | "input" | "toggle" | "group";

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

/** The native control of an a11y role; everything that is not a link is a button. */
export function hostOf(role: string): HostControl {
  if (role === "link") return "a";
  if (role === "textbox") return "input";
  if (role === "switch" || role === "checkbox") return "toggle";
  if (role === "radiogroup") return "group";
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
function fieldMarkup(slots: NonNullable<ElementNames["slots"]>): string {
  return `<div part="field"><label part="label" for="control"><slot></slot><span part="required-mark" aria-hidden="true">${REQUIRED_MARK}</span></label><input part="control" id="control">${textsMarkup(slots)}<span id="fm-texts" hidden></span></div>`;
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
  if (host === "toggle") return toggleMarkup(role, slots, marked);
  if (host === "group") return groupMarkup(slots, marked);
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
        : host === "group"
          ? "[role=radiogroup]"
          : "button";
  const isToggle = host === "toggle";
  const isGroup = host === "group";
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
  static formAssociated = ${host === "a" ? "false" : "true"};
  static observedAttributes = PROPS.map((prop) => prop.name);

  readonly #internals: ElementInternals;
  readonly #control: HTMLElement;
  /** The element the combination is written on: the field of a composite, else the control. */
  readonly #root: HTMLElement;
  readonly #label: HTMLSlotElement;
  readonly #texts: HTMLElement;

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
${toggleKeys}${groupInit}    label.addEventListener("slotchange", () => this.#render());
    for (const named of root.querySelectorAll("slot[name]")) {
      named.addEventListener("slotchange", () => this.#render());
    }
    if (control instanceof HTMLInputElement) {
      // The value a person types is the form value (ElementInternals, as fm-butono submits), and
      // the prop reflects it, so a wrapper reads what stands in the field.
      control.addEventListener("input", () => {
        this.#internals.setFormValue(control.value);
        if (this.getAttribute("value") !== control.value) this.setAttribute("value", control.value);
      });
    }
  }

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
    return raw ?? undefined;
  }

  /** Enum values after validation and the Skemo constraints. */
  #enums(): Record<string, string> {
    const values: Record<string, string> = {};
    for (const prop of PROPS) {
      if (prop.kind === "enum") values[prop.name] = String(this.propValue(prop.name));
    }
    for (const constraint of CONSTRAINTS) {
      const applies = Object.entries(constraint.when).every(([key, value]) => values[key] === value);
      const violated = Object.entries(constraint.allowed).some(
        ([key, allowed]) => values[key] !== undefined && !allowed.includes(values[key] ?? ""),
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
    if (control instanceof HTMLInputElement) {
      const kind = this.propValue("kind");
      control.type = typeof kind === "string" && kind !== "" ? kind : "text";
      const value = this.propValue("value");
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
      if (invalid) control.setAttribute("aria-invalid", "true");
      else control.removeAttribute("aria-invalid");
    }
${toggleRender}${groupRender}    // The texts of the slots that describe the control (Spec 009, D-02; a checkbox, Spec 010 ②):
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
${groupMethods}
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
