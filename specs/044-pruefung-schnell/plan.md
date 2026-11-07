# Spec 044 – Metiejo: `/pruefung` und erstes Rendern ohne Blockade – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `5bea3ab5a3d8ec94f9ee7fc5b16b55bdb30ffdfbf65ff767ffcab891f71810aa`) · **Aufgaben:** [`tasks.md`](tasks.md) · **Basis:** `main` `6a3e55e3` (Merge #155, Spec 038 Lauf 4) · **Branch:** `261107-spec-044-schnelle-prfung-65e63e` · **Regel 0** gilt. **Keine Grenzen, Zeitlimits, Schwellen, Abfrageintervalle, Toleranzen oder Wiederholungen angehoben. Nichts gemergt.** Kein Sprachmodell (0 $).

**Datum:** 2026-11-07 · **Stand:** T1 läuft.

### G-0 Quelle

| | Wert |
|---|---|
| Quelle | `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec044/spec.md` |
| Größe der Quelle (`wc -c`) | 4282 Byte |
| SHA-256 laut Auftrag | `5bea3ab5a3d8ec94f9ee7fc5b16b55bdb30ffdfbf65ff767ffcab891f71810aa` |
| SHA-256 der Quelle (2026-11-07, 15:33 Ortszeit, `shasum -a 256`) | `5bea3ab5a3d8ec94f9ee7fc5b16b55bdb30ffdfbf65ff767ffcab891f71810aa` |
| SHA-256 der Kopie `specs/044-pruefung-schnell/spec.md` | `5bea3ab5a3d8ec94f9ee7fc5b16b55bdb30ffdfbf65ff767ffcab891f71810aa` (4282 Byte) |
| Ergebnis | **gleich.** Kopiert mit `cp`, nicht über ein Editor-Werkzeug. |

### Tickets und Dateien

Ein Strang, ein PR, ein Push, genau ein `workflow_dispatch` (Spec, „Begrenzung der Laufzeit“). Die Tickets laufen streng nacheinander: T1 → T2 → T3 → T4 → T5.

| Datei | T1 | T2 | T3 | T4 | T5 |
|---|---|---|---|---|---|
| `specs/044-pruefung-schnell/{spec,plan,tasks}.md` | anlegen | fortschreiben | fortschreiben | fortschreiben | abschließen (vor dem Push) |
| `packages/metiejo/src/messung.ts` | **neu** | benutzen | benutzen | – | – |
| `packages/metiejo/src/servilo.ts`, `vorschau.ts` | nur Messpunkte und Option `messung` | Speicher, Routen `async`, `pruefTor` | Rechner (Worker, Teile) | – | – |
| `packages/metiejo/src/ableitungen.ts` | – | **neu** | nur Rechner | – | – |
| `packages/metiejo/src/antworten-044.test.ts`, `test-doubles/antworten-044.json` | **neu** (Fixture auf `6a3e55e3`) | unverändert | `dist`-Pfad dazu | prüfen | – |
| `packages/metiejo/src/messung-044.test.ts` | **neu** | – | – | ggf. ergänzen | – |
| `packages/metiejo/src/stato-044.test.ts` | **neu, rot** | grün | grün | – | – |
| `packages/metiejo/src/ableitungen-044.test.ts` | – | **neu, rot → grün** | – | ggf. ergänzen | – |
| alles andere | tabu | tabu | tabu | tabu | tabu |

Tabu sind ausdrücklich `.github/**`, Root-Dateien, `packages/metiejo/{package.json,vitest.config.ts,tsconfig*.json}`, `packages/{agordilo,modelo,projekcioj,nordstelo,ekranoj,mcp}/**`, alle Eroj-Tests (auch `packages/eroj/test/zweitfarbe-036.spec.ts`) und der `stato`-Takt in `html.ts`.

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf ist unbeaufsichtigt. Wo die Spec offen ließ, gilt die Annahme. „angewandt“ = so umgesetzt; „offen“ = Ticket steht noch aus.

### Entscheidungen der Technischen Spec (D-01 bis D-05)

| ID | Frage | Entscheidung | Stand |
|---|---|---|---|
| D-01 | Für welche `stato`-Anfrage gilt „< 200 ms während einer Prüfung“? | Für `stato` einer **anderen Marke** und für `stato` eines schon geprüften `rev`. `stato` derselben Marke für den gerade geprüften `rev` **wartet auf dieselbe laufende Prüfung** (rechnet nicht doppelt) und bleibt byte-gleich. Vom Maintainer am 2026-11-07 bestätigt. | offen (T2) |
| D-02 | Darf T3 `packages/agordilo` ändern? | **Nein.** Reicht T2 nicht, rechnet T3 die Prüfung in einem Worker (`node:worker_threads`). Vom Maintainer am 2026-11-07 bestätigt. | offen (T3) |
| D-03 | Wie wird gemessen, ohne Antworten und `.github/**` zu ändern? | `packages/metiejo/src/messung.ts` mit `performance.now()` und einer optionalen Senke `ServiloOptions.messung`. Ohne Senke keine Ausgabe, kein anderes Verhalten. Lokal und in CI misst `messung-044.test.ts`; er prüft nur die Form. | offen (T1) |
| D-04 | Was heißt „byte-gleich“? | Körper, Statuscode und `content-type` jeder Antwort. Keine neuen Header. | offen (T1 Fixture, T4 Nachweis) |
| D-05 | Wie wird „rot zuerst“ für den `stato`-Test ohne Uhr erreicht? | Beleg ist die Reihenfolge: Prüfung A gestartet und über `pruefTor` festgehalten, `stato` B gesendet, `stato` B antwortet vor Prüfung A. | offen (T1 rot) |

