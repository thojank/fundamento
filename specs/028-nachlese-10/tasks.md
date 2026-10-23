# Nachlese 10 – Aufgaben

**Briefing:** [`briefing.md`](briefing.md) · **Plan:** [`plan.md`](plan.md) · **Branch:** `261023-nachlese-10-172dff` (von `main` `5f37d75`, nach #107). Aufgaben ab T2801.

### A – Rot zuerst
- [x] **T2801 Tests** in sechs Dateien:
  - Modelo `src/lingvo/nachlese-10.test.ts`: vier Namen; deutscher Zweck je Uzo und Fehler, wenn einer fehlt.
  - Projekcioj `src/nachlese-10.test.ts`: Figma `--lingvo de` mit deutscher Beschreibung und deutschem Markdown; die Regel gegen den Rahmen des Browsers.
  - Metiejo `src/nachlese-10.test.ts`: Zweck, Regler, Vorschau, Schalter in der Kopfzeile, Hinweis des Builds.
  - Browser `packages/eroj/test/metiejo.spec.ts`: die Metiejo als CLI-Server mit Öffnen ohne Namen, Schalter, Fokusring, Zweck, Reglern und Vorschau, in drei Engines.
  - Doku-Test.

  Rot in `5871d4b`:
  - Modelo: 4 Namen, Doku 1
  - Projekcioj: 3
  - Metiejo: lädt nicht (`eksperto.js` fehlt)
  - Browser: 2

  Schon grün war „jeder Zweck deutsch vorhanden“, weil die Daten aus Nachlese 8 ③ stehen; der Test bleibt als Wache.

### B – Grün
- [x] **T2802 Namen** in `tradukoj.json`; Tabelle in plan 026 ② mit Vermerk nachgezogen.
- [x] **T2803 Figma Deutsch** (D-01): `uzoMarkdown(…, lingvo)`, `inLingvo` mit `uzoIn`/`reguloIn`. Den Test der Spec 026, der den englischen Zweck in der deutschen Beschreibung erwartete, nachgezogen.
- [x] **T2804 Studio** (D-02–D-05):
  - Zweck als Span
  - `kombinationToggles`
  - Vorschau mit Spans, Island und Skript
  - Schalter in `principal`
  - `fmLingvo` mit Texten je Sprache und `data-fm-nomo-sole`
  - Den Pin der Spec 026 zur Beschriftung „lingvo“ auf den Span nachgezogen.
- [x] **T2805 Öffnen** (D-06): das Client-Skript.
- [x] **T2806 Fokusring** (D-07): `outline: 0` an der Option (die Kurzform setzt den Stil auf `none`; `outline-style: none` verbietet das Token-Gate). Den Test-Ausdruck für die generierte TS-Datei (maskierte Anführungszeichen) angepasst.
- [x] **T2807 Expertenansicht** (D-08): `eksperto.ts`, `ServiloOptions.stand`, Hinweis in Schnellstart, Studio und Komponentenseite.

### C – Abschluss
- [x] **T2808 Doku:** plan (Ursachen, D-01–D-08, Abweichungen 1–3, B-1–B-4, O-1–O-2, Messanleitung), tasks, Vojmapo, README.
- [x] **T2809 Messungen:** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `5871d4b`, grün im Folgecommit (Hash im PR) |
| Rot gemessen | Modelo 4 + Doku 1, Projekcioj 3, Metiejo 1 Datei, Browser 2 |
| Grün gemessen | Modelo 175 Dateien / 3 808 Tests; MCP 45 / 436; Projekcioj 34 / 859; Metiejo 16 / 183; CLI 7 / 76; Agordilo 14 / 110; Browser (Chromium) 331; `metiejo.spec.ts`, `elekto.spec.ts` und `forced-colors.spec.ts` in Chromium, Firefox und WebKit 34; Vitrino-Check 56; Alirebleco (Chromium) 211; `check:parity` 40 / 0 Differenzen / 683 freigegeben; `check:vortaro-lint` und `check:regularo` sauber; Lint sauber |
