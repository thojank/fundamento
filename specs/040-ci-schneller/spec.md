# Spec 040 – Schnellere, verlässliche Tests (CI1)

**Status:** Auftrag für eine Sitzung im Spec-Modus · **Erstellt:** 2026-11-04 · **Start:** nach dem Merge von Spec 036 (alle Teile) und Spec 037 · **Zielpfad:** `specs/040-ci-schneller/spec.md`

**Regel 0** gilt. **Keine Budgets, Grenzen, Schwellen, Zeitlimits oder Toleranzen anheben** (auch keine `timeout-minutes` der CI). **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel in Logs, Dateien oder Commits. Nur die Marken des Repos. Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos in keiner neuen Zeile. Kein Sprachmodell (0 $).

## Worum es geht
Spec 036 lief über 24 Stunden und kostete je Tag Umfang etwa dreimal so viel wie 035 und 037. Ein großer Teil war Warten: volle Builds in jedem Job, alle Tests bei jedem PR, Build-Sperre, lange Protokolle im Kontext der Agenten (300–560 Werkzeugaufrufe je Ticket). Dazu ist die CI auf `main` seit mehreren Läufen rot, obwohl die PRs grün waren (Befunde unten).

## Befunde, die dieser Auftrag behebt
- **B-1 Alirebleco-Zeitlimit:** Job „Rendered accessibility (Alirebleco of the Eroj)“ bricht nach 15 min ab (z. B. Lauf 41827472808, Merge #135). Ursache: mehr Eroj und Doku-Prüfungen. Ebenso „Rendered checks (Vitrino)“: auf #143 (Spec 036 ③, Doku-Abschnitte je Ero) zweimal nach 15 min abgebrochen (Lauf 41864293712, bei Test 30–31 von 57; vorher 53 Tests in 12,1 min); lokal `check:vitrino` grün. Lösung: beide Jobs aufteilen wie „Rendered Eroj“ (Shards), **nicht** das Limit anheben.
- **B-2 wackliger WebKit-Test:** `packages/eroj/test/studio-035.spec.ts:249` › „3.4: a change in the Studio appears in the assistant through rev, within its poll interval (two pages)“ schlägt auf `main` in WebKit gelegentlich fehl (737 bestanden, 1 rot). Lösung: auf das Ereignis bzw. die neue `rev` warten statt auf die Zeit; das Abfrageintervall der Metiejo und alle Zeitgrenzen bleiben.
- **B-3 Jobs nur auf `main`:** Prüfungen, die nur auf `main` laufen, machen Fehler erst nach dem Merge sichtbar. Jeder PR, der eine Datei aus deren Bereich ändert, startet sie auch (Pfad-Filter); ohne Bezug laufen sie nur auf `main` und nachts.
- **B-4 hart gepinnte Zählungen:** Tests mit festen Zahlen (z. B. Kontrastpaare in `kontrast.test.ts`, D-108 aus 036; Token-Zahlen in `bazoj.test.ts`, `ADDED_SINCE_MAIN`, Regelzahl in `contracts.test.ts`) erzeugen bei jedem Merge Konflikte. Die erwartete Zahl wird aus den Daten abgeleitet; geprüft wird die Eigenschaft (z. B. „jedes Paar hat einen Eintrag“), nicht die Summe. Echte Grenzen (z. B. Band 250–400 der Kern-Tokens) bleiben Grenzen.

## Was gebaut wird
1. **Messung vorher:** Dauer je CI-Job auf `main` und auf einem PR (drei Läufe), dazu Dauer von `pnpm build` und `pnpm test` lokal. Tabelle im plan.
2. **Turbo-Cache in der CI** (Actions-Cache für `.turbo`), Schlüssel aus Lockfile und Quellen; unveränderte Pakete überspringen Build und Test.
3. **Nur betroffene Pakete bei PRs:** `turbo run test --filter=...[origin/main]`; auf `main` und nachts alles.
4. **Jeder Job baut nur seine Abhängigkeiten** (`turbo run build --filter=@fundamento/<paket>...`) statt `pnpm build`.
5. **Zeittests getrennt:** M5, Gegenprobe, Ableitung, G5 in einem eigenen Job, der den PR nicht blockiert, aber im Bericht steht (R-8 bleibt).
6. **B-1 bis B-4** wie oben.
7. **Knappe Ausgabe:** Test-Reporter in der CI und lokal für Agenten zeigen nur Fehler und eine Summenzeile; volle Protokolle als Artefakt.
8. **Dieselben Filter lokal:** `pnpm test:betroffen` (oder ähnlich) für Läufe von Agenten; in `CONTRIBUTING`-Notiz und plan beschrieben.
9. **Messung nachher:** dieselbe Tabelle wie in 1; dazu bei einem kleinen Probe-Ticket Werkzeugaufrufe und Dauer vorher/nachher.

## Abgrenzung
- Frei: `.github/workflows/**`, `turbo.json`, Test-Konfigurationen (Vitest, Playwright: Reporter, Shards), Skripte im Wurzel-`package.json`, die Tests aus B-2 und B-4.
- Tabu: Produktcode der Pakete, außer wo B-2 einen Test stabil macht, ohne Verhalten zu ändern. Keine Grenze, kein Zeitlimit, kein Abfrageintervall geändert.

## Abnahme
- Tabelle Dauer je Job vorher/nachher; ein PR, der nur `packages/metiejo` ändert, startet keine Tests von `projekcioj` und `eroj`.
- CI auf `main` grün in drei Läufen hintereinander (B-1, B-2).
- Kein `timeout-minutes`, keine Schwelle, keine Toleranz angehoben (Diff-Suche wie Spec 035 AC-4).
- Gegenprobe: eine absichtlich falsche Änderung in einem Paket macht dessen Tests rot, auch mit Cache.

## Arbeitsweise
Wie Spec 035 (R-1 bis R-12 sinngemäß). Höchstens 8 Tickets, ein PR von `main`. Bericht im Format von Spec 035 mit Messtabelle, PR-Link, CI-Stand und was der Maintainer tun soll.
