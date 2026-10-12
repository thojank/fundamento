# Aufgaben – Spec 008 Ligilo

**Plan:** [`plan.md`](plan.md) (D-01–D-16) · **Datum:** 2026-10-12 (Nachtschicht) · **Basis:** `main` @ `c0901e3` · **Branch:** `261012-spec-008-ligilo-ae9abb` · **PR:** siehe Bericht am Ende

**Regel für jede Aufgabe (Art. X):** Rot zuerst – Test oder Fixture schreiben, laufen lassen, Scheitern aus dem erwarteten Grund beobachten, Befehl und Zusicherung in die Commit-Nachricht. Dann Grün. Fertig, wenn `pnpm build && pnpm test && pnpm lint` und jedes `check:*` grün sind. Ids nur aus `pnpm id:new`. Pfade relativ zu `packages/modelo/src/`, wenn nichts anderes steht.

## A – Rot zuerst: Fehlerfixtures (A7, D-16)

- [x] **T001 Fixtures** `test/fixtures/invalid/skemo-web-term` (Prop `href`), `skemo-inline-underline` (Teil `underline`, `inline` + `hover` → `none`), `skemo-external-unmarked` (`external` ohne `a11y.texts`), `uzo-instead-kialo-missing`, `uzo-boundary-covered` (zwei Eroj: `butono` mit `navigation: ask-human`, ein `ligilo` mit Absicht `navigate` auf denselben Wörtern).
  - Rot: `pnpm --filter @fundamento/modelo exec vitest run src/validate/validate-modelo.test.ts src/contracts/contracts.test.ts` – „expected rule skemo-web-term … not reported“ je Fixture; `contracts.test.ts` kennt die Regel-Ids nicht. `uzo-instead-kialo-missing`: Rot durch Mutation (D-16).
  - Rot beobachtet in Commit `a3760b5` (Fixtures ohne Regeln: drei Fixtures `valid: true`, `skemo-inline-underline` meldete `skemo-token-missing` für `none`, `contracts.test.ts` kannte die Regel-Ids nicht; Mutation für `uzo-instead-kialo-missing` im Commit-Text). Grün in `29e47bb` (skemo-web-term, uzo-boundary-covered) und `5caa06d` (link-not-color-only, external-link-marked).

## B – Modelo

- [x] **T002 Schema (D-02, D-03, D-04, D-06, D-07)**: `SkemoA11y.texts`, `UzoLayout.wrap` += `with-text`, `EroInstance.lingvo`, `UzoContent.check` += `not-instead`; Beschreibung der Schlüsselwörter `inherit`/`none` an `SkemoPartSource.fixed` und `SkemoBinding.token`. `generate:types`. MCP-Kopie `get_ero.output.json` (`wrap`).
  - Rot: `contracts/schema.test.ts` (eine Skemo mit `a11y.texts`, eine Uzo mit `wrap: with-text`, eine Instanz mit `lingvo` sind gültig) rot gegen das alte Schema.
- [x] **T003 Regeln der Skemo (D-03, D-13)**: `BINDING_KEYWORDS` in `skemo-rules.ts`; `skemo-web-term`; `skemo-a11y-invalid`; Regel-Ids in `contracts/issues.ts`.
  - Rot: T001 (`skemo-web-term`), neue Unit-Tests in `eroj/skemo-rules.test.ts` (ein Token `inherit` meldet kein `skemo-token-missing`; `a11y.texts.foo` ohne boolesche Prop `foo` meldet `skemo-a11y-invalid`).
- [x] **T004 Regeln der Uzo (D-14)**: `uzo-boundary-covered` in `uzo-rules.ts`.
  - Rot: T001 (`uzo-boundary-covered`).
- [x] **T005 Reguloj und Enforcer (D-13)**: fünf Reguloj in `reguloj.json` (Ids `pnpm id:new regulo --count 5`), `touch-target-min` Klausel, `spacing-owned-by-container` appliesTo; `link-not-color-only` und `external-link-marked` in `REGULO_ENFORCERS`; `USAGE_ENFORCERS` für die drei Text-Regeln.
  - Rot: T001 (`skemo-inline-underline`, `skemo-external-unmarked` erwarten die Regulo-Namen); `data/regularo-repo.test.ts` (jede automatische Regulo hat einen Enforcer) rot nach dem Eintrag in `reguloj.json`.
- [x] **T006 `ligilo/skemo.json` und `uzo.json` (D-01, D-05, D-10)**: Ids `pnpm id:new ero`, `skemo`, `uzo`; neuer Datentest `data/ligilo.test.ts` (Props, Zustände, Slots, Teile, Bindungen nur Rollen, `a11y.texts` de/en, Uzo-Grenzen, Layout `with-text`, drei Text-Regeln).
  - Rot: `data/ligilo.test.ts` rot (Ero fehlt); `checks/regularo` würde `skemo-uzo-missing` melden, wenn die Uzo fehlte (Mutation im Lauf beobachtet).
