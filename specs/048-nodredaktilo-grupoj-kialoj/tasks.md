# Spec 048 – Aufgaben (NE-1b: Untergruppen je Ero und geerbte Gründe)

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) (mit Nachtrag NE-1b) · **Basis:** `origin/main` `946248b9` · **Branch:** `261111-spec-048-node-editor-ne-f1aef1`

Fünf Tickets, ein Strang (Spec: „höchstens 5 Tickets, ein PR“). T1–T4 setzen Engineers um, T5 der Orchestrator nach der QA. Commits lokal mit dem Präfix `Spec 048 T<n>: …`; gepusht wird nur in T5, genau einmal. Je Ticket ein Abschnitt unten: erledigte Punkte, Rot→Grün-Beleg, Befunde `F-T<n>-k`, Entscheidungen `D-…`. Diffs gegen `origin/main`, nicht gegen das lokale `main`.

| Ticket | Inhalt | Stand |
|---|---|---|
| T1 (NE1B-1) | Spec-Ordner; dritte Ebene (Komponenten-Untergruppen) und 60er-Regel in `grafeo.ts`; `grafeo-grupoj-048` | erledigt (Befunde F-T1-1 bis F-T1-4, Entscheidungen D-T1-1 bis D-T1-5; eine D-6-Änderung an einem 047-Test) |
| T2 (NE1B-2) | `knotenartDe`, `kialoDe`, `begruendungDe`, `ohneGrund` in `sichtbaro` (Opt-in); `grafeo-kialo-048` | erledigt (Befunde F-T2-1 bis F-T2-5, Entscheidungen D-T2-1 bis D-T2-4; kein 047-Test geändert) |
| T3 (NE1B-3) | Leinwand: Aufklappen in Stufen, Seitenspalte mit Art und geerbtem Grund, Zahl an Gruppen | erledigt (Browser-Beleg unten; Befund F-T3-1 behoben, F-T3-2 fremd; Entscheidungen D-T3-1 bis D-T3-3; kein 047-Test geändert) |
| T4 (NE1B-4) | Messung, Bilder, `luecken.json`, Diff-Suche, Bericht-Entwurf | erledigt (9 Bilder und `messung.json` außerhalb des Repos; `luecken.json` 75 / 156 / 160; Diff-Suche 1–7 sauber; lokale Läufe grün, ein Lastbefund zugeordnet; Bericht-Entwurf mit Platzhalter für T5; Entscheidungen D-T4-1 bis D-T4-4; kein 047-Test geändert) |
| T5 (NE1B-5) | Ein PR, ein Push, ein `workflow_dispatch`, Bericht (Orchestrator) | offen |

## T1 im Einzelnen

- [x] `spec.md` mit `cp` aus `.fundamento/spec048/spec.md`; `cmp` gegen die Quelle Exit 0 und gegen `user-provided-product-spec-ne1b-grupoj-kialoj.md` Exit 0; SHA-256 `687e8dc43d59b52156b510d9104ba6fcaf79e802b92858ceeb7f9bfb39eef0fe`. Wird nicht editiert.
- [x] `plan.md`: byte-gleiche Kopie der technischen Spec (die ersten 9 653 Byte, `cmp` Exit 0; SHA-256 der Quelle `9b832eb50bd4a94f8c576057fd89fd99c971ebfa90e6d6cb37be59b8ea1adfa8`), danach `## Nachtrag NE-1b (Umsetzung)` mit den Abweichungen des Ist-Zustands (Datei:Zeile), den Befunden F-1 bis F-8, den Entscheidungen D-1 bis D-8 und A-1 und „keine neue Abhängigkeit“.
- [x] `tasks.md` mit den fünf Tickets.
- [x] Roter Test zuerst: `packages/metiejo/src/grafeo-grupoj-048.test.ts`. Lauf (`FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo exec vitest run src/grafeo-grupoj-048.test.ts`): **5 rot, 6 grün** (3,4 s). Rot aus dem erwarteten Grund:
  - `:164` „keeps the limit of the spec as a constant“: `expected undefined to be 60` (`GRUPPE_MAX` gibt es noch nicht);
  - `:197` Komponenten unter `<achse>/komponenten/<name>`: 5 137 Befunde (alle Komponenten-Tokens lagen direkt in `<achse>/komponenten`);
  - `:236` `grupojDe` für den tiefsten Ero-Token: 6 Befunde (Tiefe 2 statt ≥ 3);
  - `:282` neuer Token `ero.zzzneu.probo`: landete in `farbe/komponenten`, nicht in `farbe/komponenten/zzzneu`;
  - `:302` Teilen über `GRUPPE_MAX`: keine Untergruppen `zzzgross`/`zzzgrosb`.
  
  Grün schon vorher (Invarianten, die zwei Ebenen bereits erfüllen): entweder Untergruppen oder Knoten, genau eine Gruppe je Knoten, Id-Form, Tiefensuche-Reihenfolge, byte-gleich. Der Test „höchstens `GRUPPE_MAX` Kinder“ war im roten Lauf leer wahr, weil `GRUPPE_MAX` `undefined` war (Vergleich `n > undefined`); der Konstanten-Test deckt das ab. Commit `520fa032` (zusammen mit `spec.md` und `plan.md`).
- [x] Umsetzung in `packages/metiejo/src/grafeo.ts`:
  - `export const GRUPPE_MAX = 60` (in `grafeo.ts`, nicht in `grafeo-sicht.ts`; die 048-Tests importieren über `./grafeo.js`).
  - Gruppenbaum `Arbo` (Id → `{ etikedo, patro? }`): jede Gruppe wird beim Zuordnen mit Eltern und Beschriftung angelegt, `patro` wird nie aus der Id zurückgerechnet.
  - `assignGroups`: Komponenten-Tokens (`ero.*` und `sxablono.*`, D-1) nach `<achse>/komponenten/<zweiter Pfadteil>`; Achsen ohne Untergruppen bleiben bei `weitere` als direkte Mitglieder (D-2). Alles andere wie bisher (`GRUPO_TABELO`, längstes Präfix).
  - `dividu` (60er-Regel): jede Gruppe mit mehr als `GRUPPE_MAX` direkten Knoten wird am ersten Punkt-Index geteilt, an dem ihre Mitglieder nicht alle gleich sind, nach `<gruppe>/<teil>` (`etikedo` = `<teil>`, `patro` = alte Gruppe); neue Gruppen kommen in dieselbe Warteschlange, bis keine mehr zu groß ist. Eine geteilte Gruppe behält keinen direkten Knoten. Gilt für jede Gruppe, ohne Namensliste.
  - `groupsOf`: Achsen in fester Reihenfolge, darunter Tiefensuche, Geschwister nach Id sortiert; Mitglieder sortiert. Keine Map-/Set-Reihenfolge erreicht die Ausgabe.
