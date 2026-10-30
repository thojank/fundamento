// The documents of the configurator (Spec 023, §3): the screen — a document in komuna built of
// fm-sxelo, fm-pagxo and fm-formularo with the Eroj, the stylesheet of the CSS Celo and the built
// Eroj from the server — and the preview, a document of its own in the brand, shown in a frame so
// the brand's root attributes (data-fm-aspekto, data-fm-color-scheme) switch it as a project would.
// The layout below names tokens only. The client script posts the values of a formularo, sends a
// live value to the draft and refreshes the preview; it computes nothing. Pure.

import { LINGVO_BUTTONS, LINGVO_SKRIPTO } from "@fundamento/projekcioj";
import { nomojIsland } from "./lingvo.js";

export const escapeHtml = (text: string): string =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ??
      character,
  );

/** JSON for a `<script type="application/json">`: `</` must not end the element. */
export const jsonIsland = (value: unknown): string =>
  JSON.stringify(value).replaceAll("</", "<\\/").replaceAll("<!--", "<\\!--");

export const LAYOUT_CSS = `:root { color-scheme: light dark; }
.mt-lingvo { display: inline-flex; align-items: center; }
[data-fm-lingvo="eo"] .mt-nur-traduko { display: none; }
body { margin: 0; font-family: var(--fm-typography-body-1-font-family); background-color: var(--fm-color-background-canvas); color: var(--fm-color-text-default); }
.mt-sxtupo { display: grid; grid-template-columns: minmax(18rem, 28rem) minmax(0, 1fr); gap: var(--fm-spacing-xlarge); align-items: start; }
.mt-sxtupo[data-mt-plena] { grid-template-columns: minmax(0, 1fr); }
.mt-vorschau { display: flex; flex-direction: column; gap: var(--fm-spacing-small); }
.mt-vorschau iframe { inline-size: 100%; block-size: 34rem; border: var(--fm-border-width-default) dashed var(--fm-color-border-default); border-radius: var(--fm-radius-role-surface); background-color: var(--fm-color-background-canvas); }
.mt-vorschau[data-mt-breite="voll"] iframe { block-size: 60rem; }
.mt-regilo { display: grid; grid-template-columns: 1fr auto; gap: var(--fm-spacing-small); align-items: center; }
.mt-regilo input[type="range"] { grid-column: 1 / -1; inline-size: 100%; accent-color: var(--fm-color-action-primary-rest); }
.mt-regilo output { font-variant-numeric: tabular-nums; }
.mt-koloro { display: grid; grid-template-columns: auto 1fr; gap: var(--fm-spacing-small); align-items: end; }
.mt-koloro input[type="color"] { inline-size: 2.75rem; block-size: 2.75rem; padding: 0; border: var(--fm-border-width-default) solid var(--fm-color-border-default); border-radius: var(--fm-radius-role-control); background: none; }
.mt-liste { display: flex; flex-direction: column; gap: var(--fm-spacing-small); }
.mt-zeile { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-small); align-items: center; }
.mt-pruefung { display: flex; flex-direction: column; gap: var(--fm-spacing-medium); }
.mt-studio { display: grid; grid-template-columns: minmax(10rem, 12rem) minmax(0, 1fr) minmax(20rem, 30rem); gap: var(--fm-spacing-large); align-items: start; }
.mt-studio-vorschau { display: flex; flex-direction: column; gap: var(--fm-spacing-small); }
.mt-studio-vorschau iframe { inline-size: 100%; block-size: 48rem; border: var(--fm-border-width-default) dashed var(--fm-color-border-default); border-radius: var(--fm-radius-role-surface); background-color: var(--fm-color-background-canvas); }
.mt-gruppe { display: flex; flex-direction: column; gap: var(--fm-spacing-medium); }
.mt-reihe { display: flex; flex-direction: column; gap: var(--fm-spacing-xsmall); padding-block: var(--fm-spacing-small); border-block-end: var(--fm-border-width-default) solid var(--fm-color-border-subtle); }
.mt-reihe input[type="color"] { inline-size: 2.75rem; block-size: 2.75rem; padding: 0; border: var(--fm-border-width-default) solid var(--fm-color-border-default); border-radius: var(--fm-radius-role-control); background: none; }
.mt-kasxita { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.mt-komponentoj { margin-block-start: var(--fm-spacing-medium); }
.mt-komponentoj-liste { display: flex; flex-direction: column; gap: var(--fm-spacing-xsmall); }
.mt-komponentoj-liste a { color: var(--fm-color-link-rest); text-decoration: none; padding-block: var(--fm-spacing-xsmall); }
.mt-komponentoj-liste a[aria-current="page"] { font-weight: var(--fm-font-weight-semibold); }
.mt-matrico { border-collapse: collapse; inline-size: 100%; font-size: var(--fm-typography-label-2-font-size); }
.mt-matrico th, .mt-matrico td { border: var(--fm-border-width-default) solid var(--fm-color-border-subtle); padding: var(--fm-spacing-xsmall) var(--fm-spacing-small); text-align: start; }
.mt-matrico a { display: block; color: var(--fm-color-link-rest); text-decoration: none; }
.mt-matrico a[aria-current="true"] { background-color: var(--fm-color-action-primary-rest); color: var(--fm-color-action-primary-text); border-radius: var(--fm-radius-role-control); padding-inline: var(--fm-spacing-xsmall); }
.mt-anatomio { margin: 0; padding-inline-start: var(--fm-spacing-large); }
.mt-gebrauch ul { margin: 0; padding-inline-start: var(--fm-spacing-large); }
.mt-schatten { display: flex; flex-direction: column; gap: var(--fm-spacing-xsmall); }
.mt-schatten input[type="color"] { inline-size: 2.75rem; block-size: 2.75rem; padding: 0; border: var(--fm-border-width-default) solid var(--fm-color-border-default); border-radius: var(--fm-radius-role-control); background: none; }
[hidden] { display: none !important; }`;

