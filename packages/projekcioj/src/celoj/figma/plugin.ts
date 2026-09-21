// The generated Figma development plugin (Spec 003, plan D-12). The maintainer imports it from its
// manifest in Figma desktop; development plugins run on every Figma plan, so the standard path does
// not depend on Organization or Enterprise. It applies `plan.json` — embedded as a constant, since
// a plugin reads no repository files — idempotently: it finds what it made by name and by the
// shared plugin data `fundamento`, updates it, and never duplicates. Nothing else in the file is
// touched. An agent can run the same code through the Figma MCP.
//
// The plugin uses this slice of the Plugin API (the test double covers exactly it):
// variables.getLocalVariableCollectionsAsync/getLocalVariablesAsync, createVariableCollection,
// createVariable, createVariableAlias, setBoundVariableForPaint, collection.addMode/renameMode,
// variable.setValueForMode, createComponent/createFrame/createText, combineAsVariants,
// appendChild, setBoundVariable, set/getSharedPluginData.

import type { FigmaPlan } from "./figma.js";

/** The nodes of one variant the plugin draws, outside in (F11). */
type PartNode = "focus-ring" | "focus-gap" | "control" | "label";

interface Binding {
  node: PartNode;
  fields: readonly string[];
  /** A colour: bound to the paint, with the deckkraft from the plan (F8). */
  paint?: boolean;
  /** The field of a composite token this binding takes: `focus/ring` + `/width`. */
  suffix?: string;
  /** Drawn only in the state that shows the focus ring; neutral in every other. */
  focusOnly?: boolean;
}

const PADDINGS = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"] as const;

/** Part property -> where the plugin binds it (Celo knowledge, Art. VIII). */
const BINDINGS: Readonly<Record<string, readonly Binding[]>> = {
  "surface.fill": [{ node: "control", fields: ["fills"], paint: true }],
  "border.color": [{ node: "control", fields: ["strokes"], paint: true }],
  "border.width": [{ node: "control", fields: ["strokeWeight"] }],
  // The web component sets min-block-size and min-inline-size: minimums, not fixed sizes (F11).
  "box.height": [{ node: "control", fields: ["minHeight"] }],
  "box.width": [{ node: "control", fields: ["minWidth"] }],
  // Inline padding is one value for both sides (F11): binding only the left one left the right
  // side at Figma's default.
  "box.inline-padding": [{ node: "control", fields: ["paddingLeft", "paddingRight"] }],
  "box.gap": [{ node: "control", fields: ["itemSpacing"] }],
  "box.radius": [{ node: "control", fields: ["cornerRadius"] }],
  "label.color": [{ node: "label", fields: ["fills"], paint: true }],
  // A typography token is a composite; Figma holds its fields as separate variables (F9). Bound
  // to the bare name, the size never arrived — there is no variable of that name.
  "label.typography": [{ node: "label", fields: ["fontSize"], suffix: "/font-size" }],
  // The focus ring as the web component draws it: an outline of the ring's width and colour at
  // outline-offset, and a box-shadow of the offset's width in color.focus.inner between them. Both
  // are rings, never areas (F15): each frame has a padding of the band's width and an inside stroke
  // of the same width, so the stroke fills exactly the band and the inside stays as transparent as
  // in rest — a fill put a white box behind the transparent tertiary action. The space for both is
  // reserved in every state, so nothing is clipped and every variant has the same size; only the
  // focus state shows the colours.
  "focus-ring.ring": [
    { node: "focus-ring", fields: [...PADDINGS, "strokeWeight"], suffix: "/width" },
    { node: "focus-ring", fields: ["strokes"], paint: true, suffix: "/color", focusOnly: true },
  ],
  "focus-ring.offset": [{ node: "focus-gap", fields: [...PADDINGS, "strokeWeight"] }],
  "focus-ring.color": [{ node: "focus-gap", fields: ["strokes"], paint: true, focusOnly: true }],
};

/**
 * What the plugin owns on every node it draws (Maintainer, 2026-09-21): fill, line, effects,
 * radius, opacity, clipping and layout. Each is a value from the plan or neutral; everything else
 * on a node the plugin does not touch. Neutral first, then the plan.
 */
const NEUTRAL: Readonly<Record<string, unknown>> = {
  fills: [],
  strokes: [],
  // A line lies inside its frame, as a CSS border does in a border-box; the rings of the focus
  // rely on it (F15).
  strokeAlign: "INSIDE",
  strokeWeight: 0,
  dashPattern: [],
  effects: [],
  cornerRadius: 0,
  opacity: 1,
  clipsContent: false,
};

