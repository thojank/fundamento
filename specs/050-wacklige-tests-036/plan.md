# Spec 050 – Wacklige Browser-Tests aus Spec 036 stabil machen – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `386f6db80c0e99edd5813b22b67d8481e59098ca96d48fdee3fdc7a329e3d8c5`, 16 031 Byte) · **Aufgaben:** [`tasks.md`](tasks.md) · **Basis:** `main` `de931e40` (Merge #163) · **Branch:** `261112-wacklige-browser-tests--9197f6` · **Regel 0** gilt. Keine Grenze, kein Zeitlimit, keine Toleranz, kein Takt angehoben. Nichts gemergt, nichts gepusht. Kein Sprachmodell (0 $).

**Datum:** 2026-11-12 · **Stand:** T1 – Diagnose ohne Code-Änderung: CI-Artefakte gesichert, Zeitleisten je Test, Messung lokal und aus CI, Plattform- und Rahmen-Probe und die Tabelle „Ursache je Test“ (V-1) sind fertig. Von den Vorher-Raten (V-3) sind `zweitfarbe-036` Stufe (1) und `achsen-2b2` gültig; `buehne-036` Stufe (1) lief teilweise unter fremder Test-Last (nur zur Information), Shard 2/4, die Stufe (2) und die Extra-Reihe mit Traces sind **offen**, weil eine andere Sitzung seit 20:40 fast ohne Pause Tests auf dieser Maschine laufen lässt (B-08). T2–T6 offen.

### G-0 Quelle

| | Wert |
|---|---|
| Quelle | `purple/documentation/261112-wacklige-browser-tests-aus-spec-036-stabil-machen-zweitfarbe-036-buehne-036/user-provided-product-spec-wacklige-tests-036.md` (Workspace `fundamento`) |
| Größe der Quelle (`wc -c`) | 16 031 Byte |
| SHA-256 der Quelle (2026-11-12, 19:28 Ortszeit, `shasum -a 256`) | `386f6db80c0e99edd5813b22b67d8481e59098ca96d48fdee3fdc7a329e3d8c5` |
| SHA-256 der Kopie `specs/050-wacklige-tests-036/spec.md` | `386f6db80c0e99edd5813b22b67d8481e59098ca96d48fdee3fdc7a329e3d8c5` (16 031 Byte) |
| Ergebnis | **gleich.** Kopiert mit `cp`, nicht über ein Editor-Werkzeug. |

### Tickets und Dateien

Ein Strang, streng nacheinander: T1 → T2 → T3 → T4 → T5 → (QA-Schleife) → T6. T1–T5 committen nur lokal; T6 (ein Push, ein PR, genau ein `workflow_dispatch`) macht der Orchestrator.

| Datei | T1 | T2 | T3 | T4 | T5 |
|---|---|---|---|---|---|
| `specs/050-wacklige-tests-036/{spec,plan,tasks}.md` | anlegen | fortschreiben | fortschreiben | fortschreiben | abschließen, dazu `bericht.md` |
| `packages/metiejo/src/**`, `packages/agordilo/src/**` | – | Prüfung schneller (rot zuerst) | nur K4 Navigation in `html.ts`/`buehne-klient.ts` (rot zuerst) | – | – |
| `packages/eroj/test/{zweitfarbe-036.spec,buehne-036.spec,geladen-042,wackler-040}.ts` | – | – | Warten an der Ursache (K2, K3) | – | – |
| `packages/eroj/test/achsen-2b2.spec.ts` | – | – | – | K5 | – |
| alles andere | tabu | tabu | tabu | tabu | tabu |

T1 hat **keinen** Code geändert: `git diff de931e40 --name-only` zeigt nur `specs/050-wacklige-tests-036/*`. Alle Proben liegen außerhalb des Repos (`/tmp/s050/`, Kopie für T2–T5 in `…/fundamento-wt-mwdq3cluiyydrirx/s050-werkzeug/`) und werden nicht committet.

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf ist unbeaufsichtigt. Wo die Spec offen ließ, gilt die Annahme. „angewandt“ = so umgesetzt; „offen“ = Ticket steht noch aus.

### Annahmen der Implementierungs-Spec (Q-1 bis Q-8)

| ID | Frage | Entscheidung | Stand |
|---|---|---|---|
| D-01 (Q-1) | `delivery.md`: Ticket stoppt nach 2 h; T1/T5 brauchen mehr Maschinenzeit. | Die Spec gewinnt. Reihen im Hintergrund, höchstens alle 5 min nachgesehen; nach 2 h Zwischenstand per `purple_status`, weiter, solange nur eine Messreihe läuft. | angewandt (T1) |
| D-02 (Q-2) | 5-s-`expect.poll` hinter einer Serverrechnung (`geladen-042.ts`) gegen `testing.md`. | Spur, keine Ursache: T1 ordnet je Test nach §2.4 ein. Für T-A/T-B ist K4 Prüfung die Hauptursache und K2 belegte Nebenursache (V-1, B-01) – also T2 zuerst, danach die Umstellung des Wartens in T3. Ein `waitForResponse` ohne `timeout`-Argument ist kein neues Zeitlimit. | angewandt (T1: Einordnung); T2/T3 offen |
| D-03 (Q-3) | Ort des roten Tests „genau eine Navigation des Rahmens je `rev`“. | `buehne-036.spec.ts` oder Unit-Test in `packages/metiejo/src/`; `buehne-navigation-042.spec.ts` bleibt unverändert. Zählmethode wie 042 D-13/D-14 (die T1-Rahmen-Probe zählt ebenso: `src`-Zuweisungen und ein Eintrag je Dokument). | offen (T3) |
| D-04 (Q-4) | `TAB()` aus `alirebleco.ts` nimmt für jedes WebKit `Alt+Tab`. | T4 importiert `TAB()` nicht; die Weiche in `achsen-2b2.spec.ts` hängt an Plattform **und** Engine, nur macOS-WebKit bekommt den Tastaturweg seiner Plattform. | offen (T4); Beleg aus der Plattform-Probe (T1) |
| D-05 (Q-5) | Shard 2/4 und `--repeat-each`. | Shard 2/4 je Messreihe **einmal** ohne `--repeat-each`, mit `--list`-Nachweis für `buehne-036.spec.ts:545 [firefox]`. Die 30 Wiederholungen von T-D kommen aus der Datei-Reihe `buehne-036`. | angewandt (T1) |
| D-06 (Q-6) | Welches Ticket ist das Test-Ticket? | T5; T6 ändert keinen Code und gehört dem Orchestrator. | angewandt (Ablauf in `tasks.md`) |
| D-07 (Q-7) | QA-Schleife nach T5 ändert Code. | Keine Wiederholungsreihe, kein Code ohne neue Reihe; sonst neue Nachher-Reihe nur für die betroffenen Tests, vor T6. | offen (QA) |
| D-08 (Q-8) | Ablauf der Artefakte (7 Tage). | Zuerst gesichert, vor jeder Messung: 11 Läufe mit Eroj-Artefakten, alle abrufbar (Tabelle „Gesichert“). | angewandt (T1, 19:20–19:24) |

### Entscheidungen aus dem Lauf (D-09 ff.)

