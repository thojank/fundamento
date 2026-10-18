# Spec 015 – Eroj in der Breite, Runde 4: Blättern, Pfad, Hochladen, Karte, Avatar

**Branch-Familie:** `015-eroj-runde-4` (drei gestapelte PRs) · **Status:** Entwurf · **Constitution:** kein Amendment · **Erstellt:** 2026-10-17 · **Voraussetzung:** `main` nach dem Merge von Spec 014 ⑤ (26 Eroj, Ikonaro, Overlays) · **Phase:** 4 · **Zielpfad:** `specs/015-eroj-runde-4/spec.md` · **Roadmap:** Etappe 4; danach Release 0.1.0 (Etappe 5)

## Zweck

Das ist die letzte Runde der Eroj vor dem stabilen Stand 0.1.0. Sie bringt **fünf Eroj**, die fast jede Verwaltungsoberfläche braucht. Den Toast bekommt Fundamento bewusst **nicht** als Ero (E6).

| Ero (Arbeitsname) | Deutsch | Familie | schließt |
|---|---|---|---|
| `pagxigilo` | Seitenblättern | Navigation | `tabelo.boundary.pagination` |
| `spuro` | Brotkrumen (Pfad) | Navigation | `navigado.boundary.breadcrumb` |
| `alsxutilo` | Datei hochladen | Eingabe | Dateiauswahl im Formular |
| `karto` | Karte | Inhalt | Inhalt als Einheit mit Titel, Bild und Aktionen |
| `avataro` | Avatar | Inhalt | Person oder Objekt als Bild oder Initialen |

Der Satz, den diese Spec belegen soll:

> Mit 31 Eroj baut ein Agent eine Verwaltungsoberfläche vollständig (Liste mit Blättern, Pfad, Detail, Formular mit Datei, Karten, Personen), ohne einen Baustein nachzubauen.

## Nicht im Scope
- **Toast:** Er wird eine Grenze am `avizo` mit Jugxo (E6).
- Hochladen mit Fortschritt, Wiederaufnahme oder Vorschau von Bildern. Die Auswahl ist das Ero, der Upload gehört der Anwendung (Grenze `upload-progress`, ask-human).
- Endloses Scrollen, „Mehr laden“ als eigenes Ero (Grenze am `pagxigilo`, `use-instead: butono`).
- Klickbare ganze Karte (Grenze `clickable-card`, ask-human, Kialo: Verschachtelte Bedienelemente in einem Link sind für Tastatur und Screenreader kaputt).
- Avatar-Gruppen, Status-Punkt am Avatar.

## Gemeinsame Festlegungen
- **G1–G3, G5, G10 aus Spec 014 gelten**:
  - Achsen- und Zustandsnamen
  - keine neuen Tokens
  - Icons nur über `ikono` (Pfeile und Trenner: `chevron-left`, `chevron-right`, `close`, `upload`, nach Bedarf ins Ikonaro, höchstens +4 Namen)
  - A11y nach APG
  - Projekcioj, Parität und Tests wie gehabt
- **G2 Uzo-Verflechtung:**
  - `tabelo.boundary.pagination` → `use-instead: pagxigilo`
  - `navigado.boundary.breadcrumb` → `use-instead: spuro`
  - `kampo`: neues `instead` `file` → `alsxutilo`
  - `atributlisto` ↔ `karto`: ein Datensatz als Liste oder als Einheit mit Bild und Aktionen
  - `avizo` ↔ `karto`: Meldung oder Inhalt
  - `insigno` ↔ `avataro`: Status oder Person
  - `pagxigilo` ↔ `langetaro`: Seiten einer Liste oder Ansichten einer Sache
  - `spuro` ↔ `navigado`: Ort in der Hierarchie oder Hauptnavigation
- **G3 Stichwörter:**
  - `goal-keyword-shared` vor jedem neuen Wort prüfen.
  - „Pagination“, „Seiten“, „blättern“, „pager“ → `pagxigilo`. „pages“ steht schon bei `tabelo` als Grenze und wird zu `use-instead`.
  - „Breadcrumb“, „Brotkrumen“, „Pfad“, „wo bin ich“ → `spuro`.
  - „Upload“, „Datei“, „Anhang“, „file input“, „attachment“ → `alsxutilo`.
  - „Karte“, „Kachel“, „card“, „tile“ → `karto`.
  - „Avatar“, „Profilbild“, „Initialen“ → `avataro`.
