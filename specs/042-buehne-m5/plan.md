# Spec 042 – Bühne lädt sich neu, M5 Stil-Neuberechnung (Nachlauf 041) – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `a8480d42f7cb2bc23d9c81a7da1bdff174254b925653372571a3a337a2b86878`) · **Aufgaben:** [`tasks.md`](tasks.md) · **Basis:** `main` `e4873c57` (Merge #148; enthält #147 und Spec 041) · **Regel 0** gilt. **Keine Grenzen, Zeitlimits, Schwellen, Abfrageintervalle, Toleranzen oder Retries angehoben. Nichts gemergt.** Kein Sprachmodell (0 $).

**Datum:** 2026-11-06 · **Stand:** T1 fertig (Gerüst, Trace `retain-on-failure` für die Eroj-Shards, D-01 lokal bestätigt); T2 bis T5 offen.

### G-0 Quelle

| | Wert |
|---|---|
| Quelle | `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec042/spec.md` |
| Größe der Quelle (`wc -c`) | 5172 Byte |
| SHA-256 laut Auftrag | `a8480d42f7cb2bc23d9c81a7da1bdff174254b925653372571a3a337a2b86878` |
| SHA-256 der Quelle (2026-11-06, 01:46 Ortszeit, `shasum -a 256`) | `a8480d42f7cb2bc23d9c81a7da1bdff174254b925653372571a3a337a2b86878` |
| SHA-256 der Kopie `specs/042-buehne-m5/spec.md` | `a8480d42f7cb2bc23d9c81a7da1bdff174254b925653372571a3a337a2b86878` (5172 Byte) |
| Ergebnis | **gleich.** Kopiert mit `cp`, nicht über ein Editor-Werkzeug. |

### Branches und PRs

| Teil | PR | Branch | Basis | Inhalt |
|---|---|---|---|---|
| A – Bühne und Tests | noch nicht geöffnet (T5) | `261106-spec-042-bhne-m5-restyle-b922d5` | `main` (`e4873c57`) | T1, T2, T3, T5 (Doku): `specs/042-buehne-m5/**`; `packages/eroj/playwright*.config.ts` (nur `trace`); `packages/eroj/test/buehne-036.spec.ts`, `zweitfarbe-036.spec.ts`, neu `buehne-navigation-042.spec.ts`, `geladen-042.ts`, `spuro-042.test.ts`; `packages/metiejo/src/**` (nur die gefundene Selbst-Navigation) |
| B – Werkstatt M5 | noch nicht geöffnet (T5) | `261106-spec-042-werkstatt-m5` | `main` (`e4873c57`) | T4: nur `packages/projekcioj/src/celoj/vitrino/**` |

PR A und PR B sind nicht gestapelt und teilen keine Datei (`comm -12` der beiden `git diff --name-only e4873c57...HEAD` leer, geprüft vor jedem Push).

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf ist unbeaufsichtigt. Wo die Spec offen ließ, gilt die Annahme. „angewandt“ = so umgesetzt; „offen“ = Ticket steht noch aus. Alle Einträge sind vom Maintainer zu bestätigen.

### Entscheidungen der Implementierungs-Spec (D-01 bis D-11)

