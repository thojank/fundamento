# Spec 049 – Technische Spec: Gründe für komuna

Ergänzt [product-spec.md](./product-spec.md). Alle Pfade relativ zu `repos/fundamento`, Basis `main` = `6374f18f`.

## 1. Wo ein Kialo heute liegt (erhoben, kein neues Format)

`grafeoDePaket(label, files)` (`packages/metiejo/src/grafeo.ts:585`) ruft `konstruu` mit `jugxoj: []` auf. Der Kialo eines Token-Knotens entsteht in `grafeo.ts:383-407`, in dieser Reihenfolge:

1. **`deveno.json` des Pakets** (`devenoKialoj`, `grafeo.ts:258`). Text `"<maniero> · <sxlosilo>"`. Das ist eine Herkunft aus der Fonto, kein Grund. 1 400 Einträge in komuna, keiner für die 75 Lücken.
2. **Regulo mit `appliesTo.tokens`** (`nomantajReguloj`, `grafeo.ts:247`). Gefiltert auf `regulo.aspekto === undefined || regulo.aspekto === aspekto`, sortiert nach Id. Die **erste** Regulo, deren Muster den Token trifft, gibt `regulo.kialo` (eine Jugxo der Agordo hätte Vorrang, im Paket-Graphen gibt es keine). Der Knoten zeigt dann `regulo: "fiksa · reg_…"` bzw. `"alias · reg_…"`.
3. Sonst kein Kialo.

`kialoDe(g, id)` (`packages/metiejo/src/grafeo-sicht.ts`) liest nur `nodo.kialo`: eigener → `propra`, sonst die Kette hinauf → `heredita`, sonst `neniu`. `begruendungDe` zeigt bei einer Entscheidung ohne eigenen Kialo „fehlt“.

**Folge:** Ein eigener Grund für einen komuna-Token ist eine **Regulo mit `appliesTo.tokens` und `aspekto: "komuna"`**. Aspekto-Pakete dürfen eine `reguloj.json` tragen: `packages/modelo/src/load/files.ts:167` liest `reguloj`, `jugxoj` und `deveno` je Paket, `build.ts:76` führt sie mit `packageEntries` zusammen. Schema: `RegulojFile` → `Regulo` (`id`, `name` `^[a-z0-9]+(-[a-z0-9]+)*$`, `statement`, `kialo`, `scope`, `checkability`, `aspekto`, `appliesTo.tokens` mit `*` für ein Segment und `.**` am Ende).

Warum nicht die anderen Orte:
- `deveno.json`: Herkunft, Pflichtfelder `fonto`, `dosiero`, `fontoValoro`. Ein Grund dort wäre eine erfundene Herkunft (Art. VII). Zudem schreibt `scripts/fonto-astryx/schreiben.mjs` die Datei neu.
- `aspekto-komuna/jugxoj.json`: Eine Jugxo verweist auf Regulo, Ero oder Artikel, nicht auf einen Token. `grafeoDePaket` liest sie nicht. Das Fonto-Skript schreibt die Datei neu.
- Ein Feld `kialo` am Token (Konzept §4.2): neues Format, ausgeschlossen.

## 2. Wirkung auf Nachbarn (erhoben)

| Verbraucher | Wirkung einer Paket-Regulo mit `aspekto: "komuna"` |
|---|---|
| Node-Editor, Paket-Graph komuna | Der Token bekommt den eigenen Kialo. Übernahmen in seiner Kette erben ihn neu. |
| Graph ekzemplo / provo | keine (Filter auf `aspekto`) |
| MCP `list_reguloj` ohne Aspekto (Fixture 038) | keine (`tools.ts:329` filtert `aspekto === undefined`) |
| MCP `explain` (Fixture 038: `color.text.subtle`, ohne Assignment) | keine (`explain.ts:189` filtert nach Assignment-Aspekto) |
| `explain` mit `assignment.aspekto = "komuna"` | listet die neue Regulo (gewollt, AC-9) |
| D-19-Wächter `regularo-repo.test.ts` | `manual` nur mit Eintrag in `NOT_CHECKABLE`, also je Regulo ein Eintrag |
| `scripts/fonto-astryx/schreiben.mjs` | schreibt `reguloj.json` und `ids.lock.json` nicht, die Gründe überleben einen Neulauf |

**Risiko:** Eine Regularo-Prüfung von `fm modelo validate` oder `pnpm check` könnte Paket-Reguloj anders behandeln als Kern-Reguloj, etwa wegen eines Namenskonflikts oder eines Musters ohne Treffer. T1 deckt das mit einem Test ab. Wird es rot, wird die Regulo korrigiert, die Prüfung bleibt.

## 3. Datenform

`packages/aspekto-komuna/reguloj.json` (neu, sortiert nach `id`, 2 Leerzeichen, Zeilenende `\n`):

```json
{
  "reguloj": [
    {
      "id": "reg_01…",
      "name": "komuna-schriftgewichte",
      "statement": "komuna führt die neun Schriftgewichte 100 bis 900 der CSS-Skala.",
      "kialo": "<freigegebener Satz aus §5>",
      "scope": "aspekto komuna: font.weight.*",
      "checkability": "manual",
      "aspekto": "komuna",
      "appliesTo": { "tokens": ["font.weight.*"] }
    }
  ]
}
```

