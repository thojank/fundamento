# Spec 050 – Bericht (wacklige Browser-Tests aus Spec 036)

Stand T5 (2026-11-13, 09:30), alles außer CI. Basis `main` `de931e40`, Branch `261112-wacklige-browser-tests--9197f6`. Quellen: [`spec.md`](spec.md), [`plan.md`](plan.md), [`tasks.md`](tasks.md). Reihen, Berichte und Traces außerhalb des Repos unter `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwdq3cluiyydrirx/s050-lokal/<reihe>/`.

## 1. PR, Dispatch, CI je Job

<!-- PLATZHALTER PR -->

<!-- PLATZHALTER CI je Job -->

## 2. Ursache je Test (Kurzform von V-1, `plan.md` › „Ursache je Test“)

| Test | Engine(s) | Klasse | Ursache | Fix |
|---|---|---|---|---|
| T-A `zweitfarbe-036:130` Assistent | alle drei | K4 Prüfung (+K2, +K1) | Rahmen rev 2 antwortet erst nach der Prüfung (CI 3,9 bis > 11 s), `rahmenBereit` pollt 5 s; WebKit zusätzlich: `dokument()` war keine feste Kennung (B-14) | Prüfung −8 % (`2f6c33a6`, rot zuerst `af045d7e`); Warten auf die Antwort vor dem Zustand (`c5147982`) |
| T-B `zweitfarbe-036:203` Schnellstart | alle drei | K4 Prüfung (+K2, +K1) | erste `POST /pruefung` der neuen Marke bei Testende offen (≥ 4,4 bis ≥ 6,3 s), 5-s-Poll | wie T-A |
| T-C `buehne-036:553` 3.4 | Firefox | K4 Navigation (+K3) | Firefox gab beim Neuladen jedem Rahmen sein letztes Dokument zurück, der Client schickte ihn noch einmal hin; der zweite Kontext zerstörte `knopf()` | Client legt Kopien der Rahmen an ihre Stelle (`de3fd057`, rot zuerst `fd90b67b`); `knopf()` liest von der Seite (`9a51b5cd`) |
| T-D `buehne-036:679` 3.5 | Firefox | K3 (+K5, +K1) | Erwartung im `frameLocator` nach Navigation des Rahmens endet in Playwright-Firefox nie | Zustände von der Seite aus gelesen und vor jeder Aktion bestätigt (`9a51b5cd`) |
| T-E `achsen-2b2:90` | macOS-WebKit | K5 | macOS-WebKit erreicht Buttons nur mit `Alt+Tab` | Taste nach Engine **und** Plattform (`8a982bd5`), Erwartungen unverändert |

## 3. Messung vorher/nachher (V-2, lokal, `messung-044`)

| Schritt | vorher (`de931e40`) | nachher (`2f6c33a6`) |
|---|---|---|
| erste `POST /pruefung` eines neuen `rev`, Median / Max | 1613 / 2434 ms | **1491 / 2103 ms** |
| davon Ableitung / Prüfregeln (Profil) | ≈ 99 / ≈ 1649 ms | ≈ 36 / ≈ 1555 ms (Code der Prüfregeln unverändert) |
| Rahmen (Prüfung im Speicher) / `GET stato` | 0,2 / 0,4 ms | 0,2 / 0,4 ms |
| `GET vorschau.css` eines neuen `rev` | 155 ms | 50 ms |

**Unter 1 s ist nicht erreicht (B-11):** 82 % der Prüfung liegen in `validateModeloFiles`, 10 % in `evaluateAlirebleco`, beide in `packages/modelo` (tabu). Byte-gleich: `antworten-044` und `ableitung-050` unverändert grün. Die Zahlen aus dem Dispatch fehlen noch (T6).

## 4. 30/30 (V-3), vorher → nachher

Stufe (1) CI-ähnlich (`--workers 2`, drei Engines, Test mit `--repeat-each=30` samt Rest der Datei); Stufe (2) dazu 6 Busy-Loops (D-13). Alle Reihen gezählt: unter der Sperre, ohne fremde Test-Prozesse (`fremdtest.sh` alle 30 s, 0 Treffer). Nachher auf `91c2a9a1`.