/** A text has no line, radius or clipping of its own. */
const NEUTRAL_TEXT: Readonly<Record<string, unknown>> = { fills: [], effects: [], opacity: 1 };

/**
 * A frame that wraps its content in both axes: the variant, the ring and the gap (F11). The sizing
 * is set with layoutSizing, which Figma honours both for the frame itself and for it as a child of
 * the grid: without it the grid measured every variant as 0 × 0 (F14).
 */
const HUG_LAYOUT: Readonly<Record<string, unknown>> = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "CENTER",
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
  // The strokes of ring and gap lie **in** the reserve their paddings make, they do not add to it
  // (F17): measured, a visible stroke made the focus variants 8 px larger than their row. An
  // outline does not change the size of the web component either.
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The layout the control needs so its bound measures take effect (F11). Without auto layout Figma
 * ignores padding, gap and minimum sizes, and the frame keeps its default 100 × 100: the label sits
 * centred in a row whose height is at least `box.height` and whose width follows its content.
 */
const CONTROL_LAYOUT: Readonly<Record<string, string>> = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "CENTER",
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
};

/** Every child of a variant lies in the flow of its parent, never freely placed (F14). */
const IN_FLOW: Readonly<Record<string, string>> = { layoutPositioning: "AUTO" };

/** A text that is as large as its characters. */
const TEXT_SIZING: Readonly<Record<string, string>> = {
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
};

export const PLUGIN_NAMESPACE = "fundamento";

/**
 * Every part property the plugin applies to the file. The Figma side of `check:parity` reports
 * exactly these and nothing else: a side claims only what it does (Paket „Figma zeigt das Ero").
 */
export const DRAWN_PART_PROPERTIES: readonly string[] = Object.keys(BINDINGS);

