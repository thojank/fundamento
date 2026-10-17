# Nachlese 3 – Plan

**Spec:** [`briefing.md`](briefing.md) (das Briefing vom 2026-10-17 ist die Spec, unverändert kopiert) · **Basis:** `main` @ `27532e8` (Spec 011 komplett, 17 Eroj) · **Regel 0** (12.10.) gilt: Weg des `butono` zuerst, sonst kleinste Änderung mit Eintrag hier; Tokens, Regulo-Semantik und Constitution unverändert; nie eine Grenze schwächen, um grün zu werden. **Aufgaben, Commits und rote Hashes:** [`tasks.md`](tasks.md).

Zwei PRs, gestapelt: ① Gvidanto (G1–G4) von `main`, ② Werkzeuge (W1–W6) von ①.

## ① Gvidanto

**Branch:** `261017-nachlese-3-gvidanto-e137d7` (von `main` @ `27532e8`) · **Datum:** 2026-10-17.

### Zusammenfassung

1. **G1 (O-28):** „Navigation“ führt zur `navigado`. `ligilo.goals.navigate` verliert `navigation` (en/de) und behält `navigate`/`navigieren`, `overview`/`übersicht`; `navigado.goals.navigate-app` bekommt `navigation` (en/de), `menu`/`menü` (`hauptmenü` stand schon). Jugxo `jug_01M54KXNGAVJ490FY86B10XTT6` (OP-12). Zwei Folgen im Datenbestand (D-01).
2. **G2:** Gleichstand zweier Goals → `ask-human` mit allen Kandidaten (D-02); Antworten ohne Gleichstand bitgleich.
3. **G3:** Check `goal-keyword-shared` in `check:regularo` (Warnung, beide Fundstellen, Ausnahme per Jugxo); heute: keine Doppelung in den Goals (D-03).
4. **G4:** die Grenzen im `brief` ohne Kialo; `butono` 748 → 546, `kampo` 743 → 447; nichts zurückgedreht (D-04).

Kein neues Ero, kein Token, keine Regulo-Semantik, Schema der Modelo-Daten unverändert; das MCP-Schema von `get_ero` (Ausgabe des `brief`, Beschreibung des Parameters) ist angepasst.

### Entwurfsentscheidungen

#### D-01 G1: „Navigation“ zur `navigado`, mit zwei Folgen im Datenbestand (Regel 0.2)

`ligilo/skemo.json`: `navigate` → en `["navigate", "overview"]`, de `["navigieren", "übersicht"]`. `navigado/skemo.json`: `navigate-app` → en `["navbar", "sidebar", "nav", "navigation", "menu"]`, de `["hauptnavigation", "hauptmenü", "seitenleiste", "navigationsleiste", "navigation", "menü"]`. „main menu“ ist zwei Wörter: ein Stichwort trifft nur ein Wort (`wordsOf`), `hauptmenü`/`menu` stehen dafür (Abweichung 1). Der Jugxo trägt die Kialo des Briefings und den Kontext (OP-12: eine Antwort, die stand, ändert sich). Zwei Folgen, beide nötig, damit das Modelo gültig bleibt und der Test des Briefings gilt:
- **`tabelo.boundary.row-actions-menu` gibt `menu`/`menü` ab** (behält `dropdown`, `aktionsmenü`, neu `rowmenu`/`zeilenmenü`): `uzo-boundary-covered` lehnt einen `ask-human`-Fall ab, dessen Stichwort ein Goal eines Ero nennt — mit `menü` als Goal-Wort der `navigado` wäre das Modelo ungültig. Entscheidung für den Maintainer (Abweichung 2, O-29).
- **`insigno.instead.sentence` verliert `erklärung`** (behält `satz`, `hinweis`; en unverändert): der Test des Briefings „Link zur Datenschutzerklärung“ → `ligilo` traf über das Suffix (`erklärung`, ≥ 6 Buchstaben, D-06 von Spec 007) auf „Datenschutzerklärung“ und antwortete `avizo`. Ein Suffix-Treffer auf ein Kompositum ist hier ein falscher Freund (Abweichung 3, O-30).
Ohne beides wäre G1 nicht erfüllbar, ohne eine Grenze zu schwächen (Regel 0.4): die Checks bleiben, die Daten geben nach.

