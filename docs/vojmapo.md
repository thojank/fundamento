# Vojmapo – Fundamento End-to-End

**Stand:** 2026-09-19 · **Pflege:** Maintainer; jede gemergte Spec aktualisiert ihren Eintrag hier · **Verbindlich ist die Constitution**, diese Datei ist ihr Fahrplan.

Diese Datei ist die eine Stelle, an der der gesamte Weg von Fundamento steht: was fertig ist, was läuft, was geplant ist, welche Ideen gesammelt sind und wo sie herkommen. Die Vision dahinter steht in [`vizio.md`](vizio.md) (Ursprung: eine Skizze von 2017, [`img/skizze-2017.jpg`](img/skizze-2017.jpg)), die Regeln in der [Constitution](../.specify/memory/constitution.md).

## Zielbild in einem Satz

Eine Marke wird als ausführbare Spezifikation beschrieben (Modelo); daraus entstehen Tokens, Komponenten, Figma-Libraries, Code und Dokumentation für jede Marke und jede Situation, und jeder Agent kann über MCP fragen, was gilt und warum.

## Arbeitsweise

- **Spec-Driven Development** (github spec-kit): Constitution → Spec → Plan → Tasks → Implementierung → PR → Abnahme.
- **Rollen:** Maintainer entscheidet, schreibt Constitution, Specs und Research, prüft Plan und Tasks, nimmt ab. Coding-Agent plant, baut im eigenen Branch, test-first mit beobachtetem Rot, liefert per PR. Merge nur nach Maintainer-Prüfung.
- **Befund wird Regel** (Art. VI): Was eine menschliche Abnahme findet und keine Prüfung, wird Regulo-Kandidat und, wo messbar, automatische Regulo.
- **Clean Room** (Art. V): andere Systeme nur als Benchmark für Anforderungen, nie als Inhalt.

## Phasen

| Phase | Spec | Inhalt | Status |
|---|---|---|---|
| 0 | [000](../specs/000-fundamento-repo/) | Monorepo, Modelo-Schema, DTCG-Vortaro, Konjunktions-Sets, ULID-IDs, 5 CI-Prüfungen, CLI `fm modelo validate` | ✅ abgenommen |
| 1 | [001](../specs/001-vortaro-aspektoj-mcp/) | 340 Tokens, 6 Dimensioj, Referenzmarke `komuna` (Geist), Aspekto-Pakete intern/extern, MCP-Server (10 Werkzeuge), Export je Aspekto, externes Paket `ciferecigo` (abgeleitet, privat) | ✅ abgenommen |
| 2 | [002](../specs/002-regularo-gvidanto/) | Reguloj aus Abnahme-Befunden (`surface-order`, `text-hierarchy`, `state-distinct`, `semantic-described`), komuna-Reparatur, KontrastParo mit Rand-Alternative, Gvidanto-Werkzeuge (`check_contrast`, `explain`, `explain_regulo`, `describe_term`), MCP-Prompt, Ontologio Stufe 1, MCP-SDK 2; Nachtrag T027 (Mindestabstand der Textrollen) | ✅ abgenommen |
| 3 | [003](../specs/003-butono-durchstich/) | Erster Ero `butono` durch alle Ebenen: Skemo → CSS/Tailwind → Web Component + React → Figma-Komponente → Code-Zuordnung → **Figma Make Kit** je Aspekto → Gvidanto → Prüfung. Internacia und Alirebleco (Fokus, Tastatur, ARIA) erstmals an einem Ero | 🚧 umgesetzt, Abnahme offen (M1 Figma-Library, M2 Make Kits, M3 S5-Lauf; Constitution v1.6 in dieser Phase); npm-Org für die Make Kits: https://www.npmjs.com/org/fundamento (Scope `@fundamento`, Veröffentlichung erst nach der Abnahme durch den Maintainer) |
| 3b | [004](../specs/004-komparo/) | **Komparo:** komuna 2 als starkes Basis-Theme mit messbaren Zielen, neues Celo **Vitrino** (visuelle Übersicht, Laufzeit-Umschaltung, Gegenüberstellung), Adobe Spectrum als Benchmark-Aspekto `komparo` im getrennten Repo (erste Stufe Enportilo), Bericht ohne Gesamtscore, Amendment Art. V v1.7 | 📝 Spec vorgeschrieben |
| 4 | – | Eroj in der Breite (Formular, Navigation, Feedback, Daten), Sxablonoj | geplant |
| 5 | – | Generatoren in voller Breite: Figma-Library je Aspekto, Penpot, Icons, Fonts, JSON-LD-Projekcio der Ontologio, Laufzeit-Umschaltung aller Dimensioj | geplant |
| 6 | – | CLI + Registry: `fm init / add / aspekto use / lint / diff`, shadcn-kompatible Registry | geplant |
| 7 | – | Agordilo (Konfigurator) + Enportilo (Importer); Prototyp ist die ciferecigo-Ableitung aus Phase 1. Anforderung: Enportilo erzeugt Zwischenstufen, wenn Regeln auf der Rampe kollidieren (Befund ciferecigo sunken) | geplant |
| 8 | – | Design-Agenten + Evals: Agent baut Screen per MCP konform ohne Korrektur; Inspiro | geplant |
| 9 | – | Veröffentlichung (npm, öffentliche Make Kits), Governance, Versionierung, Cache-Site | geplant |

