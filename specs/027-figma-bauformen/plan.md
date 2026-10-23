# Spec 027 – Figma-Bauformen: Komponenten, mit denen man Screens bauen kann – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-22, unverändert kopiert; SHA-256 `dd52d5f9…795700d3b41`) · **Basis:** `main` nach #108 (`2e05a4f`) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Änderung an Tokens oder Werten**, kein Budget angehoben. Die Optik der Eroj bleibt bis auf die gewollten Änderungen der Tabelle (Bildvergleich unten).

**Branch:** `261023-spec-027-nach-usersthor-232ca8` (von `main` `2e05a4f`) · **Datum:** 2026-10-23 · **Stand:** gebaut, Abnahme in Figma offen.

### Zusammenfassung

Das Plugin heißt jetzt **„Fundamento Bauformen 0.2.0 (‹Build› · ‹Marken›): apply plan“**, ID `fundamento-bauformen-‹Hash›`. Es steht im Menü vor den bisherigen „Fundamento 0.2.0 (…)“ und hat eine eigene ID, damit Figma nicht den Code eines früher importierten Builds ausführt (F-13).

| # | Befund | Was jetzt gilt |
|---|---|---|
| B-1 | Dehnung | 26 Eroj mit „Größe aus dem Container“ (Uzo `layout.size`) haben eine feste Breite: die Breite, die sie vorher umschlossen. Ihre inneren Teile füllen (`STRETCH` je Bauform). Eine Instanz auf 400 gestellt füllt 400: Feld, Ring und Lücke 400, der `control` 400 minus der Reserve des Fokusrings. Icons, Indikatoren, Griffe, Stellvertreter, Liste und Kalender bleiben fest. Tabellenzeilen füllen, die erste Spalte nimmt den Rest. |
| B-2 | Werttexte ohne Füllung | Der Wert des `datelektilo` nimmt die Farbe des getippten Texts (`text.color`), die Zahl des `glitilo` die des komponierten `kampo`. Stellvertreter-Wörter (Auslöser von `menuo`, `konsileto`, `sxvebilo`, Kopieren des `kodbloko`) und die leere Zeile `no-results` nehmen die geerbte Textfarbe `color.text.default`. Ein Test prüft jede Text-Ebene jedes Sets. |
| B-3 | Hinweis und Fehler | BOOLEAN `help` (Standard an) und `error` (Standard aus) je Feld-Ero, 11 Sets. Im Zustand `invalid` steht der Fehler sichtbar und unverbunden (D-03). |
| B-4 | Ein Text je Komponente | Jeder Text ist eine TEXT-Eigenschaft, benannt nach seiner Ebene (`heading`, `message`, `items-1` …), bei Doppelnamen nach der Ebene darum (`option-1`, `action-1`), bei Werten je Achse (`text-single`, `text-range`), neben einem BOOLEAN gleichen Namens mit `-text` (`help-text`). Ein Limit gibt es bis 400 Eigenschaften nicht (M1); der Bericht zählt sie je Set. |
| B-5 | Umbruch | Texte, die im Code umbrechen, sind `FILL` + Höhe automatisch: `help`, `error`, `heading`, `message`, `details`, `content`, `paragraph` und weitere (Tabelle `STRETCH`). Im `plenstato` sind sie zentriert. |
| B-6 | Häkchen im `butono` | BOOLEAN `icon-start` und `icon-end`, Standard aus. Jeder Icon-Slot hält eine Instanz des `ikono` in der Größe des Ero, INSTANCE_SWAP `icon-start-ikono` / `icon-end-ikono` setzt ein anderes. Die Farbe des Ero bleibt beim Tausch (M4b, M10). Gilt für `butono`, `ligilo` (sein `external` schaltet `icon-end`) und `signeto`. |
| B-7 | `menuo` geschlossen | Der Auslöser ist mindestens `size.target.min` hoch und breit. Geschlossen ist die Instanz 24 statt 15 px hoch. |
| B-8 | Sxablonoj | Die 5 Sxablonoj sind Komponenten, ihre Regionen echte Figma-Slots (`createSlot`, M4c–M7) mit dem Beispiel der Vitrino als Inhalt. `sxelo` ist ein Set aus Breite (compact, medium, expanded) × Seitenleiste (true, false). Die Teile tragen die Tokens der Sxablono. |
| B-9 | Bearbeiten-Icon | `lokredaktilo` mit `editing=false` zeigt das Icon `edit` in `edit.size` hinter dem Text, in der Farbe des Texts. |

