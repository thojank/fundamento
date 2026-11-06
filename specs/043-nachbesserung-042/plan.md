# Spec 043 – Nachbesserung 042: Warten auf „geladen“, Vorschau-Rahmen, Übernahme WebKit – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `b260ae62fbf95cba5a08454d32f5a78e615743ee57369b17cd45789b57701949`) · **Aufgaben:** [`tasks.md`](tasks.md) · **Basis:** `main` `e5057afc` (Merge #152, Spec 038 Lauf 2; seit `f027522` nur `packages/nordstelo/**` und `specs/038-gvidanto-agentoj/**` geändert) · **Branch:** `261106-spec-043-nachbesserung-042-pr-d9dc59` · **Regel 0** gilt. **Keine Grenzen, Zeitlimits, Schwellen, Abfrageintervalle, Toleranzen oder Wiederholungen angehoben. Nichts gemergt.** Kein Sprachmodell (0 $).

**Datum:** 2026-11-06 · **Stand:** T1 fertig (rot `8a65d6f4` → grün `20f221cc`); T2 fertig (`seiteBereit` rot `dc69bd93` → grün `3e4102ac`; Navigationstest Firefox rot = CI + lokal 4/30 `b43bc7e9` → grün `0b2d29c4`); T3 fertig (Übernahme WebKit rot = CI + lokal 2/30 `154eb490` → grün `a28da901`); T4 offen.

### G-0 Quelle

| | Wert |
|---|---|
| Quelle | `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec043/spec.md` |
| Größe der Quelle (`wc -c`) | 4590 Byte |
| SHA-256 laut Auftrag | `b260ae62fbf95cba5a08454d32f5a78e615743ee57369b17cd45789b57701949` |
| SHA-256 der Quelle (2026-11-06, 11:41 Ortszeit, `shasum -a 256`) | `b260ae62fbf95cba5a08454d32f5a78e615743ee57369b17cd45789b57701949` |
| SHA-256 der Kopie `specs/043-nachbesserung-042/spec.md` | `b260ae62fbf95cba5a08454d32f5a78e615743ee57369b17cd45789b57701949` (4590 Byte) |
| Ergebnis | **gleich.** Kopiert mit `cp`, nicht über ein Editor-Werkzeug. |

### Tickets und Dateien

Ein Strang, ein PR, ein Push, genau ein `workflow_dispatch` (Spec, „Begrenzung der Laufzeit“). Die Tickets laufen nacheinander.

| Datei | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| `packages/metiejo/src/**` | **ja** (nur N-8) | – | – | – |
| `specs/043-nachbesserung-042/{spec,plan,tasks}.md` | anlegen | fortschreiben | fortschreiben | abschließen |
| `packages/eroj/test/buehne-navigation-042.spec.ts` | neuer roter N-8-Test | Firefox-Analyse, ggf. Fix | – | – |
| `packages/eroj/test/geladen-042.ts` | – | **ja** | – | – |
| `packages/eroj/test/zweitfarbe-036.spec.ts` | – | ja | – | – |
| `packages/eroj/test/metiejo-036-uebernahme.spec.ts` | – | – | **ja** | – |
| alles andere | tabu | tabu | tabu | tabu |

Tabu sind ausdrücklich `.github/**`, Root-Dateien, `packages/nordstelo/**`, `packages/mcp/**`, `packages/modelo/**`, `buehne-036.spec.ts` und `wackler-040.ts` (nur benutzen).

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf ist unbeaufsichtigt. Wo die Spec offen ließ, gilt die Annahme. „angewandt“ = so umgesetzt; „offen“ = Ticket steht noch aus.

### Fragen und Abweichungen der Implementierungs-Spec (F-1 bis F-5)

