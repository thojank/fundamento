# Spec 024 – Studio: jeder Aspekt jeder Komponente je Marke – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-21, unverändert kopiert; SHA-256 `89c68df8…e57558`) · **Basis:** `main` nach #98 (`ec17396`) · **Regel 0** gilt: der Weg, den das Repo schon geht (Art. XI), sonst die kleinste Änderung mit Eintrag hier; keine neuen Tokens, keine neuen Eroj, keine neue Regulo-Semantik, keine Constitution in dieser Runde (das Amendment v2.3 ist Runde 2); nie eine Grenze aufweichen, um grün zu werden. **Clean Room (§ 8, Art. V):** kein fremder Style-Guide wurde gesucht oder geöffnet; Grundlage ist allein die Spec.

Drei Runden: ① Runde 1 (dieser Plan: K-1 bis K-6, Studio-Rahmen, Grundlagen und Semantik, Raster-Vorschlag, Anzeigenamen, Aspiroj „nur verschärfen“, Schnellstart und Studio auf denselben Daten), ② Runde 2 (Amendment v2.3, Ero-Tokens, Komponentenseiten), ③ Runde 3 (Quellen, KI, Fluss).

## ① Runde 1

**Branch:** `261022-spec-024-runde-1-145b74` (von `main` `ec17396`) · **Datum:** 2026-10-22 · **Stand:** zur Abnahme. Der Maintainer entscheidet das Palettenraster (unten, Raster-Vorschlag).

### Zusammenfassung

