# Spec 038 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Bezug vorher:** `main` `e4873c57` (`e4873c577bc90e3138279346394e11d4154883ed`). Aufgaben ab T3801, je Teil in „A – Rot zuerst“, „B – Grün“, „C – Abschluss“. Rote Commits enden auf „(rot)“, grüne auf „(grün)“, Doku- und Wächter-Commits beginnen mit „Spec 038:“; Häkchen mit SHAs. In Klammern das Ticket, das die Aufgabe trägt. Lokal laufen Tests nur über `pnpm test:betroffen`.

## Lauf 1 – T0 und Teil 1 (PR A „Spec 038 – Gvidanto für Agenten“)

**Branch:** `261106-spec-038-lauf-1-pr-a-584c5e` (D-26, D-30).

### T0

- [x] **T3801 L-0 (S038-01)** Startbedingung geprüft (037, 036 Teil 1–6, 040, 041 gemergt und Vorfahren von `origin/main`; `pnpm check:privat` auf dem Bezugsstand grün), Bezug-SHA `e4873c57`, `/tmp/s038-bezug` gebaut, Werkzeuge `$W` (Selbsttest 103/103), `spec.md` byte-gleich (SHA-256 `dedf2760…c6c7`), plan und tasks, Generator `packages/mcp/test/kontrakto/generi.mjs`, Vertrags-Fixtures (114 Fälle, 20 Werkzeuge, D-37) und AC-8-Fixtures (nordstelo 12, ekranoj 8) vom Bezugsstand, zwei Generatorläufe byte-gleich, `git check-ignore` ohne Treffer, Wächter `packages/mcp/src/kontrakto-038.test.ts` grün auf unverändertem Produktcode, Fehlerprobe lokal gesehen. **Wächter, kein Produktcode** – kein Rot/Grün-Paar nötig (AC-L7). – `9dd63115` (Doku: spec, plan, tasks), `4fb5b12c` (Wächter: Generator, Fixtures, `kontrakto-038.test.ts`).

### A – Rot zuerst

- [x] **T3802 1.3, 1.4, 1.8a (S038-02)** Tests `get_ero` mit `fields` (Form, Reihenfolge, `fields: ["brief"]` ≡ `brief: true`, `role`, `navigation`, `slots`, `rest`), 750-Token-Sweep über alle Eroj × 15 Teilmengen und alle Sxablono-Kurzprofile, kampo-Fall, Negativfälle. – `0b89cd1f` (rot: `packages/modelo/src/gvidanto/eroj-fields.test.ts`, 17 von 20 rot über `pnpm test:betroffen`).
- [x] **T3803 1.5 (S038-03)** Tests `getSxablono(…, { marker: true })` und `markerOf`, Antworten ohne `marker` byte-gleich. – `6546736d` (rot: `packages/modelo/src/gvidanto/sxablonoj-marker.test.ts`, 7 von 10 rot über `pnpm test:betroffen`).
- [x] **T3804 1.1, 1.6 (S038-04)** Tests `listArangxoj` und `suggestEro` mit `nearest: true`. – `9bde008b` (rot: `packages/modelo/src/gvidanto/{arangxoj,suggest-ero-nearest}.test.ts`, 17 von 20 rot über `pnpm test:betroffen`).
- [x] **T3805 1.2, 1.5 (S038-05)** Tests Markup-Leser, Kern `instancojElElementoj`, `checkMarkup` (positiv, Regelverstoß, unbekannte Ero, Durchreichen der Ablehnung, leeres Fragment, Sxablono-Seite, Determinismus). – `508d1546` (rot: `packages/modelo/src/gvidanto/check-markup.test.ts`, 23 von 23 rot über `pnpm test:betroffen`).
- [ ] **T3806 1.7, 1.8 (S038-06)** Tests MCP: `list_arangxoj`, `check_markup`, `fields`, `marker`, `nearest`, Prompt, `TOOL_NAMES` (D-19: `contracts.test.ts`, `nachlese-11-anbieter.test.ts`, `ekranoj/src/mcp-kliento.test.ts`).
- [ ] **T3807 1.4, 1.8b, 1.8c (S038-07)** Tests AC-8 in nordstelo (K3, Regulo-Lücken, Urteil; neuer ekranoj-Weg gegen den echten Server, D-36), ekranoj Erkennung, Rückfall, ein Folgeaufruf bei `rest`, `navigation.target`.

### B – Grün

- [x] **T3808 1.3, 1.4, 1.8a (S038-02)** `fields`, `role`, `navigation`, `slots`, `rest` (D-28, D-31), eine Link-Ableitung. `ero-field-unknown`, `ero-fields-invalid` (D-S038-02-4). – `fd4babe2` (grün: `eroj-fields.test.ts` 20/20, `pnpm test:betroffen` 18/18, D-S038-02-6).
- [x] **T3809 1.5 (S038-03)** `marker` je Region (D-32), `markerOf`, `RegionMarker` (D-S038-03-1 bis -4). – `6ce53267` (grün: `sxablonoj-marker.test.ts` 10/10, `pnpm test:betroffen` 18/18, D-S038-03-5).
- [x] **T3810 1.1, 1.6 (S038-04)** `listArangxoj`, `ARANGXO_CELOJ`, `nearest` (D-33), `nearestGoals`, `NEAREST_GOALS` (D-S038-04-1 bis -7). – `2a0ee86d` (grün: `arangxoj.test.ts` 11/11, `suggest-ero-nearest.test.ts` 9/9, `pnpm test:betroffen` 18/18, D-S038-04-8).
- [x] **T3811 1.2, 1.5 (S038-05)** Leser (D-23), Kern (D-22), `checkMarkup` (D-29), `legiMarkon`, `GvidantoElemento` (D-S038-05-1 bis -5). – grün (SHA trägt S038-06 nach).
- [ ] **T3812 1.7, 1.8 (S038-06)** MCP-Werkzeuge, Schemas, Prompt-Sätze, `TOOL_NAMES` am Ende.
- [ ] **T3813 1.4, 1.8b, 1.8c (S038-07)** nordstelo K3 über den Kern (`instancesOf` entfällt), `faktojPorNavigado` (D-34), ekranoj `check_markup` mit Rückfall.

### C – Abschluss

- [ ] **T3814 (S038-08)** pnpm check: einmal, S038-08 (Ergebnis hier).
- [ ] **T3815 (S038-08)** `$W/pruefen --diff origin/main..HEAD`, `$W/audit-ac4`, Tabu-Diff, `pnpm check:privat`, Konfliktprüfung gegen offene PRs (Spec 042), plan und tasks vervollständigt.
- [ ] **T3816 (S038-08)** Ein Push, PR A, ein `workflow_dispatch`-Lauf, beide Läufe je Job ausgewertet, PR-Text, `$S/bericht-lauf-1.md`.
- [ ] **T3817 1.9** Messung Teil 1 – verschoben nach Lauf 3.
