# Spec 044 – Metiejo: `/pruefung` und erstes Rendern ohne Blockade – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `5bea3ab5a3d8ec94f9ee7fc5b16b55bdb30ffdfbf65ff767ffcab891f71810aa`) · **Aufgaben:** [`tasks.md`](tasks.md) · **Basis:** `main` `6a3e55e3` (Merge #155, Spec 038 Lauf 4) · **Branch:** `261107-spec-044-schnelle-prfung-65e63e` · **Regel 0** gilt. **Keine Grenzen, Zeitlimits, Schwellen, Abfrageintervalle, Toleranzen oder Wiederholungen angehoben. Nichts gemergt.** Kein Sprachmodell (0 $).

**Datum:** 2026-11-07 · **Stand:** T1 fertig (Messung vorher, Fixture, roter `stato`-Test); T2 offen.

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
| D-03 | Wie wird gemessen, ohne Antworten und `.github/**` zu ändern? | `packages/metiejo/src/messung.ts` mit `performance.now()` und einer optionalen Senke `ServiloOptions.messung`. Ohne Senke keine Ausgabe, kein anderes Verhalten. Lokal und in CI misst `messung-044.test.ts`; er prüft nur die Form. `ci.yml` lädt `packages/*/test-reports/` schon hoch (`testberichte-unit-metiejo-<attempt>`), also auch `messung-044.json`. | angewandt (`63f1e56a`, `4b0b03cd`) |
| D-04 | Was heißt „byte-gleich“? | Körper, Statuscode und `content-type` jeder Antwort. Keine neuen Header. | Fixture angewandt (`87888366`); Nachweis T4 |
| D-05 | Wie wird „rot zuerst“ für den `stato`-Test ohne Uhr erreicht? | Beleg ist die Reihenfolge: Prüfung A gestartet und über `pruefTor` festgehalten, `stato` B gesendet, `stato` B antwortet vor Prüfung A. | rot (T1); grün offen (T2) |

### Befunde und Entscheidungen der Implementierungs-Spec (A-01 bis A-10)

| ID | Befund (Stand `6a3e55e3`) | Entscheidung | Stand |
|---|---|---|---|
| A-01 | Kopien teilen den `rev`: `buehneOf` (`servilo.ts:691–704`) baut `kopio: { agordo, rev: draft.rev }` mit anderem `agordo`; sie läuft über `laborejoOf` durch `pruefungOf`. | Der Prüf-Eintrag hängt weiter **am `Draft`-Objekt**. Für den gehaltenen Entwurf einer Marke ist das gleichbedeutend mit „Marke + `rev`“; Kopien behalten ihren eigenen Eintrag. Beleg in `ableitungen-044.test.ts`. | offen (T2) |
| A-02 | CSS mit `propono` ändert sich ohne neuen `rev` (`proponoOfBuehne` schreibt ohne `setDraft`); `?rev=` hat in `vorschau.css` keine Wirkung. | CSS-Speicher je Marke: `rev` und je `propono` (`""` = ohne) **ein** Eintrag mit der kanonischen Form des gezeigten `Agordo`; Treffer nur bei gleichem `rev` **und** gleicher Form. `?rev=` bleibt ohne Wirkung. | offen (T2) |
| A-03 | Mehr synchrone Aufrufer von `pruefungOf` als genannt: `statoOf` (über `/asistanto/…`, `stato`, `faceto`, Chat-Züge), Studio-GET, Komponenten-Seite, `fertig`, `festlegen`, `Laborejo.probleme()`/`pruefung()`. Das Neuladen `GET /asistanto/…` (3336 ms im Trace von Spec 043) stößt die Prüfung selbst an. | Alle Anfragepfade warten auf die **geteilte** Prüfung. Chat-Züge dürfen synchron bleiben, wenn sie vorher die geteilte Prüfung abwarten. Kopien rechnen selbst (A-01). Ob `Laborejo` asynchron wird, entscheidet T2. | offen (T2) |
| A-04 | `vorschau.css` und `vorschau?sxtupo=<nicht buehne-*>` rufen `pruefungOf` nicht auf; die „Abhängigkeit“ in Spec 043 ist die Serialisierung im Event-Loop. | „Trennung“ heißt: keine Route wartet auf Arbeit, die sie nicht braucht, und Prüfung und Kalt-Render stehen nicht in **derselben** seriellen Warteschlange. | offen (T2/T3) |
| A-05 | `derivationBasis` baut je Aufruf den Struktur-Modelo neu (`structureModelo`, `agordilo/src/calibration.ts:117`), in `previewCss` **und** in `deriveAspekto`. | `agordilo` bleibt unverändert (D-02). Ist der Anteil groß, steht er als Befund mit Werten im Bericht (Kandidat Folge-Spec). | Befund B-2: klein (≈ 7 % von `derivationBasis`) |
| A-06 | Ein `Worker` auf die TS-Quelle startet unter Vitest nicht ohne neue Abhängigkeit. | Falls T3 einen Worker einführt: synchroner Fallback mit derselben Funktion unter Vitest; Worker-Pfad belegt ein Test gegen `dist/`. | offen (T3) |
| A-07 | CI-Budget: `Unit tests (metiejo)` brauchte im Lauf 42252367951 7,5 von 15 min; Vitest `testTimeout` 120 s je Test. | Grenzen bleiben. Jeder Messdurchlauf ist ein eigenes `it`. Lokal N = 10; N in CI als Parameter mit Rechnung (Abschnitt Messungen). | angewandt (T1) |
| A-08 | „Kein Push nach dem Dispatch“ gegen „CI nachher in `plan.md`“. | Die Spalte „CI nachher“ verweist auf den **PR-Kommentar** (T5). | offen (T5) |
| A-09 | Der Sperrpfad aus Spec 042 V-1 gibt es nicht mehr. | Sperre `mkdir /Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mw6h7yq8m04k3mrx/.lauf-sperre` mit `besitzer.txt`; zu jeder Messung `uptime` davor und danach und die Liste fremder Test-Prozesse. Unter Fremdlast nur „zur Information“. | angewandt (T1) |
| A-10 | Pipeline-Regel „letztes Ticket = Test-Ticket“ gegen die Reihenfolge der Quelle. | Die Quelle gilt: **T4 ist das Test-Ticket**, T5 ändert keinen Code. | offen (T4) |

