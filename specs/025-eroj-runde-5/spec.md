# Spec 025 – Eroj-Runde 5: Eingabe und Auswahl

**Branch-Familie:** `025-eroj-runde-5` (drei gestapelte PRs) · **Status:** Entwurf · **Constitution:** kein Amendment · **Erstellt:** 2026-10-22 · **Voraussetzung:** `main` nach dem Merge von #99 (Studio Runde 1) · **Zielpfad:** `specs/025-eroj-runde-5/spec.md` · **Roadmap:** Etappe E5 (Nordstern, `roadmap/roadmap-2026-10-22.md`)

## Zweck
Der Benchmark (`research/benchmark-carbon-2026-10.md` § 2.2, 2.3, Lücke 1) zeigt: Bei Eingabe und Auswahl fehlen die Bausteine, ohne die eine vollständige Marke nicht gezeigt werden kann. Diese Runde schließt sie.

| Ero (Arbeitsname) | Deutsch | neu oder Ergänzung | schließt |
|---|---|---|---|
| `kampo` | Feld | **Ergänzung:** Zahl mit Schrittknöpfen, Suche mit Löschen-Knopf, `kind=time` | Zahleneingabe, Suche, Zeit |
| `glitilo` | Schieberegler | neu | Wert oder Bereich in Grenzen |
| `datelektilo` | Datumsauswahl | neu | Datum oder Zeitraum mit Kalender |
| `listelektilo` | Auswahlliste | neu | eine Wahl aus einer gestalteten Liste (Symbol, Beschreibung) |
| `plurelektilo` | Mehrfachauswahl | neu | mehrere Werte aus einer Liste, filterbar |
| `signeto` | Schlagwort | neu | Kategorie oder Filter, wählbar oder entfernbar |
| `lokredaktilo` | Inline-Bearbeitung | neu | ein Wert wird an Ort und Stelle zum Feld |

Der Satz, den diese Spec belegen soll:
> Jede übliche Eingabe einer Verwaltungsoberfläche (Menge, Zeitraum, Uhrzeit, Suche, Kategorie, Mehrfachwahl, schnelle Korrektur) hat ein Ero mit Kialo, und der Gvidanto schlägt es vor.

## Nicht im Scope
- Übernahme-Auswahl aus zwei Listen, Bedingungs-Editor: Vorschau-Stufe im Benchmark (Grenze ask-human)
- Zeitzonen- und Periodenwahl als eigene Felder: Grenze an `kampo kind=time` (ask-human)
- Die Zustände `warning` und `skeleton` für **alle** Eroj: Querschnitt Q (eigene Spec). Die neuen Eroj sehen sie in der Skemo-Struktur vor, aktiviert werden sie in Q.

## Gemeinsame Festlegungen
- **G1–G5 und G10 aus Spec 014/015 gelten:**
  - Achsen- und Zustandsnamen
  - keine neuen Tokens (E1)
  - Icons nur über `ikono` (höchstens +6 Namen: `calendar`, `clock`, `search`, `add`, `subtract`, `edit`)
  - A11y nach APG
  - Projekcioj, Parität, Tests
- **Ero-Tokens (Spec 024 R2):** Die neuen Eroj legen alle Teile und Zustände im Skemo so an, dass ihre Ero-Tokens mechanisch entstehen. Läuft Spec 024 R2 parallel, rebased diese Runde danach und erzeugt neu.
- **Ereignisse im Skemo:** Jedes neue Ero nennt seine Ereignisse (`change`, `input`, abbrechbare wie `remove`) im Skemo. Das ist der erste Schritt zu Lücke 7. Falls das Skemo dafür kein Feld hat, gehört es in diese Runde, als kleinste Änderung nach Regel 0.2 und im plan festgehalten.
- **`readonly`:** Alle neuen Eingabe-Eroj kennen `readonly`, als Zustand oder Prop, wie `kampo` es heute tut (Regel 0.1).
- **Uzo-Verflechtung (G2):**
  - `kampo kind=number` ↔ `glitilo`: genauer Wert → Feld; ungefährer Wert in Grenzen → Regler (immer mit Eingabefeld daneben möglich)
  - `kampo kind=date` ↔ `datelektilo`: bekanntes Datum weit weg (Geburtstag) → Feld; Datum in der Nähe oder Zeitraum → Auswahl mit Kalender
  - `elektilo` ↔ `listelektilo`: native Liste ist der Standard; die gestaltete Liste nur, wenn Optionen Symbol oder Beschreibung brauchen
  - `kompletigilo` ↔ `plurelektilo`: eine Wahl mit Freitext → Kombinationsfeld; mehrere Werte → Mehrfachauswahl
  - `markobutono`-Gruppe ↔ `plurelektilo`: bis etwa 7 Optionen sichtbar als Kästchen, darüber Mehrfachauswahl
  - `insigno` ↔ `signeto`: Status (nur lesen) → insigno; Kategorie, Filter, entfernbar oder wählbar → signeto
  - `kampo` ↔ `lokredaktilo`: Formular → Feld; ein einzelner Wert in einer Ansicht → Inline-Bearbeitung
