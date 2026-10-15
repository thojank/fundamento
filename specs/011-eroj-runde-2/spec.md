# Spec 011 – Eroj in der Breite, Runde 2: Eingabe, Overlay, Rückmeldung, Daten, Navigation

**Branch-Familie:** `011-eroj-runde-2` (fünf gestapelte PRs, Reihenfolge unten) · **Status:** Entwurf · **Constitution:** kein Amendment · **Erstellt:** 2026-10-15 · **Voraussetzung:** `main` fcccab5 (sieben Eroj, Spec 010 abgenommen) · **Phase:** 4 (Eroj in der Breite: Formular, Feedback, Daten, Navigation) · **Zielpfad:** `specs/011-eroj-runde-2/spec.md`

## Zweck

Arkitekturo, Thorstens Standards-Modul, ist der erste Abnehmer von Fundamento. Es nutzt das Make Kit `@fundamento/make-kit-komuna@0.1.0-next.3` und hat für seine Web-Oberfläche 19 Bausteine selbst gebaut, nur auf `--fm-*`-Variablen. Dazu kommen acht benannte Lücken in den vorhandenen Eroj. Die Liste steht als Text in `.fundamento/spec011/arkitekturo-kandidaten-2026-10-15.md` (Kopie von `arkitekturo/packages/ui/KANDIDATEN-FUER-FUNDAMENTO.md`).

Diese Spec macht aus diesem Bedarf zehn neue Eroj und schließt drei Lücken in vorhandenen Eroj. Außerdem räumt sie die offenen Punkte aus Spec 010 auf (Nachlese 2).

| Ero (Arbeitsname) | Deutsch | Familie | Vorlage in Arkitekturo | schließt |
|---|---|---|---|---|
| `tekstareo` | mehrzeiliges Textfeld | Eingabe | ark-textarea | kampo `multi-line` (heute `null`) |
| `dialogo` | Dialog | Overlay | ark-dialog, openFormDialog | Bestätigung, Entscheidung mit Begründung |
| `insigno` | Statusetikett (Badge) | Rückmeldung | ark-badge | Status als Wort neben einem Titel |
| `avizo` | Hinweis | Rückmeldung | ark-notice | Info/Erfolg/Warnung/Fehler im Seitenfluss |
| `plenstato` | Lade- und Leerzustand | Rückmeldung | ark-state | „lädt“ und „nichts da“ einer Fläche |
| `tabelo` | Datentabelle | Daten | ark-table | Zeilen × Spalten mit Beschriftung |
| `atributlisto` | Schlüssel-Wert-Liste | Daten | ark-keyvalue | Metadaten eines Datensatzes |
| `mezurilo` | Messbalken | Daten | Lücke „Prozentanzeige“ | ein Wert in einem Bereich |
| `navigado` | Navigation | Navigation | ark-nav | Hauptnavigation mit aktueller Seite |
| `langetaro` | Reiter | Navigation | ark-tabs | Ansichtswechsel innerhalb einer Seite |

Erweiterungen vorhandener Eroj:

| Ero | Erweiterung | Lücke in Arkitekturo |
|---|---|---|
| `kampo` | `kind`: `password`, `number` (ganze Zahl), `date` | Token-Anmeldung, „Vorrang“, Ablaufdatum |
| `kampo` | Formular-Gültigkeit und Absenden mit Enter | O-7 aus Spec 010; Enter-Lücke |
| `elektilo` | wählbare leere Option (`empty-label`) | Option „Alle“ / „keine Auswahl“ erscheint doppelt |

Der Satz, den diese Spec belegen soll:

> Ein Agent, der eine Verwaltungsoberfläche baut (Liste, Detail, Formular, Bestätigung, Rückmeldung), findet jeden Baustein in Fundamento, mit Begründung, und baut keinen nach.

**Geschwindigkeit vor Breite (Maintainer, 14.10.):** Wie in Spec 010 bekommt jedes Ero den kleinsten vollständigen Umfang. Was fehlt, steht als Grenze in der Uzo und nicht stillschweigend.

**Arkitekturo ist Anforderung, nicht Quelle (Art. V sinngemäß).** Aus dem Arkitekturo-Repo wird kein Code übernommen. Die Eroj entstehen aus Skemo und Uzo über die Projekcioj wie alle anderen. Die Kandidatenliste liefert Zweck, API-Bedarf und Barrierefreiheit als Anforderung. Jedes Ero bekommt in plan.md eine Tabelle **„Arkitekturo-Abdeckung“**: was der Kandidat braucht, ob das Ero es trägt und, wenn nicht, welche Grenze es benennt.

## Nicht im Scope (alles als Grenze geführt)
- Seitenmuster: Shell, Seite, Formularanordnung, Filterleiste, Query-Filter. Das sind Kompositionen aus Eroj und selbst keine Eroj. Ob Fundamento dafür eine eigene Ebene („Sxablonoj“, Vojmapo Phase 4) bekommt, entscheidet eine eigene Spec.
- Inhalt: Markdown-Ansicht, Markdown-Editor, Befehl als Code. Kandidaten für eine spätere Runde „Inhalt“.
- Fachspezifisch, bleibt in Arkitekturo: Diff-Ansicht, Fundstelle. Wandert erst, wenn ein zweiter Abnehmer sie braucht.
- Tabelle: Auswahl von Zeilen, Seiten (Pagination), Bearbeiten in der Zelle, Zeilenaktionen als Menü, feste Kopfzeile, Spaltenbreite ziehen.
- Dialog: nicht-modale Dialoge, Seitenpaneel (Drawer), Toast.
- Navigation: Untermenüs, eingeklappte Navigation für schmale Ansichten (Hamburger).
- Reiter: Reiter, die mehr Platz brauchen, als da ist (Overflow), schließbare Reiter.
- kampo: Passwort anzeigen/verbergen, Dezimalzahlen, Zahl mit Pfeilen (`number-stepper` bleibt `not-supported`), Datumsbereich, eigener Kalender.
- Mehrfachauswahl, Suche in der Liste, Kontrollkästchen-Gruppe (aus Spec 010, unverändert offen).

