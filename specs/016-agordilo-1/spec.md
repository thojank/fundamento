# Spec 016 – Agordilo Stufe 1 (Werkstatt): Marke aus Farbe und Kontrast

**Branch-Familie:** `016-agordilo-1` (drei gestapelte PRs) · **Status:** Entwurf · **Constitution:** kein Amendment (Agordilo steht in der Terminologie, `packages/agordilo`) · **Erstellt:** 2026-10-17 · **Voraussetzung:** Release 0.1.0 (nach Spec 015) · **Phase:** 7, vorgezogen als Etappe 8a (Entscheidung des Maintainers, 17.10., D-1–D-6 in `research/entscheidung-werkstatt-2026-10-17.md`) · **Zielpfad:** `specs/016-agordilo-1/spec.md`

## Zweck

Wer eine Marke aufbaut, denkt visuell (Maintainer, 16.10.). Heute entsteht eine Aspekto nur von Hand oder als Ableitung im Build (privata, Phase 1). Diese Spec baut die erste Stufe der **Werkstatt**:

> Aus einer Leitfarbe, optionalen Zusatzfarben und drei Reglern entsteht in wenigen Minuten eine **vollständige, geprüfte Aspekto**. Jede Änderung ist sofort an allen Eroj in allen Modi sichtbar, mit Prüfbericht. Was eine Regel verletzt, zeigt die Werkstatt mit Ursache und Vorschlag. Sie rät nicht und verschweigt nichts.

Benchmark-Lücken, die diese Stufe schließt (`research/werkstatt-benchmark-2026-10-17.md`):
- L-1 geprüftes Markenpaket
- L-2 Kontrast als Eingabe an echten Komponenten
- L-4 Marken nebeneinander
- L-8 offen und markenneutral

## Nicht im Scope (spätere Stufen)
- Stufe 2: Regler für Form, Schrift, Dichte, Icon-Stärke
- Stufe 3: schreibende MCP-Werkzeuge (Prompt verändert die Marke), Historie
- Stufe 4: Doku als Lesemodus
- Stufe 5: Enportilo (Import)
- Display-P3, Farbfehlsicht-Simulation, 3D-Farbraum (W-12), Graph-Ansicht (W-13)
- Fluida Marko und Etoso

## Begriffe
- **Agordilo:** das Werkzeug (Paket `packages/agordilo` und Modus „Werkstatt“ der Vitrino).
- **Agordo:** die Eingabe, eine kleine JSON-Datei mit dem Rezept einer Marke. Gleiche Agordo ergibt bytegleich dieselbe Aspekto (Determinismus).
- **Prüfbericht** (`raporto`): Ergebnis aller Prüfungen der abgeleiteten Aspekto. Er wird als Datei im Paket mitgeliefert.

Neue Begriffe „Agordo“ und „Raporto“ kommen in die Ontologio (Schema `laboro`). P0 schlägt die Namen vor, der Maintainer bestätigt sie bei ①.

## Gemeinsame Festlegungen

**G1 – Art. IV bleibt.** Die Werkstatt erzeugt eine **vollständige** Aspekto: jeder Token des Vortaro belegt, nichts wird zur Laufzeit von komuna geerbt. Ableiten ist ein Schreibvorgang beim Speichern, wie bei privata. Die Herkunft steht als Metadatum in `aspekto.json`: `agordo` (die Eingabe), Version des Agordilo und Ausgangsstruktur.

**G2 – Rollen fest, Werte frei (W-18).** Die semantischen Rollen (`color.action.*`, `color.text.*`, `color.status.*` …) und ihre Zuordnung zu Paletten-Stufen übernimmt die Werkstatt **als Struktur** aus dem Vortaro. Neu berechnet werden die **Paletten** (`color.palette.neutral|accent|success|warning|danger|info`, Stufen wie heute). Die Zuordnung Rolle → Stufe bleibt gleich. Damit gelten alle KontrastParoj durch Konstruktion, solange die Stufen ihre Kontrastziele treffen. Eine Rolle neu zuordnen kann die Werkstatt in Stufe 1 nicht (Grenze, siehe G6).