/** The layout of the preview document: the three container widths of the Vitrino, tokens only. */
export const PREVIEW_CSS = `:root { color-scheme: light dark; }
body { margin: 0; padding: var(--fm-spacing-large); font-family: var(--fm-typography-body-1-font-family); background-color: var(--fm-color-background-canvas); color: var(--fm-color-text-default); display: flex; flex-direction: column; gap: var(--fm-spacing-xlarge); }
.mt-breiten { display: flex; flex-direction: column; gap: var(--fm-spacing-large); }
.mt-breite { overflow-x: auto; border: var(--fm-border-width-default) dashed var(--fm-color-border-default); }
.mt-breite[data-mt-breite="schmal"] { inline-size: calc(var(--fm-size-container-small) / 2); }
.mt-breite[data-mt-breite="mittel"] { inline-size: var(--fm-size-container-medium); max-inline-size: 100%; }
.mt-breite[data-mt-breite="breit"] { inline-size: var(--fm-size-container-large); max-inline-size: 100%; }
.mt-zeile { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-small); align-items: center; }
.mt-spalte { display: flex; flex-direction: column; gap: var(--fm-spacing-medium); }
.mt-flaeche { padding: var(--fm-spacing-large); background-color: var(--fm-color-background-default); border: var(--fm-border-width-default) solid var(--fm-color-border-subtle); border-radius: var(--fm-radius-role-surface); box-shadow: var(--fm-elevation-shadow-raised); display: flex; flex-direction: column; gap: var(--fm-spacing-medium); }
h2 { margin: 0; font-family: var(--fm-typography-headline-3-font-family); font-size: var(--fm-typography-headline-3-font-size); }
.mt-ikonoj { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-medium); align-items: center; }
.mt-matrico-vorschau { border-collapse: collapse; inline-size: 100%; }
.mt-matrico-vorschau th, .mt-matrico-vorschau td { border: var(--fm-border-width-default) solid var(--fm-color-border-subtle); padding: var(--fm-spacing-small); text-align: start; vertical-align: top; }
.mt-beispiel { margin-block-start: var(--fm-spacing-xsmall); }
.mt-zelle { display: flex; gap: var(--fm-spacing-xsmall); }
.mt-farbfeld { display: inline-block; inline-size: var(--fm-size-icon-large); block-size: var(--fm-size-icon-large); border: var(--fm-border-width-default) solid var(--fm-color-border-subtle); border-radius: var(--fm-radius-role-control); }`;

/**
 * The client of the screens: posts a formularo, navigates on Zurück, sends a live value to the
 * draft and refreshes the preview frame, asks for the check in plain words, applies a suggestion,
 * uploads a font file. No value of a brand is computed here.
 */
