# Vertrag – Vitrino (Celo, Etappe A)

Begleitet [`../plan.md`](../plan.md) D-06 bis D-09. Das ist die Oberfläche, auf die Prüfungen und spätere Etappen sich verlassen; Namen sind ab Etappe A stabil, Ergänzungen erlaubt, Umbenennungen brechend.

## 1. Ausgabe

- Genau eine Datei je Build: `vitrino/index.html`, geschrieben in der zweiten Celo-Phase (`after`), nachdem CSS und Make-Kit-Bundle vorliegen.
- **Keine externen Ressourcen.** Kein `http://`, kein `https://`, kein `src`/`href` auf eine andere Datei. Stile und Skript stehen inline, Schriften werden nur als Familienname genannt.
- **Byte-gleich** bei gleichem Modelo: kanonische Sortierung, feste Stellenzahl (wie `truncate2` der Alirebleco-Prüfung), kein Zeitstempel, keine Zufallszahl.
- Eingebettet werden: `css/fundamento.css` (alle Aspektoj, alle Dimensioj) und `make-kit/<referenz-aspekto>/dist/element.js` (React-frei, registriert sich selbst).

## 2. Dokumentgerüst

```html
<!doctype html>
<html lang="de" data-fm-aspekto="komuna" data-fm-color-scheme="light" data-fm-contrast="default"
      data-fm-density="default" data-fm-viewport="medium" data-fm-motion="default">
  <head>… <style id="fm-vitrino-css">…</style> <script type="application/json" id="fm-vitrino">…</script></head>
  <body>
    <header id="fm-vitrino-kapo">…</header>
    <main>
      <section id="fm-vitrino-paletroj">…</section>
      <section id="fm-vitrino-surfacoj">…</section>
      <section id="fm-vitrino-teksto">…</section>
      <section id="fm-vitrino-statuso">…</section>
      <section id="fm-vitrino-agoj">…</section>
      <section id="fm-vitrino-butono">…</section>
      <section id="fm-vitrino-kontrasto">…</section>
      <section id="fm-vitrino-regularo">…</section>
      <section id="fm-vitrino-kovrado">…</section>
    </main>
    <script id="fm-vitrino-skripto" type="module">…</script>
  </body>
</html>
```

- Jede `section` hat eine `h2`; Tabellen haben `caption`, `thead` und `th[scope]`.
- Jede Farbfläche steht in einer Tabellenzeile mit Tokenname und Messwert: Farbe ist nie die einzige Information (WCAG 1.4.1).
- Die Dimensio-Schalter sind `<button>` mit `aria-pressed`, gruppiert je Dimensio mit `role="group"` und `aria-label`.

## 3. Umschalten (FR-07)

- Ein Schalter setzt genau ein `data-fm-*`-Attribut am `<html>`-Element; das CSS-Celo schaltet die Werte, ohne Neuladen.
- Dasselbe Ereignis wählt die passende Scheibe der JSON-Insel und schreibt die Zahlen neu (`mezuroj`, `regularo`, `roloj`).
- Der Zustand steht zusätzlich im Fragment der URL (`#aspekto=komuna&color-scheme=dark`), damit ein Screenshot teilbar ist; beim Laden wird das Fragment angewandt.

## 4. Gegenüberstellung (FR-08)

- Der Vergleichsschalter schaltet auf zwei Spalten. Jede Spalte trägt ihre eigenen `data-fm-*`-Attribute an ihrem Wurzelelement, damit beide Aspektoj gleichzeitig sichtbar sind; alle übrigen Dimensioj bleiben gleich.
- Je Kriterium eine Zeile: Wert A, Wert B, Kennzeichnung `vorn` / `gleich` / `hinten` – als Wort, nicht als Farbe.
- Kriterien in Etappe A: kleinste Kontrast-Reserve, Bestehensquote der KontrastParoj, kleinster Flächenabstand, kleinster Abstand zum Anker, Bandbreite der Palettenstufen, Rampenausrichtung, Gamut-Treue, Regelmäßigkeit der Typo-Skala, Regularo-Ergebnis (bestanden / Verstöße) und die Abdeckung je Dimensio (`dimensio-kovrado`).
- **Aspiroj stehen nie im Vergleich.** Sie gehören einer Marke; ein Vergleich daraus wäre Geschmack gegen Geschmack. Sie erscheinen nur im Abschnitt der jeweiligen Marke, als „Entwurfsziel: Soll / Ist / erreicht".
- **Kein Gesamturteil** (FR-17 gilt schon hier).

## 5. Garantien, die geprüft werden

| Garantie | Prüfung |
|---|---|
| eine Datei, keine externen Ressourcen | Vitest in `projekcioj` |
| byte-gleich bei gleichem Modelo | Vitest: zwei Builds, gleiche SHA-256 |
| keine Literalwerte in der Vorlage | Vitest: kein Hex, kein `oklch(` außerhalb der eingebetteten Projektionen |
| alle Abschnitte aus FR-06 mit Zeilen je Rolle und Paar | Vitest über das erzeugte HTML |
| Umschalten ohne Neuladen, alle sechs Dimensioj | Playwright in `eroj`, Chromium |
| Gegenüberstellung zeigt beide Werte und die Kennzeichnung | Playwright |
| axe ohne Befund, hell und dunkel, beide Kontraststufen | `@axe-core/playwright` |
| `fm-butono` ist aufgewertet und trägt die Tokens des Aspekto | Playwright: `customElements.get`, berechnete Farbe gegen `rezolvoj.json` |
| Abschnitt „Eigene Werte je Dimensio" zeigt je Dimensio-Wert die Abdeckung | Vitest über das erzeugte HTML |
| Aspiroj der gezeigten Marke stehen mit Soll, Ist und Kialo da, als Entwurfsziel bezeichnet | Vitest über das erzeugte HTML |

Kommando: `pnpm check:vitrino` (eigener CI-Schritt „Check: Vitrino"), nach `pnpm fm projekcioj build`.
