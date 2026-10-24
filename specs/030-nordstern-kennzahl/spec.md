# Spec 030 – Nordstern-Kennzahl: Agenten bauen Screens, Fundamento bewertet deterministisch

**Status:** Entwurf · **Constitution:** kein Amendment vorgesehen. Braucht die Spec neue Begriffe für das Vortaro, schlägt P0 sie im plan vor; der Maintainer entscheidet, ob daraus ein Amendment wird. · **Erstellt:** 2026-10-23 · **Voraussetzung:** `main` nach #108; unabhängig von Spec 029 · **Zielpfad:** `specs/030-nordstern-kennzahl/spec.md`

**Regel 0** gilt. **Keine Budgets anheben.**

## Anlass
Der Nordstern hat zwei Teile. Teil 2 lautet: *Ein Agent baut mit der Marke Screens, und der Gvidanto prüft sie.* Bisher wird das nicht gemessen. Astryx misst etwas Ähnliches jede Nacht mit kontextfreien Agenten und einem KI-Richter („Vibe Tests“). Der Maintainer hat am 23.10. entschieden: **Den Ablauf übernehmen wir, die Bewertung bleibt deterministisch** (Etappe 11, Festlegung vom 08.10.). Kein KI-Richter, keine Note, die mit dem Modell schwankt.

**Wert sofort:** Ein erster Lauf **vor** Spec 029 ① liefert die Ausgangslinie. Der Lauf danach zeigt, ob die Übernahme aus der Fonto Agenten tatsächlich hilft.

## Ablauf
1. **Aufgabenkatalog:**
   - Anfangs 20 Aufgaben in Alltagssprache, Deutsch und Englisch, zum Beispiel:
     - „Ein Anmeldeformular mit E-Mail und Passwort“
     - „Eine Liste von Werkzeugen mit Suche und Filter nach Status“
     - „Einstellungen mit Benachrichtigungen und Sprache“
     - „Ein Assistent in drei Schritten für eine Ausleihe“
     - „Eine Detailseite mit Eigenschaften und Verlauf“
   - Die Aufgaben decken alle 5 Sxablonoj und mindestens 30 der 40 Eroj ab.
   - Jede Aufgabe trägt prüfbare **Abnahmekriterien**, zum Beispiel „genau eine primäre Aktion“, „jedes Feld hat eine Beschriftung“ oder „Fehler sagt, was zu tun ist“. Sie verweisen auf eine Regulo mit Kialo.
   - Den Katalog speichern wir als Daten im Modelo, mit IDs nach Regel 0.1.
2. **Kontextfreier Agent:**
   - Ein Lauf bekommt nur die Aufgabe und einen Zugang: **Variante F** den Gvidanto (MCP), **Variante 0** nichts außer „baue es als HTML“, als Vergleichslinie.
   - Anbieter und Modell kommen aus der `.env` (`FM_KI_ANBIETER`, `FM_KI_MODELL`, Schlüssel). Schlüssel werden nie protokolliert.
   - Je Aufgabe und Variante **3 Läufe**, damit die Streuung sichtbar wird.
3. **Ausgabe:** eine HTML-Seite mit den Web Components von Fundamento (Variante F) bzw. reinem HTML (Variante 0). Gerendert wird mit Playwright in allen Marken und Modi.
4. **Bewertung, deterministisch, je Lauf:**

   | # | Kriterium | Prüfung |
   |---|---|---|
   | K1 | Rendert ohne Fehler | Playwright, Konsole |
   | K2 | Keine erfundenen Bezeichner: nur bekannte Tags, Props, Werte und Slots | gegen das Modelo |
   | K3 | Reguloj erfüllt | `check_usage` |
   | K4 | Barrierefrei in allen Marken und Modi | Alirebleco: axe und Kontrastpaare |
   | K5 | Keine Rohwerte (Farben, Abstände, Schriften von Hand) und keine nachgebauten Eroj | Lint |
   | K6 | Abnahmekriterien der Aufgabe erfüllt | je Aufgabe |
   | K7 | Aufwand | Tokens, Zeit, Zahl der Werkzeugaufrufe, Größe des Markups |

   Gibt es K5 noch nicht als Prüfung, baut P0 die kleinste Fassung, die K5 entscheidet. Das ist der Keim von `fm lint` (Etappe 9).
5. **Kennzahl:**
   - Je Lauf ein Wert von 0 bis 100 aus K1 bis K6. Die Gewichte stehen als Daten mit Kialo.
   - Je Aufgabe der Median der 3 Läufe.
   - Gesamtwert ist der Median über alle Aufgaben, getrennt nach Variante F und 0.
   - K7 wird nur berichtet, nicht gewichtet.
6. **Verlauf und Rückkopplung:**
   - Jeder Lauf schreibt sein Ergebnis mit Datum, Commit, Modell und Kennzahlen.
   - Die Metiejo, oder die Vitrino, wenn das einfacher ist, zeigt die Kennzahl über die Zeit, je Aufgabe mit Link auf die erzeugte Seite und einen Screenshot.
   - Aus jedem Fehler entsteht eine **Lückenliste**: welche Bezeichner Agenten erfinden, welche Regeln sie verletzen, welche Eroj sie nachbauen. Daraus werden Aufgaben für Gvidanto, Uzo und Doku, aber keine Regeländerungen. Regeln ändert nur der Maintainer.
7. **Auslösen:**
   - Auf Abruf mit einem Befehl, Name nach Art. II.
   - Optional als geplanter Lauf auf dem Rechner des Maintainers, mit seinen Schlüsseln.
   - **Nicht in der CI**, wegen der Kosten und der Schlüssel.
   - Eine **Kostengrenze** je Lauf ist einstellbar. Ist sie erreicht, bricht der Lauf mit Bericht ab.

## Determinismus
- Die Bewertung eines gespeicherten Ergebnisses ergibt **immer dieselbe Zahl**. Dafür gibt es einen Test, der gespeicherte Ausgaben erneut bewertet.
- Nur die Erzeugung durch den Agenten streut. Diese Streuung wird über die 3 Läufe gemessen und berichtet.

## Nicht Teil dieser Spec
- KI-Richter
- Bewertung der Gestaltung durch ein Modell. Die Gestaltung beurteilt der Maintainer anhand der Screenshot-Galerie.
- Templates
- Agenten, die Screens in Figma bauen

## Abnahme
1. Ein vollständiger Lauf mit 20 Aufgaben × 2 Varianten × 3 Läufen mit einem Modell aus der `.env`. Der Bericht enthält die Kennzahl F gegen 0, den Wert je Aufgabe, die Streuung und die Top-10 der Lücken.
2. Der Test für die erneute Bewertung ist grün.
3. Die Ansicht mit dem Verlauf zeigt den ersten Lauf.
4. Die Kosten des Laufs (Tokens) stehen im Bericht.
5. CI grün, **ohne angehobene Budgets**.

## Auftrag P0
- Ein PR von `main`, eigener Worktree. Rote Tests zuerst, Bericht im bekannten Format.
- Der erste Lauf läuft **vor** dem Merge von Spec 029 ① als Ausgangslinie, später wiederholt.
- Messanleitung im plan mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd` und `file://`-Links.
- Keine Schlüssel in Logs, Berichten oder Commits.
- ciferecigo kommt nirgends vor.