- **G4 Text-Regeln:**
  - **Ausgeweitet (E5):**
    - `link-label-names-destination` → Einträge von `spuro`
    - Feldregeln des `kampo` → `alsxutilo`
    - `one-primary-per-container` → Aktionen der `karto`
    - `icon-meaning-named` → `avataro` (Bild ohne Namen)
  - **Neu (höchstens eine):** `file-constraints-stated` (anpassbar). Ist `accept` oder `max-size` gesetzt, nennt der Hilfetext erlaubte Arten und Größe, zum Beispiel „PDF oder PNG, höchstens 5 MB“. Geprüft wird über die vorhandene Prüfart Slot-Constraint (`prop:accept filled ⇒ slot:help filled`), also ohne neue Prüfart. Kialo: Wer die Grenzen erst nach dem Fehler erfährt, macht den Fehler zweimal.

## ① Navigation: `pagxigilo`, `spuro`

### `pagxigilo` – Seitenblättern
- **purpose:** „Moves through the pages of a long list and shows which page is current.“
- **Props:**
  - `page` (Pflicht, ab 1), `total-pages` (Pflicht)
  - `label` (Name der Landmarke, Default aus `a11y.texts` „Seitenblättern“)
  - `mode: link | button` (Default `button` mit Ereignis `page-change`, abbrechbar). `link` mit `href-template` (`?page={page}`).
  - `siblings` (Default 1, Seiten links und rechts der aktuellen)
- **Zustände:** am Eintrag rest, hover, focus, disabled (Zurück auf Seite 1, Weiter auf der letzten) und `current` (`SkemoSlot.entry`).
- **Teile:**
  - `item` (Mindestzielgröße `size.target.min`, `radius.role.control`)
  - `current` (Gewicht und Rand `border.width.strong`, nie nur Farbe)
  - `ellipsis` („…“, nicht fokussierbar, `aria-hidden`, gesprochen nichts)
  - `prev`/`next` (`ikono chevron-left/right`, in RTL gespiegelt, Text aus `a11y.texts` „Vorherige Seite“, „Nächste Seite“, sichtbar ab `viewport=medium`)
- **A11y:** `nav` mit Namen, `aria-current="page"`. Jede Zahl hat einen gesprochenen Namen („Seite 3“).
- **Uzo:**
  - instead: `load-more` → butono, `views` → langetaro
  - boundary: `infinite-scroll` ask-human, `page-size-select` ask-human (dafür gibt es den `elektilo`)
  - composes: tabelo (unter der Tabelle)
- **Figma:** Seite 1, 5 und 10 von 10. Schmal und breit.

### `spuro` – Brotkrumen
- **purpose:** „Shows where the current page sits in a hierarchy and links back up to each level.“
- **Props:** `label` (Default „Brotkrumen“ bzw. „Pfad“, P0 schlägt vor, der Maintainer bestätigt bei ①).
- **Slots:** `items` (Pflicht, min 2; je Eintrag Text und Ziel; der letzte ist die aktuelle Seite ohne Ziel).
- **Teile:**
  - `item` (`ligilo`-Darstellung)
  - `separator` (`ikono chevron-right`, dekorativ, in RTL gespiegelt)
  - `current` (Text, `aria-current="page"`, kein Link)
- **A11y:** `nav` mit Namen, geordnete Liste.
- **Uzo:**
  - instead: `main-navigation` → navigado, `steps` → ask-human (wie bei navigado)
  - boundary: `collapsed-middle` ask-human (lange Pfade kürzen braucht ein Overlay)
  - layout: wrap allowed
  - content: `link-label-names-destination` ausgeweitet
- **Figma:** drei Ebenen.

## ② Eingabe: `alsxutilo`