| ID | Frage / Abweichung | Annahme | Stand |
|---|---|---|---|
| F-1 | Laut Quelle ist N-8 „sehr wahrscheinlich“ die Ursache des Chromium-Rots in `zweitfarbe-036`. Der Trace von 42180054807 zeigt **keinen** Abbruch des Rahmens und keine Neuanfrage im `stato`-Takt; auch der Schnellstart (ohne `stato`-Takt) ist rot. Ursache ist ein **langsamer Server** (Kalt-Render bzw. `/pruefung` ≈ 3,3–4,3 s), das Hauptdokument wird erst nach mehr als 5 s „complete“ (Befunde unten). | **T1 bleibt** als eigener Produkt-Fix (N-8 ist für Nutzer sichtbar und ein Punkt der Quelle). Die rote Zeile in `zweitfarbe-036` behebt **T2** (`seiteBereit`). Im Bericht steht die Zuordnung Befund → Ursache aus dem Trace. | angewandt (Zuschnitt) |
| F-2 | Der Firefox-Fehler in `buehne-navigation-042` ist **nicht N-8**: Die Rahmen haben `rev=2` geladen, aber das Init-Skript des Tests lief in diesen zwei Dokumenten nicht (kein Eintrag in `sessionStorage`, keiner in der Bindung). | Anhang D wörtlich: T2 versucht die Nachstellung (≤ 30). Nachgestellt → Fix nach `testing.md`; nicht nachgestellt → Befund mit Trefferquote und Spur. *Offene Frage an den Maintainer, nicht blockierend:* Gilt der Trace-Beleg selbst als „nachgestellt“? Ohne Antwort gilt die strenge Lesart. | angewandt (T2): **nachgestellt**, lokal 4/30 rot auf dem Stand nach T1, genau das Bild aus CI. Fix nach `testing.md` (D-4, D-11), `0b2d29c4`. Die offene Frage ist damit gegenstandslos. |
| F-3 | „Roter Test zuerst“ ist für die Wackel-Fälle (T2 Firefox, T3 WebKit) nicht deterministisch ohne neue Timer zu erfüllen. | Vorbild Spec 042 T3: Rot = CI-Lauf 42180054807 bzw. lokale Trefferquote, beides **vor** dem Fix-Commit in `tasks.md`. Wo ein deterministischer roter Test möglich ist (T1, T2 `seiteBereit`), ist er Pflicht. | T2 angewandt (Navigationstest: CI 42180054807 + lokal 4/30, in `tasks.md` committet `b43bc7e9` vor dem Fix `0b2d29c4`); T3 angewandt (Übernahme: CI 42180054807 2/2 + lokal 2/30, in `tasks.md` committet `154eb490` vor dem Fix `a28da901`) |
| F-4 | Format der Ticket-IDs: Vertrag `<PREFIX>-<PHASE>.<NUM>`, Quelle und Auftrag `T1`–`T4`. | Die IDs sind **`T1`, `T2`, `T3`, `T4`**, überall gleich (Spec, Status, Commits). | angewandt |
| F-5 | Der p0-Standard verlangt ein eigenes Test-Ticket am Ende; Anhang C verlangt genau T1–T4, keine QA-Schleife. | Anhang C gilt. Die Abnahme über alles ist der Dispatch-Lauf in T4; die Prüfung über Ticket-Grenzen hinweg gehört zu T4. | angewandt |

### Entscheidungen der Implementierungs-Spec (D-1 bis D-4)

| ID | Frage | Annahme | Warum | Stand |
|---|---|---|---|---|
| D-1 | Wodurch fordert die Seite einen abgebrochenen Rahmen neu an? | **Ereignisgesteuert, nie über die Uhr:** an `load` des Rahmens und an `load`/`pageshow` der Seite. Kein Timer, kein Polling, kein zweiter Takt. `stato-041.test.ts` (genau ein Takt, 3000 ms) bleibt grün. | Regel 0; die Seite feuert `load` erst, wenn alle Rahmen fertig sind, auch fehlgeschlagene (sicherer zweiter Auslöser) – gemessen gilt das in Chromium und Firefox, nicht in WebKit (D-5, Befund N-8 WebKit). | angewandt (T1, `20f221cc`) |
| D-2 | Wie wird Doppel-Laden verhindert? | Ein Rahmen, dessen Dokument die erwartete URL hat (Pfad, `rev`, `scheme`) und geladen ist, bekommt **keine** weitere `src`-Zuweisung. Je erwarteter URL **höchstens eine** sofortige Neuanforderung; ein dauerhaft scheiternder Server löst keine Schleife aus. `buehne-navigation-042` ist der Wächter: genau eine `src` je Anlass und Rahmen. | Anhang D „Rahmen ist korrekt geladen“: kein Flackern, keine wartenden Tests. | angewandt (T1, `20f221cc`; Navigationstest je Engine 30/30) |
| D-3 | Wie wird Rot deterministisch? | Die roten Tests aus T1 und T2 erzeugen ihren Fehlerzustand über `page.route`, ohne Timer. T1 bricht die erste Navigation des Rahmens „Jetzt“ nach dem Neuladen ab (`route.abort`); T2 hält die Antwort des Rahmens zurück, bis `seiteBereit` aufgelöst ist. | Rot vor Grün je Ticket (Anhang C, 1). | T1 angewandt (`8a65d6f4`, rot in drei Engines); T2 angewandt (`dc69bd93`, rot in Chromium und Firefox, in WebKit nicht, D-9) |
| D-4 | Wie beobachtet T2 die Rahmen, wenn es den Navigationstest ändert? | Die Rahmen-Dokumente werden von der Seite gelesen, die sie hält (`testing.md` › Spec 041). Die Strenge (genau ein Dokument je Anlass) bleibt gleich. | Das Init-Skript im Rahmen lief in Firefox nicht immer (F-2). | angewandt (T2, `0b2d29c4`, Form D-11) |

### Entscheidungen aus dem Lauf (D-5 ff.)

