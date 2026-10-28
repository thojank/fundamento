// listelektilo ↔ Selector mit Symbol und Beschreibung je Option (variant input; Abgleich ②a):
// deaktiviert, nur lesbar, ungültig (status error mit Meldung). Fundamento hat keine Größe (Fonto
// md). Die Liste steht im geschlossenen Popover der Fonto und wird ohne Größe gemessen; die
// Optionen der Fonto haben keine Mindesthöhe (0px, Höhe aus Innenabstand und Zeile): nicht gemessen.
const KEIN = "[data-kein-gegenstueck]";
const text = "div[data-variant] > button > span:last-child";
// Eine nicht gewählte Option: die gewählte zeichnet die Fonto invers (Schrift weiß auf der Aktion).
const option = "div[popover] [role=option]:not([aria-selected=true])";
export default {
  ero: "listelektilo",
  quelle: {
    Selector: "packages/core/src/Selector/Selector.tsx",
    SelectorOption: "packages/core/src/Selector/SelectorOption.tsx",
    selectorPresentation: "packages/core/src/Selector/selectorPresentation.stylex.ts",
  },
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    focus: { interago: "focus" },
    disabled: { fm: { disabled: "" }, fonto: { isDisabled: true } },
    readonly: { fm: { readonly: "" }, fonto: { isReadOnly: true } },
    invalid: {
      fm: { invalid: "" },
      fonto: {
        status: { type: "error", message: "Wähle eine Region." },
        statusVariant: "detached",
      },
    },
  },
  fm: {
    tag: "fm-listelektilo",
    attrs: { value: "eu", required: "" },
    inner: ({ state }) =>
      `Region<data slot="options" value="eu" icon="info" description="27 Staaten">Europa</data><data slot="options" value="us" description="50 Staaten">USA</data><data slot="options" value="br">Brasilien</data><span slot="help">Die Region des Standards.</span>${state === "invalid" ? '<span slot="error">Wähle eine Region.</span>' : ""}`,
  },
  fonto: {
    comp: "Selector",
    props: {
      label: "Region",
      description: "Die Region des Standards.",
      isRequired: true,
      value: "eu",
      options: [
        { value: "eu", label: "Europa", description: "27 Staaten", icon: "info" },
        { value: "us", label: "USA", description: "50 Staaten" },
        { value: "br", label: "Brasilien" },
      ],
    },
  },
  teile: {
    control: {
      "": "div[data-variant]",
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
      "max-block-size": "div[popover] [role=listbox]",
      "max-inline-size": KEIN,
      "z-index": KEIN,
    },
    item: {
      "": option,
      "min-block-size": KEIN,
      color: `${option} [data-density] > span:last-child > span:first-child`,
    },
    icon: `${option} [data-density] > span:first-child > span[aria-hidden]`,
    description: `${option} [data-density] > span:last-child > span:nth-child(2)`,
    label: "label",
    "required-mark": "label > span",
    help: "label + span",
    error: "div[data-type=error] > span > span:last-child",
  },
  ziel: { fm: '[part="control"]', fonto: "div[data-variant] > button" },
  breite: 280,
};