- [x] `grafeo-sicht.ts`: nur Doc-Kommentare verallgemeinert (`Nodo.grupo`, `Grupo.id`/`etikedo`/`patro`/`nodoj`, `Grafeo.grupoj`, `SichtNodo.grupo`, Doc von `sichtbaro`). Keine Logik geändert (`git diff` zeigt nur Kommentarzeilen), weiter **null** Import-Anweisungen.
- [x] Grün: `grafeo-grupoj-048` **11/11** (3,9 s). Zusammen mit `grafeo-047`, `grafeo-neu-047`, `grafeo-kialo-047`, `grafeo-route-047`, `abhaengigkeiten-047`: **45 bestanden, 0 rot** (22,1 s). Zugeklappt weiter 8/7/8 (komuna/ekzemplo/provo, Grenze 40 unverändert).
- [x] `pnpm --filter @fundamento/metiejo lint`: grün (`tsc` ohne Fehler; Biome 1 Warnung, alt: `src/komponentoj.ts:42` `noUnusedImports`, älter als der Branch, nicht angefasst).
- [x] `packages/modelo/src/ci/turbo-inputs.test.ts` allein: **8/8** grün (4,0 s), kein `*-048`-Eintrag; diesmal kein Hook-Timeout.

### D-6: geänderte 047-Tests (für PR-Text und Bericht)

| Datei:Zeile | Vorher | Nachher | Grund |
|---|---|---|---|
| `packages/metiejo/src/grafeo-neu-047.test.ts:39-41` | `expect(nove.map(({ id, grupo }) => ({ id, grupo }))).toEqual([{ id: "color.zzzprobo", grupo: "farbe/rollen" }]);` | `// Spec 048 (D-6): …` · `expect(nove.map(({ id }) => id)).toEqual(["color.zzzprobo"]);` · `expect(nove[0]?.grupo).toMatch(/^farbe\/rollen(\/\|$)/);` | `farbe/rollen` hat 88 direkte Knoten > `GRUPPE_MAX`; die 60er-Regel teilt sie (`color`/`opacity`, dann `color/<teil>`), der Token liegt jetzt in `farbe/rollen/color/zzzprobo`. Absicht bleibt: genau ein neuer Knoten, in der Gruppe seines Präfixes oder darunter, nichts geht verloren. |

Kein anderer 047-Test wurde geändert. `grafeo-047.test.ts:136-151` („in a parent group“) bleibt grün durch D-1; `:178-208` (Reihenfolge lexikografisch) bleibt grün, weil die Tiefensuche mit Id-sortierten Geschwistern dieselbe Reihenfolge ergibt (kein Pfadteil enthält ein Zeichen unter `/`); `:256-264` (genaue `sichtbaro`-Ausgabe) ist von T1 nicht berührt.

### Gruppenbaum je Marke (nach T1)

Kinder = direkte Knoten + direkte Untergruppen (was das Aufklappen sichtbar macht). Graph aus `grafeoDePaket` (komuna, ekzemplo) bzw. `grafeoDe` (provo, Fixture-Agordo über `loadBases()`); gezählt mit einem Wegwerf-Skript außerhalb des Repos gegen `packages/metiejo/dist`.

| | komuna | ekzemplo | provo |
|---|---:|---:|---:|
| Knoten | 2 115 | 2 115 | 2 133 |
| Gruppen gesamt | 300 | 300 | 301 |
| Tiefe | 4 | 4 | 4 |
| Gruppen je Ebene 1 / 2 / 3 / 4 | 8 / 19 / 238 / 35 | 7 / 19 / 239 / 35 | 8 / 19 / 239 / 35 |
| größte Ebene 1 (Kinder) | `weitere` 8 | `elevation` 3 | `eingaben` 18 |
| größte Ebene 2 | `raum/komponenten` 47 | `raum/komponenten` 47 | `raum/komponenten` 47 |
| größte Ebene 3 | `farbe/komponenten/kampo` 55 | `farbe/komponenten/kampo` 55 | `farbe/komponenten/kampo` 55 |
| größte Ebene 4 | `farbe/komponenten/butono/border` 24 | dieselbe, 24 | dieselbe, 24 |
| zugeklappt sichtbar | 8 | 7 | 8 |

Keine Gruppe über 60. Ebene 4 gibt es unter `farbe/komponenten/butono`, `farbe/komponenten/datelektilo` und `farbe/rollen/color`. Außerhalb der Komponenten geteilt (60er-Regel): `farbe/palette` (9 Untergruppen je Palette: accent, danger, info, neutral, sekundo, shade, success, tint, warning), `farbe/rollen` (2: `color`, `opacity`; `color` weiter in 12), `schrift/palette` (5: family, lineheight, size, tracking, weight). komuna: `farbe/komponenten` 43 Untergruppen (Ero- und Sxablono-Namen), `farbe` 3.

### Befunde

- **F-T1-1** `farbe/rollen` teilt sich zuerst nur in `color`/`opacity` (2 Kinder), eine dünne Ebene; erst `farbe/rollen/color` (12 Kinder) ist lesbar. Die Regel ist allgemein und bleibt so; Befund für den Bericht (NE-2).
- **F-T1-2** Die größte sichtbare Gruppe ist jetzt `raum/komponenten` mit 47 Untergruppen (Ero + Sxablono, D-1), die größte Blattgruppe `farbe/komponenten/kampo` mit 55 Knoten – nahe an 60. Ein paar Tokens mehr für `kampo` teilen sie automatisch.
- **F-T1-3** Keine Gruppen-Id hat einen Pfadteil mit einem Zeichen unter `/` (`-`, `.`, Leerzeichen…); deshalb gilt die 047-Prüfung „nach Achse, dann Id“ weiter. Kommt so ein Teil, greift D-6 für `grafeo-047.test.ts:178-208`.
- **F-T1-4** Der Fall „ein Mitglied endet vor dem Teilungs-Index“ (ein Token, dessen Pfad ein Präfix eines anderen ist) kommt in den Daten nicht vor. `dividu` behandelt ihn deterministisch über den letzten Pfadteil; fällt dabei alles in einen Teil, bleibt die Gruppe ungeteilt und der Test nennt sie. Kein Knoten geht verloren.