### Entscheidungen aus dem Lauf (D-06 ff.)

| ID | Ticket | Frage | Annahme | Stand |
|---|---|---|---|---|
| D-06 | T1 | Wie entsteht die Fixture, und was wird normalisiert (V-4, R-3)? | `antworten-044.test.ts` schreibt sie nur mit `FM_ANTWORTEN_044=schreiben`, einmal auf dem unveränderten `6a3e55e3` (vor jeder Änderung an `servilo.ts`/`vorschau.ts`); ohne die Variable vergleicht er. **Keine Normalisierung** (`"normalisierung": []`): Ein Probelauf mit allen 66 Körpern im Klartext (Wegwerf-Test, nicht committet) zeigte weder den Arbeitsordner noch ein Datum oder eine Uhrzeit, und zwei Läufe ergaben dieselben Bytes. Fester Ablauf und Fälle: `packages/metiejo/src/test-doubles/servilo-044.ts` (Marken `lumeta`, Basis `leer`, und `brikola`, Basis `komuna`; rev 2 Leitfarbe `#336699`, rev 3 Zweitfarbe `#17b3a8`; Vorschlag `gvidkoloro` mit Leitfarbe `#7a3e9d` bei rev 3 von A; alles erfunden). | angewandt |
| D-07 | T1 | Welcher Code gehört zu welchem Schritt (V-2)? | `marke-laden` = `draftOf`, bei `vorschau`/`vorschau.css` dazu `shown()` (liest die offenen Vorschläge von der Platte). `ableitung+pruefung` = `checkDraft` in `pruefungOf`, nur wenn gerechnet wird. `vorschau.css`: `ableitung` = `derivationBasis` + `packageDocuments`, `projektion` = `composeFiles` + `buildModelo`, `css-js` = `CSS_CELO.generate`. `vorschau`: `css-js` = `previewDocument` samt `previewBody` und `pruefungHtml`. `/pruefung`: `css-js` = `klartextOf` + `klartextHtml`. `stato` und `asistanto`: `marke-laden` und `ableitung+pruefung` (über `statoOf`). Ein Schritt in einem anderen (die Prüfung im Rahmen `buehne-*`) zählt nur für sich, der äußere Schritt wird um ihn gekürzt. Ohne Schritt, nur in `gesamt`: `modeloOf()` (Struktur-Modelo, einmal je Server), Kroniko, `zaehlilo`, die Seite des Assistenten. | angewandt (`63f1e56a`) |
| D-08 | T1 | Was zeigt `warten` vor dem Fix? | `warten` misst ab dem Eingang in `handle`. Steht der Event-Loop, liest der Server die Anfrage erst danach: Diese Blockade liegt **vor** `handle` und ist in `warten` nicht zu sehen (auf `6a3e55e3` ist `warten` ≈ 0). Sie zeigt sich in den Traces (Sicht des Browsers) und im `stato`-Test. Nach T2 misst `warten` das Warten auf die geteilte Prüfung. | angewandt |
| D-09 | T1 | Wie bekommt `stato-044` das Tor, solange `ServiloOptions` es nicht kennt (V-3)? | Der Test übergibt `{ messung, pruefTor }` mit der Typzusicherung `as Partial<ServiloOptions>`. Auf dem Stand nach T1 wird das Tor nie gerufen (rot). T2 legt `pruefTor` nach V-3 in `ServiloOptions` an; der Test bleibt unverändert (AC-5). | angewandt |
| D-10 | T1 | Woran sieht `stato-044` Fall 2 ohne Uhr, dass der `stato` von A beim Server angekommen ist, bevor das Tor öffnet? | Nach dem `stato` von A sendet der Test einen `stato` von B auf eigener Verbindung und wartet auf **dessen** Antwort (B ist geprüft, antwortet also während das Tor hält). Erst dann öffnet er das Tor. Erwartet: `["stato B", "freigabe", …]`, danach `pruefung A` und `stato A` in beliebiger Reihenfolge. Dass der Server zwei Verbindungen in der Reihenfolge ihres Eingangs liest, ist auf dem Loopback die Regel, aber nicht garantiert; liest er den `stato` von A erst nach der Freigabe, ist der Reihenfolge-Teil schwächer, nie falsch rot. Den Kern prüft der Test unabhängig von der Reihenfolge: genau **ein** `ableitung+pruefung` für (A, rev) in der Senke und genau ein Aufruf des Tors. | angewandt |
| D-11 | T1 | Wie groß ist N in CI (A-07)? | **N = 3**, Rechnung unter Messungen › „N in CI“. Lokal N = 10. | angewandt |

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

