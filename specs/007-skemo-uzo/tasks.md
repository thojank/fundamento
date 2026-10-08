# Aufgaben – Spec 007

**Plan:** [`plan.md`](plan.md) (D-01–D-14, OP-1–OP-16) · **Datenmodell:** [`data-model.md`](data-model.md) · **Verträge:** [`contracts/mcp-tools.md`](contracts/mcp-tools.md) · **Stand:** Entwurf zur Prüfung durch den Maintainer, nichts umgesetzt · **Datum:** 2026-10-08 · **Basis:** `main` @ `8d1870e`

Drei Stränge mit je einem PR (plan, „Voraussetzung Spec 003“):

| Strang | Aufgaben | Wann |
|---|---|---|
| **Stufe A** | T001–T017 | jetzt möglich; berührt keine Ausgabe, die M1 bis M3 von Spec 003 prüfen |
| **F1** | F1-T01–F1-T06 | nach der Abnahme von Spec 003, eigener PR |
| **Stufe B** | T019–T031 | nach der Abnahme von Spec 003 und nach dem Merge von F1 |

**Regel für jede Aufgabe, ohne Ausnahme (Art. X, Jugxo `jug_01M2VRT7KQ77W91MVXB4GXSRZ4`):**
1. **Rot:** Erst die unter *Rot* genannten Tests und Fixtures schreiben und laufen lassen, **bevor es Umsetzungscode gibt**. Dabei beobachten, dass sie aus dem erwarteten Grund scheitern. Den scheiternden Befehl und eine scheiternde Zusicherung in die Commit-Nachricht schreiben. Ein nachträglicher Rotlauf zählt nicht.
2. **Grün:** umsetzen, bis die Tests der Aufgabe und alle bestehenden Tests grün sind.
3. **Fertig, wenn:** `pnpm build && pnpm test && pnpm lint` und jedes `check:*` grün sind und Export und Projekcioj über zwei Builds byte-gleich bleiben. Neue Ids kommen nur aus `pnpm id:new`.

Testläufe auf Paketebene laufen über turbo oder nach `pnpm build`, nie gegen ein altes `dist` (Vojmapo, „CI, Gültigkeit vor Dauer“). Pfade sind relativ zu `packages/modelo/src/`, wenn nichts anderes steht. `[P]` heißt: parallel zu den anderen `[P]`-Aufgaben derselben Stufe möglich, weil die Dateien getrennt sind.

**Wie das Rot der Fixtures beobachtet wird (T001–T009):** Jedes Verzeichnis unter `test/fixtures/invalid/` mit `vortaro/`, `data/` und `expected-issues.json` wird von `modeloValidationFixtures()` gefunden und in `validate/validate-modelo.test.ts` gegen `validateModelo` geprüft. Der Lader kennt `uzo.json` heute nicht und meldet nichts. Befehl: `pnpm build && pnpm --filter @fundamento/modelo exec vitest run src/validate/validate-modelo.test.ts -t <fixture>`. Erwartetes Rot: Die erwartete Regel `uzo-…` fehlt in der Liste der gemeldeten Issues (`expected [] to deep equal [ { rule: 'uzo-…', path: … } ]`). Zusätzlich lässt `contracts/contracts.test.ts` eine unbekannte Regel-Id rot werden, bis sie in `contracts/issues.ts` steht. Dieses zweite Rot wird mit notiert.

---

## Stufe A – vor der Abnahme von Spec 003

### A.1 Fehlerfixtures (A11), alle zuerst und alle rot

Jede Fixture ist eine Kopie von `test/fixtures/valid/ero-minimal` mit einer `data/eroj/butono/uzo.json` und genau einem Fehler. Die gültige Uzo darin ist die kleinste, die das Schema erlaubt; ihr Wortlaut steht in `valid/ero-uzo-minimal` (T011).

- [ ] **T001 [P] Fixture `invalid/uzo-skemo-missing`** (A1, data-model §2.2)
  - Inhalt: ein zweiter Ordner `data/eroj/verknuepfo/` nur mit `uzo.json` (ohne `skemo.json`); `butono` bleibt unverändert, damit die Fixture nur diesen einen Fehler zeigt. Erwartet `uzo-skemo-missing` an `data/eroj/verknuepfo/uzo.json#/uzo/skemo`.
  - Rot: wie oben; heute wird der Ordner ohne `skemo.json` nicht beachtet, und es kommt keine `uzo-…`-Meldung.
