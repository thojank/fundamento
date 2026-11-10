# Spec 047 – Aufgaben (NE-1: den Graphen lesen)

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) (mit Nachtrag NE-1) · **Basis:** `main` `943cc22f` · **Branch:** `261110-spec-047-node-editor-graph-les-d83783`

Sechs Tickets, ein Strang (Spec: „höchstens 6 Tickets, ein PR“). T1–T5 setzen Engineers um, T6 der Orchestrator nach der QA. Commits lokal mit dem Präfix `Spec 047 T<n>: …`; gepusht wird nur in T6, genau einmal. Je Ticket ein Abschnitt unten: erledigte Punkte, Rot→Grün-Beleg, Befunde `F-T<n>-k`, Entscheidungen `D-…`.

| Ticket | Inhalt | Stand |
|---|---|---|
| T1 | Spec-Ordner; `grafeoDe`, `grafeoDePaket`, Sicht-Logik; `grafeo-047`, `grafeo-neu-047`, `grafeo-kialo-047` | erledigt (Befunde F-T1-1 bis F-T1-4, Entscheidungen D-T1-1 bis D-T1-10) |
| T2 | Paket `nodredaktilo`, React-Insel zugeklappt, Routen `/nodredaktilo/*` und `/api/grafeo`; `abhaengigkeiten-047`; B-1 (b) | erledigt (Befunde F-T2-1 bis F-T2-6, Entscheidungen D-T2-1 bis D-T2-7; B-1 (b): `workspace.test.ts` rot, benannte Ausnahme) |
| T3 | Knoten als Eroj, Seitenspalte mit Regel, Kialo und „fehlt“, Herkunftskette und Abhängige | erledigt (Befunde F-T3-1 bis F-T3-4, Entscheidungen D-T3-1 bis D-T3-7) |
| T4 | Marken-Tokens auf der Leinwand (hell/dunkel), Bildschirme, Knopf „Graph ansehen“; `grafeo-route-047` | erledigt (Befunde F-T4-1 bis F-T4-4, Entscheidungen D-T4-1 bis D-T4-7) |
| T5 | Skript `bilder`, Messung, Lückenliste, Diff-Suche, Bericht-Entwurf | erledigt (Befunde F-T5-1 bis F-T5-4, Entscheidungen D-T5-1 bis D-T5-5; Bericht-Entwurf) |
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

- [x] Roter Test zuerst: `packages/metiejo/src/abhaengigkeiten-047.test.ts` (P-5, Punkte 0–4; Konstante `REACT_EN_PUBLIKAJ = {"@fundamento/cli": ["react", "react-dom"]}` mit Verweis auf R-6; Ausnahmeliste D-4 mit Grund: `packages/eroj/src/react.ts`, `packages/projekcioj/src/celoj/react/react.ts`, `packages/projekcioj/src/celoj/make-kit/make-kit.ts`; der Lauf überspringt `node_modules`, `dist`, `generated`). Lauf (`FM_AUSGABE=knapp`): **1 rot, 4 grün** – `abhaengigkeiten-047.test.ts:124 › (0) …: packages/nodredaktilo/package.json: expected undefined to be defined`; das Paket gab es noch nicht. Die Punkte 1–4 sind Wächter und waren schon auf `main` grün. Commit `3899967c`.
- [x] Paket `packages/nodredaktilo`: `package.json` (`private: true`, `license: MIT`, `0.2.0`, `type: module`, `exports` nur `./package.json`, `files: ["dist"]`, Skripte nur `build` = `vite build` und `lint` = `tsc -p tsconfig.json --noEmit && biome check .`; **kein** `test`, keine `vitest.config.ts`; nur `devDependencies`, exakt gepinnt: `react`/`react-dom`/`@types/react`/`@types/react-dom` 19.3.0, `@xyflow/react` 12.12.1, `@dagrejs/dagre` 3.1.3, `vite` 8.3.0, `@vitejs/plugin-react` 6.1.1, `playwright` 1.63.0, dazu die Repo-Bereiche `typescript ^7.0.2`, `@types/node ^24.13.5`, `tsx ^4.23.15`). React, Vite, Plugin und Playwright kamen aus dem vorhandenen Lockfile; neu aufgelöst wurden nur `@xyflow/react` 12.12.1 und `@dagrejs/dagre` 3.1.3 (`npm view` am 10.11.: 12.12.1 / 3.1.3, MIT).
- [x] `tsconfig.json` (erweitert `../../tsconfig.base.json`; `lib` es2024 + dom + dom.iterable, `module: esnext`, `moduleResolution: bundler`, `jsx: react-jsx`, `types` node + `vite/client`, `paths` `@fundamento/metiejo/grafeo` → `../metiejo/src/grafeo-sicht.ts`; schließt `src`, `scripts`, `vite.config.ts` ein). `vite.config.ts`: Bibliotheksbau, ein ES-Eintrag `src/leinwand.tsx` → `dist/leinwand.js` (+ Sourcemap), `resolve.alias` wie `paths`, `define process.env.NODE_ENV = "production"`. React Flows `style.css` kommt als `?inline`-Text und wird beim Einhängen als `<style id="nr-xy-stilo">` gesetzt.
- [x] P-6: genau eine Zeile `"@fundamento/nodredaktilo": "workspace:*"` unter `devDependencies` in `packages/metiejo/package.json`; kein `exports["./grafeo"]` (D-2). `pnpm install` (Lockfile +244 Zeilen, nur so geändert); `pnpm install --frozen-lockfile` danach grün.
- [x] **B-1 (b):** `packages/modelo/src/workspace.test.ts` nicht angefasst. Allein gelaufen (`FM_AUSGABE=knapp`): **8 grün, 1 rot** – `workspace.test.ts:40 › has exactly the five Phase-1 packages…: expected [ 'agordilo', 'aspekto-komuna', …(11) ] to deeply equal [ …(10) ]` (Zeile 45). **Benannte Ausnahme:** verursacht durch Spec 047 (neues Verzeichnis `packages/nodredaktilo`); Behebung = ein Map-Eintrag `nodredaktilo: "@fundamento/nodredaktilo"` (alphabetisch zwischen `modelo` und `nordstelo`, mit Kommentar `// Spec 047 (NE-1)`); braucht die Zustimmung des Maintainers. Gehört in PR-Text und Bericht.
- [x] `servilo.ts`: zwei Nähte in `ServiloOptions` (`leinwand?: string | null`, `ekzemploDir?: string | null`, je mit JSDoc). Vorgabe `leinwand`: `leinwandDist()` neben `erojDist` – `import.meta.resolve("@fundamento/nodredaktilo/package.json")` in `try/catch`, `null`, wenn das scheitert oder `dist/leinwand.js` fehlt. Vorgabe `ekzemploDir`: `EKZEMPLO_DIR`. Ein zusammenhängender Block `// Spec 047 (NE-1): …` direkt nach `GET /vitrino/*`, vor dem Nordstelo-Block und vor der allgemeinen Route `/marko/:name/:key`:
  - `GET /nodredaktilo/*` → `sendStatic` aus `leinwand`; **503** HTML `Leinwand nicht gebaut: pnpm --filter @fundamento/nodredaktilo build`, wenn `leinwand === null`.
  - `GET /api/grafeo?marko=…` → 200 `application/json; charset=utf-8`, Körper `serializeGrafeo(grafeoDe(agordo, bases))` des aktuellen Entwurfs (Zwischenspeicher je Marke und `rev`); 404 `notFound` für eine unbekannte Marke; **422** kanonisches JSON `{"eraroj":[{path,rule,message}]}`, wenn `readAgordo(draft.agordo)` Befunde meldet (ebenso für einen `GrafeoEraro`, `rule: "grafeo-ciklo"`).
  - `GET /api/grafeo?aspekto=komuna|ekzemplo` → 200 `serializeGrafeo(grafeoDePaket(label, paketoDosieroj(label, ekzemploDir)))`, je Label einmal je Prozess gebaut; fehlt ekzemplo: 404 HTML `ekzemplo ist nur im Repo vorhanden`; anderes Label: 404 `notFound`; nicht genau einer von `marko`/`aspekto`: **400**. Die API hängt nicht am Bündel und antwortet nie 503.
