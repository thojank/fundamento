# Spec 048 – Technische Spec: Untergruppen je Ero und geerbte Gründe

**Bezug:** `product-spec.md` ist byte-gleich mit `.fundamento/spec048/spec.md` und bleibt maßgeblich. Diese Datei ergänzt sie nur: wo der Code heute steht und wie offene Stellen entschieden sind. Bei Widerspruch gilt die Product-Spec.

## Bestätigte Entscheidungen (2026-11-11)

- **Vorrang bei der Einordnung:** Mechanik wird vor der Rolle geprüft.
- **60er-Regel:** Eine geteilte Gruppe hat entweder nur Untergruppen oder nur Knoten, nie beides.
- **Seitenspalte:** Neue Zeile „Art“. Ein Mockup gibt es nicht, weil die Oberfläche nur aus vorhandenen `fm-*`-Elementen besteht.

## Übernahme in das Repo

- In T1 kopiert der Build die Datei `.fundamento/spec048/spec.md` nach `specs/048-nodredaktilo-grupoj-kialoj/spec.md`. Dabei wird kopiert, nicht neu geschrieben, und `cmp` muss bestehen.
- Nach demselben Muster wie in 047 kommen dazu: `plan.md`, `tasks.md`, `bericht.md` und `luecken.json`. Alle liegen unter `specs/048-nodredaktilo-grupoj-kialoj/`.
- Bilder und `messung.json` werden nur nach `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec048/` geschrieben, nie ins Repo.

## Ist-Zustand (aus dem Code, Stand `main`)

| Stelle | Heute |
|---|---|
| `packages/metiejo/src/grafeo.ts` `AKSOJ`, `SUBGRUPOJ` | 9 Achsen, feste Untergruppen `palette` / `rollen` / `komponenten` |
| `grafeo.ts` `assignGroups` | `ero.*` und `sxablono.*` landen in `<achse>/komponenten`. Die Achse kommt vom ersten Knoten in der Kette, der keine Komponente ist. |
| `grafeo.ts` `groupsOf` | Baut genau zwei Ebenen. `patro` ist immer eine Achse. |
| `packages/metiejo/src/grafeo-sicht.ts` | Ohne jeden Import (D-2). `ancestorsOf` und `sichtbaro` arbeiten schon über beliebig viele Ebenen. `grupojDe` liefert alle Vorfahren. `devenoDe` folgt jeweils dem kleinsten `al`. |
| `Grupo.patro` | Laut Doc-Kommentar „The axis of a level-2 group“; der Kommentar wird verallgemeinert |
| `packages/nodredaktilo/src/flanko.tsx:110` | Zeigt `nodo.kialo`, sonst `fm-insigno intent="warning"` mit „fehlt“ |
| `packages/nodredaktilo/src/nodoj.tsx:69` | Gruppenknoten mit Insigno `Gruppe · <nombro>` |
| `packages/nodredaktilo/scripts/bilder.ts` | `--ziel <dir> [--luecken <file>]`. Schreibt `bilder/` und `messung.json`; Läufe, die hängen, werden als `NICHT_GEMESSEN` notiert |
| 047-Tests (`grafeo-*-047.test.ts`) | Kein Test nennt `…/komponenten` beim Namen. Zu erwarten ist, dass nur Zählungen und Gruppen-Ids der Ero-Tokens nachgezogen werden müssen. |

Messwerte vor dieser Spec (aus `.fundamento/spec047/messung.json`): Die größte Gruppe ist bei allen drei Marken `farbe/komponenten` mit 920 Knoten. Zugeklappt sind 7 bis 8 Knoten sichtbar. Das Aufklappen dauert im Median 1 364 ms (komuna), 1 391 ms (ekzemplo) und 1 463 ms (provo).

## A. Gruppenbildung

