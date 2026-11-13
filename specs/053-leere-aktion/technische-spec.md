# Spec 053 Technik: Prüfung `label-required` schärfen

## Overview

Die Änderungen liegen fast nur in `packages/modelo`: Daten, Enforcer und Gvidanto-Kurzprofil. Dazu kommen ein Neubewertungs-Skript unter `specs/053-leere-aktion/` und angepasste Erwartungen in den Paketen nordstelo, ekranoj und eroj. Die Paket-Logik von nordstelo und ekranoj (K-Formeln, `decidiVerdon`) bleibt unverändert.

## Reihenfolge (rote Tests zuerst)

1. **Rote Tests** in `packages/modelo/src/eroj/` bzw. `gvidanto/check-markup.test.ts`, `check-usage.test.ts`, `eroj.test.ts`. Sie decken ab:
   - AC-1 bis AC-7 mit den wörtlichen Fragmenten aus M-1 (`anmelden`, `registrieren`, Markenlink)
   - AC-13 und AC-14: Das Kurzprofil hat `hidden: true` bei `butono.label` und `ligilo.label`
   - AC-11: Die approved-Jugxo von `label-required` besteht `check_usage`, die rejected-Jugxoj fallen durch. Die bestehenden Jugxo-Tests laufen über alle Beispiele.
2. Daten ändern (Regulo, Uzo, Skemo, Jugxoj, ids.lock).
3. Enforcer ändern.
4. Kurzprofil ändern.
5. Fremde Erwartungen anpassen (AC-20) und auflisten.
6. Neubewertung (AC-16 bis AC-19).

## Enforcer `label-required` (`packages/modelo/src/eroj/usage.ts:1068`)

Heute:

```ts
const name = instance.label ?? instance.props.label;
if (typeof name === "string" && name.trim() !== "") return [];
```

Neu (Skizze):

```ts
const sichtbar = nichtLeer(instance.label);          // Slot-Text aus der einen Ableitung
if (sichtbar) return [];
const prop = nichtLeer(instance.props.label) ? instance.props.label : undefined;
const ikono = ikonoSlotoj(ero.skemo).some((slot) => slotPlena(instance, slot));
if (prop !== undefined && ikono) return [];           // Icon-Knopf mit Namen
return [prop === undefined ? fundOhneNamen(...) : fundNurProp(..., prop)];
```

- `nichtLeer`: `trim()` mit ` ` als Leerzeichen (AC-6).
- `ikonoSlotoj`: die Slots des Skemo mit `decorative: true` und einem Namen, der mit `icon-` beginnt. Das sind bei Butono und Ligilo `icon-start` und `icon-end`. Gelesen wird das aus dem Skemo, nicht als feste Liste.
- `slotPlena`: Vor dem Bau prüfen, wie die Instanz gefüllte Slots trägt. `instancojElElementoj` leitet sie aus den geslotteten Kindern ab, z. B. als `instance.slots` oder `children`. Fehlt die Angabe, gilt der Slot als leer. Ein automatisches Icon (Ligilo `download` oder `external`) ist kein gefüllter Slot.
- Meldungen beginnen mit `Instance ${index} of ${ero.ero.name} has`. Diesen Anfang liest `ekranoj/src/rondoj.ts:432` (`sugestoKunSlotaTeksto`).
- Die Schwere bleibt beim Standard `error` (`usage.ts:465`).
- `appliesTo` kommt aus der Regulo (`applies(regulo, ero)`). Mit dem Datenwechsel greift der Enforcer automatisch auch beim Ligilo.

## Daten

| Datei | Änderung |
| --- | --- |
| `data/reguloj.json` (`reg_01M2XMV80DG7JCJDTZGE66MGHY`) | `statement` nennt jetzt „butono or ligilo“; die `kialo` bekommt einen Satz zum unsichtbaren Namen; `scope` nennt den Icon-Slot; `appliesTo.eroj: ["butono","ligilo"]` |
| `data/eroj/ligilo/uzo.json` | Boundary `no-accessible-label` → `not-supported`, `via.regulo: label-required`, Kialo wie beim Butono, auf den Link bezogen |
| `data/eroj/butono/skemo.json`, `data/eroj/ligilo/skemo.json` | Prop `label`: `"shown": false` |
| `data/jugxoj.json` | approved `jug_…` (Zeilen 174–193): Instanz bekommt Icon-Slot. Neu: rejected Butono nur `label`, rejected Ligilo nur `label`, eine Jugxo zur Verschärfung (Anlass F-052-4) |
| `data/ids.lock.json` | neue IDs |
| `src/generated/*` | Neu erzeugen, wenn das Schema `shown` schon als `boolean` erlaubt (`modelo-schema.ts:1463`). Sonst ist keine Schema-Änderung nötig. |

