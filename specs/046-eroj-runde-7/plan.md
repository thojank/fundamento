# Spec 046 – Eroj-Runde 7: Layout, Tabelle, Anzeige – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert) · **Basis:** `origin/main` `626043f9` (Merge #158) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Grenzen angehoben. Nichts gemergt.** Kein Sprachmodell.

Die Produkt-Spec des Auftrags (Abweichungen A-1 bis A-10, Ausnahmen) geht der Quell-Spec vor, wo beide abweichen. PR A (dieser Branch, T1–T6) trägt die Eroj, PR B (T7) die Regel-Korrekturen L5-1 bis L5-3 in einem eigenen Worktree.

### G-0 Quelle

| | Wert |
|---|---|
| Quelle | `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec046/spec.md` |
| SHA-256 laut Auftrag | `6b842691dbca177757a574a9239ee33b95306e4c73fc1e844d8f425d74f2d1f9` |
| SHA-256 der Quelle (2026-11-08, `shasum -a 256`) | `6b842691dbca177757a574a9239ee33b95306e4c73fc1e844d8f425d74f2d1f9` |
| SHA-256 der Kopie `specs/046-eroj-runde-7/spec.md` | `6b842691dbca177757a574a9239ee33b95306e4c73fc1e844d8f425d74f2d1f9` |
| Ergebnis | **gleich**, 6 283 Byte. Kopiert mit `cp`, nicht über ein Editor-Werkzeug. |

## Abweichungen von der Quell-Spec (Maintainer, 2026-11-08)

| # | Quell-Spec | Gilt stattdessen | Grund |
|---|---|---|---|
| A-1 | `fm-tabelo` neu geschnitten mit `kapo`/`korpo`/`piedo`, `fm-vico-tabela`, `fm-cxelo` | Die native `<table>` bleibt die einzige Form und bekommt die fehlenden Fähigkeiten | `fm-markdovido` und viele Tests hängen an dieser Form; bessere Semantik |
| A-2 | `fm-priskribo` | Wird nicht gebaut; „Inhalte anzeigen“ wird Ziel von `fm-atributlisto` | `fm-atributlisto` kann das schon |
| A-3 | Props und Ereignisse auf Esperanto | Ero-Namen Esperanto, Props und Ereignisse englisch | Alle bestehenden Props sind englisch; `terminology.md` |
| A-4 | Abstände aus `space.*` | `spacing.*` | So heißt die Gruppe im Kern-Set |
| A-5 | `fm-butono primara` | `fm-butono emphasis="high"` | Prop `primara` gibt es nicht |
| A-6 | `fm-listo` trägt `dataForm: list` | `fm-templinio` trägt `list` | `fm-listo` gibt es nicht |
| A-7 | Bestehende Tests grün ohne Anpassung | Enge, benannte Ausnahmen (unten) | Mit neuen Eroj unerfüllbar |
| A-8 | Vertragstests aus 038 byte-gleich | Nur gewollt geänderte Einträge werden fortgeschrieben; L5-1 fasst AC-8-Fixtures neu | `list_eroj` u. a. halten den Stand Byte für Byte fest |
| A-9 | PR A: T1–T5; PR B: T6, T7 | PR A: T1–T6 mit `dataForm` und allen Ero-Daten; PR B: T7 | Sonst teilen sich beide PRs Dateien |
| A-10 | „Bildtests“ | Web: Geometrie- und Stiltests ohne PNG-Referenzen; Figma: bestehender Bildtest über das Double | Festlegung D-09 aus Spec 035 |

## Ausnahmen von „bestehende Tests grün ohne Anpassung“

Abschließende Liste. Jede Ausnahme ist ein eigener Commit. Was darüber hinaus nötig wäre, wird Befund und nicht geändert.

