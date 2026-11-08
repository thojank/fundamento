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
| B-7 | `UzoSlot.accepts` kennt kein „beliebig“. | T1, siehe D-04. |
| B-8 | PR A ist eine Kette aus sechs Tickets (gegen „höchstens 3 hintereinander“, `delivery.md`). | Bewusst so geplant; T7 läuft parallel. Abweichung von `delivery.md`. |
| B-9 | `malplena-pagxo.test.ts:113` nutzt „Inhalte anzeigen“ als Fehltreffer. | T6 prüft im roten Lauf. |
| B-10 | `testing.md` nennt ein Skript `pnpm --filter @fundamento/eroj dev`, das es nicht gibt. | QA über `fm projekcioj build` und statischen Server. |
| B-11 | `tabelo/uzo.json` `instead` `layout-grid` → `ero: null`. | Nicht geändert; Befund (Kandidat für die nächste Runde). |

## Entscheidungen

| ID | Ticket | Frage | Wahl und Grund |
|---|---|---|---|
| D-01 | T1 | Quelle | Byte-gleich mit `cp`, Hash wie im Auftrag (G-0). |

## Ausnahme-Commits

| Ausnahme | Commit |
|---|---|

## Befunde

| # | Ticket | Befund |
|---|---|---|
