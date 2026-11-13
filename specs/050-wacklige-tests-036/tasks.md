# Spec 050 – Aufgaben (Wacklige Browser-Tests aus Spec 036 stabil machen)

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `de931e40` · **Branch:** `261112-wacklige-browser-tests--9197f6`

Sechs Tickets, ein Strang, streng nacheinander: `W050-T1 → W050-T2 → W050-T3 → W050-T4 → W050-T5 → (QA-Schleife) → W050-T6`. Commits lokal mit dem Präfix `Spec 050 T<n>: …` (Englisch). Gepusht wird nur in T6, genau einmal, vom Orchestrator. Jedes Ticket liest zuerst „Ursache je Test“ (V-1) in `plan.md` und schreibt seinen Stand dorthin zurück.

| Ticket | Inhalt | nötig? | Beleg | Stand |
|---|---|---|---|---|
| W050-T1 | Diagnose ohne Code: Artefakte, Zeitleisten, Messung, Vorher-Raten, Proben, V-1 | nötig | Auftrag | erledigt: V-1, V-2, Proben (`79a463bc`); V-3 „vorher“ vollständig (2026-11-13, Doku-Commit „before rates complete“) |
| W050-T2 | Prüfung schneller (rot zuerst, byte-gleich) | **nötig** | V-1: T-A und T-B sind **K4 Prüfung** (erste `/pruefung` eines neuen `rev` lokal 1613 / 2434 ms ≥ 1 s; CI-Unit 1,5–2,8 s; im Eroj-Job ≥ 4,4 bis ≥ 11 s). Messung: Prüfregeln 94 %, `validateModeloFiles` (`packages/modelo`, tabu) 82 %, Ableitung ≈ 100 ms, die zwei `buildModelo` ≈ 16 ms (B-03). T-D ist **nicht** K4 (Prüfung in `festlegen`, Rahmen 1–3 ms). | **erledigt:** Paletten je Anfrage einmal gelöst (`2f6c33a6`), byte-gleich; erste `/pruefung` 1613 → 1491 ms (Median), „unter 1 s“ nicht erreichbar ohne `modelo` (B-11); Zwischenprüfung 150/150 |
| W050-T3 | Tests an der Ursache (K2, K3) und doppelte Navigation (K4) | **nötig**, alle drei Teile | **K2** als Nebenursache für T-A (`entwurfGespeichert` → `rahmenBereit` rev 2) und T-B (`schrittBereit` → `abrufBeantwortet`), Beleg B-01. **K4 Navigation** für T-C (Firefox holt jeden Rahmen nach dem Neuladen zweimal, Rahmen-Probe 10/10, Spur 42376059543) – rot zuerst im Client (`html.ts`), Q-3. **K3** für T-C (`knopf()` liest im `frameLocator`) und T-D (Erwartung im `frameLocator` nach einer Navigation des Rahmens, Firefox, B-04/B-09). | offen |
| W050-T4 | `achsen-2b2:82` | **nötig, als K5** (nicht als Fehler der Komponente) | Plattform-Probe: macOS-WebKit `Tab` → `BODY`, `Alt+Tab` und `focus()` → `[part="control"]` (`tabIndex` 0); Chromium/Firefox `Tab` fokussiert; Linux-WebKit 11/11 grün; lokal 30/30 rot. Kein Rot-zuerst für `fm-markobutono` (kein Komponentenfehler). | offen |
| W050-T5 | Schlusslauf lokal (Test-Ticket): 30/30 nach D-13 (beide Stufen), ganze Eroj-Suite, Diff-Suche, `bericht.md` ohne CI | nötig | AC-4 bis AC-8 | offen |
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

### Befunde für die nächsten Tickets

- **T2 (erledigt, siehe oben):** Die Zeit steckt zu 82 % in `validateModeloFiles` (`packages/modelo`, tabu) und zu 10 % in `evaluateAlirebleco`; die Ableitung ist mit ≈ 100 ms klein. „Unter 1 s“ verlangt, diese Prüfregeln seltener oder mit wiederverwendeten Teilergebnissen zu rechnen, ohne `packages/modelo` zu ändern und byte-gleich – sonst Befund mit Werten (B-03).
- **T3:** Drei Teile: K2 bei T-A/T-B (`waitForResponse` vor der Aktion, Q-2), K4 Navigation bei T-C (rot zuerst: „nach dem Neuladen genau eine Navigation je Rahmen und `rev`“ – die Rahmen-Probe zählt in Firefox 2 Anfragen bei 1 Zuweisung; der Test muss die Anfragen bzw. Dokumente zählen, nicht nur die Zuweisungen), K3 bei T-C/T-D (vor jeder Erwartung oder Aktion im Rahmen den Zustand von der Seite aus lesen; nach B-04/B-09 hängt in Firefox gerade die **erste** Erwartung im `frameLocator` nach einer Navigation des Rahmens). **Neu (B-14):** in WebKit ist `dokument()` (`performance.timeOrigin`) keine feste Kennung (dasselbe Dokument +1 ms) – `seiteBereit(…, nicht)` hält dann die alte Seite für neu (T-A `:181`, Stufe (2) 4/30); dieselbe Hilfe tragen `geladen()` (T-C) und `zweitfarbe-036:163`. Für T-B ist K2 nur über die Klassenregel belegt, nicht über den Vergleich der Varianten (B-15).
- **T4:** K5; Weiche nach Plattform **und** Engine (Q-4), `toBeFocused` bleibt.
- **T5:** Dieselben Reihen und Stufen wie T1 (D-13, Befehle in `plan.md` › „Messanleitung“; Stufe (2) mit `s050-werkzeug/reihe-cpu.sh`), vor jeder Reihe 90 s ohne fremde Test-Prozesse anderer Arbeitsbäume (B-08). Lokal sind T-B/T-C/T-D schon vorher 30/30 – ihr Nachweis ist der Dispatch (AC-5).

### Commits

- `79a463bc` Spec 050 T1: cause per test (plan.md), before rates, measurement
- (Doku) Spec 050 T1: before rates complete (buehne-036, shard 2/4, CPU-limited)

## Geänderte Erwartungen älterer Tests (testing.md › „Extending tested pure functions“, AC-7)

Keine in T1 und T2 (T2 ändert keine Erwartung eines älteren Tests). T3/T4 tragen hier jede geänderte Erwartung mit Datei:Zeile, vorher/nachher und Grund ein.

| Datei:Zeile | vorher | nachher | Grund | Ticket |
|---|---|---|---|---|
