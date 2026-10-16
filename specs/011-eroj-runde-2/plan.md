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

Folgt in PR ②.

## ③ Rückmeldung

Folgt in PR ③.

## ④ Daten

Folgt in PR ④.

## ⑤ Navigation

Folgt in PR ⑤.
