# Spec 033 – Markenassistent – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-24, unverändert kopiert; SHA-256 `b940b1fa…1379f644`) · **Basis:** `main` `05f122dc` (nach #110, #111, #113) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Grenze angehoben**, nichts weggeworfen: Schnellstart und Studio bleiben und werden Teil des Assistenten. Ersetzt Studio Runde 3.

**Stufen, gestapelt:** S1 von `main` (dieser Abschnitt), S2 bis S6 jeweils auf der vorigen. Spec 029 ②b läuft parallel; bei Konflikten setzt der spätere PR neu auf.

## S1 – Amendment v2.5, Markenmodell, Ablauf neben dem Studio, Chat über Werkzeuge, Freigabe, Kroniko, Bestätigung und Hinweis

**Branch:** `261029-spec-033-s1-markenassistent` (von `main` `05f122dc`) · **Datum:** 2026-10-29 · **Stand:** gebaut, Abnahme offen.

### Zusammenfassung

1. **Constitution Amendment v2.5:** Art. VI „Plattform und Herausgeber“ wörtlich nach der Spec, nach „Kein Trittbrett“; Terminologie **Kroniko** und **Asistanto** (Namen vorgeschlagen, O-1); Änderungshistorie; Ontologio mit beiden Begriffen und der Entität **Faceto**.
2. **Markenmodell, Umfang 1 (visuell):** [`packages/modelo/data/facetoj.json`](../../packages/modelo/data/facetoj.json), Schicht (Tavolo) `vida`, zwölf **Facetoj** in der Reihenfolge der Spec, je mit `fac_`-ID (Regel 0.1), deutschem und englischem Namen, **Gewicht mit Kialo**, den Token-Präfixen und den Feldern des Agordo, die sie definieren. Ein Test prüft, dass **jedes der 1608 Tokens des Kerns zu genau einer Faceto gehört**; Ero- und Sxablono-Tokens über ihre Alias-Kette.
3. **Zustände und Prozentanzeige:** offen, definiert, freigegeben, gelesen aus der Kroniko. Prozent = freigegebene und grüne Facetoj gegen alle, gewichtet; daneben der Anteil der definierten. Eine Faceto mit offenem Problem der Prüfung zählt nicht: **100 % ist immer geprüft grün**. Umfang 2 und 3 stehen als „noch nicht Teil des Modells“.
4. **Ablauf Schritt für Schritt neben dem Studio:** `/asistanto/<marke>/<faceto>` in der Metiejo, gebaut aus Eroj (`fm-sxelo`, `fm-mezurilo`, `fm-navigado`, `fm-karto`, `fm-tekstareo`, `fm-butono`, `fm-dialogo`). Links die Facetoj mit Zustand und Prozent, in der Mitte die Live-Vorschau der passenden Studio-Seite, rechts Chat und Schritt-Aktionen. Studio und Assistent arbeiten am **selben Entwurf** (`rev`); das Studio hat einen Link „Assistent“, der Assistent „Im Studio bearbeiten“.
5. **Chat in Textform über Werkzeuge:** acht Werkzeuge (`stato`, `regler`, `bewege`, `setze_regler`, `setze_farbe`, `waehle_schrift`, `waehle_ikono_gewicht`, `pruefe`). Keines schreibt einen Tokenwert, keines gibt frei. Werte außerhalb eines Reglerbereichs, unbekannte Regler, Nicht-Farben und unbekannte Schriften werden abgelehnt, mit Bereich oder Kandidaten.
6. **Freigabe:** nur die Person (Knopf); erst wenn der Schritt definiert und grün ist. „Vorschlag übernehmen“ definiert, „Wieder öffnen“ öffnet; eine Änderung an einer freigegebenen Faceto öffnet sie wieder.
7. **Kroniko:** `marken/<name>/kroniko.jsonl`, je Zeile ein Eintrag nach `$defs/KronikoEro`: Anlegen, jede Änderung (Quelle Regler oder Chat mit Modell), jeder Chat-Zug mit Tokens, Anfragen und Dauer, Übernahme, Freigabe, Wiederöffnen, fremde Marke, Bestätigung, Hinweis beim Export. `persono` und `rolo` stehen leer bereit.
8. **Bestätigung und Hinweis (Amendment v2.5):** Baut die Marke auf einer fremden Marke auf, verlangt der Assistent die Bestätigung (Dialog), bevor er weiterarbeitet. Vor jedem Export zeigen „Fertig“ und das Studio den Hinweis auf mögliche Verwechselbarkeit; der Export schreibt ihn in die Kroniko.
9. **Ein Client für Assistent und Nordstern:** `Provider`, `Budget` und die Anfrage mit Warten bei 429 liegen jetzt in der Metiejo (`asistanto/ki.ts`); `@fundamento/nordstelo` nutzt sie unverändert über seine bisherigen Namen.

