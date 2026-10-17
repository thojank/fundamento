# Spec 014 – Eroj Runde 3 – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-17, 19:54, unverändert kopiert; die Korrektur des Maintainers nennt Phosphor in G3, E10 und Benchmark und „quadratische viewBox“) · **Briefing:** `briefing-p0-2026-10-17.md` (Maintainer-Ordner, nicht kopiert) · **Basis:** `main` @ `f6f38f5` (Nachlese 3 #68, #69) · **Regel 0** (12.10.) gilt: Weg des `butono` zuerst, sonst kleinste Änderung mit Eintrag hier; Tokens, Regulo-Semantik und Constitution unverändert; nie eine Grenze schwächen, um grün zu werden. **Aufgaben, Commits und rote Hashes:** [`tasks.md`](tasks.md).

Fünf PRs, gestapelt (E6): ① Grundlage von `main`, ② Grundbausteine von ①, ③ Typografie von ②, ④ Overlays von ③, ⑤ Aufklappen von ④.

## ① Grundlage

**Branch:** `261017-spec-014-grundlage-d4f536` (von `main` @ `f6f38f5`) · **Datum:** 2026-10-17.

### Zusammenfassung

1. **Gewicht** (D-01): neue Teil-Eigenschaft `weight` (Typ `fontWeight`); `navigado.items.weight` by `current`, `langetaro.tabs.weight` by `active`: `font.weight.semibold` wo aktuell/aktiv, `none` sonst (das Gewicht der Rolle `label.1` bleibt). Web: `font-weight` nur im aktuellen Fall; Figma: der Schnitt `SemiBold` als Schrift des Eintrags, `fontStyle` an den STRING-Zwilling `font/style/semibold` gebunden (F30); Unterstrich und Indikator bleiben (G4).
2. **`dialogo.reason-help`** (D-02): Text-Slot unter dem Begründungsfeld, an den komponierten `tekstareo` als dessen `help` gereicht (beschreibt das Textfeld, `aria-describedby`); Constraint „`reason-help` belegt ⇒ `reason` optional|required“; `help-is-one-sentence` ausgeweitet statt vervielfacht (E5), als Warnung am `dialogo`; vier Jugxoj (de/en, approved/rejected).
3. **`atributlisto layout: auto`** (D-03): dritter Wert der Achse `layout`; die Uzo nennt mit `columns-from: size.container.small` die Containerbreite, ab der Name und Wert nebeneinander stehen; das Element misst seinen Container (ResizeObserver, Schwelle aus `--fm-size-container-small`) und schreibt `data-layout` columns|stacked; Figma zeichnet `auto` als den breiten Fall.
4. **Ikonaro** (D-04, G3): `data/ikonaro.json` mit 15 Namen (Bedeutung de/en, Kialo, `mirror`), Entität `ikono` mit Präfix `iko_`, optionale Datendatei im Loader; `check:ikonaro`; Glyphen komuna aus **Phosphor Icons, Stil regular**, ekzemplo aus **Phosphor Icons, Stil fill** (Abweichung 1), mit Herkunftsnachweis je Datei und Abbildung Ikonaro-Name → Phosphor-Name im Aspekto-Paket (seit der Spec-Korrektur vom 17.10., 19:54, Spec-konform).
5. **Tooltip-Kontrast** (D-05, G2): das Paar `text-inverse-on-background-inverse` (`color.text.inverse` auf `color.background.inverse`, `text-normal`) ist bereits deklariert; kein neues Token, kein neues Paar.
6. **Overlay-Messung** (D-06, G4): Popover-API und CSS Anchor Positioning sind in Chromium 153, Firefox 155 und WebKit 26.6 vollständig vorhanden und verhalten sich wie spezifiziert (Tabelle unten). ④ nutzt `position-area`/`position-anchor` der Plattform mit `position-try-fallbacks`, der eigene Fallback (unter dem Auslöser) bleibt klein (E11).

Kein neues Ero in ①, kein Token (E1), keine Regulo-Semantik geändert.

### Entwurfsentscheidungen

#### D-01 Gewicht als Part-Eigenschaft `weight` (navigado, langetaro)

