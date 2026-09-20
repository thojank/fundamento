# Spec 003 – Durchstich `butono`, mit Figma Make Kit

**Branch:** `003-butono-durchstich` · **Status:** Entwurf, bereit für /speckit.plan nach Merge von Spec 002 · **Constitution:** v1.5 (diese Spec ist das Amendment) · **Erstellt:** 2026-09-19 · **Voraussetzung:** Spec 002 auf `main`, CI grün

## Zweck

Art. IX verlangt, jede Fähigkeit zuerst an einem einzigen Ero durch alle Ebenen zu ziehen. Phase 3 macht das mit `butono` (Button). Am Ende steht ein Satz, der die These von Fundamento belegt:

> Ein Agent baut in Figma Make einen Screen mit `butono` in `komuna`, wechselt auf eine zweite Marke, und alle Reguloj halten; derselbe Button läuft als Web Component und als React-Komponente, sieht in Figma gleich aus wie im Code, und jede Frage dazu beantwortet der Gvidanto.

Sieben Ebenen, alle für genau ein Ero:

1. **Skemo:** die maschinenlesbare Spezifikation von `butono` im Modelo (Props, Varianten, Zustände, Slots, Tokens je Teil, Reguloj, Beispiele richtig/falsch).
2. **CSS und Tailwind:** die ersten echten Projekcioj (Celoj 1 und 2), aus dem Modelo generiert.
3. **Web Component `fm-butono`** und **React-Komponente** (Celo 4).
4. **Figma-Komponente** mit an Variablen gebundenen Eigenschaften, je Aspekto ein Mode.
5. **Zuordnung Figma ↔ Code**, damit ein Coding-Agent aus einer Figma-Instanz die richtige Code-Komponente findet.
6. **Figma Make Kit** je Aspekto (neues Celo): React-Paket, Tailwind-Tokens und aus dem Modelo **generierte** `guidelines/`.
7. **Gvidanto und Prüfung:** Fragen zu `butono` beantworten, einen Entwurf gegen die Reguloj prüfen.

Diese Spec ist zugleich das **Constitution Amendment auf v1.5**: neues Celo „Figma Make Kit" in Art. XII.

## Nicht im Scope

- Weitere Eroj (Phase 4). `butono` darf ein Icon-Slot haben; Icons selbst liefert Phase 5, hier genügt ein generischer Platzhalter aus einem offenen Icon-Satz oder ein leerer Slot.
- Generatoren in voller Breite (Phase 5). Generiert wird nur, was `butono` braucht; die Generatoren werden aber so gebaut, dass Phase 4 sie ohne Umbau wiederverwendet.
- Veröffentlichung auf npm und öffentliche Make Kits (Phase 9). Phase 3 baut die Pakete und prüft sie lokal bzw. als Pre-Release.
- Etoso, Tavoloj außer `vida`, Inspiro.
- Vue-, Angular-, Svelte-Wrapper (Celo 4 später); Phase 3 nur React, weil Figma Make nur React unterstützt (research §1).

---

## Nutzerszenarien

### S1 – Skemo (Modelo-Autor, Agent)
Ein Autor beschreibt `butono` einmal im Modelo: Varianten `primary | secondary | tertiary`, Größen aus `size.control.*`, Zustände `rest | hover | pressed | focus | disabled | loading`, Props (`variant`, `size`, `disabled`, `loading`, `type`, `fullWidth`), Slots (`label`, `icon-start`, `icon-end`), und je Teil (Fläche, Text, Rand, Fokusring) die Tokens. Reguloj hängen am Ero, zum Beispiel „höchstens eine primäre Aktion je Container" mit Kialo. Beispiele richtig/falsch sind Jugxoj.

### S2 – Entwickler (Art. XIII, unter fünf Minuten)
Ein Entwickler ohne Vorwissen installiert das Paket, bindet eine CSS-Datei ein und setzt `<fm-butono variant="primary">Speichern</fm-butono>` bzw. `<Butono variant="primary">` in React. Er wechselt die Marke über ein Attribut am Root (`data-fm-aspekto`), das Farbschema über `data-fm-color-scheme`, ohne Reload.

### S3 – Designer (Art. XIII, unter einer Minute)
Ein Designer aktiviert die Fundamento-Library in Figma, zieht `butono` in einen Frame und wechselt die Marke über den Variablen-Mode. Er tippt keinen Token-Namen.

### S4 – Figma Make
Ein Designer wählt in Figma Make das Kit „Fundamento komuna" und schreibt: „Ein Formular mit zwei Feldern und Speichern/Abbrechen". Make verwendet `butono` mit genau einer primären Aktion und Tailwind-Klassen aus `fm`, keine Hex-Werte. Mit dem Kit der zweiten Marke entsteht derselbe Screen in deren Aussehen.