- **G3 Stichwörter:** `goal-keyword-shared` vor jedem neuen Wort prüfen. Die falschen Freunde aus Nachlese 8 gelten (Wortgrenze, Kompositum-Maß).
- **G4 Text-Regeln:**
  - Ausgeweitet werden die Feldregeln des `kampo` (Beschriftung als Substantiv, Fehler sagt, was zu tun ist, Hilfe ein Satz) auf alle neuen Eingabe-Eroj.
  - Neu, höchstens eine: `range-stated` (anpassbar). Ein `glitilo` und ein `kampo kind=number` mit Grenzen nennen die Grenzen sichtbar (Beschriftung an den Enden oder Hilfetext). Kialo: Wer die Grenze erst beim Fehler erfährt, rät zweimal.

## ① `kampo`-Ergänzungen und `glitilo`
### `kampo` – Ergänzungen (Arkitekturo-Vertrag: nichts umbenennen)
- `kind=number`:
  - optionale Schrittknöpfe (Prop `stepper`, boolesch, Default false), `min`, `max`, `step`
  - Knöpfe mit `ikono subtract/add`, Namen „Verringern“ und „Erhöhen“ (`a11y.texts`)
  - Pfeiltasten wie nativ
- `kind=search`:
  - Löschen-Knopf (`ikono close`, Name „Suche leeren“), sobald ein Wert da ist; Escape leert
  - Rolle bleibt `searchbox`; die Landmarke `search` setzt der Container (filtrilo, sxelo)
- `kind=time`: native Zeiteingabe, Format aus `lang`. Boundary `time-zone` ask-human.

### `glitilo` – Schieberegler
- **purpose:** „Sets a value, or a range between two values, within known limits by dragging or with the keys.“
- **Props:**
  - `label` (Pflicht), `min`, `max`, `step`
  - `value` oder, bei `range`, `value-start` und `value-end`
  - `range` (boolesch)
  - `input` (boolesch: Eingabefeld daneben)
  - `disabled`, `readonly`, `required`
- **Slots:** `label`, `help`, `error`, `min-label`, `max-label`
- **Teile:** `track`, `fill` (gefüllter Teil), `thumb` (Mindestzielgröße `size.target.min`), `input`
- **Zustände:** am `thumb`: rest, hover, focus, active (gezogen), disabled; am Ganzen: invalid
- **A11y:**
  - APG Slider und Multi-Thumb Slider, `role=slider` mit `aria-valuenow/min/max/valuetext`
  - Tasten: Pfeile, Bild auf und ab (×10), Pos1 und Ende
  - In RTL gespiegelt
- **Uzo:**
  - instead: `exact-value` → kampo (number)
  - boundary: `vertical` ask-human, `ticks-with-labels` ask-human
  - content: `range-stated`
- **Figma:** einzeln, Bereich, mit Eingabefeld, deaktiviert

## ② `datelektilo`
### `datelektilo` – Datumsauswahl
- **purpose:** „Lets a person choose a date or a date range near today, typed or picked from a calendar.“
- **Props:**
  - `label` (Pflicht)
  - `mode: single | range` (Default `single`)
  - `value` (ISO-Datum) bzw. `value-start` und `value-end`
  - `min`, `max`, `disabled-dates` (Liste oder Regel `weekends`)
  - `disabled`, `readonly`, `required`
  - Erster Wochentag und Format kommen aus `lang`, also keine eigenen Props.
- **Slots:** `label`, `help`, `error`
- **Teile:**
  - `field` (Texteingabe mit Formatmaske; Freitext ist immer möglich)
  - `trigger` (`ikono calendar`, Name „Kalender öffnen“)
  - `calendar` als Overlay über den vorhandenen Overlay-Mechanismus aus Spec 014: Kopf mit Monat und Jahr, `prev` und `next`, Raster der Tage
  - Tageszelle mit den Zuständen rest, hover, focus, selected, in-range, today, disabled, outside-month
