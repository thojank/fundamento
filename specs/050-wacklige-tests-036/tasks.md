# Spec 050 – Aufgaben (Wacklige Browser-Tests aus Spec 036 stabil machen)

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `de931e40` · **Branch:** `261112-wacklige-browser-tests--9197f6`

Sechs Tickets, ein Strang, streng nacheinander: `W050-T1 → W050-T2 → W050-T3 → W050-T4 → W050-T5 → (QA-Schleife) → W050-T6`. Commits lokal mit dem Präfix `Spec 050 T<n>: …` (Englisch). Gepusht wird nur in T6, genau einmal, vom Orchestrator. Jedes Ticket liest zuerst „Ursache je Test“ (V-1) in `plan.md` und schreibt seinen Stand dorthin zurück.

| Ticket | Inhalt | nötig? | Beleg | Stand |
|---|---|---|---|---|
| W050-T1 | Diagnose ohne Code: Artefakte, Zeitleisten, Messung, Vorher-Raten, Proben, V-1 | nötig | Auftrag | V-1, V-2, Proben erledigt (dieser Commit); V-3 teilweise **offen** (fremde Test-Last, B-08) |
| W050-T2 | Prüfung schneller (rot zuerst, byte-gleich) | **nötig** | V-1: T-A und T-B sind **K4 Prüfung** (erste `/pruefung` eines neuen `rev` lokal 1613 / 2434 ms ≥ 1 s; CI-Unit 1,5–2,8 s; im Eroj-Job ≥ 4,4 bis ≥ 11 s). Messung: Prüfregeln 94 %, `validateModeloFiles` (`packages/modelo`, tabu) 82 %, Ableitung ≈ 100 ms, die zwei `buildModelo` ≈ 16 ms (B-03). T-D ist **nicht** K4 (Prüfung in `festlegen`, Rahmen 1–3 ms). | offen |
| W050-T3 | Tests an der Ursache (K2, K3) und doppelte Navigation (K4) | **nötig**, alle drei Teile | **K2** als Nebenursache für T-A (`entwurfGespeichert` → `rahmenBereit` rev 2) und T-B (`schrittBereit` → `abrufBeantwortet`), Beleg B-01. **K4 Navigation** für T-C (Firefox holt jeden Rahmen nach dem Neuladen zweimal, Rahmen-Probe 10/10, Spur 42376059543) – rot zuerst im Client (`html.ts`), Q-3. **K3** für T-C (`knopf()` liest im `frameLocator`) und T-D (Erwartung im `frameLocator` nach einer Navigation des Rahmens, Firefox, B-04/B-09). | offen |
| W050-T4 | `achsen-2b2:82` | **nötig, als K5** (nicht als Fehler der Komponente) | Plattform-Probe: macOS-WebKit `Tab` → `BODY`, `Alt+Tab` und `focus()` → `[part="control"]` (`tabIndex` 0); Chromium/Firefox `Tab` fokussiert; Linux-WebKit 11/11 grün; lokal 30/30 rot. Kein Rot-zuerst für `fm-markobutono` (kein Komponentenfehler). | offen |
| W050-T5 | Schlusslauf lokal (Test-Ticket): 30/30 nach D-13 (beide Stufen), ganze Eroj-Suite, Diff-Suche, `bericht.md` ohne CI | nötig | AC-4 bis AC-8 | offen |
| W050-T6 | Ein Push, ein PR, genau ein `workflow_dispatch`, Bericht (Orchestrator, nach der QA-Schleife) | nötig | AC-5 | offen |

## W050-T1 im Einzelnen (Diagnose, kein Code)