`SkemoPartProperty` erhält `weight` (bindet ein `font.weight.*`-Token oder `none`; `PART_PROPERTY_TYPES.weight = fontWeight`). `navigado/skemo.json` bindet `items.weight` by `current` (`true` → `font.weight.semibold`, `false` → `none`), `langetaro/skemo.json` `tabs.weight` by `active` ebenso. Weg des `butono`: eine weitere Teil-Eigenschaft neben `shadow` und `stroke`, keine neue Achse und kein neues Token (E1). `none` heißt: das Gewicht der Typografie-Rolle steht – der Web Component schreibt dann nichts, Figma behält den Schnitt der Rolle. Im Web wird `font-weight: var(--fm-font-weight-semibold)` nur in der Regel des aktuellen Eintrags (`a[aria-current]`) bzw. des aktiven Reiters (`[aria-selected="true"]`) geschrieben. In Figma löst der Plan das gebundene Gewicht je Aspekto zum Schnitt auf (600 → `SemiBold`) mit der Familie der Rolle, trägt es als `font` des Eintrags und als Kreuzung Familie × Schnitt in die Schriften des Sets (komuna Geist SemiBold, ekzemplo Archivo SemiBold); das Plugin lädt den Schnitt und bindet `fontStyle` an den STRING-Zwilling `font/style/semibold` (F30). Unterstrich und Indikator bleiben: das Gewicht ergänzt, es ersetzt kein zweites Merkmal (G4).

#### D-02 `dialogo.reason-help`

Ein Text-Slot `reason-help` nach `reason` (Skemo und Uzo: `accepts: text`, `max: 1`). Der Dialog reicht ihn an den komponierten `tekstareo` weiter: `<slot name="reason-help" slot="help">` im Shadow-Markup, damit die Hilfe unter dem Feld steht und das Textfeld beschreibt (`aria-describedby` des `tekstareo`); mit `reason="none"` verschwindet sie mit dem Begründungsbereich. Constraint (Skemo): `slot:reason-help` belegt ⇒ `reason` ∈ {optional, required} – Hilfe unter einem Feld, das es nicht gibt, hilft niemandem. `help-is-one-sentence` ausgeweitet statt vervielfacht (E5): `appliesTo.eroj` um `dialogo`, Statement und Scope nennen das Begründungsfeld; die Uzo prüft `slot:reason-help` mit `max-sentences 1` als **Warnung** (wie beim Dialogtitel: eine Textregel am Dialog warnt, D-02 von Spec 011 ②). Vier Jugxoj als Beispiele (de/en approved: „Die Autorin liest den Grund vor der nächsten Fassung.“; de/en rejected: zwei Sätze), generiert in `get_ero` und die Make-Guidelines.

#### D-03 `atributlisto layout: auto` mit `columns-from`

`UzoLayout.columns-from` nennt ein `size.container.*`-Token des Kerns (Schema-Muster, kein Pixelwert: „640px“ ist ungültig); darunter stapelt das Ero, darüber steht der Name neben dem Wert. Layout-Verhalten gehört in die Uzo; die Skemo bindet beide Erscheinungen (`auto` bindet wie der breite Fall `columns`, drei Kombinationen), die Projektion misst den Container. Web: Eine Container-Query nimmt kein `var()`, deshalb beobachtet das Element seine eigene Inline-Größe (`ResizeObserver`) gegen den Wert von `--fm-size-container-small` (komuna 640px) und schreibt `data-layout="columns"` oder `"stacked"`; gewählte Layouts bleiben, was sie sagen. Der ResizeObserver prüft im nächsten Frame nach (ein Layoutwechsel ändert die Höhe des Elements; direkt im Callback wäre das die „ResizeObserver loop“-Warnung der Plattform) – beim Verbinden entscheidet das Element sofort, bei einem Live-Resize mit bis zu einem Frame Verzug. Fehlt das Token, bleibt es bei `columns`. `uzo-prop-unknown` kennt `columns-from` als Layout-Schlüssel. Figma zeichnet `auto` als dritte Variante im breiten Fall (der Plan braucht keine Änderung: alles außer `stacked` ist der Spaltenfall). Die Vitrino zeigt drei Zeilen, die dritte mit dem Wort `auto` vor der Liste. Der React-Typ nimmt `auto` an.

#### D-04 Ikonaro: Namen im Kern, Bilder in der Aspekto (G3, E9, E10)

