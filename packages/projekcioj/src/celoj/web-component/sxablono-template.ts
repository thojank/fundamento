// The web Celo of the Sxablonoj (Spec 020, G2): a custom element fm-<name> per Sxablono, a slot per
// region, the landmarks, the live region and the focus target its Skemo names — and no behaviour
// besides (G5: data, routing and submitting are the application's). The layout follows the width
// of the container (container queries, never the viewport); every space and surface is a token of
// the Skemo's parts. Which element holds which region is Celo knowledge (Art. VIII): the frame of
// an application has a banner and a main, a page a head row of title, badges and actions.

import { type LoadedSxablono, nomRegulo, type ResolvedToken } from "@fundamento/modelo";

export interface SxablonoNames {
  tag: string;
  className: string;
  constant: string;
  name: string;
}

export function sxablonoNamesOf(entry: LoadedSxablono): SxablonoNames {
  const name = entry.sxablono.name;
  const camel = name.replace(/(^|-)([a-z0-9])/g, (_match, _dash, letter: string) =>
    letter.toUpperCase(),
  );
  return {
    tag: `fm-${name}`,
    className: `Fm${camel}`,
    constant: name.replaceAll("-", "_").toUpperCase(),
    name,
  };
}

const variable = (token: string) => `var(${nomRegulo("css").derive(token)})`;

/** A region holder: a div with the part of the region around its slot (the default slot too). */
function holder(entry: LoadedSxablono, name: string, element = "div", attributes = ""): string {
  const region = entry.skemo.regions.find((candidate) => candidate.name === name);
  if (region === undefined) return "";
  const live = region.live === undefined ? "" : ` aria-live="${region.live}"`;
  const fallback = region.default === true ? "<slot></slot>" : "";
  return `<${element} part="${name}"${live}${attributes}><slot name="${name}"></slot>${fallback}</${element}>`;
}

/**
 * The shadow markup. The frame of an application (a11y.landmarks banner and main): its own skip
 * link first (focus-only — the main lies in the shadow tree, a fragment could not reach it), the
 * regions before the navigation in the header (banner), the navigation, the notices, the main.
 * A page: a head row — the title with its badges and the subtitle beside the actions — then the
 * sections. Any other Sxablono: its regions in order.
 */
export function sxablonoMarkup(entry: LoadedSxablono): string {
  const { regions, a11y } = entry.skemo;
  const names = regions.map((region) => region.name);
  if (a11y.landmarks.includes("banner") && a11y.landmarks.includes("main")) {
    const navAt = names.indexOf("nav");
    const head = names.slice(0, navAt === -1 ? 2 : navAt);
    const rest = names.filter((name) => !head.includes(name) && name !== a11y.skip);
    const skip =
      a11y.skip === undefined
        ? ""
        : `<fm-saltligilo part="skip" to="${a11y.skip}" focus-only></fm-saltligilo>`;
    return `<div part="frame">${skip}<header part="header">${head.map((name) => holder(entry, name)).join("")}</header>${rest.map((name) => holder(entry, name)).join("")}${a11y.skip === undefined ? "" : holder(entry, a11y.skip, "main", ` id="${a11y.skip}" tabindex="-1"`)}</div>`;
  }
  if (a11y.focus !== undefined && names.includes("actions")) {
    const lead = names.filter((name) => name === a11y.focus || name === "badges");
    const below: string[] = names.filter((name) => name === "subtitle");
    const after = names.filter(
      (name) => !lead.includes(name) && !below.includes(name) && name !== "actions",
    );
    return `<div part="frame"><div part="head"><div part="lead"><div part="heading">${lead.map((name) => holder(entry, name)).join("")}</div>${below.map((name) => holder(entry, name)).join("")}</div>${holder(entry, "actions")}</div>${after.map((name) => holder(entry, name)).join("")}</div>`;
  }
  // A filter bar (a11y.landmarks search): the landmark search, named by the label prop in the
  // render; its fields in a row, below them the status (role status, polite) beside the actions.
  if (a11y.landmarks.includes("search")) {
    const footer: string[] = names.filter((name) => name === "status" || name === "actions");
    const rest = names.filter((name) => !footer.includes(name));
    return `<div part="frame" role="search">${rest.map((name) => holder(entry, name)).join("")}<div part="footer">${footer.map((name) => holder(entry, name, "div", name === "status" ? ' role="status"' : "")).join("")}</div></div>`;
  }
  // A form (a region asks for exactly one child, the submit button): the landmark form, named by
  // the label prop; its regions in order — problems, fields, actions.
  if (regions.some((region) => region.one !== undefined)) {
    return `<div part="frame" role="form">${names.map((name) => holder(entry, name)).join("")}</div>`;
  }
  return `<div part="frame">${names.map((name) => holder(entry, name)).join("")}</div>`;
}

