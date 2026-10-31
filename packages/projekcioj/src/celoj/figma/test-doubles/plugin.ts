// An in-memory stand-in for the slice of the Figma Plugin API the generated plugin uses (Spec 003
// T016). It is a test double, not a simulation of Figma: it records what the plugin creates and
// changes, so idempotency can be proved without Figma. Every method here must exist in the real
// API with the same shape.

import { FIGMA_MODE_LIMIT } from "../plugin.js";

export interface DoubleVariable {
  id: string;
  name: string;
  resolvedType: string;
  variableCollectionId: string;
  hiddenFromPublishing: boolean;
  valuesByMode: Record<string, unknown>;
  setValueForMode(modeId: string, value: unknown): void;
  /**
   * The value this variable has *for that node*: the mode the node stands in decides, aliases
   * followed (F34). What a paint stores is not that value — a bound paint keeps the colour it was
   * last written with and an opacity of its own, and reading those two together yields a pair no
   * mode ever shows.
   */
  resolveForConsumer(node: DoubleNode): { value: unknown; resolvedType: string };
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
  /** Shared plugin data, as every collection of the Plugin API has (PluginDataMixin). */
  getSharedPluginData(namespace: string, key: string): string;
  setSharedPluginData(namespace: string, key: string, value: string): void;
}

export interface DoubleNode {
  /** The modes the node sets for itself, by collection id (F35). */
  explicitVariableModes: Record<string, string>;
  /** Every mode the node stands in: its own, and the default of every other collection. */
  resolvedVariableModes: Record<string, string>;
  setExplicitVariableModeForCollection(collection: DoubleCollection, modeId: string): void;
  clearExplicitVariableModeForCollection(collection: DoubleCollection): void;
  id: string;
  type: string;
  name: string;
  /** True once the node is gone (N5-1); then only `id` and `removed` answer. */
  readonly removed?: boolean;
  children: DoubleNode[];
  parent?: DoubleNode | undefined;
  properties: Record<string, unknown>;
  /** Properties that still hold the value the tool gave the node, not one the plugin wrote (F13). */
  defaults: Set<string>;
  /** Per field the alias Figma holds: `{ type: "VARIABLE_ALIAS", id, name }`. */
  boundVariables: Record<string, { type: "VARIABLE_ALIAS"; id: string; name: string }>;
  pluginData: Record<string, string>;
  appendChild(child: DoubleNode): void;
  insertChild(index: number, child: DoubleNode): void;
  /** Sets the size of the node, as the Plugin API's resize does (F-4, a belief until measured). */
  resize(width: number, height: number): void;
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
  /** Every write to the document: a property, a binding, a cell, plugin data, a value (F21). */
  writes: number;
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
  /** Every font the run loaded, as "<family> <style>" (F30). */
  loadedFonts: string[];
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
  // A section (F-2, Nachlese Spec 008/009) — a belief, not a measurement, until the maintainer
  // has measured it in f10b-5: createSection gives a section of 100 × 100 on the current page.
  // Its look (fill, colour) is the maintainer's, not the plugin's, so the double names no paint
  // here that a test of owned properties would have to see cleared.
  SECTION: {
    width: 100,
    height: 100,
  },
  // A vector of an imported SVG (Spec 010 ②, the check mark) — a belief until the maintainer has
  // measured it in f10b-5: the fill of the SVG's path (currentColor reads black), no line, the
  // constraints Figma gives a layer by default.
  VECTOR: {
    fills: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }],
    strokes: [],
    strokeWeight: 1,
    effects: [],
    opacity: 1,
    constraints: { horizontal: "MIN", vertical: "MIN" },
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
    // A new text grows with its characters (plugin-api.d.ts, TextNode.textAutoResize).
    textAutoResize: "WIDTH_AND_HEIGHT",
  },
};

let sequence = 0;
const id = (prefix: string) => `${prefix}:${++sequence}`;

/** "Geist Medium": how a font is named in a message and in the loaded set. */
const fontKey = (font: { family: string; style: string }) => `${font.family} ${font.style}`;

/** The text fields that carry a font; binding one needs every font it can show to be loaded. */
const FONT_FIELDS: ReadonlySet<string> = new Set(["fontFamily", "fontStyle"]);

/**
 * Every font a text would show once `field` is bound to `variable` (F30). Figma resolves family
 * and cut **per mode**, so the pairs are taken mode by mode where both variables sit in the same
 * collection; where they do not, every combination is taken, which is the safe reading. The other
 * half of the pair is the variable already bound to the node, or the font the node carries.
 */
function fontsOfBinding(
  node: DoubleNode,
  field: string,
  variable: DoubleVariable,
  context: NodeContext,
): { family: string; style: string }[] {
  const partner = field === "fontFamily" ? "fontStyle" : "fontFamily";
  const boundPartner = node.boundVariables[partner];
  const other = boundPartner === undefined ? undefined : context.variableById?.(boundPartner.id);
  const current = node.properties.fontName as { family: string; style: string } | undefined;
  const fallback = field === "fontFamily" ? current?.style : current?.family;
  const pair = (own: string, theirs: string) =>
    field === "fontFamily" ? { family: own, style: theirs } : { family: theirs, style: own };
  const collection = context.collectionOf?.(variable);
  const modes = collection?.modes ?? [];
  const own = (mode: string) => resolveString(variable.valuesByMode[mode], context, mode);
  if (other === undefined) {
    return modes.map((mode) => pair(own(mode.modeId), fallback ?? "Regular"));
  }
  const sameCollection = context.collectionOf?.(other)?.id === collection?.id;
  // Figma resolves family and cut with the same chosen mode; taking every combination of the two
  // would ask for fonts no mode ever shows (Geist in ekzemplo's cut).
  if (sameCollection) {
    return modes.map((mode) =>
      pair(own(mode.modeId), resolveString(other.valuesByMode[mode.modeId], context, mode.modeId)),
    );
  }
  const theirs = (context.collectionOf?.(other)?.modes ?? []).map((mode) =>
    resolveString(other.valuesByMode[mode.modeId], context, mode.modeId),
  );
  return modes.flatMap((mode) => theirs.map((cut) => pair(own(mode.modeId), cut)));
}

/**
 * The string a variable value stands for in one mode, following an alias to its target. An alias
 * into the same collection keeps the mode; one into another collection reads that collection's
 * first mode, which is Figma's default (F19).
 */
function resolveString(value: unknown, context: NodeContext, mode: string, depth = 0): string {
  if (typeof value === "string") return value;
  if (depth > 32 || value === null || typeof value !== "object") return "";
  const alias = value as { type?: string; id?: string };
  if (alias.type !== "VARIABLE_ALIAS" || alias.id === undefined) return "";
  const target = context.variableById?.(alias.id);
  if (target === undefined) return "";
  const next = Object.hasOwn(target.valuesByMode, mode)
    ? mode
    : (context.collectionOf?.(target)?.modes[0]?.modeId ?? "");
  return resolveString(target.valuesByMode[next], context, next, depth + 1);
}

/**
 * The fonts a new Figma file has without anything installed: Inter in its styles. Everything
 * else must be given to the double, as a file would have it (F11).
 */