- [ ] **T002 [P] Fixture `invalid/uzo-instead-ero-unknown`** (A2)
  - Inhalt: `instead[0].ero: "verknuepfo"`. Erwartet `uzo-ero-unknown` an `#/uzo/instead/0/ero`.
  - Rot: wie oben.
- [ ] **T003 [P] Fixture `invalid/uzo-boundary-kialo-missing`** (A3)
  - Inhalt: `boundary[0]` ohne `kialo`. Erwartet `uzo-kialo-missing` an `#/uzo/boundary/0` (dazu `schema-violation` am selben Ort, wie bei `manko-closing-missing`).
  - Rot: wie oben.
- [ ] **T004 [P] Fixture `invalid/uzo-slot-unknown`** (A5)
  - Inhalt: `slots.badge`. Die Skemo kennt `label`, `icon-start` und `icon-end`. Erwartet `uzo-slot-unknown` an `#/uzo/slots/badge`.
  - Rot: wie oben.
- [ ] **T005 [P] Fixture `invalid/uzo-layout-web-term`** (A6, Art. VIII)
  - Inhalt: `layout.full-width.allowedIn.containers: ["flex"]`. Das Schema lässt freie Containernamen zu, nur der Begriffstest fängt diesen Fehler. Erwartet `uzo-web-term` an `#/uzo/layout/full-width/allowedIn/containers/0`.
  - Rot: wie oben.
- [ ] **T006 [P] Fixture `invalid/uzo-content-fixed-missing`** (A7)
  - Inhalt: `content[0]` ohne `fixed`. Erwartet `uzo-content-fixed-missing` an `#/uzo/content/0` (dazu `schema-violation`).
  - Rot: wie oben.
- [ ] **T007 [P] Fixture `invalid/uzo-content-example-missing`** (A7)
  - Inhalt: `content[0].regulo` nennt eine Regulo der Fixture, zu der es nur eine approved-Jugxo gibt und keine rejected. Erwartet `uzo-content-example-missing` an `#/uzo/content/0/regulo`.
  - Rot: wie oben.
- [ ] **T008 [P] Fixture `invalid/uzo-override-fixed`** (A7, D-03)
  - Inhalt: Kopie von `valid/aspekto-ekzemplo` plus Ero `butono` mit Uzo aus `valid/ero-uzo-minimal`. Das Aspekto-Paket trägt `tavoloj.lingvo.overrides: [{ regulo: <feste Regel>, jugxo: <passende Jugxo> }]`. Erwartet `uzo-override-fixed` an `aspekto-ekzemplo/aspekto.json#/tavoloj/lingvo/overrides/0`.
  - Rot: wie oben. `Tavoloj` ignoriert heute jeden Schlüssel außer `vida`.
- [ ] **T009 [P] Fixture `invalid/uzo-override-jugxo-missing`** (A7, D-03)
  - Inhalt wie T008, aber die Regel ist anpassbar und `jugxo` nennt eine Id, die es nicht gibt. Erwartet `uzo-override-jugxo-missing` an `…/overrides/0/jugxo`.
  - Rot: wie oben.

### A.2 Begriff und Constitution

- [ ] **T010 Constitution v2.1, Ontologio-Begriff Uzo, Entitätstyp `uzo`** (Amendment, A13, D-11). Eigene Aufgabe, ein Commit.
  - Vorher: Versionsnummer gegen den dann aktuellen `main` und alle offenen PRs prüfen (`gh pr list`, Diff auf `.specify/memory/constitution.md`). Ist v2.1 vergeben, die nächste freie nehmen und Plan, Spec-Verweis und diese Aufgabe nachziehen (Lehre aus Spec 005).
  - Rot: `docs/docs.test.ts`: Kopf „Version 2.1“; Terminologio-Zeile **Uzo** mit Verwendung `data/eroj/<ero>/uzo.json`; Änderungshistorie nennt „v2.1 (Spec 007)“ und „Uzo“. `ontologio`-Drift: Die Tabellenzeile allein macht `table-term-missing` rot. Erst danach wird der Ontologio-Begriff geschrieben; ohne Entitätstyp ist `entity-type-missing` rot. `gvidanto/describe-term.test.ts`: `Uzo`, `Gebrauch` und `usage` liefern `#Uzo` mit der Definition aus A13. Jedes dieser Rot wird einzeln beobachtet.
  - Grün: `.specify/memory/constitution.md` (Kopf, Tabelle, Historie; Wortlaut in plan D-11 und spec, Abschnitt Amendment), `data/ontologio.json`, `ENTITY_ID_PREFIXES.uzo = "uzo"`, `ENTITY_TYPES`, Schema `UzoId`. Der Vorschlag zu OP-1 (Abgrenzung zu Art. XIII) wird nach der Entscheidung des Maintainers eingearbeitet.