**Dauer des Plugin-Laufs** (im selben Double, Median aus fünf Läufen):

| Lauf | `main` | Spec 027 |
|---|---|---|
| erster Lauf | 0,50 s | 0,68 s (+0,18 s, +36 %) |
| mit vier Marken | 0,59 s | 0,78 s (+32 %) |
| zweiter Lauf | 0,36 s | 0,45 s, ohne Schreibzugriff |

Die Mehrarbeit des ersten Laufs:
- die Messung jeder dehnbaren Variante,
- 334 Instanzen des `ikono` in den Icon-Slots (`butono` 144, `signeto` 160, `ligilo` 30),
- 192 Eigenschaften mehr,
- die Slots.

Wie viel das in Figma kostet, misst nur Figma. Der Toast sagt die Dauer jetzt („Lauf in … s.“), der Bericht hat sie als `ms` (Messanleitung, Schritt 1). Wird der Lauf dort deutlich länger, ist O-5 der Hebel.

### Messungen in Figma

Gemessen am 2026-10-23 mit der Figma-Verbindung in der neuen leeren Datei **„Fundamento Spec 027 Messung“** (Entwürfe, Plan „Thorsten paid plan“, Datei `ErG5PAaxWHdoBYEm4HMPzD`), mit kleinen Skripten der Plugin-API. Das Plugin selbst (2,25 MB) lässt sich über die Verbindung nicht ausführen (Grenze 50 KB je Aufruf); die Abnahme mit dem Plugin steht in der Messanleitung.

| | Gemessen | Folge |
|---|---|---|
| M1 | 400 TEXT-Eigenschaften an einer Komponente, je mit verbundenem Text: kein Fehler, 3,7 s | B-4 ohne Kürzung; kein Manko |
| M2a | HUG-Spalte, ein Ring `FILL` um einen `control` HUG mit langem Text: Spalte 191 = Ring | Ein füllendes Kind zählt mit dem, was es selbst umschließt |
| M2b | Komponente fest 85, Kette `FILL`; Instanz auf 400: Ring 400, `control` 396 | Grundlage von B-1 |
| M2c | Text `FILL` + `HEIGHT` genau so breit wie sein Inhalt: eine Zeile | Kein Umbruch in Standardgröße |
| M3a | HUG-Zeile, Ring `FILL` neben festem Auslöser: Ring bleibt 93 | wie M2a, auch entlang der Zeile |
| M3b | HUG-Komponente, Ring **und** `control` `FILL`: Komponente schrumpft von 152 auf 85 (die Beschriftung) | Eine umschließende Wurzel mit ganzer füllender Kette geht nicht → die Wurzel ist fest (D-01) |
| M3c | HUG-Spalte, langer Text `FILL`: Spalte 30 (der kurze Text), der lange bricht auf 204 px Höhe um | Ein füllender Text zählt nicht mit |
| M4a | Sichtbarkeit an BOOLEAN gebunden, in einer Variante sichtbar gesetzt: der Standard der Eigenschaft wechselt, alle Varianten zeigen es | Eine Eigenschaft kennt keinen Wert je Variante (D-03) |
| M4b | INSTANCE_SWAP von `check` auf `close`, die Füllung der Ebene `mark` vorher überschrieben: bleibt rot | Größe und Farbe bleiben beim Tausch (D-06) |
| M4c | `createSlot()` an einer Komponente: Knoten `SLOT`, Eigenschaft `SLOT` mit dem Namen des Slots; in einer Instanz nimmt der Slot einen Text auf | Regionen als Slots (D-08) |
| M5 | Slots in zwei Varianten eines Sets: je eine eigene Eigenschaft gleichen Namens; Umbenennen folgt dem Slot | eine Eigenschaft je Region (D-08) |
| M6 | Den Slot der zweiten Variante auf die Eigenschaft der ersten zeigen, die doppelte löschen: geht | wie M5 |
| M7 | Slot in einem inneren Auto-Layout-Rahmen, `FILL` in der Zeile, Standardinhalt eine Instanz; in der Instanz der Komponente nimmt er einen eigenen Text auf | wie M4c |
| M8 | Zweiter Name einer Eigenschaft, gleich welcher Typ: Figma nummeriert still (`help` → `help2`, `icon-start` → `icon-start2`) | Namen D-04 |
| M9 | Instanz mit an eine Variable gebundener Breite, `resize(800)`: 800, die Bindung ist weg, die Fläche füllt | Dialog und Karte dehnen sich (D-02) |
| M10 | TEXT-Eigenschaft mit leerem Standard: geht, der leere Text hält 15 px. Füllung an der Ebene einer Icon-Instanz gebunden: bleibt nach dem Tausch | `no-results` (B-11), Farbe der Icons (D-06) |
| M11 | Breite und Höhe an einer **inneren Ebene** einer Instanz an eine Variable binden: kein Fehler, keine Bindung, die Größe bleibt; an der Instanz selbst geht es (M10) | Das Icon ist die Ikono-Variante in der Größe des Ero (D-06) |

