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
  },
  COMPONENT: {
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
    strokes: [],
    effects: [],
    cornerRadius: 0,
    opacity: 1,
    clipsContent: true,
    layoutMode: "NONE",
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
  },
  TEXT: {
    fills: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }],
    effects: [],
    opacity: 1,
    characters: "",
    fontName: { family: "Inter", style: "Regular" },
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

function node(
  type: string,
  name: string,
  counts: DoubleCounts,
  loaded: ReadonlySet<string> = new Set(),
): DoubleNode {
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
      if (typeof key === "string" && !(key in target) && key in target.properties) {
        return target.properties[key];
      }
      return Reflect.get(target, key);
    },
  });
  return recorded;
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
  const notifications: DoubleNotification[] = [];
  const collections: DoubleCollection[] = [];
  const variables: DoubleVariable[] = [];
  const root = node("DOCUMENT", "Document", counts);
  const page = node("PAGE", "Page 1", counts);
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
    createComponent: () => node("COMPONENT", "Component", counts),
    createFrame: () => node("FRAME", "Frame", counts),
    createText: () => node("TEXT", "Text", counts, loaded),
    createRectangle: () => node("RECTANGLE", "Rectangle", counts),
    combineAsVariants: (components: DoubleNode[], parent: DoubleNode) => {
      const set = node("COMPONENT_SET", "Component Set", counts);
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
