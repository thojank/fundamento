# Spec 029 – Fonto Astryx – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-23, unverändert kopiert; SHA-256 `36ac8edf…bfd30a710a`) · **Regel 0** gilt. **Keine Budgets anheben.** Dieser Plan wächst je PR um einen Abschnitt: ②a jetzt, ①, ②b und ③ in ihren eigenen PRs.

## ②a Abgleichstabelle

**Basis:** `main` nach #109 (`d29a520`) · **Branch:** `261023-spec-029-2a-abgleich-826849` · **Datum:** 2026-10-23 · **Stand:** Vorschlag vollständig, Entscheidung beim Maintainer. **Nur plan und Daten, kein Umbau:** Kein Skemo, kein Token, keine Projekcio ist geändert.

### Zusammenfassung

1. **Daten:** [`abgleich.json`](abgleich.json) hält für jedes der 40 Eroj das Gegenstück in der Fonto mit Quellpfad und sechs Zeilen, eine je Aspekt:
   - Achsen und Werte
   - Größen
   - Zustände
   - Anatomie und Slots
   - Verhalten (Tastatur, ARIA)
   - Muster und Grenzen

   Jede Zeile hat einen Vorschlag – **übernehmen**, **anpassen** oder **behalten** – mit Begründung und ein leeres Feld `entscheidung` für den Maintainer. Die Tabellen unten zeigen dieselben Zeilen.
2. **Zahlen:** 240 Zeilen: 27 übernehmen, 72 anpassen, 141 behalten.

   | Aspekt | übernehmen | anpassen | behalten |
   |---|---|---|---|
   | Achsen und Werte | 0 | 30 | 10 |
   | Größen | 11 | 2 | 27 |
   | Zustände | 2 | 14 | 24 |
   | Anatomie und Slots | 9 | 19 | 12 |
   | Verhalten (Tastatur, ARIA) | 4 | 2 | 34 |
   | Muster und Grenzen | 1 | 5 | 34 |

   „Behalten“ heißt meist: Fundamento hat dasselbe schon, oder eine Regulo oder Grenze mit Kialo spricht dagegen (Amendment v2.4, Bedingung 5: Regeln haben Vorrang).
3. **Muster:** 14 Zeilen M-1 bis M-14 vor den Eroj, darunter die vier der Spec:
   - **M-1** Grund für deaktivierte Elemente: anpassen (Slot `disabled-reason`, das Element bleibt fokussierbar)
   - **M-2** Status-Modell der Felder: anpassen (`intent` mit Warnung und Erfolg, Ort `message-position`, kein Tooltip als Ort)
   - **M-3** Zweck-Achse des dialogo: übernehmen (`dismiss` mit `free`, `guarded`, `explicit`)
   - **M-4** Adaptive Darstellung: behalten, bis die Gattung Blatt (BottomSheet) mit Eroj-Runde 6 da ist
4. **Fehlende Gattungen:** 45 Gattungen der Fonto ohne Gegenstück:
   - 33 für Eroj-Runde 6, vorn die für den Nordstern wichtigen (Schrittanzeige, Seitenpanel, Blatt, Gruppe von Kontrollkästchen, Segmentschalter)
   - 5 für die Sxablonoj (Templates, später)
   - 6 sind kein Ero (Anordnung, Verhalten)
   - der Toast bleibt nach E6 eine Grenze
5. **Achsen:** Neue Achsen tragen Namen von Fundamento, nie den Bezeichner der Fonto: `corner`, `frame`, `months`, `readout`, `indicator-side`, `justify`, `spread`, `tone`, `rules`, `label-side`, `dismiss`, `message-position`. Wo Fundamento den Namen schon führt (`size`, `emphasis`, `intent`, `density`, `kind`, `summary`), bleibt er, auch an einem Ero, das die Achse neu bekommt; nur Werte und Anzahl richten sich nach der Fonto. Ein Test prüft beides.

### Fonto (gepinnt)

| | |
|---|---|
| Name | Astryx |
| Lizenz | MIT, Copyright (c) Meta Platforms, Inc. and affiliates. |
| Pakete | `@astryxdesign/core@0.7.4`, `@astryxdesign/theme-neutral@0.7.4` (theme-neutral verlangt core genau 0.7.4) |
| Integrity core | `sha512-zd/XfUw8OH8Dj65w6cPYamMXgb11P7oIgrlXgyBGaHXKJi3aedkU17Q+lERgv7YL3Bv4/UKPMqKL/QZkvoay1w==` |
| Integrity theme-neutral | `sha512-IoGRxRpcAWao4jNL+HsV0t3rlCWeV4EYrzP54iRRRXEzU21XxMdBt+B63y+n/84mBkzyB38vGK/BuYkRbVDBtw==` |
| Repo | `https://github.com/facebook/astryx`, Tag `v0.7.4` |
| Commit | `704757fd827c6fa00a71af80b06d5da99d155e45` |

Gelesen habe ich nur diese beiden Tarballs, geprüft gegen die Integrity der Registry, außerhalb des Repos. Aus `packages/core/src` in `@astryxdesign/core` kamen:
- je Komponente die Doku-Daten (`*.doc.mjs`): Props mit Typ und Standard, Anatomie, Hinweise zur Barrierefreiheit
- die Verträge (`*.spec.md`): Zustände, Tastatur, ARIA

theme-neutral brauchte ②a nicht; es ist die Quelle für ①. Kein anderes System und keine fremde Marke wurde gelesen.

Ins Repo kommen nur Namen von Komponenten und Props als Herkunft (Art. VII in der Fassung v2.4: Fonto-ID und Quellpfad). Keine Werte, keine Texte der Doku: Jede Begründung ist neu geschrieben. Ein Test prüft, dass `abgleich.json` keine Farbe und keine Länge enthält.

### Wie die Tabelle zu lesen ist

- **übernehmen:** Der Wert, die Achse oder das Verhalten der Fonto kommt so, wie er ist, unter unseren Namen.
- **anpassen:** Wir übernehmen den Kern, aber geändert: anderer Name, weniger Werte, ohne den Teil, der eine Regulo verletzt. Was genau, steht in der Begründung.
- **behalten:** Fundamento bleibt, wie es ist. Entweder deckt es die Fonto schon ab, oder eine Regulo oder Grenze mit Kialo spricht dagegen.
- Verweise wie „M-2“ zeigen auf die Muster-Zeilen. „Grenze … (ask-human)“ nennt eine Grenze der Uzo, über die bisher der Maintainer entscheidet. Einige Zeilen schlagen vor, eine solche Grenze zu entscheiden; sie sind in O-3 gesammelt.
- Die Namen der Fonto (`variant`, `isDisabled` …) stehen nur in der Spalte „Fonto“ und dienen als Herkunft.

### Muster

Die Muster der Spec stehen als eigene Zeilen vor den Eroj; die Zeilen der Eroj verweisen auf sie.

| ID | Muster | Eroj | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|---|
| M-1 | Grund für deaktivierte Elemente | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo`, `butono`, `faldilo`, `menuo`, `langetaro`, `konsileto` | „deaktiviert“ ohne Grund; der butono wird von der Tastatur übersprungen; Grenze tooltip-on-disabled (ask-human) | `disabledMessage` an 19 Feldern: Tooltip bei Hover und Fokus, das Element bleibt mit aria-disabled fokussierbar | **anpassen** | Wer nicht weiß, warum etwas gesperrt ist, bleibt stecken. Übernehmen als Text-Slot `disabled-reason` an jedem Ero mit `disabled`: Das Element bleibt fokussierbar (aria-disabled, aria-describedby), der Grund erscheint im konsileto. Ohne Grund bleibt es wie heute. Entscheidet die Grenze tooltip-on-disabled. |
| M-2 | Gemeinsames Status-Modell der Felder | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo` | Boolean `invalid` und Slot `error` unter dem Feld | Status mit 3 Arten (Fehler, Warnung, Erfolg) und Meldung; Ort der Meldung mit 3 Werten (am Feld, darunter, Tooltip); Fehler wird sofort, Warnung und Erfolg höflich angesagt | **anpassen** | Warnung und Erfolg fehlen uns. Übernehmen: Achse `intent` mit `neutral`, `success`, `warning`, `danger` an allen Feldern (Namen wie avizo und insigno); `invalid` bleibt als Kurzform für `danger`. Ort der Meldung mit eigenem Namen `message-position`: `joined` (am Feld) und `below`. Den Tooltip als Ort nicht: Die Meldung muss sichtbar sein (Reguloj error-not-color-only, error-says-what-to-do). |
| M-3 | Zweck-Achse des dialogo | `dialogo` | Der dialogo schließt mit Escape; ein Klick auf den Hintergrund ist nicht geregelt | Zweck mit 3 Werten: Info (Escape und Klick daneben schließen), Formular (nur Escape), Pflicht (nichts schließt nebenbei, Rolle alertdialog); dasselbe bei Seitenpanel und Blatt | **übernehmen** | Ein Formular verliert sonst Eingaben durch einen Klick daneben, und eine Pflichtfrage darf nicht verschwinden. Werte und Anzahl übernehmen, Namen nach unserem Vortaro: Achse `dismiss` mit `free`, `guarded`, `explicit`. `explicit` setzt die Rolle alertdialog. |
| M-4 | Adaptive Darstellung | `listelektilo`, `plurelektilo`, `datelektilo`, `menuo`, `sxvebilo`, `dialogo` | Aufklapplisten und Overlays sind auf jeder Breite verankert; die Dimensio viewport ändert nur Werte | Darstellung verankert, als Blatt von unten oder adaptiv (Blatt bei schmaler Breite und grobem Zeiger); Datum auch nativ | **behalten** | Das Blatt von unten (BottomSheet) ist eine eigene Gattung und kommt erst mit Eroj-Runde 6. Ohne sie gibt es nichts, wohin die Darstellung wechseln könnte. Vorschlag: in ②b nichts bauen und die Achse mit der Gattung einführen. |
| M-5 | Laden in Feldern | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo` | Laden nur am butono und am kompletigilo | `isLoading` an fast allen Feldern, mit Spinner und aria-busy | **übernehmen** | Ein Schalter, der speichert, oder ein Feld, das prüft, braucht einen sichtbaren Zustand. Boolean `loading` an allen Feldern, wie am butono. |
| M-6 | Löschen-Knopf im Feld | `kampo`, `elektilo`, `listelektilo`, `plurelektilo`, `datelektilo`, `kompletigilo` | Löschen nur im kampo der Art search und im plurelektilo | `hasClear` an Text, Zahl, Auswahl, Datum und Vorschlagsfeld; beim Zeitraum standardmäßig an | **übernehmen** | Einen Wert zu leeren, ist bei Auswahl und Datum sonst umständlich. Boolean `clearable`, mit dem Namen „{label} leeren“ für Hilfsmittel. |
| M-7 | Optional statt Pflicht markieren | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo` | Pflichtfelder sind markiert (Regulo required-marked) | Markierung „optional“ oder „Pflicht“, je nach Vorgabe des Formulars | **behalten** | Zwei Markierungen wären zwei Wege. Die Vorgabe je Formular gehört zur Sxablono formularo, also zu den Templates. |
| M-8 | Verborgene Beschriftung | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo` | Grenze no-visible-label (not-supported), Regulo field-label-visible | `isLabelHidden` an allen Feldern | **behalten** | Die Regulo gewinnt (Amendment v2.4, Bedingung 5): Ein Feld ohne sichtbare Beschriftung verliert, wer den Platzhalter überschreibt. |
| M-9 | Hilfe hinter einem Icon an der Beschriftung | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo` | Hilfe steht als ein Satz im Slot `help` (Regulo help-is-one-sentence) | `labelTooltip`: Info-Icon mit Tooltip an der Beschriftung | **behalten** | Was man zum Ausfüllen braucht, steht sichtbar da; ein Tooltip ist auf Touch schwer zu erreichen. |
| M-10 | Icon-Größe aus dem Zusammenhang | `ikono`, `butono`, `ligilo`, `signeto` | Die Größe des Icons ist im Skemo des Ero gebunden (Teil `icon`, `size` nach der Größe des Ero) | Ein Icon ohne Größe nimmt die Größe aus dem umgebenden Knopf oder Feld | **behalten** | Wir haben dasselbe Ergebnis über die Bindung im Skemo; sie ist maschinenlesbar und gilt in Figma ebenso. |
| M-11 | Tooltip als Prop an Steuerelementen | `butono`, `ligilo`, `avataro`, `konsileto` | Tooltips nur über den konsileto mit `for` | `tooltip` an Knopf, Link und Avatar | **behalten** | Ein Weg je Aufgabe (Art. XIII). Der konsileto trägt seine Regulo tooltip-text-short; ein Prop am Knopf wäre ein zweiter Ort. |
| M-12 | Erhebung als Prop | `butono`, `avizo`, `karto` | Erhebung gehört zur Fläche (Rollen der Grundlagen) | `elevation` mit 4 Stufen an Knopf, Banner und Karte | **behalten** | Die Stufen der Erhebung kommen mit ① in die Grundlagen. Ein Ero trägt sie über seine Fläche, nicht als Prop. |
| M-13 | Breite je Ero | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo`, `butono` | Breite und Abstand gehören dem Container (Regulo spacing-owned-by-container); `full-width` am butono | `width` an fast jeder Komponente | **behalten** | Die Regulo gewinnt. Breiten setzt der Container, in Figma die Instanz (Spec 027). |
| M-14 | Aktion, die selbst lädt | `butono`, `sxaltilo`, `markobutono` | Das Ero meldet ein Ereignis; `loading` setzt die Anwendung | Die Komponente zeigt „lädt“, solange die übergebene Aktion läuft | **behalten** | Das ist eine Frage der React-Projektion, nicht des Skemo. Die Web Components bleiben bei Ereignissen. |

### Abgleich je Ero

Je Ero sechs Zeilen: Achsen und Werte, Größen, Zustände, Anatomie und Slots, Verhalten (Tastatur, ARIA), Muster und Grenzen. Die Quelle steht unter dem Namen, relativ zu `packages/core` im Paket.

#### `alsxutilo` ↔ FileInput

Quelle: `src/FileInput/FileInput.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-alsxutilo-1 | Achsen und Werte | `accept`, `max-size`, `multiple`, `dropzone` (Boolean), `required`, `disabled`, `invalid`, `name` | `accept`, `maxSize`, `maxFiles`, `isMultiple`, `mode` (2 Werte: Feld oder Ablagefläche), `isLoading`, `status`, `disabledMessage` | **anpassen** | Die Höchstzahl der Dateien fehlt uns und wird als Zahl `max-files` übernommen. `dropzone` deckt die zwei Darstellungen der Fonto schon ab und bleibt Boolean. Status und Grund für „deaktiviert“ kommen aus den Mustern M-1 und M-2. |
| A-alsxutilo-2 | Größen | keine Größenachse | keine Größenachse, nur eine Breite | **behalten** | Beide Systeme kennen keine Größenstufen. Die Breite gehört dem Container (Regulo spacing-owned-by-container). |
| A-alsxutilo-3 | Zustände | rest, hover, focus, disabled, invalid, dragover | dazu Laden, Warnung und Erfolg | **anpassen** | Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. Beim Prüfen großer Dateien ist „lädt“ ein echter Zustand. |
| A-alsxutilo-4 | Anatomie und Slots | label, required-mark, dropzone, drop-hint, choose, help, error, file-list, file-name, file-size, remove | Beschriftung, Beschreibung, Ablagefläche, Upload-Icon, Platzhalter, Dateiname, Löschen, Spinner, Statusmeldung | **anpassen** | Das Upload-Icon in der Ablagefläche übernehmen; `upload` steht schon im Ikonaro. Die übrigen Teile decken sich, unsere Liste ist feiner. |
| A-alsxutilo-5 | Verhalten (Tastatur, ARIA) | Rolle button, Space und Enter, aria-required, aria-invalid, aria-disabled | natives Dateifeld mit Beschriftung, Ablagefläche per Tastatur bedienbar; deaktiviert mit Grund bleibt fokussierbar | **behalten** | Tastatur und Rollen sind gleichwertig. Nur der Grund für „deaktiviert“ ändert das Verhalten, und der steht als M-1 für alle Eroj. |
| A-alsxutilo-6 | Muster und Grenzen | Grenzen upload-progress und image-preview (ask-human), camera-capture (not-supported) | Prüfung von Typ, Größe und Anzahl mit Statusmeldung; kein Fortschritt, keine Bildvorschau | **behalten** | Die Fonto deckt Fortschritt und Vorschau auch nicht ab. Unsere Grenzen bleiben, bis der Maintainer sie entscheidet. Die Vorschau gehört zur fehlenden Gattung Thumbnail. |

