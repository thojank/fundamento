# Spec 004 – Komparo: starkes Basis-Theme, Vitrino und Benchmark gegen Spectrum

**Branch:** `004-komparo` · **Status:** Entwurf, bereit für /speckit.plan nach Merge von Spec 003 · **Constitution:** v1.6 → v1.7 (diese Spec ist das Amendment zu Art. V) · **Erstellt:** 2026-09-20 · **Voraussetzung:** Spec 003 auf `main`, CI grün

## Zweck

Fundamento soll ein Basis-Theme haben, das sich mit dem besten offenen System messen kann, und diesen Vergleich sichtbar machen. Drei Teile:

1. **komuna 2:** Die Referenzmarke wird zu einem starken Basis-Theme ausgebaut, gegen messbare Qualitätsziele, mit eigenen Werten.
2. **Vitrino:** Ein neues Celo erzeugt aus dem Modelo eine visuelle Übersicht je Aspekto (Paletten, Flächen, Texthierarchie, Status, Aktionen, `butono`, Kontrastmatrix, Regularo-Ergebnis), mit Umschaltung aller Dimensioj zur Laufzeit und einer Gegenüberstellung zweier Aspektoj.
3. **Komparo:** Adobe Spectrum 2 wird als Benchmark-Aspekto `komparo` in einem getrennten Repo importiert. Beide Aspektoj laufen durch dieselben Prüfungen; ein Bericht und die Vitrino stellen sie gegenüber.

Der Satz, den diese Spec belegen soll:

> Fundamento trägt Adobes Spectrum als eine Marke unter vielen, prüft es mit denselben Regeln wie die eigene Referenzmarke, und zeigt Punkt für Punkt, wo welche vorn liegt.

Nebeneffekt: Der Import ist die erste Stufe des Enportilo (Phase 7) an einem echten, großen System.

## Nicht im Scope

- Übernahme von Spectrum-Werten, -Namen oder -Strukturen in den Kern oder in komuna (Art. V).
- Spectrum-Komponenten. Verglichen wird die visuelle Schicht (`vida`) und `butono`, gerendert mit Fundamentos eigener Ero.
- Der allgemeine Enportilo mit Oberfläche (Phase 7). Hier genügt ein Import-Skript für genau diese Quelle.
- Veröffentlichung von `komparo` auf npm unter `@fundamento`.
- Weitere Benchmark-Systeme (Carbon, Primer). Die Mechanik wird so gebaut, dass sie später wiederverwendbar ist.

---

## Nutzerszenarien

### S1 – Maintainer sieht das Basis-Theme
Der Maintainer öffnet die Vitrino von komuna und sieht auf einer Seite: alle Paletten mit ihrer Helligkeitskurve, die Flächenfolge, die Texthierarchie, Status- und Aktionsfarben mit allen Zuständen, `butono` in allen Varianten und Zuständen, die Kontrastmatrix aller KontrastParoj mit Ergebnis. Er schaltet Farbschema, Kontrast, Dichte, Viewport und Motion um, ohne Neuladen.

### S2 – Gegenüberstellung
Der Maintainer wählt „komuna ↔ komparo" und sieht beide Aspektoj nebeneinander in derselben Dimensio-Kombination, mit den Messwerten je Kriterium und einer Markierung, welche Seite vorn liegt.

### S3 – Bericht
`fm komparo raporto` schreibt einen deterministischen Bericht (JSON und Markdown) mit allen Kennzahlen je Aspekto und Kombination. Der Bericht ist die Grundlage für Artikel und Vorträge.

### S4 – Clean Room bleibt nachweisbar
Wer das Kern-Repo prüft, findet keine Spectrum-Werte oder -Namen. Die Clean-Room-Prüfung des Kerns schlägt an, wenn ein Wert aus `komparo` in komuna oder im Kern auftaucht.

---

## Anforderungen

### komuna 2

- **FR-01 Qualitätsziele vor Werten:** Bevor Werte geändert werden, legt der Plan messbare Ziele fest und begründet jedes (Kialo). Mindestens:
  - Jeder KontrastParo besteht in jeder Kombination mit Reserve (Zielwert im Plan, Vorschlag ≥ 5 % über der WCAG-Schwelle).
  - Paletten: gleichmäßige Helligkeitsstufen in OKLCH (Streuung der Abstände unter einem Grenzwert), alle Werte im sRGB-Gamut, Dunkelmodus eigens abgestimmt statt invertiert.
  - `contrast=high`, `density`, `viewport`, `motion` mit echten, geprüften Werten.
  - Typografie-Skala mit dokumentiertem Verhältnis; Zeilenhöhe und Laufweite folgen einer Regel.
  - APCA wird berichtet (beratend, Art. X).
