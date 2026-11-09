# Spec 046 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `origin/main` `626043f9`. Höchstens acht Tickets (Spec, „Begrenzung der Laufzeit“). Jede Ausnahme ist ein eigener Commit mit der Ausnahme im Titel. Häkchen mit SHAs.

PR A ist ein Strang T1 → T6 (B-8), T7 läuft parallel in PR B im eigenen Worktree. Playwright nie gleichzeitig in beiden Worktrees.

| Ticket | Inhalt | PR | Stand |
|---|---|---|---|
| T1 | Gerüst; `fm-vico`, `fm-kolumno`, `fm-stako`; abgeleitete Eroj-Zahlen | A | erledigt (Befunde F-T1-1 bis F-T1-11) |
| T2 | `fm-krado` | A | erledigt (Befunde F-T2-1 bis F-T2-6) |
| T3 | `fm-tabelo`: Auswahl, Laden, fester Kopf, geschlossene Grenzen | A | erledigt (Befunde F-T3-1 bis F-T3-6) |
| T4 | `fm-templinio` | A | erledigt (Befunde F-T4-1 bis F-T4-6) |
| T5 | Vitrino, Geometrie- und Stiltests, Alirebleco, Figma-Bauformen | A | erledigt (Befunde F-T5-1 bis F-T5-5, Etappe F EF-1 bis EF-5; F-T5-1 behoben in der T3-Nachbesserung, D-36) |
| T6 | `dataForm`, L5-4, „create new“, „Inhalte anzeigen“, Vertragsfortschreibung | A | erledigt (Befunde F-T6-1 bis F-T6-12); **PR A bereit für T8** |
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
- [x] Nachbesserung F-T5-1 (D-36, `9708cc08`): Teil `selection` (`size.target.min`) am Kästchen jeder Auswahlzelle, Ero-Tokens für Kern und gepflegte Aspekto-Sets, Freigabe in Figma (`tabelo:selection`, Jugxo), rot zuerst `tabelo.spec.ts` „Spec 046 T3 Nachbesserung“ (3 rot), grün in Chromium, Firefox, WebKit; `check:alirebleco-eroj` 219/219 je Engine. Folge `figma.test.ts:2543` (eigener Commit).

## T4 im Einzelnen

- [x] Rote Tests zuerst (`635878d7`): `modelo src/data/templinio-046.test.ts` (17, 15 rot; Wächter „andere Goals behalten ihre Antwort“ und „validiert ohne Befund in seinen Dateien“ grün ab Beginn), `projekcioj web-component/templinio-046.test.ts` (7, 4 rot; Wächter atributlisto/tabelo, CSS-Prüfungen, Figma-Plan grün ab Beginn), `eroj/test/templinio.spec.ts` (Chromium, 4 rot) – zusammen 23 rot.
- [x] Abweichung D-06 für `templinio` (`b5422742`).
- [x] Modelo: Skemo, Uzo, tradukoj, ontologio, IDs, 22 Ero-Tokens (Kern und gepflegte Aspekto-Sets, `invalid/aspekto-incomplete`; Kern 400) (`963c2884`, `028c704f`, `34da80dd`); Goal `timeline` (D-23).
- [x] Web Component: Light-Host `isTimeline`, Zeichen und Wort je Eintrag, Linie, Stylesheet nur aus Tokens (`076ddc1c`); Make Kit und kein `sort-change` (`42769d79`); übrige 99 erzeugte Dateien byte-gleich.
- [x] Figma: `templinio` bis T5 nicht im Plan (D-27), T1-Test nennt ihn mit (`a2b11654`).
- [x] Läufe: modelo 4891/6 rot (F-T1-1, -2, -5, -6, -10 und `export-modelo.test.ts:414`, behoben in `34da80dd`, danach grün), mcp 506/2 (F-T1-6, -7), projekcioj 1523/14 rot im Gesamtlauf, davon nach `42769d79` behoben: `make-kit.test.ts:865` (×2), `nachlese-11.test.ts:90`; verbleibend nur die bekannten F-T1-4, F-T1-3, F-T3-1, F-T3-6 (×3), F-T1-10/F-T2-4/F-T3-3/F-T4-2 (`parity.test.ts` ×5). eroj Vitest 43/43. Playwright Chromium `templinio.spec.ts` 4/4, `nachlese-7` 7/7, `nachlese-11-konformeco` 2/2, `pflicht` 5/5, `react` 2/2. Checks grün: lint, regularo, dokumentaro (45), vortaro-lint, mankoj, make-kit (5/5), alirebleco (315 Paare, 0 Fehler); rot: parity (32 = 5 `parity-item-missing` + 27 aus F-T3-3). Kurzprofil `templinio` 180 (< 750), `kampo` (747) bleibt das größte.
- [x] Plan (D-23 bis D-28, F-T4-1 bis F-T4-6).

