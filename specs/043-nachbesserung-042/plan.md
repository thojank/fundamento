# Spec 043 – Nachbesserung 042: Warten auf „geladen“, Vorschau-Rahmen, Übernahme WebKit – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `b260ae62fbf95cba5a08454d32f5a78e615743ee57369b17cd45789b57701949`) · **Aufgaben:** [`tasks.md`](tasks.md) · **Basis:** `main` `e5057afc` (Merge #152, Spec 038 Lauf 2; seit `f027522` nur `packages/nordstelo/**` und `specs/038-gvidanto-agentoj/**` geändert) · **Branch:** `261106-spec-043-nachbesserung-042-pr-d9dc59` · **Regel 0** gilt. **Keine Grenzen, Zeitlimits, Schwellen, Abfrageintervalle, Toleranzen oder Wiederholungen angehoben. Nichts gemergt.** Kein Sprachmodell (0 $).

**Datum:** 2026-11-06 · **Stand:** T1 in Arbeit.

### G-0 Quelle

| | Wert |
|---|---|
| Quelle | `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec043/spec.md` |
| Größe der Quelle (`wc -c`) | 4590 Byte |
| SHA-256 laut Auftrag | `b260ae62fbf95cba5a08454d32f5a78e615743ee57369b17cd45789b57701949` |
| SHA-256 der Quelle (2026-11-06, 11:41 Ortszeit, `shasum -a 256`) | `b260ae62fbf95cba5a08454d32f5a78e615743ee57369b17cd45789b57701949` |
| SHA-256 der Kopie `specs/043-nachbesserung-042/spec.md` | `b260ae62fbf95cba5a08454d32f5a78e615743ee57369b17cd45789b57701949` (4590 Byte) |
| Ergebnis | **gleich.** Kopiert mit `cp`, nicht über ein Editor-Werkzeug. |

### Tickets und Dateien

Ein Strang, ein PR, ein Push, genau ein `workflow_dispatch` (Spec, „Begrenzung der Laufzeit“). Die Tickets laufen nacheinander.

| Datei | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| `packages/metiejo/src/**` | **ja** (nur N-8) | – | – | – |
| `specs/043-nachbesserung-042/{spec,plan,tasks}.md` | anlegen | fortschreiben | fortschreiben | abschließen |
| `packages/eroj/test/buehne-navigation-042.spec.ts` | neuer roter N-8-Test | Firefox-Analyse, ggf. Fix | – | – |
| `packages/eroj/test/geladen-042.ts` | – | **ja** | – | – |
| `packages/eroj/test/zweitfarbe-036.spec.ts` | – | ja | – | – |
| `packages/eroj/test/metiejo-036-uebernahme.spec.ts` | – | – | **ja** | – |
| alles andere | tabu | tabu | tabu | tabu |

Tabu sind ausdrücklich `.github/**`, Root-Dateien, `packages/nordstelo/**`, `packages/mcp/**`, `packages/modelo/**`, `buehne-036.spec.ts` und `wackler-040.ts` (nur benutzen).

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf ist unbeaufsichtigt. Wo die Spec offen ließ, gilt die Annahme. „angewandt“ = so umgesetzt; „offen“ = Ticket steht noch aus.

### Fragen und Abweichungen der Implementierungs-Spec (F-1 bis F-5)

| ID | Frage / Abweichung | Annahme | Stand |
|---|---|---|---|
| F-1 | Laut Quelle ist N-8 „sehr wahrscheinlich“ die Ursache des Chromium-Rots in `zweitfarbe-036`. Der Trace von 42180054807 zeigt **keinen** Abbruch des Rahmens und keine Neuanfrage im `stato`-Takt; auch der Schnellstart (ohne `stato`-Takt) ist rot. Ursache ist ein **langsamer Server** (Kalt-Render bzw. `/pruefung` ≈ 3,3–4,3 s), das Hauptdokument wird erst nach mehr als 5 s „complete“ (Befunde unten). | **T1 bleibt** als eigener Produkt-Fix (N-8 ist für Nutzer sichtbar und ein Punkt der Quelle). Die rote Zeile in `zweitfarbe-036` behebt **T2** (`seiteBereit`). Im Bericht steht die Zuordnung Befund → Ursache aus dem Trace. | angewandt (Zuschnitt) |
| F-2 | Der Firefox-Fehler in `buehne-navigation-042` ist **nicht N-8**: Die Rahmen haben `rev=2` geladen, aber das Init-Skript des Tests lief in diesen zwei Dokumenten nicht (kein Eintrag in `sessionStorage`, keiner in der Bindung). | Anhang D wörtlich: T2 versucht die Nachstellung (≤ 30). Nachgestellt → Fix nach `testing.md`; nicht nachgestellt → Befund mit Trefferquote und Spur. *Offene Frage an den Maintainer, nicht blockierend:* Gilt der Trace-Beleg selbst als „nachgestellt“? Ohne Antwort gilt die strenge Lesart. | offen (T2) |
| F-3 | „Roter Test zuerst“ ist für die Wackel-Fälle (T2 Firefox, T3 WebKit) nicht deterministisch ohne neue Timer zu erfüllen. | Vorbild Spec 042 T3: Rot = CI-Lauf 42180054807 bzw. lokale Trefferquote, beides **vor** dem Fix-Commit in `tasks.md`. Wo ein deterministischer roter Test möglich ist (T1, T2 `seiteBereit`), ist er Pflicht. | offen (T2, T3) |
| F-4 | Format der Ticket-IDs: Vertrag `<PREFIX>-<PHASE>.<NUM>`, Quelle und Auftrag `T1`–`T4`. | Die IDs sind **`T1`, `T2`, `T3`, `T4`**, überall gleich (Spec, Status, Commits). | angewandt |
| F-5 | Der p0-Standard verlangt ein eigenes Test-Ticket am Ende; Anhang C verlangt genau T1–T4, keine QA-Schleife. | Anhang C gilt. Die Abnahme über alles ist der Dispatch-Lauf in T4; die Prüfung über Ticket-Grenzen hinweg gehört zu T4. | angewandt |