| ID | Frage | Annahme | Warum | Stand |
|---|---|---|---|---|
| D-01 | Muss `ci.yml` für den Trace geändert werden? | **Wahrscheinlich nicht.** In der CI schreibt jede Eroj-Konfiguration den HTML-Bericht nach `packages/eroj/test-reports/playwright/html/` (`scripts/reporter/knapp-playwright.mjs`). Der HTML-Reporter von Playwright kopiert jeden Anhang, auch `trace.zip`, in seinen Ordner `data/`. Den lädt der bestehende Schritt „Testberichte“ (`packages/*/test-reports/`) schon als Artefakt `testberichte-eroj-<shard>-<attempt>` hoch. T1 prüft das lokal mit `CI=1`. Nur wenn der Trace dort **nicht** landet, bekommt der Job `eroj` einen eigenen Upload-Schritt **vor** „Testberichte“. Dann muss `packages/modelo/src/ci/workflow.test.ts` (`EROJ_STEPS`, „Testberichte is the last step“) im selben Commit mitziehen. Das steht dann als Abweichung vom Dateizuschnitt im Bericht. | `workflow.test.ts` pinnt die Schrittliste des Jobs `eroj` genau. Ein neuer Schritt ohne Anpassung macht `@fundamento/modelo` rot. | bestätigt (T1): Der Trace landet lokal mit `CI=1` als `*.zip` unter `packages/eroj/test-reports/playwright/html/data/` (Messanleitung). Keine Änderung an `ci.yml` und `workflow.test.ts`. |
| D-02 | Gilt der Trace auch für die abgeleiteten Konfigurationen? | **Nein, nur für die Eroj-Shards.** `playwright.vitrino.config.ts`, `playwright.alirebleco.config.ts`, `playwright.make-kit.config.ts` und `playwright.quickstart.config.ts` breiten `...base` aus und würden `use.trace` erben. Sie setzen `trace: "off"` ausdrücklich. `playwright.vitrino-partoj.config.ts` erbt das von der Vitrino. | Trace-Aufnahme im Job `zeittests` würde M5 verfälschen. Die Alirebleco-Shards liegen nahe an ihren 15 min (Spec 040 B-1). Die Quell-Spec sagt „für die Eroj-Shards“. | angewandt (T1, `347a3355`; gepinnt in `packages/eroj/test/spuro-042.test.ts`) |
| D-03 | Dürfen neue Dateien unter `packages/eroj/test/` entstehen außer dem Navigationstest? | **Ja, drei neue Dateien:** der Navigationstest `buehne-navigation-042.spec.ts`, ein Hilfsmodul `geladen-042.ts` (Warten auf den geladenen Zustand, genutzt von `buehne-036` und `zweitfarbe-036`) und ein Vitest-Pin `spuro-042.test.ts` (Trace-Konfiguration). **`wackler-040.ts` bleibt unverändert.** Es wird auch von `studio-035` und anderen genutzt. | Ein Hilfsmodul gehört nicht in eine `.spec.ts` (Import würde Tests doppelt registrieren). Test-first verlangt einen roten Pin vor der Konfigurationsänderung. | angewandt: `spuro-042.test.ts` (T1, rot `538bca43`); `buehne-navigation-042.spec.ts` und `geladen-042.ts` (T2, `3b2045b6`) |
| D-04 | Nur der Hauptrahmen oder auch die Vorschau-Rahmen? | **Beide, beide bindend.** Der Navigationstest schreibt die Navigationen des Hauptrahmens mit, wie die Spec verlangt. Zusätzlich zeichnet er die beiden Vorschau-Rahmen der Bühne auf (`iframe[data-mt-vorschau]`, `iframe[data-mt-vorschau-propono]`). Eine ungewollte Navigation eines Vorschau-Rahmens ist ebenfalls ein Befund, den T2 im Produkt behebt. | Der einzige Chromium-Beleg (42113762271, `buehne-036.spec.ts:187`) wertet **im Vorschau-Rahmen** aus (`grund()` über `frameLocator`). Auf Assistenten-Seiten lädt der `stato`-Abruf bei neuer `rev` nicht die Seite neu, sondern beide Rahmen (`html.ts` › `refreshFrame()`/`zeigeStato()` → `refreshNachher()`). Wer nur den Hauptrahmen zählt, findet diese Ursache womöglich nicht. | angewandt (T2, `3b2045b6`) |
| D-05 | Was ist „festlegen“ im Ablauf? | Wie in Bühne 3.5: `POST /api/marko/<id>/festlegen` aus dem Test (eigene Verbindung, `connection: close`). Danach wartet der Test, bis der `stato`-Abruf der offenen Seite die neue `rev` gesehen und verarbeitet hat. Er wartet auf die Antwort des Abrufs, nie auf die Uhr. Erst dann folgt das zweite `oeffne()`. | So deckt der Ablauf die Kette `rev` → Abruf → Reaktion der Seite deterministisch ab. Das ist genau das Fenster, in dem 3.5 (B-13, Load failed) rot wurde. | angewandt (T2, `3b2045b6`) |
| D-06 | Wohin kommen die CI-Ergebnisse, wenn nach dem Dispatch nicht mehr gepusht wird? | In **PR-Kommentare** (PR A: Gesamtbericht-Nachtrag; PR B: eigener Lauf mit M5) und in die **Schlussantwort**. `plan.md` › Bericht (in PR A) enthält alles, was vor dem Dispatch feststeht, und sagt ausdrücklich, dass die CI-Werte im Kommentar stehen, samt Befehlen zum Nachlesen. | AC-9: kein Push nach dem Dispatch. | offen |
| D-07 | Basis von PR B? | Derselbe Commit wie A: `e4873c57`. Im Worktree fehlt die lokale Ref `origin/main`, und das lokale `main` ist veraltet (`f6f38f53`). Deshalb wird B ausdrücklich von `e4873c57` abgezweigt. Hat sich `origin/main` inzwischen bewegt, wird das im Bericht genannt, aber nicht rebased. | Gleiche Basis für den M5-Vorher-Wert. Kein Rebase ohne Wunsch (delivery). | offen |
| D-08 | Wie wird „Stil+Layout im Median“ gemessen? | Wie C-2 in Spec 041: Median von `styleAndLayout` über die Einträge der Zeile `M5 Long Animation Frames: [...]` (stderr des M5-Tests, im JUnit-`system-err` des Artefakts `testberichte-zeittests-x-<attempt>`), dazu deren Anzahl. Die Long-Animation-Frames-API meldet nur Frames über 50 ms. Gibt es nach dem Fix keine, wird „0 Frames > 50 ms“ berichtet. Zusätzlich misst T4 lokal per CDP-Trace (Wegwerf, nie committet) die Stil-Neuberechnung je Änderung: Median in ms und Zahl der Elemente (vorher ~4 700, Spec 041 D-25). | Der M5-Test liegt in `packages/eroj/test/` (nicht Zone von PR B) und bleibt unverändert. | offen |
| D-09 | Wie wird „Pixel bleiben gleich“ geprüft? | Es gibt **keine versionierte Baseline** für die Vitrino (Spec 041 D-04; kein `toHaveScreenshot` im Repo). T4 beweist Pixelgleichheit lokal mit einem Wegwerf-Vergleich (Bildschirmfotos der Werkstatt, hell und dunkel, mindestens drei Schieberwerte, vorher gegen nachher, pixelgenau). Dazu kommen die berechneten Farben der sichtbaren Elemente der Werkstatt und beider Flanken. Das Werkzeug liegt außerhalb des Repos und wird nie committet. In der CI prüft zusätzlich die bestehende `vitrino.check.ts` die Farben. | Die Spec verbietet Pixelverschiebung; ohne Baseline muss der Nachweis aktiv geführt werden. | offen |
| D-10 | Darf das Messinstrument angepasst werden? | **Nein.** `measure()` in `packages/projekcioj/src/celoj/vitrino/werkstatt.ts`, `packages/eroj/test/m5.ts` (`M5_GRENZE_MS = 50`, `M5_PERZENTIL = 0.9`) und der M5-Test in `vitrino.check.ts` bleiben unverändert. Der Fix ändert, **was** neu berechnet wird, nicht **wie** gemessen wird. | Sonst wäre es ein Anheben der Grenze in anderer Form. | offen |
| D-11 | Wie laufen T2/T3 und T4 parallel, ohne lokal gleichzeitig Playwright zu fahren? | Eine **Maschinen-Sperre** (Vertrag unten, Abschnitt 3 › „Gemeinsame Verträge“). | testing.md: keine Playwright-Suiten parallel. Die lokale M5-Messung läuft allein auf der Maschine. | offen |

