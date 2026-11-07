# Spec 044 – Metiejo: `/pruefung` und erstes Rendern ohne Blockade – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `5bea3ab5a3d8ec94f9ee7fc5b16b55bdb30ffdfbf65ff767ffcab891f71810aa`) · **Aufgaben:** [`tasks.md`](tasks.md) · **Basis:** `main` `6a3e55e3` (Merge #155, Spec 038 Lauf 4) · **Branch:** `261107-spec-044-schnelle-prfung-65e63e` · **Regel 0** gilt. **Keine Grenzen, Zeitlimits, Schwellen, Abfrageintervalle, Toleranzen oder Wiederholungen angehoben. Nichts gemergt.** Kein Sprachmodell (0 $).

**Datum:** 2026-11-07 · **Stand:** T1 fertig (Messung vorher, Fixture, roter `stato`-Test); T2 fertig (geteilter Speicher, Routen asynchron, Messung „nach T2“); T3 fertig (Prüfung im Worker-Thread, Stylesheet in Teilen, Messung „nach T3“).

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
| `packages/metiejo/src/messung.ts` | **neu** | `warten` für geteilte Rechnungen (D-16) | `schrittBisFertig` (D-21) | – | – |
| `packages/metiejo/src/servilo.ts`, `vorschau.ts` | nur Messpunkte und Option `messung` | Speicher, Routen `async`, `pruefTor` | Rechner (Worker, Teile) | – | – |
| `packages/metiejo/src/ableitungen.ts` | – | **neu** | nur Rechner (`pruefRechnungOf`, D-18) | – | – |
| `packages/metiejo/src/pruefung-worker.ts` | – | – | **neu** (Worker-Modul, D-18) | – | – |
| `packages/metiejo/src/pruefung-worker-044.test.ts`, `test-doubles/servilo-044.ts` | – (`servilo-044.ts` neu in T1) | – | **neu, rot → grün** (`dist`-Pfad, D-20); `startServiloDist`, `FM_SERVILO_044=dist` (D-23) | ggf. ergänzen | – |
| `packages/metiejo/src/antworten-044.test.ts`, `test-doubles/antworten-044.json` | **neu** (Fixture auf `6a3e55e3`) | unverändert | unverändert; `dist`-Pfad in `pruefung-worker-044` (D-23) | prüfen | – |
| `packages/metiejo/src/messung-044.test.ts` | **neu** | angepasst (D-16, D-17) | Server aus `dist` (D-23) | ggf. ergänzen | – |
| `packages/metiejo/src/stato-044.test.ts` | **neu, rot** | grün | grün, unverändert (auch auf `dist`) | – | – |
| `packages/metiejo/src/ableitungen-044.test.ts` | – | **neu, rot → grün** | – | ggf. ergänzen | – |
| alles andere | tabu | tabu | tabu | tabu | tabu |

Tabu sind ausdrücklich `.github/**`, Root-Dateien, `packages/metiejo/{package.json,vitest.config.ts,tsconfig*.json}`, `packages/{agordilo,modelo,projekcioj,nordstelo,ekranoj,mcp}/**`, alle Eroj-Tests (auch `packages/eroj/test/zweitfarbe-036.spec.ts`) und der `stato`-Takt in `html.ts`.

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf ist unbeaufsichtigt. Wo die Spec offen ließ, gilt die Annahme. „angewandt“ = so umgesetzt; „offen“ = Ticket steht noch aus.

### Entscheidungen der Technischen Spec (D-01 bis D-05)

| ID | Frage | Entscheidung | Stand |
|---|---|---|---|
| D-01 | Für welche `stato`-Anfrage gilt „< 200 ms während einer Prüfung“? | Für `stato` einer **anderen Marke** und für `stato` eines schon geprüften `rev`. `stato` derselben Marke für den gerade geprüften `rev` **wartet auf dieselbe laufende Prüfung** (rechnet nicht doppelt) und bleibt byte-gleich. Vom Maintainer am 2026-11-07 bestätigt. | angewandt (T2, `5bcda814`): `stato` derselben Marke wartet auf das geteilte Promise (`stato-044` Fall 2) |
| D-02 | Darf T3 `packages/agordilo` ändern? | **Nein.** Reicht T2 nicht, rechnet T3 die Prüfung in einem Worker (`node:worker_threads`). Vom Maintainer am 2026-11-07 bestätigt. | angewandt (T3, `9e6060b6`): `agordilo` unverändert, Prüfung im Worker (D-18) |
| D-03 | Wie wird gemessen, ohne Antworten und `.github/**` zu ändern? | `packages/metiejo/src/messung.ts` mit `performance.now()` und einer optionalen Senke `ServiloOptions.messung`. Ohne Senke keine Ausgabe, kein anderes Verhalten. Lokal und in CI misst `messung-044.test.ts`; er prüft nur die Form. `ci.yml` lädt `packages/*/test-reports/` schon hoch (`testberichte-unit-metiejo-<attempt>`), also auch `messung-044.json`. | angewandt (`63f1e56a`, `4b0b03cd`) |
| D-04 | Was heißt „byte-gleich“? | Körper, Statuscode und `content-type` jeder Antwort. Keine neuen Header. | Fixture angewandt (`87888366`); Nachweis T4 |
| D-05 | Wie wird „rot zuerst“ für den `stato`-Test ohne Uhr erreicht? | Beleg ist die Reihenfolge: Prüfung A gestartet und über `pruefTor` festgehalten, `stato` B gesendet, `stato` B antwortet vor Prüfung A. | rot (T1); grün in T2 (`5bcda814`), Test unverändert |

