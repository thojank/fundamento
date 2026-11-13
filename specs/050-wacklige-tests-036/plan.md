# Spec 050 – Wacklige Browser-Tests aus Spec 036 stabil machen – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `386f6db80c0e99edd5813b22b67d8481e59098ca96d48fdee3fdc7a329e3d8c5`, 16 031 Byte) · **Aufgaben:** [`tasks.md`](tasks.md) · **Basis:** `main` `de931e40` (Merge #163) · **Branch:** `261112-wacklige-browser-tests--9197f6` · **Regel 0** gilt. Keine Grenze, kein Zeitlimit, keine Toleranz, kein Takt angehoben. Nichts gemergt, nichts gepusht. Kein Sprachmodell (0 $).

**Datum:** 2026-11-12 · **Stand T3 (2026-11-13, 04:30):** K4 Navigation behoben, rot zuerst (`fd90b67b` → `de3fd057`): Firefox gab beim Neuladen jedem vom Parser angelegten Vorschau-Rahmen sein letztes Dokument zurück, der Client schickte ihn noch einmal hin; der Client legt jetzt Kopien der Rahmen an ihre Stelle. K2 (T-A, T-B, B-14) und K3 (T-C, T-D) in den Tests umgestellt (`c5147982`, `9a51b5cd`), byte-gleich, Zwischenprüfung 120/120 und 150/150 (siehe „T3“). · **Stand:** T1 – Diagnose ohne Code-Änderung: CI-Artefakte gesichert, Zeitleisten je Test, Messung lokal und aus CI, Plattform- und Rahmen-Probe und die Tabelle „Ursache je Test“ (V-1) sind fertig. **Fortsetzung 2026-11-13, 00:34–03:38:** Die offenen Vorher-Reihen liefen auf dem unveränderten Produktcode (`79a463bc` = `de931e40`, D-22) ohne fremde Test-Last: `buehne-036` Stufe (1) neu, Shard 2/4, Stufe (2) für `zweitfarbe-036` und `buehne-036`, Extra-Reihe mit Spuren. **V-3 „vorher“ ist vollständig.** Neue Befunde B-14 (WebKit: `dokument()` ist keine feste Kennung) und B-15 (B-01 für T-B teilweise widerlegt); V-1 entsprechend ergänzt.

**Stand T2 (2026-11-12, 23:45):** Prüfung geprüft auf Wiederverwendbares (D-17). Was eine neue Zweitfarbe unverändert neu rechnet und im Scope liegt, sind nur die Stufen der sechs anderen Paletten (≈ 5 % der Prüfung); sie werden jetzt je Anfrage einmal gelöst (`2f6c33a6`, rot zuerst `af045d7e`, Byte-Fixture `a9ecfa40`). Die übrigen ≈ 94 % liegen in `validateModeloFiles`/`evaluateAlirebleco` (`packages/modelo`, tabu), deren Zwischenergebnisse an der Identität des `Modelo` hängen; „unter 1 s“ ist ohne Änderung an `modelo` nicht erreichbar (B-11). Byte-Gleichheit auf Quelle und `dist` belegt. Messung nachher ohne fremde Tests: erste `/pruefung` eines neuen `rev` 1613 / 2434 → **1491 / 2103 ms** (Median / Max), `vorschau.css` 155 → 50 ms; Zwischenprüfung `zweitfarbe-036` 150/150 grün (siehe „Lokal nach T2“, „Schluss T2“).

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
| D-13 | T1 | Last-Verfahren für die Vorher-Raten (V-3), festgelegt am 2026-11-12, 19:58, **nach** der unbegrenzten Reihe `zweitfarbe-036` und **vor** jeder begrenzten Reihe. | **Zwei Stufen, beide in V-3 getrennt geführt; T5 wiederholt beide gleich.** (1) **„CI-ähnlich“** nach §2.8: `--workers 2`, `PLAYWRIGHT_ENGINES="chromium firefox webkit"`, der Test mit `--repeat-each=30` und der Rest seiner Datei zugleich, keine künstliche Last. (2) **„CPU begrenzt“**, weil (1) die CI-Rate nicht zeigt (`zweitfarbe-036`: T-B 30/30 in allen Engines, T-A Assistent nur 1/30 rot in Chromium; CI: in 11/11 Läufen rot): Unmittelbar vor der Reihe starten **6 Busy-Loop-Prozesse** `node -e "for(;;){}"` aus dem leeren Ordner `/tmp/s050/last/` (außerhalb des Repos), direkt nach der Reihe werden genau diese PIDs beendet (`kill`); PIDs, `uptime` und die Stichproben von `fremdlast.sh` stehen im Kopf der Reihe. Begründung der Zahl: Der Runner hat 4 vCPU für 2 Worker; dieselbe Prüfung dauert im Unit-Job dort 2,5–2,8 s (EPYC 7763, Xeon 8573C) gegen 1,6 s hier, ein Runner-Kern ≈ 0,6 M1-Kerne, 4 vCPU ≈ 2,5 M1-Kerne. 10 Kerne − 6 Schleifen − ≈ 1,5 Kerne Desktop-Grundlast (D-12) ≈ 2,5 Kerne für die Reihe. Stufe (2) läuft für die Datei-Reihen `zweitfarbe-036` und – falls (1) dort T-C oder T-D in Firefox 30/30 grün lässt – `buehne-036`. Shard 2/4 (einmal, Q-5) und `achsen-2b2` (Plattform, deterministisch) nur in Stufe (1). Keine Reihe unter (2) zählt als „CI-ähnlich“; für AC-4 vergleicht T5 jede Stufe mit sich selbst. | angewandt (T1): Stufe (1) für alle vier Reihen, Stufe (2) für `zweitfarbe-036` (01:43–02:12) und `buehne-036` (02:14–03:33, weil T-C und T-D in `buehne-vorher-2` in Firefox 30/30 waren) |
| D-14 | T1 | Wie wird T-E auf der Plattform geprüft (Schritt 5)? | Wegwerf-Probe `/tmp/s050/probe-pw/tab.probe.ts` mit eigener Konfiguration außerhalb des Repos (`node_modules` als Verweis auf `packages/eroj/node_modules`, `serve()` aus `packages/eroj/test/serve.ts` gelesen, nicht geändert): je Engine dieselbe Seite wie `achsen-2b2:82`, dann `Tab`, `Alt+Tab` bzw. `focus()`, gelesen `tabIndex`, Element, `activeElement` im Schattenbaum. Zum Vergleich `Tab` auf das `<select>` von `fm-elektilo` (Nachbartest `:56`). | angewandt |
| D-15 | T1 | Wie wird die doppelte Navigation auf `de931e40` gezählt (T-C, T-D)? | Wegwerf-Probe `/tmp/s050/probe-pw/rahmen.probe.ts`: `addInitScript` zählt in der Seite jede Zuweisung an `HTMLIFrameElement.src` (mit URL) und in jedem Rahmendokument dessen Start (URL, `timeOrigin`), abgelegt im `sessionStorage` der Seite (übersteht das Neuladen; Methode wie 042 D-13/D-14). Zwei Fälle: (R) `location.reload()` der Bühne wie nach „Schließen“, (G) `festlegen` und zweites `page.goto` wie T-D. Dazu die Anfragen `vorschau?…` aus `page.on("request")`. | angewandt |
| D-16 | T1 | Zeiten aus **grünen** Läufen (Schritt 4). | Eine Extra-Reihe `--trace on --repeat-each=5` (eigene Reihe, zählt nicht für V-3), Traces außerhalb des Repos gesichert. | angewandt (2026-11-13, 03:34–03:38, Reihe `zweitfarbe-spuren`, 75/75 grün; Ergebnis B-15) |
| D-17 | T2 | Was rechnet die erste Prüfung eines neuen `rev` unverändert neu, und was davon darf T2 wiederverwenden? (Gemessen vor dem Entwurf, Proben `/tmp/s050/t2/{struktur,kalt,erste}.mjs` gegen `dist`, Wegwerf.) | **Gemessen:** `validateModeloFiles` bekommt je Prüfung die ganze Struktur mit dem abgeleiteten Paket: 11 Sets, ein Paket der Struktur (`@fundamento/aspekto-komuna`) plus das abgeleitete, also `aspekto` ∈ {komuna, \<Marke\>} und **144 Kombinationen** (72 je Aspekto); 62 Reguloj, 108 KontrastParoj. Die Hälfte der Kombinationsarbeit gehört komuna und ist zwischen rev n und n+1 (und zwischen Marken) gleich, wird aber in `packages/modelo` gerechnet und dort an der **Identität des `Modelo`** zwischengespeichert (`resolutions.ts`: `WeakMap<Modelo, …>`, `cachedResolutionsOf` nur lesend); jede Prüfung baut ein neues `Modelo`. Weglassen geht nicht: `protected-minimum` (`regularo-enforcement.ts:76`) vergleicht jede Kombination der Marke mit **derselben Kombination der Referenz komuna**, Gruppen zählen „Same in N combinations“, und `evaluateAlirebleco` hat keine Option, Kombinationen auszulassen. Rahmen, `stato` und `/pruefung` desselben `rev` teilen schon eine Prüfung (Spec 044 V-5). **Im Scope wiederverwendbar** ist nur, was in `agordilo` liegt und sich bei einer neuen Zweitfarbe nicht ändert: die Stufen der sechs Paletten der Kalibrierung (`derivePalettes` 77–95 ms je Prüfung, dazu die Kandidaten in `explain.ts`). **Entscheidung:** Jede Palettenstufe wird je Anfrage (Ziel, Chroma, Ton, Fläche des Modus) einmal gelöst (`palettes.ts` `solvedStep`). Alles Weitere bleibt, wie es ist; der Rest ist Befund B-11. | angewandt (`2f6c33a6`) |
| D-18 | T2 | Schlüssel und Grenze des Speichers der Stufen (code-style „Derived indexes“ verlangt eine `WeakMap` je unveränderlicher Eingabe). | Die Eingabe von `solveStep` sind vier Werte, kein Objekt: Ziel, Chroma, Ton (Zahlen) und die Fläche, die `solve()` nur als `WHITE`/`BLACK` je Modus übergibt. Schlüssel = Modus + die drei Zahlen **exakt** (`String(n)` ist für Double eindeutig umkehrbar, `-0` getrennt von `0`). `solveStep` ist rein und liest nichts sonst (`solve.ts`: nur Modul-Konstanten). Darum eine `Map` statt `WeakMap` (Abweichung von code-style, begründet). Grenze 4096 Einträge (eine Ableitung ≈ 105, eine Erklärung einige Dutzend); ist sie voll, wird der Speicher geleert, nicht nach Alter beschnitten – das Ergebnis hängt nie vom Speicher ab. Jeder Aufrufer bekommt eine eigene Kopie (auch `components`), damit nichts Gemeinsames verändert werden kann (Test „changing one changes no later derivation“). | angewandt |
| D-19 | T2 | Roter Test ohne Uhr: wo zählen? | `packages/agordilo/src/paletten-050.test.ts` zählt die Aufrufe von `solveStep` über `vi.mock("./solve.js")` (Original durchgereicht, nur gezählt) – keine Naht im Produktcode. Behauptung: Nach einer Ableitung mit Zweitfarbe A löst dieselbe Marke mit Zweitfarbe B **genau die 12 Stufen der Zweitfarbe** (`ZWEITFARBE_STEPS.length`, alle im Ton von B), und eine Ableitung, deren Paletten nichts Neues verlangen, löst **keine** Stufe. Rot auf `af045d7e`: 105 statt 12 bzw. 93 statt 0 Aufrufe. Grün auf `2f6c33a6`, Testdatei unverändert (`git diff af045d7e..2f6c33a6 -- packages/agordilo/src/paletten-050.test.ts` leer). Der rote Commit wurde vor der Doku einmal lokal neu geschrieben (nichts gepusht; vorher `609d0d93`/`d7e278fe`): Die erste Fassung nutzte eine Farbe, die `check:clean-room` als Wert eines Benchmarks meldet, und ein `await` in der `vi.mock`-Fabrik, das `modelo` `ci/test-setup.test.ts` als Modulcode zählt. Jetzt erfundene Farbe `#b04a7c` und `.then` statt `await`; danach erneut rot auf `af045d7e` (105 statt 12, 93 statt 0) und grün auf `2f6c33a6`. Der Produktcode von `2f6c33a6` ist mit dem geprüften `d7e278fe` identisch (`git diff d7e278fe 2f6c33a6` nur die Testdatei). | angewandt |
| D-20 | T2 | Reicht `antworten-044` als Byte-Nachweis für den geänderten Pfad? | Nein, nur teilweise: Es deckt rev 1–3 zweier Marken (neue Leitfarbe, Zweitfarbe), nicht die übrigen Eingaben der Paletten. **Neue Fixture vor jeder Code-Änderung** auf `79a463bc`, einmal mit `FM_ABLEITUNG_050=schreiben` geschrieben (Commit `a9ecfa40`), danach nur verglichen: `packages/metiejo/src/ableitung-050.test.ts` + `test-doubles/ableitung-050.json` (`git check-ignore -v` leer). Inhalt in fester Reihenfolge **in einem Prozess** (der Speicher ist dabei warm): (1) die Paletten der Ableitungsbasis für 17 erfundene `Agordo`, jedes in genau einer Eingabe vom vorigen verschieden (Zweitfarbe gesetzt/anders/entfernt, Leitfarbe, `saettigung`, `helligkeit`, `kontrast`, `ziele` accent und sekundo, `zusatzfarben.danger`, `neutral.toenung`, Basis `komuna`, Rückkehr zu früheren Ständen); (2) jede Datei von `deriveAspekto` (`checkDraft`) samt `issues`/`exportable`/`palettes` für Basis `leer` und `komuna`, je mit Zweitfarbe gesetzt und entfernt. Fehlte dem Schlüssel eine Eingabe, gäbe ein späterer Fall die Bytes eines früheren – die Fixture fiele rot. | angewandt |
| D-21 | T2 | Den ersten, langsameren Lauf einer Prüfung im frischen Worker (JIT) vorziehen? | **Nein.** Gemessen (Probe `erste.mjs`, CPU-Zeit, unter Fremdlast): die erste Prüfung eines Prozesses kostet ≈ 10–15 % mehr Haupt-Thread-Zeit als die dritte (1885 → 1603 ms im Profil). Eine volle Probe-Prüfung beim Vorstart ließe die erste echte Prüfung bis zu 1,5 s dahinter warten – genau das hat Spec 044 D-28 deshalb verworfen. Kein Grund, das umzukehren. | verworfen (Befund) |
| D-22 | T1 (Fortsetzung) | Wie laufen die Vorher-Reihen, nachdem T2 schon Produktcode committet hat? | Auf dem **unveränderten** Produktcode: im selben Arbeitsbaum `git checkout --detach 79a463bc` (Baum vorher sauber), `pnpm turbo run build --filter=@fundamento/cli...` (Turbo-Cache; geprüft: `packages/agordilo/dist/palettes.js` ohne den T2-Speicher `solvedStep`), Reihen, dann zurück auf `261112-wacklige-browser-tests--9197f6` (`060b8e3c`) und derselbe Bau (`solvedStep` wieder da). Kein `stash`, keine zweite Installation. Fremde Test-Last: vor jeder Reihe 0 Prozesse anderer Arbeitsbäume, während jeder Reihe `fremdtest.sh` (alle 30 s) – in allen fünf Reihen 0 Treffer. | angewandt (2026-11-13, 00:33–03:38) |
| D-23 | T3 | Wie verhindert der Client die zweite Navigation, ohne Markup, Antworten oder Takt zu ändern? (Verworfen nach Probe bzw. Lesen: „nicht zuweisen, wenn der Rahmen das Dokument schon hat“ – dann bliebe `src` leer, und `rahmenBereit` sowie jede andere Zuweisung derselben URL mit Absicht (Lingvo-Wahl, `refreshNachher()` nach dem Lesen von Material) hingen an derselben Weiche; `location.reload()` ersetzen – lässt F5 und die anderen Neuladungen unberührt; `src` ins Markup – ändert die Seite des Servers und lädt in Chromium/WebKit zweimal.) | Der Client ersetzt vor seiner ersten Zuweisung jeden `iframe[data-mt-src]` durch eine Kopie (`replaceWith(cloneNode(true))`). Firefox stellt nur vom Parser angelegte Rahmen beim Neuladen wieder her; eine Kopie ist vom Skript angelegt und hinterlässt nichts für das nächste Neuladen. Probe vor dem Commit: Firefox, Chromium, WebKit je 3/3 eine Anfrage je Rahmen. Server-Markup, Antworten (`antworten-044`) und `stato`-Takt unverändert. | angewandt (`de3fd057`) |
| D-24 | T3 | Welche Schritte von 3.5 (T-D) gehen von der Seite aus, welche bleiben im `frameLocator`? | Von der Seite aus (`contentDocument`, nur bei geladenem Dokument, `lesenOder`): jede Sichtbarkeit, jede Zählung, Rahmenfarbe, Satz, `tabIndex`, der Zustand „Zeiger trifft die Komponente“ und die Mausbewegung (`page.mouse`). Im `frameLocator` bleiben `komponente.focus()`, die Tooltip-Erwartungen und `toHaveAccessibleDescription`: Ein `element.focus()` aus dem Kontext der Seite fokussierte in Firefox nicht (Tooltip fehlte, 1/1 rot), und Rolle/Beschreibung lassen sich von der Seite aus nicht gleich stark prüfen (AC-7). Sie folgen erst auf die bestätigten Zustände. | angewandt (`9a51b5cd`) |

