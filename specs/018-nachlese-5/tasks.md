# Nachlese 5 – Aufgaben

**Spec:** [`briefing.md`](briefing.md) · **Plan:** [`plan.md`](plan.md). Aufgaben ① zählen ab T1801, ② ab T1901.

## ① CI: `plugin.test.ts` teilen (O-5)

**Branch:** `261019-nachlese-5-ci-f027c6` (von `main` @ `ef3c8db`).

### A – Teilung
- [x] **T1801 Basis** Projekcioj-Suite mit dem JSON-Reporter vor der Teilung: 716 Tests, davon 250 in `plugin.test.ts` (310 s in einer Datei, die Suite 318 s).
- [x] **T1802 Teilung** sieben Testdateien nach Themen, ein Hilfsmodul ohne Tests (plan ① D-01). `6d15c0e`. Nachher 716 Tests, Namen identisch, keiner übersprungen.

### B – Wackel-Tests (rot zuerst)
- [x] **T1803 Tests** `sxvebilo.spec.ts` Escape wartet auf Zustände, `dialogo.spec.ts` Escape gibt dem Öffner den Fokus wie die Tastatur (plan ① D-02, D-03). Rot `71da2de`: `sxvebilo` Escape in Firefox 10 von 10 (der Fokus kehrt nicht zum Auslöser zurück).
- [x] **T1804 Fix** `focusout`-Regel der Overlays (`sxvebilo`, `menuo`) im Element-Template. Grün `f8ce63d`.

### C – Abschluss
- [x] **T1805 Doku** plan ①, tasks ①, Doku-Test.
- [ ] **T1806 CI** Zeiten je Job, Entscheidung zu den Shards (O-1).
- [ ] **Aufräumen (älter als dieser Branch):** Biome-Warnung `DESIGN` unbenutzt in `packages/projekcioj/src/celoj/web-component/web-component.test.ts`.

### Messungen

| Was | Wert |
|---|---|
| Commits ① | Teilung `6d15c0e`; Wackel-Tests rot `71da2de`, grün `f8ce63d` |
| Testzahl | Projekcioj vorher 716, nachher 716 (Namen identisch, 0 übersprungen); `plugin.test.ts` 250 → `plugin-lauf` 47, `plugin-variablen` 40, `plugin-sets` 51, `plugin-rahmen-beispiele` 17, `plugin-doppel` 14, `plugin-bauformen-eingabe` 35, `plugin-bauformen-inhalt` 46 = 250 |
| Projekcioj lokal (zehn Kerne) | 318 s → 90 s Wanduhr der Suite; längste Datei `plugin-sets` 82 s |
| Wackel-Tests | `sxvebilo`, `menuo`, `dialogo` zehnfach: je 170 von 170 in Chromium, Firefox und WebKit |
| Tests lokal | Modelo 3 551, Projekcioj 716, MCP 307, CLI 66 grün; Lint und alle Modelo-Checks ohne Fehler; Browser 243 Specs in Chromium, Alirebleco-Check 561, Vitrino 30 |
| CI | (Lauf nach dem Push) |

## ② Befunde

Folgt in PR ②.