## Gemeinsame Festlegungen (gelten für alle zehn Eroj)

**G1 – Achsennamen aus Spec 007/010 übernehmen.** Für Status heißt die Achse `intent`, wie beim `butono` seit F1. Werte je Ero: `neutral | info | success | warning | danger`. Eine Ton-Achse `tone` oder `variant` gibt es nicht. Es gibt auch keine `intent`-Stufe `brand`: Ein Etikett in Markenfarbe ist eine Grenze (`brand-badge`, ask-human), weil die Markenfarbe keinen Status sagt. `size` heißt wie beim `kampo` (`small | medium | large`), aber nur dort, wo die Größe eine sichtbare Wirkung hat.

**G2 – Zustände nur, wo es Interaktion gibt.** Eroj ohne Bedienung (`insigno`, `plenstato`, `atributlisto`, `mezurilo`) haben als Zustand nur `rest`. Die Figma-Sets zeigen dann nur ihre sichtbaren Achsen. Eroj mit Bedienung (`tekstareo`, `dialogo`, `tabelo` mit Sortierung, `navigado`, `langetaro`, `avizo` mit Schließen) folgen `rest | hover | focus | disabled` (+ `invalid` nur bei `tekstareo`). Der Zustand gehört dabei zu dem Teil, der bedient wird, nicht zum ganzen Ero (Muster `SkemoSlot.entry` aus Spec 010 ③, E7).

**G3 – Keine neuen Tokens (E1).** Alle Rollen sind im Vortaro vorhanden (gemessen am 15.10. auf fcccab5): `color.backdrop`, `elevation.layer.modal|toast`, `elevation.shadow.modal`, `color.status.{info,success,warning,danger}.{basic,border,on,subtle,text,weak}`, `color.navigation.{rest,hover,selected,text.rest,text.selected}`, `size.container.{small,medium,large}`, `motion.duration.*`, `motion.easing.standard`, `stroke.solid|dashed`, `size.target.min`, `color.background.{sunken,raised}`, `typography.code`, `radius.role.{control,pill,surface}`. Die Arkitekturo-Bausteine verwenden für dieselben Zwecke dieselben Rollen. Sie sind die erste Wahl, wenn die Spec keine andere nennt. Fehlt eine Rolle: nächstliegende nehmen und ein Manko führen.

**G4 – Interaktion plattformneutral, A11y nach APG.**
- `dialogo`: `dialog` mit `aria-modal`. Fokus beim Öffnen auf das erste sinnvolle Feld, sonst auf die Bestätigung. Beim Schließen geht der Fokus zurück zum Auslöser. Escape schließt. Die Fokusfalle stellt die Plattform (Web: natives `<dialog>` mit `showModal`).
- `langetaro`: `tablist`, `tab` und `tabpanel` mit Roving-Tabindex. Pfeiltasten, Pos1 und Ende wählen. Aktivierung automatisch (APG-Standard).
- `navigado`: `nav` mit Namen. Die aktuelle Seite hat `aria-current="page"` und ist nie nur über Farbe zu erkennen (zusätzlich fett und unterstrichen, wie bei `link-not-color-only`).
- `tabelo`: native Tabellensemantik, `caption` Pflicht. Spaltenköpfe haben `scope=col`, ein Zeilenkopf `scope=row`. Sortierung ist eine Schaltfläche im Kopf, ihr Zustand steht in `aria-sort`. Breite Tabellen scrollen in einer fokussierbaren, benannten Region.
- `avizo`: `danger` bekommt `role=alert`, die anderen `role=status`.
- `plenstato`: Laden bekommt `role=status` und `aria-busy`. Die Animation folgt `motion.duration.*`, damit bei reduzierter Bewegung nichts animiert (`motion-reduced-instant`).
- `mezurilo`: `role=meter` mit `aria-valuenow`, `aria-valuemin`, `aria-valuemax` und `aria-valuetext`. Ein unbekannter Wert ist **nicht 0**: Ohne `aria-valuenow` steht im `aria-valuetext` z. B. „nicht geprüft“.
- `insigno`: Text ist Pflicht. Die lange Fassung ist ein visuell verborgener Text, nie nur `title`.

Tasten nennen, wie in Spec 010 G4. Alle Eroj tragen `a11y.texts` (de/en) dort, wo die Plattform keinen Text liefert (z. B. „Schließen“, „aufsteigend sortiert“, „nicht geprüft“, „lädt“).

**G5 – Uzo-Verflechtung (Pflicht in jedem PR).** Jedes neue Ero schließt, wo es kann, eine Grenze oder ein `null` eines vorhandenen Ero:
- `kampo.instead.multi-line` → `use-instead: tekstareo`
- `kampo.boundary.password` → entfällt, wird `kind=password`
- `kampo.boundary.date` (ask-human) → entfällt, wird `kind=date`
- `number-stepper` bleibt `not-supported`
- `sxaltilo` und `markobutono` nennen `dialogo` in `composes`
- `butono`: neuer `instead`-Eintrag `confirm` → `dialogo` (Kialo: Eine Aktion, die nicht rückgängig zu machen ist, fragt vorher; die Frage ist ein Dialog, kein zweiter Button)
- Die neuen Eroj verweisen untereinander:
  - `insigno` ↔ `avizo` (Wort vs. Satz)
  - `avizo` ↔ `dialogo` (informiert vs. verlangt eine Entscheidung)
  - `tabelo` ↔ `atributlisto` (viele Datensätze vs. einer)
  - `mezurilo` ↔ `insigno` (Wert im Bereich vs. Zustand)
  - `navigado` ↔ `langetaro` (Seiten vs. Ansichten einer Seite)
  - `langetaro` ↔ `elekto` (Ansichtswechsel vs. Wahl in einem Formular)
  - `navigado` ↔ `ligilo` (Menge mit aktueller Seite vs. ein Link)
  - `plenstato` ↔ `butono` (Fläche lädt vs. eine Aktion lädt)