## Ursache je Test (V-1, T1)

Eingeordnet nach den Klassenregeln (Implementierungs-Spec §2.4, D-10): genau eine Hauptklasse je Zeile, weitere Beiträge als Nebenursache, jede mit Beleg. Zeiten „s“ ab Testbeginn im Trace. Die Schwester-Varianten T-A Schnellstart und T-B Assistent sind in CI nie rot (0/11) und lokal 30/30; sie brauchen keine Zeile (B-01).

| Test (Datei:Zeile, Ort) | Engine(s) | Klasse | Beleg | Quelle | Nebenursache (mit Beleg) | Fix-Ticket / Stand |
|---|---|---|---|---|---|---|
| T-A `zweitfarbe-036.spec.ts:129`, Assistent („Leitfarbe und Akzente“), Wartestelle `entwurfGespeichert` → `rahmenBereit(…, { rev: 2 })` (`geladen-042.ts:224`/`:111`, Testzeile `:157`) | Firefox, WebKit, Chromium | **K4 Prüfung** | Der Rahmen `vorschau?sxtupo=buehne-farbe&rev=2` antwortet erst nach der Prüfung von rev 2 (044 D-01). CI: 3907–4595 ms, sonst bei Testende offen ≥ 5287 bis ≥ 11 014 ms (16 rote Spuren); `rahmenBereit` beginnt 0,06–0,11 s nach dem Senden und gibt nach 5 s auf; `GET stato` wartet auf dieselbe Prüfung. Die eigene Rechenzeit der Prüfung ist der größte Teil: lokal 1613 / 2434 ms (Median/Max, ≥ 1 s), im CI-Unit-Job ohne Browser 1481–2772 ms (Median je Lauf); 94 % davon Prüfregeln (`validateModeloFiles` 82 %). Lokal einmal reproduziert (Chromium, Wiederholung 17): Rahmen rev 2 nach 4113 ms, `rahmenBereit` rot. | CI 43174596533 (`41b5471c…zip` WebKit, `67e59c21…zip` Firefox) und 15 weitere Spuren aus 11 Läufen; lokal `de931e40`, `messung-044` (19:24), Reihe `zweitfarbe-vorher` Stufe (1) | **K2:** 5-s-`expect.poll` hinter einer Serverrechnung (Q-2); die Schwester-Variante, die nach dem Tippen auf ein Antwort-Ereignis wartet, ist 0/11 rot (B-01). **K2, zweite Wartestelle (neu 2026-11-13, nur WebKit, Stufe (2) 4/30):** nach „Keine Zweitfarbe“ hält `schrittBereit(…, vorDemLoeschen)` (`zweitfarbe-036.spec.ts:181`) die **alte** Seite für die neue, weil WebKit für dasselbe Dokument einen um 1 ms anderen `performance.timeOrigin` liefert (B-14); es liest dann `data-mt-rev="2"`, während der Rahmen schon rev 3 zeigt. Das Fenster öffnet die Prüfung: das Neuladen `GET /asistanto/…` rechnet die Prüfung von rev 3 (2207–2514 ms). **K1:** Im Eroj-Job dauert dieselbe Prüfung 1,6- bis 4-mal so lang wie im Unit-Job desselben Laufs (B-02). | T2 (K4): **teilweise behoben** (`2f6c33a6`, Paletten ≈ 5 % der Prüfung), „unter 1 s“ **nicht erreichbar** ohne `packages/modelo` (B-11); **T3 (K2): umgestellt** (`c5147982`): Antwort der Rahmen-Navigation bzw. von `POST …/pruefung` und des Dokuments vor der Aktion gesammelt, nur durch die Testzeit begrenzt, dann die Zustände unter dem Standardfenster; Kennung des Dokuments fest in allen Engines (B-14). Zwischenprüfung siehe „T3“ |
| T-B `zweitfarbe-036.spec.ts:196`, Schnellstart (Farbschritt), Wartestelle `schrittBereit` → `abrufBeantwortet(…/pruefung)` (`geladen-042.ts:178`/`:144`, Testzeile `:216`) | Firefox, WebKit, Chromium | **K4 Prüfung** | `POST /api/marko/dukolora-rahmen-30/pruefung` ist die erste Prüfung der neuen Marke (rev 1); in allen 18 roten Spuren bei Testende **unbeantwortet, offen ≥ 4436 bis ≥ 6254 ms**; der Poll beginnt 0,1–0,3 s nach dem Senden. Rechenzeit wie T-A (lokal 1613 / 2434 ms, CI-Unit 1,5–2,8 s). | CI 43174596533 (`be961280…zip` WebKit, `401a69b4…zip` Firefox) und 16 weitere Spuren; lokal wie T-A | **K2** nach der Klassenregel (fester 5-s-Poll, der 0,03–0,2 s nach dem Senden der Prüfung beginnt). Der Vergleich mit der Schwester-Variante belegt K2 hier **nicht** (B-15): Schnellstart `:129` pollt beim Laden genauso früh und ist in CI 0/11 rot; lokal dauert die erste Prüfung in T-B ≈ 14 % länger (Median 1786 gegen 1568 ms). Warum gerade T-B in CI reißt, ist offen. **K1** wie T-A (B-02). Lokal in beiden Stufen 30/30 (nicht reproduziert). | T2 (K4): **teilweise behoben** (`2f6c33a6`, Paletten ≈ 5 % der Prüfung), „unter 1 s“ **nicht erreichbar** ohne `packages/modelo` (B-11); **T3 (K2): umgestellt** (`c5147982`): Antwort der Rahmen-Navigation bzw. von `POST …/pruefung` und des Dokuments vor der Aktion gesammelt, nur durch die Testzeit begrenzt, dann die Zustände unter dem Standardfenster; Kennung des Dokuments fest in allen Engines (B-14). Zwischenprüfung siehe „T3“ |
| T-C `buehne-036.spec.ts:463` 3.4, nach „Schließen“ (`location.reload()`), Wartestelle `knopf(page, VORSCHLAG)` → `button.evaluate` im `expect.poll` (`:260` über `:264`, aus `:500`) | Firefox | **K4 Navigation** | Nach dem Neuladen holt Firefox **jeden Rahmen zweimal mit derselben URL**: Spur 6,682/6,688 s und 7,070/7,064 s (2. Antwort 422/428 ms), die `vorschau.css` der ersten Dokumente wird abgebrochen. `geladen()` nimmt das erste Dokument (7,33 s), die zweite Navigation zerstört den Kontext des **Rahmens** „Mit dem Vorschlag“ unter `knopf` (7,425 s: „Execution context was destroyed“); die Seite lädt nur einmal. Auf `de931e40` bestätigt (Rahmen-Probe, 10/10): 2 Anfragen je Rahmen nach jedem Neuladen bei nur **einer** `src`-Zuweisung des Clients; die zusätzliche Navigation ist die Wiederherstellung durch Firefox, die zweite die Zuweisung von `refreshFrame()` mit derselben URL. Chromium/WebKit: 1 Anfrage. | CI 42376059543 (`27f383b2…zip`, `7f4b65d`); Rahmen-Probe 21:40–21:44 auf `de931e40` | **K3:** `knopf()` liest über `frameLocator(…).evaluate` im Rahmen statt über `contentDocument` der Seite, und `rahmenBereit` kann das erste (wiederhergestellte) Dokument nicht vom zweiten unterscheiden (gleiche URL, `complete`). Seit Spec 044 in 0/10 CI-Läufen rot (B-05): Das Fenster ist eng (lokal ≈ 130–460 ms zwischen beiden Anfragen). Lokal **nicht reproduziert**: 30/30 in jeder Engine in Stufe (1) und (2) (`buehne-vorher-2`, `buehne-vorher-cpu`). | **T3: K4 behoben** rot `fd90b67b` → grün `de3fd057` (Client legt Kopien der Rahmen an ihre Stelle; Firefox gibt beim Neuladen nur vom Parser angelegten Rahmen ihr Dokument zurück); **K3**: `knopf()` liest von der Seite aus (`9a51b5cd`). Lokal war T-C nie rot – belegt ist der Fix durch die Zählung der Anfragen (rot 3/3 Firefox → grün 9/9) |
| T-D `buehne-036.spec.ts:545` 3.5, Wartestelle `expect(markiert.first()).toBeVisible()` (`:567`, CI) bzw. `expect(jetzt.locator("fm-pagxo").first()).toBeVisible()` (`:554`, lokal) im `frameLocator` von „Jetzt“ | Firefox | **K3** | Die Erwartung im `frameLocator` startet nach einer Navigation des Rahmens und **endet nie** (Protokoll `with timeout 5000ms`, danach nur `waiting for …`; Test-Timeout 120 s). Von den neuen Rahmendokumenten gibt es **keinen** `frame-snapshot`: Playwright-Firefox hat ihren Kontext nicht. Im Weg steht keine Anfrage: Das Produkt navigiert jeden Rahmen genau **einmal** (CI: je eine Anfrage rev 2, 1/3 ms; Rahmen-Probe (G): 1 Anfrage, 1 Zuweisung, 10/10). Die Prüfung liegt in `festlegen` (2842 ms), nicht im Rahmen. Lokal reproduziert (Firefox, Wiederholung 22): dasselbe schon beim ersten `oeffne()`. Dasselbe Muster bei `buehne-036:711` 3.6 (CI 42459842953 und lokal 4×, je nach dem Wechsel auf `scheme=dark`; B-04). | CI 43174596533 (`962eebe0…zip`, Shard 2); lokal Reihe `buehne-vorher` (`de931e40`, nur zur Information, B-08) | **K5:** Playwright-Firefox hält das eigene Fenster (5000 ms) nicht ein und bekommt den Kontext des neu geladenen Rahmens nicht; nur Firefox (CI 2 Spuren, lokal 5 Spuren, 0 in Chromium/WebKit). **K1:** Alle lokalen Treffer lagen in der Zeit fremder Test-Last (20:40–21:33, Load bis 50), der CI-Treffer im Dispatch mit drei Engines je Shard; ohne fremde Last 0 Treffer: T-D Firefox 30/30 in Stufe (1) und (2) und 1/1 im Shard 2/4, ebenso 3.6 ohne Hänger. Die frühen Hypothesen K4/K1 (kalte Prüfung im Rahmen) und „intercepts pointer events“ sind verworfen (keine Aktion hängt, Rahmen 1–3 ms). | **T3 (K3) umgestellt** (`9a51b5cd`): Erwartungen und Lesungen im Rahmen von der Seite aus, Schnitt und Sichtbarkeit vor jeder Aktion bestätigt, Hover über die Seite; `focus()`, Tooltip und `toHaveAccessibleDescription` bleiben im `frameLocator` (Rest-Risiko K5, siehe „T3“). Lokal ohne fremde Last nie rot – nicht nachgewiesen, dass der Hänger verschwindet |
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

