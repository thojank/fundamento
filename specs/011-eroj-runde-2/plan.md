# Plan – Spec 011: Eroj in der Breite, Runde 2 (Eingabe, Overlay, Rückmeldung, Daten, Navigation)

**Spec:** [`spec.md`](spec.md) (unverändert kopiert) · **Anforderungsquelle:** [`arkitekturo-kandidaten.md`](arkitekturo-kandidaten.md) (Text; aus dem Arkitekturo-Repo wird kein Code übernommen, E7) · **Auftrag:** Briefing P0 vom 2026-10-15 (außerhalb des Repos) · **Regel 0:** [`../008-ligilo/briefing-p0-nacht-2026-10-12.md`](../008-ligilo/briefing-p0-nacht-2026-10-12.md) · **Aufgaben:** [`tasks.md`](tasks.md) · **Vorbilder:** `kampo` ([`../009-kampo/plan.md`](../009-kampo/plan.md)), `elekto`/`elektilo` ([`../010-formular-eroj/plan.md`](../010-formular-eroj/plan.md) ③/④), `ligilo` ([`../008-ligilo/plan.md`](../008-ligilo/plan.md)) · **Constitution:** v2.2, kein Amendment · **Basis:** `main` @ `fcccab5`

Fünf gestapelte PRs, ein Abschnitt je PR (G9, E6). Regel 0 gilt für alles, was die Spec nicht regelt; jede Entscheidung unten nennt ihre Stufe.

## ① Grundlage

**Branch:** `261015-spec-011-grundlage-e137d7` (von `origin/main` @ `fcccab5`) · **Datum:** 2026-10-15 · **Aufgaben, Commits und rote Hashes:** [`tasks.md`](tasks.md) ①

Kein neues Ero. ① räumt die offenen Punkte von Spec 010 auf (Nachlese 2), bindet die e2e-Laufzeit strukturell (O-21, zuerst und vollständig), sichert den ersten Abnehmer des Make Kit (G8) und schließt drei Lücken, die Arkitekturo von Hand überbrückt hat: Passwort, ganze Zahl und Datum im `kampo` (dazu Formular-Gültigkeit und Enter), die leere Option im `elektilo`.

### Zusammenfassung

1. **O-21 (D-01):** Playwright `fullyParallel`; die e2e-Dateien von `@fundamento/modelo` als eigene Vitest-Gruppe nach den Unit-Dateien, eine nach der anderen, mit einem Spawn-Gate je Kern im Harness; der CI-Faktor 3 des Hooks in `e2e/checks.test.ts` ist entfernt. Gemessen: `check:alirebleco-eroj` in Chromium 148,6 s → 44,3 s (lokal), der Hook unter Last 12–19 s → 9,8 s.
2. **G8 (D-02):** `observed-usage/arkitekturo.json` mit den 101 Variablen der Kandidatenliste (Quelle, Datum, Abnehmer, Kit) und ein Test im Make Kit gegen `styles.css` beider Kits; rot zuerst mit `--fm-color-navigation-selectd`.
3. **Nachlese 2 (D-03–D-06):** `brief.axes` nennt `checked` und `selected` (O-3); `overflow-wrap` ist Struktur (O-8); vier Jugxoj für die Figma-Vorgabewörter (O-1, O-5, O-9, O-15); sechs KontrastParoj der Link-Farben auf `raised` und `sunken`, alle ≥ 5,58:1 (kein Befund); die bestätigten Punkte stehen in [`../010-formular-eroj/plan.md`](../010-formular-eroj/plan.md) → „Nachlese 2026-10-15“; O-11/O-17 in der Vojmapo (Phase 6); O-18 ohne Schemawechsel.
4. **`kampo` (D-07, D-08):** `kind` += `password | number | date`, Props `min`, `max`, `autocomplete`, Goals `password`/`number`/`date`, Taste Enter; form-associated (Pflicht, ganze Zahl, Grenzen, Datum der Plattform); Enter sendet das Formular genau einmal; Uzo: `password` und `date` entfallen, `reveal-password` (ask-human), `decimal` (not-supported), `date-range` (ask-human); Kialos gekürzt (`brief` 745).
5. **`elektilo` (D-09):** Prop `empty-label`; die leere Option ist der erste, wählbare Eintrag mit Wert `""` (`SkemoSlot.entry.empty`), nie neben dem Platzhalter (Constraint), und zählt für `option-labels-distinct` als Option.
6. **Schema (additiv, D-08, D-09):** ein Constraint liest eine String-Prop als `filled`/`empty` (`prop:<name>` in `when` und `allowed`); `SkemoSlot.entry.empty`. Keine neue Regulo, kein neues Token, keine Figma-Änderung außer den Plan-Eigenschaften.

### Entwurfsentscheidungen

#### D-01 O-21: die e2e-Laufzeit ist Struktur, kein Timeout (Regel 0.2)

**Befund.** Zwei Stellen trugen die Laufzeit, keine der beiden ein Timeout-Problem:

- **Playwright.** Alle Tests einer Datei liefen in einem Worker; ein PR-Lauf (eine Engine, eine Datei `alirebleco.check.ts`) trieb die gesamte gerenderte Alirebleco-Prüfung seriell durch einen Worker. Auf dem Runner: „Check: Alirebleco (Eroj)“ 396–423 s, „Test“ 401–442 s (Läufe 38588087905, 38591248711, 38671739185, 4 vCPU). Mit 17 Eroj wäre der Job über der 20-Minuten-Schranke (Vojmapo: die Schranke ist der Melder, nicht der Fehler).
- **Vitest (modelo).** Jede e2e-Datei spawnt in ihrem `beforeAll` alle Prozesse auf einmal (`checks.test.ts` 24: ein Build, sechs Repo-Checks, 17 Fixtures; `validate.test.ts` ~90), neben allen Unit-Dateien und den anderen Paketen. Der Hook lief mit sieben Eroj auf dem Runner über 60 s und bekam in Spec 010 ④ den Faktor 3 (`98aea27`). Lokal isoliert braucht dieselbe Arbeit 3,4 s (24 Spawns, zehn Kerne): Last, nicht Arbeit.

**Lösung (kleinste strukturelle).**

1. `packages/eroj/playwright.config.ts`: `fullyParallel: true` – die Tests einer Datei verteilen sich auf die Worker; jeder Test baut seine eigene Seite, nichts teilt Zustand. Gilt für alle fünf Playwright-Configs (sie erben die Basis).
2. `packages/modelo/vitest.config.ts`: zwei Projekte wie bei `@fundamento/mcp` (Spec 006 B6) – `modelo` (Unit-Dateien, `groupOrder: 0`) und `e2e` (`src/e2e/**`, `fileParallelism: false`, `groupOrder: 1`). Die e2e-Dateien laufen nach den Unit-Dateien, eine nach der anderen.
3. `e2e/test-doubles/harness.ts`: `runNode` geht durch ein Gate von `availableParallelism()` Kindprozessen; die Aufrufer behalten ihr `Promise.all`, die Arbeit ändert sich nicht, nur die Reihenfolge.
4. `e2e/checks.test.ts`: der Hook ist wieder `60_000` ohne CI-Faktor. Der ältere Faktor 3 in `packages/mcp/vitest.config.ts` und im CLI-Export-Test (`6bd4532`, Spec 008/009-Kette, Jugxo `jug_01M2W3K1YPP05F4XF86J71RGTK`) ist nicht aus der Spec-010-Kette und bleibt (Offen O-1).

**Messungen (lokal zehn Kerne; CI der PR-Lauf 38805790774 auf 4 vCPU, Chromium).**

| Was | vorher | nachher |
|---|---|---|
| Arbeit des Hooks `checks.test.ts` (24 Spawns), isoliert, 3 Läufe | 3,42 / 3,42 / 3,46 s | unverändert (die Arbeit ist dieselbe) |
| dieselbe Arbeit neben der laufenden modelo-Suite | 19,08 / 12,18 s (ungegated) | 9,82 s (Gate 4, wie auf einem 4-Kern-Runner) |
| `check:alirebleco-eroj`, Chromium (wie ein PR-Lauf) | 148,6 s (59 Tests, 1 Worker) | 44,3 s (59 Tests, 5 Worker) |
| `check:alirebleco-eroj`, drei Engines | 5 min 7 s (177 Tests, 3 Worker) | nicht erneut gemessen (Chromium ist der PR-Fall) |
| `pnpm --filter @fundamento/modelo test`, ganze Suite | 27,7 s | 39–41 s (die e2e-Dateien laufen nacheinander; der Abtausch gegen die Last auf dem Runner, siehe Befund B-1) |
| CI „Test“ (alle Pakete, `turbo run test`) | 401 / 433 / 442 s (38591248711, 38671739185, 38588087905) | **262 s** (38805790774) |
| CI „Check: Alirebleco (Eroj)“ | 396 / 423 / 397 s | **90 s** |
| CI Job gesamt | 13–14 min | 8 min 38 s; der Hook von `checks.test.ts` blieb unter 60 s ohne Faktor |

**Was nicht geändert ist.** Die Prüfungen selbst (axe je Element und Zustand, jede Fixture durch den gebauten Runner), die Timeouts der Tests, `turbo run test` (alle Pakete parallel) und `ci.yml`. Ein höheres Timeout steht nirgends.

#### D-02 G8: der Arkitekturo-Vertrag als beobachtete Nutzung (Regel 0.2)

`packages/projekcioj/src/celoj/make-kit/observed-usage/arkitekturo.json`: `consumer`, `kit` (`@fundamento/make-kit-komuna@0.1.0-next.3`), `source` (die Kandidatenliste, Datei und Herkunft), `date` (2026-10-15), `variables` (sortiert, eindeutig). Die Liste ist aus allen Zeilen „Verwendete Variablen“ der Kandidatenliste extrahiert: 103 Treffer des Musters `--fm-…`, davon zwei Präfixe aus dem Fließtext (`--fm-` und `--fm-color-navigation-`), bleiben **101** – die Zahl der Spec. Der Test (`make-kit.test.ts`, „the observed usage of the Make Kit by Arkitekturo“) liest die Deklarationen `--fm-…:` aus `styles.css` jedes Kits (komuna, ekzemplo) und meldet jede fehlende Variable mit Namen. Rot zuerst mit der absichtlich falschen Variable `--fm-color-navigation-selectd` (2 von 42 rot, Commit `763504c`), dann grün (`bfbf806`). Eine Umbenennung oder Entfernung ist danach nur mit einem Jugxo erlaubt, der Ersatz und Abnehmer nennt; das ist keine stabile Menge für alle (Vojmapo, Querschnitt: Constitution-Kandidat).

#### D-03 O-3: `brief.axes` nennt die Achsen der Varianten und den Zustand eines Eintrags (Regel 0.2)

`briefOf` nahm nur Enum-Props. Jetzt: jede Enum-Prop; jede boolesche Prop, nach der ein Teil schlüsselt (`variantKeys`, Spec 010 ① D-03: `checked`), mit `true`/`false` und Standard; und je Slot mit `entry` der Schlüssel (`selected`) mit `true`/`false`, dem Slot (`slot: "options"`) und ohne Standard (Spec 010 ③ E7: kein Prop, keine Achse der Varianten). Reihenfolge: die der Props, dann die Einträge – `sxaltilo`/`markobutono`: `checked, size`; `elekto`: `size, orientation, selected`; `elektilo`: `size, selected`. `required`, `invalid`, `disabled`, `readonly`, `loading`, `external` schlüsseln keinen Teil und bleiben draußen. Das Ausgabeschema von `get_ero` kennt `slot` (optional). `brief` je Ero neu gemessen (tasks ①), keines über 750; die Grenze ist nicht angehoben.

#### D-04 O-8: `overflow-wrap` ist Struktur (Regel 0.2)

Ob ein Wort, das länger ist als die Zeile, im Wort bricht, ist Struktur (`anywhere`, `normal`), kein Design-Wert: `STRUCTURAL_PROPERTIES` += `overflow-wrap` (Obergrenze des Tests 21 → 22). Das Label eines Toggles, das umbrechen darf (`wrap: allowed`, der `markobutono`), trägt `overflow-wrap: anywhere`; das des Schalters (`never`) nicht. Internacia-Test: ein Kompositum mit Tilden-Kette in einem Container von 12 rem bricht im Wort, der Host bleibt im Container, nichts wird abgeschnitten (Spec 010 ② B-4).

#### D-05 Bestätigte Punkte, Jugxoj statt Umbau (Auftrag)

