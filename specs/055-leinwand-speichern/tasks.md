# Spec 055 – Aufgaben (MP-1b: Leinwand ohne Rahmen, Neutral frei, Speichern)

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) (technische Spec, danach Abschnitt 0 des Implementierungsplans und die Verfeinerungen aus T1) · **Basis:** `main` `642ab220` · **Branch:** `261115-spec055-markenprozess-konzept--3a385e`

Acht Tickets, ein Strang (Spec: „höchstens 8 Tickets, ein PR“). Kein Ticket pusht, öffnet einen PR oder startet einen `workflow_dispatch`. Kein Ticket committet, solange ein anderes läuft (D-20). Jedes Ticket trägt seine Punkte nur in **seinen eigenen Abschnitt** unten ein („im Einzelnen“, „Geänderte ältere Tests“, „Für den PR-Text“, „Befunde“); LNS-4.1 fasst sie zusammen.

| Ticket | Spec | Inhalt | Hängt ab von | Stand |
|---|---|---|---|---|
| LNS-1.1 | T1 + T2 (Daten) | Leinwand ohne Rahmen: Anordnung, sieben Farbknoten, runde Kanten auf Spuren, Verträge | – | erledigt |
| LNS-1.2 | T3 (Modelo/agordilo/Schreibweg) | `neutral.farbe`: Schema, Ableitung, Schreibweg | – | erledigt |
| LNS-1.3 | T6 | Markenliste auf der Startseite | – | offen |
| LNS-2.1 | T2 (UI) + T3 (Leinwand) | Farbknoten: „abgeleitet / von Hand / zurück zur Ableitung“, Kante und eigene Farbe für Neutral | 1.1, 1.2 | offen |
| LNS-2.2 | T4 | Leinwand-Zustand: Datei, Schreiben, Laden, „Anordnung zurücksetzen“ | 1.1, 1.3 | offen |
| LNS-3.1 | T5 | Benannte Stände: speichern, Liste, öffnen mit Sicherung | 2.2 | offen |
| LNS-4.1 | T7 | Tests gesamt, eroj in Chromium, Bilder, Bericht-Entwurf | 2.1, 3.1 | offen |
| LNS-5.1 | T8 | PR, ein Push, ein Dispatch, Bericht (nach QA, Orchestrator) | 4.1 | offen |

## Ausgangsmaß Bündel

Gebaut am unberührten Stand `642ab2202a021f5f7deb867c0a7454f519982ecb` (`git status --short` leer vor und nach dem Bau, vor jeder Änderung an `nodredaktilo`), `pnpm --filter @fundamento/nodredaktilo build` (Vite 8.3.0), 2026-11-15 18:22 UTC:

| Datei | roh | gzip (Stufe 6, `gzip -6 -c`) | gzip `-9` | Vite-Anzeige |
|---|---|---|---|---|
| `packages/nodredaktilo/dist/leinwand.js` | 728 751 Byte | 192 071 Byte | 190 471 Byte | 728.75 kB, gzip 193.39 kB |

## Geänderte ältere Tests

## Für den PR-Text

## Befunde

---

## LNS-1.1 (T1 + T2 Daten): Leinwand ohne Rahmen, Anordnung, sieben Farbknoten, runde Kanten, Verträge

### LNS-1.1 im Einzelnen

- [x] Spec-Ordner zuerst. `spec.md` ist ein `cp` von `user-provided-product-spec-leinwand-neutral-speichern.md`: `cmp` Exit 0, SHA-256 `9d4bb06c8a8235502598ed87c34ec4d0a4bcddbb287be27debf53fa727e9a2f3`. `plan.md`: die ersten 20 693 Byte sind byte-gleich mit der technischen Spec (`cmp -n 20693` endet nur am Ende der kürzeren Datei, SHA-256 des Präfixes `8244f2959e8fccdc590ed1f9f9ed0fe95695f0929284a001ff9936d33af70b3e`). Danach folgt der „Nachtrag“ mit §0 des Implementierungsplans wörtlich (nur die Überschriften eine Ebene tiefer) und den Verfeinerungen V-1 bis V-10.
- [x] Ausgangsmaß des Bündels vor jeder Änderung an `nodredaktilo` (oben). Danach (Stand LNS-1.1): **725 669 Byte roh, 191 650 Byte gzip -6** (−3 082 / −421 Byte, `fazo.tsx` und der Sitzungsweg der Funktionsfarben sind weg).
- [x] Rote Tests zuerst: `grafeo-anordnung-055.test.ts` (11 Tests) und `grafeo-funkcioj-055.test.ts` (11 Tests). Im ersten Lauf waren 20 rot, und zwar aus dem erwarteten Grund (`ARANGXO_055`, `altecoDe`, `spuroX` usw. fehlten; „no colour node success“). 2 waren grün: „kablojDe: a derived node at its own row changes nothing“ und „wirksamerAgordo: a derived source of another row counts as null“, denn ohne Knoten gilt ohnehin `null`.
- [x] **Fehler eingepflanzt** für die zwei Tests, die zuerst grün waren, jeweils einer, dann zurückgesetzt und mit `cmp` gegen die Sicherung geprüft (Exit 0):
  - (a) `kablojDe`: `vorgabe = byId.has(farbo-<rolo>) ? rolo : null` (Vorhandensein statt Wert) → rot: „derived node at its own row“ und „derived node as the source of another row“.
  - (b) `wirksamerAgordo`: `wertDe(…) ?? "#000000"` (eine abgeleitete Quelle gilt als Farbe) → rot: „wirksamerAgordo: a derived source…“.
  - Lauf: 8 bestanden, 3 rot. Nach dem Zurücksetzen: 11 bestanden.
- [x] Umsetzung Daten (`grafeo-gestalten-sicht.ts`, `grafeo-gestalten.ts`):
  - Die Phasen-Knoten sind weg, ebenso `FAZOJ`, `ARANGXO_054` und `FazoPlatz`.
  - `ARANGXO_055` mit den Höchsthöhen, `altecoDe`, `poziciojKun` absolut, `FARBO_KOLUMNO`, `spuroX` (D-4).
  - D-18: `NEUTRAL_FARBO_ENIR`, `FESTA_TENILO`, `tenilojDe`, `BildoLigo.fest`.
  - `FarboStato` hat jetzt `"abgeleitet"`, dazu `senValora` (D-17).
  - Die Typen aus §2.1 (`LeinwandStatoKnoto`, `LeinwandStato`, `LeinwandAntwort`, `StandZeile`).
  - `farbojDe` erzeugt immer die vier Funktionsfarben: „von Hand“ mit Wert, sonst „abgeleitet“ mit `hex` = heller Wert von `REFERENCE_STEPS[CALIBRATED_RAMP[p]]`, und `""` ohne Ableitung.
  - `vicojDe` setzt keine Basis für eine abgeleitete Quelle. `ligojDe` ist unverändert und gibt damit alle sieben.
- [x] Umsetzung Leinwand (`nodredaktilo`):
  - `nodoj/fazo.tsx` ist gelöscht, mit seiner Registrierung. Kein `parentId` mehr, jeder Knoten steht absolut.
  - `kanto.tsx`: `getSmoothStepPath` mit `borderRadius` aus `--fm-radius-role-surface` (einmal je Mount gelesen, `radiusoDe` in `kanvaso.tsx`) und `centerX = spuroX(…)`. Das Licht nutzt denselben Pfad. Ohne „×“ bei `fest`.
  - `kanvaso.tsx`: Kanten mit `fest: true` sind `selectable/deletable/reconnectable: false` und hängen an den Griffen aus `tenilojDe`. `onBeforeDelete` lässt sie stehen.
  - Der Sitzungsweg der Funktionsfarben ist entfernt (`sesioFarbo`, `FUNKCIO_BASIS`, Zweig „anlegen“, `sesioLigoj` für Farben, Aufräum-Effekt).
  - `menuo.tsx`: wählbar sind nur noch `setzen` und `weitere`.
  - `anschluss.tsx`: `rando`/`tenilo` für die festen Griffe (die Griffe selbst setzt LNS-2.1). Eine feste Kante wird nie am Ende aufgenommen.
  - `nodoj/farbo.tsx`: nur `MARKOJ.abgeleitet = "abgeleitet"`, damit es übersetzt.
- [x] `scripts/bilder-054.ts` gelöscht (D-9).
- [x] Tests: `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test grafeo-anordnung-055 grafeo-funkcioj-055 grafeo-gestalten-054 grafeo-kabloj-054 grafeo-literale-054 grafeo-route-054 grafeo-paletro-054 grafeo-wirksam-054 grafeo-urteil-054 grafeo-route-047 grafeo-047 grafeo-grupoj-048` → **138 bestanden, 0 rot** (92 s).
- [x] Lint und Bau:
  - `pnpm --filter @fundamento/nodredaktilo lint` grün, `build` grün.
  - `tsc --noEmit` in metiejo grün, `biome check` über alle Dateien dieses Tickets grün.
  - `pnpm --filter @fundamento/metiejo lint` meldet nur noch Fremdes: `src/komponentoj.ts:42` (alte Warnung) und die Formatierung von `src/neutral-skribo-055.test.ts` (Zone LNS-1.2, nicht angefasst).
- [x] Browser-Rauchtest in Chromium (Wegwerf-Skript außerhalb des Repos, gebaute CLI, leerer Arbeitsordner, 2100×1250, neue Marke `lumeto`):
  - Keine Rahmen, kein „kommt später“, sieben Farbknoten.
  - Die Funktionsfarben tragen „abgeleitet“.
  - 16 Kanten. 15 enthalten `Q` (runde Ecken). Die 16. (`paletro.el>vorschau-hell.en`, `M1021 79L1131 79`) ist gerade, weil beide Griffe auf gleicher Höhe liegen. Sie hat keine Ecke.
  - Gerenderte Knotenboxen paarweise ohne Schnitt. Kein abgetasteter Kantenpunkt liegt in einer fremden Box.
  - Ziehen der Palette bewegt nur die Palette. Kein Seiten- und kein Konsolenfehler.
  - Radius-Token im Browser: `8px`.
- [x] Gemessene Höhen beim Start (`offsetHeight`, Flusseinheiten), gegen die Höchsthöhe aus D-2:

  | Knoten | gemessen | Höchsthöhe | Ergebnis |
  |---|---|---|---|
  | Marke | 64 | 72 | eingehalten |
  | Primär | 170 | 190 | eingehalten |
  | Akzent | 172 | 190 | eingehalten |
  | Neutral | 192 | 300 | eingehalten |
  | Erfolg, Warnung, Fehler, Hinweis | je **98** | **96** | **überschritten**, siehe Befund B-55-1 |
  | Palette | 470 | 520 | eingehalten |
  | Vorschau hell, dunkel | 466 | 480 | eingehalten |