- Jedes `instead` auf ein vorhandenes Ero ist `use-instead`, nie `ask-human` (`uzo-boundary-covered`).

**G6 – Text-Regeln.** Je Regel ein Jugxo approved/rejected in de und en.
- **Ausgeweitet statt vervielfacht (E5 aus Spec 010):**
  - `field-label-visible`, `field-label-names-the-datum`, `help-is-one-sentence`, `error-says-what-to-do`, `error-not-color-only`, `required-marked` und `placeholder-not-label` → `tekstareo`
  - `error-says-what-to-do` → `avizo` mit `intent=danger`
  - `one-primary-per-container` → `dialogo` (Aktionen) und `avizo` (Aktionen)
  - `link-label-names-destination` und `link-not-color-only` → `navigado`
  - `option-labels-distinct` → `langetaro` (zwei Reiter heißen nie gleich)
- **Neu (je Kialo):**
  - `badge-text-short` (anpassbar): ein Etikett hat höchstens drei Wörter, z. B. „In Prüfung“ und nicht „Diese Version wird gerade geprüft“. Prüfart `max-words`. Kialo: ein Etikett wird überflogen, ein Satz gehört in einen Hinweis.
  - `dialog-title-names-the-decision` (anpassbar): Der Titel nennt die Entscheidung, z. B. „Version freigeben?“ und nicht „Bestätigung“ oder „Achtung“. Prüfart `not-words` gegen eine Liste leerer Titel. Kialo: Ein Dialog unterbricht, und sein Titel muss allein sagen, worum es geht.
  - `table-caption-names-the-content` (fest): Jede Tabelle hat eine Beschriftung, die sagt, was in den Zeilen steht. Sie darf visuell verborgen sein, fehlen darf sie nie. Kialo: Ein Screenreader nennt die Tabelle beim Betreten mit ihrer Beschriftung.
  - `meter-text-states-value` (fest): Der Textwert nennt Wert und Bezug, z. B. „66 % von 3 prüfbaren“, und ein unbekannter Wert heißt „nicht geprüft“, nie „0 %“. Kialo: Ein Balken ohne Zahl ist nur Farbe, und 0 ist eine Aussage.
  - `empty-state-says-what-next` (anpassbar): Ein Leerzustand nennt, was fehlt, und wenn möglich den nächsten Schritt, z. B. „Noch keine Standards. Lege den ersten an.“ Prüfart `min-words`, eine Näherung, im `scope` genannt.

**G7 – Projekcioj, Parität, Tests** wie Spec 010 G7:
- Web Component `fm-<ero>`. Form-associated sind `tekstareo` und, neu, `kampo` (E8).
- React-Projektion.
- Figma-Set (nur Achsen mit sichtbarer Wirkung, Platzierung im Frame „Eroj“ nach F-8).
- Make-Kit `components/<ero>.md` und je Ero ein Satz in den Guidelines, z. B. „Every confirmation before an irreversible action is a Dialogo …“.
- Vitrino-Abschnitt.
- MCP: `list_eroj` meldet 17 Eroj, `brief` je Ero ist gemessen (Grenze 750).
- Alirebleco (axe: dialog, tablist, navigation, table, meter, status, alert) in beiden Aspektoj.
- Internacia (RTL, Textexpansion: Reiter- und Navigationsbeschriftungen ×1,4).
- Fehlerfixtures zuerst rot. Je Ero mindestens: Pflicht-Slot leer, Web-Begriff in der Skemo, Uzo-instead ohne Kialo und je neue Regel ein rejected-Beispiel.

**G8 – Arkitekturo-Vertrag (neu).** Die 101 `--fm-*`-Variablen, die die Arkitekturo-Bausteine verwenden, werden als **beobachtete Nutzung** festgehalten: `packages/projekcioj/src/celoj/make-kit/observed-usage/arkitekturo.json`, mit Quelle und Datum. Ein Test im Make Kit prüft, dass jede dieser Variablen in `styles.css` des gebauten Kits existiert. Eine Umbenennung oder Entfernung macht den Test rot. Sie ist dann nur mit einem Jugxo erlaubt, der Ersatz und Abnehmer nennt. Damit gilt noch keine „stabile Menge“ für alle. Gesichert ist der eine bekannte Abnehmer, bis eine Constitution-Regel folgt (Vojmapo-Kandidat).

**G9 – Reihenfolge und Branches (E6).** Fünf PRs, gestapelt, jeder baut auf seinem Vorgänger auf. Ein PR kann mehrere Eroj enthalten, je Ero eigene Commits, und jeder PR ist für sich abnehmbar:
1. **① Grundlage:** Nachlese 2, G8-Vertrag, `kampo`-Erweiterungen, `elektilo` `empty-label`. Von `main`.
2. **② Eingabe und Overlay:** `tekstareo`, `dialogo`. Der Dialog nutzt das mehrzeilige Feld für die Begründung.
3. **③ Rückmeldung:** `insigno`, `avizo`, `plenstato`.
4. **④ Daten:** `tabelo`, `atributlisto`, `mezurilo`.
5. **⑤ Navigation:** `navigado`, `langetaro`.

Grund für ① zuerst: Die e2e-Laufzeit (O-21) wächst mit jedem Ero. Mit 17 Eroj muss sie strukturell gelöst sein, bevor zehn dazukommen. Bleibt ⑤ nachts unfertig, bleibt er offen, und ①–④ werden trotzdem gemessen.

## ① Grundlage

