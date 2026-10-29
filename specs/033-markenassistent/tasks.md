# Spec 033 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Aufgaben ab T3301.

## S1 – Amendment v2.5, Markenmodell, Ablauf, Chat, Freigabe, Kroniko

**Branch:** `261029-spec-033-s1-markenassistent` (von `main` `05f122dc`, nach #110, #111, #113).

### A – Rot zuerst
- [x] **T3301 Tests** in sieben Dateien:
  - Modelo `src/data/facetoj.test.ts`: zwölf Facetoj mit ID, Gewicht und Kialo, jedes Token in genau einer, Modi als Dimensioj, die beiden Regeln.
  - Doku-Test: Spec unverändert, Constitution v2.5 wörtlich, Begriffe, plan und tasks.
  - Metiejo `src/asistanto/kroniko.test.ts`, `stato.test.ts`, `iloj.test.ts`, `babilo.test.ts`, `servilo-asistanto.test.ts`.

  Rot in `7a6f7bb`: Modelo 2 (facetoj lädt nicht, Constitution 2.4), Doku 1; Metiejo 5 Dateien laden nicht (Module fehlen).

### B – Grün
- [x] **T3302 Amendment v2.5:** Art. VI, Terminologie Kroniko und Asistanto, Historie, Ontologio (Kroniko, Asistanto, Faceto); Doku-Tests der Versionen nachgezogen (2.4 → 2.5), Zahl der Begriffe 22 → 24.
- [x] **T3303 Markenmodell:** Schema `FacetojFile`, `Faceto`, `KronikoEro`, `FacetoId`; Entität `faceto` (`fac`); `data/facetoj.json` mit zwölf IDs (`pnpm id:new faceto --count 12`); `facetoj.ts` mit `facetojOfToken`, `checkFacetoj`; Regeln `faceto-token-unassigned`, `faceto-token-twice` (Katalog 192 → 194).
- [x] **T3304 Kroniko und Zustände:** `kroniko.ts`, `stato.ts` (D-02, D-03).
- [x] **T3305 Werkzeuge und Chat:** `iloj.ts` (D-04), `babilo.ts`, `ki.ts` aus `nordstelo` übernommen (Nordstelo nutzt es weiter, 58 Tests grün).
- [x] **T3306 Server und Bildschirm:** `/asistanto/<marke>[/<faceto>]`, `/api/marko/<marke>/(stato|asistanto|faceto|fremda|konfirmo)`, Kroniko in `setDraft`, beim Anlegen und beim Export; Hinweis vor dem Export auf „Fertig“ und im Studio (`averto.ts`); Link „Assistent“ im Studio; Client-Skript mit Chat, Aktionen, Bestätigung und Abgleich über `rev`; `readKi` beim Start.
- [x] **T3307 Probeläufe** (plan): Mistral `ministral-14b-2512`, OpenRouter Nemotron `:free`; Befund B-1 (leere Antwort) mit Test zuerst rot behoben.

### C – Abschluss
- [x] **T3308 Doku:** plan (Amendment, D-01–D-07, Probeläufe, Abweichungen 1–3, B-1–B-4, O-1–O-4, Messanleitung), tasks, Vojmapo, README.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `7a6f7bb`, grün im Folgecommit (Hash im PR) |
| Rot gemessen | Modelo 2 + Doku 1, Metiejo 5 Dateien |
| Grün gemessen | Modelo 181 Dateien / 3880 Tests; Metiejo 23 Dateien / 227 Tests (davon Assistent 34); Nordstelo 7 / 58; Lint sauber |
| Probeläufe | Mistral 11 026 Tokens, 27,8 s, ≈ 0,0022 $; Nemotron `:free` 13 396 Tokens, 226,5 s, 0 $ |

## S2 – Weg B: Uploads, Links, Erkennung, private Schriften

**Branch:** `261029-spec-033-s2-weg-b` (auf S1).

### A – Rot zuerst
- [x] **T3311 Tests:** Metiejo `src/enportilo/enportilo.test.ts` (PNG, Farben, SVG, PDF, Webseite mit CSS, Vorschläge je Faceto, Ende des Reglers, lizenzierte Familie) und `servilo-enportilo.test.ts` (Bestätigung zu Beginn, Screenshot, Link, Vorschlag im Schritt und Übernahme, Schriftdatei, unlesbare Datei); Doku-Test S2. Rot in `0cee3f1`: zwei Dateien laden nicht bzw. 404, Doku 1.

### B – Grün
- [x] **T3312 Lesen:** `png.ts`, `farboj.ts`, `svg.ts`, `pdf.ts`, `retejo.ts` (`postcss` in der Metiejo), `trovo.ts`.
- [x] **T3313 Vorschläge:** `rekono.ts` (D-08, D-09).
- [x] **T3314 Server und Bildschirm:** Route `materialo` mit Bestätigung, Kroniko `fremda`, `konfirmo`, `propono`; `enportilo.json`; Übernahme in `faceto`/`akcepto`; Abschnitt „Material deiner Marke“ und Vorschlag mit Herkunft im Schritt; Client-Skript.
- [x] **T3315 Probelauf** mit `provo`: B-5 und B-6 behoben, je Schritt Test zuerst rot (Leitfarbe mittlerer Helligkeit, Namen der Variablen, `var()`-Ketten, Custom Properties, Statusfarben).

### C – Abschluss
- [x] **T3316 Doku:** plan S2 (Zusammenfassung, D-08–D-10, Probeläufe, Abweichungen, B-5–B-8, O-5–O-6, Messanleitung), tasks, Vojmapo.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `0cee3f1`, grün im Folgecommit (Hash im PR) |
| Grün gemessen | Metiejo 25 Dateien / 245 Tests (Enportilo und Assistent 52); Lint sauber |
| Probelauf | Screenshot 4 Funde, 2 Vorschläge, 85 ms; URL 258 Funde, 6 Vorschläge, 57 ms; 0 Tokens, 0 $ |

## S3 – Weg A (Kreilo)

**Branch:** `261029-spec-033-s3-weg-a` (auf S2).

### A – Rot zuerst
- [x] **T3321 Tests:** Metiejo `src/kreilo/kreilo.test.ts` (fünf Paare mit Kialo, Bewegungen, Reglerbereich, Leitfarbe nach warm–kühl und ruhig–lebhaft, Schrift nach klassisch–modern und verspielt, Festgelegtes und Inspiration zuerst, Herkunft) und `servilo-kreilo.test.ts` (Einstiegsfragen aus Eroj, Vorschlag sofort auf dem Entwurf, Kroniko, Bestätigung für Inspiration, Leitfarbe über `setze_farbe`); Doku-Test S3. Rot in `590bef2`: Kreilo-Modul fehlt, Server 4 rot, Doku 1.

### B – Grün
- [x] **T3322 Daten und Kreilo:** `data/kreilo.json`, `kreilo.ts` (D-11).
- [x] **T3323 Server und Bildschirm:** `/asistanto/<marke>/komenco`, Route `kreilo` (D-12), Link im Assistenten, Client-Skript.
- [x] **T3324 Probelauf Abnahme 1** (automatisch, plan).

### C – Abschluss
- [x] **T3325 Doku:** plan S3, tasks, Vojmapo.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `590bef2`, grün im Folgecommit (Hash im PR) |
| Grün gemessen | Metiejo 27 Dateien / 257 Tests; Lint sauber |
| Probelauf | 100 % in 36,2 s, 6 847 Tokens, 7 Anfragen, ≈ 0,0014 $; Vitrino und Figma mit der Marke |

## S4 – Weg C: Recherche-Agent

**Branch:** `261029-spec-033-s4-weg-c` (auf S3).

### A – Rot zuerst
- [x] **T3331 Tests:** Metiejo `src/esploro/esploro.test.ts` (öffentliche Adressen, Werkzeuge, Website und Presseseite mit URL als Herkunft, Ablehnung und sechs Seiten, ohne Modell mit Adresse) und `servilo-esploro.test.ts` (Bestätigung zu Beginn, Kroniko, Hinweis mit fremder Marke und lokal, ohne Modell, Abschnitt im Assistenten); Doku-Test S4. Rot in `680a46a`: Modul fehlt, Server 5, Doku 1. Danach im Test-Double die Markenseite ergänzt, damit `seitoj` nur gelesene Seiten zählt.

### B – Grün
- [x] **T3332 Agent:** `esploro.ts` (D-13–D-15); `legiPagxon` und `markoLigiloj` in `retejo.ts`.
- [x] **T3333 Server und Bildschirm:** Route `esplori`, `avertoOf` mit fremder Marke auf „Fertig“, im Studio und in der Kroniko, Abschnitt „Recherche“ im Assistenten, Client-Skript.
- [x] **T3334 Probelauf Abnahme 3** (plan).

### C – Abschluss
- [x] **T3335 Doku:** plan S4, tasks, Vojmapo.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `680a46a`, grün im Folgecommit (Hash im PR) |
| Grün gemessen | Metiejo 29 Dateien / 267 Tests; Lint sauber |
| Probelauf | 2 Seiten, 6 Vorschläge, 1 521 Tokens, 3 Anfragen, 5,6 s, ≈ 0,0003 $ |

## S5 – Sprache

**Branch:** `261029-spec-033-s5-sprache` (auf S4).

### A – Rot zuerst
- [x] **T3341 Tests:** Metiejo `src/parolo/parolo.test.ts` (multipart an `/audio/transcriptions`, genauer Modellname, Schlüssel nur im Header, Fehler geschwärzt) und `servilo-parolo.test.ts` (Aufnahme → Chat-Zug mit Quelle `parolo`, Transkription in der Kroniko, ohne Voxtral Satz mit Browser, Knöpfe im Assistenten); Doku-Test S5. Rot in `122e50e`. Danach hat biome die Tests nur umformatiert.
- [x] **T3342 Tests B-11:** `babilo.test.ts`: Eine behauptete Änderung ohne Werkzeug bekommt eine Erinnerung; bleibt sie, beginnt die Antwort mit „Es wurde nichts geändert.“ (auch im Passiv und mit Dezimalpunkt). Rot vor dem Fix.

### B – Grün
- [x] **T3343 Transkription:** `parolo.ts` (D-17), `paroloOf`/`readParolo` in `env.ts`, `start.ts`.
- [x] **T3344 Server und Bildschirm:** `chatTurn` herausgezogen (D-16), Route `parolo`, „Sprechen“, „Antworten vorlesen“, Client-Skript mit MediaRecorder, Web Speech API und speechSynthesis.
- [x] **T3345 Ehrliche Antwort:** Regel 6 und Erinnerung in `babilo.ts` (D-18).
- [x] **T3346 Probelauf Abnahme 4** (plan): zwei Läufe, vor und nach B-11.

### C – Abschluss
- [x] **T3347 Doku:** plan S5, tasks, Vojmapo.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `122e50e`, grün im Folgecommit (Hash im PR) |
| Grün gemessen | Metiejo 31 Dateien / 276 Tests; Lint sauber |
| Probelauf | Transkript richtig, Voxtral 436–462 ms für 1 s Audio; Chat 2 558 und 4 013 Tokens, 4,7 s und 10,6 s, zusammen ≈ 0,0013 $ |