## T5 im Einzelnen

- [x] Rote Tests zuerst (`3260e4d0`): `projekcioj src/celoj/vitrino/eroj-046.test.ts` (10, 9 rot), `projekcioj src/celoj/figma/tabelo-046.test.ts` (4, 2 rot; Props BOOLEAN und „fünf Eroj nicht im Plan“ Wächter), `eroj/test/vitrino.check.ts` neuer Test (1 rot, 37 Befunde; Doku-Anker Wächter), `vico`/`krado`/`templinio.spec.ts` je Aspekto (9 Wächter, grün ab Beginn in allen drei Engines), `alirebleco.check.ts` neuer Block (Chromium 8, 2 rot: F-T5-1) – zusammen 12 rot plus F-T5-1.
- [x] Vitrino: Layout-Eroj mit Kindern, `wrap`, Raster mit `data-span`, Zeitstrahl, `tabelo` mit Auswahl, Laden, festem Kopf; Skript beantwortet `select` (`6f02fb0f`, D-29, D-30).
- [x] Folge F-T3-1 (`830059d7`), Folge `vitrino.check.ts:486` (`8247773d`, F-T5-2).
- [x] Figma: `tabelo:skeleton` in `FIGMA_NOT_DRAWN`, Wortlaut der Jugxo (`497da613`, D-35); Folge F-T3-6 (`91d9bada`). Keine Bauform für die fünf neuen Eroj (D-34, Etappe F EF-1 bis EF-5). Kopfzeile des Berichts 3 958 (core + ekzemplo) / 3 742 (Repo), Grenze 4 000 unverändert; `bild-main.json` unverändert (kein neues Set).
- [x] Läufe: projekcioj 1543/7 rot (F-T1-4, F-T1-3/B-3, `parity.test.ts` ×5 = F-T5-3); modelo 4892/5 rot (F-T1-1, -2, -5, -6, -10); mcp 506/2 (F-T1-6, -7); eroj Vitest 43/43. Playwright Chromium `vico` 6/6, `krado` 8/8, `templinio` 7/7, `nachlese-7` 7/7, `nachlese-11-konformeco` 2/2, `pflicht` 5/5, `react` 2/2; die neuen T5-Tests auch in Firefox und WebKit grün. Vitrino `-g "Spec 046 T5"` 1/1 (1,9 min), dazu `fm-tabelo, fm-atributlisto…`, `the Vitrino wires…`, `every table names itself`, `fm-insigno, fm-avizo…`, `the Lingvo switch…`, `axe finds nothing in light/high`, `every Ero page has the nine sections…` grün. Checks grün: lint, regularo, dokumentaro (45), vortaro-lint, mankoj, make-kit (5/5), alirebleco; `check:alirebleco-eroj` (Chromium) 217/2 rot (F-T5-1; Firefox/WebKit des neuen Blocks grün); `check:parity` 5 Fehler (F-T5-3, vorher 32).
- [x] Plan (D-29 bis D-35, F-T5-1 bis F-T5-5, Befunde Etappe F, „Im echten Figma-Plugin zu messen“).

## T6 im Einzelnen

