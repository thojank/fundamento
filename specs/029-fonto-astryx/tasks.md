# Spec 029 – Fonto Astryx – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Je PR ein Abschnitt; Aufgaben ab T2901.

## ②a Abgleichstabelle

**Branch:** `261023-spec-029-2a-abgleich-826849` (von `main` `d29a520`, nach #109). Nur plan und Daten, kein Umbau.

### A – Rot zuerst
- [x] **T2901 Doku-Test** in `packages/modelo/src/docs/docs.test.ts` („Spec 029 ②a documentation“), 8 Tests:
  - Spec unverändert (SHA-256)
  - Fonto gepinnt: beide Pakete 0.7.4 mit Integrity, Tag, Commit, MIT
  - alle 40 Eroj mit ihrer ID aus dem Skemo, Gegenstück, Quellpfad und sechs Zeilen in fester Reihenfolge; Vorschlag aus drei Werten, Begründung mit Inhalt, Entscheidung leer oder einer der drei Werte; 240 eindeutige IDs
  - Muster M-1 bis M-4 vorhanden
  - Achsen: eine Achse, die das Ero schon hat, behält ihren Namen; ein neuer Name ist nie der Bezeichner der Fonto
  - fehlende Gattungen mit Quelle, nicht schon zugeordnet, Toast mit E6
  - keine Farbe und keine Länge in den Daten
  - plan mit jeder Zeile und ihrem Vorschlag, den Abschnitten, Messanleitung mit `cd` und `file://`

  Rot in `4075c32`: 7 von 8 rot; grün war nur die Kopie der Spec.

### B – Grün
- [x] **T2902 Fonto lesen:** beide Tarballs außerhalb des Repos, Integrity gegen die Registry geprüft, Commit des Tags `v0.7.4`. Gelesen: `*.doc.mjs` und `*.spec.md` in `packages/core/src`.
- [x] **T2903 Abgleich:** `abgleich.json` mit 240 Zeilen, 14 Mustern und 45 fehlenden Gattungen; Begründungen neu geschrieben, keine Werte der Fonto.
- [x] **T2904 plan ②a:** Fonto (gepinnt), Lesehilfe, Tabellen aus denselben Daten, Abweichungen 1–6, B-1–B-5, O-1–O-6, Messanleitung.

### C – Abschluss
- [x] **T2905 Doku:** tasks, Vojmapo.
- [x] **T2906 Messungen:** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `4075c32`, grün im Folgecommit (Hash im PR) |
| Rot gemessen | Doku-Test 7 von 8 rot |
| Grün gemessen | Doku-Test 8 von 8; Modelo gesamt und Lint im PR |
| Abgleich | 40 Eroj, 240 Zeilen: 27 übernehmen, 72 anpassen, 141 behalten; 14 Muster; 45 fehlende Gattungen (33 Eroj-Runde 6) |