export const CLIENT_SCRIPT = `${LINGVO_SKRIPTO}
// Spec 026 ②: the Lingvo-Schalter — the choice stays per browser where storage is allowed.
const fmNomoj = JSON.parse(document.getElementById("fm-nomoj")?.textContent || "{}");
let fmLingvoNun = "eo";
try {
  const stored = localStorage.getItem("fundamento-lingvo");
  if (stored === "de" || stored === "en") fmLingvoNun = stored;
} catch {}
fmLingvo(fmLingvoNun, fmNomoj, fmNomoj.tekstoj);
for (const wahl of document.querySelectorAll("[data-fm-lingvo-wahl]")) {
  if (wahl.getAttribute("value") !== fmLingvoNun) wahl.setAttribute("value", fmLingvoNun);
  wahl.addEventListener("change", () => {
    fmLingvoNun = ["eo", "de", "en"].includes(wahl.value) ? wahl.value : "eo";
    try {
      localStorage.setItem("fundamento-lingvo", fmLingvoNun);
    } catch {}
    fmLingvo(fmLingvoNun, fmNomoj, fmNomoj.tekstoj);
    // Nachlese 10 N-8: the preview in the frame reads the choice when it loads.
    if (typeof refreshFrame === "function") refreshFrame();
  });
}

const root = document.documentElement;
const marko = root.getAttribute("data-mt-marko");
const sxtupo = root.getAttribute("data-mt-sxtupo");
const frame = document.querySelector("iframe[data-mt-vorschau]");
let rev = Number(root.getAttribute("data-mt-rev") || "0");
let scheme = root.getAttribute("data-mt-scheme") || "light";

function encode(values) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) body.set(key, String(value));
  return body;
}

async function follow(response) {
  if (response.redirected) { location.href = response.url; return; }
  const html = await response.text();
  document.open(); document.write(html); document.close();
}

for (const form of document.querySelectorAll("fm-formularo[data-action]")) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = event.detail && event.detail.values ? event.detail.values : {};
    const response = await fetch(form.getAttribute("data-action"), { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: encode(values) });
    await follow(response);
  });
}

for (const link of document.querySelectorAll("[data-href]")) {
  link.addEventListener("click", () => { location.href = link.getAttribute("data-href"); });
}

function refreshFrame() {
  if (!frame || !marko) return;
  const url = new URL(frame.getAttribute("data-mt-src"), location.origin);
  url.searchParams.set("rev", String(rev));
  url.searchParams.set("scheme", scheme);
  frame.src = url.toString();
}

async function sendDraft(patch) {
  const response = await fetch("/api/marko/" + marko + "/entwurf", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(patch) });
  if (!response.ok) return undefined;
  const body = await response.json();
  rev = body.rev;
  refreshFrame();
  return body;
}

let checkTimer;
async function check() {
  const target = document.getElementById("mt-pruefung");
  if (!target || !marko) return;
  const response = await fetch("/api/marko/" + marko + "/pruefung", { method: "POST" });
  if (!response.ok) return;
  const body = await response.json();
  target.innerHTML = body.html;
  bindApply(target);
}
function scheduleCheck() { clearTimeout(checkTimer); checkTimer = setTimeout(check, 500); }

let liveTimer;
const pending = {};
function setPath(target, path, value) {
  const keys = path.split(".");
  let node = target;
  for (const key of keys.slice(0, -1)) { node[key] = node[key] || {}; node = node[key]; }
  node[keys[keys.length - 1]] = value;
}
for (const control of document.querySelectorAll("[data-live]")) {
  const show = () => {
    const output = control.parentElement && control.parentElement.querySelector("output");
    if (output) output.textContent = control.getAttribute("data-live-text") ? control.getAttribute("data-live-text").replace("{}", control.value) : control.value;
  };
  const onChange = () => {
    show();
    const path = control.getAttribute("data-live");
    const kind = control.getAttribute("data-live-kind");
    const value = kind === "number" ? Number(control.value) : control.value;
    setPath(pending, path, value);
    clearTimeout(liveTimer);
    liveTimer = setTimeout(async () => {
      const patch = { ...pending };
      for (const key of Object.keys(pending)) delete pending[key];
      await sendDraft(patch);
      if (sxtupo === "farbe") scheduleCheck();
    }, 150);
  };
  control.addEventListener("input", onChange);
  control.addEventListener("change", onChange);
}

const schemeSwitch = document.querySelector("[data-mt-scheme]");
if (schemeSwitch) {
  schemeSwitch.addEventListener("change", () => { scheme = schemeSwitch.checked ? "dark" : "light"; refreshFrame(); });
}

function bindApply(scope) {
  for (const button of scope.querySelectorAll("[data-apply]")) {
    button.addEventListener("click", async () => {
      await sendDraft(JSON.parse(button.getAttribute("data-apply")));
      location.reload();
    });
  }
}
bindApply(document);

const upload = document.querySelector("fm-alsxutilo[data-mt-upload]");
if (upload) {
  upload.addEventListener("change", async () => {
    const file = upload.files && upload.files[0];
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const response = await fetch("/api/marko/" + marko + "/alsxuti", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ filename: file.name, base64: btoa(binary) }) });
    if (response.ok) location.href = "/marko/" + marko + "/schrift?datei=" + encodeURIComponent(file.name);
    else { const body = await response.json(); const target = document.getElementById("mt-upload-problem"); if (target) { target.hidden = false; target.textContent = body.issues && body.issues[0] ? body.issues[0].message : "Die Datei wurde nicht angenommen."; } }
  });
}

// K-1 (Spec 024): the identifier of the name as written, shown small while typing; K-2: a problem
// of the start goes as soon as the name is one.
const umlauts = { "ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss", "æ": "ae", "ø": "oe", "œ": "oe" };
function identOf(text) {
  return text.toLowerCase().replace(/[äöüßæøœ]/g, (c) => umlauts[c] || c).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
const nameField = document.querySelector('fm-kampo[name="name"]');
const kennung = document.querySelector("[data-mt-kennung]");
if (nameField && kennung) {
  const show = () => {
    const ident = identOf(nameField.value || "");
    kennung.textContent = ident === "" ? "–" : ident;
    const problem = document.getElementById("mt-problem");
    if (problem && ident !== "") problem.hidden = true;
  };
  nameField.addEventListener("input", show);
  show();
}

// Nachlese 10 N-2/N-3: opening an existing brand needs no name — the field is no duty then and
// shows no error, the brand list is — and the main button says what happens.
const basis = document.querySelector('fm-elekto[name="basis"]');
if (basis && nameField) {
  const main = document.querySelector('fm-butono[type="submit"][emphasis="high"]');
  const brands = document.querySelector('fm-elektilo[name="oeffnen"]');
  const apply = () => {
    const open = basis.value === "oeffnen";
    nameField.hidden = open;
    if (open) {
      nameField.removeAttribute("required");
      nameField.removeAttribute("invalid");
    } else if (!nameField.hasAttribute("required")) {
      nameField.setAttribute("required", "");
    }
    if (brands) {
      if (open) brands.setAttribute("required", "");
      else brands.removeAttribute("required");
    }
    if (main) main.textContent = open ? "Öffnen" : "Anlegen";
  };
  basis.addEventListener("change", apply);
  apply();
}

// K-3/K-4 (Spec 024): the search answers while typing, without Enter; without a hit a sentence.
const searchField = document.querySelector('fm-kampo[name="q"]');
let searchTimer;
if (searchField && marko) {
  searchField.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      const q = searchField.value || "";
      const response = await fetch("/api/marko/" + marko + "/tiparoj?q=" + encodeURIComponent(q));
      if (!response.ok) return;
      const body = await response.json();
      const none = document.getElementById("mt-keine-schrift");
      const old = document.getElementById("mt-treffer");
      const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
      if (body.treffer.length > 0) {
        const html = '<fm-elekto name="tiparo" id="mt-treffer">Treffer' + body.treffer.map((t) => '<data slot="options" value="' + esc(t.id) + '">' + esc(t.family) + " · " + esc(t.license) + " · " + esc(t.category) + "</data>").join("") + "</fm-elekto>";
        if (old) old.outerHTML = html; else searchField.insertAdjacentHTML("afterend", html);
      } else if (old) old.remove();
      if (none) { none.hidden = !(q !== "" && body.treffer.length === 0); const target = none.querySelector("[data-mt-suche]"); if (target) target.textContent = q; }
    }, 200);
  });
}

// The Studio (Spec 024): a changed control sets a token, Zurücksetzen takes it back, a display
// name is a word, the switches of the combination lead to the page in that combination.
function studioMeldung(text, intent) {
  const target = document.getElementById("mt-studio-meldung");
  if (!target) return;
  target.setAttribute("intent", intent);
  target.textContent = text;
  target.hidden = text === "";
}
async function festlegen(body) {
  const response = await fetch("/api/marko/" + marko + "/festlegen", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) {
    studioMeldung((result.satz || "Der Wert wurde nicht übernommen.") + " Vorschlag: " + (result.vorschlag || "–"), "danger");
    return undefined;
  }
  rev = result.rev;
  refreshFrame();
  const count = document.getElementById("mt-probleme");
  if (count && typeof result.probleme === "number") { count.textContent = result.probleme + (result.probleme === 1 ? " Problem" : " Probleme"); count.setAttribute("intent", result.probleme === 0 ? "success" : "warning"); }
  studioMeldung(result.betroffen && result.betroffen.length > 0 ? "Betroffene Regeln: " + result.betroffen.join(", ") : "", "info");
  return result;
}
function wertOf(control) {
  const art = control.getAttribute("data-mt-art");
  const raw = control.value;
  if (art === "alias") return { alias: raw };
  if (art === "color") return { wert: raw };
  if (art === "dimension") return { wert: { value: Number(raw), unit: control.getAttribute("data-mt-einheit") || "px" } };
  if (art === "number") return { wert: Number(raw) };
  try { return { wert: JSON.parse(raw) }; } catch { return undefined; }
}
for (const control of document.querySelectorAll("[data-mt-festlegen]")) {
  control.addEventListener("change", async () => {
    const value = wertOf(control);
    if (!value) { studioMeldung("Kein gültiger Wert.", "danger"); return; }
    const body = { token: control.getAttribute("data-mt-festlegen"), ...value };
    const modus = control.getAttribute("data-mt-modus");
    if (modus) body.modus = modus;
    const result = await festlegen(body);
    if (!result) {
      // Not taken (a fixed rule): the control shows the value that holds.
      const before = control.getAttribute("value");
      if (before !== null) control.value = before;
      return;
    }
    control.setAttribute("value", String(control.value));
    {
      const row = control.closest("[data-mt-token]");
      const badge = row && row.querySelector("fm-insigno");
      if (badge) { badge.textContent = result.herkunft; badge.setAttribute("intent", result.herkunft === "gesetzt" ? "info" : "neutral"); }
    }
  });
}
for (const button of document.querySelectorAll("[data-mt-zuruecksetzen]")) {
  button.addEventListener("click", async () => {
    const result = await festlegen({ token: button.getAttribute("data-mt-zuruecksetzen"), zurueck: true });
    if (result) location.reload();
  });
}
let etikedoTimer;
for (const field of document.querySelectorAll("[data-mt-etikedo]")) {
  field.addEventListener("input", () => {
    clearTimeout(etikedoTimer);
    etikedoTimer = setTimeout(() => festlegen({ token: field.getAttribute("data-mt-etikedo"), etikedo: field.value || "" }), 400);
  });
}
for (const choice of document.querySelectorAll("[data-mt-kombination]")) {
  choice.addEventListener("change", () => {
    const url = new URL(location.href);
    url.searchParams.set(choice.getAttribute("data-mt-kombination"), choice.value);
    location.href = url.toString();
  });
}
// Spec 024 ② O-4: a shadow is set as fields per layer; every change sends the whole value.
for (const box of document.querySelectorAll("[data-mt-schatten]")) {
  const send = async () => {
    const unit = box.getAttribute("data-mt-einheit") || "px";
    const layers = [];
    for (const row of box.querySelectorAll("[data-mt-ebene].mt-zeile")) {
      const field = (name) => row.querySelector('[data-mt-feld="' + name + '"]');
      const number = (name) => ({ value: Number(field(name).value), unit });
      const colour = field("farbe");
      const alpha = field("deckkraft");
      const layer = { offsetX: number("x"), offsetY: number("y"), blur: number("unschaerfe"), spread: number("ausdehnung") };
      if (colour.tagName.toLowerCase() === "fm-elektilo") layer.color = "{" + colour.value + "}";
      else {
        const hex = colour.value;
        const channel = (i) => parseInt(hex.slice(i, i + 2), 16) / 255;
        layer.color = { colorSpace: "srgb", components: [channel(1), channel(3), channel(5)], hex };
        if (alpha) layer.color.alpha = Number(alpha.value);
      }
      layers.push(layer);
    }
    const body = { token: box.getAttribute("data-mt-schatten"), wert: layers.length === 1 ? layers[0] : layers };
    const modus = box.getAttribute("data-mt-modus");
    if (modus) body.modus = modus;
    const result = await festlegen(body);
    if (result) {
      const row = box.closest("[data-mt-token]");
      const badge = row && row.querySelector("fm-insigno");
      if (badge) { badge.textContent = result.herkunft; badge.setAttribute("intent", result.herkunft === "gesetzt" ? "info" : "neutral"); }
    }
  };
  for (const field of box.querySelectorAll("[data-mt-feld]")) field.addEventListener("change", send);
}
// Spec 024 ② Schreibweise: the case of a typography role.
for (const choice of document.querySelectorAll("[data-mt-schreibweise]")) {
  choice.addEventListener("change", async () => {
    const result = await festlegen({ token: choice.getAttribute("data-mt-schreibweise"), schreibweise: choice.value });
    if (result) location.reload();
  });
}
// Spec 024 ② two families: a search per role; a chosen hit sets the family of that role.
for (const search of document.querySelectorAll("[data-mt-schrift]")) {
  let timer;
  const rolle = search.getAttribute("data-mt-schrift");
  search.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const q = search.value || "";
      const response = await fetch("/api/marko/" + marko + "/tiparoj?q=" + encodeURIComponent(q));
      if (!response.ok) return;
      const body = await response.json();
      const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
      const id = "mt-treffer-" + rolle;
      const old = document.getElementById(id);
      if (body.treffer.length === 0) { if (old) old.remove(); return; }
      const html = '<fm-elekto name="tiparo-' + rolle + '" id="' + id + '" size="small">Treffer' + body.treffer.map((t) => '<data slot="options" value="' + esc(t.id) + '">' + esc(t.family) + " · " + esc(t.license) + "</data>").join("") + "</fm-elekto>";
      if (old) old.outerHTML = html; else search.insertAdjacentHTML("afterend", html);
      const list = document.getElementById(id);
      list.addEventListener("change", async () => {
        const chosen = await fetch("/api/marko/" + marko + "/schrift", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tiparo: list.value, rolle }) });
        if (chosen.ok) location.reload();
      });
    }, 200);
  });
}
for (const button of document.querySelectorAll("[data-mt-post]")) {
  button.addEventListener("click", async () => {
    const response = await fetch(button.getAttribute("data-mt-post"), { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "" });
    await follow(response);
  });
}

// Spec 033 S1: the Asistanto – the chat over tools, the actions of a step, the confirmation – and the
// one draft of assistant and Studio: a change elsewhere (a new rev) reloads the preview here.
const asistanto = document.getElementById("mt-asistanto");
const asistantoData = asistanto ? JSON.parse(asistanto.textContent || "{}") : undefined;
let sending = false;
function meldung(text) {
  const box = document.getElementById("mt-asistanto-meldung") || document.getElementById("mt-studio-meldung");
  if (!box) return;
  box.textContent = text;
  box.hidden = text === "";
}
function karto(rolle, text) {
  const list = document.querySelector("[data-mt-babilo-listo]");
  if (!list) return;
  const card = document.createElement("fm-karto");
  card.setAttribute("data-mt-rolle", rolle);
  const who = document.createElement("fm-teksto");
  who.setAttribute("kind", "caption");
  who.textContent = rolle === "user" ? "Du" : "Assistent";
  const body = document.createElement("fm-teksto");
  body.textContent = text;
  card.append(who, body);
  list.append(card);
}
async function post(path, value) {
  const response = await fetch("/api/marko/" + marko + "/" + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(value) });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, body };
}
if (asistantoData && marko) {
  const input = document.querySelector("[data-mt-babilo-teksto]");
  const send = document.querySelector("[data-mt-babilo-sendi]");
  const submit = async () => {
    const teksto = (input && input.getAttribute("value")) || "";
    if (teksto.trim() === "" || sending) return;
    sending = true;
    karto("user", teksto);
    if (input) input.removeAttribute("value");
    meldung("");
    const result = await post("asistanto", { teksto, faceto: asistantoData.faceto });
    sending = false;
    if (!result.ok) { meldung(result.body.satz || "Der Assistent hat nicht geantwortet."); return; }
    karto("assistant", result.body.antwort || "");
    rev = result.body.rev;
    refreshFrame();
    zeigeStato(result.body.stato);
  };
  if (send) send.addEventListener("click", submit);
  for (const button of document.querySelectorAll("[data-mt-faceto-ago]")) {
    button.addEventListener("click", async () => {
      const result = await post("faceto", { faceto: asistantoData.faceto, ago: button.getAttribute("data-mt-faceto-ago") });
      if (!result.ok) { meldung(result.body.satz || ""); return; }
      location.reload();
    });
  }
  const fremda = document.querySelector("[data-mt-fremda]");
  if (fremda) fremda.addEventListener("click", async () => {
    const nomo = (input && input.getAttribute("value")) || "";
    const result = await post("fremda", { kiel: "nennung", nomo });
    if (result.ok) location.reload();
  });
  // Spec 033 S2: material of the brand – a file of fm-alsxutilo or a link – with the confirmation.
  const legi = document.querySelector("[data-mt-materialo-legi]");
  if (legi) legi.addEventListener("click", async () => {
    const rajtoj = document.querySelector("[data-mt-materialo-rajtoj]");
    const confirmed = !!rajtoj && rajtoj.hasAttribute("checked");
    const picker = document.querySelector("[data-mt-materialo-dosiero]");
    const link = document.querySelector("[data-mt-materialo-url]");
    const url = (link && link.getAttribute("value")) || "";
    const file = picker && picker.files && picker.files[0];
    let value;
    if (file) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      value = { filename: file.name, base64: btoa(binary), rajtoj: confirmed };
    } else if (url !== "") value = { url, rajtoj: confirmed };
    else { meldung("Wähle eine Datei oder gib einen Link an."); return; }
    meldung("Ich lese das Material …");
    const result = await post("materialo", value);
    if (!result.ok) { meldung(result.body.satz || "Das Material ließ sich nicht lesen."); return; }
    meldung((result.body.satzoj || []).join(" "));
    location.reload();
  });
  const konfirmi = document.querySelector("[data-mt-konfirmi]");
  if (konfirmi) konfirmi.addEventListener("click", async () => {
    const rajtoj = document.querySelector("[data-mt-rajtoj]");
    if (!rajtoj || !rajtoj.hasAttribute("checked")) { meldung("Bitte bestätige zuerst das Kästchen."); return; }
    const result = await post("konfirmo", { rajtoj: true });
    if (result.ok) location.reload(); else meldung(result.body.satz || "");
  });
}
function zeigeStato(stato) {
  if (!stato) return;
  const meter = document.querySelector("[data-mt-prozent]");
  if (meter) meter.setAttribute("value", String(stato.prozent));
  const caption = document.querySelector("[data-mt-definiert]");
  if (caption) caption.textContent = "freigegeben " + stato.prozent + " % · definiert " + stato.definiert + " %";
  for (const faceto of stato.facetoj || []) {
    const badge = document.querySelector('[data-mt-faceto-stato="' + faceto.name + '"]');
    if (badge) badge.textContent = faceto.stato + (faceto.gruen ? "" : " · Prüfung offen");
  }
}
// Spec 033 S3: the entry questions of the Kreilo.
const kreilo = document.getElementById("mt-kreilo");
if (kreilo && marko) {
  const send = document.querySelector("[data-mt-kreilo-sendi]");
  if (send) send.addEventListener("click", async () => {
    const attr = (selector) => { const el = document.querySelector(selector); return (el && el.getAttribute("value")) || ""; };
    const karaktero = {};
    for (const slider of document.querySelectorAll("[data-mt-paro]")) karaktero[slider.getAttribute("data-mt-paro")] = Number(slider.getAttribute("value") || "0");
    const inspiro = [];
    const picker = document.querySelector("[data-mt-kreilo-inspiro]");
    for (const file of (picker && picker.files) || []) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      inspiro.push({ filename: file.name, base64: btoa(binary) });
    }
    const rajtoj = document.querySelector("[data-mt-kreilo-rajtoj]");
    meldung("Ich mache den Vorschlag …");
    const result = await post("kreilo", { celo: attr("[data-mt-kreilo-celo]"), karaktero, festgelegt: { farbe: attr("[data-mt-kreilo-farbe]"), schrift: attr("[data-mt-kreilo-schrift]") }, inspiro, rajtoj: !!rajtoj && rajtoj.hasAttribute("checked") });
    if (!result.ok) { meldung(result.body.satz || "Der Vorschlag ging nicht."); return; }
    location.href = "/asistanto/" + marko + "/gvidkoloro";
  });
}
// The one draft: when the assistant or the Studio changed it elsewhere, follow.
if (marko && (asistantoData || (sxtupo && sxtupo.startsWith("studio-")))) {
  setInterval(async () => {
    if (sending || document.hidden) return;
    const response = await fetch("/api/marko/" + marko + "/stato").catch(() => undefined);
    if (!response || !response.ok) return;
    const stato = await response.json();
    if (stato.rev === rev) return;
    rev = stato.rev;
    if (asistantoData) { refreshFrame(); zeigeStato(stato); return; }
    const editing = document.activeElement && document.activeElement.closest && document.activeElement.closest("fm-formularo");
    if (editing) meldung("Die Marke wurde im Assistenten geändert. Lade die Seite neu, um es zu sehen.");
    else location.reload();
  }, 3000);
}

if (frame) refreshFrame();
if (sxtupo === "farbe") check();
`;

