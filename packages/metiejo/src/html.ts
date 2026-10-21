// The documents of the configurator (Spec 023, §3): the screen — a document in komuna built of
// fm-sxelo, fm-pagxo and fm-formularo with the Eroj, the stylesheet of the CSS Celo and the built
// Eroj from the server — and the preview, a document of its own in the brand, shown in a frame so
// the brand's root attributes (data-fm-aspekto, data-fm-color-scheme) switch it as a project would.
// The layout below names tokens only. The client script posts the values of a formularo, sends a
// live value to the draft and refreshes the preview; it computes nothing. Pure.

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
.mt-kasxita { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
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
.mt-ikonoj { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-medium); align-items: center; }`;

/**
 * The client of the screens: posts a formularo, navigates on Zurück, sends a live value to the
 * draft and refreshes the preview frame, asks for the check in plain words, applies a suggestion,
 * uploads a font file. No value of a brand is computed here.
 */
export const CLIENT_SCRIPT = `
const root = document.documentElement;
const marko = root.getAttribute("data-mt-marko");
const sxtupo = root.getAttribute("data-mt-sxtupo");
const frame = document.querySelector("iframe[data-mt-vorschau]");
let rev = Number(root.getAttribute("data-mt-rev") || "0");
let scheme = "light";

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

/** A screen: komuna at the root, the stylesheet and the Eroj from the server, the client script. */
export function screenDocument(doc: ScreenDocument): string {
  return `<!doctype html>
<html lang="de" data-fm-aspekto="komuna"${attributes(doc.root)}>
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
${doc.body}
</body>
</html>
`;
}

export interface PreviewDocument {
  name: string;
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
<html lang="de" data-fm-aspekto="${escapeHtml(doc.name)}" data-fm-color-scheme="${doc.scheme}">
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
</body>
</html>
`;
}
