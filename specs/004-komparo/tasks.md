# Aufgaben – Spec 004, **Etappe A**

**Plan:** [`plan.md`](plan.md) · **Spec:** [`spec.md`](spec.md) · **Datenmodell:** [`data-model.md`](data-model.md) · **Verträge:** [`contracts/`](contracts/) · **Stand:** Entwurf zur Prüfung (Review 2026-09-20 eingearbeitet: zwei Ebenen, Dunkelmodus-Ziel) · **Datum:** 2026-09-20 · **Basis:** `main` @ `98b0e10`

Etappe A umfasst FR-01 bis FR-09, FR-19 und den vorbereitenden Teil von FR-15. **Etappe B (FR-10 bis FR-14, FR-16 bis FR-18) ist nicht enthalten**; sie läuft in einer eigenen Sitzung im Repo `fundamento-aspekto-komparo`.

**Regeln für jede Aufgabe:**

- **Rot zuerst, ohne Ausnahme.** Test schreiben, laufen lassen, Fehlschlag aus dem erwarteten Grund beobachten, erst dann umsetzen. Das fehlschlagende Kommando und eine fehlschlagende Zusicherung stehen in der Commit-Nachricht. Mutationsprüfung nur für Abnahmetests (T012 axe, Zeitbudgets), wie in Phase 3 vereinbart.
- **Fluida Marko** (Plan D-03): Eine Regulo erzwingt Zugänglichkeit und Struktur, nie Geschmack. Was nur komuna will, ist eine **Aspiro** in `aspekto.json` und bindet keine andere Marke.
- **Clean Room (Art. V, FR-03):** nichts von Adobe Spectrum öffnen, laden oder installieren. `research/benchmark-spectrum.md` darf gelesen werden. komuna 2 entsteht aus den Zielen in plan.md D-02, nie aus einem Vorbild.
- **Sprache:** Artefakte dieser Spec auf Deutsch, Code und Test-Bezeichner auf Englisch (Maintainer-Entscheidung 2026-09-20).
- **Fertig heißt:** `pnpm check` grün, Aufgabe hier abgehakt, Abweichungen als Done-Notiz festgehalten.
- `[P]` = kann parallel zur vorigen Aufgabe laufen (andere Dateien, keine Abhängigkeit).

## Etappe 0 – Verfassung

- [ ] **T001 Constitution v1.7, Art. V Benchmark-Aspekto** (FR-19, AK-08, D-11)
  - Rot: `packages/modelo/src/docs/docs.test.ts` erwartet Version `1.7`, den Absatz „Benchmark-Aspekto" im Wortlaut aus FR-19 unter Artikel V, den Historieneintrag `v1.7 (Spec 004) …` und den unveränderten Satz „Quellmaterial anderer Systeme wird dem Coding-Tool nicht vorgelegt".
  - Grün: `.specify/memory/constitution.md` auf v1.7.
  - Fertig wenn: Dokumenttest grün; kein Jugxo nötig (Erweiterung, kein Bruch), Begründung in plan.md D-11.

## Etappe 1 – Metriken

- [ ] **T002 Metriken-Modul** (FR-02, D-12, data-model §3)
  - Rot: `packages/modelo/src/metrikoj/*.test.ts` je Metrik mit erfundenen Daten und Grenzfällen: Abstand 0, Ausreißer in der Rampe, Alpha-Rampe, Ankerstufen, Wert außerhalb des sRGB-Gamuts, Skala mit Sprung, Zeilenhöhe die mit der Größe steigt, Marke ohne eigene Werte in einer Dimensio. Jeder Test nennt die erwartete Zahl.
  - Grün: zehn reine Funktionen mit den IDs aus data-model §3 (`wcag2-reserve`, `oklch-l-delta`, `oklch-l-extreme`, `oklch-l-step`, `oklch-l-align`, `srgb-gamut`, `type-scale-ratio`, `type-scale-consistency`, `type-rhythm`, `dimensio-kovrado`), exportiert über `@fundamento/modelo`.
  - Fertig wenn: keine zweite Farbmathematik (nur `oklchLightness` und die Kontrastfunktionen aus Spec 002); die Metriken liefern Zahlen, kein Urteil.

## Etappe 2 – Reguloj (für jede Marke)

