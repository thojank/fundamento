# Spec 046 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `origin/main` `626043f9`. Höchstens acht Tickets (Spec, „Begrenzung der Laufzeit“). Jede Ausnahme ist ein eigener Commit mit der Ausnahme im Titel. Häkchen mit SHAs.

PR A ist ein Strang T1 → T6 (B-8), T7 läuft parallel in PR B im eigenen Worktree. Playwright nie gleichzeitig in beiden Worktrees.

| Ticket | Inhalt | PR | Stand |
|---|---|---|---|
| T1 | Gerüst; `fm-vico`, `fm-kolumno`, `fm-stako`; abgeleitete Eroj-Zahlen | A | erledigt (Befunde F-T1-1 bis F-T1-11) |
| T2 | `fm-krado` | A | erledigt (Befunde F-T2-1 bis F-T2-6) |
| T3 | `fm-tabelo`: Auswahl, Laden, fester Kopf, geschlossene Grenzen | A | offen |
| T4 | `fm-templinio` | A | offen |
| T5 | Vitrino, Geometrie- und Stiltests, Alirebleco, Figma-Bauformen | A | offen |
| T6 | `dataForm`, L5-4, „create new“, „Inhalte anzeigen“, Vertragsfortschreibung | A | offen |
| T7 | L5-1 mit AC-8, L5-2, L5-3 | B | offen |
| T8 | Je PR ein Push, ein Dispatch, Bericht | A und B | offen |

## T1 im Einzelnen

- [x] G-0: Quelle und Kopie 6 283 Byte, SHA-256 `6b842691dbca177757a574a9239ee33b95306e4c73fc1e844d8f425d74f2d1f9`, kopiert mit `cp`.
- [x] `pnpm check:privat` mit der Kopie: grün (4 299 Dateien, 0 Treffer).
- [x] Rote Tests zuerst (`0fef323b`): `layout-046.test.ts` (modelo, 21 rot), `arangxoj.test.ts` neuer Block (2 rot), `web-component/layout-046.test.ts` (projekcioj, 13 rot), `eroj/test/vico.spec.ts` (Chromium, 3 rot).
- [x] Abweichung D-06 `reguloj.json` (`123d780b`).
- [x] Modelo: Skemo, Uzo, tradukoj, ontologio, IDs, Ero-Tokens (`95bd2118`, `9b50036a`, `49619545`, `f0c6526f`).
- [x] Ausnahme `arangxoj.test` ohne Layout-Eroj (`781ec764`).
- [x] Web-Component-Host `layout` (`e079139f`, `64605938`); `neu-seit-main` (`6c0601e4`).
- [x] Ausnahme Eroj-Zahl aus den Daten (`a7f81616`); `vico.spec.ts` liest die Kinder des Light DOM (`5e2f10d1`).
- [x] Make Kit: Leitlinien der Layout-Eroj (`d25d1de1`), Ausnahme Eroj-Zahl Make Kit (`93b17665`).
- [x] D-11 (F-T1-8, Option 1): Layout-Eroj bis T5 nicht im Figma-Plan; rot `5431fdd7`, grün `236328a9`. Variablenbericht 3 958 Zeichen.
- [x] Ausnahme Eroj-Zahl aus den Daten (Vitrino, Karte Ero → Rolle) (`276a0267`).
- [x] D-12: `stako` `uzo.layout.wrap` `allowed` (`7cf79f21`).
- [x] Bleiben rot als Befund: F-T1-1, F-T1-2, F-T1-3 (B-3), F-T1-4, F-T1-6; F-T1-5, F-T1-7 (T6); F-T1-10 (`check:parity` bis T5). Siehe plan.md › Befunde.

## T2 im Einzelnen

- [x] Rote Tests zuerst (`604c95ad`): `modelo src/data/krado-046.test.ts` (19, 18 rot), `arangxoj.test.ts` neuer Block (2 rot), `modelo src/gvidanto/krado-046.test.ts` (3, 2 rot; Wächter `fm-vico` grün ab Beginn), `nordstelo src/krado-046.test.ts` (3, 2 rot; Wächter grün ab Beginn), `projekcioj web-component/krado-046.test.ts` (11, 9 rot), `eroj/test/krado.spec.ts` (Chromium, 5 rot) – zusammen 38 rot.
- [x] Abweichung D-06 für `krado` (`35f2b088`).
- [x] Modelo: Skemo, Uzo, tradukoj, ontologio, IDs, Ero-Tokens (Kern und Aspekto-Hauptsets, `invalid/aspekto-incomplete`; 9 neu, Kern 400) (`b88ea778`); D-13 Messung der Token-Reihe.
- [x] Web Component: Grid, `data-span`-Begrenzung, Stapeln unter `columns-from` (`dde8db00`); Make Kit (`cbe5089f`).
- [x] Plan und Aufgaben (D-13 bis D-17, F-T2-1 bis F-T2-6).