### Entscheidungen

- **D-T1-1** `GRUPPE_MAX` steht in `grafeo.ts` (nicht in `grafeo-sicht.ts`); T3/T4 brauchen den Wert nicht im Browser-Bündel. Der Test prüft `GRUPPE_MAX === 60` (die Zahl legt die Spec fest).
- **D-T1-2** Eltern und Beschriftung jeder Gruppe kommen aus einem beim Zuordnen gefüllten Baum, nicht aus dem Zerlegen der Id an `/` (ein Pfadteil könnte `/` enthalten).
- **D-T1-3** Beschriftung (`etikedo`): Ebene 1 die Achse, Ebene 2 unter einer Achse mit Untergruppen der Name aus `SUBGRUPOJ` („Palette“, „Rollen“, „Komponenten-Tokens“), darunter der rohe Pfadteil (Ero-Name, Teilungsteil), nie übersetzt. Eine geteilte Gruppe von `weitere`/`eingaben` trägt auf Ebene 2 ihren Pfadteil.
- **D-T1-4** Der Ero-Name ist der zweite Pfadteil (`id.split(".")[1]`); wäre er leer, gilt die ganze Id (kommt nicht vor).
- **D-T1-5** Der Test zur neuen Ebene wählt die Farbrolle für die erfundenen Tokens aus den Daten (kleinste `color.*`-Id unter `farbe/rollen`) und leitet die Zahl der erfundenen Tokens aus `GRUPPE_MAX` ab; keine Zahl der Produktionsdaten steht im Test.

### Commits

- `520fa032` Spec 048 T1: red test – grafeo-grupoj-048
- `a2147f51` Spec 048 T1: component sub-groups and the 60-rule

## T2 im Einzelnen

- [x] Roter Test zuerst: `packages/metiejo/src/grafeo-kialo-048.test.ts`. Lauf gegen `a2147f51` (`FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo exec vitest run src/grafeo-kialo-048.test.ts`): **19 rot, 3 grün** (2,4 s). Rot aus dem erwarteten Grund: `knotenartDe`/`kialoDe`/`begruendungDe` „is not a function“ (es gibt sie noch nicht), dazu `:323` „counts the decisions without own reason“: `expected [ 'eingaben=-', 'farbe=-', … ] to deeply equal [ 'eingaben=1', 'farbe=3', … ]` (kein `ohneGrund`). Grün schon vorher: „leaves the view of 047 unchanged without the option“, „answers what 047 answered without the option“ (die Option wurde noch ignoriert) und „has no import statement“. Commit `d909caf2`.
- [x] Umsetzung in `packages/metiejo/src/grafeo-sicht.ts` (weiter **null** Import-Anweisungen; der Test prüft das mit einem Grep über die Datei):
  - `export type Knotenart = "decido" | "mekaniko" | "transpreno"`; `knotenartDe(g, id)` nach den Regeln der technischen Spec B, erste passende Regel: (1) `speco === "enigo"` → `decido`; (2) `regulo` beginnt mit `paletto`/`gestalto` → `mekaniko` (vor der Rolle); (3) keine Komponente (`ero.`/`sxablono.`), mindestens eine Ligo von einem `ero.*`-Knoten, und das eigene `al` (D-5: `devenoDe(g, id)[1]`) liegt in einer Palette-Gruppe (D-4: zweites Segment der Gruppen-Id ist `palette`) oder hat ein `regulo`, das mit `fiksa` beginnt → `decido`; (4) sonst `transpreno`. Unbekannte Id → `undefined`.
  - `kialoDe(g, id)`: eigenes `kialo` → `{ fonto: "propra", kialo }`; sonst der erste Knoten mit `kialo` ab `devenoDe(g, id)[1]` → `{ fonto: "heredita", de, kialo }`; sonst (und für eine unbekannte Id) `{ fonto: "neniu" }`.
  - `export type Begruendung` und `begruendungDe(g, id)` genau nach Vertrag 2.2: Mechanik → `{ art: "mekaniko" }`; Entscheidung mit eigenem Grund → `grund`, sonst `fehlt` (ein geerbter Grund zählt nicht); Übernahme → `grund` / `geerbt` (mit `de`, `kialo`) / `neniu`. Unbekannte Id → `undefined`.
  - `SichtNodo.ohneGrund?: number`; `sichtbaro(g, malfermitaj, opcioj = {})`: nur mit `{ ohneGrund: true }` trägt jeder Gruppenknoten `ohneGrund` (transitiv, 0 eingeschlossen; D-3). Ohne Option ist die Ausgabe dieselbe wie in 047 (kein Schlüssel `ohneGrund`).
  - Geschwindigkeit: ein Index je Graph (`WeakMap<Grafeo, Indekso>`) mit Knoten nach Id, dem kleinsten `al` je Knoten (das nächste Glied der Kette), den Zielen von `ero.*`-Ligoj, Gruppen, Vorfahren und Knotenzahl je Gruppe; die `ohneGrund`-Zählung je Gruppe entsteht beim ersten Aufruf mit Option und bleibt am Index. `devenoDe` läuft jetzt über denselben Index (gleiche Ausgabe, kein Neuaufbau der ausgehenden Ligoj je Aufruf; `outgoing()` entfällt). Gemessen (Wegwerf-Skript gegen `packages/metiejo/dist`, provo, `farbe` + `farbe/komponenten` offen): erster `sichtbaro`-Aufruf mit Option 4,1 ms (baut Index und Zählung), danach je Umschalten Median 0,8 ms (max 2,0 ms), ohne Option 0,9 ms; `begruendungDe` für alle 2 133 Knoten 1,7 ms. Eine Messung, kein Budget.