### Nachlese 2 (offene Punkte aus Spec 010; Entscheidungen gelten, bis der Maintainer widerspricht)
- **O-21:** Die e2e-Laufzeit strukturell lösen, zum Beispiel mit einem Server je Suite statt je Test oder mit Hooks je Ero. Ein höheres Timeout ist keine Lösung. Ziel: Die Laufzeit des e2e-Hooks ist in plan.md vorher und nachher gemessen, und der CI-Faktor 3 aus der Spec-010-Kette wird wieder entfernt.
- **O-3:** `brief.axes` nennt auch boolesche Achsen-Props (`checked`) und den Zustand einer Option (`selected`). `brief` danach je Ero neu messen. Überschreitet ein Ero die 750, dann Kürzung nach dem Muster von O-12 und kein Anheben der Grenze.
- **O-8:** `overflow-wrap` auf die Strukturliste des Stylesheet-Lints (Obergrenze 21 → 22), dazu ein Internacia-Test mit einem Wort, das länger ist als die Zeile.
- **Bestätigt, nur nachtragen (Jugxo oder Satz in plan.md 010):**
  - O-1, O-5, O-9, O-15: Figma-Vorgabewörter „Einstellung“, „Option“, „Frage“, „Auswahl“ (am 14.10. abgenommen)
  - O-4: `wrap: allowed`
  - O-6, O-14, O-19: Wortlaut des erweiterten Jugxo
  - O-10: Optionen als `<data slot="options">`
  - O-12: kürzere Kialo
  - O-13: `SkemoSlot.entry`
  - O-16: „Bitte wählen“
  - O-20: `describe_term`-Schema
- **O-18:** `mankoj.json` führt nur gemessene Werkzeuglücken. Lücken aus einer Entscheidung (E3) stehen als Grenze in der Uzo. Kein Schemawechsel.
- **O-11, O-17:** Diese Kandidaten (Prüfart über Prop + Einträge) gehen in Vojmapo Phase 6 zu den Regulo-Kandidaten und werden nicht umgesetzt.
- **Kontrast des Links (Befund aus Arkitekturo QA L6):** `color.link.rest|hover|visited` gegen `color.background.{canvas,default,raised,sunken}` in allen Aspektoj und Kombinationen messen. Fehlt ein KontrastParo, wird er deklariert. Liegt ein Wert unter 4.5:1, ist das ein **Befund** an den Maintainer und keine Token-Änderung (Regel 0.3).
- **O-7 / Enter:** siehe kampo unten.

### `kampo` – Erweiterungen
- **`kind` += `password | number | date`** (E8):
  - `password`: Die Eingabe ist verdeckt, `autocomplete` ist einstellbar (`current-password | new-password`). Anzeigen/Verbergen ist eine Grenze (`reveal-password`, ask-human).
  - `number`: nur ganze Zahlen. Web: `type=text`, `inputmode=numeric`, Prüfung auf Ziffern (Benchmark GOV.UK: kein `type=number`, weil Scrollrad und Pfeile Werte verändern). Props `min` und `max`. Ist der Wert keine ganze Zahl, ist das Feld ungültig, und der Fehlertext folgt `error-says-what-to-do`. `number-stepper` bleibt `not-supported`.
  - `date`: der Datumsdialog der Plattform (Web: `type=date`), Props `min` und `max`. Figma zeigt das geschlossene Feld, wie beim `elektilo` (E3), ohne Manko.
- **Formular-Gültigkeit (O-7):** `fm-kampo` wird form-associated (`ElementInternals`): Wert, `required`, `setValidity`, `formResetCallback`. Ein leeres Pflichtfeld verhindert das Absenden. Vorbild: `markobutono`, `elekto`, `elektilo`.
- **Enter sendet ab:** Enter in einem einzeiligen `kampo` löst das implizite Absenden des umgebenden `<form>` aus (`form.requestSubmit()`), wie bei einem nativen `input`. Test: Formular mit `kampo` und `butono type=submit`, Enter → `submit` genau einmal.
- Uzo nachziehen: Grenzen `password` und `date` entfallen, neuer Eintrag `reveal-password` (ask-human), `decimal` (not-supported), `date-range` (ask-human).

### `elektilo` – leere Option
- **Neue Prop `empty-label`** (Text): Wenn gesetzt, ist die erste Option wählbar, hat den Wert `""` und trägt diesen Text (z. B. „Alle“, „keine Auswahl“).
- Constraint: `empty-label` und `placeholder` schließen sich aus. Prüfung: Fixture mit beiden gesetzt → Fehler.
- Regel: `select-placeholder-is-prompt` gilt für `placeholder`. Für `empty-label` gilt `option-labels-distinct`, denn die leere Option ist eine Option.
- Web: keine zusätzliche gesperrte Option, wenn `empty-label` gesetzt ist. Damit ist „doppelt“ (QA L6 Punkt 4) behoben.

### G8-Vertrag
Siehe G8. Datei, Test und ein Satz in `docs/vojmapo.md` unter „Querschnitt“.

## ② Eingabe und Overlay

### `tekstareo` – mehrzeiliges Textfeld
- **purpose:** „Takes text that runs over several lines from a person: a comment, a description, a reason.“
- **Props:**
  - `value`, `rows` (Zahl, Default 4), `required`, `invalid`, `disabled`, `readonly`, `placeholder`, `name`, `size` wie kampo
  - `kind: text | code` (Default text): `code` setzt `typography.code` und schaltet die Rechtschreibprüfung aus. Arkitekturo braucht das für Markdown-Quelltext.
- **Zustände:** rest, hover, focus, disabled, invalid. **Slots:** `label` (Pflicht), `help`, `error` (⇒ invalid).
- **Teile:** Bauform „Feld“ des `kampo`. Teile und Bindungen werden **kopiert**, wie beim `elektilo` (Regel 0). Die Deduplizierung ist Kandidat. Die Höhe folgt `rows`. Vergrößern nur senkrecht (Web: `resize: vertical`).
- **A11y:** wie kampo (Label, `describedby`, `aria-invalid`, `aria-required`). Form-associated.
- **Goals:** `multi-line` (en: comment, description, reason, paragraph, multiline; de: Kommentar, Beschreibung, Begründung, Absatz, mehrzeilig).
- **Uzo:**
  - instead: `one-line` → kampo
  - boundary: `auto-grow` ask-human, `character-count` ask-human, `rich-text` not-supported (Kialo: Formatierung ist ein Editor, kein Feld)
  - composes: form, dialog
  - with: kampo, butono
  - layout: size container, wrap never
  - content: Feld-Regeln wie G6

