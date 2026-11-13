# Spec 053 – Aufgaben (leere Aktion: `label-required` geschärft)

**Spec:** [`spec.md`](spec.md) · **Technische Spec:** [`technische-spec.md`](technische-spec.md) · **Basis:** `main` `433b40b4` · **Branch:** `261113-leere-aktion-ist-rot-la-32abef`

Vier Tickets in drei Phasen. LA-2.1 und LA-2.2 laufen parallel auf getrennten Dateien. Keine Commits, kein Push, kein PR in den Tickets.

| Ticket | Phase | Inhalt | hängt ab von | Stand |
|---|---|---|---|---|
| LA-1.1 | 1 Kern (Modelo) | Rote Tests, Modelo-Daten, Enforcer, Kurzprofil `hidden` | – | erledigt 2026-11-13 |
| LA-2.1 | 2 Folgen | Fremde Erwartungen (AC-20) außerhalb von `packages/modelo`, Beispiel-Renderer (Make Kit, Vitrino) | LA-1.1 | erledigt 2026-11-13 |
| LA-2.2 | 2 Folgen | Neubewertung M-1 ohne Modell (Skript, Daten, Bericht) | LA-1.1 | erledigt 2026-11-13 |
| LA-3.1 | 3 Tests | Integrationstests über alle ACs, lokales Gate, AC-Matrix | LA-2.1, LA-2.2 | erledigt 2026-11-13 |

## LA-1.1 im Einzelnen

### Spec-Ordner

- `spec.md` (16 649 Byte, SHA-256 `f69d556a…9b09`) und `technische-spec.md` (6 295 Byte, SHA-256 `fb9b9661…c9c6`) sind mit `cp` aus den Vorlagen des Feature-Ordners kopiert, `cmp` Exit 0. Sie werden nie editiert.

### Rote Tests zuerst

Neue Testdatei `packages/modelo/src/data/leere-aktion-053.test.ts`, geschrieben und ausgeführt **vor** jeder Änderung an Daten und Code (Stand `433b40b4`, nur die Testdatei neu).

Befehl: `cd packages/modelo && FM_AUSGABE=knapp pnpm exec vitest run src/data/leere-aktion-053.test.ts`

Ergebnis: **10 bestanden, 15 rot**. Rot waren (Zeilennummern des Rot-Laufs, vor dem Formatieren):

| Zeile | Test | Grund rot |
|---|---|---|
| :89 | the Regulo keeps its ID and applies to butono and ligilo; statement and scope name the icon slots | `appliesTo` = `["butono"]` |
| :102 | the ligilo has the boundary no-accessible-label via label-required, last like the butono's | Boundary fehlt |
| :113 | the Skemo of butono and ligilo says label is never shown (shown: false) | `shown` fehlt |
| :148 | butono: the brief has `{ name: "label", type: "string", hidden: true }` | kein `hidden` |
| :148 | ligilo: the brief has `{ name: "label", type: "string", hidden: true }` | kein `hidden` |
| :175 | AC-1: `<fm-butono type="submit" label="Anmelden">` gives one error with the new message | kein Fund |
| :189 | AC-2: `<fm-ligilo slot="brand" to="anmelden.html" label="Team Nord">` gives the same for ligilo | kein Fund |
| :243 | AC-5: ligilo without text and label prop stays the unchanged finding, with or without an icon | Regulo gilt nicht für ligilo |
| :262 | AC-6: blank text or `&nbsp;` counts as empty, and so does a blank label prop | kein Fund |
| :287 | AC-7: both messages start as ekranoj's rondoj.ts reads them and name the instance | ligilo ohne Fund |
| :302 | edge cases: the automatic icon of download or external and the state of the instance do not count | kein Fund |
| :339 | AC-8: label-required: anmelden butono + ligilo, konto und passwort-vergessen ligilo, registrieren ligilo + butono | `[]` statt der Funde |
| :374 | AC-11: the approved icon-only example keeps its ID and decision and fills icon-start | kein Slot |
| :383 | AC-11: a rejected example for butono and for ligilo, each giving exactly one label-required error | Jugxoj fehlen |
| :410 | AC-11: an approved Jugxo on the Regulo records the tightening | Jugxo fehlt |

Schon vor der Änderung grün (Wächter, die grün bleiben müssen): AC-3 (Markup und `check_usage`), AC-4, AC-5 butono, AC-5 Vorschlag des butono byte-gleich, AC-8 `label-names-action` unverändert, AC-12 `label-names-action` byte-gleich (SHA-256 der Daten von `433b40b4`), Kampo behält `shown: true`, Liste der vier M-1-Screens.

MCP-Ausgabeschema (AC-14): Mit dem neuen Kurzprofil und dem Schema von `433b40b4` ist `cd packages/mcp && FM_AUSGABE=knapp pnpm exec vitest run src/eroj-tools.test.ts` rot (**3 rot**: `answers with the generated brief, equal to getEro with brief`, `butono stays under the ceiling of 750`, `ligilo stays under the ceiling of 750`; Ajv: `/props/…` „must NOT have additional properties: hidden“). Mit `hidden` im Schema grün (Gegenprobe durch Zurücksetzen nur dieser Datei auf `HEAD`, danach wiederhergestellt).

### Umsetzung

