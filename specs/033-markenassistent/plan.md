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

## S3 – Weg A (Kreilo): Einstiegsfragen, Charakter als Gegensatzpaare, Inspiration, Vorschlag je Aspekt

**Branch:** `261029-spec-033-s3-weg-a` (auf S2) · **Datum:** 2026-10-29 · **Stand:** gebaut, Abnahme offen.

### Zusammenfassung

1. **Einstiegsfragen** unter `/asistanto/<marke>/komenco`, gebaut aus Eroj:
   - „Was soll die Marke repräsentieren, und für wen?“ (`fm-tekstareo`)
   - der Charakter als **fünf Gegensatzpaare** (`fm-glitilo` von −2 bis +2, die Pole als Beschriftung an den Enden): ruhig–lebhaft, klassisch–modern, warm–kühl, sachlich–verspielt, leicht–kräftig
   - was schon festgelegt ist: Farbe und Schrift (`fm-kampo`)
   - Inspirationsbilder (`fm-alsxutilo`, mehrere) mit der Bestätigung nach Amendment v2.5

   Der Assistent verlinkt „Einstiegsfragen“ in seiner Schritt-Navigation.
2. **Kreilo als Daten:** `packages/metiejo/data/kreilo.json`.
   - Je Paar die Bewegungen der Regler pro Stufe zum rechten Pol, mit Kialo; der linke Pol bewegt in die Gegenrichtung.
   - Die Schriftregeln nach Charakter, mit Kialo: verspielt → Nunito; klassisch → Fraunces und Source Serif 4; modern → Inter; ausgewogen → Manrope.
   - Die Anker der Leitfarbe: warm–kühl gibt den Farbton von 45° bis 260°, ruhig–lebhaft die Sättigung.
   - Jeder Wert bleibt im Bereich seines Reglers.
3. **Vorrang der Leitfarbe:** festgelegt, dann die kräftigste Farbe der Inspirationsbilder (Enportilo aus S2), dann mit Sprachmodell ein Zug über `setze_farbe` passend zur Beschreibung, sonst die Anker des Charakters. Bei der Schrift: festgelegt, sonst die erste Regel, die zum Charakter passt.
4. **Sofort sichtbar:** Der Vorschlag liegt direkt auf dem Entwurf (Quelle `agento`); die berührten Schritte sind „definiert“. Die Person sieht jeden in der Vorschau, passt ihn im Chat oder im Studio an und gibt frei. Jeder Schritt hat in der Kroniko einen Eintrag `propono` mit seiner Herkunft, etwa „Einstiegsfragen, ruhig–lebhaft −1 (ruhig)“ oder die Datei eines Inspirationsbilds; die Antworten stehen in `marken/<name>/kreilo.json`.

### Entwurfsentscheidungen

#### D-11 Charakter als Daten, nicht als Prompt
Wie das Wunsch-Vokabular der Agordilo: Die Wirkung eines Paars steht mit Kialo in den Daten, und der Kreilo rechnet sie. Das Sprachmodell setzt keine dieser Werte. Es kommt nur dort ins Spiel, wo Worte gebraucht werden: die Leitfarbe passend zur Beschreibung, über das Werkzeug `setze_farbe`, und danach jede Anpassung im Chat.

#### D-12 Weg A legt den Vorschlag direkt auf den Entwurf
Bei einer neuen Marke gibt es kein fremdes Material, das erst übernommen werden müsste (anders als Weg B). Der Vorschlag ist sofort in der Vorschau sichtbar („Jedes Ergebnis ist sofort sichtbar“); die Freigabe bleibt bei der Person.

### Probeläufe

**Abnahme 1, automatisch durchgespielt** am 2026-10-29 mit `mistral/ministral-14b-2512` und einer Kostengrenze von 30 000 Tokens je Zug, Wegwerf-Marke `pano` in einem temporären Ordner.

- **Fünf Sätze:** „Eine Bäckerei für die Nachbarschaft. Ehrliches Brot, früh am Morgen gebacken. Für Familien und Leute auf dem Weg zur Arbeit. Warm und freundlich, nicht schick. Man soll sich willkommen fühlen.“
- **Charakter:** ruhig −1, klassisch −1, warm −2, verspielt +1, Mitte bei leicht–kräftig.
- **Zwei Inspirationsbilder:** synthetisch erzeugt (Krustenbraun und Creme, Weizengold und Hell), keine Fotos Dritter.
- **Ablauf:** zwei Wünsche im Chat („Die Leitfarbe etwas wärmer, bitte.“, „Etwas runder.“). Danach jeden offenen Schritt übernommen und alle zwölf freigegeben, ohne menschliche Prüfung. Am Ende Speichern mit Export (Paket, CSS, Figma) und `fm projekcioj build` über die exportierte Konfiguration.