**Daten.** `data/ikonaro.json` (`IkonaroFile`: `{ "ikonaro": [Ikono…] }`), je `Ikono`: `id` (`iko_` + ULID, Entitätstyp `ikono` im Lock), `name` (kebab), `meaning.de`/`meaning.en`, `kialo`, optional `mirror: true` (die Richtung trägt Bedeutung, die Glyphe wird in Rechts-nach-links-Schrift gespiegelt; Internacia). Die Datei ist im Loader **optional** (`OPTIONAL_DATA_FILE_SCHEMA_DEFS`): fehlt sie, ist das Ikonaro leer und kein Befund – jede Fixture ohne Icons bleibt gültig. Sie wird, wenn vorhanden, gegen `IkonaroFile` geprüft, ihre IDs zählt `checkIds`, der Export `modelo.json` trägt `ikonaro` nur, wenn es Einträge gibt (ein Export ohne Icons behält seine Bytes).

**Startmenge (15 Namen, Grenze 25).** Abgeleitet aus dem, was die 17 Eroj heute zeichnen oder als Zeichen nachbilden, dem Bedarf der 9 neuen Eroj und den drei Namen der Spec (`more`, `search`, `external`). Nicht aufgenommen: `indeterminate` (der `markobutono` hat keinen Mischzustand), `chevron-left`/`chevron-up` (kein Ero braucht sie; `chevron-right` spiegelt in RTL), `loading` (kein Ero zeigt heute einen Spinner), `menu` (Hamburger: die `navigado` hat keinen eingeklappten Zustand, `collapsed-mobile` ist `not-supported`; der Name kommt mit der Grenze zurück, wenn sie fällt – Maintainer 17.10., O-2; die zunächst vergebene ID `iko_01M55EFZMVS7WDTJ3D55SPVHQV` ist im Lock stillgelegt). Phosphor-Name = Name der Datei im Set (komuna liest `assets/regular/<name>.svg`, ekzemplo `assets/fill/<name>-fill.svg`).

| Ikonaro | Bedeutung | Bedarf (Eroj) | Phosphor | mirror |
|---|---|---|---|---|
| `check` | gewählt, erledigt | `elekto.indicator`, `markobutono.indicator`, `menuo` (④) | `check` | – |
| `chevron-down` | öffnet nach unten | `elektilo.indicator`, `faldilo` (⑤), `kompletigilo` (⑤), Auslöser `menuo` (④) | `caret-down` | – |
| `chevron-right` | führt weiter | `faldilo` zu (⑤), Gruppe der `navigado` | `caret-right` | ja |
| `close` | schließen, verwerfen, leeren | `dialogo`, `avizo.dismissible`, `sxvebilo` (④), `kampo`/`kompletigilo` leeren | `x` | – |
| `collapse` | zusammenklappen | `faldilo` (⑤), Spec G3 | `arrows-in-simple` | – |
| `danger` | Gefahr, Fehler | `avizo` (Status), `kampo` ungültig | `warning-octagon` | – |
| `expand` | aufklappen | `faldilo` (⑤), Spec G3 | `arrows-out-simple` | – |
| `external` | führt hinaus | `ligilo.icon-end` (`external-link-marked`) | `arrow-square-out` | – |
| `info` | Hinweis | `avizo` (Status) | `info` | – |
| `more` | weitere Aktionen | `tabelo.row-actions` → `menuo` (④), Spec G3 | `dots-three` | – |
| `search` | suchen | `kampo` (neben dem Feld, `icon-in-field` nicht unterstützt), `kompletigilo` (⑤) | `magnifying-glass` | – |
| `sort-ascending` | aufsteigend | `tabelo.sort` | `sort-ascending` | – |
| `sort-descending` | absteigend | `tabelo.sort` | `sort-descending` | – |
| `success` | Erfolg, gültig | `avizo` (Status), `kampo` gültig | `check-circle` | – |
| `warning` | Warnung | `avizo` (Status) | `warning` | – |

Status-Zeichen (`info`, `success`, `warning`, `danger`) stehen neben der Farbe, weil Farbe allein keine Information ist (WCAG 1.4.1); Kreis, Dreieck und Achteck sind bei kleinen Größen unterscheidbar, `success` (Haken im Kreis) von `check` (bloßer Haken: gewählt).