/** Where a part property of the Skemo goes in CSS (Celo knowledge, Art. VIII). */
const PROPERTY_CSS: Readonly<Record<string, string>> = {
  fill: "background-color",
  color: "color",
  gap: "gap",
  "inline-padding": "padding-inline",
  width: "max-inline-size",
};

/** The px of a dimension token in the base resolution, for a container query (no var() there). */
function lengthOf(token: string, base: Readonly<Record<string, ResolvedToken>>): string {
  const value = base[token]?.value as { value?: number; unit?: string } | undefined;
  if (value?.value === undefined) throw new Error(`Sxablono: ${token} has no dimension value`);
  return `${value.value}${value.unit ?? "px"}`;
}

/**
 * The stylesheet: the host is a block and the container of its own queries; every region a flex
 * box; the parts take their tokens; below the width of the part container (a size.container.*
 * token, resolved for the condition) the rows stack. Logical properties only, so RTL mirrors.
 */
export function sxablonoStylesheetOf(
  entry: LoadedSxablono,
  base: Readonly<Record<string, ResolvedToken>>,
): string {
  const { parts } = entry.skemo;
  const fixed = (part: string, property: string) => {
    const source = parts[part]?.[property as keyof (typeof parts)[string]];
    return source !== undefined && "fixed" in source ? source.fixed : undefined;
  };
  const rules: string[] = [
    ":host { display: block; container-type: inline-size; }",
    ":host([hidden]) { display: none; }",
    "[hidden] { display: none; }",
    '[part="frame"] { display: flex; flex-direction: column; }',
  ];
  const search = entry.skemo.a11y.landmarks.includes("search");
  const rows = [
    "header",
    "head",
    "heading",
    "badges",
    "actions",
    "principal",
    ...(search ? ["fields", "footer"] : []),
  ];
  for (const region of entry.skemo.regions.map((candidate) => candidate.name).concat(rows)) {
    const direction = rows.includes(region) ? "row" : "column";
    rules.push(
      `[part="${region}"] { display: flex; flex-direction: ${direction}; flex-wrap: wrap; box-sizing: border-box; }`,
    );
  }
  rules.push(
    '[part="header"], [part="head"] { align-items: center; justify-content: space-between; }',
    '[part="heading"], [part="principal"] { align-items: center; }',
    '[part="footer"] { align-items: center; justify-content: space-between; }',
    '[part="lead"] { display: flex; flex-direction: column; }',
  );
  for (const [part, properties] of Object.entries(parts)) {
    if (part === "container" || part === "divider") continue;
    const declarations = Object.keys(properties).flatMap((property) => {
      const token = fixed(part, property);
      const css = PROPERTY_CSS[property];
      return token === undefined || css === undefined ? [] : [`${css}: ${variable(token)};`];
    });
    if (declarations.length > 0) rules.push(`[part="${part}"] { ${declarations.join(" ")} }`);
  }
  // The divider under the header: a line of the border tokens, on its block end.
  const line = fixed("divider", "color");
  const lineWidth = fixed("divider", "width");
  if (line !== undefined && lineWidth !== undefined) {
    rules.push(
      `[part="header"] { border-block-end-style: solid; border-block-end-color: ${variable(line)}; border-block-end-width: ${variable(lineWidth)}; }`,
    );
  }
  // The gap between title and subtitle is the head's.
  const headGap = fixed("head", "gap");
  if (headGap !== undefined) rules.push(`[part="lead"] { gap: ${variable(headGap)}; }`);
  const stack = fixed("container", "width");
  if (stack !== undefined) {
    rules.push(
      `@container (inline-size < ${lengthOf(stack, base)}) { [part="header"], [part="head"] { flex-direction: column; align-items: flex-start; } }`,
    );
  }
  return rules.join("\n");
}