### A.3 Schema, Laden, Validierung

- [ ] **T011 Schema `UzoFile`/`Uzo`, `Keywords`, Laden und Export-Platz** (A1–A7, D-01, data-model §2.1)
  - Rot: (1) T001–T007 sind rot (A.1). (2) Neu `load/eroj.test.ts`: `valid/ero-uzo-minimal` lädt, `LoadedEro.uzo` ist gesetzt. Rot, weil das Feld fehlt. (3) `export`-Test: Ein Modelo mit Uzo exportiert `uzoj`. Rot. (4) `contracts/type-generation`: Die generierten Typen enthalten `Uzo`. Rot, bis `generate:types` läuft.
  - Grün: `schema/modelo.schema.json` (`UzoFile`, `Uzo`, `UzoInstead`, `UzoBoundary` mit `if/then` für `use-instead`, `UzoComposes`, `UzoSlot`, `UzoLayout`, `UzoContent`, `Keywords`; `SkemoIntent.keywords` → `$ref Keywords`), `generated/modelo-schema.ts`, Lader, Export-Schlüssel `uzoj`. Die Fixtures T003 und T006 werden mit dem Schema grün (`schema-violation`); die eigenen Meldungen kommen mit T012.
  - Fertig: Die Export-Bytes des Repos bleiben gleich, weil es noch keine Uzo gibt (AK-10).
- [ ] **T012 Validierung über das Schema hinaus** (`eroj/uzo-rules.ts`, data-model §2.2)
  - Rot: T001–T004, T006 und T007 rot (eigene Regel-Ids). Neue Unit-Tests in `eroj/uzo-rules.test.ts`, alle rot gegen eine leere Regelfunktion: `uzo-intent-twice`, `uzo-regulo-unknown` (Text-Regel nennt eine Regulo ohne `appliesTo.eroj: [butono]`), `uzo-prop-unknown` (`layout.dense` ist kein boolean-Prop), `uzo-use-instead-ero-missing`.
  - Grün: Regeln in `uzo-rules.ts`, aufgerufen aus `skemo-rules.ts` neben `ekzemploIssues`, Regel-Ids in `contracts/issues.ts`.
- [ ] **T013 [P] Kein Web-Begriff in der Uzo** (A6, D-09)
  - Rot: T005 rot. Dazu ein Property-Test (fast-check wie in `nomreguloj`): Jede CSS-Eigenschaft aus der Liste von `checks/vortaro-lint/css-literal.ts`, an eine beliebige String-Stelle einer gültigen Uzo gesetzt, ergibt `uzo-web-term`. Rot gegen die leere Regel.
  - Grün: `uzo-web-term` liest die vorhandene Liste. Sie wird nicht neu geschrieben.
- [ ] **T014 [P] `EroInstance` mit `aspekto`, `dimensioj`, `slots`** (A5, A6, A10, D-04, data-model §6)
  - Rot: `validate`-Schematest: Eine Jugxo-Beispielinstanz mit `slots: { label: ["text"] }` ist gültig. Heute rot (`additionalProperties`). `gvidanto/check-usage.test.ts`: `aspekto: "gibtsnicht"` ergibt `mcp-input-invalid` mit `allowed` = Aspektoj. Rot.
  - Grün: Schema `EroInstance`, Eingabeprüfung in `check-usage.ts`. **Noch keine Durchsetzung** der Slot- und Layout-Regeln; die kommt in T024 (Stufe B), weil sie Antworten ändert, die M3 prüft.
