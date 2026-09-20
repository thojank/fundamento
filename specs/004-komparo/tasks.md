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

**Zwischenberichte an den Maintainer** (Review 2026-09-20):

1. **Nach T006 – komuna 2 grün**, mit den Zahlen vorher/nachher (Reserve, Flächenabstände, Abdeckung im Dunkelmodus). Der Maintainer hat „nach T005" geschrieben und komuna 2 gemeint; in dieser Liste ist komuna 2 die Aufgabe **T006**, weil T005 die Aspiro-Ebene einführt.
2. **Nach T011 – Vitrino fertig**, mit Screenshots in hell, dunkel und hohem Kontrast.

## Etappe 0 – Verfassung

- [ ] **T001 Constitution v1.7: Art. V Benchmark-Aspekto und der Begriff Aspiro** (FR-19, AK-08, D-11, D-14)
  - Rot: `packages/modelo/src/docs/docs.test.ts` erwartet Version `1.7`, den Absatz „Benchmark-Aspekto" im Wortlaut aus FR-19 unter Artikel V, eine Zeile **Aspiro** in der Terminologie-Tabelle, den Historieneintrag `v1.7 (Spec 004) …` und den unveränderten Satz „Quellmaterial anderer Systeme wird dem Coding-Tool nicht vorgelegt". Der Ontologio-Drift-Test schlägt an, solange die Tabellenzeile ohne Ontologio-Begriff dasteht (`table-term-missing`) – er wird in T005 grün.
  - Grün: `.specify/memory/constitution.md` auf v1.7, mit der Terminologie-Zeile „**Aspiro** | Ein messbares Entwurfsziel einer einzelnen Marke, mit Kialo; gilt nur für sie | `aspekto.json#/aspiroj`".
  - Fertig wenn: Dokumenttest grün; kein Jugxo nötig (Erweiterung, kein Bruch), Begründung in plan.md D-11. Der Grundsatz „Fluida Marko" kommt **nicht** in v1.7.
  - Done-Notiz: Der Ontologio-Begriff `Aspiro` ist hier entstanden statt in T005. Grund: Der Drift-Test prüft Tabelle und Ontologio in beide Richtungen; eine Tabellenzeile ohne Begriff hätte den Baum über mehrere Commits rot gelassen. T005 ergänzt nur noch `FluidaMarko` und das Schema `principoj`. Rot gelaufen sind vier Zusicherungen (Version 1.7, Art.-V-Absatz, Tabellenzeile, Historieneintrag) sowie der Drift-Test `table-term-missing`; die Zahl der Terminologie-Begriffe steigt von 17 auf 18.

## Etappe 1 – Metriken

- [ ] **T002 Metriken-Modul** (FR-02, D-12, data-model §3)
  - Rot: `packages/modelo/src/metrikoj/*.test.ts` je Metrik mit erfundenen Daten und Grenzfällen: Abstand 0, Ausreißer in der Rampe, Alpha-Rampe, Ankerstufen, Wert außerhalb des sRGB-Gamuts, Skala mit Sprung, Zeilenhöhe die mit der Größe steigt, Marke ohne eigene Werte in einer Dimensio. Jeder Test nennt die erwartete Zahl.
  - Grün: zehn reine Funktionen mit den IDs aus data-model §3 (`wcag2-reserve`, `oklch-l-delta`, `oklch-l-extreme`, `oklch-l-step`, `oklch-l-align`, `srgb-gamut`, `type-scale-ratio`, `type-scale-consistency`, `type-rhythm`, `dimensio-kovrado`), exportiert über `@fundamento/modelo`.
  - Fertig wenn: keine zweite Farbmathematik (nur `oklchLightness` und die Kontrastfunktionen aus Spec 002); die Metriken liefern Zahlen, kein Urteil.
  - Done-Notiz: Neun Metriken hatten ihren roten Lauf über `metrikoj.test.ts` (Modul fehlte). `dimensio-kovrado` entstand vor seinem Test; `kovrado.test.ts` ist für diese eine Metrik bestätigend, nicht treibend – dafür hat er eine echte Korrektur gebracht: Der Dunkelmodus setzt in den vier Rollengruppen **56** verschiedene Tokens um, nicht 57; die frühere Zahl zählte ein Token doppelt, weil es in `color-scheme/dark` **und** in `color-scheme/dark+contrast/high` steht. Zweiter Befund: Token-Muster brauchen `**` (ein `*` steht für genau ein Segment), sonst trifft `color.action.*` keinen einzigen Aktionstoken. Plan, Research, Datenmodell und Aufgaben sind auf 56 und `**` korrigiert.

