# Spec 019 – Werkstatt Stufe 2+3 – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-20, unverändert kopiert) · **Briefing:** `briefing-p0-2026-10-20.md` (Maintainer-Ordner, nicht kopiert) · **Basis:** `main` nach #84 (`ac5deb3`) · **Regel 0** (12.10.) gilt: der Weg, den das Repo schon geht (Art. XI), sonst die kleinste Änderung mit Eintrag hier; Tokens, Rollen, Eroj, Regulo-Semantik und Constitution nie ändern; nie eine Grenze aufweichen, um grün zu werden.

Vier PRs: ① Bibliothek von `main`, ② Werkstatt von ①, ③ Prompt von ② (gestapelt), ④ Nachlese 6 getrennt von `main`.

## ① Bibliothek Stufe 2

**Branch:** `261020-spec-019-bibliothek-116ba2` (von `main` `ac5deb3`) · **Datum:** 2026-10-20 · **Stand:** zur Abnahme (Messanleitung in plan ③).

### Zusammenfassung

1. **Agordo G2** im einen Modelo-Schema (`$defs/Agordo`): `form.radius` 0–2, `form.rahmen` 0,5–2, `form.schatten` 0–2, `raum.abstand` 0,75–1,5, `raum.hoehe` 0,85–1,25, `schrift.groesse` −1…1, `schrift.skala` 1,125–1,5, `schrift.gewicht` −1…1, `ikono.gewicht` (die sechs Phosphor-Gewichte). Alle optional; ohne Angabe gilt die Struktur. `schrift.familien` ist das Feld `schriften` aus Stufe 1 (Abweichung 1). Typen neu generiert.
2. **Ableitung G3** (`packages/agordilo/src/gestalt.ts`): je Regler eine Funktion auf der **Struktur des Vortaro** – dem Kern-Set und den Sets seiner Dimensioj –, nie auf komuna zur Laufzeit; gerundet auf das Raster (Abstände 4 px, 2 px wo die Struktur feiner ist; Höhen 4 px; Schriftgrößen, Radien, Rahmen ganze px; Gewichte ganze Schnitte). Ins Haupt-Set `aspekto/<name>` kommt nur, was sich ändert; die Aliasse der Rollen bleiben, darum folgen Dichte, Viewport und Kontrast als Modi darüber.
3. **Kalibrierung „Standard = Stufe 1“:** Jeder Regler auf seinem Standard (oder nicht genannt) ändert keinen Token. Die Agordo `provo` der Stufe 1 ergibt jede Datei der Stufe-1-Ableitung **bytegleich** (Prüfsummen der 25 Dateien von `main` `ac5deb3` in `packages/agordilo/fixtures/stufe1-provo.json`); mit allen Reglern der Stufe 2 auf ihrem Standard ausgeschrieben sind Sets, Lock, `$themes.json`, Glyphen und Raporto bytegleich, `aspekto.json` bis auf die Agordo als Herkunft.
4. **Leitplanken G4:** die vorhandenen Reguloj binden unverändert – `size.target` (`touch-target-min`), der Fokusring (`protected-minimum`), `type-scale`, `type-rhythm`, Kontraste. Wo ein Regler eine Gefahr ohne Regel bringt, gibt es einen **Hinweis** im Raporto, keine neue Regulo (E2): Fließtext unter 14 px, Rahmen-Stufen fallen zusammen, kein Schatten (Regulo-Kandidaten unten).
5. **Eckwert-Tests:** alle 3^8 Kombinationen aus min/Standard/max der acht Zahlenregler rein (ohne Modelo, 6 s) über `size.target` in jeder Dichte, die Rangfolge der Schriftrollen in jedem Viewport, `type-scale`, sichtbare Rahmen, Fokusring, Gewichte und Raster; dazu `schrift.groesse` × `schrift.skala` auf einem Raster von 101 × 76 Werten; dazu alle Regler an ihrem Minimum und an ihrem Maximum **durch alle Prüfungen** des Modelo ohne festen Verstoß.
6. **Icon-Gewichte (E6):** thin, light, bold, fill und duotone der 17 Ikonaro-Namen aus `@phosphor-icons/core` 2.1.1 (dieselbe Quelle und Version wie das Ikonaro von komuna) in `packages/agordilo/data/ikonoj/<gewicht>/`, mit `LICENSE` (MIT) und `ikonoj.json` (Herkunft, Integrität des Pakets, Lesedatum, Namenskarte); jede Glyphe trägt Quelle, Version und Lizenz im `<metadata>`. Ein Gewicht ohne Glyphe für jeden Namen wird abgelehnt (`ikonaro-glyph-missing` an `agordo#/ikono/gewicht`, Export verweigert).
7. **Beispielmarken (G8):** `provo` bekommt `form.radius` 1,6, `raum.abstand` 1,15, `ikono.gewicht` bold; neu `provo-kompakta` (eckig `form.radius` 0,25, dicht `raum.abstand` 0,8 und `raum.hoehe` 0,9, kleinere Schrift `schrift.groesse` −0,5, weichere Schatten 0,5, Icons light, Leitfarbe `#0f6b5c`), nur Testdaten, mit Konfiguration und `fundamento.provoj.config.json` (provo und provo-kompakta) für Figma. Beide 6 408 von 6 408 Paar-Auswertungen, 0 Verstöße.
8. **CLI unverändert in der Bedienung:** `fm agordilo derive|check` wie in Spec 016; `check` baut auch die Hinweise der Stufe 2 bytegleich nach.
9. **M4** (unten).
10. **Kleinste Änderungen daneben:** Modelo – Schema und Typen, `KNOWN_ASPEKTO_FIXTURES` += `provo-kompakta` (Weg von Nachlese 3 W2, wie provo); Agordilo – `Structure.ikonoGewichte`, `loadIkonoGewichte`, `ikonoChoice`, `packageDocuments(…, gestalt)`, `CheckInput.gestalt|agordoIssues`, `measureM4`; Projekcioj – die Insel `fm-werkstatt` trägt die Glyphen der Gewichte mit (sonst wiche der Raporto der Werkstatt für provo bold von der CLI ab). Das Panel der Werkstatt folgt in ②.

### Entwurfsentscheidungen

#### D-01 Ein Modul, eine Funktion je Regler
`gestaltBasis(files)` liest die Struktur einmal (Kern-Set, die Sets der Dimensioj, die Skala, die Stufen der Controls, `size.target.min`, die Breite des Fokusrings, die shade-Palette, die Schwelle von `type-scale` aus `reguloj.json`); `deriveGestalt(agordo, basis)` gibt die Tokens zurück, die sich ändern (`main` für das Haupt-Set, `dark` für das Konjunktions-Set mit `color-scheme=dark`), und die Hinweise. Rein und schnell (gemessen 0,075 ms je Ableitung), darum laufen die Eckwerte ohne Modelo. `gestaltTokens` löst die Struktur mit der Gestalt über benannten Dimensio-Sets auf (für Tests und ②).

#### D-02 Wohin die Werte gehen
Die Dimensio `aspekto` hat Priorität 1, die Sets von Viewport, Dichte, Farbschema und Kontrast liegen darüber (Reihenfolge in `resolve/order.ts`). Darum schreiben die Regler die **Skalen-Literale** (`spacing.scale.*`, `size.scale.*`, `font.size.scale.*`, `radius.*`, `border.width.scale.*`, `font.weight.*`, die Schatten) und lassen die **Aliasse** der Rollen stehen: `density=compact` zeigt `spacing.medium` weiter auf `spacing.scale.150` – über der verschobenen Skala. So bleibt die Dichte ein Modus über der Grundstruktur (G2).

#### D-03 `form.radius`
`radius.small|medium|large|xlarge` × r, ganze px; `radius.none` und `radius.full` bleiben. Die Rollen `radius.role.*` folgen über ihre Aliasse.

#### D-04 `form.rahmen` und der Fokusring
`border.width.scale.*` × k, ganze px, nie unter 1 px. Fällt `border.width.focus` dabei unter die Breite der Referenz (2 px; `protected-minimum` verlangt mindestens den Wert von komuna), zeigt er auf die kleinste Stufe, die sie hält (bei 0,5: `border.width.scale.3` = 2 px). Kein Literal, kein neuer Token.

#### D-05 `form.schatten`
Versatz (`offsetX`, `offsetY`) und Unschärfe (`blur`) aller Lagen von `elevation.shadow.*` × s, ganze px; `spread` bleibt. Die Deckkraft: `color.shadow.key|ambient` zeigen auf die Stufe der shade-Palette, deren Deckkraft der der Struktur × s am nächsten liegt (0, 8, 10, 25, 50 %; Gleichstand: die hellere) – hell im Haupt-Set, dunkel im Konjunktions-Set des Pakets, weil im Dunkeln das Set `color-scheme/dark` des Vortaro die Schattenfarben setzt und nur das Konjunktions-Set darüber liegt. Keine neue Palette-Stufe (E1).