### Constitution Amendment v2.5

- **Geänderter Artikel:** Art. VI, neuer Absatz „Plattform und Herausgeber“ nach „Kein Trittbrett“, wörtlich wie in der Spec.
- **Terminologie:** **Kroniko** (Esperanto „Chronik“) für das Protokoll der Marke; **Asistanto** für den Markenassistenten. Das Markenmodell braucht keinen eigenen Begriff: Es ist die Liste der **Facetoj** der Schicht `vida`. „Faceto“ steht als Entität mit ID in der Ontologio (Schema `modelo`, wie Tasko und Kriterio), nicht in der Tabelle der Constitution. Begründung des Namens: „Aspekt“ wäre im Esperanto „aspekto“ und ist im Repo schon die Marke selbst (Aspekto-Paket); „Faceto“ vermeidet die Verwechslung.
- **Nummer:** 2.5, bestimmt gegen `main` `05f122dc` mit v2.4, kein offener PR beansprucht eine Nummer; die Spec nennt sie.
- **Migration:** keine Änderung an bestehenden Daten. Marken ohne Kroniko gelten als „vor der Kroniko“: Was ihr Agordo setzt, ist definiert.

### Entwurfsentscheidungen

#### D-01 Facetoj als Daten im Modelo
Optionale Datendatei wie `nordstelo.json` (Spec 030): Schema-Def `FacetojFile`/`Faceto`, generierte Typen, Entität `faceto` mit Präfix `fac` in `ids.lock.json`, Ontologio-Begriff. Ein Token gehört zur Faceto, deren Präfix es trägt (ganze Segmente). Ein Ero-Tokeno ohne eigene Regel gehört dorthin, wohin seine Alias-Kette führt. Acht Ero-Tokens tragen eigene Längen statt eines Alias; sie stehen ausdrücklich in `tokenoj`: Radius und Rahmen bei Form, Innenabstände bei Raum, Maße bei Elementgrößen. `checkFacetoj` meldet `faceto-token-unassigned` und `faceto-token-twice`; es läuft im Test, wie `checkNordstelo`.

| Faceto | Gewicht | Token-Präfixe (Auszug) | Felder des Agordo |
|---|---|---|---|
| Leitfarbe und Akzente | 3 | color.palette.accent, color.brand, color.action, color.link | leitfarbe, regler.saettigung |
| Neutraltöne | 2 | color.palette.neutral/shade/tint, color.background, color.text, color.border, opacity | neutral.toenung, regler.helligkeit, regler.kontrast |
| Statusfarben | 2 | color.status, color.palette.success/warning/danger/info | zusatzfarben |
| Dunkelmodus und hoher Kontrast | 2 | – (Dimensioj color-scheme, contrast) | ziele |
| Schrift | 3 | font, typography | schriften, schrift.* |
| Form (Radien) | 1 | radius, border, stroke | form.radius, form.rahmen |
| Raum und Dichte | 2 | spacing, layout, size.scale/container/breakpoint | raum.abstand |
| Elevation | 1 | elevation, color.shadow | form.schatten |
| Bewegung | 1 | motion | – |
| Fokus | 1 | focus, color.focus | – |
| Elementgrößen | 1 | size.control, size.target | raum.hoehe |
| Icons | 1 | size.icon | ikono |