| ID | Ticket | Frage | Annahme | Stand |
|---|---|---|---|---|
| D-5 | T1 | Woran erkennt die Seite beim `load` der Seite, dass die Navigation eines Rahmens **vorbei** ist und nicht nur noch nicht begonnen hat? | **Am `beforeunload` des Dokuments, das der Rahmen bei der Zuweisung zeigte** (Hörer vor der `src`-Zuweisung, `once`, mit `AbortController`). Erst wenn die Navigation begonnen hat, zählt beim `load` der Seite ein Rahmen ohne das erwartete Dokument als abgebrochen. Gemessen (Wegwerf-Probe, nicht committet): In WebKit kommt das `load` der Seite **vor** dem Beginn der Rahmen-Navigationen, die das Modul-Skript beim Parsen setzt (`beforeunload` des Rahmens 10–20 ms danach). Ohne diese Bedingung bekam jeder Rahmen in WebKit beim ersten Laden eine zweite `src` (Navigationstest rot: `laden-1` je zweimal). In Firefox feuert das `beforeunload` auch für die später abgebrochene Navigation, und das `load` der Seite wartet auf den Abbruch. Ein lesbares Dokument mit `load` des Rahmens zählt nie (es kann eines sein, das eine neuere Navigation gleich ersetzt); dort zählt nur die Fehlerseite (`contentDocument` `null`, Chromium). Ist ein Dokument angekommen, wird der Hörer entfernt (ein same-origin Dokument kann das Fenster des about:blank samt Hörern übernehmen). | angewandt (`20f221cc`) |
| D-6 | T1 | Was gilt für den neuen N-8-Test in WebKit, wo der Fix nicht greifen kann (Anhang D, „N-8-Fix greift in einem Browser nicht“)? | **`test.fail(browserName === "webkit", …)` mit Begründung**, kein Überspringen, keine Wartezeit: Der Test läuft in WebKit vollständig und muss dort rot sein; wird WebKit eines Tages grün (es meldet den Abbruch), schlägt die Markierung an. Chromium und Firefox prüfen ihn ohne Markierung. Abweichung vom Akzeptanzkriterium „grün in drei Browsern“, vom Maintainer zu bestätigen. | angewandt (`20f221cc`) |
| D-7 | T1 | Unit-Test in Metiejo? | **Ja, klein:** `packages/metiejo/src/vorschau-043.test.ts` hält die Form fest (Block steht einmal vor `refreshFrame()`, Bindung an `load` des Rahmens, `load` und `pageshow` der Seite, kein `set…(`-Aufruf und kein `requestAnimationFrame` im Block, `.src = ` nur einmal im Client und über `vorschauSenden` für beide Rahmen, Wächter „einmal je URL“ und „geladen → nichts“). Das Verhalten beweisen die Browser-Tests. | angewandt (`20f221cc`) |
| D-8 | T2 | Reihenfolge in `schrittBereit`: erst Rahmen, dann `/pruefung` (bisher) oder umgekehrt? | **Erst die `/pruefung`-Antwort, dann der Rahmen** (wenn der Schritt prüft). Gemessen (Wegwerf-Spec, nicht committet; Schnellstart-Farbschritt nach „Keine Zweitfarbe“, je Engine 5 Läufe, Zeiten ab `timeOrigin` der Seite): `/pruefung` und Rahmen starten gleich (Chromium/WebKit 0,1–0,3 s); die Antwort des Rahmens endet in Chromium und WebKit in derselben Millisekunde wie die der Prüfung, in Firefox kommt sie früh, aber das Stylesheet des Rahmens wartet; **fertig ist der Rahmen 0,2–0,3 s nach der Antwort der Prüfung, 15/15, nie davor**. Der Rahmen folgt also der Prüfung auf dem Server. Jede der beiden Erwartungen liest ihr eigenes Ereignis unter der Standard-Wartezeit; keine Wartezeit ist länger geworden. Im CI-Trace (Prüfung 4,2 s) blieben für den Rahmen in der alten Reihenfolge ≈ 0,1–0,4 s Puffer (R-1, Prüfung plus Nachlauf des Rahmens unter einer Wartezeit); jetzt wartet jede Erwartung auf ihr eigenes Ereignis: die Prüfung (≈ 0,8 s Puffer bei 4,2 s), danach der Rahmen (0,2–0,3 s Nachlauf). Beim Assistenten (kein `#mt-pruefung`) ändert sich nichts. | Die Spec erlaubt die Reihenfolge nur nach Messung; die Messung zeigt die Ursache-Folge. Vom Maintainer zu bestätigen. | angewandt (`3e4102ac`) |
| D-9 | T2 | Wo steht der rote `seiteBereit`-Test, und was gilt in WebKit? | **In `zweitfarbe-036.spec.ts`, im bestehenden Durchlauf für Assistent und Schnellstart** („the screen is ready while its preview still loads“): genau die zwei Orte des CI-Fehlers, der Schnellstart mit Merkmal vom Server. Rot auf dem alten `seiteBereit` in Chromium und Firefox (je 2/2, `readyState` „interactive“, 5 s), **in WebKit nicht** (10/10 grün): Dort ist die Seite „complete“, bevor die Rahmen-Navigation beginnt (dieselbe Beobachtung wie D-5). Der Test bleibt in WebKit trotzdem ein gültiger Wächter (er verlangt nur, dass `seiteBereit` ohne den Rahmen auskommt). | Rot ist in zwei von drei Engines deterministisch belegt; WebKit konnte den CI-Fehler nie zeigen. | angewandt (`dc69bd93`) |
| D-10 | T2 | `rahmenBereit` und ein Dokument ohne `documentElement` (Befund T1, Firefox 1/30)? | **Als „nicht geladen“ lesen**, wie `about:blank`. Keine neue Wartezeit, kein weiterer Fehler wird verschluckt. | Mitten im Dokumentwechsel ist das kein Fehler, sondern ein Zustand. | angewandt (`3e4102ac`) |
| D-11 | T2 | Wie zählt der Navigationstest die Rahmen-Dokumente von der Seite aus, ohne die Strenge zu ändern? | **Zweite Quelle `laden`:** Das Init-Skript der Seite hört in der Capture-Phase auf `load` jedes `iframe` und notiert das Dokument des Rahmens (`timeOrigin`, URL, Navigationstyp). Jeder Eintrag trägt jetzt `dokument` = `performance.timeOrigin` des Dokuments. Je Rahmen gilt: **die Dokumente, die eine der Quellen sah** (Init-Skript im Rahmen: `sessionStorage`/`performance`; Seite: `laden`), je Dokument einmal, nach Beginn sortiert. Erwartet unverändert streng: Seite 2 Ladevorgänge, je Rahmen genau 5 Dokumente `laden-1 … laden-2` mit `navigate` und genau 5 `src`, `andere: []`. Der Schritt eines Dokuments, das die Seite sah, ist der Schritt, der **vor dem Beginn** des Dokuments (`timeOrigin`) zuletzt benannt wurde; `schritt()` notiert dazu die Zeit jedes Schritts (der `load` selbst kann nach dem nächsten Schritt-Namen kommen). Ein zusätzliches Dokument, aus welcher Quelle auch immer, macht die Liste weiterhin ungleich. | `testing.md` › Spec 041; Implementierungs-Spec T2. Die frühere Form verlangte, dass das Init-Skript in jedem Rahmen-Dokument läuft; das tut es in Firefox nicht immer. | angewandt (`0b2d29c4`) |

