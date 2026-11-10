# Spec 047 – NE-1: technische Präzisierung

**Stand:** 2026-11-10 · **Gehört zu:** `product-spec.md` (byte-gleich mit der Quelle `.fundamento/spec047/spec.md`, sha256 `5853b84d…7f6636`) · **Basis:** aktuelles `main`

Diese Datei ändert die Produkt-Spec nicht, sie präzisiert sie. Wo die Produkt-Spec schweigt oder sich am Repo stößt, gilt das hier. Wo beide etwas sagen, gilt die Produkt-Spec. Die Entscheidungen P-1 bis P-3 hat der Maintainer am 10.11. bestätigt. P-4 bis P-8 sind Folgerungen aus dem Repo-Stand. Wer sie anders will, ändert sie hier vor dem Go.

## Erster Schritt im Build
T1 beginnt damit, `product-spec.md` **byte-gleich** nach `specs/047-nodredaktilo-lego/spec.md` zu kopieren und mit `cmp` zu prüfen. Die Präzisierungen kommen als `specs/047-nodredaktilo-lego/plan.md` daneben, als Kopie dieser Datei, die Ticketliste als `tasks.md`. `spec.md` wird nicht editiert. Im Verzeichnis liegen am Ende nur `spec.md`, `plan.md`, `tasks.md`, `bericht.md` und `luecken.json` (P-3).

## Befunde aus dem Repo (Stand `main`, 10.11.)
| # | Befund | Folge |
|---|---|---|
| R-1 | `deriveAspekto` (`packages/agordilo/src/derive.ts`) gibt Dateien, Raporto und Paletten zurück, **keinen Graphen**. Die Abhängigkeiten stecken in den Alias-Werten (`{color.palette.accent.500}`) der erzeugten Sets, in `DerivedPalettes` und in `Gestalt` (welche Tokens Form, Raum, Schrift ändern). | `grafeoDe` liest diese drei Stellen. `agordilo` bleibt unberührt (nur aufrufen). |
| R-2 | Nur `provo` hat ein Agordo (`packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json`). `komuna` (`packages/aspekto-komuna`) ist ein gepflegtes Paket, `ekzemplo` ein Fixture-Paket, beide ohne Agordo. | **P-1** |
| R-3 | `Bases` (`packages/metiejo/src/vorschau.ts`) = `{ structure, calibration, gestalt }`, einmal je Prozess geladen. `ableitungen.ts` liegt in `packages/metiejo/src`. | `grafeoDe` liegt in `packages/metiejo/src/grafeo.ts`, „bei den übrigen Ableitungsdaten“. |
| R-4 | Mit neuen Abhängigkeiten ändert sich `pnpm-lock.yaml`, eine Root-Datei. | **P-2** |
| R-5 | `packages/modelo/src/ci/workflow.test.ts` („every package with tests has one“) verlangt: Jedes Paket mit `scripts.test` steht in der Matrix `unit` von `ci.yml`. `.github/**` ist tabu. | **P-4**: `nodredaktilo` bekommt **kein** `test`-Skript. |
| R-6 | Das veröffentlichte `@fundamento/cli` hängt von `@fundamento/metiejo` ab. Über das optionale Peer von `@fundamento/eroj` (`react.ts`) stehen `react` und `react-dom` **heute schon** in seinem Abhängigkeitsabschluss. | **P-5**: Der Abhängigkeitstest prüft, dass nichts **dazukommt**. Er prüft nicht „kein React“. |
| R-7 | Die Metiejo liefert die Eroj statisch aus (`GET /eroj/*` aus dem `dist` von `@fundamento/eroj`, `servilo.ts`). Bildschirme sind HTML aus `html.ts` mit `<script type="module" src="/eroj/define.js">`. | Die Insel kommt nach demselben Muster: `GET /nodredaktilo/*` aus dem `dist` des neuen Pakets. |
| R-8 | `knapp-vitest.test.ts` verlangt, dass jede `vitest.config.ts` über `vitestAusgabe` berichtet. | Das neue Paket hat keine `vitest.config.ts` (P-4). |

## Entscheidungen

### P-1 Zwei Quellen, ein Graph (Maintainer, 10.11.)
- `grafeoDe(agordo, bases)`: genau die Signatur der Spec, für Marken mit Agordo (`provo` und jede Marke der Metiejo).
- `grafeoDePaket(label, bases)`, daneben: für Aspekto-Pakete ohne Agordo (`komuna`, `ekzemplo`). Quelle ist das komponierte Modelo (`buildModelo`) mit seinen Alias-Ketten. Feste Werte ohne Alias sind die Eingaben (`speco: "enigo"`). Reguloj und Kialo kommen aus dem Modelo, bei `komuna` auch aus `deveno.json`.
- Beide geben denselben Typ `Grafeo` zurück und laufen durch dieselbe Sortierung und Serialisierung. Die Leinwand weiß nicht, aus welcher Quelle ein Graph stammt.
- `ekzemplo` wird aus `packages/modelo/test/fixtures/valid/aspekto-ekzemplo` gelesen. Fehlt dieses Verzeichnis (zum Beispiel außerhalb eines Checkouts), antwortet die Route mit 404 und dem Text „ekzemplo ist nur im Repo vorhanden“.