Das Double (`test-doubles/plugin.ts`) folgt diesen Messungen jetzt:
- ein füllendes Kind zählt in einer umschließenden Mutter;
- eine Instanz hält die Ebenen ihrer Hauptkomponente und verliert beim Ändern der Größe ihre gebundene Breite;
- eine Ebene einer Instanz nimmt keine gebundene Größe an;
- Tausch, Slots und die Nummerierung der Namen sind abgebildet.

`plugin-double-messung-027.test.ts` stellt M2–M8 und M11 im Double nach. Weiterhin nicht abgebildet ist der Umbruch eines füllenden Texts (M3c): Das Double misst ihn auf einer Zeile.

### Entwurfsentscheidungen

#### D-01 Dehnung: feste Breite aus der eigenen Messung (B-1)
Eine Variante eines dehnbaren Ero ist `FIXED`, ihre Teile `FILL` (M3b). Die Breite ist die, die die Variante vorher umschloss. So sehen die Sets in Standardgröße aus wie vorher (Abnahme 3).

Das Plugin misst sie in `settle`:
- erst die Zeichnung in ihrer eigenen Form zurück (Teile umschließend oder in ihrer gefitteten Breite, umbrechende Texte auf einer Zeile),
- dann die Breite lesen,
- dann die gedehnte Form wieder schreiben.

Ein Stempel `breite` (Hash aus Build, Variablenwerten und Plan des Sets) sorgt dafür, dass nur ein geänderter Plan oder Build neu misst. Der zweite Lauf schreibt nichts (F21).

Die Zeichnungen sammeln ihre Werte wie bisher; `shape` setzt beim Schreiben die gedehnte Form. Was die Zeichnung aus Breiten rechnet, rechnet sie aus der gemessenen Breite nach `settle`: die Spur und den Anteil des `glitilo`, den Anteil des `mezurilo`, die Spalten des `tabelo`. Welche Teile füllen, steht je Bauform in `STRETCH`.

#### D-02 Gebundene Breite auf die Variante (B-1)
Die Fläche des `dialogo` war `size.container.*` breit, gebunden. Jetzt hält die Variante diese Bindung, die Fläche füllt. Eine Instanz, auf eine andere Breite gestellt, löst die Bindung und füllt (M9). Die Fläche der `karto` bekommt ihre Breite geschrieben, wie vorher; ihre Variante ist fest und wird gemessen.

#### D-03 `help` und `error` (B-3)
Figma bindet die Sichtbarkeit einer Ebene in allen Varianten gleich (M4a). Deshalb:
- Hinweis an allen Ebenen `help`: verbunden mit `help` (an).
- Fehler: verbunden mit `error` (aus), außer im Zustand `invalid`. Dort steht er sichtbar und unverbunden, wie im Code.

Im Panel einer `invalid`-Instanz schaltet `error` deshalb nichts. Die Zeilenprüfung des Berichts nimmt die höhere `invalid`-Variante hin, wenn ihre Breite der Zeile entspricht.

#### D-04 Namen der Text-Eigenschaften (B-4)
`connectTexts` verbindet jede Text-Ebene außerhalb von Instanzen. Namen:
- der Name der Ebene, also der Slot oder Teil, den die Zeichnung vergibt;
- ein Name, der in einer Variante doppelt steht: der Name der Ebene darum (`option-1`, `action-1`);
- ein Name, dessen Wörter je Variante verschieden sind: je Wert der Achse, die sie entscheidet (`text-single`, `text-range` im `datelektilo`), damit jede Variante ihre Wörter behält;
- ein Name, den eine andere Eigenschaft des Sets trägt (BOOLEAN `help`): mit `-text`, sonst nummerierte Figma ihn still (M8). So heißt schon der Text der Beschriftung des `tabelo` `label` und nicht `caption`.

