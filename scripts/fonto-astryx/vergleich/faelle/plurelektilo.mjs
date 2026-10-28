// plurelektilo ↔ MultiSelector (variant input; Abgleich ②a): summary count ↔ triggerDisplay count
// (filterbar ↔ hasSearch), summary tags ↔ triggerDisplay badges; deaktiviert, nur lesbar, ungültig
// (status error mit Meldung). Fundamento hat keine Größe (Fonto md). Die Liste steht im
// geschlossenen Popover der Fonto und wird ohne Größe gemessen. Auslöser, Optionen und Badges der
// Fonto haben keine Mindesthöhe (auto/0px, Höhe aus Innenabstand und Zeile): nicht gemessen (KEIN).
const KEIN = "[data-kein-gegenstueck]";
const text = "div[data-variant] > button > span > span";
// Eine nicht gewählte Option: die gewählte zeichnet die Fonto invers (Schrift weiß auf der Aktion).
const option = "div[popover] [role=option]:not([aria-selected=true])";
export default {
  ero: "plurelektilo",
  quelle: {
    MultiSelector: "packages/core/src/MultiSelector/MultiSelector.tsx",
    selectorPresentation: "packages/core/src/Selector/selectorPresentation.stylex.ts",
    Badge: "packages/core/src/Badge/Badge.tsx",
  },
  kombinoj: [
    {
      fm: { summary: "count", filterable: "" },
      fonto: { triggerDisplay: "count", hasSearch: true },
    },
    { fm: { summary: "tags" }, fonto: { triggerDisplay: "badges" } },
  ],
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    focus: { interago: "focus" },
    disabled: { fm: { disabled: "" }, fonto: { isDisabled: true } },
    readonly: { fm: { readonly: "" }, fonto: { isReadOnly: true } },
    invalid: {
      fm: { invalid: "" },
      fonto: {
        status: { type: "error", message: "Wähle mindestens einen Standard." },
        statusVariant: "detached",
      },
    },
  },
  fm: {
    tag: "fm-plurelektilo",
    attrs: { values: "a11y,kontrast,fokus", required: "" },
    inner: ({ state }) =>
      `Standards<data slot="options" value="a11y">Barrierefreiheit</data><data slot="options" value="kontrast">Kontrast</data><data slot="options" value="fokus">Fokus</data><data slot="options" value="namen">Namen</data><data slot="options" value="motion">Bewegung</data><span slot="help">Die Standards, die der Nachweis erfüllt.</span>${state === "invalid" ? '<span slot="error">Wähle mindestens einen Standard.</span>' : ""}`,
  },
  fonto: {
    comp: "MultiSelector",
    props: {
      label: "Standards",
      description: "Die Standards, die der Nachweis erfüllt.",
      isRequired: true,
      value: ["a11y", "kontrast", "fokus"],
      options: [
        { value: "a11y", label: "Barrierefreiheit" },
        { value: "kontrast", label: "Kontrast" },
        { value: "fokus", label: "Fokus" },
        { value: "namen", label: "Namen" },
        { value: "motion", label: "Bewegung" },
      ],
    },
  },
  teile: {
    control: {
      "": "div[data-variant]",
      "min-block-size": KEIN,
      color: text,
      "font-family": text,
      "font-size": text,
      "font-weight": text,
      "letter-spacing": text,
      "line-height": text,
      "text-transform": text,
    },
    text,
    indicator: "span[data-state]",
    // Die Fläche ist das div im Popover, die Höchsthöhe trägt die scrollende Liste darin; das
    // Popover liegt in der obersten Ebene (kein z-index), seine Höchstbreite folgt dem Viewport.
    listbox: {
      "": "div[popover] > div",
      "max-block-size": "div[popover] div:has(> [role=listbox])",
      "max-inline-size": KEIN,
      "z-index": KEIN,
    },
    item: { "": option, "min-block-size": KEIN, color: `${option} > span` },
    check: `${option} span[data-checked]`,
    // Die Schlagwörter sind die Badges im Auslöser (nur triggerDisplay badges), gemessen der Abstand.
    tags: "span:has(> span[data-variant])",
    label: "label",
    "required-mark": "label > span",
    help: "label + span",
    error: "div[data-type=error] > span > span:last-child",
  },
  ziel: { fm: '[part="control"]', fonto: "div[data-variant] > button" },
  breite: 320,
};
