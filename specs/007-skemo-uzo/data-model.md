# Datenmodell – Spec 007, Uzo

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Stand:** Entwurf zur Prüfung durch den Maintainer · **Datum:** 2026-10-08 · **Basis:** `main` @ `8d1870e`

Dieses Dokument legt das Schema von `data/eroj/<ero>/uzo.json` fest, die Änderungen an bestehenden Definitionen und die neuen Regeln im Regelkatalog. Die Texte im Beispiel für `butono` sind ein **Entwurf**. Sie werden mit T014 in die Daten übernommen und dort vom Maintainer geprüft. Wie Skemo und Reguloj sind sie englisch; deutsche und englische Beispiele stehen als Daten in Jugxoj (A7).

## 1. Entitäten (neu oder geändert)

| Entität | Ort | Id | Änderung |
|---|---|---|---|
| **Uzo** | `packages/modelo/data/eroj/<ero>/uzo.json` | `uzo_<ULID>` (neuer Entitätstyp `uzo`, Präfix `uzo`) | neu (A1) |
| Ero | `skemo.json#/ero` | unverändert | `description` bleibt die Kurzfassung (A2) |
| Regulo | `data/reguloj.json` | `reg_` | fünf neue Einträge (§4) |
| Jugxo | `data/jugxoj.json` | `jug_` | Beispiele je Text-Regel (§5); eine geänderte Instanz (§8) |
| EroInstance | Schema `$defs/EroInstance` | – | optional `aspekto`, `dimensioj`, `slots` (§6) |
| Tavoloj | Schema `$defs/Tavoloj` | – | optional `lingvo.overrides` (§7) |
| Ontologio-Begriff **Uzo** | `data/ontologio.json` | URI `…/ontologio#Uzo` | neu (A13) |

Eine Uzo verweist auf ihr Ero und ihre Skemo mit Id. Die Datei liegt neben der Skemo und wird mit ihr geladen. Eine Uzo ohne Skemo ist ungültig, eine Skemo ohne Uzo bleibt gültig und wird als Warnung gemeldet (A1).

## 2. `uzo.json`

### 2.1 Schema (`$defs/UzoFile`, `$defs/Uzo`)

```
UzoFile  = { $schema?, uzo: Uzo }                        additionalProperties: false
Uzo      = {
  id:        UzoId                                       ^uzo_(?:[a-z]{2,8}_)?<ULID>$
  ero:       EroId                                       muss das Ero im selben Ordner sein
  skemo:     SkemoId                                     muss die Skemo dieses Ero sein
  purpose:   NonEmptyText                                ein Satz: wofür das Ero da ist (A2)
  instead:   UzoInstead[]                                darf leer sein
  boundary:  UzoBoundary[]                               minItems 1 (A3: jedes Ero hat eine Grenze)
  composes:  UzoComposes
  slots:     { <Skemo-Slot>: UzoSlot }                   Schlüssel müssen Slots der Skemo sein (A5)
  layout:    UzoLayout
  content:   UzoContent[]                                darf leer sein; für butono mindestens drei (A7)
}

UzoInstead  = { intent: Name, keywords: Keywords, ero: Name | null, kialo: NonEmptyText }
UzoBoundary = { case: Name, action: "use-instead" | "ask-human" | "not-supported",
                ero?: Name,                              Pflicht genau bei action = use-instead
                keywords?: Keywords,                     macht die Grenze für suggest_ero auffindbar (A9)
                via?: { slot: Name } | { layout: "wrap" } | { regulo: Name },
                                                         die Prüfung, die die Grenze in check_usage erkennt (A10)
                kialo: NonEmptyText }
UzoComposes = { containers: { name: Name, kialo: NonEmptyText }[],
                with:  { ero: Name, kialo: NonEmptyText }[],
                never: { ero: Name, kialo: NonEmptyText }[],
                spacing: { owner: "container", regulo: Name } }
UzoSlot     = { accepts?: ("text" | "icon" | <Ero-Name>)[], max?: integer ≥ 1,
                required?: boolean, nesting?: integer ≥ 0 }
UzoLayout   = { size: "content" | "container",
                wrap: "never" | "allowed",
                "full-width"?: { allowedIn: { containers?: Name[], dimensioj?: { <Dimensio>: Name[] } },
                                 regulo: Name } }        Schlüssel muss ein boolean-Prop der Skemo sein
UzoContent  = { regulo: Name, fixed: boolean,            fixed ist Pflicht (A7, Fixture 6)
                when?: { intent: Name[] },               nur für Instanzen mit diesen Skemo-Intents
                check: { kind: "names-intent" }
                     | { kind: "verb-and-object", intent: Name }   ein Schlüsselwort dieses Skemo-Intents und mindestens ein weiteres Wort
                     | { kind: "not-words", words: Keywords } }
Keywords    = wie SkemoIntent.keywords (Sprachcode ^[a-z]{2}$ → nicht leere Wortliste)
```