#### `apartigilo` ↔ Divider

Quelle: `src/Divider/Divider.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-apartigilo-1 | Achsen und Werte | `orientation` horizontal \| vertical, `decorative` | `orientation`, `variant` mit 2 Stärken, `label`, `isFullBleed` | **anpassen** | Zwei Stärken der Linie sind sinnvoll, etwa zwischen Abschnitten und innerhalb einer Karte. Wir nennen die Achse nach unserem Vortaro `emphasis` mit `low` und `high`; die Werte richten sich nach der Anzahl der Fonto. |
| A-apartigilo-2 | Größen | keine Größe | keine Größe; `isFullBleed` hebt den Innenabstand des Containers auf | **behalten** | Ob eine Linie bis an den Rand geht, bestimmt der Container (Regulo spacing-owned-by-container), nicht das Ero. |
| A-apartigilo-3 | Zustände | rest | rest | **behalten** | Eine Linie hat keine Zustände, in beiden Systemen. |
| A-apartigilo-4 | Anatomie und Slots | line, box | Linie und optionale Beschriftung in der Mitte | **behalten** | Unsere Grenze labelled-line (ask-human) begründet: Eine Linie mit Wort ist eine Überschrift. Die Beschriftung bleibt offen, bis der Maintainer die Grenze entscheidet (O-3). |
| A-apartigilo-5 | Verhalten (Tastatur, ARIA) | Rolle separator, dekorativ ohne Rolle | separator mit aria-orientation, beschriftet über aria-labelledby | **behalten** | Die Semantik ist gleich. Eine Beschriftung käme nur mit der Grenze aus der Zeile davor. |
| A-apartigilo-6 | Muster und Grenzen | Abstand zwischen Geschwistern gehört dem Container | Linie trennt auch interaktive Bereiche in einem Layout | **behalten** | Die Fonto ergänzt kein Muster, das uns fehlt. Unsere Regel für Abstände bleibt. |

#### `atributlisto` ↔ MetadataList

Quelle: `src/MetadataList/MetadataList.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-atributlisto-1 | Achsen und Werte | `layout` columns \| stacked \| auto, `label` | `columns` (eine, mehrere oder Zahl), Beschriftung vorn oder oben, `orientation`, `maxNumOfItems`, `title` | **anpassen** | Unsere drei Werte von `layout` decken Beschriftung vorn, oben und automatisch ab. Neu übernehmen: die Höchstzahl sichtbarer Einträge als Zahl `max-entries` mit „mehr anzeigen“. Mehrspaltigkeit ist Sache des Containers. |
| A-atributlisto-2 | Größen | keine Größe | keine Größe; Breite der Beschriftung einstellbar | **behalten** | Die Breite der Beschriftung folgt dem Raster der Sxablonoj, nicht einem Prop des Ero. |
| A-atributlisto-3 | Zustände | rest | rest; aufgeklappt, wenn Einträge verborgen sind | **anpassen** | Mit `max-entries` kommt der Zustand „aufgeklappt“ hinzu, mit aria-expanded am Knopf. |
| A-atributlisto-4 | Anatomie und Slots | term, value, list, box; Slot entries | Titel, Beschriftung, Wert, Aufklapp-Knopf | **anpassen** | Den Titel als Slot `heading` und den Teil `more` übernehmen. Begriff und Wert decken sich. |
| A-atributlisto-5 | Verhalten (Tastatur, ARIA) | Rolle list, Name aus `label`, Text „keine Angabe“ für leere Werte | Beschreibungsliste ohne eigene Tastatur | **behalten** | Gleichwertig. Unser Leertext bleibt. |
| A-atributlisto-6 | Muster und Grenzen | Grenze nested (not-supported) | flache Liste | **behalten** | Die Fonto verschachtelt auch nicht; unsere Grenze bleibt mit ihrer Kialo. |

#### `avataro` ↔ Avatar

Quelle: `src/Avatar/Avatar.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-avataro-1 | Achsen und Werte | `name`, `picture`, `size` small \| medium \| large, `decorative` | Bild, Ersatzbild, Name, Alt-Text, 5 benannte Größen, Form mit 3 Werten (rund, abgerundet, eckig), Status, Tooltip, Link | **anpassen** | Die Form übernehmen, um Personen (rund) von Teams oder Dingen (eckig) zu unterscheiden. Name nach unserem Vortaro: Achse `corner` mit `round`, `soft`, `square`. Status, Tooltip und Link nicht (siehe Zeilen 4 und 6). |
| A-avataro-2 | Größen | 3 Stufen | 5 Stufen | **übernehmen** | Anzahl der Fonto: zwei Stufen mehr, für dichte Listen und Profilköpfe. Werte `x-small` bis `x-large`; jede Stufe bekommt Ero-Tokens für alle Marken. |
| A-avataro-3 | Zustände | rest | rest; als Link oder Knopf auch hover und focus | **behalten** | Ein Avatar, der etwas tut, ist bei uns ein ligilo oder butono mit Avatar darin. So bleibt eine Bedeutung je Ero. |
| A-avataro-4 | Anatomie und Slots | image, initials | Foto, Initialen, Standard-Icon, Statuspunkt | **anpassen** | Das Standard-Icon ohne Namen übernehmen; der Name des Icons kommt aus Phosphor (Spec: Ikonaro bleibt Phosphor). Der Statuspunkt bleibt unsere Grenze presence-dot (ask-human). |
| A-avataro-5 | Verhalten (Tastatur, ARIA) | Rolle img mit Namen, dekorativ aria-hidden | img mit Namen, ohne Namen dekorativ (presentation, aria-hidden) | **behalten** | Rolle und Name decken sich; ohne Namen ist das Bild in beiden Systemen Schmuck. |
| A-avataro-6 | Muster und Grenzen | Grenzen avatar-group und presence-dot (ask-human); konsileto zeigt den Namen | Tooltip mit dem Namen standardmäßig an | **behalten** | Ein Weg für Tooltips: der konsileto mit `for` (Art. XIII). Die Gruppe steht als fehlende Gattung AvatarGroup in der Liste. |

#### `avizo` ↔ Banner

Quelle: `src/Banner/Banner.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-avizo-1 | Achsen und Werte | `intent` info \| success \| warning \| danger, `dismissible` | `status` mit denselben 4 Bedeutungen, `isDismissable`, `container` (Karte oder Band), `elevation`, `collapsible`, `icon` | **anpassen** | Werte und Anzahl stimmen schon. Neu übernehmen: die Wahl zwischen Karte im Inhalt und Band über die ganze Breite oben auf der Seite, als Achse `frame` mit `card` und `band`. Elevation nicht (M-12). |
| A-avizo-2 | Größen | keine Größe | keine Größe | **behalten** | Eine Meldung nimmt die Breite ihres Ortes; Stufen bringen ihr nichts. |
| A-avizo-3 | Zustände | rest | rest; aufgeklappt oder zugeklappt bei langer Beschreibung | **behalten** | Lange Details stehen bei uns im Slot `details`, aufklappbar mit einem faldilo darin. Ein eigener Zustand wäre ein zweiter Weg. |
| A-avizo-4 | Anatomie und Slots | surface, icon, accent, heading, message, details, actions, dismiss | Rahmen, Statusfläche, Icon, Titel, Beschreibung, Aktion, Schließen, Inhaltsfläche | **behalten** | Die Teile decken sich; `accent` ist unsere farbige Kante. |
| A-avizo-5 | Verhalten (Tastatur, ARIA) | Rolle status für alle Werte | alert für Warnung und Fehler, status für Info und Erfolg | **übernehmen** | Warnungen und Fehler sollen sofort angesagt werden. Die Rolle folgt dem `intent`: warning und danger → alert. |
| A-avizo-6 | Muster und Grenzen | Grenzen toast (not-supported, E6) und stacked-notices (ask-human) | Banner bleibt stehen; Toast ist ein eigenes Ero der Fonto | **behalten** | Die Fonto bestätigt unsere Trennung: Was stehen bleibt, ist ein avizo. Der Toast bleibt nach E6 außen vor (siehe Liste der fehlenden Gattungen). |

#### `butono` ↔ Button, IconButton

