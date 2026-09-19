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

## 8. Messungen für den Plan (ergänzt durch `/speckit.plan`, 2026-09-19)

Gemessen auf `main` @ `639062a` mit dem gebauten `@fundamento/modelo` (Resolver, `WCAG2_METRIC`, colorjs.io), Konfiguration `core + aspekto-ekzemplo` (144 Kombinationen). Transparente Werte wären über `background.default` komponiert worden; in den gemessenen Tokens kommt keiner vor.

### 8.1 Beschreibungen (FR-04)

`core` hat 340 Tokens, davon 163 Rollen-Tokens (Wert ist ein Alias oder ein Komposit mit Alias-Feld). Alle 163 tragen heute eine `$description`. `semantic-described` braucht deshalb keine Datenreparatur; es sichert den Stand und gilt für die vier neuen Rand-Tokens.

### 8.2 Zustandsdifferenz (FR-03)

Kleinste Differenz eines Zustands zu `rest` über alle Kombinationen (OKLCH-Helligkeit L, 0…1; ΔE_OK euklidisch in Oklab):

| Variante.Zustand | komuna min ΔE_OK | komuna min \|ΔL\| | ekzemplo min ΔE_OK | ekzemplo min \|ΔL\| |
|---|---|---|---|---|
| primary.hover | 0,057 | 0,055 | 0,058 | 0,055 |
| primary.pressed | 0,088 | 0,085 | 0,090 | 0,085 |
| primary.selected | 0,057 | 0,055 | 0,058 | 0,055 |
| secondary.hover | 0,055 | 0,055 | 0,055 | 0,055 |
| secondary.pressed | 0,080 | 0,080 | 0,080 | 0,080 |
| secondary.selected | 0,055 | 0,055 | 0,055 | 0,055 |
| tertiary.hover | **0,025** | **0,025** | **0,022** | **0,022** |
| tertiary.pressed | 0,055 | 0,055 | 0,052 | 0,052 |
| tertiary.selected | **0,026** | **0,000** | **0,025** | **0,009** |

- `tertiary.hover` liegt in light nur eine Stufe über `rest` (`neutral.0` → `neutral.50`), knapp über der JND.
- `tertiary.selected` unterscheidet sich im Dark-Schema nur in Farbton und Chroma (`neutral.950` → `accent.950`: ΔE_OK 0,035, ΔL 0,000). In Graustufen und für viele Menschen mit Farbfehlsichtigkeit ist der Zustand unsichtbar. Das ist ein neuer Befund dieses Plans (Art. VI) und der Grund für ΔL als Metrik (Plan D-06).
- Kandidaten nach der Reparatur (Plan D-06) und Kontrast von `action.tertiary.text` darauf (komuna / ekzemplo): light `neutral.100` ΔL 0,055 / 0,052, 6,61 / 6,18:1; `neutral.200` ΔL 0,110 / 0,107, 5,58 / 5,21:1; `accent.100` ΔL 0,055 / 0,052, 6,62 / 6,22:1. Unter `contrast=high` in light: 9,26 / 7,82 / 9,26 (komuna), 8,66 / 7,31 / 8,72 (ekzemplo). Dark `accent.900` ΔL 0,080 / 0,089, 8,11 / 7,89:1, unter high 10,52 / 10,14:1. Alle Text-Schwellen (4,5 bzw. 7) bleiben erfüllt.

### 8.3 Texthierarchie und Flächenordnung (FR-01, FR-02)

- `surface-order`: 0 Verletzungen in 144 Kombinationen (komuna light: sunken 0,945 ≤ canvas 0,975 ≤ default 1,000 ≤ raised 1,000; dark: 0,000 ≤ 0,000 ≤ 0,200 ≤ 0,280).
- `text-hierarchy`: 72 von 144 Kombinationen verletzt (komuna und ekzemplo, jeweils light/high und dark/high, je 18 Kombinationen aus viewport × density × motion). Ursache sind die generischen Kern-Sets `contrast/high` (subtle und muted → `neutral.800`) und `color-scheme/dark+contrast/high` (beide → `neutral.100`); ekzemplo folgt dort dem Kern.
- Mindestkontrast je Stufe über die vier Flächen default, canvas, raised, sunken (komuna; ekzemplo weicht um höchstens 0,02 ab): light `neutral.950` 15,41, `900` 12,42, `800` 9,25, `700` 6,61; dark `neutral.50` 13,57, `100` 12,42, `200` 10,49, `300` 8,08. Drei verschiedene Stufen ≥ 7:1 gibt es in beiden Schemata; in light nur, wenn `text.default` auf `950` (oder `1000`) steigt, weil `700` auf sunken 7:1 verfehlt. Daraus folgt die Reparatur in Plan D-05.
- `contrast` (Priorität 5) überstimmt `color-scheme` (4): Hängt `contrast/high` `text.default` um, muss `color-scheme/dark+contrast/high` es für dark ausdrücklich zurückhängen.