### `dialogo` – Dialog
- **purpose:** „Interrupts the page to ask for a decision before it happens: confirm, approve, reject with a reason. The page behind stays where it was.“
- **Props:**
  - `open` (bool)
  - `size: small | medium` (Breite `size.container.small|medium`, Default small)
  - `reason: none | optional | required` (Default none). `required` sperrt die Bestätigung, bis Text eingegeben ist. Die Begründung ist ein `tekstareo`, den der Dialog selbst zeigt (Komposition).
- **Zustände:** keine eigene Zustandsachse, die Zustände liegen bei den komponierten `butono` und `tekstareo`.
- **Slots:** `title` (Pflicht), `message` (optional, ein Absatz), `content` (optional, für Formularfelder), `actions` (Pflicht, `butono`, 1–2, höchstens einer `emphasis=high`).
- **Ereignisse:** `confirm` (mit Begründung im Detail) und `cancel`.
- **Teile:** `backdrop` (`color.backdrop`), `surface` (`color.background.raised`, `elevation.shadow.modal`, `radius.role.surface`, Rand `border.default`), `title` (`typography.headline.*`, kleinste vorhandene Stufe, die über `body` liegt; Plan nennt sie), `message`, `content`, `actions` (Zeile, Ende).
- **Bestätigungs- und Formular-Dialog sind ein Ero (E9).** Der Formular-Fall ist `content` belegt. Die Bestätigung bleibt gesperrt, solange ein Feld in `content` ungültig ist (Formular-Gültigkeit aus ①). Der Dialog schließt erst nach `confirm`, wenn die Anwendung das zurückmeldet (Web: das `confirm`-Ereignis ist abbrechbar, `preventDefault` hält ihn offen).
- **A11y:** siehe G4. `aria-labelledby` zeigt auf den Titel, `aria-describedby` auf die Nachricht.
- **Goals:**
  - `confirm` (en: confirm, are you sure, approve, reject, delete?; de: bestätigen, sicher, freigeben, ablehnen, wirklich löschen)
  - `ask-reason` (en: reason, justify; de: Begründung, begründen)
- **Uzo:**
  - instead:
    - `inform-only` → avizo (Kialo: Wer nur informiert, unterbricht nicht)
    - `long-form` → ask-human (Kialo: Ein Formular mit mehr als einer Bildschirmhöhe ist eine Seite)
  - boundary: `non-modal` not-supported, `drawer` not-supported, `nested-dialog` not-supported (Kialo: Ein Dialog öffnet keinen zweiten)
  - composes: page
  - with: butono, tekstareo, kampo, elektilo, markobutono
  - layout: size container (small|medium), wrap never
  - content: `dialog-title-names-the-decision` anpassbar, `one-primary-per-container` (ausgeweitet), `label-names-action` gilt über die komponierten `butono`
- **Figma:** Das Set zeigt die Fläche mit Titel, Nachricht und zwei Aktionen, Achsen `size` × `reason` (none/required: mit/ohne Begründungsfeld). Den Hintergrund zeigt eine eigene Variante „mit Hintergrund“ als Beispielrahmen. Fehlt das Platz-/Ebenenverhalten der Plattform (Fokusfalle, Top Layer) in Figma, gibt es kein Manko, das ist eine Entscheidung wie E3.

## ③ Rückmeldung

### `insigno` – Statusetikett
- **purpose:** „Names a status in one to three words next to what it describes: draft, in review, valid, 3 violations.“
- **Props:** `intent: neutral | info | success | warning | danger` (Default neutral), `size: small | medium`.
- **Zustand:** rest. **Slots:** `label` (Pflicht, kurz), `description` (optional: lange Fassung, visuell verborgen, für Screenreader).
- **Teile:** `surface` (`color.status.<intent>.subtle`; neutral → `color.background.sunken`), `border` (`color.status.<intent>.border`; neutral → `color.border.default`, `border.subtle`), `text` (`color.status.<intent>.text`; neutral → `color.text.subtle`, `typography.label.2`), `radius.role.pill`. Höhe wächst mit dem Text, keine feste Höhe.
- **A11y:** kein Rollenattribut (statischer Text). Aussage nie nur über Farbe, der Text trägt sie.
- **Goals:** `status-label` (en: badge, tag, status, label, chip; de: Badge, Etikett, Status, Kennzeichnung).
- **Uzo:**
  - instead:
    - `sentence` → avizo
    - `clickable` → butono (Aktion) bzw. ligilo (Ziel) mit Kialo: Ein Etikett ist keine Bedienung
    - `count-only` → ask-human (Kialo: Eine nackte Zahl braucht eine Beschreibung, die sie nennt)
    - `value-in-range` → mezurilo
  - boundary: `brand-badge` ask-human (G1), `dot-only` not-supported (nur Farbe), `removable-chip` not-supported (Kialo: entfernbare Filter sind ein eigenes Ero)
  - composes: tabelo (Zelle), atributlisto (Wert), page-title, navigado (Zähler)
  - layout: size content, wrap never
  - content: `badge-text-short`

