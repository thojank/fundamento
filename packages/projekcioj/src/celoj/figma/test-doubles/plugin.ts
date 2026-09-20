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
  boundVariables: Record<string, string>;
  pluginData: Record<string, string>;
  appendChild(child: DoubleNode): void;
  setSharedPluginData(namespace: string, key: string, value: string): void;
  getSharedPluginData(namespace: string, key: string): string;
  setBoundVariable(field: string, variable: DoubleVariable | null): void;
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
}

let sequence = 0;
const id = (prefix: string) => `${prefix}:${++sequence}`;

function node(type: string, name: string, counts: DoubleCounts): DoubleNode {
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
    properties: {},
    boundVariables: {},
    pluginData: {},
    appendChild(child) {
      child.parent?.children.splice(child.parent.children.indexOf(child), 1);
      child.parent = recorded;
      self.children.push(child);
    },
    setSharedPluginData(namespace, key, value) {
      self.pluginData[`${namespace}/${key}`] = value;
    },
    getSharedPluginData(namespace, key) {
      return self.pluginData[`${namespace}/${key}`] ?? "";
    },
    setBoundVariable(field, variable) {
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
      if (typeof key === "string" && !(key in target)) {
        target.properties[key] = value;
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

/** A fresh double with an empty document. */
export function figmaDouble(): FigmaDouble {
  const counts: DoubleCounts = { collections: 0, variables: 0, nodes: 0, valueWrites: 0 };
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
    createText: () => {
      const text = node("TEXT", "Text", counts);
      text.properties.characters = "";
      return text;
    },
    createRectangle: () => node("RECTANGLE", "Rectangle", counts),
    combineAsVariants: (components: DoubleNode[], parent: DoubleNode) => {
      const set = node("COMPONENT_SET", "Component Set", counts);
      parent.appendChild(set);
      for (const component of components) set.appendChild(component);
      return set;
    },
    loadFontAsync: async () => undefined,
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

  return { figma, notifications, counts, collections, variables, root, snapshot };
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