## Querschnitts-Themen

| Thema | Kern | Wo | Stand |
|---|---|---|---|
| **Ontologio** | Terminologie als Daten (SKOS), später JSON-LD; jeder Export ist ein Wissensgraph | Art. III · Spec 002 (Stufe 1) · Phase 5 (JSON-LD) · später SHACL für fremde Graphdaten | Stufe 1 in Phase 2 |
| **Internacia** | logische Richtungen, RTL-Testfall, Textexpansion, keine festen Strings, Schriftsysteme je Schrift | Art. VIII · ab Spec 003 je Ero | Regel steht, Umsetzung ab Phase 3 |
| **Alirebleco** | WCAG-Kontrast je Aspekto × Kombination; Fokus, Tastatur, ARIA an Eroj; APCA beratend | Art. X · Spec 001/002 · Spec 003 (Werkzeug benennen, APCA entscheiden) | Kontrast ✅, Rest ab Phase 3 |
| **Figma Make Kits** | Kit je Aspekto: React-Paket + Tailwind-Tokens + aus dem Modelo **generierte** `guidelines/` | neues Celo, Spec 003 (Durchstich), Phase 9 (öffentlich) | Spec 003 |
| **Fluida Marko** | Die Marke folgt dem Kontext, nicht dem Anbieter: Markenfamilie, Gastgeber, Gast, Vorrang-Regel als Daten, geschützte Rollen (Details im Abschnitt unten) | Leitbegriff seit 2026-09-20; eigene Spec nach Spec 004, gemeinsam mit Etoso | Konzept |
| **Etoso** | Dimensio für Kontext und Stimmung, Laufzeit-Umschaltung mit weichem Übergang, Stimmungsraum statt Themenliste, Gast-Aspekto (Details im Abschnitt unten) | eigene Spec nach Spec 004; Phase-1-Test belegt: neue Dimensio rein über Daten; Vitrino (Spec 004) ist der erste sichtbare Beleg der Laufzeit-Umschaltung | Kandidat, Konzept unten |
| **Tavoloj / Brand DNA** | Aspekto-Paket trägt weitere Schichten neben `vida`: Sprache (Voice), Verhalten, Governance | `aspekto.json#/tavoloj` reserviert (Phase 1) | Kandidat |
| **Discovery- und Spec-Engine** (Nachbarprojekt) | Aus Ideen, Fachwissen und Zusammenarbeit entstehen geprüfte, versionierte Spezifikationen, die ein Coding-Agent umsetzt; später auch virtuelle Personas und Probanden (Stern der Skizze von 2017) | **eigenes Projekt, eigenes Repo, eigener Stream**; Fundamento enthält davon nichts. Berührungspunkte als Schnittstellen: (1) eine Spezifikation verweist auf eine Aspekto und die Eroj, gegen die gebaut wird; der Coding-Agent fragt Fundamento per MCP; (2) Befunde aus Tests generierter Oberflächen kommen als Daten mit Herkunft zurück und durchlaufen „Befund wird Regel“ (Art. VI) | außerhalb dieses Repos |
| **Inspiro** | Muster aus kuratierten Sammlungen (Pinterest-API, Browser-Extension, DOM-Analyse) → abstrahierte Muster → Sxablonoj; nie Inhalte Dritter | Phase 8; Vorstufe MCP-Werkzeug `inspiro_analyze` ab Phase 5 | Idee |
| **Kreilo** | Plattform für iterative Markenerschaffung, jede Iteration ein gültiger, vollständiger Aspekto | eigenes Projekt auf Fundamento, nach Phase 7 | Idee |