- **Ids:** `pnpm id:new regulo --count 24 --lock packages/aspekto-komuna/ids.lock.json --json` (`packages/modelo/src/ids/cli.ts`). Nur neue Einträge `{"status":"active","type":"regulo"}`.
- **`NOT_CHECKABLE`** (`packages/modelo/src/data/regularo-repo.test.ts:33`): je Name ein Eintrag, Text einheitlich: `"Spec 049: Entscheidungsprotokoll für komuna – begründet eine Wahl; der Wert ist die Wahl selbst, darüber hinaus gibt es nichts zu prüfen"`.
- **Muster statt Einzel-Ids**, wo die ganze Skala gemeint ist (`font.weight.*`). Einzel-Ids, wo nur ein Token gemeint ist (`motion.duration.scale.0`, Rollen). Wo ein Muster Tokens trifft, die schon einen Grund aus `deveno` haben, gewinnt `deveno` (AC-8 prüft das).
- Sprache: Statement, Scope und Kialo deutsch. Keine Namen fremder Marken oder Design-Systeme, keine Fonto-Namen im Text (nur „die Fonto“).

## 4. Tests (T1 rot, T2 grün)

| Datei (neu) | Prüft | Rot vor T2, weil |
|---|---|---|
| `packages/metiejo/src/grafeo-kialo-049.test.ts` | (a) komuna-Paket-Graph: jeder komuna-Token aus `specs/048-…/luecken.json` hat `kialoDe().fonto === "propra"` mit dem Kialo der Regulo, die §5 ihm zuordnet; (b) Zahl „fehlt“ in komuna = Zahl der in §5 nicht freigegebenen Tokens (Ziel 0); (c) ekzemplo und provo: Ids ohne Grund = `luecken.json` (048), id-gleich; (d) kein Knoten außerhalb der 75 ändert einen **eigenen** Kialo gegenüber dem Graphen ohne Paket-Reguloj (vorher/nachher im selben Test: einmal `files` ohne `packages/aspekto-komuna/reguloj.json`); (e) Zählung geerbt / `neniu` vorher/nachher als Ausgabe für den Bericht, ohne feste Zahl | es gibt keine `reguloj.json` |
| `packages/modelo/src/data/regularo-komuna-049.test.ts` | Paket-Reguloj werden geladen; jede hat `aspekto: "komuna"`, `manual`, `appliesTo.tokens`, nicht leeren `kialo`; jedes Muster trifft mindestens einen Token; jede Id steht in `aspekto-komuna/ids.lock.json`; Namen eindeutig im ganzen Modelo; Vereinigung der Muster deckt alle 75 Tokens aus `luecken.json` (048) ab | Datei fehlt |
| `packages/modelo/src/gvidanto/explain-049.test.ts` | `explain` für `font.weight.semibold` und `radius.role.control` mit `aspekto=komuna` nennt die Regulo samt Kialo, mit `aspekto=ekzemplo` und ohne Aspekto nicht | Regulo fehlt |

Geändert (nur wo nötig, im PR-Text gelistet): `packages/modelo/src/data/regularo-repo.test.ts`, nur `NOT_CHECKABLE` wird ergänzt.

Unverändert grün: `grafeo-*-047.test.ts`, `grafeo-*-048.test.ts`, `packages/mcp/src/kontrakto-038.test.ts` (Fixtures nie neu erzeugen), `gvidanto-038.test.ts`, `packages/projekcioj/src/fonto/komuna-fonto.test.ts`, `pnpm fm modelo validate`, `pnpm check` (inkl. `check:privat`, `check:clean-room`, `check:vortaro-lint`).

Lokal: `FM_AUSGABE=knapp`, die drei neuen Dateien plus 047/048/038 gezielt, dann einmal `pnpm test:betroffen` im Hintergrund. Kein Zeittest lokal.

## 5. Vorschläge zur Abnahme je Gruppe

Erhoben am 2026-11-11 aus `packages/vortaro/sets/core.json`, `packages/aspekto-komuna/**`, `packages/modelo/data/{reguloj,jugxoj}.json` und `packages/modelo/data/eroj/*/skemo.json`.

**Direkt berührende Reguloj, Jugxoj und Aspiroj: bei allen 75 Tokens keine** (Muster, Typen, komuna-Aspiroj und Token-Nennung in Jugxoj geprüft). Die Spalte „verwandt“ nennt Reguloj und Jugxoj, die inhaltlich dasselbe Thema tragen und den Satz stützen.

Wert = komuna hell (= Kern, wo nicht anders angegeben). **A** = Annahme: Der Satz folgert aus Daten und Beschreibung, nicht aus einem dokumentierten Beschluss. Der Maintainer bestätigt oder ersetzt ihn.

Freigabe je Zeile: ☐ frei · ✎ geändert (Text in der Zeile ersetzen) · ✗ verworfen.

### 5.1 `bewegung/palette` (5 Tokens → 2 Entscheidungen)

