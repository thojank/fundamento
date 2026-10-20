# Spec 019 – Werkstatt Stufe 2+3 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen je PR in **einer** Zeile der Messungen. Aufgaben ① zählen ab T1901, ② ab T1921, ③ ab T1941, ④ ab T1961.

## ① Bibliothek Stufe 2

**Branch:** `261020-spec-019-bibliothek-116ba2` (von `main` `ac5deb3`, nach #84).

### A – Rot zuerst
- [x] **T1901 Tests** Agordilo: `gestalt.test.ts` (die zehn Felder von G2 mit Bereichen und Standard, Standard der Skala aus der Struktur; Stufe 1 und ausgeschriebene Standards ändern keinen Token; jeder Regler auf seinem Raster; alle 3^8 Ecken über `size.target`, Rangfolge der Schriftrollen, `type-scale`, sichtbare Rahmen, Fokusring; Hinweise statt Reguloj), `stufe2.test.ts` (Stufe-1-Ableitung von provo bytegleich gegen `fixtures/stufe1-provo.json`, mit ausgeschriebenen Standards bytegleich bis auf die Herkunft; alle Regler an min und an max ohne festen Verstoß durch alle Prüfungen; Icon-Gewicht ohne vollständige Glyphen abgelehnt an `agordo#/ikono/gewicht`), `agordo.test.ts` (Schema-Grenzen der Stufe 2), `derive.test.ts` (provo rund, luftig, bold; provo-kompakta eckig, dicht, kleinere Schrift, light, Hinweis statt Verstoß, gleich der Fixture); Modelo: provo-kompakta in `check:alirebleco` und `check:ikonaro`, Doku-Test ① (`docs.test.ts`). Rot in `f126b65` (Agordilo 12 Tests in 4 Dateien rot und `gestalt.test.ts` beim Import; der Vergleich der Stufe-1-Agordo mit den Prüfsummen ist schon grün – er ist der Wächter der Kalibrierung).

### B – Grün
- [x] **T1902 Modelo** Schema `Agordo.form|raum|schrift|ikono`, Typen generiert, `KNOWN_ASPEKTO_FIXTURES` += provo-kompakta, Pin `check:ikonaro` 3 → 4 Aspektoj (D-02, D-15).
- [x] **T1903 Gestalt** `gestalt.ts`: `gestaltBasis`, `gestaltSliders`, `deriveGestalt`, `wholePxScale`, `gestaltTokens`, die drei Hinweise (D-01–D-11, D-13).
- [x] **T1904 Icon-Gewichte** `data/ikonoj/{thin,light,bold,fill,duotone}/` aus `@phosphor-icons/core` 2.1.1 mit `LICENSE` und `ikonoj.json`; `loadIkonoGewichte`, `Structure.ikonoGewichte`, `ikonoChoice` (D-12).
- [x] **T1905 Paket, Ableitung, Prüfung** `packageDocuments(…, gestalt)` (Haupt-Set, Dunkel-Konjunktions-Set, Glyphen), `derivationBasis` mit Gestalt und Agordo-Fehlern, `CheckInput.gestalt|agordoIssues`, `checkPackageDir` baut die Hinweise nach.
- [x] **T1906 Beispielmarken** provo neu abgeleitet (Radius, Abstand, bold), provo-kompakta neu mit Konfiguration und `fundamento.provoj.config.json` (D-15).
- [x] **T1907 M4** `measureM4`, `m4Agordos`, `seededRandom`, `mezuroj m4`; dabei `type-scale` in zwei Zufalls-Agordos gefunden und mit D-10 behoben (Test über 101 × 76 Werte dazu).
- [x] **T1908 Vitrino** die Insel `fm-werkstatt` trägt die Glyphen der Gewichte (Abweichung 8).

### C – Abschluss
- [x] **T1909 Doku** plan ① (D-01–D-15, Abweichungen 1–9, B-1–B-8, K-1–K-4, O-1–O-7, M4), tasks ①, README (Felder der Stufe 2, provo-kompakta).
- [x] **T1910 CI** grün (Lauf 39343610107, `3a3ee9f`).

### Messungen

| Was | Wert |
|---|---|
| Commits ① | rot `f126b65`, grün `3a3ee9f` (Hash des grünen Stands, CI grün); dieser Eintrag im Folgecommit |
| CI ① | Lauf 39343610107 (`3a3ee9f`, alle acht Jobs grün, Wanduhr 8:18): `checks` 1:21, `unit` 6:17, `projekcioj` 3:38 / 3:29, `eroj` 1:42 / 2:10, `alirebleco-eroj` 3:36, `rendered-checks` 8:15 |
| Tests lokal | Agordilo 74 in 9 Dateien, Modelo 3 598, Projekcioj 730, CLI 72, MCP 322 – je Paket allein grün; im parallelen Gesamtlauf auf diesem Rechner liefen drei ältere Tests (`export` AK-10, MCP „schema-conformant JSON“, Alirebleco provo) in ihre 30-s-Grenze, allein und in der CI grün (Last, wie Spec 016 ① B-10). `pnpm lint`, `check:vortaro-lint|regularo|mankoj|alirebleco|clean-room|ikonaro|parity|vitrino` grün |
| M4 | 44 Agordos mit Prüfung in 63,6 s (lokal); kein fester Verstoß aus der Stufe 2 (plan ① M4) |
| Eckwerte rein | 6 561 Ecken und 7 676 Rasterpunkte in `gestalt.test.ts` (≈ 7 s); `deriveGestalt` 0,075 ms |
| provo / provo-kompakta | je 6 408 von 6 408 Paar-Auswertungen, 0 Verstöße; provo 108 Hinweise (wie Stufe 1), provo-kompakta 135 (davon `agordilo-body-size` an `font.size.body.2`) |

## ② Werkstatt Stufe 2

Folgt in PR ②.

## ③ Prompt (Stufe 3)

Folgt in PR ③.

## ④ Nachlese 6

Eigener Branch von `main`; Aufgaben in [`nachlese-6/tasks.md`](nachlese-6/tasks.md). Folgt in PR ④.
