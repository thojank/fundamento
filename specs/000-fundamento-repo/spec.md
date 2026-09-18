# Spec 000 – Fundamento-Repo, Modelo-Schema, Vortaro

**Branch:** `000-fundamento-repo` · **Status:** Ready for /speckit.plan · **Constitution:** v1.2 · **Erstellt:** 2026-09-18

## Zweck

Phase 0 legt das Fundament, auf dem alle weiteren Phasen aufsetzen: ein baubares Monorepo, das kanonische Datenmodell (Modelo) mit Schema, das Token-Vokabular (Vortaro) im W3C-DTCG-Format mit mehrdimensionalen Sets, die deterministischen Namensableitungen für alle Projekcioj und die vier Konformitätsprüfungen als laufende CI-Gates. Am Ende von Phase 0 gibt es keine Komponente, keine Figma-Datei und keinen MCP-Server, aber jede dieser Ergänzungen ist danach eine reine Erweiterung ohne Strukturänderung.

Diese Spec beschreibt, *was* das Fundament leisten muss und *warum*. Technologieauswahl (Paketmanager, Build-Orchestrierung, Testrunner, Schema-Validator) trifft der Plan, innerhalb der Leitplanken unter „Constraints".

## Nicht im Scope

- Komponenten (Eroj), auch nicht als Platzhalter → Phase 3
- MCP-Server, Gvidanto → Phase 1/2
- Figma-, Penpot-, Tailwind-, Registry-Projekcioj → ab Phase 1; Phase 0 liefert nur die Namensableitung, nicht die Generatoren
- Aspektoj mit echten Werten → Phase 1; Phase 0 arbeitet mit einem minimalen Test-Aspekto
- CLI-Funktionen über `fm --version` und `fm modelo validate` hinaus → Phase 6

---

## Nutzerszenarien

### S1 – Klonen und bauen (Maintainer)

Eine Person klont das Repository, führt Installation, Build und Tests aus und hat nach unter fünf Minuten ein grünes Ergebnis, ohne etwas zu konfigurieren. Die README erklärt in zehn Zeilen, was wo liegt und welche drei Befehle es gibt.

*Warum:* Artikel XIII. Wenn das Fundament selbst umständlich ist, wird alles darauf umständlich.

### S2 – Token anlegen (Modelo-Autor)

Ein Autor legt im Vortaro ein Token in DTCG an, z. B. `color.action.primary.rest` vom Typ `color` mit Alias auf `color.palette.blue.600`. Die Validierung akzeptiert es. Legt er ein Token mit ungültigem Namen (Großbuchstaben, Leerzeichen, nicht-ASCII), unbekanntem Typ, Alias auf ein nicht existierendes Token oder zyklischem Alias an, schlägt die Validierung mit einer Meldung fehl, die Pfad, Regel und Korrekturvorschlag nennt.

*Warum:* Artikel I. Das Modelo ist die einzige Quelle; Fehler müssen dort abgefangen werden, nicht in den Projekcioj.

### S3 – Namensableitung prüfen (Entwickler, Designer)

Aus dem kanonischen Token-Namen `color.action.primary.rest` entstehen deterministisch: CSS `--fm-color-action-primary-rest`, Figma-Variable `color/action/primary/rest`, TypeScript-Pfad `vortaro.color.action.primary.rest`, Tailwind-`@theme`-Name `--color-action-primary-rest`, DTCG-Pfad `color.action.primary.rest`. Für jedes Celo existiert eine Ableitungsregel mit Testfixtures, die auch Grenzfälle abdecken (Zahlen im Namen, Bindestriche, tiefe Pfade, reservierte Wörter der Zielumgebung).

*Warum:* Artikel II. Namen werden generiert, nie vereinbart; die Regel muss beweisbar eindeutig und umkehrbar sein.

### S4 – Mehrdimensionale Auflösung (Modelo-Autor, Agent)

Das Vortaro besteht aus einem Basis-Set (`core`) und je Dimensio aus Sets pro Wert (`aspekto/neutra`, `color-scheme/dark`, `density/compact`, …). Ein Aufruf „löse auf für aspekto=neutra, color-scheme=dark, density=compact" liefert für jedes Token genau einen Endwert. Sets enthalten nur die Tokens, die sie verändern. Definieren zwei aktive Sets dasselbe Token, gewinnt das Set der Dimensio mit höherer Priorität; die Prioritätsreihenfolge steht einmal im Modelo. Die Auflösung ist als Funktion testbar und liefert zusätzlich die Herkunft jedes Wertes (welches Set hat gewonnen).