#### D-02 G2: Gleichstand zweier Goals → ask-human (bitgleich sonst)

`suggest-ero.ts`: die **Stärke** eines Goal-Treffers ist die Zahl der **verschiedenen** Stichwörter der Goals eines Ero, die der Text trifft (dasselbe Wort in zwei Sprachen zählt einmal: „tabs“ en/de). Die erste Ero in Namensordnung antwortet weiter, wenn ihre Stärke anders ist als die jeder anderen getroffenen Ero — so bleibt jede Antwort, die stand, bitgleich. Trifft eine **weitere** Ero gleich stark, antwortet `suggest_ero` mit `action: ask-human`, `suggestion: null`, `matched: null` und `candidates`: eine getroffene Grenze voran (wie bisher, OP-12), dann die Goal-Kandidaten in Ero-Reihenfolge, je mit `ero`, `goal`, `props`, `keyword`, `kialo` und `regulo`. Ein eigener `instead`-Eintrag, der das Goal der ersten Ero umlenkt (Spec 011 ② D-10), bleibt kein Gleichstand und geht seinen Weg. Das Ausgabeschema brauchte keine Erweiterung: `candidates` mit `kind: goal` und optionaler `kialo` gab es seit OP-12. Folgen: „Tabs, um zwischen Liste und Formular zu wechseln“ → ask-human (`elektilo.choose-many` über „liste“, `langetaro.switch-view` über „tabs“, davor die Grenze `elekto.choose-many` → `elektilo`); „Übersicht speichern“ nennt neben der Grenze des `butono` und seinem Goal `confirm` jetzt auch `ligilo.navigate` (Abweichung 4: der bestehende Test erwartete zwei Kandidaten).

#### D-03 G3: `goal-keyword-shared` im `check:regularo`

`checks/regularo/index.ts` liest die Skemoj der Eroj (wie `eroIdsIn`) und sammelt je `<lingvo>:<stichwort>` (NFC, klein) die Fundstellen (`data/eroj/<ero>/skemo.json#/skemo/goals/<i>/keywords/<lingvo>/<j>`); steht ein Wort in den Goals **zweier Eroj**, ist das eine **Warnung** `goal-keyword-shared` mit allen Fundstellen und dem Hinweis, wer antwortet (die erste Ero in Namensordnung, oder eine Person bei Gleichstand). Ausnahme: ein Jugxo, dessen `context` `goal-keyword-shared <lingvo>:<wort>` nennt. Der Check entfernt nichts. `RULE_IDS` += `goal-keyword-shared` (154). **Bestand heute: keine Doppelung** zwischen Goals (gemessen auf `main` und nach G1). Zur Information, nicht Gegenstand des Checks: Wörter, die ein Goal eines Ero und eine Uzo-Grenze oder -Alternative eines anderen Ero teilen — „tabelle“ (`tabelo` Goal, `atributlisto` instead → `tabelo`, stimmig), „liste“ (`elektilo` Goal, `tabelo` Text-Regel), „übersicht“ (`ligilo` Goal, `butono` Grenze → `ligilo`, stimmig), „pages“ (`tabelo` Grenze, `langetaro` instead → `navigado`); sie gehen den Weg von Spec 008 D-08 (Grenze → use-instead = Goal: das Goal antwortet) oder enden als Konflikt (`ask-human`).

#### D-04 G4: Grenzen im `brief` ohne Kialo

`gvidanto/eroj.ts`: `brief.boundary` = `{ case, action, ero? }`; der Typ `GetEroBrief.boundary` ohne `kialo`; `instead` behält seine Kialo. MCP: `schema/tools/get_ero.output.json` (Zweig des `brief`: `boundary.items` ohne `kialo`, `required: ["case", "action"]`, Beschreibung) und `get_ero.input.json` (`brief` nennt: Grenzen ohne Kialo, `get_ero` ohne `brief` liefert sie). Die in Spec 010/011 gekürzten Kialos bleiben gekürzt (O-12-Muster, nichts zurückgedreht).