#### D-06 `raum.abstand`
`spacing.scale.*` × a auf dem 4-px-Raster; wo die Struktur selbst feiner ist (2 px, 6 px), auf 2 px. Die benannten `spacing.*`, `layout.grid.gutter|margin` und `focus.offset` folgen über ihre Aliasse.

#### D-07 `raum.hoehe`
Die Stufen von `size.scale.*`, auf die `size.control.*` im Kern oder in einer Dichte zeigt (500–900), × h auf 4 px, nie unter `size.target.min` (24 px). `size.icon.*` und `size.target.min` (`size.scale.200–400`) bleiben. Die Untergrenze 0,85 ist so gewählt, dass die kleinste Höhe (`density=compact`, `size.control.small` 28 px) auf 24 px landet.

#### D-08 `schrift.skala`
Das Verhältnis benachbarter Stufen von `font.size.scale`. Standard ist der **Median der Nachbarverhältnisse der Struktur**, auf drei Stellen: 1,167 (derselbe Median, den `type-scale` misst). Jedes Nachbarverhältnis wird mit skala/1,167 multipliziert, verankert an der Stufe von `font.size.body.1` (16 px bleibt 16 px): Die Abweichungen vom Median bleiben die der Struktur (7,1 %), `type-scale` (10 %) hält.

#### D-09 `schrift.groesse`
Jede Stufe × 1,167^(2g): höchstens zwei Stufen der **Struktur-Skala** kleiner oder größer, unabhängig von skala. Gemessen: mit der neuen Skala als Schritt (1,5² = 2,25) ergab die Ecke groesse −1 / skala 1,5 eine Bildunterschrift von 3 px und verletzte `type-scale` (11,7 %).

#### D-10 Ganze px, ohne `type-scale` zu reißen
Zuerst einfache Rundung (halb von null weg). Reißt sie die Schwelle von `type-scale` (aus `reguloj.json`, 0,1) – die kleinen Stufen springen um bis zu 5 % je px –, nimmt die Ableitung die ganzzahlige Skala mit der kleinsten größten Abweichung (je Stufe ab- oder aufgerundet, streng steigend; Gleichstand: die nächste an den exakten Größen). Gemessen in M4 vor dieser Entscheidung: zwei der zehn Zufalls-Agordos verletzten `type-scale` (fest), danach keine; das Raster 101 × 76 hält.

#### D-11 `schrift.gewicht`
`font.weight.*` um round(2g) ganze Schnitte (100) – höchstens zwei –, geklemmt auf das leichteste und das schwerste Gewicht der Struktur (100, 900). Die Rangfolge bleibt (sie fällt an den Enden höchstens zusammen). Ganze Schnitte, weil Figma den Schnitt („Medium“) aus dem auf 100 gerundeten Gewicht ableitet (F30).

#### D-12 `ikono.gewicht`
Das Paket trägt die Glyphen des Gewichts aus `data/ikonoj/<gewicht>/` statt der von komuna, `aspekto.json#/ikonoj` nennt `style`, `source` (`assets/<gewicht>`) und das Lesedatum. regular ist komunas eigenes. Die Glyphen gehören dem Agordilo wie die Kalibrierung und stehen **nicht** im Fingerabdruck der Struktur (sonst änderte sich die Herkunft jeder abgeleiteten Marke). Fehlt einem Gewicht eine Glyphe, steht beim Zusammensetzen die von komuna, der Fehler sperrt den Export.

#### D-13 Hinweise statt Reguloj (G4, E2)
`agordilo-body-size` (eine Rolle `font.size.body.*` unter 14 px in einem Viewport), `agordilo-border-collapse` (`border.width.default` = `border.width.strong`: `contrast=high`, das den Standardrand als starken zeichnet, verdickt nichts mehr), `agordilo-shadow-none` (`form.schatten` 0). Sie stehen nur im Raporto, wenn sie auftreten – der Raporto einer Agordo der Stufe 1 bleibt bytegleich.

#### D-14 Der Beweis „bytegleich“
Die Stufe-1-Ableitung von provo ist auf `main` eingecheckt; bevor ① provo änderte, wurden die SHA-256 ihrer 25 Dateien mit der Agordo als Fixture gesichert. Zwei Tests: die Agordo der Stufe 1 ergibt alle 25 Prüfsummen; mit ausgeschriebenen Standards alle bis auf `aspekto.json`, und dessen Prüfsumme nach dem Entfernen der Felder der Stufe 2 aus der Herkunft.

#### D-15 Die Beispielmarken
`provo` bleibt die Marke aus Spec 016 (Farbe gleich) und wird runder, luftiger, mit bold-Icons: sichtbar andere Form in jedem Ero. `provo-kompakta` ist der Gegenpol mit eigener Leitfarbe, damit die Gegenüberstellung in Figma und in der Werkstatt beide Achsen zeigt. Beide sind bekannte Aspektoj wie provo (`check:alirebleco` misst sie, `check:ikonaro` prüft ihre Glyphen).

### Arkitekturo-Abdeckung

| Artikel / Festlegung | Wie ① ihn trägt |
|---|---|
| Art. I, G1 | Die Werte der Stufe 2 sind gewöhnliche Token-Werte im Paket; die Agordo steht als Herkunft in `aspekto.json` |
| Art. IV, G3 | Jeder Regler eine Funktion auf der Struktur des Vortaro; das Paket belegt weiter jeden Token |
| Art. V, E3 | Eigene Ableitung, kein fremder Code; die Glyphen aus Phosphor (MIT) mit Herkunft wie das Ikonaro |
| Art. VI, G4 | Feste Regeln binden unverändert; Gefahren ohne Regel sind Hinweise und Kandidaten |
| Art. VII, E6 | Jede Glyphe mit Quelle, Version, Lizenz; `ikonoj.json` mit Integrität des Pakets |
| Art. X | Rot zuerst (`f126b65`); die Prüfungen sind die der CI |
| Art. XI | Kein neuer Mechanismus: Schema, `rewriteSet`, W2, die Raporto-Hinweise; ein Modul im vorhandenen Paket |
| E1, E2 | Keine neuen Tokens, Rollen, Eroj, Reguloj |
| E7 | Neue Namen nur als Vorschlag (O-1) |
| G8 | provo und provo-kompakta; CSS, Make Kit, Figma, Penpot folgen ohne Sonderweg (Parität 0 Differenzen) |

### Abweichungen von der Spec

1. **`schrift.familien` ist `schriften`** (Stufe 1): ein Feld, kein zweites. `aspekto.json#/fonts` verlangt zu jeder Familie Lizenz, Quelle und Weitergabe (`font-rules`); ein bloßer Name ergäbe eine ungültige Aspekto. Das Panel (②) schreibt `schriften`.
2. **`raum.hoehe` wirkt über die Stufen von `size.scale.*`**, auf die die Controls zeigen, nicht als Literal auf `size.control.*` – sonst überschriebe die Dichte die Höhe (D-02, D-07).
3. **Deckkraft der Schatten in Stufen der shade-Palette** (0, 8, 10, 25, 50 %), nicht stufenlos (E1).
4. **`schrift.groesse` in Stufen der Struktur-Skala** (D-09).
5. **Rundung der Schriftgrößen mit Suche**, wo die einfache Rundung `type-scale` risse (D-10).
6. **„Raster in `dimensioj.json`“:** `dimensioj.json` nennt kein Raster; genommen 4 px, 2 px wo die Struktur feiner ist (D-06).
7. **Fünf Phosphor-Gewichte nachgeholt** (E6): im Repo lagen regular (komuna) und fill (ekzemplo); thin, light, bold, fill, duotone liegen jetzt beim Agordilo.
8. **Die Insel der Werkstatt trägt in ① die Glyphen**, damit Browser und CLI für `provo` (bold) gleich bleiben; Panel, Live-Werte und Verlauf folgen in ②.
9. **Plan und Aufgaben von ④** stehen in [`nachlese-6/`](nachlese-6/) neben diesem Plan: ④ geht von `main` ab, ① bis ③ sind gestapelt; legten beide Zweige `plan.md` an, kollidierten sie beim Merge. Der Abschnitt ④ unten fasst zusammen.

### Befunde / Mankoj