- [x] **Artefakte zuerst gesichert** (Q-8, 19:20–19:24): 11 Läufe mit Eroj-Artefakten (#155-Dispatch, #158/#162/#163-Läufe, Pushes und `schedule` auf `main` bis zur Basis `de931e40`), je `testberichte-eroj-{1..4}-1` und `testberichte-unit-metiejo-1`, je Artefakt ein neuer leerer Ordner unter `…/s050-spur/`. Nichts abgelaufen; die `pull_request`-Läufe von #155/#158/#162 haben keine Eroj-Artefakte, weil ihre Eroj-Jobs nicht liefen (6–8 s). Tabelle in `plan.md` › „Gesichert“.
- [x] **Zeitleiste je Test** aus den Traces (`plan.md` › „Zeitleisten aus den CI-Traces“): T-A Rahmen rev 2 hinter der Prüfung, T-B `POST /pruefung` rev 1 unbeantwortet, T-C zwei Anfragen je Rahmen nach dem Neuladen und Kontext des Vorschlagsrahmens zerstört in `knopf`, T-D Erwartung im `frameLocator` ohne Ende ohne Anfrage im Weg, T-E in Linux-WebKit grün.
- [x] **Messung lokal in Ruhe** (V-2): `messung-044` auf `de931e40` (erste `/pruefung` 1613 / 2434 ms) und CPU-Profil der Prüfung (Ableitung ≈ 100 ms, Prüfregeln ≈ 1649 ms, davon `validateModeloFiles` 1429 ms). CI-Spalte aus den Traces und den `messung-044.json` des Unit-Jobs.
- [ ] **Vorher-Raten** (V-3, teilweise) nach D-13: Tabelle in `plan.md` › „30/30 vorher“. Gültig: `zweitfarbe-036` Stufe (1) (T-A Assistent Chromium 29/30, sonst 30/30) und `achsen-2b2` (T-E 0/30). Nur zur Information: `buehne-036` Stufe (1) (T-C 30/30 je Engine, T-D Firefox 29/30) wegen fremder Test-Last ab 20:40 (B-08). **Offen:** `buehne-vorher-2`, Shard 2/4, Stufe (2) für `zweitfarbe-036` (und ggf. `buehne-036`), Extra-Reihe mit Traces – Befehle in `plan.md` › „Messanleitung“, Reihen in „30/30 vorher“.
- [x] **Plattform-Probe T-E** (D-14) und **Rahmen-Probe T-C/T-D** (D-15), beide Wegwerf unter `/tmp/s050/probe-pw/` (Kopie `…/s050-werkzeug/`).
- [x] **V-1** nach den Klassenregeln (D-10): T-A, T-B K4 Prüfung (+K2, +K1); T-C K4 Navigation (+K3); T-D K3 (+K5, +K1); T-E K5.
- [x] `spec.md` mit `cp` aus `user-provided-product-spec-wacklige-tests-036.md`, SHA-256 `386f6db80c0e99edd5813b22b67d8481e59098ca96d48fdee3fdc7a329e3d8c5` (Quelle = Kopie, 16 031 Byte). Wird nicht editiert.
- [x] Kein Code geändert: `git diff de931e40 --name-only` zeigt nur `specs/050-wacklige-tests-036/{plan,spec,tasks}.md`. Kein Push, kein PR, kein Dispatch, kein Rerun.

### Befunde für die nächsten Tickets

- **T2:** Die Zeit steckt zu 82 % in `validateModeloFiles` (`packages/modelo`, tabu) und zu 10 % in `evaluateAlirebleco`; die Ableitung ist mit ≈ 100 ms klein. „Unter 1 s“ verlangt, diese Prüfregeln seltener oder mit wiederverwendeten Teilergebnissen zu rechnen, ohne `packages/modelo` zu ändern und byte-gleich – sonst Befund mit Werten (B-03).
- **T3:** Drei Teile: K2 bei T-A/T-B (`waitForResponse` vor der Aktion, Q-2), K4 Navigation bei T-C (rot zuerst: „nach dem Neuladen genau eine Navigation je Rahmen und `rev`“ – die Rahmen-Probe zählt in Firefox 2 Anfragen bei 1 Zuweisung; der Test muss die Anfragen bzw. Dokumente zählen, nicht nur die Zuweisungen), K3 bei T-C/T-D (vor jeder Erwartung oder Aktion im Rahmen den Zustand von der Seite aus lesen; nach B-04/B-09 hängt in Firefox gerade die **erste** Erwartung im `frameLocator` nach einer Navigation des Rahmens).
- **T4:** K5; Weiche nach Plattform **und** Engine (Q-4), `toBeFocused` bleibt.
- **T5:** Dieselben Stufen wie T1 (D-13), und vor jeder Reihe 90 s ohne fremde Test-Prozesse anderer Arbeitsbäume (B-08).

### Commits

- (dieser Commit) `Spec 050 T1: cause per test (plan.md), before rates, measurement`

## Geänderte Erwartungen älterer Tests (testing.md › „Extending tested pure functions“, AC-7)

Keine in T1. T3/T4 tragen hier jede geänderte Erwartung mit Datei:Zeile, vorher/nachher und Grund ein.

| Datei:Zeile | vorher | nachher | Grund | Ticket |
|---|---|---|---|---|
