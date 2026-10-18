# Spec 014 – Eroj Runde 3 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen je PR in **einer** Zeile der Messungen (nach einem Rebase dort und in der einen Schleife von `src/docs/docs.test.ts` ersetzen).

## ① Grundlage

**Branch:** `261017-spec-014-grundlage-d4f536` (von `main` @ `f6f38f5`) · Aufgaben ① zählen ab T701 (② ab T801, ③ ab T901, ④ ab T1001, ⑤ ab T1101).

### A – Rot zuerst
- [x] **T701 Spec** `specs/014-eroj-runde-3/spec.md` unverändert kopiert: `9a3194f`; Spec-Korrektur des Maintainers (19:54, Phosphor) erneut unverändert kopiert: Hash in den Messungen.
- [x] **T702 Tests** Gewicht (`data/navigado.test.ts`, `data/langetaro.test.ts`), `dialogo.reason-help` (`data/dialogo.test.ts`), `atributlisto layout auto` (`data/atributlisto.test.ts`, Projekcioj), Ikonaro (`contracts/spec014-schema.test.ts`, `data/ikonaro.test.ts`, `checks/ikonaro/index.test.ts` mit drei Fixtures), CI-Pin, README, Doku-Test (`docs/docs.test.ts`), Overlay-Messskript. Rot in `27e472d` (Modelo 28 Tests in 10 Dateien + 2 Suiten, Projekcioj 13 in 4 Dateien).
- [x] **T703 Korrektur Ikonaro (Maintainer 17.10., vor dem Grün)** Phosphor Icons (MIT) statt Lucide: komuna Stil regular, ekzemplo Stil fill, Herkunftsnachweis je Datei, Abbildung `ikonoj.names` im Aspekto-Paket, `check:ikonaro` prüft nur „quadratisch“ (plan ① D-04, Abweichungen 1–2). Rote Tests angepasst; Hash in den Messungen.

### B – Grün
- [x] **T704 Gewicht** Schema `weight`, `navigado`/`langetaro` Bindungen, Web Component (`font-weight` nur im aktuellen Fall), Figma (Schnitt je Aspekto, `fontStyle` an `font/style/semibold`, Schriften des Sets), Browser-Specs (D-01).
- [x] **T705 `reason-help`** Slot, Constraint, Uzo (Warnung), `help-is-one-sentence` ausgeweitet (fünf Eroj), vier Jugxoj `jug_01M55NWNH7K2SQJNZV10P42QS3`–`QS6`, Shadow-Markup (`slot="help"` des `tekstareo`), Browser-Spec (D-02).
- [x] **T706 `layout: auto`** Skemo (dritter Wert, Bindung wie `columns`), Uzo `columns-from`, Schema-Muster `size.container.*`, `uzo-prop-unknown`, Web Component (`#autoLayout`, ResizeObserver, `--fm-size-container-small`), Vitrino, Figma-Variante, React-Typ, Browser-Specs inkl. RTL (D-03).
- [x] **T707 Ikonaro** Schema `Ikono`/`IkonaroFile`/`iko_`, optionale Datendatei im Loader (Schema-Prüfung, IDs, Export), `data/ikonaro.json` (15 Namen; `menu` nach O-2 entfernt, ID stillgelegt), Glyphen komuna (Phosphor regular) und ekzemplo (Phosphor fill) mit Herkunftsnachweis und `ikonoj.names`, `check:ikonaro` (fünf Regeln, RULE_IDS 160, CHECK_NAMES, `pnpm check`, CI-Schritt, README), Ontologio Ikonaro/Ikono (D-04).
- [x] **T708 Tooltip-Kontrast** KontrastParo `text-inverse-on-background-inverse` war deklariert; bestätigt, kein neues Paar (D-05).
- [x] **T709 Overlay-Messung** Skript gelaufen (Chromium 153, Firefox 155, WebKit 26.6), Tabelle und Entscheidung für ④ in plan ① (D-06).

### C – Abschluss
- [x] **T710 Doku** plan ①, tasks ①, Vojmapo Zeile 4, README (Checks-Tabelle, Icon-Satz); Make-Guidelines unverändert (kein neues Ero in ①).
- [x] **T711 Messungen** unten; Bericht im PR #70.

### D – Abnahme ①
- [x] **T712 F-1/F-2 rot** `datumoj.test.ts` (Liste ohne eigenen Text; `reason-help` in vier Zellen), `vitrino.check.ts` (kein Textknoten im Host; Hilfe sichtbar unter dem Feld, Beschreibung des Textfelds). Rot in `fb0fa04` (datumoj 2, vitrino.check 1).
- [x] **T713 F-1/F-2 grün** `datumoj.ts` (`named` ohne Listen-Sonderfall; `slotTexts` prüft Constraints auch gegen den Zeilenwert; Wort `reason-help`), `DIALOG_TEXTS` mit `reason-help`; Hash in den Messungen.

