# Spec 052 – K8 `interspacoj`: Abstände zwischen Geschwistern, für den ersten grünen Screen

> Nummer: die nächste freie nach 051 auf dem aktuellen `origin/main` (050 = MVP-Probelauf, PR #165; 051 = Wacklige Tests, PR #164; beide gemergt). Der Bau prüft das beim Start; erwartet ist 052.
>
> **Freigabe (Maintainer über Pogo, 13.11.2026):** Spec freigegeben, Maschine frei: lokale Builds, Tests und Playwright sind erlaubt. **Kein Modell-Lauf in dieser Spec.** Der Bau beginnt auf dem aktuellen `main` (nach #164 und #165), nicht auf `de931e40`.
>
> **Umfang laut Freigabe:** Gebaut werden Ursache A und Ursache B. Rest C wird nur als Befund im Bericht festgehalten.

## Overview

Im MVP-Probelauf (Spec 050, M-1, Sonnet, komuna, 13.11.2026) scheitern mit Fundamento (Variante F) alle 4 Screens nur noch an **einem** Merkmal: K8 `interspacoj` („Abstände zwischen Geschwistern außerhalb der Abstandsstufen der Marke“). K1 bis K6, Navigation und Gvidanto sind ok. K8 liegt in Runde 3 bei 0,9813 (komuna, ekzemplo), 0,9384 (provo) und 0,9447 (provo-kompakta). Befund F-050-13.

Die Analyse der gespeicherten M-1-Fakten (ohne neuen Lauf) zeigt: **Der Agent schreibt keinen einzigen eigenen Abstand.** Sein Markup hat kein `style`-Attribut, keine Klasse und keinen eigenen Abstand. Jeder Treffer außerhalb der Stufen entsteht in den Sxablonoj oder in der Art, wie K8 misst. Die Spec behebt beide Ursachen, belegt die Wirkung ohne Modell-Lauf und bereitet erst danach einen sauberen Probelauf vor.

## Problem Statement

### Befund aus den gespeicherten M-1-Fakten

Quelle: `.fundamento/spec050/m1/20261113-0243/anmelden-und-konto/F/1/rondoj/3/*.fakto.json`, Messkopf `de931e40` (gleich dem Stand dieses Worktrees). Ausgewertet mit derselben Regel wie `k8.ts` (`surStupo`, `AUF_STUFO = 0,5`). Helle und dunkle Renders haben dieselben Geschwisterabstände (0 Unterschiede).

Abstandsstufen je Marke (`spacing.xsmall … xxlarge`, aus den Sonden):

| Marke | xsmall | small | medium | large | xlarge | xxlarge |
|---|---|---|---|---|---|---|
| komuna | 2 | 4 | 8 | 16 | 24 | 40 |
| ekzemplo | 2 | 3 | 6 | 12 | 20 | 36 |
| provo | 2 | 4 | 8 | 20 | 28 | 48 |
| provo-kompakta | 2 | 4 | 8 | 12 | 20 | 32 |

Abstände außerhalb der Stufen (Runde 3, F):

| Screen | Paar (Elternteil: vorher → nachher) | komuna | ekzemplo | provo | provo-kompakta | Ursache |
|---|---|---|---|---|---|---|
| alle 4 | `fm-sxelo`: `fm-navigado[nav]` → Hauptinhalt (y) | 16 ✓ | 12 ✓ | **16** | **16** | A |
| konto | `fm-pagxo`: `fm-insigno[badges]` → `fm-teksto[subtitle]` (y) | 8 ✓ | **11** | **12** | **8,88** | B |
| konto | `fm-pagxo`: `fm-teksto[subtitle]` → `fm-butono[actions]` (x) | **930,05** | **817,5** | **911,58** | **957,14** | B |
| konto | `fm-pagxo`: `fm-butono[actions]` → `fm-atributlisto` (y) | **36** | 35,5 ✓ | **42** | **31,38** | B |
| konto | `fm-atributlisto`: `span[heading]` → `dl` (y) | **17** | **14** | **21** | 12,25 ✓ | C |

(✓ = zufällig auf einer Stufe, **fett** = außerhalb.)

### Ursache A – Eroj-Fehler in `fm-sxelo` (belegt)

Der Rahmen von `fm-sxelo` ist eine Spalte mit `gap: spacing.medium` und den Bereichen `header`, `nav`, `notices` und `main`. Leere Bereiche werden ausgeblendet, **außer Live-Bereichen**: `notices` (`aria-live="polite"`) bleibt absichtlich im Baum, damit eine Meldung gehört wird, sobald sie erscheint. Als 0 px hohes Flex-Element erzeugt er trotzdem zwei Lücken. Zwischen Navigation und Hauptinhalt liegen deshalb **2 × `spacing.medium`**:

- komuna 2 × 8 = 16 und ekzemplo 2 × 6 = 12 sind zufällig gleich `spacing.large`, also grün.
- provo 2 × 8 = 16 (large = 20) und provo-kompakta 2 × 8 = 16 (large = 12) liegen auf keiner Stufe, also rot.

Gewollt ist laut Modelo genau eine Lücke `spacing.medium`. Diese liegt in jeder Marke auf einer Stufe. Der Fehler ist seit Spec 038 sichtbar (F-S038-22-5: „Abstand der Shell nicht auf einer Stufe“, damals als „mangels Mittel“ nicht gezählt). Seit Spec 046 dem Modelo Abstandsmittel gegeben hat, zählt er.

### Ursache B – K8 misst Light-DOM-Nachbarn, die im gerenderten Baum keine Geschwister sind (belegt)

K8 (D-103) misst den Abstand zwischen aufeinanderfolgenden sichtbaren Kindern desselben Light-DOM-Elternteils. Ein Sxablono wie `fm-pagxo` verteilt diese Kinder aber über Slots auf verschiedene Bereiche: Titel und Insignien in eine Zeile, Untertitel darunter, Aktionen rechts mit `space-between`, Inhalt in `sections`. Gemessen wird deshalb:

- **badges → subtitle:** die Lücke `lead` plus die halbe Höhendifferenz zwischen Titel und Insignie (Zentrierung),
- **subtitle → actions:** der mit `space-between` verteilte Freiraum (818–957 px),
- **actions → atributlisto:** die Lücke des Rahmens plus der Rest der Kopfzeilenhöhe neben dem Button.

Keiner dieser Werte ist ein gesetzter Abstand. Jeder gesetzte Abstand in `fm-pagxo` ist ein Token aus `spacing.*` und liegt damit auf einer Stufe. K8 misst hier also das Falsche. Das ist kein „zu streng“ im Sinne einer Toleranz, sondern ein falsches Paar.

### Rest C – Überschrift in `fm-atributlisto` (offen, nur Befund, nicht im Bau)

Zwischen `span[slot=heading]` und `<dl>` liegt `spacing.large` plus 0,25 bis 2 px (je nach Schrift). Aus den gespeicherten Fakten lässt sich nicht entscheiden, woher das kommt: aus dem Ero (Überschrift als Inline-Kasten, Rand, Typografie-Abstand) oder aus der Messung (Kasten eines Inline-Elements statt seines Zeilenkastens). Laut Freigabe wird C in dieser Spec nicht gebaut. Der Bericht hält die Werte je Marke und die beiden Erklärungen fest, als Grundlage für eine Folge-Spec.

### Antworten auf die Leitfragen

1. **Wo liegt die Ursache?** Weder beim Agenten noch an der Gvidanto-Antwort, am Kurzprofil oder an den Layout-Eroj: Das Markup enthält keinen eigenen Abstand. Ursache A ist ein Eroj-Fehler (Projektion leerer Live-Bereiche). Ursache B ist ein Messfehler in K8: Die Paarbildung ist falsch, nicht die Schwelle. Rest C ist offen zwischen Ero und Messung.
2. **Warum provo/provo-kompakta überall, komuna/ekzemplo nur auf `konto`?** Jeder Screen nutzt `fm-sxelo`, deshalb trifft A überall, wird aber nur in provo und provo-kompakta rot, weil 2 × medium dort keine Stufe ist. `konto` ist der einzige Screen mit Kopfzeilen-Slots von `fm-pagxo` (badges, subtitle, actions) und mit `fm-atributlisto`, deshalb treffen B und C nur dort, und zwar in allen Marken.
3. **Kleinster Fix:** A im Projektor (Modelo-first, eine Regel für alle Sxablonoj mit Live-Bereich), B in der K8-Messung (Flat-Tree statt Light-DOM, mit Jugxo und Kialo). Jeweils mit roten Tests zuerst. C bleibt Befund.
4. **Nachweis ohne Modell:** Die M-1-Daten aus `specs/050-mvp-probelauf/daten/m1/` werden mit dem neuen Stand neu bewertet (siehe „Nachweis“). Dazu kommt ein gerendertes Fixture, das vorher rot und nachher grün ist. Ein sauberer Probelauf wird nur vorbereitet.

## Ziele

- Der erste grüne Screen im MVP-Probelauf, erwartet sind alle 4 Screens der Variante F.
- Es wird nichts gelockert: `AUF_STUFO` (0,5 px, D-08), `k8Plena`, die Grün-Regel und alle Schwellen bleiben unverändert.
- Modelo-first: Der Eroj-Fix entsteht aus der Projektion der Skemo, nicht als Sonderfall in einem Element.

## User Stories

- **US-1 (Maintainer):** Als Maintainer will ich, dass ein Screen ohne eigene Abstände des Agenten in jeder Marke K8 `interspacoj` = 1 erreicht, damit „grün“ misst, was der Agent getan hat, und nicht, was die Eroj falsch machen.
- **US-2 (Brandmanager):** Als Brandmanager will ich, dass zwischen Navigation und Inhalt genau der Abstand meiner Marke liegt (`spacing.medium`), nicht das Doppelte, damit meine Abstandsskala in jeder Shell gilt.
- **US-3 (Nutzer mit Screenreader):** Als Nutzer mit Screenreader will ich, dass Meldungen im Bereich `notices` weiterhin angesagt werden, auch wenn der Bereich beim Laden leer war.
- **US-4 (Maintainer):** Als Maintainer will ich, dass jede Änderung an der Messung als Jugxo mit Kialo festgehalten und gegen Lockerung abgesichert ist, damit K8 nicht still nachgibt.
- **US-5 (Maintainer):** Als Maintainer will ich die Wirkung ohne Modell-Lauf belegen, bevor ich Geld für einen neuen Probelauf freigebe.

## Acceptance Criteria

### Ursache A – leere Live-Bereiche

- **AC-A1:** In `fm-sxelo` mit leerem `notices` ist der Abstand zwischen Navigation und Hauptinhalt in allen 4 Marken × hell/dunkel gleich `spacing.medium` (komuna 8, ekzemplo 6, provo 8, provo-kompakta 8), mit höchstens 0,5 px Abweichung (D-08).
- **AC-A2:** Der leere Live-Bereich bleibt im Accessibility-Baum (nicht `hidden`, nicht `display: none`, `aria-live="polite"` bleibt). Wird er gefüllt, nimmt er Platz ein, und die Abstände Navigation → Meldungen → Inhalt sind je `spacing.medium`.
- **AC-A3:** Die Regel entsteht im Projektor für **jeden** Sxablono-Bereich mit `live` (heute `sxelo.notices` und `filtrilo`). Es gibt keinen Sonderfall nach Name im Element.
- **AC-A4:** Sxablonoj ohne Live-Bereich erzeugen byte-gleichen Code. Sichtbare Änderungen gibt es nur bei Screens mit `fm-sxelo` bzw. `fm-filtrilo` und leerem Live-Bereich: Die Lücke zwischen Navigation und Inhalt schrumpft um ein `spacing.medium`. Betroffene Baseline-Bilder werden namentlich aufgelistet und neu erzeugt (wie Spec 035 AC-10), alle anderen bleiben pixelgleich.

### Ursache B – Messung im gerenderten Baum

- **AC-B1:** Die Paare bleiben dieselben: aufeinanderfolgende sichtbare Light-DOM-Geschwister desselben Elternteils, gleiche Indizes `antaux`/`post`/`gepatro`. Gemessen wird aber der Abstand zwischen den beiden Kästen, die im gerenderten Baum (Flat-Tree) direkte Kinder des **nächsten gemeinsamen Vorfahren** sind und je eines der beiden Elemente enthalten.
- **AC-B2 (`verteilita` nur für Eroj und Sxablonoj):** Ein Paar ist **kein Abstand** (`verteilita`), wenn beides zutrifft:
  1. Der gemeinsame Vorfahre verteilt Freiraum auf der Achse des Paares (Flex/Grid mit `justify-content` bzw. `align-content` = `space-between`, `space-around` oder `space-evenly`).
  2. Dieser Vorfahre gehört zu einem Ero oder einer Sxablono. Er liegt also im Shadow-Root eines `fm-*`-Elements, oder er ist selbst ein `fm-*`-Element ohne eigenes `style`- oder `class`-Attribut des Agenten. Seine Verteilung stammt damit aus der Skemo.

  Kommt die Verteilung aus dem Markup des Agenten (eigenes Element, eigenes `style`, eigene Klasse, eigenes `<style>`), wird das Paar wie bisher als Abstand gemessen und gewertet. Ein `verteilita`-Paar zählt weder als Treffer noch als Fehler. Es wird mit seiner Herkunft (Ero oder Sxablono, mit Namen) festgehalten, und der Kialo-Text von K8 nennt die Zahl („n verteilte Abstände nicht gezählt“). Es fällt nichts still weg.
  Kialo: Sonst könnte ein Agent beliebige Abstände über einen eigenen `space-between`-Container an K8 vorbeischieben. K8 soll den Agenten messen, nicht die Eroj.
- **AC-B3 (keine Lockerung):** Die Gegenproben bleiben rot. Jede ist zuerst rot belegt.
  - (a) Ein Fixture, in dem der Agent zwischen zwei Geschwistern selbst einen Abstand außerhalb der Stufen setzt (`style="margin-block-start: 13px"`), liefert in allen Marken `interspacoj` < 1.
  - (b) Ein Fixture mit dem alten `fm-sxelo`-Fehler (doppelte Lücke, nachgebaut) liefert in provo und provo-kompakta `interspacoj` < 1.
  - (c) Ein Fixture, in dem der Agent einen eigenen Container mit `style="display:flex; justify-content: space-between"` baut, in dem zwei Geschwister mit einem Abstand außerhalb der Stufen landen, liefert in allen 4 Marken `interspacoj` < 1. Kein Paar daraus ist `verteilita`.
  - (d) Wie (c), nur kommt die Verteilung aus einem eigenen `<style>` des Agenten, auch über `::part()` an einem Ero. Auch hier ist `interspacoj` < 1 in allen 4 Marken.
- **AC-B4:** Die Änderung von D-103 steht als Jugxo mit Kialo (Was, Warum, Beleg F-050-13 / Spec 052), bevor der Code sich ändert. Die Jugxo nennt die Ausnahme ausdrücklich nur für Container aus Eroj und Sxablonoj und begründet, warum Agenten-Container ausgeschlossen sind.
- **AC-B5:** Der Browser-Teil in `nordstelo` und sein Zwilling in `ekranoj` bleiben identisch (`zwilling.test.ts` grün). Gespeicherte Fakten ohne die neuen Felder werden wie bisher bewertet: Die Gegenprobe `atendo.json` ändert sich nur, wo sie es mit Kialo darf.

### Rest C – Überschrift in `fm-atributlisto` (nur Befund)

- **AC-C1:** Rest C wird nicht gebaut. Der Bericht nennt die Werte je Marke (aus der Neubewertung), die zwei möglichen Ursachen und den Vorschlag für eine Folge-Spec. An `fm-atributlisto` und an der Messung von Inline-Elementen ändert sich nichts.

### Nachweis ohne Modell-Lauf

Wichtig für die Lesart: Die gespeicherten M-1-Fakten (`fakto.json`) wurden im Browser gemessen, mit den alten Eroj und der alten Paarbildung. A wirkt beim Rendern, B beim Messen. Eine reine Neuberechnung der gespeicherten `fakto.json` mit dem neuen `k8.ts` kann deshalb weder A noch B zeigen. Die Neubewertung hat darum zwei Teile:

- **AC-N1 (Kontrolle, rein rechnerisch):** Die gespeicherten `fakto.json` aus `specs/050-mvp-probelauf/daten/m1/` werden mit der neuen Bewertung (`pruefen.mjs`-Weg) neu berechnet. Ergebnis: **byte-gleiche K8-Werte und dasselbe Urteil (F 0/4).** Das belegt, dass die Bewertung selbst nichts lockert. Fakten ohne `verteilita` werden wie bisher gewertet.
- **AC-N2 (Neubewertung, gerendert):** Die gespeicherten M-1-Fragmente (`fragmento.html` aus `daten/m1/`, 4 F-Screens, dazu die 4 Screens der Variante 0) werden mit dem neuen Build neu gerendert, neu gemessen und mit demselben Weg bewertet, ohne Modell, in 4 Marken × hell/dunkel. Der Bericht nennt, **wie viele der 4 F-Screens danach grün wären.** Erwartet sind 3 von 4 (anmelden, registrieren, passwort-vergessen). `konto` bleibt in komuna, ekzemplo und provo wegen Rest C rot, in provo-kompakta wird es grün.
- **AC-N3 (Fixture vorher rot, nachher grün):** Ein gerendertes Fixture aus dem echten M-1-Markup (`anmelden`, F, R3) ist auf dem Stand vor dem Fix in provo und provo-kompakta rot (`interspacoj` < 1) und nach dem Fix in allen 4 Marken grün. Ein zweites Fixture (`konto` ohne `fm-atributlisto`-Überschrift) zeigt B: vorher rot in allen Marken, nachher grün. Beide laufen als Tests im PR.
- **AC-N4:** Alle neuen Tests sind zuerst rot belegt (Commit „rot“ mit Ausgabe im Build-Log), dann grün. Die bestehenden Suiten von `eroj`, `projekcioj`, `nordstelo` und `ekranoj` sind grün, außer den bekannt fremden Ausfällen: `modelo turbo-inputs` (`ci/turbo-inputs.test.ts:679`), `buehne-036.spec.ts:919` (3.6, Firefox) und `ekranoj rondoj.test.ts:733`. Diese werden im Bericht als fremd ausgewiesen und nicht angefasst.
- **AC-N5:** Der Bericht stellt K8 je Screen × Marke gegenüber: gespeichert (M-1), neu berechnet (AC-N1) und neu gerendert (AC-N2). Er nennt alle `verteilita`-Paare **getrennt nach Herkunft** (Ero bzw. Sxablono, mit Namen, z. B. `fm-pagxo`). Ein `verteilita`-Paar aus Agenten-Markup darf nicht darunter sein. Taucht doch eines auf, ist das ein Fehler, der den PR blockiert. Dazu nennt er jede Veränderung bei Variante 0. Variante 0 nutzt keine Eroj und darf daher kein `verteilita`-Paar haben.
- **AC-N6:** Ein sauberer M-1-Probelauf (Sonnet, komuna, ≈ 3,75 $) wird nur **vorbereitet** (Befehl, Kostenrahmen, Lastbedingung). Er startet in dieser Spec nicht.

### Grenzen

- **AC-G1:** Keine Schwelle, Toleranz, Grenze oder Zeitlimit wird angehoben (`AUF_STUFO`, `k8Plena`, Grün-Regel, Token-Limits, Test-Timeouts).
- **AC-G2:** Es gibt einen PR vom aktuellen `main`. Nichts wird gemergt.
- **AC-G3:** Kein Modell-Lauf. Lokale Builds, Tests und Playwright sind erlaubt.
- **AC-G4:** Am Ende ist der PR offen, die CI wird je Job berichtet, dazu ein kurzer Bericht mit der Neubewertung von M-1. Dann stoppt der Bau.

## Ablauf des Baus

1. **Rebase auf aktuelles `main`** (nach #164 und #165). Die Spec-Nummer wird gegen `origin/main` und offene PRs geprüft. Die M-1-Daten liegen dann unter `specs/050-mvp-probelauf/daten/m1/`.
2. **Jugxo und Kialo** für die Neufassung von D-103 (B), vor dem Code.
3. **Rote Tests:** A (Projektor-Unit-Test und Eroj-Browser-Test), B (K8-Fakten an den Fixtures aus dem M-1-Markup, dazu die Gegenproben). Ausgabe im Build-Log.
4. **Fix A** im Projektor, danach Neubau der Eroj und Baselines nach AC-A4.
5. **Fix B** in `faktoj.ts` und im Zwilling in `ekranoj`, dazu die Bewertung von `verteilita` in `k8.ts`.
6. **Neubewertung M-1:** Kontrolle (AC-N1), neu gerendert (AC-N2), Bericht mit Rest C als Befund.
7. **PR** (einer, nicht mergen), CI je Job, Bericht. Danach stoppt der Bau.

## Erwartung (Vorhersage aus den gespeicherten Fakten)

| Screen | heute (F, R3) | nach A | nach A + B (gebaut) | zusätzlich C (Folge-Spec) |
|---|---|---|---|---|
| anmelden | provo, kompakta rot | grün in allen 4 Marken | grün | grün |
| registrieren | provo, kompakta rot | grün in allen 4 Marken | grün | grün |
| passwort-vergessen | provo, kompakta rot | grün in allen 4 Marken | grün | grün |
| konto | alle 4 Marken rot | alle 4 rot (B, C) | komuna, ekzemplo, provo rot (C); kompakta grün | grün |

„Grün“ bezieht sich hier auf K8 `interspacoj`. Ob ein Screen insgesamt grün ist, entscheidet die gerenderte Neubewertung (AC-N2) mit allen Kriterien. Laut F-050-13 scheitert F heute nur an K8. Erwartet sind 3 von 4 grünen F-Screens.

## Scope

### Enthalten

- Projektor-Regel für leere Live-Bereiche (alle Sxablonoj mit `live`), Neubau der Eroj, betroffene Baselines.
- K8-Messung im Flat-Tree, `verteilita`, Neufassung von D-103 mit Jugxo und Kialo, gleichgezogener Zwilling in `ekranoj`.
- Rest C nur als Befund im Bericht.
- Fixtures aus echtem M-1-Markup, Gegenproben gegen Lockerung.
- Neubewertung M-1 (Kontrolle und gerendert, ohne Modell) mit Bericht und Vorbereitung des sauberen Probelaufs.

### Nicht enthalten

- Fix von Rest C (`fm-atributlisto`-Überschrift), Folge-Spec.
- Jeder Modell-Lauf, auch der saubere Probelauf.
- Änderungen an Gvidanto, Kurzprofil, Layout-Eroj (`fm-vico`, `fm-kolumno`, `fm-stako`, `fm-krado`) oder `list_arangxoj`. Sie sind nicht die Ursache.
- Änderungen an Abstandsstufen, Token-Werten oder Marken.
- Andere K8-Merkmale (`ersatzschrift`, `nativaj`, `sxablono`) und andere Kriterien (K1–K6).
- Spec-050-Werkzeug außerhalb des Repos. Stufe 2 nutzt es nur lesend bzw. als Kopie (siehe technische Spec).

## Edge Cases

- **Live-Bereich füllt sich nach dem Laden:** Eine Meldung erscheint in `notices` und wird angesagt. Der Bereich nimmt jetzt Platz ein, die Abstände sind je `spacing.medium`, der Übergang ist ohne Sprung im Fokus.
- **Live-Bereich leert sich wieder:** Er geht zurück aus dem Fluss und bleibt im Baum. Nichts wird doppelt angesagt.
- **`filtrilo`:** Die gleiche Regel greift. Visuelle Folgen werden in AC-A4 aufgelistet.
- **Sprunglink `fm-saltligilo` im Rahmen:** Wird er beim Fokussieren sichtbar, darf er keine zusätzliche Lücke im Rahmen erzeugen. Das wird im Fixture von A mitgeprüft.
- **Gemeinsamer Vorfahre ist das Light-DOM-Elternteil selbst** (kein Shadow-Root, z. B. `fm-stako` mit geslotteten Kindern im selben Bereich): Das Ergebnis ist identisch zu heute.
- **Gleiches Kasten-Paar für mehrere Light-DOM-Paare:** Es zählt einmal (Deduplizierung über die Flat-Tree-Kästen), damit ein Fehler nicht doppelt gewichtet wird.
- **Agent setzt `style` oder `class` auf ein `fm-*`-Element, das verteilt:** Das zählt als Agenten-Container, das Paar wird gemessen.
- **Agent bringt eigenes `<style>` mit** (auch `::part()`, globale Regeln): Im Zweifel wird gemessen. Enthält das Markup eigene Stilregeln, ist auf diesem Screen kein Paar `verteilita`.
- **Ero-Container innerhalb eines Agenten-Containers:** Entscheidend ist allein der gemeinsame Vorfahre des Paares, nicht seine Vorfahren.
- **Verteilter Freiraum auf der anderen Achse:** `space-between` auf x schützt ein y-Paar nicht. Nur die Achse des Paares zählt.
- **`space-between` mit Mindest-Lücke:** Die Mindest-Lücke (`gap`) ist ein Token des Modelo und wird über die Eroj-Tests geprüft, nicht über K8.
- **Ältere gespeicherte Fakten (Spec 038, Spec 050) ohne die neuen Felder:** Sie werden unverändert bewertet. Ein Vergleich vorher/nachher ist nur über Neu-Rendern möglich.
- **Variante 0 (ohne Fundamento):** Sie nutzt keine Eroj und ist von A nicht betroffen. B kann ihre Werte verändern (andere Paarbildung). Jede Veränderung steht im Bericht (AC-N4).
- **Rendern ist nicht stabil** (Last, Schrift lädt nicht): Stufe 2 bricht ab, statt zu werten. Last wird wie in Spec 050 protokolliert.

## Offene Punkte

- Der genaue Ort der Jugxo (Kialoj-Mechanismus wie in Spec 048/049) wird im ersten Ticket festgelegt.
- Die Spec-Nummer wird beim Start gegen `origin/main` bestimmt (erwartet 052).
- Rest C geht als Befund in eine Folge-Spec.
