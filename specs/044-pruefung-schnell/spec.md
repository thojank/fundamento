# Spec 044 – Metiejo: `/pruefung` und erstes Rendern ohne Blockade

**Status:** Auftrag für eine Sitzung im Spec-Modus · **Erstellt:** 2026-11-06, 17:45 · **Start:** nach Spec 038 Lauf 3 (Messung braucht einen ruhigen Rechner) · **Basis:** aktuelles `main` · **Zielpfad:** `specs/044-pruefung-schnell/spec.md`

**Regel 0** gilt. **Keine Budgets, Grenzen, Schwellen, Zeitlimits, Abfrageintervalle oder Toleranzen anheben** (keine `timeout-minutes`, keine `retries`, keine expect- oder Test-Timeouts). **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel. Nur die Marken des Repos. Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos in keiner neuen Zeile. Kein Sprachmodell. Es gilt `standards/global/delivery.md` und `testing.md`.

**Begrenzung der Laufzeit (bindend):** höchstens **5 Tickets**, **ein PR**, ein Push, danach genau **ein** `workflow_dispatch`-Lauf, kein Push danach, kein Neustart. Je Wackel-Test höchstens **30** lokale Wiederholungen. Messungen lokal nur allein auf dem Rechner (Sperre wie Spec 042).

## Worum es geht
Spec 043 hat mit Trace belegt: Der Metiejo-Server ist bei `/api/marko/<marke>/pruefung` und beim ersten Rendern eines neuen `rev` **3–4 s blockiert**, in der CI auch über 5 s. Das ist die gemeinsame Ursache der letzten roten Tests auf `main` und eine echte Wartezeit für Nutzer (Assistent, Schnellstart, Studio).

Lauf 42252367951 (`main` `93b6cae`, nach #153) – einzige rote Tests:
| Test | Browser | Fehler |
|---|---|---|
| `zweitfarbe-036.spec.ts:196` › Schnellstart „the screen is ready while its preview still loads“ | Chromium, WebKit | „the page's request to /api/marko/…/pruefung is answered“ nach 5 s nicht erfüllt |
| `zweitfarbe-036.spec.ts:129` › Assistent „Keine Zweitfarbe …“ | WebKit | Rahmen `iframe[data-mt-vorschau]` mit `rev 2` nicht in 5 s geladen |

## Was gebaut wird
1. **Messen, wo die Zeit hingeht:** je Anfrage `/pruefung` und erstes Rendern eines `rev` die Dauer der Schritte (Laden der Marke, Ableitung, Regeln/Prüfung, Projektion, CSS/JS-Erzeugung), lokal und in einem CI-Lauf. Tabelle im plan. Keine neue Abhängigkeit (Node `performance`).
2. **Blockade beheben,** je nach Messung, ohne Ergebnis zu ändern:
   - wiederholte Arbeit je Anfrage zwischenspeichern (Schlüssel aus Marke und `rev`; ungültig bei neuem `rev`),
   - Prüfung und Rendern nicht hintereinander auf demselben Anfragepfad, wenn sie voneinander unabhängig sind,
   - lange synchrone Schritte aus dem Ereignis-Loop nehmen (z. B. in Teilen oder in einem Worker), sodass andere Anfragen (`stato`, Vorschau) in der Zeit beantwortet werden.
   Antworten bleiben byte-gleich (Vergleich vorher/nachher für einen festen Satz Marken und `rev`).
3. **Ziel:** `/pruefung` und erstes Rendern lokal im Median **unter 1 s**, in der CI sicher unter 5 s; `stato` wird während einer Prüfung in unter 200 ms beantwortet. Das sind Messziele für den Bericht, keine neuen Grenzen im Code.
4. **Tests:** die beiden roten Tests aus der Tabelle laufen ohne Änderung grün; ein neuer Test zeigt, dass `stato` während einer laufenden Prüfung antwortet.

## Abgrenzung
- Frei: `packages/metiejo/src/**` (Server, Prüfung, Rendern), Tests in `packages/metiejo`, `packages/eroj/test/zweitfarbe-036.spec.ts` nur lesend bzw. unverändert, `specs/044-pruefung-schnell/**`.
- Tabu: jede Grenze, jedes Zeitlimit, der `stato`-Takt, Retries; `.github/**`; Root-Dateien; `packages/modelo/**`, `packages/nordstelo/**`, `packages/ekranoj/**`, `packages/mcp/**` (Spec 038 Lauf 4 kann parallel laufen).

## Tickets (≤ 5, ein Strang)
T1 Messung vorher · T2 Zwischenspeicher und Trennung · T3 Ereignis-Loop frei (falls nach T2 nötig) · T4 Byte-Gleichheit und Tests · T5 PR, ein Dispatch, Messung nachher, Bericht.

## Abnahme
- Messung vorher/nachher je Schritt im plan; Ziele aus Punkt 3 erreicht oder Befund mit Werten.
- Antworten byte-gleich.
- Im Dispatch-Lauf alle Eroj-Shards grün in allen drei Browsern.
- Diff-Suche: kein Zeitlimit, keine Schwelle, kein `retries`, kein `waitForTimeout` neu; `stato`-Takt unverändert.
- Nach dem Merge: drei Läufe auf `main` hintereinander grün (Maintainer).

## Bericht
Kurz: PR-Link, CI je Job, Messtabelle vorher/nachher, was der Maintainer tut. Dann stoppen.