Aus dem lokalen roten T-A-Lauf der Stufe (1) (`zweitfarbe-vorher`, Chromium, Wiederholung 17, zwei Worker, drei Engines): `GET /asistanto/…` (rev 1, erstes Laden) 1987 ms, Rahmen `buehne-farbe` rev 2 **4113 ms** (hinter der Prüfung von rev 2), `GET stato` dahinter 2178 ms. Aus den grünen Spuren der Extra-Reihe `zweitfarbe-spuren` (2026-11-13, Stufe (1), je Engine 5 Läufe, B-15):

| | Chromium | Firefox | WebKit |
|---|---|---|---|
| T-A Assistent: Rahmen `buehne-farbe` rev 2 (hinter der Prüfung von rev 2) | 1612–1700 ms | 1614–1680 ms | 1573–1677 ms |
| Schnellstart `:129`: erste `POST /pruefung` / Poll-Beginn nach dem Senden | 1524–1614 ms / 0,20–0,25 s | 1518–1657 ms / 0,24–0,34 s | 1500–1667 ms / 0,03–0,06 s |
| T-B (`:196` Schnellstart): erste `POST /pruefung` / Poll-Beginn nach dem Senden | 1721–1810 ms / 0,03–0,10 s | 1716–1868 ms / 0,06–0,20 s | 1743–1856 ms / 0,04–0,06 s |

Aus den roten Spuren der Stufe (2) (`zweitfarbe-vorher-cpu`, WebKit): Rahmen rev 2 1934–2104 ms, Neuladen `GET /asistanto/…` nach „Keine Zweitfarbe“ (rechnet die Prüfung von rev 3) 2207–2514 ms.



### Lokal nach T2 (V-2, AC-3)

**Code:** `2f6c33a6` (Fix; rot `af045d7e`, Fixture `a9ecfa40`), gebaut mit `pnpm turbo run build --filter=@fundamento/cli... --filter=@fundamento/metiejo...`. **Was sich ändert:** nur die Ableitung (Paletten). Bei einer Prüfung, die sich vom vorigen Stand nur in der Zweitfarbe unterscheidet, löst `derivePalettes` 12 statt 105 Stufen (D-19); bei einer neuen Marke mit einer schon gelösten Leitfarbe (Basis `leer` = Leitfarbe der Referenz) gar keine. Erwartung aus dem T1-Profil: Ableitung ≈ 100 → ≈ 25 ms, Prüfung ≈ 1,6 s → ≈ 1,53 s (≈ 5 %); Prüfregeln, Rahmen und `stato` unverändert. **Nicht unter 1 s** (B-11).

**Messung nachher** (V-2, gleiche Schritte wie T1): Code `2f6c33a6` (Bericht nennt `2f6c33a6-dirty`: nur `plan.md`/`tasks.md` ungespeichert), gebaut wie oben, unter der Sperre, Skript `/tmp/s050/t2/nachher.sh` (Wegwerf). **Ruhig im Sinne von §2.8:** keine fremden Test-Prozesse (`warte-ruhe.sh`: „RUHE 23:47:53“; die fremde Sitzung aus B-12 lief ab ≈ 23:46 nicht mehr). `uptime` 1 min: vor `messung-044` 14,33 (23:48, Rest der eigenen `modelo`-Läufe), danach 8,44 (23:50); Profil 8,44 → 9,43. Desktop-Grundlast wie D-12 (virtuelle Maschine ≈ 1,4 Kerne, WindowServer 0,5, p0 0,3, Arc 0,2). `messung-044`: 20/20 grün in 114 s, N = 10. Bericht: `…/fundamento-wt-mwdq3cluiyydrirx/s050-mess/t2/messung-044-nachher.json`.

| Route | Schritt | lokal kalt vorher (`de931e40`, T1) | lokal kalt nachher (`2f6c33a6`) | lokal warm nachher |
|---|---|---|---|---|
| `POST /pruefung` | `ableitung+pruefung` | 1613 / 2434 | **1491 / 2103** | – |
| | **gesamt** | 1614 / 2438 | **1491 / 2105** | 0,1 / 1,0 |
| | davon Ableitung (Profil, N = 10, nur Zweitfarbe geändert) | 99 (`derivationBasis` 87,3, darin `derivePalettes` 76,5) | **≈ 36** (`derivationBasis` 24,4, darin `derivePalettes` 14,8) | |
| | davon Prüfregeln (Profil) | ≈ 1649 (`validateModeloFiles` 1429) | ≈ 1555 (`validateModeloFiles` 1331, Rest 217 + `buildModelo` 7) – unverändert im Code, Unterschied = Streuung | |
| `POST /pruefung` A, von außen gemessen (während `GET stato` B) | gesamt | 1669 / 1924 | 1490 / 1590 | |
| Rahmen `vorschau?sxtupo=buehne-farbe` (Prüfung im Speicher) | gesamt | 0,2 / 0,6 | 0,2 / 1,3 | 0,2 / 0,7 |
| Rahmen `buehne-farbe` eines **neuen** `rev` (wartet auf die Prüfung) | gesamt | = Prüfung (≈ 1,6 s) | = Prüfung (≈ 1,5 s) | |
| Rahmen `vorschau?sxtupo=farbe` | gesamt | 0,2 / 7,2 | 0,2 / 7,3 | 0,2 / 0,5 |
| `GET stato` (Prüfung im Speicher) | gesamt | 0,4 / 11,6 | 0,4 / 9,3 | 0,2 / 0,6 |
| `GET stato` B während `POST /pruefung` A | gesamt | 0,8 / 2,0 | 0,8 / 1,0 | |
| `GET vorschau.css` | `ableitung` | 103,9 / 186,6 | **8,5 / 99,4** | – |
| | gesamt | 155,4 / 259,5 | **49,8 / 164,0** | 0,5 / 0,7 |
| `einzeln derivationBasis` | `ableitung` | 78,9 / 127,7 | **6,7 / 12,5** | |