- [x] Insel (`packages/nodredaktilo/src`): `leinwand.tsx` (Eintrag, `muntu(ujo)`; Schema aus `document.documentElement.dataset.fmColorScheme` → React Flow `colorMode`), `kanvaso.tsx` (Laden, `sichtbaro(g, offen)`, Messen, Layout, `fitView`, Bereit-Marken), `arangxo.ts` (dagre `rankdir: "LR"`, Kante von `al` nach `de`, auf **gemessenen** Größen; Abstände aus den Messungen abgeleitet, keine Länge im Code), `nodoj.tsx` (Gruppen- und Token-Knoten), `datumoj.ts` (200/422/sonst), `fm-elementoj.d.ts` (JSX-Typen der `fm-*`). `<Controls showInteractive={false}>`, `nodesDraggable`/`nodesConnectable`/`elementsSelectable` `false`, Hinweis-Schildchen sichtbar (kein `hideAttribution`). Kantenbeschriftung „1 Abhängigkeit“ / „n Abhängigkeiten“. Zustand nur in React.
- [x] DOM-Haken: `#nr-leinwand[data-nr-fonto]` (Einhängepunkt), `data-nr-preta` (einmal, `Math.round(performance.now())` nach erstem Layout + `fitView` + zwei Frames), `data-nr-rev` (`"0"` mit `preta`, danach +1 je Auf-/Zuklappen, sobald gezeichnet), `data-nr-dauro` (Klick bis gezeichnet, vor `data-nr-rev` gesetzt), `[data-nr-grupo][data-nr-malfermita]` mit `fm-butono[data-nr-faldi]`, `[data-nr-nodo]`; `#nr-eraroj` (`fm-karto` mit den 422-Meldungen, dann kein Graph) und `#nr-problemo` (anderer Fehler) als Grundform.
- [x] Prüfungen: `pnpm --filter @fundamento/nodredaktilo build` → `dist/leinwand.js` (622 546 Byte, gzip 166 860) + `leinwand.js.map`; `find packages/nodredaktilo -name '*.css' -not -path '*/node_modules/*'` leer. `pnpm --filter @fundamento/nodredaktilo lint` grün; `pnpm --filter @fundamento/metiejo lint` grün (nur die alte Warnung `src/komponentoj.ts:42`). `git diff origin/main -- packages/metiejo/package.json`: genau eine Zeile dazu (siehe F-T2-1). Kein `px`/`rem`/`ms`/Farbliteral in `src`.
- [x] Grün: `abhaengigkeiten-047` **5/5**; zusammen mit `grafeo-047`, `grafeo-neu-047`, `grafeo-kialo-047` und `servilo.test.ts`: **52/52** (50 s). `packages/modelo/src/ci/turbo-inputs.test.ts` allein: **8/8**, kein `*-047`-Eintrag (nach D-T2-5); `test-setup.test.ts` + `workflow.test.ts` allein: 55/55.
- [x] Laufende Metiejo (`pnpm build`, `node packages/cli/dist/index.js metiejo --port 7301 --workdir /tmp/ne1-marken`, `provo/agordo.json` aus dem Fixture): `/api/grafeo?aspekto=komuna` 200 `application/json; charset=utf-8`, **byte-gleich** mit `serializeGrafeo(grafeoDePaket("komuna", …))` (1 019 945 Byte; erster Aufruf 0,16 s, zweiter 0,004 s aus dem Zwischenspeicher); ebenso `?aspekto=ekzemplo` (940 978) und `?marko=provo` (990 053) byte-gleich. `/nodredaktilo/leinwand.js` 200 `text/javascript; charset=utf-8`. 404 für `?marko=nope` und `?aspekto=xyz`, 400 ohne und mit beiden Parametern, 404 für eine fehlende Datei unter `/nodredaktilo/`. Mit den Nähten (`leinwand: null`, `ekzemploDir: null`): `/nodredaktilo/leinwand.js` 503 mit dem Bau-Satz, `?aspekto=ekzemplo` 404 mit „ekzemplo ist nur im Repo vorhanden“, `?aspekto=komuna` weiter 200. Server danach beendet.
- [x] Browser (Playwright MCP, Behelfsseite: eine Seite der laufenden Metiejo, deren Körper per Skript durch `#nr-leinwand` + `/eroj/define.js` + `/nodredaktilo/leinwand.js` ersetzt wird; keine Datei im Repo): komuna hell zugeklappt **8** Knoten (Achsen mit „Gruppe · n“, Kanten „4/13/4 Abhängigkeiten“), ekzemplo **7**, provo dunkel **8** (`.react-flow.dark`). provo: jede der 8 Achsen auf- und wieder zugeklappt (`data-nr-rev` 1…16, `data-nr-malfermita` true/false, `data-nr-dauro` 29–328 ms), danach `form` → `form/rollen` (23 Knoten, 12 Token-Knoten). ekzemplo `farbe/komponenten` aufgeklappt: 930 Knoten, `data-nr-dauro` 578 ms; zu: 108 ms. `data-nr-preta` gesetzt, Hinweis-Schildchen `display: block`, kein versteckter Knoten nach dem Layout, keine Konsolenfehler oder -warnungen der Leinwand. Bilder: `qa-screenshots/t2-komuna-zugeklappt.png`, `qa-screenshots/t2-provo-dunkel-form-rollen-offen.png` im Feature-Ordner (außerhalb des Repos).

### Befunde

