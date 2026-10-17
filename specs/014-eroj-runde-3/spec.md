# Spec 014 – Eroj in der Breite, Runde 3: Grundbausteine, Typografie, Overlays, Aufklappen

**Branch-Familie:** `014-eroj-runde-3` (fünf gestapelte PRs, Reihenfolge in G9) · **Status:** Entwurf · **Constitution:** kein Amendment · **Erstellt:** 2026-10-17 · **Voraussetzung:** `main` nach dem Merge von Nachlese 3 (#68, #69; Gvidanto mit Gleichstand-Rückfrage, brief-Grenzen ohne Kialo, CI ≤ 12 min) · **Phase:** 4 (Eroj in der Breite) · **Zielpfad:** `specs/014-eroj-runde-3/spec.md` · **Roadmap:** Etappen 2 und 3 (`roadmap/roadmap-2026-10-17.md`), auf Wunsch des Maintainers in einer Spec zusammengelegt

## Zweck

Nach Spec 011 hat Fundamento 17 Eroj. Damit lassen sich Formulare, Daten, Rückmeldungen und Navigation bauen. Es fehlen aber Bausteine, die fast jede Oberfläche braucht und die ein Agent heute selbst erfindet:
- Icons. Die Vitrino zeigt keine, deshalb zeichnet Figma keine (Jugxo `jug_01M31TV1V4S3RNBPWSRB2CGEDK`).
- Überschriften und Fließtext als Ero statt freier Stile.
- Trenner und Sprunglink.
- Alles, was über der Seite schwebt, aber nicht modal ist: Tooltip, Popover, Aktionsmenü.
- Aufklappen und Eingabe mit Vorschlägen.

Diese Spec bringt **neun neue Eroj** und drei Erweiterungen aus der Arkitekturo-Abdeckung von Spec 011.

| Ero (Arbeitsname) | Deutsch | Familie | schließt |
|---|---|---|---|
| `ikono` | Icon | Grundbaustein | Icon-Slots von `butono`; Figma zeichnet Icons; Pfeile, Haken, Schließen in vorhandenen Eroj |
| `apartigilo` | Trenner | Grundbaustein | Linien, die heute als Rand an Containern hängen |
| `saltligilo` | Sprunglink | Grundbaustein | „Zum Inhalt springen“ (WCAG 2.4.1) |
| `titolo` | Überschrift | Typografie | Überschriften mit Ebene (h1–h6) unabhängig von der Größe |
| `teksto` | Text | Typografie | Fließtext, Bildunterschrift, Kicker, Code inline |
| `konsileto` | Tooltip | Overlay | Kurzer Hinweis zu einem Bedienelement, vor allem zu Icon-Schaltflächen |
| `sxvebilo` | Popover | Overlay | Nicht-modale Ebene mit Inhalt, verankert am Auslöser |
| `menuo` | Aktionsmenü | Overlay | Arkitekturo-Kandidat „Zeilenaktionen“; Grenze `row-actions` der `tabelo` |
| `faldilo` | Aufklapper | Aufklappen | Details und Akkordeon |
| `kompletigilo` | Eingabe mit Vorschlägen (Combobox) | Eingabe | Lücke zwischen `kampo` (frei) und `elektilo` (feste Liste) |

**Erweiterungen vorhandener Eroj** (offen aus der Arkitekturo-Abdeckung von Spec 011):

| Ero | Erweiterung |
|---|---|
| `navigado`, `langetaro` | Gewicht des aktuellen Eintrags bzw. gewählten Reiters wird gebunden (`font.weight.*`), heute nur in G4 beschrieben |
| `dialogo` | Hilfetext zur Begründung (`reason-help`), durchgereicht an den komponierten `tekstareo` |
| `atributlisto` | `layout: auto`: Spalten, solange der Container breit genug ist, sonst gestapelt (Container-Query, Schwelle aus `size.container.*`) |

Der Satz, den diese Spec belegen soll:

> Ein Agent, der eine Seite baut, findet für jedes Icon, jede Überschrift, jeden Text, jede schwebende Ebene und jedes Aufklappen ein Ero mit Begründung und erfindet keinen Stil und kein Popup.

**Geschwindigkeit vor Breite (14.10.)** gilt wie in Spec 010 und 011: Jedes Ero bekommt den kleinsten vollständigen Umfang. Was fehlt, steht als Grenze in der Uzo.

## Nicht im Scope (als Grenze geführt)
- Etappe 4 der Roadmap (Spec 015): Seitenblättern, Brotkrumen, Upload, Toast, Karte, Avatar.
- Seitenmuster (Sxablonoj) und Inhalt (Markdown, Code-Block).
- Untermenüs im `menuo`, Mehrfachauswahl im `kompletigilo`, Freitext-Tags.
- Tooltip mit Inhalt, der bedient werden kann. Das ist ein Popover.
- Eigener Icon-Editor oder Icon-Import. Die Pipeline der Icons in voller Breite folgt in Phase 5.
- Drawer und Seitenpaneel.

## Gemeinsame Festlegungen

**G1 – Achsen- und Zustandsnamen wie bisher.** `intent`, `size` und `emphasis` heißen wie beim `butono` und `kampo`, Status-Werte wie in Spec 011 G1. Zustände gibt es nur am bedienten Teil (`SkemoSlot.entry`, E3 aus 011).

**G2 – Keine neuen Tokens (E1).** Vorhanden und erste Wahl (gemessen am 17.10. auf 27532e8):
- `size.icon.small|medium|large`
- `typography.display.1–3`, `typography.headline.1–4`, `typography.body.1–2`, `typography.label.1–2`, `typography.caption`, `typography.code`, `typography.kicker`
- `font.weight.*`
- `color.text.default|subtle|muted|inverse|disabled`
- `color.border.default|subtle|strong`
- `border.width.default|strong|focus`
- `elevation.layer.overlay`, `elevation.shadow.overlay|floating`
- `color.background.raised|inverse`
- `focus.ring`, `focus.offset`
- `motion.duration.*`, `size.target.min`, `radius.role.*`

Fehlt eine Rolle: die nächstliegende nehmen und ein Manko führen. Kandidat ist der Hintergrund des Tooltips. Ist `background.inverse` mit `text.inverse` kein deklariertes KontrastParo, wird es deklariert. Ein neues Token gibt es nicht.

**G3 – Ikonaro: Icons sind Vokabular, das Bild gehört der Aspekto.**
- Der Kern führt eine Liste **semantischer Icon-Namen** (`data/ikonaro.json`): Name, Bedeutung de/en und Kialo. Beispiele:
  - `close`, `chevron-down`, `chevron-right`, `check`
  - `sort-ascending`, `sort-descending`, `info`, `success`, `warning`, `danger`
  - `more`, `search`, `external`, `expand`, `collapse`
- Die Startmenge ist genau das, was die 17 vorhandenen und die 9 neuen Eroj brauchen, plus `more`, `search` und `external`. Ziel sind höchstens 25 Namen.
- **Jede Aspekto liefert die Bilder** (SVG, 24er-Raster, `currentColor`). Der Satz aus Art. IV gilt: Ikonografie ist eine Dimension der Marke. Vollständigkeit wird geprüft: Jede Aspekto belegt jeden Namen (wie beim Vortaro).
- **komuna (E10):** Die Glyphen stammen aus einem Open-Source-Icon-Set mit permissiver Lizenz (Art. V Abs. Schriften und Icon-Sets), nur die benötigten Namen, mit Herkunftsnachweis je Datei (Art. VII). Vorschlag: Lucide (ISC). ekzemplo bekommt als Fixture ein absichtlich anderes Set (z. B. gefüllt statt Linie), damit der Markenwechsel bei Icons sichtbar und testbar ist.
- Die Vitrino zeigt Icons. Damit entfällt `icon` in `FIGMA_NOT_DRAWN`, und Figma zeichnet sie (`createNodeFromSvg`, Farbe an die Variable gebunden). Der Jugxo `jug_01M31TV1V4S3RNBPWSRB2CGEDK` bekommt einen Nachtrag „aufgehoben durch Spec 014“. Er wird nicht gelöscht.

**G4 – Overlays auf der Plattform (E11).**
- Alle schwebenden Ebenen (`konsileto`, `sxvebilo`, `menuo`, die Vorschlagsliste des `kompletigilo`) nutzen die **Popover-API** der Plattform: Top Layer, Light Dismiss, Escape.
- Positionierung über **CSS Anchor Positioning**. Wo der Browser es nicht kann, gibt es einen einfachen Fallback unter dem Auslöser. P0 misst die Unterstützung in Chromium, Firefox und WebKit und trägt sie in plan.md ein. Ein Positionierungs-Framework wird nicht eingebunden.
- Ebene `elevation.layer.overlay`, Schatten `elevation.shadow.overlay`. In Figma wird der Schatten **gebunden**: Die Felder `elevation/shadow/overlay/…` werden über `setBoundVariableForEffect` an einen DROP_SHADOW-Effekt gebunden. Das schließt den Befund „Schattenvariablen ungebunden“ aus der Vojmapo, auch für `dialogo` (`modal`).
- Figma zeigt jede schwebende Ebene geöffnet als eigene Variante neben dem Auslöser (statisch). Einen Zustand `open` gibt es nur dort, wo er sichtbar ist.

**G5 – A11y nach APG.**
- `ikono`: dekorativ (`aria-hidden`, Default) oder mit Bedeutung (`role="img"` und Name aus `label`). Ein Icon allein ist nie die einzige Kennzeichnung eines Status.
- `apartigilo`: `hr` bzw. `role="separator"` mit `aria-orientation`. Rein dekorativ ist er `role="none"`.
- `saltligilo`: erstes fokussierbares Element, sichtbar bei Fokus, Ziel ist ein Landmark oder eine Id mit `tabindex="-1"`.
- `titolo`: Ebene (`level` 1–6) und Erscheinung (`size`) sind getrennt. Die Ebene ist Semantik, die Größe ist Gestaltung.
- `teksto`: `p` oder `span`. Bei `kind=code` ist es `code`.
- `konsileto`: APG Tooltip. Erscheint bei Hover und Fokus, verschwindet mit Escape, bleibt beim Überfahren mit der Maus stehen (WCAG 1.4.13). Verknüpft über `aria-describedby`; bei Icon-Schaltflächen ist der Tooltip-Text gleich dem `label` und wird nicht doppelt gesprochen.
- `sxvebilo`: APG Disclosure plus Dialog nicht-modal. Der Auslöser hat `aria-expanded` und `aria-controls`, der Fokus geht beim Öffnen in die Ebene und beim Schließen zurück.
- `menuo`: APG Menu Button. Rolle `menu` und `menuitem`, Pfeiltasten, Pos1/Ende, Buchstabensuche, Escape schließt und fokussiert den Auslöser, Enter oder Leertaste löst aus.
- `faldilo`: natives `details`/`summary`. Ein exklusives Akkordeon über das Attribut `name` der Plattform.
- `kompletigilo`: APG Combobox mit Listbox, `aria-activedescendant`, `aria-autocomplete="list"`. Die Anzahl der Treffer wird als Live-Region angesagt („3 Vorschläge“).

`a11y.texts` (de/en) gibt es dort, wo die Plattform keinen Text liefert, zum Beispiel:
- „Zum Inhalt springen“
- „Weitere Aktionen“
- „n Vorschläge“, „keine Vorschläge“
- „aufklappen“, „zuklappen“

**G6 – Uzo-Verflechtung (Pflicht in jedem PR).**
- `butono`: Die Slots `icon-start`, `icon-end` und das reine Icon komponieren `ikono`. Eine Icon-Schaltfläche komponiert `konsileto` (Kialo: Wer nur ein Bild sieht, braucht den Namen auch sichtbar).
- `avizo`, `insigno`: Ein Icon je `intent` ist erlaubt, nie allein (`error-not-color-only` sinngemäß).
- `tabelo`: Grenze `row-actions` → `use-instead: menuo`. Die Sortierpfeile sind `ikono`.
- `elektilo`, `kampo`: neues `instead` `suggestions` → `kompletigilo` (Kialo: Wer tippt und Vorschläge braucht, nimmt die Combobox; eine feste kurze Liste bleibt beim `elektilo`).
- `kompletigilo` → `elektilo`, wenn die Liste fest und kurz ist und Tippen nicht hilft.
- `navigado`: Die Grenze `submenu` bleibt ask-human. `menuo` ist kein Navigationsmenü (Kialo: Ein Aktionsmenü löst Aktionen aus, eine Navigation führt zu Seiten).
- `langetaro` ↔ `faldilo`: Ansichten wechseln oder Inhalte ein- und ausklappen.
- `sxvebilo` ↔ `dialogo`: nicht-modal oder modal. Verlangt die Ebene eine Entscheidung, ist sie ein Dialog.
- `konsileto` ↔ `sxvebilo`: nur Text oder bedienbarer Inhalt.
- `konsileto` ↔ `kampo.help`: Was zum Ausfüllen nötig ist, steht als Hilfetext sichtbar und nicht im Tooltip.
- `titolo` wird komponiert von `dialogo` (heading), `avizo` (heading), `plenstato` und `tabelo` (caption sichtbar).
- `ligilo` ↔ `saltligilo`: ein Ziel auf einer anderen Seite oder ein Sprung auf derselben Seite.

Jedes `instead` auf ein vorhandenes Ero ist `use-instead`, nie `ask-human` (`uzo-boundary-covered`).

**G7 – Goals und Stichwörter (Nachlese 3, G3).** Bevor ein Stichwort neu vergeben wird, prüft P0 die Warnung `goal-keyword-shared`. Bindend sind diese Fälle:
- **„Menü“, „menu“ und „Hauptmenü“ bleiben bei `navigado`** (O-28, 17.10.). `menuo` bekommt nur zusammengesetzte Wörter: Aktionsmenü, Kontextmenü, weitere Aktionen, Zeilenaktionen, action menu, context menu, overflow menu, kebab menu.
- „Tooltip“, „Hinweis beim Überfahren“, „hover hint“ → `konsileto`. **„Hinweis“ bleibt beim `avizo`.**
- „Popover“, „Flyout“, „Ausklappfenster“ → `sxvebilo`.
- „Akkordeon“, „Details“, „aufklappen“, „FAQ“, „accordion“, „disclosure“ → `faldilo`. **„Details“ nur, wenn die atributlisto es nicht schon trägt; sonst Gleichstand → ask-human ist korrekt.**
- „Autocomplete“, „Combobox“, „Vorschläge“, „Suche mit Vorschlägen“, „typeahead“ → `kompletigilo`.
- „Icon“, „Symbol“, „Piktogramm“, „glyph“ → `ikono`. „Überschrift“, „Titel“, „heading“ → `titolo`. „Text“, „Absatz“, „paragraph“, „caption“ → `teksto`. „Trennlinie“, „divider“, „separator“ → `apartigilo`. „Skip link“, „Sprunglink“, „zum Inhalt“ → `saltligilo`.

**G8 – Text-Regeln.** Je Regel ein Jugxo approved/rejected in de und en.
- **Ausgeweitet statt vervielfacht (E5):**
  - `label-names-action` → Einträge des `menuo`
  - `option-labels-distinct` → Einträge des `menuo` und Vorschläge des `kompletigilo`
  - Feldregeln des `kampo` (`field-label-visible`, `field-label-names-the-datum`, `help-is-one-sentence`, `error-says-what-to-do`, `error-not-color-only`, `required-marked`, `placeholder-not-label`) → `kompletigilo`
  - `link-label-names-destination` → `saltligilo`
- **Neu (je Kialo, höchstens diese vier):**
  - `icon-meaning-named` (fest): Ein Icon, das etwas bedeutet und nicht nur ziert, hat einen Namen (`label`), und eine Schaltfläche nur mit Icon hat ein `label`. Prüfart über Prop. Kialo: Ein Bild ohne Namen ist für einen Screenreader stumm.
  - `heading-levels-in-order` (fest): In einer Liste von Instanzen springt keine Überschriftenebene nach unten über eine Stufe (2 → 4). Prüfart über die Liste, wie `option-labels-distinct`. Kialo: Die Ebenen sind das Inhaltsverzeichnis für Screenreader.
  - `tooltip-text-short` (anpassbar): Ein Tooltip hat höchstens acht Wörter. Prüfart `max-words`. Kialo: Was länger ist, gehört sichtbar auf die Seite oder in ein Popover.
  - `disclosure-label-names-content` (anpassbar): Die Beschriftung eines Aufklappers nennt den Inhalt, zum Beispiel „Versionsgeschichte“ und nicht „Mehr“ oder „Details anzeigen“. Prüfart `not-words`, im `scope` als Näherung benannt. Kialo: Wer die Beschriftung liest, entscheidet, ob er aufklappt.

**G9 – Reihenfolge und Branches (E6).** Fünf PRs, gestapelt. Je Ero eigene Commits, jeder PR für sich abnehmbar:
1. **① Grundlage:** die drei Erweiterungen (Gewicht, `reason-help`, `layout: auto`), das Ikonaro (G3) als Daten mit Vollständigkeitsprüfung je Aspekto, die Glyphen für komuna und ekzemplo, KontrastParo des Tooltip-Hintergrunds (G2), Overlay-Messung (G4: Browser-Unterstützung, noch ohne Ero). Von `main`.
2. **② Grundbausteine:** `ikono`, `apartigilo`, `saltligilo`. Icons in `butono`, `tabelo` (Sortierung), `avizo` und `elektilo` (Chevron) auf `ikono` umstellen; Figma zeichnet Icons.
3. **③ Typografie:** `titolo`, `teksto`. `dialogo`, `avizo`, `plenstato` komponieren `titolo`.
4. **④ Overlays:** `konsileto`, `sxvebilo`, `menuo`. Schatten in Figma gebunden (auch `dialogo`). `tabelo.row-actions` → `menuo`.
5. **⑤ Aufklappen und Vorschläge:** `faldilo`, `kompletigilo`.

Bleibt ⑤ nachts unfertig, bleibt er offen; ①–④ werden trotzdem gemessen.

**G10 – Projekcioj, Parität, Tests** wie Spec 011 G7:
- Web Component `fm-<ero>`. Form-associated ist `kompletigilo` (wie `kampo`).
- React-Projektion, Figma-Set im Frame „Eroj“ (F-8), Make-Kit-Seite und je Ero ein Satz in den Guidelines.
- Vitrino-Abschnitt; die Vitrino zeigt dabei auch das Ikonaro als Raster je Aspekto.
- MCP: `list_eroj` meldet 26 Eroj, `brief` je Ero gemessen (Grenze 750).
- Alirebleco (axe: img, separator, tooltip, menu, combobox, group/details) in beiden Aspektoj; Internacia (RTL: Chevron und Pfeile spiegeln, wo die Richtung Bedeutung hat; `chevron-right` wird in RTL gespiegelt, `check` nicht), Textexpansion ×1,4 bei Menüeinträgen und Tooltips.
- Fehlerfixtures zuerst rot. Je Ero mindestens: Pflicht-Slot leer, Web-Begriff in der Skemo, `instead` ohne Kialo und je neue Regel ein rejected-Beispiel. Für G3 zusätzlich: Aspekto ohne einen Icon-Namen → rot.

## ① Grundlage
- **Gewicht:** Die Skemata von `navigado` (Eintrag `current`) und `langetaro` (Reiter `selected`) binden das Gewicht. Vorschlag `font.weight.semibold`, sonst die Rolle, die `typography.label.1` in fett trägt. Figma zeigt es. Arkitekturo-Abdeckung „offen“ → „trägt“.
- **`dialogo.reason-help`:** Slot, sichtbar unter dem Begründungsfeld, wird als Hilfe an den `tekstareo` gegeben (`aria-describedby`). `help-is-one-sentence` ausgeweitet.
- **`atributlisto.layout: auto`** (neuer Default bleibt `columns`, `auto` ist wählbar): Container-Query auf dem Host. Unter der Schwelle wird gestapelt. Die Schwelle ist eine vorhandene Größe (Vorschlag `size.container.small`), keine neue Zahl. Test: Breite schmal und breit, Internacia-Test mit langen Schlüsseln.
- **Ikonaro:** Schema, `data/ikonaro.json` mit Namen, Bedeutung de/en und Kialo. Prüfung `check:ikonaro`: Jede installierte Aspekto belegt jeden Namen; jede Datei ist SVG, `viewBox 0 0 24 24`, ohne feste Farbe und mit Herkunftsnachweis. Ontologio-Begriff **Ikonaro** (de: Icon-Vokabular).
- **Overlay-Messung:** Popover-API und Anchor Positioning in den drei Engines, Ergebnis als Tabelle in plan.md. Danach entscheidet ④ zwischen Anchor und Fallback, ohne Rückfrage, nach E11.

## ② Grundbausteine

### `ikono` – Icon
- **purpose:** „Shows a symbol from the brand's icon set, decorative by default, named when it carries meaning.“
- **Props:** `name` (Pflicht, ein Name des Ikonaro), `size: small | medium | large` (Default medium → `size.icon.*`), `label` (optional; belegt = bedeutungstragend).
- **Zustand:** rest. **Teile:** `glyph` (Farbe `currentColor`, erbt vom Kontext; eigene Farbe nur über `intent` bei Status-Icons: `color.status.<intent>.text`).
- **Goals:** `show-icon` (Stichwörter G7).
- **Uzo:**
  - instead: `status-only-icon` → insigno (Kialo: ein Status braucht ein Wort), `logo` → ask-human (ein Logo ist kein Icon)
  - boundary: `custom-svg` ask-human (ein Bild außerhalb des Ikonaro), `animated-icon` not-supported
  - composes: butono, avizo, insigno, tabelo, elektilo, menuo, faldilo, kompletigilo
  - content: `icon-meaning-named` fest
- **Figma:** Set `ikono` mit `name` × `size`; Farbe an `color.text.default` gebunden, damit die Instanz in jeder Fläche erbt.

### `apartigilo` – Trenner
- **purpose:** „Separates groups of content where space alone does not.“
- **Props:** `orientation: horizontal | vertical` (Default horizontal), `decorative` (boolesch, Default false).
- **Teile:** `line` (`color.border.subtle`, `border.width.default`).
- **Uzo:** instead `spacing-only` → ask-human (Kialo: Wo Abstand genügt, braucht es keine Linie); composes menuo (Gruppen), faldilo, Seitenabschnitt.
- **Figma:** `orientation`.

### `saltligilo` – Sprunglink
- **purpose:** „Lets keyboard users skip repeated content and jump to the main content.“
- **Props:** `target` (Pflicht, Id des Ziels). **Slot:** Standard (Text, Default aus `a11y.texts`: „Zum Inhalt springen“).
- **Zustände:** versteckt bis Fokus; `focus` sichtbar mit `focus.ring`, über allem (`elevation.layer.overlay`).
- **Uzo:** instead `in-page-link` → ligilo (Kialo: Ein Verweis im Text ist ein Link, der Sprunglink umgeht Wiederholungen); composes Shell (Sxablono, später); content `link-label-names-destination` ausgeweitet.
- **Figma:** nur der sichtbare Fokuszustand.

## ③ Typografie

### `titolo` – Überschrift
- **purpose:** „Names a page or section; its level is structure, its size is design.“
- **Props:** `level: 1 | 2 | 3 | 4 | 5 | 6` (Pflicht), `size: display-1 | display-2 | display-3 | headline-1 | headline-2 | headline-3 | headline-4` (Default aus `level`: 1 → headline-1, 2 → headline-2, 3 → headline-3, 4–6 → headline-4).
- **Teile:** `text` (`typography.<size>`, `color.text.default`).
- **Uzo:**
  - instead: `bold-paragraph-as-heading` → titolo (sich selbst), Kialo in content
  - boundary: `heading-with-actions` ask-human (eine Kopfzeile ist ein Sxablono)
  - composes: dialogo, avizo, plenstato, Seitenabschnitt
  - content: `heading-levels-in-order` fest
- **Figma:** `size` als Achse; `level` als Text-Property ohne sichtbare Wirkung (G7 aus 010: nur Achsen mit Wirkung) → als Eigenschaft der Instanz, nicht als Variante.

### `teksto` – Text
- **purpose:** „Sets running text in the system's type roles: body, caption, kicker, inline code.“
- **Props:** `kind: body | caption | kicker | code` (Default body), `size: 1 | 2` (nur bei body), `tone: default | subtle | muted` → `color.text.*`. **Achtung Namen:** `tone` ist seit Spec 007 F1 als Achsenname für Status ersetzt. Hier ist es die Rangfolge des Textes und kein Status. P0 schlägt in plan.md einen Namen vor (Kandidat `emphasis: high | medium | low`, wie beim `butono`), der Maintainer bestätigt ihn bei der Abnahme von ③.
- **Teile:** `text` (`typography.body.*|caption|kicker|code`).
- **Uzo:** instead `heading` → titolo, `link-in-text` → ligilo, `status-word` → insigno; boundary `rich-text` ask-human (Markdown folgt in Etappe 6).
- **Figma:** `kind` × `size`/Rangfolge.

## ④ Overlays

### `konsileto` – Tooltip
- **purpose:** „Shows the name or a short hint of a control while it is hovered or focused.“
- **Props:** `for` (Pflicht, Id des Auslösers), `placement: block-start | block-end | inline-start | inline-end` (Default block-start, logisch). **Slot:** Standard (Text).
- **Teile:** `surface` (`color.background.inverse`, `radius.role.control`, `elevation.shadow.overlay`), `text` (`color.text.inverse`, `typography.caption`).
- **Verhalten:** Verzögerung beim Erscheinen aus `motion.duration.*`, Escape schließt, bleibt beim Überfahren stehen.
- **Uzo:**
  - instead: `essential-info` → kampo.help oder teksto (Kialo: Wer nicht zeigt oder fokussiert, sieht es nie; auf Touch gibt es kein Überfahren), `interactive-content` → sxvebilo
  - boundary: `tooltip-on-disabled` ask-human (gesperrte Elemente bekommen keinen Fokus)
  - composes: butono (nur Icon), ikono mit Bedeutung
  - content: `tooltip-text-short`
- **Figma:** Variante geöffnet über einer Icon-Schaltfläche, `placement` als Achse.

### `sxvebilo` – Popover
- **purpose:** „Opens a non-modal layer with content next to its trigger; the page stays usable.“
- **Props:** `label` (Pflicht, Name der Ebene), `placement` wie oben. **Slots:** `trigger` (ein `butono`), Standard (Inhalt), `heading` (optional, komponiert `titolo`).
- **Teile:** `surface` (`color.background.raised`, `color.border.subtle`, `radius.role.surface`, `elevation.shadow.overlay`, Abstand aus `size.scale`), `heading`, `content`.
- **Uzo:**
  - instead: `decision` → dialogo, `short-hint` → konsileto, `actions-list` → menuo
  - boundary: `nested-popover` not-supported, `drawer` ask-human
  - composes: butono (Auslöser)
  - layout: Breite höchstens `size.container.small`
- **Figma:** geöffnet neben Auslöser.

### `menuo` – Aktionsmenü
- **purpose:** „Offers actions for one object behind a single button: edit, duplicate, delete.“
- **Props:** `label` (Pflicht; bei Icon-Auslöser der Name, Default aus `a11y.texts` „Weitere Aktionen“). **Slots:** `trigger` (ein `butono`, Default `emphasis=low` mit `ikono name=more`), `items` (Pflicht, min 1; je Eintrag Id, Text, optional `ikono`, optional `intent=danger`, optional `disabled`), Gruppen getrennt durch `apartigilo`.
- **Zustände:** am Eintrag rest, hover, focus, disabled (`SkemoSlot.entry`).
- **Ereignis:** `select` mit Id. Ein Eintrag mit `intent=danger`, der nicht rückgängig zu machen ist, öffnet in der Anwendung einen `dialogo`; das sagt die Uzo, das Ero erzwingt es nicht.
- **Teile:** `surface` wie `sxvebilo`, `item` (`typography.label.1`, Mindestzielgröße `size.target.min`, hover `color.action.tertiary.*` bzw. die Rolle, die `elekto` und `langetaro` dafür binden), `danger-item` (`color.status.danger.text`).
- **Uzo:**
  - instead: `navigate` → navigado (Kialo G6), `choose-value` → elektilo, `single-action` → butono (Kialo: Ein Menü mit einem Eintrag versteckt eine Aktion)
  - boundary: `submenu` not-supported, `checkable-items` ask-human
  - composes: tabelo (Zeilenaktionen), Kopf eines Datensatzes
  - content: `label-names-action` und `option-labels-distinct` ausgeweitet
- **Figma:** geöffnet mit drei Einträgen, einer `danger`, einer `disabled`.

## ⑤ Aufklappen und Vorschläge

### `faldilo` – Aufklapper
- **purpose:** „Hides secondary content behind a label the person can open; several share a group when only one should be open.“
- **Props:** `open` (boolesch), `group` (optional; gleicher Wert = exklusives Akkordeon). **Slots:** `summary` (Pflicht, Text), Standard (Inhalt).
- **Zustände:** am `summary` rest, hover, focus; `open` als Achse.
- **Teile:** `summary` (`typography.label.1`, `ikono name=chevron-down|chevron-right` dreht mit `motion.duration.*`, bei reduzierter Bewegung sofort), `content`, Trennung zwischen Einträgen einer Gruppe über `apartigilo`.
- **Uzo:**
  - instead: `switch-view` → langetaro, `required-info` → teksto (Kialo: Was alle lesen müssen, wird nicht versteckt)
  - boundary: `nested-disclosure` ask-human
  - content: `disclosure-label-names-content`
- **Figma:** `open` × Gruppe (ein Eintrag offen, zwei zu).

### `kompletigilo` – Eingabe mit Vorschlägen
- **purpose:** „A field that suggests matching values while the person types; the value may be one of the suggestions or, if allowed, free text.“
- **Props:** wie `kampo` (label, help, error, required, disabled, size), dazu `allow-free` (boolesch, Default false), `min-chars` (Default 1). **Slots:** `options` (Einträge wie `elekto`/`elektilo`, `<data slot="options">`), `label`, `help`, `error`. Die Anwendung kann die Optionen beim Ereignis `query` neu setzen (Suche auf dem Server).
- **Zustände:** wie `kampo`; dazu `expanded` als Achse, nur in Figma sichtbar geöffnet.
- **Teile:** das Feld des `kampo` (Teile und Bindungen kopiert, wie beim `elektilo`), `listbox` (Fläche wie `menuo`), `option` (Eintrag, `selected` und `active`), `no-results` (`teksto kind=caption`).
- **Uzo:**
  - instead: `few-fixed-options` → elekto, `many-fixed-options-no-typing` → elektilo
  - boundary: `multi-select` ask-human, `tags` not-supported
  - content: Feldregeln ausgeweitet (G8), `select-placeholder-is-prompt` ausgeweitet
- **Figma:** geschlossen und geöffnet mit drei Vorschlägen, einer aktiv.

## Gvidanto (Art. VII)

**Beispiel-Dialoge als Akzeptanzkriterien (MCP-Test):**
> „Ich brauche ein Mülleimer-Icon zum Löschen in jeder Tabellenzeile“ → `menuo` mit Eintrag „Löschen“ (`intent=danger`) statt eines Icons je Zeile, oder, wenn es nur eine Aktion gibt, `butono` mit `ikono` und `label` „Löschen“ samt `konsileto`. Kialo aus `tabelo.row-actions` und `menuo.instead.single-action`.

> „Mach diesen Text fett, das ist die Überschrift des Abschnitts“ → `titolo level=2`, nicht fetter `teksto`.

> „Tooltip mit den Passwortregeln am Feld“ → `kampo.help`, kein `konsileto` (Kialo `essential-info`).

> „Menü“ → Rückfrage mit Kandidaten `navigado` und `menuo`? **Nein:** „Menü“ allein führt zu `navigado` (G7, O-28). „Aktionsmenü“ führt zu `menuo`.

> „Feld, in dem man ein Land tippt und Vorschläge bekommt“ → `kompletigilo`. „Land aus 5 Ländern wählen“ → `elekto`.

## Abnahme (je PR, wie 011)
1. `get_ero <ero>` und `brief` ≤ 750, Wert in plan.md.
2. Beispiel-Dialoge als MCP-Tests grün; alle Dialoge aus Spec 008–012 unverändert grün.
3. Figma f10b-5: neue Sets im Frame „Eroj“, Beschreibung = purpose, Moduswechsel komuna ↔ ekzemplo, keine Überlappung; **ab ② sind Icons gezeichnet und wechseln mit der Marke**, **ab ④ sind Schatten gebunden**.
4. Vitrino: Abschnitt je Ero, Ikonaro-Raster, Markenwechsel, Gebrauch (Tooltip mit Tastatur, Menü mit Pfeilen, Combobox mit Tippen).
5. Fehlerfixtures erst rot, dann grün.
6. Parität aller 26 Eroj, Alirebleco und Internacia grün; CI ≤ 12 min bleibt.
7. Ontologio: 9 Eroj und **Ikonaro** mit de/en-Synonymen; keine neue Warnung `goal-keyword-shared` außer den in G7 genannten.
8. Arkitekturo-Abdeckung je Ero in plan.md; die drei Erweiterungen aus ① stehen auf „trägt“.
9. Make-Kit-Guidelines: je Ero ein Satz, z. B. „Every icon is an Ikono with a name from the Ikonaro; never paste an SVG.“

## Entscheidungen (gelten, bis der Maintainer widerspricht)
- **E1** Keine neuen Tokens (G2).
- **E2** Achsennamen wie bisher. Den Namen der Rangfolge-Achse am `teksto` bestätigt der Maintainer in ③.
- **E3** Zustände am bedienten Teil (`SkemoSlot.entry`).
- **E4 Namen:** `ikono`, `apartigilo`, `saltligilo`, `titolo`, `teksto`, `konsileto`, `sxvebilo`, `menuo`, `faldilo`, `kompletigilo`, dazu der Begriff `Ikonaro`. Der Maintainer kann sie bis zum Merge von ① ändern. ② beginnt erst danach.
- **E5** Regeln ausweiten statt vervielfachen; neu nur die vier aus G8.
- **E6** Reihenfolge ①–⑤, gestapelt. Ist ⑤ nicht fertig, bleibt er offen.
- **E7** Arkitekturo ist Anforderung, kein Code wird übernommen.
- **E8** Bei „Menü“ gewinnt `navigado` (O-28); `menuo` bekommt nur zusammengesetzte Stichwörter.
- **E9** Icons sind Vokabular im Kern und Bild in der Aspekto (G3). Kein Icon-Font, nur SVG.
- **E10** komuna-Glyphen aus einem Open-Source-Set mit permissiver Lizenz, Vorschlag Lucide (ISC), nur benötigte Namen, mit Herkunftsnachweis. Alternative, falls der Maintainer widerspricht: eigene, einfache Glyphen im 24er-Raster.
- **E11** Overlays nur mit Popover-API und Anchor Positioning der Plattform, einfacher eigener Fallback, kein Positionierungs-Framework (G4).
- **E12** Toast, Drawer, Untermenüs und Mehrfachauswahl sind nicht in dieser Spec (Spec 015 oder Grenze).

## Benchmark (Art. V, öffentlich)
- WAI-ARIA APG: Tooltip, Disclosure, Accordion, Menu Button, Menu, Combobox (Listbox Popup), Dialog (non-modal), Landmarks, Skip Link (Technik G1).
- WCAG 2.2: 1.1.1, 1.3.1, 1.4.1, 1.4.3, 1.4.11, 1.4.13, 2.1.1, 2.4.1, 2.4.3, 2.4.6, 2.4.7, 2.5.8, 4.1.2, 4.1.3.
- HTML: Popover-API, `details` mit `name`, CSS Anchor Positioning (Stand der Browser misst P0).
- GOV.UK: Skip link, Details, Accordion, Typography (Überschriftenebenen vs. Größen). USWDS: Tooltip, Combo box, Accordion, Icon.
- Lucide (ISC) nur als Quelle der komuna-Glyphen mit Herkunftsnachweis, nicht als Benchmark für das Ero.

P0 ergänzt research.md nur bei Entscheidungen, die hier fehlen.