**`get_ero … brief:true`, `ceil(Bytes/3)`, vorher → nachher (Grenze 750):**

| Ero | vorher | nachher |
|---|---|---|
| atributlisto | 254 | 202 |
| avizo | 411 | 309 |
| butono | **748** | **546** |
| dialogo | 404 | 286 |
| elektilo | 512 | 351 |
| elekto | 477 | 375 |
| insigno | 497 | 376 |
| kampo | **743** | **447** |
| langetaro | 499 | 271 |
| ligilo | 493 | 275 |
| markobutono | 462 | 307 |
| mezurilo | 318 | 238 |
| navigado | 539 | 342 |
| plenstato | 287 | 237 |
| sxaltilo | 310 | 218 |
| tabelo | 654 | 340 |
| tekstareo | 422 | 224 |

### Abweichungen vom Briefing

1. **„main menu“ ist kein Stichwort** (D-01): zwei Wörter treffen nie; `hauptmenü` und `menu` stehen dafür.
2. **`tabelo.row-actions-menu` ohne `menu`/`menü`** (D-01): Folge des Checks `uzo-boundary-covered`.
3. **`insigno.sentence` ohne `erklärung`** (D-01): Folge des Suffix-Treffers auf „Datenschutzerklärung“.
4. **„Übersicht speichern“ nennt drei Kandidaten** (D-02): die Grenze des `butono`, sein Goal `confirm` und `ligilo.navigate` (Gleichstand); der Test von Spec 008 ist angepasst, die Reihenfolge (Grenze, dann `butono` zuerst) bleibt.
5. **Zusätzlich:** Testphrase „ein Hamburger-Menü für schmale Bildschirme“ (⑤) → „ein Hamburger für schmale Bildschirme“: „Menü“ ist jetzt das eigene Goal-Wort der `navigado` neben ihrer eigenen Grenze `collapsed-mobile` — ein Konflikt, den eine Person entscheidet (Spec 011 ② D-10), kein Fall für die Grenze allein.

### Befunde / Mankoj

- **B-1 Suffix-Treffer auf Komposita** (D-01): `erklärung` traf „Datenschutzerklärung“, `menü` trifft „Hamburger-Menü“ — die Regel ≥ 6 Buchstaben (Spec 007 D-06, N-1) ist für Kopfnomen gedacht („Projektübersicht“), fängt aber jedes Kompositum. Kandidat: Suffix-Treffer nur für Uzo-Stichwörter, die als Kopfnomen gemeint sind (eine Markierung im Datum), oder eine Mindestlänge des Rests.
- **B-2 Goal-Wörter gegen Uzo-Wörter** (D-03): der Check sieht nur Goals; die Überschneidungen zwischen Goal und Grenze/Alternative (oben) bleiben ungeprüft. Kandidat: dieselbe Warnung über alle Stichwort-Listen, mit Ausnahme der Paare, die Spec 008 D-08 stimmig macht (Grenze → use-instead = Goal).
- **Mankoj:** keine.

### Offen (für den Maintainer)

- **O-29** `tabelo.row-actions-menu` ohne `menu`/`menü` (Abweichung 2) — bestätigen; Alternative: `menü` bleibt beim `tabelo`, dann ist es kein Goal-Wort der `navigado` (gegen G1).
- **O-30** `insigno.sentence` ohne `erklärung` (Abweichung 3) — bestätigen; Alternative: der Test „Link zur Datenschutzerklärung“ ändert seine Phrase.
- **O-31** Die Grenze voran unter den Kandidaten eines Gleichstands (D-02) — bestätigen.

### Messungen

In [`tasks.md`](tasks.md) ①.

## ② Werkzeuge