**G3 – Kontrast als Eingabe (W-4, D-3).**
- Jede Paletten-Stufe hat ein **Kontrastziel** gegen die Bezugsfläche des Modus (hell: `neutral.0`, dunkel: `neutral.1000`, jeweils die Fläche, die `color.background.default` im Modus bindet). Die Ziele werden einmal aus komuna **gemessen** und als Tabelle im Agordilo abgelegt (Kalibrierung, keine Vererbung).
- Die Ableitung sucht je Stufe in **OKLCH** den Helligkeitswert L, der das Ziel trifft (WCAG 2), bei Farbton H und einer Buntheit C aus der Leitfarbe und dem Regler. Danach wird in sRGB abgebildet (Gamut-Mapping durch Verringern von C, nicht durch Abschneiden). Die Schwellen je `contrast`-Wert kommen aus `dimensioj.json` (`kontrastSojloj`).
- **Eigene Logik nach Art. V.** Leonardo (Adobe, Apache-2.0) dient nur als Benchmark für das Prinzip. Kein fremder Code, keine fremden Werte. Die Bibliothek ist offen und wird von Werkstatt, CLI und Gvidanto gemeinsam genutzt (W-23).

**G4 – Eingaben der Agordo (Stufe 1).**

| Feld | Pflicht | Wirkung |
|---|---|---|
| `name` | ja | Name der Aspekto (Kleinschreibung, Esperanto oder frei, wie die Paketregel es verlangt) |
| `leitfarbe` | ja | Farbton und Buntheit der Palette `accent` (Eingabe als Hex oder `oklch()`) |
| `zusatzfarben.success|warning|danger|info` | nein | eigener Farbton je Status; ohne Angabe gelten Standardtöne, die zur Leitfarbe passend gedreht werden (die Regel steht in plan.md) |
| `neutral.toenung` | nein, 0–1 | wie stark die Neutralpalette zum Farbton der Leitfarbe zieht (0 = grau) |
| `regler.helligkeit` | nein, −1…1 | verschiebt alle Kontrastziele gemeinsam (heller/dunkler), nie unter die Schwelle |
| `regler.kontrast` | nein, −1…1 | spreizt oder staucht die Ziele (mehr/weniger Abstand zwischen Stufen) |
| `regler.saettigung` | nein, 0–2 | Faktor auf C aller Paletten |
| `schriften` | nein | Familiennamen (wie heute in `aspekto.json#/fonts`), ohne Regler |

Alle übrigen Tokens (Abstände, Radien, Typografie, Bewegung …) werden in Stufe 1 **unverändert aus der Struktur des Vortaro geschrieben**. Sie sind damit vollständig belegt und ändern sich erst mit Stufe 2.

**G5 – Prüfen beim Einstellen (W-14–W-17).** Die Werkstatt führt dieselben Prüfungen aus wie die CI, in derselben Bibliothek:
- KontrastParoj (alle Modi und Kombinationen)
- `kontrastSojloj`
- `text-hierarchy` (Mindestabstand ΔL, T027)
- `state-distinct`
- `surface-order`
- Aspiroj, nur wenn die Agordo welche nennt

APCA wird als Hinweis gezeigt (W-15). Ergebnis ist der Prüfbericht: je Regel und Paar bestanden oder nicht, der Wert und die Schwelle.

**G6 – Kein Raten (W-17).** Kann eine Stufe ihr Ziel nicht treffen (z. B. eine sehr helle Leitfarbe, die als Text auf Weiß nie 4,5:1 erreicht, ohne ihren Ton zu verlieren), dann:
1. Die Werkstatt meldet das Paar, die Ursache und **einen** Vorschlag: eine dunklere Leitfarbe mit Wert, einen anderen Reglerwert oder „Ziel nicht erreichbar bei diesem Farbton“.
2. Eine Aspekto mit Verstoß gegen eine **feste** Regel lässt sich nicht exportieren.
3. Ein Verstoß gegen eine **anpassbare** Regel lässt sich exportieren, aber nur mit Jugxo (Begründung, Datum, Name). Der Jugxo steht im Paket (D-5).

Die Rolle selbst neu zuordnen ist in Stufe 1 eine Grenze (`role-remap`, ask-human).