### `avizo` – Hinweis
- **purpose:** „Tells the person in the flow of the page what happened or what to watch for: saved, could not save, import not confirmed.“
- **Props:** `intent: info | success | warning | danger` (Default info, kein neutral: Ein Hinweis ohne Art ist Text), `dismissible` (bool).
- **Zustände:** rest. Hover/focus gibt es nur an der Schließen-Schaltfläche, das ist ein komponierter `butono emphasis=low`.
- **Slots:** `title` (optional), `message` (Pflicht), `details` (optional, Liste, z. B. Validierungsfehler mit Pfad, wie die Problem-Details in Arkitekturo), `actions` (optional, `butono`/`ligilo`, höchstens einer `emphasis=high`).
- **Teile:** `surface` (`color.status.<intent>.weak`), `accent` (Rand am Anfang: `border.width.strong`, `color.status.<intent>.border`; logische Richtung, Internacia), `title` (`font.weight.semibold`), `message`, `details` (`typography.caption`), `actions`, `dismiss`. Icon je intent: kein Icon in dieser Runde. Die Art steht im Titel oder als visuell verborgenes Wort („Fehler:“), so ist sie nie nur Farbe (Kandidat Icon → Phase 5 Icons).
- **A11y:** siehe G4. Ein Schließen gibt den Fokus an den nächsten sinnvollen Punkt (Plan nennt die Regel).
- **Goals:** `notify` (en: notice, alert, message, warning, error message, success message, banner; de: Hinweis, Meldung, Warnung, Fehlermeldung, Erfolgsmeldung).
- **Uzo:**
  - instead:
    - `needs-decision` → dialogo
    - `one-word-status` → insigno
    - `field-error` → kampo (Slot `error`, mit Kialo: Ein Fehler eines Felds steht am Feld)
  - boundary: `toast` not-supported (Kialo: Ein Hinweis, der von selbst verschwindet, ist für manche nicht lesbar; eigenes Ero mit Zeitregel), `stacked-notices` ask-human
  - composes: page, dialog (oben im Inhalt)
  - with: butono, ligilo
  - layout: size container, wrap allowed
  - content: `error-says-what-to-do` für danger (ausgeweitet), `one-primary-per-container`

### `plenstato` – Lade- und Leerzustand
- **Name:** Arbeitsname, der schwächste der Runde. `stato` ist ausgeschlossen, weil das Wort mit der Zustandsachse kollidiert.
- **purpose:** „Fills an area while its content loads, or when there is none: loading standards, no standards yet.“
- **Props:** `kind: loading | empty` (Pflicht).
- **Zustand:** rest. **Slots:** `text` (Pflicht), `actions` (optional, nur bei `empty`, `butono`, z. B. „Standard anlegen“).
- **Teile:** `surface` (Rand `stroke.dashed`, `color.border.subtle`, `radius.role.surface`; nur `empty`), `indicator` (nur `loading`: Kreis `size.icon.small`, `color.brand.fill`, Bewegung `motion.duration.slow` + `motion.easing.standard`; bei reduzierter Bewegung steht er), `text` (`color.text.muted`).
- **A11y:** siehe G4.
- **Goals:**
  - `loading` (en: loading, spinner, wait; de: lädt, Ladeanzeige, warten)
  - `empty` (en: empty state, no results, nothing yet; de: leer, keine Treffer, noch keine)
- **Uzo:**
  - instead:
    - `button-busy` → butono (Zustand loading)
    - `progress-known` → ask-human (Kialo: Fortschritt einer Aufgabe in Prozent ist kein Messwert wie beim `mezurilo`, sondern ein eigenes Ero)
  - boundary: `skeleton` not-supported
  - composes: tabelo (leerer Zustand), page-section
  - layout: size container, wrap allowed
  - content: `empty-state-says-what-next` (nur empty)

## ④ Daten

### `tabelo` – Datentabelle
- **purpose:** „Shows many records with the same fields as rows and columns, so a person can compare and find: standards, versions, findings.“
- **Bauweise (E10):** Das Ero gestaltet und erweitert eine **native Tabelle im Light DOM** (Web: `fm-tabelo` umschließt `<table>`). Es ist kein Datenformat (kein JSON-Prop). Grund: Die Semantik der Plattform (Zeilen- und Spaltenköpfe, Screenreader-Navigation) bleibt unberührt. Das Ero liefert Gestaltung, Scroll-Region, Leerzustand und Sortier-Schaltflächen.
- **Props:** `density: comfortable | compact` (Abstand der Zellen über `spacing.*`; Default comfortable), `caption-hidden` (bool; die Beschriftung bleibt für Screenreader), `sort` (Spalte + Richtung, nur Anzeige: Das Sortieren selbst macht die Anwendung; das Ero meldet `sort-change`).
- **Zustände:** an der Sortier-Schaltfläche im Kopf rest, hover, focus. **Slots:** `caption` (Pflicht), der `table`-Inhalt (Pflicht), `empty` (optional, wird `plenstato kind=empty` über alle Spalten, wenn keine Zeilen da sind).
- **Teile:** `head` (`color.background.sunken`, `font.weight.semibold`, `typography.label.1`), `cell` (Rand unten `border.subtle`), `row-header` (semibold), `numeric` (Ausrichtung am Ende, tabellarische Ziffern, wenn die Schrift es kann), `sort-indicator` (`size.icon.small`), `region` (Rand `border.subtle`, `radius.role.surface`, waagerechtes Scrollen, Fokusring).
- **A11y:** siehe G4. `aria-sort` steht nur an der sortierten Spalte.
- **Goals:** `table` (en: table, list of records, grid, data table; de: Tabelle, Liste von Einträgen, Übersicht).
- **Uzo:**
  - instead:
    - `one-record` → atributlisto
    - `layout-grid` → ask-human (Kialo: Eine Tabelle für das Layout zerstört die Lesereihenfolge)
  - boundary: `row-selection`, `pagination`, `inline-edit` je ask-human; `row-actions-menu` ask-human (Kialo: mehrere kleine `butono size=small` in einer Zelle sind erlaubt, ein Menü-Ero fehlt), `sticky-header` not-supported, `row-tint` ask-human (Diff-Fall aus Arkitekturo)
  - composes: page-section
  - with: insigno (Zelle), ligilo (Zelle, Zeilenkopf), butono size=small (Zelle)
  - layout: size container, wrap never (Region scrollt)
  - content: `table-caption-names-the-content` fest