### P-2 Lockfile (Maintainer, 10.11.)
`pnpm-lock.yaml` darf sich ändern, und zwar nur durch `pnpm install`, nie von Hand. Jede andere Root-Datei bleibt tabu (`package.json`, `turbo.json`, `biome.json`, `pnpm-workspace.yaml`, `scripts/**`). Eine Diff-Suche in T5 prüft das.

### P-3 Bilder und Messung lokal, außerhalb des Repos (Maintainer, 10.11.)
Die Bilder und Zeiten entstehen mit einem lokalen Playwright-Skript (`packages/nodredaktilo/scripts/bilder.ts`, Aufruf `pnpm --filter @fundamento/nodredaktilo bilder --ziel <verzeichnis>`). Sie kommen **nicht ins Repo**, wie die Fotos aller bisherigen Läufe (Spec 035 D-09: keine PNGs im Repo). Das Skript schreibt nach `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec047/`:
- `bilder/{komuna,ekzemplo,provo}-{hell,dunkel}.png` (6 Bilder, zugeklappt, „Übersicht einpassen“), dazu je Marke ein Bild mit der größten Gruppe aufgeklappt und offener Seitenspalte (`bilder/{marke}-offen.png`, 3 Bilder).
- `messung.json` daneben, mit Knoten, Kanten, Zeit bis die Leinwand steht und Zeit für das Aufklappen der größten Gruppe, je Marke.

Der Bericht verlinkt sie mit `file://`-Pfaden. Ohne `--ziel` schreibt das Skript nichts und nennt den Grund. `.gitignore` wird nicht geändert, denn das Ziel liegt außerhalb des Checkouts; ein `git status` nach T5 zeigt keine PNG und keine `messung.json`.

Das sind **keine** Baseline-Bilder, und kein Test vergleicht sie.

`specs/047-nodredaktilo-lego/` enthält am Ende genau fünf Dateien: `spec.md`, `plan.md`, `tasks.md`, `bericht.md` und `luecken.json`.

### P-4 Kein `test`-Skript im neuen Paket
`packages/nodredaktilo/package.json` hat `build`, `lint` und `bilder`, aber **kein** `test`. So bleibt R-5 grün, ohne `.github/**` oder `workflow.test.ts` anzufassen. Alles, was CI prüfen soll, liegt als Vitest in `packages/metiejo/src/*-047.test.ts`, denn die Metiejo steht in der Matrix.

Daraus folgt der Schnitt:
- **`packages/metiejo/src/grafeo.ts`**, rein und ohne React: `grafeoDe`, `grafeoDePaket`, `serializeGrafeo`, sowie die Sicht-Logik `sichtbaro(grafeo, malfermitaj)`, `devenoDe(grafeo, id)` und `dependantojDe(grafeo, id)`. Dieses Modul importiert nichts aus `node:*`.
- **`packages/nodredaktilo`** ist nur die React-Schicht: Er holt den Graphen als JSON, rechnet die Sicht mit `sichtbaro` und zeichnet sie. Er importiert `grafeo.ts` über den Unterpfad `@fundamento/metiejo/grafeo`. Das ist eine Zeile `exports` in `packages/metiejo/package.json` und gehört zu P-6.

### P-5 Abhängigkeiten: nichts kommt dazu
- `react`, `react-dom`, `@xyflow/react` und `@dagrejs/dagre` stehen in `packages/nodredaktilo` **nur unter `devDependencies`**. Vite bündelt sie in `dist/leinwand.js`. Das Paket hat zur Laufzeit keine Abhängigkeit, und Node lädt das Bündel nie, es geht nur an den Browser.
- `packages/nodredaktilo` hat `"private": true` und `"license": "MIT"`.
- Die Metiejo führt `@fundamento/nodredaktilo` nur unter `devDependencies`, damit Turborepo die Bau-Reihenfolge kennt. Zur Laufzeit sucht sie das Bündel mit `import.meta.resolve` in `try/catch` (siehe Randfälle).
- **Test `abhaengigkeiten-047.test.ts`** (Metiejo) liest die Abhängigkeitsabschlüsse aus den `package.json` des Workspace (`dependencies`, `optionalDependencies`, `peerDependencies`):
  1. Kein Paket ohne `private: true` hat `@fundamento/nodredaktilo`, `@xyflow/react` oder `@dagrejs/dagre` im Abschluss.
  2. Die React-Einträge im Abschluss jedes veröffentlichten Pakets sind genau die von `main`, also heute nur `@fundamento/cli` mit `react` und `react-dom` über das optionale Peer der Eroj (R-6). Die Liste steht als Konstante im Test, mit Verweis auf R-6.
  3. `@fundamento/eroj` und `@fundamento/projekcioj` erwähnen weder `@xyflow/react` noch `@dagrejs/dagre` noch `@fundamento/nodredaktilo`.
  4. Kein Modul unter `packages/*/src` außerhalb von `packages/nodredaktilo` importiert `react`, `@xyflow/*` oder `@dagrejs/*`. Ausgenommen sind die bestehenden `packages/eroj/src/react*.ts` und die React-Projekcio in `packages/projekcioj`; die Ausnahmen stehen als Liste im Test.