Profil nachher (`/tmp/s050/profil/pruefung-t2.cpuprofile`, gleiche Probe wie T1, N = 10, nur Zweitfarbe geändert): Wandzeit je Prüfung mit Profiler 1672–1937 ms; gesamt in `checkDraft` 1592 ms (T1: ≈ 1749).

**Ergebnis (AC-3):** Die erste `/pruefung` eines neuen `rev` liegt lokal im Median bei **1491 ms, nicht unter 1 s** (−7,6 %; Max −13,5 %). Die Ableitung schrumpft auf ein Drittel, die Prüfregeln bleiben, wie sie sind (B-11). Nebenbei wird das Stylesheet eines neuen `rev` dreimal so schnell (155 → 50 ms), weil es dieselbe Ableitungsbasis rechnet. Für die CI-Fenster von T-A/T-B (Prüfung dort 2,5–2,8 s im Unit-Job, 4–11 s im Eroj-Job) reicht das nicht; die Ursache bleibt K4 (Prüfregeln in `modelo`) mit K2 als Nebenursache – T3 stellt das Warten um.


**Zwischenprüfung Ende-zu-Ende** (§2.8, zählt **nicht** für AC-4; die bindende Nachher-Reihe macht T5): `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test test/zweitfarbe-036.spec.ts --workers 2 --repeat-each=10` aus `packages/eroj`, Code `2f6c33a6`, 2026-11-12 23:55 – 2026-11-13 00:02, 467,6 s, unter der Sperre, **keine fremden Test-Prozesse**. `uptime` 1 min 89,23 → 17,08: Der Wert am Anfang stammt aus den eigenen Läufen davor (`test:betroffen` mit Eroj-Playwright und `nordstelo` zugleich) und einer Spitze der virtuellen Maschine (≈ 3,8 Kerne um 23:55), nicht aus fremden Tests. Ergebnis **150/150 grün**: T-A `:129` Assistent und Schnellstart, T-B `:196` Assistent und Schnellstart, „Zweitfarbe from material“ je **10/10 in Chromium, Firefox und WebKit**. Ausgabe und Berichte: `…/fundamento-wt-mwdq3cluiyydrirx/s050-mess/t2/{zwischen.log,zwischen-reports/}`. Aussage: Der Fix macht nichts rot. Über die CI-Rate sagt die Reihe nichts (lokal war T-B auch vorher 30/30, T-A 29/30 in Chromium).

**Byte-Gleichheit (AC-3, R0-i):** Grün auf dem Produktcode von `2f6c33a6` (gelaufen auf `d7e278fe`, der vor der Neufassung des roten Commits denselben Produktcode hatte, D-19), unter der Sperre, unter fremder Test-Last (B-12), 23:40–23:42:

| Lauf | Ergebnis |
|---|---|
| `paletten-050` (agordilo, neu, rot auf `af045d7e`) | 3/3 grün |
| Quelle: `ableitung-050`, `antworten-044`, `stato-044`, `ableitungen-044`, `grenzfaelle-044` | 23/23 grün |
| `dist` (`FM_SERVILO_044=dist`, Prüfung im Worker): dieselben fünf | 23/23 grün |
| `pruefung-worker-044` | 11/11 grün |
| `git diff de931e40 -- packages/metiejo/src/test-doubles/antworten-044.json` | leer |
| `git diff a9ecfa40 -- packages/metiejo/src/test-doubles/ableitung-050.json` | leer |
| `git diff af045d7e..2f6c33a6 -- packages/agordilo/src/paletten-050.test.ts` | leer |


**Schluss T2** (Implementierungs-Spec T2 Schritt 5), alle unter der Sperre, ohne fremde Test-Prozesse ab 23:47:

| Lauf | Zeit, `uptime` 1 min | Ergebnis |
|---|---|---|
| `FM_AUSGABE=knapp pnpm turbo run test --filter=@fundamento/modelo --output-logs=errors-only` (zuerst allein, 044 B-9) | 00:03–00:04, 14,7 → 19,2 | **grün** (4954 Tests). Die Läufe davor (23:43, 23:46) waren rot durch T2 selbst: `check:clean-room` fand eine Benchmark-Farbe im roten Test bzw. danach in `plan.md`, `ci/test-setup.test.ts` ein `await` in der `vi.mock`-Fabrik – behoben im roten Commit (D-19) und in der Doku |
| `pnpm lint` | 23:48 | **grün** |
| `FM_AUSGABE=knapp pnpm test:betroffen` (9 Pakete, parallel, bricht beim ersten roten Paket ab) | 23:50 und 00:04, bis 80–89 | **rot, nur `nordstelo`, nur Zeitfenster** (B-13); `nordstelo` allein 270/270 grün |
| Derselbe Paketsatz nacheinander: `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=chromium pnpm turbo run test --concurrency=1 --continue --output-logs=errors-only --filter=@fundamento/{agordilo,cli,ekranoj,eroj,mcp,metiejo,modelo,nordstelo,projekcioj}` | 00:09–00:30, 36,4 → 33,3 (virtuelle Maschine, Hintergrund-Kurzbefehle; keine fremden Tests) | 18/19 Aufgaben grün: agordilo 150, cli 120, ekranoj 301, eroj 43 + **Playwright 675/675**, mcp 508, metiejo 686, modelo 4954, nordstelo 270 – je 0 rot. **`projekcioj` 1552/1553:** `fonto/komuna-fonto.test.ts:182` („ekzemplo, provo … resolve as on main in all combinations“) lief in sein Fenster von 60 s; allein danach (00:31, Load 27,9) **11/11 grün in 25 s**. Keine Erwartung schlug fehl. |

Gewertet: Kein Test wird durch T2 rot (R0-h). Die einzigen roten Stellen im gemeinsamen Lauf sind Zeitfenster unter Last (B-13), allein grün; kein Fenster wurde angehoben (R0-a). Berichte: `/tmp/s050/t2/{modelo3,betroffen2,betroffen-seriell,nordstelo}.log`, `…/s050-mess/t2/betroffen.log`.

## T3 – Warten an der Ursache (K2, K3) und doppelte Navigation (K4)

**Stand:** 2026-11-13, 03:45–04:30, Code auf `17eaab0a` (T2 + T1-Doku) aufgesetzt. Alle Läufe unter der Sperre, ohne fremde Test-Prozesse (`ps`-Prüfung vor jedem Lauf). Proben außerhalb des Repos unter `/tmp/s050/t3/` (Wegwerf, nicht committet).

### K4 Navigation (T-C): Mechanismus

**Probe** `/tmp/s050/t3/zustand.probe.ts` (wie die Rahmen-Probe D-15, dazu je `src`-Zuweisung der Zustand des Rahmens **in dem Moment**: `contentDocument.URL`, `readyState`, `contentWindow.location`, Navigationstyp des Rahmendokuments; je Rahmendokument Start und `DOMContentLoaded`; im Netz `request`/`response`/`requestfinished`/`requestfailed` je `vorschau?…`). Fall: Bühne öffnen, beide Rahmen geladen, dann `location.reload()` der Seite. 2026-11-13 03:47–03:50 auf `2f6c33a6`, Firefox 5×, Chromium 2×.

| Engine | Rahmen zur Zeit der Zuweisung des Clients (`refreshFrame()`/`refreshNachher()`, 146–180 ms nach Seitenstart) | Navigationstyp des Rahmendokuments | Anfragen je Rahmen | Antworten / fertig |
|---|---|---|---|---|
| Firefox (5/5) | `contentDocument.URL` **= die URL, die der Client gleich zuweist** (`…&rev=1&scheme=light`), `readyState` „interactive“, `src`-Attribut leer | **„reload“** | **2** (die erste 10–25 ms nach Seitenstart, also während des Parsens, vor jedem Skript; die zweite mit der Zuweisung) | beide 200, beide `requestfinished` |
| Chromium (2/2) | `about:blank`, „complete“ | „navigate“ | 1 | 1 |

**Mechanismus (belegt):** Die Rahmen der Bühne stehen ohne `src` im Markup (`buehne.ts:42`, nur `data-mt-src`); erst der Client schickt sie (`vorschauSenden` → `vorschauSchicken`: `element.src = …`). Beim Neuladen gibt Firefox jedem **vom Parser angelegten** Rahmen sein letztes Dokument aus der Sitzungs-Historie zurück: Die Anfrage startet beim Einfügen des `<iframe>` während des Parsens, das Dokument ist schon „interactive“, wenn das Modul des Clients läuft, und sein Navigationstyp ist „reload“. Der Client weiß davon nichts und weist dieselbe URL noch einmal zu – eine Zuweisung an `src` navigiert immer, auch zur selben URL. Ergebnis: zwei Dokumente je Rahmen; auf dem Runner wurde das erste „complete“ und erst danach ersetzt (Spur 42376059543, `knopf()` → „Execution context was destroyed“). Es ist **nicht** `vorschauNochmal` (Hypothese §2.3): Die Rahmen-Probe zählte genau eine Zuweisung. Chromium und WebKit geben einem Rahmen ohne `src` beim Neuladen nichts zurück.

**Fix (belegt durch eine Probe vor dem Commit):** Ein Rahmen, den ein Skript anlegt, bekommt in Firefox beim Neuladen kein Dokument zurück, und er hinterlässt keines für das nächste Neuladen. Der Client legt deshalb vor seiner ersten Zuweisung an jede Stelle eines Vorschau-Rahmens (`iframe[data-mt-src]`) eine Kopie (`element.replaceWith(element.cloneNode(true))`, `html.ts`, vor `const frame = …`). Probe mit dieser Änderung (ungespeichert, gebaut): **Firefox 3/3, Chromium 3/3, WebKit 3/3: je Rahmen eine Anfrage nach dem Neuladen.** Kein Timer, keine Dauer, der `stato`-Takt (`}, 3000);`) unverändert, das Markup des Servers unverändert. Gilt für jede Seite mit Vorschau-Rahmen (Bühne, Schritt Farbe, Studio, Komponenten), weil alle denselben Client nutzen.

**Rot → grün:**

| Schritt | Commit | Ergebnis |
|---|---|---|
| roter Test `buehne-036.spec.ts` › „3.4 (Spec 050): after a reload each frame of the stage loads its document once“ (zählt je Rahmen die vom Server beantworteten Navigationen nach `location.reload()`; eine Navigation, die der Browser vor der Antwort abbrach, brachte kein Dokument und zählt nicht) | `fd90b67b` | `PLAYWRIGHT_ENGINES="chromium firefox webkit" … -g "Spec 050" --workers 2 --repeat-each=3`: **Firefox 3/3 rot** („Received + 1“: dieselbe URL von „Jetzt“ zweimal, `:582`), Chromium 3/3 und WebKit 3/3 grün |
| Fix `html.ts` | `de3fd057` | derselbe Befehl nach dem Bau: **9/9 grün** |
| Testdatei im Fix unverändert | – | `git diff fd90b67b..de3fd057 -- packages/eroj/test/buehne-036.spec.ts` **leer** |

