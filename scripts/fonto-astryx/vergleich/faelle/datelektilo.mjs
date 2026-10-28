// datelektilo ↔ DateInput (mode single) und DateRangeInput (mode range) (Abgleich ②a): deaktiviert,
// ungültig (status error mit Meldung). Fundamento hat keine Größe (Fonto md); nur lesbar hat die
// Fonto nicht. Der Kalender der Fonto steht im geschlossenen Popover: Fläche, Schrift und Farben
// dort (ohne Größe); Breite des Kalenders und Maße der Monatsknöpfe an einem sichtbaren Calendar
// daneben (im Popover „auto“). Das Feld der Fonto hat keine Mindesthöhe (auto): nicht gemessen.
const KEIN = "[data-kein-gegenstueck]";
const text = "input, div[data-size] > button:nth-of-type(2)";
const pop = "div[popover]";
const cal = ":scope > div > [data-mode]";
export default {
  ero: "datelektilo",
  quelle: {
    DateInput: "packages/core/src/DateInput/DateInput.tsx",
    DateRangeInput: "packages/core/src/DateRangeInput/DateRangeInput.tsx",
    Calendar: "packages/core/src/Calendar/Calendar.tsx",
  },
  kombinoj: [
    { fm: { mode: "single" }, fonto: {} },
    { fm: { mode: "range" }, fonto: {} },
  ],
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    focus: { interago: "focus" },
    disabled: { fm: { disabled: "" }, fonto: { isDisabled: true } },
    invalid: {
      fm: { invalid: "" },
      fonto: { status: { type: "error", message: "Pflichtfeld" }, statusVariant: "detached" },
    },
  },
  fm: {
    tag: "fm-datelektilo",
    attrs: {
      value: "2026-10-24",
      "value-start": "2026-10-06",
      "value-end": "2026-10-10",
      required: "",
    },
    inner: ({ state }) =>
      `Datum<span slot="help">Hilfe</span>${state === "invalid" ? '<span slot="error">Pflichtfeld</span>' : ""}`,
  },
  fonto: (props, { mode }) => ({
    tag: "div",
    children:
      mode === "range"
        ? [
            {
              comp: "DateRangeInput",
              props: {
                label: "Datum",
                description: "Hilfe",
                isRequired: true,
                value: { start: "2026-10-06", end: "2026-10-10" },
                ...props,
              },
            },
            {
              comp: "Calendar",
              props: { mode: "range", value: { start: "2026-10-06", end: "2026-10-10" } },
            },
          ]
        : [
            {
              comp: "DateInput",
              props: {
                label: "Datum",
                description: "Hilfe",
                isRequired: true,
                value: "2026-10-24",
                presentation: "popover",
                ...props,
              },
            },
            { comp: "Calendar", props: { value: "2026-10-24" } },
          ],
  }),
  teile: {
    control: {
      "": "div[data-size]",
      "min-block-size": KEIN,
      color: text,
      "font-family": text,
      "font-size": text,
      "font-weight": text,
      "letter-spacing": text,
      "line-height": text,
      "text-transform": text,
    },
    trigger: "div[data-size] > button:first-child",
    // Oberste Ebene ohne z-index, Höchsthöhe aus dem Viewport: nicht gemessen.
    calendar: {
      "": `${pop} > div[role=dialog]`,
      "padding-inline": `${pop} [data-mode]`,
      "inline-size": cal,
      "z-index": KEIN,
      "max-block-size": KEIN,
    },
    month: `${pop} [data-mode] > div:first-child > span`,
    prev: `${cal} button[data-nav=prev]`,
    next: `${cal} button[data-nav=next]`,
    weekday: `${pop} [role=columnheader]`,
    cell: `${pop} button[data-date]:not([data-disabled]):not([data-selected]):not([data-today])`,
    field: ":scope > div > div:first-child",
    label: "label",
    "required-mark": "label > span",
    help: "label + span",
    error: "div[data-type=error] > span > span:last-child",
  },
  ziel: {
    fm: '[part="control"]',
    fonto: "div[data-size] > input, div[data-size] > button:nth-of-type(2)",
  },
  breite: 320,
  hoehe: 380,
};
