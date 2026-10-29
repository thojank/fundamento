# Nachlese 12 – Messpunkt „nach der Fonto“, Reihe O, Zeittest M5, Größe der Vitrino

**Status:** Auftrag · **Erstellt:** 2026-10-29 · **Voraussetzung:** `main` `05f122d` (nach #110, #111, #113) · **Zielpfad:** `specs/034-nachlese-12/briefing.md`

**Regel 0** gilt. **Keine Budgets und keine Grenzen anheben.** **Keine Änderung an der Optik der Eroj.** Spec 029 ②b (Sitzung A) und Spec 033 (Sitzung C) laufen parallel; bei Konflikten setzt der spätere PR neu auf.

## ① Nordstern-Kennzahl: Messpunkt „nach der Fonto“
Spec 029 ① ist gemergt, also komuna mit den Werten der Fonto, auch je Ero. Jetzt folgt der dritte Messpunkt aus Nachlese 11 ③:

| Reihe | Modell | Stand | Grenzen |
|---|---|---|---|
| H | `gpt-4.1-mini` | `main` `05f122d` | `--max-tokens 2500000`; Kosten in $ im Bericht (0,40 $ Eingabe, 0,10 $ Cache, 1,60 $ Ausgabe je 1 Mio.) |
| K | `ministral-14b-2512` | `main` `05f122d` | 0,5 Anfragen pro Sekunde |
| O | `nvidia/nemotron-3-ultra-550b-a55b:free` | `main` `05f122d` | 1 000 Anfragen pro Tag; nur `:free` |

- Gleiche Aufgaben, gleiche Wiederholungen und gleiches Werkzeug wie in Nachlese 11. Bewertet wird mit alter und neuer Gewichtung.
- **Läufe im Hintergrund starten, nicht aktiv warten oder abfragen.** Der Maintainer ruft die Sitzung wieder auf.

## ② Reihe O mit einem Werkzeug (Entscheidung O-8 vom 27.10.)
- **Alle drei Messpunkte von O werden mit demselben, heutigen Werkzeug gemessen.** Gemeint sind Werkzeug, Wiederholungen, B-9 und die erneuten Versuche bei leeren Antworten. Gewechselt wird nur der **Stand des Systems** (Eroj, Modelo, Gvidanto, Projekcioj):
  1. Ausgangslinie: System auf `721743f`
  2. nach den Korrekturen: System auf dem Stand des Merges von Nachlese 11 (`af6695a`)
  3. nach der Fonto: System auf `05f122d` (gleich ①)
- Technisch zum Beispiel: Worktree auf dem jeweiligen Commit, der Lauf aber mit dem Werkzeug aus `main`. Wie, legt P0 fest und beschreibt es im plan.
- **Abbruchregel:** Fehlen in einem Messpunkt mehr als 20 % der Ergebnisse (ohne Seite), gilt Reihe O als **nicht messbar mit diesem Anbieter**. Das steht dann so im Bericht, und Reihe O endet. H und K tragen die Aussage.
- Reicht das Tageskontingent nicht, läuft es am nächsten Tag mit demselben Befehl weiter.

## ③ Zeittest M5 der Werkstatt robust machen
- **Befund:** M5 (längste Blockade des Hauptfadens ≤ 50 ms) war in drei PRs auf langsamen CI-Runnern rot: 51, 54, 56 und 65 ms. Lokal und auf schnellen Runnern liegt der Wert bei 0 ms. Die Blockaden sind Stil- und Layoutberechnungen um 50 ms, keine Skripte.
- **Ziel:** M5 schlägt nur noch an, wenn die Werkstatt wirklich langsamer wird, nicht wenn der Runner langsam ist. **Die Grenze von 50 ms bleibt.**
- P0 schlägt den Weg vor und belegt ihn mit Messungen. Mögliche Wege:
  - mehrere Messungen mit Median statt Einzelwert
  - Kalibrierung gegen eine feste Referenzlast auf demselben Runner
  - Trennung von Skript-Blockaden und Stil- und Layoutberechnung

  Die Entscheidung kommt als Abweichung in den plan.
- **Pflicht:** Ein Test, der künstlich eine Blockade von 80 ms in die Werkstatt einbaut, macht M5 **rot**, auf schnellen wie auf langsamen Runnern. Sonst wäre die Prüfung nur aufgeweicht.
- Im Bericht stehen die M5-Werte aus mindestens zehn CI-Läufen, aufgeteilt nach schnellen und langsamen Runnern, vorher und nachher.

## ④ Größe der Vitrino: Kontrastpaare nicht mehrfach ablegen
- **Befund aus Spec 029 ①b:** Die Vitrino mit allen Marken ist von 9,4 auf 15,0 MB gewachsen. Die Kontrastpaare von komuna stehen in **sechs gleichen Kopien**, je Dichte und Bewegung. Das kostet in der CI Zeit beim axe-Lauf.
- Die Kontrastpaare werden **einmal** abgelegt und für jede Dichte und Bewegung darauf verwiesen. Die Anzeige bleibt gleich (Pixelvergleich der betroffenen Abschnitte).
- Im Bericht: die Größe der Vitrino vorher und nachher (komuna allein und alle Marken), sowie die Dauer des Vitrino-Jobs in der CI.
- Das ist ein erster Schritt. Das Aufteilen und Nachladen der Daten bleibt Aufgabe von 8b.

## Bericht
Im bekannten Format, mit:
- der **vollständigen Tabelle der Kennzahl**: H, K, O × Ausgangslinie, nach den Korrekturen, nach der Fonto, alte und neue Gewichtung, Streuung, Anfragen, Tokens, Kosten in $, Ergebnisse ohne Seite
- den Top 10 der Lücken nach der Fonto
- M5 vorher und nachher
- der Größe der Vitrino vorher und nachher

## Auftrag P0
- ① und ② sind Messarbeit: Ergebnisse in plan und tasks, kein eigener Code nötig, außer wenn ② das Werkzeug dafür braucht.
- ③ und ④ in einem PR von `main`. Rote Tests zuerst.
- Messanleitung mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd` und `file://`-Links.
- Keine Schlüssel in Logs, Dateien oder Commits. Das Auslesen von Logs und CI-Ergebnissen ist erlaubt.
- ciferecigo kommt nirgends vor.
