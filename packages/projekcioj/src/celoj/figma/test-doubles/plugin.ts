// An in-memory stand-in for the slice of the Figma Plugin API the generated plugin uses (Spec 003
// T016). It is a test double, not a simulation of Figma: it records what the plugin creates and
// changes, so idempotency can be proved without Figma. Every method here must exist in the real
// API with the same shape.

export interface DoubleVariable {
  id: string;
  name: string;
  resolvedType: string;
  collectionId: string;
  hiddenFromPublishing: boolean;
  valuesByMode: Record<string, unknown>;
  setValueForMode(modeId: string, value: unknown): void;
}

export interface DoubleMode {
  modeId: string;
  name: string;
}

export interface DoubleCollection {
  id: string;
  name: string;
  modes: DoubleMode[];
  defaultModeId: string;
  renameMode(modeId: string, name: string): void;
  addMode(name: string): string;
}

export interface DoubleNode {
  id: string;
  type: string;
  name: string;
  children: DoubleNode[];
  parent?: DoubleNode | undefined;
  properties: Record<string, unknown>;
  /** Properties that still hold the value the tool gave the node, not one the plugin wrote (F13). */
  defaults: Set<string>;
  boundVariables: Record<string, string>;
  pluginData: Record<string, string>;
  appendChild(child: DoubleNode): void;
  insertChild(index: number, child: DoubleNode): void;
  setSharedPluginData(namespace: string, key: string, value: string): void;
  getSharedPluginData(namespace: string, key: string): string;
  setBoundVariable(field: string, variable: DoubleVariable | null): void;
  layoutMode?: string;
  fontName?: { family: string; style: string };
  remove(): void;
}

export interface DoubleCounts {
  collections: number;
  variables: number;
  nodes: number;
  valueWrites: number;
}

export interface DoubleNotification {
  message: string;
  options?: Record<string, unknown> | undefined;
}

export interface FigmaDouble {
  figma: Record<string, unknown>;
  /** Every toast the plugin asked for, in order (F10). */
  notifications: DoubleNotification[];
  counts: DoubleCounts;
  collections: DoubleCollection[];
  variables: DoubleVariable[];
  root: DoubleNode;
  /** A snapshot for comparing two runs. */
  snapshot(): string;
  /**
   * Every node property among `keys` that still holds the tool's default, as "<path>: <property>".
   * Empty means: nothing in the file carries a value the plan did not put there (F13).
   */
  untouchedDefaults(keys: readonly string[]): string[];
}

/**
 * Fields Figma only honours on an auto-layout frame (F11). Bound on a frame whose `layoutMode` is
 * "NONE" they change nothing in the file — the double refuses them, so a projection that forgets
 * the layout mode cannot pass unseen.
 */
const AUTO_LAYOUT_FIELDS: ReadonlySet<string> = new Set([
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "paddingBottom",
  "itemSpacing",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
]);

/**
 * What Figma gives a new node before the plugin writes anything (F13). A frame and a component
 * start with a white fill, a text with a black one, an empty string and Inter; the double starts
 * the same way, or it cannot see a default that nobody clears. Size (100 × 100) is modelled with
 * F11, where the geometry becomes the plugin's business.
 */
const FIGMA_DEFAULTS: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {
  FRAME: {
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
    strokes: [],
    effects: [],
    cornerRadius: 0,
    opacity: 1,
    clipsContent: true,
    layoutMode: "NONE",
    layoutPositioning: "AUTO",
    layoutSizingHorizontal: "FIXED",
    layoutSizingVertical: "FIXED",
    width: 100,
    height: 100,
  },
  COMPONENT: {
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
    strokes: [],
    effects: [],
    cornerRadius: 0,
    opacity: 1,
    clipsContent: true,
    layoutMode: "NONE",
    layoutPositioning: "AUTO",
    layoutSizingHorizontal: "FIXED",
    layoutSizingVertical: "FIXED",
    width: 100,
    height: 100,
  },
  // combineAsVariants draws Figma's own frame around a set: a purple dashed line with rounded
  // corners. It is a default like any other — on the list of what the plugin owns.
  COMPONENT_SET: {
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
    strokes: [{ type: "SOLID", color: { r: 0.592, g: 0.278, b: 1 } }],
    dashPattern: [10, 5],
    effects: [],
    cornerRadius: 5,
    opacity: 1,
    clipsContent: true,
    layoutMode: "NONE",
    layoutPositioning: "AUTO",
    layoutSizingHorizontal: "FIXED",
    layoutSizingVertical: "FIXED",
    width: 100,
    height: 100,
  },
  TEXT: {
    fills: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }],
    effects: [],
    opacity: 1,
    characters: "",
    fontName: { family: "Inter", style: "Regular" },
    fontSize: 12,
    layoutPositioning: "AUTO",
    layoutSizingHorizontal: "HUG",
    layoutSizingVertical: "HUG",
  },
};