- **Enforcer** `packages/modelo/src/eroj/usage.ts` (`label-required`): sichtbarer Text ist nur `instance.label` (getrimmt nicht leer; `trim()` entfernt auch U+00A0), nicht `textOf`. Sonst zählt `props.label` nur neben einem gefüllten Icon-Slot (`hasIcon`: Slots des Skemo mit `decorative: true` und Namen `icon-*`, `instance.slots[name]` mit mindestens einem Eintrag). Neuer Fund „only the label prop“; der Fund „neither“ bleibt, das Substantiv des Vorschlags kommt aus `a11y.role` (butono byte-gleich, ligilo „link“). Schwere bleibt Standard `error`.
- **Kurzprofil** `packages/modelo/src/gvidanto/eroj.ts`: `shown === false` → `hidden: true` (Reihenfolge `name, type, hidden`), Typ `hidden?: true`. `packages/mcp/schema/tools/get_ero.output.json` kennt `hidden` (`const: true`).
- **Daten**: `reguloj.json` (`label-required`: Satz, Kialo, Scope, `appliesTo` butono + ligilo, ID unverändert); `eroj/ligilo/uzo.json` (Boundary `no-accessible-label` → `not-supported` via `label-required`, am Ende wie beim butono); `eroj/{butono,ligilo}/skemo.json` (`label.shown: false`); `jugxoj.json` (eine korrigiert, drei neu); `ids.lock.json` (drei IDs aus `pnpm id:new jugxo --count 3`: `jug_01M7B5VZCCMPZKVEKX9TJPTHVV`, `jug_01M7B5VZCD0PDHJF8CPCHYJH6E`, `jug_01M7B5VZCD0PDHJF8CPCHYJH6F`); `tradukoj.json` (`de`: Satz und Kialo der Regulo, neue ligilo-Boundary-Kialo, gekürzter `purpose` des butono, siehe AC-15).
- **Jugxoj**: `jug_01M2XN0Q7YGPVYC981A9D98PT3` (approved, „icon-only button“) bekommt `"slots": { "icon-start": ["icon"] }`, ID, Entscheidung, Kialo, Datum bleiben, Kontext um einen Satz ergänzt. Neu: `jug_01M7B5VZCCMPZKVEKX9TJPTHVV` (rejected, butono `label: "Konto speichern"`, Q-1), `jug_01M7B5VZCD0PDHJF8CPCHYJH6E` (rejected, ligilo `label: "Team Nord"`), `jug_01M7B5VZCD0PDHJF8CPCHYJH6F` (approved, `ref.regulo` = `label-required`, deutsche Kialo: Verschärfung, F-052-4, Wirkung F 4/4 → 0/4, Datum 2026-11-13).
- **CHANGELOG.md** › Unveröffentlicht: eine Zeile unter „Hinweis für Nutzer“ (strengere Prüfung), eine unter „Hinweis für MCP-Clients“ (`hidden` im Kurzprofil).

### Abweichungen von der Implementierungs-Spec

1. **Q-6, Form des Icons im korrigierten Beispiel:** `"icon-start": ["icon"]` statt `[{ "ero": "ikono" }]`. Grund: Die Uzo des butono hat für `icon-start` `nesting: 0`; jede Ero-Angabe in diesem Slot gibt `uzo-slot-nesting` (`usage.ts`, `uzoFindings`). Mit `{ ero: "ikono" }` wäre das CORRECT-Beispiel ungültig (AC-11 verlangt keine Funde; der Sweep `butono.test.ts:94` verlangt `[]` für approved). `"icon"` ist die Form, die ein direkter `check_usage`-Aufrufer gibt, und wird angenommen. Für LA-2.1 (Q-5): Das Beispiel trägt `"icon"`, keinen Ero-Namen und keine Glyphe.
2. **Befund (nicht behoben, außerhalb des Tickets):** `check_markup` auf `<fm-butono label="Schließen"><fm-ikono slot="icon-start" name="close"></fm-ikono></fm-butono>` (ebenso `fm-ligilo` mit `fm-ikono` in `icon-start`) meldet schon auf `433b40b4` `uzo-slot-nesting` (error), obwohl die Uzo `ikono` in `icon-start` annimmt (`accepts: ["icon", "ikono"]`, `nesting: 0`). Der Icon-Knopf in Markup ist damit rot, nicht wegen `label-required`. Kandidat für eine Folge-Spec (`nesting` von `icon-start`/`icon-end` oder die Zählung eines Blatt-Ero als Verschachtelung).
3. **AC-15, gekürzter deutscher Text:** `get_ero butono` mit `fields: [brief, slots, constraints]`, `lingvo: "de"`, lag mit `hidden` bei 751 (2 251 Zeichen) und schob `constraints` in `rest` (`eroj-runde-7.test.ts:126` rot). Gekürzt wie in Spec 046 D-38 nur ein deutscher Text der butono in `tradukoj.json`: `uzo_01M4RPK0VYYXNCF41ME86Q4Z8P/purpose` „… bricht ab oder löscht etwas hier; …“ → „… bricht ab oder löscht; …“ („in dieser Ansicht“ sagt schon „hier“). Englisch unverändert. Die Obergrenze 750 bleibt.
4. **Ort der roten Tests:** `src/data/leere-aktion-053.test.ts` (wie `beschriftung-035.test.ts`) statt `src/eroj/`; die Spec lässt die Wahl.

