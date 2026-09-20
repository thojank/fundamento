# Aufgaben – Spec 004, **Etappe A**

**Plan:** [`plan.md`](plan.md) · **Spec:** [`spec.md`](spec.md) · **Datenmodell:** [`data-model.md`](data-model.md) · **Verträge:** [`contracts/`](contracts/) · **Stand:** Entwurf zur Prüfung · **Datum:** 2026-09-20 · **Basis:** `main` @ `98b0e10`

Etappe A umfasst FR-01 bis FR-09, FR-19 und den vorbereitenden Teil von FR-15. **Etappe B (FR-10 bis FR-14, FR-16 bis FR-18) ist nicht enthalten**; sie läuft in einer eigenen Sitzung im Repo `fundamento-aspekto-komparo`.

**Regeln für jede Aufgabe:**

- **Rot zuerst, ohne Ausnahme.** Test schreiben, laufen lassen, Fehlschlag aus dem erwarteten Grund beobachten, erst dann umsetzen. Das fehlschlagende Kommando und eine fehlschlagende Zusicherung stehen in der Commit-Nachricht. Mutationsprüfung nur für Abnahmetests (T011 axe, Zeitbudgets), wie in Phase 3 vereinbart.
- **Clean Room (Art. V, FR-03):** nichts von Adobe Spectrum öffnen, laden oder installieren. `research/benchmark-spectrum.md` darf gelesen werden. komuna 2 entsteht aus den Zielen in plan.md D-02, nie aus einem Vorbild.
- **Fertig heißt:** `pnpm check` grün, Änderung in `tasks.md` abgehakt, Abweichungen als Done-Notiz festgehalten.
- `[P]` = kann parallel zur vorigen Aufgabe laufen (andere Dateien, keine Abhängigkeit).

## Etappe 0 – Verfassung

- [ ] **T001 Constitution v1.7, Art. V Benchmark-Aspekto** (FR-19, AK-08, D-11)
  - Rot: `packages/modelo/src/docs/docs.test.ts` erwartet Version `1.7`, den Absatz „Benchmark-Aspekto" im Wortlaut aus FR-19 unter Artikel V, den Historieneintrag `v1.7 (Spec 004) …` und den unveränderten Satz „Quellmaterial anderer Systeme wird dem Coding-Tool nicht vorgelegt".
  - Grün: `.specify/memory/constitution.md` auf v1.7.
  - Fertig wenn: Dokumenttest grün; kein Jugxo nötig (Erweiterung, kein Bruch) – die Begründung steht in plan.md D-11.

## Etappe 1 – Metriken

- [ ] **T002 Metriken-Modul** (FR-02, D-12, data-model §3)
  - Rot: `packages/modelo/src/metrikoj/*.test.ts` je Metrik mit erfundenen Daten und Grenzfällen: Gleichstand (Abstand 0), Ausreißer in der Rampe, Alpha-Rampe, Ankerstufen, Wert außerhalb des sRGB-Gamuts, nicht monotone Größenskala, Zeilenhöhe die mit der Größe steigt. Jeder Test nennt die erwartete Zahl, nicht nur „fehlgeschlagen".
  - Grün: acht reine Funktionen mit den IDs aus data-model §3, exportiert über `@fundamento/modelo`.
  - Fertig wenn: keine zweite Farbmathematik (nur `oklchLightness` und die Kontrastfunktionen von Spec 002 werden genutzt); die Metriken liefern Zahlen, kein Urteil.

## Etappe 2 – Ziele werden Reguloj

- [ ] **T003 Die drei Reguloj, die heute anschlagen** (FR-01, FR-02, AK-01, D-02 G1–G3, D-03)
  - Rot: `contrast-reserve`, `surface-distinct` und `surface-not-extreme` in `data/reguloj.json` mit Kialo und Sojlo; `pnpm -s fm modelo validate` über das **eigene** Modelo schlägt fehl, mit genau den Befunden aus research §2: `status-success-on-basic` (+3,6 %), `text-muted-on-background-sunken` (+4,2 %), `status-info-on-basic` (+7,3 %), zwei Flächenpaare mit Abstand 0 (hell `default`/`raised`, dunkel `sunken`/`canvas`) und vier Flächen auf einem Anker. Entsprechende Befunde für `ekzemplo` über die Fixture-Konfiguration (dort stehen die Flächen 0,003 vom Anker entfernt, die engsten Paare bei +4,1 % und +4,4 %).
  - Grün: Durchsetzer in `validate/color-reguloj.ts` (je Kombination), Meldungen mit gemessenem und gefordertem Wert (contracts/checks.md §3).
  - Fertig wenn: die Verstöße gezählt und in der Done-Notiz festgehalten sind; die Werte ändert erst T005.
