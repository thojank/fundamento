# Research – Spec 002

Stand 2026-09-19.

## 1. Herkunft der Anforderungen

Alle vier neuen Reguloj stammen aus der visuellen Abnahme des ciferecigo-Pakets in Phase 1 (`specs/001-vortaro-aspektoj-mcp/research.md` §10, „Befunde für Kern und Enportilo"). `check_contrast` stammt aus dem Claude-Code-Test der Phase-1-Abnahme: Auf die Frage nach dem Textkontrast in komuna dark/high antwortete der Agent mit einem Wert „nach eigener Rechnung" und dem Satz „einen Wert aus dem Tool dafür habe ich nicht". Ein Agent, der Kontrast selbst rechnet, kann sich verrechnen; das Modelo darf ihn dazu nicht zwingen (Art. III).

## 2. Wahrnehmbare Zustandsdifferenz (FR-03)

- Kandidat: euklidischer Abstand in Oklab (ΔE_OK). Oklab ist perzeptuell gleichmäßig genug, dass ein fester Schwellwert über Farbtöne hinweg sinnvoll ist; die CSS Color Module 4/5 verwenden ΔE_OK für Gamut-Mapping. Quelle: https://www.w3.org/Graphics/Color/Workshop/slides/talk/lilley
- Die Wahrnehmungsschwelle (JND) für ΔE_OK wird in der Praxis um 0,02 angesetzt und streut zwischen Personen deutlich (Selbsttest: https://www.keithcirkel.co.uk/whats-my-jnd/). Ein Zustand soll nicht knapp wahrnehmbar, sondern deutlich sein; der Plan wählt ein Vielfaches der JND und begründet es. Alternative: Mindestdifferenz nur in Helligkeit (ΔL), weil Zustände in den meisten Systemen über Helligkeit laufen und Farbfehlsichtigkeit Hue-Differenzen schwächt.
- Messung erfolgt auf den aufgelösten Werten, bei transparenten Werten nach Komposition über `background.default`, wie in der Alirebleco-Prüfung.

## 3. Nicht-Text-Kontrast über Rand oder Füllung (FR-06, FR-07)

WCAG 2.2, Verständnisdokument zu 1.4.11: Die Schwelle 3:1 gilt für die visuelle Information, die ein Bedienelement erkennbar macht; das kann die Füllung, der Rand oder sichtbarer Inhalt sein. „If a control has visible content (such as text or a sufficiently contrasting icon) … then a border or other indication of the overall boundary of the hit area is not required." Quelle: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html

Folgerung: Das Kern-Paar „Statusfläche gegen Hintergrund ≥ 3:1" ist strenger als WCAG. Die Alternative über einen Rand (FR-07) ist die kleinste Lockerung, die im Modelo prüfbar bleibt, ohne Eroj zu kennen; die weitergehende Lockerung („Text oder Icon genügt") setzt voraus, dass das System weiß, was auf der Fläche steht, und gehört in die Ero-Phase (Spec 003). Der Befund aus ciferecigo (Amber existiert erst oberhalb L ≈ 0,75, auf Papier 1,34:1) zeigt, dass ohne Alternative jede warme Marke eine olivfarbene Warnfläche bekommt.

## 4. Vokabular als Daten (FR-15)

- SKOS (Simple Knowledge Organization System, W3C Recommendation) ist das Standardvokabular für Begriffssysteme: `skos:Concept`, `prefLabel`, `altLabel`, `definition`, `broader`, `related`. Quelle: https://www.w3.org/TR/skos-reference/
- JSON-LD 1.1 macht aus einer JSON-Datei mit einem `@context` einen RDF-Graphen, ohne die Datei zu ändern. Quelle: https://www.w3.org/TR/json-ld11/
- Entscheidungsvorlage für den Plan: `ontologio.json` verwendet SKOS-Feldnamen ohne Präfix; der `@context` kommt in Phase 5 dazu. Damit bleibt die Datei für Menschen und Agenten lesbar und ist später ohne Migration ein Graph.
- Marktlage (Recherche „Brand as Code", 2026-09): Es wurde kein öffentliches Design System gefunden, das seine Begriffe oder Tokens als Ontologie/RDF modelliert; „Ontologie" wird im Markt nur als Marketingbegriff proprietärer Markenplattformen verwendet. Stufe 1 hier ist deshalb bewusst klein und standardnah.

## 5. Bedeutungsschicht für Agenten (FR-04)

Eine öffentliche Untersuchung von 50 Token-Dateien reifer Systeme zeigt, dass Agenten aus nackten Token-Dateien Werte lesen, aber nicht den Einsatzzweck; mit einer DTCG-`$description` pro Rollen-Token stylte der Agent eine destruktive Aktion konsistent richtig, ohne sie in zwei von drei Läufen falsch. Quelle: https://learn.thedesignsystem.guide/p/50-design-token-files-one-problem

Folgerung: `$description` ist keine Doku, sondern Eingabe für Agenten; `semantic-described` macht sie für Rollen-Tokens verbindlich. Primitive brauchen sie nicht (ihr Name ist ihre Bedeutung).

## 6. Gvidanto ohne eigenes Modell

- Der MCP-Standard kennt drei Bausteine: Werkzeuge (Aktionen mit Schema), Ressourcen (lesbare Dokumente) und Prompts (vom Server angebotene Vorlagen, die der Client dem Modell gibt). Quelle: https://modelcontextprotocol.io/specification
- Entscheidung dieser Spec: Der Gvidanto besteht aus Werkzeugen, Ressourcen und einem Prompt. Schlussfolgern, Formulieren und Dialogführung übernimmt der Client-Agent. Gründe: Determinismus der Antworten (jede Zahl ist nachrechenbar), keine Modellkosten im Server, kein Anbieter-Lock-in, und die Abnahme bleibt ein normaler Test.
- Offen für den Plan: MCP-SDK 1.30 behalten oder auf 2.x migrieren (Spec 001, Complexity Tracking). Kriterium: Prompts und strukturierte Ausgaben mit Ausgabeschema müssen in der gewählten Version stabil sein.

## 7. Internacia (Constitution v1.4, Art. VIII)

In Phase 2 ändert sich am Code nichts: `fonts[].scripts` (ISO 15924) existiert seit T018b. Die Artikelergänzung legt fest, was jedes Ero ab Spec 003 erfüllen muss (logische Richtungen, RTL-Testfall, Textexpansion, keine festen Strings). Referenz: W3C Internationalization, „Structural markup and right-to-left text in HTML", https://www.w3.org/International/questions/qa-html-dir
