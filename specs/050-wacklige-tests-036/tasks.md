# Spec 050 – Aufgaben (Wacklige Browser-Tests aus Spec 036 stabil machen)

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `de931e40` · **Branch:** `261112-wacklige-browser-tests--9197f6`

Sechs Tickets, ein Strang, streng nacheinander: `W050-T1 → W050-T2 → W050-T3 → W050-T4 → W050-T5 → (QA-Schleife) → W050-T6`. Commits lokal mit dem Präfix `Spec 050 T<n>: …` (Englisch). Gepusht wird nur in T6, genau einmal, vom Orchestrator. Jedes Ticket liest zuerst „Ursache je Test“ (V-1) in `plan.md` und schreibt seinen Stand dorthin zurück.

| Ticket | Inhalt | nötig? | Beleg | Stand |
|---|---|---|---|---|
| W050-T1 | Diagnose ohne Code: Artefakte, Zeitleisten, Messung, Vorher-Raten, Proben, V-1 | nötig | Auftrag | erledigt: V-1, V-2, Proben (`79a463bc`); V-3 „vorher“ vollständig (2026-11-13, Doku-Commit „before rates complete“) |
| W050-T2 | Prüfung schneller (rot zuerst, byte-gleich) | **nötig** | V-1: T-A und T-B sind **K4 Prüfung** (erste `/pruefung` eines neuen `rev` lokal 1613 / 2434 ms ≥ 1 s; CI-Unit 1,5–2,8 s; im Eroj-Job ≥ 4,4 bis ≥ 11 s). Messung: Prüfregeln 94 %, `validateModeloFiles` (`packages/modelo`, tabu) 82 %, Ableitung ≈ 100 ms, die zwei `buildModelo` ≈ 16 ms (B-03). T-D ist **nicht** K4 (Prüfung in `festlegen`, Rahmen 1–3 ms). | **erledigt:** Paletten je Anfrage einmal gelöst (`2f6c33a6`), byte-gleich; erste `/pruefung` 1613 → 1491 ms (Median), „unter 1 s“ nicht erreichbar ohne `modelo` (B-11); Zwischenprüfung 150/150 |
| W050-T3 | Tests an der Ursache (K2, K3) und doppelte Navigation (K4) | **nötig**, alle drei Teile | K2 für T-A/T-B (B-01, B-14), K4 Navigation und K3 für T-C, K3 für T-D (V-1) | **erledigt:** K4 rot `fd90b67b` → grün `de3fd057` (Client legt Kopien der Vorschau-Rahmen an ihre Stelle), K2 `c5147982` (`schrittLaedt`, Antwort der Rahmen-Navigation in `entwurfGespeichert`, Kennung des Dokuments am `window`), K3 `9a51b5cd` (Rahmen von der Seite aus gelesen); byte-gleich; Zwischenprüfung 120/120 und 150/150 |
| W050-T4 | `achsen-2b2:82` | **nötig, als K5** (nicht als Fehler der Komponente) | Plattform-Probe: macOS-WebKit `Tab` → `BODY`, `Alt+Tab` und `focus()` → `[part="control"]` (`tabIndex` 0); Chromium/Firefox `Tab` fokussiert; Linux-WebKit 11/11 grün; lokal 30/30 rot. Kein Rot-zuerst für `fm-markobutono` (kein Komponentenfehler). | **erledigt:** `8a982bd5` – Taste `Alt+Tab` nur bei WebKit auf macOS, sonst `Tab` (D-25); alle Erwartungen unverändert; Zwischenprüfung WebKit (macOS) 10/10, Chromium/Firefox je 1/1 |
| W050-T5 | Schlusslauf lokal (Test-Ticket): 30/30 nach D-13 (beide Stufen), ganze Eroj-Suite, Diff-Suche, `bericht.md` ohne CI | nötig | AC-4 bis AC-8 | **erledigt:** jeder Zieltest 30/30 je Engine in beiden Stufen (T-A Chromium (1) 29 → 30, WebKit (2) 26 → 30; T-E 0 → 30; T-D im Shard 1/1); ein Rot außerhalb der Zieltests (`buehne-036:414` 3.2 WebKit 29/30 in Stufe (2), B-17); ganze Eroj-Suite 2026 grün, 0 rot; Diff-Suche ohne Verstoß; `bericht.md` mit Platzhaltern V-4 |
| W050-T6 | Ein Push, ein PR, genau ein `workflow_dispatch`, Bericht (Orchestrator, nach der QA-Schleife) | nötig | AC-5 | offen |