- [ ] **T015 Überstimmung über `tavoloj.lingvo.overrides`** (A7, D-03, data-model §7)
  - Rot: T008 und T009 rot. Unit-Test in `validate/aspekto-rules.test.ts`: Eine gültige Überstimmung (anpassbare Regel, Jugxo mit `aspekto`, `ref.regulo`, `deviation-recorded`) erzeugt keine Meldung. Fällt der Test schon vor der Umsetzung grün aus, wird er durch eine Mutation geprüft: Im Fixture wird `fixed` auf `true` gesetzt, und der Test muss rot werden.
  - Grün: Schema `Tavoloj.lingvo`, Prüfung beim Zusammensetzen.
- [ ] **T016 Warnung `skemo-uzo-missing`** (A1)
  - Rot: `checks/regularo/index.test.ts`: `valid/ero-minimal` (Skemo ohne Uzo) liefert genau eine Warnung `skemo-uzo-missing` und Exit 0. Rot. Der Lauf über das echte Repo erwartet dieselbe Warnung für `butono`, bis Stufe B die Uzo bringt.
  - Grün: Warnung in `checks/regularo`. Die Statistikzeile nennt `uzoj=0`.
- [ ] **T017 Abschluss Stufe A**
  - `docs/vojmapo.md` Zeile 3c: „Stufe A umgesetzt“. PR „Spec 007 Stufe A“ mit den beobachteten Rotläufen je Aufgabe.
  - Fertig: Export, `get_ero`, Make-Kit-Guidelines und Figma-Plan sind byte-gleich mit `main` (Diff der Build-Ausgaben im PR-Text). Das ist der Beleg, dass Stufe A die Abnahme von Spec 003 nicht berührt.

---

## Tor

- [ ] **T018 Tor: Abnahme Spec 003 (M1, M2, M3) und Merge F1.** Nichts aus Stufe B beginnt vorher.

---

## F1 – Achsennamen am Butono (eigener PR, nach der Abnahme von Spec 003)

Entscheidung F1, Jugxo `jug_01M4DNSD0SV43Y943T21RQF7EM`, plan D-13. Getrennt von A1–A13. Vor F1-T01 entscheidet der Maintainer OP-3 (Art. II) und OP-4 (`intent` zweimal).

- [ ] **F1-T01 Modelo: Skemo, Reguloj, Jugxo-Beispiele, Vortaro-Beschreibungen**
  - Rot: `data/butono.test.ts`: Props `emphasis` (`high|medium|low`, Standard `medium`) und `intent` (`neutral|danger`, Standard `neutral`); `forbiddenBy(skemo, { emphasis: "medium", intent: "danger" })` ist gesetzt. Neu: Kein Wort `variant` oder `tone` kommt in `data/` und `vortaro/sets/` vor. Rot.
  - Grün: `skemo.json` (Props, `by`, `when`, `constraints`, `intents[].props`), Statements der zwei Reguloj, 11 Props in 6 Jugxoj, `$description` in `core.json`. Den Jugxoj wird nichts hinzugefügt; ihre Kialoj bleiben, wie sie sind.
- [ ] **F1-T02 Modelo-Code und Gvidanto**
  - Rot: `eroj/usage.test.ts`, `eroj/skemo-rules.test.ts`, `gvidanto/eroj.test.ts` (`list_eroj` nennt als Varianten die Werte von `emphasis`), `checks/parity/*` mit den neuen Namen. Rot gegen den alten Code.
  - Grün: `usage.ts` (Enforcer und Meldungen), `skemo-rules.ts`, `inventories.ts`, `gvidanto/eroj.ts` (Regel für `EroSummary.variants`, plan D-13), `checks/parity`, `validate/color-reguloj.ts`, `validate/regularo-enforcement.ts`.
- [ ] **F1-T03 Projekcioj: CSS, Web Component, React, Figma, Make Kit, Vitrino**
  - Rot: `packages/eroj/test/*` (Attribute `emphasis`, `intent`), Figma-Plan-Test (Komponenteneigenschaften), Make-Kit-Guidelines-Inventar. Rot.
  - Grün: Generatoren in `packages/projekcioj/src/celoj/*`, Test-Doubles des Plugins.
- [ ] **F1-T04 Fixtures** `invalid/parity-mismatch`, `invalid/skemo-schema`, `valid/ero-minimal`, `valid/parity-equivalent`
  - Rot: Sie laufen nach F1-T01 bis F1-T03 rot (falscher Grund für die Fixture). Sie werden umgeschrieben, bis jede wieder genau ihren eigenen Fehler zeigt.