- **FR-02 Ziele werden Reguloj:** Wo ein Ziel messbar ist, wird es als Regulo mit Kialo ins Regularo aufgenommen (Art. VI) und gilt damit für jede Aspekto.
- **FR-03 Unabhängige Gestaltung:** komuna 2 wird ohne Kenntnis der Spectrum-Werte gestaltet. Die Coding-Sitzung für komuna sieht nur Fundamento-Daten und Berichte mit Kennzahlen, nie Werte oder Namen aus `komparo`.
- **FR-04 Folgen für andere Aspektoj:** ekzemplo und ciferecigo müssen die neuen Reguloj bestehen; ciferecigo wird wie in T028 neu abgeleitet.

### Vitrino (neues Celo)

- **FR-05 Generiert:** Die Vitrino ist eine Projekcio des Modelo. Keine handgepflegten Werte, keine Hex-Werte im Quelltext der Vorlage.
- **FR-06 Inhalte:** Paletten mit Helligkeitskurve; Flächenfolge; Texthierarchie; Status mit Fläche, Text, Rand; Aktionen mit allen Zuständen; `butono` als echtes `fm-butono`; Kontrastmatrix aller KontrastParoj mit WCAG-Wert, APCA-Wert und Ergebnis; Ergebnis aller Reguloj.
- **FR-07 Laufzeit-Umschaltung:** alle Dimensioj über `data-fm-*`-Attribute ohne Neuladen. Das ist zugleich der erste sichtbare Beleg für Etoso.
- **FR-08 Gegenüberstellung:** zwei Aspektoj nebeneinander in gleicher Kombination, Kennzahlen je Kriterium, Kennzeichnung „vorn/gleich/hinten".
- **FR-09 Ausgabe:** eine eigenständige HTML-Datei je Build, ohne externe Ressourcen, barrierefrei (axe ohne Befund), byte-gleich bei gleichem Modelo.

### Komparo (Benchmark-Aspekto)

- **FR-10 Getrenntes Repo:** `thojank/fundamento-aspekto-komparo`, Lizenz Apache-2.0 mit NOTICE: Werte abgeleitet aus Adobe Spectrum Design Tokens, © Adobe, Apache-2.0; nicht mit Adobe verbunden oder von Adobe unterstützt. Der Name „Spectrum" erscheint nur zur Herkunftsangabe, nicht im Paket- oder Aspekto-Namen.
- **FR-11 Quelle fixiert:** Import aus einer festen Version von `@adobe/spectrum-tokens` (Version und Prüfsumme im Repo). Ein erneuter Import mit gleicher Quelle ist byte-gleich.
- **FR-12 Abbildung:** Eine Abbildungstabelle ordnet Spectrum-Rollen den Rollen des Fundamento-Vortaro zu. Jeder Eintrag hat eine Begründung. Nicht abbildbare Spectrum-Tokens werden gezählt und berichtet, nicht übernommen.
- **FR-13 Vollständigkeit (Art. IV):** komparo belegt jeden Token des Vortaro. Wo Spectrum keinen Wert hat (hoher Kontrast, Motion, Dichte, Viewport-Stufen, fehlende Rollen), wird der Wert nach einer dokumentierten Regel abgeleitet und als **abgeleitet** markiert (Jugxo mit Kialo). Achsen-Zuordnung: Farbschema hell/dunkel direkt; Wireframe wird nicht übernommen und als Befund notiert; die Skala Desktop/Mobile wird einer Fundamento-Dimensio zugeordnet, die Wahl begründet der Plan.
- **FR-14 Fairness:** Der Bericht trennt Kennzahlen über **originale** und über **abgeleitete** Werte. Abgeleitete Werte zählen nie für oder gegen Spectrum.
- **FR-15 Fingerprints:** Das komparo-Repo erzeugt Fingerprints (SHA-256) seiner Werte wie ciferecigo. Die Clean-Room-Prüfung des Kerns prüft komuna, ekzemplo und den Kern auch dagegen.

### Bericht

- **FR-16 Kriterien:** mindestens
  - WCAG-Bestehensquote aller KontrastParoj je Kombination und kleinste Reserve;
  - APCA-Werte (beratend);
  - Reguloj-Ergebnis (`surface-order`, `text-hierarchy`, `state-distinct`, `semantic-described` und die neuen aus FR-02);
  - Gleichmäßigkeit der Paletten (OKLCH);
  - Gamut-Treue;
  - Abdeckung der Dimensioj (Anteil originaler Werte je Dimensio);
  - Abdeckung der Vortaro-Rollen;
  - axe-Ergebnis von `fm-butono` in beiden Aspektoj.