### Gemessen (JSON-Länge / 3, aufgerundet)

| Antwort | vorher (`433b40b4`) | nachher |
|---|---|---|
| `get_ero butono` `brief` (en) | 588 | 592 |
| `get_ero butono` `brief` (de) | 589 | 590 |
| `get_ero ligilo` `brief` (en) | 362 | 366 |
| `get_ero butono` `fields: [brief, slots, constraints]` (de) | 746 | 747 (ohne `rest`) |
| `get_ero butono` `fields: [brief, slots, constraints]` (en) | 737 | 742 |
| `get_ero kampo` `brief` (en, größtes Kurzprofil) | 747 | 747 (unverändert) |

### Testläufe LA-1.1

| Befehl | Ergebnis |
|---|---|
| `pnpm --filter @fundamento/modelo build && pnpm id:new jugxo --count 3` | 3 IDs, in `ids.lock.json` geschrieben |
| `cd packages/modelo && FM_AUSGABE=knapp pnpm exec vitest run src/data/leere-aktion-053.test.ts` | vorher 10 bestanden / 15 rot, nachher 25 bestanden / 0 rot |
| `cd packages/modelo && FM_AUSGABE=knapp pnpm exec vitest run src/eroj src/gvidanto src/data src/lingvo src/validate src/ids` | nach Daten und Code: 9 rot (die erzwungenen Erwartungen unten); nach der Anpassung 2 825 bestanden / 0 rot |
| `cd packages/modelo && FM_AUSGABE=knapp pnpm exec vitest run` (ganzes Paket) | 4 979 bestanden / 0 rot (der bekannte fremde Fehler `src/ci/turbo-inputs.test.ts:679` trat in diesem Lauf nicht auf) |
| `cd packages/mcp && FM_AUSGABE=knapp pnpm exec vitest run src/eroj-tools.test.ts src/get-ero-doku.test.ts` | 51 bestanden / 0 rot |
| `pnpm vortaro:ero-tokenoj --check` | Exit 0 („Nothing would change.“) |
| `npx biome check <geänderte Dateien>` | sauber |
| `cd packages/modelo && npx tsc --noEmit -p tsconfig.json` | sauber |

## Angepasste fremde Erwartungen (AC-20)

Jede Anpassung ändert nur eine erwartete Bewertung oder einen Bezug, nie eine Schwelle, Toleranz oder Obergrenze.

### packages/modelo (LA-1.1)

| Datei:Zeile | vorher | nachher | Grund |
|---|---|---|---|
| `packages/modelo/src/data/beschriftung.test.ts:61-62` | `expect(label?.shown).toBeUndefined()` | `expect(label?.shown).toBe(false)` | AC-13: das Skemo sagt `shown: false` ausdrücklich |
| `packages/modelo/src/data/beschriftung.test.ts:72-73` | butono-Kurzprofil enthält `{ name: "label", type: "string" }` | `{ name: "label", type: "string", hidden: true }` | AC-14 |
| `packages/modelo/src/data/butono.test.ts:104-109` | `expect(jugxo.ref).toEqual({ ero: butono?.ero.id })` | `ref` gleich der Ero der Instanzen des Beispiels | `label-required` gilt auch für ligilo; das rejected-Beispiel des ligilo verweist auf den ligilo. Bewertung (Regeln, Schwere, `valid`) unverändert geprüft |
| `packages/modelo/src/data/ligilo.test.ts:193-194` | drei Boundaries | + `["no-accessible-label", "not-supported", { regulo: "label-required" }]` | AC-10 |
| `packages/modelo/src/eroj/usage.test.ts:83-89` | `label-required` `appliesTo` = `["butono"]` | `["butono", "ligilo"]` (Tabelle `widened`) | AC-9 |
| `packages/modelo/src/gvidanto/eroj.test.ts:97-98` | `get_ero butono` trägt 20 Beispiele | 21 | AC-11: neues rejected-Beispiel des butono |
| `packages/modelo/src/gvidanto/eroj.test.ts:388-389` | erwartete Props des Kurzprofils mit `shown` | + `hidden: true` bei `shown === false` | AC-14 |
| `packages/modelo/test/fixtures/gvidanto/get-ero-bezug-479c5ad4.json:10, :27` | `butono` `0d7571fb…f0ea`, `ligilo` `3fa5e7ef…20c8` | `butono` `f8488fab…4bb4`, `ligilo` `bf717da0…c80c` | Byte-Anker von `eroj-fields.test.ts:636` (Spec 038 D-286). Neu berechnet mit derselben Vorschrift wie der Test, nur diese zwei Einträge ersetzt (Präzedenz Spec 046 D-42/T6). Alle 38 übrigen Hashes unverändert, also jede andere `get_ero`-Antwort byte-gleich |

### Außerhalb von packages/modelo (für LA-2.1)

In LA-1.1 nur beobachtet, nicht angepasst:

- `packages/mcp/src/kontrakto-038.test.ts:101` (`every catalog entry answers with the bytes of the Bezug`) ist rot, erwartet (Kurzprofile, Beispiele, Regulo-Texte).
- `packages/mcp/src/e2e/s007-uzo.test.ts`, `s008-ligilo.test.ts`, `s014-overlays.test.ts`: grün.
- nordstelo, ekranoj, projekcioj, metiejo: in LA-1.1 nicht ausgeführt.

