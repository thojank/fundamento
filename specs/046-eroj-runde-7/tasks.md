# Spec 046 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `origin/main` `626043f9`. Höchstens acht Tickets (Spec, „Begrenzung der Laufzeit“). Jede Ausnahme ist ein eigener Commit mit der Ausnahme im Titel. Häkchen mit SHAs.

PR A ist ein Strang T1 → T6 (B-8), T7 läuft parallel in PR B im eigenen Worktree. Playwright nie gleichzeitig in beiden Worktrees.

| Ticket | Inhalt | PR | Stand |
|---|---|---|---|
| T1 | Gerüst; `fm-vico`, `fm-kolumno`, `fm-stako`; abgeleitete Eroj-Zahlen | A | erledigt (Befunde F-T1-1 bis F-T1-11) |
| T2 | `fm-krado` | A | erledigt (Befunde F-T2-1 bis F-T2-6) |
| T3 | `fm-tabelo`: Auswahl, Laden, fester Kopf, geschlossene Grenzen | A | erledigt (Befunde F-T3-1 bis F-T3-6) |
| T4 | `fm-templinio` | A | erledigt (Befunde F-T4-1 bis F-T4-6) |
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

## T3 im Einzelnen

- [x] Rote Tests zuerst (`7ac87f5a`): `eroj/test/tabelo.spec.ts` neuer Block (Chromium: 9 Tests, 8 rot; der Geometrie-/DOM-Test ohne neue Props ist Wächter und grün ab Beginn), `modelo src/data/tabelo.test.ts` (7 rot) – zusammen 15 rot.
- [x] Geometrie und DOM ohne neue Props auf `486b6c03` gemessen (Viewport 1024 × 600, je Engine und Dichte) und als Zahlen festgehalten; nach T3 unverändert in Chromium, Firefox und WebKit.
- [x] Ausnahme `row-selection` und `sticky-header` geschlossen (`4faee9cd`): nur diese Erwartungen in `tabelo.test.ts`, `s011-daten.test.ts`, `make-kit.test.ts`.
- [x] Modelo: Props, Ereignis `select`, Teil `skeleton`, `head.layer`, `a11y.texts`, Goals statt Grenzen, Tastatur, tradukoj, IDs, Ero-Tokens (Kern und gepflegte Aspekto-Sets, Kern 400) (`f913968f`).
- [x] Web Component: Auswahlspalte, Laden mit Skelett, fester Kopf (`05d4e87d`); nur für eine Skemo mit `selectable` bzw. Teil `skeleton`, die erzeugte `fm-atributlisto` ist byte-gleich zum Stand vor T3 (`ea996232`, `nachlese-11.test.ts:90`); `content-template.ts` ohne Diff.
- [x] `neu-seit-main.ts`: `ero.tabelo.skeleton.*` und `ero.tabelo.head.layer` neu seit dem Stand von main (wie D-08) (`934c29ff`).
- [x] Läufe: modelo 4873/5 rot (F-T1-1, -2, -5, -6, -10), mcp 505/2 (F-T1-6, -7), projekcioj 16 rot im Gesamtlauf, davon nach den letzten Commits offen: F-T1-4, F-T1-3, F-T3-1, F-T3-6 (×3), F-T1-10/F-T2-4/F-T3-3 (`parity.test.ts` ×5); `figma-cxiuj.test.ts:32` einmal Zeitgrenze des Hooks unter Last, allein grün (wie F-T2-6). eroj Vitest 43/43. Playwright `tabelo.spec.ts` 15/15 in Chromium, Firefox, WebKit; `nachlese-7`, `nachlese-11-konformeco`, `pflicht`, `react` (Chromium) 16/16. Checks grün: lint, regularo, dokumentaro (44), vortaro-lint, mankoj, make-kit, alirebleco; rot: parity (F-T1-10/F-T2-4 plus F-T3-3).
- [x] Plan (D-18 bis D-22, F-T3-1 bis F-T3-6).

## T4 im Einzelnen

- [x] Rote Tests zuerst (`635878d7`): `modelo src/data/templinio-046.test.ts` (17, 15 rot; Wächter „andere Goals behalten ihre Antwort“ und „validiert ohne Befund in seinen Dateien“ grün ab Beginn), `projekcioj web-component/templinio-046.test.ts` (7, 4 rot; Wächter atributlisto/tabelo, CSS-Prüfungen, Figma-Plan grün ab Beginn), `eroj/test/templinio.spec.ts` (Chromium, 4 rot) – zusammen 23 rot.
- [x] Abweichung D-06 für `templinio` (`b5422742`).
- [x] Modelo: Skemo, Uzo, tradukoj, ontologio, IDs, 22 Ero-Tokens (Kern und gepflegte Aspekto-Sets, `invalid/aspekto-incomplete`; Kern 400) (`963c2884`, `028c704f`, `34da80dd`); Goal `timeline` (D-23).
- [x] Web Component: Light-Host `isTimeline`, Zeichen und Wort je Eintrag, Linie, Stylesheet nur aus Tokens (`076ddc1c`); Make Kit und kein `sort-change` (`42769d79`); übrige 99 erzeugte Dateien byte-gleich.
- [x] Figma: `templinio` bis T5 nicht im Plan (D-27), T1-Test nennt ihn mit (`a2b11654`).
- [x] Läufe: modelo 4891/6 rot (F-T1-1, -2, -5, -6, -10 und `export-modelo.test.ts:414`, behoben in `34da80dd`, danach grün), mcp 506/2 (F-T1-6, -7), projekcioj 1523/14 rot im Gesamtlauf, davon nach `42769d79` behoben: `make-kit.test.ts:865` (×2), `nachlese-11.test.ts:90`; verbleibend nur die bekannten F-T1-4, F-T1-3, F-T3-1, F-T3-6 (×3), F-T1-10/F-T2-4/F-T3-3/F-T4-2 (`parity.test.ts` ×5). eroj Vitest 43/43. Playwright Chromium `templinio.spec.ts` 4/4, `nachlese-7` 7/7, `nachlese-11-konformeco` 2/2, `pflicht` 5/5, `react` 2/2. Checks grün: lint, regularo, dokumentaro (45), vortaro-lint, mankoj, make-kit (5/5), alirebleco (315 Paare, 0 Fehler); rot: parity (32 = 5 `parity-item-missing` + 27 aus F-T3-3). Kurzprofil `templinio` 180 (< 750), `kampo` (747) bleibt das größte.
- [x] Plan (D-23 bis D-28, F-T4-1 bis F-T4-6).