| PR | Stelle | Änderung | Commit |
|---|---|---|---|
| A | Teststellen mit fest erwarteten 40 (bzw. 45) Eroj, auch `packages/metiejo/src/komponentoj.test.ts` | Zahl aus den Daten ableiten; sonst nichts. `docs.test.ts:3658` (eingefrorener Stand) bleibt, ebenso `:3228` (B-2) | T1, siehe „Ausnahme-Commits“ |
| A | `eroj-fields.test.ts:357` | Wächter gegen `dataForm` wird Prüfung des neuen Feldes | T6 |
| A | `tabelo.test.ts`, `s011-daten.test.ts`, `make-kit.test.ts` | Nur die Erwartungen zu `row-selection` und `sticky-header` | T3 |
| A | `arangxoj.test.ts:262` und `:315` | Laufen auf dem Modelo ohne `vico`, `kolumno`, `stako`, `krado`; die Prüfungen bleiben | T1 |
| A | Vertrags-Fixtures `list_eroj`, `get_ero` (`tabelo`, `atributlisto`, `butono`) und was der rote Lauf nachweist | Mit `generi.mjs` nur diese Einträge fortschreiben | T6 |
| B | AC-8-Fixtures `ero-mit-slot-daten`, `link-ero`, `regelverstoss`, `abnahme-komuna-r2-liste`, `kuroj-werkzeugliste-F-1` | Neu fassen wegen L5-1 | T7 |
| B | Vertrags-Fixture `list_reguloj`, falls L5-2 sie ändert | Wie oben | T7 |

**Datendateien außerhalb der freien Pfade**, nur für neue oder hier beschriebene Einträge: `packages/modelo/data/ids.lock.json`, `tradukoj.json`, `ontologio.json`, `packages/modelo/schema/modelo.schema.json` (PR A), `packages/modelo/data/reguloj.json` (PR B).

## Blocker und Fragen aus der Implementierungs-Spec (B-1 bis B-11)

| # | Befund | Stand |
|---|---|---|
| B-1 | `docs.test.ts:3654–3659` vergleicht das **lebende** Eroj-Verzeichnis mit `specs/029-fonto-astryx/abgleich.json` (40 Einträge). | Keine Maintainer-Entscheidung im Lauf. Wortlaut der Produkt-Spec: **nicht geändert**. Rot in PR A ab T1, Befund (unten). |
| B-2 | `docs.test.ts:3186–3228` (Spec 026 ②) erwartet je Ero eine Zeile in `specs/026-lingvo/plan.md` und `rows === 45`. | Wie B-1: **nicht geändert**, rot ab T1, Befund. |
| B-3 | `datumoj.test.ts:418` `not.toContain("fm-kolumno ")` (alte Klasse aus Spec 004). | Wie B-1: **nicht geändert**. Wird erst rot, wenn die Vitrino `fm-kolumno` zeigt (T5). Befund. |
| B-4 | L5-4: das Kurzprofil allein liegt schon unter 750; der Fehler ist `constraints` in `rest`. | T6. |
| B-5 | `data-span` wird nie als erfundenes Attribut gemeldet. | T2: Wächtertest „grün ab Beginn“. |
| B-6 | „create new“: `suggestion` ist Ero **oder** Sxablono. | T6: Goal der Sxablono `formularo` mit `children` (Regel 0). |
| B-7 | `UzoSlot.accepts` kennt kein „beliebig“. | T1, D-04: Weg des Repos (kein Uzo-Eintrag für den Slot, wie `karto` Slot `media`); `check:dokumentaro` und „Uzo vollständig“ grün, keine Schemaänderung. |
| B-8 | PR A ist eine Kette aus sechs Tickets (gegen „höchstens 3 hintereinander“, `delivery.md`). | Bewusst so geplant; T7 läuft parallel. Abweichung von `delivery.md`. |
| B-9 | `malplena-pagxo.test.ts:113` nutzt „Inhalte anzeigen“ als Fehltreffer. | T6 prüft im roten Lauf. |
| B-10 | `testing.md` nennt ein Skript `pnpm --filter @fundamento/eroj dev`, das es nicht gibt. | QA über `fm projekcioj build` und statischen Server. |
| B-11 | `tabelo/uzo.json` `instead` `layout-grid` → `ero: null`. | Nicht geändert; Befund (Kandidat für die nächste Runde). |

## Entscheidungen