### Außerhalb von packages/modelo (LA-2.1)

Jede Anpassung ändert nur eine erwartete Bewertung oder einen Bezug, nie eine Schwelle, Toleranz, Obergrenze oder Zeitgrenze. Fakten und Markup gespeicherter Läufe bleiben byte-gleich.

| Datei:Zeile | vorher | nachher | Grund |
|---|---|---|---|
| `packages/nordstelo/test/fixtures/kuroj/anmeldung-F-1/rezulto.json:9, :14, :16-19` | `K3: 1`, `total: 95`, `gaps` = `[a11y color-contrast]` | `K3: 0.6667`, `total: 90`, `gaps` = `[regulo label-required, a11y color-contrast]` | AC-1: `pagxo.html:8` ist `<fm-butono type="submit" emphasis="high" label="Anmelden"></fm-butono>`. Neu berechnet wie `src/rescore.test.ts` (`scoreBoth(...).antauxa`). Gespeichertes Agentenergebnis, kein sauberer Screen: `fakto.json` (SHA-256 `5897eb0f…5de0`) und `pagxo.html` (`d7faa887…676b`) byte-gleich |
| `packages/nordstelo/test/fixtures/ac8/kuroj-anmeldung-F-1.json:7-13, :49, :101-117` | `K3: 1`, `reguloGaps: []`, `urteil.valid: true` | `K3: 0.6667`, `reguloGaps` + `{ kind: "regulo", key: "label-required" }`, `urteil.valid: false` + Verstoß `label-required` (error, `instances#/2`, „has only the label prop "Anmelden" …“) | AC-1. Datei aus der Ausgabe von `generi.mjs` übernommen (Wegwerfkopie außerhalb des Repos, s. u.); der Unterschied zur Repo-Datei sind genau diese Zeilen, `facts`/`faktoPfad` und `instancoj` unverändert |
| `packages/nordstelo/test/fixtures/ac8/link-ero.json:47-53, :89-108` | `K3: 1`, `reguloGaps: []`, `urteil.valid: true`, `violations: []` | `K3: 0.6667`, `reguloGaps` + `label-required`, `urteil.valid: false` + Verstoß `label-required` (error, `instances#/1`, „Instance 1 of ligilo has neither a visible label nor a label prop.“) | AC-9 (`label-required` gilt jetzt für ligilo). Die synthetischen Fakten behalten `<span slot="label">Details anzeigen</span>` ohne Übernahme in den Default-Slot; `instancojElElementoj` leitet daraus `texts.label` ab, und `label-required` zählt nur `instance.label` (Spec 2.2, wie beim butono seit Spec 003). `check_markup` (mit `adoptDefault`) und gerenderte Fakten sind nicht betroffen. Entscheidung Architekt: Option A, nur die abgeleitete Bewertung anpassen, `facts` und `instancoj` byte-gleich (der Ableitungs-Wächter von AC-8 bleibt). `K3`/`reguloGaps` aus `generi.mjs`; `urteil` wie der Test ihn rechnet (`instancojElElementoj` + `checkUsage`), weil `generi.mjs` hier einen Zwilling mit Übernahme nutzt („check_usage of the twin and score() differ“). Folgekandidat siehe unten |
| `packages/mcp/test/fixtures/kontrakto/describe.json:5-7` (`describe/standard`) | `a773ba73…`, 1 882 B | `a97bb91c…`, 1 882 B | Fingerabdruck des geänderten Modelo |
| `packages/mcp/test/fixtures/kontrakto/list_reguloj.json:5-6` (`list_reguloj/standard`) | `492caacd…`, 49 469 B | `d2473f66…`, 49 907 B | AC-9: Satz, Kialo, Scope, `appliesTo` von `label-required` |
| `packages/mcp/test/fixtures/kontrakto/list_jugxoj.json:5-6` (`list_jugxoj/standard`) | `9a6db726…`, 184 442 B | `bb2d9e76…`, 187 201 B | AC-11: eine Jugxo korrigiert, drei neu |
| `packages/mcp/test/fixtures/kontrakto/get_ero.json:100-102` (`get_ero/butono-brief`) | `ee746136…`, 1 762 B | `672690c2…`, 1 776 B | AC-14: `hidden: true` |
| `packages/mcp/test/fixtures/kontrakto/get_ero.json:109-110` (`get_ero/butono-voll`) | `719effbc…`, 40 635 B | `9e98c8ec…`, 42 788 B | AC-11, AC-14: Beispiele, Regulo, `hidden` |
| `packages/mcp/test/fixtures/kontrakto/get_ero.json:370-372` (`get_ero/ligilo-brief`) | `2b0a37b1…`, 1 028 B | `c6cb2ab3…`, 1 098 B | AC-10, AC-14: Boundary `no-accessible-label`, `hidden` |
| `packages/mcp/test/fixtures/kontrakto/get_ero.json:379-380` (`get_ero/ligilo-voll`) | `92314f04…`, 25 098 B | `8a60d05a…`, 27 221 B | AC-9 bis AC-11, AC-14 |