Quelle: `src/Button/Button.doc.mjs`, `src/IconButton/IconButton.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-butono-1 | Achsen und Werte | `emphasis` high \| medium \| low, `intent` neutral \| danger, `type`, `full-width`, `loading`, `disabled`, `label` | `variant` mit 4 Werten (primär, sekundär, ghost, destruktiv), `elevation`, `isLoading`, `isIconOnly`, `width`, `tooltip`, `href` | **behalten** | Dieselben vier Erscheinungen haben wir auf zwei Achsen: high, medium, low und high mit danger (Art. II, v2.2, Jugxo zur Umbenennung). Elevation, Tooltip, Breite und Link nicht: M-11, M-12, M-13 und die Grenze navigation. |
| A-butono-2 | Größen | small \| medium \| large | 3 Stufen | **behalten** | Gleiche Anzahl; die Werte heißen wie bei uns. |
| A-butono-3 | Zustände | rest, hover, pressed, focus, disabled, loading | dieselben; Laden auf Wunsch unterbrechbar | **behalten** | Gleich. Ein unterbrechbares Laden ist Sache der Anwendung. |
| A-butono-4 | Anatomie und Slots | Slots label, icon-start, icon-end; Icon-Knopf über `label` | Icon, Beschriftung, Endinhalt (Icon oder Badge), Spinner; eigener IconButton | **anpassen** | Den Endinhalt erweitern: `icon-end` nimmt auch ein insigno auf, etwa einen Zähler. Der Icon-Knopf bleibt ein butono mit `label` (Regulo label-required), kein eigenes Ero. |
| A-butono-5 | Verhalten (Tastatur, ARIA) | Enter, Space; deaktiviert wird übersprungen; Laden mit aria-busy | Laden behält den Fokus; deaktiviert mit Tooltip bleibt fokussierbar (aria-disabled) | **anpassen** | Mit Grund für „deaktiviert“ bleibt der Knopf fokussierbar und sagt den Grund an (M-1). Ohne Grund bleibt es wie heute. |
| A-butono-6 | Muster und Grenzen | Grenzen navigation (use-instead ligilo), form-in-slot, multi-line-label; Reguloj one-primary-per-container, destructive-not-primary-color | Knopf mit `href`; höchstens eine primäre Aktion je Ansicht | **behalten** | Unsere Regulo link-navigates-button-acts trennt Ziel und Aktion; die Fonto rät dasselbe. Die Regel zur primären Aktion deckt sich. |

#### `datelektilo` ↔ DateInput, DateRangeInput, Calendar

Quelle: `src/DateInput/DateInput.doc.mjs`, `src/DateRangeInput/DateRangeInput.doc.mjs`, `src/Calendar/Calendar.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-datelektilo-1 | Achsen und Werte | `mode` single \| range, `value`, `value-start`, `value-end`, `min`, `max`, `disabled-dates`, `required`, `readonly`, `invalid`, `expanded` | zwei Komponenten; Zahl der Monate (1 oder 2), Wochenbeginn, Format, Vorauswahlen, Löschen, kürzeste und längste Spanne, Darstellung | **anpassen** | Übernehmen: die Zahl der sichtbaren Monate als Achse `months` mit `1` und `2` (entscheidet die Grenze multiple-months), die Spannen `min-span` und `max-span` für den Zeitraum und Löschen nach M-6. Wochenbeginn und Format kommen bei uns aus der Sprache. |
| A-datelektilo-2 | Größen | keine Größe | 3 Stufen | **übernehmen** | Ein Datumsfeld steht oft in einer Zeile mit kampo und elektilo und braucht deren Höhe. Achse `size` wie beim kampo. |
| A-datelektilo-3 | Zustände | rest, hover, focus, disabled, readonly, invalid | dazu Laden, Warnung, Erfolg | **anpassen** | Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-datelektilo-4 | Anatomie und Slots | label, required-mark, surface, border, text, trigger, calendar, month, prev, next, weekday, cell, day, selected, in-range, today, outside-day, help, error | dazu Löschen-Knopf, Leiste mit Vorauswahlen, Wochennummern auf Wunsch | **anpassen** | Den Löschen-Knopf übernehmen (M-6). Vorauswahlen bleiben die Grenze presets (ask-human), Wochennummern nicht. |
| A-datelektilo-5 | Verhalten (Tastatur, ARIA) | Pfeile, PageUp/PageDown, Home/End, Enter, Escape (Raster nach APG) | dieselbe Tastatur; auf Touch der native Picker | **behalten** | Die Tastatur ist gleich. Der native Picker auf Touch ist adaptive Darstellung und steht unter M-4. |
| A-datelektilo-6 | Muster und Grenzen | Grenze time-of-day (use-instead kampo time) | eigene Komponenten für Uhrzeit und für Datum mit Uhrzeit | **behalten** | Die Uhrzeit hat der kampo seit Spec 025. Datum mit Uhrzeit steht als DateTimeInput in der Liste der fehlenden Gattungen. |

#### `dialogo` ↔ Dialog, AlertDialog

Quelle: `src/Dialog/Dialog.doc.mjs`, `src/AlertDialog/AlertDialog.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-dialogo-1 | Achsen und Werte | `open`, `size` small \| medium, `reason` none \| optional \| required | `variant` (normal, Vollbild), `purpose` mit 3 Werten, Breite, Höhe; eigener AlertDialog | **anpassen** | Die Zweck-Achse übernehmen wir nach M-3. `reason` (Begründungsfeld) bleibt unser eigenes Muster. Das Vollbild wird ein Wert von `size` (nächste Zeile). |
| A-dialogo-2 | Größen | small \| medium | freie Breite und Vollbild | **anpassen** | Einen dritten Wert `full` für lange Formulare und für die schmale Bildschirmbreite übernehmen. Freie Breiten nicht: Die Stufen kommen aus den Container-Tokens. |
| A-dialogo-3 | Zustände | rest | rest | **behalten** | Ein Dialog hat keine eigenen Zustände; Laden zeigt sein Inhalt. |
| A-dialogo-4 | Anatomie und Slots | backdrop, surface, border, heading, message, reason, content, actions | Kopf, Inhalt, Fuß, Hintergrund | **behalten** | Die Teile decken sich; unsere sind feiner und tragen das Begründungsfeld. |
| A-dialogo-5 | Verhalten (Tastatur, ARIA) | Rolle dialog, Escape, Enter | dialog, bei Pflicht alertdialog; Fokus bleibt im Dialog; Escape nach Zweck | **anpassen** | Die Rolle alertdialog und das Verhalten von Escape folgen der Zweck-Achse aus M-3. |
| A-dialogo-6 | Muster und Grenzen | Grenzen drawer (ask-human), nested-dialog (not-supported); Regulo dialog-title-names-the-decision | Seitenpanel und Blatt von unten als eigene Komponenten | **behalten** | Unsere Grenzen bleiben. Drawer und BottomSheet stehen in der Liste der fehlenden Gattungen. |

#### `elektilo` ↔ Selector

Quelle: `src/Selector/Selector.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-elektilo-1 | Achsen und Werte | `value`, `placeholder`, `required`, `invalid`, `size`, `disabled`, `name`, `empty-label` | dazu Nur-Lesen, Suche, Löschen, `variant` (Feld, sekundär, ghost), Darstellung, Start-Icon, Laden | **anpassen** | `readonly` übernehmen; es fehlt nur hier unter den Feldern. Suche bleibt beim listelektilo und kompletigilo, Löschen nach M-6. Den Knopf-Look nicht: Ein Auswahlfeld, das wie ein Knopf aussieht, ist ein menuo. |
| A-elektilo-2 | Größen | small \| medium \| large | 3 Stufen | **behalten** | Drei Stufen in beiden Systemen; die Werte heißen wie bei uns. |
| A-elektilo-3 | Zustände | rest, hover, focus, disabled, invalid | dazu Nur-Lesen, Laden, Warnung, Erfolg | **anpassen** | Nur-Lesen (Zeile 1). Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-elektilo-4 | Anatomie und Slots | label, required-mark, surface, border, text, placeholder, indicator, help, error | dazu Start-Icon, Löschen, Status-Icon, Suchzeile, Abschnittsüberschrift, Leerzustand | **anpassen** | Abschnittsüberschriften für Optionsgruppen übernehmen; das entscheidet die Grenze grouped-options (ask-human). Das Start-Icon nicht, wie beim kampo (icon-in-field). |
| A-elektilo-5 | Verhalten (Tastatur, ARIA) | combobox, Pfeile, Enter, Escape | dazu Home/End und Tippen springt zur passenden Option, wie beim nativen Auswahlfeld; nur lesbar bleibt fokussierbar | **übernehmen** | Home/End und Springen per Tippen erwartet jeder vom nativen Auswahlfeld. Kein Widerspruch zu einer Regulo. |
| A-elektilo-6 | Muster und Grenzen | Grenze custom-popup (use-instead listelektilo) | eine Komponente für beides | **behalten** | Wir trennen das native Auswahlfeld (elektilo) vom gestalteten (listelektilo). Die Trennung hält die Uzo eindeutig. |

#### `elekto` ↔ RadioList

Quelle: `src/RadioList/RadioList.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-elekto-1 | Achsen und Werte | `value`, `required`, `invalid`, `size`, `disabled`, `name`, `orientation` | dieselben, dazu `disabledMessage`, `status`, `isOptional` | **behalten** | Die Achsen decken sich; Grund und Status kommen aus M-1 und M-2. |
| A-elekto-2 | Größen | small \| medium \| large | 2 Stufen | **übernehmen** | Anzahl der Fonto: zwei Stufen. `large` entfällt; für Bestehendes gilt ein Übergang (O-2). |
| A-elekto-3 | Zustände | rest, hover, focus, disabled, invalid | dazu Warnung und Erfolg | **anpassen** | Warnung und Erfolg kommen aus dem Status-Modell M-2. |
| A-elekto-4 | Anatomie und Slots | label, option-label, required-mark, help, error, indicator, options | Kopf, Optionen, je Option Beschriftung und Beschreibung | **übernehmen** | Eine Beschreibung je Option übernehmen (Teil `option-description`), etwa für Tarife oder Lieferarten. |
| A-elekto-5 | Verhalten (Tastatur, ARIA) | radiogroup, Pfeile, Space | dasselbe Muster (APG) | **behalten** | Beide folgen dem Muster radiogroup nach APG: Pfeile wählen, Space bestätigt. |
| A-elekto-6 | Muster und Grenzen | Regulo elekto-options-few (höchstens 5); Grenze single-option (not-supported) | für kleine Mengen, alle Optionen sichtbar | **behalten** | Die Fonto rät dasselbe. Unsere Regulo bleibt. |

#### `faldilo` ↔ Collapsible

Quelle: `src/Collapsible/Collapsible.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-faldilo-1 | Achsen und Werte | `open`, `group` | offen, deaktiviert, Seite des Pfeils (Anfang oder Ende), Gruppe | **anpassen** | Die Seite des Pfeils übernehmen, unter eigenem Namen: Achse `indicator-side` mit `start` und `end`. Deaktiviert ebenfalls übernehmen (nächste Zeilen). |
| A-faldilo-2 | Größen | keine Größe | keine Größe | **behalten** | Ein Aufklappbereich nimmt die Breite seines Ortes; Stufen bringen ihm nichts. |
| A-faldilo-3 | Zustände | rest, hover, focus | dazu deaktiviert | **übernehmen** | Ein Abschnitt, der gerade nicht aufgehen darf, braucht „deaktiviert“ mit Grund (M-1). |
| A-faldilo-4 | Anatomie und Slots | summary, indicator, content | Container, Auslöser, Pfeil, Inhalt, Gruppen-Container | **behalten** | Gleich; die Gruppe ist bei uns das Prop `group`. |
| A-faldilo-5 | Verhalten (Tastatur, ARIA) | Rolle group, aria-expanded, Enter und Space | Knopf mit aria-expanded und aria-controls | **behalten** | Beide zeigen den Zustand mit aria-expanded am Auslöser; Enter und Space schalten. |
| A-faldilo-6 | Muster und Grenzen | Grenze nested-disclosure (ask-human) | Gruppe, in der immer nur einer offen ist | **behalten** | `group` deckt das schon. Die Grenze bleibt. |

#### `glitilo` ↔ Slider

