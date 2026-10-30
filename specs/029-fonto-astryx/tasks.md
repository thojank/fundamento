# Spec 029 ① – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Branch:** `261023-spec-029-fonto-astryx-grundlagen` (von `main` `d29a5206`, nach dem Merge von Spec 027, #109). Aufgaben ab T2901. ②a läuft in Sitzung B; ②b und ③ stapeln auf diesen Branch.

### A – Fonto lesen, messen, rot zuerst
- [x] **T2901 Fonto gepinnt:** `@astryxdesign/core` und `@astryxdesign/theme-neutral` 0.7.4 von npm (Integrität), Tag `v0.7.4` = Commit `704757fd827c6fa00a71af80b06d5da99d155e45`; vier Quelldateien des Themes im Tarball byte-gleich mit dem Commit, LICENSE gleich. Nur Daten gelesen, kein Code der Fonto ausgeführt.
- [x] **T2902 Basis von `main`:** je Kombination ein Hash über alle 1 608 aufgelösten Werte von komuna (`komuna-main.json`), abgeglichen mit `fm modelo export` von `main` (0 Abweichungen); dieselben Hashes für ekzemplo, provo (ohne Schrift) und provo-kompakta (`marken-main.json`, im roten Worktree auf den Daten von `main` erzeugt).
- [x] **T2903 Rote Tests** in 13 Dateien:
  - `projekcioj`: `fonto/komuna-0-2`, `fonto/komuna-fonto`, `celoj/vitrino/bazoj`, `celoj/figma/plugin-name`, `celoj/figma/figma-cxiuj`
  - `modelo`: `checks/fontoj`, `e2e/checks` (Fixtures `fontoj-registro`, `fontoj-deveno`, `clean-room-fonto`), `index`, `contracts`, `ci/workflow`, `docs` (README, Spec 029)
  - `agordilo`: `struktur-029`; `metiejo`: `komuna-0-2`

  Rot in `2b44898f`: 44 Tests in 13 Dateien (gemessen in einem eigenen Worktree auf genau diesem Commit). Schon grün waren: die Basis der anderen Marken (bestätigt sie auf `main`), zwei Strukturtests des Agordilo (die Struktur von `main` ist komuna 0.2) und zwei Studio-Tests, deren Werte auf `main` zufällig stimmen.

### B – Grün
- [x] **T2904 Constitution v2.4** wörtlich nach der Spec; Ontologio mit dem Begriff Fonto (22 Begriffe der Tabelle).
- [x] **T2905 Register und Prüfung:** `packages/modelo/data/fontoj.json` (Schema `FontojFile`), `THIRD_PARTY_NOTICES.md`, `deveno.json` (Schema `DevenoFile`, geladen als `modelo.deveno`), `check:fontoj` mit sechs Regeln (in `pnpm check`, CI, README), `check:clean-room` mit Fonto-Ausnahme.
- [x] **T2906 komuna-0-2:** Paket mit vollständigem Set, Dunkel-Set, Schriften, Ikonaro, Aspiroj; Namespace `malnova`; im Build mit allen Marken.
- [x] **T2907 Werte von komuna:** `scripts/fonto-astryx/schreiben.mjs` (Paletten, Rollen hell/dunkel, Typografie mit Touch und schmal, Größen, Radien, Elevation, Fokus, Bewegung, Deckkraft), Konjunktions-Sets für Dunkel, Breite, Dichte und hohen Kontrast, `deveno.json` mit 405 Werten.
- [x] **T2908 Regeln gewinnen:** Messung mit `fm modelo validate`, `check:alirebleco`, `check:parity` und den Tests der Daten; 45 angepasste Werte (31 Tokens in `anpassoj.json`, die Rundung J8 im Generator), 8 Jugxoj von komuna (`jugxoj.json`); die Jugxo-Liste steht im plan.
- [x] **T2909 provo mit Prata:** `agordo.json` (Schrift und Fallback `ui-serif, serif`), neu abgeleitet; nur die Schrift ändert sich.
- [x] **T2910 Agordilo, Werkstatt, Studio:** `struktur02Files`, `readStructure()` auf komuna 0.2 (Fingerabdruck `554efc71…` wie gespeichert); die Werkstatt der Vitrino derselbe; Studio mit Basis „komuna-0-2“.
- [x] **T2911 Foundation-Seiten** (`celoj/vitrino/bazoj.ts`): acht Abschnitte, Daten je Marke, Suche, Texte deutsch und englisch.
- [x] **T2912 Figma:** Plugin „Fundamento Grundlagen“, ID `fundamento-grundlagen-‹Hash›`; INNER_SHADOW für eine Schicht `inset`.
- [x] **T2913 MCP:** `get_token` nennt die Herkunft eines Werts (`deveno`).
- [x] **T2914 Bestehende Tests nachgezogen**, wo sie Werte der alten komuna festnagelten:
  - Werte und Herkunft: `color.text.default` (neutral.1000), Radien (10/12), Elementgrößen (28/32/36), Typografie (14 px, Gewichte), Schatten (drei Schichten, kaskadiert über `color-scheme`), Sets und Theme-Fragment von komuna, Abdeckung des Dunkelmodus (94/94), Herkunft der Typografie bei schmaler Breite;
  - Plugin-Tests: Geist Bold und die Kreuzung Archivo Bold in den Schriften der vorbereiteten Datei; Plugin-ID und -Name (`plugin-name`, `figma-cxiuj`, `lingvo`, Metiejo `eksporto`, `plugin-bauformen-eigenschaften`);
  - der Bildvergleich von Spec 027 zeichnet mit den Werten von komuna 0.2 (`komuna02PluginCode`) und bleibt unverändert grün;
  - die Kontrastprüfung der Phase 0 und `check_contrast` kennen den Ausweichzweig (aux) wie `check:alirebleco`;
  - die unvollständige Fixture nennt die Folge `state-distinct` (B-4); ekzemplo ist enger als komuna 0.2;
  - Regularo zählt die Jugxoj der Pakete, der Regelkatalog die sechs Regeln von `check:fontoj`, der Workspace das neue Paket.
  - `check:vitrino`: die beratenden APCA-Hinweise der 72 Kombinationen von komuna (2394 → 2646, B-5), der Zeuge für die breite Viewport-Stufe (`--fm-layout-grid-columns`);
  - `internacia.spec.ts`: headline.4 ist in komuna 14 px; die vierfache Überschrift passt in eine Zeile des Dialogs, das Umbrechen belegt die achtfache.