### P-6 Benannte Ausnahmen bei der Abgrenzung
Diese Stellen liegen außerhalb von „Frei“, ohne sie geht es aber nicht. Mehr ist nicht erlaubt:
| Datei | Änderung | Warum |
|---|---|---|
| `pnpm-lock.yaml` | durch `pnpm install` | P-2 |
| `packages/metiejo/package.json` | eine `devDependencies`-Zeile `@fundamento/nodredaktilo`, ein Eintrag `exports["./grafeo"]` | P-4, P-5 |

`packages/metiejo/tsconfig*.json`, `turbo.json` und `biome.json` bleiben, wie sie sind. Bricht Lint oder Build ohne eine Änderung dort, stoppt das Ticket und meldet es. Es ändert die Datei nicht.

### P-7 `valoro` je Schema
Die Leinwand folgt hell und dunkel (Spec §2). Darum ist `valoro` ein Objekt `{ light: string; dark?: string }`. `dark` steht nur dort, wo der Wert im dunklen Schema anders ist. Die Seitenspalte zeigt den Wert des aktuellen Schemas und den anderen klein darunter.

### P-8 `regulo` ist ein Mechanismus, `kialo` ist Datenbestand
- `regulo` nennt den Mechanismus, der den Wert setzt. Das Vokabular ist fest und klein: `alias` (Wert ist ein Verweis), `paletto` (Stufe aus `derivePalettes`), `gestalto` (aus `deriveGestalt`), `fiksa` (fester Wert im Paket), dazu die `id` einer Modelo-Regulo, falls eine den Token nennt. Der Name wird aus dem Code abgelesen, nicht formuliert.
- `kialo` kommt **nur** aus vorhandenen Daten: `kialo` der Modelo-Reguloj, `kialo` der Jugxoj des Agordo, `deveno.json` (`maniero`, `sxlosilo`) bei `komuna`. Findet sich nichts, bleibt das Feld leer. Die Leinwand zeigt dann „fehlt“, und der Knoten steht in der Lückenliste. Kein Text wird erzeugt.

## Datenmodell

```ts
type Speco = "enigo" | "derivajxo";            // "propono" erst in NE-2

interface Nodo {
  id: string;                                   // Token-Pfad oder "enigo:<agordo-pfad>"
  speco: Speco;
  grupo: string;                                // id einer Grupo (unterste Ebene)
  etikedo: string;                              // Anzeigename = letzter Pfadteil, nie übersetzt
  valoro?: { light: string; dark?: string };    // P-7
  regulo?: string;                              // P-8
  kialo?: string;                               // P-8; fehlt → Lückenliste
}
interface Ligo { de: string; al: string }       // de hängt ab von al
interface Grupo { id: string; etikedo: string; patro?: string; nodoj: string[] }
interface Grafeo { nodoj: Nodo[]; ligoj: Ligo[]; grupoj: Grupo[] }
```

- **Gruppen in zwei Ebenen.** Ebene 1 sind die Achsen Eingaben, Farbe, Schrift, Form, Raum, Dichte, Elevation, Bewegung und **Weitere**. Ebene 2 (`patro` = Achse) sind Palette, Rollen und Komponenten-Tokens. Die Zuordnung geht über den Pfadanfang des Tokens. Eine Tabelle in `grafeo.ts` legt sie fest, und T1 prüft sie gegen das echte Modelo. Ein Token, das keine Regel trifft, kommt nach **Weitere** und geht nie verloren (Test „neuer Token erscheint“).
- **Kanten zwischen Gruppen** rechnet `sichtbaro` aus den Knotenkanten, mit einer Zahl („12 Abhängigkeiten“). Sie stehen nicht im `Grafeo`.
- **Determinismus.** Knoten werden nach `id` sortiert, Kanten nach `(de, al)`, Gruppen nach fester Achsenfolge und dann nach `id`. Kein `Map`- und kein `Set`-Durchlauf geht in die Ausgabe. `serializeGrafeo` nutzt `serializeCanonicalJson` aus `@fundamento/modelo`.
- **Zyklen** dürfen nicht vorkommen, Alias-Zyklen weist das Modelo schon ab. Findet `grafeoDe` trotzdem einen, wirft es einen strukturierten Fehler mit `path` und `rule: "grafeo-ciklo"`, statt eine Kante still fallen zu lassen.

## Oberfläche

### Routen der Metiejo (`servilo.ts`, `html.ts`)
| Route | Antwort |
|---|---|
| `GET /marko/:name/grafeo` | HTML-Bildschirm nach dem Muster aus `html.ts`: Wurzel mit `data-fm-aspekto`, `data-fm-color-scheme` der Marke, `/eroj/define.js`, Stylesheet der Marke wie in der Vorschau, ein Container `#nr-leinwand`, `<script type="module" src="/nodredaktilo/leinwand.js">` |
| `GET /aspekto/:label/grafeo` | dasselbe für `komuna` und `ekzemplo` (P-1); ohne Knopf, nur über die URL (Skript, Tests) |
| `GET /api/grafeo?marko=…` / `?aspekto=…` | `serializeGrafeo(…)`, `content-type: application/json` |
| `GET /nodredaktilo/*` | statisch aus `dist` von `@fundamento/nodredaktilo` |

- **Einstieg:** ein `fm-butono` „Graph ansehen“ in der Kopfleiste einer offenen Marke. Er öffnet `/marko/:name/grafeo` im selben Tab. Es gibt kein neues Menü.
- **Zustand:** Was aufgeklappt ist und welcher Knoten gewählt ist, liegt im React-Zustand. Neu laden heißt wieder zugeklappt. Es gibt kein `localStorage` und kein Schreiben ins Agordo.