**Weg der Vertrags-Fixtures (Präzedenz `9ee8d430`, Spec 046 T6):** `kontrakto-038.test.ts:101` meldete genau die sieben Einträge oben rot. Erzeugt mit einer Wegwerfkopie von `packages/mcp/test/kontrakto/generi.mjs` außerhalb des Repos (`/tmp`), die `list_arangxoj` und `check_markup` überspringt (kein Katalogeintrag auf `main`) und `ac8-quellen` aus dem Repo liest, gegen den gebauten Checkout, Ziel `/tmp`. Übernommen sind nur die sieben roten Einträge; jeder andere Eintrag derselben vier Dateien ist in der Ausgabe byte-gleich zum Repo (geprüft). `index.json`, `tool-names.json`, `input-schemas.json` und `prompt-gvidanto.txt` bleiben. Die ekranoj-AC-8-Ausgabe ist byte-gleich zum Repo.

**Geprüft, unberührt (keine Änderung):** `packages/nordstelo/test/fixtures/k8/{anmelden-m1,konto-m1,konto-m1-plena}` und `packages/eroj/test/interspacoj-052.spec.ts` (nur K8, Byte-Kopien von M-1; `src/k8/k8.test.ts` grün); `packages/nordstelo/test/fixtures/ablauf-038/**` (`src/ablauf/komparo-038.test.ts` grün); die ekranoj-Doubles `src/rondoj.test.ts`, `src/lauf5-integra.test.ts` und `packages/ekranoj/test/fixtures/ac8/*` (grün, `generi.mjs` gibt dieselben Bytes); `packages/mcp/src/e2e/s007-uzo`, `s008-ligilo`, `s014-overlays` (grün); `packages/metiejo/src/grafeo-kialo-049.test.ts` (grün); `packages/mcp/test/fixtures/kontrakto/check_usage.json` (grün). `git diff` über diese Pfade ist leer.

**Beispiel-Renderer (Q-5):** Make Kit (`exampleBlock`) und Vitrino-Doku (`markupOf`) schreiben die gefüllten Slots einer Beispiel-Instanz als Kinder mit ihrem `slot`-Attribut, gemeinsam aus `packages/projekcioj/src/celoj/make-kit/ekzemplo.ts` (eigenes Modul, weil `doku.ts` → `make-kit.ts` → `build.ts` → `figma.ts` → `datumoj.ts` einen Importzyklus bildet). `{ ero: X }` → `<fm-X slot="…"></fm-X>`. `"icon"` → das Ero, mit dem jedes Icon geschrieben wird (Spec 014 ②, aus den Skemoj wie die Icon-Zeile der Guidelines: Rolle `img`, kein Avatar, mit Uzo → `ikono`), **ohne** `name`: das Beispiel nennt keine Glyphe, also wird keine erfunden; gibt es kein Icon-Ero, ein leeres `<svg slot="…" aria-hidden="true">`. `"text"` → nichts, seine Wörter stehen in `texts` (das Make Kit schreibt sie schon). Ergebnis für `jug_01M2XN0Q7YGPVYC981A9D98PT3` (CORRECT): `<fm-butono emphasis="low" size="small" label="Schließen"><fm-ikono slot="icon-start"></fm-ikono></fm-butono>`. Byte-Gleichheit belegt: Make-Kit-Guidelines und Doku aller Eroj mit dem alten und dem neuen Renderer auf denselben Daten erzeugt und mit `diff -r` verglichen; einziger Unterschied ist diese eine Zeile in `make-kit/komuna/guidelines/components/butono.md` und der eine `<li>` in der butono-Doku. Kein Test zählt Beispiele pro Ero über die Renderer hinaus (`doku.test.ts` liest die IDs aus `examplesOf`), also keine erzwungene Anpassung. Neue Tests: `make-kit.test.ts` › „Make Kit examples show the filled slots of an instance (Spec 053)“ (6 Fälle), `doku.test.ts` › „shows the icon-only butono example with its icon in icon-start“.

**Folgekandidaten aus LA-2.1 (nicht behoben):**
- Text im ausdrücklich benannten Default-Slot (`<span slot="label">`) ohne Übernahme (synthetische Fakten durch `score()`/`instancojElElementoj`, direkte `check_usage`-Aufrufer mit `texts.label`) zählt für `label-required` nicht als sichtbarer Text. Betrifft den butono schon vor Spec 053, jetzt auch den ligilo (`link-ero`). `check_markup` und gerenderte Fakten sind nicht betroffen.
- Das CORRECT-Beispiel im Markup (`<fm-ikono slot="icon-start">` im butono) meldet in `check_markup` weiter `uzo-slot-nesting` (LA-1.1, Abweichung 2); `"icon"` hat keine Markup-Form, die `check_markup` als `"icon"` zurückliest (ein `<svg>` wird `"text"` und gibt `uzo-slot-accepts`).

### Testläufe LA-2.1 (`FM_AUSGABE=knapp`, nacheinander)

