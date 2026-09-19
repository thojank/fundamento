# Research – Spec 003 (Stand 2026-09-19, vorläufig)

## 1. Figma Make Kits

- Make Kits sind Pakete, die Design-System-Teams für Figma Make zusammenstellen: Code-Komponenten aus einem npm-Paket, Styles und Tokens aus Figma-Libraries und Nutzungs-Guidelines, damit die KI nicht nur weiß, was es gibt, sondern wie es benutzt wird. Quelle: https://www.figma.com/blog/introducing-make-kits-and-make-attachments/
- Voraussetzungen: nur React-Codebasen; Paket auf npm (öffentlich, eigenes öffentliches oder privat über die Registry der Organisation); öffentliche Pakete kann jeder Make-Nutzer in jedem Plan verwenden, private brauchen einen bezahlten Plan. Quelle: https://help.figma.com/hc/en-us/articles/35946832653975-Use-your-design-system-package-in-Make-kits
- Paket muss mit Vite bauen. Quelle: https://developers.figma.com/docs/code/bring-your-design-system-package/
- Guidelines: Ordner `guidelines/` im Projektroot mit `Guidelines.md` (Einstieg), `setup.md` (CSS-Imports, Provider), Unterordnern wie `foundations/` und `components/`; viele kurze Dateien statt weniger großer; imperative Sprache, Entscheidungstabellen, Code-Beispiele richtig/falsch; Tokens über Tailwind-Klassen, keine Hex-Werte. Quelle: https://developers.figma.com/docs/code/write-design-system-guidelines/
- Folgerung: Fundamento erzeugt alle drei Teile aus dem Modelo. Guidelines sind eine Projekcio (Art. VII), Beispiele richtig/falsch kommen aus Jugxoj, Begründungen aus Kialoj. Multibrand heißt ein Kit je Aspekto.

## 2. Figma-Pläne und APIs

- Code Connect: „Available on the Organization and Enterprise plans", Full- oder Dev-Seat. Quelle: https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect
- REST-API zum Schreiben von Variablen: nur Enterprise. Quelle: https://forum.figma.com/suggest-a-feature-11/why-s-the-variables-api-only-available-on-enterprise-plans-36426
- Folgerung: Die Figma-Projekcio wird über die Plugin-API erzeugt (Figma-MCP `use_figma` oder ein eigenes Plugin), das geht in jedem Plan. Für die Zuordnung Figma ↔ Code gibt es zwei Wege: Code Connect (Organization/Enterprise) oder eine eigene Zuordnung im Modelo (Figma-Komponentenschlüssel ↔ Ero), die der MCP-Server liefert. Der zweite Weg ist planunabhängig und maschinenlesbar; der erste ist der Standard, den Figma-Werkzeuge direkt verstehen.

## 3. Web Components (offen für den Plan)

Zu bewerten: native Custom Elements ohne Bibliothek vs. eine kleine Basisbibliothek; Shadow DOM (Kapselung, aber Formular-Teilnahme über ElementInternals und Styling über Custom Properties) vs. Light DOM (einfaches Styling, Tailwind direkt, schwächere Kapselung); React 19 unterstützt Custom Elements nativ, ein typisierter React-Wrapper ist für Make Kits trotzdem nötig, weil Make Code-Komponenten in React erwartet.

## 4. Barrierefreiheits-Prüfwerkzeug (offen seit Phase 0)

Zu benennen und zu begründen: ein Regelwerk für automatische WCAG-Prüfungen gerenderter Komponenten (Kandidat: axe-core, MPL-2.0) plus Tastatur- und Fokus-Tests im echten Browser (Kandidat: Playwright). Kriterium: offen lizenziert, in CI lauffähig, Ergebnisse maschinenlesbar.

## 5. Internacia

Logische Eigenschaften und `dir`: https://www.w3.org/International/questions/qa-html-dir. Pseudo-Lokalisierung als Testtechnik für Textexpansion und Zeichensätze; die Expansionsannahme von 35 % stammt aus der Constitution (Art. VIII) und wird im Plan mit einer Quelle belegt.
