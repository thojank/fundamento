# Nachlese 5 – Plan

**Spec:** [`briefing.md`](briefing.md) (das Briefing vom 2026-10-19 ist die Spec, unverändert kopiert) · **Quellen:** Messung `messung-2-3-n4-016-2026-10-19.md` und Auftrag `auftrag-p0-2026-10-19.md` (Maintainer-Ordner, nicht kopiert) · **Regel 0** (12.10.) gilt: der Weg, der im Repo schon gegangen wird; sonst die kleinste Änderung mit Eintrag hier; Tokens, Regulo-Semantik und Constitution nie ändern; nie eine Grenze aufweichen, um grün zu werden. Kein neues Ero, keine Token-Änderung. **Aufgaben, Commits und Messungen:** [`tasks.md`](tasks.md).

Zwei PRs, gestapelt: ① CI-Teilung von `main`, ② Befunde von ①.

## ① CI: `plugin.test.ts` teilen (O-5)

**Branch:** `261019-nachlese-5-ci-f027c6` (von `main` @ `ef3c8db`, nach dem Merge von #78 und #79; nach dem Merge von #77 auf `a1dc8b6` rebased) · **Datum:** 2026-10-19.

### Zusammenfassung

1. **Teilung (O-5, D-01):** `plugin.test.ts` (7 163 Zeilen, 250 Tests, lokal 310 s in einer Datei) ist sieben Testdateien nach Themen und ein Hilfsmodul ohne Tests. Jeder `describe`-Block ist unverändert verschoben; die Projekcioj-Suite hat vorher und nachher **716 Tests mit identischen Namen**, keiner fällt weg, keiner wird übersprungen.
2. **Wackel-Test `sxvebilo.spec.ts:53` (D-02):** Ursache ein Wettlauf im Test – und dahinter ein echter Fehler im Element: In Firefox kehrte der Fokus nach Escape nicht zum Auslöser zurück. Der Test wartet jetzt auf Zustände; die `focusout`-Regel der Overlays ist richtig herum.
3. **Wackel-Test Escape im `dialogo` unter WebKit (D-03):** kein Wackeln, sondern eine falsche Vorbedingung – WebKit setzt beim Klick auf einen Knopf keinen Fokus. Der Öffner bekommt den Fokus wie über die Tastatur.
4. **Der rote Lauf in #79** (Lauf 39231530044, erster Versuch, Playwright-Shard 2) war derselbe `sxvebilo`-Test.

5. **Sechster CI-Job (D-04):** die gerenderten Checks lagen bei 7:52 bis 8:34; axe über die Eroj läuft jetzt in einem eigenen Job.

Keine Testlogik geändert außer den zwei Wackel-Tests; kein `retries`, kein `skip` (Regel 0.4).

### Entwurfsentscheidungen

#### D-01 Teilung nach Themen, ein Hilfsmodul

`plugin-test-helpers.ts` trägt, was bisher oben in der Datei und zwischen den Blöcken stand: die Pläne (`files`/`plan` aus Kern + ekzemplo, `repoFiles`/`repoPlan` aus dem Repo-Modelo), die Schriften einer vorbereiteten Datei (`MODEL_FONTS`, `modelDouble`), den Läufer `run`, `pageNodes`, `descendant`, `butonoOf`, `double_shown`, `LIFT`, `SEPARATOR_EXAMPLE_NAMES`, `TITOLO_CASE_WARNING`. Einzige Änderung am Hilfscode: `prepared` und `repo` werden erst **nach** ihrer Prüfung (`if (!….ok) throw`) exportiert – in einer Datei verengte die Prüfung den Typ für die Tests darunter, über einen Export ginge die Verengung verloren.

| Datei | Thema | Blöcke | Tests | lokal (s, eine Datei) |
|---|---|---|---|---|
| `plugin-lauf.test.ts` | erster und zweiter Lauf, Bericht, Abbrüche vor dem Schreiben (F10b–F10d, F-A, F-B), Build | 15 | 47 | 77 |
| `plugin-variablen.test.ts` | Variablen und Farben: Alpha, Modi, Standardmodus, Deckkraft, fremde Sammlungen (F8, F13, F19, F22, F27, F34, F35, F43) | 11 | 40 | 67 |
| `plugin-sets.test.ts` | Sets: Geometrie, Fokusring, Raster, Label und seine Schrift, Größen, Grund (F11, F14, F16, F17, F20, F30–F32, M-3) | 16 | 51 | 82 |
| `plugin-rahmen-beispiele.test.ts` | Rahmen Eroj im Abschnitt Fundamento, Beispiele neben den Sets, Feld des kampo, Brotkrumen | 3 | 17 | 35 |
| `plugin-doppel.test.ts` | Regeln des Doppels: Größen, Striche, Weigerungen, Umbruch, unsichtbare Kinder | 5 | 14 | 2 |
| `plugin-bauformen-eingabe.test.ts` | Bauformen der Eingabe: Schalter, Kästchen, Auswahl, Feld, Textbereich, Dialog, Hochladen, Vorschlag | 8 | 35 | 64 |
| `plugin-bauformen-inhalt.test.ts` | Bauformen von Inhalt und Navigation: Abzeichen, Hinweis, Zustand, Messbalken, Tabelle, Liste, Navigation, Reiter, Icons, Overlays, Karte, Avatar | 13 | 46 | 80 |
| **Summe** | | **71** | **250** | |

Gemessen mit dem JSON-Reporter (vorher `plugin.test.ts` 250 Tests, 310 s): die Projekcioj-Suite lokal **318 s → 90 s**, weil die Dateien nebeneinander laufen – eine Datei kann das nicht. Die Bauformen sind zwei Dateien, damit keine Datei die Wanduhr bestimmt; künftige Bauformen gehen in die passende der beiden. Die Doppel-Regeln sind klein, aber ein eigenes Thema (Briefing).

#### D-02 `sxvebilo` Escape: Wettlauf im Test, Fehler im Element

**Ursache im Test.** Der Test wartete nach dem Klick auf `:popover-open` und drückte dann Escape. Das Element verarbeitet das Öffnen aber im `toggle`-Ereignis der Plattform, eine Task später (Spiegel `open`, Fokus hinein). Kam Escape vorher, schloss es eine Ebene, deren `open` nie gesetzt war: das Warten auf „`open` weg“ war sofort erfüllt, `aria-expanded` stand noch auf `true` – rot an Zeile 62. Belegt in Chromium und Firefox: in einer Task öffnen und schließen ergibt `open` weg, `aria-expanded` `true`, eine Task später `false`. Rot gesehen in #79 (Lauf 39231530044) und auf `main` in Firefox (39223137603, 39152793200).

**Der Test wartet jetzt auf Zustände:** nach dem Öffnen auf `open` (das Element hat das Öffnen verarbeitet), nach Escape auf `:popover-open` und `open` weg, `aria-expanded` mit `toHaveAttribute` (abgewartet).

**Damit zeigte sich ein Fehler im Element:** in Firefox kehrte der Fokus nach Escape nicht zum Auslöser zurück (10 von 10). Der alte Test war in Firefox nur grün, solange er den Wettlauf gewann – dann war der Fokus nie in der Ebene. Die `focusout`-Regel der Overlays war vertauscht: ging der Fokus verloren, weil die Ebene schloss, hieß sie „war nicht drinnen“; nahm die Person ihn zu einem Element draußen, „war drinnen“. Chromium und WebKit geben den Fokus beim Schließen selbst zurück und verdeckten das. **Jetzt entscheidet das Ziel des Fokus:** verloren an nichts bei geschlossener Ebene ⇒ zurück zum Auslöser; zu einem Element außerhalb ⇒ bleibt dort; innerhalb ⇒ weiter drinnen. Dieselbe Regel am `menuo` (Regel 0.1: derselbe Weg); er verarbeitet Escape selbst und war nicht betroffen. `sxvebilo`, `menuo`, `dialogo`: je 170 von 170 in Chromium, Firefox und WebKit, zehnfach wiederholt.

#### D-03 `dialogo` Escape unter WebKit: die Vorbedingung

Der Dialog gibt den Fokus dem Element zurück, das ihn beim Öffnen hatte. Der Test klickte den Öffner und erwartete danach den Fokus dort. Gemessen: WebKit setzt beim Klick auf einen Knopf keinen Fokus (auch nicht auf ein einfaches `<button>`, wie Safari); der `body` behält ihn, und der Dialog gab ihn folgerichtig dem `body` zurück – 3 von 3 rot unter macOS, auf dem Linux-Runner nicht. Kein Fehler des Ero. Der Öffner bekommt den Fokus jetzt wie über die Tastatur (`focus()`), und der Test wartet, bis er ihn hält. WebKit 5 von 5, alle drei Engines zehnfach grün.

#### D-04 Shards und ein sechster Job

**Projekcioj: zwei Shards reichen.** Erster Lauf nach der Teilung (39245801159): Shard 1 **3:06**, Shard 2 **3:10** – vorher 9:29 / 1:03 (#79). Vitest teilt nach Datei; mit sieben Dateien statt einer verteilt sich die Last, und in einem Shard laufen die Dateien auf den vier Kernen des Runners nebeneinander. Ein dritter Shard brächte nichts (O-1 entschieden: nein).

**Der Lauf zeigte einen anderen Job über 7 min:** die gerenderten Checks mit **8:18** – axe über die Eroj 227 s, Vitrino 138 s, Make Kit 45 s, Quickstart 16 s, dazu Browser 47 s und Build 8 s. Über vier Läufe lag der Job bei 7:52 bis 8:34 (axe 178–233 s, Vitrino 104–140 s). Derselbe Schnitt wie Nachlese 3 W1 und Spec 015 ② D-01: **axe über die Eroj ist ein eigener Job** `alirebleco-eroj`, Make Kit, Quickstart und Vitrino bleiben `rendered-checks`; beide mit den Engines (auf `main` drei, im PR Chromium). `workflow.test.ts` pinnt die sechs Jobs; der Skript `check` der Wurzel (eine Reihe für lokal) ist unverändert. Kein Timeout angehoben. Zeiten nach dem Schnitt: tasks ① (Zeile CI).

### Abweichungen vom Briefing

1. **Ein Fix am Element in ①** (D-02): das Briefing verlangt, Wackel-Tests über die Ursache zu stabilisieren; die Ursache des `sxvebilo`-Tests war zur Hälfte ein Fehler im Element. Er ist in ① behoben statt als Befund geführt, weil der stabilisierte Test sonst in Firefox rot wäre.
2. **Ein sechster CI-Job** (D-04): das Briefing nennt nur die Projekcioj-Shards; das Ziel „kein Job über 7 min“ verlangte auch den Schnitt der gerenderten Checks.

### Befunde / Mankoj

- **B-1** Der Wackel-Test verdeckte einen Fehler: ein Test, der einen Wettlauf meist gewinnt, prüft den Pfad nicht, den er beschreibt (D-02).
- **B-2** Lint: `web-component.test.ts` trägt eine alte Warnung (`DESIGN` unbenutzt), älter als dieser Branch – nicht angefasst (Standard), Zeile in tasks.

### Offen (für den Maintainer)

- **O-1 Dritter Projekcioj-Shard:** **entschieden (P0 nach Messung, wie das Briefing es vorsieht): nein** – die zwei Shards liegen bei 3:06 und 3:10 (D-04).

## ② Befunde

**Branch:** `261019-nachlese-5-f027c6`, gestapelt auf ① (`261019-nachlese-5-ci-f027c6` @ `a984699`, PR #80; nach dem Rebase von ① auf `main` @ `a1dc8b6` neu gestapelt) · **Datum:** 2026-10-19 · Kein neues Ero (32), kein Token geändert, keine neue Regulo-Semantik, kein Amendment. **Aufgaben, Commits und rote Hashes:** [`tasks.md`](tasks.md) ②.

Herkunft: Messung der Abnahme 015 ②/③, Nachlese 4, 016 ① (`messung-2-3-n4-016-2026-10-19.md`: A2, A15, A16, C – Lauf 1 brach in `done` ab; Rohdaten `mess/a15-karte.json`, `a16-projektkarten.json`, `a18-ohne-hilfe.json`, `brief-kompletigilo.json`), Auftrag vom 2026-10-19 (N5-4 bis N5-6), Entscheidungen des Maintainers zu O-10, O-14, O-17 (Spec 015 plan ②/③) und O-39, O-41 (Nachlese 4).

### Zusammenfassung

**Figma**
1. **N5-1:** `lostSince` nimmt Name und Typ jedes Knotens beim Start auf und liest am Ende nur geschützt; ein verschwundener Knoten steht als verloren im Bericht (`removed: true`), der Lauf endet normal (D-01). Das strenge Doppel wirft jetzt wie Figma beim Lesen eines entfernten Knotens – damit fiel auf, dass jeder Lauf, der den gezeichneten Haken des `markobutono` entfernt (N-7), in `done` ebenso abgebrochen wäre (B-3).
2. **N5-4:** Jeder Beispielrahmen steht auf `color/background/canvas` wie das Set – neu am `alsxutilo`, `avataro`, an der `karto`, an der `navigado` (vertikal) und an den drei `pagxigilo`-Beispielen; eine Stelle `groundOf` für Set und Beispiele (D-02).
3. **N5-5:** Die kleinste Größe des `avataro` zeigt eine Initiale („E“), in Figma wie im Web; die anderen zwei (D-03).
4. **N5-6:** Jede Vorschlagsreihe des `kompletigilo` füllt die Breite der Listbox – die aktive, die gewählte und die übrigen (D-04).
5. **O-41:** Der `ligilo` zeichnet `icon-end` mit den Glyphen `external` nach dem Label, sichtbar über die Eigenschaft `external` (Weg der `toggles`, D-05).

**Gvidanto**
6. **N5-2:** Das Kopfwort gewinnt: nennt der Text vor dem ersten Bindewort das Goal genau eines Ero, antwortet dieses Ero (D-06). „Karte für ein Projekt mit Bild und Titel“ → `karto`.
7. **O-17:** Im zweiten Durchgang trifft ein deutsches Goal-Stichwort ab sechs Buchstaben das Ende eines zusammengeschriebenen Kompositums, mit den Endungen von N-2, Vorderteil ab vier Buchstaben (D-07). „Projektkarten“ → `karto`.
8. **N5-3:** Der `brief` nennt jede Prop ohne Achse mit Namen und Typ (`props`); der größte brief ist der des `kampo` mit 646 (D-08).
9. **O-39:** Die Grenze `drawer` des `dialogo` und des `sxvebilo` ist beide `ask-human` mit derselben Kialo; Jugxo (D-09).

**Modelo/Web**
10. **O-10:** `prop:<name>` liest auch eine Zahl-Prop als belegt/leer; die zweite Constraint der Pflicht `file-constraints-stated` prüft `max-size` (D-10). `check_usage` `alsxutilo` mit `max-size` ohne Hilfe meldet `ero-prop-constraint`.
11. **O-14:** Datum, Adresse und Webadresse prüft das Element selbst; das native Feld ist für keine Grenze und keine Form mehr ungültig (D-11).

### Entwurfsentscheidungen

#### D-01 N5-1: verloren statt Abbruch

**Ursache (gemessen):** `lostSince` las am Ende `name` und `type` jedes beim Start gesehenen Knotens, der nicht mehr im Set ist. Ein entfernter Knoten nennt in Figma nur noch `id` und `removed`; jedes andere Feld wirft („in get_name: The node with id "26:325" does not exist“, Lauf 1 nach einem Verbindungsabbruch). Der Lauf brach in `done` ab, nachdem alles geschrieben war; verloren ging nur der Bericht.

**Lösung:** `recordStart` hält je Knoten `id`, `name`, `type` vom Start; `lostSince` liest am Ende `removed`, `parent` und die Angaben des Elternknotens in je einem `try` – was nicht mehr zu lesen ist, gilt als entfernt (`removed: true`, `parent: null`). Der Bericht nennt Name und Typ vom Start. Auch `removed` und die Knoten des Sets selbst werden geschützt gelesen.

**Doppel (Regel des Doppels):** Ein entfernter Knoten antwortet `removed: true` und `id`, jedes andere Feld wirft mit der gemessenen Meldung. Gemessen ist `name`; dass jedes andere Feld ebenso wirft, steht als **belief** im Doppel (die API sagt: vor dem Lesen eines gemerkten Knotens `removed` prüfen).

#### D-02 N5-4: Grund für jeden Beispielrahmen

Geprüft: alle Beispielrahmen beider Wege (`placeExamples`: `apartigilo`, `pagxigilo`, `alsxutilo`, `karto`, `avataro`; `placeExample`: `mezurilo`, `navigado`, `dialogo`). Mit Grund standen nur `apartigilo` (Nachlese 4 N-6) und `mezurilo` (F-6); der `dialogo` hat seinen Hintergrund (Backdrop). Dieselbe Lücke hatten `alsxutilo – mit zwei Dateien`, `avataro – mit Bild`, `karto – ohne Bild`, `navigado – vertikal` und `pagxigilo – Seite 1/5/10 von 10`. Der Grund ist der des Sets (`component.surface`, F16): `color/background/canvas`, gebunden, mit der Deckkraft des Plans. Regel 0.1: die vier gleichen Stellen (Set, `apartigilo`, `mezurilo`, neu fünf weitere) sind eine Funktion `groundOf`; Set, `apartigilo` und `mezurilo` schreiben dasselbe wie vorher. Ein Test über alle Beispielrahmen (außer dem Dialog) hält die Lücke zu.

#### D-03 N5-5: eine Initiale in der kleinsten Größe (O-18)

O-18 (Spec 015 ③): 20 / 24 / 48 px; zwei Initialen trägt `size.icon.small` nicht. Gemessen (Figma): in `size=small` (20 px, `typography.label.2`) stand „EM“ über den Kreis. **Regel:** die kleinste Größe – der erste Wert der Achse `size` – zeigt die erste Initiale, die anderen zwei. Web (`element-template.ts`): zeigte „EM“ in jeder Größe, jetzt in `small` den ersten Graphem des ersten Worts (Browser-Spec in Chromium, Firefox, WebKit; ein Wechsel der Größe folgt). Figma: Plan `avatar.oneInitial` (`{ prop: "size", value: "small", text: "E" }`, der erste Graphem der Initialen der Vitrino); der Text der Varianten `size=small` schreibt „E“ und hängt **nicht** an der Text-Eigenschaft `label` – eine Eigenschaft hält einen Wert für das ganze Set; eine Verbindung eines früheren Laufs wird gelöst (O-7). Der Name bleibt für Hilfstechnik ganz (`aria-label`).

#### D-04 N5-6: die Reihe füllt die Liste

Die Reihe eines Vorschlags ist `entry → focus-ring → focus-gap → suggestion-n` mit dem Text. Bisher umschlossen alle vier ihren Inhalt (`HUG`), die Fläche `suggestion.fill` lag nur um das Wort. Jetzt füllen `entry`, Ring und Abstand die Breite (`FILL`), die Reihe auch, ihr Wort steht am Anfang (`primaryAxisAlignItems: MIN`). Die Fläche liegt im Vorbehalt von Fokusring und Abstand wie bei jeder Kontrolle (F17) – sie ist so breit wie die Listbox minus diesen Vorbehalt, gemessen am Vorbehalt der Kontrolle desselben Felds. `selected` hat keine eigene Fläche (nur die Textfarbe) und liegt in derselben Reihe: dieselbe Breite.

#### D-05 O-41: `external` am `ligilo` in Figma

Plan: `iconsOf` gibt einem Link mit dekorativem Slot `icon-end`, Teil `icon` und boolescher Prop `external` die Glyphe `external` (`icons: { "icon-end": "external" }`); `BOOLEAN_TOGGLES.external = { part: "icon-end" }` macht `external` zu einem Schalter der Teil-Sichtbarkeit (wie `dismissible`). Plugin: der Rahmen `icon-end` nach dem Label mit den Glyphen je Aspekto (`drawGlyphs`), Größe an `size/icon/*` je `size`, Farbe der Glyphen an die des Labels (`icon.color sameAs label.color`), sichtbar über die BOOLEAN-Eigenschaft `external` (Standard `false`). Das Web hat die Markierung seit Nachlese 4 N-7 als Rückfall des Slots `icon-end`. Zwei Pins der Label-Vorgaben (M-3) nennen jetzt das BOOLEAN neben dem Text; `check:parity` 0 Differenzen.

#### D-06 N5-2: das Kopfwort gewinnt

**Regel:** Bindewörter sind de `mit`, `für`, `von`, `über`, `zu`, en `with`, `for`, `of`, `about` (`LINKING_WORDS`, je Sprache der Eingabe, ohne Sprache beide Listen), als ganzes Wort. Der **Kopf** ist der Text vor dem ersten Bindewort, wenn davor ein Wort steht. Nennt der Kopf das Goal **genau eines** Ero H (`goalOf` je Ero auf dem Kopf, im selben Durchgang), dann:
- antwortet H mit seinem Goal über den **ganzen** Text (das längste Stichwort wie bisher: „Feld für die E-Mail-Adresse“ bleibt `kampo` `email`);
- bildet ein Goal eines anderen Ero nach dem Bindewort keinen Gleichstand;
- fällt ein Uzo-Eintrag (Grenze oder Alternative) eines anderen Ero weg, der nur nach dem Bindewort trifft – außer er nennt H als das zu nehmende Ero (Spec 008 D-08);
- zählen die eigenen Uzo-Einträge von H und alles, was im Kopf trifft, wie bisher („Karten für Projekte im Raster“ fragt weiter mit `card-grid`).

Nennt der Kopf kein Goal oder die Goals zweier Eroj, oder steht das Bindewort am Anfang, gilt alles wie bisher. Kein neuer Durchgang: die Regel liest den Durchgang, der trifft (wörtlich, sonst mit den Endungen). Jugxo `jug_01M5A01V471S1ZBV2YKH1D8GZY`.

#### D-07 O-17: das Ende eines Kompositums

**Regel:** Im zweiten Durchgang (wörtlich trifft weder Goal noch Uzo-Eintrag, Nachlese 4 N-2) trifft ein **deutsches** Goal-Stichwort ab sechs Buchstaben (`COMPOUND_SUFFIX_MIN`, ohne Bindestrich gemessen) auch das Ende eines zusammengeschriebenen Worts, wenn der **Vorderteil mindestens vier Buchstaben** hat (`COMPOUND_FIRST_PART_MIN`); mit den Endungen von N-2 am Wort („…karten“, „…kacheln“). `goalMatchOf` ist die eine Stelle für `goalOf` und die Stärke eines Goals. Englische Stichwörter, die Uzo-Einträge (sie treffen das Wortende seit Spec 007 D-06 schon im ersten Durchgang) und `check_usage` bleiben, wie sie waren.

**Warum der zweite Durchgang:** wie N-2 (O-37) – jede Antwort, die wörtlich etwas fand, bleibt bitgleich; nur ein bisheriges `goal-unknown` kann eine Antwort bekommen. **Warum vier Buchstaben:** deutsche Verbpräfixe (ab-, an-, auf-, aus-, be-, ein-, ent-, er-, ver-, vor-, zu-) sind kürzer; ohne die Grenze trafen „bemerken“, „anmerken“, „vormerken“ den `markobutono` (`merken`) und „abwarten“ den `plenstato` (`warten`). Bestimmungswörter von Komposita haben meist vier Buchstaben und mehr („Projekt“, „Kontakt“, „Register“).

**Falsche Freunde (Tests):** „Registerkarten“ → `langetaro` (eigenes Stichwort, erster Durchgang), „Fließtext unter dem Bild“ → `teksto`, „Einkaufsliste“ und „Speisemenü“ → `goal-unknown` (`liste`, `menü` unter sechs Buchstaben), „Kontextmenü“ → `menuo` (nicht `navigado`), „Spielfeld“ → `goal-unknown`, „Bemerken“, „Anmerken“, „Vormerken“, „Abwarten“ → `goal-unknown` (Vorderteil). Was die Regel nicht trennen kann, steht als Pin: „Landkarten“, „Eintrittskarten“ → `karto`, „Volltreffer“ → `plenstato` (B-4). Jugxo `jug_01M5A01VGBEYM573ZX1YEFNQQ0`.

#### D-08 N5-3: `props` im `brief`

Der `brief` nennt nach den Achsen jede übrige Prop der Skemo mit Namen und Typ, in der Reihenfolge der Skemo: `props: [{ name, type }]` (`type` = `kind` der Skemo: `boolean`, `string`, `number`); ohne solche Prop fehlt das Feld. Das Ausgabeschema von `get_ero` ist additiv erweitert. Gemessen (`ceil(Bytes/3)`, Grenze 750): `kampo` 525 → **646** (der größte), `butono` 546 → 597, `elektilo` 379 → 466, `kompletigilo` 353 → 465 (nennt `loading: boolean`), `tabelo` 427 → 456; jeder andere brief darunter. Alle Props statt nur der booleschen (Abweichung 3, O-6): ein Agent soll auch `min-chars` und `value` kennen; die Grenze trägt es.

#### D-09 O-39: eine Antwort für die Schublade

`dialogo.drawer` war `not-supported` mit eigener Kialo, `sxvebilo.drawer` `ask-human`; welche Grenze sprach, entschied die Ero-Ordnung (Nachlese 4 B-4). Jetzt beide `ask-human` mit derselben Kialo: „A panel that slides in from the edge is neither a dialog nor a popover, because it is a region of the page with its own flow (a Sxablono), not a question and not a layer beside a trigger; a person decides until the Sxablonoj come.“ Stichwörter unverändert. Datenkorrektur mit Jugxo `jug_01M59ZYEQEQ7SQRAXHET75FMZJ` (Bezug `dialogo`).

#### D-10 O-10: `prop:<name>` liest Zahl-Props

**Begründung:** Eine Constraint liest einen Slot als belegt/leer (Spec 009 D-04) und eine Text-Prop ebenso (Spec 011 ① D-08). Eine Zahl-Prop ist für diese Frage dasselbe: gegeben oder nicht. Die Lesart wird erweitert, nicht die Bedeutung: `filled`/`empty` heißen, was sie bei einem Text heißen; eine boolesche oder eine Enum-Prop hat eigene Werte und wird über sie eingeschränkt. Keine neue Regulo-Semantik: `file-constraints-stated` verlangt schon „the kinds **and the size** in its help“; bisher prüfte die Constraint nur die Hälfte (`accept`).

**Gebaut:** `FILLABLE_KINDS` (`string`, `number`) in `skemo-rules.ts` – `skemo-constraint-invalid` nimmt `prop:<zahl>` an, `prop:<boolesch>` und ein anderer Wert als `filled`/`empty` bleiben ungültig; `usage.propStates` liest Zahl-Props (was die Instanz gibt, nie den Default); das Web-Element liest das Attribut einer Zahl-Prop (nie den Default) und warnt mit der Kialo. **Daten:** `alsxutilo` dritte Constraint `when slot:help empty ⇒ prop:max-size [empty]`, die Kialo beider Constraints sagt jetzt „a field with accept or max-size states …“.

**Betroffene Constraints** (alle `prop:<name>` im Modelo): `alsxutilo` #1 (`prop:accept`, Text) und **#2 neu** (`prop:max-size`, Zahl); `elektilo` #1 (`prop:empty-label` ⇒ `prop:placeholder`, Text); `ikono` #0–#3 (`intent` ⇒ `prop:label`, Text); `kampo` #2, #3 (`prop:min`/`prop:max` ⇒ `kind`, Text). Keine bestehende Constraint liest eine Zahl-Prop; kein bestehender Check kippt (Modelo-Suite, `check:regularo`, `check:parity`, Vitrino- und Alirebleco-Check ohne neuen Befund). Weitere Zahl-Props, die eine Constraint künftig lesen könnte: `kompletigilo.min-chars`, `mezurilo.value/min/max`, `pagxigilo.total-pages/siblings`, `tekstareo.rows`.

#### D-11 O-14: die Prüfung gehört dem Element (Spec 015 ② D-11, B-10)

Der Weg der ganzen Zahl (Spec 011 ① E8, Spec 015 ② D-11): das native Feld trägt nichts, was die Plattform beurteilt; das Element setzt die Gültigkeit über `ElementInternals`, die Worte kommen von einem nie gezeigten Probe-Feld.
- **Adresse, Webadresse:** `kind=email|url` ist ein Textfeld mit `inputmode` `email` bzw. `url` – die Tastatur der Art bleibt (O-8). `#formMismatch` fragt ein Probe-Feld der Art (`type=email|url`) nach `typeMismatch` (die Grammatik der Plattform, keine eigene), `#probeMessage` liefert dessen Meldung.
- **Datum:** `type=date` bleibt (der Dialog der Plattform). `#dateOutside` vergleicht `YYYY-MM-DD` als Text mit `min`/`max` (lexikalisch gleich chronologisch); `rangeUnderflow`/`rangeOverflow` setzt das Element, die Worte liefert ein Probe-Datum mit denselben Grenzen. `min`/`max` stehen am nativen Feld nur für den Dialog und nur, solange das Datum darin liegt – sonst wäre das native Feld ungültig und zeigte die Blase (O-9). Ein halb getipptes Datum (`badInput`) kennt nur die Plattform; es bleibt ihr Wort (B-8).

Browser (`pflicht.spec.ts`, Vorbild Spec 015 ②): je Art ein falscher und ein richtiger Wert – das native Feld nie `:invalid`, ohne Meldung; das Ero `typeMismatch` bzw. `rangeUnderflow`/`rangeOverflow` mit genau der Meldung des Probe-Felds, das Formular sendet nicht; Grenzen zurück, sobald das Datum darin liegt. Chromium, Firefox, WebKit.

### Dialoge vorher/nachher

Gemessen mit **1 488 Zeichenketten** – jedes String-Literal (ohne Testtitel) der Dateien mit `suggest_ero`-Aufrufen: MCP-e2e `s007`–`s018`, `s7-*`, `ak09`, `eroj-tools.test.ts`, Modelo `data/*.test.ts`, `suggest-ero.test.ts` –, je ohne Sprache, `de` und `en` (4 464 Antworten), gegen den Stand von ① (`ee67be1`, Inhalt gleich `3434094`) und den grünen Stand. Geändert: 33 Antworten. Spec-Dialoge, deren Antwort sich ändert:

| Dialog (Herkunft) | vorher | nachher | Jugxo |
|---|---|---|---|
| „Karte für ein Projekt mit Bild und Titel“ (Messung A15, N5-2; ohne Sprache und `de`) | ask-human: Grenze `teksto.heading` (titel), `karto.card` (karte), `titolo.page-title` (titel) | `karto`, `card` (karte), Regulo `one-primary-per-container` | `jug_01M5A01V471S1ZBV2YKH1D8GZY` |
| „Projektkarten“ (A16, O-17; ohne Sprache und `de`) | goal-unknown | `karto`, `card` (karten) | `jug_01M5A01VGBEYM573ZX1YEFNQQ0` |
| „Seitenpaneel mit dem Inhalt“ (Spec 011 ②, `dialogo.test`; ohne Sprache und `de`), „Drawer“/„drawer“ (alle drei) | Grenze `dialogo.drawer` `not-supported` | Grenze `dialogo.drawer` `ask-human`, Kialo der Schublade | `jug_01M59ZYEQEQ7SQRAXHET75FMZJ` (O-39) |
| „Zeilen mit Seitennummerierung“ (Spec 011 ④, `tabelo.test`; ohne Sprache und `de`) | ask-human: Grenze `tabelo.pagination` (use-instead `pagxigilo`), `pagxigilo.paginate`, `tabelo.table` | ask-human: Grenze `tabelo.pagination`, `tabelo.table` – der `pagxigilo` steht nur noch über die Grenze | – (bleibt Rückfrage) |

Alle übrigen Spec-Dialoge antworten bitgleich (008–017, auch „Feld für den Lebenslauf als PDF“ → `alsxutilo`, „Tabs, um zwischen Liste und Formular zu wechseln“ → Rückfrage, „Ich brauche ein Mülleimer-Icon zum Löschen in jeder Tabellenzeile“ → Rückfrage, „a sidepanel that slides in“ → `sxvebilo.drawer`, jetzt mit der gemeinsamen Kialo). Neue Testdialoge (keine Spec-Dialoge): „Card for a project with image and title“ (en) → `karto` (vorher Rückfrage), „Projektkarten mit Bild“, „Kontaktkacheln“ → `karto`, „Landkarten“, „Eintrittskarten“ → `karto`, „Volltreffer“ → `plenstato` (falsche Freunde, B-4). Keine Dialoge, aber Zeichenketten der Tests, deren Antwort kippt: „emailadresse“ (ein Kommentar) → `kampo` `enter-text` über „adresse“ (B-4), „{file} ist zu groß: Wähle …“ (Fehlertext) → `alsxutilo` statt Rückfrage („zu“ als Partikel, O-2), „Switches between views of the same thing …“ (Zweck des `langetaro`) → `langetaro` statt Rückfrage, „s, a switch of views the langetaro“ (Bruchstück) → `sxaltilo` statt Rückfrage.

### Abweichungen vom Briefing

1. **N5-2: nur ein Ero im Kopf** (D-06): nennt der Kopf zwei Eroj, fragt der Gvidanto weiter; fremde Uzo-Einträge nach dem Bindewort fallen weg (Grenzen und Alternativen), außer sie nennen das Ero des Kopfs (O-3).
2. **O-17: Vorderteil ab vier Buchstaben, nur im zweiten Durchgang, nur deutsch** (D-07): das Briefing nennt sechs Buchstaben und die Normalisierung von N-2; ohne Vorderteil-Grenze träfen Verben mit Präfix (O-4).
3. **N5-3: alle Props ohne Achse**, nicht nur die booleschen der Überschrift des Briefings (D-08, O-6); der Text des Briefings sagt „Props ohne Achse“.
4. **N5-5: in Figma ohne Verbindung zur Eigenschaft `label`** (D-03, O-7): die kleinste Größe schreibt die Initiale selbst.
5. **O-14: Adresse und Webadresse als Textfeld mit `inputmode`** (D-11, O-8): das Briefing sagt „das Element prüft selbst“; ohne den Typwechsel bliebe das native Feld für die Form ungültig.
6. **Testmaße zwischen rot und grün:** N5-6 misst die Breite der Reihe gegen die Listbox minus den Vorbehalt des Fokusrings (der rote Test verlangte die volle Breite, D-04); der O-10-Test der Skemo-Regeln vergleicht die Pfade sortiert (die Reihenfolge der Befunde ist nicht Teil der Regel).

### Befunde / Mankoj

- **B-3 Der eigene Abbruch:** Das Plugin entfernt seit N-7 den gezeichneten Haken eines früheren Laufs aus dem Indikator des `markobutono`; `lostSince` las danach dessen Namen. In einer Datei von vor N-7 wäre jeder Lauf in `done` abgebrochen wie in der Messung (N5-1). Das alte Doppel las entfernte Knoten weiter und verdeckte das; der Test „takes the hand-drawn check vector …“ war mit dem strengen Doppel rot.
- **B-4 Falsche Freunde, die die Regel nicht trennt** (O-17): „Landkarten“, „Eintrittskarten“ → `karto`, „Volltreffer“ → `plenstato` (Pin); „Emailadresse“ (zusammengeschrieben) → `kampo` `enter-text` über „adresse“, weil „mailadresse“ hinter „e“ unter der Vorderteil-Grenze liegt („E-Mail-Adresse“ bleibt `email`).
- **B-5 Uzo-Wortenden im ersten Durchgang:** „Bestellung abschließen“ → `butono` über die Grenze `ligilo.action` („schließen“ am Wortende, Spec 007 D-06) – älter als dieser Branch, unverändert; die Vorderteil-Grenze gilt nur für Goals im zweiten Durchgang.
- **B-6 Bindewörter wörtlich:** „zu“ öffnet auch als Partikel einen Attributteil („zu groß“); Zusammenziehungen („zum“, „zur“, „vom“, „beim“, „fürs“) sind keine Bindewörter (O-2).
- **B-7 Initiale in Figma ohne Eigenschaft:** eine Instanz der kleinsten Größe folgt der Eigenschaft `label` nicht; die Initiale wird am Text geändert (O-7).
- **B-8 Datum halb getippt:** `badInput` kennt nur die Plattform; das native Feld ist dann ungültig und kann die Blase zeigen. Solange ein getipptes Datum außerhalb der Grenzen liegt, zeigt der Dialog keine Grenzen (O-9).
- **B-9 Fläche im Vorbehalt:** die Fläche des aktiven Vorschlags ist um den Vorbehalt des Fokusrings schmaler als die Listbox (D-04); im Web liegt die Reihe ohne Vorbehalt in der Liste (der Ring ist eine Outline). In Figma zu messen, Punkt 4.
- **B-10 Lint:** die Warnungen in `web-component.test.ts` (`DESIGN`), `menuo.spec.ts` und Modelo (`evaluate.ts`, `parity/index.ts`, `build.ts`, `spec004-reguloj.ts`, `workflow.test.ts`, `release-workflow.test.ts`) sind älter als dieser Branch – nicht angefasst.
- **Mankoj:** keine neuen (`check:mankoj` unverändert).

### Offen (für den Maintainer)

- **O-2 Bindewörter** (D-06, B-6): genau die des Briefings, als ganzes Wort. Vorschlag: so lassen; Zusammenziehungen („zum Löschen“) kippten F-1 aus Nachlese 4 (der Kopf „Mülleimer-Icon“ wäre allein der `ikono`).
- **O-3 Reichweite des Kopfworts** (D-06, Abweichung 1): fremde Grenzen **und** Alternativen nach dem Bindewort fallen weg – anders als N-4 (O-36), wo eine fremde Alternative ein Ero nennt und bleibt. Vorschlag: so lassen (die Position sagt, was gemeint ist; eine Alternative im Attributteil beschreibt das Gesuchte nicht).
- **O-4 Komposita** (D-07, Abweichung 2): Vorderteil ab vier Buchstaben, zweiter Durchgang, nur deutsch. Vorschlag: so lassen; Alternative: ohne Vorderteil-Grenze (dann „bemerken“ → `markobutono`, „abwarten“ → `plenstato`, je mit Jugxo).
- **O-5 Nicht trennbare falsche Freunde** (B-4): Vorschlag: so lassen und pinnen; Kandidat, wenn es stört: ein Ausschluss je Stichwort als Datum (wie Nachlese 4 B-2).
- **O-6 `brief` nennt alle Props ohne Achse** (D-08, Abweichung 3): Vorschlag: so (größter brief 646 ≤ 750); Alternative: nur boolesche und Zahl-Props (`kampo` 578).
- **O-7 Kleinste Größe des `avataro`** (D-03, B-7): Regel „erster Wert der Achse `size`“ im Celo, Figma ohne Eigenschaft. Vorschlag: so lassen; Alternative: die Zahl der Initialen je Größe als Datum der Skemo (Schema-Erweiterung).
- **O-8 Adresse und Webadresse als Textfeld** (D-11, Abweichung 5): Vorschlag: so (der Weg der ganzen Zahl, `inputmode` hält die Tastatur, `autocomplete` die Autofüllung); Alternative: `type=email|url` behalten und die Blase bei falscher Form hinnehmen.
- **O-9 Grenzen des Datums am nativen Feld** (D-11, B-8): nur solange das Datum darin liegt. Vorschlag: so; Alternative: immer setzen (die Blase bei einem getippten Datum außerhalb bleibt).

### In Figma zu messen

Grüne Tests sind für Figma keine Abnahme. Mit dem Plugin aus dem Build dieses Branches, in f10b-5 (Version vorher sichern):

1. **N5-1:** Ein Lauf endet ohne Abbruch; nur wenn es sich ergibt: ein Lauf nach einem kurzen Verbindungsabbruch nennt verschwundene Knoten unter `lost` mit `removed: true` statt abzubrechen.
2. **N5-4:** `alsxutilo – mit zwei Dateien`, `avataro – mit Bild`, `karto – ohne Bild`, `navigado – vertikal`, `pagxigilo – Seite 1/5/10 von 10` stehen auf `color/background/canvas` (gebunden); Hilfe, Dateinamen und Größen lesbar in komuna hell und dunkel und in ekzemplo.
3. **N5-5:** `avataro` `size=small` zeigt „E“ im Kreis, `medium` und `large` „EM“; eine Instanz `size=small` ändert ihre Initiale nicht über die Eigenschaft `label` (O-7).
4. **N5-6:** `kompletigilo` `expanded=true`: die Fläche des aktiven Vorschlags („Zwei“, `color/background/sunken`) reicht über die Breite der Listbox (bis auf den Vorbehalt des Fokusrings, B-9); „Eins“ (gewählt) ebenso breit.
5. **O-41:** `ligilo`: Eigenschaft `external` (BOOLEAN, aus) im Set; eingeschaltet erscheint nach dem Label die Glyphe `external` in der Farbe des Labels und der Größe der Variante; Moduswechsel komuna → ekzemplo wechselt die Glyphe.
6. **Zweiter Lauf** schreibt nichts (Bericht ohne `updated` an diesen Sets).