Quelle: `src/Slider/Slider.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-glitilo-1 | Achsen und Werte | `min`, `max`, `step`, `value`, `range`, `field` (Boolean), `required`, `disabled`, `readonly`, `invalid` | dazu Ausrichtung, Wertanzeige mit 3 Werten (Tooltip, Text, keine), Markierungen, Mindestabstand der Griffe, Format | **anpassen** | Die Wertanzeige mit drei Werten übernehmen und `field` darin aufgehen lassen, unter eigenem Namen: `readout` mit `none`, `text`, `field`. Den Tooltip nicht: Er verdeckt den Wert beim Ziehen auf Touch, das Eingabefeld leistet mehr. Mindestabstand im Bereich übernehmen. |
| A-glitilo-2 | Größen | keine Größe | keine Größe | **behalten** | Spur und Griff haben feste Maße aus den Tokens; eine Größenachse fehlt in beiden. |
| A-glitilo-3 | Zustände | rest, hover, focus, pressed, disabled, invalid | dazu Warnung und Erfolg | **anpassen** | Warnung und Erfolg kommen aus dem Status-Modell M-2. |
| A-glitilo-4 | Anatomie und Slots | label, required-mark, track, fill, thumb, number, min-label, max-label, help, error | dazu Markierungen, Beschriftung der Markierungen, Tooltip des Werts | **anpassen** | Markierungen ohne Beschriftung übernehmen (Teil `tick`). Beschriftete Markierungen bleiben die Grenze ticks-with-labels (ask-human). |
| A-glitilo-5 | Verhalten (Tastatur, ARIA) | slider, Pfeile, PageUp/PageDown, Home/End | dasselbe Muster (APG), Wert als Text über das Format | **behalten** | Beide folgen dem Muster slider nach APG, mit dem Wert als Text für Hilfsmittel. |
| A-glitilo-6 | Muster und Grenzen | Grenze vertical-track (ask-human); Regulo range-stated | senkrechte Ausrichtung | **behalten** | Die Grenze bleibt, bis der Maintainer sie entscheidet; die Regulo range-stated gilt weiter. |

#### `ikono` ↔ Icon

Quelle: `src/Icon/Icon.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-ikono-1 | Achsen und Werte | `name` (21), `size`, `intent` neutral \| info \| success \| warning \| danger, `label` | Icon, Farbe mit 9 Werten (Texthierarchie, Akzent, Status, erben), Größe, Beschriftung | **behalten** | Die Statusfarben haben wir als `intent`. Die Farben der Texthierarchie bekommt ein Icon, indem es die Farbe seines Textes erbt, wie im butono. Ein zweiter Weg wäre doppelt. |
| A-ikono-2 | Größen | small \| medium \| large | 4 Stufen | **übernehmen** | Anzahl der Fonto: die kleine Stufe `x-small` für Status-Icons im Feld (M-2) und dichte Tabellen. |
| A-ikono-3 | Zustände | rest | rest | **behalten** | Ein Icon hat keine Zustände; die Farbe kommt aus dem Ero, das es trägt. |
| A-ikono-4 | Anatomie und Slots | glyph | Glyphe | **behalten** | Ein Icon ist in beiden Systemen nur seine Glyphe. |
| A-ikono-5 | Verhalten (Tastatur, ARIA) | Rolle img mit Namen; ohne Namen dekorativ | dasselbe | **behalten** | Mit Namen ein Bild, ohne Namen Schmuck: in beiden Systemen dieselbe Regel. |
| A-ikono-6 | Muster und Grenzen | Ikonaro aus Phosphor | eigene Icons je Theme | **behalten** | Die Spec schließt das Icon-Set der Fonto aus; das Ikonaro bleibt Phosphor. |

#### `insigno` ↔ Badge, StatusDot

Quelle: `src/Badge/Badge.doc.mjs`, `src/StatusDot/StatusDot.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-insigno-1 | Achsen und Werte | `intent` neutral \| info \| success \| warning \| danger, `size` small \| medium | 5 Statuswerte und 9 Farbtöne für Kategorien, Icon | **behalten** | Die 5 Statuswerte decken sich. Die Farbtöne für Kategorien gehören zum signeto (Grenze tinted-categories), sonst verwischt der Unterschied, den die Spec in ②b verlangt. |
| A-insigno-2 | Größen | small \| medium | keine Größe | **behalten** | Zwei Stufen braucht die dichte Tabelle; eine Stufe zu streichen, bringt keinen Gewinn. |
| A-insigno-3 | Zustände | rest | rest | **behalten** | Ein Statusetikett ist nicht interaktiv und hat keine Zustände. |
| A-insigno-4 | Anatomie und Slots | surface, border, text; Slots label, description | Icon und Beschriftung | **übernehmen** | Einen Slot `icon-start` übernehmen: Status mit Icon und Text ist nicht nur Farbe. |
| A-insigno-5 | Verhalten (Tastatur, ARIA) | ohne Rolle, Name aus der Beschriftung | ohne Rolle | **behalten** | Das Etikett ist Text in seinem Zusammenhang; eine eigene Rolle braucht es nicht. |
| A-insigno-6 | Muster und Grenzen | Grenzen dot-only (not-supported), brand-badge (ask-human), removable-chip (use-instead signeto) | Statuspunkt mit Text als eigene Komponente | **behalten** | Ein Punkt ohne Text verletzt unsere Grenze dot-only. Mit Text ist er ein insigno; der Punkt wäre ein Wert der Form, kein neues Ero. |

#### `kampo` ↔ TextInput, NumberInput, TimeInput, Field, FieldStatus

Quelle: `src/TextInput/TextInput.doc.mjs`, `src/NumberInput/NumberInput.doc.mjs`, `src/TimeInput/TimeInput.doc.mjs`, `src/Field/Field.doc.mjs`, `src/FieldStatus/FieldStatus.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-kampo-1 | Achsen und Werte | `kind` (9 Arten), `value`, `placeholder`, `required`, `disabled`, `readonly`, `invalid`, `size`, `name`, `min`, `max`, `autocomplete`, `stepper`, `step` | eigene Komponenten für Text, Zahl, Uhrzeit; Löschen, Start-Icon, Laden, Einheit, nur ganze Zahlen, Format | **anpassen** | Übernehmen: Löschen für alle Arten außer password (M-6) und die Einheit als Text `unit` für Zahlen. Eine Komponente mit `kind` bleibt. |
| A-kampo-2 | Größen | small \| medium \| large | 3 Stufen | **behalten** | Drei Stufen in beiden Systemen; die Werte heißen wie bei uns. |
| A-kampo-3 | Zustände | rest, hover, focus, disabled, readonly, invalid | dazu Laden, Warnung, Erfolg | **anpassen** | Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-kampo-4 | Anatomie und Slots | label, required-mark, surface, border, text, placeholder, help, error, decrement, increment, clear | dazu Start-Icon, Spinner, Status-Icon, Einheit | **anpassen** | Das Status-Icon im Feld übernehmen: Ein Fehler ist dann nicht nur Farbe (Regulo error-not-color-only). Teil `unit` für die Einheit. Das Start-Icon bleibt die Grenze icon-in-field. |
| A-kampo-5 | Verhalten (Tastatur, ARIA) | textbox, Enter, Pfeile bei Zahlen, Escape leert die Suche | dasselbe; das Mausrad ändert Zahlen | **behalten** | Das Mausrad ändert keinen Wert: Beim Scrollen der Seite ändert sich sonst unbemerkt eine Zahl. |
| A-kampo-6 | Muster und Grenzen | Grenzen reveal-password, time-zone (ask-human), decimal, icon-in-field, no-visible-label (not-supported) | Info-Icon an der Beschriftung, verborgene Beschriftung | **behalten** | Hilfe steht als Satz im Slot `help` (Regulo help-is-one-sentence), nicht hinter einem Icon (M-9). Die verborgene Beschriftung verbietet field-label-visible (M-8). |

#### `karto` ↔ Card

Quelle: `src/Card/Card.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-karto-1 | Achsen und Werte | `level`, `orientation`, `standalone` | `variant` mit 3 Flächen und 10 Farbtönen, `elevation`, Innenabstand, Breite und Höhe | **anpassen** | Die drei Flächen übernehmen (normal, gedämpft, ohne Fläche), unter eigenem Namen: Achse `tone` mit `default`, `muted`, `none`. Farbtöne, Elevation und Innenabstand nicht (M-12, Dichte-Dimensio). |
| A-karto-2 | Größen | keine Größe | Innenabstand in Stufen | **behalten** | Den Innenabstand regelt die Dimensio density für alle Marken; ein Prop je Karte wäre ein zweiter Weg. |
| A-karto-3 | Zustände | rest | rest | **behalten** | Gleich; die anklickbare Karte ist eine eigene Gattung. |
| A-karto-4 | Anatomie und Slots | Slots heading, media, content, meta, actions | Container und Inhalt | **behalten** | Unsere Slots sind feiner und tragen die Uzo. |
| A-karto-5 | Verhalten (Tastatur, ARIA) | Rolle article, Name aus der Überschrift | Container ohne Rolle | **behalten** | Unsere Semantik ist genauer. |
| A-karto-6 | Muster und Grenzen | Grenzen clickable-card und card-grid (ask-human) | anklickbare und wählbare Karte als eigene Komponenten | **behalten** | Unsere Grenzen bleiben. ClickableCard und SelectableCard stehen in der Liste der fehlenden Gattungen. |

#### `kodbloko` ↔ CodeBlock

Quelle: `src/CodeBlock/CodeBlock.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-kodbloko-1 | Achsen und Werte | `copyable` | Sprache, Titel, Sprachbeschriftung, Zeilennummern, hervorgehobene Zeilen, Diff, Umbruch, Höhe, Größe, Rahmen, Einklappen | **anpassen** | Übernehmen: Zeilennummern (`line-numbers`), Umbruch (`wrap`) und die Sprache als Text für die Beschriftung. Diff bleibt die Grenze diff (ask-human). Syntaxfarben kommen mit ① (Spec ①, Punkt 2). |
| A-kodbloko-2 | Größen | keine Größe | 2 Stufen | **behalten** | Die Größe folgt der Schriftrolle für Code; die Dichte-Dimensio passt sie an. |
| A-kodbloko-3 | Zustände | rest, focus (Scrollbereich) | dazu eingeklappt ab einer Zeilenzahl | **behalten** | Lange Blöcke lassen sich mit einem faldilo einklappen; ein eigener Zustand wäre ein zweiter Weg. |
| A-kodbloko-4 | Anatomie und Slots | surface, text, legend, scroll-ring, announce; Slots label, caption | Kopfleiste, Titel, Zeilennummern, Code, hervorgehobene Zeilen, Kopieren | **anpassen** | Die Teile `line-number` und `highlight` übernehmen. |
| A-kodbloko-5 | Verhalten (Tastatur, ARIA) | Rolle figure, „Kopiert“ wird angesagt | Kopieren wird angesagt | **behalten** | Beide sagen das Kopieren an; die Rolle figure mit Legende ist bei uns genauer. |
| A-kodbloko-6 | Muster und Grenzen | Grenzen diff (ask-human), syntax-highlighting (not-supported) | Diff und Syntaxfarben | **anpassen** | Die Grenze syntax-highlighting entfällt mit den Syntaxfarben aus ①. Diff bleibt offen für den Maintainer. |

#### `kompletigilo` ↔ Typeahead

Quelle: `src/Typeahead/Typeahead.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-kompletigilo-1 | Achsen und Werte | `value`, `placeholder`, `required`, `invalid`, `size`, `disabled`, `name`, `allow-free`, `min-chars`, `expanded`, `loading` | dazu höchste Zahl der Vorschläge, Einträge beim Fokus, Löschen (an), Verzögerung, Start-Icon | **anpassen** | Übernehmen: `max-suggestions` als Zahl und Löschen nach M-6. Die Verzögerung ist Sache der Anwendung. |
| A-kompletigilo-2 | Größen | small \| medium \| large | 3 Stufen | **behalten** | Drei Stufen in beiden Systemen; die Werte heißen wie bei uns. |
| A-kompletigilo-3 | Zustände | rest, hover, focus, disabled, invalid (dazu `loading`) | dazu Warnung und Erfolg | **anpassen** | Warnung und Erfolg kommen aus dem Status-Modell M-2; Laden haben wir schon. |
| A-kompletigilo-4 | Anatomie und Slots | listbox, suggestion, no-results | dazu Gruppenüberschrift, Spinner, Löschen, gewählter Eintrag | **anpassen** | Gruppenüberschriften und einen Spinner im Feld übernehmen. |
| A-kompletigilo-5 | Verhalten (Tastatur, ARIA) | combobox, Pfeile, Enter, Escape | dasselbe Muster (APG) | **behalten** | Beide folgen dem Muster combobox nach APG mit Pfeilen, Enter und Escape. |
| A-kompletigilo-6 | Muster und Grenzen | Grenzen multi-select (use-instead plurelektilo), tags (not-supported) | Mehrfachwahl als eigene Komponente | **behalten** | Gleich getrennt; Tokenizer steht in der Liste der fehlenden Gattungen. |

#### `konsileto` ↔ Tooltip

Quelle: `src/Tooltip/Tooltip.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-konsileto-1 | Achsen und Werte | `for`, `placement` (4 Seiten) | Seite (4), Ausrichtung mit 3 Werten, Verzögerung, Auslöser bei Fokus und Touch | **anpassen** | Die Ausrichtung übernehmen, unter eigenem Namen: `justify` mit `start`, `center`, `end`. Verzögerungen bleiben Motion-Tokens. |
| A-konsileto-2 | Größen | keine Größe | keine Größe | **behalten** | Ein Tooltip nimmt die Breite seines kurzen Texts (Regulo tooltip-text-short). |
| A-konsileto-3 | Zustände | rest | rest | **behalten** | Ein Tooltip ist sichtbar oder nicht; weitere Zustände hat er in beiden Systemen nicht. |
| A-konsileto-4 | Anatomie und Slots | surface, text | Fläche und Text | **behalten** | Fläche und Text decken sich; mehr Teile hat ein Tooltip in beiden Systemen nicht. |
| A-konsileto-5 | Verhalten (Tastatur, ARIA) | Rolle tooltip, Escape schließt | Hover und Fokus, Escape schließt, Touch tippt | **behalten** | Gleich (WCAG 1.4.13). |
| A-konsileto-6 | Muster und Grenzen | Grenze tooltip-on-disabled (ask-human); Regulo tooltip-text-short | Grund für „deaktiviert“ als Tooltip | **anpassen** | Die Grenze tooltip-on-disabled wird mit M-1 entschieden. |