| Test | Engine | Stufe (1) vorher → nachher | Stufe (2) vorher → nachher |
|---|---|---|---|
| T-A Assistent | Chromium | **29/30 → 30/30** | 30/30 → 30/30 |
| | Firefox | 30/30 → 30/30 | 30/30 → 30/30 |
| | WebKit | 30/30 → 30/30 | **26/30 → 30/30** |
| T-B Schnellstart | je Engine | 30/30 → 30/30 | 30/30 → 30/30 |
| T-C 3.4 | je Engine | 30/30 → 30/30 | 30/30 → 30/30 |
| T-D 3.5 | je Engine | 30/30 → 30/30 | 30/30 → 30/30 |
| T-D im Shard 2/4 | Firefox | 1/1 → 1/1 | – |
| T-E | macOS-WebKit | **0/30 → 30/30** | – |

**Was das beweist:** Nur T-A und T-E hatten lokal eine Vorher-Rate unter 30/30; bei ihnen zeigt die Reihe die Wirkung. **T-B, T-C und T-D waren lokal schon vorher 30/30.** Ihr 30/30 nachher zeigt nur, dass nichts schlechter wurde, nicht, dass der Fix wirkt. Ihr Nachweis ist der Dispatch. Für T-C belegt zusätzlich der rote Test „3.4 (Spec 050)“ die Ursache (Firefox 3/3 rot → grün, nachher 30/30 je Engine in beiden Stufen).

**Ein Rot in einer Reihe, kein Zieltest (B-17):** `buehne-036:414` „3.2: the material's proposal stands right first …“, WebKit, Stufe (2), Wiederholung 9 (29/30; Stufe (1) 30/30, T1 vorher in beiden Stufen 30/30). Es reißt `rahmenBereit` (`geladen-042.ts:139`, seit Spec 042/043 unverändert) über `geladen()` (`:131`) nach dem zweiten `oeffne()` (`:422`): Das Dokument von „Jetzt“ war nach 5 s noch nicht „complete“; seine Unterressourcen kamen 5,3 s nach der einen Anfrage des Rahmens, ein `evaluate` von WebKit brauchte allein 4 s. Je Rahmen eine Anfrage, also keine doppelte Navigation. Die Reihe lief deutlich härter als vorher (Load 1 min bis 122 gegen höchstens 34 in T1, 5534 s gegen 4696 s), ohne fremde Test-Prozesse. Lesart: Last (K1) an einem festen 5-s-Fenster (K2) in einer Wartestelle, die dieser Lauf nicht geändert hat. Derselbe Test war auf der Basis schon einmal rot in WebKit (B-10, unter fremder Last). Nicht repariert, nicht gegengeprüft (keine zweite Reihe). Trace: `…/s050-lokal/buehne-nachher-cpu/test-results/buehne-036-Bühne-Spec-036--858ee-brings-it-to-the-left-frame-webkit-repeat9/trace.zip`.

## 5. Regressionen

- **Ganze Eroj-Suite, drei Engines, `--workers 4`:** 2026 grün, 0 rot, 2 übersprungen (Chromium 676, Firefox 675 + 1, WebKit 675 + 1). Die beiden übersprungenen Tests laufen mit Absicht nur in Chromium (`forced-colors.spec.ts:14`, `quickstart.spec.ts:47`); sie sind älter als dieser Lauf. `buehne-navigation-042:439` ist in WebKit mit Absicht `test.fail` (Spec 043) und schlägt dort wie erwartet fehl.
- **`modelo` allein:** 4954 grün. **`pnpm lint`:** grün (auch ohne Turbo-Cache, `--force --concurrency=1`; Warnungen nur in unveränderten Dateien).
- **`pnpm test:betroffen`:** rot nur in `nordstelo` (15 von 272: 13 Test- und 2 Hook-Zeitfenster, keine fehlgeschlagene Erwartung), wie T2 (B-13). Derselbe Paketsatz nacheinander mit `--continue`: 18 von 19 Aufgaben grün (`metiejo` 686, Eroj-Playwright Chromium 676, `modelo` 4954, `cli` 120 neu gelaufen; `agordilo`, `ekranoj`, `mcp`, `nordstelo` aus dem Cache des grünen T2-Laufs). Rot nur `projekcioj` `figma-cxiuj.test.ts:32`, Hook-Zeitfenster 180 s. Allein danach: `nordstelo` 270/270 (ohne Cache), `figma-cxiuj` 5/5. Kein Paket-Test ist durch diesen Lauf rot, kein Fenster angehoben.