const FIGMA_FONTS = ["Regular", "Medium", "SemiBold", "Bold", "Black"].map((style) => ({
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
  /** Geometry read as 32-bit floats, as Figma keeps it (Nachlese 4 N-5); off by default. */
  float32?: boolean;
  /**
   * Fields the double refuses to set, throwing as Figma does for a field it does not have
   * (Spec 007 T029): the measurement of a Manko needs a tool that says no, and one that says yes.
   */
  refuses?: ReadonlySet<string>;
  /** Every collection of the file, for the modes a node stands in (F34, F35). */
  collections?: () => readonly DoubleCollection[];
  /** The variables of the file, for resolving what a binding would show (F30). */
  variableById?: (id: string) => DoubleVariable | undefined;
  /** The collection a variable belongs to, with its mode ids in order (F30). */
  collectionOf?: (variable: DoubleVariable) => DoubleCollection | undefined;
  box?: (node: DoubleNode, key?: string) => DoubleBox;
  resolveColor?: (name: string) => { r: number; g: number; b: number } | undefined;
  /**
   * Counts every change to the document. The layout is computed once per state of the document,
   * not once per read: reading x, y, width and height of 72 variants recomputed the whole tree
   * hundreds of times and took the plugin tests from 10 s to 117 s (and past 60 s on the CI).
   */
  version: number;
  /** Every node by id, for an INSTANCE_SWAP value (a component id; Spec 027). */
  nodes?: Map<string, DoubleNode>;
  /** The counts of the double, for the layers of an instance (Spec 027). */
  counts?: DoubleCounts;
}

const GEOMETRY_KEYS: ReadonlySet<string> = new Set(["x", "y", "width", "height"]);

/**
 * Fields the Plugin API declares read-only on every scene node (plugin-api.d.ts: `readonly width`,
 * `readonly height`, the absolute boxes; `hasMissingFont` of a text): assigning one throws
 * "no setter for property" in Figma. Measured 2026-10-18 (Abnahme 014 ②–⑤, F-4): the separator
 * wrote `width` on its frame and the real tool aborted in write ← flush ← drawSeparator; the
 * double had accepted it. A size is set with `resize`, or bound with `setBoundVariable`.
 */
/**
 * Fields of an auto-layout child (plugin-api.d.ts, AutoLayoutChildrenMixin) and the sizing of an
 * auto-layout frame: Figma refuses them on a node that neither has auto layout itself nor lies in
 * an auto-layout frame — "node must be an auto-layout frame or a child of an auto-layout frame".
 * Measured 2026-10-18 (Abnahme 014 ②–⑤, F-5): a new variant of a found set got its sizing written
 * before it lay in the set. The double had accepted it.
 */
const LAYOUT_CHILD_FIELDS: ReadonlySet<string> = new Set([
  "layoutSizingHorizontal",
  "layoutSizingVertical",
  "layoutAlign",
  "layoutGrow",
  "layoutPositioning",
]);

const hasAutoLayout = (node: DoubleNode | undefined): boolean =>
  node !== undefined &&
  ["HORIZONTAL", "VERTICAL", "GRID"].includes(String(node.properties.layoutMode));

const READ_ONLY_FIELDS: ReadonlySet<string> = new Set([
  "width",
  "height",
  "absoluteTransform",
  "absoluteBoundingBox",
  "absoluteRenderBounds",
  "hasMissingFont",
]);

/**
 * A paint as Figma stores and returns it (F22): `visible`, `opacity` and `blendMode` filled in,
 * the colour as given. Reading `fills` back therefore never equals the object that was written —
 * a comparison by JSON rewrites on every run; a comparison by variable, opacity and visibility
 * does not.
 */
function asStoredPaint(paint: unknown): unknown {
  if (typeof paint !== "object" || paint === null) return paint;
  const given = paint as Record<string, unknown>;
  return {
    type: given.type,
    visible: given.visible === undefined ? true : given.visible,
    opacity: typeof given.opacity === "number" ? given.opacity : 1,
    blendMode: given.blendMode === undefined ? "NORMAL" : given.blendMode,
    color: given.color,
    ...(given.boundVariables === undefined ? {} : { boundVariables: given.boundVariables }),
  };
}

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
      counts.writes++;
      context.version++;
    },
    children: [],
    // Declared here so the recording proxy treats it as a field of the node, not as a property
    // the plugin sets.
    parent: undefined,
    properties: structuredClone({ ...(FIGMA_DEFAULTS[type] ?? {}) }),
    defaults: new Set(Object.keys(FIGMA_DEFAULTS[type] ?? {})),
    boundVariables: {},
    explicitVariableModes: {},
    get resolvedVariableModes() {
      // A node stands in its own modes; for every collection it says nothing about, in the one
      // Figma takes as the default — the first mode of the collection (F19).
      const modes: Record<string, string> = {};
      for (const collection of context.collections?.() ?? []) {
        modes[collection.id] = collection.modes[0]?.modeId ?? "";
      }
      let current: DoubleNode | undefined = recorded;
      const chain: DoubleNode[] = [];
      while (current !== undefined) {
        chain.unshift(current);
        current = current.parent;
      }
      for (const ancestor of chain) Object.assign(modes, ancestor.explicitVariableModes);
      return modes;
    },
    pluginData: {},
    appendChild(child) {
      refuseInInstance(self);
      child.parent?.children.splice(child.parent.children.indexOf(child), 1);
      // A node that comes from elsewhere has no cell here; appending does not give it one (F14).
      if (child.parent !== recorded) (child as unknown as { leaveCell?: () => void }).leaveCell?.();
      child.parent = recorded;
      self.children.push(child);
      context.version++;
    },
    // insertChild(index, child) of a child already in this parent (Spec 035 2.3.2, plugin
    // acceptance of 30.10.): Figma counts the index in the list before it takes the child out, so
    // a child moved towards the end lands one place before the index – the plugin's
    // insertChild(1, texts) left the texts of the markobutono before its box, where a double that
    // takes the child out first put them after it. A belief from that acceptance until measured.
    insertChild(index, child) {
      refuseInInstance(self);
      const from = child.parent === recorded ? self.children.indexOf(child) : -1;
      const at = from !== -1 && from < index ? index - 1 : index;
      child.parent?.children.splice(child.parent.children.indexOf(child), 1);
      if (child.parent !== recorded) (child as unknown as { leaveCell?: () => void }).leaveCell?.();
      child.parent = recorded;
      self.children.splice(at, 0, child);
      context.version++;
    },
    // resize(width, height) (F-4, Spec 011 ③ acceptance) — a **belief** about the Plugin API until
    // the maintainer measures it in f10b-5: the node takes the size, never below Figma's smallest
    // size of 0.01 (the tool throws below it, naming the field), and an auto-layout frame that
    // hugged an axis is fixed in it afterwards, as a frame resized by hand is in the editor; a
    // layout written after the resize lets it hug again. A child that filled an axis is fixed in
    // it the same way (Spec 011 ④ acceptance, F-3: the track of a meter) — a belief alike.
    resize(width, height) {
      for (const [field, value] of [
        ["width", width],
        ["height", height],
      ] as const) {
        if (!(value >= 0.01)) {
          throw new Error(`in resize: Expected "${field}" to have value >= 0.01, got ${value}`);
        }
      }
      for (const field of ["layoutSizingHorizontal", "layoutSizingVertical"]) {
        const mode = self.properties.layoutMode;
        const sizing = self.properties[field];
        const hugging = sizing === "HUG" && (mode === "HORIZONTAL" || mode === "VERTICAL");
        if (hugging || sizing === "FILL") self.properties[field] = "FIXED";
      }
      // A text resized keeps the width it was given and wraps in it (K-1, belief alike).
      if (self.type === "TEXT") {
        self.properties.layoutSizingHorizontal = "FIXED";
        if (self.properties.textAutoResize === "WIDTH_AND_HEIGHT") {
          self.properties.textAutoResize = "HEIGHT";
        }
        STUCK_AT_ZERO.delete(self);
        STUCK_AT_ZERO.delete(recorded);
      }
      self.properties.width = width;
      self.properties.height = height;
      self.defaults.delete("width");
      self.defaults.delete("height");
      // Measured M9 (2026-10-23): an instance whose width was bound to a variable took 800 and
      // lost the binding when resized; its filling surface followed. For a node that is no
      // instance the double keeps a binding, as before (not measured).
      if (type === "INSTANCE") {
        delete self.boundVariables.width;
        delete self.boundVariables.height;
      }
      counts.writes++;
      context.version++;
    },
    setExplicitVariableModeForCollection(collection, modeId) {
      self.explicitVariableModes[collection.id] = modeId;
      counts.writes++;
      context.version++;
    },
    clearExplicitVariableModeForCollection(collection) {
      delete self.explicitVariableModes[collection.id];
      counts.writes++;
      context.version++;
    },
    setSharedPluginData(namespace, key, value) {
      self.pluginData[`${namespace}/${key}`] = value;
      counts.writes++;
    },
    getSharedPluginData(namespace, key) {
      return self.pluginData[`${namespace}/${key}`] ?? "";
    },
    setBoundVariable(field, variable) {
      // Measured M11 (2026-10-23): a width or height bound on a layer of an instance is not taken
      // — no error, no binding, the size stays the main's. The instance itself takes it (M10).
      if (LAYERS.has(self) && (field === "width" || field === "height")) return;
      // Figma refuses a font binding whose variable can show a font the file has not loaded: the
      // value of every mode must be loaded first, not only the one the node shows today (F30).
      if (FONT_FIELDS.has(field) && variable !== null) {
        for (const font of fontsOfBinding(self, field, variable, context)) {
          if (context.loaded.has(fontKey(font))) continue;
          throw new Error(
            `Cannot bind ${field} on "${self.name}": the variable "${variable.name}" can show ` +
              `"${fontKey(font)}", which is not loaded. Load every font of every mode with ` +
              "loadFontAsync before binding.",
          );
        }
      }
      if (AUTO_LAYOUT_FIELDS.has(field) && (self.properties.layoutMode ?? "NONE") === "NONE") {
        throw new Error(
          `${self.type} "${self.name}": ${field} only takes effect with auto layout, and ` +
            'layoutMode is "NONE". Set layoutMode before binding it (F11).',
        );
      }
      if (variable === null) delete self.boundVariables[field];
      else
        self.boundVariables[field] = {
          type: "VARIABLE_ALIAS",
          id: variable.id,
          name: variable.name,
        };
      // Bound by the plugin: the value is the plugin's from now on, not the tool's default.
      self.defaults.delete(field);
      counts.writes++;
      context.version++;
    },
    remove() {
      self.parent?.children.splice(self.parent.children.indexOf(recorded), 1);
      self.parent = undefined;
      leaveCell();
      REMOVED.add(self);
      context.version++;
    },
  };
  Object.defineProperty(self, "leaveCell", { value: leaveCell, enumerable: false });
  // Spec 020 ① (the example frames of the Sxablonoj): a component makes an instance of itself, as
  // the API documents (ComponentNode.createInstance, on the current page until it is appended);
  // the instance names its main component and takes the values of its component properties
  // (InstanceNode.setProperties). A **belief** until the maintainer measures it in f10b-5.
  // Spec 027 (measured 2026-10-23 in file ErG5PAaxWHdoBYEm4HMPzD, M4b, M4c): an instance holds
  // the layers of its main component — the same names, values and bindings — and the plugin can
  // bind and fill those layers (an override); a BOOLEAN, TEXT or INSTANCE_SWAP property set on the
  // instance reaches the layers connected to it, and a swap keeps the fill written on a layer of
  // the same name. Before Spec 027 the double's instance was empty.
  if (type === "COMPONENT") {
    Object.defineProperty(self, "createInstance", {
      enumerable: false,
      value: () => {
        const instance = node("INSTANCE", self.name, counts, context);
        adopt(instance, recorded, context);
        return instance;
      },
    });
    // M4c/M5: a slot in a component — a frame-like layer of type SLOT, its own SLOT property on
    // the component (or on its set); the property is named after the slot and follows a rename.
    Object.defineProperty(self, "createSlot", {
      enumerable: false,
      value: () => {
        const slot = node("SLOT", "Slot", counts, context);
        recorded.appendChild(slot);
        const owner = (self.parent?.type === "COMPONENT_SET"
          ? self.parent
          : recorded) as unknown as {
          addComponentProperty(name: string, type: string, value: unknown): string;
        };
        const key = owner.addComponentProperty("Slot", "SLOT", undefined);
        slot.properties.componentPropertyReferences = { slotContentId: key };
        return slot;
      },
    });
    defineProperties(
      self,
      () => recorded,
      () => self.parent?.type === "COMPONENT_SET",
      false,
    );
  }
  if (type === "INSTANCE") {
    Object.defineProperty(self, "setProperties", {
      enumerable: false,
      value: (values: Record<string, unknown>) => {
        counts.writes++;
        self.properties.componentProperties = {
          ...((self.properties.componentProperties as Record<string, unknown> | undefined) ?? {}),
          ...values,
        };
        // The layers connected to a property take its value (M4b: the swap of icon-start).
        const walk = (layer: DoubleNode) => {
          for (const child of layer.children) {
            const references = (child.properties.componentPropertyReferences ?? {}) as Record<
              string,
              string
            >;
            for (const [field, key] of Object.entries(references)) {
              if (!Object.hasOwn(values, key)) continue;
              const value = values[key];
              if (field === "mainComponent") {
                const next = context.nodes?.get(String(value));
                if (next !== undefined) swapLayers(child, next, context);
              } else child.properties[field] = value;
            }
            walk(child);
          }
        };
        walk(recorded);
        context.version++;
      },
    });
    Object.defineProperty(self, "swapComponent", {
      enumerable: false,
      value: (next: DoubleNode) => {
        counts.writes++;
        swapLayers(recorded, next, context);
      },
    });
  }
  // Everything the plugin assigns directly — `node.fills`, `node.minHeight`, `node.characters` —
  // lands in `properties`, so the double records it and `snapshot()` shows it. Without this the
  // double swallowed every such assignment, and a projection could lose a value unseen (F8).
  recorded = new Proxy(self, {
    set(target, key, value, receiver) {
      if (key === "gridRowAnchorIndex" || key === "gridColumnAnchorIndex") {
        throw new Error(`${String(key)} is read-only; use setGridChildPosition.`);
      }
      if (typeof key === "string" && READ_ONLY_FIELDS.has(key)) {
        throw new Error(`in set_${key}: no setter for property`);
      }
      if (
        typeof key === "string" &&
        LAYOUT_CHILD_FIELDS.has(key) &&
        !hasAutoLayout(target as DoubleNode) &&
        !hasAutoLayout(target.parent)
      ) {
        const parent = target.parent;
        throw new Error(
          `in set_${key}: node must be an auto-layout frame or a child of an auto-layout frame` +
            ` (Double: ${target.type} "${target.name}" layoutMode ${String(target.properties.layoutMode)}, ` +
            `parent ${parent === undefined ? "none" : `${parent.type} "${parent.name}" layoutMode ${String(parent.properties.layoutMode)}`})`,
        );
      }
      if (typeof key === "string" && context.refuses?.has(key)) {
        throw new Error(
          `in set_${key}: The Figma double refuses ${key} (option refuse); only the real tool says whether it carries this field.`,
        );
      }
      // Measured on 2026-09-22 (file x8sFFyOkrnlMM4ngAsbnfs, F21): setting layoutMode on a grid
      // whose cells are occupied — even to "GRID" again — threw "in set_layoutMode: Cannot set
      // grid row count: Cannot delete occupied row/column." The double throws the same; and it
      // refuses a track count below an occupied cell, which is what the message says.
      if (typeof key === "string" && target.properties.layoutMode === "GRID") {
        const rows = Math.max(-1, ...target.children.map((child) => child.gridRowAnchorIndex)) + 1;
        const columns =
          Math.max(-1, ...target.children.map((child) => child.gridColumnAnchorIndex)) + 1;
        const occupied = rows > 0 && columns > 0;
        const shrinks =
          (key === "gridRowCount" && Number(value) < rows) ||
          (key === "gridColumnCount" && Number(value) < columns);
        if (occupied && (key === "layoutMode" || shrinks)) {
          throw new Error(
            `in set_${key}: Cannot set grid row count: Cannot delete occupied row/column.`,
          );
        }
      }
      counts.writes++;
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
      // Gemessen 2026-10-08 (Datei 9qNldNFlofRCwlkpnEKOS1, F-A): textCase auf einem frischen
      // Textknoten, dessen Schrift Inter Regular nicht geladen war, warf genau diese Meldung. Der
      // Text braucht seine aktuelle Schrift geladen, bevor er seine Schreibweise ändert.
      if (target.type === "TEXT" && key === "textCase") {
        const font = target.properties.fontName as { family: string; style: string };
        if (!loaded.has(fontKey(font))) {
          throw new Error(
            `in set_textCase: Cannot write to node with unloaded font "${fontKey(font)}". ` +
              `Please call figma.loadFontAsync({ family: "${font.family}", style: ` +
              `"${font.style}" }) and await the returned promise first.`,
          );
        }
      }
      // Gemessen 2026-10-12 (Datei f10b-5, Befund B1): description und descriptionMarkdown sind
      // in Figma ein Feld; der zuletzt geschriebene Markdown ist, was die Beschreibung zeigt.
      if (key === "descriptionMarkdown" && typeof value === "string") {
        target.properties.description = value;
        target.defaults.delete("description");
      }
      // The width of a text follows its sizing (documented, TextNode.textAutoResize and
      // layoutSizingHorizontal): HUG grows with the characters, FIXED and FILL keep a width and
      // wrap the characters in it.
      if (target.type === "TEXT" && key === "layoutSizingHorizontal") {
        if (value === "HUG") {
          target.properties.textAutoResize = "WIDTH_AND_HEIGHT";
        } else if (target.properties.textAutoResize === "WIDTH_AND_HEIGHT") {
          target.properties.textAutoResize = "HEIGHT";
        }
        target.defaults.delete("textAutoResize");
        // Spec 015 ③ K-1 (Abnahme 2026-10-19, file f10b-5) – a **belief** from one measurement,
        // to be confirmed when the maintainer measures C2 again. The heading of the karto took
        // FILL while it was still empty (its word came later, through the label property) and
        // stood one glyph per line in every variant of the set: the set measured 648 × 1031, and
        // this double gives 648 × 1007 with the heading at width 0, 648 × 507 without. The example
        // „ohne Bild", whose heading had its word before it took FILL, wrapped across the body,
        // and so did the content beside it. A second run, which compares before it writes,
        // changed nothing: the heading reports FILL. So a text that takes FILL while empty
        // reports FILL and stays at width 0, wrapping, until it is resized or takes a sizing
        // again with characters in it.
        // The node and its recording proxy alike: a parent's children hold the proxy.
        for (const each of [target, receiver]) {
          if (value === "FILL" && String(target.properties.characters ?? "") === "") {
            STUCK_AT_ZERO.add(each);
          } else {
            STUCK_AT_ZERO.delete(each);
          }
        }
      }
      // M4c/M5: a slot's SLOT property carries the slot's name, and follows when it is renamed.
      if (target.type === "SLOT" && key === "name") renameSlot(target, String(value));
      if (typeof key === "string" && !(key in target)) {
        target.properties[key] =
          (key === "fills" || key === "strokes") && Array.isArray(value)
            ? value.map(asStoredPaint)
            : value;
        // Written by the plugin: from now on the value is the plugin's, not the tool's.
        target.defaults.delete(key);
        return true;
      }
      return Reflect.set(target, key, value);
    },
    get(target, key) {
      // Nachlese 5 N5-1 (Messung 2026-10-19, file f10b-5): a node that is gone answers `removed`
      // and its id; every other property throws. Measured: after a reconnect the run read the
      // name of node 26:325 and Figma threw "in get_name: The node with id "26:325" does not
      // exist". That every other property throws alike is a **belief** (the API says: check
      // `removed` before reading a stashed node), to be confirmed when it happens again.
      if (key === "removed") return REMOVED.has(target);
      if (
        REMOVED.has(target) &&
        typeof key === "string" &&
        key !== "id" &&
        (key in target || key in target.properties)
      ) {
        throw new Error(`in get_${key}: The node with id "${target.id}" does not exist`);
      }
      // Size and place are computed by the layout of the file, never read from what was last
      // written: the double does not assume a size the tool would compute differently (F14).
      if (typeof key === "string" && GEOMETRY_KEYS.has(key) && context.box !== undefined) {
        const value = context.box(recorded, key)[key as keyof DoubleBox];
        // Figma keeps geometry as 32-bit floats (Nachlese 4 N-5, F-6): 0.01 reads 0.0099999998.
        return context.float32 === true ? Math.fround(value) : value;
      }
      if (typeof key === "string" && !(key in target) && key in target.properties) {
        return target.properties[key];
      }
      return Reflect.get(target, key);
    },
  });
  RAW.set(recorded, self);
  context.nodes?.set(self.id, recorded);
  return recorded;
}

