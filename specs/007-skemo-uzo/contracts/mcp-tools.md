# Vertrag – MCP-Werkzeuge, Spec 007

**Plan:** [`../plan.md`](../plan.md) D-05, D-06, D-07 · **Vorgänger:** [`specs/003-butono-durchstich/contracts/mcp-tools.md`](../../003-butono-durchstich/contracts/mcp-tools.md) · **Stand:** Entwurf · **Datum:** 2026-10-08

Es entsteht kein neues Werkzeug. Drei bestehende Werkzeuge wachsen. Jede Änderung ist **additiv**: Ein Aufrufer, der die neuen Felder nicht kennt, bekommt dieselbe Antwort wie heute, solange das Ero keine Uzo hat. Die Achsennamen in den Beispielen sind die von heute; F1 benennt sie in seinem eigenen PR um.

## 1. `get_ero`

**Eingabe:** `{ name } | { id }`, neu optional `brief: boolean` (Standard `false`).

**Ausgabe ohne `brief`** (wie Spec 003, plus `uzo`):

```
{
  ero, skemo, reguloj, examples, projekcioj,     // unverändert
  uzo?: {                                        // fehlt, wenn das Ero keine Uzo hat
    purpose: string,
    instead:  [ { intent, keywords, ero: string | null, kialo } ],
    boundary: [ { case, action: "use-instead" | "ask-human" | "not-supported", ero?, keywords?, via?, kialo } ],
    composes: { containers: [ { name, kialo } ], with: [ { ero, kialo } ], never: [ { ero, kialo } ],
                spacing: { owner: "container", regulo: ReguloRef } },
    slots:    { <slot>: { accepts?, max?, required?, nesting? } },
    layout:   { size, wrap, "full-width"?: { allowedIn, regulo: ReguloRef } },
    content:  [ { regulo: ReguloRef, fixed: boolean, when?, check } ]
  }
}
```

Verweise auf Reguloj werden wie überall im Gvidanto als `ReguloRef` (`id`, `name`, `statement`, `kialo`, `checkability`) aufgelöst. So zitiert ein Agent den Kialo, ohne `explain_regulo` aufzurufen.

**Ausgabe mit `brief: true`** (A8), generiert aus Skemo und Uzo:

```
{
  ero: string,
  purpose: string,
  axes: [ { name, values: string[], default: string } ],      // jeder Enum-Prop der Skemo
  required: { props: string[], slots: string[] },
  instead:  [ { intent, ero: string | null, kialo } ],          // ohne keywords
  boundary: [ { case, action, ero?, kialo } ]                   // ohne keywords und via
}
```

Ein Ero ohne Uzo liefert mit `brief` nur `ero`, `axes` und `required`, dazu eine Warnung `skemo-uzo-missing` in `issues`. Obergrenze: `ceil(Bytes / 3)` der kompakten JSON-Ausgabe ≤ **Wert aus T022** (vorläufig 750). Der Test steht in `packages/mcp/src/eroj-tools.test.ts`.

## 2. `suggest_ero`

**Eingabe:** unverändert `{ intent, lingvo? }`.

**Ausgabe bei einem Treffer auf `boundary` oder `instead`** (neu):

```
{ intent,
  matched: { intent: <case | intent>, keyword, lingvo },
  suggestion: { ero, props: {} } | null,          // null außer bei use-instead / instead.ero ≠ null
  boundary: { ero: <das Ero, dessen Uzo trifft>, case, action, kialo } }
```

Zuerst werden die Schlüsselwörter aller Uzoj geprüft (`boundary` vor `instead`, jeweils in Reihenfolge der Daten), danach die Skemo-Intents wie bisher (D-06). Ein Eintrag aus `instead` mit `ero: null` antwortet mit `action: "ask-human"`.

**Ausgabe bei einem Treffer auf einen Skemo-Intent:** unverändert.

**Kein Treffer:** wie bisher `ok: false` mit `intent-unknown` und `allowed`. Neu ist der `suggestion`-Text: „Fundamento does not cover this intent. Ask a person; do not build a replacement.“ (OP-6 in plan.md).

**Akzeptanz (S1):** `suggest_ero { intent: "Zur Übersicht" }` → `boundary.case = "navigation"`, `action = "ask-human"`, `suggestion = null`, Kialo aus der Uzo.

## 3. `check_usage`

**Eingabe:** `{ instances: EroInstance[] }`. `EroInstance` bekommt optional `aspekto`, `dimensioj` und `slots` (data-model §6). Unbekannte Aspekto, Dimensio oder Dimensio-Werte ergeben `mcp-input-invalid` mit `allowed`.

**Ausgabe:** unverändert `{ instances, valid, violations: [ { instance, issue } ] }`. Neue Regeln:

| `issue.rule` | Auslöser | `issue.suggestion` |
|---|---|---|
| `uzo-boundary` | eine Grenze mit `via`, z. B. `{ ero: "form" }` im Slot `label` | Aktion der Grenze; bei `use-instead` das Ero |
| `uzo-slot-accepts` | Inhalt, den `accepts` nicht nennt | die erlaubten Inhalte |
| `uzo-slot-max` | mehr Einträge als `max` | „Keep at most <max>.“ |
| `uzo-slot-nesting` | Ero in Ero tiefer als `nesting` | „Move the inner Ero next to this one.“ |
| `full-width-in-action-bar-or-compact` | `full-width: true` außerhalb `action-bar` und ohne `dimensioj.viewport = compact` | Container oder Dimensio nennen, sonst `full-width` weglassen |
| `label-names-action` | Label ohne Schlüsselwort eines Skemo-Intents | approved-Label der Regel in der Sprache der Instanz |
| `destructive-label-names-object` | zerstörende Instanz, deren Label kein Verb des Intents `destructive` plus ein weiteres Wort enthält | approved-Label der Regel |
| `destructive-label-not-generic` | zerstörende Instanz mit generischem Wort | approved-Label der Regel |

Jede Meldung trägt `regulo { id, name, kialo }`, bei Grenzen den Kialo der Grenze. Ist eine anpassbare Regel durch die Aspekto der Instanz überstimmt, erscheint statt des Verstoßes ein Eintrag mit `severity: "info"`, der die Jugxo-Id nennt. `valid` bleibt dann `true`.

**Akzeptanz:**
- **S2:** `{ ero: "butono", props: {}, slots: { label: [ { ero: "form" } ] } }` → `uzo-boundary`, Fall `form-in-slot`, Kialo der Uzo.
- **S3:** `{ ero: "butono", props: { variant: "primary", tone: "danger" }, intent: "destructive", label: "OK" }` → `destructive-label-names-object` und `destructive-label-not-generic`, `suggestion` nennt „Projekt löschen“.
- **S4:** Aspekto `ekzemplo` mit Überstimmung von `label-names-action` und Jugxo: `label: "Los geht's!"`, `aspekto: "ekzemplo"` → `info`, `valid: true`. Dieselbe Aspekto mit `label: "Weg damit!"`, `intent: "destructive"` → Verstoß gegen die feste Regel `destructive-label-names-object` (kein Verb der Zerstörung), `valid: false`; die Überstimmung von `label-names-action` ändert daran nichts.

## 4. `describe_term`

Unverändert in der Form. `Uzo`, `Gebrauch` und `usage` liefern den Ontologio-Begriff `#Uzo` (A13, Abnahme 7).

## 5. `describe`

Das Werkzeugverzeichnis bleibt gleich. Die Beschreibung von `get_ero` nennt `brief` und `uzo`.