### Entscheidungen aus dem Lauf (D-12 ff.)

| ID | Ticket | Frage | Annahme | Stand |
|---|---|---|---|---|
| D-12 | T2 | Wie zählen die höchstens 30 Wiederholungen, wenn der Test selbst geändert wird? | Die 30 gelten für die **Suche nach Rot** je Engine und Test (Chromium 30, Firefox 30, WebKit 30, alle verbraucht). Die Prüfläufe der geänderten, grünen Fassung zählen getrennt, ebenfalls höchstens 30 je Engine (wie Spec 041 bei B-12: rot gesehen, dann grün bestätigt). | angewandt |
| D-13 | T2 | Wie hält der Navigationstest seine Einträge, wenn Seite und Rahmen in `sessionStorage` schreiben? | Jeder Eintrag hat **einen eigenen Schlüssel** (`fm-navigation-042:protokoll:<Zeit>:<Zufall>`), kein gemeinsam gelesenes und zurückgeschriebenes Feld. Gelesen wird am Ende mit `expect.poll` bis zur erwarteten Liste unter der Standardzeit; eine Navigation zu viel bleibt in der Liste und hält sie ungleich. Grund: Firefox verlor mit der gemeinsamen Liste 2 von 30 Mal die Einträge beider Rahmen (Messungen › Lokal). | angewandt (`3b2045b6`) |
| D-14 | T2 | Welche Quellen entscheiden im Navigationstest? | **Entscheidend:** `sessionStorage` (ein Eintrag je neuem Dokument, Init-Skript), `performance` (Navigationseintrag je Dokument, Typ) und – zusätzlich zur Spec – **`src`**: jede Zuweisung von `HTMLIFrameElement.prototype.src` in der Seite, im Moment der Zuweisung gezählt. Sie findet einen doppelten `refreshFrame()` auch dann, wenn die zweite Navigation die erste ersetzt und nur ein Dokument entsteht (Mutationsprobe unten). **Nur Bericht:** `framenavigated` der Seite (Firefox verpasst Ereignisse; geprüft wird nur „keins außerhalb der zwei Ladevorgänge“) und eine Bindung (`exposeBinding`), die zeigt, ob ein fehlender Eintrag nie geschrieben oder unterwegs verloren wurde. | angewandt (`3b2045b6`) |
| D-15 | T2 | Was tut `geladen-042.ts`, wenn das Lesen genau in einen Dokumentwechsel fällt? | Nur die Meldung „Execution context was destroyed“ des Lesens gilt als Zustand „zwischen zwei Dokumenten“ und lässt `expect.poll` weiterfragen; jeder andere Fehler wird geworfen. Keine Aktion wird wiederholt, kein Zeitlimit kommt hinzu. Gelesen wird immer über die Seite (`contentDocument` des Rahmens, `performance.timeOrigin` der Seite), nie im Kontext des Rahmens. | angewandt (`3b2045b6`) |
| D-16 | T2 | Produkt-Fix? | **Keiner.** Der Navigationstest war im Produkt sofort grün (Randfall „sofort grün“ der Spec): keine Navigation zu viel in Seite oder Rahmen, in keiner Engine. Deshalb kein roter Commit des Navigationstests und kein Unit-Test in `packages/metiejo/src/`; `html.ts` und `buehne-klient.ts` sind unverändert (`}, 3000);` steht). Der Nebenbefund N-7 (aus dem Code gelesen) liegt außerhalb des Ablaufs und würde, behoben, sichtbares Verhalten ändern; er bleibt beim Maintainer. | angewandt |