| # | Regulo (Name) | Tokens / Muster | Wert | Eroj | verwandt | Vorschlag Kialo | Freigabe |
|---|---|---|---|---|---|---|---|
| B1 | `komuna-dauer-null` | `motion.duration.scale.0` | 0 ms | – | `motion-reduced-instant` | Stufe 0 ist genau null und nicht bloß kurz, weil `motion-reduced-instant` jede Dauer auf diese Stufe legt, wenn eine Person weniger Bewegung wünscht, und dann wirklich nichts mehr animiert sein darf. | ☐ |
| B2 | `komuna-kurven` | `motion.easing.curve.*` (accelerate, decelerate, expressive, linear; `smooth` hat Herkunft) | `[0.3,0,1,1]` · `[0,0,0.2,1]` · `[0.2,0,0,1]` · `[0,0,1,1]` | – (über `motion.easing.exit/enter/emphasized`) | – | Jede Kurve steht für eine Bewegungsart: Was hereinkommt, bremst ab, was geht, beschleunigt, was betont wird, startet schnell, und linear bleibt für Fortschritt, der gleichmäßig laufen muss. Mehr Kurven würden Bewegungen trennen, die niemand unterscheidet. **A** | ☐ |

### 5.2 `elevation/rollen` (6 → 1)

| # | Regulo | Tokens | Wert | Eroj | verwandt | Vorschlag Kialo | Freigabe |
|---|---|---|---|---|---|---|---|
| E1 | `komuna-ebenen` | `elevation.layer.*` | base 0 · raised 1 · navigation 100 · overlay 200 · modal 300 · toast 400 | overlay: datelektilo, kompletigilo, konsileto, listelektilo, menuo, plurelektilo, saltligilo, sxvebilo · raised: tabelo | `surface-distinct` | Die Ebenen stehen in Hunderterschritten, damit die Reihenfolge Navigation < Überlagerung < Dialog < Meldung fest ist und ein Ero Platz für eine Zwischenebene findet, ohne neu zu nummerieren. raised hebt mit 1 nur innerhalb der Seite, etwa einen haftenden Tabellenkopf. | ☐ |

### 5.3 `farbe/rollen/color/syntax` (5 → 5)

Alle fünf haben genau einen Ero-Verweis (`ero.kodbloko.<rolle>.color`). komuna überschreibt sie im Dunkelmodus, `keyword` auch in dunkel + hoher Kontrast. Die Kette erbt den Grund von `palette-even` (F-T2-4). Der erklärt aber die Stufe, nicht den Farbton.

| # | Regulo | Token | Wert hell → dunkel | verwandt | Vorschlag Kialo | Freigabe |
|---|---|---|---|---|---|---|
| S1 | `komuna-syntax-schluesselwort` | `color.syntax.keyword` | danger 700 → 150 (hoher Kontrast 50) | Jugxo `jug_01M5ZNMRXQEZ…` (komuna, Rollen nach Regulo) | Schlüsselwörter tragen das Gerüst des Codes und bekommen den kräftigsten, wärmsten Ton der Marke (danger), damit man die Struktur zuerst sieht. Im Codeblock bedeutet Rot keinen Fehler, weil dort keine Zustände angezeigt werden. **A** | ☐ |
| S2 | `komuna-syntax-name` | `color.syntax.name` | info 800 → 200 | – | Namen von Funktionen, Eigenschaften und Befehlen nehmen den info-Ton, weil man beim Lesen nach ihnen sucht und das kühle Blau sie vom warmen Gerüst trennt. **A** | ☐ |
| S3 | `komuna-syntax-zeichenkette` | `color.syntax.string` | success 800 → 300 | – | Zeichenketten sind grün (success), weil Text in Anführungszeichen der ruhigste Teil des Codes ist und sich so am deutlichsten von Schlüsselwörtern absetzt. **A** | ☐ |
| S4 | `komuna-syntax-zahl` | `color.syntax.number` | warning 700 → 200 | – | Zahlen und Literale (true, false, null) nehmen den warning-Ton, weil man Werte beim Lesen prüft. Sie sollen auffallen, ohne mit Schlüsselwörtern oder Zeichenketten verwechselt zu werden. **A** | ☐ |
| S5 | `komuna-syntax-kommentar` | `color.syntax.comment` | neutral 700 → 300 | – | Kommentare stehen neutral und leiser als der Code, aber über der Lesegrenze, weil sie zur Erklärung gehören und nicht verschwinden dürfen. | ☐ |

### 5.4 `form/palette` (4 → 2)

| # | Regulo | Tokens | Wert | Eroj | verwandt | Vorschlag Kialo | Freigabe |
|---|---|---|---|---|---|---|---|
| F1 | `komuna-randbreiten` | `border.width.scale.*` (1, 2, 3) | 1 · 2 · 3 px | – (über `border.width.default` → 1, `focus`/`strong` → 2) | Jugxo `jug_01M5ZN30KJ3D…` (komuna, Rand in erzwungenen Farben) | Drei ganze Pixel reichen: 1 px für jeden Rand, 2 px für Betonung und Fokus, 3 px als Reserve. Halbe Pixel würden auf normalen Bildschirmen verwaschen, und mehr Stufen könnte niemand auseinanderhalten. | ☐ |
| F2 | `komuna-rand-betont` | `border.width.strong` | → scale.2 (2 px) | apartigilo, avizo, glitilo, langetaro, navigado, pagxigilo, templinio | – | Betonte Linien (aktiver Reiter, aktuelle Seite, Akzent einer Meldung) sind doppelt so breit wie der normale Rand, damit die Betonung auch ohne Farbe erkennbar ist. Sie teilen die Breite mit dem Fokusrand, damit es nur zwei Strichstärken gibt. | ☐ |