## Etappe 2 – Reguloj (für jede Marke)

- [ ] **T003 Die zwei Reguloj, die heute anschlagen** (FR-01, FR-02, AK-01, D-02 G1/G2, D-03)
  - Rot: `contrast-reserve` und `surface-distinct` in `data/reguloj.json` mit Kialo und Sojlo; `pnpm -s fm modelo validate` über das **eigene** Modelo schlägt fehl, mit genau den Befunden aus research §2: `status-success-on-basic` (+3,6 %), `text-muted-on-background-sunken` (+4,2 %), `status-info-on-basic` (+7,3 %) und zwei Flächenpaare mit Abstand 0 (hell `default`/`raised`, dunkel `sunken`/`canvas`). Entsprechende Befunde für `ekzemplo` über die Fixture-Konfiguration (engste Paare +4,1 % und +4,4 %).
  - Grün: Durchsetzer in `validate/color-reguloj.ts` (je Kombination), Meldungen mit gemessenem und gefordertem Wert (contracts/checks §3).
  - Fertig wenn: die Zahl der Verstöße je Aspekto in der Done-Notiz steht; Werte ändert erst T006.
  - Done-Notiz: Roter Lauf über das eigene Modelo: **vier** Verstöße (je zwei), nicht fünf – `status-info-on-basic` liegt mit +7,3 % über der Regulo-Schranke von 5 % und ist damit allein eine Sache von komunas Aspiro (10 %). `contrast-reserve` misst den Zweig, der das Paar trägt, und schweigt bei negativer Reserve: eine verfehlte Schwelle ist der Befund der Alirebleco-Prüfung, nicht dieser Regulo. Zwei Nebenarbeiten waren nötig: das Schema von `sojlo` kannte nur die Metrik `oklch-l-delta` und kein `max` (jetzt alle Metrik-IDs aus T002, `min` **oder** `max`), und die Fixture `regularo-kombinoj` verstieß selbst gegen `surface-distinct` (hell und dunkel je ein Paar ohne Abstand) – ihre Flächen liegen jetzt auf eigenen Stufen. Bis T006 bleiben zwei Tests in `package-regularo.test.ts` rot, weil der komponierte Kern die Verstöße trägt; das ist die geplante rote Strecke.
