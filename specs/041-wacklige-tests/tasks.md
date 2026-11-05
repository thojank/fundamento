# Spec 041 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `c66ed99f`. Höchstens acht Tickets (Spec, „Tickets“). Rote Commits enden auf „(rot)“, grüne auf „(grün)“; Doku-Commits beginnen mit „Spec 041:“ und sind einzeln (D-12). Häkchen mit SHAs.

Drei Spuren auf getrennten Dateien (D-08): A1 (T2 → T1 → T3, als einzige mit lokalem Playwright), A2 (T4, nur CI) und B (T5, nur CI). T6 führt zusammen.

| Ticket | Inhalt | PR | Spur | Dateien | Stand | rot → grün |
|---|---|---|---|---|---|---|
| T1 | B-13, B-10, B-12: Bühne (WebKit) und `ECONNRESET` (D-01) | A | A1 | `packages/eroj/test/buehne-036.spec.ts`, `metiejo-036-uebernahme.spec.ts`, `wackler-040.ts`, `wackler-040.test.ts` | offen | |
| T2 | Gerüst Spec 041; B-8: `stato`-Abruf beim Entladen beenden | A | A1 | `specs/041-wacklige-tests/{spec,plan,tasks}.md`, `packages/metiejo/src/html.ts`, `packages/eroj/test/stato-041.spec.ts` (neu) | erledigt | Gerüst `c7cbcd66`; B-8 `bd193cad`, `36a85b02` → `7e0ff9ec` |
| T3 | B-9 und B-15: Vorschau-Rahmen folgt der neuen `rev` in allen Browsern (D-02) | A | A1 | `packages/eroj/test/studio-035.spec.ts`; `wackler-040.ts` erst nach T1 | offen | |
| T4 | B-14: M5-Regression in der Werkstatt finden und beheben (D-04, D-09) | A (über T6) | A2 | `packages/projekcioj/src/celoj/vitrino/**`; Wegwerf-Refs `s041-m5-*` | offen | |
| T5 | I-1: Playwright-Browser und Systempakete aus dem Actions-Cache (D-03, D-05, D-06) | B | B | `.github/workflows/ci.yml`, `packages/modelo/src/ci/workflow.test.ts` | offen | |
| T6 | Zusammenführen, Doku-Test, Messung, PRs, Bericht | A und B | – | `packages/modelo/src/docs/docs.test.ts`, Pins für `M5_GRENZE_MS` und das Intervall, `specs/041-wacklige-tests/{plan,tasks}.md` | offen | |

## T2 im Einzelnen

- [x] G-0: Quelle und Kopie `3c006222b752d8921102bd1e6e787d5c072529a395cc24450cd433390003ec3f`, kopiert mit `cp` – `c7cbcd66`.
- [x] `pnpm check:privat` grün mit der Kopie (4154 Dateien, 0 Treffer).
- [x] B-8 roter Nachweis: CI-Spur 41920898257 (Versuch 1 `testberichte-eroj-3-1`, Versuch 2 `testberichte-eroj-4-2`) und neue Spec `packages/eroj/test/stato-041.spec.ts` lokal rot – `bd193cad` (Neuladen, pagehide/pageshow), `36a85b02` (beforeunload, D-13).
- [x] B-8 Fix in `packages/metiejo/src/html.ts`: Abfrage bei `beforeunload` abbrechen (D-13), bei `pagehide` zusätzlich Intervall beenden, bei `pageshow` mit `persisted` genau einmal fortsetzen; 3000 ms unverändert – `7e0ff9ec`.
- [x] B-8 grün in Chromium, Firefox und WebKit, nacheinander, je `--repeat-each=10 --workers=4`: 30/30, 30/30, 30/30.
- [x] `pnpm lint` grün; `pnpm test:betroffen` zweimal rot nur an Zeitüberschreitungen unter der eigenen Last (B-7 aus Spec 040: `cli` `index.test.ts:343` 30 000 ms, allein grün in 14,1 s; `modelo` `turbo-inputs.test.ts` Hook 10 000 ms); dieselben sechs Pakete danach nacheinander (`--concurrency=1 --continue`): 14 von 15 Aufgaben grün, Eroj-Playwright 1911 bestanden, 1 rot (N-1, ohne Bezug zu T2), Eroj-Vitest 18/18.

## T1, T3 bis T6 im Einzelnen

- [ ] T1: B-13, B-10, B-12.
- [ ] T3: B-9, B-15.
- [ ] T4: B-14.
- [ ] T5: I-1.
- [ ] T6: Zusammenführen, Tests, Messung, PRs, Bericht.