Die `label`-Eigenschaft bleibt, wie sie ist, auch ohne Ebene (Name einer Navigation, Spec 011 ⑤). Der Bericht zählt die Eigenschaften je Set und Typ (`properties`).

#### D-05 Umbruch (B-5)
Umbrechende Texte sind `FILL` + `textAutoResize` `HEIGHT` (M2c: keine zweite Zeile in Standardgröße). Das gilt nur, wo die Mutter eine eigene Breite hat: in dehnbaren Eroj und in der festen Fläche des `sxvebilo`. In einem umschließenden Ero bräche ein füllender Text auf die Breite seiner Geschwister um (M3c).

#### D-06 Icon-Slots als Instanzen des `ikono` (B-6)
- Das Set `ikono` wird zuerst gezeichnet. Im Rahmen „Eroj“ und im Bericht steht es danach wieder an seinem Platz der Planreihenfolge.
- Ein Icon-Slot hält eine Instanz der neutralen Variante des Plan-Icons in der Größe des Ero (`size=small|medium|large`). Eine Größe an einer Ebene einer Instanz nimmt Figma nicht an (M11); die Ikono-Variante bringt sie mit ihrem eigenen Token. Der Rahmen des Slots trägt weiter `icon.size`.
- Die Farbe (`icon.color`, im `signeto` die Textfarbe) bindet das Plugin an den Vektoren der Instanz; ein Tausch behält sie (M4b, M10). Wer tauscht, wählt im Panel ein Ikono und seine Größe.
- Glyphen-Rahmen eines älteren Laufs weichen der Instanz.
- Der `butono` zeigt in beiden Slots das Icon der Vitrino (`check`), aus.
- Die Schalter kommen aus den Plan-`toggles` wie `dismissible`: `icon-start`, `icon-end`. Für den `ligilo` bleibt sein Prop `external` der Schalter.

#### D-07 Auslöser des `menuo` (B-7)
Der Stellvertreter des Auslösers bindet `minWidth` und `minHeight` an `size.target.min`. Er bleibt ein Stellvertreter mit seinem Wort; eine Instanz des `butono` wäre ein eigener Umbau (O-3).

#### D-08 Sxablonoj als Komponenten (B-8)
- Im Rahmen „Sxablonoj“ steht je Sxablono eine Komponente, die Zeilen und Spalten des Web als Rahmen (`header`, `head`, `footer` …), die Regionen als Slots. Je Region gibt es **eine** SLOT-Eigenschaft für alle Varianten (M5/M6).
- Der Inhalt eines Slots ist das Beispiel der Vitrino, wie bisher in den Beispielrahmen.
- Die Teile binden die Tokens der Sxablono (`sxablono/<name>/<teil>/…`): Abstand, Innenabstand, Fläche, die Trennlinie unter dem Kopf, eine Höchstbreite. Die Breite der Komponente ist `container.width`, wo das Skemo eines hat (`pagxo`, `redaktilo`); `formularo` und `filtrilo` umschließen.
- `sxelo` hat 6 Varianten. Die Breite ist der Container-Token des Viewports: compact `size.container.small`, medium `.medium`, expanded `.large`. Der Kopf steht unter 960 px (`size.container.medium`) als Spalte, wie die Container-Abfrage des Web. Mit Seitenleiste steht die Navigation als Spalte neben `notices` und `main` (Rahmen `body`, `content`), ohne Seitenleiste wie im Web darunter.
- Die alten Beispielrahmen eines früheren Laufs weichen den Komponenten. Hat das Werkzeug kein `createSlot`, wird eine Region ein Rahmen, und der Lauf sagt es.

#### D-09 Bearbeiten-Icon (B-9)
`iconsOf` gibt dem `lokredaktilo` in `editing=false` das Icon `edit`. `drawBadge` setzt seine Glyphen hinter den Text: Größe `edit.size`, Farbe `text.color` (das `currentColor` des Web). Die Freigabe `lokredaktilo:edit` in `FIGMA_NOT_DRAWN` entfällt.

#### D-10 Name, ID und Dauer
Name „Fundamento Bauformen …“, ID `fundamento-bauformen-‹FNV der Marken und Sprache›`. komuna allein: `fundamento-bauformen-9fbc49bc`; die vier Beispielmarken: `fundamento-bauformen-1c9fd908`. `applyPlan` misst seine Dauer: `ms` im Bericht, „Lauf in 12,3 s.“ im Toast.