| ID | Ticket | Frage | Wahl und Grund |
|---|---|---|---|
| D-01 | T1 | Quelle | Byte-gleich mit `cp`, Hash wie im Auftrag (G-0). |
| D-02 | T1 | Props der Layout-Eroj | `gap` (enum `xsmall`…`xxlarge` = die direkten Stufen von `spacing.*`, Standard `medium`), je Stufe gebunden an `spacing.<stufe>` über `box.gap` (`by: [gap]`); `align` (`start`, `center`, `end`, `stretch`; Standard `center` bei `vico`, `stretch` bei `kolumno`), `justify` (`start`, `center`, `end`, `space-between`; Standard `start`), `wrap` (boolean, Standard `false`). `stako` nur `gap`. Ein Teil `box`, nur `gap`: keine Farbe, keine Schrift. |
| D-03 | T1 | Rolle und Host | `a11y.role` `generic`, `name` leer, keine Taste. Der Web-Component-Generator erkennt eine Layout-Ero an Rolle `generic` plus Skemo-Goal `row`/`column`/`stack` (`layoutDirectionOf`, `web-component.ts`) und erzeugt den Host `layout`: `<div part="control"><slot>`, Flex in Richtung des Goals (`row` → Reihe, `column`/`stack` → Spalte). `align`/`justify` als CSS-Schlüsselwörter gleichen Namens über das Host-Attribut (wie `karto` `orientation`), damit das Paritätsinventar nur `gap` nennt; unbekannter Wert → Skemo-Standard. T2 (`krado`, Goal `column`) braucht eine eigene Erkennung (z. B. Prop `columns` → Grid), sonst würde `krado` hier als Spalte gebaut. |
| D-04 | T1 | B-7 Slot ohne `accepts` | Standard-Slot `content` (`default: true`), `uzo.slots` = `{}` (Weg der `karto`, Slot `media`). Keine Schemaänderung. |
| D-05 | T1 | Goals und Stichwörter | Goals `row` (`vico`), `column` (`kolumno`), `stack` (`stako`), je `props: { gap: "medium" }`. Stichwörter ohne Kollision mit bestehenden Zielen: nicht `row`, `below`, `beside`, `aligned`, `stacked`, `senkrecht` (sonst kippen `insigno`, `menuo`, `sxvebilo`, `teksto`, `pagxo` und die Grenzen `avizo` `stacked-notices`, `langetaro` `vertical-tabs`). |
| D-06 | T1 | Regulo für `composes.spacing` | **Abweichung vom PR-Schnitt der TS** (Entscheidung des Orchestrators): `reguloj.json` gehört für diesen Zweck zu PR A. `spacing-owned-by-container` gilt jetzt auch für `vico`, `kolumno`, `stako` (`appliesTo.eroj` und `scope`), eigener Commit. T2 und T4 tun dasselbe für `krado` und `templinio`. PR B fasst `reguloj.json` nicht an. Ändert das die Vertrags-Fixture `packages/mcp/test/fixtures/kontrakto/list_reguloj.json`, gehört auch sie zu PR A (T6 mit `generi.mjs`). |
| D-07 | T1 | Positives/negatives Fixture | Weg des Repos für Regelvarianten ohne eigenen Fixture-Ordner (`mutatedFixture` von `valid/ero-minimal`, wie `skemo-rules.test.ts`): `vico`-Skemo positiv ohne Befund, negativ `skemo-binding-missing` (Pfad `…/vico/skemo.json#/skemo/parts/box/gap`) und `skemo-token-type`. In `src/data/layout-046.test.ts`. |
| D-08 | T1 | Ero-Tokens | `pnpm vortaro:ero-tokenoj` für den Kern (18 neu) und mit `--config` für die gepflegten Aspekto-Hauptsets (`komuna-0-2`, `ekzemplo`, `provo`, `provo-kompakta`, `dukolora`) sowie `invalid/aspekto-incomplete`. Die nicht gepflegten Sets `aspekto-font-declared` und `compose-two-aspektoj` (ohne Ero-Tokens auf `626043f9`) bleiben unverändert. Kern-Token-Zahl unverändert. `neu-seit-main.ts` begründet alle `ero.(vico|kolumno|stako|krado|templinio).*` als neu seit dem Stand von main. |
| D-09 | T1 | Zahlwort | `countWord` bleibt bei „forty“ (`describe.test.ts` pinnt 41 als Ziffern). Der S6-Satz sagt „43 Eroj“; die abgeleiteten Tests lesen `countWord`. |
| D-10 | T1 | Ableitung der Zahlen | Neue Testhilfen `packages/modelo/src/validate/test-doubles/eroj.ts` (`REPO_EROJ`, Ordner unter `data/eroj`) und `packages/mcp/src/test-doubles/eroj.ts` (`REPO_EROJ`, `REPO_GOALS` aus dem geladenen Modelo); in `projekcioj`, `metiejo`, `eroj` je eine Konstante aus den Ordnern. Mitgezählt als „fest erwartete 40 Eroj“: Anzahl, vollständige Namenslisten, Position in Namensordnung, S6-Satz, Zahl der Uzoj, `appliesTo` von `spacing-owned-by-container`, die Goals von `suggest_ero`, die Dateiliste des Web-Component-Celo. |

