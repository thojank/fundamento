# Spec 016 – Agordilo Stufe 1 (Werkstatt) – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen je PR in **einer** Zeile der Messungen.

## ① Bibliothek

**Branch:** `261018-spec-016-agordilo-f027c6` (von `main` `7a05c6e`; am 2026-10-19 auf `main` @ `971354d` rebased – die Hashes unten sind die nach dem Rebase) · Aufgaben ① zählen ab T1601 (② ab T1701, ③ ab T1801).

### A – Rot zuerst
- [x] **T1601 Tests** Agordilo: `agordo.test.ts` (Agordo ohne `leitfarbe` → `schema-violation` an `agordo.json#/leitfarbe` mit Vorschlag; Name, Farbe, Regler, Tönung, unbekannte Zusatzfarbe an ihrem Pfad; `parseAgordoColor`), `calibration.test.ts` (Datei existiert, gleicht der Messung an komuna bytegenau), `derive.test.ts` (provo: zwei Läufe bytegleich, vollständiges Paket, jeder Token des Vortaro belegt, Herkunft, keine Verletzung, gleich der Fixture), `flava.test.ts` (helles Gelb: Verstoß mit Paar, Ursache und einem Vorschlag, Export ohne Jugxo verweigert, mit Jugxo genau ohne feste Verletzung erlaubt, Jugxo für feste Regel gesperrt); CLI `agordilo.test.ts`; Modelo: `RULE_IDS` 162, `AspektoFile.agordilo`, provo in `check:alirebleco`/`check:ikonaro`, Doku-Test ①, Workspace-Pin. Rot in `9429df9` (Agordilo 12 Tests in 4 Dateien, CLI 5 von 6, Modelo 6 in 5 Dateien).

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
- [x] **T1610 CI** grün (Lauf 39159638652), Hash des grünen Stands `cb68e97`.

### Messungen

| Was | Wert |
|---|---|
| Commits ① | rot `9429df9`, grün `4f80dcd`, Fix CI-Dauer `cb68e97` (Hash des grünen Stands, CI grün); dieser Eintrag im Folgecommit |
| Tests lokal | Agordilo 35 in 5 Dateien (≈ 10 s), CLI 72 (davon 6 Agordilo, ≈ 18 s allein), MCP 291, Projekcioj 670, Modelo 3 484 – alle grün; `pnpm turbo run test --filter=!@fundamento/eroj` 160 s. Im parallelen Lauf lief einmal `export/build.test.ts` („two runs of the export build“) über sein lokales Budget von 30 s (36,8 s; in der CI ×3) – ohne die Agordilo-Last grün; die Agordilo-Tests tragen ein eigenes Budget von 120 s für Test und Hook (ein `beforeAll` mit zwei Ableitungen lief unter Last über 10 s). `pnpm lint` grün (nur ältere Warnungen), `check:vortaro-lint`, `check:regularo`, `check:alirebleco` (3 Aspektoj, provo 0 Fehler), `check:clean-room`, `check:mankoj`, `check:ikonaro` (3 Aspektoj), `check:parity` (29 Eroj, 0 Differenzen), `pnpm perf` grün; `fm modelo validate --aspekto …/aspekto-provo` 0 Fehler, `fm agordilo check …/aspekto-provo` OK |
| Ableitung | provo: Paletten 85–93 ms (mit Aufbau des Struktur-Modelo), Ableitung mit allen Prüfungen 1,7 s (Validierung 1,07 s, Alirebleco 0,36 s); M2: zehn Ableitungen mit Prüfung 16,5 s |
| provo | 6 408 Paar-Auswertungen bestanden, 0 verletzt; 0 Verstöße; 108 Hinweise (APCA); `fm modelo validate --aspekto` 0 Fehler; `check:alirebleco` provo 0 fehlgeschlagene Auswertungen; `check:ikonaro` 3 Aspektoj |
| Paket provo | 24 Dateien; `raporto.json` 209 KB, `raporto.md` 54 KB |
| Nach dem Rebase auf `main` (2026-10-19) | ein Konflikt (Doku-Test: der Block 016 ① nach dem Block 015 ②); `provo` neu abgeleitet (B-12: nur `upload.svg` und die Herkunft in `aspekto.json`); lokal Agordilo 35, CLI 72, MCP 296, Projekcioj 688, Modelo 3 503 grün; Lint, `check:parity|regularo|vortaro-lint|mankoj|alirebleco|clean-room` ohne Fehler, `check:ikonaro` 17 Namen × 3 Aspektoj; CI auf den fünf Jobs in der Zeile danach |
| CI | Lauf 39158336356 (`4f80dcd`): Build/Test/Checks grün 12:39 (Test-Schritt 11:20), Eroj Shard 1 grün 8:36, Shard 2 rot 7:09 am Flake `sxvebilo.spec.ts:53` (auch auf `main`, B-11), neu gestartet und vom nächsten Lauf abgelöst, Rendered checks grün 5:21. Lauf 39159638652 (`cb68e97`): alle vier Jobs grün – Build/Test/Checks 12:58 (Test-Schritt 11:42, B-10), Eroj Shard 1 8:32, Shard 2 6:47, Rendered checks 7:49 |

## ② Werkstatt

Folgt in PR ②.

## ③ Gvidanto und Doku

Folgt in PR ③.
