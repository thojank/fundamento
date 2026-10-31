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
.mt-buehne-rahmen iframe { position: absolute; inset: 0; inline-size: 100%; block-size: 100%; border: 0; }
.mt-buehne-rahmen iframe[data-mt-vorschau-propono] { clip-path: inset(0 0 0 var(--mt-schnitt)); }
.mt-buehne-schnitt { position: absolute; inset-block: 0; inset-inline-start: var(--mt-schnitt); border-inline-start: var(--fm-border-width-default) solid var(--fm-color-border-default); pointer-events: none; }
.mt-buehne-layout:not([data-mt-schmal]) [data-mt-umschalter] { display: none; }
.mt-buehne-layout[data-mt-schmal] [data-mt-schieber], .mt-buehne-layout[data-mt-schmal] [data-mt-buehne-beschriftung], .mt-buehne-layout[data-mt-schmal] .mt-buehne-schnitt { display: none; }
.mt-buehne-layout[data-mt-schmal] iframe[data-mt-vorschau-propono] { clip-path: none; visibility: hidden; }
.mt-buehne-layout[data-mt-schmal] [data-mt-zeige-vorschlag] iframe[data-mt-vorschau-propono] { visibility: visible; }
.mt-buehne-layout[data-mt-schmal] [data-mt-zeige-vorschlag] iframe[data-mt-vorschau] { visibility: hidden; }`;

/**
 * The stage's client: the narrow window from the Vortaro's expanded breakpoint, light or dark for
 * both frames, the cut of the slider and the switch. Runs inside the screens' client script
 * (html.ts), after its functions.
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
  const buehne = buehneLayout.querySelector("[data-mt-buehne]");
  const rahmen = buehne && buehne.querySelector("[data-mt-buehne-rahmen]");
  const folgeBuehne = (control, done) => {
    if (!(control instanceof Element)) return;
    // Befund 3.2: the slider moves the cut between „Jetzt“ (left) and „Mit dem Vorschlag“ (right).
    if (control.matches("[data-mt-schieber]") && rahmen) {
      const wert = Number(control.getAttribute("value"));
      if (Number.isFinite(wert)) rahmen.style.setProperty("--mt-schnitt", Math.min(100, Math.max(0, wert)) + "%");
    }
    // In a narrow window the switch shows the one or the other frame.
    if (control.matches("[data-mt-umschalter]")) buehne.toggleAttribute("data-mt-zeige-vorschlag", control.hasAttribute("checked"));
    // Befund 3.1: light or dark, for both frames.
    if (done && control.matches("[data-mt-buehne-schema]")) {
      scheme = control.value === "dark" ? "dark" : "light";
      refreshFrame();
      refreshNachher();
    }
  };
  if (buehne) {
    buehne.addEventListener("input", (event) => folgeBuehne(event.target, false));
    // The root carries data-mt-scheme as well, which the Studio's scheme switch is found by: a
    // change on the stage stays on the stage.
    buehne.addEventListener("change", (event) => {
      event.stopPropagation();
      folgeBuehne(event.target, true);
    });
    // Every handler of the screen is bound now (this part runs last): the stage can be used.
    buehne.setAttribute("data-mt-bereit", "");
  }
}
`;
