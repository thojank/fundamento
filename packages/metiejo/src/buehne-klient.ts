// Spec 036 Teil 3 – the stage of the assistant (Skizze 1 of Spec 035, chosen by the maintainer): its
// layout and its part of the client script. A module without imports, so the screens' stylesheet
// and client (html.ts) take it in without a cycle; the markup lives in buehne.ts. Every value is a
// token of the Vortaro: the twelve columns and the gutter of its grid, its expanded breakpoint.

/**
 * The layout: the steps on four of the twelve columns, the stage on eight (two thirds); below the
 * expanded breakpoint (`data-mt-schmal`, set by the client from the token) one column.
 */
export const BUEHNE_CSS = `.mt-buehne-layout { display: grid; grid-template-columns: repeat(var(--fm-layout-columns-12), minmax(0, 1fr)); gap: var(--fm-layout-grid-gutter); align-items: start; }
.mt-buehne-layout > .mt-schritte { grid-column: span var(--fm-layout-columns-4); display: flex; flex-direction: column; gap: var(--fm-spacing-medium); }
.mt-buehne-layout > .mt-buehne-spalte { grid-column: span var(--fm-layout-columns-8); display: flex; flex-direction: column; gap: var(--fm-spacing-medium); min-inline-size: 0; }
.mt-buehne-layout[data-mt-schmal] > .mt-schritte, .mt-buehne-layout[data-mt-schmal] > .mt-buehne-spalte { grid-column: 1 / -1; }
.mt-buehne { display: flex; flex-direction: column; gap: var(--fm-spacing-small); min-inline-size: 0; }
.mt-buehne-leiste { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-medium); align-items: center; justify-content: space-between; }
.mt-buehne-rahmen { position: relative; block-size: var(--fm-size-container-small); border: var(--fm-border-width-default) solid var(--fm-color-border-default); border-radius: var(--fm-radius-role-surface); overflow: hidden; background-color: var(--fm-color-background-canvas); }
.mt-buehne-rahmen iframe { position: absolute; inset: 0; inline-size: 100%; block-size: 100%; border: 0; }`;

/**
 * The stage's client: the narrow window from the Vortaro's expanded breakpoint, and light or dark
 * for both frames. Runs inside the screens' client script (html.ts), after its functions.
 */
export const BUEHNE_SKRIPTO = `
// Spec 036 Teil 3: the stage of the assistant.
const buehneLayout = document.querySelector("[data-mt-buehne-layout]");
if (buehneLayout) {
  // Below the expanded breakpoint of the Vortaro the steps stand above the stage (Befund 3.2).
  let schmal;
  const folgeBreite = () => {
    if (!schmal) {
      const grenze = getComputedStyle(document.documentElement).getPropertyValue("--fm-size-breakpoint-expanded").trim();
      if (grenze === "") return;
      schmal = matchMedia("(width < " + grenze + ")");
      schmal.addEventListener("change", folgeBreite);
    }
    buehneLayout.toggleAttribute("data-mt-schmal", schmal.matches);
  };
  folgeBreite();
  addEventListener("load", folgeBreite);
  // Befund 3.1: light or dark, for the stage's frames.
  const schema = document.querySelector("[data-mt-buehne-schema]");
  if (schema) schema.addEventListener("change", (event) => {
    // The root carries data-mt-scheme too; the Studio's scheme switch reads that selector.
    event.stopPropagation();
    scheme = schema.value === "dark" ? "dark" : "light";
    refreshFrame();
    refreshNachher();
  });
}
`;