- [x] Grün: `grafeo-kialo-048` **22/22**. Zusammen mit `grafeo-grupoj-048`, `grafeo-047`, `grafeo-neu-047`, `grafeo-kialo-047`, `grafeo-route-047`, `abhaengigkeiten-047`: **67 bestanden, 0 rot** (20,8 s). Kein 047-Test geändert (D-3 hält `grafeo-047.test.ts:256-264` grün).
- [x] `pnpm --filter @fundamento/metiejo lint`: grün (1 alte Biome-Warnung `src/komponentoj.ts:42`, unverändert). `pnpm --filter @fundamento/nodredaktilo lint`: grün. `pnpm --filter @fundamento/nodredaktilo build` (ohne turbo, F-6): grün, `dist/leinwand.js` 633,62 kB.

### Zählung je Marke (nach T2)

Aus dem Graphen mit den T2-Funktionen gezählt (Wegwerf-Skript außerhalb des Repos gegen `packages/metiejo/dist`); der Test leitet dieselben Zahlen aus den Daten ab und hält keine fest. „ohne Grund“ = Entscheidungen mit `begruendungDe(…).montro === "fehlt"` = Summe von `ohneGrund` über die Achsen-Gruppenknoten (eine Definition, 2.2).

| | komuna | ekzemplo | provo |
|---|---:|---:|---:|
| Knoten | 2 115 | 2 115 | 2 133 |
| Entscheidung (`decido`) | 339 | 317 | 222 |
| Mechanik (`mekaniko`) | 0 | 0 | 102 |
| Übernahme (`transpreno`) | 1 776 | 1 798 | 1 809 |
| ohne Grund (Entscheidung „fehlt“) | 75 | 156 | 160 |
| geerbt (Übernahme mit `heredita`) | 832 | 1 471 | 1 475 |
| kein Grund in der Kette | 77 | 308 | 308 |
| „fehlt“ in 047 (`vorher047`) | 920 | 1 842 | 1 852 |

`ohneGrund` je Achse (zugeklappt): komuna `farbe` 5, `schrift` 31, `form` 11, `raum` 17, `dichte` 0, `elevation` 6, `bewegung` 5, `weitere` 0; ekzemplo `farbe` 51, `schrift` 31, `form` 20, `raum` 34, `dichte` 0, `elevation` 10, `bewegung` 10; provo `eingaben` 18, `farbe` 51, `schrift` 31, `form` 16, `raum` 28, `dichte` 0, `elevation` 6, `bewegung` 10. Die Summen ergeben je Marke die Zeile „ohne Grund“.

### Befunde: wo die vorläufige Definition falsch einzuordnen scheint (für den Bericht; die Regeln bleiben)

- **F-T2-1 (F-1)** komuna/ekzemplo haben **0 Mechanik**: Palettenstufen sind dort feste Werte (`speco: "enigo"`, `regulo` `fiksa · …`), z. B. `color.palette.danger.150` in `farbe/palette/danger` → Entscheidung (Regel 1); in provo ist derselbe Token `paletto` → Mechanik. Alle 99 `color.palette.*`-Entscheidungen in komuna und ekzemplo sind solche Stufen.
- **F-T2-2** Gestalt-Token, auf den Eroj verweisen, zählt als Mechanik: provo `radius.small` (`form/palette`, `gestalto`, Ziel von `ero.avataro.image.radius.corner.soft` und `ero.avataro.initials.radius.corner.soft`) → Mechanik, ohne Zeile „Begründung“. In komuna und ekzemplo ist derselbe Token eine Entscheidung (fester Wert). In provo der einzige direkt von Eroj referenzierte Mechanik-Knoten.
- **F-T2-3** Ein Alias in einer Palette-Gruppe wird zur Entscheidung, weil sein `al` in derselben Palette-Gruppe liegt (D-4): `border.width.default` (`form/palette`, `alias` → `border.width.scale.1`, Ziel von 36–37 Ero-Tokens). Inhaltlich eine Rolle, die `GRUPO_TABELO` in die Palette sortiert. Solche Nicht-Eingaben als Entscheidung in Palette-Gruppen: komuna 10, ekzemplo 10, provo 6 (u. a. `border.width.focus`, `elevation.shadow.floating`, `motion.duration.fast`).
- **F-T2-4** Eine Rollen-Entscheidung zeigt „fehlt“, obwohl ihre Kette einen Grund trägt: provo `color.action.primary.text` → `color.palette.neutral.0` (der `kialo` der Regel für die Palette). Der geerbte Grund erklärt die Stufe, nicht die Wahl der Rolle; nach Spec richtig „fehlt“, aber auffällig. Entscheidungen mit „fehlt“ und geerbtem Grund: komuna 10, ekzemplo 51, provo 47.
- **F-T2-5** Ein einziger Ero-Verweis macht eine Rolle zur Entscheidung: `color.syntax.keyword` (`farbe/rollen/color/syntax`, nur `ero.kodbloko.keyword.color` verweist darauf, `al` = `color.palette.danger.150`/`.300`) → Entscheidung „fehlt“ in allen drei Marken. Ebenso `radius.role.control` (`form/rollen`, `al` = `radius.medium` in `form/palette`), das in provo auf einem Gestalt-Token (Mechanik) aufsetzt.

### Entscheidungen

- **D-T2-1** `kialoDe` liefert die Union `KialoRezulto` (`propra` mit `kialo`; `heredita` mit `de` und `kialo`; `neniu`), exportiert als Typ. Die nicht vorhandenen Felder sind als `?: never` deklariert, so passt die Union auf die Vertragsform `{ fonto; de?; kialo? }` und lässt sich trotzdem über `fonto` eingrenzen.
- **D-T2-2** Komponente heißt in Regel 3 `ero.*` oder `sxablono.*` (wie `KOMPONENTOJ` in `grafeo.ts`, in `grafeo-sicht.ts` gespiegelt, weil die Datei nichts importiert; D-1). Der Verweis, der eine Rolle auslöst, muss von einem `ero.*`-Knoten kommen (Wortlaut der Spec); ein `sxablono.*`-Verweis allein reicht nicht.
- **D-T2-3** Ein Graph gilt nach dem Lesen als unveränderlich; der Index hängt per `WeakMap` am Objekt. Keine Funktion schreibt in den Graphen (Test: `serializeGrafeo` vor und nach allen Aufrufen gleich), die Rückgaben sind frische Objekte.
- **D-T2-4** Ein eigener `kialo` zählt, sobald der Schlüssel einen Wert hat (`!== undefined`), wie in 047 (`flanko.tsx`: `nodo.kialo ?? …`).