- **B-1 Farbregler der Stufe 1 an ihren Enden** verletzen feste Regeln (M4): `regler.helligkeit` −1 67 feste Verstöße (`contrast-below-threshold` 58), +1 18; `regler.kontrast` −1 218 (`contrast-below-threshold` 195), +1 4; acht der zehn Zufalls-Agordos durch Farbe. Kein Regler der Stufe 2 verletzt eine feste Regel, einzeln nicht und alle zusammen an ihren Enden nicht. G4 („die Grenzen sind so gewählt …“) gilt damit für die neuen Regler; die Bereiche aus Spec 016 bleiben unverändert (Regel 0, O-4). In ③ hält `propose_agordo` vor einer festen Regel an.
- **B-2 `schrift.skala` 1,5** spreizt die zwölf Stufen auf 7 … 613 px (`display.1` 417 px, in `viewport=expanded` 613 px; die Bildunterschrift 7 px, `body.2` 11 px – Hinweis). Bei 1,25: 10 … 119 px (`display.1` 97 px). Der Bereich ist der der Spec (O-5).
- **B-3 `chevron-left`** ist in komuna und ekzemplo der gespiegelte Pfad von `caret-right` (Spec 015 ①: „gespiegelt“); die neuen Gewichte tragen `caret-left`, wie Phosphor es liefert (gleiche Form). Alle anderen Glyphen von regular und fill baut der Generator bytegleich nach.
- **B-4 fill und duotone** sind bei Phosphor Gewichte, gestalterisch Stile: fill füllt die Fläche (ekzemplo nutzt es), duotone legt eine Fläche mit 20 % Deckkraft unter die Linie (bei `check` ein Quadrat). Beide liegen bereit (O-7).
- **B-5 Größe:** `data/ikonoj` 50,5 KB (85 Glyphen); die Insel der Werkstatt wächst um 54,7 KB (Vitrino des Parität-Builds 5,70 MB).
- **B-6 Rahmen 0,5:** `border.width.default` und `strong` sind beide 1 px – Hinweis `agordilo-border-collapse` (K-2).
- **B-7 Fingerabdruck** unverändert: provo hat dieselbe `structure.sha256` wie in Stufe 1.
- **B-8 Werkstatt in ①:** Eine Agordo mit Feldern der Stufe 2 im Fragment wird geprüft wie in der CLI (Raporto gleich), aber noch nicht live dargestellt – die Werkstatt setzt in ① nur die Paletten als Custom Properties. Das folgt mit ②.
- **Mankoj:** keine neuen.

### Regulo-Kandidaten

Keine neue Regulo (E2). Die Werkstatt und der Raporto zeigen einen Hinweis; der Maintainer entscheidet später.

- **K-1 Mindestgröße Fließtext** (`agordilo-body-size`): eine Rolle `font.size.body.*` unter 14 px. Gemessen: ab `schrift.groesse` −0,12 und ab `schrift.skala` 1,184 – `font.size.body.2` steht in der Struktur mit 14 px genau auf der Grenze, jede Verkleinerung löst den Hinweis aus. Vorschlag für eine Regulo: `font.size.body.*` ≥ 14 px in jeder Kombination.
- **K-2 Starker Rand stärker als der Standardrand** (`agordilo-border-collapse`): `border.width.strong` > `border.width.default`, damit `contrast=high` den Rand sichtbar verdickt.
- **K-3 Ebenen ohne Schatten** (`agordilo-shadow-none`): bei `form.schatten` 0 trägt nur die Helligkeit die Ebenen; `surface-distinct` (anpassbar) misst das schon, ein eigener Kandidat nur, wenn der Maintainer Schatten als Pflicht sieht.
- **K-4 Obergrenze der Displaygröße** (B-2): kein Schutz einer Person, eher Geschmack – als Kandidat genannt, Vorschlag: keiner, stattdessen O-5.
- **„Zeilenhöhe zu knapp“** (Beispiel der Spec) tritt nicht auf: die Zeilenhöhen sind Verhältnisse und kein Regler bewegt sie; `type-rhythm` bindet weiter.

### Offen (für den Maintainer)

- **O-1 Namen (E7):** Im Code heißt die Stufe 2 `Gestalt` (`gestalt.ts`, `deriveGestalt`); die Hinweise `agordilo-body-size`, `agordilo-border-collapse`, `agordilo-shadow-none`. **Vorschlag: so**; Ontologio-Einträge mit ③.
- **O-2 `schrift.familien` = `schriften`** (Abweichung 1). **Vorschlag: so.**
- **O-3 Deckkraft in shade-Stufen** (Abweichung 3, D-05). **Vorschlag: so**; stufenlos ginge nur mit neuen Palette-Stufen (E1).
- **O-4 Bereiche der Farbregler** (B-1): (a) so lassen, in ③ hält `propose_agordo` vor der Regel an und die Werkstatt zeigt den Verstoß; (b) die Bereiche aus Spec 016 enger. **Vorschlag: (a).**
- **O-5 Obergrenze `schrift.skala`** (B-2): 1,5 laut Spec; **Vorschlag: 1,25** (größte Stufe 119 px).
- **O-6 `provo-kompakta` als bekannte Aspekto** – kostet in `check:alirebleco` eine Aspekto mehr (144 Kombinationen). **Vorschlag: so** (wie O-7 aus Spec 016).
- **O-7 fill und duotone** als Gewichte zulassen (B-4). **Vorschlag: so** (Phosphor nennt sie Gewichte).

### M4 – Eckwerte

Je Regler Minimum und Maximum bei sonst Standard (Leitfarbe komunas `#375479`), jedes Icon-Gewicht, alle acht Zahlenregler der Stufe 2 zugleich an Minimum bzw. Maximum, die beiden Beispielmarken und zehn Zufalls-Agordos (Seed 19, `seededRandom`: Leitfarbe in OKLCH, jeder Regler gleichverteilt im Bereich, ein Gewicht). Jede Agordo abgeleitet und mit allen Prüfungen geprüft: `pnpm --filter @fundamento/agordilo mezuroj m4`. „Paare“ sind Paar-Auswertungen der Aspekto (89 KontrastParoj × 72 Kombinationen). „Hinweise gesamt“ zählt APCA mit.