O-1, O-5, O-9, O-15: je ein Jugxo (`jug_01M50KAWKV5A1PYBARPMX4YKJE`, `…KW4N2AG37AJZY1P96V`, `…P96W`, `…P96X`; `ref: { artikolo: VIII, celo: figma }`, approved, 2026-10-15, Kontext „abgenommen 2026-10-14“), die Kommentare in `LABEL_DEFAULTS` nennen sie. O-4, O-6/O-14/O-19, O-10, O-12, O-13, O-16, O-20: je ein Satz in [`../010-formular-eroj/plan.md`](../010-formular-eroj/plan.md) → „Nachlese 2026-10-15“. O-18: kein Schemawechsel; `mankoj.json` führt gemessene Werkzeuglücken, Entscheidungslücken stehen als Grenze in der Uzo (④ M-1 bleibt dort). O-11, O-17: in der Vojmapo unter Phase 6 bei den Regulo-Kandidaten („Prüfart über Prop und Einträge“), nicht umgesetzt.

#### D-06 Kontrast des Links: sechs Paare deklariert, kein Befund

Gemessen (`measureBranch`, WCAG 2.x, alle 72 Kombinationen von komuna und ekzemplo): `color.link.rest|hover|visited` auf `color.background.canvas|default|raised|sunken`. Minima: rest 5,58 (sunken, komuna light), 5,83 (raised, komuna dark), 6,13 (canvas), 6,71 (default); hover 7,11 (raised), 7,82 (sunken), 8,58, 9,40; visited 8,58 (raised), 10,51 (sunken), 11,53, 11,53. Nichts unter 4,5:1, nichts unter 7:1 bei `contrast=high` (die Schwelle `text-normal` ist dort 7; alle Minima liegen in `contrast=default`). `canvas` und `default` waren deklariert (Spec 008); **neu** `link-{rest,hover,visited}-on-background-{raised,sunken}` (`text-normal`, Ids aus `pnpm id:new kontrastParo`). `check:alirebleco`: 76 Paare × 72 Kombinationen, 0 Fehler. Der Repo-Test „about sixty pairs“ hatte die Obergrenze 70 (genau getroffen seit Spec 010 ①); sie ist auf 80 gesetzt – ein Sanity-Band, keine Konformitätsschwelle.

#### D-07 `kampo`: Passwort, ganze Zahl, Datum, Formular-Gültigkeit, Enter (E8, O-7)

- **Skemo.** `kind` += `password`, `number`, `date` (Beschreibung sagt, was jede Art tut). Props `min`, `max` (String: ganze Zahl oder ISO-Datum, Grenzen für `number` und `date`), `autocomplete` (String: die Wörter der Plattform, `current-password`, `new-password`, `email`). `a11y.keys: ["Enter"]`. Goals `password` (en password, passphrase; de passwort, passwortfeld, kennwort), `number` (en number, integer, whole; de zahl, ganzzahl, ganze, anzahl), `date` (en date, expiry, deadline; de datum, ablaufdatum, frist), je `props: { kind }` und `regulo: field-label-visible`. Zwei Constraints: `prop:min` bzw. `prop:max` `filled` ⇒ `kind` ∈ {`number`, `date`} („A bound needs a scale“, D-08).
- **`autocomplete` ist eine String-Prop, kein Enum** (Abweichung 1): als Enum stünde sie als Achse im `brief` und hätte für jede Art einen Wert; die Plattform kennt mehr Wörter als zwei (`email`); die Beschreibung nennt die zwei der Spec.
- **Web Celo.** `number` → `type="text" inputmode="numeric" pattern="-?[0-9]+"` (GOV.UK: kein `type=number`, Scrollrad und Pfeile verändern den Wert); `date` → `type="date"`; `password` → `type="password"`; `autocomplete`, `min`, `max` durchgereicht (die Plattform prüft die Grenzen eines Datums, das Element die einer Zahl). **Gültigkeit** (`#validate`, nur im Element des Feldes): Pflicht und leer → `valueMissing` mit `a11y.texts.required` (wie `markobutono`); `number` und keine ganze Zahl → `patternMismatch`; `number` außerhalb von `min`/`max` → `rangeUnderflow`/`rangeOverflow`; `date` → die `validity` der Plattform (`badInput`, `rangeUnderflow`, `rangeOverflow`). Die **Meldung** ist der Text des Slots `error`, wenn er belegt ist (`error-says-what-to-do` gilt für ihn) – sonst die Plattform: für die Zahl der Text eines `type=number`-Eingabefelds, das nie gezeigt wird (`#platformMessage`, Sonde mit `step=1`, `min`, `max`), für das Datum `validationMessage` der Kontrolle. Kein fester String im Element (Art. VIII). `aria-invalid` sagt das Element auch bei eigener Ungültigkeit. **Enter** (`keydown` an der Kontrolle, nur wenn die Skemo die Taste nennt) → `form.requestSubmit()`: das Formular prüft seine Gültigkeit und sendet genau einmal; ein leeres Pflichtfeld sendet nicht. `formResetCallback` leert das Feld. `validity`, `validationMessage`, `checkValidity()` am Element, wie bei einem nativen Feld (die anderen form-associated Eroj haben sie nicht, Kandidat B-4).
- **Uzo.** Grenzen `password` und `date` entfallen; neu `reveal-password` (ask-human; reveal, unmask, show-password / einblenden, verbergen, anzeigen), `decimal` (not-supported; decimal, float, fraction / dezimalzahl, dezimal, kommazahl, nachkommastellen), `date-range` (ask-human; period, range / zeitraum, datumsbereich). `number-stepper` bleibt not-supported. „Passwort einblenden“ trifft Goal und Grenze → ask-human mit beiden Kandidaten (OP-12), „Passwortfeld“ → `kind=password`, „Ablaufdatum des Pins“ → `date`, „Vorrang als ganze Zahl“ → `number`.
- **`brief` 745** (vorher 746; mit den neuen Grenzen wörtlich wäre er 824): nach dem Muster von O-12 gekürzt – die Kialos von `multi-line`, `toggle` (behält „(in a form, applied with it: markobutono)“), `number-stepper`, `file`, `no-visible-label`, `icon-in-field` und die drei neuen. Keine Aussage ist verloren, keine Grenze angehoben.
- **Figma, Make Kit, Vitrino, React.** Die neuen Arten und Props sind Eigenschaften des Figma-Plans (`kind` mit acht Werten, `min`/`max`/`autocomplete` TEXT), nichts wird anders gezeichnet (ein Datum zeigt das geschlossene Feld, wie der `elektilo`, E3; kein Manko). Die Komponentenseite des Kits und der React-Typ folgen der Skemo. Vitrino unverändert (`kind` schlüsselt keinen Teil).

#### D-08 Ein Constraint liest eine String-Prop als `filled`/`empty` (Regel 0.2)

Die Spec verlangt für den `elektilo` „`empty-label` und `placeholder` schließen sich aus“ und für den `kampo` Grenzen, die nur mit `number`/`date` Sinn haben. Ein Constraint kannte Enum- und boolesche Werte und seit Spec 009 Slots (`slot:<name>`: filled/empty). Kleinste Erweiterung: dieselbe Form für String-Props – `prop:<name>` mit `filled`/`empty` in `when` **und** in `allowed` (Schema `SkemoConstraint`, additiv). `skemo-constraint-invalid`, wenn die Prop fehlt oder keine String-Prop ist, oder ein anderer Wert als filled/empty steht (Fixture `elektilo-constraint-prop-unknown`). `check_usage` legt `propStates` neben `slotStates` in die Kombination (`ero-prop-constraint`); das Element liest die String-Props ebenso (Warnung mit der Kialo), schreibt sie aber nie als `data-`Attribut. `forbiddenBy` ist unverändert.

#### D-09 `elektilo`: die leere Option ist ein Eintrag (E7, Regel 0.1)

Prop `empty-label` (String). `SkemoSlot.entry.empty: "empty-label"` sagt, dass der Text dieser Prop der erste Eintrag des Slots `options` mit dem Wert `""` ist – ein Satz in der Skemo, den zwei Stellen lesen: die Web Celo zeigt ihn als erste, wählbare, nie gesperrte Option und lässt die Aufforderung weg (Formularwert `""`, nicht „nichts“; Pflicht ohne Wahl bleibt `valueMissing`, wie bei einem nativen `select`), und `check_usage` stellt ihn vor die Texte der Optionen, damit `option-labels-distinct` ihn zählt („Alle“ zweimal ist ein Fehler) – `max-entries` und `uzo-slot-min` zählen weiter die echten Optionen. Constraint `prop:empty-label` filled ⇒ `prop:placeholder` empty mit Kialo („dieselbe erste Zeile zweimal“); `select-placeholder-is-prompt` gilt weiter nur für `placeholder`. Die Aussage von QA L6 Punkt 4 („doppelt“) ist damit behoben. Figma: `empty-label` ist eine Plan-Eigenschaft, das Set zeigt die Aufforderung. Kein Unter-Ero, kein `option` als Begriff.

#### D-10 Rot zuerst

Rote Commits und die Zahl der roten Tests stehen in [`tasks.md`](tasks.md) ①. Die Fixture `elektilo-constraint-prop-unknown` war bei Ankunft grün (die unbekannte Prop fiel schon unter `skemo-constraint-invalid`, dazu eine `schema-violation` des alten Schemas); rot beobachtet durch Mutation: ohne den `prop:`-Zweig in `skemo-rules.ts` meldet `check:regularo --fixture` nichts (`ok: true`). Die Instanz-Fälle (beide Props gesetzt, „Alle“ zweimal, `min` am E-Mail-Feld) sind `check_usage`-Tests im Modelo und im MCP.

### Arkitekturo-Abdeckung (E11)

| Kandidat (Lücke) | braucht | trägt | offen |
|---|---|---|---|
| `fm-kampo` ohne verdeckte Eingabe (Token-Anmeldung, Q68) | `kind=password`, `autocomplete` | `kind=password`, `autocomplete` (String) | Anzeigen/Verbergen: Grenze `reveal-password` (ask-human) |
| Eingabe mit Enter (`onEnter` im Adapter) | Enter sendet das umgebende `<form>` | `form.requestSubmit()` aus dem Feld, genau einmal | – |
| Datum (Ablaufdatum eines Pins, `validatePin`) | `kind=date` mit Mindestdatum | `kind=date`, `min`/`max`, Plattform-Dialog, Plattform-Gültigkeit | „in der Zukunft“ prüft die Anwendung (ein `min` von heute ist ihr Wert); Datumsbereich: Grenze `date-range` |
| Zahlenfeld („Vorrang“, ganze Zahl oder leer) | `kind=number` mit Fehlermeldung | `kind=number` (`type=text inputmode=numeric`), `min`/`max`, Gültigkeit mit dem Text des Slots `error` | Dezimalzahl: Grenze `decimal`; Zahl mit Pfeilen: `number-stepper` |
| Select-Platzhalter mit leerem Wert („Alle“, „keine Auswahl“ doppelt) | eine wählbare leere Option, Beschriftung einstellbar | `empty-label` (Wert `""`, ersetzt den Platzhalter) | – |
| 101 `--fm-*`-Variablen (G8) | jede Variable bleibt | Test gegen `styles.css` beider Kits | Umbenennung nur mit Jugxo (Ersatz, Abnehmer) |
| Formular-Gültigkeit der Kit-Felder (`ark-form`, `novalidate`) | Fehler an den Feldern | `fm-kampo` form-associated wie `markobutono`, `elekto`, `elektilo` | `ark-form` selbst (Seitenmuster, nicht in dieser Spec) |

### Abweichungen von der Spec

1. **`autocomplete` ist ein String, kein Enum `current-password | new-password`** (D-07): ein Enum wäre eine Achse im `brief` und ein Wert für jede Art; die Beschreibung nennt die zwei Wörter der Spec.
2. **Die Meldung der Gültigkeit ohne Fehlertext kommt von der Plattform** (D-07): die Spec sagt, der Fehlertext folgt `error-says-what-to-do` – das ist der Slot `error`; was das Formular ohne ihn sagt, kommt vom Browser (Sonde `type=number`, `validationMessage` des Datums), nie aus einem festen String.
3. **Zwei Constraints statt einer** für `min`/`max` (D-07): ein Constraint liest einen Schlüssel; „min oder max“ wären zwei `when`.
4. **„Fixture mit beiden gesetzt“ ist ein `check_usage`-Fall** (D-10): der Validator prüft Instanzen nicht (Spec 010 ② Abweichung 2); die Fixture zeigt die Regel am falschen Schlüssel (`prop:prompt`).
5. **Der CI-Faktor des CLI-Export-Tests (`6bd4532`) bleibt** (D-01): er ist nicht aus der Spec-010-Kette (Offen O-1).
6. **O-21: `turbo run test` bleibt parallel** (D-01): die Pakete laufen weiter nebeneinander; gebunden sind die Spawns und die Worker-Verteilung, gemessen ist, was lokal messbar ist, die CI-Zahl liefert der PR-Lauf.
7. **Zusätzlich:** Goals `password`/`number`/`date` (die Spec nennt nur die Gvidanto-Frage „Passwortfeld?“); `validity`/`validationMessage`/`checkValidity()` am Element; Kürzung mehrerer Kialos des `kampo` für den `brief` (O-12-Muster).