- [ ] **T004 [P] Die fünf Reguloj, die heute halten** (FR-01, FR-02, D-02 G4–G8)
  - Rot: `palette-even` (als **Regelmäßigkeit** der **inneren** Schritte, `oklch-l-step-consistency` ≤ 50 %, plus strenge Monotonie über alle Schritte; Ankerstufen und die beiden Randschritte ausgenommen, mit Kialo), `palette-aligned`, `srgb-gamut`, `type-scale` (als **Regelmäßigkeit**, `type-scale-consistency` ≤ 10 %) und `type-rhythm`; da das Repo sie erfüllt, kommt der rote Lauf aus Fixtures: je eine ungültige Modelo-Fixture pro Regulo (Rampe mit einem Sprung mitten drin, Rampe gegen die anderen verschoben, Farbe außerhalb des Gamuts, Skala mit einem Verhältnis 1,6 neben lauter 1,2, Zeilenhöhe die mit der Größe steigt) mit `expected-issues.json`.
  - Grün: Durchsetzer; Ausnahmen mit Kialo in der Regulo selbst (Alpha-Rampen, Ankerstufen – data-model §2).
  - Nachtrag (Maintainer-Abnahme des T006-Berichts): Beide Messentscheidungen stehen jetzt im Kialo ihrer Regulo **und** als Jugxo: `jug_01M2ZNS5HAR6JG9K9KA06M4KA2` (palette-even misst die Rate je 100 Stufeneinheiten) und `jug_01M2ZNS5HBWQ9X3WE3BBBTN5N7` (type-rhythm vergleicht nur innerhalb einer Rollenfamilie).
  - Done-Notiz: Statt fünf festgeschriebener Fixture-Verzeichnisse laufen die roten Läufe über **mutierte** Fixtures (`mutatedFixture`, wie schon in `color-reguloj.test.ts`) – dieselbe Abdeckung, kein doppelter Datenbestand. Drei Befunde aus der Umsetzung: (1) `palette-even` misst die **Rate je 100 Stufeneinheiten**, nicht den rohen Abstand, sonst gilt eine Rampe mit Lücken in der Nummerierung (50, 100, 200, 300, 600) als unregelmäßig, obwohl sie gleichmäßig fortschreitet. (2) `type-rhythm` vergleicht nur **innerhalb einer Rollenfamilie** (display, headline, body, label): ein Label bei 14 px ist absichtlich enger gesetzt als Fließtext bei 16 px, und ein Vergleich über Familien hinweg misst Geschmack statt Rhythmus – ohne diese Einschränkung meldete das Repo vier Scheinbefunde. (3) Die Fixture `regularo-kombinoj` verstieß gegen `palette-even` und `palette-aligned`; ihre beiden Rampen liegen jetzt auf einer gemeinsamen, gleichmäßigen Helligkeitskurve (erzeugt über OKLCH), was zwei Erwartungen in bestehenden Tests mitzieht (ein Hex-Wert, ein Grauwert).
  - Fertig wenn: die Fixtures rot waren, das Repo grün ist (komunas innere Schritte liegen bei 31,3 % von 50 %) und `check:regularo` die neuen Reguloj mit Kialo führt. **Drei Positivtests halten Fluida Marko fest:** eine Palette mit gleichmäßigen, aber kleinen Schritten (ΔL 0,025 überall) besteht `palette-even`; ein feinerer Randschritt (0,03 neben Median 0,08) besteht ebenfalls; eine Größenskala mit konstantem Verhältnis 1,5 besteht `type-scale`. **Ein Negativtest dagegen:** ein innerer Schritt mit dem doppelten Median schlägt an.

## Etappe 3 – Aspiroj (je Marke)

- [ ] **T005 Aspiroj: Begriff, Schema, Prüfung, getrennte Ausgabe** (FR-01, FR-02, D-03, D-14, data-model §2b)
  - Rot: (1) Ontologio-Tests erwarten den Begriff **`Aspiro`** unter `inScheme: terminologio` (Drift gegen die Tabellenzeile aus T001, beide Richtungen) **und** den Grundsatz **`FluidaMarko`** im neuen Schema `principoj` mit der Definition des Maintainers und Verweisen auf `docs/vojmapo.md` und `docs/vizio.md`; das Ontologio-Schema kennt `principoj` noch nicht, der Test läuft deshalb erst rot; (2) Schema-Test erwartet `aspekto.json#/aspiroj` mit Pflichtfeldern `metriko` und `kialo` und mindestens einer Schranke – eine Aspiro ohne Kialo ist ungültig; (3) `validate`-Test über eine Fixture-Marke mit einer verfehlten Aspiro erwartet genau ein `aspiro-missed` mit Marke, Metrik, Ist, Soll und Kialo, Zusammenfassung getrennt gezählt; (4) **Negativtest Fluida Marko:** eine Fixture-Marke mit reinem Weiß als Fläche und konstantem Verhältnis 1,5 besteht jede Regulo und bekommt kein `aspiro-missed`.
  - Grün: Modelo-Schema (`AspektoAspiro`), `validate/aspiroj.ts`, Regel-ID `aspiro-missed` im Katalog, Stats `reguloViolations` und `aspiroMisses`, Ontologio-Schema um `principoj` erweitert, beide Ontologio-Einträge.
  - Fertig wenn: eine Marke ohne `aspiroj` vollständig gültig ist; die Meldung nie das Wort „Regel" für ein Ziel benutzt; der Ontologio-Drift-Test (Spec 002) grün ist, auch die Prüfung „je Entitätsart genau eine Notation".