### Befunde und Entscheidungen der Implementierungs-Spec (A-01 bis A-10)

| ID | Befund (Stand `6a3e55e3`) | Entscheidung | Stand |
|---|---|---|---|
| A-01 | Kopien teilen den `rev`: `buehneOf` (`servilo.ts:691–704`) baut `kopio: { agordo, rev: draft.rev }` mit anderem `agordo`; sie läuft über `laborejoOf` durch `pruefungOf`. | Der Prüf-Eintrag hängt weiter **am `Draft`-Objekt**. Für den gehaltenen Entwurf einer Marke ist das gleichbedeutend mit „Marke + `rev`“; Kopien behalten ihren eigenen Eintrag. Beleg in `ableitungen-044.test.ts`. | angewandt (T2, `5bcda814`): `PruefEintrag` an `Draft`, Beleg `ableitungen-044` (e) |
| A-02 | CSS mit `propono` ändert sich ohne neuen `rev` (`proponoOfBuehne` schreibt ohne `setDraft`); `?rev=` hat in `vorschau.css` keine Wirkung. | CSS-Speicher je Marke: `rev` und je `propono` (`""` = ohne) **ein** Eintrag mit der kanonischen Form des gezeigten `Agordo`; Treffer nur bei gleichem `rev` **und** gleicher Form. `?rev=` bleibt ohne Wirkung. | angewandt (T2, `5bcda814`): `cssSpeicherOf`, Beleg `ableitungen-044` (f); Abschluss siehe D-15 |
| A-03 | Mehr synchrone Aufrufer von `pruefungOf` als genannt: `statoOf` (über `/asistanto/…`, `stato`, `faceto`, Chat-Züge), Studio-GET, Komponenten-Seite, `fertig`, `festlegen`, `Laborejo.probleme()`/`pruefung()`. Das Neuladen `GET /asistanto/…` (3336 ms im Trace von Spec 043) stößt die Prüfung selbst an. | Alle Anfragepfade warten auf die **geteilte** Prüfung. Chat-Züge dürfen synchron bleiben, wenn sie vorher die geteilte Prüfung abwarten. Kopien rechnen selbst (A-01). Ob `Laborejo` asynchron wird, entscheidet T2. | entschieden (T2, D-12): `Laborejo` bleibt synchron |
| A-04 | `vorschau.css` und `vorschau?sxtupo=<nicht buehne-*>` rufen `pruefungOf` nicht auf; die „Abhängigkeit“ in Spec 043 ist die Serialisierung im Event-Loop. | „Trennung“ heißt: keine Route wartet auf Arbeit, die sie nicht braucht, und Prüfung und Kalt-Render stehen nicht in **derselben** seriellen Warteschlange. | T2 angewandt (nur `buehne-*` ohne Vorschlag wartet auf die Prüfung, `vorschau.css` auf den CSS-Speicher); Event-Loop: T3 |
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
| D-12 | T2 | A-03: Wird `Laborejo` (`asistanto/iloj.ts`) asynchron? | **Nein.** `iloj.ts` bleibt unverändert. `probleme()` und `pruefung()` des `Laborejo` lesen über `pruefungJetzt` das fertige geteilte Ergebnis des `rev`; fehlt es, rechnen sie wie heute synchron und tragen es für diesen `rev` ein (keine zweite Rechnung danach). Der Chat-Zug (`chatTurn`) und der Zug der Einstiegsfragen (`kreilo`) warten **vor** `babili` auf die geteilte Prüfung des Entwurfs; ein Fehler wird dort nicht geworfen (`.catch`), er bleibt, wo er heute auftritt (wenn ein Werkzeug oder die Antwort die Prüfung braucht), sodass Antworten und Kroniko im Fehlerfall gleich bleiben. Kopien der Bühne rechnen wie heute selbst (A-01). Grund: Die Werkzeuge rufen `probleme()` aus synchronem Code (`Laborejo.stato()`, `vokiIlon`); eine asynchrone Schnittstelle hätte `babilo.ts` und alle Werkzeuge berührt, ohne in T2 eine Rechnung zu sparen. **Für T3:** Rechnet ein Worker gerade dieselbe Prüfung, während ein Werkzeug sie synchron braucht, rechnet das Werkzeug sie ein zweites Mal im Haupt-Thread. Das Vorab-Warten macht diesen Fall selten (nur nach `apliki` mitten im Zug, wie heute). | angewandt |
| D-13 | T2 | Welchen Stand zeigt eine Antwort, wenn sich der `rev` während des Wartens ändert (Grenzfall, V-5.4)? | **Lesende Routen** (`/pruefung`, `stato`, `/asistanto/…`, Studio-GET, Komponenten-Seite, `fertig`, Rahmen, `vorschau.css`) halten `agordo` und `rev` des Entwurfs beim Eingang fest und antworten aus diesem Stand mit der Prüfung dieses `rev` (`stato` liest auch die Kroniko seines Standes vor dem Warten, wie heute vor der Prüfung). Was eine Route sonst von der Platte oder aus dem Entwurf liest (`zaehlilo`, `fremda`, Vorschläge der Seite, gespeicherte Marke, `eksporto`, `studio`-Rückmeldung), liest sie wie heute an ihrer Stelle, also nach dem Warten. **Ändernde Routen** arbeiten auf dem Entwurf, wie er beim Weitermachen ist: `festlegen` beginnt von vorn, wenn sich der `rev` während der Prüfung geändert hat (sonst ginge eine fremde Änderung verloren); `faceto` holt den `stato` des aktuellen `rev` (`statoJetzt`). Antworten nach einer Änderung zeigen den `rev` nach der eigenen Änderung, wie heute. Beleg: `ableitungen-044` (d) und (g). | angewandt |
| D-14 | T2 | B-4: Fehlerweg von `vorschau.css`. | **Erhalten.** Die Route setzt `writeHead(200, …)` wie bisher **vor** `shown()` und dem Warten auf den CSS-Speicher. Wirft eines davon, endet die Antwort über den Server-`catch` mit 200 und leerem Körper, wie auf `6a3e55e3`. Alle anderen Routen: Ein Fehler der Ableitung steigt als abgelehntes Promise in den Server-`catch` (`500` mit derselben Meldung). In den Rahmen bleibt die Reihenfolge `fontFaceOf` → `previewBody` → Prüfung, also wirft bei zwei Fehlern derselbe zuerst. | angewandt |
| D-15 | T2 | V-5 im Detail: Schnittstelle und „nur eintragen, wenn die Form noch gilt“ beim CSS. | `ableitungen.ts`: `pruefSpeicherOf(rechner, pruefTor?)` mit `pruefung(halter, marke, messung?)`, `fertig(halter)`, `eintragen(halter, derivation)`; `cssSpeicherOf(rechner, revOf)` mit `css(marke, rev, propono, agordo, messung?)`. **Abweichung:** Der CSS-Rechner hat die Signatur `(agordo, messung) => Promise<string>` statt `(agordo) => …`, damit `ableitung`/`projektion`/`css-js` in der rechnenden Anfrage gemessen werden; T3 behält das. Beim Abschluss prüft der CSS-Speicher den `rev` über `revOf` (der gehaltene Entwurf der Marke); die Form prüft jeder Treffer (`rev` **und** `JSON.stringify` des gezeigten `Agordo`), ein Eintrag mit veralteter Form wird also nie ausgeliefert und vom nächsten Aufruf ersetzt. Abgelehnte Promises werden sofort entfernt; jedes Promise hat einen eigenen leeren Fehler-Handler gegen unbehandelte Rejections, die wartenden Anfragen bekommen den Fehler trotzdem. Keine Iteration über die `Map`s, keine Zeit. | angewandt |
| D-16 | T2 | Was misst `warten` ab T2 (D-08)? | Eine Anfrage, die sich an eine **laufende** Rechnung einer anderen Anfrage hängt, zählt ihre Wartezeit zu `warten` (`Messung.warten`); die rechnende Anfrage meldet den Schritt (`ableitung+pruefung` bzw. die CSS-Schritte). Ein fertiges Ergebnis ergibt keinen Schritt (V-2). `messung-044` erwartet deshalb bei `vorschau.css` warm nur noch `marke-laden`, `warten`, `gesamt`. | angewandt |
| D-17 | T2 | Wie wird „`stato` während einer Prüfung“ ohne Tor gemessen (T2 Schritt 5)? | Zweiter Teil in `messung-044.test.ts`, je Durchlauf ein `it`: Marke B ist geprüft; A bekommt einen neuen `rev`, dann `POST /pruefung` A und gleich danach `GET stato` B, jede auf eigener Verbindung. Gemessen von außen (Zeit des Clients vom Senden bis zur ganzen Antwort), Zeilen „außen …“ im Bericht. Nur Formprüfung (beide 200, Zahlen ≥ 0), keine Dauer als Kriterium. In CI läuft er mit demselben N (je Durchlauf eine Prüfung mehr). | angewandt |
| D-18 | T3 | Wie sieht der Worker aus (T3 Schritt 2, D-02, A-04)? | `ableitungen.ts` bekommt den Rechner `pruefRechnungOf(haupt, modul?)`; die Speicher-Logik bleibt (V-5). **Ein** Worker je Server (`node:worker_threads`, keine Abhängigkeit) nur für Prüfungen; das Stylesheet rechnet weiter im Haupt-Thread (in Teilen, D-25), steht also nie in derselben Schlange (A-04). Der Worker startet **beim ersten Bedarf** einer Prüfung, also erst nach `listen` (R-6), und rechnet die Aufträge der Reihe nach (die Nachrichten-Schlange des Ports ist die Prüf-Schlange). Auftrag `{ id, agordo }` (das `Agordo` als Wert, V-5.4), Antwort `{ id, derivation }` oder `{ id, fehler }`. Das Modul `pruefung-worker.ts` ruft **dieselbe** Funktion `checkDraft` wie der Haupt-Thread, mit Basen aus `loadBases()` im Worker. **Basen laden statt klonen** (gemessen, Probe unter der Sperre): `loadBases()` 133 ms einmal je Worker **im Worker**; `structuredClone(bases)` 13–21 ms, aber **im Haupt-Thread** und je Worker-Start – Laden blockiert den Haupt-Thread nie. **Structured Clone** ändert die `Derivation` nicht (R-2): `isDeepStrictEqual` (mit Prototypen) und gleiche `JSON.stringify`-Bytes (Reihenfolge der Schlüssel) gegen den Haupt-Thread, dazu die Fixture im `dist`-Pfad – eine serialisierte Form ist nicht nötig. Keine Zeitgrenze, keine `resourceLimits`, kein Retry. | angewandt (`9e6060b6`) |
| D-19 | T3 | Fallback ohne Worker (T3 Schritt 3, A-06)? | Entschieden **einmal beim Start** in `pruefRechnungOf`: Gibt es das Modul `pruefung-worker.js` neben `ableitungen` (gebautes Paket), rechnet der Worker; fehlt es (TS-Quelle unter Vitest, dort liegt nur `.ts`), rechnet derselbe `checkDraft` im Haupt-Thread (`ort: "haupt-thread"`). Kein Raten je Anfrage. `ServiloOptions.pruefWorker` (Testnaht wie `pruefTor`) nennt ein anderes Modul; ohne sie gilt das Modul neben dem Server. `tsconfig.build.json` gibt `dist/pruefung-worker.js` unverändert aus (geprüft). | angewandt |
| D-20 | T3 | Fehler und Tod des Workers (AC-7)? | Wirft die Prüfung im Worker, geht der geworfene Wert per Structured Clone zurück (ein `Error` bleibt `Error` mit derselben `message`; ein nicht kopierbarer Wert als `String(…)` – genau der Text, den der Server-`catch` zeigt). Stirbt der Worker (`error`, `messageerror`, `exit`), schlagen **alle** Aufträge fehl, die er hielt: mit seinem Fehler bzw. `The worker of the check ended (exit code N).`. Der Speicher entfernt das abgelehnte Promise (V-5.2), die Anfrage bekommt `500` mit derselben Meldung wie bei einem Wurf im Haupt-Thread. Erst der **nächste Bedarf** startet einen neuen Worker; die Anfrage wird nicht wiederholt. `close()` des Servers beendet den Worker (`terminate`), auch wenn das Schließen des Servers fehlschlägt. Beleg: `pruefung-worker-044.test.ts` (Wurf, `exit 7`, Wurf in der echten Prüfung ohne `Agordo` – je gleiche Antwort wie ein Wurf im Haupt-Thread über `pruefTor`; danach Rahmen und Prüfung mit den Bytes der Fixture; genau 3 Worker-Starts für 3 Fehler). | angewandt |
| D-21 | T3 | Wie misst der Speicher `ableitung+pruefung`, wenn die Rechnung im Worker läuft (Hinweis aus T2)? | Neu `Messung.schrittBisFertig(schritt, work)`: misst vom Start bis zum Abschluss des Promise (auch bei Ablehnung). Der Prüf-Speicher misst damit; ohne Senke ruft `OHNE_MESSUNG` nur `work()` (keine Ausgabe, V-2). Im Fallback misst er wie bisher die synchrone Dauer. Die Zeit enthält im Worker-Pfad das Warten in der Prüf-Schlange und beim ersten Bedarf den Start des Workers. | angewandt |
| D-22 | T3 | Welche Prüfungen außerhalb des Speichers laufen im Worker? | `festlegen` rechnet die Prüfung des **Kandidaten** über denselben Rechner (`await pruefRechnung.rechner(agordo)`) und beginnt danach von vorn, wenn sich der `rev` inzwischen geändert hat (wie D-13 nach dem Warten auf `before`). **Synchron bleiben:** `pruefungJetzt` für die Werkzeuge des `Laborejo` (D-12, D-24), `confirmed` in `vorschlagDe` (nur auf dem Weg der Ablehnung `409`, je Kandidat eine Prüfung) und `exportMarko` beim Speichern (`/speichern`). Das sind Befunde (B-7), keine Änderung in diesem Lauf. | angewandt |
| D-23 | T3 | Wie laufen die Tests gegen den Worker-Pfad (T3 Schritt 4, A-06)? | `test-doubles/servilo-044.ts` hat `startServiloDist()` (lädt `dist/index.js`) und einen dritten Parameter `start` von `testServilo`; mit **`FM_SERVILO_044=dist`** laufen alle Tests dieses Strangs, die `testServilo` benutzen, unverändert gegen das gebaute Paket. `pruefung-worker-044.test.ts` läuft immer gegen `dist`: fester Ablauf gegen **dieselbe** Fixture (66 Hashes), `stato` B vor der Prüfung A ohne Tor, Fehler/Tod des Workers, Rechner im Worker gleich dem Haupt-Thread, Ende und Neustart, Fallback auf der Quelle. **`messung-044` misst seit T3 den Server aus `dist`** (Bericht: `"server": "dist (Prüfung im Worker)"`), lokal wie in CI, weil das der Weg der Produktion ist; auf der Quelle würde er den Fallback messen. `antworten-044.test.ts`, die Fixture und `stato-044.test.ts` bleiben unverändert. | angewandt |
| D-24 | T3 | `Laborejo` rechnet synchron (D-12): Was passiert, wenn der Worker dieselbe Prüfung gerade rechnet? | **Wirkung:** `pruefungJetzt` findet kein fertiges Ergebnis und rechnet die Prüfung ein zweites Mal synchron im Haupt-Thread (≈ 1,5 s Sperre wie vor T3) und trägt sie ein; das Ergebnis des Workers kommt danach, wird nicht mehr eingetragen (der Eintrag ist ersetzt) und geht an die Anfragen, die auf ihn warteten. Beide Ergebnisse sind gleich (D-18), die Bytes also auch. Der Fall braucht einen neuen `rev` mitten in einem Chat-Zug (`apliki`) **und** eine gleichzeitige Anfrage, die die Prüfung dieses `rev` im Worker anstößt (z. B. der `stato`-Takt). **Nicht vermieden:** Ein synchrones Warten auf den Worker (`Atomics.wait` + `receiveMessageOnPort`) würde den Haupt-Thread ebenso sperren und eine zweite Nachrichten-Bahn brauchen – nicht billig in der Zone. Kandidat für eine Folge-Spec: asynchrone `Laborejo`-Schnittstelle. | dokumentiert |
| D-25 | T3 | `previewCss` in Teilen (T3 Schritt 1)? | Die vier Schritte (`derivationBasis` · `packageDocuments` · `composeFiles` + `buildModelo` · `CSS_CELO.generate`) stehen einmal in einem Generator; `previewCss` läuft ihn synchron durch, `previewCssInTeilen` wartet zwischen je zwei Schritten auf `setImmediate` (kein Timer mit Dauer). Gleicher Code, gleiche Reihenfolge, gleiche Bytes. Der CSS-Rechner des Servers ist `previewCssInTeilen` (Signatur `(agordo, messung)`, D-15). Die Messung zählt die ersten beiden Schritte zu `ableitung` (zwei Aufrufe, summiert). Längste Sperre durch einen Kalt-Render: `derivationBasis` (≈ 75 ms) statt des ganzen Renders (≈ 135 ms). Der Fehlerweg B-4 bleibt (D-14). | angewandt |

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
| B-4 | **Fehlerweg von `vorschau.css` (für T2):** Die Route ruft `writeHead(200, …)` **vor** `previewCss(…)` (`servilo.ts`, Route `vorschau.css`). Wirft die Ableitung, ist der Header schon gesetzt (`headersSent`), und der Server-`catch` beendet die Antwort mit **200 und leerem Körper**, nicht mit 500. Die Messpunkte erhalten diese Reihenfolge. | T2 muss genau diese Fehlerantwort erhalten (V-5, 2: „derselbe Fehler wie heute“) oder die Abweichung als Entscheidung mit Begründung in plan.md führen. **T2: erhalten (D-14).** |
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

