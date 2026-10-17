// The generated Figma development plugin (Spec 003, plan D-12). The maintainer imports it from its
// manifest in Figma desktop; development plugins run on every Figma plan, so the standard path does
// not depend on Organization or Enterprise. It applies `plan.json` — embedded as a constant, since
// a plugin reads no repository files — idempotently: it finds what it made by name and by the
// shared plugin data `fundamento`, updates it, and never duplicates. A run that would create a
// variant in a set it found aborts before its first write and names what it would have created
// (F10c); the menu command „auch in vorgefundenem Set anlegen" lifts that on purpose. A run that
// finds a planned variable in another collection than the plan puts it in aborts the same way and
// names every such variable (Sammlung gewechselt): the Plugin API cannot move a variable, and
// re-creating it would cut every binding and alias. Nothing else in the file is touched. The
// plugin runs as a Figma development plugin; through the Figma MCP an agent reads the result back
// (the generated code.js exceeds the MCP's 50 KB per call).
//
// The plugin uses this slice of the Plugin API (the test double covers exactly it):
// variables.getLocalVariableCollectionsAsync/getLocalVariablesAsync, createVariableCollection,
// createVariable, createVariableAlias, setBoundVariableForPaint, collection.addMode/renameMode,
// variable.setValueForMode/variableCollectionId, createComponent/createFrame/createText,
// combineAsVariants, appendChild, setBoundVariable, set/getSharedPluginData, createSection with
// resizeWithoutConstraints for the section „Fundamento" (F-2), and in it a frame „Eroj" with
// auto-layout (layoutMode HORIZONTAL, layoutWrap WRAP, itemSpacing, counterAxisSpacing) that holds
// every set (F-8). Spec 011 ③ adds a stroke weight per side (strokeLeftWeight, bound: the accent
// of a notice), a BOOLEAN component property connected to a layer's visible
// (componentPropertyReferences.visible: dismissible), a dash pattern and an invisible paint (the
// stroke of a state) — each a belief about the API until the maintainer has measured it in
// f10b-5. Spec 011 ④ adds the bottom weight (strokeBottomWeight: the border under a table's
// rows), a minimum width written from the measured width (minWidth: the columns of a table),
// a width written from the measured width (resize: the column of a meter takes the wider of its
// texts — a set has no container to fill — and the fill frame the plan's share of the track,
// since Figma binds no share; the track fills the column, layoutSizingHorizontal FILL),
// clipsContent on the region and the track, textAlignHorizontal RIGHT for a numeric column, and
// a text that carries two property references (characters and visible: the caption) — beliefs
// alike until measured. Spec 011 ⑤ adds nothing new to the slice: the underline of a navigation's
// item, the line of a tab list and the indicator of a tab are bottom weights (strokeBottomWeight)
// on a frame with the three other sides at 0, as the rows of a table are.

import { type FigmaPlan, TEXT_CASE_VARIES } from "./figma.js";

/** The nodes of one variant the plugin draws, outside in (F11). */
type PartNode =
  | "focus-ring"
  | "focus-gap"
  | "control"
  | "label"
  | "text"
  | "help"
  | "error"
  | "indicator"
  | "field"
  | "mark"
  | "texts"
  // A radio group (Spec 010 ③, D-07): the column of options, one row per option, its label.
  | "options"
  | "option"
  | "option-label"
  // A dialog (Spec 011 ②): the surface with heading, message, the content holding the reason's
  // label and field, the row of actions with two stand-ins; the backdrop is the example frame.
  | "surface"
  | "heading"
  | "message"
  | "content"
  | "reason-label"
  | "reason-field"
  | "actions"
  | "action-1"
  | "action-2"
  | "action-label-1"
  | "action-label-2"
  | "backdrop"
  // A notice (Spec 011 ③): the details text and the dismiss frame; a badge and a state (Spec 011
  // ③) reuse control, text, indicator, mark, texts and actions.
  | "details"
  | "dismiss"
  // A meter (Spec 011 ④, plan ④ D-14): the track with the fill frame in it and the value text;
  // `unknown` is the track of the example frame, the one node that carries the unknown stroke.
  | "track"
  | "fill"
  | "unknown"
  | "value-text"
  // A table (Spec 011 ④): the caption, the region, the head row and the body rows (`row-1` …),
  // the cells (`head-1` …, `cell-1-1` …) and their texts (`head-text-2` …, `row-header-text-1` …,
  // `cell-text-1-2` …), the sort button with its text and indicator in the sorted head cell. A
  // `*` in a binding's node stands for a number: every node of the set whose name matches.
  | "caption"
  | "region"
  | "head"
  | "sort"
  | "sort-text"
  | "sort-indicator"
  | `head-${string}`
  | `row-${string}`
  | `cell-${string}`
  // A list (Spec 011 ④): the list, its entries — registered as `entry-row-1` … where the entry is
  // a row (layout columns) and `entry-column-1` … where it is a column (stacked), so the gap binds
  // to the box's inline padding in the one and to its gap in the other — and their texts.
  | "list"
  | `entry-${string}`
  | `term-${string}`
  | `value-${string}`
  // A navigation (Spec 011 ⑤): the control is the nav (its gap); every item lies in an entry
  // frame (`entry-1` …) that holds ring → gap → `item-1` … (the link: its fill, its underline as
  // the bottom stroke) with the text `items-1` …. A tab list (Spec 011 ⑤): the control is the
  // list (its line as the bottom stroke, its gap); every tab in an entry frame — ring → gap →
  // `tab-1` … (fill by state, the selected indicator as the bottom stroke) with the text
  // `tabs-1` …; the panel below with its text.
  | `item-${string}`
  | `items-${string}`
  | `tab-${string}`
  | `tabs-${string}`
  | "panel"
  | "panel-text";

interface Binding {
  node: PartNode;
  fields: readonly string[];
  /** A colour: bound to the paint, with the deckkraft from the plan (F8). */
  paint?: boolean;
  /** The field of a composite token this binding takes: `focus/ring` + `/width`. */
  suffix?: string;
  /** Drawn only in the state that shows the focus ring; neutral in every other. */
  focusOnly?: boolean;
  /** A font field: bound only after every font of every mode is loaded, and never fatal (F30). */
  font?: boolean;
}

const PADDINGS = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"] as const;

/** The four bindings of a typography role on a text node (F9, F30), as the label's. */
const typographyOf = (node: PartNode): Binding[] => [
  { node, fields: ["fontSize"], suffix: "/font-size" },
  { node, fields: ["fontFamily"], suffix: "/font-family", font: true },
  { node, fields: ["fontStyle"], suffix: "/font-style", font: true },
  { node, fields: ["letterSpacing"], suffix: "/letter-spacing" },
];

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
  // to the bare name, the size never arrived — there is no variable of that name. Family and cut
  // are bound too (F30), so the label follows the brand when the mode changes instead of keeping
  // the typeface of the combination the plan was written from; both are marked `font`, because a
  // font binding only holds once every font it can show is loaded.
  "label.typography": [
    { node: "label", fields: ["fontSize"], suffix: "/font-size" },
    { node: "label", fields: ["fontFamily"], suffix: "/font-family", font: true },
    { node: "label", fields: ["fontStyle"], suffix: "/font-style", font: true },
    // Gesperrte Versalien sind ein Paar (F31). Der Sperrsatz ist ein bindbares Feld des
    // Textknotens und folgt damit dem Modus; die Schreibweise ist keines und wird geschrieben.
    { node: "label", fields: ["letterSpacing"], suffix: "/letter-spacing" },
  ],
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
  // A field (Spec 009, D-09): the text in the control, the help and the error are text nodes of
  // their own, each with its typography bound like the label's. The control of a field in the set
  // is empty and shows the placeholder (F-4), so the node's fill is the placeholder's colour; the
  // colour of the typed text has no node (Jugxo B-2).
  "placeholder.color": [{ node: "text", fields: ["fills"], paint: true }],
  "text.typography": [
    { node: "text", fields: ["fontSize"], suffix: "/font-size" },
    { node: "text", fields: ["fontFamily"], suffix: "/font-family", font: true },
    { node: "text", fields: ["fontStyle"], suffix: "/font-style", font: true },
    { node: "text", fields: ["letterSpacing"], suffix: "/letter-spacing" },
  ],
  "help.color": [{ node: "help", fields: ["fills"], paint: true }],
  "help.typography": [
    { node: "help", fields: ["fontSize"], suffix: "/font-size" },
    { node: "help", fields: ["fontFamily"], suffix: "/font-family", font: true },
    { node: "help", fields: ["fontStyle"], suffix: "/font-style", font: true },
    { node: "help", fields: ["letterSpacing"], suffix: "/letter-spacing" },
  ],
  "error.color": [{ node: "error", fields: ["fills"], paint: true }],
  "error.typography": [
    { node: "error", fields: ["fontSize"], suffix: "/font-size" },
    { node: "error", fields: ["fontFamily"], suffix: "/font-family", font: true },
    { node: "error", fields: ["fontStyle"], suffix: "/font-style", font: true },
    { node: "error", fields: ["letterSpacing"], suffix: "/letter-spacing" },
  ],
  // A switch (Spec 010 ①, D-10): the knob is a frame of its own in the track, its fill, its size
  // (width and height alike: a circle) and its radius bound like the control's.
  "indicator.fill": [{ node: "indicator", fields: ["fills"], paint: true }],
  "indicator.size": [{ node: "indicator", fields: ["width", "height"] }],
  "indicator.radius": [{ node: "indicator", fields: ["cornerRadius"] }],
  // A checkbox (Spec 010 ②, D-09): the indicator is the frame of the check mark (its size bound
  // like the knob's), the mark a vector in it whose fill is the colour of the indicator.
  "indicator.color": [{ node: "mark", fields: ["fills"], paint: true }],
  // A radio group (Spec 010 ③, D-07): the label of each option a text of its own, bound like the
  // label; the gap of the options stands between the parts of the field and between the rows.
  "option-label.color": [{ node: "option-label", fields: ["fills"], paint: true }],
  "option-label.typography": [
    { node: "option-label", fields: ["fontSize"], suffix: "/font-size" },
    { node: "option-label", fields: ["fontFamily"], suffix: "/font-family", font: true },
    { node: "option-label", fields: ["fontStyle"], suffix: "/font-style", font: true },
    { node: "option-label", fields: ["letterSpacing"], suffix: "/letter-spacing" },
  ],
  "options.gap": [
    { node: "field", fields: ["itemSpacing"] },
    { node: "options", fields: ["itemSpacing"] },
  ],
  // A dialog (Spec 011 ②): the surface's radius and width (bound by size: a frame of fixed width
  // takes a bound width), the heading and the message as texts of their own; the message's role
  // and colour also stand on the stand-ins — the label of the reason field and the words of the
  // two actions — which the Skemo gives no role of their own. The reason field's height is bound
  // by reason, the gaps of content and actions to their frames. The backdrop is the fill of the
  // example frame beside the set, the only node that draws it.
  "surface.radius": [{ node: "control", fields: ["cornerRadius"] }],
  "surface.width": [{ node: "control", fields: ["width"] }],
  "heading.color": [{ node: "heading", fields: ["fills"], paint: true }],
  "heading.typography": typographyOf("heading"),
  "message.color": [
    { node: "message", fields: ["fills"], paint: true },
    { node: "reason-label", fields: ["fills"], paint: true },
    { node: "action-label-1", fields: ["fills"], paint: true },
    { node: "action-label-2", fields: ["fills"], paint: true },
  ],
  "message.typography": [
    ...typographyOf("message"),
    ...typographyOf("reason-label"),
    ...typographyOf("action-label-1"),
    ...typographyOf("action-label-2"),
  ],
  "reason.height": [{ node: "reason-field", fields: ["height"] }],
  "content.gap": [{ node: "content", fields: ["itemSpacing"] }],
  "actions.gap": [{ node: "actions", fields: ["itemSpacing"] }],
  "backdrop.color": [{ node: "backdrop", fields: ["fills"], paint: true }],
  // A notice (Spec 011 ③, plan ③ D-14): the accent is the stroke of the control at its start —
  // the left side, the inline start of a file that knows no writing direction — its colour the
  // paint of the strokes, its width the weight of that side alone (the other three stay 0); the
  // details a text of their own; the dismiss frame a square of dismiss.size, like the knob.
  "accent.color": [{ node: "control", fields: ["strokes"], paint: true }],
  "accent.width": [{ node: "control", fields: ["strokeLeftWeight"] }],
  "details.color": [{ node: "details", fields: ["fills"], paint: true }],
  "details.typography": typographyOf("details"),
  "dismiss.size": [{ node: "dismiss", fields: ["width", "height"] }],
  // A meter (Spec 011 ④, plan ④ D-14): the track's fill and radius; its height is a minimum, as
  // on the web (min-block-size), and the fill is as high as the track (align-self: stretch) — the
  // same minimum on the fill, which is resized to it (F-3: an empty frame keeps its size); the
  // fill's colour and radius; the unknown stroke on the track of the example frame only (the
  // node `unknown` is registered there alone, like the backdrop of a dialog); the value text.
  "track.fill": [{ node: "track", fields: ["fills"], paint: true }],
  "track.radius": [{ node: "track", fields: ["cornerRadius"] }],
  "track.height": [
    { node: "track", fields: ["minHeight"] },
    { node: "fill", fields: ["minHeight"] },
  ],
  "fill.color": [{ node: "fill", fields: ["fills"], paint: true }],
  "fill.radius": [{ node: "fill", fields: ["cornerRadius"] }],
  "unknown.color": [{ node: "unknown", fields: ["strokes"], paint: true }],
  "unknown.width": [{ node: "unknown", fields: ["strokeWeight"] }],
  "value-text.color": [{ node: "value-text", fields: ["fills"], paint: true }],
  "value-text.typography": typographyOf("value-text"),
  // A table (Spec 011 ④, plan ④ D-14): the caption is the label; the head row's fill, the head
  // texts (the sort button's text takes the sort's colour and the head's role); every cell's
  // inline padding and minimum height (the web's min-block-size); the row headers' role; the
  // region's radius; the sort button's fill, colour and radius; the chevron's frame and vector.
  "caption.color": [{ node: "caption", fields: ["fills"], paint: true }],
  "caption.typography": typographyOf("caption"),
  "head.fill": [{ node: "head", fields: ["fills"], paint: true }],
  "head.color": [{ node: "head-text-*", fields: ["fills"], paint: true }],
  "head.typography": [...typographyOf("head-text-*"), ...typographyOf("sort-text")],
  "cell.color": [
    { node: "cell-text-*-*", fields: ["fills"], paint: true },
    { node: "row-header-text-*", fields: ["fills"], paint: true },
  ],
  "cell.typography": typographyOf("cell-text-*-*"),
  "cell.inline-padding": [
    { node: "head-*", fields: ["paddingLeft", "paddingRight"] },
    { node: "cell-*-*", fields: ["paddingLeft", "paddingRight"] },
  ],
  "cell.height": [
    { node: "head-*", fields: ["minHeight"] },
    { node: "cell-*-*", fields: ["minHeight"] },
  ],
  "row-header.typography": typographyOf("row-header-text-*"),
  "region.radius": [{ node: "region", fields: ["cornerRadius"] }],
  "sort.fill": [{ node: "sort", fields: ["fills"], paint: true }],
  "sort.color": [{ node: "sort-text", fields: ["fills"], paint: true }],
  "sort.radius": [{ node: "sort", fields: ["cornerRadius"] }],
  "sort-indicator.size": [{ node: "sort-indicator", fields: ["width", "height"] }],
  "sort-indicator.color": [{ node: "mark", fields: ["fills"], paint: true }],
  // A list (Spec 011 ④, plan ④ D-14): the terms and the values as texts, the gap of the list
  // between its entries.
  "term.color": [{ node: "term-*", fields: ["fills"], paint: true }],
  "term.typography": typographyOf("term-*"),
  "value.color": [{ node: "value-*", fields: ["fills"], paint: true }],
  "value.typography": typographyOf("value-*"),
  "list.gap": [{ node: "list", fields: ["itemSpacing"] }],
};

/**
 * Where a structure binds a part property elsewhere than BINDINGS says (Spec 010 ①, D-10): in a
 * toggle the gap stands between the track and the label beside it, so it is the field's spacing;
 * the track holds only the knob.
 */
const STRUCTURE_BINDINGS: Readonly<Record<string, Readonly<Record<string, readonly Binding[]>>>> = {
  toggle: { "box.gap": [{ node: "field", fields: ["itemSpacing"] }] },
  // A radio group (Spec 010 ③, D-07): the gap of the box stands between a circle and its label,
  // in the row of the option.
  choice: { "box.gap": [{ node: "option", fields: ["itemSpacing"] }] },
  // A dialog (Spec 011 ②) has no control: its surface takes what the control takes elsewhere —
  // fill, border, radius, width, the gap between its parts and its padding, which the Skemo names
  // once and the surface takes on every side. The border also outlines the stand-ins: the reason
  // field (the composed tekstareo's border is the same role) and the two actions, which take the
  // surface's padding across and its gap along as their room around the word.
  dialog: {
    "surface.fill": [{ node: "surface", fields: ["fills"], paint: true }],
    "surface.radius": [{ node: "surface", fields: ["cornerRadius"] }],
    "surface.width": [{ node: "surface", fields: ["width"] }],
    "border.color": [
      { node: "surface", fields: ["strokes"], paint: true },
      { node: "reason-field", fields: ["strokes"], paint: true },
      { node: "action-1", fields: ["strokes"], paint: true },
      { node: "action-2", fields: ["strokes"], paint: true },
    ],
    "border.width": [
      { node: "surface", fields: ["strokeWeight"] },
      { node: "reason-field", fields: ["strokeWeight"] },
      { node: "action-1", fields: ["strokeWeight"] },
      { node: "action-2", fields: ["strokeWeight"] },
    ],
    "box.inline-padding": [
      { node: "surface", fields: [...PADDINGS] },
      { node: "action-1", fields: ["paddingLeft", "paddingRight"] },
      { node: "action-2", fields: ["paddingLeft", "paddingRight"] },
    ],
    "box.gap": [
      { node: "surface", fields: ["itemSpacing"] },
      { node: "action-1", fields: ["paddingTop", "paddingBottom"] },
      { node: "action-2", fields: ["paddingTop", "paddingBottom"] },
    ],
  },
  // A badge (Spec 011 ③, plan ③ D-14): its text is the label — the colour of the text part goes
  // on the text node (in a field the text node shows the placeholder, B-2).
  badge: { "text.color": [{ node: "text", fields: ["fills"], paint: true }] },
  // A notice (Spec 011 ③): the padding of the box on every side of the control (the Skemo names
  // it once); the gap of the box between the parts of the row and between the texts of the column.
  notice: {
    "box.inline-padding": [{ node: "control", fields: [...PADDINGS] }],
    "box.gap": [
      { node: "control", fields: ["itemSpacing"] },
      { node: "texts", fields: ["itemSpacing"] },
    ],
  },
  // A state (Spec 011 ③): the padding on every side; the text is the label; the arc is a stroked
  // path, so the indicator's colour is the stroke of the vector, not its fill.
  state: {
    "box.inline-padding": [{ node: "control", fields: [...PADDINGS] }],
    "text.color": [{ node: "text", fields: ["fills"], paint: true }],
    "indicator.color": [{ node: "mark", fields: ["strokes"], paint: true }],
  },
  // A table (Spec 011 ④, plan ④ D-14): the border outlines the region on every side and runs
  // under the head and under every row (the web's border-block-end of every cell — one line per
  // row here, the bottom side alone, the other three 0).
  table: {
    "border.color": [
      { node: "region", fields: ["strokes"], paint: true },
      { node: "head", fields: ["strokes"], paint: true },
      { node: "row-*", fields: ["strokes"], paint: true },
    ],
    "border.width": [
      { node: "region", fields: ["strokeWeight"] },
      { node: "head", fields: ["strokeBottomWeight"] },
      { node: "row-*", fields: ["strokeBottomWeight"] },
    ],
  },
  // A list (Spec 011 ④): the gap between term and value is the box's inline padding where the
  // entry is a row (columns: the web's column-gap) and the box's gap where it is a column
  // (stacked: the web's row-gap); an entry is registered under the one name or the other.
  list: {
    "box.inline-padding": [{ node: "entry-row-*", fields: ["itemSpacing"] }],
    "box.gap": [{ node: "entry-column-*", fields: ["itemSpacing"] }],
  },
  // A navigation (Spec 011 ⑤): the box is every item — its minimum height, radius and inline
  // padding (the web's link), the gap stays on the control (the nav, BINDINGS); the item's fill
  // and the text of the item in its colour and role; the underline as the item's bottom stroke
  // — its width by current (none where not current: the weight stays 0), its colour the stroke's
  // paint. No text decoration: the web draws a block-end edge here, not a line under the word.
  nav: {
    "box.height": [{ node: "item-*", fields: ["minHeight"] }],
    "box.radius": [{ node: "item-*", fields: ["cornerRadius"] }],
    "box.inline-padding": [{ node: "item-*", fields: ["paddingLeft", "paddingRight"] }],
    "item.fill": [{ node: "item-*", fields: ["fills"], paint: true }],
    "items.color": [{ node: "items-*", fields: ["fills"], paint: true }],
    "items.typography": typographyOf("items-*"),
    "underline.width": [{ node: "item-*", fields: ["strokeBottomWeight"] }],
    "underline.color": [{ node: "item-*", fields: ["strokes"], paint: true }],
  },
  // A tab list (Spec 011 ⑤): the list is the control — its line the bottom stroke (colour and
  // width), its gap between the tabs; every tab its fill by state, minimum height and inline
  // padding, the selected indicator its bottom stroke (width by active, none where not active);
  // the tab's text in its colour by active and its role; the panel its inline padding, its text
  // in the panel's colour.
  tabs: {
    "list.color": [{ node: "control", fields: ["strokes"], paint: true }],
    "list.width": [{ node: "control", fields: ["strokeBottomWeight"] }],
    "list.gap": [{ node: "control", fields: ["itemSpacing"] }],
    "tab.fill": [{ node: "tab-*", fields: ["fills"], paint: true }],
    "tab.height": [{ node: "tab-*", fields: ["minHeight"] }],
    "tab.inline-padding": [{ node: "tab-*", fields: ["paddingLeft", "paddingRight"] }],
    "tabs.color": [{ node: "tabs-*", fields: ["fills"], paint: true }],
    "tabs.typography": typographyOf("tabs-*"),
    "selected-indicator.width": [{ node: "tab-*", fields: ["strokeBottomWeight"] }],
    "selected-indicator.color": [{ node: "tab-*", fields: ["strokes"], paint: true }],
    "panel.inline-padding": [{ node: "panel", fields: ["paddingLeft", "paddingRight"] }],
    "panel.color": [{ node: "panel-text", fields: ["fills"], paint: true }],
  },
};

