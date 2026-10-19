# Spec 015 – Eroj Runde 4 – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-17, unverändert kopiert) · **Briefing:** `briefing-p0-2026-10-17.md` (Maintainer-Ordner, nicht kopiert) · **Basis:** gestapelt auf Spec 014 ⑤ (Branch `261017-spec-014-aufklappen-e3bf97`), bis 014 gemergt ist · **Regel 0** (12.10.) gilt: Weg des `butono` zuerst, sonst kleinste Änderung mit Eintrag hier; Tokens, Regulo-Semantik und Constitution nie ändern; nie eine Grenze schwächen.

Drei PRs, gestapelt (E9): ① Navigation von Spec 014 ⑤, ② Eingabe von ①, ③ Inhalt von ②.

## ① Navigation

**Branch:** `261018-spec-015-navigation-e3bf97` (von Spec 014 ⑤, nach dem Merge von #71–#74 auf `main` rebased) · **Datum:** 2026-10-18 · **Stand:** fertig gebaut; Abnahme offen.

### Zusammenfassung

1. **`pagxigilo`** (D-01, D-03): das Seitenblättern – `page` (Pflicht, Zeichenkette wie `navigado.page`, Abweichung 1) und `total-pages` (Pflicht), `label` mit den Wörtern des Modelo („Seitenblättern“, `a11y.texts label-empty`), `mode` `button` | `link` (Ereignis `page-change`, abbrechbar; `href-template` `?page={page}`), `siblings` (1). Zustände rest/hover/focus/disabled am Eintrag; `current` ist der Zustand eines Eintrags (`SkemoSlot.entry`, E7), keine Achse. Teile `item` (Fläche und Farbe nach current × Zustand aus `color.navigation.*`, Gewicht `font.weight.semibold`), `border` (Rand `border.width.strong` nur aktuell – nie nur Farbe), `ellipsis`, `prev`/`next` (die Glyphen `chevron-left`/`chevron-right`, gespiegelt in RTL), `box`, `focus-ring`. Rolle `navigation`, `aria-current="page"`, `aria-disabled` an den Enden; jede Zahl heißt „Seite N“ (`items-name`), die Pfeile „Vorherige Seite“/„Nächste Seite“ (`prev-name`/`next-name`). Goal `paginate`. Uzo: `load-more` → `butono`, `views` → `langetaro`, Grenzen `infinite-scroll`, `page-size-select` (ask-human); die `tabelo` schließt `pagination` (use-instead), die `langetaro` schickt `list-pages`, `ikono` komponiert.
2. **`spuro`** (D-02, D-04): die Brotkrumen – `label` („Pfad“, Vorschlag O-1), `page` (Schlüssel des aktuellen Eintrags; leer: der letzte). Einträge sind die Links der Plattform im Light DOM (wie `navigado`, E10), mindestens zwei; der letzte ist Text mit `aria-current`. Teile `item` (Farbe `color.link.*` bzw. `color.text.default` aktuell, Gewicht aktuell), `underline` (nur die Links), `separator` (`chevron-right`, dekorativ), `box`, `focus-ring`. Goal `breadcrumb` mit `link-label-names-destination` (E5 ausgeweitet). Uzo: `main-navigation` → `navigado`, `steps` nicht abgedeckt, Grenze `collapsed-middle`; die `navigado` schließt `breadcrumb` (use-instead), `ligilo` und `ikono` komponieren.
3. **Modelo:** `a11y.texts` kennt `<part>-name` und `<slot>-name` (kleinste Änderung, D-01); Ikonaro `chevron-left` (Phosphor `caret-left`, regular und fill, gespiegelt); Zahlwörter bis neunundzwanzig.
4. **Projekcioj:** Web-Celo Host `pagination` (Shadow, baut die Seiten selbst) und Brotkrumen als Light-Host mit manueller Slot-Zuweisung in eine geordnete Liste (D-03, D-04); Figma Bauformen `pagination`/`breadcrumb` mit Zeichnung im Plugin (D-05); Vitrino Seite 5 von 10 und drei Ebenen (D-06); Make-Kit zwei Sätze (D-07); React-Typen (D-08).

### Entwurfsentscheidungen

#### D-01 `pagxigilo`: die Seiten als Einträge, die Namen aus dem Modelo
`current` ist der Zustand eines Eintrags wie bei der `navigado` (`entry.equals: page`), darum ist `page` eine Zeichenkette (das Element liest sie als Zahl). Die gesprochenen Namen der Pfeile und der Zahlen stehen in `a11y.texts`; dafür nimmt `skemo-a11y-invalid` zwei neue Schlüsselformen an: `<part>-name` (der Name eines Teils ohne eigenen Text) und `<slot>-name` (das Wort vor dem Text eines Eintrags). Kleinste Änderung, keine neue Prüfart.

#### D-02 `spuro`: Light DOM wie die `navigado`, Liste im Shadow
Die Links bleiben die der Plattform (E10). Die geordnete Liste (APG Breadcrumb) liegt im Shadow: jedes Kind wird einem eigenen `li` zugewiesen (manuelle Slot-Zuweisung wie beim `menuo`), der Chevron steht nach jedem Eintrag außer dem letzten. Der Name der Landmarke ist „Pfad“ (O-1).

#### D-03 Web-Celo `pagination`
`<nav part="list"><ol part="pages">` – das Element schreibt die Einträge aus `page`, `total-pages`, `siblings`: erste, letzte, aktuelle und Geschwister, je Lücke eine Auslassung (drei Punkte als SVG-Zeichen wie der Strich des leeren Werts, kein Textknoten – `ero-hardcoded-string`). `mode=button`: Buttons mit `page-change`; `mode=link`: Links aus `href-template`. An den Enden `aria-disabled` (ein Link kennt kein `:disabled`; die Zustandsselektoren des Hosts nehmen `[aria-disabled="true"]`).

#### D-04 Web-Celo Brotkrumen
Der Light-Host der `navigado` mit `breadcrumb`-Flag: Shadow `<nav part="list"><ol part="items">`, `#assign` und `#decorate`; das Dokument-Stylesheet selektiert `fm-spuro > *` (Link oder Text), `underline` als Textdekoration wie beim `ligilo`; `box` und `separator` im Shadow.

#### D-05 Figma
Bauformen `pagination` (Einträge 1 2 3, die erste aktuell; `prev`/`next` als Icons) und `breadcrumb` (die drei Wörter der Vitrino, das letzte aktuell; `separator` als Icon); das Label-Property nimmt das Wort aus `a11y.texts label-empty`. Die Zeichnung im Plugin: `drawPagination`, `drawBreadcrumb` (B-2).

#### D-06 Vitrino
`<fm-pagxigilo total-pages="10" page="5">` (beide Auslassungen); `<fm-spuro page="3">` mit den drei Links; der Name der Landmarke kommt aus dem Element. Die Zeile „unbekannt“ bleibt dem `mezurilo` (ein Zahlbeispiel allein erzeugt sie nicht mehr).

#### D-07 Make-Kit, D-08 React
Zwei Sätze aus der Rolle `navigation` mit den Teilen `ellipsis`/`separator`; die `navigado`-Sätze gelten nur dem Ero ohne diese Teile. React-Typen aus der Skemo (`totalPages`, `hrefTemplate`).

### Arkitekturo-Abdeckung

| Artikel | Wie ① ihn trägt |
|---|---|
| Art. VIII (keine Strings im Ero) | Auslassung als SVG-Zeichen; alle Namen aus `a11y.texts` |
| E7 (Zustand eines Eintrags) | `current` als `SkemoSlot.entry` bei beiden |
| E10 (Links der Plattform) | `spuro` im Light DOM |
| G2 (Verflechtung) | `tabelo.pagination`, `navigado.breadcrumb` → use-instead; `langetaro.list-pages`; `ikono`/`ligilo` komponieren |
| G3 (Stichwörter) | `goal-keyword-shared` ohne Warnung; „pages“/„Seiten“ bleiben `navigado`/`langetaro` |
| Internacia | `chevron-left` gespiegelt |

### Abweichungen von der Spec

1. `page` ist eine Zeichenkette (D-01), kein Zahl-Prop.
2. `prev`/`next` sind die Glyphen (Teile mit `size`); der Teil `current` der Spec ist der Eintragszustand, `border` trägt den Rand.
3. „Pagination unter der Tabelle“ trifft `tabelle` (Goal der `tabelo`) und `pagination` gleich stark: der Gvidanto fragt (OP-12); „Pagination“ und „Seitennummerierung“ allein sind der `pagxigilo` mit dem Kialo der `tabelo`.
4. Figma zeigt im Set eine Zeile 1 2 3 … mit Pfeilen; Seite 1, 5 und 10 von 10 stehen als Beispiele daneben (O-2).
5. `label` ist bei beiden optional (die Wörter des Modelo stehen ein), nicht Pflicht wie bei der `navigado`.

### Befunde / Mankoj

- **B-1** Die Vitrino-Zeile „unbekannt“ hing an jedem Zahlbeispiel; jetzt am Slot `value-text`. Kein Manko.
- **B-2 (behoben)** Figma-Plugin: die Bauformen `pagination` und `breadcrumb` zeichnet jetzt `drawPagination` (Pfeil zurück, die Seiten 1 2 3 als Einträge in einer eigenen Reihe, die Auslassung als Text in einem Kasten ihrer Mindestbreite, Pfeil vor – die Pfeile als Einträge mit den Glyphen jedes Aspekto, in der Farbe einer nicht aktuellen Seite) und `drawBreadcrumb` (drei Ebenen, nach jeder außer der letzten ein Chevron-Halter mit den Glyphen, die Unterstreichung als untere Kante wie bei der `navigado`); `STRUCTURE_BINDINGS.pagination`/`.breadcrumb` binden alles, was die Skemo bindet. Parität 29 Eroj, 0 Differenzen.
- **B-3 (behoben)** `fm-pagxigilo` benannte die Landmarke nach dem Entfernen von `label` nicht mit dem Wort des Modelo: die allgemeine Benennung am Ende des Renderns entfernte `aria-label`, sobald `label` leer war. Die Pagination benennt ihre Landmarke jetzt selbst (wie die Overlays), die allgemeine Benennung lässt sie aus.
- **B-4** Playwright klickt kein `aria-disabled`-Element; der Spec erzwingt den Klick (`force`).
- **B-5 (behoben)** Der Shadow-Stylesheet schrieb den Eintragszustand als `[aria-current="true"]`/`"false"`; das Element setzt `aria-current="page"` und sonst nichts – die aktuelle Seite bekam weder Fläche noch Gewicht noch Rand. `aria-current` ist jetzt anwesend/abwesend (`[aria-current]`/`:not([aria-current])`), wie die Light-Hosts es lesen; `aria-selected`/`aria-checked` bleiben `true`/`false`. Ein Browser-Spec prüft Gewicht und Rand der aktuellen Seite.
- **B-6 (behoben)** Eine nicht aktuelle Seite zeigte 2 px Rand: `border.width` `none` schrieb nichts, der Button behielt den Rand der Plattform. `none` schreibt jetzt `border-style: none` (nur der `pagxigilo` bindet eine Randbreite an `none`).
- **B-7** Der Figma-Plan ordnete eine Eigenschaft mit `sameAs` (die Unterstreichung der `spuro` in der Farbe des Eintrags) nicht dem Eintragszustand zu: er folgt jetzt dem `sameAs` beim Entscheiden, was je Eintrag gebunden wird. Kein Manko.
- **B-8** Das Web-Inventar der Parität las Zustände nur an `control`, `field`, `glyph`, `text` oder einem Light-Host; die Pagination liegt in `[part="list"] [part="item"]` und wird jetzt mitgelesen (die eigene Liste der `navigado` trägt nur ihre Ausrichtung und bleibt außen vor).
- **B-9 (behoben)** Die Links der `spuro` waren 17,5 px hoch (axe `target-size`, WCAG 2.5.8, im Vitrino-Check): `box.height` (`size.target.min`) stand auf der Liste im Shadow statt auf den Zielen. Die Höhe steht jetzt als Mindesthöhe der Einträge im Dokument-Stylesheet (wie bei der `navigado`); Abstand und Chevron bleiben im Shadow.
- **B-10** Das Ikonaro-Raster der Vitrino hat mit `chevron-left` sechzehn Namen; der Vitrino-Check zählt 16 × 3 + 4 Icons.
- **B-11 (behoben)** Die Vitrino gab der aktuellen Seite der `spuro` einen Link; nach der Spec ist sie Text ohne Ziel. Die letzte Ebene ist jetzt ein `span`.
- **B-12 (Befund, CI-Dauer)** Lauf 39126240312 (`60eae86`): der Job „Build, test, lint and Modelo checks“ brauchte 12 min 07 s – über der 12-Minuten-Grenze des Auftrags. Er wächst mit jedem Ero (⑤ auf `main`: 10 min 44 s). Rot war der Lauf an einem Typtest (`pagxigilo.tsx` erwartete einen Fehler für fehlendes `total-pages`; der React-Celo hält alle Props optional, die Pflicht meldet das Element zur Laufzeit) – ersetzt durch einen echten Typfehler (Zeichenkette für die Zahl). Die Aufteilung des Build-Jobs entscheidet der Maintainer (O-4).
- **B-13 (Abnahme S-1, behoben)** Die Ebenen der `spuro` standen in der Vitrino untereinander: der Shadow-Selektor eines Light-Hosts schickte jeden Teil an `[part="list"]`, so trug das `nav` selbst die Größe des Chevrons (`size.icon.small`, 16 px) und seine Farbe – der Pfad war ein Icon breit. Größe und Farbe des Chevrons stehen jetzt am Chevron, der Abstand an der Liste der Ebenen. Browser-Spec: eine Zeile bei ausreichender Breite, Umbruch bei Platzmangel, in RTL von rechts nach links.
- **B-14 (Abnahme S-2, behoben)** Nach der aktuellen Seite stand ein Chevron: das Attribut `hidden` verlor gegen das `display` des `fm-ikono`. Die letzte Ebene bekommt jetzt keinen Chevron (entfernt, nicht versteckt). Der alte Spec filterte `[hidden]` heraus und verdeckte den Fehler; der neue zählt sichtbare Trenner (Ebenen − 1).
- **B-15** Figma geprüft: die Bauform `breadcrumb` ist eine waagerechte Reihe der drei Ebenen mit zwei Chevrons, keiner nach der letzten; die `pagination` eine Reihe aus Pfeil, Seiten, Pfeil. Zwei Plugin-Tests halten das fest. Die Auslassung steht seit O-2 nach ihrer Seite im Eintrag dieser Seite (eine Reihe kann jetzt mehrere Lücken haben).

### Offen (für den Maintainer)

- **O-1 Name der Landmarke `spuro`:** „Pfad“ (de) / „Breadcrumb“ (en). **Entschieden (Maintainer, Abnahme ①): „Pfad“.**
- **O-2 Figma-Varianten:** Seite 1, 5 und 10 von 10 (Spec) als drei Beispiele neben dem Set. **Entschieden: ja – umgesetzt** (`examples` im Plan mit den Seiten, die das Web zeigt; `placeExamples` im Plugin).
- **O-3 `aria-disabled` statt `disabled`** an den Pfeilen (beide Modi gleich, fokussierbar wie APG-Toolbar). **Entschieden: ja** (so gebaut).
- **O-4 CI-Dauer:** der Build-Job liegt bei rund 12 min (B-12); ein zweiter Job für die Vitest-Suiten oder ein Shard würde ihn halbieren. **Entschieden: aufteilen – als erster Commit in 015 ②.**

## ② Eingabe

**Branch:** `261018-spec-015-eingabe-f027c6` (von `main` @ `7a05c6e`, ① gemergt als #75) · **Datum:** 2026-10-18 · **Stand:** fertig gebaut; Abnahme offen.

### Zusammenfassung

1. **CI-Aufteilung (O-4 aus ①, B-12; D-01):** der Job „Build, test, lint and Modelo checks“ wird drei Jobs — `checks` (Build, Perf, Lint, die sieben Modelo-Checks, Release), `unit` (die Vitest-Suiten jedes Pakets außer Projekcioj und Eroj) und `projekcioj` (die Vitest-Suite der Projekcioj in zwei Shards). Dazu baut `buildProjections` der Eroj-Specs einmal je Prozess statt einmal je Spec-Datei (D-02): der Loader eines Playwright-Shards verbrachte drei bis fünf Minuten mit 36 Bauläufen, bevor der erste Test lief. Kein Timeout angehoben (Regel 0.4).
2. **`alsxutilo`** (D-03, D-05): der Datei-Upload – `accept` (Text: Endungen und Medientypen, mit Komma), `max-size` (Zahl in Bytes), `multiple`, `dropzone` (Achse, Default false), dazu die Props des Felds (`required`, `disabled`, `invalid`, `name`); Zustände rest/hover/focus/disabled/invalid wie der `kampo` (ohne `readonly`, Abweichung 1) und `dragover`. Teile `label`, `required-mark`, `help`, `error`, `focus-ring`, `motion` wie beim `kampo`; `dropzone` (Fläche nach Zustand, `color.background.sunken` bei `dragover`; Raum `spacing.large` nur mit Ablagezone), `border` (Farbe nach Zustand, Strich `stroke.dashed` → `stroke.solid` bei `dragover`, `none` ohne Ablagezone), `drop-hint`, `choose` (der komponierte `butono emphasis=medium` mit `ikono upload`), `file-list`, `file-name`, `file-size`, `remove` (`butono emphasis=low` mit `ikono close`), `box`. Rolle `button` (so spricht die Plattform das native Datei-Eingabefeld), benannt durch das Label, beschrieben durch Hilfe und Fehler. Goal `upload` mit den Wörtern von G3. Uzo: `text-input` → `kampo`, Grenzen `upload-progress`, `image-preview` (ask-human), `camera-capture` (not-supported); der `kampo` schließt seine Grenze `file` (use-instead, Abweichung 2).
3. **Regeln (E5, G4; D-10):** neue Regulo `file-constraints-stated` (anpassbar) – geprüft über die vorhandene Slot-Constraint der Skemo (`slot:help` leer ⇒ `prop:accept` leer, gleichbedeutend mit „`accept` belegt ⇒ Hilfe belegt“) und eine Textregel auf der Hilfe (`min-words` 2) mit vier Jugxoj; sechs Feld-Reguloj des `kampo` und `spacing-owned-by-container` ausgeweitet.
4. **Modelo:** `a11y.texts` kennt `<prop>-invalid` (der Fehler, wenn ein Wert die Grenze eines Text- oder Zahl-Props bricht) und `<part>-count` (die Wörter zur Zahl der Einträge eines Teils) – kleinste Änderung an `skemo-a11y-invalid` (D-04); Ikonaro `upload` (Phosphor `upload-simple`, regular und fill, nicht gespiegelt); Zahlwörter bis `thirty`.
5. **Projekcioj:** Web-Celo Host `upload` (D-05: das native Datei-Eingabefeld liegt über dem komponierten `butono`, die Dateien sind der Formularwert, Prüfung von `accept` und `max-size` mit den Fehlern des Modelo, Liste, Zählansage, Ablage), Figma-Bauform `upload` mit Zeichnung im Plugin und dem Beispiel „mit zwei Dateien“ (D-06), Vitrino (D-07), Make-Kit-Satz (D-08), React-Typen (D-09).
6. **B-1 aus der Abnahme 014 ① (D-11):** kein Pflichtfeld zeigt mehr die Blase des Browsers („Fülle dieses Feld aus.“). Das native Steuerelement von `kampo`, `tekstareo`, `kompletigilo`, `elektilo` und `alsxutilo` trägt kein `required` und keine `pattern` mehr; die Gültigkeit ist allein die des Ero (ElementInternals), der Fehler steht am Feld. `required` bleibt sichtbar und hörbar (Pflichtmarke, `aria-required`), ein leeres Pflichtfeld hält das Formular weiter an. Einmal im Element-Template gelöst.

### Entwurfsentscheidungen

#### D-01 O-4: fünf CI-Jobs statt drei (Regel 0.1: der Schnitt von Nachlese 3 W1, fortgesetzt)

**Befund (B-12 aus ①):** Lauf 39127146926 (`1e9e5f2`, grün) — Job `unit` **11 min 20 s**, davon der Schritt „Test“ 10 min 24 s; die vier Vitest-Suiten liefen nebeneinander auf den vier Kernen des Runners: mcp 30 Dateien 224 s (Import 74 %), cli 5 Dateien 229 s, modelo 154 Dateien 315 s, **projekcioj 16 Dateien 622 s** (Tests 83 %: jeder Celo-Test baut und validiert das ganze Modelo). Lokal, allein, zehn Kerne: mcp 26 s, cli 42 s, modelo 51 s, projekcioj 258 s. Die Projekcioj-Suite ist die Wanduhr des Jobs und wächst mit jedem Ero (⑤ auf `main`: 10 min 44 s; ① rot 12 min 07 s). Perf, Lint und die Checks dahinter brauchen zusammen unter einer Minute.

**Schnitt:** `checks` — Install, Build, `pnpm perf` (allein, ohne Testlauf daneben: Spec 001 D-17 bleibt gewahrt), `pnpm lint`, `check:vortaro-lint|parity|regularo|mankoj|alirebleco|clean-room|ikonaro`, `check:release`; `unit` — Install, Build, `pnpm turbo run test --filter=!@fundamento/eroj --filter=!@fundamento/projekcioj` (der Filter nennt, was anderswo läuft: ein neues Paket — Spec 016 bringt `packages/agordilo` — läuft hier von selbst mit); `projekcioj` — Install, Build, `pnpm --filter @fundamento/projekcioj exec vitest run --shard=N/2` als Matrix (`fail-fast: false`; außerhalb von turbo baut die Vitest-Konfiguration des Pakets den Workspace zuerst, wie bisher bei jedem Paketlauf). `eroj` und `rendered-checks` unverändert; `PLAYWRIGHT_ENGINES` nur an den gerenderten Jobs; `timeout-minutes: 15` je Job. `workflow.test.ts` pinnt die fünf Jobs mit ihren Schritten, beide Matrizen, die Engines, das Budget; der Skript `check` der Wurzel (eine Reihe für lokal) ist unverändert. Vitest verteilt die Dateien eines Shards nach einem Hash ihres Pfades (deterministisch, nicht nach Dauer): die Balance der beiden Shards steht in der Messung; fällt eine Datei (die Plugin-Tests, 242 Tests) mit einer zweiten schweren in denselben Shard, ist ein dritter Shard der nächste Schritt, kein Timeout.

#### D-02 `buildProjections` einmal je Prozess (Regel 0.2: kleinste Änderung mit Wirkung)

Jede der 36 Spec-Dateien der Eroj ruft `await buildProjections()` auf Modulebene: alle Celoj von Kern + komuna + ekzemplo in ein Temp-Verzeichnis. Playwright importiert jede Datei einmal zum Sammeln der Tests (im Loader-Prozess) und noch einmal in jedem Worker — bisher je ein Bau je Import. Im Lauf 39127146926 stand der Loader von Shard 2 von 12:25:41 bis 12:30:40 ohne eine Zeile Ausgabe (Shard 1: drei Minuten), die Tests selbst brauchten danach 1 min 42 s (Shard 1) und 4 min 09 s (Shard 2). `serve.ts` merkt sich das Promise des Baus je Prozess; ein fehlgeschlagener Bau wird vom nächsten Aufrufer wiederholt. Der Bau ist für jede Datei derselbe und jede Datei liest ihn nur. `serve.spec.ts` pinnt: zweimal aufgerufen, dasselbe Verzeichnis und dieselbe Eingabe.

**Messung vorher** (Lauf 39127146926, `1e9e5f2`, PR-Lauf, Wanduhr = längster Job): **11 min 20 s** — `unit` 11:20, `eroj` Shard 1 5:53 / Shard 2 10:21, `rendered-checks` 8:25. **Nachher** (Lauf 39154145052, `2aa1e87`, PR-Lauf, alle Jobs grün): **7 min 57 s** — `checks` 1:18, `unit` 3:22, `projekcioj` Shard 1 3:51 / Shard 2 0:55, `eroj` Shard 1 2:06 / Shard 2 2:09 (vorher 5:53 / 10:21), `rendered-checks` 7:57 (vorher 8:25; jetzt die Wanduhr).

#### D-03 `alsxutilo`: das Feld des `kampo` um das native Datei-Eingabefeld (Regel 0.1)

Teile und Bindungen, die der `kampo` hat, sind kopiert (`label`, `required-mark`, `help`, `error`, `focus-ring`, `motion`); die Ablagezone ist neu und nimmt nur vorhandene Tokens (E1): `color.background.default` in Ruhe, `color.background.sunken` bei `dragover`, `stroke.dashed`/`stroke.solid`, `border.width.default`, `radius.role.surface`, `spacing.large`. `dropzone` ist eine boolesche Achse (wie `checked` des `sxaltilo`): sie schlüsselt Strich und Raum, ohne Ablagezone ist der Strich `none` und der Raum `none` – das Feld ist dann der Knopf allein. `dragover` ist ein Zustand (E2), kein Prop. `box.radius` ist `radius.role.control`: der Fokusring umschließt den Knopf, und Figma leitet die Fokus-Radien vom ersten Ero ab, das sie bindet (B-3). Rolle `button`: so spricht jede Engine das native Datei-Eingabefeld; der Host wird am Teil `dropzone` erkannt (wie die Pagination am Teil `ellipsis`).

#### D-04 `a11y.texts`: `<prop>-invalid` und `<part>-count` mit Platzhaltern (Regel 0.2)

Die Wörter des Knopfs (`choose-name` „Datei auswählen“), des Hinweises (`drop-hint-name` „oder hierher ziehen“) und jedes Entfernens (`remove-name` „{file} entfernen“) sind `<part>-name` (Spec 015 ① D-01). Neu: `file-list-count` („Ausgewählte Dateien: {count}“) als `<part>-count`, und `accept-invalid`/`max-size-invalid` als `<prop>-invalid` eines Text- oder Zahl-Props – der Fehler nach `error-says-what-to-do`, wenn eine Datei die Grenze bricht („{file} ist zu groß: Wähle eine Datei bis {max-size}.“). Die Platzhalter `{file}`, `{count}`, `{accept}`, `{max-size}` füllt der Celo; `skemo-a11y-invalid` nimmt die beiden neuen Schlüsselformen an, keine neue Prüfart.

#### D-05 Web-Celo Host `upload`

`<div part="field">` mit Label, `dropzone` (darin `picker` und `drop-hint`), `help`, `error` (der Slot und die eigene Meldung des Elements), `file-list` und der Live-Region `count`. Im `picker` liegt das native `input type=file` (`part="control"`, durchsichtig, `position: absolute; inset: 0` – gemessen: es dehnt sich in Chromium, Firefox und WebKit auf die Größe des Knopfs, B-6) über dem komponierten `fm-butono part="choose" emphasis="medium" inert` mit `fm-ikono upload`: das Eingabefeld ist das eine Ziel für Zeiger und Tastatur und wird gesprochen, der `butono` ist sein Bild (inert: kein zweiter Tabstopp, nichts doppelt gesprochen). Der Fokusring steht am `picker` (`:has([part="control"]:focus-visible)`). Das Element hält die Dateien (`#files`, Getter `files`): eine zweite Wahl ergänzt bei `multiple` (O-9), sonst ersetzt sie; das Element schreibt sie per `DataTransfer` ins native Feld zurück, setzt sie als `FormData` unter `name` (ElementInternals) und prüft `accept` (Endung, Medientyp, Familie `image/*`) und `max-size`: `typeMismatch`/`rangeOverflow` mit der Meldung aus `a11y.texts`, Arten und Größe in den Wörtern der Person (`Intl.ListFormat` „oder“, `Intl.NumberFormat` mit Byte/kB/MB, dezimal, O-7/O-8), ohne Datei bei `required` `valueMissing` mit „erforderlich“ (der Fehler zeigt sich erst nach dem Senden, wie beim `kampo`, F-8). Entfernen per Knopf „‹Datei› entfernen“ (`butono emphasis=low size=small` mit `ikono close`); der Fokus geht zum nächsten Entfernen, sonst zum Eingabefeld. Die Zahl der Dateien wird nach jeder Änderung angesagt. Die Ablagezone nimmt `dragenter`/`dragover`/`drop` nur mit `dropzone`; `dragover` markiert das Feld (`[part="field"][dragover]`, im Stylesheet der Zustand `dragover`, das Paritätsinventar liest ihn daran, B-8 aus ① gilt sinngemäß). `formResetCallback` leert die Liste. Der Upload selbst gehört der Anwendung (E7): sie liest `files` oder das Formular.

#### D-06 Figma: Bauform `upload`

Varianten `dropzone` × Zustand (12). Jede Variante ist eine Spalte: Label (die Label-Eigenschaft, Vorgabewort „Beschriftung“ wie beim Feld), Ablagezone (Fläche, Raum auf jeder Seite, Lücke, Radius, Rand mit dem Strichmuster der Variante; ohne Ablagezone ist der Strich unsichtbar), darin Ring → Lücke → der Knopf mit dem Bild des `butono emphasis=medium` (`composed.choose`: Fläche, Rand, Wort, `ikono upload`, Höhe, Raum, Radius) und der Hinweis (nur mit Ablagezone sichtbar), darunter Hilfe („PDF oder PNG, höchstens 5 MB“) und Fehler („Fehler“). Neben dem Set das Beispiel „alsxutilo – mit zwei Dateien“ (wie ① O-2): die Standard-Variante mit den beiden Dateien der Vitrino, je Zeile Name, Größe („1,2 MB“, „340 kB“, dieselbe Regel wie im Web) und ein Entfernen im Bild des `butono emphasis=low` mit `ikono close`. Die Pflichtmarke ist nicht gezeichnet (der Jugxo `jug_01M4S2R85WRAC5SV7CARH8RE7S` gibt den Teil frei, B-7). „Leer“ ist `dropzone=false, state=rest`, „Fehler“ `state=invalid`, „Ablagezone `dragover`“ `dropzone=true, state=dragover`.

#### D-07 Vitrino

Eine Zeile mit fünf Spalten (rest, `dropzone`, `required`, `disabled`, `invalid`), jede mit `accept=".pdf,.png"`, `max-size="5000000"` und der Hilfe „PDF oder PNG, höchstens 5 MB“ (der Satz der Spec, `file-constraints-stated`); der Fehler nur unter `invalid`. Der Vitrino-Check wählt und entfernt eine Datei mit der Tastatur allein (Tab, Leertaste öffnet den Dialog der Plattform, Tab, Enter).

#### D-08 Make-Kit, D-09 React

Ein Satz aus der Rolle `button` mit dem Teil `dropzone`: „Every file a form asks for is an `<Alsxutilo>` whose help names the kinds and the size it takes (`accept`, `max-size`); a text a person types is a `<Kampo>`, and sending the files is the application's.“ Der `butono` der übrigen Sätze ist die Rolle `button` ohne `dropzone` (B-3). React-Typen aus der Skemo: `accept` Text, `maxSize` Zahl, `multiple`/`dropzone` boolesch; der Typtest prüft zwei echte Typfehler (`maxSize="5 MB"`, `dropzone="yes"`).

#### D-10 `file-constraints-stated` ohne neue Prüfart

Die Slot-Constraint der Skemo liest Slots nur in `when` (`skemo-constraint-invalid`), also steht die Regel umgekehrt da: `when: { "slot:help": "empty" }, allowed: { "prop:accept": ["empty"] }` – dieselbe Aussage. Verletzt meldet `check_usage` `ero-prop-constraint` mit der Kialo, das Web-Element warnt in der Konsole. Wie die Hilfe lautet, prüft eine Textregel der Uzo auf `slot:help` (`min-words` 2, anpassbar, `USAGE_ENFORCERS` als `textRule`) mit je einem richtigen und falschen Beispiel in de und en (vier Jugxoj). `max-size` allein liest die Constraint nicht: `prop:<name>` gilt nur für Text-Props (Abweichung 3, O-10).

#### D-11 B-1: die Gültigkeit gehört dem Ero, nicht dem nativen Steuerelement (Regel 0.2, einmal im Template)

**Ursache:** Chromium zeigt beim Überfahren eines nativen Formularelements dessen `validationMessage` als Tooltip (Blink: `DefaultToolTip` von `InputType`, `HTMLTextAreaElement`, `HTMLSelectElement`), Firefox ebenso. Das Element setzte `required` (und beim `kampo kind=number` ein `pattern`) am nativen Steuerelement im Shadow: es war `:invalid`, seine Meldung „Fülle dieses Feld aus.“ war die Blase. Für das Formular zählte dieses Steuerelement nie (es liegt im Shadow, ohne Formular); die Gültigkeit setzte das Element ohnehin über `ElementInternals`.

**Lösung:** Das native Steuerelement trägt keine Einschränkung, die die Plattform beurteilt – kein `required` (`kampo`, `tekstareo`, `kompletigilo` im gemeinsamen Feld-Render, `elektilo` im Select-Render, `alsxutilo`), kein `pattern` (die ganze Zahl prüft `#validate` selbst; die Worte der Plattform für den Fehler liefert ein nie gezeigtes Probe-Feld, wie schon bei den Grenzen). Pflicht bleibt `aria-required` und Pflichtmarke; `valueMissing` mit „erforderlich“ (oder dem Text des Fehler-Slots) setzt das Element über `ElementInternals`, das Formular sendet nicht, der Fehler zeigt sich erst nach dem Senden oder einer Eingabe (F-8 unverändert). Der `markobutono` (eine Schaltfläche mit Rolle `checkbox`) und der `elekto` hatten nie eine native Einschränkung; Select, Kontrollkästchen/Schalter und Radiogruppe bieten jetzt wie die Felder `validity`, `validationMessage` und `checkValidity()` an (Abweichung 7).

**Nachweis (rot zuerst):** Einen Tooltip der Plattform kann kein Browser-Spec lesen. `pflicht.spec.ts` prüft darum, woraus er gemacht ist: je leeres Pflichtfeld der sechs Eroj ist das native Steuerelement ohne `required`, nicht `:invalid`, mit leerer `validationMessage` – vor und nach dem Sendeversuch –, das Ero dagegen `valueMissing` mit Meldung, `aria-required`, Marke sichtbar, Formular nicht gesendet; ein `kampo kind=number` mit „abc“ hat am nativen Feld kein `pattern` und keine Meldung, am Ero `patternMismatch` mit den Worten der Plattform. `web-component.test` pinnt dasselbe im erzeugten Code.

### Arkitekturo-Abdeckung

| Artikel | Wie ② ihn trägt |
|---|---|
| Art. V (Clean Room) | `upload` aus Phosphor Icons (MIT) mit Herkunft in `<metadata>`, regular (komuna) und fill (ekzemplo); `check:ikonaro`, `check:clean-room` ohne Befund |
| Art. VIII (keine Web-Begriffe, keine Strings im Ero) | Skemo-Namen `accept`, `max-size`, `multiple`, `dropzone`, `choose`, `file-list` (kein `input`, kein `button`); jedes Wort aus `a11y.texts`, Größe und Arten über `Intl` in der Sprache des Dokuments |
| E1 (keine neuen Tokens) | nur vorhandene Rollen, `stroke.solid` gab es |
| E2/E3 (Namen, Zustände am bedienten Teil) | Zustände am nativen Eingabefeld (`:has()` wie beim `kampo`), `dragover` am Feld |
| E5 (ausweiten statt vervielfachen) | sechs Feld-Reguloj und `spacing-owned-by-container` ausgeweitet, eine neue Regulo |
| E7 (Upload gehört der Anwendung) | das Element wählt und prüft; Getter `files`, `change`, `FormData` |
| G2 (Verflechtung) | `kampo.file` → use-instead; `alsxutilo.text-input` → `kampo`; `ikono` komponiert |
| G3 (Stichwörter) | `goal-keyword-shared` ohne Warnung (`check:regularo` 0 Warnungen) |
| Internacia | die Liste spiegelt sich in RTL (Browser-Spec); `upload` spiegelt nicht |
| Fehler am Feld, nie in einer Blase (B-1) | kein natives Steuerelement eines Felds trägt `required` oder `pattern`; die Gültigkeit setzt das Ero über `ElementInternals` (D-11) |

### Abweichungen von der Spec

1. Zustände: ohne `readonly` (ein Datei-Eingabefeld kennt keinen Nur-Lese-Zustand) und ohne Achse `size` (die Spec nennt sie nicht; der Knopf ist der `butono` in `medium`).
2. „`kampo`: neues `instead` `file`“: die vorhandene Grenze `file` des `kampo` wird `use-instead` → `alsxutilo` (der Weg von ①: `tabelo.pagination`, `navigado.breadcrumb`); ein zweiter Eintrag mit denselben Stichwörtern wäre doppelt.
3. `file-constraints-stated`: die Pflicht der Hilfe steht als Skemo-Constraint und ist darum fest (`ero-prop-constraint`, keine Jugxo-Ausnahme); anpassbar ist die Textregel auf der Hilfe. `max-size` ohne `accept` liest die Constraint nicht (O-10).
4. „file input“ trifft das Goal des `kampo` („input“) und des `alsxutilo` („file“) gleich stark: der Gvidanto fragt mit beiden Kandidaten (OP-12, wie ① Abweichung 3); „Datei hochladen“, „Upload“, „Anhang“, „attachment“ sind der `alsxutilo`.
5. Neu gegenüber der Spec: der Hinweis der Ablagezone („oder hierher ziehen“, `drop-hint`) – ohne ihn sagt eine gestrichelte Fläche nicht, wozu sie da ist.
6. Figma: „leer“, „Fehler“ und „Ablagezone `dragover`“ sind Varianten, „mit zwei Dateien“ ist ein Beispiel neben dem Set (wie ① O-2).
7. B-1 (D-11): neben der Lösung bekommen `elektilo`, `markobutono`/`sxaltilo` und `elekto` die drei Gültigkeits-Mitglieder (`validity`, `validationMessage`, `checkValidity()`), die die Felder schon hatten – sonst ließe sich ihre Gültigkeit von außen nicht prüfen (der Spec braucht sie). Die Briefing-Liste nennt den `kompletigilo` nicht; er teilt das Feld-Render des `kampo` und ist mit gelöst.

### Befunde / Mankoj

- **B-1 (CI, behoben mit D-02)** Die Spec-Dateien der Eroj bauten beim Import alle Celoj neu; der Loader eines Shards brauchte drei bis fünf Minuten, bevor der erste Test lief, und jeder Worker baute je Datei erneut. Das war die Hälfte der Dauer des Jobs `eroj`, nicht die Tests.
- **B-2 (CI, Projekcioj-Shards)** Die Projekcioj-Shards teilen nach Datei; eine Datei trägt fast alles: `plugin.test.ts` (238 Tests) braucht lokal 272 s von 258 s Gesamtdauer der Suite (JSON-Reporter, zehn Kerne) – jeder Test führt das erzeugte Plugin gegen das Double über den ganzen Plan aus. Shard 1 (3:51) ist diese Datei, Shard 2 (0:55) der Rest. Ein dritter Shard hilft darum nicht; der nächste Schritt wäre, die Datei nach Themen zu teilen (dann verteilen die Shards) oder `describe.concurrent` – Entscheidung des Maintainers (O-5 ergänzt).
- **B-3 (behoben)** Der `alsxutilo` ist das erste Ero in der Reihenfolge der Namen und spricht als `button`: der Make-Kit nahm „das erste Ero mit der Rolle `button`“ als `butono` (die Sätze „more on demand is a `<Butono>`“ und „a working button is the `<Butono>`'s own loading“ hätten `<Alsxutilo>` genannt), und Figma leitet die Fokus-Radien (F32) vom ersten Ero ab, das Ring, Lücke und Box bindet – ohne `box.radius` griff es den Radius der Ablagezone (`radius.role.surface`). Der Make-Kit sucht den `butono` jetzt als `button` ohne `dropzone` (`isUpload`), die Skemo bindet `box.radius` an `radius.role.control` (der Ring umschließt den Knopf, D-03). Drei Plugin-Tests nahmen das erste Set als `apartigilo`/`atributlisto` an (F21-Abbruchzähler, F-B-Waise, Verschieben ans Ende): ihre Pins nennen jetzt den `alsxutilo` (12 Varianten, erste Variante `dropzone=true, state=rest`, sein Beispiel wandert mit dem Set).
- **B-4 (behoben, Doku)** Vojmapo Zeile 4: der Eintrag von Spec 015 ① stand mitten im Text von Spec 014 ⑤ (zwischen „`ikono chevron-right`“ und „`|down`“). Er steht jetzt nach „Runde 3 der Eroj vollständig“, ② dahinter; die Statusspalte nennt ① (gemergt) und ② (Abnahme offen).
- **B-5 (behoben)** Das erzeugte Element enthielt `Number.NaN`; der Vitrino-Test „the document shows no NaN“ (Spec 004 Befund 5) fand das Wort im eingebetteten Bündel. `max-size` wird jetzt ohne den Literal gelesen.
- **B-6** `inline-size: 100%` am durchsichtigen Eingabefeld verletzt `css-literal-value`. Gemessen (Playwright, alle drei Engines): ein absolut positioniertes `input type=file` mit `inset: 0` nimmt die Größe seines Containers an (200 × 60 wie der Knopf); eine Größe braucht es nicht.
- **B-7** Die Pflichtmarke ist in Figma nicht gezeichnet; der Jugxo `jug_01M4S2R85WRAC5SV7CARH8RE7S` gibt den Teil `required-mark` frei (nach Teilname, nicht nach Ero) – zwölf freigegebene Werte mehr (`check:parity` 285 → 297 Warnungen, 0 Differenzen). Sein Wortlaut nennt vier Eroj (O-12).
- **B-8 (behoben)** Das erste Stichwort von `text-input` („text“) zog „Verweis im Text auf einen Abschnitt“ (`saltligilo`) und „Markdown im Text“ (`teksto`) zum `kampo`: zwei Dialoge aus 014 wären gekippt. Die Stichwörter sind jetzt „typed/typing“, „getippt/eintippen“.
- **B-9** Der komponierte `butono` zeigt unter dem durchsichtigen Eingabefeld immer sein Ruhe-Bild (inert, kein `:hover` darunter); Hover und Fokus sagt die Ablagezone (Randfarbe) und der Fokusring am Knopf. Kein Manko der Barrierefreiheit (Fokus sichtbar, axe ohne Befund); als O-11 notiert.
- **B-10 (B-1, Rest)** Zwei Fälle bleiben native Prüfungen: das Datum des `kampo` (`min`/`max` am Datumsfeld, damit der Dialog der Plattform die Grenzen kennt; außerhalb der Grenzen oder halb getippt ist es `:invalid`) und `kind=email`/`url` (`typeMismatch` der Plattform, die das Element nicht selbst prüft). Dort kann die Blase beim Überfahren noch erscheinen; ein Pflichtfeld zeigt sie nicht mehr (O-14).
- **B-11** Lokal scheitert `dialogo.spec` „Escape cancels … the focus returns to the opener“ in WebKit (3 von 3 Wiederholungen) – auch ohne die Änderung von D-11 (geprüft mit dem Template vor B-1). Die PR-Läufe der CI fahren nur Chromium; auf `main` laufen alle drei Engines. Nicht Teil dieses PR, gemeldet.

### Offen (für den Maintainer)

- **O-5 Balance der Projekcioj-Shards:** Vitest teilt nach Datei (Pfad-Hash). Gemessen (B-2): Shard 1 (3:51) ist `plugin.test.ts` allein, Shard 2 (0:55) der Rest – ein dritter Shard hilft nicht. Vorschlag: `plugin.test.ts` nach Themen (Variablen, Sets, Bauformen, Beispiele, Idempotenz) in Dateien teilen, dann verteilen die zwei Shards von selbst. Zahlen in tasks ②. **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): ja – als eigener kleiner PR zuerst in Nachlese 5** (Shard 1 lag in #79 bei 8:13).
- **O-6 Wortlaut der `a11y.texts`:** „Datei auswählen“ (auch bei `multiple`), „oder hierher ziehen“, „{file} entfernen“, „Ausgewählte Dateien: {count}“ (ohne Plural-Form, darum mit Doppelpunkt), „{file} hat eine Art, die hier nicht geht: Wähle {accept}.“, „{file} ist zu groß: Wähle eine Datei bis {max-size}.“; en entsprechend. Vorschlag: so; bei `multiple` „Dateien auswählen“ erst, wenn das Modelo einen Text je Wert eines booleschen Props kennt. **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): wie vorgeschlagen**, der Wortlaut wie in der Vitrino gemessen (B2/B3).
- **O-7 Größe in MB oder Bytes:** angezeigt wird in Einheiten der Person, dezimal (1 kB = 1 000 Byte, 1 MB = 1 000 000 Byte), eine Nachkommastelle, über `Intl.NumberFormat` in der Sprache des Dokuments („1,2 MB“, „340 Byte“); das Prop bleibt in Bytes. Vorschlag: dezimal (wie die Hilfe „5 MB“ liest); binär (MiB) nur mit eigener Entscheidung. **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): wie vorgeschlagen.**
- **O-8 Arten im Fehler:** Endungen ohne Punkt in Großbuchstaben, Medientypen wie geschrieben, mit „oder“ verbunden (`Intl.ListFormat` disjunction): „Wähle PDF oder PNG.“ Vorschlag: so. **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): wie vorgeschlagen.**
- **O-9 `multiple`:** jede weitere Wahl ergänzt die Liste (die Plattform ersetzt sie); jede Datei hat ihr eigenes Entfernen. Vorschlag: ergänzen (wer eine zweite Datei sucht, verliert die erste nicht). **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): wie vorgeschlagen.**
- **O-10 `file-constraints-stated` fest oder anpassbar:** die Pflicht steht als Skemo-Constraint und ist fest; anpassbar ist nur der Wortlaut der Hilfe (Textregel). `max-size` allein bleibt ungeprüft, weil `prop:<name>` nur Text-Props liest. Vorschlag: so lassen; die Lesart `prop:<name>` auf Zahl-Props ausweiten (`skemo-rules`, `usage`, Web- und Figma-Celo) als kleiner eigener PR, dann eine zweite Constraint für `max-size`. **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): Pflicht fest, ja; die Ausweitung von `prop:<name>` auf Zahl-Props kommt nicht in diesen PR, sondern mit eigener Begründung in Nachlese 5** (Regel 0.3: ändert die Lesart der Skemo-Regeln).
- **O-11 Hover des Knopfs:** der `butono` unter dem Eingabefeld zeigt kein Hover (B-9). Vorschlag: so lassen; ein eigenes Hover-Bild wäre ein Zustand am `butono`, den nur der `alsxutilo` setzt. **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): wie vorgeschlagen.**
- **O-12 Jugxo der Pflichtmarke:** `jug_01M4S2R85WRAC5SV7CARH8RE7S` gibt jetzt auch die Marke des `alsxutilo` frei (B-7). Vorschlag: Wortlaut um „und jedes weitere Feld mit `required-mark`“ ergänzen (Nachtrag, kein neuer Jugxo). **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): wie vorgeschlagen – umgesetzt in #78** (Kialo und Kontext des Jugxo ergänzt, Daten-Pin in `alsxutilo.test.ts`).
- **O-13 „file input“:** Rückfrage zwischen `kampo` und `alsxutilo` (Abweichung 4). Vorschlag: so lassen (OP-12); ein Stichwort „input“ am `alsxutilo` wäre `goal-keyword-shared`. **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): wie vorgeschlagen.**
- **O-14 Native Prüfung am Datum und an E-Mail/URL (B-10):** Vorschlag: die Grenzen des Datums und die Form von E-Mail und URL prüft das Element selbst wie die ganze Zahl (Datum lexikalisch als `YYYY-MM-DD`, die Worte der Plattform über ein Probe-Feld) und setzt `min`/`max` dann nur noch für den Dialog – eigener kleiner PR, weil `kind` sonst seine Tastaturen verlöre. **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): ja – als eigener kleiner PR in Nachlese 5.**