**Glyphen.** Jedes Aspekto-Paket liefert `ikonoj/<name>.svg` für jeden Namen (Vollständigkeit wie beim Vortaro, Art. IV) und `ikonoj/LICENSE` des Sets. `aspekto.json.ikonoj` deklariert das Set: `set`, `style`, `version`, `license`, `source`, `read` (Lesedatum) und `names` (Abbildung Ikonaro-Name → Name im Set, beide kebab; ein Paket mit eigenen Glyphen hat weder `style` noch `names`). Die Glyphen liegen im Aspekto-Paket, nicht im Kern (Art. V): komuna in `packages/aspekto-komuna/ikonoj/` (exportiert als `./ikonoj/*`), ekzemplo in der Fixture `test/fixtures/valid/aspekto-ekzemplo/aspekto-ekzemplo/ikonoj/`.

**Herkunftsnachweis je Datei (Art. VII)** im `<metadata>` der SVG, vier Zeilen:

```
fundamento-ikonaro: close
source: Phosphor Icons, icon "x" (regular), https://phosphoricons.com
version: @phosphor-icons/core 2.1.1
license: MIT, https://github.com/phosphor-icons/core/blob/main/LICENSE
```

Gelesen am 2026-10-17 aus dem npm-Tarball `@phosphor-icons/core@2.1.1` (`assets/regular`, `assets/fill`); die Pfaddaten sind unverändert übernommen, der Wurzelknoten trägt `fill="currentColor"` (Phosphor liefert das so), eine feste Farbe kommt nicht vor. Die Dateien tragen keinen `<title>` und keine Rolle: Ob eine Glyphe dekorativ oder informativ ist, entscheidet das Ero am Ort der Verwendung (`ikono` in ②), und ein fester Text in der Datei wäre ein Verstoß gegen Internacia. Biome lintet SVG als HTML (`noSvgWithoutTitle`); der Ordner `ikonoj` steht deshalb außerhalb seines Scopes (`biome.json`, wie `test/fixtures` und `src/generated`).

**Raster: `viewBox="0 0 256 256"`, nicht 24.** Phosphor zeichnet im 256er-Raster. Die Glyphen behalten es: Die Pfade bleiben bitgleich mit der Quelle (Herkunft nachprüfbar, kein Umrechnen mit Rundungsfehlern), und ein quadratischer `viewBox` skaliert ohne Verzerrung auf jede Größe – die Größe setzt das Ero (`ikono` in ② über `size`-Token), nicht die Datei. `check:ikonaro` prüft deshalb nur **quadratisch** (`0 0 n n`; `ikonaro-glyph-viewbox` bei fehlendem oder nicht quadratischem viewBox), keinen bestimmten Rasterwert. Die drei Fixtures des Checks zeichnen weiter im 24er-Raster und bleiben gültig. Das Raster hat der Maintainer am 17.10. bestätigt; die Spec sagt seit ihrer Korrektur „quadratische viewBox (Raster laut plan.md)“ (Abweichung 2, erledigt).

**`check:ikonaro`** (Regeln): `ikonaro-glyph-missing` (Aspekto ohne einen Namen; Fehler am Eintrag in `data/ikonaro.json`), `ikonaro-glyph-fixed-color` (feste Farbe an Wurzel oder Form, als Attribut oder `style`; `none` und `currentColor` sind keine Farbe), `ikonaro-glyph-provenance-missing` (ohne `source`, `version`, `license`), `ikonaro-glyph-viewbox` (fehlend oder nicht quadratisch), `ikonaro-glyph-unknown` (Warnung: Glyphe ohne Namen im Ikonaro; nichts wird gelöscht). Misst jede bekannte Aspekto (komuna, ekzemplo als `KNOWN_ASPEKTO_FIXTURES` wie `check:alirebleco`). *(Implementierung im Grün.)*

#### D-05 Tooltip-Kontrast (G2)

`color.text.inverse` auf `color.background.inverse`, Kategorie `text-normal`, als KontrastParo `text-inverse-on-background-inverse` – war bereits deklariert (`kpa_01M2W9W6QK3YTCXM2XBRA41K63`, neben `border-inverse-on-background-inverse`); `check:alirebleco` misst es in allen Kombinationen grün. Kein neues Token (E1), kein neues Paar; der rote Test bestätigt nur, dass ④ den Tooltip darauf setzen kann.