/**
 * The element module. Inline (the Make Kit holds every element in one module) the names live in
 * a function scope of their own, as the Eroj' do.
 */
export function sxablonoElementSource(
  entry: LoadedSxablono,
  options: { inline?: boolean } = {},
): string {
  const { tag, className, constant, name } = sxablonoNamesOf(entry);
  const { regions, a11y } = entry.skemo;
  // A region that is empty takes no room — but a live region stays, to be heard when it fills,
  // and so do the main and the focus target.
  const hideable = regions
    .filter(
      (region) =>
        region.live === undefined &&
        region.default !== true &&
        region.name !== a11y.skip &&
        region.name !== a11y.focus,
    )
    .map((region) => region.name);
  const isForm = regions.some((region) => region.one !== undefined);
  const named = entry.skemo.props.some((prop) => prop.name === "label");
  const head =
    options.inline === true
      ? `const CSS = ${constant}_CSS;`
      : `import { ${constant}_CSS as CSS } from "./${name}.styles.js";`;
  // Spec 020 ② (G7): the one event of a Sxablono — submit of a form, sent by its submit button or
  // Enter in a one-line field, once, with the values of its fields; an invalid field stops it,
  // reports its error at the field and takes the focus (novalidate: no bubble of the browser).
  const formMethods = isForm
    ? `
  #onClick(event: Event): void {
    const button = event
      .composedPath()
      .find((node) => node instanceof HTMLElement && node.tagName.toLowerCase() === "fm-butono");
    if (!(button instanceof HTMLElement) || button.parentElement !== this) return;
    if (button.getAttribute("type") !== "submit" || button.hasAttribute("disabled")) return;
    event.preventDefault();
    this.#submit();
  }

  #onKey(event: KeyboardEvent): void {
    if (event.key !== "Enter" || event.isComposing || event.defaultPrevented) return;
    const origin = event.composedPath()[0];
    if (!(origin instanceof HTMLInputElement) || NOT_ONE_LINE.has(origin.type)) return;
    event.preventDefault();
    this.#submit();
  }

  /** The fields: every child in the region of the fields (the default slot). */
  #fields(): HTMLElement[] {
    return [...this.children].filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && (child.slot === "" || child.slot === "fields"),
    );
  }

  #submit(): void {
    const fields = this.#fields();
    const invalid = fields.filter((field) => {
      const check = (field as { checkValidity?: () => boolean }).checkValidity;
      return typeof check === "function" && !check.call(field);
    });
    if (invalid.length > 0) {
      invalid[0]?.focus();
      return;
    }
    const values: Record<string, unknown> = {};
    for (const field of fields) {
      const fieldName = field.getAttribute("name");
      if (fieldName === null || fieldName === "") continue;
      if ("checked" in field) {
        if ((field as { checked?: unknown }).checked === true) values[fieldName] = field.getAttribute("value") ?? "on";
        continue;
      }
      values[fieldName] = (field as { value?: unknown }).value ?? field.getAttribute("value") ?? "";
    }
    this.dispatchEvent(new CustomEvent("submit", { bubbles: true, cancelable: true, detail: { values } }));
  }
`
    : "";
  // As a template literal: the markup holds no backtick and no placeholder.
  const body = `const MARKUP = \`${sxablonoMarkup(entry)}\`;
const HIDEABLE: readonly string[] = ${JSON.stringify(hideable)};
const FOCUS: string | undefined = ${JSON.stringify(a11y.focus)};
/** The props of the Sxablono (its Skemo), observed as attributes. */
const PROPS: readonly { name: string; kind: string }[] = ${JSON.stringify(entry.skemo.props.map((prop) => ({ name: prop.name, kind: prop.kind })))};${isForm ? '\n/** The inputs Enter does not send from: no one-line text. */\nconst NOT_ONE_LINE: ReadonlySet<string> = new Set(["checkbox", "radio", "button", "submit", "reset", "file", "range", "color"]);' : ""}

let sheet: CSSStyleSheet | undefined;

/** Without a DOM (server-side rendering) a stand-in keeps the module importable. */
const Base = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

/**
 * Generated from the Skemo of the Sxablono ${name} (Spec 020); a layout of regions: landmarks,
 * focus and live regions, nothing else (G5).
 */
export class ${className} extends Base {
  static observedAttributes = PROPS.map((prop) => prop.name);

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    if (sheet === undefined) {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(CSS);
    }
    root.adoptedStyleSheets = [sheet];
    root.innerHTML = MARKUP;
    for (const slot of root.querySelectorAll("slot")) {
      slot.addEventListener("slotchange", () => this.#render());
    }${isForm ? '\n    this.addEventListener("click", (event) => this.#onClick(event));\n    this.addEventListener("keydown", (event) => this.#onKey(event));' : ""}
  }

  connectedCallback(): void {
    this.#render();
  }

  attributeChangedCallback(): void {
    this.#render();
  }

  /** The focus target of the page (its title), else the element's own (G4). */
  override focus(options?: FocusOptions): void {
    if (FOCUS !== undefined) {
      const slot = this.shadowRoot?.querySelector(\`slot[name="\${FOCUS}"]\`);
      const target = slot instanceof HTMLSlotElement ? slot.assignedElements()[0] : undefined;
      if (target instanceof HTMLElement) {
        target.focus(options);
        return;
      }
    }
    super.focus(options);
  }

  #render(): void {${
    named
      ? `
    // The name of the landmark (search, form) is the label prop.
    const frame = this.shadowRoot?.querySelector('[part="frame"]');
    const label = this.getAttribute("label");
    if (frame instanceof HTMLElement && frame.hasAttribute("role")) {
      if (label === null || label === "") frame.removeAttribute("aria-label");
      else if (frame.getAttribute("aria-label") !== label) frame.setAttribute("aria-label", label);
    }`
      : ""
  }
    for (const region of HIDEABLE) {
      const holder = this.shadowRoot?.querySelector(\`[part="\${region}"]\`);
      const slot = holder?.querySelector("slot");
      if (!(holder instanceof HTMLElement) || !(slot instanceof HTMLSlotElement)) continue;
      const filled = slot.assignedNodes({ flatten: true }).some(
        (node) => node.nodeType === Node.ELEMENT_NODE || (node.textContent ?? "").trim() !== "",
      );
      if (holder.hidden === filled) holder.hidden = !filled;
    }
  }
${formMethods}}

/** Registers ${tag} once; importing twice is safe. */
export function define${className}(): void {
  if (typeof customElements === "undefined" || customElements.get("${tag}") !== undefined) return;
  customElements.define("${tag}", ${className});
}

define${className}();`;
  if (options.inline !== true) return `${head}\n\n${body}\n`;
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

/**
 * What the element module of a Sxablono states (Spec 020, parity of the web side): the regions it
 * has a slot for, sorted; it observes no attribute, so it has no props.
 */
export function sxablonoElementInventory(source: string): {
  props: Record<string, string[]>;
  states: string[];
  values: Record<string, string>;
} {
  const regions = [
    ...new Set([...source.matchAll(/<slot name="([a-z0-9-]+)">/g)].map((m) => m[1] ?? "")),
  ];
  const declared = /const PROPS: readonly \{ name: string; kind: string \}\[\] = (\[.*?\]);/.exec(
    source,
  );
  const props = Object.fromEntries(
    (JSON.parse(declared?.[1] ?? "[]") as { name: string; kind: string }[]).map((prop) => [
      prop.name,
      [prop.kind],
    ]),
  );
  return { props, states: [], values: { regions: regions.sort().join(",") } };
}
