# Nachlese 5 – Aufgaben

**Spec:** [`briefing.md`](briefing.md) · **Plan:** [`plan.md`](plan.md). Aufgaben ① zählen ab T1801, ② ab T1901.

## ① CI: `plugin.test.ts` teilen (O-5)

**Branch:** `261019-nachlese-5-ci-f027c6` (von `main` @ `ef3c8db`; nach dem Merge von #77 auf `main` @ `a1dc8b6` rebased – die Hashes sind die nach dem Rebase).

### A – Teilung
- [x] **T1801 Basis** Projekcioj-Suite mit dem JSON-Reporter vor der Teilung: 716 Tests, davon 250 in `plugin.test.ts` (310 s in einer Datei, die Suite 318 s).
- [x] **T1802 Teilung** sieben Testdateien nach Themen, ein Hilfsmodul ohne Tests (plan ① D-01). `24aa569`. Nachher 716 Tests, Namen identisch, keiner übersprungen.

### B – Wackel-Tests (rot zuerst)
- [x] **T1803 Tests** `sxvebilo.spec.ts` Escape wartet auf Zustände, `dialogo.spec.ts` Escape gibt dem Öffner den Fokus wie die Tastatur (plan ① D-02, D-03). Rot `d5a8279`: `sxvebilo` Escape in Firefox 10 von 10 (der Fokus kehrt nicht zum Auslöser zurück).
- [x] **T1804 Fix** `focusout`-Regel der Overlays (`sxvebilo`, `menuo`) im Element-Template. Grün `72534b0`.

### C – Abschluss
- [x] **T1805 Doku** plan ①, tasks ①, Doku-Test.
- [x] **T1806 CI** Zeiten je Job; zwei Projekcioj-Shards reichen (O-1: nein). Die gerenderten Checks lagen über 7 min: axe über die Eroj als eigener Job (plan ① D-04), rot `c667734`, grün im Commit danach.
- [ ] **Aufräumen (älter als dieser Branch):** Biome-Warnung `DESIGN` unbenutzt in `packages/projekcioj/src/celoj/web-component/web-component.test.ts`.

### Messungen

| Was | Wert |
|---|---|
| Commits ① | Teilung `24aa569`; Wackel-Tests rot `d5a8279`, grün `72534b0` |
| Testzahl | Projekcioj vorher 716, nachher 716 (Namen identisch, 0 übersprungen); `plugin.test.ts` 250 → `plugin-lauf` 47, `plugin-variablen` 40, `plugin-sets` 51, `plugin-rahmen-beispiele` 17, `plugin-doppel` 14, `plugin-bauformen-eingabe` 35, `plugin-bauformen-inhalt` 46 = 250 |
| Projekcioj lokal (zehn Kerne) | 318 s → 90 s Wanduhr der Suite; längste Datei `plugin-sets` 82 s |
| Wackel-Tests | `sxvebilo`, `menuo`, `dialogo` zehnfach: je 170 von 170 in Chromium, Firefox und WebKit |
| Tests lokal | Modelo 3 551, Projekcioj 716, MCP 307, CLI 66 grün; Lint und alle Modelo-Checks ohne Fehler; Browser 243 Specs in Chromium, Alirebleco-Check 561, Vitrino 30 |
| CI (Teilung, fünf Jobs) | Lauf 39245801159 (`a4f2c8b`, alle Jobs grün, Wanduhr 8:18): `checks` 1:16, `unit` 3:07, `projekcioj` **3:06 / 3:10** (vorher 9:29 / 1:03), `eroj` 1:51 / 1:58, `rendered-checks` **8:18** (axe 227 s, Vitrino 138 s, Make Kit 45 s, Quickstart 16 s) – über 7 min, daher D-04 |
| CI (sechs Jobs) | Lauf 39247019640 (`ee67be1`, alle Jobs grün, **Wanduhr 4:55**, vorher 9:29 in #79): `checks` 1:07, `unit` 4:37, `projekcioj` 2:51 / 2:29, `eroj` 2:03 / 2:18, `alirebleco-eroj` 4:55, `rendered-checks` 3:11 – kein Job über 7 min; grüner Stand `ee67be1` |
| Rebase auf `main` nach #77 (`a1dc8b6`, 2026-10-19) | ein Konflikt im Doku-Test (Block 016 ① aus #77 und Block Nachlese 5, beide behalten). Lokal: Agordilo 35, MCP 307, CLI 66, Projekcioj 716, Modelo 3 560 grün – `export/build.test.ts` „building twice is byte-identical“ lief im parallelen Gesamtlauf auf zehn Kernen in die 30-s-Grenze, allein 3 von 3 grün (Last; dasselbe wie beim Rebase von #77, seit dort die Agordilo-Suite mitläuft); Lint und alle Modelo-Checks ohne Fehler; Browser 243 Specs in Chromium; CI in der Zeile danach |

## ② Befunde

Folgt in PR ②.
