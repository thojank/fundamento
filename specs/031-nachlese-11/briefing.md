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

## Entscheidungen des Maintainers (24.10.)
- O-1 (Spec 030): Markenfähigkeit wird ein Tor, K5 bekommt 25 Punkte, beide Gewichtungen werden berichtet. *(Vorschlag; gilt, wenn der Maintainer zustimmt.)*
- Modell: gpt-4.1-mini, bis das Mistral-Konto Anfragen zulässt. Alle Messpunkte laufen mit demselben Modell.

## Auftrag P0
- Ein PR von `main` (nach #112), oder gestapelt auf #112, falls der noch offen ist.
- Rote Tests zuerst. Bericht im bekannten Format, mit den drei Messpunkten, soweit sie schon möglich sind.
- Keine Schlüssel in Logs, Dateien oder Commits.
- Messanleitung mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd` und `file://`-Links.
- ciferecigo kommt nirgends vor.
