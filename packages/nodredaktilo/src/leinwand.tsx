// Spec 047 (NE-1): the entry of dist/leinwand.js. It mounts the canvas on `#nr-leinwand` with the
// JSON URL of `data-nr-fonto`, in the colour scheme of the page root (`data-fm-color-scheme`).
// React Flow's stylesheet arrives as a string and goes into a <style> here, so the package never
// ships a CSS file (B-2). Spec 054 (MP-1, T3): with `data-nr-ansicht="gestalten"` (and
// `data-nr-marko`) it mounts the view Gestalten instead; without the attribute (Verstehen, the
// packages) the 047 canvas mounts exactly as before.

import xyStilo from "@xyflow/react/dist/style.css?inline";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Gestalten } from "./gestalten/kanvaso.js";
import { Kanvaso } from "./kanvaso.js";

const STILO_ID = "nr-xy-stilo";

/** Mounts the canvas on `ujo`; a no-op without `data-nr-fonto`. */
export function muntu(ujo: HTMLElement): void {
  const fonto = ujo.dataset.nrFonto;
  if (fonto === undefined || fonto === "") return;
  if (document.getElementById(STILO_ID) === null) {
    const stilo = document.createElement("style");
    stilo.id = STILO_ID;
    stilo.textContent = xyStilo;
    document.head.append(stilo);
  }
  const marko = ujo.dataset.nrMarko;
  if (ujo.dataset.nrAnsicht === "gestalten" && marko !== undefined && marko !== "") {
    createRoot(ujo).render(
      <StrictMode>
        <Gestalten ujo={ujo} fonto={fonto} marko={marko} />
      </StrictMode>,
    );
    return;
  }
  const koloro = document.documentElement.dataset.fmColorScheme === "dark" ? "dark" : "light";
  createRoot(ujo).render(
    <StrictMode>
      <Kanvaso ujo={ujo} fonto={fonto} koloro={koloro} />
    </StrictMode>,
  );
}

const ujo = document.querySelector<HTMLElement>("#nr-leinwand[data-nr-fonto]");
if (ujo !== null) muntu(ujo);