Zuerst lief der rote Test mit Playwrights `page.reload()`: 9/9 grün auch **ohne** Fix – über `page.reload()` zeigt Firefox die doppelte Anfrage nicht. Der Test lädt deshalb wie das Produkt („Schließen“ nach dem Lesen) mit `location.reload()` der Seite.

### Wartestelle → Wartebedingung (T3)

„Antwort“ = ein `response`-Ereignis, das der Test **vor** der auslösenden Aktion zu sammeln beginnt und das nur durch die Testzeit begrenzt ist (kein `timeout`-Argument, keine Uhr; `antwortenAb` in `geladen-042.ts`). „Zustand“ = `expect`/`expect.poll` unter dem Standardfenster.

| Datei:Zeile (vorher) | Stelle | wartete vorher auf | wartet jetzt auf | Klasse |
|---|---|---|---|---|
| `geladen-042.ts:17` | `dokument()` | `performance.timeOrigin` des Dokuments | eine Zahl, die das erste Lesen an das `window` des Dokuments legt (jedes Dokument hat sein eigenes `window`) | K2 (B-14) |
| `geladen-042.ts:52` | `seiteBereit(…, nicht)` „neues Dokument“ | `performance.timeOrigin !== nicht` | Marke des `window` `!== nicht` | K2 (B-14) |
| `geladen-042.ts:218`–`:224` (T-A, Testzeile `zweitfarbe-036:157`) | `entwurfGespeichert` → Rahmen `rev` | Antwort `POST …/entwurf`, dann **5-s-Poll** `rahmenBereit(…, { rev })` hinter der Prüfung von `rev` | Antwort `POST …/entwurf` (gesammelt ab dem Aufruf), dann **Antwort der Navigation des Rahmens** `/marko/<id>/vorschau?…&rev=<rev>` (ohne `propono`; der Server beantwortet sie erst nach der Prüfung von `rev`), dann Zustand `rahmenBereit(…, { rev })` | K2 |
| `geladen-042.ts:225` | `entwurfGespeichert` → Prüfung | Antwort `POST …/pruefung` nach der Entwurfsantwort (Ereignis) | unverändert, jetzt aus derselben Sammlung (nur Antworten nach der Entwurfsantwort) | – |
| `zweitfarbe-036.spec.ts:139`/`:140` | erstes Laden | `schrittBereit` nach `goto` (Seite, dann 5-s-Poll `abrufBeantwortet` auf `POST …/pruefung`, dann `rahmenBereit`) | `schrittLaedt` **vor** `goto` angelegt: Antwort des Dokuments → Zustand `seiteBereit`; wo der Schritt prüft: Antwort `POST …/pruefung` nach dem Dokument → Zustand `abrufBeantwortet`; Antwort des Rahmens mit der `rev` der Seite → Zustand `rahmenBereit` | K2 |
| `zweitfarbe-036.spec.ts:162`/`:163` | Neuladen nach dem Setzen | `schrittBereit(…, vorDemNeuladen)` nach `reload` | `schrittLaedt(…, vorDemNeuladen)` vor `reload`, wie oben | K2 |
| `zweitfarbe-036.spec.ts:178`/`:181` (T-A WebKit, B-14) | „Keine Zweitfarbe“ (der Client lädt neu; der Server prüft rev 3, bevor er die Seite schreibt) | `schrittBereit(…, vorDemLoeschen)`: 5-s-Poll `seiteBereit` mit `timeOrigin`-Vergleich | `schrittLaedt(…, vorDemLoeschen)` vor `Enter`: Antwort des neuen Dokuments, dann Zustand `seiteBereit` mit der neuen Kennung, dann wie oben | K2 |
| `zweitfarbe-036.spec.ts:212`–`:216` (T-B) | Schnellstart, Vorschau zurückgehalten | `schrittBereit` nach `freigeben()`: **5-s-Poll** `abrufBeantwortet` auf die erste Prüfung der neuen Marke | `schrittLaedt` **vor** `goto`: Antwort `POST …/pruefung` (nur Testzeit), dann Zustand `abrufBeantwortet`, Antwort und Zustand des Rahmens | K2 |
| `buehne-036.spec.ts:256`–`:265` (T-C über `:500`, auch 3.2 `:334`/`:335`/`:357`) | `knopf()` | `frameLocator(…)`: `toBeVisible`, dann `expect.poll(button.evaluate(…))` **im Rahmen** | ein `expect.poll` über ein Lesen **von der Seite aus** (`contentDocument`, nur wenn „complete“ und URL = `src`): Knopf sichtbar und gefüllt | K3 |
| `buehne-036.spec.ts:554`/`:555` (T-D, lokaler Hänger) | 3.5 erstes Öffnen | `expect(jetzt.locator("fm-pagxo").first()).toBeVisible()`, `expect(markiert).toHaveCount(0)` im `frameLocator` | `expect.poll(sichtbarIm(…))`, `expect.poll(anzahlIm(…))` von der Seite aus | K3 |
| `buehne-036.spec.ts:564`–`:567` (T-D, CI-Hänger) | 3.5 Schieber `End`, dann Markierung | `expect(markiert.first()).toBeVisible()` im `frameLocator` | Zustand „Schnitt 100 %“ (`--mt-schnitt`), dann `expect.poll(sichtbarIm(…, MARKIERT))` von der Seite aus | K3 |
| `buehne-036.spec.ts:570`/`:581`/`:591` (T-D) | Rahmenfarbe, Satz, `tabIndex` | `komponente.evaluate`/`getAttribute` im Rahmen | ein Lesen von der Seite aus (`contentDocument`, `defaultView.getComputedStyle`) | K3 |
| `buehne-036.spec.ts:585` (T-D) | Hover | `komponente.hover()` (Aktion ohne eigenes Zeitlimit) | Zustand per `expect.poll`: Rahmen „Jetzt“ trifft an der Mitte der Komponente den Zeiger (`elementFromPoint` in Seite und Rahmen), dann `page.mouse.move` dorthin | K3 |
| `buehne-036.spec.ts:592` (T-D) | Fokus | `komponente.focus()` | **unverändert** `komponente.focus()`, jetzt erst nach den bestätigten Zuständen oben (geladen mit `rev`, Schnitt, sichtbar, Zeiger trifft, Tooltip beim Hover gesehen). Ein `element.focus()` von der Seite aus fokussierte in Firefox nicht (kein Tooltip, 1/1 rot) – verworfen | K3 |

**Nicht geändert:** `rahmenBereit`, `abrufBeantwortet`, `seiteBereit` (außer der Kennung), `schrittBereit` (weiter genutzt von „the Zweitfarbe from material …“, `studio-035` nutzt `wackler-040`), `wackler-040.ts` (keine Änderung nötig), `buehne-036:711` 3.6 (nutzt keine der geänderten Hilfen außer `dokument()`/`geladen()` über `oeffne()`; seine Erwartung im `frameLocator` bleibt – Befund B-09, nicht Ziel der Spec), die Tooltip-Erwartungen und `toHaveAccessibleDescription` in 3.5 (Playwrights Rollen- und Beschreibungsregeln lassen sich von der Seite aus nicht gleich stark nachbilden).

### Begründung jeder ersetzten Erwartung (AC-7)

| Datei:Zeile (vorher) | vorher | nachher | gleich stark, weil | Grund |
|---|---|---|---|---|
| `buehne-036:258` | `expect(button).toBeVisible()` (Rahmen) | Teil `sichtbar: true` des Polls in `knopf()` | dieselbe Regel wie Playwright: nicht leere Box, nicht `visibility: hidden`, `display: contents` über die Kinder; gelesen im Dokument des Rahmens | K3: Lesen im Rahmen stirbt mit dessen Kontext (T-C) bzw. endet in Firefox nie (B-04) |
| `buehne-036:264` | `expect.poll(read).not.toBe("rgba(0, 0, 0, 0)")` | `expect.poll(…).toEqual({ sichtbar: true, farbe: expect.not.stringMatching(/^(rgba\(0, 0, 0, 0\))?$/) })` | **stärker**: zusätzlich „nicht leer“ und erst bei geladenem Dokument (URL = `src`, „complete“) | K3 |
| `buehne-036:554` | `expect(jetzt.locator("fm-pagxo").first()).toBeVisible()` | `expect.poll(() => sichtbarIm(page, JETZT, "fm-pagxo")).toBe(true)` | dieselbe Sichtbarkeitsregel, dazu „Dokument geladen“ | K3 (lokaler Hänger T-D, Wiederholung 22) |
| `buehne-036:555` | `expect(markiert).toHaveCount(0)` | `expect.poll(() => anzahlIm(page, JETZT, MARKIERT)).toBe(0)` | **stärker**: 0 zählt nur im geladenen Dokument (`null` sonst) | K3 |
| `buehne-036:567` | `expect(markiert.first()).toBeVisible()` | `expect.poll(…--mt-schnitt…).toBe("100%")` (neu) und `expect.poll(() => sichtbarIm(page, JETZT, MARKIERT)).toBe(true)` | dieselbe Sichtbarkeit, dazu der Schnitt als bestätigter Zustand vor der Aktion | K3 (CI-Hänger T-D, 43174596533) |
| `buehne-036:570`–`:580` | `komponente.evaluate(…)` (Warnfarbe, Umrissstil) | dieselbe Rechnung im Dokument des Rahmens von der Seite aus; dazu `expect(gelesen).not.toBeNull()` | gleiche Werte aus demselben Dokument (`defaultView.getComputedStyle`), die beiden `expect` darauf unverändert | K3 |
| `buehne-036:581` | `komponente.getAttribute("data-mt-pruefung-satz")` | aus demselben Lesen | gleicher Wert; `expect(satz).toMatch(…)` unverändert | K3 |
| `buehne-036:585` | `komponente.hover()` | `expect.poll(<Zeiger trifft die Komponente>)`, dann `page.mouse.move` zur Mitte | was `hover()` vorher prüft (im Bild, sichtbar, trifft den Zeiger), jetzt als benannte Erwartung; danach dieselbe Mausbewegung; die Tooltip-Erwartungen danach unverändert | K3: Aktion ohne eigenes Zeitlimit nur nach bestätigtem Zustand |
| `buehne-036:591` | `komponente.evaluate(tabIndex)` → `toBe(0)` | `tabIndex` aus dem Lesen von der Seite aus → `toBe(0)` | gleicher Wert (Attribut ändert sich durch Hover nicht) | K3 |
| `geladen-042:52` | `neu: performance.timeOrigin !== alt` | `neu: window[MARKE] !== alt` | **stärker**: die Kennung ändert sich nur mit dem Dokument (WebKit: `timeOrigin` desselben Dokuments +1 ms, B-14) | K2 (B-14) |
| `geladen-042:111` über `:224` | `rahmenBereit(…, { rev })` direkt nach der Entwurfsantwort | erst Antwort der Rahmen-Navigation mit `rev`, dann **dasselbe** `rahmenBereit(…, { rev })` | die Erwartung bleibt wörtlich, davor kommt nur ein Warten ohne eigenes Fenster | K2 (T-A, `testing.md`) |
| `geladen-042:144` über `:178` (T-B, `zweitfarbe-036:216`) | `abrufBeantwortet` 5 s ab dem Laden | Antwort `POST …/pruefung`, dann **dasselbe** `abrufBeantwortet` | wie oben | K2 (T-B) |
| `geladen-042:64` über `:177` (T-A `:181`) | `seiteBereit(…, vorDemLoeschen)` 5 s ab dem Druck | Antwort des neuen Dokuments, dann **dasselbe** `seiteBereit` | wie oben | K2 (B-14) |

