# Fundamento – Constitution

Version 1.2 · 2026-09-18 · Status: ratifiziert

Fundamento ist ein maschinenlesbares, nativ mehrmarkenfähiges Design System. Sein kanonischer Zustand ist ein Datenmodell; Figma, Code, Dokumentation und Werkzeuge sind Projektionen dieses Modells. Diese Constitution definiert die Prinzipien, gegen die jede Spezifikation, jeder Plan und jede Implementierung geprüft wird. Sie ist bewusst kurz. Was hier nicht steht, ist verhandelbar; was hier steht, nicht.

---

## Terminologio (verbindliches Vokabular)

Fundamento verwendet Esperanto als Fachsprache. Die Begriffe sind im Modell, im Code, in Figma und in der Kommunikation identisch zu verwenden. Keine Synonyme, keine Übersetzungen in Bezeichnern.

| Begriff | Bedeutung | Verwendung |
|---|---|---|
| **Fundamento** | Das System als Ganzes; der unantastbare Kern | Paketscope `@fundamento/*`, CSS-Präfix `--fm-`, Custom-Element-Präfix `fm-` |
| **Modelo** | Das kanonische Datenmodell (Single Source of Truth) | `packages/modelo` |
| **Vortaro** | Das Token-Vokabular: Namen, Typen, Alias-Ketten | Token-Ebene des Modelo |
| **Aspekto** | Eine Markenausprägung (Brand Theme) des Systems | `aspekto: ciferecigo`, `aspekto: neutra` |
| **Dimensio** | Eine Adaptionsdimension (Farbmodus, Dichte, Kontrast, …) | Figma-Mode ≙ Dimensio-Wert |
| **Ero** | Eine Komponente (Element) | `fm-butono`, `packages/eroj` |
| **Skemo** | Die maschinenlesbare Spezifikation eines Ero | `eroj/butono/skemo.json` |
| **Regularo** | Regelsammlung mit Begründungen (Constraints, Kompositionsregeln) | Teil des Modelo |
| **Jugxo** | Ein Einzelurteil: Präzedenzfall mit Begründung, positiv oder negativ | Sammlung im Regularo |
| **Sxablono** | Template / Pattern (Layout, Seitentyp, Flow) | `packages/sxablonoj` |
| **Projekcio** | Eine Ableitung aus dem Modelo (CSS, Figma, Doku, …) | `packages/projekcioj/*` |
| **Enportilo** | Brand Design Importer | `packages/enportilo` |
| **Agordilo** | Brand Design Configurator | `packages/agordilo` |
| **Gvidanto** | Der Doku-Agent („was gibt's hier?") | `packages/gvidanto` |
| **Celo** | Ein Ausgabeziel einer Projekcio (Tailwind, daisyUI, Penpot, …) | `projekcioj/<celo>` |

Schreibweise in Bezeichnern: Esperanto-Sonderzeichen werden nach x-Konvention geschrieben (`ĵ → jx`, `ŝ → sx`), damit Paketnamen, Dateinamen und URLs ASCII bleiben. In Prosa darf die Originalschreibweise verwendet werden.

---

## Artikel I – Modelo-First

Jede Information über das System existiert genau einmal, im Modelo. Tokens, Eroj, Skemoj, Regularo, Sxablonoj und Aspektoj sind Einträge des Modelo mit stabilen IDs und JSON-Schema. Alles andere (CSS, Web Components, Framework-Wrapper, Figma-Variablen, Figma-Komponenten, Dokumentation, CLI-Ausgaben) wird aus dem Modelo generiert und ist nicht handeditierbar. Eine Änderung, die nicht im Modelo beginnt, ist ein Fehler.

Prüfkriterium: Löscht man alle Projekcioj, lässt sich das System aus dem Modelo vollständig regenerieren, byte-identisch.

## Artikel II – Unu Vortaro (ein Vokabular)

Ein Name, überall. Ein Token, ein Prop, ein Zustand, eine Dimensio hat genau einen kanonischen Namen im Modelo. Alle Projekcioj leiten ihre Bezeichner mechanisch daraus ab:

- Token `color.action.primary.rest` → Figma-Variable `color/action/primary/rest` → CSS `--fm-color-action-primary-rest` → TypeScript `vortaro.color.action.primary.rest`
- Ero-Prop `variant: primary | secondary | tertiary` → Figma-Property `variant` mit identischen Werten → Code-Prop `variant` mit identischem Enum
- Dimensio `density: compact | default | comfortable` → Figma-Mode `density` mit identischen Werten

Code Connect verbindet jede Figma-Komponente mit ihrer Code-Komponente. Ein Lint-Schritt bricht den Build, wenn Figma und Code voneinander abweichen. Benennung wird generiert, nie vereinbart.

## Artikel III – Masxinlegebleco (Maschinenlesbarkeit zuerst)

Der primäre Konsument des Systems ist ein Agent, nicht ein Mensch. Der MCP-Server über dem Modelo ist die erste Schnittstelle, die gebaut wird, nicht die letzte. Jede Frage, die ein Mensch an das System stellen könnte, muss ein Agent per MCP beantwortet bekommen: welche Eroj es gibt, welche Props, welche Regeln, welche Tokens für Aspekto X in Dimensio Y, ob ein gegebener Screen konform ist.

Der Zielablauf ist verbindlich: Ein Agent entwirft per MCP in Figma aus Library-Instanzen mit gebundenen Variablen. Ein Coding-Tool liest den Entwurf, findet über Code Connect zu jeder Instanz die Code-Komponente und erzeugt Code, der Tokens referenziert. Ein Prüf-Agent vergleicht Entwurf und Code gegen das Modelo. Jede Spec muss angeben, wie sie diesen Ablauf verbessert oder erhält.

## Artikel IV – Nativa Multmarkeco (native Mehrmarkenfähigkeit)

Fundamento kennt keine Standardmarke, die andere Marken überschreiben. Jeder Aspekto ist eine vollständige Belegung des Vortaro; `neutra` ist ein Aspekto wie jeder andere und dient nur als Referenzimplementierung. Adaption ist nicht auf Farbe und Schrift beschränkt: Jede Dimensio kann jeden Token-Typ betreffen (Spacing, Grid, Radius, Elevation, Motion, Typografie, Ikonografie).

Das Vortaro ist von Anfang an **mehrdimensional**: Jede Dimensio ist ein eigenes Token-Set, das nur die Tokens enthält, die sie verändert; aktive Werte überlagern sich in definierter Reihenfolge. Flache Theme-Listen (eine Datei pro Kombination) sind unzulässig. Dimensioj sind orthogonal und kombinierbar. Die initialen Dimensioj sind `aspekto`, `color-scheme`, `density`, `contrast`, `motion`, `viewport`. Weitere Dimensioj werden durch Spec eingeführt, nie ad hoc. Die Auflösungsreihenfolge bei Konflikten ist im Modelo definiert und für alle Projekcioj identisch.

## Artikel V – Pura Cxambro (Clean Room)

Fundamento ist eigenständig. Es enthält keine Token-Namen, Werte, Code, Texte, Beispiele, Icons, Schriften, Logos oder Bezeichner aus einem anderen Design System. Andere Systeme dienen ausschließlich als Benchmark: Aus ihnen werden abstrakte Anforderungen abgeleitet (welche Themen, welche Komponenten, welche Zustände ein reifes System abdeckt), nie Inhalte.

Regeln für jede Spec und jeden Plan:
- Quellmaterial anderer Systeme wird dem Coding-Tool nicht vorgelegt. Es erhält nur abstrahierte Checklisten.
- Wo ein Bereich neu aufgebaut wird (UX Writing, Motion, Barrierefreiheit, Datenvisualisierung, Contribution), wird vorher der weltweit stärkste öffentliche Benchmark recherchiert, benannt und als Anforderungsquelle dokumentiert (`research.md`).
- Schriften und Icon-Sets sind Open Source mit permissiver Lizenz. Fremde Marken kommen ausschließlich über den Enportilo als Aspekto ins System, und nur mit nachgewiesenen Rechten.

## Artikel VI – Regularo kun Kialoj (Regeln mit Gründen)

Jede Regel im System trägt ihre Begründung. Ein Constraint ohne `kialo` (Grund) ist ungültig. Beispiel: „Ein Container hat höchstens eine primäre Aktion, weil zwei gleichrangige Handlungsaufforderungen die Entscheidung auf den Nutzer verlagern." Die Begründung ist maschinenlesbar und wird vom Gvidanto und vom Prüf-Agenten zitiert.

Das Regularo wächst durch Jugxoj: Jede Entscheidung über Konformität oder Abweichung wird als Präzedenzfall mit Grund gespeichert, Ablehnungen ebenso wie Freigaben. Das Regularo ist damit keine Verfassung, die vorab alles regelt, sondern eine Rechtsprechung, die aus Fällen lernt. Wenige Invarianten sind fest; alles andere darf innerhalb der Invarianten variieren.

## Artikel VII – Agenta Dokumentado (agentische Dokumentation)

Es gibt keine handgeschriebene Dokumentation. Der Gvidanto beantwortet Fragen aus dem Modelo, erzeugt Beispiele auf Anfrage live in Code und Figma, erklärt Regeln mit ihren Kialoj und schlägt für ein beschriebenes Ziel passende Eroj und Sxablonoj vor. Statische Seiten sind ein generierter Cache für Suchmaschinen und Offline-Nutzung, nie die Quelle.

Jede Spec, die Wissen ins System bringt (neue Eroj, Regeln, Sxablonoj), muss angeben, welche Fragen der Gvidanto danach zusätzlich beantworten kann, mit mindestens einem Beispiel-Dialog als Akzeptanzkriterium.

## Artikel VIII – Retejo Unue, Movebla Modelo (Web-first, mobilfähiges Modell)

Die erste Plattform ist das Web (Web Components als Kern, Framework-Wrapper als Projekcioj). Das Modelo ist plattformneutral: Token-Typen, Ero-Skemoj und Dimensioj enthalten nichts Web-Spezifisches. Eine Projekcio für SwiftUI oder Compose muss ohne Änderung am Modelo möglich sein. Eine Spec, die Web-Begriffe (Pixel, CSS-Eigenschaften, DOM) ins Modelo einführt, verletzt diesen Artikel.

## Artikel IX – Vertikala Tranĉo (vertikaler Durchstich vor Breite)

Jede neue Fähigkeit wird zuerst an einem einzigen Ero durch alle Ebenen gezogen (Modelo → alle Projekcioj → Gvidanto → Prüfung), bevor sie in die Breite geht. Der erste Durchstich ist `butono`. Eine Spec, die Breite vor Tiefe fordert, wird zurückgewiesen.

## Artikel X – Kontrolo kaj Konformeco (Test-first und Konformität)

Vor jeder Implementierung existieren Tests, die fehlschlagen. Für Fundamento gelten zusätzlich vier Konformitätsprüfungen, die in CI laufen und deren Verletzung den Build bricht:

1. **Vortaro-Lint**: keine Hardcodes in Projekcioj; jeder Wert ist ein Token-Verweis.
2. **Parität**: Figma-Library und Code-Komponenten stimmen in Props, Werten und Zuständen überein (Code Connect).
3. **Regularo**: jeder Constraint hat einen Kialo; jedes Beispiel im System ist konform oder als Jugxo-Ausnahme markiert.
4. **Alirebleco** (Barrierefreiheit): Kontrast pro Aspekto × Dimensio, Fokus, Tastatur, ARIA, geprüft mit dem in `research.md` benannten Benchmark-Werkzeug.

## Artikel XI – Simpleco (Einfachheit)

Höchstens drei Pakete pro Phase neu. Keine Abstraktion ohne zweiten konkreten Nutzer. Framework-Funktionen werden direkt verwendet, nicht gewrappt. Abweichungen werden in `plan.md` unter „Complexity Tracking" begründet und laufen als Schuld im Backlog.

## Artikel XII – Interoperebleco (Interoperabilität statt Insel)

Fundamento ersetzt keine Werkzeuge, es speist sie. Das W3C-DTCG-Format (Design Tokens Format Module) ist das **einzige zulässige Speicherformat** des Vortaro. Solange DTCG keine standardisierte Theme-Beschreibung hat, werden Sets und mehrdimensionale Themes nach der Tokens-Studio-Konvention (`$themes.json`, `$metadata.json`) beschrieben; der Wechsel auf den DTCG-Standard ist dann eine Migration im Modelo, nie in den Projekcioj. Damit ist das Vortaro ohne Konverter in Tokens Studio, Penpot (native Tokens) und DTCG-fähigen Figma-Plugins nutzbar; Figma-Variablen werden zusätzlich direkt generiert.

Verbindliche Celoj (Ausgabeziele) der Projekcioj, in dieser Priorität:

1. **CSS Custom Properties** (`--fm-*`) als Basis für alles Weitere
2. **Tailwind v4** (`@theme`-Block, jeder Aspekto × Dimensio als CSS-Schicht) und darauf **daisyUI**-Themes
3. **shadcn-kompatible Registry**: Eroj als kopierbarer Quellcode per CLI, mit `--fm-*`-Variablen statt Hardcodes
4. **Web Components** (`fm-*`) mit Wrappern für React, Vue, Angular, Svelte
5. **Figma** (Variablen mit Modes, Library, Code Connect) und **Penpot** (DTCG-Import, Tokens, Komponenten), Penpot nachrangig, aber im Modelo von Anfang an mitgedacht
6. **Tokens Studio** (Sync in beide Richtungen über das DTCG-Repo)

Ein neues Celo wird durch Spec eingeführt und muss aus dem Modelo ohne Modeländerung erzeugbar sein (Artikel I). Welche Frameworks aktuell relevant sind, wird pro Phase gegen den Markt geprüft (`research.md`); die Liste oben ist der Stand von 2026-09.

## Artikel XIII – Simpleco de Uzo (Einfachheit der Nutzung)

Der Benchmark für Entwickler ist `npx shadcn add button`: ein Befehl, keine Konfiguration, Ergebnis im eigenen Code, sofort anpassbar. Fundamento erreicht dasselbe mit `npx fundamento add butono` (oder `fm add butono`), `fm init` für ein neues Projekt und `fm aspekto use ciferecigo` für den Markenwechsel. Jeder Befehl funktioniert ohne vorherige Konfiguration und erklärt sich selbst.

Der Benchmark für Designer ist: eine Library aktivieren, Mode wechseln, fertig. In Figma bedeutet das eine Library je Fundamento-Version mit allen Aspektoj als Modes, kein Plugin nötig; Tokens Studio und Penpot sind optionale Wege für dieselben Daten. Ein Designer darf nie einen Token-Namen tippen müssen.

Prüfkriterium für jede Spec: Ein Entwickler ohne Vorwissen nutzt ein Ero in unter fünf Minuten; ein Designer wechselt einen Aspekto in unter einer Minute. Beides wird als Quickstart-Szenario getestet.

---

## Governance

- Diese Constitution ändert sich nur durch eine Spec mit dem Titel „Constitution Amendment", die den geänderten Artikel, den Grund und die Migration bestehender Artefakte beschreibt.
- Jeder `plan.md` enthält einen Abschnitt „Constitutional Compliance Review" mit einem Eintrag pro Artikel: konform / Ausnahme mit Grund.
- `/speckit.analyze` prüft jede Phase gegen diese Constitution, bevor Tasks erzeugt werden.
- Die Constitution hat Vorrang vor jeder anderen Praxis, jedem Template und jeder Bequemlichkeit.

---

## Phasenfolge (Referenz, nicht normativ)

| Phase | Spec | Ergebnis |
|---|---|---|
| 0 | Fundamento-Repo, Modelo-Schema, Vortaro-Spezifikation (DTCG) | Baubares Monorepo, leeres Modelo mit Schema, CI mit den vier Prüfungen |
| 1 | Vortaro + Dimensioj + MCP-Server | Aspekto `neutra` und `ciferecigo`, MCP beantwortet Token-Fragen |
| 2 | Regularo + Gvidanto (Kern) | Regeln mit Kialoj, erster Dialog „was gibt's hier?" |
| 3 | Ero `butono` als Durchstich | Modelo → Web Component → CSS → Figma → Code Connect → Gvidanto → Prüfung |
| 4 | Eroj in der Breite, Sxablonoj | Abdeckung eines reifen Systems |
| 5 | Figma-Library-Generator, Penpot-Export, Icon- und Font-Pipeline | Publizierbare Library je Aspekto, Penpot-Paket |
| 6 | CLI + Registry | `fm init / add / aspekto / lint / sync / export`, shadcn-kompatible Registry |
| 7 | Agordilo + Enportilo | Fremde Marke in unter einer Stunde als Aspekto |
| 8 | Design-Agenten + Eval | Agent baut Screen per MCP konform ohne Korrektur |
| 9 | Release, Governance, Cache-Site | Versionierung, Deprecation, Contribution |
