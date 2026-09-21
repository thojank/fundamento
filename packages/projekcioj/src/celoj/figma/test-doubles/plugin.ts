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
  /** The cell of a child of a grid (GridChildrenMixin); −1/−1 until it is placed (F14). */
  setGridChildPosition(rowIndex: number, columnIndex: number): void;
  readonly gridRowAnchorIndex: number;
  readonly gridColumnAnchorIndex: number;
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
    strokeAlign: "INSIDE",
    strokeWeight: 1,
    effects: [],
    cornerRadius: 0,
    opacity: 1,
    clipsContent: true,
    layoutMode: "NONE",
    gridItemsPositioning: "MANUAL",
    layoutPositioning: "AUTO",
    layoutSizingHorizontal: "FIXED",
    layoutSizingVertical: "FIXED",
    width: 100,
    height: 100,
  },
  COMPONENT: {
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
    strokes: [],
    strokeAlign: "INSIDE",
    strokeWeight: 1,
    effects: [],
    cornerRadius: 0,
    opacity: 1,
    clipsContent: true,
    layoutMode: "NONE",
    gridItemsPositioning: "MANUAL",
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
    strokeAlign: "INSIDE",
    strokeWeight: 1,
    effects: [],
    cornerRadius: 5,
    opacity: 1,
    clipsContent: true,
    layoutMode: "NONE",
    gridItemsPositioning: "MANUAL",
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
  /**
   * Counts every change to the document. The layout is computed once per state of the document,
   * not once per read: reading x, y, width and height of 72 variants recomputed the whole tree
   * hundreds of times and took the plugin tests from 10 s to 117 s (and past 60 s on the CI).
   */
  version: number;
}

const GEOMETRY_KEYS: ReadonlySet<string> = new Set(["x", "y", "width", "height"]);

