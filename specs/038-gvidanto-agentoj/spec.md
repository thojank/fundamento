# Spec 038 – Gvidanto für Agenten und Erscheinung der Screens

**Status:** Entwurf, Start **erst nach dem Merge von Spec 036 Teil 1–5 und Spec 037** (#131, #132); vor oder nach Spec 036 Teil 6 nach Lage, siehe Merge · **Erstellt:** 2026-10-31 · **Zielpfad:** `specs/038-gvidanto-agentoj/spec.md`

**Regel 0** gilt. **Keine Budgets und keine Grenzen anheben.** **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel in Logs, Dateien oder Commits. Nur die Marken des Repos. Das Wort aus Regel R-12 von Spec 035 und der Name des privaten Schriften-Repos kommen in keiner neuen Zeile vor.

## Worum es geht
Spec 037 hat gezeigt: Mit Fundamento baut ein Agent über mehrere Screens deutlich besser (Ablauf „Anmelden und Konto“: F 94,5 gegen 0 43,0 in Runde 3; die Verbesserungsschleife bringt +20,9 nur mit Fundamento). Zwei Dinge verhindern noch den Nordstern-Moment:

1. **Zu teuer im Kontext:** Jede Anfrage schickt das ganze Gespräch mit allen Werkzeugantworten erneut; real 70 000–176 000 Tokens je Screen und Runde (Spec 037 D-186, MG-3). Damit trugen 250 000 Tokens nur zwei Screens, und der Messpunkt deckte nur 1¼ von 5 Abläufen.
2. **Regeln grün, Erscheinung roh:** Sichtprüfung der Abnahme-Läufe am 31.10. durch den Architekten:
   - `fm-tabelo` mit roher `<table>` im Slot → Tabelle in Ersatzschrift, ohne Linien und Abstände (Kurzprofil verrät die Datenform nicht).
   - Suchfeld und Tabelle ohne Abstand, kein Seitenraster (kein Werkzeug für Layoutmittel, MG-1; keine Sxablono-Shell genutzt).
   - Detail als lose Textzeilen statt `fm-atributlisto` (nicht gefunden, MG-6).
   - Rahmen von `ekranoj` („Zur Übersicht“) als blauer Standard-Link ohne Grundschrift.
   - K1–K7 bewerten diese Screens mit über 90 Punkten. **Die Kennzahl misst Regeltreue, nicht Erscheinung.**

## Teil 1 – Gvidanto für Agenten (MG-1 bis MG-6 aus Spec 037)
Alle Änderungen additiv; bestehende Werkzeuge und Antworten bleiben für bestehende Aufrufer gleich (Arkitekturo, Nordstern-Kennzahl). Neue Felder oder Werkzeuge nur zusätzlich. Antworten bleiben unter den bestehenden Grenzen (Kurzprofile < 750 Tokens).

1. **MG-1 Layoutmittel:** ein Lesewerkzeug (V-1 `list_arangxoj`), das nennt, womit ein Screen Abstände, Reihen, Spalten und Regionen ordnet, ohne Werte zu schreiben (vorhandene Layout-Eroj/Sxablonoj, Abstandsstufen als Tokens). Fehlt ein Layoutmittel ganz, ist das ein **Manko** für Eroj-Runde 7 (Layout-Primitive), kein Nachbau.
2. **MG-2 `check_markup`:** nimmt ein Fragment als Text, leitet Ero- und Sxablono-Instanzen ab (wie heute nordstelo und ekranoj je für sich) und gibt das Urteil von `check_usage` mit den Instanzen zurück. nordstelo und ekranoj nutzen es statt eigener Ableitung.
3. **MG-3 Schlankes Kurzprofil:** `brief` bzw. `get_ero` mit Feldauswahl liefert Props mit Art und Werten, **Slots mit erlaubtem Inhalt und Datenform** (z. B. wie `fm-tabelo` Spalten und Zeilen bekommt) und die Rolle – das, was ein Agent für richtiges Markup braucht, ohne die volle Antwort.
4. **MG-4 Links:** Navigations-Eroj nennen ihre Ziel-Prop ausdrücklich (z. B. `navigation: { target: "to" }`).
5. **MG-5 Sxablonoj im Markup erkennen:** `get_sxablono` nennt je Region ein Erkennungsmerkmal; `check_markup` prüft damit auch Seitenregeln (Regionen, eine Hauptaktion, Landmarken).
6. **MG-6 `suggest_ero` ohne Treffer:** liefert die nächsten Ziele und Schlüsselwörter (`nearest`), damit der Agent `fm-atributlisto` & Co. findet.

**Messung Teil 1:** Tokens je Screen und Runde vorher/nachher bei gleichem Ablauf (Ziel: ein Bruchteil von heute; kein fester Zielwert, der Wert wird berichtet).

## Teil 2 – K8 Erscheinung (Nordstern-Kennzahl)
- Neues, **deterministisches** Kriterium K8 im gerenderten Screen, je Marke und Farbschema:
  - Anteil sichtbaren Texts in einer Schrift, die nicht aus den Tokens der Marke kommt (Ersatzschrift).
  - Sichtbare native Elemente ohne Fundamento-Stil (z. B. `table`, `a`, `button`, `input` außerhalb einer Ero).
  - Abstände zwischen Geschwistern außerhalb der Abstandsstufen der Marke.
  - Seiten-Sxablono verwendet (ja/nein) bzw. Regionen erkennbar.
- Jedes Merkmal mit Begründung und Gegenprobe (ein absichtlich roher Screen ist rot, ein Screen aus einer Sxablono ist grün).
- Gewichtung: K8 wird zunächst **getrennt berichtet** (wie Navigation und Muster in Spec 037), nicht in die bestehende Summe gemischt. Ob und wie es in die Summe geht, entscheidet der Maintainer (V-2).
- `ekranoj` nimmt K8 in „grün“ auf (Spec 037 D-04 erweitert, im plan).

## Teil 3 – Screens auf Fundamento-Niveau
1. **Rahmen von `ekranoj` aus Eroj:** Rückverweis als `fm-ligilo`, Grundschrift und Hintergrund der Marke im Rahmen.
2. **Seiten auf Basis einer Sxablono-Shell:** Der Agent bekommt im Systemtext die Shell (z. B. `fm-sxelo`/`fm-pagxo`) als Ausgangspunkt; Navigation zwischen den Screens in der Shell.
3. **Kontext klein halten:** je Screen ein frisches Gespräch mit Plan, Kurzprofilen der gewählten Eroj und den Befunden der letzten Runde – nicht das ganze Gespräch.
4. Abnahme durch Sichtprüfung: Bildschirmfotos der Abnahme-Läufe komuna und provo vorher (Spec 037) und nachher nebeneinander im plan.

## Teil 4 – Volle Messung „ganzer Ablauf“
- Die Messung, die in Spec 037 blockiert bzw. unvollständig blieb (2.4 Rest, 2.5): **alle fünf Abläufe**, F gegen 0, Runde 1 gegen Runde 3, dazu K8 und Tokens je Screen.
- Einmal auf dem Stand vor Teil 1–3 (Bezug) und einmal danach.
- Messungen nur ohne fremde Messprozesse auf dem Rechner (Wächter aus Spec 037), Last in jedem Wert.

## Abgrenzung
- Dateien: Gvidanto (`packages/modelo/src/gvidanto/**`), MCP-Werkzeuge und -Schemata (`packages/mcp/**`), `packages/ekranoj`, `packages/nordstelo`. Nicht: Markenassistent (`packages/metiejo/**`), Vortaro, Projekcioj – außer als Befund.
- Läuft eine andere Sitzung parallel, gilt deren Abgrenzung entsprechend; Konfliktprüfung vor jedem Push.

## Arbeitsweise
Wie Spec 035 (R-1 bis R-12 sinngemäß): keine Rückfragen, Vorschläge V-… anwenden und im plan zur Bestätigung führen; Blockiertes in den plan und weiter; bekannter Zeittest einmal neu starten; Läufe im Hintergrund. **Budget: höchstens 1,00 $**, nur `ministral-14b-2512`, eigenes Ledger. PRs: je Teil einer von `main` (Teil 4 als Doku- und Mess-PR).

## Merge
Nach Spec 036 Teil 1–5 und Spec 037. Ist Spec 036 Teil 6 (neutrale Namen) schon gemergt, arbeitet 038 auf den neuen Namen; sonst schreibt 038 keine alten Namen als Literal (Muster Spec 037) und Teil 6 wird danach neu aufgesetzt.

## Bericht
Im Format von Spec 035: PRs mit Links, CI, rote/grüne Commits, Messanleitung mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd`, `file://`-Links; Befunde; Entscheidungen V-1, V-2 und weitere; Messungen (Tokens je Screen vorher/nachher, K1–K8, F gegen 0, Runde 1 gegen 3, alle fünf Abläufe, Last); Bildschirmfotos vorher/nachher; Lückenliste für Eroj-Runde 6/7 und Muster-Runde 2; Kosten; was der Maintainer in welcher Reihenfolge tun soll.