/** The texts that took FILL while empty (K-1, a belief; see the setter of the recorded node). */
const STUCK_AT_ZERO = new WeakSet<object>();

/** The nodes that were removed (N5-1): they answer `removed` and `id`, nothing else. */
const REMOVED = new WeakSet<object>();

/** The node behind its recording proxy: the double's own bookkeeping writes nothing (Spec 027). */
const RAW = new WeakMap<object, DoubleNode>();
/** The layers of an instance (Spec 027): they take no child, a slot excepted. */
const LAYERS = new WeakSet<object>();
/** The main component of an instance or of a layer that is an instance itself. */
const MAIN = new WeakMap<object, DoubleNode>();

/**
 * Figma refuses a child in an instance and in a layer of one, a slot excepted (measured M4c,
 * 2026-10-23: a text appended to the slot of an instance stood in it; the message is Figma's for a
 * layer of an instance, a belief).
 */
function refuseInInstance(parent: DoubleNode): void {
  if (parent.type === "SLOT") return;
  if (parent.type === "INSTANCE" || LAYERS.has(parent)) {
    throw new Error(
      `Cannot move node. New parent is an instance or is inside of an instance (Double: ${parent.type} "${parent.name}")`,
    );
  }
}

/** The counts for the layers Figma makes in an instance: no node the plugin created. */
function layerCounts(counts: DoubleCounts | undefined): DoubleCounts {
  const own = counts ?? { collections: 0, variables: 0, nodes: 0, valueWrites: 0, writes: 0 };
  return new Proxy(own, {
    set(target, key, value) {
      if (key !== "nodes") Reflect.set(target, key, value);
      return true;
    },
  });
}