### Leinwand (`packages/nodredaktilo`)
- **Knoten:** ein eigener Knotentyp von React Flow, der `<fm-karto>` rendert. Darin `<fm-titolo>` mit `etikedo`, `<fm-insigno>` mit der Art (Eingabe, Ableitung, bei Gruppen: Gruppe und Zahl der Knoten) und `valoro` als Text. Gruppenknoten tragen einen `fm-butono` zum Auf- und Zuklappen.
- **Layout:** `@dagrejs/dagre`, Richtung von links nach rechts, von den Eingaben zu den Komponenten-Tokens. Gerechnet wird nach jedem Auf- und Zuklappen, nur für die sichtbaren Knoten. Die Knotengröße wird gemessen, nicht geschätzt.
- **Bedienung:** Zoomen, Schieben, „Übersicht einpassen“ über `<Controls>` von React Flow, ohne den Sperrknopf. `nodesDraggable`, `nodesConnectable` und `elementsSelectable` (für das Bearbeiten) sind `false`. Ein Klick auf einen Knoten setzt nur den gewählten Knoten.
- **Seitenspalte:** eine `fm-karto` rechts mit Name, Wert (P-7), `regulo`, `kialo` oder sichtbar „fehlt“, dazu
  - für eine Ableitung die **Herkunftskette** `devenoDe`: Knoten für Knoten bis zur Eingabe, als Liste. Ein Klick auf einen Eintrag wählt ihn auf der Leinwand und klappt seine Gruppe auf.
  - für eine Eingabe **was von ihr abhängt** (`dependantojDe`): direkte Abhängige als Liste, darunter die Zahl aller transitiven Abhängigen.
- **Marke auf der Leinwand:** Jede `--xy-*`-Variable, die React Flow benutzt (Hintergrund, Punkte, Kanten, Controls, Auswahl), wird auf eine Rolle `--fm-*` gesetzt. Auch Abstände, Radien und Schrift der Leinwand kommen aus `--fm-*`. Hell und dunkel folgen `data-fm-color-scheme`. Es kommt kein Token dazu und kein Literalwert in eigenes CSS.
- **Hinweis-Schildchen** von React Flow bleibt sichtbar (B-4): kein `proOptions.hideAttribution`.
- **Bereit-Marke:** Nach dem ersten `fitView` setzt die Leinwand `data-nr-preta` am Container. Nach jedem Auf- und Zuklappen setzt sie, sobald das Layout fertig gezeichnet ist, `data-nr-rev` auf eine fortlaufende Zahl. Daran misst das Skript (P-3), und daran warten die Tests.

## Randfälle
| Fall | Verhalten |
|---|---|
| Bündel nicht gebaut (`import.meta.resolve` scheitert oder `dist` fehlt) | Der Knopf „Graph ansehen“ fehlt. Die Routen antworten 503 mit „Leinwand nicht gebaut: `pnpm --filter @fundamento/nodredaktilo build`“. |
| Marke existiert nicht | 404 mit dem Text der bestehenden Metiejo-Meldung „Marke … nicht gefunden“ |
| Agordo ungültig (`readAgordo` meldet etwas) | Die Leinwand zeigt keinen Graphen, sondern die Meldungen in einer `fm-karto`. Es gibt keinen halben Graphen. |
| Ableitung nicht exportierbar (`exportable: false`) | Der Graph wird trotzdem gezeigt, denn er hängt nicht am Export. In der Kopfzeile steht ein `fm-insigno` „nicht exportierbar“. |
| Knoten ohne Kialo | Die Seitenspalte zeigt „fehlt“, der Knoten kommt in die Lückenliste des Berichts. |
| Gruppe mit 0 Knoten | Sie wird nicht gezeigt. |
| Sehr große Gruppe (zum Beispiel die Komponenten-Tokens) | Sie wird aufgeklappt wie jede andere. Die Zeit dafür wird gemessen (Abnahme), es gibt keine Grenze und kein weiteres Unterteilen in NE-1. |
| Token im Modelo neu | Er erscheint ohne Codeänderung, im Zweifel unter „Weitere“. |

## Tests (rot zuerst)
Alle Tests liegen in `packages/metiejo/src` und laufen in CI im Job `unit (metiejo)`.
| Datei | Prüft |
|---|---|
| `grafeo-047.test.ts` | `grafeoDe(provo)` und `grafeoDePaket(komuna\|ekzemplo)`: zweimal erzeugt, byte-gleich (`serializeGrafeo`). Jede `ligo` zeigt auf vorhandene Knoten. Jeder Token des komponierten Modelo ist genau ein Knoten (Zahl aus dem Modelo, nicht fest). Zugeklappt `sichtbaro(g, [])` ergibt höchstens 40 Knoten, je Marke. Jede Gruppe lässt sich aufklappen und zeigt ihre Knoten. Ein Zyklus in einer Fixture ergibt `grafeo-ciklo`. |
| `grafeo-neu-047.test.ts` | Eine Fixture-Struktur mit einem **zusätzlichen** Token (auch mit unbekanntem Pfadanfang) ergibt einen Knoten mehr, ohne Codeänderung. |
| `grafeo-kialo-047.test.ts` | `kialo` stammt nur aus Reguloj, Jugxoj und `deveno.json`. Ein Knoten ohne Quelle hat kein `kialo`. `devenoDe` endet bei einer Eingabe, `dependantojDe(eingabe)` ist nicht leer für `leitfarbe`. |
| `abhaengigkeiten-047.test.ts` | P-5, Punkte 1 bis 4 |
| `grafeo-route-047.test.ts` | Routen: JSON ist byte-gleich mit `serializeGrafeo`, Fehlerfälle 404 und 503, der Knopf erscheint nur, wenn das Bündel da ist. |