Keine Erwartung wurde entfernt. Neu dazu: der rote Test (`fd90b67b`), `expect(gelesen).not.toBeNull()` und „Schnitt 100 %“ in 3.5.

**Kennung des Dokuments in WebKit (B-14), Probe** `/tmp/s050/t3/kennung.probe.ts` (Wegwerf), 04:21–04:23 unter 6 Busy-Loops wie Stufe (2), je Engine 3×: dasselbe Dokument 8 s lang gelesen (468–855 Lesungen), dann `reload`. **WebKit 3/3, Firefox 3/3, Chromium 3/3: die neue Marke hat je Dokument genau einen Wert und ist nach dem Neuladen eine andere.** Die Drift von `timeOrigin` (+1 ms) zeigte diese Probe in keiner Engine (je 1 Wert); belegt ist sie nur aus den vier roten Spuren der Stufe (2) (B-14). Die neue Kennung hängt nicht an der Uhr: Sie ist eine Eigenschaft des `window`, das nur das Dokument hat.

### Regressionen und Zwischenprüfung (T3)

Alle aus `packages/eroj` bzw. dem Repo-Root, unter der Sperre, ohne fremde Test-Prozesse (`fremdtest.sh`: 0 Treffer in jeder Reihe), Desktop-Grundlast wie D-12. Ausgaben: `…/fundamento-wt-mwdq3cluiyydrirx/s050-lokal/t3-*/` bzw. `/tmp/s050/t3/reg/`.

| Lauf | Stand | Zeit, `uptime` 1 min | Ergebnis |
|---|---|---|---|
| Nach dem K4-Fix: `buehne-036.spec.ts`, `buehne-navigation-042.spec.ts`, `zweitfarbe-036.spec.ts` je Engine einmal (`--workers 2`, drei Engines) | `de3fd057` (Tests noch alt, mit rotem Test), gebaut | 03:51–03:55, 9,30 → – | **81/81 grün** (`buehne-navigation-042` grün, unverändert) |
| `FM_AUSGABE=knapp FM_MESSUNG_044_N=2 pnpm --filter @fundamento/metiejo test` (Quelle, inkl. `antworten-044`, `stato-044`, `ableitung-050`) | `de3fd057` | 03:55–04:01 | **670/670 grün** |
| `FM_SERVILO_044=dist`: `antworten-044`, `stato-044`, `ableitung-050` | `de3fd057`, gebaut | 04:01, → 4,48 | **8/8 grün** |
| Fixtures | – | – | `git diff de931e40 -- …/antworten-044.json` leer, `git diff a9ecfa40 -- …/ableitung-050.json` leer. `CLIENT_SCRIPT` liefert der Server als eigene Datei aus; keine der 66 Antworten von `antworten-044` enthält ihn (Fälle: `POST pruefung`, `GET stato`, `GET vorschau …`, `GET vorschau.css`) – **byte-gleich** |
| Nach den Test-Änderungen: dieselben drei Dateien je Engine einmal (Reihe `t3-einmal`) | Arbeitsbaum = `9a51b5cd` (Kopf noch `de3fd057`, Commits danach ohne Änderung des Inhalts) | 04:06–04:09, 9,99 → – | **81/81 grün**. Davor zwei rote Fassungen von 3.5, beide im Test selbst: `instanceof Element` über die Grenze des Rahmens (3/3 rot, jede Engine) und `element.focus()` von der Seite aus (Firefox 1/1 rot, kein Tooltip) – beide behoben, siehe D-24 |
| **Zwischenprüfung** `buehne-036.spec.ts -g "3\.(4\|5)" --workers 2 --repeat-each=10` (Reihe `t3-zwischen-buehne`, `s050-werkzeug/reihe.sh`) | `9a51b5cd` | 04:09–04:15, 12,30 → 12,20 | **120/120**: je Engine 10/10 für T-C 3.4 Material, 3.4 Recherche, 3.4 (Spec 050), T-D 3.5 |
| **Zwischenprüfung** `zweitfarbe-036.spec.ts --workers 2 --repeat-each=10` (Reihe `t3-zwischen-zweitfarbe`) | `9a51b5cd` | 04:15–04:22, 12,20 → 10,43 | **150/150**: T-A `:129` Assistent und Schnellstart, T-B `:196` Assistent und Schnellstart, Material – je 10/10 in Chromium, Firefox, WebKit |
| `pnpm lint` | `9a51b5cd` | 04:24 | grün (ein Lauf davor mit Exit 1 ohne Fehlerzeile im eigenen Code, die Wiederholung grün; Warnungen nur `modelo` `ci/workflow.test.ts`, unberührt) |

Die Zwischenprüfung lief in Stufe (1) (CI-ähnlich, keine Busy-Loops); `uptime` 9–14 kommt aus den eigenen Läufen davor und der Desktop-Grundlast (VM bis 0,5 Kerne laut `fremdlast.txt`). Sie zählt **nicht** für AC-4; die bindende Nachher-Reihe (30/30, beide Stufen) macht T5. Über die CI-Raten sagt sie nichts: T-B, T-C und T-D waren lokal schon vorher grün.

### Commits T3

| Commit | Inhalt |
|---|---|
| `fd90b67b` | Spec 050 T3: red test, the frame navigates twice after a reload (nur `buehne-036.spec.ts`) |
| `de3fd057` | Spec 050 T3: the client lays a copy of each preview frame in its place, so Firefox restores no frame on reload (nur `packages/metiejo/src/html.ts`) |
| `c5147982` | Spec 050 T3: wait for the answers behind the check before reading the step, and a document mark that holds in WebKit (`geladen-042.ts`, `zweitfarbe-036.spec.ts`) |
| `9a51b5cd` | Spec 050 T3: read the stage's frames from the page, confirm the state before acting in a frame (`buehne-036.spec.ts`) |
| (Doku) | Spec 050 T3: plan and tasks |

### Was T3 nicht belegt

- **T-C war lokal nie rot** (T1: 30/30 je Engine in beiden Stufen). Der K4-Fix ist durch die Zählung der Anfragen belegt (Firefox rot 3/3 → grün 9/9, Zwischenprüfung 30/30), nicht durch ein lokal rotes T-C.
- **T-D war lokal ohne fremde Last nie rot.** Ob die Umstellung den Hänger von Playwright-Firefox (B-04, K5) beseitigt, zeigt erst CI. Rest-Risiko: `komponente.focus()`, die Tooltip-Erwartungen und `toHaveAccessibleDescription` stehen weiter im `frameLocator`; fehlt Playwright der Kontext des Rahmens ganz, kann dort weiter eine Erwartung mit „timeout 5000ms“ nicht enden – sie kommt jetzt aber erst nach vier benannten Zuständen (geladen mit `rev`, Schnitt, sichtbar, Zeiger trifft), von der Seite aus gelesen.
- **K2 bei T-A/T-B** ist lokal nicht rot zu machen (Prüfung lokal 1,5 s, CI 3,9 bis > 11 s); der Nachweis ist der Dispatch (AC-5). Für T-B bleibt B-15 offen.

## 30/30 vorher (V-3, AC-4)

Alle Reihen aus `packages/eroj` auf dem Produktcode von `de931e40` (2026-11-12 gebaut, D-09; 2026-11-13 als `79a463bc` ausgecheckt und gebaut, D-22), unter der Sperre, allein (keine fremde Test-Last), mit dem Skript `/tmp/s050/reihe.sh` (Kopf mit `uptime`, fremden Test-Prozessen, Top-CPU; Stichproben `fremdlast.sh` alle 30 s). Ausgabe, `test-reports/` und `test-results/` jeder Reihe außerhalb des Repos unter `…/fundamento-wt-mwdq3cluiyydrirx/s050-lokal/<reihe>/` (kopiert, bevor die nächste Reihe `test-results/` leert). Stufen nach D-13: **(1) CI-ähnlich**, **(2) CPU begrenzt** (6 Busy-Loops).

### Reihen

| Reihe | Stufe | Befehl (aus `packages/eroj`) | Zeit (Ortszeit) | Dauer | `uptime` 1 min vorher → nachher | VM (Docker) Mittel / Max | Ergebnis |
|---|---|---|---|---|---|---|---|
| `zweitfarbe-vorher` | (1) | `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test test/zweitfarbe-036.spec.ts --workers 2 --repeat-each=30` | 19:28–19:56 | 1655 s | 10,91 → 16,22 | 1,31 / 3,41 Kerne | 449 grün, 1 rot |
| `buehne-vorher` | (1) | `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test test/buehne-036.spec.ts --workers 2 --repeat-each=30` | 19:57–21:33 | 5789 s | 12,72 → 23,81 | 0,89 / 3,07 Kerne | 1704 grün, 6 rot; **ab 20:40 unter fremder Test-Last (B-08): nur zur Information, zählt nicht für AC-4** |
| `achsen-vorher` | (1) | `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=webkit pnpm exec playwright test test/achsen-2b2.spec.ts --workers 2 --repeat-each=30` | 21:45–22:26 | 2453 s | 13,39 → 67,74 | 0,81 / 2,38 Kerne | 1350 grün, 30 rot (alle `:82`); ab 22:10 fremde Eroj-Suite (B-08); der Zieltest war bis 22:05 schon 29/30 rot, das 30. Rot bis 22:15 |
| `buehne-vorher-2` (Wiederholung von `buehne-vorher` ohne fremde Last) | (1) | wie `buehne-vorher` | 2026-11-13 00:34–01:35 | 3667 s | 6,74 → 5,02 | 0,71 / 2,71 Kerne | **1710 grün, 0 rot**; fremde Test-Prozesse: 0 (122 Stichproben) |
| `shard2-vorher` (Q-5, einmal) | (1) | `PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test --shard 2/4 --list` (506 Tests in 47 Dateien: 168 Chromium, 338 Firefox; enthält `[firefox] › buehne-036.spec.ts:545:3 › … 3.5 …`, wie CI-Shard 2), dann `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test --shard 2/4 --workers 2` | 01:38–01:42 | 239 s | 2,99 → 8,40 | 0,60 / 1,04 Kerne | **505 grün, 0 rot, 1 übersprungen** (wie in CI); fremd: 0 |
| `zweitfarbe-vorher-cpu` | (2) | wie `zweitfarbe-vorher`; davor 6 Busy-Loops (PIDs 23108–23113, 01:43:33 gestartet, 02:11:42 beendet) | 01:43–02:12 | 1689 s | 5,88 → 21,88 | 0,65 / 1,79 Kerne | **446 grün, 4 rot** (alle T-A Assistent WebKit); fremd: 0 |
| `buehne-vorher-cpu` | (2) | wie `buehne-vorher`; davor 6 Busy-Loops (PIDs 45932–45937, 02:14:29 gestartet, 03:32:46 beendet) | 02:14–03:33 | 4696 s | 5,64 → 16,63 | 0,73 / 2,21 Kerne | **1710 grün, 0 rot**; fremd: 0 |
| `zweitfarbe-spuren` (Extra-Reihe, D-16, zählt **nicht** für V-3) | (1) | `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test test/zweitfarbe-036.spec.ts --workers 2 --repeat-each=5 --trace on` | 03:34–03:38 | 232 s | 7,07 → 6,38 | – | 75 grün; Spuren `s050-lokal/zweitfarbe-spuren/test-results/` (B-15) |