/** A copy of `source` as a layer of an instance below `parent` (Spec 027, M4b). */
function layerOf(source: DoubleNode, parent: DoubleNode, context: NodeContext): DoubleNode {
  const layer = node(source.type, source.name, layerCounts(context.counts), context);
  const raw = RAW.get(layer) ?? layer;
  raw.properties = structuredClone({ ...source.properties });
  raw.defaults = new Set(source.defaults);
  raw.boundVariables = { ...source.boundVariables };
  raw.pluginData = { ...source.pluginData };
  raw.explicitVariableModes = { ...source.explicitVariableModes };
  raw.parent = parent;
  LAYERS.add(raw);
  const main = MAIN.get(RAW.get(source) ?? source);
  if (source.type === "INSTANCE" && main !== undefined) {
    MAIN.set(raw, main);
    Object.defineProperty(raw, "mainComponent", { get: () => MAIN.get(raw), enumerable: false });
  }
  for (const child of source.children) raw.children.push(layerOf(child, layer, context));
  return layer;
}

/**
 * An instance takes the layers and the values of its main component (ComponentNode.createInstance;
 * Spec 027: with its layers, measured M4b). Its own values follow the main's; the properties of a
 * set stay on the set.
 */
function adopt(instance: DoubleNode, main: DoubleNode, context: NodeContext): void {
  const raw = RAW.get(instance) ?? instance;
  const { componentPropertyDefinitions: _definitions, ...values } = main.properties;
  raw.properties = { ...structuredClone(values), ...raw.properties };
  raw.boundVariables = { ...main.boundVariables };
  MAIN.set(raw, main);
  Object.defineProperty(raw, "mainComponent", {
    get: () => MAIN.get(raw),
    set: (next: DoubleNode) => swapLayers(instance, next, context, false),
    enumerable: false,
    configurable: true,
  });
  raw.children = main.children.map((child) => layerOf(child, instance, context));
  context.version++;
}

/**
 * An instance (or a layer that is one) swapped to another component: its layers are the new
 * main's; a layer of the same path keeps every value in which the old layer differed from the old
 * main's layer — an override, written on this instance or on the instance in a main above it (M4b:
 * the fill of `mark`, written on the icon in the butono, survived the swap from check to close in
 * an instance of the butono). Assigning `mainComponent` clears the overrides.
 */