### Regel
1. Für Knoten, die keine Komponente sind, bleibt alles wie heute (`GRUPO_TABELO`, längstes Präfix).
2. Bei Komponenten bleibt die Wahl der Achse wie heute. Beginnt die Id mit `ero.<name>.`, wird die Gruppe der untersten Ebene zu `<achse>/komponenten/<name>`. `<name>` ist dabei der zweite Pfadteil.
3. **60er-Regel**, nach Schritt 2 angewendet: Hat eine Gruppe mehr als 60 direkte Knoten, wird sie nach dem nächsten Pfadteil geteilt, der nicht bei allen Knoten gleich ist. Die neuen Gruppen bekommen die Id `<gruppe>/<teil>`, das `etikedo` ist `<teil>` und `patro` ist die alte Gruppe. Das wiederholt sich, bis keine Gruppe mehr als 60 direkte Knoten hat. Die Regel gilt für jede Gruppe, auch für Palette, Rollen, `weitere` und `eingaben`. Eine Liste von Namen gibt es nicht.
4. Nach dem Teilen hat eine Gruppe **entweder** Untergruppen **oder** direkte Knoten, nie beides. So zeigt jedes Aufklappen genau eine Art von Inhalt.

### Was „mehr als 60 Knoten auf einmal“ heißt
Gezählt werden die Kinder, die das Aufklappen einer Gruppe sichtbar macht: ihre direkten Knoten plus ihre direkten Untergruppen. Der Test rechnet für komuna, ekzemplo und provo über alle Gruppen und vergleicht mit 60. Die 60 steht als Konstante im Code (`GRUPPE_MAX = 60`); die Zahl der Gruppen leitet der Test aus den Daten ab und hält sie nicht fest (`testing.md`).

### Determinismus
`grupoj` bleibt sortiert: zuerst nach Achsenreihenfolge, dann als Tiefensuche, darin nach Id. Wird `grafeoDe` zweimal erzeugt, ist das Ergebnis byte-gleich (`serializeGrafeo`). Ein neuer Token `ero.neu.x` erzeugt ohne Codeänderung die Gruppe `…/komponenten/neu`.

## B. `kialoDe` und Knotenart

Beide sind neue reine Funktionen in `grafeo-sicht.ts`. Die Datei bleibt ohne Import, damit der Browser-Bundle sie nutzen kann. Ins `Grafeo` geschrieben wird nichts.

```ts
export type Knotenart = "decido" | "mekaniko" | "transpreno"; // Entscheidung, Mechanik, Übernahme
export function knotenartDe(g: Grafeo, id: string): Knotenart | undefined;
export function kialoDe(g: Grafeo, id: string):
  { fonto: "propra" | "heredita" | "neniu"; de?: string; kialo?: string };
```

### Einordnung (vorläufig, erste Regel, die passt)
1. `speco === "enigo"` → **Entscheidung**
2. `regulo` beginnt mit `paletto` oder `gestalto` → **Mechanik**
3. Der Knoten ist keine Komponente, mindestens ein `ero.*`-Knoten hat eine Ligo auf ihn, und sein eigenes `al` ist ein Paletten-Knoten (Gruppe `*/palette`) oder ein Knoten mit `regulo` `fiksa` → **Entscheidung** (Rolle)
4. sonst → **Übernahme**

Mechanik wird vor der Rolle geprüft. Ein Gestalt-Token, auf den Eroj verweisen, zählt also als Mechanik. Fälle, in denen das falsch einordnet, sammelt der Bericht als Befund. Die Regel wird dafür nicht geändert.

### `kialoDe`
- Ein eigenes `kialo` ergibt `{ fonto: "propra", kialo }`.
- Sonst läuft die Funktion `devenoDe(g, id)` ab dem zweiten Glied ab. Der erste Knoten mit `kialo` ergibt `{ fonto: "heredita", de, kialo }`.
- Sonst ergibt sie `{ fonto: "neniu" }`. Die Kette endet an einer Eingabe oder an einem Knoten ohne ausgehende Ligo. Ein Zyklus ist ausgeschlossen, weil `devenoDe` bei einem schon gesehenen Knoten abbricht.