- [ ] **T003 Die zwei Reguloj, die heute anschlagen** (FR-01, FR-02, AK-01, D-02 G1/G2, D-03)
  - Rot: `contrast-reserve` und `surface-distinct` in `data/reguloj.json` mit Kialo und Sojlo; `pnpm -s fm modelo validate` über das **eigene** Modelo schlägt fehl, mit genau den Befunden aus research §2: `status-success-on-basic` (+3,6 %), `text-muted-on-background-sunken` (+4,2 %), `status-info-on-basic` (+7,3 %) und zwei Flächenpaare mit Abstand 0 (hell `default`/`raised`, dunkel `sunken`/`canvas`). Entsprechende Befunde für `ekzemplo` über die Fixture-Konfiguration (engste Paare +4,1 % und +4,4 %).
  - Grün: Durchsetzer in `validate/color-reguloj.ts` (je Kombination), Meldungen mit gemessenem und gefordertem Wert (contracts/checks §3).
  - Fertig wenn: die Zahl der Verstöße je Aspekto in der Done-Notiz steht; Werte ändert erst T006.
- [ ] **T004 [P] Die fünf Reguloj, die heute halten** (FR-01, FR-02, D-02 G4–G8)
  - Rot: `palette-even`, `palette-aligned`, `srgb-gamut`, `type-scale` (als **Regelmäßigkeit**, `type-scale-consistency` ≤ 10 %) und `type-rhythm`; da das Repo sie erfüllt, kommt der rote Lauf aus Fixtures: je eine ungültige Modelo-Fixture pro Regulo (Rampe mit Ausreißer, Rampe gegen die anderen verschoben, Farbe außerhalb des Gamuts, Skala mit einem Verhältnis 1,6 neben lauter 1,2, Zeilenhöhe die mit der Größe steigt) mit `expected-issues.json`.
  - Grün: Durchsetzer; Ausnahmen mit Kialo in der Regulo selbst (Alpha-Rampen, Ankerstufen – data-model §2).
  - Fertig wenn: die Fixtures rot waren, das Repo grün ist und `check:regularo` die neuen Reguloj mit Kialo führt. **Kein fester Verhältnisbereich** in `type-scale`: eine Marke mit konstantem 1,5 besteht.

## Etappe 3 – Aspiroj (je Marke)

- [ ] **T005 Aspiroj: Begriff, Schema, Prüfung, getrennte Ausgabe** (FR-01, FR-02, D-03, D-14, data-model §2b)
  - Rot: (1) Ontologio-Test erwartet den Begriff `Aspiro` unter `inScheme: modelo` mit Definition in `en`/`de` und Bezug zu `Aspekto`; (2) Schema-Test erwartet `aspekto.json#/aspiroj` mit Pflichtfeldern `metriko` und `kialo` und mindestens einer Schranke – eine Aspiro ohne Kialo ist ungültig; (3) `validate`-Test über eine Fixture-Marke mit einer verfehlten Aspiro erwartet genau ein `aspiro-missed` mit Marke, Metrik, Ist, Soll und Kialo, Zusammenfassung getrennt gezählt; (4) **Negativtest Fluida Marko:** eine Fixture-Marke mit reinem Weiß als Fläche und konstantem Verhältnis 1,5 besteht jede Regulo und bekommt kein `aspiro-missed`.
  - Grün: Schema, `validate/aspiroj.ts`, Regel-ID `aspiro-missed` im Katalog, Stats `reguloViolations` und `aspiroMisses`, Ontologio-Eintrag.
  - Fertig wenn: eine Marke ohne `aspiroj` vollständig gültig ist; die Meldung nie das Wort „Regel" für ein Ziel benutzt. **Benennung:** fällt die Entscheidung des Maintainers auf `Intenco`, `Promeso` oder `Strebo`, wird hier umbenannt (Ontologio, Schema, Meldung, Vitrino).
- [ ] **T006 komuna 2: eigene Ziele und die Werte dazu** (FR-01, FR-04, AK-01, D-02 G1b/G3/G7b/G9, D-04, D-05)
  - Rot: komunas vier Aspiroj in `packages/aspekto-komuna/aspekto.json` (Reserve ≥ 10 %, Abstand zum Anker ≥ 0,02 für Flächen, Verhältnisband 1,10 – 1,30, Abdeckung `color-scheme=dark` = 100 % über `background`, `text`, `action`, `status`); `validate` meldet vier verfehlte Entwurfsziele, dazu die Regulo-Verstöße aus T003.
  - Grün, in dieser Reihenfolge: (1) ankernahe neutrale Stufen, (2) Flächenrollen neu gezeigt (hell `raised` über `default`, dunkel `sunken` unter `canvas`), (3) **57 eigene Dunkelwerte** in `aspekto/komuna+color-scheme/dark`, (4) drei enge KontrastParoj auf Reserve. `ekzemplo` zieht **nur** dort nach, wo eine Regulo es verlangt.
  - Fertig wenn: `pnpm check` grün; jede Wertänderung nennt in der Commit-Nachricht die Regulo oder Aspiro, die sie erzwingt; research §2 bekommt eine Spalte „nachher"; die Abdeckung von komuna in `color-scheme=dark` steht bei 100 %, die von ekzemplo unverändert bei 1,3 % (und das ist in Ordnung – Fluida Marko).