- **FR-17 Kein Gesamtscore:** Der Bericht vergibt kein Gesamturteil, nur „vorn/gleich/hinten" je Kriterium. Gewichtung wäre Meinung, keine Messung.
- **FR-18 Befund wird Regel:** Was der Vergleich an Schwächen von komuna zeigt, geht als Regulo-Kandidat in die nächste Runde (Art. VI), nicht als Kopie eines Spectrum-Werts.

### Constitution Amendment v1.7 (Art. V)

- **FR-19** Art. V erhält einen Absatz „Benchmark-Aspekto":

  > Ein fremdes System mit offener, nachgewiesener Lizenz darf als Benchmark-Aspekto importiert werden, um es mit denselben Prüfungen zu messen. Import und Pflege laufen in einem eigenen Repo und einer eigenen Coding-Sitzung; das Kern-Repo erhält nur Kennzahlen und Fingerprints, nie Werte, Namen oder Quellmaterial. Die Clean-Room-Prüfung des Kerns prüft gegen die Fingerprints jedes Benchmark-Aspekto. Gestaltungsarbeit an Aspektoj des Kerns sieht nur Kennzahlen.

  Die Regel „Quellmaterial anderer Systeme wird dem Coding-Tool nicht vorgelegt" gilt weiter für das Kern-Repo und jede Sitzung, die daran arbeitet.

---

## Akzeptanzkriterien

- **AK-01** komuna 2 erfüllt alle Ziele aus FR-01; jedes messbare Ziel ist eine Regulo mit Kialo; alle Aspektoj bestehen.
- **AK-02** Die Vitrino von komuna öffnet als eine Datei, zeigt alle Inhalte aus FR-06, schaltet alle Dimensioj um, axe ohne Befund, zwei Builds byte-gleich.
- **AK-03** Die Gegenüberstellung komuna ↔ komparo zeigt je Kriterium beide Werte und die Kennzeichnung.
- **AK-04** komparo besteht die Vollständigkeitsprüfung; jeder abgeleitete Wert trägt Markierung und Jugxo; ein Import mit gleicher Quelle ist byte-gleich.
- **AK-05** `fm komparo raporto` ist deterministisch und trennt originale und abgeleitete Werte.
- **AK-06** Clean-Room-Prüfung des Kerns: grün; ein eingepflanzter komparo-Wert in komuna lässt sie scheitern (Negativtest).
- **AK-07** Im Kern-Repo findet eine Suche keinen Spectrum-Tokennamen und keinen Wert aus komparo.
- **AK-08** Die Constitution steht auf v1.7 mit Änderungshistorie.
- **AK-09** Manuelle Abnahme: Der Maintainer beurteilt komuna 2 in der Vitrino visuell und in der Gegenüberstellung. Befunde werden Reguloj oder Jugxoj.

## Klärungen (vom Maintainer entschieden, 2026-09-20)

1. **komparo-Repo öffentlich oder privat?** **Entschieden: öffentlich**, `thojank/fundamento-aspekto-komparo`. Sichtbar geschaltet wird es erst nach der Abnahme.
2. **Skala Desktop/Mobile → `viewport` oder `density`?** **Entschieden: `density`.** Die Zuordnung wird in Etappe B am importierten Datensatz geprüft und, falls die Daten dagegen sprechen, mit Kialo als Jugxo korrigiert.
3. **Reihenfolge:** **Entschieden: Etappe A zuerst** (FR-01 bis FR-09, FR-19, FR-15 vorbereitend), Etappe B danach (FR-10 bis FR-14, FR-16 bis FR-18). So entsteht komuna 2 nachweislich ohne Blick auf die Vergleichswerte; Etappe B läuft in einer eigenen Sitzung im komparo-Repo.

### Etappen

| Etappe | Umfang | Ort | Status |
|---|---|---|---|
| **A** | FR-01 – FR-09 (komuna 2, Vitrino), FR-19 (Constitution v1.7), FR-15 vorbereitend (Clean-Room liest Fingerprints externer Benchmark-Aspektoj) | Kern-Repo | geplant in [`plan.md`](plan.md), Aufgaben in [`tasks.md`](tasks.md) |
| **B** | FR-10 – FR-14 (Import komparo), FR-16 – FR-18 (Bericht) | `fundamento-aspekto-komparo`, eigene Sitzung | noch nicht geplant |

## Referenzen

- Benchmark-Analyse: [`research/benchmark-spectrum.md`](../../research/benchmark-spectrum.md)
- Quelle: https://github.com/adobe/spectrum-design-data (Apache-2.0)
- Vorbild für externe Aspekto-Pakete: `fundamento-aspekto-ciferecigo` (Spec 001)
