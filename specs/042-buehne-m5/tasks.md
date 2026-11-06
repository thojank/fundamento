# Spec 042 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `e4873c57`. Höchstens fünf Tickets (Spec, „Tickets“). Rote Commits enden auf „(rot)“, grüne auf „(grün)“; Doku-Commits beginnen mit „Spec 042:“ und sind einzeln. Häkchen mit SHAs.

Ein Strang in PR A (T1 → T2 → T3 → T5), T4 parallel in PR B im eigenen Worktree. Lokale Läufe von Playwright, Builds und der M5-Messung nur unter der Maschinen-Sperre (D-11).

| Ticket | Inhalt | PR | Dateien | Stand | rot → grün |
|---|---|---|---|---|---|
| T1 | Trace `retain-on-failure` für die Eroj-Shards (D-01, D-02); Gerüst `specs/042-buehne-m5/` | A | `specs/042-buehne-m5/{spec,plan,tasks}.md`, `packages/eroj/playwright*.config.ts` (nur `trace`), `packages/eroj/test/spuro-042.test.ts` (neu) | erledigt (D-01 bestätigt: keine Workflow-Änderung) | Gerüst `bb53f484`; Trace `538bca43` → `347a3355` |
| T2 | Selbst-Navigation der Bühne finden (Navigationstest rot zuerst) und beheben; `buehne-036` härten (D-03 bis D-05) | A | `packages/eroj/test/buehne-036.spec.ts`, `buehne-navigation-042.spec.ts` (neu), `geladen-042.ts` (neu); `packages/metiejo/src/**` unverändert (D-16) | erledigt (Randfall „sofort grün“: keine Selbst-Navigation, kein Produkt-Fix) | Navigationstest sofort grün `3b2045b6` (kein Rot im Produkt, D-16); Härtung `buehne-036`: rot = CI 42113762271 → grün `77778d6a` |
| T3 | `zweitfarbe-036.spec.ts:111` in Firefox (Testzeit 120 s) | A | `packages/eroj/test/zweitfarbe-036.spec.ts`, `geladen-042.ts` (erweitern) | erledigt (nicht nachgestellt, 30/30; Befund mit Spur; Datei gehärtet, D-17 bis D-19) | rot = CI 42103645313 (lokal nicht nachgestellt, kein roter Commit) → Härtung grün `8506eb80` |
| T4 | M5 (B-14): Stil-Neuberechnung je Schieber-Änderung begrenzen (D-08 bis D-10) | B | nur `packages/projekcioj/src/celoj/vitrino/**` (`html.ts`, `werkstatt.ts`, `vitrino.test.ts`) | erledigt (lokal; CI-Urteil im Kommentar von PR B) | `89636d4f` → `1c69db9b` |
| T5 | Zwei PRs, je genau ein `workflow_dispatch`, Diff-Suche, Bericht (D-06, D-07) | A und B | `specs/042-buehne-m5/{plan,tasks}.md`; PR-Texte und -Kommentare | erledigt bis zum Dispatch; CI in den PR-Kommentaren (D-06) | Nachzug T2 `9a19e143` (Tupel `as const`, grün); Bericht = Commit „Spec 042: Bericht vor dem Dispatch“ |

## T1 im Einzelnen

- [x] G-0: Quelle und Kopie 5172 Byte, SHA-256 `a8480d42f7cb2bc23d9c81a7da1bdff174254b925653372571a3a337a2b86878`, kopiert mit `cp`.
- [x] G-0 nach dem Commit erneut: `git show HEAD:specs/042-buehne-m5/spec.md | shasum -a 256` gleich – `bb53f484`.
- [x] Pin `packages/eroj/test/spuro-042.test.ts` rot (17 bestanden, 1 rot: `use.trace` in `playwright.config.ts` nicht gesetzt) – `538bca43`.
- [x] `trace: "retain-on-failure"` in `playwright.config.ts`; `trace: "off"` in Vitrino, Alirebleco, Make Kit und Quickstart (D-02), die Vitrino-Partoj erbt es; sonst keine Zeile (kein `retries`, `video`, `screenshot`, `outputDir`, Reporter, Zeitlimit). Pin grün 18/18 – `347a3355`.
- [x] Nachweis D-01 (lokal, `CI=1`, Chromium, Wegwerf-Spec nicht committet): Trace `*.zip` unter `packages/eroj/test-reports/playwright/html/data/` (plan.md › Messanleitung). Kein Upload-Schritt nötig; `ci.yml` und `workflow.test.ts` unverändert.
- [x] `pnpm check:privat` grün (4161 Dateien, 0 Treffer); Eroj-Vitest `FM_GEBAUT=1` 43/43; `pnpm --filter @fundamento/modelo exec vitest run src/ci/workflow.test.ts` 51/51; `pnpm lint` grün (20/20 Aufgaben; in `packages/eroj` eine Warnung und ein Hinweis in `alirebleco.check.ts` und `menuo.spec.ts`, beide schon auf `e4873c57`).

## T2 im Einzelnen