- [x] Wortsuche: das Wort aus R-12, der Name des privaten Schriften-Repos und der Erweiterungsschlüssel, zur Laufzeit aus `scripts/neutrale-namen/rules.mjs` `oldNames()` zusammengesetzt. Durchsucht wurden alle hinzugefügten Zeilen der geänderten Dateien (`git diff -U0 642ab220`) und die neuen Dateien (1 651 Zeilen). Ergebnis **0 / 0 / 0**.

### LNS-1.1: geänderte ältere Tests

Die Zeilen beziehen sich auf `642ab220`, jeweils vorher → nachher und Grund.

- `grafeo-gestalten-054.test.ts`:
  - `:20, :27, :29` (Importe): `ARANGXO_054`, `type FazoId`, `largxoDe` → `ARANGXO_055`. Grund: Die alten Namen gibt es nicht mehr.
  - `:138–160`: „has six phases, 1/2/3/6 empty, listed before every other node“ → „has no phase nodes any more (Spec 055 T1)“. Grund: Die Rahmen sind weg (T1).
  - `:162–174`: „gives every other node a phase that exists“ → „gives every node a purpose tag of phase 4 or 5“. Grund: Es gibt keine Phasen-Knoten mehr. `fazo` ist nur noch eine Kennung.
  - `:178–180`: `flatMap(n.speco === "fazo" ? [] : …)` → `map(…)`. Grund: Der Vergleich mit `"fazo"` übersetzt nicht mehr, denn `speco` kennt `fazo` nicht.
  - `:229–231`: „keine Funktionsfarbe“ (`toEqual([])`) → vier Knoten mit `stato: "abgeleitet"`. Grund: T2.
  - `:258`: `farbo-success` fehlt (`toBe(false)`) → `farbo(bildo, "success").stato` ist `"abgeleitet"`. Grund: T2.
  - `:419`: `kolora = … fonto.stato !== "leer"` → zusätzlich `!== "abgeleitet"`. Grund: D-17.
  - `:453`: `leer?.fonto` `toBeNull()` → `toBe("warning")`. Die Prüfung, dass `basis` fehlt, bleibt. Grund: D-17, der Knoten ist da, gibt aber keine Farbe.
  - `:549–603` (describe „ARANGXO_054 – fixed places from the mockup“): gelöscht, an seiner Stelle ein Kommentar. Grund: Die Phasen sind weg. Ersatz ist `grafeo-anordnung-055`.
  - `:604–700` (describe „poziciojKun“): auf absolute Plätze aus `ARANGXO_055` umgestellt.
    - „fills the Funktionsfarben slots“ → feste Plätze in Reihenfolge; Hinweis allein behält seinen Platz.
    - „drops entries“: `farbo-warning` → `fazo-4` als verschwundener Knoten.
    - „lets the nodes follow a moved phase“: gelöscht.
    - „further previews“ → neue Slots (`x`, `y + k·dy`).
    - Grund: Platzregel ohne Phasen (T1, §2.2).
- `grafeo-kabloj-054.test.ts`:
  - `:195–227` („drops edges at nodes that no longer exist“): Statt `bildoLeer` gilt ein Bildo ohne `farbo-warning` bzw. ohne `farbo-success` (`bildoOhne`). Grund: Die Funktionsfarben sind jetzt immer im Bildo. Die Regel selbst bleibt gleich geprüft.
  - `:467–477`: „four Funktionsfarben to create“ mit `anlegen` → „on the canvas“ mit `da`. Grund: T2.
  - `:486`: Erfolg `"anlegen"` → `"da"`. Grund: T2.
  - `:503–509`: wählbare Einträge (Akzent und vier Funktionsfarben) → nur `["Farbe · Akzent", "farbo-akzent"]`. Grund: T2.
- `grafeo-literale-054.test.ts:24`: Eintrag `"nodoj/fazo.tsx"` aus `SHELL` entfernt. Grund: Die Datei ist gelöscht (D-9).
- `grafeo-wirksam-054.test.ts:193`: `vicoDe(ohne, "warning")?.fonto` `toBe(null)` → `toBe("warning")`, dazu `basis` `toBeUndefined()`. Grund: D-17.

### LNS-1.1: für den PR-Text

- Leinwand ohne Rahmen (T1):
  - `nodoj/fazo.tsx` gelöscht. `BildoFazo`-Knoten, `FAZOJ` und `ARANGXO_054` sind weg.
  - `ARANGXO_055` (absolute Plätze und Höchsthöhen), Spuren der Kanten (`spuroX`), runde Ecken mit `--fm-radius-role-surface`.
  - Kein neuer Token, keine neue Abhängigkeit.
- Funktionsfarben von Anfang an (T2, Daten): `FarboStato` `"abgeleitet"`. „+ Knoten“ zeigt sie „auf der Leinwand“. Der Sitzungsweg „anlegen“ ist entfernt.
- Verträge für spätere Tickets:
  - `BildoLigo.fest` und die Griffe aus D-18 (`NEUTRAL_FARBO_ENIR`, `FESTA_TENILO`, `tenilojDe`, `Anschluss` `rando`/`tenilo`).
  - `LeinwandStatoKnoto`, `LeinwandStato`, `LeinwandAntwort`, `StandZeile`.
- Gelöschte Dateien:
  - `packages/nodredaktilo/src/gestalten/nodoj/fazo.tsx`.
  - `packages/nodredaktilo/scripts/bilder-054.ts` (D-9). Es zieht Phasen und läuft gegen die Leinwand aus 055 nicht mehr. `bilder-055.ts` (LNS-4.1) ersetzt es.
- Geänderte ältere Tests: siehe „LNS-1.1: geänderte ältere Tests“.
- Bündel: vorher 728 751 / 192 071 Byte, nach LNS-1.1 725 669 / 191 650 Byte (roh / gzip -6).

### LNS-1.1: Befunde

- **B-55-1 (Höhe der Funktionsfarben):** Die kompakten Knoten Erfolg, Warnung, Fehler und Hinweis sind beim Start **98** Flusseinheiten hoch. Die Höchsthöhe nach D-2 ist **96**. Gemessen wurde der unveränderte Körper aus 054, `nodoj/farbo.tsx`.
  - Es entsteht keine Überdeckung. Der Abstand zwischen zwei Funktionsfarben sinkt von 18 auf 16.
  - Nach D-2 wird der Knoten angepasst oder der Abstand vergrößert. Die Höchsthöhe sinkt nie.
  - Der Körper gehört LNS-2.1, die Koordinaten sind bindend. Darum ist hier nichts geändert. Aufgabe für LNS-2.1, geprüft in LNS-4.1 (D-19).
- **B-55-2 (Radius-Token):** `--fm-radius-role-surface` ist in der neutralen Belegung **8 px**, nicht 12 px wie in D-5 vermutet. Er ist größer als 0, und die Ecken sind deutlich rund (Bild im Rauchtest). Die Knotenrahmen nutzen `--fm-radius-medium`.
- **B-55-3 (gerade Kante):** Die Kante Palette → Vorschau hell ist in der Startanordnung gerade (gleiche Höhe der Griffe) und hat darum kein `Q`. Die Prüfung „`Q`/`A` im `d`“ in `bilder-055.ts` (D-19) muss gerade Kanten ohne Knick ausnehmen oder nur Kanten mit Knick prüfen.
- **B-55-4 (Test außerhalb der Zone rot):** `grafeo-skribo-054.test.ts:525` erwartet, dass `farbo-warning` nach `{farbe:{rolle:"warning",wert:null}}` fehlt. Seit T2 bleibt der Knoten, abgeleitet.
  - Erzwungene Änderung, **nicht angewendet** (die Datei liegt nicht in der Zone von LNS-1.1):
    - vorher: `expect((await bildoDe("funkcio")).nodoj.some((n) => n.id === "farbo-warning")).toBe(false);`
    - nachher: `expect(((await bildoDe("funkcio")).nodoj.find((n) => n.id === "farbo-warning") as BildoFarbo).stato).toBe("abgeleitet");`
  - Grund: T2. Der Orchestrator entscheidet, wer die Zeile ändert.
- **B-55-5 (Übergangstyp):** `BildoFazo` ist übergangsweise `never`. Grund: `nodredaktilo/src/gestalten/kunteksto.ts:10, :42, :48` (`FazoFlowNodo`) nennt den Typ noch, und die Datei liegt in der Zone von LNS-2.2. LNS-2.2 entfernt `BildoFazo` und `FazoFlowNodo` aus `kunteksto.ts`. Danach entfällt der Typ in `grafeo-gestalten-sicht.ts`.
- **B-55-6 (tote Rolle):** `nodredaktilo/src/gestalten/roloj.ts:22` (`ROLOJ.fazo`) und `:85` (`--xy-node-group-background-color`) dienten nur den Rahmen und werden nicht mehr gebraucht. Die Datei liegt nicht in der Zone, darum bleiben die Zeilen.
- **B-55-7 (Rest in `farbo.tsx`):** Die Funktionsfarben zeigen beim Start noch `#RRGGBB` als Platzhalter statt des abgeleiteten Hex-Werts. „↺“ ruft noch `forigi`/`skribiWert(null)` aus 054. Das ist der Körper von LNS-2.1 (Platzhalter, „zurück zur Ableitung“, keine Entfernung).

## LNS-1.2 (T3): `neutral.farbe` – Schema, Ableitung, Schreibweg

### LNS-1.2 im Einzelnen

- [x] **Prüfsummen zuerst (Abnahme 4):** Vor jeder Änderung (Quellstand = `642ab220`, Baum sauber für `agordilo`/`modelo`) SHA-256 von `derivation.palettes` (JSON) und vom ganzen Paket (`deriveAspekto(...).files`, Pfad + Bytes, Raporto eingeschlossen) gerechnet und festgeschrieben:
  - `packages/agordilo/src/neutralfarbe-055.test.ts` (`PINNED_642AB220`): `modelo/test/fixtures/valid/{aspekto-provo, aspekto-provo-kompakta, aspekto-dukolora}/agordo.json` (die eingebetteten Agordoj in `…/<name>/<name>/aspekto.json` sind gleich, eigener Test), `agordilo/fixtures/stufe1-provo.json#/agordo`.
  - `packages/metiejo/src/neutral-skribo-055.test.ts` (`PINNED_642AB220`): `startAgordo("provo", "leer"|"komuna"|"komuna-0-2")` und `nodredaktilo/belegung/leinwand.agordo.json`. Abweichung vom Plan: diese vier stehen in metiejo, nicht in agordilo. Grund: `startAgordo` liegt in metiejo, und der Test-Hash von `agordilo#test` deckt `packages/nodredaktilo/**` nicht (Spec 040 T-5, `turbo-inputs.test.ts`), der von `metiejo#test` schon (devDependency).
  - Unter `packages/modelo/data/**` liegt kein `aspekto.json` mit Agordo, und `packages/aspekto-komuna*/aspekto.json` tragen keinen Agordo (geprüft): dort gibt es nichts festzuschreiben.
