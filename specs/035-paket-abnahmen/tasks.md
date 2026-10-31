# Spec 035 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `367b7a52`. Aufgaben ab T3501. Rote Commits enden auf „(rot)“, grüne auf „(grün)“, Bildtests beginnen mit „Bildtest neu:“, Doku-Commits mit „Spec 035:“; Häkchen mit SHAs. Die Nummern sind gegenüber dem Gerüst (`85bc9fef`, T3501–T3547 vorläufig) neu vergeben, weil die Teile feiner geschnitten wurden (je Befund rot und grün; D-111).

## Teil 1 – Prüfungen verlässlich

**Branches:** `261030-ableitung-kalibriert` (#125, 1.1) · `261030-spec-035-t1-pruefungen` (#126, 1.2, 1.3, Doku).

### A – Rot zuerst
- [x] **T3501 1.1** #125 neu aufgesetzt: Urteil der Ableitung gegen eine Referenzlast und Gegenprobe; rot auf `367b7a52` (Modul `ableitung.js` fehlt) – `0a409843` (vorher `2c70ff7c`).
- [x] **T3502 1.1** Kalibriertabelle `packages/eroj/test/ableitung-kalibrierung.tsv` (16 Versuche) und Test „REFERENZ_SCHNELL_MS is the median reference of the fast runners in the table“: Expected 41.5 / Received 50 – `fe06ff4f` (D-13).
- [x] **T3503 1.2** Gegenprobe 2 auf nachgespielten Läufern „wie #115“ (16 000 Elemente, 71,8 ms) und „CPU gedrosselt ×4“ (22,9 ms), dazu CDP `Emulation.setCPUThrottlingRate` 4 im echten Chromium – `0c7a4945`.
- [x] **T3504 1.3** Der Start fragt eine Ajv-Instanz (rot: 3) und die geteilten Auflösungen halten den Wert eines Alias ohne Kopie – `379c002b`.

### B – Grün
- [x] **T3505 1.1** #125 neu aufgesetzt, lokal grün, Push mit Lease – `4a2fa096` (vorher `c698cc08`).
- [x] **T3506 1.1** `REFERENZ_SCHNELL_MS = 41.5`, Grenze 150 ms unverändert – `016997b6`.
- [x] **T3507 1.2** Median aus fünf Umschaltungen, gehalten bei drei Medianen ≥ 80 ms, Wachsen um ein Viertel, Obergrenze 1 024 000 Elemente mit Meldung; M5 50 ms, Probe 80 ms unverändert – `5f9bb4f6`.
- [x] **T3508 1.3** `sharedModeloAjv` und geteilte Auflösungen ohne Kopie, acht Dateien byte-gleich aus #123 `2537e469` (neu aufgesetzt `b298aa83`; D-06) – `02fe48e6`.

### C – Messung und Abschluss
- [x] **T3509 Doku:** Spec wortgleich (SHA-256 `472d2c44…f6be264a`), Gerüst von plan und tasks – `85bc9fef`.
- [x] **T3510 1.1** Zwei Kalibrierketten auf `4a2fa096` (Läufe 41140136538, 41140304922), 16 Versuche, Klassen schnell/mittel/langsam 5/5/6; Gegenprobe mit 41,5 ms rot auf langsamem (41157583649, 180,4 ms) und schnellem Runner (41157585241, 179,0 ms).
- [x] **T3511 1.2** Lokal `-g "M5"` 10/10, Gegenprobe 2 ×3 15/15, Eroj 402/402; CI #126 Versuch 2: 24 500 Elemente, 97,5 ms gehalten.
- [x] **T3512 1.3** CPU-Profile vor #122 (`013f2e59`), `main`, Teil 1; Aufrufzahlen; AK-07 unter Last 13 von 16 Paaren schneller; in Ruhe Teil 1 1744 ms gegen `main` 1901 ms (8/8).
- [x] **T3513** PR #126 angelegt; CI #125 grün (41157583649, 41157585241), #126 nach einem R-8-Neustart grün (41144058506).

## Teil 2 – Felder

**Branches:** `261029-spec-029-2b1b-status` (#123, 2.1, 2.2) · `261030-spec-035-t2-figma` (#130, 2.3, gestapelt auf #123, D-08).

### A – Rot zuerst
- [x] **T3514 2.1** #123 neu aufgesetzt, Beschriftung rot auf neuem Elternteil (Modelo 14, Browser 14) – `a5bc2be5` (vorher `73b699d6`).
- [x] **T3515 2.1** #123 neu aufgesetzt, Status M-2 rot auf neuem Elternteil (Modelo 62, Figma 13, Browser 41) – `d095cc1e` (vorher `2e3c02d9`).
- [x] **T3516 2.1** Reihenfolge am Feldrand laut `trailing` (Status-Icon → Spinner → ✕ → Feld-Icon, im Rand) für `kampo`, `elektilo`, `datelektilo` in Browser und Figma-Double; vier bestehende Erwartungen angepasst – `2826f1da`.
- [x] **T3517 2.2** check_usage nimmt `label="…"` neben leerem Elementtext, Aussage von `field-label-visible` nennt beide Wege; Belegtests Make Kit, Kurzprofil über den Server, Vorschläge – `35ad207c`.
- [x] **T3518 2.2** Prompt gvidanto, Regel 8 zur sichtbaren Beschriftung – `705fd5c8`.
- [x] **T3519 2.2** CHANGELOG „Hinweis für Nutzer“ zu `label` (D-04) – `3cffb3dd`.
- [x] **T3520 2.3.1** Kalender des `datelektilo` so groß wie der Pfeil (Skemo, Marken, Figma-Glyph/Farbe/Ziel, Browser) – `7695868c`.
- [x] **T3521 2.3.3** ✕ des `datelektilo` wie das des `kampo` – `62bfa6b6`.
- [x] **T3522 2.3.2** Kästchen der Umschalter links in Figma (Double wie Figma; `markobutono`, `sxaltilo`, `elekto`) – `d68a2bad`.
- [x] **T3523 2.3.4** Schreibgeschützt wie in Ruhe, zwölf Felder (Skemo, Marken, Figma, Browser) – `5da4d081`.

### B – Grün
- [x] **T3524 2.1** #123 neu aufgesetzt: Beschriftung `2314e8b5`, Typtests `ce0cb0fb`, Status M-2 mit neu erzeugten Artefakten `b298aa83` (Konflikte D-35 bis D-45).
- [x] **T3525 2.1** `trailing` im Skemo des `kampo`, Web `endMarkup`, Figma `plan.trailing` – `ad0dd6ad`.
- [x] **T3526 2.2** `textOf` und Aussage der Regel – `57ab8ba7`; Prompt – `c3fae550`; CHANGELOG – `fe98ef35`.
- [x] **T3527 2.3.1** `trigger.size` = Pfeil, `trigger.width` = Ziel, Kalender gefüllt – `c306ba73`.
- [x] **T3528 2.3.3** `clear.size`/`clear.width`, Knopf `small` – `2649550a`.
- [x] **T3529 2.3.2** Plugin verschiebt nur zum Anfang hin – `ebdf4462`.
- [x] **T3530 2.3.4** Regel „schreibgeschützt = Ruhe“ (V-1) – `363f881f`.
- [x] **T3531 CI #130** Zählung beratender APCA-Hinweise nach 2.3.4 (8586 → 8694); rot ist `363f881f` (bestehender Test, D-106) – `58c92a70`.
- [x] **T3532 Bildtest neu: 2.3.1** `WANTED.datelektilo`, 32 Varianten – `f94947b6`. Für 2.1, 2.3.2, 2.3.3, 2.3.4 kein Bildtest-Commit: ganzes Bild der Figma-Sets byte-gleich (`8b417220…` bzw. `80ac81ef…`; plan › Bildtests).

### C – Messung und Abschluss
- [x] **T3533 2.2** AC-10: `a5bc2be5` gegen `2314e8b5` 180/180, `ad0dd6ad` gegen `fe98ef35` 182/182 PNG byte-gleich (Chromium 153, D-09); Kurzprofil `kampo` 740/750.
- [x] **T3534 2.2** Reihe K `20261031-0044` auf `fe98ef35`: F 83,9 gegen 0 33,3 (Bezug K 76,0), 0,18106 $ (D-05).
- [x] **T3535 2.3** Ganzes Bild vor und nach jedem Befund; Prüfungen am Head grün (Modelo 4139, Projekcioj 1245, Eroj Chromium 475, `check:*`).
- [x] **T3536** #123 grün (41151751470); #130 angelegt, nach dem Fix grün (41158327889).
- [ ] **T3537 2.3** Sichtprüfung im Figma-Plugin (Maintainer; plan › Messanleitung Teil 2, bestätigt D-60).

## Teil 3 – Studio

**Branch:** `261030-spec-035-t3-studio` (#128).

### A – Rot zuerst
- [x] **T3538 3.1** Browsertest Enter/„Übernehmen“ auf „Raum“ und Metiejo-Test der Route (Seite, Komponentenseite): 404 statt 303 – `cc9ebac5`.
- [x] **T3539 3.2** Browsertest Farbe: Zeile = Farbfeld nach „gesetzt“ – `bf2ab85e`.
- [x] **T3540 3.3** Browsertests Ablehnung am Feld (Raum, Semantik) und Metiejo-Test – `efddbdc9`.

### B – Grün
- [x] **T3541 3.1** `POST` an Studio- und Komponentenseite über `festlegen`, Client sendet geänderte Felder – `956f87a6`; WebKit, rev-Abfrage wartet während der Sendung – `ad37b345`.
- [x] **T3542 3.2** Wertänderung über das Formular, Seite vom Server – `d9cda543`.
- [x] **T3543 3.3** Ablehnung am Feld mit Regel und Vorschlag – `bd1bb952`.

### C – Messung und Abschluss
- [x] **T3544 3.4** Browsertest mit zwei Seiten, Abgleich über `rev`; grün beim ersten Lauf, keine Codeänderung (Gegenproben rot) – `a4883165`.
- [x] **T3545** Tests robust: Rückkehr der Seite abwarten `22e1f1d8`, Serverstart je `beforeAll` `21580cb4`; drei Engines 24/24, Metiejo 314/314.
- [x] **T3546** PR #128; CI nach einem R-8-Neustart grün (41144661915).

## Teil 4 – Markenassistent

**Branches:** `261030-spec-035-t4a-markenassistent` (#127, 4a) · `261030-spec-035-t4b-markenassistent` (#129, 4b) (D-10).

### A – Rot zuerst
- [x] **T3547 4.1** Synthetische Seiten A/B und Bilder, Weg-C-Tests mit Renderer-Attrappe, Challenge und scheiterndem Lader; Eroj-Test mit Chromium – `7cc4740e`.
- [x] **T3548 4.5.6** JPG/WebP in beiden Upload-Feldern, ohne Browser, falsche Bytes; Eroj-Test Dekodieren – `4f90b98a`.
- [x] **T3549 4.2** Akzent aus der Inspiration mit Herkunft (Bild, Anteil) – `e9792729`.
- [x] **T3550 4.3** „Pille“ über Regler und Chat, Karten begrenzt, Stufen als Daten, ehrliche Antwort am Reglerende – `43227fba`.
- [x] **T3551 4.4** Nach einer Änderung im Chat freigebbar, ohne „Vorschlag übernehmen“ – `213cce1e`.
- [x] **T3552 4.5.5** Platzhalter und Beispiel der Kennungsmeldung sind ein erfundener Name – `05ccc448`.
- [x] **T3553 4.5.4** Gleiche Warnungen mit gleichem Vorschlag als eine Meldung mit Zahl der Stufen – `5467226b`.
- [x] **T3554 4.5.2** Zustand je Schritt sichtbar, lange Namen umbrechen – `27c81b8e`.
- [x] **T3555 4.5.3** Kein rohes Markdown, kein HTML aus dem Modell (D-02) – `ad5b075c`.
- [x] **T3556 4.5.1** Vorschlag zeigt Farbfläche, Ausschnitt, Vorher/Nachher; ein Satz – `2874d7c3`.

### B – Grün
- [x] **T3557 4.1** Renderer `enportilo/bildilo.ts` (Playwright optional, verzögert), Messung nach Fläche mit Gewichten, Blockiert-Erkennung, Satz ohne Browser – `e892938c`; Testseite mit `--fm-`-Variablen – `c5c0fb6f`.
- [x] **T3558 4.5.6** JPG/WebP über den Browser dekodieren, Byte-Prüfung, `accept`-Werte – `e975e337`.
- [x] **T3559 4.1 (AC-11)** Wächtertest „Start ohne Playwright“, Eintrag in `THIRD_PARTY_NOTICES.md` – `53827d66`.
- [x] **T3560 4.2** Akzentvorschlag (Schwellen in `kreilo.json`), offener Vorschlag und Kroniko – `ed5defeb`.
- [x] **T3561 4.3** `form.bedienelemente`, `stufen` in `wuensche.json`, `waehle_form`, Werkstatt-Halt, Grenzsätze – `56cb9018`.
- [x] **T3562 4.4** `freigebbar`/`freigabeSatz` in `stato.ts`, `zeigeStato` – `d337bcac`.
- [x] **T3563 4.5.5** „Quendolin“, Tests mit erfundenen Namen – `9f1fa807`.
- [x] **T3564 4.5.4** `meldungenOf` in `klartextHtml` – `c364e575`.
- [x] **T3565 4.5.2** Abzeichen im eigenen `span`, Umbruch der Leiste – `20ef4f13`.
- [x] **T3566 4.5.3** `fm-markdovido` für Antworten – `b078f58b`.
- [x] **T3567 4.5.1** `kurzsatzOf`, Farbflächen, Route `materialo`, Vorschau mit `propono` – `7a52ae0e`.

### C – Messung und Abschluss
- [x] **T3568 4.7** Abnahmeskript Weg C, Lauf ohne Modell (prägende Farbe getroffen, 0 Tokens) – `0516d45a`.
- [x] **T3569 4.1** Echte Marken lokal vorher/nachher (nur Zusammenfassung im plan).
- [x] **T3570** AK-07 nach 4a und 4b in Ruhe unverändert gegen `main`; Playwright nicht im Start des MCP-Servers.
- [x] **T3571 4.6** Drei Skizzen im plan (D-14).
- [x] **T3572 4.7** Weg C, dann Weg A mit `ministral-14b-2512`: 1 402 Tokens 0,00028 $ 6,2 s; 8 113 Tokens 0,00162 $ 27,2 s.
- [x] **T3573** PRs #127 und #129, CI grün (41143917177, 41148292000).

## Abschluss

- [x] **T3574** CI aller sieben PRs, zwei R-8-Neustarts grün, Kosten 0,18296 $ ≤ 0,50 $, `main` unverändert, Überschneidungen und Merge-Reihenfolge geprüft.
- [x] **T3575 Doku:** plan, tasks und Bericht zusammengeführt (PAK-5.2) – `01d3c2a3`; SHA im Folgecommit nachgetragen.
- [x] **T3576** Doku-Test (rot `2dbc3fad`, grün im Doku-Commit „Prüfung gegen die Abnahmekriterien“) und Prüfung gegen AC-1 bis AC-11 (PAK-6.1): zehn erfüllt, AC-4 teilweise (B-6.1-1).
- [ ] **T3577** B-6.1-1 entscheiden (Maintainer, D-118).
