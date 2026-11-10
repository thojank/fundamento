# Spec 047 – Aufgaben (NE-1: den Graphen lesen)

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) (mit Nachtrag NE-1) · **Basis:** `main` `943cc22f` · **Branch:** `261110-spec-047-node-editor-graph-les-d83783`

Sechs Tickets, ein Strang (Spec: „höchstens 6 Tickets, ein PR“). T1–T5 setzen Engineers um, T6 der Orchestrator nach der QA. Commits lokal mit dem Präfix `Spec 047 T<n>: …`; gepusht wird nur in T6, genau einmal. Je Ticket ein Abschnitt unten: erledigte Punkte, Rot→Grün-Beleg, Befunde `F-T<n>-k`, Entscheidungen `D-…`.

| Ticket | Inhalt | Stand |
|---|---|---|
| T1 | Spec-Ordner; `grafeoDe`, `grafeoDePaket`, Sicht-Logik; `grafeo-047`, `grafeo-neu-047`, `grafeo-kialo-047` | erledigt (Befunde F-T1-1 bis F-T1-4, Entscheidungen D-T1-1 bis D-T1-10) |
| T2 | Paket `nodredaktilo`, React-Insel zugeklappt, Routen `/nodredaktilo/*` und `/api/grafeo`; `abhaengigkeiten-047`; B-1 (b) | offen |
| T3 | Knoten als Eroj, Seitenspalte mit Regel, Kialo und „fehlt“, Herkunftskette und Abhängige | offen |
| T4 | Marken-Tokens auf der Leinwand (hell/dunkel), Bildschirme, Knopf „Graph ansehen“; `grafeo-route-047` | offen |
| T5 | Skript `bilder`, Messung, Lückenliste, Diff-Suche, Bericht-Entwurf | offen |
| T6 | Ein PR, ein Push, ein `workflow_dispatch`, Bericht (Orchestrator) | offen |

## T1 im Einzelnen

- [x] `spec.md` mit `cp` aus `user-provided-product-spec-node-editor-graph-lesen.md`, `cmp` Exit 0; SHA-256 `5853b84d3f852817411ecb6fac10a09fb5844f34643755f0047c19185b7f6636` (gleich der Quelle `.fundamento/spec047/spec.md`, `cmp` Exit 0). Wird nicht editiert.
- [x] `plan.md`: byte-gleiche Kopie der technischen Präzisierung (die ersten 21 756 Byte, `cmp` Exit 0), danach `## Nachtrag NE-1 (Umsetzung)` mit den Tabellen 0.1 und 0.2, der Entscheidung B-1 (b) und der Abhängigkeitstabelle.
- [x] `tasks.md` mit den sechs Tickets.
- [x] Rote Tests zuerst: `packages/metiejo/src/grafeo-047.test.ts`, `grafeo-neu-047.test.ts`, `grafeo-kialo-047.test.ts`, gemeinsame Eingaben in `src/test-doubles/grafeo-047.ts`. Lauf (`FM_AUSGABE=knapp`, `vitest run` der drei Dateien): **3 rot**, je Datei „error outside a test“ – `Error: Cannot find module './grafeo.js' imported from packages/metiejo/src/grafeo-047.test.ts` (ebenso `grafeo-kialo-047.test.ts:9`, `grafeo-neu-047.test.ts:7`); das Modul gibt es noch nicht. Commit `b2d06c68`.
- [x] Umsetzung: `packages/metiejo/src/grafeo-sicht.ts` (Typen, `sichtbaro`, `grupojDe`, `devenoDe`, `dependantojDe`; **null** Import-Anweisungen), `grafeo.ts` (`grafeoDe`, `grafeoDePaket`, `serializeGrafeo`, `GrafeoEraro`, Gruppentabelle `GRUPO_TABELO`, `valoroTeksto`; reexportiert `grafeo-sicht`), `grafeo-fontoj.ts` (`paketoDosieroj`, `EKZEMPLO_DIR`). Kein `node:*` in `grafeo.ts` und `grafeo-sicht.ts`; nicht in `src/index.ts`.
- [x] Grün: dieselben drei Dateien, `FM_AUSGABE=knapp`: **21 bestanden, 0 rot** (6,7 s). Zweimal erzeugt byte-gleich für provo, komuna, ekzemplo.
- [x] `pnpm --filter @fundamento/metiejo lint`: grün (`tsc` ohne Fehler; Biome 1 Warnung, alt: `src/komponentoj.ts:42` `noUnusedImports`, älter als der Branch, nicht angefasst – eigene Aufräumzeile).
- [x] `packages/modelo/src/ci/turbo-inputs.test.ts` allein: 8/8 grün, kein `*-047`-Eintrag (D-10). `packages/modelo/src/ci/test-setup.test.ts` allein: 4/4 grün (kein asynchrones `describe`, kein `await` auf Modulebene).

