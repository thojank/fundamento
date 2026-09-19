# Spec 000 – Fundamento-Repo, Modelo-Schema, Vortaro

**Branch:** `000-fundamento-repo` · **Status:** Freigegeben für Build · **Constitution:** v1.2 · **Erstellt:** 2026-09-18 · **Überarbeitet:** 2026-09-19 (Review in p0 + Abnahme, Entscheidungen siehe „Entscheidungslog")

## Zweck

Phase 0 legt das Fundament, auf dem alle weiteren Phasen aufsetzen: ein baubares Monorepo, das kanonische Datenmodell (Modelo) mit Schema, das Token-Vokabular (Vortaro) im W3C-DTCG-Format mit mehrdimensionalen Sets, die deterministischen Namensableitungen für alle Projekcioj und die vier Konformitätsprüfungen (plus Clean-Room-Prüfung) als laufende CI-Gates. Am Ende von Phase 0 gibt es keine Komponente, keine Figma-Datei und keinen MCP-Server, aber jede dieser Ergänzungen ist danach eine reine Erweiterung ohne Strukturänderung.

Diese Spec beschreibt, *was* das Fundament leisten muss und *warum*. Die Technologieauswahl ist durch die Workspace-Standards (`global/tech-stack.md`) vorgegeben: pnpm-Workspaces + Turborepo, TypeScript strict/ESM, Biome, Vitest + fast-check, handgeschriebenes JSON Schema mit Ajv. Der Plan begründet diese Wahl im Compliance Review, trifft sie aber nicht neu.

## Nicht im Scope

- Komponenten (Eroj), auch nicht als Platzhalter → Phase 3
- MCP-Server, Gvidanto → Phase 1/2
- Figma-, Penpot-, Tailwind-, Registry-Projekcioj → ab Phase 1; Phase 0 liefert nur die Namensableitung, nicht die Generatoren
- Aspektoj mit echten Werten → Phase 1; Phase 0 arbeitet mit einem minimalen Test-Aspekto
- CLI-Funktionen über `fm --version` und `fm modelo validate` hinaus → Phase 6
- Veröffentlichung auf npm, Release-Versionierung, Changesets → Phase 9
- String-Export des Vortaro für Werkzeuge, die DTCG 2025.10 noch nicht lesen → bei Bedarf eigenes Celo in späterer Phase

---

## Nutzerszenarien

### S1 – Klonen und bauen (Maintainer)

Eine Person klont das Repository, führt Installation, Build und Tests aus und hat nach unter fünf Minuten ein grünes Ergebnis, ohne etwas zu konfigurieren. Die README erklärt in zehn Zeilen, was wo liegt und welche drei Befehle es gibt.

*Warum:* Artikel XIII. Wenn das Fundament selbst umständlich ist, wird alles darauf umständlich.

### S2 – Token anlegen (Modelo-Autor)

Ein Autor legt im Vortaro ein Token in DTCG an, z. B. `color.action.primary.rest` vom Typ `color` mit Alias auf `color.palette.blue.600`. Die Validierung akzeptiert es. Legt er ein Token mit ungültigem Namen (Verstoß gegen die Namensgrammatik aus FR-13a, z. B. Großbuchstaben, Bindestrich, Leerzeichen, nicht-ASCII), unbekanntem Typ, Wert, der nicht zum Typ passt, Alias auf ein nicht existierendes Token, Alias auf ein Token anderen Typs, zyklischem Alias, fehlender oder doppelter ID oder einer wiederverwendeten ID an, schlägt die Validierung mit einer Meldung fehl, die Pfad, Regel und Korrekturvorschlag nennt.

*Warum:* Artikel I. Das Modelo ist die einzige Quelle; Fehler müssen dort abgefangen werden, nicht in den Projekcioj.

### S3 – Namensableitung prüfen (Entwickler, Designer)

Aus dem kanonischen Token-Namen `color.action.primary.rest` entstehen deterministisch:

| Celo | Abgeleiteter Name |
|---|---|
| CSS Custom Property | `--fm-color-action-primary-rest` |
| Figma-Variable | `color/action/primary/rest` |
| TypeScript-Pfad | `vortaro.color.action.primary.rest` (Segmente, die keine gültigen JS-Bezeichner sind, in Klammernotation: `vortaro.color.palette.blue["600"]`) |
| Tailwind v4 `@theme` | Eintrag `--color-action-primary-rest` im `@theme`-Block; mit `@import "tailwindcss" prefix(fm)` erzeugt Tailwind daraus die Variable `--fm-color-action-primary-rest` und Utilities wie `fm:bg-action-primary-rest` |
| DTCG-Pfad | `color.action.primary.rest` |

Für jedes Celo existiert eine Ableitungsregel mit Testfixtures, die auch Grenzfälle abdecken (Zahlen im Namen, reine Zahlensegmente, tiefe Pfade, Einsegment-Namen, reservierte Wörter der Zielumgebung, Tailwind-Namespaces).

*Warum:* Artikel II. Namen werden generiert, nie vereinbart; die Regel muss beweisbar eindeutig und umkehrbar sein.

### S4 – Mehrdimensionale Auflösung (Modelo-Autor, Agent)

Das Vortaro besteht aus einem Basis-Set (`core`) und Sets, die an **eine oder mehrere Bedingungen** gebunden sind: an einen einzelnen Dimensio-Wert (`aspekto/neutra`, `color-scheme/dark`, `density/compact`, …) oder an eine Konjunktion mehrerer Dimensio-Werte (`aspekto/neutra+color-scheme/dark`), damit ein Aspekto z. B. eine eigene Dunkelpalette definieren kann. Ein Set ist aktiv, wenn alle seine Bedingungen in der Belegung erfüllt sind. Ein Aufruf „löse auf für aspekto=neutra, color-scheme=dark, density=compact" liefert für jedes Token genau einen Endwert; nicht angegebene Dimensioj nehmen ihren Standardwert. Sets enthalten nur die Tokens, die sie verändern. Definieren zwei aktive Sets dasselbe Token, gewinnt das Set, dessen höchstpriorisierte Dimensio höher liegt; bei Gleichstand gewinnt das spezifischere Set (mehr Bedingungen); die Prioritätsreihenfolge steht einmal im Modelo.

Aliasse werden **spät gebunden**: Zuerst werden alle aktiven Sets in Prioritätsreihenfolge überlagert, dann werden Aliasse gegen das überlagerte Ergebnis aufgelöst. Beispiel: `color.text.default` → `{color.palette.neutral.900}` in `core`; `color-scheme/dark` überschreibt nur `color.palette.neutral.900`; bei `color-scheme=dark` folgt `color.text.default` dem dunklen Wert.

Die Auflösung ist als Funktion testbar und liefert zusätzlich die Herkunft jedes Wertes: das Set, das den Token definiert hat, und die vollständige Alias-Kette mit dem Set jedes Glieds.

*Warum:* Artikel IV und XII. Mehrdimensionalität und Kombinations-Sets lassen sich nicht nachträglich einführen; ohne Konjunktionen könnte ein Aspekto keine eigene Dunkel- oder Hochkontrast-Palette haben, und Artikel IV wäre nur nominell erfüllt. Die Herkunftsangabe braucht später der Gvidanto („warum ist dieser Button dunkel?"). Spätes Binden und Konjunktions-Sets entsprechen dem Verhalten von Tokens Studio und Penpot (ein Theme aktiviert mehrere Sets).

### S5 – Konformitätsprüfungen laufen (CI)

Die vier Prüfungen aus Artikel X existieren als einzeln aufrufbare Befehle und laufen in CI bei jedem Push. In Phase 0 prüfen sie das, was es schon gibt:

1. **Vortaro-Lint** (`pnpm check:vortaro-lint`): (a) Kein Wert in einer Projekcio-Ausgabe ohne Token-Verweis. Da Phase 0 keine Projekcioj erzeugt, läuft die Prüfung gegen ein Positiv- und ein Negativ-Fixture einer CSS-Ausgabe. (b) Namensraum-Regel aus FR-14 über das gesamte Repo.
2. **Parität** (`pnpm check:parity`): Generischer Vergleicher zweier normalisierter Inventare (Props, Werte, Zustände). In Phase 0 vergleicht er ein leeres Inventar mit sich selbst (grün) und zwei abweichende Fixtures (rot), um zu zeigen, dass eine Abweichung erkannt würde.
3. **Regularo** (`pnpm check:regularo`): Jede Regulo im Modelo hat einen nicht leeren `kialo`; jede Jugxo verweist auf eine existierende Regulo. Ein Fixture ohne `kialo` lässt die Prüfung fehlschlagen.
4. **Alirebleco** (`pnpm check:alirebleco`): Für jede Auflösung (alle Kombinationen aller Dimensio-Werte, in Phase 0: 72) werden alle KontrastParoj aus dem Modelo geprüft. Bindend ist das WCAG-2.x-Kontrastverhältnis; die Schwellen sind eine Eigenschaft des aktiven `contrast`-Werts (FR-16), damit `contrast=high` tatsächlich mehr verlangt als `default`. APCA wird zusätzlich berechnet und als Warnung gemeldet. Die Metrik ist austauschbar (siehe `research.md` §3).

Zusätzlich läuft als fünfter, eigener CI-Schritt die **Clean-Room-Prüfung** (`pnpm check:clean-room`, siehe S7). Sie ist keine Konformitätsprüfung nach Artikel X, sondern der Nachweis für Artikel V.

*Warum:* Artikel X. Gates, die erst später kommen, kommen nie.

### S6 – Maschinenlesbarer Export (Agent)

Ein Build erzeugt `modelo.json` (vollständiger Zustand: Rohdaten aller Sets, Dimensioj mit Werten und Priorität, Regularo, KontrastParoj, und die Auflösung für die Standardbelegung mit Herkunft), `modelo.schema.json` sowie `rezolvoj.json` (die aufgelösten Werte aller Kombinationen mit Herkunft, als separates Artefakt, weil es multiplikativ wächst). Artikel I ist erfüllt, weil `modelo.json` vollständig ist und `rezolvoj.json` deterministisch daraus folgt. Ein Agent kann damit ohne Repo-Zugriff beantworten: Welche Dimensioj gibt es, welche Werte haben sie, welche Token-Typen, welche Tokens, welche Regeln mit Gründen.

*Warum:* Artikel III und VII. Der Gvidanto muss ab Phase 0 wenigstens „Welche Dimensioj gibt es?" beantworten können. Beispieldialog als Akzeptanzkriterium: *„Was gibt's hier?" → „Fundamento v0.0.1: sechs Dimensioj (aspekto, viewport, density, color-scheme, contrast, motion), ein Test-Aspekto `neutra`, 30 Tokens in zehn Typen, zwei Regeln mit Begründung, keine Eroj."* Die Zahlen im Dialog werden aus dem Export berechnet; maßgeblich ist, dass jede Aussage aus `modelo.json` ableitbar ist, nicht die exakte Token-Anzahl.

### S7 – Clean-Room-Nachweis (Maintainer)

Ein Prüflauf bestätigt, dass alle Bezeichner im Namensraum-relevanten Umfang (FR-14) dem Fundamento-Namensraum entsprechen (Allowlist-Prinzip, keine Blockliste fremder Namen) und dass keine Datei aus einem Benchmark-Verzeichnis (`_benchmark/`, `**/ds-benchmark-*/`) im Repository liegt, referenziert oder importiert wird.

*Warum:* Artikel V. Der Nachweis muss positiv geführt werden, ohne fremde Namen zu nennen.

---

## Funktionale Anforderungen

### Repository
- FR-01: Monorepo mit pnpm-Workspaces; Pakete unter `packages/`, Specs unter `specs/`, Constitution unter `.specify/memory/`. Node.js-Version über `engines` und `.nvmrc` auf die aktuelle Active-LTS (Node 24) festgelegt.
- FR-02: Drei dokumentierte Befehle: `pnpm install`, `pnpm build`, `pnpm check` (Tests + alle Prüfungen). Dazu die CLI `fm` mit `--version` und `modelo validate [pfad]` (ohne Pfad: das Vortaro des Repos; Exit-Code ≠ 0 bei Fehlern).
- FR-03: CI-Pipeline (GitHub Actions), die bei jedem Push und Pull Request baut, testet und die vier Prüfungen aus S5 plus Clean-Room ausführt; jede Prüfung ist ein eigener, benannter Schritt.
- FR-04: Pakete der Phase 0: `@fundamento/modelo` (Schema, Validierung, Auflösung, Namensableitung, Prüfungen, Export), `@fundamento/vortaro` (die DTCG-Daten), `@fundamento/cli` (Skelett). Nicht mehr als drei (Artikel XI).

### Modelo
- FR-05: JSON-Schema für alle Entitäten unter „Key Entities"; jede Entität hat eine stabile, nie wiederverwendete ID und einen kanonischen Namen. IDs sind opak (Präfix je Entitätstyp + ULID, z. B. `tok_01J…`), nicht aus dem Namen abgeleitet, damit Umbenennungen die ID nicht ändern.
- FR-05a: Eine eingecheckte ID-Registry (`ids.lock.json`) führt jede jemals vergebene ID mit Entitätstyp und Status (`active` / `retired`). Die Validierung schlägt fehl, wenn eine ID fehlt, doppelt vorkommt, einer anderen Entitätstyp zugeordnet wird oder eine `retired`-ID wieder auftaucht. Neue IDs werden durch einen dokumentierten Befehl vergeben und eingetragen, nie von Hand.
- FR-06: Validierung des gesamten Modelo mit Fehlermeldungen, die Pfad, verletzte Regel und Korrekturvorschlag enthalten.
- FR-07: Export `modelo.json`, `modelo.schema.json` und `rezolvoj.json` als Build-Artefakte von `@fundamento/modelo`; der Export ist deterministisch (gleiche Eingabe → byte-identische Ausgabe, Artikel I).
- FR-08: Regeln (Reguloj) sind Entitäten mit Pflichtfeld `kialo`; Jugxoj referenzieren eine Regel oder ein Ero und tragen Entscheidung, Grund, Datum, Kontext. Phase 0 enthält genau zwei Reguloj mit Kialo (z. B. „jede Text-auf-Hintergrund-Kombination hat ein KontrastParo, weil …") und keine Jugxoj.

### Vortaro
- FR-09: Tokens ausschließlich im Format **W3C DTCG 2025.10** (`$type`, `$value`, `$description`, Aliasse als `{pfad}`, Gruppen als verschachtelte Objekte, `color` als Objekt mit `colorSpace`/`components`, `dimension` und `duration` als `{value, unit}`). Typen mindestens `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, `shadow`, `typography`, `border`. Ein Alias muss auf ein Token desselben Typs zeigen.
- FR-09a: Die Einheit `px` gilt im Modelo als plattformneutrale Referenzeinheit (1 px ≙ 1 pt ≙ 1 dp), nicht als Web-Pixel. Native Projekcioj bilden sie ohne Modelländerung ab. Diese Auslegung von Artikel VIII wird im Compliance Review dokumentiert.
- FR-09b: Fundamento-spezifische Metadaten stehen in `$extensions["com.ciferecigo.fundamento"]`: `id` (Pflicht) und `role` (optional, z. B. `foreground`, `background`, `border`). Andere Werkzeuge ignorieren diesen Schlüssel.
- FR-10: Sets und Themes nach Tokens-Studio-Konvention (`$themes.json`, `$metadata.json`); ein Set je Datei; jede Dimensio ist eine Theme-Gruppe, jeder Wert ein Theme. Ein Set trägt in `$extensions["com.ciferecigo.fundamento"].kondicxoj` seine Bedingungen (Liste von `dimensio=valoro`, leer für `core`). Ein Theme aktiviert alle Sets, deren Bedingungen es erfüllt; Konjunktions-Sets werden in `$themes.json` bei jedem beteiligten Theme mit Status `enabled` geführt, sodass Tokens Studio und Penpot sie korrekt überlagern (`core` als `source`).
- FR-11: Auflösungsfunktion: Eingabe eine (ggf. partielle) Belegung der Dimensioj, Ausgabe jeder Token mit Endwert und Herkunft (definierendes Set + Alias-Kette). Aktiv sind alle Sets, deren Bedingungen erfüllt sind; Reihenfolge nach höchster beteiligter Dimensio-Priorität, bei Gleichstand nach Anzahl der Bedingungen (spezifischer gewinnt), danach stabil nach Set-Name. Überlagerung vor Alias-Auflösung (spätes Binden, siehe S4). Die Prioritätsreihenfolge der Dimensioj ist ein Feld im Modelo.
- FR-11a: Dimensioj in Phase 0 (Priorität aufsteigend, spätere gewinnen; `core` liegt immer zuunterst):

  | Priorität | Dimensio | Werte | Standard |
  |---|---|---|---|
  | 1 | `aspekto` | `neutra` | `neutra` |
  | 2 | `viewport` | `compact`, `medium`, `expanded` | `medium` |
  | 3 | `density` | `compact`, `default`, `comfortable` | `default` |
  | 4 | `color-scheme` | `light`, `dark` | `light` |
  | 5 | `contrast` | `default`, `high` | `default` |
  | 6 | `motion` | `default`, `reduced` | `default` |

  Ergibt 1 × 3 × 3 × 2 × 2 × 2 = 72 Kombinationen. Ein Dimensio-Wert darf ein leeres Set haben (nur `core` wirkt).
- FR-12: Ein Test-Aspekto `neutra` mit rund 30 Tokens, in denen **jeder** Typ aus FR-09 mindestens einmal vorkommt (inkl. der Composites `typography`, `shadow`, `border`). Mindestens zwei Dimensioj überlagern dasselbe Token (z. B. `color-scheme/dark` und `contrast/high` auf dieselbe Farbe), damit die Priorität testbar ist. Mindestens ein Konjunktions-Set (`aspekto/neutra+color-scheme/dark`) überschreibt ein Token, das auch `color-scheme/dark` allein überschreibt, damit die Spezifitätsregel testbar ist. Alle Dimensioj außer `aspekto` haben mindestens einen nicht-Standardwert mit echtem Set. Werte sind bewusst generisch und werden in Phase 1 ersetzt.

### Namensableitung
- FR-13a: Namensgrammatik für kanonische Token-Namen: ein oder mehr Segmente, getrennt durch `.`; jedes Segment passt auf `[a-z0-9]+`. Keine Bindestriche, Unterstriche oder Großbuchstaben in Segmenten; Mehrwortkonzepte werden als tiefere Pfade ausgedrückt (`color.on.primary`, nicht `color.on-primary`). Die Grammatik gilt für Token-Namen; Dimensio-Namen (`color-scheme`) und Werte folgen der Constitution und sind davon getrennt.
- FR-13: Ableitungsregeln als Funktionen je Celo (CSS, Figma-Variable, TypeScript, Tailwind-`@theme`, DTCG-Pfad) mit Fixtures; jede Regel ist injektiv (zwei verschiedene kanonische Namen ergeben nie denselben Zielnamen) und umkehrbar (aus dem Zielnamen lässt sich der kanonische Name zurückgewinnen).
- FR-13b: Tailwind-Ableitung: Tailwind v4 wird mit `prefix(fm)` eingebunden. Der `@theme`-Eintrag ist `--<kanonischer-name-mit-bindestrichen>` und erzeugt so dieselbe Variable wie das CSS-Celo (`--fm-…`). Die Zuordnung zu Tailwind-Namespaces (`--color-*`, `--spacing-*`, `--radius-*`, `--font-*`, `--font-weight-*`, `--shadow-*`, `--ease-*` …) erfolgt über eine Tabelle, die **Teil der Tailwind-NomRegulo im Paketcode** ist (erstes Pfadsegment bzw. `$type` → Namespace). Sie ist Celo-Wissen und steht nicht in den Modelo-Daten und nicht in `modelo.json` (Artikel VIII); dasselbe gilt für alle künftigen Celo-spezifischen Zuordnungen. Tokens ohne passenden Tailwind-Namespace werden nicht in `@theme` aufgenommen und bleiben als `--fm-*` verfügbar; die Ableitungsfunktion meldet das explizit („kein Tailwind-Ziel"). Da CSS- und Tailwind-Celo dieselbe Variable erzeugen, darf das Tailwind-Celo in späteren Phasen keinen abweichenden Wert definieren.
- FR-14: Namensraum-Regel: Alle Custom Properties beginnen mit `--fm-`, alle Custom Elements mit `fm-`, alle Pakete mit `@fundamento/`, alle Esperanto-Bezeichner in x-Konvention und ASCII. Geprüft werden: `package.json`-Namen, Custom-Property-Definitionen in `.css`-Dateien und generierten Ausgaben, `customElements.define`-Aufrufe und Token-Namen im Vortaro. Ausgenommen sind Testfixtures, die die Prüfung absichtlich fehlschlagen lassen (in einem eigenen Fixture-Verzeichnis). Die Vortaro-Lint-Prüfung erzwingt das im gesamten Repo.

### Prüfungen
- FR-15: Die vier Prüfungen aus S5 und die Clean-Room-Prüfung, jede als Kommando mit Exit-Code (0 = bestanden), maschinenlesbarer Ausgabe (JSON, über `--json`) und menschenlesbarer Zusammenfassung.
- FR-16: Für die Alirebleco-Prüfung definiert das Modelo **KontrastParoj** (Vordergrund-Token, Hintergrund-Token, Kategorie `text-normal` / `text-large` / `ui`), die pro Auflösung geprüft werden. Die Schwellen sind eine Eigenschaft des jeweiligen `contrast`-Dimensio-Werts im Modelo: `default` → WCAG 2.x 4.5:1 / 3:1 / 3:1 (AA), `high` → 7:1 / 4.5:1 / 3:1 (AAA). Bindend ist WCAG 2.x, APCA wird als Warnung gemeldet. Die Metrik ist eine austauschbare Strategie. Der Test-Aspekto muss in `contrast=high` die höheren Schwellen tatsächlich erfüllen.

### Clean Room
- FR-17: Repository enthält keine Datei und keinen Verweis aus Benchmark-Verzeichnissen; `.gitignore` und Prüfung S7 stellen das sicher.
- FR-18: Schriften und Icons in Phase 0: keine. Wird eine Schrift für Tests gebraucht, ist sie Open Source mit permissiver Lizenz und im Plan benannt. `fontFamily`-Tokens des Test-Aspekto verwenden generische Familien (`system-ui`, `monospace` o. ä.).

### Spec-Kit-Artefakte
- FR-19: Der Build legt den Engineering-Plan zusätzlich als `specs/000-fundamento-repo/plan.md` im Repo ab, inklusive „Constitutional Compliance Review" (ein Eintrag je Artikel I–XIII) und „Complexity Tracking". `specs/000-fundamento-repo/spec.md` im Repo wird mit dieser Spec synchronisiert.

---

## Key Entities

| Entität | Beschreibung | Wichtige Felder |
|---|---|---|
| **Token** | Ein Wert im Vortaro (DTCG 2025.10) | `id` und `role` (optional) in `$extensions["com.ciferecigo.fundamento"]`, kanonischer Pfad, `$type`, `$value` (Wert oder Alias), `$description` |
| **TokenSet** | DTCG-Datei mit Tokens; `core` (ohne Bedingung) oder gebunden an eine Konjunktion von einem oder mehreren Dimensio-Werten | `id`, Name, Pfad, `kondicxoj` (Liste `dimensio=valoro`) |
| **Dimensio** | Adaptionsdimension | `id`, Name, erlaubte Werte, Standardwert, Priorität in der Auflösung |
| **KontrastSojloj** | Kontrastschwellen je `contrast`-Wert | Wert, Schwelle je Kategorie (`text-normal`/`text-large`/`ui`) |
| **DimensioValoro** | Ein Wert einer Dimensio (Theme) | `id`, Name, aktivierte Sets |
| **Aspekto** | Markenausprägung; technisch ein Wert der Dimensio `aspekto` | `id`, Name, Metadaten (Eigentümer, Lizenzhinweis) |
| **Rezolvo** | Ergebnis einer Auflösung | Belegung, Token → Endwert + Herkunft (definierendes Set, Alias-Kette) |
| **KontrastParo** | Zu prüfende Vordergrund/Hintergrund-Kombination | `id`, Vordergrund-Token, Hintergrund-Token, Kategorie (`text-normal`/`text-large`/`ui`) |
| **NomRegulo** | Namensableitung je Celo; Paketcode, nicht Modelo-Daten | Celo, Funktion, Fixtures; für Tailwind zusätzlich die Namespace-Tabelle (nur im Code) |
| **Regulo** | Regel mit Begründung | `id`, Aussage, `kialo` (Pflicht), Geltungsbereich, Prüfbarkeit (automatisch/manuell) |
| **Jugxo** | Präzedenzfall | `id`, Bezug (Regulo/Ero), Entscheidung, Grund, Datum, Kontext |
| **Ero, Skemo, Sxablono, Projekcio, Celo** | In Phase 0 nur als Schema definiert, ohne Instanzen | Schema-Felder gemäß Constitution-Terminologie |

---

## Constraints (Leitplanken für den Plan)

- W3C DTCG 2025.10 ist das einzige Speicherformat des Vortaro (Constitution XII). Kein proprietäres Zwischenformat.
- Alle Bezeichner ASCII, Esperanto in x-Konvention.
- Das Modelo enthält nichts Web-Spezifisches (Constitution VIII); CSS-Namen entstehen erst in der Ableitung. `px` gilt als plattformneutrale Referenzeinheit (FR-09a).
- Höchstens drei Pakete (Constitution XI).
- Stack gemäß `global/tech-stack.md`: Node.js 24 LTS, pnpm-Workspaces + Turborepo, TypeScript strict/ESM, Biome, Vitest + fast-check, JSON Schema + Ajv (TS-Typen aus dem Schema generiert).
- Lizenz: **MIT** (entschieden 2026-09-18). Schriften und Icons müssen MIT-kompatibel sein (MIT, OFL, Apache-2.0, ISC).
- Sprache in Code, Kommentaren, Fehlermeldungen und Doku: **Englisch**, Fachbegriffe aus der Terminologio in **Esperanto** (entschieden 2026-09-18).
- Repository-Hosting: **GitHub** (`github.com/thojank/fundamento`), CI: **GitHub Actions** (entschieden 2026-09-18).
- Test-first (Artikel X): Für jede FR existieren fehlschlagende Tests, bevor die Implementierung beginnt.

---

## Edge Cases

- **Zyklische Aliasse**, auch über Set-Grenzen hinweg, die erst nach der Überlagerung entstehen (`a → b` in `core`, `b → a` in `color-scheme/dark`): Die Validierung prüft Zyklen für jede Kombination, nicht nur pro Set.
- **Alias auf Token, das nur in einem Dimensio-Set existiert**: gültig nur, wenn es in jeder Kombination auflösbar ist; sonst Fehler mit der ersten nicht auflösbaren Kombination.
- **Set definiert ein Token, das es in `core` nicht gibt**: Fehler, denn Sets dürfen nur überschreiben, nicht neu einführen. So hat jede Kombination dieselbe Token-Menge.
- **Konjunktions-Set mit widersprüchlichen Bedingungen** (`color-scheme=light+color-scheme=dark`) oder mit unbekanntem Dimensio-Wert: Fehler bei der Validierung.
- **Zwei aktive Sets mit gleicher Priorität und gleicher Spezifität** überschreiben dasselbe Token: erlaubt, Reihenfolge stabil nach Set-Name; die Validierung meldet es als Warnung, weil es meist ein Modellierungsfehler ist.
- **Set ändert den `$type` eines Tokens**: Fehler.
- **Partielle Belegung / unbekannter Dimensio-Wert** bei der Auflösung: Fehlende Dimensioj nehmen den Standardwert; unbekannte Werte oder Dimensioj sind ein Fehler mit Liste der erlaubten Werte.
- **Reine Zahlensegmente** (`blue.600`): gültig; TypeScript-Ableitung mit Klammernotation, CSS/Figma unverändert.
- **Einsegment-Namen** (`opacity`): gültig, sofern die Grammatik erfüllt ist.
- **Kontrastpaar mit transparentem Vordergrund**: Alpha-Komposition gegen den Hintergrund vor der Berechnung; ein transparenter Hintergrund ist ein Fehler im KontrastParo.
- **Zwei Tokens mit gleichem Pfad in derselben Set-Datei** (JSON-Duplikatschlüssel): Fehler, denn der Parser muss Duplikate erkennen statt still zu überschreiben.

---

## Akzeptanzkriterien

- AK-01: Frischer Klon → `pnpm install`, `pnpm build`, `pnpm check` grün in unter fünf Minuten auf einem Standard-Laptop; kein manueller Schritt außer den drei dokumentierten Befehlen.
- AK-02: Mindestens acht Negativ-Fixtures für die Validierung (S2, Edge Cases) schlagen mit korrekter Pfad-/Regelangabe fehl, darunter: Namensgrammatik, unbekannter Typ, Typ/Wert-Mismatch, fehlendes Alias-Ziel, Typ-fremder Alias, Zyklus über Set-Grenzen, doppelte ID, wiederverwendete `retired`-ID. Alle Positiv-Fixtures bestehen.
- AK-03: Für jedes Celo aus FR-13 mindestens zehn Fixtures inkl. Grenzfälle; Injektivität und Umkehrbarkeit sind als Eigenschaftstests (fast-check) über zufällige grammatikkonforme Namen geprüft.
- AK-04: Auflösung (S4) liefert für alle 72 Kombinationen eindeutige Werte mit Herkunft; ein Test zeigt, dass die Prioritätsreihenfolge respektiert wird, ein weiterer, dass spätes Binden gilt, ein dritter, dass ein Konjunktions-Set über dem gleichnamigen Einzel-Set gewinnt.
- AK-05: Alle vier Prüfungen und die Clean-Room-Prüfung laufen in CI als getrennte Schritte; je ein Fixture beweist, dass jede Prüfung fehlschlagen *kann*.
- AK-06: `modelo.json` beantwortet den Beispieldialog aus S6 vollständig; ein Test rechnet die Antwort aus dem Export nach.
- AK-07: Clean-Room-Prüfung (S7) besteht; ein Fixture mit fremdem Präfix lässt sie fehlschlagen.
- AK-08: `specs/000-fundamento-repo/plan.md` enthält den Constitutional Compliance Review für alle dreizehn Artikel; Ausnahmen (u. a. die `px`-Auslegung, FR-09a) sind im Complexity Tracking bzw. Review begründet.
- AK-09: Keine offene `[NEEDS CLARIFICATION]`-Markierung in dieser Spec vor Build-Start.
- AK-10: Zweimaliger Build erzeugt byte-identische `modelo.json`, `modelo.schema.json` und `rezolvoj.json` (Artikel I).
- AK-12: `modelo.json` enthält keine Celo-spezifischen Zuordnungen (z. B. Tailwind-Namespaces); ein Test prüft das Schema darauf (Artikel VIII).
- AK-13: Die Alirebleco-Prüfung schlägt mit einem Fixture fehl, das in `contrast=default` besteht, in `contrast=high` aber unter 7:1 liegt.
- AK-11: Quickstart-Szenario in der README: Vortaro-Ordner manuell in Penpot importieren; das Ergebnis (gelungen oder mit dokumentierten Abweichungen) steht in `plan.md`.

---

## Hinweise für den Plan

- Die Abdeckungs-Checkliste der Token-Kategorien eines reifen Systems liegt in `research.md`. Sie ist für Phase 0 nicht bindend (Test-Aspekto), für Phase 1 aber die Messlatte; das Schema muss alle dort genannten Typen ausdrücken können.
- Die Alirebleco-Prüfung: WCAG 2.x bindend, APCA informativ (Entscheidung aus `research.md` §3 übernommen). Die Metrik muss austauschbar sein.
- Die Tokens-Studio-Konvention für `$themes.json` ist in `research.md` mit Quelle beschrieben; sie ist so umzusetzen, dass ein Export ohne Konverter in Penpot importierbar ist. Falls Penpot das DTCG-2025.10-Objektformat (noch) nicht liest, wird das im Quickstart dokumentiert und nicht durch einen Formatwechsel im Modelo gelöst (siehe „Nicht im Scope").
- Die Figma-Projekcio (Phase 5) braucht je Dimensio eine Variablen-Collection; das Modelo muss das ohne Umbau hergeben.

---

## Entscheidungslog (Review 2026-09-19)

| Thema | Entscheidung |
|---|---|
| Tailwind-Namen vs. `--fm-`-Regel | Tailwind v4 `prefix(fm)`; keine Ausnahme von FR-14 |
| Namensgrammatik | Segmente nur `[a-z0-9]+`; macht Ableitungen trivial injektiv und umkehrbar |
| DTCG-Version / Einheiten | DTCG 2025.10 (Objektformat); `px` als plattformneutrale Referenzeinheit |
| Spec-Kit | p0 schreibt `plan.md` mit Compliance Review ins Repo und synchronisiert `spec.md` |
| Dimensioj | sechs Dimensioj mit Werten und Priorität laut FR-11a, 72 Kombinationen |
| Alias-Auflösung | Spätes Binden nach Überlagerung |
| IDs und Rollen | `$extensions["com.ciferecigo.fundamento"]`, opake ULID-IDs, `ids.lock.json`; KontrastParo als eigene Entität |
| Test-Aspekto | alle zehn Typen, ca. 30 Tokens; Dialog-Zahlen werden aus dem Export berechnet |
| Clean Room | fünfter, eigener CI-Schritt `check:clean-room` |
| Stack | aus `global/tech-stack.md` übernommen; Node 24 LTS. Turborepo für drei Pakete im Complexity Tracking begründen (Art. XI) |
| Kombinations-Sets (Abnahme) | Sets binden an Konjunktionen von Dimensio-Werten; Spezifität entscheidet bei gleicher Priorität; Fixture in Phase 0 |
| Tailwind-Tabelle (Abnahme) | Namespace-Zuordnung ist Paketcode der NomRegulo, nicht Modelo-Daten (Art. VIII) |
| Kontrastschwellen (Abnahme) | Schwellen je `contrast`-Wert: default AA, high AAA |
| Export (Abnahme) | `modelo.json` mit Standardauflösung, alle Kombinationen in `rezolvoj.json` |

---

## Review-Checkliste

- [x] Alle Anforderungen beschreiben *was* und *warum*, nicht *wie*
- [x] Jede Anforderung ist testbar und einem Akzeptanzkriterium zugeordnet
- [x] Keine offenen `[NEEDS CLARIFICATION]`
- [x] Constitution-Artikel I–XIII berücksichtigt; Abweichungen benannt (`px`-Referenzeinheit Art. VIII, Turborepo Art. XI → Compliance Review in `plan.md`)
- [x] Nicht-Scope ist explizit