## ③ Inhalt

**Branch:** `261018-spec-015-inhalt-f027c6` (gebaut gestapelt auf ②, #76; nach dessen Merge am 2026-10-19 auf `main` @ `971354d` rebased) · **Datum:** 2026-10-18/19 · **Stand:** Abnahme am 2026-10-19 nicht erteilt wegen K-1 (Figma, B-8); K-1 behoben, der Maintainer misst C2 erneut.

### Zusammenfassung

1. **`karto`** (D-01, D-03–D-06): die Karte – `level` (Pflicht, die Ebenen 1–6 des `titolo`, an den komponierten `titolo` durchgereicht), `orientation` `vertical` | `horizontal` (Default `vertical`, schlüsselt keinen Teil), `standalone` (boolesch, Default `true`: `article`; `false`: `region`, benannt durch die Überschrift). Slots `heading` (Text, Pflicht), `media`, `content` (Standard), `meta`, `actions`. Teile `surface` (`color.background.raised`, `radius.role.surface`, `elevation.shadow.raised`), `border` (`color.border.subtle`, `border.width.default`), `heading` (`typography.headline.4`), `content` (`typography.body.1`), `meta`, `actions`, `box` (`spacing.medium`/`spacing.small`, mit `density`). Rolle `article`, Name aus `slot:heading`. Goal `card` (Karte, Karten, Kachel, Kacheln, card, cards, tile, tiles) mit `one-primary-per-container`. Uzo: `data-record` → `atributlisto`, `notice` → `avizo`, `layout-box` → Person (Kialo der Spec), Grenzen `clickable-card` und `card-grid` (ask-human), `columns-from` `size.container.small` wie `atributlisto layout=auto`. G2: `atributlisto.as-card` und `avizo.content` → `karto`. `one-primary-per-container` und `spacing-owned-by-container` ausgeweitet.
2. **`avataro`** (D-07–D-10): der Avatar – `name` (Pflicht), `picture` (die Adresse des Bilds; `src` ist ein Web-Begriff, D-07), `size` `small` | `medium` | `large` (`size.icon.medium`, `size.icon.large`, `size.control.large`; Initialen `typography.label.2`/`.2`/`.1`), `decorative` (Default `false`). Keine Slots. Teile `image` (`radius.full`), `initials` (`color.background.sunken`, `color.text.subtle`, `radius.full`, Typografie nach `size`), `box`. **Keine Farbe aus dem Namen** (E8): die Initialen haben feste Rollen. Rolle `img`, Name aus `prop:name`, `aria-hidden` wenn dekorativ. Goal `avatar` (Avatar, Profilbild, Initialen) mit `icon-meaning-named`. Uzo: `status` → `insigno`, `logo` → Person, Grenzen `avatar-group` und `presence-dot` (ask-human). G2: `insigno.person` → `avataro`; die `karto` nimmt den `avataro` in `meta`. `icon-meaning-named` auf `name` ausgeweitet (vier Jugxoj de/en), `spacing-owned-by-container`.
3. **Toast als Grenze** (D-11, D-12, E6): `avizo.boundary.toast` bleibt `not-supported` (O-15) mit der neuen Kialo der Spec; „toast“/„snackbar“ sind Synonyme am Goal `notify` (kein eigenes Goal); ein Jugxo in de und en hält die Entscheidung fest (GOV.UK als Anforderung, kein fremder Inhalt). `suggest_ero` liest ein Wort, das ein Ero in eigener Grenze und eigenem Goal nennt, als Synonym mit Grenze: „Toast nach dem Speichern“ → `avizo` im Fluss, die Kialo der Grenze daneben.
4. **Projekcioj:** Web-Celo Hosts `card` und `avatar` (D-04, D-08), Figma-Bauformen `card` und `avatar` mit Plugin-Zeichnung (D-05, D-09), Vitrino (D-06, D-10), Make-Kit-Sätze, React-Typen; ein boolesches Prop mit Default `true` liest `"false"` in Element, Property und React-Wrapper (D-03).

### Entwurfsentscheidungen

#### D-01 `karto`: Inhalt als Einheit, die Überschrift ist ein `titolo` (Regel 0.1: Weg des `dialogo`)
Die Überschrift ist ein Text-Slot, den das Ero in einen komponierten `fm-titolo` setzt (wie der `dialogo`); `level` geht an ihn, die Typo-Rolle `headline.4` steht fest am Teil `heading` und als `size` am `titolo` – beide Bilder gleich. `orientation` schlüsselt keinen Teil: sie ist Layout des Celo, keine Variante der Tokens. `standalone` entscheidet `article` oder `region` (Celo-Wissen wie `role=alert` des `avizo` bei `danger`). Der Standard-Slot ist der Inhalt (die Spec), darum schreibt das Label-Property in Figma die Überschrift (`labelPartOf` → `heading`).

#### D-02 Gvidanto: Stichwörter ohne falsche Freunde (G3, Nachlese 3 D-03)
`goal-keyword-shared` ohne Warnung (`check:regularo` 0 Warnungen). Die Uzo-Stichwörter treffen ab sechs Buchstaben auch das Ende eines Worts (Spec 007 D-06): „karten“ an einer Uzo stähle „Registerkarten“ (`langetaro`), „bild“ kippte „Fließtext unter dem Bild“ (`teksto`, Dialog 014 ③). Darum tragen die Querverweise eigene Wörter (`atributlisto.as-card`: cardview, kartenansicht; `avizo.content`: teaser, inhaltskarte; `insigno.person`: avatar, initialen), die Grenzen Wörter, die kein Goal kennt (`card-grid`: raster, kartenraster; `clickable-card`: klickbare; `presence-dot`: presence, online, anwesenheit), damit `uzo-boundary-covered` nicht anschlägt. „Projektkarten mit Bild“ trifft darum kein Goal (O-17, B-1).

#### D-03 Boolesches Prop mit Default `true` (`standalone`, Regel 0.2)
`standalone` ist das erste boolesche Prop mit Default `true`; ein HTML-Attribut kann nur da sein oder fehlen. Das Element liest es als `true`, solange das Attribut fehlt, und als `false` nur bei `standalone="false"`; der Property-Setter schreibt `"false"` (React 19 reicht den Wert an die Property, React 18 ans Attribut), der React-Wrapper schreibt `"false"` bei `false` und lässt es sonst weg. Alle anderen Booleschen bleiben bitgleich (nur Props mit `default: true` nehmen den Weg).

#### D-04 Web-Celo Host `card`
`<article part="control" aria-labelledby="heading">` mit `media` (bündig, die Fläche schneidet es auf ihren Radius), `body` (Polsterung `box.inline-padding` rundum, Abstand `box.gap`), darin `fm-titolo#heading`, `content`, `meta`, `actions`; Medien, Meta und Aktionen nur mit Inhalt. Horizontal: Medien ein Drittel, Körper zwei Drittel; unter `columns-from` misst das Element seine Breite wie `atributlisto layout=auto` (eine Container-Query nimmt kein `var()`) und setzt die Klasse `fm-stacked` – keine `data-`-Attribute, denn das Paritäts-Inventar liest sie als Props der Skemo; die Ausrichtung liest der Stylesheet am Attribut des Hosts. Ein Bild in `media` ohne `alt` ist eine Entwickler-Warnung.

#### D-05 Figma: Bauform `card`
`orientation` als Zusatzachse wie `placement` des `konsileto` (zwei Varianten, ein Zustand); Medien als Platzhalter („Bild“ auf `color.background.sunken`) mit einem BOOLEAN-Schalter `media` (kein Prop der Skemo, nicht in der Parität), daneben das Beispiel „karto – ohne Bild“; Aktionen und Badge im Bild von `butono` (high, low) und `insigno` (neutral) (`composed`). Breite der Karte: `size.container.small` aufgelöst (geschrieben wie die Länge des `apartigilo`), Medien ein Drittel. Plugin-Zeichnung `drawCard`, `STRUCTURE_BINDINGS.card`.

#### D-06 Vitrino, Make-Kit, React (`karto`)
Vitrino: vertikal mit und ohne Bild, horizontal über zwei Spalten, Ebene 3 unter der Abschnittsüberschrift; das Bild ist ein Inline-SVG in der Textfarbe (die Vitrino lädt nichts von außen). Make-Kit: „Every summary of one thing … is a `<Karto>` with the `level` of its heading; the fields of one record are an `<Atributlisto>`, what happened is an `<Avizo>`, and a whole card is never one link.“ React-Typen aus der Skemo.

#### D-07 `avataro`: Initialen ohne Farbe, `picture` statt `src` (Art. VIII)
`src` ist ein Wort der Web-Plattform (`skemo-web-term`); das Prop heißt `picture`, der Web-Celo schreibt es als `src` des Bilds (wie `to` des `ligilo` als `href`). Größen (O-18): `size.icon.small` (16 px) trägt keine zwei Initialen lesbar, darum `small` = `size.icon.medium`, `medium` = `size.icon.large`, `large` = `size.control.large` (mit `density`). Die Initialen stehen immer auf `color.background.sunken` in `color.text.subtle` (KontrastParo vorhanden) – keine Farbe aus dem Namen (E8).

#### D-08 Web-Celo Host `avatar`
`<span part="control" role="img" aria-label="…">` mit `img part="image" alt=""` und `span part="initials" aria-hidden`. Das Bild steht erst nach `load`, sonst – fehlend, ladend oder kaputt – die Initialen. Initialen: Wörter an Leerraum und Strich (B-2), je Wort das erste Graphem (`Intl.Segmenter`), das Buchstabe oder Ziffer ist, vom ersten und letzten Wort, `toLocaleUpperCase` in der Sprache des Dokuments. `decorative` nimmt Rolle und Namen weg und setzt `aria-hidden`. Ohne `name` warnt das Element. `object-fit: cover` steht jetzt in der Strukturliste der Komponenten-CSS (Schlüsselwort, Regel 0.2). Das `ikono` bleibt Glyphe: `isIcon` schließt Bilder mit `initials` aus.

#### D-09 Figma: Bauform `avatar`
Drei Varianten nach `size`; das Label-Property schreibt die Initialen („EM“ aus der Vitrino); ein BOOLEAN-Schalter `image` zeigt das Bild-Ersatzbild (die Silhouette der Vitrino, eine Quelle für beide Bilder) über den Initialen, daneben das Beispiel „avataro – mit Bild“. Plugin-Zeichnung `drawAvatar`, `STRUCTURE_BINDINGS.avatar`.

#### D-10 Vitrino, Make-Kit, React (`avataro`)
Vitrino: je Größe mit Bild (SVG als data-Adresse), mit Initialen, mit kaputtem Bild (`data:,`) und dekorativ neben dem Namen; das Ikonaro-Raster bleibt dem `ikono`. Make-Kit: „Every person or thing shown as a picture or as initials is an `<Avataro>` with its `name` (`decorative` where the name stands beside it); a status is an `<Insigno>`, never a dot or a colour worked out from the name.“; der Icon-Satz gilt nur dem `ikono`. React-Typen aus der Skemo.

#### D-11 Toast: Grenze mit Kialo, Jugxo (E6)
Die Kialo von `avizo.boundary.toast` ist die der Spec; „ein Ero mit Zeitregel ist ein eigenes“ (Spec 011 ③) fällt weg, denn E6 schließt das Ero aus. Die Aktion bleibt `not-supported` (O-15). Zwei Jugxoj (de, en, `approved`, Bezug `avizo`) halten die Entscheidung mit GOV.UK als Anforderung fest. Der Make-Kit-Satz des `avizo` sagt schon „never a toast“.

#### D-12 `suggest_ero`: eigene Grenze als Synonym eines eigenen Goals (Regel 0.2)
Spec 008 D-08 deckt „Grenze → use-instead X = Goal von X“; eine Grenze, die beim eigenen Ero bleibt (`not-supported`), war mit dem eigenen Goal bisher ein Konflikt, und „Toast nach dem Speichern“ ein Gleichstand mit `butono.confirm` („speichern“). Neu: trifft dasselbe Wort die eigene Grenze und ein eigenes Goal, antwortet das Goal (Ero, Props, Regulo) mit der Grenze daneben, ohne Gleichstand. `uzo-boundary-covered` prüft nur fremde Goals und bleibt still. Heute sind „toast“ und „snackbar“ des `avizo` die einzigen solchen Wörter (Test pinnt die Invariante); jede andere Antwort bleibt bitgleich.

### Arkitekturo-Abdeckung

| Artikel | Wie ③ ihn trägt |
|---|---|
| Art. V (Clean Room) | GOV.UK nur als Anforderung im Jugxo; die Bilder der Vitrino und der Ersatzbilder sind eigene Zeichnungen; `check:clean-room` ohne Befund |
| Art. VIII (keine Web-Begriffe, keine Strings im Ero) | `picture` statt `src`; keine Texte im Markup; Initialen aus dem Namen, Warnungen nur für Entwickler |
| E1 (keine neuen Tokens) | nur vorhandene Rollen und `radius.full`, `size.*`, `typography.label.*` |
| E5 (ausweiten statt vervielfachen) | `one-primary-per-container`, `icon-meaning-named`, `spacing-owned-by-container` ausgeweitet; keine neue Regulo |
| E6 (kein Toast-Ero) | Grenze `not-supported` mit Kialo, Jugxo, Synonyme am `avizo` |
| E8 (keine errechneten Farben) | feste Rollen der Initialen, Browser-Spec vergleicht drei Namen |
| G2 (Verflechtung) | `atributlisto` ↔ `karto`, `avizo` ↔ `karto`, `insigno` ↔ `avataro` (instead in beide Richtungen) |
| G3 (Stichwörter) | `goal-keyword-shared` ohne Warnung (`check:regularo` 0 Warnungen) |
| Internacia | Karte in RTL (Medien rechts, Aktionen von rechts), Überschrift auf 200 %; Initialen mit kombinierenden Zeichen (NFD), Devanagari, Arabisch in RTL, Türkisch (ı/İ) in drei Browsern |
| Alirebleco | axe ohne Befund und Kontrast ≥ 4,5:1 für Überschrift, Text und Initialen in acht Farbklassen, drei Browser |

### Abweichungen von der Spec

1. `avataro.src` heißt `picture` (Art. VIII, `skemo-web-term`; D-07).
2. `avizo.boundary.toast` bleibt `not-supported`, nicht `ask-human` (O-15).
3. „Toast nach dem Speichern“ → `avizo` mit leeren Props: „Toast“ sagt keine Art, `intent=success` wählt der Agent aus dem Inhalt; `check_usage` bestätigt die Instanz (O-16). Der Dialog 011 „ein Toast unten rechts“ antwortet jetzt mit `avizo` und der Grenze daneben statt nur mit der Grenze (E6).
4. „Projektkarten mit Bild“ ist im Test „Karten mit Bild für die Projekte“ / „Projekt-Karten mit Bild“ (O-17); „Projektkarten im Raster“ fragt (Grenze `card-grid`) wie gefordert.
5. `karto.actions` nimmt `butono` und `ligilo` (höchstens zwei): der `ligilo` kennt den Container `card` seit Spec 008 (der Weg zum Detail ist ein Ziel). Neu gegenüber der Spec: der Teil `border` neben `surface` (wie beim `dialogo`).
6. Figma: „vertical, horizontal“ sind Varianten, „mit und ohne Bild“ ein Schalter mit Beispiel; beim Avatar „Bild/Initialen“ ebenso (Schalter `image`, Beispiel „mit Bild“).
7. Avatar-Größen: `small`/`medium` auf `size.icon.medium`/`.large`, nicht `size.icon.small` (O-18).

### Befunde / Mankoj

- **B-1** Goal-Stichwörter treffen ganze Wörter und Bindestrich-Komposita, nicht „Projektkarten“ (Nachlese 4 F-2); eine Uzo-Hilfe mit „karten“ oder „bild“ hätte bestehende Antworten gekippt (D-02).
- **B-2** Die Wort-Segmenter der Engines trennen verschieden: Firefox liefert bei „सीता राम“ nur „राम“ als Wort. Die Wörter kommen darum aus Leerraum und Strich, die Grapheme aus `Intl.Segmenter` (in drei Browsern gemessen).
- **B-3** `src` ist ein Web-Begriff (`skemo-web-term` schlug beim ersten Laden an) – D-07.
- **B-4** Rolle `img` teilt der `avataro` mit dem `ikono`: Web-Host, Figma-Bauform, Vitrino (Ikonaro-Raster) und Make-Kit (Icon-Satz) unterscheiden am Teil `initials`.
- **B-5** Die Vitrino lädt nichts von außen (`<img src` und `http://` sind verboten): die Karte zeigt ein Inline-SVG, der Avatar ein SVG als data-Adresse mit kodiertem `xmlns`, das kaputte Bild ist `data:,`.
- **B-6** Figma: `radius.full` löst zu 9999 px auf, Figma kappt das sichtbar zum Kreis; die Kreise des Avatars binden ihre Größe auch an `box.size` (Überlagerung im Rahmen ohne Layout); im echten Figma ungemessen (O-19).
- **B-7** Alirebleco-Block des Avatars: der Text der Seite neben dem dekorativen Avatar ist kein Teil des Ero (im dunklen Schema ohne eigene Farbe); der Block prüft die Avatare allein.

- **B-8 (Abnahme K-1, behoben)** In Figma brach die Überschrift der `karto` in jeder Variante des Sets nach jedem Buchstaben um, in komuna und ekzemplo; das Beispiel „ohne Bild“ war richtig (Set 648 × 1031). Ursache im Ablauf von `drawCard`: die Überschrift einer Set-Variante bekam FILL (`WRAP_SIZING`), solange sie leer war – ihr Wort kam erst danach über die Label-Property –, Beispiel und Inhalt hatten ihr Wort vorher. Figma ließ den leer gefüllten Text bei Breite 0 stehen und meldete FILL; der zweite Lauf, der vor dem Schreiben vergleicht, änderte darum nichts. Das strenge Doppel kennt jetzt `textAutoResize` (HUG ⇒ `WIDTH_AND_HEIGHT`, FIXED/FILL ⇒ `HEIGHT`, ein Text fester Breite bricht in ihr um) und als gekennzeichnete Annahme aus dieser Messung den leer gefüllten Text bei Breite 0, der FILL meldet: es gibt das Set mit 648 × 1007 wieder (richtig: 648 × 507). Fix: die Überschrift bekommt ihr Wort vor ihrer Größe, in Set und Beispiel; beide Texte stehen linksbündig (`textAlignHorizontal` LEFT); und gemessen, dann geschrieben: eine Überschrift, die schmaler ist als der Inhalt im selben Rumpf, wird auf dessen Breite skaliert und nimmt FILL neu (`fillLike`) – so heilt auch die vorhandene Datei, in der die Überschrift FILL meldet. Ein zweiter Lauf schreibt nichts. Zu messen: C2 (In Figma zu messen).

### Offen (für den Maintainer)

- **O-15 Aktion der Grenze `toast`:** die Spec sagt „bleibt `ask-human`“, der Bestand ist seit Spec 011 ③ `not-supported`; `ask-human` wäre schwächer (Regel 0.4). Vorschlag: `not-supported` bleibt. **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): wie vorgeschlagen.**
- **O-16 `intent=success` beim Toast:** der Gvidanto antwortet mit `avizo` ohne Props. Vorschlag: so lassen; ein Goal `report-success` (Spiegel von `report-error`) wäre ein eigenes Goal, das die Spec ausschließt. **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): wie vorgeschlagen.**
- **O-17 Komposita:** „Projektkarten“ trifft kein Goal. Vorschlag: in Nachlese 4 mit F-2 (Goal-Treffer am Wortende ab sechs Buchstaben, mit den falschen Freunden als Tests). **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): bleibt offen** – „Projektkarten“ wurde nach Nachlese 4 als `goal-unknown` gemessen (A16); kommt in Nachlese 5.
- **O-18 Avatar-Größen:** 20 / 24 / 48 px (komfortabel 56). Vorschlag: so; `size.icon.small` nur mit einer Initiale. **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): wie vorgeschlagen**; dass Figma in der kleinsten Größe „EM“ zeigt und über den Kreis ragt, ist Befund N5-5 für Nachlese 5.
- **O-19 Figma-Ersatzbilder und Vorgabewörter:** Karte 640 px breit (`size.container.small`), Medien ein Drittel; Label-Vorgaben „Überschrift“ (Karte) und „EM“ (Avatar); Avatar-Silhouette aus der Vitrino. Vorschlag: so, im Figma-Lauf der Abnahme messen. **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): wie vorgeschlagen**; gemessen: Karte 640 px, Bild ein Drittel – die Überschrift aber brach um (K-1, B-8).
- **O-20 `standalone` mit Default `true`:** gelesen als Attribut `"false"` (D-03). Vorschlag: so; die Alternative wäre ein umgekehrtes Prop (`section`), das die Spec nicht nennt. **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): wie vorgeschlagen.**
- **O-21 `karto.actions` mit `ligilo`:** Vorschlag: so (Abweichung 5). **Entschieden (Maintainer, Abnahme ② und ③ am 2026-10-19): wie vorgeschlagen.**

### In Figma zu messen (nach K-1)

Grüne Tests sind für Figma keine Abnahme. Mit dem Plugin aus dem Build dieses Branches, in f10b-5, Lauf „Plan anwenden – auch in vorgefundenem Set anlegen“ auf der Datei mit den kaputten Überschriften:

1. **C2 `karto`, komuna und ekzemplo:** in beiden Varianten des Sets (oben und seitlich mit Bild) steht „Überschrift“ in einer Zeile, linksbündig wie der Text darunter; das Set misst etwa 648 × 530 statt 648 × 1031 (Bericht `layout`). Das Beispiel „ohne Bild“ bleibt unverändert.
2. **Zweiter Lauf direkt danach:** keine Änderung am Set der `karto` (der Bericht nennt an `heading` nichts).
3. Bestätigt der Lauf die Annahme des Doppels nicht (die Überschrift war schon nach dem ersten Lauf dieses Builds richtig, ohne Reparatur), bleibt der Fix richtig; die Annahme wird dann im Doppel gestrichen.