let sequence = 0;
const id = (prefix: string) => `${prefix}:${++sequence}`;

/** "Geist Medium": how a font is named in a message and in the loaded set. */
const fontKey = (font: { family: string; style: string }) => `${font.family} ${font.style}`;

/**
 * The fonts a new Figma file has without anything installed: Inter in its styles. Everything
 * else must be given to the double, as a file would have it (F11).
 */
const FIGMA_FONTS = ["Regular", "Medium", "SemiBold", "Bold"].map((style) => ({
  family: "Inter",
  style,
}));

/** Where a node lies and how large it is, as the layout of the file computes it (F14). */
export interface DoubleBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** What a node needs from the file around it: the loaded fonts and the computed layout. */
interface NodeContext {
  loaded: ReadonlySet<string>;
  box?: (node: DoubleNode) => DoubleBox;
}

const GEOMETRY_KEYS: ReadonlySet<string> = new Set(["x", "y", "width", "height"]);

function node(
  type: string,
  name: string,
  counts: DoubleCounts,
  context: NodeContext = { loaded: new Set() },
): DoubleNode {
  const loaded = context.loaded;
  counts.nodes++;
  // The proxy is the node's identity: children and parents must point at it, not at the raw
  // object, or a comparison by identity fails.
  let recorded: DoubleNode;
  const self: DoubleNode = {
    id: id(type),
    type,
    name,
    children: [],
    // Declared here so the recording proxy treats it as a field of the node, not as a property
    // the plugin sets.
    parent: undefined,
    properties: structuredClone({ ...(FIGMA_DEFAULTS[type] ?? {}) }),
    defaults: new Set(Object.keys(FIGMA_DEFAULTS[type] ?? {})),
    boundVariables: {},
    pluginData: {},
    appendChild(child) {
      child.parent?.children.splice(child.parent.children.indexOf(child), 1);
      child.parent = recorded;
      self.children.push(child);
    },
    insertChild(index, child) {
      child.parent?.children.splice(child.parent.children.indexOf(child), 1);
      child.parent = recorded;
      self.children.splice(index, 0, child);
    },
    setSharedPluginData(namespace, key, value) {
      self.pluginData[`${namespace}/${key}`] = value;
    },
    getSharedPluginData(namespace, key) {
      return self.pluginData[`${namespace}/${key}`] ?? "";
    },
    setBoundVariable(field, variable) {
      if (AUTO_LAYOUT_FIELDS.has(field) && (self.properties.layoutMode ?? "NONE") === "NONE") {
        throw new Error(
          `${self.type} "${self.name}": ${field} only takes effect with auto layout, and ` +
            'layoutMode is "NONE". Set layoutMode before binding it (F11).',
        );
      }
      if (variable === null) delete self.boundVariables[field];
      else self.boundVariables[field] = variable.name;
    },
    remove() {
      self.parent?.children.splice(self.parent.children.indexOf(recorded), 1);
      self.parent = undefined;
    },
  };
  // Everything the plugin assigns directly — `node.fills`, `node.minHeight`, `node.characters` —
  // lands in `properties`, so the double records it and `snapshot()` shows it. Without this the
  // double swallowed every such assignment, and a projection could lose a value unseen (F8).
  recorded = new Proxy(self, {
    set(target, key, value) {
      // Figma refuses a text in a font that is not loaded: setting it, or setting characters in
      // the font the text has (F11). The double does too, instead of accepting it silently.
      if (target.type === "TEXT" && (key === "fontName" || key === "characters")) {
        const font = (key === "fontName" ? value : target.properties.fontName) as {
          family: string;
          style: string;
        };
        if (!loaded.has(fontKey(font))) {
          throw new Error(`The font "${fontKey(font)}" is not loaded; call loadFontAsync first.`);
        }
      }
      if (typeof key === "string" && !(key in target)) {
        target.properties[key] = value;
        // Written by the plugin: from now on the value is the plugin's, not the tool's.
        target.defaults.delete(key);
        return true;
      }
      return Reflect.set(target, key, value);
    },
    get(target, key) {
      // Size and place are computed by the layout of the file, never read from what was last
      // written: the double does not assume a size the tool would compute differently (F14).
      if (typeof key === "string" && GEOMETRY_KEYS.has(key) && context.box !== undefined) {
        return context.box(recorded)[key as keyof DoubleBox];
      }
      if (typeof key === "string" && !(key in target) && key in target.properties) {
        return target.properties[key];
      }
      return Reflect.get(target, key);
    },
  });
  return recorded;
}