### Gruppen je Graph (NE-2-Beleg „trägt die Gruppierung“)

Knoten je Gruppe, transitiv gezählt; Graph aus `grafeoDePaket` (komuna, ekzemplo) bzw. `grafeoDe` (provo, Fixture-Agordo über `loadBases()`, also die Struktur komuna-0-2). Zugeklappt sichtbar: komuna 8, ekzemplo 7, provo 8 Knoten (Grenze 40).

| Gruppe | komuna | ekzemplo | provo |
|---|---:|---:|---:|
| Knoten / Kanten gesamt | 2115 / 2200 | 2115 / 2058 | 2133 / 2420 |
| eingaben | – | – | 18 |
| farbe | 1119 | 1119 | 1119 |
| farbe/komponenten | 920 | 920 | 920 |
| farbe/palette | 111 | 111 | 111 |
| farbe/rollen | 88 | 88 | 88 |
| schrift | 294 | 294 | 294 |
| schrift/komponenten | 195 | 195 | 195 |
| schrift/palette | 85 | 85 | 85 |
| schrift/rollen | 14 | 14 | 14 |
| form | 187 | 189 | 189 |
| form/komponenten | 163 | 165 | 165 |
| form/palette | 12 | 12 | 12 |
| form/rollen | 12 | 12 | 12 |
| raum | 329 | 345 | 345 |
| raum/komponenten | 285 | 301 | 301 |
| raum/palette | 22 | 22 | 22 |
| raum/rollen | 22 | 22 | 22 |
| dichte | 91 | 81 | 81 |
| dichte/komponenten | 87 | 77 | 77 |
| dichte/rollen | 4 | 4 | 4 |
| elevation | 31 | 31 | 31 |
| elevation/komponenten | 19 | 19 | 19 |
| elevation/palette | 4 | 4 | 4 |
| elevation/rollen | 8 | 8 | 8 |
| bewegung | 56 | 56 | 56 |
| bewegung/komponenten | 38 | 38 | 38 |
| bewegung/palette | 18 | 18 | 18 |
| weitere | 8 | – | – |

### Abgeleitete Knoten ohne Kialo (Lückenliste, Vorstufe)

| Graph | `derivajxo` | davon ohne `kialo` | `enigo` | Mechanismen |
|---|---:|---:|---:|---|
| komuna | 1888 | 920 | 227 | alias 1888, fiksa 227 |
| ekzemplo | 1911 | 1842 | 204 | alias 1911, fiksa 204 |
| provo | 2013 | 1852 | 120 (18 davon `enigo:`) | alias 1911, paletto 92, gestalto 10, fiksa 102 |

Ohne Kialo je Gruppe – komuna: farbe/komponenten 453, raum/komponenten 184, form/komponenten 88, schrift/komponenten 73, dichte/komponenten 38, bewegung/komponenten 38, schrift/palette 14, farbe/rollen 10, elevation/komponenten 9, form/rollen 8, raum/rollen 4, form/palette 1. ekzemplo: farbe/komponenten 920, raum/komponenten 301, schrift/komponenten 195, form/komponenten 165, dichte/komponenten 77, farbe/rollen 60, schrift/palette 42, bewegung/komponenten 38, elevation/komponenten 19, form/rollen 9, raum/rollen 7, elevation/palette 4, form/palette 3, elevation/rollen 2. provo: wie ekzemplo, dazu form/palette 7 statt 3 und raum/palette 6 (die Gestalt-Tokens von `form.radius` und `raum.abstand`).

### Befunde