## Befunde

| ID | Nachweis | Ursache | Fix (rot → grün) | Ticket | Stand |
|---|---|---|---|---|---|
| B-10 | **CI** 41931882770 (`9d83af11`, PR von Spec 040, Versuch 2, `testberichte-eroj-3-2`): `[webkit] buehne-036.spec.ts:296` (3.2), zweites `oeffne()`: `data-mt-bereit` fehlt 5 s lang; Fehlerkontext: beide `iframe` leer, keine Rolle in der Bühne. Spec 041 sah dieselbe Signatur auch mit dem B-8-Fix (42079224873). Die Artefakte von 41931882770 waren am 2026-11-06 noch abrufbar (nur gelesen, `s042-spur/41931882770-eroj/`). **Navigationstest** (T2, gleicher Ablauf mit zweitem `oeffne()` nach neuer rev): Chromium, Firefox, WebKit je 30 + 30 Läufe, **keine** zusätzliche Navigation von Seite oder Rahmen; die zweite Seite bindet ihre Handler jedes Mal. | Keine Selbst-Navigation (These für B-10 widerlegt). Im zweiten Dokument liefen die Modulskripte nicht (`/eroj/define.js` und `/metiejo.js`: keine Rollen, keine `src` der Rahmen); warum, zeigt die Spur nicht. Lokal nicht nachgestellt. | keiner im Produkt. `oeffne()` wartet jetzt über `geladen()` auf Merkmal, `readyState` und beide Rahmen (`77778d6a`); ein neues Rot meldet, ob `readyState` „complete“ war und welcher Teil fehlt, und bringt den Trace aus T1 mit (`testberichte-eroj-<shard>-<attempt>` › `eroj/test-reports/playwright/html/data/*.zip`). | T2 | offen mit Spur |
| B-13 | **CI** 41971858056 (`c66ed99f`, `main`, `testberichte-eroj-3-1`): `[webkit] buehne-036.spec.ts:515` (3.5), zweites `oeffne()` nach `festlegen`: dieselbe Signatur wie B-10 (14 × `data-mt-bereit` „null“; Schnappschuss: Bühne gerendert, beide `iframe` leer). Navigationstest wie B-10. | wie B-10: keine Selbst-Navigation; Module des zweiten Dokuments liefen nicht, Ursache offen. | keiner im Produkt; Härtung wie B-10 (`77778d6a`). | T2 | offen mit Spur |
| Load failed | **CI** 42080252255 (`b9cde42f`, Branch `261105-spec-041-ci-browser-cache`, Versuch 2, `testberichte-eroj-3-2`): `[webkit] buehne-036.spec.ts:515` (3.5), `fehler` = `["TypeError: Load failed"]` am Ende des Tests (Zeile 565); Versuch 1 desselben Laufs: `apiRequestContext.post: read ECONNRESET` am POST `festlegen` (B-12 von Spec 041). Die Commits des B-8-Fixes von Spec 041 (`7e0ff9ec`, `178ed2a9`) und von B-12 (`888ea97a`) sind **keine** Vorfahren von `b9cde42f` (`git merge-base --is-ancestor`). Navigationstest: zwischen `festlegen`, Abruf und zweitem Laden keine Navigation zu viel. | Die Signatur von Spec 041 B-8: ein `stato`-Abruf, den das zweite `goto` abschneidet, meldet WebKit als „TypeError: Load failed“ der alten Seite. Der Lauf hatte den Fix noch nicht. | behoben durch Spec 041 B-8 (`7e0ff9ec`, N-2 `178ed2a9`); lokal auf `e4873c57`+T2 nicht nachgestellt (`stato-041.spec.ts` grün in drei Engines). Beim nächsten Auftreten auf einem Stand mit Fix zählt der Trace aus T1. | T2 | behoben (041 B-8) |
| Execution context destroyed | **CI** 42113762271 (`e4873c57`, `main`, Dispatch, `testberichte-eroj-1-1`): `[chromium] buehne-036.spec.ts:178` (3.1 hell/dunkel), `locator.evaluate: Execution context was destroyed` in `grund()` (Zeile 187), aufgerufen aus dem `expect.poll` nach dem Klick auf „Hell“ (Zeile 197). `playwright@1.63.0` `lib/matchers/expect.js`: `const value = await actual();` steht **außerhalb** des `try` – ein Fehler des Callbacks beendet `expect.poll` sofort. Navigationstest: je Klick genau **ein** neues Dokument je Rahmen (`dunkel`, `hell`), keine Navigation zu viel. | Der Test las im Rahmen, während der Rahmen die **erwartete** Navigation nach dem Klick lud (`folgeBuehne` → `refreshFrame()`); das alte Dokument verschwand unter dem Lesen. Keine Selbst-Navigation. | Test: `grund()` liest erst, wenn `rahmenBereit(page, JETZT, { scheme })` das neue Dokument geladen sieht; gelesen über `contentDocument` der Seite (`geladen-042.ts`). `77778d6a` (rot = der CI-Lauf). Lokal `buehne-036` je 95/95 in drei Engines. | T2 | behoben (Test) |
| Zweitfarbe Firefox | | | | T3 | offen |
| B-14 | | | | T4 | offen |
| N-7 (neu, T2) | **Aus dem Code gelesen, nicht nachgestellt:** Auf Assistenten- und Bühnen-Seiten trägt die Wurzel `data-mt-scheme` (`asistanto/ekrano.ts:289`). `html.ts:245` sucht den Schema-Schalter des Studios mit `document.querySelector("[data-mt-scheme]")` und findet dort die Wurzel selbst. Jedes `change`, das bis zur Wurzel steigt und nicht aus der Bühne oder einem Dialog kommt (die halten es an, `buehne-klient.ts`), setzt `scheme = "light"` und ruft `refreshFrame()`: die Lingvo-Wahl im Kopf (ruft `refreshFrame()` außerdem selbst, also zweimal), der Schalter „Antworten vorlesen“ und das Eingabefeld der Chat-Leiste (außerhalb von `[data-mt-buehne]`, `asistanto/ekrano.ts:208`). | Ungewollte Navigation des Rahmens „Jetzt“ bei Bedienung außerhalb der Bühne; steht die Bühne auf „Dunkel“, zeigt „Jetzt“ danach hell, „Mit dem Vorschlag“ bleibt dunkel. Nicht im Ablauf der Spec (der Navigationstest bedient weder Lingvo noch Chat-Leiste). | keiner: Die Behebung (Schalter nicht an der Wurzel suchen) ändert, was der Nutzer sieht; Nicht-Ziel von T2. Vorschlag für eine eigene Spec: Navigationstest um Lingvo-Wahl und „Antworten vorlesen“ erweitern (rot), dann `html.ts:245` auf einen Schalter unterhalb der Wurzel beschränken. | T2 | offen (Maintainer) |