Die Prüfung „kein neuer Kern-Token, keine Grenze geändert“ ist eine Diff-Suche in T5 gegen `main`, kein Vitest. Sie meldet jeden Treffer in `packages/vortaro/**`, `packages/modelo/data/**`, in `timeout`, `threshold`, `sojlo`, `limit` und `toBeLessThan` in geänderten Zeilen sowie jede Datei aus Tabu oder P-6 außerhalb der erlaubten Zeilen.

## Tickets (≤ 6, ein Strang, so wie in der Spec)
| T | Inhalt | Dateien |
|---|---|---|
| T1 | Spec kopieren (`cmp`). `grafeo.ts` mit `grafeoDe`, `grafeoDePaket`, `serializeGrafeo`, `sichtbaro`, `devenoDe`, `dependantojDe`. Tests `grafeo-*-047` rot, dann grün. | `specs/047-…/`, `packages/metiejo/src/grafeo*.ts` |
| T2 | Paket `nodredaktilo` (Vite, React, React Flow, dagre, alles dev). Insel mit Gruppen zugeklappt, `data-nr-preta`. Routen `/nodredaktilo/*`, `/api/grafeo`. `abhaengigkeiten-047` rot, dann grün. | `packages/nodredaktilo/**`, `packages/metiejo/src/servilo.ts`, P-6 |
| T3 | Knoten als Eroj, Seitenspalte mit Regel, Kialo und „fehlt“, Herkunftskette und Abhängige | `packages/nodredaktilo/src/**` |
| T4 | `--xy-*` auf `--fm-*`, hell und dunkel. Bildschirme `/marko/:name/grafeo`, `/aspekto/:label/grafeo`. Knopf „Graph ansehen“. `grafeo-route-047`. | `packages/nodredaktilo/src/**`, `packages/metiejo/src/html.ts`, `studio.ts`, `servilo.ts` |
| T5 | Skript `bilder` (P-3), 9 Bilder plus `messung.json` nach `.fundamento/spec047/` außerhalb des Repos, Lückenliste `luecken.json`, Diff-Suche. Lokal laufen nur `pnpm test:betroffen` und `pnpm lint`. `git status` zeigt danach keine PNG. | `packages/nodredaktilo/scripts/**`, `specs/047-…/luecken.json` |
| T6 | Ein PR von `main`, **ein** Push, danach genau **ein** `workflow_dispatch` auf dem Branch. CI je Job auswerten, Bericht schreiben, stoppen. | – |

Die Spec setzt mit „ein Strang, 6 Tickets“ die Regel aus `delivery.md` („höchstens 3 Tickets am Stück“) für diesen Lauf ausdrücklich außer Kraft.

## Laufzeit-Grenzen (aus der Spec, hier nur wiederholt)
- Ein Push. Danach kein weiterer Push, auch nicht bei roter CI. Rot wird ein Befund im Bericht.
- Genau ein `workflow_dispatch`, ohne Neustart. R-8 („ein Rerun je Job“) gilt in diesem Lauf **nicht**, denn die Spec ist strenger.
- Ein Wackel-Test wird lokal höchstens 30 Mal wiederholt.
- Bekannt rot und fremd: `packages/eroj/test/zweitfarbe-036`, `modelo turbo-inputs`. Sie stehen im PR-Text, werden nicht angefasst und machen den Lauf nicht rot.
- Der Lockfile-Wechsel (P-2) lässt `betroffen` alle Pakete testen. Das ist erwartet und kein Befund.

## Bericht (T6), Inhalt und Ort
`specs/047-nodredaktilo-lego/bericht.md`, etwa zwei Bildschirme lang (`how-agents-document.md`), mit:
1. PR-Link, Commit, Link zum Dispatch-Lauf, **CI je Job** (grün, rot, „nicht betroffen“, bekannt rot).
2. Die 6 Bilder hell und dunkel je Marke, dazu die 3 aufgeklappten, als `file://`-Links auf `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec047/bilder/…` (P-3). Keine PNG im Repo, nichts eingebettet.
3. `messung.json` (`file://`-Link daneben) als Tabelle im Bericht: Knoten und Kanten je Marke, Knoten zugeklappt, Zeit bis die Leinwand steht, Zeit für das Aufklappen der größten Gruppe (Median und Maximum aus 5 Läufen). Keine Grenze.
4. Lückenliste: Knoten ohne Kialo, gezählt je Marke und Gruppe, die ersten 20 mit `id`, die volle Liste als `luecken.json` daneben.
5. Befunde für NE-2: Trägt die Gruppierung? Welche Gruppe ist zu groß? Wo hakt die Bedienung? Wie viel kostet React in der Metiejo (Größe von `leinwand.js`)?
6. Was der Maintainer als Nächstes tut, in Reihenfolge, mit vollen Pfaden.

Danach stoppen. Nichts mergen.