### Lokal nach T2 (`messung-044.test.ts`)

**Rechner:** wie vorher (Apple M1 Max, 10 Kerne, macOS 26.5.1, Node v24.21.0). **Code:** `5bcda814` (T2 grün; der Bericht nennt `5bcda814-dirty`, weil nur plan.md/tasks.md offen waren). **Zeit:** 2026-11-07, 16:22–16:24 Ortszeit, unter der Sperre (A-09), `pnpm turbo run build --filter=@fundamento/metiejo...` und `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo exec vitest run src/messung-044.test.ts`: 20 von 20 grün in 121,5 s. **N = 10** (n = 60 je Zeile, mit Vorschlag n = 10). **Last:** `uptime` vorher 5,65 / nachher 5,68 (1 min). Fremde Test-Prozesse: dieselben **ruhenden** Treffer wie vorher (Playwright-MCP, sechs alte Metiejo-Server aus `/private/tmp/s035-t3`, je 0,0 % CPU) – keine fremde Test-Last, gleiche Lage wie bei „vorher“.

In ms, Median / Max. Die Spalte „vorher“ wiederholt die Werte von `63f1e56a` zum Vergleich.

| Route | Schritt | vorher kalt | **nach T2 kalt** | vorher warm | **nach T2 warm** |
|---|---|---|---|---|---|
| `POST /pruefung` | `ableitung+pruefung` | 1623 / 1862 | **1517 / 1744** | – | – |
| | `css-js` | 0 / 0,3 | 0 / 0,2 | 0 / 0,1 | 0 / 0,1 |
| | `warten` | 0 / 0,2 | 0 / 0,2 | 0 / 0,2 | 0 / 0,2 |
| | **gesamt** | 1623 / 1863 | **1517 / 1744** | 0,2 / 0,4 | 0,2 / 0,4 |
| `GET stato` (Prüfung im Speicher) | gesamt | 0,3 / 9,9 | 0,3 / 8,1 | 0,2 / 0,5 | 0,2 / 0,5 |
| `GET vorschau?sxtupo=farbe` | gesamt | 0,2 / 7,5 | 0,2 / 7,2 | 0,2 / 0,4 | 0,1 / 0,5 |
| `GET vorschau?sxtupo=buehne-farbe` (Prüfung im Speicher) | gesamt | 0,2 / 0,4 | 0,2 / 0,4 | 0,2 / 0,4 | 0,2 / 0,3 |
| `GET vorschau…` mit Vorschlag (`farbe` / `buehne-farbe`) | gesamt | 0,6 / 0,7 bzw. 0,3 / 0,5 | 0,4 / 0,6 bzw. 0,2 / 0,4 | 0,3 / 0,5 bzw. 0,3 / 0,4 | 0,2 / 0,4 bzw. 0,3 / 0,4 |
| `GET vorschau.css` | `ableitung` | 95,0 / 135,0 | 91,3 / 132,0 | 90,7 / 132,1 | **– (Speicher)** |
| | `projektion` | 9,2 / 15,3 | 7,3 / 14,5 | 6,2 / 14,6 | **–** |
| | `css-js` | 32,9 / 43,0 | 32,4 / 37,6 | 31,3 / 59,7 | **–** |
| | **gesamt** | 142,5 / 176,9 | **135,4 / 173,3** | 132,8 / 177,5 | **0,5 / 0,7** |
| `GET vorschau.css` mit Vorschlag | gesamt | 139,0 / 142,8 | 140,9 / 166,2 | 138,0 / 149,6 | **0,7 / 1,0** |
| **`GET stato` B während `POST /pruefung` A** (von außen, ohne Tor, D-17) | gesamt | – (nicht gemessen; aus den Traces: hinter einer Prüfung 1,6–3,5 s) | **1555 / 1633** | | |
| `POST /pruefung` A dabei (von außen) | gesamt | – | 1555 / 1632 | | |
| einzeln (A-05) | `derivationBasis` / Struktur-Anteil / `structureModelo` | 77,2 / 81,2 · 5,1 / 13,1 · 3,9 / 4,7 | 75,3 / 90,8 · 4,8 / 8,0 · 3,8 / 4,8 | | |