- [ ] **F1-T05 MCP: Prompt-Regel 8, e2e-Dialoge**
  - Rot: `packages/mcp/src/e2e/*` mit den neuen Namen, `prompt.test.ts`. Rot.
- [ ] **F1-T06 Abschluss F1**
  - Art. II nach Entscheidung OP-3, Vojmapo Phase 4 („umbenannt“ statt „umzubenennen“), Figma-Library und Make Kits neu erzeugen. Der Maintainer prüft in Figma, dass die alte Komponente ersetzt und nicht verdoppelt ist. PR „F1 Achsennamen“.

---

## Stufe B – nach der Abnahme von Spec 003 und nach F1

Die Achsennamen in Stufe B sind die nach F1.

### B.1 Daten

- [ ] **T019 Fünf Reguloj** (A4, A6, A7, data-model §4)
  - Rot: `data/butono.test.ts`: `USAGE_REGULOJ` enthält `full-width-in-action-bar-or-compact`, `label-names-action`, `destructive-label-names-object` und `destructive-label-not-generic`. `spacing-owned-by-container` steht mit `checkability: manual`. Der Test „approved ergibt keine Verletzung, rejected genau eine“ wird damit für vier neue Namen rot (keine Beispiele, keine Enforcer).
  - Grün: Einträge in `reguloj.json` (Ids per `pnpm id:new regulo --count 5`), Enforcer in `USAGE_ENFORCERS` (für T024 vorbereitet, noch nicht über `check_usage` erreichbar).
- [ ] **T020 `butono/uzo.json` und Export** (A1–A6, D-01)
  - Rot: `data/butono.test.ts`: Uzo vorhanden, `boundary` enthält die vier Fälle aus A3, `slots` aus A5, `layout` aus A6. Rot, die Datei fehlt. `checks/regularo`: Die Warnung `skemo-uzo-missing` für `butono` verschwindet. Rot. Der Test „keeps visible strings out“ wird auf die Uzo ausgeweitet.
  - Grün: Datei nach data-model §2.3, Id per `pnpm id:new uzo`. Export-Fixtures neu erzeugt, zwei Builds byte-gleich.
- [ ] **T021 Jugxo-Beispiele je Text-Regel und die zwei geänderten Labels** (A7, data-model §5, §8, OP-5)
  - Rot: `uzo-content-example-missing` für alle drei Text-Regeln am echten Repo (T012). Dazu `data/butono.test.ts`: `…PT1` (approved) verletzt `destructive-label-names-object`. Beide Rot beobachten.
  - Grün: 12 Jugxoj (3 Regeln × approved/rejected × de/en), Ids per `pnpm id:new jugxo --count 12`. Labels von `…PT1` und `…PT2` nach Entscheidung OP-5, mit Vermerk in `context`.

### B.2 Gvidanto

- [ ] **T022 `get_ero` mit `uzo` und `brief`, Messung der Obergrenze** (A8, D-05, D-08, contracts §1)
  - Rot: `gvidanto/eroj.test.ts`: `getEro(butono).uzo.boundary` hat vier Einträge, und die Reguloj sind als `ReguloRef` aufgelöst. `getEro({ name, brief: true })` hat genau die Schlüssel aus contracts §1. `packages/mcp/src/eroj-tools.test.ts`: `ceil(bytes/3) ≤ BRIEF_LIMIT`, mit `BRIEF_LIMIT = 0` als Platzhalter. Alle rot.
  - Messung: erzeugte Kurzfassung messen, Wert nach plan D-08 bestimmen, in `research.md` unter „Messungen“ als M-4 eintragen, `BRIEF_LIMIT` setzen. Danach eine Mutation: ein zusätzlicher `boundary`-Eintrag mit 2 KB Kialo muss den Test brechen.
  - Grün: `gvidanto/eroj.ts`, `packages/mcp/src/schemas.ts` (`brief`), Werkzeugbeschreibung in `describe`.