### Seitenspalte (`flanko.tsx`, Zeile „Begründung“)
| Art | `kialoDe` | Anzeige |
|---|---|---|
| Entscheidung | propra | Grund |
| Entscheidung | sonst | `fm-insigno intent="warning"` „fehlt“ (wie heute) |
| Übernahme | propra | Grund |
| Übernahme | heredita | „geerbt von ‹Knoten›“ als Link (wählt den Knoten wie die Herkunftsliste, mit Attribut `data-nr-geerbt`), darunter der Grund |
| Übernahme | neniu | „kein Grund in der Kette“, neutral (kein Insigno, kein Warnton) |
| Mechanik | – | Nur die Regel, keine Zeile „Begründung“ und kein „fehlt“ |

Neu ist eine Zeile „Art“ mit Entscheidung, Mechanik oder Übernahme (`data-nr-art`). Alle Farben kommen aus vorhandenen `fm-*`-Elementen und Rollen. Es gibt keinen neuen Kern-Token.

### Gruppenknoten
`SichtNodo` bekommt `ohneGrund?: number`. Der Wert zählt transitiv die Entscheidungen, bei denen `kialoDe().fonto !== "propra"`. `nodoj.tsx` zeigt ein zweites Insigno `<n> ohne Grund` (intent `warning`), aber nur bei n > 0.

## Aufklappen auf der Leinwand

- `sichtbaro` und `grupojDe` können schon mehrere Ebenen. Zu ändern sind nur die Doc-Kommentare und der Kommentar an `SichtNodo.grupo` („parent group“).
- Ein Klick in der Herkunftskette ruft wie heute `grupojDe` auf. Damit gehen alle Vorfahren auf, auch die dritte und vierte Ebene. Ein Test prüft das an einem Ero-Token.

## C. Messung

Das Skript `bilder.ts` wird erweitert; der Aufruf bleibt gleich. Pro Marke kommen diese Felder in `messung.json`:

- `arten`: `{ decido, mekaniko, transpreno }`
- `ohneGrund` (Entscheidungen ohne eigenen Grund), `geerbt` (Übernahmen mit `heredita`), `keinGrundInKette`
- `vorher047`: Zahl der Knoten mit „fehlt“, fest übernommen als 1 852 / 1 842 / 920 nach Marke, wie in der Spec
- `groessteGruppeJeEbene`: je Ebene 1 bis 4 die Gruppe mit den meisten sichtbaren Kindern
- `aufklappenMsJeEbene`: Median und Maximum aus 5 Läufen

Bilder je Marke: `zu.png`, `farbe-komponenten.png`, `ero-offen-geerbt.png` (eine Ero-Untergruppe ist offen, die Seitenspalte zeigt eine Übernahme mit „geerbt von“).

`luecken.json` im Repo hat die Form `{ <marke>: { <gruppe>: [id…] } }` und enthält nur Entscheidungen ohne Grund, sortiert.

## Tickets

| T | Inhalt | Dateien |
|---|---|---|
| T1 | Spec übernehmen; dritte Ebene und 60er-Regel; Tests zuerst rot, dann grün (`grafeo-grupoj-048.test.ts`) | `grafeo.ts`, `grafeo-sicht.ts` (Kommentare) |
| T2 | `knotenartDe`, `kialoDe`, `ohneGrund` in `sichtbaro`; Tests zuerst rot, dann grün (`grafeo-kialo-048.test.ts`) | `grafeo-sicht.ts` |
| T3 | Leinwand: Seitenspalte, Insigno an Gruppen, Aufklappen über die Herkunftskette | `nodredaktilo/src/flanko.tsx`, `nodoj.tsx`, `kanvaso.tsx` |
| T4 | Messung, Bilder, `luecken.json`, Diff-Suche nach Tabuwörtern und -pfaden | `nodredaktilo/scripts/bilder.ts`, `specs/048-…/` |
| T5 | Ein PR, ein Push, ein `workflow_dispatch`, Bericht | `specs/048-…/bericht.md` |

Alles läuft in einem Strang, hintereinander. Jedes Ticket bleibt in den freien Pfaden der Product-Spec.