### 8.4 Laufzeit (AK-09)

- Volle Auflösung aller 144 Kombinationen: 142–159 ms (drei Läufe), also etwa 1 ms je Kombination.
- `evaluateAlirebleco` über 60 Paare × 144 Kombinationen: etwa 300 ms, 0 Fehler, WCAG-Minimum 3,76:1.
- Folgerung: `check_contrast` ohne Belegung (alle Kombinationen) sprengt mit voller Auflösung das Budget von 100 ms. Der Plan löst nur die zwei Tokens samt Alias-Kette auf (D-18) und misst es in `pnpm perf`.

### 8.5 Statusränder (FR-06)

Kontrast der Kandidaten auf `background.default` (komuna / ekzemplo, schwächster Status): light `<s>.700` ≥ 7,25 / 7,29:1, dark `<s>.300` ≥ 9,46 / 9,45:1. Unter `contrast=high` ändern sich Flächen nicht, die Werte gelten also auch dort. Die heutigen Füllungen `status.<s>.basic` bestehen 3:1 in komuna und ekzemplo überall (Minimum 5,17:1); der Alternativzweig wird dort erst durch die helle Warnfläche im Fixture gebraucht (Plan D-10).

## 9. MCP-SDK 1.30 oder 2.x (FR-19)

Stand npm-Registry, abgefragt 2026-09-19:

| Paket | Version | Veröffentlicht |
|---|---|---|
| `@modelcontextprotocol/sdk` | 1.30.0 (`latest`) | 2026-07-27 |
| `@modelcontextprotocol/server`, `client`, `core`, `node`, `express`, `hono` | 2.0.0 (`latest`) | 2026-07-27; Betas 1–5 ab 2026-06-30 |

- **Abgleich mit Spec 001:** research §7 von Spec 001 nennt für 2.0.0 "GA 2026-09-17". Die Registry zeigt als Veröffentlichung der Version 2.0.0 den 2026-07-27, denselben Tag wie 1.30.0. Der 2026-09-17 ist vermutlich der Tag, an dem v2 als stabile Linie angekündigt bzw. `latest` wurde; das Feld `time` der Registry zeigt nur Veröffentlichungen, nicht Tag-Wechsel, und lässt sich hier nicht unterscheiden. Sicher ist: Die Bytes von 2.0.0 existieren seit acht Wochen unverändert, nach fünf Betas, ohne Patch-Release.
- **Protokoll:** 1.30.0 verhandelt höchstens `2025-11-25`. `@modelcontextprotocol/server` 2.0.0 implementiert `2026-07-28` und unterstützt `2025-11-25` weiter; das README nennt v2 "the stable release line".
- **API:** v2 exportiert weiter die Low-Level-Klasse `Server`; `setRequestHandler` nimmt den Methodennamen (`"tools/list"`) statt eines Zod-Schemas. Tools mit handgeschriebenem JSON Schema bleiben möglich. Prompts (`prompts/list`, `prompts/get`) und `outputSchema`/`structuredContent` gibt es in beiden Linien; das Kriterium aus §6 entscheidet also nicht.
- **Transporte:** stdio liegt in `@modelcontextprotocol/server/stdio`; Streamable HTTP für Node liegt in `@modelcontextprotocol/node` (`NodeStreamableHTTPServerTransport`, Abhängigkeiten `@hono/node-server`, Peer `hono`), mit eingebauten Host-/Origin-Validatoren. Der eigene Guard aus Spec 001 bleibt davor.
- **Abhängigkeiten:** `sdk` 1.30.0 zieht express, hono, jose, cors, pkce-challenge, eventsource, cross-spawn, ajv u. a.; `server` 2.0.0 nur `core` und `zod` ^4.2.
- **Betroffene Dateien im Repo:** `packages/mcp/src/{server,http,start}.ts`, `test-doubles/client.ts`, drei Tests in `mcp`, `packages/cli/src/quickstart.test.ts`.

Entscheidung und Rückfallregel: Plan D-17.