/**
 * The layout of a file, as far as the plugin relies on it (F14). It follows what Figma was
 * measured to do, not a theory of it:
 * - a text is as wide as its characters (0.6 × font size each) and 1.25 × its font size high —
 *   an estimate; tests compare sizes with each other, never with a text width;
 * - an auto-layout frame hugs an axis when it says so (layoutSizing HUG, or the older AUTO sizing
 *   modes), adds its paddings and the spacing between its children in the flow, and grows to its
 *   minimum sizes; otherwise it keeps its width and height (Figma's default 100 × 100);
 * - a grid is modelled as it was **observed**, and only so (run 2 in file E7shE7m0z6O8VWPoGyN8ZT,
 *   2026-09-21): the variants had their own, correct size, yet the hugging set measured 48 × 96 —
 *   paddings and gaps around tracks of size zero — and all 72 children lay at one place. The
 *   children evidently did not take part in the grid. An earlier version of this double explained
 *   the 48 × 96 with "an unsized child counts as 0 × 0"; the run refuted that, and the theory is
 *   gone. Why Figma does what it does is **not known**; until a measurement says, the double
 *   claims nothing beyond the observation.
 * Numbers bound to a variable take its value in the first mode of its collection.
 */
function layoutOf(
  root: DoubleNode,
  resolve: (name: string) => unknown,
): Map<DoubleNode, DoubleBox> {
  const boxes = new Map<DoubleNode, DoubleBox>();
  const sizes = new Map<DoubleNode, { width: number; height: number }>();
  const num = (current: DoubleNode, field: string): number => {
    const bound = current.boundVariables[field];
    const value = bound === undefined ? current.properties[field] : resolve(bound);
    return typeof value === "number" ? value : 0;
  };
  const prop = (current: DoubleNode, field: string) => current.properties[field];
  const hugs = (current: DoubleNode, axis: "H" | "V"): boolean => {
    if (prop(current, axis === "H" ? "layoutSizingHorizontal" : "layoutSizingVertical") === "HUG") {
      return true;
    }
    const mode = prop(current, "layoutMode");
    const primary = (axis === "H") === (mode === "HORIZONTAL");
    return prop(current, primary ? "primaryAxisSizingMode" : "counterAxisSizingMode") === "AUTO";
  };
  const inFlow = (current: DoubleNode) =>
    current.children.filter((child) => prop(child, "layoutPositioning") !== "ABSOLUTE");

  const measure = (current: DoubleNode): { width: number; height: number } => {
    const known = sizes.get(current);
    if (known !== undefined) return known;
    let size: { width: number; height: number };
    const mode = prop(current, "layoutMode");
    if (current.type === "TEXT") {
      const fontSize = num(current, "fontSize") || 12;
      const characters = String(prop(current, "characters") ?? "");
      size = { width: characters.length * fontSize * 0.6, height: fontSize * 1.25 };
    } else if (mode === "HORIZONTAL" || mode === "VERTICAL") {
      const children = inFlow(current).map(measure);
      const along = (child: { width: number; height: number }) =>
        mode === "HORIZONTAL" ? child.width : child.height;
      const across = (child: { width: number; height: number }) =>
        mode === "HORIZONTAL" ? child.height : child.width;
      const spacing = num(current, "itemSpacing") * Math.max(0, children.length - 1);
      const main = children.reduce((sum, child) => sum + along(child), 0) + spacing;
      const cross = Math.max(0, ...children.map(across));
      const padX = num(current, "paddingLeft") + num(current, "paddingRight");
      const padY = num(current, "paddingTop") + num(current, "paddingBottom");
      const contentW = (mode === "HORIZONTAL" ? main : cross) + padX;
      const contentH = (mode === "HORIZONTAL" ? cross : main) + padY;
      size = {
        width: Math.max(
          hugs(current, "H") ? contentW : num(current, "width"),
          num(current, "minWidth"),
        ),
        height: Math.max(
          hugs(current, "V") ? contentH : num(current, "height"),
          num(current, "minHeight"),
        ),
      };
    } else if (mode === "GRID") {
      // Observed: tracks of size zero, so a hugging grid is its paddings and its gaps.
      const columns = Math.max(1, num(current, "gridColumnCount"));
      const rows = Math.max(1, num(current, "gridRowCount"));
      const contentW =
        num(current, "paddingLeft") +
        num(current, "paddingRight") +
        num(current, "gridColumnGap") * (columns - 1);
      const contentH =
        num(current, "paddingTop") +
        num(current, "paddingBottom") +
        num(current, "gridRowGap") * (rows - 1);
      size = {
        width: hugs(current, "H") ? contentW : num(current, "width"),
        height: hugs(current, "V") ? contentH : num(current, "height"),
      };
    } else {
      size = { width: num(current, "width"), height: num(current, "height") };
    }
    sizes.set(current, size);
    return size;
  };

  const place = (current: DoubleNode, box: DoubleBox): void => {
    boxes.set(current, box);
    const mode = prop(current, "layoutMode");
    if (mode === "GRID") {
      // Observed: every child at one place, each with its own size.
      for (const child of current.children) {
        place(child, {
          x: num(current, "paddingLeft"),
          y: num(current, "paddingTop"),
          ...measure(child),
        });
      }
      return;
    }
    if (mode === "HORIZONTAL" || mode === "VERTICAL") {
      let cursor = mode === "HORIZONTAL" ? num(current, "paddingLeft") : num(current, "paddingTop");
      for (const child of inFlow(current)) {
        const size = measure(child);
        const x = mode === "HORIZONTAL" ? cursor : num(current, "paddingLeft");
        const y = mode === "HORIZONTAL" ? num(current, "paddingTop") : cursor;
        place(child, { x, y, ...size });
        cursor += (mode === "HORIZONTAL" ? size.width : size.height) + num(current, "itemSpacing");
      }
      return;
    }
    for (const child of current.children) {
      place(child, { x: num(child, "x"), y: num(child, "y"), ...measure(child) });
    }
  };

  place(root, { x: 0, y: 0, ...measure(root) });
  return boxes;
}