- [x] **T2918 Befunde aus den Prüfungen, behoben:** Info-Rand hell auf Stufe 40 (`wcag2-reserve`, J6); die Werkstatt bringt das Stylesheet ihrer Struktur mit (B-6, Unit-Test in `vitrino.test.ts`; der Rundweg in `vitrino.check.ts` misst die Farbe von „Ansehen“ in „Ansehen“, nach dem Übergang, weil die Werkstatt jetzt komuna 0.2 zeigt); der Rollbereich der Token-Tabelle ist mit der Tastatur erreichbar (B-7, axe).
- [x] **T2915 Befunde als Regeln:** zwei frühere Befunde, die nur als Test bestanden, gewinnen gegen die Fonto (die gewählte dritte Aktion bleibt deckend; kein reines Weiß als Text im Dunkeln, R4), ebenso die Parität (eine Deckkraft je Paint) und Nachlese 8 ② 1 (`neutral.950` bleibt im Dunkel-Set von komuna).

### D – Entscheidungen vom 24.10. (Briefing A)
- [x] **T2919 Briefing** [`briefing-a-2026-10-24.md`](briefing-a-2026-10-24.md) unverändert kopiert (Doku-Test mit SHA-256); O-1 bis O-5 im plan mit den Entscheidungen ①-1 bis ①-5, B-3 mit ①-7 (②b).
- [x] **T2920 ①-6 Überschriften von provo auf 400:** Prata hat nur 400 (`tiparoj.json`). Das Agordo von provo legt `typography.display.1–3` und `typography.headline.1–4` fest (`festgelegt`, Aliase wie die Struktur, `fontWeight` `{font.weight.regular}`), neu abgeleitet: in `sets/aspekto/provo.json` ändern sich genau die sieben Gewichte. Rot in `99989cc`: 4 Tests in 4 Dateien (`fonto/komuna-fonto`, `celoj/vitrino/bazoj`, `celoj/figma/figma-cxiuj`, modelo `docs`).
- [x] **T2921 B-8 Kern der Fonto-Ausnahme** (Befund aus Sitzung C, #113): `checks/clean-room/fonto.ts` nimmt Register und Kern aus dem Modelo des `deveno.json`, nicht den ersten Treffer im Baum. Rot in `04ff689`: 3 Tests in `checks/clean-room/fonto.test.ts`. Probe-Merge mit #113: 139 → 86 Treffer (die 53 des Kerns sind weg).
- [x] **T2922 #113 O-6:** plan, Jugxo `…ZVZM` von komuna und `scripts/fonto-astryx/werte.mjs` nennen für den hellen Wert von `color.background.inverse` nur Token und Stufe (neutral.950), nicht den Wert. Der Generator liest ihn aus dem gepinnten Kern der Fonto (`tokens.stylex.ts`); `deveno.json` hält ihn als Herkunft. Die Jugxo nennt keinen CSS-Namen (Export-Test AK-12). Der Nachvollzug von `schreiben.mjs` gegen `main` ist bis auf diese Jugxo byte-gleich. Rot in `06a3dff`: 1 Doku-Test.

### C – Abschluss
- [x] **T2916 Doku:** plan (Amendment, Fonto, komuna-0-2, Zuordnung, Jugxo-Liste, D-01–D-08, Abweichungen, Befunde, Offen, Compliance, Messungen, Messanleitung), tasks, Vojmapo, README.
- [x] **T2917 Messungen:** im plan; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `2b44898`, grün im Folgecommit (Hash im PR) |
| Rot gemessen | 44 Tests in 13 Dateien |
| Grün gemessen | siehe plan, Messungen |

## ①b Werte je Komponente aus der Fonto, weiße Flächen (Briefing A ①b, 27.10.)

**Branch:** `261023-spec-029-fonto-astryx-grundlagen`, neu aufgesetzt auf `main` nach #112 (`3dbb482`). Briefing [`briefing-a-1b-2026-10-27.md`](briefing-a-1b-2026-10-27.md) unverändert kopiert.

- [x] **T2930 Neu aufsetzen** auf `main` nach #112: Konflikte nur in Tests, Zählungen und Listen (Doku-Test Spec 029/030 nebeneinander, Regelkatalog 190, Schema mit `nordstelo.json` und `fontoj.json`, Workspace mit nordstelo und komuna-0-2); volle Suite grün.
- [x] **T2931 Rote Tests a), c), d)** in `92e9e98`: Weiß erlaubt (Flächen, Aspiro bei komuna-0-2, J1), deaktivierter butono lesbar im Browser (1,00:1 bei high), Vitrino ohne Icon mit Zeile „mit Icon“.
- [x] **T2932 a) Weiß erlaubt:** Aspiro `oklch-l-extreme` nur noch bei komuna-0-2; `anpassoj.json` (Karte weiß, Fläche 97,5, vertiefte Fläche 90, inverse Fläche dunkel weiß, gedrückt hell Schwarz), J1 und J5 neu begründet; neu erzeugt.
- [x] **T2933 d) Vitrino:** Kombinationszeilen ohne Icon, Zeile „mit Icon“ (butono, ligilo, signeto).
- [x] **T2934 Rote Tests b)** in `8f645c8` (8 von 8) und Doku-Test in `ebecd32`.
- [x] **T2935 e) Vergleich** `scripts/fonto-astryx/vergleich/`: eigenes Paket `@fundamento/fonto-vergleich` (privat, die Fonto 0.7.4 und React nur dort, Integrität wie im Register), 40 Fall-Dateien, Messung beider Seiten je Kombination, Zustand und Modus, Bilder, Seite mit Tabelle und Gründen (`gruende.mjs`).
- [x] **T2936 b) Ero-Tokens:** `eroj.mjs` (Ableitung als Alias, Herkunft je Wert, Regeln) und `eroj-regeln.mjs` (Prüfschleife mit `check:alirebleco`); hell im Kern, dunkel im Dunkel-Set von komuna; Jugxoj J9–J15.
- [x] **T2937 c) Fehler** über b): deaktivierter butono high mit weißer Schrift auf grauer Fläche (3,15:1).
- [x] **T2938 Projekcioj:** Figma liest Farbe und Maß aus dem Ero-Token (vorher aus der Rolle; bindend war schon der Ero-Token); die Fonto-Ausnahme von `check:clean-room` parst jedes Set einmal (10,7 s → 2 s).
- [x] **T2939 Bestehende Tests nachgezogen**, wo sie Werte der Rollen statt der Ero-Tokens von komuna festhielten (AK-03 je Ero, Figma-Plan, Vitrino-Zählungen, Spec 024 M-3, Export).
- [x] **T2940 Abnahme 28.10. (13:03), rote Tests** in `c978c7c`: die Vitrino aus `fundamento.cxiuj.config.json` im Browser (butono high deaktiviert ≥ 3:1, medium und der Knopf des alsxutilo mit Rand = Fläche, hell und dunkel), die Elemente des Make Kits lesen `--fm-ero-*`, die Vergleichsseite baut diesen Build und öffnet das dialogo nur für seinen Fall.
- [x] **T2941 Make Kit:** die Stile mit Besitzer (`stylesheetOf`, `lightStylesheetOf`); Vitrino und Kits lesen die Ero-Tokens.
- [x] **T2942 Generator:** durchsichtige Farben der Fonto bleiben durchsichtig (nächste Stufe `shade`/`tint`), eine gemeinsame Deckkraft beider Modi; butono medium, avataro, signeto auf `action.tertiary.hover` (8 %).
- [x] **T2943 Vergleichsseite:** derselbe Build und das Element seiner Vitrino; das modale dialogo nur in seinem Fall (der graue Grund).
- [x] **T2944 Prüfungen nachgezogen:** Kontrast der Initialen des avataro über durchsichtiger Fläche verrechnet; Zeuge der APCA-Hinweise 8550; Figma-Inventar des avataro „alpha varies by mode“.
- [x] **T2945 Abnahme 28.10. (17:19), Innenabstand:** rot in `2257cdc`; butono 12 px in jeder Größe wie die Fonto; nur Icon quadratisch ohne Innenabstand (Element `data-icon-only`); Eroj mit bemaßten Knopf-Teilen geben dem Knopf ihre Maße (`::part(control)`); O-1b-1, O-1b-2, O-1b-4 entschieden.