## Befunde

### Aus dem Trace von Lauf 42180054807 (`f027522`)

Die Artefakte `testberichte-eroj-2-1` (26 MB) und `testberichte-eroj-4-1` waren am 2026-11-06 abrufbar (laufen etwa am 2026-11-13 ab, Risiko R-4). Neu laden: Messanleitung unten. Traces unter `eroj/test-reports/playwright/html/data/*.zip`; Netzwerk `*-trace.network`, Schritte `test.trace`.

| Test (Browser) | Was der Trace zeigt | Ursache | Ticket |
|---|---|---|---|
| `zweitfarbe-036.spec.ts:121`, Assistent (Chromium) | Rot an `:173` (`schrittBereit` nach „Keine Zweitfarbe“). 08.084 `POST entwurf`, gleich danach der alte Rahmen `rev=3` (3329 ms) und das Neuladen `GET /asistanto/…` mit **3336 ms**: Der Server rendert das neue rev kalt, die Seite wartet dahinter. Rahmen ab 12.03, `vorschau.css?rev=3` bei Testende (13.08) unbeendet. | Das Hauptdokument wird nicht in 5 s ab Tastendruck „complete“, weil der Server langsam ist. **Kein Abbruch, kein `stato`-Takt.** | T2 |
| `zweitfarbe-036.spec.ts:121`, Schnellstart (Chromium) | Rot an `:173`. Seite nach 11 ms da. Dann starten `POST /pruefung` und Rahmen `vorschau?rev=3` gleichzeitig (27.806), **beide 4216 ms**. Danach `vorschau.css?rev=3` bei Testende unbeendet. Die Prüfung blockiert den Node-Event-Loop ≈ 3,7–4,3 s pro Aufruf (auch beim ersten Laden: 3706 ms). | Wie oben, nur blockiert hier `/pruefung` statt Kalt-Render. | T2 (Risiko R-1) |
| `buehne-navigation-042.spec.ts:200` (Firefox) | Für den Schritt „rev“ ist `src` je Rahmen notiert (rev=2). Das Netz zeigt beide `GET vorschau?…rev=2` mit 200, und `rahmen(page, neu, "light")` ist grün. Aber für beide Rahmen fehlen die Einträge `sessionStorage`/`performance` **und** die Bindung. Die Differenz sind genau diese vier Zeilen „rev“. | Das Init-Skript lief in Firefox in den Dokumenten des Schritts „rev“ nicht, eine Lücke des Beobachters. Nicht N-8, keine Navigation zu viel. | T2 |
| `metiejo-036-uebernahme.spec.ts:67` und `:89` (WebKit) | Beide rot im Test-Schritt **nach** `waitForURL` (`:51`), beim Node-`fetch`-**POST** `/api/marko/<id>/materialo` (`:52`). Fehler: `TypeError: fetch failed`, `[cause]: Error: read ECONNRESET`. Der Server ist der eigene (Port 7341, die Seite lädt von ihm). Gleichzeitig blockiert `/pruefung` (4316 ms) den Server. | **Reset an einem POST** über eine wiederverwendete Keep-alive-Verbindung (Muster B-12). N-3 (`workerIndex % 9`) steckt zusätzlich im Code, war hier aber nicht die Ursache. | T3 |

### Nebenbefund Server-Latenz (nicht in diesem Lauf zu beheben)

