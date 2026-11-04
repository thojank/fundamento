# Spec 037 – Agenten bauen Screens (Etappe 11)

**Status:** Auftrag für eine zweite Sitzung im Spec-Modus, parallel zu Spec 036, läuft ohne Rückfragen · **Erstellt:** 2026-10-31 · **Basis:** aktuelles `main` (nach Spec 035) · **Zielpfad:** `specs/037-agenten-ekranoj/spec.md`

**Regel 0** gilt. **Keine Budgets und keine Grenzen anheben.** **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel in Logs, Dateien oder Commits. Keine echten Marken (nur die Marken des Repos: komuna, ekzemplo, provo, provo-kompakta, komuna-0-2). Das Wort aus Regel R-12 von Spec 035 kommt in keiner neuen Zeile vor.

## Worum es geht
Der Nordstern endet mit: *„Danach baut ein Agent damit Screens, und der Gvidanto prüft sie.“* Heute misst die Nordstern-Kennzahl (Spec 030), ob ein Agent mit Fundamento **eine** Seite besser baut als ohne (K: F 83,9 gegen 0 33,3). Was fehlt, ist der Weg für Nutzer: **aus einem Satz und einer Marke mehrere zusammenhängende Screens, die der Agent selbst prüft und so lange verbessert, bis sie grün sind** – mit Begründung für jede verbleibende Abweichung.

## Abgrenzung zu Spec 036 (läuft gleichzeitig)
Spec 036 ändert in vier Spuren den Markenassistenten, die Farbrollen, alle Eroj (Spec 029 ②b-2 bis ③) und benennt in Teil 6 per Skript Namen im ganzen Repo um.

- **Tabu für 037** (Änderung nur als Befund im plan, nicht im Code):
  - `packages/metiejo/**` (Markenassistent, Studio)
  - `packages/modelo/src/gvidanto/**`, Skemoj und Ero-Tokens unter `packages/modelo/src/eroj/**`, `packages/eroj/**`, `packages/vortaro/**`
  - `packages/mcp/schema/**` und die Werkzeuge des MCP-Servers
  - `packages/projekcioj/**`
- **Frei für 037:**
  - ein neues Paket (V-1: `packages/ekranoj`, Esperanto „Bildschirme“), das die vorhandenen MCP-Werkzeuge **als Client** nutzt
  - neue Aufgaben und Auswertungen in `packages/nordstelo` (nur neue Dateien oder klar abgegrenzte Ergänzungen)
  - ein neuer Befehl in `packages/cli` (eigene Datei; die Anmeldung des Befehls ist eine Zeile)
- Braucht 037 ein Werkzeug, das der MCP-Server nicht hat, ist das ein **Befund** („Manko Gvidanto“) mit Vorschlag, kein Umbau.

## Was gebaut wird

### 1. Ablauf „Screens bauen“ (`fm ekranoj`)
- **Eingabe:** ein Satz (Zweck, z. B. „Eine Verwaltung für Standards mit Liste, Detail, Bearbeiten und Einstellungen“), eine Marke (Konfiguration wie in `fm projekcioj build`), optional eine Liste der Screens.
- **Plan:** Der Agent leitet eine kleine Liste von Screens ab (V-2: höchstens 5) mit Zweck je Screen und Navigation zwischen ihnen.
- **Bauen:** je Screen HTML mit den Web Components der Eroj und den Sxablonoj, nur über die MCP-Werkzeuge (`describe`, `suggest_ero`, `get_ero`, Sxablonoj …). Keine eigenen Stile außer Layout über die vorhandenen Layout-Mittel.
- **Prüfen:** je Screen der Gvidanto (`check_usage`), axe im gerenderten Screen und die deterministischen Bewertungen der Nordstern-Kennzahl (K1–K7). Kein Sprachmodell als Richter.
- **Verbessern:** Die Lückenliste der Prüfung geht zurück an den Agenten; höchstens **drei Runden** (V-3) oder bis grün. Was nach der letzten Runde offen bleibt, steht mit Regel und Grund im Bericht des Laufs (wie eine Jugxo: begründet, nicht versteckt).
- **Ausgabe:** ein Ordner je Lauf mit den Screens (HTML), einer Übersichtsseite mit Navigation zwischen den Screens, Bildschirmfotos hell und dunkel, und einem Bericht: Screens, verwendete Eroj und Sxablonoj, Ergebnis je Runde (K1–K7, Verstöße), verbleibende Abweichungen, Tokens, Kosten, Dauer.
- **Kosten:** Schätzung vor dem Start und Zähler wie im Markenassistenten (Logik aus Spec 033 S6 nur **lesen/aufrufen**, nicht ändern); Grenze je Lauf über `--max-tokens`.