## Etappe 4 – Vitrino

- [ ] **T007 Celo-Gerüst mit zweiter Phase** (FR-05, FR-09, D-06, contracts/vitrino §1)
  - Rot: `projekcioj/src/celoj/vitrino/vitrino.test.ts`: `vitrino/index.html` existiert nach dem Build, enthält kein `http://`, kein `https://`, kein `src=`/`href=` auf eine Datei, steht mit SHA-256 im Manifest und ist in zwei Builds byte-gleich; `build.test.ts`: `after` läuft nach dem Bündeln der Make Kits.
  - Grün: `Celo.after`, Aufruf in `buildProjekcioj`, `vitrinoHtml({ css, elementJs, datumoj })` als reine Funktion.
- [ ] **T008 Paletten, Flächen, Text, Status, Aktionen** (FR-06, D-07, data-model §4)
  - Rot: Tests über das erzeugte HTML: je Rampe eine Tabelle mit einer Zeile je Stufe (Tokenname, Hex, OKLCH-L) und eine SVG-Kurve; die vier Flächenrollen mit Abstand zur Nachbarin; `default`/`subtle`/`muted` auf jeder Fläche; vier Status mit Fläche, Text, Rand; drei Varianten × zwei Tonarten × sechs Zustände. Negativtest: kein Hex- und kein `oklch(`-Literal in der Vorlage.
  - Grün: Abschnitte und JSON-Insel `paletroj` und `roloj`.
- [ ] **T009 `butono` als echtes Element** (FR-06, D-06)
  - Rot: Test über das HTML: `fm-butono` in allen Varianten × Tonarten × Größen × Zuständen; das eingebettete Skript enthält die Registrierung; kein React im Dokument.
  - Grün: Einbettung des Make-Kit-Element-Bundles, Abschnitt `butono`.
- [ ] **T010 Kontrastmatrix, Regularo, Ziele und Abdeckung** (FR-06, D-07, G10)
  - Rot: Test: je KontrastParo der aktuellen Kombination eine Zeile mit WCAG-Wert, Schwelle, Reserve, APCA-Wert und Ergebnis; jede Regulo mit Kialo und Ergebnis; jede Aspiro der gezeigten Marke mit Soll, Ist und Kialo, als **Entwurfsziel** bezeichnet; je Dimensio-Wert die Abdeckung `dimensio-kovrado`. Die Zahlen stimmen mit `evaluateAlirebleco`, `validate` und den Metriken überein (dieselbe Rechnung, nicht nachgebaut).
  - Grün: JSON-Insel `mezuroj`, `regularo`, `aspiroj`, `kovrado` und die Abschnitte dazu.
  - Fertig wenn: die Insel kanonisch sortiert ist und die Datei unter 3 MB bleibt (Messwert in der Done-Notiz).
- [ ] **T011 Umschalten und Gegenüberstellung** (FR-07, FR-08, D-08, contracts/vitrino §3–§4)
  - Rot: Playwright in `eroj`: jede der sechs Dimensioj schaltet ohne Neuladen (berechnete Farbe **und** angezeigte Zahl ändern sich), das URL-Fragment stellt den Zustand wieder her, der Vergleichsschalter zeigt zwei Spalten mit beiden Werten und der Kennzeichnung als Wort; Aspiroj erscheinen **nicht** im Vergleich.
  - Grün: Inline-Skript (kein Framework), Vergleichsansicht, Kriterienliste aus contracts/vitrino §4.
- [ ] **T012 `check:vitrino` und CI-Schritt** (FR-09, AK-02, D-09)
  - Rot: `workflow.test.ts` und `docs.test.ts` erwarten den Schritt „Check: Vitrino", das Skript `check:vitrino` und den README-Eintrag, bevor es sie gibt; `vitrino.check.ts` erwartet axe ohne Befund in hell und dunkel, beide Kontraststufen.
  - Grün: eigene Playwright-Konfiguration, Skript, CI-Schritt, README-Zeile.
  - Fertig wenn: der Lauf außerhalb des Test-Gates steht und in der CI unter zwei Minuten bleibt; Mutationsprüfung für axe (ein entfernter Tabellenkopf lässt die Prüfung fehlschlagen).

