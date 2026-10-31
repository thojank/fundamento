# Spec 036 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `f2b5a058`. Aufgaben ab T3601. Je Teil A – Rot zuerst, B – Grün, C – Messung und Abschluss. Rote Commits enden auf „(rot)“, grüne auf „(grün)“, gewollte Bildänderungen beginnen mit „Bildtest neu:“, Doku-Commits mit „Spec 036:“; Häkchen mit SHAs.

## Teil 1 – Fehler aus der Abnahme

**Branch:** `261031-spec-036-t1-abnahme` (aus den lokalen Hilfsbranches `…-t1-form`, `…-t1-assistent`, `…-t1-figma` zusammengeführt, D-16).

### A – Rot zuerst
- [ ] **T3601 1.1** Bildtest: Vorschau mit Pille rundet `tekstareo` (Muster `redaktilo`), Karten und Flächen nicht auf `radius.full`.
- [ ] **T3602 1.2** „Eckiger“ von der Pille geht auf Stufe 2, nicht auf den Wert des Reglers.
- [ ] **T3603 1.3** Prüfung der Chat-Antwort mit Modell-Attrappe: keine internen Begriffe (`Faceto`, Token-Namen), sondern Wörter der Oberfläche.
- [ ] **T3604 1.4** Weg C: Der Satz zu den gelesenen Seiten kommt aus dem Ergebnis von `esploro.ts`, nicht vom Modell.
- [ ] **T3605 1.5** D-95 (Satz „ohne Browser“ vor der Weiterleitung), D-96 (`ekrano.ts` nutzt `freigabeOf`), D-99 (Skript von Weg A mit einem Bild mit zweiter kräftiger Farbe).
- [ ] **T3606 1.6** Figma-Datentests: `elekto` nicht gewählt = leerer Ring; `markobutono`, `sxaltilo` Beschriftung mittig; D-64 Monatsknöpfe im offenen Kalender des `datelektilo` mit Größe und Füllung.
- [ ] **T3607 1.7** G5: Gegenprobe zeigt das wackelige Urteil auf einem langsamen Runner (Grenze 50 ms bleibt).

### B – Grün
- [ ] **T3608 1.1, 1.2** Pille nur für Rollen einzeiliger Bedienelemente; Stufenliste 0 · 0,5 · 1 · 2 · Pille, „eckiger“ von Pille → 2 (Spec 035 D-83 hier als geändert geführt).
- [ ] **T3609 1.3, 1.4, 1.5** je Befund grün.
- [ ] **T3610 1.6** Figma-Generatoren und Skemoj; Messanleitung für das Plugin.
- [ ] **T3611 1.7** G5 kalibriert: Grenze 50 ms bleibt, Urteil robust, Gegenprobe rot.
- [ ] **T3612** „Bildtest neu: 1.1 …“ und „Bildtest neu: 1.6 …“, je Befund ein Commit (Tabelle im plan).

### C – Messung und Abschluss
- [ ] **T3613** Hilfsbranches per Rebase zusammengeführt (Form/G5 → Figma → Assistent), rote Commits auf neuen Elternteilen erneut rot.
- [ ] **T3614 1.7** G5 je Runner (lokal ohne andere Playwright-Läufe, `uptime`; CI).
- [ ] **T3615** PR Teil 1, Messanleitung, CI.

## Teil 2a – Farbrollen: unbunte Marken und Bildgewicht

**Branch:** `261031-spec-036-t2a-farbrollen` (D-02).

### A – Rot zuerst
- [ ] **T3616 2.1** Unbunte Marke: Erkennung in Weg B und Weg C, Leitfarbe Schwarz bzw. sehr dunkles Neutral statt einer bunten Nebenfarbe (V-1).
- [ ] **T3617 2.1** Regel: Verweise bei unbunter Leitfarbe brauchen ein zweites Merkmal (z. B. Unterstreichung); fehlt es, Ablehnung mit Vorschlag.
- [ ] **T3618 2.3** Synthetische Fixture: große Bilder im ersten Bildschirm zählen mit eigenem Gewicht (Fotos ≠ Hintergrund).

### B – Grün
- [ ] **T3619 2.1** Erkennung, Ableitung im Agordilo, Regel mit Grund.
- [ ] **T3620 2.3** Bildgewicht in Weg C.

### C – Messung und Abschluss
- [ ] **T3621 2.3** Weg C vorher/nachher: synthetisch und lokal mit Marke 2 (Reservierungen `2.3-weg-c-*`), Zusammenfassung im plan.
- [ ] **T3622** AC-10: bestehende Marken pixelgleich gegenüber dem Stand direkt vor der Änderung (D-30).
- [ ] **T3623** PR 2a, Messanleitung, CI.

## Teil 2b – Farbrollen: Zweitfarbe

**Branch:** `261031-spec-036-t2b-zweitfarbe`, gestapelt auf 2a (D-18).