**Was T2 bewirkt:** Wiederholte Arbeit wird einmal gerechnet: `vorschau.css` warm kostet 0,5 ms statt 133 ms (mit Vorschlag 0,7 statt 138 ms), gleichzeitige Anfragen teilen eine Rechnung (`stato-044` Fall 2: genau ein `ableitung+pruefung`), und die Rahmen ohne Prüfung warten auf nichts. **Was T2 nicht bewirkt:** Die erste Prüfung eines `rev` ist weiter ein synchroner Block von ≈ 1,5 s im Haupt-Thread (B-1). Während dieser Zeit antwortet der Server niemandem: `stato` B (eigene Arbeit 0,3 ms) braucht von außen so lange wie die Prüfung von A (1555 ms Median). `warten` bleibt in der Senke ≈ 0, weil die Blockade **vor** `handle` liegt (D-08); das Warten auf eine geteilte Rechnung (D-16) kommt im festen Ablauf nicht vor, weil dort die Anfragen nacheinander laufen.

### Entscheidung für T3 (nach T2)

| Ziel (lokal, Median) | nach T2 | erreicht? |
|---|---|---|
| `/pruefung` < 1 s | 1517 ms kalt (Max 1744); warm 0,2 ms | **nein** – ein Schritt, `ableitung+pruefung` = `checkDraft` (`deriveAspekto`), 1517 ms |
| erstes Rendern < 1 s | Rahmen 0,2 ms + `vorschau.css` kalt 135 ms ≈ 136 ms, solange nichts im Weg steht; der Rahmen `buehne-*` ohne Vorschlag braucht beim ersten Mal die Prüfung (1,5 s) | ja ohne Prüfung im Weg, **nein**, sobald eine Prüfung im Haupt-Thread rechnet (der Rahmen steht dann dahinter wie `stato`) |
| `stato` während einer Prüfung < 200 ms | 1555 ms (Max 1633) | **nein** – Ursache allein die synchrone Prüfung im Haupt-Thread (Event-Loop steht 1,5 s) |