### Aus dem Lauf (T1)

| ID | Befund | Folge |
|---|---|---|
| B-1 | **Die Prüfung ist ein einziger synchroner Block von 1,6 s** (lokal, `ableitung+pruefung` Median 1623 ms, Max 1862 ms; CI ≈ 3,7–4,5 s aus den Traces). Ein Speicher hilft der **ersten** Anfrage eines neuen `rev` nicht, und solange `checkDraft` im Haupt-Thread läuft, wartet jede andere Anfrage bis zu 1,6 s (R-1). | Für T2/T3: Das Ziel „`stato` < 200 ms während einer Prüfung“ ist mit einem Speicher allein nicht zu erreichen, wenn die Prüfung im Haupt-Thread rechnet; das spricht für T3 (Worker). „`/pruefung` < 1 s im Median“ ist für den ersten Aufruf eines `rev` ohne Eingriff in `agordilo` voraussichtlich nicht erreichbar (Befund mit Werten, AC-2). |
| B-2 | **A-05 ist klein.** Je Lauf einzeln gemessen: `derivationBasis` 77,2 ms (Max 81,2), davon der Teil, der nur von der Struktur abhängt (`structureModelo` + `floorsOf` + `modeOverrides` + `gestaltBasis`) 5,1 ms (Max 13,1), `structureModelo` allein 3,9 ms (Max 4,7). Das sind ≈ 7 % von `derivationBasis` und < 0,5 % einer Prüfung. | Kein Kandidat für eine Folge-Spec aus diesem Grund. Der Rest von `ableitung` (≈ 90 ms je CSS-Anfrage) ist die Ableitung der Paletten selbst; T2 rechnet sie je `rev` und `propono` nur einmal. |
| B-3 | **`vorschau.css` hat keinen Speicher**: Kalt und warm kosten gleich viel (Median 142,5 bzw. 132,8 ms lokal; CI 270–960 ms je Anfrage). Die Rahmen selbst (`vorschau?sxtupo=…`) kosten < 1 ms, wenn die Prüfung im Speicher liegt. | T2: CSS-Speicher nach A-02. |
| B-4 | **Fehlerweg von `vorschau.css` (für T2):** Die Route ruft `writeHead(200, …)` **vor** `previewCss(…)` (`servilo.ts`, Route `vorschau.css`). Wirft die Ableitung, ist der Header schon gesetzt (`headersSent`), und der Server-`catch` beendet die Antwort mit **200 und leerem Körper**, nicht mit 500. Die Messpunkte erhalten diese Reihenfolge. | T2 muss genau diese Fehlerantwort erhalten (V-5, 2: „derselbe Fehler wie heute“) oder die Abweichung als Entscheidung mit Begründung in plan.md führen. |
| B-5 | `warten` ist auf `6a3e55e3` überall ≈ 0 (D-08): Die Blockade liegt vor `handle`. In den Ende-zu-Ende-Traces lokal dauert der Rahmen hinter einer Prüfung 1568–3205 ms, obwohl seine eigene Arbeit < 1 ms ist; `GET stato` hinter einem Rahmen 423 bzw. 776 ms. | Der Beleg „`stato` während einer Prüfung“ kommt aus `stato-044` (Reihenfolge) und in T2 aus einer Messung von außen (`stato` B, während A rechnet). |