### Befunde und Entscheidungen der Implementierungs-Spec (A-01 bis A-10)

| ID | Befund (Stand `6a3e55e3`) | Entscheidung | Stand |
|---|---|---|---|
| A-01 | Kopien teilen den `rev`: `buehneOf` (`servilo.ts:691–704`) baut `kopio: { agordo, rev: draft.rev }` mit anderem `agordo`; sie läuft über `laborejoOf` durch `pruefungOf`. | Der Prüf-Eintrag hängt weiter **am `Draft`-Objekt**. Für den gehaltenen Entwurf einer Marke ist das gleichbedeutend mit „Marke + `rev`“; Kopien behalten ihren eigenen Eintrag. Beleg in `ableitungen-044.test.ts`. | offen (T2) |
| A-02 | CSS mit `propono` ändert sich ohne neuen `rev` (`proponoOfBuehne` schreibt ohne `setDraft`); `?rev=` hat in `vorschau.css` keine Wirkung. | CSS-Speicher je Marke: `rev` und je `propono` (`""` = ohne) **ein** Eintrag mit der kanonischen Form des gezeigten `Agordo`; Treffer nur bei gleichem `rev` **und** gleicher Form. `?rev=` bleibt ohne Wirkung. | offen (T2) |
| A-03 | Mehr synchrone Aufrufer von `pruefungOf` als genannt: `statoOf` (über `/asistanto/…`, `stato`, `faceto`, Chat-Züge), Studio-GET, Komponenten-Seite, `fertig`, `festlegen`, `Laborejo.probleme()`/`pruefung()`. Das Neuladen `GET /asistanto/…` (3336 ms im Trace von Spec 043) stößt die Prüfung selbst an. | Alle Anfragepfade warten auf die **geteilte** Prüfung. Chat-Züge dürfen synchron bleiben, wenn sie vorher die geteilte Prüfung abwarten. Kopien rechnen selbst (A-01). Ob `Laborejo` asynchron wird, entscheidet T2. | offen (T2) |
| A-04 | `vorschau.css` und `vorschau?sxtupo=<nicht buehne-*>` rufen `pruefungOf` nicht auf; die „Abhängigkeit“ in Spec 043 ist die Serialisierung im Event-Loop. | „Trennung“ heißt: keine Route wartet auf Arbeit, die sie nicht braucht, und Prüfung und Kalt-Render stehen nicht in **derselben** seriellen Warteschlange. | offen (T2/T3) |
| A-05 | `derivationBasis` baut je Aufruf den Struktur-Modelo neu (`structureModelo`, `agordilo/src/calibration.ts:117`), in `previewCss` **und** in `deriveAspekto`. | `agordilo` bleibt unverändert (D-02). Ist der Anteil groß, steht er als Befund mit Werten im Bericht (Kandidat Folge-Spec). | Messung T1 unten |
| A-06 | Ein `Worker` auf die TS-Quelle startet unter Vitest nicht ohne neue Abhängigkeit. | Falls T3 einen Worker einführt: synchroner Fallback mit derselben Funktion unter Vitest; Worker-Pfad belegt ein Test gegen `dist/`. | offen (T3) |
| A-07 | CI-Budget: `Unit tests (metiejo)` brauchte im Lauf 42252367951 7,5 von 15 min; Vitest `testTimeout` 120 s je Test. | Grenzen bleiben. Jeder Messdurchlauf ist ein eigenes `it`. Lokal N = 10; N in CI als Parameter mit Rechnung (Abschnitt Messungen). | angewandt (T1) |
| A-08 | „Kein Push nach dem Dispatch“ gegen „CI nachher in `plan.md`“. | Die Spalte „CI nachher“ verweist auf den **PR-Kommentar** (T5). | offen (T5) |
| A-09 | Der Sperrpfad aus Spec 042 V-1 gibt es nicht mehr. | Sperre `mkdir /Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mw6h7yq8m04k3mrx/.lauf-sperre` mit `besitzer.txt`; zu jeder Messung `uptime` davor und danach und die Liste fremder Test-Prozesse. Unter Fremdlast nur „zur Information“. | angewandt (T1) |
| A-10 | Pipeline-Regel „letztes Ticket = Test-Ticket“ gegen die Reihenfolge der Quelle. | Die Quelle gilt: **T4 ist das Test-Ticket**, T5 ändert keinen Code. | offen (T4) |

### Entscheidungen aus dem Lauf (D-06 ff.)

| ID | Ticket | Frage | Annahme | Stand |
|---|---|---|---|---|

## Befunde

## Messungen

## Messanleitung

```sh
# G-0: Quelle und Kopie haben dieselbe Größe und denselben Hash
wc -c /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec044/spec.md specs/044-pruefung-schnell/spec.md
shasum -a 256 /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec044/spec.md specs/044-pruefung-schnell/spec.md
git show HEAD:specs/044-pruefung-schnell/spec.md | shasum -a 256
```