#### `langetaro` ↔ TabList

Quelle: `src/TabList/TabList.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-langetaro-1 | Achsen und Werte | `label`, `selected` | Wert, Größe, Breite mit 2 Werten (Inhalt oder füllen), Trennlinie, Überlauf, Rolle | **anpassen** | Die Breite übernehmen, unter eigenem Namen: `spread` mit `content` und `fill`. Navigation zwischen Seiten bleibt der navigado. |
| A-langetaro-2 | Größen | keine Größe | 3 Stufen | **übernehmen** | Registerkarten stehen oft neben Feldern und Knöpfen; drei Stufen wie dort. |
| A-langetaro-3 | Zustände | rest, hover, focus, disabled | dieselben | **behalten** | Dieselben vier Zustände in beiden Systemen. |
| A-langetaro-4 | Anatomie und Slots | tab, tabs, selected-indicator, list, panel | dazu Überlauf mit Pfeilen, Inhalt am Anfang und Ende | **anpassen** | Den Überlauf übernehmen: Die Leiste scrollt, die gewählte Karte bleibt sichtbar. Das entscheidet die Grenze many-tabs. |
| A-langetaro-5 | Verhalten (Tastatur, ARIA) | tablist, Pfeile, Home/End | Landmarke nav oder tablist | **behalten** | Wir trennen Registerkarten (langetaro) und Navigation (navigado). Das hält die Rollen eindeutig. |
| A-langetaro-6 | Muster und Grenzen | Grenzen many-tabs, manual-activation, vertical-tabs (ask-human), closable-tabs (not-supported) | Menü für weitere Karten | **behalten** | Die übrigen Grenzen bleiben. |

#### `ligilo` ↔ Link

Quelle: `src/Link/Link.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-ligilo-1 | Achsen und Werte | `to`, `placement` inline \| standalone, `external`, `size`, `label` | dazu Unterstreichung, 11 Textgrößen, Gewicht, Farbe, deaktiviert, Download | **behalten** | Inline und eigenständig sowie extern decken sich. Die Unterstreichung regelt bei uns link-not-color-only; Gewicht und Farbe kommen aus der Rolle. |
| A-ligilo-2 | Größen | small \| medium \| large | 11 Textgrößen | **behalten** | Die Größe folgt den Typo-Rollen aus ①; drei Stufen reichen für den Link selbst. |
| A-ligilo-3 | Zustände | rest, hover, pressed, focus, visited | dazu deaktiviert | **behalten** | Unsere Grenze disabled-link (not-supported): Ein Ziel, das nicht erreichbar ist, ist kein Link. |
| A-ligilo-4 | Anatomie und Slots | Slots label, icon-end | Beschriftung, Icon vorn und hinten | **übernehmen** | Einen Slot `icon-start` übernehmen, wie beim butono. |
| A-ligilo-5 | Verhalten (Tastatur, ARIA) | link, Enter, „öffnet extern“ wird angesagt | dasselbe, Hinweis auf neuen Tab | **behalten** | Beide sagen das Verlassen an; unser Text „öffnet extern“ deckt auch den neuen Tab. |
| A-ligilo-6 | Muster und Grenzen | Grenzen button-look, download (ask-human), multi-line-label (not-supported) | Download als Prop | **anpassen** | Download übernehmen und die Grenze download damit entscheiden; das Icon kommt aus Phosphor. |

#### `listelektilo` ↔ Selector, ComplexSelector

Quelle: `src/Selector/Selector.doc.mjs`, `src/ComplexSelector/ComplexSelector.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-listelektilo-1 | Achsen und Werte | `value`, `placeholder`, `required`, `disabled`, `readonly`, `invalid`, `expanded`, `name` | dazu Suche, Löschen, eigene Darstellung der Option, Größe, Darstellung, Laden | **anpassen** | Löschen nach M-6. Suche bleibt beim kompletigilo (Grenze search-in-list). Größe in der nächsten Zeile. |
| A-listelektilo-2 | Größen | keine Größe | 3 Stufen | **übernehmen** | Wie beim elektilo: drei Stufen, damit beide in einer Zeile gleich hoch sind. |
| A-listelektilo-3 | Zustände | rest, hover, focus, disabled, readonly, invalid | dazu Laden, Warnung, Erfolg | **anpassen** | Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-listelektilo-4 | Anatomie und Slots | label, required-mark, surface, border, text, placeholder, indicator, listbox, item, icon, description, help, error | dazu Abschnittsüberschrift, Trenner, Leerzustand, Status-Icon | **anpassen** | Abschnittsüberschrift und Trenner übernehmen. |
| A-listelektilo-5 | Verhalten (Tastatur, ARIA) | combobox, Pfeile, Home/End, Enter, Space, Escape | dazu Springen per Tippen | **übernehmen** | Springen per Tippen übernehmen, wie beim elektilo. |
| A-listelektilo-6 | Muster und Grenzen | Grenze search-in-list (use-instead kompletigilo) | auf Touch ein Blatt von unten | **behalten** | Die Grenze bleibt; die adaptive Darstellung steht unter M-4. |

#### `lokredaktilo` ↔ TextInput

Quelle: `src/TextInput/TextInput.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-lokredaktilo-1 | Achsen und Werte | `label`, `value`, `kind` text \| number \| email \| url, `editing`, `disabled`, `readonly`, `invalid`, `name` | kein eigenes Gegenstück; im Bearbeiten-Modus ein Textfeld | **behalten** | Die Fonto hat keinen Inline-Editor; es gibt nichts zu übernehmen. |
| A-lokredaktilo-2 | Größen | keine Größe | Textfeld mit 3 Stufen | **behalten** | Die Größe folgt dem umgebenden Text, nicht einer Stufe. |
| A-lokredaktilo-3 | Zustände | rest, hover, focus, disabled, readonly, invalid | Status des Textfelds | **anpassen** | Im Bearbeiten-Modus gilt der Feldstatus aus M-2. |
| A-lokredaktilo-4 | Anatomie und Slots | text, edit, field, save, cancel, error | – | **behalten** | Die Fonto hat keinen Inline-Editor; unsere Teile bleiben, wie Spec 025 sie gebaut hat. |
| A-lokredaktilo-5 | Verhalten (Tastatur, ARIA) | Enter speichert, Escape bricht ab | – | **behalten** | Kein Gegenstück; unser Verhalten bleibt. |
| A-lokredaktilo-6 | Muster und Grenzen | Grenzen multi-field-edit (use-instead), autosave (ask-human) | – | **behalten** | Kein Gegenstück; die Grenzen bleiben. |

#### `markdovido` ↔ Markdown

Quelle: `src/Markdown/Markdown.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-markdovido-1 | Achsen und Werte | `source`, `start-level` 2–6 | Startebene 1–6, Dichte mit 2 Werten, Breite, Ausrichtung, Streaming, Quellen | **anpassen** | Übernehmen: die Dichte als Achse `density` mit `default` und `compact` (Namen der Dimensio density) und `streaming` für Antworten von Agenten, die nach und nach kommen. Startebene 1 nicht: Die Seite hat ihre eine Überschrift erster Ebene. |
| A-markdovido-2 | Größen | keine Größe | Breite des Inhalts | **behalten** | Die Lesebreite kommt aus der Sxablono, nicht aus dem Ero. |
| A-markdovido-3 | Zustände | rest | dazu Streaming | **übernehmen** | Den Zustand „streamt“ mit aria-busy übernehmen. |
| A-markdovido-4 | Anatomie und Slots | box, quote, indent | Dokument, Überschrift, Absatz, Liste, Codeblock, Zitat, Tabelle, Trenner, Bild | **anpassen** | Codeblöcke als kodbloko und Tabellen als tabelo zeichnen; die Eroj setzen sich zusammen. Bilder bleiben die Grenze images (ask-human). |
| A-markdovido-5 | Verhalten (Tastatur, ARIA) | Rolle document | dasselbe, mit Ankern an Überschriften | **behalten** | Beide geben ein Dokument aus; Anker an Überschriften setzt bei uns die Vitrino. |
| A-markdovido-6 | Muster und Grenzen | Grenzen images (ask-human), html (not-supported) | Zitate mit Quellen | **behalten** | Die Grenzen bleiben. Quellenangaben stehen als Citation in der Liste der fehlenden Gattungen. |

#### `markobutono` ↔ CheckboxInput

Quelle: `src/CheckboxInput/CheckboxInput.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-markobutono-1 | Achsen und Werte | `checked`, `required`, `invalid`, `size`, `disabled`, `name` | Wert mit drei Werten (an, aus, gemischt), nur lesen, Größe, Icon an der Beschriftung, Beschreibung | **anpassen** | `readonly` übernehmen. Den gemischten Wert nicht: Er ist unsere Grenze indeterminate (not-supported), weil ein Kästchen allein nichts mischt; er gehört zur Gruppe (CheckboxList in der Liste der fehlenden Gattungen). |
| A-markobutono-2 | Größen | small \| medium \| large | 2 Stufen | **übernehmen** | Anzahl der Fonto, wie beim elekto (O-2). |
| A-markobutono-3 | Zustände | rest, hover, focus, disabled, invalid | dazu Nur-Lesen, Laden, Warnung, Erfolg | **anpassen** | Nur-Lesen (Zeile 1). Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-markobutono-4 | Anatomie und Slots | label, required-mark, error, indicator; Slots label, error | Kästchen, Beschriftung, Beschreibung, Statusmeldung | **übernehmen** | Einen Slot `help` für die Beschreibung übernehmen, wie bei den übrigen Feldern. |
| A-markobutono-5 | Verhalten (Tastatur, ARIA) | checkbox, Space | dasselbe | **behalten** | Rolle checkbox mit Space in beiden Systemen. |
| A-markobutono-6 | Muster und Grenzen | Grenzen indeterminate (not-supported), checkbox-group (ask-human) | Gruppe als eigene Komponente | **behalten** | Die Grenzen bleiben bis zur Entscheidung über CheckboxList. |

#### `menuo` ↔ DropdownMenu, MoreMenu

Quelle: `src/DropdownMenu/DropdownMenu.doc.mjs`, `src/MoreMenu/MoreMenu.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-menuo-1 | Achsen und Werte | `label`, `placement`, `open`, `disabled` | Einträge (mit Haken, Optionen, Untermenüs, Zielen), Darstellung, Ausrichtung, Pfeil am Auslöser, Kopf und Fuß, Breite | **anpassen** | Die Ausrichtung übernehmen wie beim konsileto (`justify`). |
| A-menuo-2 | Größen | keine Größe; der Auslöser ist ein butono | Größe über den Knopf | **behalten** | Der Auslöser ist ein Knopf und trägt dessen Größe, in beiden Systemen. |
| A-menuo-3 | Zustände | rest, hover, focus, disabled | dieselben | **behalten** | Dieselben vier Zustände in beiden Systemen. |
| A-menuo-4 | Anatomie und Slots | surface, border, item, danger-item; Slots items, trigger | dazu Icon je Eintrag, Abschnittsüberschrift, Trenner, Haken, Untermenü-Pfeil | **anpassen** | Icon je Eintrag, Abschnittsüberschrift und Trenner übernehmen. |
| A-menuo-5 | Verhalten (Tastatur, ARIA) | menu, Pfeile, Home/End, Escape, Enter, Space | Menü-Knopf nach APG, Springen per Tippen; Einträge mit Ziel sind Links | **übernehmen** | Springen per Tippen übernehmen. Ein Eintrag mit Ziel wird ein Link (Regulo link-navigates-button-acts). |
| A-menuo-6 | Muster und Grenzen | Grenzen submenu (not-supported), checkable-items (ask-human) | Untermenüs, Einträge mit Haken, Blatt auf Touch | **behalten** | Die Grenzen bleiben; das Blatt steht unter M-4. |

#### `mezurilo` ↔ ProgressBar

Quelle: `src/ProgressBar/ProgressBar.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-mezurilo-1 | Achsen und Werte | `value`, `min`, `max`, `intent` neutral \| success \| warning \| danger, `label-hidden` | Wert, Maximum, 5 Farben (mit Akzent), unbestimmt, Wertbeschriftung, Markierungen | **behalten** | Unsere 4 Werte decken die Bedeutungen ab; der Akzent der Fonto ist bei uns `neutral`. Unbestimmter Fortschritt ist ein Ladezustand (plenstato). |
| A-mezurilo-2 | Größen | keine Größe | keine Größe | **behalten** | Der Balken nimmt die Breite seines Ortes; Stufen fehlen in beiden. |
| A-mezurilo-3 | Zustände | rest | dazu unbestimmt und deaktiviert | **behalten** | Ein Messbalken zeigt einen Stand, keinen Vorgang (siehe Zeile 5). |
| A-mezurilo-4 | Anatomie und Slots | track, fill, unknown, label, value-text | dazu Markierungen | **behalten** | Die Grenze multi-segment bleibt; Markierungen wären Teilstände. |
| A-mezurilo-5 | Verhalten (Tastatur, ARIA) | Rolle meter | Rolle progressbar | **behalten** | Die Fonto misst Fortschritt, wir einen Stand. Fortschritt ist eine eigene Bedeutung; bei Bedarf ein eigenes Ero (O-4). |
| A-mezurilo-6 | Muster und Grenzen | Grenzen chart, multi-segment (not-supported); Regulo meter-text-states-value | Wertbeschriftung mit Format | **behalten** | Unsere Regulo verlangt den Wert als Text schon. |