## Messungen

### Lokal vorher (T1, `messung-044.test.ts`)

**Rechner:** Apple M1 Max, 10 Kerne, macOS 26.5.1 (25F80), Node v24.21.0. **Code:** `63f1e56a` (= `6a3e55e3` + Messpunkte, Antworten byte-gleich), gemessen auf `4b0b03cd`. **Zeit:** 2026-11-07, 15:46–15:48 Ortszeit, unter der Sperre (A-09). **N = 10** Durchläufe des festen Ablaufs (2 Marken × rev 1–3, jede Anfrage kalt und warm): n = 60 je Zeile, mit Vorschlag n = 10. **Last:** `uptime` vorher 5,56 / nachher 6,80 (1 min). Fremde Test-Prozesse: Die Liste nach V-1 hat Treffer, aber nur **ruhende** Prozesse (Playwright-MCP und sechs alte Metiejo-Server aus `/private/tmp/s035-t3`, je 0,0 % CPU); die Grundlast kommt von Desktop-Programmen (WindowServer, p0, Claude, Figma). Keine fremde Test-Last; die Werte gelten unter dieser Grundlast (für den Vergleich nachher dieselbe Lage nennen).

In ms, Median / Max. „kalt“ = erste Anfrage nach dem `rev`-Wechsel, „warm“ = dieselbe noch einmal. Im Ablauf kommt `POST /pruefung` als erste Anfrage eines `rev`; `stato` und der Rahmen `buehne-*` finden die Prüfung danach im heutigen Ein-Eintrag-Speicher (`draft.pruefung`).

| Route | Schritt | lokal kalt | lokal warm | CI vorher |
|---|---|---|---|---|
| `POST /pruefung` | `marke-laden` | 0 / 0 | 0 / 0 | – |
| | `ableitung+pruefung` | **1623 / 1862** | – (im Speicher) | – |
| | `css-js` (`klartextOf` + `klartextHtml`) | 0 / 0,3 | 0 / 0,1 | – |
| | `warten` | 0 / 0,2 | 0 / 0,2 | – |
| | **gesamt** | **1623 / 1863** | 0,2 / 0,4 | 3667–4492 (Traces) |
| `GET stato` (Prüfung im Speicher) | gesamt | 0,3 / 9,9 | 0,2 / 0,5 | 1–3; mit Prüfung 3243–3451; hinter einem Rahmen 1628 |
| `GET vorschau?sxtupo=farbe` | `css-js` | 0,1 / 7,0 | 0,1 / 0,2 | – |
| | gesamt | 0,2 / 7,5 | 0,2 / 0,4 | 2–9; hinter einer Prüfung 4216–4500 |
| `GET vorschau?sxtupo=buehne-farbe` (Prüfung im Speicher) | gesamt | 0,2 / 0,4 | 0,2 / 0,4 | 1–36; mit Prüfung des neuen `rev` 3329–4340 |
| `GET vorschau…` mit Vorschlag (`farbe` / `buehne-farbe`) | gesamt | 0,6 / 0,7 bzw. 0,3 / 0,5 | 0,3 / 0,5 bzw. 0,3 / 0,4 | 1–6 |
| `GET vorschau.css` | `marke-laden` | 0 / 0 | 0 / 0 | – |
| | `ableitung` | 95,0 / 135,0 | 90,7 / 132,1 | – |
| | `projektion` | 9,2 / 15,3 | 6,2 / 14,6 | – |
| | `css-js` | 32,9 / 43,0 | 31,3 / 59,7 | – |
| | `warten` | 0 / 0,1 | 0 / 0,1 | – |
| | **gesamt** | **142,5 / 176,9** | 132,8 / 177,5 | 270–960; hinter einer Prüfung 4011 |
| `GET vorschau.css` mit Vorschlag | gesamt | 139,0 / 142,8 | 138,0 / 149,6 | 271–701 |
| einzeln (A-05) | `derivationBasis` / Struktur-Anteil / `structureModelo` | 77,2 / 81,2 · 5,1 / 13,1 · 3,9 / 4,7 | | – |