| Schritt | Ergebnis | Zeit seit Start |
|---|---|---|
| Kreilo | 5 Schritte gesetzt (Leitfarbe aus den Inspirationsbildern, Neutraltöne, Schrift, Form, Elevation) | 2,2 s |
| zwei Chat-Züge | beide über Werkzeuge geändert (wärmer, Radius 1,35 → 1,75) | – |
| 12 Freigaben | **100 % freigegeben**, 100 % definiert | 25,2 s |
| Prüfung | exportierbar, 0 Probleme | – |
| Export und Projektionen | Paket, CSS, Figma-Plugin; Vitrino mit der Marke | 29,5 s / 36,2 s |

**Gesamt: Dauer 36,2 s, 6 847 Tokens (6 696 ein, 151 aus), 7 Anfragen, Kosten ≈ 0,0014 $** (0,20 $ je Mio. Tokens, B-3). Kroniko: 40 Einträge, kein Schlüssel in Kroniko oder Log.

Gemessen ist damit, dass der Ablauf technisch weit unter **15 Minuten** bleibt. Die Zeit einer Person, die jeden Schritt ansieht und anpasst, ist nicht gemessen; das ist die Abnahme des Maintainers (Messanleitung).

### Abweichungen

1. **Statusfarben, Modi, Bewegung, Fokus, Elementgrößen, Icons setzt der Kreilo nicht:** Kein Paar sagt etwas über sie. Sie stehen auf dem Wert der Basis (offen), bis die Person „Vorschlag übernehmen“ wählt oder sie im Chat anpasst.
2. **Logo:** „Was ist schon festgelegt (Farbe, Schrift, Logo)?“ Ein Logo geht als Inspirationsbild (PNG, SVG) in die Leitfarbe ein; ein Logo-Feld der Marke gehört zu Umfang 3.

### Befunde / Mankoj

- **B-9 Inspiration als fremdes Material:** Inspirationsbilder sind Uploads; der Kreilo verlangt die Bestätigung, bevor er sie liest, und hält fremde Basis und Bestätigung je Bild fest (Art. VI, 1).

### Offen (für den Maintainer)

- **O-7 Schriftregeln und Farbanker** in `kreilo.json`: Familien (Nunito, Fraunces mit Source Serif 4, Inter, Manrope) und Farbtöne (45°/70°/175°/225°/260°) bitte bestätigen oder ersetzen; jede Regel trägt ihre Kialo.

### Messanleitung

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm install && pnpm build
pnpm fm metiejo --open
```

1. Eine neue Marke anlegen, dann `http://localhost:7301/asistanto/<marke>/komenco` öffnen. Erwartet: das Textfeld, fünf Regler mit den Polen an beiden Enden, Farbe, Schrift, Inspiration und Bestätigung. Die Stoppuhr beginnt.
2. Fünf Sätze schreiben, den Charakter einstellen, zwei Bilder wählen, das Kästchen bestätigen, „Vorschlag machen“. Erwartet: Weiterleitung auf „Leitfarbe und Akzente“; die gesetzten Schritte sind „definiert“, die Vorschau zeigt die Marke.
3. Jeden Schritt ansehen, im Chat anpassen, „Vorschlag übernehmen“ und „Freigeben“, bis der Balken 100 % zeigt. Stoppuhr ablesen (Ziel: höchstens 15 Minuten).
4. Im Studio „Speichern“: Der Export liegt in `file:///Users/thorstenjankowski/Fundamento/marken/<marke>/eksporto/`; die Vitrino mit der Marke:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm projekcioj build --config /Users/thorstenjankowski/Fundamento/marken/<marke>/eksporto/fundamento.config.json --out /Users/thorstenjankowski/Fundamento/marken/<marke>/eksporto/projekcioj
open "file:///Users/thorstenjankowski/Fundamento/marken/<marke>/eksporto/projekcioj/vitrino/index.html"
```

Das Figma-Plugin: `/Users/thorstenjankowski/Fundamento/marken/<marke>/eksporto/projekcioj/figma/plugin/manifest.json` in Figma über Plugins → Development → Import plugin from manifest.

Die Daten des Kreilo: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/metiejo/data/kreilo.json`.