**Branch:** `261017-nachlese-3-werkzeuge-e137d7` (gestapelt auf ① @ `90d31bc`, PR #68) · **Datum:** 2026-10-17.

### Zusammenfassung

1. **W1:** `ci.yml` in drei Jobs nebeneinander — `unit` (Build, Tests ohne die Eroj, Perf, Lint, die sechs Modelo-Checks, Release), `eroj` (Playwright in zwei Shards), `rendered-checks` (Alirebleco der Eroj, Make Kit, Quickstart, Vitrino); kein Timeout erhöht (D-01). Messung vorher/nachher unten.
2. **W2:** `check:alirebleco` misst jede bekannte Aspekto: `komuna` bindend wie bisher, `ekzemplo` als Warnung `contrast-external-aspekto` (D-02). Bestand: ekzemplo 0 fehlgeschlagene Paar-Auswertungen.
3. **W3:** Figma löst `font.family.code` als Liste von Kandidaten auf (D-03), Manko mit Schließbedingung.
4. **W4:** die Vitrino zeigt den `mezurilo` ohne Wert (Zeile „unbekannt“, D-04).
5. **W5:** die Vitrino verdrahtet Reiter-Panel und Sortierung (D-05); die Eroj bleiben (E10).
6. **W6:** Ontologio-Schema `laboro` mit neun Arbeitsbegriffen, `Kampo` mit drei altLabels, `describe_term` findet jeden (D-06).

Kein neues Ero, kein Token, keine Regulo-Semantik. Schema-Erweiterungen additiv: `ontologio.schema.json` (Schema `laboro`), MCP `describe_term.output.json` (dasselbe Enum).

### Entwurfsentscheidungen

#### D-01 W1: drei CI-Jobs statt einer Reihe (Spec 011 ⑤ B-9, O-21)

Der eine Job fuhr alles nacheinander, und `turbo run test` ließ die Playwright-Suite der Eroj neben den spawnenden e2e-Dateien von `modelo` laufen: dort traf der Hook-Timeout (60 s, Run 38966614433), die Wanduhr stand bei 12 bis 19 Minuten. Jetzt: **`unit`** — Install, Build, `pnpm turbo run test --filter=!@fundamento/eroj`, Perf, Lint, `check:vortaro-lint|parity|regularo|mankoj|alirebleco|clean-room`, `check:release`; **`eroj`** — Playwright-Browser, Build, Vitest der Eroj (React-Typen) und `playwright test --shard=N/2` als Matrix (2 Shards, `fail-fast: false`); **`rendered-checks`** — Playwright-Browser, Build, `check:alirebleco-eroj`, `check:make-kit`, `check:quickstart`, `check:vitrino`. `PLAYWRIGHT_ENGINES` steht an den zwei gerenderten Jobs (auf `main` drei Engines, im PR Chromium), `timeout-minutes: 15` je Job; kein Vitest- oder Playwright-Timeout angehoben. `workflow.test.ts` pinnt die drei Jobs mit ihren Schritten, die Matrix, die Engines und das Budget; der Skript `check` der Wurzel (eine Reihe für lokal) ist unverändert. Die Eroj-Tests laufen im Job `eroj` ohne die Modelo-e2e-Last, die Modelo-e2e-Gruppe ohne Playwright daneben — die Ursache des Hook-Timeouts ist weg, nicht sein Budget.

**Messung vorher** (ein Job, Wanduhr des Laufs): Spec 011 ③ Run 38979497232 **16m15s**; ④ Run 38979562730 **12m03s**; ⑤ Run 38979619902 **15m50s**, Run 38966614433 rot (Hook-Timeout), Neustart 15m50s; Nachlese 3 ① Run 39022824766 **12m04s** (Test-Schritt 7m09s). **Nachher** (drei Jobs, Wanduhr = längster Job), drei Läufe in Folge auf HEAD `9472957`, alle grün, kein Hook-Timeout: Run 39024362329 (PR-Lauf) **8m04s** — `unit` 8m00s, `eroj` Shard 1 6m04s / Shard 2 6m52s, `rendered-checks` 6m44s; Run 39024959792 (Dispatch) **8m11s** — `unit` 8m05s, Shards 4m09s / 5m25s, `rendered-checks` 6m47s; Run 39025517138 (Dispatch) **8m35s** — `unit` 8m30s, Shards 5m55s / 6m47s, `rendered-checks` 6m54s. Die Wanduhr ist der Job `unit` (Build + Modelo-Tests + die Checks); die Eroj-Shards und die gerenderten Checks liegen darunter. Gegenüber dem Mittel vorher (≈ 14 min) rund 6 min weniger, gegenüber dem besten Lauf vorher (12m03s) 3,5 bis 4 min; die Marke 12 min hält in allen drei Läufen mit ≥ 3 min Luft. Kein Timeout verändert (Regel 0.4). Der Lauf des Doku-Commits dieser Messung kommt als vierter hinzu (Bericht).

#### D-02 W2: `check:alirebleco` über jede bekannte Aspekto (Spec 011 ⑤ B-8)

Der Check lud bisher die Standardquelle (Kern + `komuna`). Jetzt wertet er zusätzlich jede Aspekto aus, die das Modelo kennt: `KNOWN_ASPEKTO_FIXTURES = ["ekzemplo"]` — die Test-Aspekto, die Tests, Vitrino und Figma-Sets über den Kern legen (`test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json`, als Projektquelle komponiert). Ihre fehlgeschlagenen Paar-Auswertungen werden **Warnungen** `contrast-external-aspekto` (Pfad des Paars, Nachricht mit `[ekzemplo]`, Hinweis Regel 0.3), ihre Statistik steht mit Präfix (`ekzemplo:evaluations`, `ekzemplo:errors`, …) im Ergebnis, die Zusammenfassung nennt sie. `komuna` bleibt bindend. Nicht jede Fixture mit Konfiguration zählt (Abweichung 1): `aspekto-font-declared` komponiert ekzemplo mit geänderten Schriften und meldete 18 fehlende Paare — eine Prüf-Fixture, keine Aspekto des Systems. **Bestand:** ekzemplo 0 fehlgeschlagene Paar-Auswertungen über 144 Kombinationen (die gelbe Marke aus ③ B-9/④ B-7/⑤ F-7 liegt auf keinem deklarierten Paar — die Eroj binden sie nicht mehr). `RULE_IDS` += `contrast-external-aspekto` (155).

#### D-03 W3: Figma löst `font.family.code` als Liste auf (F-2)

`fontOf` nahm die erste Familie des Stapels (`stack[0]`); `font.family.code` = `["Geist Mono", "ui-monospace", "monospace"]` fiel in der Datei des Maintainers mit Warnung auf Inter zurück (F-2). Jetzt: der Plan trägt an jedem Schriftpaar **`families`** (die Kandidaten; `family` = `families[0]` bleibt für die Kompatibilität), `figmaFontCandidates(stack)` überspringt die generischen CSS-Namen (`ui-monospace`, `monospace`, `system-ui`, `ui-sans-serif`, `ui-serif`, `ui-rounded`, `sans-serif`, `serif`, `cursive`, `fantasy`, `math`, `emoji`, `fangsong`, `SFMono-Regular`, `-apple-system`, `BlinkMacSystemFont`; echte Familien wie Menlo bleiben), ein durchgehend generischer Stapel behält seinen ersten Namen. `loadFont` im Plugin geht die Leiter über **jeden Kandidaten** im Schnitt des Modells, dann in Regular, dann Inter im Schnitt, dann Inter Regular (`figma.loadFontAsync` je Kandidat); ein späterer Kandidat im richtigen Schnitt ist keine Warnung (der Token nennt ihn, wie ein Browser); die Warnung bei Schnittwechsel oder Rückfall nennt die versuchten Kandidaten. `applyComponents` reicht `families` durch (vorher baute es das Paar neu). Manko `man_01M54N90NZ8Z993BGKHE46KBQX` (Celo figma, `font.family.code`, Beleg: Messung F-2 vom 16.10.), Schließbedingung: ein Plugin-Lauf lädt eine Familie aus `font.family.code` ohne Warnung und Figma nimmt die Bindung von `fontFamily` an `typography/code/font-family` an. Kein Token geändert. Rot zuerst (5), 597 grün, `check:parity` 0 Differenzen, `check:mankoj` 9.

#### D-04 W4: Vitrino zeigt den `mezurilo` ohne Wert (F-9)

`eroMarkup`: ein Ero mit einer Zahl-Prop ohne Default (der Wert des Messbalkens) bekommt eine Zeile **„unbekannt“** nach den Kombinationen — einmal, nicht je `intent` (die Spur ist in jedem `intent` dieselbe gestrichelte Spur ohne Füllung): `<fm-mezurilo>unbekannt<span slot="value-text">nicht geprüft</span>`. `VITRINO_UNKNOWN_LABEL`/`VITRINO_UNKNOWN_TEXT` als eine Quelle (die Figma-Celo nennt denselben Text `METER_UNKNOWN_TEXT`; Kandidat: ein Import). Der Vitrino-Check prüft `aria-valuetext` und `data-unknown` am fünften Messbalken.

#### D-05 W5: Vitrino verdrahtet die Vorführung (F-10)

`skripto.ts` (das Skript der Vitrino-Seite, nicht der Eroj): `fm-langetaro` `select` → das Panel zeigt das Wort des gewählten Reiters (das Kind ohne `slot`, dessen `value` oder Text der `detail.value` ist); `fm-tabelo` `sort-change` → `sort` und `direction` werden gesetzt (der Pfeil dreht sich über `aria-sort`), die Zeilen des Light DOM nach der Spalte sortiert (`th[data-sort]`-Index; eine `numeric`-Spalte als Zahl, sonst `localeCompare("de")`), `tr[data-fm-empty]` bleibt außen vor. Nur die Vitrino; die Eroj bleiben, wie sie sind (E10). Der Vitrino-Check klickt den zweiten Reiter (Panel „Zwei“, `selected="2"`) und die Sortier-Schaltfläche dreimal (ascending → descending mit umgekehrten Zeilen → ascending).

#### D-06 W6: Ontologio – Schema `laboro`, neun Begriffe, Kampo-altLabels

Die Begriffe passen in kein bestehendes Schema (`terminologio` spiegelt die Tabelle der Constitution und ist durch den Drift-Check gebunden, `modelo` die Entitätsarten des Schemas, `principoj` die Grundsätze, `eroj` die Eroj): neues Schema **`laboro`** („die Arbeitsbegriffe des Systems“), additiv in `ontologio.schema.json` und im MCP-Schema von `describe_term`. Begriffe: `Vitrino` (showcase/Schaufenster), `Vojmapo` (roadmap/Fahrplan), `Kialo` (reason/Begründung), `Alirebleco` (accessibility/Barrierefreiheit), `Internacia` (internationalisation/Internationalisierung), `Komparo` (comparison/Vergleich), `Etoso` (ambience/Stimmung, als Kandidat gekennzeichnet), `Komuna` und `Ekzemplo` (die zwei Aspektoj; der Begriff muss groß beginnen, das eo-Label ist `komuna`/`ekzemplo`), je mit `prefLabel` eo/en/de, `altLabel` en/de, Definition en/de und `related`. `Kampo.altLabel.de` += Passwortfeld, Zahlenfeld, Datumsfeld (① B-4). MCP `s012-nachlese-3.test.ts`: `describe_term` je Begriff über Term, deutsches und englisches Label, die drei Feldnamen über `altLabel`.

### Abweichungen vom Briefing

1. **W2 misst `ekzemplo`, nicht jede Fixture mit Konfiguration** (D-02): `KNOWN_ASPEKTO_FIXTURES` ist eine Liste; `aspekto-font-declared` ist eine Prüf-Fixture.
2. **W6 braucht ein neues Schema `laboro`** (D-06): die Begriffe sind weder Constitution-Terminologie noch Entitätsarten; zwei Schemadateien additiv erweitert.
3. **W6 `Komuna`/`Ekzemplo` als Begriffe** (D-06): das Muster der Begriffe verlangt einen Großbuchstaben, die Labels tragen die Kleinschreibung.
4. **W4 eine Zeile „unbekannt“, nicht je intent** (D-04).
5. **W1 der Release-Check im Job `unit`** (D-01): er braucht keinen Browser; das Briefing nennt ihn nicht.
6. **W3 Messart des Mankos `binding-accepted`** (D-03): statt `code-font-loads` (geschlossene Liste).

### Befunde / Mankoj

- **B-3 ekzemplo besteht alle deklarierten Paare** (D-02): die in ③/④/⑤ gemessenen Marken-Kontraste (1,2–1,5:1) liegen auf Paaren, die nie deklariert wurden, weil die Eroj die Marke als Linie nicht mehr binden; der Check meldet 0. Die Lücke bleibt: eine Marke als Fläche ohne Grund-Paar wird nicht gemessen. Kandidat: ein Paar `brand-fill-on-background-default` (ui) deklarieren, sobald ein Ero die Marke bindet — es wäre in ekzemplo rot (Warnung).
- **B-4 `aspekto-font-declared` als Projektquelle** (D-02): 18 fehlende Paare `border-default-on-background-sunken` in ekzemplo light, wenn die Fixture ekzemplo mit eigener Schrift komponiert — ein Nebeneffekt der Fixture, nicht gemessen weiter; Hinweis für den Maintainer, falls Fixtures je als Aspektoj gelten sollen.
- **B-5 Der Token-Wert liefert genau eine Figma-taugliche Familie** (D-03): `font.family.code` → Kandidaten `[Geist Mono]`; die Leiter ändert für die Datei des Maintainers nichts, die Warnung bleibt, bis die Datei Geist Mono kennt. **Kandidat: die Aspekto nennt eine Code-Schrift** (oder Geist Mono wird in Figma hochgeladen). Tiefer: selbst wenn ein zweiter Kandidat lädt, entscheidet die Bindung an `typography/code/font-family` (Wert: die erste Familie des Tokens), was der Code-Text zeigt — Figma lehnt die Bindung ab, wenn die Familie nicht geladen ist (F30), der Text bleibt in der Schrift der Beschriftung. Soll ein Kandidat wirken, müsste der Variablenwert je Modus den Stapel wie ein Browser auflösen (erste ladbare Familie): ein dateiabhängiger Wert, Entscheidung des Maintainers (O-35). ekzemplos Code-Stapel ist durchgehend generisch (`ui-monospace`, `monospace`): keine Figma-ladbare Familie (② B-7 bleibt).
- **Mankoj:** +1 (`man_01M54N90NZ8Z993BGKHE46KBQX`, 9 gesamt). Abweichung 6: die Messart heißt `binding-accepted`, nicht `code-font-loads` — die Messarten sind eine geschlossene Liste (`MANKO_MEASURES`, Schema-Enum); eine neue Art wäre eine Schema-Änderung; `binding-accepted` trifft die Lücke (Figma nimmt die Bindung erst mit geladener Familie an).

### Offen (für den Maintainer)

- **O-32** Ob `ekzemplo` im Kontrast-Check bindet (W2): heute Warnung; Entscheidung des Maintainers.
- **O-33** Der Name des Ontologio-Schemas `laboro` und die Zuordnung der neun Begriffe (W6) — bestätigen.
- **O-34** Die Zeile „unbekannt“ einmal statt je intent (W4) — bestätigen.
- **O-35** Code-Schrift in Figma (W3, B-5): die Aspekto nennt eine Code-Schrift, die die Datei kennt, oder Geist Mono wird hochgeladen; ein Variablenwert, der den Stapel je Datei auflöst, ist eine Entscheidung des Maintainers.

### Messungen

In [`tasks.md`](tasks.md) ②.