### 5.5 `form/rollen` (7 → 6)

Kern-Rundungen: small 6 · medium 10 · large 12 · full 9999 px.

| # | Regulo | Tokens | Wert | Eroj | verwandt | Vorschlag Kialo | Freigabe |
|---|---|---|---|---|---|---|---|
| R1 | `komuna-rundung-bedienelement` | `radius.role.control` | → medium (10 px) | alsxutilo, butono, datelektilo, elektilo, faldilo, kampo, kompletigilo, listelektilo, lokredaktilo, markobutono, menuo, navigado, pagxigilo, plurelektilo, saltligilo, tabelo | `focus-ring-concentric` | Bedienelemente nehmen die mittlere Rundung: weich genug, dass sie als anfassbar gelten, und kantig genug, dass sie sich von pillenförmigen Auswahlen und von großen Flächen unterscheiden. | ☐ |
| R2 | `komuna-rundung-mehrzeilig` | `radius.role.multiline` | → medium (10 px) | kodbloko, konsileto, tekstareo | – | Mehrzeilige Felder und kleine Textflächen nehmen dieselbe Rundung wie einzeilige Bedienelemente, damit ein Formular aus einem Guss wirkt. Eine Pille würde mit wachsender Höhe zur Ellipse. | ☐ |
| R3 | `komuna-rundung-pille` | `radius.role.pill` | → full | elekto, insigno, mezurilo, sxaltilo, templinio (+ datelektilo Zelle) | – | Volle Rundung kennzeichnet kompakte Auswahl- und Zustandselemente (Auswahlchip, Insigno, Schalter, Fortschrittsbalken), damit sie sich auf einen Blick von rechteckigen Aktionen und Feldern unterscheiden. | ☐ |
| R4 | `komuna-rundung-flaeche` | `radius.role.surface` | → large (12 px) | alsxutilo, avizo, datelektilo, dialogo, karto, kompletigilo, listelektilo, menuo, plenstato, plurelektilo, sxvebilo, tabelo | `surface-distinct` | Flächen wie Karten, Dialoge und Menüs sind größer als ihr Inhalt und bekommen deshalb die große Rundung, damit ihre Ecken im Verhältnis genauso weich wirken wie die der Bedienelemente darin. | ☐ |
| R5 | `komuna-rundung-tag` | `radius.role.tag` | → small (6 px) | signeto | – | Tags, die eine Person wählt oder entfernt, bleiben knapp gerundet, damit man sie von pillenförmigen Insignoj unterscheidet, die nur anzeigen. | ☐ |
| R6 | `komuna-strichart` | `stroke.*` (dashed, solid) | dashed · solid | dashed: alsxutilo, mezurilo, plenstato, templinio · solid: alsxutilo, templinio | – | Durchgezogen ist der Normalfall. Gestrichelt heißt „hier kann oder wird noch etwas sein“ (Ablagefläche, leerer Zustand, kommender Schritt), weil die Lücke im Strich die Lücke im Inhalt zeigt. | ☐ |

### 5.6 `raum/palette` (8 → 1)

| # | Regulo | Tokens | Wert | Eroj | verwandt | Vorschlag Kialo | Freigabe |
|---|---|---|---|---|---|---|---|
| G1 | `komuna-groessen` | `size.scale.*` (100–600, 900, 1000; 700/800 haben Herkunft) | 12 · 16 · 20 · 24 · 28 · 32 · … · 56 · 64 px | avataro, ikono, glitilo, signeto (+ über `size.icon.*`, `size.control.*`, `size.target.min`) | `touch-target-min`, `protected-minimum`, Jugxo `jug_01M5ZT2Z2V5G…` (komuna) | Alle Größen sind Vielfache von 4 px, damit Symbole, Bedienelemente und Ziele auf einem Raster liegen. Stufe 400 ist mit 24 px zugleich das Mindestziel des Zeigers (`touch-target-min`, WCAG 2.5.8). | ☐ |

### 5.7 `raum/rollen` (9 → 3)

| # | Regulo | Tokens | Wert | Eroj | verwandt | Vorschlag Kialo | Freigabe |
|---|---|---|---|---|---|---|---|
| G2 | `komuna-spalten` | `layout.columns.*` | 4 · 8 · 12 | – (über `layout.grid.columns` → 8) | – | 4, 8 und 12 Spalten lassen sich ohne Rest halbieren und vierteln, 12 auch dritteln. Ein Layout behält so beim Wechsel von kompakt über mittel zu breit seine Proportionen. 8 ist das Standardraster. **A** | ☐ |
| G3 | `komuna-umbrueche` | `size.breakpoint.*` | medium 600 · expanded 1024 px | – | – | Zwei Grenzen reichen für drei Layouts: Unter 600 px ist ein Telefon im Hochformat, ab 1024 px ist Platz für Seitenleiste und Inhalt nebeneinander. Mehr Grenzen würden Zwischenzustände erzeugen, die niemand gestaltet. **A** | ☐ |
| G4 | `komuna-container` | `size.container.*` | small 640 · medium 960 · large 1280 · max 1440 px | small: datelektilo, dialogo, kompletigilo, krado, listelektilo, lokredaktilo, menuo, pagxo, plurelektilo, sxvebilo · medium: datelektilo, dialogo, formularo, krado, redaktilo, sxelo · large: krado · max: dialogo | – | Die Containerbreiten wachsen in Schritten von 320 px und passen damit auf das 4-, 8- und 12-Spalten-Raster. 1440 px ist die Obergrenze, damit Zeilen und Formulare auf großen Bildschirmen lesbar bleiben. | ☐ |

