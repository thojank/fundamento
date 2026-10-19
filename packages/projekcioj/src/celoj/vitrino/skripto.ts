// The script of the Vitrino (Spec 004, FR-07, FR-08, contracts/vitrino §3–§4): it switches
// the `data-fm-*` attributes and shows the slice of the data island that belongs to the
// combination on screen. It computes nothing — every number was measured at build time (Art. VIII).
// No framework, no network.
//
// Spec 016 ② (G7, plan ② D-04): it also switches the mode — Ansehen, or the Werkstatt — and keeps
// the fragment, where the Werkstatt adds its own part (`agordo=…`) through `fmVitrino`. What the
// Werkstatt computes lives in its own bundled module (werkstatt.ts), never here.

export function vitrinoSkripto(): string {
  return String.raw`
const datumoj = JSON.parse(document.getElementById("fm-vitrino").textContent);
const root = document.documentElement;
const esc = (value) => String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const percent = (value) => (value * 100).toFixed(1) + " %";

function kombino() {
  return datumoj.dimensioj
    .map((dimensio) => root.getAttribute("data-fm-" + dimensio.name) || dimensio.default)
    .reduce((parts, value) => parts.concat(value), [root.getAttribute("data-fm-aspekto")])
    .join("|");
}

function rolesKey() {
  return [root.getAttribute("data-fm-aspekto"), root.getAttribute("data-fm-color-scheme"), root.getAttribute("data-fm-contrast")].join("|");
}

function table(caption, head, rows) {
  return '<table><caption>' + esc(caption) + '</caption><thead><tr>' +
    head.map((cell) => '<th scope="col">' + esc(cell) + '</th>').join("") +
    '</tr></thead><tbody>' + rows.join("") + '</tbody></table>';
}

function renderKontrasto() {
  const rows = (datumoj.mezuroj[kombino()] || []).map((row) => {
    const reserve = row.rezervo === undefined ? "–" : percent(row.rezervo);
    const delta = row.bazo === undefined ? "–" :
      (row.wcag2 - row.bazo.wcag2).toFixed(2) + " / " + (row.apca - row.bazo.apca).toFixed(1);
    // An overlay was measured on the worst surface it may lie on; the table says which one.
    const paro = row.surfaco === undefined ? row.paro : row.paro + " über " + row.surfaco;
    return '<tr><th scope="row">' + esc(paro) + '</th><td>' + esc(row.kategorio) + '</td><td>' +
      row.wcag2.toFixed(2) + '</td><td>' + (row.sojlo === undefined ? "–" : row.sojlo) + '</td><td>' +
      reserve + '</td><td>' + row.apca.toFixed(1) + '</td><td>' + (row.apcaSojlo === undefined ? "–" : row.apcaSojlo) +
      '</td><td>' + (row.pasis ? "bestanden" : "verfehlt") + '</td><td>' + delta + '</td></tr>';
  });
  const hints = apcaSatz() + apcaTabelo();
  document.getElementById("fm-vitrino-kontrasto-tabelo").innerHTML =
    hints + '<div id="fm-vitrino-kontrasto-paroj">' + table("KontrastParoj dieser Kombination", ["Paar", "Kategorie", "WCAG", "Schwelle", "Reserve", "APCA", "APCA-Schwelle", "Ergebnis", "Δ WCAG / Δ APCA gegen den Vergleichsstand"], rows) + '</div>';
}

function renderRegularo() {
  const rows = (datumoj.regularo[kombino()] || []).map((row) =>
    '<tr><th scope="row">' + esc(row.regulo) + '</th><td>' + (row.pasis ? "bestanden" : "verletzt") +
    '</td><td>' + esc(row.trovoj.join(", ")) + '</td><td>' + esc(row.kialo) + '</td></tr>');
  const aspiroj = (datumoj.aspiroj[root.getAttribute("data-fm-aspekto")] || []).map((row) =>
    '<tr><th scope="row">' + esc(row.metriko) + '</th><td>' + esc(row.limo) + '</td><td>' + esc(row.amplekso) +
    '</td><td>' + esc(row.mezurita) + '</td><td>' + (row.atingita ? "erreicht" : "verfehlt") + '</td><td>' +
    esc(row.kialo) + '</td></tr>');
  document.getElementById("fm-vitrino-regularo-tabelo").innerHTML =
    table("Reguloj: für jede Marke", ["Regulo", "Ergebnis", "Fundstellen", "Kialo"], rows) +
    table("Entwurfsziele dieser Marke", ["Metrik", "Ziel", "Geltungsbereich", "Ist", "Ergebnis", "Kialo"], aspiroj);
}

function renderKovrado() {
  const rows = (datumoj.kovrado[root.getAttribute("data-fm-aspekto")] || []).map((row) =>
    '<tr><th scope="row">' + esc(row.dimensio + "=" + row.valoro) + '</th><td>' + row.propraj + '</td><td>' +
    row.entute + '</td><td>' + percent(row.parto) + '</td></tr>');
  document.getElementById("fm-vitrino-kovrado-tabelo").innerHTML =
    table("Wie viel diese Marke selbst bestimmt", ["Dimensio-Wert", "eigene Werte", "umgesetzte Tokens", "Anteil"], rows);
}

function renderKomparo() {
  const keys = Object.keys(datumoj.komparo);
  if (keys.length === 0) {
    document.getElementById("fm-vitrino-komparo-tabelo").innerHTML =
      "<p>Nur eine Aspekto geladen; für die Gegenüberstellung braucht es zwei.</p>";
    return;
  }
  const key = keys[0];
  const [a, b] = key.split("|");
  const rows = datumoj.komparo[key].map((row) =>
    '<tr><th scope="row">' + esc(row.kriterio) + '</th><td>' + esc(row.a) + '</td><td>' + esc(row.b) +
    '</td><td>' + (row.pli === "egale" ? "gleich" : row.pli === "a" ? esc(a) + " vorn" : esc(b) + " vorn") + '</td></tr>');
  document.getElementById("fm-vitrino-komparo-tabelo").innerHTML =
    table("Gegenüberstellung " + a + " ↔ " + b + " · die Abdeckung zählt alle Tokens des Dimensio-Satzes, ein Entwurfsziel nur seine Rollengruppen",
      ["Kriterium", a, b, "Ergebnis"], rows);
}

function renderRoloj() {
  const key = rolesKey();
  for (const panel of document.querySelectorAll("[data-fm-roloj]")) {
    panel.hidden = panel.getAttribute("data-fm-roloj") !== key;
  }
  for (const panel of document.querySelectorAll("[data-fm-aspekto-panel]")) {
    panel.hidden = panel.getAttribute("data-fm-aspekto-panel") !== root.getAttribute("data-fm-aspekto");
  }
}

// The parts of the fragment that belong to the Werkstatt (agordo=...), by name.
const extraParts = new Map();
const fragmentHandlers = [];

function fragment() {
  const parts = [];
  if (root.getAttribute("data-fm-modus") === "werkstatt") parts.push("modus=werkstatt");
  parts.push("aspekto=" + root.getAttribute("data-fm-aspekto"));
  for (const dimensio of datumoj.dimensioj) parts.push(dimensio.name + "=" + root.getAttribute("data-fm-" + dimensio.name));
  for (const [name, value] of extraParts) parts.push(name + "=" + value);
  location.replace("#" + parts.join("&"));
}

// The mode (Spec 016 ②): the Werkstatt derives over the reference Aspekto, so the root shows it
// while the mode is on and the Aspekto buttons rest; the sections of one mode hide in the other.
const KNOWN_NAMES = new Set(["aspekto", ...datumoj.dimensioj.map((dimensio) => dimensio.name)]);
let aspektoBefore = null;

function setModus(modus, write) {
  const werkstatt = modus === "werkstatt" && datumoj.werkstatt === true;
  const current = root.getAttribute("data-fm-modus") === "werkstatt";
  root.setAttribute("data-fm-modus", werkstatt ? "werkstatt" : "ansehen");
  for (const button of document.querySelectorAll("button[data-fm-modus]")) {
    button.setAttribute("aria-pressed", String(button.getAttribute("data-fm-modus") === (werkstatt ? "werkstatt" : "ansehen")));
  }
  for (const section of document.querySelectorAll("[data-fm-modus-only]")) {
    section.hidden = section.getAttribute("data-fm-modus-only") !== (werkstatt ? "werkstatt" : "ansehen");
  }
  const reference = document.getElementById("fm-werkstatt-ujo")?.getAttribute("data-fm-referenco");
  if (werkstatt && !current) {
    aspektoBefore = root.getAttribute("data-fm-aspekto");
    if (reference) setAspekto(reference);
  } else if (!werkstatt && current && aspektoBefore !== null) {
    setAspekto(aspektoBefore);
    aspektoBefore = null;
  }
  for (const button of document.querySelectorAll('[data-fm-switch="aspekto"]')) {
    if (werkstatt) button.setAttribute("disabled", "");
    else button.removeAttribute("disabled");
  }
  if (write) fragment();
}

function setAspekto(value) {
  root.setAttribute("data-fm-aspekto", value);
  for (const other of document.querySelectorAll('[data-fm-switch="aspekto"]')) {
    other.setAttribute("aria-pressed", String(other.getAttribute("data-fm-valoro") === value));
  }
}

for (const button of document.querySelectorAll("button[data-fm-modus]")) {
  button.addEventListener("click", () => {
    setModus(button.getAttribute("data-fm-modus"), true);
    render();
  });
}

// What the Werkstatt's module uses (Spec 016 ②): a part of the fragment of its own, and a word
// when the fragment changed from outside.
globalThis.fmVitrino = {
  setFragmentPart(name, value) {
    if (value === undefined || value === null || value === "") extraParts.delete(name);
    else extraParts.set(name, value);
    fragment();
  },
  getFragmentPart(name) {
    return extraParts.get(name);
  },
  onFragment(handler) {
    fragmentHandlers.push(handler);
  },
  setModus(modus) {
    setModus(modus, true);
    render();
  },
  render,
};

function apcaTabelo() {
  const rows = (datumoj.apcaHintoj.kategorioj || []).map(function (row) {
    const delta = row.bazo === undefined ? "–" :
      (row.nun - row.bazo >= 0 ? "+" : "") + (row.nun - row.bazo) +
      " / " + ((row.plejMalbona - row.bazoPlejMalbona) >= 0 ? "+" : "") +
      (row.plejMalbona - row.bazoPlejMalbona).toFixed(1);
    return '<tr><th scope="row">' + esc(row.kategorio) + '</th><td>' + row.mezuroj + '</td><td>' +
      row.nun + '</td><td>' + row.sojlo + '</td><td>' + row.plejMalbona.toFixed(1) + ' (' +
      esc(row.plejMalbonaParo) + ')</td><td>' +
      (row.bazo === undefined ? "–" : row.bazo + " · " + row.bazoPlejMalbona.toFixed(1)) +
      '</td><td>' + delta + '</td></tr>';
  });
  if (rows.length === 0) return "";
  const caption = datumoj.apcaHintoj.bazo === undefined
    ? "Beratende APCA-Hinweise je Kategorie"
    : "Beratende APCA-Hinweise je Kategorie, gezählt in den Kombinationen des Vergleichsstands";
  return table(caption,
    ["Kategorie", "Messungen", "Hinweise", "APCA-Schwelle", "schlechtester Lc (Paar)",
     "Vergleichsstand: Hinweise · schlechtester Lc", "Veränderung Hinweise / Lc"], rows);
}

function apcaSatz() {
  const h = datumoj.apcaHintoj;
  const total = "APCA-Hinweise: " + h.nun + " in " + h.kombinoj + " Kombinationen";
  if (h.bazo === undefined || h.komunaj === undefined) return "<p>" + total + "</p>";
  const delta = (a, b) => (a - b >= 0 ? "+" : "") + (a - b);
  // Same combinations on both sides: one number against one number.
  if (h.komunaj.kombinoj === h.kombinoj && h.mankantaj === 0) {
    return "<p>" + total + " (Vergleichsstand: " + h.bazo + ", Veränderung " +
      delta(h.nun, h.bazo) + ")</p>";
  }
  // The snapshot covers fewer combinations: compare where both states have data.
  const missing = h.mankantaj
    ? " Der Vergleichsstand hat " + h.mankantaj + " Kombinationen, die es hier nicht gibt; sein Gesamtwert ist darum h\u00F6her als der Vergleich."
    : "";
  return "<p>" + total + ". In den " + h.komunaj.kombinoj + " Kombinationen des Vergleichsstands: " +
    h.komunaj.nun + " gegen " + h.bazo + " (Ver\u00E4nderung " + delta(h.komunaj.nun, h.bazo) + ")." +
    missing + "</p>";
}

function render() {
  document.body.setAttribute("data-fm-kombino", kombino());
  renderRoloj();
  renderKontrasto();
  renderRegularo();
  renderKovrado();
  renderKomparo();
}

for (const button of document.querySelectorAll("[data-fm-switch]")) {
  button.addEventListener("click", () => {
    const dimensio = button.getAttribute("data-fm-switch");
    root.setAttribute("data-fm-" + dimensio, button.getAttribute("data-fm-valoro"));
    for (const other of document.querySelectorAll('[data-fm-switch="' + dimensio + '"]')) {
      other.setAttribute("aria-pressed", String(other === button));
    }
    fragment();
    render();
  });
}

// A dialog of the Vitrino opens from its button (Spec 011 ②, plan ② D-15): the dialog is modal,
// so the grid shows it closed; the Ero itself takes open back when it closes.
for (const opener of document.querySelectorAll("[data-fm-opens]")) {
  opener.addEventListener("click", () => {
    const dialog = document.getElementById(opener.getAttribute("data-fm-opens"));
    if (dialog) dialog.setAttribute("open", "");
  });
}

// Nachlese 3 W5 (F-10): the Vitrino wires its own show, the Eroj stay what they are (E10). A tab
// chosen shows its word in the panel; a sort button sets sort and direction on the table and
// sorts the rows of the light DOM by the column (numeric columns by number).
for (const tabs of document.querySelectorAll("fm-langetaro")) {
  tabs.addEventListener("select", (event) => {
    const value = event.detail && event.detail.value;
    const panel = tabs.querySelector('[slot="panel"]');
    const tab = Array.from(tabs.children).find(
      (child) =>
        !child.hasAttribute("slot") &&
        (child.getAttribute("value") || (child.textContent || "").trim()) === value,
    );
    if (panel && tab) panel.textContent = (tab.textContent || "").trim();
  });
}
for (const table of document.querySelectorAll("fm-tabelo")) {
  table.addEventListener("sort-change", (event) => {
    const column = event.detail && event.detail.column;
    const direction = event.detail && event.detail.direction;
    if (!column || !direction) return;
    table.setAttribute("sort", column);
    table.setAttribute("direction", direction);
    const native = table.querySelector("table");
    if (!native) return;
    const headers = Array.from(native.querySelectorAll("thead th"));
    const index = headers.findIndex((header) => header.getAttribute("data-sort") === column);
    const body = native.querySelector("tbody");
    if (index === -1 || !body) return;
    const numeric = headers[index].hasAttribute("numeric");
    const rows = Array.from(body.children).filter((row) => !row.hasAttribute("data-fm-empty"));
    const cellText = (row) => ((row.children[index] && row.children[index].textContent) || "").trim();
    rows.sort((a, b) => {
      const left = cellText(a);
      const right = cellText(b);
      const order = numeric ? Number(left) - Number(right) : left.localeCompare(right, "de");
      return direction === "descending" ? -order : order;
    });
    for (const row of rows) body.appendChild(row);
  });
}

// The button in the header leads to the comparison (Spec 004 M1, Befund 2, 2026-10-12): it used
// to toggle a two-column class on the last section, and nothing changed where the button stands.
const komparoSwitch = document.getElementById("fm-vitrino-komparo-switch");
const komparoSection = document.getElementById("fm-vitrino-komparo");
komparoSwitch.addEventListener("click", () => {
  komparoSection.scrollIntoView();
  komparoSection.focus();
});

function applyFragment() {
  if (location.hash.length < 2) return;
  let modus = "ansehen";
  const seen = new Set();
  for (const part of location.hash.slice(1).split("&")) {
    const at = part.indexOf("=");
    const name = at === -1 ? part : part.slice(0, at);
    const value = at === -1 ? "" : part.slice(at + 1);
    if (!name || !value) continue;
    if (name === "modus") {
      modus = value;
    } else if (KNOWN_NAMES.has(name)) {
      root.setAttribute("data-fm-" + name, value);
      for (const other of document.querySelectorAll('[data-fm-switch="' + name + '"]')) {
        other.setAttribute("aria-pressed", String(other.getAttribute("data-fm-valoro") === value));
      }
    } else {
      extraParts.set(name, value);
      seen.add(name);
    }
  }
  for (const name of [...extraParts.keys()]) if (!seen.has(name)) extraParts.delete(name);
  setModus(modus, false);
  for (const handler of fragmentHandlers) handler(new Map(extraParts));
}

// A fragment pasted into the address bar arrives as a hashchange: apply it without a reload.
window.addEventListener("hashchange", () => {
  applyFragment();
  render();
});

applyFragment();
render();
`;
}