| ID | Ticket | Frage | Entscheidung | Stand |
|---|---|---|---|---|
| D-09 | T1 | Einrichtung des Arbeitsbaums (Abhängigkeiten mit `--ignore-scripts`). | Nichts nachinstalliert: `node_modules` vollständig, Playwright 1.63.0 findet seine Browser (`chromium-1243`, `firefox-1543`, `webkit-2359`, `playwright install --dry-run`). Gebaut mit `pnpm turbo run build --filter=@fundamento/cli...` (10/10 aus dem Turbo-Cache, `packages/cli/dist`, `packages/metiejo/dist` inkl. `pruefung-worker.js`). | angewandt |
| D-10 | T1 | Wie wird „genau eine Hauptklasse“ vergeben, wenn mehrere Regeln aus §2.4 greifen? | In der Reihenfolge der Ursache: Liegt die Wartestelle hinter einer Prüfung, deren eigene Rechenzeit lokal ≥ 1 s ist und den größten Einzelteil der Wartezeit in CI erklärt, ist die Hauptklasse **K4 Prüfung**; ein festes Fenster hinter derselben Rechnung ist **K2 als Nebenursache**, die Last im Shard **K1 als Nebenursache**. Navigiert ein Rahmen öfter als einmal je `rev` und stirbt genau dieser Kontext, ist es **K4 Navigation**, nicht K3. Hängt ein Lesen im ersetzten Kontext ohne doppelte Navigation, ist es **K3**. | angewandt (V-1) |
| D-11 | T1 | Wie werden die CI-Traces gelesen? | Nur gelesen: Netz (`*.network`: URL, Status, `_monotonicTime`, `time`; Status −1 = bei Testende unbeantwortet), Aktionen und Protokoll (`*.trace`: `before`/`after`/`log`), Testschritte (`test.trace`), `frame-snapshot`s je Rahmen. Zeiten relativ zum `monotonicTime` des Testläufers. Skripte `/tmp/s050/{spur,tab,junit,je-test,rahmen,iframe}.py`, Python mit `-I`, Pfade als Argumente. `playwright show-trace` war nicht nötig. | angewandt |
| D-12 | T1 | Grundlast der Maschine, die sich nicht abstellen lässt. | Jede Reihe nennt im Kopf `uptime` vorher/nachher, fremde Test-Prozesse (Sperren-Befehl aus §2.8) und die Top-CPU-Prozesse; dazu tastet `/tmp/s050/fremdlast.sh` alle 30 s Load und die CPU der virtuellen Maschine ab (`s050-lokal/<reihe>/fremdlast.txt`). Desktop-Grundlast (WindowServer, p0, Claude, Telegram, eine virtuelle Maschine mit 0,2–2 Kernen) ist **keine** fremde Test-Last; sie steht im Kopf, damit T5 dieselbe Lage nennen kann. | angewandt |
| D-13 | T1 | Last-Verfahren für die Vorher-Raten (V-3), festgelegt am 2026-11-12, 19:58, **nach** der unbegrenzten Reihe `zweitfarbe-036` und **vor** jeder begrenzten Reihe. | **Zwei Stufen, beide in V-3 getrennt geführt; T5 wiederholt beide gleich.** (1) **„CI-ähnlich“** nach §2.8: `--workers 2`, `PLAYWRIGHT_ENGINES="chromium firefox webkit"`, der Test mit `--repeat-each=30` und der Rest seiner Datei zugleich, keine künstliche Last. (2) **„CPU begrenzt“**, weil (1) die CI-Rate nicht zeigt (`zweitfarbe-036`: T-B 30/30 in allen Engines, T-A Assistent nur 1/30 rot in Chromium; CI: in 11/11 Läufen rot): Unmittelbar vor der Reihe starten **6 Busy-Loop-Prozesse** `node -e "for(;;){}"` aus dem leeren Ordner `/tmp/s050/last/` (außerhalb des Repos), direkt nach der Reihe werden genau diese PIDs beendet (`kill`); PIDs, `uptime` und die Stichproben von `fremdlast.sh` stehen im Kopf der Reihe. Begründung der Zahl: Der Runner hat 4 vCPU für 2 Worker; dieselbe Prüfung dauert im Unit-Job dort 2,5–2,8 s (EPYC 7763, Xeon 8573C) gegen 1,6 s hier, ein Runner-Kern ≈ 0,6 M1-Kerne, 4 vCPU ≈ 2,5 M1-Kerne. 10 Kerne − 6 Schleifen − ≈ 1,5 Kerne Desktop-Grundlast (D-12) ≈ 2,5 Kerne für die Reihe. Stufe (2) läuft für die Datei-Reihen `zweitfarbe-036` und – falls (1) dort T-C oder T-D in Firefox 30/30 grün lässt – `buehne-036`. Shard 2/4 (einmal, Q-5) und `achsen-2b2` (Plattform, deterministisch) nur in Stufe (1). Keine Reihe unter (2) zählt als „CI-ähnlich“; für AC-4 vergleicht T5 jede Stufe mit sich selbst. | festgelegt (T1); Stufe (2) **noch nicht gelaufen** (fremde Test-Last, B-08) |
| D-14 | T1 | Wie wird T-E auf der Plattform geprüft (Schritt 5)? | Wegwerf-Probe `/tmp/s050/probe-pw/tab.probe.ts` mit eigener Konfiguration außerhalb des Repos (`node_modules` als Verweis auf `packages/eroj/node_modules`, `serve()` aus `packages/eroj/test/serve.ts` gelesen, nicht geändert): je Engine dieselbe Seite wie `achsen-2b2:82`, dann `Tab`, `Alt+Tab` bzw. `focus()`, gelesen `tabIndex`, Element, `activeElement` im Schattenbaum. Zum Vergleich `Tab` auf das `<select>` von `fm-elektilo` (Nachbartest `:56`). | angewandt |
| D-15 | T1 | Wie wird die doppelte Navigation auf `de931e40` gezählt (T-C, T-D)? | Wegwerf-Probe `/tmp/s050/probe-pw/rahmen.probe.ts`: `addInitScript` zählt in der Seite jede Zuweisung an `HTMLIFrameElement.src` (mit URL) und in jedem Rahmendokument dessen Start (URL, `timeOrigin`), abgelegt im `sessionStorage` der Seite (übersteht das Neuladen; Methode wie 042 D-13/D-14). Zwei Fälle: (R) `location.reload()` der Bühne wie nach „Schließen“, (G) `festlegen` und zweites `page.goto` wie T-D. Dazu die Anfragen `vorschau?…` aus `page.on("request")`. | angewandt |
| D-16 | T1 | Zeiten aus **grünen** Läufen (Schritt 4). | Eine Extra-Reihe `--trace on --repeat-each=5` (eigene Reihe, zählt nicht für V-3), Traces außerhalb des Repos gesichert. | **offen** – blockiert durch fremde Test-Last (B-08) |

## Ursache je Test (V-1, T1)

Eingeordnet nach den Klassenregeln (Implementierungs-Spec §2.4, D-10): genau eine Hauptklasse je Zeile, weitere Beiträge als Nebenursache, jede mit Beleg. Zeiten „s“ ab Testbeginn im Trace. Die Schwester-Varianten T-A Schnellstart und T-B Assistent sind in CI nie rot (0/11) und lokal 30/30; sie brauchen keine Zeile (B-01).