- [x] **Schema:** genau `Agordo.properties.neutral.properties.farbe: { "$ref": "#/$defs/AgordoColor" }`. `pnpm --filter @fundamento/modelo generate:types` schreibt eine Zeile in `src/generated/modelo-schema.ts` (`farbe?: AgordoColor;`); `config-schema.ts` byte-gleich; `--check` sauber. Test: SHA-256 des Schemas ohne `neutral.properties.farbe` = SHA-256 von `642ab220` (`bfe6c747…`).
- [x] **Ableitung** (`agordilo/src/palettes.ts`): `origin` um `"neutralfarbe"` erweitert. Neue Funktion `neutralToenung(agordo)` = `toenung ?? (farbe ? 1 : 0)`. `paletteSources`: ohne `farbe` exakt der alte Ausdruck (`(toenung ?? 0) · lead.c · NEUTRAL_SHARE`, `origin: "toenung"`), mit `farbe` `{ hue: own.h, chroma: neutralToenung · own.c, origin: "neutralfarbe" }` (ohne `NEUTRAL_SHARE`).
- [x] **explain** (`agordilo/src/explain.ts`, D-6): beide Suchen (`#rampSuggestion` ≈ :256 und `#tintSuggestion` ≈ :351) bauen `neutral: { ...agordo.neutral, toenung }`; die `apply`-Patches bleiben `{ neutral: { toenung } }`. `originLabel` kennt `"neutralfarbe"` („own neutral colour (neutral.farbe)“). Zusätzlich (über D-6 hinaus): beide Suchen starten bei `neutralToenung(agordo)` statt `toenung ?? 0`, damit „(now …)“ mit eigener Farbe ohne Tönung 1,00 nennt, also den Wert der Ableitung. Ohne `farbe` identisch.
- [x] **Schreibweg** (`metiejo/src/grafeo-skribo.ts`): Körper `{ neutral: { farbe: string | null } }` (genau der Schlüssel `farbe`, sonst 400). Lokale Typen `NeutralSxangxo` und `SkriboSxangxo = LeinwandSxangxo | NeutralSxangxo`; `sxangxoEl`/`feldDe` nehmen `SkriboSxangxo`. Wert wie die Knotenfarben: `farboHex` muss lesen, sonst 422 `{ feld: "neutral.farbe", satz: NELEGEBLA_SATZ }`; gespeichert getrimmt, wie getippt. `toenung: 1` nur wenn keine da ist. `null` entfernt `farbe`, lässt die Tönung, ein leeres `neutral` entfällt. Kein Check, keine Regel. Eine Schema-Ablehnung unter `/neutral/farbe` gibt ebenfalls `NELEGEBLA_SATZ`. `servilo.ts` blieb unberührt (die Route reicht den Körper durch).
- [x] **Tests:** `neutralfarbe-055` (16), `neutral-skribo-055` (13), `neutral-studio-055` (3).
- [x] **Rot zuerst:** alle Ableitungs-, explain-, Historie- und Schema-Tests von `neutralfarbe-055` waren vor der Änderung rot (Schema lehnte `farbe` ab, `Unexpected member "farbe"`; Schema-Diff-Test: `farbe` fehlt). `neutral-skribo-055`: Schreibweg-Tests rot (400 statt 200/422). Grün beim ersten Lauf und darum mit Pflanzung geprüft (je Pflanzung rot gesehen, zurückgesetzt, mit `cmp` gegen eine Sicherung bestätigt):
  - P1 `palettes.ts` alter Zweig `hue: lead.h + 1e-9` → alle 5 agordilo-Prüfsummen und der Test „Tönungs-Zweig“ rot.
  - P2 `explain.ts` `#rampSuggestion` ohne Spread → „ramp suggestion“ rot. P3 `#tintSuggestion` ohne Spread → „Tönung suggestion“ rot. P4 beide Suchen mit `toenung ?? 0` → „(now 1.00)“-Test rot.
  - P5 `regler.ts` `reglerDiff` listet `neutral.farbe` → D-7-Test rot (agordilo); P11 dieselbe Pflanzung, agordilo-`dist` neu gebaut → D-7-Test in `neutral-studio-055` rot.
  - P6a `NEUTRAL_SHARE` im eigenen Zweig, P6b Vorgabe-Tönung 0, P6c Tönung ignoriert, P6d `origin: "toenung"` → je die zugehörigen Ableitungstests rot.
  - P7 Schema mit zweitem neuen Feld `neutral.properties.farbton` → Schema-Diff-Test und Ablehnungstest rot.
  - P8 `grafeo-skribo.ts` nimmt `neutral` mit weiteren Schlüsseln an → „malformed“ rot.
  - P9 Schreibweg schreibt `farbe` nicht → Schreibweg-Tests und alle drei Studio-Tests rot (Pflanzpunkt für die Gruppe „Speichern“ des Studios; `marko.ts` ist nicht frei, darum dort keine Pflanzung).
  - P10 wie P1 mit neu gebautem agordilo-`dist` → die 4 metiejo-Prüfsummen (`startAgordo` ×3, Belegung) rot.
  - P12 `servilo.ts` `patched`: `const group = {}` (ohne Zusammenführen) → Studio-Regler-Test und Speichern-Test rot. Zurückgesetzt mit der exakten Umkehr der Zeile (nicht durch Kopie, weil `servilo.ts` geteilt ist); die Zeile steht danach wie auf `642ab220`.
- [x] **Läufe:** `pnpm --filter @fundamento/modelo generate:types` → `git diff --stat -- packages/modelo`: nur `schema/modelo.schema.json` (+3) und `src/generated/modelo-schema.ts` (+1); `generate:types --check` „up to date“ (beide). `FM_AUSGABE=knapp pnpm --filter @fundamento/agordilo test neutralfarbe-055 fixtures explain palettes` → 18/0. Ganze agordilo-Suite → 167/0. `FM_AUSGABE=knapp pnpm --filter @fundamento/modelo test contracts` → 326/0. Ganze modelo-Suite → 4974/2 rot, beide aus den damals ungestageten Löschungen von LNS-1.1 (`fazo.tsx`, `bilder-054.ts`: `neutrale-namen` ENOENT, `turbo-inputs`), nach dem Commit `7b5864ab` erneut gelaufen: 31/0. `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test neutral-skribo-055 neutral-studio-055 grafeo-skribo-054` → 35/0. Zusätzlich metiejo `grafeo studio` → 239/0. Lint: agordilo, modelo, metiejo grün (metiejo: 1 fremde Warnung `komponentoj.ts:42`). Keine Datei unter `packages/modelo/data/**` oder `packages/mcp/**` geändert. Diff-Suche (Wort aus R-12, Name des privaten Schriften-Repos, zur Laufzeit aus `oldNames()`): 0 / 0 über alle neuen Zeilen und neuen Dateien.

### LNS-1.2: geänderte ältere Tests

- `packages/metiejo/src/grafeo-skribo-054.test.ts:525` (auf Anweisung des Orchestrators in die Zone von LNS-1.2 übernommen). Vorher: `expect((await bildoDe("funkcio")).nodoj.some((n) => n.id === "farbo-warning")).toBe(false);` Nachher (Biome bricht sie auf :525–527 um): `expect(((await bildoDe("funkcio")).nodoj.find((n) => n.id === "farbo-warning") as BildoFarbo).stato).toBe("abgeleitet");` Grund: Spec 055 Teil C, die vier Funktionsfarben-Knoten stehen immer da (LNS-1.1); nach `wert: null` bleibt der Knoten mit `stato: "abgeleitet"`. `BildoFarbo` war schon importiert. Sonst nichts an der Datei geändert.

### LNS-1.2: für den PR-Text

- Schema: genau ein neues optionales Feld `Agordo.neutral.farbe` (`$ref AgordoColor`); erzeugte Typen eine Zeile. Keine Datei unter `packages/modelo/data`, kein Kern-Token, keine Regel, keine Grenze; `toenung` bleibt `0..1`.
- Ableitung: mit `neutral.farbe` Farbton und Buntheit aus der Farbe, skaliert mit der Tönung (Vorgabe 1), ohne `NEUTRAL_SHARE`; `origin: "neutralfarbe"`. Ohne das Feld byte-gleich (Prüfsummen von `642ab220` für 8 Agordoj in `neutralfarbe-055` und `neutral-skribo-055`).
- `explain` behält `neutral.farbe` in beiden Suchen; Patches bleiben `{ neutral: { toenung } }`.
- Schreibweg `POST /api/marko/:name/leinwand` nimmt `{ neutral: { farbe: string | null } }`: 200 `{ rev, gespeichert }` (rev+1, `toenung: 1` nur wenn keine da), 422 `{ feld: "neutral.farbe", satz }` bei unlesbarer Farbe (Entwurf und rev unverändert), 400 bei anderer Form. Kein Check.
- Geänderter älterer Test: `grafeo-skribo-054.test.ts:525` (siehe oben).

### LNS-1.2: Befunde