### S5 – Agent designt, Agent codet
Ein Agent entwirft per Figma-MCP einen Screen mit `butono`-Instanzen. Ein Coding-Agent liest den Entwurf, findet zu jeder Instanz die Code-Komponente und erzeugt Code mit Token-Verweisen. Ein Prüf-Agent vergleicht Entwurf und Code gegen das Modelo (Art. III, Zielablauf).

### S6 – Gvidanto
„Welchen Button nehme ich für ‚Löschen'?" → Antwort aus Skemo und Reguloj (Variante, Kialo, Beispiel richtig/falsch). „Ist dieser Screen konform?" (Liste von Instanzen mit Props) → Verletzungen mit Regulo-ID und Kialo.

### S7 – Barrierefreiheit und Internacia
`butono` ist per Tastatur bedienbar (Enter, Leertaste), hat einen sichtbaren Fokus nach `focus-ring-dual-contrast`, meldet `disabled` und `loading` korrekt an assistive Technik, funktioniert von rechts nach links, verträgt 35 % längere Beschriftungen ohne Abschneiden und nimmt jeden sichtbaren Text als Slot oder Prop, nie als festen String.

---

## Funktionale Anforderungen

### Skemo
- **FR-01** JSON Schema für Skemoj (Ero, Props mit Typ/Default/erlaubten Werten, Varianten, Zustände, Slots, Teile mit Token-Bindung je Zustand, Reguloj, Beispiele). Die Skemo ist die einzige Quelle für alle Projekcioj von `butono` (Art. I).
- **FR-02** `butono`-Skemo im Modelo; jede Token-Bindung zeigt auf existierende Rollen-Tokens.
- **FR-03** Ero-Reguloj mit Kialo, mindestens: `one-primary-per-container`, `destructive-not-primary-color` (Löschen nutzt Danger, nicht Primär), `label-required` (sichtbarer Text oder zugänglicher Name), `touch-target-min` (Mindestgröße der Trefferfläche aus `size.control.*`).
- **FR-04** Prüfung „Skemo ↔ Vortaro": Jeder gebundene Token existiert, jede Varianten-Zustand-Kombination hat eine Bindung, jede KontrastParo-relevante Kombination ist deklariert.

### Projekcioj
- **FR-05 CSS-Celo:** Custom Properties `--fm-*` je Aspekto und Dimensio als Kaskade über Attribute am Root (`[data-fm-aspekto]`, `[data-fm-color-scheme]`, …), Konjunktionen als kombinierte Selektoren; Umschalten ohne Reload.
- **FR-06 Tailwind-v4-Celo:** `@theme` mit Präfix `fm`, abgeleitet über die NomReguloj; Klassen wie `bg-fm-action-primary-rest`.
- **FR-07 Web Component `fm-butono`** mit Shadow DOM oder Light DOM (Plan entscheidet, research §3), Formular-Teilnahme (`type="submit"`), Tastatur, ARIA, Fokus.
- **FR-08 React-Komponente `Butono`**, typisiert, mit denselben Props; baut mit Vite (Voraussetzung Figma Make).
- **FR-09 Figma-Komponente** mit Varianten und an Variablen gebundenen Eigenschaften; Variablen-Collection je Dimensio, Modes je Wert; erzeugt aus dem Modelo.
- **FR-10 Zuordnung Figma ↔ Code** so, dass S5 funktioniert. Weg abhängig vom Figma-Plan (siehe Klärungen).
- **FR-11 Figma Make Kit je Aspekto:** npm-Paket (React + CSS + Tailwind-Preset) und Ordner `guidelines/` nach Figma-Konvention (`Guidelines.md`, `setup.md`, `foundations/`, `components/butono.md`), **vollständig generiert** aus Modelo, Skemo, Reguloj (mit Kialo) und Jugxoj (als Beispiele richtig/falsch). Keine handgeschriebene Zeile (Art. VII). Kurze Dateien, fortschreitende Tiefe (research §1).
- **FR-12 Parität:** Die vierte Konformitätsprüfung (Art. X, bisher leer) vergleicht Skemo, Web Component, React-Komponente, Figma-Komponente und Make-Kit-Guidelines in Props, Varianten, Zuständen und Token-Bindungen. Abweichung bricht den Build.

### Gvidanto
- **FR-13** Werkzeuge `list_eroj`, `get_ero` (Skemo plus Reguloj plus Beispiele), `suggest_ero` (`{ intent }` → passende Ero-Variante mit Begründung), `check_usage` (`{ instances: [{ ero, props, container? }] }` → Verletzungen mit Regulo-ID und Kialo).
- **FR-14** `describe` und der Prompt `gvidanto` kennen Eroj.