- **F-T1-1** Die Gruppentabelle aus 2.3 trägt ohne Änderung: nur 8 Knoten in „weitere“ (komuna), alle Komponenten-Tokens mit festem Wert ohne Alias (`ero.dialogo.surface.width.size.small`, `ero.faldilo.indicator.size`, `ero.karto.box.inline.padding`, `ero.markdovido.quote.inline.padding`, `ero.markdovido.quote.width`, `ero.markobutono.indicator.size.size.medium`, `ero.menuo.item.radius`, `ero.saltligilo.box.height`). In ekzemplo und provo ist „weitere“ leer; dort verschieben sich die Komponenten-Gruppen gegenüber komuna (form +2, raum +16, dichte −10), weil die Ketten dort über andere Aliasse laufen.
- **F-T1-2** `farbe/komponenten` hat 920 Knoten, fast die Hälfte des Graphen; aufgeklappt wird sie die größte Last der Leinwand (Risiko 6 der Implementation Spec). Teilen ist ein NE-2-Befund.
- **F-T1-3** `deveno.json` gehört der Aspekto komuna; ekzemplo und provo (deren Werte großenteils dieselben sind) bekommen daraus keine Kialo, weil die Einträge nach Aspekto zugeordnet werden (2.2, Priorität 1). Ihre Kialoj kommen nur aus Reguloj: 1842 von 1911 (ekzemplo) bzw. 1852 von 2013 (provo) abgeleiteten Knoten ohne Kialo.
- **F-T1-4** „dichte“ enthält nur `size.control.*`/`size.target.*` und die Komponenten-Tokens darauf; die Dichte-Modi verändern auch `spacing.*` (Gruppe raum). Die Achse zeigt also nicht alles, was die Dichte bewegt. Kein Fehler, ein NE-2-Befund zur Gruppierung.

### Entscheidungen (Verfeinerungen der Verträge aus 2.2; Namen und Signaturen unverändert)

- **D-T1-1** Ein Komposit-Wert mit Aliassen in Feldern (z. B. `typography.*` mit `{font.size.*}`) zählt als Alias: je Feld-Alias eine Ligo, Mechanismus `alias`.
- **D-T1-2** Eine Regulo nennt einen Token nur, wenn sie keine Aspekto trägt oder die des Graphen.
- **D-T1-3** Gestalt-Zuordnung aus dem Code: ein Gestalt-Facet bewegt einen Token, wenn das Facet allein (Agordo nur mit Name, Leitfarbe und diesem Facet) ihn gegenüber dem Standard ändert **oder** wenn er sich ändert, sobald das Facet aus dem Agordo fällt. `form.bedienelemente` („pille“) zählt als Gestalt-Facet, weil `deriveGestalt` es liest.
- **D-T1-4** `enigo:`-Knoten tragen den Agordo-Wert als `valoro.light` (Text wie gegeben, Zahl als Text, Objekt als kompaktes kanonisches JSON), kein `regulo`, kein `kialo`.
- **D-T1-5** Ligoj, deren Ende kein Knoten ist (Alias auf einen fehlenden Token, `festgelegt` auf einen unbekannten Token), werden nicht gezogen; die Modelo-Prüfung meldet sie (`alias-target-missing`). Zyklen dagegen werfen immer `GrafeoEraro`.
- **D-T1-6** `grupojDe(g, <grupo-id>)` gibt die Vorfahren der Gruppe; `grupojDe` und `devenoDe` geben für eine unbekannte id `[]`. `dependantojDe(...).cxiuj` zählt den Knoten selbst nicht mit.
- **D-T1-7** `sichtbaro` sortiert die Knoten nach Gruppenreihenfolge, darin die Gruppe vor ihren Mitgliedern, dann nach id. Ein Gruppenknoten trägt `nombro` (transitiv) und `malfermita`, ein Untergruppenknoten `grupo` = Achse.
- **D-T1-8** `valoro` einer Farbe ohne Hex: `oklch(…)` im Raum oklch, sonst `color(<raum> …)`. In komuna und ekzemplo kommt das nicht vor (alle 124 bzw. 223 Farbwerte der Sets tragen ihr Hex); Hex mit Alpha < 1 als `#rrggbbaa`.
- **D-T1-9** Zusätzliche Exporte von `grafeo.ts`: `GRUPO_TABELO` und `valoroTeksto` (additiv, für T2–T5 lesbar).
- **D-T1-10** Kialo aus `deveno`: bei mehreren Einträgen gewinnt `aro` ohne `+`, dann das kleinste `aro`, dann der kleinste Text; aus Jugxoj des Agordo der erste, dessen `regulo` dem Namen der nennenden Regulo gleicht.

## T2 im Einzelnen

(offen)

## T3 im Einzelnen

(offen)

## T4 im Einzelnen

(offen)

## T5 im Einzelnen

(offen)

## T6 im Einzelnen

(offen)
