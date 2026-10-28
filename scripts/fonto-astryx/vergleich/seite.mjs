// Spec 029 ①b e): die Vergleichsseite. Je Ero mit Gegenstück: links Fundamento (komuna), rechts
// die Fonto, hell und dunkel, je Kombination und Zustand; darunter die Tabelle der gemessenen Stile
// (Höhe, Innenabstand, Radius, Rand, Fläche, Schrift) mit Abweichung und Grund.

const esc = (text) =>
  String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

/** Die Spalten der Tabelle: Eigenschaft → wie sie gelesen wird. */
export const SPALTEN = [
  ["Höhe", "@box", (m) => m?.hoehe],
  ["Innenabstand", "padding-inline-start", (m) => m?.roh],
  ["Radius", "border-top-left-radius", (m) => m?.roh],
  ["Rand", "border-top-width", (m) => m?.roh],
  ["Randfarbe", "border-top-color", (m) => m?.sichtbar ?? m?.roh],
  ["Fläche", "background-color", (m) => m?.sichtbar ?? m?.roh],
  ["Schriftfarbe", "color", (m) => m?.sichtbar ?? m?.roh],
  ["Schriftgröße", "font-size", (m) => m?.roh],
];

/** Der gemessene Wert einer Eigenschaft in einem Teil; Kurzformen über ihre Langform. */
export function wert(teil, property) {
  if (teil === undefined) return undefined;
  const aliases = {
    "padding-inline-start": ["padding-inline-start", "padding-inline", "padding"],
    "border-top-left-radius": ["border-radius", "border-top-left-radius"],
    "border-top-width": ["border-width", "border-top-width", "border-inline-start-width"],
    "border-top-color": ["border-color", "border-top-color", "border-inline-start-color"],
  };
  for (const name of aliases[property] ?? [property])
    if (teil[name] !== undefined) return teil[name];
  return undefined;
}

export function seite(messungen, definitions) {
  const sections = definitions.map((def) => {
    const faelle = Object.entries(messungen.faelle).filter(([, f]) => f.ero === def.ero);
    const rows = faelle
      .map(([id, f]) => {
        const label = `${Object.entries(f.kombino)
          .map(([k, v]) => `${k}=${v}`)
          .join(" ")} · ${f.state}`;
        const pics = ["light", "dark"]
          .map((mode) =>
            ["fm", "fonto"]
              .map((side) => {
                const bild = f[side]?.[mode]?.bild;
                return `<td class="${mode}">${bild ? `<img loading="lazy" src="bilder/${bild}" alt="${side} ${mode}">` : "–"}</td>`;
              })
              .join(""),
          )
          .join("");
        return `<tr><th scope="row">${esc(label)}</th>${pics}</tr>`;
      })
      .join("");
    const table = faelle
      .flatMap(([, f]) =>
        ["light", "dark"].flatMap((mode) =>
          Object.keys(def.teile).map((part) => {
            const a = f.fm?.[mode]?.teile?.[part];
            const b = f.fonto?.[mode]?.teile?.[part];
            if (a === undefined && b === undefined) return "";
            const cells = SPALTEN.map(([, property, read]) => {
              const x = read(wert(a, property));
              const y = read(wert(b, property));
              const same = String(x) === String(y);
              const grund = same ? "" : (messungen.gruende?.[`${f.ero}|${part}|${property}`] ?? "");
              return `<td class="${same ? "gleich" : "anders"}">${esc(x ?? "–")}<br>${esc(y ?? "–")}${grund ? `<br><small>${esc(grund)}</small>` : ""}</td>`;
            }).join("");
            return `<tr><th scope="row">${esc(
              Object.entries(f.kombino)
                .map(([k, v]) => `${k}=${v}`)
                .join(" "),
            )} · ${esc(f.state)} · ${mode} · ${esc(part)}</th>${cells}</tr>`;
          }),
        ),
      )
      .join("");
    return `<section id="${def.ero}"><h2>${def.ero} <small>↔ ${esc(Object.keys(def.quelle ?? {}).join(", "))}</small></h2>
<table class="bilder"><thead><tr><th>Fall</th><th>Fundamento hell</th><th>Fonto hell</th><th>Fundamento dunkel</th><th>Fonto dunkel</th></tr></thead><tbody>${rows}</tbody></table>
<details><summary>Gemessene Stile (oben Fundamento, unten Fonto)</summary><table class="stile"><thead><tr><th>Fall · Modus · Teil</th>${SPALTEN.map(([name]) => `<th>${name}</th>`).join("")}</tr></thead><tbody>${table}</tbody></table></details></section>`;
  });
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Vergleich Fundamento | Fonto</title><style>
body{font:14px system-ui;margin:24px;color:#111} h2{margin-top:40px} table{border-collapse:collapse;margin:8px 0}
th,td{border:1px solid #ddd;padding:4px 6px;vertical-align:top;text-align:left} td.dark{background:#222}
td.anders{background:#fff3cd} td.gleich{color:#555} img{display:block;max-width:320px}
nav a{margin-right:8px} small{color:#666}
</style></head><body><h1>Fundamento (komuna) | Fonto (Astryx 0.7.4, theme-neutral)</h1>
<p>Lokal, nicht veröffentlicht. Erzeugt ${esc(messungen.erzeugt)}. Links Fundamento, rechts die Fonto; je Zelle der Tabelle oben Fundamento, unten die Fonto, gelb wo sie abweichen.</p>
<nav>${definitions.map((def) => `<a href="#${def.ero}">${def.ero}</a>`).join("")}</nav>${sections.join("")}</body></html>`;
}