| Befehl | Ergebnis |
|---|---|
| `cd packages/projekcioj && pnpm exec vitest run src/celoj/make-kit src/celoj/vitrino` | vor der Änderung 356/0; nachher 363 bestanden / 0 rot |
| `cd packages/nordstelo && pnpm exec vitest run src/rescore.test.ts src/ac8.test.ts src/score.test.ts src/kerno-038.test.ts src/ablauf/komparo-038.test.ts src/k8/k8.test.ts` | vorher 62/3 rot (`rescore` anmeldung-F-1, `ac8` K3/Gaps und Urteil für kuroj-anmeldung-F-1 und link-ero); nachher 65 bestanden / 0 rot |
| `cd packages/mcp && pnpm exec vitest run src/kontrakto-038.test.ts src/eroj-tools.test.ts src/e2e/s007-uzo.test.ts src/e2e/s008-ligilo.test.ts src/e2e/s014-overlays.test.ts src/gvidanto-038.test.ts` | vorher `kontrakto-038.test.ts:101` rot (7 Einträge); nachher 109 bestanden / 0 rot |
| `cd packages/ekranoj && pnpm exec vitest run src/rondoj.test.ts src/instancoj.test.ts src/kontroli-markon.test.ts src/verda.test.ts` | 84 bestanden / 0 rot (keine Änderung nötig) |
| `cd packages/metiejo && pnpm exec vitest run src/grafeo-kialo-049.test.ts` | 8 bestanden / 0 rot (keine Änderung nötig) |
| ganze Pakete: nordstelo / mcp / ekranoj / projekcioj / metiejo | 367/0 · 508/0 · 301/0 · 1 568/0 (1 übersprungen: `plugin-bauformen-bild.test.ts:282`, `runIf FM_BILD_ZEIGEN`, vorbestehend) · 686/0 |
| `npx biome check` (geänderte Dateien), `cd packages/projekcioj && npx tsc -p tsconfig.json --noEmit` | sauber |

## LA-3.1 im Einzelnen

### Neue Tests

- **`packages/mcp/src/e2e/s053-leere-aktion.test.ts`** (11 Tests): gegen den echten Server im Prozess (`test-doubles/client.js`, jede Antwort gegen das Ausgabeschema des Tools geprüft), served Modelo wie `connectGvidanto` (ohne Konfiguration). Die Fragmente stehen inline; `ANMELDEN` ist byte-gleich zu `specs/050-mvp-probelauf/daten/m1/F/anmelden/fragmento.html` (einmal von Hand mit `node` verglichen), der Test liest nichts unter `specs/`.
- **`packages/nordstelo/src/neubewertung-053.test.ts`** (12 Tests): liest `specs/053-leere-aktion/daten/neubewertung/m1`, `specs/052-k8-interspacoj/daten/neubewertung/m1`, `specs/050-mvp-probelauf/daten/m1/*/*/fragmento.html` und den Text von `specs/053-leere-aktion/neubewertung.mjs`. Jede Zahl (Screens je Variante) kommt aus den Daten. Der Drift-Wächter vergleicht in der Form von `stabilaJson` (die gespeicherten Dateien haben sortierte Schlüssel). Der Text-Wächter zu AC-19 passt zum Muster des Skripts: statische `import … from` nur `node:*`; genau ein dynamisches `import(` im Helfer `dist`; jedes `dist("…")`-Ziel ist `packages/{modelo,ekranoj,nordstelo}/dist/…js`; kein `require`, `createRequire`, `fetch`, keine URL, kein Anbietername.
- **`turbo.json`** › `@fundamento/nordstelo#test` › `inputs`: `$TURBO_ROOT$/specs/050-mvp-probelauf/daten/**`, `$TURBO_ROOT$/specs/052-k8-interspacoj/daten/neubewertung/**`, `$TURBO_ROOT$/specs/053-leere-aktion/**`. Gegenprobe: ohne die drei Zeilen meldet `modelo/src/ci/turbo-inputs.test.ts` vier ungedeckte Lesezugriffe von `neubewertung-053.test.ts` (`:32` 050, `:35` 052, `:38` 053-Daten, `:41` `neubewertung.mjs`), mit ihnen 8/0.
- **`neubewertung.md`** › Abschnitt 7: Punkte (4) (keine Markup-Form des Icon-only-Beispiels besteht `check_markup`: `fm-ikono` → `uzo-slot-nesting`, `svg` → `uzo-slot-accepts`, beides auf diesem Build nachgeprüft) und (5) (Text in `<span slot="label">` zählt für direkte `check_usage`-/`score()`-Aufrufer nicht; butono vorbestehend, jetzt auch ligilo) ergänzt, Abschnitt 8 „fünf Punkte“. Danach `node specs/050-mvp-probelauf/pruefen.mjs --daten specs/053-leere-aktion/daten/neubewertung --bericht specs/053-leere-aktion/neubewertung.md`: Exit 0, „bericht.md stimmt“, Bericht byte-gleich (der Abschnitt `pruefen` war schon aktuell).

### Abweichungen LA-3.1

1. `turbo.json` bekommt zusätzlich `$TURBO_ROOT$/specs/052-k8-interspacoj/daten/neubewertung/**`: „0 mit den Gründen von 052“ (AC-17) wird gegen die gespeicherten 052-Daten gerechnet, nicht als Liste abgeschrieben. Ohne diese Zeile meldet `turbo-inputs.test.ts` den Lesezugriff.
2. Icon-only im Markup (AC-3, P): geprüft wird nur, dass kein `label-required` kommt; der vorbestehende `uzo-slot-nesting` bleibt (Abschnitt 7 (3)/(4) von `neubewertung.md`). Ohne Fehler insgesamt prüft P den Icon-Knopf über `check_usage` mit `["icon"]`.
3. Lokales Gate nicht ganz grün: projekcioj nur wegen Zeitgrenzen unter fremder Last (siehe Tabelle). Kein Fix nötig, keine Zeitgrenze geändert.