- [ ] **T004 [P] Die fünf Reguloj, die heute halten** (FR-01, FR-02, D-02 G4–G8)
  - Rot: `palette-even`, `palette-aligned`, `srgb-gamut`, `type-scale`, `type-rhythm` mit Kialo und Sojlo; da das Repo sie heute erfüllt, kommt der rote Lauf aus Fixtures: je eine ungültige Modelo-Fixture pro Regulo (Rampe mit Ausreißer, Rampe gegen die anderen verschoben, Farbe außerhalb des Gamuts, Skala mit Sprung 1,6, Zeilenhöhe die mit der Größe steigt) mit `expected-issues.json`.
  - Grün: Durchsetzer; Ausnahmen mit Kialo in der Regulo selbst (Alpha-Rampen, Ankerstufen – data-model §2).
  - Fertig wenn: die Fixtures rot waren, das Repo grün ist und `check:regularo` die neuen Reguloj mit Kialo führt.
- [ ] **T005 komuna 2 und ekzemplo** (FR-01, FR-04, AK-01, D-04, D-05)
  - Rot: der Lauf aus T003 (das eigene Modelo verstößt). Zusätzlich ein Test, der die Zielwerte festschreibt: kleinste Reserve ≥ 10 % für komuna (Entwurfsziel), ≥ 5 % für jede Aspekto; kein Flächenpaar unter 0,02; keine Fläche näher als 0,02 an einem Anker.
  - Grün: ankernahe neutrale Stufen, Flächenrollen neu gezeigt, eigener Dunkelmodus in `aspekto/komuna+color-scheme/dark`, drei enge Paare auf Reserve; `ekzemplo` zieht nach.
  - Fertig wenn: `pnpm check` grün; die Commit-Nachricht nennt je Wertänderung die Regulo, die sie erzwingt; die neuen Zahlen stehen als „nachher" in research §2 (Tabelle vorher/nachher).

## Etappe 3 – Vitrino

- [ ] **T006 Celo-Gerüst mit zweiter Phase** (FR-05, FR-09, D-06, contracts/vitrino §1)
  - Rot: `projekcioj/src/celoj/vitrino/vitrino.test.ts`: `vitrino/index.html` existiert nach dem Build, enthält kein `http://`, kein `https://`, kein `src=`/`href=` auf eine Datei, steht mit SHA-256 im Manifest und ist in zwei Builds byte-gleich; `build.test.ts`: `after` läuft nach dem Bündeln der Make Kits.
  - Grün: `Celo.after`, Aufruf in `buildProjekcioj`, `vitrinoHtml({ css, elementJs, datumoj })` als reine Funktion, die die beiden Artefakte eingebettet bekommt.
  - Fertig wenn: die reine Funktion ohne Dateizugriff testbar ist; `after` liest nur `css/fundamento.css` und `make-kit/<referenz>/dist/element.js`.
- [ ] **T007 Paletten, Flächen, Text, Status, Aktionen** (FR-06, D-07, data-model §4)
  - Rot: Tests über das erzeugte HTML: je Rampe eine Tabelle mit einer Zeile je Stufe (Tokenname, Hex, OKLCH-L) und eine SVG-Kurve; die vier Flächenrollen mit Abstand zur Nachbarin; `default`/`subtle`/`muted` auf jeder Fläche; vier Status mit Fläche, Text, Rand; drei Varianten × zwei Tonarten × sechs Zustände. Ein Negativtest: kein Hex- und kein `oklch(`-Literal in der Vorlage (nur in den eingebetteten Projektionen).
  - Grün: Abschnitte und JSON-Insel `paletroj` und `roloj`.
- [ ] **T008 `butono` als echtes Element** (FR-06, D-06)
  - Rot: Test über das HTML: `fm-butono` kommt in allen Varianten × Tonarten × Größen × Zuständen vor; das eingebettete Skript enthält die Registrierung; kein React im Dokument.
  - Grün: Einbettung des Make-Kit-Element-Bundles, Abschnitt `butono`.
- [ ] **T009 Kontrastmatrix und Regularo-Ergebnis** (FR-06, D-07)
  - Rot: Test: je KontrastParo der aktuellen Kombination eine Zeile mit WCAG-Wert, Schwelle, Reserve, APCA-Wert und Ergebnis; jede Regulo mit Kialo und Ergebnis; die Zahlen stimmen mit `evaluateAlirebleco` und `validate` überein (aus derselben Rechnung, nicht nachgebaut).
  - Grün: JSON-Insel `mezuroj` und `regularo`, Abschnitte dazu.
  - Fertig wenn: die Insel kanonisch sortiert ist und die Datei unter 3 MB bleibt (Messwert in der Done-Notiz).
- [ ] **T010 Umschalten und Gegenüberstellung** (FR-07, FR-08, D-08, contracts/vitrino §3–§4)
  - Rot: Playwright in `eroj`: jede der sechs Dimensioj schaltet ohne Neuladen (berechnete Farbe **und** angezeigte Zahl ändern sich), das URL-Fragment stellt den Zustand wieder her, der Vergleichsschalter zeigt zwei Spalten mit beiden Werten und der Kennzeichnung als Wort.
  - Grün: Inline-Skript (kein Framework), Vergleichsansicht, Kriterienliste aus contracts/vitrino §4.
