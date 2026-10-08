# Research 007 – Abgleich mit dem Benchmark „2027 Design System Stack"

**Erstellt:** 2026-10-08 · **Art:** Benchmark für Anforderungen (Art. V), kein Inhalt · **Gelesen:** Basis-Commit `159ee07` (main, 2026-10-07)

## Quelle

Sechs Fachartikel von Florian Gampert (Design Systems Architect) auf LinkedIn, veröffentlicht zwischen 15.09. und 05.10.2026, gelesen am 2026-10-08:

| Datum | Titel | Kern |
|---|---|---|
| 15.09. | AI multiplies whatever your foundation gets wrong. The 2027 Design System stack | Quelle (Tokens + Contract) → Build → Checks → Messung; Contract je Komponente als Datei neben der Komponente |
| 20.09. | What an agent needs from your design system, and why your team needed it first | Grenze zuerst; Regeln als Bedingung statt Ratschlag; kleiner statt mehr; Landkarte aus drei Dateien; Slots mit Regeln; Marke steckt in den Mustern (Do/Don't-Satz) |
| 28.09. | How to test a design system when AI writes the code | Bibliothek testet Komponenten, App testet Nutzung; ein Befehl im Agentenloop; Ausnahme nur mit Grund und Eigentümer; nur deterministische Prüfungen blockieren; Agent mit echten Aufgaben bewerten |
| 28.09. | You probably don't have a design system | Vier Teile: Entscheidungen, Vermittlung, Durchsetzung, Kennzahl; sechs Prüffragen |
| 02.10. | Design system ROI isn't just hours saved | Stunden auf eigener Arbeit zählen, Kosten abziehen; fünf nicht monetäre Werte mit Belegen zeigen |
| 05.10. | Colour spaces only matter when you mix colours | Farbraum zählt nur beim Mischen; Rampen in OKLCH, Mischen über weite Farbtöne in OKLab, Raum immer ausdrücklich nennen |

Die Artikel sind urheberrechtlich geschützt. Dieses Dokument gibt ihre Aussagen in eigenen Worten wieder und übernimmt keine Struktur, keinen Contract-Text und keine Beispiele wörtlich.

## Was Fundamento bereits hat

| Benchmark-Forderung | Fundamento heute | Beleg |
|---|---|---|
| Eine Quelle für Design und Code, Figma ist eine Ausgabe | Modelo-First, Figma ist Projekcio | Art. I, Art. XII |
| Contract als Datei neben der Komponente | Skemo je Ero | `data/eroj/butono/skemo.json` |
| Varianten, Zustände, Slots, A11y je Zustand | Skemo `props`, `states`, `slots`, `a11y` | Spec 003 |
| Nur Komponententokens, kein Hex | Skemo `bindings` nur auf Rollen; Vortaro-Lint | Art. X.1, `checks/vortaro-lint` |
| Regeln, die in Reviews immer wieder kommen | Reguloj, jede mit Kialo (27 Stück) | Art. VI |
| Ausnahme nur mit Grund und Eigentümer | Jugxo (Präzedenz, positiv und negativ, mit Kialo und Datum) | Art. VI |
| Plattformunterschiede im Contract abbilden | Manko mit Beleg und Schließbedingung | Art. VI, Spec 005 |
| Regel in die Komponente statt ins Dokument | `label-required`, Skemo `constraints` mit Kialo | Spec 003 |
| Bedeutung und Gewicht als zwei Achsen | `variant` = Gewicht, `tone` = Bedeutung (Beschreibung sagt es, Name nicht) | Skemo `butono` |
| Agent liest Tokens über MCP | MCP-Server, `get_ero`, `suggest_ero`, `check_usage` | Spec 001–003 |
| Kurzfassung für Agenten | `get_ero` liefert Props, Reguloj, Beispiele, Namen je Projekcio | Spec 003 |
| Beispiele richtig/falsch | Jugxoj mit `ekzemplo.instances` (6 von 35) | `jugxoj.json` |
| Kontrast aus Werten, ohne Browser | Alirebleco je Aspekto × Kombination, KontrastParoj | Art. X.4 |
| Farbraum beim Mischen ausdrücklich | Etoso-Konzept: OKLab als Standard, `color-mix(in oklch, …)` für Farbtondrehung | `docs/vojmapo.md` |
| Fehlermeldung nennt die Lösung | Gvidanto-Prompt Regel 10/11: Design ändern, nicht die Regel | `mcp/prompts/gvidanto.md` |

Befund: Der Benchmark beschreibt im Wesentlichen den Stand, den Fundamento nach Spec 003 hat. Wo er weitergeht, betrifft es den **Gebrauch** eines Ero, nicht seine Gestalt.

## Lücken

### L1 – Zweck und Alternative fehlen als Daten
Skemo `ero.description` ist ein Satz Prosa. Es gibt kein Feld für „wofür nicht" und „stattdessen". Ein Agent, der eine Navigation braucht, bekommt von `suggest_ero` entweder `butono` (falsch) oder `null` (ohne Hinweis).

### L2 – Grenze fehlt
Nichts im Modelo sagt, was ein Ero ausdrücklich nicht abdeckt, welche Kombinationen ungültig sind und wann ein Mensch entscheiden muss. Laut Benchmark ist das die wichtigste Lücke, weil ein Agent über die Grenze hinaus generiert, ohne es zu melden. `suggest_ero` antwortet heute bei Nicht-Treffer mit `null`. Das ist ehrlich, aber nicht hilfreich.

### L3 – Beziehungen fehlen
Womit ein Ero zusammengesetzt wird, womit nie, und wer den Abstand zwischen Geschwistern bestimmt (der Container, nicht das Ero), steht nirgends. Heute nur implizit in `container` der Regulo `one-primary-per-container`.

### L4 – Slots haben keine Regeln
`SkemoSlot` kennt `name`, `default`, `text`, `decorative`. Es fehlen: was ein Slot aufnimmt (Ero-Typen), wie viele, wie er sich in der Größe verhält, wie tief geschachtelt werden darf. Laut Benchmark ist ein Slot ohne Regeln eine abgekoppelte Komponente mit Umweg.

### L5 – Layout-Verhalten fehlt
`full-width` ist ein Prop ohne Regel. Wann es erlaubt ist, steht nirgends. Ebenso fehlt das Umbruchverhalten des Labels. Achtung Art. VIII: Das Modelo darf dafür keine Web-Begriffe aufnehmen (Pixel, `flex`, `wrap`). Layout-Verhalten muss plattformneutral formuliert sein.

### L6 – Sprache fehlt
Kein Ero trägt Regeln für seinen Text (Labelform, Fehlermeldung, Leerzustand). Das ist die Lücke „Marke steckt in den Mustern" und deckt sich mit der Tavolo `lingvo` (Stimme), die in `aspekto.json#/tavoloj` reserviert, aber nicht spezifiziert ist. Die Form „Regel + ein Satz, der sie befolgt + ein Satz, der sie bricht" passt auf die bestehende Jugxo mit `ekzemplo`, wenn die Instanz ein Label trägt (`EroInstance.label` existiert).

### L7 – Nutzung in Anwendungen wird nicht geprüft (nicht in Spec 007)
Vortaro-Lint prüft Projekcioj, nicht Anwendungen, die Fundamento verwenden. Es fehlen: Lint für fremde Codebasen (Hex/Pixel, rohes `<button>`, klickbares `div`, Import am Paketeingang vorbei, Override ohne Kommentar), Ausnahmedatei mit Grund und Eigentümer. Gehört zu Phase 6 (`fm lint`). Die Ausnahmedatei kann Jugxo-Format haben.

### L8 – Verwendung wird nicht gemessen (nicht in Spec 007)
`kovrado` misst, wie viel eine Marke selbst setzt, nicht, wie viel einer Anwendung aus Fundamento kommt. Gemeint ist eine Kennzahl der Form „Anteil der UI aus dem System vs. lokale Kopien und Rohwerte". Gehört zu Phase 6 (`fm lint --report`) oder Phase 8.

### L9 – Agent wird nicht an echten Aufgaben bewertet (nicht in Spec 007)
Phase 8 sieht Evals vor. Der Benchmark liefert die Methode: Bildschirme, die schon gebaut wurden, nur mit dem System neu bauen lassen, mit denselben Skripten bewerten, bei jeder Änderung an Modelo, Prompt oder Modell wiederholen. Jede Abweichung ist zuerst ein Befund am System (passt zu Art. VI „Befund wird Regel").

### L10 – Achsennamen am Butono (Entscheidung, nicht Lücke)
`variant: primary|secondary|tertiary` und `tone: default|danger` sind inhaltlich schon die zwei Achsen Gewicht und Bedeutung. Der Benchmark argumentiert, dass Namen, die eine Rangfolge oder ein Aussehen nennen, einen Agenten raten lassen, und schlägt Gewicht hoch/mittel/niedrig und Bedeutung neutral/Marke vor. Für Fundamento ist die Bedeutungsachse zusätzlich der natürliche Ort für die Fluida Marko: Eine Bedeutung „Marke" ist genau die Rolle, die ein Gastgeber übernimmt oder nicht übernimmt, „Gefahr" ist eine geschützte Rolle. Siehe Spec 007, Offene Frage F1.

## Wo Fundamento bewusst weitergeht

- **Begründung statt Regelliste.** Benchmark-Regeln stehen ohne Grund da. In Fundamento ist ein Constraint ohne Kialo ungültig (Art. VI).
- **Rechtsprechung statt Verfassung.** Der Benchmark kennt Ausnahmen mit Eigentümer. Fundamento hält jede Entscheidung als Jugxo fest, Ablehnungen eingeschlossen, und lernt daraus.
- **Lücken werden geführt.** Der Benchmark sagt, dass nicht jede Plattform alles kann. Fundamento misst das bei jedem Lauf (Manko).
- **Fluidität.** Der Benchmark kennt Brand Overrides zur Build-Zeit. Fundamento zielt auf kontextadaptive Marken zur Laufzeit (Fluida Marko, Etoso).
- **Wer entscheidet, was ein Token bedeutet.** Benchmark und Fundamento sind sich einig, dass das bei Menschen bleibt. In Fundamento ist das als Rolle festgeschrieben: Der Maintainer entscheidet, schreibt Constitution, Specs und Reguloj.

## Nebenbefund Farbraum

Der Benchmark-Artikel vom 05.10. bestätigt das Etoso-Konzept und schärft einen Punkt: OKLCH-Interpolation zwischen weit auseinanderliegenden Farbtönen erzeugt Zwischentöne, die in keiner der beiden Farben vorkommen. Für die Laufzeit-Umschaltung (morgens kühl, abends warm) heißt das: Der Interpolationsraum gehört als Angabe je Übergang ins Modelo, nicht als Konvention in die Projekcio. Kandidat für die Etoso-Spec, nicht für 007.

## Nebenbefund Messung des Agenten

Der Benchmark sagt, ein „sieht gut aus" einer zweiten KI dürfe nichts blockieren. Fundamento folgt dem bereits: Alle Prüfungen in Art. X sind deterministisch. Für Phase 8 heißt das, dass die Evals mit denselben Skripten bewerten, die auch Menschen prüfen (`check_usage`, Vortaro-Lint, Alirebleco), nicht mit einem Bewertungsmodell.