*Warum:* Artikel IV und XII. Mehrdimensionalität ist nachträglich nicht einführbar; die Herkunftsangabe braucht später der Gvidanto („warum ist dieser Button dunkel?").

### S5 – Konformitätsprüfungen laufen (CI)

Die vier Prüfungen aus Artikel X existieren als einzeln aufrufbare Befehle und laufen in CI bei jedem Push. In Phase 0 prüfen sie das, was es schon gibt:

1. **Vortaro-Lint:** Kein Wert in einer Projekcio-Ausgabe ohne Token-Verweis; im Repo keine Bezeichner außerhalb des Fundamento-Namensraums (siehe FR-14).
2. **Parität:** In Phase 0 ein leerer, aber laufender Vergleich mit einem Fixture, der zeigt, dass eine Abweichung erkannt würde.
3. **Regularo:** Jede Regel im Modelo hat einen `kialo`; ein Fixture ohne `kialo` lässt die Prüfung fehlschlagen.
4. **Alirebleco:** Für jede Auflösung (Aspekto × Dimensio) werden Kontrastpaare aus dem Modelo (Text-auf-Hintergrund-Rollen) gegen einen benannten Schwellenwert geprüft; Werkzeug und Schwelle stehen in `research.md`.

*Warum:* Artikel X. Gates, die erst später kommen, kommen nie.

### S6 – Maschinenlesbarer Export (Agent)

Ein Build erzeugt `modelo.json` (vollständiger Zustand, aufgelöst und unaufgelöst) und `modelo.schema.json`. Ein Agent kann damit ohne Repo-Zugriff beantworten: Welche Dimensioj gibt es, welche Werte haben sie, welche Token-Typen, welche Tokens, welche Regeln mit Gründen. Dies ist die Vorstufe des MCP-Servers aus Phase 1.

*Warum:* Artikel III und VII. Der Gvidanto muss ab Phase 0 wenigstens „Welche Dimensioj gibt es?" beantworten können. Beispieldialog als Akzeptanzkriterium: *„Was gibt's hier?" → „Fundamento v0.0.1: sechs Dimensioj (aspekto, color-scheme, density, contrast, motion, viewport), ein Test-Aspekto `neutra`, 24 Tokens in vier Typen, zwei Regeln mit Begründung, keine Eroj."*

### S7 – Clean-Room-Nachweis (Maintainer)

Ein Prüflauf bestätigt, dass alle Bezeichner im Repository dem Fundamento-Namensraum entsprechen (Allowlist-Prinzip, keine Blockliste fremder Namen) und dass keine Datei aus einem Benchmark-Verzeichnis referenziert oder eingebunden ist.

*Warum:* Artikel V. Der Nachweis muss positiv geführt werden, ohne fremde Namen zu nennen.

---

## Funktionale Anforderungen

**Repository**
- FR-01: Monorepo mit einem Workspace-Mechanismus; Pakete unter `packages/`, Specs unter `specs/`, Constitution unter `.specify/memory/`.
- FR-02: Drei dokumentierte Befehle: installieren, bauen, prüfen. Ein vierter, `fm`, startet die CLI mit `--version` und `modelo validate`.
- FR-03: CI-Pipeline, die bei jedem Push baut, testet und die vier Prüfungen aus S5 ausführt; jede Prüfung ist ein eigener, benannter Schritt.
- FR-04: Pakete der Phase 0: `@fundamento/modelo` (Schema, Validierung, Auflösung, Export), `@fundamento/vortaro` (die DTCG-Daten), `@fundamento/cli` (Skelett). Nicht mehr als drei (Artikel XI).

**Modelo**
- FR-05: JSON-Schema für alle Entitäten unter „Key Entities"; jede Entität hat eine stabile, nie wiederverwendete ID und einen kanonischen Namen.
- FR-06: Validierung des gesamten Modelo mit Fehlermeldungen, die Pfad, verletzte Regel und Korrekturvorschlag enthalten.
- FR-07: Export `modelo.json` und `modelo.schema.json` als Build-Artefakt.
- FR-08: Regeln (Reguloj) sind Entitäten mit Pflichtfeld `kialo`; Jugxoj referenzieren eine Regel oder ein Ero und tragen Entscheidung, Grund, Datum, Kontext.

**Vortaro**
- FR-09: Tokens ausschließlich im DTCG-Format (`$type`, `$value`, `$description`, Aliasse als `{pfad}`); Typen mindestens `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, `shadow`, `typography`, `border`.
- FR-10: Sets und Themes nach Tokens-Studio-Konvention (`$themes.json`, `$metadata.json`); jede Dimensio ist eine Theme-Gruppe, jeder Wert ein Theme, das genau die Sets aktiviert, die zu ihm gehören.
- FR-11: Auflösungsfunktion: Eingabe eine Belegung aller Dimensioj, Ausgabe jeder Token mit Endwert und Herkunft; Prioritätsreihenfolge der Dimensioj ist ein Feld im Modelo.
- FR-12: Ein Test-Aspekto `neutra` mit ausreichend Tokens, um alle Typen und mindestens zwei Dimensionen mit Überlagerung zu testen (Richtwert: 20–30 Tokens). Werte sind bewusst generisch und werden in Phase 1 ersetzt.

**Namensableitung**
- FR-13: Ableitungsregeln als Funktionen je Celo (CSS, Figma-Variable, TypeScript, Tailwind-`@theme`, DTCG-Pfad) mit Fixtures; jede Regel ist injektiv (zwei verschiedene kanonische Namen ergeben nie denselben Zielnamen).
- FR-14: Namensraum-Regel: Alle Custom Properties beginnen mit `--fm-`, alle Custom Elements mit `fm-`, alle Pakete mit `@fundamento/`, alle Esperanto-Bezeichner in x-Konvention und ASCII. Die Vortaro-Lint-Prüfung erzwingt das im gesamten Repo.

**Prüfungen**
- FR-15: Die vier Prüfungen aus S5, jede als Kommando mit Exit-Code, maschinenlesbarer Ausgabe (JSON) und menschenlesbarer Zusammenfassung.
- FR-16: Für die Alirebleco-Prüfung definiert das Modelo Rollenpaare (Vordergrund auf Hintergrund), die pro Auflösung geprüft werden; Schwelle und Metrik aus `research.md`.

**Clean Room**
- FR-17: Repository enthält keine Datei und keinen Verweis aus Benchmark-Verzeichnissen; `.gitignore` und Prüfung S7 stellen das sicher.
- FR-18: Schriften und Icons in Phase 0: keine. Wird eine Schrift für Tests gebraucht, ist sie Open Source mit permissiver Lizenz und im Plan benannt.

---

## Key Entities

| Entität | Beschreibung | Wichtige Felder |
|---|---|---|
| **Token** | Ein Wert im Vortaro (DTCG) | `id`, kanonischer Pfad, `$type`, `$value` (Wert oder Alias), `$description`, Rolle (optional, z. B. `foreground`, `background` für Kontrastpaare) |
| **TokenSet** | DTCG-Datei mit Tokens; gehört zu `core` oder zu genau einem Dimensio-Wert | `id`, Name, Pfad, Dimensio-Zuordnung |
| **Dimensio** | Adaptionsdimension | `id`, Name, erlaubte Werte, Standardwert, Priorität in der Auflösung |
| **DimensioValoro** | Ein Wert einer Dimensio (Theme) | `id`, Name, aktivierte Sets |
| **Aspekto** | Markenausprägung; technisch ein Wert der Dimensio `aspekto` | `id`, Name, Metadaten (Eigentümer, Lizenzhinweis) |
| **Rezolvo** | Ergebnis einer Auflösung | Belegung, Token → Endwert + Herkunfts-Set |
| **NomRegulo** | Namensableitung je Celo | Celo, Funktion, Fixtures |
| **Regulo** | Regel mit Begründung | `id`, Aussage, `kialo` (Pflicht), Geltungsbereich, Prüfbarkeit (automatisch/manuell) |
| **Jugxo** | Präzedenzfall | `id`, Bezug (Regulo/Ero), Entscheidung, Grund, Datum, Kontext |
| **Ero, Skemo, Sxablono, Projekcio, Celo** | In Phase 0 nur als Schema definiert, ohne Instanzen | Schema-Felder gemäß Constitution-Terminologie |

---

## Constraints (Leitplanken für den Plan)

- W3C DTCG ist das einzige Speicherformat des Vortaro (Constitution XII). Kein proprietäres Zwischenformat.
- Alle Bezeichner ASCII, Esperanto in x-Konvention.
- Das Modelo enthält nichts Web-Spezifisches (Constitution VIII); CSS-Namen entstehen erst in der Ableitung.
- Höchstens drei Pakete (Constitution XI).
- Node.js LTS als Laufzeit; alles Weitere (Paketmanager, Build, Test, Schema-Validator) entscheidet der Plan mit Begründung.
- Lizenz: **MIT** (entschieden 2026-09-18). Schriften und Icons müssen MIT-kompatibel sein (MIT, OFL, Apache-2.0, ISC).
- Sprache in Code, Kommentaren, Fehlermeldungen und Doku: **Englisch**, Fachbegriffe aus der Terminologio in **Esperanto** (entschieden 2026-09-18).
- Repository-Hosting: **GitHub** (`github.com/thojank/fundamento`), CI: **GitHub Actions** (entschieden 2026-09-18).

---

## Akzeptanzkriterien

- AK-01: Frischer Klon → Installation, Build, Tests grün in unter fünf Minuten auf einem Standard-Laptop; kein manueller Schritt außer den drei dokumentierten Befehlen.
- AK-02: Mindestens acht Negativ-Fixtures für die Validierung (S2) schlagen mit korrekter Pfad-/Regelangabe fehl; alle Positiv-Fixtures bestehen.
- AK-03: Für jedes Celo aus FR-13 mindestens zehn Fixtures inkl. Grenzfälle; Injektivität ist als Eigenschaftstest über zufällige Namen geprüft.
- AK-04: Auflösung (S4) liefert für alle Kombinationen der Test-Dimensioj eindeutige Werte mit Herkunft; ein Test zeigt, dass die Prioritätsreihenfolge respektiert wird.
- AK-05: Alle vier Prüfungen laufen in CI als getrennte Schritte; je ein Fixture beweist, dass jede Prüfung fehlschlagen *kann*.
- AK-06: `modelo.json` beantwortet den Beispieldialog aus S6 vollständig; ein Test rechnet die Antwort aus dem Export nach.
- AK-07: Clean-Room-Prüfung (S7) besteht; ein Fixture mit fremdem Präfix lässt sie fehlschlagen.
- AK-08: `plan.md` enthält den Constitutional Compliance Review für alle dreizehn Artikel; Ausnahmen sind im Complexity Tracking begründet.
- AK-09: Keine `[NEEDS CLARIFICATION]`-Markierung bleibt offen, bevor `/speckit.plan` läuft.

---

## Hinweise für den Plan

- Die Abdeckungs-Checkliste der Token-Kategorien eines reifen Systems liegt in `research.md`. Sie ist für Phase 0 nicht bindend (Test-Aspekto), für Phase 1 aber die Messlatte; das Schema muss alle dort genannten Typen ausdrücken können.
- Die Alirebleco-Prüfung braucht eine Kontrastmetrik. Der Benchmark-Vergleich (WCAG 2.x Kontrastverhältnis vs. APCA) steht in `research.md`; die Spec legt sich nicht fest, verlangt aber, dass die Metrik austauschbar ist.
- Die Tokens-Studio-Konvention für `$themes.json` ist in `research.md` mit Quelle beschrieben; sie ist so umzusetzen, dass ein Export ohne Konverter in Penpot importierbar ist. Der Plan sollte einen manuellen Penpot-Import als Quickstart-Szenario vorsehen, auch wenn Penpot erst später Prio hat.

---

## Review-Checkliste

- [ ] Alle Anforderungen beschreiben *was* und *warum*, nicht *wie*
- [ ] Jede Anforderung ist testbar und einem Akzeptanzkriterium zugeordnet
- [ ] Keine offenen `[NEEDS CLARIFICATION]`
- [ ] Constitution-Artikel I–XIII berücksichtigt; Abweichungen benannt
- [ ] Nicht-Scope ist explizit