**G7 – Werkstatt in der Vitrino (D-4).** Die Vitrino bekommt einen zweiten Modus neben „Ansehen“: **„Werkstatt“**.
- **Panel:** Leitfarbe (Farbwähler und Textfeld Hex/OKLCH), Zusatzfarben, Neutral-Tönung, drei Regler, Name.
- **Live:** Die Bibliothek leitet im Browser ab und setzt die CSS Custom Properties der Vitrino zur Laufzeit. Alle Eroj in allen Abschnitten folgen sofort. Die Dimensioj (hell/dunkel, hoher Kontrast, Dichte) bleiben umschaltbar (W-10).
- **Gegenüberstellung (W-11):** Entwurf neben komuna oder ekzemplo, gleiche Eroj, gleiche Modi, nebeneinander. Das Muster stammt aus Spec 004.
- **Prüfbericht live:** Zähler bestanden/verletzt, Liste der Verstöße mit Vorschlag (G6), APCA-Hinweise. Ein Klick auf einen Verstoß springt zum Ero, das das Paar zeigt.
- **Paletten-Ansicht:** die sechs Paletten mit Stufe, Wert und erreichtem Kontrast. Überschriebene Werte sind markiert und einzeln rücksetzbar (W-8). Überschreiben gibt es in Stufe 1 nur je Stufe als Kontrastziel, nicht als freien Farbwert.
- **Teilen und Speichern (W-21):** Die Agordo steht im URL-Fragment (`#agordo=…`, komprimiert). Ein Knopf „Agordo herunterladen“ liefert die Datei. Die Vitrino bleibt eine statische Datei ohne Schreibzugriff.

**G8 – CLI und Paket.**
- `fm agordilo derive <agordo.json> --out <ordner>` schreibt ein vollständiges Aspekto-Paket: `aspekto.json` mit Herkunft (G1), Sets für alle Dimensioj, `ids.lock.json`, `raporto.json` (Prüfbericht) und `raporto.md` (lesbar).
- `fm agordilo check <aspekto-ordner>` führt die Prüfungen erneut aus und vergleicht mit dem mitgelieferten Bericht.
- `fm modelo validate` mit der neuen Aspekto in der Konfiguration ist grün (oder rot genau mit den im Bericht genannten Verstößen).