### Messungen

| Was | Wert |
|---|---|
| Commits ① | rot `27e472d`, Korrektur Ikonaro `49d4697`, Spec-Korrektur `2b3ba25`, grün `506f2a1`, CI `5740c53`, Messungen `acb6eae`, Abnahme rot `fb0fa04`, Abnahme grün `c40c523` |
| Ikonaro | 15 Namen (Grenze 25), 2 Aspektoj × 15 Glyphen, Phosphor `@phosphor-icons/core` 2.1.1 (MIT), Raster 256 |
| Overlay-Unterstützung | Popover-API und Anchor Positioning vollständig in allen drei Engines; nur `inset-area` (alter Name) fehlt überall |
| CI | Lauf 1 `39065845169` (506f2a1): unit 6m21s grün, Eroj-Shards 5m42s/5m18s grün, Rendered checks 5m37s rot (B-6, Vitrino-Zahl); Lauf 2 `39066399062` (5740c53): alle Jobs grün – unit, Eroj-Shards 6m06s/5m11s, Rendered checks 6m56s; Wanduhr 7m48s, unter 12 min; Lauf 3 `39066984214` (acb6eae) grün; Lauf 4 `39069914094` (c40c523, Abnahme) grün – Rendered checks mit Vitrino 7m03s, Wanduhr 7m07s |

## ② Grundbausteine

**Branch:** `261017-spec-014-grundbausteine-e3bf97` (von `main` @ `498b238`) · Aufgaben ② zählen ab T801.

### A – Rot zuerst
- [x] **T801 Tests** Daten-Pins `data/ikono.test.ts`, `data/apartigilo.test.ts`, `data/saltligilo.test.ts` (Skemo, Uzo, Reguloj, Jugxoj, Gvidanto-Dialoge), Schema (`contracts/spec014-schema.test.ts`: `layer`, leeres `a11y.name`), Eroj 17 → 20 in allen Pins (Export-Satz „twenty“, Listen, Ontologio), Projekcioj (`web-component.test.ts`, `css.test.ts`, `figma.test.ts`, `plugin.test.ts`, `datumoj.test.ts`, `make-kit.test.ts`, `gvidanto/eroj.test.ts` für `columns-from`), Browser-Specs (`ikono.spec.ts`, `apartigilo.spec.ts`, `saltligilo.spec.ts`, `avizo.spec.ts`, `elektilo.spec.ts`, `tabelo.spec.ts`, `alirebleco.check.ts`, `internacia.spec.ts`, `vitrino.check.ts`), React-Typen, MCP-Dialoge `e2e/s014-grundbausteine.test.ts`, Doku-Test ②, drei Fehlerfixtures (`ikono-web-term`, `apartigilo-instead-kialo-missing`, `saltligilo-slot-required-missing`). Rot in `8258240` (Modelo 49 Tests in 11 Dateien, Projekcioj 23 in 5 Dateien, MCP-Suite s014; Browser-Specs und `plugin.test` im Lauf beobachtet).