### `alsxutilo` – Datei hochladen
- **purpose:** „Lets a person choose one or more files to send with a form, and states which files are allowed.“
- **Props:** wie `kampo` (`label`, `help`, `error`, `required`, `disabled`), dazu `accept` (Liste von Typen), `multiple` (boolesch), `max-size` (Bytes), `dropzone` (boolesch, Default false).
- **Zustände:** wie `kampo`; dazu `dragover` (nur bei `dropzone`, Rand `stroke.dashed` → `stroke.solid` und Fläche `color.background.sunken`).
- **Slots:** `label`, `help`, `error`. Die gewählten Dateien erscheinen als Liste: Name, Größe und Entfernen als komponierter `butono emphasis=low` mit `ikono close` und Namen „‹Datei› entfernen“.
- **Teile:** die Schaltfläche „Datei auswählen“ (komponierter `butono emphasis=medium` mit `ikono upload`), `dropzone` (gestrichelter Rand), `file-list`.
- **Verhalten:**
  - form-associated (`ElementInternals`), Wert sind die Dateien.
  - Falscher Typ oder zu groß: Das Feld wird ungültig, und der Fehlertext folgt `error-says-what-to-do` (Text aus `a11y.texts` mit Platzhaltern für Typ und Größe).
  - Die Zahl der gewählten Dateien wird angesagt (Live-Region).
- **A11y:** Natives `input type=file` als Kern, nur visuell neu gestaltet. Die Ablagezone ist ein Zusatz; ohne Maus geht alles über die Schaltfläche.
- **Uzo:**
  - instead: `text-input` → kampo
  - boundary: `upload-progress` ask-human, `image-preview` ask-human, `camera-capture` not-supported
  - content: Feldregeln ausgeweitet, `file-constraints-stated`
- **Figma:** leer, mit zwei Dateien, Fehler, Ablagezone `dragover`.

## ③ Inhalt: `karto`, `avataro`, Toast als Grenze

### `karto` – Karte
- **purpose:** „Groups content about one thing into a unit: a heading, optional image and text, and up to two actions.“
- **Props:** `level` (Ebene der Überschrift, durchgereicht an `titolo`, Pflicht), `orientation: vertical | horizontal` (Default vertical).
- **Slots:** `heading` (Pflicht, komponiert `titolo`), `media` (optional, Bild mit `alt`, oder dekorativ mit `alt=""`), Standard (Inhalt, `teksto`), `meta` (optional, z. B. `insigno`, `avataro`), `actions` (optional, höchstens zwei `butono`, `one-primary-per-container`).
- **Teile:** `surface` (`color.background.raised`, `color.border.subtle`, `radius.role.surface`, `elevation.shadow.raised`), Abstände aus `size.scale`/`spacing.*` über `density`.
- **A11y:** `article`, wenn der Inhalt für sich steht, sonst `section`. Entscheidung über Prop `standalone` (boolesch, Default true). Benannt durch die Überschrift.
- **Uzo:**
  - instead: `data-record` → atributlisto, `notice` → avizo, `layout-box` → ask-human (Kialo: Eine Karte ist Inhalt, kein Rahmen für das Layout)
  - boundary: `clickable-card` ask-human, `card-grid` ask-human (das Raster ist ein Sxablono)
  - layout: Breite füllt den Container, `horizontal` stapelt unter `size.container.small` (Container-Query wie `atributlisto layout=auto`)
- **Figma:** vertical, horizontal, mit und ohne Bild.

### `avataro` – Avatar
- **purpose:** „Represents a person or thing with a picture or initials.“
- **Props:** `name` (Pflicht), `src` (optional), `size: small | medium | large` (`size.icon.*`, bei large `size.control.large`), `decorative` (boolesch, Default false; true, wenn der Name direkt daneben steht).
- **Teile:**
  - `image` (rund, `radius.full`)
  - `initials`: aus `name`, Graphem-sicher (`Intl.Segmenter`), höchstens zwei Zeichen. Fläche `color.background.sunken`, Text `color.text.subtle`, `typography.label.*`.
  - **Keine Farbe aus dem Namen errechnet** (Kialo: Farbe ohne Bedeutung lenkt ab und hält keinen Kontrast in jeder Marke).
- **Verhalten:** Bild lädt nicht → Initialen.
- **A11y:** `role="img"` mit Namen = `name`, oder `aria-hidden`, wenn dekorativ.
- **Uzo:**
  - instead: `status` → insigno, `logo` → ask-human
  - boundary: `avatar-group` ask-human, `presence-dot` ask-human
  - content: `icon-meaning-named` ausgeweitet