export interface ScreenDocument {
  title: string;
  body: string;
  /** Attributes on the root: the brand, the step, the revision of the draft. */
  root: Readonly<Record<string, string>>;
}

const attributes = (entries: Readonly<Record<string, string>>): string =>
  Object.entries(entries)
    .map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
    .join("");

/**
 * The Lingvo-Schalter of a screen (Spec 026 ②): the choice of the Vitrino as an Ero of the screen —
 * a radio group like the Studio's switches of the combination (M-2: no native controls).
 */
const LINGVO_WAHL = `<fm-elekto name="lingvo" value="eo" orientation="horizontal" size="small" data-fm-lingvo-wahl><span data-fm-teksto="lingvo">lingvo</span>${LINGVO_BUTTONS.map(
  (button) => `<data slot="options" value="${button.lingvo}">${button.label}</data>`,
).join("")}</fm-elekto>`;

/**
 * The switch in the header (Nachlese 10 N-1): in the frame's principal region beside the brand and
 * the step; a screen without the frame has it above its body.
 */
function withLingvoWahl(body: string): string {
  const wahl = `<div slot="principal" class="mt-lingvo">${LINGVO_WAHL}</div>`;
  return body.includes("<fm-sxelo>")
    ? body.replace("<fm-sxelo>", `<fm-sxelo>\n${wahl}`)
    : `<div class="mt-lingvo">${LINGVO_WAHL}</div>\n${body}`;
}