`POST /api/marko/<id>/pruefung` (`checkDraft`, `servilo.ts` › `pruefungOf`) und der Kalt-Render je neuem rev blockieren den Node-Event-Loop für 3,3–4,3 s. Alle Anfragen dahinter warten, auch die Vorschau. Das ist die gemeinsame Wurzel mehrerer Wackler (Spec 040 B-5 „busy Metiejo 3.5 s“, `wackler-040.ts:55`). `packages/metiejo/src/**` ist hier nur für N-8 frei. Kandidat für eine Folge-Spec.

### N-8 aus Spec 042 (T1)

Nicht zu verwechseln mit Nachlese 10 N-8 (`html.ts`, Sprachwahl). Im Code heißt es „Spec 043 / N-8 aus Spec 042“. Auf `main` setzt der Client das `src` der Rahmen nur bei einem Anlass: erstes Laden (`refreshNachher()`, am Ende `refreshFrame()`), Schema-Wahl, eigene Änderung, neues `rev` im `stato`-Takt. Wird die Navigation eines Rahmens abgebrochen (`NS_BINDING_ABORTED`, Netzfehler), fragt die Seite ihn bei gleichem `rev` **nie** neu an.

### Aus dem Lauf (T1)

| ID | Nachweis | Ursache | Fix | Stand |
|---|---|---|---|---|
| N-8 WebKit | **Lokal, Wegwerf-Probe** (Init-Skript der Seite notiert `load` der Rahmen, `load` der Seite, `src`, `beforeunload`/`pagehide` der Rahmen-Fenster): Nach `route.abort` der ersten Anfrage von „Jetzt“ feuert WebKit **kein** Ereignis – kein `load` am Rahmen, kein `error`, keinen Eintrag in der Resource Timing; `beforeunload` des about:blank kommt (Beginn), danach nichts. Das `load` der Seite lag schon **vor** dem Beginn der Rahmen-Navigationen. Chromium: `load` am Rahmen mit Fehlerseite (`contentDocument` `null`). Firefox: kein `load` am Rahmen, aber das `load` der Seite wartet auf den Abbruch. | Ein abgebrochener Rahmen ohne Fehlerseite ist in WebKit von einer laufenden Navigation nicht zu unterscheiden, und es kommt danach kein Ereignis, an dem die Seite nachsehen könnte. Ohne Uhr (Regel 0) kann die Seite den Abbruch dort nicht bemerken. | Kein Fix in WebKit (Anhang D). Der Test ist dort als erwartet rot markiert (D-6). Chromium und Firefox: behoben. | Befund |
| N-8 natürlich | **Lokal**, Firefox, Wegwerf-Spec (nicht committet): Assistent „Leitfarbe und Akzente“ mit gesetzter Zweitfarbe, „Keine Zweitfarbe“ (`sendDraft`, dann `location.reload()`), 30 Läufe auf `20f221cc`. Abgebrochen wurde in 30/30 nur die Anfrage `rev=3` von „Jetzt“ der **alten** Seite (`NS_BINDING_ABORTED`, das Neuladen schneidet sie ab, erwartet). Keine Anfrage eines Rahmens der neuen Seite brach ab. | Nicht nachgestellt (0/30). Nebenbei gesehen, 30/30: Firefox stellt beim Neuladen beide Rahmen zuerst auf die URL aus der Sitzungs-Historie (altes `rev=2`), danach schickt der Client sie auf `rev=3`; je Rahmen zwei Anfragen. Alle Rahmen hatten danach das neue rev. | – (der deterministische rote Test bleibt der Beleg, F-3) | Befund |
| `rahmenBereit` Firefox | **Lokal** (T1), 1 der 30 Läufe oben: `locator.evaluate: can't access property "getAttribute"` aus `rahmenBereit` (`geladen-042.ts`), `doc.documentElement` ist `null`, während der Rahmen ein Dokument wechselt. `zwischenDokumenten()` fängt nur „Execution context was destroyed“; dieser Fehler beendet `expect.poll` sofort. | Lücke der Testhilfe in Firefox, nicht N-8 und nicht das Produkt. | T2 (D-10): ein Dokument ohne `documentElement` gilt als „nicht geladen“. | behoben (`3e4102ac`) |

### Aus dem Lauf (T2)

