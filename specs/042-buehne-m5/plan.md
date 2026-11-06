# Spec 042 – Bühne lädt sich neu, M5 Stil-Neuberechnung (Nachlauf 041) – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `a8480d42f7cb2bc23d9c81a7da1bdff174254b925653372571a3a337a2b86878`) · **Aufgaben:** [`tasks.md`](tasks.md) · **Basis:** `main` `e4873c57` (Merge #148; enthält #147 und Spec 041) · **Regel 0** gilt. **Keine Grenzen, Zeitlimits, Schwellen, Abfrageintervalle, Toleranzen oder Retries angehoben. Nichts gemergt.** Kein Sprachmodell (0 $).

**Datum:** 2026-11-06 · **Stand:** T1 bis T4 fertig; T5: beide PRs offen, je genau ein `workflow_dispatch` nach diesem Commit. Die CI-Ergebnisse stehen als Kommentar in PR A und PR B (D-06, Bericht › CI (nach dem Dispatch)).

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
| A – Bühne und Tests | PR A (Branch `261106-spec-042-bhne-m5-restyle-b922d5`; `gh pr view 261106-spec-042-bhne-m5-restyle-b922d5 -R thojank/fundamento`) (offen, kein Entwurf) | `261106-spec-042-bhne-m5-restyle-b922d5` | `main` (`e4873c57`) | T1, T2, T3, T5 (Doku): `specs/042-buehne-m5/**`; `packages/eroj/playwright*.config.ts` (nur `trace`); `packages/eroj/test/buehne-036.spec.ts`, `zweitfarbe-036.spec.ts`, neu `buehne-navigation-042.spec.ts`, `geladen-042.ts`, `spuro-042.test.ts`; `packages/metiejo/src/**` (nur die gefundene Selbst-Navigation) |
| B – Werkstatt M5 | https://github.com/thojank/fundamento/pull/149 (offen, kein Entwurf) | `261106-spec-042-werkstatt-m5` | `main` (`e4873c57`) | T4: nur `packages/projekcioj/src/celoj/vitrino/**` |

PR A und PR B sind nicht gestapelt und teilen keine Datei (`comm -12` der beiden `git diff --name-only e4873c57...HEAD` leer, geprüft vor jedem Push).

| Teil | Gepushter Kopf | Commits auf `e4873c57` | Dateien (`git diff --name-only e4873c57...HEAD`) |
|---|---|---|---|
| A | der Commit „Spec 042: Bericht vor dem Dispatch“ (Kopf steht im Kommentar „Bericht – Nachtrag CI“ von PR A); Code-Kopf `9a19e143` | 11 | 13 Dateien: `specs/042-buehne-m5/{spec,plan,tasks}.md`, fünf `packages/eroj/playwright*.config.ts`, `packages/eroj/test/{buehne-036.spec.ts,buehne-navigation-042.spec.ts,geladen-042.ts,spuro-042.test.ts,zweitfarbe-036.spec.ts}` – alle in der Zone von A; `packages/metiejo/src/**`, `ci.yml` und `workflow.test.ts` unverändert |
| B | `1c69db9b` | 2 | `packages/projekcioj/src/celoj/vitrino/{html.ts,vitrino.test.ts,werkstatt.ts}` – nur Zone B |

`origin/main` stand beim Push noch auf `e4873c57` (`git fetch origin main` am 2026-11-06); kein Rebase (D-07).

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
| D-06 | Wohin kommen die CI-Ergebnisse, wenn nach dem Dispatch nicht mehr gepusht wird? | In **PR-Kommentare** (PR A: Gesamtbericht-Nachtrag; PR B: eigener Lauf mit M5) und in die **Schlussantwort**. `plan.md` › Bericht (in PR A) enthält alles, was vor dem Dispatch feststeht, und sagt ausdrücklich, dass die CI-Werte im Kommentar stehen, samt Befehlen zum Nachlesen. | AC-9: kein Push nach dem Dispatch. | angewandt (T5): CI-Werte in den Kommentaren von PR A und PR B; Bericht › CI (nach dem Dispatch) nennt die Befehle |
| D-07 | Basis von PR B? | Derselbe Commit wie A: `e4873c57`. Im Worktree fehlt die lokale Ref `origin/main`, und das lokale `main` ist veraltet (`f6f38f53`). Deshalb wird B ausdrücklich von `e4873c57` abgezweigt. Hat sich `origin/main` inzwischen bewegt, wird das im Bericht genannt, aber nicht rebased. | Gleiche Basis für den M5-Vorher-Wert. Kein Rebase ohne Wunsch (delivery). | angewandt (T4 abgezweigt von `e4873c57`; T5: `origin/main` beim Push unverändert `e4873c57`, kein Rebase) |
| D-08 | Wie wird „Stil+Layout im Median“ gemessen? | Wie C-2 in Spec 041: Median von `styleAndLayout` über die Einträge der Zeile `M5 Long Animation Frames: [...]` (stderr des M5-Tests, im JUnit-`system-err` des Artefakts `testberichte-zeittests-x-<attempt>`), dazu deren Anzahl. Die Long-Animation-Frames-API meldet nur Frames über 50 ms. Gibt es nach dem Fix keine, wird „0 Frames > 50 ms“ berichtet. Zusätzlich misst T4 lokal per CDP-Trace (Wegwerf, nie committet) die Stil-Neuberechnung je Änderung: Median in ms und Zahl der Elemente (vorher ~4 700, Spec 041 D-25). | Der M5-Test liegt in `packages/eroj/test/` (nicht Zone von PR B) und bleibt unverändert. | angewandt: lokal CDP (T4, Messungen › M5); CI nach C-2 im Kommentar von PR B |
| D-09 | Wie wird „Pixel bleiben gleich“ geprüft? | Es gibt **keine versionierte Baseline** für die Vitrino (Spec 041 D-04; kein `toHaveScreenshot` im Repo). T4 beweist Pixelgleichheit lokal mit einem Wegwerf-Vergleich (Bildschirmfotos der Werkstatt, hell und dunkel, mindestens drei Schieberwerte, vorher gegen nachher, pixelgenau). Dazu kommen die berechneten Farben der sichtbaren Elemente der Werkstatt und beider Flanken. Das Werkzeug liegt außerhalb des Repos und wird nie committet. In der CI prüft zusätzlich die bestehende `vitrino.check.ts` die Farben. | Die Spec verbietet Pixelverschiebung; ohne Baseline muss der Nachweis aktiv geführt werden. | angewandt (T4): berechnete Stile 0 Abweichungen in 14 Fällen, Bildschirmfotos nur Raster-Rauschen wie vorher gegen vorher |
| D-10 | Darf das Messinstrument angepasst werden? | **Nein.** `measure()` in `packages/projekcioj/src/celoj/vitrino/werkstatt.ts`, `packages/eroj/test/m5.ts` (`M5_GRENZE_MS = 50`, `M5_PERZENTIL = 0.9`) und der M5-Test in `vitrino.check.ts` bleiben unverändert. Der Fix ändert, **was** neu berechnet wird, nicht **wie** gemessen wird. | Sonst wäre es ein Anheben der Grenze in anderer Form. | angewandt: `measure()`, `m5.ts` (`M5_GRENZE_MS = 50`) und `vitrino.check.ts` unverändert (Diff-Suche) |
| D-11 | Wie laufen T2/T3 und T4 parallel, ohne lokal gleichzeitig Playwright zu fahren? | Eine **Maschinen-Sperre** (Vertrag unten, Abschnitt 3 › „Gemeinsame Verträge“). | testing.md: keine Playwright-Suiten parallel. Die lokale M5-Messung läuft allein auf der Maschine. | angewandt (T1 bis T5; T4s Nachher-Messung lief unter Fremdlast eines anderen Workspace außerhalb der Sperre, Messungen › M5) |

