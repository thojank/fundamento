# Spec 014 – Eroj Runde 3 – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-17, 19:54, unverändert kopiert; die Korrektur des Maintainers nennt Phosphor in G3, E10 und Benchmark und „quadratische viewBox“) · **Briefing:** `briefing-p0-2026-10-17.md` (Maintainer-Ordner, nicht kopiert) · **Basis:** `main` @ `f6f38f5` (Nachlese 3 #68, #69) · **Regel 0** (12.10.) gilt: Weg des `butono` zuerst, sonst kleinste Änderung mit Eintrag hier; Tokens, Regulo-Semantik und Constitution unverändert; nie eine Grenze schwächen, um grün zu werden. **Aufgaben, Commits und rote Hashes:** [`tasks.md`](tasks.md).

Fünf PRs, gestapelt (E6): ① Grundlage von `main` (gemergt als #70), ② Grundbausteine von `main` nach dem Merge von ①, ③ Typografie von ②, ④ Overlays von ③, ⑤ Aufklappen von ④.

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
- **B-5** Der Browser-Spec `dialogo.spec.ts` „Escape cancels … the focus returns to the opener“ fällt lokal in WebKit 26.6 (macOS) auch auf `main` @ `f6f38f5` (Vergleichslauf in einem temporären Worktree, dreimal reproduziert): der Fokus kehrt nach Escape nicht zum Öffner zurück. Kein Befund von ①; CI (Linux) ist der Maßstab – dort sind beide Eroj-Shards grün (Lauf 39065845169), also eine Eigenheit des lokalen WebKit, kein Manko.
- **B-6** `check:vitrino` zählte die atributlisto-Zeilen fest (2); die dritte Zeile (`auto`) machte den ersten CI-Lauf rot (Rendered checks 5m37s). Zahl auf 3 gesetzt, kein Manko.
- **B-4** Phosphor liefert im Set keine 24er-Fassung; die Pfade stehen im 256er-Raster (Abweichung 2, erledigt). Für `ikono` (②) heißt das: die Größe kommt aus `size`-Token, nie aus der Datei.

### Abnahme ① (Maintainer, 2026-10-17; Vitrino f6f38f5 → acb6eae)

- **F-1 „auto“ als sichtbarer Text über der Liste.** Ursache: Der rote Test aus `27e472d` verlangte wörtlich `<fm-atributlisto layout="auto">auto<dl>`, und der Vitrino-Generator schrieb das Prop-Wort in den Standard-Slot der Liste (`named`-Sonderfall für `layout=auto`). Eine Light-DOM-Liste trägt ihre `dl` und kein eigenes Wort; das Prop-Wort ist die Zeilenüberschrift. Roter Test zuerst (`fb0fa04`: Daten-Test „kein Text im Host“, Browser-Prüfung „kein eigener Textknoten“), dann der Sonderfall entfernt.
- **F-2 keine Hilfe unter „Begründung“.** Ursache: `slotTexts` der Vitrino ließ einen belegten Slot nur zu, wenn die Constraint auf die boolesche Spalte der Zelle zeigt (Fehler unter `invalid`); die Constraint von `reason-help` zeigt auf den Enum-Wert der Zeile (`reason` optional|required) und fiel durch – dazu fehlte das Wort. Jetzt gilt die Constraint auch für den Zeilenwert, und `VITRINO_SLOT_TEXTS["reason-help"]` ist „Nenne den Grund in einem Satz.“ – in jeder Zelle mit Begründungsfeld (4), in keiner ohne. Browser-Prüfung: sichtbar unter dem Textfeld, `aria-describedby` des Textfelds trägt den Satz, axe ohne Befund. Dasselbe Wort steht in `DIALOG_TEXTS` des Figma-Sets (F-5: ein Wortschatz für beide Bilder); das Plugin zeichnet den Hilfesatz im Dialog noch nicht (O-5).

### Offen (für den Maintainer)

- **O-1 Spec-Text zu E10/G3/Benchmark** – *erledigt 17.10.*: Die Spec-Datei (Stand 16:45) war byteidentisch mit der Kopie aus `9a3194f` und nannte Lucide; der Maintainer hat sie korrigiert (19:54: Phosphor in G3, E10, Benchmark; quadratische `viewBox`), die Kopie ist erneut unverändert übernommen. Das Briefing (Abschnitt Ikonaro) ist seit 17:54 ebenfalls korrigiert (Phosphor, Raster laut plan.md) – erledigt.
- **O-2 Icon-Namen** – *entschieden 17.10.*: `menu` aus der Startmenge genommen (die `navigado` hat keinen eingeklappten Zustand; kommt mit der Grenze zurück, wenn sie fällt), `danger` als Achteck bestätigt (eine andere Form als das Dreieck von `warning`, damit die Unterscheidung nicht nur an der Farbe hängt). Startmenge jetzt 15 Namen. Die übrigen Namen bleiben bis zum Merge von ① änderbar (E4 sinngemäß).
- **Biome ohne `ikonoj`** – *bestätigt 17.10.* (D-04).
- **O-3 `get_ero` und `columns-from`** – *erledigt in ② (D-07)*. `uzoOf` in `gvidanto/eroj.ts` und das MCP-Ausgabeschema `get_ero.output.json` geben `layout.columns-from` noch nicht aus; ein Agent sieht die Schwelle also nicht. Kleine Folgeaufgabe (Schema + Test), nicht Teil von ①; Vorschlag: mit ② (`ikono`), wenn `get_ero` ohnehin die Icon-Namen aufnimmt.
- **O-5 Figma-Dialog ohne Hilfesatz** – *erledigt in ② (D-07)*. `DIALOG_TEXTS` trägt `reason-help`, das Plugin zeichnet unter dem Begründungsfeld aber noch keinen Hilfetext-Knoten (es zeichnet feste Knoten: `reason-label`, Feld, Aktionen). Kandidat für ② mit den Icons, wenn der Dialog ohnehin neu gezeichnet wird.
- **O-4 Gewicht in Figma für Optionen.** Die Schrift je Eintrag wird in `drawEntries` (navigado, langetaro) geschrieben; `drawChoice` (Optionen des `elekto`) wendet noch keine Eintrags-Schrift an – heute bindet kein Ero dort ein Gewicht. Kommt mit dem ersten Bedarf.

## ② Grundbausteine

**Branch:** `261017-spec-014-grundbausteine-e3bf97` (von `main` @ `498b238`, nach dem Merge von ① #70) · **Datum:** 2026-10-17/18.

### Zusammenfassung

1. **`ikono`** (D-01, D-02): das Icon – `name` ist ein Enum der 15 Ikonaro-Namen (ein Pflicht-Prop, eine Liste mit `data/ikonaro.json`), `size` bindet `size.icon.*` an den Teil `box`, `intent` bindet die Farbe des Teils `glyph` (`neutral` → `inherit`, Status → `color.status.<intent>.text`), `label` macht aus dem dekorativen Zeichen ein Bild mit Namen (`role="img"`). Ein Status-Icon trägt Bedeutung und darum einen Namen: Constraint `intent ≠ neutral ⇒ prop:label filled`. Neue Regulo **`icon-meaning-named`** (fest, Prüfart `not-words` auf `prop:label`: „Icon“, „Symbol“, „Bild“ sind keine Namen), vier Jugxoj de/en. Im Web ist die Glyphe eine Maske der Aspekto-Datei (`--fm-ikono-<name>`, vom CSS-Celo je Aspekto projiziert) in `currentcolor`; `chevron-right` spiegelt in RTL.
2. **`apartigilo`** (D-03): der Trenner – `orientation` schlüsselt die Höhe des Teils `box` (`none` waagerecht, `size.control.medium` senkrecht) und ist damit Achse der Figma-Varianten; die Linie ist der Rand einer Kante (`color.border.subtle`, `border.width.default`); `decorative` macht ihn zu `role="none"`. Ein Separator hat keinen Namen: `a11y.name` darf leer sein (Schema).
3. **`saltligilo`** (D-04): der Sprunglink – `to` (Id des Ziels; `target` ist ein Web-Begriff, Abweichung 1), verborgen bis `:focus-visible`, dann fest am Anfang des Viewports über allem (neue Teil-Eigenschaft **`layer`** → `elevation.layer.overlay`, Schema), mit Fläche, Rand, Schatten und Fokusring; Enter setzt den Fokus auf das Ziel (ein `tabindex="-1"`, wo das Ziel keins hat); der Text eines leeren Slots ist „Zum Inhalt springen“ aus `a11y.texts` (`label-empty`); `link-label-names-destination` ausgeweitet (E5).
4. **Icons in vorhandenen Eroj** (D-05): der Chevron des `elektilo`, der Sortierpfeil der `tabelo` (`sort-ascending`/`sort-descending` nach Richtung, nichts dreht mehr), das Status-Icon des `avizo` (neuer Teil `icon`, Farbe `color.status.<intent>.text`, `size.icon.medium`) und das Schließen-Kreuz seines `butono` sind `ikono`; die Slots des `butono` nehmen `ikono` an; die Vitrino zeigt den `butono` mit `icon-start` (`check`), das Ikonaro als Raster je Größe und die Status-Icons benannt.
5. **Figma zeichnet Icons** (D-06): der Plan trägt die Glyphen jeder Aspekto (`ikonoj`) und je Aspekto eine BOOLEAN-Variable `ikonoj/<aspekto>` in der Sammlung `aspekto`; jedes Icon ist je Aspekto ein aus der Glyphe importierter Rahmen, dessen Sichtbarkeit an diese Variable gebunden ist – der Markenmodus wechselt das Bild. Set `ikono` als Bauform `icon` (name × size × intent, Raster Namen × Größe·Intent), Bauform `separator`, `saltligilo` als Kontrolle; `icon` entfällt in `FIGMA_NOT_DRAWN`, der Jugxo `jug_01M31TV1V4S3RNBPWSRB2CGEDK` trägt den Nachtrag.
6. **O-3 und O-5 aus ①** (D-07): `get_ero` gibt `layout.columns-from` aus (MCP-Ausgabeschema); der Figma-Dialog zeichnet den Hilfesatz unter dem Begründungsfeld in den Rollen der `tekstareo`-Hilfe (`composed["reason-help"]`).

Kein Token, keine Regulo-Semantik geändert; zwei Schema-Erweiterungen (`layer`, leeres `a11y.name`), eine neue Regulo (G8), 20 Eroj.

### Entwurfsentscheidungen

#### D-01 `ikono`: Name als Enum des Ikonaro, Status-Icon mit Namen (G3, G5, G8)

`name` ist ein Enum mit den Namen aus `data/ikonaro.json` in deren Reihenfolge (ein Daten-Test hält beide Listen gleich): so kennt der React-Typ die Namen, der `brief` nennt sie als Achse, und Figma hat je Name eine Variante – ein String-Prop könnte Figma nicht in ein Bild übersetzen. `size` schlüsselt `box.size` (`size.icon.*`), `intent` schlüsselt `glyph.color`: `neutral` → `inherit` (das Icon erbt die Textfarbe wie ein Wort), sonst `color.status.<intent>.text`. Ein Status-Icon sagt etwas, also trägt es einen Namen: vier Constraints `when intent=<status>` ⇒ `prop:label` `filled` (Prüfart über Prop, Spec ②); das Element fällt ohne Namen mit Warnung auf `neutral` zurück, `check_usage` meldet `ero-prop-constraint`. Die Regulo `icon-meaning-named` (fest; `appliesTo` `ikono`, `butono` – die Schaltfläche nur mit Icon prüft `label-required`) urteilt über den Namen selbst: `not-words` (icon, image, symbol, glyph, picture / icon, symbol, bild, grafik, zeichen) auf `prop:label`; Jugxoj de/en approved („Fehler“/„Error“) und rejected („Symbol“/„Icon“). Goal `show-icon` (Icon, Symbol, Piktogramm, Glyphe; keine neue `goal-keyword-shared`-Warnung, `check:regularo` 0 Warnungen). Uzo: `status-only-icon` → `insigno`, `logo` → null (ask-human), Grenzen `custom-svg` (ask-human), `animated-icon` (not-supported); komponiert mit `butono`, `avizo`, `insigno`, `tabelo`, `elektilo` (`menuo`, `faldilo`, `kompletigilo` folgen in ④/⑤).

#### D-02 Web: die Glyphe als Maske der Aspekto-Datei (G3, E9)

Der CSS-Celo schreibt je Aspekto einen Block `/* ikonoj <aspekto> */` mit `--fm-ikono-<name>: url("data:image/svg+xml,…")` (Metadaten und Kommentare entfernt, der Rest unverändert), am Root-Selektor der Aspekto wie jeder Wert (`fundamento.css` schaltet mit `data-fm-aspekto`, die Datei je Aspekto bei `:root`). Das Element schreibt `--fm-ikono: var(--fm-ikono-<name>)` auf die Glyphe; die Glyphe ist `mask-image: var(--fm-ikono)` in `background-color: currentcolor` – das Icon erbt wie ein Wort, ein Status-Icon setzt `color` aus der Bindung. Die Glyphe **ist** die Kontrolle (`part="glyph"`, keine zweite Kontrolle: Befund B-1). Spiegelung in RTL über die Klasse `fm-mirror` (`:host(:dir(rtl))`), gesteuert vom `IKONARO`-Wissen des Elements (`mirror` aus `data/ikonaro.json`; Befund B-3). Dekorativ: `aria-hidden="true"`; benannt: `role="img"` + `aria-label`. Vortaro-Lint: `currentcolor` ist ein Schlüsselwort (kein Wert), `mask-image/size/repeat/position` sind Struktur; kein Literal. Ein komponierendes Ero setzt `size` am inneren `fm-ikono` auf seine eigene Größe (`butono` an geslotteten Icons, `elektilo` am Chevron), damit Host und Glyphe eine Größe haben.

#### D-03 `apartigilo`: Richtung als Achse, kein Name (G5; Regel 0.2)

`box.height by orientation` (`none` | `size.control.medium`) macht die Richtung zur Achse der Figma-Varianten (Spec: „Figma: `orientation`“) und gibt der senkrechten Linie eine Mindesthöhe; die Linie ist der Rand einer Kante (`line.color` → `border-color`, `line.width` → `border-width`, die Kante ist Struktur: `border-block-start-style` waagerecht, `border-inline-start-style` senkrecht). `a11y.name` ist leer: ein Separator hat keinen Namen; das Schema verlangte `minItems: 1` – gelockert (kleinste Änderung, Regel 0.2). `decorative` → `role="none"` ohne `aria-orientation`. Grenze `labelled-line` (ask-human: ein Wort in der Linie ist eine Überschrift oder eine Wahl); `spacing-only` → null (ask-human, Kialo: der Container besitzt den Abstand). Ontologio `Apartigilo`.

#### D-04 `saltligilo`: `to`, `layer`, verborgen bis Fokus (G5, E5; Regel 0.2)

`target` ist ein Web-Begriff (`skemo-web-term`, Art. VIII), das Prop heißt `to` wie beim `ligilo` (Abweichung 1); der Web-Celo schreibt `href="#<to>"`. Neue Teil-Eigenschaft **`layer`** (Typ `number`, bindet `elevation.layer.*`; Web: `z-index`; Figma: gebunden, aber ohne Tiefe) – der Weg des `butono`: eine Teil-Eigenschaft neben `shadow`, `stroke`, `weight`; ④ nutzt sie für die Overlays. Ein Link mit `surface.layer` ist Celo-Wissen „schwebt“: `position: fixed` am Anfang des Viewports (logisch, RTL spiegelt), `clip-path: inset(50%)` bis `:focus-visible`. Der Text eines leeren Slots kommt aus `a11y.texts["label-empty"]` („Zum Inhalt springen“/„Skip to content“, Sprache des Dokuments) als Fallback-Inhalt des Slots; die Uzo verlangt den Slot trotzdem (`uzo-slot-required-missing`: ein Name mit nur einer Quelle). Enter: `click` → `tabindex="-1"` am Ziel, wo keins steht, dann `focus()` (G5). `link-label-names-destination` ausgeweitet statt vervielfacht (E5, `not-words` wie beim `ligilo`). Container `shell`; Grenze `always-visible` (not-supported); `in-page-link` → `ligilo`. Figma zeichnet beide Zustände (Abweichung 2); der Schatten steht im Plan und wird mit ④ gebunden (O-8).

#### D-05 Icons in vorhandenen Eroj (G3, G6)

`elektilo`: der Indikator hält `<fm-ikono name="chevron-down">` in der Feldgröße; `tabelo`: der Sortierknopf hält `<fm-ikono name="sort-ascending" size="small">`, bei absteigender Sortierung `sort-descending` (die `rotate`-Regel entfällt); `avizo`: neuer Teil `icon` (`color by intent` → `color.status.<intent>.text`, `size` `size.icon.medium`) als `<span part="icon" aria-hidden>` vor den Texten mit `<fm-ikono name="<intent>">` (die Ikonaro-Namen sind die Intents), das Schließen-Kreuz ist `<fm-ikono slot="icon-start" name="close">`; `butono`/`ligilo`: geslottete `fm-ikono` bekommen `size` des Hosts. Nicht umgestellt (O-7): Haken des `markobutono`, Punkt des `elekto`, Bogen des `plenstato`, Pflichtstern, die Außen-Markierung des `ligilo` – Zeichen der Projektion ohne Ikonaro-Namen bzw. außerhalb der vier Eroj aus G9 ②.

#### D-06 Figma: Glyphen je Aspekto, Sichtbarkeit als BOOLEAN-Variable (G3, G4, E9)

Der Plan trägt `ikonoj` (`names`, `mirror`, `glyphs[aspekto][name]` = SVG-Text aus dem Aspekto-Paket; der Loader liest `ikonoj/*.svg` als `LoadedAspektoPackage.ikonoj`) und je Aspekto eine Variable `ikonoj/<aspekto>` vom Typ BOOLEAN in der Sammlung `aspekto` (wahr nur im eigenen Modus). Das Plugin zeichnet ein Icon als Rahmen mit je Aspekto einem importierten Glyphen-Rahmen (`createNodeFromSvg`, `glyph-<aspekto>`), dessen `visible` an die Variable gebunden ist, und dem Vektor darin, dessen Füllung an die Farbe gebunden ist (`glyph-*`/`mark-*`-Knoten, `drawGlyphs`). Set `ikono`: Bauform `icon`, 225 Varianten (name × size × intent); der Name ist keine Achse der Skemo-Teile (`extraAxes`), das Paritäts-Inventar lässt ihn aus dem Variantenschlüssel – jede Namensvariante nennt dieselben Werte; Raster: Zeile je Größe·Intent, Spalte je Name. `inherit` an einer Farbe bindet `color.text.default` (`INHERIT_COLOR`, wie `INHERIT_TYPOGRAPHY`), nennt aber keine Farbe (die Skemo nennt keine; Befund B-4). `butono`-Varianten zeichnen `icon-start` (`check`) vor dem Label mit `icon.color`/`icon.size`; `elektilo`, `tabelo`, `avizo` ihre Icons je Variante (`variant.icons`). Bauform `separator`: die Linie als Rahmen mit gebundenem Strich einer Kante (`line-h`/`line-v`), waagerecht mit der Länge `size.container.small` (geschrieben, nicht gebunden). Kein `sign` mehr für `combobox` und `table`. Die Report-Headline überschritt mit 20 Sets 4 000 Zeichen: `placement` je Set in den Teil `state` verschoben (Befund B-2). `FIGMA_NOT_DRAWN.icon` entfällt; `check:parity` 20 Eroj, 0 Differenzen.

#### D-07 O-3 und O-5 aus ① geschlossen

`uzoOf` gibt `layout["columns-from"]` aus, das MCP-Ausgabeschema `get_ero.output.json` kennt den Schlüssel (O-3). Der Dialog zeichnet `reason-help` nach dem Begründungsfeld mit dem Wort der Vitrino; `composedOf` liest dafür `help.color`/`help.typography` der `tekstareo` bei `size=medium, state=rest` (`DIALOG_REASON_HELP`), gebunden wie die Hilfe eines Feldes (O-5).

#### D-08 Ontologio: `Ikono` ist das Ero (Regel 0.2)

Die Ontologio hatte `#Ikono` als Entitätsbegriff (Schema `modelo`, Notation `ikono`). Das Ero ist die erste Bedeutung des Worts: `#Ikono` steht jetzt im Schema `eroj` (unter `#Ero`, ohne Notation, wie jedes Ero), der Entitätstyp `ikono` (`iko_`) ist am `#Ikonaro` notiert, dessen Einträge er sind (die Prüfung verlangt genau einen Begriff je Entitätstyp). `Apartigilo` und `Saltligilo` neu, mit de/en-Synonymen; `describe_term("Ikono")` findet das Ero.

#### D-09 Vitrino

Abschnitt `ikono`: eine Zeile je Größe mit allen 15 Namen (dekorativ), eine Zeile je Status-Intent mit dem benannten Status-Icon (Name aus `meaning.de`, O-6); die Bilder wechseln mit der Aspekto. `apartigilo`: beide Richtungen (senkrecht zwischen zwei Wörtern, Klasse `fm-row`); `saltligilo`: eine Zeile, `to` zeigt auf die eigene Sektion (Id ohne `#`). `butono`: `<fm-ikono slot="icon-start" name="check">` in jeder Zelle.

#### D-10 Make Kit

Drei Sätze in den Guidelines, generiert aus den Rollen `img`, `separator` und dem schwebenden Link: „Every icon is an `<Ikono>` with a name from the Ikonaro …; never paste an SVG.“, „Every line that separates groups of content is an `<Apartigilo>` …“, „The first focusable element of a page is a `<Saltligilo>` …“. Je Ero eine Komponentenseite.

### Arkitekturo-Abdeckung

| Ero | Stand |
|---|---|
| `ikono` | trägt (Skemo, Uzo, Regulo, Jugxoj, Web Component als Maske, CSS-Glyphen je Aspekto, React, Figma-Set mit Markenwechsel, Make-Kit, Vitrino-Raster, MCP; Icons in butono, tabelo, avizo, elektilo) |
| `apartigilo` | trägt (Skemo, Uzo, Web, React, Figma-Bauform separator, Make-Kit, Vitrino, MCP) |
| `saltligilo` | trägt (Skemo mit `layer`, Uzo, Web mit Fokusziel, React, Figma-Kontrolle, Make-Kit, Vitrino, MCP); Schatten in Figma mit ④ |

### Abweichungen von der Spec

1. **`to` statt `target`** (D-04): `target` ist ein Web-Begriff (`skemo-web-term`, Art. VIII, Spec 008 D-13); die Skemo nennt das Ziel wie der `ligilo`, der Web-Celo buchstabiert es.
2. **Figma zeichnet den `saltligilo` in beiden Zuständen** (Spec: „nur der sichtbare Fokuszustand“): die Paritätsprüfung vergleicht jede Variante der Skemo; der Ruhezustand ist die Variante ohne Ring (auf der Seite unsichtbar). Eine Variante wegzulassen hieße, eine Grenze zu schwächen (Regel 0.4).
3. **Figma-Set `ikono` name × size × intent** (Spec: „name × size; Farbe an `color.text.default` gebunden“): `intent` schlüsselt die Glyphenfarbe in der Skemo und ist damit Achse; die neutrale Variante bindet `color.text.default` wie die Spec will, die Status-Varianten ihre Status-Textfarbe. Raster wie die Spec: Namen × Größe.
4. **`avizo.icon` bindet die Status-Textfarbe** (`color.status.<intent>.text`) statt der Akzentfarbe: das Icon steht neben den Wörtern, nicht am Rand.

### Befunde / Mankoj

- **B-1** Playwright-Locators durchdringen Shadow-Roots: ein komponiertes `fm-ikono` mit eigener `[part="control"]` brach drei `elektilo`-Specs („resolved to 2 elements“). Die Glyphe ist darum die Kontrolle des Icons (`part="glyph"`, D-02); `stylesheetInventory` kennt sie. Kein Manko.
- **B-2** Die Report-Headline des Plugins überschritt mit 20 Sets 4 000 Zeichen (4 325): `placement` je Set in den Teil `state` verschoben, der Report selbst unverändert (D-06). Kein Manko.
- **B-3** `stylesheetInventory` liest `data-*`-Attribute als Props: ein `data-mirror` an der Glyphe wurde zur Prop `mirror` (`parity-prop-mismatch`). Spiegelung als Klasse `fm-mirror`. Kein Manko.
- **B-4** Eine Farbe `inherit` schrieb keine Regel, das Web-Inventar kannte `intent=neutral` nicht; `inherit` schreibt jetzt `color: inherit` (ein CSS-Schlüsselwort). Figma nennt für `inherit` keine Farbe (die Skemo nennt keine). Kein Manko.
- **B-5** Figma kann eine Vektorform nicht per Modus wechseln; die BOOLEAN-Variable an `visible` je Aspekto ist der Weg (D-06) – eine Annahme des Doubles, bis f10b-5 misst, dass `setBoundVariable("visible", …)` an einem Rahmen hält und `createNodeFromSvg` Phosphors 256er-Pfade skaliert.
- **B-6** Der Sprunglink-Spec „Enter setzt den Fokus“ fiel im Chromium-Lauf aller neuen Specs einmal (Tab unter Last nicht angekommen), allein grün; der Spec fokussiert den Link jetzt direkt und prüft Enter (der Tab-Weg steht im ersten Spec).
- **B-7** CI-Lauf 39076801771 fiel in Shard 2: derselbe Spec nutzte `browserName` nach dem Umbau ohne das Fixture (lokal nur Chromium gelaufen, dort ohne Tab-Taste kein Aufruf); Fix `48f3c6e`, Lauf 39077749355 grün in 7 min 17 s.
- **B-8 (Abnahme F-4, 2026-10-18)** Der Plugin-Lauf in der echten Datei brach in `drawSeparator` ab: „no setter for property“ in `write` ← `flush` – der Trenner schrieb `width` auf seinen Rahmen, das die Plugin-API schreibgeschützt führt (eine Größe setzt `resize`, oder sie wird gebunden). Das Double hatte den Schreibzugriff zugelassen. Jetzt verweigert es jedes schreibgeschützte Feld (`width`, `height`, absolute Boxen, `hasMissingFont`) auf jedem Knotentyp mit der Meldung des Werkzeugs; rot waren damit 203 Plugin-Tests, alle in `set_width` aus `drawSeparator` – keine andere Bauform aus ②–⑤ (tooltip, popover, menu, disclosure, Listbox, Icons aus `createNodeFromSvg`) schreibt ein schreibgeschütztes Feld; ihre Größen sind gebunden (`setBoundVariable` auf `width`/`height`) oder per `fit`/`resize` gesetzt. Fix: die Länge der waagerechten Linie per `resize` (nur wo sie noch nicht gilt, F21), die eigene Größenart danach erneut geschrieben (③ F-4). Drei Tests, die eine Größe von Hand modellierten, setzen sie jetzt ebenfalls per `resize`. Nicht gemessen bleibt, ob Figma Layout-Felder (`itemSpacing` u. a.) auf einem Rahmen ohne Auto Layout annimmt – das Double lässt sie zu; der Maintainer-Lauf entscheidet.
- **B-9 (Abnahme F-5, 2026-10-18)** Nach dem Trenner brach der Lauf in `set_layoutSizingHorizontal` ab: „node must be an auto-layout frame or a child of an auto-layout frame“. Ursache ist die Schreibreihenfolge: die Zeichnungen leeren (`flush`) ein Kind vor seinem Elternrahmen, so stand die Größenart des Kindes (`layoutSizing*`, auch `layoutAlign`, `layoutGrow`, `layoutPositioning`) vor dem Auto Layout des Elternrahmens; erster Treffer im strengen Double der Rahmen `icon` im `control` des `butono`, in der echten Datei die neue Variante der `atributlisto`. Das Double verweigert diese Felder jetzt wie Figma, wenn weder der Knoten noch sein Elternrahmen Auto Layout hat. Fix in `flush`: der noch ausstehende `layoutMode` des Elternrahmens wird zuerst geschrieben, auf dem Knoten `layoutMode`/`layoutWrap` vor der Größenart; wo danach weder Knoten noch Elternrahmen Auto Layout haben (die Glyphenrahmen im schlichten Rahmen eines Icons, der Knopf im Schalter), werden diese Felder nicht geschrieben – ihre Größe ist gebunden, nicht gelegt. Das Double zählt sie dort nicht als liegengebliebene Werkzeugvorgabe. Neu dazu zwei Läufe des ganzen Plans gegen das strenge Double: frisch, und in die Datei vor ② (17 Sets, `atributlisto` ohne `auto`, dann „auch in vorgefundenem Set anlegen“: die neuen Sets und die `auto`-Varianten werden angelegt, ein dritter Lauf findet alles und legt nichts an) – ohne eine Ablehnung.

### Offen (für den Maintainer)

- **O-6 Vorgabewörter.** Vitrino: Status-Icons mit `meaning.de` als Namen („Gefahr, Fehler“ …); Figma: kein Label-Wort für `ikono` und `apartigilo` (keine Beschriftung), `saltligilo` „Ziel“ wie der `ligilo`. Zur Bestätigung.
- **O-7 Restliche Zeichen der Projektion.** Haken (`markobutono`), Punkt (`elekto`), Bogen (`plenstato`), Pflichtstern und die Außen-Markierung des `ligilo` bleiben gezeichnete Zeichen; Kandidaten fürs Ikonaro: `external` am `ligilo` (`icon-end`), `check` am `markobutono`. Nicht Teil von G9 ②.
- **O-8 Schatten des `saltligilo` in Figma.** Der Plan trägt ihn (`variant.shadow`), die Kontrolle bindet ihn erst mit ④ (`setBoundVariableForEffect`, wie `dialogo`).
- **O-9 `brief` des `ikono`.** Die Achse `name` mit 15 Werten steht im `brief` (jedes Enum ist eine Achse); gemessen ≤ 750. Mit +4 Namen (Spec 015) wächst er; Grenze beobachten.
- **O-10 `intent` am `ikono`.** Wo ein Status-Icon neben einem Status-Wort steht, erbt es dessen Farbe; `intent` braucht es nur allein stehend – und dann mit Namen (D-01). Ob die Achse bleibt oder der `avizo`-Weg (Farbe vom Kontext) reicht: Maintainer.

## ③ Typografie

**Branch:** `261017-spec-014-typografie-e3bf97` (gestapelt auf ② @ `48f3c6e`). Rot `6190e31`, grün: Hash in tasks ③.

### Zusammenfassung

1. **`titolo`** (D-01, D-03): die Überschrift – `level` 1–6 ist Pflicht ohne Default (die Struktur der Seite, gesprochen als `aria-level`), `size` eine von sieben Typografie-Rollen (`display-1..3`, `headline-1..4`) ohne Default: ohne Angabe folgt sie der Ebene (1 → headline-1, 2 → headline-2, 3 → headline-3, 4–6 → headline-4) – eine Überschrift wird nie nach ihrer Größe gewählt. Ein Teil `text` (`typography.<size>`, `color.text.default`). Neue Regulo **`heading-levels-in-order`** (fest, G8): in einer Liste von Überschriften springt keine Ebene über eine Stufe nach unten (2 → 4), aufwärts ist frei; als Listenprüfung **`levels-in-order`** über `prop:level` (neue Prüfart im Schema, Prüfer in `usage.ts`), vier Jugxoj de/en. Goals `section-heading` (`level: 2`) und `page-title` (`level: 1`).
2. **`teksto`** (D-02): der Fließtext – `kind` body | caption | kicker | code (Default body), `size` 1 | 2 (nur beim body: eine Constraint `size=2 ⇒ kind ∈ {body}`), Rangfolge-Achse **`emphasis`** high | medium | low → `color.text.default | subtle | muted` (Vorschlag, O-11). Ein Teil `text` (`typography.body.1|2`, `caption`, `kicker`, `code` nach kind·size; Farbe nach emphasis). Rolle `paragraph`; `code` wird als `role="code"` gesprochen und liegt inline im Satz. Goal `running-text`; Uzo: `heading` → `titolo`, `link-in-text` → `ligilo`, `status-word` → `insigno`, Grenze `rich-text` (ask-human, Markdown folgt in Etappe 6).
3. **Web** (D-04): zwei neue Hosts `heading` und `paragraph`. Beim `titolo` ist der Text die Kontrolle (`<div part="text" role="heading">`, kein `part="control"`, wie bei der Glyphe des `ikono`, ② B-1); das Element schreibt `aria-level` und leitet `data-size` aus der Ebene ab (`SIZE_OF_LEVEL`, Celo-Wissen). Beim `teksto` ist das `<p>` der Plattform die Kontrolle. Der `dialogo` komponiert `<fm-titolo part="heading" level="2" size="headline-4">` als seine Überschrift.
4. **Figma** (D-05): beide als Bauform `badge` (statischer Text in der Rolle der Variante, kein Ring). `titolo`: `size` × rest (7 Varianten), `level` als Eigenschaft des Sets ohne Varianten-Wirkung; `teksto`: kind × size × emphasis (15). Vorgabewörter „Überschrift“ und „Text“ (O-12).
5. **Vitrino, Make-Kit, React** (D-06, D-07): sieben Überschriften je Größe mit abgeleiteter Ebene (display-* → 1, headline-n → n), 15 Textzeilen kind · size · emphasis; zwei Guideline-Sätze aus den Rollen `heading` und `paragraph`; React-Typen aus der Skemo (`level` Pflicht).
6. **Gvidanto** (D-08): die Stichwörter der neuen Goals ohne „text“ (jeder Satz über ein Ero enthält es) und ohne „paragraph“/„absatz“ (die `tekstareo` besitzt sie, `goal-keyword-shared`); vier Dialogsätze aus ② mit Gleichstand neu formuliert (B-2).

Kein Token, keine Regulo-Semantik geändert; eine Schema-Erweiterung (Prüfart `levels-in-order`), eine neue Regulo (G8), 22 Eroj.

### Entwurfsentscheidungen

#### D-01 `titolo`: `level` ohne Default, `size` aus der Ebene (G5, G8; Regel 0.2)
`level` ist Pflicht ohne Default – das Element warnt ohne Ebene („level is required“) und rendert eine Überschrift der Ebene 1; `check_usage` meldet die fehlende Pflicht. `size` hat keinen Default in der Skemo, damit niemand eine Überschrift nach ihrer Größe wählt: das Web-Element leitet `data-size` aus der Ebene ab, wo das Attribut fehlt; die Vitrino und Figma zeigen jede Größe einmal. Die Skemo bindet `text.typography` nach `size` (sieben Bindungen auf `typography.display.*` und `typography.headline.*`), `text.color` fest `color.text.default`. `a11y`: Rolle `heading`, Name aus dem Slot, `states.level` → `aria-level`. Goals: `section-heading` (Überschrift, Zwischenüberschrift, Abschnittsüberschrift / heading, headline, subheading; `level: 2`) und `page-title` (Titel, Seitentitel / title, page-title; `level: 1`), beide mit der Regulo. Uzo: `bold-paragraph-as-heading` → `titolo` (die eigene Alternative: ein fetter Absatz, der einen Abschnitt beginnt, ist eine Überschrift), Grenze `heading-with-actions` ask-human (eine Kopfzeile mit Aktionen ist ein Sxablono), komponiert in `page-section` und mit `dialogo`, `avizo`, `plenstato`, `tabelo`; Label Pflicht, `size: container`, `wrap: allowed`.

#### D-02 `teksto`: Rangfolge-Achse `emphasis` (E2; Vorschlag O-11)
Die Spec nennt die Rangfolge `tone: default | subtle | muted` und verlangt einen Vorschlag, weil `tone` seit Spec 007 F1 ein Status ist. Vorschlag: **`emphasis: high | medium | low`** wie beim `butono` – dieselbe Achse mit derselben Bedeutung (Gewicht in der Hierarchie, kein Status), `high` → `color.text.default`, `medium` → `color.text.subtle`, `low` → `color.text.muted`. Eine Constraint statt drei: `when size=2 ⇒ allowed kind=[body]` – das Element setzt bei Verstoß die `when`-Prop zurück, also fällt eine Bildunterschrift der Größe 2 auf Größe 1 zurück und bleibt Bildunterschrift (drei Constraints `when kind=caption ⇒ size=[1]` hätten die Art auf `body` zurückgesetzt). `kind=code` wird `role="code"` und liegt inline (`:host([kind="code"])`); body, caption und kicker sind Blöcke ohne eigenen Rand (`spacing-owned-by-container`), die umbrechen (`overflow-wrap: anywhere`).

#### D-03 Regulo `heading-levels-in-order` als Listenprüfung `levels-in-order` (G8)
Fest, `appliesTo` `titolo`, Kialo: die Ebenen sind das Inhaltsverzeichnis eines Screenreaders – eine übersprungene Ebene ist ein Abschnitt, den es nicht gibt. Neue Prüfart `levels-in-order` (Schema `UzoContent.check`, ohne `count`): über die Instanzen einer Liste in ihrer Reihenfolge ist Instanz i ein Befund, wenn `level[i] > level[i−1] + 1`; aufwärts (3 → 1) schließt einen Abschnitt und ist frei. Der Prüfer liest die Prop aus `of` (`prop:level`) wie die Textregeln ihre Quelle. Vier Jugxoj (de/en approved 1, 2, 3; rejected 1, 2, 4), generiert in `get_ero` und die Make-Guidelines.

#### D-04 Web: Hosts `heading` und `paragraph`; der `dialogo` komponiert den `titolo` (G5, G6)
`hostOf("heading")` → `heading`: Shadow `<div part="text" role="heading"><slot></slot></div>` – der Text ist die Kontrolle, damit ein komponierender Dialog eine einzige `[part="control"]` behält (Playwright durchdringt Shadow-Roots, ② B-1); `selectorOf` schreibt `[part="text"][data-size=…]`, `stylesheetInventory` liest `[part="text"]`. `hostOf("paragraph")` → `paragraph`: `<p part="control">`, `role="code"` bei `kind=code`. Beide `formAssociated = false`, statisch (keine Zustände außer rest). Der Dialog ersetzt sein `<h2 part="heading">` durch `<fm-titolo part="heading" id="heading" level="2" size="headline-4">` – die Bindungen `heading.color/typography` des Dialogs bleiben am Host, der `titolo` setzt dieselbe Rolle innen.

#### D-05 Figma: Bauform `badge`, Vorgabewörter (G4)
`structureOf("heading" | "paragraph")` → `badge`: der Text in der Rolle der Variante, keine Fläche, kein Ring (die Bindungen `text.color` und `text.typography` zeichnet `drawBadge`). `titolo`: `size` ist Achse (7 Varianten), `level` schlüsselt keinen Teil und ist darum keine Achse – es steht als Eigenschaft des Sets (Enum-Liste), wie die Spec will („Eigenschaft der Instanz, nicht Variante“). `teksto`: 15 Varianten. `LABEL_DEFAULTS`: `heading` „Überschrift“, `paragraph` „Text“ – Vorschläge, kein Jugxo (O-12). Die `ekzemplo`-Fixture schreibt ihre Display-Rollen in Versalien, komuna nicht: die Display-Varianten des `titolo` tragen `TEXT_CASE_VARIES`, der Lauf warnt einmal je Set (F31, B-1).

#### D-06 Vitrino (G6)
Eine Pflicht-Enum, die keinen Teil schlüsselt (`level`), nimmt in jeder Zeile den Wert, den die Größe der Zeile nahelegt (`display-*` → 1, `headline-n` → n): sieben Überschriften, die Seite behält ihre Ordnung. Der `teksto` zeigt alle 15 Kombinationen (die Constraint lässt `caption size=2` aus). `wrapSentence`: „Überschrift darf umbrechen“, „Text darf umbrechen“.

#### D-07 Make Kit (G7)
Zwei Sätze aus den Rollen: „Every heading is a `<Titolo>` with its `level` (the structure of the page); its `size` is design, never a level chosen for its size.“ und „Every running text, caption, kicker or inline code is a `<Teksto>` in a type role; never a styled span.“ Die Komponentenseiten nennen `level` und `emphasis` aus der Props-Tabelle.

#### D-08 Gvidanto: Stichwörter ohne „text“, „paragraph“, „absatz“ (Nachlese 3 G2/G3)
`suggest_ero` zählt ganze Wörter; „Text“ steht in fast jedem Satz über ein Ero („Mach diesen Text fett …“) und hätte jeden Dialog zum Gleichstand gemacht – kein Stichwort. „paragraph“/„absatz“ stehen im Goal `multi-line` der `tekstareo` (`goal-keyword-shared`); der Erste in Namensordnung antwortet, ein Doppel hätte dem `teksto` nichts gebracht – die `tekstareo` behält die Wörter (O-15). Stichwörter des `teksto`: running-text, body-text, caption, kicker, inline-code / fließtext, lauftext, bildunterschrift, kicker. `check:regularo` 0 Warnungen.

### Arkitekturo-Abdeckung

| Ero | Stand |
|---|---|
| `titolo` | trägt (Skemo mit `level`/`size`, Uzo, Regulo `heading-levels-in-order` mit Prüfart `levels-in-order`, vier Jugxoj, Web Component `fm-titolo` mit `aria-level` und abgeleiteter Größe, React, Figma-Bauform badge, Make-Kit, Vitrino, MCP; komponiert im `dialogo`) |
| `teksto` | trägt (Skemo mit `kind`/`size`/`emphasis`, Uzo, Web Component `fm-teksto` mit `role="code"`, React, Figma-Bauform badge, Make-Kit, Vitrino, MCP) |
| `dialogo` | Überschrift ist ein komponierter `fm-titolo` (Browser-Specs des Dialogs grün) |
| `avizo`, `plenstato`, `tabelo` | komponieren `titolo` in der Uzo (composes.with); ihre Überschriften bleiben eigene Textteile (Abweichung 2, O-14) |

### Abweichungen von der Spec

1. **`emphasis` statt `tone`** (D-02): die Spec verlangt den Vorschlag; `tone` ist seit Spec 007 F1 ein Status. Zur Bestätigung bei der Abnahme (O-11).
2. **`avizo`, `plenstato`, `tabelo` komponieren den `titolo` nur in der Uzo**, nicht im Shadow-Markup: ihre Überschrift ist ein Text des Hinweises, der Zustandsfläche, der Tabelle (die `<caption>` der Plattform) und keine Ebene der Seite; nur der `dialogo` – ein eigenes Dokument – setzt eine Ebene (2). Ein `fm-titolo` im `avizo` hieße, dem Hinweis eine Ebene zu geben (O-14).
3. **Eine Constraint statt „size nur bei body“ als drei** (D-02): `size=2 ⇒ kind=body`; derselbe Raum (15 Kombinationen), aber der Rückfall des Elements trifft die Größe und nicht die Art.
4. **Figma: `level` als Enum-Eigenschaft des Sets** (Spec: „Text-Property“): eine Liste der sechs Ebenen, keine Varianten-Achse; ein freier Text könnte „7“ sagen.
5. **Stichwörter ohne „Text“ und „Absatz“** (D-08): die Spec nennt die Goals, nicht die Wörter; Gleichstand und `goal-keyword-shared` entscheiden.

### Befunde / Mankoj

- **B-1** Figma-Lauf über `core + ekzemplo` warnt „titolo: Die Schreibweise der Beschriftung ist nicht in allen Modi dieselbe“ – die Display-Rollen der ekzemplo-Fixture sind Versalien, komunas nicht; `textCase` ist nicht bindbar (F31). Richtig so; die Plugin-Tests der Fixture erwarten die Warnung. Kein Manko.
- **B-2** Gleichstände im Gvidanto durch die neuen Stichwörter: „Piktogramm neben der Überschrift“ (ikono ↔ titolo), „a tag next to the title“ (insigno ↔ titolo), „Fließtext mit fetter Formatierung“ (tekstareo ↔ teksto) – die Dialogsätze der ②-Tests (`ikono.test`, `insigno.test`, `tekstareo.test`, MCP `s014-grundbausteine`) sind neu formuliert („Piktogramm vor dem Wort“, „a tag beside the row“, „Eingabe mit fetter Formatierung“); die Antworten der Eroj sind dieselben. Kein Manko.
- **B-3** Playwright: `getByRole("code", { name })` findet nichts – die Rolle `code` nimmt keinen Namen aus dem Inhalt (ARIA: name prohibited); der Spec zählt die Rolle. Kein Manko.
- **B-4** CI von PR ② fiel in Shard 2 (`saltligilo.spec`: `browserName` im zweiten Test entfernt, aber genutzt – lokal nur Chromium gelaufen); Fix `48f3c6e` auf ②, ③ darauf gestapelt.
- **B-5** Die `uzo-web-term`-Prüfung hält „reference“ und „title“ für Web-Begriffe: die Stichwörter des `teksto` heißen `link-text` und `subheading`. Kein Manko.

### Offen (für den Maintainer)

- **O-11 Name der Rangfolge-Achse.** `emphasis: high | medium | low` (D-02). Bestätigen oder benennen.
- **O-12 Vorgabewörter Figma.** `heading` „Überschrift“, `paragraph` „Text“ (D-05). Zur Bestätigung; dann je ein Jugxo.
- **O-13 Reichweite von `heading-levels-in-order`.** Die Prüfung sieht eine Liste von `titolo`-Instanzen in `check_usage`; die Ebene 2 des Dialogs und Überschriften in Sxablonoj liegen außerhalb, bis eine Seiten-Prüfung die Instanzen sammelt.
- **O-14 `fm-titolo` in `avizo`, `plenstato`, `tabelo`.** Abweichung 2: ob die Überschrift des Hinweises eine Ebene der Seite werden soll (dann `fm-titolo` mit welcher Ebene?) oder Text bleibt.
- **O-15 „Absatz“ und „paragraph“.** Bleiben bei der `tekstareo`; „Absatz“ allein fragt eine Person (Gleichstand kampo/tekstareo/teksto über die Alternativen). Ob der `teksto` das Wort bekommen soll, entscheidet der Maintainer – dann verliert es die `tekstareo` (D-08).

## ④ Overlays

*(folgt: `konsileto`, `sxvebilo`, `menuo`; Schatten in Figma gebunden.)*

## ⑤ Aufklappen

*(folgt: `faldilo`, `kompletigilo`.)*