## Messungen

### Lokal (T2, T3)

Apple M1 Max, 10 Kerne, macOS 26.5.1, 2026-11-06, unter der Maschinen-Sperre, vorher `pnpm turbo run build --filter=@fundamento/cli...`. Befehle aus `packages/eroj`, `FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=<engine> pnpm exec playwright test <datei> --workers=4 …`.

| Test | Engine | Befehl | Ergebnis |
|---|---|---|---|
| Navigationstest, erste Fassung (gemeinsame Liste in `sessionStorage`), Suche nach Rot | Chromium | `test/buehne-navigation-042.spec.ts --repeat-each=1`, dann `--repeat-each=29` | 30/30 |
| ebenso | Firefox | `--repeat-each=30` | 28/30; beide Roten: Einträge `sessionStorage` und `performance` **beider** Rahmen im Schritt `rev` fehlen, `src` beider Rahmen im Schritt `rev` genau einmal gesetzt, und `rahmenBereit` hatte beide Rahmen mit `rev=2`, `readyState` „complete“ und URL = `src` gesehen. Also geladen, aber nicht notiert (D-13); keine Navigation zu viel. Trace durch den folgenden Lauf gelöscht. |
| ebenso | WebKit | `--repeat-each=30` | 30/30 |
| Navigationstest, Fassung `3b2045b6` (Schlüssel je Eintrag, D-13) | Firefox | `--repeat-each=30` | 30/30 |
| ebenso | Chromium | `--repeat-each=30` | 30/30 |
| ebenso | WebKit | `--repeat-each=30` | 30/30 |
| Mutationsprobe (Wegwerf, nie committet): `html.ts` ruft im Abruf `refreshFrame()` zweimal, neu gebaut, danach `html.ts` zurück und neu gebaut | Chromium | `--repeat-each=1` | 0/1 rot: `src` von „Jetzt“ zeigt `rev` zweimal (der Test sieht einen doppelten `refreshFrame()`) |
| `buehne-036.spec.ts` gehärtet (`77778d6a`) | Chromium | `--repeat-each=5` | 95/95 |
| ebenso | Firefox | `--repeat-each=5` | 95/95 |
| ebenso | WebKit | `--repeat-each=5` | 95/95 |
| `stato-041.spec.ts` (unverändert) | Chromium, Firefox, WebKit | ohne Wiederholung | je 3/3 |
| Metiejo-Unit (`stato-041.test.ts` unverändert) | – | `pnpm turbo run test --filter=@fundamento/metiejo --output-logs=errors-only` | grün |