- [ ] **T006 komuna 2: eigene Ziele und die Werte dazu** (FR-01, FR-04, AK-01, D-02 G1b/G3/G7b/G9, D-04, D-05)
  - Rot: komunas fünf Aspiroj in `packages/aspekto-komuna/aspekto.json` (Reserve ≥ 10 %, Abstand zum Anker ≥ 0,02 für Flächen, Verhältnisband 1,10 – 1,30 der Typo-Skala, Schrittweite 0,04 – 0,20 der Paletten, Abdeckung `color-scheme=dark` = 100 % über `background`, `text`, `action`, `status`); `validate` meldet die verfehlten Entwurfsziele (heute: Reserve, Anker, Abdeckung), dazu die Regulo-Verstöße aus T003.
  - Grün, in dieser Reihenfolge: (1) ankernahe neutrale Stufen, (2) Flächenrollen neu gezeigt (hell `raised` über `default`, dunkel `sunken` unter `canvas`), (3) **56 eigene Dunkelwerte** in `aspekto/komuna+color-scheme/dark`, (4) drei enge KontrastParoj auf Reserve. `ekzemplo` zieht **nur** dort nach, wo eine Regulo es verlangt.
  - Fertig wenn: `pnpm check` grün; jede Wertänderung nennt in der Commit-Nachricht die Regulo oder Aspiro, die sie erzwingt; research §3b hält die Zahlen vorher/nachher fest; die Abdeckung von komuna in `color-scheme=dark` steht bei 100 % der vier Rollengruppen, die von ekzemplo unverändert bei einem Token, weil ekzemplo seine Dunkelwerte weiter aus dem generischen Satz `color-scheme/dark` bezieht (und das ist in Ordnung – Fluida Marko).
  - Done-Notiz: Die Werte sind in einer Schleife entstanden – ändern, `fm modelo validate`, den nächsten Befund lesen –, und jede Änderung hängt an einer Regel: vier neue neutrale Stufen (25, 150, 850, 975) tragen die Flächen, die vorher auf Weiß und Schwarz lagen; alle Rampen liegen auf einer gemeinsamen Helligkeitskurve; Text-Rollen, Rand, Status-Füllungen im hohen Kontrast und die Aktionszustände im Dunkeln sind je einen Schritt verschoben. Drei Änderungen betreffen den **generischen** Teil und helfen jeder Marke: die Flächen im Dunkeln bekommen eigene Stufen, der Rand im Dunkeln wird heller, `contrast=high` senkt die Status-Füllungen. ekzemplo zieht nur dort nach, wo eine Regulo es verlangt. Zwei Nebenarbeiten: die Fixture `invalid/aspekto-incomplete` wurde mit der neuen Marke abgeglichen, damit sie wieder **nur** an ihren vier absichtlichen Lücken scheitert, und `src/perf.test.ts` läuft nicht mehr im parallelen Test-Gate (dort misst es die Maschine, nicht den Generator). **Befund für die nächste Runde:** die beratenden APCA-Hinweise steigen von 1 296 auf 1 746, weil hellere Flächen im hellen Modus dem WCAG-Verhältnis nützen und der APCA-Helligkeitsdifferenz schaden (research §3b).

## Etappe 4 – Vitrino