**G9 – Gvidanto, lesend (Vorstufe zu Stufe 3).** Neues MCP-Werkzeug `preview_agordo` (lesend, schreibt nichts): Es nimmt eine Agordo und liefert den Prüfbericht samt Paletten-Kurzfassung. Ein Agent kann damit Vorschläge prüfen („Ist #F5C400 als Leitfarbe tragfähig?“). Das Schreiben folgt in Stufe 3.

**G10 – Projekcioj.** Eine abgeleitete Aspekto ist eine Aspekto wie jede andere: CSS, Make Kit, Figma-Modus und Vitrino ergeben sich aus der Konfiguration, ohne Sonderweg. Eine Beispielmarke `provo` (aus einer Agordo im Repo, nur Testdaten) läuft durch alle Celoj.

## PRs (gestapelt)
1. **① Bibliothek:** `packages/agordilo`
   - Agordo-Schema, Ableitung (G3), Kalibrierung aus komuna (gemessene Ziele als Datei)
   - Prüfungen über die vorhandenen Checks (keine Kopie), Prüfbericht, Determinismus
   - CLI `fm agordilo derive|check`
   - Beispiel-Agordo `provo`
   - Messung M1 (unten)
2. **② Werkstatt in der Vitrino:** Modus, Panel, Live-Ableitung im Browser (dieselbe Bibliothek gebündelt), Gegenüberstellung, Prüfbericht live, Paletten-Ansicht, URL-Fragment, Download.
3. **③ Gvidanto und Doku:** `preview_agordo`, Ontologio (Agordo, Raporto), README-Abschnitt „Eine Marke in fünf Minuten“, Vojmapo (Phase 7 → Stufe 1 erledigt, Reihenfolge neu mit Konservierung).

## Messungen
- **M1 Kalibrierung:** Eine Agordo mit der Leitfarbe von komuna (Farbton und Buntheit von `accent.700`) erzeugt Paletten, die komuna nahekommen. Gemessen wird je Stufe ΔE (OKLab). Das Ergebnis ist eine Messung, kein Abnahmekriterium: Es zeigt, wie weit die Regel die gezeichnete Referenzmarke trifft. Abweichungen über ΔE 5 werden als Tabelle in plan.md gelistet.
- **M2 Robustheit:** zehn Leitfarben über den Farbkreis (inklusive Gelb, Cyan, sehr dunkel, sehr hell, ungesättigt). Je Farbe: Zahl der bestandenen und verletzten Paare und die Vorschläge.
- **M3 Tempo:** Ableitung plus Prüfung im Browser unter 150 ms auf dem Rechner des Maintainers (Regler fühlen sich live an). Läuft es länger: Prüfung entprellen, Ableitung nicht.

## Abnahme
1. Der Maintainer baut in der Vitrino aus einer eigenen Leitfarbe eine Marke, in höchstens fünf Minuten, ohne Hilfe. Alle Eroj folgen live, und der Prüfbericht ist verständlich.
2. Dieselbe Agordo über die CLI erzeugt ein Paket, mit dem `fm modelo validate`, `check:alirebleco` (als externe Aspekto, W2 aus Nachlese 3) und `check:parity` grün sind, bytegleich bei zwei Läufen.
3. Eine absichtlich schwierige Leitfarbe (helles Gelb) zeigt Verstöße mit Ursache und Vorschlag. Export ohne Jugxo ist gesperrt, mit Jugxo möglich (anpassbare Regel). Feste Regeln bleiben gesperrt.
4. Figma: Die Beispielmarke `provo` erscheint als Modus der Sammlung aspekto, und alle Sets folgen.
5. M1–M3 stehen in plan.md.
6. `preview_agordo` beantwortet den Beispiel-Dialog (unten).

## Gvidanto (Beispiel-Dialog)
> „Ich will eine Marke mit #F5C400 als Hauptfarbe.“ → Der Agent ruft `preview_agordo` auf: Die Primäraktion erreicht mit diesem Gelb als Fläche hinter weißem Text keine 4,5:1. Vorschlag: die Leitfarbe abdunkeln (Wert genannt), oder Gelb als Akzent behalten und eine dunklere Stufe für Aktionen nutzen. Kialo aus der Regulo des Paars.

## Entscheidungen (gelten, bis der Maintainer widerspricht)
- **E1** Vollständige Aspekto, keine Laufzeit-Vererbung (G1, Art. IV).
- **E2** Rollen und Zuordnung fest, Paletten frei (G2). Rollen neu zuordnen ist eine Grenze.
- **E3** Eigene Ableitung in OKLCH mit Kontrastzielen, kalibriert an komuna, kein fremder Code (G3, D-3).
- **E4** Die Werkstatt ist ein Modus der Vitrino, kein neues Celo (D-4).
- **E5** Feste Regeln sperren den Export. Anpassbare Regeln brauchen einen Jugxo (D-5).
- **E6** Stufe 1 ändert nur Farbe und Schriftnamen. Alles andere wird unverändert vollständig geschrieben.
- **E7** Die Vitrino schreibt keine Dateien. Speichern geht über Download oder URL, das Paket entsteht über die CLI.
- **E8** privata erscheint nirgends. Beispiele sind `provo`, komuna und ekzemplo.
- **E9** Namen: `Agordilo` (Paket, Terminologie), `Agordo` (Eingabe), `Raporto` (Prüfbericht), Modus „Werkstatt“ (Oberfläche, deutsch und englisch: workshop). Agordo und Raporto bestätigt der Maintainer bei ①.

## Benchmark (Art. V, öffentlich; Belege im Benchmark-Dokument)
Adobe Leonardo (Kontrast als Eingabe, Theme-Regler), Material Theme Builder (eine Eingabe → Schema), Radix Colors (Stufen mit Zweck), tweakcn (Live-Vorschau), Tokens Studio und Supernova (Themes, Bezahlschranke Multibrand), DTCG Format und Resolver (stabil seit 28.10.2025).