**Härtung `buehne-036.spec.ts` (AC-5, Stand `77778d6a`): neu ladende Aktion bzw. Lesen im Rahmen → Wartebedingung**

| Datei:Zeile | Stelle | Wartebedingung |
|---|---|---|
| `buehne-036.spec.ts:128` | `geladen(page, nicht?)` | `seiteBereit`: `[data-mt-buehne][data-mt-bereit]` und `readyState` „complete“, mit `nicht` ein anderes Dokument (`performance.timeOrigin`); dann `rahmenBereit` für „Jetzt“ und „Mit dem Vorschlag“ mit der `rev` der Seite und `light` |
| `:136` | `oeffne()` (jedes Öffnen, auch das zweite in 3.2 `:332` und in 3.5 nach `festlegen` `:562`) | `geladen(page)` |
| `:149`, `:175` | 3.1 Breite und echte Eroj: vorher `page.goto` ohne Warten, dann `evaluate` | `oeffne()` |
| `:210`–`:218` | 3.1 hell/dunkel, `grund()` im Rahmen | vor jedem Lesen nach einem Klick `rahmenBereit(page, JETZT, { scheme })` |
| `:347`–`:350` | 3.2 „Übernehmen“ (lädt neu), dann `knopf()` | `dokument()` davor, `geladen(page, alt)` danach (statt `waitForEvent("load")`) |
| `:496`–`:498` | 3.4 „Schließen“ nach dem Lesen (lädt neu), dann `knopf()` | `dokument()` davor, `geladen(page, alt)` danach |
| `:730`–`:731` | Axe dunkel: axe liest auch die Rahmen | `rahmenBereit` für beide Rahmen mit `dark` |