**T3 ist nötig.** Erst ein Worker für die Prüfung (D-02) gibt den Event-Loop frei: Dann sollten `stato` und die Rahmen während einer Prüfung in der Größe ihrer eigenen Arbeit antworten (< 1 ms bzw. ≈ 135 ms für `vorschau.css` kalt). Das Zerlegen von `previewCss` mit `setImmediate` senkt die längste Sperre durch einen Kalt-Render von bis zu 173 ms auf den größten Teil (`ableitung` bis 132 ms). Das Ziel „`/pruefung` < 1 s“ erreicht auch ein Worker nicht: Die Prüfung selbst bleibt ≈ 1,5 s (ohne Änderung an `agordilo`, D-02) – Befund mit Werten (R-1, AC-2), Kandidat für eine Folge-Spec ist dann `deriveAspekto` selbst, nicht `structureModelo` (B-2: 3,8 ms).

### Lokal nach T3 (`messung-044.test.ts` gegen `dist`, Prüfung im Worker)

**Rechner:** wie vorher (Apple M1 Max, 10 Kerne, macOS 26.5.1, Node v24.21.0). **Code:** `9e6060b6` (T3 grün). **Server:** gebautes Paket (`dist`), Prüfung im Worker-Thread (D-18, D-23; Bericht `"server": "dist (Prüfung im Worker)"`). **Zeit:** 2026-11-07, 16:53–16:55 Ortszeit, unter der Sperre (A-09), nach `pnpm turbo run build --filter=@fundamento/cli... --filter=@fundamento/metiejo...`: `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo exec vitest run src/messung-044.test.ts` 20 von 20 grün in 137,5 s. **N = 10** (n = 60 je Zeile, mit Vorschlag n = 10). **Last:** `uptime` vorher 6,66 / nachher 7,22 (1 min), etwas höher als bei „nach T2“ (5,65 / 5,68). Fremde Test-Prozesse: dieselben **ruhenden** Treffer wie vorher (Playwright-MCP, sechs alte Metiejo-Server aus `/private/tmp/s035-t3`, je 0,0 % CPU) – keine fremde Test-Last; die Grundlast kommt von Desktop-Programmen (p0, Figma, WindowServer).