/**
 * A double that swallows is worse than none (Jugxo jug_01M3094ZC6F3XZ1H0MWQZ62MYV): reaching for
 * an API member this double does not model must fail loudly and name the member, instead of
 * handing out `undefined` and letting a green run say nothing. Symbols are left alone — they are
 * how the runtime and the test framework inspect an object, not how the plugin calls Figma.
 */
function strict<T extends object>(name: string, api: T): T {
  return new Proxy(api, {
    get(target, key, receiver) {
      if (typeof key === "string" && !(key in target)) {
        throw new Error(
          `The Figma double does not model ${name}.${key}. Model it in test-doubles/plugin.ts — ` +
            "a double that silently answers for the tool proves nothing.",
        );
      }
      return Reflect.get(target, key, receiver);
    },
  });
}

/** A fresh double with an empty document; `fonts` are the fonts the file has besides Inter. */
export function figmaDouble(
  options: { fonts?: readonly { family: string; style: string }[] } = {},
): FigmaDouble {
  const counts: DoubleCounts = { collections: 0, variables: 0, nodes: 0, valueWrites: 0 };
  const available = new Set([...FIGMA_FONTS, ...(options.fonts ?? [])].map(fontKey));
  const loaded = new Set<string>();
  // Filled below, once the document and the variables exist.
  const context: NodeContext = { loaded };
  const notifications: DoubleNotification[] = [];
  const collections: DoubleCollection[] = [];
  const variables: DoubleVariable[] = [];
  const root = node("DOCUMENT", "Document", counts, context);
  const page = node("PAGE", "Page 1", counts, context);
  root.appendChild(page);

  const createCollection = (name: string): DoubleCollection => {
    counts.collections++;
    const modes: DoubleMode[] = [{ modeId: id("mode"), name: "Mode 1" }];
    const collection: DoubleCollection = {
      id: id("collection"),
      name,
      modes,
      defaultModeId: modes[0]?.modeId ?? "",
      renameMode(modeId, next) {
        const mode = modes.find((candidate) => candidate.modeId === modeId);
        if (mode !== undefined) mode.name = next;
      },
      addMode(next) {
        const modeId = id("mode");
        modes.push({ modeId, name: next });
        return modeId;
      },
    };
    collections.push(collection);
    return collection;
  };

  const createVariable = (
    name: string,
    collection: DoubleCollection,
    type: string,
  ): DoubleVariable => {
    counts.variables++;
    const variable: DoubleVariable = {
      id: id("variable"),
      name,
      resolvedType: type,
      collectionId: collection.id,
      hiddenFromPublishing: false,
      valuesByMode: {},
      setValueForMode(modeId, value) {
        counts.valueWrites++;
        variable.valuesByMode[modeId] = value;
      },
    };
    variables.push(variable);
    return variable;
  };

  const figma = strict("figma", {
    root,
    currentPage: page,
    variables: strict("figma.variables", {
      getLocalVariableCollectionsAsync: async () => [...collections],
      getLocalVariablesAsync: async () => [...variables],
      createVariableCollection: createCollection,
      createVariable,
      createVariableAlias: (variable: DoubleVariable) => ({
        type: "VARIABLE_ALIAS",
        id: variable.id,
      }),
      setBoundVariableForPaint: (paint: unknown, _field: string, variable: DoubleVariable) => ({
        ...(paint as Record<string, unknown>),
        boundVariables: { color: { type: "VARIABLE_ALIAS", id: variable.id, name: variable.name } },
      }),
    }),
    createComponent: () => node("COMPONENT", "Component", counts, context),
    createFrame: () => node("FRAME", "Frame", counts, context),
    createText: () => node("TEXT", "Text", counts, context),
    createRectangle: () => node("RECTANGLE", "Rectangle", counts, context),
    combineAsVariants: (components: DoubleNode[], parent: DoubleNode) => {
      const set = node("COMPONENT_SET", "Component Set", counts, context);
      // Component properties live on the set (F11): a TEXT property the labels are connected to.
      const definitions: Record<string, { type: string; defaultValue: string }> = {};
      set.properties.componentPropertyDefinitions = definitions;
      Object.assign(set, {
        addComponentProperty(name: string, type: string, defaultValue: string) {
          const key = `${name}#${id("property")}`;
          definitions[key] = { type, defaultValue };
          return key;
        },
        editComponentProperty(key: string, change: { defaultValue?: string }) {
          const definition = definitions[key];
          if (definition === undefined) throw new Error(`No component property ${key}.`);
          if (change.defaultValue !== undefined) definition.defaultValue = change.defaultValue;
          return key;
        },
      });
      parent.appendChild(set);
      for (const component of components) set.appendChild(component);
      return set;
    },
    loadFontAsync: async (font: { family: string; style: string }) => {
      if (!available.has(fontKey(font))) {
        throw new Error(`The font "${fontKey(font)}" is not available in this file.`);
      }
      loaded.add(fontKey(font));
    },
    notify: (message: string, options?: Record<string, unknown>) => {
      notifications.push({ message, options });
    },
    closePlugin: () => undefined,
    // Declared because the generated plugin probes it before it runs itself: what the double
    // models, it models on purpose.
    command: undefined,
  });

  const snapshot = () =>
    JSON.stringify(
      {
        collections: collections.map((collection) => ({
          name: collection.name,
          modes: collection.modes.map((mode) => mode.name),
        })),
        variables: [...variables]
          .sort((a, b) => (a.name < b.name ? -1 : 1))
          .map((variable) => ({
            name: variable.name,
            type: variable.resolvedType,
            hidden: variable.hiddenFromPublishing,
            values: Object.entries(variable.valuesByMode).map(([, value]) => value),
          })),
        nodes: describe(root),
      },
      null,
      1,
    );

  // A number bound to a variable: its value in the first mode of its collection, aliases followed.
  const resolve = (name: string): unknown => {
    let variable = variables.find((candidate) => candidate.name === name);
    for (let depth = 0; variable !== undefined && depth < 32; depth++) {
      const collection = collections.find((candidate) => candidate.id === variable?.collectionId);
      const value = variable.valuesByMode[collection?.modes[0]?.modeId ?? ""];
      const alias = value as { type?: string; id?: string } | undefined;
      if (alias?.type !== "VARIABLE_ALIAS") return value;
      variable = variables.find((candidate) => candidate.id === alias.id);
    }
    return undefined;
  };
  context.box = (current: DoubleNode) => {
    let top = current;
    while (top.parent !== undefined) top = top.parent;
    const box = layoutOf(top, resolve).get(current);
    return box ?? { x: 0, y: 0, width: 0, height: 0 };
  };

  const untouchedDefaults = (keys: readonly string[]) => {
    const found: string[] = [];
    const walk = (current: DoubleNode, path: string) => {
      for (const key of keys) {
        if (current.defaults.has(key)) found.push(`${path}: ${key}`);
      }
      for (const child of current.children) walk(child, `${path}/${child.name}`);
    };
    walk(root, root.name);
    return found;
  };

  return {
    figma,
    notifications,
    counts,
    collections,
    variables,
    root,
    snapshot,
    untouchedDefaults,
  };
}

function describe(current: DoubleNode): unknown {
  return {
    type: current.type,
    name: current.name,
    pluginData: current.pluginData,
    bound: current.boundVariables,
    properties: current.properties,
    children: current.children.map(describe),
  };
}