function node(
  type: string,
  name: string,
  counts: DoubleCounts,
  context: NodeContext = { loaded: new Set(), version: 0 },
): DoubleNode {
  const loaded = context.loaded;
  counts.nodes++;
  // The proxy is the node's identity: children and parents must point at it, not at the raw
  // object, or a comparison by identity fails.
  let recorded: DoubleNode;
  // The cell of this node in a grid. Measured on 2026-09-21 (file wSYaaAsB2EujMxGra84PoM): a child
  // that was appended, not placed, reads −1/−1 — Figma did not distribute the children itself.
  const anchor = { row: -1, column: -1 };
  const leaveCell = () => {
    anchor.row = -1;
    anchor.column = -1;
  };
  const self: DoubleNode = {
    id: id(type),
    type,
    name,
    get gridRowAnchorIndex() {
      return anchor.row;
    },
    get gridColumnAnchorIndex() {
      return anchor.column;
    },
    // As the API documents it (plugin-api.d.ts, GridChildrenMixin.setGridChildPosition): out of
    // bounds throws, an occupied cell throws, ROW_AUTO_FLOW refuses manual positions.
    setGridChildPosition(rowIndex, columnIndex) {
      const grid = self.parent;
      if (grid === undefined || grid.properties.layoutMode !== "GRID") {
        throw new Error(
          `${self.type} "${self.name}": setGridChildPosition needs a parent with layoutMode "GRID".`,
        );
      }
      if (grid.properties.gridItemsPositioning === "ROW_AUTO_FLOW") {
        throw new Error("setGridChildPosition: the grid positions its items by ROW_AUTO_FLOW.");
      }
      const rows = Number(grid.properties.gridRowCount ?? 0);
      const columns = Number(grid.properties.gridColumnCount ?? 0);
      if (rowIndex < 0 || columnIndex < 0 || rowIndex >= rows || columnIndex >= columns) {
        throw new Error(
          `setGridChildPosition: ${rowIndex}/${columnIndex} is out of bounds (${rows} × ${columns}).`,
        );
      }
      const holder = grid.children.find(
        (child) =>
          child.gridRowAnchorIndex === rowIndex && child.gridColumnAnchorIndex === columnIndex,
      );
      if (holder !== undefined) {
        // Also for the node that already sits there: what Figma does then is not measured, so the
        // double does not pretend to know — the plugin must not rely on it.
        throw new Error(
          `setGridChildPosition: the cell ${rowIndex}/${columnIndex} is occupied by "${holder.name}".`,
        );
      }
      anchor.row = rowIndex;
      anchor.column = columnIndex;
      context.version++;
    },
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
      // A node that comes from elsewhere has no cell here; appending does not give it one (F14).
      if (child.parent !== recorded) (child as unknown as { leaveCell?: () => void }).leaveCell?.();
      child.parent = recorded;
      self.children.push(child);
      context.version++;
    },
    insertChild(index, child) {
      child.parent?.children.splice(child.parent.children.indexOf(child), 1);
      if (child.parent !== recorded) (child as unknown as { leaveCell?: () => void }).leaveCell?.();
      child.parent = recorded;
      self.children.splice(index, 0, child);
      context.version++;
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
      // Bound by the plugin: the value is the plugin's from now on, not the tool's default.
      self.defaults.delete(field);
      context.version++;
    },
    remove() {
      self.parent?.children.splice(self.parent.children.indexOf(recorded), 1);
      self.parent = undefined;
      leaveCell();
      context.version++;
    },
  };
  Object.defineProperty(self, "leaveCell", { value: leaveCell, enumerable: false });
  // Everything the plugin assigns directly — `node.fills`, `node.minHeight`, `node.characters` —
  // lands in `properties`, so the double records it and `snapshot()` shows it. Without this the
  // double swallowed every such assignment, and a projection could lose a value unseen (F8).
  recorded = new Proxy(self, {
    set(target, key, value) {
      if (key === "gridRowAnchorIndex" || key === "gridColumnAnchorIndex") {
        throw new Error(`${String(key)} is read-only; use setGridChildPosition.`);
      }
      context.version++;
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
 * - a grid as it was **measured** (run 3 in file wSYaaAsB2EujMxGra84PoM, 2026-09-21): set and
 *   variants were correct — GRID, 12 × 6, every track HUG, the variants AUTO and HUG in their own
 *   size — but every anchor read −1: no child lay in a cell. A child without a cell sizes no track
 *   and lies at 0/0, so a hugging grid is its paddings and gaps (48 × 96). A child that was placed
 *   (setGridChildPosition) lies in its cell and its tracks are as large as their largest placed
 *   child — that is what HUG tracks are documented to do, and what the next run has to confirm.
 *   Two earlier explanations were refuted by measurement and are gone: "Figma rejects the grid"
 *   and "an unsized child counts as 0 × 0".
 * - a **visible stroke takes space** (measured in run #21, file Q7LOiRGeDyJ0JgdajzXg81,
 *   2026-09-22): the frames of ring and gap, hugging and with an inside stroke of 2, were 2 larger
 *   on every side once the stroke had a paint — 8 px per variant in the focus state, none in the
 *   other states, where the weight was bound but no paint was set. An earlier version of this
 *   double never counted strokes; nobody had measured that. `strokesIncludedInLayout = false` is
 *   documented to make strokes overlap the content instead; the double follows the documentation
 *   there, and the next run has to confirm it.
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
      const strokes = prop(current, "strokes");
      const visible = Array.isArray(strokes) && strokes.length > 0;
      const stroke =
        visible && prop(current, "strokesIncludedInLayout") !== false
          ? 2 * num(current, "strokeWeight")
          : 0;
      const padX = num(current, "paddingLeft") + num(current, "paddingRight") + stroke;
      const padY = num(current, "paddingTop") + num(current, "paddingBottom") + stroke;
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
      const tracks = tracksOf(current);
      const contentW =
        num(current, "paddingLeft") +
        num(current, "paddingRight") +
        num(current, "gridColumnGap") * (tracks.columns.length - 1) +
        tracks.columns.reduce((sum, width) => sum + width, 0);
      const contentH =
        num(current, "paddingTop") +
        num(current, "paddingBottom") +
        num(current, "gridRowGap") * (tracks.rows.length - 1) +
        tracks.rows.reduce((sum, height) => sum + height, 0);
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

  /** The HUG tracks of a grid: each as large as its largest **placed** child, else 0. */
  const tracksOf = (current: DoubleNode) => {
    const columns = Array.from({ length: Math.max(1, num(current, "gridColumnCount")) }, () => 0);
    const rows = Array.from({ length: Math.max(1, num(current, "gridRowCount")) }, () => 0);
    for (const child of current.children) {
      const row = child.gridRowAnchorIndex;
      const column = child.gridColumnAnchorIndex;
      if (row < 0 || column < 0) continue;
      const own = measure(child);
      columns[column] = Math.max(columns[column] ?? 0, own.width);
      rows[row] = Math.max(rows[row] ?? 0, own.height);
    }
    return { columns, rows };
  };

  const place = (current: DoubleNode, box: DoubleBox): void => {
    boxes.set(current, box);
    const mode = prop(current, "layoutMode");
    if (mode === "GRID") {
      const tracks = tracksOf(current);
      const before = (sizes: number[], index: number, gap: number) =>
        sizes.slice(0, index).reduce((sum, track) => sum + track + gap, 0);
      for (const child of current.children) {
        const row = child.gridRowAnchorIndex;
        const column = child.gridColumnAnchorIndex;
        const placed = row >= 0 && column >= 0;
        place(child, {
          // Measured: a child without a cell lies at 0/0, not inside the padding.
          x: placed
            ? num(current, "paddingLeft") +
              before(tracks.columns, column, num(current, "gridColumnGap"))
            : 0,
          y: placed
            ? num(current, "paddingTop") + before(tracks.rows, row, num(current, "gridRowGap"))
            : 0,
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
  const context: NodeContext = { loaded, version: 0 };
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
        context.version++;
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
    const byName = new Map(variables.map((variable) => [variable.name, variable]));
    const byId = new Map(variables.map((variable) => [variable.id, variable]));
    const firstMode = new Map(collections.map((c) => [c.id, c.modes[0]?.modeId ?? ""]));
    let variable = byName.get(name);
    for (let depth = 0; variable !== undefined && depth < 32; depth++) {
      const value = variable.valuesByMode[firstMode.get(variable.collectionId) ?? ""];
      const alias = value as { type?: string; id?: string } | undefined;
      if (alias?.type !== "VARIABLE_ALIAS") return value;
      variable = byId.get(alias.id ?? "");
    }
    return undefined;
  };
  // One layout per state of the document (see NodeContext.version), with its resolved numbers.
  let computed: { version: number; top: DoubleNode; boxes: Map<DoubleNode, DoubleBox> } | undefined;
  context.box = (current: DoubleNode) => {
    let top = current;
    while (top.parent !== undefined) top = top.parent;
    if (computed === undefined || computed.version !== context.version || computed.top !== top) {
      const resolved = new Map<string, unknown>();
      const once = (name: string) => {
        if (!resolved.has(name)) resolved.set(name, resolve(name));
        return resolved.get(name);
      };
      computed = { version: context.version, top, boxes: layoutOf(top, once) };
    }
    return computed.boxes.get(current) ?? { x: 0, y: 0, width: 0, height: 0 };
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