- **R-1 (MCP-Ausgabeschema):** `packages/mcp/schema/tools/preview_agordo.output.json:289` lässt für `source.origin` nur `leitfarbe, zusatzfarbe, default, toenung` zu; `mcp/src/tools.ts:634` reicht `origin` durch. Ein Agordo mit `neutral.farbe` liefert dort `"neutralfarbe"` und verletzt das eigene Ausgabeschema (für `sekundo` gibt es dort keinen Eintrag, `tools.ts` geht nur über `PALETTES`). MCP ist tabu: Maintainer erweitert die Aufzählung samt Fixtures.
- **R-2 (kontrakto-038):** `packages/mcp/test/fixtures/kontrakto/input-schemas.json` enthält das Agordo-Schema dreimal (`preview_agordo`, `propose_agordo`, `save_agordo`, ≈ :848, :1530, :2210). Diese Einträge werden rot; LNS-4.1 listet sie einzeln nach dem lokalen Lauf von `kontrakto-038`. Hier nicht gelaufen (MCP außerhalb der Zone).
- **D-7 (Historie):** `historioEintrag`/`reglerDiff` listen `neutral.farbe` nicht. Ein Speichern, das nur `neutral.farbe` ändert, hängt `{ wunsch: "Hand", diff: [] }` an (Test in `neutralfarbe-055` und End-zu-End in `neutral-studio-055` über `/studio/:name/speichern`). Wie heute bei `zweitfarbe` und `zusatzfarben`. Unverändert gelassen.
- **Studio (`neutral-studio-055`, nur lesend): grün.** Der Live-Regler der Tönung (`POST /api/marko/:name/entwurf` `{ neutral: { toenung } }`, `patched` führt `neutral` feldweise zusammen) behält `farbe`; `POST /studio/:name/speichern` schreibt `neutral.farbe` unverändert in `agordo.json`. Das Studio zeigt das Feld nicht (gewollt).
- **Verstehen:** `metiejo/src/grafeo.ts:653–662` kennt `origin: "neutralfarbe"` nicht und fällt auf `[]` zurück. Unverändert (Abnahme 9).
- **`readAgordo` prüft die Helligkeit von `neutral.farbe` nicht:** `agordilo/src/agordo.ts` `colourPointers` liest nur `leitfarbe` und `zusatzfarben` (auch `zweitfarbe` nicht). Ein Agordo mit `neutral.farbe: "oklch(1.5 0.1 20)"` liest also über das Schema-Muster; die Ableitung nutzt davon nur Farbton und Buntheit. Der Schreibweg lehnt solche Werte über `farboHex` ab. Datei außerhalb der Zone, nicht geändert.
- **Explain-Startwert:** Beide Suchen starten mit eigener Farbe ohne Tönung bei 1 (`neutralToenung`), nicht bei 0. Über D-6 hinaus, aber nötig, damit Satz und Suche zur Ableitung passen; ohne `farbe` identisch.
- **Turbo-Cache bei Pflanzungen:** Nach dem Zurücksetzen einer Pflanzung stellte `turbo run build --filter=@fundamento/agordilo` die alte `dist` einmal nicht wieder her (Cache-Treffer ohne Rückspielen). Mit `pnpm --filter @fundamento/agordilo build` und `turbo … --force` neu gebaut; `dist` und Cache-Eintrag stimmen wieder mit der Quelle.

## LNS-1.3 (T6): Markenliste auf der Startseite

### LNS-1.3 im Einzelnen

Stand: fertig (2026-11-15).

- **Neu `packages/metiejo/src/leinwand-dosieroj.ts`** (D-1, nur Namen, kein I/O): `LEINWAND_DOSIERO = "leinwand.json"`, `STAENDE_DIR = "staende"`, `STAND_SUFIKSO = ".json"`, `LEINWAND_UNLESBAR_PRAEFIKSO = "leinwand.unlesbar-"`, `leinwandUnlesbarDosiero(zeit: Date): string` (→ `leinwand.unlesbar-2026-11-15T144107.123Z.json`, UTC, `toISOString()` ohne Doppelpunkte), `standDosiero(id: string): string` (→ `<id>.json`). LNS-2.2 und LNS-3.1 importieren von hier.
- **Neu `packages/metiejo/src/marken-liste.ts`**: `interface MarkenZeile` (Form der technischen Spec T6), reine Teile `markenFarbenDe(agordo, palettes)` (Primär `hexOf(leitfarbe)`, Akzent nur mit `zweitfarbe`, Neutral = heller Schritt `neutral/100` aus `paletrojDe`, `""` wenn die Ableitung scheitert), `markenListeSortiert(zeilen)` (`geaendert` absteigend, bei Gleichstand Name), `zeitpunktText(iso)` („15.11.2026, 14:41“, Ortszeit des Servers), `staendeText(n)` („0 Stände“/„1 Stand“/„N Stände“); I/O-Rand `markenListeDe(workdir, bases)` über `listMarkoj`, `readMarko`, `markoDir`: `geaendert` = jüngste mtime von `agordo.json`, `entwurf.json`, `leinwand.json`; `staende` = Zahl der **Dateien** `*.json` in `staende/` (Ordner und andere Endungen zählen nicht); Farben und Etikett aus dem **Entwurf** (`readMarko().draft`); unlesbares `agordo.json` → `{ lesbar: false }` ohne `farben`. Keine Prüfung, kein Urteil.
- **`sxtupoj.ts`** (nur Start, D-11): optional `ScreenInput.markenListe`; `preview()` gibt für `start` mit Liste die Liste zurück (`<style>` + `<section class="mt-marken">` mit `fm-titolo level="2"` „Angefangene Marken“, je Marke ein `fm-karto level="3"` mit `heading` = Etikett, `media` = drei Farbflächen, zwei `fm-teksto kind="caption"` „zuletzt geändert …“ und „N Stände“, `fm-ligilo slot="actions" placement="standalone" to="/marko/<name>/grafeo"` „Leinwand von <Etikett>“; unlesbar: `fm-karto emphasis="low" data-mt-unlesbar` mit Name und „lässt sich nicht lesen“, ohne Farbflächen und ohne Link; leer: „Noch keine Marke. Lege oben die erste an.“). Die Section `mt-sxtupo` trägt beim Start mit Liste `data-mt-marken` statt `data-mt-plena`. Ohne `markenListe` ist der Start Byte für Byte wie bei `642ab220` (SHA-256 `651e6a08…3272`, im Test festgehalten); jeder andere Schritt ignoriert die Liste.
- **Layout (Option B, ohne Media Query):** Start-eigenes `<style>`: `.mt-sxtupo[data-mt-marken]` als `flex-wrap`, Formular `flex: 0 1 38rem`, Liste `flex: 999 1 min(100%, 28rem)` → breit nebeneinander, schmal darunter; Karten im Raster `repeat(auto-fill, minmax(min(100%, 14rem), 1fr))`. Nur `var(--fm-*)`, rem, fr, %; Farbflächen inline aus Daten (D-8), leere Fläche `dashed` + `transparent` mit Token-Rand.
- **`servilo.ts`**: nur `inputOf` (plus die Importzeile): `...(key === "start" ? { markenListe: markenListeDe(options.workdir, bases) } : {})` vor `...extra` – gilt für `GET /` und die Fehlerantworten von `POST /marko`.
- **Test `markenliste-055.test.ts`** (19 Tests): Dateinamen D-1; Zeitformat mit führenden Nullen; Stände-Text; Sortierung; Farbflächen inkl. gescheiterter Ableitung; `markenListeDe` im Temp-Arbeitsordner mit `utimesSync` (jüngste der drei mtimes, Etikett aus dem Entwurf, Zweitfarbe nur aus dem Entwurf, Stände nur `*.json`-Dateien, unlesbare Marke, Ordner ohne `agordo.json` fehlt, fehlender Arbeitsordner → `[]`); Start ohne Liste = Prüfsumme `642ab220`; M-2-Invarianten von `sxtupoj.test.ts` mit Liste; Liste nach `</fm-formularo>`, Formular byte-gleich, gleiche `fm-butono`, gleiche `<script>`, kein `role="button"`, kein „anlegen“/„öffnen“ in der Liste (D-10); Karteninhalt; Links nur für lesbare Marken; Leerzeile; CSS ohne `@media`, ohne Farbliteral, ohne px/Dauer, mit intrinsischem Raster; kein Regelname/-id und kein Urteilswort (mit Gegenprobe); andere Schritte unverändert; HTTP: `GET /` leer → Leerzeile, nach Anlegen Link, Fehlerantwort `POST /marko` mit Liste, `/marko/<name>/farbe` ohne Liste.
- **Gepflanzte Fehler** (alle Tests waren beim ersten Lauf rot, weil die Module fehlten; danach je Behauptungsgruppe ein Fehler, rot gesehen, zurückgesetzt, `cmp` gleich): P1 Sicherungsname mit Doppelpunkten · P2 ohne führende Nullen · P3 immer „Stände“ · P4 Gleichstand umgekehrt · P5 Neutral Schritt 200 · P6 `geaendert` nur aus `agordo.json` · P7 jeder Eintrag zählt als Stand · P8 Etikett ignoriert · P9 Farben aus der Sicherung statt dem Entwurf · P10 unlesbare Karte mit Link · P11 leerer Akzent nicht gestrichelt · P12 `<a>` in der Karte · P13 `fm-butono` „Öffnen“ in der Liste · P14 `@media` im Stil · P15 `80px` im Stil · P16 Raster `repeat(3, 1fr)` · P17 Start bleibt einspaltig (`data-mt-plena`) · P18 Liste im Formular · P19 Leerzeile geändert · P20 „2 Probleme“ auf der Karte · P21 Liste auf jedem Schritt · P22 Start ohne Liste verändert · P23 `inputOf` ohne Liste · P24 Überschrift Ebene 3.
- **Läufe:** `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test markenliste-055 sxtupoj grafeo-einstieg-054 servilo` → 129 bestanden, 0 rot. `biome check` und `tsc --noEmit` für alle Dateien dieses Tickets sauber; `pnpm --filter @fundamento/metiejo lint` scheitert zum Zeitpunkt des Laufs nur an der Formatierung von `neutral-skribo-055.test.ts` (LNS-1.2, in Arbeit). Browser (Chromium, Playwright-MCP, Metiejo aus `dist` auf Port 7391 mit Temp-Arbeitsordner, danach gestoppt und gelöscht): 2100 px → Formular (16–624) und Liste (648–1264) nebeneinander, oben bündig; 700 px → Liste unter dem Formular; Optionen von `fm-elekto[name="basis"]` ohne Überlauf; Klick auf „Leinwand von Quendolin“ öffnet `/marko/quendolin/grafeo`; 0 Konsolenfehler (eine Warnung `fm-ikono: name is required` steht auch auf `/marko/<name>/farbe` ohne Liste, also schon vorher).

### LNS-1.3: geänderte ältere Tests

Keine. `sxtupoj.test.ts` und `grafeo-einstieg-054.test.ts` sind unverändert und grün.

### LNS-1.3: für den PR-Text

- `sxtupoj.ts`: Import `type MarkenZeile, staendeText, zeitpunktText` aus `./marken-liste.js`; `ScreenInput.markenListe?: MarkenZeile[]`; neue Funktionen `markenFarbeHtml`, `markenKarteHtml`, `markenListeHtml`, Konstante `MARKEN_CSS`, `FARBO_NOMOJ`; in `preview()` die erste Zeile `if (input.sxtupo === "start" && input.markenListe !== undefined) return markenListeHtml(input.markenListe);`; die Section-Zeile wird zu `<section class="mt-sxtupo"${input.sxtupo === "start" && input.markenListe !== undefined ? " data-mt-marken" : input.sxtupo === "vorschau" || input.marko === undefined ? " data-mt-plena" : ""}>`. `fields()` ist unverändert („Vorhandene Marke öffnen“ Byte für Byte).
- `servilo.ts`: `import { markenListeDe } from "./marken-liste.js";` und in `inputOf` `...(key === "start" ? { markenListe: markenListeDe(options.workdir, bases) } : {}),`.
- Abweichung von T6 (R-5, D-12): keine `<a href>`-Zeilen, sondern `fm-karto` mit `fm-ligilo`; **nicht die ganze Karte ist klickbar** – `fm-karto` hat kein Ziel-Attribut, und die Uzo von `karto` führt „clickable-card“ als `ask-human`. Der Link trägt den Markennamen („Leinwand von <Etikett>“) und steht im Slot `actions`.
- Abweichung/Verfeinerung D-11: statt des Gitters `repeat(auto-fit, …)` für Formular und Liste ein intrinsisches Flex-Wrap (Formular 38rem, Liste wächst), damit das Formular seine Breite behält; die Regel `repeat(auto-fill, minmax(min(100%, 14rem), 1fr))` ordnet die Karten. Kein `@media`.
- Option B weicht auf breiten Schirmen vom Wortlaut „unter dem Einstieg“ ab (so in der Spec G vorgesehen).