- **F-T2-1** Der lokale Zweig `main` dieses Arbeitsbaums steht auf `f6f38f53` (PR #69), nicht auf der Basis `943cc22f`; `git diff main -- packages/metiejo/package.json` zeigt deshalb die ganze Datei. Gegen `origin/main` (= `943cc22f` = Merge-Basis) ist es genau eine Zeile. T5 macht die Diff-Suche gegen `origin/main` bzw. `943cc22f`.
- **F-T2-2** Ein ungültiges `agordo.json` macht die Marke unlesbar (`readMarko` → `undefined`), die API antwortet dann 404, nicht 422; ein ungültiges `entwurf.json` wird ebenso verworfen (Rückfall auf `agordo.json`). 422 entsteht nur, wenn der Entwurf **im Speicher** ungültig ist. `grafeo-route-047` (T4) muss den 422-Fall deshalb über den Speicher herstellen (z. B. einen Entwurf über eine Server-Route ändern, die `readAgordo` nicht vorschaltet) oder ihn als nicht über HTTP erreichbar vermerken. Kein Code außerhalb der Zone geändert.
- **F-T2-3** Der Bibliotheksbau von Vite entfernt im ES-Format keine Leerzeichen: `leinwand.js` ist 622 546 Byte (gzip 166 860). Für den Bericht (NE-2); nichts geändert.
- **F-T2-4** `#nr-leinwand` braucht eine Blockgröße vom Bildschirm (React Flow füllt seinen Elternknoten). Die Behelfsseite setzte sie inline; der Bildschirm in T4 setzt sie mit `--fm-*`/logischen Eigenschaften.
- **F-T2-5** Eine Gruppe aufzuklappen dauert bei 920 Knoten rund 0,6 s (ekzemplo `farbe/komponenten`); alle Knoten liegen im DOM (React Flow ohne `onlyRenderVisibleElements`). Messung ist T5.
- **F-T2-6** `fm-karto` und `fm-titolo` verlangen `level`; ohne warnt die Eroj-Laufzeit. Gesetzt: Gruppe `level="2"`/Titel `3`, Token `3`/`4`. T3 kann das verfeinern.

### Entscheidungen

- **D-T2-1** Die Klicks des Umschalters werden am umschließenden `div[data-nr-grupo]` abgenommen (Delegation über `closest("[data-nr-faldi]")`), nicht als React-Ereignis am Custom Element; der Klick hält dort an, React Flow wählt den Knoten nicht.
- **D-T2-2** Gemessen wird über `node.measured` der kontrollierten Knoten (frische Knotenobjekte ohne `measured` lassen React Flow neu messen). Das Layout läuft erst, wenn die Knoten im Zustand **zu dieser Sicht** gehören (Vergleich der `SichtNodo`-Objekte); sonst legte der Commit, der eine neue Sicht bringt, die alten Knoten aus (gefunden im Browser: der Umschalter schien wirkungslos).
- **D-T2-3** Abstände von dagre aus der kleinsten gemessenen Knotenhöhe (`nodesep = h/2`, `ranksep = 3h`), damit kein Längenliteral in `src` steht.
- **D-T2-4** `fitView` nach jedem Layout (nicht nur beim ersten); `data-nr-rev` startet mit `"0"` zusammen mit `data-nr-preta`.
- **D-T2-5** `abhaengigkeiten-047` liest nur unter `packages/` (auch die Prüfung der Ausnahmeliste); ein erster Entwurf las über die Checkout-Wurzel und meldete in `turbo-inputs` „reads \*\*“.
- **D-T2-6** `/api/grafeo?marko=` hält das Ergebnis je Marke und `rev` (ein Entwurf ändert sich nur über den Server, der `rev` erhöht); ein `GrafeoEraro` antwortet wie ein ungültiges Agordo mit 422 (`rule: "grafeo-ciklo"`).
- **D-T2-7** Die 400-Antwort ist HTML „Genau einer der Parameter marko oder aspekto.“ (die Spec nennt nur den Status).

## T3 im Einzelnen

- [x] **Knoten als Eroj** (`src/nodoj.tsx`): jeder Knoten ist eine `fm-karto level="2"`. Die Überschrift ist das `etikedo` im Slot `heading` (`<span slot="heading">`); `fm-karto` setzt daraus selbst ihr `fm-titolo` in der Shadow-Wurzel, mit dem `level` der Karte (Skemo/Uzo karto: Slot `heading` nimmt Text). Im Slot `meta` ein `fm-insigno` „Eingabe“/„Ableitung“ bzw. „Gruppe · <nombro>“, bei Token-Knoten im Slot `content` ein `fm-teksto max-lines="2"` mit dem `valoro` des aktuellen Schemas (`dark` fällt auf `light` zurück, `valoroEn`). Der Gruppen-Schalter `fm-butono[data-nr-faldi]` steht im Slot `actions`; sein Klick wird wie in D-T2-1 am `div[data-nr-grupo]` gefangen und wählt nichts.
- [x] **Auswahl**: `onNodeClick` setzt nur den gewählten Knoten (React-State, nur Token- und `enigo:`-Knoten); `elementsSelectable` bleibt `false`. Der gewählte Knoten trägt `data-nr-elektita="true"` und `emphasis="medium"` an seiner Karte (eine Prop des Ero, kein Stil). Kein `localStorage`, nichts wird geschrieben.
- [x] **Seitenspalte** (`src/flanko.tsx`): `fm-karto#nr-flanko[data-nr-elektita="<id>"] level="2"` rechts neben der Leinwand. Überschrift = id; `fm-atributlisto layout="stacked"` mit „Wert (Hell|Dunkel)“ (`fm-teksto kind="code" data-nr-valoro="<aktuelles Schema>"`, darunter klein `fm-teksto kind="caption" data-nr-valoro="<anderes Schema>"`, P-7), „Regel“ (`dd[data-nr-regulo]`, Text `regulo` oder „keine“), „Begründung“ (`dd[data-nr-kialo]`, Text `kialo` oder ein `fm-insigno intent="warning"` „fehlt“). Ableitung: `fm-titolo level="3"` „Herkunft“ und `ol` mit `fm-butono[data-nr-deveno="<id>"]` nach `devenoDe` (erster Eintrag der Knoten selbst, letzter eine Eingabe). Eingabe (`speco: "enigo"`): „Hängt davon ab“, `ol` mit `fm-butono[data-nr-dependanto="<id>"]` (`rektaj`, sortiert) und `fm-teksto[data-nr-dependantoj-sumo="<cxiuj>"]`. Jeder Eintrag trägt ein `fm-insigno` mit der Art. Schließen: `fm-butono[data-nr-fermi]` im Slot `actions`.
- [x] **Klick auf einen Eintrag** (Kette und Abhängige): wählt den Knoten und öffnet die Gruppen aus `grupojDe`, die noch zu sind (Vereinigung mit den offenen). Danach wird der Knoten statt der ganzen Übersicht eingepasst (`fitView({ nodes: [id], maxZoom: 1 })`). Öffnet der Klick Gruppen, zählt er wie ein Aufklappen: `data-nr-rev` +1, `data-nr-dauro` gesetzt. Ist der Knoten schon sichtbar, wird nur gewählt und eingepasst (kein rev).
- [x] Layout nur über `--fm-*`: Zeile mit `gap: var(--fm-spacing-medium)`, Seitenspalte `inline-size: var(--fm-size-container-small)` (höchstens 50 %), scrollt. Kein neues Token, kein `px`/`rem`/`ms`/Farbliteral in `src`, keine `.css`-Datei.
- [x] Prüfungen: `pnpm --filter @fundamento/nodredaktilo lint` grün, `build` grün (`dist/leinwand.js` 629 500 Byte, gzip 169 810); `find packages/nodredaktilo -name '*.css' -not -path '*/node_modules/*'` leer. `grafeo-047`, `grafeo-neu-047`, `grafeo-kialo-047`, `abhaengigkeiten-047` mit `FM_AUSGABE=knapp`: 26 bestanden, 0 rot. `grafeo-sicht.ts` unverändert.
- [x] **Browser** (Playwright MCP, Behelfsseite wie in T2: Seite der Metiejo, Wurzel mit `data-fm-aspekto`/`data-fm-color-scheme`, Stylesheet der Marke bzw. `/css/fundamento.css`, `#nr-leinwand` mit `block-size: 100vh`, 1600×1000; nichts davon im Repo; Server danach gestoppt):
  - provo hell: zugeklappt 8 Knoten. „Eingaben“ aufgeklappt (rev 1), Klick auf `enigo:leitfarbe`: Knoten zeigt `#6b4fa0`, Seitenspalte `data-nr-elektita="enigo:leitfarbe"`, Regel „keine“, Begründung „fehlt“, **32 direkte Abhängige** (`color.palette.accent.*` und `color.palette.neutral.*`), **858 transitiv**. Kein Knoten bekam `.selected`; Knotenklick erhöht `data-nr-rev` nicht. → `qa-screenshots/t3-provo-hell-leitfarbe-abhaengige.png`
  - provo hell: `farbe` → `farbe/rollen` aufgeklappt, Klick auf `color.text.default`: Regel `alias · reg_01M2X5DXT0TJ1ZYQG95RWX02ZV`, Kialo aus der Regulo, Kette `color.text.default → color.palette.neutral.50 → enigo:leitfarbe` (Ende `enigo`). Klick auf den Eintrag `color.palette.neutral.50` (Gruppe `farbe/palette` zu): Gruppe geöffnet, Knoten sichtbar, gewählt und mittig eingepasst, rev 3→4, `dauro` 453 ms. Schalter „Aufklappen“ von `raum` und Klick auf die Karte `bewegung` ändern die Auswahl nicht; „Schließen“ entfernt `#nr-flanko`. `localStorage` leer.
  - provo dunkel: Knoten `color.text.default` zeigt `#f3f2f4`, Seitenspalte „Wert (Dunkel)“ `#f3f2f4`, darunter „Hell: #28272d“; React Flow in `dark`. → `qa-screenshots/t3-provo-dunkel-text-default-herkunft.png`
  - komuna hell: abgeleiteter Knoten ohne Kialo `border.default` (Gruppe klein genug): Regel `alias`, Begründung „fehlt“ (`fm-insigno intent="warning"`), Kette `border.default → border.width.default → border.width.scale.1` (Ende `enigo`, `fiksa`). Klick auf den letzten Eintrag: gewählt, sichtbar, 1 direkter Abhängiger, 40 transitiv. → `qa-screenshots/t3-komuna-hell-border-default-fehlt.png`
  - Konsole: keine Fehler; die einzige Warnung (`fm-ikono: name is required`) stammt von der Startseite der Metiejo vor dem Behelf, nicht von der Leinwand.

### Befunde

- **F-T3-1** (T4) Die Leinwand hat noch die Schrift des Browsers (Serifen in den Knoten), Abstände und Farben der Knoten sind die der Eroj, React Flow ist ungefärbt. Das ist T4 (`XY_ROLOJ`, Schrift aus `--fm-*`).
- **F-T3-2** (T4/T5) Zusammengesetzte Werte (Typografie, Rahmen, Schatten) sind lange JSON-Texte; im Knoten auf zwei Zeilen gekürzt (`max-lines="2"`), in der Seitenspalte voll. Knoten mit solchen Werten sind breit; die Gruppe `schrift` wird dadurch breit.
- **F-T3-3** (NE-2) Die Seitenspalte kann lang werden: `enigo:leitfarbe` (provo) hat 32 direkte Abhängige, die alle als Einträge stehen. Bei Eingaben mit Hunderten direkter Abhängiger wäre eine `max-entries`-ähnliche Kürzung zu bedenken.
- **F-T3-4** (T4) Öffnet sich die Seitenspalte, wird die Leinwand schmaler, aber nicht neu eingepasst (ein Knotenklick ist keine Layoutänderung). Rechts liegende Knoten können dann unter die Spalte rücken, bis man „Übersicht einpassen“ drückt.
- **F-T2-6 erledigt**: alle Karten `level="2"`, die Unterüberschriften der Seitenspalte `fm-titolo level="3"`; das `fm-titolo` der Knoten setzt `fm-karto` selbst.

### Entscheidungen

- **D-T3-1** Abweichung vom Wortlaut „`<fm-titolo>` = `etikedo`“: Das `etikedo` steht im Slot `heading` der `fm-karto`; die Karte rendert dafür selbst ein `fm-titolo` (Shadow-Wurzel, `level` der Karte). Ein zweites `fm-titolo` im Inhalt würde eine leere Überschrift der Karte und eine zweite daneben ergeben (Uzo karto: Slot `heading` nimmt nur Text). Prüfen in QA/T5: `[data-nr-nodo] fm-karto` → `shadowRoot` `fm-titolo`, oder Text über `innerText`/`span[slot=heading]`.
- **D-T3-2** Nur Token- und `enigo:`-Knoten sind wählbar; ein Klick auf eine Gruppenkarte (außerhalb des Schalters) wählt nichts. Die Seitenspalte erklärt Knoten, keine Gruppen.
- **D-T3-3** Kette für `speco: "derivajxo"`, Abhängige für `speco: "enigo"` (also auch feste Werte, `fiksa`, nicht nur `enigo:*`).
- **D-T3-4** `[data-nr-dependantoj-sumo]` trägt die Zahl als Attributwert, der Text ist ein Satz („858 Knoten hängen insgesamt davon ab“). `[data-nr-regulo]` zeigt „keine“, wo `regulo` fehlt (Eingaben aus dem Agordo).
- **D-T3-5** Einträge der Abhängigen sind wie die Kette klickbar (gleicher Handler: wählen + `grupojDe` öffnen).
- **D-T3-6** Ein Klick, der Gruppen öffnet, setzt `data-nr-rev`/`data-nr-dauro` wie ein Aufklappen und passt statt der Übersicht den gewählten Knoten ein (`maxZoom` 1). Sonst bleibt D-T2-4 (nach jedem Layout `fitView`).
- **D-T3-7** Die Seitenspalte nutzt Eroj außerhalb ihrer Uzo-Liste (`fm-atributlisto`, `fm-butono` im Inhalt der `fm-karto`); die Insel ist von A-1 ausgenommen, keine Markup-Prüfung läuft auf ihr. Für NE-2 notiert.

## T4 im Einzelnen

- [x] **Roter Test zuerst** `packages/metiejo/src/grafeo-route-047.test.ts` (8 Fälle, zwei Server über `testServilo`: „mit“ = `leinwand` auf ein Temp-Verzeichnis mit Stub-`leinwand.js`, ekzemplo vorhanden; „ohne“ = `leinwand: null`, `ekzemploDir: null`; provo als Fixture-Datei in den Markenordner kopiert, neuer Export `PROVO_DOSIERO` in `test-doubles/grafeo-047.ts`). Rot beobachtet (`FM_AUSGABE=knapp`): 4 bestanden, 4 rot – Bildschirme (88 Abweichungen, Routen fehlen → 404), `grafeo.css` (404 statt 200), Studio („Graph ansehen“ 0 statt 1), Konsistenz (`/aspekto/komuna/grafeo.css` 404). Commit `0821385a`. Grün: 8/8.
- [x] **`grafeoScreen(doc: GrafeoScreen)`** in `html.ts` (eine Funktion, ein Interface, eine CSS-Konstante): Wurzel `data-fm-aspekto` + `data-fm-color-scheme`; `<link rel="stylesheet">` (`/marko/<name>/vorschau.css?rev=<rev>` bzw. `/aspekto/<label>/grafeo.css`); `@font-face` der Marke inline (wie die Vorschau); `/eroj/define.js`; Kopf `header.nr-kapo` mit `fm-titolo level="1"` „Graph <name>“, bei Marken `fm-ligilo` „Zum Studio“ (`/studio/<name>/farbe`, mit `?scheme=dark` im Dunkeln) und bei `exportable: false` `<fm-insigno intent="warning" id="nr-ne-eksportebla">nicht exportierbar</fm-insigno>`; `#nr-leinwand[data-nr-fonto]`; `<script type="module" src="/nodredaktilo/leinwand.js">`. Inline-CSS nur `--fm-*` und logische Eigenschaften; die Seite füllt das Fenster, `#nr-leinwand` bekommt den Rest (`flex: 1 1 auto`) und `min-block-size: var(--fm-size-container-small)` (F-T2-4 erledigt; im Browser 936 von 1000 Höhe).
- [x] **Routen** im Spec-047-Block von `servilo.ts` (nach `/api/grafeo`, vor Nordstelo und der generischen `/marko/:name/:key`):
  - `GET /marko/:name/grafeo[?scheme=]`: unbekannte Marke 404 `notFound`; ohne Bündel 503 (Bau-Satz); sonst `grafeoScreen` mit dem Entwurf, wie die Anfrage ihn fand, und der geteilten Prüfung dieser rev (`pruefungOf` = `pruefSpeicher.pruefung`, wie das Studio) für das Schildchen.
  - `GET /aspekto/:label/grafeo[?scheme=]`: anderes Label 404 `notFound`; ekzemplo fehlt 404 „ekzemplo ist nur im Repo vorhanden“; ohne Bündel 503; sonst `grafeoScreen`.
  - `GET /aspekto/:label/grafeo.css`: dieselben 404; sonst `CSS_CELO.generate` auf `buildModelo(paketoDosieroj(...))` (derselbe Aufruf wie `komunaCss`), im Speicher, je Label einmal; `text/css; charset=utf-8`; braucht das Bündel nicht.
  - Schema über `kombinationOf(url.searchParams).scheme` (D-8; Unbekanntes → `light`).
- [x] **Studio-Knopf**: `StudioInput.grafeoHref?: string`; gesetzt → `<fm-butono size="small" emphasis="low" data-href="…">Graph ansehen</fm-butono>` im `principal`-Span nach „Speichern“. `servilo.ts` setzt ihn nur bei `leinwand !== null` auf `/marko/<name>/grafeo?scheme=<kombination.scheme>`. Navigation über den vorhandenen `data-href`-Handler (D-9). `studio.test.ts`, `studio-035.test.ts` unverändert grün.
- [x] **Thema der Leinwand** (`packages/nodredaktilo/src/roloj.ts`, neu): `XY_ROLOJ` (`satisfies Readonly<Record<\`--xy-${string}\`, \`var(--fm-${string})\`>>`), als `style` auf `<ReactFlow>` (`XY_STILO`); Schrift/Farbe des Textes (`TEKSTO_STILO`: `--fm-typography-body-1-*`, `--fm-color-text-default`) auf dem Rahmen um Leinwand und Seitenspalte; Kantenbeschriftung `labelStyle` = `--fm-typography-caption-*`. `<Background />` (Punkte, Standardwerte der Bibliothek) neu, damit Punkte da sind. Keine `.css`-Datei, kein `hideAttribution`, keine Literale (`grep` auf px/rem/ms/#hex/rgb/oklch in `src` und im Inline-CSS: leer).

### Von React Flow gelesene `--xy-*` (aus `@xyflow/react@12.12.1/dist/style.css`, `grep -o "var(--xy-[a-z0-9-]*"`)

Das Stylesheet liest jede Größe als `var(--xy-X, var(--xy-X-default))` (Teile zusätzlich `var(--xy-X-props, …)`). `XY_ROLOJ` setzt jedes `--xy-X` (35); die `-default`-Variablen sind die Rückfälle der Bibliothek dahinter (werden nie erreicht), die `-props`-Variablen schreiben Komponenten nur aus Props, die die Leinwand nicht übergibt (D-T4-3).

| `--xy-*` | `--fm-*` |
|---|---|
| background-color | color-background-canvas |
| background-pattern-color | color-border-default |
| edge-stroke | color-border-strong |
| edge-stroke-selected | color-focus-ring |
| edge-stroke-width | border-width-default |
| edge-label-background-color | color-background-canvas |
| edge-label-color | color-text-muted |
| connectionline-stroke | color-border-strong |
| connectionline-stroke-width | border-width-default |
| node-color | color-text-default |
| node-background-color | color-background-default |
| node-group-background-color | color-background-sunken |
| node-border | border-width-default + stroke-solid + color-border-default |
| node-border-radius | radius-role-surface |
| node-boxshadow-hover | elevation-shadow-raised |
| node-boxshadow-selected | elevation-shadow-floating |
| handle-background-color | color-border-strong |
| handle-border-color | color-background-canvas |
| selection-background-color | color-status-info-subtle |
| selection-border | border-width-default + stroke-dashed + color-focus-ring |
| resize-background-color | color-focus-ring |
| controls-box-shadow | elevation-shadow-raised |
| controls-button-background-color | color-background-raised |
| controls-button-background-color-hover | color-background-sunken |
| controls-button-color | color-text-default |
| controls-button-color-hover | color-text-default |
| controls-button-border-color | color-border-subtle |
| attribution-background-color | color-background-raised |
| minimap-background-color | color-background-raised |
| minimap-mask-background-color | color-backdrop |
| minimap-mask-stroke-color | color-border-subtle |
| minimap-mask-stroke-width | border-width-default |
| minimap-node-background-color | color-background-sunken |
| minimap-node-stroke-color | color-border-default |
| minimap-node-stroke-width | border-width-default |

Jede `--fm-*`-Variable in `src` und im Inline-CSS gegen die erzeugte komuna-CSS (`CSS_CELO`) geprüft: alle vorhanden. Nur Rollen, keine Palettenstufen.

### Browser (Playwright MCP, 1600×1000, `pnpm build`, Workdir `/tmp/ne1-marken` mit provo, `metiejo --port 7301`, Server danach gestoppt)

Stichprobe: berechneter Wert am Element (`getComputedStyle`) gegen den berechneten Wert der zugeordneten `--fm-*` (Hilfselement in `.react-flow` mit `var(--fm-…)`), jeweils gleich:

| Bildschirm | Hintergrund | Punkte | Kante | Controls (Grund / Text) | Text | weitere |
|---|---|---|---|---|---|---|
| provo hell | rgb(234,234,236) | rgb(109,106,115) | rgb(84,82,91) | rgb(250,248,255) / rgb(40,39,45) | rgb(40,39,45) | Kantenbeschriftung rgb(84,82,91) auf rgb(234,234,236), Attribution rgb(250,248,255), Tenilo rgb(84,82,91), Schrift „Geist, system-ui, sans-serif“ (Leinwand und Kantenbeschriftung) |
| provo dunkel | rgb(30,29,34) | rgb(169,167,176) | rgb(198,196,203) | rgb(62,60,68) / rgb(243,242,244) | rgb(243,242,244) | |
| komuna hell | rgb(241,241,241) | – | gleich | – | – | |
| komuna dunkel | rgb(27,27,27) | rgb(145,145,145) | rgb(241,241,241) | rgb(48,48,48) | rgb(248,248,248) | |
| ekzemplo hell | rgb(238,238,238) | – | rgb(0,0,0) | gleich | – | |
| ekzemplo dunkel | rgb(31,31,31) | – | rgb(190,190,190) | gleich | – | |

- Alle sechs: Wurzel `data-fm-aspekto` (provo/komuna/ekzemplo) und `data-fm-color-scheme` wie `?scheme=`; `data-nr-preta` gesetzt; zugeklappt provo 8, komuna 8, ekzemplo 7 Knoten (leere Gruppen fehlen, ekzemplo hat eine Achse weniger); Attribution sichtbar; Konsole ohne Fehler.
- Studio `/studio/provo/farbe?scheme=dark`: genau ein „Graph ansehen“, `data-href="/marko/provo/grafeo?scheme=dark"`; Klick führt auf den Bildschirm (dunkel).
- 422: Marke `zyklo` (provo-Kopie) per `POST /api/marko/zyklo/entwurf` mit Zyklus in `festgelegt`: API 422 `grafeo-ciklo`; der Bildschirm zeigt `#nr-eraroj`, keine `.react-flow`, und `nicht exportierbar` (die Prüfung dieser rev: `exportable: false`). Die einzige Konsolenmeldung ist der 422-Abruf selbst.
- 503: `dist/leinwand.js` weggenommen, Server neu: `/marko/provo/grafeo`, `/aspekto/komuna/grafeo`, `/nodredaktilo/leinwand.js` 503 mit dem Bau-Satz, `/api/grafeo?aspekto=komuna` 200, Studio ohne Knopf. Datei zurückgelegt.
- ekzemplo-404 mit `ekzemploDir: null`: über den Test (Bildschirm, CSS, API).
- Bilder (nicht im Repo): `qa-screenshots/t4-provo-hell.png`, `t4-provo-dunkel.png`, `t4-komuna-dunkel.png`, `t4-ekzemplo-hell.png`, `t4-studio-graph-ansehen.png`, `t4-zyklo-422-nicht-exportierbar.png`.

### Prüfungen

- `pnpm --filter @fundamento/metiejo lint` grün (die bekannte Warnung `src/komponentoj.ts:42` bleibt); `pnpm --filter @fundamento/nodredaktilo lint` und `build` grün (`dist/leinwand.js` 632 437 Byte, gzip 169 139); keine `.css`-Datei unter `packages/nodredaktilo`.
- `grafeo-047`, `grafeo-neu-047`, `grafeo-kialo-047`, `abhaengigkeiten-047`, `grafeo-route-047`, `servilo.test.ts`, `studio.test.ts`, `studio-035.test.ts` mit `FM_AUSGABE=knapp`: 84 bestanden, 0 rot.
- `packages/modelo/src/ci/turbo-inputs.test.ts` allein: 8/8, kein `*-047`-Eintrag. `test-setup.test.ts` allein: 4/4.

### Befunde

- **F-T4-1** Der 422-Zweig „`readAgordo` meldet etwas“ ist über HTTP nicht erreichbar: jeder Entwurf im Speicher kommt durch `readAgordo` (Datei lesen, `entwurf`-Route), F-T2-2 bestätigt. Erreichbar und getestet ist 422 über einen Zyklus unter festen Tokens (`festgelegt` mit `color.text.default ↔ color.text.muted`), den `readAgordo` annimmt und `grafeoDe` als `GrafeoEraro` meldet. Für NE-2: ob `readAgordo` solche Zyklen selbst ablehnen soll.
- **F-T4-2** provo ist exportierbar; das Schildchen erscheint deshalb nur bei der Zyklus-Marke (Test und Browser).
- **F-T4-3** (NE-2, war F-T3-4) Das Öffnen der Seitenspalte passt die Leinwand nicht neu ein. Nicht in T4 geändert: ein `fitView` bei jeder Auswahl würde den Zoom des Nutzers bei jedem Klick verwerfen; das ist eine Entscheidung für NE-2, keine Thema-Frage.
- **F-T4-4** Feste Größen der Bibliothek bleiben ihre (Controls-Knöpfe 26 px, Attribution 10 px, Tenilo 6 px, Panel-Rand 15 px): sie hängen nicht an `--xy-*`, und ein Überschreiben bräuchte CSS-Regeln (B-2). Für NE-2 notiert.

### Entscheidungen

- **D-T4-1** Reihenfolge der Antworten: erst „gibt es nicht“ (404 `notFound` bzw. der ekzemplo-Satz), dann „Bündel fehlt“ (503). So antwortet derselbe fehlende Gegenstand auf API, Bildschirm und CSS gleich; `/nodredaktilo/*` kennt keinen Gegenstand und antwortet ohne Bündel immer 503.
- **D-T4-2** `GET /aspekto/:label/grafeo.css` braucht das Bündel nicht (es ist nur CSS), wie die API (A-3).
- **D-T4-3** `XY_ROLOJ` deckt jede `--xy-X`, die das Stylesheet liest (35, inkl. Minimap und Resize, die NE-1 nicht zeigt); die `-default`- und `-props`-Variablen werden bewusst nicht gesetzt (Rückfälle bzw. Prop-Kanäle).
- **D-T4-4** Rahmen-Kurzformen (`node-border`, `selection-border`) sind drei Rollen hintereinander (`border-width-default`, `stroke-solid|dashed`, Farbrolle); der Typ erlaubt das, weil der Wert mit `var(--fm-` beginnt und mit `)` endet.
- **D-T4-5** Der Bildschirm lädt die `@font-face` der Marke wie die Vorschau (sonst fiele die Anzeigeschrift von provo, Prata, auf den Ersatz zurück). Kopf-Link „Zum Studio“ behält das Schema.
- **D-T4-6** `<Background />` mit den Standardwerten der Bibliothek (Punkte); Abstand und Punktgröße sind Zahlen-Props von React Flow, keine eigenen Literale.
- **D-T4-7** Testweg 422 wie F-T4-1; der Test prüft außerdem, dass der Bildschirm der Zyklus-Marke 200 liefert und das Schildchen trägt.

## T5 im Einzelnen

- [x] Skript `packages/nodredaktilo/scripts/bilder.ts`, Eintrag `"bilder": "tsx scripts/bilder.ts"` in `packages/nodredaktilo/package.json` (sonst unverändert; `scripts` stand schon im `include` der `tsconfig.json`, Biome prüft es mit `biome check .`). Aufruf `pnpm --filter @fundamento/nodredaktilo bilder --ziel <dir> [--luecken <datei>]`; relative Pfade gelten ab dem Aufrufort (`INIT_CWD`).
  - Ohne `--ziel`: schreibt nichts, nennt den Grund, Exit 2 (geprüft: `git status --porcelain` danach unverändert).
  - Fehlt `packages/cli/dist/index.js` oder `packages/nodredaktilo/dist/leinwand.js`: nennt `pnpm build`, Exit 2.
  - Temporärer Arbeitsordner mit `provo/agordo.json` aus `packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json`; `node packages/cli/dist/index.js metiejo --port <frei> --workdir <tmp>` als Kindprozess (kein Import der Metiejo, D-2); wartet, bis `GET /` antwortet (oder der Kindprozess endet), beendet ihn im `finally`, löscht den Ordner.
  - Chromium über `playwright` 1.63.0 (Chromium 153.0.8010.12, schon installiert; keine Installation nötig), Viewport 1600×1000. Playwright-Standardgrenzen unverändert; ein Schritt, der in eine läuft, steht als `"nicht gemessen: Playwright-Standardgrenze"` in `messung.json` und auf stderr.
- [x] Lauf: `pnpm build` (grün), dann `pnpm --filter @fundamento/nodredaktilo bilder --ziel /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec047 --luecken specs/047-nodredaktilo-lego/luecken.json` → Exit 0, 1 min 50 s. Neun PNG unter `…/spec047/bilder/` (`{komuna,ekzemplo,provo}-{hell,dunkel,offen}.png`), `…/spec047/messung.json`, `specs/047-nodredaktilo-lego/luecken.json` (202 091 Byte, kanonisch). Kein Schritt „nicht gemessen“.

### Messung (`messung.json`, je 5 Läufe)

| Marke | Knoten | Kanten | zugeklappt | bis sichtbar ms Median / Max | größte Gruppe (direkt) | Aufklappen ms Median / Max |
|---|---:|---:|---:|---:|---|---:|
| komuna | 2115 | 2200 | 8 | 316 / 382 | `farbe/komponenten` 920 | 1364 / 1446 |
| ekzemplo | 2115 | 2058 | 7 | 337 / 345 | `farbe/komponenten` 920 | 1391 / 1512 |
| provo | 2133 | 2420 | 8 | 159 / 185 | `farbe/komponenten` 920 | 1463 / 1695 |

### Lückenliste (`luecken.json`)

Abgeleitete Knoten ohne `kialo`: komuna 920, ekzemplo 1842, provo 1852 (gleich der Vorstufe aus T1). Je Gruppe im Bericht, Abschnitt 4.

### Diff-Suche (gegen `origin/main` = Merge-Basis `943cc22f`, F-T2-1; Stand nach dem Commit des Skripts, Arbeitsbaum sauber)

1. `git diff --name-only origin/main...HEAD` + `git status --porcelain`: 30 Dateien (mit `bericht.md` aus dem zweiten T5-Commit 31), alle in den erlaubten Bereichen (`packages/nodredaktilo/**` 12, `packages/metiejo/src/grafeo*.ts` 3, `*-047.test.ts` 5, `test-doubles/grafeo-047.ts`, `servilo.ts`, `html.ts`, `studio.ts`, `packages/metiejo/package.json`, `pnpm-lock.yaml`, `specs/047-nodredaktilo-lego/**`). Gegenprobe `… | grep -vE '^(packages/nodredaktilo/|packages/metiejo/src/grafeo[^/]*\.ts$|packages/metiejo/src/[^/]*-047\.test\.ts$|packages/metiejo/src/test-doubles/grafeo-047\.ts$|packages/metiejo/src/(servilo|html|studio)\.ts$|packages/metiejo/package\.json$|pnpm-lock\.yaml$|specs/047-nodredaktilo-lego/)'`: leer.
2. `… | grep -E '^(packages/vortaro/|packages/modelo/data/|packages/agordilo/|packages/eroj/|\.github/)|^[^/]+$' | grep -v '^pnpm-lock.yaml$'`: leer.
3. `git diff -U0 origin/main -- . ':!pnpm-lock.yaml' | grep -nE '^\+.*(timeout|threshold|sojlo|limit|toBeLessThan)'`: drei Treffer vor T5, alle erklärt:
   - `packages/metiejo/src/grafeo-047.test.ts`: `toBeLessThanOrEqual(40)` – die von der Spec vorgegebene Prüfung „zugeklappt höchstens 40“, keine geänderte Grenze.
   - `specs/047-nodredaktilo-lego/plan.md`: der Satz der technischen Präzisierung, der diese Diff-Suche beschreibt (byte-gleiche Kopie).
   - `specs/047-nodredaktilo-lego/spec.md`: „Zeitlimits“ in Regel 0 der Spec (byte-gleiche Kopie).
   - Nach T5 kommen Treffer in `tasks.md` hinzu: diese Liste selbst (der zitierte Befehl und seine Erklärung). Das Skript `bilder.ts` hat **keinen** Treffer: es nutzt die Playwright-Standardgrenzen, ohne eine Zahl zu setzen.
4. `git diff origin/main -- packages/metiejo/package.json`: genau eine Zeile hinzu (`"@fundamento/nodredaktilo": "workspace:*"` unter `devDependencies`), `--numstat` `1 0`.
5. `find packages/nodredaktilo -name '*.css' -not -path '*/node_modules/*'`: leer.
6. `git status --porcelain | grep -E '\.png$|messung\.json'`: leer (die Bilder und `messung.json` liegen außerhalb des Checkouts).

### Lokale Läufe (`FM_AUSGABE=knapp`, im Hintergrund, nie zwei Playwright-Suiten zugleich)

Der Rechner war während der Läufe stark belastet (`uptime`: Last 45–58 bei 10 Kernen, auch durch Prozesse außerhalb dieses Laufs). Unter paralleler turbo-Last liefen Tests verschiedener Pakete in ihre **eigenen, unveränderten** vitest-Zeitgrenzen; keine Grenze wurde angehoben, jedes betroffene Paket allein ist grün.

| Lauf | Ergebnis |
|---|---|
| `pnpm test:betroffen` #1 | `alle: true` (Lockfile, E-8), Engines chromium. Rot: `@fundamento/eroj` – `test/knapp-playwright.test.ts:54` und `test/vitrino-partoj.test.ts:101` „Hook timed out in 10000ms“ (Last); turbo bricht beim ersten Fehler ab. Die beiden Dateien allein: 13/13 grün. |
| `pnpm test:betroffen` #2 | eroj grün. Rot: `@fundamento/nordstelo` 11 Tests, alle „Test/Hook timed out“ (5000/10000 ms). nordstelo allein (`pnpm --filter` und `turbo --filter`): grün (270/270). |
| `pnpm test:betroffen` #3 | wieder nordstelo (12, nur Zeitüberschreitungen); danach allein grün (s. o.). |
| `pnpm test:betroffen` #4 | Rot: `@fundamento/mcp` 13 Tests, alle „timed out“ (30 000 / 120 000 ms), 756 s. mcp allein über turbo: grün. |
| `pnpm test:betroffen` #5 | Rot: `@fundamento/agordilo` 5 Tests, alle „Test timed out in 120000ms“, 545 s. |
| `PLAYWRIGHT_ENGINES=chromium FM_AUSGABE=knapp pnpm turbo run test --concurrency=1 --continue --output-logs=errors-only` (dieselbe Aufgabenmenge wie `test:betroffen` mit `alle: true`, nur seriell) | **18 von 19 Aufgaben grün** (agordilo, metiejo, cli, ekranoj, eroj, mcp, nordstelo, projekcioj, … grün). Einzige rote: `@fundamento/modelo` – `src/workspace.test.ts:40` (4933 grün, 1 rot) = **B-1 (b)**, benannt. `modelo turbo-inputs` und `eroj zweitfarbe-036` sind lokal grün. |
| `pnpm lint` | grün, 22/22 Aufgaben (bekannte alte Warnung `packages/metiejo/src/komponentoj.ts:42`). |
| `pnpm check:vortaro-lint` (A-1) | PASS, 0 Fehler, 0 Warnungen (`cssFiles=5`, keine aus nodredaktilo). |
| `pnpm check:clean-room` (A-1) | PASS, 0 Fehler, 0 Warnungen. |
| `pnpm check:privat` (A-1) | PASS, 0 Treffer; nach dem T5-Commit wiederholt (mit `bericht.md`): PASS. |

Durch diesen Branch verursacht und rot bleibt nur B-1 (b). Kein Fix in T1–T4-Zonen nötig.

### Befunde

- **F-T5-1** (NE-2) `farbe/komponenten` (920 Knoten) aufgeklappt und eingepasst ist eine einzige Spalte (dagre `LR`, alle Mitglieder in einem Rang): kein Knoten lesbar, und weder ein Knoten noch der Schalter „Zuklappen“ der Gruppe ist mit dem Zeiger zu treffen (Playwright `click` auf den Schalter lief beim Zuklappen in seine Standardgrenze). Siehe `*-offen.png`.
- **F-T5-2** Aufklappen dauert im Skript 1,36–1,46 s (Median), T2 maß im Browser der QA rund 0,6 s für dieselbe Gruppe (F-T2-5). Unterschied: seit T3/T4 sind Knoten `fm-karto` mit Eroj-Inhalt und Marken-Stilen (mehr zu messen und zu malen); das Skript läuft headless. Keine Grenze, nur Messung.
- **F-T5-3** (NE-2) Kanten laufen hinter Knoten durch; ihr Etikett kann verdeckt sein (`provo-hell.png`: Eingaben → Form unter „Schrift“).
- **F-T5-4** „Bis sichtbar“ ist bei provo (159 ms) halb so lang wie bei komuna/ekzemplo (316/337 ms), obwohl provo auf die gemeinsame Prüfung wartet; die Paket-Bildschirme laden das Paket-CSS über `/aspekto/:label/grafeo.css`. Nicht weiter untersucht.

### Entscheidungen

- **D-T5-1** Das Zuklappen zwischen den Messzyklen und die Auswahl eines Knotens in der offenen Gruppe lösen das `click`-Ereignis direkt am Element aus (`dispatchEvent`), weil der Zeiger es nicht trifft (F-T5-1). Das Aufklappen, das gemessen wird, ist ein echter Zeigerklick; die Leinwand startet ihre Uhr ohnehin im Klick-Handler, `dauro` bedeutet in beiden Fällen dasselbe.
- **D-T5-2** „Bis sichtbar“ und „zugeklappt“ aus 5 frischen Browser-Kontexten im Schema hell (je ein Kontext, kein geteilter Cache); die Bilder hell/dunkel aus je einer eigenen Ladung. „Aufklappen“: Achse `farbe` einmal öffnen, dann 5 × `farbe/komponenten` auf (gemessen) und zu, der letzte Zyklus bleibt offen für das Bild.
- **D-T5-3** „Größte Gruppe“ = Gruppe der Ebene 2 (mit `patro`) mit den meisten direkten `nodoj`, bei Gleichstand die kleinere Id. Gewählter Knoten = erstes Mitglied (sortiert), `ero.alsxutilo.border.color.disabled` in allen drei Graphen.
- **D-T5-4** `messung.json` trägt je Marke zusätzlich `groessteGruppe`, die Einzelwerte `laeufe` und `offenBild` (gewählte Id); die Schlüssel der Spec stehen unverändert.
- **D-T5-5** Das Warten auf den Start der Metiejo hat keine eigene Zeitgrenze: es endet, sobald `GET /` antwortet oder der Kindprozess endet (keine neue Zahl).

## T6 im Einzelnen

(offen)