#### D-11 Bildvergleich je Set im Double (Abnahme 3)
`test-doubles/bild.ts` macht aus jeder Variante ein Bild: jede malende Ebene mit Lage, Größe und dem, was sie malt. Eine Fläche, eine Linie, ein Effekt, ein Text mit seinen Wörtern und seiner Schrift zählen; eine einseitige Linie als Linie. Rahmen ohne Farbe zählen nicht, ebenso Texte ohne Wörter oder ohne Füllung.

Die Basis `bild-main.json` stammt vom Plugin von `main` (`2e05a4f`) im selben Double, als Hash je Variante. Vor dem Vergleich stehen `help`, `error` und das `icon-start` des `butono` wieder an, wie auf `main`. Gewollte Änderungen (`WANTED`) und Folgen von B-1/B-5 (`STRETCHED`) stehen mit Grund im Test.

### Abweichungen

1. **Bild statt Pixel (Abnahme 3):** Der Vergleich im Repo ist das Bild des Doubles, nicht Pixel aus Figma. Pixel aus Figma braucht einen Plugin-Lauf in Figma (Messanleitung, Schritt 3).
2. **`control` bei 400 (Abnahme 2):** Der `control` ist 400 minus der Reserve von Ring und Lücke (je 2 px je Seite in komuna). Beim `datelektilo` geht zusätzlich der Auslöser mit Abstand ab (48 px). Der Ring liegt im Ero, nicht außen (F17); sonst änderte sich die Lage im Raster.
3. **Folgen von B-1 in Standardgröße:** Wo ein Geschwister breiter war als die Eingabe, füllt die Eingabe jetzt das Feld, wie im Code.

   | Set | Varianten | Grund |
   |---|---|---|
   | `kampo` | 6 (`size=small`) | Beschriftung breiter als die Eingabe, +1,2 px im Double |
   | `alsxutilo` | 6 (`dropzone=false`) | Hinweis breiter als die Ablagefläche |
   | `kompletigilo` | 15 (aufgeklappt) | Liste 640 breit |
   | `listelektilo` | 6 (aufgeklappt) | Liste 640 breit |
   | `plurelektilo` | 6 (aufgeklappt) | Liste 640 breit |

   `plenstato` (2) malt dieselben Glyphen, zentriert in voller Breite; das Bild des Doubles notiert die Breite eines zentrierten Texts.
4. **Gewollt außerhalb der Tabelle der Spec: B-2 macht Unsichtbares sichtbar.** Ein Text ohne Füllung war in Figma unsichtbar:
   - der Wert des `datelektilo` (24 Varianten),
   - die Zahl des `glitilo` (12),
   - die Auslöser von `konsileto` (4), `sxvebilo` (1) und `menuo` (4, mit B-7).

   Die Spec nennt B-2, aber nicht in den Ausnahmen der Abnahme 3.
5. **Breite des `sxelo`:** Die Spec nennt die Breiten compact, medium, expanded, aber keine Werte. Genommen sind die drei Container-Tokens (D-08), keine neuen Werte.
6. **`formularo` und `filtrilo`** haben keine Breite im Skemo und umschließen ihren Inhalt; ihre Regionen dehnen sich deshalb nicht.

### Befunde / Mankoj

- **B-10 (Manko, O-1): Die feste Breite gilt in jedem Modus.** Die Breite einer dehnbaren Variante ist eine Zahl aus dem Grundmodus (komuna, light, default, medium). In einer Marke mit breiteren Maßen oder Schriften wächst die Variante nicht mit; ihr Inhalt kann über den Rand stehen. Das Double zeigt es mit 8-mal längeren Beschriftungen. Eine Form, die zugleich umschließt und füllt, gibt es in Figma nicht (M3b). Vorher wuchs jedes Set mit seiner Marke.
- **B-11:** Die leere Zeile `no-results` in `listelektilo` und `plurelektilo` hält 15 px am Ende der Liste. Ihr Skemo kennt keinen Text für keine Treffer. Sie bleibt, damit das Bild gleich bleibt, mit der geerbten Textfarbe; wegnehmen wäre eine Änderung der Optik (O-4).
- **B-12:** Der Anteil der Füllung von `glitilo` und `mezurilo` ist eine feste Zahl aus der Standardbreite. In einer breiteren Instanz bleiben Daumen und Füllung an ihrem Platz, die Spur wird länger.
- **B-13:** Die Seitenleiste des `sxelo` gibt es im Web nicht; die Spec verlangt sie. Figma zeigt sie als Spalte neben dem Inhalt, ohne eigene Tokens.
- **B-14:** Das Double rechnete bei jedem Lesen einer Größe oder Lage das ganze Dokument neu und suchte für jede Schriftbindung jede Variable einzeln. Mit `settle` (eine Messung je Variante) dauerte ein Lauf Minuten.
  - Jetzt rechnet es ab dem ersten Knoten aufwärts, der nicht füllt (eine Lage ab der Mutter), und sucht über den Index.
  - An der Semantik ändert das nichts; alle Suiten sind grün.
  - Ein Lauf des Plugins von `main` braucht im Double jetzt 0,5 statt 1,9 s.