| Test (Datei:Zeile, Ort) | Engine(s) | Klasse | Beleg | Quelle | Nebenursache (mit Beleg) | Fix-Ticket / Stand |
|---|---|---|---|---|---|---|
| T-A `zweitfarbe-036.spec.ts:129`, Assistent („Leitfarbe und Akzente“), Wartestelle `entwurfGespeichert` → `rahmenBereit(…, { rev: 2 })` (`geladen-042.ts:224`/`:111`, Testzeile `:157`) | Firefox, WebKit, Chromium | **K4 Prüfung** | Der Rahmen `vorschau?sxtupo=buehne-farbe&rev=2` antwortet erst nach der Prüfung von rev 2 (044 D-01). CI: 3907–4595 ms, sonst bei Testende offen ≥ 5287 bis ≥ 11 014 ms (16 rote Spuren); `rahmenBereit` beginnt 0,06–0,11 s nach dem Senden und gibt nach 5 s auf; `GET stato` wartet auf dieselbe Prüfung. Die eigene Rechenzeit der Prüfung ist der größte Teil: lokal 1613 / 2434 ms (Median/Max, ≥ 1 s), im CI-Unit-Job ohne Browser 1481–2772 ms (Median je Lauf); 94 % davon Prüfregeln (`validateModeloFiles` 82 %). Lokal einmal reproduziert (Chromium, Wiederholung 17): Rahmen rev 2 nach 4113 ms, `rahmenBereit` rot. | CI 43174596533 (`41b5471c…zip` WebKit, `67e59c21…zip` Firefox) und 15 weitere Spuren aus 11 Läufen; lokal `de931e40`, `messung-044` (19:24), Reihe `zweitfarbe-vorher` Stufe (1) | **K2:** 5-s-`expect.poll` hinter einer Serverrechnung (Q-2); die Schwester-Variante, die auf ein Antwort-Ereignis wartet, ist 0/11 rot (B-01). **K1:** Im Eroj-Job dauert dieselbe Prüfung 1,6- bis 4-mal so lang wie im Unit-Job desselben Laufs (B-02). | T2 (K4), T3 (K2) – offen |
| T-B `zweitfarbe-036.spec.ts:196`, Schnellstart (Farbschritt), Wartestelle `schrittBereit` → `abrufBeantwortet(…/pruefung)` (`geladen-042.ts:178`/`:144`, Testzeile `:216`) | Firefox, WebKit, Chromium | **K4 Prüfung** | `POST /api/marko/dukolora-rahmen-30/pruefung` ist die erste Prüfung der neuen Marke (rev 1); in allen 18 roten Spuren bei Testende **unbeantwortet, offen ≥ 4436 bis ≥ 6254 ms**; der Poll beginnt 0,1–0,3 s nach dem Senden. Rechenzeit wie T-A (lokal 1613 / 2434 ms, CI-Unit 1,5–2,8 s). | CI 43174596533 (`be961280…zip` WebKit, `401a69b4…zip` Firefox) und 16 weitere Spuren; lokal wie T-A | **K2** wie T-A (5-s-Poll kurz nach Beginn der Prüfung; B-01). **K1** wie T-A (B-02). | T2 (K4), T3 (K2) – offen |
| T-C `buehne-036.spec.ts:463` 3.4, nach „Schließen“ (`location.reload()`), Wartestelle `knopf(page, VORSCHLAG)` → `button.evaluate` im `expect.poll` (`:260` über `:264`, aus `:500`) | Firefox | **K4 Navigation** | Nach dem Neuladen holt Firefox **jeden Rahmen zweimal mit derselben URL**: Spur 6,682/6,688 s und 7,070/7,064 s (2. Antwort 422/428 ms), die `vorschau.css` der ersten Dokumente wird abgebrochen. `geladen()` nimmt das erste Dokument (7,33 s), die zweite Navigation zerstört den Kontext des **Rahmens** „Mit dem Vorschlag“ unter `knopf` (7,425 s: „Execution context was destroyed“); die Seite lädt nur einmal. Auf `de931e40` bestätigt (Rahmen-Probe, 10/10): 2 Anfragen je Rahmen nach jedem Neuladen bei nur **einer** `src`-Zuweisung des Clients; die zusätzliche Navigation ist die Wiederherstellung durch Firefox, die zweite die Zuweisung von `refreshFrame()` mit derselben URL. Chromium/WebKit: 1 Anfrage. | CI 42376059543 (`27f383b2…zip`, `7f4b65d`); Rahmen-Probe 21:40–21:44 auf `de931e40` | **K3:** `knopf()` liest über `frameLocator(…).evaluate` im Rahmen statt über `contentDocument` der Seite, und `rahmenBereit` kann das erste (wiederhergestellte) Dokument nicht vom zweiten unterscheiden (gleiche URL, `complete`). Seit Spec 044 in 0/10 CI-Läufen rot (B-05): Das Fenster ist eng (lokal ≈ 130–460 ms zwischen beiden Anfragen). | T3 (K4 Navigation rot zuerst im Client, Q-3; dazu K3) – offen |
| T-D `buehne-036.spec.ts:545` 3.5, Wartestelle `expect(markiert.first()).toBeVisible()` (`:567`, CI) bzw. `expect(jetzt.locator("fm-pagxo").first()).toBeVisible()` (`:554`, lokal) im `frameLocator` von „Jetzt“ | Firefox | **K3** | Die Erwartung im `frameLocator` startet nach einer Navigation des Rahmens und **endet nie** (Protokoll `with timeout 5000ms`, danach nur `waiting for …`; Test-Timeout 120 s). Von den neuen Rahmendokumenten gibt es **keinen** `frame-snapshot`: Playwright-Firefox hat ihren Kontext nicht. Im Weg steht keine Anfrage: Das Produkt navigiert jeden Rahmen genau **einmal** (CI: je eine Anfrage rev 2, 1/3 ms; Rahmen-Probe (G): 1 Anfrage, 1 Zuweisung, 10/10). Die Prüfung liegt in `festlegen` (2842 ms), nicht im Rahmen. Lokal reproduziert (Firefox, Wiederholung 22): dasselbe schon beim ersten `oeffne()`. Dasselbe Muster bei `buehne-036:711` 3.6 (CI 42459842953 und lokal 4×, je nach dem Wechsel auf `scheme=dark`; B-04). | CI 43174596533 (`962eebe0…zip`, Shard 2); lokal Reihe `buehne-vorher` (`de931e40`, nur zur Information, B-08) | **K5:** Playwright-Firefox hält das eigene Fenster (5000 ms) nicht ein und bekommt den Kontext des neu geladenen Rahmens nicht; nur Firefox (CI 2 Spuren, lokal 5 Spuren, 0 in Chromium/WebKit). **K1:** Alle lokalen Treffer lagen in der Zeit fremder Test-Last (20:40–21:33), der CI-Treffer im Dispatch mit drei Engines je Shard. Die frühen Hypothesen K4/K1 (kalte Prüfung im Rahmen) und „intercepts pointer events“ sind verworfen (keine Aktion hängt, Rahmen 1–3 ms). | T3 (K3: Zustand vor jeder Erwartung/Aktion im Rahmen von der Seite aus lesen) – offen |
| T-E `achsen-2b2.spec.ts:82` A-markobutono-1, `page.keyboard.press("Tab")`, dann `toBeFocused` (`:94`) | WebKit unter macOS | **K5** | macOS-WebKit fokussiert `[part="control"]` (`<button role="checkbox">`, `tabIndex` 0) mit `Tab` nicht (`activeElement` bleibt `BODY`), wohl mit `Alt+Tab` und `focus()`; den `<select>` erreicht es mit `Tab`. Chromium/Firefox auf macOS: `Tab` fokussiert. Linux-WebKit (CI): 11/11 grün. Lokal 30/30 rot, immer „Received: inactive“ (`:94`). Die Komponente ist auf jeder Plattform gleich (kein fehlendes `tabindex`). | Plattform-Probe 21:38 (`de931e40`); Reihe `achsen-vorher`; CI-JUnit 11 Läufe | – | T4 (K5, Q-4) – offen |


## Zeitleisten aus den CI-Traces (T1, gelesen am 2026-11-12)

**Gesichert** (Q-8, vor allem anderen; je Artefakt ein neuer leerer Ordner `…/fundamento-wt-mwdq3cluiyydrirx/s050-spur/<lauf>-<artefakt>/`, nur gelesen, nichts daraus ausgeführt; Auswertung mit eigenen Skripten in `/tmp/s050/`, Python mit `-I`): je Lauf `testberichte-eroj-{1..4}-1` und `testberichte-unit-metiejo-1`. Alle angefragten Artefakte waren abrufbar (Ablauf laut API 2026-11-14 bis 2026-11-19).

| Lauf | PR / Ereignis | Kopf | Engines | gesichert | Ablauf |
|---|---|---|---|---|---|
| 42376059543 | #155, `workflow_dispatch` | `7f4b65d` | alle drei | eroj 1–4, metiejo (ohne `messung-044.json`, vor Spec 044) | 2026-11-14 |
| 42376047412 | #155, `pull_request` | `7f4b65d` | – | **kein Eroj-Artefakt**: die vier Eroj-Jobs liefen 6–7 s (nicht betroffen) | – |
| 42459704793 | #158, `pull_request` | `f168fa9` | – | **kein Eroj-Artefakt**: Eroj-Jobs 5–8 s (nicht betroffen); #158 hatte keinen Dispatch | – |
| 42459842953 | Push `main` nach #158 | `626043f` | alle drei | eroj 1–4, metiejo | 2026-11-15 |
| 42438357281 | `schedule` `main` | `76158a0` | alle drei | eroj 1–4, metiejo | 2026-11-15 |
| 43055211973 | #162, `workflow_dispatch` | `2d0ab01` | alle drei | eroj 1–4, metiejo | 2026-11-18 |
| 43055188183 / 43061567714 | #162, `pull_request` | `2d0ab01` / `47137c9` | – | **kein Eroj-Artefakt**: Eroj-Jobs 6–8 s (nicht betroffen) | – |
| 43061736826 | Push `main` nach #162 | `6374f18` | alle drei | eroj 1–4, metiejo | 2026-11-18 |
| 43141079995 | `schedule` `main` | `6374f18` | alle drei | eroj 1–4, metiejo | 2026-11-19 |
| 43174586258 | #163, `pull_request` | `ba10d34` | alle drei | eroj 1–4, metiejo | 2026-11-19 |
| 43174596533 | #163, `workflow_dispatch` | `ba10d34` | alle drei | eroj 1–4, metiejo | 2026-11-19 |
| 43196288663 | #163, `pull_request` (2.) | `261268b` | alle drei | eroj 1–4, metiejo | 2026-11-19 |
| 43196281747 | #163, `workflow_dispatch` (2.) | `261268b` | alle drei | eroj 1–4, metiejo | 2026-11-19 |
| 43200873975 | Push `main` nach #163 (= Basis `de931e40`) | `de931e4` | alle drei | eroj 1–4, metiejo | 2026-11-19 |

„Nicht mehr abrufbar“: nichts. Es fehlen nur Eroj-Artefakte von Läufen, in denen die Eroj-Jobs gar nicht liefen.

### Ergebnis je Test und Engine in den 11 Läufen mit Eroj (JUnit, `hostname` = Engine)

Ein Shard enthält die Tests mehrerer Engines (Shard 2: Chromium + Firefox, Shard 3: Firefox + WebKit, Shard 4: WebKit). CI wiederholt nicht; jeder Treffer macht den Job rot.