## Risiken
- **Größe der Komponenten-Gruppe.** Wahrscheinlich mehrere hundert Tokens. Aufklappen kann zäh sein. NE-1 misst das nur. Teilen ist ein Befund für NE-2.
- **Stylesheet für `ekzemplo`.** Dafür gibt es heute keine Metiejo-Route. T4 baut es mit derselben CSS-Projekcio (`CSS_CELO`), die `vorschau.ts` für Marken benutzt, aus dem komponierten Fixture-Modelo, im Speicher und ohne Datei.
- **Änderungen in der Metiejo.** Spec 035, 036 und 037 sind gemergt, auf `main` gibt es keine offenen PRs (Stand 10.11.). `servilo.ts`, `html.ts` und `studio.ts` sind frei. NE-1 ändert dort trotzdem nur wenig und nur additiv: neue Routen in einem eigenen Block, Knopf und Bildschirm in je einer Funktion. So bleibt der Diff lesbar, und NE-2 findet seine Stellen wieder.
- **Web Components in React 19.** `fm-*` als JSX-Elemente brauchen Typen. Die bestehende `packages/eroj/src/react-types` darf nur gelesen werden (Eroj sind tabu). Bei Bedarf deklariert `nodredaktilo` die drei Elemente lokal.

## Nachtrag NE-1 (Umsetzung)

Stand 2026-11-10, T1. Quelle: Implementation Spec NE-1 (Abschnitt 0), geprüft gegen `main` @ `943cc22f`. Der Text oberhalb dieses Nachtrags ist die byte-gleiche Kopie der technischen Präzisierung und bleibt unverändert.

### Entscheidung zu B-1

**Option (b)** (Orchestrator, 10.11.): `packages/modelo/src/workspace.test.ts` wird **nicht** angefasst. Sobald T2 `packages/nodredaktilo` anlegt, ist der Test „has exactly the five Phase-1 packages…“ im CI-Job `unit (modelo)` rot. Das ist eine **benannte Ausnahme**: verursacht durch Spec 047, Behebung = ein Map-Eintrag `nodredaktilo: "@fundamento/nodredaktilo"`, braucht die Zustimmung des Maintainers. T2 vermerkt es in `tasks.md`, PR-Text und Bericht nennen es.

### 0.1 Blocker und Fragen

| # | Issue | Why it matters | Recommendation / default |
|---|---|---|---|
| **B-1** | `packages/modelo/src/workspace.test.ts:40` ("has exactly the five Phase-1 packages…") checks that `readdirSync(packages)` equals a fixed `PACKAGES` map. When `packages/nodredaktilo` appears in T2, this test goes **red** in CI job `unit (modelo)`. The file is in neither "Frei" nor P-6, and P-6 says "Mehr ist nicht erlaubt". The tech spec did not see this. | An existing test breaks because of this change. That is not "fremd". | **(a) Recommended:** the user approves one more P-6 row, `packages/modelo/src/workspace.test.ts`: one added map entry `nodredaktilo: "@fundamento/nodredaktilo"` (alphabetical, between `modelo` and `nordstelo`) with a `// Spec 047 (NE-1)` comment. Nothing else in that file changes. **(b) Default if the user does not answer:** T2 does not touch the file. The test is red, and it is listed as a named exception in the PR text and the bericht ("caused by Spec 047, fix = one map entry, needs maintainer approval"). T2 records it in `tasks.md` and goes on. It does not stop, because the rest of the run does not depend on it. |
| **B-2** | `pnpm check:vortaro-lint` and `pnpm check:clean-room` (CI job `checks`) run the FR-14 namespace scan on **every tracked `.css` file and every `dist/**/*.css`** (`packages/modelo/src/checks/namespace/{files,scan,rules}.ts`). Any declaration `--xy-…:` is flagged `namespace-custom-property`. React Flow's `base.css` and `style.css` both **declare** `--xy-*-default` properties (checked in `@xyflow/react@12.12.1`). | A hand-written `.css` file with the `--xy-*` → `--fm-*` mapping, or a `dist/leinwand.css` emitted by Vite, makes CI red. `packages/modelo/**` cannot get an exception in this run. | **Decision for this run (no taboo change):** `packages/nodredaktilo` has **no `.css` file**, neither in `src/` nor in `dist/`. React Flow's stylesheet is imported with `?inline` and injected at runtime. The `--xy-*` → `var(--fm-*)` mapping is a typed TS constant, applied as `style` on the `<ReactFlow>` container. This is a transparency item: the bericht lists it under NE-2 findings ("the namespace rule does not see the canvas's library variables; decide on a named exception for `packages/nodredaktilo`"). |
| **Q-1** | The tech spec (T5) says "Lokal laufen nur `pnpm test:betroffen` und `pnpm lint`". With one push, B-2 and the `check:privat` scan (lockfile, new files) are otherwise only seen in CI. | One push, no second chance. | **Assumption A-1:** T5 also runs `pnpm check:vortaro-lint`, `pnpm check:clean-room` and `pnpm check:privat` **once each**. These are read-only file scans, not test suites. The user can veto this. If vetoed, drop them from T5. |
| **Q-2** | `bericht.md` holds the CI results, but nothing may be pushed after the dispatch. | The pushed bericht cannot contain CI results. | **Assumption A-2:** T5 commits the bericht draft (measurements, Lückenliste, NE-2 findings, `leinwand.js` size), so the single push carries it with marked placeholders. T6 (orchestrator) fills in PR link, commit, run link and CI per job, and commits **locally only**. The bericht's "next steps" tell the maintainer to push or take over that commit. |

