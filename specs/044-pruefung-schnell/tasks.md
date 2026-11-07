# Spec 044 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `6a3e55e3`. Höchstens fünf Tickets (Spec, „Begrenzung der Laufzeit“). Rote Commits enden auf „(rot)“, grüne auf „(grün)“; Doku-Commits beginnen mit „Spec 044:“ und stehen allein. Häkchen mit SHAs.

Ein Strang, ein PR (T1 → T2 → T3 → T4 → T5). Lokal nur unter der Maschinen-Sperre (plan.md, A-09), `FM_AUSGABE=knapp`, nie zwei Playwright-Suiten gleichzeitig, je Wackel-Test höchstens 30 Wiederholungen.

| Ticket | Inhalt | Dateien | Stand | rot → grün |
|---|---|---|---|---|
| T1 | Messung vorher, Byte-Fixture vom Stand `main`, roter `stato`-Test; Gerüst `specs/044-pruefung-schnell/` | `specs/044-pruefung-schnell/{spec,plan,tasks}.md`, `packages/metiejo/src/{messung.ts,servilo.ts,vorschau.ts}`, neu `antworten-044.test.ts`, `messung-044.test.ts`, `stato-044.test.ts`, `test-doubles/{antworten-044.json,servilo-044.ts}` | erledigt | Fixture grün `87888366`; Messpunkte `63f1e56a`; `stato-044` rot `68014c61` (grün in T2) |
| T2 | Geteilter Speicher je Entwurf+`rev` und Marke+`rev`+`propono`, Routen asynchron, `pruefTor` | `packages/metiejo/src/{ableitungen.ts,servilo.ts,messung.ts,messung-044.test.ts}`, neu `ableitungen-044.test.ts`; `vorschau.ts` und `asistanto/iloj.ts` unverändert (D-12) | erledigt | `ableitungen-044` rot `32f5bb39` → grün `5bcda814`; `stato-044` grün ohne Änderung |
| T3 | Event-Loop frei (nur falls nach T2 nötig): Worker für die Prüfung, `previewCss` in Teilen | `packages/metiejo/src/{ableitungen.ts,vorschau.ts,servilo.ts}`, neues Worker-Modul, Test gegen `dist/` | offen | – |
| T4 | Byte-Gleichheit, Tests, Messung nachher, Diff-Suche (Test-Ticket) | `packages/metiejo/src/*-044.test.ts`, `specs/044-pruefung-schnell/{plan,tasks}.md` | offen | – |
| T5 | PR, ein Push, genau ein Dispatch, CI-Messung nachher (PR-Kommentar), Bericht | `specs/044-pruefung-schnell/{plan,tasks}.md` (nur vor dem Push) | offen | – |

## T1 im Einzelnen

- [x] G-0: Quelle und Kopie 4282 Byte, SHA-256 `5bea3ab5a3d8ec94f9ee7fc5b16b55bdb30ffdfbf65ff767ffcab891f71810aa`, kopiert mit `cp`; nach dem Commit `git show HEAD:specs/044-pruefung-schnell/spec.md | shasum -a 256` gleich, 4282 Byte. Gerüst `plan.md` (A-01 … A-10, D-01 … D-05) und `tasks.md` – `da5b74a7`.
- [x] CI vorher aus den Traces gelesen (alle Artefakte noch abrufbar, Ablauf 2026-11-13): Lauf 42252367951 (`zweitfarbe-036:196` Chromium/WebKit, `:129` WebKit) und 42180054807 (`:121`, `buehne-navigation-042:200`, Übernahme 4.1/4.2); `/pruefung` 3667–4492 ms, Rahmen hinter der Prüfung 3329–4500 ms, `vorschau.css` 270–960 ms (hinter der Prüfung 4011 ms), `stato` mit Prüfung 3243–3451 ms. Je Schritt „–“ (keine Messpunkte auf `main`) – `29a2f439`.
- [x] Byte-Fixture `packages/metiejo/src/test-doubles/antworten-044.json` (66 Fälle, keine Normalisierung, D-06) auf dem unveränderten `6a3e55e3` erzeugt; `git check-ignore -v` leer; zweimal hintereinander gleich (dazu zwei Probeläufe mit den Körpern im Klartext: gleich, ohne Arbeitsordner und Uhrzeit); ein geändertes Byte in der Fixture (`2fe4…` → `3fe4…`, Fall „A rev1 POST pruefung kalt“) macht „brand A“ rot, danach zurück – `87888366`.
- [x] Messpunkte nach V-2 (`messung.ts`, Option `messung`, Schritte nach D-07) in `servilo.ts`/`vorschau.ts`; ohne Senke läuft jeder Schritt unverändert; `antworten-044` danach grün – `63f1e56a`.
- [x] `messung-044.test.ts`: fester Ablauf N-mal, je Durchlauf ein `it`, nur Formprüfung (alle Schritte da, Zahlen ≥ 0, `rev` ≥ 1), Bericht `test-reports/messung-044.json` und eine Zeile je Schritt im Log; N lokal 10, in CI 3 (D-11) – `4b0b03cd`, Log-Zeilen auch unter `FM_AUSGABE=knapp` – `4719847d`.
- [x] Messung lokal vorher unter der Sperre (N = 10, `uptime` 5,56 → 6,80, keine fremde Test-Last) und Ende-zu-Ende `zweitfarbe-036` je einmal Chromium (5/5) und WebKit (5/5) mit Traces; Tabelle, Befunde B-1 … B-5 und N in CI in plan.md – `b431e9bf`.
- [x] `stato-044.test.ts` rot (D-05, D-09, D-10): Fall 1 `expected [ 'pruefung A', 'stato B' ] to deeply equal [ 'stato B', 'pruefung A' ]`; Fall 2 `expected [ 'pruefung A', 'stato A' ] to deeply equal [ 'stato B', 'freigabe' ]`. Das Tor wird nie gerufen, A antwortet zuerst; kein Hängen (6,9 s), keine Uhr – `68014c61`.
- [x] Erster Schlusslauf: `modelo` `turbo-inputs.test.ts` fand in `messung-044` den Pfad zum Checkout-Wurzelordner (an `standOf` übergeben = Lesen des ganzen Checkouts, nicht im Hash des Test-Tasks; unter der Parallellast zuerst als „Hook timed out in 10000ms“ sichtbar, allein als Befund). Behoben: `standOf(process.cwd())` (Paketordner); `turbo-inputs.test.ts` allein danach 8/8 grün – `ac38c148`.
- [x] Schluss unter der Sperre: `pnpm test:betroffen` (cli, ekranoj, metiejo, modelo, nordstelo; Chromium): 13 von 14 Tasks grün, `metiejo` 570 bestanden, **2 rot = genau die zwei Fälle von `stato-044`** (erwartet); `pnpm --filter @fundamento/metiejo lint` grün (eine Warnung in `komponentoj.ts`, schon auf `6a3e55e3`).