### Offen (für den Maintainer)

- **O-1 Breite je Marke (B-10):** Je Set und Größe eine FLOAT-Variable in `aspekto` mit der gemessenen Breite je Modus, an die Varianten gebunden. Dann folgt die Breite der Marke wie vorher und das Ero füllt seine Instanz. Messbar erst in Figma, weil das Double nur den ersten Modus rechnet. Vorschlag: eigener kleiner Schritt nach der Abnahme.
- **O-2 Pixelvergleich in Figma:** Beide Plugins in je einer leeren Datei laufen lassen und die Sets als PNG exportieren (Messanleitung Schritt 3). Soll das ein Skript werden, das das neue Plugin selbst anbietet (Export je Set)?
- **O-3 Auslöser als `butono`-Instanz (B-7):** Die Auslöser von `menuo`, `sxvebilo` und `konsileto` sind Stellvertreter. Als Instanzen des `butono` low hätten sie dessen Look und Größe (Kandidat B-6 der Spec 011 ⑤).
- **O-4 `no-results` (B-11):** wegnehmen, wenn das Skemo keinen Text dafür hat?
- **O-5 Dauer in Figma:** Falls der erste Lauf in Figma deutlich länger dauert, sind die 334 Icon-Instanzen der Hebel. Sie könnten Glyphen-Rahmen bleiben, mit nur einem INSTANCE_SWAP-Platzhalter je Set. Bitte die Zahl aus dem Toast nennen.

### Messungen im Double und im Repo

Gemessen auf dieser Maschine (10 Kerne), beide Plugins im selben Double, je Median aus fünf Läufen und zweimal abwechselnd. Das Double ist dabei dreimal schneller geworden, für beide gleich (B-14). Vorher maß es `main` mit 1,7 s und Spec 027 mit 2,0 s.

| Was | `main` (`2e05a4f`) | Spec 027 |
|---|---|---|
| Plugin-Lauf, leere Datei (Repo-Plan, komuna) | 0,50 s | 0,68 s |
| Zweiter Lauf | 0,36 s, 0 Schreibzugriffe | 0,45 s, 0 Schreibzugriffe |
| Plugin-Lauf, vier Beispielmarken | 0,59 s | 0,78 s |
| `code.js` | 2 208 151 Bytes | 2 253 660 Bytes |
| Eigenschaften (Repo-Plan) | 46 an den 40 Sets | 238 an den 40 Sets und am Set `sxelo` (davon 5 SLOT) |
| Bildvergleich | – | 933 Varianten in 40 Sets: 841 gleich, 51 gewollt anders (B-2, B-7, B-9), 41 als Folge von B-1/B-5 (Abweichung 3) |
| `check:parity` | 40 / 0 Differenzen / 683 freigegeben | 40 / 0 Differenzen / 659 freigegeben (gezeichnet: der Wert des `datelektilo`, das Icon `edit`) |

In Figma selbst sagt der Toast die Dauer. Die Zahl aus der Abnahme bitte nennen; vom Plugin auf `main` gibt es dort keine Vergleichszahl.

### Messanleitung