**Tests:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/metiejo exec vitest run src/kreilo src/asistanto src/enportilo
```

## S4 – Weg C: Recherche-Agent

**Branch:** `261029-spec-033-s4-weg-c` (auf S3) · **Datum:** 2026-10-29 · **Stand:** gebaut, Abnahme offen.

### Zusammenfassung

1. **Recherche-Agent** (`packages/metiejo/src/esploro/esploro.ts`).
   - Das Sprachmodell wählt nur, welche öffentlichen Seiten gelesen werden: die Website der genannten Marke (aus seinem Wissen oder aus der Adresse, die die Person angibt), dazu höchstens zwei Presse- oder Markenseiten aus den Links, die die Startseite nennt.
   - Lesen und Messen macht der Enportilo aus S2: Farben, Schriften, Radien und Abstände, jeweils mit URL und Zeile. Der Agent setzt keinen Wert und übernimmt keine Texte, Bilder oder Dateien; das ist **Beobachtung** nach Art. V.
   - Seine Werkzeuge: `lies_seite` (eine Seite mit ihren Stylesheets; gibt die Presse- und Markenseiten derselben Website zurück) und `trovoj` (was bisher gefunden ist).
2. **Nur öffentliche Adressen:** `http`/`https` mit einem Hostnamen, der einen Punkt hat. Ausgeschlossen sind `localhost`, `.local`, `.internal`, private, Loopback- und Link-Local-Netze (IPv4 und IPv6) und andere Protokolle. Es werden **höchstens sechs Seiten** gelesen; eine abgelehnte Adresse steht im Ergebnis und in der Kroniko.
3. **Ohne Sprachmodell** liest die Recherche eine angegebene Adresse samt der verlinkten Presse- und Markenseiten. Ohne Adresse und ohne Modell sagt ein Satz, was fehlt.
4. **Amendment v2.5:**
   - Die **Bestätigung** kommt zu Beginn; ohne sie startet der Agent nicht (409).
   - Nennung (Name, Adresse), Bestätigung, jeder Vorschlag und der Zug des Agenten (Tokens, gelesene und abgelehnte Seiten) stehen in der Kroniko.
   - Der **Hinweis vor dem Export** nennt die fremde Marke und dass das Ergebnis **lokal** bleibt und nicht veröffentlicht wird. Er steht auf „Fertig“, im Studio und beim Export in der Kroniko, und das gilt für jede Marke mit fremder Basis, also auch für Weg B.
5. **Im Assistenten:** der Abschnitt „Bestehende Marke nur genannt (Recherche)“ mit Name, Adresse (optional), Bestätigung und „Recherchieren“. Die Vorschläge erscheinen wie in Weg B mit Herkunft im Schritt; „Vorschlag übernehmen“ legt sie über den Entwurf.

### Entwurfsentscheidungen

#### D-13 Das Modell wählt Seiten, nicht Werte
Die Rolle des Sprachmodells ist die Auswahl: Welche Seite gehört zur genannten Marke, welche Unterseite ist eine Presse- oder Markenseite. Werte entstehen nur aus Messungen des Enportilo, mit Herkunft. So bleibt die Regel „nie Rohwerte an den Reglern vorbei“ auch in Weg C erhalten.

#### D-14 Keine Websuche
Der Werkzeugkasten hat keine Suchmaschine; die `.env` nennt keinen Such-Dienst. Der Agent nennt die Adresse aus seinem Wissen, oder die Person gibt sie an. Eine Suche wäre ein neuer Anbieter mit eigenem Schlüssel und eigenen Kosten (O-8).

#### D-15 Schutz vor lokalen Adressen
Die Adresse kommt vom Modell, also von außen; der Agent liest deshalb nichts im lokalen oder privaten Netz (SSRF). Geprüft werden Protokoll, Hostname und IP-Literale. Ein Hostname, der erst über DNS auf eine private Adresse zeigt, ist nicht abgefangen (B-10).

### Probeläufe

**Abnahme 3** am 2026-10-29 mit `mistral/ministral-14b-2512`, Kostengrenze 30 000 Tokens, Wegwerf-Marke in einem temporären Ordner. Genannt war nur „Wikipedia“, eine offene und bekannte Marke. Gemessene Werte der genannten Marke stehen nach Art. V nicht im Repo, nur Seiten, Zahlen und Aufwand.

| Was | Ergebnis |
|---|---|
| gelesene Seiten (vom Agenten gewählt) | `https://www.wikipedia.org/`, `https://foundation.wikimedia.org/` |
| abgelehnte Adressen | keine |
| Vorschläge | 6 Schritte (Leitfarbe, Neutraltöne, Statusfarben, Schrift, Form, Raum), je mit URL und Zeile |
| Kroniko | `kreo fremda konfirmo` + 6 × `propono` + `babilo` |
| Hinweis vor dem Export | nennt „Wikipedia“ und „lokal“ |
| **Dauer** | **5,6 s** |
| **Tokens** / Anfragen | **1 521** (1 397 + 124) / 3 |
| **Kosten** | ≈ **0,0003 $** (0,20 $ je Mio. Tokens, B-3) |