### 5.8 `schrift/palette/family` (3 → 1)

| # | Regulo | Tokens | Wert | Eroj | verwandt | Vorschlag Kialo | Freigabe |
|---|---|---|---|---|---|---|---|
| T1 | `komuna-schriftfamilien` | `font.family.*` | body = display: Sans (OFL-1.1) · code: deren Mono-Schnitt, je mit generischen Ausweichschriften | – | `typography-roles-composite` | Eine Familie für Fließtext und Überschriften hält die Marke ruhig. Der Mono-Schnitt derselben Familie setzt Code ab, ohne eine zweite Handschrift einzuführen. Beide stehen unter freier Lizenz, und die generischen Ausweichschriften tragen das Layout, bevor die Schrift geladen ist. | ☐ |

### 5.9 `schrift/palette/lineheight` (6 → 1)

| # | Regulo | Tokens | Wert | verwandt | Vorschlag Kialo | Freigabe |
|---|---|---|---|---|---|---|
| T2 | `komuna-zeilenhoehen` | `font.lineheight.scale.*` | solid 1 · tight 1,1 · snug 1,25 · normal 1,5 · relaxed 1,625 · loose 1,75 | `type-rhythm`, Jugxo `jug_01M5N89C1WQ3…` (komuna, type-rhythm) | Die Skala reicht von 1 für einzeilige Bedienelemente bis 1,75 für lange Lesetexte. Die engen Stufen braucht `type-rhythm`, weil große Schrift weniger Durchschuss bekommen muss, damit eine Überschrift ein Block bleibt. | ☐ |

### 5.10 `schrift/palette/tracking` (13 → 1)

| # | Regulo | Tokens | Wert | verwandt | Vorschlag Kialo | Freigabe |
|---|---|---|---|---|---|---|
| T3 | `komuna-laufweite` | `font.tracking.scale.*` (100–1200, caps) | 100–800: 0 · 900: −0,4 · 1000: −0,6 · 1100: −0,8 · 1200: −1 px · caps +0,6 px | `type-rhythm` | Die Laufweite gehört zur Schriftgröße. Bis Stufe 800 bleibt sie 0, ab Display-Größen wird sie schrittweise negativ, weil große Buchstaben sonst optisch auseinanderfallen. Versalien bekommen +0,6 px, weil eng gesetzte Großbuchstaben schwer zu lesen sind. | ☐ |

### 5.11 `schrift/palette/weight` (9 → 1)

| # | Regulo | Tokens | Wert | Eroj | verwandt | Vorschlag Kialo | Freigabe |
|---|---|---|---|---|---|---|---|
| T4 | `komuna-schriftgewichte` | `font.weight.*` | thin 100 … black 900 | semibold: langetaro, navigado, pagxigilo, spuro, templinio | `typography-roles-composite` | Die neun Gewichte folgen den CSS-Stufen 100 bis 900, damit Web und Figma dieselbe Zahl verstehen. Im Einsatz trägt semibold die Hervorhebung des aktuellen Elements, die übrigen stehen bereit, wo eine Schrift sie hat. | ☐ |

### 5.12 Summe

24 Reguloj (B1–B2, E1, S1–S5, F1–F2, R1–R6, G1–G4, T1–T4) für 75 Tokens. **A** markiert 8 Vorschläge (B2, S1–S4, G2, G3). Bei ihnen ist die Bestätigung durch den Maintainer besonders wichtig.

## 6. Tickets (≤ 5, ein Strang)

| Ticket | Inhalt | Dateien |
|---|---|---|
| **T1** | Rote Tests §4, Lauf beobachten, Commit | 3 neue Testdateien |
| **T2** | Ids vergeben, `reguloj.json` aus §5 (nur ☐/✎), `NOT_CHECKABLE`. Tests grün, `fm modelo validate`, 038/047/048 grün, `pnpm check` | `packages/aspekto-komuna/{reguloj.json,ids.lock.json}`, `packages/modelo/src/data/regularo-repo.test.ts` |
| **T3** | `bilder` → `.fundamento/spec049/`, `--luecken specs/049-kialoj-komuna/luecken.json`. Bericht-Entwurf mit vorher/nachher je Gruppe. Diff-Suche wie 048 | `specs/049-kialoj-komuna/**` |
| **T4** | PR gegen `main`, ein Push, ein `workflow_dispatch`, CI je Job in Bericht (lokaler Commit) und PR-Text (`gh pr edit`). Stopp | – |

## 7. Abgrenzung (Dateien)

- **Frei:**
  - `packages/aspekto-komuna/reguloj.json` (neu)
  - `packages/aspekto-komuna/ids.lock.json` (nur neue `reg_`-Einträge)
  - `packages/modelo/src/data/regularo-repo.test.ts` (nur `NOT_CHECKABLE`)
  - die drei neuen Testdateien aus §4
  - `specs/049-kialoj-komuna/**`