- [ ] **T023 `suggest_ero` mit Grenze und Alternative** (A2, A3, A9, D-06, contracts §2)
  - Rot: `gvidanto/suggest-ero.test.ts`: „Zur Übersicht“ ergibt `boundary.case = navigation`, `action = ask-human`, `suggestion = null` (S1). „Weiter zur Kasse“ ergibt eine Grenze und nicht `confirm` (OP-12). „umschalten“ ergibt `instead` mit `ero: null`. „Löschen“ ergibt unverändert `destructive`. Ohne Treffer bleibt `intent-unknown`, mit dem neuen `suggestion`-Text. Rot.
  - Grün: `suggest-ero.ts`, Ausgabe-Schema in `packages/mcp/src/schemas.ts`.
- [ ] **T024 `check_usage` prüft den Gebrauch** (A3, A5, A6, A7, A10, D-07, contracts §3)
  - Rot: `gvidanto/check-usage.test.ts` mit den Fällen S2, S3 und S4 aus contracts §3, dazu je ein Fall für `uzo-slot-accepts`, `uzo-slot-max`, `uzo-slot-nesting` und `full-width-in-action-bar-or-compact` (erlaubt mit `container: "action-bar"`, erlaubt mit `dimensioj.viewport: "compact"`, verboten ohne beides). Für S4 trägt die Test-Aspekto `ekzemplo` eine Überstimmung von `label-names-action` mit Jugxo. Alle rot.
  - Grün: `eroj/usage.ts` (Enforcer für Uzo-Regeln, `info` bei Überstimmung), `suggestion` aus dem approved-Beispiel der Regel in der Sprache der Instanz.
- [ ] **T025 Gvidanto-Prompt Regel 12 und Regel 8** (A9, D-12)
  - Rot: `packages/mcp/src/prompt.test.ts`: Regel 12 enthält „ask-human“ und „Do not propose a solution of your own“, Regel 8 nennt `brief` und `uzo`. Rot.
  - Grün: `packages/mcp/prompts/gvidanto.md`.

### B.3 Projekcioj

- [ ] **T026 [P] Make-Kit-Guidelines mit Uzo** (A12, D-10)
  - Rot: `celoj/make-kit/make-kit.test.ts`: `guidelines/components/butono.md` enthält die Abschnitte „Wofür“, „Nicht dafür“, „Zusammen mit“, „Slots“, „Layout“ und „Text“. Jede Grenze steht mit Kialo und Aktion darin, jede Text-Regel mit „fest“ oder „anpassbar“ und je einem approved- und rejected-Beispiel. `guidelinesInventory` kennt die Abschnitte. Rot.
  - Grün: `make-kit.ts`. Keine handgeschriebene Zeile.
- [ ] **T027 [P] Vitrino: Gebrauch je Ero** (A12, S5)
  - Rot: `celoj/vitrino/datumoj.test.ts`: Die Daten der Vitrino enthalten `uzo` von `butono` gleich `getEro(butono).uzo` (eine Quelle, S5). `vitrino.test.ts`: Der Abschnitt wird gerendert. Rot.
  - Grün: `datumoj.ts`, `html.ts`.
- [ ] **T028 [P] Figma: `purpose` als Beschreibung** (A12, D-10)
  - Rot: Figma-Plan-Test: Das Komponentenset `butono` hat `description = uzo.purpose`. Test-Double des Plugins: `description` wird gesetzt. Rot.
  - Grün: `celoj/figma/figma.ts`, `plugin.ts`.
- [ ] **T029 Figma: Slot-Regeln, Grenzen und Text-Regeln versuchen und messen** (A12, D-10, OP-9)
  - Rot: Gegen zwei Doubles, wie in Spec 005 A6: Lehnt das Double eine Eigenschaft ab, meldet der Bericht die Manko als `open`. Nimmt es sie an, meldet er sie als `closed`. Rot, weil der Lauf heute nichts davon versucht.
  - Messung in echtem Figma (Maintainer oder P0 mit dem Testkonto). Erst mit dem Beleg im Wortlaut entstehen die Mankoj in `mankoj.json`, mit Schließbedingung.

### B.4 Abnahme und Abschluss

- [ ] **T030 Szenarien S1 bis S4 und der Beispiel-Dialog gegen den MCP-Server** (Abnahme 3, 4)
  - Rot: `packages/mcp/src/e2e/s007-uzo.test.ts` mit S1 bis S4 über den echten Server (`test-doubles/client.ts`). Der Beispiel-Dialog als Werkzeugfolge: `suggest_ero("zur Projektübersicht")`, dann `ask-human`, dann der Kialo. Bei Rot zuerst prüfen, dass der Test die Werkzeuge über den Server aufruft und nicht direkt. Ist alles aus T022 bis T025 schon da und der Test trotzdem grün, gilt die Mutationsprüfung wie bei AK-09 in Spec 003: Eine geänderte Aktion in der Uzo muss den Test brechen.
