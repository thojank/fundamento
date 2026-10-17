# Briefing P0 – Nachlese 3 (nach Spec 011) – 2026-10-17

**Basis:** `main` nach dem Merge von #67 (17 Eroj). **Von:** Claude (Review), im Auftrag des Maintainers. **Regel 0** (12.10.) gilt unverändert. **Ablage:** neuer Ordner `specs/012-nachlese-3/` mit plan.md und tasks.md. Eine eigene spec.md gibt es nicht: Dieses Briefing ist die Spec und wird unverändert als `specs/012-nachlese-3/briefing.md` kopiert. Quelle: `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nachlese3/briefing-2026-10-17.md`.

**Zwei PRs, gestapelt:**
1. `261017-nachlese-3-gvidanto-<suffix>` von `main`: Punkte G1–G4 (Antworten des Gvidanto)
2. `261017-nachlese-3-werkzeuge-<suffix>` von ①: Punkte W1–W6 (CI, Prüfungen, Figma, Vitrino, Ontologio)

Rote Tests zuerst, Hash in tasks.md, Bericht im bekannten Format. Kein neues Ero. Keine Token-Änderung.

## ① Gvidanto

**G1 – O-28: „Navigation“ führt zur navigado.**
- `ligilo.goals.navigate` verliert `navigation` (en/de). `navigieren`/`navigate` und `übersicht`/`overview` bleiben beim ligilo (ein Ziel ansteuern).
- `navigado.goals.navigate-app` bekommt `navigation`, `menu`/`menü`, `main menu`/`hauptmenü` (soweit noch nicht da).
- Jugxo, weil eine Antwort, die stand, sich ändert (OP-12): „Navigation“ → navigado statt ligilo, mit Kialo „Wer Navigation sagt, meint die Menge mit aktueller Seite; ein einzelner Link heißt Link.“
- Tests: `suggest_ero "Navigation"` → navigado; `suggest_ero "Link zur Datenschutzerklärung"` → ligilo (unverändert).

**G2 – Gleichstand zweier Goals → ask-human mit beiden Kandidaten.**
- Treffen die Stichwörter einer Anfrage Goals von **zwei verschiedenen Eroj gleich stark** (gleiche Trefferzahl nach der bestehenden Rangfolge), antwortet `suggest_ero` nicht mit einem Ero, sondern mit `action: ask-human` und `candidates: [{ero, goal, keyword, kialo}, …]`.
- Ausgabeschema additiv erweitern (`candidates` optional). Bestehende Antworten ohne Gleichstand bleiben bitgleich.
- Ein eigener `instead`-Eintrag schlägt weiterhin ein eigenes Goal (Spec 011 ②), das ist kein Gleichstand.
- Tests: „Tabs, um zwischen Liste und Formular zu wechseln“ → ask-human, Kandidaten langetaro + elektilo. Alle Beispiel-Dialoge aus Spec 008–011 unverändert grün (Liste in tasks.md).

**G3 – Eindeutigkeit der Stichwörter (⑤ B-1).**
- Neuer Check im Modelo: Steht dasselbe Stichwort (gleiche Sprache) in Goals von zwei Eroj, ist das eine **Warnung** `goal-keyword-shared` mit beiden Fundstellen.
- Bestehende Doppelungen auflisten (Bericht). **Nicht** automatisch entfernen: Jede Doppelung ist eine Entscheidung des Maintainers. Ausnahmen per Jugxo.

**G4 – brief-Grenze strukturell (butono 748, kampo 743).**
- Die Grenze 750 bleibt. Statt weiter Kialos zu kürzen: Im `brief` tragen **Grenzen (`boundary`) nur noch `case` und `action`** (bei use-instead auch `ero`), ohne Kialo. `instead` behält seine Kialo.
- Die volle Kialo liefert `get_ero` ohne `brief` wie bisher. Die Beschreibung von `brief` im Werkzeug-Schema nennt das.
- **Die in Spec 010/011 gekürzten Kialos (O-12-Muster) bleiben gekürzt.** Nichts zurückdrehen.
- brief aller 17 Eroj vorher/nachher in plan.md.