## T2 im Einzelnen

- [x] `ableitungen-044.test.ts` rot zuerst (`Cannot find module './ableitungen.js'`), gezählte echte Rechner (`checkDraft`, `previewCss`; nur der Fehlerfall wirft einmal vor der Rechnung): Prüfung (a) gleichzeitig = eine Rechnung, (b) neuer `rev` verwirft, (c) Fehler bleibt nicht, (d) `rev`-Wechsel während der Rechnung trägt nichts ein und rechnet den Start-Stand, (e) Kopie und Entwurf mit gleichem `rev` je eigenes Ergebnis (A-01), (V-5.5) `eintragen` ohne Rechnung und ohne Tor; CSS (a)–(d) und (f) geänderter Vorschlag bei gleichem `rev` (A-02); Server (g) `stato` antwortet den `rev`, den es vorfand – `32f5bb39`.
- [x] `ableitungen.ts` nach V-5 (D-15), `pruefTor` in `ServiloOptions` (V-3), `Draft.pruefung` ist der `PruefEintrag`; `messung.ts` zählt das Warten auf eine fremde Rechnung zu `warten` (D-16).
- [x] Routen asynchron: `/pruefung`, `stato`, `/asistanto/…`, `faceto` (Prüfung und Antwort), Chat- und Einstiegs-Antworten mit `stato`, Studio-GET, Komponenten-Seite, `fertig`, Rahmen `buehne-*` ohne Vorschlag, `festlegen` (auch über das Studio-Formular) warten auf die geteilte Prüfung; `vorschau.css` auf den CSS-Speicher (B-4 erhalten, D-14); übrige Rahmen warten auf nichts. Stand der Antwort nach D-13; Chat-Pfade nach D-12 (A-03).
- [x] `messung-044`: `vorschau.css` warm meldet nur `marke-laden` (D-16); neuer Teil „außen“: `stato` B während `/pruefung` A ohne Tor (D-17).
- [x] Grün: `ableitungen-044` (12), `stato-044` (2, unverändert seit `68014c61`), `antworten-044` (3, Test und Fixture unverändert); ganze `metiejo`-Suite unter der Sperre 578 bestanden, 0 rot in 293 s (`FM_MESSUNG_044_N=2`); `pnpm --filter @fundamento/metiejo lint` grün (eine Warnung in `komponentoj.ts`, schon auf `6a3e55e3`) – `5bcda814`.
- [x] Messung „nach T2“ lokal unter der Sperre (N = 10) und Entscheidung zu T3 in plan.md: Ziele „`/pruefung` < 1 s“ und „`stato` während Prüfung < 200 ms“ verfehlt (1517 bzw. 1555 ms Median) → **T3 nötig** – Doku-Commit „Spec 044: Messung nach T2 …“.

## T3 im Einzelnen

## T4 im Einzelnen

## T5 im Einzelnen