/** A column of parts: the field of a textbox (Spec 009, D-09): label, control, help, error. */
const FIELD_LAYOUT = {
  layoutMode: "VERTICAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "MIN",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * A row of parts: the field of a switch (Spec 010 ①, D-10): the ring around the track, then the
 * label beside it, centred on one line; the gap between them is bound to box.gap.
 */
const TOGGLE_LAYOUT = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The column beside the box of a checkbox (Spec 010 ②, D-09): the label, then the error under it,
 * at the start; the box stands at the first line (the field aligns its row at the start), as on
 * the web.
 */
const TEXTS_LAYOUT = {
  layoutMode: "VERTICAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "MIN",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The surface of a dialog (Spec 011 ②): a column of fixed width — the width is bound to
 * size.container.* and a bound width only takes effect on a frame that is not hugging — that
 * hugs its height; heading, message, content and actions at the start. Its padding and gap are
 * bound (box.inline-padding, box.gap).
 */
const SURFACE_LAYOUT = {
  layoutMode: "VERTICAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "MIN",
  layoutSizingHorizontal: "FIXED",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The content of a dialog (Spec 011 ②): a column across the whole surface, the reason's label
 * above its field, the gap bound to content.gap. Where the variant asks no reason it is hidden
 * (visible false): a hidden child of an auto-layout frame takes no space, so no gap remains.
 */
const CONTENT_LAYOUT = {
  layoutMode: "VERTICAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "MIN",
  layoutSizingHorizontal: "FILL",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The field of the reason (Spec 011 ②), a frame standing in for the composed tekstareo: across
 * the content, its height bound to reason.height (size.control.large) — fixed, so the binding
 * takes effect — with the border of the surface and no fill of its own.
 */
const REASON_FIELD_LAYOUT = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "MIN",
  layoutSizingHorizontal: "FILL",
  layoutSizingVertical: "FIXED",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The actions of a dialog (Spec 011 ②): a row across the surface, its two stand-ins at the end
 * (the web's row, end), the gap bound to actions.gap.
 */
const ACTIONS_LAYOUT = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MAX",
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "FILL",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The control of a notice (Spec 011 ③, plan ③ D-14): a row — the texts column, then the dismiss
 * frame — at the start; the accent is its left stroke, and the stroke lies in the size, as on the
 * web (box-sizing border-box: the border-inline-start adds to the padding). Padding and gap are
 * bound (box.inline-padding on every side, box.gap).
 */
const NOTICE_LAYOUT = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "MIN",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: true,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The control of a state (Spec 011 ③, plan ③ D-14): a column, centred — the arc, the text, the
 * actions — whose border lies in the size (border-box), dashed or not shown as the variant says.
 */
const STATE_LAYOUT = {
  layoutMode: "VERTICAL",
  primaryAxisAlignItems: "CENTER",
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: true,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The placeholder of a slot of elements (Spec 011 ③: the actions of a notice and of a state): an
 * empty row that hugs what a designer drops into it, its gap bound (actions.gap). It stands in
 * for instances of the butono, like the stand-ins of a dialog (candidate B-6). While it is empty
 * it is as small as the tool allows (`shrinkEmpty`, F-4): an auto-layout frame without children
 * keeps its size, hug or not, and the 100 × 100 of createFrame made the notice as high as that.
 */
const PLACEHOLDER_LAYOUT = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The column of a meter (Spec 011 ④, plan ④ D-14; acceptance F-3): label, track, value text.
 * The meter takes the width of its container (Uzo size container), so the track fills the
 * column's inline axis — and a set has no container to fill: the column is fixed in that axis
 * and takes the width of the wider of its texts, measured and written (resize), the one number
 * the track can fill. Figma gives a FILL child nothing in a parent that hugs the same axis (the
 * editor turns such a parent fixed) — a belief until measured in f10b-5. It hugs its height.
 */
const METER_LAYOUT = {
  layoutMode: "VERTICAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "MIN",
  layoutSizingHorizontal: "FIXED",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The track of a meter (Spec 011 ④, plan ④ D-14): a row that clips its fill to its radius, as on
 * the web (overflow hidden, border-box: the unknown stroke of the example lies in the size); it
 * fills the column's width (F-3: FILL along the inline axis, as the web's track is as wide as
 * the meter) and hugs its height, at least track.height (bound) — the fill frame in it is as
 * high as that, and the empty track of the example is brought to it (an empty auto-layout frame
 * keeps its size, ③ F-4).
 */
const TRACK_LAYOUT = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "MIN",
  layoutSizingHorizontal: "FILL",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: true,
  clipsContent: true,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The fill of a meter (Spec 011 ④; acceptance F-3): an empty frame, fixed in both axes and
 * resized by the plugin — the width the plan's share of the track's measured width, the height
 * the track's height (track.height, bound to it as a minimum too, so a mode with a higher track
 * lifts it). Hugging, an empty auto-layout frame keeps the 100 × 100 of createFrame (③ F-4): the
 * fill stood as a circle and the track hugged it.
 */
const FILL_LAYOUT = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "MIN",
  layoutSizingHorizontal: "FIXED",
  layoutSizingVertical: "FIXED",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * A row of a table (Spec 011 ④, plan ④ D-14): the head and every body row, hugging its cells,
 * the border under it in the size (border-box).
 */
const ROW_LAYOUT = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: true,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * A cell of a table (Spec 011 ④): a row holding its text (or the sort button), its inline
 * padding and minimum height bound (cell.inline-padding, cell.height), hugging — and at least as
 * wide as the widest cell of its column (minWidth, written from the measurement, so the columns
 * align). A numeric cell aligns at the end (primaryAxisAlignItems MAX).
 */
const CELL_LAYOUT = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * An entry of a list in columns (Spec 011 ④): term then value in a row, the gap bound to the
 * box's inline padding; stacked, the entry is a column (TEXTS_LAYOUT) with the box's gap.
 */
const ENTRY_ROW_LAYOUT = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "MIN",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The nav of a navigation (Spec 011 ⑤): a row of its items at the start, centred on one line, the
 * gap bound to box.gap; the example „vertikal" turns it into a column (layoutMode VERTICAL, the
 * items at the start). The web wraps the row when the container is narrow; a set has no container.
 */
const NAV_LAYOUT = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "CENTER",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The list of a tab list (Spec 011 ⑤): a row of its tabs that never wraps, the tabs at its end
 * across (their indicators on the line), its line the bottom stroke and in the size (border-box),
 * the gap bound to list.gap.
 */
const TABLIST_LAYOUT = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "MAX",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: true,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The panel of a tab list (Spec 011 ⑤): a row holding its word, the inline padding bound
 * (panel.inline-padding), hugging what an instance puts into it.
 */
const PANEL_LAYOUT = {
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "MIN",
  counterAxisAlignItems: "MIN",
  layoutSizingHorizontal: "HUG",
  layoutSizingVertical: "HUG",
  strokesIncludedInLayout: false,
  itemSpacing: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * The vector of a check mark (Spec 010 ②, D-09): no line, no effect, its fill bound to the
 * indicator's colour; it scales with its frame, whose size is bound — the frame is the sign's box
 * of 16 the SVG was drawn in.
 */
const MARK_NEUTRAL = {
  fills: [],
  strokes: [],
  strokeWeight: 0,
  effects: [],
  opacity: 1,
  constraints: { horizontal: "SCALE", vertical: "SCALE" },
};

/**
 * The knob of a switch (Spec 010 ①, D-10): its size is bound (indicator.size), so it is fixed in
 * both axes; Figma honours a bound width only on a frame that is not hugging or filling. The frame
 * of a check mark (Spec 010 ②) is laid out the same way.
 */
const INDICATOR_LAYOUT: Readonly<Record<string, string>> = {
  // The knob holds nothing; it is a filled frame, no layout of its own.
  layoutMode: "NONE",
  layoutSizingHorizontal: "FIXED",
  layoutSizingVertical: "FIXED",
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
 * Modes a Figma plan allows per collection (help.figma.com, checked 2026-09-20, research §6.2):
 * Professional 10, Organization 20, Enterprise unlimited with extended collections; Starter has
 * one mode. Every Aspekto of the Modelo is one mode of the collection `aspekto` (F27), so this
 * number is the number of brands one library can carry on the plan we build for. The plan itself
 * is never cut to it — a projection projects the Modelo, not one Figma subscription; the run says
 * with numbers what does not fit.
 */
export const FIGMA_MODE_LIMIT = 10;

/**
 * Every part property the plugin applies to the file. The Figma side of `check:parity` reports
 * exactly these and nothing else: a side claims only what it does (Paket „Figma zeigt das Ero").
 */
export const DRAWN_PART_PROPERTIES: readonly string[] = Object.keys(BINDINGS);

/**
 * Every part property the plugin applies for a set of one structure (Spec 011 ③): what every
 * structure shares and what this structure binds elsewhere (the text's colour of a badge, the
 * stroke of a state's arc). The plan of a set claims exactly these.
 */
export const drawnPartPropertiesOf = (structure: string): readonly string[] => [
  ...new Set([...Object.keys(BINDINGS), ...Object.keys(STRUCTURE_BINDINGS[structure] ?? {})]),
];

/**
 * The part properties a structure binds on nodes of its own (Spec 011 ⑤): what it draws whatever
 * release the part's name has in FIGMA_NOT_DRAWN — the underline of a navigation's item is its
 * block-end stroke, not the text decoration the ligilo's Jugxo releases.
 */
export const structureBoundPartPropertiesOf = (structure: string): readonly string[] =>
  Object.keys(STRUCTURE_BINDINGS[structure] ?? {});

/**
 * The menu command that lifts the abort of F10c: a run that would create a variant in a set it
 * found goes on. Its own entry, so the default command can never do it by accident.
 */
const APPLY_COMMAND = "apply";
const LIFT_COMMAND = "apply-create-in-found-set";
const LIFT_MENU_NAME = "Plan anwenden – auch in vorgefundenem Set anlegen";

/** The build of a plugin whose build was not given: said so, never guessed. */
export const UNKNOWN_BUILD = "unbekannt";

/**
 * `code.js` with the plan embedded and the build it comes from (Maintainer, 2026-10-08): every run
 * names it, and the set keeps it as plugin data `build` — a file shows which state wrote it last.
 */
export function pluginSource(plan: FigmaPlan, build: string = UNKNOWN_BUILD): string {
  return `// Generated by fm projekcioj build; do not edit (Art. I). Fundamento ${plan.fundamento}, Build ${build}.
const PLAN = ${JSON.stringify(plan)};
const BUILD = ${JSON.stringify(build)};
/** How every message of a run names what is running. */
const WHO = "Fundamento " + PLAN.fundamento + " (Build " + BUILD + ")";
const NAMESPACE = ${JSON.stringify(PLUGIN_NAMESPACE)};
const BINDINGS = ${JSON.stringify(BINDINGS)};
const CONTROL_LAYOUT = ${JSON.stringify(CONTROL_LAYOUT)};
const HUG_LAYOUT = ${JSON.stringify(HUG_LAYOUT)};
const FIELD_LAYOUT = ${JSON.stringify(FIELD_LAYOUT)};
const TOGGLE_LAYOUT = ${JSON.stringify(TOGGLE_LAYOUT)};
const TEXTS_LAYOUT = ${JSON.stringify(TEXTS_LAYOUT)};
const SURFACE_LAYOUT = ${JSON.stringify(SURFACE_LAYOUT)};
const CONTENT_LAYOUT = ${JSON.stringify(CONTENT_LAYOUT)};
const REASON_FIELD_LAYOUT = ${JSON.stringify(REASON_FIELD_LAYOUT)};
const ACTIONS_LAYOUT = ${JSON.stringify(ACTIONS_LAYOUT)};
const NOTICE_LAYOUT = ${JSON.stringify(NOTICE_LAYOUT)};
const STATE_LAYOUT = ${JSON.stringify(STATE_LAYOUT)};
const PLACEHOLDER_LAYOUT = ${JSON.stringify(PLACEHOLDER_LAYOUT)};
const METER_LAYOUT = ${JSON.stringify(METER_LAYOUT)};
const TRACK_LAYOUT = ${JSON.stringify(TRACK_LAYOUT)};
const FILL_LAYOUT = ${JSON.stringify(FILL_LAYOUT)};
const ROW_LAYOUT = ${JSON.stringify(ROW_LAYOUT)};
const CELL_LAYOUT = ${JSON.stringify(CELL_LAYOUT)};
const ENTRY_ROW_LAYOUT = ${JSON.stringify(ENTRY_ROW_LAYOUT)};
const NAV_LAYOUT = ${JSON.stringify(NAV_LAYOUT)};
const TABLIST_LAYOUT = ${JSON.stringify(TABLIST_LAYOUT)};
const PANEL_LAYOUT = ${JSON.stringify(PANEL_LAYOUT)};
const MARK_NEUTRAL = ${JSON.stringify(MARK_NEUTRAL)};
const INDICATOR_LAYOUT = ${JSON.stringify(INDICATOR_LAYOUT)};
const STRUCTURE_BINDINGS = ${JSON.stringify(STRUCTURE_BINDINGS)};
const IN_FLOW = ${JSON.stringify(IN_FLOW)};
const TEXT_SIZING = ${JSON.stringify(TEXT_SIZING)};
const NEUTRAL = ${JSON.stringify(NEUTRAL)};
const NEUTRAL_TEXT = ${JSON.stringify(NEUTRAL_TEXT)};
const TEXT_CASE_VARIES = ${JSON.stringify(TEXT_CASE_VARIES)};
const MODE_LIMIT = ${FIGMA_MODE_LIMIT};
const LIFT_COMMAND = ${JSON.stringify(LIFT_COMMAND)};
const LIFT_MENU_NAME = ${JSON.stringify(LIFT_MENU_NAME)};

/** The collection of a name, its modes renamed and completed, without duplicating anything. */
async function applyCollections() {
  const existing = await figma.variables.getLocalVariableCollectionsAsync();
  const byName = new Map(existing.map((collection) => [collection.name, collection]));
  const collections = new Map();
  const modeIds = new Map();
  const modeWarnings = [];
  const modeReports = [];
  for (const spec of PLAN.collections) {
    // A collection without variables is not created: in a Modelo with an external Aspekto every
    // token hangs on the aspekto Dimensio (Art. IV completeness), so fundamento can be empty.
    if (spec.variables.length === 0) continue;
    const found = byName.get(spec.name);
    const collection = found ?? figma.variables.createVariableCollection(spec.name);
    collections.set(spec.name, collection);
    const ids = {};
    // Die Grenze vor dem ersten Versuch, mit Zahlen (F27): Jeder Aspekto des Modelo ist ein Modus,
    // und ein Plan, der mehr mitbringt, als die Sammlung tragen kann, ist nicht der Fehler der
    // Datei, sondern der des Abonnements. Der Plan wird deshalb nicht gekürzt.
    if (spec.modes.length > MODE_LIMIT) {
      modeWarnings.push(
        "Sammlung " + spec.name + ": " + spec.modes.length + " Modi geplant, Figma Professional " +
          "erlaubt " + MODE_LIMIT + " je Sammlung (Organization 20, Enterprise unbegrenzt). " +
          (spec.modes.length - MODE_LIMIT) + " mehr, als in eine Professional-Datei passen.",
      );
    }
    const refused = [];
    let refusal = "";
    spec.modes.forEach((mode, index) => {
      const known = collection.modes.find((candidate) => candidate.name === mode);
      if (known !== undefined) {
        ids[mode] = known.modeId;
        return;
      }
      // Only the placeholder mode of a collection this run created is renamed. In a file an older
      // plugin made, the first mode is a real mode with a meaning — renaming it would silently
      // change what every frame that chose it shows (F19).
      const spare = found === undefined ? collection.modes[index] : undefined;
      if (index === 0 && spare !== undefined) {
        collection.renameMode(spare.modeId, mode);
        ids[mode] = spare.modeId;
        return;
      }
      // Figma lehnt einen Modus jenseits der Grenze ab. Der Lauf nimmt die Ablehnung an, statt mit
      // einem rohen Fehler abzubrechen: Was nicht hineinpasst, steht mit Namen im Bericht, und der
      // Rest des Laufs — Variablen, Komponenten — wird fertig (F27).
      try {
        ids[mode] = collection.addMode(mode);
      } catch (error) {
        refused.push(mode);
        refusal = String(error && error.message ? error.message : error);
      }
    });
    if (refused.length > 0) {
      modeWarnings.push(
        "Sammlung " + spec.name + ": " + (spec.modes.length - refused.length) + " von " +
          spec.modes.length + " Modi stehen in der Datei, " + refused.length +
          " hat Figma abgelehnt (" + refused.join(", ") + "): " + refusal,
      );
    }
    modeIds.set(spec.name, ids);
    // The effect, not the call (F19): Figma's default mode is the first mode and cannot be set.
    // A fresh collection gets the Modelo's default first; a file an older plugin made keeps its
    // order, and the run says so.
    const actual = collection.modes.find((mode) => mode.modeId === collection.defaultModeId);
    if (spec.defaultMode !== undefined && actual !== undefined && actual.name !== spec.defaultMode) {
      modeWarnings.push(
        "Sammlung " + spec.name + ": Der Standardmodus ist " + actual.name + ", das Modelo nennt " +
          spec.defaultMode + ". Figma nimmt den ersten Modus als Standard und lässt die " +
          "Reihenfolge nicht ändern; eine frisch angelegte Datei hat ihn richtig.",
      );
    }
    // Rohdaten je Sammlung (F27): geplante Modi, die Modi der Datei nach dem Lauf und der, den
    // Figma als Standard nimmt. Damit ist „aspekto hat zwei Modi" zu messen, ohne die Oberfläche
    // abzulesen.
    modeReports.push({
      collection: spec.name,
      planned: spec.modes.slice(),
      actual: collection.modes.map((mode) => mode.name),
      default: actual === undefined ? "" : actual.name,
    });
  }
  return { collections, modeIds, warnings: modeWarnings, modes: modeReports };
}

async function applyVariables(collections, modeIds) {
  const existing = await figma.variables.getLocalVariablesAsync();
  // By name within its collection: a variable of the same name in another collection is not this
  // one (Sammlung gewechselt) — taken for it, it was given a value for a mode its collection does
  // not have, and Figma refused. A collection id holds no slash, so the key splits cleanly.
  const byKey = new Map(
    existing.map((variable) => [variable.variableCollectionId + "/" + variable.name, variable]),
  );
  const variables = new Map();
  for (const spec of PLAN.collections) {
    const collection = collections.get(spec.name);
    for (const variable of spec.variables) {
      const found =
        byKey.get(collection.id + "/" + variable.name) ??
        figma.variables.createVariable(variable.name, collection, variable.type);
      write(found, "hiddenFromPublishing", variable.hidden === true);
      variables.set(variable.name, found);
    }
  }
  // Values last: an alias needs its target to exist.
  for (const spec of PLAN.collections) {
    const ids = modeIds.get(spec.name);
    for (const variable of spec.variables) {
      const found = variables.get(variable.name);
      for (const [mode, value] of Object.entries(variable.values)) {
        // Ein Modus, den die Datei abgelehnt hat, hat keine Kennung; sein Wert wird nicht
        // geschrieben, und der Lauf läuft weiter (F27).
        if (ids[mode] === undefined) continue;
        const target = value !== null && typeof value === "object" && "alias" in value
          ? figma.variables.createVariableAlias(variables.get(value.alias))
          : value;
        // An alias is compared by the variable it points at; a literal by its value.
        const current = found.valuesByMode === undefined ? undefined : found.valuesByMode[ids[mode]];
        const sameAlias =
          current !== undefined && current !== null && typeof current === "object" &&
          current.type === "VARIABLE_ALIAS" && target !== null && typeof target === "object" &&
          target.type === "VARIABLE_ALIAS" && current.id === target.id;
        if (sameAlias || JSON.stringify(current) === JSON.stringify(target)) continue;
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

/**
 * The section „Fundamento" on the current page (F-2, Nachlese Spec 008/009), found by its mark
 * \`section\` like every node the plugin owns, or undefined. Every set lies in it: one variable mode
 * set on the section switches the brand of the whole library, while the sets themselves stay on
 * „Automatisch" (F35 clears explicit modes on *sets*). The mode of the section is the
 * maintainer's: the plugin never sets one there and never clears one.
 */
function findSection() {
  if (PLAN.section === undefined) return undefined;
  return ours(figma.currentPage, "section", PLAN.section.name);
}

/** The frame „Eroj" in the section (F-8), found by its mark \`frame\`, or undefined. */
function findFrame(section) {
  if (section === undefined) return undefined;
  return ours(section, "frame", PLAN.section.frame);
}

/**
 * The set of an Ero: in the frame, directly in the section, where the runs of F-1 to F-7 left it
 * (gemessen 2026-10-14 in f10b-5), or still directly on the page, where every run before F-2
 * left it (gemessen 2026-10-13 in f10b-5: butono und ligilo lagen beide auf der Seite).
 */
function findSet(name) {
  const section = findSection();
  const frame = findFrame(section);
  for (const parent of [frame, section, figma.currentPage]) {
    if (parent === undefined) continue;
    const set = ours(parent, "ero", name);
    if (set !== undefined) return set;
  }
  return undefined;
}

/**
 * What the run did with section and frame; the headline of the report carries it (F-2, F-8).
 * \`moved\` names every set the run found outside the frame — on the page or directly in the
 * section — and put into it.
 */
const sectionReport =
  PLAN.section === undefined
    ? undefined
    : {
        name: PLAN.section.name,
        found: false,
        created: false,
        moved: [],
        frame: { name: PLAN.section.frame, found: false, created: false, wrap: "WRAP" },
      };

/**
 * The section of this run: found, or created on the current page and stamped (F-2). A new section
 * opens around the first set that still lies on the page — that set keeps the place the
 * maintainer saw it at — or at 0/0 in a file without sets. x and y are written, not left to the
 * tool: where createSection puts a section is not measured.
 */
function openSection() {
  if (PLAN.section === undefined) return undefined;
  let section = findSection();
  sectionReport.found = section !== undefined;
  if (section !== undefined) {
    write(section, "name", PLAN.section.name);
    return section;
  }
  const anchor = PLAN.components
    .map((component) => ours(figma.currentPage, "ero", component.set))
    .filter((set) => set !== undefined)[0];
  section = create(() => figma.createSection());
  stamp(section, "section", PLAN.section.name);
  write(section, "name", PLAN.section.name);
  write(section, "x", anchor === undefined ? 0 : anchor.x - PLAN.section.padding);
  write(section, "y", anchor === undefined ? 0 : anchor.y - PLAN.section.padding);
  sectionReport.created = true;
  return section;
}

/**
 * The frame „Eroj" in the section (F-8, gemessen 2026-10-14 in f10b-5): found, or created at the
 * section's padding and stamped like the section. Nach dem Lauf mit sieben Sets lag elektilo auf
 * ligilo: die Abstände von F-1/F-7 kamen aus den Breiten im Standardmodus, und die Breiten ändern
 * sich je Markenmodus. Auto-layout places the sets from their sizes in whatever mode is on screen
 * — horizontal, wrapping, spacing.xlarge between the sets and between the rows, hugging both
 * ways, no fill — so the plugin computes no place of a set (Regel 0: das Werkzeug kann es). What
 * the plugin owns on the frame is neutral or the plan's, like on every node it draws.
 *
 * WRAP on a frame that hugs its width is not measured yet: Figma may refuse it. Refused is no
 * reason to stop, like a refused font binding (F30): the frame stays one row without wrap, the
 * section report says \`wrap: "refused"\`, and a warning carries Figma's own words.
 */
function openFrame(section, warnings) {
  if (section === undefined) return undefined;
  let frame = findFrame(section);
  sectionReport.frame.found = frame !== undefined;
  if (frame === undefined) {
    frame = create(() => figma.createFrame());
    section.appendChild(frame);
    stamp(frame, "frame", PLAN.section.frame);
    write(frame, "x", PLAN.section.padding);
    write(frame, "y", PLAN.section.padding);
    sectionReport.frame.created = true;
  }
  write(frame, "name", PLAN.section.frame);
  own(frame, NEUTRAL);
  // The width is the maintainer's once the frame exists: a frame that hugs its width has no
  // width to wrap at (one row), the rows of f10b-5 come from a fixed width given by hand, and a
  // run must not take it back to HUG. Hugging is the start of a new frame only.
  Object.assign(gather(frame), {
    layoutMode: "HORIZONTAL",
    itemSpacing: PLAN.section.gap,
    counterAxisSpacing: PLAN.section.gap,
    ...(sectionReport.frame.created ? { layoutSizingHorizontal: "HUG" } : {}),
    layoutSizingVertical: "HUG",
  });
  flush(frame);
  try {
    write(frame, "layoutWrap", "WRAP");
    sectionReport.frame.wrap = "WRAP";
  } catch (error) {
    sectionReport.frame.wrap = "refused";
    warnings.push(
      PLAN.section.name + "/" + PLAN.section.frame + ": Figma hat layoutWrap WRAP am Frame " +
        "abgelehnt — die Sets liegen in einer Reihe ohne Umbruch, Figma legt sie weiter aus. " +
        String(error && error.message ? error.message : error),
    );
  }
  return frame;
}

/**
 * Puts a set into the frame „Eroj" (F-8): a set the run finds in the frame stays where it is in
 * the frame's order; a set the run created, or found on the page or directly in the section, is
 * appended at the end. The set is in the frame's flow (layoutPositioning AUTO), and Figma places
 * it — the plugin writes no x or y. Returns the frame and that the layout places the set.
 */
function placeSet(frame, set, name, created) {
  if (frame === undefined) return undefined;
  if (set.parent !== frame) {
    frame.appendChild(set);
    if (!created) sectionReport.moved.push(name);
  }
  write(set, "layoutPositioning", "AUTO");
  return { frame: PLAN.section.frame, action: "in-layout" };
}

/**
 * The section as large as its content plus the padding on the right and at the bottom (F-2),
 * resized only when it differs, so a second run writes nothing. Its content is the frame „Eroj"
 * (F-8), measured in the mode on screen when the run ends; a section does not hug, so after a
 * brand switch the frame may outgrow it until the next run.
 */
function fitSection(section) {
  if (section === undefined || section.children.length === 0) return;
  let right = 0;
  let bottom = 0;
  for (const child of section.children) {
    right = Math.max(right, child.x + child.width);
    bottom = Math.max(bottom, child.y + child.height);
  }
  const width = right + PLAN.section.padding;
  const height = bottom + PLAN.section.padding;
  if (section.width === width && section.height === height) return;
  section.resizeWithoutConstraints(width, height);
}

/**
 * Written only when the value does not hold yet (F21). Figma refuses some writes on a document
 * that already has the value — setting layoutMode on a grid with occupied cells threw "Cannot
 * delete occupied row/column." on the second run — and a write that changes nothing is noise in
 * the file's history. Compared by JSON, so paints with the same binding count as equal.
 */
function write(node, field, value) {
  // A node this run created is written whole: what the tool gave it is not the plan's (F13), and
  // reading it back to compare would trust the tool's default. A node found from an earlier run is
  // compared first.
  if (!fresh.has(node.id)) {
    let current;
    try {
      current = node[field];
    } catch (error) {
      current = undefined;
    }
    if (samePaints(field, current, value) || sameEffects(field, current, value) ||
      sameJson(current, value)) return false;
  }
  node[field] = value;
  return true;
}

const sameJson = (a, b) => JSON.stringify(a === undefined ? null : a) === JSON.stringify(b);

/**
 * Two paint lists hold the same when every paint has the same variable, deckkraft and visibility
 * (F22). Read back, a paint carries what Figma filled in — visible, blendMode, the colour it
 * resolved — so a comparison by JSON never matched and rewrote every paint on every run; the
 * rewrite is what left the set black.
 */
function samePaints(field, current, value) {
  if (field !== "fills" && field !== "strokes") return false;
  if (!Array.isArray(current) || !Array.isArray(value) || current.length !== value.length) {
    return false;
  }
  return value.every((paint, index) => {
    const held = current[index];
    const variableOf = (entry) =>
      entry && entry.boundVariables && entry.boundVariables.color
        ? entry.boundVariables.color.id
        : undefined;
    const opacityOf = (entry) => (typeof entry.opacity === "number" ? entry.opacity : 1);
    const visibleOf = (entry) => entry.visible !== false;
    return (
      held !== undefined &&
      held.type === paint.type &&
      variableOf(held) === variableOf(paint) &&
      (variableOf(paint) !== undefined || sameJson(held.color, paint.color)) &&
      opacityOf(held) === opacityOf(paint) &&
      visibleOf(held) === visibleOf(paint)
    );
  });
}

/**
 * Two effect lists hold the same when every effect has the same type, the same variable per
 * bound field — or the same value where none is bound — and the same visibility (Spec 011 ②, the
 * shadow of a dialog's surface). Read back, an effect carries what Figma filled in, like a paint
 * (F22), so a comparison by JSON would rewrite it on every run. An assumption until measured.
 */
function sameEffects(field, current, value) {
  if (field !== "effects") return false;
  if (!Array.isArray(current) || !Array.isArray(value) || current.length !== value.length) {
    return false;
  }
  const boundOf = (entry, name) =>
    entry && entry.boundVariables && entry.boundVariables[name]
      ? entry.boundVariables[name].id
      : undefined;
  return value.every((effect, index) => {
    const held = current[index];
    if (held === undefined || held.type !== effect.type) return false;
    if ((held.visible !== false) !== (effect.visible !== false)) return false;
    for (const name of ["color", "offsetX", "offsetY", "radius", "spread"]) {
      const bound = boundOf(effect, name);
      if (bound !== boundOf(held, name)) return false;
      if (bound !== undefined) continue;
      const read = (entry) =>
        name === "offsetX" ? (entry.offset || {}).x
          : name === "offsetY" ? (entry.offset || {}).y
            : entry[name];
      if (!sameJson(read(held), read(effect))) return false;
    }
    return true;
  });
}

/** The IDs of the nodes this run created; everything else was found in the file. */
const fresh = new Set();

function create(make) {
  const node = make();
  fresh.add(node.id);
  return node;
}

/** Plugin data, written only when it changes. */
function stamp(node, key, value) {
  if (node.getSharedPluginData(NAMESPACE, key) === value) return;
  node.setSharedPluginData(NAMESPACE, key, value);
}

/**
 * The values a node is going to get, gathered first and written once (F21): "neutral first, then
 * the plan" as two writes would set a found node's fill to [] and back to its paint on every run.
 * Insertion order is kept, so layoutMode still precedes the paddings that need it.
 */
const pending = new Map();
function gather(node) {
  let values = pending.get(node.id);
  if (values === undefined) {
    values = {};
    pending.set(node.id, values);
  }
  return values;
}

/** Notes the owned properties as neutral or as the plan says; lists start empty (F13). */
function own(node, values) {
  const target = gather(node);
  for (const [field, value] of Object.entries(values)) {
    target[field] = Array.isArray(value) ? [] : value;
  }
}

/** Writes what was gathered for a node, each property once, only where it does not hold yet. */
function flush(node) {
  const values = pending.get(node.id);
  if (values === undefined) return;
  pending.delete(node.id);
  for (const [field, value] of Object.entries(values)) write(node, field, value);
}

/** The ID of the variable a field is bound to, in the form the tool holds it. */
function boundId(node, field) {
  const bound = node.boundVariables === undefined ? undefined : node.boundVariables[field];
  if (bound === undefined || bound === null) return undefined;
  return typeof bound === "object" ? bound.id : bound;
}

/**
 * The nodes a binding names (Spec 011 ④): one, or — where the name holds a \`*\`, a number — every
 * node of the pass whose name matches: the cells of a table (\`cell-*-*\`), the terms of a list.
 */
function namedBy(nodes, name) {
  if (name.indexOf("*") === -1) return [name];
  const pattern = new RegExp("^" + name.split("*").join("[0-9]+") + "$");
  return Object.keys(nodes).filter((candidate) => pattern.test(candidate));
}

/** The prefixes a weight variable and its STRING twin of cuts are named with (F30). */
const WEIGHT_PREFIX = "font/weight/";
const STYLE_PREFIX = "font/style/";

/** The part a binding key names: \`items\` of \`items.weight\`. */
const partOfKey = (key) => key.slice(0, key.indexOf("."));

/**
 * Where a part property binds. A weight of a text (Spec 014 ①, plan ① D-01) has no place of its
 * own: it binds the cut of the nodes the part's role binds — the fontStyle targets of its
 * typography —, and there the role's own cut gives way to it (see bind).
 */
function targetsOf(part, moved) {
  if (part.endsWith(".weight")) {
    const role = partOfKey(part) + ".typography";
    return (moved[role] || BINDINGS[role] || []).filter((target) => target.fields.indexOf("fontStyle") !== -1);
  }
  return moved[part] || BINDINGS[part] || [];
}

/**
 * The variable a binding takes: the token's, with the field of a composite. A weight binds the
 * cut, so it takes the STRING twin of its weight variable — font/weight/semibold binds
 * font/style/semibold, whose cut follows the mode as the weight does (Spec 014 ①, F30).
 */
function variableOfBinding(variables, part, name, target) {
  if (!part.endsWith(".weight")) return variables.get(name + (target.suffix || ""));
  if (name.indexOf(WEIGHT_PREFIX) !== 0) return undefined;
  return variables.get(STYLE_PREFIX + name.slice(WEIGHT_PREFIX.length));
}

function bind(nodes, variant, variables, structure) {
  const deferred = [];
  const moved = STRUCTURE_BINDINGS[structure] || {};
  for (const [part, name] of Object.entries(variant.bindings)) {
    // A part whose weight is bound takes its cut from the weight, not from its role (Spec 014 ①):
    // the current item of a navigation in the semibold cut, in the family of its role.
    const weighted =
      !part.endsWith(".weight") && variant.bindings[partOfKey(part) + ".weight"] !== undefined;
    for (const target of targetsOf(part, moved)) {
      if (weighted && target.fields.indexOf("fontStyle") !== -1) continue;
      const variable = variableOfBinding(variables, part, name, target);
      if (variable === undefined) continue;
      for (const key of namedBy(nodes, target.node)) {
        const node = nodes[key];
        // A choice binds a variant in passes, the group and each option (Spec 010 ③, D-07): a
        // part whose node is not in this pass is bound in another.
        if (node === undefined) continue;
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
          for (const field of target.fields) gather(node)[field] = [bound];
        } else {
          // A measure is bound after the frame's layout is written: padding, gap and minimum
          // sizes only take effect on an auto-layout frame, and the tool refuses them before (F11).
          for (const field of target.fields) {
            deferred.push({ node, field, variable, font: target.font === true });
          }
        }
      }
    }
  }
  return deferred;
}

/** The channels of a six-digit hex colour, as Figma holds them (0 to 1). */
function rgbOf(hex) {
  const number = parseInt(hex.slice(1), 16);
  return { r: ((number >> 16) & 255) / 255, g: ((number >> 8) & 255) / 255, b: (number & 255) / 255 };
}

/**
 * The drop shadows of a part from the plan's layers (Spec 011 ②, F9): one DROP_SHADOW effect per
 * layer, each field bound to its variable where the API binds effects (setBoundVariableForEffect;
 * Vojmapo: the shadow variables bound to no effect until an Ero asks for elevation), and written
 * with the values of the base combination where it does not — then the shadow does not follow
 * the mode, and the report says so. The effect is written whole, so a read-back compares (F22).
 */
function shadowEffects(shadow, variables) {
  const bindable = "setBoundVariableForEffect" in figma.variables;
  const effects = shadow.layers.map((layer) => {
    const rgb = rgbOf(layer.color.hex);
    let effect = {
      type: "DROP_SHADOW",
      color: { r: rgb.r, g: rgb.g, b: rgb.b, a: layer.alpha },
      offset: { x: layer.offsetX, y: layer.offsetY },
      radius: layer.blur,
      spread: layer.spread,
      visible: true,
      blendMode: "NORMAL",
      showShadowBehindNode: false,
    };
    if (!bindable) return effect;
    const fields = [
      ["color", layer.fields.color],
      ["offsetX", layer.fields.offsetX],
      ["offsetY", layer.fields.offsetY],
      ["radius", layer.fields.blur],
      ["spread", layer.fields.spread],
    ];
    for (const [field, name] of fields) {
      const variable = variables.get(name);
      if (variable !== undefined) {
        effect = figma.variables.setBoundVariableForEffect(effect, field, variable);
      }
    }
    return effect;
  });
  return {
    effects: effects,
    report: {
      part: shadow.part,
      variable: shadow.variable,
      layers: shadow.layers.length,
      status: bindable ? "bound" : "written",
      evidence: bindable
        ? "setBoundVariableForEffect bound colour, offset, blur and spread of every layer of " +
          shadow.variable + " to a DROP_SHADOW effect of the " + shadow.part + "; the shadow " +
          "follows the mode."
        : "figma.variables.setBoundVariableForEffect is not available in this API: the " +
          shadow.layers.length + " layer(s) of " + shadow.variable + " are written as DROP_SHADOW " +
          "effects of the " + shadow.part + " with the values of the base combination, bound to " +
          "no variable — the shadow does not follow the mode.",
    },
  };
}

/**
 * The vector of a check mark in its frame (Spec 010 ②, D-09): found by its mark; on a frame the
 * run imported from the sign, the vector the import made, marked from now on.
 */
function markOf(indicator) {
  let found = ours(indicator, "part", "mark");
  if (found === undefined) {
    found = indicator.children.filter((child) => child.type === "VECTOR")[0];
    if (found === undefined) return undefined;
    // Made by this run with its frame: written whole, like every node the run creates (F13).
    fresh.add(found.id);
    found.setSharedPluginData(NAMESPACE, "part", "mark");
  }
  write(found, "name", "mark");
  return found;
}

/**
 * The neutral of a stroked sign (Spec 011 ③: the arc of a state): no fill, no effect, scaling
 * with its frame like the check mark; its stroke is bound to the indicator's colour, and its
 * weight is the sign's own — read from the SVG the plan carries (stroke-width), the one shape of
 * both pictures — so that nothing the import gave the vector stays unowned (F13).
 */
function arcNeutral(sign) {
  const width = /stroke-width="([0-9.]+)"/.exec(sign || "");
  return {
    fills: [],
    strokes: [],
    strokeWeight: width === null ? 0 : Number(width[1]),
    effects: [],
    opacity: 1,
    constraints: { horizontal: "SCALE", vertical: "SCALE" },
  };
}

/** The child of parent marked as the part, created when missing. */
function part(parent, name, make) {
  let found = ours(parent, "part", name);
  if (found === undefined) {
    found = create(make);
    found.setSharedPluginData(NAMESPACE, "part", name);
    parent.appendChild(found);
  }
  write(found, "name", name);
  return found;
}

/**
 * The smallest size the tool gives a node: resize refuses less (F-4, Spec 011 ③ acceptance).
 */
const SMALLEST_SIZE = 0.01;

/**
 * An empty placeholder made as small as the tool allows (F-4 of the acceptance of Spec 011 ③,
 * measured 2026-10-16): an auto-layout frame without children keeps its size, hug or not — the
 * actions placeholder of the notice stood at the 100 × 100 createFrame gave it, and the hugging
 * column took the empty space in below the texts. Called before the frame's layout is written:
 * resizing a frame that hugs fixes its axes, and the layout that follows lets it hug again, so the
 * placeholder adds nothing until a designer drops a butono into it, and then hugs the butono.
 * A frame that holds something, or is this small already, is left alone (a second run writes
 * nothing).
 */
function shrinkEmpty(frame) {
  if (frame.children.length > 0) return;
  if (frame.width <= SMALLEST_SIZE && frame.height <= SMALLEST_SIZE) return;
  frame.resize(SMALLEST_SIZE, SMALLEST_SIZE);
}

/**
 * A frame brought to a measured size (Spec 011 ④ acceptance, F-3): resized only where it does
 * not hold the size yet (F21: a second run writes nothing), never below the tool's smallest.
 * resize fixes an axis that hugged (③ F-4), so the sizing the frame owns is written again after
 * it — hug stays hug, fill stays fill, only the fixed axis keeps the number.
 */
function fit(frame, width, height, layout) {
  const w = Math.max(width, SMALLEST_SIZE);
  const h = Math.max(height, SMALLEST_SIZE);
  if (frame.width === w && frame.height === h) return false;
  frame.resize(w, h);
  write(frame, "layoutSizingHorizontal", layout.layoutSizingHorizontal);
  write(frame, "layoutSizingVertical", layout.layoutSizingVertical);
  return true;
}

/**
 * The number a variable shows for a node — the mode the node stands in decides, aliases followed
 * (resolveForConsumer, as the report reads a paint's colour) — or undefined where the tool has no
 * such method or the value is no number.
 */
function resolvedNumber(variable, node) {
  if (variable === undefined || typeof variable.resolveForConsumer !== "function") return undefined;
  let resolved;
  try {
    resolved = variable.resolveForConsumer(node);
  } catch (error) {
    return undefined;
  }
  return resolved !== undefined && typeof resolved.value === "number" ? resolved.value : undefined;
}

function variantName(props) {
  return Object.entries(props)
    .map(([key, value]) => key + "=" + value)
    .join(", ");
}

const mark = (child) => child.getSharedPluginData(NAMESPACE, "variant");

/** How a set stands before the run changes anything: children, marked, and the unmarked by name. */
function foundState(set) {
  return set === undefined
    ? { children: 0, marked: 0, unmarked: [] }
    : {
        children: set.children.length,
        marked: set.children.filter((child) => mark(child) !== "").length,
        unmarked: set.children.filter((child) => mark(child) === "").map((child) => child.name),
      };
}

/** The state the previous run left at the set (F10b), or null. */
function leftState(set) {
  const stored = set === undefined ? "" : set.getSharedPluginData(NAMESPACE, "after");
  return stored === "" ? null : JSON.parse(stored);
}

/**
 * Was ein Lauf in einem vorgefundenen Set anlegen würde, gelesen bevor irgendetwas geschrieben ist
 * (F10c). Dieselbe Suche wie der Lauf selbst (\`ours\`), also genau die Varianten, die er anlegen
 * würde. Je Variante steht dabei, ob ein Kind ihres Namens da ist: dann fehlt nur die Markierung,
 * sonst fehlt der Knoten. Das Set selbst ist über seine Markierung \`ero\` gefunden.
 */
function creationsInFoundSets() {
  const blocked = [];
  for (const component of PLAN.components) {
    const set = findSet(component.set);
    if (set === undefined) continue;
    const wouldCreate = [];
    for (const variant of component.variants) {
      const name = variantName(variant.props);
      if (ours(set, "variant", name) !== undefined) continue;
      const node = set.children.some((child) => child.name === name);
      wouldCreate.push({ name: name, props: variant.props, node: node });
    }
    if (wouldCreate.length === 0) continue;
    blocked.push({
      set: component.set,
      before: foundState(set),
      left: leftState(set),
      wouldCreate: wouldCreate,
    });
  }
  return blocked;
}

/** The set and every node below it, outside in. */
function nodesOf(set) {
  const out = [];
  const walk = (node) => {
    out.push(node);
    for (const child of node.children || []) walk(child);
  };
  walk(set);
  return out;
}

/**
 * Jeder Knoten jedes vorgefundenen Sets, aufgenommen beim Start des Laufs, vor dem ersten Schreiben
 * (F10d). Das Plugin entfernt nie etwas; fehlt am Ende ein Knoten, dann hat Figma ihn entfernt oder
 * verdrängt — und der Lauf nennt ihn mit seiner ID.
 */
const seenAtStart = new Map();
function recordStart() {
  for (const component of PLAN.components) {
    const set = findSet(component.set);
    if (set === undefined) continue;
    seenAtStart.set(component.set, { set: set, nodes: nodesOf(set) });
  }
}

/** The sets this run created; a set that was not there at the start is counted on this object. */
const madeThisRun = new Map();

/**
 * Knoten des Sets am Ende, gezählt am selben Objekt wie beim Start (F10d) — nicht über eine neue
 * Suche: Verlöre das Set seine Markierung, stünde sonst \`end: 0\` neben \`lost: []\`.
 */
function nodesAtEnd(name) {
  const seen = seenAtStart.get(name);
  const set = seen !== undefined ? seen.set : madeThisRun.get(name);
  if (set === undefined || set.removed === true) return 0;
  return nodesOf(set).length;
}

/** Was beim Start im Set war und am Ende nicht mehr, je Knoten: entfernt oder wohin verdrängt. */
function lostSince(name) {
  const seen = seenAtStart.get(name);
  if (seen === undefined) return [];
  const now = new Set(seen.set.removed === true ? [] : nodesOf(seen.set).map((node) => node.id));
  return seen.nodes
    .filter((node) => !now.has(node.id))
    .map((node) => {
      let parent = null;
      if (node.removed !== true) {
        try {
          parent = node.parent || null;
        } catch (error) {
          parent = null;
        }
      }
      return {
        id: node.id,
        name: node.name,
        type: node.type,
        removed: parent === null,
        parent: parent === null ? null : { id: parent.id, type: parent.type, name: parent.name },
      };
    });
}

/**
 * Markierte Komponenten außerhalb ihres Sets (F-B), gesucht vor dem ersten Schreiben. Ein
 * abgestürzter Lauf hinterlässt die Variante, die er gerade anlegte, lose auf der Seite — markiert
 * mit \`variant\` und \`ero\`. Der nächste Lauf sucht seine Varianten nur im Set, fände sie nicht und
 * legte sie neu an. Gefunden wird jede Komponente mit beiden Markierungen, deren Eltern kein Set
 * mit derselben \`ero\`-Markierung ist; übernommen oder gelöscht wird keine.
 */
function orphansOnPage() {
  const names = PLAN.components.map((component) => component.set);
  const orphans = [];
  const walk = (node) => {
    for (const child of node.children || []) {
      const ero = child.getSharedPluginData(NAMESPACE, "ero");
      if (child.type === "COMPONENT" && names.indexOf(ero) !== -1 && mark(child) !== "") {
        const parent = child.parent;
        const inSet =
          parent.type === "COMPONENT_SET" && parent.getSharedPluginData(NAMESPACE, "ero") === ero;
        if (!inSet) {
          orphans.push({
            id: child.id,
            name: child.name,
            set: ero,
            parent: { id: parent.id, type: parent.type },
          });
        }
      }
      walk(child);
    }
  };
  walk(figma.currentPage);
  return orphans;
}

/** The abort of F-B: the orphans with ID and name; the maintainer decides, not the run. */
function orphanError(orphans) {
  const error = new Error(
    "Abbruch vor dem ersten Schreiben, nichts wurde geändert (F-B). " + orphans.length +
      " markierte Komponente(n) außerhalb ihres Sets: " +
      orphans
        .map((orphan) =>
          orphan.id + " „" + orphan.name + "“ (" + orphan.set + ", liegt in " + orphan.parent.type +
          " " + orphan.parent.id + ")",
        )
        .join("; ") +
      ". Ein Lauf fände sie nicht und legte dieselbe Variante erneut an. Das Plugin übernimmt und " +
      "löscht sie nicht still: bitte von Hand löschen oder klären, dann erneut ausführen.",
  );
  error.abort = { orphans: orphans };
  return error;
}

/**
 * Jede geplante Variable, die die Datei in einer anderen Sammlung hält, als der Plan sie legt
 * (Sammlung gewechselt), gelesen vor dem ersten Schreiben. Gemessen 2026-10-09 in f10b-2: Der
 * Ein-Marken-Plan hatte 364 Variablen in fundamento angelegt, der Zwei-Marken-Plan legt sie in
 * aspekto und lässt fundamento leer. Am Namen gefunden, bekam jede einen Wert für einen Modus,
 * den ihre Sammlung nicht hat, und Figma lehnte ab („in setValueForMode: mode with id 2:1 not
 * defined for variable"). Die Plugin-API kann eine Variable nicht verschieben —
 * variableCollectionId ist nur lesbar (plugin-api.d.ts 1.138.0), und weder Variable noch
 * VariableCollection noch VariablesAPI haben einen Aufruf dafür. Löschen und Neuanlegen gäbe ihr
 * eine neue Id: Jede Bindung an einen Knoten und jeder Alias einer anderen Variable verlöre sein
 * Ziel. Also bricht der Lauf ab wie F10c und nennt jede. Daneben jede Sammlung des Plans, die in
 * der Datei ohne Variable steht: Sie bleibt stehen, der Lauf meldet sie nur (Maintainer,
 * 2026-10-11: eine leere Sammlung fundamento ist in Ordnung).
 */
async function readCollections() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync();
  const nameOf = new Map(collections.map((collection) => [collection.id, collection.name]));
  // Where the file holds each name: a name may stand in more than one collection.
  const held = new Map();
  for (const variable of variables) {
    const list = held.get(variable.name) || [];
    list.push(nameOf.get(variable.variableCollectionId) || variable.variableCollectionId);
    held.set(variable.name, list);
  }
  const switched = [];
  for (const spec of PLAN.collections) {
    for (const variable of spec.variables) {
      const where = held.get(variable.name);
      if (where === undefined || where.indexOf(spec.name) !== -1) continue;
      for (const from of where) switched.push({ name: variable.name, from: from, to: spec.name });
    }
  }
  const occupied = new Set(variables.map((variable) => variable.variableCollectionId));
  const planned = new Set(PLAN.collections.map((spec) => spec.name));
  const empty = collections
    .filter((collection) => planned.has(collection.name) && !occupied.has(collection.id))
    .map((collection) => collection.name);
  return { switched: switched, empty: empty };
}

/**
 * The abort for a switched collection: one sentence per pair of collections with its count and
 * first names, the whole list at \`error.abort.switched\` and in the console (F22: a line stays
 * under the limit, 364 names do not).
 */
function switchError(switched) {
  const pairs = new Map();
  for (const entry of switched) {
    const key = entry.from + " → " + entry.to;
    const list = pairs.get(key) || [];
    list.push(entry.name);
    pairs.set(key, list);
  }
  const sentences = [...pairs.entries()].map(
    ([pair, names]) =>
      pair + ": " + names.length + " Variable(n), z. B. " + names.slice(0, 3).join("; ") +
      (names.length > 3 ? " …" : ""),
  );
  const error = new Error(
    "Abbruch vor dem ersten Schreiben, nichts wurde geändert (Sammlung gewechselt). " +
      switched.length + " Variable(n) liegen in der Datei in einer anderen Sammlung, als der Plan " +
      "sie legt: " + sentences.join(" | ") + ". Die Plugin-API kann eine Variable nicht in eine " +
      "andere Sammlung verschieben (variableCollectionId ist nur lesbar); löschte und legte der " +
      "Lauf sie neu an, verlören Knoten ihre Bindungen und Aliasse ihr Ziel. Bitte in Figma " +
      "verschieben oder klären, dann erneut ausführen. Die vollständige Liste steht in der Konsole.",
  );
  error.abort = { switched: switched };
  return error;
}

/** The abort of F10c: one sentence per set, the details whole at \`error.abort\`. */
function abortError(blocked) {
  const sentences = blocked.map((entry) => {
    const before = entry.before;
    const left = entry.left;
    return entry.set + ": Das Set war vorgefunden (" + before.children + " Kinder, davon " +
      before.marked + " markiert" +
      (before.unmarked.length === 0 ? "" : ", ohne Markierung: " + before.unmarked.join("; ")) +
      "; Endstand des vorigen Laufs: " +
      (left === null ? "keiner" : left.children + " Kinder, " + left.marked + " markiert") +
      "). Dieser Lauf hätte " + entry.wouldCreate.length + " Variante(n) neu angelegt: " +
      entry.wouldCreate
        .map((variant) =>
          variant.name + " (Knoten dieses Namens " +
          (variant.node ? "vorhanden, ohne Markierung" : "fehlt") + ")",
        )
        .join("; ") +
      ".";
  });
  const error = new Error(
    "Abbruch vor dem ersten Schreiben, nichts wurde geändert (F10c). " + sentences.join(" | ") +
      " Wer bewusst weitermachen will: Menübefehl „" + LIFT_MENU_NAME + "“.",
  );
  error.abort = { sets: blocked };
  return error;
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
 * Loads the model's font, and when the file does not have it, the nearest thing it does have —
 * in this order: every family of the token's stack the plan names (W3, F-2: families, the
 * generic CSS names already left out), each in the model's cut and then in Regular, then the
 * named fallback family in the model's cut, then that family's Regular. The family goes before
 * the cut on purpose (F32): a brand is recognised by its typeface long before its weight, so
 * Archivo Regular says more about the model than Inter Black does. Whatever is returned is what
 * the label really carries; the caller reports that, not what was asked for. A later family of
 * the stack is no fallback — the token itself names it, as a browser would take it — so only the
 * cut or the fallback family is worth a warning, and the warning names what was tried.
 */
async function loadFont(font, warnings) {
  const families =
    Array.isArray(font.families) && font.families.length > 0 ? font.families : [font.family];
  const ladder = [];
  for (const family of families) {
    ladder.push({ family: family, style: font.style });
    if (font.style !== "Regular") ladder.push({ family: family, style: "Regular" });
  }
  ladder.push({ family: PLAN.fontFallback, style: font.style });
  ladder.push({ family: PLAN.fontFallback, style: "Regular" });
  let applied;
  let last;
  for (const candidate of ladder) {
    if (applied !== undefined) continue;
    try {
      await figma.loadFontAsync(candidate);
      applied = candidate;
    } catch (error) {
      // The next rung; the last one is Inter Regular, which every Figma file has.
      last = error;
    }
  }
  // Not even Inter Regular: this file cannot draw a label at all, and a run that carried on would
  // fail later at a place that says nothing about the cause.
  if (applied === undefined) throw last;
  if (families.indexOf(applied.family) === -1 || applied.style !== font.style) {
    const tried = families.length > 1 ? " (versucht: " + families.join(", ") + ")" : "";
    warnings.push(
      "Schrift " + font.family + " " + font.style + " ist in dieser Datei nicht verfügbar" + tried +
        "; die Beschriftung steht ersatzweise in " + applied.family + " " + applied.style + ".",
    );
  }
  return applied;
}

/** The fonts a text carried when the run first touched it, loaded once per run (F-A). */
const currentFonts = new Set();

/**
 * Loads the font a text carries now and waits for it, before anything is written to it (F-A) —
 * the canonical order, not only for the font of the plan. A text in several fonts carries
 * figma.mixed, a symbol; then every font of its characters is loaded.
 */
async function loadCurrentFont(text) {
  const held = text.fontName;
  const list =
    typeof held === "symbol" ? text.getRangeAllFontNames(0, text.characters.length) : [held];
  for (const font of list) {
    const key = font.family + " " + font.style;
    if (currentFonts.has(key)) continue;
    try {
      await figma.loadFontAsync({ family: font.family, style: font.style });
    } catch (error) {
      throw new Error(
        "Die Schrift „" + key + "“, die die Beschriftung " + text.id + " trägt, lässt sich nicht " +
          "laden; ohne sie nimmt Figma kein Schreiben an. " +
          String(error && error.message ? error.message : error),
      );
    }
    currentFonts.add(key);
  }
}

async function applyComponents(variables, warnings) {
  const fonts = new Map();
  const casesVarying = [];
  /**
   * Binds the measures of a variant after every frame has its layout (F11); a font binding Figma
   * refuses is no reason to stop (F30): the text keeps the written font, the run says which.
   */
  function bindMeasures(measures, report, component, variant) {
    for (const { node: target, field, variable, font } of measures) {
      if (boundId(target, field) === variable.id) continue;
      if (font !== true) {
        target.setBoundVariable(field, variable);
        continue;
      }
      try {
        target.setBoundVariable(field, variable);
        // The label's role follows the size, so a set binds more than one role per field; the
        // report names every one of them, sorted, not the last one that happened to run.
        const list = report.fonts.bound[field] || (report.fonts.bound[field] = []);
        if (list.indexOf(variable.name) === -1) list.push(variable.name);
      } catch (error) {
        const message = String(error && error.message ? error.message : error);
        if (report.fonts.refused.indexOf(field) === -1) {
          report.fonts.refused.push(field);
          warnings.push(
            component.set + ": Figma hat die Bindung von " + field + " an " + variable.name +
              " abgelehnt — die Beschriftung bleibt in " +
              (variant.font ? variant.font.family + " " + variant.font.style : "der Schrift der Datei") +
              ", gleich welcher Modus gewählt ist. " + message,
          );
        }
      }
    }
  }
  /**
   * A radio group (Spec 010 ③, D-07): the variant is a column — the label (the question), the
   * options, help, error — and every option a row: ring → gap → circle (control) with the dot
   * (indicator, the web's vector) in it, the option's label beside it. The group is bound once,
   * every option with the entry of the variant for its value of the key (E7): the chosen one
   * filled with its dot, the others with the ground and the dot at opacity 0. The focus ring shows
   * on the first option only, in the focus variant.
   */
  async function drawChoice(node, component, variant, report, labels) {
    const field = part(node, "field", () => figma.createFrame());
    const label = part(field, "label", () => figma.createText());
    const list = part(field, "options", () => figma.createFrame());
    const texts = component.texts || {};
    const help = typeof texts.help === "string" ? part(field, "help", () => figma.createText()) : undefined;
    const error = typeof texts.error === "string" ? part(field, "error", () => figma.createText()) : undefined;
    const order = [label, list, help, error].filter((each) => each !== undefined);
    order.forEach((child, index) => {
      if (field.children.indexOf(child) !== index) field.insertChild(index, child);
    });
    const entry = component.entry || { key: "", texts: [], selected: -1 };
    const rows = entry.texts.map((word, index) => {
      const row = part(list, "option-" + (index + 1), () => figma.createFrame());
      if (list.children.indexOf(row) !== index) list.insertChild(index, row);
      const ring = part(row, "focus-ring", () => figma.createFrame());
      const gap = part(ring, "focus-gap", () => figma.createFrame());
      const control = part(gap, "control", () => figma.createFrame());
      const indicator = part(control, "indicator", () =>
        typeof component.sign === "string" ? figma.createNodeFromSvg(component.sign) : figma.createFrame(),
      );
      const mark = typeof component.sign === "string" ? markOf(indicator) : undefined;
      const text = part(row, "option-label", () => figma.createText());
      if (row.children.indexOf(text) !== 1) row.insertChild(1, text);
      return { row, ring, gap, control, indicator, mark, text, word, chosen: index === entry.selected };
    });
    const all = [label, help, error].concat(rows.map((each) => each.text)).filter((each) => each !== undefined);
    for (const each of all) await loadCurrentFont(each);
    if (variant.textCase === TEXT_CASE_VARIES) {
      if (casesVarying.indexOf(component.set) === -1) {
        casesVarying.push(component.set);
        warnings.push(
          component.set + ": Die Schreibweise der Beschriftung ist nicht in allen Modi " +
            "dieselbe. textCase ist in Figma kein bindbares Feld, also bleibt sie ungesetzt — " +
            "eine Marke auszuwählen wäre keine Projektion.",
        );
      }
    } else if (typeof variant.textCase === "string") {
      write(label, "textCase", variant.textCase);
    }
    if (variant.font !== undefined) {
      for (const each of all) write(each, "fontName", fonts.get(variant.font.family + " " + variant.font.style));
    }
    if (help !== undefined) write(help, "characters", texts.help);
    if (error !== undefined) write(error, "characters", texts.error);
    for (const each of rows) write(each.text, "characters", each.word);
    labels.push(label);
    const frames = [node, field, list].concat(
      ...rows.map((each) => [each.row, each.ring, each.gap, each.control, each.indicator]),
    );
    for (const frame of frames) own(frame, NEUTRAL);
    for (const each of all) own(each, NEUTRAL_TEXT);
    own(node, HUG_LAYOUT);
    own(field, FIELD_LAYOUT);
    own(list, FIELD_LAYOUT);
    const measures = bind({ label, field, options: list, help, error }, variant, variables, component.structure);
    for (const each of rows) {
      own(each.row, TOGGLE_LAYOUT);
      for (const frame of [each.ring, each.gap]) own(frame, HUG_LAYOUT);
      own(each.control, CONTROL_LAYOUT);
      // The circle is the dot's box plus its border, as on the web (box-sizing border-box).
      own(each.control, { strokesIncludedInLayout: true });
      own(each.indicator, INDICATOR_LAYOUT);
      const values = (variant.entries || {})[each.chosen ? "true" : "false"] || { bindings: {} };
      // The dot of an option not chosen keeps its place and is not seen (indicator.color none).
      own(each.indicator, { opacity: (values.hidden || []).indexOf("indicator") === -1 ? 1 : 0 });
      if (each.mark) own(each.mark, MARK_NEUTRAL);
      const option = {
        bindings: Object.assign({}, variant.bindings, values.bindings),
        paints: Object.assign({}, variant.paints, values.paints),
        focusVisible: variant.focusVisible === true && each === rows[0],
      };
      const nodes = {
        option: each.row,
        "focus-ring": each.ring,
        "focus-gap": each.gap,
        control: each.control,
        indicator: each.indicator,
        "option-label": each.text,
      };
      if (each.mark) nodes.mark = each.mark;
      for (const measure of bind(nodes, option, variables, component.structure)) measures.push(measure);
      for (const part of ["focus-ring", "focus-gap"]) {
        const variable = variables.get((variant.radii || {})[part]);
        const target = part === "focus-ring" ? each.ring : each.gap;
        if (variable !== undefined) measures.push({ node: target, field: "cornerRadius", variable: variable });
      }
    }
    const owned = frames.concat(all);
    for (const child of owned) own(child, IN_FLOW);
    for (const each of all) own(each, TEXT_SIZING);
    for (const each of owned.concat(rows.map((row) => row.mark).filter((mark) => mark !== undefined))) flush(each);
    bindMeasures(measures, report, component, variant);
  }
  /**
   * A dialog (Spec 011 ②): the variant holds the surface — a column of a width bound by size —
   * with the heading (the label property), the message, the content (the reason's label and a
   * field frame standing in for the composed tekstareo, its height bound by reason; hidden where
   * the variant asks no reason) and the row of actions with two stand-ins, a word each. No focus
   * ring: the dialog has one state, its states lie with the composed butono and tekstareo. The
   * same drawing on the example frame „mit Hintergrund" (\`example\` given): then the node is the
   * backdrop, its fill bound to color.backdrop, the surface at the padding of the section's gap,
   * and the heading carries the word itself — a text outside a component has no property.
   */
  async function drawDialog(node, component, variant, report, labels, example) {
    const texts = component.texts || {};
    const surface = part(node, "surface", () => figma.createFrame());
    const heading = part(surface, "heading", () => figma.createText());
    const message = part(surface, "message", () => figma.createText());
    const content = part(surface, "content", () => figma.createFrame());
    const reasonLabel = part(content, "reason-label", () => figma.createText());
    const reasonField = part(content, "reason-field", () => figma.createFrame());
    const actions = part(surface, "actions", () => figma.createFrame());
    const actionKeys = Object.keys(texts).filter((key) => /^action-[0-9]+$/.test(key)).sort();
    const stands = actionKeys.map((key) => {
      const frame = part(actions, key, () => figma.createFrame());
      const text = part(frame, "action-label", () => figma.createText());
      return { key, frame, text };
    });
    [heading, message, content, actions].forEach((child, index) => {
      if (surface.children.indexOf(child) !== index) surface.insertChild(index, child);
    });
    [reasonLabel, reasonField].forEach((child, index) => {
      if (content.children.indexOf(child) !== index) content.insertChild(index, child);
    });
    stands.forEach((each, index) => {
      if (actions.children.indexOf(each.frame) !== index) actions.insertChild(index, each.frame);
    });
    const all = [heading, message, reasonLabel].concat(stands.map((each) => each.text));
    for (const each of all) await loadCurrentFont(each);
    if (variant.textCase === TEXT_CASE_VARIES) {
      if (casesVarying.indexOf(component.set) === -1) {
        casesVarying.push(component.set);
        warnings.push(
          component.set + ": Die Schreibweise der Beschriftung ist nicht in allen Modi " +
            "dieselbe. textCase ist in Figma kein bindbares Feld, also bleibt sie ungesetzt — " +
            "eine Marke auszuwählen wäre keine Projektion.",
        );
      }
    } else if (typeof variant.textCase === "string") {
      write(heading, "textCase", variant.textCase);
    }
    if (variant.font !== undefined) {
      for (const each of all) write(each, "fontName", fonts.get(variant.font.family + " " + variant.font.style));
    }
    if (typeof texts.message === "string") write(message, "characters", texts.message);
    if (typeof texts.reason === "string") write(reasonLabel, "characters", texts.reason);
    for (const each of stands) write(each.text, "characters", texts[each.key]);
    if (example === undefined) labels.push(heading);
    else if (component.label !== undefined) write(heading, "characters", component.label.defaultValue);
    const frames = [node, surface, content, reasonField, actions].concat(stands.map((each) => each.frame));
    for (const frame of frames) own(frame, NEUTRAL);
    for (const each of all) own(each, NEUTRAL_TEXT);
    own(node, HUG_LAYOUT);
    if (example !== undefined) {
      own(node, {
        paddingLeft: example.padding,
        paddingRight: example.padding,
        paddingTop: example.padding,
        paddingBottom: example.padding,
      });
    }
    own(surface, SURFACE_LAYOUT);
    own(content, CONTENT_LAYOUT);
    // The reason field is hidden where the variant asks no reason (reason.height none): a hidden
    // child of an auto-layout frame takes no space, so no gap remains (an assumption of the
    // double until measured in f10b-5; Figma documents it so).
    own(content, { visible: (variant.hidden || []).indexOf("reason") === -1 });
    own(reasonField, REASON_FIELD_LAYOUT);
    own(actions, ACTIONS_LAYOUT);
    for (const each of stands) own(each.frame, CONTROL_LAYOUT);
    for (const child of frames.concat(all)) own(child, IN_FLOW);
    for (const each of all) own(each, TEXT_SIZING);
    const nodes = {
      surface, heading, message, content, actions,
      "reason-label": reasonLabel,
      "reason-field": reasonField,
    };
    stands.forEach((each, index) => {
      nodes["action-" + (index + 1)] = each.frame;
      nodes["action-label-" + (index + 1)] = each.text;
    });
    if (example !== undefined) nodes.backdrop = node;
    const measures = bind(nodes, variant, variables, component.structure);
    // A stand-in that looks like the Ero it composes (Abnahme Spec 011 ②, F-5): the confirming
    // action is a butono of emphasis high, so its frame and its word take the butono's bindings
    // the plan read from that Skemo — the fill, the colour of the label and the radius of the box
    // — bound as a control's are, after the dialog's own (fill and word colour replace the
    // dialog's; border, padding and the word's role stay). The other stand-in keeps its look.
    const composed = component.composed || {};
    for (const each of stands) {
      const look = composed[each.key];
      if (look === undefined) continue;
      const bound = bind({ control: each.frame, label: each.text }, look, variables, "control");
      for (const measure of bound) measures.push(measure);
    }
    // The shadow of the surface (Spec 011 ②): bound where the API binds effects, written where not.
    if (variant.shadow !== undefined) {
      const shadow = shadowEffects(variant.shadow, variables);
      const target = nodes[variant.shadow.part];
      if (target !== undefined) {
        gather(target).effects = shadow.effects;
        report.shadow = shadow.report;
      }
    }
    for (const each of frames.concat(all)) flush(each);
    bindMeasures(measures, report, component, variant);
  }
  /**
   * The writing case of the label's role (F31): written where the plan states one value, left
   * unset with a warning where the modes disagree — a brand would be no projection.
   */
  function writeCase(component, variant, text) {
    if (variant.textCase === TEXT_CASE_VARIES) {
      if (casesVarying.indexOf(component.set) === -1) {
        casesVarying.push(component.set);
        warnings.push(
          component.set + ": Die Schreibweise der Beschriftung ist nicht in allen Modi " +
            "dieselbe. textCase ist in Figma kein bindbares Feld, also bleibt sie ungesetzt — " +
            "eine Marke auszuwählen wäre keine Projektion.",
        );
      }
    } else if (typeof variant.textCase === "string") {
      write(text, "textCase", variant.textCase);
    }
  }
  /**
   * A badge (Spec 011 ③, plan ③ D-14): the variant holds the pill — the control, a row with its
   * fill, border, radius, minimum height and inline padding bound — and in it the text, the label
   * property, in the role of the text part. No focus ring: static text has no state but rest
   * (G2); nothing of the hidden slot description is drawn.
   */
  async function drawBadge(node, component, variant, report, labels) {
    const control = part(node, "control", () => figma.createFrame());
    const text = part(control, "text", () => figma.createText());
    await loadCurrentFont(text);
    writeCase(component, variant, text);
    if (variant.font !== undefined) {
      write(text, "fontName", fonts.get(variant.font.family + " " + variant.font.style));
    }
    labels.push(text);
    for (const frame of [node, control]) own(frame, NEUTRAL);
    own(text, NEUTRAL_TEXT);
    own(node, HUG_LAYOUT);
    own(control, CONTROL_LAYOUT);
    // The border lies in the size, as on the web (box-sizing border-box).
    own(control, { strokesIncludedInLayout: true });
    for (const child of [node, control, text]) own(child, IN_FLOW);
    own(text, TEXT_SIZING);
    const measures = bind({ control, text }, variant, variables, component.structure);
    for (const each of [node, control, text]) flush(each);
    bindMeasures(measures, report, component, variant);
  }
  /**
   * A notice (Spec 011 ③, plan ③ D-14): the variant holds the control — a row with the surface's
   * fill, the radius and the padding of the box, and the accent as its stroke at the start: the
   * colour bound to the strokes, the left weight bound to accent.width, the other sides 0 — with
   * the texts in a column (the heading, the message as the label property, the details, the
   * actions placeholder) and the dismiss frame at the end, a square of dismiss.size. The dismiss
   * frame is shown by the BOOLEAN property dismissible (\`toggled\`, connected below); no focus
   * ring: the states lie with the composed dismiss butono (G2).
   */
  async function drawNotice(node, component, variant, report, labels, toggled) {
    const texts = component.texts || {};
    const control = part(node, "control", () => figma.createFrame());
    const column = part(control, "texts", () => figma.createFrame());
    const heading = typeof texts.heading === "string" ? part(column, "heading", () => figma.createText()) : undefined;
    const message = part(column, "message", () => figma.createText());
    const details = typeof texts.details === "string" ? part(column, "details", () => figma.createText()) : undefined;
    const actions = part(column, "actions", () => figma.createFrame());
    const dismiss = part(control, "dismiss", () => figma.createFrame());
    [heading, message, details, actions]
      .filter((child) => child !== undefined)
      .forEach((child, index) => {
        if (column.children.indexOf(child) !== index) column.insertChild(index, child);
      });
    [column, dismiss].forEach((child, index) => {
      if (control.children.indexOf(child) !== index) control.insertChild(index, child);
    });
    const all = [heading, message, details].filter((each) => each !== undefined);
    for (const each of all) await loadCurrentFont(each);
    writeCase(component, variant, message);
    if (variant.font !== undefined) {
      for (const each of all) write(each, "fontName", fonts.get(variant.font.family + " " + variant.font.style));
    }
    if (heading !== undefined) write(heading, "characters", texts.heading);
    if (details !== undefined) write(details, "characters", texts.details);
    labels.push(message);
    toggled.push({ part: "dismiss", node: dismiss });
    const frames = [node, control, column, actions, dismiss];
    for (const frame of frames) own(frame, NEUTRAL);
    for (const each of all) own(each, NEUTRAL_TEXT);
    own(node, HUG_LAYOUT);
    own(control, NOTICE_LAYOUT);
    // Only the start carries the accent: the weight of every other side is 0, the left one is
    // bound (accent.width) after the layout, like every measure.
    own(control, { strokeTopWeight: 0, strokeRightWeight: 0, strokeBottomWeight: 0 });
    own(column, TEXTS_LAYOUT);
    own(actions, PLACEHOLDER_LAYOUT);
    own(dismiss, INDICATOR_LAYOUT);
    // A part the constraints forbid in this variant is not shown (none for a notice today).
    own(actions, { visible: (variant.hidden || []).indexOf("actions") === -1 });
    for (const child of frames.concat(all)) own(child, IN_FLOW);
    for (const each of all) own(each, TEXT_SIZING);
    const nodes = { control, texts: column, message, actions, dismiss };
    if (heading !== undefined) nodes.heading = heading;
    if (details !== undefined) nodes.details = details;
    const measures = bind(nodes, variant, variables, component.structure);
    // The empty placeholder keeps no default size (F-4): shrunk before its layout is written.
    shrinkEmpty(actions);
    for (const each of frames.concat(all)) flush(each);
    bindMeasures(measures, report, component, variant);
  }
  /**
   * A state (Spec 011 ③, plan ③ D-14): the variant holds the control — a column, centred, with
   * the border's colour and width bound and its line as the variant says: a dash pattern where
   * the stroke is dashed (written, Figma binds none), the bound paint not shown where it is none
   * — with the indicator (the arc of the web, imported once; its size bound, the vector's stroke
   * bound to indicator.color; invisible where that colour is none), the text as the label
   * property, and the actions placeholder, invisible where the constraint forbids actions (while
   * loading). The motion part binds nothing here: Figma has no duration to bind, as for the
   * butono.
   */
  async function drawState(node, component, variant, report, labels) {
    const control = part(node, "control", () => figma.createFrame());
    const indicator = part(control, "indicator", () =>
      typeof component.sign === "string" ? figma.createNodeFromSvg(component.sign) : figma.createFrame(),
    );
    const mark = typeof component.sign === "string" ? markOf(indicator) : undefined;
    const text = part(control, "text", () => figma.createText());
    const actions = part(control, "actions", () => figma.createFrame());
    [indicator, text, actions].forEach((child, index) => {
      if (control.children.indexOf(child) !== index) control.insertChild(index, child);
    });
    await loadCurrentFont(text);
    writeCase(component, variant, text);
    if (variant.font !== undefined) {
      write(text, "fontName", fonts.get(variant.font.family + " " + variant.font.style));
    }
    labels.push(text);
    const frames = [node, control, indicator, actions];
    for (const frame of frames) own(frame, NEUTRAL);
    own(text, NEUTRAL_TEXT);
    own(node, HUG_LAYOUT);
    own(control, STATE_LAYOUT);
    own(indicator, INDICATOR_LAYOUT);
    own(actions, PLACEHOLDER_LAYOUT);
    const hidden = variant.hidden || [];
    // A part not drawn in this variant is not shown and takes no place (Spec 011 ③): the arc
    // when the area is empty, the actions while it loads.
    own(indicator, { visible: hidden.indexOf("indicator") === -1 });
    own(actions, { visible: hidden.indexOf("actions") === -1 });
    if (mark) own(mark, arcNeutral(component.sign));
    // The dash pattern of the border (own() would empty a list): the plan's numbers, or none.
    if (variant.stroke !== undefined) gather(control).dashPattern = variant.stroke.dashPattern.slice();
    for (const child of frames.concat([text])) own(child, IN_FLOW);
    own(text, TEXT_SIZING);
    const nodes = { control, indicator, text, actions };
    if (mark) nodes.mark = mark;
    const measures = bind(nodes, variant, variables, component.structure);
    // A stroke that is none keeps its binding and shows nothing: the paint is there, invisible —
    // as on the web, where the colour is bound and the style is none.
    if (variant.stroke !== undefined && variant.stroke.style === "none") {
      for (const paint of gather(control).strokes || []) paint.visible = false;
    }
    // The empty placeholder keeps no default size (F-4, as in a notice).
    shrinkEmpty(actions);
    for (const each of frames.concat([text]).concat(mark ? [mark] : [])) flush(each);
    bindMeasures(measures, report, component, variant);
  }
  /**
   * A meter (Spec 011 ④, plan ④ D-14): the variant holds the control — a column, the gap bound to
   * box.gap — with the label (the label property), the track (its fill, radius and height as a
   * minimum, clipping) holding the fill frame (its colour by intent, its radius, as high as the
   * track) and the value text (the Vitrino's word). The column is as wide as the wider of the
   * two texts, written from what the tool measured (Regel 0: a set has no container to fill —
   * the meter takes its container's width), the track fills it, and the fill frame is resized
   * to the plan's share of the track's width and the track's height (Figma binds no share; an
   * empty auto-layout frame keeps its size, so it is fixed, not hugging — acceptance F-3). The
   * same drawing on the example frame „unbekannt" (\`example\` with texts): then the track is the
   * node \`unknown\` — its stroke bound to unknown.color and unknown.width with the plan's dash
   * pattern — no fill frame is made and the empty track is brought to its minimum height, the
   * value text says „nicht geprüft" in the role of the set's value text (F-6), the label carries
   * the word itself (a text outside a component has no property), and the frame stands on the
   * Vitrino's ground like the set (component.surface), so its texts lie on the canvas their roles
   * are paired with in every mode — not on whatever the section shows.
   */
  async function drawMeter(node, component, variant, report, labels, example) {
    const texts = Object.assign({}, component.texts || {}, example === undefined ? {} : example.texts || {});
    const unknown = example !== undefined && example.texts !== undefined;
    const control = part(node, "control", () => figma.createFrame());
    const label = part(control, "label", () => figma.createText());
    const track = part(control, "track", () => figma.createFrame());
    const valueText = part(control, "value-text", () => figma.createText());
    [label, track, valueText].forEach((child, index) => {
      if (control.children.indexOf(child) !== index) control.insertChild(index, child);
    });
    const fill = unknown ? undefined : part(track, "fill", () => figma.createFrame());
    const all = [label, valueText];
    for (const each of all) await loadCurrentFont(each);
    writeCase(component, variant, label);
    if (variant.font !== undefined) {
      for (const each of all) write(each, "fontName", fonts.get(variant.font.family + " " + variant.font.style));
    }
    if (typeof texts["value-text"] === "string") write(valueText, "characters", texts["value-text"]);
    if (example === undefined) labels.push(label);
    else if (component.label !== undefined) write(label, "characters", component.label.defaultValue);
    const frames = [node, control, track].concat(fill ? [fill] : []);
    for (const frame of frames) own(frame, NEUTRAL);
    for (const each of all) own(each, NEUTRAL_TEXT);
    own(node, HUG_LAYOUT);
    if (example !== undefined) {
      own(node, {
        paddingLeft: example.padding,
        paddingRight: example.padding,
        paddingTop: example.padding,
        paddingBottom: example.padding,
      });
    }
    // The ground of the example (F-6): the set's surface, bound like the set's (F16).
    if (example !== undefined && component.surface !== undefined) {
      const ground = variables.get(component.surface.variable);
      if (ground !== undefined) {
        const bound = figma.variables.setBoundVariableForPaint(
          { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
          "color",
          ground,
        );
        bound.opacity = component.surface.opacity;
        gather(node).fills = [bound];
      }
    }
    own(control, METER_LAYOUT);
    own(track, TRACK_LAYOUT);
    if (fill) own(fill, FILL_LAYOUT);
    // The dash pattern of the unknown stroke (own() would empty a list): the plan's numbers, on
    // the example alone; in the set the track has no stroke.
    if (unknown && variant.stroke !== undefined && variant.stroke.part === "unknown") {
      gather(track).dashPattern = variant.stroke.dashPattern.slice();
    }
    for (const child of frames.concat(all)) own(child, IN_FLOW);
    for (const each of all) own(each, TEXT_SIZING);
    const nodes = { control, label, track, "value-text": valueText };
    if (fill) nodes.fill = fill;
    if (unknown) nodes.unknown = track;
    const measures = bind(nodes, variant, variables, component.structure);
    for (const each of frames.concat(all)) flush(each);
    bindMeasures(measures, report, component, variant);
    // Measured, then written (F14, F-3): the column as wide as the wider text — the track fills
    // it — and the fill frame the plan's share of the track, as high as the track: track.height
    // as the mode resolves it (the track's minimum; where the tool cannot say, the smallest size,
    // and the fill's bound minimum lifts it). The empty track of the example is brought to that
    // height the same way (an empty auto-layout frame keeps its size, ③ F-4).
    const trackHeight = resolvedNumber(variables.get(variant.bindings["track.height"]), track);
    fit(control, Math.max(label.width, valueText.width), control.height, METER_LAYOUT);
    if (unknown) {
      fit(track, track.width, trackHeight === undefined ? SMALLEST_SIZE : trackHeight, TRACK_LAYOUT);
    }
    if (fill && component.meter !== undefined) {
      const height = trackHeight === undefined ? SMALLEST_SIZE : trackHeight;
      fit(fill, component.meter.share * track.width, height, FILL_LAYOUT);
    }
  }
  /**
   * A table (Spec 011 ④, plan ④ D-14): the variant is a column — the caption (the label
   * property; shown by the BOOLEAN property of caption-hidden, \`toggled\`) above the region (the
   * border on every side, the radius, clipping) holding the head row (its fill, the border under
   * it) and one row per row of the plan's table (the border under each), every row a row of cells
   * (inline padding and minimum height bound). The sorted head cell holds the sort button:
   * focus-ring → focus-gap → sort (fill by state, radius) with the head's text (sort.color, the
   * head's role) and the chevron (sort-indicator: its size bound, the vector's fill bound to
   * sort-indicator.color); the other head cells and the body cells hold their text — a row
   * header in the row-header role, a cell in the cell's. A numeric column aligns at the end; the
   * tabular figures of the web are no property of a Figma text. Every cell of a column is at
   * least as wide as the widest (written from the measurement), so the columns align.
   */
  async function drawTable(node, component, variant, report, labels, toggled) {
    const table = component.table || { head: [], rows: [], numeric: [], sorted: 0 };
    const caption = part(node, "caption", () => figma.createText());
    const region = part(node, "region", () => figma.createFrame());
    [caption, region].forEach((child, index) => {
      if (node.children.indexOf(child) !== index) node.insertChild(index, child);
    });
    const head = part(region, "head", () => figma.createFrame());
    const rows = table.rows.map((_, index) => part(region, "row-" + (index + 1), () => figma.createFrame()));
    [head].concat(rows).forEach((child, index) => {
      if (region.children.indexOf(child) !== index) region.insertChild(index, child);
    });
    const columns = table.head.map((_, index) => index);
    const headCells = columns.map((column) => part(head, "head-" + (column + 1), () => figma.createFrame()));
    headCells.forEach((child, index) => {
      if (head.children.indexOf(child) !== index) head.insertChild(index, child);
    });
    const sortCell = headCells[table.sorted];
    const ring = part(sortCell, "focus-ring", () => figma.createFrame());
    const gap = part(ring, "focus-gap", () => figma.createFrame());
    const sort = part(gap, "sort", () => figma.createFrame());
    const sortText = part(sort, "sort-text", () => figma.createText());
    const indicator = part(sort, "sort-indicator", () =>
      typeof component.sign === "string" ? figma.createNodeFromSvg(component.sign) : figma.createFrame(),
    );
    const mark = typeof component.sign === "string" ? markOf(indicator) : undefined;
    [sortText, indicator].forEach((child, index) => {
      if (sort.children.indexOf(child) !== index) sort.insertChild(index, child);
    });
    const headTexts = columns.map((column) =>
      column === table.sorted
        ? undefined
        : part(headCells[column], "head-text-" + (column + 1), () => figma.createText()),
    );
    const cells = rows.map((row, r) => {
      const made = columns.map((column) => part(row, "cell-" + (r + 1) + "-" + (column + 1), () => figma.createFrame()));
      made.forEach((child, index) => {
        if (row.children.indexOf(child) !== index) row.insertChild(index, child);
      });
      return made;
    });
    const cellTexts = cells.map((row, r) =>
      row.map((cell, column) =>
        part(
          cell,
          column === 0 ? "row-header-text-" + (r + 1) : "cell-text-" + (r + 1) + "-" + (column + 1),
          () => figma.createText(),
        ),
      ),
    );
    const all = [caption, sortText]
      .concat(headTexts.filter((each) => each !== undefined))
      .concat(cellTexts.flat());
    for (const each of all) await loadCurrentFont(each);
    writeCase(component, variant, caption);
    if (variant.font !== undefined) {
      for (const each of all) write(each, "fontName", fonts.get(variant.font.family + " " + variant.font.style));
    }
    columns.forEach((column) => {
      const text = column === table.sorted ? sortText : headTexts[column];
      if (text !== undefined) write(text, "characters", table.head[column]);
    });
    cellTexts.forEach((row, r) =>
      row.forEach((text, column) => write(text, "characters", (table.rows[r] || [])[column] || "")),
    );
    labels.push(caption);
    toggled.push({ part: "caption", node: caption });
    const frames = [node, region, head, ring, gap, sort, indicator].concat(rows, headCells, cells.flat());
    for (const frame of frames) own(frame, NEUTRAL);
    for (const each of all) own(each, NEUTRAL_TEXT);
    own(node, FIELD_LAYOUT);
    own(region, FIELD_LAYOUT);
    // The region clips its rows to its radius, as on the web (overflow-x auto, border-box).
    own(region, { clipsContent: true, strokesIncludedInLayout: true });
    for (const row of [head].concat(rows)) {
      own(row, ROW_LAYOUT);
      // Only the bottom carries the border: the weight of every other side is 0, the bottom one
      // is bound (border.width) after the layout, like every measure.
      own(row, { strokeTopWeight: 0, strokeLeftWeight: 0, strokeRightWeight: 0 });
    }
    const numeric = (column) => table.numeric.indexOf(column) !== -1;
    for (const cell of headCells.concat(cells.flat())) own(cell, CELL_LAYOUT);
    columns.forEach((column) => {
      for (const cell of [headCells[column]].concat(cells.map((row) => row[column]))) {
        own(cell, { primaryAxisAlignItems: numeric(column) ? "MAX" : "MIN" });
      }
      for (const text of [column === table.sorted ? sortText : headTexts[column]].concat(cellTexts.map((row) => row[column]))) {
        if (text !== undefined) own(text, { textAlignHorizontal: numeric(column) ? "RIGHT" : "LEFT" });
      }
    });
    for (const frame of [ring, gap]) own(frame, HUG_LAYOUT);
    own(sort, CONTROL_LAYOUT);
    own(indicator, INDICATOR_LAYOUT);
    if (mark) own(mark, MARK_NEUTRAL);
    for (const child of frames.concat(all)) own(child, IN_FLOW);
    for (const each of all) own(each, TEXT_SIZING);
    const nodes = {
      caption, region, head, sort,
      "focus-ring": ring,
      "focus-gap": gap,
      "sort-text": sortText,
      "sort-indicator": indicator,
    };
    if (mark) nodes.mark = mark;
    rows.forEach((row, r) => {
      nodes["row-" + (r + 1)] = row;
    });
    columns.forEach((column) => {
      nodes["head-" + (column + 1)] = headCells[column];
      if (headTexts[column] !== undefined) nodes["head-text-" + (column + 1)] = headTexts[column];
    });
    cells.forEach((row, r) =>
      row.forEach((cell, column) => {
        nodes["cell-" + (r + 1) + "-" + (column + 1)] = cell;
        nodes[column === 0 ? "row-header-text-" + (r + 1) : "cell-text-" + (r + 1) + "-" + (column + 1)] = cellTexts[r][column];
      }),
    );
    const measures = bind(nodes, variant, variables, component.structure);
    // The ring's radii, bound like the butono's (F32): they grow from the sort button's radius.
    for (const name of ["focus-ring", "focus-gap"]) {
      const variable = variables.get((variant.radii || {})[name]);
      const target = name === "focus-ring" ? ring : gap;
      if (variable !== undefined) measures.push({ node: target, field: "cornerRadius", variable: variable });
    }
    for (const each of frames.concat(all).concat(mark ? [mark] : [])) flush(each);
    bindMeasures(measures, report, component, variant);
    // Measured, then written (F14): every cell of a column at least as wide as its widest, so
    // the columns align; the same on every run, so nothing is rewritten.
    columns.forEach((column) => {
      const stack = [headCells[column]].concat(cells.map((row) => row[column]));
      const widest = Math.max.apply(null, stack.map((cell) => cell.width));
      for (const cell of stack) write(cell, "minWidth", widest);
    });
  }
  /**
   * A key-value list (Spec 011 ④, plan ④ D-14): the variant holds the list — a column, the gap
   * bound to list.gap — with one entry per pair of the plan: a row (layout columns: term then
   * value, the gap the box's inline padding) or a column (stacked: the box's gap), the term and
   * the value texts in their roles. The label prop is the accessible name, never seen: no text
   * carries the label property.
   */
  async function drawList(node, component, variant, report) {
    const entries = component.entries || [];
    // The layout is a term of the variant, written like the knob's position: columns lays an
    // entry out as a row, stacked as a column (the web's grid-template-columns by layout).
    const columns = variant.props.layout !== "stacked";
    const list = part(node, "list", () => figma.createFrame());
    const rows = entries.map((_, index) => part(list, "entry-" + (index + 1), () => figma.createFrame()));
    rows.forEach((child, index) => {
      if (list.children.indexOf(child) !== index) list.insertChild(index, child);
    });
    const terms = rows.map((row, index) => part(row, "term-" + (index + 1), () => figma.createText()));
    const values = rows.map((row, index) => part(row, "value-" + (index + 1), () => figma.createText()));
    rows.forEach((row, index) => {
      [terms[index], values[index]].forEach((child, at) => {
        if (row.children.indexOf(child) !== at) row.insertChild(at, child);
      });
    });
    const all = terms.concat(values);
    for (const each of all) await loadCurrentFont(each);
    if (variant.font !== undefined) {
      for (const each of all) write(each, "fontName", fonts.get(variant.font.family + " " + variant.font.style));
    }
    entries.forEach((entry, index) => {
      write(terms[index], "characters", entry.term);
      write(values[index], "characters", entry.value);
    });
    const frames = [node, list].concat(rows);
    for (const frame of frames) own(frame, NEUTRAL);
    for (const each of all) own(each, NEUTRAL_TEXT);
    own(node, HUG_LAYOUT);
    own(list, FIELD_LAYOUT);
    for (const row of rows) own(row, columns ? ENTRY_ROW_LAYOUT : TEXTS_LAYOUT);
    for (const child of frames.concat(all)) own(child, IN_FLOW);
    for (const each of all) own(each, TEXT_SIZING);
    const nodes = { list };
    rows.forEach((row, index) => {
      nodes[(columns ? "entry-row-" : "entry-column-") + (index + 1)] = row;
      nodes["term-" + (index + 1)] = terms[index];
      nodes["value-" + (index + 1)] = values[index];
    });
    const measures = bind(nodes, variant, variables, component.structure);
    for (const each of frames.concat(all)) flush(each);
    bindMeasures(measures, report, component, variant);
  }
  /**
   * The entries of a navigation or a tab list (Spec 011 ⑤), one per word of the plan's entry:
   * an entry frame holding ring → gap → the keyed frame (\`item-N\` or \`tab-N\`) with its text
   * (\`items-N\` or \`tabs-N\`), found by their marks or created, in the order of the words. The
   * texts are written in the variant's font, the case of the role, the word of the entry.
   */
  async function drawEntries(control, component, variant, keyed, textOf) {
    const words = component.entry !== undefined ? component.entry.texts : [];
    const rows = words.map((word, index) => {
      const n = index + 1;
      const entry = part(control, "entry-" + n, () => figma.createFrame());
      const ring = part(entry, "focus-ring", () => figma.createFrame());
      const gap = part(ring, "focus-gap", () => figma.createFrame());
      const frame = part(gap, keyed + "-" + n, () => figma.createFrame());
      const text = part(frame, textOf + "-" + n, () => figma.createText());
      return { word, entry, ring, gap, frame, text, n };
    });
    rows.forEach((row, index) => {
      if (control.children.indexOf(row.entry) !== index) control.insertChild(index, row.entry);
    });
    for (const row of rows) await loadCurrentFont(row.text);
    // An entry whose weight departs from the role carries its own font (Spec 014 ①, plan ①
    // D-01): the current item, the active tab in the cut of the weight; the others the variant's.
    const chosen = component.entry !== undefined ? component.entry.selected : 0;
    for (const row of rows) {
      writeCase(component, variant, row.text);
      const values = (variant.entries || {})[row.n - 1 === chosen ? "true" : "false"] || {};
      const font = values.font !== undefined ? values.font : variant.font;
      if (font !== undefined) {
        write(row.text, "fontName", fonts.get(font.family + " " + font.style));
      }
      write(row.text, "characters", row.word);
    }
    return rows;
  }
  /**
   * Binds the entries of a navigation or a tab list (Spec 011 ⑤), each in a pass of its own (as
   * the options of a choice, Spec 010 ③): the variant's bindings and paints merged with the entry
   * of its value of the key — the first word is the current or active one — the ring shown on
   * the first entry in the focus variant only, the radii of ring and gap bound where the plan has
   * them (F32).
   */
  function bindEntries(rows, component, variant, variables, keyed, textOf, measures) {
    const chosen = component.entry !== undefined ? component.entry.selected : 0;
    rows.forEach((row, index) => {
      const values = (variant.entries || {})[index === chosen ? "true" : "false"] || { bindings: {} };
      const merged = {
        bindings: Object.assign({}, variant.bindings, values.bindings),
        paints: Object.assign({}, variant.paints, values.paints),
        focusVisible: variant.focusVisible === true && index === 0,
      };
      const nodes = { "focus-ring": row.ring, "focus-gap": row.gap };
      nodes[keyed + "-" + row.n] = row.frame;
      nodes[textOf + "-" + row.n] = row.text;
      for (const measure of bind(nodes, merged, variables, component.structure)) measures.push(measure);
      for (const name of ["focus-ring", "focus-gap"]) {
        const variable = variables.get((variant.radii || {})[name]);
        const target = name === "focus-ring" ? row.ring : row.gap;
        if (variable !== undefined) measures.push({ node: target, field: "cornerRadius", variable: variable });
      }
    });
  }
  /**
   * A navigation (Spec 011 ⑤): the variant holds the control — the nav, a row of its items, the
   * gap bound to box.gap — with one entry per word of the plan (the Vitrino's: Eins, Zwei, Drei),
   * each ring → gap → item (fill by current and state, the box's height, radius and inline
   * padding, the underline as its bottom stroke: strong where current, none elsewhere) with the
   * item's text (colour by current, the label role). The first item is the current one (E7). The
   * label prop is the name of the landmark, heard, never seen: no text carries the label
   * property. The same drawing on the example frame „vertikal" (\`example\` with props): then the
   * nav is a column. A count beside an item (the Uzo composes an insigno) is not drawn: it would
   * be an instance of another set, which the plugin does not compose yet (candidate B-6).
   */
  async function drawNav(node, component, variant, report, labels, example) {
    const vertical = example !== undefined && (example.props || {}).orientation === "vertical";
    const control = part(node, "control", () => figma.createFrame());
    const rows = await drawEntries(control, component, variant, "item", "items");
    const texts = rows.map((row) => row.text);
    const frames = [node, control].concat(...rows.map((row) => [row.entry, row.ring, row.gap, row.frame]));
    for (const frame of frames) own(frame, NEUTRAL);
    for (const each of texts) own(each, NEUTRAL_TEXT);
    own(node, HUG_LAYOUT);
    if (example !== undefined) {
      own(node, {
        paddingLeft: example.padding,
        paddingRight: example.padding,
        paddingTop: example.padding,
        paddingBottom: example.padding,
      });
    }
    own(control, NAV_LAYOUT);
    if (vertical) own(control, { layoutMode: "VERTICAL", counterAxisAlignItems: "MIN" });
    for (const row of rows) {
      for (const frame of [row.entry, row.ring, row.gap]) own(frame, HUG_LAYOUT);
      own(row.frame, CONTROL_LAYOUT);
      // The underline lies in the item's size, as on the web (border-box); only the bottom
      // carries it — the other sides stay 0, the bottom is bound (underline.width) where current.
      own(row.frame, {
        strokesIncludedInLayout: true,
        strokeTopWeight: 0,
        strokeLeftWeight: 0,
        strokeRightWeight: 0,
        strokeBottomWeight: 0,
      });
    }
    for (const child of frames.concat(texts)) own(child, IN_FLOW);
    for (const each of texts) own(each, TEXT_SIZING);
    const measures = bind({ control }, variant, variables, component.structure);
    bindEntries(rows, component, variant, variables, "item", "items", measures);
    for (const each of frames.concat(texts)) flush(each);
    bindMeasures(measures, report, component, variant);
  }
  /**
   * A tab list (Spec 011 ⑤): the variant is a column — the control (the list: a row of its tabs,
   * its line the bottom stroke in list.color and list.width, the gap bound to list.gap) above the
   * panel (its inline padding bound, the Vitrino's word of the first tab in panel.color). Every
   * tab is ring → gap → tab (fill by state — every tab shows the variant's state, as the web's
   * stylesheet keys it —, minimum height and inline padding, the selected indicator as its bottom
   * stroke: strong where active, none elsewhere) with the tab's text (colour by active, the label
   * role); the first tab is the active one (E7). The label prop is the name of the group, never
   * shown: no text carries the label property. The panel's text has no role in the Skemo (its
   * content is the application's): it is written in the tabs' font, bound to nothing.
   */
  async function drawTabs(node, component, variant, report) {
    const texts = component.texts || {};
    const control = part(node, "control", () => figma.createFrame());
    const panel = part(node, "panel", () => figma.createFrame());
    [control, panel].forEach((child, index) => {
      if (node.children.indexOf(child) !== index) node.insertChild(index, child);
    });
    const panelText = part(panel, "panel-text", () => figma.createText());
    const rows = await drawEntries(control, component, variant, "tab", "tabs");
    await loadCurrentFont(panelText);
    if (variant.font !== undefined) {
      write(panelText, "fontName", fonts.get(variant.font.family + " " + variant.font.style));
    }
    if (typeof texts.panel === "string") write(panelText, "characters", texts.panel);
    const all = rows.map((row) => row.text).concat([panelText]);
    const frames = [node, control, panel].concat(...rows.map((row) => [row.entry, row.ring, row.gap, row.frame]));
    for (const frame of frames) own(frame, NEUTRAL);
    for (const each of all) own(each, NEUTRAL_TEXT);
    own(node, FIELD_LAYOUT);
    own(control, TABLIST_LAYOUT);
    // Only the bottom of the list carries its line; the other sides stay 0.
    own(control, { strokeTopWeight: 0, strokeLeftWeight: 0, strokeRightWeight: 0, strokeBottomWeight: 0 });
    own(panel, PANEL_LAYOUT);
    for (const row of rows) {
      for (const frame of [row.entry, row.ring, row.gap]) own(frame, HUG_LAYOUT);
      own(row.frame, CONTROL_LAYOUT);
      // The indicator lies in the tab's size, as on the web (border-box); the bottom alone
      // carries it, bound (selected-indicator.width) where active.
      own(row.frame, {
        strokesIncludedInLayout: true,
        strokeTopWeight: 0,
        strokeLeftWeight: 0,
        strokeRightWeight: 0,
        strokeBottomWeight: 0,
      });
    }
    for (const child of frames.concat(all)) own(child, IN_FLOW);
    for (const each of all) own(each, TEXT_SIZING);
    const measures = bind({ control, panel, "panel-text": panelText }, variant, variables, component.structure);
    bindEntries(rows, component, variant, variables, "tab", "tabs", measures);
    for (const each of frames.concat(all)) flush(each);
    bindMeasures(measures, report, component, variant);
  }
  /**
   * The example frame beside a set (Spec 011 ②, spec „dialogo – Figma": „mit Hintergrund", the
   * default variant drawn once more on a frame whose fill is bound to the backdrop; Spec 011 ④,
   * spec „mezurilo – Figma": „unbekannt", the default variant with the unknown value; Spec 011 ⑤:
   * „vertikal", the default variant of a navigation as a column), found by its mark \`example\`
   * or created, placed in the frame „Eroj" right after the set (F-8) — Figma lays it out like a
   * set. It is no set: no variants, no grid, no label property.
   */
  async function placeExample(frame, set, component, report) {
    const spec = component.example;
    if (frame === undefined || spec === undefined) return undefined;
    const wanted = variantName(spec.variant);
    const variant = component.variants.find((candidate) => variantName(candidate.props) === wanted);
    if (variant === undefined) return undefined;
    let example = ours(frame, "example", component.set);
    const found = example !== undefined;
    if (example === undefined) {
      example = create(() => figma.createFrame());
      stamp(example, "example", component.set);
    }
    write(example, "name", spec.name);
    if (component.structure === "meter") await drawMeter(example, component, variant, report, [], spec);
    else if (component.structure === "nav") await drawNav(example, component, variant, report, [], spec);
    else await drawDialog(example, component, variant, report, [], spec);
    if (example.parent !== frame) frame.appendChild(example);
    const at = frame.children.indexOf(set) + 1;
    if (frame.children.indexOf(example) !== at) frame.insertChild(at, example);
    write(example, "layoutPositioning", "AUTO");
    return { name: spec.name, found: found, created: !found };
  }
  // Every font of every mode, not only the one of the base combination (F30): a binding to a font
  // variable only holds once Figma has loaded every font that variable can show. What did not
  // arrive is named here, with the Aspektoj that ask for it, and the run falls back for it.
  const fontReports = new Map();
  for (const component of PLAN.components) {
    const loadedFonts = [];
    const missing = [];
    const crossing = [];
    const perAspekto = {};
    // What a mode really shows: missing here is a finding, with the name and the fallback.
    for (const font of component.fonts || []) {
      const key = font.family + " " + font.style;
      // The candidates travel with the pair (W3, F-2): the ladder tries every family of the stack.
      const pair = { family: font.family, style: font.style, families: font.families };
      if (!fonts.has(key)) fonts.set(key, await loadFont(pair, warnings));
      const arrived = fonts.get(key);
      const applied = arrived.family + " " + arrived.style;
      if (applied === key) loadedFonts.push(key);
      else missing.push(key);
      // Die Wirkung, nicht die Absicht (F32): Der Bericht nennt je Aspekto die Schrift, die
      // wirklich geladen wurde. Was der Plan wollte und nicht bekam, steht unter "missing".
      for (const aspekto of font.aspektoj || []) perAspekto[aspekto] = applied;
    }
    // Binding is field by field: between the family and the cut the text stands for a moment in a
    // pair no mode ever shows — Archivo in komuna's cut. Figma reads that state too, so every
    // crossing of the families with the cuts is loaded as well (F30). A crossing no mode shows is
    // loaded quietly; only what a mode shows is worth a warning.
    const families = [];
    const cuts = [];
    for (const font of component.fonts || []) {
      if (families.indexOf(font.family) === -1) families.push(font.family);
      if (cuts.indexOf(font.style) === -1) cuts.push(font.style);
    }
    for (const family of families) {
      for (const style of cuts) {
        const key = family + " " + style;
        if (fonts.has(key)) continue;
        try {
          await figma.loadFontAsync({ family: family, style: style });
          fonts.set(key, { family: family, style: style });
        } catch (error) {
          crossing.push(key);
        }
      }
    }
    // A plan from before F30 names no fonts; then the base font of every variant is loaded, as
    // it always was, and nothing is bound.
    for (const variant of component.variants) {
      const own = Object.values(variant.entries || {}).map((entry) => entry.font);
      for (const font of [variant.font].concat(own)) {
        if (font === undefined) continue;
        const key = font.family + " " + font.style;
        if (!fonts.has(key)) fonts.set(key, await loadFont(font, warnings));
      }
    }
    fontReports.set(component.set, {
      bound: {},
      loaded: loadedFonts.sort(),
      missing: missing.sort(),
      crossing: crossing.sort(),
      perAspekto: perAspekto,
    });
  }
  const reports = [];
  // The section and its frame every set lies in (F-2, F-8): found, or created before the first
  // set is placed.
  const section = openSection();
  const frame = openFrame(section, warnings);
  progress.section = sectionReport;
  for (const component of PLAN.components) {
    let set = findSet(component.set);
    // How the run found the set, before it changed anything (F10b). Ohne diesen Blick lässt sich
    // hinterher nicht mehr unterscheiden, ob ein Knoten fehlte oder ob er nur seine Markierung
    // verloren hatte — der frisch angelegte Knoten verdeckt beides.
    const before = foundState(set);
    // Was der vorige Lauf am Set hinterlassen hat. Lauf 2 lässt sich nur im Licht von Lauf 1
    // deuten: „71 Kinder beim Start" heißt nur dann „zwischen den Läufen verschwunden", wenn Lauf 1
    // mit 72 geendet hat (F10b). Deshalb legt jeder Lauf seinen Endstand hier ab.
    const report = {
      set: component.set,
      found: set !== undefined,
      planned: component.variants.length,
      left: leftState(set),
      before: before,
      created: [],
      updated: [],
      missing: [],
      extra: [],
      duplicates: [],
      after: { children: 0, marked: 0 },
      // Knoten des Sets beim Start und am Ende, und jeder, der dazwischen verschwand (F10d).
      nodes: {
        start: seenAtStart.has(component.set) ? seenAtStart.get(component.set).nodes.length : 0,
        end: 0,
      },
      lost: [],
      diagnosis: "",
      // Welche eigenen Modi das Set trug und was nach dem Lauf steht (F35).
      modes: { cleared: [], set: {} },
      // Rohdaten der Schrift (F30): welche Variable an welchem Feld hängt, was geladen wurde,
      // was fehlt und welche Schrift je Aspekto dahinter steht.
      fonts: fontReports.get(component.set) || {
        bound: {},
        loaded: [],
        missing: [],
        crossing: [],
        perAspekto: {},
      },
    };
    report.fonts.refused = [];
    report.fonts.bound = {};
    progress.components.push(report);
    const made = [];
    const labels = [];
    // The nodes a BOOLEAN property shows or hides (Spec 011 ③), connected once the set exists.
    const toggled = [];
    for (const variant of component.variants) {
      const name = variantName(variant.props);
      const existing = set === undefined ? undefined : ours(set, "variant", name);
      const node = existing ?? create(() => figma.createComponent());
      // Counted once the node exists: a run that fails while creating reports what it made.
      (existing === undefined ? report.created : report.updated).push(name);
      write(node, "name", name);
      stamp(node, "variant", name);
      stamp(node, "ero", component.set);
      // A radio group (Spec 010 ③, D-07) is drawn as a choice, in a function of its own.
      if (component.structure === "choice") {
        await drawChoice(node, component, variant, report, labels);
        if (existing === undefined) made.push(node);
        continue;
      }
      // A dialog (Spec 011 ②) is drawn as a surface with its parts, in a function of its own.
      if (component.structure === "dialog") {
        await drawDialog(node, component, variant, report, labels, undefined);
        if (existing === undefined) made.push(node);
        continue;
      }
      // A badge, a notice and a state (Spec 011 ③) are drawn in functions of their own: no focus
      // ring, the control directly under the variant.
      if (component.structure === "badge") {
        await drawBadge(node, component, variant, report, labels);
        if (existing === undefined) made.push(node);
        continue;
      }
      if (component.structure === "notice") {
        await drawNotice(node, component, variant, report, labels, toggled);
        if (existing === undefined) made.push(node);
        continue;
      }
      if (component.structure === "state") {
        await drawState(node, component, variant, report, labels);
        if (existing === undefined) made.push(node);
        continue;
      }
      // A meter, a table and a list (Spec 011 ④) are drawn in functions of their own; the table
      // keeps its focus ring around the sort button.
      if (component.structure === "meter") {
        await drawMeter(node, component, variant, report, labels, undefined);
        if (existing === undefined) made.push(node);
        continue;
      }
      if (component.structure === "table") {
        await drawTable(node, component, variant, report, labels, toggled);
        if (existing === undefined) made.push(node);
        continue;
      }
      if (component.structure === "list") {
        await drawList(node, component, variant, report);
        if (existing === undefined) made.push(node);
        continue;
      }
      // A navigation and a tab list (Spec 011 ⑤) are drawn in functions of their own: every
      // entry keeps its focus ring, the control lies directly under the variant.
      if (component.structure === "nav") {
        await drawNav(node, component, variant, report, labels, undefined);
        if (existing === undefined) made.push(node);
        continue;
      }
      if (component.structure === "tabs") {
        await drawTabs(node, component, variant, report);
        if (existing === undefined) made.push(node);
        continue;
      }
      // The structure (F11): variant → focus-ring → focus-gap → control → label, each found by
      // its part mark and created when missing. A control an older plugin left directly under
      // the variant is moved in, never duplicated.
      // A field (Spec 009, D-09) is a column: label, then ring → gap → control with the typed text,
      // then help and error; a control keeps the label inside.
      const isField = component.structure === "field";
      // A switch (Spec 010 ①, D-10) is a row: the ring around the track with its knob, then the
      // label beside it.
      const isToggle = component.structure === "toggle";
      const field = isField || isToggle ? part(node, "field", () => figma.createFrame()) : undefined;
      // A checkbox (Spec 010 ②, D-09): label and error in a column beside the box.
      const toggleTexts = isToggle && Object.keys(component.texts || {}).length > 0;
      const column = toggleTexts ? part(field, "texts", () => figma.createFrame()) : undefined;
      const labelParent = column || field;
      const ring = part(field || node, "focus-ring", () => figma.createFrame());
      const gap = part(ring, "focus-gap", () => figma.createFrame());
      const control =
        ours(gap, "part", "control") ??
        ours(node, "part", "control") ??
        part(gap, "control", () => figma.createFrame());
      if (control.parent !== gap) gap.appendChild(control);
      write(control, "name", "control");
      const label = part(labelParent || control, "label", () => figma.createText());
      if (isField && field.children.indexOf(label) !== 0) field.insertChild(0, label);
      if (isToggle && column === undefined && field.children.indexOf(label) !== 1) field.insertChild(1, label);
      if (column !== undefined && field.children.indexOf(column) !== 1) field.insertChild(1, column);
      if (column !== undefined && column.children.indexOf(label) !== 0) column.insertChild(0, label);
      const textNode = isField ? part(control, "text", () => figma.createText()) : undefined;
      // The chevron of a select (Spec 010 ④, D-07): its sign at the end of the field's control,
      // after the text, imported once like the check mark; a text field has no sign.
      const fieldSign = isField && typeof component.sign === "string";
      // The knob of a switch is a frame; the check mark of a checkbox is its sign, imported once.
      const indicator = isToggle || fieldSign
        ? part(control, "indicator", () =>
            typeof component.sign === "string"
              ? figma.createNodeFromSvg(component.sign)
              : figma.createFrame(),
          )
        : undefined;
      if (fieldSign && control.children.indexOf(indicator) !== control.children.length - 1) {
        control.appendChild(indicator);
      }
      const mark = indicator !== undefined && typeof component.sign === "string" ? markOf(indicator) : undefined;
      const help = isField ? part(field, "help", () => figma.createText()) : undefined;
      const errorParent = isField ? field : column;
      const error =
        errorParent !== undefined && (isField || typeof (component.texts || {}).error === "string")
          ? part(errorParent, "error", () => figma.createText())
          : undefined;
      const texts = [label, textNode, help, error].filter((each) => each !== undefined);
      // Erst die Schrift, die der Text jetzt trägt, dann jedes Schreiben (F-A): Figma lehnt
      // textCase auf einem Text ab, dessen aktuelle Schrift nicht geladen ist — ein neuer Text trägt
      // Inter Regular, nicht die Schrift des Plans.
      for (const each of texts) await loadCurrentFont(each);
      // Die Schreibweise steht im Plan als ein Wert für alle Modi, weil textCase kein bindbares
      // Feld ist (F31). Wo die Modi sich unterscheiden, nennt der Plan den Befund statt eines
      // Werts — dann schreibt der Lauf nichts und sagt, was er nicht konnte.
      if (variant.textCase === TEXT_CASE_VARIES) {
        if (casesVarying.indexOf(component.set) === -1) {
          casesVarying.push(component.set);
          warnings.push(
            component.set + ": Die Schreibweise der Beschriftung ist nicht in allen Modi " +
              "dieselbe. textCase ist in Figma kein bindbares Feld, also bleibt sie ungesetzt — " +
              "eine Marke auszuwählen wäre keine Projektion.",
          );
        }
      } else if (typeof variant.textCase === "string") {
        write(label, "textCase", variant.textCase);
      }
      if (variant.font !== undefined) {
        for (const each of texts) {
          write(each, "fontName", fonts.get(variant.font.family + " " + variant.font.style));
        }
      }
      // The texts of a field (F-4): a default per node, so the frames have content to hug and
      // help and error are visible; the label gets its text with its property below.
      for (const [name, each] of [["text", textNode], ["help", help], ["error", error]]) {
        if (each === undefined) continue;
        const text = (component.texts || {})[name];
        if (typeof text === "string") write(each, "characters", text);
      }
      // Die Unterstreichung eines Links (Spec 008, D-11): je Variante an oder aus, geschrieben wie
      // textCase – Figma bindet Dicke und Farbe der Linie an keine Variable (Jugxo B-1).
      if (typeof variant.underline === "boolean") {
        write(label, "textDecoration", variant.underline ? "UNDERLINE" : "NONE");
      }
      labels.push(label);
      // Only values from the plan (F13): every owned property neutral first — Figma's white fill,
      // its clipping and its line would otherwise cover what the plan draws.
      const frames = [node, ring, gap, control]
        .concat(field ? [field] : [])
        .concat(column ? [column] : [])
        .concat(indicator ? [indicator] : []);
      for (const frame of frames) own(frame, NEUTRAL);
      for (const each of texts) own(each, NEUTRAL_TEXT);
      // Layout before any measure is bound: padding, gap and minimum sizes only take effect on
      // an auto-layout frame (F11). The variant, ring and gap wrap their content.
      for (const frame of [node, ring, gap]) own(frame, HUG_LAYOUT);
      if (field) own(field, isToggle ? TOGGLE_LAYOUT : FIELD_LAYOUT);
      own(control, CONTROL_LAYOUT);
      if (isToggle) {
        // The knob stands where the variant says (D-04), along the writing direction; the border
        // of the track takes its room, as on the web (box-sizing border-box): the track is the
        // knob plus its border, its width at least box.width.
        own(control, {
          primaryAxisAlignItems: variant.position === "end" ? "MAX" : "MIN",
          strokesIncludedInLayout: true,
        });
        own(indicator, INDICATOR_LAYOUT);
        // A part the variant does not draw (Spec 010 ②, D-09: the check mark of an unticked box)
        // keeps its place and is not seen.
        own(indicator, { opacity: (variant.hidden || []).indexOf("indicator") === -1 ? 1 : 0 });
      }
      // The chevron keeps its bound size beside the text (D-07), as the knob does in its track.
      if (fieldSign) own(indicator, INDICATOR_LAYOUT);
      if (column) {
        own(column, TEXTS_LAYOUT);
        // The box stands at the first line of its label (D-09), as on the web.
        own(field, { counterAxisAlignItems: "MIN" });
      }
      if (mark) own(mark, MARK_NEUTRAL);
      // The variant lies in the grid's flow, its parts in the variant's (F14).
      for (const child of frames.concat(texts)) own(child, IN_FLOW);
      for (const each of texts) own(each, TEXT_SIZING);
      const nodes = { "focus-ring": ring, "focus-gap": gap, control, label };
      if (field) nodes.field = field;
      if (indicator) nodes.indicator = indicator;
      if (mark) nodes.mark = mark;
      if (textNode) nodes.text = textNode;
      if (help) nodes.help = help;
      if (error) nodes.error = error;
      const measures = bind(nodes, variant, variables, component.structure);
      // Der Radius des Rings und seines Abstands wird gebunden, nicht eingetragen (F32): als Zahl
      // stand er in jedem Modus gleich und umschloss in einer Marke mit Radius 0 einen eckigen
      // Knopf rund. Er geht denselben Weg wie die übrigen Maße, also nach dem Layout.
      for (const part of ["focus-ring", "focus-gap"]) {
        const variable = variables.get((variant.radii || {})[part]);
        const target = part === "focus-ring" ? ring : gap;
        if (variable !== undefined) {
          measures.push({ node: target, field: "cornerRadius", variable: variable });
        }
      }
      // Everything gathered is written once, layout before the parts inside it; the measures
      // are bound after that, when every frame has its layout.
      for (const each of frames.concat(texts).concat(mark ? [mark] : [])) flush(each);
      // A font binding is the one Figma may refuse — when a font of some mode is missing, the
      // file cannot show it (F30). Refused is no reason to stop: the label keeps the written font
      // of the base combination, and the run says which binding did not take.
      bindMeasures(measures, report, component, variant);
      if (existing === undefined) made.push(node);
    }
    if (set === undefined) {
      set = create(() => figma.combineAsVariants(made, figma.currentPage));
      madeThisRun.set(component.set, set);
      write(set, "name", component.set);
    }
    // The purpose of the Uzo as the set's description (Spec 007 T028): one line, written only
    // when it does not hold yet, like every other field. Gemessen 2026-10-12 (f10b-5, Befund
    // B1): description und descriptionMarkdown sind in Figma ein Feld. Trägt der Plan Markdown
    // (T029), steht der Zweck als dessen erste Zeile, und nur das Markdown wird geschrieben;
    // sonst schriebe jeder Lauf erst den Zweck, dann das Markdown darüber.
    if (typeof component.description === "string" && component.uzo === undefined) {
      write(set, "description", component.description);
    }
    // Beyond the purpose (Spec 007 T029, Art. VI): the boundaries, slot rules and text rules are
    // tried on the field the plan names, and the answer is measured, not assumed. A refusal is
    // reported with the tool's own words as an open Manko per part; an acceptance as closed.
    if (component.uzo !== undefined) {
      try {
        write(set, component.uzo.field, component.uzo.markdown);
        report.uzo = {
          field: component.uzo.field,
          parts: component.uzo.parts.slice(),
          status: "closed",
          evidence: component.uzo.field + " accepted the Markdown of the Uzo (" +
            component.uzo.markdown.length + " characters); carried as words, not enforced.",
        };
      } catch (error) {
        report.uzo = {
          field: component.uzo.field,
          parts: component.uzo.parts.slice(),
          status: "open",
          evidence: String(error && error.message ? error.message : error),
        };
        // Refused: the purpose still has to stand, so the plain description carries it (T028).
        if (typeof component.description === "string") {
          write(set, "description", component.description);
        }
      }
    }
    // Das Set steht in keinem eigenen Modus (F35). Gemessen trug es nach zwei Läufen
    // { aspekto: ekzemplo, contrast: default }: Wer die Bibliothek öffnet, sähe die Beispielmarke
    // als „den" Knopf, und zwei Läufe läsen ihre Werte in verschiedenen Kontexten. Ohne eigenen
    // Modus folgt es dem Standard jeder Sammlung — dem, was das Modelo als Standard nennt (F19).
    const leftModes = [];
    for (const collection of collectionIndex) {
      let before;
      try {
        before = (set.explicitVariableModes || {})[collection.id];
      } catch (error) {
        before = undefined;
      }
      if (before === undefined) continue;
      const mode = collection.modes.filter((candidate) => candidate.modeId === before)[0];
      leftModes.push(collection.name + "=" + ((mode && mode.name) || before));
      if (typeof set.clearExplicitVariableModeForCollection === "function") {
        set.clearExplicitVariableModeForCollection(collection);
      }
    }
    report.modes = { cleared: leftModes.sort(), set: modesOfNode(set) };
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
        gather(set).fills = [bound];
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
    flush(set);
    stamp(set, "ero", component.set);
    stamp(set, "skemo", component.pluginData.fundamento.skemo);
    stamp(set, "version", component.pluginData.fundamento.version);
    stamp(set, "build", BUILD);
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
      else if (definitions[key].defaultValue !== spec.defaultValue) {
        set.editComponentProperty(key, { defaultValue: spec.defaultValue });
      }
      for (const label of labels) {
        write(label, "characters", spec.defaultValue);
        // Merged: a text may carry a visibility reference too (Spec 011 ④: the caption).
        write(label, "componentPropertyReferences", Object.assign({}, label.componentPropertyReferences || {}, { characters: key }));
      }
    }
    // A boolean prop that shows a part (Spec 011 ③, plan ③ D-14: dismissible) is a BOOLEAN
    // property of the set, declared once like the label, its default the Skemo's; the part's
    // visibility is connected to it, so an instance switches the part on and off. A prop that
    // hides the part (Spec 011 ④, plan ④ D-14: caption-hidden) is declared the other way round —
    // Figma shows a layer when its property is true, and the connection cannot be inverted — as
    // the part's name (\`caption\`), true where the prop's default is false.
    for (const toggle of component.toggles || []) {
      const hides = toggle.hides === true;
      const name = hides ? toggle.part : toggle.property;
      const shown = hides ? !toggle.defaultValue : toggle.defaultValue;
      const definitions = set.componentPropertyDefinitions || {};
      let key = Object.keys(definitions).find(
        (candidate) =>
          candidate.split("#")[0] === name && definitions[candidate].type === "BOOLEAN",
      );
      if (key === undefined) key = set.addComponentProperty(name, "BOOLEAN", shown);
      else if (definitions[key].defaultValue !== shown) {
        set.editComponentProperty(key, { defaultValue: shown });
      }
      for (const each of toggled) {
        if (each.part !== toggle.part) continue;
        write(each.node, "visible", shown);
        write(each.node, "componentPropertyReferences", Object.assign({}, each.node.componentPropertyReferences || {}, { visible: key }));
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
    // Where the set lies (F-8): in the frame Eroj, placed by Figma's auto-layout.
    report.placement = placeSet(frame, set, component.set, madeThisRun.get(component.set) === set);
    // The example frame of a dialog beside its set (Spec 011 ②).
    if (component.example !== undefined) {
      report.example = await placeExample(frame, set, component, report);
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
    stamp(set, "after", JSON.stringify(report.after));
    reports.push(report);
  }
  fitSection(section);
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

/** The variable of an id, for resolving what a bound paint really shows (F34). */
function variableById(id) {
  const found = (variableIndex || []).filter((variable) => variable.id === id);
  return found.length === 1 ? found[0] : undefined;
}

/** Every variable of the run, by the time the report is written. */
let variableIndex = [];

/**
 * The modes a node stands in, by collection name (F34, F35). Jeder Abschnitt des Berichts, der
 * Werte nennt, nennt auch den Kontext, in dem sie gelten — ohne ihn ist eine Farbe eine Zahl ohne
 * Aussage.
 */
function modesOfNode(node) {
  const out = { own: {}, standing: {} };
  const name = {};
  for (const collection of collectionIndex || []) {
    name[collection.id] = collection.name;
    for (const mode of collection.modes) name[mode.modeId] = mode.name;
  }
  const label = (modes) => {
    const named = {};
    for (const [collection, mode] of Object.entries(modes || {})) {
      named[name[collection] || collection] = name[mode] || mode;
    }
    return named;
  };
  try {
    out.own = label(node.explicitVariableModes);
    out.standing = label(node.resolvedVariableModes);
  } catch (error) {
    out.own = "wirft: " + String(error && error.message ? error.message : error);
  }
  return out;
}

/** Every collection of the run, for naming the modes a node stands in. */
let collectionIndex = [];

function measureLayout(set, component) {
  const nodes = component.variants
    .map((variant) => ours(set, "variant", variantName(variant.props)))
    .filter((node) => node !== undefined);
  const boxes = nodes.map((node) => {
    // The content of a variant: its ring, the surface of a dialog (Spec 011 ②), the control
    // directly under it (Spec 011 ③: badge, notice, state; Spec 011 ④: meter), the region of a
    // table or the list of a list (Spec 011 ④).
    const content =
      ours(node, "part", "focus-ring") || ours(node, "part", "surface") || ours(node, "part", "control") ||
      ours(node, "part", "region") || ours(node, "part", "list");
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
  /**
   * The paints of a node (F22), as the node really shows them (F34). Ein gebundener Paint behält
   * die Farbe, mit der er zuletzt geschrieben wurde, und eine Deckkraft von sich aus; beide
   * zusammen abgelesen ergeben ein Paar, das kein Modus zeigt — gemessen: derselbe Knoten meldete
   * in zwei Läufen 0 und 1, und "#000000 α1" gibt es in keiner Kombination. Gemeldet wird deshalb
   * der aufgelöste Wert für diesen Knoten; was die Datei roh hält, steht daneben unter "stored".
   */
  const paintsOf = (node) => {
    const list = (field) => {
      let paints;
      try {
        paints = node[field];
      } catch (error) {
        return ["wirft: " + String(error && error.message ? error.message : error)];
      }
      return (Array.isArray(paints) ? paints : []).map((paint) => {
        const bound =
          paint.boundVariables && paint.boundVariables.color ? paint.boundVariables.color : undefined;
        const variable = bound === undefined ? undefined : variableById(bound.id);
        const shown =
          variable === undefined || typeof variable.resolveForConsumer !== "function"
            ? undefined
            : variable.resolveForConsumer(node).value;
        const color = shown === undefined ? paint.color : { r: shown.r, g: shown.g, b: shown.b };
        const opacity =
          shown !== undefined && typeof shown.a === "number"
            ? shown.a
            : typeof paint.opacity === "number"
              ? paint.opacity
              : 1;
        return {
          type: paint.type,
          color: color,
          opacity: opacity,
          resolved: shown !== undefined,
          stored: {
            color: paint.color,
            opacity: typeof paint.opacity === "number" ? paint.opacity : 1,
          },
          visible: paint.visible !== false,
          variable: bound === undefined ? null : bound.name || bound.id,
        };
      });
    };
    return { fills: list("fills"), strokes: list("strokes"), modes: modesOfNode(node) };
  };
  // The parts of a variant by name (F-4): a control is variant → ring → gap → control → label; a
  // field puts a frame in between and holds the label, help and error beside the ring, the text
  // inside the control.
  const partNodes = (node) => {
    const found = {};
    const field = ours(node, "part", "field");
    if (field !== undefined) found.field = field;
    // A choice (Spec 010 ③, D-07): the ring stands in the row of the first option.
    const list = field === undefined ? undefined : ours(field, "part", "options");
    const row = list === undefined ? undefined : ours(list, "part", "option-1");
    if (list !== undefined) found.options = list;
    if (row !== undefined) found.option = row;
    const base = row || field || node;
    const ring = ours(base, "part", "focus-ring");
    if (ring !== undefined) found["focus-ring"] = ring;
    const gap = ring === undefined ? undefined : ours(ring, "part", "focus-gap");
    if (gap !== undefined) found["focus-gap"] = gap;
    const control = gap === undefined ? undefined : ours(gap, "part", "control");
    if (control !== undefined) found.control = control;
    const label = control === undefined ? undefined : ours(field || control, "part", "label");
    if (label !== undefined) found.label = label;
    if (row !== undefined) {
      const optionLabel = ours(row, "part", "option-label");
      if (optionLabel !== undefined) found["option-label"] = optionLabel;
    }
    if (field !== undefined) {
      for (const name of ["text", "help", "error"]) {
        const holder = name === "text" ? control : field;
        const each = holder === undefined ? undefined : ours(holder, "part", name);
        if (each !== undefined) found[name] = each;
      }
    }
    // A dialog (Spec 011 ②): the surface and its parts; the reason field inside the content.
    const surface = ours(node, "part", "surface");
    if (surface !== undefined) {
      found.surface = surface;
      for (const name of ["heading", "message", "content", "actions"]) {
        const each = ours(surface, "part", name);
        if (each !== undefined) found[name] = each;
      }
      const reasonField = found.content === undefined ? undefined : ours(found.content, "part", "reason-field");
      if (reasonField !== undefined) found["reason-field"] = reasonField;
    }
    // A badge, a notice and a state (Spec 011 ③): the control directly under the variant with its
    // parts; the texts of a notice in their column.
    const direct = ours(node, "part", "control");
    if (direct !== undefined && found.control === undefined) {
      found.control = direct;
      // Spec 011 ④: the label, track and value text of a meter, the fill in its track.
      for (const name of ["text", "indicator", "texts", "actions", "dismiss", "label", "track", "value-text"]) {
        const each = ours(direct, "part", name);
        if (each !== undefined) found[name] = each;
      }
      for (const name of ["heading", "message", "details", "actions"]) {
        const each = found.texts === undefined ? undefined : ours(found.texts, "part", name);
        if (each !== undefined) found[name] = each;
      }
      const fill = found.track === undefined ? undefined : ours(found.track, "part", "fill");
      if (fill !== undefined) found.fill = fill;
      // Spec 011 ⑤: the first entry of a navigation or a tab list with its ring, its keyed
      // frame (item-1, tab-1) and its text; the panel of a tab list beside the control.
      const entry = ours(direct, "part", "entry-1");
      if (entry !== undefined) {
        found.entry = entry;
        const entryRing = ours(entry, "part", "focus-ring");
        if (entryRing !== undefined) found["focus-ring"] = entryRing;
        const entryGap = entryRing === undefined ? undefined : ours(entryRing, "part", "focus-gap");
        if (entryGap !== undefined) {
          found["focus-gap"] = entryGap;
          for (const name of ["item-1", "tab-1"]) {
            const keyed = ours(entryGap, "part", name);
            if (keyed === undefined) continue;
            found[name] = keyed;
            const word = ours(keyed, "part", name === "item-1" ? "items-1" : "tabs-1");
            if (word !== undefined) found[name === "item-1" ? "items-1" : "tabs-1"] = word;
          }
        }
      }
      const panel = ours(node, "part", "panel");
      if (panel !== undefined) found.panel = panel;
    }
    // A table (Spec 011 ④): the caption and the region with its head; the sort button with its
    // ring in the head cell that holds one.
    const region = ours(node, "part", "region");
    if (region !== undefined) {
      found.region = region;
      const caption = ours(node, "part", "caption");
      if (caption !== undefined) found.caption = caption;
      const tableHead = ours(region, "part", "head");
      if (tableHead !== undefined) {
        found.head = tableHead;
        for (const cell of tableHead.children) {
          const sortRing = ours(cell, "part", "focus-ring");
          if (sortRing === undefined) continue;
          found["focus-ring"] = sortRing;
          const sortGap = ours(sortRing, "part", "focus-gap");
          if (sortGap !== undefined) found["focus-gap"] = sortGap;
          const sort = sortGap === undefined ? undefined : ours(sortGap, "part", "sort");
          if (sort !== undefined) found.sort = sort;
          const sortIndicator = sort === undefined ? undefined : ours(sort, "part", "sort-indicator");
          if (sortIndicator !== undefined) found["sort-indicator"] = sortIndicator;
        }
      }
    }
    // A list (Spec 011 ④): the list and its first entry.
    const listNode = ours(node, "part", "list");
    if (listNode !== undefined) {
      found.list = listNode;
      const entry = ours(listNode, "part", "entry-1");
      if (entry !== undefined) found.entry = entry;
    }
    return found;
  };
  const paintedParts = (node) => {
    if (node === undefined) return {};
    const out = { variant: paintsOf(node) };
    for (const [name, each] of Object.entries(partNodes(node))) out[name] = paintsOf(each);
    return out;
  };
  const partsOf = (node) => {
    if (node === undefined) return {};
    const out = { variant: held(node, HELD_AT_PART) };
    for (const [name, each] of Object.entries(partNodes(node))) out[name] = held(each, HELD_AT_PART);
    return out;
  };
  // The set against the extent of its children (F20), raw: measured in Figma, a set of 518 × 688
  // ended before its last column and its last row. Geometry, not the properties that were set.
  const all = set.children.map((child) => ({
    name: child.name, x: child.x, y: child.y, width: child.width, height: child.height,
  }));
  const bounds = {
    minX: Math.min(...all.map((box) => box.x)),
    minY: Math.min(...all.map((box) => box.y)),
    maxX: Math.max(...all.map((box) => box.x + box.width)),
    maxY: Math.max(...all.map((box) => box.y + box.height)),
  };
  const padRight = typeof set.paddingRight === "number" ? set.paddingRight : 0;
  const padBottom = typeof set.paddingBottom === "number" ? set.paddingBottom : 0;
  const outside = all
    .filter((box) => box.x < 0 || box.y < 0 ||
      box.x + box.width + padRight > set.width || box.y + box.height + padBottom > set.height)
    .map((box) => box.name);
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
    paints: { set: paintsOf(set), variant: paintedParts(first), last: paintedParts(last) },
    set: { width: set.width, height: set.height },
    unplaced: unplaced,
    uneven: uneven,
    bounds: bounds,
    outside: outside,
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
  if (layout.outside.length > 0) {
    out.push(
      report.set + ": " + layout.outside.length + " von " + layout.variants +
        " Varianten liegen außerhalb des Sets oder in seinem Innenabstand, z. B. " +
        layout.outside[layout.outside.length - 1] + "; " + set + ", die Kinder reichen bis " +
        px(layout.bounds.maxX) + " × " + px(layout.bounds.maxY) + ".",
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

/**
 * What the run has done so far: printed whole when the run fails, so the console shows the report
 * up to the point of the abort and not only "Error" (F21).
 */
const progress = { build: BUILD, phase: "start", collections: 0, variables: 0, components: [], warnings: [] };

/**
 * Applies the whole plan; safe to run again. Returns the report of this run (F10). A run that would
 * create a variant in a set it found throws before its first write (F10c), unless
 * \`options.createInFoundSet\` is true — the maintainer's deliberate choice, off by default.
 */
async function applyPlan(options) {
  const createInFoundSet = options != null && options.createInFoundSet === true;
  progress.phase = "check";
  // Zuerst die Waisen (F-B): Eine lose Variante trägt \`ero\` wie das Set und würde sonst unten für
  // das Set gehalten.
  const orphans = orphansOnPage();
  if (orphans.length > 0) throw orphanError(orphans);
  const blocked = creationsInFoundSets();
  if (blocked.length > 0 && !createInFoundSet) throw abortError(blocked);
  // A variable the file holds in another collection than the plan puts it in: abort, nothing
  // written (Sammlung gewechselt). Read here, before the first write, like the two aborts above.
  const { switched, empty } = await readCollections();
  if (switched.length > 0) throw switchError(switched);
  recordStart();
  progress.phase = "collections";
  const { collections, modeIds, warnings: modeWarnings, modes } = await applyCollections();
  progress.collections = collections.size;
  progress.phase = "variables";
  const variables = await applyVariables(collections, modeIds);
  progress.variables = variables.size;
  // The report resolves what a paint shows and names the modes it read in (F34): both need the
  // file's variables and collections, and both exist only now.
  variableIndex = [...variables.values()];
  collectionIndex = [...collections.values()];
  progress.warnings = [...modeWarnings];
  progress.phase = "components";
  const warnings = [...modeWarnings];
  const components = await applyComponents(variables, warnings);
  progress.phase = "done";
  for (const report of components) {
    report.nodes.end = nodesAtEnd(report.set);
    report.lost = lostSince(report.set);
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
          ". Der Abbruch (F10c) war bewusst aufgehoben.",
      );
    }
    if (report.diagnosis !== "") warnings.push(report.set + ": " + report.diagnosis);
    // Laut, auch wenn der Lauf sonst sauber ist (F10d): ein verschwundener Knoten ist ein Befund.
    if (report.lost.length > 0) {
      warnings.push(
        report.set + ": " + report.lost.length + " von " + report.nodes.start +
          " Knoten, die beim Start im Set waren, fehlen am Ende: " +
          report.lost
            .map((node) =>
              node.id + " " + node.type + " „" + node.name + "“ – " +
              (node.removed
                ? "entfernt"
                : "aus dem Set verdrängt nach " + node.parent.type + " " + node.parent.id),
            )
            .join("; ") +
          ". Das Plugin entfernt nichts; das hat Figma getan.",
      );
    }
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
    build: BUILD,
    collections: PLAN.collections.length,
    modes: modes,
    // Collections of the plan that stand empty in the file: reported, never removed.
    empty: empty,
    variables: variables.size,
    // Found or created, and which sets the run moved in from the page (F-2).
    section: sectionReport,
    components: components,
    warnings: warnings,
    mankoj: mankojOf(components),
  };
}

/**
 * The Mankoj of this run (Spec 007 T029, like Spec 005 A6): per component and part of the Uzo
 * the plugin tried, whether the tool took the field (closed) or refused it (open), with its words.
 */
function mankojOf(components) {
  const open = [];
  const closed = [];
  for (const report of components) {
    if (report.uzo === undefined) continue;
    for (const part of report.uzo.parts) {
      (report.uzo.status === "open" ? open : closed).push({
        set: report.set,
        part: part,
        field: report.uzo.field,
        evidence: report.uzo.evidence,
      });
    }
  }
  return { open: open, closed: closed };
}

const PART_LIMIT = 3900;

/** Splits a list into JSON lines below the limit; each line names the part and its slice. */
function partsOfList(set, part, list) {
  const out = [];
  let from = 0;
  while (from < list.length) {
    let to = list.length;
    let text = JSON.stringify({ set, part, from, to, items: list.slice(from, to) });
    while (text.length > PART_LIMIT && to - from > 1) {
      to = from + Math.max(1, Math.floor((to - from) / 2));
      text = JSON.stringify({ set, part, from, to, items: list.slice(from, to) });
    }
    out.push(text);
    from = to;
  }
  return out;
}

/** Mankoj grouped by field, then set: { descriptionMarkdown: { butono: ["boundary", …] } }. */
function groupedMankoj(list) {
  const out = {};
  for (const { set, part, field } of list) {
    const byField = out[field] || (out[field] = {});
    (byField[set] || (byField[set] = [])).push(part);
  }
  return out;
}

/** The report as JSON lines under the limit (F22): headline, then per component its parts. */
function reportParts(result) {
  const lines = [
    JSON.stringify({
      fundamento: result.fundamento,
      build: result.build,
      collections: result.collections,
      modes: result.modes,
      empty: result.empty,
      variables: result.variables,
      section: result.section,
      warnings: result.warnings,
      components: result.components.map((report) => ({
        set: report.set,
        found: report.found,
        planned: report.planned,
        created: report.created.length,
        updated: report.updated.length,
        missing: report.missing.length,
        extra: report.extra.length,
        duplicates: report.duplicates.length,
        lost: report.lost.length,
        placement: report.placement,
      })),
    }),
    // The Mankoj by set, part and field; their evidence, the tool's words, stands in the part
    // state of each set (uzo.evidence). Spec 010 ①: with four sets the evidence of twelve parts
    // no longer fit the headline of 4 000 characters (F22). Spec 010 ③: with six sets the list
    // of eighteen objects did not either; grouped by field and set, the same names. Spec 010 ④
    // (plan ④ D-07, ③ B-5): with seven sets the headline grew to 4 094 characters; the modes each
    // set was found and left in moved to its part state, under the same name. Spec 011 ④ (plan
    // ④ D-14): with fifteen sets the headline grew to 4 398 characters; the Mankoj are a part of
    // their own right after it, under the same name. Spec 011 ⑤: with seventeen sets it grew to
    // 4 080 characters; the diagnosis of each set moved to its part state, under the same name
    // (the returned report keeps it where it was).
    JSON.stringify({
      part: "mankoj",
      value: {
        open: groupedMankoj(result.mankoj.open),
        closed: groupedMankoj(result.mankoj.closed),
      },
    }),
  ];
  for (const report of result.components) {
    // What the headline leaves out of a set (Spec 009: three sets no longer fit one line of
    // 4 000): how it was found and left, its fonts and its Uzo, one part per set.
    lines.push(
      JSON.stringify({
        set: report.set,
        part: "state",
        value: {
          nodes: report.nodes,
          before: report.before,
          after: report.after,
          left: report.left,
          diagnosis: report.diagnosis,
          modes: report.modes,
          fonts: report.fonts,
          uzo: report.uzo,
          // Spec 011 ②: the shadow of a dialog's surface (bound or written) and its example frame.
          shadow: report.shadow,
          example: report.example,
        },
      }),
    );
    for (const part of ["created", "updated", "missing", "extra", "duplicates", "lost"]) {
      if (report[part].length > 0) lines.push(...partsOfList(report.set, part, report[part]));
    }
    if (report.layout !== undefined) {
      const layout = Object.assign({}, report.layout);
      const held = layout.held;
      const paints = layout.paints;
      delete layout.held;
      delete layout.paints;
      for (const [part, value] of [["layout", layout], ["held", held], ["paints", paints]]) {
        if (value === undefined) continue;
        const text = JSON.stringify({ set: report.set, part, value });
        if (text.length <= PART_LIMIT) {
          lines.push(text);
          continue;
        }
        for (const [key, entry] of Object.entries(value)) {
          const line = JSON.stringify({ set: report.set, part: part + "." + key, value: entry });
          // A choice holds more parts per variant (Spec 010 ③): a part still too long is split
          // once more, by its parts, under the same names.
          if (line.length <= PART_LIMIT || typeof entry !== "object" || entry === null) {
            lines.push(line);
            continue;
          }
          for (const [inner, held] of Object.entries(entry)) {
            lines.push(
              JSON.stringify({ set: report.set, part: part + "." + key + "." + inner, value: held }),
            );
          }
        }
      }
    }
  }
  return lines;
}

/** One place for the report: everything in the console, the headline in the toast (F10). */
function announce(result) {
  // One string per line, JSON, in parts under 4 000 characters: an object viewer folds and cuts
  // what is copied (F21), and Figma cuts a copied line at 5 000 characters (F22). The headline
  // with the numbers and the warnings comes first; the lists and the layout follow, each its own
  // part, long lists split.
  console.log(WHO + " – Bericht in Teilen (JSON, je eine Zeile):");
  for (const part of reportParts(result)) console.log(part);
  const counted = result.components
    .map((report) =>
      report.set + " " + report.created.length + " neu, " + report.updated.length + " aktualisiert",
    )
    .join("; ");
  const headline =
    result.warnings.length === 0
      ? WHO + ": " + result.variables + " Variablen, " + counted + "."
      : WHO + ": " + result.warnings.length +
        " Warnung(en) — " + result.warnings.join(" | ");
  figma.notify(
    headline + " Der ganze Bericht steht in der Konsole.",
    result.warnings.length === 0 ? undefined : { error: true, timeout: 10000 },
  );
}

if (typeof figma !== "undefined" && typeof figma.closePlugin === "function" && figma.command !== undefined) {
  applyPlan({ createInFoundSet: figma.command === LIFT_COMMAND })
    .then((result) => {
      announce(result);
      figma.closePlugin();
    })
    // A rejection used to disappear: no toast, no console, a plugin that seemed to do nothing.
    .catch((error) => {
      // Message, stack and the report up to the abort, each as one string (F21): "Error" alone
      // said nothing, and the folded report was cut when copied.
      const message = String(error && error.message ? error.message : error);
      // The abort of F10c is no failure: nothing was written, and what would have been is named,
      // as JSON lines under the limit like every report (F22).
      if (error && error.abort !== undefined) {
        console.error(WHO + " – " + message);
        if (error.abort.orphans !== undefined) {
          for (const line of partsOfList("", "orphans", error.abort.orphans)) console.error(line);
        }
        // Sammlung gewechselt: every variable with the collection it lies in and the planned one.
        if (error.abort.switched !== undefined) {
          for (const line of partsOfList("", "switched", error.abort.switched)) console.error(line);
        }
        for (const entry of error.abort.sets || []) {
          const before = Object.assign({}, entry.before, { unmarked: entry.before.unmarked.length });
          const head = Object.assign({}, entry, { before, wouldCreate: entry.wouldCreate.length });
          console.error(JSON.stringify(head));
          for (const part of ["unmarked", "wouldCreate"]) {
            const list = part === "unmarked" ? entry.before.unmarked : entry.wouldCreate;
            for (const line of partsOfList(entry.set, part, list)) console.error(line);
          }
        }
        figma.notify(WHO + ": " + message, { error: true, timeout: 10000 });
        figma.closePlugin();
        return;
      }
      console.error(WHO + " – Lauf fehlgeschlagen in Phase " + progress.phase + ": " + message);
      console.error(String(error && error.stack ? error.stack : "(kein Stack)"));
      // Auch ein abgebrochener Lauf sagt, was bis dahin aus dem Set verschwunden ist (F10d).
      try {
        progress.lost = [...seenAtStart.keys()].flatMap((name) =>
          lostSince(name).map((node) => Object.assign({ set: name }, node)),
        );
      } catch (lostError) {
        progress.lost = "nicht messbar: " + String(lostError && lostError.message ? lostError.message : lostError);
      }
      console.error(JSON.stringify(progress));
      figma.notify(
        WHO + ": Lauf fehlgeschlagen — " + String(error && error.message ? error.message : error) +
          ". Einzelheiten in der Konsole.",
        { error: true, timeout: 10000 },
      );
      figma.closePlugin();
    });
}
`;
}

/**
 * `manifest.json` of the development plugin. The build is in its name, so the menu shows which
 * state is imported before anything runs.
 */
export function pluginManifest(plan: FigmaPlan, build: string = UNKNOWN_BUILD): string {
  return `${JSON.stringify(
    {
      name: `Fundamento ${plan.fundamento} (${build}): apply plan`,
      id: "fundamento-apply-plan",
      api: "1.0.0",
      main: "code.js",
      editorType: ["figma"],
      documentAccess: "dynamic-page",
      menu: [
        { name: "Plan anwenden", command: APPLY_COMMAND },
        { name: LIFT_MENU_NAME, command: LIFT_COMMAND },
      ],
      networkAccess: { allowedDomains: ["none"] },
    },
    null,
    2,
  )}\n`;
}