### M5 (T4, V-2)

| Stand | p90 je Lauf | Skripte längstens | LoAF > 50 ms | Stil+Layout-Median (LoAF) | CDP: Stil-Neuberechnung je Änderung (Median, Elemente) |
|---|---|---|---|---|---|

### PR A und PR B (workflow_dispatch, T5)

| PR | Lauf | Kopf | Versuch | Jobs | M5 p90 | Eroj-Shards (Dauer) |
|---|---|---|---|---|---|---|

## Diff-Suche (AC-8)

Folgt in T5 (Befehl in der Implementierungs-Spec, T5). Jeder Treffer bekommt hier eine Zeile mit Urteil („unverändert“, „gelesen“, „Kommentar“, „Pin“).

## Messanleitung

```sh
# G-0 / AC-1: Quelle und Kopie haben dieselbe Größe und denselben Hash
wc -c /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec042/spec.md specs/042-buehne-m5/spec.md
shasum -a 256 /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec042/spec.md specs/042-buehne-m5/spec.md
git show HEAD:specs/042-buehne-m5/spec.md | shasum -a 256
```

```sh
# T2: CI-Spuren lesen (nur lesen, je Lauf ein neues leeres Verzeichnis)
for id in 42113762271 42080252255 41971858056 41931882770; do
  d=/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mw48j5oap3r28zm3/s042-spur/$id-eroj; mkdir -p $d
  gh run download $id -R thojank/fundamento -p 'testberichte-eroj-*' -D $d
done
# Stand 2026-11-06: alle vier Läufe noch abrufbar (keine abgelaufenen Artefakte). Fehler aus
# eroj/test-reports/playwright/junit.xml, Schnappschuss aus html/data/*.md (Fehlerkontext).

# T2: Navigationstest und Härtung (unter der Maschinen-Sperre, nach dem Bau)
pnpm turbo run build --filter=@fundamento/cli...
cd packages/eroj
for e in chromium firefox webkit; do
  FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=$e pnpm exec playwright test test/buehne-navigation-042.spec.ts --workers=4 --repeat-each=30
done
for e in chromium firefox webkit; do
  FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=$e pnpm exec playwright test test/buehne-036.spec.ts --workers=4 --repeat-each=5
done

# T1: Pin der Trace-Konfiguration (rot 538bca43 → grün 347a3355)
cd packages/eroj && FM_GEBAUT=1 FM_AUSGABE=knapp pnpm exec vitest run test/spuro-042.test.ts

# T1 / D-01: Landet der Trace eines roten Tests im HTML-Bericht, den „Testberichte“ hochlädt?
# Wegwerf-Spec packages/eroj/test/wegwerf-042.spec.ts (nie committet, danach gelöscht):
#   page.setContent("<p>rot</p>"), dann expect(...).toHaveText("grün") – scheitert absichtlich.
cd packages/eroj && rm -rf test-reports/playwright && \
  CI=1 FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=chromium pnpm exec playwright test test/wegwerf-042.spec.ts
find test-reports/playwright/html/data -name '*.zip'
unzip -l test-reports/playwright/html/data/*.zip
rm test/wegwerf-042.spec.ts && rm -rf test-results/wegwerf-042-* test-reports/playwright
```