Die Darstellung des Icon-Slots in einer Jugxo-Instanz richtet sich nach den Beispielen, die es schon gibt (Spec 014 ②, `icon-meaning-named`). Vor dem Bau nachsehen.

## Gvidanto-Kurzprofil (`packages/modelo/src/gvidanto/eroj.ts:600-613`)

```ts
.map((prop) => ({
  name: prop.name,
  type: prop.kind,
  ...(prop.shown === true ? { shown: true as const } : {}),
  ...(prop.shown === false ? { hidden: true as const } : {}),
}));
```

- Der Typ `GetEroBrief.props` (Zeile 162) bekommt `hidden?: true`.
- Der Vertrag in `contracts/mcp-tools` bzw. die Doku des Kurzprofils wird nachgezogen.
- Der Test für die Obergrenze 750 läuft unverändert.

## Neubewertung (`specs/053-leere-aktion/neubewertung.mjs`)

- Basis ist `specs/052-k8-interspacoj/neubewertung.mjs`. Wiederverwenden, nicht kopieren: Wo möglich die gemeinsamen Teile importieren.
- Je Screen (m1, F und 0):
  1. `fragmento.html` aus `specs/050-mvp-probelauf/daten/m1/<v>/<slug>/` lesen.
  2. `check_markup` (gebautes Modelo) aufrufen. Ergebnis ist das neue `malobservoj`.
  3. K3 neu berechnen (gleicher Weg wie `nordstelo/src/score.ts` `reguloGaps`). Alle anderen K sowie `taksado.k8`, `kompleta`, axe und `zusatz` kommen aus `specs/052-k8-interspacoj/daten/neubewertung/m1/<v>/<slug>/fakto.json`.
  4. `decidiVerdon` anwenden; `herkunft.neubewertung = "Spec 053: check_markup auf unverändertem fragmento.html, ohne Modell, ohne Rendering"`.
- Ausgabe nach `specs/053-leere-aktion/daten/neubewertung/m1/<v>/<slug>/fakto.json`, im Format von 052, damit `pruefen.mjs --daten` sie liest.
- Kein Browser nötig: Das Rendering ändert sich nicht.
- Selbstprüfung: Mit `--ohne-schaerfung` (alte Prüfung über einen Testschalter oder alten Build) kommt genau das Ergebnis von 052 heraus: F 4/4.

## Betroffene Erwartungen (AC-20)

Mindestens diese, vor dem Bau per Testlauf vollständig ermitteln:

- `packages/nordstelo/test/fixtures/kuroj/anmeldung-F-1/pagxo.html`: Butono nur `label`
- `packages/nordstelo/test/fixtures/k8/{anmelden-m1,konto-m1,konto-m1-plena}/enigo.html`: Ligilo nur `label`
- `packages/eroj/test/interspacoj-052.spec.ts`: Ligilo nur `label`. Das ist ein K8-Test. Prüfen, ob er `check_usage` überhaupt liest. Wenn nicht, gibt es keine Änderung.
- e2e der MCP (`packages/mcp/src/e2e/s007-uzo.test.ts`, `s014-overlays.test.ts`): Sie decken `label-required` und Icon-Knöpfe ab.
- Doku-Beispiele bzw. Make-Kit-Guidelines, die aus Jugxoj erzeugt werden

## Testlauf lokal

Nur gezielt (die Maschine ist sonst frei): `modelo`-Tests für `usage` und `gvidanto`, dazu die betroffenen nordstelo- und ekranoj-Tests. Bekannt rot und fremd: `modelo ci/turbo-inputs.test.ts:679`.
