# Spec 043 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `e5057afc`. Genau vier Tickets (Spec, „Tickets“; Anhang C). Rote Commits enden auf „(rot)“, grüne auf „(grün)“; Doku-Commits beginnen mit „Spec 043:“ und sind einzeln. Häkchen mit SHAs.

Ein Strang, ein PR (T1 → T2 → T3 → T4). Lokal nur die geänderten Spec-Dateien, nie zwei Playwright-Suiten gleichzeitig, `FM_AUSGABE=knapp`, je Wackel-Test höchstens 30 Wiederholungen.

| Ticket | Inhalt | Dateien | Stand | rot → grün |
|---|---|---|---|---|
| T1 | N-8 aus Spec 042: abgebrochenen, leeren oder alten Vorschau-Rahmen ereignisgesteuert sofort neu anfordern (D-1 bis D-3); Gerüst `specs/043-nachbesserung-042/` | `specs/043-nachbesserung-042/{spec,plan,tasks}.md`, `packages/eroj/test/buehne-navigation-042.spec.ts` (neuer Test), `packages/metiejo/src/html.ts`, `vorschau-043.test.ts` (neu) | erledigt (Chromium, Firefox behoben; WebKit Befund, D-6) | Gerüst `3c9d7d75`; N-8 `8a65d6f4` → `20f221cc` |
| T2 | `seiteBereit` auf `readyState !== "loading"`; Firefox-Fehler im Navigationstest klären (F-2, D-4) | `packages/eroj/test/geladen-042.ts`, `zweitfarbe-036.spec.ts`, `buehne-navigation-042.spec.ts` | erledigt | `seiteBereit` `dc69bd93` → `3e4102ac`; Navigation Firefox: rot = CI 42180054807 + lokal 4/30 (`b43bc7e9`) → `0b2d29c4` |
| T3 | Übernahme WebKit: N-3-Startmuster, POST mit `connection: close` | `packages/eroj/test/metiejo-036-uebernahme.spec.ts` | offen | – |
| T4 | Diff-Suche, ein PR, ein Push, genau ein `workflow_dispatch`, Bericht | `specs/043-nachbesserung-042/{plan,tasks}.md` | offen | – |

## T1 im Einzelnen

- [x] G-0: Quelle und Kopie 4590 Byte, SHA-256 `b260ae62fbf95cba5a08454d32f5a78e615743ee57369b17cd45789b57701949`, kopiert mit `cp`.
- [x] G-0 nach dem Commit erneut: `git show HEAD:specs/043-nachbesserung-042/spec.md | shasum -a 256` gleich, 4590 Byte – `3c9d7d75`.
- [x] Roter Test in `buehne-navigation-042.spec.ts`: Bühne bereit, `page.reload()`, erste Anfrage des Rahmens „Jetzt“ mit `route.abort` abgebrochen, dann `rahmenBereit(page, JETZT, { rev, scheme: "light" })` unter der Standard-Wartezeit – rot in Chromium, Firefox, WebKit (je 1/1) – `8a65d6f4`.
- [x] Fix in `packages/metiejo/src/html.ts` (`vorschauSenden`/`vorschauNochmal`, von `refreshFrame()` und `refreshNachher()` benutzt): `load` des Rahmens (Fehlerseite), `load` der Seite und `pageshow` (wiederhergestellt), jeweils nur nach begonnener Navigation (D-5); kein neuer Timer; höchstens eine sofortige Neuanforderung je erwarteter URL; ein richtig geladener Rahmen bekommt keine zweite `src` – `20f221cc`.
- [x] Neuer Test je Engine 30 Wiederholungen (10 + 20): Chromium 30/30 grün, Firefox 30/30 grün, WebKit 30/30 wie markiert rot (Befund N-8 WebKit, D-6: WebKit meldet einen abgebrochenen Rahmen mit keinem Ereignis).
- [x] Bestehender Navigationstest in denselben Läufen: Chromium, Firefox, WebKit je 30/30 grün, genau eine `src` je Anlass und Rahmen. F-2 trat in Firefox nicht auf. (Erster Entwurf ohne D-5: WebKit rot mit zwei `src` bei `laden-1`, nicht committet.)
- [x] `pnpm --filter @fundamento/metiejo test` 557/557 grün (`stato-041.test.ts`: ein Takt, `3000`; neu `vorschau-043.test.ts`, D-7). Lint Metiejo grün; Typprüfung des Navigationstests mit einer Wegwerf-`tsconfig` sauber; `biome check` der Datei sauber.
- [x] Natürliche N-8-Nachstellung (Firefox, „Keine Zweitfarbe“ = `sendDraft` + `location.reload()`, 30 Läufe auf `20f221cc`): **nicht nachgestellt, 0/30** – kein Rahmen der neuen Seite brach ab (nur die Anfrage der alten Seite, 30/30, erwartet). Nebenbefunde in plan.md › Befunde: Firefox stellt beim Neuladen die Rahmen zuerst auf das alte rev (30/30); 1/30 `rahmenBereit` warf „can't access property getAttribute“ (für T2).
- [x] Diff-Suche gegen `e5057afc` (das lokale `main` ist veraltet): einzige Treffer sind die zwei Zeilen der byte-gleich kopierten `spec.md` (Regel 0 und Abnahme, sie zitieren die Wortliste). Geänderte Dateien nur in den freien Pfaden.
- [x] Für T2: `rahmenBereit` liest ein Rahmen-Dokument ohne `documentElement` als „nicht geladen“ (plan.md › Befunde, D-10) – in T2 erledigt, `3e4102ac`.