- **Figma:** ein Set mit Kopf + 3 Zeilen × 3 Spalten (eine numerisch), Achsen `density`. Die Sortierung erscheint als Beispiel am ersten Kopf (aufsteigend).

### `atributlisto` – Schlüssel-Wert-Liste
- **purpose:** „Shows the fields of one record as name and value: version, owner, valid since.“
- **Props:** `layout: columns | stacked` (Default columns: Name und Wert nebeneinander, bei wenig Platz untereinander. Schwelle `size.container.small`).
- **Zustand:** rest. **Slots:** `entries` (Pflicht, je Eintrag Name + Wert; Muster `SkemoSlot.entry`). Ein leerer Wert zeigt „–“ und wird in `a11y.texts` „keine Angabe“.
- **Teile:** `term` (`color.text.muted`, `typography.label.2`), `value` (`color.text.default`), Abstände `spacing.small|large`.
- **A11y:** `dl`/`dt`/`dd`, optional mit Namen.
- **Goals:** `details` (en: details, metadata, properties, key value; de: Details, Metadaten, Eigenschaften, Angaben).
- **Uzo:**
  - instead: `many-records` → tabelo, `editable` → kampo in einem Formular (Kialo: Bearbeiten ist ein Formular, keine Liste)
  - boundary: `nested` not-supported
  - composes: page-section, dialog
  - with: insigno, ligilo (Wert)
  - layout: size container, wrap allowed (Werte brechen um)

### `mezurilo` – Messbalken
- **purpose:** „Shows a known value within a known range, with its number: 66 % conform, 3 of 5 checked.“
- **Props:** `value` (Zahl oder leer = unbekannt), `min` (Default 0), `max` (Default 100), `intent: neutral | success | warning | danger` (Default neutral; die Anwendung wählt die Art, das Ero rechnet keine Schwellen).
- **Zustand:** rest. **Slots:** `label` (Pflicht, sichtbar), `value-text` (Pflicht, sichtbar und als `aria-valuetext`).
- **Teile:** `track` (`color.background.sunken`, `radius.role.pill`), `fill` (neutral → `color.brand.fill`; sonst `color.status.<intent>.basic`; Breite = Anteil), `unknown` (kein `fill`, Rand `stroke.dashed`, deutlich anders als 0), `label`, `value-text`.
- **A11y:** siehe G4.
- **Goals:** `meter` (en: meter, gauge, percentage, score, level; de: Messbalken, Anteil, Prozent, Quote, Stand).
- **Uzo:**
  - instead: `task-progress` → ask-human (wie plenstato), `status-word` → insigno
  - boundary: `chart` not-supported, `multi-segment` not-supported
  - composes: tabelo (Zelle), atributlisto (Wert), page-section
  - layout: size container, wrap never
  - content: `meter-text-states-value` fest
- **Figma:** Achsen `intent` × Wert-Beispiel (0, 66, unbekannt).

## ⑤ Navigation

### `navigado` – Navigation
- **purpose:** „Leads between the main pages of an application and shows where the person is.“
- **Props:** `orientation: horizontal | vertical` (Default horizontal), `label` (Name der Navigation, Pflicht, z. B. „Hauptnavigation“).
- **Zustände:** am Eintrag rest, hover, focus und `current` (der Eintrag der aktuellen Seite, Muster `SkemoSlot.entry`: `{ key: current }`).
- **Slots:** `items` (Pflicht, je Eintrag Text, Ziel und optional `count` + `count-description`). Der Zähler ist ein komponierter `insigno intent=info` mit Beschreibung („1 Version in Prüfung“), die Ziffer selbst `aria-hidden`.
- **Teile:** `item` (`color.navigation.rest|hover|selected`, Text `color.navigation.text.rest|selected`), Kennzeichnung `current` (zusätzlich `font.weight.bold` + Unterstrich `border.width.strong`), Mindestzielgröße `size.target.min`, `radius.role.control`.
- **A11y:** siehe G4.
- **Goals:** `navigate-app` (en: navigation, menu, nav bar, sidebar, main menu; de: Navigation, Menü, Hauptmenü, Seitenleiste).
- **Uzo:**
  - instead: `single-link` → ligilo, `switch-view` → langetaro, `steps` → ask-human (Kialo: Schritte eines Ablaufs sind kein Menü)
  - boundary: `submenu` ask-human, `collapsed-mobile` not-supported (Kialo: eine eingeklappte Navigation braucht ein Overlay mit eigener Tastatur), `breadcrumb` ask-human
  - composes: shell (Kopf, Seite)
  - with: ligilo, insigno
  - layout: size container, wrap allowed (horizontal bricht um, Reihenfolge bleibt)
  - content: `link-label-names-destination`, `link-not-color-only` (ausgeweitet)

### `langetaro` – Reiter
- **purpose:** „Switches between views of the same thing on one page: content, versions, rules, audit.“
- **Props:** `label` (Name der Reiterleiste, Pflicht), `selected` (Id des gewählten Reiters).
- **Zustände:** am Reiter rest, hover, focus, disabled und `selected` (`SkemoSlot.entry`).
- **Slots:** `tabs` (Pflicht, min 2, je Reiter Id + Text), `panel` (Pflicht, Inhalt des gewählten Reiters). Ereignis `select`. Wenn die Anwendung den Reiter in der Route hält, setzt sie `selected` selbst (Arkitekturo: `?tab=`).
- **Teile:** `tab` (Text `color.text.subtle` → selected `color.text.default`, `typography.label.1`, Mindestzielgröße `size.target.min`), `selected-indicator` (Unterstrich `border.width.strong`, `color.navigation.selected`; zusätzlich `font.weight.bold`, nie nur Farbe), `list` (Rand unten `border.default`), `panel`.
- **A11y:** siehe G4.
- **Goals:** `switch-view` (en: tabs, tab bar, views, sections; de: Reiter, Tabs, Registerkarten, Ansichten).
- **Uzo:**
  - instead: `form-choice` → elekto (Kialo: Eine Wahl in einem Formular ist ein Wert, kein Ansichtswechsel), `pages` → navigado
  - boundary: `overflow` ask-human, `closable-tabs` not-supported, `manual-activation` ask-human, `vertical-tabs` ask-human
  - composes: page-section
  - layout: size container, wrap never
  - content: `option-labels-distinct` (ausgeweitet)

