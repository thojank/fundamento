# Vojmapo – Fundamento End-to-End

**Stand:** 2026-09-19 · **Pflege:** Maintainer; jede gemergte Spec aktualisiert ihren Eintrag hier · **Verbindlich ist die Constitution**, diese Datei ist ihr Fahrplan.

Diese Datei ist die eine Stelle, an der der gesamte Weg von Fundamento steht: was fertig ist, was läuft, was geplant ist, welche Ideen gesammelt sind und wo sie herkommen. Die Vision dahinter steht in [`vizio.md`](vizio.md), die Regeln in der [Constitution](../.specify/memory/constitution.md).

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
| 2 | [002](../specs/002-regularo-gvidanto/) | Reguloj aus Abnahme-Befunden (`surface-order`, `text-hierarchy`, `state-distinct`, `semantic-described`), komuna-Reparatur, KontrastParo mit Rand-Alternative, Gvidanto-Werkzeuge (`check_contrast`, `explain`, `explain_regulo`, `describe_term`), MCP-Prompt, Ontologio Stufe 1, MCP-SDK 2 | 🔄 in Umsetzung |
| 3 | [003](../specs/003-butono-durchstich/) | Erster Ero `butono` durch alle Ebenen: Skemo → CSS/Tailwind → Web Component + React → Figma-Komponente → Code-Zuordnung → **Figma Make Kit** je Aspekto → Gvidanto → Prüfung. Internacia und Alirebleco (Fokus, Tastatur, ARIA) erstmals an einem Ero | 📝 Spec vorgeschrieben |
| 4 | – | Eroj in der Breite (Formular, Navigation, Feedback, Daten), Sxablonoj | geplant |
| 5 | – | Generatoren in voller Breite: Figma-Library je Aspekto, Penpot, Icons, Fonts, JSON-LD-Projekcio der Ontologio, Laufzeit-Umschaltung aller Dimensioj | geplant |
| 6 | – | CLI + Registry: `fm init / add / aspekto use / lint / diff`, shadcn-kompatible Registry | geplant |
| 7 | – | Agordilo (Konfigurator) + Enportilo (Importer); Prototyp ist die ciferecigo-Ableitung aus Phase 1 | geplant |
| 8 | – | Design-Agenten + Evals: Agent baut Screen per MCP konform ohne Korrektur; Inspiro | geplant |
| 9 | – | Veröffentlichung (npm, öffentliche Make Kits), Governance, Versionierung, Cache-Site | geplant |

## Querschnitts-Themen

| Thema | Kern | Wo | Stand |
|---|---|---|---|
| **Ontologio** | Terminologie als Daten (SKOS), später JSON-LD; jeder Export ist ein Wissensgraph | Art. III · Spec 002 (Stufe 1) · Phase 5 (JSON-LD) · später SHACL für fremde Graphdaten | Stufe 1 in Phase 2 |
| **Internacia** | logische Richtungen, RTL-Testfall, Textexpansion, keine festen Strings, Schriftsysteme je Schrift | Art. VIII · ab Spec 003 je Ero | Regel steht, Umsetzung ab Phase 3 |
| **Alirebleco** | WCAG-Kontrast je Aspekto × Kombination; Fokus, Tastatur, ARIA an Eroj; APCA beratend | Art. X · Spec 001/002 · Spec 003 (Werkzeug benennen, APCA entscheiden) | Kontrast ✅, Rest ab Phase 3 |
| **Figma Make Kits** | Kit je Aspekto: React-Paket + Tailwind-Tokens + aus dem Modelo **generierte** `guidelines/` | neues Celo, Spec 003 (Durchstich), Phase 9 (öffentlich) | Spec 003 |
| **Etoso** | Dimensio für Kontext und Stimmung (morgens kühl, abends warm), Laufzeit-Umschaltung, Kontext-Sensor mit Reguloj | eigene Spec nach Phase 3; Phase-1-Test belegt: neue Dimensio rein über Daten | Kandidat |
| **Tavoloj / Brand DNA** | Aspekto-Paket trägt weitere Schichten neben `vida`: Sprache (Voice), Verhalten, Governance | `aspekto.json#/tavoloj` reserviert (Phase 1) | Kandidat |
| **Inspiro** | Muster aus kuratierten Sammlungen (Pinterest-API, Browser-Extension, DOM-Analyse) → abstrahierte Muster → Sxablonoj; nie Inhalte Dritter | Phase 8; Vorstufe MCP-Werkzeug `inspiro_analyze` ab Phase 5 | Idee |
| **Kreilo** | Plattform für iterative Markenerschaffung, jede Iteration ein gültiger, vollständiger Aspekto | eigenes Projekt auf Fundamento, nach Phase 7 | Idee |

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

## Externe Pakete

| Paket | Repo | Lizenz | Stand |
|---|---|---|---|
| `@fundamento/aspekto-komuna` | im Kern | MIT | Referenz |
| `fundamento-aspekto-ciferecigo` | privat (`thojank/fundamento-aspekto-ciferecigo`) | proprietär | v0.1.0; nach Phase 2 neu ableiten |

## Wo Entscheidungen stehen

- Grundsätze: Constitution (versioniert, Änderungshistorie im Abschnitt Governance)
- Entscheidungen je Phase: `specs/<nr>/plan.md` (D-Nummern, Complexity Tracking)
- Abweichungen und Präzedenzfälle: Jugxoj in `packages/modelo/data/jugxoj.json`
- Belege und Quellen: `specs/<nr>/research.md`, `research/benchmarks.md`