### LNS-1.3: Befunde

- `fm-elekto` bricht seine Optionen nicht um: „Beispiel komuna-0-2: die Referenz, wie sie vor den neuen Grundlagen aussah“ ist rund 37rem breit. Bei der LAYOUT-Breite 28rem lief die Option in die Liste; das Formular steht deshalb mit 38rem. Wird eine Option länger, braucht es mehr Breite oder ein umbrechendes `fm-elekto` (Eroj tabu).
- Die Neutral-Farbfläche ist bei Marken ohne Tönung ein sehr helles Grau (z. B. `#e4e4e4`) und hebt sich wenig von der Karte ab. Das ist der Wert der Ableitung (Inhalt), keine Gestaltung.
- `markenListeDe` leitet für jede lesbare Marke einmal die Paletten ab (`paletrojDe`), bei jedem `GET /`. Bei sehr vielen Marken wird die Startseite langsamer (Nicht-Ziel: Seiten).
- Die Konsolenwarnung `fm-ikono: name is required` steht auf Start- und Schrittseiten, auch ohne Liste (vorbestehend).

## LNS-2.1 (T2 UI + T3 Leinwand): Farbknoten, Neutral-Kante und eigene Farbe

### LNS-2.1 im Einzelnen

- [x] **Rot zuerst:** neuer Test `grafeo-neutral-055.test.ts` (14 Tests) und ein neuer Test in `grafeo-funkcioj-055.test.ts` („zurück zur Ableitung“ über `leinwandSchreiben`). Erster Lauf: 10 rot aus dem richtigen Grund (`herkunft` fehlt, keine feste Kante, `stato: "leer"` statt `"abgeleitet"`, D-16 ließ `farbe` stehen, die gelöste Zeile wurde bunt), 16 grün.
- [x] **Daten (`grafeo-gestalten-sicht.ts`):** `BildoFarbo.herkunft?: "primaer" | "eigene"` (nur Neutral). `BildoFarbo.wert` trägt bei Neutral `neutral.farbe`. `BildoFarbo.toenung` ist bei Neutral die wirksame Tönung (`neutralToenung`: `toenung ?? (farbe ? 1 : 0)`; ohne `farbe` wie bisher). `LeinwandSxangxo` hat die Variante `{ neutral: { farbe: string | null } }`. Der Übergangstyp `BildoFazo` ist entfernt (`kunteksto.ts` nennt ihn nicht mehr, per grep geprüft).
- [x] **Bildo (`grafeo-gestalten.ts`):** Neutral: `herkunft` `"primaer"` ohne `farbe`, sonst `"eigene"` mit `wert`. `stato` `"abgeleitet"` ohne `farbe` und ohne Tönung, sonst `"von-hand"`. `hex` = helle Stufe 100 wie bisher (folgt der eigenen Farbe über die Ableitung). `ligojDe` setzt die feste Kante `{ id: "farbo-primaer.el>farbo-neutral.en.farbo", de: "farbo-primaer.el", al: "farbo-neutral.en.farbo", art: "farbo", hex: <Primär-Hex>, fest: true }` nur bei `herkunft: "primaer"`, zwischen den Farbe → Zeile-Kanten und den Palette → Vorschau-Kanten. `wirksamerAgordo`: `kabloj` `neutral: null` streicht das ganze `neutral` (D-16).
- [x] **Schreibweg (`grafeo-skribo.ts`):** nur die lokalen Typen `NeutralSxangxo` und `SkriboSxangxo` gelöscht, `Legita` und `feldDe` nehmen wieder `LeinwandSxangxo`. Sonst unverändert.
- [x] **Knoten (`farbo.tsx`):** Kopf-Marke aus `stato` („abgeleitet“ / „von Hand“ / „Startwert“ / „leer“ / „aus Material“, „abgehängt“ bei Lösung). Funktionsfarben: abgeleiteter Hex nur als `placeholder`, „zurück zur Ableitung“ nur bei eigenem Wert, sendet `{farbe:{rolle, wert:null}}`, der alte Weg über `forigi` ist weg, ein leeres Feld gibt ebenfalls zur Ableitung zurück. Kein „entfernen“/„×“ an Funktionsfarben. Leere Fläche (gestrichelt, kein Rot) bei `hex: ""` (`ableitung: "fehlt"`). Neutral: Fläche, Satz „aus Primär abgeleitet“ / „eigene Farbe“ mit Quadrat in der Farbe der Grundlage, Feld + Farbwähler hinter „Eigene Farbe setzen“ (wie Primär: Enter, Verlassen, `change` schreiben `{neutral:{farbe}}`), „abbrechen“ schließt ohne Schreiben (das Feld behält beim Klick den Fokus, ein Merker sperrt den Blur dazwischen), „zurück zur Ableitung“ bei `herkunft: "eigene"` schreibt `null`, Regler Tönung mit Zahl daneben in beiden Zuständen, 422 als ruhiger Satz am Feld (`--fm-color-text-muted`). Der 054-Hinweis „Eine bestimmte Neutralfarbe setzt du in der Palette.“ ist weg. Anschlüsse: unten an Primär `farbo-primaer.el` mit Griff `FESTA_TENILO`, oben an Neutral `farbo-neutral.en.farbo` (gefüllt in Primärs Farbe, hohl bei eigener Farbe).
- [x] **Höhen (D-2, Maxima unverändert):** kompakte Funktionsfarben von 98 auf 94 px (Zeile mit `padding-block-start: var(--fm-spacing-small)`). Neutral-Fläche auf `var(--fm-size-control-large)` (wie im Mockup kleiner als bei Primär), Satz und Knopfzeile mit `--fm-spacing-small` oben.
- [x] **Palette (`paletro.tsx`):** Neutral-Zeile „eigene Farbe · Tönung 1,00“ bei eigener Farbe, sonst unverändert („Tönung 0,35“, „nicht verbunden · Tönung 0“).
- [x] **Läufe:** `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test grafeo-neutral-055 grafeo-funkcioj-055 neutral-skribo-055 grafeo-skribo-054 grafeo-literale-054 grafeo-paletro-054` → **69 bestanden, 0 rot**. Nachbarn `grafeo-anordnung-055 grafeo-gestalten-054 grafeo-kabloj-054 grafeo-wirksam-054 grafeo-urteil-054 grafeo-route-054 grafeo-vorschau-054 grafeo-047 grafeo-route-047 grafeo-grupoj-048 neutral-studio-055` → **123 bestanden, 0 rot** (Stand des Baums mit den halbfertigen LNS-2.2-Dateien). `pnpm --filter @fundamento/metiejo lint` grün (1 fremde Warnung `komponentoj.ts:42`), `pnpm --filter @fundamento/nodredaktilo lint` grün, `build` grün (`dist/leinwand.js` 735 320 B roh, 195 180 B gzip laut Vite).
- [x] **Gepflanzte Fehler** (je Gruppe, die beim ersten Lauf grün war; jeweils rot gesehen, zurückgesetzt, mit `cmp` gegen eine Kopie bestätigt):
  - P1 `grafeo-gestalten.ts` Neutral-`hex` aus Stufe `200` statt `100` → 3 rot in `grafeo-neutral-055` (u. a. „the swatch follows the own colour“).
  - P2 `grafeo-gestalten.ts` `vicojDe`: `fonto` null bei `herkunft: "eigene"` → „the Palette's neutral row is fed by Neutral in both states“ rot.
  - P3 `grafeo-skribo.ts` `feldDe` gibt `"neutral"` statt `"neutral.farbe"` → „refuses an unreadable colour …“ rot.
  - P4 `grafeo-gestalten.ts` `etikedo` mit „Problem “ davor → „no answer names a rule or a problem count“ rot (beim ersten Lauf war dieser Test nur über die Zahl der Antworten rot).
  - P5 `grafeo-skribo.ts` leeres `zusatzfarben` bleibt stehen → neuer Test „„zurück zur Ableitung“ … keeps the node“ rot.
  - P6 `grafeo-gestalten.ts` abgeleiteter Hex aus der Palette `neutral` → 5 rot in `grafeo-funkcioj-055`, darunter der neue Test.
  - P7 (Typ) `grafeo-gestalten-sicht.ts` ohne die Variante `{neutral}` → `tsc` meldet `grafeo-neutral-055.test.ts(159,9)` und `(160,9)` (TS2353).
- [x] **Browser (Chromium, eigenes Wegwerf-Skript mit Playwright 1.63 unter `/tmp`, nicht der geteilte MCP-Browser; Metiejo aus `dist` auf Port 7412, Temp-Arbeitsordner, danach gestoppt und gelöscht; 2100×1300; Stand: `kanvaso.tsx`/`kunteksto.ts` von LNS-2.2 in Arbeit, aber typfehlerfrei).** Ablauf 2 an neuen Marken: Start „abgeleitet“, „aus Primär abgeleitet“, feste Kante `M432 199L432 247`; „Eigene Farbe setzen“ → Feld offen, „abbrechen“ nach Tippen von `#123456` → **kein POST**; `blau` + Enter → 422, Satz am Feld, Farbe = `--fm-color-text-muted` (beide `rgb(190, 190, 190)`); `#e8e2d6` + Enter → Kante weg, „eigene Farbe“, „von Hand“, Tönung „1,00“, Palette „eigene Farbe · Tönung 1,00“, Stufe 100 `#e6e4e2` (warmes Grau), beide Vorschauen auf `rev=2`; „zurück zur Ableitung“ → Kante wieder da, „aus Primär abgeleitet“, „von Hand“ (Tönung 1 bleibt); `#ff0000` als Neutral und `#f5c400` als Primär gesetzt und gespeichert; Warnung `#d99a00` → „von Hand“ mit „↺“, Klick → POST `{"farbe":{"rolle":"warning","wert":null}}`, Knoten bleibt „abgeleitet“, Feld leer, Platzhalter = abgeleiteter Hex. Konsole: nur der Ressourcen-Log des 422.
- [x] **Gemessene Höhen** (`offsetHeight`, Flusseinheiten): Primär 170 (≤ 190), Akzent 172 (≤ 190), Neutral geschlossen 194, offen 238, offen mit 422-Satz 296 (≤ 300), Erfolg/Warnung/Fehler/Hinweis je 94 (≤ 96; vorher 98).
- [x] Wortsuche (R-12-Wort, privates Schriften-Repo, zur Laufzeit aus `oldNames()`): über alle hinzugefügten Zeilen und die neue Testdatei 0 / 0 / 0 / 0 / 0 / 0.