### Entscheidungen aus dem Lauf (D-12 ff.)

| ID | Ticket | Frage | Annahme | Stand |
|---|---|---|---|---|
| D-12 | T2 | Wie zählen die höchstens 30 Wiederholungen, wenn der Test selbst geändert wird? | Die 30 gelten für die **Suche nach Rot** je Engine und Test (Chromium 30, Firefox 30, WebKit 30, alle verbraucht). Die Prüfläufe der geänderten, grünen Fassung zählen getrennt, ebenfalls höchstens 30 je Engine (wie Spec 041 bei B-12: rot gesehen, dann grün bestätigt). | angewandt |
| D-13 | T2 | Wie hält der Navigationstest seine Einträge, wenn Seite und Rahmen in `sessionStorage` schreiben? | Jeder Eintrag hat **einen eigenen Schlüssel** (`fm-navigation-042:protokoll:<Zeit>:<Zufall>`), kein gemeinsam gelesenes und zurückgeschriebenes Feld. Gelesen wird am Ende mit `expect.poll` bis zur erwarteten Liste unter der Standardzeit; eine Navigation zu viel bleibt in der Liste und hält sie ungleich. Grund: Firefox verlor mit der gemeinsamen Liste 2 von 30 Mal die Einträge beider Rahmen (Messungen › Lokal). | angewandt (`3b2045b6`) |
| D-14 | T2 | Welche Quellen entscheiden im Navigationstest? | **Entscheidend:** `sessionStorage` (ein Eintrag je neuem Dokument, Init-Skript), `performance` (Navigationseintrag je Dokument, Typ) und – zusätzlich zur Spec – **`src`**: jede Zuweisung von `HTMLIFrameElement.prototype.src` in der Seite, im Moment der Zuweisung gezählt. Sie findet einen doppelten `refreshFrame()` auch dann, wenn die zweite Navigation die erste ersetzt und nur ein Dokument entsteht (Mutationsprobe unten). **Nur Bericht:** `framenavigated` der Seite (Firefox verpasst Ereignisse; geprüft wird nur „keins außerhalb der zwei Ladevorgänge“) und eine Bindung (`exposeBinding`), die zeigt, ob ein fehlender Eintrag nie geschrieben oder unterwegs verloren wurde. | angewandt (`3b2045b6`) |
| D-15 | T2 | Was tut `geladen-042.ts`, wenn das Lesen genau in einen Dokumentwechsel fällt? | Nur die Meldung „Execution context was destroyed“ des Lesens gilt als Zustand „zwischen zwei Dokumenten“ und lässt `expect.poll` weiterfragen; jeder andere Fehler wird geworfen. Keine Aktion wird wiederholt, kein Zeitlimit kommt hinzu. Gelesen wird immer über die Seite (`contentDocument` des Rahmens, `performance.timeOrigin` der Seite), nie im Kontext des Rahmens. | angewandt (`3b2045b6`) |
| D-17 | T3 | Welches Merkmal hat der Schnellstart, der kein `data-mt-bereit` setzt? | `[data-mt-zweitfarbe]` zusammen mit `readyState` „complete“ (die Modulskripte `/metiejo.js` laufen vor „complete“) und – für die Vorschau – `src` des Rahmens gesetzt (`rahmenBereit` verlangt es). Der Assistenten-Schritt nimmt `BUEHNE_BEREIT`. Kein neues Attribut im Produkt (`html.ts` unverändert, außerhalb der Zone). | angewandt (`8506eb80`) |
| D-18 | T3 | Wie sieht der Test die Prüfung (`POST …/pruefung`) **des neuen** Dokuments, ohne `framenavigated` der Hauptseite? | Über die **Resource Timing** des Dokuments (`abrufBeantwortet`): ein Eintrag für den Pfad entsteht, wenn die Antwort samt Körper da ist, und jedes Dokument hat seine eigene Zeitleiste – eine Prüfung der Seite davor zählt nicht. Gemessen (Wegwerf-Probe, nicht committet): 97–98 Einträge je Seite in Firefox und WebKit, weit unter dem Puffer von 250; im Schnellstart genau 1 Prüfung, im Assistenten keine (er prüft nicht). Beim **Speichern** bleibt das Warten auf die Antworten (`response`-Ereignis, gleiches Dokument, kein Navigationsereignis), wie `gespeichert`, nur mit `rahmenBereit` statt `vorschauGeladen`. | angewandt (`8506eb80`) |
| D-19 | T3 | Zählung der Wiederholungen | Wie D-12: Suche nach Rot Firefox 30 (verbraucht, 30/30 grün). Prüfläufe der gehärteten Fassung getrennt: Firefox, Chromium, WebKit je `--repeat-each=10` (je 30/30 Tests). `wackler-040.ts` bleibt unverändert (D-03); `studio-035` nutzt es weiter. | angewandt |
| D-16 | T2 | Produkt-Fix? | **Keiner.** Der Navigationstest war im Produkt sofort grün (Randfall „sofort grün“ der Spec): keine Navigation zu viel in Seite oder Rahmen, in keiner Engine. Deshalb kein roter Commit des Navigationstests und kein Unit-Test in `packages/metiejo/src/`; `html.ts` und `buehne-klient.ts` sind unverändert (`}, 3000);` steht). Der Nebenbefund N-7 (aus dem Code gelesen) liegt außerhalb des Ablaufs und würde, behoben, sichtbares Verhalten ändern; er bleibt beim Maintainer. | angewandt |

