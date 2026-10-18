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

**Branch:** `261018-spec-015-eingabe-f027c6` (von `main` @ `7a05c6e`, ① gemergt als #75) · **Datum:** 2026-10-18 · **Stand:** im Bau.

### Zusammenfassung

1. **CI-Aufteilung (O-4 aus ①, B-12; D-01):** der Job „Build, test, lint and Modelo checks“ wird drei Jobs — `checks` (Build, Perf, Lint, die sieben Modelo-Checks, Release), `unit` (die Vitest-Suiten jedes Pakets außer Projekcioj und Eroj) und `projekcioj` (die Vitest-Suite der Projekcioj in zwei Shards). Dazu baut `buildProjections` der Eroj-Specs einmal je Prozess statt einmal je Spec-Datei (D-02): der Loader eines Playwright-Shards verbrachte drei bis fünf Minuten mit 36 Bauläufen, bevor der erste Test lief. Kein Timeout angehoben (Regel 0.4).
2. **`alsxutilo`** folgt in diesem PR (Spec ②).

### Entwurfsentscheidungen

#### D-01 O-4: fünf CI-Jobs statt drei (Regel 0.1: der Schnitt von Nachlese 3 W1, fortgesetzt)

**Befund (B-12 aus ①):** Lauf 39127146926 (`1e9e5f2`, grün) — Job `unit` **11 min 20 s**, davon der Schritt „Test“ 10 min 24 s; die vier Vitest-Suiten liefen nebeneinander auf den vier Kernen des Runners: mcp 30 Dateien 224 s (Import 74 %), cli 5 Dateien 229 s, modelo 154 Dateien 315 s, **projekcioj 16 Dateien 622 s** (Tests 83 %: jeder Celo-Test baut und validiert das ganze Modelo). Lokal, allein, zehn Kerne: mcp 26 s, cli 42 s, modelo 51 s, projekcioj 258 s. Die Projekcioj-Suite ist die Wanduhr des Jobs und wächst mit jedem Ero (⑤ auf `main`: 10 min 44 s; ① rot 12 min 07 s). Perf, Lint und die Checks dahinter brauchen zusammen unter einer Minute.

**Schnitt:** `checks` — Install, Build, `pnpm perf` (allein, ohne Testlauf daneben: Spec 001 D-17 bleibt gewahrt), `pnpm lint`, `check:vortaro-lint|parity|regularo|mankoj|alirebleco|clean-room|ikonaro`, `check:release`; `unit` — Install, Build, `pnpm turbo run test --filter=!@fundamento/eroj --filter=!@fundamento/projekcioj` (der Filter nennt, was anderswo läuft: ein neues Paket — Spec 016 bringt `packages/agordilo` — läuft hier von selbst mit); `projekcioj` — Install, Build, `pnpm --filter @fundamento/projekcioj exec vitest run --shard=N/2` als Matrix (`fail-fast: false`; außerhalb von turbo baut die Vitest-Konfiguration des Pakets den Workspace zuerst, wie bisher bei jedem Paketlauf). `eroj` und `rendered-checks` unverändert; `PLAYWRIGHT_ENGINES` nur an den gerenderten Jobs; `timeout-minutes: 15` je Job. `workflow.test.ts` pinnt die fünf Jobs mit ihren Schritten, beide Matrizen, die Engines, das Budget; der Skript `check` der Wurzel (eine Reihe für lokal) ist unverändert. Vitest verteilt die Dateien eines Shards nach einem Hash ihres Pfades (deterministisch, nicht nach Dauer): die Balance der beiden Shards steht in der Messung; fällt eine Datei (die Plugin-Tests, 242 Tests) mit einer zweiten schweren in denselben Shard, ist ein dritter Shard der nächste Schritt, kein Timeout.

#### D-02 `buildProjections` einmal je Prozess (Regel 0.2: kleinste Änderung mit Wirkung)

Jede der 36 Spec-Dateien der Eroj ruft `await buildProjections()` auf Modulebene: alle Celoj von Kern + komuna + ekzemplo in ein Temp-Verzeichnis. Playwright importiert jede Datei einmal zum Sammeln der Tests (im Loader-Prozess) und noch einmal in jedem Worker — bisher je ein Bau je Import. Im Lauf 39127146926 stand der Loader von Shard 2 von 12:25:41 bis 12:30:40 ohne eine Zeile Ausgabe (Shard 1: drei Minuten), die Tests selbst brauchten danach 1 min 42 s (Shard 1) und 4 min 09 s (Shard 2). `serve.ts` merkt sich das Promise des Baus je Prozess; ein fehlgeschlagener Bau wird vom nächsten Aufrufer wiederholt. Der Bau ist für jede Datei derselbe und jede Datei liest ihn nur. `serve.spec.ts` pinnt: zweimal aufgerufen, dasselbe Verzeichnis und dieselbe Eingabe.

**Messung vorher** (Lauf 39127146926, `1e9e5f2`, PR-Lauf, Wanduhr = längster Job): **11 min 20 s** — `unit` 11:20, `eroj` Shard 1 5:53 / Shard 2 10:21, `rendered-checks` 8:25. **Nachher:** der PR-Lauf dieses Branches, Zahlen in der Zeile „CI“ der Messungen von tasks ②.

### Abweichungen von der Spec

(folgen mit `alsxutilo`)

### Befunde / Mankoj

- **B-1 (CI, behoben mit D-02)** Die Spec-Dateien der Eroj bauten beim Import alle Celoj neu; der Loader eines Shards brauchte drei bis fünf Minuten, bevor der erste Test lief, und jeder Worker baute je Datei erneut. Das war die Hälfte der Dauer des Jobs `eroj`, nicht die Tests.

### Offen (für den Maintainer)

- **O-5 Balance der Projekcioj-Shards:** Vitest teilt nach Pfad-Hash. Liegen die beiden schweren Dateien (Plugin- und Figma-Tests, 242 und 128 Tests) im selben Shard, schlägt P0 einen dritten Shard vor — oder den Schnitt nach Celo (ein Shard „figma“, einer „alles andere“) statt nach Hash. Vorschlag: drei Shards, sobald ein Shard über 6 min liegt. Zahlen in tasks ②.

## ③ Inhalt

Folgt in PR ③.