#### D-06 Overlay-Messung (G4, E11)

Skript `packages/eroj/scripts/measure-overlay.mjs` misst Feature-Queries und je ein Verhalten (ein Popover öffnet im Top Layer und schließt mit Escape; ein verankertes Element sitzt unter seinem Anker) in den drei Engines, die Playwright mitbringt (2026-10-17). Ergebnis: alles vorhanden, nur der alte Name `inset-area` fehlt überall – ④ schreibt `position-area`. **Entscheidung für ④ (E11):** `konsileto`, `sxvebilo`, `menuo` und die Vorschlagsliste des `kompletigilo` positionieren mit `position-anchor`/`position-area` und `position-try-fallbacks` der Plattform; der eigene Fallback bleibt die einfache Lage unter dem Auslöser für Umgebungen ohne `anchor-name` (`@supports not (anchor-name: --a)`), kein Positionierungs-Framework.

### Overlay-Messung

Gemessen 2026-10-17 mit `node scripts/measure-overlay.mjs` (Playwright-Engines des Repos):

| Merkmal | chromium 153.0.8010.12 | firefox 155.0 | webkit 26.6 |
|---|---|---|---|
| popover-attribute | ja | ja | ja |
| showPopover | ja | ja | ja |
| popover-open-selector | ja | ja | ja |
| anchor-name | ja | ja | ja |
| position-anchor | ja | ja | ja |
| position-area | ja | ja | ja |
| inset-area (older name) | nein | nein | nein |
| anchor() function | ja | ja | ja |
| position-try-fallbacks | ja | ja | ja |
| anchor-size() | ja | ja | ja |
| showPopover opens (:popover-open) | ja | ja | ja |
| position-area places it below the anchor | ja | ja | ja |
| anchor() places it below the anchor | ja | ja | ja |
| Escape closes it (light dismiss) | ja | ja | ja |

### Arkitekturo-Abdeckung

| Erweiterung | Stand |
|---|---|
| Gewicht (`weight`) | offen → trägt (`navigado`, `langetaro`; Web, React, Figma, Browser-Spec) |
| `reason-help` | offen → trägt (`dialogo`; Skemo, Uzo, Regulo, Jugxoj, Web, Browser-Spec) |
| `layout: auto` (`columns-from`) | offen → trägt (`atributlisto`; Skemo, Uzo, Web mit ResizeObserver, Figma, Vitrino, React, Browser-Specs inkl. RTL) |

### Abweichungen von der Spec

1. **Phosphor Icons (MIT) statt Lucide (ISC) als Quelle der komuna-Glyphen** (D-04; E10, G3, Benchmark) – **durch Spec-Korrektur erledigt** (Spec-Fassung 17.10., 19:54, nennt Phosphor, Stil regular/fill und die Abbildung im Aspekto-Paket; hier als Geschichte der Entscheidung belassen). Entscheidung des Maintainers vom 17.10.2026, als Korrektur vor dem Grün übermittelt; P0 hat nicht von sich aus gewechselt (Briefing: „Du wechselst nicht von dir aus“). Die Spec nannte Lucide als *Vorschlag*; ihre Regel – Open-Source-Set mit permissiver Lizenz (Art. V Abs. Schriften und Icon-Sets), nur die benötigten Namen, Herkunftsnachweis je Datei (Art. VII) – erfüllt Phosphor ebenso. komuna zeichnet im Stil **regular**, ekzemplo im Stil **fill** desselben Sets: ein absichtlich anderer Stil als Fixture (G3), die Herkunft ist beidesmal dieselbe und nachgewiesen. **Ersetzt, nicht ergänzt:** Im Repo gibt es keine Lucide-Glyphe und keinen Lucide-Nachweis; die roten Tests von `27e472d` (Lucide, `viewBox 0 0 24 24`) sind korrigiert. Die Spec-Kopie blieb bis zur Korrektur unverändert (Briefing: „unverändert kopieren“), siehe O-1.
2. **Raster 256 statt 24** (D-04; G3, Briefing „SVG mit viewBox 0 0 24 24“) – **durch Spec-Korrektur erledigt** (die Spec verlangt eine quadratische `viewBox`, das Raster laut plan.md; Maintainer 17.10. bestätigt 256). Folge von 1: Phosphor zeichnet im 256er-Raster, die Pfade bleiben unverändert, `check:ikonaro` prüft nur „quadratisch“. Die Größe setzt das Ero, nicht die Datei.