| ID | Nachweis | Ursache | Fix | Stand |
|---|---|---|---|---|
| `seiteBereit` (Chromium, `zweitfarbe-036:121`) | **Mit Trace** 42180054807 (Tabelle oben) und **lokal deterministisch** (D-9): Rahmen über `page.route` zurückgehalten, `readyState` bleibt „interactive“, das alte `seiteBereit` gibt nach 5 s auf (Chromium 2/2, Firefox 2/2). | Ein Hauptdokument mit ladendem Rahmen ist nicht „complete“; der Rahmen wartet hinter dem langsamen Server (Kalt-Render, `/pruefung`). Nicht N-8. | `seiteBereit`: `merkmal && neu && readyState !== "loading"`; Rahmen über `rahmenBereit` (D-8: nach der Prüfung). | behoben (`3e4102ac`) |
| F-2 Navigationstest Firefox | **Mit Trace** 42180054807 (Artefakt `testberichte-eroj-2-1`, `junit.xml`, Fehlermeldung des Tests): Für den Schritt „rev“ stehen `src jetzt rev … rev=2&scheme=light` und `src vorschlag rev … propono=gvidkoloro&rev=2&scheme=light`, in der Bindung nur `bindung jetzt rev src …` und `bindung vorschlag rev src …`; es fehlen je Rahmen `sessionStorage … rev` und `performance … rev navigate` (Diff: `Expected − 4, Received + 0`: zweimal „rev navigate“, zweimal „rev“). `rahmen(page, neu, "light")` war davor grün. **Lokal nachgestellt: 4/30 rot** (Firefox, Stand nach T1, `--repeat-each=30 --workers=4`), alle vier mit genau diesem Diff. Wegwerf-Probe nach dem Fix (30 Läufe Firefox, Init-Skript-Quelle und Seiten-Quelle getrennt protokolliert): Das Init-Skript fehlte in 9/30 Läufen in Rahmen-Dokumenten (8× „rev“, 1× „laden-2“, je beide Rahmen); die Seite sah den `load` aller fünf Dokumente je Rahmen in 30/30. Chromium und WebKit (je 10): beide Quellen vollständig. | Das Init-Skript des Tests läuft in Firefox nicht in jedem Rahmen-Dokument (Playwright/Firefox), eine Lücke des Beobachters. Nicht N-8, keine Navigation zu viel oder zu wenig. | D-11: Die Seite zählt die Rahmen-Dokumente mit (`load` des `iframe`); Erwartung gleich streng. | behoben (`0b2d29c4`) |
| Firefox: Rahmen aus der Sitzungs-Historie (Hinweis T1) | Gelesen am Code: Firefox stellt beim Neuladen den alten Rahmen-Inhalt (altes `rev`) wieder her, setzt aber kein `src`-Attribut (das setzt nur der Client). `rahmenBereit` verlangt `doc.URL === frame.src` und `frame.src !== ""`; das wiederhergestellte Dokument zählt also erst, wenn der Client `src` gesetzt hat **und** das Dokument dieser URL geladen ist; mit `rev` aus `html[data-mt-rev]` zusätzlich nur das neue `rev`. Lokal: `zweitfarbe-036` (zweimal Neuladen je Test) Firefox 150/150 grün. | – | keiner nötig | geprüft |

### Aus dem Lauf (T3)

| ID | Nachweis | Ursache | Fix | Stand |
|---|---|---|---|---|
| Übernahme WebKit (`metiejo-036-uebernahme:67`, `:89`) | **Mit Trace** 42180054807 (Artefakt `testberichte-eroj-4-1`): je Test ein eigener Server (4.2 Port 7342, 4.1 Port 7341, Marke frisch, `POST /marko` 303), dann `POST /pruefung` 4403 bzw. 4316 ms; der Test endet mit `TypeError: fetch failed`, `[cause]: Error: read ECONNRESET` am Node-`fetch`-POST `/materialo`, gleich nachdem der Server wieder frei ist. | Die Bereitschaftsschleife (`fetch` `GET /`) ließ eine Keep-alive-Verbindung im Pool von Node; der POST nahm sie wieder, während `/pruefung` den Event-Loop blockierte. Danach schloss der Server die über seine Keep-alive-Zeit liegende Verbindung samt ungelesenem POST (Muster B-12). | `POST /materialo` über `request` mit `connection: close`, nie wiederholt; das globale `fetch` entfällt ganz. | behoben (`a28da901`) |
| N-3 in der Übernahme (lokal) | **Lokal, ohne CI-Trace**: unveränderter Code, WebKit, `--repeat-each=15 --workers=4`, **2/30 rot**, beide 4.2 auf Port 7347, beide 120 s. (a) `POST /marko` antwortet 200 „Die Marke „Sablo“ gibt es schon“ (Trace-Ressource): Der Test sprach mit dem Server eines anderen Workers. (b) `page.goto(/asistanto/sablo/tiparo)` ohne Antwort, vermutlich derselbe fremde Server beim Beenden durch seinen Worker (ohne weiteren Beleg). | Jede Wiederholung (`--repeat-each`) läuft in eigenen Workern, `workerIndex` steigt über 8; `7341 + workerIndex % 9` traf einen belegten Port, der eigene Kindprozess endete mit EADDRINUSE, und die Schleife hielt den fremden Server für bereit. Im CI-Lauf nicht die Ursache (zwei verschiedene Ports, frische Marken). | Startmuster wie `buehne-navigation-042.spec.ts`: Warten auf die URL-Zeile des **eigenen** Kindes (stderr), bei belegtem Port der nächste in 7341–7349; keine Schleife, kein Timer. | behoben (`a28da901`) |

## Messungen

### T1 (lokal, `FM_AUSGABE=knapp`, nur `buehne-navigation-042.spec.ts`, eine Suite zur Zeit, `--workers=4`)