#### `navigado` ↔ TopNav, SideNav

Quelle: `src/TopNav/TopNav.doc.mjs`, `src/SideNav/SideNav.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-navigado-1 | Achsen und Werte | `orientation` horizontal \| vertical, `label`, `page` | zwei Komponenten: oben mit Produktname und Bereichen, seitlich mit Abschnitten, Verschachtelung, Einklappen und Ziehen | **anpassen** | Abschnitte mit Überschrift in der senkrechten Navigation übernehmen. Verschachtelung bleibt die Grenze submenu. |
| A-navigado-2 | Größen | keine Größe | Breite der Seitenleiste ziehbar | **behalten** | Die Breite gehört dem sxelo. |
| A-navigado-3 | Zustände | rest, hover, focus | dazu eingeklappt | **behalten** | Die Grenze collapsed-mobile (not-supported) bleibt; die mobile Navigation ist eine fehlende Gattung (MobileNav). |
| A-navigado-4 | Anatomie und Slots | item, items, underline; Slot items | Produkt-Icon und -Name, Einträge, Menü für weitere, Einklappen, Abschnittsüberschrift, Icons | **anpassen** | Teil `section-heading` und einen Slot `icon-start` je Eintrag übernehmen. Produktname und Kopf gehören dem sxelo. |
| A-navigado-5 | Verhalten (Tastatur, ARIA) | navigation, aria-current | dasselbe | **behalten** | Landmarke navigation und aria-current an der aktuellen Seite, in beiden Systemen. |
| A-navigado-6 | Muster und Grenzen | Grenzen submenu, drawer (ask-human), collapsed-mobile (not-supported), breadcrumb (use-instead spuro) | Hauptnavigation ab 5 Zielen seitlich | **behalten** | Die Fonto rät dasselbe wie unsere Uzo; die Grenzen bleiben. |

#### `pagxigilo` ↔ Pagination

Quelle: `src/Pagination/Pagination.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-pagxigilo-1 | Achsen und Werte | `page`, `total-pages`, `label`, `mode` button \| link, `href-template`, `siblings` | 6 Darstellungen (Seiten, Anzahl, kompakt, Punkte, Eingabe, keine), Seitengröße, erste und letzte Seite, unbekannte Gesamtzahl | **anpassen** | Drei Darstellungen übernehmen, unter eigenem Namen: `summary` mit `pages`, `count`, `compact`. Punkte gehören zum Karussell, die Eingabe ist selten. |
| A-pagxigilo-2 | Größen | keine Größe | 2 Stufen | **übernehmen** | Unter dichten Tabellen braucht es eine kleine Stufe. |
| A-pagxigilo-3 | Zustände | rest, hover, focus, disabled | dieselben | **behalten** | Dieselben vier Zustände in beiden Systemen. |
| A-pagxigilo-4 | Anatomie und Slots | item, border, ellipsis, prev, next | dazu erste und letzte Seite, Auswahl der Seitengröße, Anzeige der Anzahl | **anpassen** | Erste und letzte Seite übernehmen. Die Seitengröße bleibt die Grenze page-size-select (ask-human). |
| A-pagxigilo-5 | Verhalten (Tastatur, ARIA) | navigation, aria-current | dasselbe | **behalten** | Landmarke navigation und aria-current an der aktuellen Seite, in beiden Systemen. |
| A-pagxigilo-6 | Muster und Grenzen | Grenzen infinite-scroll, page-size-select (ask-human) | „mehr“ bei unbekannter Gesamtzahl | **übernehmen** | Eine unbekannte Gesamtzahl kommt bei Suchen und Protokollen vor; nur „weiter“ ohne letzte Seite. |

#### `plenstato` ↔ EmptyState, Spinner, Skeleton

Quelle: `src/EmptyState/EmptyState.doc.mjs`, `src/Spinner/Spinner.doc.mjs`, `src/Skeleton/Skeleton.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-plenstato-1 | Achsen und Werte | `kind` loading \| empty | Leerzustand mit Titel, Beschreibung, Icon, Aktionen, Ebene der Überschrift, kompakt; Spinner mit 4 Größen; Platzhalter | **anpassen** | Kompakt als Boolean `compact` übernehmen, für Tabellen und Seitenleisten. Die Ebene der Überschrift folgt der Seite (heading-levels-in-order). |
| A-plenstato-2 | Größen | keine Größe | Spinner in 4 Stufen, Leerzustand kompakt | **anpassen** | Mit `compact` hat der Ladezustand zwei Stufen; mehr braucht ein Zustand für einen Bereich nicht. |
| A-plenstato-3 | Zustände | rest | rest | **behalten** | Lade- und Leerzustand sind selbst Zustände eines Bereichs; mehr gibt es nicht. |
| A-plenstato-4 | Anatomie und Slots | surface, border, indicator, text, actions | Icon, Titel, Beschreibung, Aktionen | **übernehmen** | Einen Slot `heading` und einen Slot `icon` übernehmen; der Leertext sagt dann, was fehlt, und der Titel, wo man ist. |
| A-plenstato-5 | Verhalten (Tastatur, ARIA) | Rolle status | dasselbe | **behalten** | Beide sagen den Zustand höflich mit der Rolle status an. |
| A-plenstato-6 | Muster und Grenzen | Grenze skeleton (not-supported); Regulo empty-state-says-what-next | Platzhalter in Form des Inhalts | **behalten** | Die Grenze bleibt, bis der Maintainer sie entscheidet (O-5). |

#### `plurelektilo` ↔ MultiSelector

Quelle: `src/MultiSelector/MultiSelector.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-plurelektilo-1 | Achsen und Werte | `values`, `filterable`, `max`, `summary` count \| tags, `placeholder`, `required`, `disabled`, `readonly`, `invalid`, `expanded` | Anzeige im Auslöser mit 3 Werten (Anzahl, Beschriftungen, Badges), höchste Zahl der Badges, alle wählen, Suche, Neu anlegen, Größe | **anpassen** | `summary` bekommt den dritten Wert `labels` (Anzahl der Fonto). Übernehmen: `select-all` als Boolean. |
| A-plurelektilo-2 | Größen | keine Größe | 3 Stufen | **übernehmen** | Wie listelektilo und elektilo. |
| A-plurelektilo-3 | Zustände | rest, hover, focus, disabled, readonly, invalid | dazu Laden, Warnung, Erfolg | **anpassen** | Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-plurelektilo-4 | Anatomie und Slots | listbox, filter, item, check, clear, tag | dazu Zeile „alle wählen“, Abschnittsüberschrift, Trenner, Leerzustand | **anpassen** | Zeile „alle wählen“ und Abschnittsüberschrift übernehmen. |
| A-plurelektilo-5 | Verhalten (Tastatur, ARIA) | listbox, Pfeile, Home/End, Space, Enter, Escape | combobox mit Mehrfachauswahl | **behalten** | Beide nutzen eine Liste mit Mehrfachauswahl und dieselben Tasten; die Rolle am Auslöser unterscheidet sich, das Ergebnis für Hilfsmittel nicht. |
| A-plurelektilo-6 | Muster und Grenzen | Grenze create-new-value (ask-human) | Neu anlegen | **behalten** | Die Grenze bleibt, bis der Maintainer sie entscheidet. |

#### `saltligilo` ↔ AppShell

Quelle: `src/AppShell/AppShell.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-saltligilo-1 | Achsen und Werte | `to`, `focus-only` | Teil der Seitenhülle, ohne eigene Props | **behalten** | Kein eigenes Gegenstück; unsere Props bleiben. |
| A-saltligilo-2 | Größen | keine Größe | – | **behalten** | Die Fonto hat keinen eigenen Sprunglink; seine Größe folgt der Schrift. |
| A-saltligilo-3 | Zustände | rest, focus | sichtbar beim Fokus | **behalten** | Unsichtbar bis zum Fokus, in beiden Systemen. |
| A-saltligilo-4 | Anatomie und Slots | label, surface, border | Sprunglink der Hülle | **behalten** | Beschriftung und Fläche decken sich mit dem Sprunglink der Hülle. |
| A-saltligilo-5 | Verhalten (Tastatur, ARIA) | link, Enter | dasselbe | **behalten** | Ein Link, der mit Enter zum Inhalt springt, in beiden Systemen. |
| A-saltligilo-6 | Muster und Grenzen | Grenze always-visible (not-supported) | Die Hülle setzt den Sprunglink selbst | **behalten** | Dass der sxelo den saltligilo selbst setzt, gehört zu den Templates; die sind nicht Teil dieser Spec. |

#### `signeto` ↔ Token

Quelle: `src/Token/Token.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-signeto-1 | Achsen und Werte | `mode` static \| selectable \| removable, `selected`, `size` small \| medium, `intent`, `disabled` | Größe (3), Farbe mit Standard und 10 Farbtönen, Icon, Link, Beschreibung, Endinhalt, Entfernen | **behalten** | Unsere Modi decken die Fonto ab. Die Farbtöne bleiben die Grenze tinted-categories (ask-human). |
| A-signeto-2 | Größen | small \| medium | 3 Stufen | **übernehmen** | Anzahl der Fonto: `large` dazu, für Filterleisten auf Touch. |
| A-signeto-3 | Zustände | rest, hover, focus, disabled | dieselben | **behalten** | Dieselben vier Zustände in beiden Systemen. |
| A-signeto-4 | Anatomie und Slots | surface, border, text, remove; Slots label, icon-start | dazu Endinhalt und Beschreibung | **behalten** | Beschreibung und Endinhalt decken unser Slot `label` und der Entfernen-Knopf. |
| A-signeto-5 | Verhalten (Tastatur, ARIA) | Enter, Space, Delete, Backspace; aria-pressed | Entfernen-Knopf mit Namen | **behalten** | Entfernen hat in beiden einen Namen mit der Beschriftung; Delete und Backspace kommen bei uns dazu. |
| A-signeto-6 | Muster und Grenzen | signeto und insigno sehen bisher gleich aus | Token und Badge unterscheiden sich in der Form | **anpassen** | Die Spec verlangt in ②b eine unterscheidbare Form; Vorschlag: die Form über die Radius-Rolle, Werte aus ①. |

#### `spuro` ↔ Breadcrumbs

Quelle: `src/Breadcrumbs/Breadcrumbs.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-spuro-1 | Achsen und Werte | `label`, `page` | Trenner, 2 Darstellungen (normal, unterstützend), Menü im Eintrag, Icon | **anpassen** | Die zwei Darstellungen übernehmen, als `emphasis` mit `medium` und `low`. |
| A-spuro-2 | Größen | keine Größe | keine Größe | **behalten** | Ein Pfad nimmt die Schrift seines Ortes; Stufen fehlen in beiden. |
| A-spuro-3 | Zustände | rest, hover, focus | dieselben | **behalten** | Dieselben drei Zustände in beiden Systemen. |
| A-spuro-4 | Anatomie und Slots | item, underline, separator | Pfad, Eintrag, Trenner, Icon | **übernehmen** | Einen Slot `icon-start` am ersten Eintrag übernehmen. |
| A-spuro-5 | Verhalten (Tastatur, ARIA) | navigation, aria-current | dasselbe; Menü im Eintrag nach APG | **behalten** | Landmarke navigation und aria-current am letzten Eintrag, in beiden Systemen. |
| A-spuro-6 | Muster und Grenzen | Grenze collapsed-middle (ask-human) | Menü für ausgelassene Einträge in der Mitte | **anpassen** | Die Mitte mit einem menuo auslassen und die Grenze damit entscheiden. |

#### `sxaltilo` ↔ Switch

Quelle: `src/Switch/Switch.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-sxaltilo-1 | Achsen und Werte | `checked`, `size`, `disabled`, `name` | dazu Laden, Beschreibung, Status, Seite der Beschriftung (2), Abstand der Beschriftung | **anpassen** | Die Seite der Beschriftung übernehmen, unter eigenem Namen: `label-side` mit `start` und `end`. |
| A-sxaltilo-2 | Größen | small \| medium \| large | 2 Stufen | **übernehmen** | Anzahl der Fonto, wie elekto und markobutono (O-2). |
| A-sxaltilo-3 | Zustände | rest, hover, focus, disabled | dazu Laden und Status | **anpassen** | Ein Schalter wirkt sofort; dauert das, zeigt er „lädt“ (M-5). Status nach M-2. |
| A-sxaltilo-4 | Anatomie und Slots | label, surface, indicator | Spur, Griff, Beschriftung, Beschreibung, Spinner, Statusmeldung | **übernehmen** | Slot `help` und den Spinner übernehmen. |
| A-sxaltilo-5 | Verhalten (Tastatur, ARIA) | switch, Space und Enter | dasselbe | **behalten** | Rolle switch mit Space in beiden; Enter erlauben wir zusätzlich. |
| A-sxaltilo-6 | Muster und Grenzen | Grenze three-states (not-supported); Regulo switch-label-names-the-setting | wirkt sofort, sonst Kontrollkästchen | **behalten** | Die Fonto begründet wie unsere Uzo. |