#### D-02 Zustände aus der Kroniko
Die Kroniko ist die eine Quelle für die Zustände. Definiert ist eine Faceto nach einer Änderung oder einer Übernahme. Eine Freigabe macht sie freigegeben; eine Änderung oder „Wieder öffnen“ macht sie wieder definiert. Welche Facetoj eine Änderung berührt, ergibt sich aus dem Vergleich des Agordo vorher und nachher: Felder der Faceto, gesetzte Tokens (`festgelegt`) und deren Modi (Farbschema und Kontrast zählen zu den Modi).

#### D-03 Grün und 100 %
Offen sind die Verstöße des Berichts, die fest sind oder keine Jugxo tragen. Ihr Gegenstand (Token, Token mit Modus, KontrastParo, Präfix mit `*`) wird auf Facetoj abgebildet; ein Paar zählt für beide Tokens. Ein Verstoß, der sich keiner Faceto zuordnen lässt, zählt für alle. So kann eine Marke mit offenem Problem nie 100 % zeigen. Die Freigabe verlangt einen definierten und grünen Schritt.

#### D-04 Werkzeuge statt Rohwerte
Das Sprachmodell sieht nur die acht Werkzeuge. Jede Änderung geht über `readAgordo` und `setDraft`. `bewege` nutzt im Server `proposeAgordo`: Die Prüfung hält vor einer festen Regel an. Ein Regler-Wert muss im Bereich des Reglers liegen, sonst nennt die Ablehnung den Bereich. Es gibt kein Werkzeug für `festgelegt` und keines für die Freigabe.

#### D-05 Ein Entwurf, ein `rev`
Alle Änderungen laufen durch `setDraft`, auch die des Chats (Quelle `babilo`, mit Modell). Der Assistent fragt alle 3 s `/api/marko/<marke>/stato` ab und lädt bei neuem `rev` die Vorschau und die Zustände neu. Das Studio lädt sich neu, wenn niemand gerade ein Feld bearbeitet; sonst zeigt es einen Hinweis.

#### D-06 Schlüssel nur im Server
`readKi(root)` liest die `.env` beim Start; der Schlüssel liegt im privaten Feld des `Provider` und verlässt es nur im Header `authorization`. Jeder Text für Kroniko, Log und Antwort geht durch `redact`. Der Browser sieht `anbieter/modell` und die Tokens, nie den Schlüssel.

#### D-07 Kostengrenze je Zug
Ein Chat-Zug darf höchstens 60 000 Tokens verbrauchen (`ki.limo`); der Probelauf nutzte 30 000. Bei 429 wartet der Zug mit wachsendem Abstand und meldet das im Log (wie Nachlese 11 ④).

### Probeläufe

Drei Runden je Modell an einer Wegwerf-Marke `proba` (Basis komuna) in einem temporären Ordner außerhalb des Checkouts, Kostengrenze 30 000 Tokens je Runde. Die Runden: „Mach die Ecken etwas runder.“ (formo), „Die Leitfarbe soll wärmer wirken.“ (gvidkoloro), „Setze den Abstand auf 1,2.“ (spaco). Gemessen am 2026-10-29 auf dem Mac des Maintainers.

| Modell | Tokens (ein + aus) | Anfragen | Dauer | Kosten | Ergebnis |
|---|---|---|---|---|---|
| `mistral/ministral-14b-2512` | 10 794 + 232 = **11 026** | 8 | **27,8 s** | ≈ **0,0022 $** (0,20 $ je Mio. Tokens laut Preisvergleichsseiten, B-3) | 3 von 3 Runden geändert, jede über Werkzeuge (`regler`+`bewege`, `bewege`, `regler`+`setze_regler`) |
| `openrouter/nvidia/nemotron-3-ultra-550b-a55b:free` | 12 429 + 967 = **13 396** | 8 | **226,5 s** | **0 $** (`:free`) | 2 von 3 geändert; in Runde 2 nach `regler` eine leere Antwort ohne Änderung (B-1, behoben) |
| `openrouter/openai/gpt-oss-20b:free` (Modell der `.env`) | 0 | 3 | – | 0 $ | 404: „unavailable for free“; nicht weiter genutzt (B-2) |

Kein Schlüssel stand in Kroniko oder Log (im Probelauf geprüft). Die Kroniko hatte nach dem Mistral-Lauf 8 Einträge (`kreo`, `sxangxo`, `babilo`).

### Abweichungen