### Tabelle (V-3)

| Test | Engine | vorher x/30, Stufe (1) CI-ähnlich (`de931e40`) | vorher x/30, Stufe (2) CPU begrenzt (`de931e40`) | nachher x/30 (T5, gleiche Stufen) | Befund / Trace |
|---|---|---|---|---|---|
| T-A `zweitfarbe-036:129` Assistent | Chromium | **29/30** | 30/30 | offen | (1) 1 rot (Wiederholung 17): `rahmenBereit` rev 2 an `:157`, Rahmen rev 2 nach 4113 ms (hinter der Prüfung), `s050-lokal/zweitfarbe-vorher/test-results/zweitfarbe-036-the-assista-ccadb-h-the-keyboard-then-cleared-chromium-repeat17/trace.zip` |
| | Firefox | 30/30 | 30/30 | offen | – |
| | WebKit | 30/30 | **26/30** | offen | (2) 4 rot (Wiederholungen 12, 23, 24, 25), alle an `:181` (`schrittBereit` nach „Keine Zweitfarbe“, B-14), `s050-lokal/zweitfarbe-vorher-cpu/test-results/…-webkit-repeat{12,23,24,25}/trace.zip` |
| T-A `:129` Schnellstart | Chromium / Firefox / WebKit | 30/30 / 30/30 / 30/30 | 30/30 / 30/30 / 30/30 | offen | nie rot (CI 0/11) |
| T-B `zweitfarbe-036:196` Schnellstart | Chromium | 30/30 | 30/30 | offen | lokal nicht reproduziert; CI 5/11 rot |
| | Firefox | 30/30 | 30/30 | offen | lokal nicht reproduziert; CI 7/11 rot |
| | WebKit | 30/30 | 30/30 | offen | lokal nicht reproduziert; CI 6/11 rot |
| T-B `:196` Assistent | Chromium / Firefox / WebKit | 30/30 / 30/30 / 30/30 | 30/30 / 30/30 / 30/30 | offen | nie rot (CI 0/11) |
| T-C `buehne-036:463` 3.4 | Chromium / Firefox / WebKit | 30/30 / 30/30 / 30/30 (`buehne-vorher-2`); dazu `buehne-vorher` 30/30 je Engine, nur zur Information | 30/30 / 30/30 / 30/30 | offen | lokal nicht reproduziert; Ursache aus der CI-Spur und der Rahmen-Probe (V-1) |
| T-D `buehne-036:545` 3.5 | Chromium / Firefox / WebKit | 30/30 / 30/30 / 30/30 (`buehne-vorher-2`); dazu `buehne-vorher` Firefox **29/30** unter fremder Last, nur zur Information | 30/30 / 30/30 / 30/30 | offen | ohne fremde Last nicht reproduziert; der eine lokale Hänger (Firefox, Wiederholung 22, ≈ 20:41, fremde Last): `s050-lokal/buehne-vorher/test-results/buehne-036-Bühne-Spec-036--a962f-tence-on-hover-and-on-focus-firefox-repeat22/trace.zip` |
| T-D im Shard 2/4 | Firefox (Shard: Chromium + Firefox) | **1/1** (`shard2-vorher`, einmal, Q-5) | – (D-13) | offen | Shard 505 grün, 1 übersprungen |
| T-E `achsen-2b2:82` | WebKit (macOS) | **0/30** (30/30 rot, deterministisch) | – (Stufe (2) nicht nötig, D-13) | offen | jedes Rot `toBeFocused` → „inactive“ (`:94`); Traces `s050-lokal/achsen-vorher/test-results/achsen-2b2-②b-2-A-markobut-0b614-r-its-label-sends-its-value-webkit*/` |

**Mitgezählt, nicht Ziel der Spec** (`buehne-vorher`, nur Information): `buehne-036:711` 3.6 dunkel/schmal Firefox 27/30, dunkel/breit Firefox 29/30 (B-09); `buehne-036:324` 3.2 WebKit 29/30 (B-10). Alle anderen Tests der drei Dateien 30/30 in jeder Engine.

**Gezählt für AC-4:** `zweitfarbe-vorher`, `zweitfarbe-vorher-cpu`, `buehne-vorher-2`, `buehne-vorher-cpu`, `shard2-vorher`, `achsen-vorher` (Zieltest vor der fremden Last fertig, B-08). **Nur zur Information:** `buehne-vorher` (fremde Test-Last ab 20:40). **Nicht für V-3:** `zweitfarbe-spuren` (Extra-Reihe mit Spuren).

