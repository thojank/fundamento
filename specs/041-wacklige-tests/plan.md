# Spec 041 – Wacklige Tests stabil (Nachlauf CI1) – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `3c006222b752d8921102bd1e6e787d5c072529a395cc24450cd433390003ec3f`) · **Aufgaben:** [`tasks.md`](tasks.md) · **Basis:** `main` `c66ed99f` (Merge #145; enthält #144 und Spec 040) · **Regel 0** gilt. **Keine Grenzen, Zeitlimits, Schwellen, Abfrageintervalle oder Retries angehoben. Nichts gemergt.** Kein Sprachmodell (0 $).

**Datum:** 2026-11-05 · **Stand:** T1, T2 (Gerüst, B-8 samt N-2), T3 und T5 fertig; T4 ohne Fix beendet (B-14 offen, kein schuldiger Commit); T6 hat T4 und T5 eingetragen, beide PRs geöffnet, je drei Läufe gemessen und berichtet (Bericht unten).

### G-0 Quelle

| | Wert |
|---|---|
| Quelle | `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec041/spec.md` |
| SHA-256 laut Auftrag | `3c006222b752d8921102bd1e6e787d5c072529a395cc24450cd433390003ec3f` |
| SHA-256 der Quelle (2026-11-05, 15:49 Ortszeit, `shasum -a 256`) | `3c006222b752d8921102bd1e6e787d5c072529a395cc24450cd433390003ec3f` |
| SHA-256 der Kopie `specs/041-wacklige-tests/spec.md` | `3c006222b752d8921102bd1e6e787d5c072529a395cc24450cd433390003ec3f` |
| Ergebnis | **gleich.** Kopiert mit `cp`, nicht über ein Editor-Werkzeug. `pnpm check:privat` mit der Kopie grün. |

### Branches und PRs