### AC-Matrix

M = `packages/modelo/src/data/leere-aktion-053.test.ts`, P = `packages/mcp/src/e2e/s053-leere-aktion.test.ts`, N = `packages/nordstelo/src/neubewertung-053.test.ts`. Rot-vorher-Belege: Abschnitt „Rote Tests zuerst“ (LA-1.1, 15 rot / 10 grün vor der Änderung; MCP-Ausgabeschema 3 rot ohne `hidden`). P und N sind nach der Umsetzung geschrieben; sie sichern das integrierte Ergebnis in der CI.

| AC | Test (Datei › Name) oder Befehl |
|---|---|
| AC-1 | M › „AC-1: `<fm-butono type="submit" label="Anmelden">` gives one error with the new message“ (vorher rot) · P › „check_markup on the anmelden screen of M-1 F“ › „gives two label-required errors, ligilo and butono, with the new message and suggestion“ |
| AC-2 | M › „AC-2: `<fm-ligilo slot="brand" to="anmelden.html" label="Team Nord">` gives the same for ligilo“ (vorher rot) · P › dasselbe wie AC-1 (Instanz `ligilo`, `instances#/0`) |
| AC-3 | M › „AC-3: the label prop next to a filled icon slot is the icon-only action (markup)“ und das `it.each` über butono/ligilo mit `check_usage` · P › „the icon-only action passes label-required (AC-3)“ (3 Tests: `check_markup` mit `fm-ikono` in `icon-start` ohne `label-required`; `check_usage` mit `icon-start`/`icon-end` = `["icon"]` ohne Fehler; Gegenprobe ohne Icon gibt den neuen Fehler) |
| AC-4 | M › „AC-4: text of the element passes, with or without the label prop“ · P › „finds no label-required for an action with text in the element (AC-4)“ |
| AC-5 | M › `it.each` „AC-5: … stays the unchanged finding, with or without an icon“ (ligilo vorher rot), „AC-5: the butono's suggestion of the unchanged case is byte-identical“ · P › „butono and ligilo use the same message shape in both cases“ (Fall „neither“) |
| AC-6 | M › „AC-6: blank text or &nbsp; counts as empty, and so does a blank label prop“ (vorher rot) |
| AC-7 | M › „AC-7: both messages start as ekranoj's rondoj.ts reads them and name the instance“ (vorher rot) · P › „check_usage and check_markup agree on the same instances (AC-7)“ (gleiche `label-required`-Funde mit `rule`, `severity`, `message`, `suggestion`, `regulo` für die Instanzen aus `check_markup`; butono und ligilo gleiche Form, nur Ero und Substantiv verschieden) |
| AC-8 | M › „Spec 053 on the stored fragments of M-1 F (AC-8)“ (3 Tests, Funde vorher rot) · N › „the findings of the stored data (AC-8)“ (3 Tests) und „check_markup on every unchanged fragmento.html of M-1 gives the stored malobservoj“ (Drift-Wächter, alle 8 Screens) |
| AC-9 | M › „the Regulo keeps its ID and applies to butono and ligilo; statement and scope name the icon slots“ (vorher rot) · `packages/modelo/src/eroj/usage.test.ts` (Tabelle `widened`) · `pnpm check:regularo` |
| AC-10 | M › „the ligilo has the boundary no-accessible-label via label-required, last like the butono's“ (vorher rot) · `packages/modelo/src/data/ligilo.test.ts` (Boundaries) · `pnpm check:dokumentaro` |
| AC-11 | M › „Spec 053 Jugxoj (AC-11)“ (3 Tests, vorher rot) · `packages/modelo/src/data/butono.test.ts` (Sweep der Beispiele) · `pnpm check:regularo` (jede Jugxo verweist auf Bestehendes) |
| AC-12 | M › „label-names-action stays byte-identical: the Regulo and the Uzo entries (AC-12)“ · P › „keeps label-names-action a warning on the empty Anmelden button (AC-12)“ · N › „keeps the label-names-action warnings of 052 byte-identical“ |
| AC-13 | M › „the Skemo of butono and ligilo says label is never shown (shown: false); the fields keep shown: true“ (vorher rot) · `packages/modelo/src/data/beschriftung.test.ts` |
| AC-14 | M › `it.each` „%s: the brief has { name: "label", type: "string", hidden: true }“ (vorher rot) · P › `it.each` „%s: the brief carries { name: label, type: string, hidden: true }, within the output schema“ und „the kampo keeps shown: true …“ · `packages/mcp/src/eroj-tools.test.ts` (Ausgabeschema, vorher 3 rot) |
| AC-15 | `packages/modelo/src/gvidanto/eroj.test.ts` › „every brief stays under 750; the largest is the kampo's“ · `packages/modelo/src/gvidanto/eroj-runde-7.test.ts` › „answers all three fields without rest, below 750“ · `packages/mcp/src/eroj-tools.test.ts` (`BRIEF_LIMIT = 750`, „butono/ligilo stays under the ceiling of 750“) · Messung in „Gemessen“ oben |
| AC-16 | `node specs/053-leere-aktion/neubewertung.mjs` (LA-2.2, Selbstprüfungen a–c) · N › Drift-Wächter und „changes nothing but malobservoj and the score: fakto, kompleta and zusatz are those of 052“ |
| AC-17 | N › „green after the tightening (AC-17)“ (F: 052 alle grün, jetzt keiner, `malhelpoj` genau `["check_usage"]`; 0: keiner grün, `malhelpoj` wie 052, ohne `check_usage`; `gespeichert`/`verdaEkde` passen) und „holds one stored screen per fragmento.html of M-1 …“ · Bericht `neubewertung.md` |
| AC-18 | `node specs/050-mvp-probelauf/pruefen.mjs --daten specs/053-leere-aktion/daten/neubewertung --ohne-bericht` → Exit 0, `grün: m1 F 0/4 - · m1 0 0/4 -`; mit `--bericht specs/053-leere-aktion/neubewertung.md` → Exit 0, „bericht.md stimmt“ (LA-3.1, nach der Ergänzung von Abschnitt 7) |
| AC-19 | N › „neubewertung.mjs runs no model (AC-19, text guard)“ (3 Tests) |
| AC-20 | Abschnitt „Angepasste fremde Erwartungen (AC-20)“ oben (LA-1.1, LA-2.1); grün in den ganzen Paketläufen unten (`rescore.test.ts`, `ac8.test.ts`, `kontrakto-038.test.ts`, …). LA-3.1 hat keine ältere Erwartung geändert |
| AC-21 | Lokales Gate unten; die CI selbst läuft nach dem Push des Maintainers |

