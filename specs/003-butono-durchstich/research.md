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

## 6. Marktlage, geprüft für den Plan (2026-09-19)

Registry-Stände per `npm view` am 2026-09-19; Doku-Stände am selben Tag abgerufen.

### 6.1 Figma Make Kits (präzisiert §1)

- **Guidelines liegen im Kit, nicht im Paket.** „When you start a Make kit, a guidelines folder is created in the file explorer with at least one markdown file"; Make liest `guidelines/Guidelines.md` zuerst, weitere Dateien in keiner festen Reihenfolge. Einen Import von Guideline-Dateien aus dem npm-Paket beschreibt die Doku nicht. Quellen: https://help.figma.com/hc/en-us/articles/39241689698839-Get-started-with-Make-kits · https://developers.figma.com/docs/code/bring-your-design-system-package/
- **Aufbau der Guidelines:** `Guidelines.md` (Einstieg, verweist weiter), `setup.md`, Unterordner `foundations/` und `components/`; viele kurze Dateien, imperative Sprache, Tabellen Token ↔ Tailwind-Klasse, Beispiele „CORRECT/WRONG". Quelle: https://developers.figma.com/docs/code/write-design-system-guidelines/
- **Paket:** „Compatible with Vite (the default build system)"; Workspace-Abhängigkeiten vor dem Veröffentlichen entfernen; öffentliche npm-Pakete in jedem Plan nutzbar, private nur in bezahlten Plänen über Figmas Registry. Nur React. Quelle: https://help.figma.com/hc/en-us/articles/35946832653975-Use-your-design-system-package-in-Make-kits
- **React-Version:** Die Figma-Doku nennt keine Version; eine Sekundärquelle (Mantlr, 2026) schreibt „React 18 (older React versions are not supported)" und empfiehlt `main`, `module`, `types` und `exports` mit ESM und CJS. Quelle: https://mantlr.com/blog/figma-make-kits-design-system-2026 — Folgerung: `peerDependencies` React ≥ 18, Build-Test gegen React 18 und 19.
- **Kits** erstellen Full Seats in bezahlten Plänen; Rollout ab 2026-03-26; ein neu veröffentlichtes Kit wird an nutzende Dateien verteilt. Make kann Guidelines selbst generieren; Fundamento nutzt das nicht (Art. VII: Guidelines sind Projekcio).
- Aktuelle Werkzeugstände: Vite 8.3.0, `@vitejs/plugin-react` 6.1.1 (Peer `vite ^8`), React 19.3.0, Tailwind 4.3.3, `@tailwindcss/vite` 4.3.3 (alle MIT).

### 6.2 Figma: Plugin-API, Modes, Code Connect

- Variablen und Komponenten lassen sich über die Plugin-API in jedem Plan anlegen (`figma.variables.createVariableCollection`, `createVariable`, `addMode`, `setBoundVariable`). Quelle: https://developers.figma.com/docs/plugins/api/properties/figma-variables-createvariablecollection/
- **Modes je Collection sind planabhängig:** Free 1, Professional bis 4, Organization/Enterprise mehr. Quellen: https://github.com/figma/mcp-server-guide/blob/main/skills/figma-use/references/variable-patterns.md · https://forum.figma.com/suggest-a-feature-11/all-plans-should-offer-more-than-4-variable-modes-13979 — Folgerung: eine Collection je Dimensio; alle Dimensioj haben ≤ 4 Werte; die Zahl der Aspektoj in einer Library ist im Professional-Plan auf 4 begrenzt.
- Code Connect: „Available on the Organization and Enterprise plans", Full- oder Dev-Seat; CLI und UI; React und HTML/Web Components werden unterstützt (`@figma/code-connect` 2.0.1, `@figma/code-connect/html`); Figmas MCP-Server nutzt die Zuordnungen. Quellen: https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect · https://github.com/figma/code-connect/blob/main/docs/html.md
- Messung am Modelo (core + komuna + ekzemplo): höchstens drei Dimensioj beeinflussen denselben Token (aspekto × color-scheme × contrast: 33 Tokens; aspekto × color-scheme: 45; nur aspekto: 94; keine: 126).

### 6.3 Barrierefreiheit (beantwortet §4)

- `axe-core` 4.13.0 (MPL-2.0, 2026-09-18) mit `@axe-core/playwright` 4.13.0 (MPL-2.0); `@playwright/test` 1.63.0 (Apache-2.0, Chromium, Firefox, WebKit). Beide offen lizenziert, CI-tauglich, Ergebnisse als JSON. axe prüft Regeln (Namen, Rollen, ARIA, Kontrast im gerenderten DOM, auch durch Shadow DOM); Tastatur und Fokus prüft Playwright im echten Browser.

### 6.4 APCA (FR-17)

- WCAG 3.0 ist Working Draft (zuletzt 2026-09), Empfehlung nicht vor etwa 2029; der Kontrast-Algorithmus ist offen („yet to be determined"), APCA wurde im Juli 2023 aus dem Entwurf genommen und ist nicht normativ. Quellen: https://www.w3.org/TR/wcag-3.0/ · https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html
- Das Referenzpaket `apca-w3` steht unter einer eingeschränkten Lizenz („Limited W3 License"); Fundamento rechnet APCA über colorjs.io (MIT).
- Baseline im Repo: 1260 beratende APCA-Hinweise in komuna (Spec 002 research §8.7).

### 6.5 Web Components und React

- `lit` 3.3.3 (BSD-3-Clause) ist die verbreitete Basisbibliothek; native Custom Elements brauchen keine Abhängigkeit. React 19 setzt Properties und Events an Custom Elements nativ; React 18 reicht Props als Attribute durch und fängt Klick-Events über die Ereignisdelegation, die aus dem Shadow DOM `composed` herausblubbern.
- Tailwinds Preflight setzt `button` auf transparenten Hintergrund und erbt Schrift; ein Button im Light DOM würde in jedem Tailwind-Projekt (also in Figma Make) zurückgesetzt, einer im Shadow DOM nicht.

### 6.6 Internacia (präzisiert §5)

- Textexpansion: Übersetzungen aus dem Englischen werden für kurze Texte bis zu 200–300 % länger, für mittlere Absätze um etwa 30–40 %. Quelle: https://www.w3.org/International/articles/article-text-size — die 35 % der Constitution entsprechen der mittleren Stufe; für die kurzen Beschriftungen von `butono` prüft der Plan zusätzlich das Doppelte.