## Gvidanto (Art. VII)

**Neue Fragen:**
- „Dialog oder Hinweis?“
- „Badge oder Hinweis?“
- „Tabelle oder Liste?“
- „Reiter oder Navigation?“
- „Wie zeige ich ‚nicht geprüft‘?“
- „Wie heißt das Textarea in Fundamento?“
- „Passwortfeld?“

**Beispiel-Dialoge als Akzeptanzkriterien (als MCP-Test):**
> „Ich brauche einen zweiten Button ‚Wirklich löschen?‘“ → Gvidanto: kein zweiter Button, sondern `dialogo` mit Titel „Standard löschen?“ und `butono intent=danger` „Löschen“, mit Kialo aus `butono.instead.confirm`.

> „Kommentarfeld für eine Begründung“ → Gvidanto: `tekstareo`, nicht `kampo` (Kialo aus `kampo.instead.multi-line`, das heute `null` ist).

> „Tabs, um zwischen Liste und Formular zu wechseln“ → Gvidanto: `langetaro` nur, wenn beide Ansichten zu derselben Sache gehören, sonst `navigado`.

> „Zeige 0 % für nicht geprüfte Projekte“ → Gvidanto: `mezurilo` ohne Wert, Text „nicht geprüft“ (Regel `meter-text-states-value`).

## Abnahme (je PR, wie 010)
1. `get_ero <ero>` + `brief` ≤ 750, Wert in plan.md.
2. Szenarien und Beispiel-Dialoge als MCP-Tests grün.
3. Figma: Plugin-Lauf in f10b-5. Neue Sets im Frame „Eroj“ (F-8), Beschreibung = purpose, Moduswechsel komuna ↔ ekzemplo am Frame, keine Überlappung.
4. Vitrino: Abschnitt je Ero, Markenwechsel, Gebrauch.
5. Fehlerfixtures erst rot, dann grün.
6. Parität aller 17 Eroj grün, Alirebleco und Internacia grün.
7. `kampo.instead.multi-line` ist `use-instead: tekstareo`. `check:regularo` meldet kein `skemo-uzo-missing`.
8. Ontologio: 10 neue Begriffe mit de/en-Synonymen (Textarea, Dialog/Modal, Badge/Tag, Hinweis/Alert, Ladeanzeige/Leerzustand, Tabelle, Details/Key-Value, Messbalken/Meter, Navigation/Menü, Reiter/Tabs). Vojmapo Zeile 4.
9. **Arkitekturo-Abdeckung** je Ero in plan.md (Tabelle Kandidat → Ero → offen).
10. Nur ①: e2e-Laufzeit vorher/nachher, CI-Faktor entfernt. G8-Test rot (eine Variable absichtlich umbenannt) → grün.

## Entscheidungen (gelten, bis der Maintainer widerspricht)
- **E1** Keine neuen Tokens (G3). Fehlt eine Rolle, die nächstliegende nehmen und ein Manko führen.
- **E2** Status-Achse heißt `intent` (G1). Keine Stufe `brand`.
- **E3** Das Zustandsmuster gilt für das bediente Teil (`SkemoSlot.entry`), nicht für das ganze Ero (G2).
- **E4 Namen:** `tekstareo`, `dialogo`, `insigno`, `avizo`, `plenstato`, `tabelo`, `atributlisto`, `mezurilo`, `navigado`, `langetaro`. Esperanto-Konvention des Projekts. `tekstareo` steht schon in der Ontologio. `langetaro` = Menge von Reitern (-aro). Der Maintainer kann vor PR ② umbenennen, danach in dieser Runde nicht mehr. `plenstato` ist ausdrücklich zur Prüfung vorgelegt.
- **E5** Regeln ausweiten statt vervielfachen (G6).
- **E6** Reihenfolge ①–⑤, gestapelt (G9). Ist ⑤ nicht fertig: offen lassen, nicht hetzen.
- **E7** Arkitekturo ist Anforderung, kein Code wird übernommen.
- **E8** kampo `number` als `type=text inputmode=numeric`, nicht `type=number`. `date` ist der Dialog der Plattform. Beides nach dem Benchmark GOV.UK. kampo wird form-associated.
- **E9** Bestätigungs- und Formular-Dialog sind ein Ero (`content` belegt = Formular).
- **E10** `tabelo` erweitert eine native Tabelle im Light DOM, kein Datenformat.
- **E11** Was die Kandidatenliste verlangt und die Spec nicht trägt: Grenze in der Uzo und Zeile „offen“ in der Arkitekturo-Abdeckung, kein stilles Weglassen.

## Benchmark (Art. V, öffentlich)
- WAI-ARIA APG: Dialog (Modal), Alert, Tabs, Table, Sortable Table, Meter, Disclosure Navigation, Landmarks.
- WCAG 2.2: 1.3.1, 1.4.1, 1.4.13, 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.5.8, 3.3.1, 3.3.2, 4.1.2, 4.1.3.
- GOV.UK Design System: Textarea, Password input, Date input (Hinweis: GOV.UK nutzt drei Felder; Fundamento nutzt in dieser Runde den Dialog der Plattform, E8), Text input numeric, Tag, Notification banner, Error summary, Table, Summary list, Tabs, Service navigation.
- USWDS: Modal, Alert, Tag, Table.

P0 ergänzt research.md nur bei Entscheidungen, die hier fehlen.