### 2. Messung: Screens in der Nordstern-Kennzahl
- Neue Aufgabenart **„ganzer Ablauf“** in `nordstelo`: fünf Aufgaben mit je 3–5 Screens (z. B. Anmelden und Konto, Liste mit Filter und Detail, Formular in Schritten, Einstellungen, Übersicht mit Kennzahlen). Bewertung je Screen mit K1–K7 und zusätzlich: Navigation zwischen den Screens vollständig, gleiche Muster für gleiche Zwecke über Screens hinweg (deterministisch prüfbar beschreiben, im plan begründet).
- Vergleiche: **F gegen 0** (mit und ohne Fundamento) und **Runde 1 gegen Runde 3** (Wirkung der Verbesserungsschleife).
- Reihe K (`ministral-14b-2512`), eine Wiederholung reicht für den ersten Messpunkt; Streuung aus Spec 034 im Bericht nennen.

### 3. Lücken als Rückmeldung an Fundamento
- Der Bericht fasst über alle Läufe zusammen, **welche Eroj, Sxablonoj oder Werkzeuge gefehlt haben** (z. B. Muster, die der Agent nachbauen musste) – als Eingabe für Eroj-Runde 6/7 und Muster-Runde 2. Format wie die Lückenliste der Kennzahl.

## Arbeitsweise
- Wie Spec 035 (R-1 bis R-12 sinngemäß): keine Rückfragen, Vorschläge V-… anwenden und im plan zur Bestätigung führen; Blockiertes in den plan und weiter; bekannter Zeittest einmal neu starten; Läufe im Hintergrund.
- **Eigenes Kostenbudget: höchstens 1,00 $**, nur `ministral-14b-2512`, eigenes Ledger (getrennt von Spec 036). Jeder Lauf mit Tokens, Kosten, Dauer, Commit im plan.
- **Messungen erst, wenn die Sitzung von Spec 036 ihre lokalen Messungen beendet hat** (oder spätestens in deren Pausen); in jeden Messwert die Last des Rechners schreiben (wie Spec 033 B-13). Grund: Beide Sitzungen laufen auf demselben Rechner.
- Tests ohne Modell mit Attrappen; das echte Modell nur für die Messläufe in 1 und 2.
- PRs von `main`: V-4 zwei PRs – „Spec 037 – Ablauf Screens“ (Teil 1 und 3) und „Spec 037 – Messung“ (Teil 2), gestapelt.

## Merge
- Nach Teil 5 von Spec 036 (bessere Kurzprofile ändern die Ergebnisse), vor Teil 6 von Spec 036 (dessen Skript läuft danach erneut über das ganze Repo).
- Vor dem Merge die Messung aus Teil 2 einmal auf dem dann aktuellen `main` wiederholen; im Bericht beide Stände.

## Abnahme durch den Maintainer
- Ein Befehl mit einem Satz und der Marke komuna erzeugt die Screens; die Übersichtsseite öffnet sich als `file://`-Link; der Maintainer klickt durch und liest den Bericht des Laufs.
- Dasselbe mit provo (andere Marke, gleiche Screens): Die Screens tragen die Marke, ohne dass der Agent etwas Markenspezifisches schreibt.

## Nicht in diesem Paket
- Figma-Ausgabe der Screens (später, mit Etappe F).
- Screens im Markenassistenten (Metiejo) anzeigen – nach Spec 036.
- Neue Eroj, Sxablonoj oder MCP-Werkzeuge (Lücken werden gemeldet, nicht gebaut).

## Bericht
Im Format von Spec 035: PRs mit Links, CI, rote/grüne Commits, Messanleitung mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd`, `file://`-Links; Befundtabelle; Entscheidungen V-1 bis V-4 und weitere; Messungen (F gegen 0, Runde 1 gegen 3, je Aufgabe und Screen, mit Last); Lückenliste für Eroj und Muster; Kosten; Merge-Position relativ zu Spec 036 mit Konfliktprüfung gegen deren offene PRs; was der Maintainer in welcher Reihenfolge tun soll.