- **Tabu:**
  - `packages/vortaro/**`
  - `packages/modelo/data/**`
  - Sets, `deveno.json`, `jugxoj.json`, `aspekto.json` von komuna
  - `packages/aspekto-komuna-0-2/**`
  - ekzemplo- und provo-Daten und -Fixtures
  - `packages/mcp/**` (inklusive Fixtures, nie neu erzeugen)
  - `packages/metiejo/src/*.ts` außer der neuen Testdatei
  - `packages/nodredaktilo/**` (Skript unverändert)
  - `packages/eroj/**`
  - `.github/**`, Root-Dateien, Lockfile
  - jede Grenze, Schwelle oder Toleranz

## 8. Diff-Suche vor dem Push (wie 048)

1. `git diff --name-only origin/main...HEAD` ⊆ Frei-Liste.
2. Die Suche nach `timeout|threshold|sojlo|limit|toBeLessThan` in hinzugefügten Zeilen ergibt keine angehobene Grenze.
3. `pnpm check:privat` und `pnpm check:clean-room` sind PASS. Hinzugefügte Zeilen nennen nur `komuna`, `ekzemplo` und `provo`.
4. Kein PNG und keine `messung.json` im Repo.

## Nachtrag 049 (Umsetzung)

Stand 2026-11-11, KIA-1.1. Quelle: Implementation Spec `kialoj-komuna` (Abschnitt 0), geprüft gegen `origin/main` @ `6374f18f`. Der Text oberhalb dieses Nachtrags ist die byte-gleiche Kopie der technischen Spec (die ersten 21 178 Byte, `cmp` Exit 0; SHA-256 der Quelle `37177662694b355437f4bd5135ebcb4e6f93af0befc3992aed7ad2dc7ff9af4e`) und bleibt unverändert.

### Maintainer-Entscheidungen 2026-11-11 (verbindlich)

- **Freigabe §5:** alle 24 Zeilen freigegeben (☐ = frei). Kein Eintrag ✎ oder ✗; das Ziel von AC-6 ist 0 Entscheidungen ohne Grund in komuna.
- **B-1 → Option (A):** Von den Vertrags-Fixtures aus Spec 038 wird genau der Eintrag fortgeschrieben, den `kontrakto-038` rot meldet (erwartet: nur `describe.json` / `describe/standard`), nach dem Verfahren aus 047 (`generi.mjs` aus einer Wegwerf-Kopie außerhalb des Repos, dazu ein Kontrolllauf auf den Daten von `origin/main`, der alle übrigen Einträge reproduziert). Eigener Commit `Spec 049 Nachtrag: Vertrags-Fixture describe fortgeschrieben (Maintainer-Entscheidung 2026-11-11)` in KIA-2.1. Wird ein anderer Eintrag rot: stoppen und berichten.
- **B-2 und B-3 freigegeben** wie unten entschieden. Beide stehen in `tasks.md`, im Bericht und im PR-Text.
- **Q-5:** Default bleibt (außerhalb des Umfangs, Folgeaufgabe im Bericht).

### Abweichungen von der Spec (aus Abschnitt 0 der Implementation Spec)