„Erstes Rendern“ eines neuen `rev` = Rahmen + `vorschau.css` kalt: lokal ≈ 143 ms, solange keine Prüfung im Weg steht; der Rahmen `buehne-*` ohne Vorschlag braucht beim ersten Mal die Prüfung (1,6 s). Die vollständigen Zahlen stehen in `packages/metiejo/test-reports/messung-044.json` (nicht eingecheckt), je Schritt eine Zeile im Log.

**Ende-zu-Ende lokal vorher** (`zweitfarbe-036.spec.ts` allein, je Engine einmal, `--trace on`, gleiche Sperre, `uptime` 7,46 → 8,26 bzw. 8,26 → 10,79): Chromium 5/5 grün in 14,9 s, WebKit 5/5 grün in 18,8 s. Aus den Traces (fünf Tests mit je eigenem Server laufen gleichzeitig):

| | Chromium | WebKit |
|---|---|---|
| erstes `POST /pruefung` bzw. `GET /asistanto/…` (rev 1, fünf Server zugleich) | 2757–2899 ms | 3014–3511 ms |
| `POST /pruefung` neuer `rev` | 1676–1792 ms | 1692–1805 ms |
| Rahmen `vorschau?…` hinter der Prüfung | 1568–2841 ms | 1684–3205 ms |
| `GET stato` hinter einem Rahmen | 423 ms | 776 ms |
| `vorschau.css` | 124–883 ms | 123–673 ms |

### N in CI (A-07, D-11)

`messung-044` läuft in CI mit **N = 3** (Parameter in der Datei: lokal 10, mit `CI` gesetzt 3; `FM_MESSUNG_044_N` überschreibt für Probeläufe). Rechnung: lokal kostet ein Durchlauf ≈ 12,1 s (121,2 s für N = 10), mit dem Faktor CI/lokal ≈ 2,6 aus Spec 043 ≈ 31 s. N = 3 ≈ 95 s; dazu `antworten-044` (lokal 14,5 s → ≈ 38 s) und `stato-044` (lokal ≈ 7 s → ≈ 18 s, ab T2 ähnlich): zusammen ≈ 2,5 min. Der Job brauchte 7,5 von 15 min (Puffer 7,5 min); danach ≈ 10 min, Puffer ≈ 5 min. N = 10 kostete in CI ≈ 6 min und ließe ≈ 1,5 min Puffer – zu knapp. Keine Grenze wird geändert.

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

# Maschinen-Sperre (V-1) um jeden Bau, Test und jede Messung; uptime und fremde Test-Prozesse davor und danach
L=/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mw6h7yq8m04k3mrx/.lauf-sperre
mkdir "$L" && printf '%s\n%s\n%s\n' "<Ticket>" "<Befehl>" "$(date -u +%FT%TZ)" > "$L/besitzer.txt"
uptime; ps -Ao pid,pcpu,command | grep -E 'vitest|playwright|node .*cli/dist' | grep -v fundamento-wt-mw6h7yq8m04k3mrx
# … Befehl …
rm -r "$L"

# Byte-Fixture (nur einmal, auf 6a3e55e3 erzeugt; danach nur vergleichen)
cd packages/metiejo
FM_ANTWORTEN_044=schreiben FM_AUSGABE=knapp pnpm exec vitest run src/antworten-044.test.ts   # nur T1
FM_AUSGABE=knapp pnpm exec vitest run src/antworten-044.test.ts
git check-ignore -v src/test-doubles/antworten-044.json   # leer

# Messung lokal (N = 10; FM_MESSUNG_044_N setzt N für einen Probelauf), Bericht in test-reports/messung-044.json
pnpm turbo run build --filter=@fundamento/metiejo...
FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo exec vitest run src/messung-044.test.ts

# Ende-zu-Ende-Bild (je Engine einmal, eine Suite zur Zeit), Traces mit --trace on aus test-results/
pnpm turbo run build --filter=@fundamento/cli...
cd packages/eroj
for e in chromium webkit; do
  FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=$e pnpm exec playwright test test/zweitfarbe-036.spec.ts --trace on
done

# Roter stato-Test (T1), grün ab T2
cd packages/metiejo && FM_AUSGABE=knapp pnpm exec vitest run src/stato-044.test.ts
```
