# Spec 050: Wacklige Browser-Tests aus Spec 036 stabil machen (zweitfarbe-036, buehne-036, achsen-2b2)

**Status:** Auftrag für eine Sitzung im Spec-Modus · **Erstellt:** 2026-11-12 · **Basis:** aktuelles `main` (`de931e40`, nach #163) · **Zielpfad im Repo:** `specs/050-wacklige-tests-036/` (`plan.md`, `tasks.md`, `bericht.md`)

## Regel 0

- **Keine Budgets, Grenzen, Schwellen, Zeitlimits, Abfrageintervalle oder Toleranzen anheben.** Verboten sind neue oder höhere `timeout`, `expect.timeout`, `actionTimeout`, `navigationTimeout`, `retries`, `timeout-minutes`, `waitForTimeout`, ein anderer `stato`-Takt, eine größere Pixel- oder Farbtoleranz und weniger Engines oder Shards.
- **Ursache vor Symptom.** Kein Fix ohne belegte Ursache je Test (Trace, Messung oder Reihenfolge).
- **Rote Tests zuerst**, wo ein Produktfehler gefunden wird. Der Test, der den Fehler zeigt, wird vor dem Fix rot committet.
- **Nichts mergen.** Keine Schlüssel. Nur die Marken des Repos. Kein Sprachmodell. Es gelten `standards/global/delivery.md` und `standards/global/testing.md`.

## Laufbegrenzung (bindend)

- Höchstens **6 Tickets**, ein Strang.
- **Ein PR** gegen `main`, **ein Push**, danach genau **ein** `workflow_dispatch`-Lauf. Kein Push danach, kein Rerun.
- Je Test höchstens **30 lokale Wiederholungen** pro Messreihe (vorher und nachher, siehe AC-4).
- Lokale Messungen nur allein auf dem Rechner (Sperre wie Spec 042).

## Worum es geht

Fünf Playwright-Tests aus Spec 036 sind in fast jeder CI rot und werden in den Berichten seit PR #155 als „bekannt fremd“ abgehakt (#155, #158, #162, #163; zuletzt Dispatch 43174596533). Eine CI, die immer rot ist, sagt nichts mehr. Das Wochenziel 2026-W46 lautet „CI wieder aussagekräftig machen“.

Spec 040, 041, 042, 043 und 044 haben diese Tests schon viermal angefasst: neue Hilfen zum Warten (`geladen-042.ts`, `wackler-040.ts`) und eine Prüfung im Worker (Spec 044). Die Tests sind trotzdem rot. Spec 044 hat gemessen: Die erste Prüfung eines neuen `rev` braucht lokal ≈ 1,5 s und auf dem Runner 3–4,5 s, manchmal über 5 s. Das liegt im 5-s-Fenster der Erwartungen oder darüber. Ist die Prüfung zu langsam, ist das ein **Produktbefund**: Auch Nutzer warten so lange (Assistent, Schnellstart, Studio).

## Betroffene Tests

| # | Test | Engines | Fehler in der CI | Vermutung (zu belegen oder zu verwerfen) |
|---|---|---|---|---|
| T-A | `packages/eroj/test/zweitfarbe-036.spec.ts:129` „Keine Zweitfarbe …“ (Assistent und Schnellstart) | Firefox, WebKit | Rahmen `iframe[data-mt-vorschau]` mit `rev 2` bzw. `/api/marko/…/pruefung` nicht in 5000 ms | PR #158 (D-1): Die Prüfung des neuen `rev` dauert auf dem Runner länger als 5 s, und der Rahmen wartet dahinter. CI 8 von 9 rot. |
| T-B | `zweitfarbe-036.spec.ts:196` „the screen is ready while its preview still loads“ | Firefox, WebKit | „the page's request to /api/marko/…/pruefung is answered“ nicht in 5 s | Wie T-A: die erste Prüfung des Servers (Marke `dukolora-rahmen-30`, rev 1) dauert über 5 s. Es kann auch der Kaltstart des Workers sein (Spec 044 D-28). |
| T-C | `buehne-036.spec.ts:463` „3.4: material opens in a dialog …“ | Firefox | „Execution context was destroyed“ | PR #158: Firefox navigiert den Rahmen nach dem Neuladen zweimal. Zu klären: Welcher Kontext stirbt (Seite oder Rahmen), und in welchem Aufruf (`bildschirm()` → `page.evaluate`, `kachelnOf`, `geladen`)? Möglich ist auch, dass die Seite sich selbst neu lädt (`stato` meldet einen neuen `rev`), während der Test liest. |
| T-D | `buehne-036.spec.ts:545` „3.5: a component with an open problem …“ | Firefox | Test-Timeout 120 s nach der Prüfung; im `pull_request`-Lauf grün, im Dispatch rot | Eine Aktion ohne eigenes Zeitlimit (`hover`, `focus`, `evaluate` im `frameLocator`) wartet bis zum Test-Timeout auf ein Element in einem Rahmen, der neu lädt. Nach `festlegen` rechnet der Rahmen `buehne-*` eine kalte Prüfung (Spec 044, Lauf 42180054807: `GET /asistanto/…` bis 5,1 s). Dazu kommt Last im Dispatch: drei Engines, mehr Tests pro Shard. |
| T-E | `packages/eroj/test/achsen-2b2.spec.ts:82` „A-markobutono-1: a read-only checkbox …“ | WebKit, nur macOS (lokal) | `toBeFocused` nach `Tab` | WebKit auf macOS fokussiert mit Tab nur Textfelder, keine Checkboxen oder Buttons (Systemeinstellung „Tastaturnavigation“). Dann sagt der Test etwas über die Plattform, nicht über die Komponente. |

## Ziele

1. **Ursache je Test belegt**, eingeordnet in genau eine Klasse:
   - **K1 Last im Shard:** Der Test ist richtig, aber der Runner ist ausgelastet.
   - **K2 Warten auf den falschen Zustand:** Der Test wartet auf ein Ereignis oder einen Zustand, der nicht sicher kommt oder schon vorbei ist.
   - **K3 Navigation während `evaluate`:** Der Test liest in einem Kontext, der gerade ersetzt wird.
   - **K4 Produktfehler:** Der Prüf-Endpunkt oder die Vorschau ist zu langsam, oder die Seite navigiert öfter als nötig.
   - **K5 Plattform:** Eine Eigenheit des Browsers oder Betriebssystems, nicht des Produkts.
2. **Fix an der Ursache:**
   - K4 → das Produkt wird schneller oder korrekter (rot zuerst).
   - K2/K3 → der Test wartet auf den richtigen Zustand, ohne Uhr.
   - K1 → die Last wird erklärt und die Ursache behoben (siehe Grenzfälle). Keine Zeitgrenze wird angehoben.
   - K5 → der Test prüft auf jeder Plattform dasselbe Verhalten der Komponente.
3. **30/30 grün lokal** je Test unter CI-ähnlicher Last.
4. **CI ohne diese Ausnahmen:** Im einen Dispatch sind alle vier Eroj-Shards in allen drei Engines grün, ohne „bekannt fremd“ für T-A bis T-D.

## User Stories

- **Als Maintainer** will ich, dass eine rote CI einen echten Fehler meldet. Dann muss ich nicht mehr in jedem Bericht dieselben vier Tests als „bekannt fremd“ abhaken.
- **Als Brandmanager im Assistenten oder Schnellstart** will ich, dass die Prüfung und die Vorschau nach einer Änderung schnell antworten. Heute sind es mehrere Sekunden, auf langsamen Rechnern über 5 s.
- **Als Agent in einem späteren Lauf** will ich je Test eine belegte Ursache im Bericht finden und kein fünftes Mal raten müssen.

## Ablauf (ein Strang)

### T1: Diagnose vorher, ohne Änderung

- Die Vorher-Rate je Test messen: 30 Wiederholungen unter CI-ähnlicher Last (Abschnitt „Last lokal“), Firefox und WebKit, für T-E WebKit auf macOS.
- Je roten Lauf einen Trace sichern (`retain-on-failure` gibt es schon). Dazu die Traces der CI-Läufe aus den Testberichten von #158, #162 und #163 auswerten, soweit sie noch abrufbar sind.
- Je Test festhalten: welche Erwartung oder Aktion scheitert, worauf sie wartet und welche Anfrage oder Navigation im Weg steht (Zeitleiste aus dem Trace).
- Für T-A, T-B und T-D: die Dauer von `POST /pruefung`, dem ersten Rahmen eines `rev`, `GET /asistanto/…` und `GET stato` messen, lokal und aus dem CI-Trace. Format der Tabelle wie in Spec 044.
- Ergebnis: Tabelle „Ursache je Test“ im `plan.md`, mit Klasse K1–K5 und Beleg. **Kein Fix vor dieser Tabelle.**

### T2: Prüfung schneller (falls K4 für T-A, T-B oder T-D belegt ist)

- Zuerst ein roter Test im Paket, der die langsame Stelle zeigt, ohne Uhr: über die Reihenfolge (wie `stato-044`) oder über die Anzahl der Rechnungen (z. B. „eine Änderung der Zweitfarbe rechnet die Ableitung der Paletten nicht neu“).
- Die Prüfung beschleunigen. **Frei sind `packages/metiejo/src/**` und `packages/agordilo/src/**`**, also auch die Ableitung (`deriveAspekto`, `derivationBasis`) und `checkDraft`. Mögliche Wege, je nach Messung:
  - Ergebnisse je Teil des `Agordo` wiederverwenden (eine neue Zweitfarbe rechnet nicht die ganze Ableitung neu),
  - doppelte Arbeit zwischen Rahmen `buehne-*`, `stato` und `/pruefung` desselben `rev` vermeiden,
  - den Kaltstart des Workers so legen, dass die erste Prüfung nicht dahinter wartet,
  - nur Prüfregeln rechnen, deren Eingaben sich geändert haben.
- **Antworten bleiben byte-gleich:** Vergleich vorher/nachher für einen festen Satz Marken und `rev`, wie in Spec 044 T4.
- Messziel für den Bericht (keine Grenze im Code): erste `/pruefung` eines neuen `rev` lokal im Median **unter 1 s**, auf dem Runner sicher unter 5 s.

### T3: Tests an der Ursache (K2, K3)

- T-C und T-D: Die Hilfen in `geladen-042.ts` lesen weiter Zustände, nie `framenavigated`, nie die Uhr. Wo ein Test in einem Rahmen liest, der neu lädt, wartet er zuerst auf dessen geladenen Zustand (`rahmenBereit` mit `rev`). Ein Lesen über `page.evaluate` geschieht erst, wenn die Seite steht.
- Navigiert die Seite oder der Rahmen öfter als einmal pro Änderung (Firefox, PR #158), ist das **K4**. Dann gilt: roter Test im Paket `metiejo` oder als Playwright-Test („nach dem Neuladen genau eine Navigation des Rahmens je `rev`“), danach der Fix im Client (`buehne-klient.ts` / `html.ts`).
- Aktionen ohne eigenes Zeitlimit (`hover`, `focus`, `click` in einem Rahmen) folgen nur einem Zustand, der vorher mit `expect` unter dem Standard-Fenster bestätigt wurde. Sonst hängen sie bis zum Test-Timeout, und der Fehler sagt nicht, worauf sie warten.

### T4: achsen-2b2:82 (K5 oder Komponente)

- Belegen, ob WebKit auf macOS die Checkbox per Tab überhaupt erreichen kann (Systemeinstellung, `tabsToLinks` bzw. die Einstellung von Playwright für WebKit).
- Ist es die Plattform: Der Test prüft weiter, dass das Steuerelement fokussierbar ist (`tabIndex >= 0`, fokussiert per `focus()`), und dass Leertaste, Klick und Label den Wert nicht ändern. Die Tab-Reihenfolge prüft er dort, wo die Plattform sie zulässt. Die Tastaturprüfung wird nicht schwächer: Auf Linux-WebKit, Chromium und Firefox bleibt `Tab` der Weg.
- Ist es die Komponente (z. B. `tabindex` fehlt auf macOS-WebKit): zuerst roter Test, dann Fix in `fm-markobutono`. Spec 035 AC-10 gilt: kein Pixel ändert sich.

### T5: Schlusslauf lokal

- Je Test 30 Wiederholungen unter CI-ähnlicher Last. Alle 30 sind grün. Ist einer rot, bleibt der Test offen (Befund mit Trace), und der Lauf geht nicht weiter zum PR, ohne dass das im Bericht steht.
- Dazu einmal die ganze Eroj-Suite in drei Engines (Regressionen).
- Diff-Suche (siehe AC-6).

### T6: PR, ein Dispatch, Bericht

- Ein PR gegen `main`, ein Push, genau ein `workflow_dispatch`. Nichts mergen.
- Bericht `specs/050-wacklige-tests-036/bericht.md`: PR-Link, CI je Job (Format wie Spec 049), Tabelle „Ursache je Test“, Messung vorher/nachher, 30/30-Tabelle, was der Maintainer tut. Dann stoppen.

## Last lokal (CI-ähnlich)

- Der Runner hat 4 Kerne, Playwright nimmt dort 2 Worker, und ein Shard (`--shard n/4`) führt die Tests aller Engines aus, die der Lauf wählt. Im Dispatch sind das drei.
- Lokal: `--workers 2`, `PLAYWRIGHT_ENGINES="chromium firefox webkit"`, der Test mit `--repeat-each` und gleichzeitig der Rest seiner Datei. Für T-D zusätzlich der Shard, in dem er in der CI lief (`--shard 2/4`).
- Wenn die Last so nicht reicht, um die Vorher-Rate zu zeigen (vorher 30/30 grün), kann die CPU künstlich begrenzt werden (z. B. ein paralleler Prozess mit fester Last). Das Verfahren steht im `plan.md`. Belegt dann nur die CI-Zeitleiste die Ursache, ist das ein Befund und kein Grund, ohne Beleg zu fixen.

## Acceptance Criteria

- **AC-1 Ursache je Test:** Für T-A bis T-E steht im `plan.md` je eine Zeile mit Klasse (K1–K5), Beleg (Trace-Ausschnitt, Messwert oder Reihenfolge) und Verweis auf den CI-Lauf oder den lokalen Lauf.
- **AC-2 Rot zuerst:** Für jede Ursache der Klasse K4 gibt es einen Commit mit einem roten Test vor dem Fix-Commit. Der Test ist im Fix-Commit unverändert grün.
- **AC-3 Produkt schneller (falls K4 Prüfung):** Messung vorher/nachher je Schritt (Ableitung, Prüfregeln, Rahmen, `stato`) lokal und aus dem einen Dispatch. Die erste `/pruefung` eines neuen `rev` liegt lokal im Median unter 1 s, oder es gibt einen Befund mit Werten, warum nicht. Die Antworten sind byte-gleich.
- **AC-4 30/30:** Je Test T-A bis T-D in Firefox und WebKit (und Chromium) und T-E in macOS-WebKit gibt es eine Tabelle „vorher x/30, nachher 30/30“ unter der Last aus „Last lokal“.
- **AC-5 CI:** Im einen Dispatch sind die Jobs „Rendered Eroj (Playwright, shard 1–4 of 4)“ in allen drei Engines grün. Keiner der Tests T-A bis T-D steht im Bericht als „bekannt fremd“. Andere rote Jobs, die keine geänderte Datei berühren, werden mit Ursache aufgeführt, nicht neu gestartet.
- **AC-6 Diff-Suche:** Die Suche im Diff findet kein neues oder höheres `timeout`, `expect.timeout`, `actionTimeout`, `navigationTimeout`, `retries`, `timeout-minutes` und `waitForTimeout`, keinen neuen `setTimeout` mit Dauer in Tests, keine geänderte Toleranz und keinen geänderten `stato`-Takt. Kein Test ist `skip`, `fixme`, `fail` oder auf eine Engine eingeschränkt worden.
- **AC-7 Keine Abschwächung:** Jede Erwartung, die ein Test vorher hatte, steht nachher noch da oder ist durch eine gleich starke ersetzt. Jede Ersetzung ist im `plan.md` begründet.
- **AC-8 Keine Pixeländerung:** Die Baselines der visuellen Tests bleiben unverändert (Spec 035 AC-10).

## Umfang

### Frei

- `packages/eroj/test/zweitfarbe-036.spec.ts`, `buehne-036.spec.ts`, `achsen-2b2.spec.ts`, `geladen-042.ts` und `wackler-040.ts` (nur im Sinn von T3/T4; die Erwartungen bleiben).
- `packages/metiejo/src/**` (Server, Prüfung, Worker, Client der Bühne, `html.ts`) und die Tests in `packages/metiejo`.
- `packages/agordilo/src/**` (Ableitung, Kalibrierung), nur ohne Änderung der Ergebnisse.
- `packages/eroj/src/**` nur für die Komponente aus T-E, falls K4 belegt ist.
- `specs/050-wacklige-tests-036/**`.

### Tabu

- Jede Grenze, jedes Zeitlimit, `retries`, Toleranzen, der `stato`-Takt.
- `.github/**`, `playwright.config.ts` (Zeitlimits, Worker, Projekte), Root-Dateien.
- `packages/modelo/**`, `packages/nordstelo/**`, `packages/ekranoj/**`, `packages/mcp/**`.
- Andere wacklige Tests (z. B. `ci/turbo-inputs.test.ts:679` in `modelo`, B-11 `ekranoj`): nur als Befund im Bericht, kein Fix.

### Nicht enthalten

- Neue Funktionen in Assistent, Schnellstart oder Studio.
- Ein anderer Aufbau der CI (mehr Shards, andere Runner, weniger Engines).
- Mergen des PR und die drei Läufe auf `main` danach. Das macht der Maintainer.

## Grenzfälle und Fehlerzustände

- **Nur Last (K1), Produkt schnell genug:** Wenn die Prüfung nach T2 lokal unter 1 s liegt und die CI trotzdem über 5 s braucht, ist das kein Grund, das Fenster anzuheben. Dann misst der Bericht, was den Runner belegt (z. B. drei Metiejo-Server pro Worker und Datei, Kaltstart je Server). Ein Fix ist erlaubt, wenn er die Last senkt, ohne den Test zu schwächen, z. B. ein Server pro Datei statt pro Worker. Sonst bleibt es ein Befund.
- **Firefox navigiert den Rahmen zweimal:** Das ist ein Produktbefund (doppelte Arbeit, sichtbares Flackern). Erst rot, dann Fix im Client. Der Test darf eine doppelte Navigation nicht stillschweigend zulassen.
- **Ein Test wird vorher lokal nie rot:** Die Ursache wird aus den CI-Traces belegt. Lässt sie sich nicht belegen, gibt es keinen Fix auf Verdacht, sondern einen Befund „nicht reproduziert“ mit den Läufen.
- **Ein Fix macht einen anderen Test rot:** Der Lauf stoppt den Fix. Der Befund kommt in den Bericht, und die Ursache wird nicht über den anderen Test „gelöst“.
- **Byte-Gleichheit bricht:** Dann ist der Fix falsch. Die Antwort wird nicht angepasst, die Baseline nicht erneuert.
- **Der Dispatch zeigt einen der Tests weiter rot:** Kein Rerun, kein zweiter Push. Der Bericht nennt den Test, den Trace und die nächste Vermutung.
- **Rebase-Konflikte:** Der Lauf basiert auf `main` `de931e40`. Specs 035–037 und 046–049 sind gemergt. Kommt vor dem Push ein neuer Merge auf `main`, wird nicht rebased, sondern die Basis im Bericht genannt.

## Bericht

Kurz und auf Deutsch: PR-Link, CI je Job, Tabelle „Ursache je Test“, Messung vorher/nachher, 30/30-Tabelle, Diff-Suche, was der Maintainer tut (PR prüfen, mergen, drei Läufe auf `main`). Dann stoppen.
