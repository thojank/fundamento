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
.mt-buehne-layout[data-mt-schmal] [data-mt-zeige-vorschlag] iframe[data-mt-vorschau] { visibility: hidden; }
.mt-chatleiste { display: flex; flex-direction: column; gap: var(--fm-spacing-small); padding: var(--fm-spacing-medium); border: var(--fm-border-width-default) solid var(--fm-color-border-subtle); border-radius: var(--fm-radius-role-surface); background-color: var(--fm-color-background-default); }
.mt-chatleiste-eingabe { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--fm-spacing-small); align-items: end; }
.mt-buehne-layout[data-mt-schmal] .mt-chatleiste-eingabe { grid-template-columns: minmax(0, 1fr); }
.mt-letzte-antwort { display: flex; flex-direction: column; gap: var(--fm-spacing-xsmall); }
.mt-kaheloj { display: grid; grid-template-columns: repeat(var(--fm-layout-columns-4), minmax(0, 1fr)); gap: var(--fm-spacing-small); }
.mt-kaheloj:empty { display: none; }
.mt-kahelo-farbo { display: block; block-size: var(--fm-size-scale-1000); border: var(--fm-border-width-default) solid var(--fm-color-border-subtle); border-radius: var(--fm-radius-role-control); }`;

/**
 * The stage's client: the narrow window from the Vortaro's expanded breakpoint, light or dark for
 * both frames, the cut of the slider and the switch, the last answer of the chat bar. Runs inside
 * the screens' client script (html.ts), after its functions.
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
    // Befund 3.3: a new answer in the history is the bar's last answer as well – built from its
    // text as the history builds it (fm-markdovido), never from markup.
    const liste = document.querySelector("[data-mt-babilo-listo]");
    const letzte = document.querySelector("[data-mt-letzte-antwort]");
    if (liste && letzte) new MutationObserver((records) => {
      for (const record of records) for (const node of record.addedNodes) {
        if (!(node instanceof Element) || node.getAttribute("data-mt-rolle") !== "assistant") continue;
        const quelle = node.querySelector("fm-markdovido");
        if (!quelle) continue;
        const antwort = document.createElement("fm-markdovido");
        antwort.setAttribute("source", quelle.getAttribute("source") || "");
        // Befund 3.6: the region stays and keeps its caption; only the answer in it is new, so a
        // screen reader says the answer and nothing else (aria-live="polite").
        const caption = letzte.querySelector('fm-teksto[kind="caption"]');
        for (const child of [...letzte.children]) if (child !== caption) child.remove();
        letzte.append(antwort);
      }
    }).observe(liste, { childList: true });
    // Befund 3.4: material and research open in a dialog (fm-dialogo); what they find comes back as
    // tiles in it – a colour patch and its share – and the proposal stands on the stage right first.
    // Closing the dialog after a reading loads the screen anew (the proposal beside the steps).
    const dialogoj = {
      materialo: document.querySelector("fm-dialogo[data-mt-materialo]"),
      esploro: document.querySelector("fm-dialogo[data-mt-esploro]"),
    };
    let gelesen = false;
    const dialogMeldung = (dialog, text) => {
      const box = dialog.querySelector("[data-mt-dialogo-meldung]");
      if (!box) return;
      box.textContent = text;
      box.hidden = text === "";
    };
    const zeigeKahelojn = (dialog, kaheloj) => {
      const ujo = dialog.querySelector("[data-mt-kaheloj]");
      if (!ujo) return;
      const tiles = [];
      for (const kahelo of kaheloj) {
        const farbo = String(kahelo.farbo || "").toLowerCase();
        if (!/^#[0-9a-f]{6}$/.test(farbo)) continue;
        const karto = document.createElement("fm-karto");
        karto.setAttribute("level", "3");
        const patch = document.createElement("span");
        patch.setAttribute("slot", "media");
        patch.setAttribute("role", "img");
        patch.setAttribute("aria-label", "Farbfläche " + farbo);
        patch.setAttribute("data-mt-kahelo-farbo", farbo);
        patch.className = "mt-kahelo-farbo";
        patch.style.backgroundColor = farbo;
        const heading = document.createElement("span");
        heading.setAttribute("slot", "heading");
        heading.textContent = farbo;
        const share = document.createElement("fm-teksto");
        share.setAttribute("slot", "content");
        share.textContent = typeof kahelo.anteil === "number" ? "Anteil " + kahelo.anteil + " %" : "Anteil nicht gemessen";
        karto.append(patch, heading, " ", share);
        tiles.push(karto);
      }
      ujo.replaceChildren(...tiles);
    };
    for (const opener of document.querySelectorAll("[data-mt-dialogo-oeffnen]")) {
      opener.addEventListener("click", () => {
        const dialog = dialogoj[opener.getAttribute("data-mt-dialogo-oeffnen")];
        if (dialog) dialog.setAttribute("open", "");
      });
    }
    for (const dialog of Object.values(dialogoj)) {
      if (!dialog) continue;
      dialog.addEventListener("cancel", () => { if (gelesen) location.reload(); });
      // The root carries data-mt-scheme (D-S36-3.1-9): a change in a dialog stays in the dialog.
      dialog.addEventListener("change", (event) => event.stopPropagation());
    }
    const checked = (dialog, selector) => {
      const box = dialog.querySelector(selector);
      return !!box && box.hasAttribute("checked");
    };
    const wertIn = (dialog, selector) => {
      const element = dialog.querySelector(selector);
      return (element && element.getAttribute("value")) || "";
    };
    // Spec 033 S2: a file of fm-alsxutilo or a link, with the confirmation.
    if (dialogoj.materialo) dialogoj.materialo.addEventListener("confirm", async (event) => {
      event.preventDefault();
      const dialog = dialogoj.materialo;
      const picker = dialog.querySelector("[data-mt-materialo-dosiero]");
      const url = wertIn(dialog, "[data-mt-materialo-url]");
      const file = picker && picker.files && picker.files[0];
      const rajtoj = checked(dialog, "[data-mt-materialo-rajtoj]");
      let value;
      if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
        value = { filename: file.name, base64: btoa(binary), rajtoj };
      } else if (url !== "") value = { url, rajtoj };
      else { dialogMeldung(dialog, "Wähle eine Datei oder gib einen Link an."); return; }
      dialogMeldung(dialog, "Ich lese das Material …");
      const result = await post("materialo", value);
      if (!result.ok) { dialogMeldung(dialog, result.body.satz || "Das Material ließ sich nicht lesen."); return; }
      zeigeKahelojn(dialog, result.body.kaheloj || []);
      dialogMeldung(dialog, [...(result.body.satzoj || []), "Der Vorschlag steht auf der Bühne rechts."].join(" "));
      gelesen = true;
      refreshNachher();
    });
    // Spec 033 S4: a brand only named – the research agent, with the confirmation.
    if (dialogoj.esploro) dialogoj.esploro.addEventListener("confirm", async (event) => {
      event.preventDefault();
      const dialog = dialogoj.esploro;
      dialogMeldung(dialog, "Ich recherchiere …");
      const result = await post("esplori", { nomo: wertIn(dialog, "[data-mt-esploro-nomo]"), url: wertIn(dialog, "[data-mt-esploro-url]"), rajtoj: checked(dialog, "[data-mt-esploro-rajtoj]") });
      if (!result.ok) { dialogMeldung(dialog, result.body.satz || "Die Recherche ging nicht."); return; }
      zeigeKahelojn(dialog, result.body.kaheloj || []);
      dialogMeldung(dialog, result.body.antwort || "");
      gelesen = true;
      refreshNachher();
    });
    // Every handler of the screen is bound now (this part runs last): the stage can be used.
    buehne.setAttribute("data-mt-bereit", "");
  }
}
`;