### Entscheidungen der Implementierungs-Spec (D-1 bis D-4)

| ID | Frage | Annahme | Warum | Stand |
|---|---|---|---|---|
| D-1 | Wodurch fordert die Seite einen abgebrochenen Rahmen neu an? | **Ereignisgesteuert, nie über die Uhr:** an `load` des Rahmens und an `load`/`pageshow` der Seite. Kein Timer, kein Polling, kein zweiter Takt. `stato-041.test.ts` (genau ein Takt, 3000 ms) bleibt grün. | Regel 0; die Seite feuert `load` erst, wenn alle Rahmen fertig sind, auch fehlgeschlagene (sicherer zweiter Auslöser). | offen (T1) |
| D-2 | Wie wird Doppel-Laden verhindert? | Ein Rahmen, dessen Dokument die erwartete URL hat (Pfad, `rev`, `scheme`) und geladen ist, bekommt **keine** weitere `src`-Zuweisung. Je erwarteter URL **höchstens eine** sofortige Neuanforderung; ein dauerhaft scheiternder Server löst keine Schleife aus. `buehne-navigation-042` ist der Wächter: genau eine `src` je Anlass und Rahmen. | Anhang D „Rahmen ist korrekt geladen“: kein Flackern, keine wartenden Tests. | offen (T1) |
| D-3 | Wie wird Rot deterministisch? | Die roten Tests aus T1 und T2 erzeugen ihren Fehlerzustand über `page.route`, ohne Timer. T1 bricht die erste Navigation des Rahmens „Jetzt“ nach dem Neuladen ab (`route.abort`); T2 hält die Antwort des Rahmens zurück, bis `seiteBereit` aufgelöst ist. | Rot vor Grün je Ticket (Anhang C, 1). | offen (T1, T2) |
| D-4 | Wie beobachtet T2 die Rahmen, wenn es den Navigationstest ändert? | Die Rahmen-Dokumente werden von der Seite gelesen, die sie hält (`testing.md` › Spec 041). Die Strenge (genau ein Dokument je Anlass) bleibt gleich. | Das Init-Skript im Rahmen lief in Firefox nicht immer (F-2). | offen (T2) |

### Entscheidungen aus dem Lauf (D-5 ff.)

| ID | Ticket | Frage | Annahme | Stand |
|---|---|---|---|---|

## Befunde

### Aus dem Trace von Lauf 42180054807 (`f027522`)

Die Artefakte `testberichte-eroj-2-1` (26 MB) und `testberichte-eroj-4-1` waren am 2026-11-06 abrufbar (laufen etwa am 2026-11-13 ab, Risiko R-4). Neu laden: Messanleitung unten. Traces unter `eroj/test-reports/playwright/html/data/*.zip`; Netzwerk `*-trace.network`, Schritte `test.trace`.