Kein Schlüssel stand in Kroniko oder Log.

### Abweichungen

1. **Keine Websuche** (D-14): Die Spec sagt „sucht öffentliche Quellen“. Der Agent findet sie aus seinem Wissen, aus der angegebenen Adresse und aus den Links der Startseite.
2. **Hinweis für jede fremde Basis:** Den Satz „Das Ergebnis bleibt lokal“ bekommt jede Marke mit fremder Basis (Nennung, Upload, Link), nicht nur Weg C.

### Befunde / Mankoj

- **B-10 DNS-Rebinding** (D-15): Ein öffentlicher Hostname, der auf eine private Adresse auflöst, wird nicht erkannt. Für einen Server, der nur auf dem eigenen Rechner läuft, ist das Risiko gering; für den späteren Betrieb als Dienst (Spec zur Delegation) gehört eine Prüfung nach der Namensauflösung dazu.

### Offen (für den Maintainer)

- **O-8 Websuche** (D-14): ein Such-Dienst als Werkzeug des Agenten, mit eigenem Schlüssel in der `.env`? Vorschlag: erst, wenn Weg C ohne Adresse zu oft daneben liegt.

### Messanleitung

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm install && pnpm build
pnpm fm metiejo --open
```

1. Eine Marke anlegen, `http://localhost:7301/asistanto/<marke>/gvidkoloro` öffnen und „Bestehende Marke nur genannt (Recherche)“ aufklappen.
2. Einen Namen eingeben, ohne Kästchen „Recherchieren“: Die Meldung bittet um die Bestätigung. Mit Kästchen: Nach einigen Sekunden nennt die Meldung die gelesenen Seiten; die Schritte zeigen „Vorschlag aus deinem Material“ mit URL und Zeile.
3. Ohne Sprachmodell in der `.env`: mit Adresse liest die Recherche diese Adresse; ohne Adresse sagt sie, was fehlt.
4. `http://localhost:7301/marko/<marke>/fertig`: Der Hinweis nennt die Marke und „Das Ergebnis bleibt lokal und wird nicht veröffentlicht.“
5. Die Kroniko: `file:///Users/thorstenjankowski/Fundamento/marken/<marke>/kroniko.jsonl` mit `fremda` (`kiel: nennung`), `konfirmo`, `propono` und `babilo` (Tokens, Seiten).