Fund (2026-11-06, 01:58 Ortszeit, Apple M1 Max, 10 Kerne, macOS 26.5.1, Stand `347a3355`, unter der Maschinen-Sperre): 0 bestanden, 1 rot; unter `packages/eroj/test-reports/playwright/html/data/` liegen `466791e9d3262ac46d6c8a530ed9c68f8fc4580f.zip` (7114 Byte; darin `0-trace.trace`, `0-trace.network`, `0-trace.stacks`, Bildschirmaufnahmen) und der Fehlerkontext (`.md`); daneben der Trace-Betrachter unter `html/trace/`. Der Schritt „Testberichte“ im Job `eroj` lädt `packages/*/test-reports/` schon als `testberichte-eroj-<shard>-<attempt>` hoch (`if: always()`, 7 Tage). **D-01 bestätigt: kein eigener Upload-Schritt, `ci.yml` und `workflow.test.ts` unverändert.** Die Wegwerf-Spec ist gelöscht; `test-reports/` und `test-results/` stehen in `.gitignore`.

In einem Artefakt der CI liegt der Trace eines roten Eroj-Tests unter `eroj/test-reports/playwright/html/data/*.zip`; lesen mit `pnpm exec playwright show-trace <zip>` (nur lesen, nie ausführen).

## Blockiert

Nichts.

## Bericht

Folgt in T5.