- **Verhalten:**
  - Eingabe und Kalender bleiben synchron.
  - Ein ungültiges Datum macht das Feld ungültig, mit einem Fehlertext nach `error-says-what-to-do` und Beispielformat.
  - Bei `range` ist der Endwert ≥ Startwert.
- **A11y:**
  - APG Date Picker Dialog: Raster mit Pfeilen, Bild auf und ab (Monat), Umschalt + Bild (Jahr), Pos1 und Ende (Woche)
  - Escape schließt und gibt den Fokus an den Auslöser zurück.
  - Ansagen in der Live-Region
- **Uzo:**
  - instead: `birthday` → kampo (date), Kialo: weit zurückliegende Daten tippt man schneller
  - boundary: `time-of-day` → kampo (time), `multiple-months` ask-human, `presets` (Letzte 7 Tage …) ask-human
- **Figma:** geschlossen, offen einzeln, offen Bereich, Fehler

## ③ `listelektilo`, `plurelektilo`, `signeto`, `lokredaktilo`
### `listelektilo` – Auswahlliste
- **purpose:** „Chooses one option from a styled list when options need an icon or a description.“
- **Props:** `label`, `value`, `placeholder`, `disabled`, `readonly`, `required`
- **Slots:** `label`, `help`, `error`, `options` (je Option Text, optional `ikono`, optional Beschreibung, `disabled`)
- **Teile:** `trigger` (wie `elektilo`), `listbox` als Overlay, `option` (rest, hover, focus, selected, disabled)
- **A11y:** APG Select-Only Combobox: Tippen springt zum Anfangsbuchstaben, Pfeile, Enter, Escape. Formularwert per `ElementInternals`.
- **Uzo:**
  - instead: `plain-options` → elektilo, Kialo: Die native Liste ist auf jedem Gerät am besten bedienbar
  - boundary: `search-in-list` → kompletigilo
- **Figma:** zu, offen, mit Symbolen und Beschreibungen

### `plurelektilo` – Mehrfachauswahl
- **purpose:** „Chooses several values from a long list, filterable, and shows the chosen ones as removable tags.“
- **Props:** `label`, `values` (Liste), `filterable` (boolesch), `max` (optional), `disabled`, `readonly`, `required`
- **Slots:** `label`, `help`, `error`, `options`
- **Teile:**
  - `trigger` mit Zähler („3 gewählt“) oder den gewählten Werten als `signeto` (komponiert, entfernbar)
  - `listbox` mit Kästchen je Option; Gewählte stehen beim Öffnen oben
  - „Alle abwählen“ als `butono emphasis=low`
- **A11y:** APG Listbox (Mehrfach) bzw. Combobox mit Listbox, wenn `filterable`. Die Zahl der Gewählten wird angesagt.
- **Uzo:**
  - instead: `few-options` → markobutono-Gruppe (bis 7), `one-value` → elektilo, kompletigilo oder listelektilo
  - boundary: `create-new-value` ask-human
- **Figma:** leer, 3 gewählt als Zähler, 3 gewählt als Schlagwörter, offen gefiltert

### `signeto` – Schlagwort
- **purpose:** „Labels something with a category; can be chosen as a filter or removed.“
- **Props:**
  - `mode: static | selectable | removable` (Default `static`)
  - `selected` (bei selectable), `size: small | medium`
  - `tone` aus vorhandenen Rollen (neutral und die Statusrollen), **keine** freie Farbskala (E1)
- **Slots:** Standard (Text), optional `ikono` am Anfang
- **Teile:** `surface` (`radius.full` über die Rolle), `remove` (`butono emphasis=low` mit `ikono close`, Name „‹Text› entfernen“)
- **A11y:**
  - selectable → `button` mit `aria-pressed`; removable → Text plus Entfernen-Knopf
  - Nach dem Entfernen geht der Fokus zum nächsten Schlagwort oder zum Container.
- **Uzo:**
  - instead: `status` → insigno
  - boundary: `color-coded-categories` ask-human (Kialo: Farbe allein trägt keine Bedeutung)
- **Figma:** `mode` × `size`, mit Symbol

### `lokredaktilo` – Inline-Bearbeitung
- **purpose:** „Turns a single value in a view into a field on the spot, with save and cancel.“
- **Props:** `label` (Pflicht, auch wenn verborgen), `value`, `kind` (Texte wie `kampo`: text, number, email, url), `disabled`
- **Teile:**
  - `display` (Wert plus `ikono edit` als Knopf mit Namen „‹Label› bearbeiten“)
  - `field` (komponiert `kampo`)
  - `save` und `cancel` (komponiert `butono`)
