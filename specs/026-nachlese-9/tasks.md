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
| Commits | rot `4735aa4`, grün `4894a09`; dieser Eintrag im Folgecommit |
| CI | PR #105, Lauf 39827200577 grün (13 Jobs), Wanduhr 13:59. Die fünf Paket-Läufer: `cli` 1:03 (Suite 38,7 s), `agordilo` 1:16, `metiejo` 1:40, `mcp` 2:31, `modelo` 3:24 – vorher ein Job mit 8 bis 9 min. **`derives provo twice` 14,1 s** (Budget 120 s; vorher 64 bis 126 s), **Export-Test 3,0 s** (Budget 30 s; vorher 11 bis 36 s), Paletten-Reguloj 7,6 s (geteilter Timeout 30 s; vorher 14 bis 32 s). Die Wanduhr bestimmte der Schritt „Playwright browsers“ der Eroj-Shards (492 s und 736 s, B-6), nicht ein Test |
| Lokal grün | Modelo 3 764, Agordilo 110, CLI 75, MCP 421, Metiejo 170, Projekcioj, Browser (Chromium), `pnpm perf`, Lint und alle `check:*` |
| Ein Prozess allein (hier) | Ableitung 2,1 s, Export 2,2 s / 0,88 GB (`main`: 2,0 s, 2,3 s / 1,25 GB); `rezolvoj.json` Repo 36 MB (72), ekzemplo 77 MB (152) |