In ms, Median / Max.

| Route | Schritt | vorher kalt | nach T2 kalt | **nach T3 kalt** | nach T2 warm | **nach T3 warm** |
|---|---|---|---|---|---|---|
| `POST /pruefung` | `ableitung+pruefung` | 1623 / 1862 | 1517 / 1744 | **1679 / 2441** (im Worker, D-21) | – | – |
| | `css-js` | 0 / 0,3 | 0 / 0,2 | 0 / 0,4 | 0 / 0,1 | 0 / 0,2 |
| | `warten` | 0 / 0,2 | 0 / 0,2 | 0 / 0,2 | 0 / 0,2 | 0 / 0,3 |
| | **gesamt** | 1623 / 1863 | 1517 / 1744 | **1679 / 2442** | 0,2 / 0,4 | 0,1 / 0,7 |
| `GET stato` (Prüfung im Speicher) | gesamt | 0,3 / 9,9 | 0,3 / 8,1 | 0,4 / 9,3 | 0,2 / 0,5 | 0,3 / 4,6 |
| `GET vorschau?sxtupo=farbe` | gesamt | 0,2 / 7,5 | 0,2 / 7,2 | 0,3 / 17,9 | 0,1 / 0,5 | 0,2 / 1,6 |
| `GET vorschau?sxtupo=buehne-farbe` (Prüfung im Speicher) | gesamt | 0,2 / 0,4 | 0,2 / 0,4 | 0,2 / 0,5 | 0,2 / 0,3 | 0,2 / 0,3 |
| `GET vorschau…` mit Vorschlag (`farbe` / `buehne-farbe`) | gesamt | 0,6 / 0,7 bzw. 0,3 / 0,5 | 0,4 / 0,6 bzw. 0,2 / 0,4 | 0,4 / 0,6 bzw. 0,3 / 1,1 | 0,2 / 0,4 bzw. 0,3 / 0,4 | 0,3 / 0,7 bzw. 0,3 / 0,5 |
| `GET vorschau.css` | `ableitung` (zwei Teile, D-25) | 95,0 / 135,0 | 91,3 / 132,0 | 98,8 / 130,5 | – | – |
| | `projektion` | 9,2 / 15,3 | 7,3 / 14,5 | 10,3 / 71,9 | – | – |
| | `css-js` | 32,9 / 43,0 | 32,4 / 37,6 | 40,8 / 115,3 | – | – |
| | **gesamt** | 142,5 / 176,9 | 135,4 / 173,3 | **156,4 / 299,4** | 0,5 / 0,7 | 0,5 / 1,8 |
| `GET vorschau.css` mit Vorschlag | gesamt | 139,0 / 142,8 | 140,9 / 166,2 | 151,0 / 175,9 | 0,7 / 1,0 | 0,9 / 1,6 |
| **`GET stato` B während `POST /pruefung` A** (von außen, ohne Tor, D-17) | gesamt | – (Traces: 1,6–3,5 s) | 1555 / 1633 | **0,9 / 1,4** | | |
| `POST /pruefung` A dabei (von außen) | gesamt | – | 1555 / 1632 | 1643 / 2104 | | |
| einzeln (A-05) | `derivationBasis` / Struktur-Anteil / `structureModelo` | 77,2 / 81,2 · 5,1 / 13,1 · 3,9 / 4,7 | 75,3 / 90,8 · 4,8 / 8,0 · 3,8 / 4,8 | 75,2 / 112,8 · 5,2 / 17,0 · 3,5 / 9,8 | | |