- [ ] **T031 Abschluss Stufe B**
  - `docs/vojmapo.md` Zeile 3c (Status), Phase 4 (Uzo je Ero als Pflicht für neue Eroj), Quickstart von Spec 003 erneut ausgeführt (Art. XIII). Abnahme 1 bis 9 der Spec einzeln abgehakt. PR „Spec 007 Stufe B“.
  - Manuell (Maintainer): M1 Dialog in einer frischen Sitzung, M2 S5 an der Vitrino (plan, „Manuelle Abnahme“).

---

## Analyse (statt `/speckit.analyze`)

`/speckit.analyze` ist im Repo nicht installiert (OP-16). Die Prüfung ist von Hand gemacht und folgt den Punkten des Befehls: Abdeckung, Widersprüche, Mehrdeutigkeiten, Constitution.

**Abdeckung.** Jede Anforderung A1 bis A13, das Amendment, F1 und jeder Abnahmepunkt hat mindestens eine Aufgabe (plan, Nachverfolgbarkeit). Abnahme 1 → T022; 2 → T022; 3 → T030, T027, M2; 4 → T030, M1; 5 → T001–T009 mit T011–T015; 6 → T013; 7 → T010; 8 → T010; 9 → bereits mit dieser Lieferung erfüllt (Vojmapo, Commit 3), T031 hält den Status nach. Keine Aufgabe ohne Anforderung.

**Widersprüche zwischen Spec, Constitution und Code** (alle als offene Punkte im Plan, nicht stillschweigend gelöst):

| Fund | Schwere | Ort | Behandlung |
|---|---|---|---|
| „Uzo“ ist im Titel von Art. XIII schon in anderer Bedeutung benutzt | mittel | Constitution | OP-1 |
| F1 macht das Beispiel in Art. II falsch | mittel | Constitution | OP-3, F1-T06 |
| F1-Prop `intent` und `EroInstance.intent`/`Skemo.intents` überschneiden sich | **hoch**: genau die Verwechslung, die F1 vermeiden soll | Code nach F1 | OP-4, vor F1-T01 |
| Feste Text-Regel macht ein bestehendes approved-Beispiel ungültig | hoch: `data/butono.test.ts` bricht | Daten | OP-5, T021 |
| `suggest_ero` liefert ohne Treffer einen Fehler, nicht `null` wie in S1/A9 | niedrig | Spec ↔ Code | OP-6, D-06 |
| Spec-Kopf verlangt die Abnahme von 003 vor allem; der Auftrag erlaubt Vorarbeit | niedrig | Spec ↔ Auftrag | OP-15, Stufe A |
| Research nennt Basis `159ee07`, geprüft ist `8d1870e` | niedrig | Research | OP-11 |

**Mehrdeutigkeiten:** Containervokabular (OP-7), Sprachen in A7 (OP-8), Tokenmaß (OP-13), Navigation gegen Bestätigung (OP-12), `ref` für F3 (OP-2), Enportilo Stufe 1 (OP-10).

**Unterbestimmt in der Spec, im Plan festgelegt:** Prüfung der Text-Regeln ohne Sprachmodell (D-02, data-model §2.3). Ohne die Prüfart `verb-and-object` wäre S4 mit „Weg damit!“ durchgegangen; eine bloße Wortzählung hätte nicht gereicht. Ort der Überstimmung (D-03). Herkunft der Lösung in `check_usage` (D-07).

**Constitution:** Kein Artikel ist verletzt (plan, Constitutional Compliance Review). Art. XI ist mit Complexity Tracking begründet. Art. X: Jede Aufgabe nennt ihr Rot; wo ein Test schon vor der Umsetzung grün sein kann (T015, T030), ist die Mutationsprüfung benannt.

**Reihenfolge:** Die Fixtures T001–T009 stehen vor jedem Schema- oder Regelcode. T010 bündelt Tabelle, Ontologio und Entitätstyp, weil die CI-Drift-Prüfung jeden Zwischenstand rot machen würde. Stufe B beginnt erst nach T018.
