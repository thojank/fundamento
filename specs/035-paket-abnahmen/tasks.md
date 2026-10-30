# Spec 035 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `367b7a52`. Aufgaben ab T3501. Rote Commits enden auf „(rot)“, grüne auf „(grün)“; Häkchen mit SHAs.

## Teil 1 – Prüfungen verlässlich

**Branches:** `261030-spec-035-t1-pruefungen` (1.2, 1.3, Doku) · `261030-ableitung-kalibriert` (#125, 1.1).

### A – Rot zuerst
- [ ] **T3501 1.2** Gegenprobe 2 unter gedrosselter CPU (CDP `Emulation.setCPUThrottlingRate`): die Kalibrierung bricht heute unter 80 ms ab.
- [ ] **T3502 1.3** AK-07: Test für die Ursache, wenn sie sich als Regel ausdrücken lässt; sonst die Messung als Beleg (Entscheidung im plan).
- [ ] **T3503 1.1** #125: Kalibriertabelle und Test, der den Bezugswert der schnellen Runner an ihren Median bindet (D-13).

### B – Grün
- [ ] **T3504 1.2** Kalibrierung regelt nach (Median über mehrere Umschaltungen, feste Obergrenze der Elemente, klare Meldung); M5 50 ms und Probe 80 ms unverändert.
- [ ] **T3505 1.3** Ursache der +90 ms behoben (D-06).
- [ ] **T3506 1.1** Bezugswert gesetzt; Grenze 150 ms unverändert.

### C – Messung und Abschluss
- [x] **T3507 Doku:** Spec wortgleich (SHA-256 `472d2c44…f6be264a`), Gerüst von plan und tasks.
- [ ] **T3508 1.1** #125 auf `367b7a52` neu aufgesetzt; mindestens zehn CI-Läufe, Tabelle je Runner (Referenz, Ableitung, Gegenprobe).
- [ ] **T3509 1.3** CPU-Profile von `367b7a52` und vor #122; AK-07 vorher/nachher, je vier Läufe im Wechsel.
- [ ] **T3510 1.2** Gegenprobe 2 je Runner in der CI.
- [ ] **T3511** PR Teil 1 und #125: CI, Neustarts nach R-8.

## Teil 2 – Felder

**Branches:** `261029-spec-029-2b1b-status` (#123, 2.1, 2.2) · `261030-spec-035-t2-figma` (2.3, gestapelt auf #123, D-08).

### A – Rot zuerst
- [ ] **T3512 2.1** #123 auf `367b7a52` neu aufgesetzt; die roten Commits von #123 schlagen auf ihrem neuen Elternteil weiter fehl.
- [ ] **T3513 2.1** Reihenfolge am Feldrand laut `trailing` (Status-Icon → Spinner → ✕ → Feld-Icon, alles im Feldrand) für `kampo`, `elektilo`, `datelektilo`: Browsertest und Figma-Datentest.
- [ ] **T3514 2.2** Je Lücke der sichtbaren Beschriftung ein roter Test (einfachste Schreibweise, Skemo, Kurzprofil des Gvidanto).
- [ ] **T3515 2.3.1** `datelektilo`: Kalender-Icon so groß wie der Pfeil des `elektilo`.
- [ ] **T3516 2.3.2** `markobutono` (geprüft `sxaltilo`, `elekto`): Kästchen in Figma links wie im Web.
- [ ] **T3517 2.3.3** ✕ im `datelektilo` (Web und Figma) wie in `kampo`.
- [ ] **T3518 2.3.4** Schreibgeschützt: eine Regel für alle Felder (V-1).

### B – Grün
- [ ] **T3519 2.1** `trailing` in den Skemoj, Generatoren folgen dem Skemo; Ero-Tokens neu erzeugt.
- [ ] **T3520 2.2** Sichtbare Beschriftung; Kurzprofil `kampo` unter 750 Tokens; D-04.
- [ ] **T3521 2.3.1–2.3.4** je Befund grün.
- [ ] **T3522** „Bildtest neu: 2.1 …“ und „Bildtest neu: 2.3.x …“, je Befund ein Commit (Tabelle im plan).

### C – Messung und Abschluss
- [ ] **T3523 2.2** AC-10: bestehende Nutzungen pixelgleich gegenüber dem Stand direkt vor 2.2 (D-09).
- [ ] **T3524 2.2** Reihe K einmal gegen K 76,0 (D-05), Kosten im plan.
- [ ] **T3525** Messanleitung für Plugin und Vitrino; #123 und Figma-PR: CI, Neustarts nach R-8.

## Teil 3 – Studio

**Branch:** `261030-spec-035-t3-studio`.

### A – Rot zuerst
- [ ] **T3526 3.1** Browsertest auf „Raum“: Enter und „Übernehmen“ übernehmen den Wert (Entwurf, `rev`, Prüfung, Rückmeldung).
- [ ] **T3527 3.2** Nach „gesetzt“ zeigen Zeile und Farbfeld denselben Stand.
- [ ] **T3528 3.3** Abgelehnte Änderung: Meldung am Feld mit Regel und Vorschlag.
- [ ] **T3529 3.4** Zwei Seiten: Änderung im Studio erscheint im Assistenten (Abgleich über `rev`).

### B – Grün
- [ ] **T3530 3.1–3.4** je Befund grün.

### C – Messung und Abschluss
- [ ] **T3531** PR Teil 3, Messanleitung, CI.

## Teil 4 – Markenassistent

**Branches:** `261030-spec-035-t4a-markenassistent` (4a) · `261030-spec-035-t4b-markenassistent` (4b) (D-10).

### A – Rot zuerst
- [ ] **T3532 4.1** Weg C: synthetische Seite (prägende Farbe in Bild und Fläche, Nebenfarbe im CSS häufiger), Seite mit Challenge-Antwort, Rückfall ohne Browser (ein Satz), echtes Chromium in der Eroj-Suite (D-12).
- [ ] **T3533 4.5.6** Upload von JPG/JPEG und WebP (D-11).
- [ ] **T3534 4.2** Weg A: zweite, deutlich andere Farbe als Akzent mit Herkunft.
- [ ] **T3535 4.3** Form „Pille“, relativer Wunsch um mindestens eine Stufe, ehrliche Antwort am Reglerende (V-3).
- [ ] **T3536 4.4** Änderung im Chat macht den Schritt definiert und freigebbar.
- [ ] **T3537 4.5.1–4.5.5** Darstellung: Vorschlag zeigt statt erklärt, linke Leiste, kein rohes Markdown und kein HTML aus dem Modell (D-02), Warnungen zusammengefasst, erfundener Platzhalter beim Namen der Marke.

### B – Grün
- [ ] **T3538 4.1, 4.5.6** grün; Playwright als optionale, verzögert geladene Abhängigkeit, Eintrag mit Grund (AC-11).
- [ ] **T3539 4.2–4.4** grün.
- [ ] **T3540 4.5.1–4.5.5** grün.

### C – Messung und Abschluss
- [ ] **T3541 4.1** Recherche mit echten Marken lokal vorher/nachher (nur Zusammenfassung im plan).
- [ ] **T3542** AK-07 nach 4a und nach 4b; Playwright nicht im Start des MCP-Servers.
- [ ] **T3543 4.6** Drei Skizzen im plan (D-14).
- [ ] **T3544 4.7** Weg C, dann Weg A mit `ministral-14b-2512`; Tokens, Kosten, Dauer im plan.
- [ ] **T3545** PRs 4a und 4b, Messanleitung, CI.

## Abschluss

- [ ] **T3546** CI aller PRs, Neustarts nach R-8, Kosten ≤ 0,50 $.
- [ ] **T3547** plan, tasks und Bericht zusammengeführt; Doku-Test (AC-1 bis AC-11).
