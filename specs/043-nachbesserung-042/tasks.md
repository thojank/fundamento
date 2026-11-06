# Spec 043 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `e5057afc`. Genau vier Tickets (Spec, „Tickets“; Anhang C). Rote Commits enden auf „(rot)“, grüne auf „(grün)“; Doku-Commits beginnen mit „Spec 043:“ und sind einzeln. Häkchen mit SHAs.

Ein Strang, ein PR (T1 → T2 → T3 → T4). Lokal nur die geänderten Spec-Dateien, nie zwei Playwright-Suiten gleichzeitig, `FM_AUSGABE=knapp`, je Wackel-Test höchstens 30 Wiederholungen.

| Ticket | Inhalt | Dateien | Stand | rot → grün |
|---|---|---|---|---|
| T1 | N-8 aus Spec 042: abgebrochenen, leeren oder alten Vorschau-Rahmen ereignisgesteuert sofort neu anfordern (D-1 bis D-3); Gerüst `specs/043-nachbesserung-042/` | `specs/043-nachbesserung-042/{spec,plan,tasks}.md`, `packages/eroj/test/buehne-navigation-042.spec.ts` (neuer Test), `packages/metiejo/src/html.ts`, `vorschau-043.test.ts` (neu) | erledigt (Chromium, Firefox behoben; WebKit Befund, D-6) | Gerüst `3c9d7d75`; N-8 `8a65d6f4` → `20f221cc` |
| T2 | `seiteBereit` auf `readyState !== "loading"`; Firefox-Fehler im Navigationstest klären (F-2, D-4) | `packages/eroj/test/geladen-042.ts`, `zweitfarbe-036.spec.ts`, `buehne-navigation-042.spec.ts` | offen | – |
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
- [ ] Für T2: `rahmenBereit` liest ein Rahmen-Dokument ohne `documentElement` noch nicht als „nicht geladen“ (plan.md › Befunde).

## T2 im Einzelnen

- [ ] (offen)

## T3 im Einzelnen

- [ ] (offen)

## T4 im Einzelnen

- [ ] (offen)
