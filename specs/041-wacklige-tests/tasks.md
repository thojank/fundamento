# Spec 041 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `c66ed99f`. Höchstens acht Tickets (Spec, „Tickets“). Rote Commits enden auf „(rot)“, grüne auf „(grün)“; Doku-Commits beginnen mit „Spec 041:“ und sind einzeln (D-12). Häkchen mit SHAs.

Drei Spuren auf getrennten Dateien (D-08): A1 (T2 → T1 → T3, als einzige mit lokalem Playwright), A2 (T4, nur CI) und B (T5, nur CI). T6 führt zusammen.

| Ticket | Inhalt | PR | Spur | Dateien | Stand | rot → grün |
|---|---|---|---|---|---|---|
| T1 | B-13, B-10, B-12: Bühne (WebKit) und `ECONNRESET` (D-01) | A | A1 | `packages/eroj/test/buehne-036.spec.ts`, `metiejo-036-uebernahme.spec.ts`, `wackler-040.ts`, `wackler-040.test.ts` | erledigt (B-12 Bühne behoben; B-10, B-13, B-12 Übernahme offen mit Spur) | B-12: `0bede97b` → `8cb97cc0`; Bühne-POSTs: Lauf → `888ea97a` |
| T2 | Gerüst Spec 041; B-8: `stato`-Abruf beim Entladen beenden | A | A1 | `specs/041-wacklige-tests/{spec,plan,tasks}.md`, `packages/metiejo/src/html.ts`, `packages/eroj/test/stato-041.spec.ts` (neu) | erledigt (N-2 nachgebessert) | Gerüst `c7cbcd66`; B-8 `bd193cad`, `36a85b02` → `7e0ff9ec`; N-2 `24f2b273` → `178ed2a9` |
| T3 | B-9 und B-15: Vorschau-Rahmen folgt der neuen `rev` in allen Browsern (D-02); dazu N-2 (B-8) | A | A1 | `packages/eroj/test/studio-035.spec.ts`; N-2: `packages/metiejo/src/html.ts`, `packages/eroj/test/stato-041.spec.ts` | erledigt | B-9/B-15: Lauf (10/30) → `78ad9ae6`; N-2: `24f2b273` → `178ed2a9` |
| T4 | B-14: M5-Regression in der Werkstatt finden und beheben (D-04, D-09) | A (über T6) | A2 | `packages/projekcioj/src/celoj/vitrino/**`; Wegwerf-Refs `s041-m5-*` | beendet ohne Fix (kein schuldiger Commit, B-14 offen, D-23 bis D-26); kein Commit, Arbeitsbranch entfernt | – (rot: C-2 auf 41971724414, 41971858056, 41973572877) |
| T5 | I-1: Playwright-Browser und Systempakete aus dem Actions-Cache (D-03, D-05, D-06) | B | B | `.github/workflows/ci.yml`, `packages/modelo/src/ci/workflow.test.ts` | erledigt (Treffer ohne Spiegel; Fehlschlag wie heute, D-22) | `8d84c30c` → `b3c130b9`; Treffer-Pfad `debcf62a` → `b9cde42f` |
| T6 | Zusammenführen, Doku-Test, Messung, PRs, Bericht | A und B | – | `packages/modelo/src/docs/docs.test.ts`, `packages/eroj/test/m5-041.test.ts`, `packages/metiejo/src/stato-041.test.ts`, `specs/041-wacklige-tests/{plan,tasks}.md` | erledigt (PR A #148, PR B #147, je drei Läufe, Bericht) | `7a9e0d6a` → `008bef5a`; Doku „Spec 041: Messung und Bericht“ |

## T2 im Einzelnen

- [x] G-0: Quelle und Kopie `3c006222b752d8921102bd1e6e787d5c072529a395cc24450cd433390003ec3f`, kopiert mit `cp` – `c7cbcd66`.
- [x] `pnpm check:privat` grün mit der Kopie (4154 Dateien, 0 Treffer).
- [x] B-8 roter Nachweis: CI-Spur 41920898257 (Versuch 1 `testberichte-eroj-3-1`, Versuch 2 `testberichte-eroj-4-2`) und neue Spec `packages/eroj/test/stato-041.spec.ts` lokal rot – `bd193cad` (Neuladen, pagehide/pageshow), `36a85b02` (beforeunload, D-13).
- [x] B-8 Fix in `packages/metiejo/src/html.ts`: Abfrage bei `beforeunload` abbrechen (D-13), bei `pagehide` zusätzlich Intervall beenden, bei `pageshow` mit `persisted` genau einmal fortsetzen; 3000 ms unverändert – `7e0ff9ec`.
- [x] B-8 grün in Chromium, Firefox und WebKit, nacheinander, je `--repeat-each=10 --workers=4`: 30/30, 30/30, 30/30.
- [x] `pnpm lint` grün; `pnpm test:betroffen` zweimal rot nur an Zeitüberschreitungen unter der eigenen Last (B-7 aus Spec 040: `cli` `index.test.ts:343` 30 000 ms, allein grün in 14,1 s; `modelo` `turbo-inputs.test.ts` Hook 10 000 ms); dieselben sechs Pakete danach nacheinander (`--concurrency=1 --continue`): 14 von 15 Aufgaben grün, Eroj-Playwright 1911 bestanden, 1 rot (N-1, ohne Bezug zu T2), Eroj-Vitest 18/18.
- [x] Nachbesserung N-2 (im Lauf von T3, D-17): ab `beforeunload` startet kein Takt eine Abfrage, bis die Seite bleibt – rot `24f2b273` → grün `178ed2a9`; `stato-041.spec.ts` je Engine 30/30, WebKit Bühne 3.5 `--repeat-each=150 --workers=10` 150/150 ohne „access control checks“.

## T1, T3 bis T6 im Einzelnen

- [x] T1 Spuren gelesen: 41971858056, 41931882770 (Versuch 2), 41941052854, 41943148273, 41971724414, 41973572877 (alle Eroj-Artefakte nach `/tmp/s041-spur/t1/`, nur gelesen).
- [x] B-10 und B-13: gemeinsame Signatur in der Spur (im zweiten Dokument weder Eroj definiert noch `data-mt-bereit`), lokal in 610 WebKit-Läufen nicht nachgestellt; Ursache offen, kein Fix (D-11, Randfall).
- [x] B-12 Unit rot – `0bede97b`; `nachEinemReset` erkennt den Reset von Node-`fetch`, GET `buehne-036.spec.ts:324` gewickelt – `8cb97cc0`.
- [x] B-12 Bühne-POSTs: lokal 20/100 rot → `connection: close` (D-15) – `888ea97a`; grün WebKit 295/300 (5 × N-2), Chromium 60/60, Firefox 59/60 (N-4).
- [x] B-12 Übernahme: Reset am POST (D-16), nicht gewickelt, offen.
- [x] Neue Befunde N-2 (B-8-Rest, WebKit), N-3 (Portschema der Übernahme-Spec), N-4 (Firefox-Testzeit in 3.2).
- [x] `pnpm lint` grün (erster Lauf rot an einem Wettlauf von `eroj:lint` und `eroj:build`, die beide `generate.mjs` starten; zweiter grün); `pnpm test:betroffen` rot nur an `modelo` `turbo-inputs.test.ts:679` (Hook 10 000 ms unter eigener Last, wie bei T2); dieselben sechs Pakete nacheinander (`pnpm turbo run test --concurrency=1 --continue --filter=…`, drei Engines): 14 von 15 Aufgaben grün, Eroj-Vitest 23/23, Eroj-Playwright 1911 bestanden, 1 rot (N-1), 2 übersprungen. `pnpm check:privat` grün.
- [x] T3 Spuren gelesen: 41971724414 (`testberichte-eroj-3-1`), 41920898257 Versuch 2 (`testberichte-eroj-3-2`), 41931882770 Versuch 1 (`testberichte-eroj-3-1`), 42053971357 (`testberichte-eroj-3-1`, T5) nach `/tmp/s041-spur/t3/`, nur gelesen.
- [x] T3 rot lokal: Firefox 3.4 `--repeat-each=30 --workers=10` 10/30 (7 × Testzeit = B-9, 3 × `rev=1` = B-15); Zeitstrahl: in allen 10 lud die Seite `rev` 2 in beide Rahmen, Playwright meldete kein `framenavigated`.
- [x] T3 grün: 3.4 liest den Rahmen über `contentDocument` aus der Seite (D-18) – `78ad9ae6`; Firefox, Chromium, WebKit je `--repeat-each=90 --workers=10` 90/90.
- [x] T3 Teil 0: N-2 (B-8) behoben – `24f2b273` → `178ed2a9` (D-17).
- [x] T4 roter Nachweis: C-2 auf 41971724414, 41971858056, 41973572877: p90 51, 53, 55 ms.
- [x] T4 Bisektion: fünf Runden auf Wegwerf-Refs `s041-m5-runde-1` … `-5`, zwölf Stände, 87 Stichproben; kein schuldiger Commit (D-23); Diagnose per CDP-Trace auf `s041-m5-diagnose` (D-25). Alle Wegwerf-Refs gelöscht, `s041-m5-fix` nie angelegt.
- [ ] T4 Fix: keiner. B-14 offen, AC-6 offen; der Maintainer entscheidet (Bericht).
- [x] T5 roter Nachweis I-1: sieben 15-min-Abbrüche in 41920898257, 41931882770, 41936625983; 41943148273 „Fetched 114 MB in 13min 37s (140 kB/s)“.
- [x] T5 `workflow.test.ts` rot `8d84c30c` → `ci.yml` grün `b3c130b9`; Treffer-Pfad per `dpkg -i` rot `debcf62a` → grün `b9cde42f` (D-19).
- [x] T5 Prüfläufe: 42050500562 (Fehlschlag, speichert; I-1 nachgestellt), 42053971357 (14/14 Treffer, 0 Spiegel-`Get:`). Vitest 51/51, `pnpm lint`, `pnpm check:privat` grün.
- [x] T6 T4 und T5 in plan und tasks eingetragen, D-Einträge von T5 (dort D-13 bis D-16) als D-19 bis D-22 und von T4 (a bis d) als D-23 bis D-26 neu nummeriert; Worktree und Branch `261105-spec-041-m5` entfernt.
- [x] T6 Doku-Test und Pins rot `7a9e0d6a` (Befund-Zeilen B-14 und I-1 leer; Pins gegen 51/0.8/2999 und m5.ts 55/html.ts 2500 rot gesehen).
- [x] T6 lokale Prüfung auf `008bef5a`: `pnpm check:privat` grün, `pnpm lint` grün, `pnpm test:betroffen` rot nur an Zeitlimits unter Last (nordstelo), paketweise `--concurrency=1 --continue` 8 Pakete grün, Eroj 1910/1912 (N-1, N-5); B: `workflow.test.ts` 51/51.
- [x] T6 Basis: `origin/main` = `c66ed99f`, beide Branches enthalten es; keine gemeinsame Datei (`comm -12` leer).
- [x] T6 PRs: A https://github.com/thojank/fundamento/pull/148, B https://github.com/thojank/fundamento/pull/147, beide offen, kein Entwurf, MERGEABLE/CLEAN; CI grün (A nach einem R-8-Neustart für B-10).
- [x] T6 Messung: A 42079221475, 42085495161, 42087222996 (alle grün, zwei mit R-8 für I-1); B 42076935265, 42080252255 (rot, N-6), 42086157431 (grün mit R-8 für B-12); M5 p90 überall ≤ 50 ms.
- [x] T6 Diff-Suche (AC-3): nichts neu oder höher.
- [x] T6 Bericht in `plan.md` › Bericht; Wegwerf-Refs `s041-*`: keine mehr auf `origin`.