- **B-1 – Vertrags-Fixture `describe` (038).** `describe` antwortet mit `describeModelo(modeloJson)` (`packages/modelo/src/export/describe.ts:111`, `reguloCount = modelo.reguloj.length`); `modeloJson.reguloj` enthält auch die Paket-Reguloj (`build.ts:76` `packageEntries`, `export-modelo.ts:321`). Beleg: `packages/mcp/test/fixtures/kontrakto/describe.json` zählt `"jugxoj":{"count":235}` = 220 Kern-Jugxoj + 15 aus `packages/aspekto-komuna/jugxoj.json`. 24 neue Reguloj machen aus `"reguloj":{"count":62,…}` `86` und aus „62 rules with reasons“ „86 rules …“; `kontrakto-038.test.ts` vergleicht SHA-256 und Bytes und wird rot. Nicht betroffen (geprüft): `list_reguloj` ohne Aspekto (`tools.ts:329`), `explain` für `color.text.subtle`, `get_ero`, `make-kit`, `vitrino`, `figma`. Das widerspricht dem Randfall „Wird ein Fixture trotzdem rot: stoppen und berichten. Nie neu erzeugen.“ – aufgelöst durch die Maintainer-Entscheidung (A) oben (Vorbilder `9ee8d430`, Spec 046 T6, und `c6f1eae5`, Spec 047 Nachtrag). `describe` nur Kern-Reguloj zählen zu lassen ist ausgeschlossen (`packages/mcp/**`, bräche `export/build.test.ts:141` und `e2e/export.test.ts:43`).
- **B-2 – AC-9 „ohne Aspekto erscheint sie nicht“.** `explain` ergänzt eine fehlende Zuordnung mit den Dimensio-Defaults (`packages/modelo/src/resolve/assignment.ts:54`); der Default von `aspekto` ist `komuna` (`data/dimensioj.json`). Ohne Zuordnung nennt `explain({ token: "font.weight.semibold" })` also `komuna-schriftgewichte`; mit `aspekto: "ekzemplo"` nicht (`explain.ts:189`). MCP `list_reguloj` ohne Aspekto blendet sie weiter aus (eigener Filter `aspekto === undefined`). **Entscheidung:** `explain-049.test.ts` prüft das echte Verhalten – fehlt bei `ekzemplo`, erscheint ohne Zuordnung (Kombination beginnt mit `aspekto=komuna`). Keine Codeänderung.
- **B-3 – ein zweiter bestehender Test muss sich ändern.** `packages/modelo/src/checks/regularo/index.test.ts` („regularo on the repo“, Zeilen ~72–100) erwartet `stats.reguloj === count(data/reguloj.json)`; `check:regularo` zählt auch die `reguloj.json` der Pakete (`checks/regularo/index.ts:40-49`) und sieht 62 + 24. **Entscheidung:** KIA-2.1 ändert die Erwartung so, wie die Zeile für die Jugxoj es schon tut: plus die Länge von `packages/aspekto-komuna/reguloj.json`, aus der Datei abgeleitet. Das widerspricht AC-4 („einzige Änderung an einem bestehenden Test“), ist durch die neuen Daten erzwungen und von `testing.md` gedeckt; Datei:Zeile, vorher/nachher in `tasks.md` und im PR-Text.
- **B-4 – der metiejo-Test liest `specs/048-…/luecken.json` nicht.** `turbo.json` hasht `specs/**` nur für `@fundamento/modelo#test`; `@fundamento/metiejo#test` deckt nur `specs/023-…` und `specs/024-…`. Ein Lesen in `grafeo-kialo-049.test.ts` wäre ein echter, ungedeckter Zugriff (`packages/modelo/src/ci/turbo-inputs.test.ts`), und `turbo.json` ist Root-Datei (tabu). **Entscheidung:** Der metiejo-Test gewinnt „vorher“ aus dem komuna-Graphen **ohne** die Paket-Reguloj (im Speicher), nicht aus einer Datei. Der modelo-Test `regularo-komuna-049` (über `specs/**` gehasht) bindet die Tabelle an `luecken.json` (048). Die Id-Gleichheit von ekzemplo/provo mit 048 (AC-7) wird zweimal belegt: im metiejo-Test durch Invarianz (ihre „fehlt“-Listen sind mit und ohne komunas Paket-Reguloj gleich) und in KIA-3.1 durch einen skriptierten Vergleich `luecken.json` (049) gegen (048).
- **Q-5 – `@fundamento/aspekto-komuna/package.json` liefert `reguloj.json` nicht aus.** `files` und `exports` nennen `jugxoj.json` und `deveno.json`, nicht `reguloj.json`; `packages/modelo/src/data/aspekto-komuna.test.ts:22` hält `files` fest. Im Repo wird das Verzeichnis gelesen, alle Tests laufen ohne Änderung; ein gepacktes npm-Paket trüge die 24 Kialoj nicht. **Default:** keine Änderung (Frei-Liste §7). KIA-3.1 nennt es als Befund `F-049-2` mit der Folgeaufgabe (`files` + `"reguloj.json"`, `exports` + `"./reguloj.json"`, Erwartung in `aspekto-komuna.test.ts` erweitern).

### Ist-Zustand: Zeilennummern

| Spec sagt | Code bei `6374f18f` | Folge |
|---|---|---|
| `grafeo.ts:585` `grafeoDePaket` | ✓ Zeile 585 | – |
| `grafeo.ts:383-407` Reihenfolge des Kialo, `:258` `devenoKialoj`, `:247` `nomantajReguloj` | Regulo-Treffer `:385`, `deveno.get(name) ?? regulo.kialo` `:402-406`; `devenoKialoj` `:259`, `nomantajReguloj` `:248` | eine Zeile versetzt; die Logik ist wie beschrieben |
| `files.ts:167` liest `reguloj`/`jugxoj`/`deveno` je Paket; `build.ts:76` führt zusammen | ✓ beide | `packageEntries` (`build.ts:271`) ergänzt `aspekto`, wenn es fehlt; wir schreiben es trotzdem ausdrücklich (AC-3) |
| `pnpm id:new regulo --count 24 --lock … --json` | ✓ `packages/modelo/src/ids/cli.ts`; `--lock` relativ zum cwd (Repo-Wurzel unter `pnpm`); braucht `packages/modelo/dist` (vorher `pnpm build`). komuna hat kein `idNamespace` → Ids `reg_<ULID>` | – |
| `NOT_CHECKABLE` bei `regularo-repo.test.ts:33` | ✓ `const NOT_CHECKABLE: Record<string, string>` in Zeile 34 | 24 Einträge `name: Grund` |
| Ein Token-Treffer im Graphen schreibt auch `regulo` | `nodo.regulo` wird `"fiksa · reg_…"` / `"alias · reg_…"` für **jeden** getroffenen Token, auch für die 3 Tokens mit `deveno` (`size.scale.700`, `size.scale.800`, `motion.easing.curve.smooth`); ihr Kialo bleibt der aus `deveno` | `knotenartDe` prüft nur `startsWith("fiksa"/"paletto"/"gestalto")` → Einordnung unverändert; die 3 Tokens nennt der Bericht |
| Muster treffen nur die 75 + `deveno`-Tokens | Mit einem Skript über `vortaro/sets/**` + `aspekto-komuna/sets/**` geprüft: die 24 Muster treffen genau die 75 Tokens und die 3 `deveno`-Tokens; kein Kern-Regulo-Muster trifft einen davon | AC-8 gilt durch Konstruktion; der Test belegt es trotzdem |

### Entscheidungen zu den Daten

