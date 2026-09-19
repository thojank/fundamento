// Behaviour template of a generated Ero element (Spec 003, plan D-07). Hand-written once, here in
// the generator; every element in @fundamento/eroj is this template with the names of one Ero and
// its Skemo descriptor filled in (Art. I). The element holds no visible text: the label comes from
// the default slot or the `label` prop (Art. VIII). Console warnings are developer messages.

export interface ElementNames {
  /** `fm-butono` */
  tag: string;
  /** `FmButono` */
  className: string;
  /** `BUTONO` (prefix of the generated constants) */
  constant: string;
  /** `butono` (file name of the stylesheet) */
  ero: string;
}

/** The TypeScript source of one element. */
export function elementSource({ tag, className, constant, ero }: ElementNames): string {
  return `import { ${constant}_SKEMO as SKEMO } from "./skemo.js";
import { ${constant}_CSS as CSS } from "./${ero}.styles.js";

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

/** Generated from the Skemo of ${ero}; behaviour from the template in @fundamento/projekcioj. */
export class ${className} extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = PROPS.map((prop) => prop.name);

  readonly #internals: ElementInternals;
  readonly #control: HTMLButtonElement;
  readonly #label: HTMLSlotElement;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    const root = this.attachShadow({ mode: "open", delegatesFocus: true });
    if (sheet === undefined) {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(CSS);
    }
    root.adoptedStyleSheets = [sheet];
    root.innerHTML = \`<button part="control" type="button"><slot name="icon-start"></slot><slot></slot><slot name="icon-end"></slot></button>\`;
    const control = root.querySelector("button");
    const label = root.querySelector("slot:not([name])");
    if (!(control instanceof HTMLButtonElement) || !(label instanceof HTMLSlotElement)) {
      throw new Error("${tag}: shadow template is incomplete");
    }
    this.#control = control;
    this.#label = label;
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

  #render(): void {
    const control = this.#control;
    for (const [name, value] of Object.entries(this.#enums())) {
      control.setAttribute(\`data-\${name}\`, value);
    }
    control.disabled = this.value("disabled") === true;
    const busy = this.value("loading") === true;
    if (busy) {
      control.setAttribute("aria-busy", "true");
      control.setAttribute("aria-disabled", "true");
    } else {
      control.removeAttribute("aria-busy");
      control.removeAttribute("aria-disabled");
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
    const type = this.value("type");
    const form = this.#internals.form;
    if (form === null) return;
    if (type === "submit") form.requestSubmit();
    else if (type === "reset") form.reset();
  }
}

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