### Befunde / Mankoj

- **B-1** README sagte „No font files and no icons are shipped“ (Spec 000 FR-18); seit dem Ikonaro liefert das komuna-Paket Glyphen. Satz korrigiert: Icons sind Vokabular im Kern und Bild im Aspekto-Paket. Kein Manko.
- **B-2** Biome lintet SVG als HTML (`noSvgWithoutTitle`); ein `<title>` in der Glyphe wäre fester Text (Internacia). `ikonoj` außerhalb des Biome-Scopes (D-04). Kein Manko.
- **B-3** `help-is-one-sentence` meldet am `kampo` als Fehler, am `dialogo` als Warnung (Uzo-`severity`): eine Textregel am Dialog warnt (Spec 011 ② D-02), am Feld hält sie. Bewusst so; kein Manko.
- **B-5** Der Browser-Spec `dialogo.spec.ts` „Escape cancels … the focus returns to the opener“ fällt lokal in WebKit 26.6 (macOS) auch auf `main` @ `f6f38f5` (Vergleichslauf in einem temporären Worktree, dreimal reproduziert): der Fokus kehrt nach Escape nicht zum Öffner zurück. Kein Befund von ①; CI (Linux) ist der Maßstab. Bleibt er dort grün, ist es eine Eigenheit des lokalen WebKit; sonst ein Manko des `dialogo` für die Nachlese.
- **B-4** Phosphor liefert im Set keine 24er-Fassung; die Pfade stehen im 256er-Raster (Abweichung 2, erledigt). Für `ikono` (②) heißt das: die Größe kommt aus `size`-Token, nie aus der Datei.

### Offen (für den Maintainer)

- **O-1 Spec-Text zu E10/G3/Benchmark** – *erledigt 17.10.*: Die Spec-Datei (Stand 16:45) war byteidentisch mit der Kopie aus `9a3194f` und nannte Lucide; der Maintainer hat sie korrigiert (19:54: Phosphor in G3, E10, Benchmark; quadratische `viewBox`), die Kopie ist erneut unverändert übernommen. Das Briefing (Abschnitt Ikonaro) ist seit 17:54 ebenfalls korrigiert (Phosphor, Raster laut plan.md) – erledigt.
- **O-2 Icon-Namen** – *entschieden 17.10.*: `menu` aus der Startmenge genommen (die `navigado` hat keinen eingeklappten Zustand; kommt mit der Grenze zurück, wenn sie fällt), `danger` als Achteck bestätigt (eine andere Form als das Dreieck von `warning`, damit die Unterscheidung nicht nur an der Farbe hängt). Startmenge jetzt 15 Namen. Die übrigen Namen bleiben bis zum Merge von ① änderbar (E4 sinngemäß).
- **Biome ohne `ikonoj`** – *bestätigt 17.10.* (D-04).
- **O-3 `get_ero` und `columns-from`.** `uzoOf` in `gvidanto/eroj.ts` und das MCP-Ausgabeschema `get_ero.output.json` geben `layout.columns-from` noch nicht aus; ein Agent sieht die Schwelle also nicht. Kleine Folgeaufgabe (Schema + Test), nicht Teil von ①; Vorschlag: mit ② (`ikono`), wenn `get_ero` ohnehin die Icon-Namen aufnimmt.
- **O-4 Gewicht in Figma für Optionen.** Die Schrift je Eintrag wird in `drawEntries` (navigado, langetaro) geschrieben; `drawChoice` (Optionen des `elekto`) wendet noch keine Eintrags-Schrift an – heute bindet kein Ero dort ein Gewicht. Kommt mit dem ersten Bedarf.

## ② Grundbausteine

*(folgt nach dem Merge von ①: `ikono`, `apartigilo`, `saltligilo`; vorhandene Icons umstellen; Figma zeichnet Icons.)*

## ③ Typografie

*(folgt: `titolo`, `teksto`.)*

## ④ Overlays

*(folgt: `konsileto`, `sxvebilo`, `menuo`; Schatten in Figma gebunden.)*

## ⑤ Aufklappen

*(folgt: `faldilo`, `kompletigilo`.)*