/** `code.js` with the plan embedded. */
export function pluginSource(plan: FigmaPlan): string {
  return `// Generated by fm projekcioj build; do not edit (Art. I). Fundamento ${plan.fundamento}.
const PLAN = ${JSON.stringify(plan)};
const NAMESPACE = ${JSON.stringify(PLUGIN_NAMESPACE)};
const BINDINGS = ${JSON.stringify(BINDINGS)};
const CONTROL_LAYOUT = ${JSON.stringify(CONTROL_LAYOUT)};
const HUG_LAYOUT = ${JSON.stringify(HUG_LAYOUT)};
const IN_FLOW = ${JSON.stringify(IN_FLOW)};
const TEXT_SIZING = ${JSON.stringify(TEXT_SIZING)};
const NEUTRAL = ${JSON.stringify(NEUTRAL)};
const NEUTRAL_TEXT = ${JSON.stringify(NEUTRAL_TEXT)};

/** The collection of a name, its modes renamed and completed, without duplicating anything. */
async function applyCollections() {
  const existing = await figma.variables.getLocalVariableCollectionsAsync();
  const byName = new Map(existing.map((collection) => [collection.name, collection]));
  const collections = new Map();
  const modeIds = new Map();
  for (const spec of PLAN.collections) {
    // A collection without variables is not created: in a Modelo with an external Aspekto every
    // token hangs on the aspekto Dimensio (Art. IV completeness), so fundamento can be empty.
    if (spec.variables.length === 0) continue;
    const collection = byName.get(spec.name) ?? figma.variables.createVariableCollection(spec.name);
    collections.set(spec.name, collection);
    const ids = {};
    spec.modes.forEach((mode, index) => {
      const known = collection.modes.find((candidate) => candidate.name === mode);
      if (known !== undefined) {
        ids[mode] = known.modeId;
        return;
      }
      const spare = collection.modes[index];
      if (index === 0 && spare !== undefined) {
        collection.renameMode(spare.modeId, mode);
        ids[mode] = spare.modeId;
        return;
      }
      ids[mode] = collection.addMode(mode);
    });
    modeIds.set(spec.name, ids);
  }
  return { collections, modeIds };
}

async function applyVariables(collections, modeIds) {
  const existing = await figma.variables.getLocalVariablesAsync();
  const byName = new Map(existing.map((variable) => [variable.name, variable]));
  const variables = new Map();
  for (const spec of PLAN.collections) {
    const collection = collections.get(spec.name);
    for (const variable of spec.variables) {
      const found =
        byName.get(variable.name) ??
        figma.variables.createVariable(variable.name, collection, variable.type);
      found.hiddenFromPublishing = variable.hidden === true;
      variables.set(variable.name, found);
    }
  }
  // Values last: an alias needs its target to exist.
  for (const spec of PLAN.collections) {
    const ids = modeIds.get(spec.name);
    for (const variable of spec.variables) {
      const found = variables.get(variable.name);
      for (const [mode, value] of Object.entries(variable.values)) {
        const target = value !== null && typeof value === "object" && "alias" in value
          ? figma.variables.createVariableAlias(variables.get(value.alias))
          : value;
        found.setValueForMode(ids[mode], target);
      }
    }
  }
  return variables;
}

/** The node this plugin made for \`key\`, or undefined; identified by shared plugin data. */
function ours(parent, key, value) {
  return parent.children.find(
    (child) => child.getSharedPluginData(NAMESPACE, key) === value,
  );
}

/** Sets the owned properties to the given values; lists start empty (F13). */
function own(node, values) {
  for (const [field, value] of Object.entries(values)) {
    node[field] = Array.isArray(value) ? [] : value;
  }
}

function bind(nodes, variant, variables) {
  for (const [part, name] of Object.entries(variant.bindings)) {
    for (const target of BINDINGS[part] || []) {
      const variable = variables.get(name + (target.suffix || ""));
      if (variable === undefined) continue;
      const node = nodes[target.node];
      if (target.paint === true) {
        // The focus ring shows only in the focus state; in every other its fill stays neutral.
        if (target.focusOnly === true && variant.focusVisible !== true) continue;
        // Figma binds only the RGB of a variable to a paint; the deckkraft comes from the plan
        // and is set here, in every case — also at 0, so the binding stays visible (F8).
        const paint = (variant.paints || {})[part];
        const bound = figma.variables.setBoundVariableForPaint(
          { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
          "color",
          variable,
        );
        if (paint !== undefined && typeof paint.opacity === "number") bound.opacity = paint.opacity;
        for (const field of target.fields) node[field] = [bound];
      } else {
        for (const field of target.fields) node.setBoundVariable(field, variable);
      }
    }
  }
}

/** The child of parent marked as the part, created when missing. */
function part(parent, name, create) {
  let found = ours(parent, "part", name);
  if (found === undefined) {
    found = create();
    found.setSharedPluginData(NAMESPACE, "part", name);
    parent.appendChild(found);
  }
  found.name = name;
  return found;
}

function variantName(props) {
  return Object.entries(props)
    .map(([key, value]) => key + "=" + value)
    .join(", ");
}

/**
 * Das Paar aus dem Endstand des vorigen Laufs ("left") und dem Anfangsstand dieses Laufs
 * ("before") gelesen — die Zeilen einzeln zu deuten führt in die Irre (F10b).
 */
function diagnose(report) {
  const planned = report.planned;
  if (!report.found) return "";
  const complete =
    report.created.length === 0 &&
    report.before.children === planned &&
    report.before.marked === planned;
  if (complete) return "";
  if (report.before.marked < report.before.children) {
    return "Ein Kind des Sets stand ohne Markierung da: die Markierung ist verloren gegangen, " +
      "der Knoten nicht.";
  }
  if (report.left === null) {
    return "Am Set steht kein Endstand eines früheren Laufs. Damit lassen sich „nie im Set " +
      "angekommen“ und „zwischen den Läufen verschwunden“ für dieses Set noch nicht trennen; " +
      "der nächste Lauf kann es.";
  }
  if (report.left.children < planned) {
    return "Schon der vorige Lauf hinterließ " + report.left.children + " statt " + planned +
      " Kinder: die Variante ist beim Anlegen nie im Set angekommen.";
  }
  if (report.before.children < report.left.children) {
    return "Der vorige Lauf hinterließ " + report.left.children + " Kinder, dieser fand " +
      report.before.children + ": zwischen den Läufen ist etwas verschwunden.";
  }
  return "";
}

/**
 * Loads the model's font; when the file does not have it, the one named fallback in the same
 * style, and says so. Nothing else is tried: a silent substitute would draw a different label
 * than the model (F11).
 */
async function loadFont(font, warnings) {
  try {
    await figma.loadFontAsync(font);
    return font;
  } catch (error) {
    const fallback = { family: PLAN.fontFallback, style: font.style };
    await figma.loadFontAsync(fallback);
    warnings.push(
      "Schrift " + font.family + " " + font.style + " ist in dieser Datei nicht verfügbar; " +
        "die Beschriftung steht ersatzweise in " + fallback.family + " " + fallback.style + ".",
    );
    return fallback;
  }
}

async function applyComponents(variables, warnings) {
  const fonts = new Map();
  for (const component of PLAN.components) {
    for (const variant of component.variants) {
      const key = variant.font.family + " " + variant.font.style;
      if (!fonts.has(key)) fonts.set(key, await loadFont(variant.font, warnings));
    }
  }
  const reports = [];
  for (const component of PLAN.components) {
    let set = ours(figma.currentPage, "ero", component.set);
    // How the run found the set, before it changed anything (F10b). Ohne diesen Blick lässt sich
    // hinterher nicht mehr unterscheiden, ob ein Knoten fehlte oder ob er nur seine Markierung
    // verloren hatte — der frisch angelegte Knoten verdeckt beides.
    const mark = (child) => child.getSharedPluginData(NAMESPACE, "variant");
    const before =
      set === undefined
        ? { children: 0, marked: 0, unmarked: [] }
        : {
            children: set.children.length,
            marked: set.children.filter((child) => mark(child) !== "").length,
            unmarked: set.children.filter((child) => mark(child) === "").map((child) => child.name),
          };
    // Was der vorige Lauf am Set hinterlassen hat. Lauf 2 lässt sich nur im Licht von Lauf 1
    // deuten: „71 Kinder beim Start" heißt nur dann „zwischen den Läufen verschwunden", wenn Lauf 1
    // mit 72 geendet hat (F10b). Deshalb legt jeder Lauf seinen Endstand hier ab.
    const stored = set === undefined ? "" : set.getSharedPluginData(NAMESPACE, "after");
    const report = {
      set: component.set,
      found: set !== undefined,
      planned: component.variants.length,
      left: stored === "" ? null : JSON.parse(stored),
      before: before,
      created: [],
      updated: [],
      missing: [],
      extra: [],
      duplicates: [],
      after: { children: 0, marked: 0 },
      diagnosis: "",
    };
    const made = [];
    const labels = [];
    for (const variant of component.variants) {
      const name = variantName(variant.props);
      const existing = set === undefined ? undefined : ours(set, "variant", name);
      (existing === undefined ? report.created : report.updated).push(name);
      const node = existing ?? figma.createComponent();
      node.name = name;
      node.setSharedPluginData(NAMESPACE, "variant", name);
      node.setSharedPluginData(NAMESPACE, "ero", component.set);
      // The structure (F11): variant → focus-ring → focus-gap → control → label, each found by
      // its part mark and created when missing. A control an older plugin left directly under
      // the variant is moved in, never duplicated.
      const ring = part(node, "focus-ring", () => figma.createFrame());
      const gap = part(ring, "focus-gap", () => figma.createFrame());
      const control =
        ours(gap, "part", "control") ??
        ours(node, "part", "control") ??
        part(gap, "control", () => figma.createFrame());
      if (control.parent !== gap) gap.appendChild(control);
      control.name = "control";
      const label = part(control, "label", () => figma.createText());
      label.fontName = fonts.get(variant.font.family + " " + variant.font.style);
      labels.push(label);
      // Only values from the plan (F13): every owned property neutral first — Figma's white fill,
      // its clipping and its line would otherwise cover what the plan draws.
      for (const frame of [node, ring, gap, control]) own(frame, NEUTRAL);
      own(label, NEUTRAL_TEXT);
      // Layout before any measure is bound: padding, gap and minimum sizes only take effect on
      // an auto-layout frame (F11). The variant, ring and gap wrap their content.
      for (const frame of [node, ring, gap]) own(frame, HUG_LAYOUT);
      own(control, CONTROL_LAYOUT);
      // The variant lies in the grid's flow, its parts in the variant's (F14).
      for (const child of [node, ring, gap, control, label]) own(child, IN_FLOW);
      own(label, TEXT_SIZING);
      ring.cornerRadius = variant.radii["focus-ring"];
      gap.cornerRadius = variant.radii["focus-gap"];
      bind({ "focus-ring": ring, "focus-gap": gap, control, label }, variant, variables);
      if (existing === undefined) made.push(node);
    }
    if (set === undefined) {
      set = figma.combineAsVariants(made, figma.currentPage);
      set.name = component.set;
    }
    // The set is a node the plugin owns too: combineAsVariants draws Figma's purple dashed frame
    // around it, which is not from the model (Maintainer, 2026-09-21).
    own(set, NEUTRAL);
    // The ground of the Vitrino (F16): the set is filled with the model's background, bound to the
    // variable so it follows color-scheme and contrast — never a fixed colour.
    if (component.surface !== undefined) {
      const ground = variables.get(component.surface.variable);
      if (ground !== undefined) {
        const bound = figma.variables.setBoundVariableForPaint(
          { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
          "color",
          ground,
        );
        bound.opacity = component.surface.opacity;
        set.fills = [bound];
      }
    }
    // The grid of the Vitrino (F11): one row per combination, one column per state, in the order
    // of the plan — a variant a later run had to create goes back to its place.
    const grid = component.grid;
    if (grid !== undefined) {
      own(set, {
        layoutMode: "GRID",
        gridRowCount: grid.rows,
        gridColumnCount: grid.columns,
        gridRowGap: grid.gap,
        gridColumnGap: grid.gap,
        paddingLeft: grid.padding,
        paddingRight: grid.padding,
        paddingTop: grid.padding,
        paddingBottom: grid.padding,
        layoutSizingHorizontal: "HUG",
        layoutSizingVertical: "HUG",
        // Manual positions: every variant is given its cell below (F14).
        gridItemsPositioning: "MANUAL",
      });
    }
    set.setSharedPluginData(NAMESPACE, "ero", component.set);
    set.setSharedPluginData(NAMESPACE, "skemo", component.pluginData.fundamento.skemo);
    set.setSharedPluginData(NAMESPACE, "version", component.pluginData.fundamento.version);
    for (const node of made) if (node.parent !== set) set.appendChild(node);
    // The label is a text property of the component (F11): declared once on the set, its default
    // the Vitrino's text, every label connected to it — an instance overrides it.
    if (component.label !== undefined) {
      const spec = component.label;
      const definitions = set.componentPropertyDefinitions || {};
      let key = Object.keys(definitions).find(
        (candidate) =>
          candidate.split("#")[0] === spec.property && definitions[candidate].type === "TEXT",
      );
      if (key === undefined) key = set.addComponentProperty(spec.property, "TEXT", spec.defaultValue);
      else set.editComponentProperty(key, { defaultValue: spec.defaultValue });
      for (const label of labels) {
        label.characters = spec.defaultValue;
        label.componentPropertyReferences = { characters: key };
      }
    }
    component.variants.forEach((variant, index) => {
      const node = ours(set, "variant", variantName(variant.props));
      if (node !== undefined && set.children.indexOf(node) !== index) set.insertChild(index, node);
    });
    // Figma does not distribute appended children over the grid (F14, measured: every anchor read
    // −1, the HUG tracks stayed empty, all variants lay at 0/0). Every variant is given its cell
    // with the API for a grid child — only where it is not there already: an occupied cell
    // throws, and what Figma does for the node that occupies it itself is not measured.
    const refused = [];
    if (grid !== undefined) {
      for (const variant of component.variants) {
        const node = ours(set, "variant", variantName(variant.props));
        if (node === undefined || variant.cell === undefined) continue;
        if (node.gridRowAnchorIndex === variant.cell.row &&
          node.gridColumnAnchorIndex === variant.cell.column) continue;
        try {
          node.setGridChildPosition(variant.cell.row, variant.cell.column);
        } catch (error) {
          refused.push(node.name + ": " + String(error && error.message ? error.message : error));
        }
      }
    }
    report.layout = measureLayout(set, component);
    report.layout.refused = refused;
    // Symmetric (F10): the plan against the file, in both directions, with names. The finding
    // behind this was a document that held 71 of 72 variants while nothing said so.
    const planned = component.variants.map((variant) => variantName(variant.props));
    const present = set.children.map((child) => child.name);
    report.missing = planned.filter((name) => present.indexOf(name) === -1);
    report.extra = present.filter((name) => planned.indexOf(name) === -1);
    report.duplicates = present.filter(
      (name, index) => present.indexOf(name) !== index && report.duplicates.indexOf(name) === -1,
    );
    // Wie der Lauf das Set hinterlässt, Markierungen eingeschlossen. Haftet eine Markierung im
    // Werkzeug nicht, sagt das schon dieser Lauf und nicht erst der nächste über den Umweg
    // „created: 1" (F10b).
    report.after = {
      children: set.children.length,
      marked: set.children.filter((child) => mark(child) !== "").length,
    };
    report.diagnosis = diagnose(report);
    // Ohne Zeitstempel: Zwei gleiche Läufe hinterlassen denselben Stand, sonst wäre der Lauf nicht
    // mehr idempotent.
    set.setSharedPluginData(NAMESPACE, "after", JSON.stringify(report.after));
    reports.push(report);
  }
  return reports;
}

const px = (value) => Math.round(value * 100) / 100;
const dims = (box) => px(box.width) + " × " + px(box.height);

/**
 * Reads back what the layout did, instead of trusting the call (F14): the size of every variant
 * against its content, the places the variants took, and the size of the set. Figma accepted a
 * grid once and left every variant at 0 × 0 — only a measurement says so.
 */
/**
 * Properties of the grid Figma may hold at the set; names it does not know are reported so. This
 * block stays in the report for good: exactly these raw data decided F14 (Maintainer, 2026-09-21).
 */
const HELD_AT_SET = [
  "type", "layoutMode", "layoutWrap", "gridItemsPositioning", "gridAutoTracks", "layoutSizingHorizontal", "layoutSizingVertical",
  "primaryAxisSizingMode", "counterAxisSizingMode", "gridRowCount", "gridColumnCount",
  "gridRowGap", "gridColumnGap", "gridRowSizes", "gridColumnSizes", "paddingLeft", "paddingRight",
  "paddingTop", "paddingBottom", "itemSpacing", "counterAxisSpacing", "clipsContent", "width",
  "height",
];

/** What Figma may hold at a part of a variant: its size, its line and how the line is laid out. */
const HELD_AT_PART = [
  "name", "type", "layoutMode", "layoutSizingHorizontal", "layoutSizingVertical",
  "strokesIncludedInLayout", "strokeAlign", "strokeWeight", "paddingLeft", "paddingRight",
  "paddingTop", "paddingBottom", "minWidth", "minHeight", "x", "y", "width", "height",
];

/** What Figma may hold at a child of the grid: its place, its sizing and its cell. */
const HELD_AT_VARIANT = [
  "name", "type", "layoutPositioning", "layoutSizingHorizontal", "layoutSizingVertical",
  "layoutAlign", "layoutGrow", "gridRowAnchorIndex", "gridColumnAnchorIndex", "gridRowSpan",
  "gridColumnSpan", "gridChildHorizontalAlign", "gridChildVerticalAlign", "layoutMode", "x", "y",
  "width", "height",
];

/**
 * Reads the named properties as the tool holds them — raw, no interpretation (F14: erst messen,
 * dann bauen). A property the tool does not have reads "nicht vorhanden"; one it throws on reads
 * "wirft: <its message>". Objects are kept as JSON, so track definitions arrive whole.
 */
function held(node, names) {
  const out = {};
  for (const name of names) {
    try {
      const value = node[name];
      out[name] = value === undefined
        ? "nicht vorhanden"
        : typeof value === "object" && value !== null
          ? JSON.parse(JSON.stringify(value))
          : value;
    } catch (error) {
      out[name] = "wirft: " + String(error && error.message ? error.message : error);
    }
  }
  return out;
}

function measureLayout(set, component) {
  const nodes = component.variants
    .map((variant) => ours(set, "variant", variantName(variant.props)))
    .filter((node) => node !== undefined);
  const boxes = nodes.map((node) => {
    const content = ours(node, "part", "focus-ring");
    return {
      name: node.name,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      content: content === undefined ? { width: 0, height: 0 } : { width: content.width, height: content.height },
    };
  });
  const zero = boxes.filter((box) => box.width === 0 || box.height === 0);
  const smaller = boxes.filter(
    (box) => box.width !== 0 && box.height !== 0 &&
      (box.width < box.content.width || box.height < box.content.height),
  );
  const unplaced = nodes
    .filter((node) => !(node.gridRowAnchorIndex >= 0 && node.gridColumnAnchorIndex >= 0))
    .map((node) => node.name);
  // One size per row (F17): the six states of a combination share their outer size, as in the
  // web component, where an outline takes no space.
  const rows = new Map();
  for (const box of boxes) {
    const node = nodes.find((candidate) => candidate.name === box.name);
    const row = node === undefined ? -1 : node.gridRowAnchorIndex;
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row).push(box);
  }
  const uneven = [];
  for (const [row, members] of rows) {
    const sizes = new Map();
    for (const box of members) {
      const key = dims(box);
      if (!sizes.has(key)) sizes.set(key, []);
      sizes.get(key).push(box.name);
    }
    if (sizes.size < 2) continue;
    const sorted = Array.from(sizes.entries()).sort((a, b) => b[1].length - a[1].length);
    uneven.push({
      row: row,
      usual: sorted[0][0],
      others: sorted.slice(1).map((entry) => ({ size: entry[0], variants: entry[1] })),
    });
  }
  const focused = nodes.find((node) => {
    const variant = component.variants.find((entry) => variantName(entry.props) === node.name);
    return variant !== undefined && variant.focusVisible === true;
  });
  const partsOf = (node) => {
    if (node === undefined) return {};
    const out = { variant: held(node, HELD_AT_PART) };
    let current = node;
    for (const name of ["focus-ring", "focus-gap", "control", "label"]) {
      current = current === undefined ? undefined : ours(current, "part", name);
      if (current !== undefined) out[name] = held(current, HELD_AT_PART);
    }
    return out;
  };
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const withParent = (node) =>
    node === undefined
      ? {}
      : Object.assign(held(node, HELD_AT_VARIANT), {
          parent: node.parent ? node.parent.type : "kein Elternknoten",
          index: set.children.indexOf(node),
        });
  return {
    held: {
      set: Object.assign(held(set, HELD_AT_SET), { children: set.children.length }),
      variant: withParent(first),
      last: withParent(last),
      // The parts of the first variant in rest and in focus, side by side (F17).
      rest: partsOf(first),
      focus: partsOf(focused),
    },
    set: { width: set.width, height: set.height },
    unplaced: unplaced,
    uneven: uneven,
    variants: boxes.length,
    places: new Set(boxes.map((box) => box.x + "," + box.y)).size,
    columns: new Set(boxes.map((box) => box.x)).size,
    rows: new Set(boxes.map((box) => box.y)).size,
    zero: zero.map((box) => box.name),
    smaller: smaller.map((box) => box.name),
    example: zero[0] || smaller[0] || null,
  };
}

/** The warnings of a layout that did not take effect, with its numbers. */
function layoutWarnings(report, grid) {
  const layout = report.layout;
  if (layout === undefined) return [];
  const out = [];
  const set = "das Set misst " + dims(layout.set);
  const example = layout.example === null
    ? ""
    : " (z. B. " + layout.example.name + ": " + dims(layout.example) + " bei Inhalt " +
      dims(layout.example.content) + ")";
  if (layout.unplaced.length > 0) {
    out.push(
      report.set + ": " + layout.unplaced.length + " von " + layout.variants +
        " Varianten liegen in keiner Zelle (Anker −1)" +
        (layout.unplaced.length <= 3 ? ": " + layout.unplaced.join("; ") : ", z. B. " + layout.unplaced[0]) +
        "; " + set + "." +
        (layout.refused && layout.refused.length > 0
          ? " Das Werkzeug lehnte " + layout.refused.length + " Zuweisung(en) ab, z. B. " + layout.refused[0] + "."
          : ""),
    );
  }
  if (layout.uneven.length > 0) {
    const worst = layout.uneven[0];
    const other = worst.others[0];
    out.push(
      report.set + ": " + layout.uneven.length + " von " +
        (grid === undefined ? layout.uneven.length : grid.rows) +
        " Zeilen haben Varianten unterschiedlicher Größe, z. B. Zeile " + worst.row + ": " +
        other.variants[0] + " misst " + other.size + " statt " + worst.usual + ".",
    );
  }
  if (layout.zero.length > 0) {
    out.push(
      report.set + ": " + layout.zero.length + " von " + layout.variants +
        " Varianten haben die Größe 0 × 0 oder eine Achse 0" + example + "; " + set + ".",
    );
  }
  if (layout.smaller.length > 0) {
    out.push(
      report.set + ": " + layout.smaller.length + " von " + layout.variants +
        " Varianten sind kleiner als ihr Inhalt" + example + "; " + set + ".",
    );
  }
  if (grid !== undefined &&
    (layout.places !== layout.variants || layout.columns !== grid.columns || layout.rows !== grid.rows)) {
    out.push(
      report.set + ": " + layout.places + " verschiedene Positionen statt " + layout.variants +
        ", " + layout.columns + " Spalten statt " + grid.columns + ", " + layout.rows +
        " Zeilen statt " + grid.rows + "; " + set + ".",
    );
  }
  return out;
}

/** Applies the whole plan; safe to run again. Returns the report of this run (F10). */
async function applyPlan() {
  const { collections, modeIds } = await applyCollections();
  const variables = await applyVariables(collections, modeIds);
  const warnings = [];
  const components = await applyComponents(variables, warnings);
  for (const report of components) {
    const component = PLAN.components.find((candidate) => candidate.set === report.set);
    warnings.push(...layoutWarnings(report, component === undefined ? undefined : component.grid));
    // Ein zweiter Lauf, der in einem vorgefundenen Set etwas anlegt, darf nie still durchgehen
    // (F10b): Entweder fehlte der Knoten, oder er hat seine Markierung verloren — beides ist ein
    // Befund, kein Normalfall.
    if (report.found && report.created.length > 0) {
      warnings.push(
        report.set + ": Das Set war vorgefunden, trotzdem wurden " + report.created.length +
          " Variante(n) neu angelegt (" + report.created.join("; ") + "). Beim Start trug es " +
          report.before.children + " Kinder, davon " + report.before.marked + " markiert" +
          (report.before.unmarked.length === 0
            ? ""
            : ", ohne Markierung: " + report.before.unmarked.join("; ")) +
          ".",
      );
    }
    if (report.diagnosis !== "") warnings.push(report.set + ": " + report.diagnosis);
    if (report.after.marked !== report.after.children) {
      warnings.push(
        report.set + ": " + (report.after.children - report.after.marked) +
          " von " + report.after.children +
          " Kindern sind nach dem Lauf ohne Markierung — der nächste Lauf würde sie nicht " +
          "wiederfinden und neu anlegen.",
      );
    }
    if (report.duplicates.length > 0) {
      warnings.push(
        report.set + ": " + report.duplicates.length +
          " Variantenname(n) doppelt (" + report.duplicates.join("; ") + ").",
      );
    }
    if (report.missing.length === 0 && report.extra.length === 0) continue;
    warnings.push(
      report.set + ": " + report.missing.length + " fehlen" +
        (report.missing.length === 0 ? "" : " (" + report.missing.join("; ") + ")") +
        ", " + report.extra.length + " überzählig" +
        (report.extra.length === 0 ? "" : " (" + report.extra.join("; ") + ")"),
    );
  }
  return {
    fundamento: PLAN.fundamento,
    collections: PLAN.collections.length,
    variables: variables.size,
    components: components,
    warnings: warnings,
  };
}

/** One place for the report: everything in the console, the headline in the toast (F10). */
function announce(result) {
  console.log(
    "Fundamento " + result.fundamento + " – Bericht:" + "\\n" + JSON.stringify(result, null, 2),
  );
  const counted = result.components
    .map((report) =>
      report.set + " " + report.created.length + " neu, " + report.updated.length + " aktualisiert",
    )
    .join("; ");
  const headline =
    result.warnings.length === 0
      ? "Fundamento " + result.fundamento + ": " + result.variables + " Variablen, " + counted + "."
      : "Fundamento " + result.fundamento + ": " + result.warnings.length +
        " Warnung(en) — " + result.warnings.join(" | ");
  figma.notify(
    headline + " Der ganze Bericht steht in der Konsole.",
    result.warnings.length === 0 ? undefined : { error: true, timeout: 10000 },
  );
}

if (typeof figma !== "undefined" && typeof figma.closePlugin === "function" && figma.command !== undefined) {
  applyPlan()
    .then((result) => {
      announce(result);
      figma.closePlugin();
    })
    // A rejection used to disappear: no toast, no console, a plugin that seemed to do nothing.
    .catch((error) => {
      console.error("Fundamento " + PLAN.fundamento + " – Lauf fehlgeschlagen:", error);
      figma.notify(
        "Fundamento " + PLAN.fundamento + ": Lauf fehlgeschlagen — " + String(error && error.message ? error.message : error) +
          ". Einzelheiten in der Konsole.",
        { error: true, timeout: 10000 },
      );
      figma.closePlugin();
    });
}
`;
}

/** `manifest.json` of the development plugin. */
export function pluginManifest(plan: FigmaPlan): string {
  return `${JSON.stringify(
    {
      name: `Fundamento ${plan.fundamento}: apply plan`,
      id: "fundamento-apply-plan",
      api: "1.0.0",
      main: "code.js",
      editorType: ["figma"],
      documentAccess: "dynamic-page",
      networkAccess: { allowedDomains: ["none"] },
    },
    null,
    2,
  )}\n`;
}
