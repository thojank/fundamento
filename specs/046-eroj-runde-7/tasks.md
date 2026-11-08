# Spec 046 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `origin/main` `626043f9`. Höchstens acht Tickets (Spec, „Begrenzung der Laufzeit“). Jede Ausnahme ist ein eigener Commit mit der Ausnahme im Titel. Häkchen mit SHAs.

PR A ist ein Strang T1 → T6 (B-8), T7 läuft parallel in PR B im eigenen Worktree. Playwright nie gleichzeitig in beiden Worktrees.

| Ticket | Inhalt | PR | Stand |
|---|---|---|---|
| T1 | Gerüst; `fm-vico`, `fm-kolumno`, `fm-stako`; abgeleitete Eroj-Zahlen | A | in Arbeit |
| T2 | `fm-krado` | A | offen |
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
- [ ] Offene Sweeps (Figma-Plan, Make Kit, Vitrino-Karte der Rollen, Bericht der Figma-Variablen): siehe plan.md › Befunde.