- [x] **T007 Jugxoj und KontrastParoj**: 12 Jugxoj (`pnpm id:new jugxo --count 13`, eine für Figma-`underline`, D-11), 3 KontrastParoj (`pnpm id:new kontrastParo --count 3`).
  - Rot: `uzo-content-example-missing` für die drei Text-Regeln am Repo (T006 ohne T007); `data/ligilo.test.ts` „approved ergibt keine Verletzung, rejected genau eine“ rot.
- [x] **T008 `butono`-Uzo nachgezogen (A4, D-14)**: `navigation` → `use-instead: ligilo`, Kialo-Ende „Fundamento covers it with ligilo.“; `data/butono.test.ts` umgestellt (`use-instead`, `appliesTo` enthält `butono`).
  - Rot: `uzo-boundary-covered` am Repo (nach T004 und T006, vor T008): die alte Grenze zeigt `ask-human` auf ein Ero, das es gibt.
- [x] **T009 Ontologio (D-15)**: Schema `eroj` in `ontologio.schema.json` und `ontologio.json`, Konzepte `#Butono`, `#Ligilo`; Drift-Prüfung `ero-concept-missing/-extra` in `ontologio/check.ts`.
  - Rot: `ontologio/check.test.ts`: ein Modelo mit zwei Eroj und einer Ontologio ohne `#Ligilo` meldet `ero-concept-missing`; `describe_term ligilo` antwortet.
- [x] **T010 Export und Zähl-Tests**: Beschreibungssatz „two Eroj (`butono`, `ligilo`)“, `uzoj` mit zwei Einträgen, `check:regularo` `uzoj=2`, `list_eroj` zwei Einträge, `allowed`-Listen, `knownGoals` mit `navigate`, `external`; `RULE_IDS`-Länge.
  - Rot: die genannten Tests nach T006 rot; umgestellt auf Schleifen oder die neuen Werte.

## C – Gvidanto

- [x] **T011 `check_usage` (D-06, D-07, D-04)**: `not-instead`, `lingvo`, `with-text` in `eroj/usage.ts`.
  - Rot: `gvidanto/check-usage.test.ts`: S2 („hier klicken“ → `link-label-names-destination`, Lösung „Projektübersicht öffnen“), S3 („Speichern“ → `link-navigates-button-acts` mit `use-instead` und `butono`), `lingvo: "en"` → englisches Beispiel; `with-text`: Umbruch in Container `text` erlaubt, ohne Container Verstoß.
- [x] **T012 `suggest_ero` (D-08)**: Grenze `use-instead: X` + Absicht von X → Absicht und Grenze, kein `ask-human`.
  - Rot: `gvidanto/suggest-ero.test.ts`: „Zur Übersicht“ und „zur Projektübersicht“ → `suggestion.ero = ligilo`, `boundary.action = use-instead`; „Übersicht speichern“ → weiterhin `ask-human` mit zwei Kandidaten (Grenze `navigation` → ligilo, Absicht `confirm` → butono); „Dokumentation“ → `ligilo` mit `external: true`; „Speichern“ → `butono`, `confirm`.
- [x] **T013 Prompt Regel 13 (`use-instead`)**.
  - Rot: `packages/mcp/src/prompt.test.ts`.
- [x] **T014 `brief` gemessen**: `packages/mcp/src/eroj-tools.test.ts` misst jedes Ero; Wert unter „Messungen“.

## D – Projekcioj

- [x] **T015 Web Component (D-09)**: Element-Vorlage nach `a11y.role`; `to → href`; `rel`; `aria-describedby`; Icon-Fallback; Zustände `visited`, `focus`; `underline`; `inherit`, `none`; `with-text` → `:host { display: inline }`; keine Regel für Zustände ohne eigene Bindung.
  - Rot: `celoj/web-component/web-component.test.ts`: das Stylesheet des `ligilo` enthält `text-decoration-line: underline` für `inline` und `:hover` bei `standalone`, `:visited`; das Element des `ligilo` rendert `<a part="control">`; das Stylesheet des `butono` ist byte-gleich mit `main` (Snapshot vor der Änderung).
- [x] **T016 React**: `Ligilo` aus derselben Erzeugung; Typentest `test/types/ligilo.tsx`.
- [x] **T017 Figma (D-11)**: `underline` je Variante, `textDecoration` im Plugin und Double, `FIGMA_NOT_DRAWN.underline`, Fokus-Radien aus dem ersten Ero mit Radius, `inherit` → `typography.body.1`, kein `radii` ohne Radius.
  - Rot: `celoj/figma/figma.test.ts` (Plan hat zwei Sets; `ligilo` Variante `placement=standalone,size=medium,state=hover` hat `underline: true`, `state=rest` `false`); `plugin.test.ts` (Double schreibt `textDecoration`).
