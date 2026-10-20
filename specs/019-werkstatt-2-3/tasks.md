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

**Branch:** `261020-spec-019-werkstatt-116ba2` (gestapelt auf ①).

### A – Rot zuerst
- [x] **T1921 Tests** Agordilo `regler.test.ts` (zwölf Regler mit Gruppe, Label, Standard; Rücksetzen; Diff und Satz der Vorschlags-Leiste); Browser `vitrino.check.ts` (Gruppen als `fm-faldilo`, Regler mit Label, Wert, Rücksetzen; live an jedem Ero und auf der Entwurfsseite; Rücksetzen; Verlauf mit Knöpfen und Strg+Z; Vorschlags-Leiste; Schrift-Hinweis; G5 ohne Long Task über 50 ms im Worker; Browser = CLI für provo-kompakta; M5 statt M3); Doku-Test ②. Rot in `1e72db4` (Agordilo 5; im Browser M5 rot, die Suite bricht nach dem ersten Fehler ab).

### B – Grün
- [x] **T1922 Reglerliste** `regler.ts`, `GestaltBasis.types` (D-05, D-09).
- [x] **T1923 Panel** Gruppen, Regler, Rücksetzen, Icon-Gewicht, Schriftfelder, Verlauf, Vorschlags-Leiste (D-06–D-08).
- [x] **T1924 Live** Werte der Stufe 2 und Glyphen als Custom Properties am Root und auf der Entwurfsseite (D-05).
- [x] **T1925 G5** zwei klassische Worker aus dem Bündel, eine Anfrage unterwegs, ein Frame je Änderung, Schema beim Laden, Bericht schlank, `content-visibility` (D-01–D-04).

### C – Abschluss
- [x] **T1926 Doku** plan ② (D-01–D-09, Abweichungen 1–5, B-1–B-5, O-1–O-4, M5), tasks ②, README.
- [x] **T1927 CI** grün (Lauf 39350608447, `be843c5`).

### Messungen

| Was | Wert |
|---|---|
| Commits ② | rot `1e72db4`, grün `be843c5` (Hash des grünen Stands, CI grün); dieser Eintrag im Folgecommit |
| CI ② | Lauf 39350608447 (`be843c5`, alle acht Jobs grün, Wanduhr 8:14): `checks` 1:20, `unit` 5:57, `projekcioj` 3:32 / 3:10, `eroj` 2:06 / 1:44, `alirebleco-eroj` 5:03, `rendered-checks` 8:10 |
| M5 CI | Ableitung 90,1 / 120,0 ms, Prüfung 1 575,5 / 1 659,8 ms (Median / p95), längste Blockade 0 ms |
| Tests lokal | Agordilo 79, Projekcioj 730; `check:vitrino` 51 grün (davon 9 neu für Stufe 2); `pnpm lint` grün |
| M5 Mac | Ableitung 57,1 / 71,6 ms, Prüfung 1 042,0 / 1 092,3 ms (Median / p95), längste Blockade 0 ms |

## ③ Prompt (Stufe 3)

**Branch:** `261020-spec-019-prompt-116ba2` (gestapelt auf ②).

### A – Rot zuerst
- [x] **T1941 Tests** Agordilo `wunsch.test.ts` (Vokabular, Erkennen, Bewegen, Bereichsende, Farbton, Unbekanntes, Historie), `agordo.test.ts` (`historio`); MCP `e2e/s019-prompt.test.ts` (die vier Dialoge), `contracts.test.ts`, `server.test.ts`, `prompt.test.ts`; Modelo `ontologio.test.ts`, `docs.test.ts` (README 21 Werkzeuge, plan ③, Vojmapo). Rot in `91c33e3` (nach dem Rebase auf den CI-Eintrag von ②; vorher `5f01a59`).

### B – Grün
- [x] **T1942 Bibliothek** `wunsch.ts`, `readWuensche`, `data/wuensche.json` (D-01–D-03); Test der Leitplanke („ruhiger“ hält bei der Hälfte vor `contrast-reserve`).
- [x] **T1943 Modelo** Schema `AgordoHistorio`, `Agordo.historio`, Typen; `RULE_IDS` 163.
- [x] **T1944 MCP** `propose_agordo`, `save_agordo` mit Schemata, Annotationen (schreibend), Ablehnung über HTTP, `Served.workdir` (D-04, D-05).
- [x] **T1945 Prompt, Ontologio, README, Vojmapo** Regeln 16 und 17; Deziraro, Propono, Historio; „Die Marke per Prompt formen“.

### C – Abschluss
- [x] **T1946 Doku** plan ③ (D-01–D-06, Abweichungen 1–4, B-1–B-3, O-1–O-4, Messanleitung, Figma), tasks ③, Abschnitt ④.
- [x] **T1947 CI** grün (Lauf 39352817646, `6ba84cc`).

### Messungen

| Was | Wert |
|---|---|
| Commits ③ | rot `91c33e3`, grün `6ba84cc` (Hash des grünen Stands, CI grün; nach dem Rebase auf `f2f757e`, vorher `5f01a59`/`a611bc3`); dieser Eintrag im Folgecommit |
| CI ③ | Lauf 39352817646 (`6ba84cc`, alle acht Jobs grün, Wanduhr 8:05): `checks` 1:19, `unit` 5:56, `projekcioj` 3:21 / 3:47, `eroj` 2:26 / 2:10, `alirebleco-eroj` 5:06, `rendered-checks` 7:43 |
| „Mach provo ruhiger.“ | Kontrast 0,1 → 0,0, Sättigung 1,1 → 0,9, Schatten 1,0 → 0,7; 0 feste Verstöße, Export möglich |
| Leitplanke | „ruhiger“ von Kontrast 0 aus: angehalten bei 50 % vor `contrast-reserve`, 4 s |
| Tests lokal | Agordilo 93, MCP 323 (davon 11 in `s019-prompt.test.ts`), Modelo 3 601, CLI 72, Projekcioj 733 (darin `figma-provoj.test.ts`) – je Paket grün; `pnpm lint`, `pnpm perf` grün |

## ④ Nachlese 6

Eigener Branch von `main` (PR #86); Aufgaben T1961–T1967 in [`nachlese-6/tasks.md`](nachlese-6/tasks.md) (kommt mit #86), CI grün (Lauf 39346192486).
