# Spec 014 – Eroj Runde 3 – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-17, unverändert kopiert; Textstand siehe ① Offen O-1) · **Briefing:** `briefing-p0-2026-10-17.md` (Maintainer-Ordner, nicht kopiert) · **Basis:** `main` @ `f6f38f5` (Nachlese 3 #68, #69) · **Regel 0** (12.10.) gilt: Weg des `butono` zuerst, sonst kleinste Änderung mit Eintrag hier; Tokens, Regulo-Semantik und Constitution unverändert; nie eine Grenze schwächen, um grün zu werden. **Aufgaben, Commits und rote Hashes:** [`tasks.md`](tasks.md).

Fünf PRs, gestapelt (E6): ① Grundlage von `main`, ② Grundbausteine von ①, ③ Typografie von ②, ④ Overlays von ③, ⑤ Aufklappen von ④.

## ① Grundlage

**Branch:** `261017-spec-014-eroj-runde-3-d4f536` (von `main` @ `f6f38f5`) · **Datum:** 2026-10-17.

### Zusammenfassung

1. **Gewicht** (D-01): `navigado.items.weight` by `current`, `langetaro.tabs.weight` by `active`, gebunden an `font.weight.*` oder `none`. *(Grün folgt.)*
2. **`dialogo.reason-help`** (D-02): Slot, Constraint, Uzo; `help-is-one-sentence` ausgeweitet; vier Jugxoj. *(Grün folgt.)*
3. **`atributlisto layout: auto`** (D-03): `UzoLayout.columns-from` (Container-Query), ResizeObserver im Web Component. *(Grün folgt.)*
4. **Ikonaro** (D-04, G3): `data/ikonaro.json` mit 16 Namen (Bedeutung de/en, Kialo, `mirror`), Entität `ikono` mit Präfix `iko_`, optionale Datendatei im Loader; `check:ikonaro`; Glyphen komuna aus **Phosphor Icons, Stil regular**, ekzemplo aus **Phosphor Icons, Stil fill** (Abweichung 1), mit Herkunftsnachweis je Datei und Abbildung Ikonaro-Name → Phosphor-Name im Aspekto-Paket.
5. **Tooltip-Kontrast** (D-05, G2): KontrastParo `text-inverse-on-background-inverse`. *(Grün folgt.)*
6. **Overlay-Messung** (D-06, G4): Popover-API und Anchor Positioning in drei Engines, Skript `packages/eroj/scripts/measure-overlay.mjs`. *(Messung folgt.)*

Kein neues Ero in ①, kein Token (E1), keine Regulo-Semantik geändert.

### Entwurfsentscheidungen

#### D-01 Gewicht als Part-Eigenschaft `weight` (navigado, langetaro)

`SkemoPartProperty` erhält `weight` (Token `font.weight.*` oder `none`); `PART_PROPERTY_TYPES.weight = fontWeight`; der Web Component schreibt `font-weight`. `navigado/skemo.json` bindet `items.weight` bei `current`, `langetaro/skemo.json` `tabs.weight` bei `active`. *(Ausarbeitung im Grün.)*

#### D-02 `dialogo.reason-help`

*(Ausarbeitung im Grün.)*

#### D-03 `atributlisto layout: auto` mit `columns-from`

`UzoLayout.columns-from` nennt ein `size.container.*`-Token des Kerns; darunter stapelt das Ero, darüber steht der Name neben dem Wert. Layout-Verhalten gehört in die Uzo; die Skemo bindet beide Erscheinungen, die Projektion misst den Container. *(Ausarbeitung im Grün.)*

#### D-04 Ikonaro: Namen im Kern, Bilder in der Aspekto (G3, E9, E10)

**Daten.** `data/ikonaro.json` (`IkonaroFile`: `{ "ikonaro": [Ikono…] }`), je `Ikono`: `id` (`iko_` + ULID, Entitätstyp `ikono` im Lock), `name` (kebab), `meaning.de`/`meaning.en`, `kialo`, optional `mirror: true` (die Richtung trägt Bedeutung, die Glyphe wird in Rechts-nach-links-Schrift gespiegelt; Internacia). Die Datei ist im Loader **optional** (`OPTIONAL_DATA_FILE_SCHEMA_DEFS`): fehlt sie, ist das Ikonaro leer und kein Befund – jede Fixture ohne Icons bleibt gültig. Sie wird, wenn vorhanden, gegen `IkonaroFile` geprüft, ihre IDs zählt `checkIds`, der Export `modelo.json` trägt `ikonaro` nur, wenn es Einträge gibt (ein Export ohne Icons behält seine Bytes).

**Startmenge (16 Namen, Grenze 25).** Abgeleitet aus dem, was die 17 Eroj heute zeichnen oder als Zeichen nachbilden, dem Bedarf der 9 neuen Eroj und den drei Namen der Spec (`more`, `search`, `external`). Nicht aufgenommen: `indeterminate` (der `markobutono` hat keinen Mischzustand), `chevron-left`/`chevron-up` (kein Ero braucht sie; `chevron-right` spiegelt in RTL), `loading` (kein Ero zeigt heute einen Spinner). Phosphor-Name = Name der Datei im Set (komuna liest `assets/regular/<name>.svg`, ekzemplo `assets/fill/<name>-fill.svg`).

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
| `menu` | Hauptmenü öffnen | `navigado` `collapsed-mobile` (Hamburger; das Wort bleibt bei der `navigado`, E8) | `list` | – |
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

