# Fundamento – Constitution

Version 2.0 · 2026-09-24 · Status: ratifiziert

Fundamento ist ein maschinenlesbares, nativ mehrmarkenfähiges Design System. Sein kanonischer Zustand ist ein Datenmodell; Figma, Code, Dokumentation und Werkzeuge sind Projektionen dieses Modells. Diese Constitution definiert die Prinzipien, gegen die jede Spezifikation, jeder Plan und jede Implementierung geprüft wird. Sie ist bewusst kurz. Was hier nicht steht, ist verhandelbar; was hier steht, nicht.

---

## Terminologio (verbindliches Vokabular)

Fundamento verwendet Esperanto als Fachsprache. Die Begriffe sind im Modell, im Code, in Figma und in der Kommunikation identisch zu verwenden. Keine Synonyme, keine Übersetzungen in Bezeichnern.

| Begriff | Bedeutung | Verwendung |
|---|---|---|
| **Fundamento** | Das System als Ganzes; der unantastbare Kern | Paketscope `@fundamento/*`, CSS-Präfix `--fm-`, Custom-Element-Präfix `fm-` |
| **Modelo** | Das kanonische Datenmodell (Single Source of Truth) | `packages/modelo` |
| **Vortaro** | Das Token-Vokabular: Namen, Typen, Alias-Ketten | Token-Ebene des Modelo |
| **Aspekto** | Eine Markenausprägung (Brand Theme) des Systems; ein eigenes Paket, das im Kern-Repo oder außerhalb liegen kann | `aspekto: komuna` (Referenz, MIT), `aspekto: ciferecigo` (extern, proprietär) |
| **Dimensio** | Eine Adaptionsdimension (Farbmodus, Dichte, Kontrast, …) | Figma-Mode ≙ Dimensio-Wert |
| **Ero** | Eine Komponente (Element) | `fm-butono`, `packages/eroj` |
| **Skemo** | Die maschinenlesbare Spezifikation eines Ero | `eroj/butono/skemo.json` |
| **Regularo** | Regelsammlung mit Begründungen (Constraints, Kompositionsregeln) | Teil des Modelo |
| **Jugxo** | Ein Einzelurteil: Präzedenzfall mit Begründung, positiv oder negativ | Sammlung im Regularo |
| **Manko** | Eine gemessene Lücke eines Werkzeugs: Was das Modelo ausdrückt und ein Celo nicht tragen kann, mit Beleg im Wortlaut und Schließbedingung | `packages/modelo/data/mankoj.json` |
| **Sxablono** | Template / Pattern (Layout, Seitentyp, Flow) | `packages/sxablonoj` |
| **Projekcio** | Eine Ableitung aus dem Modelo (CSS, Figma, Doku, …) | `packages/projekcioj/*` |
| **Enportilo** | Brand Design Importer | `packages/enportilo` |
| **Agordilo** | Brand Design Configurator | `packages/agordilo` |
| **Gvidanto** | Der Doku-Agent („was gibt's hier?") | `packages/gvidanto` |
| **Celo** | Ein Ausgabeziel einer Projekcio (Tailwind, daisyUI, Penpot, …) | `projekcioj/<celo>` |
| **Aspiro** | Ein messbares Entwurfsziel einer einzelnen Marke, mit Kialo; es gilt nur für sie, nie für andere Aspektoj | `aspekto.json#/aspiroj` |
| **Tavolo** | Eine Schicht eines Aspekto-Pakets; das Vortaro ist die Schicht `vida` (visuell), weitere Schichten (Sprache, Verhalten) folgen durch Spec | `aspekto.json#/tavoloj/vida` |
| **Ontologio** | Die maschinenlesbare Fassung dieser Terminologie: Begriffe, Definitionen, Beziehungen | `packages/modelo/data/ontologio.json` |

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

Die Terminologie dieser Constitution existiert zusätzlich als **Ontologio**: eine maschinenlesbare Datei mit einer stabilen URI, einer Definition und den erlaubten Beziehungen je Begriff. Ein Agent muss jeden Begriff des Systems erfragen können, ohne diese Constitution zu lesen. Die Tabelle oben und die Ontologio dürfen nicht auseinanderlaufen; CI prüft das. Jeder Export des Modelo ist damit auch als Wissensgraph lesbar; die Serialisierung als JSON-LD ist eine Projekcio (Phase 5).

Der Zielablauf ist verbindlich: Ein Agent entwirft per MCP in Figma aus Library-Instanzen mit gebundenen Variablen. Ein Coding-Tool liest den Entwurf, findet über Code Connect zu jeder Instanz die Code-Komponente und erzeugt Code, der Tokens referenziert. Ein Prüf-Agent vergleicht Entwurf und Code gegen das Modelo. Jede Spec muss angeben, wie sie diesen Ablauf verbessert oder erhält.

## Artikel IV – Nativa Multmarkeco (native Mehrmarkenfähigkeit)

Fundamento kennt keine Standardmarke, die andere Marken überschreiben. Jeder Aspekto ist eine vollständige Belegung des Vortaro: Er überschreibt jeden Token des Kerns, und die Validierung erzwingt diese Vollständigkeit. Der Kern (`core`) trägt Struktur, Typen und die Werte der Referenzmarke `komuna`; `komuna` ist damit ein Aspekto wie jeder andere, nur einer, dessen Werte der Kern für Werkzeuge vorhält, die eine Belegung brauchen. Kein anderer Aspekto erbt Werte von `komuna` oder vom Kern. Aspektoj sind eigene Pakete: Sie dürfen im Kern-Repo liegen (`komuna`, MIT) oder außerhalb, mit eigener Lizenz und eigenen Rechten (z. B. `ciferecigo`), und werden über eine Konfiguration eingebunden. Adaption ist nicht auf Farbe und Schrift beschränkt: Jede Dimensio kann jeden Token-Typ betreffen (Spacing, Grid, Radius, Elevation, Motion, Typografie, Ikonografie).

Das Vortaro ist von Anfang an **mehrdimensional**: Jede Dimensio ist ein eigenes Token-Set, das nur die Tokens enthält, die sie verändert; aktive Werte überlagern sich in definierter Reihenfolge. Flache Theme-Listen (eine Datei pro Kombination) sind unzulässig. Dimensioj sind orthogonal und kombinierbar. Die initialen Dimensioj sind `aspekto`, `color-scheme`, `density`, `contrast`, `motion`, `viewport`. Weitere Dimensioj werden durch Spec eingeführt, nie ad hoc. Die Auflösungsreihenfolge bei Konflikten ist im Modelo definiert und für alle Projekcioj identisch.

## Artikel V – Pura Cxambro (Clean Room)

Fundamento ist eigenständig. Es enthält keine Token-Namen, Werte, Code, Texte, Beispiele, Icons, Schriften, Logos oder Bezeichner aus einem anderen Design System. Andere Systeme dienen ausschließlich als Benchmark: Aus ihnen werden abstrakte Anforderungen abgeleitet (welche Themen, welche Komponenten, welche Zustände ein reifes System abdeckt), nie Inhalte.

Regeln für jede Spec und jeden Plan:
- Quellmaterial anderer Systeme wird dem Coding-Tool nicht vorgelegt. Es erhält nur abstrahierte Checklisten.
- Wo ein Bereich neu aufgebaut wird (UX Writing, Motion, Barrierefreiheit, Datenvisualisierung, Contribution), wird vorher der weltweit stärkste öffentliche Benchmark recherchiert, benannt und als Anforderungsquelle dokumentiert (`research.md`).
- Schriften und Icon-Sets im Kern-Repo sind Open Source mit permissiver Lizenz. Ein Aspekto darf proprietäre Schriften und Assets verwenden; sie werden als Familienname referenziert und mit Fallback versehen, die Dateien liegen nie im Kern-Repo, sondern im Aspekto-Paket oder werden zur Laufzeit geladen. Fremde Marken kommen ausschließlich über den Enportilo als Aspekto ins System, und nur mit nachgewiesenen Rechten.


**Benchmark-Aspekto.** Ein fremdes System mit offener, nachgewiesener Lizenz darf als Benchmark-Aspekto importiert werden, um es mit denselben Prüfungen zu messen. Import und Pflege laufen in einem eigenen Repo und einer eigenen Coding-Sitzung; das Kern-Repo erhält nur Kennzahlen und Fingerprints, nie Werte, Namen oder Quellmaterial. Die Clean-Room-Prüfung des Kerns prüft gegen die Fingerprints jedes Benchmark-Aspekto. Gestaltungsarbeit an Aspektoj des Kerns sieht nur Kennzahlen.

Die Regel „Quellmaterial anderer Systeme wird dem Coding-Tool nicht vorgelegt." gilt weiter für das Kern-Repo und jede Sitzung, die daran arbeitet.

**Öffentlich beobachtbare Erscheinung ist kein Quelltext.** Was an einer veröffentlichten Oberfläche zu sehen und zu messen ist — eine Farbe auf dem Bildschirm, ein Abstand, eine Schriftgröße, der Name einer Schriftfamilie —, ist Beobachtung, nicht Quellmaterial. Dieser Artikel verbietet die Übernahme von Quellen, Tokendateien, Bezeichnern, Code und Assets eines anderen Systems; er verbietet nicht, eine öffentliche Oberfläche zu betrachten und zu vermessen. Die Grenze verläuft nicht zwischen Auge und Werkzeug, sondern zwischen Beobachtung und Übernahme: Ein gemessener Wert darf ins System, ein abgeschriebener Name nicht. Was aus Beobachtung entsteht, trägt seine Herkunft mit (Artikel VII), und wie es verwendet werden darf, regelt Artikel VI.

## Artikel VI – Regularo kun Kialoj (Regeln mit Gründen)

Jede Regel im System trägt ihre Begründung. Ein Constraint ohne `kialo` (Grund) ist ungültig. Beispiel: „Ein Container hat höchstens eine primäre Aktion, weil zwei gleichrangige Handlungsaufforderungen die Entscheidung auf den Nutzer verlagern." Die Begründung ist maschinenlesbar und wird vom Gvidanto und vom Prüf-Agenten zitiert.

Das Regularo wächst durch Jugxoj: Jede Entscheidung über Konformität oder Abweichung wird als Präzedenzfall mit Grund gespeichert, Ablehnungen ebenso wie Freigaben. Eine Jugxo verweist auf eine Regulo, ein Ero oder einen Artikel dieser Constitution; auch Abweichungen von der Constitution selbst werden so festgehalten (erste Jugxo: `jug_01M2VRT7KQ77W91MVXB4GXSRZ4`, Artikel X, 2026-09-19). Das Regularo ist damit keine Verfassung, die vorab alles regelt, sondern eine Rechtsprechung, die aus Fällen lernt.

**Kein Trittbrett.** Was mit dem Ergebnis geschieht, gehört zur Regel. Eine Aspekto, die aus der Beobachtung einer fremden Marke entstanden ist, darf nicht so verwendet werden, dass sie mit dieser Marke verwechselbar wird. Maßstab ist die Verwechselbarkeit, nicht die Ähnlichkeit: Zwei Marken dürfen dieselbe Schriftgröße, dasselbe Raster und dasselbe Blau haben, ohne dass eine der anderen etwas nimmt. Verwechselbar wird es, wo jemand die Herkunft nicht mehr auseinanderhalten kann — im Namen, im Logo, im Auftritt als Ganzes oder in der Behauptung, das eine sei das andere. Wer eine solche Aspekto weitergibt oder veröffentlicht, wirbt nicht mit der beobachteten Marke und gibt sie nicht als Urheberin des Ergebnisses aus. Die Prüfung dieser Regel ist eine Jugxo, keine Messung: Verwechselbarkeit ist eine Frage des Eindrucks, und ein Eindruck wird begründet, nicht gerechnet.

**Lücken werden geführt (Manko).** Was ein Werkzeug nicht kann, obwohl das Modelo es ausdrückt, wird als Manko festgehalten: mit dem betroffenen Celo, der betroffenen Eigenschaft, dem Beleg im Wortlaut, dem Datum der Messung, einem Verweis nach außen und — verpflichtend — der Schließbedingung, woran ein Lauf erkennt, dass die Lücke weg ist. Eine Manko ohne Schließbedingung ist ungültig, wie ein Constraint ohne Kialo. Keine Projektion verdrahtet eine Unfähigkeit: Der Lauf versucht immer, was das Modelo verlangt, schreibt bei Ablehnung den aufgelösten Wert und meldet die Manko als offen oder geschlossen — der Versuch ist die Messung, nie eine Versionsabfrage. Jeder Lauf arbeitet alle Mankoj seines Celo ab; ein System, das seine Lücken führt, ist etwas anderes als eines, das sie verschweigt.

**Befund wird Regel.** Jeder Befund aus einer menschlichen Abnahme (visuell, redaktionell, fachlich), den keine Prüfung gefunden hat, wird als Regulo-Kandidat mit Kialo festgehalten und, wo er maschinell prüfbar ist, mit der nächsten Spec zu einer automatischen Regulo. Kontrast ist notwendig, aber nicht hinreichend: Ordnung von Flächen, Hierarchie von Textrollen und Unterscheidbarkeit von Zuständen sind ebenso prüfbare Eigenschaften einer Marke. Wenige Invarianten sind fest; alles andere darf innerhalb der Invarianten variieren.

## Artikel VII – Agenta Dokumentado (agentische Dokumentation)

Es gibt keine handgeschriebene Dokumentation. Der Gvidanto beantwortet Fragen aus dem Modelo, erzeugt Beispiele auf Anfrage live in Code und Figma, erklärt Regeln mit ihren Kialoj und schlägt für ein beschriebenes Ziel passende Eroj und Sxablonoj vor. Statische Seiten sind ein generierter Cache für Suchmaschinen und Offline-Nutzung, nie die Quelle.

Jede Spec, die Wissen ins System bringt (neue Eroj, Regeln, Sxablonoj), muss angeben, welche Fragen der Gvidanto danach zusätzlich beantworten kann, mit mindestens einem Beispiel-Dialog als Akzeptanzkriterium.

**Herkunftsnachweis.** Was importiert wird, trägt mit, woher es kommt. Jeder Import hält fest, was gelesen wurde, wann, aus welcher Quelle und in welcher Form — eine Adresse, ein Datum, die Art der Beobachtung —, und diese Angabe reist mit dem Ergebnis, nicht nur mit dem Werkzeug, das es erzeugt hat. Ohne Herkunftsnachweis ist ein Import unvollständig und keine Grundlage für eine Veröffentlichung.

Für Schriften gilt eine eigene Markierung: Eine Schrift, deren Familienname aus einer Beobachtung stammt, wird als **„Name gelesen, Lizenz ungeklärt"** geführt, bis ihre Lizenz nachgewiesen ist. Ein Name ist keine Lizenz. Die Markierung verhindert nichts und verbietet nichts; sie sorgt dafür, dass niemand die offene Frage für beantwortet hält, und sie steht dort, wo die Schrift steht, nicht in einer Fußnote.

## Artikel VIII – Retejo Unue, Movebla Modelo (Web-first, mobilfähiges Modell)

Die erste Plattform ist das Web (Web Components als Kern, Framework-Wrapper als Projekcioj). Das Modelo ist plattformneutral: Token-Typen, Ero-Skemoj und Dimensioj enthalten nichts Web-Spezifisches. Eine Projekcio für SwiftUI oder Compose muss ohne Änderung am Modelo möglich sein. Eine Spec, die Web-Begriffe (Pixel, CSS-Eigenschaften, DOM) ins Modelo einführt, verletzt diesen Artikel.

**Internacia (Internationalisierung).** Fundamento ist sprach- und schriftneutral. Eroj verwenden nur logische Richtungen (Anfang/Ende statt links/rechts), jedes Ero hat Rechts-nach-links als Testfall, verträgt Textexpansion und nimmt jeden sichtbaren Text (Labels, ARIA-Texte, Pluralformen) über Slots oder eine Nachrichten-Schnittstelle an, nie als festen String. Datum, Zahl und Währung formatiert die Anwendung; Eroj nehmen formatierte Werte an. Jede Schrift eines Aspekto deklariert die Schriftsysteme, die sie abdeckt (ISO 15924); fehlende Schriftsysteme werden über Fallbacks gedeckt, die im Aspekto stehen.

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
2. **Tailwind v4** (`@theme`-Block, jeder Aspekto × Dimensio als CSS-Schicht) und darauf **daisyUI**-Themes. Tailwind v4: Tokens im `@theme` unter dem Namensraum `fm` (`--color-fm-*` → `bg-fm-*`), nicht per `prefix()`, weil `prefix()` alle Klassen des Projekts umbenennt.
3. **shadcn-kompatible Registry**: Eroj als kopierbarer Quellcode per CLI, mit `--fm-*`-Variablen statt Hardcodes
4. **Web Components** (`fm-*`) mit Wrappern für React, Vue, Angular, Svelte
5. **Figma** (Variablen mit Modes, Library, Code Connect) und **Penpot** (DTCG-Import, Tokens, Komponenten), Penpot nachrangig, aber im Modelo von Anfang an mitgedacht
   - **Figma Make Kit** je Aspekto: React-Paket, Tailwind-Tokens und aus dem Modelo generierte Guidelines (keine handgeschriebene Zeile, Art. VII)
6. **Tokens Studio** (Sync in beide Richtungen über das DTCG-Repo)

Ein neues Celo wird durch Spec eingeführt und muss aus dem Modelo ohne Modeländerung erzeugbar sein (Artikel I). Welche Frameworks aktuell relevant sind, wird pro Phase gegen den Markt geprüft (`research.md`); die Liste oben ist der Stand von 2026-09.

## Artikel XIII – Simpleco de Uzo (Einfachheit der Nutzung)

Der Benchmark für Entwickler ist `npx shadcn add button`: ein Befehl, keine Konfiguration, Ergebnis im eigenen Code, sofort anpassbar. Fundamento erreicht dasselbe mit `npx fundamento add butono` (oder `fm add butono`), `fm init` für ein neues Projekt und `fm aspekto use ciferecigo` für den Markenwechsel. Jeder Befehl funktioniert ohne vorherige Konfiguration und erklärt sich selbst.

Der Benchmark für Designer ist: eine Library aktivieren, Mode wechseln, fertig. In Figma bedeutet das eine Library je Fundamento-Version mit allen Aspektoj als Modes, kein Plugin nötig; Tokens Studio und Penpot sind optionale Wege für dieselben Daten. Ein Designer darf nie einen Token-Namen tippen müssen.

Prüfkriterium für jede Spec: Ein Entwickler ohne Vorwissen nutzt ein Ero in unter fünf Minuten; ein Designer wechselt einen Aspekto in unter einer Minute. Beides wird als Quickstart-Szenario getestet.

---

## Governance

- Diese Constitution ändert sich nur durch eine Spec mit dem Titel „Constitution Amendment", die den geänderten Artikel, den Grund und die Migration bestehender Artefakte beschreibt. Änderungshistorie: v1.1 Art. XII/XIII ergänzt; v1.2 DTCG verbindlich, Mehrdimensionalität; v1.3 (Spec 001) Art. IV Aspekto-Pakete und Vollständigkeit, Art. V Schriften je Aspekto, Art. VI Jugxo-Bezug auf Artikel; v1.4 (Spec 002) Terminologie Tavolo und Ontologio, Art. III Ontologio, Art. VI Befund wird Regel, Art. VIII Internacia; v1.5 (Spec 003) Art. XII Celo Figma Make Kit, Verweis auf `docs/vojmapo.md`; v1.6 (Spec 003) Art. XII Tailwind-Namensraum `fm` im `@theme` statt `prefix(fm)` (bricht die Tailwind-NomRegulo, Jugxo zu Art. XII); v1.7 (Spec 004) Art. V Benchmark-Aspekto (fremde Systeme als eigene Aspektoj in getrennten Repos, Kern erhält nur Kennzahlen und Fingerprints) und Terminologie um **Aspiro** ergänzt; v1.9 (Spec 003, F41) Art. VI Lücken werden geführt und Terminologie um **Manko** ergänzt (neue Datenart `data/mankoj.json`, eigene Prüfung `check:mankoj` in der CI); v2.0 (Spec 003, F33) Art. V öffentlich beobachtbare Erscheinung ist kein Quelltext, Art. VI **Kein Trittbrett** (Verwendung des Ergebnisses, Maßstab Verwechselbarkeit), Art. VII **Herkunftsnachweis** je Import und die Markierung „Name gelesen, Lizenz ungeklärt" für jede gelesene Schrift — als v1.8 entworfen und nach v1.9 gelandet; die Nummer folgt der Landung, nicht dem Entwurf, eine v1.8 hat es nie gegeben.
- Jeder `plan.md` enthält einen Abschnitt „Constitutional Compliance Review" mit einem Eintrag pro Artikel: konform / Ausnahme mit Grund.
- `/speckit.analyze` prüft jede Phase gegen diese Constitution, bevor Tasks erzeugt werden.
- Die Constitution hat Vorrang vor jeder anderen Praxis, jedem Template und jeder Bequemlichkeit.

---

## Phasenfolge (Referenz, nicht normativ)

Der gepflegte End-to-End-Fahrplan mit Status, Querschnittsthemen und Ideen steht in [`docs/vojmapo.md`](../../docs/vojmapo.md); die Tabelle unten ist die Kurzfassung.

| Phase | Spec | Ergebnis |
|---|---|---|
| 0 | Fundamento-Repo, Modelo-Schema, Vortaro-Spezifikation (DTCG) | Baubares Monorepo, leeres Modelo mit Schema, CI mit den vier Prüfungen |
| 1 | Vortaro mit echten Werten, Aspekto-Pakete, MCP-Server | Aspekto `komuna` (Referenz, Geist), externes Aspekto-Paket `ciferecigo`, MCP beantwortet Token-Fragen |
| 2 | Regularo + Gvidanto (Kern) + Ontologio | Befunde aus Phase 1 als automatische Reguloj, komuna repariert, Gvidanto-Werkzeuge (warum, Kontrast, Begriffe), Ontologio |
| 3 | Ero `butono` als Durchstich | Modelo → CSS/Tailwind → Web Component + React → Figma → Zuordnung Figma↔Code → Figma Make Kit → Gvidanto → Prüfung |
| 4 | Eroj in der Breite, Sxablonoj | Abdeckung eines reifen Systems |
| 5 | Figma-Library-Generator, Penpot-Export, Icon- und Font-Pipeline | Publizierbare Library je Aspekto, Penpot-Paket |
| 6 | CLI + Registry | `fm init / add / aspekto / lint / sync / export`, shadcn-kompatible Registry |
| 7 | Agordilo + Enportilo | Fremde Marke in unter einer Stunde als Aspekto |
| 8 | Design-Agenten + Eval | Agent baut Screen per MCP konform ohne Korrektur |
| 9 | Release, Governance, Cache-Site | Versionierung, Deprecation, Contribution |