**Was die Vorher-Raten sagen:** Lokal sind die CI-Raten (T-A, T-B in 11/11 Läufen rot) auch mit CPU-Begrenzung nicht zu erreichen: Der Rahmen rev 2 hinter der Prüfung braucht in Stufe (2) 1,9–2,1 s (CI 3,9 bis > 11 s). Stufe (1) zeigt T-A einmal (Chromium, Wartestelle der CI), Stufe (2) viermal in WebKit an einer **zweiten** Wartestelle (B-14). T-B, T-C und T-D sind ohne fremde Last in beiden Stufen 30/30; ihre Ursachen kommen aus den CI-Spuren, der Rahmen-Probe und den Hängern unter fremder Last (V-1). T5 wiederholt dieselben Reihen mit denselben Stufen; ein grünes „nachher“ für T-B/T-C/T-D ist lokal kein Nachweis der Wirkung – den liefert erst der Dispatch (AC-5).


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
| B-01 | **Nur die Varianten mit einem 5-s-Poll hinter der Prüfung reißen** (für T-B am 2026-11-13 teilweise widerlegt, B-15). T-A rot ist immer „Assistent“ (Rahmen `buehne-farbe` rev 2 wartet auf die Prüfung, `rahmenBereit` pollt 5 s), T-B rot immer „Schnellstart“ (`abrufBeantwortet` pollt 5 s auf `POST /pruefung`). Die Schwester-Varianten derselben Zeilen sind in 11/11 Läufen grün: Schnellstart `:129` wartet nach dem Tippen auf die Prüfung über ein Antwort-Ereignis (`entwurfGespeichert`, `page.on("response")`, nur durch das Test-Timeout begrenzt), sein Rahmen `farbe` wartet nicht auf die Prüfung; beim ersten Laden pollt er auch 5 s auf `POST /pruefung` – **die Vermutung, er beginne später als T-B, ist widerlegt (B-15)**. Assistent `:196` wartet auf keine Prüfung (`data-mt-sxtupo` = `asistanto-gvidkoloro`, die Prüfung von rev 1 lief in `GET /asistanto/…` vor dem HTML). Dieselbe Prüfung, dasselbe Shard – rot nur, wo ein festes Fenster kurz nach ihrem Beginn liegt. | Beleg für K2 als Nebenursache von T-A/T-B (V-1). T3: `waitForResponse` vor der Aktion nach `testing.md` (Q-2). |
| B-02 | **Die Prüfung ist schon allein auf dem Runner halb so lang wie das Fenster.** Unit-Job (ein Server, kein Browser): Median 1,5–2,8 s, Max 2,1–3,8 s je nach Runner-Typ (EPYC 9V45 am schnellsten, EPYC 7763 am langsamsten). Im Eroj-Job mit zwei Playwright-Workern, Browsern und je einem Server pro Worker und Datei: 3,9–4,6 s beendet, sonst > 4,4 bis > 11 s. | Die eigene Rechenzeit ist der größte Einzelteil (K4), die Last im Shard verlängert sie um den Faktor ≈ 1,6–4 (K1, Nebenursache). |
| B-03 | **94 % der Prüfung sind Prüfregeln, 82 % allein `validateModeloFiles` (`packages/modelo`, tabu).** Ableitung ≈ 100 ms. Die zwei `buildModelo` kosten zusammen ≈ 16 ms. | Für T2: „unter 1 s“ geht nur, wenn `validateModeloFiles`/`evaluateAlirebleco` seltener oder mit wiederverwendeten Teilergebnissen laufen, ohne `packages/modelo` zu ändern und byte-gleich. Sonst Befund mit Werten (Risiko §6 der Implementierungs-Spec). Eine Zweitfarbe ändert Tokens; welche Regeln davon unabhängig sind, muss T2 belegen. |
| B-04 | **Playwright-Firefox: Erwartung im `frameLocator` hängt nach einer Navigation des Rahmens bis zum Test-Timeout**, obwohl sie `with timeout 5000ms` protokolliert. Zwei Spuren: T-D (43174596533, nach `page.goto`, neue Rahmen) und `buehne-036:711` 3.6 dunkel/schmal (42459842953, nach dem Wechsel auf `scheme=dark`, dieselben Rahmen). In beiden navigiert jeder Rahmen genau einmal, und von den neuen Rahmendokumenten gibt es keinen einzigen `frame-snapshot`. | T-D ist kein Fall von K4 (Prüfung) und keiner von „intercepts pointer events“. T3 muss eine Wartestelle finden, die nicht im `frameLocator` des gerade ersetzten Rahmens liegt (Lesen über `contentDocument` der Seite, wie `rahmenBereit`), bevor Aktionen im Rahmen folgen. `buehne-036:711` ist nicht in Spec 050 (nur Befund für den Bericht). |
| B-05 | **T-C ist seit Spec 044 in der CI nicht mehr rot** (0/10 Läufe mit Firefox ab `76158a0`), die einzige rote Spur stammt von `7f4b65d` (#155-Dispatch). | Ursache aus dieser Spur und der Rahmen-Probe auf `de931e40`. |
| B-06 | **T-E ist in Linux-WebKit grün** (11/11 Läufe). | Plattform (K5), siehe Plattform-Probe. |
| B-07 | Die CI-Läufe laufen auf verschiedenen Runner-Typen; die Prüfung im Unit-Job schwankt deshalb zwischen 1,5 und 2,8 s (Median). Auch auf dem schnellsten Typ (EPYC 9V45, Lauf 43200873975 = Basis `de931e40`) war T-A in Firefox und WebKit rot (Rahmen rev 2 nach 4595/4476 ms). | Ein Fix, der nur auf schnellen Runnern grün ist, reicht nicht; die Nachher-Reihe in T5 braucht dieselbe Last wie vorher. |
| B-08 | **Fremde Test-Last während T1.** Eine andere Sitzung im Arbeitsbaum `fundamento-wt-mwdq3k9mtj0jstz2` (eigene Sperre, nicht diese) ließ ab 20:40:09 Vitest-Suiten laufen (`modelo`, `projekcioj`, `checks/run.js alirebleco/clean-room`; in den `ps`-Stichproben 20:52 und 21:02 zusammen ≈ 1 Kern, Load 1 min bis 50) und ab 22:10:31 eine ganze Eroj-Suite (`vitest run && playwright test`, Load bis 79). Gesehen über `ps` (Startzeiten) und ab 21:37 über `/tmp/s050/fremdtest.sh`. | Die Reihe `buehne-vorher` (19:57–21:33) lief ab 20:40 unter fremder Test-Last und zählt nach §2.8 **nur zur Information**; sie wird wiederholt (`buehne-vorher-2`). Die Reihe `achsen-vorher` (21:45–22:26) lief ab 22:10 unter fremder Last; ihr Zieltest war schon vorher 29/30 rot (deterministisch, Plattform), das 30. Rot fiel zwischen 22:05 und 22:15. `zweitfarbe-vorher` (19:28–19:56), `messung-044`, Profil und Proben liefen ohne fremde Test-Last. Jede weitere Reihe startet erst, wenn 90 s lang kein fremder Test-Prozess lief (`/tmp/s050/warte-ruhe.sh`). |
| B-09 | **Lokal hängen in Firefox Erwartungen im `frameLocator` nach einer Navigation des Rahmens, wie in CI** (B-04): in `buehne-vorher` 5 Treffer (T-D 1/30; `buehne-036:711` 3.6 „dunkel, schmal“ 3/30, „dunkel, breit“ 1/30), alle Firefox, alle mit `with timeout 5000ms` und Test-Timeout 120 s, alle ohne `frame-snapshot` der neuen Rahmendokumente, alle in der Zeit fremder Test-Last (B-08). | Mechanismus von T-D lokal belegt; die Rate „CI-ähnlich“ kommt aus der Wiederholung. `buehne-036:711` ist nicht in Spec 050 (Befund für den Bericht); ein Fix für T-D in T3 sollte die gemeinsame Ursache treffen, ohne 3.6 anzufassen (Tabu: andere Tests nur, wenn frei – 3.6 steht in der freien Datei `buehne-036.spec.ts`, ist aber kein Ziel dieser Spec). |
| B-10 | `buehne-036:324` 3.2 (WebKit) einmal rot in `buehne-vorher` (Wiederholung 11): `page.evaluate: Execution context was destroyed` in `dokument()` über `seiteBereit` (`geladen-042.ts:18`/`:64`) aus `geladen()` (`buehne-036.spec.ts:129`, `:350`) – die Seite wechselte zwischen dem Poll und dem Lesen von `timeOrigin` noch einmal das Dokument. Unter fremder Last. | Nicht in Spec 050; nur Befund. |
| B-11 | **„Unter 1 s“ ist ohne Änderung an `packages/modelo` nicht erreichbar.** Je Prüfung (Profil T1, ruhig, ms): Ableitung ≈ 100 (davon Paletten 77–95, jetzt bei einer neuen Zweitfarbe ≈ 12/105 davon), Prüfregeln ≈ 1649, davon `validateModeloFiles` 1429 (`regularoEnforcementIssues` 650, `combinationIssues`/`resolutionsOf` 498, `aspirojIssues` 162, Rest 119) und `evaluateAlirebleco` 172 – alles `modelo`. Selbst ohne jede Ableitung blieben ≈ 1,55 s. Diese Arbeit läuft über alle 144 Kombinationen, die Hälfte für komuna, und hängt am `Modelo`-Objekt (D-17). | Was `modelo` bieten müsste (für eine eigene Spec, nicht hier): (a) Auflösungen und Kombinationsbefunde je **Kombination und den Sets, die sie tatsächlich berühren**, nicht je `Modelo` – dann rechnete eine Marke ihre 72 Kombinationen, komuna nie neu; oder (b) eine Validierung „nur für das Paket X“ mit der Referenz als vorberechneter Grundlinie (`protected-minimum` braucht komunas Werte, nicht ihre Befunde); oder (c) eine Option für `evaluateAlirebleco`, nur die Kombinationen eines Aspekto zu messen. (a) oder (b) halbierte die Prüfregeln grob (≈ 0,8 s lokal). |
| B-12 | **Fremde Test-Last während T2** wie B-08: Die Sitzung `fundamento-wt-mwdq3k9mtj0jstz2` ließ ab spätestens 23:25 `turbo run test --concurrency=1 --continue --filter=!@fundamento/eroj` laufen (Load 1 min bis 31). Code, Fixture, roter Test, Fix und die Prüfläufe (funktional) liefen darunter, die Zeitmessung nicht. | Messung nachher und Zwischenprüfung erst bei Ruhe (`warte-ruhe.sh`), siehe „Lokal nach T2“. |
| B-13 | **`pnpm test:betroffen` rot nur in `nordstelo`, nur durch Zeitfenster, nur im gemeinsamen Lauf.** Der Satz von `betroffen` (9 Pakete, `turbo run test` ohne `--concurrency`) ließ `nordstelo` neben den anderen Paketen laufen; zweimal ohne fremde Test-Prozesse (23:50 und 00:04, Load 1 min bis 80–89 durch die eigenen parallelen Pakete und eine Spitze der virtuellen Maschine) liefen 14 bzw. 12 Tests in `nordstelo` in das Standardfenster von Vitest (5 s Test, 10 s Hook: `k8/soloj.test.ts:108/129/145/255`, `k8/gegenprobe.test.ts:81`, `ablauf/raporto.test.ts:70–236`, `ablauf/cli-ablauf.test.ts:626`, `ac8.test.ts`, `ablauf/integra.test.ts`). Keine einzige Erwartung schlug fehl; jeder Fehler ist „timed out“. `nordstelo` allein (00:08, `turbo run test --filter=@fundamento/nordstelo`): **270/270 grün in 16 s**. Turbo bricht ohne `--continue` beim ersten roten Paket ab, darum hat `test:betroffen` die übrigen Pakete nicht zu Ende gebracht. | Kein Fehler durch T2 (R0-h greift nicht: allein grün, der Fix macht nur schneller). Fenster nicht angehoben (R0-a), `nordstelo` ist tabu. Vollständiger Nachweis mit demselben Paketsatz nacheinander: siehe „Schluss T2“ (dort zusätzlich `projekcioj` `komuna-fonto.test.ts:182` einmal über 60 s, allein grün). Für den Bericht: `nordstelo` hält im gemeinsamen lokalen Lauf unter Last die 5-s-Fenster nicht. |
| B-14 | **WebKit: `dokument()` (`performance.timeOrigin`) ist keine feste Kennung eines Dokuments.** In allen 4 roten T-A-Läufen der Stufe (2) (WebKit, Wiederholungen 12, 23, 24, 25) liefert dasselbe Dokument zuerst `…390/…506/…514/…879` und Sekunden später `…391/…507/…515/…880` (+1 ms). `seiteBereit(page, merkmal, vorDemLoeschen)` meldet deshalb `neu: true` für die **alte** Seite, während deren Neuladen noch hinter der Prüfung von rev 3 wartet (`GET /asistanto/…` 2207–2514 ms); `schrittBereit` liest `data-mt-rev="2"` und wartet mit `rahmenBereit` auf rev 2, der Rahmen zeigt danach rev 3 → rot nach 5 s (`geladen-042.ts:111` über `:181`, `zweitfarbe-036.spec.ts:181`). Spuren `s050-lokal/zweitfarbe-vorher-cpu/test-results/zweitfarbe-036-the-assista-ccadb-h-the-keyboard-then-cleared-webkit-repeat{12,23,24,25}/trace.zip`; Werte aus den `evaluateExpression`-Ergebnissen (`/tmp/s050/ergebnis.py`). | Zweite K2-Wartestelle von T-A (V-1). T3: die Kennung „anderes Dokument“ ohne `timeOrigin`-Gleichheit lesen (z. B. eine Marke, die nur das neue Dokument trägt); dieselbe Hilfe nutzen `geladen()` in `buehne-036` (T-C nach „Schließen“) und `zweitfarbe-036:163`. Kein Fenster, keine Toleranz (R0-a). |
| B-15 | **B-01 für T-B teilweise widerlegt** (Extra-Reihe `zweitfarbe-spuren`, 75/75 grün, `--trace on`): Der Poll von `abrufBeantwortet` beginnt nach dem Senden von `POST /pruefung` in Schnellstart `:129` 0,03–0,34 s, in T-B (`:196`) 0,03–0,20 s – gleich früh. Die erste Prüfung dauert in T-B 1716–1868 ms (Median 1786), in `:129` 1500–1667 ms (Median 1568), also ≈ 14 % länger; Rahmen `buehne-farbe` rev 2 (T-A) 1573–1700 ms. | Für T-B bleibt K2 nur durch die Klassenregel belegt (fester Poll hinter der Serverrechnung), nicht durch den Vergleich der Varianten; warum T-B in CI 11/11 und `:129` 0/11 rot ist, ist **nicht belegt** (Kandidat: die zurückgehaltene Vorschau in T-B, `page.route`, lässt die Prüfung mit `vorschau.css` zusammenfallen – nicht gemessen). Für T-A bleibt B-01 gültig (dort wartet die Schwester nach dem Tippen auf ein Ereignis). |
| B-16 | **Playwrights `page.reload()` zeigt die doppelte Anfrage in Firefox nicht**, `location.reload()` der Seite schon (roter Test erst mit `page.reload()`: 9/9 grün ohne Fix; mit `location.reload()` Firefox 3/3 rot). Die Rahmen-Probe (D-15) und das Produkt („Schließen“) laden über `location.reload()`. | Der rote Test lädt wie das Produkt. Für T5: Ob Tests, die mit `page.reload()` laden (`zweitfarbe-036:162`), die doppelte Navigation je sahen, ist nicht geprüft. |

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
# so in T1 gelaufen (aus packages/eroj; Skripte in …/fundamento-wt-mwdq3cluiyydrirx/s050-werkzeug/, erwarten ihre Sampler unter /tmp/s050/):
#   Stufe (1): s050-werkzeug/reihe.sh <name> FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test test/<datei>.spec.ts --workers 2 --repeat-each=30
#   Stufe (2): s050-werkzeug/reihe-cpu.sh <name> FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test test/<datei>.spec.ts --workers 2 --repeat-each=30
#   (reihe-cpu.sh startet die 6 Schleifen aus /tmp/s050/last, ruft reihe.sh und beendet genau diese PIDs; Stufe (2) für zweitfarbe-036 und buehne-036)
FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test test/zweitfarbe-036.spec.ts --workers 2 --repeat-each=30
FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test test/buehne-036.spec.ts --workers 2 --repeat-each=30
PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test --shard 2/4 --list | grep 'buehne-036.spec.ts:545'
FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm exec playwright test --shard 2/4 --workers 2
FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=webkit pnpm exec playwright test test/achsen-2b2.spec.ts --workers 2 --repeat-each=30
# Zählen je Test und Engine aus der JUnit
python3 -I /tmp/s050/zaehle.py packages/eroj/test-reports/playwright/junit.xml '<Muster>'
uptime; rm -r "$L"
```