### Messungen ①b

| Was | Wert |
|---|---|
| Commits | rot `92e9e98` (a, c, d), `8f645c8` (b), `ebecd32` (Doku); grün im Folgecommit (Hash im PR) |
| Ero-Tokens mit Wert der Fonto | siehe plan ①b |

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

### D – Entscheidungen vom 24.10. (Briefing A)
- [x] **T2907 Rote Tests** im Doku-Test „Spec 029 ②a“, 4 neue: Briefing unverändert (SHA-256); jede der 254 Zeilen entschieden wie vorgeschlagen, Stand 2026-10-24; Auflagen ②a-2 bis ②a-6 an genau ihren 14 Zeilen; Achse `lines` statt `rules`. Rot in `a2008a8`: 4 von 12.
- [x] **T2908 Eintragen:** `entscheidung` = Vorschlag (②a-1), `auflage` an A-elekto-2, A-markobutono-2, A-sxaltilo-2 (②a-2), den acht Grenzen-Zeilen (②a-3), A-mezurilo-5 (②a-4), A-plenstato-6 (②a-5), A-tabelo-1 (②a-6, `achsen` mit `lines`); plan mit „Entscheidungen vom 24.10.“ und O-1 bis O-6 entschieden.
- [ ] **T2909 Neu aufsetzen** auf `main` nach dem Merge von ① (#111).

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `4075c32`, grün im Folgecommit (Hash im PR) |
| Rot gemessen | Doku-Test 7 von 8 rot |
| Grün gemessen | Doku-Test 8 von 8; Modelo gesamt und Lint im PR |
| Abgleich | 40 Eroj, 240 Zeilen: 27 übernehmen, 72 anpassen, 141 behalten; 14 Muster; 45 fehlende Gattungen (33 Eroj-Runde 6) |

## ②b-1 Felder (M-5, M-6, M-1, M-2)

- [x] **T2950 M-5 rot** in `ac0fe9b` (Skemo 23, Browser 12, Figma 12).
- [x] **T2951 M-5 grün:** Modelo, Web, Figma, Vitrino; Erwartungen der bestehenden Tests nachgezogen (Teile, Props, Zählungen, Prüfsummen).
- [x] **T2952 M-6 Löschen-Knopf:** rot in `9b81ad3`, grün im Folgecommit (Modelo, Web, Figma; Brief des kampo 740).
- [x] **T2955 Brief: Boolean-Props kompakt** (Entscheidung 29.10.): rot in `0d464a0`; `flags` im Brief und im Ausgabeschema von get_ero, `props` ohne Booleans; kampo 740 → 682 von 750.
- [x] **T2953 M-1 Grund für „deaktiviert“:** rot in `cc50ea5`, grün im Folgecommit (Modelo, Web mit eingebettetem konsileto, faldilo `disabled`, Figma 8 Varianten des faldilo).
- [x] **T2956 Abnahme #122 rechter Feldrand:** rot in `61cf5be5` und `51a65efc` (Ziel der Knöpfe), grün im Folgecommit (`trailing` im Skemo, Ziel `width`, Web-Ende im Feld, Figma im Control, Vitrino Löschen und loading, Bericht der Ereignisse korrigiert).
- [ ] T2954 M-2 Status warning/success