**Tests:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/metiejo exec vitest run src/esploro src/enportilo
```

## S5 – Sprache: Voxtral, Browser als Rückfall

**Branch:** `261029-spec-033-s5-sprache` (auf S4) · **Datum:** 2026-10-29 · **Stand:** gebaut, Abnahme offen.

### Zusammenfassung

1. **Transkription** (`packages/metiejo/src/parolo/parolo.ts`).
   - Voxtral mit dem genauen Modellnamen aus dem Konto des Maintainers: `voxtral-mini-transcribe-3-0`.
   - Die Aufnahme geht als multipart an `/audio/transcriptions` von Mistral, Sprache `de`.
   - Der Schlüssel steht nur im Header `authorization`. Eine Fehlermeldung des Anbieters wird geschwärzt, bevor sie weitergeht.
2. **Server:** `POST /api/marko/<marke>/parolo` nimmt die Aufnahme (Base64, MIME-Typ, Schritt).
   - Der Server transkribiert sie und führt mit dem Text denselben Chat-Zug wie beim Tippen, also nur über die Werkzeuge.
   - In der Kroniko steht der Zug mit der Quelle **`parolo`**, dazu die Transkription (Modell, Millisekunden, Sekunden Audio).
   - Der Schlüssel geht nie an den Browser.
3. **Rückfall Browser:** Ohne `MISTRAL_API_KEY` erkennt der Browser die Sprache selbst über die **Web Speech API** (`SpeechRecognition`), wo er das kann.
   - Der erkannte Text geht an den Chat, mit derselben Quelle `parolo`.
   - Ohne Voxtral sagt die Route in einem Satz, dass `MISTRAL_API_KEY` fehlt und der Browser übernimmt.
4. **Im Assistenten:** Neben dem Chat gibt es den Knopf „Sprechen“ und den Schalter „Antworten vorlesen“ (`speechSynthesis` des Browsers). Eine Zeile nennt den Weg der Sprache, Voxtral auf dem lokalen Server oder den Browser.
5. **Antworten ohne Änderung** (Befund des Probelaufs, B-11): Behauptet das Modell eine Änderung, ohne dass ein Werkzeug etwas gesetzt hat, erinnert der Zug es einmal daran. Daraufhin ruft es das Werkzeug auf oder sagt, dass nichts geändert ist. Bleibt es bei der Behauptung, beginnt die Antwort mit „Es wurde nichts geändert.“ Dazu kommt Regel 6 im Systemtext. Das gilt für Tippen und Sprechen.

### Entwurfsentscheidungen

#### D-16 Sprache ist nur ein anderer Weg zum selben Chat-Zug
Die Transkription ergibt Text. Danach läuft alles wie beim Tippen: Werkzeuge, Budget, 429-Wartezeiten, Kroniko. Es gibt keinen eigenen Pfad, an dem ein gesprochener Wert an den Reglern vorbeikäme. `chatTurn` in `servilo.ts` ist dafür aus der Chat-Route herausgezogen.

#### D-17 Voxtral über den Schlüssel, nicht über `FM_KI_ANBIETER`
Die Transkription nimmt `MISTRAL_API_KEY`, gleich welcher Anbieter für den Chat eingestellt ist. Der Chat kann also über OpenRouter `:free` laufen und die Sprache über Voxtral. Das Modell ist fest (`PAROLO_MODELO`) und nicht über die `.env` wählbar, damit kein teureres Modell hineinrutscht.

#### D-18 Ehrliche Antwort statt Vertrauen
Ob sich etwas geändert hat, bestimmen allein die Werkzeuge (`sxangxoj`), nicht der Text des Modells. Erkannt werden Behauptungen wie „habe … erhöht“, „wurde … gesetzt“, „ist jetzt“, auch mit Dezimalpunkt dazwischen. Ein Satz, der sagt, dass nichts geändert wurde, zählt nicht als Behauptung. Die Erinnerung kostet höchstens eine Anfrage mehr und läuft unter derselben Kostengrenze.

### Probeläufe

**Abnahme 4 (Sprache)** am 2026-10-29: ein Satz, mit `say -v Anna` als WAV erzeugt (54 618 Bytes, 1 s), gesprochen an eine Wegwerf-Marke im temporären Ordner. Transkription mit `mistral/voxtral-mini-transcribe-3-0`, Chat mit `mistral/ministral-14b-2512` (die `.env` nennt `mistral-large-latest`, der Probelauf hat das überschrieben), Kostengrenze 30 000 Tokens.

| Was | Lauf 1 | Lauf 2 (nach B-11) |
|---|---|---|
| Transkript | „Mach die Ecken etwas runder.“ (richtig) | „Mach die Ecken etwas runder.“ (richtig) |
| Voxtral | 462 ms, 1 s Audio | 436 ms, 1 s Audio |
| Werkzeuge | nur `regler` (lesen) | `regler`, `setze_regler` |
| Geändert | **nichts**, die Antwort behauptete aber „Radius von 1 auf 1,5 erhöht“ → B-11 | `formo` (Radius 1,5), die Antwort stimmt |
| Kroniko | `babilo` mit Quelle `parolo` und Transkription | ebenso |
| **Dauer** (Aufnahme bis Antwort) | **4,7 s** | **10,6 s** |
| **Tokens** / Anfragen (Chat) | **2 558** (2 490 + 68) / 2 | **4 013** (3 942 + 71) / 3 |
| **Kosten** Chat | ≈ **0,0005 $** | ≈ **0,0008 $** (0,20 $ je Mio. Tokens, B-3) |
| **Kosten** Voxtral | 1 s Audio, Preis je Minute nicht geprüft (B-12) | ebenso |

Kein Schlüssel stand in Kroniko oder Log. In Lauf 2 rief das Modell `setze_regler` von sich aus auf, die Erinnerung war nicht nötig. Dass sie greift, zeigen die Tests mit einem gescripteten Modell.

### Abweichungen

1. **Vorlesen nur über den Browser:** Die Spec nennt Sprache „ein und aus“. Antworten liest `speechSynthesis` des Browsers vor. Eine Sprachausgabe über einen Anbieter (Text-to-Speech) wäre ein weiteres Modell mit eigenen Kosten; dafür gibt es keine Freigabe.
2. **Ehrliche Antwort (B-11)** kam als Befund aus dem Probelauf dazu und gilt auch für den getippten Chat.

### Befunde / Mankoj

- **B-11 Behauptete Änderung ohne Werkzeug** (Lauf 1): `ministral-14b-2512` las den Bereich des Reglers und antwortete, es habe den Radius erhöht, ohne `setze_regler` aufzurufen. Die Werkzeuge haben nichts geändert, die Regel „nie Rohwerte an den Reglern vorbei“ war also nicht verletzt; falsch war nur die Antwort. Behoben ist das mit D-18, die Tests kamen zuerst.
- **B-12 Preis von Voxtral:** Der Preis je Minute für `voxtral-mini-transcribe-3-0` ist auf der Seite von Mistral nicht geprüft. Bei 1 s je Satz ist er klein. In S6 kommt er als Datum mit Preis in die Preisdaten.
- Die Web Speech API gibt es nicht in jedem Browser (Firefox hat keine Erkennung). Dort meldet „Sprechen“ ohne `MISTRAL_API_KEY`: „Dieser Browser erkennt keine Sprache. Schreib deinen Wunsch oder setze MISTRAL_API_KEY für Voxtral.“

### Offen (für den Maintainer)

- keine neuen Punkte.

### Messanleitung

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm install && pnpm build
pnpm fm metiejo --open
```