function swapLayers(target: DoubleNode, next: DoubleNode, context: NodeContext, keep = true): void {
  const raw = RAW.get(target) ?? target;
  const pathsOf = (root: DoubleNode | undefined) => {
    const paths = new Map<string, DoubleNode>();
    const walk = (layer: DoubleNode, path: string) => {
      for (const child of layer.children) {
        const at = `${path}/${child.name}`;
        paths.set(at, RAW.get(child) ?? child);
        walk(child, at);
      }
    };
    if (root !== undefined) walk(root, "");
    return paths;
  };
  const kept = keep ? pathsOf(raw) : new Map<string, DoubleNode>();
  const before = keep ? pathsOf(MAIN.get(raw)) : new Map<string, DoubleNode>();
  MAIN.set(raw, next);
  if (raw.type === "INSTANCE" && !Object.getOwnPropertyDescriptor(raw, "mainComponent")) {
    Object.defineProperty(raw, "mainComponent", { get: () => MAIN.get(raw), enumerable: false });
  }
  raw.children = next.children.map((child) => layerOf(child, target, context));
  const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  for (const [at, layer] of pathsOf(raw)) {
    const old = kept.get(at);
    if (old === undefined) continue;
    const main = before.get(at);
    for (const [field, value] of Object.entries(old.properties)) {
      if (!same(value, main?.properties[field])) layer.properties[field] = structuredClone(value);
    }
    for (const [field, binding] of Object.entries(old.boundVariables)) {
      if (!same(binding, main?.boundVariables[field])) layer.boundVariables[field] = binding;
    }
  }
  context.version++;
}

/** The node that holds the properties of a component: its set, or the component alone. */
function ownerOf(component: DoubleNode | undefined): DoubleNode | undefined {
  if (component === undefined) return undefined;
  return component.parent?.type === "COMPONENT_SET" ? component.parent : component;
}

/** Renames the SLOT property of a slot with the slot (M4c, M5). */
function renameSlot(slot: DoubleNode, name: string): void {
  const references = slot.properties.componentPropertyReferences as
    | { slotContentId?: string }
    | undefined;
  const key = references?.slotContentId;
  const owner = ownerOf(slot.parent) as unknown as
    | { editComponentProperty?: (key: string, change: { name: string }) => string }
    | undefined;
  if (key === undefined || owner?.editComponentProperty === undefined) return;
  if (key.split("#")[0] === name) return;
  owner.editComponentProperty(key, { name });
}

/**
 * The component properties of a set or of a component that stands alone (Spec 027: a Sxablono
 * without variants holds its SLOT properties itself). A variant refuses them — they belong to its
 * set (a belief; the API documents the set as their place). A rename keeps the id and moves every
 * reference along (M5: the slot of the first variant followed `nav` → `nav-region`).
 */
function defineProperties(
  self: DoubleNode,
  root: () => DoubleNode,
  isVariant: () => boolean,
  eager: boolean,
): void {
  const definitions: Record<string, { type: string; defaultValue: unknown }> = {};
  if (eager) self.properties.componentPropertyDefinitions = definitions;
  const own = () => {
    if (isVariant()) {
      throw new Error(
        `${self.type} "${self.name}": component properties belong to the component set, not to a variant.`,
      );
    }
    self.properties.componentPropertyDefinitions = definitions;
  };
  const rewrite = (from: string, to: string) => {
    const walk = (layer: DoubleNode) => {
      for (const child of layer.children) {
        const raw = RAW.get(child) ?? child;
        const references = raw.properties.componentPropertyReferences as
          | Record<string, string>
          | undefined;
        if (references !== undefined) {
          for (const [field, key] of Object.entries(references)) {
            if (key !== from) continue;
            raw.properties.componentPropertyReferences = { ...references, [field]: to };
            if (raw.type === "SLOT" && field === "slotContentId") raw.name = to.split("#")[0] ?? to;
          }
        }
        walk(child);
      }
    };
    walk(root());
  };
  Object.defineProperty(self, "addComponentProperty", {
    enumerable: false,
    value: (name: string, type: string, defaultValue: unknown) => {
      own();
      // Measured M8 (2026-10-23): a name the component already has, of any type, is numbered —
      // a second `help` became `help2`, a third `help3`, an INSTANCE_SWAP beside the BOOLEAN
      // `icon-start` became `icon-start2`. The key returned names the property as it stands.
      const taken = new Set(Object.keys(definitions).map((key) => key.split("#")[0]));
      let free = name;
      for (let n = 2; taken.has(free); n++) free = `${name}${n}`;
      const key = `${free}#${id("property")}`;
      definitions[key] = { type, defaultValue };
      return key;
    },
  });
  Object.defineProperty(self, "editComponentProperty", {
    enumerable: false,
    value: (key: string, change: { defaultValue?: unknown; name?: string }) => {
      own();
      const definition = definitions[key];
      if (definition === undefined) throw new Error(`No component property ${key}.`);
      if (change.defaultValue !== undefined) definition.defaultValue = change.defaultValue;
      if (change.name === undefined) return key;
      const next = `${change.name}${key.slice(key.indexOf("#"))}`;
      delete definitions[key];
      definitions[next] = definition;
      rewrite(key, next);
      return next;
    },
  });
  Object.defineProperty(self, "deleteComponentProperty", {
    enumerable: false,
    value: (key: string) => {
      own();
      if (definitions[key] === undefined) throw new Error(`No component property ${key}.`);
      delete definitions[key];
    },
  });
}

