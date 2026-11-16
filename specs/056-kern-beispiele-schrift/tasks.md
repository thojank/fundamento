# Spec 056 – Aufgaben (MP-2a: Ausgangslage, Kern, Werte, Beispiele, Schrift)

**Spec:** [`spec.md`](spec.md) (Kopie der Produkt-Spec, `cmp`-gleich, 51 112 Byte, SHA-256 `f5782104fc6e8eeabe441ed39ff0fec811667f975a4b980bd147ce8e7048a579`) · **Plan:** [`plan.md`](plan.md) (technische Spec byte-gleich, 31 654 Byte, SHA-256 `c2652c04c2e8f826d2e480e9be87d108eb27003717ef6fcf47c6fe3e60d0017b`, danach „Nachtrag“ mit Abschnitt 0 des Implementierungsplans) · **Basis:** `main` `6d34a75a` · **Branch:** `261115-spec056-markenprozess-verbindu-b3a6e5`

Acht Tickets, ein Strang (Spec: „höchstens 8 Tickets, ein PR“). Kein Ticket pusht, öffnet einen PR, merged oder startet einen `workflow_dispatch`; kein Ticket committet, stasht, checkt aus oder setzt zurück (D-27). PR, der eine Push und der eine Dispatch sind kein Ticket, sondern ein Schritt des Orchestrators nach QA (D-1). Jedes Ticket trägt seine Punkte nur in **seinen eigenen Abschnitt** unten ein („im Einzelnen“, „Geänderte ältere Tests“, „Für den PR-Text“, „Befunde“); KBS-4.1 fasst sie zusammen.

| Ticket | Spec | Inhalt | Hängt ab von | Stand |
|---|---|---|---|---|
| KBS-1.1 | T1 | Daten: Inhalte, gelöste Verbindungen, was bei der Marke ankommt, „Farbe folgt den Bildern“, Anordnung, Katalog, Schreibweg | – | erledigt |
| KBS-2.1 | T2 | Hülle: Kurven, runde Anschlüsse, Marke-Knoten mit zwei Eingängen, Lösen/Stecken, Kopfleiste, Server-Verdrahtung, Platzhalter | 1.1 | offen |
| KBS-3.1 | T3 | Die sieben Text-Knoten | 2.1 | offen |
| KBS-3.2 | T4 | Beispiele: Hochladen, Ziehen, Link, Vorschaubilder, Entfernen, nur Arbeitsordner | 2.1 | offen |
| KBS-3.3 | T5 | Erkannt, „als Primär/Akzent übernehmen“, „Farbe folgt den Bildern“, Test Export/Paket | 2.1 | offen |
| KBS-3.4 | T6 | Schrift: Katalog mit Suche und Filter, echte Schrift, Regler | 2.1 | offen |
| KBS-3.5 | T7 | Eigene Schrift samt ZIP, erkannte Schnitte, setzen, privates Repo | 2.1 | offen |
| KBS-4.1 | T8 | Tests gesamt, „kein Urteil“, eroj in Chromium, Bilder, Bericht-Entwurf | alle | offen |

## Ausgangsmaß Bündel

Gebaut am unberührten Stand `6d34a75a70f05cd742dd3438bbed141578ce6758` (`git status --short` leer vor dem Bau, vor jeder Änderung), `pnpm --filter @fundamento/nodredaktilo build` (Vite), 2026-11-16 (KBS-1.1):

| Datei | roh | gzip (Stufe 6, `gzip -6 -c`) | Vite-Anzeige |
|---|---|---|---|
| `packages/nodredaktilo/dist/leinwand.js` | 746 121 Byte | 195 930 Byte | 746.12 kB, gzip 197.31 kB |

## Geänderte ältere Tests

Zusammengefasst aus den Ticket-Abschnitten (KBS-4.1). Zeilen beziehen sich auf `6d34a75a`, jeweils vorher → nachher, Grund.

| Datei:Zeile | vorher → nachher | Grund | Ticket |
|---|---|---|---|
| `packages/metiejo/src/grafeo-anordnung-055.test.ts:124` | `marko: [24, 48, 190, 72, 120]` → `marko: [24, 48, 190, 360, 408]` (+1 Kommentarzeile davor) | `altecoDe` liest `ARANGXO_056`, das die Höchsthöhe der Marke anhebt (D-16); `ARANGXO_055` selbst bleibt byte-gleich | 1.1 |

## Für den PR-Text

## Befunde

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

### KBS-2.1: geänderte ältere Tests

### KBS-2.1: für den PR-Text

### KBS-2.1: Befunde

## KBS-3.1 (T3): Die sieben Text-Knoten

### KBS-3.1 im Einzelnen

### KBS-3.1: geänderte ältere Tests

### KBS-3.1: für den PR-Text

### KBS-3.1: Befunde

## KBS-3.2 (T4): Beispiele

### KBS-3.2 im Einzelnen

### KBS-3.2: geänderte ältere Tests

### KBS-3.2: für den PR-Text

### KBS-3.2: Befunde

## KBS-3.3 (T5): Erkannt, Übernehmen, Folgen, Export-Test

### KBS-3.3 im Einzelnen

### KBS-3.3: geänderte ältere Tests

### KBS-3.3: für den PR-Text

### KBS-3.3: Befunde

## KBS-3.4 (T6): Schrift aus Fontsource

### KBS-3.4 im Einzelnen

### KBS-3.4: geänderte ältere Tests

### KBS-3.4: für den PR-Text

### KBS-3.4: Befunde

## KBS-3.5 (T7): Eigene Schrift samt ZIP

### KBS-3.5 im Einzelnen

### KBS-3.5: geänderte ältere Tests

### KBS-3.5: für den PR-Text

### KBS-3.5: Befunde

## KBS-4.1 (T8): Tests gesamt, Bilder, Bericht

### KBS-4.1 im Einzelnen

### KBS-4.1: geänderte ältere Tests

### KBS-4.1: für den PR-Text

### KBS-4.1: Befunde