### Alirebleco und Internacia
- **FR-15** Automatische Prüfung von Rollen, Namen, Zuständen und Tastaturbedienung der gerenderten Komponente mit einem benannten Werkzeug (research §4); läuft in CI je Aspekto × relevanter Kombination.
- **FR-16** RTL-, Textexpansions- und Pseudo-Lokalisierungs-Test für `butono`.
- **FR-17** Entscheidung APCA: bleibt beratend oder wird unter `contrast=high` verbindlich (Grundlage: Baseline Spec 001 §8).
- **FR-18** Neubewertung Zustands-Textfarben im Kern (offener Befund aus Spec 002, FR-05) anhand der realen Komponente.

## Constitution-Änderungen (v1.4 → v1.5, v1.6)

- **Art. XII, Celoj:** neues Celo „**Figma Make Kit** je Aspekto (React-Paket, Tailwind-Tokens, generierte Guidelines)", eingeordnet nach Celo 5 (Figma).
- **Phasenfolge:** Phase 3 um das Make Kit ergänzt; Verweis auf `docs/vojmapo.md`.
- **v1.6, Art. XII, Celo 2 (Maintainer-Entscheidung im Plan-Review):** „Tailwind v4: Tokens im `@theme` unter dem Namensraum `fm` (`--color-fm-*` → `bg-fm-*`), nicht per `prefix()`, weil `prefix()` alle Klassen des Projekts umbenennt." Grund: `prefix(fm)` benennt in jedem Host-Projekt (auch Figma Make) alle Klassen um. Migration: die Tailwind-NomRegulo und `derive_name` liefern die neuen Namen; es gibt noch keinen Verbraucher der alten Namen; Jugxo zu Art. XII (T002).

## Akzeptanzkriterien

- **AK-01** Skemo validiert; FR-04-Prüfung mit positivem und negativem Fixture.
- **AK-02** Byte-identische Generierung aller Projekcioj über zwei Builds.
- **AK-03** Visueller Vergleich: Web Component, React und Figma-Komponente rendern je Aspekto × Zustand dieselben aufgelösten Werte (Messung der berechneten Styles gegen `rezolvoj.json`, nicht Pixelvergleich).
- **AK-04** Parität (FR-12) grün; eine absichtlich abweichende Prop lässt sie scheitern.
- **AK-05** Alirebleco für `butono` grün in allen Kombinationen beider Test-Aspektoj; Tastatur, Fokus, ARIA automatisch geprüft.
- **AK-06** Internacia: RTL, +35 % Text, Pseudo-Lokalisierung ohne Abschneiden oder Überlauf.
- **AK-07** Quickstart Entwickler (S2) automatisiert unter fünf Minuten; Designer (S3) manuell vom Maintainer.
- **AK-08** Make Kit: `guidelines/` ist deterministisch generiert, verweist nur auf existierende Tokens und Props, enthält jede Ero-Regulo mit Kialo; das Paket baut in einem frischen Vite-Projekt. Der Import in Figma Make und S4 werden vom Maintainer manuell abgenommen (Ergebnis in `plan.md`).
- **AK-09** Gvidanto-Dialog (Art. VII): „Welchen Button für Löschen?", „Ist dieser Screen konform?" (mit zwei primären Aktionen → Verletzung mit Kialo), „Wie heißt die Variante in Figma und in React?".
- **AK-10** S5 als Durchlauf mit einem echten Figma-Entwurf, vom Maintainer abgenommen.

## Klärungen (Maintainer, 2026-09-19)

- **Figma-Plan:** Aufbau und Test laufen in einem Figma-Konto mit Organization/Enterprise-Funktionen. Fundamento darf davon aber **nicht abhängen**: Der Standardweg ist planunabhängig (Figma-Projekcio über die Plugin-API; Zuordnung Figma ↔ Code als Daten im Modelo, über MCP abfragbar). Code Connect ist eine **zusätzliche** Projekcio aus derselben Zuordnung, im Testkonto erprobt. Jedes Figma-Artefakt ist aus dem Repo neu erzeugbar; keine Quelle liegt nur in Figma.
- **Trennung im Testkonto:** eigenes Team oder Projekt nur für Fundamento; keine anderen Design-System-Libraries aktiviert (auch nicht als Kontext für KI-Funktionen); keine Veröffentlichung in eine Registry des Kontoinhabers; Make Kits werden nur als öffentliches Pre-Release-Paket (komuna) oder lokal getestet. Art. V gilt unverändert.
- **Zweite Marke für die Make-Kit-Abnahme:** das Fixture `ekzemplo`. ciferecigo wird nicht in fremde Registries oder Konten geladen.