## Risiken

- **Eine Untergruppe hat über 60 Knoten,** obwohl alle Knoten denselben nächsten Pfadteil tragen. Dann teilt die Regel auf dem ersten Pfadteil, der sich unterscheidet. Gibt es keinen, ist das ein Befund, und der Test wird rot. Die Grenze wird nicht angehoben.
- **Aufklapp-Zeit:** Der Bericht vergleicht sie mit den 047-Werten. Das ist eine Messung, kein Budget.
- **Wackel-Tests:** höchstens 30 lokale Wiederholungen. `zweitfarbe-036` und `modelo turbo-inputs` gelten als bekannt rot und fremd.

## Nachtrag NE-1b (Umsetzung)

Stand 2026-11-11, T1. Quelle: Implementation Spec NE-1b (Abschnitt 0), geprüft gegen `origin/main` @ `946248b9`. Der Text oberhalb dieses Nachtrags ist die byte-gleiche Kopie der technischen Spec (die ersten 9 653 Byte, `cmp` Exit 0) und bleibt unverändert.

### Ist-Zustand: Abweichungen vom Code

| Stelle | Was der Code sagt (Datei:Zeile) | Folge |
|---|---|---|
| `assignGroups` | `packages/metiejo/src/grafeo.ts:425-451` behandelt `ero.` **und** `sxablono.` als Komponenten (`KOMPONENTOJ`, `:117`). Eine Komponente, deren Kette keinen Nicht-Komponenten-Knoten erreicht, landet in `weitere` (`:447-449`; komuna: 8 `ero.*`-Tokens). | D-1, D-2 |
| `groupsOf` | `grafeo.ts:454-481`: genau zwei Ebenen, Untergruppen nach Id sortiert, Achsen mit Untergruppen bekommen `nodoj: []`. | wird zur Tiefensuche über beliebig viele Ebenen |
| `grafeo-sicht.ts` | Ohne Import (`:1-4`); `ancestorsOf` `:76`, `sichtbaro` `:94`, `grupojDe` `:164` können jede Tiefe. `devenoDe` `:189` baut `outgoing(g)` bei jedem Aufruf neu (`:192`). | T1 ändert nur Kommentare (`:13`, `:34`, `:45`, `:52`, `:86-93`); T2 beachtet die Kosten von `devenoDe` |
| `nodredaktilo/scripts/bilder.ts` | `luecken()` `:113-120` zählt abgeleitete Knoten ohne Kialo; `groessteGruppe()` `:123-138` nimmt die Ebene-2-Gruppe mit den meisten direkten Knoten; Bildnamen `{marke}-{hell,dunkel,offen}.png` (`:236-305`). | T4 stellt auf „Entscheidungen ohne Grund“, „je Ebene“ und die neuen Bildnamen um |
| 047-Tests | `grafeo-neu-047.test.ts:39-41` erwartet `color.zzzprobo` in `farbe/rollen`; `farbe/rollen` hat 88 Knoten, die 60er-Regel teilt sie. `grafeo-047.test.ts:256-264` vergleicht die genaue `sichtbaro`-Ausgabe. `grafeo-047.test.ts:136-151` verbietet Knoten in einer Elterngruppe. `grafeo-047.test.ts:178-208` prüft die Gruppenreihenfolge lexikografisch. | D-6 (eine Änderung erwartet), D-3, D-1; die Tiefensuche mit Id-sortierten Geschwistern ist gleich der lexikografischen Reihenfolge, solange kein Pfadteil ein Zeichen unter `/` enthält (heute keins) |
| „fehlt“ vorher | Aus `specs/047-nodredaktilo-lego/luecken.json` gezählt: provo 1 852, ekzemplo 1 842, komuna 920. | Zuordnung für `vorher047` |

### Weitere Befunde