### Befunde / Mankoj

- **B-1 Die modelo-Suite ist lokal langsamer** (27,7 → 39–41 s, D-01): die e2e-Dateien laufen nacheinander. Der Abtausch kauft die Ruhe auf dem Runner; wird sie dort nicht gebraucht, ist `fileParallelism` der einzige Hebel. Nicht entschieden, gemessen.
- **B-2 `brief` des `kampo` 745** (Grenze 750): ② ersetzt `multi-line` → `null` durch `tekstareo` (gleich lang wie `null` plus die kürzere Kialo). Ein weiteres `instead` reißt die Grenze; das O-12-Muster trägt dann noch die Kialos von `choose-many`/`choose-few`.
- **B-3 `number-stepper` ist über „Zahl mit Pfeilen“ nicht erreichbar:** die Grenze trägt stepper, counter / zähler; „Pfeilen“ nicht (Näherung ohne Modell, wie Spec 008 R-1). „Zahl“ trifft das Goal `number`.
- **B-4 Kandidaten:** `validity`/`checkValidity()` auch an `markobutono`, `elekto`, `elektilo`; `formResetCallback` dort; `ontologio.json`: altLabels „Passwortfeld“, „Zahlenfeld“, „Datumsfeld“ am `#Kampo` (nicht angelegt: ② bringt die Ontologio-Runde der neuen Eroj); Playwright `workers` auf dem Runner (Standard: die Hälfte der Kerne) – erst nach der CI-Messung.
- **B-5 Jugxoj der Vorgabewörter sind von P0 angelegt** (D-05): der Maintainer hat die Wörter abgenommen; die Jugxoj tragen seinen Kontext, zur Bestätigung.
- **Mankoj:** keine. Keine Rolle fehlt (E1 trägt: `number`/`date`/`password` sind Arten, keine Teile); `mankoj.json` unverändert (8).

### Offen (für den Maintainer)

- **O-1** Der CI-Faktor 3 des CLI-Export-Tests (`packages/modelo/src/e2e/cli.test.ts`, `6bd4532`) und der MCP-Hooks (`packages/mcp/vitest.config.ts`): beide tragen den Jugxo `jug_01M2W3K1YPP05F4XF86J71RGTK` und sind nicht aus der Spec-010-Kette. Zurücknehmen, sobald der PR-Lauf die Last zeigt?
- **O-2** B-1: `fileParallelism: false` für die e2e-Gruppe behalten (Ruhe auf dem Runner) oder nur das Gate (lokal schneller)?
- **O-3** `autocomplete` als String (Abweichung 1) – bestätigen; oder ein Enum mit den zwei Wörtern der Spec.
- **O-4** Die vier Jugxoj der Vorgabewörter (D-05, B-5) – bestätigen.
- **O-5** `empty-label` als Prop und `entry.empty` als Form (D-09) – bestätigen; der Alternativweg wäre ein eigener Eintrag im Light DOM (`<data slot="options" value="">Alle</data>`), den der Platzhalter dann doch verdoppelte.

### Messungen

In [`tasks.md`](tasks.md) ①.

## ② Eingabe und Overlay