### LNS-2.1: geänderte ältere Tests

- `packages/metiejo/src/grafeo-gestalten-054.test.ts:200`. Vorher `stato: "leer",` Nachher `stato: "abgeleitet",`. Grund: Neutral ohne `farbe` und Tönung ist nach T3 „abgeleitet“.
- `packages/metiejo/src/grafeo-gestalten-054.test.ts:488–493` (eingefügt in `soll`): die Zeile `farbo-primaer.el>farbo-neutral.en.farbo:farbo:<Primär-Hex>`, wenn Neutral `herkunft: "primaer"` hat. Grund: D-18, die feste Kante gehört zu den Kanten aus dem Agordo.
- `packages/metiejo/src/grafeo-anordnung-055.test.ts:242` (LNS-1.1). Vorher `for (const ligo of ligoj) {` Nachher `for (const ligo of ligoj.filter((l) => l.fest !== true)) {` mit Kommentar. Grund: die feste Kante ist ein senkrechtes Stück ohne Spur (`spuroX` gibt dafür bewusst `undefined`); ihr gemeinsames x prüft schon der Test zu D-18 in derselben Datei.
- `packages/metiejo/src/grafeo-kabloj-054.test.ts:172`. Vorher `.filter((l) => l.de === "farbo-primaer.el")` Nachher `.filter((l) => l.de === "farbo-primaer.el" && l.fest !== true)`. Grund: Primär speist jetzt zusätzlich die feste Kante zu Neutral; der Test zählt nur Zeilen-Eingänge.

### LNS-2.1: für den PR-Text

- Neutral zeigt seine Herkunft: Kante von Primär (fest, ohne „×“) und der Satz „aus Primär abgeleitet“. „Eigene Farbe setzen“ öffnet Feld und Farbwähler, „abbrechen“ schreibt nichts, „zurück zur Ableitung“ nimmt die eigene Farbe zurück. Die Neutral-Zeile der Palette sagt „eigene Farbe · Tönung 1,00“.
- Funktionsfarben: Kopf „abgeleitet“/„von Hand“, abgeleiteter Wert nur als Platzhalter, „zurück zur Ableitung“ statt Entfernen.
- `kabloj` `neutral: null` streicht künftig das ganze `neutral` des wirksamen Agordo (D-16); ohne `farbe` wie bisher.
- `LeinwandSxangxo` enthält `{ neutral: { farbe } }`; die Übergangstypen in `grafeo-skribo.ts` und `BildoFazo` sind weg.
- Vier erzwungene Änderungen an älteren Tests (Liste oben).

### LNS-2.1: Befunde

- **Abweichung:** „zurück zur Ableitung“ der kompakten Funktionsfarben ist ein echter Knopf mit dem Zugriffsnamen „<Farbe>: zurück zur Ableitung“ und dem Titel „zurück zur Ableitung“, sichtbar aber als „↺“. Ein Text-Knopf passt weder neben Feld und Farbwähler in 264 px noch als zweite Zeile unter das Maximum 96 (D-2). Er erscheint nur, wenn ein Wert gesetzt ist.
- „abbrechen“ mit der Tastatur: Wer per Tab vom Feld zum Knopf geht, verlässt vorher das Feld, und das Verlassen schreibt (Spec: Enter/Verlassen/`change` schreiben). Mit Maus oder Finger schreibt „abbrechen“ nie.
- Der feste Pfad Primär → Neutral wird nach einer Höhenänderung von Neutral (Feld offen) als `L…Q…` mit Versatz im Hunderttausendstel-Pixel gezeichnet (React Flow misst Griffe leicht versetzt); sichtbar bleibt ein gerades Stück.
- Der Platzhalter von `fm-kampo` ist optisch kaum vom Wert zu unterscheiden (Gestaltung des Ero, tabu). Der Wert ist leer (`inputValue() === ""`).
- Ein 422 erzeugt im Browser den Ressourcen-Log „Failed to load resource … 422“ (wie bei Primär in 054), keinen Seitenfehler.
- `kanvaso.tsx:522` (LNS-2.2) mattiert Farbe-Kanten nur bei `stato === "leer"`; abgeleitete Quellen bleiben unmattiert. Kein Bedarf für 2.1, nur zur Kenntnis.
- Der geteilte Playwright-MCP-Browser wurde während des Laufs von einem anderen Ticket auf einen anderen Port umgelenkt; der Lauf nutzt darum ein eigenes Chromium.

## LNS-2.2 (T4): Leinwand-Zustand

### LNS-2.2 im Einzelnen

- [x] **Neu `packages/metiejo/src/leinwand-stato.ts`** (rein + Rand): `parseLeinwandStato(teksto) → {stato} | {unlesbar: true}` (unlesbar: kein JSON, kein Objekt, `version` ≠ ganze Zahl 1, `knoten` kein Array, `kabloj` kein Objekt; innen: unbekannte IDs und spätere Doppel übergangen, falsche Typen verworfen, ein Platz braucht `x` und `y` als endliche Zahlen, ein fester Knoten ohne Platz fällt weg, ein hinzugefügter `vorschau-<n≥3>` mit `speco: "vorschau"` und `schema` bleibt ohne Platz, `inhalt` (Objekt) wird unverändert durchgereicht, `kabloj` behält nur Einträge, die `kablojEl` lesen würde). `serializeLeinwandStato` (= `serializeCanonicalJson`), `leinwandStatoRekomenco(stato|null)` (nur hinzugefügte Knoten ohne `x`/`y`, `kabloj: {}`), `serializeLeinwandAntwort(bildo, stato, unlesbar)`, `LEINWAND_STATO_SATZ` = „Diesen Zustand der Leinwand kann Fundamento nicht lesen.“, `LEINWAND_STATO_FELD = "leinwand-stato"`. Rand: `leinwandStatoLegi(workdir, name) → {speco:"mankas"} | {speco:"stato", stato, bajtoj} | {speco:"unlesbar", bajtoj}` (schreibt nie), `leinwandStatoSkribi(workdir, name, stato, zeit: Date)` (benennt eine unlesbare Datei vorher nach `leinwandUnlesbarDosiero(zeit)` um). Namen aus `leinwand-dosieroj.ts`, Ordner über `markoDir`.
- [x] **`servilo.ts`:** `GET /api/leinwand` antwortet `LeinwandAntwort` (immer `stato`, `statoUnlesbar: true` nur bei unlesbarer Datei). Ohne `kabloj`-Parameter gelten die `kabloj` der Datei (Bildo `kabloj`, Palette, Vorschau-Adressen); liest ihr wirksamer Agordo nicht, antwortet die Route wie mit `kabloj: {}` und gibt auch `stato.kabloj` als `{}` zurück (D-15). Ein `kabloj`-Parameter – auch ein leerer `kabloj=` – behält die 054-Bedeutung (400/422), `stato` ist dann die Datei, wie sie ist. Cache (D-14): Eintrag `{rev, dosiero: <Bytes von leinwand.json>|null, korpo}`, gültig nur für dieselbe rev **und** dieselben Dateibytes, geschrieben und gelesen nur, wenn weder Abfrage noch Datei `kabloj` tragen; `leinwandBildoForigi(name)` (Closure in `startServilo`) wirft ihn weg und wird von PUT/DELETE gerufen. Neu `PUT`/`DELETE /api/marko/:name/leinwand-stato` vor den generischen `/api/marko/*`-Routen: 404 `{satz: "Diese Marke gibt es nicht."}` (wie `/api/marko/:name/stato`), 422 `{feld: "leinwand-stato", satz}` für eine falsche Form (auch kein JSON), sonst 200 `{gespeichert: ISO}`. Kein `setDraft`, keine rev, kein Kroniko-Eintrag, keine Prüfung. `serializeBildo`-Import entfällt in `servilo.ts`.
- [x] **Neu `nodredaktilo/src/gestalten/stato.ts`** (rein): `SesioNodo` (jetzt mit `inhalt?`), `Sesio`, `SESIO_KOMENCO`, `UNUA_VORSCHAU = 3`, `sesioId`, `sesioLigoj`, `ligoSitzungDe`, `kunZiehen`, `kunLoesen` (aus `kanvaso.tsx` hierher verschoben, unverändert), `nodojKunStato`, `kablojDeSesio(bildo, sesio)`, `sitzungDeKabloj(kabloj, bildo, nodoj = [])`, `statoDeSesio(bildo, sesio, verschoben, kabloj)` (nur Knoten mit eigenem Platz, dann alle Sitzungsknoten), `statoTeksto`, `sesioDeStato(stato|null, bildo) → {sesio, verschoben, vorschauNombro}`.
- [x] **`datumoj.ts`:** `Respondo` „bildo“ trägt jetzt `stato` und `statoUnlesbar`; `fontoKun(fonto, kabloj | undefined)` hängt `kabloj=` auch leer an, wenn `kabloj` übergeben wird (Nachladen der Sitzung), und nichts ohne (erstes Laden, `rekomenci`: Server wendet die Datei an). Neu `statoFonto`, `StatoRezulto`, `statoSkribi(marko, stato)`, `statoForigi(marko)`.
- [x] **`kanvaso.tsx`:** Sitzung startet aus `sesioDeStato(komenca.stato, komenca.bildo)`. Der Zustand (`statoDeSesio`) wird bei jeder Änderung geschrieben: `statoSkribilo` plant einen Schreibvorgang im nächsten `requestAnimationFrame`, höchstens eine Anfrage unterwegs, danach der neueste Zustand, falls er vom gesendeten abweicht; kein Timer. Basis ist der Zustand der ersten Antwort, darum entsteht vor der ersten Änderung keine `leinwand.json`. Fehler → `NE_KONSERVITA_SATZ` in der Kopfleiste, der Browser behält den Zustand, die nächste Änderung versucht es erneut. `rekomenci()` und `statoAtendi()` im Kontext. „Anordnung zurücksetzen“ = `statoAtendi` → `statoForigi` → `rekomenci` → Einpassen; scheitert das DELETE, bleibt alles, wie es ist („nicht gespeichert“).
- [x] **`kapo.tsx`:** `gespeichert: Konservo | null` (`{speco:"ok", teksto} | {speco:"ne"}`), `statoUnlesbar`, `anordnungZuruecksetzen`, Slot `staende?: ReactNode`. Reihenfolge rechts: Verbindungshinweis · „Anordnung ließ sich nicht lesen, Startanordnung“ (`data-nr-stato-unlesbar`, solange gesetzt) · „gespeichert HH:MM“ / `NE_KONSERVITA_SATZ` (`data-nr-gespeichert="ne"`) · **Slot `staende`** · „Anordnung zurücksetzen“ (`fm-butono`, `data-nr-anordnung-zuruecksetzen`) · Trenner · „Leinwand“ hell | dunkel · „Im Studio öffnen“.
- [x] **`kunteksto.ts`:** `FazoFlowNodo` und der `BildoFazo`-Import entfernt; `rekomenci(): Promise<void>` und `statoAtendi(): Promise<void>` in `GestaltenValoro`.
- [x] **Rot zuerst:** `leinwand-stato-055` lief zuerst rot (Modul fehlte), nach dem reinen Modul 9 rote Routentests (404 für PUT/DELETE, `stato` fehlte). Der Rundlauf-Test war einmal rot wegen eines falschen Testfalls (`{neutral: null}` bei Neutral ohne Wert ist die Sicht des Agordo selbst; Test-Marke bekommt jetzt eine Tönung).
- [x] **Gepflanzte Fehler** (je einer pro Prüfgruppe, jeweils rot, zurückgesetzt, mit `filecmp` gegen die Sicherung bestätigt): P1 Parser gibt `knoten.slice(1)` (9 rot) · P2 `version` ungeprüft (3) · P3 Doppel nicht übergangen (1) · P4 `Number.isFinite` → `isNaN` (1) · P5 `kabloj` ohne Neutral-Regel (1) · P6 `inhalt` verändert (4) · P7 `JSON.stringify` statt kanonisch (3) · P8 Zurücksetzen behält `x`/`y` (2) · P9 „Problem“ im Satz (1, Urteilssuche) · P10 Cache auch für D-15-Antwort (1) · P11 Cache ohne Dateibytes (3) · P12 keine Sicherung (1) · P13 D-15 ohne `kabloj: {}` in `stato` (1) · P14 404 → 200 (1) · P15 `sitzungDeKabloj` zieht keine Zeilen (1). Zwei erste Pflanzungen (P4 nur `typeof y`, P15 nur Neutral-Lösen) waren gleichwertig zum Original und blieben grün; ersetzt durch die genannten.
- [x] **Läufe:** `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test leinwand-stato-055 grafeo-route-054 grafeo-wirksam-054 grafeo-vorschau-054 grafeo-route-047 servilo` → 119/0. Zusätzlich `grafeo-literale-054 grafeo-urteil-054 grafeo-paletro-054 grafeo-studio-054 grafeo-skribo-054 grafeo-kabloj-054 grafeo-gestalten-054 grafeo-anordnung-055 grafeo-funkcioj-055 neutral-skribo-055 markenliste-055` → 146/0. Lint metiejo 0 (eine fremde Warnung `komponentoj.ts:42`), nodredaktilo 0. `pnpm --filter @fundamento/nodredaktilo build` grün: `dist/leinwand.js` 735 323 Bytes roh, 193 847 gzip -6.
- [x] **Browser (Chromium, 2100×1250, gebautes CLI auf Port 7493, Temp-Arbeitsordner, danach gestoppt und gelöscht), Ablauf 3:** neue Marke `lumeto` + Akzent `#2e8b57`; Palette gezogen → PUT, „gespeichert 20:02“; Akzent → Palette gelöst (×) → `kabloj {akzent:null}`, Akzent-Zeile „nicht verbunden“; „+ Knoten“ → weitere Vorschau → `vorschau-3` in der Datei. Neu laden: Knotenplätze und Kanten identisch, `data-nr-kabloj="akzent:-"`, alle drei Vorschau-Adressen mit `&kabloj=akzent:-`, kein Schreibvorgang beim Laden. „Anordnung zurücksetzen“: alle Startplätze, Akzent-Kante wieder da, `vorschau-3` bleibt auf Slot (1136, 1024), Datei `{knoten:[vorschau-3 ohne Platz], kabloj:{}}`, rev unverändert 2. 054-„zurücksetzen“ nach erneutem Lösen: Datei `kabloj {}`. Unlesbare Datei (`{kaputt`): Kopfzeile „Anordnung ließ sich nicht lesen, Startanordnung“, Startanordnung; nach dem nächsten Ziehen ist die Zeile weg, `leinwand.unlesbar-2026-11-15T190314.977Z.json` enthält `{kaputt`. PUT mit 500 (Playwright-Route): „Nicht gespeichert. Noch einmal versuchen.“, genau 1 Anfrage, keine Wiederholung ohne Änderung; nächste Änderung speichert. Konsole: nur die bekannte Warnung `fm-ikono: name is required`.
- [x] Wortsuche (R-12-Wort, privates Schriften-Repo, Erweiterungsschlüssel, zur Laufzeit aus `oldNames()`): 1 534 Zeilen, 0 / 0 / 0.