### B – Grün
- [x] **T802 `ikono`** Skemo (name-Enum des Ikonaro, size, intent mit `inherit`, label, vier Constraints), Uzo, Regulo `icon-meaning-named` (`reg_01M55X2XBTVBQC8HSYFM3SBYM2`), vier Jugxoj `jug_01M55X2XQXVH4CN9PHB5ZNPNEH`–`QXVH…EJ`, `QYKE…23`, `QYKE…24`, Nachtrag am Jugxo `jug_01M31TV1V4S3RNBPWSRB2CGEDK`, Ontologio `Ikono` als Ero (D-01, D-08).
- [x] **T803 `apartigilo`** Skemo (orientation schlüsselt `box.height`), Uzo, Schema `a11y.name` ohne `minItems`, Ontologio `Apartigilo` (D-03).
- [x] **T804 `saltligilo`** Skemo (`to`, `layer` als Teil-Eigenschaft, `a11y.texts.label-empty`), Uzo, `link-label-names-destination` ausgeweitet, Ontologio `Saltligilo` (D-04).
- [x] **T805 Nachbarn** `butono` (Slots nehmen `ikono`, composes), `avizo` (Teil `icon`, composes), `insigno`, `tabelo`, `elektilo` (composes), `spacing-owned-by-container` (D-05).
- [x] **T806 Modelo-Code** `PART_PROPERTY_TYPES.layer`, Loader liest `ikonoj/*.svg` (`LoadedAspektoPackage.ikonoj`), `icon-meaning-named` als Textregel, `uzoOf` mit `columns-from` (O-3) und MCP-Ausgabeschema, Zahlwörter bis zwanzig, Vortaro-Lint (`currentcolor`, `mask-*`, `inset-*`, `border-block-start-style`, `z-index`).
- [x] **T807 Web** Element-Template (Hosts `icon`, `separator`; Sprunglink `href="#"`, Fokusziel, Standardtext; Icons in `elektilo`, `tabelo`, `avizo`; `size` an geslotteten Icons), Stylesheet (Maske, Linie, `layer` → `z-index`, Sprunglink verborgen bis Fokus), CSS-Celo `--fm-ikono-<name>` je Aspekto (D-02, D-05).
- [x] **T808 Figma** Plan (`ikonoj`, BOOLEAN-Variablen, Bauformen `icon`/`separator`, `extraAxes`, Icons je Variante, `INHERIT_COLOR`, `composed["reason-help"]`), Plugin (`drawGlyphs`, `drawIcon`, `drawSeparator`, Icons in Kontrolle/Select/Tabelle/Hinweis, Dialog-Hilfesatz O-5, `placement` im Teil `state`), `FIGMA_NOT_DRAWN` ohne `icon` (D-06, D-07).
- [x] **T809 Vitrino, Make-Kit, React** Ikonaro-Raster, beide Richtungen des Trenners, Sprunglink, `butono` mit `icon-start`; drei Guideline-Sätze; React-Typen (D-09, D-10).

### C – Abschluss
- [x] **T810 Doku** plan ②, tasks ②, Vojmapo Zeile 4, README.
- [x] **T811 Messungen** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits ② | rot `8258240`, grün `f4cbb25`, Fix `48f3c6e` (saltligilo-Spec: `browserName` im zweiten Test, CI Shard 2), Fix `60fd64f` (Fokus synchron); Abnahme F-4: rot `aa92ed4` (Double verweigert schreibgeschützte Felder), Fix `5a2f67b`; Abnahme F-5: rot `3e16242` (Double verweigert Layout-Kindfelder außerhalb von Auto Layout, zwei Läufe des ganzen Plans), Fix `49b6a40` |
| `brief` | ikono, apartigilo, saltligilo ≤ 750 (Daten-Tests und MCP e2e) |
| Parität | `check:parity` 20 Eroj, 0 Differenzen, 225 Freigaben |
| `check:regularo` | 55 Reguloj, 172 Jugxoj, 20 Uzoj, 0 Warnungen (keine neue `goal-keyword-shared`) |
| Tests lokal | Modelo, Projekcioj (Figma-Plugin-Double: Icons je Aspekto, 225 Varianten), MCP 264; Browser-Specs der ② in Chromium grün |
| CI | Lauf 39076801771 rot (Shard 2, B-7: `browserName`), Lauf 39077749355 grün, 7 min 17 s (Jobs 7:15 / 4:30 / 7:07 / 7:04) |

## ③ Typografie

**Branch:** `261017-spec-014-typografie-e3bf97` (gestapelt auf ② @ `48f3c6e`) · Aufgaben ③ zählen ab T901.

### A – Rot zuerst
- [x] **T901 Tests** Daten-Pins `data/titolo.test.ts`, `data/teksto.test.ts` (Skemo, Uzo, Regulo, Jugxoj, Gvidanto-Dialoge, Listenprüfung), Schema (`contracts/spec014-schema.test.ts`: Prüfart `levels-in-order`), Eroj 20 → 22 in allen Pins (Export-Satz „twenty-two“, Listen, Ontologio, Kit-Dateien 39, Headline-Sets), Projekcioj (`web-component.test.ts`, `figma.test.ts`, `datumoj.test.ts`, `make-kit.test.ts`), Browser-Specs (`titolo.spec.ts`, `teksto.spec.ts`, `alirebleco.check.ts`, `vitrino.check.ts`), React-Typen, MCP-Dialoge `e2e/s014-typografie.test.ts`, Doku-Test ③, zwei Fehlerfixtures (`teksto-web-term`, `titolo-slot-required-missing`). Rot in `6190e31` (Modelo 39 Tests in 14 Dateien, Projekcioj 18 in 5 Dateien, MCP-Suite s014-typografie; Browser-Specs im Lauf beobachtet).