- [x] **T018 Make Kit (D-12)**: Wortlaut aus der Skemo; `components/ligilo.md` ohne handgeschriebene Zeile.
  - Rot: `celoj/make-kit/make-kit.test.ts`: `components/ligilo.md` existiert, enthält „Which ligilo for which goal“, keinen Button-Satz; Inventar für `ligilo`.
- [x] **T019 Vitrino (D-12)**: Abschnitt je Ero; `datumoj.eroj`.
  - Rot: `celoj/vitrino/datumoj.test.ts`, `vitrino.test.ts`: Abschnitt `fm-vitrino-ligilo` mit `<fm-ligilo` und Spalte `external`.
- [x] **T020 Parität**: `projekcioj/src/parity.test.ts` für zwei Eroj; eine absichtlich abweichende Prop (`placement` im React-Typ) lässt sie scheitern.

## E – Eroj im Browser

- [x] **T021 `packages/eroj/test/ligilo.spec.ts`**: Rolle `link`, Name aus Slot und `label`-Prop, `href` aus `to`, `rel` und Beschreibung bei `external` (de und en nach `lang`), Tab und Enter, kein `disabled`, Fokusring, berechnete Stile `placement × size × state` (rest, hover, pressed, focus, visited? – `visited` ist im Test nicht erzeugbar, wird ausgenommen) gleich den gebundenen Tokens in `komuna` und `ekzemplo`, Trefferfläche ≥ 24 px bei `standalone` in jeder Dichte, Unterstreichung bei `inline` in jedem Zustand.
- [x] **T022 Alirebleco (A6)**: `alirebleco.check.ts` für `ligilo` (axe auf `placement × size` in rest/hover/pressed, external, Fokusring ≥ 3:1) in `komuna`/`ekzemplo` × light/dark × default/high.
- [x] **T023 Internacia (A6)**: `internacia.spec.ts`: RTL (`icon-end` links), +35 %/200 % Text bei `standalone` ohne Clipping, Pseudo-Lokalisierung; `inline` bricht mit dem Text um.

## F – Abschluss

- [x] **T024 e2e `packages/mcp/src/e2e/s008-ligilo.test.ts`**: S1–S3 und der Beispiel-Dialog gegen den Server; `s007-uzo.test.ts` S1 auf `use-instead` umgestellt. Mutationsprüfung: `ero: ligilo` in der `butono`-Grenze geändert → Test rot.
- [x] **T025 Vojmapo Zeile 4 (A8)** mit Spec 008 und dem Satz „Jedes neue Ero schließt, wo es kann, eine Grenze eines bestehenden Ero (Grenze → use-instead).“; `docs.test.ts` pinnt ihn (Rot zuerst).
- [x] **T026 CI grün**, Bericht nach Auftragsformat; Messwerte unten.

## Messungen

| Was | Wert |
|---|---|
| `get_ero ligilo brief:true`, Bytes / `ceil(Bytes/3)` | 1 485 Bytes / **495** (Grenze 750; `packages/mcp/src/eroj-tools.test.ts` misst beide Eroj) |
| `get_ero butono brief:true` (Vergleich) | 1 709 Bytes / 570 (Spec 007 M-4: 1 721 / 574; die Grenze `navigation` trägt jetzt `ero: ligilo`, der Kialo ist kürzer) |
| Parität (`pnpm check:parity`) | 2 Eroj, 4 Seiten (web-component, react, figma, guidelines/komuna), 0 Differenzen, 258 benannte Freigaben (icon des butono, icon und underline des ligilo) |
| Alirebleco (Eroj, `check:alirebleco` Chromium) | ligilo: 8 Kombinationen (komuna, ekzemplo × light, dark × default, high), je 6 placement × size in rest/hover/pressed plus external, Fokusring ≥ 3:1 an 4 Links; butono unverändert 8 |
| Alirebleco (Modelo, `check:alirebleco`) | 66 KontrastParoj × 72 Kombinationen, min 4.22:1; `link-rest-on-background-canvas` min 6.12, `link-hover` 8.58, `link-visited` 11.53 |
| `check:regularo` | PASS, `uzoj=2`, keine Warnung `skemo-uzo-missing` |
| Rote Fixtures beobachtet in Commit | `a3760b5`; Schema rot `fa75b9e` (Commit-Text); Datentests, suggest_ero und uzo-boundary-covered am Repo rot vor `5caa06d`; Web Component rot vor `dec9899`; Figma/Make-Kit/Vitrino rot vor `dcbec22`; Ontologio, describe_term, e2e, Vojmapo rot vor `27898d2` (je Commit-Text) |