### A – Rot zuerst
- [ ] **T3624 2.2** Agordo-Feld Zweitfarbe, Palette und Rollen (Hervorhebungsflächen, Illustration, Abzeichen, Diagramme) im Vortaro und Modelo; Prüfung: keine Aktions-, Verweis- oder Fokusrolle verweist auf die Zweitfarbe (V-2, D-20).
- [ ] **T3625 2.2** Kontrastpaare der neuen Rollen; Projekcioj (CSS, Figma, Tailwind, Vitrino): bestehende Ausgabezeilen byte-gleich, neue Variablen dazu.
- [ ] **T3626 2.2** Weg A/B/C setzen die Zweitfarbe, wenn das Material sie hergibt; zu nah an der Leitfarbe → keine Zweitfarbe mit Satz; Zweitfarbe als Aktion gewünscht → Ablehnung in Nutzersprache.

### B – Grün
- [ ] **T3627 2.2** Vortaro, Modelo, Prüfungen, Projekcioj grün; Faceto „Leitfarbe und Akzente“ im Assistenten.
- [ ] **T3628 2.2** Weg A/B/C; Vitrino zeigt eine Marke mit Zweitfarbe.

### C – Messung und Abschluss
- [ ] **T3629** AC-10: Marken ohne Zweitfarbe und `komuna-0-2` pixelgleich (D-30).
- [ ] **T3630** PR 2b, Messanleitung, CI.

## Teil 3 – Bühne

**Branch:** `261031-spec-036-t3-buehne`.

### A – Rot zuerst
- [ ] **T3631 3.1–3.3** Browsertests: Bühne aus echten Eroj (hell/dunkel), Vorher/Nachher-Schieber (schmal: Umschalter), Chat-Leiste unter der Bühne.
- [ ] **T3632 3.4** Material und Recherche im Dialog; Ergebnis als Kacheln mit Farbfläche und Anteil.
- [ ] **T3633 3.5** Komponente mit offenem Problem: Rahmen in der Warnfarbe, Satz bei Hover und Fokus.
- [ ] **T3634 3.6** Tastatur und Screenreader: Schieber und Umschalter bedienbar, Live-Region für neue Antworten, axe ohne Befund.

### B – Grün
- [ ] **T3635 3.1–3.6** je Befund grün; fehlendes Ero → Manko statt Nachbau.

### C – Messung und Abschluss
- [ ] **T3636 3.7** Abnahme 1 (Weg A, Reservierung `3.7-weg-a`) und ein Material-Lauf; Bildschirmfotos vorher/nachher mit erfundener Marke (D-34).
- [ ] **T3637** PR Teil 3, Messanleitung, CI.

## Teil 4 – Übernahme aus dem Material

**Branch:** `261031-spec-036-t4-uebernahme` (D-03, D-04, D-19).

### A – Rot zuerst
- [ ] **T3638 4.1, 4.2** Vorschlag je Schritt mit Herkunft (Leitfarbe, Neutraltöne, Schrift, Form, Elevation, Dichte; Zweitfarbe mit Verweis auf 2b); kein Wert ohne Herkunft; nicht Messbares offen benannt.
- [ ] **T3639 4.3** Synthetische Testbilder im Repo je Schritt.

### B – Grün
- [ ] **T3640 4.1, 4.2** Schritt-Module unter `enportilo/`, Vorschläge über den `propono`-Weg.
- [ ] **T3641 4.3** Skript `abnahme-weg-b.ts` für den Material-Lauf.

### C – Messung und Abschluss
- [ ] **T3642 4.3** Material-Lauf synthetisch und lokal mit echten Marken (Reservierungen `4-material-*`); Tabelle je Schritt im plan.
- [ ] **T3643** PR Teil 4, Messanleitung, CI.

## Teil 5 – Spec 029 zu Ende

**Branches:** Stapel `261031-spec-036-t5-2b2` → `…-t5-2b3` → `…-t5-2b4` → `…-t5-2b5` → `…-t5-3-doku` (D-05, D-29).

### ②b-2 Achsen und Werte

#### A – Rot zuerst
- [ ] **T3644 ②b-2** Neue Achsen und Größen aus `abgleich.json`; `large` als veralteter Alias (`elekto`, `markobutono`, `sxaltilo`); `lines` statt `rules`; Zweck-Achse des `dialogo` (M-3).

#### B – Grün
- [ ] **T3645 ②b-2** Skemoj, Ero-Tokens (`pnpm vortaro:ero-tokenoj`), Eroj, Projekcioj.
- [ ] **T3646 ②b-2** „Bildtest neu: ②b-2 …“ (Tabelle im plan).

#### C – Messung und Abschluss
- [ ] **T3647 ②b-2** Props von 0.2.0 unverändert, Kurzprofile < 750 Tokens, AC-10 (D-30), `git merge-tree` gegen Teil 1 (D-06), PR, Messanleitung für das Plugin, CI.

### ②b-3 Anatomie und Slots