**Startzeit des Servers bis zur URL-Zeile (R-6)**, `fm metiejo --port <p> --workdir <tmp>` aus `packages/cli/dist`, Zeit vom `spawn` bis `http://localhost:<p>` auf stderr, N = 10 je Stand, unter der Sperre, Werkzeug außerhalb des Repos (`/tmp/s044t3/werkzeug/start-zeit.mjs`): **vorher** (`ddebe102`, 16:39, `uptime` 5,99) **475,5 / 481,5 ms**; **nach T3** (`9e6060b6`, 16:53, `uptime` 6,26) **481,8 / 508,4 ms**. Der Worker startet nicht beim Start (D-18); der Unterschied liegt im Rauschen.

**Probe Worker (einmal, unter derselben Sperre, `dist`, `/tmp/s044t3/werkzeug/worker-probe.mjs`):** `loadBases()` 132,9 ms; `structuredClone(bases)` 13,2–21,1 ms (5×, im Haupt-Thread); Prüfung im Haupt-Thread 1822,7 ms; **erste Prüfung im neuen Worker 2095,1 ms** (Start des Workers: Module laden, `loadBases`, kalter JIT); weitere Prüfungen im Worker 1493–1658 ms.

### Ziele nach T3 (AC-2, lokal)

| Ziel (lokal, Median) | nach T3 | erreicht? |
|---|---|---|
| `stato` während einer Prüfung < 200 ms | **0,9 ms** (Max 1,4) statt 1555 ms | **ja** |
| erstes Rendern < 1 s | Rahmen 0,2–0,3 ms + `vorschau.css` kalt 156 ms ≈ 157 ms; eine laufende Prüfung sperrt den Event-Loop nicht mehr (siehe `stato`), der Rahmen `buehne-*` ohne Vorschlag wartet weiter auf die Prüfung **seines** `rev` (D-01) | **ja** (der Rahmen `buehne-*` beim ersten Mal: so lange wie die Prüfung) |
| `/pruefung` < 1 s | **1679 ms** kalt (Max 2441); warm 0,1 ms | **nein** – Befund B-6 |