**Branch:** `261015-spec-011-eingabe-e137d7` (von `origin/main` @ `26be7c2`, nach dem Merge von #63) · **Datum:** 2026-10-16 · **Aufgaben, Commits und rote Hashes:** [`tasks.md`](tasks.md) ② · **Namen (E4) am 16.10. bestätigt:** `tekstareo`, `dialogo`.

Die ersten zwei der zehn Eroj: das mehrzeilige Textfeld und der Dialog. Der `tekstareo` ist das Feld des `kampo` um das `textarea` der Plattform (Teile und Bindungen kopiert, Regel 0.1); der `dialogo` ist das erste Ero, das andere Eroj komponiert (seine Aktionen sind `butono`, seine Begründung ein `tekstareo`) und das erste mit der Plattform-Semantik eines Overlays (natives `<dialog>`, `showModal`). Jede Entscheidung unten nennt ihre Stufe.

### Zusammenfassung

1. **Modelo:** `data/eroj/tekstareo/{skemo,uzo}.json`, `data/eroj/dialogo/{skemo,uzo}.json`; Regulo `dialog-title-names-the-decision` (anpassbar, neu); sieben Feld-Reguloj des `kampo` und `one-primary-per-container` ausgeweitet (E5); 16 Jugxoj (vier Text-Regeln × approved/rejected × de/en); `kampo.instead.multi-line` → `use-instead: tekstareo`, `butono.instead.confirm` → `use-instead: dialogo`, `sxaltilo`/`markobutono` nennen `dialogo` in `composes.with`; Ontologio `#Tekstareo`, `#Dialogo`. Kein neues Token, kein neuer KontrastParo (alle Paare deklariert).
2. **Schema (additiv):** Teil-Eigenschaft `shadow` (D-07). Gvidanto: ein eigener `instead`-Eintrag mit `use-instead` schlägt das eigene Goal (D-10).
3. **Projekcioj:** Web Components `fm-tekstareo` (D-11) und `fm-dialogo` (D-12), React `Tekstareo`/`Dialogo`, Figma-Sets (D-13), Make-Kit `components/tekstareo.md`, `components/dialogo.md` und zwei Guidelines-Sätze (D-14), Vitrino-Abschnitte (D-15), Alirebleco, Internacia, MCP (neun Eroj, Dialoge der Spec als Test). Parität für neun Eroj.
4. **O-1 von ①:** CI-Faktor 3 des CLI-Export-Tests und der MCP-Hooks zurückgenommen (Maintainer 16.10.).

### Entwurfsentscheidungen

#### D-01 `tekstareo`: das Feld des `kampo` ohne Höhe, `kind` text|code (Abschnitt ②, G1, G2)

Props `kind` (text|code, text), `value`, `rows` (Zahl, 4), `placeholder`, `required`, `disabled`, `readonly`, `invalid`, `size` (small|medium|large, medium), `name`; Zustände `rest`, `hover`, `focus`, `disabled`, `invalid` (G2 der Spec; `readonly` bleibt Prop, die Plattform spricht sie, kein Zustand mit eigener Bindung — Abweichung 1); Slots `label` (Pflicht), `help`, `error` (⇒ `invalid`). Teile des `kampo` wörtlich kopiert ohne `box.height` (die Höhe folgt `rows`) und ohne die Bindungen des Zustands `readonly` (wie der `elektilo`); **`text.typography by [kind, size]`**: text → `typography.body.2|1|1`, code → `typography.code` in allen Größen. Damit schlüsselt `kind` einen Teil und ist Achse der Varianten (2 × 3 × 5 = 30). Goal `multi-line` mit den Wörtern der Spec (comment, description, reason, paragraph, multiline / Kommentar, Beschreibung, Begründung, Absatz, mehrzeilig), Regulo `field-label-visible`. `a11y` wie der `kampo`, `keys: []` (Enter ist ein Zeilenumbruch).

#### D-02 `dialogo`: Teile, Achsen, ein Zustand (Abschnitt ②, G2, E9)

Props `open` (bool), `size` (small|medium, small), `reason` (none|optional|required, none); `states: ["rest"]` (G2: die Zustände liegen bei den komponierten `butono` und `tekstareo`). Teile: `backdrop.color` (`color.backdrop`, D-03), `surface` (`fill` `color.background.raised`, `radius` `radius.role.surface`, `width by [size]` → `size.container.small|medium`, `shadow` `elevation.shadow.modal`, D-07), `border` (`color.border.default`, `border.width.default`), `heading` (`color.text.default`, `typography.headline.4` — die kleinste Headline über `body`; `headline.1–4` existieren, `body.1` ist 16 px, `headline.4` die nächste Stufe), `message` (`color.text.default`, `typography.body.1`), **`reason.height by [reason]`** (none → `none`, optional|required → `size.control.large`): der Teil der Begründung ist nur mit Begründung da, so wird `reason` Achse der Varianten (2 × 3 × 1 = 6), `content.gap`/`actions.gap`/`box.gap` (`spacing.medium|small|medium`), `box.inline-padding` (`spacing.large`). Spec-Rollen sind damit vollständig genutzt; `elevation.layer.modal` ist nicht gebunden: die oberste Ebene gibt die Plattform (Top Layer), ein z-Index wäre ein Wert ohne Wirkung (Kandidat, B-3).

#### D-03 `heading` statt `title`, `backdrop.color` statt `fill` (Art. VIII, Regel 0.1)

`title` ist ein Web-Begriff (`skemo-web-term`: das Attribut `title`); der Slot und der Teil heißen **`heading`**. Die Prüfung ist richtig, die Spec nennt den Slot nur umgangssprachlich; die Regulo heißt weiter `dialog-title-names-the-decision` (Abweichung 2). Der Backdrop ist ein Schleier über der Seite, kein Grund, auf dem Text steht: als `fill` paarte `skemo-kontrastparo-missing` Überschrift und Nachricht mit `color.backdrop` (ein Paar, das es nicht gibt und das scheitert). Er ist deshalb ein Teil mit `color`; die Web-Celo schreibt die Farbe des Backdrops als `background-color` auf `::backdrop` (Celo-Wissen, wie `border.color` → `border-color`).

#### D-04 Die Beschriftung der Begründung ist ein Slot `reason` mit Constraint (Regel 0.2)

Das Feld der Begründung braucht eine sichtbare Beschriftung (`field-label-visible` des komponierten `tekstareo`). Sichtbarer Text kommt aus Slots (Art. VIII; `a11y.texts` wird nie gezeigt und ist an boolesche Props gebunden). Kleinste Form: ein Text-Slot **`reason`** (Abweichung 3: die Spec nennt ihn nicht), den die Web-Celo in den komponierten `tekstareo` durchreicht. Damit er nie fehlt, ein Constraint, der die Form von Spec 009 nimmt: `when { slot:reason: empty } allowed { reason: [none] }` — ohne Beschriftung gibt es keine Begründung. `check_usage` meldet `ero-prop-constraint` für `reason=required` ohne `texts.reason`; das Element liest den Slot und warnt.

#### D-05 Uzo des `tekstareo` (Abschnitt ②, G5)

`instead.one-line` → `use-instead: kampo` (name, email, search, one-line / Name, Mail, Suche, einzeilig); Grenzen `auto-grow` (ask-human), `character-count` (ask-human; characters, limit, maxlength / Zeichen, Zeichenzähler, Zeichenlimit — nicht „Zähler“, das ist `number-stepper` des `kampo`), `rich-text` (not-supported; formatting, bold, rich / Formatierung, fett, Editor), `no-visible-label` (via `field-label-visible`); `composes`: `form`, `dialog`; `with` `kampo`, `butono`; `never` `butono`; Layout `container`/`never` (das Label bricht nie, der Text im Feld bricht von Natur aus; Vitrino-Satz D-15). Text-Regeln: `field-label-names-the-datum`, `error-says-what-to-do` (fest), `help-is-one-sentence`; `placeholder-not-label`, `field-label-visible`, `required-marked`, `error-not-color-only` greifen über `appliesTo`.

#### D-06 Uzo des `dialogo` und die Verflechtung (Abschnitt ②, G5)

`instead.inform-only` → `null` mit Kialo, die `avizo` nennt (③ macht daraus `use-instead`, wie Spec 010 ① → ②); `instead.long-form` → `null` (ask-human). Grenzen `non-modal`, `drawer`, `nested-dialog` (je not-supported). `composes`: Container `page`; `with` `butono`, `tekstareo`, `kampo`, `elektilo`, `markobutono`; Slots `heading` (Pflicht), `message`, `reason`, `content` (`kampo`, `tekstareo`, `elektilo`, `elekto`, `markobutono`, `sxaltilo`; `nesting: 1`), `actions` (`butono`, Pflicht, `min: 1`, `max: 2`). Layout `container`/**`allowed`** (Abweichung 4: die Überschrift ist ein Satz, „Standard ‚Datenschutz-Grundverordnung‘ löschen?“ darf umbrechen; `never` hieße `nowrap` und schnitte ab). **Verflechtung:** `butono.instead.confirm` → `use-instead: dialogo` (sure, really, confirmation / sicher, wirklich, zweiten, Rückfrage; Kialo nach der Spec: „An action that cannot be undone asks first … the question is a dialog, not a second button“); `sxaltilo` und `markobutono` nennen `dialogo` in `composes.with` (mit Kialo: sofort bzw. mit der Bestätigung). `brief` des `butono` 749 (vorher 672; Grenze 750, B-2).

#### D-07 Teil-Eigenschaft `shadow` (Regel 0.2)

Die Spec bindet `elevation.shadow.modal` an die Fläche; keine Teil-Eigenschaft trug eine Erhebung. `SkemoPartProperty` += `shadow` (additiv); die Web-Celo schreibt `box-shadow: var(--fm-elevation-shadow-modal)`. Die Figma-Celo bindet sie an den Effekt der Fläche (D-13).

#### D-08 Text-Regel `dialog-title-names-the-decision`, Ausweitungen, Jugxoj (G6, E5)

Neu, anpassbar, Prüfart `not-words` gegen leere Titel (de Bestätigung, Achtung, Hinweis, Warnung, Frage; en confirmation, attention, warning, notice, question); `scope` nennt die Näherung („Wichtig“ geht durch). Enforcer `textRule`. Ausgeweitet: `field-label-visible`, `field-label-names-the-datum`, `help-is-one-sentence`, `error-says-what-to-do`, `error-not-color-only`, `required-marked`, `placeholder-not-label` → `tekstareo` (G6, E5; `placeholder-is-example` bleibt beim `kampo`); `one-primary-per-container` → `dialogo` (Statement: „The actions of a dialogo are such a container“; der Enforcer zählt `butono`-Instanzen je Container, nichts ändert sich an ihm); `spacing-owned-by-container` → beide. 16 Jugxoj: tekstareo Datum („Begründung“ ✓ / „Begründung eingeben“ ✗), Fehler („Gib eine Begründung mit mindestens zehn Zeichen ein“ ✓ / „Zu kurz“ ✗), Hilfe (ein Satz ✓ / zwei ✗); dialogo Titel („Version freigeben?“ ✓ / „Bestätigung“ ✗), je de/en.

#### D-09 Goal-Wörter: reason/Begründung gehören dem `tekstareo` (Spec 008 D-08, OP-12)

Die Spec gibt `reason`/`Begründung` zwei Goals: `tekstareo.multi-line` und `dialogo.ask-reason`. Ein Wort, das zwei Eroj treffen, ist ask-human (OP-12) — der Beispiel-Dialog „Kommentarfeld für eine Begründung“ → `tekstareo` ginge verloren. `ask-reason` trägt deshalb justify, justification / begründen, Begründungspflicht (Abweichung 5). Ebenso `dialogo.confirm`: ohne confirm/bestätigen (Goal `confirm` des `butono`) und ohne delete/löschen (`destructive`): sure, approve, reject, confirmation / sicher, wirklich, freigeben, ablehnen, Bestätigung (Abweichung 5). Ein Datentest sichert, dass kein Goal-Wort des `dialogo` ein Goal-Wort des `butono` ist.

#### D-10 Gvidanto: der eigene `instead`-Eintrag schlägt das eigene Goal (Regel 0.2)

„Ich brauche einen zweiten Button ‚Wirklich löschen?‘“ trifft das Goal `destructive` des `butono` (löschen) und den `instead`-Eintrag `confirm` des `butono` (wirklich, zweiten) → bisher ask-human mit zwei Kandidaten. Die Uzo des `butono` sagt für diesen Fall aber „nicht ich, der `dialogo`“. Neue Regel in `suggestEro`, vor dem Konfliktfall: treffen Goal und `instead`-Eintrag **desselben** Ero und der Eintrag ist `use-instead`, antwortet dessen Ero mit der Kialo des Eintrags als `boundary`. Nur `instead`-Einträge (eine Grenze eines Falls bleibt Konflikt: „Übersicht speichern“ — `navigation` neben `confirm` — bleibt ask-human, T023), nur `use-instead` (ein eigener Eintrag, der eine Person fragt, bleibt Kandidat: „Passwort einblenden“). Zwei verschiedene Eroj bleiben ein Konflikt.

#### D-11 Web Component `fm-tekstareo` (Art. XI; Spec 009 D-08, Spec 011 ① D-07)

`HostControl` += `textarea`: `hostOf("textbox", multiline)` — mehrzeilig ist eine Skemo mit Prop `rows`. Das Markup des Feldes mit `<textarea part="control">` statt `<input>`; `rows` als Attribut; `kind=code` setzt `spellcheck="false"`; Wert, Formularwert, Pflicht (`valueMissing` mit `a11y.texts.required`), `aria-invalid`, Beschreibung aus Hilfe und Fehler, `formResetCallback`, `validity` wie der `kampo` (dieselben Methoden, für beide Hosts erzeugt); kein Enter-Handler (die Skemo nennt keine Taste; Enter ist ein Zeilenumbruch). Stylesheet: Bauform des Feldes mit **`resize: vertical`** (Struktur: `STRUCTURAL_PROPERTIES` += `resize`, 22 → 23) und ohne `min-block-size`; `data-kind` am Feld schlüsselt die Typografie (`typography.code` für code). Inventar: `kind`, `size`, fünf Zustände.

#### D-12 Web Component `fm-dialogo` (Art. XI; G4, E9)

`HostControl` += `dialog`. Markup: `<dialog part="control" aria-modal="true" aria-labelledby="heading" aria-describedby="message">` mit `<h2 part="heading">` (Standard-Slot), `<p part="message">`, `<div part="content">`, **`<fm-tekstareo part="reason" rows="3">`** mit dem Slot `reason` als Label (Komposition im Shadow DOM; der Dialog setzt `required` und `hidden` nach `reason`), `<div part="actions">`. Das Element der Fläche ist `part="control"` wie bei jedem Ero (Skemo-Teile `surface`/`border`/`box` liegen darauf). **Verhalten:** `open` → `showModal()` (Fokusfalle, Escape, Top Layer und die Rückkehr des Fokus sind die der Plattform); der Fokus geht auf das erste Element im Slot `content`, sonst auf die Begründung, sonst auf die Bestätigung (G4) — gesetzt, sobald die Kinder da sind (der Render läuft bei jedem `slotchange`, der Fokus wird nur gesetzt, solange nichts im Dialog ihn hat). Die **Aktionen** sind die geslotteten `butono`: der mit `emphasis=high` bestätigt, jeder andere bricht ab (Abweichung 6: die Spec sagt nicht, woran der Dialog die Bestätigung erkennt; `one-primary-per-container` garantiert höchstens einen). `confirm` ist `cancelable` mit `detail.reason`; `preventDefault` hält den Dialog offen (E9). `cancel` bei Escape (`cancel` der Plattform), beim Schließen und bei jeder anderen Aktion; `open` fällt beim Schließen immer. **Sperre:** solange `reason=required` ohne Text oder ein Element im Slot `content` `:invalid` ist (form-associated Eroj mit `setValidity` treffen `:invalid`), trägt die Bestätigung `disabled` (mit `data-fm-locked`, damit ein eigenes `disabled` der Anwendung nicht aufgehoben wird); jedes `input` im Dialog prüft neu. Stylesheet (Struktur): Host `display: contents`, Dialog als Spalte, Aktionen `justify-content: flex-end` (die Schreibrichtung spiegelt), Überschrift und Nachricht ohne UA-Rand und mit `overflow-wrap: anywhere` (O-8), die Begründung bei `reason=none` `display: none`; Tokens: `inline-size` aus `surface.width` (dass der Dialog nie breiter ist als der Viewport, ist die eigene `max-width`-Regel der Plattform für `dialog` — ein `100%` wäre ein Literal, Abweichung 7), `::backdrop` mit `color.backdrop`, `box-shadow`, Rand, Radius, `padding` aus `box.inline-padding` (Celo-Wissen: der Innenabstand des Dialogs gilt für alle Seiten). Inventar: `size`, `reason`, ein Zustand `rest`.

#### D-13 Figma: Bauform `dialog`, `tekstareo` als `field` (G7, F-8; Regel 0.1/0.2)

**`tekstareo`:** die Bauform `field` (Rolle textbox), 30 Varianten (`kind × size × state`); `kind=code` bindet `typography/code`, `kind=text` `body/2`/`body/1`. Ohne `box.height` hüllt die Kontrolle ihren Text ein; damit sie als Fläche lesbar ist, trägt ihr Text das Beispielwort plus die Leerzeilen der Standard-`rows` („Beispiel“ + drei Leerzeilen); `rows` ist eine Zahl und bindet nichts — im Plan eine Eigenschaft der Art `NUMBER` (Figma hat keine Zahl-Eigenschaft, das Plugin legt keine an; Parität vergleicht `number` = `number`). Die Texte des Feldes kommen jetzt aus den Text-Slots der Skemo (nicht mehr aus allen Vitrino-Wörtern: Nachricht und Begründung wären sonst in jedes Feld geraten).

**`dialogo`:** neue Bauform **`dialog`** (`structureOf("dialog")`), 6 Varianten (`size × reason`, ein Zustand); `open` ist nur Eigenschaft des Plans. Variante → `surface` (Spalte, feste Breite an `size.container.*` gebunden, Füllung, Rand, Radius, Innenabstand und Abstand gebunden) → `heading` (Beschriftungs-Eigenschaft, `headline/4`), `message`, `content` (Abstand `content.gap`; darin `reason-label` und `reason-field` mit der Höhe an `size.control.large` und dem Rand gebunden), `actions` (Zeile am Ende, Abstand `actions.gap`, `action-1`/`action-2`). Eine an `none` gebundene Höhe gilt wie eine Farbe als „nicht gezeichnet“: der Inhalt der Begründung ist bei `reason=none` unsichtbar (`visible = false`; in Figma nehmen unsichtbare Auto-Layout-Kinder keinen Platz — Annahme des Doubles bis zur Messung). **Schatten (D-07):** der Plan trägt je Variante die Felder des Schattens je Schicht (`elevation/shadow/modal/1/color` …, Nummerierung nach F9); das Plugin bindet sie an einen DROP_SHADOW-Effekt, wenn `setBoundVariableForEffect` da ist (Status `bound`), sonst schreibt es den aufgelösten Effekt (Status `written`) und meldet das im Teil `state` des Berichts. Das Double kennt `setBoundVariableForEffect` nicht: der gebundene Weg ist bis f10b-5 unbewiesen (Kandidat: `test-doubles/plugin.ts`). **Hintergrund:** ein Beispielrahmen „dialogo – mit Hintergrund“ (`BACKDROP_EXAMPLE`) im Frame „Eroj“ direkt nach dem Set, Füllung an `color/backdrop` gebunden (Deckkraft 0,5), mit der Standardvariante darin; `backdrop.color` steht in den Bindungen, das Inventar nennt es je Variante, gezeichnet ist es einmal, im Beispiel (zur Beurteilung durch den Maintainer). **Stellvertreter:** die zwei Aktionen sind Rahmen mit Text („Abbrechen“/„Bestätigen“, dieselben Wörter wie die Vitrino, F-5), keine Instanzen des `butono`-Sets; das Begründungsfeld ist ein Rahmen, keine `tekstareo`-Instanz (Kandidaten B-6). **Vorgabewort** der Überschrift für die Rolle `dialog`: „Entscheidung“ — zur Bestätigung durch den Maintainer, kein Jugxo (O-6). `figmaPlanInventory` beschreibt beide Bauformen; nichts Neues in `FIGMA_NOT_DRAWN`; `check:parity` 9 Eroj, 0 Differenzen, 429 Freigaben (alle bestehende Jugxoj). Rot zuerst im Durchgang (27 rot), dann 275 grün; die bestehenden Erwartungen (Set-Listen, Mankoj je Set, Schriften des Doubles) minimal erweitert. **Befund:** die Fixture-Aspekto `ekzemplo` nennt als Code-Schrift `ui-monospace` — der Plan nimmt die erste Familie (F30), eine Schrift, die keine Datei hat; das Double führt sie, damit die Bindung messbar bleibt (B-7).

#### D-14 Make Kit

`components/tekstareo.md` und `components/dialogo.md` generiert. `Guidelines.md`: „Every text that runs over several lines (a comment, a description, a reason) is a `<Tekstareo>`; one line is a `<Kampo>`.“ (aus jedem Ero mit Rolle textbox und `rows`; der Satz des `kampo` bleibt „Every entry of text is a `<Kampo>`“ und nennt den `tekstareo` nicht mehr als Textbox) und „Every confirmation before an action that cannot be undone is a `<Dialogo>` whose heading names the decision; never a second button that asks.“ (aus jedem Ero mit Rolle dialog).

#### D-15 Vitrino

`tekstareo`: Zeilen `kind × size` (6), Spalten `rest`, `required`, `invalid`, `disabled`, Hilfe überall, Fehler nur unter `invalid` (F-5); Layout-Satz „Größe aus dem Container, Beschriftung bricht nie um.“ (das Subjekt einer mehrzeiligen Textbox ist ihre Beschriftung, nicht die Eingabezeile; `plurliniaj` in den Daten). `dialogo`: der Dialog ist modal, sechs offene deckten die Seite; jede Zelle zeigt den geschlossenen Dialog hinter einem `fm-butono` „Öffnen“ (`data-fm-opens`, das Skript setzt `open`), mit Überschrift (die Kombination), `Nachricht`, `Begründung` und zwei Aktionen (Abbrechen low, Bestätigen high); Layout-Satz „Größe aus dem Container, Überschrift darf umbrechen.“ Der Vitrino-Check öffnet einen Dialog, prüft axe im offenen Zustand und schließt mit Escape.

#### D-16 Alirebleco, Internacia, MCP

Alirebleco (Eroj): `tekstareo` 8 Kombinationen (kind × size, rest/hover/disabled, required mit Hilfe, invalid mit Fehler; Fokusring ≥ 3:1); `dialogo` 8 Kombinationen × 6 Varianten offen: axe (`dialog`, `aria-modal`) auf der Seite mit offenem Dialog, Überschrift und Nachricht ≥ 4,5:1 auf der Fläche (gemessen `text-default-on-background-raised`, deklariert). Internacia: `tekstareo` rtl und Textexpansion 135/200 % (Label, Hilfe, Fehler), `dialogo` rtl (Aktionen spiegeln ans Ende, links) und Überschrift auf 400 % (die kleine Fläche ist 640 px breit; 200 % passen in eine Zeile). MCP: `s011-eingabe.test.ts` mit den Dialogen der Spec („zweiter Button ‚Wirklich löschen?‘“ → `dialogo` mit der Kialo des `butono`; „Kommentarfeld für eine Begründung“ → `tekstareo`; „reject with a justification“ → `dialogo reason=required`), `check_usage` (Titel „Bestätigung“, Begründung ohne Label, zwei primäre Aktionen, Textbereich ohne Label), `list_eroj` neun, Briefs.

#### D-17 Rot zuerst

Fixtures (je `expected-issues.json`, `git check-ignore` leer), auf das Vortaro der Fixture getrimmt wie der `elektilo` (Spec 010 ④): `tekstareo-label-slot-optional`, `tekstareo-web-term` (Teil `textarea`), `tekstareo-instead-kialo-missing`, `dialogo-title-slot-optional` (Slot `heading` ohne `required`), `dialogo-web-term` (Prop `tabindex`), `dialogo-instead-kialo-missing`. Rot ohne Mutation: die Eroj fehlten (Modelo-Tests 68 von 1 227 rot). Die je neue Regel verlangten rejected-Beispiele sind die Jugxoj (D-08). Rote Hashes in [`tasks.md`](tasks.md) ②.

### Arkitekturo-Abdeckung (E11)

| Kandidat | braucht | trägt | offen |
|---|---|---|---|
| `ark-textarea` (`textArea({ label, value, name, rows, required, disabled, readonly, placeholder, help, error, code, onInput })`) | mehrzeiliges Feld, Code-Schrift für Markdown, Label/Hilfe/Fehler, Pflicht | `tekstareo`: alle Props (`code` → `kind=code`), Slots `label`/`help`/`error`, form-associated, `input`-Ereignis | `setError(message)` ist der Slot `error` der Anwendung; `focus()` die Plattform |
| `ark-dialog` (`openDialog({ title, message, content, confirmLabel, cancelLabel, intent, reason, reasonLabel, reasonHelp })` → Promise) | modaler Dialog, Bestätigen/Abbrechen, Pflicht-Begründung sperrt, Fokus auf Begründung, Rückkehr zum Auslöser | `dialogo`: `heading`, `message`, `content`, `actions` (zwei `butono`, `intent=danger` am Bestätigen), `reason` required/optional mit Slot `reason`, Sperre, Fokus, Escape, `confirm`/`cancel` | `reasonHelp` (Hilfe am Begründungsfeld): Kandidat, Slot `reason-help`; das Promise ist der Adapter der Anwendung (`confirm`-Ereignis) |
| `openFormDialog({ fields, confirmDisabled, onConfirm → Promise<boolean>, problems })` (ARK-8.3) | Formular im Dialog, bleibt offen bis `onConfirm` wahr, Probleme im Dialog | `content` mit Feldern, Sperre bei `:invalid`, `confirm` abbrechbar (`preventDefault` hält offen, E9) | `problems`-Bereich: ein `avizo` im `content` (③); `confirmDisabled` von außen: `disabled` am `butono` der Anwendung bleibt stehen (`data-fm-locked` unterscheidet) |
| Idempotency-Key je Versuch | – | nicht Sache des Ero | Anwendung |

### Abweichungen von der Spec

1. **`readonly` ist beim `tekstareo` Prop, kein Zustand** (D-01): G2 der Spec nennt die fünf Zustände ohne `readonly`; die Plattform spricht `aria-readonly`, die Bindungen des `kampo` für `readonly` sind nicht kopiert.
2. **Slot und Teil heißen `heading`, nicht `title`** (D-03): `title` ist ein Web-Begriff (`skemo-web-term`).
3. **Slot `reason`** (D-04): die Beschriftung des Begründungsfelds, mit Constraint; die Spec nennt ihn nicht.
4. **`wrap: allowed` beim `dialogo`** (D-06): die Überschrift ist ein Satz.
5. **Goal-Wörter ohne reason/Begründung (`ask-reason`) und ohne confirm/bestätigen/delete/löschen (`confirm`)** (D-09): Wörter zweier Eroj wären ask-human.
6. **Die Bestätigung ist der `butono` mit `emphasis=high`** (D-12): die Spec sagt nicht, woran der Dialog sie erkennt.
7. **Keine Begrenzung auf den Viewport im Stylesheet** (D-12): `100%` wäre ein Literal; die `max-width` des Plattform-Dialogs trägt sie.
8. **`reason` schlüsselt `height`, nicht eine Farbe** (D-02): der Teil ist mit Begründung da (`size.control.large`) und ohne nicht (`none`); so wird `reason` Achse, ohne dass eine Farbe erfunden wird.
9. **`backdrop.color` statt `fill`** (D-03).
10. **`inform-only` → `null`** bis ③ (D-06); **`fixtures` getrimmt** (D-17); **Figma-Aktionen als Stellvertreter** (D-13).
11. **Zusätzlich:** `instead.one-line` des `tekstareo` nennt Wörter des `kampo` (Spec 008 D-08: Goal und Alternative sagen dasselbe); `label-names-action` gilt über die komponierten `butono` ohne Änderung.

### Befunde / Mankoj

- **B-1 `brief` des `butono` 749** (Grenze 750) durch den Eintrag `confirm`; der nächste Eintrag am `butono` reißt sie (O-12-Muster dann auch dort). `tekstareo` 422, `dialogo` 410, `kampo` 743 (vorher 745: kürzere Kialo von `multi-line`).
- **B-2 `::backdrop` erbt Custom Properties** erst seit Chromium 122, Firefox 120 und Safari 17.4 vom `dialog`; ältere Browser zeigen den Schleier der Plattform. Gemessen in Chromium (PR-Lauf); die drei Engines prüft der Merge-Lauf.
- **B-3 `elevation.layer.modal` ungebunden** (D-02): der Top Layer der Plattform ersetzt den z-Index; Kandidat, wenn ein nicht-modales Overlay kommt.
- **B-4 Die Begründung im Shadow DOM ist nicht per `check_usage` sichtbar**: eine Instanz des `dialogo` zählt keinen `tekstareo`; die Beschriftung prüft der Constraint (D-04), die Text-Regeln des Felds gelten für den Slot `reason` nicht (Kandidat: `field-label-names-the-datum` auf `slot:reason`).
- **B-5 Kandidaten:** `reason-help` (Hilfe am Begründungsfeld, Arkitekturo `reasonHelp`); `validity` an `markobutono`/`elekto`/`elektilo` (① B-4) — der `dialogo` sperrt über `:invalid`, das alle treffen; Vitrino-Subjekt je Rolle als Daten statt Code.
- **B-6 Figma-Stellvertreter** (D-13): Aktionen und Begründungsfeld sind Rahmen, keine Instanzen anderer Sets; `visible = false` für den Inhalt bei `reason=none` und `setBoundVariableForEffect` sind Annahmen des Doubles bis f10b-5.
- **B-8 Internacia-Test des `tekstareo` (CI-Lauf 38875656384):** die Textexpansion hängte an die Hilfe eine ununterbrechbare Tilden-Folge von der Länge des Satzes (32 Zeichen); auf dem Linux-Runner ist die Rückfallschrift (Geist ist dort nicht installiert) breiter als auf macOS, die Folge überschritt die 20 rem des Containers, und `scrollWidth > clientWidth` meldete Beschnitt. Der Test des `kampo` erweitert seit Spec 009 nach Wörtern („eine Übersetzung fügt Wörter hinzu, keine ununterbrechbare Zeichenfolge“); der Test des `tekstareo` tut es jetzt genauso (Regel 0.1: der Weg des `kampo`). Kein Befund am Ero; der lokale Lauf mit 1 von 114 rot war derselbe Test. Kandidat: Geist als Web-Schrift in der Testseite, damit beide Plattformen dieselben Metriken messen.
- **B-7 Code-Schrift der Fixture `ekzemplo`:** `ui-monospace` als erste Familie — keine Datei trägt sie; Kandidat: eine echte Mono-Schrift in der Fixture.
- **Mankoj:** keine (E1 trägt vollständig; der Schatten ist gebunden oder geschrieben, kein Werkzeugmanko gemessen).

### Offen (für den Maintainer)

- **O-6** Vorgabewort der Figma-Beschriftung (Überschrift) für die Rolle `dialog` (D-13) — bestätigen oder ersetzen; Jugxo erst danach.
- **O-7** Slot `reason` als Beschriftung der Begründung (D-04, Abweichung 3) — bestätigen; Alternative wäre ein Default-Wort im Element (fester String, Art. VIII) oder eine Erweiterung von `a11y.texts` auf Enum-Werte.
- **O-8** Der `butono` mit `emphasis=high` bestätigt (D-12, Abweichung 6) — bestätigen.
- **O-9** `wrap: allowed` beim `dialogo` (Abweichung 4) — bestätigen.
- **O-10** Goal-Wörter (D-09, Abweichung 5) — bestätigen; „Begründung“ gehört dem Feld.

O-6 bis O-10 am 16.10. bestätigt.

### Nachbesserung (Abnahme 16.10., Messung auf HEAD `2b24cf5`)

- **F-1 `dialog-title-names-the-decision` las nur das Label** (D-09): die Regel stand ohne `of`, die Prüfung las `slot:label`; `texts.heading: "Bestätigung"` galt als gültig. Fix: `of: "slot:heading"` im `content`-Eintrag, und `textOfSource` liest für einen Slot, der der Standard-Slot ist, den Text des Slots oder das Label — beide nennen denselben Slot; so bleiben die vier Jugxoj-Beispiele (mit `label`) gültig und der Standard-Slot ist überall das Label (Regel 0.2: eine Zeile, kein zweiter Weg). Rot zuerst in `data/dialogo.test.ts` und MCP `s011-eingabe`.
- **F-8 Leeres, unberührtes Pflichtfeld zeigte den Fehlerrand** (D-11, ① O-7): `#validate` schrieb `aria-invalid` sobald die Gültigkeit des Formulars `valueMissing` sagte — also sofort bei `required`, anders als `elektilo`, `elekto`, `markobutono`. Fix: die Gültigkeit des Formulars bleibt (`setValidity`, das Formular sendet nicht); `aria-invalid` und damit der Rand des Zustands `invalid` kommen erst mit der Prop `invalid`, dem gefüllten Slot `error`, nachdem die Person getippt hat (`input`) oder nachdem das Formular das Feld als ungültig gemeldet hat (`invalid`-Ereignis der Plattform am Host beim Absenden); ein Reset des Formulars nimmt die Meldung zurück. Ein getippter falscher Wert (Zahl 1,5) zeigt den Fehler weiterhin sofort (abgenommenes ①-Verhalten). Rot zuerst in `kampo.spec.ts` und `tekstareo.spec.ts` (leer/unberührt: kein `aria-invalid`, Rand wie ein Feld ohne `required`; nach `requestSubmit` beides).
- **F-5 Figma `dialogo`: „Bestätigen“ sah aus wie „Abbrechen“** (D-13, O-8): beide Stellvertreter der Aktionen trugen die Fläche des Dialogs. Fix: der Plan trägt je Stellvertreter ein Feld `composed` (Ero, Props, Bindungen), der letzte Stellvertreter („Bestätigen“, die Reihenfolge von `VITRINO_DIALOG_ACTIONS`) ist der `butono` mit `emphasis=high`, `intent=neutral`, `state=rest`: Füllung → `color.action.primary.rest`, Wortfarbe → `color.action.primary.text`, Radius → `radius.role.control`, gelesen aus dem `butono`-Skemo des Modelo (keine Figma-Instanz: das Plugin komponiert noch keine Sets, B-6); Rahmen (`color.border.default`), Innenabstand und Typografie des Dialogs bleiben; „Abbrechen“ unverändert; gilt in allen sechs Varianten und auf dem Beispielrahmen. Die `composed`-Bindungen liegen außerhalb von `variants[].bindings` und damit außerhalb des Paritäts-Inventars (ein Test sichert das). Annahmen: der Rahmen des Stellvertreters bleibt der des Dialogs (der `butono` hätte `color.action.primary.rest` als Rand); echte Instanzen bleiben Kandidat. Rot zuerst (2 von 277), 488 grün, `check:parity` 0 Differenzen.

### Messungen

In [`tasks.md`](tasks.md) ②.

## ③ Rückmeldung

**Branch:** `261015-spec-011-rueckmeldung-e137d7` (gestapelt auf ② @ `d7ec115`, PR #64) · **Datum:** 2026-10-16 · **Aufgaben, Commits und rote Hashes:** [`tasks.md`](tasks.md) ③ · **Namen (E4) am 16.10. bestätigt:** `insigno`, `avizo`, `plenstato`.

Die drei Eroj der Rückmeldung: das Statusetikett, der Hinweis und der Lade- und Leerzustand. Keines wird bedient, außer dem Schließen des Hinweises, das ein komponierter `butono` ist; alle drei haben als Zustand nur `rest` (G2). Sie sind die ersten Eroj ohne Formular-Semantik: ein statischer Text (`span` ohne Rolle) und zwei Live-Regionen (`status`, `alert`). Was eine Person hört, steht im Inhalt, nie in einer Beschreibung: die Art eines Hinweises („Fehler:“) und „lädt“ sind `a11y.texts`, die an einen Wert einer Enum-Prop gebunden sind (D-07). Jede Entscheidung unten nennt ihre Stufe.

### Zusammenfassung

1. **Modelo:** `data/eroj/insigno/{skemo,uzo}.json`, `data/eroj/avizo/{skemo,uzo}.json`, `data/eroj/plenstato/{skemo,uzo}.json`; Reguloj `badge-text-short` (anpassbar, `max-words`, neu) und `empty-state-says-what-next` (anpassbar, `min-words`, nur `kind=empty`, neu); `error-says-what-to-do` → `avizo` mit `intent=danger` (`when.props`), `one-primary-per-container` → Aktionen des `avizo`, `spacing-owned-by-container` → alle drei (E5); 12 Jugxoj (drei Regeln × approved/rejected × de/en); 4 KontrastParoj (`color.text.default` auf `color.status.*.weak`, gemessen ≥ 11,4:1, kein Befund); `dialogo.instead.inform-only` → `use-instead: avizo` (das `null` aus ② ist geschlossen), `butono.instead.area-loading` → `plenstato` (Kialos des `butono` gekürzt, brief 748, O-12-Muster, B-1); Ontologio `#Insigno`, `#Avizo`, `#Plenstato`. Kein neues Token.
2. **Schema (additiv):** Teil-Eigenschaft `stroke` (D-04), `SkemoSlot.hidden` (D-05), Prüfart `max-words` und `UzoContent.when.props` (D-06); Regel `skemo-a11y-invalid` erlaubt Schlüssel `<prop>-<wert>` einer Enum-Prop (D-07).
3. **Projekcioj:** Web Components `fm-insigno` (D-08), `fm-avizo` (D-09), `fm-plenstato` (D-10), React `Insigno`/`Avizo`/`Plenstato` (D-11), Make-Kit `components/{insigno,avizo,plenstato}.md` und drei Guidelines-Sätze (D-12), Vitrino-Abschnitte (D-13), Figma-Sets (D-14), Alirebleco, Internacia, MCP (zwölf Eroj, die Rückmeldungen der Spec als Test, D-15), Fixtures rot zuerst (D-16). Parität für zwölf Eroj.

### Entwurfsentscheidungen

#### D-01 `insigno`: `intent` × `size`, Pille, Text nie Farbe allein (Abschnitt ③, G1, G2, G4)

Props `intent` (neutral|info|success|warning|danger, neutral; keine Stufe `brand`, G1) und `size` (small|medium, medium); `states: ["rest"]`; Slots `label` (Standard, Pflicht) und **`description`** (`text`, **`hidden`**, D-05: die lange Fassung für Screenreader, nie `title`). Teile: `surface.fill by [intent]` (neutral → `color.background.sunken`, sonst `color.status.<intent>.subtle`), `border.color by [intent]` (neutral → `color.border.default`, sonst `color.status.<intent>.border`) mit `border.width.default` (die Spec nennt `border.subtle`: das zusammengesetzte Token ist Farbe `color.border.subtle` + Breite `border.width.default` + `stroke.solid`; der Rand des Etiketts braucht die Statusfarbe, also sind Farbe und Breite getrennt gebunden), `text.color by [intent]` (neutral → `color.text.subtle`, sonst `color.status.<intent>.text`), `text.typography` `typography.label.2`, `box.radius` `radius.role.pill`, **`box.height by [size]`** (small → `size.icon.medium` 20 px, medium → `size.icon.large` 24 px) und `box.inline-padding by [size]` (`spacing.xsmall`|`spacing.small`). Die Höhe ist ein **Minimum**: die Web-Celo schreibt `box.height` seit Spec 009 als `min-block-size`, der Text darf das Etikett wachsen lassen (Abweichung 1: die Spec sagt „keine feste Höhe“, G1 verlangt für `size` eine sichtbare Wirkung; ohne Höhe hätte `size` nur den Innenabstand). Für die Höhe eines Etiketts gibt es keine Rolle im Vortaro; `size.icon.*` ist die nächstliegende Skala (G3, Befund B-2). Alle Paare Text/Fläche sind deklariert (fünf, alle schon da). `a11y`: **Rolle `generic`** (Abweichung 2: die Spec sagt „kein Rollenattribut“; das Schema verlangt eine Rolle, `generic` ist die eigene Rolle eines `span` nach ARIA 1.2, die Web-Celo schreibt kein Attribut), `name: ["slot:label"]`, keine Taste. Goal `status-label` (badge, tag, status, chip / Badge, Etikett, Status, Kennzeichnung) mit Regulo `badge-text-short`; „label“ aus der Spec ist nicht dabei (Abweichung 3: das Wort gehört den Feldern).

#### D-02 `avizo`: `intent` ohne neutral, `dismissible`, die Art als Wort (Abschnitt ③, G2, G4)

Props `intent` (info|success|warning|danger, info; kein neutral: ein Hinweis ohne Art ist Text) und `dismissible` (bool); `states: ["rest"]` (Hover und Fokus liegen beim komponierten Schließen-`butono`). Slots **`heading`** (`title` ist ein Web-Begriff, wie beim `dialogo` ② D-03), **`message`** (Standard, Pflicht), `details` (Text-Einträge, z. B. Validierungsfehler mit Pfad), `actions` (`butono`, `ligilo`, höchstens zwei, einer `emphasis=high`). Teile: `surface.fill by [intent]` (`color.status.<intent>.weak`), **`accent`** (`color by [intent]` → `color.status.<intent>.border`, `width` `border.width.strong`: die Linie an der Startkante, logisch, Internacia), `heading` (`color.text.default`, **`typography.label.1`** — die Spec nennt `font.weight.semibold`; eine Textrolle in Fließtextgröße mit Semibold gibt es nicht, `label.1` ist die nächstliegende Rolle in Medium, Befund B-3), `message` (`color.text.default`, `typography.body.1`), `details` (`color.text.default`, `typography.caption`), `actions.gap`, **`dismiss.size`** (`size.control.small`: die Fläche des Schließen-Knopfs, nie unter `size.target.min`), `box` (`inline-padding` `spacing.medium`, `gap` `spacing.small`, `radius` `radius.role.surface` wie der Arkitekturo-Hinweis). Vier neue KontrastParoj `text-default-on-status-<intent>-weak` (≥ 11,4:1). `a11y`: Rolle `status`, **`name: ["slot:message"]`** (Abweichung 5: Überschrift und Nachricht als zwei Quellen nennt `uzo-slot-required-missing` als „Name aus einem Slot allein, der nicht Pflicht ist“; die Nachricht ist die eine Pflicht, die Überschrift Zusatz), `texts`: `dismissible` („Schließen“/„Close“, der Name des Knopfs, G4) und **`intent-info|success|warning|danger`** („Hinweis:“, „Erfolg:“, „Warnung:“, „Fehler:“ / „Note:“, „Success:“, „Warning:“, „Error:“) — die Art als verborgenes Wort, nie nur Farbe (D-07). Goals **`notify`** (notice, alert, message, warning, banner / Hinweis, Meldung, Warnung, Erfolgsmeldung) und **`report-error`** (error, failed, failure / Fehler, fehlgeschlagen, Fehlermeldung) mit `props {intent: danger}` und Regulo `error-says-what-to-do` (Abweichung 6: die Spec nennt ein Goal; das zweite trägt die Props und die Regulo, damit `suggest_ero` „Fehlermeldung“ mit `intent=danger` beantwortet und die Regel zitiert).

#### D-03 `plenstato`: `kind` als Pflicht ohne Default, Rand nur leer, Indikator nur ladend (Abschnitt ③, G2, G4)

Eine Prop **`kind`** (loading|empty, `required: true`, **kein Default**: die Spec sagt Pflicht, R-10 macht `required` zur Pflicht im `brief`; das Element fällt auf den ersten Wert zurück und warnt, D-10); `states: ["rest"]`; Slots `text` (Standard, Pflicht) und `actions` (`butono`, nur bei `empty`: Constraint `when { slot:actions: filled } allowed { kind: [empty] }`). Teile: `surface.radius` (`radius.role.surface`; **kein `fill`**: der Text steht auf dem Grund des Containers, kein Paar nötig, G3), `border` (`color.border.subtle`, `border.width.default`, **`stroke by [kind]`**: empty → `stroke.dashed`, loading → `none`, D-04), **`indicator`** (`size` `size.icon.small`, `color by [kind]`: loading → **`color.status.info.basic`**, empty → `none` — nicht `color.brand.fill` wie in der Spec: eine Füllrolle steht nicht auf der Seite, in `ekzemplo light` misst der Indikator in Markenfarbe 1,2:1 und 1,4:1 gegen `color.background.default`; `color.status.info.basic` ist das deklarierte Paar `status-info-basic-on-background-default` (ui, min. 4,69:1 in allen 72 Kombinationen) und sagt „etwas geschieht“ — Abweichung 12, Befund B-9), `text` (`color.text.muted`, `typography.body.1`), `actions.gap`, **`motion`** (`motion.duration.slow`, `motion.easing.standard`), `box` (`inline-padding` `spacing.large`, `gap` `spacing.small`). So schlüsselt `kind` zwei Teile und ist Achse der Varianten (2 × 1). `a11y`: Rolle `status`, `name: ["slot:text"]`, `texts`: **`kind-loading`** („lädt“/„loading“, G4). Goals `loading` (loading, spinner, wait, busy / lädt, Ladeanzeige, warten, laden; `kind=loading`) und `empty` (empty, nothing / leer, Treffer, nichts, Leerzustand; `kind=empty`, Regulo `empty-state-says-what-next`). Uzo: `button-busy` → `butono` (submitting / Knopf, sendet; „button“ ist kein Stichwort, Abweichung 7: es träfe jeden Satz mit „Button“, etwa den Schalter-Dialog der Spec 010), `progress-known` → null, Grenze `skeleton`; komponiert in `tabelo` (④) und `page-section`, mit `butono`.

#### D-04 Teil-Eigenschaft `stroke` (Regel 0.2)

Der Rand des Leerzustands ist gestrichelt (`stroke.dashed`), beim Laden gibt es keinen; `border.width` kann nicht `none` sein (ein ungeschriebener Rand wäre der mittlere der Plattform). Kleinste Form: eine Teil-Eigenschaft **`stroke`**, die ein `stroke.*`-Token (G3: `stroke.solid|dashed` sind da) oder `none` bindet. Web-Celo: `border-style: var(--fm-stroke-dashed)`, `none` → `border-style: none`; eine Bauform mit `stroke` setzt in der Struktur kein `border-style: solid`. Figma: `dashPattern` (D-14). Schema `SkemoPartProperty` += `stroke`; Typen regeneriert.

#### D-05 `SkemoSlot.hidden` (Regel 0.2)

Die lange Fassung eines Etiketts ist Text für Screenreader, der nicht zu sehen ist (G4: nie nur `title`). Sichtbarer Text kommt aus Slots (Art. VIII); ein Slot-Flag **`hidden`** sagt, dass der Slot im Inhalt ist, aber nicht gezeigt wird. `skemo-kontrastparo-missing` paart ihn nicht (er hat keinen Teil mit Farbe). Web: `clip-path: inset(50%)` statt der 1-px-Box (ein Größenliteral wäre verboten; `clip-path` ist Struktur, `STRUCTURAL_PROPERTIES` 23 → 26 mit `text-align` und `border-inline-start-style`). Figma: nicht gezeichnet (kein Teil).

#### D-06 Text-Regeln: `max-words`, `when.props`, zwei neue Reguloj (G6, E5, Regel 0.2)

`badge-text-short` (anpassbar) prüft die Beschriftung des `insigno` mit der neuen Prüfart **`max-words`** (3), wie G6 sie nennt; `empty-state-says-what-next` (anpassbar) prüft den Text des `plenstato` mit `min-words` (3) nur für `kind=empty`; `error-says-what-to-do` gilt für die Nachricht des `avizo` nur bei `intent=danger`. „Nur bei einem Prop-Wert“ konnte `UzoContent.when` nicht sagen: `when.goal` liest das Goal einer Instanz aus den Wörtern ihrer Beschriftung — eine Fehlermeldung ohne Stichwort wäre nie geprüft worden. Kleinste Form: **`when.props`** (`{ intent: ["danger"] }`), gelesen aus der Instanz, sonst aus dem Default der Skemo; `when.goal` bleibt. Je Regel vier Jugxoj (approved/rejected × de/en); die Beispiele werden mit `evaluateUsage` nachgeprüft (Test).

#### D-07 `a11y.texts` mit Schlüssel `<prop>-<wert>` (G4, Regel 0.2)

Die Art eines Hinweises steht als visuell verborgenes Wort im Inhalt („Fehler:“), damit sie nie nur Farbe ist; „lädt“ ebenso. `a11y.texts` war an boolesche Props gebunden. Kleinste Form: ein Schlüssel **`<prop>-<wert>`** einer Enum-Prop (`intent-danger`, `kind-loading`) — er passt in das Namensmuster, das Schema ändert sich nicht, die Regel `skemo-a11y-invalid` erlaubt ihn; `valuedTexts(skemo)` liest ihn für die Celoj. Web: die Texte der aktuellen Werte stehen in `#fm-texts` **im Inhalt** (geclippt, nicht `hidden`), ohne `aria-describedby` — eine Live-Region spricht ihren Inhalt, eine Beschreibung spräche sie nicht; der Text einer booleschen Prop (`dismissible`) benennt den Schließen-Knopf und wird nicht gesprochen. Bei allen anderen Hosts bleibt es beim bisherigen Weg (Beschreibung).

#### D-08 Web Component `fm-insigno` (Art. XI)

`HostControl` += **`text`**: `hostOf("generic")`. Markup `<span part="control"><slot></slot><span part="description" class="fm-hidden"><slot name="description"></slot></span><span id="fm-texts" hidden></span></span>` — kein Rollenattribut, keine Tastatur, kein Cursor, keine Transition; `formAssociated = false`. Stylesheet: Host `inline-block`, Kontrolle `inline-flex`, `white-space: nowrap` (Uzo `wrap: never`), `.fm-hidden` (D-05); jeder Teil liegt auf der Kontrolle (`surface`, `border`, `text`, `box`), `min-block-size` aus `box.height`. Inventar: `intent`, `size`, ein Zustand `rest`.

#### D-09 Web Component `fm-avizo` (Art. XI; G4)

`HostControl` += **`status`**: `hostOf("status")`. Markup `<div part="control" role="status"><span id="fm-texts" class="fm-hidden"></span><div><span part="heading" hidden>…<span part="message">…<div part="details" hidden>…<div part="actions" hidden>…</div><fm-butono part="dismiss" emphasis="low" size="small" hidden>×</fm-butono></div>`: Überschrift, Einzelheiten und Aktionen zeigen sich, solange sie Inhalt haben (`#filled`, bei jedem `slotchange`); die Rolle folgt `intent` (`danger` → `alert`, G4, Celo-Wissen); der Schließen-Knopf ist ein komponierter `butono` mit dem Kreuz als dekorativem Icon und `label` aus `a11y.texts.dismissible` in der Sprache des Dokuments, sichtbar nur mit `dismissible`. **`dismiss`** ist `cancelable`; nicht verhindert, setzt sich der Hinweis `hidden` (`:host([hidden]) { display: none; }`, weil `:host` sonst das UA-`hidden` schlägt) und gibt den Fokus weiter. **Fokusregel (G4 „der Plan nennt die Regel“):** an das nächste fokussierbare Element der Seite in Dokumentreihenfolge nach dem Hinweis, sonst an das letzte davor; fokussierbar sind native Steuerelemente, `[tabindex]` und jedes benutzerdefinierte Element (`delegatesFocus`), nicht `disabled`, nicht in `[hidden]`. Stylesheet: Host `block` (Uzo `size: container`), Kontrolle eine Zeile mit `border-inline-start-style: solid` (Struktur) — `accent.color`/`width` werden `border-inline-start-color`/`-width` (Celo-Wissen, spiegelt mit der Schreibrichtung) —, `box.inline-padding` als `padding` auf allen Seiten (wie beim Dialog), die Spalte der Texte `flex: 1`, jeder Text `margin: 0; overflow-wrap: anywhere` (O-8). Inventar: `intent`, ein Zustand `rest`.

#### D-10 Web Component `fm-plenstato` (Art. XI; G4, `motion-reduced-instant`)

Host `status`. Markup wie der Hinweis, davor `<span part="indicator" aria-hidden="true">` mit einem Dreiviertelkreis als Vektor (`M8 2a6 6 0 1 1-6 6`, Strich in der aktuellen Farbe, wie die Zeichen der Toggles). Render: `aria-busy` folgt `kind`; `kind` fehlt → Warnung und erster Wert (`loading`); ein Constraint mit Slot-Schlüssel wird im Element gelesen (`slot:actions` belegt bei `loading` → Warnung; die Werte von `when` werden nur für Props zurückgesetzt, D-06 des `dialogo` las bisher keine Slots). **Bewegung:** der Indikator dreht sich über die Web Animations API — Dauer und Easing liest das Element aus `transition-duration`/`transition-timing-function` der Kontrolle, die das Stylesheet aus `motion.duration.slow` und `motion.easing.standard` schreibt (eine Umdrehung je Dauer, endlos); unter `motion=reduced` ist die Dauer 0 und nichts dreht sich (`motion-reduced-instant` gilt ohne Sonderfall). Kein `@keyframes`: das hätte `transform`, `animation-name` und `animation-iteration-count` in die Strukturliste und `animation-duration` in die Design-Liste gebracht und den Inventar-Parser um verschachtelte Blöcke; die Tokens bleiben die Quelle (Abweichung 8). Der Indikator ist bei `empty` nicht gezeichnet: eine Regel `[data-kind="empty"] [part="indicator"] { display: none; }` aus den `none`-Bindungen der Skemo, **nach** den Token-Regeln, damit das Inventar die Werte von `kind` in der Reihenfolge der Skemo liest. Struktur: zentriert (`justify-content`, `text-align: center`), `border-style` kommt aus `stroke` (D-04). Inventar: `kind`, ein Zustand `rest`.

#### D-11 React

`Insigno`, `Avizo`, `Plenstato` aus der React-Celo wie jedes Ero (Props aus der Skemo, Slots als Kinder mit `slot`); Typtests `types/insigno.tsx`, `types/avizo.tsx`, `types/plenstato.tsx` (kein `brand`, kein `neutral` am Hinweis, `kind` nur loading|empty, Beschriftung nie als Prop).

#### D-12 Make Kit

`components/insigno.md`, `components/avizo.md`, `components/plenstato.md` generiert. `Guidelines.md`, je Satz aus der Rolle (und der Prop, die die Bauform unterscheidet): „Every status in one to three words next to what it describes (draft, in review, 3 violations) is an `<Insigno>`; a sentence is an `<Avizo>`.“ (Rolle generic), „Every message in the flow of the page about what happened or what to watch for (saved, could not save) is an `<Avizo>`; never a toast, and what needs a decision is a `<Dialogo>`.“ (Rolle status mit `intent`), „Every area whose content loads or is empty shows a `<Plenstato>` with a text; never a bare spinner, and a working button is the `<Butono>`'s own loading.“ (Rolle status mit `kind`). Der Arkitekturo-Vertrag (G8, 101 Variablen) bleibt grün.

#### D-13 Vitrino

Slot-Wörter `heading` „Überschrift“, `details` „Einzelheit“, `description` „Beschreibung“ (eine Quelle für Vitrino und Figma, F-5). `insigno`: Zeilen `intent × size` (10), eine Spalte `rest`; `avizo`: Zeilen `intent` (4), Spalten `rest` und `dismissible` (boolesche Prop mit a11y-Text); `plenstato`: Zeilen `kind` (2), keine Aktionen (der Constraint). Layout-Satz: das Subjekt einer Live-Region ist „Text“ („Größe aus dem Container, Text darf umbrechen“), das Etikett „Label bricht nie um“.

#### D-14 Figma: Bauformen `badge`, `notice`, `state` (G7, F-8; Regel 0.1/0.2)

`FigmaStructure` += `badge | notice | state`; `structureOf(role, parts)`: `generic` → `badge`, `status` → `state`, wenn die Skemo den Teil `indicator` hat, sonst `notice` (die Rolle allein unterscheidet `avizo` und `plenstato` nicht). **`badge`**: die Pille (Füllung, Rand, Radius, `box.height` als Mindesthöhe, Innenabstand) mit einem Textknoten als Beschriftungs-Eigenschaft; `labelPartOf(skemo)` findet den Teil des Standard-Slots (`message`, `text`, `heading`, `label`) und fällt auf `text` zurück, so wird `text.color` des Etiketts gezeichnet und steht im Inventar (die Freigabe `FIGMA_NOT_DRAWN.text` gilt dem getippten Text eines Feldes, nicht der Beschriftung). **`notice`**: die Fläche als Zeile (Füllung, Radius, `box.inline-padding` auf vier Seiten, `box.gap`), der Akzent als gebundene Strichstärke **links** (`strokeLeftWeight`; Figma kennt keine Schreibrichtung — Annahme, B-8), eine Spalte Überschrift/Nachricht (Beschriftungs-Eigenschaft)/Einzelheiten mit den Vitrino-Wörtern, Rahmen für Aktionen und Schließen (`dismiss.size`); **`dismissible`** ist eine BOOLEAN-Eigenschaft des Sets, verbunden mit der Sichtbarkeit des Schließen-Rahmens (`BOOLEAN_TOGGLES`, nur wo Prop und Teil zusammen vorkommen und die Prop keine Achse ist). **`state`**: der Bogen als Vektor aus demselben Pfad wie das Web (`M8 2a6 6 0 1 1-6 6`, `createNodeFromSvg`), `indicator.color` an seine Striche gebunden, der Rahmen unsichtbar, wo die Farbe `none` ist (bestehender Mechanismus `hidden`); der Aktionen-Rahmen aus dem Constraint `slot:actions filled ⇒ kind empty` bei `loading` verborgen (`forbiddenPartsOf`, generisch für Nicht-Text-Slots). **`stroke`** (D-04): `border.stroke` bindet die STRING-Variable `stroke/dashed`; `dashed` schreibt ein `dashPattern` von **3 × Strichbreite** an und aus (`DASH_IN_WIDTHS = 3`, einmal benannt: Chromium zeichnet einen dünnen gestrichelten Rand ungefähr so; eine Zahl, kein Token, wie die Unterstreichung ② B-1 — Annahme zur Bestätigung, O-11), `none` lässt die Randfarbe gebunden und den Strich unsichtbar. Der verborgene Slot `description` wird nicht gezeichnet (`slotWordsOf` filtert `hidden`). `motion` wie beim `butono` (Variablen gebunden, nichts gezeichnet, nicht im Inventar). Vorgabewörter der Beschriftung **„Status“** (Rolle generic), **„Meldung“** (Rolle status) und **„Zustand“** (Bauform `state`, `STRUCTURE_LABEL_DEFAULTS` vor der Rolle) — alle drei zur Bestätigung, kein Jugxo (O-11). Bestehende Tests schlagen den `butono` nach Namen nach (`avizo` steht jetzt zuerst), nicht geschwächt. Rot zuerst im Durchgang: 27 von 293, dann 293 grün; `check:parity` 12 Eroj, 0 Differenzen, 429 Freigaben (keine neue).

#### D-15 Alirebleco, Internacia, MCP

Alirebleco (Eroj, Chromium, beide Aspektoj × Schema × Kontrast): `insigno` axe auf 10 Kombinationen, Text ≥ 4,5:1 auf dem Etikett, Rand ≥ 3:1 auf der Seite; `avizo` axe (`status`, ein `alert`) auf vier `intent` mit Überschrift, Einzelheiten, Aktion und Schließen, Überschrift und Nachricht ≥ 4,5:1, Akzent ≥ 3:1 auf der Fläche, Fokusring des Schließen-Knopfs ≥ 3:1; `plenstato` axe auf beiden `kind`, Text ≥ 4,5:1, Indikator ≥ 3:1 auf der Seite. Internacia: `avizo` rtl (Akzent rechts, Schließen links) und Textexpansion nach Wörtern (135/200 %), `insigno` Expansion (eine Zeile, breiter, nichts beschnitten), `plenstato` rtl (Indikator rechts vom Text). MCP: `s011-rueckmeldung.test.ts` (die Rückmeldungen der Spec: „Badge für den Status Entwurf“, „Hinweis: gespeichert“ → `avizo`, „eine Meldung, die eine Entscheidung verlangt“ → `dialogo`, „Ladeanzeige für die Standards“, „der Knopf sendet gerade“ → `butono`, „ein Toast unten rechts“; `check_usage` der drei Regeln; `list_eroj` zwölf, `brief` je Ero).

#### D-16 Rot zuerst

Fixtures (je `expected-issues.json`), auf das Vortaro der Fixture getrimmt wie der `dialogo` (② D-17): `insigno-label-slot-optional`, `insigno-web-term` (Prop `tabindex`), `insigno-instead-kialo-missing`, `avizo-message-slot-optional`, `avizo-web-term` (Prop `onclick`), `avizo-instead-kialo-missing`, `plenstato-text-slot-optional`, `plenstato-web-term` (Prop `class`), `plenstato-instead-kialo-missing`. Rot ohne Mutation: `data/insigno.test.ts`, `data/avizo.test.ts`, `data/plenstato.test.ts`, Schema-Tests, die Listen auf zwölf Eroj, MCP (`e655fec`: 69 von 178 in neun Dateien); Projekcioj-Tests (`29cbe9a`: 11 von 166); Doku (`07b9fc6`: 2 von 159).

### Arkitekturo-Abdeckung (E11)

| Kandidat | braucht | trägt | offen |
|---|---|---|---|
| `ark-badge` (`badge(text, { tone, description })`, Varianten `stateBadge`, `mandatoryBadge`, `conformanceBadge`, `severityBadge`, `findingStateBadge`, `oversizedBadge`, `agentBadge`) | kurzes Etikett in fünf Tönen plus `brand`, lange Fassung für Screenreader | `insigno`: `intent` (fünf Werte), `size`, Slot `description` (verborgen, D-05) | `tone: brand` ist die Grenze `brand-badge` (ask-human, G1); die Varianten sind Aufrufe der Anwendung |
| `ark-notice` (`notice({ kind, title?, message?, problem?, onDismiss? })`, `actions`) | Info/Erfolg/Warnung/Fehler im Seitenfluss, Problem-Details mit Pfad, `role=alert` bei Fehler, Schließen als Kit-Button, Aktionen vor dem Schließen | `avizo`: `intent`, Slots `heading`/`message`/`details`/`actions`, `dismissible` mit komponiertem `butono`, `dismiss`-Ereignis, Rolle `alert` bei `danger` | `problem` (Problem-Details der API) ist die Liste im Slot `details`; der Hinweisbereich der Shell (`aria-live` auf der Seite) bleibt Anwendung (Grenze `stacked-notices`) |
| `ark-state` (`loadingState(text?)`, `emptyState(text?, ...extra)`) | Laden mit `role=status` und `aria-busy`, Animation aus `--fm-motion-duration-slow`, Leerzustand mit Text und Extras | `plenstato`: `kind`, `aria-busy`, Indikator aus den Bewegungsrollen, Slot `actions` bei `empty` | `opacity.disabled` des Kandidaten ist nicht gebunden (der Text ist `color.text.muted`); `...extra` jenseits von `butono` ist Komposition der Anwendung |
| `openFormDialog` → `problems` (② offen) | Fehler im Formulardialog | `avizo` im `content` des `dialogo` (Uzo `composes.containers: dialog`) | – |

### Abweichungen von der Spec

1. **`box.height` als Minimum beim `insigno`** (D-01): die Spec sagt „keine feste Höhe“; die Höhe ist `min-block-size`, der Text wächst darüber hinaus, `size` wirkt sichtbar (G1).
2. **Rolle `generic` statt „kein Rollenattribut“** (D-01): das Schema verlangt eine Rolle; das Element schreibt keine.
3. **Goal-Wort „label“ fehlt beim `insigno`** (D-01): es gehört den Feld-Reguloj.
4. **`heading.typography` `label.1` statt `font.weight.semibold`** (D-02, B-3).
5. **`a11y.name` des `avizo` ist die Nachricht allein** (D-02): zwei Quellen scheitern an `uzo-slot-required-missing`.
6. **Zwei Goals beim `avizo`** (`notify`, `report-error`) statt eines (D-02).
7. **„button“ ist kein Stichwort von `button-busy`** (D-03): es träfe jeden Satz mit „Button“.
8. **Bewegung über die Web Animations API statt `@keyframes`** (D-10).
9. **`name: ["slot:message"]`, Überschrift optional; `details` nimmt Text-Einträge** (D-02): die Spec nennt „Liste“; die Liste ist das Markup der Anwendung (`<ul slot="details">`).
10. **Slot und Teil heißen `heading`, nicht `title`** (D-02; wie ② Abweichung 2).
11. **Zusätzlich:** `avizo.instead.one-word-status` und `insigno.instead.sentence` nennen die Goal-Wörter des jeweils anderen (Spec 008 D-08); `dialogo.instead.inform-only` → `avizo` schließt das `null` aus ②; `butono.instead.area-loading` → `plenstato` (G5 „↔“ in beide Richtungen).
12. **Indikator in `color.status.info.basic`, nicht `color.brand.fill`** (D-03, B-9): gemessen, kein Token geändert, keine Grenze gesenkt.

### Befunde / Mankoj

- **B-1 `brief` des `butono` 748** (Grenze 750; vor ③ 749): der Eintrag `area-loading` verlangte das O-12-Muster — fünf `instead`- und zwei `boundary`-Kialos des `butono` gekürzt (Sinn erhalten, Prüfungen auf Wortlaut grün). Der nächste Eintrag am `butono` braucht einen Weg, der nicht kürzt: Kandidat für Vojmapo Phase 6 (der `brief` ohne Kialos der Grenzen, die `get_ero` voll liefert). `insigno` 503, `avizo` 411, `plenstato` 287, `kampo` 743.
- **B-2 Keine Rolle für die Höhe eines Etiketts** (D-01): `size.icon.medium|large` als nächstliegende Skala (G3); Kandidat `size.badge.*` oder `size.control.xsmall` für Spec 012.
- **B-3 Keine Textrolle in Fließtextgröße mit Semibold** (D-02): `typography.label.1` (Medium); die Arkitekturo-Notiz nutzte `font.weight.semibold` einzeln. Kandidat: `typography.label.strong` oder eine Rolle „Überschrift einer Meldung“.
- **B-4 `check_usage` kennt keine Regel für eine fehlende Pflicht-Prop** (`kind` ohne Wert, D-03): der `brief` nennt die Pflicht (R-10), das Element warnt, die Prüfung schweigt. Kandidat: `ero-prop-required`.
- **B-5 `uzo-slot-required-missing` kennt nur eine Quelle des Namens** (D-02): „Überschrift, sonst Nachricht“ ist nicht ausdrückbar. Kandidat: die Regel prüft, ob mindestens eine Quelle Pflicht ist.
- **B-6 Stichwort-Kollision „gestapelt“** (`avizo.boundary.stacked-notices`, `dialogo.boundary.nested-dialog`): die erste Grenze in Ero-Reihenfolge gewinnt (`avizo` vor `dialogo`); dasselbe Wort in zwei Uzoj hängt an der Sortierung. Kandidat: `suggest_ero` meldet zwei Grenzen als ask-human wie zwei Goals (OP-12).
- **B-7 Easing aus `getComputedStyle`** (D-10): `transition-timing-function` liefert eine Liste; ein Schnitt am Komma zerreißt `cubic-bezier(…)` — der erste Lauf des Vitrino-Checks zeigte den `TypeError`, das Element liest jetzt die erste Funktion ganz. Kein Befund am Modelo.
- **B-9 `color.brand.fill` als Vordergrund** (D-03): der Alirebleco-Check der Eroj maß den Indikator in Markenfarbe auf `color.background.default` in `ekzemplo light/default` mit 1,18:1 und in `ekzemplo light/high` mit 1,42:1 (Grenze 3:1 für ein grafisches Element, WCAG 1.4.11); in `komuna` und in `ekzemplo dark` lag er über 3:1. Die Rolle `color.brand.fill` ist eine Fläche, auf der `color.brand.text` steht (Paar `brand-text-on-brand-fill` ≥ 8,8:1), keine Linie auf der Seite; ein Aspekto mit heller Marke macht sie unsichtbar. Kein Token geändert (Regel 0.3), keine Grenze gesenkt (0.4): die Bindung ist `color.status.info.basic` (Abweichung 12). Kandidat für Spec 012: eine Rolle `color.brand.accent` (die Marke als Linie, mit Paar auf den Hintergründen), die Arkitekturo für Reiter und Indikator nutzt (`--fm-color-brand-fill` in `ark-tabs`, `ark-state`).
- **B-8 Figma-Annahmen des Doubles** (D-14, bis f10b-5 gemessen): das `dashPattern` 3 × Breite, die seitenweise Strichstärke (`strokeLeftWeight`, links statt Startkante), die Verbindung BOOLEAN → `visible`, „ein verborgenes Auto-Layout-Kind nimmt keinen Platz“; beim zweiten Lauf in echtem Figma kann `strokeWeight: 0` neben gebundenem `strokeLeftWeight` als `figma.mixed` gelesen und neu geschrieben werden. Aktionen, Schließen-Knopf und Einzelheiten sind Rahmen und Textknoten, keine Instanzen anderer Sets (wie ② B-6); `STATE_SIGN` dupliziert den Pfad `ARC_PATH` der Web-Celo (Kandidat: ein gemeinsamer Export).

### Offen (für den Maintainer)

- **O-11** Vorgabewörter der Figma-Beschriftung „Status“ (`generic`), „Meldung“ (`status`), „Zustand“ (Bauform `state`) — bestätigen oder ersetzen; Jugxo erst danach.
- **O-12** Rolle `generic` für das Etikett (Abweichung 2) — bestätigen; Alternative: das Schema erlaubt eine Skemo ohne Rolle (Änderung an `SkemoA11y`).
- **O-13** `heading.typography` `label.1` (Abweichung 4, B-3) — bestätigen oder eine Rolle anlegen (Spec 012).
- **O-14** Fokusregel nach dem Schließen (D-09) — bestätigen.
- **O-15** `kind` ohne Default (D-03, R-10) — bestätigen; Alternative `default: "loading"`.
- **O-16** Zwei Goals am `avizo` (Abweichung 6) und das Stichwort „button“ (Abweichung 7) — bestätigen.
- **O-17** Indikator in `color.status.info.basic` statt `color.brand.fill` (Abweichung 12, B-9) — bestätigen; Alternative: eine Rolle `color.brand.accent` in Spec 012, dann bindet der Indikator sie.

### Nachbesserung (Abnahme 16.10., Messung auf HEAD `2b24cf5`)

- **F-4 Figma `avizo`: feste Höhe, Leerraum unter dem Inhalt** (D-14): alle Rahmen des Hinweises waren HUG; der Leerraum kam vom leeren Platzhalter `actions` am Ende der Textspalte — ein Auto-Layout-Rahmen ohne Kinder behält in Figma seine Anlagegröße (100 × 100 von `createFrame`), auch mit HUG; die Spalte nahm die 100 px auf. Das Double modellierte einen leeren Hug-Rahmen als 0 × 0 und verdeckte den Befund. Fix: `shrinkEmpty` bringt einen leeren Platzhalter vor dem Layout auf die kleinste Größe (0,01, Figmas Minimum), in `drawNotice` und `drawState` (derselbe Platzhalter beim `plenstato`); das Double behält die Größe leerer Rahmen und modelliert `resize`. Nicht ausgeblendet, weil `visible` beim `plenstato` den Constraint „keine Aktionen beim Laden“ trägt. Rest: ein `spacing.small`-Abstand vor dem Platzhalter bleibt, bis jemand ihn füllt oder ausblendet. Annahmen bis f10b-5 (B-6): Figma behält die Größe leerer Hug-Rahmen; `resize` fixiert die Achsen, das danach geschriebene `layoutSizing* HUG` stellt Hug wieder her. Rot zuerst (1 von 4), 524 grün, `check:parity` 0 Differenzen.

### Messungen

In [`tasks.md`](tasks.md) ③.

## ④ Daten

Folgt in PR ④.

## ⑤ Navigation

Folgt in PR ⑤.
