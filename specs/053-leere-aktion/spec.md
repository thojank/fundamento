# Spec 053: Eine Aktion ohne sichtbaren Namen macht den Screen rot

Repo-Ordner: `specs/053-leere-aktion/` · Anlass: Befund F-052-4 (Spec 052, PR #166) · ein PR, nichts mergen

## Overview

Ein Butono oder Ligilo, der nur `label="…"` trägt und weder Text noch Icon hat, sieht leer aus. `fm-butono` zeigt dann eine leere Fläche, `fm-ligilo` hat 0 × 0 px. Der zugängliche Name ist trotzdem gesetzt. `check_markup` und `check_usage` melden heute deshalb keinen Fehler, und der Screen gilt als grün.

Diese Spec schärft die Prüfung der bestehenden Regulo `label-required` so, dass sie hält, was ihr Satz schon sagt: „sichtbares Label oder, **nur bei einem Icon-Knopf**, die `label`-Prop“. Die Regulo gilt künftig auch für `ligilo`. Der Gvidanto sagt dem Agenten ausdrücklich, dass `label` an Butono und Ligilo nicht angezeigt wird. Danach werden die gespeicherten M-1-Fakten ohne Modell-Lauf neu bewertet.

Das ist eine **Verschärfung**: Keine Schwelle, Toleranz oder Grenze wird gelockert.

## Problem Statement

In der Neubewertung aus Spec 052 sind alle 4 F-Screens von M-1 grün. Zwei davon haben einen leeren Absende-Knopf. Alle vier haben einen unsichtbaren Markenlink:

| Screen | Absende-Knopf im `fragmento.html` | Markenlink | heute |
| --- | --- | --- | --- |
| anmelden | `<fm-butono … type="submit" label="Anmelden"></fm-butono>`: **leer** | `<fm-ligilo slot="brand" … label="Team Nord">`: **0 × 0** | grün |
| konto | `<fm-butono …>Abmelden</fm-butono>` | **0 × 0** | grün |
| passwort-vergessen | `<fm-butono …>Link senden</fm-butono>` | **0 × 0** | grün |
| registrieren | `<fm-butono … label="Konto speichern"></fm-butono>`: **leer** | **0 × 0** | grün |

Quelle: `specs/050-mvp-probelauf/daten/m1/F/*/fragmento.html`. Bild: `specs/050-mvp-probelauf/daten/bildoj/m1-F-anmelden-malhela.png`.

Ein grüner Screen mit leerer Hauptaktion misst nicht „richtiges Design“. Er verfälscht die Zielkennzahl „Grüne Screens im MVP-Probelauf“.

### Befund 1: `label-names-action` ist die falsche Stelle

- Definiert in `packages/modelo/data/reguloj.json:462-475` (`reg_01M4RPB19HEMSFTRDZNPTHJV7P`), Kialo: „A person decides from the label alone what happens on activation. A verb says it; a noun or a mood makes them guess.“
- Die Schwere steht in der Uzo: `packages/modelo/data/eroj/butono/uzo.json:231-236`, `fixed: false`, `severity: "warning"`, Prüfung `names-goal`. Laut Scope der Regulo „only warns until a better check exists (plan D-02)“, Spec 007.
- Die Regel vergleicht den Text mit den Verben der Ziele des Ero. **Ob der Knopf leer ist, prüft sie nicht.** In M-1 meldet sie „Anmelden“ (anmelden) und „Abmelden“ (konto), weil beide Wörter kein Ziel-Verb sind. Das sichtbare „Abmelden“ ist dabei korrekt. Das leere „Konto speichern“ (registrieren) meldet sie nicht, weil „speichern“ ein Ziel-Verb ist.
- In nordstelo ist sie die Regulo mehrerer K6-Kriterien (`data/nordstelo.json`, z. B. `kri_01M5N8ADAQMSCPB4WEG7KMF7CE` „Der Knopf nennt die Aktion“, und `nordstelo/src/ablauf/katalogo.ts:69-73, 210`). Diese Kriterien prüfen `kind: "aria"`, also den zugänglichen Namen. Bei anmelden ist der aria-Name „Anmelden“ vorhanden, K6 ist erfüllt.
- In K3 (`nordstelo/src/score.ts:224-240`) und in der Grün-Regel (`ekranoj/src/verda.ts:22`) zählen nur Funde mit Schwere `error`. Deshalb hält die Warnung nicht vom Grün ab.

**Folge:** Würde `label-names-action` zum `error`, würde konto rot, obwohl der Knopf sichtbar und richtig beschriftet ist. registrieren bliebe grün, obwohl der Knopf leer ist. Darum bleibt die Regel unverändert eine Warnung (siehe Scope).

### Befund 2: Die Prüfung von `label-required` ist schwächer als ihr Satz

- Satz (`reguloj.json:221-233`, `reg_01M2XMV80DG7JCJDTZGE66MGHY`): „Every butono has a visible label or, when it shows only an icon, a label prop as its accessible name.“
- Prüfung (`packages/modelo/src/eroj/usage.ts:1068-1082`): `const name = instance.label ?? instance.props.label`. Jede `label`-Prop genügt, **auch ohne Icon**. Die Schwere ist bereits `error` (Standard der Enforcer, `usage.ts:465`).
- Die Lücke liegt also nicht in der Schwere, sondern in der Prüfung.

### Befund 3: Ursache beim Agenten ist das Kurzprofil im Gvidanto

- Das Skemo sagt zu `label` bei Butono und Ligilo richtig: „Accessible name when the label slot is empty (icon-only); never shown.“
- Das Kurzprofil (`packages/modelo/src/gvidanto/eroj.ts:600-613`) gibt davon nur `{ name: "label", type: "string" }` weiter. Beim Kampo trägt dasselbe Prop `shown: true` (Spec 029 ②b-1b, Nachlese 12). Der Unterschied steckt also **allein im Fehlen einer Markierung**. Ein Agent, der beim Kampo `label="…"` als sichtbares Label gelernt hat, schreibt es beim Butono genauso.
- Beleg: In M-1 F schreibt der Agent den Knopftext zweimal als `label` (anmelden, registrieren) und zweimal als Slot-Text (konto, passwort-vergessen). Den Markenlink schreibt er immer als `label`.
- Bezug zu B-2 (Spec 030, benannter Standard-Slot) und L50-3 (Spec 050, Kind im Standard-Slot): **Hier liegt eine andere Ursache vor.** Der Agent hat keinen Slot falsch benannt. Er hat Text in ein Prop gesetzt, das nie angezeigt wird.

### Befund 4: Das freigegebene Beispiel widerspricht dem Satz

Die approved-Jugxo zu `label-required` (`packages/modelo/data/jugxoj.json:174-193`) heißt „icon-only button“. Ihre Instanz hat aber nur `label: "Schließen"` und keinen Icon-Slot. Nach der Schärfung wäre sie selbst falsch. Das Beispiel wird korrigiert (Icon-Slot ergänzt). Es wird nicht gelockert.

## Goals

1. Eine Aktion (Butono, Ligilo, Absende-Knopf eines Formulars) ohne sichtbaren Namen ist ein `error` in `check_usage` und `check_markup`. Damit zählt sie in K3 und in der Grün-Regel.
2. Ein Icon-Knopf oder Icon-Link mit `label`-Prop bleibt erlaubt.
3. Das Kurzprofil des Gvidanto sagt ausdrücklich, dass `label` an Butono und Ligilo verborgen ist. Der Fehler sagt, wie es richtig geht.
4. Die Neubewertung aus Spec 052 wird ohne Modell-Lauf wiederholt. Sie nennt, wie viele der 4 F-Screens danach grün sind (erwartet: **0 von 4**).

## User Stories

- **Als Messende** will ich, dass ein Screen mit leerer Hauptaktion nicht grün ist, damit die Zielkennzahl „Grüne Screens“ richtiges Design misst.
- **Als Agent, der mit dem Gvidanto baut,** will ich im Kurzprofil sehen, dass `label` am Butono nie angezeigt wird, damit ich den Knopftext in den Slot schreibe.
- **Als Agent, der `check_markup` aufruft,** will ich bei einem leeren Knopf einen Fehler mit klarem Vorschlag bekommen („Text in das Element schreiben; `label` nur bei Icon-Knöpfen“), damit ich ihn in der nächsten Runde behebe.
- **Als Mensch mit Screenreader oder Sprachsteuerung** soll ein Icon-Knopf mit `label` weiterhin gültig sein, damit Icon-Aktionen einen Namen haben.
- **Als Maintainer** will ich die Verschärfung mit Jugxo und Kialo belegt sehen, damit klar ist, warum ein bisher grüner Screen rot wird.

## Acceptance Criteria

Rote Tests zuerst: Für jedes AC mit Prüfung gibt es einen Test, der vor der Änderung rot und danach grün ist.

### Prüfung `label-required`

- **AC-1:** Ein `butono` ohne Slot-Text, mit `label`-Prop und ohne gefüllten Slot `icon-start` oder `icon-end` ergibt einen Fund `label-required` mit Schwere `error`. Fall: `<fm-butono type="submit" label="Anmelden"></fm-butono>`.
- **AC-2:** Dasselbe gilt für `ligilo`. Fall: `<fm-ligilo slot="brand" to="anmelden.html" label="Team Nord"></fm-ligilo>`.
- **AC-3:** Ein `butono` oder `ligilo` mit `label`-Prop und gefülltem Icon-Slot ist kein Fund. Das ist der Icon-Knopf.
- **AC-4:** Ein `butono` oder `ligilo` mit Slot-Text ist kein Fund, ob mit `label`-Prop oder ohne. Fälle: `<fm-butono>Abmelden</fm-butono>`, `<fm-butono>Link senden</fm-butono>`.
- **AC-5:** Ein `butono` oder `ligilo` ohne Text, ohne `label` und ohne Icon bleibt ein Fund. So ist es heute schon, und das bleibt so.
- **AC-6:** Text, der nur aus Leerzeichen besteht, zählt als leer, im Slot wie in der Prop.
- **AC-7:** Die Meldung unterscheidet die zwei Fälle. „hat weder sichtbares Label noch label-Prop“ bleibt wie heute. Der neue Fall lautet „hat nur die label-Prop „…“, die nie angezeigt wird, und kein Icon“. Der Vorschlag nennt die richtige Form: Text in das Element schreiben; `label` nur bei einem Icon-Knopf zusätzlich zum Icon. Die Meldung beginnt weiter mit `Instance N of <ero> has`, weil `ekranoj/src/rondoj.ts` (`sugestoKunSlotaTeksto`) diesen Anfang liest.
- **AC-8:** `check_markup` liefert für die gespeicherten Fragmente von M-1 F diese Funde: anmelden `label-required` ×2 (butono, ligilo); konto, passwort-vergessen und registrieren je ×1 (ligilo), registrieren zusätzlich ×1 (butono). Alle haben Schwere `error`. Die bisherigen `label-names-action`-Warnungen bleiben unverändert.

### Modelo-Daten

- **AC-9:** Satz, Scope und `appliesTo` der Regulo `label-required` nennen `butono` und `ligilo`. Die Kialo erklärt zusätzlich, warum ein nur über die Prop benannter Knopf ohne Icon leer erscheint („a name nobody sees is no label for sighted people …“). Die ID bleibt.
- **AC-10:** `ligilo/uzo.json` erhält den Boundary-Fall `no-accessible-label` → `not-supported` via `label-required`, so wie der Butono ihn hat.
- **AC-11:** Jugxoj:
  - Die bestehende approved-Jugxo „icon-only button“ erhält einen gefüllten Icon-Slot. Ihre ID, Entscheidung und Kialo bleiben.
  - Neu ist eine rejected-Jugxo: ein Butono mit nur `label="Anmelden"`, kein Text, kein Icon. Kialo: Der Knopf erscheint leer; die Prop ist der Name eines Icons, kein Text.
  - Neu ist eine rejected-Jugxo für Ligilo, analog (`label="Team Nord"`, 0 × 0).
  - Neu ist eine deviation- oder approved-Jugxo, die die Verschärfung festhält: Anlass F-052-4, Datum, Wirkung auf die Neubewertung.
  - Alle neuen IDs stehen in `ids.lock.json`.
- **AC-12:** `label-names-action` bleibt unverändert, ebenso alle anderen Reguloj, Schwellen und Toleranzen.

### Gvidanto

- **AC-13:** Im Skemo von Butono und Ligilo trägt die Prop `label` ausdrücklich `shown: false`.
- **AC-14:** Das Kurzprofil (`get_ero` brief) gibt eine Prop mit `shown: false` als `{ name, type, hidden: true }` aus. Für Butono und Ligilo enthält es deshalb `{ "name": "label", "type": "string", "hidden": true }`. `shown: true` beim Kampo bleibt.
- **AC-15:** Jedes Kurzprofil bleibt unter seiner bestehenden Obergrenze (750). Die Obergrenze wird nicht angehoben.

### Neubewertung ohne Modell-Lauf

- **AC-16:** Ein Skript `specs/053-leere-aktion/neubewertung.mjs` liest für M-1 (F und 0) die gespeicherten `fragmento.html` aus `specs/050-mvp-probelauf/daten/m1/` und die Neubewertung aus `specs/052-k8-interspacoj/daten/neubewertung/m1/`. Es berechnet **nur `malobservoj` neu** (mit `check_markup` auf dem unveränderten Markup) und K3. `taksado.k8`, `kompleta`, axe und `zusatz` übernimmt es aus 052, weil weder Markup noch Rendering sich ändern. Grün heißt wie in 052: `decidiVerdon(enigo).verda && zusatz.length === 0`.
- **AC-17:** Das Ergebnis wird in `specs/053-leere-aktion/daten/neubewertung/m1/` gespeichert. Ein Bericht `specs/053-leere-aktion/neubewertung.md` enthält je Screen: alte und neue `malobservoj`, Grün vorher und nachher, die Gründe (`malhelpoj`). Erwartet: **F 0 von 4 grün** (vorher 4 von 4); Grund überall `check_usage`. Variante 0 bleibt bei 0 von 4, mit denselben Gründen wie in 052. Die Grün-Regel für 0 liest `check_usage` nicht.
- **AC-18:** Die Gegenprobe läuft mit `node specs/050-mvp-probelauf/pruefen.mjs --daten specs/053-leere-aktion/daten/neubewertung --ohne-bericht` und endet mit Exit 0. Ihre Grün-Zeile stimmt mit dem Bericht überein.
- **AC-19:** Es gibt keinen Modell-Lauf. Das Skript ruft keinen Agenten und keine API eines Modells.

### Bestehende Tests und Fixtures

- **AC-20:** Bestehende Tests, deren Erwartung sich durch die Verschärfung ändert, werden einzeln angepasst und im Bericht aufgelistet. Bekannt sind die Fixtures mit nur `label`: `nordstelo/test/fixtures/kuroj/anmeldung-F-1/pagxo.html`, `k8/anmelden-m1`, `k8/konto-m1`, `k8/konto-m1-plena` und `eroj/test/interspacoj-052.spec.ts`. Die Anpassung ändert nur die erwartete Bewertung (K3 oder Funde), nie eine Schwelle. Wo ein Fixture einen *sauberen* Screen darstellen soll, bekommt das Markup Slot-Text; das Fixture wird nicht der Erwartung angepasst.
- **AC-21:** Die CI ist grün bis auf den bekannten, fremden Fehler `modelo ci/turbo-inputs.test.ts:679`.

## User Flow

### Agent baut einen Screen (nach dem Fix)

1. Der Agent ruft `get_ero butono` (brief) ab und sieht `label` mit `hidden: true`.
2. Er schreibt `<fm-butono type="submit" emphasis="high">Anmelden</fm-butono>`.
3. `check_markup` meldet nichts zu `label-required`.

### Agent setzt trotzdem nur `label`

1. Er schreibt `<fm-butono type="submit" label="Anmelden"></fm-butono>`.
2. `check_markup` meldet `label-required` (error): „Instance 7 of butono has only the label prop "Anmelden", which is never shown, and no icon.“ Vorschlag: „Write the label as the text of the element: <fm-butono …>Anmelden</fm-butono>. The label prop names an icon-only button next to its icon.“
3. In ekranoj ist der Screen nicht grün (`malhelpoj: ["check_usage"]`). Die Runde gibt den Vorschlag zurück.

### Messende wiederholen die Neubewertung

1. `node specs/053-leere-aktion/neubewertung.mjs --roh <M-1-Laufordner>`. Erwartete Ausgabe: „8 Screens, grün F 0/4 (-), 0 0/4“.
2. Gegenprobe mit `pruefen.mjs`: Exit 0.

## Scope

### Enthalten

- Die Prüfung `label-required` (Modelo `usage.ts`) wird geschärft und gilt zusätzlich für `ligilo`.
- Regulo-Text, Kialo, Uzo-Boundary für Ligilo, Jugxoj (eine korrigiert, drei neu), `ids.lock.json`.
- Skemo `shown: false` bei Butono- und Ligilo-`label`; Kurzprofil `hidden: true`.
- Neubewertungs-Skript, Daten und Bericht für M-1 (F und 0) ohne Modell-Lauf.
- Rote Tests zuerst; Anpassung bestehender Erwartungen mit Liste.
- Ein PR von `main` aus, nicht gemergt.

### Nicht enthalten

- `label-names-action` wird **nicht** auf `error` gehoben. Sie prüft Ziel-Verben, nicht Leere; als Fehler machte sie konto falsch rot (Befund 1). Eine bessere Verb-Prüfung (plan D-02, Spec 007) bleibt offen.
- Das K6-Kriterium „Der Knopf nennt die Aktion“ bleibt aria-basiert. Die Grün-Regel greift über K3 und `check_usage`.
- Keine Änderung an `decidiVerdon`, an K-Formeln, Schwellen oder Toleranzen.
- Keine Änderung am Rendering von `fm-butono` oder `fm-ligilo`. Die `label`-Prop wird nicht sichtbar gemacht, denn sie ist der Name eines Icon-Knopfs.
- M-2-Daten werden nicht neu bewertet. Der Bericht kann sie nennen, das ist aber kein AC.
- Andere Eroj mit `prop:label` als zugänglichem Namen (z. B. Menuo-Auslöser, Ikono) gehören nicht dazu. Der Bericht listet sie als Kandidaten für eine Folge-Spec.
- Kein Modell-Lauf, kein neuer MVP-Probelauf.

## Edge Cases

| Fall | Ergebnis |
| --- | --- |
| Butono mit Slot-Text **und** `label` | kein Fund (AC-4); der Text ist sichtbar |
| Butono mit `icon-start` gefüllt und `label` | kein Fund (AC-3) |
| Butono mit Icon, ohne `label`, ohne Text | Fund wie heute (AC-5) |
| Text nur aus Leerzeichen oder `&nbsp;` | gilt als leer (AC-6) |
| Text in einem ungeslotteten Kind (`<fm-butono><span>Anmelden</span></fm-butono>`) | zählt als sichtbarer Text, so wie die eine Ableitung `instancojElElementoj` es heute zählt (S038-39b) |
| Text in einem Kind mit `slot="label"` (B-2) | dieselbe Ableitung wie heute; diese Spec ändert sie nicht |
| Ligilo mit `download` oder `external`: Das Ero zeigt sein eigenes Icon, wenn `icon-end` leer ist | zählt **nicht** als Icon-Knopf. Das automatische Icon ist ein Hinweis, kein Name. Ohne Text gibt es einen Fund. |
| Butono `loading` oder `disabled` ohne Text | dieselbe Regel; der Zustand ändert den Namen nicht |
| Variante 0 (ohne Fundamento) | Die Grün-Regel liest `check_usage` nicht. Grün ändert sich nicht, K3-Werte können sich ändern und stehen im Bericht. |
| Aufrufer übergibt Instanzen direkt an `check_usage` (ohne Markup) | Die Prüfung liest gefüllte Slots aus der Instanz. Eine Instanz, die keine Slot-Angabe hat, gilt als ohne Icon. |

## Risks

- **Fremde Fixtures werden rot.** Gewollt; AC-20 regelt, wie sie angepasst werden.
- **Brief-Obergrenze 750.** `hidden: true` kostet ein paar Bytes je Butono- und Ligilo-Profil. Wenn es nicht passt, wird gekürzt (z. B. `hidden` statt `shown:false`). Die Obergrenze wird nicht angehoben.
- **Rebase-Konflikte** mit offenen Specs 035, 036 und 037 in `usage.ts` und `jugxoj.json` sind möglich.
