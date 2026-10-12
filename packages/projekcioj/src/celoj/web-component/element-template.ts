// Behaviour template of a generated Ero element (Spec 003, plan D-07; Spec 008, plan D-09).
// Hand-written once, here in the generator; every element in @fundamento/eroj is this template
// with the names of one Ero and its Skemo descriptor filled in (Art. I). The control inside is the
// native element of the Ero's a11y role: a button for `button`, a link for `link`. The element
// holds no visible text: the label comes from the default slot or the `label` prop (Art. VIII);
// what assistive technology hears in addition comes from `a11y.texts` of the Skemo, in the
// language of the document. Console warnings are developer messages.

/** The native control an a11y role is rendered as (Celo knowledge, Art. VIII). */
export type HostControl = "button" | "a";

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
  /** Slot names in the order the Skemo declares them; the default slot is the label. */
  slots?: { name: string; default?: boolean; decorative?: boolean }[];
  /**
   * The Make Kit builds one file per Aspekto: the descriptor and the stylesheet are then constants
   * above the element instead of imports (D-14).
   */
  inline?: boolean;
}

/** The native control of an a11y role; everything that is not a link is a button. */
export function hostOf(role: string): HostControl {
  return role === "link" ? "a" : "button";
}

/**
 * The decorative mark the control shows when a prop with an a11y text is true (Spec 008, D-05):
 * the fallback of the last decorative slot, so a slotted icon replaces it. An arrow out of a box,
 * in the current colour, sized like an icon; no text node, no name of its own.
 */
const MARK =
  '<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10l5-5M7 5h4v4M9 3H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7"/></svg>';

/** The shadow markup of the control: slots before the label (icon-start), the label, the rest. */
function markup(host: HostControl, slots: NonNullable<ElementNames["slots"]>): string {
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
  const control = host === "a" ? "a" : "button";
  return `${head}

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
const HAS_PROP = new Set(PROPS.map((prop) => prop.name));

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
  static formAssociated = ${host === "button" ? "true" : "false"};
  static observedAttributes = PROPS.map((prop) => prop.name);

  readonly #internals: ElementInternals;
  readonly #control: HTMLElement;
  readonly #label: HTMLSlotElement;
  readonly #texts: HTMLElement;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    const root = this.attachShadow({ mode: "open", delegatesFocus: true });
    if (sheet === undefined) {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(CSS);
    }
    root.adoptedStyleSheets = [sheet];
    root.innerHTML = \`${markup(host, slots)}\`;
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
    this.#label = label;
    this.#texts = texts;
    control.addEventListener("click", (event) => this.#activate(event));
    label.addEventListener("slotchange", () => this.#render());
  }

  connectedCallback(): void {
    this.#render();
  }

  attributeChangedCallback(): void {
    this.#render();
  }

  /** The value of a prop after validation: an invalid value falls back to the default. */
  value(name: string): Value | undefined {
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
      if (prop.kind === "enum") values[prop.name] = String(this.value(prop.name));
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

  #render(): void {
    const control = this.#control;
    for (const [name, value] of Object.entries(this.#enums())) {
      control.setAttribute(\`data-\${name}\`, value);
    }
    if (HAS_PROP.has("disabled") && "disabled" in control) {
      (control as HTMLButtonElement).disabled = this.value("disabled") === true;
    }
    if (HAS_PROP.has("loading")) {
      const busy = this.value("loading") === true;
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
      const to = this.value("to");
      if (typeof to === "string" && to !== "") control.setAttribute("href", to);
      else {
        control.removeAttribute("href");
        warn(\`${tag}: to is required; a link without a target is text (boundary disabled-link).\`);
      }
      if (this.value("external") === true) control.setAttribute("rel", "external noopener noreferrer");
      else control.removeAttribute("rel");
    }
    // What is heard in addition (Spec 008, D-02): the texts of every true boolean prop, in the
    // language of the document, as the description of the control; the mark shows with them.
    const lingvo = this.#lingvo();
    const heard = Object.entries(TEXTS)
      .filter(([prop]) => this.value(prop) === true)
      .map(([, byLingvo]) => byLingvo[lingvo] ?? byLingvo.en ?? Object.values(byLingvo)[0] ?? "");
    this.#texts.textContent = heard.join(" ");
    if (heard.length > 0) {
      control.setAttribute("aria-describedby", "fm-texts");
      control.setAttribute("data-marked", "true");
    } else {
      control.removeAttribute("aria-describedby");
      control.removeAttribute("data-marked");
    }
    const text = this.#label
      .assignedNodes({ flatten: true })
      .map((node) => node.textContent ?? "")
      .join("")
      .trim();
    const name = this.value("label");
    if (text === "" && typeof name === "string" && name !== "") control.setAttribute("aria-label", name);
    else control.removeAttribute("aria-label");
  }

  #activate(event: Event): void {
    if (this.value("loading") === true || this.value("disabled") === true) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (!(this.#control instanceof HTMLButtonElement)) return;
    const type = this.value("type");
    const form = this.#internals.form;
    if (form === null) return;
    if (type === "submit") form.requestSubmit();
    else if (type === "reset") form.reset();
  }
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
      return this.value(prop.name);
    },
    set(this: ${className}, next: unknown) {
      if (prop.kind === "boolean") this.toggleAttribute(prop.name, next === true);
      else if (next === undefined || next === null) this.removeAttribute(prop.name);
      else this.setAttribute(prop.name, String(next));
    },
  });
}
`;
}
