# Spec 015 – Eroj Runde 4 – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-17, unverändert kopiert) · **Briefing:** `briefing-p0-2026-10-17.md` (Maintainer-Ordner, nicht kopiert) · **Basis:** gestapelt auf Spec 014 ⑤ (Branch `261017-spec-014-aufklappen-e3bf97`), bis 014 gemergt ist · **Regel 0** (12.10.) gilt: Weg des `butono` zuerst, sonst kleinste Änderung mit Eintrag hier; Tokens, Regulo-Semantik und Constitution nie ändern; nie eine Grenze schwächen.

Drei PRs, gestapelt (E9): ① Navigation von Spec 014 ⑤, ② Eingabe von ①, ③ Inhalt von ②.

## ① Navigation

**Branch:** `261018-spec-015-navigation-e3bf97` (von Spec 014 ⑤) · **Datum:** 2026-10-18 · **Stand:** in Arbeit (Nachtauftrag 17./18.10.: rot committet, Modelo grün, Web-Celo und Vitrino größtenteils grün, Figma-Plugin und Parität offen – siehe Befunde).

### Zusammenfassung

1. **`pagxigilo`** (D-01, D-03): das Seitenblättern – `page` (Pflicht, Zeichenkette wie `navigado.page`, Abweichung 1) und `total-pages` (Pflicht), `label` mit den Wörtern des Modelo („Seitenblättern“, `a11y.texts label-empty`), `mode` `button` | `link` (Ereignis `page-change`, abbrechbar; `href-template` `?page={page}`), `siblings` (1). Zustände rest/hover/focus/disabled am Eintrag; `current` ist der Zustand eines Eintrags (`SkemoSlot.entry`, E7), keine Achse. Teile `item` (Fläche und Farbe nach current × Zustand aus `color.navigation.*`, Gewicht `font.weight.semibold`), `border` (Rand `border.width.strong` nur aktuell – nie nur Farbe), `ellipsis`, `prev`/`next` (die Glyphen `chevron-left`/`chevron-right`, gespiegelt in RTL), `box`, `focus-ring`. Rolle `navigation`, `aria-current="page"`, `aria-disabled` an den Enden; jede Zahl heißt „Seite N“ (`items-name`), die Pfeile „Vorherige Seite“/„Nächste Seite“ (`prev-name`/`next-name`). Goal `paginate`. Uzo: `load-more` → `butono`, `views` → `langetaro`, Grenzen `infinite-scroll`, `page-size-select` (ask-human); die `tabelo` schließt `pagination` (use-instead), die `langetaro` schickt `list-pages`, `ikono` komponiert.
2. **`spuro`** (D-02, D-04): die Brotkrumen – `label` („Pfad“, Vorschlag O-1), `page` (Schlüssel des aktuellen Eintrags; leer: der letzte). Einträge sind die Links der Plattform im Light DOM (wie `navigado`, E10), mindestens zwei; der letzte ist Text mit `aria-current`. Teile `item` (Farbe `color.link.*` bzw. `color.text.default` aktuell, Gewicht aktuell), `underline` (nur die Links), `separator` (`chevron-right`, dekorativ), `box`, `focus-ring`. Goal `breadcrumb` mit `link-label-names-destination` (E5 ausgeweitet). Uzo: `main-navigation` → `navigado`, `steps` nicht abgedeckt, Grenze `collapsed-middle`; die `navigado` schließt `breadcrumb` (use-instead), `ligilo` und `ikono` komponieren.
3. **Modelo:** `a11y.texts` kennt `<part>-name` und `<slot>-name` (kleinste Änderung, D-01); Ikonaro `chevron-left` (Phosphor `caret-left`, regular und fill, gespiegelt); Zahlwörter bis neunundzwanzig.
4. **Projekcioj:** Web-Celo Host `pagination` (Shadow, baut die Seiten selbst) und Brotkrumen als Light-Host mit manueller Slot-Zuweisung in eine geordnete Liste (D-03, D-04); Figma-Plan Bauformen `pagination`/`breadcrumb` (D-05, Plugin-Zeichnung offen); Vitrino Seite 5 von 10 und drei Ebenen (D-06); Make-Kit zwei Sätze (D-07); React-Typen (D-08).

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
Bauformen `pagination` (Einträge 1 2 3, die erste aktuell; `prev`/`next` als Icons) und `breadcrumb` (die drei Wörter der Vitrino, das letzte aktuell; `separator` als Icon); das Label-Property nimmt das Wort aus `a11y.texts label-empty`. Die Zeichnung im Plugin (`drawPagination`, `drawBreadcrumb`) ist offen (B-2).

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
4. Figma zeigt eine Zeile 1 2 3 mit Pfeilen, nicht Seite 1/5/10 von 10 (O-2).
5. `label` ist bei beiden optional (die Wörter des Modelo stehen ein), nicht Pflicht wie bei der `navigado`.

### Befunde / Mankoj

- **B-1** Die Vitrino-Zeile „unbekannt“ hing an jedem Zahlbeispiel; jetzt am Slot `value-text`. Kein Manko.
- **B-2 (offen)** Figma-Plugin: die Bauformen `pagination` und `breadcrumb` werden noch nicht gezeichnet (Pfeile, Auslassung, Trenner ungebunden) – Parität rot, Plugin-Tests rot.
- **B-3 (offen)** `fm-pagxigilo`: nach dem Entfernen des Attributs `label` wird die Landmarke nicht mit dem Wort des Modelo nachbenannt (ein Spec rot).
- **B-4** Playwright klickt kein `aria-disabled`-Element; der Spec erzwingt den Klick (`force`).

### Offen (für den Maintainer)

- **O-1 Name der Landmarke `spuro`:** „Pfad“ (de) / „Breadcrumb“ (en). Zur Bestätigung.
- **O-2 Figma-Varianten:** Seite 1, 5 und 10 von 10 (Spec) als drei Beispiele neben dem Set, oder eine Zeile wie jetzt.
- **O-3 `aria-disabled` statt `disabled`** an den Pfeilen (beide Modi gleich, fokussierbar wie APG-Toolbar).

## ② Eingabe

Folgt in PR ②.

## ③ Inhalt

Folgt in PR ③.