`Keywords` wird aus `SkemoIntent` als eigene Definition herausgezogen und von beiden benutzt. Das ist die einzige Umstellung an der Skemo, und sie ändert keine Bytes im Export.

**Warum geschlossene Wortmengen in `layout`:** A6 verlangt plattformneutrale Begriffe. Werte aus einer festen Menge (`content`, `container`, `never`, `allowed`) lassen keinen CSS-Begriff zu. Der Test aus A6 prüft zusätzlich alle Zeichenketten der Uzo gegen die Liste der CSS-Eigenschaften und Einheiten, die `check:vortaro-lint` schon kennt. Damit fällt auch ein CSS-Begriff in Kialo, Containernamen oder Schlüsselwörtern auf.

### 2.2 Regeln über das Schema hinaus (Validierung, `eroj/uzo-rules.ts`)

| Regel | Schwere | Fixture (A11) |
|---|---|---|
| `uzo-skemo-missing`: Uzo-Datei ohne `skemo.json` im selben Ordner, oder `uzo.skemo` ≠ Id der Skemo | error | 1 `uzo-skemo-missing` |
| `uzo-ero-unknown`: `instead[].ero`, `boundary[].ero`, `composes.with/never[].ero` oder ein Ero-Name in `slots.*.accepts` nennt ein Ero, das es nicht gibt | error | 2 `uzo-instead-ero-unknown` |
| `uzo-kialo-missing`: ein Eintrag in `instead`, `boundary`, `composes` ohne Kialo (Schema und eigene Meldung, wie `manko-closing-missing`) | error | 3 `uzo-boundary-kialo-missing` |
| `uzo-slot-unknown`: Schlüssel in `slots` ist kein Slot der Skemo | error | 4 `uzo-slot-unknown` |
| `uzo-web-term`: eine Zeichenkette der Uzo ist eine CSS-Eigenschaft, ein CSS-Wert mit Einheit oder ein DOM-Begriff (A6, Art. VIII) | error | 5 `uzo-layout-web-term` |
| `uzo-content-fixed-missing`: Text-Regel ohne `fixed` | error | 6 `uzo-content-fixed-missing` |
| `uzo-content-example-missing`: Text-Regel ohne mindestens eine Jugxo `approved` und eine `rejected` mit `ekzemplo.regulo` = diese Regulo und mit `label` in jeder Instanz, je in `de` und `en` (§5) | error | 7 `uzo-content-example-missing` |
| `uzo-override-fixed`: eine Aspekto überstimmt eine feste Regel | error | 8 `uzo-override-fixed` |
| `uzo-override-jugxo-missing`: eine Aspekto überstimmt ohne Jugxo, oder die Jugxo nennt nicht dieselbe Aspekto und Regulo | error | 9 `uzo-override-jugxo-missing` |
| `uzo-use-instead-ero-missing`: `action: use-instead` ohne `ero` | error | – (Schema, `if/then`) |
| `uzo-intent-twice`: dieselbe Absicht steht in `instead` und als `case` in `boundary` (Art. I) | error | – (Unit-Test) |
| `uzo-regulo-unknown`: `content[].regulo`, `layout.*.regulo`, `composes.spacing.regulo` oder `via.regulo` nennt keine Regulo, deren `appliesTo.eroj` das Ero enthält | error | – (Unit-Test) |
| `uzo-prop-unknown`: Schlüssel in `layout` außer `size`/`wrap` ist kein boolean-Prop der Skemo | error | – (Unit-Test) |
| `skemo-uzo-missing`: Skemo ohne Uzo | **warning** in `check:regularo` | – (Unit-Test mit `valid/ero-minimal`) |

Die neun nummerierten Fixtures sind die aus A11. Sie liegen unter `packages/modelo/test/fixtures/invalid/<name>/`, als Kopie von `valid/ero-minimal` mit genau einem Fehler, und tragen `expected-issues.json` wie die bestehenden Fixtures.