- **D-1 – Kialo „wörtlich“.** Manche Zellen in §5 enthalten Markdown: Backticks um Regulo-Namen und ein abschließendes `**A**` (Annahme). Kein bestehender Kialo enthält einen Backtick. Der `kialo` im JSON ist der §5-Text ohne die Backticks (Inhalt bleibt) und ohne das abschließende ` **A**`; jedes andere Zeichen ist byte-gleich, auch „…“, das Minuszeichen − und Dezimalkommas.
- **D-2 – Statement und Scope.** AC-2 gibt „Name, Statement, Kialo, Tokens“ frei, §5 enthält aber keine Statements (nur §3 zeigt eines für `komuna-schriftgewichte`). `statement` ist ein deutscher Sachsatz aus der §5-Spalte „Wert“: nur Werte, keine Begründung, keine Schriftfamilie, Schriftgießerei, Fonto oder fremde System-Namen. `scope` hat die feste Form `aspekto komuna: <Muster, durch Komma getrennt>`. Der Maintainer prüft beides im PR.

### Entscheidungen zu den Tests (KIA-1.1)

- **D-KIA1-1** Die freigegebene Tabelle (Name → `appliesTo.tokens` → geschlossene 048-Lücken, 24 Zeilen, 75 Tokens) steht als Konstante in `grafeo-kialo-049.test.ts` (metiejo) und in `regularo-komuna-049.test.ts` (modelo), gleich in beiden; die Pakete teilen keinen Testcode. Nur der modelo-Test vergleicht sie mit `specs/048-…/luecken.json` (B-4).
- **D-KIA1-2** komunas Paket wird an `aspekto.json` `name === "komuna"` erkannt, nicht am Verzeichnis- oder npm-Namen. „Ohne Paket-Reguloj“ entfernt im Speicher nur das Dokument `reguloj` dieses Pakets; alles andere bleibt geteilt.
- **D-KIA1-3** provo steht auf der Struktur (komuna 0.2, `packages/aspekto-komuna-0-2`, ohne `reguloj.json`); „vorher“ für provo ist dieselbe Struktur ohne komunas Paket-Reguloj. Heute sind beide Seiten gleich; die Invarianz wird trotzdem geprüft.
- **D-KIA1-4** (a) prüft zusätzlich, dass das Feld `regulo` jedes der 75 Knoten auf ` · <Id der zugeordneten Regulo>` endet: derselbe Grund, dieselbe Regulo (Konsistenz Graph – Modelo – `explain`).
- **D-KIA1-5** (e) prüft zusätzlich, dass kein Knoten seinen Grund verliert; „`neniu` nachher ≤ vorher“ ist ein Befund im Sammel-Array, keine Vergleichs-Assertion (die Diff-Suche §8 sucht `toBeLessThan`). Keine feste Zahl.
- **D-KIA1-6** `scope` wird nur auf das Präfix `aspekto komuna:` geprüft (Wortlaut der Implementation Spec), nicht auf die genaue Form aus D-2.

### Nachtrag KIA-2.1: F-KIA2-1 und die Codeänderung (außerhalb der Frei-Liste §7)

- **F-KIA2-1.** Mit den 24 Reguloj scheiterten `pnpm build` (modelo) und `pnpm fm modelo validate` an **48 × `traduko-missing`** (je Regulo `…/statement` und `…/kialo`), keine andere Regel. `tekstojOf` (`packages/modelo/src/lingvo/tradukoj.ts`) erkannte Paket-Reguloj nur am Namensraum der Id (`coreId`: `reg_<ns>_…`). komuna ist das Referenz-Aspekto ohne `idNamespace` und prägt Kern-Ids (`reg_01…`), seine Reguloj galten also als Kern-Texte, die in `packages/modelo/data/tradukoj.json` (tabu) eine deutsche Übersetzung brauchen. Der Kommentar dort wollte Paket-Reguloj ausdrücklich ausnehmen.
- **Maintainer-Entscheidung 2026-11-11: Option 2** – den Filter in `tradukoj.ts` korrigieren (verworfen: 48 Einträge in `data/tradukoj.json`; `idNamespace` für komuna).
- **Codeänderung** `packages/modelo/src/lingvo/tradukoj.ts:70` vorher `.filter((regulo) => coreId(regulo.id))` → nachher `:72` `.filter((regulo) => regulo.aspekto === undefined && coreId(regulo.id))`; Doc-Kommentar von `tekstojOf` (`:59` → `:59-61`) nennt den Grund. Kein Kern-Regulo trägt `aspekto` (`packages/modelo/data/reguloj.json`: 0 von 62), `packageEntries` (`build.ts:271`) setzt es bei jeder Paket-Regulo. Kern-Texte und `data/tradukoj.json` bleiben unverändert.
- **Neuer Test** `packages/modelo/src/lingvo/tradukoj-049.test.ts` (zuerst rot: 4 statt 2 Schlüssel, 2 × `traduko-missing`; nach der Änderung grün).
- Beide Dateien stehen außerhalb der Frei-Liste §7 und der Liste aus Abschnitt 3 der Implementation Spec; sie gehören in den PR-Text.

### Abhängigkeiten

Keine neue Abhängigkeit: `pnpm-lock.yaml`, alle Root-Dateien und alle `package.json` bleiben unverändert.