| Test | Chromium | Firefox | WebKit | Läufe mit mindestens einem Rot |
|---|---|---|---|---|
| T-A `zweitfarbe-036:129` **Assistent** | 3/11 | 7/11 | 6/11 | 11/11 |
| T-A `:129` Schnellstart | 0/11 | 0/11 | 0/11 | 0/11 |
| T-B `:196` Assistent | 0/11 | 0/11 | 0/11 | 0/11 |
| T-B `zweitfarbe-036:196` **Schnellstart** | 5/11 | 7/11 | 6/11 | 11/11 |
| T-C `buehne-036:463` | 0/11 | 1/11 (nur 42376059543, `7f4b65d`, vor Spec 044) | 0/11 | 1/11 |
| T-D `buehne-036:545` | 0/11 | 1/11 (nur 43174596533) | 0/11 | 1/11 |
| T-E `achsen-2b2:82` (Linux) | 11/11 grün | 11/11 grün | **11/11 grün** | 0/11 |

T-A rot heißt immer die Variante „Assistent“ (Meldung `the frame iframe[data-mt-vorschau] is loaded ({"rev":2})`, `geladen-042.ts:111` über `:224`, `zweitfarbe-036.spec.ts:157`); T-B rot heißt immer die Variante „Schnellstart“ (`the page's request to /api/marko/dukolora-rahmen-30/pruefung is answered`, `geladen-042.ts:144` über `:178`, `zweitfarbe-036.spec.ts:216`). In Firefox und WebKit sind T-A und T-B in genau denselben Läufen rot, in Chromium ist T-A eine Teilmenge von T-B: dieselbe Lage im Shard trifft beide.

### T-A: `zweitfarbe-036:129` Assistent (Firefox, WebKit, Chromium)

Ablauf: `entwurfGespeichert` wartet auf `POST …/entwurf` (rev 2), dann `rahmenBereit(page, VORSCHAU, { rev: 2 })` mit `expect.poll` unter 5 s. Den Rahmen `vorschau?sxtupo=buehne-farbe&rev=2` (ohne `propono`) beantwortet der Server erst nach der Prüfung **seines** `rev` (Spec 044 D-01); `GET stato` desselben `rev` wartet auf dieselbe Prüfung.

Spur 43174596533, WebKit (`41b5471c…zip`, Shard 4): Tippen 10,19 s → `POST entwurf` 10,42 s (10 ms, rev 2) → Rahmen rev 2 gesendet 10,44 s → `rahmenBereit` ab 10,54 s, rot nach 4,48 s Schrittdauer (Fenster 5 s) → Rahmen bis Testende (15,72 s) **unbeantwortet** (≥ 5,3 s), `GET stato` ab 10,61 s ebenso. Firefox (`67e59c21…zip`, Shard 3): `entwurf` 11,48 s, Rahmen rev 2 11,49 s, `rahmenBereit` ab 11,55 s rot, Rahmen bis Testende (18,3 s) unbeantwortet (≥ 6,8 s).

Über alle 16 roten T-A-Spuren (Spalte = Start in s ab Testbeginn : Dauer in ms, `offen>=` = bei Testende unbeantwortet):

| Lauf | Engine | `GET /asistanto/…` (rev 1, erstes Laden) | Rahmen `buehne-farbe` rev 1 | Rahmen `buehne-farbe` **rev 2** | `GET stato` hinter rev 2 |
|---|---|---|---|---|---|
| 42376059543 | Firefox | 4814 | 8 | 4327 | 4051 |
| 42438357281 | WebKit | 5656 | 55 | 4495 | 4265 |
| 42459842953 | WebKit | 5528 | 56 | 4544 | 4129 |
| 43055211973 | Firefox | 6102 | 3 | offen ≥ 11 014 | offen ≥ 8101 |
| 43055211973 | WebKit | 5505 | 40 | offen ≥ 5476 | offen ≥ 4918 |
| 43061736826 | Chromium | 6240 | 9 | 4068 | 3767 |
| 43061736826 | Firefox | 5980 | 14 | offen ≥ 6700 | offen ≥ 3579 |
| 43141079995 | Chromium | 5960 | 8 | 3995 | 3502 |
| 43174586258 | Firefox | 5753 | 5 | offen ≥ 6156 | offen ≥ 6129 |
| 43174586258 | WebKit | 5945 | 32 | offen ≥ 5633 | offen ≥ 5023 |
| 43174596533 | Firefox | 5728 | 10 | offen ≥ 6808 | offen ≥ 3592 |
| 43174596533 | WebKit | 5369 | 58 | offen ≥ 5287 | offen ≥ 5115 |
| 43196281747 | Firefox | 6197 | 7 | offen ≥ 10 616 | offen ≥ 7663 |
| 43196288663 | Chromium | 5676 | 5 | 3907 | 3816 |
| 43200873975 | Firefox | 6539 | 4 | 4595 | 4271 |
| 43200873975 | WebKit | 5392 | 74 | 4476 | 4177 |

Zwischen dem Senden des Rahmens rev 2 und dem Beginn von `rahmenBereit` liegen 0,06–0,11 s; das 5-s-Fenster beginnt also praktisch mit der Prüfung. Der Rahmen rev 1 (Prüfung schon im Speicher, weil `GET /asistanto/…` sie gerechnet hat) braucht 3–74 ms.

### T-B: `zweitfarbe-036:196` Schnellstart (Firefox, WebKit, Chromium)

Ablauf: Der Test hält jede Antwort der Vorschau zurück, bis `seiteBereit` steht, gibt sie frei und wartet in `schrittBereit` mit `abrufBeantwortet` (Resource Timing, `expect.poll` unter 5 s) auf `POST /api/marko/dukolora-rahmen-30/pruefung` – die **erste Prüfung der frisch angelegten Marke** (rev 1).

Spur 43174596533, WebKit (`be961280…zip`): `goto` 1,75 s (Seite 69 ms) → `POST pruefung` gesendet 2,50 s → Rahmen `farbe` rev 1 2,55 s (104 ms, wartet nicht auf die Prüfung) → `abrufBeantwortet` ab 2,77 s, Lesungen bei 2,77/2,89/3,21/3,75/4,94/5,96/6,98 s, rot → `POST pruefung` bis Testende (7,32 s) **unbeantwortet**. Firefox (`401a69b4…zip`): `POST pruefung` 3,16 s, bis Testende (8,31 s) unbeantwortet.

`POST /pruefung` (rev 1) in allen 18 roten T-B-Spuren: **unbeantwortet bei Testende, offen ≥ 4436 bis ≥ 6254 ms** (Chromium ≥ 4436/4550/4677/4684/5074, Firefox ≥ 5430–6254, WebKit ≥ 4759–5383). Der Poll beginnt 0,1–0,3 s nach dem Senden.

### T-C: `buehne-036:463` 3.4 (Firefox) – nur Lauf 42376059543