- [x] **T007 Celo-Gerüst mit zweiter Phase** (FR-05, FR-09, D-06, contracts/vitrino §1)
  - Rot: `projekcioj/src/celoj/vitrino/vitrino.test.ts`: `vitrino/index.html` existiert nach dem Build, enthält kein `http://`, kein `https://`, kein `src=`/`href=` auf eine Datei, steht mit SHA-256 im Manifest und ist in zwei Builds byte-gleich; `build.test.ts`: `after` läuft nach dem Bündeln der Make Kits.
  - Grün: `Celo.after`, Aufruf in `buildProjekcioj`, `vitrinoHtml({ css, elementJs, datumoj })` als reine Funktion.
- [x] **T008 Paletten, Flächen, Text, Status, Aktionen** (FR-06, D-07, data-model §4)
  - Rot: Tests über das erzeugte HTML: je Rampe eine Tabelle mit einer Zeile je Stufe (Tokenname, Hex, OKLCH-L) und eine SVG-Kurve; die vier Flächenrollen mit Abstand zur Nachbarin; `default`/`subtle`/`muted` auf jeder Fläche; vier Status mit Fläche, Text, Rand; drei Varianten × zwei Tonarten × sechs Zustände. Negativtest: kein Hex- und kein `oklch(`-Literal in der Vorlage.
  - Grün: Abschnitte und JSON-Insel `paletroj` und `roloj`.
- [x] **T009 `butono` als echtes Element** (FR-06, D-06)
  - Rot: Test über das HTML: `fm-butono` in allen Varianten × Tonarten × Größen × Zuständen; das eingebettete Skript enthält die Registrierung; kein React im Dokument.
  - Grün: Einbettung des Make-Kit-Element-Bundles, Abschnitt `butono`.
- [x] **T010 Kontrastmatrix, Regularo, Ziele und Abdeckung** (FR-06, D-07, G10)
  - Rot: Test: je KontrastParo der aktuellen Kombination eine Zeile mit WCAG-Wert **und APCA-Wert nebeneinander**, Schwelle, Reserve, Ergebnis und – wenn ein Vergleichsstand vorliegt – der **Veränderung gegenüber `main`** (Maintainer-Auflage 2026-09-20: der Anstieg der APCA-Hinweise von 1 296 auf 1 746 muss sichtbar sein; die Entscheidung über eine Aspiro „APCA nicht schlechter als Stand X" fällt bei M1); jede Regulo mit Kialo und Ergebnis; jede Aspiro der gezeigten Marke mit Soll, Ist und Kialo, als **Entwurfsziel** bezeichnet; je Dimensio-Wert die Abdeckung `dimensio-kovrado`. Die Zahlen stimmen mit `evaluateAlirebleco`, `validate` und den Metriken überein (dieselbe Rechnung, nicht nachgebaut).
  - Grün: JSON-Insel `mezuroj`, `regularo`, `aspiroj`, `kovrado` und die Abschnitte dazu.
  - Fertig wenn: die Insel kanonisch sortiert ist und die Datei unter 3 MB bleibt (Messwert in der Done-Notiz).
  - Done-Notiz: **Abweichung von rot-zuerst.** Die Inhaltstests zu T008 – T010 sind nach dem erzeugenden Code entstanden; der rote Lauf fehlt für sie. Zwei Nachträge haben dafür einen eigenen roten Lauf bekommen, beide aus dem Bild heraus gefunden: (1) Der Kopf der Kontrastmatrix verglich 144 Kombinationen dieses Standes gegen einen Vergleichsstand mit 72 und meldete „+2 232" – eine Zahl, die nur die zweite Marke ist. Gezählt wird jetzt dort, wo beide Stände dieselbe Kombination haben; der Satz lautet „APCA-Hinweise: 3 528 in 144 Kombinationen. In den 72 Kombinationen des Vergleichsstands: 1 746 gegen 1 296 (Veränderung +450)" und nennt, wenn der Vergleichsstand Kombinationen hat, die es hier nicht gibt, auch diese Zahl (`bazo.test.ts`, „counts the change only where both states have the combination"). (2) Die Seite zeigte zwei Abdeckungszahlen für den Dunkelmodus (Gegenüberstellung 75,0 %, Entwurfsziel erreicht) ohne sichtbaren Grund. Die Ziel-Tabelle hat jetzt eine Spalte **Geltungsbereich** (die Tokenmuster der Aspiro oder „alle Tokens"), und die Zeile der Gegenüberstellung heißt „eigene Werte im Dunkelmodus (alle Tokens)" (`datumoj.test.ts`, „names the token scope of every design goal"). Größe der Datei: **3,04 MB** für die Komposition komuna + ekzemplo (144 Kombinationen); die Schranke von 3 MB galt für die 72 Kombinationen des Kern-Modelo und ist dort mit 1,48 MB eingehalten.