- [ ] **T011 `check:vitrino` und CI-Schritt** (FR-09, AK-02, D-09)
  - Rot: `workflow.test.ts` und `docs.test.ts` erwarten den Schritt „Check: Vitrino", das Skript `check:vitrino` und den README-Eintrag, bevor es sie gibt; `vitrino.check.ts` erwartet axe ohne Befund in hell und dunkel, beide Kontraststufen.
  - Grün: eigene Playwright-Konfiguration, Skript, CI-Schritt, README-Zeile.
  - Fertig wenn: der Lauf außerhalb des Test-Gates steht (Erfahrung aus Phase 3) und in der CI unter zwei Minuten bleibt; Mutationsprüfung für axe (ein absichtlich entfernter Tabellenkopf lässt die Prüfung fehlschlagen).

## Etappe 4 – Clean Room

- [ ] **T012 Fingerprintquellen mit Herkunft** (FR-15 vorbereitend, AK-06 Teil, D-10, contracts/checks §1)
  - Rot: Fixture mit einer zweiten Fingerprintliste `{ "source": "testmarko", "fingerprints": [...] }` und einem eingepflanzten Wert im Prüfbaum: erwartet wird genau ein Fund mit der Herkunft `testmarko`; ohne die Liste kein Fund; eine genannte, fehlende Datei ergibt `file-missing`.
  - Grün: `--spuroj` (mehrfach), `markoSpuroj` in `fundamento.config.json`, Herkunft in der Meldung, `fingerprintSources` und `fingerprints` in den Stats.
  - Fertig wenn: die eingebaute Liste unverändert weiterläuft (alte Form ohne `source`) und Etappe B nur noch ihre Datei liefern muss.

## Etappe 5 – Dokumentation

- [ ] **T013 README, Vojmapo, Quickstart, Nachverfolgbarkeit** (Art. XIII, AK-02)
  - Rot: `docs.test.ts`: README nennt die Vitrino mit Pfad, `pnpm check:vitrino`, die acht neuen Reguloj und den Gegenüberstellungs-Schalter; `docs/vojmapo.md` Zeile 3b trägt Etappe A als umgesetzt mit offener Abnahme; `plan.md` verweist auf die Aufgaben-IDs.
  - Grün: die Dokumente; `quickstart.md` bleibt der Text, der die Befehle zeigt.

## Manuelle Abnahme (Maintainer, nach dem PR)

- **M1 – komuna 2 und die Vitrino:** Vitrino öffnen, alle sechs Dimensioj durchschalten, komuna 2 visuell beurteilen, dann die Gegenüberstellung komuna ↔ ekzemplo. Jeder Befund ohne Prüfung wird Regulo-Kandidat mit Kialo (Art. VI). Ergebnis in `plan.md` → „Ergebnisse der manuellen Abnahme".

## Nach dem Merge (außerhalb des Repos)

- [ ] **T014 ciferecigo gegen die neuen Reguloj** (FR-04, D-05)
  - Rot: `pnpm fm modelo validate --aspekto ../fundamento-aspekto-ciferecigo` gegen den gemergten Kern schlägt mit den neuen Reguloj fehl (erwartet: Flächenabstand, Ankerabstand, Reserve).
  - Grün: Ableitung im privaten Paket nachziehen, wie Spec 003 T028; Archiv an den Maintainer, Notiz in research §2.
  - Fertig wenn: `validate` 0 liefert und `check:alirebleco` für die Komposition besteht. ciferecigo kommt in keine Registry, kein Figma, kein Make.

## Nachverfolgbarkeit

| Anforderung | Aufgaben |
|---|---|
| FR-01 | T003, T004, T005 |
| FR-02 | T002, T003, T004 |
| FR-03 | gilt für alle Aufgaben (Kopf dieser Datei) |
| FR-04 | T005, T014 |
| FR-05 | T006, T007 |
| FR-06 | T007, T008, T009 |
| FR-07 | T010 |
| FR-08 | T010 |
| FR-09 | T006, T011 |
| FR-15 (vorbereitend) | T012 |
| FR-19 | T001 |
| AK-01 | T003, T004, T005 |
| AK-02 | T006 – T011 |
| AK-06 (Teil) | T012 |
| AK-08 | T001 |
| AK-09 (Teil) | M1 |
| FR-10 – FR-14, FR-16 – FR-18 | **Etappe B**, nicht hier |

Konsistenzprüfung vor der Umsetzung (`/speckit.analyze`-Umfang): jede Anforderung der Etappe A hat mindestens eine Aufgabe; jede Aufgabe hängt an einer Entwurfsentscheidung; keine neuen Pakete (Art. XI); keine Aufgabe senkt eine Schwelle; nichts wird veröffentlicht; `pnpm-lock.yaml` ändert sich nicht.