## Ausnahme-Commits

| Ausnahme | Commit |
|---|---|
| Abweichung D-06: `spacing-owned-by-container` gilt für die Layout-Eroj (`reguloj.json`) | `123d780b` |
| `arangxoj.test.ts:262` und `:315` ohne Layout-Eroj | `781ec764` |
| Eroj-Zahl aus den Daten (modelo, mcp, projekcioj, metiejo, eroj) | `a7f81616` |
| Eroj-Zahl aus den Daten (Make Kit: Dateiliste und Zahl in `make-kit.test.ts`, `publish.test.ts`) | `93b17665` |

## Befunde

| # | Ticket | Befund |
|---|---|---|
| F-T1-1 | T1 | B-1: `packages/modelo/src/docs/docs.test.ts:3654` („every one of the 40 Eroj has its counterpart“) rot, nicht geändert (Wortlaut der Produkt-Spec, keine Maintainer-Entscheidung). |
| F-T1-2 | T1 | B-2: `docs.test.ts:3192` (Spec 026 ②, Tabelle aller Namen, `rows === 45`) rot, nicht geändert. |
| F-T1-3 | T1 | B-3: `projekcioj/src/celoj/vitrino/datumoj.test.ts:413` (`not.toContain("fm-kolumno ")`) ist **schon ab T1 rot**, nicht erst ab T5: die Vitrino zeigt jede Ero des Modelo automatisch. Nicht geändert. |
| F-T1-4 | T1 | Gleiche Wurzel wie B-1 (eingefrorener Abgleich `specs/029-fonto-astryx/abgleich.json`): `projekcioj/src/fonto/komuna-eroj-fonto.test.ts:128` erwartet die 40 Eroj des Abgleichs gleich den Eroj des Modelo. Rot, nicht geändert. |
| F-T1-5 | T1 | Eingefrorener Bezug `packages/modelo/test/fixtures/gvidanto/get-ero-bezug-479c5ad4.json`: `eroj-fields.test.ts:634` verlangt dieselben Ero-Namen wie der Bezug (40). Rot; Kandidat für T6 (Fortschreibung des Vertragsbezugs, nur neue Einträge). |
| F-T1-6 | T1 | Nächste Namen von `get_ero` für „butonno“: `kolumno` verdrängt `menuo` (`modelo/src/gvidanto/eroj.test.ts:197`, `mcp/src/eroj-tools.test.ts:31`). Verhalten korrekt (Levenshtein), die Tests pinnen die Liste. Keine Zahl, darum nicht geändert; Entscheidung nötig. |
| F-T1-7 | T1 | `mcp/src/kontrakto-038.test.ts:101` (Vertragsbezug): neue Einträge von `list_eroj` u. a. → T6 mit `generi.mjs`. |
| F-T1-8 | T1 | **Offen in T1** (generische Sweeps, nicht mehr im Zeitrahmen): Der Figma-Plan zeichnet die Layout-Eroj (Rolle `generic`) als Badge mit ungebundenem Text: `plugin-bauformen-texte.test.ts:36`, `plugin-bauformen-bild.test.ts:228`, `plugin-lauf.test.ts:202/279/538`, `figma.test.ts:800/1068`, `plugin-variablen.test.ts:387/625` (der gedruckte Bericht liegt mit 43 Eroj bei 4 157 > 4 000 Zeichen; die Grenze bleibt). `structureOf` in `figma.ts` braucht eine Erkennung `isLayout` (wie Web und Make Kit) und eine Bauform; ob der Figma-Plan die Layout-Eroj bis T5 auslässt oder T1/T5 eine Bauform bauen, entscheidet der Orchestrator. Ebenso `vitrino/datumoj.test.ts:315` (Karte Ero → Rolle, alle 40 Eroj gepinnt). |
| F-T1-9 | T1 | Gegenprobe auf der Basis nicht nötig: alle übrigen Roten gehen auf die neuen Eroj zurück; „fremd“ (`zweitfarbe-036`, `turbo-inputs`) nicht gelaufen. |
