# Nachlese 4 – Aufgaben

**Spec:** [`briefing.md`](briefing.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen in **einer** Zeile der Messungen (nach dem Rebase auf Spec 015 ③ dort und hier ersetzen).

**Branch:** `261018-nachlese-4-f027c6` (gestapelt auf Spec 015 ③ @ `b0545f6`; gebaut von `main` @ `7a05c6e`, am 2026-10-19 zweimal rebased – die Hashes sind die nach dem zweiten Rebase) · Aufgaben zählen ab T1701.

### A – Gvidanto (N-1 bis N-4)
- [x] **T1701 Rot** `gvidanto/suggest-ero.test.ts` (N-1 bis N-4, 9 Tests), MCP `e2e/s017-nachlese-4.test.ts` (F-1 bis F-3 aus der Messung 014 A3/A4/A8), Doku-Test `docs.test.ts` (specs/017). Rot in `9cf0766` (Modelo 9 von 34 in `suggest-ero`, Doku 1; MCP 3 von 3).
- [x] **T1702 Grün** `eroj/usage.ts` (`flatKeyword`, `keywordHitOf`, `KeywordMatch`), `gvidanto/suggest-ero.ts` (zweiter Durchgang, `uzoStrength`, Regel N-4), `menuo` += `tabellenzeile`, `dialogo.drawer` ohne `side-panel`, zwei Jugxoj (D-01 bis D-04). Grün in `a1f2142`.
- [x] **T1703 Dialoge** aller Specs 007–015 vorher/nachher (289 Zeichenketten × 3 Sprachen, Tabelle in plan „Dialoge vorher/nachher“): geändert nur F-1 bis F-3.

### B – Figma (N-5, N-6)
- [x] **T1704 Rot N-5** `plugin.test.ts`: Fehlwarnung bei Gleitkomma-Rauschen, Double ohne unsichtbare Kinder. Rot in `49b899c` (3 von 3).
- [x] **T1705 Grün N-5** `measureLayout` mit `LAYOUT_SLACK`, Double `float32` und `inFlow` ohne unsichtbare Kinder (D-05). Grün in `8f6309d`, Typfix `a855de6`. Rot nachgestellt: `float32` ohne Toleranz meldet genau `kind=empty` außerhalb.
- [x] **T1706 Rot N-6** `figma.test.ts` (examples der apartigilo), `plugin.test.ts` (zwei Beispielrahmen, Reihenfolge im Rahmen Eroj). Rot in `73c2355` (Plan 1, Plugin 6).
- [x] **T1707 Grün N-6** Plan `examples[].texts`, Plugin `drawSeparatorExample`, `placeExamples` nach Bauform (D-06). Grün in `5e124ab`.

### C – Ikonaro und Verhalten (N-7 bis N-9)
- [x] **T1708 Rot N-7** Web-Celo (`MARK`, Haken), Browser `ligilo.spec.ts`/`markobutono.spec.ts`, Figma-Plan und -Plugin (Glyphen, alter Vektor). Rot in `9d267ff` (Projekcioj 6, Browser 2).
- [x] **T1709 Grün N-7** `element-template.ts`, `web-component.ts`, `figma.ts` (`iconsOf`), `plugin.ts` (alter Vektor), Uzo `composes.with` += `ikono` (D-07). Grün in `f76d2a7`.
- [x] **T1710 Rot N-8/N-9** Daten-Pins `kompletigilo.test.ts`, Web-Celo, Figma-Plan und -Plugin, Browser `kompletigilo.spec.ts`. Rot in `d68ee46` (Modelo 7, Projekcioj 3, Browser 2).
- [x] **T1711 Grün N-8/N-9** Schema `entry.active`, `skemo-rules.ts`, `gvidanto/eroj.ts` (brief), Skemo `kompletigilo`, Web (`data-active`, `loading`), Stylesheet-Inventur, Figma (`activeEntries`), Vitrino-Pin (D-08, D-09). Grün in `e14ba0f`.

### D – Abschluss
- [x] **T1712 Doku** plan, tasks, Vojmapo (neun Zeilen mit Auflösung).
- [x] **T1713 Messungen** unten; CI; Bericht.

### Messungen

| Was | Wert |
|---|---|
| **Commits** (rot / grün; nach dem Rebase hier ersetzen) | N-1–N-4 rot `9cf0766` grün `a1f2142` · N-5 rot `49b899c` grün `8f6309d` (Fix `a855de6`) · N-6 rot `73c2355` grün `5e124ab` · N-7 rot `9d267ff` grün `f76d2a7` · N-8/N-9 rot `d68ee46` grün `e14ba0f` · Doku im Commit der Messungen |
| `suggest_ero` F-1 bis F-3 | F-1 Rückfrage mit `menuo.action-menu` (tabellenzeile) neben `ligilo.action`, `butono.destructive`, `ikono.show-icon`; F-2 `titolo` (`section-heading`, überschrift); F-3 `kompletigilo` (`suggest`, vorschläge) |
| Dialoge 007–015 | 289 Zeichenketten × (ohne, de, en): geändert nur F-1 bis F-3 (plan) |
| `brief` (ceil Bytes/3) | `kompletigilo` 333 → 353 (Achse `active`, Prop `loading`), `menuo` 347, `ligilo` 275, `markobutono` 307; Grenze 750 |
| `check:regularo` | 58 Reguloj, 186 Jugxoj (+2), 29 Uzoj, 0 Fehler, 0 Warnungen (keine `goal-keyword-shared`) |
| `check:alirebleco` | 89 KontrastParoj (unverändert) × 72 Kombinationen, 0 Fehler, 2 394 APCA-Warnungen; ekzemplo 0 fehlgeschlagene Paar-Auswertungen. Gemessen und zurückgenommen: `tertiary.hover` für den aktiven Vorschlag (54 Fehler) |
| `check:parity` | 29 Eroj, 0 Differenzen, 285 Freigaben |
| `check:ikonaro` | 16 Namen × 2 Aspektoj, 32 Glyphen (unverändert) |
| `check:mankoj`, `vortaro-lint`, `clean-room` | 9 Mankoj; 0 Fehler |
| Tests (lokal, `turbo run test --filter=!@fundamento/eroj --force`, 6 min 03 s) | Modelo 3 490 (vorher 3 476; +14), MCP 294 (291; +3), Projekcioj 678 (670; +8), CLI 66; `pnpm lint` grün (9 Warnungen Modelo, 1 Projekcioj, älter); `check:release` beide Kits |
| Browser | alle 219 Specs in Chromium (vorher 215 + 4 neue); `ligilo`, `markobutono`, `kompletigilo`, `plenstato`, `apartigilo` in Firefox und WebKit 66; `check:alirebleco-eroj` 163, `check:vitrino` 27 (Pin: 18 `kompletigilo`, 3 mit `loading`), `check:make-kit` 5, `check:quickstart` 1 — je Chromium |
| Nach dem Rebase auf Spec 015 ③ (`4c58cfd`, 2026-10-19) | Konflikte in 10 Dateien, beide Stände behalten (Listen: Doku-Test, suggest-ero-Tests, ids.lock sortiert, Jugxoj, Plan-Beispiele, Plugin-Tests; Code: `suggest-ero.ts` `ownSynonym` aus ③ mit `pass` aus N-2, Figma-Beispiele separator + upload/card/avatar, Plugin-Zweig je Bauform). Danach sieben Plugin-Pins rot (zweiter Lauf schrieb 2) → Double-Fix B-9. Lokal: Modelo 3 550, MCP 307, CLI 66, Projekcioj 714 (Figma 388 nach dem Fix); Lint grün; `check:parity` 32 Eroj, 0 Differenzen, 297 Freigaben; `check:regularo` 59 Reguloj, 196 Jugxoj, 32 Uzoj, 0 Warnungen; vortaro-lint, mankoj, alirebleco, clean-room, ikonaro ohne Fehler; Browser alle 243 Specs in Chromium; Alirebleco-Check und Vitrino-Check (Zeile CI) |
| Zweiter Rebase auf Spec 015 ③ mit K-1 (`b0545f6`, 2026-10-19) | ein Konflikt im Doppel: `fills` verlangt jetzt beides – ein sichtbares Kind (B-9) und keinen leer gefüllten Text bei Breite 0 (K-1 aus ③). Lokal: Modelo 3 551, MCP 307, CLI 66, Projekcioj 716 grün; Lint, `check:parity` 32 Eroj 0 Differenzen, `check:regularo` 59 Reguloj 196 Jugxoj 0 Warnungen, vortaro-lint, mankoj, alirebleco, clean-room, ikonaro ohne Fehler; Browser alle 243 Specs in Chromium; CI in der Zeile danach |
| CI (PR #79, nach dem Rebase) | Lauf 39177188988 (`6d1596b`, gegen Spec 015 ③) alle sieben Jobs grün, Wanduhr 8:25: checks 1:04, unit 4:50, projekcioj 8:13 / 1:04 (Shard 1 ist `plugin.test.ts` allein, wächst je Set – Spec 015 plan ② O-5), eroj 1:54 / 2:13, rendered-checks 8:25; grüner Stand `6d1596b` |
| CI | Lauf 39167331502 (Dispatch, `5ba1285`) grün, Wanduhr 10 min 02 s: unit 7:12, Eroj Shard 1 8:58, Shard 2 10:02, rendered-checks 7:50 (unter 12 min); grüner Stand `5ba1285` |