/**
 * The layout of a file, as far as the plugin relies on it (F14). It follows what Figma was
 * measured to do, not a theory of it:
 * - a text is as wide as its characters (0.6 × font size each) and 1.25 × its font size high —
 *   an estimate; tests compare sizes with each other, never with a text width. A text of fixed
 *   width (textAutoResize HEIGHT) wraps its characters at that width, at least one glyph a line;
 *   a text that takes FILL while it is empty reports FILL and stays at width 0 (K-1, Spec 015 ③,
 *   a belief from one measurement — see the setter);
 * - an auto-layout frame hugs an axis when it says so (layoutSizing HUG, or the older AUTO sizing
 *   modes), adds its paddings and the spacing between its children in the flow, and grows to its
 *   minimum sizes; otherwise it keeps its width and height (Figma's default 100 × 100);
 * - an auto-layout frame **without children keeps its size, hug or not** (F-4 of the acceptance
 *   of Spec 011 ③, measured 2026-10-16: the notice stood with a lot of empty space below its
 *   texts; the number that fits is the 100 × 100 createFrame gave the empty actions placeholder,
 *   which the hugging column took in). An earlier version of this double collapsed an empty
 *   hugging frame to its paddings — nobody had measured that, and it hid the finding;
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
 * - a horizontal frame with `layoutWrap: "WRAP"` (F-8, 2026-10-14) — a **belief**, not a
 *   measurement, until the maintainer has measured it in f10b-5: the children go into rows in
 *   their order; a child starts a new row when it would end beyond the frame's inner width (its
 *   width minus paddings), a row as high as its highest child, `counterAxisSpacing` between the
 *   rows, `itemSpacing` between the children of a row, every child at the top of its row. A frame
 *   that hugs its width has no width to wrap at: it lays every child in one row and grows (what
 *   Figma does with HUG and WRAP together is the measurement). Every read lays the children out
 *   anew from their current sizes, so a child that grows pushes its neighbours.
 * - a child of an auto-layout frame that **fills** an axis (`layoutSizing* FILL`; Spec 011 ④
 *   acceptance, F-3: the track of a meter) — a **belief** until measured in f10b-5, following the
 *   documentation: across the parent's flow it is as large as the parent's inner size (the size
 *   minus paddings and a stroke in the layout); along the flow the filling children share what the
 *   other children and the spacing leave. A parent that hugs the same axis counts a filling child
 *   as nothing there (what Figma does with a hugging parent and a filling child is the
 *   measurement; the editor turns such a parent fixed) — so the plugin writes the parent's width.
 *   Minimum sizes hold for a filling child like for every other.
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
    const value = bound === undefined ? current.properties[field] : resolve(bound.name);
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
  // A hidden child takes no space in auto layout (documented; Nachlese 4 N-5: the double counted
  // the hidden arc and actions placeholder of the plenstato, the file did not).
  const inFlow = (current: DoubleNode) =>
    current.children.filter(
      (child) =>
        prop(child, "layoutPositioning") !== "ABSOLUTE" && prop(child, "visible") !== false,
    );
  const isFlow = (current: DoubleNode | undefined): boolean => {
    const mode = current === undefined ? undefined : prop(current, "layoutMode");
    return mode === "HORIZONTAL" || mode === "VERTICAL";
  };
  /**
   * Whether a child fills an axis of its auto-layout parent (F-3). A hidden child stands outside
   * the flow, so the parent hands it no share: it keeps the size it holds (Spec 015 ③ on
   * Nachlese 4 N-5: the hidden media of the card's example „ohne Bild" read 0 × 0 here, and the
   * plugin's fit wrote it again on every run; Figma keeps a hidden node's size).
   */
  const fills = (current: DoubleNode, axis: "H" | "V"): boolean =>
    prop(current, axis === "H" ? "layoutSizingHorizontal" : "layoutSizingVertical") === "FILL" &&
    current.parent !== undefined &&
    isFlow(current.parent) &&
    prop(current, "layoutPositioning") !== "ABSOLUTE" &&
    prop(current, "visible") !== false &&
    !STUCK_AT_ZERO.has(current);
  /**
   * What a child adds to the size of its parent. Along an axis it fills, a frame adds what it
   * would hug — its children that do not fill that axis, paddings and gaps — where the parent hugs
   * that axis, and a text adds nothing (measured 2026-10-23, file ErG5PAaxWHdoBYEm4HMPzD, M2/M3):
   * a hugging column kept 191 for its filling ring around a control of 183; a hugging row kept 93
   * for a filling ring beside a trigger; a hugging component whose ring, gap and control all
   * filled shrank to its label (85 instead of 152); a hugging column ignored a filling text of 279
   * and wrapped it at 30. Before Spec 027 the double counted every filling child as nothing.
   */
  const contribution = (child: DoubleNode): { width: number; height: number } => {
    const own = intrinsic(child);
    const along = (axis: "H" | "V"): number => {
      const size = axis === "H" ? own.width : own.height;
      if (!fills(child, axis)) return size;
      const parent = child.parent;
      if (parent === undefined || !hugs(parent, axis) || child.type === "TEXT") return 0;
      const natural = naturalOf(child);
      return axis === "H" ? natural.width : natural.height;
    };
    return { width: along("H"), height: along("V") };
  };
  /** The size a frame would hug, whatever its own sizing says (M2/M3, see contribution). */
  const naturals = new Map<DoubleNode, { width: number; height: number }>();
  const naturalOf = (current: DoubleNode): { width: number; height: number } => {
    const known = naturals.get(current);
    if (known !== undefined) return known;
    const size = naturalUncached(current);
    naturals.set(current, size);
    return size;
  };
  const naturalUncached = (current: DoubleNode): { width: number; height: number } => {
    const mode = prop(current, "layoutMode");
    if (
      (mode !== "HORIZONTAL" && mode !== "VERTICAL") ||
      wraps(current) ||
      inFlow(current).length === 0
    ) {
      return intrinsic(current);
    }
    const children = inFlow(current).map(contribution);
    const along = (child: { width: number; height: number }) =>
      mode === "HORIZONTAL" ? child.width : child.height;
    const across = (child: { width: number; height: number }) =>
      mode === "HORIZONTAL" ? child.height : child.width;
    const spacing = num(current, "itemSpacing") * Math.max(0, children.length - 1);
    const main = children.reduce((sum, child) => sum + along(child), 0) + spacing;
    const cross = Math.max(0, ...children.map(across));
    const stroke = strokeOf(current);
    const width =
      (mode === "HORIZONTAL" ? main : cross) +
      num(current, "paddingLeft") +
      num(current, "paddingRight") +
      stroke;
    const height =
      (mode === "HORIZONTAL" ? cross : main) +
      num(current, "paddingTop") +
      num(current, "paddingBottom") +
      stroke;
    return {
      width: Math.max(width, num(current, "minWidth")),
      height: Math.max(height, num(current, "minHeight")),
    };
  };
  /** A visible stroke takes space, unless strokesIncludedInLayout says no (run #21). */
  const strokeOf = (current: DoubleNode): number => {
    const strokes = prop(current, "strokes");
    const visible = Array.isArray(strokes) && strokes.length > 0;
    return visible && prop(current, "strokesIncludedInLayout") !== false
      ? 2 * num(current, "strokeWeight")
      : 0;
  };
  /**
   * The rows of a horizontal frame that wraps (F-8, a belief until measured in f10b-5): a child
   * starts a new row when it would end beyond the inner width; a hugging frame is one row.
   */
  const wraps = (current: DoubleNode): boolean =>
    prop(current, "layoutMode") === "HORIZONTAL" && prop(current, "layoutWrap") === "WRAP";
  const rowsOf = (current: DoubleNode): DoubleNode[][] => {
    const children = inFlow(current);
    if (!wraps(current) || hugs(current, "H")) return [children];
    const inner =
      num(current, "width") -
      num(current, "paddingLeft") -
      num(current, "paddingRight") -
      strokeOf(current);
    const rows: DoubleNode[][] = [];
    let row: DoubleNode[] = [];
    let used = 0;
    for (const child of children) {
      const width = contribution(child).width;
      if (row.length > 0 && used + num(current, "itemSpacing") + width > inner) {
        rows.push(row);
        row = [];
        used = 0;
      }
      used += (row.length > 0 ? num(current, "itemSpacing") : 0) + width;
      row.push(child);
    }
    rows.push(row);
    return rows;
  };
  const rowWidth = (current: DoubleNode, row: DoubleNode[]): number =>
    row.reduce((sum, child) => sum + contribution(child).width, 0) +
    num(current, "itemSpacing") * Math.max(0, row.length - 1);
  const rowHeight = (row: DoubleNode[]): number =>
    Math.max(0, ...row.map((child) => contribution(child).height));

  /**
   * The size a node has of its own — from its properties, minimums and children; an axis it
   * fills is settled by `measure`, from the parent.
   */
  const intrinsics = new Map<DoubleNode, { width: number; height: number }>();
  const intrinsic = (current: DoubleNode): { width: number; height: number } => {
    const known = intrinsics.get(current);
    if (known !== undefined) return known;
    let size: { width: number; height: number };
    const mode = prop(current, "layoutMode");
    if (current.type === "TEXT") {
      const fontSize = num(current, "fontSize") || 12;
      const characters = String(prop(current, "characters") ?? "");
      const glyph = fontSize * 0.6;
      const stuck = STUCK_AT_ZERO.has(current);
      const fixed =
        stuck ||
        (prop(current, "layoutSizingHorizontal") === "FIXED" &&
          prop(current, "textAutoResize") !== "WIDTH_AND_HEIGHT");
      if (fixed) {
        // A text of fixed width wraps its characters at that width, at least one glyph a line
        // (K-1: at width 0, one glyph a line). A filling text is measured on one line.
        const width = stuck ? 0 : num(current, "width");
        const perLine = Math.max(1, Math.floor(width / glyph));
        const lines = Math.max(1, Math.ceil(characters.length / perLine));
        size = { width, height: lines * fontSize * 1.25 };
      } else {
        size = { width: characters.length * glyph, height: fontSize * 1.25 };
      }
    } else if ((mode === "HORIZONTAL" || mode === "VERTICAL") && inFlow(current).length === 0) {
      // An empty auto-layout frame keeps its size, hug or not (F-4, measured; see above).
      size = {
        width: Math.max(num(current, "width"), num(current, "minWidth")),
        height: Math.max(num(current, "height"), num(current, "minHeight")),
      };
    } else if (wraps(current)) {
      const rows = rowsOf(current);
      const padX = num(current, "paddingLeft") + num(current, "paddingRight") + strokeOf(current);
      const padY = num(current, "paddingTop") + num(current, "paddingBottom") + strokeOf(current);
      const contentW = Math.max(0, ...rows.map((row) => rowWidth(current, row))) + padX;
      const contentH =
        rows.reduce((sum, row) => sum + rowHeight(row), 0) +
        num(current, "counterAxisSpacing") * Math.max(0, rows.length - 1) +
        padY;
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
    } else if (mode === "HORIZONTAL" || mode === "VERTICAL") {
      const children = inFlow(current).map(contribution);
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
    intrinsics.set(current, size);
    return size;
  };

  /** The size a node ends up with: its own, and along an axis it fills the parent's share (F-3). */
  const measure = (current: DoubleNode): { width: number; height: number } => {
    const known = sizes.get(current);
    if (known !== undefined) return known;
    const own = intrinsic(current);
    const size = { ...own };
    const parent = current.parent;
    if (parent !== undefined && (fills(current, "H") || fills(current, "V"))) {
      const outer = measure(parent);
      const mode = prop(parent, "layoutMode");
      const siblings = inFlow(parent);
      for (const axis of ["H", "V"] as const) {
        if (!fills(current, axis)) continue;
        const inner =
          axis === "H"
            ? outer.width -
              num(parent, "paddingLeft") -
              num(parent, "paddingRight") -
              strokeOf(parent)
            : outer.height -
              num(parent, "paddingTop") -
              num(parent, "paddingBottom") -
              strokeOf(parent);
        const primary = (axis === "H") === (mode === "HORIZONTAL");
        let share = inner;
        if (primary && !wraps(parent)) {
          const others = siblings
            .filter((child) => child !== current && !fills(child, axis))
            .reduce(
              (sum, child) =>
                sum + (axis === "H" ? contribution(child).width : contribution(child).height),
              0,
            );
          const spacing = num(parent, "itemSpacing") * Math.max(0, siblings.length - 1);
          const filling = siblings.filter((child) => fills(child, axis)).length;
          share = (inner - others - spacing) / Math.max(1, filling);
        }
        const minimum = num(current, axis === "H" ? "minWidth" : "minHeight");
        if (axis === "H") size.width = Math.max(0, share, minimum);
        else size.height = Math.max(0, share, minimum);
      }
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
    if (wraps(current)) {
      let top = num(current, "paddingTop");
      for (const row of rowsOf(current)) {
        let left = num(current, "paddingLeft");
        for (const child of row) {
          const size = measure(child);
          place(child, { x: left, y: top, ...size });
          left += size.width + num(current, "itemSpacing");
        }
        top += rowHeight(row) + num(current, "counterAxisSpacing");
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
      // A hidden child takes no space, but it keeps its size and its place (Figma stores both):
      // it is laid out where it stands, outside the flow.
      for (const child of current.children) {
        if (prop(child, "visible") !== false || prop(child, "layoutPositioning") === "ABSOLUTE")
          continue;
        place(child, { x: num(child, "x"), y: num(child, "y"), ...measure(child) });
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

/**
 * A fresh double with an empty document; `fonts` are the fonts the file has besides Inter, and
 * `modeLimit` is the number of modes a collection of this file may hold — the Figma plan's limit
 * (Professional 10, `FIGMA_MODE_LIMIT`). Figma refuses every mode beyond it, and so does the
 * double: a run with more Aspektoj than modes is otherwise not measurable without Figma (F27).
 */
export function figmaDouble(
  options: {
    fonts?: readonly { family: string; style: string }[];
    modeLimit?: number;
    /** Fields the double refuses to set (Spec 007 T029); by default it accepts every field. */
    refuse?: readonly string[];
    /**
     * Read x, y, width and height as 32-bit floats, as Figma keeps them (Nachlese 4 N-5, F-6: a
     * 0.01 has no exact float, and a sum of them lands a few millionths beside the set it ends in).
     */
    float32?: boolean;
  } = {},
): FigmaDouble {
  const counts: DoubleCounts = {
    collections: 0,
    variables: 0,
    nodes: 0,
    valueWrites: 0,
    writes: 0,
  };
  const available = new Set([...FIGMA_FONTS, ...(options.fonts ?? [])].map(fontKey));
  const modeLimit = options.modeLimit ?? FIGMA_MODE_LIMIT;
  const loaded = new Set<string>();
  // Filled below, once the document and the variables exist.
  const context: NodeContext = {
    loaded,
    nodes: new Map(),
    counts,
    ...(options.refuse === undefined ? {} : { refuses: new Set(options.refuse) }),
    ...(options.float32 === true ? { float32: true } : {}),
    version: 0,
    // By the index below (Spec 027: the font check of every binding searched all variables of
    // every mode one by one, the largest share of a run).
    variableById: (id) => {
      index();
      return byId.get(id);
    },
    collectionOf: (variable) =>
      collections.find((collection) => collection.id === variable.variableCollectionId),
  };
  const notifications: DoubleNotification[] = [];
  const collections: DoubleCollection[] = [];
  const variables: DoubleVariable[] = [];
  // The index of the variables by name and id and the first mode per collection, rebuilt only
  // when a variable, a collection or a mode is added: `resolve` runs for every bound number of
  // every layout, and a plan with the third level holds over two thousand variables (B-14).
  let indexed = -1;
  let shape = 0;
  let byName = new Map<string, DoubleVariable>();
  let byId = new Map<string, DoubleVariable>();
  let firstMode = new Map<string, string>();
  const index = () => {
    if (indexed !== shape) {
      byName = new Map(variables.map((variable) => [variable.name, variable]));
      byId = new Map(variables.map((variable) => [variable.id, variable]));
      firstMode = new Map(collections.map((c) => [c.id, c.modes[0]?.modeId ?? ""]));
      indexed = shape;
    }
  };
  const root = node("DOCUMENT", "Document", counts, context);
  const page = node("PAGE", "Page 1", counts, context);
  root.appendChild(page);
  const onPage = (created: DoubleNode): DoubleNode => {
    page.appendChild(created);
    return created;
  };

  const createCollection = (name: string): DoubleCollection => {
    counts.collections++;
    const modes: DoubleMode[] = [{ modeId: id("mode"), name: "Mode 1" }];
    const shared = new Map<string, string>();
    const collection: DoubleCollection = {
      getSharedPluginData(namespace, key) {
        return shared.get(`${namespace}/${key}`) ?? "";
      },
      setSharedPluginData(namespace, key, value) {
        shared.set(`${namespace}/${key}`, value);
        counts.writes++;
      },
      id: id("collection"),
      name,
      modes,
      defaultModeId: modes[0]?.modeId ?? "",
      renameMode(modeId, next) {
        const mode = modes.find((candidate) => candidate.modeId === modeId);
        if (mode !== undefined) mode.name = next;
        counts.writes++;
      },
      addMode(next) {
        if (modes.length >= modeLimit) {
          throw new Error(
            `Limit of ${modeLimit} modes reached for collection ${name}; upgrade the Figma plan.`,
          );
        }
        const modeId = id("mode");
        modes.push({ modeId, name: next });
        shape++;
        counts.writes++;
        return modeId;
      },
    };
    collections.push(collection);
    shape++;
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
      variableCollectionId: collection.id,
      hiddenFromPublishing: false,
      valuesByMode: {},
      setValueForMode(modeId, value) {
        // A mode belongs to one collection, and Figma refuses a value for a mode its variable's
        // collection does not have — measured on 2026-10-09 in f10b-2, where a variable the file
        // held in `fundamento` was given a value for a mode of `aspekto`. The message is Figma's.
        if (!collection.modes.some((mode) => mode.modeId === modeId)) {
          throw new Error(`in setValueForMode: mode with id ${modeId} not defined for variable`);
        }
        counts.valueWrites++;
        counts.writes++;
        context.version++;
        variable.valuesByMode[modeId] = value;
      },
      resolveForConsumer(consumer) {
        // What Figma answers for this node: the mode the node stands in for the variable's own
        // collection, then the same question again for every alias on the way (F34).
        const modes = consumer.resolvedVariableModes;
        let current: DoubleVariable | undefined = variable;
        for (let depth = 0; current !== undefined && depth < 32; depth++) {
          const value = current.valuesByMode[modes[current.variableCollectionId] ?? ""];
          const alias = value as { type?: string; id?: string } | undefined;
          if (alias?.type !== "VARIABLE_ALIAS") {
            return { value, resolvedType: current.resolvedType };
          }
          current = variables.find((candidate) => candidate.id === alias.id);
        }
        return { value: undefined, resolvedType: variable.resolvedType };
      },
    };
    variables.push(variable);
    shape++;
    // Every direct assignment on a variable is a write of the document as well.
    return new Proxy(variable, {
      set(target, key, value) {
        counts.writes++;
        return Reflect.set(target, key, value);
      },
    });
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
      // Measured on 2026-09-22 (F22, file hEWHvBz7uRNrpYSau52OUN): a paint shows the colour it
      // holds, binding or not — a raw paint with boundVariables and the placeholder {0,0,0}
      // rendered black. Only this call resolves the variable's colour into the copy it returns.
      // Spec 014 ④ (G4): an effect binds a field to a variable and carries the alias, as the real
      // API does (setBoundVariableForEffect returns a copy); the double keeps the written value.
      setBoundVariableForEffect: (effect: unknown, field: string, variable: DoubleVariable) => {
        const given = effect as Record<string, unknown>;
        const bound = (given.boundVariables ?? {}) as Record<string, unknown>;
        return {
          ...given,
          boundVariables: {
            ...bound,
            [field]: { type: "VARIABLE_ALIAS", id: variable.id, name: variable.name },
          },
        };
      },
      setBoundVariableForPaint: (paint: unknown, _field: string, variable: DoubleVariable) => {
        const resolved = resolveColor(variable.name);
        return {
          ...(paint as Record<string, unknown>),
          ...(resolved === undefined ? {} : { color: resolved }),
          boundVariables: {
            color: { type: "VARIABLE_ALIAS", id: variable.id, name: variable.name },
          },
        };
      },
    }),
    // Figma legt jeden neuen Knoten auf der aktuellen Seite ab, bis er umgehängt wird. Gemessen
    // 2026-10-08 (F-B): Ein abgestürzter Lauf hinterließ seine Komponente lose auf der Seite.
    createComponent: () => onPage(node("COMPONENT", "Component", counts, context)),
    createFrame: () => onPage(node("FRAME", "Frame", counts, context)),
    createText: () => onPage(node("TEXT", "Text", counts, context)),
    createRectangle: () => onPage(node("RECTANGLE", "Rectangle", counts, context)),
    // Spec 010 ② (the check mark of the markobutono, plan ② D-09). What the double does here is a
    // **belief** about the Plugin API until the maintainer measures it in f10b-5:
    // - createNodeFromSvg puts a FRAME of the SVG's width and height on the current page, with a
    //   white fill like any new frame, holding one VECTOR per path of the SVG;
    // - a vector with constraints SCALE follows the size of its frame, also a size bound to a
    //   variable (the double keeps the vector's numbers: it computes no constraints);
    // - Spec 011 ③ (the arc of the plenstato): a path drawn with `stroke` on the svg element
    //   arrives as a vector with that stroke (currentColor reads black) at the SVG's stroke-width,
    //   and `fill="none"` as a vector without fill — a belief until measured in f10b-5.
    createNodeFromSvg: (svg: string) => {
      const size = (name: string) =>
        Number(new RegExp(`${name}="([0-9.]+)"`).exec(svg)?.[1] ?? "100");
      const attribute = (name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(svg)?.[1];
      const frame = onPage(node("FRAME", "Frame", counts, context));
      frame.properties.width = size("width");
      frame.properties.height = size("height");
      const stroked = attribute("stroke") !== undefined && attribute("stroke") !== "none";
      for (const _path of svg.match(/<path /g) ?? []) {
        const vector = node("VECTOR", "Vector", counts, context);
        vector.properties.width = size("width");
        vector.properties.height = size("height");
        if (attribute("fill") === "none") vector.properties.fills = [];
        if (stroked) {
          vector.properties.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
          vector.properties.strokeWeight = Number(attribute("stroke-width") ?? "1");
        }
        frame.appendChild(vector);
      }
      return frame;
    },
    // F-2 (Nachlese Spec 008/009): the section „Fundamento" that holds every set. What the double
    // does here is a **belief** about the Plugin API until the maintainer measures it in f10b-5
    // (green CI is no acceptance for what lands in Figma):
    // - createSection puts a SECTION of 100 × 100 at 0/0 on the current page;
    // - a child of a section keeps its numbers x/y when it is appended, now relative to the
    //   section — appending does not keep the place on the page;
    // - resizeWithoutConstraints(width, height) sets the size of the section and moves no child;
    // - a section carries explicit variable modes like any node, and a child that has none
    //   resolves the section's (resolvedVariableModes walks the ancestors).
    createSection: () => {
      const section = onPage(node("SECTION", "Section", counts, context));
      Object.assign(section, {
        resizeWithoutConstraints(width: number, height: number) {
          section.properties.width = width;
          section.properties.height = height;
          section.defaults.delete("width");
          section.defaults.delete("height");
          counts.writes++;
          context.version++;
        },
      });
      return section;
    },
    combineAsVariants: (components: DoubleNode[], parent: DoubleNode) => {
      const set = node("COMPONENT_SET", "Component Set", counts, context);
      // Component properties live on the set (F11): a TEXT property the labels are connected to;
      // a BOOLEAN property a layer's visibility is connected to (Spec 011 ③, dismissible); since
      // Spec 027 also INSTANCE_SWAP and SLOT.
      defineProperties(
        RAW.get(set) ?? set,
        () => set,
        () => false,
        true,
      );
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
    index();
    let variable = byName.get(name);
    for (let depth = 0; variable !== undefined && depth < 32; depth++) {
      const value = variable.valuesByMode[firstMode.get(variable.variableCollectionId) ?? ""];
      const alias = value as { type?: string; id?: string } | undefined;
      if (alias?.type !== "VARIABLE_ALIAS") return value;
      variable = byId.get(alias.id ?? "");
    }
    return undefined;
  };
  /** The colour a COLOR variable holds in the default mode, aliases followed; `{r,g,b}`. */
  const resolveColor = (name: string): { r: number; g: number; b: number } | undefined => {
    const value = resolve(name) as { r?: unknown; g?: unknown; b?: unknown } | undefined;
    return typeof value?.r === "number" &&
      typeof value.g === "number" &&
      typeof value.b === "number"
      ? { r: value.r, g: value.g, b: value.b }
      : undefined;
  };
  context.resolveColor = resolveColor;
  context.collections = () => collections;
  // One layout per state of the document (see NodeContext.version), with its resolved numbers.
  let computed: { version: number; top: DoubleNode; boxes: Map<DoubleNode, DoubleBox> } | undefined;
  // A size depends on the layers above a node only as far as it fills them: width and height are
  // computed from the first layer up that does not fill its parent (Spec 027: the plugin measures
  // every stretching variant after writing it, and a layout of the whole file per read took a run
  // from 4 s to minutes). A place (x, y) is relative to the parent: it is computed from the parent
  // up the same way.
  const fillsParent = (node: DoubleNode): boolean => {
    const parent = node.parent;
    const mode = parent?.properties.layoutMode;
    if (parent === undefined || (mode !== "HORIZONTAL" && mode !== "VERTICAL")) return false;
    if (node.properties.layoutPositioning === "ABSOLUTE" || node.properties.visible === false) {
      return false;
    }
    return (
      node.properties.layoutSizingHorizontal === "FILL" ||
      node.properties.layoutSizingVertical === "FILL"
    );
  };
  context.box = (current: DoubleNode, key?: string) => {
    if (computed !== undefined && computed.version === context.version) {
      const known = computed.boxes.get(current);
      // The layout of a part of the file places its top at 0/0: the top's own place is not in it.
      const placed = current !== computed.top || computed.top.parent === undefined;
      if (known !== undefined && (placed || key === "width" || key === "height")) return known;
    }
    let top = key === "x" || key === "y" ? (current.parent ?? current) : current;
    if (GEOMETRY_KEYS.has(key ?? "")) {
      while (top.parent !== undefined && fillsParent(top)) top = top.parent;
    } else {
      while (top.parent !== undefined) top = top.parent;
    }
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
      // A field of an auto-layout child is no default a plugin could own on a node outside auto
      // layout (F-5): Figma refuses the write; the tool's value stands and is not counted.
      const laidOut = hasAutoLayout(current) || hasAutoLayout(current.parent);
      for (const key of keys) {
        if (LAYOUT_CHILD_FIELDS.has(key) && !laidOut) continue;
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
    get loadedFonts() {
      return [...loaded].sort();
    },
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