## ② Werkzeuge

**W1 – CI-Laufzeit und Hook-Timeout (⑤ B-9, Spec 011 O-21 fortgesetzt).**
- Ziel: Wanduhrzeit des CI-Laufs ≤ 12 min und **drei Läufe in Folge ohne Hook-Timeout**.
- Weg frei wählbar, strukturell, kein höheres Timeout: z. B. Jobs parallel aufteilen (Unit / Modelo-e2e / Playwright / Checks), Playwright-Shards, gemeinsamer Server je Suite.
- Messung vorher/nachher in plan.md mit Run-Nummern.

**W2 – `check:alirebleco` über jede installierte Aspekto (⑤ B-8).**
- Heute nur komuna. Künftig jede Aspekto, die das Modelo kennt (mindestens komuna und die Fixture ekzemplo).
- Fehler, die dabei in ekzemplo auftauchen (z. B. gelbe Marke auf hellem Grund), sind **Befunde im Bericht, keine Token-Änderung** (Regel 0.3). Gelten sie als Fehler, die den Lauf rot machen, entscheidet der Maintainer; bis dahin Warnung für externe Aspektoj.

**W3 – F-2: Code-Schrift in Figma.**
- Das Plugin löst `font.family.code` als Liste auf: generische CSS-Namen (`ui-monospace`, `monospace`, `SFMono-Regular` …) überspringen, die erste in Figma ladbare Familie nehmen (`figma.loadFontAsync` je Kandidat).
- Ist keine ladbar, bleibt die Warnung, plus ein Manko-Eintrag mit Schließbedingung.
- **Kein Token ändern.** Liefert der Token-Wert keine Figma-taugliche Familie, ist das ein Befund für den Maintainer (Kandidat: Aspekto nennt eine Code-Schrift).

**W4 – F-9: Vitrino zeigt den mezurilo ohne Wert** (Zeile „unbekannt“ je intent oder einmal).

**W5 – F-10: Vitrino verdrahtet die Vorführung** von langetaro (Panel wechselt mit `select`) und tabelo (`sort-change` setzt `sort`, Pfeil dreht sich, Zeilen werden sortiert). Nur in der Vitrino. Die Eroj bleiben, wie sie sind (E10).

**W6 – Ontologio.**
- Neue Begriffe mit de/en-Labels und Definition:
  - Vitrino (Schaufenster der Eroj)
  - Vojmapo (Fahrplan)
  - Kialo (Begründung einer Regel)
  - Alirebleco (Barrierefreiheit)
  - Internacia (Internationalisierung)
  - Komparo (Vergleich mit einem Benchmark-System)
  - Etoso (Kontext und Stimmung, Kandidat)
  - komuna (Referenzmarke)
  - ekzemplo (Testmarke)
- Kampo: altLabels „Passwortfeld“, „Zahlenfeld“, „Datumsfeld“ (① B-4).
- `describe_term` findet jeden davon (MCP-Test je Begriff).

## Entscheidungen, die du NICHT triffst
- Welche Stichwort-Doppelungen aus G3 aufgelöst werden: Liste an den Maintainer.
- Ob externe Aspektoj im Kontrast-Check den Lauf rot machen (W2): Warnung, bis der Maintainer entscheidet.
- Tokens, Regulo-Semantik, Constitution: unverändert.

## Abnahme (Claude/Maintainer)
- MCP-Harness: G1, G2 (Tabs-Dialog), alle Spec-Dialoge, brief der 17 Eroj.
- CI: drei grüne Läufe in Folge, ≤ 12 min.
- Figma: Plugin-Lauf ohne Code-Schrift-Warnung (oder Manko mit Begründung).
- Vitrino: mezurilo „unbekannt“, Reiter-Panel, Sortierung.
- `describe_term` für die neuen Begriffe.