## 6. Diff-Suche (AC-6, AC-8)

Die Suche nach Zeitlimits, Toleranzen, `skip`/`fixme`/`fail`/`only`, Engine-Weichen und `framenavigated` trifft nur `achsen-2b2.spec.ts` (`browserName` an vier Stellen): Das ist die Tasten-Weiche aus T4 (D-25). Sie wählt die Taste, sie schließt keine Engine aus. Alle Änderungen liegen in der freien Zone. Keine Tabu-Datei, keine Baseline, kein Snapshot. Der `stato`-Takt ist unverändert, `antworten-044.json` auch. Die roten Commits stehen vor ihren Fixes, und die Testdatei bleibt im Fix-Commit unverändert. **Nichts verstößt gegen Regel 0.** Ausgabe wörtlich: `plan.md` › „T5 – Diff-Suche“.

## 7. Offene Befunde

- **Unter 1 s nicht erreicht (B-11):** Dafür müsste `packages/modelo` Teilergebnisse je Kombination wiederverwenden oder nur das Paket der Marke prüfen. Das wäre eine eigene Spec.
- **T-B, T-C und T-D waren lokal nie rot** (ohne fremde Last). Ob ihre Fixes in CI wirken, zeigt erst der Dispatch.
- **B-15 bleibt offen:** Warum T-B (Schnellstart `:203`) in CI 11/11 rot war und die Schwester-Variante `:130` 0/11, ist nicht belegt.
- **T-D, Rest-Risiko:** `komponente.focus()`, die Tooltip-Erwartungen und `toHaveAccessibleDescription` stehen weiter im `frameLocator`. Fehlt Playwright-Firefox der Kontext des Rahmens, kann dort weiter eine Erwartung nicht enden. Sie kommt jetzt erst nach vier von der Seite aus bestätigten Zuständen. Dasselbe Muster hat `buehne-036` 3.6 „dunkel“ (B-04, B-09; nicht Ziel der Spec, nicht angefasst).
- **B-17** (oben): `buehne-036:414` 3.2 WebKit 1/30 rot unter Stufe (2), an einem unveränderten 5-s-Fenster.
- **Fremde Wackler, nur Befund:** `modelo` `ci/turbo-inputs.test.ts:679` (Hook-Zeitfenster in CI, Spec 049) und `ekranoj` B-11 `rondoj.test.ts:733`. `nordstelo` hält im gemeinsamen lokalen Lauf unter Last die Fenster von 5 s und 10 s nicht (B-13; in T2 und T5 je 12–15 Zeitfenster, allein 270/270). `projekcioj`: in T2 `fonto/komuna-fonto.test.ts:182` einmal über 60 s, in T5 `celoj/figma/figma-cxiuj.test.ts:32` einmal über 180 s im Hook, beide allein grün.

## 8. Was der Maintainer tut

1. Den PR prüfen (Link oben), vor allem `plan.md` › „Ursache je Test“, die ersetzten Erwartungen (`tasks.md` › „Geänderte Erwartungen älterer Tests“) und B-17.
2. Mergen, wenn der Dispatch die Eroj-Shards 1–4 in allen drei Engines grün zeigt (AC-5).
3. Danach drei Läufe auf `main` (Push und zweimal `schedule` oder Dispatch) ansehen: Erst wenn T-A bis T-D dort in keinem Lauf rot sind, sind sie stabil. Bleibt einer rot: Trace sichern, B-15 bzw. das Rest-Risiko von T-D sind die nächsten Vermutungen.
