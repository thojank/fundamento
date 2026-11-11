# Spec 048 – Aufgaben (NE-1b: Untergruppen je Ero und geerbte Gründe)

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) (mit Nachtrag NE-1b) · **Basis:** `origin/main` `946248b9` · **Branch:** `261111-spec-048-node-editor-ne-f1aef1`

Fünf Tickets, ein Strang (Spec: „höchstens 5 Tickets, ein PR“). T1–T4 setzen Engineers um, T5 der Orchestrator nach der QA. Commits lokal mit dem Präfix `Spec 048 T<n>: …`; gepusht wird nur in T5, genau einmal. Je Ticket ein Abschnitt unten: erledigte Punkte, Rot→Grün-Beleg, Befunde `F-T<n>-k`, Entscheidungen `D-…`. Diffs gegen `origin/main`, nicht gegen das lokale `main`.

| Ticket | Inhalt | Stand |
|---|---|---|
| T1 (NE1B-1) | Spec-Ordner; dritte Ebene (Komponenten-Untergruppen) und 60er-Regel in `grafeo.ts`; `grafeo-grupoj-048` | erledigt (Befunde F-T1-1 bis F-T1-4, Entscheidungen D-T1-1 bis D-T1-5; eine D-6-Änderung an einem 047-Test) |
| T2 (NE1B-2) | `knotenartDe`, `kialoDe`, `begruendungDe`, `ohneGrund` in `sichtbaro` (Opt-in); `grafeo-kialo-048` | offen |
| T3 (NE1B-3) | Leinwand: Aufklappen in Stufen, Seitenspalte mit Art und geerbtem Grund, Zahl an Gruppen | offen |
| T4 (NE1B-4) | Messung, Bilder, `luecken.json`, Diff-Suche, Bericht-Entwurf | offen |
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
- (dieser Commit) Spec 048 T1: component sub-groups and the 60-rule