### 0.2 Repo-Befunde R-1…R-8 gegen `main` @ `943cc22f` und neue Abweichungen

| # | Status | Detail / consequence |
|---|---|---|
| R-1 | **holds** | `deriveAspekto` (`packages/agordilo/src/derive.ts:166`) returns `{files, raporto, exportable, issues, palettes}`, with no graph. `derivationBasis` (L139) gives `{modelo, palettes: DerivedPalettes, gestalt: Gestalt, …}`. `DerivedPalettes.sources[palette].origin ∈ leitfarbe\|zusatzfarbe\|default\|toenung\|zweitfarbe` (`palettes.ts:86`). `Gestalt.main`/`.dark` are **`Map`s** (`gestalt.ts:264`), so sort them before anything reaches the output. `packageDocuments`, `composeFiles` and `packageLabel` are exported. |
| R-2 | **holds** | Only `packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json` exists (`name: "provo"`, with `regler`, `form`, `raum`, `ikono`, `festgelegt`). `aspekto-ekzemplo/` has `fundamento.config.json` + package dir, no Agordo. `packages/aspekto-komuna/deveno.json` exists, and `Modelo.deveno` carries it (`modelo/src/contracts/modelo.ts:254`). **New:** `provo` is not a Metiejo brand. Showing `/marko/provo/grafeo` needs a workdir with `provo/agordo.json` copied from the fixture (see QA and T5). |
| R-3 | **holds, contract refined** | `Bases = {structure, calibration, gestalt}` (`metiejo/src/vorschau.ts:33`). But `loadBases()` uses `readStructure()`, whose default is **komuna-0-2**, not today's komuna (`agordilo/src/node/structure.ts:95`). So `Bases` cannot carry the package for P-1. **Refinement D-7:** `grafeoDePaket(label: string, files: ModeloFiles): Grafeo`. The file reading sits in a node-edge module `grafeo-fontoj.ts` (see 2.2). `grafeoDe(agordo, bases)` keeps the tech-spec signature. |
| R-4 | holds | The lockfile changes via `pnpm install` only. |
| R-5 | **holds** | `packages/modelo/src/ci/workflow.test.ts:720-738`: every package with `scripts.test` (except eroj, projekcioj) must equal `UNIT_PACKAGES` (L240). So: no `test` script in nodredaktilo. |
| R-6 | **holds, with nuance** | Published packages (`private` not true): agordilo, aspekto-komuna, aspekto-komuna-0-2, cli, mcp, modelo, vortaro. `@fundamento/eroj` is itself **private**. The React path is cli → metiejo (private) → eroj (private), with optional peer `react`, `react-dom`. ekranoj and nordstelo also reach eroj, but both are private. Expected constant: `{"@fundamento/cli": ["react", "react-dom"]}`. |
| R-7 | **holds** | `erojDist` (`servilo.ts:436`), `GET /eroj/*` (`servilo.ts:1495`), screens via `screenDocument`/`previewDocument` (`html.ts:857/890`) with `<script type="module" src="/eroj/define.js">`. **New:** the generic route regex `^\/marko\/([a-z0-9-]+)\/([a-z]+)(\.css)?$` (`servilo.ts:2547`) would match `/marko/x/grafeo` and answer 404 ("Nicht gefunden"). The Spec 047 route block **must come before it** (see 2.4). |
| R-8 | **holds** | `packages/modelo/src/ci/knapp-vitest.test.ts:159`. No `vitest.config.ts` in nodredaktilo. |
| D-1 | **new: drift** | `konzepte/node-editor-konzept.md` and `research/node-editor-benchmark-2026-11-10.md` are **not in the repo**. They are at `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/konzepte/node-editor-konzept.md` and `…/.fundamento/research/node-editor-benchmark-2026-11-10.md`. They are not copied in, because they are outside "Frei" and the spec dir must end with exactly 5 files. `plan.md` and the bericht cite the absolute paths. |
| D-2 | **new: contract change** | P-4 says nodredaktilo imports `@fundamento/metiejo/grafeo` through a package `exports` entry. That needs nodredaktilo → metiejo, while P-5 needs metiejo → nodredaktilo (devDep, for build order and `import.meta.resolve`). Turborepo rejects cyclic package graphs, devDependencies included. **Resolution:** the browser-safe view logic is in `packages/metiejo/src/grafeo-sicht.ts`, which has **no imports at all**. nodredaktilo reaches it with a Vite `resolve.alias` plus a tsconfig `paths` entry, both mapping `@fundamento/metiejo/grafeo` → `../metiejo/src/grafeo-sicht.ts`. nodredaktilo does **not** declare metiejo. **No `exports["./grafeo"]` is added**, so the P-6 change to `packages/metiejo/package.json` is the single `devDependencies` line. |
| D-3 | new | The `--xy-*` namespace scan (see B-2). |
| D-4 | **new: P-5.4 exceptions** | `packages/eroj/src/react.ts` has no direct `react` import. It re-exports `./generated/react.js`, which is gitignored and generated. The other React mentions are **template strings** in `packages/projekcioj/src/celoj/react/react.ts` and `packages/projekcioj/src/celoj/make-kit/make-kit.ts`. The exception list is exactly these three paths. The scanner skips `node_modules/`, `dist/` and `generated/`. |
| D-5 | **new: library versions** | The benchmark names `@xyflow/react` 12.3.1. npm on 2026-11-10 shows **12.12.1** (published 2026-11-02, MIT, peer `react >=17`, deps `@xyflow/system 0.0.84`, `zustand ^4`, `classcat`) and `@dagrejs/dagre` **3.1.3** (2026-10-24, MIT, ESM, dep `@dagrejs/graphlib 4.0.6`). Pin them exactly (repo convention: exact dev pins). |
| D-6 | **new: missing text** | The tech spec says 404 should carry the existing message "Marke … nicht gefunden". That text does not exist. The existing `notFound` answers `<p>Nicht gefunden.` (`servilo.ts:1366`). Use `notFound` unchanged. |
| D-8 | **new: query parameter** | Light and dark follow the existing `?scheme=light\|dark` parameter (`kombinationOf`, `studio.ts:110`), default `light`. |
| D-9 | **new: button pattern** | `fm-butono` has no `href`. Navigation uses the existing `data-href` client handler (`html.ts:181`). The Studio header is `studio.ts:1026` (`<span slot="principal">… Speichern</fm-butono></span>`). |
| D-10 | **new: turbo-inputs** | `packages/modelo/src/ci/turbo-inputs.test.ts` ("every file a test reads outside its package is in the hash of its test task") will statically find the new metiejo tests' reads of `packages/*`. They should be covered, because `@fundamento/metiejo#test` → `@fundamento/cli#build` → `^build` reaches every package's build task. **This must be checked**: run that test file alone after T1, T2 and T4. If it lists a `*-047` file, the ticket narrows the read. It never edits `turbo.json` or `turbo-inputs.test.ts`. |
| D-11 | **new: local turbo cache** | The nodredaktilo build hash does not include `packages/metiejo/src/grafeo-sicht.ts`, which is a cross-package source import. After changing that file, rebuild with `pnpm --filter @fundamento/nodredaktilo build` (plain pnpm, no turbo cache) or `pnpm turbo run build --filter=@fundamento/nodredaktilo --force`. CI is not affected: the lockfile change gives a new cache-key prefix. |
| D-12 | **new: Jugxo for A-1** | The concept wants the accessibility exception recorded as a Jugxo. That would mean `packages/modelo/data/jugxoj.json`, which is **taboo**. It is not done; the bericht lists it as an open item for the maintainer. |
| D-13 | **new: metiejo test build** | `packages/metiejo/vitest.config.ts` builds `@fundamento/metiejo...` outside turbo. With the devDep, that now includes nodredaktilo's Vite build. Route tests must **not** depend on it: they use the seams in 2.4. |