| Teil | PR | Branch | Basis | Inhalt |
|---|---|---|---|---|
| A | [#148](https://github.com/thojank/fundamento/pull/148), offen, nicht gemergt | `261105-spec-041-flaky-tests-stabilisi-ae940d` | `main` (`c66ed99f`) | T1, T2, T3, T6 (Doku-Test, Pins); `specs/041-wacklige-tests/**`. T4 brachte keinen Commit (B-14 offen). |
| B | [#147](https://github.com/thojank/fundamento/pull/147), offen, nicht gemergt | `261105-spec-041-ci-browser-cache` | `main` (`c66ed99f`) | T5: `.github/workflows/ci.yml` und `packages/modelo/src/ci/workflow.test.ts` (D-03) |
| T4-Arbeitsbranch | nie ein eigener PR | `261105-spec-041-m5` | `main` (`c66ed99f`) | T4 (B-14) blieb ohne Commit auf `c66ed99f`, nie gepusht; von T6 entfernt (`git worktree remove`, `git branch -d`). Nichts zu übernehmen. |
| Wegwerf-Refs | nie ein PR, gelöscht | `s041-m5-runde-1` … `s041-m5-runde-5`, `s041-m5-diagnose` | `origin/main` | T4: Bisektion (D-09) und CDP-Diagnose (D-25); von T4 gelöscht. `s041-m5-fix` nie angelegt (kein Fix). `s041-a-und-b` (T6, optional) nicht angelegt. `git ls-remote origin 's041-*'` leer. |

PR A und PR B sind nicht gestapelt und teilen keine Datei.

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf ist unbeaufsichtigt. Wo die Spec offen ließ, gilt die Annahme. „angewandt“ = so umgesetzt; „offen“ = Ticket steht noch aus. Alle Einträge sind vom Maintainer zu bestätigen.

### Entscheidungen der Implementierungs-Spec (D-01 bis D-12)

| ID | Frage | Annahme | Stand |
|---|---|---|---|
| D-01 | B-12 trifft `packages/eroj/test/buehne-036.spec.ts:324` (`request.get`) und `metiejo-036-uebernahme.spec.ts` (globales `fetch`); die Hilfe `nachEinemReset()` liegt in `packages/eroj/test/wackler-040.ts`, die `studio-035.spec.ts` einbindet. `buehne-036.spec.ts` ist eine T1-Datei in PR A. | **B-12 geht in PR A, in T1** (Fall „Klärungen“ der Produkt-Spec). Der Bericht nennt es. | angewandt |
| D-02 | B-9 („Vorschau-Rahmen, Firefox“) und B-15 (`studio-035.spec.ts:250` › 3.4, Firefox) sind derselbe Test mit demselben Bild. Zwei Tickets an einem Test kollidieren. | **B-15 geht von T1 zu T3.** T3 hat `studio-035.spec.ts` › 3.4 in allen drei Engines. | angewandt |
| D-03 | PR B soll nur `.github/workflows/**` ändern; `packages/modelo/src/ci/workflow.test.ts` pinnt den Schritt „Playwright browsers“ wörtlich und die Form jedes Jobs. | **PR B = `.github/workflows/ci.yml` + `packages/modelo/src/ci/workflow.test.ts`.** Kein Ticket von PR A ändert eine der beiden Dateien. B-12 ist nicht mehr in PR B (D-01). | angewandt |
| D-04 | Die Werkstatt liegt nicht in `packages/eroj`, sondern in `packages/projekcioj/src/celoj/vitrino/`. Die Tests sind `packages/eroj/test/vitrino.check.ts` und `m5.ts`. | T4 arbeitet in den Generator-Quellen unter `packages/projekcioj/src/celoj/vitrino/`. Keine Vitrino-Ausgabe und keine Vitrino-Screenshot-Baseline ist versioniert. | angewandt (T4 fand keinen schuldigen Commit, nichts geändert; D-23) |
| D-05 | AC-8 nennt fünf Zeilen `playwright install --with-deps`; `ci.yml` hat **sechs** (`eroj`, `alirebleco-eroj`, `rendered-checks`, `werkstatt`, `vitrino`, `zeittests`). | T5 deckt alle sechs ab. | angewandt |
| D-06 | Ein Cache nur der Browser-Binaries behebt I-1 nicht (Spec 040: Download 11–17 s, der Rest ist apt für `--with-deps`; Systempakete sind laut Playwright nicht cachebar). | Der Treffer-Pfad meidet den Spiegel: `playwright install-deps --dry-run <engines>`, nur Fehlendes installieren, bevorzugt aus gecachten `.deb`-Dateien. Gemessen wird, ob der Spiegel bei einem Treffer noch angefragt wird; sonst I-1 „teilweise“ mit Messung. | angewandt (Treffer ohne Spiegel, D-19) |
| D-07 | Reihenfolge: B-8 (verwaister `stato`-Abruf über ein Neuladen) kann selbst Navigationen in Bühne- und Studio-Tests stören (B-10, B-13, B-9/B-15). | **T2 zuerst.** T1 und T3 nehmen ihren lokalen roten Nachweis auf einem Stand mit B-8-Fix. CI-Spuren stammen aus Läufen vor dem Fix. Lässt sich ein Befund nicht mehr nachstellen und trägt seine Spur die B-8-Signatur, steht als Ursache „B-8 (T2)“, ohne Teständerung. | angewandt (keine Spur von B-9, B-10, B-13, B-15 trug die B-8-Signatur) |
| D-08 | delivery.md: keine lange Kette (> 3 Tickets hintereinander). | **T4 läuft parallel** im eigenen Worktree, Dateien disjunkt, **ohne lokales Playwright**; T5 parallel in eigenem Worktree. Längste Kette T2 → T1 → T3 → T6. | angewandt |
| D-09 | M5-Bisektion mit vollen CI-Läufen kostet 25 Jobs je Probe; `workflow_dispatch` braucht die Workflow-Datei auf `main`. | T4 bisektiert auf **Wegwerf-Refs** `s041-m5-*`: ein Commit auf `origin/main`, dessen `ci.yml` nur einen Job hat (Matrix Kandidaten × Wiederholungen). Nie PR, nie gemergt, danach gelöscht. `timeout-minutes: 15` bleibt. | angewandt (fünf Runden, D-23) |
| D-10 | PR B hat weder den B-14-Fix noch die Testfixes; bei `workflow_dispatch` ist `zeittests` blockierend. | Die drei Läufe von B zeigen „Timing checks“ rot (B-14, in PR A behoben) und vielleicht die bekannten Wackler. Die Tabelle ordnet jeden roten Job seinem Befund zu, R-8 gilt. Optional ein Lauf auf `s041-a-und-b`. | angewandt (B-14 ist nicht behoben, also gilt für A und B dasselbe; `s041-a-und-b` nicht angelegt) |
| D-11 | Länger warten ist kein Fix. Ein `expect` (5 s) gegen `waitForResponse`/`waitForEvent` zu tauschen verlegt das Warten auf die Testzeit (120 s, unverändert). | Nur erlaubt, wenn das erwartete Ereignis die in der Spur genannte Ursache ist. Jede solche Änderung nennt hier ihr Ereignis und ihre Spur. | angewandt (D-18; B-10, B-13 ohne Fix) |
| D-12 | Sprache und Commits | Wie Spec 040 (D-11, D-12): Commits, PR-Texte und `specs/041-wacklige-tests/**` deutsch; Code, Kommentare und Fehlermeldungen englisch. Rote Commits enden auf „(rot)“, grüne auf „(grün)“, Doku-Commits beginnen mit „Spec 041:“. | angewandt |

### Entscheidungen aus dem Lauf (D-13 ff.)

| ID | Ticket | Frage | Wahl und Grund | Stand |
|---|---|---|---|---|
| D-13 | T2 | Die Implementierungs-Spec sagt „bei `pagehide` Intervall beenden und Abfrage abbrechen“. Gemessen (Protokoll im Test, nicht eingecheckt): WebKit und Firefox brechen die Ladevorgänge des alten Dokuments **zwischen `beforeunload` und `pagehide`** ab, bei `page.reload`, `location.reload`, `page.goto` und `location.href` gleich. Ein Abbruch erst bei `pagehide` kommt zu spät; der Test „Neuladen“ blieb damit in WebKit und Firefox 10 von 10 rot. | Die Seite bricht ihre laufende Abfrage schon bei **`beforeunload`** ab; das Intervall läuft weiter, falls die Seite bleibt (Download, abgebrochene Navigation; eigener Testfall). Bei `pagehide` endet zusätzlich das Intervall. Ein scheiternder Antwortkörper gilt wie eine gescheiterte Anfrage als „nichts Neues“ (`.catch` an `response.json()`), statt als ungefangener Fehler. Intervall 3000 ms, Wächter und sichtbares Verhalten unverändert. | angewandt |
| D-14 | T2 | Wie hält der Test eine Abfrage fest? | Ein kleiner Proxy im Test vor der Metiejo hält die erste `stato`-Antwort nach Kopf und erstem Byte fest (Muster `halten()` aus `wackler-040.spec.ts`) und sieht den Abbruch daran, dass die Verbindung vor der Antwort schließt. Eine Playwright-Route hält die Anfrage im Browser: dort meldete Chromium sie beim Neuladen nie als gescheitert und WebKit zeigte den Fehler nicht. Die Zahl der Abfragen zählt ein Init-Skript im Dokument selbst (`fetch` umhüllt), damit „keine davor“ ohne Warten auf die Uhr gilt. `pagehide`/`pageshow` mit `persisted` löst der Test selbst aus: Playwright hält in keiner Engine eine Seite im Back-Forward-Cache. | angewandt |
| D-15 | T1 | C-1 sagt: Setzt ein POST zurück, wickelt T1 ihn nicht und hält den Befund offen. Lokal sind 20 von 100 Bühne-Läufen an einem POST mit `read ECONNRESET` rot (B-12). | Die drei POSTs von `buehne-036.spec.ts` (`marke()`, `material()`, `festlegen` in 3.5) senden `connection: close`, damit der Request-Kontext keine ruhende Verbindung wiederverwendet, die die Metiejo gerade schließt (Playwrights `keepAlive`-Agent gegen die 5 s Ruhezeit des Node-Servers). Gemessen: `-g "3.5: a component\|3.2: the material" --repeat-each=50 --workers=10`, WebKit: 20 Resets in 100 ohne den Kopf, 0 in 100 mit ihm; bei `--workers=5` 0 in 60 ohne ihn. Keine Anfrage wird wiederholt; kein Warten, kein Zeitlimit, kein Retry ändert sich. C-1 bleibt GET-only, der GET in Zeile 324 bleibt gewickelt; keine Änderung an der Playwright-Konfiguration. Mit dem Architekten abgestimmt. | angewandt |
| D-16 | T1 | Welche Lesevorgänge von `metiejo-036-uebernahme.spec.ts` wickelt T1 (die Spec nennt `fetch` bei ~34, 53, 72)? | Keinen. Die Spuren (41941052854, 41943148273) zeigen den Reset am POST `…/materialo` (Zeile 53, Schritte im HTML-Bericht), nicht an einem GET; ein POST wird nicht wiederholt (C-1) und Node-`fetch` lässt `connection` als Kopf nicht zu. Der GET in Zeile 72 steht in keiner Spur, die Abfrage in Zeile 34 (`beforeAll`) wiederholt sich schon selbst. Die Erweiterung von `nachEinemReset` für `fetch` gilt damit für künftige Lesevorgänge; B-12 bleibt für die Übernahme offen, Empfehlung an den Maintainer: die Ruhezeit der Metiejo wie in `packages/mcp/src/http.ts` abstellen (Produkt, außerhalb von Spec 041). | angewandt |
| D-17 | T3 (B-8-Nachbesserung N-2) | Ab `beforeunload` soll kein Takt eine neue `stato`-Abfrage starten, bis die Seite wieder gezeigt wird; bleibt die Seite (abgebrochene Navigation), soll die Abfrage weiterlaufen. Kein Ereignis meldet eine abgebrochene Navigation, und ein Zeitfenster wäre ein neues Zeitlimit. | Die Seite merkt sich bei `beforeunload`, dass sie geht; jeder Takt kehrt dann sofort zurück, das Intervall (3000 ms) läuft unverändert weiter. Dass sie bleibt, zeigt die Person: die nächste Taste (`keydown`), der nächste Zeiger (`pointerdown`, beide in der Capture-Phase am Fenster) oder die Rückkehr ins Fenster (`focus` am Fenster); dazu `pageshow` mit `persisted`. Danach fragt der nächste Takt des laufenden Intervalls. Ein Klick, der navigiert, kommt vor `beforeunload` und hebt nichts auf. Die Metiejo hat keine Download-Links, eine abgebrochene Navigation ist also nur „Stopp“ der Person. Sichtbares Verhalten unverändert. Test: dritter Fall von `stato-041.spec.ts` (Taste `Shift` als Eingabe). | angewandt |
| D-18 | T3 | Worauf wartet Studio 3.4 nach der `stato`-Antwort mit neuer `rev` (D-11)? Playwrights `framenavigated` und `frame.waitForURL` fehlen in Firefox genau in den roten Läufen (B-9). | Auf den **Zustand des Rahmens**, gelesen aus der Assistentenseite (`iframe.contentDocument`: `readyState` „complete“ und Stylesheet `vorschau.css?rev=<neue rev>`), per `expect.poll` mit der Standardwartezeit (5 s). Das Ereignis aus der Spur ist das Laden des Dokuments der neuen `rev`; es kam lokal rund 2 s nach dem Setzen von `src`. Kein Warten wird länger, keines wandert auf die Testzeit. `vorschauGeladen()` in `wackler-040.ts` wartet auf `framenavigated` und ist in Firefox damit derselben Lücke ausgesetzt; ohne Spur unverändert (Hinweis an T6). | angewandt |
| D-19 | T5 (dort D-13) | Wie installiert der Treffer-Pfad die fehlenden Systempakete aus dem Cache? Im Fehlschlag-Lauf 42050500562 stellten alirebleco-eroj 3, werkstatt-1 und eroj 4 den Cache schon wieder her, aber `apt-get install --no-download` mit den gecachten `.deb`-Dateien scheiterte („Unable to fetch some archives“): bei gleicher Version wie in den Paketlisten des Images nimmt apt das Paket aus dem Repository, und `--no-download` verweigert den Download. | Der Treffer-Pfad liest den Bericht von `playwright install-deps --dry-run`, nimmt genau die dort genannten Pakete aus `~/.cache/playwright-apt` und installiert sie, nur wenn alle da sind, mit `sudo dpkg -i`; danach noch einmal `--dry-run`. Kein apt, kein Netz. Reicht der Cache nicht, eine `::warning` und `install-deps` vom Spiegel wie heute. Rot `debcf62a` → grün `b9cde42f`. | angewandt |
| D-20 | T5 (dort D-14) | Woraus besteht der Cache-Schlüssel? | Playwright-Version (aus dem installierten Paket, heute der Pin 1.63.0), `RUNNER_OS`, `RUNNER_ARCH`, `ImageOS`, `ImageVersion` und die Engines des Jobs. Das Image gehört dazu, weil die `.deb`-Dateien nur zu den Paketständen ihres Images passen; ein neues Runner-Image ist ein Fehlschlag und speichert neu. Größe: zusammen rund 1,16 GB Caches bei 10 GB Grenze je Repository. | angewandt |
| D-21 | T5 (dort D-15) | `SEGMENT_DOWNLOAD_TIMEOUT_MINS` setzen? | Nein, unverändert (nicht gesetzt). Kein `timeout-minutes`, keine Retries geändert; `workflow.test.ts` prüft, dass die Variable nicht vorkommt. | angewandt |
| D-22 | T5 (dort D-16) | Was bleibt von I-1? | Restrisiko: ein **Fehlschlag** lädt weiter vom Ubuntu-Spiegel – der erste Lauf nach einem Playwright-Update, nach einem neuen Runner-Image oder nach einer Verdrängung aus dem Cache, und der erste Lauf auf `main` nach dem Merge (Caches eines Branches sieht `main` nicht). Ein Treffer braucht den Spiegel nicht mehr (42053971357: 14/14 Treffer, 0 Spiegel-`Get:`). | angewandt |
| D-23 | T4 (dort a) | Die Bisektion findet keinen schuldigen Commit. | Fünf Runden, zwölf Stände, 87 Stichproben M5 allein in der CI. `d9cde4cc` war der einzige „schlecht“-Satz (51, 51, 0); die Wiederholung gab 0, 0, 0, also „gut“ nach Mehrheit (Regel T4 Schritt 4). Das Rot liegt am Runner (alle Werte ≥ 50 ms mit bekannter CPU auf AMD EPYC 7763, Tageszeit) mit einer schwachen Verschiebung ab Merge `070b347b` (#138). Kein spekulativer Fix, `M5_GRENZE_MS` bleibt 50; der Maintainer entscheidet (Randfall „Runner“ der Produkt-Spec). | angewandt |
| D-24 | T4 (dort b) | Wie misst die Bisektion M5? | Im Wegwerf-Workflow nur `pnpm exec playwright test --config playwright.vitrino.config.ts -g "M5: derivation" --reporter=list,junit`, ohne `FM_AUSGABE`, Chromium, je Kandidat gebaut. Dieser Harness stellt das 3-von-3-Rot von `main` nicht nach (`c66ed99f`: 1 von 6 > 50 ms): M5 allein ist leichter als im vollen Job `zeittests`. | angewandt |
| D-25 | T4 (dort c) | Woher kommt die Blockade je Änderung? | Wegwerf-Ref `s041-m5-diagnose` mit einem Wegwerf-Test, der einen CDP-Trace der Werkstatt in der CI aufnimmt (nie gemergt, gelöscht). Ergebnis: je Änderung eine Stil-Neuberechnung von etwa 4 700 Elementen (sichtbare Werkstatt samt Shadow DOM), 30–50 ms; Skripte keine. | angewandt |
| D-26 | T4 (dort d) | `930f1732` baut nicht (`id-orphaned … ids.lock.json`). | Übersprungen und notiert (Regel T4 Schritt 4). | angewandt |

## Befunde

| ID | Nachweis | Ursache | Fix (rot → grün) | Ticket | Stand |
|---|---|---|---|---|---|
| B-8 | **CI:** Lauf 41920898257 (PR B von Spec 040), Versuch 1, Job „Rendered Eroj“ Shard 3/4, Artefakt `testberichte-eroj-3-1`: `[webkit] › buehne-036.spec.ts:433` (Bühne 3.4), `expect(fehler).toEqual([])` erhielt „…/localhost:7334/api/marko/probomarko-kacheln/stato due to access control checks.“; Versuch 2, Shard 4/4, `testberichte-eroj-4-2`: `[webkit] › zweitfarbe-036.spec.ts:106`, „…/localhost:7352/api/marko/dukolora-44/stato due to access control checks.“ **Lokal** (Apple M1 Max, 10 Kerne, macOS 26.5.1), neue Spec rot vor dem Fix: `cd packages/eroj && FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=<engine> pnpm exec playwright test test/stato-041.spec.ts --repeat-each=10 --workers=4`, je Engine nacheinander: Chromium 10 bestanden / 20 rot (pagehide und beforeunload: „nicht abgebrochen“), Firefox 0 / 30 (Neuladen: „The operation was aborted.“ als Seitenfehler), WebKit 0 / 30 (Neuladen: „TypeError: Load failed“ als Seitenfehler). | Der 3-s-Abruf in `packages/metiejo/src/html.ts` wurde beim Verlassen der Seite nicht beendet. WebKit und Firefox brechen die Ladevorgänge des alten Dokuments zwischen `beforeunload` und `pagehide` ab; die Abfrage, die gerade lief, scheiterte dann im alten Dokument: unter Linux-WebKit als Konsolenfehler („due to access control checks“), lokal als ungefangener Fehler aus `response.json()` (D-13). Rest (N-2): Ein Takt des Intervalls zwischen `beforeunload` und `pagehide` startete eine neue Abfrage, die der Browser beim Dokumentwechsel ebenso abbrach (D-17). | `html.ts`: bei `beforeunload` bricht die Seite ihre laufende Abfrage selbst ab, bei `pagehide` zusätzlich Intervall beendet; `pageshow` mit `persisted` setzt genau einmal fort; ein scheiternder Körper ist „nichts Neues“. 3000 ms unverändert (`git diff origin/main -- packages/metiejo/src/html.ts \| grep -E '^[-+].*3000'` zeigt nur `}, 3000);` eingerückt, gleicher Wert). Rot `bd193cad`, `36a85b02` → grün `7e0ff9ec`. Grün lokal mit demselben Befehl: Chromium 30/30, Firefox 30/30, WebKit 30/30. **Nachbesserung N-2 (im Lauf von T3, D-17):** ab `beforeunload` startet kein Takt eine Abfrage, bis die Seite bleibt (nächste Taste, nächster Zeiger, Rückkehr ins Fenster, `pageshow` mit `persisted`); Intervall 3000 ms unverändert. Rot `24f2b273` (dritter Fall von `stato-041.spec.ts`: Takt nach `beforeunload` fragt, „Expected 1, Received 2“, `--repeat-each=3 --workers=3` je Engine 0/3) → grün `178ed2a9`: `stato-041.spec.ts --repeat-each=10 --workers=4` Chromium 30/30, Firefox 30/30, WebKit 30/30; `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=webkit pnpm exec playwright test test/buehne-036.spec.ts -g "3.5: a component" --repeat-each=150 --workers=10`: 150/150, 0 × „access control checks“ (vorher 5/300). Die übrigen Assistenten-, Bühne-, Studio- und Zweitfarbe-Specs grün in drei Engines (Eroj-Playwright 1911 bestanden, 1 rot = N-1). | T2 | erledigt (lokal); CI-Nachweis in den Läufen von T6 |
| B-9 | **CI:** Lauf 41920898257 (PR B von Spec 040), Versuch 2, Job „Rendered Eroj“ 3/4, Artefakt `testberichte-eroj-3-2`: `[firefox] › studio-035.spec.ts:250` (3.4) „Test timeout of 120000ms exceeded.“; die Schritte im HTML-Bericht enden im `toHaveAttribute` von Zeile 287 (Stylesheet im Rahmen), das nie endet, obwohl `src` schon `rev=2` trug (Zeile 283, 39 ms). Im Fehlerkontext zeigt der Schnappschuss beide `iframe` ohne Inhalt. Ebenso T5s Lauf 42053971357 (Branch `261105-spec-041-ci-browser-cache`), Eroj 3/4, `testberichte-eroj-3-1`. **Lokal** (Apple M1 Max, 10 Kerne, macOS 26.5.1, Stand `172b01f9` mit B-8-Fix und N-2), der bestehende Test: `cd packages/eroj && FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=firefox pnpm exec playwright test test/studio-035.spec.ts -g "3.4: a change in the Studio" --repeat-each=30 --workers=10`: 20 bestanden, **10 rot** – 7 × „Test timeout of 120000ms exceeded.“ (Bild von B-9), 3 × `vorschau.css?rev=1` statt `rev=2` (Bild von B-15). | Nicht die Metiejo und nicht B-8: Ein Zeitstrahl der Assistentenseite (nicht eingecheckt: `framenavigated`, Anfragen, `src` der Rahmen per MutationObserver, `load` der Rahmen in der Seite) zeigt in allen 10 roten Läufen, dass **beide** Rahmen das Dokument der neuen `rev` laden (Anfrage, Stylesheet `rev=2`, `load` in der Seite rund 2 s nach dem Setzen von `src`, innerhalb der 5 s), während **Playwright für keinen der beiden ein `framenavigated` meldet**; in den 20 grünen meldete es beide. Playwrights Rahmen blieb damit beim Dokument von `rev` 1: entweder antwortete er 5 s lang mit `rev=1` (B-15) oder gar nicht mehr, bis zur Testzeit (B-9). Die Seite setzt `src` je Rahmen genau einmal (kein doppeltes Setzen durch `refreshFrame()`), keine alte `stato`-Antwort setzt `rev` zurück (F-3 nicht gesehen), keine B-8-Signatur. Ursache also im Werkzeug: Playwrights Sicht auf die Rahmen in Firefox unter Last. | Testseitig, D-11 und D-18: 3.4 liest den Rahmen aus der Seite, die ihn hält (`contentDocument`, gleiche Herkunft), und wartet per `expect.poll` auf seinen **Zustand**: Dokument geladen (`readyState` „complete“) mit dem Stylesheet `vorschau.css?rev=<neue rev>`; danach `--fm-spacing-scale-400` = `18px` über `contentWindow.getComputedStyle`. Beide Erwartungen behalten die Standardwartezeit (5 s), nichts wartet länger als vorher, kein `framenavigated` nötig. Rot = der bestehende Test (Lauf oben) → grün `78ad9ae6`. **Grün lokal**, derselbe Befehl mit `--repeat-each=90` (3 × 30): Firefox **90/90**, Chromium 90/90, WebKit 90/90. Gegenprobe mit dem Zeitstrahl am neuen Test, Firefox `--repeat-each=30 --workers=10`: 30/30 grün, in allen 30 meldete Playwright kein `framenavigated` für `rev` 2 – der Test hängt nicht mehr daran. | T3 | erledigt (lokal); CI-Nachweis in den Läufen von T6 |
| B-10 | **CI:** Lauf 41931882770, Versuch 2, Job „Rendered Eroj“ 3/4, Artefakt `testberichte-eroj-3-2`: `[webkit] › buehne-036.spec.ts:296` (3.2 „the material's proposal …“), zweites `oeffne()` (Zeile 304): „Navigate“ 4310 ms, dann `toHaveAttribute("data-mt-bereit", "")` 5003 ms, „14 × locator resolved to `<div class="mt-buehne" data-mt-buehne="">` – unexpected value "null"“. Im Fehlerkontext (`error-context.md` im HTML-Bericht) zeigt der Schnappschuss von `[data-mt-buehne]` nur `text: HellDunkel Übernehmen Jetzt Mit dem Vorschlag` und zwei `iframe`, keine einzige Rolle; im gesunden Lauf (lokal) steht dort `radiogroup "Darstellung"`, `radio "Hell"`, `button "Übernehmen"`, `paragraph: Jetzt`. **Lokal nicht nachgestellt** (Apple M1 Max, 10 Kerne, macOS 26.5.1, WebKit, Stand mit B-8-Fix): `cd packages/eroj && FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=webkit pnpm exec playwright test test/buehne-036.spec.ts -g "3.5: a component\|3.2: the material" --repeat-each=50 --workers=10`: 77 bestanden, 23 rot, **kein** fehlendes `data-mt-bereit` (20 × B-12, 1 × N-2, 1 × Testzeit im zweiten `page.goto` von 3.5, das nie `load` erreichte, 1 × B-12 am GET); 3.5 allein `--repeat-each=30 --workers=8`: 29/30, das Rot ist N-2; mit Protokoll von `requestfailed`, `pageerror` und Navigationen (nicht eingecheckt) `--repeat-each=30 --workers=5`: 59/60 (N-2) und `--repeat-each=50 --workers=10` mit `connection: close`: 97/100 (3 × N-2); eine Provokation (zweites `goto`, sobald die alten Vorschauen die Eroj-Module der neuen `rev` laden): 20/20 grün, Eroj definiert, `data-mt-bereit` gesetzt; nach dem Fix von B-12 `--repeat-each=150 --workers=10`: 295/300, 5 × N-2. Zusammen 0 von 610 Läufen der beiden Tests mit dem Bild von B-10/B-13. | Gemeinsam mit B-13 (gleiche Signatur, beide im **zweiten** `oeffne()` derselben Adresse nach einem POST, der die `rev` ändert): Im zweiten Dokument liefen **beide** Modulskripte nicht – die Eroj sind nicht definiert (`/eroj/define.js` mit seinem Modulgraph) und `/metiejo.js` erreicht sein Ende nicht (`data-mt-bereit`, `packages/metiejo/src/buehne-klient.ts:197`). Das zweite Navigieren dauerte 4,0–4,3 s statt 0,26–0,45 s in den elf grünen WebKit-Läufen derselben Tests in den sechs Läufen (Werkzeug `/tmp/s041-tools-t1/oeffne.py`). **Warum** die Skripte nicht liefen, zeigt die Spur nicht: kein Trace, keine Seitenfehler im Bericht (der Test bricht vor `expect(fehler)` ab). Nicht B-8: keine B-8-Signatur in der Spur. Die Vermutung aus der Befund-Tabelle („Attribut wird nach der Prüfung gesetzt“) trifft nicht zu: das Attribut kam in 5 s nie, und die Eroj fehlten ebenso. Geprüft und lokal ohne Befund: ein Reset der Modul-Ladevorgänge wie bei B-12 und der Abbruch der Module der alten Vorschauen (Provokation unten). | keiner: Ein Dokument, dessen Client-Skript nicht läuft, bekommt `data-mt-bereit` nie; ein Warten auf ein Ereignis behebt das nicht, und die Ursache ist offen (D-11, Randfall der Produkt-Spec: kein spekulativer Fix). Vorschlag an den Maintainer: `trace: "retain-on-failure"` (oder ein Mitschnitt von `requestfailed` und `pageerror`) in der CI, damit das nächste Auftreten die Netzanfragen des zweiten Dokuments zeigt (Playwright-Konfiguration, nicht Teil von T1). | T1 | offen (Spur); in T6 erneut in der PR-CI von A, 42079224873 Versuch 1, `[webkit] › buehne-036.spec.ts:306` (3.2), zweites `oeffne()` „Navigate“ 3413 ms, `data-mt-bereit` 5005 ms – also auch mit B-8- und B-12-Fix |
| B-12 | **CI:** 41941052854, Eroj 3/4 (`testberichte-eroj-3-1`): `[webkit] › buehne-036.spec.ts:324`, `apiRequestContext.get: read ECONNRESET` (GET `…/stato`, 819 ms). Eroj 4/4 (`testberichte-eroj-4-1`): `[webkit] › metiejo-036-uebernahme.spec.ts` 4.1 und 4.2 `TypeError: fetch failed` `[cause]: Error: read ECONNRESET`; 41943148273 Versuch 1, Eroj 4/4 (`testberichte-eroj-4-1`): 4.2 ebenso. Die Schritte im eingebetteten HTML-Bericht zeigen in allen drei Übernahme-Fällen den Fehler direkt nach `waitForURL` (Zeile 51) und vor dem `expect` in Zeile 62: der Reset traf den **POST** `…/materialo` (Zeile 53), nicht den GET in Zeile 72. **Lokal** (M1 Max, WebKit): `-g "3.5: a component\|3.2: the material" --repeat-each=50 --workers=10`: 23 von 100 rot, davon 20 × `apiRequestContext.post: read ECONNRESET` (POST `festlegen` in 3.5, POST `materialo` in 3.2) und 1 × der GET in Zeile 324; bei `--workers=5` 0 von 60. Übernahme: `--repeat-each=30 --workers=5` 0 von 60 (nicht nachgestellt); bei `--workers=10` rot, aber durch N-3. **Unit:** drei neue Fälle in `wackler-040.test.ts` rot vor dem Fix (Reset von Node-`fetch` nicht erkannt). | Playwrights Request-Kontext hält seine Verbindung offen (`new http.Agent({ keepAlive: true })`, playwright-core 1.63); die Metiejo, ein Node-http-Server, schließt eine ruhende Keep-alive-Verbindung nach 5 s (Node-Standard). Eine Anfrage, die in diesem Moment auf der alten Verbindung geht, trifft eine geschlossene: `read ECONNRESET`. Beleg: derselbe lokale Lauf mit `connection: close` an den drei POSTs: 0 Resets in 100. Vorbild im Repo: `packages/mcp/src/http.ts` (Spec 006 K2) stellt die Ruhezeit seines Servers ab – ein Produkteingriff, in Spec 041 nicht erlaubt. Der Reset des Übernahme-POST in der CI ist damit nicht belegt (Node-`fetch` beachtet den Keep-alive-Hinweis des Servers, die Verbindung ruhte nur ~1,6 s); offen. | C-1: `nachEinemReset` (`wackler-040.ts`) erkennt jetzt auch den Reset von Node-`fetch` (`TypeError: fetch failed` mit `cause.code === "ECONNRESET"` oder „read ECONNRESET“ in der Ursache) und sendet **genau einmal** erneut; jeder andere Fehler und ein zweiter Reset gehen durch (fünf neue Unit-Fälle: einmal Reset, zweimal Reset, nur Ursachentext, Verbindung abgelehnt, anderer Socket-Fehler). Gewickelt ist nur der GET `buehne-036.spec.ts:324`. Die drei POSTs der Bühne-Spec (`marke()`, `material()`, `festlegen` in 3.5) senden `connection: close` (D-15): kein POST wird wiederholt, nichts wartet länger. Der POST der Übernahme (Zeile 53) bleibt ungewickelt (C-1, D-16). Unit: rot `0bede97b` → grün `8cb97cc0`. Bühne-POSTs: rot = der lokale Lauf oben (der bestehende Test) → grün `888ea97a`. **Grün lokal:** WebKit `-g "3.5: a component\|3.2: the material" --repeat-each=150 --workers=10` (3 × die 50 des roten Laufs): 295 bestanden, 5 rot, alle N-2, **0 Resets**; Chromium `--repeat-each=30 --workers=10`: 60/60; Firefox ebenso: 59/60, das Rot ist eine Testzeit in 3.2 ohne Schrittangabe (N-4). Unit `FM_GEBAUT=1 FM_AUSGABE=knapp pnpm exec vitest run test/wackler-040.test.ts`: 9/9. | T1 | Bühne behoben (lokal); Übernahme-POST offen (Spur, D-16) |
| B-13 | **CI:** Lauf 41971858056 (`main`, `c66ed99f`), Versuch 1, Job „Rendered Eroj“ 3/4, Artefakt `testberichte-eroj-3-1`: `[webkit] › buehne-036.spec.ts:515` (3.5), zweites `oeffne()` (Zeile 531) nach POST `festlegen` (3915 ms): „Navigate“ 4036 ms, dann `toHaveAttribute("data-mt-bereit", "")` 5004 ms, „14 × … unexpected value "null"“. Im Fehlerkontext (`error-context.md` im HTML-Bericht) zeigt der Schnappschuss von `[data-mt-buehne]` nur `text: HellDunkel Übernehmen Jetzt Mit dem Vorschlag` und zwei `iframe`, keine einzige Rolle; im gesunden Lauf (lokal) steht dort `radiogroup "Darstellung"`, `radio "Hell"`, `button "Übernehmen"`, `paragraph: Jetzt`. Die übrigen zwei `main`-Läufe von heute (41971724414, 41973572877) haben keinen Bühne-Befund. **Lokal nicht nachgestellt:** siehe B-10 (dieselben Läufe; 3.5 allein `--repeat-each=30 --workers=8`: 29 von 30 grün, das eine Rot ist N-2). | wie B-10, gemeinsame Signatur: im zweiten Dokument liefen weder `/eroj/define.js` noch `/metiejo.js`; warum, zeigt die Spur nicht. Lokal hat 3.5 zwei andere Rote, beide keine B-13: B-12 (POST `festlegen`) und N-2. | keiner (Ursache offen, kein Ereignis, auf das zu warten wäre; siehe B-10). Die lokalen Nebenbefunde: B-12 behoben (D-15), N-2 an T2/B-8 gemeldet. | T1 | offen (Spur) |
| B-14 | C-2 auf 41971724414 / 41971858056 / 41973572877 (c66ed99f): p90 51 / 53 / 55 ms, „Skripte längstens 0 / 0 / 30 ms“. Long Animation Frames > 50 ms: 21 / 27 / 32, Stil+Layout im Median 42 / 40 / 40,5 ms, Skripte keine. | Kein schuldiger Commit nach der Regel aus T4 Schritt 4: 5 Runden, 12 Stände, 87 Stichproben M5 allein in CI. Main selbst ist im Harness „gut“ (1 von 6 > 50 ms); derselbe Code war im PR-Lauf 41947115015 (01:14 UTC) grün mit p90 0 ms und um 05:00 UTC 3 von 3 rot. Schwache Verschiebung ab Merge 070b347b (#138): p90 ≥ 50 ms in 0 von 33 Stichproben davor, 11 von 39 ab dort; jeder Wert ≥ 50 mit bekannter CPU lief auf AMD EPYC 7763. Der Laufzeit-Diff ede4f801 → 070b347b ist klein (Tokens: core +21 Zeilen, komuna-0-2, komuna dark), ein Mechanismus ist nicht belegt. Diagnose per CDP-Trace in CI: je Änderung eine Stil-Neuberechnung von etwa 4 700 Elementen (sichtbare Werkstatt samt Shadow DOM) mit 30–50 ms. Flanken und übrige Sektionen sind schon durch content-visibility übersprungen; sie auszublenden ändert nichts. | keiner (D-23 bis D-26; Bisektionstabelle unter Messungen) | T4 | offen – Maintainer entscheidet (Randfall „Runner“), Grenze bleibt 50 |
| B-15 | **CI:** Lauf 41971724414 (`main`, `c66ed99f`), Versuch 1, Job „Rendered Eroj“ 3/4, Artefakt `testberichte-eroj-3-1`: `[firefox] › studio-035.spec.ts:250` (3.4), Zeile 287: `toHaveAttribute` 5004 ms, „Expected pattern: /rev=2$/ – Received string: "/marko/quarzwelle-abgleich/vorschau.css?rev=1"“, „2 × locator resolved to …rev=1“; `src` trug `rev=2` schon (Zeile 283, 27 ms). Ebenso 41931882770, Versuch 1, Eroj 3/4 (`testberichte-eroj-3-1`). **Lokal:** derselbe Lauf wie B-9, 3 von 30 mit genau diesem Bild. | wie B-9 (D-02: derselbe Test, dasselbe Ereignis; der Unterschied ist nur, ob Playwrights veralteter Rahmen noch antwortet). In Chromium und WebKit lokal kein Rot; Spec 040 B-2 hatte für WebKit nur auf die `stato`-Antwort gewartet, die Frame-Sicht von Playwright blieb. | wie B-9: derselbe Code in allen drei Engines (AC-4), grün `78ad9ae6`; Firefox 90/90, Chromium 90/90, WebKit 90/90. | T3 | erledigt (lokal); CI-Nachweis in den Läufen von T6 |
| I-1 | Sieben Abbrüche bei 15 min im Schritt „Playwright browsers“: 41920898257 Versuch 1 (alirebleco 1, Make Kit, cetero-3), 41931882770 Versuch 1 (werkstatt-2, alirebleco 2, eroj 4), 41936625983 Versuch 1 (eroj 1). Dazu langsame Schritte: 41931882770 Versuch 2 eroj 4 mit 8:51 im Schritt und danach Abbruch des Jobs; 41943148273 eroj 3 mit 14:20 und Abbruch (Job 126968822089: „Need to get 114 MB of archives“, „Fetched 114 MB in 13min 37s (140 kB/s)“, 181 Pakete, `Get:… http://azure.archive.ubuntu.com/ubuntu noble/…`). Nachgestellt in 42050500562 (Fehlschlag-Lauf): eroj 1, eroj 3 und alirebleco 2 bleiben nach `Get:20`–`Get:31` hängen, Abbruch 15:15:49. | `--with-deps` lädt 114 MB (3 Engines, 181 Pakete) bzw. 21 MB (Chromium, 9 Pakete) vom Ubuntu-Spiegel; apt-get update dauert ~1 s, langsam ist der Paket-Download. Ein Cache nur der Browser (Spec 040, 27debafb/7953106d) hilft nicht (D-06). | Browser und die .deb-Dateien von `--with-deps` im Actions-Cache. Schlüssel: Playwright-Version + Runner-OS/-Arch/ImageOS/ImageVersion + Engines; Restore und Save getrennt; Fehlschlag wie heute; Treffer: `install-deps --dry-run`, nur die gemeldeten Pakete per `dpkg -i` aus dem Cache, kein apt, kein Netz. rot 8d84c30c → grün b3c130b9; Treffer-Pfad: rot debcf62a → grün b9cde42f (D-19 bis D-21). | T5 | behoben bei Treffer (42053971357: 14/14 Treffer, 0 Spiegel-`Get:`); bei Fehlschlag bleibt der Spiegel (D-22) |
| N-1 (neu, T2) | Lokal (Apple M1 Max, macOS 26.5.1) in WebKit rot: `achsen-2b2.spec.ts:82` „a read-only checkbox › is focusable …“, `toBeFocused()` nach `Tab` erhält „inactive“; `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=webkit pnpm exec playwright test test/achsen-2b2.spec.ts -g "a read-only checkbox" --repeat-each=10 --workers=4`: 0 bestanden, 10 rot. In der CI (Linux-WebKit) bisher nicht rot. | vermutlich macOS-WebKit: `Tab` fokussiert ohne die Systemeinstellung „Tastaturnavigation“ keine Schaltflächen; nicht untersucht | keiner (außerhalb von Spec 041; kein Bezug zur Metiejo) | – | offen: nur lokal |
| N-2 (neu, T1) | **Lokal**, Stand mit B-8-Fix (`7e0ff9ec`), WebKit: `buehne-036.spec.ts:515` (3.5) `expect(fehler).toEqual([])` erhält „…/localhost:733x/api/marko/probomarko-pruefung/stato due to access control checks.“ (als Seitenfehler). Zählung: 3.5 allein `--repeat-each=30 --workers=8`: 1/30; `-g "3.5: a component\|3.2: the material" --repeat-each=50 --workers=10`: 1/100; mit Protokoll `--repeat-each=30 --workers=5`: 1/60; `--repeat-each=150 --workers=10`: 5/300. Immer 3.5, nie 3.2 (3.2 prüft `fehler` nicht). Protokoll (requestfailed, pageerror, Navigation; nicht eingecheckt): der Fehler kommt 3,0 s nach dem `load` der ersten Seite (erster Takt des Abrufs) und 14 ms vor dem Wechsel auf das Dokument des zweiten `oeffne()`. | Bestätigt durch den roten Fall in `stato-041.spec.ts` (`24f2b273`) und das Ausbleiben nach dem Fix: Der Takt des Intervalls fällt zwischen `beforeunload` (bricht nur die **laufende** Anfrage ab) und `pagehide` (beendet erst dort das Intervall, D-13); die Anfrage dieses Takts startet nach dem Abbruch und wird beim Dokumentwechsel von WebKit abgebrochen – der B-8-Fehler, nur später. Je langsamer die Navigation (CI: 4 s), desto größer das Fenster. | Behoben als Teil von B-8 (Zeile B-8, D-17): `html.ts` startet ab `beforeunload` keinen Abruf mehr, bis die Seite bleibt. Rot `24f2b273` → grün `178ed2a9`. Grün: WebKit 3.5 `--repeat-each=150 --workers=10` 150/150, 0 × der Fehler. Kein Testumweg. | T2 (Nachbesserung im Lauf von T3) | erledigt (lokal); CI-Nachweis in den Läufen von T6 |
| N-3 (neu, T1) | **Lokal**, WebKit: `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=webkit pnpm exec playwright test test/metiejo-036-uebernahme.spec.ts --repeat-each=30 --workers=10`: 21 bestanden, 39 rot (30 × `fetch failed` `read ECONNRESET`, 7 × `page.goto: Could not connect to the server.`, 2 × Testzeit); mit `--workers=5` 0 von 60. Protokoll der Server (stderr, nicht eingecheckt) bei `--repeat-each=15 --workers=10`: 7 × „listen EADDRINUSE“ (Worker 9 und 18 auf 7341, 10 auf 7342, …). | Das Portschema der Übernahme-Spec (`7341 + workerIndex % 9`) prüft nicht, ob der eigene Server lauscht: ab Worker 9 (auch durch Neustarts nach roten Tests) teilen sich zwei Worker einen Port, der zweite spricht mit dem Server des ersten, und dessen `afterAll` beendet ihn mitten in einer Anfrage. In den CI-Spuren von B-12 liefen 4.1/4.2 auf Worker 0 und 1, also nicht dadurch. | keiner (Nebenbefund, nicht Teil des Laufs). Vorschlag: `start()` wie in `buehne-036.spec.ts` (auf die URL des eigenen Kindprozesses warten, sonst nächster Port). | – | offen |
| N-4 (neu, T1) | **Lokal**, Firefox, Stand `888ea97a`: `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=firefox pnpm exec playwright test test/buehne-036.spec.ts -g "3.5: a component\|3.2: the material" --repeat-each=30 --workers=10`: 59/60, das Rot ist `buehne-036.spec.ts:306` (3.2 „the material's proposal …“, Wiederholung 5) mit „Test timeout of 120000ms exceeded.“ ohne Schritt im Bericht. Einmal sah WebKit Ähnliches in 3.5: das zweite `page.goto` erreichte nie `load` (1/100, roter Lauf von B-10/B-13). | nicht untersucht (kein Trace; ein Wiederholen zeigte es nicht) | keiner | – | offen: nur lokal |
| N-5 (neu, T6) | **Lokal** (Apple M1 Max, macOS 26.5.1), Stand `008bef5a`, einmalige Prüfung von T6: `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm turbo run test --output-logs=errors-only --concurrency=1 --continue --filter=@fundamento/eroj`: 1910 bestanden, 2 rot – N-1 und `buehne-036.spec.ts:178` › 3.1 „light and dark are switchable on the stage“ [firefox], `locator.evaluate: Execution context was destroyed, most likely because of a navigation` in `grund()` (Zeile 192, `const hell = await grund();`). In keinem CI-Lauf von T6 rot. | vermutet, nicht belegt: Die Assistentenseite setzt beim Laden `src` des Rahmens neu (`if (frame) refreshFrame();`, `html.ts`, schon auf `main`). Ein `expect.poll` kann „light“ noch im ersten Dokument sehen, und das direkte `grund()` danach trifft den Wechsel. Kein Bezug zu B-8 (die Zeile ist unverändert). | keiner (nach der Messung gefunden; nicht Teil von Spec 041) | – | offen: nur lokal, 1 von 1 |
| N-6 (neu, T6, R-8) | **CI:** PR-B-Messlauf 42080252255, Versuch 2 (R-8-Neustart nach B-15 und B-12 in Versuch 1), „Rendered Eroj“ 3/4: `[webkit] › buehne-036.spec.ts:515` (3.5), Zeile 565 `expect(fehler).toEqual([])` erhielt „TypeError: Load failed“. | Die Signatur von B-8 (D-07): Seitenfehler „TypeError: Load failed“ im alten Dokument nach einer Navigation. Branch B hat den B-8-Fix nicht (D-10). Nach R-8 zählt das zweite Rot trotzdem als eigener Befund; es gab keinen weiteren Neustart. | keiner in B; der Fix liegt in PR A (B-8, `html.ts`) | – | Branch B: erwartet (D-10); nach dem Merge von A erledigt |

## Messungen

### PR A (workflow_dispatch)

Branch `261105-spec-041-flaky-tests-stabilisi-ae940d`, Kopf `008bef5a` in allen drei Läufen. Die Läufe liefen nacheinander, drei Engines, 25 Jobs je Lauf. Branch A hat den Browser-Cache aus PR B **nicht**, deshalb trifft ihn I-1 weiter.

| Lauf | Versuch 1 | R-8 | Versuch 2 | Ergebnis | „Timing checks“ |
|---|---|---|---|---|---|
| [42079221475](https://github.com/thojank/fundamento/actions/runs/42079221475) | 20 grün, 5 abgebrochen, **alle I-1:** Alirebleco 1/3 und 3/3, Eroj 1/4 und 2/4 stecken 15 min in „Playwright browsers“; Vitrino cetero-3 braucht dort 8:43 und wird in „Check: Vitrino“ an der Jobgrenze abgebrochen | ein Neustart `--failed` (alle roten Jobs I-1) | die 5 Jobs grün | **grün** (25/25) | grün |
| [42085495161](https://github.com/thojank/fundamento/actions/runs/42085495161) | 25/25 grün; „Playwright browsers“ 15–95 s | – | – | **grün** im ersten Versuch | grün |
| [42087222996](https://github.com/thojank/fundamento/actions/runs/42087222996) | 24 grün, 1 abgebrochen, **I-1:** Vitrino cetero-1 braucht 659 s in „Playwright browsers“ und wird in „Check: Vitrino“ an der Jobgrenze abgebrochen | ein Neustart `--failed` (I-1) | grün | **grün** (25/25) | grün |

Kein Testfehler in den drei Läufen auf A. B-8, B-9, B-15 und B-12 (Bühne) waren nirgends rot; B-10, B-13 und B-12 (Übernahme) traten in diesen Läufen nicht auf. Dauer je Job (`node scripts/ci/messung.mjs 42079221475 42085495161 42087222996`; zeigt den jeweils letzten Versuch):

| Job | 42079221475 | 42085495161 | 42087222996 | Median | Spannweite |
|---|---|---|---|---|---|
| Affected packages (betroffen) | 0:21 | 0:21 | 0:24 | 0:21 | 0:21–0:24 |
| Build, lint and Modelo checks | 1:56 | 1:48 | 1:45 | 1:48 | 1:45–1:56 |
| Rendered Eroj (Playwright, shard 1 of 4) | 4:43 | 6:37 | 6:14 | 6:14 | 4:43–6:37 |
| Rendered Eroj (Playwright, shard 2 of 4) | 9:21 | 8:35 | 6:44 | 8:35 | 6:44–9:21 |
| Rendered Eroj (Playwright, shard 3 of 4) | 11:00 | 7:27 | 6:50 | 7:27 | 6:50–11:00 |
| Rendered Eroj (Playwright, shard 4 of 4) | 8:40 | 8:09 | 8:09 | 8:09 | 8:09–8:40 |
| Rendered accessibility (Alirebleco of the Eroj, shard 1 of 3) | 6:07 | 6:49 | 6:04 | 6:07 | 6:04–6:49 |
| Rendered accessibility (Alirebleco of the Eroj, shard 2 of 3) | 9:30 | 9:27 | 9:40 | 9:30 | 9:27–9:40 |
| Rendered accessibility (Alirebleco of the Eroj, shard 3 of 3) | 8:18 | 6:00 | 8:32 | 8:18 | 6:00–8:32 |
| Rendered checks (Make Kit, Quickstart) | 3:12 | 2:12 | 3:54 | 3:12 | 2:12–3:54 |
| Rendered checks (Vitrino, part cetero-1) | 9:30 | 7:44 | 5:15 | 7:44 | 5:15–9:30 |
| Rendered checks (Vitrino, part cetero-2) | 6:12 | 5:23 | 5:38 | 5:38 | 5:23–6:12 |
| Rendered checks (Vitrino, part cetero-3) | 8:04 | 7:51 | 6:58 | 7:51 | 6:58–8:04 |
| Rendered checks (Vitrino-Werkstatt, part werkstatt-1) | 7:52 | 7:29 | 6:18 | 7:29 | 6:18–7:52 |
| Rendered checks (Vitrino-Werkstatt, part werkstatt-2) | 4:08 | 3:32 | 3:46 | 3:46 | 3:32–4:08 |
| Timing checks (M5, Gegenprobe, Ableitung, G5) | 4:23 | 4:55 | 7:32 | 4:55 | 4:23–7:32 |
| Unit tests (Projekcioj, shard 1 of 2) | 8:26 | 8:28 | 6:58 | 8:26 | 6:58–8:28 |
| Unit tests (Projekcioj, shard 2 of 2) | 7:13 | 6:53 | 5:26 | 6:53 | 5:26–7:13 |
| Unit tests (agordilo) | 1:25 | 1:42 | 1:27 | 1:27 | 1:25–1:42 |
| Unit tests (cli) | 2:31 | 1:48 | 2:16 | 2:16 | 1:48–2:31 |
| Unit tests (ekranoj) | 0:48 | 0:41 | 1:07 | 0:48 | 0:41–1:07 |
| Unit tests (mcp) | 2:35 | 2:28 | 3:09 | 2:35 | 2:28–3:09 |
| Unit tests (metiejo) | 7:59 | 4:44 | 6:06 | 6:06 | 4:44–7:59 |
| Unit tests (modelo) | 5:48 | 3:39 | 3:24 | 3:39 | 3:24–5:48 |
| Unit tests (nordstelo) | 1:02 | 0:48 | 0:45 | 0:48 | 0:45–1:02 |
| **Lauf gesamt** (erster Start bis letztes Ende) | 38:01 | 9:51 | 25:10 | 25:10 | 9:51–38:01 |
| **Jobzeit Summe** | 141:04 | 125:30 | 124:21 | 125:30 | 124:21–141:04 |

**`pull_request`-CI von PR A (#148):**
- Lauf [42079224873](https://github.com/thojank/fundamento/actions/runs/42079224873) auf `008bef5a`, Versuch 1: Eroj 3/4 rot an `[webkit] › buehne-036.spec.ts:306` (3.2).
  - Das zweite `oeffne()` (Zeile 314) brauchte für „Navigate“ 3413 ms, danach kam `toHaveAttribute("data-mt-bereit")` mit 5005 ms und „unexpected value null“.
  - Das ist **B-10**, mit B-8- und B-12-Fix. Damit ist belegt, dass B-10 nicht von B-8 kommt.
  - Artefakt `testberichte-eroj-3-1`.
- Ein R-8-Neustart → **grün** (26 Checks bestanden).
- „Timing checks“ grün, p90 0 ms.
- Lauf [42092076645](https://github.com/thojank/fundamento/actions/runs/42092076645) auf `840cba19` (Doku-Commit „Messung und Bericht“, 19:15 UTC), Versuch 1, zwei Jobs nicht grün:
  - „Rendered checks (Make Kit, Quickstart)“: 15 min in „Playwright browsers“ abgebrochen = **I-1**.
  - „Timing checks“ **rot**: M5 p90 **53 ms**, längste 71 ms, Skripte 0 ms = **B-14**. Auf `pull_request` blockiert der Job nicht.
  - Ein R-8-Neustart → **grün**: M5 p90 0 ms, längste 85 ms. PR #148 danach `CLEAN`.

### PR B (workflow_dispatch)

Branch `261105-spec-041-ci-browser-cache`, Kopf `b9cde42f`. Der Branch hat die Testfixes und den B-8-Fix aus PR A **nicht** (D-10).

| Lauf | Versuch 1 | R-8 | Versuch 2 | Ergebnis | Browser-Cache (`/tmp/s041-tools/auswerten.sh`) |
|---|---|---|---|---|---|
| [42076935265](https://github.com/thojank/fundamento/actions/runs/42076935265) | 25/25 grün | – | – | **grün** | 14/14 Treffer, Schritt 8–26 s, 0 Spiegel-`Get:` |
| [42080252255](https://github.com/thojank/fundamento/actions/runs/42080252255) | Eroj 3/4 rot: `[firefox] › studio-035.spec.ts:250` (3.4, `rev=1`) = **B-15**; `[webkit] › buehne-036.spec.ts:515` (3.5), `apiRequestContext.post: read ECONNRESET` am POST `festlegen` = **B-12**. Beide sind in A behoben. | ein Neustart `--failed` | Eroj 3/4 **wieder rot:** `[webkit] › buehne-036.spec.ts:515` (3.5), Zeile 565 `expect(fehler)` erhielt „TypeError: Load failed“ = B-8-Signatur → **N-6**, kein weiterer Neustart | **rot** | 14/14 Treffer, Schritt 8–36 s, 0 Spiegel-`Get:` |
| [42086157431](https://github.com/thojank/fundamento/actions/runs/42086157431) | Eroj 4/4 rot: `[webkit] › metiejo-036-uebernahme.spec.ts` 4.1 und 4.2, `TypeError: fetch failed` mit `ECONNRESET` = **B-12** (Übernahme-POST, offen) | ein Neustart `--failed` | grün | **grün** (25/25) | 14/14 Treffer, Schritt 9–39 s, 0 Spiegel-`Get:` |

Dauer je Job (`node scripts/ci/messung.mjs 42076935265 42080252255 42086157431`):

| Job | 42076935265 | 42080252255 | 42086157431 | Median | Spannweite |
|---|---|---|---|---|---|
| Affected packages (betroffen) | 0:24 | 0:26 | 0:18 | 0:24 | 0:18–0:26 |
| Build, lint and Modelo checks | 1:35 | 1:15 | 1:26 | 1:26 | 1:15–1:35 |
| Rendered Eroj (Playwright, shard 1 of 4) | 5:59 | 5:55 | 3:55 | 5:55 | 3:55–5:59 |
| Rendered Eroj (Playwright, shard 2 of 4) | 7:54 | 7:06 | 7:11 | 7:11 | 7:06–7:54 |
| Rendered Eroj (Playwright, shard 3 of 4) | 6:30 | 8:18 | 8:01 | 8:01 | 6:30–8:18 |
| Rendered Eroj (Playwright, shard 4 of 4) | 7:04 | 4:54 | 7:24 | 7:04 | 4:54–7:24 |
| Rendered accessibility (Alirebleco of the Eroj, shard 1 of 3) | 5:42 | 5:37 | 5:39 | 5:39 | 5:37–5:42 |
| Rendered accessibility (Alirebleco of the Eroj, shard 2 of 3) | 9:33 | 9:29 | 9:35 | 9:33 | 9:29–9:35 |
| Rendered accessibility (Alirebleco of the Eroj, shard 3 of 3) | 8:00 | 7:31 | 6:17 | 7:31 | 6:17–8:00 |
| Rendered checks (Make Kit, Quickstart) | 2:17 | 2:11 | 2:00 | 2:11 | 2:00–2:17 |
| Rendered checks (Vitrino, part cetero-1) | 8:41 | 9:01 | 8:58 | 8:58 | 8:41–9:01 |
| Rendered checks (Vitrino, part cetero-2) | 5:28 | 7:09 | 5:39 | 5:39 | 5:28–7:09 |
| Rendered checks (Vitrino, part cetero-3) | 6:22 | 7:52 | 7:38 | 7:38 | 6:22–7:52 |
| Rendered checks (Vitrino-Werkstatt, part werkstatt-1) | 5:10 | 5:57 | 6:09 | 5:57 | 5:10–6:09 |
| Rendered checks (Vitrino-Werkstatt, part werkstatt-2) | 3:59 | 2:47 | 3:34 | 3:34 | 2:47–3:59 |
| Timing checks (M5, Gegenprobe, Ableitung, G5) | 5:09 | 4:18 | 5:00 | 5:00 | 4:18–5:09 |
| Unit tests (Projekcioj, shard 1 of 2) | 8:22 | 6:45 | 9:15 | 8:22 | 6:45–9:15 |
| Unit tests (Projekcioj, shard 2 of 2) | 6:28 | 7:07 | 5:32 | 6:28 | 5:32–7:07 |
| Unit tests (agordilo) | 2:13 | 2:12 | 1:42 | 2:12 | 1:42–2:13 |
| Unit tests (cli) | 2:15 | 1:19 | 1:32 | 1:32 | 1:19–2:15 |
| Unit tests (ekranoj) | 0:49 | 0:40 | 0:37 | 0:40 | 0:37–0:49 |
| Unit tests (mcp) | 2:59 | 2:35 | 3:06 | 2:59 | 2:35–3:06 |
| Unit tests (metiejo) | 7:28 | 7:21 | 7:28 | 7:28 | 7:21–7:28 |
| Unit tests (modelo) | 5:45 | 4:30 | 5:43 | 5:43 | 4:30–5:45 |
| Unit tests (nordstelo) | 0:43 | 0:53 | 0:41 | 0:43 | 0:41–0:53 |
| **Lauf gesamt** (erster Start bis letztes Ende) | 18:46 | 34:06 | 23:14 | 23:14 | 18:46–34:06 |
| **Jobzeit Summe** | 126:49 | 123:08 | 124:20 | 124:20 | 123:08–126:49 |

**`pull_request`-CI von PR B (#147):**
- Lauf [42076893161](https://github.com/thojank/fundamento/actions/runs/42076893161) auf `b9cde42f`: **grün** im ersten Versuch. „Timing checks“ grün, p90 **50 ms**, also genau an der Grenze.
- Browser-Cache: 12 Fehlschläge und 2 Treffer.
  - Ein `pull_request`-Lauf sieht nur Caches von `main` und von seiner eigenen Merge-Ref, nicht die des Branches. Deshalb ging es beim ersten PR-Lauf zum Spiegel.
  - Drei Jobs brauchten in „Playwright browsers“ 382–504 s („Fetched 21.1 MB in 8min 4s“), blieben aber unter der Jobgrenze.
  - Das ist das Restrisiko aus D-22. Es endet, wenn `main` nach dem Merge den Cache gefüllt hat.

### M5 p90

Gelesen mit C-2 (`testberichte-zeittests-x-<Versuch>`; „Timing checks“ lief in keinem Lauf ein zweites Mal).

| Branch | Lauf | „Timing checks“ | M5 Urteil (chromium) |
|---|---|---|---|
| A | 42079221475 | grün | Skripte längstens 0 ms; p90 **0 ms**, längste 68 ms |
| A | 42085495161 | grün | Skripte längstens 5 ms; p90 **0 ms**, längste 56 ms |
| A | 42087222996 | grün | Skripte längstens 0 ms; p90 **0 ms**, längste 70 ms |
| A (PR-CI) | 42079224873 | grün | Skripte längstens 0 ms; p90 0 ms, längste 51 ms |
| A (PR-CI, Doku-Kopf) | 42092076645 Versuch 1 | **rot** (B-14) | Skripte längstens 0 ms; p90 **53 ms**, längste 71 ms |
| A (PR-CI, Doku-Kopf) | 42092076645 Versuch 2 | grün | Skripte längstens 0 ms; p90 0 ms, längste 85 ms |
| B | 42076935265 | grün | Skripte längstens 0 ms; p90 0 ms, längste 54 ms |
| B | 42080252255 | grün | Skripte längstens 0 ms; p90 0 ms, längste 87 ms |
| B | 42086157431 | grün | Skripte längstens 0 ms; p90 0 ms, längste 62 ms |
| B (PR-CI) | 42076893161 | grün | Skripte längstens 0 ms; p90 **50 ms**, längste 94 ms |

Die sechs Messläufe und die ersten PR-Läufe sind grün, auch auf B, das keinen B-14-Fix hat, und das auf demselben Werkstatt-Code wie die drei roten `main`-Läufe vom Morgen (p90 51/53/55 ms). Ein PR-Lauf von A um 19:15 UTC war mit p90 53 ms wieder rot, sein Neustart Minuten später grün mit 0 ms. Das stützt den Befund von T4: Das Rot hängt am Runner und an der Tageszeit, nicht an einem Commit. **Die grünen Läufe sind kein Nachweis eines Fixes**, B-14 bleibt offen.

### T5-Prüfläufe (I-1; zählen nicht als die drei Läufe von AC-9)

Branch `261105-spec-041-ci-browser-cache`, `workflow_dispatch`, ausgewertet mit `/tmp/s041-tools/auswerten.sh <Lauf> [Versuch]` (Restore-Ergebnis, Dauer des Schritts „Playwright browsers“, Zahl der Spiegel-`Get:`-Zeilen im Schritt).

| Lauf | Kopf | Fall | Ergebnis je Job (Treffer/Fehlschlag, Dauer „Playwright browsers“) | Spiegel-`Get:` bei Treffer | Rot |
|---|---|---|---|---|---|
| 42050500562 | `b3c130b9` | Fehlschlag, speichert | eroj 1/4 Fehlschlag 898 s abgebrochen; eroj 2/4 Fehlschlag 44 s; eroj 3/4 Fehlschlag 894 s abgebrochen; eroj 4/4 Treffer → Rückfall 30 s; alirebleco 1/3 Fehlschlag 38 s; alirebleco 2/3 Fehlschlag 903 s abgebrochen; alirebleco 3/3 Treffer → Rückfall 75 s; rendered-checks Fehlschlag 47 s; werkstatt-1 Treffer → Rückfall 16 s; werkstatt-2 Fehlschlag 22 s; vitrino cetero-1/2/3 Fehlschlag 19–20 s; zeittests Fehlschlag 22 s | – (Rückfall wegen `--no-download`, D-19) | Lauf abgebrochen durch I-1 selbst (drei Fehlschläge am Spiegel); „Timing checks“ grün |
| 42053971357 | `b9cde42f` | Treffer | alle 14 Jobs Treffer, Schritt 9–56 s, kein Browser-Download, kein Rückfall | 0 | nur eroj 3/4 `studio-035.spec.ts:250` › 3.4 [firefox] = B-9/B-15 (in PR A behoben, T3); „Timing checks“ grün; kein R-8-Neustart |

### T4-Bisektion (B-14)

Wegwerf-Refs `s041-m5-runde-1` … `-5` (D-09, D-24): M5 allein, je Stand drei Stichproben, wo nötig wiederholt. „gut“ = alle drei p90 ≤ 50 ms, „schlecht“ = mindestens zwei > 50 ms. Läufe: 42053328929, 42055567098, 42057595416, 42049632141, 42053589576 (42049508109: ungültiges YAML, keine Jobs).

| Stand | p90 (ms) je Stichprobe | Urteil |
|---|---|---|
| `04b68b79`, `58713a41`, `f2b5a058`, `4bc29d02`, `31d13d65`, `42c69b95`, `ede4f801`, `f42a04cc` | alle 0 | gut |
| `930f1732` | baut nicht (D-26) | übersprungen |
| `070b347b` (#138) | 0, 0, 0, 50, 0, 0 / 52, 50, 0, 50, 0, 0 | gut |
| `a55071b8` (#137) | 0, 0, 50 / 0, 0, 50 | gut |
| `d9cde4cc` (#143) | 51, 51, 0 / Wiederholung 0, 0, 0 | gut nach Mehrheit (D-23) |
| `2e39fb29` (#132) | 50, 0, 0 | gut |
| `c66ed99f` (`main`, Basis) | 0, 50, 0 / 0, 0, 55 | gut |

## Diff-Suche (AC-3)

Befehl wie in der Implementierungs-Spec (T6 Schritt 7), mit den echten Branches, nach `git fetch origin` am 2026-11-05 um 19:30 Ortszeit. Stände: A `008bef5a`, B `b9cde42f`, Basis `origin/main` `c66ed99f`:

```sh
git -C $A fetch origin
for r in origin/main...origin/261105-spec-041-flaky-tests-stabilisi-ae940d origin/main...origin/261105-spec-041-ci-browser-cache; do
  echo "== $r"
  git -C $A diff "$r" -U0 -- . ':(exclude)specs/**' \
    | grep -niE '^[-+].*(timeout|retries|waitForTimeout|interval|Intervall|setInterval|setTimeout|3000|3_000|GRENZE|threshold|Schwelle|toleran|budget|_MS\b|maxDiff|PERZENTIL)'
done
git -C $A diff origin/main...origin/261105-spec-041-flaky-tests-stabilisi-ae940d -U0 -- . ':(exclude)specs/**' | grep -cE '^\+.*waitForTimeout'   # 0
git -C $A grep -n "export const M5_GRENZE_MS = 50;" origin/261105-spec-041-flaky-tests-stabilisi-ae940d -- packages/eroj/test/m5.ts   # m5.ts:20
git -C $A grep -n "}, 3000);" origin/261105-spec-041-flaky-tests-stabilisi-ae940d -- packages/metiejo/src/html.ts                     # html.ts:735
```

**Ausgabe in Kurzform:**
- A hat 42 Treffer, B einen. Die Zahl hinter `-n` ist die Zeile im Diff; die Tabelle nennt die Zeile in der Datei.
- `waitForTimeout` neu: **0**.
- `M5_GRENZE_MS = 50` gefunden: `packages/eroj/test/m5.ts:20`.
- `}, 3000);` gefunden: `packages/metiejo/src/html.ts:735`.

| Datei | Zeile(n) im neuen Stand | Treffer | Urteil |
|---|---|---|---|
| `packages/metiejo/src/html.ts` | −704/−715 → 722/735 | `setInterval(async () => {` … `}, 3000);` | **unverändert:** derselbe Wert 3000, nur eingerückt (Intervall jetzt in `poll` gehalten) |
| `packages/metiejo/src/html.ts` | 747 | `clearInterval(poll);` | **beendet** ein Intervall (B-8, `pagehide`), setzt keinen Wert |
| `packages/metiejo/src/html.ts` | 706, 708 | Kommentar („longer than an interval“, „the interval stops“) | Kommentar |
| `packages/eroj/test/stato-041.spec.ts` | 37 | `const INTERVALL_MS = 3000;` | **gelesen, nicht gesetzt:** der Wert der Metiejo, gegen den der Test mit `page.clock` (falsche Zeit) zählt |
| `packages/eroj/test/stato-041.spec.ts` | 233, 244, 246, 247, 259, 269, 275, 277, 283, 302, 307, 308, 312, 314 | `nach(page, INTERVALL_MS …)` | **falsche Uhr**, keine Wanduhr: `page.clock` rückt die Zeit vor, nichts wartet |
| `packages/eroj/test/stato-041.spec.ts` | 6, 36, 223, 232, 242, 271, 293, 295, 297 | Kommentar, Testname | Kommentar bzw. Testname |
| `packages/eroj/test/studio-035.spec.ts` | 113 | Kommentar („until the test timeout“, CI 41931882770) | Kommentar |
| `packages/eroj/test/m5-041.test.ts` | 4, 8, 12 | `M5_GRENZE_MS`, `M5_PERZENTIL` | **Pin:** 50 und 0,9 unverändert (neuer Test) |
| `packages/metiejo/src/stato-041.test.ts` | 2, 6, 7, 8, 11, 12, 14 | `setInterval`, `3000` | **Pin:** genau ein Intervall, 3000 ms (neuer Test) |
| `packages/modelo/src/ci/workflow.test.ts` (B) | 1075 | `not.toContain("SEGMENT_DOWNLOAD_TIMEOUT_MINS")` | **Verbot:** die Variable kommt nicht vor (D-21) |

**Urteil:** Kein Zeitlimit, kein `timeout-minutes`, kein `retries`, kein `waitForTimeout`, keine Schwelle, keine Toleranz und kein Abfrageintervall ist neu oder höher. `M5_GRENZE_MS` (50), `M5_PERZENTIL` (0,9) und das Intervall (3000 ms) sind unverändert und jetzt gepinnt. **AC-3 erfüllt.**

## Messanleitung

```sh
# G-0 / AC-1: Quelle und Kopie haben denselben Hash
shasum -a 256 /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec041/spec.md specs/041-wacklige-tests/spec.md

# B-8 (T2): CI-Spur (Artefakte nur lesen, nie ausführen) und die neue Spec je Engine nacheinander
gh run download 41920898257 -R thojank/fundamento -n testberichte-eroj-3-1 -D /tmp/s041-spur/t2/testberichte-eroj-3-1
gh run download 41920898257 -R thojank/fundamento -n testberichte-eroj-4-2 -D /tmp/s041-spur/t2/testberichte-eroj-4-2
grep -A8 '<failure' /tmp/s041-spur/t2/*/eroj/test-reports/playwright/junit.xml
pnpm turbo run build --filter=@fundamento/cli... && cd packages/eroj && \
  for e in chromium firefox webkit; do FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=$e pnpm exec playwright test test/stato-041.spec.ts --repeat-each=10 --workers=4; done
```

```sh
# B-10, B-12, B-13 (T1): CI-Spuren (Artefakte nur lesen, nie ausführen) in leere Verzeichnisse
for r in 41971858056 41931882770 41941052854 41943148273 41971724414 41973572877; do
  gh run download $r -R thojank/fundamento -p 'testberichte-*eroj*' -D /tmp/s041-spur/t1/$r
done
grep -B1 -A30 '<failure\|<error' /tmp/s041-spur/t1/*/testberichte-eroj-*/eroj/test-reports/playwright/junit.xml
# Schritte und Dauer je Test aus dem eingebetteten Bericht (Python, nur lesend)
python3 -I /tmp/s041-tools-t1/report.py <…>/playwright/html/index.html '3\.5: a component'
# lokal, WebKit, im Hintergrund, eine Datei
pnpm turbo run build --filter=@fundamento/cli... && cd packages/eroj && \
  FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=webkit pnpm exec playwright test test/buehne-036.spec.ts \
  -g "3.5: a component|3.2: the material" --repeat-each=50 --workers=10
FM_GEBAUT=1 FM_AUSGABE=knapp pnpm exec vitest run test/wackler-040.test.ts
```

```sh
# B-9, B-15 (T3): CI-Spuren (Artefakte nur lesen, nie ausführen), je in ein neues leeres Verzeichnis
for x in 41971724414:3-1 41920898257:3-2 41931882770:3-1 42053971357:3-1; do
  r=${x%%:*}; n=${x#*:}; d=/tmp/s041-spur/t3/$r-eroj-$n; mkdir $d && gh run download $r -R thojank/fundamento -n testberichte-eroj-$n -D $d
done
python3 -I /tmp/s041-tools-t1/report.py <d>/eroj/test-reports/playwright/html/index.html '3\.4: a change in the Studio'
# lokal, Firefox (rot vor 78ad9ae6: 10/30), dann grün in allen drei Engines
pnpm turbo run build --filter=@fundamento/cli... && cd packages/eroj && \
  for e in firefox chromium webkit; do FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=$e pnpm exec playwright test test/studio-035.spec.ts -g "3.4: a change in the Studio" --repeat-each=90 --workers=10; done
# N-2 (B-8): WebKit Bühne 3.5, kein „access control checks“
FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=webkit pnpm exec playwright test test/buehne-036.spec.ts -g "3.5: a component" --repeat-each=150 --workers=10
```

```sh
# C-2 (T4): M5-p90 eines Laufs, rot oder grün, aus dem JUnit des Artefakts (Artefakte nur lesen)
id=<Lauf>; a=$(gh run view $id -R thojank/fundamento --json attempt --jq .attempt); d=$(mktemp -d /tmp/s041-art.XXXXXX)
gh run download $id -R thojank/fundamento -n testberichte-zeittests-x-$a -D $d && grep -rhoE "M5 Urteil \(chromium\)[^<]*" $d
# ältere Läufe (ohne Artefakt): gh run view <id> --log | grep "M5 Urteil (chromium"

# I-1 (T5): Treffer oder Fehlschlag je Job, Dauer des Browser-Schritts, Spiegel-Get-Zeilen
/tmp/s041-tools/auswerten.sh <Lauf> [Versuch]
gh run view <id> --log --job <job-id> | grep -cE "Get:[0-9]+ .*archive.ubuntu.com"

# T6: Messläufe je Branch nacheinander (cancel-in-progress), Dauer je Job, Ergebnis je Job
gh workflow run CI -R thojank/fundamento --ref <branch>
gh run list -R thojank/fundamento --workflow CI --branch <branch> --event workflow_dispatch --limit 1 --json databaseId
node scripts/ci/messung.mjs <id> …
gh run view <id> -R thojank/fundamento --json jobs --jq '.jobs[]|[.name,.conclusion]|@tsv'
```

Signatur von B-8 für T1 und T3 (D-07): Konsolenfehler „…/stato due to access control checks.“ (Linux-WebKit) oder ein Seitenfehler „TypeError: Load failed“ (WebKit) bzw. „The operation was aborted.“ (Firefox) im alten Dokument, unmittelbar nach einem Neuladen oder einer Navigation einer Seite mit `stato`-Abruf.

## Blockiert

- **B-14 / AC-6:** Die Bisektion (T4) fand keinen schuldigen Commit (D-23). Es gibt keinen Fix, und Spec 041 schiebt keinen spekulativen nach; `M5_GRENZE_MS` bleibt 50, `M5_PERZENTIL` 0,9 (gepinnt in `packages/eroj/test/m5-041.test.ts`). „Timing checks“ kann auf jedem Branch rot werden, solange der Maintainer nicht entschieden hat (Bericht, nächste Schritte).
- **B-10, B-13:** Ursache ohne Trace nicht zu klären; kein Fix (D-11).
- **B-12 (Übernahme-POST):** ein POST wird nicht wiederholt, und Node-`fetch` erlaubt keinen `connection`-Kopf (D-16).

## Bericht

**Stand 2026-11-05, 20:30 Ortszeit.**
- Spec 041 ist in sechs Tickets gebaut und liegt in zwei offenen PRs: **#148** (Teil A, Tests und Produkt) und **#147** (Teil B, Browser-Cache).
- Die PRs sind nicht gestapelt, teilen keine Datei, beide sind `MERGEABLE`/`CLEAN` auf `main` `c66ed99f`.
- **Nichts gemergt**, kein Auto-Merge, kein Entwurf, kein Lauf auf `main`. **Keine Grenze angehoben** (AC-3). Kein Sprachmodell, **0 $**.
- Quell-Hash = Kopie (`3c006222…0003ec3f`).
- Fünf Befunde behoben oder beim Treffer behoben: B-8 (mit N-2), B-9, B-15, B-12 (Bühne), I-1. **Offen:** B-10, B-13, **B-14**, B-12 (Übernahme-POST), N-1, N-3 bis N-6.
- Abnahme: **7 erfüllt, 2 teilweise, 1 offen** (AC-6).

### PRs und CI

| Teil | PR | Code-Head | CI des PRs | drei `workflow_dispatch`-Läufe |
|---|---|---|---|---|
| A | https://github.com/thojank/fundamento/pull/148, offen, CLEAN | `008bef5a` (danach nur dieser Doku-Commit) | 42079224873 (`008bef5a`): Versuch 1 rot (B-10), R-8 → **grün**; 42092076645 (`840cba19`): Versuch 1 rot (I-1, B-14 mit p90 53 ms), R-8 → **grün** | 42079221475 grün nach R-8 (I-1); 42085495161 **grün**; 42087222996 grün nach R-8 (I-1); „Timing checks“ 3 × grün |
| B | https://github.com/thojank/fundamento/pull/147, offen, CLEAN | `b9cde42f` | 42076893161: **grün** im ersten Versuch | 42076935265 **grün**; 42080252255 **rot** (B-15 + B-12, nach R-8 N-6 = B-8-Signatur, D-10); 42086157431 grün nach R-8 (B-12 Übernahme); „Timing checks“ 3 × grün |

**Nachweis, dass nach dem Messkopf nur Doku kam:** `git diff --stat 008bef5a HEAD` zeigt nur `specs/041-wacklige-tests/plan.md` und `tasks.md`.

**Lokale Prüfung von T6 auf `008bef5a`:**
- `pnpm check:privat` grün (4157 Dateien, 0 Treffer).
- `pnpm lint` zweimal grün.
- `pnpm test:betroffen` rot nur an Zeitlimits unter eigener Last (nordstelo `raporto.test.ts`, Hook 10 000 ms).
- Paketweise mit `--concurrency=1 --continue`:
  - 8 Pakete grün;
  - Eroj-Vitest 25/25;
  - Eroj-Playwright 1910 bestanden, 2 rot (N-1, N-5).
- Abweichung: PR A wurde gepusht, als die Eroj-Playwright-Suite lokal noch lief. Seit T3 kam an Eroj nur eine Vitest-Datei hinzu, die vorher grün lief.
- B: `workflow.test.ts` 51/51.

### Befund → Nachweis → Ursache → Fix

| Befund | Nachweis | Ursache | Fix | Stand |
|---|---|---|---|---|
| B-8 (+N-2) | 41920898257 (WebKit, „…/stato due to access control checks“); `stato-041.spec.ts` lokal rot | Abruf überlebte das Entladen; ein Takt zwischen `beforeunload` und `pagehide` | `html.ts`: Abbruch bei `beforeunload`, keine Takte bis zur nächsten Eingabe, Ende bei `pagehide` (D-13, D-17); 3000 ms gepinnt | erledigt; in A kein Rot, in B (ohne Fix) N-6 |
| B-9, B-15 | 41920898257, 41971724414; lokal Firefox 10/30 | Playwright meldet in Firefox unter Last kein `framenavigated` (Werkzeug) | 3.4 liest den Rahmen über `contentDocument`, `expect.poll` 5 s (D-18); 90/90 in drei Engines | erledigt; in A kein Rot, in B rot (B-15) |
| B-10, B-13 | 41931882770, 41971858056; **neu 42079224873 (PR A, mit B-8-Fix)** | im zweiten Dokument liefen die Modulskripte nicht; warum, zeigt die Spur nicht | keiner (D-11) | offen |
| B-12 | 41941052854, 41943148273; lokal 20/100 | Keep-alive des Request-Kontexts gegen 5 s Ruhezeit des Servers | GET in `nachEinemReset`, Bühne-POSTs mit `connection: close` (D-15) | Bühne erledigt; Übernahme-POST offen (D-16; in B 42086157431 rot) |
| B-14 | C-2: p90 51/53/55 ms auf `main` | kein schuldiger Commit (87 Stichproben); Runner und Tageszeit; je Änderung ~4 700 Elemente Stil-Neuberechnung | keiner (D-23 bis D-26); Grenze 50 gepinnt | **offen**, Maintainer entscheidet |
| I-1 | 7 Abbrüche an 15 min; 42050500562 | apt-Spiegel (114 MB mit 140 kB/s) | Browser + `.deb` im Actions-Cache, Treffer per `dpkg -i` ohne Netz (D-19 bis D-22) | erledigt bei Treffer (B: 3 × 14/14, 0 Spiegel); A ohne Cache 2 × I-1 |
| N-1, N-4, N-5 | nur lokal | macOS-WebKit-Tab; Firefox-Testzeit; Rahmenwechsel in Bühne 3.1 | keiner | offen |
| N-3 | lokal 39/60 bei 10 Workern | Portschema der Übernahme-Spec | keiner | offen |
| N-6 | 42080252255 Versuch 2 | B-8-Signatur auf B (ohne Fix) | Fix in A | erledigt mit Merge von A |

### Messungen, Diff-Suche, Neustarts

- **M5 p90** (C-2) auf A: **0 / 0 / 0 ms**. Auf B: 0 / 0 / 0 ms. PR-CI B: 50 ms. PR-CI A: 0 ms, auf dem Doku-Kopf aber **53 ms (rot)**, nach dem Neustart 0 ms. Grenze 50 unverändert.
  - Grün ist es auch auf B ohne jede Werkstatt-Änderung. Das stützt den Runner-Befund und ist **kein** Beleg eines Fixes.
  - Tabellen unter „Messungen“.
- **Diff-Suche (AC-3):** Befehl der Spec mit den echten Branches. A hat 42 Treffer, B einen. Alle sind unverändert (`}, 3000);` eingerückt), gelesen (`INTERVALL_MS` mit `page.clock`), Kommentar, Testname, Pin oder Verbot (`SEGMENT_DOWNLOAD_TIMEOUT_MINS`). `waitForTimeout` neu: 0. `M5_GRENZE_MS = 50` und `}, 3000);` gefunden. **Nichts neu oder höher.**
- **Neustarts (R-8), je einer:**

  | Lauf | Grund | Ergebnis |
  |---|---|---|
  | 42079221475 (A) | I-1 | grün |
  | 42087222996 (A) | I-1 | grün |
  | 42079224873 (PR A) | B-10 | grün |
  | 42080252255 (B) | B-15, B-12 | wieder rot → **N-6**, kein weiterer Neustart |
  | 42086157431 (B) | B-12 | grün |
  | 42092076645 (PR A, Doku-Kopf) | I-1, B-14 | grün |

### Prüfung gegen die Abnahmekriterien

| AC | Urteil | Beleg |
|---|---|---|
| AC-1 | erfüllt | Hash gleich, Doku-Test pinnt ihn |
| AC-2 | erfüllt | jede der acht Zeilen hat Lauf oder Befehl, Doku-Test prüft es |
| AC-3 | erfüllt | Diff-Suche oben, nichts neu oder höher |
| AC-4 | teilweise | B-9/B-15 warten auf den Zustand des Rahmens, 90/90 in drei Engines; B-10/B-13 ohne Fix, Ursache offen |
| AC-5 | erfüllt | `stato-041.spec.ts` rot → grün in drei Engines, 3000 ms gepinnt; A ohne B-8-Rot |
| AC-6 | **offen** | kein schuldiger Commit, kein Fix. Die drei p90-Werte auf A sind zwar 0 ms und „Timing checks“ 3 × grün, aber ohne Fix, und die PR-CI von A war um 19:15 UTC wieder rot (p90 53 ms). Grenze 50 gepinnt, Werkstatt unverändert |
| AC-7 | teilweise | `nachEinemReset` genau einmal und nur bei `ECONNRESET` (Unit-Fälle); Übernahme-POST bleibt offen |
| AC-8 | erfüllt | sechs Jobs, Schlüssel Version + OS/Image + Engines, Treffer ohne Spiegel, `timeout-minutes` unverändert; Restrisiko bei Fehlschlag (D-22) |
| AC-9 | erfüllt | beide offen, aktuelles `main`, MERGEABLE, CI grün (A beide Male nach R-8), je drei Läufe mit Tabelle, R-8 gehalten (N-6), nichts gemergt |
| AC-10 | erfüllt | dieser Bericht |

**Zahl:** 7 erfüllt, 2 teilweise, 1 offen.

### Was der Maintainer als Nächstes tut

1. PRs prüfen und mergen, in beliebiger Reihenfolge, beide sind nicht gestapelt:
   - https://github.com/thojank/fundamento/pull/148 (A; B-12 liegt hier, D-01)
   - https://github.com/thojank/fundamento/pull/147 (B)
   - Bewusste Verhaltensänderung in A (D-17): Nach einer abgebrochenen Navigation fragt die Seite erst bei der nächsten Taste, dem nächsten Zeiger, Fokus oder `pageshow` wieder nach `stato`.
2. Der **erste Lauf auf `main` nach dem Merge von B** ist ein Cache-Fehlschlag. Er lädt vom Spiegel und füllt den Cache für `main` und die PRs (D-22). Beobachten mit `gh run list -R thojank/fundamento --workflow CI --branch main --limit 3`.
3. Danach **drei `workflow_dispatch`-Läufe auf `main`**, nacheinander: `gh workflow run CI -R thojank/fundamento --ref main`. Den nächsten erst starten, wenn der vorige fertig ist. M5 lesen mit C-2 (plan.md › Messanleitung). Das ist das Ziel der Quell-Spec („drei Läufe hintereinander grün“).
4. **B-14 entscheiden** (plan.md › Befunde B-14, D-23 bis D-26): Entweder der Runner ist die Ursache, dann bleibt es so, die Grenze bleibt 50, und das Rot wird beobachtet. Oder ein Werkstatt-Fix verkleinert die Stil-Neuberechnung von ~4 700 Elementen je Änderung in `packages/projekcioj/src/celoj/vitrino/` und wird mit drei sequentiellen CI-Läufen gemessen.
5. **B-10/B-13:** `trace: "retain-on-failure"` in `packages/eroj/playwright.config.ts`, damit das nächste Auftreten die Netzanfragen des zweiten Dokuments zeigt.
6. **B-12, Rest (Übernahme-POST):** die Ruhezeit des Metiejo-Servers abstellen wie `packages/mcp/src/http.ts:72` (`keepAliveTimeout = 0`). Das ist ein Produkteingriff in einer eigenen Spec. Dazu **N-3:** `start()` in `packages/eroj/test/metiejo-036-uebernahme.spec.ts` wie in `buehne-036.spec.ts` (eigenen Port sicher erkennen).
7. Die Entscheidungen D-01 bis D-26 in `specs/041-wacklige-tests/plan.md` bestätigen. Dazu nur lokal: N-1, N-4, N-5.