- [x] **T011 Umschalten und Gegenüberstellung** (FR-07, FR-08, D-08, contracts/vitrino §3–§4)
  - Rot: Playwright in `eroj`: jede der sechs Dimensioj schaltet ohne Neuladen (berechnete Farbe **und** angezeigte Zahl ändern sich), das URL-Fragment stellt den Zustand wieder her, der Vergleichsschalter zeigt zwei Spalten mit beiden Werten und der Kennzeichnung als Wort; Aspiroj erscheinen **nicht** im Vergleich.
  - Grün: Inline-Skript (kein Framework), Vergleichsansicht, Kriterienliste aus contracts/vitrino §4.
  - Done-Notiz: Die Umschaltprüfung hängt an **je einem Zeugen pro Dimensio**, weil nicht jede Dimensio die Kontrastzahlen bewegt: `color-scheme`, `contrast` und `aspekto` ändern die Zeile eines Paares, `viewport` eine Schriftgröße, `density` einen Abstand, `motion` eine Dauer. Der erste Entwurf prüfte für alle sechs das WCAG-Verhältnis des ersten Paares und schlug zu Recht fehl: in komuna hat `text-on-background` in hell und dunkel dasselbe Verhältnis (12,61), nur APCA unterscheidet sich (91,5 → 93,4). Die Zeile trägt beide Zahlen, also prüft der Test die Zeile. Beim Erzeugen der Bildschirmfotos fiel auf, dass ein später gesetztes Fragment nichts bewirkte (es wurde nur beim Laden gelesen); dafür gibt es jetzt einen `hashchange`-Zweig und einen eigenen roten Lauf („a fragment that arrives later is applied too").
- [x] **T012 `check:vitrino` und CI-Schritt** (FR-09, AK-02, D-09)
  - Rot: `workflow.test.ts` und `docs.test.ts` erwarten den Schritt „Check: Vitrino", das Skript `check:vitrino` und den README-Eintrag, bevor es sie gibt; `vitrino.check.ts` erwartet axe ohne Befund in hell und dunkel, beide Kontraststufen.
  - Grün: eigene Playwright-Konfiguration, Skript, CI-Schritt, README-Zeile.
  - Fertig wenn: der Lauf außerhalb des Test-Gates steht und in der CI unter zwei Minuten bleibt; Mutationsprüfung für axe (ein entfernter Tabellenkopf lässt die Prüfung fehlschlagen).
  - Done-Notiz: Roter Lauf zuerst (sechs Fehlschläge, darunter `docs.test.ts`: `expect(ci).toContain("Check: Vitrino")`), dann Skript, CI-Schritt und README-Zeile. Der Lauf braucht lokal **15,6 s** für zwölf Prüfungen. **Befund der Mutationsprüfung:** Die verlangte Mutation – jeder Spaltenkopf ohne Text – ließ alle vier axe-Läufe grün; axe-core hat keine Regel für eine leere Kopfzelle. Die Prüfung hat darum einen eigenen Strukturtest bekommen („every table names itself and its columns": jede Tabelle mit Beschriftung, jede Kopfzelle mit Text), der die Mutation fängt (eine Meldung je leerer Kopfzelle). Dass axe selbst greift, ist mit einer zweiten Mutation belegt: ohne `lang` am `<html>` meldet axe `html-has-lang` und die Prüfung schlägt fehl. **Last im Test-Gate:** Die neuen Vitrino-Tests bauen das Modelo mehrfach; im ersten vollständigen `pnpm check` liefen zwei MCP-Tests in ihre 30-s-Grenze. `bazo.test.ts` nimmt den Messstand jetzt einmal je Datei statt viermal (ein `beforeAll` statt vier CLI-Läufen); `pnpm test` allein ist grün (12/12 in mcp, 109 in modelo, 15 in projekcioj), und Die CI hat dann gezeigt, dass das nicht reicht: `bazo.test.ts` brauchte auf dem Runner **105,9 s** (vier vollständige Bauten) und ließ `rules-resolve.test.ts` in `mcp` in seine 30-s-Grenze laufen. Der Test steht deshalb jetzt außerhalb des parallelen Gates und läuft als erster Teil von `pnpm check:vitrino` (`pnpm --filter @fundamento/projekcioj run check:bazo`, eigene Vitest-Konfiguration), wie schon `src/perf.test.ts` aus demselben Grund. Der Schritt „Check: Vitrino" dauert damit lokal 24 s für vier plus zwölf Prüfungen. Das allein reichte nicht: im nächsten CI-Lauf lief derselbe MCP-Test wieder in seine Grenze, weil die Etappe A jeden `validate` teurer macht (sieben neue Reguloj über alle Tokens und Kombinationen) und `gvidanto-tools` 63,9 s sowie `eroj-tools` 60,2 s für je sieben Tests brauchten. Die MCP-Tests bekommen darum den in Phase 3 festgehaltenen Faktor 3 unter `CI=true` (Jugxo `jug_01M2W3K1YPP05F4XF86J71RGTK`, 30 s → 90 s); ein einzelnes `fm modelo validate` dauert weiterhin 1,1 s, die Grenze kauft also Zeit für die Last, nicht für die Arbeit. Für eine Budgetänderung gibt es keinen roten Lauf; sie steht hier statt in einem Test.

### Durchsicht T007–T012 (Maintainer, 2026-09-20)

- **Tertiäre Aktion.** Befund bestätigt und behoben: `rest` und `disabled` sind durchsichtig
  (`shade.0`), `hover` und `pressed` sind Auflagen (`shade` 8 % / 12 % hell, neue `tint`-Rampe im
  Dunkeln), `selected` bleibt eine Fläche (`accent.200` hell, `accent.800` dunkel). Dafür bekam die
  KontrastParo das Feld `backdrop`: eine durchsichtige Fläche wird über der genannten Fläche
  zusammengesetzt, statt das Paar abzulehnen — in `validate`, `check:alirebleco`, `check_contrast`,
  der Regulo `contrast-reserve` und den Aspiroj, eine Rechnung für alle. Rote Läufe zuerst
  (`colour.test.ts`: „rest ist in jeder Kombination durchsichtig"; `index.test.ts`: „misst die
  Auflage über der genannten Fläche"). Festgehalten als Jugxo `jug_01M2ZTV1WRHXQ7C31W7FQ4YZP7`,
  im Plan als D-07b. **Reichweite des Ziels:** komunas `oklch-l-extreme` gilt jetzt für jede
  undurchsichtige Fläche (Seiten-, Aktions- und Statusflächen), nicht für Text, Rand oder Ring;
  durchsichtige Werte bleiben außen vor.
- **Gegenüberstellung.** Statt drei jetzt 13 Kriterien, je mit Richtung (D-08c). Zwei Fehler dabei
  gefunden: die Regelmäßigkeit zählte die Auflagen-Rampen mit (100 % statt 25 %) — sie liest jetzt
  über `palettePikoj` dieselben Rampen wie die Regulo `palette-even` —, und der Abstand zum Anker
  zeigte „−0.000".
- **Bildschirmfotos.** Kopf mit Schaltern, Paletten, Kontrastmatrix, Regularo und Abdeckung kommen
  dazu; alle sieben liegen unter `specs/004-komparo/bildoj/`.
- **Erzeugte Dateien.** `.gitattributes` markiert `mezuroj-main.json`, die Bilder und
  `ids.lock.json` als `linguist-generated`; der Befehl für den Vergleichsstand steht als D-08b im
  Plan.
- **Folgearbeiten aus der Änderung:** die Fixture `invalid/aspekto-incomplete` und die Marke
  `ekzemplo` haben die vier neuen Palettenstufen bekommen (sonst wären sie unvollständig); zwei
  Datentests, die Paare selbst nachrechnen (`kontrast.test.ts`, `phase0-data.test.ts`), setzen die
  Auflage jetzt genauso zusammen wie die Prüfungen.

## Etappe 5 – Clean Room

- [ ] **T013 Fingerprintquellen mit Herkunft** (FR-15 vorbereitend, AK-06 Teil, D-10, contracts/checks §1)
  - Rot: Fixture mit einer zweiten Fingerprintliste `{ "source": "testmarko", "fingerprints": [...] }` und einem eingepflanzten Wert im Prüfbaum: erwartet wird genau ein Fund mit der Herkunft `testmarko`; ohne die Liste kein Fund; eine genannte, fehlende Datei ergibt `file-missing`.
  - Grün: `--spuroj` (mehrfach), `markoSpuroj` in `fundamento.config.json`, Herkunft in der Meldung, `fingerprintSources` und `fingerprints` in den Stats.
  - Fertig wenn: die eingebaute Liste unverändert weiterläuft und Etappe B nur noch ihre Datei liefern muss.

## Etappe 6 – Dokumentation

- [ ] **T014 README, Vojmapo, Quickstart, Nachverfolgbarkeit** (Art. XIII, AK-02)
  - Rot: `docs.test.ts`: README nennt die Vitrino mit Pfad, `pnpm check:vitrino`, die sieben neuen Reguloj, den Begriff Aspiro mit einem Satz Erklärung und den Grundsatz Fluida Marko und den Gegenüberstellungs-Schalter; `docs/vojmapo.md` Zeile 3b trägt Etappe A als umgesetzt mit offener Abnahme; `plan.md` verweist auf die Aufgaben-IDs.
  - Grün: die Dokumente.

## Manuelle Abnahme (Maintainer, nach dem PR)

- **M1 – komuna 2 und die Vitrino:** Vitrino öffnen, alle sechs Dimensioj durchschalten, komuna 2 visuell beurteilen, dann die Gegenüberstellung komuna ↔ ekzemplo, dann die Abschnitte „Ziele" und „Eigene Werte je Dimensio". Jeder Befund ohne Prüfung wird Regulo-Kandidat (wenn er Zugänglichkeit oder Struktur betrifft) oder Aspiro-Kandidat (wenn er komunas Geschmack betrifft), jeweils mit Kialo. Ergebnis in `plan.md` → „Ergebnisse der manuellen Abnahme".

## Nach dem Merge (außerhalb des Repos)

- [ ] **T015 ciferecigo: erst die Differenz berichten, dann neu ableiten** (FR-04, D-05; Maintainer-Auflage 2026-09-20)
  - **Zuerst messen, nicht ändern:** den heutigen Stand von ciferecigo gegen den geänderten Kern prüfen und die Differenz berichten, bevor ein Wert angefasst wird. Der Kern hat drei generische Sätze geändert (Flächen im Dunkeln, Rand im Dunkeln, Status-Füllungen im hohen Kontrast) und vier neutrale Stufen ergänzt; ciferecigo erbt davon alles, was es nicht selbst setzt.
  - Bericht (an den Maintainer, vor der Ableitung): welche **KontrastParoj** sich ändern und um wie viel (vorher/nachher, je Kombination), welche **Reguloj** neu anschlagen und welche still werden, welche der vier neuen Stufen fehlen (`aspekto-incomplete`), und ob ciferecigo eigene **Aspiroj** erklären will.
  - Rot: `pnpm fm modelo validate --aspekto ../fundamento-aspekto-ciferecigo` gegen den gemergten Kern schlägt mit den neuen **Reguloj** fehl (erwartet: fehlende Stufen, Flächenabstand, Reserve).
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