**Raster: `viewBox="0 0 256 256"`, nicht 24.** Phosphor zeichnet im 256er-Raster. Die Glyphen behalten es: Die Pfade bleiben bitgleich mit der Quelle (Herkunft nachprüfbar, kein Umrechnen mit Rundungsfehlern), und ein quadratischer `viewBox` skaliert ohne Verzerrung auf jede Größe – die Größe setzt das Ero (`ikono` in ② über `size`-Token), nicht die Datei. `check:ikonaro` prüft deshalb nur **quadratisch** (`0 0 n n`; `ikonaro-glyph-viewbox` bei fehlendem oder nicht quadratischem viewBox), keinen bestimmten Rasterwert. Die drei Fixtures des Checks zeichnen weiter im 24er-Raster und bleiben gültig. Spec G3 und Briefing sagen „24er-Raster“: Abweichung 2.

**`check:ikonaro`** (Regeln): `ikonaro-glyph-missing` (Aspekto ohne einen Namen; Fehler am Eintrag in `data/ikonaro.json`), `ikonaro-glyph-fixed-color` (feste Farbe an Wurzel oder Form, als Attribut oder `style`; `none` und `currentColor` sind keine Farbe), `ikonaro-glyph-provenance-missing` (ohne `source`, `version`, `license`), `ikonaro-glyph-viewbox` (fehlend oder nicht quadratisch), `ikonaro-glyph-unknown` (Warnung: Glyphe ohne Namen im Ikonaro; nichts wird gelöscht). Misst jede bekannte Aspekto (komuna, ekzemplo als `KNOWN_ASPEKTO_FIXTURES` wie `check:alirebleco`). *(Implementierung im Grün.)*

#### D-05 Tooltip-Kontrast (G2)

`color.text.inverse` auf `color.background.inverse`, Kategorie `text-normal`, als KontrastParo `text-inverse-on-background-inverse`; kein neues Token (E1). Werte unter 4.5:1 wären ein Befund. *(Grün folgt.)*

#### D-06 Overlay-Messung (G4, E11)

Skript `packages/eroj/scripts/measure-overlay.mjs` misst `showPopover`/`popover`-Attribut, `anchor-name`/`position-anchor`/`position-area` in Chromium, Firefox und WebKit (Playwright). Ergebnis unten; daraus folgt für ④ Anchor oder Fallback ohne Rückfrage. *(Messung folgt.)*

### Overlay-Messung

*(Tabelle `| Merkmal | chromium x | firefox x | webkit x |` folgt im Grün: `showPopover`, `popover="auto"`, Light Dismiss, `anchor-name`, `position-anchor`, `position-area`, `position-try-fallbacks`.)*

### Arkitekturo-Abdeckung

| Erweiterung | Stand |
|---|---|
| Gewicht (`weight`) | offen → *(trägt im Grün)* |
| `reason-help` | offen → *(trägt im Grün)* |
| `layout: auto` (`columns-from`) | offen → *(trägt im Grün)* |

### Abweichungen von der Spec

1. **Phosphor Icons (MIT) statt Lucide (ISC) als Quelle der komuna-Glyphen** (D-04; E10, G3, Benchmark). Entscheidung des Maintainers vom 17.10.2026, als Korrektur vor dem Grün übermittelt; P0 hat nicht von sich aus gewechselt (Briefing: „Du wechselst nicht von dir aus“). Die Spec nennt Lucide als *Vorschlag*; ihre Regel – Open-Source-Set mit permissiver Lizenz (Art. V Abs. Schriften und Icon-Sets), nur die benötigten Namen, Herkunftsnachweis je Datei (Art. VII) – erfüllt Phosphor ebenso. komuna zeichnet im Stil **regular**, ekzemplo im Stil **fill** desselben Sets: ein absichtlich anderer Stil als Fixture (G3), die Herkunft ist beidesmal dieselbe und nachgewiesen. **Ersetzt, nicht ergänzt:** Im Repo gibt es keine Lucide-Glyphe und keinen Lucide-Nachweis; die roten Tests von `27e472d` (Lucide, `viewBox 0 0 24 24`) sind korrigiert. Die Spec-Kopie bleibt unverändert (Briefing: „unverändert kopieren“), siehe O-1.
2. **Raster 256 statt 24** (D-04; G3, Briefing „SVG mit viewBox 0 0 24 24“). Folge von 1: Phosphor zeichnet im 256er-Raster, die Pfade bleiben unverändert, `check:ikonaro` prüft nur „quadratisch“. Die Größe setzt das Ero, nicht die Datei.

### Befunde / Mankoj

*(folgt im Grün)*

### Offen (für den Maintainer)

- **O-1 Spec-Text zu E10/G3/Benchmark.** Die Datei `…/.fundamento/spec014/spec.md` (Stand 16:45) ist byteidentisch mit der Kopie aus `9a3194f` und nennt weiterhin Lucide (ISC) als Vorschlag; auch das Briefing (Abschnitt Ikonaro) nennt Lucide und `viewBox 0 0 24 24`. Die Entscheidung Phosphor (MIT) steht hier als Abweichung 1 und 2. Soll die Spec den Wechsel selbst tragen, bitte den Text ändern; P0 kopiert dann erneut unverändert.
- **O-2 Icon-Namen.** 16 Namen (Tabelle in D-04) als Vorschlag; `menu` (Hamburger der `navigado`) und `danger` (Achteck) sind die beiden, über die man streiten kann. Änderbar bis zum Merge von ① (E4 gilt sinngemäß für das Ikonaro).

## ② Grundbausteine

*(folgt nach dem Merge von ①: `ikono`, `apartigilo`, `saltligilo`; vorhandene Icons umstellen; Figma zeichnet Icons.)*

## ③ Typografie

*(folgt: `titolo`, `teksto`.)*

## ④ Overlays

*(folgt: `konsileto`, `sxvebilo`, `menuo`; Schatten in Figma gebunden.)*

## ⑤ Aufklappen

*(folgt: `faldilo`, `kompletigilo`.)*
