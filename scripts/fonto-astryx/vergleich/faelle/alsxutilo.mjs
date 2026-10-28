// alsxutilo ↔ FileInput (Abgleich ②a): dropzone aus ↔ mode input, dropzone an ↔ mode dropzone;
// deaktiviert, ungültig (status error mit Meldung). Keine Größen auf beiden Seiten. dragover ist
// keine Interaktion des Vergleichs; gewählte Dateien (File-Objekte) lassen sich nicht übergeben.
export default {
  ero: "alsxutilo",
  quelle: { FileInput: "packages/core/src/FileInput/FileInput.tsx" },
  kombinoj: [
    { fm: {}, fonto: { mode: "input" } },
    { fm: { dropzone: "" }, fonto: { mode: "dropzone" } },
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
    tag: "fm-alsxutilo",
    attrs: { accept: ".pdf,.png", "max-size": "5000000", required: "" },
    inner: ({ state }) =>
      `Dateien<span slot="help">PDF oder PNG, höchstens 5 MB</span>${state === "invalid" ? '<span slot="error">Pflichtfeld</span>' : ""}`,
  },
  fonto: {
    comp: "FileInput",
    props: {
      label: "Dateien",
      description: "PDF oder PNG, höchstens 5 MB",
      accept: ".pdf,.png",
      maxSize: 5000000,
      isRequired: true,
      value: null,
    },
  },
  teile: {
    dropzone: "div[data-mode]",
    // Der Hinweis ist der Text in der Ablagefläche (nur mode dropzone; im Feld ist es die Beschriftung).
    "drop-hint": "div[data-mode=dropzone] > span:last-child",
    control: "div[data-mode]",
    field: ":scope > div",
    label: "label",
    "required-mark": "label > span",
    help: "label + span",
    error: "div[data-type=error] > span > span:last-child",
  },
  // Der Knopf der Fonto ist visuell verborgen (Hover geht ins Leere): Hover auf die Fläche, Fokus
  // auf den Knopf – je nach Fall über das data-fall des Halters.
  ziel: {
    fm: '[part="control"]',
    fonto:
      ':scope[data-fall$="|focus"] div[data-mode] button, :scope:not([data-fall$="|focus"]) div[data-mode]',
  },
  breite: 320,
};