1. Eine Marke anlegen und `http://localhost:7301/asistanto/<marke>/formo` öffnen. Unter dem Chat stehen „Sprechen“ und „Antworten vorlesen“. Die Zeile darunter nennt „Voxtral (mistral/voxtral-mini-transcribe-3-0) auf dem lokalen Server“, wenn `MISTRAL_API_KEY` in der `.env` steht, sonst den Browser.
2. „Sprechen“ drücken, „Mach die Ecken etwas runder“ sagen, noch einmal drücken. Der Text erscheint im Chat, die Antwort darunter, die Vorschau wird runder.
3. „Antworten vorlesen“ einschalten und noch einen Satz sagen. Der Browser liest die Antwort vor.
4. Ohne `MISTRAL_API_KEY` (Zeile in der `.env` auskommentieren, Server neu starten): In Chrome oder Safari erkennt der Browser die Sprache selbst.
5. Die Kroniko: `file:///Users/thorstenjankowski/Fundamento/marken/<marke>/kroniko.jsonl`. Der Zug hat `"fonto":"parolo"` und unter `detaloj.transkribo` Modell, Millisekunden und Sekunden.

**Tests:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/metiejo exec vitest run src/parolo src/asistanto
```

## S6 – Schätzung und Zähler für Zeit und Kosten

**Branch:** `261029-spec-033-s6-schaetzung` (auf S5) · **Datum:** 2026-10-29 · **Stand:** gebaut, Abnahme 5 gemessen.

### Zusammenfassung

1. **Preise als Daten** (`packages/metiejo/data/prezoj.json`). Jeder Preis hat das Datum, an dem er gelesen wurde, und die Seite. Gelesen am 2026-10-29 auf [docs.mistral.ai/inference/pricing](https://docs.mistral.ai/inference/pricing):
   - `mistral/ministral-14b-2512`: 0,20 $ je Mio. Tokens Ein- und Ausgabe. Damit ist B-3 geprüft.
   - `mistral/voxtral-mini-transcribe-3-0`: 0,0035 $ je Minute. Damit ist B-12 geprüft.
   - `openrouter/*:free`: 0 $.

   Ein Modell ohne Eintrag hat keinen Preis. Zähler und Schätzung sagen dann „Kosten unbekannt (kein Preis für …)“ und zählen es nicht als kostenlos.
2. **Schätzung vor dem Start, je Weg und Modell** (`packages/metiejo/src/takso/takso.ts`). Sie nennt Dauer, Tokens und Kosten in $ und stützt sich auf gemessene Durchschnitte, in dieser Reihenfolge:
   1. **Protokoll:** der Median der Züge dieser Art mit diesem Modell aus der Kroniko aller Marken, sobald es welche gibt;
   2. **Nordstern:** Für ein anderes Modell skaliert das Tempo aus den Läufen der Nordstern-Kennzahl (`.fundamento/nordstelo/<lauf>/`, ms je Anfrage) die Dauer der Startwerte. Die Tokens folgen den Prompts des Assistenten, nicht dem Modell;
   3. **Startwerte** aus den Probeläufen S1 bis S5 (`packages/metiejo/data/takso.json`), je Zug mit Quelle.

   Ein Weg ist die Summe seiner Züge und der lokalen Zeit: Weg A sind zwei Chat-Züge plus Kreilo, Freigaben, Export und Projektionen; Weg B sind zwei Materialien ohne Modell; Weg C ist eine Recherche. Den Zug, in dem das Modell die Leitfarbe wählt (nur ohne festgelegte Farbe und ohne Inspiration), nennt die Schätzung getrennt.
3. **Wo die Schätzung steht:** `GET /api/marko/<marke>/takso`.
   - Auf den Einstiegsfragen (Weg A und der Zug, in dem das Modell die Leitfarbe wählt).
   - Beim Material (je Datei).
   - Bei der Recherche.
   - Im Chat („Schätzung je Wunsch“ und, mit Voxtral, gesprochen).
4. **Zähler während der Arbeit:** Der Zähler summiert die Kroniko der Marke: Tokens, Kosten in $, die Zeit des Sprachmodells (mit Transkription), Anfragen und Wartezeiten nach 429.
   - Er steht im Assistenten neben dem Modell und kommt mit jeder Antwort neu.
   - Er bleibt über einen Neustart des Servers erhalten; S1 hatte nur eine Summe im Speicher.
5. **Grenzen der Anbieter:** Der Torwächter der Nordstelo (`Pordisto`, `LIMOJ`) liegt jetzt in der Metiejo (`src/asistanto/limoj.ts`); die Nordstelo exportiert ihn weiter, wie `ki.ts` seit S1.
   - `pnpm fm metiejo` gibt die Grenzen des Anbieters aus der `.env` mit: Mistral 0,5 Anfragen je Sekunde, OpenRouter 1 000 je UTC-Tag.
   - Die Anfragen des Tages stehen in `marken/.anfragoj.json`.
   - Am Tageslimit hält der Zug mit einem Satz an (429).
   - Nach einer 429-Antwort wartet der Assistent wie bisher; neu ist die Meldung „Der Anbieter hat gebremst (429): N× gewartet“.
   - Kreilo- und Recherche-Zug tragen in der Kroniko `vojo` A bzw. C.

### Entwurfsentscheidungen

#### D-19 Tokens aus unseren Prompts, Zeit aus dem Modell
Wie viele Tokens ein Zug braucht, hängt vor allem an Systemtext, Werkzeugen und Verlauf des Assistenten; das messen die Probeläufe und später die Kroniko. Die Nordstern-Läufe haben ganz andere Prompts (Gvidanto, Seiten bauen), taugen also nicht für Tokens, wohl aber für das Verhältnis der Geschwindigkeit zweier Modelle (ministral 8,3 s, gpt-4.1-mini 2,1 s, nemotron `:free` 19,1 s je Anfrage).

#### D-20 Der Zähler liest die Kroniko
Die Kroniko hält jeden Zug mit Modell und Kosten fest. Liest der Zähler sie, stimmen Zähler und Protokoll immer überein, auch nach einem Neustart und für Züge aus Kreilo, Recherche und Sprache.

#### D-21 Grenzen nur, wenn sie gesetzt sind
Der Server bekommt `ki.limoj` von `start.ts`. Tests ohne Grenzen laufen ohne Wartezeit; der Probelauf und `pnpm fm metiejo` laufen mit den Grenzen des Anbieters.

### Probeläufe

**Abnahme 5** am 2026-10-29 mit `mistral/ministral-14b-2512`, Kostengrenze 30 000 Tokens je Zug, Grenze 0,5 Anfragen je Sekunde, Wegwerf-Marke in einem temporären Ordner. Der Ablauf ist derselbe wie in Abnahme 1: fünf Sätze, zwei synthetische Inspirationsbilder, zwei Wünsche, zwölf Freigaben, Export und Projektionen. Die Schätzung wurde vor dem Start vom Server geholt.

| | Schätzung vor dem Start | gemessen | Verhältnis |
|---|---|---|---|
| **Dauer** | 27,7 s | 51,2 s (Modell 11 s, lokal 40,2 s) | **0,54** |
| **Tokens** | 7 908 (7 758 + 150) | 7 098 (6 936 + 162) | **1,11** |
| Anfragen | 6 | 5 | 1,2 |
| **Kosten** | 0,0016 $ | 0,0014 $ | **1,11** |
| Grundlage | Probeläufe vom 29.10.2026 | Zähler: „bisher 7 098 Tokens · 0,0014 $ · 11 s · 5 Anfragen“ | |

**Alle drei liegen im Bereich ±50 %.** Die Dauer liegt knapp darin. Die Modellzeit traf gut (11,7 s geschätzt, 11 s gemessen). Daneben lag die lokale Zeit: 40,2 s statt 16,0 s in Abnahme 1, vor allem Export und `fm projekcioj build` auf einem ausgelasteten Rechner (B-13).

Nach der Messung nehmen die Startwerte für die lokale Zeit das Mittel beider Läufe, 28 s. Weg A wird damit auf 39,7 s geschätzt, das liegt bei 1,10 von Abnahme 1 und 0,78 von Abnahme 5. Mit der Grenze von 0,5 Anfragen je Sekunde gab es keine 429; in Abnahme 1 waren es ohne die Grenze 2.

Zum Vergleich hat der Server, ohne Lauf, Weg A für `openrouter/nvidia/nemotron-3-ultra-550b-a55b:free` geschätzt: ≈ 43 s, ≈ 7 900 Tokens, 0 $, Tempo aus den Nordstern-Läufen. Gemessen ist das nicht.

Kein Schlüssel stand in Kroniko oder Log. Kosten der Probeläufe dieser Stufe: 7 098 Tokens ≈ 0,0014 $.

### Abweichungen

1. **Lokale Zeit nur aus Probeläufen:** Die Spec nennt als spätere Grundlage das Protokoll. Für die Züge des Modells gilt das, die lokale Zeit eines Wegs (Freigaben, Export, Projektionen) steht aber nicht in der Kroniko und bleibt ein Startwert (B-13).
2. **Zeit im Zähler ist die des Sprachmodells** mit Transkription, nicht die Zeit, die die Person im Assistenten verbringt.

### Befunde / Mankoj

- **B-3 und B-12 geprüft:** Beide Preise stehen auf der Preisseite von Mistral (siehe oben).
- **B-13 Lokale Zeit streut:** 16,0 s und 40,2 s für denselben Ablauf. Die Schätzung der Dauer von Weg A hängt deshalb mehr am Rechner als am Modell. Vorschlag: Der Export hält seine Dauer in der Kroniko fest, dann kann auch die lokale Zeit aus dem Protokoll kommen.

### Offen (für den Maintainer)

- **O-9 Weitere Preise:** `prezoj.json` kennt nur die Modelle, die die Probeläufe nutzen. Für `openai/gpt-4.1-mini` oder `mistral/mistral-large-latest` (in der `.env`) nennt der Zähler „Kosten unbekannt“, bis ein Preis mit Datum und Seite eingetragen ist.

### Messanleitung

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm install && pnpm build
pnpm fm metiejo --open
```

1. Eine Marke anlegen und `http://localhost:7301/asistanto/<marke>/komenco` öffnen. Über „Vorschlag machen“ stehen die Schätzung für Weg A und für den Zug, in dem das Modell die Leitfarbe wählt, jeweils mit Dauer, Tokens, $ und Grundlage.
2. `http://localhost:7301/asistanto/<marke>/gvidkoloro`: Neben dem Modell steht der Zähler („bisher … Tokens · … $ · … s · … Anfragen“). Unter dem Chat steht „Schätzung je Wunsch ≈ …“, bei Material und Recherche die eigene Schätzung.
3. Einen Wunsch schreiben. Der Zähler wächst mit der Antwort. Nach einem Neustart von `pnpm fm metiejo` steht derselbe Stand da.
4. Die Schätzung als Daten: `http://localhost:7301/api/marko/<marke>/takso`.
5. Preise und Startwerte: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/metiejo/data/prezoj.json` und `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/metiejo/data/takso.json`.
6. Die Anfragen des Tages: `file:///Users/thorstenjankowski/Fundamento/marken/.anfragoj.json`.

**Tests:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/metiejo exec vitest run src/takso
pnpm --filter @fundamento/nordstelo exec vitest run
```
