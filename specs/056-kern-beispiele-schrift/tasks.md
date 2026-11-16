# Spec 056 – Aufgaben (MP-2a: Ausgangslage, Kern, Werte, Beispiele, Schrift)

**Spec:** [`spec.md`](spec.md) (Kopie der Produkt-Spec, `cmp`-gleich, 51 112 Byte, SHA-256 `f5782104fc6e8eeabe441ed39ff0fec811667f975a4b980bd147ce8e7048a579`) · **Plan:** [`plan.md`](plan.md) (technische Spec byte-gleich, 31 654 Byte, SHA-256 `c2652c04c2e8f826d2e480e9be87d108eb27003717ef6fcf47c6fe3e60d0017b`, danach „Nachtrag“ mit Abschnitt 0 des Implementierungsplans) · **Basis:** `main` `6d34a75a` · **Branch:** `261115-spec056-markenprozess-verbindu-b3a6e5`

Acht Tickets, ein Strang (Spec: „höchstens 8 Tickets, ein PR“). Kein Ticket pusht, öffnet einen PR, merged oder startet einen `workflow_dispatch`; kein Ticket committet, stasht, checkt aus oder setzt zurück (D-27). PR, der eine Push und der eine Dispatch sind kein Ticket, sondern ein Schritt des Orchestrators nach QA (D-1). Jedes Ticket trägt seine Punkte nur in **seinen eigenen Abschnitt** unten ein („im Einzelnen“, „Geänderte ältere Tests“, „Für den PR-Text“, „Befunde“); KBS-4.1 fasst sie zusammen.

| Ticket | Spec | Inhalt | Hängt ab von | Stand |
|---|---|---|---|---|
| KBS-1.1 | T1 | Daten: Inhalte, gelöste Verbindungen, was bei der Marke ankommt, „Farbe folgt den Bildern“, Anordnung, Katalog, Schreibweg | – | erledigt |
| KBS-2.1 | T2 | Hülle: Kurven, runde Anschlüsse, Marke-Knoten mit zwei Eingängen, Lösen/Stecken, Kopfleiste, Server-Verdrahtung, Platzhalter | 1.1 | erledigt |
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