| Lauf | Chromium | Firefox | WebKit |
|---|---|---|---|
| Rot auf `8a65d6f4` (vor dem Fix), neuer N-8-Test | 1/1 rot (`rahmenBereit` „Jetzt“: `geladen: false`, 5 s) | 1/1 rot (ebenso) | 1/1 rot (ebenso) |
| Grün auf `20f221cc`, neuer N-8-Test, `--repeat-each=10` + `--repeat-each=20` | 30/30 grün | 30/30 grün | 30/30 wie markiert rot (D-6) |
| Bestehender Navigationstest (genau eine `src` je Anlass und Rahmen), dieselben Läufe | 30/30 grün | 30/30 grün (F-2 nicht aufgetreten) | 30/30 grün |
| Erster Entwurf des Fixes ohne D-5 (nicht committet) | grün | grün | Navigationstest rot: `src` `laden-1` je Rahmen zweimal |

`pnpm --filter @fundamento/metiejo test`: 557/557 grün (darin `stato-041.test.ts` und `vorschau-043.test.ts`). `pnpm --filter @fundamento/metiejo lint` grün (eine Warnung in `komponentoj.ts`, schon auf `e5057afc`). `}, 3000);` unverändert (`html.ts`).

### T2 (lokal, `FM_AUSGABE=knapp`, eine Suite zur Zeit, `--workers=4`; CLI-Build aktuell, Turbo-Cache)

| Lauf | Chromium | Firefox | WebKit |
|---|---|---|---|
| Roter `seiteBereit`-Test auf `dc69bd93` (altes `seiteBereit`), Assistent + Schnellstart | 2/2 rot (`readyState` „interactive“, 5 s) | 2/2 rot (ebenso) | 10/10 grün (D-9) |
| Derselbe Test mit neuem `seiteBereit` (vor dem Commit `3e4102ac`) | 10/10 + 6/6 grün | 10/10 + 6/6 grün | 10/10 + 6/6 grün |
| Navigationstest auf dem Stand nach T1, `-g "only on the test's steps" --repeat-each=30` | – | **4/30 rot** (F-2, Diff wie CI) | – |
| Wegwerf-Probe nach dem Fix: Quellen getrennt (Init-Skript im Rahmen / `load` von der Seite) | 10/10 grün, beide vollständig | 30/30 grün; Init-Skript lückenhaft in 9/30, Seite vollständig in 30/30 | 10/10 grün, beide vollständig |
| `buehne-navigation-042.spec.ts` auf `0b2d29c4`, ganze Datei (Navigationstest + N-8-Test) | `--repeat-each=10`: 20/20 grün | `--repeat-each=30`: 60/60 grün | `--repeat-each=10`: 20/20 (N-8-Test wie markiert rot, D-6) |
| `zweitfarbe-036.spec.ts` auf `0b2d29c4`, ganze Datei (5 Tests), `--repeat-each=30` | 150/150 grün | 150/150 grün | 150/150 grün |
| `buehne-036.spec.ts` unverändert, `--repeat-each=2` | 38/38 grün | 38/38 grün | 38/38 grün |

Messung D-8 (Wegwerf-Spec, nicht committet; Schnellstart-Farbschritt nach „Keine Zweitfarbe“, ms ab `timeOrigin` der Seite, Auswahl):

| Engine | `interactive` | `/pruefung` Start → Ende | Rahmen Start → Antwort → fertig | „complete“ |
|---|---|---|---|---|
| Chromium | 13 | 218 → 2229 | 217 → 2229 → 2471 | 2471 |
| Firefox | 19 | 177 → 2225 | 178 → 181 → 2469 | 2469 |
| WebKit | 10 | 265 → 2394 | 268 → 2394 → 2676 | 262 |

Typprüfung der drei geänderten Testdateien mit einer Wegwerf-`tsconfig` (wie T1): sauber (die einzigen Fehler stehen in `test/alirebleco.ts`, unverändert, über `buehne-036.spec.ts` eingebunden). `biome check` der drei Dateien sauber.

### T3 (lokal, `FM_AUSGABE=knapp`, nur `metiejo-036-uebernahme.spec.ts`, eine Suite zur Zeit, `--repeat-each=15 --workers=4` = 30 Läufe; CLI-Build aktuell, Turbo-Cache)

| Lauf | Chromium | Firefox | WebKit |
|---|---|---|---|
| Rot auf `0585ed3a` (unveränderter Test) | – | – | **2/30 rot** (N-3, siehe Befunde T3) |
| Grün auf `a28da901` | 30/30 grün | 30/30 grün | **30/30 grün** |

Typprüfung der Datei mit einer Wegwerf-`tsconfig` (außerhalb des Repos) sauber; `biome check` sauber.

## Messanleitung