## Fluida Marko – Familie, Gastgeber, Gast

Stand: Leitkonzept, keine Spec. Herkunft: Ziel des Design-System-Teams bei Jio (50+ Kernmarken, 50+ weitere Marken der Reliance-Gruppe), das dort nicht vollständig gelöst wurde; eingebracht vom Maintainer am 2026-09-20.

**Kernsatz:** Die Marke folgt dem Kontext, nicht dem Anbieter. Ein Dienst sieht dort aus, wo er gebraucht wird, nicht dort, wo er herkommt.

### Begriffe

| Ebene | Begriff | Bedeutung |
|---|---|---|
| Oberbegriff | **Fluida Marko** (Fluid Brand, fluide Marke) | Die Marke ist kein fester Zustand eines Produkts, sondern ein Wert, der zur Laufzeit aus dem Kontext entsteht. Kurzformel für Vorträge: „Brand as Runtime". |
| Ero | **markenagnostisch** | Ein Ero kennt keine Marke, nur das Vortaro. |
| System | **mehrmarkenfähig** | Viele Marken gleichrangig und vollständig (Art. IV). |
| Laufzeit | **kontextadaptiv** | Welche Marke welche Rollen bestimmt, entscheidet die Situation. |

Die Esperanto-Begriffe für die folgenden Konzepte (Vorschläge: *Familio*, *Gastiganto*, *Gasto*, *Prioritato*, *protektata rolo*) werden per Constitution Amendment in der zugehörigen Spec festgelegt.

### Drei Fälle

1. **Markenfamilie.** Beispiel: eine Basismarke mit Untermarken für Handel, Mode, Unterhaltung, Gesundheit, Finanzen, die sich in Farbe, Dichte, Schriftstärke und Interaktion unterscheiden; daneben eigenständige Marken, die völlig abweichen dürfen. Art. IV bleibt: keine Vererbung zur Laufzeit. Untermarken werden beim Build nach dokumentierten Regeln aus der Basis **abgeleitet** (wie ciferecigo) und als vollständige Aspektoj ausgeliefert; die Ableitungsbeziehung ist Metadatum, damit eine Änderung der Basis alle Ableitungen neu erzeugt.
2. **Gastgeber gewinnt.** Beispiel: Ein Film im Unterhaltungsdienst (Markenfarbe purpur) wird angehalten; das UI zeigt Kleidung und Möbel aus der Szene; der Kauf läuft über den Mode- und den Möbeldienst derselben Gruppe, die sich nahtlos im Design des Unterhaltungsdienstes zeigen. Beispiel 2: Im Portal einer Kulturerbe-Stätte wird ein Ticket gekauft und mit dem Zahlungsdienst der Gruppe (eigene Markenfarbe golden) bezahlt, im Design des Portals. Technische Grundlage: CSS Custom Properties erben durch Shadow DOM; ein Microfrontend, das das Vortaro spricht, übernimmt die Belegung des Gastgebers ohne eigenen Code. **Das gemeinsame Vortaro ist der Vertrag, die Marke ist nur die Belegung.**
3. **Gast gewinnt, in freigegebenen Rollen.** Beispiel: gesponserter Mautabschnitt, Gastmarke über der Fahrzeugmarke (siehe Etoso, Gast-Aspekto).

### Vorrang-Regel als Daten

