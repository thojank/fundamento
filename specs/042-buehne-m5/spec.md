# Spec 042 – Bühne lädt sich neu, M5 Stil-Neuberechnung (Nachlauf 041)

**Status:** Auftrag für eine Sitzung im Spec-Modus · **Erstellt:** 2026-11-05, 22:55 · **Basis:** aktuelles `main` (nach #147, #148, Stand `e4873c5`) · **Zielpfad:** `specs/042-buehne-m5/spec.md`

**Regel 0** gilt. **Keine Budgets, Grenzen, Schwellen, Zeitlimits, Abfrageintervalle oder Toleranzen anheben** (auch keine `timeout-minutes`, keine `retries`). **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel in Logs, Dateien oder Commits. Nur die Marken des Repos. Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos in keiner neuen Zeile. Kein Sprachmodell (0 $). Es gilt `standards/global/delivery.md` und `testing.md` (Abschnitt „Playwright stability patterns“).

**Begrenzung der Laufzeit (bindend):** je Wackel-Test höchstens **30 lokale Wiederholungen**. Ist der Fehler damit nicht nachgestellt, wird nicht weiter gesucht, sondern der Trace aus der CI genutzt (Punkt 1). **Je PR genau ein `workflow_dispatch`-Lauf**, keine drei; die Läufe auf `main` macht der Maintainer nach dem Merge. Höchstens 5 Tickets.

## Worum es geht
Nach Spec 041 laufen alle Jobs unter dem Zeitlimit, der Browser-Cache greift (Schritt „Playwright browsers“ 11 s) und M5 war im ersten Lauf auf `main` grün. Rot bleiben einzelne Bühnen-Tests, jedes Mal ein anderer, in allen drei Browsern:

| Lauf | Test | Browser | Bild |
|---|---|---|---|
| 41971858056 | `buehne-036.spec.ts:515` › 3.5 | WebKit | zweites `oeffne()`: Skripte der Seite laufen nicht (B-13) |
| 41931882770 | `buehne-036.spec.ts:296` › 3.2 | WebKit | dasselbe (B-10) |
| 42080252255 | `buehne-036.spec.ts:515` › 3.5 | WebKit | `TypeError: Load failed` |
| 42113762271 | `buehne-036.spec.ts:178` › 3.1 „light and dark are switchable on the stage“ | **Chromium** | `locator.evaluate: Execution context was destroyed, most likely because of a navigation` (Zeile 187) |
| 42103645313 | `zweitfarbe-036.spec.ts:111` › Farbschritt im Schnellstart | Firefox | Testzeit 120 s überschritten |

**These:** Die Bühnen-Seite navigiert sich während des Tests selbst neu (z. B. Neuladen nach neuer `rev`, nach `festlegen` oder durch den `stato`-Abruf). Dann sind „Execution context destroyed“ (Chromium), „Load failed“ und „Skripte laufen nicht“ (WebKit) dasselbe Bild. Zuerst prüfen, ob und wodurch die Seite neu lädt.

## Was gebaut wird
1. **Trace in der CI:** Playwright `trace: "retain-on-failure"` (nur Trace, keine Retries) für die Eroj-Shards; Trace als Artefakt. Damit ist der nächste Fehler sichtbar.
2. **Selbst-Navigation der Bühne finden:** Test, der während eines Bühnen-Ablaufs (öffnen, umschalten, festlegen, zweites Öffnen) jede Navigation des Hauptrahmens mitschreibt (`page.on("framenavigated")` am Hauptrahmen, `performance.getEntriesByType("navigation")`, ein Zähler in `sessionStorage`). Erwartung: genau die Navigationen, die der Test selbst auslöst. Mehr → Ursache im Produkt suchen und beheben (Metiejo, Bühne, `stato`/`rev`); Verhalten für den Nutzer bleibt sonst gleich.
3. **Tests der Bühne härten** nach den Mustern aus `testing.md`: nach einer Aktion, die neu lädt, auf den geladenen Zustand warten (Merkmal der Seite, `readyState`), bevor `evaluate` läuft; nie `waitForTimeout`.
4. **`zweitfarbe-036.spec.ts:111` (Firefox):** Ursache aus dem Trace oder mit ≤ 30 Wiederholungen; Fix wie in 3. Nicht nachgestellt → Befund mit Spur.
5. **M5 (B-14):** Die Werkstatt berechnet je Schieber-Änderung die Stile von etwa 4 700 Elementen neu (Median 40 ms, Grenze 50 ms; Spec 041 D-25). Die Änderung so begrenzen, dass nur der betroffene Bereich neu berechnet wird (z. B. Token-Werte am kleinsten gemeinsamen Vorfahren setzen statt am Wurzelelement, `contain`, weniger Elemente mit betroffenen Variablen). Messung wie Spec 041 (C-2): p90 und Stil+Layout im Median vorher/nachher, lokal und in einem CI-Lauf. Grenze bleibt 50 ms.

## Abgrenzung
- Frei: `packages/eroj/test/buehne-036.spec.ts`, `zweitfarbe-036.spec.ts`, Playwright-Konfiguration der Eroj (nur `trace`), Produktcode der Bühne/Metiejo nur für die gefundene Selbst-Navigation, Werkstatt-Generator unter `packages/projekcioj/src/celoj/vitrino/` für M5.
- Tabu: jede Grenze, jedes Zeitlimit, jedes Abfrageintervall, Retries; `.github/workflows/**` außer dem Hochladen des Traces.

## Tickets (≤ 5, ein Strang)
T1 Trace (1) · T2 Selbst-Navigation finden und beheben (2, 3) · T3 Zweitfarbe Firefox (4) · T4 M5 (5, parallel, eigene Dateien) · T5 PRs, je ein CI-Lauf, Bericht.
**PR A** Bühne und Tests (T1–T3), **PR B** Werkstatt M5 (T4). Beide von `main`, keine gemeinsame Datei.

## Abnahme
- Navigationstest zeigt nur die erwarteten Navigationen.
- M5 p90 lokal und in der CI unter 50 ms, Stil+Layout im Median deutlich unter 40 ms (Wert berichten).
- Diff-Suche: kein Zeitlimit, keine Schwelle, kein `retries`, kein `waitForTimeout` neu.
- Nach dem Merge: drei Läufe auf `main` hintereinander grün (macht der Maintainer).

## Bericht
Kurz, Format von `delivery.md`: PR-Links, CI-Stand, Tabelle Befund → Ursache → Fix, M5 vorher/nachher, was der Maintainer tun soll.