### LNS-2.2: geänderte ältere Tests

- `packages/metiejo/src/grafeo-route-054.test.ts:24` Vorher `import { gestaltenDe, paletrojDe, serializeBildo, wirksamerAgordo } from "./grafeo-gestalten.js";` Nachher ohne `serializeBildo`, dazu `:27` `import { serializeLeinwandAntwort } from "./leinwand-stato.js";`. `:301–304` Vorher `const erwartet = serializeBildo(gestaltenDe(agordo, { start, kabloj: {}, palettes, rev: 1 }));` Nachher `const erwartet = serializeLeinwandAntwort(gestaltenDe(agordo, { start, kabloj: {}, palettes, rev: 1 }), null);`. Grund: R-3, die Antwort trägt jetzt immer `stato` (ohne Datei `null`); die Bytes sind sonst gleich.
- Keine weitere Änderung; `grafeo-wirksam-054` (Prüfsummen der Vorschau-Routen) und `grafeo-vorschau-054` unverändert grün.

### LNS-2.2: für den PR-Text

- Leinwand-Zustand je Marke in `marken/<name>/leinwand.json` (kanonisch, `version: 1`, `knoten[]`, `kabloj`), nie im Agordo. Gespeichert nach Ziehen, Lösen/Stecken, Hinzufügen/Entfernen einer weiteren Vorschau; zusammengefasst je Animationsframe, höchstens eine Anfrage unterwegs, ohne Timer.
- `GET /api/leinwand` liefert zusätzlich `stato` (und `statoUnlesbar`) und wendet ohne `kabloj`-Parameter die `kabloj` der Datei an (R-3: Bytes ändern sich, eine Testzeile angepasst). Neu `PUT`/`DELETE /api/marko/:name/leinwand-stato`.
- Kopfleiste: „Anordnung zurücksetzen“, ruhige Zeile bei unlesbarer Datei, „gespeichert HH:MM“ gilt auch für den Zustand.
- Neue Dateien: `packages/metiejo/src/leinwand-stato.ts`, `leinwand-stato-055.test.ts`, `packages/nodredaktilo/src/gestalten/stato.ts`.
- Bündel nach LNS-2.2 (mit LNS-2.1 im Baum): 735 323 / 193 847 Bytes (roh / gzip -6).

### LNS-2.2: Befunde

- **Abweichung (Präzisierung):** ein leerer `kabloj=`-Parameter gilt als „Abfrage mit Agordo-Sicht“ und überstimmt die Datei; nur das Fehlen des Parameters wendet die Datei an. Das braucht der Client, damit ein Nachladen nach „zurücksetzen“ nicht die alte Datei-Sicht zurückholt, bevor das PUT angekommen ist.
- **Abweichung (Zusatz):** `statoAtendi()` im Kontext neben `rekomenci()`. Es hält das Schreiben an, bis `rekomenci()` läuft. LNS-3.1 muss vor `POST …/staende/:id/oeffnen` `await statoAtendi()` und danach **immer** `await rekomenci()` rufen (auch nach einem Fehler, sonst bleibt das Schreiben angehalten).
- D-13 wie geplant: gespeichert wird nur `kabloj`. Ein gelöstes Marke → Farbe-Kabel kommt nach dem Neuladen als „Zeile nicht verbunden“ zurück, ein gelöstes Palette → Vorschau-Kabel gar nicht (es ändert `kabloj` nicht und löst darum auch keinen Schreibvorgang aus). Im Browser nicht eigens durchgespielt.
- Der Schalter hell | dunkel einer weiteren Vorschau ist lokaler Zustand in `nodoj/vorschau.tsx` (keine Zone von LNS-2.2) und wird nicht gespeichert; in der Datei steht das `schema` des Hinzufügens („hell“). Für eine Speicherung bräuchte die Vorschau eine Kontext-Funktion zum Melden des Schemas.
- PUT verwirft unbekannte Knoten-IDs und falsche Typen still (wie der Leser) und antwortet nur auf eine falsche Rahmenform mit 422.
- `kanvaso.tsx` mattiert Farbe-Kanten weiter nur bei `stato === "leer"`, nicht bei „abgeleitet“ (von LNS-2.1 gemeldet, kein Bedarf; unverändert gelassen).
- Der Rundlauftest lädt `stato.ts` über eine Temp-Kopie mit ersetztem Alias-Import, weil nodredaktilo keinen Testläufer hat und `vi.mock` den Paket-Selbstbezug `@fundamento/metiejo/gestalten` nicht auflösen kann.

## LNS-3.1 (T5): Benannte Stände

### LNS-3.1 im Einzelnen

