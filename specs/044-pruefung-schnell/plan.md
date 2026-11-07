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

### CI vorher aus den Traces (T1, gelesen am 2026-11-07)

Alle Artefakte waren abrufbar (Ablauf laut API 2026-11-13). Geladen je Artefakt in ein eigenes, neues, leeres Verzeichnis außerhalb des Repos, nur gelesen: `testberichte-eroj-2-1`, `testberichte-eroj-4-1` und `testberichte-unit-metiejo-1` beider Läufe. Gelesen wurden die Netzwerk-Einträge (`*.network`) der Traces unter `eroj/test-reports/playwright/html/data/*.zip`: Beginn, Methode, Status, Dauer (`time`). „unbeendet“ = die Anfrage lief bei Testende noch. Je Schritt gibt es in CI keine Werte, weil auf `main` keine Messpunkte laufen (Annahme der Implementierungs-Spec): die Schritt-Zeilen „CI vorher“ heißen „–“.

**Lauf 42252367951** (`main` `93b6cae`, `push`):

| Test (Browser) | `/pruefung` | Rahmen `vorschau?…rev=` | `vorschau.css` | weitere |
|---|---|---|---|---|
| `zweitfarbe-036:196` Schnellstart (Chromium) | rev 1: **4443 ms** | rev 1 (`farbe`): 4450 ms, gleichzeitig mit der Prüfung | rev 1: 433 ms (beginnt erst nach der Prüfung) | – |
| `zweitfarbe-036:196` Schnellstart (WebKit) | rev 1: **4492 ms** | rev 1 (`farbe`): 4500 ms | rev 1: 476 ms | – |
| `zweitfarbe-036:129` Assistent (WebKit) | – | rev 1 (`buehne-farbe`): 36 ms; mit `propono`: 6 ms. rev 2: **4340 ms** | rev 1: 958 ms, mit `propono`: 507 ms; rev 2: unbeendet | `GET /asistanto/…/gvidkoloro` 4417 ms (erstes Laden); `GET stato` 1628 ms (hinter dem Rahmen rev 2) |

**Lauf 42180054807** (`f027522`, Befunde von Spec 043):

| Test (Browser) | `/pruefung` | Rahmen `vorschau?…rev=` | `vorschau.css` | weitere |
|---|---|---|---|---|
| `zweitfarbe-036:121` Schnellstart (Chromium) | rev 1: 3706 ms; rev 2: 3667 ms; rev 2 noch einmal: 9 ms; rev 3: **4216 ms** | rev 1: 7 ms, rev 2: 2 bzw. 9 ms; rev 3: 3 ms, dann **4216 ms** (gleichzeitig mit der Prüfung) | rev 1: **4011 ms** (hinter der Prüfung); rev 2: 359 bzw. 493 ms; rev 3: unbeendet | – |
| `zweitfarbe-036:121` Assistent (Chromium) | – | rev 1: 5–6 ms; rev 2: **3696 ms**; rev 3: **3329 ms** | rev 1: 661 ms, mit `propono` 353 ms; rev 2: 296, 645 bzw. 341 ms; rev 3: unbeendet, mit `propono` 271 ms | `GET /asistanto/…` 4270 ms (erstes Laden), 3336 ms (rev 3); `GET stato` **3451 ms** (rev 2) |
| `buehne-navigation-042:200` (Firefox) | – | rev 1 und 2: je 1–3 ms | rev 1: 606/355/339 ms, mit `propono` 321/669/582 ms; rev 2: 408/648 ms, mit `propono` 701/376 ms | `GET /asistanto/…` **5091 ms** (erstes Laden); `GET stato` **3243 ms** (der `stato`-Takt stößt die Prüfung des neuen rev an) |
| `metiejo-036-uebernahme:89` 4.1 (WebKit) | rev 1: **4316 ms** | rev 1 (`farbe`): 4360 ms | rev 1: unbeendet | – |
| `metiejo-036-uebernahme:67` 4.2 (WebKit) | rev 1: **4403 ms** | rev 1 (`farbe`): 4393 ms | rev 1: unbeendet | – |

**Was die Traces zeigen:**
- Wer nach einem neuen `rev` zuerst nach der Prüfung fragt (`/pruefung`, `GET stato`, `GET /asistanto/…`, Rahmen `buehne-*` ohne `propono`), rechnet sie: **3,2–5,1 s** in CI. Eine zweite `/pruefung` desselben `rev` braucht 9 ms (der heutige Ein-Eintrag-Speicher `draft.pruefung` greift).
- Der Rahmen `vorschau?sxtupo=farbe` rechnet die Prüfung nicht (sonst 2–9 ms). Er dauert 4,2–4,5 s nur, weil er im Event-Loop hinter der Prüfung steht. Ebenso `vorschau.css` rev 1 (4011 ms) und `GET stato` (1628 ms) hinter dem Rahmen rev 2. Das bestätigt A-04.
- `vorschau.css` hat keinen Speicher: jede Anfrage rechnet neu, in CI **270–960 ms** je Anfrage, auch für dasselbe `rev` (z. B. rev 1 dreimal: 606, 355, 339 ms).

**Unit-Job `metiejo`** (A-07): Job `Unit tests (metiejo)` im Lauf 42252367951 von 16:26:38 bis 16:34:09 (7,5 min von `timeout-minutes: 15`); Vitest `time="365.204"` s für 557 Tests (Lauf 42180054807: 363 s, 553 Tests).

## Messungen

## Messanleitung

```sh
# G-0: Quelle und Kopie haben dieselbe Größe und denselben Hash
wc -c /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec044/spec.md specs/044-pruefung-schnell/spec.md
shasum -a 256 /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec044/spec.md specs/044-pruefung-schnell/spec.md
git show HEAD:specs/044-pruefung-schnell/spec.md | shasum -a 256

# CI vorher: Traces lesen (nur lesen, je Artefakt ein neues leeres Verzeichnis außerhalb des Repos)
for run in 42252367951 42180054807; do for a in testberichte-eroj-2-1 testberichte-eroj-4-1 testberichte-unit-metiejo-1; do
  d=$(mktemp -d); gh run download $run -R thojank/fundamento -n $a -D "$d"; echo "$run $a → $d"
done; done
# je Trace: eroj/test-reports/playwright/html/data/*.zip; Netz in *.network (JSON je Zeile,
# snapshot.request.url, snapshot.response.status, snapshot.startedDateTime, snapshot.time),
# Titel und Browser in context-options der *.trace
```
