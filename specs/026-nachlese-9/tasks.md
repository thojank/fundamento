# Nachlese 9 „Tempo“ – Aufgaben

**Branch:** `261022-nachlese-9-tempo-33c3e0` (von `main` `b06ad3f`).

### A – Ursache und rot zuerst
- [x] **T901 Messen** ein Prozess allein auf O-1 (`8892b28`), `main` und Spec 025 ③ (Ableitung, Export, Validierung, RSS, Rezolvoj), CPU-Profil des Exports, 45 CI-Läufe des Unit-Jobs (Ableitungs-, Export- und Paletten-Test, Summe der Dateizeiten), die Last des Unit-Jobs nachgestellt (plan, Ursache).
- [x] **T902 Tests** `export-modelo.test.ts` (die dritte Ebene als Verweis, verlustfreie Rückrechnung über jede Kombination, `rezolvoTokenOf`, eigener Wert bleibt ganz, Verweis auf einen Verweis), `workflow.test.ts` (Matrix je Paket, jedes Paket mit Tests hat einen Platz), Export-Test wieder 30 s, Doku-Test. Rot in `4735aa4`.

### B – Grün
- [x] **T903 Modelo** `buildRezolvojJson` schreibt Verweise; `RezolvojJson`, `RezolvojEntry`, `RezolvoAlias`, `isRezolvoAlias`, `rezolvoTokenOf`, `expandRezolvo`; der e2e-Test der Rezolvoj folgt den Verweisen.
- [x] **T904 Projekcioj** `celoInputOf` folgt den Verweisen beim Einlesen; `CeloInput.rezolvoj` sind ganze Rezolvoj.
- [x] **T905 CI** der Job `unit` als Matrix über `agordilo`, `cli`, `mcp`, `metiejo`, `modelo`.
- [x] **T906 Doku** briefing, plan, tasks, Vojmapo, README.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `4735aa4`; grün und CI im Folgecommit |
| Ein Prozess allein (hier) | Ableitung 2,1 s, Export 2,2 s / 0,88 GB (`main`: 2,0 s, 2,3 s / 1,25 GB); `rezolvoj.json` Repo 36 MB (72), ekzemplo 77 MB (152) |
