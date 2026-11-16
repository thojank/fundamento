# Spec 056 – Aufgaben (MP-2a: Ausgangslage, Kern, Werte, Beispiele, Schrift)

**Spec:** [`spec.md`](spec.md) (Kopie der Produkt-Spec, `cmp`-gleich, 51 112 Byte, SHA-256 `f5782104fc6e8eeabe441ed39ff0fec811667f975a4b980bd147ce8e7048a579`) · **Plan:** [`plan.md`](plan.md) (technische Spec byte-gleich, 31 654 Byte, SHA-256 `c2652c04c2e8f826d2e480e9be87d108eb27003717ef6fcf47c6fe3e60d0017b`, danach „Nachtrag“ mit Abschnitt 0 des Implementierungsplans) · **Basis:** `main` `6d34a75a` · **Branch:** `261115-spec056-markenprozess-verbindu-b3a6e5`

Acht Tickets, ein Strang (Spec: „höchstens 8 Tickets, ein PR“). Kein Ticket pusht, öffnet einen PR, merged oder startet einen `workflow_dispatch`; kein Ticket committet, stasht, checkt aus oder setzt zurück (D-27). PR, der eine Push und der eine Dispatch sind kein Ticket, sondern ein Schritt des Orchestrators nach QA (D-1). Jedes Ticket trägt seine Punkte nur in **seinen eigenen Abschnitt** unten ein („im Einzelnen“, „Geänderte ältere Tests“, „Für den PR-Text“, „Befunde“); KBS-4.1 fasst sie zusammen.

| Ticket | Spec | Inhalt | Hängt ab von | Stand |
|---|---|---|---|---|
| KBS-1.1 | T1 | Daten: Inhalte, gelöste Verbindungen, was bei der Marke ankommt, „Farbe folgt den Bildern“, Anordnung, Katalog, Schreibweg | – | erledigt |
| KBS-2.1 | T2 | Hülle: Kurven, runde Anschlüsse, Marke-Knoten mit zwei Eingängen, Lösen/Stecken, Kopfleiste, Server-Verdrahtung, Platzhalter | 1.1 | erledigt |
| KBS-3.1 | T3 | Die sieben Text-Knoten | 2.1 | erledigt |
| KBS-3.2 | T4 | Beispiele: Hochladen, Ziehen, Link, Vorschaubilder, Entfernen, nur Arbeitsordner | 2.1 | erledigt |
| KBS-3.3 | T5 | Erkannt, „als Primär/Akzent übernehmen“, „Farbe folgt den Bildern“, Test Export/Paket | 2.1 | erledigt |
| KBS-3.4 | T6 | Schrift: Katalog mit Suche und Filter, echte Schrift, Regler | 2.1 | erledigt |
| KBS-3.5 | T7 | Eigene Schrift samt ZIP, erkannte Schnitte, setzen, privates Repo | 2.1 | erledigt |
| KBS-4.1 | T8 | Tests gesamt, „kein Urteil“, eroj in Chromium, Bilder, Bericht-Entwurf | alle | erledigt (ohne Push, PR, Dispatch) |

## Ausgangsmaß Bündel

Gebaut am unberührten Stand `6d34a75a70f05cd742dd3438bbed141578ce6758` (`git status --short` leer vor dem Bau, vor jeder Änderung), `pnpm --filter @fundamento/nodredaktilo build` (Vite), 2026-11-16 (KBS-1.1):

| Datei | roh | gzip (Stufe 6, `gzip -6 -c`) | Vite-Anzeige |
|---|---|---|---|
| `packages/nodredaktilo/dist/leinwand.js` | 746 121 Byte | 195 930 Byte | 746.12 kB, gzip 197.31 kB |

## Geänderte ältere Tests

Zusammengefasst aus den Ticket-Abschnitten (KBS-4.1). Zeilen beziehen sich auf `6d34a75a`, jeweils vorher → nachher, Grund.

| Datei:Zeile | vorher → nachher | Grund | Ticket |
|---|---|---|---|
| `packages/metiejo/src/grafeo-anordnung-055.test.ts:124` (heute `:124–126`) | `marko: [24, 48, 190, 72, 120]` → `marko: [24, 48, 190, 480, 528]` (+2 Kommentarzeilen davor); über `360, 408` (KBS-1.1) zu `480, 528` (KBS-2.1) | `altecoDe` liest `ARANGXO_056` (D-16); die volle Marke maß in Chromium 452 px, darum Höchsthöhe 480 (anheben, nie senken). `ARANGXO_055` selbst bleibt byte-gleich | 1.1, 2.1 |
| `packages/nodredaktilo/scripts/bilder-055.ts:305` | `/[QA]/` → `/[QAC]/` | M-1: jede Kante ist jetzt eine Bezier-Kurve und schreibt `C` | 2.1 |
| `packages/nodredaktilo/scripts/bilder-055.ts:418` | „jede Kante mit Knick hat Q oder A“ → „… Q, A oder C“ | Meldetext zur Zeile 305 | 2.1 |
| `packages/nodredaktilo/scripts/bilder-055.ts:404` | `geo.knoten === 11`, „11 Knoten gerendert“ → `geo.knoten === 14`, „14 Knoten gerendert“ | Jede Marke trägt jetzt die drei festen Text-Knoten Ausgangslage, Markenkern, Werte; das Skript brach dort ab | 4.1 |

Nicht ältere Tests, aber im Lauf nachträglich geändert (056-eigene Dateien): `packages/metiejo/src/grafeo-anordnung-056.test.ts:78, 90` (`360` → `480`, gleiche Anhebung, KBS-2.1) und `packages/metiejo/src/leinwand-sxelo-056.test.ts:441–453` (Orchestrator nach KBS-3.2: die drei Routenmodule werden mit einem Pfad aufgerufen, der keinem gehört, `/api/marko/provo/entwurf`, statt mit dem Beispiele-Pfad, den es seit KBS-3.2 wirklich gibt). Kein Test aus 047/048 geändert; keine Datei unter `packages/eroj/**` geändert.

## Für den PR-Text

Entwurf der PR-Beschreibung (KBS-4.1). Der Orchestrator ergänzt CI-Tabelle und Links.

```markdown
## Spec 056 – Markenprozess MP-2a: Ausgangslage, Kern, Werte, Beispiele, Schrift

Die Leinwand „Gestalten“ bekommt die vordere Hälfte des Markenprozesses. Sieben Text-Knoten (Ausgangslage, Markenkern und Werte immer; Zielgruppe, Wettbewerb, Persönlichkeit, Tonalität über „+ Knoten“), ein Knoten „Beispiele“, der Bilder nur im Arbeitsordner der Marke ablegt und ihre Farben ohne KI ausliest, und ein Knoten „Schrift“ mit Fontsource-Katalog und eigener Schrift samt ZIP. Text-Knoten und Beispiele laufen in die Marke; der Marke-Knoten zeigt Kern, Werte und die erkannten Farben. Diese Verbindungen sind lösbar und bleiben gespeichert. Solange Primär den Beispielen folgt, wird die größte bunte erkannte Farbe Primär. Alle Kanten sind gestrichelte Kurven mit runden Anschlüssen (Vorbild `verbindungen.png`).

### Was sich ändert und warum
- **Inhalte in `marken/<name>/leinwand.json`, nie im Agordo.** Kein Schemafeld; Stände nehmen die Inhalte mit. `leinwand-stato.ts` (Leser aus Spec 055) wird im Ort erweitert; jede 055-Datei liest sich wie zuvor.
- **Ein reines Modul für Server und Browser:** `packages/metiejo/src/leinwand-enhavo.ts` (Inhalte lesen, fünf Werte, „leer“, Kanten in die Marke, was bei der Marke ankommt, „Farbe folgt den Bildern“), im Bündel über den Alias `@fundamento/metiejo/enhavo`. `farb-arto.ts` teilt jede gemessene Farbe nach den vorhandenen Schwellen aus `kreilo.json` ein (hell, bunt, Leitfarbe); keine neue Schwelle.
- **Teil V:** `getBezierPath` für jede Kante der Ansicht Gestalten, Strich `4 4` (vorhandener Wert) mit runden Enden, Farbkanten in ihrer Farbe, alle anderen in der Rolle `--fm-color-text-muted`; runde Anschlüsse. Verstehen unberührt.
- **Server:** `GET /api/leinwand` liefert `marko.enhavo` und markiert fehlende Dateien mit `fehlt: true` (nur in der Antwort); ohne Zustandsdatei byte-gleich zu `6d34a75a`. `POST …/leinwand` nimmt Schrift, Schrift-Regler und die Herkunft eines Akzents. Neue Wege: `POST|DELETE …/beispiele`, `GET …/tiparoj?art=` (ohne `art` byte-gleich), `GET …/schriften`, `GET /api/tiparo/:id/css|:datei`, `POST …/schriftdateien`, `GET /marko/:name/fontoj/:datei`, `POST …/schrift-privat`. Jede antwortet einer unbekannten Marke mit 404 `{satz}` und einer unlesbaren Datei mit 422 `{satz}`; keine fragt die Prüfung.
- **ZIP und Schriftdateien** werden mit `node:zlib` gelesen (`tiparo-legi.ts`, `zip-legi.ts`); keine neue Abhängigkeit. Testschrift Lato (OFL-1.1) unter `packages/metiejo/test/fixtures/valid/tiparo-056/` mit Herkunft und Hashes.
- `ANFRAGE_GRENZE = 32 * 1024 * 1024` in `servilo.ts` benannt (Wert unverändert); „24 MB je Datei“ folgt daraus (drei Viertel, MiB).

### Geänderte ältere Tests
- `packages/metiejo/src/grafeo-anordnung-055.test.ts:124` – Marke `72, 120` → `480, 528`: `altecoDe` liest `ARANGXO_056`; die volle Marke misst 452 px.
- `packages/nodredaktilo/scripts/bilder-055.ts:305, 418` – `/[QA]/` → `/[QAC]/` und Meldetext: Kurven schreiben `C`.
- `packages/nodredaktilo/scripts/bilder-055.ts:404` – 11 → 14 Knoten beim Start: drei feste Text-Knoten.
- Im Lauf an eigenen Tests geändert: `grafeo-anordnung-056.test.ts:78, 90` (dieselbe Anhebung), `leinwand-sxelo-056.test.ts:441–453` (Routenmodule mit einem fremden Pfad aufgerufen); nach QA-Lauf 1 `grafeo-anordnung-056.test.ts:82` (Wettbewerb `-496, 220` → `-656, 380`) und `grafeo-skribo-056.test.ts:168` (Herkunft der Gutfälle ohne `datei`).

### Abweichungen von der technischen Spec
- D-3: die Inhaltsknoten sind keine Bildo-Knoten; der Bildo ändert sich nur um `marko.enhavo` und Primär „aus-material“. Alte Routen-Tests bleiben dadurch unverändert.
- D-5: jede gespeicherte Farbe trägt ihre Merkmale `{hell, bunt, leit}`; der Browser rechnet keine Farben.
- D-6: `primaer.seit` als Anker für „folgen lassen“.
- D-21: eigener Weg `GET …/schriften`.
- Akzent aus „Erkannt“ schreibt `herkunft {quelle, anteil}` ohne Dateinamen, sonst stünde ein Bildname in `agordo.json` und im Paket (AK 4). Der Schreibweg lehnt eine `herkunft` mit `datei` als falsch gebaut ab (400), damit auch kein anderer Aufrufer einen Dateinamen hineinschreibt (QA-Lauf 1).
- Wettbewerb-Knoten: Name über Adresse in voller Breite; Höchsthöhe 220 → 380, Platz `y` −496 → −656 (Unterkante −276 und Abstand zur Zielgruppe unverändert).
- `POST …/schrift-privat` nimmt ein wahlweises `bestaetigt`; vorher antwortet es mit `{satz, frage: true}` (Bestätigungsschritt).
- Beispiele-Vorschaubilder in fünf Spalten (Mockup: vier), „Aa“ neben statt über den Probezeilen, Freitexte als `<textarea>`, Schrift-Regler laufen über Schrittnummern (`fm-glitilo` hält einen Bereich von mindestens 1).

### Befunde (Auszug, alle im Bericht)
- `packages/metiejo/src/enportilo/retejo.ts:21` – eine Zeile `export const RETEJO_TEMPOLIMO = 15_000;` (Wert unverändert; `:72` schreibt die Zahl weiter selbst).
- Pinterest: ein öffentliches Board ohne Anmeldung nennt 156 Adressen `i.pinimg.com` (Gegensatz zu R-8); nichts darauf gebaut, ein Board-Link bleibt Verweis.
- ZIP: keine Grenze für die Summe der Einträge; je Eintrag 24 MiB.
- `#2f5bff` gilt nach den vorhandenen Schwellen als „hell“; Ablauf 2.3 der Produkt-Spec sagt „dunkel“.
- Zwei Wege für Schriftdateien (Knoten über npm, Vorschau über CDN); JPG/WebP ohne den Browser des Enportilo ohne Farben.
- `merkmal` der Akzent-Herkunft ist freier Text: ein anderer Aufrufer als der Knoten kann dort einen Dateinamen eintragen (der Knoten schickt `Farbe #hex`). Ob der Server `merkmal` selbst bildet, ist ein Entscheid.
- `turbo run build` spielt nach einer Änderung nur in `packages/metiejo/src` ein altes `leinwand.js` ein (Alias, nicht in den `inputs`; so seit Spec 054). `turbo.json` ist in diesem Lauf nicht frei.

### Prüfungen
- Neue Tests `abnahme-056` (9) und `grafeo-urteil-056` (5), rot gezeigt mit gepflanzten Fehlern; alle `*-056`-Tests und 047/048/054/055 grün.
- Browser: `pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-056.ts --ziel <ordner>` – AK 7 beim Start, mit allen sechs Knoten und mit vollen Inhalten, Abläufe 1–7 und der Randfall „Datei fehlt“, 112 Prüfungen, elf Bilder.
- Korrektur: `schrift-eigene.tsx:85–86` las zwei `--fm-`-Namen, die es nicht gibt; jetzt `--fm-typography-body-2-font-size` und `--fm-font-weight-medium`.
- Korrekturen aus QA-Lauf 1 (je rot zuerst): `herkunft.datei` abgelehnt (Test über HTTP bis ins Paket); Kachel „Datei fehlt“ ohne geteiltes Wort; Wettbewerb liest Namen und Platzhalter ganz; „ד an „Datei fehlt“ ohne `DELETE` (keine 404 in der Konsole).
- `pnpm lint` grün, `pnpm check:privat` PASS; `test:betroffen` rot nur durch Hook-Zeitgrenzen, nacheinander und einzeln grün.
- eroj in Chromium, je Datei einzeln: alle sieben grün.
- QA im Browser und am API in zwei Läufen: Lauf 1 mit vier Befunden (behoben), Lauf 2 beide PASS; ganze metiejo-Suite danach 1129 bestanden, 0 rot.