### 2.3 Entwurf für `butono`

```json
{
  "uzo": {
    "id": "uzo_<pnpm id:new uzo>",
    "ero": "ero_01M2XN0PHDBBD6MNFN75DB9NQ5",
    "skemo": "ske_01M2XN0PWS92GP7VFHW161EH0D",
    "purpose": "Starts an action on the current view: it saves, sends, confirms, cancels or deletes something here.",
    "instead": [
      {
        "intent": "toggle",
        "keywords": { "en": ["toggle", "switch", "enable", "disable"], "de": ["umschalten", "einschalten", "ausschalten", "aktivieren", "deaktivieren"] },
        "ero": null,
        "kialo": "A button acts once and forgets; a setting that stays on or off needs a control that shows its state. Fundamento has no such Ero yet."
      },
      {
        "intent": "choose",
        "keywords": { "en": ["choose", "select", "pick"], "de": ["auswählen", "wählen"] },
        "ero": null,
        "kialo": "Choosing one of several values is a selection, not an action; a row of buttons hides which value is chosen. Fundamento has no such Ero yet."
      }
    ],
    "boundary": [
      {
        "case": "navigation",
        "action": "ask-human",
        "keywords": { "en": ["navigate", "go", "open", "overview"], "de": ["zur", "zum", "gehe", "öffnen", "übersicht"] },
        "kialo": "A button starts an action on the current view. Moving to another view is navigation: it is announced differently, and the way back works differently. Fundamento does not cover navigation yet, so a person decides."
      },
      {
        "case": "form-in-slot",
        "action": "not-supported",
        "via": { "slot": "label" },
        "kialo": "A button is one target with one name. Fields inside it cannot be reached on their own, and its name would be the text of every field."
      },
      {
        "case": "multi-line-label",
        "action": "not-supported",
        "via": { "layout": "wrap" },
        "kialo": "A label that breaks into lines no longer reads as one action, and the button grows in height next to its neighbours. Shorten the label instead."
      },
      {
        "case": "no-accessible-label",
        "action": "not-supported",
        "via": { "regulo": "label-required" },
        "kialo": "An action without a name cannot be found by assistive technology or voice control."
      }
    ],
    "composes": {
      "containers": [
        { "name": "dialog", "kialo": "A dialog ends in a decision; its actions close it." },
        { "name": "action-bar", "kialo": "A bar at the end of a view or form holds the actions of that view." },
        { "name": "form", "kialo": "A form ends with the action that sends or saves it." }
      ],
      "with": [
        { "ero": "butono", "kialo": "Actions of one decision stand together, and one primary action leads (one-primary-per-container)." }
      ],
      "never": [],
      "spacing": { "owner": "container", "regulo": "spacing-owned-by-container" }
    },
    "slots": {
      "label": { "accepts": ["text"], "max": 1, "nesting": 0 },
      "icon-start": { "accepts": ["icon"], "max": 1, "nesting": 0 },
      "icon-end": { "accepts": ["icon"], "max": 1, "nesting": 0 }
    },
    "layout": {
      "size": "content",
      "wrap": "never",
      "full-width": {
        "allowedIn": { "containers": ["action-bar"], "dimensioj": { "viewport": ["compact"] } },
        "regulo": "full-width-in-action-bar-or-compact"
      }
    },
    "content": [
      { "regulo": "label-names-action", "fixed": false, "check": { "kind": "names-intent" } },
      { "regulo": "destructive-label-names-object", "fixed": true, "when": { "intent": ["destructive"] }, "check": { "kind": "verb-and-object", "intent": "destructive" } },
      { "regulo": "destructive-label-not-generic", "fixed": true, "when": { "intent": ["destructive"] }, "check": { "kind": "not-words", "words": { "en": ["ok", "okay", "yes"], "de": ["ok", "okay", "ja"] } } }
    ]
  }
}
```

`never` ist leer, weil es neben `butono` noch kein Ero gibt, mit dem es nie zusammenstehen darf. Ein Butono im Butono ist schon über `slots.*.nesting: 0` ausgeschlossen. Phase 4 füllt `never`.

**Wann eine Instanz zerstörend ist (`when.intent`):** wenn `instance.intent` `destructive` ist oder ihr Label ein Schlüsselwort des Skemo-Intents `destructive` enthält. Diese Regel benutzt `destructive-not-primary-color` schon heute (`intentOf`), und sie wird wiederverwendet.