#### `sxvebilo` ↔ Popover

Quelle: `src/Popover/Popover.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-sxvebilo-1 | Achsen und Werte | `label`, `placement`, `open` | Seite, Ausrichtung, Breite, Innenabstand, Rolle, modal, Schließen-Knopf, Schließen bei Klick daneben und Escape | **anpassen** | Die Ausrichtung übernehmen wie beim konsileto (`justify`). |
| A-sxvebilo-2 | Größen | keine Größe | Breite | **behalten** | Die Breite folgt dem Inhalt und den Container-Tokens. |
| A-sxvebilo-3 | Zustände | rest | rest | **behalten** | Offen oder zu ist das Prop `open`; weitere Zustände hat das Overlay nicht. |
| A-sxvebilo-4 | Anatomie und Slots | surface, border, heading, content | Auslöser, Fläche, Inhalt, Schließen | **übernehmen** | Einen Teil `close` übernehmen: Auf Touch gibt es kein Escape. |
| A-sxvebilo-5 | Verhalten (Tastatur, ARIA) | Rolle dialog, Escape | dialog, Fokus bleibt drin und kehrt zurück, Klick daneben schließt | **behalten** | Beide halten den Fokus im Overlay, schließen mit Escape und geben den Fokus zurück. |
| A-sxvebilo-6 | Muster und Grenzen | Grenzen nested-popover (not-supported), drawer (ask-human) | Hover-Karte als eigene Komponente | **behalten** | Die Grenzen bleiben; HoverCard steht in der Liste der fehlenden Gattungen. |

#### `tabelo` ↔ Table

Quelle: `src/Table/Table.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-tabelo-1 | Achsen und Werte | `density` comfortable \| compact, `caption-hidden`, `sort`, `direction` | Dichte mit 3 Werten, Linien mit 4 Werten (Zeilen, Spalten, Gitter, keine), Streifen, Hover, Ausrichtung, Umbruch | **anpassen** | Die Dichte bekommt drei Werte; Namen wie die Dimensio density: `compact`, `default`, `comfortable`. Linien übernehmen, unter eigenem Namen: `rules` mit `rows`, `columns`, `grid`, `none`. |
| A-tabelo-2 | Größen | Dichte statt Größe | Dichte statt Größe | **behalten** | Die Tabelle hat statt einer Größe die Dichte, in beiden Systemen (Zeile 1). |
| A-tabelo-3 | Zustände | rest, hover, focus | dazu gewählte und aufgeklappte Zeilen | **behalten** | Die Grenze row-selection (ask-human) bleibt. |
| A-tabelo-4 | Anatomie und Slots | caption, head, cell, row-header, region, border, sort, sort-indicator; Slots caption, content, empty | dazu Auswahl, Aufklappen, Detailbereich, Fuß, Leerzustand | **anpassen** | Den Fuß übernehmen (Teil `foot`), etwa für Summen. |
| A-tabelo-5 | Verhalten (Tastatur, ARIA) | table, Enter und Space sortieren | aria-sort, aria-selected, aria-expanded | **behalten** | Gleich für Sortieren. |
| A-tabelo-6 | Muster und Grenzen | Grenzen row-selection, row-tint (ask-human), pagination, inline-edit (use-instead), sticky-header (not-supported) | Streifen, feste Spalten, Erweiterungen | **behalten** | Unsere Grenzen bleiben. |

#### `tekstareo` ↔ TextArea

Quelle: `src/TextArea/TextArea.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-tekstareo-1 | Achsen und Werte | `kind` text \| code, `value`, `rows`, `placeholder`, `required`, `disabled`, `readonly`, `invalid`, `size`, `name` | dazu höchste Länge mit Zähler, Rechtschreibprüfung, Start-Icon, Laden | **anpassen** | Die höchste Länge mit Zähler übernehmen (`max-length`) und die Grenze character-count damit entscheiden. |
| A-tekstareo-2 | Größen | small \| medium \| large | 3 Stufen | **behalten** | Drei Stufen in beiden Systemen; die Werte heißen wie bei uns. |
| A-tekstareo-3 | Zustände | rest, hover, focus, disabled, invalid | dazu Nur-Lesen, Laden, Warnung, Erfolg | **anpassen** | Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-tekstareo-4 | Anatomie und Slots | label, required-mark, surface, border, text, placeholder, help, error | dazu Zähler, Status-Icon | **übernehmen** | Teil `counter` übernehmen. |
| A-tekstareo-5 | Verhalten (Tastatur, ARIA) | textbox | dasselbe; der Zähler wird angesagt | **behalten** | Rolle textbox in beiden; den Zähler sagen wir mit der Zeile 4 ebenfalls an. |
| A-tekstareo-6 | Muster und Grenzen | Grenzen auto-grow (ask-human), rich-text (not-supported) | – | **behalten** | Die Fonto wächst nicht mit und kennt keinen formatierten Text; unsere Grenzen bleiben. |

#### `teksto` ↔ Text, Code

Quelle: `src/Text/Text.doc.mjs`, `src/Code/Code.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-teksto-1 | Achsen und Werte | `kind` body \| caption \| kicker \| code, `size` 1 \| 2, `emphasis` high \| medium \| low | 9 Typen, 11 Größen, 6 Farben, 4 Gewichte, Zeilen, Tooltip beim Abschneiden, Zahlen gleicher Breite | **anpassen** | `kind` bekommt `label` für Beschriftungen. Übernehmen: `max-lines` mit Tooltip beim Abschneiden und `tabular` für Zahlen in Tabellen. |
| A-teksto-2 | Größen | 1 \| 2 | 11 Größen | **behalten** | Die Stufen kommen aus den Typo-Rollen (①); das Ero wählt die Rolle, nicht die Stufe. |
| A-teksto-3 | Zustände | rest | rest | **behalten** | Text ist nicht interaktiv und hat keine Zustände. |
| A-teksto-4 | Anatomie und Slots | text | Text, Überschrift, Tooltip beim Abschneiden | **anpassen** | Mit `max-lines` kommt der Tooltip dazu. |
| A-teksto-5 | Verhalten (Tastatur, ARIA) | Rolle paragraph | span, p, div oder label | **behalten** | Das Element folgt dem Zweck; bei uns ein Absatz, die Fonto lässt es wählen. |
| A-teksto-6 | Muster und Grenzen | Grenze rich-text (use-instead markdovido) | – | **behalten** | Formatierter Text gehört dem markdovido; die Fonto trennt Text und Markdown ebenso. |

#### `titolo` ↔ Heading