- [x] Rote Tests zuerst (`1ccf4e40`): `modelo src/gvidanto/eroj-runde-7.test.ts` (18 Tests, 13 rot: `dataForm` ×3, Schema positiv, L5-4, „create new“ ×4, „Inhalte anzeigen“ ×4; grün ab Beginn: `list_arangxoj` ×2, „Zeitliche Folge der Änderungen“ ×2, Schema negativ). Befehl `pnpm --filter @fundamento/modelo exec vitest run src/gvidanto/eroj-runde-7.test.ts`.
- [x] `dataForm` im Schema `UzoSlot`, Typen, `slotsOf` (`93aac005`, D-37); Ausnahme `eroj-fields.test.ts:357` (`d3a31f4b`); Daten `tabelo`/`templinio` (`39034b2b`).
- [x] L5-4: deutsche Texte der `butono` gekürzt, 746 < 750 ohne `rest` (`73727a1b`, D-38).
- [x] `suggest_ero`: Goal `create` der `formularo` mit `children`, Stichwörter am Goal `details` der `atributlisto` (`a22018b6`, D-39, D-40).
- [x] Ausnahme Vertrags-Fixtures, 11 Einträge (`9ee8d430`, D-41); AC-8 der Ausgabe byte-gleich; `index.json` unverändert.
- [x] F-T1-5 entschieden: bleibt rot (D-42). B-9 geprüft: grün (F-T6-5).
- [x] Läufe (einzeln): modelo 4909/7 rot (F-T1-1, -2, -5, -6, -10, F-T6-1, F-T6-2), mcp 507/1 (F-T1-6), projekcioj 1544/7 (F-T1-4, F-T1-3, F-T5-3 ×5), nordstelo 268/2 (F-T2-5), ekranoj 293/0, cli 120/0, eroj Vitest 43/0, eroj Playwright alle Engines 2021/2 (F-T6-9, F-T6-10), agordilo 139/8 (F-T6-7), metiejo 603/5 (F-T6-8), vortaro und aspekto-komuna-0-2 grün.
- [x] Abschluss PR A: `pnpm build && pnpm test:betroffen` einmal (Abbruch unter Last, F-T6-11), `pnpm lint` grün, `pnpm check` einmal (Abbruch am Testschritt, F-T6-11) und die Prüfungen einzeln; Diff-Suche, Dateiliste, Kern 400 – siehe plan.md › Abschluss PR A.
- [x] Plan (D-37 bis D-42, F-T6-1 bis F-T6-12, Vertrags-Fixtures, Abschluss PR A).

## T7 (PR B) und T8 im Einzelnen

- [x] T7: L5-1, L5-2, L5-3 in Worktree B (`63c937c7` rot, `85a42e32` Umsetzung, `70f3ab94` Ausnahme AC-8-Fixtures ekranoj). AC-8 Rückfallpfad rot (F-B1, Maintainer-Entscheidung). Entscheidungen D-B1 bis D-B5 in plan.md.
- [x] QA Lauf 1: Web PASS, API PASS (plan.md › QA).
- [x] T8: Disjunktheit geprüft, SHA geprüft, je PR ein Push und ein Dispatch; Bericht `bericht-spec-046.md`.

## Nachtrag: zweiter Push (2026-11-09)

- [x] `check:parity`: benannte, Jugxo-gestützte Freigabe der fünf Eroj bis Etappe F, rot zuerst (`d3253db8`, D-43, F-T8-2, F-T8-3); Vertrags-Fixtures `list_jugxoj`, `describe` als Folge.
- [x] F-T8-1: `tabelo.spec.ts:405` ohne absolute Pixel, relative Maße, Gegenprobe (`f8e4e8b7`, D-44).
- [x] Fixtures und Pins je Paket: modelo `2a74da85`, mcp `6c64d8bc`, projekcioj `a7d7b90e`, nordstelo `1ced542b`, agordilo `a852866a`, metiejo `107d0654` (D-45, Tabelle „Was je Eintrag dazukommt“ in plan.md).
- [x] Läufe nacheinander, `pnpm lint`, sieben Prüfungen, Diff-Suche (plan.md › Läufe (Nachtrag)). Einzig `figma-cxiuj.test.ts:32` einmal unter Last rot, allein grün (F-T8-6).
- [ ] Push und `workflow_dispatch` durch den Orchestrator; CI auf Linux offen.