/**
 * A screen: komuna at the root, the stylesheet and the Eroj from the server, the client script.
 * Spec 026 ②: the Lingvo-Schalter above the body and the names the body shows in its data island.
 */
export function screenDocument(doc: ScreenDocument): string {
  return `<!doctype html>
<html lang="de" data-fm-lingvo="eo" data-fm-aspekto="komuna"${attributes(doc.root)}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(doc.title)}</title>
<link rel="stylesheet" href="/css/fundamento.css">
<style>${LAYOUT_CSS}</style>
<script type="module" src="/eroj/define.js"></script>
<script type="module" src="/metiejo.js"></script>
</head>
<body>
${withLingvoWahl(doc.body)}
<script type="application/json" id="fm-nomoj">${jsonIsland(nomojIsland(doc.body))}</script>
</body>
</html>
`;
}

export interface PreviewDocument {
  name: string;
  /** Further root attributes: the density, the contrast, the viewport (Spec 024, the Studio's header). */
  attributes?: Readonly<Record<string, string>>;
  /** The stylesheet of the preview (core, komuna and the brand), by URL. */
  cssHref: string;
  /** `@font-face` rules of the chosen webfonts, inline. */
  fontFace: string;
  scheme: "light" | "dark";
  body: string;
}

/** The preview: a document in the brand, switched by the root attributes as a project would. */
export function previewDocument(doc: PreviewDocument): string {
  return `<!doctype html>
<html lang="de" data-fm-aspekto="${escapeHtml(doc.name)}" data-fm-color-scheme="${doc.scheme}"${attributes(doc.attributes ?? {})}>
<head>
<meta charset="utf-8">
<title>Vorschau ${escapeHtml(doc.name)}</title>
<link rel="stylesheet" href="${escapeHtml(doc.cssHref)}">
<style>${doc.fontFace}
${PREVIEW_CSS}</style>
<script type="module" src="/eroj/define.js"></script>
</head>
<body>
${doc.body}
<script type="application/json" id="fm-nomoj">${jsonIsland(nomojIsland(doc.body))}</script>
<script>${LINGVO_SKRIPTO}
// Nachlese 10 N-8: the preview follows the choice of the browser, as the screen around it does.
{
  let lingvo = "eo";
  try {
    const stored = localStorage.getItem("fundamento-lingvo");
    if (stored === "de" || stored === "en") lingvo = stored;
  } catch {}
  const nomoj = JSON.parse(document.getElementById("fm-nomoj")?.textContent || "{}");
  fmLingvo(lingvo, nomoj, nomoj.tekstoj);
}
</script>
</body>
</html>
`;
}