**`verb-and-object`:** Das Label enthält ein Schlüsselwort des genannten Intents (das Verb) und mindestens ein weiteres Wort (den Gegenstand). „Löschen“ verletzt die Regel, ebenso „Weg damit!“, das kein Verb der Zerstörung nennt. „Projekt löschen“ erfüllt sie. Eine bloße Wortzählung hätte „Weg damit!“ durchgelassen und S4 verfehlt.

**`names-intent`:** Das Label enthält ein Schlüsselwort irgendeines Skemo-Intents dieses Ero. Die Schlüsselwörter der Intents sind heute Verben (`löschen`, `speichern`, `abbrechen`, …). Mehr Grammatik prüft Fundamento nicht, weil es kein Sprachmodell benutzt (D-16 aus Spec 003). „Los geht's!“ verletzt die Regel, und genau das macht S4 prüfbar.

## 3. Was die Uzo nicht enthält

- **Keine sichtbaren Texte.** Beispiel-Labels stehen nur in Jugxoj (Test „keeps visible strings out of the Skemo“, ausgeweitet auf die Uzo). Schlüsselwörter sind Suchvokabular wie in `SkemoIntent`, keine Ausgabe.
- **Keine Markenwerte und keine Stimme.** Die Uzo ist markenneutral. Die Stimme einer Marke gehört in die Tavolo `lingvo`; diese Spec legt nur fest, wie eine Aspekto eine anpassbare Regel überstimmt (§7).
- **Keine Web-Begriffe** (Art. VIII), geprüft durch `uzo-web-term`.

## 4. Neue Reguloj (`data/reguloj.json`, `appliesTo.eroj: ["butono"]`)

| Name | Statement (Entwurf) | Kialo (Entwurf) | Prüfbarkeit |
|---|---|---|---|
| `spacing-owned-by-container` | The space between sibling Eroj belongs to their container; an Ero carries no outer spacing. | An Ero does not know its neighbours. If each one brought its own distance, two Eroj side by side would add up their distances, and the rhythm of a view would depend on which Ero stands where. | `manual` (A4) |
| `full-width-in-action-bar-or-compact` | A butono takes the full inline size only in a container of kind action-bar or under viewport=compact. | A full-width button claims the whole row. It reads as the single next step, which is right at the end of a narrow view or in a bar of actions, and wrong anywhere else, where it pushes every other action out of sight. | `automatic` |
| `label-names-action` | The label of a butono names its action as a verb. | A person decides from the label alone what happens on activation. A verb says it; a noun or a mood makes them guess. | `automatic`, **anpassbar** |
| `destructive-label-names-object` | A destructive label names what it destroys. | „Löschen“ alone does not say whether the draft, the project or the account goes. Only the object makes the consequence clear before it cannot be undone. | `automatic`, **fest** |
| `destructive-label-not-generic` | A destructive action is never labelled with a generic confirmation (OK, Ja, Yes). | A generic word confirms whatever the person thinks they are confirming. Before a loss that cannot be undone, the label must say the loss. | `automatic`, **fest** |

Die drei Text-Regeln sind gewöhnliche Reguloj mit Kialo. Ihre Durchsetzung steht in `USAGE_ENFORCERS` (`eroj/usage.ts`), wie bei den bestehenden Ero-Reguloj. Ob eine Text-Regel fest oder anpassbar ist, sagt die Uzo (`content[].fixed`), nicht die Regulo. So steht die Eigenschaft an einer Stelle (Art. I), und eine Regulo bleibt für Agenten auch ohne Uzo lesbar.

## 5. Jugxo-Beispiele je Text-Regel (A7)

Je Text-Regel mindestens zwei Jugxoj `approved` und zwei `rejected` (eine je Sprache), `ref: { ero: <butono> }`, `ekzemplo.regulo` = die Regulo, jede Instanz mit `label`. Entwurf der Labels:

| Regulo | approved de / en | rejected de / en |
|---|---|---|
| `label-names-action` | „Speichern“ / “Save” | „Fertig!“ / “Done!” |
| `destructive-label-names-object` | „Projekt löschen“ / “Delete project” | „Löschen“ / “Delete” |
| `destructive-label-not-generic` | „Entwurf verwerfen“ / “Discard draft” | „OK, löschen“ / “Yes, delete” |