### Befunde (T3)

| ID | Befund | Folge |
|---|---|---|
| B-6 | **`/pruefung` kalt bleibt ≈ 1,5–1,7 s** (R-1, AC-2): Die Prüfung ist ein Aufruf `deriveAspekto` in `agordilo` (D-02: unverändert); der Worker gibt nur den Event-Loop frei. Im Worker ist sie etwas langsamer als nach T2 (1679 statt 1517 ms Median): die **erste** Prüfung eines Servers trägt den Start des Workers (Probe: 2095 statt ≈ 1550 ms, Max 2441 ms in der Messung), der Worker-Thread hat einen eigenen, kalten JIT, und die Grundlast war höher (`uptime` 6,7–7,2 statt 5,7). | Ziel „`/pruefung` < 1 s“ verfehlt. Kandidat für eine Folge-Spec: `deriveAspekto` selbst (nicht `structureModelo`, B-2); optional den Worker beim Start vorwärmen (nach `listen`), was T3 nach der Implementierungs-Spec nicht tut (lazy). |
| B-7 | **Weitere synchrone Prüfungen im Haupt-Thread** (D-22): `pruefungJetzt` der `Laborejo`-Werkzeuge (D-12, D-24: nur wenn kein fertiges Ergebnis da ist), `confirmed` in `vorschlagDe` (Ablehnung `409` beim Festlegen; je Kandidat eine Prüfung) und `exportMarko` beim Speichern. Sie sperren den Event-Loop weiter für je ≈ 1,5 s. | Nicht in diesem Lauf (keine Route des Strangs, Antworten unverändert). Kandidat für eine Folge-Spec. |
| B-8 | `vorschau.css` kalt ist nicht schneller (156 / 299 ms gegen 135 / 173 ms nach T2): Die Teile ändern die eigene Arbeit nicht; die Max-Werte von `projektion` (72 ms) und `css-js` (115 ms) liegen in einzelnen Läufen unter der höheren Grundlast. Der Gewinn von D-25 ist, dass ein Kalt-Render andere Anfragen höchstens ≈ 75–130 ms (`derivationBasis`) statt den ganzen Render sperrt. | Nur zur Information; T4 misst „lokal nachher“ noch einmal. |
| B-9 | **`pnpm test:betroffen` ist lokal lastempfindlich** (T3-Schlusslauf): `modelo#test` (Eingaben `specs/**`, hängt an `@fundamento/cli#build`) läuft nach jeder Änderung an `metiejo` oder an der Doku mit und bringt die Maschine allein auf Load ≈ 23. Gleichzeitig mit `nordstelo` überschreiten `connectGvidanto` in `nordstelo` (Hook 10 s) und in `modelo` `turbo-inputs` (Hook 10 s) und `alirebleco` (Test 30 s) ihre Zeitgrenzen; einzeln sind beide Pakete grün. Kein Bezug zum Worker (kein Metiejo-Server in diesen Tests). | Für T4: `modelo` zuerst allein über `turbo run test --filter=@fundamento/modelo` laufen lassen (Ergebnis im Cache), dann `pnpm test:betroffen`. In CI laufen die Pakete in eigenen Jobs. Keine Grenze ändern. |

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

# T2: Speicher-Test (rot zuerst ohne ableitungen.ts) und die drei Tests des Strangs
FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo exec vitest run src/ableitungen-044.test.ts src/stato-044.test.ts src/antworten-044.test.ts
# T2: ganze metiejo-Suite (N der Messung für diesen Lauf klein) und Lint
FM_MESSUNG_044_N=2 FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test
pnpm --filter @fundamento/metiejo lint

# T3: Worker-Pfad (gebautes Paket; vitest.config.ts baut vorher) und dieselben Tests unverändert gegen dist
FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo exec vitest run src/pruefung-worker-044.test.ts
FM_SERVILO_044=dist FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo exec vitest run src/stato-044.test.ts src/antworten-044.test.ts src/ableitungen-044.test.ts
# T3: Startzeit bis zur URL-Zeile (R-6), N = 10, Werkzeug außerhalb des Repos (spawn von packages/cli/dist/index.js metiejo, Zeit bis „http://localhost:<port>“)
pnpm turbo run build --filter=@fundamento/cli...
node /tmp/s044t3/werkzeug/start-zeit.mjs "$PWD" 10
```