### Neue Abhängigkeiten (tech-stack.md: jede neue Abhängigkeit mit Grund)

Alle in `packages/nodredaktilo/package.json`, alle unter `devDependencies`, exakt gepinnt (Repo-Konvention), außer den Repo-Bereichen der letzten drei Zeilen. Das Paket ist `private: true`; Vite bündelt die Laufzeit-Bibliotheken in `dist/leinwand.js`, Node lädt das Bündel nie (P-5). Dazu kommt in `packages/metiejo/package.json` genau eine Zeile `"@fundamento/nodredaktilo": "workspace:*"` unter `devDependencies` (P-6, nur für die Bau-Reihenfolge).

| Name | Version | Feld | Grund |
|---|---|---|---|
| `react` | 19.3.0 | devDependencies | Laufzeit der Insel (B-3), in `leinwand.js` gebündelt |
| `react-dom` | 19.3.0 | devDependencies | Rendert die Insel in `#nr-leinwand`, gebündelt |
| `@types/react` | 19.3.0 | devDependencies | Typen für `tsc` (Lint), nur zur Bauzeit |
| `@types/react-dom` | 19.3.0 | devDependencies | Typen für `tsc` (Lint), nur zur Bauzeit |
| `@xyflow/react` | 12.12.1 | devDependencies | Leinwand: Knoten, Kanten, Zoom, `Controls` (Entscheidung B-1 der Produkt-Spec, MIT; Version D-5) |
| `@dagrejs/dagre` | 3.1.3 | devDependencies | Layout links→rechts mit gemessenen Knotengrößen (Entscheidung B-2, MIT, kein `elkjs`; Version D-5) |
| `vite` | 8.3.0 | devDependencies | Bibliotheks-Build zu genau einer Datei `dist/leinwand.js`, ohne CSS-Datei (B-2 dieses Nachtrags) |
| `@vitejs/plugin-react` | 6.1.1 | devDependencies | JSX-Transformation im Vite-Build |
| `playwright` | 1.63.0 | devDependencies | Skript `bilder` (P-3): Bilder und Messung, lokal, außerhalb des Repos; dieselbe Version wie die übrigen Pakete |
| `typescript` | ^7.0.2 | devDependencies | `tsc --noEmit` im Lint, Repo-Bereich |
| `@types/node` | ^24.13.5 | devDependencies | Typen für `scripts/bilder.ts`, Repo-Bereich |
| `tsx` | ^4.23.15 | devDependencies | Startet `scripts/bilder.ts`, Repo-Bereich |