- **Verhalten:**
  - Enter speichert, Escape verwirft.
  - Danach liegt der Fokus wieder auf dem Bearbeiten-Knopf.
  - Ein Fehler hält das Feld offen.
  - Ereignis `save` ist abbrechbar, damit die Anwendung prüfen kann.
- **Uzo:**
  - instead: `form` → formularo
  - boundary: `multi-field-edit` → formularo, `autosave` ask-human
- **Figma:** Anzeige, Bearbeitung, Fehler

## Gvidanto (Beispiel-Dialoge, MCP-Test)
> „Menge zwischen 1 und 10 mit Plus und Minus“ → `kampo kind=number stepper` mit `range-stated`

> „Preisbereich von bis“ → `glitilo range input`

> „Zeitraum für den Bericht“ → `datelektilo mode=range`

> „Geburtsdatum“ → `kampo kind=date` (Kialo aus `datelektilo.instead.birthday`)

> „Ich brauche eine Auswahl mit Symbolen und Beschreibung“ → `listelektilo`

> „Mehrere Standards zuordnen“ → `plurelektilo`; bei 4 Optionen: markobutono-Gruppe

> „Kategorie-Filter zum Anklicken“ → `signeto mode=selectable`

> „Titel direkt in der Detailansicht ändern“ → `lokredaktilo`

> „Suchfeld über der Liste“ → `filtrilo` mit `kampo kind=search` (Sxablono zuerst, D-11)

## Abnahme (je PR, wie 015)
1. `brief` ≤ 750 je Ero. Beispiel-Dialoge grün, alle Dialoge aus 008–024 unverändert grün, gekippte mit Jugxo.
2. Vitrino: Abschnitt je Ero, alles mit der Tastatur bedienbar, RTL gespiegelt, alle drei Marken.
3. Figma: neue Sets im Frame „Eroj“, Moduswechsel und Markenwechsel im Build mit den Testmarken, neue leere Datei.
4. Parität **40 Eroj**, Alirebleco, Internacia, CI ≤ 12 min.
5. Benchmark-Kennzahlen im plan: Gattungen mit Gegenstück 27 → 33 (+ Zahl, Suche, Zeit als Ergänzung); Zustände, Props, Slots und Ereignisse neu gezählt.
6. Arkitekturo-Vertrag: `kampo` unverändert für vorhandene Nutzung (Test gegen `docs/fundamento-nutzung-0.2.0.md`, falls vorhanden, sonst 0.1.0).

## Entscheidungen (gelten, bis der Maintainer widerspricht)
- **E1** Keine neuen Tokens. Was fehlt, ist ein Manko.
- **E2** Achsen- und Zustandsnamen wie bisher. `in-range`, `today` und `outside-month` sind Zustände an der Tageszelle; P0 prüft, ob das Vokabular sie schon kennt, sonst sind sie die kleinste Ergänzung.
- **E3** Zustände am bedienten Teil.
- **E4 Namen:** `glitilo`, `datelektilo`, `listelektilo`, `plurelektilo`, `signeto`, `lokredaktilo`. Der Maintainer bestätigt sie bei ①.
- **E5** Regeln ausweiten, neu nur `range-stated`.
- **E6** Die native Eingabe bleibt der Kern, wo es sie gibt (Zahl, Datum, Zeit, Auswahl). Gestaltete Varianten sind Zusatz mit Kialo.
- **E7** Drei PRs gestapelt, ① von `main`.

## Benchmark (Art. V)
- **APG:** Slider, Multi-Thumb Slider, Spinbutton, Date Picker Dialog, Listbox, Select-Only Combobox, Combobox
- **WCAG 2.2:** 1.3.1, 2.1.1, 2.5.7 (Ziehen hat eine Alternative ohne Ziehen), 3.3.1, 3.3.2, 4.1.2, 4.1.3
- **GOV.UK:** Date input; **USWDS:** Date picker, Date range picker, Range slider
- Abstrahierte Checklisten: `research/benchmark-carbon-2026-10.md` § 2.2 und 2.3 (keine Inhalte des Benchmarks)

## Auftrag P0
- Rote Tests zuerst. Je PR ein Bericht im bekannten Format, dazu die Benchmark-Kennzahlen.
- Im plan steht eine Messanleitung mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, mit `cd` und `file://`-Links; für Figma der Build mit Testmarken und eine neue leere Datei.
- **Clean Room:** Du öffnest keine fremden Systeme. Grundlage ist diese Spec samt `research/benchmark-carbon-2026-10.md`.
- privata kommt nirgends vor.