### Commits

- `d909caf2` Spec 048 T2: red test – grafeo-kialo-048
- (dieser Commit) Spec 048 T2: knotenartDe, kialoDe, begruendungDe and opt-in ohneGrund

## T3 im Einzelnen

- [x] `packages/nodredaktilo/src/flanko.tsx`: neue Zeile „Art“ (`dd[data-nr-art]` = „Entscheidung“ | „Mechanik“ | „Übernahme“, derselbe Text als Attributwert). Die Zeile „Begründung“ kommt aus `begruendungDe` (Tabelle der technischen Spec B): `grund` → Text des Grundes; `fehlt` → `fm-insigno intent="warning"` „fehlt“ (wie 047); `geerbt` → „geerbt von“ + `fm-butono[data-nr-geerbt="<id>"]`, darunter der Grund in `fm-teksto`; `neniu` → reiner Text „kein Grund in der Kette“ (kein Insigno, kein Warnton). Mechanik: kein `dt`/`dd` „Begründung“, die Zeile „Regel“ bleibt. Der Klick auf „geerbt von“ läuft wie die Herkunftsliste über einen delegierten Handler an der Zelle und ruft `elekti`.
- [x] `packages/nodredaktilo/src/nodoj.tsx`: zweites `fm-insigno slot="meta" intent="warning" data-nr-ohne-grund="<n>"` mit „`<n>` ohne Grund“ am Gruppenknoten, nur bei n > 0.
- [x] `packages/nodredaktilo/src/kanvaso.tsx`: `sichtbaro(grafeo, malfermitaj, { ohneGrund: true })`. `elekti`/`grupojDe` unverändert: der Browser zeigt keine Lücke bis Ebene 4 (siehe unten).
- [x] Kopfkommentare der drei Dateien auf NE-1b nachgezogen (Gruppen jeder Ebene, Art, geerbter Grund, Zahl ohne Grund, „öffnet jede Gruppe bis zur tiefsten Ebene“).
- [x] Nur vorhandene `fm-*`-Eroj und ihre Props; kein neuer `--fm-*`-Token, keine Farbe/Größe als Literal, keine `.css` (`find packages/nodredaktilo -name '*.css' -not -path '*/node_modules/*'` leer). `fm-elementoj.d.ts` unverändert (`data-*` ist über `HTMLAttributes` schon typisiert).
- [x] `pnpm --filter @fundamento/nodredaktilo lint` grün, `pnpm --filter @fundamento/nodredaktilo build` (ohne turbo, F-6) grün, `dist/leinwand.js` 635,94 kB (T2: 633,62 kB). `pnpm build` grün (10/10).
- [x] `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo exec vitest run src/grafeo-grupoj-048.test.ts src/grafeo-kialo-048.test.ts src/grafeo-route-047.test.ts`: **41 bestanden, 0 rot** (16,8 s).

### Browser-Beleg (Playwright-MCP, Chromium 1600×1000, Metiejo nach Abschnitt 5 auf Port 7301, Arbeitsordner `/tmp/ne1b-marken` mit der provo-Agordo aus der Fixture; nichts im Repo)

Gewartet wurde auf `#nr-leinwand[data-nr-preta]`, nach jedem Umschalten auf einen neuen `data-nr-rev`. Klicks auf die `fm-butono` mit echtem Zeiger (Playwright `locator.click`).