| Fall | Agordo | Paare bestanden | Paare verletzt | Hinweise Stufe 2 | Hinweise gesamt | Verstöße fest | Verstöße anpassbar | Regeln | Export |
|---|---|---|---|---|---|---|---|---|---|
| Standard | `{"leitfarbe":"#375479"}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| neutral.toenung min (0) | `{"leitfarbe":"#375479","neutral":{"toenung":0}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| neutral.toenung max (1) | `{"leitfarbe":"#375479","neutral":{"toenung":1}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| regler.helligkeit min (-1) | `{"leitfarbe":"#375479","regler":{"helligkeit":-1}}` | 5364 | 1044 | – | 276 | 67 | 11 | state-distinct 5, text-hierarchy 1, contrast-reserve 4, palette-aligned 4, palette-even 6, contrast-below-threshold 58 | nein |
| regler.helligkeit max (1) | `{"leitfarbe":"#375479","regler":{"helligkeit":1}}` | 6408 | 0 | – | 41 | 18 | 17 | contrast-reserve 4, state-distinct 14, text-hierarchy 5, surface-distinct 3, palette-aligned 3, palette-even 6 | nein |
| regler.kontrast min (-1) | `{"leitfarbe":"#375479","regler":{"kontrast":-1}}` | 2880 | 3528 | – | 301 | 218 | 10 | state-distinct 10, text-hierarchy 2, contrast-reserve 13, palette-aligned 2, palette-even 6, contrast-below-threshold 195 | nein |
| regler.kontrast max (1) | `{"leitfarbe":"#375479","regler":{"kontrast":1}}` | 6408 | 0 | – | 14 | 4 | 11 | state-distinct 4, text-hierarchy 2, surface-distinct 3, palette-even 6 | nein |
| regler.saettigung min (0) | `{"leitfarbe":"#375479","regler":{"saettigung":0}}` | 6408 | 0 | – | 132 | 0 | 7 | palette-aligned 7 | nur mit Jugxo |
| regler.saettigung max (2) | `{"leitfarbe":"#375479","regler":{"saettigung":2}}` | 6408 | 0 | – | 134 | 0 | 0 | – | ja |
| form.radius min (0) | `{"leitfarbe":"#375479","form":{"radius":0}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| form.radius max (2) | `{"leitfarbe":"#375479","form":{"radius":2}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| form.rahmen min (0.5) | `{"leitfarbe":"#375479","form":{"rahmen":0.5}}` | 6408 | 0 | border-collapse border.width.strong | 134 | 0 | 0 | – | ja |
| form.rahmen max (2) | `{"leitfarbe":"#375479","form":{"rahmen":2}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| form.schatten min (0) | `{"leitfarbe":"#375479","form":{"schatten":0}}` | 6408 | 0 | shadow-none elevation.shadow.* | 134 | 0 | 0 | – | ja |
| form.schatten max (2) | `{"leitfarbe":"#375479","form":{"schatten":2}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| raum.abstand min (0.75) | `{"leitfarbe":"#375479","raum":{"abstand":0.75}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| raum.abstand max (1.5) | `{"leitfarbe":"#375479","raum":{"abstand":1.5}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| raum.hoehe min (0.85) | `{"leitfarbe":"#375479","raum":{"hoehe":0.85}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| raum.hoehe max (1.25) | `{"leitfarbe":"#375479","raum":{"hoehe":1.25}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| schrift.groesse min (-1) | `{"leitfarbe":"#375479","schrift":{"groesse":-1}}` | 6408 | 0 | body-size font.size.body.1, body-size font.size.body.2 | 135 | 0 | 0 | – | ja |
| schrift.groesse max (1) | `{"leitfarbe":"#375479","schrift":{"groesse":1}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| schrift.skala min (1.125) | `{"leitfarbe":"#375479","schrift":{"skala":1.125}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| schrift.skala max (1.5) | `{"leitfarbe":"#375479","schrift":{"skala":1.5}}` | 6408 | 0 | body-size font.size.body.2 | 134 | 0 | 0 | – | ja |
| schrift.gewicht min (-1) | `{"leitfarbe":"#375479","schrift":{"gewicht":-1}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| schrift.gewicht max (1) | `{"leitfarbe":"#375479","schrift":{"gewicht":1}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| ikono.gewicht thin | `{"leitfarbe":"#375479","ikono":{"gewicht":"thin"}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| ikono.gewicht light | `{"leitfarbe":"#375479","ikono":{"gewicht":"light"}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| ikono.gewicht bold | `{"leitfarbe":"#375479","ikono":{"gewicht":"bold"}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| ikono.gewicht fill | `{"leitfarbe":"#375479","ikono":{"gewicht":"fill"}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| ikono.gewicht duotone | `{"leitfarbe":"#375479","ikono":{"gewicht":"duotone"}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| alle Form-Regler min | `{"leitfarbe":"#375479","form":{"radius":0,"rahmen":0.5,"schatten":0},"raum":{"abstand":0.75,"hoehe":0.85},"schrift":{"groesse":-1,"skala":1.125,"gewicht":-1}}` | 6408 | 0 | body-size font.size.body.1, body-size font.size.body.2, border-collapse border.width.strong, shadow-none elevation.shadow.* | 137 | 0 | 0 | – | ja |
| alle Form-Regler max | `{"leitfarbe":"#375479","form":{"radius":2,"rahmen":2,"schatten":2},"raum":{"abstand":1.5,"hoehe":1.25},"schrift":{"groesse":1,"skala":1.5,"gewicht":1}}` | 6408 | 0 | – | 133 | 0 | 0 | – | ja |
| provo | `{"leitfarbe":"#6b4fa0","zusatzfarben":{"info":"oklch(0.55 0.12 225)"},"neutral":{"toenung":0.4},"regler":{"helligkeit":0.1,"kontrast":0.1,"saettigung":1.1},"schriften":{"display":"Archivo …"},"form":{"radius":1.6},"raum":{"abstand":1.15},"ikono":{"gewicht":"bold"}}` | 6408 | 0 | – | 108 | 0 | 0 | – | ja |
| provo-kompakta | `{"leitfarbe":"#0f6b5c","neutral":{"toenung":0.2},"form":{"radius":0.25,"schatten":0.5},"raum":{"abstand":0.8,"hoehe":0.9},"schrift":{"groesse":-0.5},"ikono":{"gewicht":"light"}}` | 6408 | 0 | body-size font.size.body.2 | 135 | 0 | 0 | – | ja |
| Zufall 1 | `{"leitfarbe":"oklch(0.37 0.086 162.906)","neutral":{"toenung":0.757},"regler":{"helligkeit":0.973,"kontrast":-0.355,"saettigung":1.307},"form":{"radius":1.063,"rahmen":1.295,"schatten":1.645},"raum":{"abstand":0.835,"hoehe":1.045},"schrift":{"groesse":0.154,"skala":1.274,"gewicht":0.153},"ikono":{"gewicht":"thin"}}` | 6192 | 216 | body-size font.size.body.2 | 132 | 38 | 16 | contrast-reserve 13, state-distinct 13, text-hierarchy 4, surface-distinct 2, palette-aligned 4, palette-even 6, contrast-below-threshold 12 | nein |
| Zufall 2 | `{"leitfarbe":"oklch(0.383 0.11 257.016)","neutral":{"toenung":0.835},"regler":{"helligkeit":-0.066,"kontrast":-0.61,"saettigung":0.151},"form":{"radius":0.28,"rahmen":1.412,"schatten":0.574},"raum":{"abstand":0.873,"hoehe":1.203},"schrift":{"groesse":-0.459,"skala":1.486,"gewicht":0.885},"ikono":{"gewicht":"regular"}}` | 5184 | 1224 | body-size font.size.body.2 | 260 | 96 | 4 | contrast-reserve 24, state-distinct 5, palette-even 3, text-hierarchy 1, contrast-below-threshold 67 | nein |
| Zufall 3 | `{"leitfarbe":"oklch(0.404 0.077 330.548)","neutral":{"toenung":0.865},"regler":{"helligkeit":-0.997,"kontrast":-0.38,"saettigung":1.868},"form":{"radius":1.877,"rahmen":1.24,"schatten":0.783},"raum":{"abstand":0.898,"hoehe":0.967},"schrift":{"groesse":0.697,"skala":1.149,"gewicht":-0.246},"ikono":{"gewicht":"bold"}}` | 4356 | 2052 | – | 298 | 138 | 20 | state-distinct 19, text-hierarchy 4, contrast-reserve 6, surface-distinct 1, surface-order 1, palette-aligned 8, palette-even 6, contrast-below-threshold 113 | nein |
| Zufall 4 | `{"leitfarbe":"oklch(0.533 0.17 180.782)","neutral":{"toenung":0.224},"regler":{"helligkeit":-0.794,"kontrast":0.383,"saettigung":1.213},"form":{"radius":1.537,"rahmen":1.833,"schatten":0.002},"raum":{"abstand":0.995,"hoehe":1.038},"schrift":{"groesse":-0.71,"skala":1.259,"gewicht":0.621},"ikono":{"gewicht":"light"}}` | 5886 | 522 | body-size font.size.body.1, body-size font.size.body.2 | 235 | 33 | 14 | contrast-reserve 3, state-distinct 2, palette-aligned 8, palette-even 6, contrast-below-threshold 28 | nein |
| Zufall 5 | `{"leitfarbe":"oklch(0.549 0.043 11.166)","neutral":{"toenung":0.295},"regler":{"helligkeit":0.292,"kontrast":0.631,"saettigung":0.232},"form":{"radius":1.214,"rahmen":1.475,"schatten":0.858},"raum":{"abstand":1.191,"hoehe":0.954},"schrift":{"groesse":-0.772,"skala":1.13,"gewicht":0.672},"ikono":{"gewicht":"duotone"}}` | 6408 | 0 | body-size font.size.body.1, body-size font.size.body.2 | 17 | 8 | 17 | state-distinct 8, text-hierarchy 4, surface-distinct 3, palette-even 6, palette-aligned 4 | nein |
| Zufall 6 | `{"leitfarbe":"oklch(0.505 0.168 55.542)","neutral":{"toenung":0.39},"regler":{"helligkeit":0.103,"kontrast":-0.135,"saettigung":0.183},"form":{"radius":0.055,"rahmen":1.82,"schatten":1.871},"raum":{"abstand":1.08,"hoehe":1.06},"schrift":{"groesse":0.256,"skala":1.234,"gewicht":0.73},"ikono":{"gewicht":"thin"}}` | 6408 | 0 | – | 146 | 5 | 4 | contrast-reserve 5, palette-aligned 4 | nein |
| Zufall 7 | `{"leitfarbe":"oklch(0.554 0.105 221.409)","neutral":{"toenung":0.545},"regler":{"helligkeit":0.571,"kontrast":0.334,"saettigung":1.699},"form":{"radius":0.251,"rahmen":1.765,"schatten":1.634},"raum":{"abstand":1.343,"hoehe":1.089},"schrift":{"groesse":-0.831,"skala":1.439,"gewicht":-0.193},"ikono":{"gewicht":"duotone"}}` | 6408 | 0 | body-size font.size.body.1, body-size font.size.body.2 | 49 | 15 | 22 | contrast-reserve 6, state-distinct 9, text-hierarchy 4, surface-distinct 3, surface-order 1, palette-aligned 8, palette-even 6 | nein |
| Zufall 8 | `{"leitfarbe":"oklch(0.537 0.077 72.95)","neutral":{"toenung":0.789},"regler":{"helligkeit":0.91,"kontrast":-0.465,"saettigung":1.909},"form":{"radius":0.415,"rahmen":0.587,"schatten":1.838},"raum":{"abstand":1.29,"hoehe":1.04},"schrift":{"groesse":0.4,"skala":1.442,"gewicht":0.034},"ikono":{"gewicht":"bold"}}` | 6138 | 270 | body-size font.size.body.2, border-collapse border.width.strong | 160 | 43 | 14 | contrast-reserve 16, state-distinct 12, text-hierarchy 3, surface-distinct 1, palette-aligned 4, palette-even 6, contrast-below-threshold 15 | nein |
| Zufall 9 | `{"leitfarbe":"oklch(0.556 0.103 69.048)","neutral":{"toenung":0.245},"regler":{"helligkeit":-0.822,"kontrast":0.807,"saettigung":0.49},"form":{"radius":0.614,"rahmen":0.627,"schatten":0.744},"raum":{"abstand":0.807,"hoehe":0.983},"schrift":{"groesse":-0.75,"skala":1.468,"gewicht":0.483},"ikono":{"gewicht":"fill"}}` | 6408 | 0 | body-size font.size.body.1, body-size font.size.body.2, border-collapse border.width.strong | 184 | 0 | 6 | palette-even 6 | nur mit Jugxo |
| Zufall 10 | `{"leitfarbe":"oklch(0.44 0.081 359.201)","neutral":{"toenung":0.471},"regler":{"helligkeit":0.122,"kontrast":0.383,"saettigung":1.378},"form":{"radius":0.346,"rahmen":1.25,"schatten":0.603},"raum":{"abstand":0.76,"hoehe":1.192},"schrift":{"groesse":0.453,"skala":1.137,"gewicht":0.944},"ikono":{"gewicht":"bold"}}` | 6408 | 0 | – | 67 | 4 | 9 | state-distinct 4, text-hierarchy 2, surface-distinct 2, palette-even 2, palette-aligned 3 | nein |

**Ergebnis:** Kein Regler der Stufe 2 verletzt eine feste Regel – einzeln an seinen Enden nicht, alle zusammen an Minimum oder Maximum nicht, in keiner Zufalls-Agordo. Feste Verstöße kommen nur aus `regler.helligkeit` und `regler.kontrast` (Stufe 1) an ihren Enden (B-1). Die Hinweise der Stufe 2 erscheinen genau dort, wo die Kandidaten K-1 bis K-3 greifen.

**Rein, ohne Modelo** (Test `gestalt.test.ts`): 3^8 = 6 561 Ecken × 3 Dichten × 3 Viewports × 2 Kontraste ohne Fund; `schrift.groesse` × `schrift.skala` 101 × 76 Werte ohne `type-scale`-Verstoß.

## ② Werkstatt Stufe 2

**Branch:** `261020-spec-019-werkstatt-116ba2` (gestapelt auf ① `261020-spec-019-bibliothek-116ba2`) · **Datum:** 2026-10-20 · **Stand:** zur Abnahme (Messanleitung in plan ③).

### Zusammenfassung

1. **Panel G7:** zu „Farbe“ (Zusatzfarben, Neutral-Tönung, Helligkeit, Kontrast, Sättigung) kommen die Gruppen „Form“ (Radius, Rahmen, Schatten), „Raum“ (Abstand, Höhe), „Schrift“ (Schriftgröße, Skala, Schriftgewicht und je Rolle display/body/code ein Feld für die Familie) und „Icons“ (Icon-Gewicht). Jede Gruppe ist ein `fm-faldilo` (zuklappbar, offen beim Start). Die Regler bleiben das native `input type=range` mit Label und Wert (`output`); daneben je Regler ein `fm-butono` „Zurücksetzen“ auf den Standard (W-8). Das Icon-Gewicht ist ein `fm-elektilo` mit regular und jedem Gewicht, dessen Glyphen vollständig im Repo liegen.
2. **Live an jedem Ero:** Die Werte der Stufe 2 (`deriveGestalt` aus ①) stehen als Custom Properties am Root und auf der Entwurfsseite der Gegenüberstellung, geschrieben mit den Deklarationen des CSS-Celo (`tokenDeclarations`); die Rollen sind im CSS `var()`-Aliasse, also folgen Dichte, Viewport und Kontrast. Die Glyphen eines anderen Gewichts ersetzen `--fm-ikono-<name>` (`glyphValue` des CSS-Celo). Im Dunkelmodus gelten die Schattenfarben aus dem Konjunktions-Set (plan ① D-05).
3. **Prüfung ohne Stocken G5:** Paletten und Prüfung laufen in **zwei Workern**, gebaut aus dem Text des eigenen Moduls als Blob; der Hauptfaden setzt nur noch Werte, einmal je Frame. Gemessen: vorher blockierte eine Prüfung den Hauptfaden 1 045 ms und ein Reglerzug bis 92 ms; nachher **keine Long Task** über 50 ms, beim Ziehen über 50 Änderungen und in M5. Ohne Worker läuft derselbe Code im Hauptfaden.
4. **Verlauf:** „Rückgängig“ und „Wiederholen“ als `fm-butono` und mit ⌘Z / ⇧⌘Z bzw. Strg+Z / Umschalt+Strg+Z, nur im Speicher der Seite. Die Schritte eines Reglers innerhalb von 600 ms sind ein Schritt (ein Zug); in Textfeldern bleibt das Rückgängig des Feldes.
5. **Vorschlags-Leiste:** Ein Link aus `propose_agordo` trägt neben `#agordo=…` (die Agordo vorher) den Teil `vorschlag=…` (deflate-raw, base64url, JSON `{ wunsch, agordo }`). Die Werkstatt zeigt oben „Vorgeschlagen: ruhiger (Sättigung 1,0 → 0,8, …)“ mit „Übernehmen“ und „Verwerfen“; bis dahin gilt die Agordo vorher. „Übernehmen“ ist ein Schritt des Verlaufs; beide nehmen `vorschlag=` aus dem Fragment.
6. **Schriften:** Ein Name im Feld einer Rolle wird `schriften.<rolle>` (plan ① Abweichung 1) – nur der Name, nie eine Datei. Kennt der Browser die Schrift nicht, steht unter der Gruppe „Schrift nicht installiert, Darstellung in Ersatzschrift: …“.
7. **Gleichheit Browser–CLI** für beide Beispielmarken: Der Raporto der Werkstatt ist für `provo` und `provo-kompakta` Wert für Wert der der eingecheckten Fixtures.
8. **M5** (unten).
9. **Kleinste Änderungen daneben:** Agordilo – `regler.ts` (`reglerOf`, `reglerValue`, `withRegler`, `reglerDiff`, `vorschlagSatz`, `Vorschlag`), `GestaltBasis.types`; Projekcioj – `content-visibility: auto` für die Abschnitte, die Palettentabellen und die beiden Seiten der Gegenüberstellung im Werkstatt-Modus; Bericht mit Zählern an Ort und Stelle, Liste nur bei Änderung, APCA-Liste erst beim Öffnen; Tests – der Vergleichstest scrollt die Seiten in den Blick, die Axe-Tests rendern alles, der Test M3 ist M5.

### Entwurfsentscheidungen

#### D-01 Worker statt Häppchen
Die Prüfung ist ein Aufruf der Bibliothek (Modelo-Validierung rund 1 s am Stück); in Häppchen teilen hieße, die Validierung umzubauen. Ein Worker trägt dieselbe Bibliothek unverändert. Die Spec verlangt, dass er aus der statischen Datei in Chromium, Firefox und WebKit läuft; gemessen (Probe mit Playwright unter `file://`): ein **Modul-Worker** aus einem Blob startet in Chromium nicht, Firefox und WebKit starten ihn; ein **klassischer Worker** startet in allen dreien. Darum wird der Text des Bündels klassisch gemacht: `import.meta.url` wird die Adresse des Workers (jede URL darauf ist absolut: `data:`, `fm-provided:`), `import.meta.main` (der tote CLI-Zweig) `false`, und eine async-Funktion hält das Ganze.

#### D-02 Eine Anfrage unterwegs, die neueste gewinnt
Je Worker ist höchstens eine Anfrage unterwegs; kommt ihre Antwort für eine ältere Agordo, geht sofort die neueste hinaus. Das ersetzt den Abbruch des Häppchen-Wegs: Ein veraltetes Ergebnis erscheint nie (Abweichung 1). Die Prüfung bleibt entprellt (400 ms), die Paletten nicht.

#### D-03 Ein Frame, gleich viele Änderungen
Ein Reglerzug liefert mehrere `input` je Frame; die Werkstatt setzt Werte der Stufe 2 und Paletten einmal je Frame (`requestAnimationFrame`). Das Agordo-Schema wird beim Laden übersetzt, nicht beim ersten Zug (gemessen 78 ms beim ersten `setAgordo`).

#### D-04 Nur rechnen, was man sieht
Gemessen (Chromium): ein Wechsel der 73 Palettenwerte kostete 20 ms Neuberechnung, davon 16 ms für die zwei Klone aller Ero-Abschnitte in der Gegenüberstellung. Mit `content-visibility: auto` auf den Abschnitten, den Palettentabellen und den beiden Seiten 4–5 ms. Folge für Tests: Werte in übersprungenen Inhalten liest man, nachdem sie im Blick sind; Axe misst übersprungene Inhalte mit Platzhaltermaßen und wird darum auf alles Gerenderte angesetzt (B-4).

#### D-05 Die Live-Werte schreibt das CSS-Celo
`tokenDeclarations` und `glyphValue` sind die Funktionen, mit denen das CSS-Celo das Stylesheet schreibt (Art. II, Art. XI): kein zweiter Formatierer. Der Typ jedes Tokens kommt aus dem Kern-Set (`GestaltBasis.types`).

#### D-06 Verlauf
Zwei Stapel (vorher, nachher) der Agordo. Ein Schritt entsteht, wenn sich die Agordo aus dem Panel ändert; Änderungen desselben Bedienelements innerhalb von 600 ms verschmelzen. Laden aus dem Fragment ist kein Schritt. Tastatur nur im Werkstatt-Modus und nicht in Textfeldern.

#### D-07 Schrift als Name
Eine neue Familie wird ein Fonto mit `license: "proprietary"`, `redistributable: false`, `source: "Werkstatt: nur der Name, ohne Datei"`, `scripts: ["Latn"]` – die vorsichtige Aussage, solange niemand die Lizenz nennt (O-2). Ob der Browser sie hat, entscheidet ein Breitenvergleich auf einem Canvas gegen drei generische Familien.

#### D-08 Das Fragment des Vorschlags
`vorschlag=` trägt die vorgeschlagene Agordo und das Wort, nicht den Diff: den Diff rechnet die Werkstatt aus der Agordo, die gerade gilt (`reglerDiff`), so stimmt die Leiste auch, wenn man vorher noch etwas bewegt. Dasselbe Verfahren wie `#agordo=` (deflate-raw, base64url).

#### D-09 Eine Reglerliste
Panel, Verlauf, Leiste und in ③ `propose_agordo` lesen dieselbe Liste aus der Bibliothek (`reglerOf`): Gruppe, deutsches Label, Bereich, Standard. Die Kennungen der Regler aus Stufe 1 bleiben (`fm-werkstatt-helligkeit` …), die neuen heißen `fm-werkstatt-<gruppe>-<feld>`.

### Arkitekturo-Abdeckung

| Artikel / Festlegung | Wie ② ihn trägt |
|---|---|
| Art. I, G1 | Die Werkstatt rechnet über den Modelo-Dateien der Struktur; der Download bleibt eine Agordo |
| Art. II | Custom Properties über `cssVariable` und `tokenDeclarations` (NomRegulo), nie von Hand |
| Art. VIII | Dieselbe Bibliothek im Worker; Raporto für provo und provo-kompakta gleich der CLI |
| Art. X | Rot zuerst (`1e72db4`); Long Tasks, Gleichheit, Axe in vier Kombinationen im Browser |
| Art. XI | Ein Modus der Vitrino, kein neues Celo, kein neues Ero; Eroj, wo es eines gibt (`fm-faldilo`, `fm-elektilo`, `fm-kampo`, `fm-butono`) |
| G5 | Zwei Worker, eine Anfrage unterwegs, keine Long Task über 50 ms |
| G7 | Gruppen, Rücksetzen, Verlauf, Vorschlags-Leiste, live, Icons, Schriften, native Regler |
| E5 | Die Vitrino schreibt keine Datei |

### Abweichungen von der Spec

1. **Kein Abbruch der Prüfung**, sondern verworfene veraltete Ergebnisse (D-02): Die Spec verlangt den Abbruch für den Häppchen-Weg; im Worker kostet eine laufende Prüfung den Hauptfaden nichts.
2. **Tests an einer Rendering-Optimierung angepasst** (D-04): Der Vergleichstest aus Spec 016 ② scrollt die Seiten in den Blick, bevor er Farben liest; die Axe-Tests schalten `content-visibility` ab und warten laufende Übergänge ab. Die Erwartungen sind unverändert.
3. **Der Test M3 ist jetzt M5** (gleiche 50 Änderungen, dazu die längste Blockade).
4. **Das Icon-Gewicht zeigt nur Gewichte mit vollständigen Glyphen** (heute alle sechs).
5. **Die Schriftfelder schreiben `schriften`** mit vorsichtigen Lizenzangaben (D-07, plan ① Abweichung 1).

### Befunde / Mankoj

- **B-1 Chromium und Modul-Worker unter `file://`:** gemessen in Chromium, Firefox und WebKit (Playwright 1.63): klassischer Worker aus Blob überall, Modul-Worker aus Blob nicht in Chromium. Darum D-01.
- **B-2 Vorher/nachher:** vorher (Stand ①) beim Ziehen Long Tasks von 92, 52 und 283 ms, die Prüfung 1 045 ms im Hauptfaden; nachher keine (G5-Test, M5).
- **B-3 Die Gegenüberstellung war der teuerste Teil** der Neuberechnung (16 von 20 ms); `content-visibility` auf den Seiten senkt sie auf 4–5 ms (D-04).
- **B-4 Axe und `content-visibility`:** übersprungene Inhalte haben für Axe Platzhaltermaße (8,3 px hohe Knöpfe) und einen falschen Hintergrund; der Test rendert alles, bevor er misst. Kein Befund am Produkt.
- **B-5 Rückfall ohne Worker:** gibt ein Browser keinen Worker, rechnet der Hauptfaden wie in Spec 016 ② (Long Tasks wie vorher); `fmWerkstatt.state.worker` sagt, welcher Weg gilt.
- **Mankoj:** keine neuen.

### Offen (für den Maintainer)

- **O-1 Regler als Ero** (O-3 aus Spec 016 ②): native `input type=range`, `type=color`, `type=number` bleiben Kandidaten; kein neues Ero in dieser Spec. **Vorschlag:** Kandidat für Etappe 8b.
- **O-2 Lizenz einer Schrift aus dem Panel** (D-07): `proprietary`, nicht weitergegeben, bis jemand die Lizenz einträgt. **Vorschlag: so.**
- **O-3 `content-visibility` in der Werkstatt** (D-04). **Vorschlag: so**; im Ansehen-Modus bleibt die Vitrino unverändert.
- **O-4 600 ms je Verlaufsschritt** (D-06). **Vorschlag: so.**

### M5 – Tempo (Ableitung und Prüfung beim Ziehen, längste Blockade)

Gemessen über 50 Änderungen des Reglers Helligkeit (−1 … 1), je Änderung die Ableitung (Paletten im Worker samt Setzen der Werte, bis sie stehen) und die Prüfung (Worker, bis der Bericht steht); dazu die längste Long Task des Hauptfadens während der Messung (`fmWerkstatt.measure(50)`, Test „M5“ in `packages/eroj/test/vitrino.check.ts`, die Zeile steht im stderr und als Annotation). Zusätzlich prüft der Test „G5“ 50 Reglerzüge über die Tastatur gegen Long Tasks über 50 ms.

| Wo | Ableitung Median | Ableitung p95 | Prüfung Median | Prüfung p95 | längste Blockade |
|---|---|---|---|---|---|
| Mac (Chromium headless, Lauf von P0 auf dem Rechner des Maintainers, 2026-10-20) | 57,1 ms | 71,6 ms | 1 042,0 ms | 1 092,3 ms | 0 ms (0 Long Tasks) |
| CI (Chromium headless, GitHub-Runner, Lauf 39350608447, `be843c5`) | 90,1 ms | 120,0 ms | 1 575,5 ms | 1 659,8 ms | 0 ms (0 Long Tasks) |

**Ziel:** Ableitung unter 150 ms – erreicht; keine Blockade über 50 ms – erreicht. Die Prüfung dauert weiter rund eine Sekunde, aber im Worker.

**Nachmessen (Mac):**

```sh
pnpm build
pnpm --filter @fundamento/eroj exec playwright test --config playwright.vitrino.config.ts -g "M5|G5"
# die Zeile „M5 (chromium): Ableitung median … längste Blockade …“ steht im stderr
```

Oder in der Vitrino selbst (`file://`, siehe Messanleitung in plan ③): in der Konsole `await fmWerkstatt.measure(50)` und `fmWerkstatt.state.worker`.


## ③ Prompt (Stufe 3)

**Branch:** `261020-spec-019-prompt-116ba2` (gestapelt auf ② `261020-spec-019-werkstatt-116ba2`) · **Datum:** 2026-10-20 · **Stand:** zur Abnahme.

### Zusammenfassung

1. **`propose_agordo`** (lesend, 20. Werkzeug): Agordo und Wunsch in Worten (`wunsch`, de/en) und/oder explizite Reglerwerte (`regler`: Pfad → Wert) → die neue Agordo, der Diff (vorher → nachher, mit deutschem Label), der Satz der Vorschlags-Leiste, die Kialo jedes Wortes, das gegriffen hat, die Regler am Ende ihres Bereichs, der Raporto kurz wie `preview_agordo` und ein **Werkstatt-Link** (`#agordo=` die Agordo vorher, `#vorschlag=` der Vorschlag). Kein Sprachmodell im Werkzeug (E3).
2. **Wunsch-Vokabular** als Datum `packages/agordilo/data/wuensche.json`: ruhiger/calmer, kräftiger/bolder, wärmer/warmer, kühler/cooler, runder/rounder, eckiger/sharper, luftiger/airier, kompakter/denser, größer/larger, kleiner/smaller – je Wort Reglerbewegungen mit Schritt, eine Kialo und das Gegenteil. Vage Wörter fehlen bewusst.
3. **Grenze:** Ein Wunsch, den das Vokabular nicht kennt, bewegt nichts; die Antwort fragt nach (`action: ask-human`) und nennt die bekannten Wörter.
4. **Leitplanke:** Bricht die ganze Bewegung eine feste Regel, die die Agordo vorher nicht brach, versucht das Werkzeug die Hälfte und das Viertel des Weges und hält bei der ersten an, die hält (`stopped`: Anteil, Regeln, Satz); sonst bewegt es nichts.
5. **`save_agordo`** (schreibend, 21. Werkzeug, `readOnlyHint: false`): ohne `confirm` die Antwort, was es schreiben würde, mit `confirm: true` die Datei. Nur im Arbeitsverzeichnis des Servers (auch nicht über einen Link hinaus), nur `*.json`, nie über eine Datei, die keine Agordo ist; feste Regeln sperren, anpassbare brauchen einen Jugxo. Nur über stdio, nicht über HTTP.
6. **`historio`** (W-26): ein Feld der Agordo im Modelo-Schema (`$defs/AgordoHistorio`: Datum, Wunsch oder „Hand“, Diff der Regler); jeder Speichervorgang hängt einen Eintrag an.
7. **Die vier Beispiel-Dialoge** der Spec als e2e-Tests (`packages/mcp/src/e2e/s019-prompt.test.ts`).
8. **Prompt `gvidanto`** Regeln 16 und 17; **Ontologio** Deziraro (Wunsch-Vokabular), Propono (Vorschlag), Historio im Schema `laboro` – Namen als Vorschlag (E7, O-1); **README** „Die Marke per Prompt formen“ und 21 Werkzeuge; **Vojmapo** Werkstatt Stufe 2+3 zur Abnahme.
9. **Kleinste Änderungen daneben:** Agordilo `wunsch.ts` (`parseWunsch`, `proponoOf`, `proposeAgordo`, `historioEintrag`, `partOfTheWay`), `readWuensche`; Modelo – Schema `AgordoHistorio`, `RULE_IDS` 162 → 163 (`agordo-save-refused`); MCP – `Served.workdir` (`LoadOptions.workdir`, Standard: das Arbeitsverzeichnis des Prozesses), `raportoShort` (gemeinsam mit `preview_agordo`).

### Entwurfsentscheidungen

#### D-01 Das Werkzeug rechnet, der Agent formuliert
`parseWunsch` zerlegt den Text in Wörter und sucht sie in den Listen `de` und `en`; jedes Wort zählt einmal, in der Reihenfolge des Wunsches. Eine Bewegung ist ein Schritt auf einem Regler (auf seinen Bereich begrenzt, drei Stellen) oder `leitfarbe.ton`: der Farbton der Leitfarbe so viele Grad zum warmen (60°) bzw. kühlen Pol (240°), nie darüber hinaus; die Leitfarbe steht danach als `oklch(L C H)`.

#### D-02 Unbekannt heißt: nachfragen
Bewegt der Wunsch nichts und nennt der Aufruf keine Reglerwerte, antwortet das Werkzeug mit `action: ask-human`, der Kialo und der Liste der bekannten Wörter, ohne abzuleiten. Wörter, die wie ein Komparativ aussehen („moderner“, „more modern“) und unbekannt sind, nennt es in `wish.unknown`.

#### D-03 Vor der Regel anhalten
`proposeAgordo` leitet ab und prüft. Neue feste Verstöße (gegenüber der Agordo vorher) → Hälfte, dann Viertel des Weges (`partOfTheWay`, Regler linear, Farbton auf dem kürzeren Bogen). Gemessen: „ruhiger“ von komunas Leitfarbe mit Kontrast 0 aus bricht bei −0,1 `contrast-reserve`; das Werkzeug geht die Hälfte (Kontrast −0,05, Sättigung 0,9, Schatten 0,85) in 4 s (drei Ableitungen).

#### D-04 Der Link
`file://`, der Pfad der Vitrino im Repo des Servers (`.fundamento/projekcioj/vitrino/index.html`, der Ausgabeordner von `pnpm fm projekcioj build --out .fundamento/projekcioj`) und das Fragment `#aspekto=komuna&modus=werkstatt&agordo=…&vorschlag=…`; die Teile deflate-raw, base64url wie in der Werkstatt (plan ② D-08). `vorschlag=` trägt `{ wunsch, agordo }`, den Diff rechnet die Werkstatt.

#### D-05 Schreiben nur, wo es sicher ist (E4)
Der Pfad wird gegen das Arbeitsverzeichnis aufgelöst und muss darin liegen; der nächste vorhandene Ordner und eine vorhandene Datei werden über `realpath` geprüft (kein Link hinaus). Eine vorhandene Datei muss eine Agordo sein; ihr Inhalt ist das „vorher“ des Diffs und ihre `historio` wird fortgesetzt. Über HTTP schreibt kein Client in das Verzeichnis des Servers.

#### D-06 Die Historie reist mit
`historio` steht in der Agordo und damit in `aspekto.json#/agordilo/agordo` jeder abgeleiteten Marke; der Diff der ersten Speicherung geht von der Struktur aus (alle Regler auf Standard). Datum: heute oder `datum` aus dem Aufruf (die Tests setzen es).

### Abweichungen von der Spec

1. **`stopped` statt „hält vor der Regel an“ in einem Schritt:** die Bewegung geht die Hälfte oder ein Viertel des Weges (D-03); feiner suchen hieße mehr Ableitungen je Aufruf.
2. **`save_agordo` nicht über HTTP** (D-05) – die Spec nennt den Transport nicht.
3. **`wärmer`/`kühler` drehen den Farbton** der Leitfarbe und tönen die Neutralen etwas stärker: es gibt keinen Regler für den Farbton; der Schritt ist ein Datum im Vokabular.
4. **Ausgabe auf Englisch** wie bei `preview_agordo`; die Labels der Regler und die Sätze der Vorschlags-Leiste deutsch (die Werkstatt zeigt sie).

### Befunde / Mankoj

- **B-1 „ruhiger“ und der Kontrastregler:** bei komunas Leitfarbe bricht schon `regler.kontrast` −0,1 `contrast-reserve` (−0,2: sechs feste Verstöße); „ruhiger“ hält darum bei Marken ohne eigenen Kontrast an. Zusammen mit plan ① B-1 Kandidat: die Bewegung „weniger Kontrastspreizung“ kleiner wählen oder den Kontrastregler enger fassen (O-3).
- **B-2 Dauer:** `propose_agordo` leitet ein- bis fünfmal ab (1,7–7 s); `save_agordo` einmal.
- **B-3 Der Link setzt den Build voraus:** die Datei `.fundamento/projekcioj/vitrino/index.html` entsteht mit `pnpm fm projekcioj build --out .fundamento/projekcioj`; die Antwort nennt den Pfad, ob er existiert oder nicht.
- **Mankoj:** keine neuen.

### Offen (für den Maintainer)

- **O-1 Namen (E7):** Deziraro (Wunsch-Vokabular), Propono (Vorschlag), Historio (Feld `historio`); im Code `wuensche.json`, `vorschlag=`, `historio`. **Vorschlag: bestätigen.**
- **O-2 Schritte des Vokabulars** (z. B. ruhiger: Sättigung −0,2, Kontrast −0,1, Schatten −0,3). **Vorschlag: so**, nach der Abnahme nachstimmen.
- **O-3 „ruhiger“ und Kontrast** (B-1). **Vorschlag:** Schritt auf −0,05 senken, sobald der Maintainer die Bereiche der Farbregler entscheidet (plan ① O-4).
- **O-4 `save_agordo` über HTTP** (Abweichung 2). **Vorschlag: so lassen.**

### Messanleitung (Abnahme 1–7)

Alle Befehle im Checkout des Maintainers `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds` (nach dem Merge von ① bis ③ und ④ auf `main`), nach `pnpm install` und `pnpm build`. **Links immer mit `file://`**, sonst liest macOS das Fragment als Teil des Dateinamens.

**1. Werkstatt (Abnahme 1).** Build der Vitrino:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm projekcioj build --out .fundamento/projekcioj
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#modus=werkstatt"
```

Mit `provo` vorbelegt (rund, luftig, bold), dann mit den Reglern „runder, luftiger“ weiter:

```sh
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#modus=werkstatt&aspekto=komuna&agordo=RY_BasMwEER_xUwvCSiOHZIcdOulUEhJD7mVHmRbtpfIkpFWDU7wvxe5lNx2ZnaXNw9YNWhIjN79OAi4m9UeEp9JZ6uWaiYmF4PIWAfOnDXTGgKGam1Duvx4vyStiVvlq-S8HKt9qwoI3GNQfF98C_kA2dZBwl1N3a-K_HDIirzcZbvdYY1ZwOrIXpm0yU7baDvIIt_PAl53JnE90GtjqLtq4pSVAldn2avwL4PSzNQtt2VezgKh7j21_EfQUBiNmtLYqoHMBIlXX_e0tH-2Or-dNmVeQiC46Otk9cxjkNttR9zHKq_dsD0PlqoYNpdp1NvnG68bCuypiqwqoyHZR51API0cIL9wUmzxPc8CrfNDovGqoRgS8zH1VXFxVRVY2WapcpgF6OqsS0Gnb1T3DInKmQbz_As"
```

Mit `provo-kompakta` vorbelegt (eckig, dicht, kleinere Schrift, light):

```sh
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#modus=werkstatt&aspekto=komuna&agordo=LY5RasMwEESvYqY_KSglFFxa3aCUQj56gbWysoRtbZBWDSXo7kVu_3bezCxzR6KNYXHN8i3HRbYrLUowkFviDItzN4aPf2M4-Og0apRazKBcdJC0_jzCYI2OU-m_Pt-_uuaonvLUycPJv0yjg0HiqplW2DtUONU0w56enpuBl7x1nOkSa9npaFBcIFVOXY_NIFPdUzQVpXTp-NUgCAfu91vbKzl67ak5C5e-6fjXjosk2Q2-RRcUFmucg6K1Xw"
```

Zu sehen: die Gruppen Farbe, Form, Raum, Schrift, Icons (zuklappbar), je Regler „Zurücksetzen“, Rückgängig/Wiederholen (⌘Z / ⇧⌘Z), alle Eroj folgen live, auch in der Gegenüberstellung; die Regler stocken nicht. In der Konsole: `fmWerkstatt.state.worker` (true) und `await fmWerkstatt.measure(50)` (M5).

**2. Prompt in Claude (Abnahme 2).** Den Server anbinden:

```sh
claude mcp add fundamento -- pnpm --dir /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds -s fm mcp
```

Dann sagen: „Mach provo ruhiger.“ (Agordo: `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json`). Erwartet: `propose_agordo` mit `wunsch: "ruhiger"`, Diff „Kontrast 0,1 → 0,0, Sättigung 1,1 → 0,9, Schatten 1,0 → 0,7“, kein fester Verstoß, der Link. Der Link öffnet die Werkstatt mit der Vorschlags-Leiste; „Übernehmen“ setzt die Bewegung. Derselbe Link, fertig:

```sh
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#aspekto=komuna&modus=werkstatt&agordo=RY_BasMwEER_xUwvCSiOHZIcdOulUEhJD7mVHmRbtpfIkpFWDU7wvxe5lNx2ZnaXNw9YNWhIjN79OAi4m9UeEp9JZ6uWaiYmF4PIWAfOnDXTGgKGam1Duvx4vyStiVvlq-S8HKt9qwoI3GNQfF98C_kA2dZBwl1N3a-K_HDIirzcZbvdYY1ZwOrIXpm0yU7baDvIIt_PAl53JnE90GtjqLtq4pSVAldn2avwL4PSzNQtt2VezgKh7j21_EfQUBiNmtLYqoHMBIlXX_e0tH-2Or-dNmVeQiC46Otk9cxjkNttR9zHKq_dsD0PlqoYNpdp1NvnG68bCuypiqwqoyHZR51API0cIL9wUmzxPc8CrfNDovGqoRgS8zH1VXFxVRVY2WapcpgF6OqsS0Gnb1T3DInKmQbz_As&vorschlag=RZFBa9wwEIX_inm9JKB47SWbUt16KQQS0kNupQfZlq1hZcmMRl02i_57kVvITe_pjeZ76IZLDml00ODsaLEMBbNEniL0DcGsFhobxz8RCvESLEPjZ9XN3UyjkFDMSTVikzQx-Os9FDyNNqQ6-fr8XrUlmQ0P1fnyNDzOpoPCR05GPnY_1GUU5giNePaju-va06np2v7YHI-nexSFYLOw8TUp0YYcFuiufSwKbBdfuW5w1ntazpak3vUK5xiETapSIRkrQsv_yW9FIY2OaZZ_-ydKmzfXepzNSv4Kje88Otq7f3Z6-_Hy0Lc9FFLMPFbLiWxJHw4LictDO8b18LYGGnJ6eL9u9vD5DNuJkjANWczgLbRwthWEaZME_QsvRgJ-l6IwR14rDZuJcoLu26cd2chO3LVfa3mT95AZkpgw1VR_Kgp0jmH_w8VeaHQCjSH6CaWUvw"
```

Weitere Dialoge: „Mach die Marke runder und luftiger.“ (zwei Bewegungen, ein Diff), „Mach die Marke moderner.“ (Rückfrage mit den bekannten Wörtern). Ohne Agent, direkt über die Werkzeugfunktion:

```sh
node --input-type=module -e 'const t = await import("/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/mcp/dist/tools.js"); const l = await import("/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/mcp/dist/load.js"); const a = JSON.parse((await import("node:fs")).readFileSync("/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json", "utf8")); const r = t.TOOLS.propose_agordo(l.loadServed(), { agordo: a, wunsch: "ruhiger" }); console.log(r.output.sentence); console.log(r.output.link.file);'
```

**3. Speichern (Abnahme 3).** „Speichere das als marken/provo-ruhig.json.“ – `save_agordo` ohne `confirm` zeigt Pfad, Inhalt und den `historio`-Eintrag und schreibt nichts; erst nach Bestätigung mit `confirm: true` liegt `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/marken/provo-ruhig.json` (Arbeitsverzeichnis des Servers: `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds` bei `pnpm --dir /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`) mit `historio`. Ein Pfad außerhalb (`../provo-ruhig.json`) wird abgelehnt (`agordo-save-refused`).

**4. CLI (Abnahme 4).** Beide Beispielmarken zweimal ableiten, vergleichen, prüfen:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
for marke in provo provo-kompakta; do
  pnpm fm agordilo derive packages/modelo/test/fixtures/valid/aspekto-$marke/agordo.json --out .fundamento/$marke-1
  pnpm fm agordilo derive packages/modelo/test/fixtures/valid/aspekto-$marke/agordo.json --out .fundamento/$marke-2
  diff -r .fundamento/$marke-1 .fundamento/$marke-2 && echo "$marke bytegleich"
  pnpm fm agordilo check .fundamento/$marke-1
  pnpm fm modelo validate --aspekto .fundamento/$marke-1
done
pnpm check:parity
pnpm check:alirebleco --aspekto .fundamento/provo-kompakta-1   # nach ④: ein eigenes Paket messen
pnpm --filter @fundamento/agordilo mezuroj m4                   # M4 (plan ①)
```

**5. Figma (Abnahme 5).** Eigene Konfiguration mit beiden Beispielmarken:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.provoj.config.json --out .fundamento/projekcioj-provoj
```

Dann in Figma: **Version der Testdatei vorher sichern** (Dateimenü → Version speichern), das Plugin aus `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-provoj/figma/` **neu importieren** (Plugins → Development → Import plugin from manifest) und laufen lassen; nach der Messung die gesicherte **Version wiederherstellen**. Siehe „In Figma zu messen“.

**6. M4 und M5 (Abnahme 6):** M4 in plan ①, M5 in plan ②.

**7. Nachlese 6 (Abnahme 7):** `open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#modus=ansehen"`, Abschnitt `kampo`: je Art eine Zeile `kind=…`; die Größen in `nachlese-6/plan.md`.

### In Figma zu messen

Grüne Tests sind für Figma keine Abnahme. Mit dem Plugin aus `.fundamento/projekcioj-provoj/figma/`:

1. Die Sammlung `aspekto` hat die Modi komuna, provo, provo-kompakta.
2. Modus provo auf einem Rahmen: `butono` mit größerem Radius (Radius `radius.medium` 6 px statt 4 px), mehr Abstand (`spacing.scale.400` 20 px), die Icons in Phosphor bold.
3. Modus provo-kompakta: Radius 1 px, Abstände kleiner (`spacing.scale.400` 12 px), Schrift kleiner (`font.size.scale.300` 14 px), Bedienelemente niedriger, Icons light.
4. Radius, Abstände, Schrift und Icon-Gewicht sind **gebunden** (Variablen der Sammlungen), nicht hart gesetzt: im Inspektor zeigt jedes Maß den Namen seiner Variable.
5. Ein zweiter Lauf schreibt nichts (Bericht ohne `updated`).


## ④ Nachlese 6

Eigener Branch von `main` (`261020-nachlese-6-116ba2`, PR #86; plan ① Abweichung 9); Plan und Aufgaben in [`nachlese-6/plan.md`](nachlese-6/plan.md) und [`nachlese-6/tasks.md`](nachlese-6/tasks.md), die mit #86 nach `main` kommen. Kurz: N6-1 `kampo` je `kind` in der Vitrino; N6-2 `check:alirebleco --aspekto <dir>`; N6-3 Vitrino (Build `core + ekzemplo`) 8,11 → 5,88 MB, Make Kit 2,38 → 1,56 MB – Kialo einmal statt je Kombination, Werkstatt-Bündel ohne zweite Kopie der Schemata, Make Kit nur als ES-Modul; N6-4 falsche Freunde der „-karten“-Komposita als Pins, kein Ausschluss. CI grün (Lauf 39346192486).