- [x] **Rote Tests zuerst:** `staende-055.test.ts` (19 Tests: 10 rein, 9 über HTTP). Erster Lauf: rot, weil `./staende.js` fehlte („Cannot find module“). Danach `staende.ts` (rein + Rand) ohne Routen: 9 rein grün, alle 9 Routentests rot mit 404 (Routen fehlten), ein reiner Test rot (Slug aus dem vorgeschlagenen Namen statt aus dem eingegebenen, siehe Entscheidung unten). Nach den Routen: 19/0.
- [x] **Gepflanzte Fehler** (je Behauptungsgruppe einer, über `/tmp`-Skript: Datei sichern, ersetzen, `vitest run staende-055`, zurückkopieren, `filecmp` byte-gleich bei allen 18; `git diff` danach nur die gewollten Änderungen). Jeder Fehler machte mindestens einen Test rot:
  P1 Umlaute nicht umgeschrieben (3 rot) · P2 Kollision beginnt bei `-1` · P3 Name nicht getrimmt (3 rot) · P4 `JSON.stringify` statt kanonisch im Vergleich · P5 Agordo des Stands ungeprüft (2 rot) · P6 Sortierung aufsteigend (3 rot) · P7 unlesbare Zeile ohne Namen/Zeit (2 rot) · P8 Neutral-Feld ohne Ableitung · P9 fehlendes `staende/` nicht abgefangen · P10 `leinwand: null` löscht die Datei nicht · P11 Sicherung auch bei gleichem Inhalt (`nun.speco === "mankas" &&`) · P12 Id-Muster nicht geprüft (gültige Stand-Datei unter falscher Id wäre lesbar) · P13 „(1 Problem)“ in der 422-Zeile (2 rot) · P14 Schnappschuss ohne `leinwand.json` (2 rot) · P15 rev nicht erhöht · P16 `leinwand.json` beim Öffnen nicht ersetzt (2 rot) · P17 Sicherung unter dem Namen des Stands · P18 Version nicht geprüft.
  Nicht beobachtbar und daher nicht gepflanzt: `leinwandBildoForigi` nach „Öffnen“ – der Bildo-Cache gilt ohnehin nur für dieselbe rev und dieselben Dateibytes (D-14), „Öffnen“ ändert beides.
- [x] **Neu `packages/metiejo/src/staende.ts`** – rein: `STAND_ID_MUSTRO`, `STAND_NE_MALFERMEBLA_SATZ = "Dieser Stand lässt sich nicht öffnen"`, `STAND_SLUG_LONGO = 48`, `interface Stand`, `type StandLego`, `standSlug`, `standZeitId(zeit)`, `standIdDe(zeit, name, ekzistas)`, `zeitDeId(id)`, `standNomoPropono(zeit)` (= `zeitpunktText`), `standNomo(name?, zeit)`, `sicherungNomo(name)`, `standKrei({zeit, name?, agordo, leinwand, ekzistas})`, `serializeStand`, `standEnhavo(agordo, leinwand)`, `parseStand(teksto)`, `type FarbenDe`, `standZeileDe(id, lego, farbenDe)`, `staendeSortiert`. Rand (über `markoDir`, Namen aus `leinwand-dosieroj.ts`): `farbenDeBases(bases)` (= `markenFarbenDe(agordo, paletrojDe(agordo, bases))`), `staendeListe(workdir, name, farbenDe)`, `standLegi(workdir, name, id)`, `nunaLeinwando(workdir, name)`, `standSkribi(workdir, name, {name?, agordo, leinwand}, zeit)`, `leinwandAnstatauxigi(workdir, name, stato | null, zeit)`.
- [x] **`servilo.ts`**: Import aus `./staende.js` und ein Block für die drei Routen direkt nach `PUT`/`DELETE leinwand-stato`, vor dem Schreibweg `POST …/leinwand` und vor den allgemeinen `/api/marko/*`-Handlern. „Öffnen“: Id-Muster → Marke → Datei → `parseStand` (422) → Vergleich `standEnhavo(entwurf, leinwand.json)` gegen `standEnhavo(stand.agordo, stand.leinwand)` → ggf. Sicherung → `setDraft(…, "regilo")` → `leinwandAnstatauxigi` → `leinwandBildoForigi` → 200.
- [x] **Client:** `gestalten/datumoj.ts` + `staendeFonto`, `staendeSxargi(marko)`, `standKonservi(marko, name?)`, `standMalfermi(marko, id)`, `standZeitTeksto(date)` und die Typen `StaendeRespondo`, `StandKonservo`, `StandMalfermo`. Neu `gestalten/staende.tsx` (`Staende`), eingehängt über den vorhandenen Slot `staende` von `Kapo`; `kapo.tsx` selbst blieb unverändert. `kanvaso.tsx` (Verdrahtung, 2 Zeilen): `import { Staende } from "./staende.js";` und `staende={<Staende dauxrigi={skribilo.dauxrigi} />}`.
- [x] **Läufe:** `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test staende-055 leinwand-stato-055 servilo grafeo-literale-054` → 113 bestanden, 0 rot. `pnpm --filter @fundamento/metiejo lint` grün (1 fremde Warnung `komponentoj.ts:42`), `pnpm --filter @fundamento/nodredaktilo lint` grün, `pnpm --filter @fundamento/nodredaktilo build` → `dist/leinwand.js` 746.11 kB, gzip 197.31 kB (Vite-Anzeige). `pnpm check:privat` PASS. Wortsuche (R-12-Wort, privates Schriften-Repo, Erweiterungsschlüssel, zur Laufzeit aus `oldNames()`) über alle hinzugefügten Zeilen (`git diff -U0 HEAD`) und die drei neuen Dateien: 1 410 Zeilen, 0 / 0 / 0 / 0 / 0 / 0.
- [x] **Browser, Ablauf 4** (eigenes Headless-Chromium-Skript außerhalb des Repos, `packages/cli/dist/index.js metiejo` auf freiem Port mit Temp-Arbeitsordner, 2100×1250; danach Prozess beendet und Ordner gelöscht): leere Liste „Noch kein Stand“; Esc schließt; „Stand speichern“ → Feld mit Vorschlag „15.11.2026, 20:24“ → „Blau kühl“ → ruhig „Stand „Blau kühl“ gespeichert“; Primär rot, Primär und Palette verschoben (Zustand geschrieben); „Stände“ → Zeile „Blau kühl“ mit gestricheltem Akzent → „Öffnen“ → rev+1, Primär `#1f5fbf`, Primär und Palette wieder an den alten Plätzen, ruhig „Stand „Blau kühl“ geöffnet“, gleiche URL (kein Neuladen); Liste: „vor dem Öffnen von „Blau kühl““ (Primär-Feld `rgb(214, 40, 40)`) über „Blau kühl“; Klick außerhalb schließt; eine Stand-Datei mit ungültigem Agordo zeigt „Dieser Stand lässt sich nicht öffnen“ ohne „Öffnen“; `agordo.json` unverändert; nach dem Öffnen wird der Leinwand-Zustand weiter geschrieben (Marke verschoben → `leinwand.json` enthält sie); 0 Seiten- und Konsolenfehler.

### LNS-3.1: geänderte ältere Tests

Keine. `grafeo-literale-054.test.ts` durchsucht den ganzen Ordner `src/gestalten/**` (die Liste `SHELL` prüft nur das Vorhandensein der Schalendateien), daher ist `staende.tsx` ohne Änderung erfasst und grün.

### LNS-3.1: für den PR-Text

- Neu `packages/metiejo/src/staende.ts`, `packages/metiejo/src/staende-055.test.ts`, `packages/nodredaktilo/src/gestalten/staende.tsx`.
- `servilo.ts`: Import aus `./staende.js`; ein Block `GET`/`POST /api/marko/:name/staende` und `POST /api/marko/:name/staende/:id/oeffnen` vor `POST /api/marko/:name/leinwand`.
- `datumoj.ts`: Stände-Funktionen und `standZeitTeksto`. `kanvaso.tsx`: 2 Zeilen Verdrahtung (Import, Slot `staende`).
- Stand-Datei `marken/<name>/staende/<id>.json`, kanonisch: `{ agordo, id, leinwand, name, version: 1, zeit }`; `leinwand` ist der gelesene Inhalt von `leinwand.json` (ohne Datei oder bei unlesbarer Datei `null`).
- Antworten: `GET` 200 `StandZeile[]`; `POST` 201 `{id, name, zeit}`, 400 `{satz}` für einen Körper, der kein Objekt ist, oder `name`, der kein Text ist; „Öffnen“ 200 `{rev, sicherung?}`, 422 `{satz: "Dieser Stand lässt sich nicht öffnen"}`; 404 `{satz}` für unbekannte Marke oder Id und für eine Id außerhalb `^[0-9]{8}T[0-9]{6}Z(-[a-z0-9]+)*$`.

### LNS-3.1: Befunde

- **Slug aus dem eingegebenen Namen:** Ein leerer Name ergibt die Id ohne Slug (`20261115T143210Z`), nicht den Slug des Vorschlags (`…-15-11-2026-14-32`), denn der Vorschlag ist nur die Zeit noch einmal. Der gespeicherte `name` ist der Vorschlag.
- **Unlesbare `leinwand.json` beim Speichern oder Öffnen:** Der Stand hält dann `leinwand: null`; beim Öffnen wird die unlesbare Datei vorher zu `leinwand.unlesbar-<zeit>.json` umbenannt (nie gelöscht), und der Vergleich gilt immer als „ungleich“, es entsteht also eine Sicherung.
- **`lesbar: false`** gilt für eine Datei, die kein JSON-Objekt ist, eine andere Version als 1 hat, `id`/`name`/`zeit` nicht als Text trägt, oder deren Agordo nicht liest. Solche Zeilen zeigen gleich die ruhige Zeile und keinen „Öffnen“-Knopf; Name und Zeit kommen aus der Datei, sonst aus der Id. Dateien in `staende/`, deren Name nicht dem Id-Muster folgt, erscheinen nicht in der Liste (die Markenliste zählt weiter alle `*.json`).
- **`aria-expanded`** ist an `fm-butono` laut Biome und Skemo kein Attribut (die Ero hat kein `expanded`); die Knöpfe tragen wie „+ Knoten“ `data-nr-malfermita="true|false"`. Die Ebenen sind `role="dialog"` mit `aria-label`.
- **`dauxrigi` statt `rekomenci` an zwei Stellen:** `statoAtendi` hält das Schreiben des Zustands an. Nach „Stand speichern“ und nach einem 422 beim Öffnen (der Server hat nichts geändert) läuft das Schreiben über `dauxrigi` weiter, damit eine im Browser noch nicht geschriebene Änderung nicht verworfen wird. Nach einem erfolgreichen Öffnen und nach einem anderen Fehler (Netz, 5xx – der Serverstand ist dann unbekannt) wird `rekomenci()` aufgerufen. Dafür reicht `kanvaso.tsx` `skribilo.dauxrigi` als Prop durch.
- **Name des Stands:** keine Längengrenze (nicht spezifiziert); der Slug ist auf 48 Zeichen begrenzt.
- Die Liste rechnet je Stand einmal `paletrojDe` (wie vorgegeben); bei vielen Ständen wächst die Antwortzeit linear.

## LNS-4.1 (T7): Tests gesamt, eroj, Bilder, Bericht-Entwurf

### LNS-4.1 im Einzelnen

### LNS-4.1: geänderte ältere Tests

### LNS-4.1: für den PR-Text

### LNS-4.1: Befunde

## LNS-5.1 (T8): PR, Push, Dispatch, Bericht

### LNS-5.1 im Einzelnen