- **Figma:** `size` × Bild/Initialen.

### Toast – kein Ero (E6)
- `avizo.boundary.toast` bleibt `ask-human`, mit neuer Kialo: Eine Meldung, die von selbst verschwindet, verpasst, wer langsam liest, vergrößert oder den Fokus woanders hat (WCAG 2.2.1, 4.1.3). Eine Rückmeldung bleibt im Fluss der Seite als `avizo` stehen, bis sie geschlossen wird.
- Ein Jugxo hält die Entscheidung fest, mit Benchmark-Verweis (GOV.UK verzichtet auf Toasts).
- Der Gvidanto antwortet auf „Toast“ und „Snackbar“ mit `avizo` (Stichwörter am `avizo`-Goal als Synonym, nicht als eigenes Goal).

## Gvidanto (Beispiel-Dialoge, MCP-Test)
> „Pagination unter der Tabelle“ → `pagxigilo` (Kialo aus `tabelo.boundary.pagination`).

> „Breadcrumb oben auf der Detailseite“ → `spuro`.

> „Feld für den Lebenslauf als PDF“ → `alsxutilo` mit `accept` und Hilfetext „PDF, höchstens 5 MB“ (Regel `file-constraints-stated`).

> „Toast nach dem Speichern“ → `avizo intent=success` im Fluss, mit Kialo aus `avizo.boundary.toast`.

> „Projektkarten mit Bild“ → `karto`; als Raster: Rückfrage (Grenze `card-grid`).

## Abnahme (je PR, wie 014)
1. `brief` ≤ 750, Beispiel-Dialoge grün, alle Dialoge aus 008–014 unverändert grün.
2. Figma: neue Sets im Frame „Eroj“, Moduswechsel, Icons gezeichnet.
3. Vitrino: Abschnitt je Ero, Blättern und Hochladen bedienbar (Tastatur), Initialen bei kaputtem Bild.
4. Parität **31 Eroj**, Alirebleco, Internacia (RTL: Pfeile gespiegelt; Initialen mit kombinierenden Zeichen), CI ≤ 12 min.
5. Arkitekturo-Abdeckung, Ontologio, Make-Guidelines, Vojmapo Zeile 4 (Runde 4 vollständig, Phase 4 Eroj abgeschlossen bis auf Sxablonoj).

## Nach der Abnahme: Release 0.1.0 (Maintainer)
1. Version `0.1.0` im Workflow `release.yml` (dry-run, dann publish).
2. `npm dist-tag add @fundamento/make-kit-komuna@0.1.0 latest` und dasselbe für ekzemplo.
3. Arkitekturo auf 0.1.0 heben und die beobachtete Nutzung (G8 aus Spec 011) neu einlesen. Den Text dafür schreibt Claude.

## Entscheidungen (gelten, bis der Maintainer widerspricht)
- **E1** Keine neuen Tokens.
- **E2** Achsen- und Zustandsnamen wie bisher.
- **E3** Zustände am bedienten Teil.
- **E4 Namen:** `pagxigilo`, `spuro`, `alsxutilo`, `karto`, `avataro`. Änderbar bis zum Merge von ①; der Name für ③ (`karto`, `avataro`) bis zum Merge von ②.
- **E5** Regeln ausweiten, neu nur `file-constraints-stated`.
- **E6** Kein Toast-Ero; Grenze mit Kialo am `avizo`.
- **E7** Der Upload selbst gehört der Anwendung; das Ero wählt Dateien und prüft Typ und Größe.
- **E8** Keine errechneten Avatar-Farben.
- **E9** Drei PRs gestapelt, ① von `main`.

## Benchmark (Art. V)
- APG: Breadcrumb, Landmarks; WCAG 2.2: 1.3.1, 2.2.1, 2.4.4, 2.4.8, 3.3.1, 3.3.2, 4.1.3.
- GOV.UK: Pagination, Breadcrumbs, File upload, kein Toast (Notification banner). USWDS: Pagination, Breadcrumb, File input, Card.