Quelle: `src/Text/Heading.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-titolo-1 | Achsen und Werte | `level` 1–6, `size` (7 Stufen), `focusable` | Ebene, Typ (3 Display-Stufen), Gewicht, Ebene für Hilfsmittel, Farbe, Zeilen | **behalten** | Wir trennen Semantik (`level`) und Optik (`size`) schon; die Fonto braucht dafür eine zweite Ebene. |
| A-titolo-2 | Größen | 7 Stufen | 3 Display-Stufen und Größe aus der Ebene | **behalten** | Die Stufen kommen aus den Typo-Rollen (①). |
| A-titolo-3 | Zustände | rest | rest | **behalten** | Eine Überschrift ist nicht interaktiv und hat keine Zustände. |
| A-titolo-4 | Anatomie und Slots | text | Text | **behalten** | Eine Überschrift ist in beiden Systemen nur ihr Text. |
| A-titolo-5 | Verhalten (Tastatur, ARIA) | heading, aria-level | dasselbe | **behalten** | Rolle heading mit aria-level, in beiden Systemen. |
| A-titolo-6 | Muster und Grenzen | Grenze heading-with-actions (use-instead); Regulo heading-levels-in-order | – | **behalten** | Kopf mit Aktionen gehört der Sxablono pagxo. |

### Fehlende Gattungen

Gattungen der Fonto ohne Gegenstück in Fundamento. Stoff für Eroj-Runde 6, hier nicht gebaut. Hilfsmittel der Fonto ohne eigene Gestalt (Layer, LinkProvider, VisuallyHidden, InternationalizationProvider, MediaTheme, SyntaxTheme, Theme, Overlay, Indicator) und Teile anderer Komponenten (Item, Step, BottomSheetSwitcher, ChatDictationButton) stehen nicht in der Liste.

| # | Fonto | Gattung | Vorschlag | Begründung | Quelle |
|---|---|---|---|---|---|
| 1 | Stepper | Schrittanzeige | Eroj-Runde 6 | Assistenten in mehreren Schritten sind eine Aufgabe des Nordsterns (Spec 030); heute baut ein Agent sie nach. | `src/Stepper/Stepper.doc.mjs` |
| 2 | Drawer | Seitenpanel | Eroj-Runde 6 | Detail zu einer Tabellenzeile ohne Seitenwechsel; entscheidet die Grenzen drawer von dialogo, sxvebilo und navigado. | `src/Drawer/Drawer.doc.mjs` |
| 3 | BottomSheet | Blatt von unten | Eroj-Runde 6 | Voraussetzung für die adaptive Darstellung (M-4). | `src/BottomSheet/BottomSheet.doc.mjs` |
| 4 | CheckboxList | Gruppe von Kontrollkästchen | Eroj-Runde 6 | Entscheidet die Grenze checkbox-group des markobutono; Gegenstück zum elekto. | `src/CheckboxList/CheckboxList.doc.mjs` |
| 5 | SegmentedControl | Segmentschalter | Eroj-Runde 6 | Einfachauswahl aus 2 bis 5 Werten auf engem Raum, etwa Ansicht Liste oder Raster. | `src/SegmentedControl/SegmentedControl.doc.mjs` |
| 6 | ToggleButton | Umschaltknopf | Eroj-Runde 6 | Dauerhafter An-/Aus-Zustand als Knopf, etwa Fett in einer Werkzeugleiste. | `src/ToggleButton/ToggleButton.doc.mjs` |
| 7 | ButtonGroup | Knopfgruppe | Eroj-Runde 6 | Verbundene Aktionen; braucht eine Regel zusammen mit one-primary-per-container. | `src/ButtonGroup/ButtonGroup.doc.mjs` |
| 8 | Toolbar | Werkzeugleiste | Eroj-Runde 6 | Aktionen zu einem Inhaltsbereich; heute baut man sie aus butono und Abstand. | `src/Toolbar/Toolbar.doc.mjs` |
| 9 | ContextMenu | Kontextmenü | Eroj-Runde 6 | Rechtsklick-Aktionen; nur zusätzlich zu einem sichtbaren Weg, sonst nicht erreichbar. | `src/ContextMenu/ContextMenu.doc.mjs` |
| 10 | DateTimeInput | Datum mit Uhrzeit | Eroj-Runde 6 | Termine; heute zwei Felder (datelektilo und kampo time). | `src/DateTimeInput/DateTimeInput.doc.mjs` |
| 11 | Tokenizer | Eingabe mit Schlagworten | Eroj-Runde 6 | Freie Mehrfachwerte wie Empfänger; Grenze tags des kompletigilo. | `src/Tokenizer/Tokenizer.doc.mjs` |
| 12 | InputGroup | Feld mit Vor- und Nachsatz | Eroj-Runde 6 | Währung, Einheit, Domain; teilweise durch `unit` im kampo (A-kampo-1) gedeckt. | `src/InputGroup/InputGroup.doc.mjs` |
| 13 | PowerSearch | Strukturierte Filterleiste | Eroj-Runde 6 | Feld, Operator und Wert als Schlagworte; verwandt mit der Sxablono filtrilo. | `src/PowerSearch/PowerSearch.doc.mjs` |
| 14 | CommandPalette | Befehlspalette | Eroj-Runde 6 | Tastaturzugang zu allen Aktionen; nützlich für Agenten-Werkzeuge, aber ohne Eile. | `src/CommandPalette/CommandPalette.doc.mjs` |
| 15 | HoverCard | Hover-Karte | Eroj-Runde 6 | Vorschau beim Überfahren; Abgrenzung zu konsileto und sxvebilo nötig. | `src/HoverCard/HoverCard.doc.mjs` |
| 16 | ClickableCard | Anklickbare Karte | Eroj-Runde 6 | Entscheidet die Grenze clickable-card der karto. | `src/ClickableCard/ClickableCard.doc.mjs` |
| 17 | SelectableCard | Wählbare Karte | Eroj-Runde 6 | Auswahl mit viel Inhalt je Option, etwa Tarife. | `src/SelectableCard/SelectableCard.doc.mjs` |
| 18 | List | Liste | Eroj-Runde 6 | Einträge mit Icon, Text und Aktion; heute ohne Ero, Agenten bauen sie aus Text. | `src/List/List.doc.mjs` |
| 19 | TreeList | Baumansicht | Eroj-Runde 6 | Hierarchien wie Ordner; eigene Tastatur nach APG. | `src/TreeList/TreeList.doc.mjs` |
| 20 | Timestamp | Zeitangabe | Eroj-Runde 6 | Zeit als lesbarer Text in der gewählten Sprache; passt zum Lingvo-Schalter. | `src/Timestamp/Timestamp.doc.mjs` |
| 21 | AvatarGroup | Avatargruppe | Eroj-Runde 6 | Entscheidet die Grenze avatar-group des avataro. | `src/AvatarGroup/AvatarGroup.doc.mjs` |
| 22 | MobileNav | Mobile Navigation | Eroj-Runde 6 | Entscheidet die Grenze collapsed-mobile des navigado; braucht das Seitenpanel. | `src/MobileNav/MobileNav.doc.mjs` |
| 23 | Outline | Inhaltsverzeichnis | Eroj-Runde 6 | Lange Seiten und Doku; die Vitrino könnte es selbst nutzen. | `src/Outline/Outline.doc.mjs` |
| 24 | Kbd | Tastenkürzel | Eroj-Runde 6 | Kürzel in Menüs und Hilfetexten. | `src/Kbd/Kbd.doc.mjs` |
| 25 | Blockquote | Zitat | Eroj-Runde 6 | Heute nur als Teil `quote` im markdovido. | `src/Blockquote/Blockquote.doc.mjs` |
| 26 | Citation | Quellenangabe | Eroj-Runde 6 | Belege in Antworten von Agenten. | `src/Citation/Citation.doc.mjs` |
| 27 | Thumbnail | Bildvorschau | Eroj-Runde 6 | Entscheidet die Grenze image-preview des alsxutilo. | `src/Thumbnail/Thumbnail.doc.mjs` |
| 28 | Carousel | Karussell | Eroj-Runde 6 | Niedrige Priorität: Inhalte im Karussell werden selten gesehen. | `src/Carousel/Carousel.doc.mjs` |
| 29 | Lightbox | Bildbetrachter | Eroj-Runde 6 | Niedrige Priorität. | `src/Lightbox/Lightbox.doc.mjs` |
| 30 | Timer | Laufende Dauer | Eroj-Runde 6 | Niedrige Priorität. | `src/Timer/Timer.doc.mjs` |
| 31 | Chat | Chat | Eroj-Runde 6 | Familie für Unterhaltungen mit Agenten; eigene Spec wert, wenn der Nordstern es verlangt. | `src/Chat/Chat.doc.mjs` |
| 32 | ChatToolCalls | Werkzeugaufrufe | Eroj-Runde 6 | Gehört zum Chat. | `src/Chat/ChatToolCalls.doc.mjs` |
| 33 | NavHeadingMenu | Menü im Navigationskopf | Eroj-Runde 6 | Gehört zur Navigation oben; Grenze submenu des navigado. | `src/NavMenu/NavMenu.doc.mjs` |
| 34 | NavIcon | Produkt-Icon der Navigation | Sxablono (Templates, später) | Gehört zum Kopf des sxelo. | `src/NavIcon/NavIcon.doc.mjs` |
| 35 | OverflowList | Liste mit Überlauf | kein Ero | Verhalten, kein Ero: gehört in langetaro, spuro und navigado (A-langetaro-4). | `src/OverflowList/OverflowList.doc.mjs` |
| 36 | Toast | Einblendung | Grenze bleibt | Der Maintainer hat den Toast in Spec 015 ausgeschlossen (E6); er bleibt Grenze `toast` des avizo. | `src/Toast/Toast.doc.mjs` |
| 37 | FormLayout | Formularraster | Sxablono (Templates, später) | Die Sxablono formularo deckt das; Templates sind nicht Teil dieser Spec. | `src/FormLayout/FormLayout.doc.mjs` |
| 38 | Layout | Bereiche einer Seite | Sxablono (Templates, später) | sxelo und pagxo decken das. | `src/Layout/Layout.doc.mjs` |
| 39 | Section | Seitenabschnitt | Sxablono (Templates, später) | Gehört zur Sxablono pagxo. | `src/Section/Section.doc.mjs` |
| 40 | Grid | Raster | kein Ero | Anordnung, kein Ero; das Raster kommt aus den Tokens und den Sxablonoj. | `src/Grid/Grid.doc.mjs` |
| 41 | Stack | Stapel | kein Ero | Anordnung, kein Ero; der Abstand gehört dem Container. | `src/Stack/Stack.doc.mjs` |
| 42 | Center | Zentrieren | kein Ero | Anordnung, kein Ero. | `src/Center/Center.doc.mjs` |
| 43 | AspectRatio | Seitenverhältnis | kein Ero | Hilfsmittel für Medien; Teil `media` der karto. | `src/AspectRatio/AspectRatio.doc.mjs` |
| 44 | ScrollableArea | Scrollbereich | kein Ero | Verhalten; der tabelo hat seine Region schon. | `src/ScrollableArea/ScrollableArea.doc.mjs` |
| 45 | Resizable | Ziehbare Bereiche | Sxablono (Templates, später) | Gehört zum sxelo, etwa die Breite der Seitenleiste. | `src/Resizable/Resizable.doc.mjs` |
### Abweichungen

1. **Amendment v2.4 noch nicht in der Constitution.** Die Constitution auf `main` ist v2.3. Art. V sagt dort noch „Quellmaterial anderer Systeme wird dem Coding-Tool nicht vorgelegt“. ②a liest die Fonto nach der Entscheidung des Maintainers vom 23.10. und dem Auftrag der Spec („②a darf sofort starten“, „Die Fonto liest P0 nur in der gepinnten Version“).
   - Das Amendment selbst landet mit ①, zusammen mit `data/fontoj.json`, `THIRD_PARTY_NOTICES.md` und `check:fontoj`.
   - ②a bringt keine Werte und keine Texte ins Repo.
2. **Daten bei der Spec, nicht im Modelo.** `abgleich.json` liegt in `specs/029-fonto-astryx/`, weil ②a nichts baut. ②b trägt die beschlossenen Zeilen ins Skemo, in die Uzo und in die Ero-Tokens ein.
3. **Eine Zeile je Aspekt.** Achsen und Werte stehen in einer Zeile, ebenso Anatomie und Slots: sechs Zeilen je Ero, 240 insgesamt. Eine Zeile je Eigenschaft wäre etwa dreimal so lang, ohne mehr zu entscheiden.
4. **Ohne eigenes Gegenstück:**
   - `lokredaktilo`: Die Fonto hat keinen Inline-Editor; genannt ist das Textfeld, das im Bearbeiten-Modus erscheint.
   - `saltligilo`: Die Fonto hat keinen eigenen Sprunglink; genannt ist die Seitenhülle, die ihn setzt.
5. **Ein Gegenstück für zwei Eroj:** `elektilo` und `listelektilo` haben beide den Selector der Fonto zum Gegenstück. Die Fonto hat nur eine Auswahl; wir trennen die native von der gestalteten.
6. **Namen der neuen Achsen sind Vorschläge.** Der Maintainer entscheidet sie mit der Zeile (O-6).

### Befunde / Mankoj

- **B-1, wo Fundamento vorn liegt:**
  - Die Fonto hat keinen Inline-Editor, keinen Sprunglink als Komponente und keinen Messbalken mit der Rolle meter; ihr Fortschrittsbalken ist ein Vorgang, kein Stand.
  - Unsere Grenzen mit Kialo nennen, was ein Agent nicht bauen soll; die Fonto hat dafür Hinweise in Prosa.
- **B-2, Kategorienfarben:** Die Fonto hat 10 Farbtöne für Kategorien an Badge, Token und Karte. Fundamento hat keine Rollen dafür; der signeto führt sie als Grenze tinted-categories. Manko-Kandidat für ①, Farbe, falls die Rollen dort entstehen.
- **B-3, weniger Größen:** Drei Zeilen (A-elekto-2, A-markobutono-2, A-sxaltilo-2) streichen `large`, weil die Fonto zwei Stufen hat. Das bricht jede Nutzung von `large` (O-2).
- **B-4, Laden und Status in allen Feldern:** M-2 und M-5 berühren 12 Eroj. In ②b ist das der größte Block: neue Ero-Tokens für Warnung und Erfolg in allen Marken und Kontrastpaare dazu.
- **B-5, Rollen:** Die Fonto setzt die Rolle der Meldung nach dem Status (A-avizo-5) und die des Dialogs nach dem Zweck (M-3). Beides ändert, was Screenreader ansagen, und gehört in die Kontrastmatrix und die Tastaturtabellen von ③.

### Offen (für den Maintainer)

- **O-1, wie entscheiden:** Vorschlag: eine Liste der IDs je Entscheidung im Briefing für ②b, etwa „übernehmen: A-avizo-5, M-3 …; anders als vorgeschlagen: A-elekto-2 behalten“. P0 trägt sie in `entscheidung` ein; der Test lässt dort `null` oder einen der drei Werte zu.
- **O-2, gestrichene Werte:** Soll `large` bei elekto, markobutono und sxaltilo sofort entfallen? Oder ein Release lang als Alias auf `medium` bleiben, mit Jugxo und Hinweis im Gvidanto? Vorschlag: Alias für ein Release.
- **O-3, Grenzen, die Zeilen entscheiden würden:**
  - tooltip-on-disabled (M-1)
  - multiple-months (A-datelektilo-1)
  - grouped-options (A-elektilo-4)
  - many-tabs (A-langetaro-4)
  - download (A-ligilo-6)
  - collapsed-middle (A-spuro-6)
  - character-count (A-tekstareo-1)
  - syntax-highlighting (A-kodbloko-6, mit ①)

  Weitere Grenzen bleiben laut Vorschlag, die Fonto hat dort etwas: labelled-line, indeterminate, skeleton, diff, presets, ticks-with-labels, vertical-track, create-new-value, row-selection.
- **O-4, Fortschritt:** Ein eigenes Ero für Fortschritt mit bekannter Dauer (Rolle progressbar), neben dem mezurilo? Vorschlag: Kandidat für Eroj-Runde 6.
- **O-5, Platzhalter in Form des Inhalts:** Die Grenze skeleton des plenstato bleibt nach Vorschlag. Die Fonto hat den Platzhalter.
- **O-6, Namen:** die 12 neuen Achsennamen der Zusammenfassung, Punkt 5.

### Messanleitung

Im Checkout des Maintainers, vor dem Merge auf dem Branch, danach auf `main`:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch origin
git switch 261023-spec-029-2a-abgleich-826849
pnpm install
```

**1. Die Tabelle lesen.** Diesen Plan im Editor oder in der Vorschau öffnen:

```sh
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/029-fonto-astryx/plan.md"
```

Die Daten: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/029-fonto-astryx/abgleich.json`.

**2. Zeilen nach Vorschlag oder Ero filtern.** Zum Beispiel alle Zeilen „übernehmen“ und alle Zeilen des `dialogo`:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
node -e 'const d=require("./specs/029-fonto-astryx/abgleich.json");for(const e of d.eroj)for(const z of e.zeilen)if(z.vorschlag==="übernehmen")console.log(z.id, "–", z.begruendung)'
node -e 'const d=require("./specs/029-fonto-astryx/abgleich.json");for(const z of d.eroj.find(e=>e.ero==="dialogo").zeilen)console.log(z.id, z.vorschlag, "–", z.begruendung)'
```

**3. Den Pin prüfen.** Integrity und Commit stimmen mit der Tabelle oben überein:

```sh
npm view @astryxdesign/core@0.7.4 dist.integrity
npm view @astryxdesign/theme-neutral@0.7.4 dist.integrity
git ls-remote https://github.com/facebook/astryx.git refs/tags/v0.7.4
```

Erwartet: die beiden Integrity-Werte aus „Fonto (gepinnt)“ und `704757fd827c6fa00a71af80b06d5da99d155e45	refs/tags/v0.7.4`.

**4. Eine Zeile an der Quelle nachsehen** (optional). Die Pfade der Spalte „Quelle“ gelten im Paket:

```sh
mkdir -p /tmp/fonto-astryx-0.7.4 && cd /tmp/fonto-astryx-0.7.4
npm pack @astryxdesign/core@0.7.4 && tar xzf astryxdesign-core-0.7.4.tgz
open "file:///tmp/fonto-astryx-0.7.4/package/src/Dialog/Dialog.doc.mjs"
```

**5. Die Tests.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/modelo exec vitest run src/docs/docs.test.ts -t "Spec 029"
```

Erwartet: 8 Tests grün.

Die Spec: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/029-fonto-astryx/spec.md`.