1. **K-1 bis K-6 im Schnellstart:** K-1 der Name wird angenommen, wie er geschrieben wird („Bluna“, „Über Größe & Co.“); die Kennung (`bluna`, `ueber-groesse-co`) leitet `identOf` ab und zeigt sie beim Tippen klein unter dem Feld; der geschriebene Name steht in der Agordo als `etikedoj.marko` und jeder Bildschirm sagt „Marke Bluna (bluna)“. K-2 die Fehlermeldung des Starts verschwindet, sobald die Eingabe eine Kennung ergibt. K-3 die Schriftsuche fragt beim Tippen (`GET /api/marko/<name>/tiparoj?q=`) und zeigt die Treffer ohne Enter. K-4 ohne Treffer steht der Satz „Keine Schrift gefunden für „…“: Versuche einen Teil des Namens, zum Beispiel „Sans“ oder „Serif“, oder lade eine eigene Schrift hoch.“ K-5 die Form ist eine Wahl aus vier (eckig 0, leicht 0,5, rund 1, ganz rund 2 als Faktor `form.radius`); „ganz rund“ setzt dazu `radius.role.control` auf `radius.full` (die Bedienelemente werden zur Pille), die Flächenrolle bleibt groß gerundet. K-6 die Ursache: Enter im Suchfeld schickte das Formular mit leerem `tiparo` an den nächsten Schritt statt an die Suche; jetzt sucht Enter, und eine gewählte Schrift (Prata, OFL, im Katalog) wird übernommen (Test und im Browser bestätigt). Dazu fragt die Vorschau nur die Schnitte an, die das Paket hat (Prata: nur 400; der Katalog trägt jetzt `weights`).
2. **Dieselben Daten (M-6):** Schnellstart und Studio arbeiten auf dem einen Entwurf einer Marke (Agordo + die daraus abgeleitete Aspekto). Was das Studio setzt, steht in der Agordo in `festgelegt` (Token → `wert` oder `alias`, je Dimensio-Bedingung in `modoj`), Anzeigenamen in `etikedoj` (Modelo-Schema, `$defs/Agordo`, `$defs/AgordoFestgelegt`; `aspekto.json#/etikedoj`). Die Ableitung (`fm agordilo derive`, Werkstatt, Metiejo) schreibt einen gesetzten Wert, wo sie sonst ableiten würde, einen Alias, wo die Marke eine Rolle umbelegt, und einen Wert je Dimensio in den Konjunktions-Set der Marke zu dieser Bedingung (`aspekto/<name>+viewport/compact` …, mit `$type`, in `$themes.json`). Der Bericht markiert eine gesetzte Stufe (`gesetzt`). Gleiche Agordo, gleiche Bytes.
3. **Das Studio** (`/studio/<name>/<seite>`): links die Navigation (Farbe, Schrift, Raum, Form, Tiefe, Bewegung, Semantik, Schnellstart), in der Mitte die Live-Vorschau mit den Umschaltern hell/dunkel, Dichte, Kontrast und Viewport, rechts die Eigenschaften der Seite; Kopfzeile mit Marke, Prüfung (Zahl der Probleme) und Speichern. Jede Zeile ist ein Token des Modelo mit dem Entwurf komponiert: Wert in der gewählten Kombination, Herkunft (Struktur, abgeleitet, gesetzt), Alias mit seinen Kandidaten, bei Farben OKLCH und Kontrast gegen Hell und Dunkel, bei Rollen und Stufen der Wert in dunkel, bei Schriftgrößen der Wert je Viewport, bei Bewegung der Wert bei reduzierter Bewegung. Gebaut aus `fm-sxelo`, `fm-navigado`, `fm-pagxo`, `fm-formularo`, `fm-faldilo`, `fm-elektilo`, `fm-elekto`, `fm-kampo`, `fm-tekstareo`, `fm-insigno`, `fm-teksto`, `fm-butono`.
4. **Grundlagen vollständig (§ 4):** Farbe – die sieben Paletten (sechs plus `shade`) mit Anzeigename, je Stufe Wert (Hex, OKLCH), Kontrast gegen Hell und Dunkel, Herkunft, Wert hell und dunkel setzbar, Zurücksetzen je Stufe; „Aus Leitfarbe neu ableiten“ ist der Dauerzustand: die Ableitung trägt jede nicht gesetzte Stufe, eine gesetzte bleibt, bis sie zurückgesetzt wird (D-04). Schrift – die drei Familien, je Schriftstil Größe (je Viewport als Stufe der Skala), Stärke, Zeilenhöhe, Laufweite, dazu die Zusammensetzung der Stile zum Lesen; die Typo-Leiter als Vorschau. Raum – Abstandsskala, benannte Abstände, Höhen der Bedienelemente, Größenskala, Raster und Container. Form – Radien bis `radius.full`, Radius je Rolle, Rahmenstärken je Skala und Rolle, Fokusring. Tiefe – Schatten (als Zusammensetzung), Ebenen, Schattenfarben, Deckkraft. Bewegung – Dauern, Dauer je Rolle, Kurven, Kurve je Rolle, je mit dem Wert bei reduzierter Bewegung.
5. **Semantik (§ 4):** je Rolle (Text, Flächen, Rahmen, Aktionen, Status, Fokus, Navigation, Links, Marke, Abdunklung) und Zustand die Palettenstufe, die sie nutzt, hell und dunkel, als Wahl aus allen Stufen, dazu ein Anzeigename. Nach jeder Änderung läuft die Prüfung; die betroffenen Reguloj stehen unter der Seite und die Zahl der Probleme in der Kopfzeile.
6. **Grenzen (§ 5, M-5):** Ein Wert, der eine feste Regel bricht (oder das Schema), wird nicht übernommen: Antwort 409 mit einem Satz (Klartext aus `satzOf`) und einem Vorschlag; das Bedienelement zeigt wieder den Wert, der gilt. Eine anpassbare Regel wird übernommen und braucht ein Jugxo wie heute. Kein neuer Prop, keine Achse, kein Zustand: das Studio kennt nur Tokens.
7. **Aspiroj „nur verschärfen“ (§ 3 B, S-2):** die Regel `aspiro-loosens-regulo` im Modelo: ein Aspiro, dessen Metrik eine Regulo mit `sojlo` misst (`wcag2-reserve` → `contrast-reserve`, `oklch-l-step-consistency` → `palette-even`, `oklch-l-align` → `palette-aligned`, `type-scale-consistency` → `type-scale`), darf deren Schranke nur verschärfen; ein `min` darunter oder ein `max` darüber ist ein Fehler mit beiden Schranken im Satz. Ein Aspiro, der nur die andere Schranke nennt, lockert nichts.
8. **Raster-Vorschlag** (unten): gemessen, nicht geändert – die Entscheidung liegt beim Maintainer.
9. **Kleinste Änderungen daneben:** `RULE_IDS` +1 (178), der Zähler in `contracts.test.ts`; `RaportoStep.gesetzt`; der Katalog der Webfonts trägt `weights`; README (Abschnitt „Studio“), Vojmapo (8a''').

### Constitutional Compliance Review

- **Art. I (Modelo-First):** konform. Nichts wird von Hand in eine Projekcio geschrieben; das Studio ändert die Agordo, die Ableitung schreibt das Paket, die Projekcioj folgen. `festgelegt` und `etikedoj` sind Einträge des Modelo-Schemas.
- **Art. II (Unu Vortaro):** konform. Anzeigenamen (`etikedoj`) sind Beschriftungen; die kanonischen Namen bleiben in Sets, CSS, Figma und Code (§ 3 B). Kein Bezeichner wird vereinbart, keiner erfunden.
- **Art. III (Maschinenlesbarkeit):** konform. Alles, was das Studio zeigt, kommt aus `resolveCombination` über das komponierte Modelo und dem Bericht der Ableitung; `preview_agordo` des Gvidanto liest dieselbe Agordo (mit `festgelegt`). Kein neues MCP-Werkzeug in Runde 1 (Runde 3).
- **Art. IV (Multmarkeco):** konform. Ein Alias zählt als Belegung; ein gesetzter Wert steht im Set der Marke, ein Wert je Dimensio im Konjunktions-Set der Marke; `aspekto-complete` bleibt erfüllt (Test: die Ableitung mit `festgelegt` besteht alle Prüfungen).
- **Art. V (Clean Room):** konform. Kein fremder Style-Guide wurde geöffnet; der Katalog der Webfonts ist Fontsource mit Herkunft; keine Namen oder Werte aus fremden Systemen.
- **Art. VI (Regularo kun Kialoj):** konform. Keine neue Regulo mit Semantik; `aspiro-loosens-regulo` ist eine Prüfung der Aspiroj gegen vorhandene Schranken, mit Satz und Vorschlag. Feste Regeln bleiben im Studio unantastbar (M-5); anpassbare brauchen ein Jugxo. Was fehlt, steht als Manko-Kandidat unten.
- **Art. VII (Agenta Dokumentado, Herkunft):** konform. Jeder Wert trägt seine Herkunft (Struktur, abgeleitet, gesetzt) im Studio; die Agordo reist mit dem Paket als Ursprung; Webfonts tragen `herkunto.json`.
- **Art. VIII (Web-first, mobiles Modell):** konform. `festgelegt` nimmt DTCG-Werte und Aliasse, keine CSS-Eigenschaften; die Dimensio-Bedingungen sind die des Modelo (`viewport=compact`).
- **Art. IX (Vertikaler Durchstich):** konform. Keine neue Fähigkeit an Eroj; das Studio nutzt vorhandene Eroj und Sxablonoj.
- **Art. X (Test-first):** konform. Rot in `062e3ec` (Modelo, Agordilo, Metiejo), dann grün; die vier Prüfungen der CI unverändert.
- **Art. XI (Einfachheit):** konform. Kein neues Paket (das Studio liegt in `metiejo`), keine neue Abhängigkeit; die drei Module `studio.ts`, `ident.ts`, die Regel in `aspiroj.ts`.
- **Art. XII (Interoperabilität):** konform. DTCG bleibt das einzige Speicherformat; ein Konjunktions-Set je Dimensio-Bedingung der Marke folgt der Tokens-Studio-Konvention wie `+color-scheme/dark`.
- **Art. XIII (Einfachheit der Nutzung):** konform. Der Schnellstart bleibt der Weg in zehn Minuten (M-1); das Studio ist der Feinschliff dahinter, ein Link hin und zurück. Ein Designer tippt keinen Token-Namen: die Aliasse sind eine Wahl aus Kandidaten.

### Entwurfsentscheidungen

#### D-01 Das Studio liest das komponierte Modelo, nicht die Agordo
Die Zeilen entstehen aus `composeDraft` (die Ableitung ohne Prüfung, 114 ms, dann `composeFiles` und `buildModelo`) und `resolveCombination` je gewählter Kombination. So zeigt das Studio genau, was ein Projekt bekommt – auch die Wirkung der Dimensio-Sets des Kerns –, und die Herkunft folgt aus drei Mengen: `festgelegt` (gesetzt), die Tokens, die die Ableitung schreibt (Paletten, Gestalt, Schriftfamilien: abgeleitet), der Rest (Struktur).

#### D-02 `festgelegt` statt eines zweiten Datenmodells
Die Spec will „Agordo + Aspekto“ als eine Quelle für Schnellstart und Studio. Ein eigenes Speicherformat des Studios hätte zwei Wahrheiten gemacht. `festgelegt` ist ein Feld der Agordo: Token → `{ wert | alias, modoj: { "<dimensio>=<valoro>": { wert | alias } } }`; die Ableitung wendet es als letzten Schritt auf jeden Set an (D-03). Der Schnellstart ändert die Regler und die Leitfarbe, das Studio die Tokens; beides steht in derselben Datei, `historio` zählt beides als Bewegung.

#### D-03 Wo ein gesetzter Wert hingeht
Haupt-Set der Marke: `wert` oder `{alias}`, vor Paletten, Gestalt und Schriften (was das Studio setzt, gewinnt). Dunkel: `modoj["color-scheme=dark"]` in den Konjunktions-Set `+color-scheme/dark`, den die Referenz schon hat. Jede andere Bedingung (`viewport=compact`, `density=compact`, `contrast=high`, `motion=reduced`): ein Set der Marke `aspekto/<name>+<dimensio>/<valoro>` mit typisierten Tokens (`$type` aus dem Kern, weil der neue Set keine Gruppentypen erbt), eigener ID aus dem Lock und Bedingungen; `$themes.json` nimmt ihn über `deriveThemeFragment` auf. Für Schriftgrößen je Viewport nimmt das Studio nur Aliasse auf Skalenstufen – so, wie die Viewport-Sets des Kerns es tun.

#### D-04 Eine gesetzte Palettenstufe bleibt eine Stufe des Berichts
`withFestgelegtSteps` ersetzt in den abgeleiteten Paletten den Schritt: Wert, OKLCH, erreichter Kontrast gegen die Fläche des Modus neu gemessen, `gesetzt: true`; `onTarget` sagt, ob er das Ziel noch trifft. So zeigt der Bericht die Wahrheit, und „Aus Leitfarbe neu ableiten“ ist kein Knopf, sondern die Regel: nur nicht gesetzte Stufen werden abgeleitet.

#### D-05 Ablehnen heißt vorher prüfen
`festlegen` leitet den Kandidaten mit allen Prüfungen ab (1,3 s warm, 3,1 s beim ersten Mal) und vergleicht die Issues mit denen des Entwurfs davor: ein neues Issue einer festen Regel (oder des Schemas) lehnt ab – 409 mit `satzOf` und `vorschlagOf` des Verstoßes – und der Entwurf bleibt, wie er war; ein neues Issue einer anpassbaren Regel wird übernommen und als Problem gezählt. „Betroffen“ sind die Reguloj, deren Verstöße den Token nennen, und die neuen.

#### D-06 Kandidaten eines Alias
Ein Alias darf auf die Stufen derselben Skala zeigen: für eine Palettenstufe auf jede Stufe jeder Palette (eine Rolle wechselt auch die Palette), für `radius.*` auf jeden Radius bis `radius.full`, sonst auf das Präfix des Ziels ohne den letzten Teil (`font.size.scale.*`, `font.weight.*`, `spacing.scale.*`, `size.scale.*`, `motion.duration.scale.*`, `motion.easing.curve.*`, `border.width.scale.*`). Nur Literale sind Kandidaten; Rollen zeigen nicht auf Rollen.

#### D-07 Eine Form als Wahl, die Pille als Alias
K-5 braucht zwei Dinge: den Faktor der Radien (vorhanden, `form.radius`) und die Pille nur für Bedienelemente. Die Rolle `radius.role.control` zeigt im Kern auf `radius.medium`; „ganz rund“ setzt sie auf `radius.full` – als `festgelegt`-Alias, denselben Weg, den das Studio nimmt. `radius.role.surface` bleibt beim Faktor 2 (`radius.large` → 16 px), also groß gerundet, keine Pille. Die Wahl liest sich aus der Agordo zurück (`formWahlOf`).

#### D-08 Die Kennung
`identOf`: Kleinbuchstaben, Umlaute als ae/oe/ue/ss, Akzente entfernt, alles andere zu einem Bindestrich, Ränder bereinigt. Ergibt ein Name keine Kennung („!!!“), bleibt der Start mit dem Satz, der die Kennung erklärt. Der geschriebene Name steht nur in `etikedoj.marko`; die Kennung ist der Name der Aspekto und des Ordners.

#### D-09 Die Suche beim Tippen
200 ms nach dem letzten Zeichen fragt der Browser den Server; die Trefferliste (`fm-elekto`) wird als Ganzes ersetzt, damit das Ero sie neu liest; ohne Treffer bleibt das Suchfeld, und die `fm-avizo` mit dem Satz erscheint (K-4). Enter im Suchfeld sucht serverseitig (K-6); die Wahl plus Weiter übernimmt die Schrift.

#### D-10 Die Umschalter der Kopfzeile sind die Kombination der Seite
Hell/dunkel, Dichte, Kontrast und Viewport sind Abfrageparameter der Studio-Seite: der Server löst die Zeilen für diese Kombination auf und die Vorschau bekommt die `data-fm-*`-Attribute an der Wurzel. So ist jeder Zustand ein Link.

#### D-11 Schatten und Zusammensetzungen als JSON
Für Schatten (Ebenen aus Versatz, Unschärfe, Farbe) und Kurven gibt es kein Ero mit mehreren Maßen; das Studio zeigt sie als Text und nimmt den Wert als DTCG-JSON in einer `fm-tekstareo kind="code"` an. Die Schriftstile (`typography.*`) sind nur zum Lesen: ihre Teile werden über die Rollen gesetzt (Größe, Stärke, Zeilenhöhe, Laufweite). Die Schreibweise (Großbuchstaben) steht in einer Erweiterung des Tokens; sie ist in Runde 1 lesbar, nicht setzbar (Abweichung 3).

#### D-12 Ein Aspiro verschärft nur
Die Reguloj der Spec 004 tragen `sojlo.metric` und `min`/`max`; `boundingRegulo` findet zur Metrik eines Aspiro die Regulo und vergleicht nur die genannte Schranke. Die Prüfung läuft in `aspirojIssues` neben `aspiro-missed`, also in `validateModeloFiles` für jedes Paket.

### Raster-Vorschlag

Gemessen am Vortaro und an der Kalibrierung des Agordilo (`packages/agordilo/data/calibration.json`, Kontrastziele je Stufe gegen die Fläche des Modus):

| Palette | Stufen heute | Ziele hell (WCAG, gegen Weiß) |
|---|---|---|
| neutral | 17: 0, 25, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950, 975, 1000 | 1,00 · 1,07 · 1,16 · 1,27 · 1,39 · 1,53 · 1,87 · 2,57 · 3,79 · 5,51 · 7,77 · 10,86 · 12,68 · 14,59 · 16,45 · 18,10 · 21,00 |
| accent, success, warning, danger, info | 11: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 | accent: 1,16 · 1,27 · 1,53 · 1,86 · 2,57 · 3,78 · 5,50 · 7,76 · 10,87 · 14,61 · 16,46 |

Was üblichen Rastern fehlt, um sie abzubilden: an den Enden der farbigen Paletten. Zwischen Weiß und 50 (Kontrast 1,16) liegt keine Stufe für sehr helle Tönungen (Hintergründe von Hinweisen, Hover auf Weiß); zwischen 100 und 200 fehlt die Stufe für helle Rahmen; am dunklen Ende fehlen die Stufen für Text auf sehr dunklen Flächen und für den tiefsten Grund im Dunkelmodus (die neutrale Palette hat dafür 850, 975 und 1000).

**Vorschlag:** Die farbigen Paletten bekommen die vier Stufen der neutralen Palette, die ihnen fehlen – **25, 150, 850, 975** –, also 15 Stufen je Palette (die neutrale behält 17 mit 0 und 1000). Ziele je Stufe als geometrisches Mittel der Nachbarn, am Rand gegen die Fläche (1,00 bzw. 21): accent hell 25 ≈ 1,08 · 150 ≈ 1,39 · 850 ≈ 12,6 · 975 ≈ 18,1; dunkel spiegelbildlich. Die Stufen, die eine Marke nicht nutzt, belegt die Ableitung (§ 3 B).

**Folgen:** eine Token-Änderung durch Spec, kein Amendment: 24 neue Kern-Tokens (4 Stufen × 6 Paletten, `shade` bleibt), ihre Werte in komuna (gemessen auf der Kalibrierung) und ekzemplo, die Fixtures provo und provo-kompakta neu abgeleitet, `calibration.json` mit den neuen Zielen, die KontrastParoj unverändert (keine Rolle zeigt auf die neuen Stufen, bis eine Spec es will). Das ist ein eigener PR nach der Entscheidung.

### Bildschirmfotos

Aufgenommen am 2026-10-22 in Chromium am Server `pnpm fm metiejo --port 7398` mit der Marke „Bluna“ (Kennung `bluna`, Start „Beispiel komuna“, Schrift Prata, Form ganz rund, Anzeigename „Ozean“ für die Akzentpalette, Stufe accent.700 gesetzt).

**Schnellstart (K-1 bis K-6):**
- K-1/K-2 Start mit dem Namen „Über Größe & Co.“ und der Kennung `ueber-groesse-co` beim Tippen: ![Start mit Kennung](bildoj/schnellstart-start-kennung.png)
- K-3 Suche beim Tippen („prata“, Treffer ohne Enter): ![Schrift suchen](bildoj/schnellstart-schrift-suche.png)
- K-4 ohne Treffer der Satz, was zu tun ist: ![Kein Treffer](bildoj/schnellstart-schrift-kein-treffer.png)
- K-5 Form als Wahl, „ganz rund“: Knöpfe und Felder als Pille, die Karte groß gerundet (Schrift Prata, K-6): ![Form als Wahl](bildoj/schnellstart-form-wahl.png)

**Studio (1440 × 1000):**
- Farbe – Paletten mit Anzeigename „Ozean“, je Stufe Wert, OKLCH, Kontrast hell/dunkel, Herkunft: ![Studio Farbe](bildoj/studio-farbe.png)
- Schrift – Familien, Größe je Viewport, Stärke, Zeilenhöhe, Laufweite, Typo-Leiter: ![Studio Schrift](bildoj/studio-schrift.png) · dunkel und Viewport compact über die Kopfzeile: ![Studio Schrift dunkel compact](bildoj/studio-schrift-dunkel-compact.png)
- Raum: ![Studio Raum](bildoj/studio-raum.png)
- Form: ![Studio Form](bildoj/studio-form.png)
- Tiefe: ![Studio Tiefe](bildoj/studio-tiefe.png)
- Bewegung: ![Studio Bewegung](bildoj/studio-bewegung.png)
- Semantik – je Rolle die Stufe hell und dunkel mit Kandidaten: ![Studio Semantik](bildoj/studio-semantik.png) · ein Wert, der eine feste Regel bricht (Text auf neutral.100), wird abgelehnt – Satz, Vorschlag, das Feld zeigt wieder den Wert, der gilt (M-5): ![Studio Semantik abgelehnt](bildoj/studio-semantik-abgelehnt.png)

### Abweichungen

1. **Der Vorschlag bei einer Ablehnung ist der des Agordilo.** Bei einer umbelegten Rolle sagt er heute „re-pointing a role is the boundary role-remap (ask the maintainer)“ (englisch, aus Spec 016). Ein Vorschlag, der die nächste Stufe nennt, die besteht, braucht je Kandidat eine Ableitung (1,3 s); das ist ein Kandidat für Runde 2 (O-3).
2. **„Aus Leitfarbe neu ableiten“ ist kein Knopf** (D-04): die Ableitung trägt jede nicht gesetzte Stufe immer; eine gesetzte wird je Stufe zurückgesetzt.
3. **Die Schreibweise (Großbuchstaben) der Schriftstile ist lesbar, nicht setzbar** (D-11): sie steht in einer Token-Erweiterung, nicht im Wert; `festgelegt` setzt Werte und Aliasse.
4. **Schatten und Kurven werden als JSON gesetzt** (D-11): kein Ero für zusammengesetzte Maße (Manko-Kandidat B-2).
5. **Eine Schrift für Anzeige und Fließtext** bleibt wie in Spec 023 (O-2 dort); im Studio sind die drei Familien einzeln lesbar, gesetzt werden sie über den Schnellstart und `schriften`.
6. **`shade` ist die siebte Palette** des Studios (die Deckkraftstufen der Schatten), obwohl der Agordilo sechs ableitet: sie gehört zur Struktur und ist setzbar.
7. **Die Prüfung je Änderung dauert 1,3 s** (warm; 3,1 s die erste): das Studio prüft bei jedem Setzen, nicht beim Ziehen – es gibt keine Regler im Studio, jede Änderung ist ein Wert.
8. **Keine Zahl der Ero-Tokens und keine Figma-Variablen in Runde 1:** Ero-Tokens kommen mit dem Amendment in Runde 2; die Figma-Variablen sind unverändert (ein Konjunktions-Set der Marke je Dimensio wird zu Werten derselben Variablen in den Modi, keine neue Variable).

### Befunde / Mankoj

- **B-1 Manko-Kandidat Regler und Farbwähler** (wie Spec 023 B-2): im Studio ist der Farbwähler nativ (`input type=color`), alles andere ein Ero.
- **B-2 Manko-Kandidat zusammengesetzte Maße:** ein Ero für einen Schatten (Versatz, Unschärfe, Farbe) oder eine Kurve fehlt; Schließbedingung: ein Ero mit Feldern je Teil, das Studio setzt es ein.
- **B-3 Die Sxablono `sxelo` legt die Navigation unter den Kopf**, nicht links. Das Studio stellt die `fm-navigado` darum in die Seite (Raster aus drei Spalten); die Region `nav` der `sxelo` bleibt leer. Ein Sxablono „Arbeitsplatz“ mit Seitenleiste ist ein Kandidat für die Sxablonoj-Runde 2.
- **B-4 Der Vorschlag des Agordilo bei einer umbelegten Rolle** (Abweichung 1).
- **B-5 Fontsource trägt die Schnitte je Familie;** Prata hat nur 400, die Vorschau fragte 700 an (404 im Browser). Der Katalog trägt jetzt `weights`, die Vorschau fragt nur vorhandene Schnitte.
- **B-6 Zeiten:** Studio-Seite 75–140 ms, Vorschau-Stylesheet 60 ms, Prüfung je Setzen 1,3 s warm (3,1 s kalt), Speichern mit allen Exporten ≈ 4 s.
- **B-7 Ero-Tokens:** 0 (Runde 2). **Figma-Variablen:** unverändert gegenüber 0.2.0.
- **B-8** Eine gesetzte Stufe mit einem eigenen Wert kann `palette-even`/`palette-aligned` (anpassbar) verletzen; das Studio übernimmt sie und zählt das Problem – das Jugxo trägt die Expertenansicht ein (wie heute).

### Offen (für den Maintainer)

- **O-1 Palettenraster:** der Vorschlag oben (25, 150, 850, 975 für die farbigen Paletten) – Entscheidung des Maintainers, eigener PR.
- **O-2 Die Vorschau im Studio** zeigt je Seite einen festen Ausschnitt (Aktionen, Zustände, Text, Felder, Typo-Leiter, Tiefe); sollen die fünf Sxablonoj dazu?
- **O-3 Vorschlag bei Ablehnung:** die nächste Stufe, die besteht, berechnen (je Kandidat 1,3 s) – in Runde 2?
- **O-4 Schatten als JSON** (Abweichung 4): so lassen, oder Felder je Teil?

### Messanleitung

Alle Befehle im Checkout des Maintainers `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, nach dem Merge dieses PR. Die Einstellungen stehen in `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.env` (`FM_MARKEN_DIR` für den Markenordner, sonst `/Users/thorstenjankowski/Fundamento/marken`; `FM_TIPAROJ_REPO` wie in Spec 023). Die Testmarken der Messlatte (§ 7, nach Runde 2) bleiben in diesem Ordner.

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm install && pnpm build
pnpm fm projekcioj build --out .fundamento/projekcioj   # einmal, für die Expertenansicht
pnpm fm metiejo --open                                   # http://localhost:7301
```

**K-1 bis K-6 (Schnellstart):** http://localhost:7301 – Name „Bluna“ eintippen: die Kennung `bluna` erscheint klein unter dem Feld (K-1); ein Name ohne Buchstaben („!!!“) ergibt den Satz zur Kennung, der verschwindet, sobald der Name eine ergibt (K-2). Im Schritt Schrift „prata“ tippen: Treffer ohne Enter (K-3); „zzzq“ tippen: der Satz, was zu tun ist (K-4); Prata wählen, Weiter: die Vorschau steht in Prata, und `<Markenordner>/bluna/entwurf.json` trägt `schriften.body.family: "Prata"` (K-6). Im Schritt Form „Ganz rund“ wählen: Knöpfe und Felder sind Pillen, die Karte groß gerundet (K-5).

**M-1:** der Schnellstart von „leer“ bis zum Figma-Export in höchstens 10 Minuten, mit Stoppuhr, wie in Spec 023.

**Studio:** http://localhost:7301/studio/bluna (öffnet Farbe). Links die Seiten, in der Mitte die Vorschau mit den Umschaltern, rechts die Eigenschaften.
- Farbe: in der Akzentpalette den Anzeigenamen „Ozean“ eintragen; eine Stufe über den Farbwähler setzen – die Zeile sagt „gesetzt“, die Vorschau folgt, „Zurücksetzen“ nimmt es zurück.
- Schrift: über die Kopfzeile Viewport „compact“ wählen; bei `font.size.display.1` die Stufe für compact ändern – die Zeile zeigt den Wert je Viewport.
- Semantik: bei `color.text.default` die Stufe `color.palette.neutral.100` wählen: **abgelehnt** mit Satz und Vorschlag, das Feld springt zurück (M-5); `color.palette.neutral.950` wählen: übernommen, die betroffenen Regeln stehen unter der Seite, die Kopfzeile zählt die Probleme.

**M-5:** wie oben (Semantik): ein Wert, der eine feste Regel bricht, wird nicht übernommen; ein Wert, der eine anpassbare Regel bricht (Farbe: eine Stufe weit weg von ihren Nachbarn, `palette-even`), wird übernommen und als Problem gezählt; das Jugxo trägt die Expertenansicht ein.

**M-6 (dieselben Daten):** Im Studio eine Stufe setzen, dann „Schnellstart“ links: der Schritt Farbe zeigt die gesetzte Stufe in der Vorschau; dort die Leitfarbe ändern, zurück ins Studio: die nicht gesetzten Stufen sind neu abgeleitet, die gesetzte steht. Speichern im Studio und im Schnellstart schreiben dieselbe `agordo.json` (`festgelegt`, `etikedoj`, `historio`):

```sh
cat "<Markenordner>/bluna/agordo.json" | head -60
```

**Aspiro nur verschärfen:** in `<Markenordner>/bluna/agordo.json` ein `aspiroj: [{ "metriko": "wcag2-reserve", "min": 0.02, "kialo": "Test" }]` eintragen und `pnpm fm agordilo derive "<Markenordner>/bluna/agordo.json" --out /tmp/bluna-test` – abgelehnt mit `aspiro-loosens-regulo` und beiden Schranken; mit `min: 0.1` geschrieben.

**Expertenansicht:** der Link auf jedem Bildschirm, oder direkt `open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#modus=werkstatt"`.

**Tests:** `pnpm --filter @fundamento/metiejo exec vitest run src/studio.test.ts src/servilo.test.ts` (Studio, K-1 bis K-6, M-5, M-6), `pnpm --filter @fundamento/agordilo exec vitest run src/festgelegt.test.ts` (festgelegt, etikedoj, bytegleich), `pnpm --filter @fundamento/modelo exec vitest run src/validate/aspiroj-loosen.test.ts`.

## O-1 Palettenraster (eigener PR)

**Branch:** `261022-spec-024-o1-raster-f87267` (von `main` `8915fa6`, nach #99) · **Datum:** 2026-10-22 · **Stand:** zur Abnahme. Entscheidung des Maintainers vom 22.10. zu O-1: der Raster-Vorschlag aus ① gilt – die farbigen Paletten bekommen die vier Stufen der neutralen Palette, die ihnen fehlten, **25, 150, 850, 975**, für alle Marken abgeleitet. Eine Token-Änderung durch Spec, kein Amendment (§ 3 B).

### Zusammenfassung

1. **20 neue Kern-Tokens:** `color.palette.{accent,success,warning,danger,info}.{25,150,850,975}`, je mit ID aus dem Lock (`pnpm id:new token --count 20`), Rolle `palette` und Beschreibung; die farbigen Paletten haben 15 Stufen, die neutrale behält 17 (mit 0 und 1000), `shade` und `tint` bleiben. Plan ① zählte 24 (4 × 6) – die neutrale Palette hat die Stufen schon, also 20.
2. **Die Werte von komuna** (D-13): je neue Stufe die OKLCH-Helligkeit der gleichnamigen neutralen Stufe, die Buntheit als geometrisches Mittel der Nachbarn, der Farbton der Nachbarn, in den sRGB-Farbraum gebracht. Der erreichte Kontrast gegen Weiß entspricht dem geometrischen Mittel der Nachbarn aus dem Vorschlag in ① (25 ≈ 1,07 · 150 ≈ 1,39 · 850 ≈ 12,7 · 975 ≈ 18,1).
3. **Kalibrierung neu gemessen** (`pnpm --filter @fundamento/agordilo calibrate`): `calibration.json` trägt je farbiger Palette 15 Stufen mit Ziel hell und dunkel und relativer Buntheit; die Ableitung schreibt die neuen Stufen für jede Marke (§ 3 B: „Die Stufen, die eine Marke nicht nutzt, belegt die Ableitung“).
4. **Alle vorhandenen Marken belegen die Stufen (Art. IV):** komuna im Kern, `provo` und `provo-kompakta` neu abgeleitet (`fm agordilo derive`, Herkunft mit neuem Fingerabdruck der Struktur), `ekzemplo` von Hand mit erfundenen Werten nach derselben Regel aus seinen eigenen Paletten.
5. **Die Reguloj bleiben grün:** `palette-even`, `palette-aligned`, `srgb-gamut` und das Aspiro `oklch-l-step` (0,04–0,2 je 100 Stufeneinheiten) von komuna – gemessen, nicht gelockert. Keine Rolle zeigt auf eine neue Stufe, die KontrastParoj sind unverändert.
6. **Studio und Werkstatt** zeigen die neuen Stufen von selbst (die Zeilen und Kandidaten kommen aus dem Modelo): je Stufe Wert, OKLCH, Kontrast, Herkunft, setzbar und zurücksetzbar.

### Constitutional Compliance Review

- **Art. I:** konform – die Tokens stehen im Kern, Kalibrierung und Fixtures sind aus ihm abgeleitet; keine Projekcio von Hand.
- **Art. II:** konform – kanonische Namen `color.palette.<palette>.<stufe>`, die Bezeichner der Celoj folgen mechanisch.
- **Art. III:** konform – `resolve` und `describe` nennen die neuen Tokens ohne Änderung.
- **Art. IV:** konform – jede Aspekto belegt jede neue Stufe (Test je Fixture); `aspekto-incomplete` erzwingt es.
- **Art. V:** konform – kein fremder Style-Guide geöffnet; die Werte sind aus komuna gerechnet.
- **Art. VI:** konform – keine Regulo geändert, keine Schranke gelockert; das Aspiro von komuna hält (D-13).
- **Art. VII:** konform – die Beschreibung jeder Stufe nennt Spec und Entscheidung; die Fixtures tragen den Fingerabdruck der Struktur.
- **Art. VIII:** konform – DTCG-Farbwerte, nichts Webspezifisches.
- **Art. IX:** konform – keine neue Fähigkeit an Eroj.
- **Art. X:** konform – rot in `23dec57`, dann grün; alle Prüfungen laufen unverändert.
- **Art. XI:** konform – kein Paket, kein Code; 20 Tokens, eine Messung, drei Fixtures.
- **Art. XII:** konform – DTCG; `$themes.json` unverändert (kein neuer Set).
- **Art. XIII:** konform – der Schnellstart ändert sich nicht; das Studio zeigt vier Stufen mehr je Palette.

### Entwurfsentscheidungen

#### D-13 Die neue Stufe nimmt die Helligkeit der neutralen Stufe
Der Vorschlag in ① nannte als Ziel das geometrische Mittel der Nachbarkontraste. Gerechnet ergibt das für 975 einen Schritt von 0,21–0,22 OKLCH-L je 100 Stufeneinheiten (950 → 975), über dem Aspiro `oklch-l-step ≤ 0,2` von komuna; die neutrale Palette macht denselben Schritt mit 0,16. Darum nimmt jede neue Stufe die OKLCH-Helligkeit der gleichnamigen neutralen Stufe (25: 0,975 · 150: 0,89 · 850: 0,32 · 975: 0,2): `palette-aligned` hält damit von selbst (Spreizung 0 an diesen Stufen), `palette-even` und das Aspiro messen dieselben Schritte wie bei neutral, und der Kontrast landet beim geometrischen Mittel der Nachbarn. Die Buntheit ist das geometrische Mittel der Nachbarn (am Rand die halbe Buntheit des einen Nachbarn), der Farbton der Mittelwert der Nachbarn, die Buntheit auf den sRGB-Farbraum begrenzt (`maxChroma`).

### Messungen

| Stufe | accent | success | warning | danger | info | Kontrast hell (≈) |
|---|---|---|---|---|---|---|
| 25 | `#f5f7f9` | `#f4f8f4` | `#faf6f1` | `#fbf5f4` | `#f3f7fb` | 1,07 |
| 150 | `#d1dce9` | `#c9e3cd` | `#ecd7bb` | `#f7d1ca` | `#c5dff2` | 1,39 |
| 850 | `#1a3454` | `#013f06` | `#4b2a01` | `#660100` | `#01345d` | 12,7 |
| 975 | `#0e1721` | `#0c1a0b` | `#1e130b` | `#270d0a` | `#0b1724` | 18,1 |

Schritte in OKLCH-L je 100 Stufeneinheiten nach der Änderung (komuna, hell): 25 → 50 0,099 · 100 → 150 0,06 · 150 → 200 0,06 · 800 → 850 0,076 · 850 → 900 0,084 · 950 → 975 0,16 – alle innerhalb 0,04–0,2. Kern-Tokens 356 → 376 (im Band 250–400). Figma-Variablen 856 → 876 (+20 in der Sammlung `aspekto`, eine je Token, jede Marke ein Modus).

### Abweichungen

1. **20 statt 24 Tokens** (Plan ① zählte die neutrale Palette mit, die die Stufen schon hatte).
2. **Ziel nicht das geometrische Mittel, sondern die Helligkeit der neutralen Stufe** (D-13); der erreichte Kontrast entspricht dem Mittel auf die zweite Stelle.
3. **Keine Rolle nutzt die neuen Stufen** – wie in ① gesagt, bis eine Spec es will; die KontrastParoj bleiben.
4. **Die Prüfsummen der Stufe-1-Ableitung** (`packages/agordilo/fixtures/stufe1-provo.json`, Spec 019 ①: „Standard der Regler = Stufe 1“) sind mit den neuen Stufen neu gerechnet; die Eigenschaft bleibt geprüft (`stufe2.test.ts`), die Herkunft im Fixture sagt es.

### Messanleitung

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm install && pnpm build
pnpm -s fm modelo validate                                  # grün, 376 Tokens
pnpm --filter @fundamento/agordilo calibrate -- --check     # die Kalibrierung ist die Messung von komuna
pnpm fm projekcioj build --out .fundamento/projekcioj
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html"   # Paletten mit 15 Stufen
pnpm fm metiejo --open                                      # http://localhost:7301/studio/<name>/farbe – je farbige Palette 15 Stufen
```

Tests: `pnpm --filter @fundamento/modelo exec vitest run src/data/raster-024.test.ts`, `pnpm --filter @fundamento/agordilo exec vitest run src/raster-024.test.ts src/calibration.test.ts src/derive.test.ts`, `pnpm --filter @fundamento/metiejo exec vitest run src/studio.test.ts`.
