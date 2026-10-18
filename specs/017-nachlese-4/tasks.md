# Nachlese 4 – Aufgaben

**Spec:** [`briefing.md`](briefing.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen in **einer** Zeile der Messungen (nach dem Rebase auf Spec 015 ③ dort und hier ersetzen).

**Branch:** `261018-nachlese-4-f027c6` (vorläufig von `main` @ `7a05c6e`) · Aufgaben zählen ab T1701.

### A – Gvidanto (N-1 bis N-4)
- [x] **T1701 Rot** `gvidanto/suggest-ero.test.ts` (N-1 bis N-4, 9 Tests), MCP `e2e/s017-nachlese-4.test.ts` (F-1 bis F-3 aus der Messung 014 A3/A4/A8), Doku-Test `docs.test.ts` (specs/017). Rot in `38d3f65` (Modelo 9 von 34 in `suggest-ero`, Doku 1; MCP 3 von 3).
- [x] **T1702 Grün** `eroj/usage.ts` (`flatKeyword`, `keywordHitOf`, `KeywordMatch`), `gvidanto/suggest-ero.ts` (zweiter Durchgang, `uzoStrength`, Regel N-4), `menuo` += `tabellenzeile`, `dialogo.drawer` ohne `side-panel`, zwei Jugxoj (D-01 bis D-04). Grün in `ba443c6`.
- [x] **T1703 Dialoge** aller Specs 007–015 vorher/nachher (289 Zeichenketten × 3 Sprachen, Tabelle in plan „Dialoge vorher/nachher“): geändert nur F-1 bis F-3.

### B – Figma (N-5, N-6)
- [x] **T1704 Rot N-5** `plugin.test.ts`: Fehlwarnung bei Gleitkomma-Rauschen, Double ohne unsichtbare Kinder. Rot in `b7db14a` (3 von 3).
- [x] **T1705 Grün N-5** `measureLayout` mit `LAYOUT_SLACK`, Double `float32` und `inFlow` ohne unsichtbare Kinder (D-05). Grün in `105980b`, Typfix `51811d0`. Rot nachgestellt: `float32` ohne Toleranz meldet genau `kind=empty` außerhalb.
- [x] **T1706 Rot N-6** `figma.test.ts` (examples der apartigilo), `plugin.test.ts` (zwei Beispielrahmen, Reihenfolge im Rahmen Eroj). Rot in `bda76e3` (Plan 1, Plugin 6).
- [x] **T1707 Grün N-6** Plan `examples[].texts`, Plugin `drawSeparatorExample`, `placeExamples` nach Bauform (D-06). Grün in `5d1a0eb`.

### C – Ikonaro und Verhalten (N-7 bis N-9)
- [x] **T1708 Rot N-7** Web-Celo (`MARK`, Haken), Browser `ligilo.spec.ts`/`markobutono.spec.ts`, Figma-Plan und -Plugin (Glyphen, alter Vektor). Rot in `37b5c94` (Projekcioj 6, Browser 2).
- [x] **T1709 Grün N-7** `element-template.ts`, `web-component.ts`, `figma.ts` (`iconsOf`), `plugin.ts` (alter Vektor), Uzo `composes.with` += `ikono` (D-07). Grün in `3e3ab8d`.
- [x] **T1710 Rot N-8/N-9** Daten-Pins `kompletigilo.test.ts`, Web-Celo, Figma-Plan und -Plugin, Browser `kompletigilo.spec.ts`. Rot in `1f70bc0` (Modelo 7, Projekcioj 3, Browser 2).
- [x] **T1711 Grün N-8/N-9** Schema `entry.active`, `skemo-rules.ts`, `gvidanto/eroj.ts` (brief), Skemo `kompletigilo`, Web (`data-active`, `loading`), Stylesheet-Inventur, Figma (`activeEntries`), Vitrino-Pin (D-08, D-09). Grün in `32709c8`.

### D – Abschluss
- [x] **T1712 Doku** plan, tasks, Vojmapo (neun Zeilen mit Auflösung).
- [x] **T1713 Messungen** unten; CI; Bericht.

### Messungen

| Was | Wert |
|---|---|
| **Commits** (rot / grün; nach dem Rebase hier ersetzen) | N-1–N-4 rot `38d3f65` grün `ba443c6` · N-5 rot `b7db14a` grün `105980b` (Fix `51811d0`) · N-6 rot `bda76e3` grün `5d1a0eb` · N-7 rot `37b5c94` grün `3e3ab8d` · N-8/N-9 rot `1f70bc0` grün `32709c8` · Doku im Commit der Messungen |
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
| CI | folgt (Zeile nach dem Push) |
