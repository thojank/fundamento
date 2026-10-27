# Nachlese 11 – Was die Nordstern-Kennzahl gefunden hat

**Status:** Auftrag · **Erstellt:** 2026-10-24 · **Voraussetzung:** `main`; Spec 030 (#112) zuerst gemergt oder dieser Auftrag gestapelt auf #112 · **Zielpfad:** `specs/031-nachlese-11/briefing.md`

**Regel 0** gilt. **Keine Budgets anheben.** **Keine Änderung an der Optik der Eroj.** Der Auftrag läuft getrennt von Spec 029 (Sitzung A).

## Anlass
Der erste Lauf der Nordstern-Kennzahl (Spec 030, `.fundamento/nordstelo/20261024-0825/`, gpt-4.1-mini) ergab **Variante F 71 gegen Variante 0 74,3**. Fundamento hilft Agenten heute also nicht. Der Lauf zeigte vier Fehler im System und einen Fehler in der Messung.

## ① Fehler im System (zuerst, ein PR)
| # | Befund | Erwartet |
|---|---|---|
| B-7 | `fm-tabelo` mit einer `<table>` ohne `slot="content"` blockiert die Seite, ohne Fehlermeldung. | Die Seite blockiert nie. Fehlt der Slot, wird die Tabelle trotzdem dargestellt, wenn das eindeutig ist; sonst erscheint eine sichtbare Warnung in der Konsole mit dem richtigen Markup. Roter Test im Browser in allen drei Engines. |
| B-2 | Das Skemo nennt den Standard-Slot `label`, die Web Component hat keinen Slot dieses Namens. Agenten schreiben `slot="label"`, das Feld bleibt ohne Beschriftung. **Größte Lücke in den Top-10.** | Skemo, Web Component, React, Make-Kit-Guidelines und Gvidanto sagen dasselbe. Ursache finden und den Widerspruch an der Quelle beheben. Dazu ein **Konformitätstest für alle 40 Eroj und 5 Sxablonoj**: Jeder Slot im Skemo existiert in der Web Component und in React, und umgekehrt. Dasselbe für Props und Ereignisse. |
| B-6 | Weder `fundamento.css` noch der Quickstart setzen eine Seitenfläche. Im dunklen Modus fallen 33 von 60 Seiten im Kontrast durch, in allen Marken. | `fundamento.css` setzt Fläche und Textfarbe der Seite aus den Rollen (`color.background.canvas` o. ä.). Der Quickstart und die Make-Kit-Guidelines zeigen es. Eine Seite, die nur `fundamento.css` lädt, besteht den Kontrast in allen Modi. |
| B-3 | Fünf Werkzeuge des Gvidanto haben Schemata, die OpenAI ablehnt. | Alle Schemata sind für Anthropic, OpenAI und Mistral gültig (strikter Modus, wo nötig). Test gegen die dokumentierten Einschränkungen der drei Anbieter, ohne Netz. |

## ② Messung (gleicher PR oder gestapelt)
- **Markenfähigkeit wird ein Tor (Entscheidung O-1, siehe unten).** Ein Ergebnis, das Marke oder Modus nicht wechseln kann, bekommt für K4 (barrierefrei in allen Marken und Modi) und K5 (keine Rohwerte, keine Nachbauten) null Punkte. Heute bekommt es sie geschenkt, weil sich nichts ändert. Wird nur ein Teil der Kombinationen gewechselt, gibt es Punkte nur für diesen Teil.
- **K5 zählt 25 statt 10.** Die übrigen Gewichte werden anteilig verkleinert. Kialo in den Daten: Der Nordstern verlangt Screens, die jede Marke tragen.
- **Beide Gewichtungen berichten,** die alte und die neue, damit nachvollziehbar bleibt, dass die Regel aus dem Nordstern kommt und nicht aus dem Ergebnis.
- Die gespeicherten 120 Ergebnisse des ersten Laufs werden mit der neuen Gewichtung **neu bewertet**. Das geht ohne neue Läufe, weil die Bewertung deterministisch ist.

## ③ Neue Messpunkte
1. Nach ①: ein Lauf mit gpt-4.1-mini, sonst gleich wie der erste Lauf.
2. Nach dem Merge von Spec 029 ①: derselbe Lauf noch einmal. Das löst Sitzung A aus oder der Maintainer.
- Der Bericht zeigt die drei Messpunkte nebeneinander: Ausgangslinie, nach den Korrekturen, nach der Fonto. Jeweils F gegen 0, mit alter und neuer Gewichtung, Streuung, Tokens und den Top-10 der Lücken.

## ④ Drei Messreihen (Maintainer 24.10., 13:11)
Jeder Messpunkt aus ③ läuft in drei Reihen. Es gelten immer **genaue Modellnamen**, nie `-latest`.

| Reihe | Anbieter | Modell | Zweck | Grenzen |
|---|---|---|---|---|
| H (Hauptreihe) | OpenAI | `gpt-4.1-mini` | Vergleich mit der Ausgangslinie | Kostengrenze `--max-tokens` |
| O (offen, stark) | OpenRouter | `nvidia/nemotron-3-ultra-550b-a55b:free` | starkes offenes Modell | **1 000 kostenlose Anfragen pro Tag** auf dem Konto des Maintainers |
| K (klein) | Mistral | `ministral-14b-2512` | Hilft Fundamento kleinen Modellen mehr? | **0,5 Anfragen pro Sekunde**; andere Mistral-Modelle sind im Tarif des Maintainers gesperrt (403) oder ohne Kontingent (429) |

- **Ersatz für O:** `thinkingmachines/inkling:free`, falls Nemotron nicht verfügbar ist. Der Wechsel steht im Bericht.
- **Grenzen je Anbieter** sind Einstellungen des Laufs: Anfragen pro Sekunde und pro Tag.
- **Bei 429 wartet der Lauf** und versucht es erneut, mit wachsendem Abstand. Er bricht nicht ab.
- **Ist das Tageslimit erreicht** (Reihe O), speichert der Lauf seinen Stand und setzt am nächsten Tag mit demselben Befehl fort. Die bereits fertigen Ergebnisse bleiben gültig.
- **Vor dem Start schätzt der Lauf die Zahl der Anfragen** je Reihe und meldet, wenn das Tageslimit nicht reicht.
- Der Bericht zeigt für jeden Messpunkt **drei Reihen nebeneinander**, mit F gegen 0, alter und neuer Gewichtung, Streuung, Anfragen und Tokens.
- Die Ausgangslinie gibt es bisher nur für Reihe H. Für die Reihen O und K wird sie auf demselben Stand nachgeholt (Commit der Ausgangslinie, eigener Worktree), bevor ① gemergt wird. Geht das nicht mehr, beginnen O und K mit dem Messpunkt nach ①, und der Bericht vermerkt das.
- Keine Schlüssel in Logs, Dateien oder Commits. Die Anbieter-IDs und Modellnamen stehen in den Ergebnissen, die Schlüssel nie.

## Entscheidungen des Maintainers (24.10.)
- O-1 (Spec 030): Markenfähigkeit wird ein Tor, K5 bekommt 25 Punkte, beide Gewichtungen werden berichtet. *(Vorschlag; gilt, wenn der Maintainer zustimmt.)*
- Modelle: drei Reihen H, O, K wie in ④. Mistral Large ist im Tarif des Maintainers nicht verfügbar; es wird nicht genutzt.

## Auftrag P0
- Ein PR von `main` (nach #112), oder gestapelt auf #112, falls der noch offen ist.
- Rote Tests zuerst. Bericht im bekannten Format, mit den drei Messpunkten, soweit sie schon möglich sind.
- Keine Schlüssel in Logs, Dateien oder Commits.
- Messanleitung mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd` und `file://`-Links.
- ciferecigo kommt nirgends vor.