| Abnahme | Weg (Ids) | Ergebnis |
|---|---|---|
| Aufklappen in Stufen (provo hell) | zugeklappt → `farbe` → `farbe/komponenten` → `farbe/komponenten/alsxutilo` | zugeklappt 8 Gruppen, `rev` 0. `farbe`: `farbe/komponenten`, `farbe/palette`, `farbe/rollen` als Gruppen, 0 Tokenknoten, `rev` 1, `dauro` 88. `farbe/komponenten`: 43 Ero-/Sxablono-Untergruppen, **0 Tokenknoten**, `rev` 2, `dauro` 81. `alsxutilo`: 41 Tokenknoten, `rev` 3, `dauro` 88. |
| Übernahme mit geerbtem Grund | `ero.alsxutilo.border.color.disabled` | `[data-nr-art]` „Übernahme“, Regel `alias`, `[data-nr-kialo]` „geerbt von“ + `[data-nr-geerbt="color.palette.neutral.300"]`, darunter der Grund; kein Insigno. Herkunft: `ero.alsxutilo.border.color.disabled` → `color.border.disabled` → `color.palette.neutral.300` → `enigo:leitfarbe`. Bild `t3-provo-alsxutilo-geerbt.png`. |
| Klick auf „geerbt von“ | `[data-nr-geerbt="color.palette.neutral.300"]` | gewählt `color.palette.neutral.300`, geöffnet `farbe/palette` und `farbe/palette/neutral`, `rev` 3 → 4 (`dauro` 129), Knoten sichtbar, eingepasst (Mitte der Leinwand, `data-nr-elektita="true"`). |
| Mechanik | `color.palette.neutral.300` (provo, `paletto · reg_…`) | „Mechanik“, Zeilen `Wert`, `Art`, `Regel`; **kein** `[data-nr-kialo]`, kein „fehlt“. Bild `t3-provo-mechanik.png`. |
| Herkunft-Klick in eine geschlossene Gruppe der Ebene 4 | `ero.alsxutilo.border.color.disabled` gewählt, dann Achse `farbe` zugeklappt, dann Herkunft `color.border.disabled` | **ein Klick** öffnet `farbe` → `farbe/rollen` → `farbe/rollen/color` → `farbe/rollen/color/border`; `rev` 4 → 5 (ein Schritt, `dauro` 181), Knoten sichtbar. Panel: „Entscheidung“ + „fehlt“ (Rolle mit Ero-Verweis, F-T2-4). |
| Letzter Herkunft-Eintrag | `enigo:leitfarbe` | `eingaben` geht auf, `rev` 5 → 6; „Entscheidung“ + `fm-insigno intent="warning"` „fehlt“, Regel „keine“. |
| Kein Grund in der Kette | `form` → `form/komponenten` → `form/komponenten/alsxutilo`, `ero.alsxutilo.border.stroke.dropzone.true.disabled` | „Übernahme“; `[data-nr-kialo]` enthält nur den Text „kein Grund in der Kette“, 0 `fm-insigno`, 0 `[intent="warning"]`. |
| Eigener Grund | `farbe/rollen/color/action`: `color.action.danger.rest` / `color.action.tertiary.selected` | „Entscheidung“ bzw. „Übernahme“, jeweils der eigene Grund als Text, kein Insigno. |
| Zahl an Gruppen | zugeklappt, alle drei Marken, hell und dunkel | provo `eingaben` 18, `farbe` 51, `schrift` 31, `form` 16, `raum` 28, `dichte` –, `elevation` 6, `bewegung` 10 = **160**; komuna `farbe` 5, `schrift` 31, `form` 11, `raum` 17, `dichte` –, `elevation` 6, `bewegung` 5, `weitere` – = **75**; ekzemplo `farbe` 51, `schrift` 31, `form` 20, `raum` 34, `dichte` –, `elevation` 10, `bewegung` 10 = **156**. Gleich den T2-Summen. Jedes `[data-nr-ohne-grund]` > 0 und `intent="warning"`; bei 0 fehlt es (`dichte`, `weitere`, `farbe/palette`, `farbe/komponenten`, `…/color/brand`, `…/color/sekundo`). Unter `farbe/rollen/color` (12 Untergruppen): `action` 7, `backdrop` 1, `background` 1, `border` 4, `focus` 1, `link` 1, `navigation` 5, `status` 20, `syntax` 5, `text` 2 = 47; mit `opacity` 4 = `farbe/rollen` 51 = `farbe` 51. Bild `t3-provo-rollen-color-ohne-grund.png`. |
| komuna Palette (F-1) | `/aspekto/komuna/grafeo`: `farbe` → `farbe/palette` (9 Untergruppen) → `farbe/palette/danger`, `color.palette.danger.150` | „Entscheidung“, Regel `fiksa · reg_…`, eigener Grund – erwartet nach F-1/F-T2-1, kein Fehler. |
| 047-Verhalten | alle drei Marken, `?scheme=dark` | zugeklappt 8/7/8; React Flow `colorMode` folgt dem Schema (hell/dunkel); 0 Konsolenfehler auf den Graph-Seiten (beide Schemata); 0 `.selected`, `localStorage`/`sessionStorage` leer; „Graph ansehen“ in `/studio/provo/farbe` führt zu `/marko/provo/grafeo?scheme=light`, die Leinwand wird bereit. |

Bilder (außerhalb des Repos): `purple/documentation/261111-spec-048-node-editor-ne-1b-untergruppen-je-ero-und-geerbte-grnde/qa-screenshots/t3-provo-alsxutilo-geerbt.png`, `t3-provo-mechanik.png`, `t3-provo-rollen-color-ohne-grund.png`. Server danach gestoppt, Browser geschlossen.

### Befunde

- **F-T3-1 (behoben)** Herkunftsliste zeigte nach einem Klick in die Kette „3.“, „4.“ statt „1.“, „2.“: React entfernt bei gleichen Schlüsseln nur die vorderen `li`, Chromium zählte das `ol` dabei nicht neu (DOM korrekt: 2 `li`, `start` 1). Schon in 047 so, mit „geerbt von“ jetzt häufiger. Behebung in `flanko.tsx`: beide Listen bekommen `key={nodo.id}`, so entsteht je gewähltem Knoten eine neue Liste. Im Browser geprüft (danach „1.“, „2.“).
- **F-T3-2 (fremd)** `/studio/provo/farbe` meldet zweimal die Warnung `fm-ikono: name is required …` (Studio-Seite, nicht die Leinwand; `html.ts`/Eroj sind tabu). Keine Fehler.

### Entscheidungen

- **D-T3-1** `data-nr-art` trägt als Wert denselben Text wie die Zelle („Entscheidung“/„Mechanik“/„Übernahme“), damit sowohl `dd[data-nr-art]` mit Textvergleich als auch `[data-nr-art="Übernahme"]` greifen (T4, QA).
- **D-T3-2** „geerbt von“ steht als Text in der Zelle, die Quelle als `fm-butono size="small" emphasis="low"` (wie die Einträge der Herkunftsliste), der Grund darunter als `fm-teksto`.
- **D-T3-3** Ein Knoten ohne Ergebnis von `begruendungDe` (nur bei unbekannter Id, kommt in der Leinwand nicht vor) zeigt weder „Art“ noch „Begründung“.

### Commits

- (dieser Commit) Spec 048 T3: canvas shows kind, inherited reason and ohne-Grund badges

## T4 im Einzelnen