## W050-T1 im Einzelnen (Diagnose, kein Code)

- [x] **Artefakte zuerst gesichert** (Q-8, 19:20–19:24): 11 Läufe mit Eroj-Artefakten (#155-Dispatch, #158/#162/#163-Läufe, Pushes und `schedule` auf `main` bis zur Basis `de931e40`), je `testberichte-eroj-{1..4}-1` und `testberichte-unit-metiejo-1`, je Artefakt ein neuer leerer Ordner unter `…/s050-spur/`. Nichts abgelaufen; die `pull_request`-Läufe von #155/#158/#162 haben keine Eroj-Artefakte, weil ihre Eroj-Jobs nicht liefen (6–8 s). Tabelle in `plan.md` › „Gesichert“.
- [x] **Zeitleiste je Test** aus den Traces (`plan.md` › „Zeitleisten aus den CI-Traces“): T-A Rahmen rev 2 hinter der Prüfung, T-B `POST /pruefung` rev 1 unbeantwortet, T-C zwei Anfragen je Rahmen nach dem Neuladen und Kontext des Vorschlagsrahmens zerstört in `knopf`, T-D Erwartung im `frameLocator` ohne Ende ohne Anfrage im Weg, T-E in Linux-WebKit grün.
- [x] **Messung lokal in Ruhe** (V-2): `messung-044` auf `de931e40` (erste `/pruefung` 1613 / 2434 ms) und CPU-Profil der Prüfung (Ableitung ≈ 100 ms, Prüfregeln ≈ 1649 ms, davon `validateModeloFiles` 1429 ms). CI-Spalte aus den Traces und den `messung-044.json` des Unit-Jobs.
- [x] **Vorher-Raten** (V-3) nach D-13, vollständig: Tabelle in `plan.md` › „30/30 vorher“. Stufe (1): T-A Assistent 29/30 Chromium, sonst 30/30; T-B, T-C, T-D 30/30 je Engine (`buehne-vorher-2` ohne fremde Last); T-D im Shard 2/4 1/1; T-E 0/30. Stufe (2) (6 Busy-Loops): T-A Assistent WebKit **26/30** (zweite Wartestelle, B-14), sonst alles 30/30. Nur zur Information: `buehne-vorher` (fremde Last, T-D Firefox 29/30). Die Reihen ab 2026-11-13 liefen auf `79a463bc` (ausgecheckt und gebaut, D-22), der Baum ist danach wieder auf dem Branch und neu gebaut.
- [x] **Extra-Reihe mit Spuren** (D-16, `zweitfarbe-spuren`, 75/75 grün): B-01 für T-B teilweise widerlegt (B-15).
- [x] **Plattform-Probe T-E** (D-14) und **Rahmen-Probe T-C/T-D** (D-15), beide Wegwerf unter `/tmp/s050/probe-pw/` (Kopie `…/s050-werkzeug/`).
- [x] **V-1** nach den Klassenregeln (D-10): T-A, T-B K4 Prüfung (+K2, +K1); T-C K4 Navigation (+K3); T-D K3 (+K5, +K1); T-E K5.
- [x] `spec.md` mit `cp` aus `user-provided-product-spec-wacklige-tests-036.md`, SHA-256 `386f6db80c0e99edd5813b22b67d8481e59098ca96d48fdee3fdc7a329e3d8c5` (Quelle = Kopie, 16 031 Byte). Wird nicht editiert.
- [x] Kein Code geändert: `git diff de931e40 --name-only` zeigt nur `specs/050-wacklige-tests-036/{plan,spec,tasks}.md`. Kein Push, kein PR, kein Dispatch, kein Rerun.

## W050-T2 im Einzelnen (Prüfung schneller)

- [x] **Gemessen vor dem Entwurf** (D-17): Was `validateModeloFiles` je Prüfung bekommt (Struktur + abgeleitetes Paket, 144 Kombinationen, die Hälfte komuna) und was zwischen rev n und n+1 gleich bleibt. Wiederverwendbar im Scope: nur die Palettenstufen in `agordilo`; der Rest hängt in `modelo` an der Identität des `Modelo` und an `protected-minimum` (Vergleich mit komuna).
- [x] **Byte-Fixture zuerst** (D-20) auf `79a463bc`: `packages/metiejo/src/ableitung-050.test.ts` + `test-doubles/ableitung-050.json`, einmal geschrieben (`FM_ABLEITUNG_050=schreiben`), `git check-ignore -v` leer. `antworten-044` grün auf `79a463bc` (3/3).
- [x] **Roter Test** (D-19) `packages/agordilo/src/paletten-050.test.ts`: zählt `solveStep` über `vi.mock`; rot (105 statt 12, 93 statt 0).
- [x] **Fix** `packages/agordilo/src/palettes.ts` (`solvedStep`, D-18), Testdatei unverändert. Grün: `paletten-050` 3/3; Quelle 23/23 und `dist` 23/23 (`ableitung-050`, `antworten-044`, `stato-044`, `ableitungen-044`, `grenzfaelle-044`); `pruefung-worker-044` 11/11; beide Fixtures unverändert.
- [x] **Schluss:** `modelo` allein grün (4954), `lint` grün; `test:betroffen` rot nur durch Zeitfenster in `nordstelo` im parallelen Lauf (B-13, allein 270/270); derselbe Paketsatz nacheinander 18/19 grün inkl. Eroj-Playwright 675/675, `projekcioj` `komuna-fonto.test.ts:182` einmal über 60 s, allein 11/11 – `plan.md` › „Schluss T2“.
- [x] **Messung nachher** (V-2, ohne fremde Tests): erste `/pruefung` 1613 / 2434 → **1491 / 2103 ms** (nicht unter 1 s, B-11), Ableitung 99 → ≈ 36 ms, `vorschau.css` 155 → 50 ms. **Zwischenprüfung** `zweitfarbe-036` `--repeat-each=10`, drei Engines: 150/150 grün (zählt nicht für AC-4).

### Commits T2

- `a9ecfa40` Spec 050 T2: byte fixture of the derivation on 79a463bc (palettes, deriveAspekto files)
- `af045d7e` Spec 050 T2: red test, a Zweitfarbe change solves every palette step again
- `2f6c33a6` Spec 050 T2: solve each palette step once per request, a Zweitfarbe change solves only its own steps
- (Doku) Spec 050 T2: plan and tasks

## W050-T3 im Einzelnen (Warten an der Ursache, doppelte Navigation)

- [x] **Mechanismus der doppelten Navigation** belegt (Probe `/tmp/s050/t3/zustand.probe.ts`, `plan.md` › „T3“): Firefox gibt beim Neuladen jedem vom Parser angelegten Vorschau-Rahmen sein letztes Dokument zurück (Navigationstyp „reload“, Dokument schon „interactive“, wenn der Client läuft); der Client weist dieselbe URL noch einmal zu. Nicht `vorschauNochmal`.
- [x] **Roter Test** `buehne-036.spec.ts` „3.4 (Spec 050): after a reload each frame of the stage loads its document once“ (`fd90b67b`): zählt je Rahmen die beantworteten Navigationen nach `location.reload()`; Firefox 3/3 rot, Chromium/WebKit 3/3 grün.
- [x] **Fix** `packages/metiejo/src/html.ts` (`de3fd057`, D-23), Testdatei unverändert (`git diff fd90b67b..de3fd057 -- packages/eroj/test/buehne-036.spec.ts` leer); 9/9 grün. Kein Timer, `stato`-Takt unverändert.
- [x] **Regressionen nach dem Fix:** `buehne-036`, `buehne-navigation-042`, `zweitfarbe-036` je Engine 81/81; `metiejo` 670/670 (`FM_MESSUNG_044_N=2`); `dist` 8/8 (`antworten-044`, `stato-044`, `ableitung-050`); Fixtures unverändert.
- [x] **K2** (`c5147982`): `schrittLaedt` (neu in `geladen-042.ts`) vor `goto`/`reload`/„Keine Zweitfarbe“ angelegt; `entwurfGespeichert` wartet auf die Antwort der Rahmen-Navigation der `rev`; `dokument()` als Marke am `window` (B-14; Probe unter Last: je Dokument ein Wert in allen Engines).
- [x] **K3** (`9a51b5cd`): `knopf()` und T-D lesen die Rahmen von der Seite aus; vor Hover bestätigt: geladen mit `rev`, Schnitt 100 %, sichtbar, Zeiger trifft (D-24). 3.6 `:711` nicht angefasst.
- [x] **Zwischenprüfung** (zählt nicht für AC-4): `buehne-036 -g "3\.(4|5)"` 120/120, `zweitfarbe-036` 150/150, je `--repeat-each=10`, drei Engines, `--workers 2`, ohne fremde Last.
- [x] Diff-Suche über `17eaab0a..9a51b5cd -- packages`: kein `timeout`, `waitForTimeout`, `setTimeout`, `framenavigated`, `frame.url()`, `skip`/`fixme`/`only`, `retries`.

### Commits T3

- `fd90b67b` Spec 050 T3: red test, the frame navigates twice after a reload
- `de3fd057` Spec 050 T3: the client lays a copy of each preview frame in its place, so Firefox restores no frame on reload
- `c5147982` Spec 050 T3: wait for the answers behind the check before reading the step, and a document mark that holds in WebKit
- `9a51b5cd` Spec 050 T3: read the stage's frames from the page, confirm the state before acting in a frame
- (Doku) Spec 050 T3: plan and tasks

## W050-T4 im Einzelnen (`achsen-2b2:82`, K5)

- [x] **Beleg aus T1 übernommen** (Plattform-Probe D-14): macOS-WebKit `Tab` → `BODY`, `Alt+Tab` und `focus()` → `[part="control"]` (`<button role="checkbox">`, `tabIndex` 0); Chromium/Firefox `Tab` fokussiert, Firefox `Alt+Tab` nicht; Linux-WebKit in CI 11/11 grün. Kein Fehler der Komponente → kein roter Test, `packages/eroj/src/**` unberührt.
- [x] **Änderung** `packages/eroj/test/achsen-2b2.spec.ts` (`8a982bd5`, D-25), Zeilen vorher `ed1670fc` / nachher `8a982bd5`:
  - `:81`–`:87` (neu): `nextButtonKey(browserName)` = `"Alt+Tab"` bei `browserName === "webkit" && process.platform === "darwin"`, sonst `"Tab"`; lokal in der Datei, **nicht** `TAB()` aus `alirebleco.ts` (das nimmt jedes WebKit, auch Linux).
  - `:82`–`:84` → `:90`–`:93`: Fixture `browserName` dazu.
  - `:93` → `:102`: `await page.keyboard.press("Tab");` → `await page.keyboard.press(nextButtonKey(browserName));`
  - **Grund:** Vorher prüfte der Test auf macOS-WebKit die Tastatureinstellung von macOS (30/30 rot), nicht die Komponente. Nachher erreicht auf jeder Plattform ein Tastendruck der Plattform das Steuerelement; `toBeFocused` und alle Wert-Erwartungen (`aria-readonly`, `checked`, `aria-checked`, Formularwert `on`) stehen unverändert da (AC-7, `plan.md` › „T4“).
- [x] **Zwischenprüfung** (unter der Sperre, ohne fremde Test-Prozesse, zählt nicht für AC-4): WebKit (macOS) `--repeat-each=10` 460/460, Zieltest 10/10; Chromium + Firefox einmal 92/92, Zieltest je 1/1.
- [x] **Andere Tests der Datei:** keiner aus demselben Grund rot (`A-elektilo-1` erreicht einen `<select>`, den macOS-WebKit mit `Tab` fokussiert); nicht angefasst.
- [x] **Für die Diff-Suche in T5:** `browserName` in den hinzugefügten Zeilen `:86`, `:87`, `:92`, `:102` = Tasten-Weiche (Q-4/D-25), keine Engine-Einschränkung. Kein `skip`/`fixme`/`fail`/`only`/`timeout`/`retries`/`waitForTimeout`/`setTimeout`.
- [ ] **Nicht lokal prüfbar:** Linux-WebKit – Nachweis im Dispatch (T6).

### Commits T4

- `8a982bd5` Spec 050 T4: the read-only checkbox reaches its control with the platform's key, Alt+Tab only in WebKit on macOS
- (Doku) Spec 050 T4: plan and tasks

## W050-T5 im Einzelnen (Schlusslauf lokal, Test-Ticket, keine Fixes)

- [x] **Bau** unter der Sperre (`besitzer.txt` „W050-T5“, 04:37): `pnpm turbo run build --filter=@fundamento/cli...`, `dist` mit `solvedStep` (T2) und `cloneNode` (T3).
- [x] **Nachher-Reihen (V-3) nach D-13/D-26**, unverändert dieselben Befehle wie T1, je Reihe erst nach 90 s Ruhe, ohne fremde Test-Prozesse (0 Treffer in 428 Stichproben): Stufe (1) `zweitfarbe-nachher` 450/450, `buehne-nachher` 1800/1800, `shard2-nachher-lauf` 506 + 1 übersprungen (T-D Firefox 1/1; `--list`: T-D steht jetzt an `:679`, `grep ':545'` leer), `achsen-nachher` 1380/1380 (T-E 30/30); Stufe (2) `zweitfarbe-nachher-cpu` 450/450, `buehne-nachher-cpu` 1799/1800. Busy-Loops nach jeder Reihe beendet, keine übrig. Tabelle: `plan.md` › „30/30 vorher“ › „Tabelle (V-3)“.
- [x] **Rot als Befund, nicht repariert:** `buehne-036:414` 3.2 WebKit, Stufe (2), Wiederholung 9 – `rahmenBereit` (unverändert) nach dem zweiten `oeffne()`, Rahmen nach 5 s nicht „complete“ unter Load 64–80 (B-17, B-18). Trace unter `s050-lokal/buehne-nachher-cpu/test-results/`.
- [x] **Ganze Eroj-Suite** drei Engines, `--workers 4`: 2026 grün, 0 rot, 2 übersprungen (vorbestehend nur Chromium), `buehne-navigation-042:439` WebKit erwartet rot (`test.fail`, Spec 043).
- [x] **Pakete und Lint:** `modelo` allein 4954 grün; `test:betroffen` rot nur `nordstelo` (15 Zeitfenster, B-13); nacheinander 18/19 grün, `projekcioj` `figma-cxiuj.test.ts:32` Hook-Zeitfenster 180 s; allein `nordstelo` 270/270 (ohne Cache), `figma-cxiuj` 5/5; `pnpm lint` grün (auch ohne Cache mit `--concurrency=1`). `.only`/`.skip`: nur vorbestehend (`forced-colors.spec.ts:14`, `quickstart.spec.ts:47`).
- [x] **Diff-Suche** (sieben Befehle, Ausgabe wörtlich in `plan.md` › „T5“ › „Diff-Suche“): einziger Treffer der ersten Suche ist die Tasten-Weiche aus T4 (`browserName`, vier Zeilen), jede erklärt; nur Zone, keine Tabu-Datei, keine Baseline, `stato`-Takt und `antworten-044` unverändert; rote Commits vor ihren Fixes. **Kein Verstoß gegen Regel 0.**
- [x] **AC-Abgleich** AC-1 … AC-8: `plan.md` › „T5“ › „AC-Abgleich“; AC-5 offen für T6.
- [x] **`bericht.md`** (Deutsch, kurz): Platzhalter `<!-- PLATZHALTER PR -->` und `<!-- PLATZHALTER CI je Job -->` (Tabelle `Job | Ergebnis | Notiz` in T6), Ursache je Test, Messung, 30/30, Diff-Suche, offene Befunde, fremde Wackler, „Was der Maintainer tut“.
- [x] Kein Push, kein PR, kein Dispatch, kein Rerun. Sperre am Ende entfernt.

### Commits T5

- Spec 050 T5: final local run, report without CI (nur `specs/050-wacklige-tests-036/{plan,tasks,bericht}.md`)

### Befunde für die nächsten Tickets

- **T2 (erledigt, siehe oben):** Die Zeit steckt zu 82 % in `validateModeloFiles` (`packages/modelo`, tabu) und zu 10 % in `evaluateAlirebleco`; die Ableitung ist mit ≈ 100 ms klein. „Unter 1 s“ verlangt, diese Prüfregeln seltener oder mit wiederverwendeten Teilergebnissen zu rechnen, ohne `packages/modelo` zu ändern und byte-gleich – sonst Befund mit Werten (B-03).
- **T3:** Drei Teile: K2 bei T-A/T-B (`waitForResponse` vor der Aktion, Q-2), K4 Navigation bei T-C (rot zuerst: „nach dem Neuladen genau eine Navigation je Rahmen und `rev`“ – die Rahmen-Probe zählt in Firefox 2 Anfragen bei 1 Zuweisung; der Test muss die Anfragen bzw. Dokumente zählen, nicht nur die Zuweisungen), K3 bei T-C/T-D (vor jeder Erwartung oder Aktion im Rahmen den Zustand von der Seite aus lesen; nach B-04/B-09 hängt in Firefox gerade die **erste** Erwartung im `frameLocator` nach einer Navigation des Rahmens). **Neu (B-14):** in WebKit ist `dokument()` (`performance.timeOrigin`) keine feste Kennung (dasselbe Dokument +1 ms) – `seiteBereit(…, nicht)` hält dann die alte Seite für neu (T-A `:181`, Stufe (2) 4/30); dieselbe Hilfe tragen `geladen()` (T-C) und `zweitfarbe-036:163`. Für T-B ist K2 nur über die Klassenregel belegt, nicht über den Vergleich der Varianten (B-15).
- **T4:** K5; Weiche nach Plattform **und** Engine (Q-4), `toBeFocused` bleibt.
- **T3 → T5:** Der neue Test „3.4 (Spec 050)“ läuft in der Datei-Reihe `buehne-036` mit; `geladen-042.ts` hat neue Exporte (`lesenOder`, `schrittLaedt`), die alten Signaturen sind gleich. T-D-Rest-Risiko (K5) siehe `plan.md` › „Was T3 nicht belegt“.
- **T5:** Dieselben Reihen und Stufen wie T1 (D-13, Befehle in `plan.md` › „Messanleitung“; Stufe (2) mit `s050-werkzeug/reihe-cpu.sh`), vor jeder Reihe 90 s ohne fremde Test-Prozesse anderer Arbeitsbäume (B-08). Lokal sind T-B/T-C/T-D schon vorher 30/30 – ihr Nachweis ist der Dispatch (AC-5).

### Commits

- `79a463bc` Spec 050 T1: cause per test (plan.md), before rates, measurement
- (Doku) Spec 050 T1: before rates complete (buehne-036, shard 2/4, CPU-limited)

## Geänderte Erwartungen älterer Tests (testing.md › „Extending tested pure functions“, AC-7)

Keine in T1 und T2 (T2 ändert keine Erwartung eines älteren Tests). T3/T4 tragen hier jede geänderte Erwartung mit Datei:Zeile, vorher/nachher und Grund ein. Zeilen = Stand `de931e40` (vor T3); die ausführliche Begründung steht in `plan.md` › „T3 – Begründung jeder ersetzten Erwartung (AC-7)“.

| Datei:Zeile | vorher | nachher | Grund | Ticket |
|---|---|---|---|---|
| `packages/eroj/test/geladen-042.ts:17`–`:19` | `dokument()` = `performance.timeOrigin` | Zahl an `window[MARKE]`, beim ersten Lesen gesetzt | B-14: WebKit meldet für dasselbe Dokument +1 ms; Kennung muss in allen Engines fest sein | T3 |
| `geladen-042.ts:52` | `neu: … performance.timeOrigin !== alt` | `neu: … window[MARKE] !== alt` | wie oben | T3 |
| `geladen-042.ts:202`–`:230` | `entwurfGespeichert`: `waitForResponse(entwurf)`, dann `rahmenBereit(…, { rev })` (5-s-Poll hinter der Prüfung), Prüfung per `page.on("response")` | Sammlung `antwortenAb` ab dem Aufruf: Entwurfsantwort (Status 200 wie vorher), **Antwort der Rahmen-Navigation `rev`**, dann dasselbe `rahmenBereit`, Prüfung nach der Entwurfsantwort wie vorher | K2 (T-A): kein festes Fenster hinter der Serverrechnung (`testing.md`) | T3 |
| `geladen-042.ts` (neu) | – | `lesenOder`, `schrittLaedt` (Signaturen der alten Hilfen unverändert) | K2/K3 | T3 |
| `packages/eroj/test/zweitfarbe-036.spec.ts:139`–`:140` | `goto`, dann `schrittBereit(page, id, merkmal)` | `schrittLaedt` vor `goto`, danach aufgerufen | K2 | T3 |
| `zweitfarbe-036.spec.ts:162`–`:163` | `reload`, dann `schrittBereit(…, vorDemNeuladen)` | `schrittLaedt(…, vorDemNeuladen)` vor `reload` | K2 | T3 |
| `zweitfarbe-036.spec.ts:178`–`:181` | `Enter`, dann `schrittBereit(…, vorDemLoeschen)` | `schrittLaedt(…, vorDemLoeschen)` vor `Enter` | K2 (B-14: das Neuladen wartet hinter der Prüfung von rev 3) | T3 |
| `zweitfarbe-036.spec.ts:212`–`:216` (T-B) | `freigeben()`, dann `schrittBereit` (5-s-Poll auf die erste Prüfung) | `schrittLaedt` vor `goto`, nach `freigeben()` aufgerufen | K2 (T-B) | T3 |
| `packages/eroj/test/buehne-036.spec.ts:256`–`:266` | `knopf()`: `expect(button).toBeVisible()` und `expect.poll(button.evaluate(…)).not.toBe("rgba(0, 0, 0, 0)")` im Rahmen | ein `expect.poll` über ein Lesen von der Seite aus (`contentDocument`): `{ sichtbar: true, farbe: nicht leer und nicht transparent }` | K3 (T-C: „Execution context was destroyed“ in `knopf`) | T3 |
| `buehne-036.spec.ts:554` | `expect(jetzt.locator("fm-pagxo").first()).toBeVisible()` | `expect.poll(() => sichtbarIm(page, JETZT, "fm-pagxo")).toBe(true)` | K3 (T-D lokal) | T3 |
| `buehne-036.spec.ts:555` | `expect(markiert).toHaveCount(0)` | `expect.poll(() => anzahlIm(page, JETZT, MARKIERT)).toBe(0)` | K3 | T3 |
| `buehne-036.spec.ts:567` | `expect(markiert.first()).toBeVisible()` | neu: Schnitt `100%` bestätigt; dann `expect.poll(() => sichtbarIm(page, JETZT, MARKIERT)).toBe(true)` | K3 (T-D CI) | T3 |
| `buehne-036.spec.ts:570`–`:581` | `komponente.evaluate(…)` (Warnfarbe/Umriss), `komponente.getAttribute(satz)` | ein Lesen von der Seite aus, dazu `expect(gelesen).not.toBeNull()`; Erwartungen auf `stil`/`farbe`/`satz` unverändert | K3 | T3 |
| `buehne-036.spec.ts:585` | `komponente.hover()` | `expect.poll(<Zeiger trifft die Komponente>).toBe(true)`, dann `page.mouse.move(Mitte)` | K3: Aktion ohne eigenes Zeitlimit nur nach bestätigtem Zustand | T3 |
| `buehne-036.spec.ts:591` | `komponente.evaluate(tabIndex)` | `tabIndex` aus dem Lesen von der Seite aus (`toBe(0)` unverändert); `komponente.focus()` (`:592`) bleibt | K3 | T3 |
| `buehne-036.spec.ts` (neu, nach `:541`) | – | roter Test „3.4 (Spec 050): after a reload each frame of the stage loads its document once“ | K4 Navigation, rot zuerst (`fd90b67b`) | T3 |
| `packages/eroj/test/achsen-2b2.spec.ts:93` (Stand `ed1670fc`; nachher `:102`) | `await page.keyboard.press("Tab");` | `await page.keyboard.press(nextButtonKey(browserName));` (`Alt+Tab` nur WebKit auf macOS, sonst `Tab`; Hilfe `:86`–`:87`, Fixture `browserName` `:92`). Keine Erwartung geändert. | K5 (T-E): macOS-WebKit erreicht Buttons nur mit `Alt+Tab`; die Weiche nach Engine **und** Plattform hält `Tab` für Linux-WebKit, Chromium, Firefox (D-25) | T4 |