Spur `27f383b2…zip` (#155-Dispatch, Kopf `7f4b65d`, **vor** Spec 044): „Schließen“ 6,53 s → `GET /asistanto/…` (Neuladen, `location.reload()` im Client) 6,64 s, genau **ein** Dokument der Seite (kein zweites Neuladen durch `stato`; der letzte `stato` antwortete 6,45 s vorher). Danach **je Rahmen zwei Anfragen mit derselben URL**:

| Rahmen | 1. Anfrage | `vorschau.css` des 1. Dokuments | 2. Anfrage |
|---|---|---|---|
| „Jetzt“ (`rev=1`, Frame `…4a4765`) | 6,682 s (1 ms) | 6,893 s, nach 169 ms abgebrochen (Status −1) | 7,070 s (422 ms) |
| „Mit dem Vorschlag“ (`propono=gvidkoloro&rev=1`, `…367e14`) | 6,688 s (1 ms) | 6,899 s, nach 152 ms abgebrochen | 7,064 s (428 ms) |

`geladen(page, alt)` war bei 7,33 s erfüllt (beide Rahmen `complete`, URL = `src`, rev 1 – das erste Dokument). `knopf(page, VORSCHLAG)`: `toBeVisible` 7,357 s grün, dann `button.evaluate` im `expect.poll` (`buehne-036.spec.ts:260` über `:264`, gerufen aus `:500`) bei 7,425 s → **`locator.evaluate: Execution context was destroyed`**: Es stirbt der Kontext des **Rahmens** „Mit dem Vorschlag“ (nicht der Seite), als das zweite Dokument (Antwort ≈ 7,49 s) das erste ersetzt; die Stylesheets der zweiten Dokumente starten 7,505/7,520 s. `bildschirm()`, `kachelnOf` und `dokument()` liefen vorher fehlerfrei (5,32–6,53 s).

Seit Spec 044 (`76158a0`) in 10 Läufen mit Firefox kein Rot. Ob die doppelte Navigation auf `de931e40` noch auftritt, zeigt die Rahmen-Probe (unten).

### T-D: `buehne-036:545` 3.5 (Firefox) – nur Lauf 43174596533

Spur `962eebe0…zip` (Shard 2): erstes `oeffne()` 1,56 s (`GET /asistanto/…` 3659 ms, Rahmen rev 1 je 4/11 ms) → `festlegen` 8,18 s, **2842 ms** (rechnet die Prüfung des Kandidaten, Spec 044 D-22) → zweites `oeffne()` (`page.goto` derselben URL) 11,02 s: `GET /asistanto/…` **5 ms**, Rahmen rev 2 je **1 und 3 ms** (je Rahmen genau **eine** Anfrage), `vorschau.css` 551/665 ms → `geladen()` 13,01–13,28 s grün (beide Rahmen rev 2, hell) → Schieber `focus` 13,29 s, `End` 13,32 s → **`expect(markiert.first()).toBeVisible()` (`:567`) ab 13,338 s, Protokoll: `… with timeout 5000ms`, `waiting for locator('[data-mt-buehne] iframe[data-mt-vorschau]').contentFrame().locator('[data-mt-pruefung="offen"]').first()` – danach keine Zeile mehr; der Aufruf endet nie** (kein `after` im Trace), Test-Timeout bei 127,4 s.

Was im Weg steht: **keine Anfrage und keine Navigation.** Zwischen 13,34 und 120 s gibt es nur den `stato`-Takt alle 3 s (je 1–5 ms, rev unverändert). Die `frame-snapshot`s zeigen: Für die Rahmen des **ersten** Dokuments (`…6216be45`, `…1d35a9ee`) nahm Playwright 16 Schnappschüsse (7,58–11,05 s); für die Rahmen des **zweiten** Dokuments (`…902b68`, `…57a1a7`) **keinen einzigen**, obwohl die Seite sie ab 13,00 s referenziert. Playwright-Firefox hatte für die neuen Rahmen keinen Ausführungskontext; die Erwartung im `frameLocator` wartet darauf, ohne ihr eigenes Fenster von 5 s einzuhalten.

Die frühen Hypothesen der Implementierungs-Spec (§2.3) zu T-D treffen nicht zu: Keine Aktion `hover`/`focus`/`evaluate` hängt (die Zeile `:567` ist eine Erwartung davor), kein „intercepts pointer events“/„element is not stable“ im Protokoll, und die kalte Prüfung liegt in `festlegen` (2,8 s), nicht im Rahmen (1–3 ms).

**Zweite Spur desselben Musters** (nicht in Spec 050, Befund): Lauf 42459842953, Firefox, `buehne-036:711` „3.6: axe … dunkel, schmal“ (`137426…zip`): Klick „Dunkel“ 11,09 s → beide Rahmen navigieren je **einmal** zu `scheme=dark` (11,244/11,252 s, 1 ms; CSS 3–7 ms) → `expect(jetzt.locator("html")).toHaveAttribute(…, "dark")` ab 11,321 s, `with timeout 5000ms`, endet nie, Test-Timeout 126,3 s. Schnappschüsse der beiden Rahmen enden 11,18/11,20 s (vor der Navigation), danach keiner.

### T-E: `achsen-2b2:82` – CI unter Linux

In allen 11 Läufen grün, in Chromium, Firefox **und Linux-WebKit** (JUnit). Rot ist der Test nur lokal unter macOS (Plattform-Probe unten).

## Messungen

### Lokal vorher (T1, `messung-044.test.ts`, V-2)

**Rechner:** Apple M1 Max, 10 Kerne, macOS 26.5.1, Node v24.21.0. **Code:** `de931e40`, gebaut mit `pnpm turbo run build --filter=@fundamento/cli...` (Cache-Treffer, 10/10). **Zeit:** 2026-11-12, 19:24–19:26 Ortszeit, unter der Sperre. **Befehl:** `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo exec vitest run src/messung-044.test.ts` (Server aus `dist`, Prüfung im Worker), 20/20 grün in 132,7 s. **N = 10** (n = 60 je Zeile, mit Vorschlag n = 10). **Last:** `uptime` vorher 11,24 / nachher 8,09 (1 min; Rest früherer Arbeit, siehe D-12). Fremde Test-Prozesse: keine (nur drei ruhende `playwright-mcp --headless`, je 0,0 % CPU). Grundlast vom Desktop: WindowServer ≈ 0,4, p0 ≈ 0,7, eine virtuelle Maschine ≈ 0,2–2,0 Kerne (schwankt), Telegram, Claude. Bericht außerhalb des Repos: `…/fundamento-wt-mwdq3cluiyydrirx/s050-mess/messung-044-vorher.json`.

In ms, Median / Max. „kalt“ = erste Anfrage nach dem `rev`-Wechsel. Die Spalte „CI vorher“ kommt aus den `messung-044.json` des Unit-Jobs (ohne Browser, ein Server) und aus den Eroj-Traces (mit Browsern im Shard).

| Route | Schritt | lokal kalt | lokal warm | CI vorher |
|---|---|---|---|---|
| `POST /pruefung` | `ableitung+pruefung` | **1613 / 2434** | – (im Speicher) | Unit-Job: Median 1481–2772, Max 2054–3766 (10 Läufe, n = 12 je Lauf) |
| | **gesamt** | **1614 / 2438** | 0,1 / 0,7 | Eroj-Traces, erste Prüfung einer neuen Marke (T-B): **offen ≥ 4436 bis ≥ 6254** in 18/18 roten Spuren |
| | davon Ableitung (CPU-Profil, unten) | ≈ 99 | | Unit-Job `derivationBasis` allein: 100–179 |
| | davon Prüfregeln (CPU-Profil, unten) | ≈ 1649 | | – |
| Rahmen `vorschau?sxtupo=buehne-farbe` (Prüfung im Speicher) | gesamt | 0,2 / 0,6 | 0,2 / 0,3 | 3–74 (rev 1, nach `GET /asistanto/…`) |
| Rahmen `buehne-farbe` eines **neuen** `rev` (wartet auf die Prüfung, D-01 aus 044) | gesamt | = Prüfung (≈ 1,6 s) | | **3907–4595**, sonst offen ≥ 5287 bis ≥ 11 014 (T-A, 16 Spuren) |
| Rahmen `vorschau?sxtupo=farbe` | gesamt | 0,2 / 7,2 | 0,1 / 0,5 | 2–184 (T-B) |
| `GET stato` (Prüfung im Speicher) | gesamt | 0,4 / 11,6 | 0,2 / 0,6 | 1–5 (T-D, `stato`-Takt alle 3 s über 107 s) |
| `GET stato` hinter der Prüfung eines neuen `rev` | gesamt | – | | 3502–4271, sonst offen ≥ 1918 bis ≥ 8101 (T-A) |
| `GET stato` B während `POST /pruefung` A (außen) | gesamt | 0,8 / 2,0 | | Unit-Job 1,1 / 1,2 |
| `GET vorschau.css` | `ableitung` | 103,9 / 186,6 | – | Unit-Job 189 / 247 (Lauf 43174596533) |
| | gesamt | 155,4 / 259,5 | 0,5 / 5,1 | Unit-Job Median 162–297; Eroj-Traces 551–1065 |
| `GET /asistanto/…` erstes Laden einer neuen Marke (rechnet die Prüfung von rev 1) | gesamt | 1987 (Ende-zu-Ende, roter T-A-Lauf in `zweitfarbe-vorher`, Chromium, 1 Spur) | | **4814–6539** (T-A, 16 Spuren); T-D 3659 |
| `POST …/festlegen` (Prüfung des Kandidaten) | gesamt | – | | 2842 (T-D), 7810 (3.6, Lauf 42459842953) |

**CI-Rechner (Unit-Job, `messung-044.json`):** Die Prüfung allein hängt stark vom Runner ab: AMD EPYC 9V45 (42438357281, 43200873975) Median 1481 / 1629 ms; EPYC 9V74 (43141079995) 2106 ms; Xeon 8573C (43174586258, 43174596533) 2446 / 2513 ms; EPYC 7763 (42459842953, 43055211973, 43061736826, 43196281747, 43196288663) 2669–2772 ms. Auf demselben Runner-Typ mit Browsern im Shard (Eroj-Job) dauert dieselbe Prüfung 3,9 s bis über 11 s.

### CPU-Profil der Prüfung (T1, Probe außerhalb des Repos)

**Probe:** `/tmp/s050/probe/profil.mjs` (Wegwerf, nicht committet) gegen `packages/metiejo/dist/vorschau.js` und `packages/agordilo/dist`: wie der Worker (`loadBases()`, ein `readAgordo` des Start-`Agordo` für den Validator), dann eine Prüfung von rev 1 der erfundenen Marke „Probekolora“ (Basis `leer`), dann **N = 10 Prüfungen, die sich je nur in der Zweitfarbe unterscheiden** (erfundene Farben `#0f8f86`, `#17b3a8`, …). Profil nur über diese 10 (`node:inspector`, Abtastung 100 µs), ausgewertet nach inklusiver Zeit je Funktion (`/tmp/s050/probe/auswerten.py`, `unter.py`). Unter der Sperre, 19:27, `uptime` 6,62 → 9,23. Wandzeit je Prüfung mit Profiler 1713–2292 ms (Median ≈ 1890; ohne Profiler 1613 ms, oben).

| Schritt | Code | ms je Prüfung | Anteil |
|---|---|---|---|
| **Ableitung** | `derivationBasis` | 87,3 | 5,0 % |
| | `buildModelo(composeFiles(…))` für das Themes-Fragment (`derive.ts:181`) | 9,3 | 0,5 % |
| | `packageDocuments`, `composeFiles`, `deriveThemeFragment`, Serialisierung | 3,7 | 0,2 % |
| | **Summe Ableitung** | **≈ 100** | **≈ 5,7 %** |
| **Prüfregeln** (`checkAspekto`, `check.ts:235`) | `validateModeloFiles` (`packages/modelo`, **tabu**) | **1429,4** | **81,7 %** |
| | – darin `regularoEnforcementIssues` | 650,2 | 37,2 % |
| | – darin `combinationIssues` (davon `resolutionsOf` 493,5) | 497,9 | 28,5 % |
| | – darin `aspirojIssues` (`aspirojMissedIssues`) | 162,1 | 9,3 % |
| | – darin `fontIssues` / `skemoIssues` / `schemaIssues` / Rest | 58,4 / 21,1 / 11,6 / 28,1 | 6,8 % |
| | `evaluateAlirebleco` | 171,9 | 9,8 % |
| | `explain`, `pairsOf`, eigene Zeilen | 37,8 | 2,2 % |
| | zweites `buildModelo` (`check.ts:243`) | 7,1 | 0,4 % |
| | **Summe Prüfregeln** | **≈ 1649** | **≈ 94,3 %** |

Die Hypothese „zwei `buildModelo` je Prüfung“ (Implementierungs-Spec §2.2/T2) ist als Kostenfaktor **verworfen**: beide zusammen ≈ 16 ms (< 1 %). Die Zeit liegt in `validateModeloFiles` aus `packages/modelo` (tabu) und in `evaluateAlirebleco`.

### Lokal Ende-zu-Ende (aus den Spuren der Vorher-Reihen)

Aus dem einzigen lokalen roten T-A-Lauf (`zweitfarbe-vorher`, Chromium, Wiederholung 17, `de931e40`, zwei Worker, drei Engines): `GET /asistanto/…` (rev 1, erstes Laden) 1987 ms, Rahmen `buehne-farbe` rev 2 **4113 ms** (hinter der Prüfung von rev 2), `GET stato` dahinter 2178 ms. Grüne Spuren für Zeiten (Extra-Reihe `--trace on --repeat-each=5`, D-16) sind **offen** – blockiert durch fremde Test-Last (B-08). Damit fehlt auch der Abstand „Senden `POST /pruefung` → Beginn des Polls“ für die grüne Variante Schnellstart `:129` (B-01); die Aussage von B-01 stützt sich auf die CI-Raten (0/11 gegen 11/11).


## 30/30 vorher (V-3, AC-4)

Alle Reihen aus `packages/eroj` auf `de931e40` (gebaut, D-09), unter der Sperre, allein (keine fremde Test-Last), mit dem Skript `/tmp/s050/reihe.sh` (Kopf mit `uptime`, fremden Test-Prozessen, Top-CPU; Stichproben `fremdlast.sh` alle 30 s). Ausgabe, `test-reports/` und `test-results/` jeder Reihe außerhalb des Repos unter `…/fundamento-wt-mwdq3cluiyydrirx/s050-lokal/<reihe>/` (kopiert, bevor die nächste Reihe `test-results/` leert). Stufen nach D-13: **(1) CI-ähnlich**, **(2) CPU begrenzt** (6 Busy-Loops).

### Reihen

| Reihe | Stufe | Befehl (aus `packages/eroj`) | Zeit (Ortszeit) | Dauer | `uptime` 1 min vorher → nachher | VM (Docker) Mittel / Max | Ergebnis |
|---|---|---|---|---|---|---|---|
| `zweitfarbe-vorher` | (1) | `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test test/zweitfarbe-036.spec.ts --workers 2 --repeat-each=30` | 19:28–19:56 | 1655 s | 10,91 → 16,22 | 1,31 / 3,41 Kerne | 449 grün, 1 rot |
| `buehne-vorher` | (1) | `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test test/buehne-036.spec.ts --workers 2 --repeat-each=30` | 19:57–21:33 | 5789 s | 12,72 → 23,81 | 0,89 / 3,07 Kerne | 1704 grün, 6 rot; **ab 20:40 unter fremder Test-Last (B-08): nur zur Information, zählt nicht für AC-4** |
| `achsen-vorher` | (1) | `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=webkit pnpm exec playwright test test/achsen-2b2.spec.ts --workers 2 --repeat-each=30` | 21:45–22:26 | 2453 s | 13,39 → 67,74 | 0,81 / 2,38 Kerne | 1350 grün, 30 rot (alle `:82`); ab 22:10 fremde Eroj-Suite (B-08); der Zieltest war bis 22:05 schon 29/30 rot, das 30. Rot bis 22:15 |
| `buehne-vorher-2` (Wiederholung von `buehne-vorher` ohne fremde Last) | (1) | wie `buehne-vorher` | **offen** – blockiert durch fremde Test-Last (B-08, seit 22:10 fast ohne Pause) | | | | |
| Shard 2/4 (Q-5, einmal) | (1) | `--list`-Nachweis, dann `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test --shard 2/4 --workers 2` | **offen** – blockiert wie oben | | | | |
| `zweitfarbe-vorher-cpu` | (2) | wie `zweitfarbe-vorher`, mit 6 Busy-Loops (D-13) | **offen** – blockiert wie oben | | | | |
| `buehne-vorher-cpu` | (2) | wie `buehne-vorher`, mit 6 Busy-Loops (D-13), nur falls `buehne-vorher-2` T-C oder T-D in Firefox 30/30 lässt | **offen** | | | | |

### Tabelle (V-3)

| Test | Engine | vorher x/30, Stufe (1) CI-ähnlich (`de931e40`) | vorher x/30, Stufe (2) CPU begrenzt (`de931e40`) | nachher x/30 (T5, gleiche Stufen) | Befund / Trace |
|---|---|---|---|---|---|
| T-A `zweitfarbe-036:129` Assistent | Chromium | **29/30** | offen | offen | 1 rot (Wiederholung 17): `rahmenBereit` rev 2, Rahmen rev 2 nach 4113 ms (hinter der Prüfung), `s050-lokal/zweitfarbe-vorher/test-results/zweitfarbe-036-the-assista-ccadb-h-the-keyboard-then-cleared-chromium-repeat17/trace.zip` |
| | Firefox | 30/30 | offen | offen | – |
| | WebKit | 30/30 | offen | offen | – |
| T-A `:129` Schnellstart | Chromium / Firefox / WebKit | 30/30 / 30/30 / 30/30 | offen | offen | nie rot (CI 0/11) |
| T-B `zweitfarbe-036:196` Schnellstart | Chromium | 30/30 | offen | offen | lokal in Stufe (1) nicht reproduziert; CI 5/11 rot |
| | Firefox | 30/30 | offen | offen | lokal in Stufe (1) nicht reproduziert; CI 7/11 rot |
| | WebKit | 30/30 | offen | offen | lokal in Stufe (1) nicht reproduziert; CI 6/11 rot |
| T-B `:196` Assistent | Chromium / Firefox / WebKit | 30/30 / 30/30 / 30/30 | offen | offen | nie rot (CI 0/11) |
| T-C `buehne-036:463` 3.4 | Chromium / Firefox / WebKit | 30/30 / 30/30 / 30/30 – **nur zur Information** (`buehne-vorher`, fremde Last ab 20:40); gültige Reihe `buehne-vorher-2` offen | offen | offen | lokal nicht reproduziert; Ursache aus der CI-Spur und der Rahmen-Probe (V-1) |
| T-D `buehne-036:545` 3.5 | Chromium / Firefox / WebKit | 30/30 / **29/30** / 30/30 – **nur zur Information** (wie oben); gültige Reihe offen | offen | offen | Firefox Wiederholung 22 (≈ 20:41, unter fremder Last): Erwartung `:554` im `frameLocator` endet nie, Test-Timeout; `s050-lokal/buehne-vorher/test-results/buehne-036-Bühne-Spec-036--a962f-tence-on-hover-and-on-focus-firefox-repeat22/trace.zip` |
| T-D im Shard 2/4 | alle drei | offen (Shard-Lauf blockiert) | – | offen | – |
| T-E `achsen-2b2:82` | WebKit (macOS) | **0/30** (30/30 rot, deterministisch) | – (Stufe (2) nicht nötig, D-13) | offen | jedes Rot `toBeFocused` → „inactive“ (`:94`); Traces `s050-lokal/achsen-vorher/test-results/achsen-2b2-②b-2-A-markobut-0b614-r-its-label-sends-its-value-webkit*/` |

**Mitgezählt, nicht Ziel der Spec** (`buehne-vorher`, nur Information): `buehne-036:711` 3.6 dunkel/schmal Firefox 27/30, dunkel/breit Firefox 29/30 (B-09); `buehne-036:324` 3.2 WebKit 29/30 (B-10). Alle anderen Tests der drei Dateien 30/30 in jeder Engine.

**Was die Vorher-Raten sagen:** Stufe (1) zeigt T-A selten (1/90) und T-B gar nicht – der Rechner ist auch mit drei Engines und zwei Workern schneller als der Runner (Prüfung lokal 1,6 s gegen 2,5–2,8 s im CI-Unit-Job). Die Ursache von T-A/T-B kommt deshalb aus den 34 roten CI-Spuren und dem einen lokalen Rot; Stufe (2) soll die CI-Rate lokal zeigen und ist offen. T-C ist lokal nicht reproduziert (enges Fenster, B-05), T-D lokal nur unter fremder Last.


## Proben (T1, Wegwerf, außerhalb des Repos)

### Plattform-Probe T-E (D-14)

`/tmp/s050/probe-pw/tab.probe.ts`, 2026-11-12 21:38, unter der Sperre, macOS 26.5.1, Playwright 1.63.0 (`webkit-2359`, `firefox-1543`, `chromium-1243`), eine Seite wie `achsen-2b2:82` (`<form id="f"><fm-markobutono name="nl" checked readonly>Newsletter</fm-markobutono></form>` über `serve()`), je Taste eine frische Seite. 12/12 Proben liefen durch.

| Engine (macOS) | `[part="control"]` | `Tab` | `Alt+Tab` | `focus()` | `Tab` auf `<select>` von `fm-elektilo` (Nachbar `:56`) |
|---|---|---|---|---|---|
| Chromium | `BUTTON`, `role="checkbox"`, `tabIndex` 0, kein `tabindex`-Attribut, nicht `disabled` | **fokussiert** | fokussiert | fokussiert | fokussiert |
| Firefox | dasselbe | **fokussiert** | nicht (`activeElement` = `BODY`) | fokussiert | fokussiert |
| WebKit | dasselbe | **nicht** (`activeElement` = `BODY`) | **fokussiert** (`FM-MARKOBUTONO > BUTTON[part=control]`) | **fokussiert** | fokussiert |

Linux-WebKit (CI): `achsen-2b2:82` in 11/11 Läufen grün (Tabelle oben). Die Komponente ist überall gleich: ein `<button>` mit `tabIndex` 0. Nur macOS-WebKit lässt ihn mit `Tab` aus (Systemvorgabe „Tab nur zu Textfeldern und Listen“; der `<select>` wird erreicht), mit `Alt+Tab` erreicht es ihn. Das deckt sich mit `alirebleco.ts:7` und Spec 038 F-S038-41-5.

### Rahmen-Probe T-C / T-D (D-15)

`/tmp/s050/probe-pw/rahmen.probe.ts`, 2026-11-12 21:40–21:44, unter der Sperre, eigener Metiejo aus `packages/cli/dist` (Port 7391), Firefox 10 Wiederholungen, Chromium und WebKit je 3; 20/20 bzw. 12/12 liefen durch. Gezählt ab dem Neuladen bzw. dem zweiten `goto`.

| Fall | Engine | `src`-Zuweisungen je Rahmen (Client) | Dokumente je Rahmen (Init-Skript) | Anfragen `vorschau?…` je Rahmen | Reihenfolge |
|---|---|---|---|---|---|
| (R) Neuladen der Bühne (`location.reload()`, wie „Schließen“) | **Firefox** | **1** (10/10) | 2: das leere Startdokument (`location.href` = `""`) und das der URL | **2 mit derselben URL** (10/10) | Zwei Anfragen im Abstand von 130–461 ms, aber nur eine Zuweisung: Eine Navigation stammt nicht vom Client. Das Dokument, das bleibt, hat den `timeOrigin` der Zuweisung (147–167 ms nach dem Start der Seite), die Zuweisung des Clients (`vorschauSenden` in `refreshFrame()`) ist also die **zweite**; die erste ist die Wiederherstellung des Rahmens durch Firefox beim Neuladen (wie Spec 038 F-S038-41-3) |
| (R) | Chromium, WebKit | 1 (3/3) | 2: `about:blank` und das der URL | **1** (3/3) | Anfrage = Zuweisung |
| (G) `festlegen`, dann zweites `page.goto` (wie T-D) | Firefox | 1 (10/10) | 2: Startdokument und das der URL | **1** (10/10) | Anfrage = Zuweisung |
| (G) | Chromium, WebKit | 1 (3/3) | 2 | **1** (3/3) | Anfrage = Zuweisung |

Lesart: Auf `de931e40` navigiert jeder Rahmen der Bühne in Firefox **nach jedem Neuladen zweimal** zur selben URL; der Client weist `src` dabei nur einmal zu, die erste Navigation kommt aus der Wiederherstellung durch Firefox. In der ruhigen Probe wird die erste Navigation meist abgebrochen, bevor ihr Dokument läuft (kein Init-Skript-Eintrag); auf dem Runner (Spur 42376059543) kam ihr Dokument an, wurde `complete` und erst danach ersetzt – genau unter `knopf()`. Nach `goto` (T-D) gibt es keine doppelte Navigation.


## Befunde (T1)

| ID | Befund | Folge |
|---|---|---|
| B-01 | **Nur die Varianten mit einem 5-s-Poll hinter der Prüfung reißen.** T-A rot ist immer „Assistent“ (Rahmen `buehne-farbe` rev 2 wartet auf die Prüfung, `rahmenBereit` pollt 5 s), T-B rot immer „Schnellstart“ (`abrufBeantwortet` pollt 5 s auf `POST /pruefung`). Die Schwester-Varianten derselben Zeilen sind in 11/11 Läufen grün: Schnellstart `:129` wartet nach dem Tippen auf die Prüfung über ein Antwort-Ereignis (`entwurfGespeichert`, `page.on("response")`, nur durch das Test-Timeout begrenzt), sein Rahmen `farbe` wartet nicht auf die Prüfung; beim ersten Laden pollt er zwar auch 5 s auf `POST /pruefung`, aber erst nach `page.goto` bis `load` (Rahmen und `vorschau.css`), also später ab Beginn der Prüfung als T-B (`waitUntil: "domcontentloaded"`, Poll 0,1–0,3 s nach dem Senden) – Werte unter „Lokal Ende-zu-Ende“. Assistent `:196` wartet auf keine Prüfung (`data-mt-sxtupo` = `asistanto-gvidkoloro`, die Prüfung von rev 1 lief in `GET /asistanto/…` vor dem HTML). Dieselbe Prüfung, dasselbe Shard – rot nur, wo ein festes Fenster kurz nach ihrem Beginn liegt. | Beleg für K2 als Nebenursache von T-A/T-B (V-1). T3: `waitForResponse` vor der Aktion nach `testing.md` (Q-2). |
| B-02 | **Die Prüfung ist schon allein auf dem Runner halb so lang wie das Fenster.** Unit-Job (ein Server, kein Browser): Median 1,5–2,8 s, Max 2,1–3,8 s je nach Runner-Typ (EPYC 9V45 am schnellsten, EPYC 7763 am langsamsten). Im Eroj-Job mit zwei Playwright-Workern, Browsern und je einem Server pro Worker und Datei: 3,9–4,6 s beendet, sonst > 4,4 bis > 11 s. | Die eigene Rechenzeit ist der größte Einzelteil (K4), die Last im Shard verlängert sie um den Faktor ≈ 1,6–4 (K1, Nebenursache). |
| B-03 | **94 % der Prüfung sind Prüfregeln, 82 % allein `validateModeloFiles` (`packages/modelo`, tabu).** Ableitung ≈ 100 ms. Die zwei `buildModelo` kosten zusammen ≈ 16 ms. | Für T2: „unter 1 s“ geht nur, wenn `validateModeloFiles`/`evaluateAlirebleco` seltener oder mit wiederverwendeten Teilergebnissen laufen, ohne `packages/modelo` zu ändern und byte-gleich. Sonst Befund mit Werten (Risiko §6 der Implementierungs-Spec). Eine Zweitfarbe ändert Tokens; welche Regeln davon unabhängig sind, muss T2 belegen. |
| B-04 | **Playwright-Firefox: Erwartung im `frameLocator` hängt nach einer Navigation des Rahmens bis zum Test-Timeout**, obwohl sie `with timeout 5000ms` protokolliert. Zwei Spuren: T-D (43174596533, nach `page.goto`, neue Rahmen) und `buehne-036:711` 3.6 dunkel/schmal (42459842953, nach dem Wechsel auf `scheme=dark`, dieselben Rahmen). In beiden navigiert jeder Rahmen genau einmal, und von den neuen Rahmendokumenten gibt es keinen einzigen `frame-snapshot`. | T-D ist kein Fall von K4 (Prüfung) und keiner von „intercepts pointer events“. T3 muss eine Wartestelle finden, die nicht im `frameLocator` des gerade ersetzten Rahmens liegt (Lesen über `contentDocument` der Seite, wie `rahmenBereit`), bevor Aktionen im Rahmen folgen. `buehne-036:711` ist nicht in Spec 050 (nur Befund für den Bericht). |
| B-05 | **T-C ist seit Spec 044 in der CI nicht mehr rot** (0/10 Läufe mit Firefox ab `76158a0`), die einzige rote Spur stammt von `7f4b65d` (#155-Dispatch). | Ursache aus dieser Spur und der Rahmen-Probe auf `de931e40`. |
| B-06 | **T-E ist in Linux-WebKit grün** (11/11 Läufe). | Plattform (K5), siehe Plattform-Probe. |
| B-07 | Die CI-Läufe laufen auf verschiedenen Runner-Typen; die Prüfung im Unit-Job schwankt deshalb zwischen 1,5 und 2,8 s (Median). Auch auf dem schnellsten Typ (EPYC 9V45, Lauf 43200873975 = Basis `de931e40`) war T-A in Firefox und WebKit rot (Rahmen rev 2 nach 4595/4476 ms). | Ein Fix, der nur auf schnellen Runnern grün ist, reicht nicht; die Nachher-Reihe in T5 braucht dieselbe Last wie vorher. |
| B-08 | **Fremde Test-Last während T1.** Eine andere Sitzung im Arbeitsbaum `fundamento-wt-mwdq3k9mtj0jstz2` (eigene Sperre, nicht diese) ließ ab 20:40:09 Vitest-Suiten laufen (`modelo`, `projekcioj`, `checks/run.js alirebleco/clean-room`; in den `ps`-Stichproben 20:52 und 21:02 zusammen ≈ 1 Kern, Load 1 min bis 50) und ab 22:10:31 eine ganze Eroj-Suite (`vitest run && playwright test`, Load bis 79). Gesehen über `ps` (Startzeiten) und ab 21:37 über `/tmp/s050/fremdtest.sh`. | Die Reihe `buehne-vorher` (19:57–21:33) lief ab 20:40 unter fremder Test-Last und zählt nach §2.8 **nur zur Information**; sie wird wiederholt (`buehne-vorher-2`). Die Reihe `achsen-vorher` (21:45–22:26) lief ab 22:10 unter fremder Last; ihr Zieltest war schon vorher 29/30 rot (deterministisch, Plattform), das 30. Rot fiel zwischen 22:05 und 22:15. `zweitfarbe-vorher` (19:28–19:56), `messung-044`, Profil und Proben liefen ohne fremde Test-Last. Jede weitere Reihe startet erst, wenn 90 s lang kein fremder Test-Prozess lief (`/tmp/s050/warte-ruhe.sh`). |
| B-09 | **Lokal hängen in Firefox Erwartungen im `frameLocator` nach einer Navigation des Rahmens, wie in CI** (B-04): in `buehne-vorher` 5 Treffer (T-D 1/30; `buehne-036:711` 3.6 „dunkel, schmal“ 3/30, „dunkel, breit“ 1/30), alle Firefox, alle mit `with timeout 5000ms` und Test-Timeout 120 s, alle ohne `frame-snapshot` der neuen Rahmendokumente, alle in der Zeit fremder Test-Last (B-08). | Mechanismus von T-D lokal belegt; die Rate „CI-ähnlich“ kommt aus der Wiederholung. `buehne-036:711` ist nicht in Spec 050 (Befund für den Bericht); ein Fix für T-D in T3 sollte die gemeinsame Ursache treffen, ohne 3.6 anzufassen (Tabu: andere Tests nur, wenn frei – 3.6 steht in der freien Datei `buehne-036.spec.ts`, ist aber kein Ziel dieser Spec). |
| B-10 | `buehne-036:324` 3.2 (WebKit) einmal rot in `buehne-vorher` (Wiederholung 11): `page.evaluate: Execution context was destroyed` in `dokument()` über `seiteBereit` (`geladen-042.ts:18`/`:64`) aus `geladen()` (`buehne-036.spec.ts:129`, `:350`) – die Seite wechselte zwischen dem Poll und dem Lesen von `timeOrigin` noch einmal das Dokument. Unter fremder Last. | Nicht in Spec 050; nur Befund. |

## Gesicherte Spuren und Berichte (außerhalb des Repos)

| Was | Pfad |
|---|---|
| CI-Artefakte (je Artefakt ein Ordner, nur gelesen) | `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwdq3cluiyydrirx/s050-spur/<lauf>-testberichte-{eroj-1..4,unit-metiejo}-1/` |
| Lokale Reihen (Kopf, Ausgabe, `test-reports/`, `test-results/` mit den Traces der roten Läufe, `fremdlast.txt`, `fremdtest.txt`) | `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwdq3cluiyydrirx/s050-lokal/<reihe>/` |
| `messung-044` vorher | `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwdq3cluiyydrirx/s050-mess/messung-044-vorher.json` |
| Proben, Auswerte-Skripte, CPU-Profil (Wegwerf, nicht im Repo) | `/tmp/s050/` (`probe/`, `probe-pw/`, `profil/pruefung.cpuprofile`, `*.py`, `*.sh`) |

## Messanleitung (für T2–T5)

```sh
# Sperre (§2.8); fremde Test-Prozesse auch anderer Arbeitsbäume prüfen (B-08)
L=/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwdq3cluiyydrirx/.lauf-sperre
mkdir "$L" && printf '%s\n%s\n%s\n' "W050-Tn" "<Befehl>" "$(date -u +%FT%TZ)" > "$L/besitzer.txt"
uptime; ps -Ao pid,pcpu,command | grep -E 'vitest|playwright|cli/dist/index.js|metiejo' | grep -v grep
ps -Ao pcpu,command | grep -E '/(worktrees|workspaces)/[^ ]*/repos/' | grep -v fundamento-wt-mwdq3cluiyydrirx | grep -E 'vitest|playwright|turbo|metiejo' | grep -v grep   # leer
# Messung lokal (V-2), Bericht nach packages/metiejo/test-reports/messung-044.json
FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo exec vitest run src/messung-044.test.ts
# CPU-Profil der Prüfung (gegen dist, nach dem Bau): je Schritt Ableitung/Prüfregeln
node /tmp/s050/probe/profil.mjs <repo> 10 /tmp/s050/profil/<name>.cpuprofile && python3 -I /tmp/s050/probe/auswerten.py /tmp/s050/profil/<name>.cpuprofile 10
# Reihen (V-3), aus packages/eroj; Stufe (2) nach D-13 mit 6 Busy-Loops davor:
#   mkdir -p /tmp/s050/last && cd /tmp/s050/last && for i in 1 2 3 4 5 6; do node -e "for(;;){}" & done; …Reihe…; kill <PIDs>
FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test test/zweitfarbe-036.spec.ts --workers 2 --repeat-each=30
FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test test/buehne-036.spec.ts --workers 2 --repeat-each=30
PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test --shard 2/4 --list | grep 'buehne-036.spec.ts:545'
FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test --shard 2/4 --workers 2
FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=webkit pnpm exec playwright test test/achsen-2b2.spec.ts --workers 2 --repeat-each=30
# Zählen je Test und Engine aus der JUnit
python3 -I /tmp/s050/zaehle.py packages/eroj/test-reports/playwright/junit.xml '<Muster>'
uptime; rm -r "$L"
```