Für jeden Kontext legt eine Regel fest, welche Marke welche Rollen bestimmt: Gastgeber, Gast oder Familie. Die Regel ist Teil des Regularo, trägt einen Kialo und ist über den Gvidanto abfragbar („warum ist diese Bezahlmaske gerade im Design des Portals?").

### Geschützte Rollen

Vertrauens- und Sicherheitsmerkmale übernehmen nie die Marke eines anderen: Zahlungsbestätigung, Sicherheitskennzeichen, Kennzeichnung des Zahlungsdienstes („bezahlt mit <Zahlungsdienst>"), Warn- und Gefahrenfarben, Fahrinformationen. Grund: Wenn eine Bezahlmaske jede Marke annehmen kann, kann der Nutzer eine echte Zahlung nicht mehr von einer gefälschten unterscheiden. Die Marke fließt, Vertrauen und Sicherheit nicht. Das ist eine Regulo, keine Konvention.

### Wie Marken entstehen

- **Beschrieben:** Design wird in Worten und Regeln beschrieben, mit Beispielen gesteuert und daraus erzeugt.
- **Konfiguriert:** Der Agordilo entwickelt eine Marke iterativ; jede Iteration ist eine gültige, vollständige Aspekto (siehe Kreilo).
- **Importiert:** Der Enportilo übernimmt eine Marke aus Beispielen, Links oder Dateien per Drag & Drop, für Kundenaufträge („bau mir eine App für Marke X"). Der Auftrag ist der Rechtenachweis nach Art. V; ohne Auftrag oder Lizenz kein Import. Anwenden im eigenen Kontext, nicht kopieren.

### Veröffentlichung

Das Konzept wird offen entwickelt und veröffentlicht: Artikel, Videos, Vorträge, Demo-Anwendungen (Etoso-Fragebogen, Gastgeber-Demo „Film anhalten und kaufen", Fahrzeug-Vision). Belegt wird jede Behauptung durch laufenden Code und Prüfungen, nicht durch Folien.

## Etoso – Übergänge, Stimmungsraum, Gast-Aspekto

Stand der Idee: Konzept, keine Spec. Quelle: Gespräche mit dem Maintainer am 2026-09-18 und 2026-09-20.

### Weicher Übergang zur Laufzeit

- Dimensio-Wechsel zur Laufzeit ändern das UI nicht schlagartig, sondern gleiten. Dafür braucht es zwei Dinge: Die Tokens werden als typisierte CSS-Eigenschaften registriert (`@property`), sonst kann der Browser nicht interpolieren, **und** jede registrierte Eigenschaft bekommt eine ausdrückliche `transition` (generiert, nicht von Hand). Registrieren allein animiert nichts. Farbraum: Werden Farben in `oklch()` ausgegeben, interpoliert der Browser nach CSS Color 4 in Oklab; bei Legacy-Syntax (`#hex`, `rgb()`) in sRGB mit Grauschleier in der Mitte. Wo ein echter OKLCH-Pfad nötig ist (Farbton-Drehung), wird das Mischgewicht animiert und die Farbe per `color-mix(in oklch, …)` berechnet. Längen, Radien, Schatten interpolieren ebenso, Schrift über die Achsen einer Variable Font (Stärke, Breite). Für strukturelle Wechsel: View Transitions.
- Dauer und Kurve der generierten `transition`-Deklarationen kommen aus den Motion-Tokens; unter `motion=reduced` und `prefers-reduced-motion: reduce` wird die Dauer auf eine kurze Überblendung oder null gesetzt, ebenfalls generiert. Eine Prüfung stellt sicher, dass jede registrierte Eigenschaft eine Übergangsregel und einen Reduced-Motion-Fall hat.
- **Neue Regulo-Art (Kandidat): Übergangs-Prüfung.** Zwei gültige Zustände garantieren keinen gültigen Zwischenzustand (hell → düster ist bei 50 % grau auf grau). Die Prüfung tastet jeden erlaubten Übergang in Schritten ab und prüft die KontrastParoj unterwegs. Wo sie scheitert, muss der Übergang anders geführt werden (Text und Fläche zeitversetzt, Umweg über einen sicheren Zwischenzustand).

### Stimmungsraum statt Themenliste

- Stimmung als Koordinaten auf zwei Achsen (angelehnt an das Circumplex-Modell der Emotionsforschung): **Valenz** negativ ↔ positiv, **Erregung** ruhig ↔ aufgeregt. Beispiele: positiv/aufgeregt = freundlich, positiv/ruhig = kooperativ, negativ/aufgeregt = aggressiv, negativ/ruhig = düster, Mitte = neutral, reduziert.
- Aspekto liefert Ankerwerte je Ecke; Zwischenpunkte werden gemischt; alle Reguloj gelten für jeden Punkt, nicht nur für die Anker. „Unfreundlich" heißt nie „unbenutzbar".
- Etoso verändert jeden Token-Typ, nicht nur Farbe: Radius, Dichte, Schriftstärke, Bewegung.

### Demo-Anwendungen (Showcase)

1. **Stimmungs-Fragebogen, Modus „Spiegeln":** Die App stellt Fragen; jede Antwort verschiebt den Punkt im Stimmungsraum; das UI gleitet mit und spiegelt die Stimmung.
2. **Derselbe Fragebogen, Modus „Ausgleichen":** Das UI steuert gegen (aggressive Antworten → ruhigeres UI). Spiegeln und Ausgleichen sind zwei Regularo-Varianten über denselben Daten; der Unterschied ist die eigentliche Aussage der Demo.
3. **Gast-Aspekto im Fahrzeug (Vision, rechtlich und sicherheitlich ungeprüft):** Cockpit und Infotainment zeigen die Fahrzeugmarke. Auf einem gesponserten Mautabschnitt bietet ein Handelsunternehmen an: UI in Aktionsfarben plus Werbeblock alle 50 km, dafür Maut frei und Einkaufsbonus. Nimmt der Fahrer an, gleitet das UI in die Gastmarke und nach dem Abschnitt zurück.

### Was die Fahrzeug-Vision für das Modell verlangt

- **Gast-Aspekto:** eine zweite Marke, die über der Basismarke liegt, zeitlich und räumlich begrenzt (Zeitfenster, Streckenabschnitt als Geo-Bereich), nur nach Einwilligung, jederzeit widerrufbar. Rechtenachweis nach Art. V als Daten am Paket (Vertrag, Gültigkeit, Gebiet).
- **Spannung zu Art. IV:** Aspektoj sind vollständig und erben nichts. Ein Gast liefert aber nur wenige Rollen (Akzent, Marke, Werbefläche). Lösung zu klären: Der Enportilo leitet aus den wenigen Gastwerten eine vollständige Aspekto ab (wie bei ciferecigo), oder ein eigenes, eng begrenztes Konzept „Gast-Schicht" mit Regeln, welche Rollen überhaupt übernommen werden dürfen.
- **Geschützte Rollen:** Warn-, Status- und Gefahrenfarben, Fahrinformationen und Bedienelemente mit Sicherheitsbezug übernehmen nie Gastwerte. Das ist eine Regulo, keine Konvention, und gilt auch für jede andere Gast-Situation.
- **Kontext-Sensor:** Ort, Zeit und Situation setzen Etoso und Gast-Aspekto; der Sensor liefert nur Werte, die Reguloj entscheiden.

## Offene Kern-Befunde (werden in Specs aufgelöst)

| Befund | Herkunft | Auflösung |
|---|---|---|
| Statusflächen: Kontrast über Rand statt Füllung | Abnahme ciferecigo | Spec 002 FR-07 |
| subtle = muted unter `contrast=high` in komuna | Abnahme ciferecigo | Spec 002 FR-02/FR-05 |
| Kontrast nur „nach eigener Rechnung" des Agenten | Claude-Code-Test Phase 1 | Spec 002 FR-09 |
| Zustands-Textfarben im Kern? | Abnahme ciferecigo (Regel 8) | Neubewertung Spec 003 |
| „Text oder Icon genügt" als Nicht-Text-Kontrast | WCAG 1.4.11 | Spec 003 (braucht Ero-Wissen) |
| APCA verbindlich unter `contrast=high`? | Baseline Spec 001 §8 | Spec 003 |
| Prüfwerkzeug für Fokus/Tastatur/ARIA unbenannt | seit Phase 0 | Spec 003 |
| Textrollen verschieden, aber optisch flach (dark/high `#ffffff` / `#f6f7f7` / `#ecedee`) | Gvidanto-Abnahme (Claude Code, Phase 2) | Spec 002 FR-02 ergänzt, T027: Mindestabstand \|ΔL\| ≥ 0,05 (OKLCH) zwischen benachbarten Textrollen |

## Externe Pakete

| Paket | Repo | Lizenz | Stand |
|---|---|---|---|
| `@fundamento/aspekto-komuna` | im Kern | MIT | Referenz |
| `fundamento-aspekto-ciferecigo` | privat (`thojank/fundamento-aspekto-ciferecigo`) | proprietär | v0.2.0 abgeleitet gegen den Kern nach Phase 2 (T026), Archiv übergeben; Repo-Push durch den Maintainer |
| `fundamento-aspekto-komparo` | `thojank/fundamento-aspekto-komparo` (geplant, Spec 004) | Apache-2.0, Werte abgeleitet aus Adobe Spectrum | Benchmark, nicht unter `@fundamento` |

## Wo Entscheidungen stehen

- Grundsätze: Constitution (versioniert, Änderungshistorie im Abschnitt Governance)
- Entscheidungen je Phase: `specs/<nr>/plan.md` (D-Nummern, Complexity Tracking)
- Abweichungen und Präzedenzfälle: Jugxoj in `packages/modelo/data/jugxoj.json`
- Belege und Quellen: `specs/<nr>/research.md`, `research/benchmarks.md`