Ein bloßes „OK“ wäre als rejected-Beispiel ungeeignet: Es verletzt zugleich `label-names-action` und `destructive-label-names-object`, weil es kein Verb enthält. „OK, löschen“ verletzt nur `destructive-label-not-generic`: Es enthält das Verb und ein weiteres Wort. Text-Regeln gelten nur für eine Instanz, die einen Text trägt (Label-Slot oder `label`-Prop). Eine Instanz ohne Text verletzt allein `label-required`.

Die Sprache einer Instanz ergibt sich aus dem Schlüsselwort, das sie trifft (`intentOf` liefert `lingvo`). Ein Label, das kein Schlüsselwort trifft, hat keine Sprache. Für die rejected-Beispiele von `label-names-action` legt die Jugxo die Sprache deshalb in `context` fest. Der Test prüft je Regel nur, dass beide Sprachen vorkommen.

**Bedingung aus dem bestehenden Test** (`data/butono.test.ts`): Ein approved-Beispiel erzeugt keine Verletzung, ein rejected-Beispiel genau die eine Regel, für die es steht. Die rejected-Beispiele werden so gewählt, dass sie nur ihre eigene Regel verletzen (z. B. „Löschen“ mit `tone=danger`, `variant=primary`, damit `destructive-not-primary-color` nicht mitfeuert).

## 6. `EroInstance` (geändert, nur additiv)

```
EroInstance = { ero, props, container?, intent?, label?,
                aspekto?:  Name,                         für A10: die Aspekto, deren Überstimmungen gelten
                dimensioj?: { <Dimensio>: Name },        für full-width (viewport=compact)
                slots?:    { <Slot>: ("text" | "icon" | { ero: Name })[] } }
                                                         was in einem Slot steht; ein unbekannter
                                                         Ero-Name ist hier erlaubt (er beschreibt
                                                         den Entwurf) und verletzt dann accepts
```

`check_usage` prüft `aspekto` und die Namen in `dimensioj` gegen das Modelo (`mcp-input-invalid` mit `allowed`). Bestehende Instanzen bleiben gültig.

## 7. Überstimmung durch eine Aspekto (A7, F2)

```
aspekto.json#/tavoloj/lingvo = { overrides: { regulo: Name, jugxo: JugxoId }[] }
```

- `regulo` muss eine Text-Regel einer Uzo sein, sonst `uzo-regulo-unknown`.
- Ist die Regel fest, ist die Überstimmung ungültig (`uzo-override-fixed`).
- Die Jugxo muss existieren, `aspekto` = diese Aspekto tragen, `ref.regulo` = Id der Regulo, und `decision` = `deviation-recorded` haben. Sonst gilt `uzo-override-jugxo-missing`.
- `check_usage` wertet eine anpassbare Regel für eine Instanz mit `aspekto: X` als erfüllt, wenn X sie überstimmt. Die Meldung entfällt dann nicht stillschweigend, sondern erscheint als `info` mit der Jugxo-Id (Art. VI: eine Abweichung ist sichtbar).

`Tavoloj` erlaubt heute beliebige weitere Schlüssel und ignoriert sie. Neu bekommt nur `lingvo.overrides` ein Schema. Die übrige Tavolo `lingvo` bleibt Kandidat (Spec, Nicht im Scope).

## 8. Migration

- **Bestehende Daten bleiben gültig.** Eine Skemo ohne Uzo erzeugt eine Warnung, keinen Fehler.
- **Eine bestehende Beispiel-Instanz ändert sich.** `jug_01M2XN0Q7YGPVYC981A9D98PT1` (approved, `destructive-not-primary-color`) trägt das Label „Löschen“. Nach der festen Regel `destructive-label-names-object` wäre dieses approved-Beispiel ein Verstoß, und `data/butono.test.ts` bräche. Vorschlag: Label auf „Projekt löschen“ ändern und die Änderung in `context` vermerken. Dasselbe gilt für das rejected-Beispiel `…PT2`: Es soll nur `destructive-not-primary-color` verletzen. **Offener Punkt für den Maintainer** (plan.md, OP-5).
- **Export:** `uzoj` kommt als neuer Schlüssel in den Export (wie `mankoj` mit Spec 005). Die Export-Fixtures werden einmal neu erzeugt, und die Bytes sind über zwei Builds gleich (AK-10).
- **Ids:** neuer Entitätstyp `uzo` in `ENTITY_ID_PREFIXES` und in der Ontologio (`entity-type-missing` prüft beides gegeneinander).