## Etappe 5 – Clean Room

- [ ] **T013 Fingerprintquellen mit Herkunft** (FR-15 vorbereitend, AK-06 Teil, D-10, contracts/checks §1)
  - Rot: Fixture mit einer zweiten Fingerprintliste `{ "source": "testmarko", "fingerprints": [...] }` und einem eingepflanzten Wert im Prüfbaum: erwartet wird genau ein Fund mit der Herkunft `testmarko`; ohne die Liste kein Fund; eine genannte, fehlende Datei ergibt `file-missing`.
  - Grün: `--spuroj` (mehrfach), `markoSpuroj` in `fundamento.config.json`, Herkunft in der Meldung, `fingerprintSources` und `fingerprints` in den Stats.
  - Fertig wenn: die eingebaute Liste unverändert weiterläuft und Etappe B nur noch ihre Datei liefern muss.

## Etappe 6 – Dokumentation

- [ ] **T014 README, Vojmapo, Quickstart, Nachverfolgbarkeit** (Art. XIII, AK-02)
  - Rot: `docs.test.ts`: README nennt die Vitrino mit Pfad, `pnpm check:vitrino`, die sieben neuen Reguloj, den Begriff Aspiro mit einem Satz Erklärung und den Gegenüberstellungs-Schalter; `docs/vojmapo.md` Zeile 3b trägt Etappe A als umgesetzt mit offener Abnahme; `plan.md` verweist auf die Aufgaben-IDs.
  - Grün: die Dokumente.

## Manuelle Abnahme (Maintainer, nach dem PR)

- **M1 – komuna 2 und die Vitrino:** Vitrino öffnen, alle sechs Dimensioj durchschalten, komuna 2 visuell beurteilen, dann die Gegenüberstellung komuna ↔ ekzemplo, dann die Abschnitte „Ziele" und „Eigene Werte je Dimensio". Jeder Befund ohne Prüfung wird Regulo-Kandidat (wenn er Zugänglichkeit oder Struktur betrifft) oder Aspiro-Kandidat (wenn er komunas Geschmack betrifft), jeweils mit Kialo. Ergebnis in `plan.md` → „Ergebnisse der manuellen Abnahme".

## Nach dem Merge (außerhalb des Repos)

- [ ] **T015 ciferecigo gegen die neuen Reguloj** (FR-04, D-05)
  - Rot: `pnpm fm modelo validate --aspekto ../fundamento-aspekto-ciferecigo` gegen den gemergten Kern schlägt mit den neuen **Reguloj** fehl (erwartet: Flächenabstand, Reserve).
  - Grün: Ableitung im privaten Paket nachziehen, wie Spec 003 T028; eigene Aspiroj darf ciferecigo erklären, muss aber nicht.
  - Fertig wenn: `validate` 0 liefert und `check:alirebleco` für die Komposition besteht. ciferecigo kommt in keine Registry, kein Figma, kein Make.

## Nachverfolgbarkeit

| Anforderung | Aufgaben |
|---|---|
| FR-01 | T003, T004, T005, T006 |
| FR-02 | T002, T003, T004, T005 |
| FR-03 | gilt für alle Aufgaben (Kopf dieser Datei) |
| FR-04 | T006, T015 |
| FR-05 | T007, T008 |
| FR-06 | T008, T009, T010 |
| FR-07 | T011 |
| FR-08 | T011 |
| FR-09 | T007, T012 |
| FR-15 (vorbereitend) | T013 |
| FR-19 | T001 |
| AK-01 | T003, T004, T005, T006 |
| AK-02 | T007 – T012 |
| AK-06 (Teil) | T013 |
| AK-08 | T001 |
| AK-09 (Teil) | M1 |
| FR-10 – FR-14, FR-16 – FR-18 | **Etappe B**, nicht hier |

Konsistenzprüfung vor der Umsetzung (`/speckit.analyze`-Umfang): jede Anforderung der Etappe A hat mindestens eine Aufgabe; jede Aufgabe hängt an einer Entwurfsentscheidung; keine neuen Pakete (Art. XI); keine Aufgabe senkt eine Schwelle; keine Aspiro wird zur Regulo erhoben; nichts wird veröffentlicht; `pnpm-lock.yaml` ändert sich nicht.