```sh
# G-0: Quelle und Kopie haben dieselbe Größe und denselben Hash
wc -c /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec043/spec.md specs/043-nachbesserung-042/spec.md
shasum -a 256 /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec043/spec.md specs/043-nachbesserung-042/spec.md
git show HEAD:specs/043-nachbesserung-042/spec.md | shasum -a 256

# Trace von 42180054807 lesen (nur lesen, je Artefakt ein neues leeres Verzeichnis)
gh run download 42180054807 -R thojank/fundamento -n testberichte-eroj-2-1 -D <leeres-verzeichnis>
gh run download 42180054807 -R thojank/fundamento -n testberichte-eroj-4-1 -D <leeres-verzeichnis>

# Vor Playwright: der CLI-Build enthält die Metiejo-Änderung (die Tests starten packages/cli/dist/index.js)
pnpm turbo run build --filter=@fundamento/cli...
pnpm --filter @fundamento/metiejo test

# Nur die geänderte Spec-Datei, eine Suite zur Zeit, knappe Ausgabe, je Engine
cd packages/eroj
for e in chromium firefox webkit; do
  FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=$e pnpm exec playwright test test/buehne-navigation-042.spec.ts --repeat-each=10 --workers=4
done
# nur der N-8-Test: -g "Spec 043"; nur der Navigationstest: -g "only on the test's steps"
# T2: zweitfarbe-036 (der rote seiteBereit-Test allein: -g "still loads"), buehne-036 als unveränderter Konsument
for e in chromium firefox webkit; do
  FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=$e pnpm exec playwright test test/zweitfarbe-036.spec.ts --repeat-each=30 --workers=4
done

# T3: die Übernahme (4.1, 4.2), je Engine 30 Läufe
for e in chromium firefox webkit; do
  FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=$e pnpm exec playwright test test/metiejo-036-uebernahme.spec.ts --repeat-each=15 --workers=4
done

# Diff-Suche: das lokale main steht auf f6f38f53 (veraltet), deshalb gegen den Commit der Basis
git diff e5057afc -U0 | grep '^+' | grep -E '<Wortliste der Diff-Suche, Anhang C>'
git diff --name-only e5057afc
```

## Bericht

### Stand vor dem Dispatch (T4)

Lokal alles grün. Der Dispatch-Lauf von `ci.yml` ist die Abnahme. Sein Ergebnis steht nicht hier, sondern im Bericht der p0-Sitzung, weil nach dem Push kein Commit mehr folgt (Anhang C, 5).

| Befund | Ursache | Fix | Grundlage |
|---|---|---|---|
| `zweitfarbe-036:121` Chromium (Assistent, Schnellstart) | Der Server ist langsam: Kalt-Render bzw. `/pruefung` dauern 3,3–4,3 s, der Rahmen lädt dahinter, das Hauptdokument ist nach 5 s nicht „complete“. Nicht N-8. | `seiteBereit` wartet auf `readyState !== "loading"`. `rahmenBereit` prüft den Rahmen getrennt. `schrittBereit` wartet erst auf `/pruefung`, dann auf den Rahmen (D-8). | mit Trace; roter Test Chromium 2/2 und Firefox 2/2, in WebKit nicht rot (D-9) |
| `buehne-navigation-042:200` Firefox | Das Init-Skript lief in einigen Rahmen-Dokumenten nicht (−4 Zeilen „rev“), eine Lücke des Beobachters. Nicht N-8. | Die Seite zählt die Rahmen-Dokumente mit (D-11). Die Erwartung bleibt gleich streng. | mit Trace; lokal 4/30 rot, danach 30/30 grün |
| `metiejo-036-uebernahme:67/:89` WebKit | In CI ein Reset (`ECONNRESET`) am POST `/materialo` über eine Keep-alive-Verbindung, während `/pruefung` den Server blockiert. Lokal N-3: ein Port aus `workerIndex % 9`, unter dem der Server eines anderen Workers lief. | Der Test wartet auf seinen eigenen Server (Ports 7341–7349, URL-Zeile des Kindprozesses). Der POST geht über `request` mit `connection: close` und wird nie wiederholt. Nur der GET steht in `nachEinemReset`. | mit Trace; lokal 2/30 rot, danach je Engine 30/30 grün |
| N-8 aus Spec 042 (Produkt) | Bricht die Navigation eines Vorschau-Rahmens ab, wurde er erst bei neuem `rev` im `stato`-Takt neu angefragt. | Ereignisgesteuert sofort neu anfordern, höchstens einmal je URL, nie bei richtig geladenem Rahmen (`html.ts`). | roter Test; Chromium und Firefox 30/30 grün. WebKit meldet den Abbruch nicht, darum `test.fail` (D-6). |

**Diff-Prüfung gegen `e5057afc`:**
- Die Wortliste aus Anhang C erscheint nur in den zwei Zeilen der byte-gleich kopierten `spec.md`, die sie zitieren.
- `}, 3000);` ist unverändert.
- Geänderte Dateien liegen nur in den freien Pfaden.
- `pnpm lint` grün, `pnpm check:privat` 0 Treffer, `spec.md` SHA-256 `b260ae62…1949`.

**Schlusslauf lokal** (je Datei und Engine einmal, nacheinander): `buehne-navigation-042` 2/2, `zweitfarbe-036` 5/5, `metiejo-036-uebernahme` 2/2 und `buehne-036` (unverändert) 19/19, jeweils in Chromium, Firefox und WebKit. Der N-8-Test ist in WebKit wie markiert rot. Dazu `pnpm --filter @fundamento/metiejo test` 557/557.

**Vom Maintainer zu bestätigen:**
- D-6: `test.fail` für WebKit im N-8-Test.
- D-8: Reihenfolge in `schrittBereit`; zwei Wartezeiten hintereinander statt eines Fensters.
- D-9: Der rote `seiteBereit`-Test ist in WebKit nicht rot.

**Folge-Spec (Kandidat):** Der Server ist bei `/pruefung` und beim Kalt-Render 3,3–4,3 s blockiert.
