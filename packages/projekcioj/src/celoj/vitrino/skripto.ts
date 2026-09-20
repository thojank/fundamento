// The only script of the Vitrino (Spec 004, FR-07, FR-08, contracts/vitrino §3–§4): it switches
// the `data-fm-*` attributes and shows the slice of the data island that belongs to the
// combination on screen. It computes nothing — every number was measured at build time (Art. VIII).
// No framework, no network.

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
    return '<tr><th scope="row">' + esc(row.paro) + '</th><td>' + esc(row.kategorio) + '</td><td>' +
      row.wcag2.toFixed(2) + '</td><td>' + (row.sojlo === undefined ? "–" : row.sojlo) + '</td><td>' +
      reserve + '</td><td>' + row.apca.toFixed(1) + '</td><td>' + (row.apcaSojlo === undefined ? "–" : row.apcaSojlo) +
      '</td><td>' + (row.pasis ? "bestanden" : "verfehlt") + '</td><td>' + delta + '</td></tr>';
  });
  const hints = apcaSatz();
  document.getElementById("fm-vitrino-kontrasto-tabelo").innerHTML =
    hints + table("KontrastParoj dieser Kombination", ["Paar", "Kategorie", "WCAG", "Schwelle", "Reserve", "APCA", "APCA-Schwelle", "Ergebnis", "Δ WCAG / Δ APCA gegen den Vergleichsstand"], rows);
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
    table("Gegenüberstellung " + a + " ↔ " + b, ["Kriterium", a, b, "Ergebnis"], rows);
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

function fragment() {
  const parts = ["aspekto=" + root.getAttribute("data-fm-aspekto")];
  for (const dimensio of datumoj.dimensioj) parts.push(dimensio.name + "=" + root.getAttribute("data-fm-" + dimensio.name));
  location.replace("#" + parts.join("&"));
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

const komparoSwitch = document.getElementById("fm-vitrino-komparo-switch");
const komparoSection = document.getElementById("fm-vitrino-komparo");
komparoSwitch.addEventListener("click", () => {
  const on = komparoSwitch.getAttribute("aria-pressed") !== "true";
  komparoSwitch.setAttribute("aria-pressed", String(on));
  komparoSection.classList.toggle("fm-kolumnoj", on);
  komparoSection.dataset.fmKomparo = on ? "on" : "off";
});

function applyFragment() {
  if (location.hash.length < 2) return;
  for (const part of location.hash.slice(1).split("&")) {
    const [name, value] = part.split("=");
    if (name && value) {
      root.setAttribute("data-fm-" + name, value);
      for (const other of document.querySelectorAll('[data-fm-switch="' + name + '"]')) {
        other.setAttribute("aria-pressed", String(other.getAttribute("data-fm-valoro") === value));
      }
    }
  }
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