## Befunde

| ID | Nachweis | Ursache | Fix (rot → grün) | Ticket | Stand |
|---|---|---|---|---|---|
| B-10 | **CI** 41931882770 (`9d83af11`, PR von Spec 040, Versuch 2, `testberichte-eroj-3-2`): `[webkit] buehne-036.spec.ts:296` (3.2), zweites `oeffne()`: `data-mt-bereit` fehlt 5 s lang; Fehlerkontext: beide `iframe` leer, keine Rolle in der Bühne. Spec 041 sah dieselbe Signatur auch mit dem B-8-Fix (42079224873). Die Artefakte von 41931882770 waren am 2026-11-06 noch abrufbar (nur gelesen, `s042-spur/41931882770-eroj/`). **Navigationstest** (T2, gleicher Ablauf mit zweitem `oeffne()` nach neuer rev): Chromium, Firefox, WebKit je 30 + 30 Läufe, **keine** zusätzliche Navigation von Seite oder Rahmen; die zweite Seite bindet ihre Handler jedes Mal. | Keine Selbst-Navigation (These für B-10 widerlegt). Im zweiten Dokument liefen die Modulskripte nicht (`/eroj/define.js` und `/metiejo.js`: keine Rollen, keine `src` der Rahmen); warum, zeigt die Spur nicht. Lokal nicht nachgestellt. | keiner im Produkt. `oeffne()` wartet jetzt über `geladen()` auf Merkmal, `readyState` und beide Rahmen (`77778d6a`); ein neues Rot meldet, ob `readyState` „complete“ war und welcher Teil fehlt, und bringt den Trace aus T1 mit (`testberichte-eroj-<shard>-<attempt>` › `eroj/test-reports/playwright/html/data/*.zip`). | T2 | offen mit Spur |
| B-13 | **CI** 41971858056 (`c66ed99f`, `main`, `testberichte-eroj-3-1`): `[webkit] buehne-036.spec.ts:515` (3.5), zweites `oeffne()` nach `festlegen`: dieselbe Signatur wie B-10 (14 × `data-mt-bereit` „null“; Schnappschuss: Bühne gerendert, beide `iframe` leer). Navigationstest wie B-10. | wie B-10: keine Selbst-Navigation; Module des zweiten Dokuments liefen nicht, Ursache offen. | keiner im Produkt; Härtung wie B-10 (`77778d6a`). | T2 | offen mit Spur |
| Load failed | **CI** 42080252255 (`b9cde42f`, Branch `261105-spec-041-ci-browser-cache`, Versuch 2, `testberichte-eroj-3-2`): `[webkit] buehne-036.spec.ts:515` (3.5), `fehler` = `["TypeError: Load failed"]` am Ende des Tests (Zeile 565); Versuch 1 desselben Laufs: `apiRequestContext.post: read ECONNRESET` am POST `festlegen` (B-12 von Spec 041). Die Commits des B-8-Fixes von Spec 041 (`7e0ff9ec`, `178ed2a9`) und von B-12 (`888ea97a`) sind **keine** Vorfahren von `b9cde42f` (`git merge-base --is-ancestor`). Navigationstest: zwischen `festlegen`, Abruf und zweitem Laden keine Navigation zu viel. | Die Signatur von Spec 041 B-8: ein `stato`-Abruf, den das zweite `goto` abschneidet, meldet WebKit als „TypeError: Load failed“ der alten Seite. Der Lauf hatte den Fix noch nicht. | behoben durch Spec 041 B-8 (`7e0ff9ec`, N-2 `178ed2a9`); lokal auf `e4873c57`+T2 nicht nachgestellt (`stato-041.spec.ts` grün in drei Engines). Beim nächsten Auftreten auf einem Stand mit Fix zählt der Trace aus T1. | T2 | behoben (041 B-8) |
| Execution context destroyed | **CI** 42113762271 (`e4873c57`, `main`, Dispatch, `testberichte-eroj-1-1`): `[chromium] buehne-036.spec.ts:178` (3.1 hell/dunkel), `locator.evaluate: Execution context was destroyed` in `grund()` (Zeile 187), aufgerufen aus dem `expect.poll` nach dem Klick auf „Hell“ (Zeile 197). `playwright@1.63.0` `lib/matchers/expect.js`: `const value = await actual();` steht **außerhalb** des `try` – ein Fehler des Callbacks beendet `expect.poll` sofort. Navigationstest: je Klick genau **ein** neues Dokument je Rahmen (`dunkel`, `hell`), keine Navigation zu viel. | Der Test las im Rahmen, während der Rahmen die **erwartete** Navigation nach dem Klick lud (`folgeBuehne` → `refreshFrame()`); das alte Dokument verschwand unter dem Lesen. Keine Selbst-Navigation. | Test: `grund()` liest erst, wenn `rahmenBereit(page, JETZT, { scheme })` das neue Dokument geladen sieht; gelesen über `contentDocument` der Seite (`geladen-042.ts`). `77778d6a` (rot = der CI-Lauf). Lokal `buehne-036` je 95/95 in drei Engines. | T2 | behoben (Test) |
| Zweitfarbe Firefox | **CI** 42103645313 (`e4873c57`, `main`, Merge von PR #148, `testberichte-eroj-3-1`, Versuch 1; Artefakte am 2026-11-06 noch abrufbar, nur gelesen, `s042-spur/42103645313-eroj/`): `[firefox] zweitfarbe-036.spec.ts:111` (Schnellstart), „Test timeout of 120000ms exceeded“ in `page.waitForEvent: waiting for event "framenavigated"` bei `wackler-040.ts:67` (`vorschauGeladen`), aufgerufen aus `seiteGeladen` (`wackler-040.ts:141`) beim **Neuladen** `zweitfarbe-036.spec.ts:140`. Gelaufen waren also: Laden, Zweitfarbe tippen und Speichern (`gespeichert`); offen stand das Warten darauf, dass die Vorschau der neu geladenen Seite die `rev` der Seite lädt. Kein Trace (vor 042), kein Schnappschuss im Fehlerkontext. Die Assistenten-Variante und der Material-Test liefen grün (19,7 s und 7,0 s). **Lokal nicht nachgestellt:** Firefox, `-g "Schnellstart" --repeat-each=30 --workers=4` auf dem ungeänderten Stand `34c13f0a`: 30/30 grün in 92 s (Grenze 30 erreicht, keine weitere Suche). | Verdacht (nicht nachgewiesen): Firefox meldet die Navigation der Vorschau nicht oder ihr `frame.url()` steht noch auf der alten `rev`, obwohl der Rahmen geladen hat – genau die Muster B-9/B-15 von Spec 041, die testing.md verbietet. `vorschauGeladen` prüft zuerst `frame.url()` und wartet sonst ohne Grenze auf `framenavigated`; ein verpasstes Ereignis hält bis zur Testzeit. Verdächtige Wartestelle: `wackler-040.ts:66–70` über `seiteGeladen` (`:140`), dieselbe über `gespeichert` (`:136`) und das `framenavigated` der Hauptseite (`:151`). | Härtung nach AC-5 (V-3), kein Produkt-Fix: Die Datei wartet nicht mehr auf `framenavigated`, sondern auf Zustände über `geladen-042.ts` (`schrittBereit`, `entwurfGespeichert`) – `8506eb80` (rot = die CI-Beobachtung, kein roter Commit). Ein neues Rot meldet nach höchstens der Standard-Expect-Zeit, welcher Teil fehlt (Merkmal/`readyState`/neues Dokument, Rahmen mit `rev`, Prüfung). **Spur beim nächsten CI-Fehler:** `testberichte-eroj-<shard>-<attempt>` › `eroj/test-reports/playwright/html/data/*.zip` (Trace aus T1), lesen mit `pnpm exec playwright show-trace <zip>`; dort im Netzwerk die `vorschau?…&rev=` des Rahmens und im Aktionsprotokoll die Meldung von `expect.poll`. | T3 | offen mit Spur (Datei gehärtet) |
| B-14 | **CI** (Spec 041, C-2): p90 51/53/55 ms auf `main`, Stil+Layout im Median 42/40/40,5 ms; je Schieber-Änderung ~4 700 Elemente Stil-Neuberechnung (Spec 041 D-25). **Lokal** (T4, CDP-Wegwerf-Trace, 20 Änderungen, Chromium): Paletten-Frame Stil+Layout im Median 12,0 (hell) / 12,5 ms (dunkel), 2 287 / 2 154 Elemente; alle Neuberechnungen je Änderung ~5 270 Elemente. | Die bestehende Regel `content-visibility: auto` auf `#fm-werkstatt-paletroj > table` übersprang in Chromium nichts: Chromium wendet auf eine Tabelle kein Containment an, die sechs Palettentabellen (~1 150 Elemente) wurden auch außerhalb des Bildes gestylt und gesetzt. Dazu beide Flanken (je ~2 ms lokal), die bei jeder Änderung das ganze Stylesheet neu abglichen. Die Schreibvorgänge auf `:root` bleiben nötig (Rollen-Tokens für Seite, Kopf, Panel). | PR B: jede Tabelle in `div.fm-werkstatt-paletro` mit `content-visibility: auto`; `.fm-werkstatt-flankoj` mit `content-visibility: auto` und der Höhe einer Flanke als Platzhalter; `min-inline-size: min-content` auf beiden gegen Abschneiden bei 375 px. Rot `89636d4f` → grün `1c69db9b` (Vitest im Vitrino-Ordner). Lokal danach 5,9 / 5,8 ms, 1 103 / 985 Elemente; p90 lokal 0 ms vorher und nachher. CI-Wert: Kommentar in PR B. | T4 | behoben lokal; CI-Urteil im Kommentar von PR B |
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
| `zweitfarbe-036.spec.ts` ungeändert (`34c13f0a`), Suche nach Rot | Firefox | `-g "Schnellstart" --repeat-each=30` | 30/30 (92 s); nicht nachgestellt, Grenze erreicht |
| `zweitfarbe-036.spec.ts` gehärtet (`8506eb80`) | Firefox | `--repeat-each=10` (ganze Datei) | 30/30 (91 s) |
| ebenso | Chromium | `--repeat-each=10` | 30/30 (69 s) |
| ebenso | WebKit | `--repeat-each=10` | 30/30 (77 s) |
| Wegwerf-Probe (nicht committet): Zahl der Resource-Timing-Einträge und Prüfungen nach dem Neuladen | Firefox, WebKit | `-g "colour typed"` | je 2/2; 97–98 Einträge, Schnellstart 1 Prüfung, Assistent 0 (D-18) |
| `buehne-036.spec.ts`, `buehne-navigation-042.spec.ts` nach Erweiterung von `geladen-042.ts` | Firefox | ohne Wiederholung | 19/19, 1/1 |
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

**Härtung `zweitfarbe-036.spec.ts` (AC-5, Stand `8506eb80`): neu ladende Aktion → Wartebedingung**

Die Datei selbst ruft kein `evaluate`; gelesen wird in den Helfern, und die lesen erst nach dem Warten. Kein `framenavigated`, kein `waitForLoadState`, kein `vorschauGeladen`/`seiteGeladen`/`gespeichert` mehr.

| Datei:Zeile | Stelle | Wartebedingung |
|---|---|---|
| `zweitfarbe-036.spec.ts:131`–`:132` | `page.goto` des Schritts (beide Orte) | `schrittBereit(page, id, merkmal)`: `seiteBereit` (Merkmal – `BUEHNE_BEREIT` bzw. `[data-mt-zweitfarbe]`, D-17 – und `readyState` „complete“); `rahmenBereit(VORSCHAU, { rev: html[data-mt-rev] })` über `contentDocument`; im Schritt Farbe `abrufBeantwortet(…/pruefung)` des Dokuments (D-18) |
| `:143`–`:150` | Zweitfarbe tippen (Live-Speichern, lädt die Vorschau) | `entwurfGespeichert`: Antwort des Entwurfs mit der Farbe, `rahmenBereit(VORSCHAU, { rev })` der Antwort, danach die Prüfung (im Schritt Farbe) |
| `:153`–`:155` | `page.reload()` (die Stelle der CI-Beobachtung, vorher `:140`) | `dokument()` davor, `schrittBereit(…, vorDemNeuladen)`: anderes Dokument, Merkmal, `readyState`, Rahmen mit `rev`, Prüfung |
| `:166`–`:173` | „Keine Zweitfarbe“ (Enter, lädt nach dem Patch neu) | `dokument()` vor dem Tastendruck, `schrittBereit(…, vorDemLoeschen)` (statt `framenavigated` der Hauptseite und `waitForLoadState`) |
| `:195`–`:196` | Material-Test: `page.goto` des Assistenten-Schritts | `schrittBereit(page, id, BUEHNE_BEREIT)` |

**Erweiterung `geladen-042.ts` (V-3, `8506eb80`; bestehende Exporte unverändert):** `VORSCHAU`, `abrufBeantwortet(page, pfad)`, `schrittBereit(page, id, merkmal, nicht?)`, `entwurfGespeichert(page, id, traegt)`. Alle Lesungen mit `expect.poll` unter der Standardzeit bzw. auf Antworten der Seite; „Execution context was destroyed“ gilt wie D-15 als „zwischen zwei Dokumenten“.

### M5 (T4, V-2)

Die M5-Werte aus PR B (Übergabe V-2 von T4). Chromium, Apple M1 Max, 10 Kerne, 2026-11-06. **Vorher allein; nachher unter Fremdlast** eines anderen Workspace außerhalb der Sperre (load avg 6–18), deshalb zwei Nachher-Läufe. Lokal nur zur Information, das Urteil kommt aus `zeittests` (Kommentar in PR B).

| Stand | p90 je Lauf | Skripte längstens | LoAF > 50 ms je Lauf | Stil+Layout-Median (LoAF) je Lauf | CDP: Paletten-Frame Stil+Layout (Median hell / dunkel), Elemente |
|---|---|---|---|---|---|
| vorher `e4873c57` | 0, 0, 0, 0, 0 ms | 0, 0, 0, 0, 0 ms | 1, 1, 2, 1, 1 | 1, 1, 1, 1, 1 ms | 12,0 / 12,5 ms; 2 287 / 2 154 |
| nachher `1c69db9b`, Lauf A | 0, 0, 0, 0, 0 ms | 0, 0, 0, 0, 0 ms | 1, 3, 2, 2, 3 | 1, 1, 1, 1, 1 ms | 5,9 / 5,8 ms; 1 103 / 985 |
| nachher `1c69db9b`, Lauf B | 0, 0, 0, 0, 0 ms | 0, 0, 0, 0, 0 ms | 2, 3, 2, 2, 2 | 1, 1, 1, 1, 1 (ein Frame 5) ms | – |

- Die zusätzlichen Frames > 50 ms nachher haben Stil+Layout 1–2 ms und keine Skripte, kommen also nicht aus der Stil-Neuberechnung. Der Lade-Frame (267–368 ms, ohne Skripte) ist in jedem Lauf. Ein einzelner Frame mit Stil+Layout 86 ms in Lauf A/5 kam in Lauf B nicht wieder.
- Alle Neuberechnungen je Änderung (CDP): vorher 5 256 / 5 369 Elemente, 23,6 / 28,7 ms → nachher 4 012 / 4 318 Elemente, 20,7 / 26,2 ms.
- Die Maschine ist zu schnell, um die B-14-Frames zu zeigen (p90 lokal schon vorher 0 ms). Lokal belegt ist die kleinere Stil-Neuberechnung, nicht das CI-Urteil.
- **Pixelgleichheit (D-09):** Wegwerf-Vergleich außerhalb des Repos, vorher gegen nachher, pixelgenau, beide Flanken, dazu berechnete Stile aller Elemente der Werkstatt samt Shadow DOM (29 547–30 760 Elemente). 14 Fälle: hell/dunkel × Standard, `helligkeit` −0,6 / 0,5, `toenung` 0,7 bei 1280 px; 375 px hell/dunkel mit `helligkeit` 0,3; vier Fälle mit reduzierter Bewegung. Berechnete Stile: **0 Abweichungen**. Bildschirmfotos: nur Raster-Rauschen (2×2 px Delta 3 an der Bildecke von `fm-karto`, Chip-Kanten Delta 1); die Kontrolle vorher gegen vorher zeigt dieselbe Art.
- **Determinismus:** `pnpm turbo run build --filter=@fundamento/projekcioj --force` zweimal, Vitrino über `buildProjekcioj`: `dist`-Hash gleich, Ausgabebaum byte-gleich (`diff -r`).
- **Bekannte Folge:** Bis eine Palettentabelle einmal gezeigt wurde, hält sie einen Platzhalter von 30rem, das Flanken-Raster die Höhe einer Flanke. Das Dokument ist zuerst kürzer (855 px) und wächst beim Scrollen. Keine sichtbare Abweichung in den Fällen oben.

### PR A und PR B (workflow_dispatch, T5)

Je Branch genau ein `workflow_dispatch` **nach** dem Push dieses Commits. Weil danach nicht mehr gepusht wird (AC-9, D-06), stehen Lauf-ID, Kopf, Versuch, Jobs, M5 (C-2) und die Dauer der Eroj-Shards **nicht hier**, sondern in den Kommentaren von PR A („Bericht – Nachtrag CI“) und PR B. Befehle: Bericht › CI (nach dem Dispatch).

Vergleichswert für die Eroj-Shards (R-2, Trace-Kosten): Spec 041, PR A, drei Dispatch-Läufe 42079221475, 42085495161, 42087222996, Median 6:14 / 8:35 / 7:27 / 8:09 (Shard 1–4).

## Diff-Suche (AC-8)

Befehl der Implementierungs-Spec (T5), mit den lokalen Branches vor dem Push (2026-11-06; Stände A `9a19e143`, B `1c69db9b`, Basis `e4873c57` = `origin/main`). Der Doku-Commit „Bericht vor dem Dispatch“ ändert nur `specs/**`, das die Suche ausschließt.

```sh
for r in e4873c57...261106-spec-042-bhne-m5-restyle-b922d5 e4873c57...261106-spec-042-werkstatt-m5; do
  echo "== $r"
  git -C $A diff "$r" -U0 -- . ':(exclude)specs/**' \
    | grep -niE '^[-+].*(timeout|retries|waitForTimeout|interval|Intervall|setInterval|setTimeout|3000|3_000|GRENZE|threshold|Schwelle|toleran|budget|_MS\b|maxDiff|PERZENTIL|repeat)'
done
git -C $A diff e4873c57...261106-spec-042-bhne-m5-restyle-b922d5 -U0 -- . ':(exclude)specs/**' | grep -cE '^\+.*waitForTimeout'   # 0
git -C $A diff e4873c57...261106-spec-042-werkstatt-m5 -U0 | grep -cE '^\+.*waitForTimeout'                                # 0
git -C $A grep -n "export const M5_GRENZE_MS = 50;" 261106-spec-042-werkstatt-m5 -- packages/eroj/test/m5.ts            # m5.ts:20
git -C $A grep -n "}, 3000);" 261106-spec-042-bhne-m5-restyle-b922d5 -- packages/metiejo/src/html.ts                     # html.ts:735
```

**Ausgabe in Kurzform:**
- A hat 15 Treffer, alle auf `+`-Zeilen neuer Testdateien; **keine `-`-Zeile** (kein Wert geändert oder entfernt). B hat **0 Treffer**.
- `waitForTimeout` neu im Code: **0** in A und B. Ohne den Ausschluss von `specs/**` zählt A 3 Zeilen; alle sind Prosa („kein `waitForTimeout`“) in `spec.md` (Quelle, byte-gleich) und `tasks.md`.
- `M5_GRENZE_MS = 50` gefunden: `packages/eroj/test/m5.ts:20` (auf B; `m5.ts` ist in keinem der beiden Diffs). `}, 3000);` gefunden: `packages/metiejo/src/html.ts:735` (auf A; Metiejo ist in keinem Diff).
- In den fünf `playwright*.config.ts` kein Treffer: dort ist nur `trace` neu (gepinnt in `spuro-042.test.ts`).
- Kein Schlüssel, kein R-12-Wort, kein Name des privaten Schriften-Repos in neuen Zeilen: `pnpm check:privat` in A und B je 0 Treffer.

| Datei | Zeile(n) im neuen Stand | Treffer | Urteil |
|---|---|---|---|
| `packages/eroj/test/buehne-navigation-042.spec.ts` | 269 | „one interval later“ | **Kommentar**; der Test zählt Antworten des Abrufs, nicht die Uhr |
| `packages/eroj/test/geladen-042.ts` | 3 | „under the default expect timeout“ | **Kommentar**; die Helfer nutzen die Standardzeit, keine neue |
| `packages/eroj/test/spuro-042.test.ts` | 6, 26 | „every test timeout stays where it was“, „with the test timeout it had before Spec 042“ | **Kommentar** |
| `packages/eroj/test/spuro-042.test.ts` | 28–33 | `timeout: 120_000` / `300_000` (×3) / `900_000` (×2) | **Pin** der unveränderten Werte von `e4873c57` (gelesen, nicht gesetzt) |
| `packages/eroj/test/spuro-042.test.ts` | 49–51 | `retries no test`, `expect(config.retries).toBeUndefined()` | **Pin**: kein `retries` in irgendeiner Konfiguration |
| `packages/eroj/test/spuro-042.test.ts` | 54–55 | `keeps the test timeout`, `expect(config.timeout).toBe(timeout)` | **Pin**: Zeitlimits unverändert |

**Ergebnis:** nichts neu oder höher; kein `retries`, kein `waitForTimeout`, keine geänderte Grenze.

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

# T3: CI-Spur lesen und Zweitfarbe (unter der Maschinen-Sperre, nach dem Bau)
d=/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mw48j5oap3r28zm3/s042-spur/42103645313-eroj; mkdir -p $d
gh run download 42103645313 -R thojank/fundamento -p 'testberichte-eroj-*' -D $d
grep -n 'errors="1"' -A40 $d/testberichte-eroj-3-1/eroj/test-reports/playwright/junit.xml
cd packages/eroj
FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=firefox pnpm exec playwright test test/zweitfarbe-036.spec.ts -g "Schnellstart" --repeat-each=30 --workers=4   # auf 34c13f0a
for e in firefox chromium webkit; do
  FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=$e pnpm exec playwright test test/zweitfarbe-036.spec.ts --repeat-each=10 --workers=4
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

```sh
# T5: Prüfen vor dem Push (unter der Maschinen-Sperre, nacheinander, je Worktree)
comm -12 <(git -C $A diff --name-only e4873c57...HEAD | sort) <(git -C $B diff --name-only e4873c57...HEAD | sort)   # leer
git -C $A show HEAD:specs/042-buehne-m5/spec.md | shasum -a 256; git -C $A show HEAD:specs/042-buehne-m5/spec.md | wc -c
pnpm check:privat && pnpm lint && pnpm test:betroffen
# T5: je Branch genau ein Dispatch, Lauf-ID und Kopf
gh workflow run CI -R thojank/fundamento --ref <branch>
gh run list -R thojank/fundamento --workflow CI --branch <branch> --event workflow_dispatch --limit 1 --json databaseId,headSha
# T5: Jobs, Versuch, Dauer
gh run view <id> -R thojank/fundamento --json attempt,status,conclusion,headSha
gh run view <id> -R thojank/fundamento --json jobs --jq '.jobs[]|[.name,.conclusion,.startedAt,.completedAt]|@tsv'
# T5 / C-2: M5 eines Laufs (Artefakte nur lesen, je in ein neues leeres Verzeichnis)
id=<Lauf>; d=/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mw48j5oap3r28zm3/s042-spur/$id-zeittests; mkdir -p $d
gh run download $id -R thojank/fundamento -n testberichte-zeittests-x-1 -D $d
grep -rhoE "M5 Urteil \(chromium\)[^<]*" $d; grep -rhoE "M5 Long Animation Frames: [^<]*" $d
# T5: kein Push nach dem Dispatch (Köpfe vorher und nachher gleich)
git ls-remote origin refs/heads/261106-spec-042-bhne-m5-restyle-b922d5 refs/heads/261106-spec-042-werkstatt-m5
```

## Blockiert

Nichts.

## Bericht

**Stand 2026-11-06, vor dem Dispatch.**
- Spec 042 ist in fünf Tickets gebaut und liegt in zwei offenen PRs: **PR A** PR A (Branch `261106-spec-042-bhne-m5-restyle-b922d5`; `gh pr view 261106-spec-042-bhne-m5-restyle-b922d5 -R thojank/fundamento`) (Bühne und Tests: Trace, Navigationstest, Härtung) und **PR B** https://github.com/thojank/fundamento/pull/149 (Werkstatt M5).
- Beide von `main` `e4873c57`, nicht gestapelt, keine gemeinsame Datei. **Nichts gemergt**, kein Auto-Merge, kein Entwurf, kein Lauf auf `main`. **Keine Grenze angehoben** (Diff-Suche). Kein Sprachmodell, **0 $**.
- Quell-Hash = Kopie (`a8480d42…2b86878`, 5172 Byte), geprüft am Kopf vor dem Push.
- **Abweichung von der These der Spec:** keine Selbst-Navigation gefunden (Navigationstest in drei Engines sofort grün, D-16); deshalb kein Produkt-Fix in Metiejo, nur gehärtete Tests.

### PRs und Läufe

| Teil | PR | Kopf | Dateien | CI |
|---|---|---|---|---|
| A | PR A (Branch `261106-spec-042-bhne-m5-restyle-b922d5`; `gh pr view 261106-spec-042-bhne-m5-restyle-b922d5 -R thojank/fundamento`) | Doku-Commit „Spec 042: Bericht vor dem Dispatch“ auf Code-Kopf `9a19e143` | 13, Zone A | ein `workflow_dispatch` nach diesem Push → Kommentar „Bericht – Nachtrag CI“ in PR A |
| B | https://github.com/thojank/fundamento/pull/149 | `1c69db9b` | 3, `packages/projekcioj/src/celoj/vitrino/**` | ein `workflow_dispatch` → Kommentar in PR B (Lauf, Jobs, M5) |

**Lokale Prüfung von T5 (Apple M1 Max, unter der Maschinen-Sperre):** 
- Disjunktheit (`comm -12` leer), Zonen, AC-1-Hash: wie oben.
- A (`9a19e143`): `pnpm check:privat` 0 Treffer (4163 Dateien); `pnpm lint` grün (20/20). `pnpm test:betroffen` rot nur am Zeitlimit eines Hooks unter eigener Last (`modelo` `turbo-inputs.test.ts:679`, 10 000 ms). Paketweise (`pnpm turbo run test --concurrency=1 --continue`, sechs Pakete, drei Engines): alles grün außer einem Eroj-Test; Eroj-Vitest 43/43, Eroj-Playwright 1914 bestanden, **1 rot**: `[webkit] achsen-2b2.spec.ts:82` (`toBeFocused` nach `Tab`, „inactive“), auch einzeln 0/3. Das ist **Spec 041 N-1** (macOS-WebKit, in der CI bisher nicht rot), Datei in keinem Diff.
- A, Nachzug T2 (`9a19e143`): `buehne-navigation-042.spec.ts` mit einer Wegwerf-`tsconfig` samt `test/` typrein; Chromium 1/1.
- B (`1c69db9b`): `pnpm check:privat` 0 Treffer; `pnpm lint` grün (20/20). `pnpm test:betroffen` rot nur am Zeitlimit unter eigener Last (`cli` `index.test.ts:343`, 30 000 ms). Paketweise: alles grün außer demselben N-1; Eroj-Playwright 1911 bestanden, 1 rot.

### Befund → Ursache → Fix

| Befund | Ursache | Fix | Stand |
|---|---|---|---|
| B-10 (WebKit 3.2) | keine Selbst-Navigation; im zweiten Dokument liefen die Modulskripte nicht, warum zeigt die Spur nicht | kein Produkt-Fix; `oeffne()` wartet auf Merkmal, `readyState`, beide Rahmen (`77778d6a`); Trace bei nächstem Rot (T1) | offen mit Spur |
| B-13 (WebKit 3.5) | wie B-10 | wie B-10 | offen mit Spur |
| Load failed (WebKit 3.5) | Signatur von Spec 041 B-8; der Lauf hatte den Fix nicht | behoben durch Spec 041 B-8 (`7e0ff9ec`, `178ed2a9`) | behoben (041) |
| Execution context destroyed (Chromium 3.1) | Test las im Rahmen während der erwarteten Navigation nach „Hell“ | `grund()` liest erst nach `rahmenBereit`, über `contentDocument` (`77778d6a`) | behoben (Test) |
| Zweitfarbe Firefox (`:111`) | Verdacht: verpasstes `framenavigated` bzw. altes `frame.url()` in Firefox (041 B-9/B-15); lokal 30/30 grün, nicht nachgestellt | Datei wartet auf Zustände statt `framenavigated` (`8506eb80`) | offen mit Spur (gehärtet) |
| B-14 (M5) | `content-visibility` auf Tabellen wirkt in Chromium nicht; Flanken außerhalb des Bildes gestylt | PR B: Tabellen in Blöcken, Flanken-Raster übersprungen (`89636d4f` → `1c69db9b`) | lokal behoben; CI-Urteil im Kommentar von PR B |
| N-7 (neu) | Schema-Schalter-Suche findet die Wurzel; `change` außerhalb der Bühne lädt „Jetzt“ hell neu | keiner (sichtbares Verhalten, eigene Spec) | offen (Maintainer) |

### M5 vorher/nachher (lokal)

- p90: vorher 0 ms in 5/5 Läufen, nachher 0 ms in 10/10 Läufen (Grenze 50 unverändert). Die Maschine ist zu schnell für die B-14-Frames.
- Stil+Layout-Median (LoAF): 1 ms vorher und nachher (nur Lade-Frames > 50 ms). CDP, Paletten-Frame je Schieber-Änderung: **12,0 / 12,5 → 5,9 / 5,8 ms** (hell/dunkel), Elemente 2 287 / 2 154 → 1 103 / 985.
- CI-Ausgangswert (Spec 041): p90 51/53/55 ms, Stil+Layout 42/40/40,5 ms. CI-Wert nachher: Kommentar in PR B.
- Pixelgleich (0 Abweichungen der berechneten Stile in 14 Fällen), Build deterministisch. Einzelheiten: Messungen › M5.

### Prüfung gegen die Abnahmekriterien (vor der CI)

| AC | Urteil vor der CI | Beleg |
|---|---|---|
| AC-1 | erfüllt | Hash und Größe am Kopf gleich der Quelle |
| AC-2 | erfüllt (lokal) | `retain-on-failure` nur in `playwright.config.ts`, Trace landet im HTML-Bericht, den „Testberichte“ hochlädt (D-01); kein `retries` (Pin) |
| AC-3 | erfüllt, mit Abweichung | Navigationstest zeigt in drei Engines nur die eigenen Navigationen; **kein roter Commit**, weil sofort grün (D-16) – die rote Fassung der Spec setzt eine gefundene Selbst-Navigation voraus |
| AC-4 | erfüllt (lokal) | `buehne-036` 95/95 je Engine, `stato-041` grün, Metiejo unverändert; CI im Nachtrag |
| AC-5 | erfüllt | Wartestellen in Messungen › Lokal |
| AC-6 | erfüllt als Befund mit Spur | 30/30 lokal, Datei gehärtet |
| AC-7 | lokal erfüllt, CI offen | p90 lokal 0 ms; Stil+Layout CDP 5,9 ms; `M5_GRENZE_MS` = 50; CI-p90 im Kommentar von PR B |
| AC-8 | erfüllt | Diff-Suche |
| AC-9 | offen bis nach dem Dispatch | im Nachtrag: je ein Dispatch, Versuch 1, Köpfe unverändert |
| AC-10 | erfüllt | beide offen, nicht Entwurf, von `e4873c57`, `comm -12` leer |
| AC-11 | beim Maintainer | drei Läufe auf `main` nach dem Merge |

### CI (nach dem Dispatch)

Nach dem Push dieses Commits startet je Branch **genau ein** `workflow_dispatch`. Danach wird nicht mehr gepusht (AC-9, D-06). Deshalb stehen die Läufe und ihre Auswertung **nicht in dieser Datei**, sondern:
- in PR A als Kommentar „Bericht – Nachtrag CI“ (beide Läufe, Jobs, M5 nach C-2, Dauer der Eroj-Shards gegen Spec 041, Befund-Tabelle nachgeführt, AC-Abgleich final);
- in PR B als Kommentar (Lauf, Jobs, M5 CI).

Nachlesen:

```sh
gh pr view <nr> -R thojank/fundamento --comments
gh run list -R thojank/fundamento --workflow CI --branch 261106-spec-042-bhne-m5-restyle-b922d5 --event workflow_dispatch --limit 1 --json databaseId,headSha,attempt,conclusion
gh run list -R thojank/fundamento --workflow CI --branch 261106-spec-042-werkstatt-m5 --event workflow_dispatch --limit 1 --json databaseId,headSha,attempt,conclusion
gh run view <id> -R thojank/fundamento --json jobs --jq '.jobs[]|[.name,.conclusion]|@tsv'
# M5 (C-2) und Trace eines roten Eroj-Tests: Messanleitung (T5)
```

### Was der Maintainer als Nächstes tut

1. PRs prüfen: PR A (Branch `261106-spec-042-bhne-m5-restyle-b922d5`; `gh pr view 261106-spec-042-bhne-m5-restyle-b922d5 -R thojank/fundamento`) und https://github.com/thojank/fundamento/pull/149, dazu die beiden Kommentare mit den Dispatch-Läufen.
2. Mergen in beliebiger Reihenfolge; beide sind nicht gestapelt und teilen keine Datei.
3. Danach **drei `workflow_dispatch`-Läufe auf `main`, nacheinander**: `gh workflow run CI -R thojank/fundamento --ref main`; den nächsten erst, wenn der vorige fertig ist. M5 mit C-2 lesen (Messanleitung). Das ist AC-11.
4. Die Entscheidungen D-01 bis D-19 in `specs/042-buehne-m5/plan.md` bestätigen (D-12 bis D-19 aus dem Lauf).
5. Offen beim Maintainer: B-10/B-13 beim nächsten Auftreten mit dem Trace lesen; N-7 als eigene Spec.