- [x] `packages/nodredaktilo/scripts/bilder.ts` erweitert, Aufruf gleich (`--ziel <dir> [--luecken <file>]`). Unverändert aus 047: Metiejo als Kindprozess auf freiem Port, Wegwerf-Arbeitsordner mit der provo-Fixture, Chromium 1600×1000, Playwright-Standardgrenzen unangetastet (`NICHT_GEMESSEN`), `INIT_CWD`, kanonisches JSON.
  - `luecken()`: Entscheidungen ohne Grund (`begruendungDe(…).montro === "fehlt"`), je `nodo.grupo`, Ids sortiert.
  - Je Marke `arten`, `ohneGrund`, `geerbt` (`montro: "geerbt"`), `keinGrundInKette` (`montro: "neniu"`) aus dem API-Graphen mit den T2-Funktionen; `vorher047` fest 920 / 1842 / 1852 (komuna / ekzemplo / provo).
  - Laufzeit-Import über den Alias `@fundamento/metiejo/grafeo` (tsconfig `paths` → `grafeo-sicht.ts`): mit tsx 4.23.15 geprüft (`pnpm exec tsx -e 'import { begruendungDe, knotenartDe } from "@fundamento/metiejo/grafeo"; …'` → `function function`), kein relativer Import nötig.
  - `groessteGruppeJeEbene` 1–4 (Ebene = Zahl der `/`-Teile, Kinder = direkte Knoten + direkte Untergruppen, Gleichstand → kleinere Id); `aufklappenMsJeEbene` 1–4: je Ebene eine frische Seite, Vorfahren ungemessen geöffnet, dann 5 gemessene Aufklapp-Zyklen (`data-nr-dauro`), Median und Max; `klickAuf`/`klickZu` hält fest, ob Zeigerklick oder `click`-Ereignis.
  - Bilder (hell, eingepasst): `bilder/<marke>-zu.png`, `<marke>-farbe-komponenten.png`, `<marke>-ero-offen-geerbt.png`; die alten Namen `-hell`/`-dunkel`/`-offen` entfallen.
  - Beibehalten zum Vergleich: `nodoj`, `ligoj`, `zugeklappt`, `bisSichtbarMs`. Entfallen: `groessteGruppe`, `aufklappenMs`, `offenBild` (ersetzt durch die Felder je Ebene und `geerbtBild`).
- [x] `pnpm build` grün (10/10); `pnpm --filter @fundamento/nodredaktilo lint` grün.
- [x] Lauf aus dem Repo-Wurzelverzeichnis: `pnpm --filter @fundamento/nodredaktilo bilder --ziel /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec048 --luecken specs/048-nodredaktilo-grupoj-kialoj/luecken.json` → Exit 0, Chromium 153.0.8010.12; kein `NICHT_GEMESSEN`. Geschrieben: 9 PNG unter `…/.fundamento/spec048/bilder/`, `…/.fundamento/spec048/messung.json` (SHA-256 `d8f8d98d…0fa4`), `luecken.json` (SHA-256 `13288e6f…1590`). Metiejo und Browser vom Skript beendet.
- [x] Eine Definition: `luecken.json` 75 / 156 / 160 = `messung.json.ohneGrund` = Summe der Achsen-`ohneGrund` (das Skript bricht ab, wenn die drei nicht gleich sind) = die T2-Zahlen.
- [x] Alle 9 Bilder angesehen: „zu“ zeigt 8 / 7 / 8 Achsen mit „`<n>` ohne Grund“; „farbe-komponenten“ die Untergruppen von `farbe/komponenten` (eingepasst eine schmale Spalte, Befund F-T4-1); „ero-offen-geerbt“ die Seitenspalte mit „Übernahme“ und „geerbt von“: komuna `ero.alsxutilo.border.color.dragover` ← `color.border.strong`, ekzemplo und provo `ero.alsxutilo.border.color.disabled` ← `color.palette.neutral.300`.

### Messung (aus `messung.json`)

| | komuna | ekzemplo | provo |
|---|---:|---:|---:|
| Knoten / Kanten | 2115 / 2200 | 2115 / 2058 | 2133 / 2420 |
| Entscheidung / Mechanik / Übernahme | 339 / 0 / 1776 | 317 / 0 / 1798 | 222 / 102 / 1809 |
| ohne Grund (vorher 047) | 75 (920) | 156 (1842) | 160 (1852) |
| geerbt / kein Grund in der Kette | 832 / 77 | 1471 / 308 | 1475 / 308 |
| Ebene 1: Gruppe (Kinder), Aufklappen Median / Max ms | `weitere` (8), 80 / 94 | `elevation` (3), 80 / 94 | `eingaben` (18), 80 / 94 |
| Ebene 2: `raum/komponenten` (47) | 80 / 96 | 80 / 81 | 80 / 96 |
| Ebene 3: `farbe/komponenten/kampo` (55) | 96 / 129 | 96 / 113 | 96 / 112 |
| Ebene 4: `farbe/komponenten/butono/border` (24) | 95 / 95 | 78 / 80 | 79 / 80 |
| 047: `farbe/komponenten` (920), Median / Max ms | 1364 / 1446 | 1391 / 1512 | 1463 / 1695 |
| zugeklappt | 8 | 7 | 8 |
| bis sichtbar Median / Max ms (047) | 334 / 356 (316 / 382) | 351 / 421 (337 / 345) | 201 / 235 (159 / 185) |
| Klicks | alle `zeiger` | alle `zeiger` | alle `zeiger` |

### Diff-Suche (gegen `origin/main` = `946248b9`, RR-11; nach dem ersten T4-Commit `d63ff7e6`, Wiederholung nach dem letzten Commit siehe unten)