| Test (Browser) | Was der Trace zeigt | Ursache | Ticket |
|---|---|---|---|
| `zweitfarbe-036.spec.ts:121`, Assistent (Chromium) | Rot an `:173` (`schrittBereit` nach „Keine Zweitfarbe“). 08.084 `POST entwurf`, gleich danach der alte Rahmen `rev=3` (3329 ms) und das Neuladen `GET /asistanto/…` mit **3336 ms**: Der Server rendert das neue rev kalt, die Seite wartet dahinter. Rahmen ab 12.03, `vorschau.css?rev=3` bei Testende (13.08) unbeendet. | Das Hauptdokument wird nicht in 5 s ab Tastendruck „complete“, weil der Server langsam ist. **Kein Abbruch, kein `stato`-Takt.** | T2 |
| `zweitfarbe-036.spec.ts:121`, Schnellstart (Chromium) | Rot an `:173`. Seite nach 11 ms da. Dann starten `POST /pruefung` und Rahmen `vorschau?rev=3` gleichzeitig (27.806), **beide 4216 ms**. Danach `vorschau.css?rev=3` bei Testende unbeendet. Die Prüfung blockiert den Node-Event-Loop ≈ 3,7–4,3 s pro Aufruf (auch beim ersten Laden: 3706 ms). | Wie oben, nur blockiert hier `/pruefung` statt Kalt-Render. | T2 (Risiko R-1) |
| `buehne-navigation-042.spec.ts:200` (Firefox) | Für den Schritt „rev“ ist `src` je Rahmen notiert (rev=2). Das Netz zeigt beide `GET vorschau?…rev=2` mit 200, und `rahmen(page, neu, "light")` ist grün. Aber für beide Rahmen fehlen die Einträge `sessionStorage`/`performance` **und** die Bindung. Die Differenz sind genau diese vier Zeilen „rev“. | Das Init-Skript lief in Firefox in den Dokumenten des Schritts „rev“ nicht, eine Lücke des Beobachters. Nicht N-8, keine Navigation zu viel. | T2 |
| `metiejo-036-uebernahme.spec.ts:67` und `:89` (WebKit) | Beide rot im Test-Schritt **nach** `waitForURL` (`:51`), beim Node-`fetch`-**POST** `/api/marko/<id>/materialo` (`:52`). Fehler: `TypeError: fetch failed`, `[cause]: Error: read ECONNRESET`. Der Server ist der eigene (Port 7341, die Seite lädt von ihm). Gleichzeitig blockiert `/pruefung` (4316 ms) den Server. | **Reset an einem POST** über eine wiederverwendete Keep-alive-Verbindung (Muster B-12). N-3 (`workerIndex % 9`) steckt zusätzlich im Code, war hier aber nicht die Ursache. | T3 |

### Nebenbefund Server-Latenz (nicht in diesem Lauf zu beheben)

`POST /api/marko/<id>/pruefung` (`checkDraft`, `servilo.ts` › `pruefungOf`) und der Kalt-Render je neuem rev blockieren den Node-Event-Loop für 3,3–4,3 s. Alle Anfragen dahinter warten, auch die Vorschau. Das ist die gemeinsame Wurzel mehrerer Wackler (Spec 040 B-5 „busy Metiejo 3.5 s“, `wackler-040.ts:55`). `packages/metiejo/src/**` ist hier nur für N-8 frei. Kandidat für eine Folge-Spec.

### N-8 aus Spec 042 (T1)

Nicht zu verwechseln mit Nachlese 10 N-8 (`html.ts`, Sprachwahl). Im Code heißt es „Spec 043 / N-8 aus Spec 042“. Auf `main` setzt der Client das `src` der Rahmen nur bei einem Anlass: erstes Laden (`refreshNachher()`, am Ende `refreshFrame()`), Schema-Wahl, eigene Änderung, neues `rev` im `stato`-Takt. Wird die Navigation eines Rahmens abgebrochen (`NS_BINDING_ABORTED`, Netzfehler), fragt die Seite ihn bei gleichem `rev` **nie** neu an.

## Messungen

(T1 ff., Trefferquoten in `tasks.md`.)

## Messanleitung

```sh
# G-0: Quelle und Kopie haben dieselbe Größe und denselben Hash
wc -c /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec043/spec.md specs/043-nachbesserung-042/spec.md
shasum -a 256 /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec043/spec.md specs/043-nachbesserung-042/spec.md
git show HEAD:specs/043-nachbesserung-042/spec.md | shasum -a 256

# Trace von 42180054807 lesen (nur lesen, je Artefakt ein neues leeres Verzeichnis)
gh run download 42180054807 -R thojank/fundamento -n testberichte-eroj-2-1 -D <leeres-verzeichnis>
gh run download 42180054807 -R thojank/fundamento -n testberichte-eroj-4-1 -D <leeres-verzeichnis>

# Vor Playwright: der CLI-Build enthält die Metiejo-Änderung (die Tests starten packages/cli/dist/index.js)
pnpm turbo run build --filter=@fundamento/cli...
pnpm --filter @fundamento/metiejo test

# Nur die geänderte Spec-Datei, eine Suite zur Zeit, knappe Ausgabe, je Engine
cd packages/eroj
for e in chromium firefox webkit; do
  FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=$e pnpm exec playwright test test/buehne-navigation-042.spec.ts --repeat-each=10
done
```

## Bericht

(T4.)
