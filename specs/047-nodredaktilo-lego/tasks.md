# Spec 047 – Aufgaben (NE-1: den Graphen lesen)

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) (mit Nachtrag NE-1) · **Basis:** `main` `943cc22f` · **Branch:** `261110-spec-047-node-editor-graph-les-d83783`

Sechs Tickets, ein Strang (Spec: „höchstens 6 Tickets, ein PR“). T1–T5 setzen Engineers um, T6 der Orchestrator nach der QA. Commits lokal mit dem Präfix `Spec 047 T<n>: …`; gepusht wird nur in T6, genau einmal. Je Ticket ein Abschnitt unten: erledigte Punkte, Rot→Grün-Beleg, Befunde `F-T<n>-k`, Entscheidungen `D-…`.

| Ticket | Inhalt | Stand |
|---|---|---|
| T1 | Spec-Ordner; `grafeoDe`, `grafeoDePaket`, Sicht-Logik; `grafeo-047`, `grafeo-neu-047`, `grafeo-kialo-047` | erledigt (Befunde F-T1-1 bis F-T1-4, Entscheidungen D-T1-1 bis D-T1-10) |
| T2 | Paket `nodredaktilo`, React-Insel zugeklappt, Routen `/nodredaktilo/*` und `/api/grafeo`; `abhaengigkeiten-047`; B-1 (b) | erledigt (Befunde F-T2-1 bis F-T2-6, Entscheidungen D-T2-1 bis D-T2-7; B-1 (b): `workspace.test.ts` rot, benannte Ausnahme) |
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

(offen)

## T4 im Einzelnen

(offen)

## T5 im Einzelnen

(offen)

## T6 im Einzelnen

(offen)