### B – Grün
- [x] **T902 `titolo`** Skemo (`level` Pflicht, `size` aus sieben Rollen), Uzo, Regulo `heading-levels-in-order` (`reg_01M5616GSFTAVNSEZTHHEZ8700`), vier Jugxoj `jug_01M5616H5XBEN3V2PK5S1QBKMP`, `…5YYRY0SWWR0VY53ZXJ`, `…ZXK`, `…ZXM`, Ontologio `Titolo` (D-01, D-03).
- [x] **T903 `teksto`** Skemo (`kind`, `size`, `emphasis`, eine Constraint), Uzo, Ontologio `Teksto` (D-02).
- [x] **T904 Nachbarn** `dialogo` (composes teksto, titolo), `avizo`, `plenstato`, `tabelo` (composes titolo), `spacing-owned-by-container` (Abweichung 2).
- [x] **T905 Modelo-Code** Schema `UzoContent.check` `levels-in-order`, Prüfer `heading-levels-in-order` in `usage.ts`, Zahlwörter bis zweiundzwanzig (D-03).
- [x] **T906 Web** Hosts `heading` und `paragraph` (Element-Template, Stylesheet-Struktur, `selectorOf`, `stylesheetInventory` liest `[part="text"]`), `SIZE_OF_LEVEL`, `role="code"`, Dialog komponiert `fm-titolo` (D-04).
- [x] **T907 Figma** `structureOf` → badge, `LABEL_DEFAULTS` Überschrift/Text; Plugin-Tests der Fixture erwarten die `textCase`-Warnung des `titolo` (D-05, B-1).
- [x] **T908 Vitrino, Make-Kit, React** `vitrinoDutyValue` (Ebene aus der Größe), `wrapSentence`, zwei Guideline-Sätze, React-Typen (D-06, D-07).
- [x] **T909 Gvidanto** Stichwörter ohne „text“/„paragraph“/„absatz“, vier ②-Dialogsätze neu formuliert (D-08, B-2).