1. `git diff --name-only origin/main...HEAD` + `git status --porcelain`: 13 Pfade (`packages/metiejo/src/grafeo{,-sicht}.ts`, `grafeo-grupoj-048.test.ts`, `grafeo-kialo-048.test.ts`, `grafeo-neu-047.test.ts`, `packages/nodredaktilo/scripts/bilder.ts`, `src/{flanko,kanvaso,nodoj}.tsx`, `specs/048-nodredaktilo-grupoj-kialoj/{spec,plan,tasks}.md`, `luecken.json`) plus das neue `bericht.md`. Gegenprobe `grep -vE '^(packages/metiejo/src/grafeo[^/]*\.ts|packages/nodredaktilo/|specs/048-nodredaktilo-grupoj-kialoj/)'`: **leer**.
2. `git diff --name-only origin/main...HEAD -- packages/modelo packages/agordilo packages/eroj packages/mcp packages/vortaro .github packages/metiejo/src/test-doubles`: **0**. Keine Root-Datei, kein `package.json`, kein `pnpm-lock.yaml`.
3. `git diff -U0 origin/main -- . | grep -nE '^\+.*(timeout|Timeout|threshold|sojlo|limit|Limit|toBeLessThan|GRUPPE_MAX|\b60\b|\b40\b)'`: Treffer nur in `grafeo.ts` (3: `GRUPPE_MAX = 60`, Kommentar und Vergleich der 60er-Regel), `grafeo-grupoj-048.test.ts` (15: `GRUPPE_MAX` und der Testname „keeps the limit of the spec as a constant“), `grafeo-neu-047.test.ts` (1: D-6-Kommentar „the 60-rule“), `spec.md` (3) und `plan.md` (4) als wörtliche Kopien, `tasks.md` (13 nach `d63ff7e6`, nach dem letzten Commit mehr: diese Diff-Suche zitiert das Muster, „Grenze 40 unverändert“, „Hook-Timeout“ von `turbo-inputs`, die nordstelo-Zeitgrenzen der lokalen Läufe), `bericht.md` (1: Befund „Nahe an 60“). `bilder.ts`: 0. Keine Grenze angehoben.
4. Private Namen (RR-6): `pnpm check:privat` nach dem Commit **PASS** (4358 Dateien, 0 Treffer). Zusätzlich die hinzugefügten Zeilen und die Commit-Nachrichten mit dem Matcher des Repos: `git diff origin/main...HEAD | grep '^+' > /tmp/ne1b-plus.txt; git log origin/main..HEAD --format=%B >> /tmp/ne1b-plus.txt; node -e 'import("./packages/modelo/dist/checks/privat/rules.js").then(m=>{…findPrivateNames…})'` → **0** (2599 Zeilen).
5. Marken: die hinzugefügten Zeilen nennen nur `komuna`, `ekzemplo`, `provo` (gelesen; Gegenprobe gegen eine Liste fremder Marken- und Design-System-Namen leer). `pnpm check:clean-room` **PASS**.
6. Kein neuer Kern-Token: keine Änderung an Vortaro- oder Modelo-Daten (durch 2. abgedeckt).
7. `git status --porcelain | grep -E '\.png$|messung\.json'`: **leer**; `git ls-files` kennt kein Bild und keine `messung.json` aus diesem Lauf.

### Lokale Läufe (Hintergrund, `FM_AUSGABE=knapp`, RR-10)

- `pnpm test:betroffen` (Basis `946248b9`; 6 Pakete: cli, ekranoj, metiejo, modelo, nodredaktilo, nordstelo; Engines nur Chromium): **rot**, 1 von 15 Aufgaben – `@fundamento/nordstelo#test` 3 rot, alle in unveränderte Zeitgrenzen bei paralleler Last: `packages/nordstelo/src/ablauf/raporto.test.ts:236` (Test-Timeout 5 s), `packages/nordstelo/src/ac8.test.ts:156` und `packages/nordstelo/src/ablauf/integra.test.ts:131` (Hook-Timeout 10 s). Turbo hat danach die übrigen Aufgaben nicht mehr gestartet.
- Dieselbe Auswahl seriell (`pnpm exec turbo run test --output-logs=errors-only --concurrency=1 --continue --filter=…` mit denselben sechs Paketen und `PLAYWRIGHT_ENGINES=chromium`): **15/15 grün** (650 s); JUnit: cli 120, ekranoj 301, metiejo 675, modelo 4938 (auch `turbo-inputs` diesmal grün), nordstelo 270 Tests, je 0 rot. Zuordnung: Lastbefund wie in 047 (Bericht 047 Abschnitt 1, „Parallel unter hoher Rechnerlast …“), nicht durch Spec 048 (nordstelo ist nur betroffen, weil es von metiejo abhängt; keine Datei von nordstelo geändert). Keine Wiederholung über den einen seriellen Lauf hinaus nötig.
- `pnpm lint`: **grün**. `pnpm check:vortaro-lint`: **PASS**. `pnpm check:clean-room`: **PASS**. `pnpm check:privat`: **PASS**.
- Bekannt rot und fremd (RR-7), nicht angefasst: `packages/eroj/test/zweitfarbe-036*` (nicht betroffen, lief nicht) und `modelo turbo-inputs` (lief grün).

### Befunde

- **F-T4-1** Eingepasst liegen die 43 Untergruppen von `farbe/komponenten` in einer einzigen Spalte; bei 1600×1000 ist dann kein Knoten lesbar (`*-farbe-komponenten.png`, `*-ero-offen-geerbt.png`). Befund für NE-2 (Geschwister umbrechen oder auf die geöffnete Gruppe einpassen).
- **F-T4-2** Geerbte Gründe kommen aus wenigen Texten: ekzemplo und provo erben 1471 / 1475 mal aus 11 verschiedenen `kialo`-Texten (komuna 832 aus 77); in provo stammen 380 von einem Mechanik-Knoten (Text der Rampen-Regel), häufigste Quellen `color.text.default` (190), `color.text.muted` (120), `spacing.small` (77). Gezählt mit einem Wegwerf-Skript außerhalb des Repos gegen `packages/metiejo/dist/grafeo-sicht.js` und die API-Graphen. Eingang für die Antwort „Trägt die Dreiteilung?“.
- **F-T4-3** Jeder Klick erreichte sein Ziel mit dem Zeiger; in 047 mussten Zuklappen der 920er-Gruppe und Knotenwahl als `click`-Ereignis laufen.
- **F-T4-4** `dist/leinwand.js` 635 947 Byte, gzip 170 082 Byte (Stufe 6; 047: 632 437 / 169 139).

### Entscheidungen

- **D-T4-1** Aufklappen je Ebene auf einer frischen Seite je Ebene, damit offene Gruppen einer Ebene die nächste nicht beeinflussen; die Vorfahren aus `grupojDe` ungemessen.
- **D-T4-2** Zeiger oder Ereignis entscheidet ein Treffertest (`document.elementFromPoint` in der Mitte des Ziels liegt im Ziel); so wartet kein Klick auf eine Playwright-Grenze.
- **D-T4-3** Die dunklen Bilder aus 047 entfallen (Spec 048 C nennt drei helle Bilder je Marke); Ebenen oder Bild-Ziele, die eine Marke nicht hat, würden als „nicht vorhanden“ geschrieben (kam nicht vor).
- **D-T4-4** Das Skript prüft die eine Definition (2.2) selbst und bricht ab, wenn `luecken`, `ohneGrund` und die Achsen-Summe auseinanderlaufen.

### Commits

- `d63ff7e6` Spec 048 T4: bilder measures kinds, reasons and every level; luecken.json lists decisions without a reason
- (dieser Commit) Spec 048 T4: tasks and bericht draft