#### A – Rot zuerst
- [ ] **T3648 ②b-3** Neue Teile und Slots (Überschriften, Zähler, Fuß, Schließen, Icons, Markierungen, „alle wählen“ …).

#### B – Grün
- [ ] **T3649 ②b-3** Skemoj, Ero-Tokens, Eroj, Projekcioj.
- [ ] **T3650 ②b-3** „Bildtest neu: ②b-3 …“.

#### C – Messung und Abschluss
- [ ] **T3651 ②b-3** Props von 0.2.0, Kurzprofile, AC-10, PR, Messanleitung, CI.

### ②b-4 Verhalten

#### A – Rot zuerst
- [ ] **T3652 ②b-4** Springen per Tippen, Rollen nach Status und Zweck, Überlauf, Download, unbekannte Gesamtzahl, ausgelassene Mitte, Streamen.

#### B – Grün
- [ ] **T3653 ②b-4** je Verhalten grün.
- [ ] **T3654 ②b-4** „Bildtest neu: ②b-4 …“, falls nötig.

#### C – Messung und Abschluss
- [ ] **T3655 ②b-4** Props von 0.2.0, Kurzprofile, AC-10, PR, Messanleitung, CI.

### ②b-5 `kodbloko`, Schrift, Form

#### A – Rot zuerst
- [ ] **T3656 ②b-5** Syntaxfarben (①-2), Ersatzschrift nach Kategorie (①-7, ohne Import der Metiejo im Agordilo), `signeto` und `insigno` unterscheidbar, Vitrino-Befunde aus Spec 025.

#### B – Grün
- [ ] **T3657 ②b-5** je Punkt grün.
- [ ] **T3658 ②b-5** „Bildtest neu: ②b-5 …“.

#### C – Messung und Abschluss
- [ ] **T3659 ②b-5** Props von 0.2.0, Kurzprofile, AC-10, PR, Messanleitung, CI.

### ③ Doku je Ero

#### A – Rot zuerst
- [ ] **T3660 ③** Doku-Felder nach Spec 029 ③ (Uzo-Felder, Prüfung, Gvidanto, Seitenaufbau).

#### B – Grün
- [ ] **T3661 ③** Inhalte für alle Eroj; neue Felder in der vollen Antwort von `get_ero`.

#### C – Messung und Abschluss
- [ ] **T3662 ③** Kurzprofile < 750 Tokens (gemessen), PR, CI.

## Teil 6 – Neutrale Namen

**Branch:** `261031-spec-036-t6-neutrale-namen` (zuletzt mergen, vorher neu aufsetzen, D-33).

### A – Rot zuerst
- [ ] **T3663 6.4** `check:privat` rot auf BASIS (Zahl der Dateien im Commit); Ausnahmen nur für wortgleiche Spec-Kopien (D-14, D-23).
- [ ] **T3664 6.2** Codemod `scripts/neutrale-namen/`: deterministisch, ein zweiter Lauf ändert nichts (D-11, D-25).
- [ ] **T3665 6.3** Leser akzeptieren alte und neue Schlüssel bzw. IDs (Fixture im alten Format); Ausgaben nach Normalisierung alt → neu byte-gleich.
- [ ] **T3666 6.6** Attrappen-Repo und Attrappen-Ordner: mit `FM_TIPAROJ_REPO`, mit Rückfall, ohne Variable (dieselbe Meldung wie heute).

### B – Grün
- [ ] **T3667 6.4, 6.2, 6.3** Prüfung, Skript, Leser grün; CHANGELOG „Unveröffentlicht“ › „Hinweis für Nutzer“ mit Migrationssatz.
- [ ] **T3668 6.1** Skript-Lauf „Spec 036 Teil 6: neutrale Namen (Skript-Lauf auf `<sha>`)“; `check:privat` grün.

### C – Messung und Abschluss
- [ ] **T3669 6.6** Liste der Familien vor und nach dem Skript mit der `.env` des Maintainers (nur Zahl und „gleich ja/nein“, D-28); D-22 bestätigt oder ersetzt.
- [ ] **T3670 6.5** Anleitung Commit-Identität für den Maintainer im Bericht (eigener Checkout, GitHub „Keep my email addresses private“).
- [ ] **T3671** PR Teil 6, Messanleitung, CI; neu aufgesetzt auf dem aktuellen `main` bzw. auf dem simulierten Endstand (D-33).

## Abschluss

- [ ] **T3672** CI aller PRs, Neustarts nach R-8 (D-31, D-32), Kosten ≤ 0,50 $.
- [ ] **T3673** Merge-Simulation in der vorgeschlagenen Reihenfolge mit Teil 6 zuletzt (AC-15); Konflikte mit Datei, PRs und Lösung.
- [ ] **T3674** plan, tasks und Bericht zusammengeführt (Entscheidungen D-35 ff.); Doku-Test und Prüfung gegen AC-1 bis AC-15.