Created with [p0 by BePurple](https://bepurple.ai) in Spec mode
```

## Befunde

Zusammengefasst aus den Ticket-Abschnitten (KBS-4.1); Belege dort. Für Spec 057 im Bericht, Abschnitt 6.

- **Read-and-call-Datei geändert:** `packages/metiejo/src/enportilo/retejo.ts:21` `export const RETEJO_TEMPOLIMO = 15_000;` (Wert unverändert, D-10); `:72` schreibt `15_000` weiter selbst, der Wert steht zweimal. Sonst nichts unter `enportilo/**`, `tiparoj*.ts`, `privata.ts`, `marko.ts`, `kontrolo.ts`.
- **Benannt, Wert unverändert:** `ANFRAGE_GRENZE = 32 * 1024 * 1024` in `servilo.ts` (D-11); „24 MB“ heißt MiB.
- **Abweichungen:** D-3 (Inhaltsknoten keine Bildo-Knoten), D-5 (Merkmale je Farbe), D-6 (`primaer.seit`), D-21 (eigener Weg `…/schriften`); Akzent-`herkunft` ohne `datei` (AK 4); `schrift-privat` mit `bestaetigt`; Beispiele in fünf Spalten, „Aa“ neben den Probezeilen, `<textarea>`, Schrittnummern für `fm-glitilo`.
- **Pinterest** (KBS-3.2): ein öffentliches Board ohne Anmeldung nennt 156 `i.pinimg.com`-Adressen, entgegen R-8; nichts darauf gebaut.
- **ZIP:** keine Grenze für die Summe der Einträge; verschlüsselt, ZIP64, mehrteilig, andere Verfahren, Eintrag über 24 MiB → unlesbar.
- **Einteilung:** `#2f5bff` „hell“ nach den Schwellen, Ablauf 2.3 sagt „dunkel“; Pastellgrenze nimmt sehr helle Farben als Leitfarbe aus.
- **Zwei Schriftwege** (Knoten npm, Vorschau CDN); JPG/WebP ohne Browser des Enportilo ohne Farben; `spuroX`/`ARANGXO_055.spuroj` ungenutzt.
- **Wörter ohne gemeinsame Konstante:** Wettbewerb „Name“, „Adresse (wahlweise)“, „<Wert> entfernen“; „Dateien wählen“, „lizenziert, privat“, „Bestätigen“, „Abbrechen“; die lokalen Texte des Schrift-Knotens. Zwei Studio-Sätze kopiert, weil `servilo.ts` sie inline schreibt.
- **Älter, nicht aus diesem Lauf:** `fm-kampo` lässt `change` nicht aus dem Shadow DOM; `fm-ikono: name is required`-Warnungen.
- **Neu aus KBS-4.1:** siehe „KBS-4.1: Befunde“ unten (400-Form des Schreibwegs, Darstellung in den Bildern, Höhe mit Verweis).

## QA-Lauf 1: Korrekturen

Vier Befunde aus QA-Lauf 1, je rot zuerst, dann die Korrektur. Sonst nichts geändert.

| # | Datei:Zeile | Was | Warum | Rot zuerst |
|---|---|---|---|---|
| API 1 | `packages/metiejo/src/grafeo-skribo.ts:263–282, 354` | `herkunftEl` nimmt nur noch `quelle`, `merkmal`, `anteil`; eine `herkunft` mit `datei` ist falsch gebaut (400, wie `quelle: "link"`); die Meldung nennt `datei` nicht mehr. Der ältere Weg des Enportilo unberührt | Ein Aufrufer konnte einen Dateinamen über `farbe.herkunft.datei` in `agordo.json` und `aspekto.json` des Pakets schreiben (AK 4, US-9) | `grafeo-skribo-056.test.ts:211–222` (neu): `expected 'ok' to be 'malformita'`; `beispiele-eksporto-056.test.ts:303–328` (neu, über HTTP, danach „Speichern“ und Suche nach dem Namen in `eksporto/**` und `agordo.json`): `expected 200 to be 400` |
| Web 1 | `packages/nodredaktilo/src/gestalten/nodoj/beispiele.tsx:83–84` | Die Kachel „Datei fehlt“ bricht nur zwischen Wörtern (`word-break: normal`); eine PDF-Kachel mit Dateinamen bricht weiter überall | „Datei f / ehlt“ brach mitten im Wort. In einer Kachel von rund 40 px passt „Datei fehlt“ nicht in eine Zeile; es steht jetzt „Datei“ über „fehlt“ | `bilder-056.ts:1585–1655` (neu, Randfall: Stand speichern, Bild entfernen, Stand öffnen): „Kachel „Datei fehlt“ ohne geteiltes Wort … (2 Zeile(n); geteilt: fehlt)“ |
| Web 2 | `packages/nodredaktilo/src/gestalten/nodoj/teksto.tsx:133–144`; `packages/metiejo/src/grafeo-gestalten-sicht.ts:847, 860` | Wettbewerb-Zeile: Name über Adresse, beide in voller Breite des Knotens, „ד neben dem Namen. Drei Zeilen und die leere Zeile messen 361 px → Maximum **220 → 380**, `y` **−496 → −656** (unten bleibt −276, Abstand 18 zur Zielgruppe bleibt) | Zwei Felder von rund 100 px schnitten Namen und Platzhalter ab („Leuchtwerk Ber“, „Adresse (wahlw“) | `bilder-056.ts:894–923` (neu, Zeile 0 jetzt „Leuchtwerk Berlin GmbH“ mit langer Adresse): „„Leuchtwerk Berlin GmbH“ ganz sichtbar (168/107 px)“; nach der Korrektur 218/218 und Platzhalter 244/244. Die erste Fassung (nur Zeile) maß 361/220 und brach an „keine Höhe über ihrem Maximum“ ab, darum die Anhebung |
| Web 3 | `packages/nodredaktilo/src/gestalten/nodoj/beispiele.tsx:245–255, 341` | „ד an einer Kachel „Datei fehlt“ nimmt die Datei nur aus dem Inhalt, ohne `DELETE`. Die 404 des Wegs bleibt | `DELETE …/beispiele/<fehlende Datei>` → 404 in der Konsole | `bilder-056.ts` Randfall: „„ד an „Datei fehlt“ ohne Anfrage nach der Datei (DELETE …/beispiele/muster-0.png)“; danach „keine Seiten- oder Konsolenfehler“ |

Geänderte Testzeilen (056-eigene Dateien): `grafeo-skribo-056.test.ts:168` `herkunft = { quelle, datei: "plakat.png", merkmal, anteil }` → ohne `datei` (die Herkunft der Gutfälle trägt keinen Dateinamen mehr); `grafeo-anordnung-056.test.ts:82` `"teksto-wettbewerb": [-350, -496, 280, 220, -276]` → `[-350, -656, 280, 380, -276]`; `bilder-056.ts:872` Zeile 0 `["Lampenhaus", "lampenhaus.example"]` → `["Leuchtwerk Berlin GmbH", "https://www.leuchtwerk-berlin.example/ueber-uns"]`. Neu: die beiden Tests oben, die Schritte in `bilder-056.ts:894–923` und `:1585–1655`, `DATEI_FEHLT` im Import. `marko-enhavo-056.test.ts:203` baut ein Agordo mit `datei` direkt (Lesen, nicht der Schreibweg) und bleibt.

Läufe: `FM_AUSGABE=knapp pnpm exec vitest run 054 055 056 047 048` in `packages/metiejo` → 510 bestanden, 0 rot. `pnpm --filter @fundamento/metiejo lint` und `pnpm --filter @fundamento/nodredaktilo lint` grün (eine ältere Warnung in `komponentoj.ts:42`). Build der drei Pakete grün. `bilder-056.ts --ziel …/spec056/bilder` Exit 0, 112 Prüfungen, elf Bilder neu. AK 7 beim Start, mit allen sechs und mit vollen Inhalten grün (Wettbewerb an −656, Beispiele unverändert x 24, y −656, Breite 300). Höhen: Wettbewerb leer 184/380, drei Zeilen + leere Zeile **361/380**; Beispiele mit zwölf Bildern und acht Feldern 601/640.

Hinweis für den nächsten Lauf: `turbo run build` spielte nach einer Änderung nur in `metiejo/src` ein altes `nodredaktilo/dist/leinwand.js` aus dem Zwischenspeicher ein (Wettbewerb stand im Browser noch bei −496); `pnpm --filter @fundamento/nodredaktilo build` baut es neu.

## KBS-1.1 (T1): Daten – Inhalte, gelöste Verbindungen, Marke, Folgen, Anordnung, Katalog, Schreibweg

### KBS-1.1 im Einzelnen

- [x] **Ausgangsmaß Bündel** am unberührten Stand `6d34a75a` (oben, „Ausgangsmaß Bündel“): 746 121 / 195 930 Byte.
- [x] **Spec-Ordner:** `spec.md` = `cp` der Produkt-Spec (`cmp` gleich, SHA-256 `f5782104…a579`); `plan.md` = technische Spec byte-gleich (`head -c 31654 plan.md | cmp - tech-spec` gleich, SHA-256 des Präfixes `c2652c04…017b`), danach „Nachtrag“ mit Abschnitt 0 des Implementierungsplans (Zeilen 12–87 wörtlich); `tasks.md` dieses Gerüst.
- [x] **Prüfsummen vor jeder Änderung** (`tsx` gegen den unberührten Baum, Skript außerhalb des Repos): `serializeBildo(gestaltenDe(…))` für drei Agordi (Startwert, farbig, Akzent aus Material) × drei `kabloj`, `serializeLeinwandAntwort(bildo, null)`, `aldonebloj(KATALOGO_054, …)`, `KATALOGO_054`, `ARANGXO_055`. Sie stehen wörtlich in `marko-enhavo-056.test.ts` (`VORHER`) und `grafeo-anordnung-056.test.ts` und sind nach der Änderung gleich.
- [x] **Verträge (`grafeo-gestalten-sicht.ts`, ohne Import, ohne das Wort aus `grafeo-anordnung-055.test.ts:313–318`):**
  - `Anschlussart` + `"bildo"`; Anschlüsse `teksto-<thema>.el` (sechs Themen), `teksto-werte.el.w1…w5` (`wertElirDe`), `beispiele.el` (`BEISPIELE_ELIR`, Art `bildo`), `schrift.el` (`SCHRIFT_ELIR`, Art `tiparo`), `<vorschau>.en.tiparo` (`vorschauTiparoEnir`, jede Vorschau), `marko.en.teksto` / `marko.en.bildo` (`MARKO_TEKSTO_ENIR` / `MARKO_BILDO_ENIR`). `RANGO`: `teksto` und `beispiele` = −1 (vor `marko`), `schrift` ohne Stufe → `validaLigo` lehnt jede Kante an Schrift ab.
  - `ligojKun`: an `marko.en.teksto`/`marko.en.bildo` bleiben alle Kanten (dieselbe einmal), sonst weiter eine je Eingang (D-18). `estasMarkoEnir(port)` für die Hülle (`kunZiehen`).
  - Ids: `TEKSTO_TEMOJ`, `TEKSTO_IDS`, `TekstoId`, `EnhavoId`, `FIKSAJ_TEKSTOJ` (Ausgangslage, Markenkern, Werte), `ALDONEBLAJ` (vier Text-Knoten, Beispiele, Schrift), `DAZU_ORDO`, `estasEnhavoId`, `enhavoSpecoDe`, `estasWertId`, `WERTE_GRENZE` (5).
  - Inhalte: `InhaltMapo` (je Id), `Inhalt`, `Wert`, `WettbewerbZeile`, `TONALITAET_PAROJ`/`TonalitaetParo`, `ErkanntaFarbo {hex, anteil, hell, bunt, leit}` (D-5), `BeispielDosiero {name, art, farben?, satz?, fehlt?}`, `BEISPIELE_ARTOJ`, `Verweis {adresse, satz?}`, `Primaer {folgt, zuletzt?, seit?}` (D-6), `SchriftDosiero {name, gewicht, gewichtBis?, stil, variabel, quelle, fehlt?}`, `EigeneSchrift`. Die `Inhalt*`-Typen sind Typ-Aliasse (nicht `interface`), damit ein getypter Inhalt in `LeinwandStatoKnoto.inhalt` passt.
  - `LeinwandStatoKnoto.speco` = `"vorschau" | "teksto" | "beispiele" | "schrift"`; `LeinwandStato.geloest?: string[]`; `BildoMarko.enhavo?: MarkoEnhavo`; `FolgoEnigo`, `FolgoRezulto`, `FolgoLinio`.
  - `LeinwandSxangxo` (D-23): `{schrift:{rolle, tiparo}}`, `{schrift:{rolle, eigene}}`, `{regler:{pfad, wert}}`, `farbe.herkunft?: LeinwandHerkunft`; `SchriftRolle`, `SchriftPfad`.
  - Sätze wörtlich aus der Produkt-Spec (Fettdruck entfernt): `ENHAVO_ETIKEDOJ`, `TEKSTO_HILFOJ`, `ZIELGRUPPE_ETIKEDOJ`, `MARKENKERN_ETIKEDOJ`, `MARKENKERN_HINWEIS`, `WERT_HINZUFUEGEN`, `FUENF_WERTE_SATZ`, `EIGENSCHAFTEN_HINWEIS`, `FUENF_EIGENSCHAFTEN_SATZ`, `TONALITAET_MITTE`, `NE_KONEKTITA_MARKO_SATZ`, `MARKO_ETIKEDOJ`, `geloestHinweisDe(n)` (D-29, ohne „ · zurücksetzen“), `BEISPIELE_HILFE`, `HOCHLADEN`, `LINK_FELD`, `PINTEREST_SATZ`, `KEIN_BILD_SATZ`, `DATEI_FEHLT`, `NELEGEBLA_DOSIERO_SATZ`, `TRO_GRANDA_SATZ`, `ERKANNT`, `ALS_PRIMAER`, `ALS_AKZENT`, `PRIMAER_MARKE`, `FARB_ARTOJ`, `FOLGO_SAETZE`, `FOLGEN_LASSEN`, `SCHRIFT_AA`, `SCHRIFT_ROLLEN_ETIKEDOJ`, `SCHRIFT_ARTOJ` (Filter → `category`, D-22), `SCHRIFT_OFFLINE_SATZ`, `EIGENE_SCHRIFT`, `EIGENE_SCHRIFT_SAETZE` (die vier), `ALS_UEBERSCHRIFT`, `ALS_TEXT`, `PRIVATES_REPO`, `AUS_DATEINAME`, `ZIP_OHNE_SCHRIFT_SATZ`, `uebergangenSatzDe(n)`, `schnitteSatzDe(gefunden, fehlt)`, `variabelSatzDe(von, bis)`.
  - `ARANGXO_056` (§2.3, Tabelle genau so), `AltecoSpeco056`; `largxoDe`, `altecoSpecoDe`, `altecoDe`, `poziciojKun` lesen `ARANGXO_056`. `ARANGXO_055` byte-gleich (`spuroX` liest es weiter, D-15).
  - `KATALOGO_056` (D-24); `aldonebloj`: die drei festen → „da“, die sechs angelegten → „anlegen“/„da“; Ausgabe für `KATALOGO_054` byte-gleich.
- [x] **`leinwand-enhavo.ts`** (einziger Import: `./grafeo-gestalten-sicht.js`, Test liest die Quelle): `enhavoDe` (überladen: `enhavoDe<I extends EnhavoId>(id: I, roh) → InhaltMapo[I] | undefined`), `senFehlt`, `wertAldoni`, `eigenschaftAldoni`, `AldonRifuzo`, `estasMalplena`, `erkanntDe`, `geloestDe(roh, knoten)`, `markoLigojDe(knoten, geloest)`, `markoEnhavoDe(knoten, geloest)`, `folgeFarboDe(e)`, `primaerStatoKun(wert, beispiele)`.
- [x] **`farb-arto.ts`:** `farbArtDe(hex, KREILO.unbunt) → {hell, bunt, leit} | undefined` über `parseAgordoColor`; `hell` = L > `dunkel_bis`, `bunt` = C ≥ `bunt_ab`, `leit` = `bunt` und L < `pastell_ab`. Keine neue Schwelle.
- [x] **`leinwand-stato.ts`** (D-2): `knotoDe` nimmt die festen Text-Knoten (Platz und/oder Inhalt; mit keinem von beiden entfällt der Eintrag) und die angelegten Knoten mit passender `speco`; Inhalte über `senFehlt` (= `enhavoDe` ohne `fehlt`). `parseLeinwandStato` liest `geloest` über `geloestDe` (fehlt bei leerer Liste). `leinwandStatoRekomenco` behält jeden Inhalt, lässt Plätze und `geloest` fallen. `serializeLeinwandAntwort` gibt `geloest` mit, wenn vorhanden.
- [x] **`grafeo-gestalten.ts`:** `GestaltenEingaben.stato?: Pick<LeinwandStato, "knoten" | "geloest">`. Ohne: byte-gleich (Prüfsummen). Mit: `marko.enhavo` (nur wenn nicht leer), Primär `stato: "aus-material"`, wenn `primaerStatoKun` es sagt. Keine neuen Knoten oder Kanten im Bildo (D-3).
- [x] **`grafeo-skribo.ts`:** vierter Parameter `katalogo?: SkriboKatalogo {tiparoj, regler}`; `sxangxoEl(korpo, kun056 = false)`; `reglerSatzDe(regler)`; `feldDe` kennt `schrift.<rolle>` und den Regler-Pfad.
- [x] **Tests rot zuerst:** alle sechs Dateien liefen vor der Umsetzung rot (fehlende Module/Exporte, `herkunft` nicht gespeichert, `schrift`/`regler` nicht gelesen). Vier Tests in `grafeo-skribo-056` waren beim ersten Lauf grün (F1–F4 unten).
- [x] **Gepflanzte Fehler** (je Fehler: Änderung, Lauf mit `-t`, rot gesehen, Rücknahme, `cmp` gegen die Sicherung gleich; `git diff --stat 6d34a75a -- packages` danach unverändert 847+/42−):
  - F1 `grafeo-skribo.ts` Prüfung `kampoj.length !== 1` entfernt → „calls a schrift body of another shape malformed“ rot.
  - F2 Pfadprüfung `SCHRIFT_PFADE.includes` entfernt → „calls another path … malformed“ rot.
  - F3 `sxangxoEl(korpo, true)` statt `katalogo !== undefined` → „calls schrift and regler malformed … without the fourth argument“ rot.
  - F4 Tönung mit Katalog auf 0 → „gives the same result for every 054/055 change“ rot.
  - F5 `marko` immer mit `enhavo: {}` → „without the state gives the bytes of 6d34a75a“ rot.
  - F6 `ARANGXO_055.alteco.marko` 72 → 73 → „leaves ARANGXO_055 byte-identical“ rot.
  - F7 `lauf !== "MP-2"` in `aldonebloj` → „leaves aldonebloj(KATALOGO_054, …) … byte-identical“ rot.
  - F8 `import "node:fs";` in `leinwand-enhavo.ts` → blieb zuerst **grün** (die Suche kannte nur `… from "x"`); Test um den nackten Import ergänzt, danach F8 und F8b (`import { join } from "node:path"`) rot.
  - F9 `multe = true` in `ligojKun` → „still keeps at most one edge at a palette row“ rot.
  - F10 `leinwandStatoRekomenco` ohne Inhalts-Bedingung → „keeps every node's content“ rot.
  - F11 Wächter `!gilt` abgeschaltet → „a hand change ends following“ rot.
- [x] **Läufe:** `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test leinwand-enhavo-056 grafeo-anschluss-056 marko-enhavo-056 folge-farbo-056 grafeo-anordnung-056 grafeo-skribo-056 grafeo-anordnung-055 grafeo-gestalten-054 grafeo-kabloj-054 grafeo-skribo-054 grafeo-route-054 leinwand-stato-055 staende-055 abnahme-055 grafeo-047 grafeo-grupoj-048 grafeo-route-047 grafeo-literale-054 grafeo-urteil-054 grafeo-urteil-055` → **255 bestanden, 0 rot** (davon die sechs neuen Dateien 76). Ganze metiejo-Suite einmal (versehentlich über `--`): 1000 bestanden, 3 rot – alle drei in `esploro/start-ohne-playwright.test.ts`, die `packages/cli/dist/index.js` und `packages/mcp/dist/index.js` starten; beide Ordner gibt es in diesem Worktree nicht (der Vorab-Bau baut nur `@fundamento/metiejo...`). Unabhängig von dieser Änderung. `pnpm --filter @fundamento/metiejo lint` grün (1 fremde Warnung `komponentoj.ts:42`). `pnpm --filter @fundamento/nodredaktilo build` grün; **`nodredaktilo lint` rot an einer Stelle**, siehe Befunde.
- [x] **Wortsuche** (R-12-Wort, Name des privaten Schriften-Repos, Erweiterungsschlüssel, zur Laufzeit aus `oldNames()`): alle hinzugefügten Zeilen (`git diff -U0 6d34a75a -- packages specs`) und die 11 neuen Dateien, 4 189 Zeilen: 0 / 0 / 0.

### KBS-1.1: geänderte ältere Tests

| Datei:Zeile (`6d34a75a`) | vorher → nachher | Grund |
|---|---|---|
| `packages/metiejo/src/grafeo-anordnung-055.test.ts:124` | `marko: [24, 48, 190, 72, 120]` → `marko: [24, 48, 190, 360, 408]` (+1 Kommentarzeile davor) | `altecoDe` liest `ARANGXO_056` mit der angehobenen Höchsthöhe der Marke (D-16); `ARANGXO_055` selbst bleibt byte-gleich (Prüfsumme in `grafeo-anordnung-056`) |

Kein anderer Test aus 047/048/054/055 geändert.

### KBS-1.1: für den PR-Text

- Neue reine Module `packages/metiejo/src/leinwand-enhavo.ts` (Inhalte, gelöste Verbindungen, was bei der Marke ankommt, „Farbe folgt den Bildern“; nur ein Import, läuft im Browser) und `farb-arto.ts` (hell/bunt/Leitfarbe aus den Schwellen in `kreilo.json`, keine neue Schwelle).
- `leinwand-stato.ts` (Leser von Spec 055) im Ort erweitert (D-2): neue Knoten mit Inhalt, `geloest`, „Anordnung zurücksetzen“ behält jeden Inhalt. Jede Datei aus Spec 055 liest sich wie zuvor.
- `gestaltenDe` bekommt den Leinwand-Zustand als wahlweise Eingabe (R-9); ohne ihn byte-gleich (Prüfsummen vom Stand `6d34a75a` im Test).
- `leinwandSchreiben` bekommt Katalog und Regler als wahlweises viertes Argument (D-23): Schrift aus Fontsource oder eigene Schrift, die drei Schrift-Regler in ihren Bereichen, Akzent mit Herkunft. Ohne das Argument unverändert.
- `ARANGXO_056` neben dem unveränderten `ARANGXO_055`; `KATALOGO_056` neben dem unveränderten `KATALOGO_054`.
- Geänderter älterer Test: `grafeo-anordnung-055.test.ts:124` (Höchsthöhe der Marke 72 → 360, Unterkante 120 → 408).
- Abweichungen vom Wortlaut der technischen Spec: D-3 (keine neuen Bildo-Knoten), D-5 (Merkmale je Farbe gespeichert), D-6 (Anker `seit`), Kontrakt `geloestDe(roh, knoten)` statt `geloestDe(roh, stato)`, `markoEnhavoDe(knoten, geloest)` statt `markoEnhavoDe(stato)`, `folgeFarboDe` nimmt `estasStartwert`/`verbunden` statt `startwert`/`geloest`/`kreilo` (die Merkmale tragen die Schwellen schon).

### KBS-1.1: Befunde

- **`nodredaktilo lint` rot nach KBS-1.1 (eine Zeile, außerhalb dieser Zone):** `packages/nodredaktilo/src/gestalten/roloj.ts:59` `ART_NOMOJ: Readonly<Record<Anschlussart, string>>` kennt `bildo` nicht, seit `Anschlussart` es enthält (Vertrag §2.1). Der Bau (`vite build`) ist grün, nur `tsc` meldet `TS2741: Property 'bildo' is missing`. **KBS-2.1 (Besitzer von `roloj.ts`) ergänzt `bildo: "Bild",`** (die Legende nennt „Text, Bild, Schrift, Maß, Marke“, Produkt-Spec V). Bis dahin ist `pnpm --filter @fundamento/nodredaktilo lint` rot.
- **`merkmal` der Herkunft:** Das Schema verlangt `AgordoHerkunft.merkmal`; D-23 nennt es wahlweise. Fehlt es im Rumpf, schreibt der Schreibweg `Farbe <wert>` – die Form, die `enportilo/zweitfarbe.ts:71` ohne Ort schreibt. Eine Herkunft mit `quelle: "link"` gilt auf der Leinwand als fehlgeformt (D-23 nennt nur `bild`/`pdf`).
- **Neue Sätze ohne Vorlage in der Produkt-Spec:** Für eine unbekannte Fontsource-Id nimmt der Schreibweg den vorhandenen `NEVALIDA_SATZ` („Diesen Wert nimmt der Entwurf nicht an.“). Für einen Regler außerhalb seines Bereichs gibt es `reglerSatzDe` nach dem Muster des Tönungssatzes: „„Schriftgröße“ ist eine Zahl von -1 bis 1.“ (Bezeichnung und Bereich aus `reglerOf`). Beide ohne Regelname, getestet.
- **Rolle `code`:** `schriftenOf` in `servilo.ts` kennt nur `display`/`body`/beide; der Schreibweg der Leinwand setzt `schriften.code` selbst (gleiches Zusammenführen wie `patched`).
- **Grenze acht in `erkanntDe`:** Sie steht als `ERKANNT_GRENZE = 8` in `leinwand-enhavo.ts` (das Modul darf den Enportilo nicht importieren). Der Test leitet die Zahl aus `farbojOfPixels` ab und hält beide gleich; kein neuer Wert.
- **`BEISPIELE_HILFE` und `TRO_GRANDA_SATZ` tragen „24 MB“ wörtlich.** KBS-2.1 leitet die Zahl aus `dateiGrenzeDe(ANFRAGE_GRENZE)` ab (D-11) und sollte die Gleichheit mit diesen Konstanten in seinem Test festhalten.
- **`fehlt`:** `enhavoDe` behält `fehlt: true` (die Antwort von `GET /api/leinwand` trägt es, die Leinwand liest Inhalte über `enhavoDe`); der Datei-Leser (`parseLeinwandStato`, auch für `PUT`) entfernt es über `senFehlt`. Das Markieren in der GET-Antwort ist Sache von KBS-2.1.
- **Variable Schrift:** `SchriftDosiero` trägt den Bereich als `gewicht` (unten) und `gewichtBis` (oben, wahlweise) – ein Feld, das die technische Spec nicht nennt, für den Satz „Variable Schrift, Gewichte 100 bis 900.“ (KBS-3.5).
- **Mehr als fünf Werte in einer Datei:** Werte-Ids sind nur `w1`…`w5`; ein sechster Wert kann in der Datei darum nie mit gültiger Id stehen – „die ersten fünf bleiben“ greift über die Duplikatregel.

## KBS-2.1 (T2): Hülle

### KBS-2.1 im Einzelnen

- [x] **Tests zuerst:** `packages/metiejo/src/leinwand-sxelo-056.test.ts` (14 Tests). Erster Lauf: 10 rot aus dem richtigen Grund (Sitzung kennt `markoGeloest`/`aldonitaj`/`inhaltoj` nicht, kein `enhavo`/`fehlt` in der Antwort, `{schrift}` 400, Quellen ohne Bezier/Alias), 4 grün (Bytes ohne Zustandsdatei, eine Import-Anweisung in `stato.ts`, Stubs, D-11) – je ein Fehler gepflanzt, rot gesehen, zurückgenommen, `cmp` gleich: **F1** GET antwortet ohne Datei `stato: {knoten:[],kabloj:{}}` statt `null` → „bytes of 6d34a75a“ rot; **F2** zweite Import-Zeile (`import type { Node } from "@xyflow/react"`) in `stato.ts` → D-20-Test rot; **F3** `tiparoVojoj` gibt `true` → Stub-Test rot (nur dieser Test, `-t`, weil ein Stub mit `true` jede Anfrage unbeantwortet lässt); **F4** `dateiGrenzeDe` = `grenze·2/3` → D-11-Test rot.
- [x] **Prüfsummen vor der Änderung** (`servilo.ts` = `6d34a75a`, `git diff --quiet` geprüft): `GET /api/leinwand?marko=provo` `b5fcedbd…50c0`, `…&kabloj=akzent:-` `d2464ebb…052f`, `?marko=komuna` (Basis komuna) `77bff7cc…a187`; im Test fest eingetragen, nach der Änderung gleich.
- [x] **Teil V (D-17):** `kanto.tsx` `getBezierPath` (kein `spuroX`, kein `radiuso`); `roloj.ts` `.nr-g-kanto` `stroke-dasharray: 4 4; stroke-linecap: round`, `[data-nr-matt]` nur noch `stroke-opacity`; neue Rolle `ROLOJ.kanto` = `var(--fm-color-text-muted)` (dieselbe wie `--xy-edge-stroke`) für jede Nicht-Farbkante; Anschlüsse und Zeichen `--fm-radius-full`; `connectionLineType={ConnectionLineType.Bezier}`, Ziehlinie `4 4`, runde Enden. `spuroX`/`ARANGXO_055.spuroj` bleiben unbenutzt (D-15).
- [x] **Marke-Knoten:** `marko.en.teksto` links, `marko.en.bildo` oben (`rando="supro"`), `marko.el` wie bisher; darunter „Kern“ (je 3 Zeilen), „Werte“ (Pillen), „Beispiele“ (Punkte), „Dazu“ – je nur wenn etwas ankommt (`markoEnhavoDe` der Sitzung). Breite 190, wächst nach unten.
- [x] **Lösen/Stecken:** Kanten in die Marke = `markoLigojDe(Sitzungsknoten, markoGeloest)` neben den Farbkanten; „×“, Entf und Ende-ins-Leere lösen (`kunLoesen` erkennt `…>marko.en.*` und legt den Ausgang in `markoGeloest`, nie in `geloest`, D-19); Ziehen vom Ausgang zum Marke-Eingang steckt (`kunZiehen` nimmt nur diesen Ausgang heraus, D-18); `beispiele.el` wieder gesteckt → `folgi("gesteckt")`. Kopfleiste D-29: `geloestHinweisDe(n) + " ·"` + „zurücksetzen“, n = Zeilen von `kabloj` + gelöste Marke-Kanten (mindestens 1, solange Farbkanten abweichen); „zurücksetzen“ steckt alles.
- [x] **„+ Knoten“** zeigt `KATALOGO_056`; „anlegen“ ist wählbar für die sechs hinzufügbaren Knoten (`menuo.tsx` `elektebla`), sie stehen an ihrem Platz aus `ARANGXO_056`, höchstens einmal. „×“ im Kopf nur bei hinzugefügtem **leerem** Knoten (Rahmen), feste drei nie. Schrift auf der Leinwand → feste Kante `schrift.el` → `<vorschau>.en.tiparo` zu jeder Vorschau (auch weiteren), ohne „×“.
- [x] **Sitzung/Zustand** (`stato.ts`, eine Import-Anweisung): `Sesio` + `aldonitaj?`, `inhaltoj?`, `markoGeloest?` (nur gesetzt, wenn nicht leer); `statoDeSesio` schreibt die Knoten dieses Laufs in fester Reihenfolge (TEKSTO_IDS, beispiele, schrift), leere Inhalte weg, `geloest` nur bestehende Ausgänge, sortiert, nur wenn nicht leer – genau das, was `parseLeinwandStato` daraus macht (Test). Neue reine Helfer `enhavoNodojDe`, `enhavoKnotenDe`, `markoGeloestDe`, `markoElirDe`, `kunAldono`, `kunForigo`. Getippter Inhalt (`konservi: false`) bleibt im Speicher; geschrieben wird der zuletzt mit `konservi: true` gesetzte.
- [x] **Server** (`servilo.ts`): `ANFRAGE_GRENZE`/`dateiGrenzeDe` (Wert unverändert, D-11), `korpoDe` (über der Grenze wird der Rest gelesen und verworfen → 422 möglich), `VojoKunteksto`, Aufruf der drei Routenmodule vor `…/leinwand-stato` und allen generischen `/api/marko/*`, `/marko/:name/*`-Wegen, `fontFaceOf(agordo, name)` hängt `eigeneFontFace` an (bei `""` byte-gleich); GET `/api/leinwand` gibt den Zustand an `gestaltenDe` und markiert fehlende Dateien `fehlt: true` (nur Antwort; solche Antworten werden nicht zwischengespeichert); POST `/leinwand` reicht `{tiparoj, regler}` weiter.
- [x] **Platzhalter:** `nodoj/teksto.tsx` (Titel, Hilfe, Anschluss; Werte je Wert eine Pille mit Anschluss), `nodoj/beispiele.tsx` (Titel, Hilfe, `<Erkannt />`, Anschluss unten), `nodoj/erkannt.tsx` (null), `nodoj/schrift.tsx` („Aa“, `<SchriftEigene />`, Anschluss), `nodoj/schrift-eigene.tsx` (null), `gestalten/folgo.ts` (`folgi` tut nichts). Server-Stubs `beispiele-vojoj.ts`, `tiparo-vojoj.ts`, `schriftdosieroj-vojoj.ts` (`false`, `eigeneFontFace` → `""`, `FONTOJ_DIR = "fontoj"`).
- [x] **Alias D-4:** `@fundamento/metiejo/enhavo` → `metiejo/src/leinwand-enhavo.ts` in `vite.config.ts` und `tsconfig.json`.
- [x] **M-1:** `scripts/bilder-055.ts:305` `/[QA]/` → `/[QAC]/`, `:418` Text „Q, A oder C“.
- [x] **Höhen in Chromium** (2100×1250, gebaute CLI, leere Marke „lumeto“): Start Marke 66/480, Ausgangslage 93/172, Markenkern 75/220, Werte 93/270; alle sechs angelegt: Zielgruppe 110/264, Wettbewerb 110/220, Persönlichkeit 92/172, Tonalität 66/300, Beispiele 110/640, Schrift 110/360 (Platzhalter). **Marke mit vollstem Inhalt** (Kern 2×3 Zeilen, fünf Werte, acht Farben, „Dazu“ mit fünf Namen): **452 > 360** → Höchsthöhe auf **480** angehoben (`ARANGXO_056.alteco.marko`, unten 528; unter der Marke steht in ihrer Spalte nichts). Werte mit fünf Werten (Platzhalter) 248/270. Boxen paarweise disjunkt und keine Kante durch eine fremde Box – beim Start, mit allen Knoten und mit voller Marke; jede Kante `d` mit `C`; Anschlüsse `border-radius: 9999px`; Strich `4px, 4px | round`.
- [x] **Chromium-Rauchtest** (eigenes Skript außerhalb des Repos, siehe „für den PR-Text“): neue Marke, drei Textknoten links, Kurven, Lösen per „×“ und Entf, Kopfleiste „1 Verbindung gelöst ·“, Wert blass, nach Neuladen weiter gelöst, Stecken per Ziehen, „zurücksetzen“, „×“ auf leerem hinzugefügtem Knoten, kein Konsolenfehler: **SMOKE OK**.
- [x] **Läufe:** `leinwand-sxelo-056` 14/14; `vitest run 054 055 056 047 048` 398 bestanden, 0 rot; `pnpm --filter @fundamento/metiejo lint` grün (1 ältere Warnung), `pnpm --filter @fundamento/nodredaktilo lint` grün (vorher rot wegen `ART_NOMOJ`), Build grün. Wortsuche (R-12-Wort, Repo-Name, aus `oldNames()` zur Laufzeit) über 1 862 neue Zeilen: 0.
- [x] **Bündel:** `dist/leinwand.js` 772 688 Byte roh, 202 475 Byte `gzip -6` (Ausgang 746 121 / 195 930).

### KBS-2.1: geänderte ältere Tests

| Datei:Zeile | vorher → nachher | Grund |
|---|---|---|
| `packages/metiejo/src/grafeo-anordnung-055.test.ts:124–125` | `marko: [24, 48, 190, 360, 408]` (Stand KBS-1.1) → `marko: [24, 48, 190, 480, 528]`, Kommentar um eine Zeile verlängert | Gemessene Höhe der vollen Marke 452 px > 360 (D-16: anheben, nie senken) |
| `packages/metiejo/src/grafeo-anordnung-056.test.ts:78, 90` | `360`/`[24, 48, 190, 360, 408]` → `480`/`[24, 48, 190, 480, 528]` | dieselbe Anhebung (Test von KBS-1.1, selbe Konstante) |
| `packages/nodredaktilo/scripts/bilder-055.ts:305, 418` | `/[QA]/`, „Q oder A“ → `/[QAC]/`, „Q, A oder C“ | M-1: Kurven schreiben `C` |

### KBS-2.1: für den PR-Text

- Teil V: alle Kanten der Ansicht Gestalten als gestrichelte Bezier-Kurven mit runden Enden, hellgrau außer Farbkanten; runde Anschlüsse; Ziehlinie als Kurve. Verstehen unberührt.
- Marke-Knoten mit zwei Eingängen (Text links, Bild oben) und dem, was ankommt; Kanten in die Marke lösbar/steckbar, als `geloest` gespeichert, Kopfleiste „n Verbindungen gelöst · zurücksetzen“ (statt „gilt nur in dieser Sitzung“).
- „+ Knoten“ mit `KATALOGO_056`; drei feste Textknoten, sechs hinzufügbare Knoten (bis KBS-3.x Platzhalter); feste Kante Schrift → jede Vorschau.
- Server: `/api/leinwand` mit `marko.enhavo`, `fehlt: true` für fehlende Dateien (nur Antwort); `POST …/leinwand` nimmt Schrift und Schrift-Regler; Grenzwert `ANFRAGE_GRENZE` benannt (Wert unverändert, 32 MiB → Datei 24 MiB); drei Routenmodule als Einhängepunkte.
- Ältere Tests: `grafeo-anordnung-055.test.ts:124–125` Marke 480/528 (gemessen 452), `bilder-055.ts:305,418` akzeptiert `C`.
- Rauchtest (wiederverwendbar): `node smoke.mjs <repo> <bilder-ordner>` – eigenes Skript im Temp-Ordner, `createRequire(<repo>/packages/nodredaktilo/package.json)("playwright")`, startet `packages/cli/dist/index.js metiejo --port <frei> --workdir <tmp>`, Chromium 2100×1250; vorher `pnpm exec turbo run build --filter=@fundamento/cli` und `pnpm --filter @fundamento/nodredaktilo build`.

### KBS-2.1: Befunde

- **Höhe Marke angehoben:** 360 → 480 (gemessen 452 mit Kern 2×3 Zeilen, fünf Werte, acht Farben, „Dazu“ fünf Namen; Abschnittsabstand schon auf `--fm-spacing-small` verdichtet).
- **`bilder-055.ts:404` erwartet „11 Knoten gerendert“**; seit Spec 056 stehen beim Start 14 (drei feste Textknoten) und 19 Kanten. Das Skript von 055 bricht dort ab; außerhalb meiner Zeilen (M-1 nennt nur 305/418), daher nicht geändert. KBS-4.1 (`bilder-056.ts`) ersetzt die Messung.
- **Konsolen-Warnungen `fm-ikono: name is required`** erscheinen schon beim ersten Laden einer neuen Marke (4 je Laden), bevor ein neuer Knoten oder ein neues „×“ da ist – nicht von dieser Änderung; keine Konsolenfehler.
- **Kopfleisten-Zahl:** D-29 zählt Zeilen von `kabloj` + gelöste Marke-Kanten. Weicht nur eine Vorschaukante ab (keine `kabloj`-Zeile), zeigt der Hinweis „1 Verbindung gelöst“ (Mindestwert 1).
- **Vorschau-Schrifteingang** `…en.tiparo` wird immer gezeichnet (Ring ohne Schrift-Knoten): ein später hinzukommender Anschluss würde von React Flow nicht vermessen. Für Werte ruft die Hülle `updateNodeInternals("teksto-werte")`, wenn sich die Wert-Anschlüsse ändern.
- **Marke-Eingang mit vielen Kanten:** Greifen am Anschluss nimmt die gewählte Kante dort, sonst die letzte. Beim Klicken auf dicht beieinanderliegende Wert-Kanten trifft man die zuletzt gezeichnete.
- **Client kennt `ANFRAGE_GRENZE` nicht** (liegt in `servilo.ts`, das Bündel darf es nicht laden); KBS-3.2/3.5 prüfen im Browser über die Zahl 24 MiB der Sätze oder verlassen sich auf die 422 des Servers (`korpoDe` → `{troGranda}`).
- **Leer bei Schrift:** `estasMalplena("schrift", …)` zählt nur eigene Schriften; der Rahmen nimmt das, solange `schrift.tsx` kein eigenes `leer` übergibt (KBS-3.4).

## KBS-3.1 (T3): Die sieben Text-Knoten

### KBS-3.1 im Einzelnen

Stand: fertig.

- Platzhalter `nodredaktilo/src/gestalten/nodoj/teksto.tsx` ersetzt; aufgeteilt in `teksto.tsx` (`TekstoNodo`, Stile, Auswahl des Körpers, ein Ausgang `${id}.el` bei `supro={42}` außer Werte), `teksto-kampoj.tsx` (Freitext, einzeiliges Feld `fm-kampo`, „ד `fm-butono`, ruhige Zeile), `teksto-listoj.tsx` (Werte, Persönlichkeit, Wettbewerb), `teksto-tonalitaet.tsx` (sechs `fm-glitilo`).
- Ausgangslage: ein Freitext, Hilfe als Platzhalter. Zielgruppe: drei beschriftete Freitexte (`ZIELGRUPPE_ETIKEDOJ`), Hilfe im Feld „Wer“. Markenkern: Zweck (Hilfe als Platzhalter) und Versprechen (`MARKENKERN_HINWEIS` als Platzhalter, keine Prüfung). Freitexte wachsen mit dem Text nach unten (Knoten wächst mit, kein Scrollen).
- Werte: Enter im Feld `WERT_HINZUFUEGEN` → `wertAldoni`; jede Pille mit „ד und eigenem Anschluss `wertElirDe(w.id)` am rechten Knotenrand auf Höhe der Pille; bei fünf verschwindet das Feld, `FUENF_WERTE_SATZ` steht da; doppelt (Groß/klein egal) still abgelehnt; gelöste Pille blass und gestrichelt; leer: `TEKSTO_HILFOJ` als ruhige Zeile.
- Persönlichkeit: wie Werte mit `eigenschaftAldoni`, ein Ausgang; Hilfe als Platzhalter des Felds; unter drei steht `EIGENSCHAFTEN_HINWEIS`, bei fünf `FUENF_EIGENSCHAFTEN_SATZ` und das Feld ist weg.
- Wettbewerb: Zeilen Name + Adresse (wahlweise), nie geladen, nie geprüft; am Ende wartet immer eine leere Zeile; leere Zeilen werden nicht gespeichert (`enhavoDe`); „ד je gefüllter Zeile; Hilfe als ruhige Zeile solange leer (`estasMalplena`).
- Tonalität: sechs Regler −2…2 mit Strichen, Mitte `TONALITAET_MITTE` als Zeile unter dem Regler; unberührt blass und ungesetzt; der Knoten bleibt leer, bis ein Regler gesetzt ist; ein Druck ohne Bewegung auf einen unberührten Regler setzt die Mitte; die Seite, zu der der Regler neigt, steht in Textfarbe.
- Speichern: Tippen setzt den Inhalt nur im Speicher (`inhaltMeti(…, false)`, Marke folgt sofort); Verlassen eines Felds mit geändertem Text, Hinzufügen/Entfernen einer Pille oder Zeile und Loslassen eines Reglers schreiben (`konservi: true` → „gespeichert HH:MM“, Licht in die Marke).
- **Tests zuerst** `packages/metiejo/src/teksto-knoten-056.test.ts` (9 Tests): Quellen nur mit Kontext (`inhaltDe`, `inhaltMeti`, `verbunden`, `markoGeloest`, `forigi`) und geteilten Regeln (`wertAldoni`, `eigenschaftAldoni`, `estasMalplena`, kein eigenes Kleinschreiben, keine 5), erlaubte Importe, kein `fetch`; jede Hilfe, Überschrift, Feldbeschriftung und jeder ruhige Satz aus den geteilten Konstanten (kein Literal); ein `Anschluss` je Wert `teksto-werte.el.<id>`; keine Farbliterale; kein Regelwort, kein R-12-Wort; HTTP: Zustand mit allen sieben Inhalten (inkl. 5 800 Zeichen Ausgangslage) übersteht PUT/GET unverändert, Marke trägt `markoEnhavoDe`.
  - Erster Lauf vor der Umsetzung: 3 rot aus dem richtigen Grund (Kontext ohne `inhaltMeti`, keine geteilten Regeln aufgerufen, Konstanten nicht benutzt), 1 rot wegen eines Testfehlers (`kabloj` fehlte im PUT-Körper, korrigiert), 6 grün.
  - **Eingepflanzte Fehler** für die zuerst grünen Gruppen (je rot gesehen, zurückgesetzt, `cmp` gleich): P1 `TekstoNodo` als `const`-Funktion → „exporting TekstoNodo“ rot; P2a `import type {} from "../datumoj.js"` → Import-Test rot; P2b `fetch("/api")` → derselbe Test rot; P4 Wert-Port als Literal `` `teksto-werte.el.${w.id}` `` → Port-Test rot; P5 Hex-Farbe in einem Kommentar → Farbliteral-Test rot; P6 Wort „Pflicht“ in einem Kommentar → Wort-Test rot; P7a Regler `"warm-kuehl": "kühl"` im PUT → HTTP-Test rot; P7b `geloest: ["teksto-werte.el.w2"]` im PUT → HTTP-Test rot (Marke-Inhalt).
- **Läufe:** `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test teksto-knoten-056 grafeo-literale-054 grafeo-urteil-054 grafeo-urteil-055 leinwand-enhavo-056 marko-enhavo-056` → 53 bestanden, 0 rot. `pnpm --filter @fundamento/nodredaktilo lint` und `build` grün; biome auf der neuen Testdatei grün. `leinwand-sxelo-056` hatte zwischendurch 1 rot in `beispiele-vojoj.ts` (KBS-3.2 in Arbeit, nicht diese Zone).
- **Wortsuche** (R-12-Wort, Name des privaten Schriften-Repos, Erweiterungsschlüssel, zur Laufzeit aus `oldNames()`): 5 neue/ersetzte Dateien, 1 191 Zeilen: 0 / 0 / 0.
- **Chromium** (eigenes Skript `/tmp/kbs31-smoke/smoke.mjs`, headless, 2100×1250, gebaute CLI, temporärer Arbeitsordner, freier Port): Ablauf 1 Schritte 1–4 und Ablauf 7 Schritte 1–3 bestanden, dazu fünf Werte/Satz/Feld weg, Entfernen mit stabilen Ids, Duplikat, alle vier angelegten Knoten, Wettbewerb-Zeilen, Persönlichkeit (Hinweis < 3, Satz bei 5), Tonalität (blass, sechs gesetzt, Mitte durch Druck, „dazwischen“), Neuladen behält alles, langer Text lässt den Knoten wachsen (122 → 311 px), Kästen disjunkt, keine Konsolenfehler. Ergebnis: alles ok.
- **Gemessene Höhen** (übliche Inhalte, px bei Zoom 1, Maximum §2.3): Ausgangslage 122/172 (drei Sätze), Zielgruppe 259/264 (drei Felder mit je einem Satz), Wettbewerb 209/220 (drei Zeilen + leere Zeile), Markenkern 189/220 (je ein Satz), Werte 269/270 (fünf Werte + Satz), Persönlichkeit 145/172 (fünf), Tonalität 255/300 (sechs gesetzt), Marke 327/480. Im Laufe korrigiert im Knoten: Pillenabstand von `small` auf `xsmall` (Werte war 279), Platz unter jedem Regler für „dazwischen“ (überlappte die nächste Zeile).

### KBS-3.1: geänderte ältere Tests

Keine.

### KBS-3.1: für den PR-Text

- Die sieben Text-Knoten schreiben im Knoten selbst (Option A): Hilfe als Platzhalter oder ruhige Zeile, Werte mit eigenem Anschluss je Wert, Persönlichkeit als Marken, Wettbewerb als Zeilen, Tonalität mit sechs Reglern. Gespeichert wird beim Verlassen eines Felds, beim Setzen/Entfernen einer Marke und beim Loslassen eines Reglers.
- Freitexte sind native `<textarea>` (Rollen der Belegung, `nodrag`/`nopan`): die Ero `fm-tekstareo` wächst nicht mit dem Text und steht nicht in `fm-elementoj.d.ts`.
- Neuer Test `teksto-knoten-056` (Quellen + HTTP-Roundtrip aller sieben Inhalte).

### KBS-3.1: Befunde

- Drei Wörter stehen ohne geteilte Konstante im Knoten: Wettbewerb „Name“ und „Adresse (wahlweise)“ (Wortlaut der Produktspezifikation, `teksto-listoj.tsx` `WETTBEWERB_ETIKEDOJ`) und das Zugangslabel „<Wert> entfernen“ des „ד. Vorschlag: in `grafeo-gestalten-sicht.ts` aufnehmen (eingefrorene Datei, nicht angefasst).
- `fm-kampo` gibt das native `change` seines inneren Felds nicht nach außen (Shadow-DOM, nicht `composed`); „Feld verlassen“ wird darum aus `focusin`/`focusout` gelesen. Der Kommentar in `fm-elementoj.d.ts` (Ero feuert `change`) stimmt für das Verlassen nicht; der Farbknoten schreibt nur über Enter zuverlässig. Kein Eingriff (eingefroren).
- Werte mit fünf Werten misst 269 von 270 px: knapp. Ein Font mit größerer Zeilenhöhe könnte das Maximum überschreiten; dann im Knoten den Satz kürzer setzen oder die Höhe in `ARANGXO_056` anheben (KBS-4.1).
- Ein unberührter Regler lässt sich nur über Ziehen, Tastatur oder einen Druck auf die Mitte setzen (`fm-glitilo` meldet keinen Wert, der sich nicht ändert); der Druck wird über `pointerup` gelesen.

## KBS-3.2 (T4): Beispiele

### KBS-3.2 im Einzelnen

Stand: fertig.

- Server `packages/metiejo/src/beispiele-vojoj.ts` (Stub ersetzt):
  - `POST /api/marko/:name/beispiele` mit `{filename, base64}` → 200 `{datei: {name, art, farben, satz?}}`; mit `{url}` → 200 `{datei}` oder 200 `{verweis: {adresse, satz}}`; 422 `{satz: "Diese Datei kann Fundamento nicht lesen"}` für eine unlesbare Datei (nichts gespeichert); 422 `{satz: "Diese Datei kann Fundamento nicht lesen. Sie ist größer als 24 MB."}` bei Überlauf von `korpoDe` (D-11); 422 `{satz: KEIN_BILD_SATZ}` für einen Text, der keine http(s)-Adresse ist (nichts abgerufen); 404 `{satz: "Diese Marke gibt es nicht."}`.
  - `DELETE /api/marko/:name/beispiele/:datei` → 200 `{}`; 404 `{satz}` für unbekannte Marke, unbekannte Datei, einen Namen, den `safeFilename` ändert (Pfad, `..`, Leerzeichen), oder eine Endung, die Beispiele nicht nimmt (`.gitignore`, `.txt`).
  - D-9: nur `.png .jpg .jpeg .webp .svg .pdf`, und die ersten Bytes müssen zur Endung passen (`artDeBajtoj`; SVG muss mit dem Wurzelelement beginnen). `legiMaterialon` läuft in `mkdtemp(tmpdir()/fm-beispiele-)` unter demselben Markennamen, ohne `tiparojRepo`/`deps`; nur bei Erfolg wird die Datei nach `marken/<name>/materialo/` kopiert (`.gitignore` `*`), das Temp-Verzeichnis wird immer entfernt.
  - D-5: jede Farbe trägt `{hex, anteil, hell, bunt, leit}` aus `farbArtDe(hex, KREILO.unbunt)`. PNG/JPG/WebP: `anteil` = Flächenanteil des Enportilo; SVG/PDF: Häufigkeit der Füllung, umgerechnet in Prozent (0,1) aller Füllungen der Datei.
  - D-10: eine Adresse wird einmal über `options.esploro.fetch` (sonst globales `fetch`) geholt: `redirect: "follow"`, `credentials: "omit"`, keine Kopfzeilen, `AbortSignal.timeout(RETEJO_TEMPOLIMO)`; Körper höchstens `dateiGrenzeDe(ANFRAGE_GRENZE)` (vorhandener Wert). Bild = `content-type: image/*` oder Bytes von PNG/JPG/WebP/SVG/PDF → weiter wie ein Upload (Name aus dem letzten Pfadteil, Endung nach den Bytes). Sonst, bei Fehlerstatus oder ohne Antwort → Verweis; `pin.it` und `*.pinterest.<tld>` → PINTEREST_SATZ, alles andere → KEIN_BILD_SATZ.
- Browser `packages/nodredaktilo/src/gestalten/nodoj/beispiele.tsx` (Platzhalter ersetzt, `<Erkannt />` unverändert als Slot) und neu `gestalten/beispiele-datumoj.ts` (`beispielHochladen`, `beispielLigi`, `beispielForigi`, `materialoFonto`, reine Schritte `kunDosiero`, `senDosiero`, `kunVerweis`, `senVerweis`).
  - Hilfe BEISPIELE_HILFE in der gestrichelten Ablagefläche; mehrere Dateien über „Hochladen“ (verstecktes `input type=file multiple`) oder durch Ziehen auf den Knoten, eine Anfrage je Datei nacheinander (eine Warteschlange auch über mehrere Aktionen); lesbare werden übernommen, jede unlesbare steht als „„name“: Satz.“ ruhig am Knoten.
  - Quadratische Vorschaubilder in fünf Spalten (siehe Befund Höhe), PDF als Kachel mit Namen, fehlende Datei als „Datei fehlt“, je „×“ (`fm-butono`). Ein ersetztes Bild bekommt `?v=n`, damit der Browser nicht das alte zeigt. Der vorhandene Satz eines JPG/WebP ohne Browser steht unter der Fläche und im `title` des Bildes.
  - Feld „Pinterest-Link oder Bildadresse“ (`fm-kampo kind=url`, Enter oder „+“), Verweise mit Adresse, Satz und „×“.
  - Nach jedem Bild rein/raus und jeder geladenen Adresse: `inhaltMeti("beispiele", …, true)` und – nach dem Rendern des neuen Inhalts, über einen Effekt – `folgi("dateien", valoro)`. Ein Verweis rein/raus schreibt nur den Inhalt.
  - Ausgang `beispiele.el` an der Unterkante (unverändert aus KBS-2.1).
- Tests `packages/metiejo/src/beispiele-056.test.ts` (18): PNG/SVG/PDF mit Farben und Flags, `.gitignore`; JPG/JPEG/WebP ohne Browser (gespeichert, vorhandener Satz, `farben: []`); JPG mit Browser-Double; GIF, DOCX, WOFF2, kaputtes PNG, „kein PNG“, PNG-Bytes als `.svg/.pdf/.jpg/.webp`, ohne Endung, leerer Name → 422, nichts gespeichert, gleichnamige gute Datei unberührt, keine Schrift in `fontoj/`; kaputter Körper → 422; gleicher Name ersetzt; Pfad im Namen bleibt in `materialo/`; Überlauf → 422 mit TRO_GRANDA_SATZ; unbekannte Marke → 404; Bildadresse (mit und ohne Bildtyp), GIF-Adresse → 422; Pinterest (`www.pinterest.de`, `pin.it`) → Verweis mit PINTEREST_SATZ; andere Seite, 404, unerreichbar → KEIN_BILD_SATZ; kein Cookie, kein `authorization`, `credentials: "omit"`, `redirect: "follow"`, Signal; keine Web-Adresse → 422 ohne Abruf; DELETE, zweites DELETE, unbekannte Datei/Marke → 404; Traversal (`..%2F`, kodierte Punkte), `.gitignore`, `.txt`, `a b.png` → 404, nichts gelöscht.
- Erster Lauf: 18 von 18 rot (Stub antwortet `false`, Anfragen fielen auf 404-HTML; der Überlauf-Test mit ECONNRESET, der Traversal-Test schon beim Anlegen von `notiz.txt`, weil `materialo/` fehlte). Für die drei Tests, deren erstes Rot nicht an ihrer Aussage hing, und für D-10 je ein gepflanzter Fehler, rot gesehen, zurückgesetzt, `cmp` gegen die Kopie gleich:
  - F1 DELETE ohne `safeFilename`-/Endungsprüfung → Traversal-Test rot.
  - F2 `legiMaterialon` direkt im Arbeitsordner (ohne Temp-Verzeichnis, D-9) → „unreadable file … good file untouched“ rot.
  - F3 `headers: { cookie: "sesio=1" }` im Abruf → Adress-Test rot.
  - F4 Überlauf antwortet nur NELEGEBLA_DOSIERO_SATZ → Überlauf-Test rot.
- Läufe: `beispiele-056` 18/18; mit `leinwand-sxelo-056`, `src/enportilo/`, `grafeo-literale-054`, `grafeo-urteil-054/055`: alles grün bis auf den einen Stub-Test von KBS-2.1 (siehe Befunde). `pnpm --filter @fundamento/nodredaktilo lint` grün; metiejo: `tsc`/`biome` ohne Meldung in meinen Dateien (rot nur in `erkannt-056.test.ts`, `beispiele-eksporto-056.test.ts`, `teksto-knoten-056.test.ts` der Nachbarn und der alten Warnung `komponentoj.ts:42`). nodredaktilo-Build grün, `dist/leinwand.js` 803 020 B (gzip 210 720 B) mit dem Stand aller laufenden Tickets.
- Chromium (eigenes Skript `/tmp/kbs32-smoke/smoke.mjs <repo> <aus>`, gebaute CLI, Temp-Arbeitsordner, freier Port, 2100×1250, keine Verbindung nach außen: Bildadresse von einem lokalen Server, Pinterest als `www.pinterest.invalid`): SMOKE OK – Ablauf 2 Schritte 1–2 (Knoten über „+ Knoten“, Kante von oben in die Marke, Ausgang an der Unterkante, drei Bilder gezogen → drei quadratische Vorschaubilder, drei POST nacheinander), mehrere mit einer unlesbaren (GIF benannt, nicht gespeichert; PDF als Kachel), „Hochladen“ mit gleichem Namen ersetzt, Schritt 5 (× entfernt Bild und Datei), Bildadresse geladen, Ablauf 3 (Pinterest-Verweis mit Satz), andere Seite als Verweis, Verweis-×, Neuladen behält alles, gelöschte Datei → „Datei fehlt“, keine Konsolenfehler (außer dem erwarteten 422 der GIF-Antwort), keine Warnung außer `fm-ikono`. Bilder in `/tmp/kbs32-smoke/bilder/`.
- Höhe (gemessen, Flusseinheiten): zwölf Vorschaubilder + „Erkannt“ von KBS-3.3 mit acht Zeilen (258) + Zeile „Primär folgt …“: **601 / 640** (Kopf 31, Fläche 202, Hochladen 40, Link 44, Erkannt 258). Mit vier Spalten wie im Mockup waren es 640 / 640.
- **Pinterest-Prüfung** (einmal, `curl` ohne Cookie, ohne Konto, ohne Anmeldung, am 16.11.2026): `https://www.pinterest.com/pinterest/official-news/` → 200 `text/html`, 1,68 MB. Die Seite nennt **ohne Anmeldung Bildadressen**: 156 verschiedene Adressen auf `i.pinimg.com` (Größen `236x`, `474x`, `736x`, `170x`, `originals` …), davon 155 im JSON des Skripts `<script id="__PWS_INITIAL_PROPS__">`, 23 als `<img src>` im ausgelieferten HTML, eine als `og:image`. Erwartung R-8 („liefert nichts“) trifft damit nicht zu. Gebaut wurde darauf nichts: eine Board-Adresse bleibt nach Spec ein Verweis mit dem Pinterest-Satz; eine einzelne `i.pinimg.com`-Bildadresse lädt wie jede Bildadresse.

### KBS-3.2: geänderte ältere Tests

- Keine geändert. **Nötig, aber außerhalb meiner Zone (nicht angewandt):** `packages/metiejo/src/leinwand-sxelo-056.test.ts:441–453` (KBS-2.1) erwartet, dass `beispieleVojoj` einen `POST /api/marko/provo/beispiele` nicht behandelt (`[false, false, false]`). Mit der echten Route ist das falsch (sie wirft auf dem leeren Kontext-Double). Vorschlag: `beispieleVojoj` aus der Liste nehmen (`[tiparoVojoj, schriftdosierojVojoj]` → `[false, false]`) oder eine Adresse prüfen, die keine Route behandelt; KBS-3.4/3.5 trifft dasselbe.

### KBS-3.2: für den PR-Text

- Neue Wege `POST /api/marko/:name/beispiele` und `DELETE /api/marko/:name/beispiele/:datei` in `beispiele-vojoj.ts`; Bilder nur in `marken/<name>/materialo/`, erst gelesen, dann abgelegt (Temp-Ordner, D-9).
- Befund `packages/metiejo/src/enportilo/retejo.ts:21`: eine Zeile, `export const RETEJO_TEMPOLIMO = 15_000;` – benennt den vorhandenen Wert, den `text()` bei `retejo.ts:72` (`AbortSignal.timeout(15_000)`) schreibt; Wert unverändert, keine weitere Änderung in `enportilo/**`.
- Keine neue Grenze, keine neue Zeit, keine neue Abhängigkeit: Größe über `dateiGrenzeDe(ANFRAGE_GRENZE)`, Zeit über `RETEJO_TEMPOLIMO`.
- Ergebnis Pinterest-Link mit Fundstelle: siehe „im Einzelnen“.

### KBS-3.2: Befunde

- **Pinterest liefert ohne Anmeldung Bildadressen** (R-8 widerlegt), Fundstelle `__PWS_INITIAL_PROPS__` und `<img src>`; nicht genutzt (kein Umgehen, Spec lässt Board = Verweis).
- `retejo.ts:21` und `:72` tragen den Wert jetzt zweimal (eine Zeile war vorgegeben); wer ihn ändert, muss beide ändern. Aufräumvorschlag: `:72` auf `RETEJO_TEMPOLIMO` umstellen.
- Höhe: vier Spalten wie im Mockup hätten mit „Erkannt“ genau 640 erreicht; fünf Spalten geben 601. Jeder Verweis kostet etwa 60 (Adresse und Satz in zwei Zeilen); mit zwölf Bildern, acht Farben und einem Verweis wächst der Knoten auf etwa 663 nach unten (nach Spec erlaubt, „wächst nach unten“; übliche Inhalte nennen keine Verweise).
- Die Größe wird im Browser nicht vorab geprüft (das Bündel kennt `ANFRAGE_GRENZE` nicht); eine zu große Datei wird ganz als base64 gelesen und gesendet, der Server antwortet 422 mit dem Satz.
- Ein Text, der keine http(s)-Adresse ist, wird nicht als Verweis gespeichert, sondern mit KEIN_BILD_SATZ am Knoten genannt (422).
- Ein PDF mit passendem Kopf, aus dem der Enportilo nichts liest, wird gespeichert, ohne Farben und ohne Satz (der Enportilo meldet nichts).
- Für KBS-3.3: `folgi("dateien")` wird nach dem Rendern des neuen Inhalts gerufen; mehrere Dateien in Folge können mehrere `folgi`-Läufe auslösen, React fasst gleichzeitige zusammen. `folgi` sollte `inhaltDe("beispiele")` zum Zeitpunkt des Schreibens lesen, sonst überschreibt ein später Lauf eine inzwischen hinzugekommene Datei.
- Kein Kroniko-Eintrag für Upload/Entfernen (nicht verlangt).

## KBS-3.3 (T5): Erkannt, Übernehmen, Folgen, Export-Test

### KBS-3.3 im Einzelnen

- [x] **Tests rot zuerst:** `erkannt-056.test.ts` (15 Tests) und `beispiele-eksporto-056.test.ts` (2 Tests) liefen gegen den Platzhalter rot: `primaerUebernehmen`/`akzentUebernehmen`/`folgoDe` fehlen, `folgi` schrieb nichts (Log leer), Quellen ohne Konstanten und Knöpfe. Grün beim ersten Lauf waren nur die Prüfung „keine Farbliterale“ (der Platzhalter hatte keine), die Einteilung der Testfarben und die Positivkontrolle des Exporttests → gepflanzte Fehler F1–F5 unten.
- [x] **`gestalten/folgo.ts`** (ersetzt den Stub, Signatur von `folgi` unverändert). Alles, was eine Farbe aus den Beispielen schreibt, läuft hier durch, ein Lauf nach dem anderen (Warteschlange im Modul):
  - `folgi(okazo, valoro)`: wartet einen Frame, liest den neuesten gerenderten Kontext und rechnet `folgeFarboDe` (Beispiele-Inhalt, Primär des Bildo `wert ?? hex`, `estasStartwert` = `stato === "startwert"`, `verbunden(beispiele.el)`, bei `"verlangt"` mit `verlangt: true`). Ohne gespeichertes `primaer` gilt D-8: `{folgt: true}` beim Startwert, sonst `{folgt: false}`. Reihenfolge nach tech R-12: erst die Farbe (`skribi({farbe:{rolle:"primaer",wert}})`), dann der Inhalt mit dem neuen `primaer` (`inhaltMeti("beispiele", …, true)`). Scheitert die Farbe, wird kein Zustand geschrieben. Den Zustand schreibt `folgi` nur, wenn sich `primaer` geändert hat. Gelesen wird der Inhalt im Augenblick des Schreibens, damit ein inzwischen hinzugekommenes Bild bleibt. Akzent folgt nie. Bei allen drei Anlässen (`dateien`, `gesteckt`, `verlangt`) läuft derselbe Weg; „folgen lassen“ = `verlangt` (D-6: `{folgt: true, seit: Leitfarbe}`, dann einmal die Regel).
  - `primaerUebernehmen(hex, valoro)`: Farbe, dann `{folgt: false, zuletzt: hex}` (D-6).
  - `akzentUebernehmen(farbo, valoro)`: `{farbe:{rolle:"akzent", wert, herkunft:{quelle, anteil}}}` (D-23). `quelle` = `pdf`, wenn die Datei mit dem größten Anteil dieser Farbe ein PDF ist, sonst `bild`. **Ohne `datei`** (siehe Befunde). Der Schreibweg ergänzt `merkmal` „Farbe <wert>“.
  - `folgoDe(valoro)`: die Regel ohne Schreiben, für die Zeile unter „Erkannt“. `folgoValoroMeti(v)`: „Erkannt“ übergibt jeden gerenderten Kontext.
- [x] **`nodoj/erkannt.tsx`** (Option A): Kopf „Erkannt“, bis acht Zeilen aus `erkanntDe` (größte zuerst). Jede Zeile ist ein echter `<button>` mit Farbfeld (Bildfarbe als `--nr-g-erkannt-farbo` aus den Daten), Hex-Wert, „hell/dunkel · bunt/unbunt“ aus den gespeicherten Flags, der Marke „Primär“ am Feld gleich Primär und dem Anteil in ganzen Prozent. Ein Klick klappt „als Primär übernehmen“ / „als Akzent übernehmen“ auf (`fm-butono`, `nodrag nopan`, immer nur eine Zeile offen). Darunter die Zeile aus `FOLGO_SAETZE[folgoDe(…).linio]`; „folgen lassen“ (`<button>`) erscheint bei „folgt-nicht“, solange `beispiele.el` verbunden ist (wie im Mockup: gelöst steht nur „Primär folgt nicht.“). Ohne gemessene Farbe steht nichts da, auch kein Kopf. Eine gescheiterte Übernahme zeigt `nelegebla.satz` oder `NE_KONSERVITA_SATZ`. Alle Sätze kommen aus den gemeinsamen Konstanten, kein Farbliteral, Stile nur `var(--fm-*)`/`ROLOJ`.
- [x] **Maße:** Zeile 26 px, „Erkannt“ mit sieben Zeilen 232 px (acht ≈ 258 px), also kleiner als im Mockup (≈ 32 px je Zeile).
- [x] **Läufe:** `erkannt-056` 15/15, `beispiele-eksporto-056` 2/2; `vitest run 056 grafeo-literale-054 055 054`: 375 bestanden, 0 rot. `pnpm --filter @fundamento/nodredaktilo lint` grün. In `metiejo` sind `tsc` und biome für meine Dateien grün; `biome check .` meldet nur die ältere Warnung `komponentoj.ts:42` und die Formatierung von `teksto-knoten-056.test.ts` (KBS-3.1, nicht meine Datei). Nodredaktilo-Build grün.
- [x] **Gepflanzte Fehler** (jeweils rot gesehen, zurückgesetzt, `cmp` gleich mit der Sicherung in `/tmp/kbs33-backup`):
  - F1: Kommentar `// #2f5bff` in `erkannt.tsx` → „carry no colour literal“ rot.
  - F2: `datei: dateien[0]?.name` in der Akzent-`herkunft` von `folgo.ts` → Akzent-Test und Exporttest rot.
  - F3: Dateiname in `merkmal` (`"aus " + name`) → Exporttest rot über die Namenssuche (`funde` mit 2 Dateien: `agordo.json`, `aspekto.json`).
  - F4: Bytesuche im Test auf einen leeren Puffer → Positivkontrolle rot.
  - F5: `GRAU` als bunte Farbe → Einteilungstest rot.
- [x] **Chromium** (eigene Skripte `/tmp/kbs33-smoke/smoke.mjs` und `upload.mjs`, headless, 2100×1250, gebaute CLI, Temp-Arbeitsordner, freier Port):
  - Zustand per PUT: ohne Beispiele nichts unter „Erkannt“. Danach sieben Felder (größte zuerst, Wert, Art, ganze Prozent), die Farbe des Felds berechnet `rgb(47, 91, 255)`.
  - Ablauf 7.4: Beispiele lösen → Farbpunkte weg aus der Marke, Primär bleibt, „Primär folgt nicht.“ ohne Knopf.
  - Stecken → `folgi("gesteckt")` → Primär blau „aus Material“, Feld trägt „Primär“, „Primär folgt den Beispielen.“, die Palette ändert sich.
  - Ablauf 2.6: Klick klappt zwei Aktionen auf; „als Primär übernehmen“ → Orange „aus Material“, „Primär folgt nicht.“ + „folgen lassen“. Akzent übernommen → „aus Material“. Gleiche Farbe als Akzent und Primär geht, Grau als Primär geht. „folgen lassen“ → wieder blau. Alles ohne Neuladen; nach dem Neuladen derselbe Stand.
  - Mit dem Hochladen von KBS-3.2 (Ablauf 2, Schritte 2–6): drei Bilder → blau wird Primär. Blaues Bild entfernt → Navy. Anderes Feld übernommen → folgt nicht, ein neues Bild ändert Primär nicht mehr.
  - Keine Konsolenfehler. Bilder in `/tmp/kbs33-smoke/bilder/`.
- [x] **Wortsuche** (R-12-Wort, Repo-Name, aus `oldNames()` zur Laufzeit) über die vier Dateien, 1 299 Zeilen: 0.

### KBS-3.3: geänderte ältere Tests

Keine.

### KBS-3.3: für den PR-Text

- „Erkannt“ im Beispiele-Knoten: bis acht Farbfelder mit Anteil, hell/dunkel, bunt/unbunt. Ein Klick klappt „als Primär übernehmen“ / „als Akzent übernehmen“ auf; „Primär“ steht am Feld gleich Primär. Die Zeile „Primär folgt den Beispielen.“ / „Primär folgt nicht.“ + „folgen lassen“ / „Keine bunte Farbe erkannt. Primär bleibt.“ kommt aus `folgeFarboDe`.
- „Farbe folgt den Bildern“ (`gestalten/folgo.ts`): nach Hochladen, Entfernen, Stecken und „folgen lassen“; erst die Farbe, dann `zuletzt` im Leinwand-Zustand; alle Schreibvorgänge nacheinander.
- Akzent aus „Erkannt“ trägt `herkunft {quelle, anteil}` **ohne Dateinamen**, damit kein Name aus `materialo/` in Agordo, Paket oder Export gerät (AK-4). Test `beispiele-eksporto-056`: drei Bilder, Primär gefolgt, Akzent übernommen, Speichern + alle Exportziele über HTTP; kein Name, kein Byte-Fenster der Bilder in einem Ergebnis; mit Positivkontrolle.

### KBS-3.3: Befunde

- **Ohne `datei` im Akzent (Abweichung von der Form in D-23):** `zweitfarbe.herkunft` landet unverändert in `aspekto.json` des Pakets und in `agordo.json` (siehe Fixture `aspekto-dukolora`). Ein `datei` mit dem Namen aus `materialo/` bräche AK-4 („in keinem Export, keinem Paket, nie im Repo“). Gezeigt wird „aus Material“ trotzdem (`herkunft` ist gesetzt). Wer später den Dateinamen am Akzent zeigen will, braucht dafür einen anderen Ort als den Agordo.
- **Übernommener Akzent kann den Export sperren:** Ein sehr satter Akzent (im Test `#2f5bff` als Zweitfarbe) bringt die vorhandene Prüfung der gleich schweren Palettenstufen dazu, den Export abzulehnen (Stufen 700/800 weichen um mehr als 0,02 in L ab). Die Leinwand urteilt nicht. Der Exporttest nimmt deshalb das Orange. Das ist das bestehende Verhalten jeder Zweitfarbe, nicht neu.
- **„#2f5bff“ ist nach `farbArtDe` „hell“** (OKLCH L ≈ 0,55 > `dunkel_bis` 0,35). Das Beispiel in Ablauf 2.3 („#2f5bff · 34 % · dunkel · bunt“) nennt „dunkel“; die Einteilung stammt aus KBS-1.1 und kreilo.json und bleibt so, wie sie ist. Gehört in den Bericht.
- **Frische des Kontexts:** `folgi` wartet einen Frame und liest dann den neuesten gerenderten Kontext (`folgoValoroMeti` aus „Erkannt“). KBS-3.2 ruft `folgi("dateien")` ohnehin erst nach dem Rendern auf; beides verträgt sich.
- **D-8:** Die Vorgabe für `folgt` wird beim ersten Lauf von `folgi` gespeichert (meist beim ersten Bild), nicht beim Anlegen des Knotens. Ein Unterschied entsteht nur, wenn Primär zwischen Anlegen und erstem Bild von Hand geändert wird; dann folgt Primär nicht, wie gewollt.
- **„folgen lassen“ bei gelöster Verbindung** ist nicht angeboten (Mockup); nach dem Stecken rechnet die Hülle ohnehin.
- Die Aktionsknöpfe tragen `full-width`, erscheinen im Screenshot aber in Inhaltsbreite. Das ist eine Sache der Ero, in diesem Lauf nicht geändert.

## KBS-3.4 (T6): Schrift aus Fontsource

### KBS-3.4 im Einzelnen

- [x] **Tests zuerst** `packages/metiejo/src/schrift-servilo-056.test.ts` (18 Tests, offline, `npm` als Double mit eigenem Tarball): Filter je Art (Anzahl aus `tiparoj.json`), leere Art = alle, Suche + Filter (`searchTiparoj` auf dem gefilterten Katalog), Treffer mit Familie/Art/Lizenz, kein Treffer → derselbe Satz wie die alte Route, unbekannte Art 422 `{feld, satz}`, unbekannte Marke 404 `{satz}`; ohne `art` fünf Anfragen der alten Route byte-gleich (sha256 vor der Änderung genommen, Stub aktiv; Handler und `tiparoj.json` gleich `6d34a75a`); `…/schriften` Form und Regler aus `reglerOf` (Bereich, Schritt, Wert); Überschrift/Text/Code und die drei Regler über POST `/leinwand` → rev+1 und in `…/schriften` sichtbar; Regler außerhalb → 422 `{feld: pfad, satz}`, rev unverändert; eigene Familie → „lizenziert, nicht enthalten“, `eigene: true`; `/api/tiparo/:id/css` mit `NpmDeps`-Double → zwei `@font-face` auf `/api/tiparo/:id/<datei>`, Datei mit `font/woff2`, zweiter Abruf aus dem Zwischenspeicher; nur Latin-woff2 aus dem Zwischenspeicher, sonst 404 `{satz}`; Familie ohne Latein → 200 leeres CSS, kein Abruf; ohne `npm` und offline ohne Zwischenspeicher → 503 `{satz: SCHRIFT_OFFLINE_SATZ}`; offline bleibt die Wahl gespeichert.
- [x] **Erster Lauf:** 17 rot (Stub: 404, `anzahl` fehlt, 200 statt 422 …), 1 grün (kein Treffer, weil ohne `art` die alte Route antwortet). Danach 18/18.
- [x] **Gepflanzte Fehler** (je rot gesehen, zurückgesetzt, `cmp` gegen Kopie): P1 Satz ohne Treffer um ein Wort geändert → „no hit“ rot; P2 Modul beantwortet auch Anfragen ohne `art` → Byte-Gleichheit rot (vier Prüfsummen weichen ab); P3 Lizenz im Treffer leer → „each hit names …“ rot (der erste Lauf dieses Tests war aus einem Testfehler rot: Leerzeichen im Pfad).
- [x] **Route** `packages/metiejo/src/tiparo-vojoj.ts` (Stub ersetzt):
  - `GET /api/marko/:name/tiparoj?q=&art=` nur mit `art`: `art` = Kategorie (`sans-serif`, `serif`, `monospace`, `display`, `handwriting`) oder ihr Etikett (Grotesk …), `""` = alle. Antwort `{treffer: [{id, family, license, category}], anzahl, satz?}`; mit Suchwort die Reihenfolge von `searchTiparoj` (höchstens 12), ohne Suchwort die ersten 12 der Art nach Namen; `satz` = der Satz des Studios. Unbekannte Art 422 `{feld: "art", satz}`, unbekannte Marke 404 `{satz}`. Ohne `art` → `false`, die alte Route antwortet.
  - `GET /api/marko/:name/schriften` → `{rev, schriften: {display?, body?, code?: {familie, lizenz, tiparo?, eigene?}}, regler: [{pfad, etikedo, min, max, step, wert}]}`; `tiparo` = Fontsource-Id (über `source` und Familie), eigene Schrift (`redistributable: false`) → `lizenz: "lizenziert, nicht enthalten"`, `eigene: true`; `regler` = `ctx.regler` der Gruppe `schrift`, `wert` = `reglerValue`.
  - `GET /api/tiparo/:id/css` → `fontFilesCss(family, files, "/api/tiparo/<id>")` aus `fetchFontFiles(id, options.npm)`; `GET /api/tiparo/:id/<id>-latin-<w>-normal.woff2` → Datei aus dem Zwischenspeicher. Ohne `npm` oder wenn `fetchFontFiles` wirft → 503 `{satz: SCHRIFT_OFFLINE_SATZ}`. Unbekannte Id oder Datei → 404 `{satz}`. Familie ohne `Latn` → 200 leeres CSS ohne Abruf.
- [x] **Knoten** `packages/nodredaktilo/src/gestalten/nodoj/schrift.tsx` (Platzhalter ersetzt, Platz `<SchriftEigene />` unverändert), Abrufe in neuem `gestalten/tiparo-datumoj.ts`: Probe „Aa“ + zwei Zeilen (Überschrift-/Text-Schrift), je Rolle Überschrift/Text/Code ein Knopf mit Familie und daneben die Lizenz, beides in Mono; Klick klappt den Katalog im Knoten auf (Suchfeld `fm-kampo`, Art-Knöpfe Alle/Grotesk/Serif/Mono/Display/Handschrift, Trefferliste mit Familie, Art, Lizenz); ein Klick setzt über `skribi({schrift:{rolle, tiparo}})`, der Katalog klappt zu. Regler Größe/Skala/Gewicht (`fm-glitilo`), geschrieben beim Loslassen (`change`) über `skribi({regler})`; die Probe folgt schon beim Ziehen. Der Knoten liest `…/schriften` bei jeder Änderung des Bildo-rev neu (auch eine eigene Schrift von KBS-3.5 erscheint so). `@font-face` je gewählter Katalogschrift einmal über `/api/tiparo/:id/css`; 503 → Ersatzschrift und SCHRIFT_OFFLINE_SATZ (beim nächsten Öffnen neu gefragt). Leer (keine Schrift, keine eigene) → gestrichelt, „Aa“ in der Ersatzschrift (`--fm-font-family-display`).
- [x] **Läufe:** `schrift-servilo-056` 18/18; `vitest run 054 055 056 047 048 tiparoj` 45 Dateien, 510 Tests grün (inkl. `grafeo-literale-054`, `leinwand-sxelo-056`). `pnpm --filter @fundamento/nodredaktilo lint` grün, Build grün; `pnpm --filter @fundamento/metiejo lint` grün (1 ältere Warnung `komponentoj.ts:42`).
- [x] **Chromium** (`node /tmp/kbs34-smoke/smoke.mjs <repo> <aus>`, headless, 2100×1250, gebaute CLI, Temp-Arbeitsordner, freier Port, Zwischenspeicher in einem Temp-`XDG_CACHE_HOME`): Ablauf 4 Schritte 1–5 bestanden (Kante Schrift → Vorschau; leer gestrichelt; „frau“ + Serif → nur Serif, Fraunces mit Art und Lizenz; „Inter“; Aa und Zeile 1 in Fraunces, Zeile 2 in Inter, Fraunces 700 und Inter 400 geladen; Namen/Lizenzen in Mono; Vorschau mit Fraunces und Inter ohne Neuladen; Skala → Überschrift im Knoten 16,3 → 18,75 px und in der Vorschau 24 → 29 px). Dazu: kein Treffer → Satz des Studios; Code gesetzt; Chenla (ohne Latein) wählbar, keine Regel, Ersatzschrift, kein Offline-Satz; offline (Schrift-Route im Browser auf 503 gestellt) → Satz und Ersatzschrift, Wahl gespeichert; keine Konsolenfehler außer den vom Skript abgebrochenen CDN-Anfragen der Vorschau. **Netz:** Fontsource-Dateien kamen nur über die eigene Route `/api/tiparo/…` (Server liest npm über `defaultNpmDeps`); die 54 CDN-Anfragen der Vorschau hat das Skript abgebrochen, andere fremde Anfragen: 0.
- [x] **Höhen** (§2.3, Höchsthöhe 360 bei zugeklapptem Katalog, mit dem eingeklappten Bereich von KBS-3.5): leer 338; zwei Schriften 321; Skala am Ende 324; alle drei Regler am Ende 346; Katalog offen 460 (darf wachsen). Kein Höchstmaß geändert.
- [x] **Wortsuche** (R-12-Wort, Repo-Name, Erweiterungsschlüssel, zur Laufzeit aus `oldNames()`): vier Dateien, 1 453 Zeilen: 0.

### KBS-3.4: geänderte ältere Tests

Keine.

### KBS-3.4: für den PR-Text

- Schrift-Knoten: Fontsource-Katalog im Knoten (Suche, Filter nach Art), Überschrift/Text/Code, echte Schrift über die neue Route `/api/tiparo/:id/css` und `/:datei` (Dateien aus dem vorhandenen npm-Zwischenspeicher `fetchFontFiles`), Regler Größe/Skala/Gewicht über den Schreibweg der Leinwand.
- `GET …/tiparoj` erhält den optionalen Parameter `art`; ohne ihn antwortet die alte Route byte-gleich (Test mit Prüfsummen).
- Neu `GET /api/marko/:name/schriften` (D-21).
- Die Vorschau lädt Fontsource-Schriften weiter vom CDN (`fontFaceCss`); zwei Wege für Schriftdateien bleiben (Befund).

### KBS-3.4: Befunde

- **`fm-glitilo` hält einen Bereich von mindestens 1** (`eroj/dist/generated/fm-glitilo.js:711`: `max = Math.max(min + 1, max)`). Skala (1,125 bis 1,25) ließe sich so nicht einstellen (das Ero meldete `aria-valuemax="2.125"`). Der Knoten führt das Ero darum über die Schritte des Reglers (0 … n, Schritt 1) und rechnet den Wert selbst um. Gilt auch für jeden späteren Regler mit kleinem Bereich.
- **Satz ohne Treffer doppelt:** Der Satz des Studios steht in `servilo.ts` inline. `tiparo-vojoj.ts` schreibt ihn gleichlautend als `keinTrefferSatzDe`; der Test hält beide gleich. Besser wäre eine geteilte Konstante (servilo.ts ist eingefroren).
- **Zwei Wege für Schriftdateien:** Knoten über `/api/tiparo/…` (npm, Zwischenspeicher), Vorschau über das CDN (unverändert, Nicht-Ziel). Der npm-Weg liefert nur Latin 400/700 (`wantedFiles`); andere Schnitte zeigt der Knoten synthetisch.
- **Probe nebeneinander statt untereinander:** „Aa“ steht links neben den zwei Zeilen (Mockup: untereinander). Untereinander wuchs der Knoten mit dem Bereich von KBS-3.5 und den Reglern am Ende auf 412 (> 360).
- **Texte nicht aus geteilten Konstanten:** die zwei Probezeilen des Mockups („Eine Marke, die bleibt.“, „Fließtext in der Grundgröße, …“), „Schrift wählen“, „Schrift suchen“, „Alle“, die Kurznamen „Größe“/„Gewicht“ (das Studio sagt „Schriftgröße“/„Schriftgewicht“, sie stehen als `title`/`aria-label`) und die drei Sätze für 404/422 der neuen Routen stehen lokal; keiner davon ist ein Satz der Produktspec.
- **Größe in der Probe angenähert:** Der Knoten bildet `schrift.groesse` mit der aktuellen Skala statt mit dem Standardwert der Basis ab (die Antwort von `…/schriften` nennt den Standard nicht). Die Vorschau rechnet genau.
- Der erste Abruf einer Schrift lädt das npm-Paket; bis dahin zeigt der Knoten die Ersatzschrift (tech R-6), ohne Zeitlimit.

## KBS-3.5 (T7): Eigene Schrift samt ZIP

### KBS-3.5 im Einzelnen

- **Neu:** `packages/metiejo/src/tiparo-legi.ts` und `zip-legi.ts` (rein, nur `node:zlib`); Tests `tiparo-legi-056`, `zip-legi-056`, `schriftdosieroj-056`; `nodredaktilo/src/gestalten/schriftdosieroj-datumoj.ts`; Fixture `packages/metiejo/test/fixtures/valid/tiparo-056/` (D-26).
- **Ersetzt:** `schriftdosieroj-vojoj.ts` (Stub), `nodoj/schrift-eigene.tsx` (Platzhalter). Signatur von `eigeneFontFace` und der Export `FONTOJ_DIR` bleiben.
- **Wege:**
  - `POST /api/marko/:name/schriftdateien {filename, base64}` → 200 `{familien: [{familie, dateien, fehlt}], uebergangen}`. Erst lesen, dann ablegen: alles wird gelesen, bevor etwas gespeichert wird. Danach gehen nur die Schriftdateien über `storeUpload` nach `fontoj/`, nie die ZIP-Datei. 422 `{satz: NELEGEBLA_DOSIERO_SATZ}` bei: kein Font, Endung passt nicht zu den Bytes, kaputte ZIP, eine kaputte Schrift in einer ZIP (dann gilt die ganze ZIP als unlesbar), andere Art, kaputtes JSON. 422 `{satz: ZIP_OHNE_SCHRIFT_SATZ}` bei einer ZIP ohne Schrift. Zu großer Rumpf → 422 mit `TRO_GRANDA_SATZ`. Unbekannte Marke → 404 `{satz}`.
  - `GET /marko/:name/fontoj/:datei`: nur eine Schriftdatei aus `fontoj/` dieser Marke, `font/woff2|woff|ttf|otf`, `nosniff`, `no-store`; sonst die schlichte 404-Seite.
  - `POST /api/marko/:name/schrift-privat {familie, bestaetigt?}`. Ohne `FM_TIPAROJ_REPO`: `{satz: privataState.sentence}`. Mit Variable und ohne `bestaetigt`: `{satz: <Satz „nach deiner Bestätigung“ aus privataState>, frage: true}`, kein Push. Mit `bestaetigt: true`: `uploadFont` für jede Datei der Familie; der erste „Kein Push: …“-Satz beendet den Vorgang, sonst werden die Sätze verbunden. Gibt es die Familie hier nicht, kommt der vorhandene Studio-Satz „Kein Push: Es liegt keine Datei zum Hochladen bereit.“
  - `eigeneFontFace`: Ohne eine Schrift mit `redistributable: false` im Agordo gibt es `""`, noch bevor der Kontext berührt wird (`leinwand-sxelo-056.test.ts:452` unverändert grün). Sonst gibt es je Datei einer gesetzten Familie in `fontoj/` eine `@font-face`-Regel auf `/marko/:name/fontoj/<datei>`; das Gelesene bleibt je Datei (Größe, mtime) im Speicher.
- **Leser:** `name` (16 → 1, 17 → 2; Windows Englisch vor Windows/Unicode vor Mac Roman), `OS/2` (`usWeightClass`, `fsSelection` Bit 0), `fvar` (Achse `wght` → `variabel`, `gewicht`…`gewichtBis`). TTF/OTF direkt (beide Endungen nehmen beide Sfnt-Formen), WOFF mit `inflateSync`, WOFF2 mit `brotliDecompressSync` samt eigenem Verzeichnisleser (bekannte Tags, UIntBase128, transformierte Längen). **WOFF2 wird aus den Tabellen gelesen**, ein Rückfall auf den Dateinamen war für die Fixture nicht nötig. Rückfall (`quelle: "dateiname"`) nur, wenn die Bytes zwar ein Font sind, die Tabellen sich aber nicht lesen lassen. „Was fehlt“ wird an Regular, Bold und Italic gemessen; die Sätze kommen aus `schnitteSatzDe`, `variabelSatzDe` und `AUS_DATEINAME`.
- **ZIP:** Was geht: Verfahren 0 und 8 mit Prüfung von CRC und Größe; `__MACOSX/`, versteckte Dateien und Ordner sowie Ordner werden still übergangen, andere Dateien gezählt (`uebergangenSatzDe`). Was abgelehnt wird: kaputte Datei, kein Endsatz, falsche CRC, Größe stimmt nicht, verschlüsselt (Bit 0 oder 6), ZIP64 (Locator oder 32-Bit-Feld = 0xFFFFFFFF), mehrere Disks, ein anderes Verfahren (auch bei Nicht-Schrift-Einträgen), ein Eintrag über `dateiGrenzeDe(ANFRAGE_GRENZE)` (laut Kopf oder per `maxOutputLength`, D-12).
- **Knoten:** Ein echter `<button>` „Eigene Schrift hochladen“ (`aria-expanded`) klappt im Knoten auf: die vier Sätze wörtlich aus `EIGENE_SCHRIFT_SAETZE`, „Dateien wählen“ (mehrere, `.woff2,.woff,.ttf,.otf,.zip`, eine Anfrage je Datei nacheinander), ruhige Meldungen. Je Familie: der Name in der eigenen Schrift, die Marke „lizenziert, privat“ (`fm-insigno`), der Satz zu den Schnitten, „Datei fehlt: …“ für fehlende Dateien, „als Überschrift setzen“ und „als Text setzen“ (`skribi({schrift:{rolle, eigene}})`), „Ins private Repo legen“, danach „Bestätigen“ oder „Abbrechen“, wenn der Server fragt. Die Dateien werden als `FontFace` des Dokuments registriert, so dass das „Aa“ von KBS-3.4 ohne Neuladen in der eigenen Schrift steht.
- **Testschrift (D-26):** `@fontsource/lato@5.3.0` (OFL-1.1), einmal geholt mit `npm pack` nach `/tmp`; Hashes in `HERKUNFT.md`. `git check-ignore -v` auf Ordner und Dateien: kein Treffer (exit 1). `check:privat --fixture` auf einem Temp-Git mit Fixture und allen neuen Dateien: PASS, 15 Dateien, 0 Treffer. Die Tests laufen offline.
- **Tests:** `tiparo-legi-056` 13, `zip-legi-056` 6, `schriftdosieroj-056` 15, alle grün. Zusammen mit `leinwand-sxelo-056 privata grafeo-literale-054 grafeo-urteil-054 grafeo-urteil-055`: 73 bestanden, 0 rot. Lint beider Pakete grün (metiejo nur mit der alten Warnung `komponentoj.ts:42`). Erster Lauf: 16 und 14 rot aus dem richtigen Grund (Stub bzw. Route fehlt).
- **Eingesetzte Fehler** (für Tests, die beim ersten Lauf grün waren; jeder rot gesehen, zurückgenommen, `cmp` bestätigt):
  - P1: Endungsprüfung in `tiparoLegi` entfernt → „no font“ rot.
  - P2: CRC- und Größenprüfung in `zipLegi` entfernt → „broken“ rot.
  - P3: Prüfung auf Verschlüsselung entfernt → rot.
  - P4: ZIP64-Prüfung entfernt → **blieb grün**. Der Testfall wurde schon an anderer Stelle abgefangen. Der Test baut jetzt einen echten ZIP64-Locator und einen Eintrag mit 0xFFFFFFFF; danach P4a (Locator-Prüfung entfernt) und P4b (64-Bit-Größe angenommen) jeweils rot.
  - P5: anderes Verfahren angenommen → rot.
  - P6: `eigeneFontFace` berührt zuerst den Kontext → rot.
- **Chromium (Ablauf 5):** `node /tmp/kbs35-smoke/smoke.mjs <repo> <out>` (2100×1250, gebaute CLI, Temp-Arbeitsordner, freier Port) ergibt SMOKE OK. Geprüft: die vier Sätze, eine unlesbare Datei ruhig benannt und nicht gespeichert, ZIP → „Gefunden: Regular 400, Bold 700. Es fehlt: Italic.“ plus „1 andere Datei übergangen.“, nur die zwei woff2 in `fontoj/`. „als Überschrift setzen“ → „Aa“ in Lato (400 und 700 geladen), Knoten nennt „lizenziert, nicht enthalten“. **Beide Vorschauen** haben `@font-face` auf `fontoj/`, laden Lato und zeigen die Überschriften in Lato. „Ins private Repo legen“ ohne Variable zeigt den vorhandenen Satz, ohne Bestätigung. Nach Neuladen ist die Familie da. Keine Konsolenfehler, keine Anfrage nach außen. Höhe des Knotens mit aufgeklapptem Upload und einer Familie: 694 px; der Knoten wächst nach unten wie bei offenem Katalog.

### KBS-3.5: geänderte ältere Tests

Keine. `leinwand-sxelo-056.test.ts:452` bleibt wahr, ohne Änderung.

### KBS-3.5: für den PR-Text

- Eigene Schrift: Dateien oder ZIP werden erst gelesen und dann abgelegt (`tiparo-legi.ts`, `zip-legi.ts`, nur `node:zlib`, keine Abhängigkeit). In `marken/<name>/fontoj/` landen nur die Schriftdateien. Der Knoten zeigt je Familie die erkannten Schnitte und was fehlt. Setzen geht über den Schreibweg der Leinwand („lizenziert, nicht enthalten“). Knoten und Vorschau zeigen die eigene Schrift (`eigeneFontFace` in `fontFaceOf`, `vorschau.ts` unverändert). „Ins private Repo legen“ nutzt nur `privataState`/`uploadFont` und pusht erst nach „Bestätigen“.
- Neue Testschrift: `packages/metiejo/test/fixtures/valid/tiparo-056/` (Lato, OFL-1.1, Herkunft und Hashes in `HERKUNFT.md`, rund 140 KB).
- Abweichung: `schrift-privat` nimmt zusätzlich `bestaetigt?: true` und antwortet vorher `{satz, frage: true}`. So läuft die Bestätigung der Spezifikation über den Server, und ohne Variable zeigt der Knoten den Satz sofort.

### KBS-3.5: Befunde

- **ZIP:** Es gibt keine Grenze für die Summe der Einträge, nur je Eintrag `dateiGrenzeDe(ANFRAGE_GRENZE)` (D-12). Eine ZIP mit vielen großen Einträgen kann ein Vielfaches von 24 MiB entpacken. Das entscheidet der Maintainer.
- Dieselbe Je-Datei-Grenze begrenzt auch das Entpacken der Tabellen von WOFF und WOFF2 (keine neue Zahl). Ein darüber entpackender Font wird über den Dateinamen gelesen.
- Ein anderes Verfahren oder Verschlüsselung macht die ganze ZIP unlesbar, auch wenn es nur einen Nicht-Schrift-Eintrag betrifft (Wortlaut der Spezifikation).
- Rückfall über den Dateinamen: Steht „Variable“ im Namen, wird als Bereich 100 bis 900 angenommen (CSS-Bereich), weil der Name keinen Bereich nennt. Der Vermerk „aus dem Dateinamen“ steht dabei.
- Die Sätze zu den Schnitten gibt es zweimal, in `tiparo-legi.ts` und `schriftdosieroj-datumoj.ts`, weil das Browser-Bündel `node:zlib` nicht einbinden kann. `schriftdosieroj-056` prüft über eine Temp-Kopie, dass beide gleich rechnen.
- Neue UI-Wörter ohne gemeinsame Konstante: „Dateien wählen“ und „lizenziert, privat“ (beide aus dem Mockup), „Bestätigen“ und „Abbrechen“ (wie im Studio). Sie stehen lokal in `schrift-eigene.tsx`.
- Upload und Push schreiben keinen Kroniko-Eintrag; das war nicht verlangt.
- Der Studio-Satz „Kein Push: Es liegt keine Datei zum Hochladen bereit.“ steht inline in `servilo.ts` und ist deshalb in `schriftdosieroj-vojoj.ts` wörtlich kopiert. Ein Export wäre eine Zeile in einer eingefrorenen Datei; sie wurde nicht angewendet.

## KBS-4.1 (T8): Tests gesamt, Bilder, Bericht

### KBS-4.1 im Einzelnen

**Neue Dateien:** `packages/metiejo/src/abnahme-056.test.ts` (9 Tests), `packages/metiejo/src/grafeo-urteil-056.test.ts` (5 Tests), `packages/nodredaktilo/scripts/bilder-056.ts`, `specs/056-kern-beispiele-schrift/bericht.md`. Geändert: `packages/nodredaktilo/scripts/bilder-055.ts:404`, diese Datei, und eine kleine Korrektur im Produktcode dieses Laufs:

- **`packages/nodredaktilo/src/gestalten/nodoj/schrift-eigene.tsx:85–86`** (KBS-3.5): `var(--fm-typography-body-font-size)` → `var(--fm-typography-body-2-font-size)`, `var(--fm-typography-label-font-weight)` → `var(--fm-font-weight-medium)`. Die beiden alten Namen gibt es in der Belegung nicht; der Familienname einer eigenen Schrift erbte darum Größe und Gewicht still. Rot zuerst: der neue Schritt in `bilder-056.ts` („jede gelesene --fm-Rolle hat einen Wert“, alle `var(--fm-…)` unter `packages/nodredaktilo/src` gegen die berechneten Werte an `#nr-leinwand`) brach mit genau diesen zwei Namen ab; nach der Korrektur 70 Namen, 0 unbekannt. Die neuen Namen nutzen schon `roloj.ts:125` und `kapo.tsx:58`. Danach `vitest run 056 054 055 047 048`: 45 Dateien, 508 Tests grün; nodredaktilo lint grün.

**`abnahme-056`** (über HTTP, ein Server, Marke `lumeto`, der Client `folgo.ts` per Adresse geladen wie in `erkannt-056`; Netz, Browser und npm sind Doubles): Ablauf 1/AK 15 (Kern und drei Werte über `wertAldoni`, `marko.enhavo` nach jeder Änderung), AK 5 (sechster Wert abgelehnt, `FUENF_WERTE_SATZ` im Knoten, Server speichert fünf), Ablauf 2/AK 1, 17 (drei Bilder über den echten Weg, Primär folgt, wechselt nach Entfernen, „als Primär übernehmen“, neues Bild ändert nichts, „folgen lassen“, Farbe von Hand), Ablauf 3/AK 9, Ablauf 4/AK 1 (zwei Fontsource-Schriften über Suche und Art, `/api/tiparo/…`, Vorschau-Rahmen nennt beide Familien), Ablauf 5/AK 3 (Fixture-ZIP), Ablauf 6/AK 2 (Neuladen, Stand → ändern → öffnen), Ablauf 7/AK 16, 17 (gelöst über Neuladen und Stand, gelöst folgt nicht, „zurücksetzen“ steckt alles), AK 4 (Akzent übernommen, Speichern und alle Exportziele: kein Bildname, kein Byte-Fenster; Gegenprobe findet beides). Vor dem Export setzt der Test Primär von Hand auf `#1f5fbf`: mit der gefolgten Orange-Farbe verweigert die vorhandene Paletten-Prüfung den Export (Befund unten).

**`grafeo-urteil-056`**: eine Sitzung durch alle neuen Wege (52 Antworten, alle 2xx, `pruefTor` und `checkDraft` je 0); 404 `{satz: "Diese Marke gibt es nicht."}` auf 13 Anfragen an neue Wege; 422 `{feld?, satz}` auf 17 Schreibwege und unlesbare Dateien, danach rev, Zustand, `materialo/` und `fontoj/` unverändert; falsch gebaute neue Änderungen in derselben 400-Form wie eine ältere; Wortsuche (62 Regeln mit Name, Id, Aussage, Kialo + Berichtsmarken) über alle Antworten, alle Satz-Konstanten der neuen Knoten (+ 5 Satzfunktionen) und die acht Quellen `nodoj/teksto*.tsx`, `beispiele.tsx`, `erkannt.tsx`, `schrift*.tsx` ohne Kommentare; Gegenprobe: ein Regelname als Wettbewerber geschrieben wird gefunden.

Erster Lauf: beide Dateien nach Korrektur eigener Testfehler grün (veraltete Antwort, lokaler Zustand nach „Öffnen“ nicht übernommen, Export ohne Akzent). Darum je Prüfgruppe ein gepflanzter Fehler, rot gesehen, zurückgesetzt, `cmp` gleich (Skript `/tmp/kbs41/plant.py`):

| Nr. | Datei | Fehler | rot |
|---|---|---|---|
| A1 | `leinwand-enhavo.ts` | `markoEnhavoDe` gibt nie `werte` | Ablauf 1, Ablauf 7 |
| A2 | `grafeo-gestalten-sicht.ts` | `WERTE_GRENZE = 6` | AK 5 |
| A3 | `leinwand-enhavo.ts` | `folgeFarboDe` ohne `!primaer.folgt` | Ablauf 2 |
| A4 | `beispiele-vojoj.ts` | Pinterest-Satz und anderer Satz vertauscht | Ablauf 3 |
| A5 | `tiparo-vojoj.ts` | `art` ignoriert (alle Arten) | Ablauf 4 |
| A6 | `tiparo-legi.ts` | „Italic“ fehlt nie | Ablauf 5 |
| A7 | `leinwand-stato.ts` | Inhalt des Schrift-Knotens beim Lesen verworfen | Ablauf 6, 7 |
| A8 | `leinwand-stato.ts` | `geloest` nie geschrieben | Ablauf 7 |
| A9 | `nodredaktilo/src/gestalten/folgo.ts` | Akzent-`herkunft` mit `merkmal` = Dateiname | AK 4 |
| U1 | `tiparo-vojoj.ts` | `…/schriften` ruft `pruefTor` | Sitzung, 422-Test |
| U1b | `tiparo-vojoj.ts` | `…/schriften` antwortet 500 | Sitzung |
| U2 | `schriftdosieroj-vojoj.ts` | 404-Satz mit „!“ | 404-Test |
| U3 | `tiparo-vojoj.ts` | unbekannte Art 400 statt 422 | 422-Test |
| U3b | `beispiele-vojoj.ts` | Datei vor dem Lesen nach `materialo/` geschrieben | 422-Test |
| U4 | `tiparo-vojoj.ts` | `probleme: 0` in `…/schriften` | Wortsuche |
| U4b | `grafeo-gestalten-sicht.ts` | `DATEI_FEHLT` mit „(Problem)“ | Wortsuche |
| U4c | `nodredaktilo/src/gestalten/nodoj/schrift.tsx` | „Schrift wählen (Prüfung)“ | Wortsuche |

Zwei erste Versuche blieben grün und sind keine Fehler des Produkts: A2 als entfernte Kürzung in `werteDe` (die Werte-Ids `w1`–`w5` begrenzen zusätzlich) und als `>= WERTE_GRENZE + 1` in `wertAldoni` (die Id-Vergabe lehnt zusätzlich ab); A5 zuerst unentdeckt, Test um „ohne Suchwort: Anzahl je Art aus dem Katalog“ ergänzt. A9 zuerst als Kopie in `eksporto/` – der Export räumt den Ordner, darum der Pfad über `folgo.ts`.

**Browser und Bilder** (`bilder-056.ts`, 107 Prüfungen, Exit 0; Ausgabe in `bericht.md`, Abschnitt 2): AK 7 beim Start (14 Knoten, 19 Kanten), mit allen sechs Knoten und mit vollen Inhalten (20 Knoten, 29 Kanten) – Boxen ohne Schnitt, keine Kante durch eine fremde Box, jedes `d` mit `C`, Anschlüsse rund, 7 Farbkanten in ihrer Farbe, sonst die graue Rolle. Abläufe 1–7 einschließlich AK 1, 15, 16, 17 im Browser, eine unlesbare GIF-Datei ruhig am Knoten, Stand speichern/öffnen, Neuladen. Netz: `/api/tiparo/fraunces/…`, `/api/tiparo/inter/…` 200; 46 CDN-Anfragen der Vorschau abgebrochen; sonst 0 Anfragen nach außen. `bilder-055.ts` läuft mit der Änderung an `:404` durch (41 Prüfungen, Exit 0).

**Höhen** (gemessen/Maximum): Werte fünf 269/270, Zielgruppe 259/264, Wettbewerb 209/220, Tonalität 255/300, Beispiele zwölf Bilder + acht Felder 601/640 (mit einem Verweis 663), Schrift alle Regler am Ende 346/360, Marke 412/480.

**eroj** (Chromium, je Datei einzeln, `PLAYWRIGHT_ENGINES=chromium FM_AUSGABE=knapp pnpm exec playwright test test/<datei>`): `metiejo.spec.ts` 6/0, `metiejo-036.spec.ts` 2/0, `metiejo-036-uebernahme.spec.ts` 2/0, `form-036.spec.ts` 1/0, `zweitfarbe-036.spec.ts` 5/0, `buehne-036.spec.ts` 20/0, `buehne-navigation-042.spec.ts` 2/0; kein Wackeln, keine Wiederholung.

**Gesamtläufe**
- `FM_AUSGABE=knapp pnpm test:betroffen` (cli, ekranoj, metiejo, modelo, nodredaktilo, nordstelo): rot nur nordstelo `ac8.test.ts:156`, `neubewertung-053.test.ts:206`, `ablauf/integra.test.ts:131`, jeweils „Hook timed out in 10000ms“ (Lastfenster).
- Nacheinander `pnpm exec turbo run test --continue --concurrency=1 …` mit denselben sechs Paketen: 14/15 Aufgaben grün; metiejo 1127/0 (mit `esploro/start-ohne-playwright` nach gebautem `cli`/`mcp`), cli 120/0, ekranoj 301/0, nordstelo 379/0; rot nur modelo `ci/turbo-inputs.test.ts:679` (Hook-Zeitgrenze). Einzeln wiederholt: `pnpm --filter @fundamento/modelo test turbo-inputs` 8/0. Nichts angehoben.
- `pnpm lint`: 22/22. `pnpm check:privat`: PASS (4608 Dateien, 0 Treffer). `grep -rn "\.only(\|\.skip(" packages/*/src`: nur das alte `context.skip` in `packages/mcp/src/http.test.ts:97` (schon in `6d34a75a`).
- 047/048: keine Datei mit `047`/`048` im Diff; im metiejo-Lauf grün (AK 11).

**Diff-Suche gegen `6d34a75a`** (Arbeitsbaum samt der drei neuen, noch nicht eingecheckten Dateien):

```
git diff --name-only 6d34a75a -- packages/modelo packages/agordilo packages/mcp packages/eroj/src packages/vortaro .github pnpm-lock.yaml | wc -l   → 0
git diff --name-only 6d34a75a | grep -v /                                      → (leer, keine Root-Datei)
git diff 6d34a75a -- '**/package.json' package.json | wc -l                      → 0
git diff --stat 6d34a75a -- packages/metiejo/src/enportilo packages/metiejo/src/tiparoj.ts packages/metiejo/src/tiparoj-npm.ts packages/metiejo/src/privata.ts packages/metiejo/src/marko.ts packages/metiejo/src/kontrolo.ts
                                                                                → enportilo/retejo.ts | 1 + (nur :21)
git diff --stat 6d34a75a -- packages/metiejo/src/grafeo-sicht.ts packages/metiejo/src/grafeo.ts packages/metiejo/src/html.ts → (leer)
--fm-Namen in neuen Zeilen, die es in 6d34a75a unter packages/ nicht gibt (comm -23) → --fm-font-family-display (nach der Korrektur oben; davor auch die zwei unbekannten Namen)
```

`--fm-font-family-display` ist kein neuer Token: `schrift.tsx:255` liest die vorhandene Rolle der Belegung (Wert im Browser `Geist, system-ui, sans-serif`), die vorher kein Quelltext unter `packages/` las; kein `--fm-…:`-Eintrag ist neu, nichts unter `packages/modelo/**` oder `packages/vortaro/**` geändert.

Zeit, Grenze, Toleranz in neuen Zeilen (`grep -inE 'timeout|retries|tempolimo|threshold|toleran|setTimeout|_000\b|GRENZE *=|limit'` über die Produktzeilen): `RETEJO_TEMPOLIMO = 15_000` (benannt, Wert unverändert, `retejo.ts:21`), `ANFRAGE_GRENZE = 32 * 1024 * 1024` (benannt, Wert aus `readBody` unverändert), `WERTE_GRENZE = 5` (Produkt-Spec „höchstens fünf“), `ERKANNT_GRENZE = 8` (`leinwand-enhavo.ts:348`, die Zahl, die `farbojOfPixels` liefert), `TREFFER_GRENZE = 12` (`tiparo-vojoj.ts:40`, die Länge der Trefferliste des Studios); kein `retries`, keine neue Schwelle. Die Zeitangaben in `bilder-056.ts` (`waitForFunction` 120 s für das erste Laden der Schriften aus npm, 30 s für die eigene Schrift) gelten nur dem lokalen Skript, nicht CI. Wort aus R-12 und Name des privaten Schriften-Repos (`node /tmp/kbs41/wort.mjs <repo>`, Wörter zur Laufzeit zusammengesetzt bzw. aus `scripts/neutrale-namen/rules.mjs`): 0 / 0 in 17 473 neuen Zeilen (einschließlich `bericht.md` und dieser Datei).

**Bündel** `packages/nodredaktilo/dist/leinwand.js`: 746 121 → **843 439** Byte roh, 195 930 → **218 254** Byte `gzip -6` (+97 318 / +22 324); keine Schwelle.

### KBS-4.1: geänderte ältere Tests

| Datei:Zeile | vorher → nachher | Grund |
|---|---|---|
| `packages/nodredaktilo/scripts/bilder-055.ts:404` | `geo.knoten === 11`, „11 Knoten gerendert“ → `geo.knoten === 14`, „14 Knoten gerendert“ | drei feste Text-Knoten bei jeder Marke; das Skript brach dort ab, läuft jetzt mit 41 Prüfungen durch |

### KBS-4.1: für den PR-Text

Der PR-Text-Entwurf steht oben im Abschnitt „Für den PR-Text“.

### KBS-4.1: Befunde

- **400 statt 422 für falsch gebaute neue Änderungen:** `POST …/leinwand` mit unbekannter Schrift-Rolle, unbekanntem Regler-Pfad oder `herkunft` an Primär antwortet wie jede falsch gebaute Änderung seit Spec 054 mit 400 `{issues:[{rule:"sxangxo-invalid", path, message, …}]}` (`servilo.ts`, `problemo(…, 400)`), nicht 422 `{satz}`. Der Knoten schickt so etwas nie; der Test hält die Form gleich der älteren.
- **Export mit gefolgter Farbe:** Folgt Primär einem kräftigen Orange (`#d2552c`), verweigert die vorhandene Paletten-Prüfung des Exports („palette-aligned“, Stufen 500/600). Das gilt für jede solche Leitfarbe, nicht nur aus Beispielen; ein Hinweis an der Leinwand fehlt (kein Urteil gewollt).
- **Beispiele mit Verweis:** zwölf Bilder, acht Felder und ein Verweis 663 px (> 640); der Knoten wächst nach unten, überdeckt an den Startplätzen nichts.
- **Bilder:** Wettbewerb-Adressen abgeschnitten (`lampenhaus.exa…`); Probezeilen der Schrift mit Auslassungspunkten; mit Größe und Skala am Ende bricht „Standards“ in der Vorschau mitten im Wort; „dazwischen“ der Tonalität sitzt knapp über der nächsten Reglerzeile; die Regler „Größe“ und „Gewicht“ zeigen „0,00“, solange der Agordo keinen Wert setzt (Bild 06), und „Gewicht“ auch am Ende seines Bereichs (Bild 08); „als Primär übernehmen“ nahm im Lauf `#c6f135`, eine bunte Pastellfarbe, die nie von selbst Primär würde (zulässig, kein Urteil). Detailbilder sind Ausschnitte bei eingepasster Zoomstufe und darum klein.
- **Mockup-Vergleich:** Abweichungen wie gemeldet (fünf Spalten, „Aa“ daneben); sonst entspricht die Leinwand Option A und dem Vorbild `verbindungen.png` (gestrichelte Kurven, runde Punkte, Farbkanten farbig).
