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

### LNS-2.1: geänderte ältere Tests

### LNS-2.1: für den PR-Text

### LNS-2.1: Befunde

## LNS-2.2 (T4): Leinwand-Zustand

### LNS-2.2 im Einzelnen

### LNS-2.2: geänderte ältere Tests

### LNS-2.2: für den PR-Text

### LNS-2.2: Befunde

## LNS-3.1 (T5): Benannte Stände

### LNS-3.1 im Einzelnen

### LNS-3.1: geänderte ältere Tests

### LNS-3.1: für den PR-Text

### LNS-3.1: Befunde

## LNS-4.1 (T7): Tests gesamt, eroj, Bilder, Bericht-Entwurf

### LNS-4.1 im Einzelnen

### LNS-4.1: geänderte ältere Tests

### LNS-4.1: für den PR-Text

### LNS-4.1: Befunde

## LNS-5.1 (T8): PR, Push, Dispatch, Bericht

### LNS-5.1 im Einzelnen
