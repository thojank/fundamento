// avizo ↔ Banner (container card): intent ↔ status (danger = error), dismissible ↔ isDismissable,
// Aktion im endContent. Ohne Kinder: der Kopf des Banners ist die ganze Karte.
export default {
  ero: "avizo",
  quelle: { Banner: "packages/core/src/Banner/Banner.tsx" },
  kombinoj: [
    { fm: { intent: "info" }, fonto: { status: "info" } },
    { fm: { intent: "success" }, fonto: { status: "success" } },
    { fm: { intent: "warning" }, fonto: { status: "warning" } },
    { fm: { intent: "danger" }, fonto: { status: "error" } },
  ],
  zustaende: { rest: {} },
  fm: {
    tag: "fm-avizo",
    attrs: { dismissible: "" },
    inner:
      '<span slot="heading">Überschrift</span>Nachricht<fm-butono slot="actions" emphasis="medium">Aktion</fm-butono>',
  },
  fonto: {
    comp: "Banner",
    props: {
      title: "Überschrift",
      description: "Nachricht",
      isDismissable: true,
      endContent: { comp: "Button", props: { label: "Aktion", variant: "secondary" } },
    },
  },
  teile: {
    // Der Kopf div[data-status] trägt Fläche, Innenabstand, Abstand und Radius (eine Akzentkante
    // hat die Fonto nicht: Breite 0).
    control: "div[data-status]",
    icon: "span[data-status]",
    heading: "div[data-status] > div:nth-child(2) > div:first-child",
    message: "div[data-status] > div:nth-child(2) > div:last-child",
    actions: "div[data-status] > div:nth-child(3)",
    dismiss: "button[aria-label^='Dismiss']",
  },
  breite: 480,
};
