# Spec 027 – Figma-Bauformen: Komponenten, mit denen man Screens bauen kann

**Status:** Entwurf · **Constitution:** kein Amendment · **Erstellt:** 2026-10-22 · **Voraussetzung:** `main` nach #105 (Spec 026 darf parallel laufen) · **Zielpfad:** `specs/027-figma-bauformen/spec.md`

**Regel 0** gilt. **Keine Änderung an der Optik** (Farben, Maße, Radien, Schrift der Eroj): Die Gestaltung macht der Maintainer gerade am Prototyp. Diese Spec ändert nur, **wie** die Komponenten in Figma gebaut sind, damit man mit ihnen Screens zusammensetzen kann.

## Anlass
Am 22.10. hat Claude in der Datei „Fundamento 0.2.0_a“ (Build `5ac57f02`, komuna) einen Prototyp aus allen 40 Komponenten gebaut, die fiktive Anwendung „Werkhof“ mit 5 Screens. Dabei zeigten sich neun Befunde. Jeder Punkt war nur mit Handarbeit an der Instanz zu umgehen.

| # | Befund | Erwartet nach dieser Spec |
|---|---|---|
| B-1 | **Dehnung:** Instanz auf feste Breite oder „füllen“ gestellt, die inneren Rahmen (`field`, `focus-ring`, `focus-gap`, `control`) bleiben „umschließen“. Das Feld bleibt schmal, der Inhalt zentriert. | Jedes Ero, das im Code die Breite des Containers übernimmt (Layout „Größe aus dem Container“ in der Uzo), füllt in Figma seine Instanzbreite. Innere Teile füllen, wo der Code sie füllen lässt; Icons, Indikatoren und Griffe bleiben fest. Tabellenzeilen füllen, die erste Spalte nimmt den Rest. |
| B-2 | **Unsichtbarer Wert:** Der Werttext im Feld des `datelektilo` (`text`) und im Zahlenfeld des `glitilo` (`number-text`) hat keine Füllung. | Füllung an die Textrolle gebunden wie beim `kampo`. Ein Test prüft für **jede** Text-Ebene jedes Sets, dass sie eine gebundene Füllung hat. |
| B-3 | **Hinweis und Fehler** stehen in jedem Feld immer als Platzhalter („Hinweis“, „Fehler“), auch im Ruhezustand. | Boolesche Komponenten-Eigenschaften `help` und `error` je Feld-Ero. Standard: `help` an, `error` nur im Zustand `invalid` an. |
| B-4 | **Nur ein Text je Komponente** ist als Eigenschaft änderbar (`label`). Navigation, Pfad, Tabelle, Dialog, Karte, Menü und Optionen stehen auf „Eins, Zwei, Drei“. | Jeder Slot mit Text wird eine Text-Eigenschaft, mit Namen aus dem Skemo (`heading`, `message`, `help`, `items-1` …). Das Figma-Limit für Eigenschaften je Komponente wird gemessen; wo es greift, ist das ein **Manko** mit Beleg, keine Kürzung. |
| B-5 | **avizo:** Die Meldung bricht nicht um und läuft aus der Fläche. | Texte, die im Code umbrechen, sind in Figma `fill` + Höhe automatisch, also auch `message`, `content`, `help` und `paragraph`. |
| B-6 | **butono** zeigt immer ein Häkchen-Icon. | Boolesche Eigenschaften `icon-start` und `icon-end`, Standard aus. Das Icon ist per Instanz-Tausch (INSTANCE_SWAP) auf ein beliebiges `ikono` setzbar. Dasselbe gilt für jedes Ero mit Icon-Slot. |
| B-7 | **menuo geschlossen:** Instanz 16 px hoch, der Auslöser „…“ ist kaum sichtbar. | Der geschlossene Zustand zeigt den Auslöser in seiner Zielgröße (`size.target.min` bzw. Höhe des `butono` low). |
| B-8 | **Sxablonoj fehlen als Komponenten.** Kopf, Seitenleiste und Seitenrahmen mussten von Hand gebaut werden. | Die 5 Sxablonoj (`sxelo`, `pagxo`, `formularo`, `filtrilo`, `redaktilo`) als Komponenten mit Regionen als Slots (Figma-Slots bzw. Instanz-Tausch-Platzhalter, wie das Repo es schon für Eroj tut). `sxelo` mit den Varianten Breite (compact, medium, expanded) und mit oder ohne Seitenleiste. |
| B-9 | **lokredaktilo** zeigt im Anzeigezustand kein Bearbeiten-Icon. | Das Icon `edit` ist im Anzeigezustand sichtbar, wie im Code. |

## Abnahme
1. Der Maintainer baut in einer **neuen leeren Datei** mit dem neuen Plugin einen Screen (zum Beispiel „Werkhof · Ausleihen“) und braucht dabei **keine** Handarbeit an Instanzen: nur Eigenschaften, Texte und Breite.
2. **Tests im Repo:**
   - Text-Ebenen mit Füllung (B-2)
   - Zahl der Text-Eigenschaften je Set gleich der Zahl der Text-Slots (B-4)
   - Dehnung: Bei Instanzbreite 400 ist jedes Feld-Ero 400 breit, der `control` eingeschlossen (B-1)
   - `help`/`error` je Zustand (B-3)
   - Sets der Sxablonoj vorhanden (B-8)
3. **Pixelgleichheit der Optik:** Die Sets in Standardgröße sehen aus wie vorher (Bildvergleich je Set). Ausnahmen sind nur die gewollten Änderungen B-3, B-6, B-7 und B-9.
4. Dauer des Plugin-Laufs im Bericht (siehe Nachlese 9). Er darf nicht deutlich länger werden.

## Auftrag P0
- Ein PR von `main`. Rote Tests zuerst, Bericht im bekannten Format, mit Figma-Messung in einer neuen leeren Datei.
- Keine Änderung an Tokens, Werten oder am Aussehen der Eroj über die Tabelle hinaus.
- ciferecigo kommt nirgends vor.
