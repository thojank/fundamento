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