1. **Freigabe nur bei definiert:** Die Spec nennt drei Zustände. Freigeben lässt sich ein Schritt erst, wenn er definiert ist: durch „Vorschlag übernehmen“, eine Änderung im Chat oder an den Reglern. Ein offener Schritt würde sonst den Wert der Basis freigeben, ohne dass jemand ihn angesehen hat.
2. **Bestätigung in S1 per Nennung:** Uploads, Links und Recherche kommen mit S2 und S4; in S1 löst „Baut auf einer bestehenden Marke auf“ (mit Namen) die Bestätigung aus. Der Mechanismus (`fremda`, `konfirmo`, Kroniko) ist derselbe, den S2 und S4 nutzen.
3. **Hinweis vor jedem Export, nicht nur bei fremder Basis:** Art. VI Punkt 2 sagt „vor jedem Export“; so steht er auf „Fertig“ und im Studio immer.

### Befunde / Mankoj

- **B-1 Leere Antwort nach einem Werkzeug** (Nemotron, Runde 2): Der Assistent sagt dann, was sich geändert hat, oder dass nichts geändert wurde und wie man es anders sagt. Test zuerst rot.
- **B-2 `openai/gpt-oss-20b:free`** aus `OPENROUTER_MODEL` der `.env` ist nicht mehr kostenlos (404 mit Verweis auf das bezahlte Modell). Die `.env` sollte ein anderes `:free`-Modell nennen; Nemotron lief.
- **B-3 Preis von `ministral-14b-2512`:** 0,20 $ je Million Tokens Ein- und Ausgabe laut [pricepertoken](https://pricepertoken.com/pricing-page/model/mistral-ai-ministral-14b-2512), [OpenCode](https://opencode.ai/data/mistral/ministral-14b-2512.md) und [Maxim](https://www.getmaxim.ai/bifrost/model-library/compare/mistral/ministral-14b-2512.md); nicht gegen die Preisseite von Mistral geprüft. Die Preise als Daten mit Datum kommen mit S6.
- **B-4 `FM_KI_MODELL` der `.env` ist `mistral-large-latest`:** Freigegeben ist `ministral-14b-2512`. Der Assistent nimmt das Modell der `.env`; für die Abnahme `FM_KI_MODELL=ministral-14b-2512` setzen (Messanleitung).
- **Manko E7 (Chat-Familie):** Der Chat ist aus `fm-karto`, `fm-teksto`, `fm-tekstareo` und `fm-butono` gebaut. Es fehlen eine Nachrichtenliste mit Live-Region für neue Antworten und das Senden mit Enter. Das ist ein Manko für Eroj-Runde 7, kein Nachbau.

### Offen (für den Maintainer)

- **O-1 Namen:** **Kroniko** (Protokoll der Marke), **Asistanto** (Markenassistent), **Faceto** (visueller Aspekt). Bitte bestätigen oder andere nennen; die Namen stehen in Constitution, Ontologio, Daten und Code.
- **O-2 Gewichte:** Leitfarbe und Schrift 3, Neutraltöne, Statusfarben, Modi und Raum 2, die übrigen 1 (Summe 20). Jedes Gewicht hat eine Kialo in den Daten.
- **O-3 Opazität bei den Neutraltönen** und Rahmen bei Form: Beides steht in keiner Faceto der Spec; die Zuordnung folgt der Wirkung (Flächen, Umriss).
- **O-4 `.env`:** `OPENROUTER_MODEL` auf ein verfügbares `:free`-Modell und `FM_KI_MODELL=ministral-14b-2512` setzen (B-2, B-4).

### Messanleitung

Alle Befehle im Checkout des Maintainers, nach dem Merge (oder auf dem Branch):

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git switch main && git pull
pnpm install && pnpm build
```

In der `.env` für die Abnahme: `FM_KI_ANBIETER=mistral` und `FM_KI_MODELL=ministral-14b-2512` (oder `openrouter` mit einem `:free`-Modell). Dann:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm metiejo --open
```

1. In `http://localhost:7301` eine Marke anlegen (zum Beispiel „Abnahme“, Basis komuna), dann `http://localhost:7301/asistanto/abnahme` öffnen. Erwartet: Weiterleitung auf den ersten offenen Schritt „Leitfarbe und Akzente“; links zwölf Schritte mit „offen“, oben der Balken bei 0 %, darunter „Sprache und Ton (Umfang 2): noch nicht Teil des Modells“.
2. Schritt „Form (Radien)“: im Chat „Mach die Ecken etwas runder“ senden. Erwartet: eine Antwort in ein bis zwei Sätzen, die Vorschau mit runderen Ecken, der Schritt „definiert“.
3. Im Studio (`http://localhost:7301/studio/abnahme/raum`) den Abstand ändern und übernehmen; im Assistenten ist „Raum und Dichte“ nach wenigen Sekunden „definiert“, die Vorschau folgt.
4. „Form (Radien)“ freigeben: der Balken steigt (Gewicht 1 von 20 = 5 %). „Wieder öffnen“ setzt ihn zurück.
5. „Baut auf einer bestehenden Marke auf“ (vorher im Textfeld einen Namen eintragen): Der Dialog verlangt die Bestätigung; erst danach antwortet der Chat.
6. Schnellstart „Fertig“ (`http://localhost:7301/marko/abnahme/fertig`) und Studio zeigen den Hinweis „… mögliche Verwechselbarkeit …“; nach „Speichern“ steht er in der Kroniko.
7. Die Kroniko: `file:///Users/thorstenjankowski/Fundamento/marken/abnahme/kroniko.jsonl` (bei gesetztem `FM_MARKEN_DIR` dort). Erwartet: je Zeile ein Eintrag mit `tempo`, `ago`, `fonto`, bei Chat-Zügen `modelo` und `kosto`; kein Schlüssel.

Die Daten des Markenmodells: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/modelo/data/facetoj.json`. Die Constitution: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.specify/memory/constitution.md` (Art. VI, „Plattform und Herausgeber“).

**Tests:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/modelo exec vitest run src/data/facetoj.test.ts src/data/ontologio.test.ts src/docs/docs.test.ts
pnpm --filter @fundamento/metiejo exec vitest run src/asistanto
pnpm --filter @fundamento/nordstelo exec vitest run
```

Die Spec: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/033-markenassistent/spec.md`.

## S2 – Weg B: Uploads, Links, Erkennung, private Schriften

**Branch:** `261029-spec-033-s2-weg-b` (auf S1) · **Datum:** 2026-10-29 · **Stand:** gebaut, Abnahme offen.

### Zusammenfassung

1. **Enportilo, deterministisch, ohne Browser und ohne Sprachmodell** (`packages/metiejo/src/enportilo/`):
   - **PNG** (Screenshots, Logos): eigener Decoder auf `node:zlib` (8 Bit, Grau, RGB, RGBA, Palette; alle fünf Filter), dann die dominanten Farben mit ihrem Anteil an der Fläche.
   - **SVG:** Farben aus `fill`, `stroke`, `stop-color` und `style`, mit Zeile.
   - **PDF** (Styleguides): die Farben, mit denen die Seiten gemalt sind (`rg`/`RG`, `k`/`K` in den entpackten Inhalts-Streams), und die eingebetteten Schriften (`/BaseFont`, ohne Subset-Präfix und Schnitt).
   - **Links:** die Seite und ihre Stylesheets, verlinkt und eingebettet, höchstens zehn, je höchstens 2 MB, gelesen mit `postcss`. Ergebnis: Farben (eine Variable zählt für jede Verwendung, auch über `var()`-Ketten und vor ihrer Definition), Familien nach Rolle (Überschriften, Code, Fließtext), Radien und Innenabstände in px; dazu Custom Properties nach ihrem Namen (`radius`, `family`, `spacing`). Jeder Fund mit Datei und Zeile.
   - **Schriften** (woff2, woff, ttf, otf): in `marken/<name>/fontoj/` und, wie bisher, ins private Repo (`FM_TIPAROJ_REPO`), erst nach der Prüfung, dass es privat ist (`uploadFont`). Ohne Repo sagt ein Satz, dass die Schrift wartet.
2. **Vorschlag je Faceto mit Herkunft** (`rekono.ts`), über die Felder des Agordo im Bereich der Regler:
   - **Leitfarbe:** die kräftigste Farbe mittlerer Helligkeit (Gewicht × Chroma).
   - **Neutraltöne:** die Tönung der hellen Flächen.
   - **Statusfarben:** nach Farbton-Bändern, kräftige Stufen vor blassen.
   - **Schriften:** je Rolle die häufigste Familie, aus dem Katalog als Webschrift, sonst als lizenziert und nicht enthalten.
   - **Radius und Abstand:** der Median gegen `radius.medium` (4 px) und `spacing.medium` (8 px) der Struktur. Ein Wert jenseits des Reglers steht am Ende, und der Satz sagt das.
3. **Ablauf:** Im Assistenten unter „Material deiner Marke“ eine Datei (`fm-alsxutilo`) oder ein Link (`fm-kampo`), dazu die Bestätigung (`fm-markobutono`).
   - **Ohne Bestätigung liest der Enportilo nichts** (409): Die Bestätigung kommt zu Beginn (Amendment v2.5).
   - Nach dem Lesen stehen fremde Basis (`upload` oder `link`, mit Name), Bestätigung und jeder Vorschlag (Quelle `agento`, mit Herkunft) in der Kroniko.
   - Der Schritt zeigt seinen offenen Vorschlag mit Herkunft; „Vorschlag übernehmen“ legt ihn über den Entwurf (Quelle `agento`) und definiert den Schritt.
   - Der Hinweis vor dem Export bleibt wie in S1.
4. **Ablage:** Uploads in `marken/<name>/materialo/` (mit `.gitignore`), offene Vorschläge in `marken/<name>/enportilo.json`, einer je Faceto, bis zur Übernahme.

### Entwurfsentscheidungen

#### D-08 Ohne Browser und ohne neue Bild-Bibliothek
Ein PNG-Decoder auf `node:zlib` und ein Leser für Farb-Operatoren in PDF genügen für Farben und Schriften. Playwright fehlt in der Metiejo und im CI-Job ihrer Unit-Tests; eine Bild- oder PDF-Bibliothek wäre eine neue Abhängigkeit für wenig Gewinn. Neu ist nur `postcss` in der Metiejo, das das Modelo schon nutzt. JPEG, interlaced PNG und 16-Bit-PNG nennt die Fehlermeldung; der Screenshot eines Browsers ist 8-Bit-PNG.

#### D-09 Beobachtung, nicht Übernahme (Art. V)
Der Enportilo misst Werte (eine Farbe, ein Radius, ein Abstand, der Name einer Familie) und schreibt sie in die Felder des Agordo; er übernimmt keine Bezeichner, keine Token-Namen und keine Dateien einer fremden Marke. Die Herkunft je Wert steht in Vorschlag und Kroniko.

#### D-10 Vorschläge als Datei bis zur Übernahme
Ein Vorschlag bleibt offen, bis die Person ihn übernimmt; ein neues Lesen ersetzt den offenen Vorschlag seiner Faceto. Die Kroniko hält jeden Vorschlag fest, auch die ersetzten.

### Probeläufe

Eigene Testmarke `provo` (Beispielmarke von Fundamento), Projektionen lokal gebaut; Gegenstand ist eine Wegwerf-Marke `proba` (Basis komuna) in einem temporären Ordner. Kein Sprachmodell: **0 Tokens, 0 $**.

| Material | Funde | Vorschläge | Dauer | Leitfarbe | Weitere Vorschläge mit Herkunft |
|---|---|---|---|---|---|
| Screenshot der Vitrino von `provo` (1200 × 900, Playwright, Chromium) | 4 | 2 | 85 ms | `#62419a` (1,0 % der Fläche) | Neutraltöne (Tönung 0,14, 93,7 % der Fläche) |
| URL einer Seite mit den Stylesheets von `provo` (`css/fundamento.css`, `css/fundamento-provo.css`, lokal ausgeliefert) | 258 | 6 | 57 ms | `#4b2980` (`fundamento.css`, Zeile 2500) | Neutraltöne, Statusfarben (danger `#932400`, success `#53c089`, info `#007696`, warning `#d89b2c`), Schriften (Geist, Geist Mono, OFL-1.1), Radius 2 (Median 10 px, Ende des Reglers), Abstand 1,5 (Median 16 px, Ende des Reglers) |

Die Kroniko danach: `kreo fremda konfirmo propono:gvidkoloro propono:neutralaj fremda konfirmo propono:gvidkoloro propono:neutralaj propono:statoj propono:tiparo propono:formo propono:spaco`.

### Abweichungen

1. **Kein Erkennen von Radien und Abständen aus Bildern:** Aus Screenshots und PDF kommen Farben und Schriften; Radien und Abstände aus dem CSS einer Seite. Für Bilder bräuchte es eine Kantenerkennung, die Spec nennt kein Verfahren (O-6).
2. **Bestätigung je Material:** Jedes Lesen verlangt die Bestätigung und hält sie fest, nicht nur das erste.

### Befunde / Mankoj

- **B-5 Leitfarbe aus einem Stylesheet mit allen Paletten:** Im ersten Probelauf war die häufigste kräftige Farbe der URL ein heller Palettenton. Behoben, je Schritt mit einem Test zuerst rot: Die Leitfarbe hat jetzt mittlere Helligkeit; Farben, deren Variable `primary`, `brand`, `accent` oder `action` heißt, zählen mehr; Verweise über `var()` zählen auch vor der Definition und durch Ketten; Statusfarben folgen derselben Regel.
- **B-6 Custom Properties:** Das CSS einer Marke legt Radius, Familien und Abstände in Variablen ab; im ersten Lauf fand der Enportilo keine. Behoben (Test zuerst rot).
- **B-7 Lokaler Lint:** `pnpm lint` scheiterte zweimal am Wettlauf von `build` und `lint` der Eroj um `src/generated/` (ENOTEMPTY); der zweite Lauf war grün. Das gab es schon vor dieser Spec; die CI ist nicht betroffen.
- **B-8 M5 in der CI:** Der Zeittest der Werkstatt (höchstens 50 ms Blockade) war auf langsamen Läufern rot (51, 65, 53 ms) und bei Wiederholung grün, auf #113 und auf S1. Die langen Frames sind reines Style und Layout ohne Skript; Kandidat für eine eigene Ursachensuche.

### Offen (für den Maintainer)

- **O-5 URL einer eigenen Testmarke:** Der Probelauf nutzt die lokal gebaute `provo`. Für die Abnahme 2 die URL einer eigenen, öffentlich erreichbaren Testmarke nennen, falls es eine gibt.
- **O-6 Radien und Abstände aus Bildern** (Abweichung 1): wichtig genug für eine eigene Runde?

### Messanleitung

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm install && pnpm build
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo/fundamento.config.json --out .fundamento/projekcioj-provo
pnpm fm metiejo --open
```

1. Eine Marke anlegen, `http://localhost:7301/asistanto/<marke>/gvidkoloro` öffnen, „Material deiner Marke“ aufklappen.
2. Einen Screenshot einer eigenen Testmarke (PNG) wählen, ohne das Kästchen „Ich habe die Rechte …“: „Material lesen“ antwortet mit der Bitte um Bestätigung. Mit Kästchen: Die Seite lädt neu; der Schritt zeigt „Vorschlag aus deinem Material“ mit Herkunft (Datei, Anteil der Fläche).
3. Einen Link eingeben (zum Beispiel eine lokal ausgelieferte Seite mit `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-provo/css/fundamento-provo.css`) und lesen: Schritte „Schrift“, „Form (Radien)“ und „Raum und Dichte“ zeigen Vorschläge mit Datei und Zeile.
4. „Vorschlag übernehmen“: Vorschau und Zustand folgen; die Kroniko nennt `propono` und `sxangxo` mit Quelle `agento`.
5. Eine Schriftdatei (woff2) lesen: Mit `FM_TIPAROJ_REPO` geht sie nach der Prüfung ins private Repo, ohne bleibt sie in `marken/<marke>/fontoj/`.

Die Kroniko: `file:///Users/thorstenjankowski/Fundamento/marken/<marke>/kroniko.jsonl`; die offenen Vorschläge: `file:///Users/thorstenjankowski/Fundamento/marken/<marke>/enportilo.json`.

**Tests:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/metiejo exec vitest run src/enportilo src/asistanto
```
