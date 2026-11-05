# Spec 041 – Wacklige Tests stabil (Nachlauf CI1)

**Status:** Auftrag für eine Sitzung im Spec-Modus · **Erstellt:** 2026-11-05 (ergänzt 06:40 nach drei CI-Läufen) · **Basis:** aktuelles `main` (nach Spec 040, #144 und #145) · **Zielpfad:** `specs/041-wacklige-tests/spec.md`

**Regel 0** gilt. **Keine Budgets, Grenzen, Schwellen, Zeitlimits, Abfrageintervalle oder Toleranzen anheben** (auch keine `timeout-minutes`, keine `retries` in Playwright). **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel in Logs, Dateien oder Commits. Nur die Marken des Repos. Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos in keiner neuen Zeile. Kein Sprachmodell (0 $). Es gilt `standards/global/delivery.md`.

## Worum es geht
Nach Spec 040 laufen alle CI-Jobs unter dem Zeitlimit (Lauf 41971858056: 10m14s gesamt). Rot bleiben einzelne Tests, die mal grün und mal rot sind. Jeder rote Lauf auf `main` kostet einen Neustart und Aufmerksamkeit. Ziel: drei Läufe hintereinander grün auf `main`, ohne eine Grenze anzufassen.

## Befunde
| # | Test / Ort | Bild | Vermutete Ursache |
|---|---|---|---|
| B-8 | Assistent (Metiejo), Neuladen | Abfrage von `stato` läuft nach dem Neuladen weiter | Poll wird beim Entladen nicht gestoppt |
| B-9 | Vorschau-Rahmen, Firefox | Rahmen verliert unter Last seine Navigation | Warten auf Zeit statt auf `load` des Rahmens |
| B-10 | `buehne-036.spec.ts` 3.2, WebKit | gelegentlich rot | unbekannt, zuerst Spur lesen |
| B-12 | verschiedene Jobs | `ECONNRESET` | Netz im Runner; Test darf genau diese eine Anfrage einmal wiederholen, nicht den ganzen Test |
| B-13 | `packages/eroj/test/buehne-036.spec.ts:515` › 3.5 „a component with an open problem has a frame in the warning colour …“, WebKit | `toHaveAttribute` auf `[data-mt-buehne]` schlägt fehl (Lauf 41971858056, Job „Rendered Eroj“ Shard 3) | Attribut wird nach dem Zeitpunkt der Prüfung gesetzt oder neu gerendert; auf das Ereignis bzw. den Zustand warten |
| B-14 | `packages/eroj/test/vitrino.check.ts:1140` › Werkstatt M5 | 90. Perzentil Blockade je Änderung **51, 53, 55 ms** in drei Läufen hintereinander (41971724414, 41971858056, 41973572877), Grenze 50 ms (Job „Timing checks“) | **echt, kein Rauschen** (3 von 3 rot). Die Grenze bleibt 50 ms. Ursache in der Werkstatt finden und beheben (längster Block je Schieber-Änderung; seit wann: Bisektion über die Merges von 036/037) |
| B-15 | `packages/eroj/test/studio-035.spec.ts:250` › 3.4 „a change in the Studio appears in the assistant through rev …“, **Firefox** | `vorschau.css?rev=1` statt `rev=2` nach 5 s (Lauf 41971724414, Shard 3) | wie B-2 aus Spec 040, dort nur für WebKit gelöst; auf neue `rev` bzw. Ereignis warten, in allen Browsern |
| I-1 | Browser-Installation | langsamer Ubuntu-Spiegel bricht Jobs ab | Playwright-Browser im Actions-Cache (Schlüssel aus Playwright-Version), `--with-deps` nur bei Cache-Fehlschlag |

## Was gebaut wird
1. Je Befund zuerst ein **roter Nachweis**: der Test unter Last lokal (`--repeat-each` im Hintergrund, Ausgabe knapp) oder die Spur aus dem CI-Artefakt. Ohne Nachweis kein Fix; dann Befund „nicht nachgestellt“ mit Spur im plan.
2. **Testseitige Fixes:** auf Ereignis, Zustand oder Attribut warten (`expect.poll`, `waitForFunction`, Ereignis aus dem Produkt), nie `waitForTimeout`, nie längere Zeitlimits.
3. **Produktseitige Fixes** nur, wo der Test einen echten Fehler zeigt (B-8 Poll stoppen; B-14, falls echt). Verhalten sonst unverändert.
4. **I-1:** Browser-Cache in den Workflows.
5. Messung: drei `workflow_dispatch`-Läufe auf dem PR-Branch und nach Merge drei auf `main`; Tabelle grün/rot je Job.

## Abgrenzung
- Frei: die genannten Testdateien, `.github/workflows/**` (nur I-1), Playwright-Konfiguration (Reporter, Cache, keine Retries).
- Produktcode nur für B-8 (Metiejo, Poll beim Entladen stoppen) und B-14 (Werkstatt, falls echt).
- Tabu: jede Grenze, jedes Zeitlimit, jedes Abfrageintervall, Retries.

## Tickets (≤ 8, ein Strang, je PR mergebar von `main`)
1. T1 B-13 + B-10 + B-15 (Bühne WebKit, Studio Firefox) · 2. T2 B-8 · 3. T3 B-9 · 4. T4 B-14 (Werkstatt-Leistung, echt) · 5. T5 B-12 + I-1 (CI) · 6. T6 Messung, Bericht.
Zwei PRs reichen: **PR A** Tests und Produkt (T1–T4), **PR B** CI (T5). T6 im Bericht.

## Abnahme
- Drei Läufe auf `main` hintereinander grün, inklusive „Timing checks“.
- Diff-Suche wie Spec 035 AC-4: kein Zeitlimit, keine Schwelle, kein `retries`, kein `waitForTimeout` neu.
- Je Befund: roter Nachweis oder „nicht nachgestellt“ mit Spur.

## Bericht
Kurz, Format von `delivery.md`: PR-Links, CI-Stand, Tabelle Befund → Ursache → Fix, was der Maintainer tun soll.