- **F-1** `grafeoDePaket` (`grafeo.ts:490-498`) übergibt keinen `mekanismo`: komuna und ekzemplo haben nur `alias` und `fiksa`, also 0 Mechanik-Knoten; ihre Palettenstufen sind feste Werte und zählen nach Regel 1 als Entscheidung. Ein Befund für den Bericht, keine Codeänderung.
- **F-2** Nach T1 sind Palettengruppen geteilt (`farbe/palette/<name>`, `schrift/palette/<teil>`): Regel 3 kann nicht mehr auf das Suffix `*/palette` prüfen (D-4).
- **F-3** Ein Knoten kann mehrere ausgehende Ligoj haben; „sein eigenes `al`“ ist das nächste Glied der Kette (D-5).
- **F-5** `packages/metiejo/vitest.config.ts:9-14` baut außerhalb von turbo erst die Abhängigkeiten; der erste lokale Lauf dauert länger. Erwartet, keine Grenze.
- **F-6** Der turbo-Hash von nodredaktilo schließt `metiejo/src/grafeo-sicht.ts` nicht ein: nach einer Änderung dort `pnpm --filter @fundamento/nodredaktilo build` ohne Cache.
- **F-7** `pnpm check:privat` liest nur `git ls-files`: nach dem Commit laufen lassen; Commit-Texte und PR-Text getrennt prüfen.
- **F-8** CI läuft bei `pull_request` von selbst; ein Push auf den Branch startet nichts. T5 löst genau einen `workflow_dispatch` aus und wertet diesen Lauf aus.

### Entscheidungen

- **D-1** Komponenten-Untergruppen `<achse>/komponenten/<zweiter Pfadteil>` gelten für `ero.*` **und** `sxablono.*` (beide Präfixe von `KOMPONENTOJ`). Sonst hätte z. B. `raum/komponenten` Ero-Untergruppen und direkte Sxablono-Knoten (verletzt „nie beides“). Teilen sich künftig ein Ero und ein Sxablono den Namen, liegen beide in einer Untergruppe; die 60er-Regel teilt sie bei Bedarf.
- **D-2** Achsen ohne Untergruppen (`eingaben`, `weitere`) bekommen keine Ebene `komponenten`. Komponenten-Tokens in `weitere` bleiben direkte Mitglieder; die 60er-Regel gilt auch dort.
- **D-3** `ohneGrund` ist ein Opt-in: `sichtbaro(g, malfermitaj, opcioj?: { ohneGrund?: boolean })`. Ohne Option ist die Ausgabe byte-gleich mit 047; die Leinwand übergibt die Option.
- **D-4** „Paletten-Knoten“ = das zweite Segment seiner Gruppen-Id ist `palette` (`<achse>/palette` oder ein Nachfahre davon).
- **D-5** „Eigenes `al`“ in Regel 3 = `devenoDe(g, id)[1]` (kleinstes `al`), wie in `assignGroups` und `kialoDe`.
- **D-6** 047-Tests werden nur geändert, wo die neue Ebene es erzwingt (erwartet: `grafeo-neu-047.test.ts:39-41`). Jede Änderung steht mit Datei:Zeile, vorher/nachher und Grund in `tasks.md` und im PR-Text.
- **D-7** Bericht und der eine Push (Muster A-2 aus 047): T4 committet `bericht.md` mit Platzhalter in Abschnitt 1; T5 füllt ihn und committet nur lokal, trägt die Tabelle „CI je Job“ mit `gh pr edit --body-file -` in den PR-Text ein (kein Push) und nennt es im Abschlussbericht.
- **D-8** Die Anzeigeentscheidung ist eine reine Funktion (`begruendungDe`), damit „Mechanik zeigt kein ‚fehlt‘“ in metiejo testbar ist; nodredaktilo hat absichtlich keine Tests (047 P-4).
- **A-1** T4 lässt zusätzlich `pnpm check:vortaro-lint`, `pnpm check:clean-room` und `pnpm check:privat` je einmal laufen (nur lesende Scans).

### Abhängigkeiten

Keine neue Abhängigkeit: `pnpm-lock.yaml`, alle Root-Dateien und alle `package.json` bleiben unverändert.