### Lokales Gate (AC-21, nacheinander, `FM_AUSGABE=knapp`)

Rechnerlast während der Läufe hoch und nicht von diesem Lauf (`uptime` load average 19 bis 149 auf 10 Kernen, andere Prozesse).

| Befehl | Ergebnis |
|---|---|
| `cd packages/mcp && pnpm exec vitest run src/e2e/s053-leere-aktion.test.ts` | 11 bestanden / 0 rot |
| `cd packages/nordstelo && pnpm exec vitest run src/neubewertung-053.test.ts` | 12 bestanden / 0 rot |
| `cd packages/modelo && pnpm exec vitest run src/ci/turbo-inputs.test.ts` | 8 bestanden / 0 rot (kein neuer ungedeckter Lesezugriff; der bekannte fremde Fehler `:679` trat nicht auf) |
| `cd packages/modelo && pnpm exec vitest run` | 4 979 bestanden / 0 rot (`:679` trat nicht auf) |
| `cd packages/mcp && pnpm exec vitest run` | 519 bestanden / 0 rot (508 + 11 neue) |
| `cd packages/nordstelo && pnpm exec vitest run` | 379 bestanden / 0 rot (367 + 12 neue) |
| `cd packages/ekranoj && pnpm exec vitest run` | 301 bestanden / 0 rot |
| `cd packages/projekcioj && pnpm exec vitest run` | **nicht grün, nur Zeitgrenzen unter Last.** Drei volle Läufe: (1) 1 563 / 1 rot / 6 übersprungen, (2) ebenso, 539 s: jeweils `src/celoj/figma/figma-cxiuj.test.ts:32` „Hook timed out in 180000ms“ (die 5 Tests der Datei dadurch übersprungen); (3) 558 s, load average 75 → 32: 1 559 / 5 rot / 6 übersprungen, zusätzlich `src/build.test.ts:41`, `:49` und `src/fonto/komuna-fonto.test.ts:182`, `:206` mit „Test timed out in 60000ms“. Kein Assertion-Fehler. Die drei Dateien allein: 23 bestanden / 0 rot in 66 s (`figma-cxiuj` allein vorher 5/0 in 57 s). Keine dieser Dateien ist von Spec 053 geändert; LA-2.1 hatte das ganze Paket mit 1 568 / 0 grün. Keine Zeitgrenze angehoben. Bitte das Paket bei normaler Last oder in der CI erneut laufen lassen; die 6 Übersprungenen sind die 5 Tests der Datei mit dem Hook-Timeout plus `plugin-bauformen-bild.test.ts:282` (`runIf FM_BILD_ZEIGEN`, vorbestehend) |
| `pnpm lint` | Exit 0 (22 Tasks; `@fundamento/eroj` meldet 1 warning und 1 info, vorbestehend, keine Datei von `packages/eroj` geändert) |
| `pnpm check:regularo` | PASS, 86 Reguloj, 238 Jugxoj, 0 Fehler, 0 Warnungen |
| `pnpm check:dokumentaro` | PASS, 45 Eroj, 0 Fehler, 0 Warnungen |
| `pnpm vortaro:ero-tokenoj --check` | Exit 0, „Nothing would change.“ (1 715 Ero-Tokens) |
| `grep -rn "\.only(\|\.skip("` über alle geänderten und neuen Testdateien | keine Treffer |
| `node specs/050-mvp-probelauf/pruefen.mjs --daten specs/053-leere-aktion/daten/neubewertung --ohne-bericht` | Exit 0, `grün: m1 F 0/4 - · m1 0 0/4 -` |
| `npx biome check` (neue Dateien), `npx tsc -p tsconfig.json --noEmit` (mcp, nordstelo) | sauber |

Nicht lokal gelaufen (Spec 4): die Playwright-Suiten (eroj, make-kit, vitrino), die Zeit-Tests, `pnpm test:betroffen`. Keine Zeitgrenze, Schwelle oder Obergrenze geändert; kein `.only`/`.skip`.