## T2 im Einzelnen

- [x] Roter Test in `zweitfarbe-036.spec.ts` („the screen is ready while its preview still loads“, für Assistent und Schnellstart): `page.route` hält jede Antwort von `/marko/<id>/vorschau` zurück, bis ein Promise des Tests sie freigibt (kein Timer); `page.goto(…, { waitUntil: "domcontentloaded" })`, `seiteBereit` muss aufgelöst sein, solange der Rahmen hängt; danach Freigabe und `schrittBereit`. Auf dem alten `seiteBereit` rot in Chromium 2/2 und Firefox 2/2, genau der CI-Fehler (`readyState` „interactive“ statt „complete“, 5 s); in WebKit grün (10/10, D-9) – `dc69bd93`.
- [x] `seiteBereit` wartet auf `merkmal && neu && readyState !== "loading"` (Poll-Meldung „readyState not loading“, JSDoc mit dem Hinweis auf Module); Signatur, Rückgabe und Wartezeit unverändert. `rahmenBereit` liest ein Rahmen-Dokument ohne `documentElement` als „nicht geladen“ (Befund T1). `schrittBereit`: erst die `/pruefung`-Antwort, dann der Rahmen (D-8, gemessen). Kommentar in `zweitfarbe-036.spec.ts` angepasst. Roter Test danach grün in Chromium, Firefox, WebKit (je 10/10 + 6/6) – `3e4102ac`.
- [x] Aufrufer von `seiteBereit` mit Rahmen prüfen danach `rahmenBereit`: `buehne-036.spec.ts:129` (`:131`/`:132`), `buehne-navigation-042.spec.ts` (`rahmen()` bzw. `rahmenBereit` nach jedem `seiteBereit`), `zweitfarbe-036.spec.ts` über `schrittBereit`. Schnellstart (`[data-mt-zweitfarbe]` kommt vom Server): `schrittBereit` liest danach die `/pruefung`-Antwort und den Rahmen, beides macht nur der Client.
- [x] Nachstellung F-2 (Firefox, bestehender Navigationstest, Stand nach T1: `buehne-navigation-042.spec.ts` und `geladen-042.ts` wie in `a6fb5d6b`), `--repeat-each=30 --workers=4`: **nachgestellt, 4/30 rot**, alle vier genau wie CI 42180054807: je Rahmen fehlen „rev“ und „rev navigate“ (Expected −4, Received +0), `src` für „rev“ ist notiert, die Bindung hat nur die zwei `src`-Einträge. Das ist der rote Beleg nach F-3 (CI 42180054807 + 4/30 lokal), vor dem Fix committet – `b43bc7e9`.
- [x] Trace-Analyse in plan.md › Befunde (T2): Auszug aus `testberichte-eroj-2-1` (`src` „rev“ notiert, Netz 200, keine Einträge `sessionStorage`/`performance` und keine Bindung für die Rahmen-Dokumente „rev“, Diff −4). Nicht N-8, Lücke des Beobachters.
- [x] Fix nach `testing.md` (D-4, D-11): Die Seite zählt die Rahmen-Dokumente mit (`load` jedes `iframe` in der Capture-Phase, `timeOrigin`, URL, Navigationstyp); je Rahmen zählen die Dokumente, die eine der Quellen sah, je Dokument einmal. Erwartung gleich streng (Seite 2, je Rahmen genau 5 Dokumente `… navigate` und 5 `src`, `andere: []`). Kein `framenavigated`, kein `waitForLoadState`, keine Wartezeit – `0b2d29c4`.
- [x] Grün nach dem Fix, ganze Datei `buehne-navigation-042.spec.ts`: Firefox 60/60 (`--repeat-each=30`, Navigationstest 30/30), Chromium 20/20, WebKit 20/20 (N-8-Test dort wie markiert rot, D-6). Wegwerf-Probe (Firefox 30): Init-Skript lückenhaft in 9/30 (8× „rev“, 1× „laden-2“), Seite vollständig in 30/30.
- [x] `zweitfarbe-036.spec.ts` (5 Tests, darin der neue) `--repeat-each=30`: Chromium 150/150, Firefox 150/150, WebKit 150/150 grün.
- [x] `buehne-036.spec.ts` **unverändert**, `--repeat-each=2`: Chromium 38/38, Firefox 38/38, WebKit 38/38 grün.
- [x] D-8 `schrittBereit`: erst `/pruefung`, dann Rahmen – gemessen (Rahmen fertig 0,2–0,3 s nach der Prüfung, 15/15), Begründung in plan.md. Vom Maintainer zu bestätigen.
- [x] Diff-Suche gegen `e5057afc`: keine neue Zeile mit der Wortliste aus Anhang C außer den zwei Zeilen der kopierten `spec.md`; `framenavigated` steht in einer geänderten Zeile nur als bestehender Name einer Quelle (Typ `Eintrag["quelle"]`), nicht als Warten. Geänderte Dateien in T2 nur `geladen-042.ts`, `zweitfarbe-036.spec.ts`, `buehne-navigation-042.spec.ts`, `plan.md`, `tasks.md`.

## T3 im Einzelnen

- [ ] (offen)

## T4 im Einzelnen

- [ ] (offen)
