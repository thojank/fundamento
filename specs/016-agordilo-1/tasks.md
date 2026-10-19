# Spec 016 – Agordilo Stufe 1 (Werkstatt) – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen je PR in **einer** Zeile der Messungen.

## ① Bibliothek

**Branch:** `261018-spec-016-agordilo-f027c6` (von `main` `7a05c6e`; am 2026-10-19 auf `main` rebased, zuletzt auf `ef3c8db` (nach #78 und #79) – die Hashes unten sind die nach dem letzten Rebase) · Aufgaben ① zählen ab T1601 (② ab T1701, ③ ab T1801).

### A – Rot zuerst
- [x] **T1601 Tests** Agordilo: `agordo.test.ts` (Agordo ohne `leitfarbe` → `schema-violation` an `agordo.json#/leitfarbe` mit Vorschlag; Name, Farbe, Regler, Tönung, unbekannte Zusatzfarbe an ihrem Pfad; `parseAgordoColor`), `calibration.test.ts` (Datei existiert, gleicht der Messung an komuna bytegenau), `derive.test.ts` (provo: zwei Läufe bytegleich, vollständiges Paket, jeder Token des Vortaro belegt, Herkunft, keine Verletzung, gleich der Fixture), `flava.test.ts` (helles Gelb: Verstoß mit Paar, Ursache und einem Vorschlag, Export ohne Jugxo verweigert, mit Jugxo genau ohne feste Verletzung erlaubt, Jugxo für feste Regel gesperrt); CLI `agordilo.test.ts`; Modelo: `RULE_IDS` 162, `AspektoFile.agordilo`, provo in `check:alirebleco`/`check:ikonaro`, Doku-Test ①, Workspace-Pin. Rot in `a8ac6d9` (Agordilo 12 Tests in 4 Dateien, CLI 5 von 6, Modelo 6 in 5 Dateien).

### B – Grün
- [x] **T1602 Modelo** Schema (`Agordo`, `AgordoColor`, `AgordoJugxo`, `AspektoAgordilo`, `AspektoFile.agordilo`), Typen generiert, `SCHEMA_DEFS.agordo`, `documentSchemaIssues`, `color.ts` (+4 Funktionen), `RULE_IDS` +2, `KNOWN_ASPEKTO_FIXTURES` += provo, Kommentar `fixedUlidSource` (D-01–D-03).
- [x] **T1603 Agordo und Kalibrierung** `agordo.ts`, `calibration.ts`, `data/calibration.json`, `node/calibrate-cli.ts` (D-02, D-04).
- [x] **T1604 Ableitung** `solve.ts`, `palettes.ts` (Ton zuerst, Standardtöne, Regler mit Böden) (D-05–D-07).
- [x] **T1605 Paket, Prüfung, Raporto** `ids.ts`, `package.ts`, `check.ts`, `explain.ts`, `raporto.ts`, `derive.ts`, `node/structure.ts`, `node/package-dir.ts` (D-08–D-12).
- [x] **T1606 CLI** `fm agordilo derive|check` (D-13).
- [x] **T1607 provo** Agordo, Konfiguration, abgeleitetes Paket als Fixture (D-14); Regler `kontrast` 0,2 → 0,1 gegenüber dem roten Stand (mit 0,2 standen `palette-aligned` an `accent.700/800` knapp über 0,02).
- [x] **T1608 Messungen** `mezuroj.ts`, `node/mezuroj-cli.ts` (M1, M2).

### C – Abschluss
- [x] **T1609 Doku** plan ①, tasks ①, README (CLI, Pakete, Aspekto-Pakete).
- [x] **T1610 CI** grün (Lauf 39159638652), Hash des grünen Stands `b551108`.

### Messungen

| Was | Wert |
|---|---|
| Commits ① | rot `a8ac6d9`, grün `ca5e049`, Fix CI-Dauer `b551108` (Hash des grünen Stands, CI grün); dieser Eintrag im Folgecommit |
| Tests lokal | Agordilo 35 in 5 Dateien (≈ 10 s), CLI 72 (davon 6 Agordilo, ≈ 18 s allein), MCP 291, Projekcioj 670, Modelo 3 484 – alle grün; `pnpm turbo run test --filter=!@fundamento/eroj` 160 s. Im parallelen Lauf lief einmal `export/build.test.ts` („two runs of the export build“) über sein lokales Budget von 30 s (36,8 s; in der CI ×3) – ohne die Agordilo-Last grün; die Agordilo-Tests tragen ein eigenes Budget von 120 s für Test und Hook (ein `beforeAll` mit zwei Ableitungen lief unter Last über 10 s). `pnpm lint` grün (nur ältere Warnungen), `check:vortaro-lint`, `check:regularo`, `check:alirebleco` (3 Aspektoj, provo 0 Fehler), `check:clean-room`, `check:mankoj`, `check:ikonaro` (3 Aspektoj), `check:parity` (29 Eroj, 0 Differenzen), `pnpm perf` grün; `fm modelo validate --aspekto …/aspekto-provo` 0 Fehler, `fm agordilo check …/aspekto-provo` OK |
| Ableitung | provo: Paletten 85–93 ms (mit Aufbau des Struktur-Modelo), Ableitung mit allen Prüfungen 1,7 s (Validierung 1,07 s, Alirebleco 0,36 s); M2: zehn Ableitungen mit Prüfung 16,5 s |
| provo | 6 408 Paar-Auswertungen bestanden, 0 verletzt; 0 Verstöße; 108 Hinweise (APCA); `fm modelo validate --aspekto` 0 Fehler; `check:alirebleco` provo 0 fehlgeschlagene Auswertungen; `check:ikonaro` 3 Aspektoj |
| Paket provo | 24 Dateien; `raporto.json` 209 KB, `raporto.md` 54 KB |
| Nach dem Rebase auf `main` (2026-10-19) | ein Konflikt (Doku-Test: der Block 016 ① nach dem Block 015 ②); `provo` neu abgeleitet (B-12: nur `upload.svg` und die Herkunft in `aspekto.json`); lokal Agordilo 35, CLI 72, MCP 296, Projekcioj 688, Modelo 3 503 grün; Lint, `check:parity|regularo|vortaro-lint|mankoj|alirebleco|clean-room` ohne Fehler, `check:ikonaro` 17 Namen × 3 Aspektoj; CI auf den fünf Jobs in der Zeile danach |
| CI (fünf Jobs, nach dem Rebase) | Lauf 39229106557 (`03d5e7b`, alle sieben Jobs grün, Wanduhr 7:18): `checks` 1:20, `unit` 3:53 (mit der Agordilo-Suite), `projekcioj` 7:18 / 0:46, `eroj` 2:22 / 2:07, `rendered-checks` 5:19 – B-10 erledigt (vorher Build-Job 12:58–13:35); grüner Stand `03d5e7b` |
| Rebase auf `main` nach #78/#79 (`ef3c8db`, 2026-10-19) | ohne Konflikt; `provo` unverändert (kein neuer Ikonaro-Name, `check:ikonaro` 17 Namen × 3 Aspektoj). Lokal: Agordilo 35, CLI 72, MCP 307, Projekcioj 716, Modelo 3 559 grün (`export/build.test.ts` „building twice is byte-identical“ lief im parallelen Gesamtlauf auf zehn Kernen in die 30-s-Grenze, allein in 3 s grün – Last, kein Befund am Code); Lint und alle Modelo-Checks ohne Fehler; CI in der Zeile danach |
| CI | Lauf 39158336356 (`ca5e049`): Build/Test/Checks grün 12:39 (Test-Schritt 11:20), Eroj Shard 1 grün 8:36, Shard 2 rot 7:09 am Flake `sxvebilo.spec.ts:53` (auch auf `main`, B-11), neu gestartet und vom nächsten Lauf abgelöst, Rendered checks grün 5:21. Lauf 39159638652 (`b551108`): alle vier Jobs grün – Build/Test/Checks 12:58 (Test-Schritt 11:42, B-10), Eroj Shard 1 8:32, Shard 2 6:47, Rendered checks 7:49 |

## ② Werkstatt

**Branch:** `261019-spec-016-werkstatt-197e67` (von `main` `8ac1934`) · Aufgaben ② zählen ab T1701.

### A – Rot zuerst
- [x] **T1701 Tests** Agordilo: `browser.test.ts` (Einstieg ohne node-Kante, Export des Pakets), `ziele.test.ts` (Ziel je Stufe gelesen, markiert, Böden, Raporto und Patch), `flava.test.ts` (Vorschlag als Patch `apply`); Modelo: `provided-schemas.test.ts`; Projekcioj: `vitrino.test.ts` (Modus-Schalter, Insel `fm-werkstatt` ohne Maschinenpfad, Bündel ohne node-Import, keine eigene Farbe); Eroj: `vitrino.check.ts` (Werkstatt: Modus und Fragment, Panel aus Eroj, Live-Ableitung, Gelb-Fall, Jugxo, Paletten mit Ziel, Gegenüberstellung, Fragment, Gleichheit Browser–CLI, M3, Tastatur und Live-Region, axe ×4); Doku-Test plan ②/tasks ②. Rot in `fa77de1`.

### B – Grün
- [x] **T1702 Modelo** Schema `AgordoZieloj` (`Agordo.ziele`), Typen generiert, `provideModeloSchemas` (D-03, D-09).
- [x] **T1703 Agordilo** `ziele` in `palettes.ts` (`floored`, `overridden`), `apply` in `explain.ts`/`raporto.ts`/`check.ts`, `browser.ts` und Export `./browser`, `referenceStructureFiles`, `fingerprintDocuments` (D-02, D-08, D-09).
- [x] **T1704 Vitrino-Celo** `CeloInput.files`, `werkstattDatumoj`, Insel und Bündel in `html.ts`, Modus und Fragment-API in `skripto.ts`, `werkstatt-bundle.ts` (Vite, node-Stubs) (D-01–D-03, D-10).
- [x] **T1705 Werkstatt-Modul** `werkstatt.ts`: Panel, Live-Ableitung, entprellte Prüfung, Bericht, Paletten, Export und Jugxo, Gegenüberstellung, Fragment, `fmWerkstatt.measure` (D-04–D-13).

### C – Abschluss
- [x] **T1706 Doku** plan ②, tasks ②, README (Werkstatt).
- [x] **T1707 CI** grün (Lauf 39310455722); Hash des grünen Stands `7c1828d` in der Zeile der Messungen.

### Messungen

| Was | Wert |
|---|---|
| Commits ② | rot `fa77de1`, grün `7c1828d` (Hash des grünen Stands, CI grün); dieser Eintrag im Folgecommit |
| Tests lokal | Agordilo 42, CLI 72, MCP 312, Projekcioj 727, Modelo 3 591 grün; `check:vitrino` 43 (davon 13 Werkstatt) und `check:bazo` grün (Chromium); `pnpm lint` ohne neue Befunde; `check:vortaro-lint|parity|regularo|mankoj|alirebleco|clean-room|ikonaro` ohne Fehler; `pnpm perf` grün (`fm projekcioj build` 2,0–2,6 s, Budget 10 s) |
| M3 | Mac (Chromium headless): Ableitung Median 46,5 ms, p95 64,4 ms; Prüfung Median 1 053,9 ms, p95 1 087,5 ms; beides Median 1 099,2 ms, p95 1 134,8 ms (Tabelle in plan ②) |
| Gleichheit Browser–CLI | provo: Raporto der Werkstatt gleich `raporto.json` der Fixture, Wert für Wert (Test „browser and CLI agree on provo“) |
| Vitrino | 8,1 MB statt 6,1 MB (Bündel 1,26 MB, Insel 0,69 MB) |
| CI | Lauf 39310455722 (`7c1828d`, alle acht Jobs grün, Wanduhr 6:57): `checks` 1:24, `unit` 5:47, `projekcioj` 3:26 / 3:14, `eroj` 2:16 / 2:04, `alirebleco-eroj` 3:51, `rendered-checks` 6:43 (mit den 13 Werkstatt-Tests); M3 im CI-Browser: Ableitung Median 68,1 ms, p95 104,7 ms; Prüfung Median 1 373,3 ms, p95 1 433,6 ms |

## ③ Gvidanto und Doku

**Branch:** `261019-spec-016-gvidanto-197e67` (gestapelt auf ②) · Aufgaben ③ zählen ab T1801.

### A – Rot zuerst
- [x] **T1801 Tests** MCP: `e2e/s016-agordo.test.ts` (Beispiel-Dialog #F5C400: Verstoß mit Wert, dunklere Leitfarbe, Kialo; gleich dem Raporto; Paletten kurz; Vorschlag angewandt ohne Verstoß; Fehler an der Agordo), `contracts.test.ts`, `prompt.test.ts`; Modelo: `ontologio.test.ts` (Agordo, Raporto), Doku-Test ③ und Pin 19 Werkzeuge; Projekcioj: `figma-provo.test.ts`. Rot in `5b2589c`.

### B – Grün
- [x] **T1802 `preview_agordo`** Schema (Ein-/Ausgabe), `TOOL_NAMES`, Werkzeug in `tools.ts`, Abhängigkeit `@fundamento/agordilo`, Prompt Regel 15 (D-01, D-02, D-04).
- [x] **T1803 Ontologio** Agordo und Raporto im Schema `laboro`.
- [x] **T1804 Figma mit provo** `fundamento.tri.config.json` (D-03).
- [x] **T1805 Doku** README („Eine Marke in fünf Minuten“, MCP), Vojmapo (Phase 7, Reihenfolge, alter Stand), plan ③ mit Messanleitung, tasks ③.

### C – Abschluss
- [x] **T1806 CI** grün (Lauf 39312697601); Hash des grünen Stands `d7303a9` in der Zeile der Messungen.

### Messungen

| Was | Wert |
|---|---|
| Commits ③ | rot `5b2589c`, grün `d7303a9` (Hash des grünen Stands, CI grün); dieser Eintrag im Folgecommit |
| Tests lokal | Agordilo 42, MCP 322 (davon 7 `preview_agordo`), CLI 72, Modelo 3 595, Projekcioj 730 grün; `pnpm lint` ohne neue Befunde; `check:vortaro-lint|parity|regularo|mankoj|alirebleco|clean-room|ikonaro` ohne Fehler; `pnpm perf` grün; ein Nachlese-3-Test zählte die Begriffe von `laboro` (9 → 11) |
| Dialog | `preview_agordo` #F5C400: Leitfarbe 1,64:1 auf Weiß; `palette-aligned` an `accent.900` (0,021 > 0,02), Vorschlag `#665000`, Kialo aus `reguloj.json`; mit `#665000` kein Verstoß |
| CI | Lauf 39312697601 (`d7303a9`, alle acht Jobs grün, Wanduhr 8:54): `checks` 1:32, `unit` 3:43, `projekcioj` 3:30 / 2:28, `eroj` 2:55 / 1:52, `alirebleco-eroj` 4:50, `rendered-checks` 8:51 |