Alle Befehle im Checkout des Maintainers, auf dem Branch dieses PR:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch && git switch 261023-spec-027-nach-usersthor-232ca8
pnpm install && pnpm build
pnpm fm projekcioj build --out .fundamento/projekcioj
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json --out .fundamento/projekcioj-cxiuj
```

Nach dem Merge dasselbe auf `main` (`git switch main && git pull`).

**1. Plugin in einer neuen leeren Datei (Abnahme 1, 4).**
1. In Figma eine **neue leere Datei** anlegen, zum Beispiel „Werkhof · Spec 027“.
2. Plugins → Development → Import plugin from manifest → `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/figma/plugin/manifest.json`.

   Es erscheint als **„Fundamento Bauformen 0.2.0 (… · komuna): apply plan“**, ID `fundamento-bauformen-9fbc49bc`, getrennt von den bisherigen „Fundamento 0.2.0 (…)“. Der Ordner: [file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/figma/plugin/](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/figma/plugin/).
3. „Plan anwenden“. Der Toast endet mit „**Lauf in … s.**“ – diese Zahl bitte notieren; sie steht auch als `ms` in der ersten Zeile des Berichts in der Konsole.
4. Ein zweites Mal „Plan anwenden“: keine Warnung, nichts neu.
5. Die vier Beispielmarken: Import aus `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/figma/plugin/manifest.json`, ID `fundamento-bauformen-1c9fd908`. In einer zweiten leeren Datei laufen lassen, ebenfalls die Dauer notieren.

**2. Bauformen prüfen (Abnahme 2), in der Datei aus Schritt 1.**
- **B-1:** Eine Instanz von `kampo` (`size=medium, state=rest`) auf die Seite ziehen und auf 400 Breite stellen. Feld, Rahmen und Eingabe gehen auf 400 mit, das Icon des `elektilo` steht am Ende. Dasselbe mit `avizo`, `tabelo` (erste Spalte nimmt den Rest) und `dialogo`.
- **B-2:** `datelektilo` zeigt „24.10.2026“, `glitilo` mit Feld die Zahl „40“, `menuo` „Weitere Aktionen“.
- **B-3:** Im Panel einer `kampo`-Instanz `help` und `error`; `error` ist aus, nur `state=invalid` zeigt „Fehler“.
- **B-4:** Im Panel des `menuo` die Texte `items-1` bis `items-3`, im `dialogo` `message`, `action-1`, `action-2`.
- **B-5:** Den Text `message` der `avizo`-Instanz lang machen: er bricht in der Fläche um.
- **B-6:** `butono` (`size=medium`): `icon-start` einschalten, unter `icon-start-ikono` ein anderes Ikono wählen, zum Beispiel `close` in `size=medium`; die Farbe bleibt die der Beschriftung.
- **B-7:** `menuo` mit `open` aus: die Instanz ist 24 px hoch, der Auslöser lesbar.
- **B-8:** Im Rahmen „Sxablonoj“ das Set `sxelo` mit 6 Varianten. Eine Instanz `width=expanded, sidebar=true` ziehen; in den Slot `main` eine Instanz `pagxo` legen und darin in `sections` eine `tabelo`.
- **B-9:** `lokredaktilo` mit `editing=false` zeigt das Stift-Icon.

Dann den Screen „Werkhof · Ausleihen“ bauen, nur mit Eigenschaften, Texten und Breite: `sxelo` → in `main` ein `pagxo` mit Titel, Aktionen und einer `tabelo`. Was dabei noch Handarbeit braucht, bitte mit Set und Schritt nennen.

**3. Pixelvergleich in Figma (Abnahme 3, O-2).** Für den Vergleich mit `main` in einer dritten leeren Datei das Plugin von `main` laufen lassen (`git switch main && pnpm build && pnpm fm projekcioj build --out .fundamento/projekcioj-main`, Import aus `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-main/figma/plugin/manifest.json`). Je Set mit Rechtsklick → Copy as PNG oder Export die beiden Bilder vergleichen. Erwartet sind nur die Unterschiede aus B-2, B-3, B-6, B-7, B-9 und aus Abweichung 3.

**Tests:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/projekcioj exec vitest run src/celoj/figma/plugin-bauformen-texte.test.ts src/celoj/figma/plugin-bauformen-dehnung.test.ts src/celoj/figma/plugin-bauformen-eigenschaften.test.ts src/celoj/figma/plugin-bauformen-sxablonoj.test.ts src/celoj/figma/plugin-bauformen-bild.test.ts src/celoj/figma/plugin-double-messung-027.test.ts
pnpm --filter @fundamento/projekcioj exec vitest run src/celoj/figma
pnpm check:parity
```

Die Spec: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/027-figma-bauformen/spec.md`; dieser Plan: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/027-figma-bauformen/plan.md`.