- [x] CI-Spuren gelesen (nur lesen, `s042-spur/<lauf>-eroj/`): 42113762271, 42080252255, 41971858056, 41931882770 – alle noch abrufbar. Zuordnung in plan.md › Befunde.
- [x] Navigationstest `buehne-navigation-042.spec.ts` (Ports 7371–7379): Quellen `sessionStorage`, `performance`, `src`; `framenavigated` und Bindung nur im Bericht (D-14). Erwartet: Seite 2 Ladevorgänge, je Rahmen 5 Dokumente (laden-1, dunkel, hell, rev, laden-2).
- [x] Suche nach Rot je 30: Chromium 30/30, WebKit 30/30, Firefox 28/30 – beide Roten ein Verlust der Einträge in der gemeinsamen Liste, keine Navigation zu viel (D-13). These „die Bühne lädt sich selbst neu“ für diesen Ablauf widerlegt; kein roter Commit, kein Produkt-Fix, kein Unit-Test in Metiejo (D-16).
- [x] Fassung mit Schlüssel je Eintrag: Firefox, Chromium, WebKit je 30/30 – `3b2045b6`. Mutationsprobe (doppelter `refreshFrame()`, Wegwerf) macht den Test rot.
- [x] `geladen-042.ts` (V-3): `seiteBereit(page, merkmal, nicht?)`, `rahmenBereit(page, rahmen, { rev?, scheme? })`, `dokument(page)`, `BUEHNE_BEREIT` – `3b2045b6`.
- [x] `buehne-036.spec.ts` gehärtet (AC-5, Liste der Stellen in plan.md › Messungen): je `--repeat-each=5` Chromium, Firefox, WebKit 95/95 – `77778d6a`.
- [x] `stato-041.spec.ts` grün in drei Engines; Metiejo-Unit grün; `}, 3000);` unverändert; `pnpm lint` grün; `pnpm check:privat` 0 Treffer.
- [ ] Offen mit Spur: B-10, B-13 (Module des zweiten Dokuments liefen nicht; Trace aus T1 beim nächsten Auftreten). Nebenbefund N-7 (Schema-Schalter an der Wurzel) beim Maintainer.

## T3 im Einzelnen

- [x] CI-Spur 42103645313 gelesen (nur lesen, `s042-spur/42103645313-eroj/`, Artefakte abrufbar): `[firefox] zweitfarbe-036.spec.ts:111` stand 120 s in `waitForEvent("framenavigated")` von `vorschauGeladen` (`wackler-040.ts:67`) beim Neuladen `:140`. Kein Trace, kein Schnappschuss.
- [x] Suche nach Rot: Firefox `-g "Schnellstart" --repeat-each=30` auf `34c13f0a` – 30/30 grün, nicht nachgestellt; Grenze 30 erreicht, keine weitere Suche. Befund mit Spur in plan.md › Befunde.
- [x] Härtung AC-5: kein `framenavigated`, kein `waitForLoadState`, kein `vorschauGeladen` mehr in `zweitfarbe-036.spec.ts`; Liste der Stellen in plan.md › Messungen – `8506eb80`.
- [x] `geladen-042.ts` erweitert (`VORSCHAU`, `abrufBeantwortet`, `schrittBereit`, `entwurfGespeichert`), bestehende Exporte unverändert; `wackler-040.ts` unverändert – `8506eb80`.
- [x] Gehärtete Datei je `--repeat-each=10`: Firefox, Chromium, WebKit je 30/30; `buehne-036` 19/19 und `buehne-navigation-042` 1/1 in Firefox.
- [x] `timeout: 120_000` unverändert; kein `waitForTimeout`, kein neues Zeitlimit, kein `retries`. `pnpm lint` grün; `pnpm check:privat` 0 Treffer.
- [ ] Offen mit Spur: beim nächsten CI-Rot der Trace `testberichte-eroj-<shard>-<attempt>` › `eroj/test-reports/playwright/html/data/*.zip`.

## T4 im Einzelnen

- [x] Ursache gemessen (CDP-Wegwerf-Trace): `content-visibility` auf den Palettentabellen übersprang in Chromium nichts; beide Flanken wurden außerhalb des Bildes gestylt.
- [x] Vitest rot: Hülle je Tabelle und beide `content-visibility`-Regeln – `89636d4f`.
- [x] Fix grün: `div.fm-werkstatt-paletro` mit `content-visibility: auto`, `.fm-werkstatt-flankoj` mit `content-visibility: auto`, `min-inline-size: min-content` auf beiden – `1c69db9b`.
- [x] Pixelgleich (D-09): berechnete Stile 0 Abweichungen in 14 Fällen; Bildschirmfotos nur Raster-Rauschen wie vorher gegen vorher.
- [x] Determinismus: zwei erzwungene Builds byte-gleich.
- [x] M5 lokal (V-2): p90 0 ms vorher und nachher; CDP Stil+Layout 12,0/12,5 → 5,9/5,8 ms (plan.md › Messungen › M5). Nachher unter Fremdlast eines anderen Workspace.
- [x] `measure()`, `m5.ts`, `vitrino.check.ts` unverändert; Vitest Vitrino 242/242; `pnpm lint` grün; `pnpm check:privat` 0 Treffer.

## T5 im Einzelnen

- [x] Disjunktheit (`comm -12` leer), Zonen A und B, AC-1-Hash am Kopf (5172 Byte, `a8480d42…`).
- [x] Nachzug T2: `[SCHRITT, name] as const` in `buehne-navigation-042.spec.ts:182` (unter `noUncheckedIndexedAccess` sonst `string[]`); mit einer Wegwerf-`tsconfig` samt `test/` typrein; Chromium 1/1 – `9a19e143`.
- [x] `pnpm check:privat`, `pnpm lint`, `pnpm test:betroffen` in A und B (plan.md › Bericht).
- [x] Diff-Suche AC-8 mit Urteil je Treffer (plan.md › Diff-Suche).
- [x] PR B geöffnet, dann dieser Bericht, Push und PR A.
- [ ] Je Branch genau ein `workflow_dispatch`, Auswertung als Kommentar in PR A und PR B (nach diesem Commit; kein Push danach).