### C – Abschluss
- [x] **T910 Doku** plan ③, tasks ③, Vojmapo Zeile 4, README.
- [x] **T911 Messungen** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits ③ | rot `b702826` (vor dem Rebase `6190e31`), grün `77ef403` (nach Rebase auf ② `60fd64f`), Fix `40833ab` (Alirebleco-Block: `<p>` ohne Textfarbe im dunklen Aspekto → `fm-teksto`; Vitrino zählt vier Überschriften der Stufe 1; `@ts-expect-error` vor der JSX-Zeile in `titolo.tsx`); nach dem Rebase auf ② `6fb4ab3` (F-4) am 2026-10-18; nach dem Rebase auf ② `e487388` (F-4) am 2026-10-18; nach dem Rebase auf `main` `94e4a92` (#71 gemergt) am 2026-10-18 |
| `brief` | titolo, teksto ≤ 750 (Daten-Tests und MCP e2e) |
| Parität | `check:parity` 22 Eroj, 0 Differenzen, 225 Freigaben |
| `check:regularo` | 56 Reguloj, 176 Jugxoj, 22 Uzoj, 0 Warnungen (keine neue `goal-keyword-shared`) |
| Tests lokal | Modelo 3362, Projekcioj 633, MCP 270; Browser-Specs titolo, teksto, dialogo, Alirebleco-Block, Vitrino in Chromium grün |
| CI | Lauf 1 `39080409189` (ecc62e3) rot: Rendered checks (Alirebleco-Block ③ im dunklen Aspekto, Vitrino-Zahl) und Eroj-Shard (Typtest titolo), 9 min 16 s; Lauf 2 `39086698635` (453ae18) grün, 8 min 00 s (Jobs 7:06 / 4:43 / 7:57 / 7:19), unter 12 min |

## ④ Overlays

**Branch:** `261017-spec-014-overlays-e3bf97` (gestapelt auf ③) · Aufgaben ④ zählen ab T1001.

### A – Rot zuerst
- [x] **T1001 Tests** Daten-Pins `data/konsileto.test.ts`, `data/sxvebilo.test.ts`, `data/menuo.test.ts` (Skemo, Uzo, Reguloj, Jugxoj, Gvidanto-Dialoge, Listenprüfung), Eroj 22 → 25 in allen Pins (Export-Satz „twenty-five“, Listen, Goals, Ontologio, Kit-Dateien, Headline-Sets), Projekcioj (`web-component.test.ts`, `figma.test.ts`, `plugin.test.ts` mit Schatten `bound`, `datumoj.test.ts`, `make-kit.test.ts`), Browser-Specs (`konsileto.spec.ts`, `sxvebilo.spec.ts`, `menuo.spec.ts`, `alirebleco.check.ts` mit Kontrastmessung, `vitrino.check.ts`), React-Typen (`htmlFor`), MCP-Dialoge `e2e/s014-overlays.test.ts`, Doku-Test ④, zwei Fehlerfixtures (`konsileto-slot-required-missing`, `menuo-web-term`). Rot in `97098e1` (Modelo 78 Tests in 29 Dateien, Projekcioj 23 in 6 Dateien, MCP 12 in 13 Dateien; Browser-Specs im Lauf beobachtet).

### B – Grün
- [x] **T1002 `konsileto`** Skemo, Uzo, Regulo `tooltip-text-short` (`reg_01M564NXYK5MC9C1SRGMW3CA7B`) mit vier Jugxoj `jug_01M564NYAMHPVDJCKZ422FR5X7`, `…APDDV16E0FDCRMW3KM`, `…3KN`, `…AQTWQ5W2CQQDPNNMMZ`, Ontologio `Konsileto`, Enforcer `textRule` (D-01, B-4).
- [x] **T1003 `sxvebilo`** Skemo, Uzo, Ontologio `Sxvebilo`; `dialogo` schließt `non-modal` (D-02, B-1).
- [x] **T1004 `menuo`** Skemo (`a11y.texts label-empty`), Uzo, Ontologio `Menuo`; `label-names-action`, `option-labels-distinct` ausgeweitet; `tabelo` schließt `row-actions-menu`; `ikono`, `apartigilo`, `butono` komponieren (D-03).
- [x] **T1005 Modelo-Code** `skemo-a11y-invalid` nimmt `<prop>-empty` einer String-Prop, `uzo-content-of-invalid` nimmt einen Text-Slot mit mehreren Texten als Liste, Zahlwörter bis fünfundzwanzig, Vortaro-Lint (`position-area`, `position-anchor`, `position-try-fallbacks`, `inset`).
- [x] **T1006 Web** Hosts `tooltip`, `popover`, `menu` (Element-Template: Popover-API, Anchor Positioning mit Fallback, `aria-describedby`, Fokusweg, Reihen mit `menuitem`, Tasten, `select`), Stylesheet-Strukturen und Selektoren, `max-inline-size` für die Breite (D-04, D-05).
- [x] **T1007 Figma** Plan (Bauformen tooltip/popover/menu, `extraAxes` placement, `labelPartOf` heading/item, Vorgabewörter, `menu` und `entry` je Set), Plugin (`drawTooltip`, `drawPopover`, `drawMenu`, `drawStandIn`, `bindShadow`; Headline ohne die vier Zählwerte, B-3), Double mit `setBoundVariableForEffect` (D-06).
- [x] **T1008 Vitrino, Make-Kit, React** drei Sektionen und Wörter, drei Sätze, `htmlFor` (D-07, D-08).

### C – Abschluss
- [x] **T1009 Doku** plan ④, tasks ④, Vojmapo Zeile 4 und Befund-Zeile, README.
- [x] **T1010 Messungen** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits ④ | rot `53c875e`, grün `8c388fd`, Fix `c28eca9` (nach dem Rebase auf ③ `ba37441`; die CI-Läufe unten liefen auf `94c4e2a`/`19e8e27`, davor `b08d1c1` rot) (Typtests `konsileto.tsx`/`sxvebilo.tsx`: `@ts-expect-error` vor der JSX-Zeile, beide Eroj-Shards); nach dem Rebase auf ② `6fb4ab3` (F-4) am 2026-10-18, weitere Fixes `c70550e`; nach dem Rebase auf ② `e487388` (F-4) am 2026-10-18, weitere Fixes `88fcd48`; nach dem Rebase auf `main` `8a41cba` (#72 gemergt) am 2026-10-18, weitere Fixes `3d51465` |
| `brief` | konsileto, sxvebilo, menuo ≤ 750 (Daten-Tests und MCP e2e) |
| Parität | `check:parity` 25 Eroj, 0 Differenzen, 225 Freigaben |
| `check:regularo` | 57 Reguloj, 180 Jugxoj, 25 Uzoj, 0 Warnungen (keine neue `goal-keyword-shared`) |
| Tests lokal | Modelo 3413, Projekcioj 648, MCP 278; alle 203 Browser-Specs in Chromium grün, Alirebleco-Block ④ (8) und Vitrino-Check (25) mit eigener Konfiguration grün |
| CI | Lauf 1 `39086960436` (94c4e2a) rot: beide Eroj-Shards (Typtests), 9 min 53 s; Lauf 2 `39087974879` (19e8e27) grün, 11 min 06 s (Jobs 7:44 / 7:37 / Build-Job 11:04 / 9:11) – unter 12 min, aber der Build-Job wächst mit jedem Ero (Befund, siehe Bericht) |

## ⑤ Aufklappen

*(folgt)*
