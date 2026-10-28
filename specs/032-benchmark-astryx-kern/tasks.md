# Spec 032 – Aufgaben

**Briefing:** [`briefing.md`](briefing.md) · **Plan:** [`plan.md`](plan.md) · **Branch:** `261024-astryx-benchmark-clean-room-pe-7d4571` (von `main` `d29a5206`, nach #109). Aufgaben ab T3201.

### A – Rot zuerst
- [x] **T3201 Tests** in fünf Dateien:
  - Modelo `src/checks/clean-room/benchmark-spuroj.test.ts` mit der Fixture `invalid/clean-room-benchmark-spuroj` (ein erfundener Benchmark in ihrem `research/`): die Listen beider Dateien mit Quelle und Zahl, falsche Zahl und fehlendes Ende, der Repo-Lauf ohne `--spuroj` mit 4 Listen und 0 Treffern, Schriftfamilie eines Benchmarks, triviale Werte als Daten mit Kialo, Zufallstreffer mit und ohne Jugxo.
  - Modelo `src/resolve/resolve.test.ts`: Auflösung mit Namen ohne Durchlauf über die Tokens eines Sets, in allen 144 Kombinationen.
  - MCP `src/e2e/perf.test.ts`: ein frischer Server, erster Aufruf `check_contrast` ohne Zuweisung unter 100 ms.
  - Doku-Test `src/docs/docs.test.ts`: Briefing und Datei von Astryx unverändert, plan und tasks.

  Rot in `c7c575a`:
  - Clean-Room: die Datei lädt nicht (`benchmark-spuroj.js` fehlt)
  - Auflösung: 1 (`core` 145-mal und zehn weitere Sets durchlaufen)
  - Doku: 2 (die Datei von Astryx und plan fehlen)
  - Perf: 1 (kalter erster Aufruf 721 ms bei Load ≈ 45, B-2; 216 ms im Prozess auf ruhiger Maschine)

### B – Grün
- [x] **T3202 Datei des Benchmarks** (①): `research/benchmark-astryx-2026-10.md` aus PR #1 (`a745aea`) unverändert, SHA-256 `ac9c6344…78f064c5`; nur diese Datei gelesen.
- [x] **T3203 Listen aus `research/`** (D-01): `benchmark-spuroj.ts` (Parser, `clean-room-spuroj-invalid`), Reihenfolge eigene Liste, Benchmark-Dateien, Konfiguration, `--spuroj`.
- [x] **T3204 Was nicht zählt** (D-02–D-05): Schriftfamilien eines Benchmarks; `trivialaj.json` mit Kialo und `trivialaj.ts`, Deckkraft am Hex-Kandidaten; `hazardaj-trafoj.json`, `hazardaj.ts` mit `clean-room-jugxo-missing`; Jugxo `jug_01M5PTA0PQY9P362JAVW9VP96G` (ID über `pnpm id:new jugxo`); Stats und Zusammenfassung. Nachgezogen: Fixture und Test der Spec 004 (`clean-room-fremda-spuro`, die Schrift zählt nicht mehr), Zahl der Quellen im Repo-Lauf (1 → 4), Regelkatalog (181 → 183).
- [x] **T3205 CI** (② 5): Kommentar am Schritt „Check: Clean-Room“; der Schritt bleibt `pnpm check:clean-room` und liest die Listen selbst.
- [x] **T3206 `perf`** (D-06): `namedOverlayOf` in `resolve.ts`, `OverlayLookup` in `bind.ts`.
- [x] **T3207a Entscheidungen** (2026-10-24): E-1 bis E-4 in plan; `nula` um Längen von 0 ergänzt (Test zuerst rot, dann `trivialaj.json`); Kialo von `lineara-kurbo` mit der Bestätigung.
- [x] **T3207 Fonto-Ausnahme** (② 4, E-1, 2026-10-28): auf `main` `7d049b5` (nach #111) neu aufgesetzt. Rot `d827de4`: der Repo-Lauf mit 83 Treffern (4 Tests), die neue Testdatei lädt nicht (`fonto-listoj.json` fehlt), Doku 1. Grün: `fonto-listoj.json` mit Kialo, `fonto-listoj.ts`, Filter in `index.ts` (andere Listen zählen weiter), Fixture `invalid/clean-room-fonto-listo`; 0 Treffer. Beim Rebase den Block „Nachlese 11“ im Doku-Test wiederhergestellt (die automatische Auflösung hatte ihn mit dem von Spec 032 verschränkt). Regelkatalog 190 → 192.

### C – Abschluss
- [x] **T3208 Doku:** plan (Ursachen, D-01–D-06, Abweichungen 1–3, B-1–B-3, O-1–O-5, Messungen, Messanleitung), tasks, Vojmapo, README.
- [x] **T3209 Messungen:** in plan; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `c7c575a`, grün im Folgecommit (Hash im PR) |
| Rot gemessen | Clean-Room 1 Datei (lädt nicht), Auflösung 1, Doku 2, Perf 1 |
| Grün gemessen | Modelo 176 Dateien / 3822 Tests; MCP 45 / 436; `pnpm perf` fünfmal nacheinander grün (kalter erster `check_contrast` Median 16,1 ms, Maximum 35,0 ms); `check:clean-room` 0 Fehler mit 4 Listen; Lint sauber |
| Nachtrag 2026-10-28 (E-1, nach #111) | rot `d827de4` (Repo-Lauf 83 Treffer, 4 Tests; neue Testdatei lädt nicht; Doku 1); grün: Modelo 180 Dateien / 3858 Tests, MCP 46 / 442, `pnpm perf` grün (kalter erster `check_contrast` 15,5 ms, Start 1932 ms), `check:clean-room` 0 Fehler, Lint sauber |
